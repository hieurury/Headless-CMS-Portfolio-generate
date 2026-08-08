import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsObject,
  IsDateString,
  IsBoolean,
  IsNumber,
  MaxLength,
} from 'class-validator';

export enum POST_STATUS {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
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

  // Trích dẫn ngắn hiển thị trên Card / RSS Feed
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  // Thời gian xuất bản - dùng để lên lịch bài viết
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  // Bài viết nổi bật
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Thời gian đọc ước tính (phút) - được tính từ frontend
  @IsOptional()
  @IsNumber()
  readingTime?: number;
}
