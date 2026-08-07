import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsInt()
  @Min(13)
  @Max(120)
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  slogan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
