# OAuth Setup Guide for CroweCode Platform

## Overview
The platform supports OAuth authentication with GitHub and Google. This guide will help you configure OAuth properly.

## Current Production URLs
- **Main URL**: https://crowecode-main.fly.dev
- **NextAuth URL**: https://crowecode-main.fly.dev
- **Callback URLs**:
  - GitHub: `https://crowecode-main.fly.dev/api/auth/callback/github`
  - Google: `https://crowecode-main.fly.dev/api/auth/callback/google`

## GitHub OAuth Setup

### 1. Create GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: CroweCode Platform
   - **Homepage URL**: `https://crowecode-main.fly.dev`
   - **Authorization callback URL**: `https://crowecode-main.fly.dev/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID
6. Generate a new Client Secret and copy it

### 2. Update GitHub OAuth Settings
If you already have an app, ensure the callback URL is exactly:
```
https://crowecode-main.fly.dev/api/auth/callback/github
```

## Google OAuth Setup

### 1. Create Google OAuth Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Configure OAuth consent screen:
   - **Application name**: CroweCode Platform
   - **Authorized domains**: `crowecode-main.fly.dev`
6. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: CroweCode Platform
   - **Authorized JavaScript origins**:
     ```
     https://crowecode-main.fly.dev
     ```
   - **Authorized redirect URIs**:
     ```
     https://crowecode-main.fly.dev/api/auth/callback/google
     ```
7. Copy Client ID and Client Secret

## Environment Variables

### Required Variables (Already Set in Production)
```bash
NEXTAUTH_URL=https://crowecode-main.fly.dev
NEXTAUTH_SECRET=<generated-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Update Secrets (if needed)
```bash
fly secrets set GITHUB_CLIENT_ID="your-new-id" --app crowecode-main
fly secrets set GITHUB_CLIENT_SECRET="your-new-secret" --app crowecode-main
fly secrets set GOOGLE_CLIENT_ID="your-new-id" --app crowecode-main
fly secrets set GOOGLE_CLIENT_SECRET="your-new-secret" --app crowecode-main
```

## Testing OAuth

### Test Endpoints
1. **Health Check**:
   ```bash
   curl https://crowecode-main.fly.dev/api/auth/test
   ```

2. **GitHub Login**:
   Visit: https://crowecode-main.fly.dev/api/auth/signin
   Click "Sign in with GitHub"

3. **Google Login**:
   Visit: https://crowecode-main.fly.dev/api/auth/signin
   Click "Sign in with Google"

### Debug OAuth Issues
1. Check logs:
   ```bash
   fly logs -a crowecode-main | grep -i oauth
   ```

2. Verify callback URLs match exactly (no trailing slashes)

3. Ensure OAuth apps are not in test/development mode

4. Check that authorized domains include `crowecode-main.fly.dev`

## Common Issues & Solutions

### "Redirect URI mismatch"
- Ensure callback URLs match EXACTLY
- No trailing slashes
- Use HTTPS in production

### "Invalid client"
- Check CLIENT_ID and CLIENT_SECRET are correct
- Regenerate secrets if needed

### "Access blocked"
- For Google, ensure OAuth consent screen is configured
- Add test users if app is in testing mode

## Local Development OAuth

For local development, create separate OAuth apps with:
- **Callback URLs**:
  - GitHub: `http://localhost:3000/api/auth/callback/github`
  - Google: `http://localhost:3000/api/auth/callback/google`

Set in `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production
GITHUB_CLIENT_ID=dev-github-client-id
GITHUB_CLIENT_SECRET=dev-github-client-secret
GOOGLE_CLIENT_ID=dev-google-client-id
GOOGLE_CLIENT_SECRET=dev-google-client-secret
```

## Security Notes
- Never commit OAuth secrets to git
- Use different OAuth apps for dev/staging/production
- Rotate secrets regularly
- Monitor OAuth usage in provider dashboards