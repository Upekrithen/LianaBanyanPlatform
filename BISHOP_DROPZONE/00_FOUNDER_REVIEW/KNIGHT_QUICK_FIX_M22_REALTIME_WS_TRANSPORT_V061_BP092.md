# KNIGHT QUICK-FIX DISPATCH — M22 Realtime WS Transport — v0.6.1 — BP092

**Model:** Sonnet 4.6 [SEG]/[MAIN]  
**Authority:** A15 BLOOD · §17 BLOOD  
**MIC Reporting:** per-block-close per canon_mic_reporting_regular_job_easier_than_work_bp092  
**Priority:** HIGH — v0.6.0 ships broken Cooperative Mesh panel (showcase feature for M22)  
**Branch:** `fix/m22-ws-transport-v061` (own scope, own branch)  
**Estimated wall-clock:** 1–2 hrs

---

## ROOT CAUSE (EMPIRICAL)

Electron 31.7.7 bundles Node.js 20.x. Node < 22 has no native global `WebSocket`.  
Supabase JS client (`@supabase/supabase-js ^2.107.0`) initializes a `RealtimeClient` internally on `createClient()`, even when no `.channel()` subscription is opened. That RealtimeClient constructor probes for `WebSocket` at instantiation time and throws the observed error:

> "Node.js 20 detected without native WebSocket support. Suggested solution: For Node.js < 22, install 'ws' package and provide it via the transport option: import ws from 'ws' · new RealtimeClient(url, { transport: ws })"

**Affected call sites — ALL in Electron main process (`src/main/`):**

| File | Line | Call |
|------|------|------|
| `src/main/index.ts` | ~5075 | `createClient(url, key, { auth: { persistSession: false } })` — `_helpSupabase` singleton |
| `src/main/index.ts` | ~5336 | `createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })` — `mesh:get-activity-summary` handler |
| `src/main/mesh-dispatcher.ts` | ~64 | `createClient(url, key, { auth: { persistSession: false } })` — `getSupabaseClient()` factory |

**CoopMeshActivity.tsx** (renderer) does NOT call `createClient` — it uses IPC via `mesh:get-activity-summary`. Error surfaces when that IPC call triggers a main-process `createClient`.

---

## FIX

`ws` is **already present** in `package.json` dependencies at `^8.20.1` and `@types/ws ^8.18.1` in devDependencies. No `npm install` needed.

Pass the `ws` transport in the `realtime` option on every `createClient` call in main-process code.

---

## STEPS

### Block 1 — Patch `src/main/index.ts`

At the top of the file, add (or find existing) import for `ws`:

```typescript
// near top of file, after existing imports
import ws from 'ws';
```

Patch `_helpSupabase` singleton creation (~line 5075):

```typescript
// BEFORE
_helpSupabase = createClient(url, key, { auth: { persistSession: false } });

// AFTER
_helpSupabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});
```

Patch `mesh:get-activity-summary` handler (~line 5336):

```typescript
// BEFORE
const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

// AFTER
const sb = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});
```

### Block 2 — Patch `src/main/mesh-dispatcher.ts`

Add import at top:

```typescript
import ws from 'ws';
```

Patch `getSupabaseClient()` factory (~line 64):

```typescript
// BEFORE
return createClient(url, key, { auth: { persistSession: false } });

// AFTER
return createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});
```

### Block 3 — TypeScript cast note

The `ws` package's `WebSocket` is not type-identical to the DOM `WebSocket`. The `as unknown as typeof WebSocket` cast is correct and required. If TypeScript complains about `ws` import, use:

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ws = require('ws') as typeof import('ws');
```

to match the existing `require()` pattern in `mesh-dispatcher.ts` and `index.ts`.

### Block 4 — Version bump

- `package.json`: `"version": "0.6.0"` → `"version": "0.6.1"`
- `version_trust.json`: update `version` to `"0.6.1"` (canonical Hugo Tower data source per BP090)

### Block 5 — Build + Smoke

```
npm run build
```

Open Settings → Cooperative Mesh Activity panel. Confirm:
- No WebSocket error in the error display
- Panel renders (either peer roster or "No active peers" placeholder)
- No error in Electron DevTools console

### Block 6 — Deploy

```
npm run dist:win
# or publish:win for auto-update push
electron-builder --win --publish always
```

Firebase hosting deploy:

```
firebase deploy --only hosting:mnemosyne
```

**Edge functions touched:** NONE. This fix is entirely in Electron main-process TypeScript. No Supabase edge functions modified. Note explicitly in Knight session log.

### Block 7 — Fleet auto-update

v0.6.1 NSIS installer pushed to `https://mnemosynec.ai/download/latest.yml`. M21 auto-update toggle will deliver to all 5 fleet peers without manual install.

---

## RENDERER PATH NOTE

The renderer (`CoopMeshActivity.tsx`) uses IPC only — no direct Supabase client. No renderer-side fix needed. The Electron renderer's `window.WebSocket` (Chromium built-in) is fine; the problem is exclusively in the main process Node.js environment.

---

## PRIORITY / FIRE TIMING

HIGH. v0.6.0 ships with broken Cooperative Mesh panel — the M22 showcase feature. Error is empirical (Founder install proves it). Likely affects all 5 fleet peers identically.

**Recommended:** fire PARALLEL with M13c + M23. Scope is fully isolated (3 call sites, 2 files, version bump). No shared state with M13c or M23. Own branch `fix/m22-ws-transport-v061`.

Sequential dependency: NONE. Ship v0.6.1 as soon as smoke passes.

---

*Dispatch composed by Bishop SEG · BP092 · 2026-06-22*
