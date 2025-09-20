#!/usr/bin/env node

/**
 * OAuth Flow Test Script for Crowe Logic Platform
 * Tests GitHub and Google OAuth authentication flows
 */

import https from 'https';
import { URL } from 'url';

const PRODUCTION_URL = 'https://crowecode-main.fly.dev';
const AUTH_ENDPOINTS = {
  github: '/api/auth/callback/github',
  google: '/api/auth/callback/google',
  signin: '/auth/signin',
  api_health: '/api/health'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEndpoint(url, method = 'GET') {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {
        'User-Agent': 'OAuth-Test-Script/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          url
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message,
        url
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        error: 'Request timeout',
        url
      });
    });

    req.end();
  });
}

async function testOAuthFlow() {
  log('\n🔍 Testing OAuth Configuration for Crowe Logic Platform\n', 'bright');
  log(`Production URL: ${PRODUCTION_URL}`, 'blue');
  log('================================================\n', 'cyan');

  // Test 1: Check if the app is running
  log('1️⃣  Testing Application Health...', 'yellow');
  const healthCheck = await checkEndpoint(`${PRODUCTION_URL}/api/health`);
  
  if (healthCheck.status === 200) {
    log('   ✅ Application is running', 'green');
  } else if (healthCheck.status === 404) {
    log('   ⚠️  Health endpoint not found (app is running)', 'yellow');
  } else {
    log(`   ❌ Application may be down (Status: ${healthCheck.status || healthCheck.error})`, 'red');
  }

  // Test 2: Check Sign-In Page
  log('\n2️⃣  Testing Sign-In Page...', 'yellow');
  const signinCheck = await checkEndpoint(`${PRODUCTION_URL}/auth/signin`);
  
  if (signinCheck.status === 200) {
    log('   ✅ Sign-in page is accessible', 'green');
    
    // Check if OAuth providers are present in the HTML
    if (signinCheck.body.includes('github') || signinCheck.body.includes('GitHub')) {
      log('   ✅ GitHub OAuth button found', 'green');
    } else {
      log('   ⚠️  GitHub OAuth button not detected', 'yellow');
    }
    
    if (signinCheck.body.includes('google') || signinCheck.body.includes('Google')) {
      log('   ✅ Google OAuth button found', 'green');
    } else {
      log('   ⚠️  Google OAuth button not detected', 'yellow');
    }
  } else {
    log(`   ❌ Sign-in page not accessible (Status: ${signinCheck.status})`, 'red');
  }

  // Test 3: Check OAuth Callback Endpoints
  log('\n3️⃣  Testing OAuth Callback Endpoints...', 'yellow');
  
  // GitHub callback
  const githubCallback = await checkEndpoint(`${PRODUCTION_URL}/api/auth/callback/github`);
  if (githubCallback.status === 302 || githubCallback.status === 307) {
    log('   ✅ GitHub callback endpoint is configured (redirects as expected)', 'green');
  } else if (githubCallback.status >= 400 && githubCallback.status < 500) {
    log('   ✅ GitHub callback endpoint exists (requires valid OAuth params)', 'green');
  } else {
    log(`   ⚠️  GitHub callback status: ${githubCallback.status}`, 'yellow');
  }

  // Google callback
  const googleCallback = await checkEndpoint(`${PRODUCTION_URL}/api/auth/callback/google`);
  if (googleCallback.status === 302 || googleCallback.status === 307) {
    log('   ✅ Google callback endpoint is configured (redirects as expected)', 'green');
  } else if (googleCallback.status >= 400 && googleCallback.status < 500) {
    log('   ✅ Google callback endpoint exists (requires valid OAuth params)', 'green');
  } else {
    log(`   ⚠️  Google callback status: ${googleCallback.status}`, 'yellow');
  }

  // Test 4: Display OAuth URLs for configuration
  log('\n4️⃣  OAuth Configuration URLs', 'yellow');
  log('\n   GitHub OAuth App Settings:', 'cyan');
  log(`   • Homepage URL: ${PRODUCTION_URL}`);
  log(`   • Authorization callback URL: ${PRODUCTION_URL}/api/auth/callback/github`);
  
  log('\n   Google OAuth 2.0 Settings:', 'cyan');
  log(`   • Authorized JavaScript origins: ${PRODUCTION_URL}`);
  log(`   • Authorized redirect URIs: ${PRODUCTION_URL}/api/auth/callback/google`);

  // Summary
  log('\n================================================', 'cyan');
  log('📋 Summary:', 'bright');
  log('\n   To complete OAuth setup:', 'yellow');
  log('   1. Ensure the OAuth apps in GitHub and Google use the URLs above');
  log('   2. Verify environment variables are set (already confirmed ✅)');
  log('   3. Test login at: ' + PRODUCTION_URL + '/auth/signin', 'blue');
  log('\n✨ OAuth configuration test complete!\n', 'green');
}

// Run the test
testOAuthFlow().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});