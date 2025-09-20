# Railway Browserless Deployment Script for PowerShell
# Deploy to Railway without opening a browser

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Railway CLI Deployment (No Browser)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
try {
    $railwayVersion = npx railway --version 2>$null
    Write-Host "✓ Railway CLI found: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Function to setup Railway project with token
function Setup-RailwayProject {
    Write-Host "`nSetting up Railway project..." -ForegroundColor Yellow

    # Check if we have a Railway token
    if (-not $env:RAILWAY_TOKEN) {
        Write-Host "`nTo deploy without a browser, we'll use Railway's project token." -ForegroundColor Yellow
        Write-Host "You have two options:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Option 1: Use an existing Railway project token" -ForegroundColor White
        Write-Host "  - Go to your Railway project dashboard" -ForegroundColor Gray
        Write-Host "  - Click on Settings > Tokens" -ForegroundColor Gray
        Write-Host "  - Create a new token" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Option 2: Create a new project via API (requires account token)" -ForegroundColor White
        Write-Host "  - Go to: https://railway.app/account/tokens" -ForegroundColor Gray
        Write-Host "  - Create an account-level token" -ForegroundColor Gray
        Write-Host ""

        $token = Read-Host "Enter your Railway token"
        $env:RAILWAY_TOKEN = $token

        # Save to .env for future use
        Add-Content -Path ".env.railway" -Value "RAILWAY_TOKEN=$token"
        Write-Host "✓ Token saved to .env.railway" -ForegroundColor Green
    } else {
        Write-Host "✓ Railway token found in environment" -ForegroundColor Green
    }
}

# Function to deploy
function Deploy-ToRailway {
    Write-Host "`nDeploying to Railway..." -ForegroundColor Yellow

    # Set environment variables via CLI
    Write-Host "Setting environment variables..." -ForegroundColor Cyan

    # Core variables
    npx railway variables set NODE_ENV=production
    npx railway variables set PORT=3000

    # Get other environment variables from .env files if they exist
    if (Test-Path ".env.production") {
        Write-Host "Found .env.production - using those values" -ForegroundColor Green
    }

    # Deploy
    Write-Host "`nStarting deployment..." -ForegroundColor Yellow
    npx railway up --detach

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Deployment initiated successfully!" -ForegroundColor Green

        # Get deployment URL
        Write-Host "`nGetting deployment URL..." -ForegroundColor Cyan
        npx railway status

    } else {
        Write-Host "✗ Deployment failed" -ForegroundColor Red
        exit 1
    }
}

# Function to monitor deployment
function Monitor-Deployment {
    Write-Host "`nWould you like to monitor the deployment logs? (Y/N)" -ForegroundColor Cyan
    $monitor = Read-Host

    if ($monitor -eq 'Y' -or $monitor -eq 'y') {
        Write-Host "Streaming deployment logs (Ctrl+C to stop)..." -ForegroundColor Yellow
        npx railway logs --follow
    }
}

# Main execution
try {
    Setup-RailwayProject
    Deploy-ToRailway

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  npx railway logs     - View logs" -ForegroundColor White
    Write-Host "  npx railway status   - Check status" -ForegroundColor White
    Write-Host "  npx railway open     - Open in browser" -ForegroundColor White
    Write-Host "  npx railway down     - Stop deployment" -ForegroundColor White
    Write-Host ""

    Monitor-Deployment
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}