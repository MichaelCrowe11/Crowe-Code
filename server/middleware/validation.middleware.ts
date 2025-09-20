import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { logger } from '../services/logger.service';

// Validation middleware factory
export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn({
          requestId: req.id,
          validation: 'failed',
          errors,
        });
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
}

// Query parameter validation
export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: errors,
        });
      }
      next(error);
    }
  };
}

// Params validation
export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: 'Invalid parameters',
          details: errors,
        });
      }
      next(error);
    }
  };
}

// Common validation schemas
export const schemas = {
  // Authentication
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  
  register: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
  
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
  
  // ID parameter
  idParam: z.object({
    id: z.coerce.number().int().positive(),
  }),
  
  // Search
  search: z.object({
    q: z.string().min(1).max(200),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
  
  // Lab notebook entry
  labEntry: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(50000),
    category: z.enum(['observation', 'experiment', 'protocol', 'result']).optional(),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
  
  // Batch creation
  batch: z.object({
    batchCode: z.string().min(1).max(50),
    species: z.string().min(1).max(100),
    substrate: z.string().min(1).max(200),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
    environmentalData: z.object({
      temperature: z.number().optional(),
      humidity: z.number().optional(),
      co2: z.number().optional(),
    }).optional(),
  }),
  
  // Message
  message: z.object({
    content: z.string().min(1).max(10000),
    conversationId: z.number().int().positive().optional(),
  }),
};

// Sanitization utilities
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production use a library like DOMPurify
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeSql(input: string): string {
  // Basic SQL injection prevention - Drizzle ORM handles this, but extra safety
  return input.replace(/['";\\]/g, '');
}

export const validationMiddleware = {
  validate,
  validateQuery,
  validateParams,
  schemas,
  sanitizeHtml,
  sanitizeSql,
};