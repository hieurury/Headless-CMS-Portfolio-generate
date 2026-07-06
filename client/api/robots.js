const FRONTEND_URL = 'https://cms.hieurury.id.vn';

// Fallback robots.txt served directly if backend is unreachable
const FALLBACK_ROBOTS = `User-agent: *
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

Sitemap: ${FRONTEND_URL}/sitemap.xml
`;

export default async function handler(req, res) {
  let backendUrl = process.env.VITE_API_URL;
  if (!backendUrl) {
    backendUrl = 'http://localhost:3000/api/v1';
  }

  try {
    backendUrl = backendUrl.replace(/\/$/, '');
    const targetUrl = `${backendUrl}/public/robots.txt`;

    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Failed to fetch from backend: ${response.statusText}`);
    }

    const txt = await response.text();

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(txt);
  } catch (error) {
    console.error('Error fetching robots.txt, serving fallback:', error);
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(FALLBACK_ROBOTS);
  }
}
