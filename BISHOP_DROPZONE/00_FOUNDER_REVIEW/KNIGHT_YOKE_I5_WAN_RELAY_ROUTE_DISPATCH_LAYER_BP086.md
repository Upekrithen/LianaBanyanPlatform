# KNIGHT YOKE I5 — wan-relay-route Dispatch Layer + A6/A7 Fire

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Origin:** Knight #2 Truth-Always diagnosis (commit 897ceb3) — `wan-relay-publish` is presence-only; mesh orchestrator needs a separate routing layer to forward questions to peer plow endpoints

**Knight preamble:** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. Spawn Sonnet 4.6 SEGs for substantive work. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD · §4 secrets BLOOD.

---

## Architectural distinction (lock this — Bishop will mint canon)

| Edge Function | Concern | Payload | Returns |
|---|---|---|---|
| `wan-relay-publish` | **Presence/heartbeat only** | `{sid, presence: {peer_id, tier, capabilities, ...}}` | `{ok, sid, tier, peer_id, last_seen_at}` |
| `wan-relay-route` (NEW) | **Question dispatch routing** | `{hex_frame, target_peer_id, source_peer_id, expects_reply}` | `{hex_frame: <reply>, latency_ms, status}` |

These MUST stay separate Edge Functions. Mixing them is what caused Knight #2's A6 dispatch to bounce off the wrong shape.

---

## Current live state (verified 2026-06-18 13:06 UTC)

- peer_presence: **2 active rows** ✅
  - `cb4ef450cc4a18c3` (M0) · tier=base
  - `d0b47bd08633385b` (M3) · tier=base
- A3 fleet wake: **GREEN**
- A6 smoke + A7 70Q canonical: **BLOCKED** on missing routing layer
- Diagnosis: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/YOKE_RETURN_A3_GREEN_A6_BLOCKED_BP086.md` (commit 897ceb3)

---

## SEGs

### SEG-I5a · BUILD wan-relay-route Edge Function

Create `platform/supabase/functions/wan-relay-route/index.ts`. Pattern after `wan-relay-publish` but with routing semantics:

**Input shape:**
```json
{
  "hex_frame": "<hex-encoded MMLU-Pro question payload>",
  "target_peer_id": "d0b47bd08633385b",
  "source_peer_id": "cb4ef450cc4a18c3",
  "expects_reply": true,
  "timeout_ms": 60000
}
```

**Logic:**
1. Look up `target_peer_id` in `peer_presence`. If `last_seen_at < now() - interval '5 min'` → return `{status: "peer_offline"}`.
2. Read target's `lan_addresses` and `relay_session_id` from the `peer_presence` row.
3. POST the `hex_frame` to the target peer's `/api/plow-domain` endpoint:
   - Try `lan_addresses[0]:7474/api/plow-domain` first (if accessible from Edge Function — likely NOT, since Edge Functions run in Deno Deploy, not LAN)
   - Fallback: Publish a routing record to a `relay_routes` table; target peer polls it (similar to Bishop/Knight Yoke bridge pattern). Target processes, writes reply back to `relay_route_replies` table. Source polls for the reply.

   **Decision point for SEG-I5a:** Pick the simplest architecture given Supabase Edge Function constraints. Edge Functions CANNOT reach LAN IPs (running in cloud). So the **relay_routes + polling pattern is canonical**. Document why.
4. If `expects_reply: true`: poll for reply for up to `timeout_ms`. Return `{hex_frame: <reply>, latency_ms, status: "ok"}`.
5. If `expects_reply: false`: fire-and-forget. Return `{status: "queued"}` immediately.

**Tables needed (migration):**
```sql
CREATE TABLE IF NOT EXISTS relay_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_peer_id text NOT NULL,
  target_peer_id text NOT NULL,
  hex_frame text NOT NULL,
  expects_reply boolean DEFAULT true,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'replied', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '5 minutes'
);

CREATE TABLE IF NOT EXISTS relay_route_replies (
  route_id uuid PRIMARY KEY REFERENCES relay_routes(id) ON DELETE CASCADE,
  reply_hex_frame text NOT NULL,
  delivered_at timestamptz DEFAULT now()
);

CREATE INDEX idx_relay_routes_target_pending ON relay_routes(target_peer_id, status) WHERE status = 'pending';
CREATE INDEX idx_relay_routes_expires ON relay_routes(expires_at) WHERE status = 'pending';

