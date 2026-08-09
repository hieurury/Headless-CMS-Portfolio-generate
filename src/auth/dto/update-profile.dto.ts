import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  /** Change username — must be unique across all accounts */
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9][a-z0-9_-]{2,29}$/, {
    message: 'Username must start with a letter or digit and contain only a-z, 0-9, - or _',
  })
  username?: string;

  /** Full display name — optional, no uniqueness constraint */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName?: string;

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
