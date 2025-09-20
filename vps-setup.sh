#!/bin/bash

# ============================================
# CROWECODE VPS SETUP SCRIPT
# For Namecheap VPS - Ubuntu 20.04/22.04
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🚀 CROWECODE VPS SETUP${NC}"
echo -e "${GREEN}========================================${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install essential packages
echo -e "${YELLOW}Installing essential packages...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    nginx \
    certbot \
    python3-certbot-nginx \
    build-essential \
    software-properties-common

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create app directory
echo -e "${YELLOW}Creating application directory...${NC}"
mkdir -p /var/www/crowecode
cd /var/www/crowecode

# Clone repository
echo -e "${YELLOW}Cloning repository...${NC}"
if [ ! -d ".git" ]; then
    git clone https://github.com/yourusername/crowe-logic-platform.git .
else
    git pull origin main
fi

# Create environment file
echo -e "${YELLOW}Creating environment configuration...${NC}"
if [ ! -f .env.production ]; then
    cat > .env.production << 'EOF'
# Production Environment
NODE_ENV=production
NEXTAUTH_URL=https://crowecode.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Database
DB_PASSWORD=$(openssl rand -base64 16)
DATABASE_URL=postgresql://crowe:${DB_PASSWORD}@postgres:5432/crowe_platform

# Redis
REDIS_PASSWORD=$(openssl rand -base64 16)
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Add your API keys
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
EOF
    echo -e "${GREEN}✓ Created .env.production${NC}"
    echo -e "${YELLOW}IMPORTANT: Edit /var/www/crowecode/.env.production to add your API keys${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ssl backups uploads credentials migrations workspace

# Set up SSL with Let's Encrypt
echo -e "${YELLOW}Setting up SSL certificates...${NC}"
if [ ! -f /etc/letsencrypt/live/crowecode.com/fullchain.pem ]; then
    certbot certonly --standalone --agree-tos --non-interactive \
        --email admin@crowecode.com \
        -d crowecode.com -d www.crowecode.com
    
    # Copy certificates
    cp /etc/letsencrypt/live/crowecode.com/fullchain.pem ssl/
    cp /etc/letsencrypt/live/crowecode.com/privkey.pem ssl/
else
    echo -e "${GREEN}✓ SSL certificates already exist${NC}"
fi

# Set up auto-renewal
echo -e "${YELLOW}Setting up SSL auto-renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/crowecode.com/*.pem /var/www/crowecode/ssl/") | crontab -

# Build and start services
echo -e "${YELLOW}Building Docker containers...${NC}"
docker-compose -f docker-compose.production.yml build

echo -e "${YELLOW}Starting database and cache...${NC}"
docker-compose -f docker-compose.production.yml up -d postgres redis

echo -e "${YELLOW}Waiting for database...${NC}"
sleep 15

echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose -f docker-compose.production.yml run --rm migrate

echo -e "${YELLOW}Starting all services...${NC}"
docker-compose -f docker-compose.production.yml up -d

# Create systemd service for auto-start
echo -e "${YELLOW}Creating systemd service...${NC}"
cat > /etc/systemd/system/crowecode.service << 'EOF'
[Unit]
Description=CroweCode Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/crowecode
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable crowecode.service

# Show status
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
docker-compose -f docker-compose.production.yml ps
echo ""
echo -e "${GREEN}Your CroweCode platform is now available at:${NC}"
echo -e "  ${GREEN}https://crowecode.com${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit /var/www/crowecode/.env.production to add your API keys"
echo "2. Restart services: cd /var/www/crowecode && docker-compose -f docker-compose.production.yml restart"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  Restart: systemctl restart crowecode"
echo "  Status: systemctl status crowecode"
echo ""
echo -e "${GREEN}========================================${NC}"