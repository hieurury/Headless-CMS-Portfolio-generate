export default async function handler(req, res) {
  let backendUrl = process.env.VITE_API_URL;
  if (!backendUrl) {
    backendUrl = 'http://localhost:3000/api/v1';
  }

  try {
    backendUrl = backendUrl.replace(/\/$/, '');
    const targetUrl = `${backendUrl}/public/robots.txt`;
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from backend: ${response.statusText}`);
    }
    
    const txt = await response.text();
    
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(txt);
  } catch (error) {
    console.error('Error fetching robots.txt:', error);
    res.status(200).send('User-agent: *\nAllow: /');
  }
}
