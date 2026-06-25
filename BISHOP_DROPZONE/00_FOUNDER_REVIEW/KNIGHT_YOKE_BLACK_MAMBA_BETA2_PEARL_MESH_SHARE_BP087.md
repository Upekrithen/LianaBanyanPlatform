# KNIGHT YOKE -- BLACK MAMBA BETA2 -- PEARL MESH SHARE -- BP087

## §0 Header

**Stream:** BLACK MAMBA beta2 -- Pearl substrate mesh-share (single-node to multi-peer)
**Session:** BP087
**Status at intake:** SINGLE-NODE only -- pearl_fetch in mesh_plow_dispatcher degrades to null if the pearl is not in local substrate; no cross-peer pearl resolution exists
**Brick Wall pre-authorized scope (verbatim):**
- New table: `pearl_share` (pearl_id PK, soccerball_sid, payload_b64, authored_at, last_synced_at, origin_peer_id)
- MIC-broadcast `pearl_sync` message type added alongside existing `pheromone_sync`
- Peer listener subscribes to pearl_sync and upserts into local pearl table
- mesh_plow_dispatcher pearl_fetch promotes graceful-null to attested-fetch: REST GET pearl_share by pearl_id, fan-out to 2 peers, fallback null only if no peer has it after 2-attempt fan-out
- Acceptance: 1 pearl emitted on M0, appears in pearl_share on all 5 peers within 10s, mesh_plow_dispatcher includes pearl_id in frame, receiver resolves pearl content

**Statutes binding this yoke:** §2 IMMUTABLES · §3 Sonnet 4.6 verbatim · §4 absolute paths only · §14 gadget-first before asking Founder · §15 Bishop-direct-Supabase (no SEG applies DB schema; SEGs ship .sql files only)

---

## §1 Context

BLACK MAMBA WAVE 1 (commit 80cd33a) shipped the Pearl substrate as a single-node primitive. The mesh_plow_dispatcher can reference a pearl_id in a dispatch frame, but if the pearl was authored on peer M0 and the dispatching peer is M2, pearl_fetch returns null silently because M2 has no local copy. This silent null is a latency hazard and a correctness risk: downstream SEGs receive a frame with a nil pearl context and proceed without flagging the gap.

The goal of this yoke is to make pearls mesh-native. Pearls authored on any peer are broadcast via a `pearl_sync` MIC-broadcast type (symmetric to the existing `pheromone_sync` path) so every peer maintains a local copy. When a pearl is not yet locally cached, mesh_plow_dispatcher performs an attested 2-attempt fan-out REST fetch from peer nodes before degrading to null, and the null degradation is logged explicitly rather than swallowed. When 1 pearl emitted on M0 appears on all 5 peers within 10 seconds and mesh_plow_dispatcher correctly resolves it on M3, beta2 flips GREEN.

---

## §2 Required SEG Fan-out

Knight: **use segs Sonnet 4.6 verbatim** for ALL implementation work. Do not implement inline. Fan out immediately.

**WAVE 1 -- three parallel SEGs:**

**SEG-A: pearl_share migration**
- Task: write migration file `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619120005_pearl_share.sql`
- Schema:
  ```sql
  CREATE TABLE IF NOT EXISTS pearl_share (
    pearl_id       TEXT PRIMARY KEY,
    soccerball_sid TEXT NOT NULL,
    payload_b64    TEXT NOT NULL,
    authored_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    origin_peer_id TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS pearl_share_origin ON pearl_share(origin_peer_id);
  CREATE INDEX IF NOT EXISTS pearl_share_synced ON pearl_share(last_synced_at DESC);
  ```
- Knight: Bishop will apply migrations directly via psql. Your SEGs do NOT apply DB schema, only ship the .sql file.
- No em-dashes. SQL only.

