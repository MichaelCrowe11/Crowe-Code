#!/bin/bash

# Railway Deployment Script for Crowe Logic Platform
# Simple deployment with managed PostgreSQL and Redis

set -e

echo "🚂 Deploying Crowe Logic Platform to Railway"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI not installed${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

# Step 1: Login to Railway
echo "Step 1: Authenticating with Railway..."
railway login

# Step 2: Initialize project
echo "Step 2: Initializing Railway project..."
if [ ! -f ".railway/config.json" ]; then
    railway init
    echo -e "${GREEN}Project initialized${NC}"
else
    echo -e "${YELLOW}Project already initialized${NC}"
fi

# Step 3: Add PostgreSQL
echo "Step 3: Adding PostgreSQL database..."
railway add postgresql
echo -e "${GREEN}PostgreSQL added${NC}"

# Step 4: Add Redis
echo "Step 4: Adding Redis cache..."
railway add redis
echo -e "${GREEN}Redis added${NC}"

# Step 5: Set environment variables
echo "Step 5: Configuring environment variables..."

# Generate secrets if not provided
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
fi

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NEXT_PUBLIC_APP_URL="\${{RAILWAY_STATIC_URL}}"

# Set API keys if provided
if [ -n "$ANTHROPIC_API_KEY" ]; then
    railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
fi

# Feature flags
railway variables set ENABLE_QUANTUM_MODULE=true
railway variables set ENABLE_ML_LAB=true
railway variables set ENABLE_AGRICULTURE=true
railway variables set ENABLE_MYCOLOGY_LIMS=true

echo -e "${GREEN}Environment variables configured${NC}"

# Step 6: Deploy
echo "Step 6: Deploying application..."
railway up

# Step 7: Get deployment URL
echo "Step 7: Getting deployment URL..."
DEPLOYMENT_URL=$(railway status --json | jq -r '.url')

if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🎉 Crowe Logic Platform is live at: $DEPLOYMENT_URL"
    echo ""
    echo "📊 Management:"
    echo "  - Dashboard: railway open"
    echo "  - Logs: railway logs"
    echo "  - Variables: railway variables"
    echo "  - Database: railway connect postgresql"
else
    echo -e "${RED}❌ Failed to get deployment URL${NC}"
    echo "Check status with: railway status"
fi

# Step 8: Set up custom domain (optional)
read -p "Do you want to set up a custom domain? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your domain (e.g., croweos.com): " DOMAIN
    railway domain add "$DOMAIN"
    
    echo ""
    echo "📝 Add these DNS records to your domain:"
    railway domain
fi

echo ""
echo "==========================================="
echo -e "${GREEN}🚂 Railway deployment complete!${NC}"
echo "==========================================="

# Open dashboard
read -p "Open Railway dashboard? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    railway open
fi
