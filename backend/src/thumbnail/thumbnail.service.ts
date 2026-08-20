import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
} from "@nestjs/common";
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";
import * as _sharp from "sharp";
const sharp = (_sharp as any).default || _sharp;
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "src/config/config.service";
import { SHARE_DIRECTORY } from "../constants";
import { Readable } from "stream";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { S3FileService } from "src/file/s3.service";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "jpe",
  "jfif",
  "png",
  "webp",
  "gif",
  "svg",
  "svgz",
  "bmp",
  "tiff",
  "tif",
  "avif",
  "heic",
  "heif",
  "ico",
  "icns",
  "cur",
]);

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "mkv",
  "avi",
  "wmv",
  "m4v",
  "flv",
  "ogv",
  "3gp",
  "3g2",
  "ts",
  "m2ts",
  "mts",
  "vob",
  "rm",
  "rmvb",
  "divx",
  "f4v",
]);

interface ThumbnailJob {
  shareId: string;
  fileId: string;
  fileName: string;
  storageProvider?: string;
}

/** Delay between launching consecutive workers to spread CPU load */
const WORKER_STAGGER_MS = 150;

@Injectable()
export class ThumbnailService implements OnModuleInit {
  private readonly logger = new Logger(ThumbnailService.name);
  private hasFfmpeg = false;
  private queue: ThumbnailJob[] = [];
  private activeWorkers = 0;
  private readonly cpuCount = os.cpus().length;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => S3FileService))
    private readonly s3FileService: S3FileService,
  ) {}

  async onModuleInit() {
    this.hasFfmpeg = await this.checkFfmpegAvailable();
    this.logger.log(
      `ThumbnailService initialized. FFmpeg: ${this.hasFfmpeg}, CPUs: ${this.cpuCount}`,
    );
  }

  private checkFfmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const proc = spawn("ffmpeg", ["-version"]);
        proc.on("error", () => resolve(false));
        proc.on("close", (code) => resolve(code === 0));
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Adaptive concurrency based on real-time system load.
   * - High load  (>70% CPU): 1 worker  — stay out of the way during uploads
   * - Medium     (>40% CPU): 2 workers — balanced
   * - Low load   (≤40% CPU): up to min(cpuCount-1, 4) — drain queue fast when idle
   */
  private getMaxConcurrency(): number {
    const loadAvg = os.loadavg()[0]; // 1-minute average
    const loadRatio = loadAvg / this.cpuCount;

    if (loadRatio > 0.7) return 1;
    if (loadRatio > 0.4) return 2;
    return Math.max(2, Math.min(this.cpuCount - 1, 4));
  }

  /**
   * Queue all files in a share for background thumbnail generation
   */
  async queueShareThumbnails(shareId: string) {
    try {
      const share = await this.prisma.share.findUnique({
        where: { id: shareId },
        include: { files: true },
      });

      if (!share || !share.files || share.files.length === 0) return;

      for (const file of share.files) {
        if (this.isMediaFile(file.name)) {
          this.enqueue({
            shareId,
            fileId: file.id,
            fileName: file.name,
            storageProvider: share.storageProvider,
          });
        }
      }
    } catch (err: any) {
      this.logger.error(
        `Failed to queue thumbnails for share ${shareId}: ${err?.message || err}`,
      );
    }
  }

  /**
   * Queue single file for thumbnail generation
   */
  queueFileThumbnail(
    shareId: string,
    fileId: string,
    fileName: string,
    storageProvider?: string,
  ) {
    if (this.isMediaFile(fileName)) {
      this.enqueue({
        shareId,
        fileId,
        fileName,
        storageProvider,
      });
    }
  }

  private isMediaFile(fileName: string): boolean {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
  }

  private enqueue(job: ThumbnailJob) {
    // Avoid duplicate jobs in queue
    const exists = this.queue.some(
      (j) => j.shareId === job.shareId && j.fileId === job.fileId,
    );
    if (!exists) {
      this.queue.push(job);
      this.processQueue();
    }
  }

  private async processQueue() {
    const maxConcurrency = this.getMaxConcurrency();

    while (this.activeWorkers < maxConcurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      this.activeWorkers++;
      this.processJob(job)
        .catch((err) => {
          this.logger.warn(
            `Thumbnail job failed for ${job.fileName} (${job.fileId}): ${err?.message || err}`,
          );
        })
        .finally(() => {
          this.activeWorkers--;
          this.processQueue();
        });

      // Stagger worker launches to avoid burst CPU spikes
      if (this.queue.length > 0 && this.activeWorkers < maxConcurrency) {
        await new Promise((r) => setTimeout(r, WORKER_STAGGER_MS));
      }
    }
  }

  private async processJob(job: ThumbnailJob): Promise<void> {
    const { shareId, fileId, fileName, storageProvider } = job;

    // Verify share and file still exist in database (not deleted by ClamAV or user)
    const fileRecord = await this.prisma.file.findUnique({
      where: { id: fileId },
    });
    if (!fileRecord) return;

    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const isVideo = VIDEO_EXTENSIONS.has(ext);
    const isImage = IMAGE_EXTENSIONS.has(ext);

    if (!isVideo && !isImage) return;

    const effectiveProvider =
      storageProvider ||
      (
        await this.prisma.share.findUnique({
          where: { id: shareId },
          select: { storageProvider: true },
        })
      )?.storageProvider;

    if (effectiveProvider === "S3") {
      await this.generateS3Thumbnail(
        shareId,
        fileId,
        fileName,
        isImage,
        isVideo,
      );
    } else {
      await this.generateLocalThumbnail(
        shareId,
        fileId,
        fileName,
        isImage,
        isVideo,
      );
    }
  }

  private async generateLocalThumbnail(
    shareId: string,
    fileId: string,
    fileName: string,
    isImage: boolean,
    isVideo: boolean,
  ): Promise<void> {
    const sourcePath = path.resolve(SHARE_DIRECTORY, shareId, fileId);
    const thumbDir = path.resolve(SHARE_DIRECTORY, shareId, "thumbnails");
    const targetThumbPath = path.resolve(thumbDir, `${fileId}.webp`);

    if (!fs.existsSync(sourcePath)) {
      this.logger.warn(
        `Thumbnail skipped: source file not found at ${sourcePath} for ${fileId}`,
      );
      return;
    }
    if (fs.existsSync(targetThumbPath)) return;

    await fsPromises.mkdir(thumbDir, { recursive: true });

    if (isImage) {
      try {
        await sharp(sourcePath, { failOn: "none" })
          .rotate() // Auto-rotate with EXIF
          .resize(400, 400, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80, effort: 3 })
          .toFile(targetThumbPath);
        this.logger.log(
          `Thumbnail generated for image ${fileId} (${fileName})`,
        );
      } catch (err: any) {
        this.logger.warn(
          `Sharp failed to generate image thumbnail for ${fileId}: ${err?.message}`,
        );
      }
    } else if (isVideo && this.hasFfmpeg) {
      await this.extractVideoFrameFfmpeg(sourcePath, targetThumbPath);
      if (fs.existsSync(targetThumbPath)) {
        this.logger.log(
          `Thumbnail generated for video ${fileId} (${fileName})`,
        );
      }
    } else if (isVideo && !this.hasFfmpeg) {
      this.logger.warn(
        `Thumbnail skipped for video ${fileId}: FFmpeg not available`,
      );
    }
  }

  private async generateS3Thumbnail(
    shareId: string,
    fileId: string,
    fileName: string,
    isImage: boolean,
    isVideo: boolean,
  ): Promise<void> {
    const s3Instance = this.s3FileService.getS3Instance();
    const bucketName = this.config.get("s3.bucketName");
    const s3Path = this.s3FileService.getS3Path();
    const s3ThumbKey = `${s3Path}${shareId}/thumbnails/${fileId}.webp`;

    // Check if thumbnail already exists on S3
    try {
      await s3Instance.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: s3ThumbKey,
        }),
      );
      return; // Already exists
    } catch {
      // Doesn't exist, proceed
    }

    // Download original file stream to temp file
    const tmpDir = path.join(SHARE_DIRECTORY, "tmp", shareId);
    const tmpSourcePath = path.join(tmpDir, fileId);
    const tmpThumbPath = path.join(tmpDir, `${fileId}.thumb.webp`);

    await fsPromises.mkdir(tmpDir, { recursive: true });

    try {
      const getObjResponse = await s3Instance.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: `${s3Path}${shareId}/${fileName}`,
        }),
      );

      if (!(getObjResponse.Body instanceof Readable)) return;

      await new Promise<void>((resolve, reject) => {
        const ws = fs.createWriteStream(tmpSourcePath);
        (getObjResponse.Body as Readable).pipe(ws);
        ws.on("finish", resolve);
        ws.on("error", reject);
      });

      if (isImage) {
        await sharp(tmpSourcePath, { failOn: "none" })
          .rotate()
          .resize(400, 400, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80, effort: 3 })
          .toFile(tmpThumbPath);
      } else if (isVideo && this.hasFfmpeg) {
        await this.extractVideoFrameFfmpeg(tmpSourcePath, tmpThumbPath);
      }

      if (fs.existsSync(tmpThumbPath)) {
        const thumbBuffer = await fsPromises.readFile(tmpThumbPath);
        await s3Instance.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: s3ThumbKey,
            Body: thumbBuffer,
            ContentType: "image/webp",
          }),
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `S3 thumbnail generation failed for ${fileId}: ${err?.message}`,
      );
    } finally {
      // Clean up tmp files
      try {
        if (fs.existsSync(tmpSourcePath))
          await fsPromises.unlink(tmpSourcePath);
        if (fs.existsSync(tmpThumbPath)) await fsPromises.unlink(tmpThumbPath);
      } catch {
        // ignore
      }
    }
  }

  private extractVideoFrameFfmpeg(
    videoPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve) => {
      const tmpJpg = `${outputPath}.jpg`;
      const args = [
        "-ss",
        "00:00:01",
        "-i",
        videoPath,
        "-vframes",
        "1",
        "-vf",
        "scale=min(400\\,iw):-2",
        "-q:v",
        "3",
        "-y",
        tmpJpg,
      ];

      const proc = spawn("ffmpeg", args);

      proc.on("close", async (code) => {
        if (code === 0 && fs.existsSync(tmpJpg)) {
          try {
            await sharp(tmpJpg).webp({ quality: 80 }).toFile(outputPath);
            await fsPromises.unlink(tmpJpg);
            resolve();
          } catch {
            resolve();
          }
        } else {
          // Fallback: try frame at 00:00:00 in case video is < 1 sec
          const fallbackArgs = [
            "-ss",
            "00:00:00",
            "-i",
            videoPath,
            "-vframes",
            "1",
            "-vf",
            "scale=min(400\\,iw):-2",
            "-q:v",
            "3",
            "-y",
            tmpJpg,
          ];
          const fallbackProc = spawn("ffmpeg", fallbackArgs);
          fallbackProc.on("close", async (fallbackCode) => {
            if (fallbackCode === 0 && fs.existsSync(tmpJpg)) {
              try {
                await sharp(tmpJpg).webp({ quality: 80 }).toFile(outputPath);
                await fsPromises.unlink(tmpJpg);
              } catch {
                // ignore
              }
            }
            resolve();
          });
          fallbackProc.on("error", () => resolve());
        }
      });

      proc.on("error", () => {
        resolve();
      });
    });
  }

  /**
   * Get thumbnail stream or buffer for a file, generating on-demand if not yet cached
   */
  async getThumbnailStream(
    shareId: string,
    fileId: string,
  ): Promise<Readable | null> {
    const share = await this.prisma.share.findUnique({
      where: { id: shareId },
    });
    if (!share) return null;

    const fileRecord = await this.prisma.file.findUnique({
      where: { id: fileId },
    });
    if (!fileRecord) return null;

    const ext = fileRecord.name.split(".").pop()?.toLowerCase() || "";
    const isVideo =
      VIDEO_EXTENSIONS.has(ext) || fileRecord.mimeType?.startsWith("video/");
    const isImage =
      IMAGE_EXTENSIONS.has(ext) || fileRecord.mimeType?.startsWith("image/");

    if (!isVideo && !isImage) return null;

    if (share.storageProvider === "S3") {
      const s3Instance = this.s3FileService.getS3Instance();
      const bucketName = this.config.get("s3.bucketName");
      const s3Path = this.s3FileService.getS3Path();
      const s3ThumbKey = `${s3Path}${shareId}/thumbnails/${fileId}.webp`;

      try {
        const res = await s3Instance.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: s3ThumbKey,
          }),
        );
        if (res.Body instanceof Readable) {
          return res.Body;
        }
      } catch {
        // Thumbnail doesn't exist on S3 yet, attempt on-demand generation
        await this.generateS3Thumbnail(
          shareId,
          fileId,
          fileRecord.name,
          Boolean(isImage),
          Boolean(isVideo),
        );

        try {
          const res = await s3Instance.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: s3ThumbKey,
            }),
          );
          if (res.Body instanceof Readable) {
            return res.Body;
          }
        } catch {
          return null;
        }
      }
      return null;
    }

    const localThumbPath = path.resolve(
      SHARE_DIRECTORY,
      shareId,
      "thumbnails",
      `${fileId}.webp`,
    );

    if (fs.existsSync(localThumbPath)) {
      return fs.createReadStream(localThumbPath);
    }

    // Thumbnail doesn't exist locally yet, generate on-demand immediately
    this.logger.log(
      `On-demand thumbnail generation for ${fileId} (${fileRecord.name})`,
    );
    await this.generateLocalThumbnail(
      shareId,
      fileId,
      fileRecord.name,
      Boolean(isImage),
      Boolean(isVideo),
    );

    if (fs.existsSync(localThumbPath)) {
      return fs.createReadStream(localThumbPath);
    }

    this.logger.warn(
      `On-demand thumbnail generation failed for ${fileId} — file not created`,
    );
    return null;
  }

  /**
   * Delete thumbnail when a file is deleted
   */
  async deleteThumbnail(shareId: string, fileId: string): Promise<void> {
    try {
      const share = await this.prisma.share.findUnique({
        where: { id: shareId },
        select: { storageProvider: true },
      });

      if (share?.storageProvider === "S3") {
        const s3Instance = this.s3FileService.getS3Instance();
        const bucketName = this.config.get("s3.bucketName");
        const s3Path = this.s3FileService.getS3Path();
        await s3Instance.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: `${s3Path}${shareId}/thumbnails/${fileId}.webp`,
          }),
        );
      } else {
        const localThumbPath = path.resolve(
          SHARE_DIRECTORY,
          shareId,
          "thumbnails",
          `${fileId}.webp`,
        );
        if (fs.existsSync(localThumbPath)) {
          await fsPromises.unlink(localThumbPath);
        }
      }
    } catch {
      // ignore
    }
  }
}
