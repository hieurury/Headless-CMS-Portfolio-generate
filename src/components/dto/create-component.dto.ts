import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ComponentCategory } from '../schemas/component.schema';

export class CreateComponentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'type must be kebab-case (e.g. "card-grid")',
  })
  type: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(ComponentCategory)
  category?: ComponentCategory;

  @IsOptional()
  @IsObject()
  schema?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  defaultProps?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  version?: string;
}
