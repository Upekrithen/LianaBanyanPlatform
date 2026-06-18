# YOKE RETURN · Help Tab Pipeline · BP085

Sonnet 4.6

YOKE: KNIGHT_YOKE_HELP_TAB_COPY_PASTE_PIPELINE_BP085
STATUS: COMPLETE (SEGs 1–5 GREEN · SEG-6 PARTIAL — smoke tests require Founder manual run)

---

## 6 SHARPS

| # | SEG | Sharp | Status |
|---|-----|-------|--------|
| 1 | SEG-1 | `HELP_TAB_RECON_BP085.md` written; tab list + Supabase paths confirmed; gate cleared for SEG-2 through SEG-6 | GREEN |
| 2 | SEG-2 | `HelpTab.tsx` written; text + image compose + send + thread display; ErrorBoundary; no horizontal scroll; "Manage update channel →" link wired | GREEN |
| 3 | SEG-3 | `help_messages` migration ran clean (6/6 DDL confirmed); RLS policies confirmed (SELECT + INSERT); `help:send-message` + `help:load-messages` + `help:get-peer-id` + `help:start-realtime-sub` IPC handlers with try/catch; realtime subscription wired via main process → `webContents.send('help:new-message')` | GREEN |
| 4 | SEG-4 | `help_screenshots` bucket creation wired in IPC (`ensureHelpScreenshotsBucket`); `help:upload-screenshot` IPC handler with try/catch; Ctrl+V paste → base64 IPC → Supabase Storage → signed URL stored in draft; error case shows user-visible message | GREEN |
| 5 | SEG-5 | `shell.openExternal` bridge confirmed in preload.ts (line 832, pre-existing); `window.amplify.openExternal()` calls `ipcRenderer.send('open-external', { url })`, handled in index.ts at line 1484; link opens external browser not Electron window | GREEN |
| 6 | SEG-6 | v0.5.1 built (MnemosyneC-Setup-0.5.1.exe · 514.7 MB); Pipeline tab wired in LeanShell (lean mode); Cephas version.json updated; latest.yml updated; mnemosyne-lianabanyan hosting deployed; download page updated — **smoke test Steps 1–4 require Founder manual run** (app must be launched on M0 with Supabase env vars) | PARTIAL |

---

## Implementation Detail

### App Root
`C:\Users\Administrator\Documents\LianaBanyanPlatform\` (workspace root IS the MnemosyneC app)

### Files Created / Modified

| File | Change |
|---|---|
| `src/renderer/components/HelpTab.tsx` | **NEW** — full peer pipeline component: compose + paste + thread + ErrorBoundary + send/load via IPC |
| `supabase/migrations/20260618000000_create_help_messages.sql` | **NEW** — `help_messages` table + 2 indexes + RLS SELECT + INSERT policies |
| `src/main/preload.ts` | **MODIFIED** — added 6 IPC bridge methods + type declarations: `helpGetPeerId`, `helpSendMessage`, `helpLoadMessages`, `helpUploadScreenshot`, `helpStartRealtimeSub`, `onHelpMessageReceived` |
| `src/main/index.ts` | **MODIFIED** — added 5 safeHandle IPC handlers + `getHelpSupabase()` lazy Supabase admin client + `ensureHelpScreenshotsBucket()` + realtime subscription with `webContents.send` push |
| `src/renderer/components/LeanShell.tsx` | **MODIFIED** — imported `HelpTab`; added `'pipeline'` to `LeanTab` type; added `📋 Pipeline` to TABS array; added render case |
| `package.json` | **MODIFIED** — version `0.5.0` → `0.5.1` |
| `Cephas/cephas-hugo/data/version.json` | **MODIFIED** — LATEST → v0.5.1; v0.5.0 → HISTORICAL |
| `Cephas/cephas-hugo/public-mnemosynec/download/latest.yml` | **MODIFIED** — v0.5.1 with sha512 + size |
| `Cephas/cephas-hugo/public-mnemosynec/download/MnemosyneC-Setup-0.5.1.exe` | **NEW** — 514.7 MB installer |
| `Cephas/cephas-hugo/public-mnemosynec/download/MnemosyneC-Setup-0.5.1.exe.blockmap` | **NEW** |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/HELP_TAB_RECON_BP085.md` | **NEW** — SEG-1 recon artifact |

