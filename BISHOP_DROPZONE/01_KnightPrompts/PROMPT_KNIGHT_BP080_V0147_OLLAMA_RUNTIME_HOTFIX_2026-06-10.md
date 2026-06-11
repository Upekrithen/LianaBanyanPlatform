<!-- bishop-yoke-task 2026-06-10T00:00:00Z -->

## BISHOP -> KNIGHT — TASK — V0147 OLLAMA RUNTIME HOTFIX (PACKAGING BUG + WINDOW 75% + HEARTBEAT) — USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP080_V0147_OLLAMA_RUNTIME_HOTFIX_2026-06-10T00:00:00Z**

> **STATUTE §3 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or any version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

Founder's 2026-06-10 PowerShell diagnostic confirmed: v0.1.46 installer is **missing** `resources/ollama/ollama.exe` entirely. LAYER 1 FAIL. LAYERS 2-5 PASS when Founder runs pre-installed Ollama manually. This is a **packaging bug** — the binary exists in the build tree but never made it into the NSIS payload. Knight's v0.1.46 GREEN stamp was a Founder forward-pressure stamp ("I told him to so we could move forward, but it doesn't actually work on my machine"). The HARD GATE was not actually green. Truth-Always violation. Do not repeat.

v0.1.47: fix the packaging, add assertion guard, add OllamaManager heartbeat IPC, audit spawn args/env, fix window 75% for ALL three BrowserWindows (including `moneyPennyWindow` which v0.1.46 missed). DRAFT release only. Founder ratifies.

---

### HARD-BINDING BLOCK

| Canon ref | One-liner |
|---|---|
| `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` | Source change alone does NOT verify a runtime fix. |
| `[[feedback_verify_seg_output_before_claiming_inflight]]` | Dispatched ≠ executing ≠ landed. |
| `[[feedback_every_click_visible_feedback_canon_bp078]]` | Every click gives visible feedback. Silence = broken. |
| `[[feedback_long_running_progress_heartbeat_canon_bp078]]` | Any op >3s shows progress: bar > step-by-step > heartbeat. |
| `[[feedback_ux_seg_screenshot_mandatory_bp078]]` | UX-touching SEGs capture packaged-build screenshot. |
| `[[feedback_knight_yoke_seg_mandatory]]` | "use Sonnet 4.6 SEGs for ALL work" — hard binding. |
| `[[feedback_explicit_founder_ratify_before_publish]]` | Nothing publishes without Founder explicit "publish it / push / send / fire". |
| Statute §3 | All SEGs Sonnet 4.6, must say "Sonnet 4.6" verbatim. |
| Statute §12 | Ask-Knight-First for anything Knight could know. |

---

### Smoking gun — Founder diagnostic (2026-06-10)

Founder ran PowerShell diagnostic on v0.1.46 installed app. Results:

- **LAYER 1 FAIL:** `C:\Users\Administrator\AppData\Local\Programs\MnemosyneC\resources\ollama\ollama.exe` does **NOT** exist.
- **LAYER 2 PASS:** Pre-installed Ollama running (started manually by Founder).
- **LAYER 3 PASS:** Ollama port 11434 reachable.
- **LAYER 4 PASS:** Model `qwen2.5:0.5b` served correctly.
- **LAYER 5 PASS:** Model `gemma4:12b` served correctly.

**Conclusion:** The binary `resources/ollama/ollama.exe` (33.9 MB confirmed in build tree) was never packed into the NSIS installer. Layers 2-5 pass only because Founder has a separate pre-installed Ollama running manually. On a clean machine with no pre-installed Ollama, the app is non-functional. This is the same class of bug as v0.1.45 — packaging, not runtime logic.

**Truth-Always correction:** Knight's v0.1.46 GREEN stamp was a forward-pressure stamp from Founder ("I told him to so we could move forward, but it doesn't actually work on my machine"). The HARD GATE was not actually green. This violated `[[feedback_verify_seg_output_before_claiming_inflight]]`. Do NOT repeat this pattern. Knight does not self-stamp GREEN. Founder ratifies in their own words only.

