import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  shareId: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
