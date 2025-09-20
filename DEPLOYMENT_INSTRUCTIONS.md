# Deployment Instructions

## ✅ Current Status

### Fly.io - DEPLOYED ✅
- **URL**: https://crowecode-main.fly.dev
- **Status**: Running successfully
- **Database**: PostgreSQL configured

### Railway - READY TO DEPLOY 🚂
Railway CLI is installed and ready. To deploy:

```bash
# 1. Login to Railway
npx railway login

# 2. Create new project or link existing
npx railway link

# 3. Deploy the application
npx railway up

# Or use the automated script (requires bash):
bash scripts/deploy-railway.sh
```

### Modal GPU - READY TO DEPLOY 🖥️
Modal is installed and ready. To deploy with GPU support:

```bash
# 1. Authenticate with Modal
python -m modal token new

# 2. Deploy the application
python -m modal deploy modal_app.py

# Or use the automated script (requires bash):
bash scripts/deploy-modal.sh
```

## Environment Variables Required

Before deploying to Railway or Modal, ensure you have these environment variables:

### Required
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain
NEXTAUTH_SECRET=your-secret-key
```

### AI Providers (at least one)
```
XAI_API_KEY=xai-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### OAuth (optional)
```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Quick Deploy Commands

### Deploy to Railway (Windows/PowerShell)
```powershell
cd C:\Users\micha\crowecode-platform
npx railway login
npx railway link
npx railway up
```

### Deploy to Modal (Windows/PowerShell)
```powershell
cd C:\Users\micha\crowecode-platform
python -m modal token new
python -m modal deploy modal_app.py
```

## Testing Deployments

After deployment, test each platform:

### Fly.io
```bash
curl https://crowecode-main.fly.dev/api/health
```

### Railway (after deployment)
```bash
npx railway open  # Opens in browser
```

### Modal (after deployment)
```bash
python -m modal app list  # List deployed apps
```

## Monitoring

### Fly.io
```bash
fly status --app crowecode-main
fly logs --app crowecode-main
```

### Railway
```bash
npx railway logs
npx railway status
```

### Modal
```bash
python -m modal app logs crowecode-platform
```

## Support

- **Fly.io Dashboard**: https://fly.io/apps/crowecode-main
- **Railway Dashboard**: https://railway.app/dashboard
- **Modal Dashboard**: https://modal.com/dashboard

## Next Steps

1. Deploy to Railway for staging/development
2. Deploy to Modal for GPU-accelerated AI workloads
3. Configure custom domains
4. Set up monitoring and alerts