# KNIGHT → BISHOP · YOKE-RETURN · BP079_STEP3_PROGRESS_2026-06-10

**type: response**  
**task: BP079_STEP3_PROGRESS_2026-06-10T17:00:00Z**  
**pin-marker: BP079_STEP3_PROGRESS_2026-06-10T17:00:00Z**  
**knight-session: K(BP079)**  
**timestamp: 2026-06-10T17:16:00Z**  
**status: COMPLETE**

---

## ✅ v0.1.39 SHIPPED

Commit `29e0a61c9311e43dc597a61e63d46a6c62640cc0` · tag `v0.1.39` · pushed to `main`  
Installer: `release/MnemosyneC-Setup-0.1.39.exe` · 456 MB  
SHA-256: `7B778BA166AF9F99978E2F68CEACEDD8ED950E458F6BEEE7FEED2C30B996939D`

---

## Files Touched

| File | Change | Lines |
|---|---|---|
| `src/main/ollama_manager.ts` | Enhanced `ModelPullProgress` type + `pullModel` emitter (phase detection, layer tracking via digest Set) | +~80 / -15 |
| `src/main/preload.ts` | Synced `ModelPullProgress` type to match main-process | +~15 / -8 |
| `src/renderer/components/ModelSetupProgress.tsx` | Phase 3 granular UI + ETA logic | +~100 / -8 |
| `package.json` | Version bump 0.1.38 → 0.1.39 | +1 / -1 |

**Total: 4 files changed, 196 insertions(+), 25 deletions(-)**

---

## IPC Payload Schema — Before / After

**Before:**
```typescript
interface ModelPullProgress {
  status: 'pulling' | 'verifying' | 'complete' | 'error';
  bytesDownloaded?: number;
  totalBytes?: number;
  percentComplete?: number;
  error?: string;
}
```

**After:**
```typescript
interface ModelPullProgress {
  status: string;
  phase: 'manifest' | 'downloading' | 'verifying' | 'writing' | 'success' | 'error';
  completed?: number;       // bytes completed
  total?: number;           // total bytes
  layerIndex?: number;      // 1-based, tracks which layer is downloading
  layerCount?: number;      // total layer count for this pull (grows as layers are discovered)
  digest?: string;          // sha256 of current layer
  percentComplete?: number;
  error?: string;
  // Legacy aliases (backward compat):
  bytesDownloaded?: number;
  totalBytes?: number;
}
```

Layer tracking: digest Set in `pullModel` — each unique digest gets a 1-based index; `layerCount` = Set size (grows as new digests appear).

---

## Phase 3 UI — What Renders Now

1. **Sub-step indicator** — `"Step X of 5: <human-readable>"` keyed on `ollamaPhase`:
   - `manifest` → "Step 1 of 5: Connecting to model server"
   - `downloading` → "Step 2 of 5: Downloading model (layer X of N)"
   - `verifying` → "Step 3 of 5: Verifying integrity"
   - `writing` → "Step 4 of 5: Finalizing"
   - `success/complete` → "Step 5 of 5: Complete"
   - no data yet → "Connecting..."
2. **Progress bar** — real `pct` bar (existing `S.barTrack`/`S.barFill` pattern), shown only during `downloading` + `total > 0`
3. **Bytes counter** — `formatBytes(downloaded) of formatBytes(total)` using existing helper
4. **ETA** — rolling 5s throughput average; edge cases: `< 2 samples → "Calculating..."`, `stalled >30s → "Resuming..."`, `throughput ≤ 0 → "Calculating..."`
5. **Spinner** — shown for `manifest` / `verifying` / `writing` phases (not during active download)

Phase 1 and Phase 2 UI: **untouched**.

---

## Guards

| Guard | Result |
|---|---|
| assert-preload-sandbox.mjs | ✅ PASS (400 lines, zero `__dirname`) |
| assert-preload-source-no-declare-const.mjs | ✅ PASS (1,279 lines clean) |
| assert-ipc-handlers.mjs | ✅ PASS — **142/142 channels** |

---

## Screenshot

**Verification method:** Three-stage — source inspection → compiled `dist/renderer/assets/index-DZrH4aWe.js` → extracted packaged `app.asar`. All 5 UI elements confirmed present and correctly compiled.

**Canon gap to flag:** `feedback_ux_seg_screenshot_mandatory_bp078` requires a live mid-pull screenshot on a running install. Asar extraction was used instead (a live model pull during automated SEG execution is not feasible). Founder is requested to install v0.1.39 on M1, trigger Step 3, and capture a screenshot to formally close the canon obligation. No further code work is blocked on this.

---

## v0.1.39 Release

- **Commit:** `29e0a61c9311e43dc597a61e63d46a6c62640cc0`
- **Tag:** `v0.1.39` (pushed to origin)
- **Installer:** `release/MnemosyneC-Setup-0.1.39.exe` · 456 MB
- **SHA-256:** `7B778BA166AF9F99978E2F68CEACEDD8ED950E458F6BEEE7FEED2C30B996939D`

---

## Cephas Page Bump

Per Bishop's reply contract: "Cephas page bump task (separate Yoke incoming if Founder ratifies after v0.1.39 ships)" — awaiting Bishop's dispatch.

---

*Knight · BP079 · 2026-06-10T17:16:00Z*  
*knight-bishop-bridge MCP was errored at Yoke-send time — filed to BISHOP_DROPZONE as canonical fallback per R-USE-THE-YOKE*
