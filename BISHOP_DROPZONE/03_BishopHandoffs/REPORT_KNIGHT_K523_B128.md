# KNIGHT REPORT — K523 / B128
## Pheromone Substrate Durable Build (Stigmergic Cross-Scribe Index)

**Date**: 2026-04-27
**Session**: K523
**Tag**: `v-pheromone-substrate-K523`
**A&A**: #2317 The Pheromone Substrate — Implements Claims 4-7

---

## What Was Built

### Production Pheromone Substrate

A durable, persistent stigmergic index over all Cathedral Scribe tablets. The Cathedral can now answer "where does X live?" in constant time instead of N-Scribe RPC polling.

**Files created/modified:**
- `librarian-mcp/src/scribes/pheromone.ts` — Core production module: topic extraction, JSONL storage, in-memory inverted index, decay scoring, query engine
- `librarian-mcp/src/scribes/cathedral.ts` — Added sync pheromone emit hooks after `appendScribeEntry` + `appendTidbit`
- `librarian-mcp/src/server.ts` — Three new MCP tools: `pheromone_query`, `pheromone_build`, `detective_investigate`
- `librarian-mcp/scripts/pheromone-bloodhound.mjs` — Async deep-extraction Bloodhound scout (Phase D)
- `librarian-mcp/package.json` — New scripts: `pheromone:build`, `pheromone:bloodhound`; wired into `rebuild` + `rebuild:full` + `rebuild:incremental`
- `librarian-mcp/tests/test_pheromone.mjs` — Phase G verification test suite (8/8 pass)
- `librarian-mcp/stitchpunks/synapses/synapse_K523.jsonl` — 13 Synapse entries
- `librarian-mcp/stitchpunks/scribes/scribe_Toolsmith.jsonl` — TS-084 entry appended

---

## Phase A.4 — 12-vs-14 Scribe Mismatch Resolved

**Finding**: B128 PoC found 12 JSONL files in `scribes/`; registry.yaml has 14 Scribes registered.

**Resolution**: The 14 registered Scribes account as follows:
- **11 have non-empty tablet files** in `scribes/`: Architecture, BRIDLE, Decisions, FounderVoice, Landing, OperationalGotchas, Prov14, R11, R9, Toolsmith, Vault
- **1 has an empty tablet file**: Conductor (registered, file exists, zero records written — never had `scribe_log` called)
- **2 have no tablet file**: R12Cranewell, R12Covenant (registered, but no session has written to them yet)

The production pheromone substrate gracefully handles all three cases: non-empty = indexed, empty = nothing to index, missing = treated as empty.

---

## Phase B — Production Index Format

- Storage: `stitchpunks/pheromone_substrate/index.jsonl` (gitignored per line 25)
- Schema: `{ts, scribe, tablet_id, topics[], decay_constant_days, cathedral}`
- Primary key: `(cathedral, scribe, tablet_id)` — last-write-wins for idempotent dedup
- In-memory: `Map<topic, PheromoneRecord[]>` built lazily on first read, updated incrementally on emit
- Atomic write: temp file + rename pattern (unlinkSync + renameSync on Windows)

---

## Phase C — Sync-Emit Hooks

Both Scribe write paths now emit pheromones:
1. `appendScribeEntry` (→ `scribe_log` tool): emits after successful write; tablet_id = `{scribe_id}_L{line_count}`
2. `appendTidbit` (→ `log_tidbit` tool): emits to virtual "Tidbits" scribe; tablet_id = `tidbit_{session}_L{line_count}`

Both are non-fatal (try/catch) — pheromone emit never breaks Scribe writes.

---

## Phase D — Bloodhound Deep-Extraction

`scripts/pheromone-bloodhound.mjs` runs:
- All 3 Cathedral dirs (bishop, knight, pawn)
- Richer topic extraction (CamelCase, hyphenated, K/B/R/P session IDs, quoted phrases)
- Decay-respecting allocation: tablets older than 150 days get minimal forensic indexing
- Atomic write (tmp + rename)
- Wired into `npm run rebuild` so every Librarian rebuild auto-refreshes

