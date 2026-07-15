import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';

export enum POST_STATUS {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  postTypeId: string;

  @IsOptional()
  @IsObject()
  customFieldsData?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(POST_STATUS)
  status?: POST_STATUS;
}
