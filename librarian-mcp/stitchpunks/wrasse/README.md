# Wrasse Scribe — Pre-Injection Registry

**K540/B132 | Provisional 15 Candidate | Publication Gate: HARD (internal until Founder Phase E)**

Pre-injection registry that prevents rote-cognition tax at agent-spawn boundaries.

## The Problem

Every Knight session open re-derives the same facts from scratch:
- Where is `KNIGHT_QUEUE.md`? (800KB file — reads ~22% of context window before reaching relevant section)
- What did K461 do? K535? What tag did it produce?
- What is BRIDLE Rule 2? What is TS-011?
- What are the current canonical numbers?

K539 empirical: context jumped from **~94% to ~27%** on a fresh Cursor session open.
~22 percentage-point delta = rote-cognition reload tax.

## The Solution

Wrasse Scribe is a pre-resolved trigger registry. Matching entries are **injected before the agent's first reasoning step**, eliminating the need to re-derive from scratch.

```
Trigger term → fast regex lookup (sub-ms) → canonical_resolution → inject
```

Conservative estimate from K539 baseline: **~90.9% reduction** in rote-cognition token tax.

## Files

| File | Purpose |
|------|---------|
| `wrasse_registry.jsonl` | Trigger registry (66+ entries, 6 classes) |
| `wrasse_lookup.py` | Fast regex lookup engine (sub-ms per entry) |
| `wrasse_inject.py` | Pre-injection text generator (Knight/Bishop/Pawn formats) |
| `wrasse_hook_ext.py` | Bishop SessionStart hook extension |
| `wrasse_measure.py` | Phase D measurement harness |
| `session_ledger.jsonl` | Measurement run ledger (Stone Tablet compliant) |
| `schema.json` | Registry entry schema |
| `registry.yaml` | Scribe metadata + architecture decisions |

## Trigger Classes

| Class | Example Trigger | Example Resolution |
|-------|----------------|-------------------|
| `file_path` | `KNIGHT_QUEUE.md` | Absolute path + description + usage note |
| `vocabulary` | `BRIDLE` | Definition + rules + location |
| `k_prefix` | `K461` | What session did, files touched, tag produced |
| `ts_prefix` | `TS-011` | Toolsmith canonical recipe |
| `call_sign` | `v-knight-cathedral-instantiation-K461` | Commit hash + description |
| `canonical_number` | `innovation_count` | Current canonical value + source |

## Injection Surfaces

| Agent | Delivery | Implementation |
|-------|----------|----------------|
| Knight | Prepend-to-prompt | `wrasse_inject.py generate_knight_prelude()` |
| Bishop | Hook-injected-context | `wrasse_hook_ext.py get_wrasse_injection()` |
| Pawn | Prepend-to-prompt | `wrasse_inject.py generate_pawn_prelude()` |

## Quick Start

```powershell
# Benchmark lookup engine
$env:PYTHONUTF8="1"
cd librarian-mcp/stitchpunks/wrasse
python wrasse_lookup.py --benchmark

# Generate Knight prelude for a session
python wrasse_inject.py "K461 BRIDLE canonical_values.yaml" --format=knight

# Baseline measurement
python wrasse_measure.py --estimate

# View measurement report
python wrasse_measure.py --report
```

## Architecture Decisions (Phase A)

**D.1 Trigger detection: Regex-first MVP**
All 6 trigger classes are well-structured and regex-deterministic. Embedding adds latency and API cost. Defer embedding fallback to Phase 2 based on empirical miss rate from Phase D sessions.

**D.2 Pre-injection delivery:**
- Bishop: hook-injected-context (existing discipline_wing hook extended)
- Knight: prepend-to-prompt (standard K-prompt prelude section)
- Pawn: prepend-to-prompt (pawn_with_substrate.py wrapper)

Rationale: hook is cleanest for Bishop (existing infrastructure); prepend is universal for Knight/Pawn without MCP tool registration changes.

## Adding New Entries

When Detective resolves a NEW trigger type that will recur across sessions:

1. Add a JSONL line to `wrasse_registry.jsonl`:
   ```json
   {"trigger_id": "W-NNN", "trigger_class": "...", "trigger_pattern": "...", "trigger_regex": "...", "canonical_resolution": "...", "last_verified_ts": "ISO8601", "verification_count": 1, "source_session": "K-NNN"}
   ```
2. Verify the regex matches what you expect: `python wrasse_lookup.py "your trigger term"`
3. No rebuild needed — lookup engine reloads on file mtime change

## Measurement Protocol (Phase D)

**D.1 Baseline (Wrasse-off):**
```powershell
python wrasse_measure.py --mode=baseline --session=K541 --file=<transcript>
```

**D.2 Wrasse-on:**
```powershell
python wrasse_measure.py --mode=wrasse-on --session=K542 --file=<transcript>
```

**D.3 Delta report:**
```powershell
python wrasse_measure.py --report
```

Target: ~90% reduction in rote-cognition token tax (Founder's claim, K539 empirical anchor).

## Publication Gate

**HARD GATE**: All Wrasse Scribe results are INTERNAL ONLY until:
1. Founder Phase E review
2. Prov 15 inclusion ratification

Per Fire Control directive — Knight builds + measures; Founder fires Prov 15 filing trigger.

---
*K540/B132 | Stone Tablet Imperative: full payload preserved. Call Sign: v-wrasse-scribe-mvp-K540*
