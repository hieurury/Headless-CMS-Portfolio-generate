import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PageMetaDto {
  @IsOptional()
  @IsString()
  icon?: string;
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
