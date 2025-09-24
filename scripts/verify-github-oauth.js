import logger from '../src/lib/logger';
/**
 * Script to verify GitHub OAuth configuration
 */

logger.info('GitHub OAuth Configuration Check\n');
logger.info('================================\n');

// Check environment variables
const requiredVars = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://crowecode-main.fly.dev',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
};

logger.info('Environment Variables:');
Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    logger.info(`✅ ${key}: ${key.includes('SECRET') ? '***' + value.slice(-4) : value}`);
  } else {
    logger.info(`❌ ${key}: NOT SET`);
  }
});

logger.info('\n\nRequired GitHub OAuth App Settings:');
logger.info('====================================');
logger.info('Homepage URL: https://crowecode-main.fly.dev');
logger.info('Authorization callback URL: https://crowecode-main.fly.dev/api/auth/callback/github');

logger.info('\n\nTo update your GitHub OAuth App:');
logger.info('1. Go to: https://github.com/settings/developers');
logger.info('2. Click on your OAuth App');
logger.info('3. Update the Authorization callback URL to EXACTLY:');
logger.info('   https://crowecode-main.fly.dev/api/auth/callback/github');
logger.info('4. Make sure there are NO trailing slashes');
logger.info('5. Save the changes');

logger.info('\n\nCommon Issues:');
logger.info('==============');
logger.info('1. Callback URL mismatch (must match EXACTLY)');
logger.info('2. Client ID/Secret incorrect');
logger.info('3. OAuth App disabled or suspended');
logger.info('4. Rate limiting from GitHub');

logger.info('\n\nTest URLs:');
logger.info('==========');
logger.info('Direct GitHub OAuth: https://crowecode-main.fly.dev/api/auth/signin/github');
logger.info('Test Page: https://crowecode-main.fly.dev/auth/test');