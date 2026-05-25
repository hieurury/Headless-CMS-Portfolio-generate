import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class GenerateLayoutDto {
  @IsString()
  @MinLength(10, { message: 'Prompt must be at least 10 characters' })
  @MaxLength(2000, { message: 'Prompt must be at most 2000 characters' })
  prompt: string;

  @IsString()
  portfolioId: string;

  @IsOptional()
  @IsString()
  pageId?: string;
}
