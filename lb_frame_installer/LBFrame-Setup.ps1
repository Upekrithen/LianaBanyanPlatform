<#
.SYNOPSIS
    LB Frame v0.1.0 installer — Cathedral substrate for your local AI.
    ONE BUTTON push → install → Walkaround demo → ready-to-use.
    AGPL v3 license. Full version. No strings attached.
    Liana Banyan Corporation — cooperative AI substrate.

.DESCRIPTION
    Installs:
      - 16 Bishop hooks  (discipline enforcement for Claude Code sessions)
      - 15 CANON Eblets  (canonical substrate, Ring of Three GOLDEN included)
      - Walkaround.ps1   (Cathedral verification script, auto-fires as final step)
      - Merges hook registrations into ~/.claude/settings.json (additive only)

    Idempotent: re-running produces identical end-state.
    Use -Force to overwrite existing files.
    Use -SkipWalkaround to suppress the auto-fire demo.
    Use -DryRun to see what would be done without touching the filesystem.

.PARAMETER Force
    Overwrite existing hooks/eblets even if already present.

.PARAMETER DryRun
    Show what would be installed without actually writing any files.

.PARAMETER SkipWalkaround
    Do not auto-fire Walkaround.ps1 as the final install step.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1
    powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1 -Force
    powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1 -DryRun
    powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1 -SkipWalkaround

.NOTES
    Bean: KN072 / BP006 / Pod EE
    Liana Banyan Corporation (Wyoming C-Corp) — EIN 41-2797446
    AGPL v3 — full source, no gating, forever.
    Filed under Cooperative Defensive Patent Pledge (#2260).
#>
param(
    [switch]$Force,
    [switch]$DryRun,
    [switch]$SkipWalkaround
)

$ErrorActionPreference = "Stop"
$Version     = "0.1.0"
$InstallBase = "$env:USERPROFILE\.claude"
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$PayloadDir  = Join-Path $ScriptDir "payload"
$DocsPath    = [Environment]::GetFolderPath("MyDocuments")

function Write-Step { param([string]$msg) Write-Host "  → $msg" -ForegroundColor Cyan }
function Write-OK   { param([string]$msg) Write-Host "  ✓ $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Write-Err  { param([string]$msg) Write-Host "  ✗ $msg" -ForegroundColor Red }

function Copy-IfNew {
    param([string]$Src, [string]$Dst)
    if (-not (Test-Path $Src)) { Write-Warn "Source not found: $Src"; return $false }
    $dstDir = Split-Path $Dst -Parent
    if (-not (Test-Path $dstDir)) {
        if (-not $DryRun) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }
    }
    if ((Test-Path $Dst) -and -not $Force) { return $true }  # skip-if-exists (idempotent)
    if ($DryRun) {
        Write-Step "[DryRun] Would copy: $(Split-Path $Src -Leaf) → $Dst"
    } else {
        Copy-Item $Src $Dst -Force
    }
    return $true
}

# ─── Banner ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  LB Frame v$Version — Cathedral Substrate Installer     ║" -ForegroundColor Cyan
Write-Host "║  ONE BUTTON push → install → Walkaround demo         ║" -ForegroundColor Cyan
Write-Host "║  AGPL v3 · Liana Banyan Corporation                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
if ($DryRun) { Write-Warn "DRY RUN — no files will be written"; Write-Host "" }

# ─── Step 1: Detect existing Claude Code install ──────────────────────────────
Write-Step "Checking for Claude Code install..."
if (-not (Test-Path $InstallBase)) {
    Write-Warn "~/.claude/ not found. LB Frame requires Claude Code."
    Write-Warn "Install Claude Code from claude.ai/download, then re-run this installer."
    Write-Warn "(Note: 'claude' CLI does not need to be on PATH — only ~/.claude/ must exist)"
    Write-Warn "Continuing anyway — files will be laid down for when you install Claude Code."
    Write-Host ""
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $InstallBase | Out-Null
        Write-OK "Created $InstallBase (empty stub)"
    }
} else {
    Write-OK "Found ~/.claude/ at $InstallBase"
}

$claudeOnPath = $null -ne (Get-Command claude -ErrorAction SilentlyContinue)
if (-not $claudeOnPath) {
    Write-Warn "'claude' not found on PATH — that's fine; Claude Code GUI uses ~/.claude/ directly."
}

