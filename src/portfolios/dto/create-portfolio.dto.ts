import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsHexColor,
  IsIn,
  IsArray,
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

export class ColorSchemeDto {
  @IsOptional()
  @IsString()
  primary?: string;

  @IsOptional()
  @IsString()
  secondary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accents?: string[];
}

export class PortfolioColorsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  light?: ColorSchemeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  dark?: ColorSchemeDto;
}

export class PortfolioFontsDto {
  @IsOptional()
  @IsString()
  main?: string;
}

export class PageLayoutPaddingDto {
  @IsOptional()
  @IsString()
  top?: string;

  @IsOptional()
  @IsString()
  right?: string;

  @IsOptional()
  @IsString()
  bottom?: string;

  @IsOptional()
  @IsString()
  left?: string;
}

export class PageLayoutSettingsDto {
  @IsOptional()
  @IsIn(['normal', 'fluid', 'custom'])
  type?: 'normal' | 'fluid' | 'custom';

  @IsOptional()
  @ValidateNested()
  @Type(() => PageLayoutPaddingDto)
  padding?: PageLayoutPaddingDto;
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

  /** Page layout / margin settings */
  @IsOptional()
  @ValidateNested()
  @Type(() => PageLayoutSettingsDto)
  pageLayout?: PageLayoutSettingsDto;

  /** Color palettes for light and dark modes */
  @IsOptional()
  @ValidateNested()
  @Type(() => PortfolioColorsDto)
  colors?: PortfolioColorsDto;

  /** Font family settings */
  @IsOptional()
  @ValidateNested()
  @Type(() => PortfolioFontsDto)
  fonts?: PortfolioFontsDto;
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
