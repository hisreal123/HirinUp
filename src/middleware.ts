import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// ============ BOT DETECTION ============
const BLOCKED_BOTS = [
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "blexbot",
  "searchmetricsbot",
  "sogou",
  "exabot",
  "python-requests",
  "python-urllib",
  "curl/",
  "wget/",
  "scrapy",
  "phantomjs",
  "headlesschrome",
  "selenium",
  "puppeteer",
  "playwright",
];

const ALLOWED_BOTS = ["googlebot", "bingbot", "slurp", "duckduckbot"];

function isMaliciousBot(userAgent: string): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();

  // Allow good bots
  for (const bot of ALLOWED_BOTS) {
    if (ua.includes(bot)) return false;
  }

  // Block bad bots
  for (const bot of BLOCKED_BOTS) {
    if (ua.includes(bot)) return true;
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
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// ============ SECURITY HEADERS ============
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://clerk.hirinup.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.clerk.accounts.dev https://clerk.hirinup.com https://api.clerk.dev wss://*.clerk.accounts.dev",
    "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
};

// ============ ROUTE MATCHERS ============
const isPublicRoute = createRouteMatcher([
  "/",
  "/home(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/signin(.*)",
  "/signup(.*)",
  "/login(.*)",
  "/register(.*)",
  "/forgot-password(.*)",
  "/verification-page(.*)",
  "/admin/signin(.*)",
  "/admin/signup(.*)",
  "/interview(.*)",
  "/join(.*)",
  "/pricing(.*)",
  "/book-a-demo(.*)",
  "/job-tryouts(.*)",
  "/ai-candidate-screening(.*)",
  "/ethical-ai(.*)",
  "/terms-condition(.*)",
  "/privacy-policy(.*)",
  "/api/register-call(.*)",
  "/api/get-call(.*)",
  "/api/generate-interview-questions(.*)",
  "/api/create-interviewer(.*)",
  "/api/create-response(.*)",
  "/api/analyze-communication(.*)",
  "/api/response-webhook(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/interviews(.*)",
]);

const isApiRoute = createRouteMatcher(["/api/(.*)"]);

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

// ============ MAIN MIDDLEWARE ============
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";
  const clientIP = getClientIP(req);

  // 1. Block malicious bots
  if (isMaliciousBot(userAgent)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  // 2. Rate limiting for API routes (stricter)
  if (isApiRoute(req)) {
    const allowed = checkRateLimit(clientIP, 60, 60000); // 60 req/min for API
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 3. General rate limiting
  const allowed = checkRateLimit(`general:${clientIP}`, 200, 60000); // 200 req/min general
  if (!allowed) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // 4. Redirect root to /home
  if (pathname === "/") {
    const response = NextResponse.redirect(new URL("/home", req.url));
    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // 5. Let Clerk handle authentication
  const response = clerkHandler(req, {} as any);

  // 6. Add security headers to all responses
  if (response instanceof NextResponse) {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt)$|join/).*)",
  ],
};