-- RLS: anon can INSERT routes (as source), service_role can SELECT all
-- (target peers poll via the desktop app's existing wan-relay-publish auth pattern)
ALTER TABLE relay_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_route_replies ENABLE ROW LEVEL SECURITY;
-- Add appropriate policies
```

Deploy via `npx supabase functions deploy wan-relay-route --project-ref ruuxzilgmuwddcofqecc --no-verify-jwt`.

**Sharp I5a:** ROUTE_FN_DEPLOYED = wan-relay-route Edge Function is ACTIVE on Supabase, relay_routes + relay_route_replies tables exist with proper indexes + RLS.

### SEG-I5b · WIRE DESKTOP APP TO POLL relay_routes

In `src/main/federation/peer_server.ts` (or a new `relay_route_poller.ts`):

Add a polling loop that runs every 5s when peer is registered:
1. SELECT `relay_routes WHERE target_peer_id = <my_peer_id> AND status = 'pending' AND expires_at > now()`
2. For each pending route:
   - Decode `hex_frame` → MMLU-Pro question payload
   - Invoke local plow at `localhost:7474/api/plow-domain` (or whatever the existing plow CLI entry point is)
   - Encode the plow's answer as hex
   - INSERT into `relay_route_replies` with the reply
   - UPDATE `relay_routes SET status = 'replied' WHERE id = ...`
3. Skip routes where status changes during processing (idempotency)

This needs to ship in a v0.5.6 desktop hotfix (or wire it as a service that auto-starts).

**HOWEVER** — for FIRST FIRE of THUNDERCLAP, we can skip the desktop integration and run the entire mesh orchestrator from KNIGHT'S MACHINE: Knight's mesh-orchestrator calls wan-relay-route (already running in cloud) → poll loops to pseudo-respond OR Knight has authenticated access to call local plow CLI from terminal across machines (less likely).

**Decision for SEG-I5b:** evaluate whether for THUNDERCLAP first-fire, the route layer can be a pure pass-through where Knight's mesh-orchestrator handles BOTH sides (dispatching to target's plow CLI directly via SSH/WinRM/whatever Knight has) — OR the desktop app needs the poller. If desktop poll wire required → ships as v0.5.6 hotfix.

**Sharp I5b:** DESKTOP_POLLER_DECISION = clear yes/no on whether v0.5.6 is needed for first-fire + rationale documented.

### SEG-I5c · TEST ROUND-TRIP

With M0 + M3 online:
1. From Knight's mesh-orchestrator (running on M0), POST a test question to wan-relay-route targeting `d0b47bd08633385b` (M3)
2. Verify M3's plow processes it and replies
3. Confirm round-trip latency + reply correctness
4. Report any failures with specific layer breakdown

**Sharp I5c:** ROUND_TRIP_VERIFIED = single question successfully routed M0 → M3 → reply received at M0.

### SEG-I5d · FIRE A6 SMOKE (5Q)

If I5c GREEN: invoke mesh-orchestrator with a 5-question MMLU-Pro sample across the 2 active peers (or all 4 if M1+M2 came online during I5).

**Sharp I5d:** A6_SMOKE_GREEN = 5 questions ran, ensemble winners + disagreement flags logged, no crashes.

### SEG-I5e · FIRE A7 CANONICAL 70Q

If I5d GREEN: invoke mesh-orchestrator with full MMLU-Pro 70-question canonical run.

Receipt MUST name all 28 LIVE Unfair Advantages from yoke §F including the 5 BP086 canons + Hex Machine Code per the THUNDERCLAP yoke. Topology line: "LAN-as-WAN · 4 machines routed via relay.lianabanyan.com" verbatim.

Write receipt to canonical Vault path per BP085 mesh-orchestrator spec.

**Sharp I5e:** A7_RECEIPT_LANDED = clean 70Q cross-machine run · receipt eblet at Vault path · all 28 advantages cited.

### SEG-I5f · PUBLISH RECEIPT

Use pre-staged template at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/THUNDERCLAP_PUBLICATION_PREP_BP086/proofs_mesh_page_template.html`. Paste receipt JSON into placeholders. Hugo build + Firebase deploy. Verify both `mnemosynec.ai/proofs/mesh/` AND `mnemosynec.org/proofs/mesh/` return 200 with score visible.

Cross-link from `/proofs/` index page.

**Sharp I5f:** PUBLISHED = both `.ai` and `.org` `/proofs/mesh/` return 200 with receipt content live.

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| I5a | ROUTE_FN_DEPLOYED | wan-relay-route LIVE + tables + RLS |
| I5b | DESKTOP_POLLER_DECISION | clear path forward decision documented |
| I5c | ROUND_TRIP_VERIFIED | M0→M3→M0 single-question round trip works |
| I5d | A6_SMOKE_GREEN | 5Q smoke clean |
| I5e | A7_RECEIPT_LANDED | 70Q receipt at Vault, 28 advantages cited |
| I5f | PUBLISHED | /proofs/mesh/ live on both domains |

---

**Composed by Bishop BP086. The routing layer that bridges A3 GREEN to A7 canonical.**