**SEG-B: pearl_sync MIC-broadcast type**
- Task: edit `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\mic-broadcast\index.ts`
- Add handling for message type `pearl_sync` alongside existing `pheromone_sync` handler
- pearl_sync payload: `{ pearl_id: string; soccerball_sid: string; payload_b64: string; authored_at: string; origin_peer_id: string }`
- On receive: upsert into `pearl_share` table setting `last_synced_at = NOW()`
- Broadcast fan-out: same relay pattern as pheromone_sync (all connected peers receive)
- No em-dashes. TypeScript strict.

**SEG-C: pearl_mesh_sync.ts -- emit side**
- Task: implement `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\pearl\pearl_mesh_sync.ts`
- Export `emitPearlSync(pearl: { pearl_id: string; soccerball_sid: string; payload_b64: string; origin_peer_id: string }): Promise<void>`
- Calls MIC-broadcast with message type `pearl_sync` and pearl payload
- Also upserts into local `pearl_share` table immediately (optimistic local write before broadcast)
- Export `fetchPearlFromMesh(pearl_id: string, peerEndpoints: string[]): Promise<string | null>`
  - Attempts GET `{peerEndpoint}/pearl_share/{pearl_id}` on up to 2 peers from peerEndpoints list
  - Returns payload_b64 on first success; returns null after 2 failures; logs each attempt
- No em-dashes. Absolute imports. TypeScript strict.

**WAVE 2 -- one integration SEG (after WAVE 1 complete):**

**SEG-D: mesh_plow_dispatcher attested-fetch upgrade**
- Task: locate `mesh_plow_dispatcher` in `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` (search for the pearl_fetch call site)
- Replace the current pearl_fetch null-degrade with:
  1. Attempt local substrate pearl lookup (existing)
  2. On null: call `fetchPearlFromMesh(pearl_id, activePeerEndpoints)` from `pearl_mesh_sync.ts`
  3. On mesh hit: log `// MAMBA-beta2: pearl resolved from mesh peer` and proceed
  4. On mesh miss after 2 attempts: log `// MAMBA-beta2: pearl null after attested 2-attempt fan-out -- pearl_id={pearl_id}` and set pearl context to null explicitly (no silent drop)
- Confirm pearl_id is included in the outbound dispatch frame metadata regardless of resolution result
- No em-dashes.

---

## §3 File Targets

All paths absolute. Knight confirms these exist or creates them.

