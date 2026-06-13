# BP078 Download Page Fix -- Deploy Script
# Staged by Bishop SEG-BX, 2026-06-09
#
# PREREQ: Firebase CLI must be logged in with an active token.
# If you see "Error: Failed to get Firebase project" or auth errors, run:
#   firebase login
# from any directory, then re-run this script.
#
# WHAT THIS DEPLOYS:
#   - mnemosynec.ai (mnemosyne target)  -- single NANO button, B1FFA2A6 SHA, "What is FULL?" accordion
#   - lianabanyan.com (cephas target)   -- same build
#   - museum target                     -- same build (frozen copy)
#
# NOTE: lianabanyan-museum-frozen (BP070 canon) -- the "museum" target in .firebaserc
# maps to "lianabanyan-museum" (NOT "lianabanyan-museum-frozen").
# Confirm with Founder whether the museum target should also be updated or skipped.
# To deploy ONLY mnemosynec.ai + lianabanyan.com, use:
#   firebase deploy --only hosting:mnemosyne,hosting:cephas
#
# FIREBASE PROJECT: lianabanyan-403dc

Set-Location "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo"

Write-Host "=== BP078 Hugo download page deploy ===" -ForegroundColor Cyan
Write-Host "Project: lianabanyan-403dc" -ForegroundColor Yellow
Write-Host "Targets: cephas (lianabanyan.com) + mnemosyne (mnemosynec.ai)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Running: firebase deploy --only hosting:cephas,hosting:mnemosyne" -ForegroundColor Green
Write-Host ""

firebase deploy --only hosting:cephas,hosting:mnemosyne

Write-Host ""
Write-Host "=== Deploy complete ===" -ForegroundColor Cyan
Write-Host "Live URLs to verify:" -ForegroundColor Yellow
Write-Host "  https://www.mnemosynec.ai/download/" -ForegroundColor White
Write-Host "  https://www.lianabanyan.com/download/" -ForegroundColor White
Write-Host ""
Write-Host "Spot-check: single NANO button, SHA B1FFA2A6, 'What is FULL?' accordion visible." -ForegroundColor Green