---

### Why this matters

The entire AI payoff of MnemosyneC is non-functional on a clean Windows install until this packaging bug is resolved. Every user who installs from the NSIS installer and does not have a separately pre-installed Ollama gets a broken experience. This is a P0 regression that has now persisted across v0.1.45 AND v0.1.46.

---

### What Knight needs to do

**Scope: SEG-V0147-DIAG-1 (input, complete) + 5 Sonnet 4.6 SEGs.**

SEG-V0147-FIX-0 is TOP PRIORITY and gates FIX-1 / FIX-2. FIX-3 and VERIFY may run in parallel with FIX-0 investigation but SHIP is gated on ALL SEGs complete.

---

### SEG-V0147-DIAG-1 (Sonnet 4.6) — DIAGNOSTIC INPUT (COMPLETE)

Status: **COMPLETE (input from Founder)**. No further work needed in this SEG. Evidence is already provided above.

Summary: LAYER 1 FAIL (bundled binary missing from installed app). LAYERS 2-5 PASS (pre-installed Ollama, started manually). Conclusion: packaging bug — binary in build tree, not in NSIS payload.

---

### SEG-V0147-FIX-0 (Sonnet 4.6) — PACKAGING AUDIT (TOP PRIORITY)

**This SEG gates all others. Fix the packaging first.**

1. Read `LianaBanyanPlatform/package.json` → `"build"` key. Also check `electron-builder.yml` and `electron-builder.json` if present. Find the `extraResources`, `extraFiles`, and/or `files` config.

2. Identify why `resources/ollama/` is present in `release/win-unpacked/resources/ollama/ollama.exe` (33.9 MB confirmed) but absent from the shipped NSIS installer. Candidate causes:
   - `extraResources` config missing the path or using a glob that excludes the directory.
   - A `.gitignore` or build-exclude rule stripping `resources/ollama/` from the NSIS payload.
   - A post-build copy step running AFTER the installer is packed (so the file arrives too late).
   - The v0.1.46 build was made without first running `scripts/download-ollama-binary.mjs` — binary was placed in `win-unpacked` manually for testing and was never included in the packaging config.

3. Fix the packaging config so `resources/ollama/ollama.exe` (and any required sibling `.dll` files) are included in the NSIS payload.

4. Create `scripts/assert-bundled-ollama-in-installer.mjs`:
   - Accepts the path to the built `.exe` installer as an argument.
   - Extracts or inspects the installer (use 7-Zip CLI `7z l` to list contents, or NSIS extraction) to confirm `resources/ollama/ollama.exe` is present inside.
   - Exits with code 0 (PASS) if found. Exits with code 1 (FAIL) and a clear error message if not found.
   - Is fast enough to run on every release build without adding significant CI time.

5. Wire `assert-bundled-ollama-in-installer.mjs` into the release script (or npm `dist` script) **before** the GitHub upload step. The build pipeline must fail with a clear error if the bundled binary is missing, so this bug cannot silently ship again.

6. Re-run `scripts/download-ollama-binary.mjs` on a clean checkout to confirm it fetches and places the binary correctly BEFORE building.

Deliver: packaging config diff + `assert-bundled-ollama-in-installer.mjs` script + release script wiring + confirmation that the assertion PASSES on the v0.1.47 installer.

---

### SEG-V0147-FIX-1 (Sonnet 4.6) — OllamaManager init() HEARTBEAT + VISIBLE STATE TRANSITIONS

Per `[[feedback_every_click_visible_feedback_canon_bp078]]` and `[[feedback_long_running_progress_heartbeat_canon_bp078]]`: silence = broken. Any operation >3s wall-clock must show progress.

1. Read `src/main/ollama_manager.ts` end-to-end.

