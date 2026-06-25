# KNIGHT YOKE · Help Tab · Copy/Paste Pipeline · BP085

**Issued by:** Bishop SEG (Sonnet 4.6)
**Date:** 2026-06-17
**BP:** BP085
**Status:** PASTE-READY — Founder Review

---

## PREAMBLE (VERBATIM — LOAD-BEARING · DO NOT SKIP)

> Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## SCOPE

**Add a Help Tab to MnemosyneC v0.5.x — copy/paste IO + screenshot paste support + Founder↔son shared pipeline.**

Founder pastes text and screenshots into MnemosyneC Help Tab; son pastes results back; Founder reads them and pastes guidance back to son. Identical to how Founder pastes into chat today — but routed peer-to-peer through Supabase peer_presence + a new `help_messages` table so both parties are on the same machine-to-machine thread without any external app.

**Composes with:**
- [[canon-mnemosynec-self-context-memory-md-six-folder-substrate-layout-bp083]] — Help tab messages are substrate-aware context, not ephemeral chat
- [[feedback-mnemosynec-reset-reseed-location-test-it-out-bp083]] — Help tab is NOT on the Test It Out tab; it is its own top-level tab per BP083 Tab UX Option B (single row + Regular/Advanced toggle + per-tab pin/hide)
- BP083 Tab UX Option B — single row of tabs; Help tab appears in Regular mode (not Advanced-only); pinnable

---

## TRUTH-ALWAYS STANDING ORDER (BP084 wan-relay lesson)

Every IPC step, every Supabase call, every file write MUST use try/catch. No silent swallows. No bare `catch {}` blocks. Error class logged explicitly. If a step fails, the UI shows the user a plain-English message — NOT a stack trace, NOT a silent spinner. This applies to:
- React component fetch calls (useEffect data loads)
- Supabase storage uploads (screenshot blob → bucket)
- IPC handlers in Electron main process
- Database migration runner

---

## SEG-1 · Recon MnemosyneC v0.5.0 UI Tab Structure

**Spawn:** Sonnet 4.6 SEG
**Task:** Establish ground truth of current tab layout before writing any new component code.

**Steps:**

1. Locate the MnemosyneC app source. Check:
   - `C:\Users\Administrator\Documents\LianaBanyanPlatform\` — look for `mnemosynec*`, `src\`, `renderer\`, `app\` directories
   - Common Electron paths: `src/renderer/`, `src/components/`, `src/pages/`
   - Run: `Get-ChildItem "C:\Users\Administrator\Documents\LianaBanyanPlatform\" -Recurse -Filter "*.tsx" | Where-Object { $_.Name -match "Tab|tab|Nav|nav" } | Select-Object -First 30 FullName`

2. Read the root App component (likely `App.tsx` or `MainLayout.tsx`) — extract current tab list, tab order, and how Regular/Advanced toggle is wired.

3. Confirm: Is Tab UX Option B already implemented (single row + Regular/Advanced toggle + per-tab pin/hide)? If not, note what IS implemented — Knight must NOT block Help tab ship on a full Option B refactor; stub the Help tab in existing tab pattern and open a follow-up yoke for Option B.

4. Locate Supabase client initialization file (likely `supabaseClient.ts` or `supabase.ts`). Note the realtime/peer_presence channel pattern already in use — Help tab will use the same pattern.

5. Locate `peer_presence` table or realtime channel usage (for SEG-3 wire-up reference). Note: if peer_presence is a Supabase Presence channel (not a DB table), confirm the channel name and payload schema.

