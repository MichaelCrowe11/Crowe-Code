import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env, features, security } from "./config/environment";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { logger } from "./services/logger.service";
import { initializeServices } from "./services";
import { errorHandler } from "./middleware/error.middleware";

// Initialize express app
const app = express();
const server = createServer(app);

// Trust proxy for deployment behind IIS/nginx
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    }
  } : false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression
app.use(compression());

// Cookie parser
app.use(cookieParser());

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
  
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  req.id = requestId;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
});

// Initialize application
async function initialize() {
  try {
    // Initialize services (database, redis, etc.)
    await initializeServices();
    
    // Setup middleware
    setupMiddleware(app);
    
    // Setup routes
    await setupRoutes(app);
    
    // Error handling (must be last)
    app.use(errorHandler);
    
    // Setup Vite in development or serve static in production
    if (env.NODE_ENV === 'development') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    
    // Start server
    const port = env.PORT;
    const host = env.HOST;
    
    server.listen(port, host, () => {
      logger.info(`🚀 Server running on http://${host}:${port}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`✨ Features enabled: ${Object.entries(features).filter(([, v]) => v).map(([k]) => k).join(', ')}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

async function shutdown() {
  logger.info('Shutting down gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: any;
    }
  }
}

// Start the application
initialize().catch(error => {
  console.error('Fatal error during initialization:', error);
  process.exit(1);
});