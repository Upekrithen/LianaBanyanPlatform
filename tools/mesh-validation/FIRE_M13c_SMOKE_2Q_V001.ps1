# FIRE_M13c_SMOKE_2Q_V001.ps1
# M13c 2Q SMOKE RUNNER -- BP093 . Sonnet 4.6 . 2026-06-23
# Fires exactly 2 questions via validate-relay.mjs before committing to the 42Q THUNDERCLAP.
#
# Q01 (source_id=2804 . biology) -- CANARY: known-good, unanimous B in Trial_02_V060.
#   PASS criteria: majority answer=B, all 5 peers respond, no cascade anomaly.
#
# Q02 (source_id=70 . business) -- ABSTAIN CASCADE TARGET: 4/5 peers ABSTAINed in Trial_02_V060;
#   ULTRA (cb4ef450) returned D; cascade accepted D via single_peer_fallback (wrong, correct=I).
#   PASS criteria: validate-relay.mjs records single_peer_fallback OR ABSTAIN-contested result
#   in receipt (same as before) AND round_up_sweep.mjs (M24 Hotfix) subsequently fires Posse
#   on source_id=70 and resolves correctly to I.
#   NOTE: The in-run validate-relay.mjs cascade bug (single_peer_fallback) is only fully patched
#   in Full M24 Marathon. This smoke verifies the POST-RUN Round-Up catches and re-attacks Q02.
#
# TRIAL ID: SMOKE_2Q_BP093_V001
# Expected wall-clock: 3-8 min (2Q x low-disagreement 600s domain timeout, likely resolves faster)
# Receipt dest: C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\SMOKE_2Q_BP093

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# -- Paths ------------------------------------------------------------------------
$SCRIPT_DIR    = "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
$VALIDATE_MJS  = "$SCRIPT_DIR\validate-relay.mjs"
$ROUND_UP_MJS  = "$SCRIPT_DIR\round_up_sweep.mjs"
$QUESTION_BANK = "$SCRIPT_DIR\smoke_2q_bp093.json"
$SECRETS_FILE  = "C:\Users\Administrator\.claude\state\secrets\22May2026.env"
$PUB_ENV_FILE  = "C:\Users\Administrator\Documents\LianaBanyanPlatform\resources\supabase_public.env"
$DOMAIN_TIMEOUT_CFG = "$SCRIPT_DIR\per_domain_timeout_config.json"
$RECEIPT_BASE  = "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP"
$TRIAL_ID      = "SMOKE_2Q_BP093_V001"
$RECEIPT_DIR   = "$RECEIPT_BASE\$TRIAL_ID"
$LOG_DIR       = $SCRIPT_DIR

# -- Pre-flight checks ------------------------------------------------------------
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  M13c SMOKE 2Q PRE-FLIGHT -- BP093" -ForegroundColor Cyan
Write-Host "  Validate posse + ABSTAIN cascade + ledger BEFORE 42Q THUNDERCLAP" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Node available?
Write-Host "[PRE-FLIGHT 1/5] Checking Node.js..." -NoNewline
try {
    $nodeVer = & node --version 2>&1
    Write-Host " OK ($nodeVer)" -ForegroundColor Green
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "ERROR: 'node' not found in PATH. Install Node.js 18+ and retry." -ForegroundColor Red
    exit 2
}

# 2. validate-relay.mjs exists?
Write-Host "[PRE-FLIGHT 2/5] Checking validate-relay.mjs..." -NoNewline
if (Test-Path $VALIDATE_MJS) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "ERROR: Not found: $VALIDATE_MJS" -ForegroundColor Red
    exit 2
}

# 3. Question bank JSON exists?
Write-Host "[PRE-FLIGHT 3/5] Checking smoke question bank (smoke_2q_bp093.json)..." -NoNewline
if (Test-Path $QUESTION_BANK) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "ERROR: Question bank not found: $QUESTION_BANK" -ForegroundColor Red
    Write-Host "  Bishop should have written this file. Check FIRE_M13c_SMOKE_2Q_V001.ps1 dispatch notes." -ForegroundColor Yellow
    exit 2
}

# 4. Secrets file accessible?
Write-Host "[PRE-FLIGHT 4/5] Checking secrets file..." -NoNewline
if (Test-Path $SECRETS_FILE) {
    Write-Host " OK (exists, not echoing)" -ForegroundColor Green
} else {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "ERROR: Secrets file not found: $SECRETS_FILE" -ForegroundColor Red
    exit 2
}

