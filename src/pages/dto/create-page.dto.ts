import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  MinLength,
  MaxLength,
  ValidateNested,
  IsIn,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class PageColorsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  light?: ColorSchemeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSchemeDto)
  dark?: ColorSchemeDto;
}

export class PageFontsDto {
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

export class PageMetaDto {
  @IsOptional()
  @IsString()
  icon?: string;

  /** Page layout / margin settings */
  @IsOptional()
  @ValidateNested()
  @Type(() => PageLayoutSettingsDto)
  pageLayout?: PageLayoutSettingsDto;

  /** Color palettes for light and dark modes */
  @IsOptional()
  @ValidateNested()
  @Type(() => PageColorsDto)
  colors?: PageColorsDto;

  /** Font family settings */
  @IsOptional()
  @ValidateNested()
  @Type(() => PageFontsDto)
  fonts?: PageFontsDto;
}

export class CreatePageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  /**
   * URL slug, e.g. "/", "/about", "/projects"
   */
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageMetaDto)
  meta?: PageMetaDto;

  /**
   * The JSON layout object.
   * Structure: { sections: [ { id, type, props, children } ] }
   * Each section.type must correspond to a Component Registry entry.
   */
  @IsOptional()
  @IsObject()
  layout?: {
    sections: Array<{
      id: string;
      type: string;
      props: Record<string, unknown>;
      children?: unknown[];
    }>;
  };
}
