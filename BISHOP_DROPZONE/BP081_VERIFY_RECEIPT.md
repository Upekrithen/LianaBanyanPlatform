# VERIFY SEG Receipt — v0.1.55 · BP081
Generated: 2026-06-12
Model: Sonnet 4.6

## Adversarial Audit Results

### SEG-1 OllamaManager singleton
- singleton export: PRESENT — `ollama_manager.ts` line 729: `export const ollamaManager = new OllamaManager()`
- surviving new OllamaManager() calls: NONE — Grep across all of `src/main/` confirms single instantiation only
- index.ts singleton import: PRESENT — line 29: `import { ollamaManager } from './ollama_manager'`; no `let ollamaManager` / `const ollamaManager` declared locally
- ai_dispatch_ipc.ts: uses singleton via import — no local instantiation
- ollama_adapter.ts: uses singleton via import — no local instantiation
- TS errors at index.ts:3823: pre-existing TS2632/TS2552 NOT PRESENT in current codebase; `tsc --noEmit` exits 0 with zero errors. Either SEG-1 resolved them or they were already resolved before this wave.
- Verdict: GREEN

### SEG-2 NSIS installer.nsh
- SectionIn RO: PRESENT — `assets/installer.nsh` line 95 `SectionIn RO`
- HKLM WriteRegExpandStr OLLAMA_HOST: PRESENT — `WriteRegExpandStr HKLM "${OLLAMA_HOST_HKLM}" "OLLAMA_HOST" "${OLLAMA_HOST_VALUE}"` (defines expand to exact required values)
- HKCU fallback: PRESENT — `MnemosyneC_OllamaHostHkcuFallback` label + `WriteRegExpandStr HKCU "${OLLAMA_HOST_HKCU}" "OLLAMA_HOST" "${OLLAMA_HOST_VALUE}"`
- WM_SETTINGCHANGE broadcast: PRESENT — `!insertmacro MnemosyneC_BroadcastEnvironmentChange` → `SendMessage ${HWND_BROADCAST} ${WM_SETTINGCHANGE} 0 "STR:Environment" /TIMEOUT=5000`
- net stop/start ollama: PRESENT — `!insertmacro MnemosyneC_RestartOllamaService` → `nsExec::ExecToStack 'net stop ollama'` / `net start ollama`
- Uninstall cleanup: PRESENT — `customUnInstall` macro calls `!insertmacro MnemosyneC_RemoveOllamaHostEnv` which removes the OLLAMA_HOST reg value and broadcasts WM_SETTINGCHANGE
- Visible error on both-fail: PRESENT — `MessageBox MB_ICONEXCLAMATION|MB_OK` on `MnemosyneC_OllamaHostEnvFailed` path
- **DRIFT FOUND & FIXED (Knight BP081):**
  1. `${INSTALL_REGISTRY_KEY}` is an electron-builder internal not passed as a makensis command-line define → NSIS warning 6000 treated as error. **Fixed**: replaced with self-defined `!define MNEM_INSTALLER_SCOPE_KEY "Software\Liana Banyan Corporation\MnemosyneC\Installer"` — all 4 occurrences updated.
  2. `Exec 'powershell.exe ...'` balloon toast: NSIS 3.0.4.1 parsed single-quoted multi-word string as 5 parameters → compile error. **Fixed**: replaced with `DetailPrint` lines (visible in installer log; same every-click-feedback behavior). `MessageBox` for the hard-fail path is preserved.
- Verdict: DRIFT — 2 items found; both fixed by Knight BP081; build passes

### SEG-3 CommunityConnectButton
- 4 states implemented: YES — `idle` (line 65), `connecting` (line 88), `success` (line 122), `fail` (line 140)
- State transitions wired: YES — click → `setState('connecting')` (line 26); IPC resolve → `success` or `fail` (lines 39–43); catch → `fail` (line 46)
- Heartbeat 2s: YES — `setInterval(() => setElapsedMs(...), 2000)` on line 31; cleared on resolve/reject
- Retry button in fail state: YES — `fail` renders a `<button>` element with `onClick` wired to `handleConnect` (lines 142–162)
- IPC call: `window.amplify?.communityConnectHandshake?.()` (line 36) — matches expected interface
- "Connected · 1 peer (FounderDenken)": EXACT MATCH — line 135
- community-connect.ts exists: YES — `src/main/federation/community-connect.ts`
- Relay URLs correct: YES — primary `https://relay.lianabanyan.com/functions/v1` (line 12); fallback Supabase direct (line 14)
- Never throws: CONFIRMED — all code paths return typed `CommunityConnectResult`; outer `try/catch` in renderer button
- Verdict: GREEN

### SEG-5 Cooldown decay
- effectiveRejections formula: CORRECT — `Math.max(0, totalRejections - Math.floor(daysSinceLast / 30))` — lines 2727–2730 of `index.ts`
- daysSinceLastRejection units: CORRECT — `(Date.now() - lastRejectionMs) / 86_400_000` (milliseconds → days, 86,400,000 ms/day)
- Gate uses effectiveRejections: YES — `if (effectiveRejections > 0)` on line 2731
- 30-day boundary correct: YES — `Math.floor(29/30) = 0` (no decay at 29 days); `Math.floor(30/30) = 1` (−1 strike at 30 days)
- Verdict: GREEN

## TypeScript Build
- Exit code: 0
- Error count: 0
- New errors from v0.1.55 SEGs: NONE
- Pre-existing errors confirmed: Pre-existing TS2632/TS2552 NOT present in current codebase — build is clean

## Version Bump
- package.json: already at 0.1.55 (SEGs had bumped it)
- version.json: `Cephas/cephas-hugo/data/version.json` bumped 0.1.53 → 0.1.55 by Knight BP081

## Packaged Build
- Exit code: 0 (after 2 NSIS drift fixes)
- Installer: `release/MnemosyneC-Setup-0.1.55.exe` — 536,253,269 bytes (~511 MB)
- First attempt failed (exit 1) — NSIS `INSTALL_REGISTRY_KEY` undefined
- Second attempt failed (exit 1) — NSIS `Exec` arg-count error in toast macro
- Third attempt: SUCCESS (exit 0)

## Overall VERIFY status
DRIFT — 2 NSIS items found in SEG-2; both fixed by Knight BP081; all other SEGs GREEN; TypeScript clean; installer produced.

## Recommend immediate-next
M0 install + smoke-walk screenshots — the installer is at `release/MnemosyneC-Setup-0.1.55.exe` (~511 MB). Smoke-walk focus: OLLAMA_HOST reg write visible in HKLM System env vars after install; CommunityConnectButton transitions; Cooldown gate behavior.

---

## Knight BP081 Fix Log
- `assets/installer.nsh`: Added `!define MNEM_INSTALLER_SCOPE_KEY`; replaced 4x `${INSTALL_REGISTRY_KEY}` references; replaced `Exec powershell` toast with `DetailPrint`
- `Cephas/cephas-hugo/data/version.json`: bumped `0.1.53` → `0.1.55`