6. Write findings to disk: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\HELP_TAB_RECON_BP085.md`
   - Absolute path to App/MainLayout component
   - Current tab list (names + Regular vs Advanced assignment)
   - Tab UX Option B status: IMPLEMENTED / PARTIAL / NOT YET
   - Supabase client file path
   - peer_presence channel name and payload schema
   - Any blocking issues found

**SEG-1 Sharp return:**
- [ ] `HELP_TAB_RECON_BP085.md` written to disk at path above
- [ ] Tab list enumerated — no guessing
- [ ] Supabase client path confirmed
- [ ] SEG-1 is a GATE — do NOT spawn SEG-2 through SEG-6 until this file exists and Knight has read it

---

## SEG-2 · Build Help Tab React Component

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-1 recon complete

**Task:** Build `HelpTab.tsx` — the full Help Tab React component with input area (text + paste-image support) and output area.

**File destination:** determined by SEG-1 recon (likely `src/renderer/components/HelpTab.tsx` or `src/pages/HelpTab.tsx`). Knight fills in exact path after recon.

**Component spec:**

### Layout (top to bottom, flex column, NEVER SCROLL SIDEWAYS — BP081 canon)

```
┌─────────────────────────────────────────────────────┐
│  HELP                          [Peer: Connected ●]  │
├─────────────────────────────────────────────────────┤
│  ┌─── Message Thread ──────────────────────────┐    │
│  │  [Founder message · 14:32]                   │    │
│  │  [text + optional image thumbnail]           │    │
│  │                                              │    │
│  │  [Son reply · 14:35]                         │    │
│  │  [text only]                                 │    │
│  └──────────────────────────────────────────────┘    │
│                                                     │
│  ┌─── Compose ─────────────────────────────────┐    │
│  │  [text input — multiline · auto-expand]      │    │
│  │  [paste image here or Ctrl+V]                │    │
│  │  [attached image preview if image pasted]    │    │
│  └──────────────────────────────────────────────┘    │
│                                                     │
│  [Send →]   [Clear]   [Manage update channel →]     │
└─────────────────────────────────────────────────────┘
```

### State

```typescript
interface HelpMessage {
  id: string;
  from_peer: string;       // peer UUID from peer_presence
  to_peer: string | null;  // null = broadcast to all connected peers
  content_text: string;
  content_image_url: string | null;
  created_at: string;
}

interface HelpTabState {
  messages: HelpMessage[];
  draftText: string;
  draftImageUrl: string | null;
  peerStatus: 'connected' | 'disconnected' | 'connecting';
  error: string | null;
}
```

### Image paste handling (Ctrl+V)

```typescript
// In the compose textarea onPaste handler:
const handlePaste = async (e: React.ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const blob = item.getAsFile();
      if (!blob) return;
      // SEG-4 handles the upload — call uploadHelpScreenshot(blob)
      // then setDraftImageUrl(url)
    }
  }
};
```

### "Share with peer" routing

- On Send: call `sendHelpMessage({ text: draftText, imageUrl: draftImageUrl })` — this is the IPC bridge that SEG-3 wires
- Clear draft text and image preview on success
- On error: setError("Could not send message — check connection") — do NOT swallow silently

### "Manage update channel →" link

Small text link at bottom of compose area — exact text: `Manage update channel →` — href: `https://mnemosynec.ai/download#channel` — opens in default browser via `shell.openExternal()` in Electron. This is per BP085 Founder direct: "don't rebuild update channel UI in the app, link to /download".

### Error boundary

Wrap the entire component in an ErrorBoundary component. If HelpTab throws an unhandled render error, show: "Help tab encountered an error. [Reload tab]" — do NOT crash the whole app.

**SEG-2 Sharp return:**
- [ ] `HelpTab.tsx` written to disk at confirmed path
- [ ] Input area: multiline text + onPaste image handler wired
- [ ] Output area: message list renders with from_peer label + timestamp
- [ ] Peer status indicator in header
- [ ] "Manage update channel →" link present, opens external browser
- [ ] ErrorBoundary wrapping component
- [ ] No horizontal scroll at 320px viewport (check with responsive dev tools)
- [ ] No `overflow-x: scroll` or `overflow-x: auto` on any element (NEVER SCROLL SIDEWAYS canon BP081)

---

## SEG-3 · Wire Copy/Paste IO via Supabase peer_presence + help_messages Table

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-1 recon, SEG-2 component

**Task:** Two deliverables — (A) Supabase migration for `help_messages` table, (B) IPC bridge wiring HelpTab to Supabase.

