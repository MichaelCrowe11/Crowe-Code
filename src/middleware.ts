/**
 * Simplified Middleware for CroweCode Platform
 * Works with NextAuth for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/auth', // All NextAuth routes
  '/api/public',
];

// Public pages that don't require authentication
const PUBLIC_PAGES = [
  '/',
  '/login',
  '/register',
  '/auth',
  '/api/auth/callback', // OAuth callback route
  '/about',
  '/pricing',
  '/docs',
  '/forgot-password',
  '/test-dashboard', // Temporary test page
];

/**
 * Apply security headers
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Core security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS in production only
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Handle OPTIONS requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  // Check if this is a public route
  const isPublicAPI = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
  const isPublicPage = PUBLIC_PAGES.some(route => pathname === route || pathname.startsWith(route + '/'));

  // Allow public routes
  if (isPublicAPI || isPublicPage) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // For protected routes, check NextAuth session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Log for debugging (remove in production)
  if (pathname === '/dashboard' && !token) {
    console.log('No token found for dashboard access');
  }

  // Handle API routes
  if (pathname.startsWith('/api')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
          message: 'Please sign in to access this resource'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Add user context to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.sub || '');
    requestHeaders.set('x-user-email', token.email || '');

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return applySecurityHeaders(response);
  }

  // Handle protected pages
  if (!token) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};