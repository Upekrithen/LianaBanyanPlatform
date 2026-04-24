# REPORT: K466 — Scribe Registry Corpus Mode
**Knight Session:** K466  **Bishop Session:** B121  **Date:** 2026-04-24  **Tag:** `v-scribe-corpus-mode-K466`

---

## Summary

K466 adds a `mode` field to the Scribe registry schema, closing the architectural gap surfaced by K455c: static reference corpora (R11, canon) have different serving semantics than observational Scribes (session logs, handoffs). K455c used a `max_entries=55` hack to retrieve all 50 R11 facts; corpus mode makes this unnecessary.

**Classification: COMPLETE — all 7 deliverables shipped.**

---

## Schema Diff (Scribe-level, not per-tablet)

```yaml
# In registry.yaml (per scribe entry):
- id: R11
  mode: corpus          # NEW K466 — full deterministic retrieval
  primary: ...

- id: KnightHandoffs
  mode: observational   # NEW K466 — recency top-K (default, legacy behavior)
  primary: ...
```

The `mode` field lives in `registry.yaml` (per-Scribe registry metadata), **not** in tablet JSONL entries. Both `schema.json` files have a `_notes.scribe_mode_K466` entry documenting this distinction.

---

## Retrofit List — Which Scribes Are Corpus

| Cathedral | Scribe | Mode | Reason |
|-----------|--------|------|--------|
| Bishop | R11 | **corpus** | 50-fact static benchmark fixture; no recency semantics |
| Bishop | R9 | observational | Benchmark methodology; session-log observations |
| Bishop | BRIDLE | observational | Agent discipline observations |
| Bishop | Landing | observational | Landing page observations |
| Bishop | Prov14 | observational | Patent filing observations |
| Bishop | Vault | observational | Secret distribution observations |
| Bishop | Architecture | observational | Architecture decisions (session-log) |
| Bishop | Decisions | observational | Decision rationale (session-log) |
| Bishop | FounderVoice | observational | Voice/keystone observations |
| Knight | KnightQueue | observational | Task queue (live, updated each session) |
| Knight | KnightHandoffs | observational | Handoff reports (newest-first relevance) |
| Knight | KnightBRIDLEMemory | observational | BRIDLE discipline log (session-log) |
| Knight | KnightArchitecture | observational | Architecture decisions (session-log) |

**1 corpus, 12 observational.** R11 is the only corpus Scribe at this time. Future corpus candidates: `Canonical` (canonical_values.yaml primary), any rulebook or reference-material Scribe.

---

## Serving Semantics — Before vs After

| Scenario | Before K466 | After K466 |
|----------|-------------|------------|
| R11 query, `max_entries=10` | Random 10 of 50 (same timestamp → arbitrary truncation) | First 10 in original ingest order (deterministic) |
| R11 query, `max_entries` unset | Default 20; 30 facts invisible | Default 100 for corpus queries; all 50 visible |
| Handoff query, `max_entries` unset | Newest 20 handoffs | Same (observational unchanged) |
| Explicit `max_entries=3` on corpus | 3 arbitrary (recency-sliced) | First 3 in ingest order (deterministic chunk) |

The K455c `max_entries=55` hack in `cross_cathedral_adapter.py` can now be reverted to `max_entries=10` (or removed) — corpus mode ensures deterministic first-N retrieval regardless of timestamp collisions. This is flagged for K455a.

---

## Test Results

5 new tests in `tests/test_scribe_corpus_mode.mjs`:

| Test | Description | Result |
|------|-------------|--------|
| A | mode field accepted and persisted in registry | PASS |
| B | corpus-mode Scribe returns ALL tablets when corpus < max_entries | PASS |
| C | corpus-mode with explicit max_entries < corpus returns first-N deterministically | PASS |
| D | observational-mode Scribe still returns recency-sorted top-K (regression) | PASS |
| E | retrofit-scribe-mode.mjs idempotent (running twice = 0 changes) | PASS |

Existing tests: 6 scope tests + 6 codegen + 5 verify = **22/22 pass**.

---

## Files Changed

| File | Change |
|------|--------|
| `librarian-mcp/src/scribes/registry.ts` | Added `mode?: "observational" \| "corpus"` to `ScribeEntry` type |
| `librarian-mcp/src/scribes/consult.ts` | Corpus mode logic: original order, default 100 max, `mode` in ConsultResult |
| `librarian-mcp/src/server.ts` | Updated tool description and `max_entries` max raised to 500 |
| `librarian-mcp/stitchpunks/scribes/schema.json` | Added `_notes.scribe_mode_K466` |
| `librarian-mcp/stitchpunks/knight_cathedral/schema.json` | Added `_notes.scribe_mode_K466` |
| `librarian-mcp/stitchpunks/scribes/registry.yaml` | Added `mode:` to all 9 Bishop Scribes |
| `librarian-mcp/stitchpunks/knight_cathedral/registry.yaml` | Added `mode:` to all 4 Knight Scribes |
| `librarian-mcp/scripts/retrofit-scribe-mode.mjs` | NEW — idempotent retrofit script |
| `librarian-mcp/tests/test_scribe_corpus_mode.mjs` | NEW — 5 tests |

---

## Technical Notes

### Why `yaml.dump()` was avoided in the retrofit script

The initial implementation used `js-yaml`'s `yaml.dump()` to write back the registry after modifying Scribe entries. This strips all YAML comments (section dividers, `# B117 expansion` markers, etc.). The final implementation uses targeted string regex replacement to preserve the original formatting exactly.

### Corpus per-scribe cap

Corpus Scribes are subject to `CORPUS_PER_SCRIBE_CAP = 500` entries per Scribe to avoid runaway memory on unexpectedly large corpora. R11 has 50 facts; this cap is effectively unreachable for current corpora.

### Explicit corpus list rationale

The retrofit script heuristic initially used `canonical_keepers` to classify static-file Scribes as corpus. This was too aggressive (R9, Landing, Vault, FounderVoice incorrectly classified corpus). Final implementation uses an **explicit list** (`EXPLICIT_CORPUS = Set(["R11"])`), with a note to extend via tablet `source_document` scanning in the future.

### D4 — Planning docs

`project_proactive_scribe_autosurface_plan.md` (referenced in the K466 prompt) does not exist in the repo at this time. No code changes needed; mode awareness documented in `server.ts` tool description for Herald/Phase 2+ implementation.

---

## Pending Bishop Actions

- **K455a**: The `max_entries=55` hack in `librarian-mcp/r10_cross_vendor/r11_adapters/cross_cathedral_adapter.py` can now be reverted — corpus mode serves all R11 tablets deterministically regardless of max_entries. K455a should validate this.
- **Future corpus Scribes**: When instantiating a `Canonical` Scribe (canonical_values.yaml primary), add it to `EXPLICIT_CORPUS` in `retrofit-scribe-mode.mjs` and set `mode: corpus` in its registry entry.
- **Herald Phase 2**: The `consult_scribes` tool now exposes `scribes_consulted[].mode` — Herald can use this to distinguish corpus vs observational result sets and present them differently.

---

*Handoff complete. Tag: `v-scribe-corpus-mode-K466`.*
