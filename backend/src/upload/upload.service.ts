import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import * as crypto from "crypto";
import { ConfigService } from "../config/config.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUploadSessionDto } from "./dto/create-session.dto";
import { LocalStorageProvider } from "./storage/local-storage.provider";
import { ThumbnailService } from "../thumbnail/thumbnail.service";

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB default
const SAFETY_MARGIN = 500n * 1024n * 1024n; // 500 MB safety margin

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private storageProvider: LocalStorageProvider,
    private thumbnailService: ThumbnailService,
  ) {}

  async createSession(dto: CreateUploadSessionDto) {
    const share = await this.prisma.share.findUnique({
      where: { id: dto.shareId },
      include: { files: true, reverseShare: true, creator: true },
    });

    if (!share) {
      throw new NotFoundException("Share not found");
    }

    if (share.uploadLocked) {
      throw new BadRequestException("Share upload is locked");
    }

    const fileSize = BigInt(dto.fileSize);
    if (fileSize <= 0n) {
      throw new BadRequestException("Invalid file size");
    }

    const chunkSize = DEFAULT_CHUNK_SIZE;
    const totalChunks = Math.ceil(Number(fileSize) / chunkSize);

    // Concurrency-Safe Disk Space Reservation Check
    const activeSessions = await this.prisma.uploadSession.aggregate({
      _sum: { fileSize: true },
      where: {
        status: { in: ["PENDING", "UPLOADING", "PROCESSING"] },
        expiresAt: { gt: new Date() },
      },
    });

    const reservedUploadBytes = activeSessions._sum.fileSize || 0n;
    const physicalFreeSpace = await this.storageProvider.getPhysicalFreeSpace();
    const actualStorageUsage =
      await this.storageProvider.getPhysicalStorageUsage();

    if (
      physicalFreeSpace <
      reservedUploadBytes + actualStorageUsage + fileSize + SAFETY_MARGIN
    ) {
      throw new HttpException(
        "Insufficient storage space reserved for concurrent upload",
        HttpStatus.INSUFFICIENT_STORAGE,
      );
    }

    // Share Size Limit Validation
    const existingShareSize = share.files.reduce(
      (acc, file) => acc + BigInt(file.size || "0"),
      0n,
    );

    let maxLimit = BigInt(this.configService.get("share.maxSize"));
    if (share.reverseShare?.maxShareSize) {
      maxLimit = BigInt(share.reverseShare.maxShareSize);
    } else if (share.creator?.shareSizeLimit) {
      maxLimit = BigInt(share.creator.shareSizeLimit);
    }

    if (existingShareSize + fileSize > maxLimit) {
      throw new HttpException(
        "Upload size exceeds maximum allowed share limit",
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours TTL

    const session = await this.prisma.uploadSession.create({
      data: {
        fileName: dto.fileName,
        fileSize,
        mimeType: dto.mimeType,
        totalChunks,
        chunkSize,
        shareId: dto.shareId,
        folderId: dto.folderId,
        fileHash: dto.fileHash,
        expiresAt,
        status: "PENDING",
        processingStep: "IDLE",
      },
    });

    await this.storageProvider.initSession(session.id);

    return {
      id: session.id,
      fileName: session.fileName,
      fileSize: session.fileSize.toString(),
      chunkSize: session.chunkSize,
      totalChunks: session.totalChunks,
      expiresAt: session.expiresAt,
    };
  }

  async writeChunk(
    sessionId: string,
    chunkIndex: number,
    buffer: Buffer,
    chunkSha256?: string,
  ) {
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
      include: { chunks: true },
    });

    if (!session) {
      throw new NotFoundException("Upload session not found");
    }

    if (!["PENDING", "UPLOADING", "PAUSED"].includes(session.status)) {
      throw new BadRequestException(
        `Cannot upload chunks in ${session.status} status`,
      );
    }

    if (chunkIndex < 0 || chunkIndex >= session.totalChunks) {
      throw new BadRequestException(
        `Invalid chunk index ${chunkIndex}. Total chunks: ${session.totalChunks}`,
      );
    }

    // Integrity Verification
    const computedHash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex");
    if (chunkSha256 && chunkSha256.toLowerCase() !== computedHash) {
      throw new BadRequestException("Chunk SHA-256 hash mismatch");
    }

    // Idempotency & Conflict Check (Decision 1)
    const existingChunk = session.chunks.find(
      (c) => c.chunkIndex === chunkIndex,
    );
    if (existingChunk) {
      if (
        existingChunk.sha256 === computedHash &&
        existingChunk.size === buffer.byteLength
      ) {
        return { status: "ALREADY_RECEIVED", chunkIndex };
      } else {
        // HTTP 409 Conflict - Do NOT silently overwrite
        throw new ConflictException({
          error: "CHUNK_CONFLICT",
          message: `Chunk payload conflict detected for index ${chunkIndex}`,
        });
      }
    }

    // Write chunk to isolated temporary file
    await this.storageProvider.writeChunk(sessionId, chunkIndex, buffer);

    // Save chunk record in DB
    await this.prisma.uploadChunk.create({
      data: {
        uploadSessionId: sessionId,
        chunkIndex,
        size: buffer.byteLength,
        sha256: computedHash,
      },
    });

    // Update session status to UPLOADING
    if (session.status !== "UPLOADING") {
      await this.prisma.uploadSession.update({
        where: { id: sessionId },
        data: { status: "UPLOADING" },
      });
    }

    return { status: "ACCEPTED", chunkIndex };
  }

  async completeUpload(sessionId: string) {
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
      include: { chunks: true, share: true },
    });

    if (!session) {
      throw new NotFoundException("Upload session not found");
    }

    if (session.chunks.length < session.totalChunks) {
      throw new BadRequestException(
        `Upload incomplete. Received ${session.chunks.length}/${session.totalChunks} chunks`,
      );
    }

    const fileId = crypto.randomUUID();

    // Crash-Safe Processing Step Machine (Decision 3)
    await this.prisma.uploadSession.update({
      where: { id: sessionId },
      data: { status: "PROCESSING", processingStep: "ASSEMBLING" },
    });

    // Assemble file & compute checksum
    const { size: assembledSize, sha256: computedFileHash } =
      await this.storageProvider.assembleFile(
        sessionId,
        session.shareId,
        fileId,
        session.totalChunks,
      );

    if (assembledSize !== session.fileSize) {
      await this.prisma.uploadSession.update({
        where: { id: sessionId },
        data: {
          status: "FAILED",
          errorMessage: "Assembled file size mismatch",
        },
      });
      throw new BadRequestException("Assembled file size mismatch");
    }

    if (
      session.fileHash &&
      session.fileHash.toLowerCase() !== computedFileHash
    ) {
      await this.prisma.uploadSession.update({
        where: { id: sessionId },
        data: {
          status: "FAILED",
          errorMessage: "Assembled file SHA-256 hash mismatch",
        },
      });
      throw new BadRequestException("Assembled file SHA-256 hash mismatch");
    }

    await this.prisma.uploadSession.update({
      where: { id: sessionId },
      data: { processingStep: "FINALIZED_ON_DISK" },
    });

    // Transactional DB record creation
    const createdFile = await this.prisma.$transaction(async (tx) => {
      const file = await tx.file.create({
        data: {
          id: fileId,
          name: session.fileName,
          size: assembledSize.toString(),
          mimeType: session.mimeType,
          sha256: computedFileHash,
          shareId: session.shareId,
          folderId: session.folderId,
        },
      });

      await tx.uploadSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          processingStep: "DB_COMMITTED",
        },
      });

      return file;
    });

    // Asynchronous background cleanup of temp session buffer
    void this.storageProvider.deleteSession(sessionId);

    // Asynchronous background thumbnail generation (CPU safe)
    this.thumbnailService.queueFileThumbnail(
      session.shareId,
      createdFile.id,
      session.fileName,
    );

    return {
      id: createdFile.id,
      name: createdFile.name,
      size: createdFile.size,
      mimeType: createdFile.mimeType,
      sha256: createdFile.sha256,
      shareId: createdFile.shareId,
    };
  }

  async getSessionStatus(sessionId: string) {
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
      include: { chunks: { select: { chunkIndex: true } } },
    });

    if (!session) {
      throw new NotFoundException("Upload session not found");
    }

    return {
      id: session.id,
      fileName: session.fileName,
      fileSize: session.fileSize.toString(),
      totalChunks: session.totalChunks,
      chunkSize: session.chunkSize,
      status: session.status,
      processingStep: session.processingStep,
      expiresAt: session.expiresAt,
      receivedChunks: session.chunks
        .map((c) => c.chunkIndex)
        .sort((a, b) => a - b),
    };
  }
}
