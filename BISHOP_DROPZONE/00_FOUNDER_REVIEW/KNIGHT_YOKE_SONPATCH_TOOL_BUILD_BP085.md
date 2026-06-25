# KNIGHT YOKE · SonPatch Tool Build · BP085 TONIGHT-MESH
**Yoke ID:** KNIGHT_YOKE_SONPATCH_TOOL_BUILD_BP085  
**Issued:** 2026-06-16  
**Urgency:** TONIGHT-MESH — ship within hours, Substrate Awakens prep  
**Bishop SEG dispatch:** Sonnet 4.6 exclusively

---

## PREAMBLE (VERBATIM — LOAD-BEARING · DO NOT SKIP)

> Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## SCOPE

**Build SonPatch.exe — one-click MnemosyneC v0.5.0 install + Stage-B cure + mesh-test landing**

Son downloads from `https://mnemosynec.ai/tools/SonPatch.exe` → right-click "Run as Administrator" → tool handles EVERYTHING without Son touching a command line. Founder debugs remotely via `%TEMP%\SonPatch.log`.

---

## TONIGHT-MESH URGENCY

Substrate Awakens targets 2026-06-20 (Saturday). Son's machine is stuck at Stage-B (onboarding-stuck canon BP083). He must be on v0.5.0 and running mesh-test before that event. This yoke is time-critical. Ship SonPatch.exe tonight. No scope creep — 6 SEGs, clean receipts, done.

---

## TRUTH-ALWAYS STANDING ORDER (BP084 wan-relay lesson · NEVER EAT ERRORS SILENTLY)

Every PowerShell step in SEG-1 MUST use `try { ... } catch { $errMsg = $_.Exception.Message; Add-Content $logPath "[ERROR] $errMsg"; Write-Host "FAILED: $errMsg" -ForegroundColor Red; exit 1 }`. NO silent catches. NO bare `2>$null` swallowing real failures. Error class logged explicitly. If a step fails, the tool STOPS and tells the user clearly what failed — no scary stack traces, plain English message.

---

## SEG-1 · Compose PowerShell Core Script

**Spawn:** Sonnet 4.6 SEG  
**Task:** Write `SonPatch.ps1` — the full core logic script

**File destination:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec\tools\SonPatch.ps1`

**Script must perform these steps IN ORDER, each wrapped in try/catch:**

### Step 1 — Init logging
```
$logPath = "$env:TEMP\SonPatch.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$backupTag = Get-Date -Format "yyyyMMdd_HHmmss"
Add-Content $logPath "[$timestamp] SonPatch BP085 started"
```

### Step 2 — Detect and kill MnemosyneC processes
- `Get-Process -Name "MnemosyneC" -ErrorAction SilentlyContinue | Stop-Process -Force`
- Also check process names: `mnemosynec`, `MnemosyneC Setup*`
- Log each killed PID
- If no process found, log "No running MnemosyneC process detected — continuing"
- Wait 2 seconds after kill before proceeding

### Step 3 — Detect current install state
- Check registry: `HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\` for MnemosyneC entry
- Extract installed version string if found, log it
- Check profile folder: `$env:APPDATA\mnemosynec\` (lowercase — BP083 canon)
- Log presence/absence and last-modified date of profile folder

### Step 4 — Stage-B detection logic
Check EITHER condition:
- (A) Profile folder exists AND contains a JSON file with a lifecycle stage field set to a non-completed value (check `mnemosynec\*config*.json` or `mnemosynec\*profile*.json` for keys like `lifecycleStage`, `onboardingStage`, `stage` — value NOT "complete" / "completed" / "done" / "active")  
- (B) Profile folder exists AND last-modified timestamp on the folder is > 7 days ago AND no file inside contains a "completed" or "active" flag

If EITHER condition is true → `$stageB = $true`. Log the detection reason verbatim.  
If neither condition → `$stageB = $false`. Log "Stage-B not detected — proceeding to clean install only."

### Step 5 — Backup then wipe (only if $stageB = $true OR profile folder present)
- Backup destination: `$env:APPDATA\mnemosynec.bak.$backupTag\`
- Use `Copy-Item -Recurse -Force` to copy entire `$env:APPDATA\mnemosynec\` to backup
- Log backup path
- After copy verified (backup folder exists AND item count matches), remove original: `Remove-Item -Recurse -Force "$env:APPDATA\mnemosynec\"`
- Log "Profile wiped. Backup at: [path]"
- If profile folder does NOT exist, skip backup/wipe, log "No existing profile — fresh install path"

