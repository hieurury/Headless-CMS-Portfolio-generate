import { Controller, Get, Param, Query, Header } from '@nestjs/common';
import { PublicService } from './public.service';

/**
 * PublicController — no authentication required.
 * All routes are open to the public internet.
 *
 * URL structure: /:username/:portfolioSlug/...
 * All routes are prefixed with /api/v1/public
 */
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * GET /api/v1/public?q=keyword&page=1&limit=12
   * List all published portfolios with optional search and pagination.
   */
  @Get()
  listAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('excludeUsername') excludeUsername?: string,
    @Query('category') category?: string,
  ) {
    return this.publicService.listAllPublished(
      q,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 12,
      excludeUsername,
      category,
    );
  }

  /**
   * GET /api/v1/public/sitemap.xml
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

    const staticUrls = [
      { loc: `${frontendUrl}/`, changefreq: 'weekly', priority: '1.0', lastmod: now },
      { loc: `${frontendUrl}/explore`, changefreq: 'daily', priority: '0.9', lastmod: now },
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

# Allow public routes (all user profile pages)
Allow: /explore

Sitemap: ${frontendUrl}/sitemap.xml
`;
  }

  /**
   * GET /api/v1/public/meta
   * Used for social bot prerendering.
   */
  @Get('meta')
  async getMetadata(@Query('path') path: string) {
    if (!path) {
      path = '/';
    }
    return this.publicService.getMetadataByPath(path);
  }

  /**
   * GET /api/v1/public/user/:username
   * Returns public profile + list of published portfolios for a user.
   */
  @Get('user/:username')
  getUserProfile(@Param('username') username: string) {
    return this.publicService.getUserPublicProfile(username);
  }

  /**
   * GET /api/v1/public/user/:username/:portfolioSlug
   * Returns portfolio meta + list of published pages (hub page).
   */
  @Get('user/:username/:portfolioSlug')
  findPortfolio(
    @Param('username') username: string,
    @Param('portfolioSlug') portfolioSlug: string,
  ) {
    return this.publicService.findPublicPortfolio(username, portfolioSlug);
  }

  /**
   * GET /api/v1/public/user/:username/:portfolioSlug/post/:postSlug
   * Returns public post data + portfolio meta.
   * NOTE: Must be declared BEFORE the generic /:pageSlug route.
   */
  @Get('user/:username/:portfolioSlug/post/:postSlug')
  findPost(
    @Param('username') username: string,
    @Param('portfolioSlug') portfolioSlug: string,
    @Param('postSlug') postSlug: string,
  ) {
    return this.publicService.findPublicPost(username, portfolioSlug, postSlug);
  }

  /**
   * GET /api/v1/public/user/:username/:portfolioSlug/:pageSlug
   * Returns the full layout JSON + all page navigation for the renderer.
   */
  @Get('user/:username/:portfolioSlug/:pageSlug')
  findPage(
    @Param('username') username: string,
    @Param('portfolioSlug') portfolioSlug: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    return this.publicService.findPublicPage(username, portfolioSlug, pageSlug);
  }
}
