import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';
import { MOBILE_UA_PATTERN } from '@/lib/utils';

// ============ BOT DETECTION ============
const BLOCKED_BOTS = [
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'dotbot',
  'blexbot',
  'searchmetricsbot',
  'sogou',
  'exabot',
  'python-requests',
  'python-urllib',
  'curl/',
  'wget/',
  'scrapy',
  'phantomjs',
  'headlesschrome',
  'selenium',
  'puppeteer',
  'playwright',
];

const ALLOWED_BOTS = ['googlebot', 'bingbot', 'slurp', 'duckduckbot'];

function isMaliciousBot(userAgent: string): boolean {
  if (!userAgent) {
    return true;
  }
  const ua = userAgent.toLowerCase();

  // Allow good bots
  for (const bot of ALLOWED_BOTS) {
    if (ua.includes(bot)) {
      return false;
    }
  }

  // Block bad bots
  for (const bot of BLOCKED_BOTS) {
    if (ua.includes(bot)) {
      return true;
    }
  }

  return false;
}

// ============ RATE LIMITING ============
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });

    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;

  return true;
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// ============ SECURITY HEADERS ============
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.hirinup.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.clerk.accounts.dev https://clerk.hirinup.com https://api.clerk.dev wss://*.clerk.accounts.dev https://*.supabase.co wss://*.supabase.co",
    "worker-src blob: 'self'",
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),
};

// ============ ROUTE MATCHERS ============

// Routes that belong to this app (interviews.foloup.ai)
// Everything else redirects to NEXT_PUBLIC_MAIN_DOMAIN (foloup.com)
const isAppRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/join/:path+',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/signin(.*)',
  '/signup(.*)',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/verification-page(.*)',
  '/verification-response(.*)',
  '/admin(.*)',
  '/not-allowed(.*)',
  '/api(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/signin(.*)',
  '/signup(.*)',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/verification-page(.*)',
  '/verification-response(.*)',
  '/admin/signin(.*)',
  '/admin/signup(.*)',
  '/interview(.*)',
  '/join/:path+',
  '/not-allowed(.*)',
  '/api/register-call(.*)',
  '/api/get-call(.*)',
  '/api/generate-interview-questions(.*)',
  '/api/create-interviewer(.*)',
  '/api/create-response(.*)',
  '/api/analyze-communication(.*)',
  '/api/response-webhook(.*)',
  '/api/check-allowlist(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);

// ============ CLERK HANDLER ============
const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    const authResult = await auth();
    if (!authResult.userId) {
      return authResult.redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

// ============ MAIN PROXY ============
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get('user-agent') || '';
  const clientIP = getClientIP(req);

  // 1. Block malicious bots
  if (isMaliciousBot(userAgent)) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // 2. Block mobile devices from protected routes
  if (MOBILE_UA_PATTERN.test(userAgent) && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/not-allowed', req.url));
  }

  // 3. Rate limiting for API routes (stricter)
  if (isApiRoute(req)) {
    const allowed = checkRateLimit(clientIP, 180, 60000); // 180 req/min for API
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 4. General rate limiting
  const allowed = checkRateLimit(`general:${clientIP}`, 200, 60000); // 200 req/min general
  if (!allowed) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // 5. Redirect non-app routes to landing page
  if (!isAppRoute(req)) {
    const host = req.headers.get('host') || '';
    const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'foloup.com';
    const testLandingDomain = process.env.NEXT_PUBLIC_TEST_LANDING_DOMAIN || 'foloup-landing-page.vercel.app';
    const isTestEnv = host.includes('vercel.app');
    const landingUrl = isTestEnv ? `https://${testLandingDomain}` : `https://${mainDomain}`;
    
    return NextResponse.redirect(landingUrl);
  }

  // 6. Let Clerk handle authentication
  const response = clerkHandler(req, {} as any);

  // 8. Add security headers to all responses
  if (response instanceof NextResponse) {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt)$).*)',
  ],
};
