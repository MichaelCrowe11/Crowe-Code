# Railway Quick Deploy Script
# Run this in a new PowerShell window

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Railway Quick Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
Set-Location "C:\Users\micha\crowecode-platform"

Write-Host "Step 1: Login to Railway (browser will open)" -ForegroundColor Yellow
npx railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Login failed. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Creating new Railway project" -ForegroundColor Yellow
npx railway init --name crowecode-platform

if ($LASTEXITCODE -ne 0) {
    Write-Host "Project creation failed. You might need to link to existing project:" -ForegroundColor Yellow
    Write-Host "  npx railway link" -ForegroundColor White
    $projectId = Read-Host "Enter project ID (or press Enter to continue)"
    if ($projectId) {
        npx railway link $projectId
    }
}

Write-Host "`nStep 3: Setting environment variables" -ForegroundColor Yellow

# Core variables
npx railway variables set NODE_ENV=production
npx railway variables set PORT=3000
npx railway variables set NEXT_TELEMETRY_DISABLED=1

# NextAuth
$nextAuthSecret = Read-Host "Enter NEXTAUTH_SECRET (or press Enter to generate)"
if (-not $nextAuthSecret) {
    $nextAuthSecret = [System.Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
    Write-Host "Generated NEXTAUTH_SECRET" -ForegroundColor Green
}
npx railway variables set NEXTAUTH_SECRET=$nextAuthSecret
npx railway variables set NEXTAUTH_URL="https://crowecode-platform.up.railway.app"

# Database (if you want to add PostgreSQL)
$addDb = Read-Host "`nAdd PostgreSQL database? (Y/N)"
if ($addDb -eq 'Y' -or $addDb -eq 'y') {
    Write-Host "Adding PostgreSQL..." -ForegroundColor Yellow
    npx railway add
}

# AI Providers (optional)
Write-Host "`nAI Provider Configuration (press Enter to skip)" -ForegroundColor Cyan

$xaiKey = Read-Host "XAI_API_KEY"
if ($xaiKey) { npx railway variables set XAI_API_KEY=$xaiKey }

$anthropicKey = Read-Host "ANTHROPIC_API_KEY"
if ($anthropicKey) { npx railway variables set ANTHROPIC_API_KEY=$anthropicKey }

$openaiKey = Read-Host "OPENAI_API_KEY"
if ($openaiKey) { npx railway variables set OPENAI_API_KEY=$openaiKey }

Write-Host "`nStep 4: Deploying to Railway" -ForegroundColor Yellow
Write-Host "This will build using your Dockerfile and deploy..." -ForegroundColor Gray

npx railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Get deployment URL
    Write-Host "Getting deployment URL..." -ForegroundColor Cyan
    npx railway status

    Write-Host "`nYour app should be available at:" -ForegroundColor Green
    Write-Host "https://crowecode-platform.up.railway.app" -ForegroundColor White

    Write-Host "`nUseful commands:" -ForegroundColor Cyan
    Write-Host "  npx railway logs     - View logs" -ForegroundColor White
    Write-Host "  npx railway open     - Open dashboard" -ForegroundColor White
    Write-Host "  npx railway status   - Check status" -ForegroundColor White
    Write-Host "  npx railway down     - Stop deployment" -ForegroundColor White

    $openBrowser = Read-Host "`nOpen Railway dashboard? (Y/N)"
    if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
        npx railway open
    }

    $viewLogs = Read-Host "View deployment logs? (Y/N)"
    if ($viewLogs -eq 'Y' -or $viewLogs -eq 'y') {
        Write-Host "`nStreaming logs (Ctrl+C to stop)..." -ForegroundColor Yellow
        npx railway logs --follow
    }
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    Write-Host "Check logs with: npx railway logs" -ForegroundColor Yellow
}