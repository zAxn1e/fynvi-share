import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ClamScanModule } from "../clamscan/clamscan.module";
import { ReverseShareModule } from "../reverseShare/reverseShare.module";
import { SystemModule } from "../system/system.module";
import { ThumbnailModule } from "../thumbnail/thumbnail.module";
import { ShareController } from "./share.controller";
import { ShareService } from "./share.service";

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => ClamScanModule),
    ReverseShareModule,
    forwardRef(() => ThumbnailModule),
    SystemModule,
  ],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
