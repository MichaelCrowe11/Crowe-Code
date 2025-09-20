# Complete OAuth Setup for CroweCode Platform

## Current Production URLs (Fly.io)
- **Main URL**: https://crowecode-main.fly.dev
- **Custom Domain**: https://crowecode.com (when configured)

## GitHub OAuth Configuration

### For Fly.io Domain (Current)
**OAuth App Settings:**
- **Application name**: CroweCode Platform
- **Homepage URL**: `https://crowecode-main.fly.dev`
- **Authorization callback URL**: `https://crowecode-main.fly.dev/api/auth/callback/github`

### For Custom Domain (crowecode.com)
**OAuth App Settings:**
- **Application name**: CroweCode Platform
- **Homepage URL**: `https://crowecode.com`
- **Authorization callback URL**: `https://crowecode.com/api/auth/callback/github`

### GitHub OAuth App Links
1. **Create New OAuth App**: [https://github.com/settings/applications/new](https://github.com/settings/applications/new)
2. **Manage OAuth Apps**: [https://github.com/settings/developers](https://github.com/settings/developers)
3. **OAuth Apps List**: [https://github.com/settings/applications](https://github.com/settings/applications)

## Google OAuth Configuration

### For Fly.io Domain (Current)
**OAuth 2.0 Client Settings:**
- **Authorized JavaScript origins**:
  ```
  https://crowecode-main.fly.dev
  ```
- **Authorized redirect URIs**:
  ```
  https://crowecode-main.fly.dev/api/auth/callback/google
  ```

### For Custom Domain (crowecode.com)
**OAuth 2.0 Client Settings:**
- **Authorized JavaScript origins**:
  ```
  https://crowecode.com
  https://www.crowecode.com
  ```
- **Authorized redirect URIs**:
  ```
  https://crowecode.com/api/auth/callback/google
  https://www.crowecode.com/api/auth/callback/google
  ```

### Google Cloud Console Links
1. **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. **APIs & Services**: [https://console.cloud.google.com/apis/dashboard](https://console.cloud.google.com/apis/dashboard)
3. **Credentials Page**: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
4. **OAuth Consent Screen**: [https://console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)

## Multiple Domain Support Strategy

### Option 1: Single OAuth App with Multiple Callbacks (Recommended for Google)
Google allows multiple redirect URIs, so add all domains:
```
https://crowecode-main.fly.dev/api/auth/callback/google
https://crowecode.com/api/auth/callback/google
https://www.crowecode.com/api/auth/callback/google
```

### Option 2: Separate OAuth Apps per Domain (Required for GitHub)
GitHub only allows ONE callback URL per app, so you need:
1. **Development App**: For localhost testing
2. **Staging App**: For fly.dev domain
3. **Production App**: For crowecode.com domain

## Environment Variables Configuration

### For Fly.io Deployment
```bash
# Set for crowecode-main.fly.dev
fly secrets set NEXTAUTH_URL="https://crowecode-main.fly.dev" --app crowecode-main
fly secrets set GITHUB_CLIENT_ID="<fly-dev-github-client-id>" --app crowecode-main
fly secrets set GITHUB_CLIENT_SECRET="<fly-dev-github-secret>" --app crowecode-main
fly secrets set GOOGLE_CLIENT_ID="<google-client-id>" --app crowecode-main
fly secrets set GOOGLE_CLIENT_SECRET="<google-secret>" --app crowecode-main
```

### For Custom Domain (crowecode.com)
```bash
# Update when domain is configured
fly secrets set NEXTAUTH_URL="https://crowecode.com" --app crowecode-main
fly secrets set GITHUB_CLIENT_ID="<production-github-client-id>" --app crowecode-main
fly secrets set GITHUB_CLIENT_SECRET="<production-github-secret>" --app crowecode-main
# Google can use same credentials with multiple URIs
```

## Testing URLs

### Current (Fly.io)
- **Test Page**: https://crowecode-main.fly.dev/auth/test
- **Debug Info**: https://crowecode-main.fly.dev/api/auth/debug
- **Sign In Page**: https://crowecode-main.fly.dev/api/auth/signin
- **GitHub Sign In**: https://crowecode-main.fly.dev/api/auth/signin/github
- **Google Sign In**: https://crowecode-main.fly.dev/api/auth/signin/google
- **Check Providers**: https://crowecode-main.fly.dev/api/auth/providers
- **Session Status**: https://crowecode-main.fly.dev/api/auth/session

### Future (crowecode.com)
- **Test Page**: https://crowecode.com/auth/test
- **Debug Info**: https://crowecode.com/api/auth/debug
- **Sign In Page**: https://crowecode.com/api/auth/signin
- **GitHub Sign In**: https://crowecode.com/api/auth/signin/github
- **Google Sign In**: https://crowecode.com/api/auth/signin/google
- **Check Providers**: https://crowecode.com/api/auth/providers
- **Session Status**: https://crowecode.com/api/auth/session

## Step-by-Step Setup Guide

### Setting Up GitHub OAuth

1. **Go to GitHub Settings**
   - Navigate to: [https://github.com/settings/developers](https://github.com/settings/developers)

2. **Create New OAuth App**
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: CroweCode Platform
     - **Homepage URL**: `https://crowecode-main.fly.dev` (or `https://crowecode.com`)
     - **Application description**: AI-Powered Development Platform
     - **Authorization callback URL**:
       - For Fly.io: `https://crowecode-main.fly.dev/api/auth/callback/github`
       - For Production: `https://crowecode.com/api/auth/callback/github`

3. **Get Credentials**
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**

4. **Update Fly.io Secrets**
   ```bash
   fly secrets set GITHUB_CLIENT_ID="your-client-id" --app crowecode-main
   fly secrets set GITHUB_CLIENT_SECRET="your-client-secret" --app crowecode-main
   ```

### Setting Up Google OAuth

1. **Go to Google Cloud Console**
   - Navigate to: [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Create or Select Project**
   - Create new project: "CroweCode Platform"
   - Or select existing project

3. **Configure OAuth Consent Screen**
   - Go to: [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
   - User Type: External
   - App name: CroweCode Platform
   - User support email: Your email
   - Authorized domains:
     - `crowecode-main.fly.dev`
     - `crowecode.com`
   - Developer contact: Your email

4. **Create OAuth 2.0 Client ID**
   - Go to: [Credentials](https://console.cloud.google.com/apis/credentials)
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: CroweCode Platform
   - Authorized JavaScript origins:
     ```
     https://crowecode-main.fly.dev
     https://crowecode.com
     https://www.crowecode.com
     ```
   - Authorized redirect URIs:
     ```
     https://crowecode-main.fly.dev/api/auth/callback/google
     https://crowecode.com/api/auth/callback/google
     https://www.crowecode.com/api/auth/callback/google
     ```

5. **Get Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**

6. **Update Fly.io Secrets**
   ```bash
   fly secrets set GOOGLE_CLIENT_ID="your-client-id" --app crowecode-main
   fly secrets set GOOGLE_CLIENT_SECRET="your-client-secret" --app crowecode-main
   ```

## Custom Domain Configuration (crowecode.com)

### DNS Setup for crowecode.com
```
# A Records
crowecode.com.     A     66.241.124.135
www.crowecode.com. A     66.241.124.135

# AAAA Records (IPv6)
crowecode.com.     AAAA  2a09:8280:1::9b:736c:0
www.crowecode.com. AAAA  2a09:8280:1::9b:736c:0
```

### Fly.io Certificate Setup
```bash
# Add custom domain to Fly.io app
fly certs add crowecode.com --app crowecode-main
fly certs add www.crowecode.com --app crowecode-main

# Check certificate status
fly certs list --app crowecode-main
fly certs show crowecode.com --app crowecode-main
```

### Update NEXTAUTH_URL for Custom Domain
```bash
# When domain is ready, update to use custom domain
fly secrets set NEXTAUTH_URL="https://crowecode.com" --app crowecode-main
```

## Troubleshooting

### Common Error Messages

1. **"redirect_uri_mismatch"**
   - The callback URL doesn't match exactly
   - Check for trailing slashes, http vs https, www prefix

2. **"Invalid client"**
   - Client ID or Secret is incorrect
   - Regenerate credentials and update secrets

3. **"Application suspended"**
   - OAuth app may be disabled
   - Check app status in provider dashboard

### Verification Commands
```bash
# Check current secrets
fly secrets list --app crowecode-main

# Test OAuth providers
curl https://crowecode-main.fly.dev/api/auth/providers

# Check debug info
curl https://crowecode-main.fly.dev/api/auth/debug

# Get CSRF token
curl https://crowecode-main.fly.dev/api/auth/csrf
```

## Support Links

### GitHub OAuth Documentation
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
- [GitHub OAuth Scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

### Google OAuth Documentation
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console Help](https://support.google.com/cloud/answer/6158849)

### NextAuth Documentation
- [NextAuth.js Docs](https://next-auth.js.org/)
- [NextAuth Providers](https://next-auth.js.org/providers/)

## Quick Reference

### Current Active URLs (Fly.io)
✅ **Working Now:**
- Main App: https://crowecode-main.fly.dev
- GitHub Callback: https://crowecode-main.fly.dev/api/auth/callback/github
- Google Callback: https://crowecode-main.fly.dev/api/auth/callback/google

### Future Production URLs (crowecode.com)
🔜 **After Domain Setup:**
- Main App: https://crowecode.com
- GitHub Callback: https://crowecode.com/api/auth/callback/github
- Google Callback: https://crowecode.com/api/auth/callback/google