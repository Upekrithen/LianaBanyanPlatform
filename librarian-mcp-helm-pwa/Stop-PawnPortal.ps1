<#
.SYNOPSIS
    Stop all Pawn Portal processes -- K510 / B125

.DESCRIPTION
    Finds and terminates:
      1. The Helm daemon (Python daemon_wrapper.py) listening on port 7712 (REST)
         and/or port 7711 (MCP SSE).
      2. The Vite dev web server listening on port 5173.
    Safe to run when processes are already stopped (no-op with a status message).

.EXAMPLE
    .\Stop-PawnPortal.ps1

.NOTES
    K510 / B125 -- Liana Banyan Platform
    Does NOT touch the Helm Electron app (if running separately).
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'SilentlyContinue'

Write-Host ''
Write-Host '[pawn-portal-stop] -- Pawn Portal Stop --' -ForegroundColor Cyan

$killed = 0

function Stop-ByPort {
    param([int]$Port, [string]$Label)
    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "[pawn-portal-stop] Stopping $Label ($($proc.Name) PID=$($proc.Id))" -ForegroundColor Yellow
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                $script:killed++
            }
        }
    } catch {
        # Port not in use -- that is fine.
    }
}

# 1. Daemon REST port (7712) -- primary stop target.
Stop-ByPort -Port 7712 -Label 'daemon REST'

# 2. Daemon MCP SSE port (7711) -- belt-and-suspenders in case REST is already down.
Stop-ByPort -Port 7711 -Label 'daemon MCP'

# 3. Vite dev server (5173).
Stop-ByPort -Port 5173 -Label 'Vite dev server'

# 4. Verify daemon health is gone.
Start-Sleep -Milliseconds 500
try {
    $r = Invoke-RestMethod -Uri 'http://127.0.0.1:7712/health' -Method Get -TimeoutSec 2
    if ($r.status -eq 'ok') {
        Write-Host '[pawn-portal-stop] WARN: daemon still responding after stop attempt.' -ForegroundColor Yellow
    }
} catch {
    # Expected -- daemon is gone.
}

Write-Host ''
if ($killed -gt 0) {
    Write-Host "[pawn-portal-stop] [OK] Stopped $($killed) process(es)." -ForegroundColor Green
} else {
    Write-Host '[pawn-portal-stop] Nothing to stop -- all Pawn Portal processes already down.' -ForegroundColor DarkGray
}
Write-Host ''
