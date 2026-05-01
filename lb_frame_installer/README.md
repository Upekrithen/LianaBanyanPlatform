# LB Frame v0.1.0 — Cathedral Substrate Installer for Windows

**ONE BUTTON push → install → Walkaround demo → ready-to-use.**

AGPL v3 License. Full version. No strings attached.
Liana Banyan Corporation — cooperative AI substrate.

---

## What this installs

| Component | Count | Description |
|---|---|---|
| **Bishop hooks** | 16 | Discipline enforcement for Claude Code sessions |
| **CANON Eblets** | 15 | Canonical substrate (Ring of Three GOLDEN + project Eblets) |
| **Walkaround.ps1** | 1 | Cathedral verification script — auto-fires after install |
| **settings.json merge** | — | Additive hook registration; your existing settings are preserved |

The installer is **idempotent** — safe to re-run. Only missing files are added. Use `-Force` to overwrite.

---

## Requirements

- Windows 10 / 11
- Claude Code installed (`~/.claude/` directory must exist)
  — Get it at [claude.ai/download](https://claude.ai/download)
- PowerShell 5.1+ (included in all modern Windows — no extra install needed)

---

## Quick Start

Open PowerShell and run:

```powershell
powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1
```

That's it. The installer:
1. Detects your Claude Code install
2. Backs up your `settings.json`
3. Installs hooks + CANON Eblets (idempotent — safe to re-run)
4. Merges hook registrations into `settings.json` (additive — preserves your settings)
5. Drops `Walkaround.ps1` into your Documents folder
6. **Auto-fires Walkaround demo** — you see Cathedral verification live in the terminal

If everything is green: open Claude Code. The substrate is wired.

---

## Command-line options

| Flag | Description |
|---|---|
| `-Force` | Re-install even if files already exist |
| `-DryRun` | Show what would be done without touching the filesystem |
| `-SkipWalkaround` | Suppress the auto-fire Walkaround demo |

```powershell
# Re-install and overwrite existing files
powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1 -Force

# Preview without writing anything
powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1 -DryRun

# Install quietly (no Walkaround pop-up)
powershell -ExecutionPolicy Bypass -File LBFrame-Setup.ps1 -SkipWalkaround
```

---

## What is Walkaround?

Walkaround is the Cathedral verification script — a read-only, idempotent preflight check
modeled on a pilot's aircraft walkaround before pushing throttle.

It verifies:
- `~/.claude/settings.json` exists and is valid JSON
- All 9 required Bishop hooks are on disk and registered
- All 5 hook events (SessionStart, PreToolUse, PostToolUse, SessionEnd, UserPromptSubmit) are wired
- MCP servers (Librarian, Knight-Bishop Bridge, etc.) are configured
- MEMORY.md is present (project memory for Bishop sessions)
- CANON Eblets directory exists with ≥10 Eblets including Ring of Three GOLDEN
- Wrasse registry is present
- `canonical_values.yaml` (canonical numbers source-of-truth) is present

**Exit 0** = safe to start Bishop session.
**Exit 1** = critical substrate is missing — fix before opening Claude Code.

After install, Walkaround lives at `%USERPROFILE%\Documents\Walkaround.ps1`.
Run it any time before opening a Claude Code session:

```powershell
powershell -File "$env:USERPROFILE\Documents\Walkaround.ps1"
```

Or double-click `walkaround.bat` in your Documents folder.

---

## Building the package

If you're a developer building the installer zip from source:

```powershell
cd lb_frame_installer
powershell -ExecutionPolicy Bypass -File build_lb_frame_installer.ps1
```

Output: `dist/LBFrame-Setup-v0.1.0-walkaround-demo.zip`

The build script:
1. Copies Bishop hooks from `~/.claude/hooks/bishop_*.py`
2. Copies CANON Eblets from `~/.claude/state/eblets/CANON/` (preserving GOLDEN/ subdir)
3. Copies Walkaround files from `C:\Users\Administrator\Documents\`
4. Copies MEMORY.md template from `~/.claude/projects/.../memory/MEMORY.md`
5. Computes SHA-256 checksums for every file
6. Writes `manifest.json`
7. Zips `payload/ + LBFrame-Setup.ps1 + README.md + manifest.json` into `dist/`

---

## Running tests

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
python lb_frame_installer\tests_kn072.py
```

10 test classes, 28 individual assertions, design-validation focus (not live execution).

---

## License

**AGPL v3.** Full source. No gating. Forever.

Cathedral is free and full-version. `$5/year` unlocks Federation Library cooperative access — optional.

Full source at [github.com/LianaBanyanCorporation](https://github.com/LianaBanyanCorporation) *(coming soon)*.

---

## Filed under

**Liana Banyan Cooperative Defensive Patent Pledge (#2260)**

We file the IP so no one can lock it away. We pledge never to use it offensively against anyone
building on the cooperative substrate. AGPL v3 is the legal enforcement layer; the Pledge is
the moral enforcement layer.

---

*LB Frame v0.1.0 — Bean KN072 / BP006 / Pod EE — Liana Banyan Corporation (Wyoming C-Corp)*
*THE SHADOW KNOWS!*
