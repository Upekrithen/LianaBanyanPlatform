# BP078_INCENTIVE_TO_HIRE_DEPLOY.ps1
# STAGED DEPLOY SCRIPT -- DO NOT RUN until Founder explicitly ratifies.
#
# This script merges the bp078-incentive-to-hire-website branch into main,
# builds Hugo, and deploys to all three Firebase hosting targets
# (cephas, museum, mnemosyne).
#
# Compose with SEG-BX: If SEG-BX has a page-fix branch also awaiting ratify,
# merge THAT branch into main in the same block before running hugo --minify.
# One Firebase deploy covers both. See receipt for details.
#
# Branch: bp078-incentive-to-hire-website
# Commit: ec41e01
# Receipt: BP078_INCENTIVE_TO_HIRE_WEBSITE_PLACEMENT_RECEIPT.md
#
# Ratify gate: Founder says "publish it / push / send / fire" before running.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$REPO = "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"

Write-Host "=== BP078 Incentive to Hire -- Deploy Script ===" -ForegroundColor Cyan
Write-Host "Branch: bp078-incentive-to-hire-website | Commit: ec41e01"
Write-Host ""

# Step 1: Checkout main and merge
Write-Host "[1/4] Checkout main and merge branch..." -ForegroundColor Yellow
Set-Location $REPO
git checkout main
git merge --no-ff bp078-incentive-to-hire-website -m "Merge: Incentive to Hire website placement (BP078 ratified)"

# Step 2: Hugo build
Write-Host "[2/4] Hugo build (minify)..." -ForegroundColor Yellow
hugo --minify
if ($LASTEXITCODE -ne 0) {
    Write-Host "Hugo build FAILED. Aborting deploy." -ForegroundColor Red
    exit 1
}
Write-Host "Hugo build CLEAN." -ForegroundColor Green

# Step 3: Deploy to all three Firebase targets
Write-Host "[3/4] Deploy to Firebase (cephas + museum + mnemosyne)..." -ForegroundColor Yellow
firebase deploy --only hosting:cephas,hosting:museum,hosting:mnemosyne

# Step 4: Confirm
Write-Host "[4/4] Deploy complete." -ForegroundColor Green
Write-Host "Live at: https://lianabanyan.com/incentive-to-hire/" -ForegroundColor Cyan
Write-Host "Live at: https://mnemosynec.ai/incentive-to-hire/" -ForegroundColor Cyan
