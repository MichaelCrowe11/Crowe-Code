#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Running database migrations...\n');

// Set the production database URL
process.env.DATABASE_URL = process.env.DATABASE_URL ||
  'postgres://postgres:Bl2lvS9zGPtV5RY@crowecode-db.flycast:5432/crowecode_platform?sslmode=disable';

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Deploy migrations
  console.log('\n🔄 Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('\n✅ Migrations deployed successfully!');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}