# rebuild-cephas-proofs-mirror.ps1
# BP094 Session 4 - Mamba 5.6
# Rebuilds the Cephas Hugo proofs mirror and deploys to preview channel.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$WORKSPACE = "C:\Users\Administrator\Documents\LianaBanyanPlatform"

Write-Host "=== Cephas Proofs Mirror Rebuild - BP094 S4 ==="

# Step 1a: Extract proofs data from ProofsPage.tsx -> proofs.json
Write-Host "`n[1a/4] Running mirror-proofs-to-hugo.js ..."
node "$WORKSPACE\tools\mirror-proofs-to-hugo.js"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: mirror-proofs-to-hugo.js failed (exit $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}

# Step 1b: Extract howitallworks data from explainerCorpus.ts -> howitallworks.json
Write-Host "`n[1b/4] Running mirror-howitallworks-to-hugo.js ..."
node "$WORKSPACE\tools\mirror-howitallworks-to-hugo.js"
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: mirror-howitallworks-to-hugo.js failed (exit $LASTEXITCODE) - continuing" -ForegroundColor Yellow
}

# Step 2: Hugo build
Write-Host "`n[2/4] Running hugo build in cephas-hugo ..."
Push-Location "$WORKSPACE\Cephas\cephas-hugo"
try {
    hugo --minify
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: hugo build failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

# Step 3: Firebase preview channel deploy
Write-Host "`n[3/4] Deploying to Firebase preview channel ..."
Push-Location "$WORKSPACE"
try {
    firebase hosting:channel:deploy bp094-s4-thunderclap-preview --expires 7d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: firebase deploy failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host "`n=== Rebuild Complete ===" -ForegroundColor Green
Write-Host "Preview channel: bp094-s4-thunderclap-preview (expires 7d)"
