# OAuth Setup Guide for CroweCode Platform

This guide will help you set up OAuth authentication with GitHub and Google for the CroweCode platform.

## Prerequisites

- Deployed app on Fly.io (https://crowecode-main.fly.dev)
- Access to GitHub and Google developer consoles
- Fly CLI installed and authenticated

## 1. GitHub OAuth Setup

### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **"OAuth Apps"** in the sidebar
3. Click **"New OAuth App"**
4. Fill in the following details:
   - **Application name**: CroweCode Platform
   - **Homepage URL**: https://crowecode-main.fly.dev
   - **Application description**: AI-powered code intelligence platform
   - **Authorization callback URL**: https://crowecode-main.fly.dev/api/auth/callback/github

5. Click **"Register application"**
6. Copy your **Client ID**
7. Click **"Generate a new client secret"**
8. Copy your **Client Secret** (save it securely, it won't be shown again)

### Alternative URLs (if needed)
- For production domain: https://crowecode.com/api/auth/callback/github
- For www subdomain: https://www.crowecode.com/api/auth/callback/github
- For local dev: http://localhost:3000/api/auth/callback/github

## 2. Google OAuth Setup

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in app information
   - Add scopes: email, profile, openid
   - Add test users if in testing mode

6. For the OAuth client ID:
   - **Application type**: Web application
   - **Name**: CroweCode Platform
   - **Authorized JavaScript origins**:
     - https://crowecode-main.fly.dev
     - https://crowecode.com
     - https://www.crowecode.com
   - **Authorized redirect URIs**:
     - https://crowecode-main.fly.dev/api/auth/callback/google
     - https://crowecode.com/api/auth/callback/google
     - https://www.crowecode.com/api/auth/callback/google

7. Click **"CREATE"**
8. Copy your **Client ID** and **Client Secret**

## 3. Set Secrets on Fly.io

### Automatic Setup (Recommended)

Run the setup script:

```bash
chmod +x scripts/setup-oauth-secrets.sh
./scripts/setup-oauth-secrets.sh
```

### Manual Setup

Set the secrets manually using Fly CLI:

```bash
# Set GitHub OAuth
flyctl secrets set \
  GITHUB_CLIENT_ID="your-github-client-id" \
  GITHUB_CLIENT_SECRET="your-github-client-secret" \
  --app crowecode-main

# Set Google OAuth
flyctl secrets set \
  GOOGLE_CLIENT_ID="your-google-client-id" \
  GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  --app crowecode-main

# Update NextAuth URL for production
flyctl secrets set \
  NEXTAUTH_URL="https://crowecode-main.fly.dev" \
  --app crowecode-main
```

## 4. Deploy Changes

After setting the secrets, redeploy your application:

```bash
flyctl deploy --app crowecode-main
```

## 5. Test OAuth Flow

1. Visit https://crowecode-main.fly.dev/auth/signin
2. Try signing in with GitHub
3. Try signing in with Google
4. Verify you're redirected back to the dashboard after successful authentication

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch" error**
   - Ensure the callback URLs in your OAuth apps match exactly
   - Check for trailing slashes
   - Verify http vs https

2. **"Invalid client" error**
   - Double-check your client ID and secret
   - Ensure secrets are set correctly in Fly.io
   - Run `flyctl secrets list --app crowecode-main` to verify

3. **Sign-in works but user not created**
   - Check Fly.io logs: `flyctl logs --app crowecode-main`
   - Ensure database migrations are run
   - Verify Prisma schema includes OAuth models

### View Logs

```bash
# View application logs
flyctl logs --app crowecode-main

# SSH into container for debugging
flyctl ssh console --app crowecode-main
```

## Local Development Setup

For local development, create a `.env.local` file:

```env
# GitHub OAuth (use different app for local)
GITHUB_CLIENT_ID=your-local-github-client-id
GITHUB_CLIENT_SECRET=your-local-github-client-secret

# Google OAuth (add localhost to redirect URIs)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Security Notes

1. **Never commit OAuth secrets** to version control
2. **Use different OAuth apps** for development and production
3. **Regularly rotate secrets** for security
4. **Monitor OAuth app usage** in GitHub and Google consoles
5. **Review authorized apps** periodically

## Next Steps

1. Configure role-based access control
2. Add more OAuth providers (GitLab, Bitbucket, etc.)
3. Implement OAuth scope management
4. Add account linking for multiple providers
5. Set up email verification for credential-based signups

## Support

If you encounter issues:

1. Check the [NextAuth documentation](https://next-auth.js.org)
2. Review Fly.io logs for errors
3. Verify all callback URLs match exactly
4. Ensure all required environment variables are set