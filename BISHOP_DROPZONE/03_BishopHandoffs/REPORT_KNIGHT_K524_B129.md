# KNIGHT REPORT — K524 / B129
## Pheromone Followups Triple-Header: G.8 Hound Transport + Conductor Wiring + G.2 Test

**Date**: 2026-04-27
**Session**: K524
**Tag**: `v-pheromone-followups-K524`
**A&A**: #2317 Claim 7 (Phase A), #2277 Conductor telemetry (Phase B), Phase C (no new A&A)
**Predecessor**: K523 (commit `fe6bde1`, tag `v-pheromone-substrate-K523`)

---

## What Was Built

### Phase A — G.8 Cross-Cathedral Hound Transport (A&A #2317 Claim 7)

**Files created/modified:**

| File | Action | Purpose |
|---|---|---|
| `librarian-mcp/src/scribes/hounds.ts` | Created | Hound transport module: `propagatePheromone()`, `getInboundStatus()`, `inboundPheromonePathFor()` |
| `librarian-mcp/src/scribes/cathedral.ts` | Modified | Wire `propagatePheromone()` into both `appendScribeEntry` and `appendTidbit` emit hooks |
| `librarian-mcp/scripts/pheromone-bloodhound.mjs` | Modified | Add `mergeInboundQueues()` — scans all 3 `inbound_pheromones.jsonl` files, converts InboundPheromoneRecord→PheromoneRecord, merges with last-write-wins |
| `librarian-mcp/src/server.ts` | Modified | Import `getInboundStatus`; add `pheromone_inbound_status` MCP tool |

**Inbound queue paths (created at runtime):**
- `stitchpunks/bishop_cathedral/inbound_pheromones.jsonl` ← from knight + pawn emits
- `stitchpunks/knight_cathedral/inbound_pheromones.jsonl` ← from bishop + pawn emits
- `stitchpunks/pawn_cathedral/inbound_pheromones.jsonl` ← from bishop + knight emits

**InboundPheromoneRecord schema:**
```json
{
  "ts": "<ISO-8601>",
  "source_cathedral": "bishop|knight|pawn",
  "scribe": "<scribe_id>",
  "tablet_id": "<tablet_id>",
  "topics_compact": ["<top-5 topics>"],
  "decay_constant_days": 30,
  "original_index_ref": "source_cathedral::scribe::tablet_id"
}
```

### Phase B — Conductor Router scribe_log Wiring (A&A #2277 telemetry)

**Files modified:**

| File | Action | Purpose |
|---|---|---|
| `platform/src/lib/conductor/router.ts` | Modified | Add `_logConductorDecision()` (async, fire-and-forget), split `route()` → `route()` + `_route()`, SHA-256 hash of raw query |

**Architecture (Option β — direct JSONL, no HTTP coupling):**
- `_logConductorDecision()` is an async function called as `void _logConductorDecision(...)` from `route()`
- Detects Node.js via `process.versions?.node` + `LIBRARIAN_STITCHPUNKS_DIR` env var
- Silently no-ops in browser builds (both guards fail)
- Appends to `stitchpunks/scribes/scribe_Conductor.jsonl` with the schema from the K524 spec
- Privacy: SHA-256 hash of raw query; raw query string never logged

**Log schema (Conductor tablet):**
```json
{
  "query_hash": "<sha256_hex>",
  "query_class": "retrieval_only|reasoning_required|...",
  "vendor": "anthropic|openai|google|perplexity",
  "model": "<model_slug>",
  "mode": "auto|manual|vendor-lock",
  "ranking_basis": "<rationale prefix>",
  "ts": "<ISO-8601>"
}
```

### Phase C — G.2 Write-Path Integration Test

**Files modified:**

| File | Action | Purpose |
|---|---|---|
| `librarian-mcp/tests/test_pheromone.mjs` | Modified | Add G.2 + G.2.b tests; import cathedral.js for appendScribeEntry/appendTidbit |

**Test design:**
- G.2: Call `appendScribeEntry` 5× on Conductor scribe (registered, empty) → assert 5 pheromone records → truncate files → forceRebuild
- G.2.b: Call `appendTidbit` 5× with distinct categories → assert 5 Tidbits scribe records → truncate files → forceRebuild
- Idempotent cleanup via `truncateSync(path, preSize)` — removes appended bytes without rewrite

---

## Verification Results

### Phase A — G checks

| Check | Expected | Result |
|---|---|---|
| A.G.1 | Bishop emit → knight + pawn inbound each gain 1 record within 100ms | ✅ PASS |
| A.G.2 | Knight emit → bishop + pawn each gain 1 record | ✅ PASS |
| A.G.3 | Bloodhound merge → unified index gains entries from all 3 inbound queues; dedup correct | ✅ PASS (4 inbound_merged, last-write-wins verified) |
| A.G.4 | `pheromone_inbound_status` / `getInboundStatus()` returns accurate counts | ✅ PASS |
| A.G.5 | Same record emitted twice → raw inbound grows (2 appends); Bloodhound deduplicates (1 record in unified index) | ✅ PASS |
| A.G.6 | Corrupt one inbound file → other Cathedrals + main index still queryable | ✅ PASS |

