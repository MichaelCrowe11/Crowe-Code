# 🚀 Quick Deployment Commands

## Railway Deployment (Interactive)

**Option 1: Run the automated script**
```powershell
powershell .\deploy-railway-now.ps1
```

**Option 2: Manual commands**
```powershell
cd C:\Users\micha\crowecode-platform
npx railway login
npx railway init --name crowecode-platform
npx railway up
npx railway open
```

## Modal GPU Deployment

```powershell
cd C:\Users\micha\crowecode-platform
python -m modal token new
python -m modal deploy modal_app.py
python -m modal app list
```

## Check Deployment Status

### Fly.io (Already Deployed ✅)
```bash
fly status --app crowecode-main
# URL: https://crowecode-main.fly.dev
```

### Railway (After Deployment)
```bash
npx railway status
npx railway logs
npx railway open
```

### Modal (After Deployment)
```bash
python -m modal app logs crowecode-platform
```

## Environment Variables Needed

For Railway deployment, you'll be prompted for:
- NEXTAUTH_SECRET (auto-generated if not provided)
- XAI_API_KEY (optional)
- ANTHROPIC_API_KEY (optional)
- OPENAI_API_KEY (optional)

## Quick Test After Deployment

### Railway
```bash
curl https://crowecode-platform.up.railway.app/api/health
```

### Modal
```bash
curl https://crowecode-platform.modal.run/api/health
```

## Troubleshooting

### Railway Issues
```bash
# Check logs
npx railway logs

# Check environment variables
npx railway variables

# Restart deployment
npx railway down
npx railway up
```

### Modal Issues
```bash
# Check app status
python -m modal app list

# View logs
python -m modal app logs crowecode-platform

# Stop deployment
python -m modal app stop crowecode-platform
```

## Important Notes

⚠️ **Stripe Keys**: Remember to rotate your Stripe API keys as they were exposed in git history
📦 **Railway**: Will use your Dockerfile for building
🖥️ **Modal**: Configured with GPU support for AI workloads
✅ **Fly.io**: Already deployed and running