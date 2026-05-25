import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';

/**
 * PublicController — no authentication required.
 * All routes are open to the public internet.
 */
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * GET /api/v1/public?q=keyword&page=1&limit=12
   * List all published portfolios with optional search and pagination.
   * Searches: title, description, owner name.
   */
  @Get()
  listAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicService.listAllPublished(
      q,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 12,
    );
  }

  /**
   * GET /api/v1/public/:portfolioSlug
   * Returns portfolio meta + list of published pages (hub page).
   */
  @Get(':portfolioSlug')
  findPortfolio(@Param('portfolioSlug') portfolioSlug: string) {
    return this.publicService.findPublicPortfolio(portfolioSlug);
  }

  /**
   * GET /api/v1/public/:portfolioSlug/:pageSlug
   * Returns the full layout JSON + all page navigation for the renderer.
   */
  @Get(':portfolioSlug/:pageSlug')
  findPage(
    @Param('portfolioSlug') portfolioSlug: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    return this.publicService.findPublicPage(portfolioSlug, pageSlug);
  }
}
