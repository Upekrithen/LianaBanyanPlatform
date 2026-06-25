# FIRE_M13c_SMOKE_2Q_V001.ps1 - 2Q smoke runner for M13c THUNDERCLAP gate - BP093/BP094
# Fires Q01 (canary) + Q02 (ABSTAIN cascade) via validate-relay.mjs + round_up_sweep.mjs.
# Expected wall-clock: 3-8 min. Must pass before firing FIRE_M13c.cmd (42Q).
#
# Usage:
#   .\FIRE_M13c_SMOKE_2Q_V001.ps1
#   .\FIRE_M13c_SMOKE_2Q_V001.ps1 -IncludeFatesSmoke

param(
    [switch]$IncludeFatesSmoke
)

$ErrorActionPreference = 'Stop'

$TOOLS_DIR = "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
$RECEIPT_BASE = "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\SMOKE_2Q_BP093_V001"
$TRIAL_ID = "SMOKE_2Q_BP093_V001"

# Create receipt dir if absent
New-Item -ItemType Directory -Force $RECEIPT_BASE | Out-Null

$TS = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH-mm-ss")
$SMOKE_LOG = "$TOOLS_DIR\m13c_smoke_2q_$TS.log"
$ROUNDUP_LOG = "$TOOLS_DIR\m13c_smoke_2q_roundup_$TS.log"

Write-Host ""
Write-Host "FIRE_M13c_SMOKE_2Q_V001 - BP094 Session 5" -ForegroundColor Cyan
Write-Host "Trial: $TRIAL_ID | Pass: A | timestamp: $TS"
Write-Host "Smoke log: $SMOKE_LOG"
Write-Host ""

# -- Step 1: validate-relay.mjs (2-question smoke) --
Write-Host "[STEP 1] Firing validate-relay.mjs (2Q smoke)..." -ForegroundColor Yellow

$validateCmd = @(
    "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs",
    "--questions=2",
    "--mode=smoke",
    "--routing=tier-aware",
    "--wire=hex-mcode",
    "--plow=mesh-12-blade",
    "--andon-escalate=star-chamber",
    "--andon-threshold=15",
    "--flagship-tier=mixed-tiered",
    "--tier-config=ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597",
    "--question-bank=$TOOLS_DIR\smoke_2q_bp093.json",
    "--per-domain-timeout=$TOOLS_DIR\per_domain_timeout_config.json",
    "--trial-id=$TRIAL_ID",
    "--pass=A"
)

$smokeOutput = node @validateCmd 2>&1
$smokeOutput | Tee-Object -FilePath $SMOKE_LOG

# Extract receipt path from output
$receiptLine = $smokeOutput | Where-Object { $_ -match "Receipt written:" } | Select-Object -Last 1
$RECEIPT_PATH = $null
if ($receiptLine -match "Receipt written:\s*(.+\.json)") {
    $RECEIPT_PATH = $matches[1].Trim()
    Write-Host ""
    Write-Host "[STEP 1] Receipt: $RECEIPT_PATH" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[STEP 1] WARNING: Could not find receipt path in validate-relay output" -ForegroundColor Red
    Write-Host "Checking receipt dir for most recent file..."
    $RECEIPT_PATH = Get-ChildItem $RECEIPT_BASE -Filter "*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
    if ($RECEIPT_PATH) {
        Write-Host "[STEP 1] Fallback receipt: $RECEIPT_PATH" -ForegroundColor Yellow
    } else {
        Write-Host "[STEP 1] FATAL: No receipt found. Aborting Round-Up." -ForegroundColor Red
        exit 2
    }
}

# Check Q01/Q02 status from smoke output
$q01Line = $smokeOutput | Where-Object { $_ -match "Q01" -and $_ -match "PASS|FAIL|source=" } | Select-Object -Last 1
$q02Line = $smokeOutput | Where-Object { $_ -match "Q02" -and $_ -match "PASS|FAIL|source=" } | Select-Object -Last 1
$scoreLines = $smokeOutput | Where-Object { $_ -match "Ensemble Score:" }

Write-Host ""
Write-Host "[STEP 1] Smoke summary:" -ForegroundColor Cyan
foreach ($line in $scoreLines) { Write-Host "  $line" }

# -- Step 2: round_up_sweep.mjs --
Write-Host ""
Write-Host "[STEP 2] Firing round_up_sweep.mjs (Posse Round-Up)..." -ForegroundColor Yellow
Write-Host "Roundup log: $ROUNDUP_LOG"

$ROUNDUP_SESSION = "roundup-$TS"

$roundupOutput = node "$TOOLS_DIR\round_up_sweep.mjs" `
    "--receipt=$RECEIPT_PATH" `
    "--tier-config=ultra:cb4ef450,full:d0b47bd0+88cbf6bd,core:c532e740+49f3e597" `
    "--session=$ROUNDUP_SESSION" `
    "--tier2-budget=0" `
    "--max-misses=2" 2>&1
$roundupOutput | Tee-Object -FilePath $ROUNDUP_LOG

Write-Host ""
Write-Host "[STEP 2] Round-Up complete. Log: $ROUNDUP_LOG" -ForegroundColor Cyan

# -- Step 3: Final gate check --
$q01Pass = ($smokeOutput | Where-Object { $_ -match "Q01" -and ($_ -match "weighted_consensus|escalation_consensus|roundup_consensus") }) -ne $null
$roundupQ02 = $roundupOutput | Where-Object { $_ -match "roundup_consensus|round_up_answer=I|correct=I" }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SMOKE_2Q_BP093_V001 GATE CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Q01 (biology): $(if ($q01Pass) { 'PASS' } else { 'PENDING-check-log' })"
Write-Host "Q02 (business): $(if ($roundupQ02) { 'PASS via roundup' } else { 'check-roundup-log' })"
Write-Host "Smoke log:   $SMOKE_LOG"
Write-Host "Roundup log: $ROUNDUP_LOG"
Write-Host "Receipt:     $RECEIPT_PATH"

# -- Optional: Fates smoke --
if ($IncludeFatesSmoke) {
    Write-Host ""
    Write-Host "[FATES SMOKE] Running bishop-side fates_smoke.mjs..." -ForegroundColor Magenta
    node "$TOOLS_DIR\fates_smoke.mjs"
    Write-Host ""
    Write-Host "[FATES SMOKE] Running member-side member_fates_smoke.mjs..." -ForegroundColor Magenta
    node "$TOOLS_DIR\member_fates_smoke.mjs"
}

Write-Host ""
Write-Host "FIRE_M13c_SMOKE_2Q_V001 complete." -ForegroundColor Green
