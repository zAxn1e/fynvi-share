import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import * as contentDisposition from "content-disposition";
import type { Request, Response } from "express";
import { CreateShareGuard } from "src/share/guard/createShare.guard";
import { StrictShareOwnerGuard } from "src/share/guard/strictShareOwner.guard";
import { IdValidation } from "src/share/guard/shareIdValidation.guard";
import { FileService } from "./file.service";
import { FileSecurityGuard } from "./guard/fileSecurity.guard";
import { ThumbnailService } from "src/thumbnail/thumbnail.service";
import * as mime from "mime-types";
import { PrismaService } from "src/prisma/prisma.service";

const VALID_ID_REGEX = /^[a-zA-Z0-9-]*={0,2}$/;

function getValidRecipientId(recipientId?: string): string | undefined {
  if (!recipientId) return undefined;
  return VALID_ID_REGEX.test(recipientId) ? recipientId : undefined;
}

@Controller("shares/:shareId/files")
export class FileController {
  constructor(
    private fileService: FileService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => ThumbnailService))
    private thumbnailService: ThumbnailService,
  ) {}

  @Post()
  @SkipThrottle()
  @UseGuards(IdValidation, CreateShareGuard, StrictShareOwnerGuard)
  async create(
    @Query()
    query: {
      id: string;
      name: string;
      chunkIndex: string;
      totalChunks: string;
    },
    @Body() body: string,
    @Param("shareId") shareId: string,
  ) {
    const { id, name, chunkIndex, totalChunks } = query;

    // Data can be empty if the file is empty
    return await this.fileService.create(
      body,
      { index: parseInt(chunkIndex), total: parseInt(totalChunks) },
      { id, name },
      shareId,
    );
  }

  @Get("zip")
  @UseGuards(FileSecurityGuard)
  async getZip(
    @Res({ passthrough: true }) res: Response,
    @Param("shareId") shareId: string,
    @Query("recipient") recipientId?: string,
  ) {
    const zipStream = await this.fileService.getZip(shareId);

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": contentDisposition(`${shareId}.zip`),
    });

    void this.fileService.notifyRecipientDownload(
      shareId,
      `${shareId}.zip`,
      getValidRecipientId(recipientId),
    );

    return new StreamableFile(zipStream);
  }

  @Get(":fileId/thumbnail")
  @UseGuards(FileSecurityGuard)
  async getThumbnail(
    @Res({ passthrough: true }) res: Response,
    @Param("shareId") shareId: string,
    @Param("fileId") fileId: string,
  ) {
    const stream = await this.thumbnailService.getThumbnailStream(
      shareId,
      fileId,
    );

    if (!stream) {
      throw new NotFoundException("Thumbnail not found");
    }

    res.set({
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=86400, immutable",
      "Content-Disposition": "inline",
      "Content-Security-Policy": "sandbox",
    });

    return new StreamableFile(stream);
  }

  @Get(":fileId")
  @UseGuards(FileSecurityGuard)
  async getFile(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param("shareId") shareId: string,
    @Param("fileId") fileId: string,
    @Query("download") download = "true",
    @Query("recipient") recipientId?: string,
  ) {
    const isDownload = download === "true";
    const rangeHeader = req.headers.range;

    if (!isDownload && rangeHeader) {
      const fileRecord = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!fileRecord) {
        throw new NotFoundException("File not found");
      }

      const totalSize = parseInt(fileRecord.size);
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (
        isNaN(start) ||
        start >= totalSize ||
        (!isNaN(end) && end >= totalSize)
      ) {
        res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE);
        res.set({
          "Content-Range": `bytes */${totalSize}`,
        });
        return;
      }

      const actualEnd = Math.min(end, totalSize - 1);
      const chunkSize = actualEnd - start + 1;

      const file = await this.fileService.get(shareId, fileId, {
        start,
        end: actualEnd,
      });

      res.status(HttpStatus.PARTIAL_CONTENT);
      res.set({
        "Content-Range": `bytes ${start}-${actualEnd}/${totalSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type":
          mime?.lookup?.(file.metaData.name) || "application/octet-stream",
        "Content-Security-Policy": "sandbox",
        "Cache-Control": "private, max-age=300, must-revalidate",
        "Content-Disposition": contentDisposition(file.metaData.name, {
          type: "inline",
        }),
      });

      return new StreamableFile(file.file);
    }

    const file = await this.fileService.get(shareId, fileId);

    const headers: Record<string, string> = {
      "Content-Type":
        mime?.lookup?.(file.metaData.name) || "application/octet-stream",
      "Content-Length": file.metaData.size,
      "Accept-Ranges": "bytes",
      "Content-Security-Policy": "sandbox",
      "Content-Disposition": contentDisposition(
        file.metaData.name,
        isDownload ? undefined : { type: "inline" },
      ),
    };

    // Cache inline previews briefly so navigating back doesn't re-download
    if (!isDownload) {
      headers["Cache-Control"] = "private, max-age=300, must-revalidate";
    }

    res.set(headers);

    if (isDownload) {
      void this.fileService.notifyRecipientDownload(
        shareId,
        file.metaData.name,
        getValidRecipientId(recipientId),
      );
    }

    return new StreamableFile(file.file);
  }

  @Delete(":fileId")
  @SkipThrottle()
  @UseGuards(StrictShareOwnerGuard)
  async remove(
    @Param("fileId") fileId: string,
    @Param("shareId") shareId: string,
  ) {
    await this.fileService.remove(shareId, fileId);
    void this.thumbnailService.deleteThumbnail(shareId, fileId);
  }
}