# ─── Step 2: Backup existing settings.json ───────────────────────────────────
Write-Step "Checking settings.json..."
$settingsPath = Join-Path $InstallBase "settings.json"
if (Test-Path $settingsPath) {
    $backupName = "settings.json.lbframe-backup-$(Get-Date -Format 'yyyyMMddHHmmss')"
    $backupPath = Join-Path $InstallBase $backupName
    if (-not $DryRun) { Copy-Item $settingsPath $backupPath }
    Write-OK "Backed up settings.json → $backupName"
} else {
    Write-Warn "settings.json not found — will create minimal stub"
    if (-not $DryRun) {
        @{ hooks = @{} } | ConvertTo-Json -Depth 3 | Set-Content $settingsPath -Encoding UTF8
        Write-OK "Created stub settings.json"
    }
}

# ─── Step 3: Install hooks ────────────────────────────────────────────────────
Write-Step "Installing Bishop hooks..."
$hooksDir     = Join-Path $InstallBase "hooks"
$hooksPayload = Join-Path $PayloadDir "hooks"

if (-not (Test-Path $hooksDir)) {
    if (-not $DryRun) { New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null }
}

$installedHooks = 0
if (Test-Path $hooksPayload) {
    $hookFiles = Get-ChildItem $hooksPayload -Filter "bishop_*.py" -File
    foreach ($h in $hookFiles) {
        $dst = Join-Path $hooksDir $h.Name
        if (Copy-IfNew $h.FullName $dst) { $installedHooks++ }
    }
    Write-OK "$installedHooks hook(s) installed to $hooksDir"
} else {
    Write-Warn "payload/hooks/ not found — skipping hook install (run build script first)"
}

# ─── Step 4: Install CANON Eblets ────────────────────────────────────────────
Write-Step "Installing CANON Eblets..."
$ebletsDir     = Join-Path $InstallBase "state\eblets\CANON"
$ebletsPayload = Join-Path $PayloadDir "eblets\CANON"