### Step 6 — Download installer with retry + SHA256 verify
```
$installerUrl = "https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe"
$installerPath = "$env:TEMP\MnemosyneC-Setup-0.5.0.exe"
$expectedHash = "PLACEHOLDER_HASH_SEG5_WILL_FILL"  # SEG-5 fills this after build
```
- Max 3 retry attempts, 5-second wait between
- Use `Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing`
- After download: compute `(Get-FileHash $installerPath -Algorithm SHA256).Hash`
- Compare to `$expectedHash` — if mismatch, log "HASH MISMATCH — aborting" and exit 1
- NOTE: Until SEG-5 fills the real hash, script should log a WARNING and continue (hash-skip mode for initial dev/test run). Add `$skipHashCheck = $true` flag at top of script so Founder can toggle.

### Step 7 — Run installer silently
```
Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait -NoNewWindow
```
- Check exit code — 0 = success, anything else = log error + exit 1
- Log "Installer completed with exit code: [n]"

### Step 8 — Launch MnemosyneC with 5-second delay
```
Start-Sleep -Seconds 5
$installPath = "$env:LOCALAPPDATA\Programs\mnemosynec\MnemosyneC.exe"
# Fallback paths to check if not found at primary:
# "$env:PROGRAMFILES\MnemosyneC\MnemosyneC.exe"
# "$env:PROGRAMFILES(X86)\MnemosyneC\MnemosyneC.exe"
```
- Try primary path, then fallback paths
- If none found: log error "MnemosyneC.exe not found after install — check install path" + exit 1
- Launch: `Start-Process -FilePath $installPath`
- Log "MnemosyneC launched from: [path]"

### Step 9 — Open browser tab to mesh-test landing
```
$meshTestUrl = "https://mnemosynec.ai/welcome/mesh-test"
Start-Process $meshTestUrl
```
- Log "Opened mesh-test landing page"
- NOTE: Founder will provide final URL later — use this placeholder, Knight must make it easy to swap

### Step 10 — Final success message
- Write to log: "SonPatch completed successfully [$timestamp]"
- Display in console (NOT a stack trace):
```
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SonPatch complete!" -ForegroundColor Green
Write-Host "  MnemosyneC v0.5.0 is installed and open." -ForegroundColor Green  
Write-Host "  Log saved to: $logPath" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
```
- Add 10-second pause (`Start-Sleep 10`) so console window doesn't vanish if double-clicked

**SEG-1 Sharp return:**
- [ ] `SonPatch.ps1` written to disk at absolute path above
- [ ] All 10 steps present, each in try/catch
- [ ] No bare silent catches
- [ ] `$skipHashCheck = $true` flag present at top for dev mode
- [ ] Script runs cleanly with `-WhatIf` dry-run simulation flag (add `-WhatIf` passthrough to destructive operations where PowerShell supports it)

---

## SEG-2 · Wrap PS1 as Distributable Executable

**Spawn:** Sonnet 4.6 SEG  
**Task:** Research ps2exe vs NSIS self-extracting bundle — pick the faster/cleaner path for tonight, produce SonPatch.exe

**Research question:** Which ships faster tonight given Windows + PowerShell environment?
- `ps2exe` (Install-Module ps2exe · wraps PS1 into .exe · pure PowerShell · no GUI installer builder needed)
- NSIS self-extracting bundle (requires NSIS install, makensis.exe, more setup but produces "real" signed-looking installer)

**Decision criteria for SEG-2:**
- Tonight-mesh urgency → prefer ps2exe if it produces a runnable .exe that does NOT require PS execution policy changes on target machine
- If ps2exe output requires `Set-ExecutionPolicy` workaround on Son's machine → fall back to NSIS
- If neither is viable in < 30 minutes → produce a self-extracting `.bat` wrapper as last resort (not ideal but ships tonight)

**Build steps (ps2exe path — preferred):**
```powershell
Install-Module -Name ps2exe -Scope CurrentUser -Force
Invoke-ps2exe -inputFile "...\SonPatch.ps1" `
              -outputFile "...\SonPatch.exe" `
              -requireAdmin `          # triggers UAC "Run as Administrator" prompt
              -noConsole:$false `      # keep console visible so user sees progress
              -title "SonPatch · MnemosyneC BP085" `
              -description "One-click MnemosyneC v0.5.0 installer and Stage-B cure" `
              -company "Liana Banyan Cooperative" `
              -version "0.5.0.1"
```

**Output destination:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec\tools\SonPatch.exe`

**SEG-2 Sharp return:**
- [ ] Decision logged: ps2exe vs NSIS vs bat — reason given
- [ ] `SonPatch.exe` produced at output destination
- [ ] `.exe` launches without requiring manual execution policy change
- [ ] UAC elevation prompt fires on double-click (requireAdmin flag working)
- [ ] File size logged (expect < 5MB for ps2exe wraps)

---

## SEG-3 · Stage Files at Cephas Public Tools Directory

**Spawn:** Sonnet 4.6 SEG  
**Task:** Ensure both `SonPatch.exe` AND `SonPatch.ps1` are staged correctly for Hugo static deployment

