import { Router } from 'express';
import { db } from '../services/database.service';
import { cache } from '../services/cache.service';
import { logger } from '../services/logger.service';
import os from 'os';
import { env } from '../config/environment';

export const healthRoutes = Router();

// Basic health check
healthRoutes.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed health check with dependencies
healthRoutes.get('/healthz', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown',
    },
    metrics: {
      memory: {},
      cpu: {},
    },
  };
  
  try {
    // Check database
    try {
      await db.query('SELECT 1');
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
      logger.error('Database health check failed:', error);
    }
    
    // Check Redis if configured
    if (cache.isEnabled()) {
      try {
        await cache.ping();
        health.checks.redis = 'healthy';
      } catch (error) {
        health.checks.redis = 'unhealthy';
        health.status = 'degraded';
        logger.error('Redis health check failed:', error);
      }
    } else {
      health.checks.redis = 'not_configured';
    }
    
    // Memory check
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = ((totalMem - freeMem) / totalMem) * 100;
    
    health.metrics.memory = {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      systemUsedPercent: Math.round(usedPercent),
    };
    
    if (usedPercent > 90) {
      health.checks.memory = 'critical';
      health.status = 'degraded';
    } else if (usedPercent > 75) {
      health.checks.memory = 'warning';
    } else {
      health.checks.memory = 'healthy';
    }
    
    // CPU metrics
    const cpus = os.cpus();
    const avgLoad = os.loadavg();
    health.metrics.cpu = {
      cores: cpus.length,
      model: cpus[0]?.model,
      loadAverage: {
        '1m': avgLoad[0],
        '5m': avgLoad[1],
        '15m': avgLoad[2],
      },
    };
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
    
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Readiness probe for deployments
healthRoutes.get('/ready', async (req, res) => {
  try {
    // Check if all required services are ready
    const checks = await Promise.all([
      db.query('SELECT 1').then(() => true).catch(() => false),
      cache.isEnabled() ? cache.ping().then(() => true).catch(() => false) : Promise.resolve(true),
    ]);
    
    const allReady = checks.every(check => check);
    
    if (allReady) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false });
    }
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});

// Liveness probe
healthRoutes.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

// Metrics endpoint for monitoring
healthRoutes.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        pid: process.pid,
        version: process.version,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
      system: {
        platform: os.platform(),
        release: os.release(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
        loadAverage: os.loadavg(),
      },
      application: {
        environment: env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
      },
    };
    
    // Add database metrics if available
    if (db.getMetrics) {
      metrics.database = await db.getMetrics();
    }
    
    // Add cache metrics if available
    if (cache.isEnabled() && cache.getMetrics) {
      metrics.cache = await cache.getMetrics();
    }
    
    res.json(metrics);
  } catch (error) {
    logger.error('Metrics collection error:', error);
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});