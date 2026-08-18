import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { createReadStream, createWriteStream } from "fs";
import * as fs from "fs/promises";
import * as path from "path";
import { Readable } from "stream";
import { DATA_DIRECTORY, SHARE_DIRECTORY } from "../../constants";
import { FileChecksumResult, StorageProvider } from "./storage-provider.interface";

export const TEMP_UPLOAD_DIRECTORY = path.join(DATA_DIRECTORY, "temp", "uploads");

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly type = "LOCAL";
  private readonly logger = new Logger(LocalStorageProvider.name);

  async initSession(sessionId: string): Promise<void> {
    const sessionDir = path.join(TEMP_UPLOAD_DIRECTORY, sessionId);
    await fs.mkdir(sessionDir, { recursive: true });
  }

  async writeChunk(
    sessionId: string,
    chunkIndex: number,
    buffer: Buffer,
  ): Promise<number> {
    const chunkPath = path.join(
      TEMP_UPLOAD_DIRECTORY,
      sessionId,
      `chunk_${chunkIndex}`,
    );
    await fs.writeFile(chunkPath, buffer);
    return buffer.byteLength;
  }

  async assembleFile(
    sessionId: string,
    targetShareId: string,
    targetFileId: string,
    totalChunks: number,
  ): Promise<FileChecksumResult> {
    const sessionDir = path.join(TEMP_UPLOAD_DIRECTORY, sessionId);
    const assembledPath = path.join(sessionDir, "assembled.tmp");
    const targetDir = path.join(SHARE_DIRECTORY, targetShareId);
    const targetFilePath = path.join(targetDir, targetFileId);

    const hash = crypto.createHash("sha256");
    let totalBytes = 0n;

    const writeStream = createWriteStream(assembledPath, { flags: "w" });

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(sessionDir, `chunk_${i}`);
      const chunkBuffer = await fs.readFile(chunkPath);
      hash.update(chunkBuffer);
      totalBytes += BigInt(chunkBuffer.byteLength);

      await new Promise<void>((resolve, reject) => {
        const ok = writeStream.write(chunkBuffer);
        if (ok) {
          resolve();
        } else {
          writeStream.once("drain", resolve);
          writeStream.once("error", reject);
        }
      });
    }

    await new Promise<void>((resolve, reject) => {
      writeStream.end((err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const sha256 = hash.digest("hex");

    // Ensure target share directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Atomic move or copy fallback across physical mounts
    try {
      await fs.rename(assembledPath, targetFilePath);
    } catch {
      await fs.copyFile(assembledPath, targetFilePath);
      await fs.unlink(assembledPath);
    }

    // Flush file handle to disk
    try {
      const handle = await fs.open(targetFilePath, "r+");
      await handle.sync();
      await handle.close();
    } catch (e) {
      this.logger.warn(`fsync warning for ${targetFilePath}: ${String(e)}`);
    }

    return { size: totalBytes, sha256 };
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionDir = path.join(TEMP_UPLOAD_DIRECTORY, sessionId);
    await fs.rm(sessionDir, { recursive: true, force: true }).catch(() => {});
  }

  async readFileStream(shareId: string, fileId: string): Promise<Readable> {
    const filePath = path.join(SHARE_DIRECTORY, shareId, fileId);
    return createReadStream(filePath);
  }

  async deleteFile(shareId: string, fileId: string): Promise<void> {
    const filePath = path.join(SHARE_DIRECTORY, shareId, fileId);
    await fs.unlink(filePath).catch(() => {});
  }

  async deleteShareStorage(shareId: string): Promise<void> {
    const shareDir = path.join(SHARE_DIRECTORY, shareId);
    await fs.rm(shareDir, { recursive: true, force: true }).catch(() => {});
  }

  async getPhysicalFreeSpace(): Promise<bigint> {
    try {
      await fs.mkdir(DATA_DIRECTORY, { recursive: true });
      const stat = await fs.statfs(DATA_DIRECTORY);
      return BigInt(stat.bavail) * BigInt(stat.bsize);
    } catch (e) {
      this.logger.error("Failed to fetch statfs for DATA_DIRECTORY", e);
      return 100_000_000_000n; // Default 100GB fallback if statfs fails
    }
  }

  async getPhysicalStorageUsage(): Promise<bigint> {
    try {
      return await this.getDirSize(SHARE_DIRECTORY);
    } catch {
      return 0n;
    }
  }

  private async getDirSize(dirPath: string): Promise<bigint> {
    let total = 0n;
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          total += await this.getDirSize(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          total += BigInt(stats.size);
        }
      }
    } catch {
      return 0n;
    }
    return total;
  }
}
