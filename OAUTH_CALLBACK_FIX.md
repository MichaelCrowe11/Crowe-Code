# 🔴 URGENT: OAuth Callback URL Configuration Fix

## The Problem
You're getting a "Callback" error because the OAuth callback URLs in your GitHub and Google apps don't match what NextAuth is using.

## Required Callback URLs

You MUST set these EXACT URLs in your OAuth apps:

### GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Find your OAuth App (or create a new one)
3. Click "Edit" or "Update Application"
4. Set these EXACT values:
   - **Homepage URL**: `https://crowecode-main.fly.dev`
   - **Authorization callback URL**: `https://crowecode-main.fly.dev/api/auth/callback/github`

⚠️ IMPORTANT: The callback URL must be EXACTLY:
```
https://crowecode-main.fly.dev/api/auth/callback/github
```

### Google OAuth 2.0 Client
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID (or create a new one)
3. Click to edit
4. Set these EXACT values:
   - **Authorized JavaScript origins**:
     ```
     https://crowecode-main.fly.dev
     ```
   - **Authorized redirect URIs**:
     ```
     https://crowecode-main.fly.dev/api/auth/callback/google
     ```

⚠️ IMPORTANT: The redirect URI must be EXACTLY:
```
https://crowecode-main.fly.dev/api/auth/callback/google
```

## Common Mistakes to Avoid

❌ DON'T use these incorrect URLs:
- `https://crowecode-main.fly.dev/auth/callback/github` (missing /api)
- `https://crowecode-main.fly.dev/callback/github` (missing /api/auth)
- `http://crowecode-main.fly.dev/api/auth/callback/github` (http instead of https)
- `https://www.crowecode-main.fly.dev/api/auth/callback/github` (has www)

✅ DO use exactly:
- `https://crowecode-main.fly.dev/api/auth/callback/github`
- `https://crowecode-main.fly.dev/api/auth/callback/google`

## Step-by-Step Fix

### 1. Update GitHub OAuth App
```
1. Visit: https://github.com/settings/developers
2. Click on your OAuth App
3. Update Authorization callback URL to:
   https://crowecode-main.fly.dev/api/auth/callback/github
4. Click "Update application"
```

### 2. Update Google OAuth Client
```
1. Visit: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Add to Authorized redirect URIs:
   https://crowecode-main.fly.dev/api/auth/callback/google
4. Click "Save"
```

### 3. Verify Environment Variables
Run this command to ensure your OAuth credentials are set:
```bash
fly secrets list --app crowecode-main | grep -E "(GITHUB|GOOGLE)"
```

You should see:
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

### 4. Test the Login
After updating the callback URLs:
1. Clear your browser cookies for crowecode-main.fly.dev
2. Visit: https://crowecode-main.fly.dev/login
3. Click GitHub or Google login
4. You should be redirected to the OAuth provider
5. After authorizing, you should return to /dashboard

## If It Still Doesn't Work

### Check 1: Verify the Exact Error
The URL shows `error=Callback` which means NextAuth received an error from the OAuth provider. Common causes:

1. **Mismatched callback URL** (most likely)
2. **Invalid client ID or secret**
3. **OAuth app is disabled or suspended**

### Check 2: Verify Your OAuth App Settings

For GitHub:
- Make sure the app is not suspended
- Verify the Client ID matches what's in Fly secrets
- The callback URL has no trailing slash

For Google:
- Make sure the OAuth consent screen is configured
- The app is not in "Testing" mode with restricted users
- The redirect URI is in the approved list

### Check 3: Debug with Logs
```bash
fly logs --app crowecode-main | grep -i "oauth\|callback\|auth"
```

## Quick Test URLs

After fixing, test these directly:

1. GitHub OAuth:
   ```
   https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&redirect_uri=https://crowecode-main.fly.dev/api/auth/callback/github
   ```

2. Google OAuth:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=https://crowecode-main.fly.dev/api/auth/callback/google&response_type=code&scope=openid%20email%20profile
   ```

## Expected Flow

1. User clicks OAuth button on `/login`
2. Redirected to GitHub/Google
3. User authorizes the app
4. Redirected back to `/api/auth/callback/[provider]`
5. NextAuth processes the callback
6. User is redirected to `/dashboard`
7. Session is created and persisted

## Need to Update Credentials?

If you need to create new OAuth apps:

### New GitHub OAuth App
```bash
# After creating new app on GitHub, update secrets:
fly secrets set GITHUB_CLIENT_ID="new_client_id" GITHUB_CLIENT_SECRET="new_secret" --app crowecode-main
```

### New Google OAuth Client
```bash
# After creating new client on Google Cloud Console:
fly secrets set GOOGLE_CLIENT_ID="new_client_id" GOOGLE_CLIENT_SECRET="new_secret" --app crowecode-main
```

---

**Remember**: The callback URLs must match EXACTLY. Even a trailing slash or different protocol will cause the "Callback" error.