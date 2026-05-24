import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';

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
