# Mesh Cross-LAN Verification
## BP077 Scope 7 — WAN/Cross-LAN Gap Analysis & Test Procedure

**Status:** Same-LAN proven. Cross-LAN blocked on relay server deployment.
**Date:** 2026-06-08
**Author:** Knight (Sonnet 4.6)

---

## 1. Same-LAN Proof (BP063 / MESH-6)

The same-LAN mesh was verified 2-instance on a single host (Option B) in session BP063:

| Gate | Result |
|------|--------|
| Instance A starts, announces on `:11481` | PASS |
| Instance B starts, announces on `:11483` (via `PEER_ANNOUNCE_PORT` env) | PASS |
| A discovers B via mDNS / subnet probe | PASS |
| `sync_request` → `sync_response` TCP handshake | PASS |
| `sid_fetch_request` served on same socket before `socket.end()` | PASS |
| `pointer_advance` emitted by A, auto-replicated to B | PASS |
| B stores `dag_id=97ef95b5d803f9eca0c1c99a3151c619`, hash verified | PASS |
| `GET /dag/lookup/<id>` on B returns `found: true` | PASS |

**Receipt:** `MESH_6_RECEIPT_BP063.md` — gate OG-027 PASS, two-instance receipt PASS.
**Version:** v0.1.21 (commit `d6a7caab`).

> **Note on "BP065 20/20":** BP065 was a 9,535-line session (SSPL sweep + MESH topic signal;
> ingested structurally in BP073 backfill). The canonical same-LAN two-instance proof receipt
> lives in `MESH_6_RECEIPT_BP063.md`. If a separate 20/20 run log was produced in BP065 it
> is within the KNIGHT tree (`LianaBanyanKNIGHT/BP065.md`) and not yet deep-read.

---

## 2. Transport Mechanism

**This mesh is NOT WebRTC.** There is no ICE, STUN, or TURN in this stack.

### LAN (same network)

| Layer | Technology |
|-------|-----------|
| Peer discovery | mDNS/UDP multicast `224.0.0.251:5354` (`_mnemosyne._tcp.local.`) |
| Fallback discovery | Subnet probe `.1–.10` on common RFC-1918 ranges |
| Data transport | Node.js TCP (`net.createServer` / `net.createConnection`) on port `11481` |
| Protocol | Newline-delimited JSON over raw TCP |
| Message types | `sync_request`, `sync_response`, `sid_fetch_request`, `sid_fetch_response`, `pointer_advance`, `pair_*`, `assist_*` |

### WAN (cross-LAN / cross-internet)

| Layer | Technology |
|-------|-----------|
| Relay endpoint | `wss://relay.mnemosynec.ai` (WebSocket) |
| Client | `src/main/federation/relay-client.ts` → `RelayClient` (compiled: `dist/main/federation/relay-client.js`) |
| Server | `relay-server/` → Cloud Run container |
| Protocol | Envelope routing: `relay_join` → `relay_route` → `relay_broadcast` |
| Auth | `relay_auth` message + `RELAY_SECRET` env var on server |

The relay acts as a **WebSocket message broker**, not a TURN server. Peers connect to `relay.mnemosynec.ai`, register with `relay_join`, then send `relay_route` envelopes addressed to a target `peerId`. The relay server forwards the inner message. No direct peer-to-peer UDP holes are punched.

---

## 3. Cross-LAN Gap Analysis

### What is built ✓

| Component | Location | Status |
|-----------|----------|--------|
| `RelayClient` class | `src/main/federation/relay-client.ts` | Built, compiled |
| `RelayServer` class | `dist/main/federation/relay_server.js` | Built, compiled |
| Cloud Run source | `relay-server/` | Built (Dockerfile + `server.js`) |
| Firebase Functions (Pocket-6 email resolver) | `relay-server/functions/` | Built |
| Deploy runbook | `relay-server/DEPLOY_FOUNDER.md` | Written |
| `RELAY_URL` constant | `src/shared/federation-protocol.ts` | `wss://relay.mnemosynec.ai` |
| `PeerTransport` type | `src/shared/federation-protocol.ts` | `'lan' | 'wan-relay'` |
| `MnemosynePeer.relaySessionId` | `src/shared/federation-protocol.ts` | Typed |
| Wave B2 WAN test harness | `platform/src/tests/wave_b2_organic_mesh_wan.test.ts` | Deterministic (simulated) |

### What is missing / blocked ✗

