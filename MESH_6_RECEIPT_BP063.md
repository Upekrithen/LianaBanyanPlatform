# MESH-6 Frame-Mesh Build Receipt — v0.1.21
**test_run_ts:** 2026-05-30T14:40:00Z
**version:** 0.1.21 (package.json corrected from stale 0.1.17)
**commit_mesh6:** d6a7caab7c28ff771c5074cfaf1943bcf3e4da21
**commit_ci:** c41ccad
**commit_v0.1.21_canon:** (this session — see git log)
**spec_source:** Asteroid-ProofVault/MESH_6_BUILD_SPEC_BP063.md
**gate:** OG-027 PASS · two-instance receipt PASS

---

## CANONICAL TREE DECISION

**LBP is canonical.** (`C:\Users\Administrator\Documents\LianaBanyanPlatform`)

- LBP has MESH-6 (7 pieces), git history, all infrastructure
- `mnemosyne/` tree (v0.1.20) was a parallel fork that captured launch-fix + SSPL sweep
- SSPL sweep now ported into LBP (NOTICE, package.json, source files — see below)
- v0.1.21 builds from LBP. No work goes to mnemosyne/ going forward.

---

## VERSION STAMP (FIXED)

`package.json` was stuck at "0.1.17" despite commit messages claiming v0.1.21.
**Fixed:** version → "0.1.21", description → "SSPL · Pledge #2260"
`app.getVersion()` now returns "0.1.21". Window title: "Mnemosyne v0.1.21".

---

## SSPL SWEEP (ported from mnemosyne/ v0.1.20 into LBP)

| File | Change |
|------|--------|
| `package.json` | version + description |
| `NOTICE` | AGPL-3.0 → SSPL-1.0 + Cooperative Defensive Patent Pledge #2260 |
| `Mnemosyne.bat` | footer text |
| `assets/installer.nsh` | DetailPrint text |
| `scripts/generate_notcents_font.py` | comment + copyright field |
| `src/main/agent_plugins.ts` | REQUIRED_LICENSE, comments |
| `src/main/marketplace/marketplace_registry.ts` | license type fields |
| `src/main/substrate_api.ts` | SAGA 6 comment |
| `src/renderer/components/AMPLIFYDashboard.tsx` | footer line |
| `src/renderer/components/FrameModeIndicator.tsx` | comment |
| `src/renderer/components/ModeSelectorPopover.tsx` | comment |
| `src/renderer/components/NotCentsGlyph.tsx` | comment |

---

## MESH-6 OPTION-B PREREQUISITES

Changes made this session to enable two-instance testing on one host:

| Change | File | Effect |
|--------|------|--------|
| `SUBSTRATE_PORT` env var | `src/main/substrate_api.ts` | Instance B can bind :11482 |
| `PEER_ANNOUNCE_PORT` env var | `src/main/federation_client.ts` | Instance B announces on :11483 |
| `LAN_ANNOUNCE_PORT` env var | `src/shared/federation-protocol.ts` | B's mDNS broadcast says :11483 (not hardcoded :11481) |
| `MNEMOSYNE_PROD_LAUNCH=1` | `src/main/index.ts` | IS_DEV=false → loadFile(dist/renderer) without packaging |
| CSP updated | `src/main/index.ts` | CSP uses `_SUBSTRATE_PORT` and `_ANNOUNCE_PORT` templates |
| `POST /dag/emit` endpoint | `src/main/substrate_api.ts` | HTTP surface to emit DAG node + trigger pointer_advance |
| `GET /dag/lookup/:sid` endpoint | `src/main/substrate_api.ts` | HTTP surface to verify replication |
| `POST /dag/fetch_from_peer` endpoint | `src/main/substrate_api.ts` | HTTP surface to manually drive TCP fetch + hash-verify |
| `setDagEmitMeshHook` | `src/main/substrate_api.ts` | Wires /dag/emit → _emitPointerAdvanceToPeers |
| `setFetchSidFromPeerHook` | `src/main/substrate_api.ts` | Wires /dag/fetch_from_peer → _fetchSidViaTCP |
| **Blocker B1 fix** | `src/main/federation_client.ts` | `_handlePeerConnection` now responds to `sid_fetch_request` (was respond-then-end; was silently ignoring it before fix) |