**Verify both files present:**
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec\tools\SonPatch.exe`
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\public-mnemosynec\tools\SonPatch.ps1`

**Check Hugo config for binary passthrough:**
- Verify `public-mnemosynec\tools\` directory is NOT excluded from Hugo build output
- Check `config.toml` / `hugo.toml` / `config.yaml` for any `ignoreFiles` rules that would strip `.exe` or `.ps1`
- If `.exe` is blocked by Hugo config, flag this to Knight — may need `static/tools/` instead of `public-mnemosynec/tools/`
- Check if Firebase Hosting `firebase.json` rewrites would intercept `/tools/SonPatch.exe` — if so, add explicit passthrough rule

**Add SHA256 sidecar file:**
- Compute `(Get-FileHash SonPatch.exe -Algorithm SHA256).Hash`
- Write to `SonPatch.exe.sha256` in same directory
- Compute same for `SonPatch.ps1` → `SonPatch.ps1.sha256`
- These sidecar files let power users verify before running

**SEG-3 Sharp return:**
- [ ] Both `.exe` and `.ps1` present in correct directory
- [ ] Hugo/Firebase config verified — no rules blocking `.exe` delivery
- [ ] Two `.sha256` sidecar files written
- [ ] Absolute paths for all 4 files logged

---

## SEG-4 · Update `/tools/` Index Page with SonPatch Card

**Spawn:** Sonnet 4.6 SEG  
**Task:** Add SonPatch card to the `mnemosynec.ai/tools/` index page

**Locate the tools index page** — check these paths:
- `Cephas/cephas-hugo/content/tools/_index.md` or `content/tools/index.md`
- `Cephas/cephas-hugo/layouts/tools/` for any hardcoded HTML
- `Cephas/cephas-hugo/static/tools/index.html` if it's a static page

**Card content to add:**

```markdown
## SonPatch · BP085 Tonight-Mesh

**One-click MnemosyneC v0.5.0 installer and Stage-B cure**

Downloads, repairs stuck onboarding, installs v0.5.0, and opens the Substrate Awakens mesh-test page — no command line needed.

