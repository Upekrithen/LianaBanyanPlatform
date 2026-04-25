#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Pawn-with-Substrate: substrate-injected Perplexity Sonar Pro CLI (K507)

.DESCRIPTION
    PowerShell wrapper around pawn_with_substrate.py.
    Loads PERPLEXITY_API_KEY from SDS.env before invoking the Python CLI.
    Architectural constraint: real Perplexity API calls only. No impersonation.
    See: feedback_no_ai_impersonation_ever.md

.PARAMETER Query
    The query to send to Pawn (Perplexity Sonar Pro with substrate injection).

.PARAMETER Intent
    Force intent classification: canonical|outreach|architecture|founder_voice|benchmark|operational|default

.PARAMETER Test
    Run API connectivity test.

.PARAMETER Summary
    Print savings summary.

.PARAMETER CostDay
    Project cost at N queries/day.

.PARAMETER NoLog
    Skip writing to substrate_savings_log.jsonl.

.PARAMETER Raw
    Print raw JSON response.

.PARAMETER Model
    Perplexity model (default: sonar-pro).

.PARAMETER TaskLabel
    Label for savings log entry (default: K507).

.EXAMPLE
    .\pawn_with_substrate.ps1 "What is the LB membership cost?"
    .\pawn_with_substrate.ps1 --Test
    .\pawn_with_substrate.ps1 --Summary
    .\pawn_with_substrate.ps1 --CostDay 10

.NOTES
    K507 | Bishop B124 | BRIDLE v10.5
    FOR THE KEEP.
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Query,

    [ValidateSet('canonical', 'outreach', 'architecture', 'founder_voice', 'benchmark', 'operational', 'default')]
    [string]$Intent,

    [switch]$Test,
    [switch]$Summary,
    [double]$CostDay = -1,
    [switch]$NoLog,
    [switch]$Raw,
    [string]$Model = 'sonar-pro',
    [string]$TaskLabel = 'K507'
)

$ErrorActionPreference = 'Stop'

# ── Locate script directory and Python entry point ─────────────────────────────
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonScript = Join-Path $ScriptDir 'pawn_with_substrate.py'
$EnvFile    = Join-Path $ScriptDir '..\..\..\Asteroid-ProofVault\LockBox\SDS.env' | Resolve-Path -ErrorAction SilentlyContinue

if (-not (Test-Path $PythonScript)) {
    Write-Error "pawn_with_substrate.py not found at: $PythonScript"
    exit 1
}

# ── Load API key from SDS.env (without echoing values) ────────────────────────
if ($EnvFile -and (Test-Path $EnvFile)) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^([A-Z_]+)=(.+)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
        }
    }
}

if (-not $env:PERPLEXITY_API_KEY) {
    Write-Error "PERPLEXITY_API_KEY not set. Add to SDS.env or set environment variable."
    exit 1
}

# ── Build Python argument list ─────────────────────────────────────────────────
$Args = @()

if ($Test)    { $Args += '--test';    python $PythonScript @Args; exit $LASTEXITCODE }
if ($Summary) { $Args += '--summary'; python $PythonScript @Args; exit $LASTEXITCODE }
if ($CostDay -ge 0) { $Args += '--cost-day'; $Args += "$CostDay"; python $PythonScript @Args; exit $LASTEXITCODE }

if (-not $Query) {
    python $PythonScript '--help'
    exit 0
}

$Args += $Query

if ($Intent)    { $Args += '--intent';     $Args += $Intent }
if ($NoLog)     { $Args += '--no-log' }
if ($Raw)       { $Args += '--raw' }
if ($Model -ne 'sonar-pro') { $Args += '--model'; $Args += $Model }
if ($TaskLabel -ne 'K507')  { $Args += '--task-label'; $Args += $TaskLabel }

# ── Invoke Python CLI ──────────────────────────────────────────────────────────
python $PythonScript @Args
exit $LASTEXITCODE