### Deliverable A — Database Migration

**Migration file destination:** locate existing migrations directory from SEG-1 recon (likely `supabase/migrations/` or `platform/supabase/migrations/`). Create new file: `[TIMESTAMP]_create_help_messages.sql`

**Migration SQL:**

```sql
-- help_messages: peer-to-peer copy/paste pipeline
-- BP085 Help Tab — Founder↔Son shared message thread

CREATE TABLE IF NOT EXISTS public.help_messages (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    from_peer    TEXT        NOT NULL,           -- peer UUID or member ID
    to_peer      TEXT,                           -- NULL = broadcast to all connected peers
    content_text TEXT        NOT NULL DEFAULT '', -- may be empty if image-only message
    content_image_url TEXT,                      -- NULL if text-only message
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast thread query by peer pair
CREATE INDEX IF NOT EXISTS idx_help_messages_from_peer ON public.help_messages (from_peer, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_messages_to_peer   ON public.help_messages (to_peer,   created_at DESC);

-- Row-level security: peers can only read messages addressed to them or broadcast
ALTER TABLE public.help_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_messages" ON public.help_messages
    FOR SELECT USING (
        from_peer = current_setting('app.current_peer', true)
        OR to_peer  = current_setting('app.current_peer', true)
        OR to_peer  IS NULL
    );

CREATE POLICY "insert_own_messages" ON public.help_messages
    FOR INSERT WITH CHECK (
        from_peer = current_setting('app.current_peer', true)
    );
```

**Run migration via canonical safe subshell pattern (BP084 psql canon):**

```powershell
# Load SUPABASE_DB_URL from secrets env without exposing contents
# Per BP084 HARD BINDING: NEVER echo/show/pipe credential values
$envFile = "C:\Users\Administrator\.claude\state\secrets\22May2026.env"
& powershell -Command {
    $url = (Get-Content $using:envFile | Where-Object { $_ -match '^SUPABASE_DB_URL=' }) -replace '^SUPABASE_DB_URL=',''
    & psql $url -f "[MIGRATION_FILE_PATH]"
}
```

Confirm: migration returns `CREATE TABLE` + `CREATE INDEX` + `ALTER TABLE` + two `CREATE POLICY` lines. If any line is missing, do NOT proceed — log error and surface to Knight.

### Deliverable B — IPC Bridge

**Location:** Electron main process IPC handlers file (from SEG-1 recon — likely `src/main/ipc.ts` or `src/main/handlers.ts`).

**Add two IPC handlers:**

```typescript
// ipcMain.handle('help:send-message', ...)
// Receives: { text: string, imageUrl: string | null, fromPeer: string, toPeer: string | null }
// Action: INSERT into help_messages via Supabase admin client
// Returns: { success: true, id: string } | { success: false, error: string }

// ipcMain.handle('help:load-messages', ...)
// Receives: { peerA: string, peerB: string | null, limit: number }
// Action: SELECT from help_messages WHERE (from_peer IN (peerA, peerB) OR to_peer IS NULL) ORDER BY created_at ASC LIMIT limit
// Returns: HelpMessage[] | { error: string }
```

**Realtime subscription (renderer side, in HelpTab.tsx useEffect):**

```typescript
// Subscribe to Supabase realtime on help_messages table
// Filter: to_peer = myPeerId OR to_peer IS NULL
// On INSERT event: prepend new message to messages state
// try/catch around subscribe — on error: setError("Realtime connection failed — messages may be delayed")
```

**Truth-Always constraint:** Every IPC call in renderer wraps in try/catch. Every IPC handler in main process wraps in try/catch. No silent swallows. Error propagated to UI as `{ success: false, error: string }`.

**SEG-3 Sharp return:**
- [ ] Migration file written at correct path
- [ ] Migration ran successfully — all 5 DDL statements confirmed
- [ ] RLS policies confirmed present (SELECT + INSERT)
- [ ] `help:send-message` IPC handler implemented with try/catch
- [ ] `help:load-messages` IPC handler implemented with try/catch
- [ ] Realtime subscription in HelpTab.tsx with error handler
- [ ] No silent error swallows anywhere in the chain

