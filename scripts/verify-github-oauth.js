/**
 * Script to verify GitHub OAuth configuration
 */

console.log('GitHub OAuth Configuration Check\n');
console.log('================================\n');

// Check environment variables
const requiredVars = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://crowecode-main.fly.dev',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
};

console.log('Environment Variables:');
Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('SECRET') ? '***' + value.slice(-4) : value}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

console.log('\n\nRequired GitHub OAuth App Settings:');
console.log('====================================');
console.log('Homepage URL: https://crowecode-main.fly.dev');
console.log('Authorization callback URL: https://crowecode-main.fly.dev/api/auth/callback/github');

console.log('\n\nTo update your GitHub OAuth App:');
console.log('1. Go to: https://github.com/settings/developers');
console.log('2. Click on your OAuth App');
console.log('3. Update the Authorization callback URL to EXACTLY:');
console.log('   https://crowecode-main.fly.dev/api/auth/callback/github');
console.log('4. Make sure there are NO trailing slashes');
console.log('5. Save the changes');

console.log('\n\nCommon Issues:');
console.log('==============');
console.log('1. Callback URL mismatch (must match EXACTLY)');
console.log('2. Client ID/Secret incorrect');
console.log('3. OAuth App disabled or suspended');
console.log('4. Rate limiting from GitHub');

console.log('\n\nTest URLs:');
console.log('==========');
console.log('Direct GitHub OAuth: https://crowecode-main.fly.dev/api/auth/signin/github');
console.log('Test Page: https://crowecode-main.fly.dev/auth/test');