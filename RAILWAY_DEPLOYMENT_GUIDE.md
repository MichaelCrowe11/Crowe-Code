# 🚂 Railway Deployment Guide for CroweCode

## ✅ Your GitHub Repository is Ready!
- **Repository:** https://github.com/MichaelCrowe11/CroweCode
- **Status:** Code successfully pushed and ready for deployment

## 🚀 Quick Deploy via Railway Web Interface

### Step 1: Start Deployment (2 minutes)
1. **Go to:** https://railway.app/new/github
2. **You're already logged in** (you have the token)
3. **Select Repository:** `MichaelCrowe11/CroweCode`
4. **Click:** "Deploy Now"

### Step 2: Railway Auto-Detection
Railway will automatically detect and configure:
- ✅ Next.js 14 framework
- ✅ Node.js version
- ✅ Build command: `npm run build`
- ✅ Start command: `npm start`
- ✅ Port configuration

### Step 3: Add Environment Variables (Required)
Once deployment starts, in your Railway dashboard:

1. Click on your project
2. Go to "Variables" tab
3. Add these essential variables:

```env
# Security (Click "Generate" for random values)
JWT_SECRET=[Generate]
SESSION_SECRET=[Generate]

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://crowecode.com

# Optional but Recommended
NODE_ENV=production
```

### Step 4: Add Database (Optional but Recommended)
In Railway Dashboard:
1. Click "New" → "Database" → "PostgreSQL"
2. Railway automatically adds `DATABASE_URL` to your app
3. No configuration needed!

### Step 5: Connect Custom Domain
After deployment completes:

1. **In Railway:**
   - Go to Settings → Domains
   - Click "Add Custom Domain"
   - Enter: `crowecode.com`
   - Copy the provided CNAME value

2. **In Namecheap:**
   - Go to Domain List → Manage `crowecode.com`
   - Advanced DNS
   - Delete existing A records
   - Add new records:

   ```
   Type: CNAME
   Host: @
   Value: [your-app].up.railway.app
   TTL: Automatic

   Type: CNAME
   Host: www
   Value: [your-app].up.railway.app
   TTL: Automatic
   ```

## 📊 Monitoring Your Deployment

### Build Logs
- Watch real-time build progress
- Check for any errors
- Typical build time: 3-5 minutes

### Deployment URL
Railway provides a temporary URL immediately:
- Format: `crowecode-production-[random].up.railway.app`
- Test your app here before domain setup

### Health Checks
Railway automatically:
- Monitors app health
- Restarts on crashes
- Scales as needed

## 🛠️ Post-Deployment Checklist

- [ ] Test temporary Railway URL
- [ ] Verify all pages load correctly
- [ ] Check API endpoints (`/api/health`)
- [ ] Test authentication flow
- [ ] Configure custom domain
- [ ] Test custom domain (may take 10-30 min for DNS)
- [ ] Enable auto-deploy from GitHub

## 📱 Auto-Deploy Setup

1. In Railway Settings → GitHub
2. Enable "Auto Deploy"
3. Now every `git push` to main automatically deploys!

## 🔧 Troubleshooting

### If Build Fails
- Check build logs for errors
- Common fix: Add `NODE_OPTIONS=--openssl-legacy-provider`
- Ensure all dependencies are in package.json

### If App Crashes
- Check runtime logs
- Verify environment variables
- Check database connection (if using)

### Domain Not Working
- DNS propagation takes 10-30 minutes
- Use https://dnschecker.org to verify
- Ensure CNAME records are correct

## 🎯 Next Steps

1. **Deploy Now:** https://railway.app/new/github
2. **Select:** MichaelCrowe11/CroweCode
3. **Add Variables:** JWT_SECRET, SESSION_SECRET
4. **Get your URL:** Share it to verify it's working!

---

## Need Help?
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your deployed app will be at: `https://[your-app].up.railway.app`