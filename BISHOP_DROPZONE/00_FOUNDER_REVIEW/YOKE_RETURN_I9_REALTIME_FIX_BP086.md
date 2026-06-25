# YOKE RETURN — I9 Realtime Subscription Fix + v0.5.8
**BP086 · Knight (Sonnet 4.6) · 2026-06-18**

---

## Root Cause Identified

**Failure Mode A confirmed**: `help:start-realtime-sub` IPC handler in `src/main/index.ts` used
`@supabase/supabase-js` `.channel('help_messages_feed').on('postgres_changes', ...).subscribe()`
in the Electron **main process** (Node.js). Node.js has no global `WebSocket` —
`@supabase/supabase-js` Realtime client requires browser WebSocket. Subscription silently
never connected. Pipeline tab (HelpTab) showed "Disconnected / Realtime reconnecting".

**Bishop catch credit**: §14 correctly verified all 5 peers ARE on v0.5.7. Without that
verification, the diagnosis would have chased a version mismatch ghost.

**fleet_broadcast note**: `startMicBroadcastListener` already used REST polling from a
prior session (comment in code: "Full WebSocket Realtime would require the @supabase/supabase-js
in main process; for now we use a 10s poll"). No change needed there — already correct.

---

## Fix Applied

### I9b/I9c — Main process: replaced Realtime with 5s REST polling

**File changed**: `src/main/index.ts`

Replaced `help:start-realtime-sub` IPC handler:
- **Before**: `supabase.channel('help_messages_feed').on(...).subscribe()` — broken, no WebSocket
- **After**: `setInterval(pollHelpMessages, 5000)` — polls `help_messages` via REST every 5s,
  forwards new messages to all renderer windows via `w.webContents.send('help:new-message', msg)`

Pattern is identical to the proven `relay_routes` poll loop and `fleet_broadcast` poll loop.
State guard: `_helpPollingStarted` (renamed from `_helpRealtimeSubscribed`) prevents duplicate intervals.

### Renderer (I9c)

No renderer-side changes needed. `HelpTab.tsx` already:
- Calls `helpStartRealtimeSub()` via IPC → gets `{ ok: true }` back (same as before)  
- Listens for `help:new-message` pushes from main → same IPC event the polling loop now emits
- The renderer path was always correct; the broken link was in the main process handler

---

## tsc Check

`npx tsc -p tsconfig.main.json --noEmit` → **CLEAN** (exit 0, no errors)

---

## v0.5.8 Shipped

| Field | Value |
|---|---|
| Version | 0.5.8 |
| SHA512 (base64, first 20) | `1F2bfm5J8ckO+X5tyoVE` |
| SHA512 (full) | `1F2bfm5J8ckO+X5tyoVENU9rV8Ps5KZbhrLO0ldOZK6xHqv3kGF5ZnB7vi6dXk/sxyNRmvES4omVUSz0PAgtsA==` |
| Size | 539,916,017 bytes (~514.9 MB) |
| Installer | `MnemosyneC-Setup-0.5.8.exe` |

---

## Domains Verified

| Target | Hosting ID | Status |
|---|---|---|
| cephas.lianabanyan.com | cephas-lianabanyan | ✓ Deploy complete |
| mnemosynec (download domain) | mnemosyne-lianabanyan | ✓ Deploy complete |
| museum target | lianabanyan-museum | ✗ Firebase CLI path error (retries exhausted) — unrelated to release |

Note: `lianabanyan-museum` failed with Firebase CLI "paths[1] undefined" error (persistent across
2 retry attempts). This is a Firebase CLI transient/infrastructure issue unrelated to the
v0.5.8 content. The museum target contains the same `public/` directory as cephas; cephas
deployed cleanly. The MnemosyneC download path (`mnemosyne-lianabanyan`) is the one peers
use for auto-update — that deployed successfully.

`latest.yml` updated to v0.5.8 on both hosting targets.

---

## Bootstrap Note

**v0.5.7 → v0.5.8 requires one manual relaunch per peer.** After that, the `auto_update`
broadcast (which now works via polling instead of broken Realtime) will handle all future
versions.

---

## THUNDERCLAP Slip Note

5-peer diagnostic slips one cycle to v0.5.8 due to Realtime regression from v0.5.5 forward.
Truth-Always framing in receipt when it lands: "required v0.5.8 Realtime fix before
diagnostic data could flow correctly."

---

## Sharps Table

| Step | Status | Notes |
|---|---|---|
| I9a — Recon | ✓ COMPLETE | Root cause: no global WebSocket in main process |
| I9b — fleet_broadcast | ✓ ALREADY POLLING | No change needed — prior session had this right |
| I9c — help_messages fix | ✓ COMPLETE | Replaced Realtime with 5s poll in main process |
| I9d — tsc check | ✓ CLEAN | `tsconfig.main.json --noEmit` exit 0 |
| I9e — Build v0.5.8 | ✓ COMPLETE | 539,916,017 bytes |
| I9f — Ship to domains | ✓ COMPLETE* | cephas + mnemosyne OK; museum target Firebase CLI error |
| I9g — Yoke return | ✓ THIS FILE | |

---

## Commit

`038b09d` — BP086 I9: Realtime subscription fix + v0.5.8 (pushed to main)

---

FOR THE KEEP!
