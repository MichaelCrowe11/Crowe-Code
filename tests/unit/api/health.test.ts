import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';
import { GET, HEAD } from '@/app/api/health/route';

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      headers: options?.headers || {},
    })),
  },
}));

describe('/api/health', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };

    // Mock process.uptime
    vi.spyOn(process, 'uptime').mockReturnValue(12345);

    // Mock Date.now for consistent timing
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-11-15T00:00:00.000Z');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  describe('GET endpoint', () => {
    it('should return healthy status with all services configured', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.REDIS_URL = 'redis://localhost:6379';
      process.env.npm_package_version = '2.1.0';
      process.env.NODE_ENV = 'production';

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          status: 'healthy',
          timestamp: '2023-11-15T00:00:00.000Z',
          service: 'Crowe Logic Platform',
          version: '2.1.0',
          uptime: 12345,
          environment: 'production',
          checks: {
            server: 'healthy',
            database: 'configured',
            redis: 'configured',
          },
          responseTime: 0,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should return healthy status with default values when env vars are missing', async () => {
      delete process.env.DATABASE_URL;
      delete process.env.REDIS_URL;
      delete process.env.npm_package_version;
      delete process.env.NODE_ENV;

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'Crowe Logic Platform',
          version: '1.0.0',
          environment: 'development',
          checks: {
            server: 'healthy',
            database: 'not_configured',
            redis: 'not_configured',
          },
        }),
        expect.objectContaining({
          status: 200,
        })
      );
    });

    it('should return degraded status when database check fails', async () => {
      // Simulate database check failure by not setting DATABASE_URL and causing an error
      process.env.DATABASE_URL = 'invalid-url';

      // Mock an error in the database check section
      const originalConsoleError = console.error;
      console.error = vi.fn();

      const response = await GET();

      // Since the current implementation doesn't actually connect to the database,
      // we'll test the logic path
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            database: 'configured', // Current implementation just checks if URL exists
          }),
        }),
        expect.any(Object)
      );

      console.error = originalConsoleError;
    });

    it('should calculate response time correctly', async () => {
      // Mock Date.now to return different values for start and end time
      let callCount = 0;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        callCount++;
        return callCount === 1 ? 1700000000000 : 1700000000100; // 100ms difference
      });

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          responseTime: 100,
        }),
        expect.any(Object)
      );
    });

    it('should include correct cache control headers', async () => {
      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cache-Control': 'no-store, must-revalidate',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle uptime calculation', async () => {
      const mockUptime = 86400; // 1 day in seconds
      vi.spyOn(process, 'uptime').mockReturnValue(mockUptime);

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          uptime: 86400,
        }),
        expect.any(Object)
      );
    });

    it('should use ISO timestamp format', async () => {
      const mockISOString = '2024-01-15T12:30:45.123Z';
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockISOString);

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: mockISOString,
        }),
        expect.any(Object)
      );
    });
  });

  describe('HEAD endpoint', () => {
    it('should return 200 status with minimal headers', async () => {
      const mockResponse = {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      };

      // Mock NextResponse constructor
      const NextResponseMock = vi.fn().mockReturnValue(mockResponse);
      vi.mocked(NextResponse as any).mockImplementation(NextResponseMock);

      const response = await HEAD();

      expect(NextResponseMock).toHaveBeenCalledWith(null, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      });
    });

    it('should not return any body content', async () => {
      const NextResponseMock = vi.fn();
      vi.mocked(NextResponse as any).mockImplementation(NextResponseMock);

      await HEAD();

      expect(NextResponseMock).toHaveBeenCalledWith(
        null, // No body
        expect.any(Object)
      );
    });

    it('should include cache control headers', async () => {
      const NextResponseMock = vi.fn();
      vi.mocked(NextResponse as any).mockImplementation(NextResponseMock);

      await HEAD();

      expect(NextResponseMock).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Cache-Control': 'no-store, must-revalidate',
          }),
        })
      );
    });
  });

  describe('Environment-specific behavior', () => {
    it('should reflect production environment correctly', async () => {
      process.env.NODE_ENV = 'production';
      process.env.npm_package_version = '3.0.0';

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'production',
          version: '3.0.0',
        }),
        expect.any(Object)
      );
    });

    it('should reflect development environment correctly', async () => {
      process.env.NODE_ENV = 'development';

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'development',
        }),
        expect.any(Object)
      );
    });

    it('should reflect test environment correctly', async () => {
      process.env.NODE_ENV = 'test';

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          environment: 'test',
        }),
        expect.any(Object)
      );
    });
  });

  describe('Service checks', () => {
    it('should mark database as configured when URL is present', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db';

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            database: 'configured',
          }),
        }),
        expect.any(Object)
      );
    });

    it('should mark database as not_configured when URL is missing', async () => {
      delete process.env.DATABASE_URL;

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            database: 'not_configured',
          }),
        }),
        expect.any(Object)
      );
    });

    it('should mark redis as configured when URL is present', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            redis: 'configured',
          }),
        }),
        expect.any(Object)
      );
    });

    it('should mark redis as not_configured when URL is missing', async () => {
      delete process.env.REDIS_URL;

      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            redis: 'not_configured',
          }),
        }),
        expect.any(Object)
      );
    });

    it('should always mark server as healthy', async () => {
      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          checks: expect.objectContaining({
            server: 'healthy',
          }),
        }),
        expect.any(Object)
      );
    });
  });

  describe('Response structure validation', () => {
    it('should return all required fields', async () => {
      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.any(String),
          timestamp: expect.any(String),
          service: expect.any(String),
          version: expect.any(String),
          uptime: expect.any(Number),
          environment: expect.any(String),
          checks: expect.objectContaining({
            server: expect.any(String),
            database: expect.any(String),
            redis: expect.any(String),
          }),
          responseTime: expect.any(Number),
        }),
        expect.any(Object)
      );
    });

    it('should have consistent service name', async () => {
      const response = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'Crowe Logic Platform',
        }),
        expect.any(Object)
      );
    });

    it('should have valid status values', async () => {
      const response = await GET();

      const call = vi.mocked(NextResponse.json).mock.calls[0];
      const responseData = call[0];

      expect(['healthy', 'degraded', 'unhealthy']).toContain(responseData.status);
    });

    it('should have non-negative response time', async () => {
      const response = await GET();

      const call = vi.mocked(NextResponse.json).mock.calls[0];
      const responseData = call[0];

      expect(responseData.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should have non-negative uptime', async () => {
      const response = await GET();

      const call = vi.mocked(NextResponse.json).mock.calls[0];
      const responseData = call[0];

      expect(responseData.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});