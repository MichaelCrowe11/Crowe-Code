# Railway GitHub Actions Setup Guide

## 🚀 Quick Setup (5 minutes)

This guide will help you deploy to Railway automatically using GitHub Actions - completely browserless!

## Step 1: Get Railway Token and Project ID

### Option A: Via Railway Dashboard (Easiest)
1. Go to https://railway.app and sign in
2. Create a new project or use existing one
3. Go to project Settings → Tokens
4. Create new deployment token
5. Copy the token (starts with `railway_`)
6. Copy the Project ID from the URL or settings

### Option B: Via CLI (One-time browser login)
```bash
# Login once
npx railway login

# Create project
npx railway init --name crowecode-platform

# Get project ID
npx railway status
```

## Step 2: Add Secrets to GitHub

Go to your GitHub repository settings:
1. Navigate to: Settings → Secrets and variables → Actions
2. Add these repository secrets:

### Required Secrets:
- `RAILWAY_TOKEN`: Your Railway deployment token
- `RAILWAY_PROJECT_ID`: Your Railway project ID

### How to add secrets:
1. Click "New repository secret"
2. Name: `RAILWAY_TOKEN`
3. Value: `your-railway-token-here`
4. Click "Add secret"

Repeat for `RAILWAY_PROJECT_ID`

## Step 3: Configure Environment Variables in Railway

You can set these via Railway dashboard or CLI:

### Via Dashboard:
1. Go to your Railway project
2. Click Variables tab
3. Add your environment variables

### Via CLI:
```bash
npx railway variables set NODE_ENV=production
npx railway variables set NEXTAUTH_URL=https://crowecode-platform.up.railway.app
npx railway variables set NEXTAUTH_SECRET=your-secret-key

# Add AI providers
npx railway variables set XAI_API_KEY=your-xai-key
npx railway variables set ANTHROPIC_API_KEY=your-anthropic-key
npx railway variables set OPENAI_API_KEY=your-openai-key

# Add OAuth (if needed)
npx railway variables set GITHUB_CLIENT_ID=your-github-client
npx railway variables set GITHUB_CLIENT_SECRET=your-github-secret
```

## Step 4: Push to GitHub

```bash
git add .
git commit -m "Add Railway GitHub Actions deployment"
git push origin main
```

## 🎉 That's it!

Your app will now automatically deploy to Railway whenever you push to the main branch!

## Monitoring Deployments

### In GitHub:
- Go to Actions tab in your repository
- Watch the deployment progress
- Check logs if anything fails

### In Railway:
- Go to your project dashboard
- View deployment history
- Check logs and metrics

## Advanced Configuration

### Deploy on Different Branches
Edit `.github/workflows/deploy-railway.yml`:
```yaml
on:
  push:
    branches: [main, staging, production]
```

### Manual Deployment Trigger
The workflow already includes `workflow_dispatch` which allows manual runs:
1. Go to Actions tab
2. Select "Deploy to Railway" workflow
3. Click "Run workflow"

### Environment-Specific Deployments
```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://crowecode-platform.up.railway.app
```

## Troubleshooting

### "Unauthorized" Error
- Check that `RAILWAY_TOKEN` is set correctly in GitHub Secrets
- Ensure token hasn't expired
- Try regenerating token in Railway dashboard

### "Project not found" Error
- Verify `RAILWAY_PROJECT_ID` is correct
- Check that token has access to the project

### Build Failures
- Check GitHub Actions logs
- Verify all dependencies are in package.json
- Check Railway logs: `npx railway logs`

## Complete Workflow File

The workflow file is already created at:
`.github/workflows/deploy-railway.yml`

It will:
1. ✅ Trigger on push to main branch
2. ✅ Install dependencies
3. ✅ Deploy to Railway
4. ✅ Show deployment status

## Cost & Usage

- GitHub Actions: 2000 minutes/month free
- Railway: $5/month includes $5 usage
- Each deployment uses ~2-5 minutes of GitHub Actions

## Next Steps

1. **Add monitoring**: Set up deployment notifications
2. **Add staging**: Create staging environment
3. **Add tests**: Run tests before deployment
4. **Add rollback**: Implement automatic rollback on failure

## Example Enhanced Workflow

Here's an enhanced version with tests and notifications:

```yaml
name: Deploy to Railway with Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @railway/cli
      - run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      - name: Notify Success
        if: success()
        run: echo "✅ Deployed successfully!"
      - name: Notify Failure
        if: failure()
        run: echo "❌ Deployment failed!"
```

---

**Ready to deploy?** Just add the secrets to GitHub and push your code!