$installedEblets = 0
if (Test-Path $ebletsPayload) {
    $ebletFiles = Get-ChildItem $ebletsPayload -Filter "*.eblet.md" -File -Recurse
    foreach ($e in $ebletFiles) {
        $rel = $e.FullName.Substring($ebletsPayload.Length).TrimStart('\', '/')
        $dst = Join-Path $ebletsDir $rel
        if (Copy-IfNew $e.FullName $dst) { $installedEblets++ }
    }
    Write-OK "$installedEblets eblet(s) installed to $ebletsDir"
} else {
    Write-Warn "payload/eblets/ not found — skipping eblet install (run build script first)"
}

# ─── Step 5: Merge hook registrations into settings.json (additive only) ──────
Write-Step "Merging hook registrations into settings.json..."
if (-not $DryRun -and (Test-Path $settingsPath)) {
    try {
        $cfg = Get-Content $settingsPath -Raw | ConvertFrom-Json

        # Ensure hooks property exists
        if (-not $cfg.PSObject.Properties['hooks']) {
            $cfg | Add-Member -MemberType NoteProperty -Name 'hooks' -Value ([PSCustomObject]@{})
        }

        # Hook event → script file mappings (additive — we only add, never remove)
        $hookMappings = @{
            SessionStart     = @("bishop_session_start.py")
            SessionEnd       = @("bishop_session_end.py", "bishop_session_transcript_scribe.py", "bishop_shutterbug_cc.py")
            PreToolUse       = @("bishop_catechist_rules.py", "bishop_librarian_gate.py")
            PostToolUse      = @("bishop_catechist_grader.py", "bishop_eblet_post_hook.py",
                                 "bishop_augur_post_audit.py", "bishop_shutterbug_capture.py")
            UserPromptSubmit = @("bishop_catechist_scribe.py")
        }

        foreach ($evt in $hookMappings.Keys) {
            $scriptList = $hookMappings[$evt]
            if (-not $cfg.hooks.PSObject.Properties[$evt]) {
                $cfg.hooks | Add-Member -MemberType NoteProperty -Name $evt -Value @()
            }
            # Build the matcher entry LB Frame uses
            $lbMatcher = [PSCustomObject]@{
                matcher = ""
                hooks   = @($scriptList | ForEach-Object {
                    [PSCustomObject]@{
                        type    = "command"
                        command = "python `"$hooksDir\$_`""
                    }
                })
            }
            # Only add if our marker isn't already in there (idempotent)
            $alreadyHasLb = $false
            foreach ($m in $cfg.hooks.$evt) {
                if ($m.hooks | Where-Object { $_.command -like "*bishop_*" }) {
                    $alreadyHasLb = $true; break
                }
            }
            if (-not $alreadyHasLb -or $Force) {
                $cfg.hooks.$evt = @($cfg.hooks.$evt) + $lbMatcher
            }
        }

        $cfg | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding UTF8
        Write-OK "settings.json updated (additive merge — your existing settings preserved)"
    } catch {
        Write-Warn "Could not merge settings.json: $_"
        Write-Warn "You can manually register hooks using 'claude hooks add' or by editing settings.json."
    }
} elseif ($DryRun) {
    Write-Step "[DryRun] Would merge bishop hook registrations into settings.json"
}

# ─── Step 6: Drop Walkaround.ps1 + walkaround.bat into Documents/ ────────────
Write-Step "Installing Walkaround files to $DocsPath..."
$walkaroundPayload = Join-Path $PayloadDir "walkaround"
$walkaroundInstalled = 0
foreach ($wf in @("Walkaround.ps1", "walkaround.bat")) {
    $src = Join-Path $walkaroundPayload $wf
    $dst = Join-Path $DocsPath $wf
    if (Copy-IfNew $src $dst) { $walkaroundInstalled++ }
}
if ($walkaroundInstalled -gt 0) {
    Write-OK "$walkaroundInstalled Walkaround file(s) installed"
} else {
    Write-Warn "payload/walkaround/ not found or files already present (use -Force to overwrite)"
}

# ─── Step 7: Install MEMORY.md template (if provided) ────────────────────────
$memTemplate = Join-Path $PayloadDir "MEMORY.md.template"
if (Test-Path $memTemplate) {
    $memTarget = Join-Path "$InstallBase\projects\C--Users-Administrator-Documents\memory" "MEMORY.md"
    $memTargetDir = Split-Path $memTarget -Parent
    if (-not $DryRun) {
        if (-not (Test-Path $memTargetDir)) {
            New-Item -ItemType Directory -Force -Path $memTargetDir | Out-Null
        }
        if (-not (Test-Path $memTarget) -or $Force) {
            Copy-Item $memTemplate $memTarget
            Write-OK "MEMORY.md installed"
        } else {
            Write-OK "MEMORY.md already present — skipping (use -Force to overwrite)"
        }
    } else {
        Write-Step "[DryRun] Would install MEMORY.md → $memTarget"
    }
}

# ─── Step 8: Auto-fire Walkaround demo ───────────────────────────────────────
Write-Host ""
Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
if (-not $SkipWalkaround -and -not $DryRun) {
    $walkaroundPath = Join-Path $DocsPath "Walkaround.ps1"
    if (Test-Path $walkaroundPath) {
        Write-Step "Firing Walkaround demo (Cathedral verification)..."
        Write-Host ""
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $walkaroundPath
        $exitCode = $LASTEXITCODE
        Write-Host ""
        Write-Host "──────────────────────────────────────────────────────" -ForegroundColor DarkGray
        if ($exitCode -eq 0) {
            Write-Host ""
            Write-Host "  ╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "  ║  LB Frame v$Version installed. Cathedral verified.  ║" -ForegroundColor Green
            Write-Host "  ║  Open Claude Code — substrate is wired and ready. ║" -ForegroundColor Green
            Write-Host "  ╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host ""
            exit 0
        } else {
            Write-Err "LB Frame installed but Cathedral verification reported issues (exit $exitCode)."
            Write-Err "Review the Walkaround output above and fix FAIL items before opening Claude Code."
            exit 1
        }
    } else {
        Write-Warn "Walkaround.ps1 not found at $walkaroundPath — skipping auto-fire demo."
        Write-Warn "Run it manually: powershell -File `"$walkaroundPath`""
    }
} elseif ($DryRun) {
    Write-Step "[DryRun] Would auto-fire Walkaround.ps1 from $DocsPath"
} else {
    Write-Warn "-SkipWalkaround specified — demo suppressed. Run Walkaround.ps1 manually when ready."
}

Write-Host ""
Write-OK "LB Frame v$Version installed successfully."
Write-Host ""
