#!/bin/bash

# Fly.io Deployment Script for Crowe Logic Platform
# This script handles the complete deployment process including database setup

set -e

echo "🚀 Deploying Crowe Logic Platform to Fly.io"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if fly CLI is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}Fly CLI not installed${NC}"
    echo "Install it from: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Configuration
APP_NAME="crowe-logic-platform"
REGION="iad"  # US East (Ashburn) - change as needed
ORG="personal"  # Change to your org

# Function to check if app exists
app_exists() {
    flyctl apps list | grep -q "$APP_NAME"
}

# Function to create secrets
create_secrets() {
    echo "Setting up secrets..."
    
    # Generate secure passwords if not provided
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    fi
    
    if [ -z "$NEXTAUTH_SECRET" ]; then
        NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    fi
    
    # Set secrets in Fly.io (safe version - only set vars that exist locally)
    set_secret() { [ -n "$2" ] && flyctl secrets set "$1=$2" --app "$APP_NAME" >/dev/null; }
    
    set_secret JWT_SECRET "$JWT_SECRET"
    set_secret NEXTAUTH_SECRET "$NEXTAUTH_SECRET"
    set_secret ANTHROPIC_API_KEY "$ANTHROPIC_API_KEY"
    set_secret REDIS_URL "$REDIS_URL"
    # DO NOT set DATABASE_URL here; it's set by `flyctl postgres attach`
    
    echo -e "${GREEN}Secrets configured${NC}"
}

# Step 1: Login to Fly.io
echo "Step 1: Authenticating with Fly.io..."
flyctl auth login

# Step 2: Create or configure app
if app_exists; then
    echo -e "${YELLOW}App $APP_NAME already exists${NC}"
else
    echo "Step 2: Creating Fly.io app..."
    flyctl apps create "$APP_NAME" --org "$ORG"
    echo -e "${GREEN}App created${NC}"
fi

# Step 3: Create PostgreSQL database
echo "Step 3: Setting up PostgreSQL database..."
if flyctl postgres list | grep -q "${APP_NAME}-db"; then
    echo -e "${YELLOW}Database already exists${NC}"
else
    flyctl postgres create \
        --name "${APP_NAME}-db" \
        --region "$REGION" \
        --initial-cluster-size 1 \
        --vm-size shared-cpu-1x \
        --volume-size 1
    
    # Attach database to app
    flyctl postgres attach "${APP_NAME}-db" --app "$APP_NAME"
    echo -e "${GREEN}PostgreSQL database created and attached${NC}"
fi

# Step 4: Create Redis instance
echo "Step 4: Setting up Redis cache..."
if flyctl redis list | grep -q "${APP_NAME}-redis"; then
    echo -e "${YELLOW}Redis already exists${NC}"
else
    flyctl redis create \
        --name "${APP_NAME}-redis" \
        --region "$REGION" \
        --no-replicas \
        --plan "Free"
    
    # Get Redis connection URL
    REDIS_URL=$(flyctl redis status "${APP_NAME}-redis" --json | jq -r '.connection_string')
    echo -e "${GREEN}Redis cache created${NC}"
fi

# Step 5: Create persistent volume for uploads
echo "Step 5: Creating persistent storage..."
if flyctl volumes list --app "$APP_NAME" | grep -q "crowe_data"; then
    echo -e "${YELLOW}Volume already exists${NC}"
else
    flyctl volumes create crowe_data \
        --app "$APP_NAME" \
        --region "$REGION" \
        --size 1
    echo -e "${GREEN}Persistent volume created${NC}"
fi

# Step 6: Set up secrets
echo "Step 6: Configuring secrets..."
create_secrets

# Step 7: Scale the app
echo "Step 7: Configuring scaling..."
flyctl scale vm shared-cpu-1x --memory 512 --app "$APP_NAME"
flyctl autoscale set min=1 max=3 --app "$APP_NAME"
echo -e "${GREEN}Scaling configured${NC}"

# Step 8: Deploy the application
echo "Step 8: Deploying application..."
flyctl deploy --app "$APP_NAME" --strategy rolling

# Step 9: Verify deployment
echo "Step 9: Verifying deployment..."
sleep 10  # Wait for app to start

APP_URL="https://${APP_NAME}.fly.dev"
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health" | grep -q "200"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🎉 Crowe Logic Platform is live at: $APP_URL"
    echo ""
    echo "📊 Monitoring:"
    echo "  - Logs: flyctl logs --app $APP_NAME"
    echo "  - Status: flyctl status --app $APP_NAME"
    echo "  - Metrics: flyctl dashboard metrics --app $APP_NAME"
    echo ""
    echo "🔧 Management:"
    echo "  - SSH: flyctl ssh console --app $APP_NAME"
    echo "  - Secrets: flyctl secrets list --app $APP_NAME"
    echo "  - Scale: flyctl scale show --app $APP_NAME"
else
    echo -e "${RED}❌ Deployment verification failed${NC}"
    echo "Check logs: flyctl logs --app $APP_NAME"
    exit 1
fi

# Step 10: Set up custom domain (optional)
read -p "Do you want to set up a custom domain? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your domain (e.g., croweos.com): " DOMAIN
    
    # Create certificate
    flyctl certs create "$DOMAIN" --app "$APP_NAME"
    
    echo ""
    echo "📝 Add these DNS records to your domain:"
    flyctl certs show "$DOMAIN" --app "$APP_NAME"
    
    echo ""
    echo "After adding DNS records, check status with:"
    echo "flyctl certs check $DOMAIN --app $APP_NAME"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}🚀 Deployment complete!${NC}"
echo "==========================================="

# Save deployment info
cat > .fly-deployment-info.txt << EOF
Deployment Information
======================
Date: $(date)
App Name: $APP_NAME
Region: $REGION
URL: $APP_URL
Database: ${APP_NAME}-db
Redis: ${APP_NAME}-redis
Volume: crowe_data

Commands:
- View logs: flyctl logs --app $APP_NAME
- SSH access: flyctl ssh console --app $APP_NAME
- View status: flyctl status --app $APP_NAME
- Open dashboard: flyctl dashboard --app $APP_NAME
- Destroy app: flyctl apps destroy $APP_NAME
EOF

echo "Deployment info saved to .fly-deployment-info.txt"
