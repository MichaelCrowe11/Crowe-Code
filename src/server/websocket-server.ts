/**
 * Standalone WebSocket Server for Terminal
 * Can be run alongside Next.js application
 */

import { terminalWebSocketServer } from '../lib/websocket/terminal-websocket';
import logger from '../lib/logger';

const WS_PORT = parseInt(process.env.WS_PORT || '3002');

logger.info('Starting CroweCode WebSocket Server...');
logger.info(`Port: ${WS_PORT}`);
logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Initialize WebSocket server
terminalWebSocketServer.initialize(WS_PORT);

// Health check endpoint (if needed for monitoring)
if (process.env.ENABLE_WS_HEALTH_CHECK === 'true') {
  const http = require('http');
  const healthServer = http.createServer((req: any, res: any) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        sessions: terminalWebSocketServer.getSessionCount(),
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  const HEALTH_PORT = parseInt(process.env.WS_HEALTH_PORT || '3003');
  healthServer.listen(HEALTH_PORT, () => {
    logger.info(`Health check endpoint available at http://localhost:${HEALTH_PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('\nShutting down WebSocket server gracefully...');
  terminalWebSocketServer.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('\nShutting down WebSocket server gracefully...');
  terminalWebSocketServer.shutdown();
  process.exit(0);
});

logger.info('WebSocket server is running and ready for connections');