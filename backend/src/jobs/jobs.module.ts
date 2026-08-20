import { Module } from "@nestjs/common";
import { ReverseShareModule } from "../reverseShare/reverseShare.module";
import { JobsService } from "./jobs.service";

@Module({
  imports: [ReverseShareModule],
  providers: [JobsService],
})
export class JobsModule {}
