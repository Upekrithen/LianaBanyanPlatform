<#
.SYNOPSIS
    One-click Pawn Portal launcher -- K510 / B125

.DESCRIPTION
    Cold start  : loads PPLX_API_KEY from SDS.env, starts the Helm daemon
                  (librarian-mcp REST server), starts the Vite dev web server,
                  and opens the Pawn portal in your default browser.
    Warm start  : detects a healthy daemon on port 7712, skips startup, and
                  re-opens the browser tab.  No duplicate processes are created.

    Idempotent -- safe to double-click.  Expected cold-start wall-time: <=20s.

.PARAMETER SdsEnvPath
    Path to SDS.env containing PPLX_API_KEY.
    Defaults to the canonical Asteroid-ProofVault location.

.PARAMETER TimeoutSec
    Seconds to wait for the daemon to pass its health check on cold start.
    Default: 15.

.PARAMETER Browser
    Browser executable to open the PWA URL.
    Default: chrome  (also accepts: msedge, firefox, or full path).

.EXAMPLE
    .\Start-PawnPortal.ps1

.EXAMPLE
    .\Start-PawnPortal.ps1 -Browser msedge -TimeoutSec 20

.NOTES
    K510 / B125 -- Liana Banyan Platform
    Keystone #40: Always Offer What You Would Want
    No secrets are logged.  PPLX_API_KEY is verified by length only.
    Pinning: right-click the .ps1 in Explorer > Send to > Desktop (shortcut);
    edit the shortcut target to:
        powershell.exe -ExecutionPolicy Bypass -File "C:\...\Start-PawnPortal.ps1"
#>
[CmdletBinding()]
param(
    [string]$SdsEnvPath  = 'C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\SDS.env',
    [int]   $TimeoutSec  = 15,
    [string]$Browser     = 'chrome'
)

$ErrorActionPreference = 'Stop'

# -- Configuration -------------------------------------------------------------
$WorkspaceRoot = 'C:\Users\Administrator\Documents\LianaBanyanPlatform'
$HelmDir       = Join-Path $WorkspaceRoot 'librarian-mcp-helm-pwa'
$VenvPython    = Join-Path $WorkspaceRoot 'librarian-mcp-public\.venv\Scripts\python.exe'
$DaemonScript  = Join-Path $HelmDir 'daemon_wrapper.py'
$McpPort       = 7711
$RestPort      = 7712   # Comet Bridge health/pawn REST port
$VitePort      = 5173
$HealthUrl     = "http://127.0.0.1:$RestPort/health"
$PwaUrl        = "http://localhost:$VitePort"

# -- Helpers -------------------------------------------------------------------

function Test-DaemonHealth {
    try {
        $r = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 3 -ErrorAction Stop
        return ($r.status -eq 'ok')
    } catch {
        return $false
    }
}

