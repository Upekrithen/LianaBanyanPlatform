# fire-trial-02.ps1 -- THUNDERCLAP Trial 02 orchestrator
# MAMBA-zeta BP087
# Run from tools\mesh-validation\ directory or with absolute paths
#
# Empirically confirmed valid flags (from validate-relay.mjs source):
#   --routing, --mode, --questions, --timeout, --session, --wire, --plow,
#   --andon-escalate, --andon-threshold, --exclude-peer
#
# NOT FOUND in source: --unfair-advantage, --output-json
# Receipts are written by validate-relay.mjs to BISHOP_DROPZONE\00_FOUNDER_REVIEW\
#
# PowerShell 7+ syntax. Use ';' to chain commands.

# SCRAMBLER HOOK -- session_start (Row 2h close)
# Call before first peer dispatch to enforce deterministic blade ordering
# MCP tool: scrambler_session_start agent=THUNDERCLAP_TRIAL_02
$sessionId = (Get-Date -Format 'yyyyMMdd_HHmmssZ')
# node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\scrambler-mesh-hook.mjs" start $sessionId
# (uncomment above line when librarian-mcp-client.mjs is wired)

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$receiptDir = "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02"
$gatesScript = "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\gates_check.mjs"
$validateScript = "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs"
$templateMd = "$receiptDir\TRIAL_02_RECEIPT_TEMPLATE.md"
$validateReceiptDir = "C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW"

Write-Host "THUNDERCLAP Trial 02 -- pre-fire gate check -- $timestamp"

# Step 1: Run gate check
node $gatesScript
$gateExitCode = $LASTEXITCODE

if ($gateExitCode -ne 0) {
    Write-Host "GATE CHECK FAILED -- fire aborted -- review gate output above"
    exit 1
}

Write-Host "GATE CHECK: 7/7 GREEN -- firing validate-relay.mjs"

# Step 2: Fire validate-relay.mjs with full flag stack
# Flags confirmed from validate-relay.mjs source:
#   --routing=staggered-then-connected  (MAMBA-zeta two-phase routing)
#   --mode=full                         (70-question run)
#   --questions=70                      (explicit count for full run)
#   --wire=hex-mcode                    (wire protocol -- cross-vendor)
#   --plow=mesh-12-blade                (plow mode -- full mesh blade)
#   --andon-escalate=star-chamber       (Andon escalation enabled)
#   --session=THUNDERCLAP-Trial-02-$timestamp  (canonical session ID)
$sessionId = "THUNDERCLAP-Trial-02-$timestamp"

node $validateScript `
    --routing=staggered-then-connected `
    --mode=full `
    --questions=70 `
    --wire=hex-mcode `
    --plow=mesh-12-blade `
    --andon-escalate=star-chamber `
    --session=$sessionId

$validateExitCode = $LASTEXITCODE
Write-Host "validate-relay complete -- exit code: $validateExitCode"

# Step 3: Locate the most recent receipt JSON written by validate-relay.mjs
$latestJson = Get-ChildItem -Path $validateReceiptDir -Filter "VALIDATION_RUN_RECEIPT_RELAY_*.json" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($latestJson) {
    Write-Host "Receipt JSON minted: $($latestJson.FullName)"
    # Copy receipt JSON to Trial_02 dir for archival
    $archiveJson = "$receiptDir\TRIAL_02_RESULT_$timestamp.json"
    Copy-Item $latestJson.FullName $archiveJson
    Write-Host "Receipt JSON archived to: $archiveJson"
} else {
    Write-Host "WARNING: No VALIDATION_RUN_RECEIPT_RELAY_*.json found in $validateReceiptDir"
}

# Step 4: Stamp a receipt MD from template
$receiptMd = "$receiptDir\TRIAL_02_RECEIPT_$timestamp.md"
Copy-Item $templateMd $receiptMd
Write-Host "Receipt template copied to: $receiptMd"

if ($validateExitCode -eq 0) {
    Write-Host "THUNDERCLAP Trial 02 fire complete -- validate-relay PASSED -- fill receipt fields from output above"
} else {
    Write-Host "THUNDERCLAP Trial 02 fire complete -- validate-relay FAILED (exit $validateExitCode) -- review output above"
}

# SCRAMBLER HOOK -- session_closeout (Row 2h close)
# node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\scrambler-mesh-hook.mjs" closeout $sessionId "TRIAL_02_COMPLETE"
# (uncomment above line when librarian-mcp-client.mjs is wired)
