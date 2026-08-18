import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { FolderController } from "./folder.controller";
import { FolderService } from "./folder.service";

@Module({
  imports: [PrismaModule],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}
