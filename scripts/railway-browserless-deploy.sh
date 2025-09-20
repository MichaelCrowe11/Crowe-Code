#!/bin/bash

# Railway Browserless Deployment Script
# No browser required - uses Railway API token

echo "========================================"
echo "  Railway Browserless Deployment"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to create Railway token
setup_railway_token() {
    echo -e "${YELLOW}Setting up Railway API token...${NC}"

    if [ -z "$RAILWAY_TOKEN" ]; then
        echo ""
        echo "To deploy without a browser, you need a Railway API token."
        echo ""
        echo -e "${YELLOW}Steps to get your token:${NC}"
        echo "1. Go to: https://railway.app/account/tokens"
        echo "2. Create a new token"
        echo "3. Copy the token value"
        echo ""
        read -p "Enter your Railway API token: " RAILWAY_TOKEN

        # Export for current session
        export RAILWAY_TOKEN="$RAILWAY_TOKEN"

        # Optionally save to .env file
        echo "RAILWAY_TOKEN=$RAILWAY_TOKEN" >> .env.local
        echo -e "${GREEN}✓ Token configured${NC}"
    else
        echo -e "${GREEN}✓ Railway token found${NC}"
    fi
}

# Function to deploy using API
deploy_with_api() {
    echo -e "${YELLOW}Deploying to Railway via API...${NC}"

    # Create deployment using Railway CLI with token
    npx railway up --detach

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Deployment initiated successfully!${NC}"
    else
        echo -e "${RED}✗ Deployment failed${NC}"
        exit 1
    fi
}

# Main execution
setup_railway_token
deploy_with_api

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Monitor your deployment:"
echo "  npx railway logs"
echo "  npx railway status"