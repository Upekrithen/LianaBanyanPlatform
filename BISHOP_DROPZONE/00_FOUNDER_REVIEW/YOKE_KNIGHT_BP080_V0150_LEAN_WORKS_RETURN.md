# YOKE-RETURN — KNIGHT → BISHOP
# BP080 · v0.1.50 · LEAN WELCOME IPC FIX
# 2026-06-11 · Knight (Sonnet 4.6)

---

## STATUS: COMPLETE — AWAITING FOUNDER RATIFY

All three P0 SEGs implemented. Assertion guards green. TypeScript clean (main). DRAFT until Founder ratifies.

---

## SEG-V0150-P0-DIAGNOSE-BRIDGE

### What was changed

**`src/main/preload.ts`** (lines ~10–17):
- Confirmed: `import { contextBridge, ipcRenderer } from 'electron'` IS correct — TypeScript with `"module": "CommonJS"` compiles it to `const electron_1 = require("electron")`, exactly what `assert-preload-sandbox.mjs` requires.
- Added diagnostic comment block explaining why `import` form is canonical.
- Added `__preloadLoaded` sentinel immediately after the import:
  ```typescript
  try { contextBridge.exposeInMainWorld('__preloadLoaded', true); } catch (_e) { /* noop */ }
  ```
  This exposes `window.__preloadLoaded = true` in the renderer, confirming preload executed before the main `amplify` bridge wires up.

**`src/renderer/amplify.d.ts`**:
- Added `__preloadLoaded?: boolean` to the Window interface so TypeScript accepts `window.__preloadLoaded` in renderer code.

**`src/renderer/components/LeanWelcomeView.tsx`**:
- Added bridge probe `useEffect` at mount. Logs to DevTools console:
  ```
  [BRIDGE-PROBE] typeof window.amplify = object
  [BRIDGE-PROBE] typeof window.amplify?.leanInstallStart = function
  [BRIDGE-PROBE] typeof window.amplify?.onLeanInstallStatus = function
  [BRIDGE-PROBE] window.__preloadLoaded = true
  ```
  Founder or developer opens DevTools (Ctrl+Shift+I) to read the probe on a packaged install.

### Audit finding
`lean-install-start`, `lean-install-status`, `lean-install-progress`, `lean-install-error` are ALL inside `contextBridge.exposeInMainWorld('amplify', { ... })` at lines 997–1018 of preload.ts. The bridge plumbing is correct.

**Root cause of the silent-click bug**: The CTA called `leanInstallStart()` and showed feedback ONLY if `installStep` was set via an IPC push event. If the IPC handler threw before emitting any event (e.g., `ollamaManager` slow to init, or a transient error), the renderer received nothing and showed nothing. Fixed by SEG-V0150-P0-FIX-BRIDGE-OR-FALLBACK.

---

## SEG-V0150-P0-FIX-BRIDGE-OR-FALLBACK

### What was changed

**`src/renderer/components/LeanWelcomeView.tsx`**:

1. **Immediate button feedback** (lines ~110–120):
   - CTA button: sets `ctaActive = true` on click immediately — disables button, text changes to "Starting…", opacity drops to 0.75.
   - Per `[[feedback_every_click_visible_feedback_canon_bp078]]`.

2. **5-second fallback timer** (lines ~140–148):
   - On CTA click, starts `setTimeout(() => setShowFallback(true), 5000)`.
   - Timer is cleared when first `onLeanInstallStatus` event fires.
   - If 5s elapses with no event: shows amber fallback bar:
     > "Setup is taking longer than expected. [Try again] [Skip — I have Ollama already]"
   - **[Try again]**: calls `handleCta()` again (re-invokes `leanInstallStart`).
   - **[Skip — I have Ollama already]**: calls `writeSkuTierSkip` IPC → writes `sku_tier.json` → `onComplete()`.

3. **`writeSkuTierSkip` bridge method** added to preload.ts and amplify.d.ts.

**`src/main/index.ts`** (after line 3227):
- New IPC handler `write-sku-tier-skip`:
  ```typescript
  safeHandle('write-sku-tier-skip', async () => {
    writeFileSync(join(app.getPath('userData'), 'sku_tier.json'),
      JSON.stringify({ tier: 'full', model: 'gemma4:12b', source: 'user_skip' }));
    return { ok: true };
  });
  ```
  Simple, tested separately from the full lean-install flow.

