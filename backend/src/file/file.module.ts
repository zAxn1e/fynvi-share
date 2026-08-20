import { Global, Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ReverseShareModule } from "../reverseShare/reverseShare.module";
import { ShareModule } from "../share/share.module";
import { ThumbnailModule } from "../thumbnail/thumbnail.module";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";
import { LocalFileService } from "./local.service";
import { S3FileService } from "./s3.service";

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => ReverseShareModule),
    forwardRef(() => ShareModule),
    forwardRef(() => ThumbnailModule),
  ],
  controllers: [FileController],
  providers: [FileService, LocalFileService, S3FileService],
  exports: [FileService, LocalFileService, S3FileService],
})
export class FileModule {}
