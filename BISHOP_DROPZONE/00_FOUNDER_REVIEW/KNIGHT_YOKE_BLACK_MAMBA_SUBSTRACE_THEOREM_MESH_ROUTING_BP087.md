# KNIGHT YOKE -- BLACK MAMBA SUBSTRACE THEOREM MESH ROUTING -- BP087

## §0 Header

**Stream:** BLACK MAMBA Row 3 of 8-capability matrix -- Substrace Theorem mesh-routing (re-weave dispatch)
**Session:** BP087
**Status at intake:** WAKE-CLASS ONLY -- wake dispatch exists on a single peer; no cross-peer re-weave manifest routing; any peer cannot currently wake any other peer via mesh with re-woven substrate state
**Brick Wall pre-authorized scope (verbatim):**
- New Edge Function `substrace-wake` OR new endpoint `/substrace/wake` on existing `wan-relay-route`
- Re-weave manifest: ordered list of (pearl_id | eblet_slug | substrate-address) the target peer fetches before responding
- Target peer receives wake, fetches all re-weave manifest items, acks with `substrace_wake_complete` event
- Acceptance: M0 wakes M2 via mesh-routed substrace; M2 re-weaves 3 pearls + 2 eblets; acks within 15 seconds
- New wake-router module in src/main/substrace/
- Migration for substrace_wake_routes table if route persistence is needed

**Statutes binding this yoke:** §2 IMMUTABLES · §3 Sonnet 4.6 verbatim · §4 absolute paths only · §14 gadget-first before asking Founder · §15 Bishop-direct-Supabase (no SEG applies DB schema; SEGs ship .sql files only)

---

## §1 Context

The Substrace Theorem (§7 canon) establishes that any peer in the mesh can wake any other peer with re-woven substrate state: the waking peer sends a manifest of content-addressed substrate items (pearls, eblets, substrate addresses) and the target peer fetches those items before it begins responding to the dispatch. This is Row 3 of the 8-capability matrix and is currently unimplemented. The existing wake-class dispatch on `wan-relay-route` only wakes a peer to a null-context state; there is no manifest, no re-weave fetch sequence, and no `substrace_wake_complete` acknowledgment event.

The goal of this yoke is to wire the full re-weave dispatch path. A new Edge Function `substrace-wake` (or a new route on `wan-relay-route` if that is architecturally cleaner; SEG-A determines which based on the existing wan-relay-route code structure) accepts a wake request from any peer with a re-weave manifest. The target peer receives the manifest, fetches each item in order from the substrate, and emits a `substrace_wake_complete` event back through the relay with the list of resolved items. The calling peer can then fire its intended dispatch knowing the target has the necessary context loaded. When M0 successfully wakes M2 with a 5-item manifest (3 pearls + 2 eblets) and receives `substrace_wake_complete` within 15 seconds, Row 3 flips GREEN.

---

## §2 Required SEG Fan-out

Knight: **use segs Sonnet 4.6 verbatim** for ALL implementation work. Do not implement inline. Fan out immediately.

**WAVE 1 -- three parallel SEGs:**

**SEG-A: Architecture decision + Edge Function substrace-wake scaffold**
- Task: read `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\wan-relay-route\index.ts` and assess whether adding `/substrace/wake` as a new route inside `wan-relay-route` is cleaner, or whether a standalone `substrace-wake` Edge Function is preferable given existing routing patterns
- Report the decision (one paragraph, empirical code evidence) and then implement whichever is cleaner
- If new Edge Function: create `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\substrace-wake\index.ts`
- If new route: edit `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\wan-relay-route\index.ts`
- Endpoint accepts POST with body: `{ target_peer_id: string; origin_peer_id: string; manifest: Array<{ type: 'pearl_id' | 'eblet_slug' | 'substrate_address'; ref: string }> }`
- Endpoint forwards wake message to target peer via relay channel
- No em-dashes. TypeScript strict.

**SEG-B: substrace_wake_routes migration**
- Task: write migration `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619120006_substrace_wake_routes.sql`
- Schema:
  ```sql
  CREATE TABLE IF NOT EXISTS substrace_wake_routes (
    wake_id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    origin_peer_id   TEXT NOT NULL,
    target_peer_id   TEXT NOT NULL,
    manifest         JSONB NOT NULL,
    dispatched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ack_received_at  TIMESTAMPTZ,
    ack_status       TEXT CHECK (ack_status IN ('pending','complete','timeout','failed')) DEFAULT 'pending',
    resolved_items   JSONB
  );
  CREATE INDEX IF NOT EXISTS swrk_target ON substrace_wake_routes(target_peer_id);
  CREATE INDEX IF NOT EXISTS swrk_status ON substrace_wake_routes(ack_status);
  CREATE INDEX IF NOT EXISTS swrk_dispatched ON substrace_wake_routes(dispatched_at DESC);
  ```
