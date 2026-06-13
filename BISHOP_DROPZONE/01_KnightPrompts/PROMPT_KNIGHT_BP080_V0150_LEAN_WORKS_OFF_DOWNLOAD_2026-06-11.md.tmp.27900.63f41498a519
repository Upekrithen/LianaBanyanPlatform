# KNIGHT PROMPT — BP080 · v0.1.50 · LEAN WELCOME IPC FIX
# Written: 2026-06-11 · Bishop SEG · §2 Truth-Always · §3 Sonnet 4.6

---

Knight,

**§3 BINDING: All SEGs Sonnet 4.6 verbatim. No exceptions.**

---

## PROBLEM

Founder clicks the LeanWelcome CTA on a clean Windows machine (fresh install, no Ollama, no MnemosyneC history). Nothing happens. No feedback, no spinner, no error. Silently stuck.

**Manual workaround (PowerShell sku_tier.json write) is NOT acceptable.** Founder cannot tell his wife or any stranger to open a terminal. The downloaded installer must work end-to-end with zero terminal interaction. This is a P0 blocker.

Source audit confirms:
- `LeanWelcomeView.tsx` → CTA calls `window.amplify?.leanInstallStart?.()`
- `preload.ts` line 999 → `leanInstallStart` exposed via `ipcRenderer.invoke('lean-install-start')`
- `src/main/index.ts` line 1775 → `safeHandle('lean-install-start', ...)` registered
- BUT: preload.ts line 10 uses `import { contextBridge, ipcRenderer } from 'electron'` — comment says "require pattern" but actual code is ES `import`. Runtime behavior on packaged builds unconfirmed.

---

## SEG-V0150-P0-DIAGNOSE-BRIDGE (Sonnet 4.6)

**Goal: runtime evidence, not source inference.**

At first paint of LeanWelcomeView (or any view that calls lean-install channels), log to diagnostic file:

```
[BRIDGE-PROBE] typeof window.amplify = <value>
[BRIDGE-PROBE] typeof window.amplify?.leanInstallStart = <value>
[BRIDGE-PROBE] typeof window.amplify?.onLeanInstallStatus = <value>
[BRIDGE-PROBE] preload loaded = <true|false> (check via window.__preloadLoaded sentinel set at preload top)
```

Add `window.__preloadLoaded = true` at the very top of `preload.ts` (before any other code) as a sentinel.

Also: log electron-builder asar config (`asarUnpack` entries) and whether preload.js is bundled inside asar or unpackaged.

Check: does preload.ts `import { contextBridge, ipcRenderer } from 'electron'` compile correctly for sandboxed Electron 31 packaged builds? Per [[canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction]], the canonical fix (v0.1.38, commit e78b0cd) used `require('electron')`. If the current `import` form transpiles differently in the packaged bundle, that's the root cause.

Deliverable: diagnostic log output from a packaged install showing bridge state at runtime.

---

## SEG-V0150-P0-FIX-BRIDGE-OR-FALLBACK (Sonnet 4.6)

**Primary fix:**

1. Audit whether `import { contextBridge, ipcRenderer } from 'electron'` in preload.ts produces a working bridge in packaged Electron 31 builds with `contextIsolation: true`. If not, convert to `const { contextBridge, ipcRenderer } = require('electron')` per the v0.1.38 canonical pattern.

2. Confirm `lean-install-start` and the three push-event channels (`lean-install-status`, `lean-install-progress`, `lean-install-error`) are inside the `contextBridge.exposeInMainWorld('amplify', { ... })` block — not accidentally outside it.

**Immediate UX fix (regardless of root cause):**

In `LeanWelcomeView.tsx`, on CTA click:
- Immediately disable button + show "Starting…" (visible feedback before any IPC round-trip)
- Per [[feedback_every_click_visible_feedback_canon_bp078]]

**5-second fallback (if IPC remains unreachable):**

If `window.amplify?.leanInstallStart` is `undefined` at mount, OR if `leanInstallStart()` does not emit any status event within 5s:
- Show: "Setup is taking longer than expected. [Try again] [Skip — I have Ollama already]"
- "Skip" path: write `sku_tier.json` via a secondary IPC channel (`amplify.writeSkuTier?.()`) that is simpler and tested separately, then advance to main app
- This is the safety net — never leave user silently stuck
- Per [[feedback_every_click_visible_feedback_canon_bp078]]

---

## SEG-V0150-P0-PROACTIVE (Sonnet 4.6)

**Adaptive CTA based on actual machine state (detected at LeanWelcomeView mount, not at click):**

At mount, probe in parallel:
1. `fetch('http://localhost:11434/api/tags')` — is Ollama reachable?
2. If reachable, check response for `gemma4:12b` in model list

CTA states:
- **Ollama reachable + gemma4:12b present** → "Start using MnemosyneC" (nothing to install)
- **Ollama reachable, gemma4:12b absent** → "Download your AI model (2 min)"
- **Ollama not reachable, bundled binary detected** → "Set up your AI engine (2 min)"
- **Ollama absent, no bundled binary** → "Get Ollama first" → opens `https://ollama.com` in browser + shows Resume button

Button text describes what happens on click, not what already happened.
Per [[feedback_off_the_street_test_naming]]: the Off-the-Street test — a stranger must understand the button without reading any other text.

---

## VERIFY

Sequential after all three P0 SEGs complete:

1. Fresh Windows machine — no MnemosyneC, no Ollama, no PowerShell workarounds
2. Download installer → install → launch
3. Click CTA from Screen 1
4. Expected: installer detects/installs Ollama → pulls gemma4:12b → progress visible → advances to main app
5. ZERO terminal interaction
6. Capture: 4 screenshots minimum covering click → progress → AI ready → main app
7. **Founder runs verify on his wife's machine** (Off-the-Street test, ultimate gate)

Runtime evidence required per [[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]. Source-only is NOT sufficient.

---

## SHIP

- Stage DRAFT in `LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\`
- 3 mandatory gates before publish:
  1. Header verify
  2. Content verify
  3. Anonymous download verify (fresh machine confirms installer works)
- Founder ratifies in own words — Knight does NOT self-stamp

---

## HARD BINDINGS

- [[§3 Sonnet 4.6 all SEGs verbatim]]
- [[feedback_actual_runtime_verify_for_runtime_bugs_bp078]] — runtime evidence required
- [[feedback_every_click_visible_feedback_canon_bp078]] — visible feedback on every click
- [[feedback_explicit_founder_ratify_before_publish]] — DRAFT until Founder says publish
- [[feedback_off_the_street_test_naming]] — Off-the-Street test must pass
- [[canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction]] — check import vs require
- Knight does NOT self-stamp (BP080 ratify rule)

---

## YOKE-RETURN PATH

Write yoke-return to:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_KNIGHT_BP080_V0150_LEAN_WORKS_RETURN.md`

Include per-SEG: what was changed, file + line numbers, runtime evidence collected, any open questions for Founder.
