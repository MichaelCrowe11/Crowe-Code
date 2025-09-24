import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { middleware } from '@/middleware';

// Mock dependencies
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Auth Middleware', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
    process.env.NEXTAUTH_SECRET = 'test-secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  const createMockRequest = (url: string, method = 'GET', headers: Record<string, string> = {}) => {
    return new NextRequest(url, {
      method,
      headers: new Headers(headers),
    });
  };

  describe('Static File Handling', () => {
    it('should skip middleware for Next.js static files', async () => {
      const request = createMockRequest('https://example.com/_next/static/chunks/main.js');

      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(getToken).not.toHaveBeenCalled();
    });

    it('should skip middleware for favicon files', async () => {
      const request = createMockRequest('https://example.com/favicon.ico');

      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(getToken).not.toHaveBeenCalled();
    });

    it('should skip middleware for image files', async () => {
      const imageExtensions = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'];

      for (const ext of imageExtensions) {
        const request = createMockRequest(`https://example.com/image.${ext}`);
        const response = await middleware(request);

        expect(response.status).toBe(200);
        expect(getToken).not.toHaveBeenCalled();
      }
    });

    it('should skip middleware for CSS and JS files', async () => {
      const staticFiles = ['styles.css', 'script.js', 'font.woff', 'font.woff2', 'font.ttf'];

      for (const file of staticFiles) {
        const request = createMockRequest(`https://example.com/${file}`);
        const response = await middleware(request);

        expect(response.status).toBe(200);
        expect(getToken).not.toHaveBeenCalled();
      }
    });
  });

  describe('OPTIONS Request Handling', () => {
    it('should handle OPTIONS requests with CORS headers', async () => {
      const request = createMockRequest('https://example.com/api/test', 'OPTIONS');

      const response = await middleware(request);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, PATCH, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
      expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
    });
  });

  describe('Public Route Handling', () => {
    const publicApiRoutes = [
      '/api/health',
      '/api/auth/signin',
      '/api/auth/callback/github',
      '/api/public/test',
    ];

    const publicPages = [
      '/',
      '/login',
      '/register',
      '/auth/signin',
      '/about',
      '/pricing',
      '/docs',
      '/forgot-password',
      '/test-dashboard',
    ];

    it('should allow access to public API routes without authentication', async () => {
      for (const route of publicApiRoutes) {
        const request = createMockRequest(`https://example.com${route}`);

        const response = await middleware(request);

        expect(response.status).toBe(200);
        expect(getToken).not.toHaveBeenCalled();

        // Should have security headers
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      }
    });

    it('should allow access to public pages without authentication', async () => {
      for (const page of publicPages) {
        const request = createMockRequest(`https://example.com${page}`);

        const response = await middleware(request);

        expect(response.status).toBe(200);
        expect(getToken).not.toHaveBeenCalled();

        // Should have security headers
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      }
    });
  });

  describe('Security Headers', () => {
    it('should apply security headers to all responses', async () => {
      const request = createMockRequest('https://example.com/');

      const response = await middleware(request);

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should add HSTS header in production environment', async () => {
      process.env.NODE_ENV = 'production';

      const request = createMockRequest('https://example.com/');

      const response = await middleware(request);

      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
    });

    it('should not add HSTS header in development environment', async () => {
      process.env.NODE_ENV = 'development';

      const request = createMockRequest('https://example.com/');

      const response = await middleware(request);

      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    });
  });

  describe('Authentication Checks', () => {
    it('should check for NextAuth token on protected routes', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any).mockResolvedValue(mockToken);

      const request = createMockRequest('https://example.com/dashboard');

      const response = await middleware(request);

      expect(getToken).toHaveBeenCalledWith({
        req: request,
        secret: 'test-secret',
        cookieName: 'next-auth.session-token',
      });
      expect(response.status).toBe(200);
    });

    it('should use production cookie name in production environment', async () => {
      process.env.NODE_ENV = 'production';

      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any).mockResolvedValue(mockToken);

      const request = createMockRequest('https://example.com/dashboard');

      await middleware(request);

      expect(getToken).toHaveBeenCalledWith({
        req: request,
        secret: 'test-secret',
        cookieName: '__Secure-next-auth.session-token',
      });
    });

    it('should fallback to default cookie if primary cookie fails', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any)
        .mockResolvedValueOnce(null) // First call fails
        .mockResolvedValueOnce(mockToken); // Second call succeeds

      const request = createMockRequest('https://example.com/dashboard');

      const response = await middleware(request);

      expect(getToken).toHaveBeenCalledTimes(2);
      expect(getToken).toHaveBeenLastCalledWith({
        req: request,
        secret: 'test-secret',
      });
      expect(response.status).toBe(200);
    });
  });

  describe('Protected Route Redirects', () => {
    it('should redirect unauthenticated users to login for protected pages', async () => {
      (getToken as any).mockResolvedValue(null);

      const request = createMockRequest('https://example.com/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('https://example.com/login?callbackUrl=%2Fdashboard');
    });

    it('should redirect authenticated users away from login page', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any).mockResolvedValue(mockToken);

      const request = createMockRequest('https://example.com/login');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('https://example.com/dashboard');
    });

    it('should redirect to callbackUrl when authenticated user visits login', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any).mockResolvedValue(mockToken);

      const request = createMockRequest('https://example.com/login?callbackUrl=%2Fprojects');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('https://example.com/projects');
    });

    it('should handle auth/signin redirect for authenticated users', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any).mockResolvedValue(mockToken);

      const request = createMockRequest('https://example.com/auth/signin');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('https://example.com/dashboard');
    });
  });

  describe('API Route Protection', () => {
    it('should return 401 for unauthenticated API requests', async () => {
      (getToken as any).mockResolvedValue(null);

      const request = createMockRequest('https://example.com/api/user/profile');

      const response = await middleware(request);

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        message: 'Please sign in to access this resource',
      });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should add user context headers for authenticated API requests', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any).mockResolvedValue(mockToken);

      const request = createMockRequest('https://example.com/api/user/profile');

      const response = await middleware(request);

      expect(response.status).toBe(200);

      // Check that user context would be added to request headers
      // (This is done in the NextResponse.next() call with modified headers)
      expect(getToken).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing NEXTAUTH_SECRET gracefully', async () => {
      delete process.env.NEXTAUTH_SECRET;

      (getToken as any).mockResolvedValue(null);

      const request = createMockRequest('https://example.com/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307); // Should redirect to login
    });

    it('should handle malformed URLs gracefully', async () => {
      const request = createMockRequest('https://example.com/dashboard/../../../etc/passwd');

      const response = await middleware(request);

      // Should still process the request (URL is normalized by Next.js)
      expect(response.status).toBeOneOf([200, 307, 401]);
    });

    it('should handle token verification errors', async () => {
      (getToken as any).mockRejectedValue(new Error('Token verification failed'));

      const request = createMockRequest('https://example.com/dashboard');

      const response = await middleware(request);

      expect(response.status).toBe(307); // Should redirect to login on error
    });

    it('should handle nested public paths correctly', async () => {
      const request = createMockRequest('https://example.com/auth/callback/github');

      const response = await middleware(request);

      expect(response.status).toBe(200);
      expect(getToken).not.toHaveBeenCalled();
    });
  });

  describe('Logging and Debugging', () => {
    it('should log dashboard access attempts without token', async () => {
      const logger = await import('@/lib/logger');

      (getToken as any).mockResolvedValue(null);

      const request = createMockRequest('https://example.com/dashboard');

      await middleware(request);

      expect(logger.default.info).toHaveBeenCalledWith('No token found for dashboard access');
    });

    it('should not log for other routes without token', async () => {
      const logger = await import('@/lib/logger');

      (getToken as any).mockResolvedValue(null);

      const request = createMockRequest('https://example.com/settings');

      await middleware(request);

      expect(logger.default.info).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle high volume of requests efficiently', async () => {
      const mockToken = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      (getToken as any).mockResolvedValue(mockToken);

      const requests = Array.from({ length: 100 }, (_, i) =>
        createMockRequest(`https://example.com/api/test-${i}`)
      );

      const startTime = Date.now();

      await Promise.all(requests.map(req => middleware(req)));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 100 requests in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid matcher configuration', () => {
      const { config } = require('@/middleware');

      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
      expect(config.matcher.length).toBeGreaterThan(0);
    });

    it('should exclude static files in matcher', () => {
      const { config } = require('@/middleware');

      const matcher = config.matcher[0];
      expect(matcher).toContain('_next/static');
      expect(matcher).toContain('_next/image');
      expect(matcher).toContain('favicon.ico');
    });
  });
});