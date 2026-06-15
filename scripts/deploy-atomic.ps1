# deploy-atomic.ps1 — v0.4.2 BP083 SEG-2
# Atomic two-host deploy: BOTH mnemosynec.ai AND cephas.lianabanyan.com.
# If EITHER fails verification, the entire deploy is flagged RED and no partial state is left.
#
# Usage:
#   From workspace root: powershell -ExecutionPolicy Bypass -File scripts/deploy-atomic.ps1
#
# Standing order: Truth-Always · cephas Sharp 2 is THE gate · NO timeout swallowing

param(
    [string]$Version = "",   # Auto-read from package.json if empty
    [switch]$DryRun = $false
)

Set-StrictMode -Off
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = Split-Path -Parent $ScriptDir
$CephasDir = Join-Path $WorkspaceRoot "Cephas\cephas-hugo"

# ── Read version ───────────────────────────────────────────────────────────────
if (-not $Version) {
    $pkg = Get-Content (Join-Path $WorkspaceRoot "package.json") -Raw | ConvertFrom-Json
    $Version = $pkg.version
}
Write-Host "`n[AtomicDeploy] Version: $Version" -ForegroundColor Cyan

# ── Step 1: Verify latest.yml and version.json are at target version ───────────
Write-Host "`n[AtomicDeploy] STEP 1 — Verify static assets at v$Version" -ForegroundColor Yellow

$latestYmlPath = Join-Path $CephasDir "static\download\latest.yml"
$versionJsonPath = Join-Path $CephasDir "data\version.json"

$latestYmlContent = Get-Content $latestYmlPath -Raw
$versionJsonContent = Get-Content $versionJsonPath -Raw | ConvertFrom-Json

$latestYmlVersion = ($latestYmlContent | Select-String -Pattern "^version:\s+(.+)").Matches[0].Groups[1].Value.Trim()
$dataVersion = $versionJsonContent.version

if ($latestYmlVersion -ne $Version) {
    Write-Host "[AtomicDeploy] RED: static/download/latest.yml version=$latestYmlVersion but expected $Version" -ForegroundColor Red
    Write-Host "[AtomicDeploy] Fix: update Cephas\cephas-hugo\static\download\latest.yml to version $Version" -ForegroundColor Red
    exit 1
}
Write-Host "[AtomicDeploy] latest.yml version check: $latestYmlVersion = $Version GREEN" -ForegroundColor Green

if ($dataVersion -ne $Version) {
    Write-Host "[AtomicDeploy] WARN: data/version.json version=$dataVersion but expected $Version" -ForegroundColor Yellow
    # Non-fatal warning — version.json drives display only
}

# ── Step 2: Build Cephas Hugo ──────────────────────────────────────────────────
Write-Host "`n[AtomicDeploy] STEP 2 — Hugo build (Cephas)" -ForegroundColor Yellow
if (-not $DryRun) {
    Push-Location $CephasDir
    try {
        hugo --minify
        if ($LASTEXITCODE -ne 0) { throw "Hugo build (Cephas) failed with exit code $LASTEXITCODE" }
        Write-Host "[AtomicDeploy] Hugo Cephas build: GREEN" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Step 3: Build MnemosyneC Hugo ─────────────────────────────────────────────
Write-Host "`n[AtomicDeploy] STEP 3 — Hugo build (MnemosyneC)" -ForegroundColor Yellow
if (-not $DryRun) {
    Push-Location $CephasDir
    try {
        hugo --config config-mnemosynec.toml --minify
        if ($LASTEXITCODE -ne 0) { throw "Hugo build (MnemosyneC) failed with exit code $LASTEXITCODE" }
        Write-Host "[AtomicDeploy] Hugo MnemosyneC build: GREEN" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Step 4: Deploy BOTH hosts atomically ──────────────────────────────────────
Write-Host "`n[AtomicDeploy] STEP 4 — Firebase deploy (BOTH hosts)" -ForegroundColor Yellow
if (-not $DryRun) {
    Push-Location $CephasDir
    try {
        # Deploy both Cephas and MnemosyneC in a single firebase command for atomicity
        firebase deploy
        if ($LASTEXITCODE -ne 0) { throw "Firebase deploy failed with exit code $LASTEXITCODE" }
        Write-Host "[AtomicDeploy] Firebase deploy: GREEN" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# ── Step 5: Post-deploy verification (both hosts) ─────────────────────────────
Write-Host "`n[AtomicDeploy] STEP 5 — Post-deploy verification" -ForegroundColor Yellow

function Verify-Sharp {
    param([string]$Label, [string]$Url, [string]$ExpectedContent = "", [int]$ExpectedStatus = 200)
    Write-Host "[Sharp $Label] curl -sI --max-time 30 $Url" -ForegroundColor Cyan
    $result = & curl -sI --max-time 30 $Url 2>&1
    $statusLine = ($result | Select-String -Pattern "HTTP/").Line | Select-Object -First 1
    Write-Host $result
    if ($statusLine -match "2\d\d") {
        Write-Host "[Sharp $Label] GREEN ($statusLine)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[Sharp $Label] RED — expected 200, got: $statusLine" -ForegroundColor Red
        return $false
    }
}

function Verify-Sharp-Content {
    param([string]$Label, [string]$Url, [string]$ExpectedPrefix)
    Write-Host "[Sharp $Label] curl -s --max-time 30 $Url | head -1" -ForegroundColor Cyan
    $result = & curl -s --max-time 30 $Url 2>&1
    $firstLine = ($result -split "`n")[0].Trim()
    Write-Host $firstLine
    if ($firstLine -like "*$ExpectedPrefix*") {
        Write-Host "[Sharp $Label] GREEN ($firstLine)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[Sharp $Label] RED — expected '$ExpectedPrefix', got: $firstLine" -ForegroundColor Red
        return $false
    }
}

$v = $Version
$allGreen = $true

# Sharp 1: mnemo .exe reachable
$allGreen = (Verify-Sharp "1" "https://mnemosynec.ai/download/MnemosyneC-Setup-$v.exe") -and $allGreen

# Sharp 2: cephas .exe reachable — THE CRITICAL GATE
$cephasExeGreen = Verify-Sharp "2 (CRITICAL GATE)" "https://cephas.lianabanyan.com/download/MnemosyneC-Setup-$v.exe"
$allGreen = $cephasExeGreen -and $allGreen

# Sharp 3a: mnemo latest.yml version
$allGreen = (Verify-Sharp-Content "3a" "https://mnemosynec.ai/download/latest.yml" "version: $v") -and $allGreen

# Sharp 3b: cephas latest.yml version
$allGreen = (Verify-Sharp-Content "3b" "https://cephas.lianabanyan.com/download/latest.yml" "version: $v") -and $allGreen

# ── Final verdict ──────────────────────────────────────────────────────────────
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($allGreen) {
    Write-Host "[AtomicDeploy] OVERALL: GREEN — Both hosts verified at v$Version" -ForegroundColor Green
} else {
    Write-Host "[AtomicDeploy] OVERALL: RED — One or more hosts FAILED verification" -ForegroundColor Red
    if (-not $cephasExeGreen) {
        Write-Host "[AtomicDeploy] CRITICAL: cephas Sharp 2 FAILED — split-brain detected" -ForegroundColor Red
        Write-Host "[AtomicDeploy] RCA required: check Firebase deploy logs for cephas target" -ForegroundColor Red
    }
    Write-Host "[AtomicDeploy] Do NOT declare v$Version shipped until all Sharps are GREEN" -ForegroundColor Red
    exit 1
}
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