### Assertion guards (all passing)
- `assert-preload-source-no-declare-const.mjs` → **OK** (1336 lines scanned)
- `assert-preload-sandbox.mjs` → **OK** (electron bridge via require acquired, 0 __dirname)
- `assert-ipc-handlers.mjs` → **145 passed, 0 failed** (`write-sku-tier-skip` in report)
- `tsc -p tsconfig.main.json --noEmit` → **exit 0**
- `tsc -p tsconfig.renderer.json --noEmit` → no errors in changed files (pre-existing unrelated errors in other files unchanged)

---

## SEG-V0150-P0-PROACTIVE

### What was changed

**`src/renderer/components/LeanWelcomeView.tsx`**:

Ollama probe runs at mount (parallel to event subscription setup):
```typescript
fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) })
```
- **`ready`** (Ollama up + `gemma4:12b` present) → CTA text: **"Start using MnemosyneC"**
  - Clicking writes `sku_tier.json` via `writeSkuTierSkip` and calls `onComplete()` — nothing to install.
- **`has_ollama_no_model`** (Ollama up, no `gemma4:12b`) → CTA text: **"Download your AI model (2 min)"**
  - Clicking calls `leanInstallStart()` (IPC handler pulls the model since Ollama is already running).
- **`no_ollama`** (fetch failed or non-200) → CTA text: **"Set up your AI engine (2 min)"**
  - Clicking calls `leanInstallStart()` (IPC handler attempts bundled Ollama or opens ollama.com).
- **`probing`** (initial state, < 3s) → CTA text: **"Checking your system…"**, button disabled.

Off-the-Street test: a stranger reading only the button text understands what clicking does.
Per `[[feedback_off_the_street_test_naming]]`.

---

## Files Changed

| File | Lines Changed | Description |
|---|---|---|
| `src/main/preload.ts` | +16 | Sentinel, diagnostic comment, `writeSkuTierSkip` bridge, Window type |
| `src/main/index.ts` | +14 | `write-sku-tier-skip` IPC handler |
| `src/renderer/components/LeanWelcomeView.tsx` | Full rewrite (490 → 440 lines) | All three SEGs + bridge probe |
| `src/renderer/amplify.d.ts` | +5 | `writeSkuTierSkip` + `__preloadLoaded` types |

---

## Open Questions for Founder

1. **Runtime verify required** — `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]`. The bridge probe will show in DevTools on a fresh machine. Founder must:
   - Install v0.1.50 on a clean machine (no Ollama pre-installed)
   - Click CTA
   - Expected: button disables immediately + text = "Starting…" (even if IPC has issues)
   - After 5 seconds with no response: fallback bar appears with [Try again] [Skip]
   - Founder's wife machine test is the ultimate gate before publish.

2. **`ready` path not runtime-tested** — The Ollama+gemma4:12b already-present path writes `sku_tier.json` via `writeSkuTierSkip` and jumps directly to main app. This path works on developer machines with Ollama running. No clean-machine test exists for this path.

3. **Version string** — LeanWelcomeView no longer hardcodes "v0.1.49" in the button — the CTA text is now adaptive ("Start using MnemosyneC" / "Download your AI model (2 min)" / "Set up your AI engine (2 min)"). Confirm this is acceptable or if a version number is still desired.

---

## HARD BINDINGS STATUS

| Binding | Status |
|---|---|
| §3 Sonnet 4.6 all SEGs | BOUND |
| `[[feedback_actual_runtime_verify_for_runtime_bugs_bp078]]` | PENDING — awaits Founder runtime verify |
| `[[feedback_every_click_visible_feedback_canon_bp078]]` | SATISFIED — button disables + "Starting…" on click |
| `[[feedback_explicit_founder_ratify_before_publish]]` | PENDING — DRAFT until Founder ratifies |
| `[[feedback_off_the_street_test_naming]]` | SATISFIED — CTA text describes action |
| `[[canon_electron_31_sandboxed_preload_must_use_require_electron_not_declare_const_bp078_bp079_correction]]` | SATISFIED — import form confirmed correct, assert-preload-sandbox passes |
| Knight does NOT self-stamp | HONORED |

---

*Knight (Sonnet 4.6) — BP080 · 2026-06-11 — FOR THE KEEP!*
