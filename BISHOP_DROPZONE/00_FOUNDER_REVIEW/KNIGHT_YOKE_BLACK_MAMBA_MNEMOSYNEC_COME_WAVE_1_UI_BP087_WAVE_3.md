# BLACK MAMBA · YOKE 3 · BP087 WAVE 3
# MNEMOSYNEC COME WAVE 1 UI
# TrialFirePanel + IPC + Preload + Tab Registration

---

## §0 BRICK WALL PRE-AUTHORIZED SCOPE

Brick Wall pre-authorized scope verbatim:
- Create src/main/ipc/thunderclap_fire_ipc.ts (new file)
- Add window.amplify.thunderclap.fireTrial02() to src/main/preload.ts
- Create src/renderer/components/TrialFirePanel.tsx (new file, ~250 lines)
- Add TrialFirePanel tab registration to src/renderer/tabs/MnemosyneTabView.tsx
- Smoke test: clicking "Fire Trial 02" in UI runs gates_check + validate-relay end-to-end

NO scope beyond these 4 files without Founder verbal ratify.
NO modification to validate-relay.mjs or gates_check.mjs.
NO new Supabase tables or columns without Bishop migration per §15.

---

## §1 CONTEXT

The SEG-LL gap analysis identified that Founder has no way to fire Trial 02 from the LB Frame UI. The current path requires dropping to a terminal and running node commands manually. This yoke closes that gap by wiring the mesh test fire into the Electron renderer as a proper UI flow: the Founder clicks "Fire Trial 02" in the MnemosyneC tab, the UI runs gates_check.mjs as a pre-flight, shows a live log stream of validate-relay.mjs stdout, and displays the receipt path and ensemble accuracy when complete.

The architecture follows the existing IPC pattern in the codebase: a new handler in ipc/, a typed bridge in preload.ts, and a React component in the renderer. The tab registration connects the component into the existing MnemosyneTabView routing.

---

## §2 SEG FAN-OUT

use segs Sonnet 4.6 verbatim

**SEG-C1 · IPC handler + child_process.spawn with stdout IPC stream**

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ipc\thunderclap_fire_ipc.ts

This file registers two ipcMain handlers:

Handler 1: `thunderclap:fire-trial-02`

```typescript
ipcMain.handle('thunderclap:fire-trial-02', async (event, options: { flagshipTier: 'claude' | 'gemma' }) => {
  // 1. Spawn gates_check.mjs as child_process
  // 2. Stream gates_check stdout back to renderer via event.sender.send('thunderclap:log', line)
  // 3. If gates_check exits non-zero, send event.sender.send('thunderclap:gates-failed', output) and return { status: 'gates-failed' }
  // 4. Spawn validate-relay.mjs with --mode=full --questions=70 --wire=hex-mcode --plow=mesh-12-blade --andon-escalate=star-chamber --flagship-tier=options.flagshipTier --routing=staggered-then-connected
  // 5. Stream validate-relay stdout back to renderer via event.sender.send('thunderclap:log', line)
  // 6. On validate-relay exit: parse final line for ensemble accuracy, send event.sender.send('thunderclap:complete', { accuracy, receiptPath, exitCode })
  // 7. Return { status: 'complete', accuracy, receiptPath }
})
```

Handler 2: `thunderclap:check-gates`
- Runs gates_check.mjs only, streams stdout, returns { allGreen: boolean, output: string }

Both handlers use `child_process.spawn` (not exec) for streaming. Working directory for spawn: C:\Users\Administrator\Documents\LianaBanyanPlatform

The file must import ipcMain from electron, child_process from node, and path from node. It must export a single `registerThunderclapFireIPC()` function called from main/index.ts (or equivalent main entry point).

SEG-C1 also adds the call to `registerThunderclapFireIPC()` in the main process entry file. Locate the existing pattern (other registerXxxIPC calls) and follow it exactly.

Return: created file path + the line in main entry where registerThunderclapFireIPC() was added.

**SEG-C2 · Preload bridge**

File: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\preload.ts (edit existing)

Add to the existing `window.amplify` contextBridge.exposeInMainWorld block:

```typescript
thunderclap: {
  fireTrial02: (options: { flagshipTier: 'claude' | 'gemma' }) =>
    ipcRenderer.invoke('thunderclap:fire-trial-02', options),
  checkGates: () =>
    ipcRenderer.invoke('thunderclap:check-gates'),
  onLog: (callback: (line: string) => void) =>
    ipcRenderer.on('thunderclap:log', (_event, line) => callback(line)),
  onComplete: (callback: (result: { accuracy: string; receiptPath: string; exitCode: number }) => void) =>
    ipcRenderer.on('thunderclap:complete', (_event, result) => callback(result)),
  onGatesFailed: (callback: (output: string) => void) =>
    ipcRenderer.on('thunderclap:gates-failed', (_event, output) => callback(output)),
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('thunderclap:log');
    ipcRenderer.removeAllListeners('thunderclap:complete');
    ipcRenderer.removeAllListeners('thunderclap:gates-failed');
  }
}
```

Follow the exact indentation and style of the existing amplify object. Do not alter any existing keys.

Return: diff of preload.ts showing added lines only.

**SEG-C3 · TrialFirePanel UI component**

Create: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\TrialFirePanel.tsx

