# CroweCode Platform Repository Information

## 📍 Repository Locations

### Local Repository
- **Path**: `C:\Users\micha\crowecode-platform`
- **Status**: Active development environment

### Production Deployment
- **URL**: https://crowecode-main.fly.dev
- **Platform**: Fly.io
- **Region**: iad (US East - Ashburn)
- **Apps**:
  - Main App: `crowecode-main`
  - Database: `crowecode-db` (PostgreSQL)

### GitHub Repository
- **URL**: https://github.com/MichaelCrowe11/CroweCode
- **Branch**: main
- **Last Update**: OAuth authentication fixes and CLAUDE.md improvements

## 🔐 OAuth Configuration

### GitHub OAuth
- **Callback URL**: https://crowecode-main.fly.dev/api/auth/callback/github
- **Status**: ✅ Configured and working

### Google OAuth
- **Callback URL**: https://crowecode-main.fly.dev/api/auth/callback/google
- **Status**: ✅ Configured and working

## 📂 Key Files Modified Today

1. **CLAUDE.md** - Updated with current architecture and deployment info
2. **scripts/test-oauth.js** - OAuth configuration testing script
3. **scripts/verify-oauth.js** - OAuth verification script
4. **OAUTH_SETUP_GUIDE.md** - Comprehensive OAuth setup documentation
5. **src/app/login/page.tsx** - Fixed to use NextAuth signIn
6. **src/app/register/page.tsx** - Added auto-login after registration

## 🚀 Access Points

### Live Application
- **Main Site**: https://crowecode-main.fly.dev
- **Login Page**: https://crowecode-main.fly.dev/login
- **Register Page**: https://crowecode-main.fly.dev/register
- **Dashboard**: https://crowecode-main.fly.dev/dashboard (requires auth)

### Development Commands
```bash
# Local development
npm run dev

# Deploy to production
fly deploy --app crowecode-main

# Check logs
fly logs --app crowecode-main

# SSH into production
fly ssh console -a crowecode-main

# Database proxy for local access
fly proxy 5433:5432 -a crowecode-db
```

## 🔑 Environment Variables (Set on Fly.io)

All critical environment variables are configured:
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET
- ✅ GITHUB_CLIENT_ID & SECRET
- ✅ GOOGLE_CLIENT_ID & SECRET
- ✅ DATABASE_URL
- ✅ AI Provider Keys (XAI, ANTHROPIC, OPENAI)

## 📊 Current Status

- **OAuth**: ✅ Fully functional
- **Database**: ✅ Connected and operational
- **Deployment**: ✅ Live on Fly.io
- **Health Check**: ✅ Passing
- **SSL**: ✅ Enabled via Fly.io proxy