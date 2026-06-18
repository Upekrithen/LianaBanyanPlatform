# YOKE RETURN — A3 GREEN · A6 BLOCKED (Routing Layer Missing)
**Session:** BP086 · **Filed:** 2026-06-18 08:06 local · **Knight:** Knight #2 (Sonnet 4.6)
**Trigger:** peer_presence quorum reached — poll loop 2 poll 16/30

---

## A3 GREEN — 2 Peers Active

| peer_id | tier | last_seen_at |
|---|---|---|
| `cb4ef450cc4a18c3` | base | 2026-06-18 13:06:33 UTC |
| `d0b47bd08633385b` | base | 2026-06-18 13:06:13 UTC |

v0.5.5 fixes confirmed working: `supabase_public.env` bundled → SUPABASE_URL + SUPABASE_ANON_KEY set → `registerPresenceConfig()` fires → `publishPresence()` passes null-guard → rows land in `peer_presence`. The full I1+I3a+I4 fix stack is live and operational.

---

## A6 BLOCKED — Relay Routing Layer Not Implemented

**Truth-Always binding (verbatim from THUNDERCLAP yoke):** *A receipt that hides a partial failure is worse than no receipt.*

### The gap

`question-dispatcher.ts` dispatches questions to peers by POSTing to `relay.lianabanyan.com/functions/v1/wan-relay-publish` with:
```json
{ "hex_frame": "<LB hex frame>", "target_node": "<peer_id>" }
```
It expects the relay to:
1. Receive the dispatch with `X-Node-Target` header
2. **Route it to the target node** (which has its peer HTTP server on port 7474)
3. Wait for the plow result
4. Return `{ "hex_frame": "<result hex frame>" }` or `{ "result": <NodeAnswer> }`

**Actual behavior of `wan-relay-publish`:** It is a **presence-only endpoint**. It upserts into `wan_relay_records` + `peer_presence` and returns:
```json
{ "ok": true, "sid": "...", "tier": "base", "peer_id": "...", "last_seen_at": "..." }
```

The dispatcher receives this, finds neither `hex_frame` nor `result` fields, and throws `"Unexpected response shape from node <id>"`. A6 aborts immediately.

### What's missing

A **wan-relay-route** (or extended `wan-relay-publish` with routing mode) that:
1. Accepts `{ hex_frame, target_node }` dispatch payload
2. Looks up target node's LAN IP (from `peer_presence.lan_addresses`) or relays via a WebSocket/Realtime channel
3. Forwards the question to the peer's `/api/plow-domain` endpoint on port 7474
4. Collects the plow result and returns it in `{ hex_frame }` format

**Note:** `peer_presence` currently stores no `lan_addresses` (the `lan_addresses` field in `peer_server.ts` is present in the PeanutRoll schema but the current `registerPresenceConfig` call in `index.ts` doesn't pass LAN addresses). So even a LAN-routing fallback would need the address populated.

### Options for Bishop to compose I5

| Option | Effort | Notes |
|---|---|---|
| A: New `wan-relay-route` Edge Function | ~60 min | Separate function; `wan-relay-publish` untouched; routes via HTTP to peer's port 7474 given IP lookup |
| B: Extend `wan-relay-publish` with `mode: "dispatch"` | ~45 min | Single function, adds routing branch; requires `lan_addresses` in peer_presence |
| C: Wire LAN addresses in `registerPresenceConfig` call (I3a fix) + Option B | ~60 min total | Most complete; adds `lan_addresses` to presence + routing in relay |
| D: Run A6 locally only (no cross-machine) | ~15 min | Run plow-cli on M0 against local Ollama; proves single-node baseline but NOT mesh topology |

**Option C is recommended** for the canonical THUNDERCLAP receipt. Option D is a useful sanity check but not publishable as a mesh receipt.

---

## Current Cascade State

| Gate | Status | Blocked by |
|---|---|---|
| A3 FLEET_AWAKE | ✅ GREEN | 2 peers active, `tier=base` |
| A6 SMOKE_PASS | 🔴 BLOCKED | Relay routing layer not implemented |
| A7 MMLU_RECEIPT | ⏳ PENDING | A6 |
| THUNDERCLAP 🌩️ | ⏳ PENDING | A7 |

---

## What Fires THUNDERCLAP Now

Bishop composes I5 with routing layer. Knight builds + deploys. Once `wan-relay-route` or extended `wan-relay-publish` is live:
1. Knight re-runs A6 smoke (5Q × 2 nodes) — should complete in <5 min
2. If green: A7 fires immediately (70Q × 2 nodes = 140 plow runs)
3. Receipt written to Vault with all 28 Unfair Advantages named
4. Published to `mnemosynec.ai/proofs/mesh/` from pre-staged template
5. THUNDERCLAP fires 🌩️

---

**Sonnet 4.6** — Knight #2 · BP086 · FOR THE KEEP.