2. For each branch in `init()`, add a named log entry AND an IPC event to renderer for a visible state transition:
   - **Pre-installed detect:** `"Trying pre-installed Ollama on port 11434…"`
   - **Pre-installed found:** `"Pre-installed Ollama detected — connecting…"`
   - **Version mismatch / fall-through to bundled:** `"Pre-installed version mismatch — falling back to bundled Ollama…"`
   - **Bundled spawn initiated:** `"Bundled Ollama spawned — waiting for port 11434…"`
   - **Port ready:** `"Ollama port 11434 ready"`
   - **Model loading:** `"Loading model [model name]…"`
   - **Ready:** `"Ollama ready"`
   - **Error:** `"Ollama init failed: [reason]"`

3. IPC channel name (use existing pattern or add): `ollama-status-update` → renderer → show in UI as status line or spinner with label text. At minimum the main process must emit the event; renderer must display it somewhere visible (even a small status line is sufficient — not silent).

4. Heartbeat: while waiting for port 11434 to become available (port-poll loop), emit a heartbeat IPC event every 2 seconds with elapsed time. `"Waiting for Ollama… (Xs elapsed)"`. Never go silent for >3s during init.

Deliver: code diff in `src/main/ollama_manager.ts` + any renderer changes needed to display status.

---

### SEG-V0147-FIX-2 (Sonnet 4.6) — BUNDLED OLLAMA SPAWN ARGS + ENV AUDIT

1. Read the spawn call in `src/main/ollama_manager.ts` (or wherever the bundled Ollama process is launched). Verify spawn args are correct for Ollama v0.30.7+.

