import { Injectable, NotFoundException } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateApiKeyDto) {
    const randomHex = crypto.randomBytes(24).toString("hex");
    const rawKey = `ns_live_${randomHex}`;
    const prefix = `ns_live_${randomHex.substring(0, 8)}`;
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        key: hashedKey,
        prefix,
        userId,
        expiresAt,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      rawKey, // Returned ONLY ONCE at creation
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
    };
  }

  async getByUser(userId: string) {
    return await this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async remove(userId: string, id: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, userId },
    });

    if (!apiKey) {
      throw new NotFoundException("API Key not found");
    }

    await this.prisma.apiKey.delete({ where: { id } });
  }

  generateShareXConfig(appUrl: string, apiKey: string) {
    return {
      Version: "15.0.0",
      Name: "Fynvi Share",
      DestinationType: "ImageUploader, FileUploader",
      RequestMethod: "POST",
      RequestURL: `${appUrl}/api/shares`,
      Headers: {
        "X-Api-Key": apiKey,
      },
      Body: "MultipartFormData",
      FileFormName: "file",
      URL: "{json:files[0].url}",
    };
  }
}
