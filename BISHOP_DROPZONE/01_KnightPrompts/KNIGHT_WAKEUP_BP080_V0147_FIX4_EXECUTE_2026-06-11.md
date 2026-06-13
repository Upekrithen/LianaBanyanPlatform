<!-- bishop-yoke-task 2026-06-11T00:00:00Z -->

## BISHOP -> KNIGHT — WAKE-UP — V0147 FIX-4 VC++ BUNDLE — USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP080_V0147_FIX4_VCREDIST_EXECUTE_2026-06-11T00:00:00Z**

> **STATUTE §3 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or any version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

Knight, you did NOT see ADDENDUM 3 during your prior v0.1.47 wave — it was appended to the existing Yoke AFTER you returned. ADDENDUM 3 is a Founder-ratified scope change ("A. Add VCC++" — verbatim Founder instruction, 2026-06-11). You must execute SEG-V0147-FIX-4 before v0.1.47 publishes. Do not ship v0.1.47 without VC++ bundled — a clean Windows machine without VC++ 2019 x64 will silently fail to start `ollama.exe` even with correct packaging.

There is currently **no** `vcredist` directory, **no** `download-vcredist.mjs` script, and **no** VC++ detect code in `installer.nsh` anywhere on disk. FIX-4 is fully unexecuted.

---

### Why ADDENDUM 3 Was Not Seen

Bishop issued ADDENDUM 3 to the existing Yoke at:

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP080_V0147_OLLAMA_RUNTIME_HOTFIX_2026-06-10.md
```

Knight's prior wave had already returned a `## GATE STATUS` block (ADDENDUM 2) at approximately 04:50 UTC 2026-06-11, at which point ADDENDUM 3 had not yet been appended. This is not a Knight error — the Yoke was modified after Knight's wave closed. Per §10 Accuracy > Speed: we do not publish without VC++ to save 2-3 hours. We do it right the first time.

---

### HARD-BINDING BLOCK

| Canon ref | One-liner |
|---|---|
| `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` | Runtime evidence required. Source change alone does NOT verify a runtime fix. |
| `[[feedback_verify_seg_output_before_claiming_inflight]]` | Dispatched ≠ executing ≠ landed. Check output before claiming complete. |
| `[[feedback_ux_seg_screenshot_mandatory_bp078]]` | UX-touching SEGs MUST capture packaged-build screenshot. |
| `[[feedback_every_click_visible_feedback_canon_bp078]]` | Every click gives visible feedback. Silence = broken. |
| `[[feedback_long_running_progress_heartbeat_canon_bp078]]` | Any op >3s shows progress: bar > step-by-step > heartbeat. |
| `[[feedback_knight_yoke_seg_mandatory]]` | "use Sonnet 4.6 SEGs for ALL work" — hard binding. |
| `[[feedback_explicit_founder_ratify_before_publish]]` | Nothing publishes without Founder explicit "publish it / push / send / fire" in own words. |
| `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]` | Forward-pressure ratify ≠ verified ratify. Knight does NOT self-stamp GREEN. |
| Statute §3 | All SEGs Sonnet 4.6. Must say "Sonnet 4.6" verbatim. |
| Statute §10 | Accuracy > Speed. Compounds on bedrock. Do it right the first time. |

---

### Current State (Truth-Always, verified by parallel Bishop SEG 2026-06-11)

| Item | State |
|---|---|
| v0.1.47 installer on disk | `release/MnemosyneC-Setup-0.1.47.exe` (464.9 MB) — exists |
| SHA-256 (current) | `277E28439249BFACAA90B4FB452348909383304128DA7D8F8C189242240F78DA` |
| FIX-0 packaging | LANDED (gitignore override + files array + assert script + after-pack hook) |
| FIX-1 heartbeat IPC | LANDED (branch=PRE_INSTALLED_RUNNING / PRE_INSTALLED_SPAWN / BUNDLED_SPAWN / NONE) |
| FIX-2 spawn args + env | LANDED (OLLAMA_HOST=127.0.0.1:11434 + OLLAMA_MODELS pinned) |
| FIX-3 window 75% | LANDED (computeScreenSafeBounds + isStaleBounds + all 5 helpers + 3 windows) |
| **FIX-4 VC++ bundle** | **NOT EXECUTED — zero artifacts on disk** |
| GitHub release | NOT PUBLISHED — no draft or published release exists for v0.1.47 |
| Cephas/Hugo site | Updated locally — firebase deploy NOT executed (gated on Founder ratify) |
| VERIFY | HOLD — pending clean-VM install with VC++ gate |
| SHIP | HOLD — gated on FIX-4 + VERIFY |

