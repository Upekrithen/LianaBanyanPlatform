# KNIGHT YOKE · Mesh WAN/NAT Proper Build · Long-Haul · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT — *"I want to do it right, the first time, BUILD FOR THE LONG HAUL always, and so we need to make it RIGHT with the NAT and all that."*
**Paired with:** YOKE-MIC-M5-SHARD-TODAY (CLI ship-today bridge while this lands)
**Target version:** v0.5.0 (this is a major substrate-layer ship)

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. Zero Composer 2.5 contamination — BP081 BLOOD.

---

## What's currently broken (state-of-play)

Per Sonnet 4.6 SEG audit of `caithedral-core/src/dns/wan_soccerball_address.ts` + `src/main/federation/`:

1. **`resolveWanSoccerball()`** — LIVE but hardcoded to `https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1` instead of canonical `relay.lianabanyan.com`. CNAME pending Founder DNS action.
2. **No NAT traversal** — `mic_dispatcher.ts:108` does plain HTTP POST to `{peer.address}:7474` with no STUN/TURN. WAN peers behind NAT are unreachable without port-forward.
3. **No UDP auto-discovery** — `constellation_discovery.ts` requires peers to be manually added via Settings UI. No LAN broadcast.
4. **`/api/info` scaffold** — peer_server.ts returns `installedDomains: []` and `ollamaModel: null`. MIC can't auto-detect peer's model/RAM tier → defaults to gemma4:12b, OOMs lightweight peers.
5. **Thorax encryption deferred** — MIC payloads currently plain HTTP, no auth. Fine for LAN, unsafe for WAN.

---

## SEG-1 — Wire relay.lianabanyan.com CNAME (Sonnet 4.6 SEG)

**Founder DNS step (Bishop-relayed instruction, NOT Knight-executable):**
1. Squarespace DNS panel → add CNAME record: `relay.lianabanyan.com` → `ruuxzilgmuwddcofqecc.supabase.co`
2. Supabase Dashboard → Project Settings → Custom Domains → add `relay.lianabanyan.com` → verify TXT challenge

**Knight code change:**
- `caithedral-core/src/dns/wan_soccerball_address.ts:478` — replace hardcoded Supabase URL with `RELAY_BASE = process.env.RELAY_BASE || 'https://relay.lianabanyan.com/functions/v1'`
- Add fallback chain: try `relay.lianabanyan.com` first → on 5xx, fall through to Supabase direct URL. Circuit breaker per existing pattern.

**Sharp:** `curl -sI https://relay.lianabanyan.com/functions/v1/health` → HTTP/1.1 200 OK once Founder DNS step completes.

---

## SEG-2 — NAT traversal via Supabase relay (Sonnet 4.6 SEG)

**Architecture:** the relay IS the NAT traversal. Each node publishes its presence + capabilities to the relay; peers fetch the relay for discovery. No direct WAN HTTP — all peer-to-peer communication for cross-NAT pairs goes through the Supabase Edge Function relay as a hub.

**Schema (Supabase table `peer_presence`):**
- `peer_id` (text, PK)
- `email_hash` (text, indexed)
- `wan_soccerball_id` (text)
- `lan_addresses` (text[]) — internal IPs for LAN-side optimization
- `relay_session_id` (text) — for relay-routed messages
- `capabilities` (jsonb) — `{installedDomains, ollamaModel, ramTier, version}`
- `last_seen_at` (timestamptz)
- TTL: presence rows expire after 5 min stale

**Edge Functions:**
- `wan-relay-publish` — accepts heartbeat from peer (already exists per BP080); EXTEND to write capabilities jsonb
- `wan-relay-resolve` — accepts peer lookup by email_hash or peer_id (already exists); EXTEND to include capabilities in response
- `wan-relay-route` — **NEW** — accepts encrypted payload + target peer_id, routes to target's most recent presence; target polls for inbound (long-poll 30s)

**Client code:**
- `peer_server.ts` — publish presence every 60s with full capabilities
- `mic_dispatcher.ts` — for WAN peers, route via relay instead of direct HTTP POST
- LAN peers (same subnet) still use direct port 7474 for speed

**This gives Son's M5 full WAN reachability behind NAT without port-forward. Same path future members use. NO STUN/TURN infrastructure to operate — relay does it.**

---

