# SEG-3 Yoke Return — v0.1.57 Renderer TS Cleanup

**Timestamp:** 2026-06-12 22:xx UTC-5  
**Knight session:** BP081 (inline, via Cursor)  
**Yoke MCP status:** Unavailable — fallback to canonical dropzone

---

```
SEG-3 · v0.1.57 · status: GREEN
- Model used: Sonnet 4.6
- Files touched:
    src/renderer/amplify.d.ts
    src/renderer/vite-env.d.ts (new — ambient module decl for *.md?raw)
    src/renderer/components/PhoebePage.tsx
    src/renderer/components/FrameTab.tsx
    src/renderer/hearth/substrate/MakeYourselfComfortableWizard.tsx
- Renderer TS before: 41 errors
- Renderer TS after: 1 error
- Remaining errors:
    LeanAskTab.tsx(215,44) — aiDispatch property missing · SKIPPED per
    SEG-3 rules (SEG-1/2 own LeanAskTab.tsx)
- Main TS: clean (exit 0)
- Runtime verify: N/A — type-only changes
- Drift caught: none
- Recommend immediate-next: SEG-1 should add aiDispatch to amplify.d.ts
  when it wires the LeanAskTab IPC
```

---

## Fix inventory

### `src/renderer/amplify.d.ts`
All fixes are pure type annotation additions — no runtime changes.

1. **ModelPullProgress** — added optional fields: `phase?: string`, `layerIndex?: number`,
   `layerCount?: number`, `completed?: number` (used in ModelSetupProgress.tsx Phase 3 progress UI)

2. **getMeshState** — narrowed `peers: unknown[]` → `peers: Array<{ peerId: string; displayName?: string }>`
   (fixes CaithedralCoreTab.tsx setState call)

3. **PhoebePage IPC** — added `saveIdea?` and `getIdeas?` to amplify interface
   (replaces conflicting local `declare global` in PhoebePage.tsx)

4. **setZoomFactor?**, **getAutoPrepare?**, **onAutoPrepareReady?**, **setAutoPrepare?** —
   added optional methods (used in SettingsTab.tsx zoom + auto-prepare controls)

5. **scribeGetMetrics?**, **scribeToggleMonitor?** — added optional methods with full
   `ScribeMetricSummary`-compatible inline type (used in ActiveSubstratePanel.tsx)

6. **Pantheon IPC** (non-optional, per calling code): `pantheonGetPrefs`, `pantheonCountTablets`,
   `onPantheonProgress`, `pantheonPickFolder`, `pantheonSetPref`, `pantheonRemovePref`,
   `pantheonDispatch`, `pantheonWipe` — all with inline types matching MakeYourselfComfortableWizard usage

7. **kitchenTable?** namespace — `listRecipes`, `createRecipe`, `deleteRecipe`, `openPhotoDialog`
   (used in RecipesView.tsx; callers use `as Recipe` casts so `unknown` returns are correct)

### `src/renderer/vite-env.d.ts` (NEW)
- Ambient `declare module '*.md?raw'` — fixes LocFaqPanel.tsx raw markdown import
- Cannot live in `amplify.d.ts` (that file has exports → is a TS module → ambient decls don't work)

### `src/renderer/components/PhoebePage.tsx`
- Removed conflicting local `declare global { interface Window { amplify?: ... } }` block
- Was causing TS2687 (declarations must have identical modifiers) + TS2717 (type mismatch)
- Properties now live in canonical amplify.d.ts

### `src/renderer/components/FrameTab.tsx`
- Line 117: `resizeObserver?.observe(parent)` → `resizeObserver?.observe(parent!)`
- `parent` is `HTMLElement | null` but observer is only created when `parent` is truthy;
  non-null assertion is correct — pure type fix

### `src/renderer/hearth/substrate/MakeYourselfComfortableWizard.tsx`
- **findLastIndex** (line 409): replaced `prev.findLastIndex?.((e) => ...)` with manual
  reverse-for loop — `findLastIndex` is ES2023; tsconfig targets ES2020 lib
- **miningReceipt ReactNode** (line 619): changed `{miningReceipt && ...}` to
  `{miningReceipt != null && ...}` — `unknown && expr` has type `unknown` (not ReactNode);
  `boolean && ReactNode` = `false | ReactNode` = ReactNode (React accepts false)

---

*Yoke return written to dropzone — bridge MCP unavailable at report time.*
