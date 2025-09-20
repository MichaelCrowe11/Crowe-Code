import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  HOST: z.string().default('127.0.0.1'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // External APIs
  ANTHROPIC_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  
  // Application
  APP_URL: z.string().url().default('http://localhost:5000'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Redis (optional)
  REDIS_URL: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment
const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envResult.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = envResult.data;

// Type-safe environment access
export type Environment = z.infer<typeof envSchema>;

// Feature flags based on environment
export const features = {
  aiInsights: Boolean(env.ANTHROPIC_API_KEY),
  voiceChat: Boolean(env.ELEVENLABS_API_KEY),
  payments: Boolean(env.STRIPE_SECRET_KEY),
  oauth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  monitoring: Boolean(env.SENTRY_DSN),
  caching: Boolean(env.REDIS_URL),
};

// Security settings
export const security = {
  bcryptRounds: env.NODE_ENV === 'production' ? 12 : 10,
  cookieSecure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};