- Knight: Bishop will apply migrations directly via psql. Your SEGs do NOT apply DB schema, only ship the .sql file.
- No em-dashes. SQL only.

**SEG-C: wake_router.ts -- client-side wake dispatch + manifest fetch handler**
- Task: implement `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\substrace\wake_router.ts`
- Export `dispatchSubstraceWake(opts: { target_peer_id: string; manifest: ManifestItem[] }): Promise<{ wake_id: string }>`:
  - POST to substrace-wake endpoint (or wan-relay-route /substrace/wake per SEG-A decision)
  - Inserts row into substrace_wake_routes with status 'pending'
  - Returns wake_id
- Export `handleSubstraceWakeReceive(manifest: ManifestItem[]): Promise<{ resolved_items: ResolvedItem[] }>`:
  - For each manifest item: fetch pearl from pearl_share if type='pearl_id', fetch eblet from eblet table if type='eblet_slug', resolve substrate address if type='substrate_address'
  - Returns ordered list of resolved items (null entries for items not found, logged explicitly)
  - After all items resolved: emit `substrace_wake_complete` event via MIC-broadcast with wake_id + resolved_items summary
  - Updates substrace_wake_routes row: ack_received_at=NOW(), ack_status='complete', resolved_items=JSON
- ManifestItem and ResolvedItem TypeScript interfaces defined in same file
- No em-dashes. Absolute imports. TypeScript strict.

**WAVE 2 -- one integration SEG (after WAVE 1 complete):**

**SEG-D: Wire wake_router into main process + substrace_wake_complete listener**
- Task: locate the main process entry or peer orchestrator in `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` that handles inbound relay messages
- Wire: when a `substrace_wake` message arrives, call `handleSubstraceWakeReceive(manifest)`
- Wire: when a `substrace_wake_complete` event arrives, update substrace_wake_routes row to ack_status='complete' and log `// MAMBA-Row3: substrace_wake_complete received wake_id={wake_id} items={N}`
- Also expose a gadget-callable test function `testSubstraceWake(target_peer_id: string)` that fires a hardcoded 5-item manifest (3 pearl_ids from local pearl_share + 2 known eblet_slugs) for acceptance gate testing
- No em-dashes.

---

## §3 File Targets

All paths absolute. Knight confirms these exist or creates them.

| Action | Absolute Path |
|--------|--------------|
| CREATE or EDIT (SEG-A decides) | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\substrace-wake\index.ts` (new) OR `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\functions\wan-relay-route\index.ts` (edit) |
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619120006_substrace_wake_routes.sql` |
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\substrace\wake_router.ts` |
| EDIT (inbound handler) | Main process relay message handler under `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` (SEG-D locates exact file) |

---

## §4 Acceptance Gates

**gadget-first before asking Founder.** Run every gate via gadget before reporting back.

**Gate 1 -- substrace-wake endpoint responds (4-curl style):**
```
curl -X POST https://relay.lianabanyan.com/functions/v1/substrace-wake \
  -H "Content-Type: application/json" \
  -d '{"target_peer_id":"M2","origin_peer_id":"M0","manifest":[{"type":"pearl_id","ref":"test_pearl_001"}]}'
```
Expected: 200 with `{ "wake_id": "<uuid>" }`

```
curl -X POST https://relay.lianabanyan.com/functions/v1/substrace-wake \
  -H "Content-Type: application/json" \
  -d '{"target_peer_id":"nonexistent","origin_peer_id":"M0","manifest":[]}'