---

## BUILD RECEIPT — 7 PIECES (from previous session, carried forward)

| Piece | File(s) | Status |
|-------|---------|--------|
| P1 — FedMsgType + payloads | `src/shared/federation-protocol.ts` | LANDED |
| P2 — RelayClient inboundHook | `src/main/federation/relay-client.ts` | LANDED |
| P3 — Pointer-advance hook | `src/main/caithedral_tools_ipc.ts` | LANDED |
| P4 — Invite/accept/leave IPC | `src/main/index.ts`, `src/main/preload.ts` | LANDED |
| P5 — mDNS peer merge | `src/main/federation_client.ts` | LANDED |
| P6 — Resolve-from-peer UI | `src/renderer/components/CaithedralCoreTab.tsx` | LANDED |
| P7 — Stale Cloudflare text | `src/renderer/components/CaithedralCoreTab.tsx` | LANDED |

---

## RENDERER SMOKE-LAUNCH RECEIPT (OG-027 gate — STRENGTHENED)

**Gate:** PASS
**Mode:** `MNEMOSYNE_PROD_LAUNCH=1` → `IS_DEV=false` → `loadFile(dist/renderer/index.html)`
**NOT blank window:** No `ERR_CONNECTION_REFUSED` for :5173 in Instance A log
**What was on screen:** Two Electron windows rendered. Instance A (primary) showed Mnemosyne UI with "A cooperative platform where creators m..." visible — the Liana Banyan home/dashboard rendering real content from the built renderer bundle. Version stamp in title: "Mnemosyne v0.1.21".
**tsc main --noEmit:** exit 0 ✓
**npm run build:** exit 0 · amplify-computer@0.1.21 ✓

**Instance A startup log:**
```
[LB Frame port-guard] :11480 free — proceeding with bind.
[SubstrateIndex] Loaded 1461 records
[SubstrateAPI] Listening on http://0.0.0.0:11480 — 1461 records indexed
[Federation] Peer announce server on :11481
[Federation] Started. Online=true, peers=0
[PeerDiscovery] LAN multicast listener started
[RelayClient] Connected to relay
```

---

## TWO-INSTANCE RECEIPT — MESH-6 OPTION-B

**Overall result:** PASS
**Instances:** 2 (same physical host · Windows)
**A:** SUBSTRATE_PORT=11480 · PEER_ANNOUNCE_PORT=11481
**B:** SUBSTRATE_PORT=11482 · PEER_ANNOUNCE_PORT=11483 · --user-data-dir=C:\temp\mnemosyne-B-data
**Discovery path:** LAN mDNS (224.0.0.251:5354) — both instances discovered each other

---

### STEP 1 — EMIT on A

```
POST http://127.0.0.1:11480/dag/emit
Body: {
  "pearls": ["mesh6-receipt-walk","resolve-replicate-pointer-advance","2026-05-30T14:35:00Z","option-b-single-host"],
  "bindings": {"test":"mesh6-b1-fix","version":"0.1.21","host":"127.0.0.1"}
}

Response: {"ok":true,"sid":"97ef95b5d803f9eca0c1c99a3151c619",...}
```

**Result:** PASS
**SID:** `97ef95b5d803f9eca0c1c99a3151c619`
**A log:** `[SubstrateAPI/dag/emit] sid=97ef95b5d803f9eca0c1c99a3151c619 pearls=[...]`

---

### STEP 2 — POINTER-ADVANCE (A → B)

**A discovered B via mDNS:** `[PeerDiscovery] LAN peer discovered: d64cce1c0a984181 at 192.168.86.30`
A's `_emitPointerAdvanceToPeers` broadcast `pointer_advance` to B.

