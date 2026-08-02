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
  @Header('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  async getSitemap() {
    const data = await this.publicService.getSitemapData();
    const frontendUrl = (
      process.env.FRONTEND_URL || 'https://cms.hieurury.id.vn'
    ).replace(/\/$/, '');
    const now = new Date().toISOString();

    // Static pages with appropriate priorities
    const staticUrls = [
      {
        loc: `${frontendUrl}/`,
        changefreq: 'weekly',
        priority: '1.0',
        lastmod: now,
      },
      {
        loc: `${frontendUrl}/explore`,
        changefreq: 'daily',
        priority: '0.9',
        lastmod: now,
      },
    ];

    const staticXml = staticUrls
      .map(
        (item) => `
  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
      )
      .join('');

    // Dynamic portfolio/page URLs
    const dynamicXml = data
      .map(
        (item) => `
  <url>
    <loc>${frontendUrl}${item.urlPath}</loc>
    <lastmod>${item.lastmod.toISOString()}</lastmod>
    <changefreq>${item.isPage ? 'weekly' : 'daily'}</changefreq>
    <priority>${item.isPage ? '0.7' : '0.8'}</priority>
  </url>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${staticXml}${dynamicXml}
</urlset>`;
  }

  /**
   * GET /api/v1/public/robots.txt
   * Generates a robots.txt file allowing all bots and pointing to the sitemap.
   */
  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  getRobotsTxt() {
    const frontendUrl = (
      process.env.FRONTEND_URL || 'https://cms.hieurury.id.vn'
    ).replace(/\/$/, '');
    return `User-agent: *
Allow: /

# Disallow private/admin routes
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /preview/
Disallow: /login
Disallow: /register

# Allow public portfolio pages
Allow: /p/
Allow: /explore

Sitemap: ${frontendUrl}/sitemap.xml
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

  /**
   * GET /api/v1/public/:portfolioSlug/posts/:postSlug
   * Returns public post data + portfolio meta.
   */
  @Get(':portfolioSlug/posts/:postSlug')
  findPost(
    @Param('portfolioSlug') portfolioSlug: string,
    @Param('postSlug') postSlug: string,
  ) {
    return this.publicService.findPublicPost(portfolioSlug, postSlug);
  }
}
