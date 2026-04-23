# uninstall-task-scheduler.ps1 — K449(B118): remove the Librarian MCP scheduled task
# ====================================================================================
# Stops and removes the task created by install-task-scheduler.ps1.
# Idempotent: safe to run even if the task does not exist.
#
# Usage:
#   .\scripts\uninstall-task-scheduler.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$TaskName = "LianaBanyanLibrarianMCP"

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $existing) {
    Write-Host "Task '$TaskName' does not exist. Nothing to remove."
    exit 0
}

# Stop the task if it's currently running
if ($existing.State -eq "Running") {
    Write-Host "Task '$TaskName' is running — stopping it first."
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Host "Task '$TaskName' removed."
