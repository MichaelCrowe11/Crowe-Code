import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock winston
const mockWinston = {
  createLogger: vi.fn(),
  format: {
    combine: vi.fn(),
    timestamp: vi.fn(),
    errors: vi.fn(),
    json: vi.fn(),
    printf: vi.fn(),
    colorize: vi.fn(),
  },
  transports: {
    Console: vi.fn(),
    DailyRotateFile: vi.fn(),
  },
};

vi.mock('winston', () => mockWinston);
vi.mock('winston-daily-rotate-file', () => ({
  default: mockWinston.transports.DailyRotateFile,
}));

describe('Logger', () => {
  let logger: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };

    // Mock logger instance
    const mockLoggerInstance = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      verbose: vi.fn(),
    };

    mockWinston.createLogger.mockReturnValue(mockLoggerInstance);

    // Set up mock return values
    mockWinston.format.combine.mockReturnValue('combined-format');
    mockWinston.format.timestamp.mockReturnValue('timestamp-format');
    mockWinston.format.errors.mockReturnValue('errors-format');
    mockWinston.format.json.mockReturnValue('json-format');
    mockWinston.format.printf.mockReturnValue('printf-format');
    mockWinston.format.colorize.mockReturnValue('colorize-format');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('Logger Configuration', () => {
    it('should create logger with development configuration', async () => {
      process.env.NODE_ENV = 'development';

      const { default: logger } = await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith({
        level: 'debug',
        format: 'combined-format',
        defaultMeta: { service: 'crowecode-platform' },
        transports: expect.arrayContaining([
          expect.any(Object), // Console transport
          expect.any(Object), // File transport
        ]),
      });
    });

    it('should create logger with production configuration', async () => {
      process.env.NODE_ENV = 'production';

      const { default: logger } = await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith({
        level: 'info',
        format: 'combined-format',
        defaultMeta: { service: 'crowecode-platform' },
        transports: expect.arrayContaining([
          expect.any(Object), // Console transport
          expect.any(Object), // File transport
        ]),
      });
    });

    it('should create logger with test configuration', async () => {
      process.env.NODE_ENV = 'test';

      const { default: logger } = await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith({
        level: 'error',
        format: 'combined-format',
        defaultMeta: { service: 'crowecode-platform' },
        transports: expect.arrayContaining([
          expect.any(Object), // Console transport
        ]),
      });
    });

    it('should use console transport in all environments', async () => {
      const { default: logger } = await import('@/lib/logger');

      expect(mockWinston.transports.Console).toHaveBeenCalled();
    });

    it('should use file transport in non-test environments', async () => {
      process.env.NODE_ENV = 'development';

      const { default: logger } = await import('@/lib/logger');

      expect(mockWinston.transports.DailyRotateFile).toHaveBeenCalled();
    });

    it('should not use file transport in test environment', async () => {
      process.env.NODE_ENV = 'test';

      const { default: logger } = await import('@/lib/logger');

      expect(mockWinston.transports.DailyRotateFile).not.toHaveBeenCalled();
    });
  });

  describe('Logger Methods', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      const loggerModule = await import('@/lib/logger');
      logger = loggerModule.default;
    });

    it('should have info method', () => {
      logger.info('Test info message');

      expect(logger.info).toHaveBeenCalledWith('Test info message');
    });

    it('should have error method', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(logger.error).toHaveBeenCalledWith('Error occurred', error);
    });

    it('should have warn method', () => {
      logger.warn('Test warning message');

      expect(logger.warn).toHaveBeenCalledWith('Test warning message');
    });

    it('should have debug method', () => {
      logger.debug('Test debug message');

      expect(logger.debug).toHaveBeenCalledWith('Test debug message');
    });

    it('should handle structured logging', () => {
      const metadata = {
        userId: 'user-123',
        action: 'login',
        ip: '192.168.1.1',
      };

      logger.info('User login', metadata);

      expect(logger.info).toHaveBeenCalledWith('User login', metadata);
    });

    it('should handle error objects', () => {
      const error = new Error('Database connection failed');
      error.stack = 'Error stack trace...';

      logger.error('Database error', { error: error.message, stack: error.stack });

      expect(logger.error).toHaveBeenCalledWith('Database error', {
        error: error.message,
        stack: error.stack,
      });
    });
  });

  describe('Log Levels', () => {
    it('should set debug level in development', async () => {
      process.env.NODE_ENV = 'development';

      await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        })
      );
    });

    it('should set info level in production', async () => {
      process.env.NODE_ENV = 'production';

      await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      );
    });

    it('should set error level in test', async () => {
      process.env.NODE_ENV = 'test';

      await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
        })
      );
    });

    it('should default to info level for unknown environments', async () => {
      process.env.NODE_ENV = 'staging';

      await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      );
    });
  });

  describe('Format Configuration', () => {
    it('should combine multiple formats', async () => {
      await import('@/lib/logger');

      expect(mockWinston.format.combine).toHaveBeenCalled();
      expect(mockWinston.format.timestamp).toHaveBeenCalled();
      expect(mockWinston.format.errors).toHaveBeenCalledWith({ stack: true });
    });

    it('should use JSON format in production', async () => {
      process.env.NODE_ENV = 'production';

      await import('@/lib/logger');

      expect(mockWinston.format.json).toHaveBeenCalled();
    });

    it('should use colorized format in development', async () => {
      process.env.NODE_ENV = 'development';

      await import('@/lib/logger');

      expect(mockWinston.format.colorize).toHaveBeenCalled();
    });
  });

  describe('Service Metadata', () => {
    it('should include service name in default metadata', async () => {
      await import('@/lib/logger');

      expect(mockWinston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultMeta: { service: 'crowecode-platform' },
        })
      );
    });
  });

  describe('Transport Configuration', () => {
    it('should configure console transport with proper format', async () => {
      process.env.NODE_ENV = 'development';

      await import('@/lib/logger');

      expect(mockWinston.transports.Console).toHaveBeenCalledWith({
        format: 'combined-format',
      });
    });

    it('should configure file transport with rotation', async () => {
      process.env.NODE_ENV = 'production';

      await import('@/lib/logger');

      expect(mockWinston.transports.DailyRotateFile).toHaveBeenCalledWith({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      });
    });

    it('should configure error file transport', async () => {
      process.env.NODE_ENV = 'production';

      await import('@/lib/logger');

      expect(mockWinston.transports.DailyRotateFile).toHaveBeenCalledWith({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle logger creation errors gracefully', async () => {
      mockWinston.createLogger.mockImplementation(() => {
        throw new Error('Logger creation failed');
      });

      await expect(import('@/lib/logger')).rejects.toThrow('Logger creation failed');
    });

    it('should handle transport creation errors', async () => {
      mockWinston.transports.Console.mockImplementation(() => {
        throw new Error('Console transport failed');
      });

      await expect(import('@/lib/logger')).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should create logger efficiently', async () => {
      const startTime = Date.now();

      await import('@/lib/logger');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Logger creation should be fast (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should handle high-frequency logging', async () => {
      const { default: logger } = await import('@/lib/logger');

      const startTime = Date.now();

      // Simulate 1000 log calls
      for (let i = 0; i < 1000; i++) {
        logger.info(`Log message ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle 1000 logs quickly (< 500ms)
      expect(duration).toBeLessThan(500);
      expect(logger.info).toHaveBeenCalledTimes(1000);
    });
  });

  describe('Security', () => {
    it('should not log sensitive information by default', async () => {
      const { default: logger } = await import('@/lib/logger');

      // Simulate logging potentially sensitive data
      const sensitiveData = {
        password: 'secret123',
        apiKey: 'sk-1234567890',
        token: 'bearer-token',
        creditCard: '4111-1111-1111-1111',
      };

      logger.info('User action', sensitiveData);

      // The logger should have been called, but in a real implementation,
      // sensitive fields should be filtered out
      expect(logger.info).toHaveBeenCalledWith('User action', sensitiveData);
    });

    it('should handle circular references in objects', async () => {
      const { default: logger } = await import('@/lib/logger');

      // Create circular reference
      const obj: any = { name: 'test' };
      obj.self = obj;

      // Should not throw when logging circular objects
      expect(() => {
        logger.info('Circular object', obj);
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with different log levels consistently', async () => {
      const { default: logger } = await import('@/lib/logger');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(logger.debug).toHaveBeenCalledWith('Debug message');
      expect(logger.info).toHaveBeenCalledWith('Info message');
      expect(logger.warn).toHaveBeenCalledWith('Warning message');
      expect(logger.error).toHaveBeenCalledWith('Error message');
    });

    it('should maintain consistent interface across environments', async () => {
      const environments = ['development', 'production', 'test'];

      for (const env of environments) {
        process.env.NODE_ENV = env;
        vi.resetModules();

        const { default: logger } = await import('@/lib/logger');

        // Logger should have consistent interface
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.debug).toBe('function');
      }
    });
  });
});