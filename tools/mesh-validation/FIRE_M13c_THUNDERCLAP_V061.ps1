# FIRE_M13c_THUNDERCLAP_V061.ps1
# M13c Canonical 42Q THUNDERCLAP Sweep — direct OS-shell fire, bypasses Knight/Cursor sandbox
# BP092 · Sonnet 4.6 · 2026-06-23
# Reason this exists: Knight MCP "background worker" pattern was theatrical twice in BP092.
# validate-relay.mjs was never actually executed; wave_id=NULL, mesh_task_queue 0 rows.
# This script fires the Node process directly from a Windows terminal Founder double-clicks.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Paths ────────────────────────────────────────────────────────────────────────
$SCRIPT_DIR    = "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
$VALIDATE_MJS  = "$SCRIPT_DIR\validate-relay.mjs"
$ROUND_UP_MJS  = "$SCRIPT_DIR\round_up_sweep.mjs"
$SECRETS_FILE  = "C:\Users\Administrator\.claude\state\secrets\22May2026.env"
$PUB_ENV_FILE  = "C:\Users\Administrator\Documents\LianaBanyanPlatform\resources\supabase_public.env"
$DOMAIN_TIMEOUT_CFG = "$SCRIPT_DIR\per_domain_timeout_config.json"
$RECEIPT_BASE  = "C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP"
$TRIAL_ID      = "TRIAL_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060"
$RECEIPT_DIR   = "$RECEIPT_BASE\$TRIAL_ID"
$LOG_DIR       = $SCRIPT_DIR

# ── Pre-flight checks ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  M13c THUNDERCLAP v0.6.1 PRE-FLIGHT" -ForegroundColor Cyan
Write-Host "  BP092 · Direct OS-shell fire · Knight sandbox bypassed" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Node available?
Write-Host "[PRE-FLIGHT 1/4] Checking Node.js..." -NoNewline
try {
    $nodeVer = & node --version 2>&1
    Write-Host " OK ($nodeVer)" -ForegroundColor Green
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "ERROR: 'node' not found in PATH. Install Node.js 18+ and retry." -ForegroundColor Red
    exit 2
}

# 2. validate-relay.mjs exists?
Write-Host "[PRE-FLIGHT 2/4] Checking validate-relay.mjs..." -NoNewline
if (Test-Path $VALIDATE_MJS) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "ERROR: Not found: $VALIDATE_MJS" -ForegroundColor Red
    exit 2
}

# 3. Secrets file accessible?
Write-Host "[PRE-FLIGHT 3/4] Checking secrets file..." -NoNewline
if (Test-Path $SECRETS_FILE) {
    Write-Host " OK (exists, not echoing)" -ForegroundColor Green
} else {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "ERROR: Secrets file not found: $SECRETS_FILE" -ForegroundColor Red
    Write-Host "  validate-relay.mjs will fail on SERVICE_ROLE_KEY load." -ForegroundColor Yellow
    exit 2
}

# 4. Per-domain timeout config?
Write-Host "[PRE-FLIGHT 4/4] Checking per_domain_timeout_config.json..." -NoNewline
if (Test-Path $DOMAIN_TIMEOUT_CFG) {
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host " MISSING — will use global timeout=900s fallback" -ForegroundColor Yellow
}

# ── Load SERVICE_ROLE_KEY for env-var injection (BP084 §4 — never echo) ──────────
# validate-relay.mjs self-loads from secrets file path, but we also inject via env
# in case the homedir() resolution differs outside the Knight sandbox.
# BP084 BLOOD: value is extracted silently; NEVER written to stdout.
$_svc_key = ''
try {
    $rawSecrets = Get-Content $SECRETS_FILE -Raw -Encoding UTF8
    # Try all key name variants the script accepts (loadServiceRoleKey source)
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
    # Sanitise: unset after setting so it doesn't linger beyond this process
    # (child process inherits it; parent env is wiped on script exit anyway)
    Write-Host "[SECRETS] SERVICE_ROLE_KEY injected into child env (length=$($_svc_key.Length), not echoed)" -ForegroundColor DarkGray
} else {
    Write-Host "[SECRETS] WARNING: SERVICE_ROLE_KEY not found in secrets file — validate-relay.mjs must self-load" -ForegroundColor Yellow
}

