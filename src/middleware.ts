import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

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

const clerkHandler = clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication - return early, don't call auth()
  if (isPublicRoute(req)) {
    return;
  }

  // For protected routes, check authentication
  if (isProtectedRoute(req)) {
    const authResult = await auth();
    if (!authResult.userId) {
      return authResult.redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  // For other routes that aren't public or protected, allow through
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect root to /home BEFORE Clerk processes
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Let Clerk handle everything else
  return clerkHandler(req, {} as any);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - join routes (excluded to avoid headers() Promise issues in Next.js 16)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|join/).*)",
  ],
};
