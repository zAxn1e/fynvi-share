import { Module, forwardRef } from "@nestjs/common";
import { ThumbnailService } from "./thumbnail.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { ConfigModule } from "src/config/config.module";
import { FileModule } from "src/file/file.module";

@Module({
  imports: [PrismaModule, ConfigModule, forwardRef(() => FileModule)],
  providers: [ThumbnailService],
  exports: [ThumbnailService],
})
export class ThumbnailModule {}
