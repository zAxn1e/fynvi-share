import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { Request } from "express";
import { GetUser } from "../auth/decorator/getUser.decorator";
import { JwtGuard } from "../auth/guard/jwt.guard";
import { ApiKeyService } from "./api-key.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";

@Controller("api-keys")
@UseGuards(JwtGuard)
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post()
  async create(@GetUser() user: User, @Body() dto: CreateApiKeyDto) {
    return await this.apiKeyService.create(user.id, dto);
  }

  @Get()
  async getByUser(@GetUser() user: User) {
    return await this.apiKeyService.getByUser(user.id);
  }

  @Delete(":id")
  async remove(@GetUser() user: User, @Param("id") id: string) {
    await this.apiKeyService.remove(user.id, id);
  }

  @Get("sharex")
  async getShareXConfig(@Req() req: Request) {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const appUrl = `${protocol}://${host}`;

    return this.apiKeyService.generateShareXConfig(appUrl, "YOUR_FYNVI_API_KEY");
  }
}
