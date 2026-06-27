import { Controller, Get, Param, Query, Header } from '@nestjs/common';
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
    @Query('excludeOwnerId') excludeOwnerId?: string,
  ) {
    return this.publicService.listAllPublished(
      q,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 12,
      excludeOwnerId,
    );
  }

  /**
   * GET /api/v1/public/sitemap.xml
   * Generates a dynamic XML sitemap of all published portfolios.
   */
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemap() {
    const data = await this.publicService.getSitemapData();
    const frontendUrl = process.env.FRONTEND_URL || 'https://cms.hieurury.id.vn';
    
    const urls = data.map(item => `
  <url>
    <loc>${frontendUrl}${item.urlPath}</loc>
    <lastmod>${item.lastmod.toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
  }

  /**
   * GET /api/v1/public/robots.txt
   * Generates a robots.txt file allowing all bots and pointing to the sitemap.
   */
  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  getRobotsTxt() {
    const frontendUrl = process.env.FRONTEND_URL || 'https://cms.hieurury.id.vn';
    return `User-agent: *
Allow: /

Sitemap: ${frontendUrl}/api/v1/public/sitemap.xml
`;
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
