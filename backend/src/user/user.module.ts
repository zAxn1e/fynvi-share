import { Module } from "@nestjs/common";
import { EmailModule } from "../email/email.module";
import { UserController } from "./user.controller";
import { UserSevice } from "./user.service";

@Module({
  imports: [EmailModule],
  providers: [UserSevice],
  controllers: [UserController],
  exports: [UserSevice],
})
export class UserModule {}
