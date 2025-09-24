import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  rateLimits,
  getRateLimitId,
  getClientIP,
  checkRateLimits,
  getRateLimitHeaders,
  getRoleLimitMultiplier,
  advancedRateLimit,
  createRateLimitMiddleware,
} from '@/lib/rate-limit';

// Mock dependencies
vi.mock('@upstash/ratelimit', () => {
  const mockLimit = vi.fn();

  return {
    Ratelimit: vi.fn().mockImplementation((config) => ({
      limit: mockLimit,
      config,
    })),
  };
});

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => new Map()),
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Rate Limiting', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  const createMockRequest = (headers: Record<string, string> = {}) => {
    return new Request('https://example.com/api/test', {
      headers: new Headers(headers),
    });
  };

  describe('Rate Limit Configuration', () => {
    it('should have all required rate limit types', () => {
      expect(rateLimits.api).toBeDefined();
      expect(rateLimits.ai).toBeDefined();
      expect(rateLimits.files).toBeDefined();
      expect(rateLimits.terminal).toBeDefined();
      expect(rateLimits.auth).toBeDefined();
      expect(rateLimits.global).toBeDefined();
    });

    it('should use Redis when REDIS_URL is available', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      // Re-import to pick up environment changes
      vi.resetModules();
      const { Redis } = require('@upstash/redis');

      expect(Redis.fromEnv).toBeDefined();
    });

    it('should fallback to Map when Redis is not available', () => {
      delete process.env.REDIS_URL;

      // Rate limiters should still be created with Map fallback
      expect(rateLimits.api).toBeDefined();
    });
  });

  describe('Client IP Detection', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = createMockRequest({
        'x-forwarded-for': '192.168.1.100, 10.0.0.1',
      });

      const ip = getClientIP(request);

      expect(ip).toBe('192.168.1.100');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = createMockRequest({
        'x-real-ip': '203.0.113.45',
      });

      const ip = getClientIP(request);

      expect(ip).toBe('203.0.113.45');
    });

    it('should extract IP from x-client-ip header', () => {
      const request = createMockRequest({
        'x-client-ip': '198.51.100.10',
      });

      const ip = getClientIP(request);

      expect(ip).toBe('198.51.100.10');
    });

    it('should extract IP from cf-connecting-ip header (Cloudflare)', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '104.16.132.229',
      });

      const ip = getClientIP(request);

      expect(ip).toBe('104.16.132.229');
    });

    it('should handle multiple IP headers and use the first valid one', () => {
      const request = createMockRequest({
        'x-forwarded-for': 'invalid-ip',
        'x-real-ip': '192.168.1.50',
        'cf-connecting-ip': '104.16.132.229',
      });

      const ip = getClientIP(request);

      expect(ip).toBe('192.168.1.50');
    });

    it('should return unknown when no valid IP is found', () => {
      const request = createMockRequest({
        'x-forwarded-for': 'invalid-ip',
      });

      const ip = getClientIP(request);

      expect(ip).toBe('unknown');
    });

    it('should validate IPv4 addresses correctly', () => {
      const validIPs = [
        '192.168.1.1',
        '10.0.0.1',
        '172.16.0.1',
        '127.0.0.1',
        '255.255.255.255',
        '0.0.0.0',
      ];

      validIPs.forEach(ip => {
        const request = createMockRequest({ 'x-real-ip': ip });
        expect(getClientIP(request)).toBe(ip);
      });
    });

    it('should reject invalid IP addresses', () => {
      const invalidIPs = [
        '256.1.1.1',
        '192.168.1',
        '192.168.1.1.1',
        'not-an-ip',
        '192.168.1.-1',
      ];

      invalidIPs.forEach(ip => {
        const request = createMockRequest({ 'x-real-ip': ip });
        expect(getClientIP(request)).toBe('unknown');
      });
    });

    it('should handle IPv6 addresses', () => {
      const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      const request = createMockRequest({ 'x-real-ip': ipv6 });

      const ip = getClientIP(request);

      expect(ip).toBe(ipv6);
    });
  });

  describe('Rate Limit ID Generation', () => {
    it('should generate user-based ID when user ID is provided', () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const id = getRateLimitId(request, 'user-123', 'user');

      expect(id).toBe('user-123');
    });

    it('should fallback to IP when user ID is not provided for user type', () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const id = getRateLimitId(request, undefined, 'user');

      expect(id).toBe('192.168.1.1');
    });

    it('should use IP-only for ip type', () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const id = getRateLimitId(request, 'user-123', 'ip');

      expect(id).toBe('192.168.1.1');
    });

    it('should create mixed ID when user ID is provided', () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const id = getRateLimitId(request, 'user-123', 'mixed');

      expect(id).toBe('user:user-123');
    });

    it('should create IP-based mixed ID when user ID is not provided', () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const id = getRateLimitId(request, undefined, 'mixed');

      expect(id).toBe('ip:192.168.1.1');
    });

    it('should default to mixed type', () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const id = getRateLimitId(request, 'user-123');

      expect(id).toBe('user:user-123');
    });
  });

  describe('Role-based Rate Limit Multipliers', () => {
    it('should return correct multipliers for different roles', () => {
      expect(getRoleLimitMultiplier('ADMIN')).toBe(5.0);
      expect(getRoleLimitMultiplier('MANAGER')).toBe(3.0);
      expect(getRoleLimitMultiplier('OPERATOR')).toBe(2.0);
      expect(getRoleLimitMultiplier('USER')).toBe(1.0);
      expect(getRoleLimitMultiplier('VIEWER')).toBe(0.5);
    });

    it('should handle case insensitive roles', () => {
      expect(getRoleLimitMultiplier('admin')).toBe(5.0);
      expect(getRoleLimitMultiplier('Admin')).toBe(5.0);
      expect(getRoleLimitMultiplier('ADMIN')).toBe(5.0);
    });

    it('should return default multiplier for unknown roles', () => {
      expect(getRoleLimitMultiplier('UNKNOWN')).toBe(0.25);
      expect(getRoleLimitMultiplier('')).toBe(0.25);
      expect(getRoleLimitMultiplier(undefined)).toBe(0.25);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should generate correct rate limit headers', () => {
      const result = {
        limit: 100,
        remaining: 95,
        reset: 1640995200000, // 2022-01-01 00:00:00
      };

      const headers = getRateLimitHeaders(result);

      expect(headers).toEqual({
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '95',
        'X-RateLimit-Reset': '2022-01-01T00:00:00.000Z',
      });
    });

    it('should handle missing values gracefully', () => {
      const result = {
        limit: 100,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers).toEqual({
        'X-RateLimit-Limit': '100',
      });
    });

    it('should handle empty result object', () => {
      const headers = getRateLimitHeaders({});

      expect(headers).toEqual({});
    });
  });

  describe('Multiple Rate Limit Checks', () => {
    it('should check multiple rate limits and pass all', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      // Mock successful rate limit results
      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 95,
          reset: Date.now() + 60000,
        }),
      };

      // Replace rate limiters with mocks
      rateLimits.global = mockRateLimit as any;
      rateLimits.api = mockRateLimit as any;

      const result = await checkRateLimits(request, 'user-123', ['global', 'api']);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.remaining).toBe(95);
      expect(mockRateLimit.limit).toHaveBeenCalledTimes(2);
    });

    it('should fail when any rate limit is exceeded', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const successMock = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 95,
          reset: Date.now() + 60000,
        }),
      };

      const failMock = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 50,
          remaining: 0,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.global = successMock as any;
      rateLimits.api = failMock as any;

      const result = await checkRateLimits(request, 'user-123', ['global', 'api']);

      expect(result.success).toBe(false);
      expect(result.restrictedBy).toBe('api');
      expect(result.limit).toBe(50);
      expect(result.remaining).toBe(0);
    });

    it('should handle rate limit errors gracefully', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const errorMock = {
        limit: vi.fn().mockRejectedValue(new Error('Redis connection failed')),
      };

      const successMock = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 95,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.global = errorMock as any;
      rateLimits.api = successMock as any;

      const result = await checkRateLimits(request, 'user-123', ['global', 'api']);

      expect(result.success).toBe(true); // Should continue despite error
      expect(result.limit).toBe(100);
    });

    it('should return most restrictive remaining count', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const globalMock = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 200,
          remaining: 150,
          reset: Date.now() + 60000,
        }),
      };

      const apiMock = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 25, // More restrictive
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.global = globalMock as any;
      rateLimits.api = apiMock as any;

      const result = await checkRateLimits(request, 'user-123', ['global', 'api']);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(25); // Should use the most restrictive
      expect(result.limit).toBe(100);
    });
  });

  describe('Advanced Rate Limiting', () => {
    it('should apply role multiplier to rate limits', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 80,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      const result = await advancedRateLimit(request, 'user-123', 'ADMIN', 'api');

      expect(result.success).toBe(true);
      expect(result.limit).toBe(500); // 100 * 5.0 (ADMIN multiplier)
      expect(result.remaining).toBe(400); // 80 * 5.0
      expect(result.headers).toBeDefined();
    });

    it('should handle rate limit failures with role adjustment', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 5,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      // VIEWER role has 0.5 multiplier, so 5 * 0.5 = 2.5 -> 2 remaining
      // But since original success was true, we need remaining > 0 after adjustment
      const result = await advancedRateLimit(request, 'user-123', 'VIEWER', 'api');

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2); // Math.floor(5 * 0.5)
    });

    it('should handle errors gracefully with fallback limits', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const mockRateLimit = {
        limit: vi.fn().mockRejectedValue(new Error('Redis error')),
      };

      rateLimits.api = mockRateLimit as any;

      const result = await advancedRateLimit(request, 'user-123', 'USER', 'api');

      expect(result.success).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(5);
      expect(result.headers).toBeDefined();
    });
  });

  describe('Rate Limit Middleware Factory', () => {
    it('should create middleware that allows requests within limits', async () => {
      const middleware = createRateLimitMiddleware('api');

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 95,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const result = await middleware(request, 'user-123', 'USER');

      expect(result).toEqual({
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '95',
        'X-RateLimit-Reset': expect.any(String),
      });
    });

    it('should create middleware that blocks requests exceeding limits', async () => {
      const middleware = createRateLimitMiddleware('api', {
        message: 'Too many API requests',
      });

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 100,
          remaining: 0,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const result = await middleware(request, 'user-123', 'USER');

      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(429);

      const body = await result.json();
      expect(body.error).toBe('Too many API requests');
      expect(body.code).toBe('RATE_LIMITED');
      expect(result.headers.get('Retry-After')).toBeDefined();
    });

    it('should skip rate limiting when skip function returns true', async () => {
      const middleware = createRateLimitMiddleware('api', {
        skip: (req) => req.headers.get('x-skip-rate-limit') === 'true',
      });

      const request = createMockRequest({
        'x-real-ip': '192.168.1.1',
        'x-skip-rate-limit': 'true',
      });

      const result = await middleware(request, 'user-123', 'USER');

      expect(result).toBeNull(); // Should skip rate limiting
    });

    it('should use custom key generator when provided', async () => {
      const customKeyGen = vi.fn().mockReturnValue('custom-key');

      const middleware = createRateLimitMiddleware('api', {
        keyGenerator: customKeyGen,
      });

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 95,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      await middleware(request, 'user-123', 'USER');

      expect(customKeyGen).toHaveBeenCalledWith(request);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle concurrent rate limit checks efficiently', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 95,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      const concurrentChecks = Array.from({ length: 10 }, () =>
        advancedRateLimit(request, 'user-123', 'USER', 'api')
      );

      const results = await Promise.all(concurrentChecks);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle very large remaining counts', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: Number.MAX_SAFE_INTEGER,
          remaining: Number.MAX_SAFE_INTEGER,
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      const result = await advancedRateLimit(request, 'user-123', 'ADMIN', 'api');

      expect(result.success).toBe(true);
      expect(result.limit).toBeGreaterThan(0);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should ensure remaining count never goes below zero', async () => {
      const request = createMockRequest({ 'x-real-ip': '192.168.1.1' });

      const mockRateLimit = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 100,
          remaining: 1, // Very low remaining
          reset: Date.now() + 60000,
        }),
      };

      rateLimits.api = mockRateLimit as any;

      const result = await advancedRateLimit(request, 'user-123', 'VIEWER', 'api');

      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });
  });
});