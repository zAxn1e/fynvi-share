import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { Request } from "express";
import { CreateUploadSessionDto } from "./dto/create-session.dto";
import { UploadService } from "./upload.service";

@Controller("upload/session")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  async createSession(@Body() dto: CreateUploadSessionDto) {
    return await this.uploadService.createSession(dto);
  }

  @Post(":id/chunk/:chunkIndex")
  @SkipThrottle()
  async writeChunk(
    @Param("id") id: string,
    @Param("chunkIndex") chunkIndex: string,
    @Headers("x-chunk-sha256") xChunkSha256: string,
    @Req() request: Request,
  ) {
    const buffer = Buffer.isBuffer(request.body)
      ? request.body
      : Buffer.from(request.body || "");
    return await this.uploadService.writeChunk(
      id,
      parseInt(chunkIndex, 10),
      buffer,
      xChunkSha256,
    );
  }

  @Post(":id/complete")
  @HttpCode(200)
  @SkipThrottle()
  async completeUpload(@Param("id") id: string) {
    return await this.uploadService.completeUpload(id);
  }

  @Get(":id/status")
  @SkipThrottle()
  async getSessionStatus(@Param("id") id: string) {
    return await this.uploadService.getSessionStatus(id);
  }
}
