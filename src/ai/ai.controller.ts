import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AiHistoryService } from './ai-history.service';
import { GenerateLayoutDto } from './dto/generate-layout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly historyService: AiHistoryService,
  ) {}

  /**
   * POST /api/v1/ai/generate-layout
   *
   * Accepts a natural language prompt and returns a full PageLayout JSON.
   * Supports two routing modes:
   *  - mode: 'fast' (default) — keyword-based routing, 0 Admin LLM hops
   *  - mode: 'think'          — Administrator LLM routes to sub-agents (slower, smarter)
   *
   * Example request:
   * {
   *   "prompt": "Portfolio for a React developer named John with dark theme",
   *   "portfolioId": "abc123",
   *   "mode": "fast"
   * }
   */
  @Post('generate-layout')
  @HttpCode(HttpStatus.OK)
  generateLayout(@Body() dto: GenerateLayoutDto) {
    return this.aiService.generateLayout(dto);
  }

  /**
   * GET /api/v1/ai/history
   *
   * Returns the AI change history for the current session in two formats:
   *  - ?format=json    → array of AiHistoryEntry objects
   *  - ?format=markdown (default) → human-readable markdown tree with layout structure
   *
   * The markdown format shows:
   *  - Timestamp and mode (fast/think)
   *  - The prompt that triggered the change
   *  - Full block tree annotated with block types and IDs
   *
   * History is in-memory only — cleared when server restarts (session ends).
   *
   * Example: GET /api/v1/ai/history?portfolioId=abc123&pageId=page456&format=markdown
   */
  @Get('history')
  @HttpCode(HttpStatus.OK)
  getHistory(
    @Query('portfolioId') portfolioId: string,
    @Query('pageId') pageId?: string,
    @Query('format') format: 'json' | 'markdown' = 'markdown',
  ) {
    if (!portfolioId) {
      return { error: 'portfolioId query param is required' };
    }

    if (format === 'json') {
      return {
        entries: this.historyService.getHistory(portfolioId, pageId),
      };
    }

    return {
      markdown: this.historyService.getMarkdownSummary(portfolioId, pageId),
    };
  }

  /**
   * DELETE /api/v1/ai/history
   *
   * Clears history for a specific portfolio/page (e.g. when user exits editing session).
   *
   * Example: DELETE /api/v1/ai/history?portfolioId=abc123&pageId=page456
   */
  @Delete('history')
  @HttpCode(HttpStatus.OK)
  clearHistory(
    @Query('portfolioId') portfolioId: string,
    @Query('pageId') pageId?: string,
  ) {
    if (!portfolioId) {
      return { error: 'portfolioId query param is required' };
    }
    this.historyService.clear(portfolioId, pageId);
    return { message: 'History cleared successfully' };
  }
}
