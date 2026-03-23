# PulsePoint Cloudflare Installation Helper
# This script uses winget to install the required Cloudflare Tunnel daemon.

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PulsePoint — Cloud Access Setup Helper     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if winget is available
if (!(Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: 'winget' not found. Please install App Installer from the Microsoft Store." -ForegroundColor Red
    Pause
    exit
}

Write-Host "[1/2] Checking for Cloudflare cloudflared..." -ForegroundColor Yellow
if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    Write-Host "✅ cloudflared is already installed." -ForegroundColor Green
} else {
    Write-Host "⌛ Installing cloudflared via winget... (This requires admin rights)" -ForegroundColor Yellow
    winget install --id cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ cloudflared installed successfully!" -ForegroundColor Green
        Write-Host "⚠️  Note: You may need to restart your terminal or PC for the 'cloudflared' command to be recognized." -ForegroundColor Gray
    } else {
        Write-Host "❌ Installation failed. Please try running: winget install cloudflare.cloudflared" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[2/2] Enabling Cloud Access in PulsePoint..." -ForegroundColor Yellow
$EnvFilePath = Join-Path $PSScriptRoot "backend_rewrite\.env"

if (Test-Path $EnvFilePath) {
    $Content = Get-Content $EnvFilePath
    if ($Content -match "ENABLE_CLOUD=") {
        $Content = $Content -replace "ENABLE_CLOUD=.*", "ENABLE_CLOUD=true"
    } else {
        $Content += "`nENABLE_CLOUD=true"
    }
    $Content | Set-Content $EnvFilePath
    Write-Host "✅ Cloud Access enabled in .env file." -ForegroundColor Green
} else {
    Write-Host "ENABLE_CLOUD=true" | Out-File -FilePath $EnvFilePath -Encoding utf8
    Write-Host "✅ Created .env file and enabled Cloud Access." -ForegroundColor Green
}

Write-Host ""
Write-Host "══════════════════════════════════════════════"
Write-Host " 🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host " Start PulsePoint to generate your cloud link."
Write-Host "══════════════════════════════════════════════"
Write-Host ""
Pause
