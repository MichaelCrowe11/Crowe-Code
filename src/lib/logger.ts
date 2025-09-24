/**
 * Logging utility for Crowe Logic Platform
 * Provides structured logging with multiple transports
 * Client-safe implementation that works in both server and browser environments
 */

const isServer = typeof window === 'undefined' && typeof process !== 'undefined';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// Simple logger interface
interface Logger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  http(message: string, meta?: any): void;
  verbose(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  silly(message: string, meta?: any): void;
}

// Client-side console logger
const createConsoleLogger = (): Logger => ({
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta),
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta),
  http: (message: string, meta?: any) => console.log(`[HTTP] ${message}`, meta),
  verbose: (message: string, meta?: any) => console.log(`[VERBOSE] ${message}`, meta),
  debug: (message: string, meta?: any) => console.log(`[DEBUG] ${message}`, meta),
  silly: (message: string, meta?: any) => console.log(`[SILLY] ${message}`, meta),
});

// Server-side winston logger (dynamic import)
let serverLogger: Logger | null = null;

const createServerLogger = async (): Promise<Logger> => {
  if (serverLogger) return serverLogger;
  
  try {
    const winston = await import('winston');
    const DailyRotateFile = await import('winston-daily-rotate-file');
    
    // Log format for structured logging
    const logFormat = winston.default.format.combine(
      winston.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.default.format.errors({ stack: true }),
      winston.default.format.splat(),
      winston.default.format.json()
    );

    // Console format for development
    const consoleFormat = winston.default.format.combine(
      winston.default.format.colorize(),
      winston.default.format.timestamp({ format: 'HH:mm:ss' }),
      winston.default.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    );

    // File rotation transport
    const fileRotateTransport = new DailyRotateFile.default({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    });

    // Error file rotation transport
    const errorFileRotateTransport = new DailyRotateFile.default({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: logFormat
    });

    // Create logger instance
    serverLogger = winston.default.createLogger({
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      format: logFormat,
      defaultMeta: {
        service: 'crowe-platform',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        fileRotateTransport,
        errorFileRotateTransport
      ]
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      serverLogger.add(new winston.default.transports.Console({
        format: consoleFormat
      }));
    }

    return serverLogger;
  } catch (error) {
    // Fallback to console logger if winston fails
    console.warn('Failed to initialize winston logger, falling back to console:', error);
    return createConsoleLogger();
  }
};

// Create logger instance based on environment
const logger: Logger = isServer 
  ? (() => {
      let instance: Logger = createConsoleLogger(); // Start with console logger
      createServerLogger().then(winstonLogger => {
        instance = winstonLogger;
      }).catch(() => {
        // Keep console logger as fallback
      });
      
      // Return a proxy that will use the appropriate logger
      return new Proxy({} as Logger, {
        get(target, prop) {
          if (typeof prop === 'string' && prop in instance) {
            return (instance as any)[prop].bind(instance);
          }
          return undefined;
        }
      });
    })()
  : createConsoleLogger();

/**
 * Request logger middleware
 */
export function logRequest(req: any, res: any, next: any) {
  const start = Date.now();
  
  // Log request
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'http';
    
    logger[level]('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  
  next();
}

/**
 * Error logger
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context
  });
}

/**
 * Performance logger
 */
export class PerformanceLogger {
  private timers: Map<string, number> = new Map();
  
  start(label: string) {
    this.timers.set(label, Date.now());
  }
  
  end(label: string, metadata?: Record<string, any>) {
    const start = this.timers.get(label);
    if (!start) {
      logger.warn(`Performance timer '${label}' was not started`);
      return;
    }
    
    const duration = Date.now() - start;
    this.timers.delete(label);
    
    logger.info(`Performance: ${label}`, {
      duration: `${duration}ms`,
      ...metadata
    });
    
    // Alert if operation is slow
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${label}`, {
        duration: `${duration}ms`,
        ...metadata
      });
    }
  }
}

/**
 * Database query logger
 */
export function logQuery(query: string, params?: any[], duration?: number) {
  const level = duration && duration > 100 ? 'warn' : 'debug';
  
  logger[level]('Database query', {
    query: query.substring(0, 500), // Truncate long queries
    params: params?.slice(0, 10), // Limit logged params
    duration: duration ? `${duration}ms` : undefined
  });
}

/**
 * Security event logger
 */
export function logSecurityEvent(event: string, details: Record<string, any>) {
  logger.warn(`Security event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Audit logger
 */
export function logAudit(action: string, userId: string, details: Record<string, any>) {
  logger.info('Audit log', {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
}

/**
 * Metrics logger for monitoring
 */
export class MetricsLogger {
  private metrics: Map<string, number[]> = new Map();
  
  record(metric: string, value: number) {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    
    const values = this.metrics.get(metric)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }
  
  getStats(metric: string) {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    
    return {
      count: sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
  
  flush() {
    const allStats: Record<string, any> = {};
    
    for (const [metric, values] of this.metrics.entries()) {
      if (values.length > 0) {
        allStats[metric] = this.getStats(metric);
      }
    }
    
    if (Object.keys(allStats).length > 0) {
      logger.info('Metrics summary', allStats);
    }
    
    this.metrics.clear();
  }
}

// Export singleton instances
export const performanceLogger = new PerformanceLogger();
export const metricsLogger = new MetricsLogger();

// Flush metrics every minute
setInterval(() => {
  metricsLogger.flush();
}, 60000);

// Handle uncaught exceptions (server-only)
if (isServer && typeof process !== 'undefined') {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason,
      promise
    });
  });
}

export default logger;