| Action | Absolute Path |
|--------|--------------|
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619120005_pearl_share.sql` |
| EDIT | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\mic-broadcast\index.ts` |
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\pearl\pearl_mesh_sync.ts` |
| EDIT (attested-fetch) | `mesh_plow_dispatcher` file under `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` (SEG-D locates exact file) |

---

## §4 Acceptance Gates

**gadget-first before asking Founder.** Run every gate via gadget before reporting back.

**Gate 1 -- pearl_share table exists and is empty at baseline:**
```sql
SELECT COUNT(*) FROM pearl_share;
```
Expected: 0 (after migration applied by Bishop)

**Gate 2 -- pearl emitted on M0 propagates to all peers within 10s:**
```
# On M0: emit 1 pearl via emitPearlSync
# Wait 10 seconds
# On M1, M2, M3, M4: query pearl_share
```
```sql
SELECT origin_peer_id, COUNT(*) FROM pearl_share GROUP BY origin_peer_id;
```
Expected: 1 row per M0 emission visible on all 5 peers

**Gate 3 -- mesh_plow_dispatcher includes pearl_id in dispatch frame:**
```
# Fire a dispatch frame from M2 that references the pearl emitted on M0
# Capture outbound frame hex from wire log
# Assert pearl_id field is present in frame metadata (non-null)
```

**Gate 4 -- receiver resolves pearl content from mesh (4-curl style):**
```
curl -X GET https://relay.lianabanyan.com/pearl_share/{pearl_id_from_gate_2}
```
Expected: 200, payload_b64 field non-null

```
curl -X GET https://relay.lianabanyan.com/pearl_share/nonexistent_pearl_id_test
```
Expected: 404 or null payload (graceful degrade)

**Gate 5 -- attested-fetch log line fires on mesh-resident pearl:**
```
# On M3: request dispatch frame referencing pearl authored on M0 (not locally cached on M3)
# Assert log contains "MAMBA-beta2: pearl resolved from mesh peer"
# Assert NO "MAMBA-beta2: pearl null after attested" log line
```

**Gate 6 -- null-degrade logged (not silent) for missing pearl:**
```
# Request dispatch frame referencing a pearl_id that exists nowhere
# Assert log contains "MAMBA-beta2: pearl null after attested 2-attempt fan-out"
# Assert frame continues processing (no crash, just logged null)
```

**Gate 7 -- beta2 flip check:**
All 6 gates pass. Knight logs MAMBA-beta2 GREEN in return template.

---

## §5 Drift Surface Protocol (BP053 inline)

If SEG-B and SEG-C produce conflicting upsert patterns (e.g. different payload field names), Knight flags the conflict before merging and picks the schema from SEG-A (the migration is authoritative).

If SEG-D cannot locate the mesh_plow_dispatcher pearl_fetch call site, SEG reports the search listing verbatim and Knight escalates to Founder. Knight does NOT invent a file path.

If gate 2 shows propagation taking longer than 10 seconds on the LAN-as-WAN topology, Knight reports the actual observed latency verbatim and marks gate 2 AMBER, not GREEN.

No estimates in return template. Empirical values only.

---

## §6 Composition with Prior Canons

- `canon_persistent_active_memory_crown_jewel_bp085` -- Pearls are a memory primitive; mesh-share makes them substrate-native across all peers
- `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` -- all 5 peers routed via relay.lianabanyan.com; pearl propagation must traverse WAN roundtrip, not LAN shortcut
- `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086` -- pearl_sync broadcasts flow through MIC; must be within signed broadcast frame once beta3 is GREEN (composition point for after this yoke)
- `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085` -- SEGs are Callable Substrate Workers dispatched by Knight
- `canon_every_knight_dispatch_and_paste_prompt_must_say_use_segs_bp063` -- use segs Sonnet 4.6 verbatim is mandatory per this canon

---

## §7 Return Template

Knight returns this block filled with empirical values only. No estimates.

```
MAMBA-beta2 Pearl Mesh Share -- BP087 RETURN RECEIPT

Gate 1 pearl_share table baseline:      [ GREEN / AMBER / RED ] -- [observed row count: N]
Gate 2 propagation to all 5 peers:      [ GREEN / AMBER / RED ] -- [observed latency: Ns · peers confirmed: N/5]
Gate 3 pearl_id in dispatch frame:      [ GREEN / AMBER / RED ] -- [observed: present Y/N]
Gate 4 REST resolve from relay:         [ GREEN / AMBER / RED ] -- [observed HTTP status: N]
Gate 5 attested-fetch log GREEN path:   [ GREEN / AMBER / RED ] -- [observed log line verbatim]
Gate 6 null-degrade logged not silent:  [ GREEN / AMBER / RED ] -- [observed log line verbatim]
Gate 7 beta2 status:                    [ GREEN / AMBER / RED ]

Files created:
  [list with absolute paths + line counts]

Files edited:
  [list with absolute paths + diff summary]

Drift surface events:
  [any conflicts or escalations verbatim, or NONE]

Commit hash:
  [git commit hash after Knight commits, or PENDING]

MAMBA-beta2: [ GREEN / AMBER / RED ]
```

---

## §8 Statutes Binding Header (echoed)

- **§2 IMMUTABLES:** Do not alter foundational substrate primitives outside scoped targets above.
- **§3 Sonnet 4.6 verbatim:** All SEG dispatches use Sonnet 4.6 verbatim. No model substitution.
- **§4 Absolute paths:** Every file reference in SEG prompts uses absolute paths. No relative paths.
- **§14 gadget-first before asking Founder:** Run every acceptance gate via gadget. Report results empirically.
- **§15 Bishop-direct-Supabase:** Knight: Bishop will apply migrations directly via psql. Your SEGs do NOT apply DB schema. SEGs ship the .sql file only.
