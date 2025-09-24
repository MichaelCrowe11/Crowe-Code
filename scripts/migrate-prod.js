import logger from '../src/lib/logger';
#!/usr/bin/env node

const { execSync } = require('child_process');

logger.info('🚀 Running database migrations...\n');

// Set the production database URL
process.env.DATABASE_URL = process.env.DATABASE_URL ||
  'postgres://postgres:Bl2lvS9zGPtV5RY@crowecode-db.flycast:5432/crowecode_platform?sslmode=disable';

try {
  // Generate Prisma client
  logger.info('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Deploy migrations
  logger.info('\n🔄 Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  logger.info('\n✅ Migrations deployed successfully!');
} catch (error) {
  logger.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}