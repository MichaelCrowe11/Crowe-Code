#!/bin/bash

echo "🔧 CroweCode OAuth Fix Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_NAME="crowecode-main"
PROD_URL="https://crowecode-main.fly.dev"

echo -e "${YELLOW}Current OAuth Configuration:${NC}"
echo ""

# Check current settings
echo "📍 Checking Fly.io secrets..."
fly secrets list --app $APP_NAME | grep -E "GITHUB_|GOOGLE_|NEXTAUTH"

echo ""
echo -e "${YELLOW}Required OAuth Settings:${NC}"
echo ""

echo -e "${GREEN}GitHub OAuth App Settings:${NC}"
echo "1. Go to: https://github.com/settings/developers"
echo "2. Click on your OAuth App (or create new)"
echo "3. Set these EXACT values:"
echo "   - Homepage URL: $PROD_URL"
echo "   - Authorization callback URL: $PROD_URL/api/auth/callback/github"
echo ""

echo -e "${GREEN}Google OAuth 2.0 Settings:${NC}"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Click on your OAuth 2.0 Client (or create new)"
echo "3. Add these Authorized redirect URIs:"
echo "   - $PROD_URL/api/auth/callback/google"
echo ""

echo -e "${YELLOW}Fixing Fly.io Secrets:${NC}"
echo ""

# Update NEXTAUTH_URL to ensure it's correct
echo "Setting NEXTAUTH_URL to production URL..."
fly secrets set NEXTAUTH_URL="$PROD_URL" --app $APP_NAME

echo ""
echo -e "${GREEN}✓ NEXTAUTH_URL updated${NC}"
echo ""

echo -e "${YELLOW}Quick Test URLs:${NC}"
echo ""
echo "1. OAuth Test Page: $PROD_URL/oauth-test"
echo "2. Debug Endpoint: $PROD_URL/api/auth/debug-oauth"
echo "3. Sign In Page: $PROD_URL/api/auth/signin"
echo ""

echo -e "${YELLOW}Troubleshooting Steps:${NC}"
echo ""
echo "1. Ensure GitHub OAuth App callback URL is EXACTLY:"
echo "   $PROD_URL/api/auth/callback/github"
echo ""
echo "2. Ensure Google OAuth redirect URI is EXACTLY:"
echo "   $PROD_URL/api/auth/callback/google"
echo ""
echo "3. Clear browser cookies for the domain"
echo "4. Try incognito/private browsing mode"
echo "5. Check browser console for errors"
echo ""

echo -e "${GREEN}🚀 OAuth fix script complete!${NC}"
echo ""
echo "Visit $PROD_URL/oauth-test to test authentication"