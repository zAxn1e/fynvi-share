import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as crypto from "crypto";
import { I18nService } from "nestjs-i18n";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"];
    const apiKeyHeader = request.headers["x-api-key"];

    let token = apiKeyHeader as string;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      throw new UnauthorizedException(this.i18n.t("auth.apiKeyRequired"));
    }

    const hashedKey = crypto.createHash("sha256").update(token).digest("hex");

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key: hashedKey },
      include: { user: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException(this.i18n.t("auth.invalidApiKey"));
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException(this.i18n.t("auth.apiKeyExpired"));
    }

    // Async update last used timestamp
    void this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    request.user = apiKey.user;
    return true;
  }
}
