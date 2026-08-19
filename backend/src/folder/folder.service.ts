import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFolderDto) {
    const share = await this.prisma.share.findUnique({
      where: { id: dto.shareId },
    });

    if (!share) {
      throw new NotFoundException("Share not found");
    }

    if (dto.parentId) {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: dto.parentId },
      });
      if (!parentFolder || parentFolder.shareId !== dto.shareId) {
        throw new BadRequestException("Parent folder not found in this share");
      }
    }

    const existingFolder = await this.prisma.folder.findFirst({
      where: {
        shareId: dto.shareId,
        parentId: dto.parentId || null,
        name: dto.name,
      },
    });

    if (existingFolder) {
      throw new BadRequestException(
        "Folder with this name already exists in target directory",
      );
    }

    return await this.prisma.folder.create({
      data: {
        name: dto.name,
        shareId: dto.shareId,
        parentId: dto.parentId || null,
      },
      include: {
        children: true,
        files: true,
      },
    });
  }

  async getFoldersByShare(shareId: string) {
    return await this.prisma.folder.findMany({
      where: { shareId },
      include: {
        children: true,
        files: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async update(id: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    const conflict = await this.prisma.folder.findFirst({
      where: {
        shareId: folder.shareId,
        parentId: folder.parentId,
        name: dto.name,
        id: { not: id },
      },
    });

    if (conflict) {
      throw new BadRequestException(
        "Another folder with this name already exists",
      );
    }

    return await this.prisma.folder.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string) {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder) {
      throw new NotFoundException("Folder not found");
    }

    await this.prisma.folder.delete({ where: { id } });
  }
}