# 5. Per-domain timeout config?
Write-Host "[PRE-FLIGHT 5/5] Checking per_domain_timeout_config.json..." -NoNewline
if (Test-Path $DOMAIN_TIMEOUT_CFG) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " MISSING -- will use global timeout=600s fallback" -ForegroundColor Yellow
}

# -- Load SERVICE_ROLE_KEY --------------------------------------------------------
$_svc_key = ''
try {
    $rawSecrets = Get-Content $SECRETS_FILE -Raw -Encoding UTF8
    foreach ($keyName in @('SUPABASE_SERVICE_ROLE_KEY','Supabase_Secret_Key','Supabase_Service_Role_Key')) {
        $match = [regex]::Match($rawSecrets, "(?m)^${keyName}=(.+)$")
        if ($match.Success) {
            $_svc_key = $match.Groups[1].Value.Trim() -replace '#.*$','' | ForEach-Object { $_.Trim() }
            break
        }
    }
} catch {
    Write-Host "WARNING: Could not parse secrets file. validate-relay.mjs will attempt self-load." -ForegroundColor Yellow
}

if ($_svc_key -ne '') {
    $env:SUPABASE_SERVICE_ROLE_KEY = $_svc_key
    Write-Host "[SECRETS] SERVICE_ROLE_KEY injected into child env (length=$($_svc_key.Length), not echoed)" -ForegroundColor DarkGray
} else {
    Write-Host "[SECRETS] WARNING: SERVICE_ROLE_KEY not found in secrets file -- validate-relay.mjs must self-load" -ForegroundColor Yellow
}

# Public env belt-and-suspenders
try {
    $rawPub = Get-Content $PUB_ENV_FILE -Raw -Encoding UTF8
    $urlMatch  = [regex]::Match($rawPub, '(?m)^SUPABASE_URL=(.+)$')
    $anonMatch = [regex]::Match($rawPub, '(?m)^SUPABASE_ANON_KEY=(.+)$')
    if ($urlMatch.Success)  { $env:SUPABASE_URL      = $urlMatch.Groups[1].Value.Trim() }
    if ($anonMatch.Success) { $env:SUPABASE_ANON_KEY = $anonMatch.Groups[1].Value.Trim() }
    Write-Host "[SECRETS] SUPABASE_URL + ANON_KEY injected from public env" -ForegroundColor DarkGray
} catch {
    Write-Host "[SECRETS] WARNING: Could not load public env -- validate-relay.mjs will self-load" -ForegroundColor Yellow
}

# -- Receipt directory -------------------------------------------------------------
if (-not (Test-Path $RECEIPT_DIR)) {
    New-Item -ItemType Directory -Force -Path $RECEIPT_DIR | Out-Null
    Write-Host "[RECEIPT] Created receipt dir: $RECEIPT_DIR" -ForegroundColor DarkGray
}

# -- Banner ------------------------------------------------------------------------
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  M13c SMOKE 2Q -- READY TO FIRE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  Questions       : 2 (pinned via --question-bank)"
Write-Host "  Q01 source_id   : 2804 (biology . canary . expected B unanimous)"
Write-Host "  Q02 source_id   : 70   (business . ABSTAIN cascade target . correct=I)"
Write-Host "  Target fleet    : 5 peers . relay.lianabanyan.com (WAN)"
Write-Host "  Fleet tiers     : ULTRA cb4ef450 llama3.3:70b"
Write-Host "                    FULL  d0b47bd0+88cbf6bd gemma4:12b"
Write-Host "                    CORE  c532e740+49f3e597 gemma2:9b"
Write-Host "  Routing         : tier-aware (Ah Hayelped BP091)"
Write-Host "  ABSTAIN proto   : active"
Write-Host "  Wire format     : hex-mcode"
Write-Host "  Plow            : mesh-12-blade"
Write-Host "  Trial ID        : $TRIAL_ID"
Write-Host "  Est. wall-clock : 3-8 min"
Write-Host "  Receipt dest    : $RECEIPT_DIR"
Write-Host ""
Write-Host "  GO/NO-GO after smoke completes:" -ForegroundColor Yellow
Write-Host "  Q01 PASS = majority B + no cascade anomaly" -ForegroundColor Yellow
Write-Host "  Q02 PASS = receipt shows ABSTAIN pattern + Round-Up re-attacks + resolves to I" -ForegroundColor Yellow
Write-Host "  Both PASS --> fire FIRE_M13c.cmd (42Q THUNDERCLAP)" -ForegroundColor Yellow
Write-Host "  Q02 FAIL --> hold, patch needed, do NOT fire 42Q" -ForegroundColor Yellow
Write-Host "  Q01 FAIL --> basic wiring broken, investigate before any THUNDERCLAP" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press ENTER to fire smoke, or Ctrl-C to abort." -ForegroundColor Yellow
$null = Read-Host

