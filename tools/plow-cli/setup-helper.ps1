#Requires -Version 5.1
<#
.SYNOPSIS
  MnemosyneC Plow CLI - LAN Mesh Bundle - Setup Helper
  Truth-Always: REPORTS your machine's readiness. Does NOT modify anything without explicit confirmation.
#>

Write-Host "=== MnemosyneC Plow CLI - LAN Mesh Bundle - Setup Helper ===" -ForegroundColor Cyan
Write-Host "Truth-Always: this script REPORTS your machine's readiness." -ForegroundColor Yellow
Write-Host "It does NOT modify anything without explicit confirmation." -ForegroundColor Yellow
Write-Host ""

$exitCode = 0

# --- Check 1: Node.js installed? ---
Write-Host "--- Check 1: Node.js installed ---" -ForegroundColor DarkGray
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "[ MISSING ] Node.js - not installed" -ForegroundColor Red
    Write-Host "  Install from: https://nodejs.org (LTS version)" -ForegroundColor White
    $exitCode = 1
} else {
    Write-Host "[ OK ] Node.js found: $($nodeCmd.Source)" -ForegroundColor Green
}
Write-Host ""

# --- Check 2: Node.js version >= 18? ---
Write-Host "--- Check 2: Node.js version >= 18 ---" -ForegroundColor DarkGray
if ($nodeCmd) {
    $nodeVerRaw = & node --version 2>&1
    $nodeVerMatch = $nodeVerRaw -match '^v(\d+)\.'
    if ($nodeVerMatch) {
        $nodeMajor = [int]$Matches[1]
        if ($nodeMajor -lt 18) {
            Write-Host "[ WARN ] Node.js $nodeVerRaw - recommend upgrading to v18 LTS or later" -ForegroundColor Yellow
            Write-Host "  Upgrade from: https://nodejs.org (LTS version)" -ForegroundColor White
        } else {
            Write-Host "[ OK ] Node.js version: $nodeVerRaw (>= 18)" -ForegroundColor Green
        }
    } else {
        Write-Host "[ WARN ] Could not parse Node.js version: $nodeVerRaw" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ SKIP ] Node.js not installed - version check skipped" -ForegroundColor DarkGray
}
Write-Host ""

# --- Check 3: Ollama running on localhost:11434? ---
Write-Host "--- Check 3: Ollama running on localhost:11434 ---" -ForegroundColor DarkGray
$ollamaResp = $null
try {
    $ollamaResp = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "[ OK ] Ollama running on localhost:11434" -ForegroundColor Green
} catch {
    Write-Host "[ MISSING ] Ollama not reachable on localhost:11434" -ForegroundColor Red
    Write-Host "  Install from: https://ollama.com/download" -ForegroundColor White
    $exitCode = 1
}
Write-Host ""

# --- Check 4: gemma4:12b pulled? ---
Write-Host "--- Check 4: gemma4:12b model pulled ---" -ForegroundColor DarkGray
if ($ollamaResp) {
    $modelNames = @($ollamaResp.models | ForEach-Object { $_.name })
    $has12b = $modelNames | Where-Object { $_ -like "gemma4:12b*" }
    if (-not $has12b) {
        Write-Host "[ MISSING ] gemma4:12b - not found in local Ollama" -ForegroundColor Red
        Write-Host "  Pull size: ~7 GB" -ForegroundColor White
        $yn = Read-Host "  Pull gemma4:12b now? (~7 GB) [Y/N]"
        if ($yn -match '^[Yy]') {
            Write-Host "  Pulling gemma4:12b..." -ForegroundColor Cyan
            & ollama pull gemma4:12b
        } else {
            Write-Host "  Skipped. Run 'ollama pull gemma4:12b' before running the benchmark." -ForegroundColor Yellow
            $exitCode = 1
        }
    } else {
        Write-Host "[ OK ] gemma4:12b found in Ollama" -ForegroundColor Green
    }
} else {
    Write-Host "[ SKIP ] Ollama not running - model check skipped" -ForegroundColor DarkGray
}
Write-Host ""

