import { Express } from 'express';
import { rateLimitMiddleware } from './rate-limit.middleware';
import { authMiddleware } from './auth.middleware';
import { validationMiddleware } from './validation.middleware';
import { corsMiddleware } from './cors.middleware';
import { securityMiddleware } from './security.middleware';

export function setupMiddleware(app: Express) {
  // Apply global middleware
  app.use(securityMiddleware);
  app.use(corsMiddleware);
  app.use(rateLimitMiddleware.global);
  
  // Auth middleware is applied per-route
  // Validation middleware is applied per-route
}

export {
  authMiddleware,
  validationMiddleware,
  rateLimitMiddleware,
  corsMiddleware,
  securityMiddleware,
};