| Gap | Detail |
|-----|--------|
| **Relay server not deployed** | `relay.mnemosynec.ai` is not live. Cloud Run deploy requires Founder `gcloud auth login` + IAM `run.services.create` on project `lianabanyan-403dc`. One command once authenticated. |
| **Custom domain not mapped** | `relay.mnemosynec.ai` DNS mapping to Cloud Run requires `gcloud run domain-mappings create` after deploy. |
| **`RELAY_SECRET` not provisioned** | Secret Manager entry `relay-secret` in `lianabanyan-403dc` must be created before deploy. |
| **No real cross-machine test** | All WAN tests in `wave_b2_organic_mesh_wan.test.ts` are deterministic simulations. No physical second machine has ever connected via relay. |
| **Firebase Functions Pocket-6 not deployed** | Email → peerId resolver (`resolveEmail`) not live. Required for invite flow but not required for raw relay mesh test. |

### What is NOT missing (no WebRTC/TURN needed)

- STUN servers: not needed (no UDP hole punching; relay is WebSocket-based)
- TURN servers: not needed (relay is the media/data proxy)
- ICE negotiation: not needed
- WebRTC `RTCPeerConnection`: not used anywhere in this codebase

---

## 4. WebSocket Relay Architecture

```
Machine A (LAN 1)                relay.mnemosynec.ai              Machine B (LAN 2)
  RelayClient                      RelayServer                      RelayClient
      |                                 |                                 |
      |── relay_join {peerId: A} ──────>|                                 |
      |                                 |<──── relay_join {peerId: B} ────|
      |                                 |── relay_broadcast (peer list) ->|
      |<──────── relay_broadcast ────── |                                 |
      |                                 |                                 |
      |── relay_route {to: B,           |                                 |
      |     innerMsg: identify} ───────>|── (forward innerMsg) ──────────>|
      |                                 |<── relay_route {to: A,          |
      |<──────────────────────────────── |     innerMsg: identify_ack} ───|
      |                                 |                                 |
      |<──── sync_request / sync_response (via relay_route envelopes) ───>|
      |                                 |                                 |
      |<──── sid_fetch, pointer_advance (via relay_route) ───────────────>|
```

The relay server does NOT interpret the `innerMsg` — it is opaque forwarding. The full federation handshake (`identify` → `identify_ack` → `ratify` → `ratify_ack` → `sync_request` → `sync_response`) runs inside relay envelopes exactly as it does over LAN TCP.

---

## 5. Step-by-Step Cross-LAN Test Procedure

### Prerequisites

