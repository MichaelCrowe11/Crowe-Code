# 🚂 Deploy to Railway - Step by Step

## Quick Deploy Instructions

Open a **new terminal/PowerShell window** and run these commands:

### Step 1: Navigate to Project
```powershell
cd C:\Users\micha\crowecode-platform
```

### Step 2: Login to Railway
```powershell
npx railway login
```
This will open a browser window. Log in with your Railway account (or create one).

### Step 3: Initialize Railway Project
```powershell
npx railway init
```
- Choose "Empty Project" when prompted
- Give it a name like "crowecode-platform"

### Step 4: Add Database (Optional but Recommended)
```powershell
npx railway add
```
- Select "PostgreSQL" when prompted
- This will provision a managed PostgreSQL database

### Step 5: Set Environment Variables
```powershell
# Set required variables
npx railway variables set NODE_ENV=production
npx railway variables set NEXTAUTH_URL="https://crowecode-platform.up.railway.app"
npx railway variables set NEXTAUTH_SECRET="your-secret-key-here"

# Set AI provider keys (add the ones you have)
npx railway variables set XAI_API_KEY="your-xai-key"
npx railway variables set ANTHROPIC_API_KEY="your-anthropic-key"
npx railway variables set OPENAI_API_KEY="your-openai-key"
```

### Step 6: Deploy!
```powershell
npx railway up
```

### Step 7: Get Your App URL
```powershell
npx railway open
```
This will open your deployed app in the browser!

## Alternative: One-Command Deploy

If you want to skip configuration and deploy with defaults:

```powershell
cd C:\Users\micha\crowecode-platform
npx railway login
npx railway init
npx railway up --detach
```

## Monitoring Your Deployment

### View Logs
```powershell
npx railway logs
```

### Check Status
```powershell
npx railway status
```

### Open Dashboard
```powershell
npx railway open
```

## Environment Variables You'll Need

Copy these and replace with your actual values:

```
NEXTAUTH_URL=https://crowecode-platform.up.railway.app
NEXTAUTH_SECRET=generate-a-secure-random-string
DATABASE_URL=will-be-auto-set-by-railway

# AI Providers (optional but recommended)
XAI_API_KEY=xai-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key

# OAuth (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## Troubleshooting

### If deployment fails:
1. Check logs: `npx railway logs`
2. Verify environment variables: `npx railway variables`
3. Check build output: `npx railway logs --build`

### Common Issues:
- **Port binding**: Railway automatically sets PORT env variable
- **Database connection**: Use Railway's DATABASE_URL variable
- **Build failures**: Check Node version compatibility (using Node 20)

## Success! 🎉

Once deployed, your app will be available at:
- **URL**: https://crowecode-platform.up.railway.app
- **Dashboard**: https://railway.app/dashboard

## Next Steps

1. Configure custom domain (optional)
2. Set up monitoring alerts
3. Enable automatic deploys from GitHub
4. Scale up if needed

---

**Ready to deploy? Open a new terminal and start with Step 1!**