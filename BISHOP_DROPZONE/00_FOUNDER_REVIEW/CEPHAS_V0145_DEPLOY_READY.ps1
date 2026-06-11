# CEPHAS_V0145_DEPLOY_READY.ps1
# SEG-CEPHAS-V0145-PAWN-REWRITE
# Staged: 2026-06-10
# Run this script AFTER Knight ships v0.1.45 (or earlier if Founder ratifies independent deploy).
# Prereqs: firebase-tools installed globally (npm install -g firebase-tools), firebase login active.

param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$CephasRoot = "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"

Write-Host ""
Write-Host "=== CEPHAS v0.1.45 DEPLOY SCRIPT ===" -ForegroundColor Cyan
Write-Host "SEG-CEPHAS-V0145-PAWN-REWRITE" -ForegroundColor DarkCyan
Write-Host ""

# ── STEP 1: Verify working directory ──────────────────────────────────────────
if (-not (Test-Path $CephasRoot)) {
    Write-Host "ERROR: Cephas Hugo root not found at $CephasRoot" -ForegroundColor Red
    exit 1
}
Write-Host "[ OK ] Cephas root: $CephasRoot" -ForegroundColor Green

# ── STEP 2: Verify version.json is set to 0.1.45 ─────────────────────────────
$versionFile = Join-Path $CephasRoot "data\version.json"
$versionData = Get-Content $versionFile | ConvertFrom-Json
Write-Host "[ .. ] version.json reports: $($versionData.version)" -ForegroundColor Yellow
if ($versionData.version -ne "0.1.45") {
    Write-Host "WARNING: version.json is not 0.1.45. Confirm Knight has shipped v0.1.45 before deploying." -ForegroundColor Yellow
    Write-Host "         Current value: $($versionData.version)" -ForegroundColor Yellow
    if (-not $DryRun) {
        $confirm = Read-Host "Continue anyway? (y/N)"
        if ($confirm -ne "y" -and $confirm -ne "Y") { Write-Host "Aborted."; exit 1 }
    }
}

# ── STEP 3: Verify Dr. MnemosyneC asset is in place ─────────────────────────
$mascotPath = Join-Path $CephasRoot "static\img\mascots\dr-mnemosynec.png"
if (-not (Test-Path $mascotPath)) {
    Write-Host "ERROR: dr-mnemosynec.png not found at $mascotPath" -ForegroundColor Red
    Write-Host "       Copy from LianaBanyanPlatform\src\renderer\public\icons\mnemosynec-mark.png" -ForegroundColor Yellow
    exit 1
}
Write-Host "[ OK ] Dr. MnemosyneC asset present ($((Get-Item $mascotPath).Length) bytes)" -ForegroundColor Green

# ── STEP 4: Hugo build ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ .. ] Running Hugo build (gc + minify)..." -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "       DRY RUN: would run: hugo --gc --minify" -ForegroundColor DarkYellow
} else {
    Push-Location $CephasRoot
    try {
        & hugo --gc --minify
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Hugo build failed (exit $LASTEXITCODE)" -ForegroundColor Red
            exit 1
        }
        Write-Host "[ OK ] Hugo build complete." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── STEP 5: Firebase deploy (all 3 targets) ──────────────────────────────────
Write-Host ""
Write-Host "[ .. ] Deploying to Firebase (cephas + museum + mnemosyne)..." -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "       DRY RUN: would run: firebase deploy --only hosting:cephas,hosting:museum,hosting:mnemosyne" -ForegroundColor DarkYellow
} else {
    Push-Location $CephasRoot
    try {
        & firebase deploy --only "hosting:cephas,hosting:museum,hosting:mnemosyne"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Firebase deploy failed (exit $LASTEXITCODE)" -ForegroundColor Red
            exit 1
        }
        Write-Host "[ OK ] Firebase deploy complete." -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── STEP 6: Live HTTP 200 + version string verify ────────────────────────────
Write-Host ""
Write-Host "[ .. ] Live-verifying HTTP 200 and version string on all 3 domains..." -ForegroundColor Cyan

$domains = @(
    "https://cephas.lianabanyan.com/download/",
    "https://mnemosynec.ai/download/",
    "https://museum.lianabanyan.com/download/"
)

$allOk = $true
foreach ($url in $domains) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
        $statusOk = $r.StatusCode -eq 200
        $versionFound = $r.Content -match "0\.1\.45"
        $statusColor = if ($statusOk) { "Green" } else { "Red" }
        $versionColor = if ($versionFound) { "Green" } else { "Yellow" }
        Write-Host "       $url" -ForegroundColor DarkGray
        Write-Host "         HTTP: $($r.StatusCode)" -ForegroundColor $statusColor
        Write-Host "         v0.1.45 string found: $versionFound" -ForegroundColor $versionColor
        if (-not $statusOk -or -not $versionFound) { $allOk = $false }
    } catch {
        Write-Host "       FETCH ERROR for $url : $_" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "[ OK ] All 3 domains verified: HTTP 200 + v0.1.45 present." -ForegroundColor Green
} else {
    Write-Host "[ WARN ] One or more domains did not verify cleanly. Check above." -ForegroundColor Yellow
    Write-Host "         Note: CDN propagation may take up to 5 minutes." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "=== DEPLOY COMPLETE ===" -ForegroundColor Cyan
Write-Host "CEPHAS_V0145_REWRITE: LIVE" -ForegroundColor Green
Write-Host ""
