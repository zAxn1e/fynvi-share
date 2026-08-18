import { Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ThumbnailModule } from "../thumbnail/thumbnail.module";
import { CleanupWorker } from "./cleanup.worker";
import { LocalStorageProvider } from "./storage/local-storage.provider";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  imports: [PrismaModule, ConfigModule, ThumbnailModule],
  controllers: [UploadController],
  providers: [UploadService, LocalStorageProvider, CleanupWorker],
  exports: [UploadService, LocalStorageProvider, CleanupWorker],
})
export class UploadModule {}
