/**
 * Centralized logging configuration for CroweCode Platform
 * Manages log levels, formats, and destinations
 */

export const LoggingConfig = {
  // Log levels by environment
  levels: {
    production: 'info',
    development: 'debug',
    test: 'warn',
  },

  // Log categories and their specific levels
  categories: {
    'ai-provider': 'info',
    'database': 'debug',
    'authentication': 'info',
    'websocket': 'debug',
    'performance': 'info',
    'security': 'warn',
    'billing': 'info',
    'deployment': 'info',
    'collaboration': 'debug',
    'agriculture': 'info',
    'mycology': 'info',
    'marketplace': 'info',
    'quantum': 'debug',
  },

  // File rotation settings
  rotation: {
    maxSize: '20m',
    maxFiles: '14d',
    datePattern: 'YYYY-MM-DD',
    compress: true,
  },

  // Destinations
  destinations: {
    console: {
      enabled: true,
      colorize: process.env.NODE_ENV !== 'production',
    },
    file: {
      enabled: process.env.NODE_ENV === 'production',
      errorFile: 'logs/error-%DATE%.log',
      combinedFile: 'logs/combined-%DATE%.log',
      auditFile: 'logs/audit-%DATE%.log',
    },
    sentry: {
      enabled: process.env.NODE_ENV === 'production' && !!process.env.SENTRY_DSN,
      dsn: process.env.SENTRY_DSN,
    },
    datadog: {
      enabled: process.env.NODE_ENV === 'production' && !!process.env.DATADOG_API_KEY,
      apiKey: process.env.DATADOG_API_KEY,
    },
  },

  // Performance thresholds (in ms)
  performance: {
    slow: {
      database: 100,
      api: 500,
      ai: 2000,
      render: 50,
    },
    critical: {
      database: 500,
      api: 2000,
      ai: 10000,
      render: 200,
    },
  },

  // Security events to always log
  security: {
    alwaysLog: [
      'failed_login',
      'unauthorized_access',
      'rate_limit_exceeded',
      'suspicious_activity',
      'data_breach_attempt',
      'sql_injection_attempt',
      'xss_attempt',
      'csrf_attempt',
    ],
  },

  // Audit events to track
  audit: {
    events: [
      'user_login',
      'user_logout',
      'user_register',
      'password_change',
      'permission_change',
      'data_export',
      'data_delete',
      'payment_processed',
      'subscription_changed',
      'api_key_created',
      'api_key_revoked',
    ],
  },

  // Sampling rates for high-volume logs
  sampling: {
    http: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    websocket: process.env.NODE_ENV === 'production' ? 0.05 : 1.0, // 5% in prod
    database: process.env.NODE_ENV === 'production' ? 0.2 : 1.0, // 20% in prod
  },

  // Log sanitization patterns
  sanitize: {
    patterns: [
      /password["\s]*:["\s]*"[^"]+"/gi,
      /token["\s]*:["\s]*"[^"]+"/gi,
      /api[_-]?key["\s]*:["\s]*"[^"]+"/gi,
      /secret["\s]*:["\s]*"[^"]+"/gi,
      /authorization["\s]*:["\s]*"[^"]+"/gi,
      /cookie["\s]*:["\s]*"[^"]+"/gi,
      /credit[_-]?card["\s]*:["\s]*"[^"]+"/gi,
      /ssn["\s]*:["\s]*"[^"]+"/gi,
    ],
    replacement: '[REDACTED]',
  },

  // Alert thresholds
  alerts: {
    errorRate: {
      threshold: 10, // errors per minute
      window: 60000, // 1 minute
    },
    responseTime: {
      threshold: 1000, // ms
      window: 300000, // 5 minutes
    },
    memoryUsage: {
      threshold: 0.9, // 90% of available memory
      window: 60000, // 1 minute
    },
  },
};

export default LoggingConfig;