# -- Log file setup ----------------------------------------------------------------
$timestamp = (Get-Date -Format 'yyyy-MM-ddTHH-mm-ss')
$LOG_FILE  = "$LOG_DIR\m13c_smoke_2q_${timestamp}.log"

Write-Host ""
Write-Host "Firing validate-relay.mjs (2Q smoke)..." -ForegroundColor Green
Write-Host "TEE log: $LOG_FILE" -ForegroundColor DarkGray
Write-Host ""

# -- PHASE 1: validate-relay.mjs 2Q run ------------------------------------------
$nodeArgs = @(
    $VALIDATE_MJS,
    "--questions=2",
    "--mode=smoke",
    "--routing=tier-aware",
    "--answer-tier-config=ultra:cb4ef450cc4a18c3,full:d0b47bd08633385b+88cbf6bdd6f74587",
    "--mic-tier-config=core:c532e74069e137bc+49f3e5971518a064",
    "--question-difficulty-routing=hard:ultra+full,medium:ultra+full+core,short:all",
    "--andon-escalate=star-chamber",
    "--andon-threshold=15",
    "--wire=hex-mcode",
    "--plow=mesh-12-blade",
    "--flagship-tier=mixed-tiered",
    "--trial-id=$TRIAL_ID",
    "--pass=A",
    "--per-domain-timeout=$DOMAIN_TIMEOUT_CFG",
    "--question-bank=$QUESTION_BANK"
)

$PHASE1_START = Get-Date
& node @nodeArgs 2>&1 | Tee-Object -FilePath $LOG_FILE
$EXIT_CODE_PHASE1 = $LASTEXITCODE
$PHASE1_END  = Get-Date
$ELAPSED1    = [math]::Round(($PHASE1_END - $PHASE1_START).TotalMinutes, 1)

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  PHASE 1 COMPLETE -- validate-relay.mjs 2Q run" -ForegroundColor Cyan
Write-Host "  Exit code    : $EXIT_CODE_PHASE1"
Write-Host "  Wall-clock   : ${ELAPSED1} min"
Write-Host "========================================================================" -ForegroundColor Cyan

# -- PHASE 2: round_up_sweep.mjs (M24 Hotfix) ------------------------------------
Write-Host ""
if (Test-Path $ROUND_UP_MJS) {
    Write-Host "  round_up_sweep.mjs FOUND -- firing Round-Up on miss-list..." -ForegroundColor Green
    Write-Host "  (This is the M24 Hotfix Posse sweep. ABSTAIN Q02 should be re-attacked here.)" -ForegroundColor DarkGray
    Write-Host ""

    # Locate the receipt written by Phase 1 (validate-relay.mjs names it
    # <TRIAL_ID>_RECEIPT_<timestamp>.json inside $RECEIPT_DIR).
    # We glob after Phase 1 completes because the Node timestamp differs from $timestamp.
    $receiptFiles = Get-ChildItem -Path $RECEIPT_DIR -Filter "${TRIAL_ID}_RECEIPT_*.json" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending
    if ($receiptFiles.Count -eq 0) {
        Write-Host "  WARNING: No receipt file found in $RECEIPT_DIR matching ${TRIAL_ID}_RECEIPT_*.json" -ForegroundColor Yellow
        Write-Host "  round_up_sweep.mjs requires --receipt=<path>. Phase 2 will fail." -ForegroundColor Yellow
        $RECEIPT_FILE = ""
    } else {
        $RECEIPT_FILE = $receiptFiles[0].FullName
        Write-Host "  Receipt file   : $RECEIPT_FILE" -ForegroundColor DarkGray
    }

    # Tier2 budget = 0 (user-controlled cap default 0 per BP092 HARD CANON).
    $roundUpArgs = @(
        $ROUND_UP_MJS,
        "--receipt=$RECEIPT_FILE",
        "--mode=batch",
        "--user-tier2-cap=0",
        "--trial-id=$TRIAL_ID"
    )

    $ROUND_UP_LOG = "$LOG_DIR\m13c_smoke_2q_roundup_${timestamp}.log"
    Write-Host "TEE round-up log: $ROUND_UP_LOG" -ForegroundColor DarkGray
    Write-Host ""

    $PHASE2_START = Get-Date
    & node @roundUpArgs 2>&1 | Tee-Object -FilePath $ROUND_UP_LOG
    $EXIT_CODE_PHASE2 = $LASTEXITCODE
    $PHASE2_END  = Get-Date
    $ELAPSED2    = [math]::Round(($PHASE2_END - $PHASE2_START).TotalMinutes, 1)

    Write-Host ""
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "  PHASE 2 COMPLETE -- round_up_sweep.mjs (Posse)" -ForegroundColor Cyan
    Write-Host "  Exit code    : $EXIT_CODE_PHASE2"
    Write-Host "  Wall-clock   : ${ELAPSED2} min"
    Write-Host "  Round-up log : $ROUND_UP_LOG"
    Write-Host "========================================================================" -ForegroundColor Cyan
} else {
    Write-Host "  round_up_sweep.mjs NOT FOUND at: $ROUND_UP_MJS" -ForegroundColor Yellow
    Write-Host "  M24 Hotfix (KNIGHT_HOTFIX_M24_POSSE_ROUND_UP_BP092.md) may not be complete." -ForegroundColor Yellow
    Write-Host "  Phase 2 skipped. Q02 ABSTAIN cascade verification requires round_up_sweep.mjs." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  HOLD: Do NOT fire 42Q THUNDERCLAP until M24 Hotfix lands and Phase 2 passes." -ForegroundColor Red
    $EXIT_CODE_PHASE2 = 99
}

