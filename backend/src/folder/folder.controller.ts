import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IdValidation } from "../share/guard/shareIdValidation.guard";
import { StrictShareOwnerGuard } from "../share/guard/strictShareOwner.guard";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { FolderService } from "./folder.service";

@Controller("shares/:shareId/folders")
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post()
  @UseGuards(IdValidation, StrictShareOwnerGuard)
  async create(
    @Param("shareId") shareId: string,
    @Body() dto: CreateFolderDto,
  ) {
    dto.shareId = shareId;
    return await this.folderService.create(dto);
  }

  @Get()
  @UseGuards(IdValidation)
  async getFoldersByShare(@Param("shareId") shareId: string) {
    return await this.folderService.getFoldersByShare(shareId);
  }

  @Patch(":id")
  @UseGuards(IdValidation, StrictShareOwnerGuard)
  async update(@Param("id") id: string, @Body() dto: UpdateFolderDto) {
    return await this.folderService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(IdValidation, StrictShareOwnerGuard)
  async remove(@Param("id") id: string) {
    await this.folderService.remove(id);
  }
}
