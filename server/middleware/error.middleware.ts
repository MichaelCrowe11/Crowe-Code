import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';
import { ZodError } from 'zod';
import { env } from '../config/environment';

// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public code?: string,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, true, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, message, true, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, message, true, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, true, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, true, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(429, message, true, 'RATE_LIMIT_ERROR');
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: any) {
    super(500, message, false, 'INTERNAL_ERROR', details);
  }
}

// Error handler middleware
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details = undefined;
  
  // Handle different error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || code;
    details = err.details;
    
    if (!err.isOperational) {
      // Log non-operational errors (unexpected errors)
      logger.error('Unexpected error occurred', err, {
        requestId: req.id,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user?.id,
      });
    } else {
      // Log operational errors at warn level
      logger.warn({
        error: message,
        code,
        statusCode,
        requestId: req.id,
        method: req.method,
        path: req.path,
      });
    }
  } else if (err instanceof ZodError) {
    // Handle Zod validation errors
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    
    logger.warn({
      error: 'Validation error',
      details,
      requestId: req.id,
    });
  } else if (err.name === 'UnauthorizedError') {
    // Handle JWT errors
    statusCode = 401;
    message = 'Invalid or expired token';
    code = 'JWT_ERROR';
    
    logger.warn({
      error: 'JWT authentication failed',
      requestId: req.id,
    });
  } else if (err.name === 'CastError' || err.name === 'ValidationError') {
    // Handle database validation errors
    statusCode = 400;
    message = 'Invalid data provided';
    code = 'DATABASE_VALIDATION_ERROR';
    
    logger.warn({
      error: 'Database validation error',
      details: err.message,
      requestId: req.id,
    });
  } else {
    // Unknown errors - log full error
    logger.error('Unhandled error', err, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?.id,
      headers: req.headers,
      body: req.body,
      query: req.query,
    });
    
    // Report to monitoring service if configured
    if (env.SENTRY_DSN) {
      // Sentry would capture here
      // Sentry.captureException(err, { user: req.user, extra: { requestId: req.id } });
    }
  }
  
  // Prepare error response
  const errorResponse: any = {
    error: {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  };
  
  // Include details in development or for operational errors
  if (env.NODE_ENV === 'development' || details) {
    errorResponse.error.details = details;
  }
  
  // Include stack trace in development
  if (env.NODE_ENV === 'development' && err.stack) {
    errorResponse.error.stack = err.stack.split('\n');
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}

// Async error wrapper for route handlers
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Not found handler (404)
export function notFoundHandler(req: Request, res: Response) {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  
  logger.warn({
    error: '404 Not Found',
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    requestId: req.id,
  });
  
  res.status(404).json({
    error: {
      message: error.message,
      code: 'NOT_FOUND',
      statusCode: 404,
      requestId: req.id,
    },
  });
}

// Graceful shutdown error handler
export function shutdownHandler(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  // Set a timeout for forceful shutdown
  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 30000); // 30 seconds
  
  // Clear the timeout if shutdown completes
  shutdownTimeout.unref();
  
  return shutdownTimeout;
}