function Test-ViteRunning {
    try {
        $null = Invoke-WebRequest -Uri $PwaUrl -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Invoke-Background {
    # Spawn a process hidden, inheriting current process env (UseShellExecute=false).
    # This ensures PPLX_API_KEY (loaded into current proc env) reaches the daemon.
    # Returns the System.Diagnostics.Process object.
    param(
        [string]   $ExePath,
        [string[]] $Arguments,
        [string]   $WorkDir
    )
    $argStr = ($Arguments | ForEach-Object {
        if ($_ -match '\s') { "`"$_`"" } else { $_ }
    }) -join ' '

    $psi                  = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName         = $ExePath
    $psi.Arguments        = $argStr
    $psi.WorkingDirectory = $WorkDir
    $psi.UseShellExecute  = $false   # inherit parent env block (PPLX_API_KEY included)
    $psi.CreateNoWindow   = $true
    $psi.WindowStyle      = [System.Diagnostics.ProcessWindowStyle]::Hidden

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    $started = $proc.Start()
    if (-not $started) { throw "[pawn-portal] Process failed to start: $ExePath" }
    return $proc
}

function Load-SdsEnv {
    # Loads SDS.env key=value pairs into the current process environment.
    # SDS.env uses PERPLEXITY_API_KEY; daemon_wrapper.py reads PPLX_API_KEY.
    # This function loads both and creates the PPLX_API_KEY alias if needed.
    # Never logs key values -- verifies by length only.
    if (-not (Test-Path $SdsEnvPath)) {
        Write-Host '[pawn-portal] FATAL: SDS.env not found. Check $SdsEnvPath.' -ForegroundColor Red
        exit 1
    }
    Get-Content $SdsEnvPath | ForEach-Object {
        if ($_ -match '^([A-Z0-9_]+)=(.+)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim(), 'Process')
        }
    }
    # Alias PERPLEXITY_API_KEY -> PPLX_API_KEY for daemon_wrapper.py compatibility.
    if ([string]::IsNullOrWhiteSpace($env:PPLX_API_KEY) -and -not [string]::IsNullOrWhiteSpace($env:PERPLEXITY_API_KEY)) {
        [Environment]::SetEnvironmentVariable('PPLX_API_KEY', $env:PERPLEXITY_API_KEY, 'Process')
        Write-Host '[pawn-portal] env: aliased PERPLEXITY_API_KEY -> PPLX_API_KEY for daemon'
    }
    if ([string]::IsNullOrWhiteSpace($env:PPLX_API_KEY)) {
        Write-Host '[pawn-portal] FATAL: PPLX_API_KEY / PERPLEXITY_API_KEY not found in SDS.env' -ForegroundColor Red
        exit 1
    }
    # Log length only -- never log the value.
    Write-Host "[pawn-portal] env: PPLX_API_KEY ready (len=$($env:PPLX_API_KEY.Length))" -ForegroundColor Green
}

function Start-Daemon {
    $python = if (Test-Path $VenvPython) { $VenvPython } else { 'python' }
    Write-Host "[pawn-portal] Starting daemon: python daemon_wrapper.py --port $McpPort"
    return Invoke-Background -ExePath $python `
        -Arguments @($DaemonScript, '--port', $McpPort) `
        -WorkDir $HelmDir
}

function Start-ViteServer {
    # npm.cmd is a batch file; invoke via cmd /c to avoid ShellExecute issues.
    $npmCmdObj = Get-Command npm -ErrorAction SilentlyContinue
    $npmCmd    = if ($npmCmdObj) { $npmCmdObj.Source } else { 'npm.cmd' }
    Write-Host "[pawn-portal] Starting Vite dev server (npm run dev:web) on :$VitePort"
    return Invoke-Background -ExePath 'cmd.exe' `
        -Arguments @('/c', $npmCmd, 'run', 'dev:web') `
        -WorkDir $HelmDir
}

function Open-Browser {
    Write-Host "[pawn-portal] Opening $PwaUrl in $Browser"
    try {
        Start-Process -FilePath $Browser -ArgumentList $PwaUrl -ErrorAction Stop
    } catch {
        # Fallback: let Windows pick the default browser handler.
        Start-Process $PwaUrl
    }
}

# -- B.1  Health check -> warm path --------------------------------------------
Write-Host ''
Write-Host '[pawn-portal] -- Pawn Portal Launcher K510 --' -ForegroundColor Cyan

if (Test-DaemonHealth) {
    Write-Host "[pawn-portal] Warm start -- daemon healthy on :$RestPort" -ForegroundColor Yellow

    # B.5 warm: Pawn module is enabledByDefault:true in registry.ts (K510 B.5 change).
    Write-Host '[pawn-portal] Pawn module: enabled (registry.ts enabledByDefault:true)'

    # B.6 warm: ensure Vite is running, then re-open browser tab.
    if (-not (Test-ViteRunning)) {
        Write-Host '[pawn-portal] Vite not detected -- starting...'
        $null = Start-ViteServer
        Start-Sleep -Seconds 4
    }
    Open-Browser

    Write-Host ''
    Write-Host '[pawn-portal] [OK] WARM START -- Pawn Portal ready' -ForegroundColor Green
    Write-Host "[pawn-portal]   REST   : $HealthUrl (OK)"
    Write-Host "[pawn-portal]   PWA    : $PwaUrl"
    Write-Host '[pawn-portal]   Pawn   : enabled (no duplicate daemon spawned)'
    exit 0
}

Write-Host "[pawn-portal] Cold start -- daemon not running on :$RestPort" -ForegroundColor Cyan

# -- B.2  Load SDS.env ---------------------------------------------------------
Load-SdsEnv

# -- B.3  PPLX_API_KEY already verified inside Load-SdsEnv (exits on failure).

# -- B.5  Pawn module enable -- mechanism: enabledByDefault:true in registry.ts.
#         In Electron mode, also patch helm-settings.json (belt-and-suspenders).
$settingsPath = Join-Path $env:APPDATA 'helm-pwa\helm-settings.json'
if (Test-Path $settingsPath) {
    try {
        $s = Get-Content $settingsPath -Raw | ConvertFrom-Json
        if (-not ($s | Get-Member modules -MemberType NoteProperty)) {
            $s | Add-Member -NotePropertyName modules -NotePropertyValue ([PSCustomObject]@{}) -Force
        }
        $s.modules | Add-Member -NotePropertyName pawn -NotePropertyValue $true -Force
        $s | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding UTF8
        Write-Host '[pawn-portal] helm-settings.json: pawn module patched to enabled'
    } catch {
        Write-Host "[pawn-portal] WARN: could not patch helm-settings.json: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host '[pawn-portal] helm-settings.json not found -- Pawn enabled via registry default'
}

# -- B.4  Start daemon ---------------------------------------------------------
if (-not (Test-Path $DaemonScript)) {
    Write-Host "[pawn-portal] FATAL: daemon_wrapper.py not found at: $DaemonScript" -ForegroundColor Red
    exit 1
}

$daemonProc = Start-Daemon
Write-Host "[pawn-portal] Daemon PID=$($daemonProc.Id) -- polling health (timeout: $($TimeoutSec)s)"

# Start Vite in parallel (saves wall-time while daemon initializes).
if (-not (Test-ViteRunning)) {
    $null = Start-ViteServer
}

# Poll daemon health.
$startTime = [DateTime]::Now
$deadline  = $startTime.AddSeconds($TimeoutSec)
$healthy   = $false

while ([DateTime]::Now -lt $deadline) {
    Start-Sleep -Milliseconds 800
    if (Test-DaemonHealth) { $healthy = $true; break }
    $elapsed = [int]([DateTime]::Now - $startTime).TotalSeconds
    Write-Host "[pawn-portal]   ... $($elapsed)s elapsed" -ForegroundColor DarkGray
}

if (-not $healthy) {
    Write-Host "[pawn-portal] FATAL: daemon did not come online within $($TimeoutSec)s." -ForegroundColor Red
    Write-Host '[pawn-portal]   Check Python install / librarian-mcp package / SDS.env validity.'
    exit 2
}

$elapsed = [int]([DateTime]::Now - $startTime).TotalSeconds
Write-Host "[pawn-portal] Daemon healthy in ~$($elapsed)s" -ForegroundColor Green

# -- B.6  Open browser ---------------------------------------------------------
# Wait briefly for Vite to be ready if it was just started.
$viteWait = 0
while ((-not (Test-ViteRunning)) -and ($viteWait -lt 8)) {
    Start-Sleep -Seconds 1
    $viteWait++
}
Open-Browser

# -- B.7  Tight console summary ------------------------------------------------
Write-Host ''
Write-Host '[pawn-portal] [OK] COLD START COMPLETE -- Pawn Portal live' -ForegroundColor Green
Write-Host "[pawn-portal]   Daemon PID  : $($daemonProc.Id)"
Write-Host "[pawn-portal]   MCP port    : $McpPort  (SSE: http://127.0.0.1:$McpPort/sse)"
Write-Host "[pawn-portal]   REST port   : $RestPort  (/health OK, /pawn ready)"
Write-Host '[pawn-portal]   Pawn module : enabled'
Write-Host "[pawn-portal]   PWA URL     : $PwaUrl"
Write-Host ''
