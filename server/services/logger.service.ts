import pino from 'pino';
import { env } from '../config/environment';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create pino logger with appropriate configuration
const isDevelopment = env.NODE_ENV === 'development';
const isProduction = env.NODE_ENV === 'production';

// Base logger configuration
const baseConfig: pino.LoggerOptions = {
  level: env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      'api_key',
      'apiKey',
      'secret',
      'JWT_SECRET',
      'STRIPE_SECRET_KEY',
      'ANTHROPIC_API_KEY',
      'ELEVENLABS_API_KEY',
      'DATABASE_URL',
      '*.password',
      '*.token',
      '*.secret',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
};

// Development configuration with pretty printing
const devTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
    singleLine: false,
  },
};

// Production configuration with file output
const prodTransports = [
  {
    target: 'pino/file',
    options: {
      destination: path.join(logsDir, 'app.log'),
      mkdir: true,
    },
  },
  {
    target: 'pino/file',
    level: 'error',
    options: {
      destination: path.join(logsDir, 'error.log'),
      mkdir: true,
    },
  },
];

// Create logger instance
export const logger = isDevelopment
  ? pino({
      ...baseConfig,
      transport: devTransport,
    })
  : pino({
      ...baseConfig,
      timestamp: pino.stdTimeFunctions.isoTime,
    }, pino.multistream([
      { stream: pino.destination(path.join(logsDir, 'app.log')) },
      { level: 'error', stream: pino.destination(path.join(logsDir, 'error.log')) },
    ]));

// Child logger factory for specific modules
export function createLogger(module: string) {
  return logger.child({ module });
}

// Async logger for heavy operations
export class AsyncLogger {
  private queue: Array<() => void> = [];
  private processing = false;
  
  log(level: string, message: string, data?: any) {
    this.queue.push(() => {
      logger[level](data, message);
    });
    
    if (!this.processing) {
      this.process();
    }
  }
  
  private async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        task();
      }
      
      // Yield to event loop
      await new Promise(resolve => setImmediate(resolve));
    }
    
    this.processing = false;
  }
}

// Performance logging utility
export class PerformanceLogger {
  private timers = new Map<string, number>();
  
  start(label: string) {
    this.timers.set(label, Date.now());
  }
  
  end(label: string, metadata?: any) {
    const start = this.timers.get(label);
    if (!start) {
      logger.warn(`Performance timer '${label}' was not started`);
      return;
    }
    
    const duration = Date.now() - start;
    this.timers.delete(label);
    
    logger.info({
      performance: {
        label,
        duration,
        ...metadata,
      },
    }, `Performance: ${label} took ${duration}ms`);
    
    // Alert on slow operations
    if (duration > 1000) {
      logger.warn({
        alert: 'slow_operation',
        label,
        duration,
      }, `Slow operation detected: ${label} took ${duration}ms`);
    }
  }
}

// Structured logging helpers
export const log = {
  info: (message: string, data?: any) => logger.info(data, message),
  warn: (message: string, data?: any) => logger.warn(data, message),
  error: (message: string, error?: any, data?: any) => {
    if (error instanceof Error) {
      logger.error({ err: error, ...data }, message);
    } else {
      logger.error({ ...error, ...data }, message);
    }
  },
  debug: (message: string, data?: any) => logger.debug(data, message),
  fatal: (message: string, error?: any) => {
    logger.fatal({ err: error }, message);
    // Give logger time to flush before exit
    setTimeout(() => process.exit(1), 100);
  },
  
  // Audit logging for security events
  audit: (event: string, userId: number | string, details?: any) => {
    logger.info({
      audit: true,
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    }, `Audit: ${event}`);
  },
  
  // Metrics logging
  metric: (name: string, value: number, tags?: Record<string, string>) => {
    logger.info({
      metric: true,
      name,
      value,
      tags,
      timestamp: new Date().toISOString(),
    }, `Metric: ${name}=${value}`);
  },
};

// Export singleton instances
export const asyncLogger = new AsyncLogger();
export const perfLogger = new PerformanceLogger();