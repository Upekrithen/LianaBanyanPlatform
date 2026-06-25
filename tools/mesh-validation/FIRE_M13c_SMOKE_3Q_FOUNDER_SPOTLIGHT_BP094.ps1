# FIRE_M13c_SMOKE_3Q_FOUNDER_SPOTLIGHT_BP094.ps1
# M13c 3Q FOUNDER SPOTLIGHT SMOKE -- BP094 Path B . 2026-06-25 . 5-peer gemma4 fleet added
# Fires 3 questions via validate-relay.mjs to verify:
#   Q01 (source_id=2804 . biology)       -- CANARY: basic wiring
#   Q02 (source_id=70 . business)        -- ABSTAIN CASCADE TARGET: correct=I
#   Q03 (source_id=CANARY_ANDON_BP094)   -- ANDON CANARY: high ethics disagreement
#
# KEY CHANGE vs 2Q smoke: per-tier Mountain 1 priming is now ACTIVE (Block A / BP094 Session 11).
# Each peer tier (ultra/full/core) receives a DIFFERENT reasoning scaffold.
# Variance > 0% is expected. Andon star-chamber escalation path is armed.
#
# TRIAL ID: SMOKE_3Q_BP094_SPOTLIGHT_V001
# No interactive prompts. No Read-Host pauses. Paste FULL output back to Bishop.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# -- Paths ------------------------------------------------------------------------
$SCRIPT_DIR         = "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"
$VALIDATE_MJS       = "$SCRIPT_DIR\validate-relay.mjs"
$QUESTION_BANK      = "$SCRIPT_DIR\smoke_3q_bp094_andon_canary.json"
$SECRETS_FILE       = "C:\Users\Administrator\.claude\state\secrets\22May2026.env"
$PUB_ENV_FILE       = "C:\Users\Administrator\Documents\LianaBanyanPlatform\resources\supabase_public.env"
$DOMAIN_TIMEOUT_CFG = "$SCRIPT_DIR\per_domain_timeout_config.json"
$PLATFORM_DIST_DIR  = "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\dist"
$PLATFORM_SRC_MAIN  = "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\main.tsx"
$TRIAL_ID           = "SMOKE_3Q_BP094_SPOTLIGHT_V001"
$LOG_DIR            = $SCRIPT_DIR

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  M13c SMOKE 3Q FOUNDER SPOTLIGHT -- BP094 Path B" -ForegroundColor Cyan
Write-Host "  Per-tier Mountain 1 priming active. Andon star-chamber armed." -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# -- PRE-CHECK 1: Service role key length >= 200 ----------------------------------
Write-Host "[PRE-CHECK 1/3] SUPABASE_SERVICE_ROLE_KEY length >= 200..." -NoNewline
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
    Write-Host " FAIL (could not read secrets file)" -ForegroundColor Red
    exit 2
}
if ($_svc_key.Length -ge 200) {
    Write-Host " OK (length=$($_svc_key.Length))" -ForegroundColor Green
    Write-Host "  Service key loaded (length=$($_svc_key.Length))" -ForegroundColor Green
    $env:SUPABASE_SERVICE_ROLE_KEY = $_svc_key
} else {
    Write-Host " FAIL (length=$($_svc_key.Length) < 200 -- this is likely the anon key, not the service_role JWT)" -ForegroundColor Red
    Write-Host "  Service key loaded (length=$($_svc_key.Length)) -- WARN: expected >= 200 chars service_role JWT" -ForegroundColor Red
    Write-Host "ERROR: Pre-check 1 FAILED. Add SUPABASE_SERVICE_ROLE_KEY (200+ char JWT) to secrets file." -ForegroundColor Red
    exit 2
}