**Download:** [SonPatch.exe](https://mnemosynec.ai/tools/SonPatch.exe)  
**Power users:** [SonPatch.ps1](https://mnemosynec.ai/tools/SonPatch.ps1) (inspect before running)  
**SHA256:** [SonPatch.exe.sha256](https://mnemosynec.ai/tools/SonPatch.exe.sha256)

### Instructions
1. Click Download above
2. Right-click `SonPatch.exe` → **Run as Administrator**
3. Watch the console — it tells you everything it does
4. MnemosyneC v0.5.0 opens automatically when done
5. Log at `%TEMP%\SonPatch.log` if you need to share with support

**Version:** 0.5.0.1 · **Built:** 2026-06-16 · **Platform:** Windows 10/11 x64
```

**SEG-4 Sharp return:**
- [ ] Tools index page located (absolute path logged)
- [ ] SonPatch card added — `.exe` link, `.ps1` link, `.sha256` link, instructions
- [ ] No horizontal scroll introduced (NEVER SCROLL SIDEWAYS canon BP081)
- [ ] Card renders cleanly in Hugo local preview (`hugo serve`)

---

## SEG-5 · Firebase Deploy + SHA256 Verify + URL Resolve

**Spawn:** Sonnet 4.6 SEG  
**Task:** Deploy to Firebase, verify SonPatch.exe serves at live URL, compute and backfill real SHA256 into SonPatch.ps1

**Pre-deploy checklist:**
- [ ] Both `.exe` and `.ps1` in correct static/public directory
- [ ] `firebase.json` has no rewrite catching `/tools/**` that would 404 binary files
- [ ] Hugo build runs clean: `hugo --minify` (from cephas-hugo directory)

**Deploy:**
```powershell
# From LianaBanyanPlatform\Cephas\cephas-hugo
hugo --minify
firebase deploy --only hosting
```

**Post-deploy verification:**
1. `Invoke-WebRequest -Uri "https://mnemosynec.ai/tools/SonPatch.exe" -Method Head` → expect 200, Content-Type `application/octet-stream` or `application/x-msdownload`
2. `Invoke-WebRequest -Uri "https://mnemosynec.ai/tools/SonPatch.ps1" -Method Head` → expect 200
3. Download live `.exe` to temp, compute SHA256, compare to sidecar `.sha256` file
4. If hash matches → backfill `$expectedHash = "[REAL_HASH]"` into `SonPatch.ps1` AND rebuild `SonPatch.exe` with SEG-2 process, redeploy

**SEG-5 Sharp return:**
- [ ] Firebase deploy succeeded (exit 0)
- [ ] `https://mnemosynec.ai/tools/SonPatch.exe` returns HTTP 200
- [ ] `https://mnemosynec.ai/tools/SonPatch.ps1` returns HTTP 200
- [ ] Live SHA256 verified against sidecar
- [ ] `$expectedHash` in `SonPatch.ps1` updated to real value (or `$skipHashCheck` documented as intentional dev flag if hash not yet final)

---

## SEG-6 · Smoke Test (Clean VM or -WhatIf Dry Run)

**Spawn:** Sonnet 4.6 SEG  
**Task:** Validate SonPatch.exe end-to-end before handing to Son

**Path A — Clean Windows VM available:**
- Download `SonPatch.exe` from live URL (not local copy)
- Right-click → Run as Administrator
- Observe: UAC prompt fires · console opens · each step logs · MnemosyneC opens · browser opens mesh-test page
- Check `%TEMP%\SonPatch.log` — all 10 steps present, no ERROR entries
- Report exact version of MnemosyneC shown in About / title bar

**Path B — No clean VM (dry-run with -WhatIf):**
- Run: `powershell -ExecutionPolicy Bypass -File SonPatch.ps1 -WhatIf`
- Verify all destructive operations emit "What if:" output rather than executing
- Verify log file created at `%TEMP%\SonPatch.log`
- Manually trace through each step in the log — confirm flow matches spec

**Edge cases to verify:**
- What happens if MnemosyneC is NOT installed (fresh machine) — does it skip Stage-B check gracefully?
- What happens if `%APPDATA%\mnemosynec\` does NOT exist — does it skip backup/wipe gracefully?
- What happens if installer download fails on attempt 1 — does retry fire?
- What happens if download fails all 3 attempts — does it exit 1 with clear message?

**SEG-6 Sharp return:**
- [ ] Smoke test path used logged (VM or dry-run)
- [ ] All 10 steps in log confirmed
- [ ] No unhandled exceptions
- [ ] Edge case: fresh machine path confirmed clean
- [ ] Edge case: retry logic confirmed fires on network failure simulation
- [ ] Go/No-Go verdict: **GO** or **NO-GO with blocker description**

---

## 6 SHARPS RETURN TABLE

Knight returns this table completed before closing the yoke. All 6 must be GREEN for yoke to be ratified.

| # | SEG | Sharp | Status |
|---|-----|-------|--------|
| 1 | SEG-1 | `SonPatch.ps1` written, all 10 steps, try/catch on every step, no silent errors | ⬜ PENDING |
| 2 | SEG-2 | `SonPatch.exe` produced, UAC elevation fires, no execution policy workaround needed on Son's machine | ⬜ PENDING |
| 3 | SEG-3 | Both `.exe` + `.ps1` staged, Hugo/Firebase config clear, `.sha256` sidecars written | ⬜ PENDING |
| 4 | SEG-4 | Tools index page updated with SonPatch card, all 3 links present, no horizontal scroll | ⬜ PENDING |
| 5 | SEG-5 | Firebase deployed, both URLs return HTTP 200, live SHA256 verified | ⬜ PENDING |
| 6 | SEG-6 | Smoke test complete, all 10 log steps confirmed, Go/No-Go verdict logged | ⬜ PENDING |

**Yoke closes when all 6 = GREEN. Knight marks each GREEN inline as SEGs return.**

---

## FOUNDER NOTES (READ BEFORE DISPATCH)

1. **Mesh-test URL** — `https://mnemosynec.ai/welcome/mesh-test` is a placeholder. If Founder provides a different landing URL before Knight dispatches, Knight updates it in SonPatch.ps1 Step 9 before building `.exe`.

2. **Installer URL** — `https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.0.exe` must be live before SonPatch runs. SEG-5 verifies this. If v0.5.0 installer is not yet deployed, the entire chain fails at Step 6 — this is correct behavior (fail loudly, not silently).

3. **Son's machine** — profile folder is `%APPDATA%\mnemosynec\` (lowercase). This is the BP083 onboarding-stuck canon empirical finding. If the folder is ever at `MnemosyneC` (capital) on his specific machine, SEG-1 Stage-B detection misses it. Knight adds a fallback check for both capitalizations.

4. **Code signing** — ps2exe-wrapped `.exe` is unsigned. Windows SmartScreen may show "Windows protected your PC" on first run. Workaround for Son: click "More info" → "Run anyway." Long-term: Founder to obtain code signing cert. This is out of scope for tonight-mesh but Knight logs it as a follow-up item.

5. **Log sharing** — `%TEMP%\SonPatch.log` expands to `C:\Users\[username]\AppData\Local\Temp\SonPatch.log`. Founder can ask Son to share this file for remote debugging without Son touching a command line.

---

*Yoke issued by Bishop SEG · BP085 TONIGHT-MESH · 2026-06-16*  
*Sonnet 4.6 mandate applies to ALL SEG dispatches in this yoke*
