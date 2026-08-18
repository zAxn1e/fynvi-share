import { Readable } from "stream";

export interface FileChecksumResult {
  size: bigint;
  sha256: string;
}

export interface StorageProvider {
  type: "LOCAL" | "S3";

  /**
   * Initializes buffer directory for a new upload session.
   */
  initSession(sessionId: string): Promise<void>;

  /**
   * Writes an isolated temporary chunk file: chunk_<index>
   */
  writeChunk(
    sessionId: string,
    chunkIndex: number,
    buffer: Buffer,
  ): Promise<number>;

  /**
   * Concatenates all uploaded chunks sequentially into assembled.tmp, calculates SHA-256 and size,
   * then moves assembled file to target finalized share storage path.
   */
  assembleFile(
    sessionId: string,
    targetShareId: string,
    targetFileId: string,
    totalChunks: number,
  ): Promise<FileChecksumResult>;

  /**
   * Deletes temporary upload session directory.
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Reads readable file stream from finalized share storage.
   */
  readFileStream(shareId: string, fileId: string): Promise<Readable>;

  /**
   * Deletes finalized file from share storage.
   */
  deleteFile(shareId: string, fileId: string): Promise<void>;

  /**
   * Deletes entire finalized share directory.
   */
  deleteShareStorage(shareId: string): Promise<void>;

  /**
   * Gets available disk space in bytes for pre-flight reservation checks.
   */
  getPhysicalFreeSpace(): Promise<bigint>;

  /**
   * Gets total physical storage usage in bytes.
   */
  getPhysicalStorageUsage(): Promise<bigint>;
}
