export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, css, js files...
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};

const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'telegrambot',
  'whatsapp',
  'slackbot',
  'discordbot',
  'chatgpt-user',
  'gptbot',
  'claudebot',
  'anthropic-ai',
  'perplexitybot',
  'meta-externalagent',
  'applebot',
  'bingbot',
  'googlebot'
];

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

  if (isBot) {
    // Redirect bot to the prerender API endpoint
    // Passing original path as query param
    const prerenderUrl = new URL('/api/prerender', request.url);
    prerenderUrl.searchParams.set('path', url.pathname);
    return new Response(null, {
      headers: {
        'x-middleware-rewrite': prerenderUrl.toString(),
      },
    });
  }

  // Not a bot, continue normal flow (serve index.html)
  // Let Vercel handle it normally, which will fall back to /index.html via vercel.json rewrites
  return new Response(null, {
    headers: { 'x-middleware-next': '1' }
  });
}
