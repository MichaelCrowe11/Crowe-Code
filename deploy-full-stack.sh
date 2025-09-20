#!/bin/bash

# ============================================
# CROWE LOGIC PLATFORM - FULL STACK DEPLOYMENT
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🚀 CROWE LOGIC PLATFORM DEPLOYMENT${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if domain is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide your domain name${NC}"
    echo "Usage: ./deploy-full-stack.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ssl backups uploads credentials migrations workspace/node_modules

# Update nginx config with actual domain
echo -e "${YELLOW}Configuring domain...${NC}"
sed -i "s/yourdomain.com/$DOMAIN/g" nginx-production.conf

# Create environment file if not exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Creating production environment file...${NC}"
    cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Database
DB_PASSWORD=$(openssl rand -base64 16)
DATABASE_URL=postgresql://crowe:\${DB_PASSWORD}@postgres:5432/crowe_platform

# Redis
REDIS_PASSWORD=$(openssl rand -base64 16)
REDIS_URL=redis://:\${REDIS_PASSWORD}@redis:6379

# Add your API keys here
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_ACCESS_TOKEN=

# Oracle (if needed)
ORACLE_DB_USER=
ORACLE_DB_PASSWORD=
ORACLE_DB_CONNECTION_STRING=
EOF
    echo -e "${GREEN}✓ Created .env.production - Please add your API keys${NC}"
fi

# Generate SSL certificates with Let's Encrypt
echo -e "${YELLOW}Setting up SSL certificates...${NC}"
if [ ! -f ssl/fullchain.pem ]; then
    echo -e "${YELLOW}Generating SSL certificates with Let's Encrypt...${NC}"
    docker run -it --rm \
        -v $(pwd)/ssl:/etc/letsencrypt \
        -v $(pwd)/ssl:/var/lib/letsencrypt \
        -p 80:80 \
        certbot/certbot certonly \
        --standalone \
        --agree-tos \
        --email admin@$DOMAIN \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    # Copy certificates to ssl directory
    cp ssl/live/$DOMAIN/fullchain.pem ssl/
    cp ssl/live/$DOMAIN/privkey.pem ssl/
else
    echo -e "${GREEN}✓ SSL certificates already exist${NC}"
fi

# Build the application
echo -e "${YELLOW}Building application...${NC}"
docker-compose -f docker-compose.production.yml build

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose -f docker-compose.production.yml up -d postgres redis

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL...${NC}"
sleep 10

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f docker-compose.production.yml run --rm migrate

# Start all services
echo -e "${YELLOW}Starting all services...${NC}"
docker-compose -f docker-compose.production.yml up -d

# Show status
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Services running:${NC}"
docker-compose -f docker-compose.production.yml ps
echo ""
echo -e "${GREEN}Your application is now available at:${NC}"
echo -e "  ${GREEN}https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Important next steps:${NC}"
echo "1. Update .env.production with your API keys"
echo "2. Configure your DNS to point to this server's IP"
echo "3. Set up automated backups (already configured to run daily)"
echo "4. Monitor logs: docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:     docker-compose -f docker-compose.production.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.production.yml down"
echo "  Restart:       docker-compose -f docker-compose.production.yml restart"
echo "  Backup DB:     docker-compose -f docker-compose.production.yml exec postgres pg_dump -U crowe crowe_platform > backup.sql"
echo ""
echo -e "${GREEN}========================================${NC}"