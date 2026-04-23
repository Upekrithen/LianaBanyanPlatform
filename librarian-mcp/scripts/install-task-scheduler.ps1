# install-task-scheduler.ps1 — K449(B118): Windows Task Scheduler helper
# =========================================================================
# Creates a Windows Task Scheduler task that launches the Librarian MCP
# supervisor (npm start) at user login.
#
# Idempotent: re-running updates the existing task rather than duplicating it.
# Run as the user who will own the task (no Administrator elevation required
# for per-user tasks; elevation is needed only for SYSTEM-level tasks).
#
# Usage:
#   .\scripts\install-task-scheduler.ps1
#
# Removal:
#   .\scripts\uninstall-task-scheduler.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$TaskName   = "LianaBanyanLibrarianMCP"
$TaskFolder = "\"    # root of Task Scheduler library

# Resolve the librarian-mcp root (one level above scripts/)
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkingDir  = Split-Path -Parent $ScriptDir

# Locate node.exe and npm.cmd on PATH
$NodeExe = (Get-Command node -ErrorAction SilentlyContinue)?.Source
if (-not $NodeExe) {
    Write-Error "node.exe not found on PATH. Install Node.js first."
    exit 1
}

$NpmCmd = (Get-Command npm -ErrorAction SilentlyContinue)?.Source
if (-not $NpmCmd) {
    Write-Error "npm not found on PATH. Install Node.js first."
    exit 1
}

Write-Host "Installing Task Scheduler task: $TaskName"
Write-Host "  Working dir : $WorkingDir"
Write-Host "  Node        : $NodeExe"
Write-Host "  npm         : $NpmCmd"

# ── Build task components ─────────────────────────────────────────────────────

# Action: run "npm start" in the librarian-mcp directory
$Action = New-ScheduledTaskAction `
    -Execute $NpmCmd `
    -Argument "start" `
    -WorkingDirectory $WorkingDir

# Trigger: at the logon of the current user
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Settings: restart on failure (3 × 1-min intervals), no execution time limit,
# don't stop if on battery, don't start new instance if already running.
$Settings = New-ScheduledTaskSettingsSet `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable $true `
    -DisallowStartIfOnBatteries $false `
    -StopIfGoingOnBatteries $false

# ── Idempotent registration ───────────────────────────────────────────────────

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Task '$TaskName' already exists — updating."
    Set-ScheduledTask `
        -TaskName $TaskName `
        -Action   $Action `
        -Trigger  $Trigger `
        -Settings $Settings | Out-Null
} else {
    Register-ScheduledTask `
        -TaskName    $TaskName `
        -Action      $Action `
        -Trigger     $Trigger `
        -Settings    $Settings `
        -RunLevel    Limited `
        -Description "Liana Banyan Librarian MCP supervisor — auto-starts npm start in librarian-mcp/ at user login. K449(B118)." | Out-Null
    Write-Host "Task '$TaskName' registered."
}

Write-Host ""
Write-Host "Done. The supervisor will start automatically at next login."
Write-Host "To start it now:  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "To verify status: Get-ScheduledTask -TaskName '$TaskName' | Select-Object State"
Write-Host "To remove:        .\scripts\uninstall-task-scheduler.ps1"