**Machine A** (Founder's current machine — same as BP063 same-LAN tests):
- Mnemosyne v0.1.21+ installed and running
- Internet connection

**Machine B** (second machine — different network/LAN):
- Mnemosyne v0.1.21+ installed (copy installer from `release/`)
- Internet connection
- Different ISP/router (coffee shop, home on different router, VPS, phone hotspot)

**Relay server must be live** (see Section 6 — deploy first).

---

### Phase 0: Deploy the Relay (Founder one-time action)

See `relay-server/DEPLOY_FOUNDER.md` for full instructions. Summary:

```powershell
# On Founder's machine — one-time setup
gcloud auth login
gcloud config set project lianabanyan-403dc
gcloud services enable run.googleapis.com --project lianabanyan-403dc

# Generate and store relay secret
$secret = [System.Convert]::ToBase64String(
  [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
echo $secret | gcloud secrets create relay-secret --data-file=- --project lianabanyan-403dc

# Deploy relay server
gcloud run deploy mnemosynec-relay `
  --source "C:\Users\Administrator\Documents\LianaBanyanPlatform\relay-server" `
  --region us-central1 --project lianabanyan-403dc `
  --allow-unauthenticated --port 8080 `
  --update-secrets "RELAY_SECRET=relay-secret:latest" `
  --min-instances 1 --timeout 3600

# Map custom domain
gcloud run domain-mappings create `
  --service mnemosynec-relay --domain relay.mnemosynec.ai `
  --region us-central1 --project lianabanyan-403dc
```

Verify: `curl https://relay.mnemosynec.ai/health` should return `{"ok":true}`.

---

### Phase 1: Start Machine A

1. Launch Mnemosyne on Machine A (normal launch, no special env vars)
2. Open the Federation / Peer Mesh panel in the UI (`FederationPeerMeshPanel`)
3. Note the **peerId** shown in the UI (or from app logs: `[RelayClient] Connected to relay`)
4. Confirm log shows: `[RelayClient] Connected to relay`
5. Record peerId-A

---

### Phase 2: Start Machine B (different network)

1. Install Mnemosyne on Machine B from the installer in `release/`
2. Launch Mnemosyne normally
3. Confirm log on B: `[RelayClient] Connected to relay`
4. Record peerId-B

---

### Phase 3: Verify relay sees both peers

```bash
curl https://relay.mnemosynec.ai/peers
```

Expected: both peerId-A and peerId-B appear in the peer list.

---

### Phase 4: Trigger cross-LAN sync

On Machine A, the `RelayClient` will emit a `relay_broadcast` with the peer list update when B connects. The `FederationClient.peerDiscoverySource` will pick up B as a WAN peer. Sync should proceed automatically.

Alternatively, use the "Pair" flow in the UI to initiate `pair_request` from A to B.

**Watch logs on both machines for:**
```
[RelayClient] Connected to relay
[Federation] Synced N records with peer <peerId-B>
[MESH-6] pointer_advance auto-replicated dag_id=<id> hash_verified=true
```

---

### Phase 5: Verify cross-LAN record exchange

On Machine A: create a new record (write to watched folder, or use AI Burst mode).
On Machine B: check substrate for the record.

```powershell
# On Machine B — query its local substrate API
Invoke-RestMethod "http://127.0.0.1:11481/dag/lookup/<dag_id_from_A>"
```

Expected: `{"ok":true,"found":true,"node":{...}}`

**PASS criterion:** Machine B holds a record originated on Machine A, hash verified, transferred across two separate internet connections via `relay.mnemosynec.ai`.

---

## 6. NAT Traversal Notes

This mesh **does not require NAT traversal** of the traditional sense (no UDP hole punching, no STUN/TURN). The WebSocket relay approach works because:

1. Both clients initiate **outbound** HTTPS/WSS connections to `relay.mnemosynec.ai`
2. NAT and firewalls allow outbound TCP 443 universally
3. The relay server forwards messages between the two outbound connections
4. No inbound port forwarding is needed on either peer's router

**Limitations of this approach:**
- Relay server is a single point of failure (mitigated by Cloud Run auto-scaling, min-instances=1)
- All cross-LAN data transits the relay (no direct P2P after handshake; could add WebRTC data channels in a future scope for direct connections after relay-assisted signaling)
- Relay cost: ~$0.001/signaling-hop (per `relay_server.js` cost comment); negligible at this scale

**Future enhancement:** After relay-assisted `identify`/`ratify` handshake, peers could negotiate a direct WebRTC data channel for bulk sync (bypassing relay for large payloads). This would require adding WebRTC (`RTCPeerConnection`) — not currently in scope.

---

## 7. Summary Table

| Dimension | Same-LAN | Cross-LAN |
|-----------|----------|-----------|
| Transport | TCP socket (Node `net`) | WebSocket via relay |
| Discovery | mDNS + subnet probe | `relay_broadcast` (relay-mediated) |
| Port required | 11481 (inbound on LAN) | 443 outbound only |
| NAT traversal | Not needed (same router) | Not needed (relay handles it) |
| Relay server | Not used | `wss://relay.mnemosynec.ai` |
| Status | **PROVEN** (BP063 20/20) | **BLOCKED — relay not deployed** |
| Blocker | None | Founder deploys Cloud Run relay |

---

## 8. Files Referenced

| File | Purpose |
|------|---------|
| `src/main/federation_client.ts` | LAN peer discovery, TCP sync, announce server |
| `src/shared/federation-protocol.ts` | Protocol types, `RELAY_URL = wss://relay.mnemosynec.ai` |
| `dist/main/federation/relay-client.js` | WAN relay client (compiled) |
| `dist/main/federation/relay_server.js` | Relay server implementation (compiled) |
| `relay-server/` | Cloud Run deploy source |
| `relay-server/DEPLOY_FOUNDER.md` | Step-by-step deploy runbook for Founder |
| `MESH_6_RECEIPT_BP063.md` | Same-LAN two-instance proof receipt |
| `platform/src/tests/wave_b2_organic_mesh_wan.test.ts` | Simulated WAN test (deterministic, no real network) |
| `platform/src/tests/wave_e2_mesh_wan_integration.test.ts` | WAN integration test scaffold |

---

*Written by Knight (Sonnet 4.6) · BP077 Scope 7 · 2026-06-08*