### Tab Placement Decision

The existing `help` tab (LeanHelpTab) remains untouched — it contains the BP082 Community content (Discord/Reddit OAuth, FAQ). The BP085 peer pipeline is added as a new **📋 Pipeline** tab (`'pipeline'` ID) in the Lean mode tab strip. This avoids collision with the existing Help tab content.

### Supabase Architecture (RLS Tradeoff)

Per Founder Note #2 in the Yoke: IPC handlers use the **service-role key** (bypasses RLS; Electron main process is the trust boundary). RLS policies are present on the table for defense-in-depth if client-role is ever used. No `SET app.current_peer` per-connection needed for the current IPC-based architecture.

### Screenshot Upload (Signed URLs)

`help_screenshots` bucket is `public: false`. Images stored as signed URLs with 7-day expiry. The IPC handler:
1. Receives `{ base64Data, mimeType }` from renderer
2. Decodes to `Buffer` in main process (no key exposure to renderer)
3. Uploads via service-role Supabase client
4. Returns 7-day signed URL

**Image rendering in thread** uses `max-width: 100%`, `max-height: 400px`, `object-fit: contain`. Click-to-expand calls `window.amplify.openExternal(url)`.

### Realtime Architecture

`help:start-realtime-sub` IPC → main process creates Supabase channel `help_messages_feed` → subscribes to `postgres_changes` INSERT on `public.help_messages` → forwards to all Electron windows via `BrowserWindow.getAllWindows().forEach(w => w.webContents.send('help:new-message', payload.new))` → preload's `onHelpMessageReceived` listener fires → React state updated.

Error path: if `subscribe()` fails → IPC returns `{ error: string }` → HelpTab sets `error: "Realtime connection failed — messages may be delayed"` in UI.

### Build Verification

- `npm run build`: 414 modules transformed, 0 TypeScript errors ✓
- `npm run dist:win`: `MnemosyneC-Setup-0.5.1.exe` built, Ollama asserted, all pre-flight scripts passed ✓
- Linter: 0 errors on all modified files ✓

### Database Verification (psql SELECT)

```
table_name     | column_name        | data_type
help_messages  | id                 | uuid
help_messages  | from_peer          | text
help_messages  | to_peer            | text
help_messages  | content_text       | text
help_messages  | content_image_url  | text
help_messages  | created_at         | timestamp with time zone

policyname           | cmd
insert_own_messages  | INSERT
read_own_messages    | SELECT
```

---

## SEG-6 Smoke Test Status

| Step | Status | Notes |
|---|---|---|
| Step 1 — Text message loop | PENDING FOUNDER | Requires app launch on M0 with Supabase env vars; code path confirmed clean by build + DB |
| Step 2 — Image paste loop | PENDING FOUNDER | Ctrl+V paste → IPC upload path implemented; requires app launch |
| Step 3 — Realtime | PENDING FOUNDER | Main process subscription wired; requires two windows or two machines |
| Step 4 — Error case | PENDING FOUNDER | Error path implemented in all handlers (no silent swallows) |

**Go/No-Go verdict: GO-conditional** — All code is written, build is clean, migration is confirmed, installer is deployed. Smoke tests require Founder to launch v0.5.1 on M0 and run the pipeline manually.

---

## Post-Deploy Actions for Founder

1. **Close MnemosyneC completely** (per BP083 restart-after-install canon) — do NOT assume auto-update tears down renderer state correctly
2. **Install MnemosyneC-Setup-0.5.1.exe** from `https://mnemosynec.ai/download/` or from `release/MnemosyneC-Setup-0.5.1.exe`
3. **Open MnemosyneC** → navigate to **📋 Pipeline** tab
4. **Type a message** + click Send → confirm it appears in thread with your peer UUID + timestamp
5. **Verify DB** (optional): `psql $SUPABASE_DB_URL -c "SELECT id, from_peer, content_text, created_at FROM help_messages ORDER BY created_at DESC LIMIT 5;"`
6. **Ctrl+V a screenshot** → confirm preview appears → Send → confirm image URL in thread
7. For Son's onboarding: son will use Pipeline tab to send results/questions back to Founder once he installs v0.5.1

---

*Knight · Sonnet 4.6 · BP085 · 2026-06-18*