---

## SEG-4 · Screenshot Paste Support — Ctrl+V → Supabase Storage

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-2 component (paste handler stub), SEG-3 migration (storage bucket needed)

**Task:** Complete the screenshot paste pipeline — blob captured in SEG-2 paste handler → upload to Supabase storage bucket `help_screenshots` → URL stored in `content_image_url` field.

### Create storage bucket (if not exists)

Using Supabase Dashboard OR via management API call from Knight:

```typescript
// Via Supabase admin client (service role key from vault — never exposed):
const { data, error } = await supabase.storage.createBucket('help_screenshots', {
    public: false,   // authenticated access only — images are peer-private
    fileSizeLimit: 10 * 1024 * 1024,  // 10MB max per screenshot
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
});
```

If bucket already exists, catch the "already exists" error silently — all other errors propagate.

### Upload function

```typescript
// Called from HelpTab.tsx after paste event detected image blob
// Returns: { url: string } | { error: string }
async function uploadHelpScreenshot(blob: File): Promise<{ url: string } | { error: string }> {
    try {
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${blob.type.split('/')[1]}`;
        const path = `${currentPeerId}/${filename}`;

        const { error: uploadError } = await supabase.storage
            .from('help_screenshots')
            .upload(path, blob, { contentType: blob.type, upsert: false });

        if (uploadError) return { error: uploadError.message };

        const { data } = supabase.storage.from('help_screenshots').getPublicUrl(path);
        return { url: data.publicUrl };
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Upload failed' };
    }
}
```

### Render in message thread

In HelpTab message list: if `content_image_url` is present, render `<img>` with:
- `max-width: 100%` (never overflow container)
- `max-height: 400px` (keep thread readable)
- `object-fit: contain`
- `alt="Help screenshot"` (accessibility)
- Click-to-expand: clicking image opens it full-size in a modal overlay (or via `shell.openExternal(url)` as fallback)

**SEG-4 Sharp return:**
- [ ] `help_screenshots` bucket created (or confirmed existing) in Supabase storage
- [ ] `uploadHelpScreenshot()` function implemented with try/catch — no silent failures
- [ ] Ctrl+V paste of image → preview appears in compose area before Send
- [ ] On Send with image: URL stored in `content_image_url` field of help_messages record
- [ ] Image renders in message thread at `max-width: 100%` — no horizontal overflow
- [ ] Error case: upload fails → UI shows "Could not upload screenshot — [reason]" — does NOT send message with null image silently

---

## SEG-5 · Add "Manage update channel →" Link

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-2 component (link is already stubbed — SEG-5 verifies and wires `shell.openExternal`)

**Task:** Confirm the "Manage update channel →" link is correctly wired. This is intentionally a LINK, not a rebuild of update channel UI in-app (per BP085 Founder direct: "don't rebuild, link to /download").

**Steps:**

1. Confirm `shell.openExternal` is available in renderer context. In Electron with contextIsolation enabled, `shell` from `electron` is NOT directly importable in renderer — must be exposed via preload script.

2. Check preload script (from SEG-1 recon path). If `shell.openExternal` is NOT already exposed via `contextBridge`, add it:

```typescript
// In preload.ts:
contextBridge.exposeInMainWorld('electron', {
    // ... existing exposed methods ...
    openExternal: (url: string) => shell.openExternal(url),
});
```

3. In `HelpTab.tsx`, the link renders as:

```tsx
<button
    className="help-tab__update-channel-link"
    onClick={() => {
        try {
            window.electron?.openExternal('https://mnemosynec.ai/download#channel');
        } catch (err) {
            console.error('openExternal failed:', err);
        }
    }}
>
    Manage update channel →
</button>
```

Styled as a text link (no button chrome) — small font, secondary color, no border, no background. Renders below compose area on the right side.

4. Verify: clicking the link opens `https://mnemosynec.ai/download#channel` in the system default browser, NOT inside the Electron window.

