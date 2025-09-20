import { Express } from 'express';
import { authRoutes } from './auth.routes';
import { healthRoutes } from './health.routes';
import { knowledgeRoutes } from './knowledge.routes';
import { labRoutes } from './lab.routes';
import { paymentRoutes } from './payment.routes';
import { userRoutes } from './user.routes';
import { aiRoutes } from './ai.routes';
import { logger } from '../services/logger.service';

export async function setupRoutes(app: Express) {
  logger.info('Setting up routes...');
  
  // Health checks (no auth required)
  app.use('/api', healthRoutes);
  
  // Authentication routes
  app.use('/api/auth', authRoutes);
  
  // Protected routes
  app.use('/api/users', userRoutes);
  app.use('/api/knowledge', knowledgeRoutes);
  app.use('/api/lab', labRoutes);
  app.use('/api/ai', aiRoutes);
  
  // Payment routes (mixed auth)
  app.use('/api/payments', paymentRoutes);
  
  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl,
    });
  });
  
  logger.info('Routes setup complete');
}