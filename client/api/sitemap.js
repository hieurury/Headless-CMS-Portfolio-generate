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
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from backend: ${response.statusText}`);
    }
    
    const xml = await response.text();
    
    // Set caching headers so Vercel caches it at Edge for 1 day
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
}