**SEG-5 Sharp return:**
- [ ] `shell.openExternal` confirmed available in renderer (preload bridge present)
- [ ] "Manage update channel →" link opens `https://mnemosynec.ai/download#channel` in external browser
- [ ] Link does NOT navigate the Electron window
- [ ] Link styled as small text (not a full button) — does not dominate compose area visually

---

## SEG-6 · Smoke Test on M0 + Ship v0.5.1 Patch + Verify Founder→Founder Loop

**Spawn:** Sonnet 4.6 SEG
**Depends on:** SEG-2 through SEG-5 all complete

**Task:** End-to-end smoke test of the Help Tab before any testing with son's machine.

### Pre-smoke checklist (Knight verifies before dispatching)
- [ ] HelpTab.tsx imported and rendered in tab bar (appears in Regular tab row)
- [ ] `help_messages` table exists in Supabase with correct schema
- [ ] `help_screenshots` bucket exists in Supabase storage
- [ ] Migration ran clean — all DDL confirmed
- [ ] `help:send-message` and `help:load-messages` IPC handlers registered in main process

### Smoke test procedure (M0 = Founder's machine — self-loop test)

**Step 1 — Text message loop (same machine, same peer ID):**
1. Open MnemosyneC on M0
2. Navigate to Help tab
3. Type "Smoke test message 1 — text only" in compose area
4. Click Send
5. Confirm: message appears in thread with from_peer = M0 peer UUID + timestamp
6. Confirm: `help_messages` table in Supabase contains the record (verify via psql SELECT)

**Step 2 — Image paste loop:**
1. Take a screenshot (Win+Shift+S or Print Screen)
2. Click in compose area, Ctrl+V
3. Confirm: image preview appears in compose area
4. Click Send
5. Confirm: message appears in thread with image thumbnail visible
6. Confirm: `help_messages` record has `content_image_url` NOT NULL
7. Confirm: image URL is a valid Supabase storage URL, returns HTTP 200 when fetched

**Step 3 — Realtime subscription (two Electron windows on M0):**
1. Open a second MnemosyneC window (or second instance if possible)
2. Send a message from Window 1
3. Confirm message appears in Window 2 Help tab within 2 seconds WITHOUT refresh
4. If two-window test not feasible: document limitation, mark as PARTIAL, note that son's machine test in v0.5.1 will serve as realtime verification

**Step 4 — Error case:**
1. Temporarily break network (disable WiFi or block Supabase domain via hosts file)
2. Attempt to Send a message
3. Confirm: UI shows "Could not send message — check connection" (or equivalent — NOT a silent failure, NOT a crash)
4. Re-enable network, confirm messages resume

### Version bump → v0.5.1

After smoke test passes Steps 1 and 2 (Step 3 PARTIAL accepted):
1. Bump version to `0.5.1` in `package.json` (and `package-lock.json`, electron-builder config, or wherever version is sourced)
2. Build installer: `npm run build` or `electron-builder` (exact command from SEG-1 recon)
3. Copy built installer to `C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.5.1.exe`
4. Update Cephas Hugo download data file: add v0.5.1 entry as 🟡 LATEST (v0.5.0 demotes to 🔵 HISTORICAL)
5. Deploy to Firebase: `firebase deploy --only hosting`
6. Confirm: `https://mnemosynec.ai/download/` shows v0.5.1 as LATEST

### Go/No-Go

- **GO:** Steps 1 + 2 GREEN, Step 3 PARTIAL acceptable, Step 4 error case confirmed
- **NO-GO:** Step 1 or Step 2 fails (core pipeline broken) — log blocker, surface to Founder before son test

