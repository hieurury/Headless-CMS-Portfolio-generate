import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateLayoutDto } from './dto/generate-layout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/v1/ai/generate-layout
   *
   * Accepts a natural language prompt and returns a full PageLayout JSON.
   * The frontend can save this directly to a page via PATCH /portfolios/:id/pages/:id.
   *
   * Example request:
   * {
   *   "prompt": "Portfolio for a React developer named John with dark theme, include about, skills, projects and contact sections",
   *   "portfolioId": "abc123"
   * }
   */
  @Post('generate-layout')
  @HttpCode(HttpStatus.OK)
  generateLayout(@Body() dto: GenerateLayoutDto) {
    return this.aiService.generateLayout(dto);
  }
}