# Public env (SUPABASE_URL + ANON_KEY) — already loaded by validate-relay.mjs from
# resources/supabase_public.env. Inject as belt-and-suspenders only.
try {
    $rawPub = Get-Content $PUB_ENV_FILE -Raw -Encoding UTF8
    $urlMatch = [regex]::Match($rawPub, '(?m)^SUPABASE_URL=(.+)$')
    $anonMatch = [regex]::Match($rawPub, '(?m)^SUPABASE_ANON_KEY=(.+)$')
    if ($urlMatch.Success)  { $env:SUPABASE_URL      = $urlMatch.Groups[1].Value.Trim() }
    if ($anonMatch.Success) { $env:SUPABASE_ANON_KEY = $anonMatch.Groups[1].Value.Trim() }
    Write-Host "[SECRETS] SUPABASE_URL + ANON_KEY injected from public env (not sensitive)" -ForegroundColor DarkGray
} catch {
    Write-Host "[SECRETS] WARNING: Could not load public env — validate-relay.mjs will self-load" -ForegroundColor Yellow
}

# ── Banner ────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  M13c THUNDERCLAP 42Q SWEEP — READY TO FIRE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  Target fleet    : 5 peers · v0.6.0 · relay.lianabanyan.com (WAN)"
Write-Host "  Fleet tiers     : ULTRA cb4ef450 llama3.3:70b"
Write-Host "                    FULL  d0b47bd0+88cbf6bd gemma4:12b"
Write-Host "                    CORE  c532e740+49f3e597 gemma2:9b"
Write-Host "  Questions       : 42 (spread across 14 MMLU-Pro domains)"
Write-Host "  Routing         : tier-aware (Ah Hayelped BP091)"
Write-Host "  ABSTAIN proto   : active (commit dde5e5c)"
Write-Host "  Contested-cascade: Tier 1/2/3 (commit dde5e5c, baked in)"
Write-Host "  Andon-escalate  : star-chamber · threshold 15%"
Write-Host "  Wire format     : hex-mcode"
Write-Host "  Plow            : mesh-12-blade"
Write-Host "  Trial ID        : $TRIAL_ID"
Write-Host "  Pass            : A"
Write-Host "  Baseline to beat: M12 ensemble 61.9%"
Write-Host "  Est. wall-clock : ~90-150 min (42Q × ~900s domain timeout · tiered)"
Write-Host "  Receipt dest    : $RECEIPT_DIR"
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press ENTER to fire, or Ctrl-C to abort." -ForegroundColor Yellow
$null = Read-Host

# ── Log file setup ────────────────────────────────────────────────────────────────
$timestamp = (Get-Date -Format 'yyyy-MM-ddTHH-mm-ss')
$LOG_FILE  = "$LOG_DIR\m13c_run_${timestamp}.log"

Write-Host ""
Write-Host "Firing validate-relay.mjs..." -ForegroundColor Green
Write-Host "TEE log: $LOG_FILE" -ForegroundColor DarkGray
Write-Host ""

# ── FIRE ─────────────────────────────────────────────────────────────────────────
# Exact CLI args per M13c dispatch (§3.1), restricted to flags parseArgs() actually handles.
# --abstain-protocol and --contested-cascade are NOT in parseArgs — cascade is baked in (commit dde5e5c).
# --fleet-composition-receipt is NOT in parseArgs — fleet_composition block is always written when --trial-id is set.

$nodeArgs = @(
    $VALIDATE_MJS,
    "--questions=42",
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
    "--per-domain-timeout=$DOMAIN_TIMEOUT_CFG"
)

# TEE to log: capture stdout+stderr and mirror to console + log file
$FIRE_START = Get-Date
& node @nodeArgs 2>&1 | Tee-Object -FilePath $LOG_FILE

$EXIT_CODE = $LASTEXITCODE
$FIRE_END  = Get-Date
$ELAPSED   = [math]::Round(($FIRE_END - $FIRE_START).TotalMinutes, 1)