Component requirements:
- React functional component, ~250 lines
- State: status ('idle' | 'checking-gates' | 'firing' | 'complete' | 'failed'), logLines: string[], accuracy: string, receiptPath: string, flagshipTier: 'claude' | 'gemma'
- UI sections in order:
  1. Header: "Trial 02 Mesh Validation" with subtitle "70Q paired Pass A + Pass B"
  2. Flagship tier selector: radio group (claude / gemma), default gemma
  3. "Check Gates" button: calls window.amplify.thunderclap.checkGates(), streams log to log panel, shows GREEN/RED result
  4. "Fire Trial 02" button: disabled until gates GREEN, calls window.amplify.thunderclap.fireTrial02({ flagshipTier }), streams to log panel
  5. Live log panel: scrolling pre/code block, auto-scrolls to bottom on new line, max-height 400px overflow-y scroll
  6. Completion block (shown when status=complete): receipt path as copyable text, ensemble accuracy, a note reading "Receipt minted. Canon eblet queued for Bishop close-out."
  7. Failure block (shown when status=failed): error summary, "Check gates output above" guidance
- useEffect cleanup: call window.amplify.thunderclap.removeAllListeners() on unmount
- TypeScript: typed, no implicit any
- Styling: use existing className patterns from other components in src/renderer/components/. Do not introduce a new CSS framework.

Return: created file path + line count.

**SEG-C4 · Tab registration + smoke test**

File: C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\tabs\MnemosyneTabView.tsx (edit existing)

1. Import TrialFirePanel from '../components/TrialFirePanel'
2. Add tab entry following the existing tab registration pattern: tab id 'trial-fire', label 'Trial 02', renders <TrialFirePanel />
3. Smoke test: run `npm run start` (or equivalent dev command), navigate to the MnemosyneC tab, verify the "Trial 02" sub-tab renders without TypeScript or runtime errors in the console. Capture a screenshot or console-clean confirmation.
4. If the project uses a type-checked build step (`npm run typecheck` or `tsc --noEmit`), run it after edits and confirm zero errors.

Return: diff of MnemosyneTabView.tsx showing added lines + typecheck exit code + smoke test result.

---

## §3 FILE TARGETS

New files:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ipc\thunderclap_fire_ipc.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\TrialFirePanel.tsx

Edited files:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\preload.ts
- C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\tabs\MnemosyneTabView.tsx
- Main process entry file (path to be confirmed by SEG-C1 from existing pattern)

---

## §4 ACCEPTANCE GATES

Gate 1: thunderclap_fire_ipc.ts exists and registerThunderclapFireIPC() is called from main entry (SEG-C1).
Gate 2: preload.ts contains window.amplify.thunderclap with all 6 methods (SEG-C2).
Gate 3: TrialFirePanel.tsx exists, compiles without TypeScript errors (SEG-C3).
Gate 4: MnemosyneTabView.tsx imports and registers the Trial 02 tab (SEG-C4).
Gate 5: tsc --noEmit exits 0 after all edits (SEG-C4).
Gate 6: "Fire Trial 02" button in UI calls ipcMain handler (end-to-end smoke: clicking button triggers process spawn, logs appear in panel) (SEG-C4).

All 6 gates before Yoke 3 declared GREEN.

---

## §5 DRIFT SURFACE PROTOCOL (BP053 INLINE)

If the existing preload.ts does not use a contextBridge.exposeInMainWorld pattern (i.e., uses a different IPC exposure method): HALT. Return the current preload.ts structure to Founder for ratify before adding the thunderclap bridge.

If MnemosyneTabView.tsx uses a different tab registration pattern than import + JSX render: HALT. Return the existing pattern to Founder. Do not guess at the registration mechanism.

If TypeScript errors appear in existing files (not introduced by this yoke): note them in return but do not fix them. Only fix errors in the 4 files this yoke creates or edits.

If `npm run start` smoke test fails at runtime (not compile-time): return the console error verbatim. Do not mask renderer errors.

Drift = surface to Founder. No silent workarounds.

---

## §6 COMPOSITION

Related canon slugs:
- canon_lan_as_wan_test_mode_4_machine_mesh_bp085 (the fire that this UI triggers must use WAN routing)
- canon_persistent_active_memory_crown_jewel_bp085 (LB Frame is the Mnemo interface layer)
- canon_ascending_andon_right_fast_cheap_discipline_bp085 (gates_check is the gadget-first pre-fire gate)
- canon_mic_machine_in_charge_naming_lock_bp086 (MIC broadcast targets the fleet this UI observes)

---

## §7 RETURN TEMPLATE (BP053 §4)

Knight returns one block per SEG:

```
YOKE 3 RETURN · BP087 WAVE 3
SEG-C1: [GREEN|RED] · thunderclap_fire_ipc.ts: [path] · main entry call added at line: ______
SEG-C2: [GREEN|RED] · preload.ts diff: [N lines added] · all 6 methods present: [YES|NO]
SEG-C3: [GREEN|RED] · TrialFirePanel.tsx: [path] · line count: ______
SEG-C4: [GREEN|RED] · tab id registered: trial-fire · tsc exit: ______ · smoke test: ______
YOKE 3 STATUS: [GREEN|AMBER|RED]
AMBER/RED NOTES: ______
```

---

## §8 STATUTES BINDING HEADER

§2 IMMUTABLES: validate-relay.mjs and gates_check.mjs are read-only. The UI invokes them via child_process; it does not alter them.

§3 SONNET 4.6 VERBATIM: use segs Sonnet 4.6 verbatim. All SEG workers run Sonnet 4.6. No model substitution.

§4 ABSOLUTE PATHS: All file operations use absolute paths as listed in §3. No relative paths.

§14 GADGET-FIRST: tsc --noEmit is the compile gate. No "it looks right" assertions. Every gate is machine-verified.

§15 BISHOP-DIRECT-SUPABASE: This yoke contains no Supabase migrations. If a migration need is discovered, Knight ships .sql to BISHOP_DROPZONE and halts. Bishop applies via psql. Knight does not touch Supabase directly.
