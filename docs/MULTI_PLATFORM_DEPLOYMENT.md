# Multi-Platform Deployment Guide

## Overview
CroweCode Platform supports deployment across multiple cloud platforms for optimal performance, scalability, and cost efficiency.

## Deployment Architecture

### 1. Primary: Fly.io
- **Status**: ✅ Deployed
- **URL**: https://crowecode-main.fly.dev
- **Region**: US East (iad)
- **Features**:
  - Auto-scaling
  - Global edge network
  - Built-in SSL
  - PostgreSQL database
  - WebSocket support

### 2. Railway Platform
- **Status**: 🚀 Ready to Deploy
- **URL**: https://crowecode.up.railway.app
- **Features**:
  - Managed PostgreSQL
  - Managed Redis
  - Auto-scaling
  - GitHub integration
  - One-click deployments

### 3. Modal with GPU
- **Status**: 🚀 Ready to Deploy
- **URL**: https://crowecode-platform.modal.run
- **GPU Options**:
  - T4 (16GB) - $0.59/hour - Inference
  - A10G (24GB) - $1.10/hour - Balanced
  - A100 (40GB) - $3.09/hour - Training
  - H100 (80GB) - $8.50/hour - Enterprise
- **Features**:
  - GPU acceleration for AI
  - Serverless functions
  - Auto-scaling to zero
  - WebSocket support
  - Background jobs

## Quick Deployment Commands

### Deploy to Fly.io
```bash
# Deploy with immediate strategy
fly deploy --app crowecode-main --strategy immediate

# Or use the deployment script
bash scripts/deploy-fly.sh
```

### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Run deployment script
bash scripts/deploy-railway.sh

# Or manual deployment
railway login
railway link
railway up
```

### Deploy to Modal with GPU
```bash
# Install Modal
pip install modal

# Authenticate
modal token new

# Run deployment script
bash scripts/deploy-modal.sh

# Or direct deployment
modal deploy modal_app.py
```

## Environment Variables

### Required for All Platforms
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# AI Providers (at least one required)
XAI_API_KEY=xai-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### OAuth Configuration
```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## Platform-Specific Configuration

### Fly.io Configuration
```toml
# fly.toml
[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
```

### Railway Configuration
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci --legacy-peer-deps && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "healthcheckPath": "/api/health"
  }
}
```

### Modal Configuration
```python
# modal_app.py
@app.function(
    gpu="T4",  # GPU for AI tasks
    memory=8192,
    timeout=600,
)
def ai_processor(prompt: str):
    # AI processing with GPU acceleration
    pass
```

## Cost Optimization Strategy

### Workload Distribution
1. **Fly.io**: Main web application, real-time features
2. **Railway**: Development/staging environments, database hosting
3. **Modal**: GPU-intensive AI workloads, batch processing

### Cost Estimates (Monthly)
- **Fly.io**: ~$25-50 (1-2 machines + database)
- **Railway**: ~$20 (Hobby plan with database)
- **Modal**: Pay-per-use (GPU hours only when needed)

### Optimization Tips
1. Use Modal for AI tasks to avoid paying for idle GPU time
2. Use Fly.io's auto-stop feature for low-traffic periods
3. Use Railway for development environments
4. Batch AI requests to minimize GPU startup time

## Monitoring and Management

### Fly.io
```bash
fly status --app crowecode-main
fly logs --app crowecode-main
fly ssh console --app crowecode-main
fly monitoring dashboard
```

### Railway
```bash
railway status
railway logs
railway variables
railway open  # Open dashboard
```

### Modal
```bash
modal app list
modal app logs crowecode-platform
modal gpu list  # Check GPU usage
modal secret list
```

## Load Balancing Strategy

### DNS Configuration
```
A Record: crowecode.com -> Fly.io IP
CNAME: railway.crowecode.com -> Railway URL
CNAME: ai.crowecode.com -> Modal URL
```

### Traffic Distribution
- **Main Traffic**: Fly.io (primary)
- **AI Requests**: Modal (GPU processing)
- **Overflow/Backup**: Railway

## Deployment Pipeline

### Automated Deployment
```yaml
# .github/workflows/deploy.yml
name: Multi-Platform Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-fly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only

  deploy-railway:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/deploy-action@v1
        with:
          service: crowecode-platform

  deploy-modal:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pip install modal
      - run: modal deploy modal_app.py
```

## Troubleshooting

### Common Issues

#### Fly.io
- **Health checks failing**: Check `/api/health` endpoint
- **Database connection**: Use internal `.flycast` domain
- **Memory issues**: Scale up machine size

#### Railway
- **Build failures**: Check Node version compatibility
- **Database URL**: Use provided `DATABASE_URL` variable
- **Domain issues**: Verify DNS propagation

#### Modal
- **GPU unavailable**: Check quota and region availability
- **Secret errors**: Verify all secrets are created
- **Timeout issues**: Increase timeout in function decorator

## Performance Benchmarks

### Response Times
- **Fly.io**: ~50ms (edge network)
- **Railway**: ~100ms (US regions)
- **Modal**: ~200ms cold start, ~20ms warm

### GPU Performance (Modal)
- **T4**: 1.5 TFLOPS (inference)
- **A10G**: 2.5 TFLOPS (balanced)
- **A100**: 9.7 TFLOPS (training)
- **H100**: 30 TFLOPS (enterprise)

## Security Considerations

### Platform Security
- **Fly.io**: Built-in DDoS protection, SSL
- **Railway**: Automatic SSL, private networking
- **Modal**: Isolated functions, encrypted secrets

### Best Practices
1. Use different secrets per environment
2. Enable 2FA on all platform accounts
3. Rotate API keys regularly
4. Use private networking where available
5. Implement rate limiting

## Support and Resources

### Documentation
- [Fly.io Docs](https://fly.io/docs)
- [Railway Docs](https://docs.railway.app)
- [Modal Docs](https://modal.com/docs)

### Support Channels
- **Fly.io**: Community forum, Discord
- **Railway**: Discord, GitHub issues
- **Modal**: Slack community, email support

### Monitoring
- **Fly.io**: Built-in metrics dashboard
- **Railway**: Integrated monitoring
- **Modal**: GPU usage dashboard

## Next Steps

1. **Verify Deployments**:
   ```bash
   curl https://crowecode-main.fly.dev/api/health
   curl https://crowecode.up.railway.app/api/health
   curl https://crowecode-platform.modal.run/api/health
   ```

2. **Configure Custom Domain**:
   - Add DNS records for each platform
   - Configure SSL certificates
   - Set up load balancer rules

3. **Set Up Monitoring**:
   - Configure uptime monitoring
   - Set up error tracking (Sentry)
   - Enable performance monitoring

4. **Optimize Costs**:
   - Monitor usage patterns
   - Adjust scaling policies
   - Optimize GPU utilization

5. **Test Failover**:
   - Verify automatic failover
   - Test backup deployments
   - Document recovery procedures