import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { env } from '../config/environment';

// Store for tracking attempts (use Redis in production)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

// Global rate limit
const global = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 100 : 1000, // requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/api/healthz';
  },
  keyGenerator: (req) => {
    // Use X-Forwarded-For in production (behind proxy)
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// Strict rate limit for auth endpoints
const auth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limit for API endpoints
const api = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stripe webhook endpoint (more permissive)
const webhook = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Webhook rate limit exceeded.',
});

// AI endpoints (expensive operations)
const ai = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // 10 AI requests per minute
  message: 'AI service rate limit exceeded. Please wait before making another request.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Custom rate limiter for login attempts with exponential backoff
export function loginAttemptLimiter(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime?: Date } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);
  
  // Clean up old entries
  if (attempt && now > attempt.resetTime) {
    loginAttempts.delete(identifier);
  }
  
  const current = loginAttempts.get(identifier) || { count: 0, resetTime: now + 15 * 60 * 1000 };
  
  if (current.count >= 5) {
    // Calculate exponential backoff
    const lockoutMinutes = Math.min(Math.pow(2, current.count - 4) * 15, 1440); // Max 24 hours
    const resetTime = now + lockoutMinutes * 60 * 1000;
    
    if (now < current.resetTime) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(current.resetTime),
      };
    }
  }
  
  // Increment attempt count
  current.count++;
  loginAttempts.set(identifier, current);
  
  return {
    allowed: true,
    remainingAttempts: Math.max(0, 5 - current.count),
  };
}

// Clear login attempts on successful login
export function clearLoginAttempts(identifier: string) {
  loginAttempts.delete(identifier);
}

// Middleware to check for brute force attacks
export function bruteForceProtection(req: Request, res: Response, next: Function) {
  const identifier = req.body.email || req.ip;
  const check = loginAttemptLimiter(identifier);
  
  if (!check.allowed) {
    return res.status(429).json({
      error: 'Too many failed login attempts',
      resetTime: check.resetTime,
    });
  }
  
  // Add remaining attempts to response headers
  res.setHeader('X-RateLimit-Remaining-Attempts', check.remainingAttempts.toString());
  next();
}

export const rateLimitMiddleware = {
  global,
  auth,
  api,
  webhook,
  ai,
  bruteForceProtection,
};