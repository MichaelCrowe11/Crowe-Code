# Railway Deployment - Complete Guide

## Option 1: Browserless Deployment (Using Project Token)

### Prerequisites
1. You need a Railway account (create at https://railway.app)
2. Get your Railway API token:
   - Go to: https://railway.app/account/tokens
   - Create new token
   - Copy the token

### Step 1: Set Railway Token
```bash
# Windows PowerShell
$env:RAILWAY_TOKEN = "your-railway-token-here"

# Or save to file for persistence
echo "RAILWAY_TOKEN=your-token" > .env.railway
```

### Step 2: Create Project via API
```bash
# Create new project with name
npx railway init --name crowecode-platform

# Or link to existing project
npx railway link [project-id]
```

### Step 3: Add Database (Optional)
```bash
# Add PostgreSQL
npx railway add postgresql

# The DATABASE_URL will be automatically set
```

### Step 4: Set Environment Variables
```bash
# Production settings
npx railway variables set NODE_ENV=production
npx railway variables set NEXTAUTH_URL=https://your-app.up.railway.app
npx railway variables set NEXTAUTH_SECRET=your-secret-key

# AI Provider Keys (add what you have)
npx railway variables set XAI_API_KEY=xai-your-key
npx railway variables set ANTHROPIC_API_KEY=sk-ant-your-key
npx railway variables set OPENAI_API_KEY=sk-your-key
```

### Step 5: Deploy
```bash
# Deploy in detached mode (no logs)
npx railway up --detach

# Or deploy with live logs
npx railway up
```

## Option 2: Quick Browser Deploy

If you're OK with browser authentication (simpler):

```bash
cd C:\Users\micha\crowecode-platform
npx railway login          # Opens browser
npx railway init           # Creates project
npx railway up             # Deploys
```

## Option 3: Using GitHub Integration

1. Push your code to GitHub
2. Go to Railway dashboard
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Railway auto-deploys on every push

## Environment Variables Template

Create a `.env.railway` file:

```env
# Railway Token (for browserless deployment)
RAILWAY_TOKEN=your-railway-token

# App Configuration
NODE_ENV=production
NEXTAUTH_URL=https://crowecode-platform.up.railway.app
NEXTAUTH_SECRET=generate-secure-secret-here

# Database (auto-set by Railway if you add PostgreSQL)
DATABASE_URL=postgresql://...

# AI Providers
XAI_API_KEY=xai-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# OAuth (optional)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Deployment Script (PowerShell)

Save as `deploy-railway.ps1`:

```powershell
# Load environment variables
if (Test-Path ".env.railway") {
    Get-Content .env.railway | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Deploy
Write-Host "Deploying to Railway..." -ForegroundColor Yellow
npx railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployed successfully!" -ForegroundColor Green
    npx railway status
}
```

## Monitoring & Management

### View Logs
```bash
# Live logs
npx railway logs

# Follow logs
npx railway logs --follow

# Last 100 lines
npx railway logs --lines 100
```

### Check Status
```bash
npx railway status
```

### Manage Variables
```bash
# List all variables
npx railway variables

# Set a variable
npx railway variables set KEY=value

# Remove a variable
npx railway variables remove KEY
```

### Database Access
```bash
# Connect to PostgreSQL
npx railway connect

# Run SQL command
npx railway run --command "psql -c 'SELECT * FROM users'"
```

## Deployment URLs

After deployment, your app will be available at:
- Default: `https://[project-name].up.railway.app`
- Custom domain: Configure in Railway dashboard

## Troubleshooting

### "Unauthorized" Error
- Ensure RAILWAY_TOKEN is set correctly
- Try `npx railway logout` then `npx railway login`

### Build Failures
```bash
# Check build logs
npx railway logs --build

# Common fixes:
# - Ensure all dependencies in package.json
# - Check Node version compatibility
# - Verify environment variables
```

### Database Connection Issues
```bash
# Check if DATABASE_URL is set
npx railway variables | grep DATABASE_URL

# Test connection
npx railway run --command "npm run db:test"
```

### Port Issues
Railway automatically sets PORT environment variable. Ensure your app uses:
```javascript
const port = process.env.PORT || 3000;
```

## Cost & Limits

Railway Pricing (as of 2024):
- **Starter**: $5/month includes $5 of usage
- **Pro**: $20/month includes $20 of usage
- **Usage**: $0.000463/GB RAM/hour

Free tier limits:
- 500MB RAM
- 1GB disk
- $5 monthly usage

## Quick Commands Reference

```bash
# Deployment
npx railway init              # Create project
npx railway up               # Deploy
npx railway down             # Remove deployment
npx railway redeploy         # Redeploy latest

# Monitoring
npx railway logs             # View logs
npx railway status           # Check status
npx railway open             # Open dashboard

# Configuration
npx railway variables        # List vars
npx railway variables set    # Set var
npx railway link            # Link project
npx railway unlink          # Unlink project

# Database
npx railway add             # Add service
npx railway connect         # Connect to DB
```

## Next Steps

1. **After First Deploy:**
   - Check logs: `npx railway logs`
   - Verify app: `npx railway open`
   - Monitor: `npx railway status`

2. **Setup Monitoring:**
   - Enable health checks
   - Configure alerts
   - Set up error tracking

3. **Optimize:**
   - Enable caching
   - Configure CDN
   - Set up auto-scaling

---

**Ready to deploy?** Start with Option 1 for browserless deployment or Option 2 for quick browser-based deployment.