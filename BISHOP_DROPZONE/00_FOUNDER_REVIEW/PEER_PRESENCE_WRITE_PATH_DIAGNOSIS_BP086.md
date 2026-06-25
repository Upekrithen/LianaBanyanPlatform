# PEER_PRESENCE Write Path Diagnosis — BP086 SEG-I2
**Date:** 2026-06-18 · **Model:** Sonnet 4.6

---

## Q1: Does wan-relay-publish write to peer_presence?

**YES** — conditionally, at lines 210–230.

```typescript
// line 210
if (roll.peer_id) {
  const presencePayload: Record<string, unknown> = {
    peer_id: roll.peer_id,
    wan_soccerball_id: roll.s,
    last_seen_at: new Date(nowMs).toISOString(),
    tier: presenceTier,
  };
  if (roll.email_hash)      presencePayload.email_hash      = roll.email_hash;
  if (roll.lan_addresses)   presencePayload.lan_addresses   = roll.lan_addresses;
  if (roll.relay_session_id) presencePayload.relay_session_id = roll.relay_session_id;
  if (roll.capabilities)    presencePayload.capabilities    = roll.capabilities;

  const { error: presenceError } = await supabase
    .from("peer_presence")
    .upsert(presencePayload, { onConflict: "peer_id" });  // line 224
  // ...
}
```

**Gate condition:** the write only runs if `roll.peer_id` is truthy (line 210). A PeanutRoll POSTed without a `peer_id` field skips the write entirely — no error, just silent skip. The `wan_relay_records` upsert still proceeds.

---

## Q2: Does the desktop app call wan-relay-publish on launch?

**YES (technically) — but the presence config is never initialized, so every publish attempt is a silent no-op.**

Call chain:
1. `src/main/index.ts` line 5685 — calls `startPeerServer()` at app startup.
2. `startPeerServer()` (`peer_server.ts` line 337) — immediately calls `publishPresence()` on server listen, then starts a 60-second interval loop.
3. `publishPresence()` (`peer_server.ts` lines 120–184) — **exits at line 121** before making any HTTP call:

```typescript
async function publishPresence(): Promise<void> {
  if (!_peerId || !_wanSoccerballId || !_supabaseUrl) return;  // ← ALWAYS returns here
  // ...
}
```

4. `registerPresenceConfig()` (`peer_server.ts` lines 66–78) — the function that sets `_peerId`, `_wanSoccerballId`, `_supabaseUrl`, and `_relaySessionId` — **is defined and exported but is NEVER imported or called anywhere in the codebase.**

Search result: `grep registerPresenceConfig src/**` → only one hit: the definition in `peer_server.ts`. Zero call sites.

---

## Q3: What payload does the desktop send?

`publishPresence()` constructs this body shape (from `peer_server.ts` lines 132–150):

```json
{
  "v": 1,
  "s": "<_wanSoccerballId sliced to 32 chars>",
  "p": ["<_peerId>"],
  "b": { "peerId": "<_peerId>" },
  "ts": <Date.now()>,
  "peer_id": "<_peerId>",
  "email_hash": "<_emailHash | undefined>",
  "relay_session_id": "<_relaySessionId | undefined>",
  "capabilities": {
    "ollamaModel": "<getRecommendedModel()>",
    "ramTier": "<hwTier.tier>",
    "ramGb": "<hwTier.ramGb>",
    "installedDomains": ["<...>"],
    "version": "<app.getVersion()>"
  }
}
```

This payload is **correctly structured** — it includes `peer_id` and `capabilities`, so the `wan-relay-publish` edge function would write to `peer_presence` if the payload ever reached it. The payload is never sent because `publishPresence()` exits at the null-check guard on line 121.

---

## Q4: Did the smoke POST land a row in peer_presence?

**YES** — a properly formatted PeanutRoll with `peer_id` included returned HTTP 202 and confirmed a row in `peer_presence`.