## SEG-3 — Populate `/api/info` correctly (Sonnet 4.6 SEG)

`peer_server.ts:77` — fill `installedDomains` from Chocolates registry + `ollamaModel` from `ram_detector.ts` selection + `ramTier` from RAM detector + `version` from package.json.

MIC dispatcher then reads capabilities from each peer's presence row before assigning shards — never pushes gemma4:12b to a lightweight peer.

**Sharp:** `curl http://localhost:7474/api/info` returns non-null model + non-empty installedDomains on a fully-initialized node.

---

## SEG-4 — LAN auto-discovery via UDP multicast (Sonnet 4.6 SEG)

`constellation_discovery.ts` — add UDP broadcast on port 7475 (sister to peer HTTP 7474):
- On startup, broadcast `MNEMOSYNEC_PEER_BEACON` packet with `{peer_id, version, capabilities_summary}`
- Listen for other beacons on 7475
- Auto-populate peers list with discovered LAN nodes
- WAN peers still added via email_hash → relay lookup (deliberate — privacy boundary)

**Sharp:** with M0 + M1 + M2 + M3 all running on 192.168.86.x, opening Settings → Constellation shows all 4 nodes discovered within 10s without manual add.

---

## SEG-5 — Thorax encryption on relay payloads (Sonnet 4.6 SEG)

For WAN-routed payloads through Supabase relay, encrypt with Thorax (12-thread per existing BP083 canon `reference_federation_node_frontier_capsules_thorax_cooperative_work_bp083`). Relay sees only opaque ciphertext + target peer_id. Supabase / machine-owner BLIND to contents.

Key exchange: piggyback on existing email_hash + session_nonce pattern (`wan_soccerball_address.ts`).

LAN-direct (port 7474) skips Thorax for speed — same subnet trust boundary.

---

## SEG-6 — HexIsle Devvit cousin (Sonnet 4.6 SEG)

**HARD DEADLINE 2026-06-30 (15 days).**

The Mesh long-haul design composes cleanly with HexIsle Cross-Realm canon (`reference_hexisle_shadow_world_cross_realm_bp082`):
- Reddit Devvit app uses Reddit-platform comms as the Council Realm transport
- Discord bot uses Discord-platform comms as the Sword Realm transport
- Shadow Gate bridges them via MnemosyneC desktop relay (same relay.lianabanyan.com pipe)
- Per BP082 canon: Mikey Slot #1, Son Slot #2, open-ended per-locale (NOT fixed-12 cities)

Stub the Devvit registration this yoke so it's listed before June 30. Full HexIsle behavior ships in v0.5.1 — registration alone hits the deadline.

---

## SEG-7 — Deploy v0.5.0 with BP080 4-Sharpening (Sonnet 4.6 SEG)

Use atomic-deploy.ps1 (v0.4.3 hardened). All Sharps literal HTTP 200 first hop, NO 302 chain, NO cosmetic-GREEN.

Sharps include:
- Sharp 1: relay.lianabanyan.com health endpoint 200 (post-DNS)
- Sharp 2: M0 and M5 successfully exchange a test payload via relay round-trip
- Sharp 3: LAN auto-discovery finds 3 nodes in <10s
- Sharp 4: MIC dispatch shards correctly using capability-aware partition (no gemma4:12b pushed to lightweight peer)
- Sharp 5: 5-node 1,400-q campaign completes in <5h wall-clock — Truth-Always receipt published
- Sharp 6: Thorax encryption verified on WAN payload (cipher inspect at relay shows opaque)

---

## Founder action checklist (Bishop relays)

Tracked separately — Knight cannot do these:

1. Squarespace DNS: add CNAME `relay.lianabanyan.com` → `ruuxzilgmuwddcofqecc.supabase.co`
2. Supabase Dashboard: add custom domain + TXT challenge
3. Generate Supabase PAT at https://supabase.com/dashboard/account/tokens → add to `22May2026.env` as `SUPABASE_ACCESS_TOKEN=` (per BP082 canon — unblocks migration)
4. Reddit Devvit account registration (deadline 2026-06-30)

---

## Yoke-return spec

Each SEG status + commit SHAs + Sharps with literal HTTP codes + 5-node campaign receipt (when run) + verbatim "Sonnet 4.6" line.

**FOR THE KEEP.**
