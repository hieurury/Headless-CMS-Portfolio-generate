const FRONTEND_URL = 'https://cms.hieurury.id.vn';

export default async function handler(req, res) {
  // Extract path from the query parameter or default to root
  const originalPath = req.query.path || '/';

  // If VITE_API_URL is "https://api.domain.com/api/v1", we append "/public/meta?path=..."
  let backendUrl = process.env.VITE_API_URL;
  if (!backendUrl) {
    // Fallback if not configured
    backendUrl = 'http://localhost:3000/api/v1';
  }

  try {
    // Strip trailing slash just in case
    backendUrl = backendUrl.replace(/\/$/, '');
    const targetUrl = `${backendUrl}/public/meta?path=${encodeURIComponent(originalPath)}`;

    const response = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Failed to fetch from backend: ${response.statusText}`);
    }

    const meta = await response.json();

    // Validate the meta response
    if (!meta || !meta.title) {
      throw new Error('Backend returned invalid meta data');
    }

    // Generate the HTML stub
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:url" content="${meta.url}" />
  <meta property="og:type" content="${meta.type}" />
  <meta property="og:site_name" content="Ruryfo CMS" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="${meta.image}" />
  
  <meta http-equiv="refresh" content="0;url=${meta.url}" />
</head>
<body>
  <script>window.location.replace("${meta.url}");</script>
</body>
</html>`;

    // Set caching headers — cache for 1 hour, stale for 1 day
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error fetching meta data for prerender, serving fallback:', error);
    
    // Serve a generic fallback HTML stub
    const fallbackHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Ruryfo CMS — Nền tảng tạo Portfolio cá nhân</title>
  <meta name="description" content="Xây dựng và chia sẻ portfolio cá nhân một cách tự động, nhanh chóng." />
  <meta property="og:title" content="Ruryfo CMS" />
  <meta property="og:description" content="Headless CMS for Portfolio" />
  <meta property="og:image" content="${FRONTEND_URL}/og-image.png" />
  <meta property="og:url" content="${FRONTEND_URL}${originalPath}" />
  <meta property="og:type" content="website" />
  <meta http-equiv="refresh" content="0;url=${FRONTEND_URL}${originalPath}" />
</head>
<body>
  <script>window.location.replace("${FRONTEND_URL}${originalPath}");</script>
</body>
</html>`;

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(fallbackHtml);
  }
}
