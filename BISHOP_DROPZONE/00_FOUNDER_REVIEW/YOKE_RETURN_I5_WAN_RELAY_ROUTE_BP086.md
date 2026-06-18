# YOKE RETURN — I5 wan-relay-route Dispatch Layer + v0.5.6
**Session:** BP086 · **Completed:** 2026-06-18 · **Knight:** Sonnet 4.6
**Origin yoke:** `KNIGHT_YOKE_I5_WAN_RELAY_ROUTE_DISPATCH_LAYER_BP086.md`

---

## Sharps Summary

| # | Sharp | Status | Notes |
|---|---|---|---|
| I5a | ROUTE_FN_DEPLOYED | ✅ | relay_routes + relay_route_replies tables live; migration 000008 applied |
| I5b | EDGE_FN_DEPLOYED | ✅ | wan-relay-route Edge Function ACTIVE on Supabase |
| I5c | DESKTOP_POLLER_WIRED | ✅ | 5s poll loop in src/main/index.ts; tsc --noEmit clean |
| I5d | V056_SHIPPED | ✅ | v0.5.6 built (514.9 MB); SHA512 first 20: `MzWdhp2Pk0yPim...` |
| I5e | FIREBASE_DEPLOYED | ✅ | mnemosynec.ai + mnemosynec.org both return 200 with v0.5.6 |

---

## I5a — SQL Migration

**Migration file:** `platform/supabase/migrations/20260618000008_relay_route_tables.sql`

**Tables created (psql confirmed):**
- `public.relay_routes` — orchestrator INSERTs questions; peer polls and picks up
- `public.relay_route_replies` — peer INSERTs answers; orchestrator reads

**Schema:**
```
relay_routes:      id(uuid), created_at, target_peer_id(text), hex_frame(text), payload_json(jsonb), status(text CHECK pending/processing/answered/error/expired), session_id(text), ttl_seconds(int)
relay_route_replies: id(uuid), created_at, route_id(uuid→relay_routes), peer_id(text), answer_json(jsonb), hex_reply(text), processing_ms(int)
```

**RLS policies:** SELECT/INSERT/UPDATE open (peer polls its own queue, service role inserts routes, peer inserts replies)

**Indexes:**
- `idx_relay_routes_target_status ON relay_routes(target_peer_id, status)`
- `idx_relay_route_replies_route ON relay_route_replies(route_id)`

**psql verification:**
```
table_name
---------------------
relay_route_replies
relay_routes
(2 rows)
```

---

## I5b — Edge Function: wan-relay-route

**Deployed:** `platform/supabase/functions/wan-relay-route/index.ts`
**Project:** `ruuxzilgmuwddcofqecc`
**Dashboard:** https://supabase.com/dashboard/project/ruuxzilgmuwddcofqecc/functions
**Endpoint URL:** `https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/wan-relay-route`

**Function logic:**
1. Accepts POST `{ target_peer_id, hex_frame, payload_json, session_id, ttl_seconds? }`
2. Optional: checks `peer_presence` — if `last_seen_at > 5 min` returns `{status: "peer_offline"}`
3. INSERTs row into `relay_routes` with status `pending`
4. Returns `{ ok: true, route_id, created_at }` — caller polls `relay_route_replies` for answer

**Architecture decision (canonical):** Edge Functions run in Deno Deploy (cloud), NOT on LAN. They CANNOT reach LAN IPs (e.g., `192.168.x.x:7474`). Therefore, direct peer-to-peer routing via Edge Function is impossible. The `relay_routes + relay_route_replies` polling pattern is canonical for cross-WAN mesh. This is why `wan-relay-route` (routing) is separate from `wan-relay-publish` (presence/heartbeat).

---

## I5c — Desktop Poll Loop

**File modified:** `src/main/index.ts`

**Function added:** `startRelayRoutePoll(peerId: string): NodeJS.Timeout`
**Call site:** After `registerPresenceConfig` block (line ~5707), wired as:
```typescript
// BP086 I5c: start relay poll (answers cross-WAN questions from orchestrator)
{
  const _relayPeerId = getStablePeerId();
  startRelayRoutePoll(_relayPeerId);
}
```

**Poll behavior:**
1. Every 5 seconds: GET `relay_routes?target_peer_id=eq.<peerId>&status=eq.pending`
2. For each pending route: marks `processing` → calls `localhost:11434/api/generate` (model: gemma4:12b) → INSERTs into `relay_route_replies` → marks `answered`
3. Error path: marks route `error`, logs warning — never crashes main process
4. Guard: if SUPABASE_URL or SUPABASE_ANON_KEY not set → logs warning, poll disabled (non-fatal)
5. Uses Node 18+ native `fetch` — no additional dependencies