**SEG-6 Sharp return:**
- [ ] Smoke test Step 1 (text message loop): GREEN / RED
- [ ] Smoke test Step 2 (image paste loop): GREEN / RED
- [ ] Smoke test Step 3 (realtime): GREEN / PARTIAL / RED — reason noted
- [ ] Smoke test Step 4 (error case): GREEN / RED
- [ ] v0.5.1 version bump completed
- [ ] v0.5.1 installer built and copied to release directory
- [ ] Cephas Hugo download data updated: v0.5.1 = LATEST, v0.5.0 = HISTORICAL
- [ ] Firebase deployed — `https://mnemosynec.ai/download/` confirmed serving v0.5.1
- [ ] **Go/No-Go verdict: GO or NO-GO with blocker description**

---

## 6 SHARPS RETURN TABLE

Knight returns this table completed before closing the yoke. All 6 must be GREEN (or documented PARTIAL with Founder gate) for yoke to be ratified.

| # | SEG | Sharp | Status |
|---|-----|-------|--------|
| 1 | SEG-1 | `HELP_TAB_RECON_BP085.md` written; tab list + Supabase paths confirmed; gate cleared for SEG-2 through SEG-6 | ⬜ PENDING |
| 2 | SEG-2 | `HelpTab.tsx` written; text + image compose + send + thread display; ErrorBoundary; no horizontal scroll; "Manage update channel →" link stubbed | ⬜ PENDING |
| 3 | SEG-3 | `help_messages` migration ran clean; RLS policies confirmed; `help:send-message` + `help:load-messages` IPC handlers with try/catch; realtime subscription wired | ⬜ PENDING |
| 4 | SEG-4 | `help_screenshots` bucket exists; `uploadHelpScreenshot()` with try/catch; Ctrl+V paste → preview → Send → URL stored; error case shows user-visible message | ⬜ PENDING |
| 5 | SEG-5 | `shell.openExternal` bridge confirmed in preload; link opens `https://mnemosynec.ai/download#channel` in external browser | ⬜ PENDING |
| 6 | SEG-6 | Smoke test Steps 1+2 GREEN; v0.5.1 built + deployed; download page updated; Go/No-Go verdict logged | ⬜ PENDING |

**Yoke closes when all 6 = GREEN (or PARTIAL with documented gate). Knight marks each inline as SEGs return.**

---

## FOUNDER NOTES (READ BEFORE DISPATCH)

1. **Peer identity** — "from_peer" in `help_messages` will use whatever peer UUID MnemosyneC already assigns the machine (from peer_presence or a stored device ID). SEG-3 must confirm which field that is from SEG-1 recon — do NOT invent a new peer identity system; reuse the existing one.

2. **RLS and service role** — The RLS policies set `current_setting('app.current_peer')`. This requires the Supabase client to call `SET app.current_peer = '[peer_uuid]'` per connection before any query. If this pattern is not already in use in the codebase, Knight can simplify to: use the service-role client for the IPC handlers (which bypasses RLS entirely) and rely on the Electron main process as the trust boundary — surface this tradeoff in the yoke return.

3. **Son's machine onboarding** — Son will use the Help Tab AFTER he has completed onboarding on v0.5.0 (SonPatch yoke handles that). Help Tab is not a prerequisite for onboarding — do not couple them.

4. **Tab UX Option B** — If BP083 Tab UX Option B is NOT yet implemented in v0.5.0, Knight adds Help tab to the existing tab list in whatever pattern is current. Do NOT block Help tab ship on a full Option B tab-bar refactor. Log the Option B state in SEG-1 recon.

5. **Image privacy** — `help_screenshots` bucket is set `public: false` above. If Supabase signed URLs are needed for image display in the message thread, SEG-4 must wire `getPublicUrl` OR `createSignedUrl` depending on bucket settings. Knight chooses the pattern that matches the bucket policy — do NOT mix public-URL with private-bucket.

6. **Restart-after-install canon (BP083)** — After v0.5.1 ships, Founder must fully close and reopen MnemosyneC. Do NOT assume auto-update correctly tears down renderer state. SEG-6 notes this in smoke test procedure.

---

*Yoke composed by Bishop SEG · Sonnet 4.6 · BP085 · 2026-06-17*
*No sub-agents used in Yoke composition. Knight dispatches SEGs per decomposition above.*