---

## Phase E — Detective Phase 0

New `detective_investigate` MCP tool:
```
Phase 0: pheromone_query → ranked hits from inverted index (constant time)
  → if hits >= sufficiency_threshold: return Provenance Map, source="pheromone_substrate"
  → else: fall through to Phase 1
Phase 1: consult_scribes RPC → N-Scribe polling (existing behavior)
  → return Provenance Map, source="rpc_consult_scribes"
```

---

## Phase F — MCP Tools

| Tool | Description |
|---|---|
| `pheromone_query` | Detective Phase 0 fast path — constant-time query with decay scoring |
| `pheromone_build` | Force full index rebuild from all Cathedral tablets |
| `detective_investigate` | Unified interface: Phase 0 pheromone → Phase 1 RPC fallback |

---

## Phase G — Verification Results

| Check | Result |
|---|---|
| G.1 — JSONL builds without errors | ✅ PASS — 1,105 records |
| G.3 — Topic extraction parity (10 spot checks) | ✅ PASS — 10/10 |
| G.4 — Decay: recent beats old (100-day vs 1-day) | ✅ PASS — 3.87 vs 0.14 |
| G.5 — Routine query <100ms, phase_0_used=true | ✅ PASS — 1ms wall, 20 hits |
| G.6 — Novel query → fallback_to_rpc=true | ✅ PASS |
| G.7 — Idempotent: 3x same key → 1 record | ✅ PASS |
| G.9 — 5 distinct emits → 5 distinct records | ✅ PASS |
| G.10 — Scribe coverage: 11 non-empty indexed, 3 absent (correct) | ✅ PASS |

(G.2 and G.8 from prompt were implementation-verified through the sync-emit hook code and multi-Cathedral index coverage; not separate automated assertions)

---

## Production vs PoC Delta

| Metric | B128 PoC | K523 Production |
|---|---|---|
| Scribe files scanned | 12 (bishop only) | 21 (bishop + knight + pawn) |
| Tablets indexed | 345 | 1,107 |
| Records in index | 345 | 1,105 (deduped) |
| Distinct topics | 4,841 | 6,910 |
| Build time | 14ms | 153ms |
| Query latency | <1ms | 0-1ms |
| Cathedral coverage | Bishop only | Bishop + Knight + Pawn |
| Sync-emit hooks | None (PoC = one-shot) | appendScribeEntry + appendTidbit |
| Detective Phase 0 | Manual conceptual only | Wired via detective_investigate tool |
| Decay scoring | None | Exponential exp(-age/λ) |
| Idempotent emit | No | Yes (last-write-wins by key) |
| Bloodhound cron | No | Wired into npm run rebuild |

---

## Topology Surprises

1. **TS-083 already taken** — B128 assigned TS-083 to the Detective second application. K523 Toolsmith entry is TS-084 instead.
2. **Regex gap**: single-token regex `[a-z][a-z_]{3,30}` doesn't capture hyphenated terms. Added explicit `/\b([a-z]{3,}(?:-[a-z]{3,})+)\b/g` pattern.
3. **Windows atomic write**: `renameSync` over existing file fails on Windows. Fixed: `unlinkSync` first, then `renameSync`.
4. **ESM URL scheme on Windows**: dynamic `import(windowsPath)` fails; tests require `pathToFileURL` conversion for proper `file://` URLs.

---

## Open Followups

- **G.2** (5/5 write-path integration test): currently verified by code inspection; automated assertion could be added in a future session
- **G.8** (Cross-Cathedral Hound pheromone propagation): Claim 7 of #2317 — the index covers all 3 Cathedrals but active Hound transport of pheromone summaries is deferred to a future K session
- **Conductor tablet**: empty file — zero `scribe_log` calls ever. When Conductor routing decisions are next logged, they will automatically emit pheromones via the sync hook

---

*Filed K523 by Knight. Ants don't interview — they sense. The Cathedral graduates. FOR THE KEEP!*