# -- Final summary -----------------------------------------------------------------
$TOTAL_ELAPSED = [math]::Round(($PHASE1_END - $PHASE1_START).TotalMinutes + (if ($EXIT_CODE_PHASE2 -ne 99) { ($PHASE2_END - $PHASE2_START).TotalMinutes } else { 0 }), 1)

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  SMOKE 2Q -- FULL RUN COMPLETE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  Phase 1 exit : $EXIT_CODE_PHASE1 (validate-relay 2Q)"
Write-Host "  Phase 2 exit : $EXIT_CODE_PHASE2 $(if ($EXIT_CODE_PHASE2 -eq 99) { '(SKIPPED -- round_up_sweep.mjs absent)' } elseif ($EXIT_CODE_PHASE2 -eq 0) { '(round_up_sweep Posse OK)' } else { '(round_up_sweep had errors -- check log)' })"
Write-Host "  Total elapsed: ${TOTAL_ELAPSED} min"
Write-Host "  Phase 1 log  : $LOG_FILE"
if ($EXIT_CODE_PHASE2 -ne 99) {
    Write-Host "  Phase 2 log  : $ROUND_UP_LOG"
}
Write-Host "  Receipt dir  : $RECEIPT_DIR"
Write-Host ""
Write-Host "  NEXT STEP -- Bishop verifies via psql after Founder returns wave_id:" -ForegroundColor Cyan
Write-Host "    Q01 PASS: majority=B, all 5 peers responded, no cascade anomaly" -ForegroundColor Green
Write-Host "    Q02 PASS: source_id=70 in miss-list --> Posse re-fired --> final answer=I" -ForegroundColor Green
Write-Host "    ip_ledger_entries: 1 row per Q with Ring Bearer signature" -ForegroundColor Green
Write-Host ""
if ($EXIT_CODE_PHASE1 -eq 0 -and $EXIT_CODE_PHASE2 -eq 0) {
    Write-Host "  GO -- Smoke passed both phases. Fire FIRE_M13c.cmd (42Q THUNDERCLAP) next." -ForegroundColor Green
} elseif ($EXIT_CODE_PHASE2 -eq 99) {
    Write-Host "  HOLD -- round_up_sweep.mjs absent. Complete M24 Hotfix before 42Q." -ForegroundColor Red
} else {
    Write-Host "  INVESTIGATE -- One or more phases had non-zero exit. Review logs before 42Q." -ForegroundColor Red
}
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Clear injected service key
$env:SUPABASE_SERVICE_ROLE_KEY = ''

# Exit with worst exit code
if ($EXIT_CODE_PHASE2 -eq 99) { exit 99 }
if ($EXIT_CODE_PHASE1 -ne 0) { exit $EXIT_CODE_PHASE1 }
exit $EXIT_CODE_PHASE2
