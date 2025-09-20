# 🚀 Full Stack Deployment Guide - Crowe Logic Platform

## Overview
This guide provides complete instructions for deploying the Crowe Logic Platform with full functionality including database, caching, AI features, and all API endpoints.

## 📋 Prerequisites

### Required Services
- **VPS/Server**: Ubuntu 20.04+ or similar (min 2GB RAM, 20GB storage)
- **Domain**: Your registered domain pointed to server IP
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+

### Required API Keys
- **Anthropic API Key**: For Claude AI features
- **OpenAI API Key** (Optional): For GPT models
- **GitHub OAuth**: For Git integration
- **Google Cloud** (Optional): For Vertex AI and Speech services

## 🛠️ Deployment Options

### Option 1: Quick Deploy with Script (Recommended)

```bash
# SSH into your server
ssh user@your-server-ip

# Clone the repository
git clone https://github.com/yourusername/crowe-logic-platform.git
cd crowe-logic-platform

# Make script executable
chmod +x deploy-full-stack.sh

# Run deployment script with your domain
./deploy-full-stack.sh yourdomain.com
```

### Option 2: Manual Docker Compose Deployment

#### Step 1: Prepare Environment

```bash
# Create production environment file
cp .env.local.template .env.production

# Edit with your values
nano .env.production
```

Required environment variables:
```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Database
DATABASE_URL=postgresql://crowe:password@postgres:5432/crowe_platform
DB_PASSWORD=<strong-password>

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=<strong-password>

# AI Services
ANTHROPIC_API_KEY=sk-ant-api-xxx
OPENAI_API_KEY=sk-xxx

# GitHub Integration
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_ACCESS_TOKEN=ghp_xxx
```

#### Step 2: SSL Certificates

Using Let's Encrypt:
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to project
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
```

#### Step 3: Build and Deploy

```bash
# Build application
docker-compose -f docker-compose.production.yml build

# Start database and cache first
docker-compose -f docker-compose.production.yml up -d postgres redis

# Wait for database
sleep 10

# Run migrations
docker-compose -f docker-compose.production.yml run --rm migrate

# Start all services
docker-compose -f docker-compose.production.yml up -d
```

### Option 3: Cloud Platform Deployment

#### Vercel + Supabase (Easiest)
1. Fork repository to GitHub
2. Connect to Vercel
3. Set up Supabase project for database
4. Configure environment variables in Vercel dashboard
5. Deploy

#### Railway (Full Stack)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up
```

#### Google Cloud Platform
```bash
# Use existing GCP configuration
./deploy-to-dulcet-nucleus.sh

# Or manual deploy
gcloud run deploy crowe-logic-platform \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Post-Deployment Configuration

### 1. Database Setup
```bash
# Access database
docker-compose -f docker-compose.production.yml exec postgres psql -U crowe -d crowe_platform

# Verify tables
\dt

# Exit
\q
```

### 2. Configure DNS
Point your domain to server IP:
- A Record: @ → Your-Server-IP
- A Record: www → Your-Server-IP
- CNAME: * → yourdomain.com (optional, for subdomains)

### 3. Set Up Automated Backups
Backups are automatically configured to run daily. Manual backup:
```bash
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U crowe crowe_platform > backup-$(date +%Y%m%d).sql
```

### 4. Configure Monitoring
```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Health check
curl https://yourdomain.com/api/health

# Monitor resources
docker stats
```

## 📊 Features Verification Checklist

After deployment, verify all features work:

- [ ] **Authentication**
  - [ ] User registration
  - [ ] Login/logout
  - [ ] JWT tokens

- [ ] **Database**
  - [ ] PostgreSQL connection
  - [ ] Prisma migrations
  - [ ] Data persistence

- [ ] **Cache/Sessions**
  - [ ] Redis connection
  - [ ] Session management
  - [ ] Cache operations

- [ ] **AI Features**
  - [ ] Claude integration
  - [ ] Code generation
  - [ ] Chat functionality

- [ ] **IDE Features**
  - [ ] File browser
  - [ ] Code editor
  - [ ] Terminal
  - [ ] Git integration

- [ ] **API Endpoints**
  - [ ] `/api/health` - Health check
  - [ ] `/api/ai` - AI operations
  - [ ] `/api/files` - File management
  - [ ] `/api/git` - Git operations
  - [ ] `/api/terminal` - Terminal access

## 🔒 Security Checklist

- [ ] SSL/TLS configured (HTTPS only)
- [ ] Environment variables secured
- [ ] Database password strong
- [ ] Redis password configured
- [ ] Firewall rules set (only 80, 443 open)
- [ ] Regular backups scheduled
- [ ] Monitoring alerts configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database status
docker-compose -f docker-compose.production.yml ps postgres

# View logs
docker-compose -f docker-compose.production.yml logs postgres

# Restart database
docker-compose -f docker-compose.production.yml restart postgres
```

#### 2. Redis Connection Issues
```bash
# Test Redis connection
docker-compose -f docker-compose.production.yml exec redis redis-cli ping

# Check Redis logs
docker-compose -f docker-compose.production.yml logs redis
```

#### 3. Application Not Starting
```bash
# Check app logs
docker-compose -f docker-compose.production.yml logs app

# Rebuild application
docker-compose -f docker-compose.production.yml build --no-cache app
docker-compose -f docker-compose.production.yml up -d app
```

#### 4. SSL Certificate Issues
```bash
# Renew certificates
certbot renew --force-renewal

# Copy new certificates
cp /etc/letsencrypt/live/yourdomain.com/*.pem ssl/

# Restart nginx
docker-compose -f docker-compose.production.yml restart nginx
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# In docker-compose.production.yml
app:
  deploy:
    replicas: 3
```

### Database Optimization
```sql
-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token);
```

### Redis Clustering
```bash
# For high availability, set up Redis Sentinel
docker run -d --name redis-sentinel redis:7-alpine redis-sentinel
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

### Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply in production
docker-compose -f docker-compose.production.yml run --rm migrate
```

### SSL Certificate Renewal
```bash
# Set up auto-renewal
crontab -e
# Add: 0 0 1 * * certbot renew --quiet
```

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/yourusername/crowe-logic-platform/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/crowe-logic-platform/issues)
- **Community**: [Discord Server](https://discord.gg/yourserver)

## 🎉 Success!

Your Crowe Logic Platform should now be fully deployed with:
- ✅ Full IDE functionality
- ✅ AI-powered features
- ✅ Database persistence
- ✅ Redis caching
- ✅ SSL/HTTPS security
- ✅ Automated backups
- ✅ Production optimizations

Visit your domain to start using the platform!