**psql output (before cleanup):**
```
      peer_id       | tier |        last_seen_at        
--------------------+------+----------------------------
 b086_diagnose_test | base | 2026-06-18 11:40:15.606+00
(1 row)
```

**Note:** The prompt's original test payload (`{"sid":"b086diagtest","presence":{...}}`) failed with HTTP 400 because it does not conform to the PeanutRoll schema (`v:1`, `s` as 32-char hex, `p:[]`, `b:{}`, `ts` required). A corrected payload was used for the smoke test.

---

## ROOT CAUSE

`registerPresenceConfig()` — the function that supplies `_peerId`, `_wanSoccerballId`, and `_supabaseUrl` to `peer_server.ts` — is **never called** in `src/main/index.ts`, so `publishPresence()` exits its null-check guard on every invocation and never POSTs to `wan-relay-publish`, meaning `peer_presence` accumulates zero rows from the desktop app.

---

## RECOMMENDED FIX

In `src/main/index.ts`, immediately after the `startPeerServer()` call (around line 5685), add a call to `registerPresenceConfig()` with the live peer identity values:

```typescript
import {
  startPeerServer,
  stopPeerServer,
  getCurrentTier,
  registerPresenceConfig,          // ADD THIS IMPORT
} from './federation/peer_server';

// ... in app startup, after startPeerServer():
import { getStablePeerId } from './federation/peer-discovery';
import { createHash } from 'crypto';

const peerId = getStablePeerId();
// Derive a stable 32-char hex soccerball ID from peerId
const wanSoccerballId = createHash('sha256').update(`wan:${peerId}`).digest('hex').slice(0, 32);
// Derive relay session ID (ephemeral per launch)
const relaySessionId = randomUUID().replace(/-/g, '').slice(0, 32);

registerPresenceConfig({
  peerId,
  emailHash: '',           // populate from user profile store when available
  wanSoccerballId,
  relaySessionId,
  supabaseUrl: 'https://ruuxzilgmuwddcofqecc.supabase.co',  // or read from env
});
```

**Estimated effort:** ~20 lines · 1 file · < 30 minutes.

The `wan-relay-publish` edge function is confirmed working. The `peer_presence` table is writable. No infrastructure work needed — this is a pure call-site omission in the Electron main process.

---

## SECONDARY FINDINGS

1. **FederationPeerMeshPanel.tsx** (`src/renderer/components/FederationPeerMeshPanel.tsx`) — reads peer mesh state via IPC; does not trigger any presence registration. It is display-only. Not a factor.

2. **Smoke POST payload format** — The prompt's provided test payload is not a valid PeanutRoll. Any external caller (monitoring script, health check) must send the full PeanutRoll shape (`v`, `s` as 32-char hex, `p`, `b`, `ts`) plus `peer_id` for the `peer_presence` write to fire.

3. **Tier detection** — The edge function correctly distinguishes `'base'` (anonymous) from `'member'` (JWT-authenticated) peers via the `Authorization` header (line 169). The desktop app currently never sends an auth header, so all presence rows will record `tier: 'base'` until member auth is wired.

4. **Rate limiter** — 3 publishes per SID per hour (in-process, per Deno isolate). With a 60-second publish interval, the desktop app would hit this limit after 3 minutes of uptime within the same isolate warm period. Once `registerPresenceConfig` is called, the SID should be rotated at most once per session (relaySessionId is ephemeral per launch), but the wanSoccerballId is stable — the rate limiter could silently suppress presence refreshes after the 3rd publish each hour. Consider raising the SID rate limit to 60+/hour or keying the rate limit on `peer_id` instead of SID.

5. **`publishPresence` missing `lan_addresses`** — the payload shape in `peer_server.ts` does not populate `lan_addresses`, even though the table column and edge function support it. LAN address data is available via the UDP socket in `peer-discovery.ts` but is not plumbed through.