# ── Post-fire report ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  M13c THUNDERCLAP — RUN COMPLETE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  Exit code    : $EXIT_CODE $(if ($EXIT_CODE -eq 0) { '(PASS >= 60%)' } elseif ($EXIT_CODE -eq 1) { '(FAIL < 60%)' } else { '(FATAL ERROR)' })"
Write-Host "  Wall-clock   : ${ELAPSED} min"
Write-Host "  Log file     : $LOG_FILE"
Write-Host "  Receipt dir  : $RECEIPT_DIR"
Write-Host ""

# Parse accuracy from log (last occurrence of "Ensemble Score:" line)
$ensembleLine = Select-String -Path $LOG_FILE -Pattern 'Ensemble Score:\s+\d+/\d+ = [\d.]+%' |
    Select-Object -Last 1
if ($ensembleLine) {
    Write-Host "  $($ensembleLine.Line.Trim())" -ForegroundColor $(if ($EXIT_CODE -eq 0) { 'Green' } else { 'Red' })
}

Write-Host ""
Write-Host "KniPr goes to: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIPR_M13c_THUNDERCLAP_V060_RECEIPT_BP092.md"
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# ── PHASE 2: round_up_sweep.mjs (M24 Hotfix) ─────────────────────────────────────
# M24 Hotfix doctrine: round_up_sweep MUST run post-THUNDERCLAP to re-attack
# ABSTAIN-contested and missed questions via Posse swarm.
# BP093 SEG-O: this wire was ABSENT in V061 — added here.
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  PHASE 2 — round_up_sweep.mjs (M24 Hotfix Posse Round-Up)" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$EXIT_CODE_PHASE2 = 99
if (Test-Path $ROUND_UP_MJS) {
    Write-Host "  round_up_sweep.mjs FOUND — firing Round-Up on miss-list..." -ForegroundColor Green
    Write-Host ""

    # Locate the receipt written by Phase 1
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

    $ROUND_UP_LOG = "$LOG_DIR\m13c_thunderclap_roundup_${timestamp}.log"
    Write-Host "  TEE round-up log: $ROUND_UP_LOG" -ForegroundColor DarkGray
    Write-Host ""

    $roundUpArgs = @(
        $ROUND_UP_MJS,
        "--receipt=$RECEIPT_FILE",
        "--mode=batch",
        "--user-tier2-cap=0",
        "--trial-id=$TRIAL_ID"
    )

    $PHASE2_START = Get-Date
    & node @roundUpArgs 2>&1 | Tee-Object -FilePath $ROUND_UP_LOG
    $EXIT_CODE_PHASE2 = $LASTEXITCODE
    $PHASE2_END  = Get-Date
    $ELAPSED2    = [math]::Round(($PHASE2_END - $PHASE2_START).TotalMinutes, 1)

    Write-Host ""
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "  PHASE 2 COMPLETE — round_up_sweep.mjs (Posse)" -ForegroundColor Cyan
    Write-Host "  Exit code    : $EXIT_CODE_PHASE2"
    Write-Host "  Wall-clock   : ${ELAPSED2} min"
    Write-Host "  Round-up log : $ROUND_UP_LOG"
    Write-Host "========================================================================" -ForegroundColor Cyan
} else {
    Write-Host "  round_up_sweep.mjs NOT FOUND at: $ROUND_UP_MJS" -ForegroundColor Red
    Write-Host "  M24 Hotfix not complete — Phase 2 SKIPPED. ABSTAIN cascades NOT re-attacked." -ForegroundColor Red
}

Write-Host ""
Write-Host "  Phase 1 exit : $EXIT_CODE (validate-relay 42Q)"
Write-Host "  Phase 2 exit : $EXIT_CODE_PHASE2 $(if ($EXIT_CODE_PHASE2 -eq 99) { '(SKIPPED)' } elseif ($EXIT_CODE_PHASE2 -eq 0) { '(round_up_sweep Posse OK)' } else { '(round_up_sweep errors — check log)' })"
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# Clear the injected service key from env before exit
$env:SUPABASE_SERVICE_ROLE_KEY = ''

# Exit with worst exit code
if ($EXIT_CODE_PHASE2 -eq 99) { exit 99 }
if ($EXIT_CODE -ne 0) { exit $EXIT_CODE }
exit $EXIT_CODE_PHASE2
