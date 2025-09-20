/**
 * NextAuth Middleware for CroweCode Platform
 * This is a separate middleware file that uses NextAuth for authentication
 * To use this, rename it to middleware.ts and update imports
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify-request",
  "/about",
  "/pricing",
  "/docs",
  "/api/health",
];

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Core security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Monaco editor needs unsafe-eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:", // AI APIs and WebSocket
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // Request tracking
  response.headers.set("x-request-id", crypto.randomUUID());
  response.headers.set("x-powered-by", "CroweCode Platform");

  return response;
}

export default withAuth(
  function middleware(req: NextRequest & { nextauth?: any }) {
    const token = req.nextauth?.token;
    const path = req.nextUrl.pathname;

    // Apply security headers to all responses
    const response = NextResponse.next();
    applySecurityHeaders(response);

    // Admin-only routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Manager and Admin routes
    if (path.startsWith("/manage")) {
      if (token?.role !== "ADMIN" && token?.role !== "MANAGER") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Operator, Manager, and Admin routes
    if (path.startsWith("/operations")) {
      if (
        token?.role !== "ADMIN" &&
        token?.role !== "MANAGER" &&
        token?.role !== "OPERATOR"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Check if route is public
        if (PUBLIC_ROUTES.some((route) => path.startsWith(route))) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  }
);

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt (static files)
     * - public folder
     * - api/auth (NextAuth routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|public|api/auth).*)",
  ],
};