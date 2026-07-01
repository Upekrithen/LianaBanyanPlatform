# ship-mnemosynec-sites.ps1
# K24 · BP102 · 2026-07-01
# Canonical Hugo multi-destination ship pipeline for mnemosynec.org + mnemosynec.ai
# Root cause fixed: hugo --minify alone builds to public/ (default) -- firebase deploys from
# public-mnemosynec/ and public-mnemosynec-ai/ -- without explicit --destination these diverge.

param(
    [string]$ExpectedVersion = ""
)

$ErrorActionPreference = "Stop"
$WorkingDir = "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"
Set-Location $WorkingDir

Write-Host "=== MnemosyneC Sites Ship Pipeline ===" -ForegroundColor Cyan
Write-Host "K24 BP102 | $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')" -ForegroundColor Cyan

# --- BUILD STEP 1: mnemosynec.org ---
Write-Host "`n[1/4] Building mnemosynec.org -> public-mnemosynec/" -ForegroundColor Yellow
hugo --config config-mnemosynec.toml --environment production --minify --destination public-mnemosynec
if ($LASTEXITCODE -ne 0) { Write-Error "Hugo build for mnemosynec.org FAILED (exit $LASTEXITCODE)"; exit 1 }
Write-Host "  OK: public-mnemosynec/ built" -ForegroundColor Green

# --- BUILD STEP 2: mnemosynec.ai ---
Write-Host "`n[2/4] Building mnemosynec.ai -> public-mnemosynec-ai/" -ForegroundColor Yellow
hugo --config config-mnemosynec-ai.toml --environment production --minify --destination public-mnemosynec-ai
if ($LASTEXITCODE -ne 0) { Write-Error "Hugo build for mnemosynec.ai FAILED (exit $LASTEXITCODE)"; exit 1 }
Write-Host "  OK: public-mnemosynec-ai/ built" -ForegroundColor Green

# --- DEPLOY ---
Write-Host "`n[3/4] Deploying both hosting targets via Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting:mnemosyne,hosting:mnemosynec-ai --project lianabanyan-403dc
if ($LASTEXITCODE -ne 0) { Write-Error "Firebase deploy FAILED (exit $LASTEXITCODE)"; exit 1 }
Write-Host "  OK: Firebase deploy complete" -ForegroundColor Green

# --- CURL VERIFY ---
Write-Host "`n[4/4] Curl verification (6 checks)..." -ForegroundColor Yellow

$checks = @(
    @{ url = "https://mnemosynec.org/download/latest.yml"; expect = "version:"; label = ".org latest.yml (machine-facing)" },
    @{ url = "https://mnemosynec.ai/download/latest.yml"; expect = "version:"; label = ".ai latest.yml (machine-facing)" },
    @{ url = "https://mnemosynec.org/"; expect = ""; label = ".org homepage (human-facing)" },
    @{ url = "https://mnemosynec.ai/"; expect = ""; label = ".ai homepage (human-facing)" },
    @{ url = "https://mnemosynec.org/download/"; expect = ""; label = ".org /download/ page (human-facing)" },
    @{ url = "https://mnemosynec.ai/download/"; expect = ""; label = ".ai /download/ page (human-facing)" }
)

$allPassed = $true
foreach ($check in $checks) {
    try {
        $response = Invoke-WebRequest -Uri $check.url -UseBasicParsing -TimeoutSec 15
        $status = $response.StatusCode
        $content = $response.Content

        if ($status -ne 200) {
            Write-Host "  FAIL $($check.label): HTTP $status" -ForegroundColor Red
            $allPassed = $false
        } elseif ($check.expect -ne "" -and $content -notmatch [regex]::Escape($check.expect)) {
            Write-Host "  FAIL $($check.label): status 200 but '$($check.expect)' not found in content" -ForegroundColor Red
            Write-Host "       First 200 chars: $($content.Substring(0, [Math]::Min(200, $content.Length)))"
            $allPassed = $false
        } else {
            if ($check.expect -ne "" -and $check.url -like "*/latest.yml") {
                $versionLine = ($content -split "`n" | Where-Object { $_ -match "^version:" } | Select-Object -First 1).Trim()
                Write-Host "  PASS $($check.label): $versionLine" -ForegroundColor Green
                if ($ExpectedVersion -ne "" -and $versionLine -notmatch [regex]::Escape($ExpectedVersion)) {
                    Write-Host "       WARNING: expected version $ExpectedVersion but got: $versionLine" -ForegroundColor DarkYellow
                }
            } else {
                Write-Host "  PASS $($check.label): HTTP 200" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "  FAIL $($check.label): $_" -ForegroundColor Red
        $allPassed = $false
    }
}

if (-not $allPassed) {
    Write-Error "SHIP PIPELINE: One or more curl checks FAILED. Deploy may be incomplete or DNS propagating."
    exit 2
}

Write-Host "`n=== SHIP COMPLETE - ALL 6 CHECKS PASSED ===" -ForegroundColor Cyan
Write-Host "mnemosynec.org + mnemosynec.ai are in sync." -ForegroundColor Cyan
