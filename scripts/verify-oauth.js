import logger from '../src/lib/logger';
#!/usr/bin/env node

logger.info('🔍 Verifying OAuth Configuration...\n');

const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const checkEnvVars = () => {
  logger.info('📋 Required OAuth Environment Variables:\n');

  let allPresent = true;

  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value && value.length > 0;

    if (isSet) {
      // Mask sensitive values
      let displayValue = value;
      if (varName.includes('SECRET')) {
        displayValue = value.substring(0, 4) + '****' + value.substring(value.length - 4);
      } else if (varName.includes('CLIENT_ID')) {
        displayValue = value.substring(0, 8) + '...';
      }

      logger.info(`✅ ${varName}: ${displayValue}`);
    } else {
      logger.info(`❌ ${varName}: NOT SET`);
      allPresent = false;
    }
  });

  logger.info('\n📌 OAuth Callback URLs to configure:\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://crowecode.com';

  logger.info('GitHub OAuth App Settings:');
  logger.info(`  Homepage URL: ${baseUrl}`);
  logger.info(`  Authorization callback URL: ${baseUrl}/api/auth/callback/github`);

  logger.info('\nGoogle OAuth 2.0 Client Settings:');
  logger.info(`  Authorized JavaScript origins: ${baseUrl}`);
  logger.info(`  Authorized redirect URIs: ${baseUrl}/api/auth/callback/google`);

  if (baseUrl.includes('localhost')) {
    logger.info('\n⚠️  Warning: Using localhost URLs. Update for production!');
  }

  logger.info('\n🚀 Production URLs for crowecode.com:');
  logger.info('  - https://crowecode.com');
  logger.info('  - https://www.crowecode.com');
  logger.info('  - https://crowecode-main.fly.dev (Fly.io default)');

  return allPresent;
};

const main = () => {
  const allSet = checkEnvVars();

  if (allSet) {
    logger.info('\n✨ All OAuth environment variables are configured!');
  } else {
    logger.info('\n⚠️  Some OAuth environment variables are missing.');
    logger.info('Set them in Fly.io dashboard or using: fly secrets set KEY=value');
    process.exit(1);
  }
};

main();