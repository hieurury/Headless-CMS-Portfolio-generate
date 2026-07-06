const FRONTEND_URL = 'https://cms.hieurury.id.vn';

// Static fallback sitemap with at minimum the key public pages
function buildFallbackSitemap() {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${FRONTEND_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${FRONTEND_URL}/explore</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
}

export default async function handler(req, res) {
  // If VITE_API_URL is "https://api.domain.com/api/v1", we append "/public/sitemap.xml"
  let backendUrl = process.env.VITE_API_URL;
  if (!backendUrl) {
    // Fallback if not configured
    backendUrl = 'http://localhost:3000/api/v1';
  }

  try {
    // Strip trailing slash just in case
    backendUrl = backendUrl.replace(/\/$/, '');
    const targetUrl = `${backendUrl}/public/sitemap.xml`;

    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      throw new Error(`Failed to fetch from backend: ${response.statusText}`);
    }

    const xml = await response.text();

    // Validate the XML has content beyond just the urlset wrapper
    if (!xml || xml.trim().length < 50) {
      throw new Error('Backend returned empty sitemap');
    }

    // Set caching headers — 1 hour for freshness, 1 day stale
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error fetching sitemap, serving fallback:', error);
    // Serve a minimal but valid sitemap so Google doesn't get a 500
    res.setHeader('Cache-Control', 's-maxage=1800');
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(buildFallbackSitemap());
  }
}