**B received it:**
```
[PeerDiscovery] LAN peer discovered: 8ca7dc10ab2240fa at 192.168.86.30
[MESH-6] pointer_advance received: null → 97ef95b5d803f9eca0c1c99a3151c619 from 8ca7dc10ab2240fa
```

**Result:** PASS
**pointer_old_dag_id:** null
**pointer_new_dag_id:** `97ef95b5d803f9eca0c1c99a3151c619`
**emitter_peer_id:** `8ca7dc10ab2240fa`

---

### STEP 3 — RESOLVE (B fetches SID from A · TCP · hash-verified)

B's `_autoFetchOnPointerAdvance` called `_fetchSidViaTCP` → A's TCP announce server (:11481)

**A log:** `[FederationClient] sid_fetch_request: dag_id=97ef95b5d803f9eca0c1c99a3151c619 found=true — served to 192.168.86.30`

**Explicit receipt via /dag/fetch_from_peer:**
```
POST http://127.0.0.1:11482/dag/fetch_from_peer
Body: {"address":"127.0.0.1","port":11481,"dag_id":"97ef95b5d803f9eca0c1c99a3151c619"}

Response: {
  "ok": true,
  "hash_verified": true,
  "dag_id": "97ef95b5d803f9eca0c1c99a3151c619",
  "node": {
    "pearls": ["mesh6-receipt-walk","resolve-replicate-pointer-advance","2026-05-30T14:35:00Z","option-b-single-host"],
    "bindings": {"test":"mesh6-b1-fix","version":"0.1.21","host":"127.0.0.1"}
  }
}
```

**Result:** PASS
**ok:** true
**hash_verified:** true
**SID matches recomputed hash:** ✓ (`_recomputeDagId(node) === "97ef95b5d803f9eca0c1c99a3151c619"`)

---

### STEP 4 — REPLICATE VERIFY (B stored locally)

**B log:** `[MESH-6] pointer_advance auto-replicated dag_id=97ef95b5d803f9eca0c1c99a3151c619 hash_verified=true`

**Lookup on B post-replication:**
```
GET http://127.0.0.1:11482/dag/lookup/97ef95b5d803f9eca0c1c99a3151c619

Response: {
  "ok": true,
  "found": true,
  "sid": "97ef95b5d803f9eca0c1c99a3151c619",
  "node": { "pearls": ["mesh6-receipt-walk",...], "bindings": {...} }
}
```

**Result:** PASS
**found:** true
**B's local crystal has the node:** ✓

---

## HASH-VERIFY DESIGN (verify-not-trust)

`_recomputeDagId` in `src/main/index.ts`:
```typescript
const payload = JSON.stringify([
  [...node.pearls].sort(),
  sortedJson(node.bindings),
  sortedJson(node.faces),
]);
return createHash('sha256').update(payload).digest('hex').slice(0, 32);
```

Matches `contentAddress()` in `caithedral-core/src/tools/dag_soccerball_tools.ts`. A received node is ONLY written to local DAG_CRYSTAL if `_recomputeDagId(node) === dag_id`. On mismatch: rejected with `'SID hash mismatch — rejected'`.

**B verified `97ef95b5d803f9eca0c1c99a3151c619` == recomputed hash → PASS**

---

## CI FIX RECEIPT (commit c41ccad)

| Fix | Result |
|-----|--------|
| `submodules: recursive` on checkout | PaperMod theme populated on runner |
| `peaceiris/actions-hugo@v3` + `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` | Node24 safe ahead of June 16 deadline |
| `git rm --cached "Escape Velocity Site"` | Ghost submodule (8a67d13d) removed from index |

FIREBASE_TOKEN secret: not verified this session — requires Actions run trigger.

---

*Receipt authored by Knight (Sonnet 4.6 · Cursor IDE) · BP063 · 2026-05-30T14:40:00Z*
*VERIFIED: resolve→replicate→pointer-advance PASS · hash_verified=true · sid=97ef95b5d803f9eca0c1c99a3151c619*
*FOR THE KEEP. ⚓🪙 Đ*