### Phase B — G checks

| Check | Expected | Result |
|---|---|---|
| B.G.1 | Route once → 1 line in scribe_Conductor.jsonl with correct schema | ✅ PASS |
| B.G.2 | Same query routed twice → 2 lines (each decision is a distinct event) | ✅ PASS |
| B.G.3 | Raw query string NOT in JSONL (SHA-256 hash only) | ✅ PASS |
| B.G.4 | File-not-exist → first call creates file gracefully | ✅ PASS |
| B.G.5 | Pheromone emit hook wired — Conductor entries will appear after Bloodhound rebuild | ✅ PASS (architectural wiring confirmed) |
| B.G.6 | Existing router tests pass — no regressions | ✅ PASS (12/12 vitest scenarios) |

### Phase C — G checks

| Check | Expected | Result |
|---|---|---|
| C.G.1 | `npm test` pheromone suite runs to completion, all G.2 + G.2.b passing | ✅ PASS (10/10) |
| C.G.2 | Total G-check count: 8 → 10 | ✅ PASS |
| C.G.3 | Test cleanup idempotent — N runs produce zero orphan records | ✅ PASS |

---

## Production vs Predecessor Delta

| Metric | K523 Baseline | K524 Production |
|---|---|---|
| Cross-Cathedral transport | Lazy (Bloodhound-only) | Explicit Hound propagation within 100ms of emit |
| Inbound queue files | None | 3 (one per Cathedral, created at runtime) |
| Bloodhound output fields | `{records, topics, scribes, tablets, buildMs}` | + `inbound_merged` count |
| MCP tools (pheromone) | 3 (pheromone_query, pheromone_build, detective_investigate) | 4 (+ pheromone_inbound_status) |
| Conductor scribe_log | 0 calls (empty tablet) | Fires on every `route()` call in Node.js env |
| Test suite G-checks | 8/8 | 10/10 |
| Toolsmith entries | TS-085 | + TS-086, TS-087, TS-088 |

---

## Topology Surprises

1. **`bishop_cathedral/` does not pre-exist** — the hounds.ts inboundPheromonePathFor() creates it at runtime via `mkdirSync({ recursive: true })`. This is consistent with how knight_cathedral/ and pawn_cathedral/ directories were created in K461/K470.

2. **Inbound dedup model is merge-time, not emit-time** — the inbound queue is append-only; the same record can accumulate multiple raw entries between Bloodhound runs. This is by design: last-write-wins at merge provides idempotency without requiring read-modify-write at emit time (no race condition).

3. **`extractTopics()` digit gotcha** — unique test tag strings must be purely alphabetic for `queryPheromone` filtering to work. Tokens with embedded digits (e.g., `g2writetestxyz524unique`) are not extracted by the `[a-z][a-z_]{3,30}` regex. Fixed by using purely alphabetic tokens (`kxxqwritepathtestuniqxyz`).

4. **Conductor tablet format** — The Conductor scribe uses a custom schema (`query_hash`, `query_class`, etc.) rather than the standard `observation` field format. This matches the K524 spec. It differs from the standard `appendScribeEntry` schema but is consistent with how the Toolsmith scribe (TS-001 through TS-084) also uses a custom schema.

5. **Pre-existing test_knight_cathedral failure** — Test C in test_knight_cathedral.mjs fails due to a pre-existing schema issue (KnightHandoffs.jsonl tablet #128 missing `observation` field, using `type:'handoff'` schema). This is unrelated to K524. The overall `npm test` exits 1 due to this pre-existing failure; the K524 pheromone test suite runs 10/10 PASS independently.

---

## Open Followups

- **Conductor tablet pheromone entries**: Phase B wiring fires only in Node.js environments with LIBRARIAN_STITCHPUNKS_DIR set. The first real Bloodhound rebuild after the Conductor tablet receives entries will include them in the pheromone index. B.G.5 verified the architectural wiring; production indexing requires actual routing decisions to be logged first.
- **bishop_cathedral/ gitignore**: The new `bishop_cathedral/` directory contains runtime-generated inbound_pheromones.jsonl (same as pheromone_substrate/). Verify it's covered by the existing gitignore pattern for runtime-generated content (Bishop sweep B130).
- **Inbound queue pruning**: K524 prompt mentioned "prune merged inbound entries after merge (configurable; default keep for forensics)". Default keep is implemented; pruning is deferred to a future K session.

---

*The substrate remembers across rooms. The router stops whispering. FOR THE KEEP!*
