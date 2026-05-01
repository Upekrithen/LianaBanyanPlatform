<#
.SYNOPSIS
    LB Frame Installer — Build / packaging script
    Assembles payload/, computes SHA-256 checksums, writes manifest.json,
    and zips everything into dist/LBFrame-Setup-v<Version>-walkaround-demo.zip
    Bean: KN072 / BP006 / Pod EE
    Liana Banyan Corporation — AGPL v3
#>
param(
    [string]$Version = "0.1.0",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "===== LB FRAME INSTALLER BUILD =====" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Cyan
Write-Host "Root:    $Root" -ForegroundColor Cyan
Write-Host ""

# ── Source locations ──────────────────────────────────────────────────────────
$HooksSrc     = Join-Path $env:USERPROFILE ".claude\hooks"
$EbletsSrc    = Join-Path $env:USERPROFILE ".claude\state\eblets\CANON"
$WalkaroundSrc= "C:\Users\Administrator\Documents"
$MemorySrc    = Join-Path $env:USERPROFILE ".claude\projects\C--Users-Administrator-Documents\memory\MEMORY.md"

# ── Payload destinations ───────────────────────────────────────────────────────
$PayloadDir   = Join-Path $Root "payload"
$HooksDst     = Join-Path $PayloadDir "hooks"
$EbletsDst    = Join-Path $PayloadDir "eblets\CANON"
$WalkaroundDst= Join-Path $PayloadDir "walkaround"
$DistDir      = Join-Path $Root "dist"

# ── Ensure destination directories exist ──────────────────────────────────────
foreach ($d in @($HooksDst, $EbletsDst, (Join-Path $EbletsDst "GOLDEN"), $WalkaroundDst, $DistDir)) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
}

$manifest = @{
    version      = $Version
    build_date   = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    package_name = "LBFrame-Setup-v$Version-walkaround-demo.zip"
    file_count   = 0
    files        = @()
}

function Add-ToManifest {
    param([string]$RelPath, [string]$SrcPath, [string]$DstPath)
    if (-not (Test-Path $DstPath)) {
        Write-Host "  MISSING source: $SrcPath" -ForegroundColor Yellow
        return
    }
    $sha = (Get-FileHash $DstPath -Algorithm SHA256).Hash.ToLower()
    $manifest.files += @{
        path   = $RelPath
        source = $SrcPath
        sha256 = $sha
    }
}

# ── Step 1: Copy bishop hooks ─────────────────────────────────────────────────
Write-Host "  → Copying bishop hooks..." -ForegroundColor Cyan
if (-not (Test-Path $HooksSrc)) {
    Write-Host "  ⚠ Hooks source not found: $HooksSrc" -ForegroundColor Yellow
} else {
    $hooks = Get-ChildItem $HooksSrc -Filter "bishop_*.py" -File
    foreach ($h in $hooks) {
        $dst = Join-Path $HooksDst $h.Name
        if (-not (Test-Path $dst) -or $Force) {
            Copy-Item $h.FullName $dst
        }
        Add-ToManifest "hooks/$($h.Name)" $h.FullName $dst
    }
    Write-Host "  ✓ $($hooks.Count) hook(s) copied" -ForegroundColor Green
}

# ── Step 2: Copy CANON Eblets (recurse, preserve GOLDEN/ subdir) ──────────────
Write-Host "  → Copying CANON Eblets..." -ForegroundColor Cyan
if (-not (Test-Path $EbletsSrc)) {
    Write-Host "  ⚠ Eblets source not found: $EbletsSrc" -ForegroundColor Yellow
} else {
    $eblets = Get-ChildItem $EbletsSrc -Filter "*.eblet.md" -File -Recurse
    foreach ($e in $eblets) {
        $rel = $e.FullName.Substring($EbletsSrc.Length).TrimStart('\', '/')
        $dst = Join-Path $EbletsDst $rel
        $dstDir = Split-Path $dst -Parent
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
        if (-not (Test-Path $dst) -or $Force) {
            Copy-Item $e.FullName $dst
        }
        Add-ToManifest "eblets/CANON/$rel" $e.FullName $dst
    }
    Write-Host "  ✓ $($eblets.Count) eblet(s) copied" -ForegroundColor Green
}

# ── Step 3: Copy Walkaround.ps1 + walkaround.bat ─────────────────────────────
Write-Host "  → Copying Walkaround files..." -ForegroundColor Cyan
foreach ($wf in @("Walkaround.ps1", "walkaround.bat")) {
    $srcPath = Join-Path $WalkaroundSrc $wf
    $dstPath = Join-Path $WalkaroundDst $wf
    if (Test-Path $srcPath) {
        if (-not (Test-Path $dstPath) -or $Force) {
            Copy-Item $srcPath $dstPath
        }
        Add-ToManifest "walkaround/$wf" $srcPath $dstPath
        Write-Host "  ✓ $wf" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Not found: $srcPath" -ForegroundColor Yellow
    }
}

# ── Step 4: Copy MEMORY.md template ──────────────────────────────────────────
if (Test-Path $MemorySrc) {
    $memDst = Join-Path $PayloadDir "MEMORY.md.template"
    if (-not (Test-Path $memDst) -or $Force) {
        Copy-Item $MemorySrc $memDst
    }
    Add-ToManifest "MEMORY.md.template" $MemorySrc $memDst
    Write-Host "  ✓ MEMORY.md template" -ForegroundColor Green
}

# ── Step 5: Write manifest.json ───────────────────────────────────────────────
$manifest.file_count = $manifest.files.Count
$manifestPath = Join-Path $Root "manifest.json"
$manifest | ConvertTo-Json -Depth 5 | Set-Content $manifestPath -Encoding UTF8
Write-Host "  ✓ manifest.json written ($($manifest.file_count) files)" -ForegroundColor Green

# ── Step 6: Build zip ─────────────────────────────────────────────────────────
$zipName = "LBFrame-Setup-v$Version-walkaround-demo.zip"
$zipPath = Join-Path $DistDir $zipName

if ((Test-Path $zipPath) -and -not $Force) {
    Write-Host "  ⚠ $zipName already exists in dist/ — use -Force to rebuild" -ForegroundColor Yellow
} else {
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

    # Include: payload/, LBFrame-Setup.ps1, README.md, manifest.json
    $zipSources = @()
    foreach ($item in @("payload", "LBFrame-Setup.ps1", "README.md", "manifest.json")) {
        $p = Join-Path $Root $item
        if (Test-Path $p) { $zipSources += $p }
    }

    if ($zipSources.Count -gt 0) {
        Compress-Archive -Path $zipSources -DestinationPath $zipPath -Force
        Write-Host "  ✓ $zipName created in dist/" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ No source items to zip" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===== BUILD COMPLETE =====" -ForegroundColor Green
Write-Host "✓ LBFrame-Setup-v$Version-walkaround-demo.zip created in dist/" -ForegroundColor Green
Write-Host ""
