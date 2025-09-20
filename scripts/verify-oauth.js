#!/usr/bin/env node

console.log('🔍 Verifying OAuth Configuration...\n');

const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const checkEnvVars = () => {
  console.log('📋 Required OAuth Environment Variables:\n');

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

      console.log(`✅ ${varName}: ${displayValue}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      allPresent = false;
    }
  });

  console.log('\n📌 OAuth Callback URLs to configure:\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://crowecode.com';

  console.log('GitHub OAuth App Settings:');
  console.log(`  Homepage URL: ${baseUrl}`);
  console.log(`  Authorization callback URL: ${baseUrl}/api/auth/callback/github`);

  console.log('\nGoogle OAuth 2.0 Client Settings:');
  console.log(`  Authorized JavaScript origins: ${baseUrl}`);
  console.log(`  Authorized redirect URIs: ${baseUrl}/api/auth/callback/google`);

  if (baseUrl.includes('localhost')) {
    console.log('\n⚠️  Warning: Using localhost URLs. Update for production!');
  }

  console.log('\n🚀 Production URLs for crowecode.com:');
  console.log('  - https://crowecode.com');
  console.log('  - https://www.crowecode.com');
  console.log('  - https://crowecode-main.fly.dev (Fly.io default)');

  return allPresent;
};

const main = () => {
  const allSet = checkEnvVars();

  if (allSet) {
    console.log('\n✨ All OAuth environment variables are configured!');
  } else {
    console.log('\n⚠️  Some OAuth environment variables are missing.');
    console.log('Set them in Fly.io dashboard or using: fly secrets set KEY=value');
    process.exit(1);
  }
};

main();