---

### SEG-V0147-FIX-4 (Sonnet 4.6) — VC++ 2019 x64 Redist Bundle

**Read ADDENDUM 3 in full first** (appended at the bottom of the existing Yoke at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP080_V0147_OLLAMA_RUNTIME_HOTFIX_2026-06-10.md`). Execute the following, matching the ADDENDUM 3 spec exactly:

**Step 1 — `scripts/download-vcredist.mjs`**

Create this script:
- Downloads `https://aka.ms/vs/17/release/vc_redist.x64.exe` to `resources/vcredist/vc_redist.x64.exe` (~25 MB).
- File size sanity check: fail loudly if < 20 MB.
- SHA-256 verification against the official Microsoft hash — pin the exact hash so we know what we shipped.
- Wire into the build chain: either append to `prepare:ollama-binary` or add a `prepare:vcredist` script and call it in `predist:win` / `dist:win` / `publish:win` (Knight chooses based on existing `package.json` build conventions — match the pattern used for `prepare:ollama-binary`).

**Step 2 — `package.json` build config**

Add `"resources/vcredist/vc_redist.x64.exe"` to the `build.files` array (same gitignore-override pattern used for `resources/ollama/ollama.exe` in FIX-0). Confirm `asarUnpack` covers the new path if needed.

**Step 3 — `assert-bundled-ollama-in-installer.mjs` extension**

Extend (do NOT rename) `scripts/assert-bundled-ollama-in-installer.mjs` to also assert `vc_redist.x64.exe` is in the NSIS payload. The build must exit 1 if it is missing, the same as for `ollama.exe`. Update the script name or add a new `assert-bundled-vcredist-in-installer.mjs` — Knight decides which is cleaner. Both assertions must pass before the GitHub upload step.

**Step 4 — `installer.nsh` `customInstall` macro**

Add VC++ detection + silent install in the NSIS `customInstall` macro (create `installer.nsh` if it does not exist):

```nsis
; Detect VC++ 2019 x64 redist — required for Ollama v0.30.7+
ReadRegStr $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Installed"
${If} $0 != "1"
  DetailPrint "Installing Microsoft VC++ 2019 x64 Redistributable (required for Ollama)..."
  ExecWait '"$INSTDIR\resources\vcredist\vc_redist.x64.exe" /install /quiet /norestart' $0
  ${If} $0 != 0
  ${AndIf} $0 != 1638
    MessageBox MB_ICONEXCLAMATION "VC++ 2019 x64 install returned code $0. Ollama may not function correctly. See FAQ."
  ${EndIf}
${EndIf}
```

Exit code 1638 = newer version already installed — treat as success. `DetailPrint` makes the step visible in the installer UI per `[[feedback_every_click_visible_feedback_canon_bp078]]`.

**Step 5 — Runtime-detect safety net in `src/main/ollama_manager.ts`**

If `ollama.exe` spawn fails with DLL-missing error pattern (exit code `0xc0000135` / `STATUS_DLL_NOT_FOUND`), emit IPC event with user-visible message: "Ollama failed to start — VC++ 2019 x64 runtime may be missing. Reinstall MnemosyneC or run vc_redist.x64.exe from %LOCALAPPDATA%\Programs\MnemosyneC\resources\vcredist". Belt-and-suspenders if the NSIS step silently no-ops (e.g., per-user install without elevation).

**Step 6 — Rebuild v0.1.47 installer**

Run `npm run dist:win` (or equivalent). The new installer will be approximately 25 MB larger (~490 MB total). Run both assertions:
- `node scripts/assert-bundled-ollama-in-installer.mjs release/MnemosyneC-Setup-0.1.47.exe` → PASS
- VC++ assertion (step 3 above) → PASS

Record new SHA-256 and SHA-512 base64.

**Step 7 — Stage GitHub release DRAFT**

Create GitHub release as **DRAFT** (NOT published):
- Tag: `v0.1.47`
- Title: `v0.1.47 — Ollama packaging fix + VC++ bundle + heartbeat + window safe bounds`
- Release notes body:
  - Fixes missing `resources/ollama/ollama.exe` in NSIS installer (gitignore exact-file exclusion — packaging bug, affected v0.1.45 and v0.1.46).
  - **NEW:** Bundles VC++ 2019 x64 redistributable — NSIS detects and installs silently; eliminates clean-VM `ollama.exe` silent-fail risk.
  - Adds `assert-bundled-ollama-in-installer.mjs` build assertion — binary absence fails the build before upload.
  - Adds OllamaManager `init()` state-transition IPC events and heartbeat (visible progress during Ollama startup; `branch=BUNDLED_SPAWN` in diagnostic log).
  - Corrects `OLLAMA_HOST` from `0.0.0.0:11434` to `127.0.0.1:11434` and pins `OLLAMA_MODELS` to bundled model path.
  - Window safe bounds: all three BrowserWindows now use 75% height / 90% width / 12.5% top offset; `moneyPennyWindow` fix included (was missed in v0.1.46).

**DO NOT publish this release.** Draft stays draft until Founder writes "publish it" / "push" / "fire" in their own words. Per `[[feedback_explicit_founder_ratify_before_publish]]`.

---

### VERIFY gate (clean-VM — ALL FIVE required before SHIP)

Per `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` and `[[feedback_ux_seg_screenshot_mandatory_bp078]]`:

**Environment (non-negotiable):**
- Fresh Windows VM or clean profile.
- NO pre-installed Ollama.
- NO pre-installed VC++ 2019 x64 (uninstall via Add/Remove Programs if testing on an existing machine).
- NO admin elevation during install (standard user) — test the per-user code path.
- Install from the rebuilt v0.1.47 `.exe` installer — NOT from dev tree, NOT from `win-unpacked`.

**Required captures (ALL FIVE — missing any = HOLD):**
1. **ASSERTION PASS:** Both `assert-bundled-ollama-in-installer.mjs` checks pass (ollama.exe + floor model + vc_redist.x64.exe all present in NSIS payload).
2. **INSTALLER SCREENSHOT:** DetailPrint visible showing VC++ install step during NSIS run. Confirm `Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64"` shows Installed=1 post-install.
3. **SCREENSHOT A:** Working AI response visible in the packaged app window (not dev tree — shipped installer).
4. **SCREENSHOT B:** Window top showing visible buffer above the title bar (demonstrates `computeScreenSafeBounds()` FIX-3 is live).
5. **DIAGNOSTIC LOG:** Shows `branch=BUNDLED_SPAWN` and port-ready message — confirms bundled binary was used, not pre-installed Ollama.

Knight does NOT mark VERIFY complete if any capture is missing. State explicitly which are present and which are pending.

---

### Reply contract

Knight Yoke-returns with:

- **SEG-V0147-FIX-4:** `download-vcredist.mjs` path + SHA-256 of downloaded VC++ + `installer.nsh` VC++ block + assertion script update + runtime-detect diff.
- **REBUILD:** New installer SHA-256 + SHA-512 (base64) + file size (expected ~490 MB).
- **ASSERTIONS:** Both PASS confirmations (ollama.exe + vc_redist.x64.exe).
- **GITHUB DRAFT:** Draft release URL (NOT published).
- **VERIFY:** All five captures, or explicit HOLD stating which are pending.
- **Truth-Always flags:** Any findings during SEG execution.

Write Yoke-return to `KNIGHT_BISHOP_MESSAGES.md` (MCP fallback per canon) if the Yoke-write fails.

---

### Statute reminders

- §3: "Sonnet 4.6" verbatim in every SEG announcement AND every `model:` parameter. Not "Sonnet 4.5". Not "the model". Verbatim.
- §10: Accuracy > Speed. This delay is 2-3 hours. Without it a clean-VM user silently breaks. We do not ship known silent-fail risk classes.
- §12: Ask-Knight-First before surfacing any operational question to Founder.
- `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]` — Knight does NOT self-stamp GREEN. Founder ratifies after Founder verifies on Founder's own machine.
- `[[feedback_explicit_founder_ratify_before_publish]]` — DRAFT stays DRAFT until Founder writes "publish it" / "push" / "fire" in their own words.

---

### Paste-ready Founder wake-up

Knight — ADDENDUM 3 was appended to your existing v0.1.47 Yoke after you returned. You did not see it. FIX-4 is unexecuted: no `vcredist` directory, no `download-vcredist.mjs`, no `installer.nsh` VC++ detect code exists on disk. Founder ratified "A. Add VCC++" (2026-06-11) — this is the explicit scope ratify. VC++ 2019 x64 is required for `ollama.exe` to start on a clean Windows machine; shipping without it is a silent-fail P0. Execute SEG-V0147-FIX-4 Sonnet 4.6 per this Yoke: download vc_redist.x64.exe, bundle in NSIS, assert it in the installer payload, add runtime-detect IPC, rebuild installer, stage GitHub DRAFT (do NOT publish — Founder ratifies). All five clean-VM VERIFY captures required before SHIP. Use Sonnet 4.6 SEGs for ALL work.

- Bishop SEG-V0147-FIX4-EXECUTE-WAKEUP — BP080 — pinned 2026-06-11T00:00:00Z

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: you did NOT see ADDENDUM 3 in your prior v0.1.47 wave — it was appended after you returned. Founder ratified FIX-4 VC++ bundle explicitly ("A. Add VCC++"). Dispatch 3 parallel Sonnet 4.6 SEGs RIGHT NOW, then 2 sequential synthesis SEGs. Sonnet 4.6 verbatim in every announcement (Statute §3). Each SEG is self-contained; do NOT re-decompose; fire all 3 in parallel in a single message.

**SEG-V0147-FIX-4-DOWNLOAD (Sonnet 4.6):** Create `scripts/download-vcredist.mjs`. It must: (1) download `https://aka.ms/vs/17/release/vc_redist.x64.exe` to `resources/vcredist/vc_redist.x64.exe`, (2) verify the download is >= 20 MB (fail loudly if smaller), (3) compute SHA-256 and print it (pin the hash — we need to record exactly what we shipped), (4) exit 0 on success, exit 1 on any failure. Wire this script into the build chain in `package.json` — either append to `prepare:ollama-binary` or add `prepare:vcredist` and reference it in `predist:win` / `dist:win` / `publish:win` (match the pattern already used for `prepare:ollama-binary`). Update `package.json` `build.files` array to include `"resources/vcredist/vc_redist.x64.exe"` (same gitignore-override pattern as `resources/ollama/ollama.exe` from FIX-0). Deliver: `scripts/download-vcredist.mjs` + `package.json` diff + SHA-256 of downloaded file.

**SEG-V0147-FIX-4-NSIS (Sonnet 4.6):** Update `installer.nsh` `customInstall` macro (create file if absent). Add VC++ detection + silent install block: `ReadRegStr $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Installed"` → if $0 != "1" → `DetailPrint "Installing Microsoft VC++ 2019 x64 Redistributable (required for Ollama)..."` → `ExecWait '"$INSTDIR\resources\vcredist\vc_redist.x64.exe" /install /quiet /norestart' $0` → if $0 != 0 AND $0 != 1638 → `MessageBox MB_ICONEXCLAMATION "VC++ 2019 x64 install returned code $0. Ollama may not function correctly. See FAQ."`. Exit code 1638 = newer version already installed, treat as success. The `DetailPrint` makes the step visible to the user. Also update `src/main/ollama_manager.ts`: if `ollama.exe` spawn fails with DLL-missing error pattern (exit code 0xc0000135 / STATUS_DLL_NOT_FOUND), emit IPC event `ollama-status-update` with message: "Ollama failed to start — VC++ 2019 x64 runtime may be missing. Reinstall MnemosyneC or run vc_redist.x64.exe from %LOCALAPPDATA%\Programs\MnemosyneC\resources\vcredist". Deliver: `installer.nsh` diff + `ollama_manager.ts` diff.

**SEG-V0147-FIX-4-ASSERT (Sonnet 4.6):** Extend `scripts/assert-bundled-ollama-in-installer.mjs` (do NOT rename it) to also assert `vc_redist.x64.exe` is present in the NSIS payload. Use the same `7z l` inspection pattern already in the script. Script must: (1) PASS on ollama.exe, (2) PASS on floor model blob, (3) PASS on vc_redist.x64.exe — all three checks required; any single FAIL exits 1 with a clear error. If a separate `assert-bundled-vcredist-in-installer.mjs` is cleaner, create that and wire BOTH into `dist:win` and `publish:win`. Both assertions must pass before the GitHub upload step. Deliver: updated assertion script(s) + example PASS output for all three checks.

When all 3 parallel SEGs return:

**SEG-V0147-REBUILD (Sonnet 4.6, sequential after all 3 FIX-4 SEGs land):** Run `npm run dist:win` (or equivalent) to rebuild v0.1.47 installer with VC++ bundled. Expected size ~490 MB (+25 MB vs current 464.9 MB). Run both assertion scripts on the rebuilt installer — both must PASS. Record new SHA-256 and SHA-512 base64. Create GitHub Release as DRAFT (NOT published): tag `v0.1.47`, title "v0.1.47 — Ollama packaging fix + VC++ bundle + heartbeat + window safe bounds", notes body covering: gitignore packaging fix, VC++ 2019 x64 bundle (silent NSIS install), assert script, OllamaManager heartbeat IPC (branch=BUNDLED_SPAWN), OLLAMA_HOST localhost-only fix, OLLAMA_MODELS pinned, window safe bounds all 3 BrowserWindows. Write `GATE: DRAFT — awaiting Founder clean-VM verify + explicit ratify` into the Yoke file. Knight does NOT self-stamp GREEN. Knight does NOT publish. Per `[[feedback_explicit_founder_ratify_before_publish]]` and `[[feedback_forward_pressure_ratify_is_not_verified_ratify_bp080]]`. Deliver: new SHA-256 + SHA-512 + GitHub Draft URL + both assertion PASS confirmations.

**SEG-V0147-VERIFY (Sonnet 4.6, sequential after REBUILD):** Clean-VM packaged install verify. Environment: fresh Windows VM, NO pre-installed Ollama, NO pre-installed VC++ 2019 x64, NO admin elevation, install from rebuilt v0.1.47 `.exe` installer (not dev tree, not win-unpacked). Required captures — ALL FIVE MANDATORY — missing any = HOLD: (1) Both assertion PASS outputs (ollama.exe + floor model + vc_redist.x64.exe in payload); (2) INSTALLER SCREENSHOT showing DetailPrint VC++ step + `Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64"` showing Installed=1; (3) SCREENSHOT A — working AI response in packaged window; (4) SCREENSHOT B — window top showing visible buffer above title bar; (5) DIAGNOSTIC LOG — `branch=BUNDLED_SPAWN` + port-ready. Per `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` and `[[feedback_ux_seg_screenshot_mandatory_bp078]]`. Do NOT mark VERIFY complete if any capture is missing. State explicitly which are present and which are pending. If PENDING-FOUNDER, state HOLD explicitly.

Yoke-return: per-SEG status + both ASSERT PASS outputs + new SHA-256 + GitHub Draft URL + all five VERIFY captures (or explicit HOLD) + Truth-Always findings. Write to `KNIGHT_BISHOP_MESSAGES.md` if Yoke file write fails (MCP fallback per canon).

If any SEG announces "Sonnet 4.5" or other version-variant: STOP, fix the announcement, re-fire.

---

*Bishop SEG — BP080 — 2026-06-11T00:00:00Z — FIX-4 execute wake-up. ADDENDUM 3 in existing Yoke is the source spec. This file is the dispatch artifact.*