```
Expected: 404 or error JSON (not a crash)

**Gate 2 -- substrace_wake_routes table baseline:**
```sql
SELECT COUNT(*) FROM substrace_wake_routes WHERE ack_status = 'pending';
```
Expected: 0 at baseline before any fire

**Gate 3 -- M0 wakes M2 with 5-item manifest:**
```
# On M0: call testSubstraceWake('M2')
# Observe substrace_wake_routes row inserted with ack_status='pending'
```
```sql
SELECT wake_id, ack_status, dispatched_at FROM substrace_wake_routes
ORDER BY dispatched_at DESC LIMIT 1;
```
Expected: 1 row, ack_status='pending' immediately after dispatch

**Gate 4 -- M2 re-weaves manifest and acks within 15s:**
```sql
-- Poll every 3s up to 15s
SELECT wake_id, ack_status, ack_received_at, resolved_items
FROM substrace_wake_routes
WHERE ack_status = 'complete'
ORDER BY ack_received_at DESC LIMIT 1;
```
Expected: ack_status='complete', resolved_items JSON with 5 entries, ack_received_at within 15s of dispatched_at

**Gate 5 -- log line present on M2:**
```
# On M2 log: assert "MAMBA-Row3: substrace_wake_complete received wake_id=... items=5"
```
Expected: log line verbatim with items=5

**Gate 6 -- graceful handling of unresolvable manifest item:**
```
# Fire testSubstraceWake with 1 manifest item referencing a pearl_id that does not exist anywhere
# Assert resolved_items contains 1 entry with null value (not a crash)
# Assert ack_status still becomes 'complete' (partial resolution is valid)
```

**Gate 7 -- Row 3 flip check:**
All 6 gates pass. Knight logs Row 3 GREEN in return template.

---

## §5 Drift Surface Protocol (BP053 inline)

If SEG-A determines that a new route inside `wan-relay-route` is cleaner and then SEG-C assumes a standalone Edge Function URL, Knight resolves the URL mismatch before committing SEG-C. The SEG-A architecture decision is authoritative for all downstream SEGs.

If SEG-C cannot locate a pearl or eblet during `handleSubstraceWakeReceive`, the null is logged explicitly (not silently dropped) and the resolved_items entry for that slot is `null`. Knight does NOT discard the null from the return.

If gate 4 shows ack latency greater than 15 seconds, Knight reports the actual observed latency verbatim and marks gate 4 AMBER. Knight does NOT mark Row 3 GREEN unless gate 4 passes within 15 seconds.

No estimates in return template. Empirical values only.

---

## §6 Composition with Prior Canons

- `canon_substrace_weave` (§7 SUBSTRACE THEOREM) -- this yoke is the direct implementation of the cross-peer re-weave dispatch primitive that §7 defines
- `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` -- M0-to-M2 wake must route via relay.lianabanyan.com WAN path, not LAN shortcut; 15s gate accounts for WAN roundtrip
- `canon_persistent_active_memory_crown_jewel_bp085` -- re-weave manifest fetches pearls and eblets, composing with the memory layer
- `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086` -- substrace_wake_complete event flows through MIC-broadcast; inherits signing requirement once beta3 is GREEN
- `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085` -- SEGs are Callable Substrate Workers dispatched by Knight
- `canon_every_knight_dispatch_and_paste_prompt_must_say_use_segs_bp063` -- use segs Sonnet 4.6 verbatim is mandatory per this canon

---

## §7 Return Template

Knight returns this block filled with empirical values only. No estimates.

```
MAMBA Row 3 Substrace Theorem Mesh Routing -- BP087 RETURN RECEIPT

SEG-A architecture decision:              [ new Edge Function / new route in wan-relay-route ]
Gate 1 endpoint responds:                 [ GREEN / AMBER / RED ] -- [observed HTTP status: N]
Gate 2 substrace_wake_routes baseline:    [ GREEN / AMBER / RED ] -- [observed pending count: N]
Gate 3 M0 wakes M2 row inserted:          [ GREEN / AMBER / RED ] -- [observed wake_id: xxx]
Gate 4 M2 acks within 15s:               [ GREEN / AMBER / RED ] -- [observed latency: Ns · resolved_items count: N]
Gate 5 log line on M2:                    [ GREEN / AMBER / RED ] -- [observed log verbatim]
Gate 6 null manifest item graceful:       [ GREEN / AMBER / RED ] -- [observed resolved_items: verbatim]
Gate 7 Row 3 status:                      [ GREEN / AMBER / RED ]

Files created:
  [list with absolute paths + line counts]

Files edited:
  [list with absolute paths + diff summary]

Drift surface events:
  [any conflicts or escalations verbatim, or NONE]

Commit hash:
  [git commit hash after Knight commits, or PENDING]

MAMBA Row 3 Substrace Theorem Mesh Routing: [ GREEN / AMBER / RED ]
```

---

## §8 Statutes Binding Header (echoed)

- **§2 IMMUTABLES:** Do not alter foundational substrate primitives outside scoped targets above.
- **§3 Sonnet 4.6 verbatim:** All SEG dispatches use Sonnet 4.6 verbatim. No model substitution.
- **§4 Absolute paths:** Every file reference in SEG prompts uses absolute paths. No relative paths.
- **§14 gadget-first before asking Founder:** Run every acceptance gate via gadget. Report results empirically.
- **§15 Bishop-direct-Supabase:** Knight: Bishop will apply migrations directly via psql. Your SEGs do NOT apply DB schema. SEGs ship the .sql file only.
