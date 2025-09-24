#!/bin/bash

# Script to set OAuth secrets for Fly.io deployment
# Usage: ./scripts/setup-oauth-secrets.sh

echo "======================================"
echo "Setting up OAuth secrets for Fly.io"
echo "======================================"
echo ""

APP_NAME="crowecode-main"

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "Error: Fly CLI not installed"
    echo "Install it from: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

echo "This script will help you set up OAuth providers for your app."
echo "You'll need to have created OAuth apps on GitHub and Google first."
echo ""

# GitHub OAuth Setup
echo "=== GitHub OAuth Setup ==="
echo "1. Go to: https://github.com/settings/developers"
echo "2. Click 'New OAuth App'"
echo "3. Use these settings:"
echo "   - Application name: CroweCode Platform"
echo "   - Homepage URL: https://crowecode-main.fly.dev"
echo "   - Authorization callback URL: https://crowecode-main.fly.dev/api/auth/callback/github"
echo ""
read -p "Enter your GitHub Client ID: " GITHUB_CLIENT_ID
read -s -p "Enter your GitHub Client Secret: " GITHUB_CLIENT_SECRET
echo ""

# Google OAuth Setup
echo ""
echo "=== Google OAuth Setup ==="
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Create a new OAuth 2.0 Client ID"
echo "3. Add these authorized redirect URIs:"
echo "   - https://crowecode-main.fly.dev/api/auth/callback/google"
echo "   - https://crowecode.com/api/auth/callback/google"
echo "   - https://www.crowecode.com/api/auth/callback/google"
echo ""
read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID
read -s -p "Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Confirm before setting
echo ""
echo "Ready to set the following secrets for app: $APP_NAME"
echo "- GITHUB_CLIENT_ID"
echo "- GITHUB_CLIENT_SECRET"
echo "- GOOGLE_CLIENT_ID"
echo "- GOOGLE_CLIENT_SECRET"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting secrets..."

    # Set GitHub secrets
    flyctl secrets set \
        GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID" \
        GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET" \
        --app "$APP_NAME"

    # Set Google secrets
    flyctl secrets set \
        GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
        GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
        --app "$APP_NAME"

    # Update NextAuth URL and Secret for staging (Fly)
    if ! command -v openssl &> /dev/null; then
        echo "OpenSSL not found; please ensure NEXTAUTH_SECRET is set separately."
        flyctl secrets set \
            NEXTAUTH_URL="https://crowecode-main.fly.dev" \
            --app "$APP_NAME"
    else
        GENERATED_SECRET=$(openssl rand -base64 32)
        flyctl secrets set \
            NEXTAUTH_URL="https://crowecode-main.fly.dev" \
            NEXTAUTH_SECRET="$GENERATED_SECRET" \
            --app "$APP_NAME"
    fi

    # Optional: Set production URL as well
    read -p "Also set production NEXTAUTH_URL to https://www.crowecode.com? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ -z "$GENERATED_SECRET" ]]; then
            GENERATED_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "")
        fi
        if [[ -n "$GENERATED_SECRET" ]]; then
            flyctl secrets set \
                NEXTAUTH_URL="https://www.crowecode.com" \
                NEXTAUTH_SECRET="$GENERATED_SECRET" \
                --app "$APP_NAME"
        else
            flyctl secrets set \
                NEXTAUTH_URL="https://www.crowecode.com" \
                --app "$APP_NAME"
            echo "(NEXTAUTH_SECRET unchanged; set it manually if needed)"
        fi
    fi

    echo ""
    echo "✅ OAuth secrets have been set successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Redeploy your app: flyctl deploy --app $APP_NAME"
    echo "2. Test sign-in at: https://crowecode-main.fly.dev/auth/signin"
    echo ""
    echo "OAuth Callback URLs to verify:"
    echo "- GitHub: https://crowecode-main.fly.dev/api/auth/callback/github"
    echo "- Google: https://crowecode-main.fly.dev/api/auth/callback/google"
else
    echo "Cancelled. No secrets were set."
fi