# -- PRE-CHECK 2: dist/main mtime vs src/main mtime (warn if stale) ---------------
Write-Host "[PRE-CHECK 2/3] Checking platform dist freshness..." -NoNewline
$distStale = $false
if ((Test-Path $PLATFORM_DIST_DIR) -and (Test-Path $PLATFORM_SRC_MAIN)) {
    $distMtime = (Get-ChildItem $PLATFORM_DIST_DIR -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
    $srcMtime  = (Get-Item $PLATFORM_SRC_MAIN).LastWriteTime
    if ($distMtime -lt $srcMtime) {
        Write-Host " WARN (dist older than src/main.tsx -- platform may be stale)" -ForegroundColor Yellow
        $distStale = $true
    } else {
        Write-Host " OK (dist newer than src/main.tsx)" -ForegroundColor Green
    }
} else {
    Write-Host " WARN (could not locate dist/ or src/main.tsx -- skipping freshness check)" -ForegroundColor Yellow
}

# -- PRE-CHECK 3: validate-relay.mjs contains per-tier substrate_prime injection --
Write-Host "[PRE-CHECK 3/3] Confirming per-tier substrate_prime in validate-relay.mjs..." -NoNewline
$validateContent = Get-Content $VALIDATE_MJS -Raw
if ($validateContent -match 'peer_tier' -and $validateContent -match 'ultra:') {
    Write-Host " OK (peer_tier + ultra: found)" -ForegroundColor Green
} else {
    Write-Host " FAIL -- 'peer_tier' or 'ultra:' not found in validate-relay.mjs" -ForegroundColor Red
    Write-Host "ERROR: Block A (per-tier Mountain 1 priming) does not appear to be applied." -ForegroundColor Red
    Write-Host "  Run Block A from BP094 Session 11 before firing this launcher." -ForegroundColor Red
    exit 2
}

# -- Load public env (belt-and-suspenders) ----------------------------------------
try {
    $rawPub    = Get-Content $PUB_ENV_FILE -Raw -Encoding UTF8
    $urlMatch  = [regex]::Match($rawPub, '(?m)^SUPABASE_URL=(.+)$')
    $anonMatch = [regex]::Match($rawPub, '(?m)^SUPABASE_ANON_KEY=(.+)$')
    if ($urlMatch.Success)  { $env:SUPABASE_URL      = $urlMatch.Groups[1].Value.Trim() }
    if ($anonMatch.Success) { $env:SUPABASE_ANON_KEY = $anonMatch.Groups[1].Value.Trim() }
    Write-Host "[SECRETS] SUPABASE_URL + ANON_KEY injected from public env" -ForegroundColor DarkGray
} catch {
    Write-Host "[SECRETS] WARNING: Could not load public env -- validate-relay.mjs will self-load" -ForegroundColor Yellow
}

# -- Banner ------------------------------------------------------------------------
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  M13c SMOKE 3Q SPOTLIGHT -- READY TO FIRE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  Questions       : 3 (pinned via --question-bank)"
Write-Host "  Q01 source_id   : 2804 (biology . canary . expected B unanimous)"
Write-Host "  Q02 source_id   : 70   (business . ABSTAIN cascade . correct=I)"
Write-Host "  Q03 source_id   : CANARY_ANDON_BP094 (business ethics . Andon canary)"
Write-Host "  Target fleet    : 5 peers . relay.lianabanyan.com (WAN)"
Write-Host "  Fleet tiers     : ULTRA cb4ef450 llama3.3:70b"
Write-Host "                    FULL  d0b47bd0+88cbf6bd+d2d05d39+2cb0ef15 gemma4:12b"
Write-Host "                    MIC   c532e740+49f3e597 (judge-only)"
Write-Host "  Routing         : tier-aware (Ah Hayelped BP091)"
Write-Host "  Mountain 1      : per-tier differentiated priming (Block A / BP094 S11)"
Write-Host "  Andon-escalate  : star-chamber (armed)"
Write-Host "  Wire format     : hex-mcode"
Write-Host "  Plow            : mesh-12-blade"
Write-Host "  Trial ID        : $TRIAL_ID"
Write-Host "  Est. wall-clock : 5-12 min"
if ($distStale) {
    Write-Host "  WARN: platform dist may be stale -- does not affect smoke" -ForegroundColor Yellow
}
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# -- Log file setup ----------------------------------------------------------------
$timestamp = (Get-Date -Format 'yyyy-MM-ddTHH-mm-ss')
$LOG_FILE  = "$LOG_DIR\m13c_smoke_3q_bp094_spotlight_${timestamp}.log"

Write-Host "Firing validate-relay.mjs (3Q spotlight smoke)..." -ForegroundColor Green
Write-Host "TEE log: $LOG_FILE" -ForegroundColor DarkGray
Write-Host ""

# -- Node arguments (same fleet config as FIRE_M13c_SMOKE_2Q_V001.ps1) -----------
$nodeArgs = @(
    $VALIDATE_MJS,
    "--questions=3",
    "--mode=smoke",
    "--routing=tier-aware",
    "--answer-tier-config=ultra:cb4ef450cc4a18c3,full:d0b47bd08633385b+88cbf6bdd6f74587+d2d05d3921904fff+2cb0ef159ce445b9",
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

$SMOKE_START = Get-Date
$_prevEAP = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
& node @nodeArgs 2>&1 | Tee-Object -FilePath $LOG_FILE
$EXIT_CODE = $LASTEXITCODE
$ErrorActionPreference = $_prevEAP
$SMOKE_END  = Get-Date
$ELAPSED    = [math]::Round(($SMOKE_END - $SMOKE_START).TotalMinutes, 1)

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  SMOKE RUN COMPLETE -- exit=$EXIT_CODE  wall-clock=${ELAPSED} min" -ForegroundColor Cyan
Write-Host "  Log: $LOG_FILE" -ForegroundColor DarkGray
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# -- Post-run: scan log for 6 critical lines and display with color ---------------
Write-Host "Scanning log for 6 critical lines..." -ForegroundColor Cyan
Write-Host ""

$logLines = Get-Content $LOG_FILE -ErrorAction SilentlyContinue

# Critical line 1: Service key length
$crit1Found = $false
foreach ($ln in $logLines) {
    if ($ln -match 'Service key loaded \(length=(\d+)\)') {
        $keyLen = [int]$Matches[1]
        if ($keyLen -ge 200) {
            Write-Host "  [CRIT 1] $ln" -ForegroundColor Green
        } else {
            Write-Host "  [CRIT 1] $ln  <-- WARN: length < 200" -ForegroundColor Red
        }
        $crit1Found = $true
        break
    }
}
if (-not $crit1Found) {
    Write-Host "  [CRIT 1] Service key loaded line: NOT FOUND in log" -ForegroundColor Red
}

# Critical line 2: Per-tier Mountain 1 priming
$crit2Found = $false
foreach ($ln in $logLines) {
    if ($ln -match '\[MOUNTAIN1\].*primed.*ultra:\d+.*full:\d+.*core:\d+') {
        Write-Host "  [CRIT 2] $ln" -ForegroundColor Green
        $crit2Found = $true
    }
}
if (-not $crit2Found) {
    Write-Host "  [CRIT 2] [MOUNTAIN1] per-tier priming line: NOT FOUND -- old format or Block A not active" -ForegroundColor Red
}

# Critical line 3: Variance per question
$q01Var = 'not found'; $q02Var = 'not found'; $q03Var = 'not found'
$qIdx = 0
foreach ($ln in $logLines) {
    if ($ln -match 'Variance:|variance=|variance :') {
        $varMatch = [regex]::Match($ln, '(\d+\.?\d*)%')
        $varPct = if ($varMatch.Success) { $varMatch.Value } else { '?%' }
        $qIdx++
        $color = if ($varMatch.Success -and [double]$varMatch.Groups[1].Value -gt 0) { 'Green' } else { 'Red' }
        Write-Host "  [CRIT 3] Q${qIdx} variance: $ln  --> $varPct" -ForegroundColor $color
        switch ($qIdx) {
            1 { $q01Var = $varPct }
            2 { $q02Var = $varPct }
            3 { $q03Var = $varPct }
        }
    }
}
if ($qIdx -eq 0) {
    Write-Host "  [CRIT 3] Variance lines: NOT FOUND in log" -ForegroundColor Red
}

# Critical line 4: Andon header
$crit4Found = $false
foreach ($ln in $logLines) {
    if ($ln -match 'Andon-escalate:') {
        if ($ln -match 'star-chamber') {
            Write-Host "  [CRIT 4] $ln" -ForegroundColor Green
        } else {
            Write-Host "  [CRIT 4] $ln  <-- WARN: expected star-chamber" -ForegroundColor Red
        }
        $crit4Found = $true
        break
    }
}
if (-not $crit4Found) {
    Write-Host "  [CRIT 4] Andon-escalate header: NOT FOUND in log" -ForegroundColor Red
}

# Critical line 5: Escalation fire
$crit5Found = $false
foreach ($ln in $logLines) {
    if ($ln -match '\[ENSEMBLE_ABSTAIN\]|ANDON:|POSSE.*swarm dispatched|\[POSSE\]') {
        Write-Host "  [CRIT 5] $ln" -ForegroundColor Green
        $crit5Found = $true
    }
}
if (-not $crit5Found) {
    Write-Host "  [CRIT 5] Escalation (ANDON/ENSEMBLE_ABSTAIN/POSSE): NOT FOUND in log -- escalation path not triggered" -ForegroundColor Yellow
}

# Critical line 6: Q02 final answer
$crit6Found = $false
foreach ($ln in $logLines) {
    if ($ln -match 'Q02|source_id.*70|70.*final') {
        if ($ln -match '\bI\b') {
            Write-Host "  [CRIT 6] $ln  --> I=PASS" -ForegroundColor Green
            $crit6Found = $true
            break
        } elseif ($ln -match '\bE\b') {
            Write-Host "  [CRIT 6] $ln  --> E=FAIL" -ForegroundColor Red
            $crit6Found = $true
            break
        }
    }
}
if (-not $crit6Found) {
    $q02AnswerLines = $logLines | Where-Object { $_ -match 'Q2|Q02|source_id.*70' } | Select-Object -Last 3
    if ($q02AnswerLines) {
        foreach ($ln in $q02AnswerLines) {
            Write-Host "  [CRIT 6] Q02 context: $ln" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [CRIT 6] Q02 answer line: NOT FOUND in log" -ForegroundColor Red
    }
}

# -- Summary section ---------------------------------------------------------------
Write-Host ""
Write-Host "======================================================================"
Write-Host "  SPOTLIGHT SMOKE COMPLETE -- Paste full output back to Bishop"
Write-Host "======================================================================"

# Service key status
if ($crit1Found) {
    Write-Host "  Critical line 1 (Service key)  : found"
} else {
    Write-Host "  Critical line 1 (Service key)  : not found"
}

# Per-tier M1 status
if ($crit2Found) {
    Write-Host "  Critical line 2 (Per-tier M1)  : found"
} else {
    Write-Host "  Critical line 2 (Per-tier M1)  : not found"
}

# Variance
Write-Host "  Critical line 3 (Variance > 0) : Q01=$q01Var Q02=$q02Var Q03=$q03Var"

# Andon header
if ($crit4Found) {
    $andonHeader = if ($logLines | Where-Object { $_ -match 'Andon-escalate:.*star-chamber' }) { 'star-chamber' } else { 'none' }
    Write-Host "  Critical line 4 (Andon header) : $andonHeader"
} else {
    Write-Host "  Critical line 4 (Andon header) : not found"
}

# Escalation
if ($crit5Found) {
    Write-Host "  Critical line 5 (Escalation)   : fired"
} else {
    Write-Host "  Critical line 5 (Escalation)   : not fired"
}

# Q02 answer
if ($crit6Found) {
    $q02Ans = if ($logLines | Where-Object { $_ -match 'Q02|source_id.*70' -and $_ -match '\bI\b' }) { 'I=PASS' } else { 'E=FAIL or other' }
    Write-Host "  Critical line 6 (Q02 answer)   : $q02Ans"
} else {
    Write-Host "  Critical line 6 (Q02 answer)   : not found"
}

Write-Host "======================================================================"
Write-Host ""
Write-Host "  Log written to: $LOG_FILE" -ForegroundColor DarkGray
Write-Host ""

# Clear injected service key
$env:SUPABASE_SERVICE_ROLE_KEY = ''

exit $EXIT_CODE