# --- Check 5: gemma2:2b pulled? ---
Write-Host "--- Check 5: gemma2:2b model pulled (lightweight tier) ---" -ForegroundColor DarkGray
if ($ollamaResp) {
    $modelNames = @($ollamaResp.models | ForEach-Object { $_.name })
    $has2b = $modelNames | Where-Object { $_ -like "gemma2:2b*" }
    if (-not $has2b) {
        Write-Host "[ MISSING ] gemma2:2b - not found in local Ollama" -ForegroundColor Yellow
        Write-Host "  (Required for M5 WAN node / lightweight-tier machines)" -ForegroundColor White
        $yn = Read-Host "  Pull gemma2:2b now? (~1.6 GB) [Y/N]"
        if ($yn -match '^[Yy]') {
            Write-Host "  Pulling gemma2:2b..." -ForegroundColor Cyan
            & ollama pull gemma2:2b
        } else {
            Write-Host "  Skipped. Run 'ollama pull gemma2:2b' if this is a lightweight node." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[ OK ] gemma2:2b found in Ollama" -ForegroundColor Green
    }
} else {
    Write-Host "[ SKIP ] Ollama not running - model check skipped" -ForegroundColor DarkGray
}
Write-Host ""

# --- Check 6: Disk space (need >= 20 GB free) ---
Write-Host "--- Check 6: Disk space (C:\) ---" -ForegroundColor DarkGray
$disk = Get-PSDrive C
$freeGB = [math]::Round($disk.Free / 1GB, 1)
if ($freeGB -lt 20) {
    Write-Host "[ WARN ] Only ${freeGB}GB free on C:\ - recommend >= 20 GB for safe operation" -ForegroundColor Yellow
} else {
    Write-Host "[ OK ] Disk space: ${freeGB}GB free" -ForegroundColor Green
}
Write-Host ""

# --- Check 7: RAM check + auto-recommend node tier ---
Write-Host "--- Check 7: RAM + tier recommendation ---" -ForegroundColor DarkGray
try {
    $ramGB = [math]::Round((Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum / 1GB)
    if ($ramGB -lt 12) {
        $tier = "lightweight (gemma2:2b) - suggest shard M5 or sit out"
    } elseif ($ramGB -lt 20) {
        $tier = "standard (gemma2:2b primary, gemma4:12b tight)"
    } elseif ($ramGB -lt 48) {
        $tier = "premium (gemma4:12b comfortable)"
    } else {
        $tier = "heavy (gemma4:12b + Conductor capacity)"
    }
    Write-Host "[ INFO ] RAM: ${ramGB}GB - Recommended tier: $tier" -ForegroundColor Cyan
} catch {
    Write-Host "[ WARN ] Could not read RAM info: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# --- Check 8: Firewall port-open helper (optional, for v0.5.0+ MIC) ---
Write-Host "--- Check 8: Firewall ports (UDP 7475 / TCP 7474) for MIC LAN auto-discovery ---" -ForegroundColor DarkGray
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ SKIP ] Firewall check skipped - run as Administrator to enable MIC LAN auto-discovery" -ForegroundColor DarkGray
} else {
    $yn = Read-Host "  Open UDP 7475 and TCP 7474 (Domain+Private only) for MIC LAN? [Y/N]"
    if ($yn -match '^[Yy]') {
        try {
            New-NetFirewallRule -DisplayName "MnemosyneC MIC UDP 7475" -Direction Inbound -Protocol UDP -LocalPort 7475 -Profile Domain,Private -Action Allow -ErrorAction Stop | Out-Null
            New-NetFirewallRule -DisplayName "MnemosyneC MIC TCP 7474" -Direction Inbound -Protocol TCP -LocalPort 7474 -Profile Domain,Private -Action Allow -ErrorAction Stop | Out-Null
            Write-Host "[ OK ] Firewall rules created for UDP 7475 and TCP 7474 (Domain+Private)" -ForegroundColor Green
        } catch {
            Write-Host "[ ERROR ] Could not create firewall rules: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[ SKIP ] Firewall rules not modified." -ForegroundColor DarkGray
    }
}
Write-Host ""

# --- Check 9: Print recommended invocation ---
Write-Host "--- Check 9: Recommended invocation for this machine ---" -ForegroundColor DarkGray
try {
    $ramGB9 = [math]::Round((Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum / 1GB)
    if ($ramGB9 -lt 12) {
        Write-Host "  Recommended: M5 (WAN/lightweight) - or sit out and wait for aggregate" -ForegroundColor Cyan
        Write-Host "  Command: node plow-cli.js shards\m5_shard.json --model gemma2:2b --out m5_results.jsonl" -ForegroundColor White
    } elseif ($ramGB9 -lt 20) {
        Write-Host "  Recommended: gemma2:2b (your RAM is tight for gemma4:12b)" -ForegroundColor Cyan
        Write-Host "  Command: node plow-cli.js shards\mX_shard.json --model gemma2:2b --out mX_results.jsonl" -ForegroundColor White
        Write-Host "  (Replace X with your assigned shard number)" -ForegroundColor DarkGray
    } else {
        Write-Host "  Recommended: gemma4:12b (your RAM is sufficient)" -ForegroundColor Cyan
        Write-Host "  Command: node plow-cli.js shards\mX_shard.json --model gemma4:12b --out mX_results.jsonl" -ForegroundColor White
        Write-Host "  (Replace X with your assigned shard number: m1, m2, or m3)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "  Command: node plow-cli.js shards\mX_shard.json --model gemma4:12b --out mX_results.jsonl" -ForegroundColor White
    Write-Host "  (Replace X with your assigned shard number)" -ForegroundColor DarkGray
}
Write-Host ""

# --- Summary ---
Write-Host "=== Setup Helper Complete ===" -ForegroundColor Cyan
if ($exitCode -eq 0) {
    Write-Host "[ READY ] All critical checks passed. You are ready to run the benchmark." -ForegroundColor Green
} else {
    Write-Host "[ BLOCKED ] One or more critical items are missing. Resolve above before running." -ForegroundColor Red
}
Write-Host ""
Write-Host "Full LAN mesh instructions: https://mnemosynec.ai/tools/lan-mesh-cards/" -ForegroundColor DarkGray

exit $exitCode
