import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsHexColor,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SeoMetaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString({ each: true })
  keywords?: string[];
}

export class AioMetaDto {
  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString({ each: true })
  socialLinks?: string[];
}

export class PortfolioMetaDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetaDto)
  seo?: SeoMetaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AioMetaDto)
  aio?: AioMetaDto;
}

export class CreatePortfolioDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be kebab-case (lowercase letters, numbers, hyphens)',
  })
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PortfolioMetaDto)
  meta?: PortfolioMetaDto;
}
