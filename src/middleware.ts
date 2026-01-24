import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/interview(.*)",
  "/join(.*)",
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

export default clerkMiddleware(async (auth, req) => {
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