**TypeScript compile:** `npx tsc -p tsconfig.main.json --noEmit` — **clean (exit 0)**

---

## I5d — v0.5.6 Build

**package.json version:** `0.5.5` → `0.5.6`

**Build output:** `release/MnemosyneC-Setup-0.5.6.exe`
- **Size:** 539,909,778 bytes (~514.9 MB)
- **SHA512 (base64):** `MzWdhp2Pk0yPimjVGMEoi6DOP3KtkE5YlKtqu7+x+Hxo7InuCVFQYoIiQ+kpS6Qlah6XpWJMOzvDQRJcmU9FlQ==`
- **SHA512 first 20 chars:** `MzWdhp2Pk0yPim...`
- **Ollama assert:** PASS (ollama.exe 33.9 MB + vc_redist.x64.exe 24.4 MB in installer)

**Installer copied to:**
- `Cephas/cephas-hugo/static/download/MnemosyneC-Setup-0.5.6.exe`
- `Cephas/cephas-hugo/public-mnemosynec/download/MnemosyneC-Setup-0.5.6.exe`

---

## I5e — Firebase Deploy

**Hugo build:** `hugo --minify` — 1200 pages, completed in ~58s

**Deploy:** `firebase deploy --only hosting:cephas,hosting:mnemosyne`
- `hosting[cephas-lianabanyan]`: release complete ✅
- `hosting[mnemosyne-lianabanyan]`: release complete ✅

*Note: `lianabanyan-museum` target was excluded — pre-existing Firebase CLI path error unrelated to I5 changes. Museum deploy is blocked by a separate Firebase CLI issue; does not affect mnemosynec.ai or mnemosynec.org.*

**Live verification:**

| Domain | Status | Version |
|---|---|---|
| `https://mnemosynec.ai/download/latest.yml` | 200 ✅ | version: 0.5.6 ✅ |
| `https://mnemosynec.org/download/latest.yml` | 200 ✅ | version: 0.5.6 ✅ |

---

## Files Changed

| File | Change |
|---|---|
| `platform/supabase/migrations/20260618000008_relay_route_tables.sql` | NEW — relay_routes + relay_route_replies tables |
| `platform/supabase/functions/wan-relay-route/index.ts` | NEW — Edge Function for question dispatch routing |
| `src/main/index.ts` | MODIFIED — startRelayRoutePoll() + call site |
| `package.json` | MODIFIED — version 0.5.5 → 0.5.6 |
| `Cephas/cephas-hugo/static/download/latest.yml` | MODIFIED — v0.5.6 SHA512 + size |
| `Cephas/cephas-hugo/public-mnemosynec/download/latest.yml` | MODIFIED — v0.5.6 SHA512 + size |
| `Cephas/cephas-hugo/static/download/MnemosyneC-Setup-0.5.6.exe` | NEW — installer binary |
| `Cephas/cephas-hugo/public-mnemosynec/download/MnemosyneC-Setup-0.5.6.exe` | NEW — installer binary |

---

## Architecture: Cross-WAN Relay Pattern (Canonical)

```
Orchestrator (M0, Knight's machine)
    │
    │ POST {target_peer_id, hex_frame, payload_json}
    ▼
wan-relay-route Edge Function (Supabase Deno Deploy)
    │
    │ INSERT status='pending'
    ▼
relay_routes table (Supabase Postgres)
    ▲
    │ poll every 5s: SELECT WHERE target_peer_id=<me> AND status='pending'
    │
MnemosyneC Desktop App (Son's machine, Base Tier, different ISP)
    │
    │ call localhost:11434/api/generate (gemma4:12b)
    │ INSERT into relay_route_replies
    │ PATCH relay_routes SET status='answered'
    ▼
relay_route_replies table
    ▲
    │ poll for reply
    │
Orchestrator reads answer
```

**Key insight:** Neither side needs to expose any port. No VPN, no IP-to-IP routing, no port forwarding. Supabase is the message bus.

---

## Next

- Son installs v0.5.5 (auto-updater will bump to v0.5.6)
- His peer registers in `peer_presence` (wan-relay-publish already deployed)
- His desktop begins polling `relay_routes` for his peer_id
- 5-peer diagnostic is runnable: orchestrator dispatches to Son's peer → relay answers via Supabase → ensemble aggregates

FOR THE KEEP!