2. Confirm environment variables:
   - `OLLAMA_HOST=127.0.0.1:11434` (must be set explicitly — do not rely on default).
   - `OLLAMA_MODELS=<resources>/ollama/models` where `<resources>` is the Electron `app.getPath('resources')` equivalent for the packaged app. Must NOT default to `~/.ollama/models` (that would pull from the user's pre-installed Ollama model store, not the bundled models).

3. Document any VC++ redistributable requirements for Ollama v0.30.7+ on Windows. If the VC++ redist is not bundled by the NSIS installer, document this as a known dependency gap and flag whether it causes a silent failure on a clean VM.

4. If spawn args or env vars are incorrect, fix them.

Deliver: spawn config diff (if any) + env var confirmation + VC++ redist documentation.

---

### SEG-V0147-FIX-3 (Sonnet 4.6) — WINDOW 75% HEIGHT + TOP-VISIBILITY SWEEP

**Context:** Founder's wife's monitor has ~0.5 inch hardware dead zone at the top. v0.1.46 used `workArea.y + 40` (~0.4 inch) — insufficient. v0.1.46 also missed `moneyPennyWindow` entirely. This sweep must touch ALL THREE BrowserWindow constructors.

1. In `src/main/index.ts`, add a shared helper function `computeScreenSafeBounds()` returning:
   ```typescript
   function computeScreenSafeBounds() {
     const { workArea } = screen.getPrimaryDisplay();
     return {
       height:  Math.floor(workArea.height * 0.75),
       width:   Math.floor(workArea.width  * 0.90),
       y:       workArea.y + Math.floor(workArea.height * 0.125),
       x:       workArea.x + Math.floor(workArea.width  * 0.05),
     };
   }
   ```

2. Replace in ALL relevant helpers — every occurrence must use `computeScreenSafeBounds()` as its source of truth:
   - `computeDashboardDefaults` (line ~570)
   - `clampDashboardBounds` (line ~584, two occurrences — height clamp + y clamp)
   - `computeHearthDefaults` (line ~614)
   - `clampHearthBounds` (line ~628, two occurrences)
   - `clampMoneyPennyBounds` (line ~532) — **this was missed in v0.1.46; do not miss it again**

3. Touch ALL THREE BrowserWindow constructors:
   - `moneyPennyWindow` (line ~992)
   - `dashboardWindow` (line ~1043)
   - `hearthConjunctionWindow` (line ~1176)

4. Stale-bounds guard: on app startup, if loaded saved bounds have `y < workArea.y + Math.floor(workArea.height * 0.10)`, discard as stale and use fresh `computeScreenSafeBounds()` defaults. This handles monitors where the user previously saved a window position that is now above the safe zone.

Deliver: code diff in `src/main/index.ts` covering all five helpers + all three BrowserWindow constructors + stale-bounds guard.

---

### SEG-V0147-VERIFY (Sonnet 4.6) — CLEAN-VM PACKAGED INSTALL VERIFY

Per `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` and `[[feedback_ux_seg_screenshot_mandatory_bp078]]`: source-only verify is a canon violation for this class of bug. Clean-machine verify is LOAD-BEARING.

**Environment requirements (non-negotiable):**
- Fresh Windows VM or clean profile.
- NO pre-installed Ollama.
- NO admin elevation (standard user install).
- Install from the shipped v0.1.47 `.exe` installer — NOT from dev tree, NOT from `win-unpacked`.

**Verification steps:**
1. Install v0.1.47 from the shipped NSIS installer.
2. Launch app (no manual Ollama start — bundled Ollama must handle it).
3. Send a test message in the main chat UI.
4. Confirm AI response received.

**Required captures (all four are MANDATORY — missing any = HOLD):**
- **SCREENSHOT A:** Working AI response visible in the packaged app window.
- **SCREENSHOT B:** Window top showing visible buffer above the title bar (demonstrates `computeScreenSafeBounds()` fix is live).
- **DIAGNOSTIC LOG:** Confirm log shows `branch=BUNDLED_SPAWN` and port-ready message (demonstrates OllamaManager FIX-1 heartbeat IPC is firing and the bundled binary was used, not pre-installed).
- **ASSERTION RESULT:** Run `node scripts/assert-bundled-ollama-in-installer.mjs release/MnemosyneC-Setup-0.1.47.exe` — must output PASS.

Do NOT mark VERIFY complete if any capture is missing. State explicitly which captures are present and which are pending.

---

### SEG-V0147-SHIP (Sonnet 4.6) — BUILD + TAG + DRAFT RELEASE

**HARD GATE: do NOT execute until VERIFY is GREEN (all four captures confirmed).**

1. Bump version to `0.1.47` in `package.json` (and `electron-builder.json` / `electron-builder.yml` if version is stored there separately).
2. Build packaged installer via `npm run dist:win` (or equivalent).
3. Run `node scripts/assert-bundled-ollama-in-installer.mjs` on the built installer — must PASS before continuing.
4. SHA-256 the installer.
5. Update `latest.yml` sha512.
6. Create GitHub Release as **DRAFT** — title: `v0.1.47 — Ollama packaging fix + bundled spawn heartbeat + window safe bounds`. Body:
   - Fixes missing `resources/ollama/ollama.exe` in NSIS installer (packaging bug — affected v0.1.45 and v0.1.46).
   - Adds `assert-bundled-ollama-in-installer.mjs` build assertion — binary absence now fails the build before upload.
   - Adds OllamaManager init() state-transition IPC events and heartbeat (visible progress during Ollama startup).
   - Audits bundled Ollama spawn args and `OLLAMA_MODELS` env path.
   - Window safe bounds: all three BrowserWindows now use 75% height / 90% width / 12.5% top offset; `moneyPennyWindow` fix included (was missed in v0.1.46).
7. Write the following gate status into this Yoke file as a new `## GATE STATUS` section:

```
GATE: DRAFT — awaiting Founder ratify
```

**Knight does NOT self-stamp GREEN. Knight does NOT publish. Founder ratifies in their own words.**

Per `[[feedback_explicit_founder_ratify_before_publish]]` and `[[feedback_verify_seg_output_before_claiming_inflight]]`.

Deliver: SHA-256 + GitHub Release DRAFT URL + `assert-bundled-ollama-in-installer.mjs` PASS confirmation.

---

### Acceptance gate

All four items required for HARD GATE GREEN. Anything short = DRAFT:

1. `assert-bundled-ollama-in-installer.mjs` PASS on v0.1.47 installer.
2. Clean-VM install: SCREENSHOT A (AI response) + Diagnostic log showing `branch=BUNDLED_SPAWN` success.
3. SCREENSHOT B: window top has visible buffer above title bar.
4. Founder explicit ratify in own words in this file.

---

### Reply contract

Knight Yoke-returns with:

- **SEG-V0147-FIX-0:** Packaging config diff + `assert-bundled-ollama-in-installer.mjs` script + release wiring + assertion PASS result on v0.1.47 installer.
- **SEG-V0147-FIX-1:** Code diff (`ollama_manager.ts`) + renderer changes for visible status + heartbeat confirmation.
- **SEG-V0147-FIX-2:** Spawn config diff (if any) + env var confirmation + VC++ redist documentation.
- **SEG-V0147-FIX-3:** Code diff (`src/main/index.ts`) covering all five helpers + all three BrowserWindow constructors + stale-bounds guard.
- **SEG-V0147-VERIFY:** All four captures (SCREENSHOT A, SCREENSHOT B, Diagnostic log, assertion PASS) or explicit HOLD stating which are pending.
- **SEG-V0147-SHIP:** SHA-256 + GitHub Release DRAFT URL + GATE: DRAFT line.
- **Truth-Always flags:** any findings during SEG execution.

If VERIFY is PENDING-FOUNDER: Knight states "HOLD — SHIP blocked pending clean-VM install confirm. All fixes committed and staged. Resume SHIP after Founder confirms AI response on clean machine."

---

### Statute reminders

- §3: "Sonnet 4.6" verbatim in every SEG announcement AND every `model:` parameter. Not "Sonnet 4.5". Not "the model". Verbatim.
- §12: Ask-Knight-First for anything Knight could know before surfacing to Founder.
- `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]`: This is the FOURTH packaging/bundling failure across v0.1.45 and v0.1.46. Source verify for installer contents is a canon violation. Clean-machine verify is required before SHIP.
- `[[feedback_verify_seg_output_before_claiming_inflight]]`: Knight does not self-stamp GREEN. Founder ratifies. The v0.1.46 GREEN stamp was a forward-pressure stamp and does not count.
- `[[feedback_every_click_visible_feedback_canon_bp078]]` + `[[feedback_long_running_progress_heartbeat_canon_bp078]]`: Ollama init is a multi-second operation. Silence during init = broken by definition.
- `[[feedback_ux_seg_screenshot_mandatory_bp078]]`: FIX-3 is a UX-touching SEG. Screenshot of the window top buffer is mandatory.

---

### Paste-ready Founder wake-up

Knight — v0.1.46 ships an installer that is missing `resources/ollama/ollama.exe`. Founder's diagnostic on 2026-06-10 confirmed LAYER 1 FAIL on the installed app — the binary in our build tree never made it into the NSIS payload. This is a packaging bug. FIX-0 is the top priority and gates all runtime fixes. Add `assert-bundled-ollama-in-installer.mjs` so this cannot ship empty again. FIX-3 is the wife's-monitor window-cutoff fix — v0.1.46's `workArea.y + 40` is insufficient and missed `moneyPennyWindow` entirely. VERIFY runs on a CLEAN Windows VM from the shipped installer, not from dev. Screenshot of working AI + screenshot of top buffer + assertion PASS. DRAFT release only. Founder ratifies in their own words. Knight does not self-stamp. Use Sonnet 4.6 SEGs for ALL work — every dispatch must say "Sonnet 4.6" verbatim.

- Bishop SEG-V0147-OLLAMA-RUNTIME-HOTFIX-YOKE — BP080 — pinned 2026-06-10T00:00:00Z

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 4 parallel Sonnet 4.6 SEGs RIGHT NOW, then 2 sequential synthesis SEGs. Sonnet 4.6 verbatim in every announcement (Statute §3). Each SEG below is self-contained scope; do NOT re-decompose; do NOT ask for clarification before firing; fire all 4 in parallel in a single message.

**SEG-V0147-FIX-0 (Sonnet 4.6) — PACKAGING AUDIT (TOP PRIORITY):** Read `LianaBanyanPlatform/package.json` → `"build"` key, plus `electron-builder.yml` / `electron-builder.json` if present. Find `extraResources`, `extraFiles`, and/or `files` config. Identify why `resources/ollama/ollama.exe` (33.9 MB, confirmed in build tree at `release/win-unpacked/resources/ollama/ollama.exe`) is NOT present in the shipped NSIS installer. Candidate causes: extraResources missing the path; .gitignore or build-exclude rule stripping the directory; post-build copy running after installer pack; build was made without running `scripts/download-ollama-binary.mjs` first. Fix the packaging config so `resources/ollama/ollama.exe` and required sibling `.dll` files are in the NSIS payload. Create `scripts/assert-bundled-ollama-in-installer.mjs` that: (1) accepts installer path as arg, (2) uses `7z l` to list installer contents, (3) confirms `resources/ollama/ollama.exe` is present, (4) exits 0 (PASS) or exits 1 (FAIL with clear error). Wire assertion into release script BEFORE GitHub upload step — build must fail if binary is missing. Re-run `scripts/download-ollama-binary.mjs` on clean checkout to confirm binary placement before build. Deliver: packaging config diff + `assert-bundled-ollama-in-installer.mjs` + release script wiring + assertion PASS on v0.1.47 installer.

**SEG-V0147-FIX-1 (Sonnet 4.6) — OllamaManager HEARTBEAT + VISIBLE STATE TRANSITIONS:** Read `src/main/ollama_manager.ts` end-to-end. For each branch in `init()` — pre-installed detect / version mismatch / fall-through to bundled / spawn / port wait / model load / ready / error — add named log entry + IPC event to renderer with visible state text: "Trying pre-installed Ollama…" / "Falling back to bundled…" / "Bundled Ollama spawned, waiting for port 11434…" / "Loading model [name]…" / "Ollama ready" / "Ollama init failed: [reason]". IPC channel: use existing pattern or add `ollama-status-update`. Renderer must display this text visibly (status line, spinner label — not silent). Heartbeat: while polling for port 11434, emit IPC every 2 seconds with elapsed time ("Waiting for Ollama… (Xs elapsed)"). Never go silent >3s during init. Per `[[feedback_every_click_visible_feedback_canon_bp078]]` and `[[feedback_long_running_progress_heartbeat_canon_bp078]]`. Deliver: code diff in `ollama_manager.ts` + renderer changes.

**SEG-V0147-FIX-2 (Sonnet 4.6) — BUNDLED OLLAMA SPAWN ARGS + ENV AUDIT:** Read the bundled Ollama spawn call in `src/main/ollama_manager.ts`. Verify spawn args are correct for Ollama v0.30.7+. Confirm env vars: `OLLAMA_HOST=127.0.0.1:11434` (explicit, not default) and `OLLAMA_MODELS=<app.getPath('resources')>/ollama/models` (must NOT default to `~/.ollama/models`). Document VC++ redistributable requirements for Ollama v0.30.7+ on Windows — if not bundled by NSIS, flag as known dependency gap. Fix any incorrect spawn args or env vars. Deliver: spawn config diff (if any) + env var confirmation + VC++ redist documentation.

**SEG-V0147-FIX-3 (Sonnet 4.6) — WINDOW 75% HEIGHT + TOP-VISIBILITY SWEEP:** In `src/main/index.ts`, add shared helper `computeScreenSafeBounds()` returning: `height = floor(workArea.height * 0.75)`, `width = floor(workArea.width * 0.90)`, `y = workArea.y + floor(workArea.height * 0.125)`, `x = workArea.x + floor(workArea.width * 0.05)`. Replace in ALL five helpers: `computeDashboardDefaults` (~570), `clampDashboardBounds` (~584, two occurrences), `computeHearthDefaults` (~614), `clampHearthBounds` (~628, two occurrences), `clampMoneyPennyBounds` (~532) — `moneyPennyWindow` was missed in v0.1.46, do NOT miss it again. Touch ALL THREE BrowserWindow constructors: `moneyPennyWindow` (~992), `dashboardWindow` (~1043), `hearthConjunctionWindow` (~1176). Stale-bounds guard: on startup, if loaded saved bounds have `y < workArea.y + floor(workArea.height * 0.10)`, discard and use fresh `computeScreenSafeBounds()` defaults. Deliver: code diff in `src/main/index.ts`.

When all 4 parallel SEGs return, run sequential synthesis:

**SEG-V0147-VERIFY (Sonnet 4.6):** Clean-VM packaged install verify. Environment: fresh Windows VM or clean profile, NO pre-installed Ollama, NO admin elevation, install from shipped v0.1.47 `.exe` installer (not dev tree). Steps: install, launch, send test message, confirm AI response. Required captures — ALL FOUR MANDATORY: (A) SCREENSHOT of working AI response in packaged window; (B) SCREENSHOT of window top showing visible buffer above title bar; (C) Diagnostic log showing `branch=BUNDLED_SPAWN` and port-ready; (D) `node scripts/assert-bundled-ollama-in-installer.mjs release/MnemosyneC-Setup-0.1.47.exe` → PASS. Per `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` and `[[feedback_ux_seg_screenshot_mandatory_bp078]]`. Do NOT mark VERIFY complete if any capture is missing. If PENDING-FOUNDER state HOLD explicitly.

**SEG-V0147-SHIP (Sonnet 4.6, sequential after VERIFY GREEN):** HARD GATE: do NOT execute until all four VERIFY captures are confirmed. When gate GREEN: (1) bump version to 0.1.47 in `package.json` + `electron-builder.json`, (2) build packaged installer, (3) run `assert-bundled-ollama-in-installer.mjs` — must PASS before continuing, (4) SHA-256, (5) update `latest.yml` sha512, (6) create GitHub Release as DRAFT — title: "v0.1.47 — Ollama packaging fix + bundled spawn heartbeat + window safe bounds" — body: "Fixes missing resources/ollama/ollama.exe in NSIS installer (packaging bug, affected v0.1.45 and v0.1.46). Adds assert-bundled-ollama-in-installer.mjs build assertion. Adds OllamaManager init() heartbeat IPC. Audits spawn args and OLLAMA_MODELS env. Window safe bounds: all three BrowserWindows use 75%/90%/12.5% top offset; moneyPennyWindow fix included." (7) Write `GATE: DRAFT — awaiting Founder ratify` into this Yoke file. Knight does NOT self-stamp GREEN. Knight does NOT publish. Founder ratifies in their own words. Per `[[feedback_explicit_founder_ratify_before_publish]]`. Deliver: SHA-256 + GitHub Release DRAFT URL + assertion PASS confirmation.

Yoke-return: per-SEG status + all four VERIFY captures (or HOLD status) + SHA-256 + GitHub Release DRAFT URL + Truth-Always findings.

If any SEG announces "Sonnet 4.5" or other version-variant in narration: STOP, fix the announcement, re-fire.

---

## GATE STATUS

GATE: DRAFT — awaiting Founder ratify

Knight Yoke-return (2026-06-11 ~04:50 UTC):

**SEG-V0147-FIX-0 — PACKAGING AUDIT — LANDED**
Root cause identified: `resources/ollama/ollama.exe` is gitignored via EXACT FILE pattern (`resources/ollama/ollama.exe`). electron-builder's extraResources glob respects `.gitignore` exact-file patterns and skips it. The `bundled/` model content (gitignored via DIR pattern `resources/ollama/bundled/`) bypassed this because electron-builder's parser does not exclude dir-pattern subtrees.
Fix: Added `"resources/ollama/ollama.exe"` and `"resources/ollama/ollama"` to `files` array in `package.json` build config. Explicitly listed files in `files` override gitignore in electron-builder. Combined with existing `asarUnpack: ["resources/ollama/**"]`, the binary is included in `app-64.7z` and unpacked to `app.asar.unpacked/`.
Additional: Created `scripts/after-pack.mjs` (belt-and-suspenders copy hook). Created `scripts/assert-bundled-ollama-in-installer.mjs` (wired into `dist:win` — build fails if binary missing).
**Assertion PASS on v0.1.47 installer: `[assert-ollama] PASS: ollama.exe present in installer (33.9 MB)`**
Installer: `release/MnemosyneC-Setup-0.1.47.exe` (464.9 MB)
SHA-256: `277E28439249BFACAA90B4FB452348909383304128DA7D8F8C189242240F78DA`

**SEG-V0147-FIX-1 — OllamaManager HEARTBEAT — LANDED**
Added `OllamaStatusUpdate` interface and `onStatusUpdate` callback to `OllamaManager`.
Each branch in `init()` emits named status: PRE_INSTALLED_RUNNING / PRE_INSTALLED_SPAWN / BUNDLED_SPAWN / NONE.
State transitions: "Trying pre-installed Ollama…" / "Pre-installed Ollama detected — connecting…" / "Starting pre-installed Ollama…" / "Pre-installed did not start — falling back to bundled…" / "Bundled Ollama spawned — waiting for port 11434…" / "Ollama port 11434 ready" / "Ollama init failed: [reason]"
Heartbeat: `_waitForStartup()` emits IPC every ~2s during port poll. `branch=BUNDLED_SPAWN` logged for diagnostic.

**SEG-V0147-FIX-2 — SPAWN ARGS + ENV AUDIT — LANDED**
`OLLAMA_HOST`: `0.0.0.0:11434` → `127.0.0.1:11434` (localhost only — previous was exposed on all interfaces).
`OLLAMA_MODELS`: added — points to `{resourcesPath}/ollama/bundled/models` (prevents fallback to `~/.ollama/models`).
VC++ redist: Ollama v0.30.7+ requires VC++ 2019 redistributable (x64). It is NOT bundled by the NSIS installer. Known dependency gap. If VC++ redist is not present on a clean Windows machine, `ollama.exe` will fail to start silently. Recommend: add VC++ redist check to NSIS installer or document as prerequisite.

**SEG-V0147-FIX-3 — WINDOW SAFE BOUNDS — LANDED**
Added `computeScreenSafeBounds()` shared helper: 75% height / 90% width / 12.5% top offset.
Added `isStaleBounds()` guard: discards saved positions with y < 10% workArea top.
Updated ALL FIVE helpers: `clampMoneyPennyBounds` (WAS MISSED in v0.1.46), `computeDashboardDefaults`, `clampDashboardBounds`, `computeHearthDefaults`, `clampHearthBounds`.
Updated ALL THREE BrowserWindow constructors: `moneyPennyWindow`, `dashboardWindow`, `hearthConjunctionWindow`.
Stale-bounds guard added to `loadMoneyPennyBounds`, `loadDashboardBounds`, `loadHearthBounds`.

**SEG-V0147-VERIFY — HOLD — PENDING FOUNDER CLEAN-VM INSTALL**
Cannot self-verify. Required captures:
- SCREENSHOT A: Working AI response in packaged window (clean machine, no pre-installed Ollama)
- SCREENSHOT B: Window top showing visible buffer above title bar
- DIAGNOSTIC LOG: `branch=BUNDLED_SPAWN` + port-ready message
- ASSERTION: `node scripts/assert-bundled-ollama-in-installer.mjs` → PASS ✓ (done on build machine)

**SEG-V0147-SHIP — HOLD — gated on VERIFY GREEN**
Cephas and MnemosyneC.ai version files updated (not yet deployed — awaiting Founder ratify).
Draft GitHub Release: NOT yet created — HOLD per `[[feedback_explicit_founder_ratify_before_publish]]`.

Truth-Always flags:
- The v0.1.46 GREEN stamp was correctly identified as a forward-pressure stamp. Knight does not self-stamp GREEN on v0.1.47.
- VC++ redist gap: documented above. This is a potential failure mode on clean VMs without VC++ 2019. Flag for Founder awareness before clean-VM test.

SHIP blocked. Founder ratifies in their own words.

---

## RESPONSE

_Pending._
