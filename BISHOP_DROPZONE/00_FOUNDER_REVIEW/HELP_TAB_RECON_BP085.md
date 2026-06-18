# HELP_TAB_RECON_BP085.md
**Knight recon artifact — SEG-1 · KNIGHT_YOKE_HELP_TAB_COPY_PASTE_PIPELINE_BP085**
**Date:** 2026-06-18
**Status:** COMPLETE · Gate cleared for SEG-2 through SEG-6

---

## App Root

`C:\Users\Administrator\Documents\LianaBanyanPlatform\` — the MnemosyneC Electron app IS the workspace root (not a subdirectory).

**package.json name:** `mnemosynec` · **version:** `0.5.0`

---

## Key Paths

| Artifact | Path |
|---|---|
| App entry (renderer) | `src/renderer/App.tsx` |
| Tab shell (lean + advanced routing) | `src/renderer/components/LeanShell.tsx` |
| Advanced tab view (16 tabs) | `src/renderer/components/MnemosyneTabView.tsx` |
| Existing Help tab (BP082 — community) | `src/renderer/components/LeanHelpTab.tsx` |
| Help subcomponents | `src/renderer/components/help/` |
| Electron main entry | `src/main/index.ts` |
| Preload (contextBridge) | `src/main/preload.ts` |
| Migrations | `supabase/migrations/` |
| Peer ID source | `src/main/federation/peer-discovery.ts` → `getStablePeerId()` |
| TypeScript types (amplify bridge) | `src/renderer/amplify.d.ts` (interface embedded at bottom of preload.ts) |

---

## Current Tab List in LeanShell

`LeanShell.tsx` has two modes:

### Lean Mode (new users / default)
| ID | Label | Status |
|---|---|---|
| home | Home | Regular |
| gauntlet | Gauntlet | Regular |
| ask | Ask | Regular |
| **help** | **Help** | **Regular** (existing BP082 Help — Community + Discord/Reddit) |
| publish | 🔥 Publish | Regular |
| diagnosis | 🩺 Diagnosis | Regular |

### Advanced Mode
Routes to `MnemosyneTabView` which has 16 tabs (Frame, Helm, Gauntlet, Settings, FAQ, Developer, Atlas, Kitchen Table, Pearls, Substrate, Console, AI, Caithedral Core, LB Account, Battery, Broadcast).

---

## Tab UX Option B Status

**NOT YET** — The current tab bar in LeanShell is a single row with a lean/advanced toggle button (⚙ Advanced). There is NO per-tab pin/hide implemented. Per the Yoke, this is acceptable: Help tab wired into existing lean tab pattern without blocking on a full Option B refactor.

**Action:** New `HelpTab.tsx` (peer pipeline) added as a new tab `'pipeline'` in LeanShell alongside the existing `'help'` tab. Alternatively it can be integrated as a section inside LeanHelpTab. **Decision: add as new tab labeled "Pipeline" in LeanShell lean mode** to avoid colliding with the existing Help tab's community content.

---

## Supabase Config

- **No global Supabase JS SDK client in renderer** — all Supabase calls currently go through main process via IPC
- **Supabase env vars (main process):**
  - `process.env.SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
  - `process.env.SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - `process.env.SUPABASE_SERVICE_ROLE_KEY` — used for admin-level INSERT/SELECT
- `@supabase/supabase-js` is listed in `package.json` dependencies (v^2.107.0) — available for use in main process via `createClient`
- **Architecture decision for help tab:** All Supabase calls (send message, load messages, upload screenshot, realtime subscription) handled in main process. Renderer communicates via IPC. Realtime: main subscribes and forwards to renderer via `webContents.send('help:new-message', ...)` → preload `onHelpMessageReceived` listener.

---

## Peer Identity

- `getStablePeerId()` from `src/main/federation/peer-discovery.ts` — already imported in `index.ts`
- Returns a stable peer UUID for the machine
- This is the `from_peer` field in help_messages
- New IPC handler `help:get-peer-id` returns `getStablePeerId()` to renderer

---

## peer_presence

- **NOT a Supabase DB table** in this codebase — peer presence is handled via LAN discovery (`PeerDiscovery`) and federation WebSocket
- For the Help Tab peer status, we'll show the Supabase realtime connection status (connected/disconnected) rather than a peer mesh presence indicator

---

## openExternal Bridge Status

**ALREADY PRESENT** in preload.ts at line 832:
```typescript
openExternal: (url: string): void => ipcRenderer.send('open-external', { url }),
```
And handled in index.ts at line 1484:
```typescript
ipcMain.on('open-external', (_event, { url }) => { shell.openExternal(url); });
```
SEG-5 is **GREEN** — no additional work needed.

---

## Migration Timestamp

Latest existing migration: `20260611203000_rejection_cooldown.sql`
New migration file: `20260618000000_create_help_messages.sql`

---

## Build Command

```powershell
# Full dist build (installer):
npm run dist:win

# Fast build (no installer, just compiled output):
npm run build
```

Output goes to `release/` (electron-builder), artifact name: `MnemosyneC-Setup-${version}.exe`

---

## Existing Installer in Cephas

```
Cephas/cephas-hugo/public-mnemosynec/download/MnemosyneC-Setup-0.2.1.exe
```
(Note: existing installer shows 0.2.1, not 0.5.0 — check Cephas download data file for latest LATEST pointer)

---

## Blocking Issues

**None.** Gate cleared for SEG-2 through SEG-6.

---

## RLS Tradeoff (per Founder Note #2)

The Yoke's RLS policies use `current_setting('app.current_peer', true)`. MnemosyneC uses service-role key from main process IPC handlers (bypasses RLS entirely). The Electron main process IS the trust boundary — no need to `SET app.current_peer` per connection when using service role. IPC handlers validate sender identity implicitly.

**Decision:** Apply RLS policies as specified in the migration SQL (for completeness and defense-in-depth if client-role ever used), AND use service-role key in IPC handlers for full write access. RLS will apply to any future client-key usage.

---

*Knight recon · Sonnet 4.6 · BP085 · 2026-06-18*
