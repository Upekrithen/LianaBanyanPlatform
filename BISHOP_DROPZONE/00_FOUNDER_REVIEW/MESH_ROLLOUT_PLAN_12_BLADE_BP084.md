---
title: Mesh-Wide Rollout Plan — 12-Blade Column Plow
session: BP084
minted: 2026-06-16
status: DRAFT — awaiting Founder ratify
plow_version: 12blade-bp084-corrected-v2
canonical_blade_names:
  1: Spider
  2: Sprite
  3: Specialists (9-Swarm)
  4: Miner
  5: Saladin
  6: Furnace
  7: Three Fates
  8: Scribe
  9: Detective TEAM
  10: CONSEQUENCE_TRACE
  11: ELIMINATION_VERIFY
  12: DEPENDENCY_PROPAGATION
---

# Mesh-Wide Rollout Plan — 12-Blade Column Plow · BP084

**Question Bank:** Substrate Awakens fresh bank (SHA e79142cf) — NOT the 1,400-q bank from yesterday.

---

## Pre-Conditions Checklist

Before any peer initiates a shard run:

- [ ] `node plow-cli-12blade.js --version` — verify `12blade-bp084-corrected-v2`
- [ ] `Invoke-WebRequest -Uri http://localhost:11434/api/tags` → Ollama running
- [ ] Target model available (`gemma4:12b` or `gemma2:2b` per peer)
- [ ] Internet connectivity for Specialists (Wikipedia, arXiv, Wikidata)
- [ ] `Asteroid-ProofVault/state/eblets/active/` directory writable
- [ ] Question bank SHA verified: `e79142cf`
- [ ] NOTHING publishes (BP078 BLOOD) — output stays local until Founder ratifies
- [ ] 68/70 canonical receipt NOT touched (BP083 Truth-Always BLOOD)

---

## Per-Peer Shard Assignments

| Peer | Hardware | Model | Domains | ~Q Count | Est. Runtime |
|------|----------|-------|---------|----------|--------------|
| M0 | 64 GB | gemma4:12b | math, chemistry, law, physics | ~500 q | ~7–9 hrs |
| M1 | 16 GB | gemma4:12b | engineering, computer_science | ~250 q | ~3–4 hrs |
| M2 | 32 GB | gemma4:12b | biology, business, economics | ~350 q | ~5–6 hrs |
| M3 | 32 GB | gemma4:12b | philosophy, history | ~250 q | ~3–4 hrs |
| M5 | Son WAN | gemma2:2b | psychology, other | ~250 q | ~2–3 hrs |
| Reserve | any | any | Code Breakers redundant verification | ~150 q | varies |

**Total: ~1,750 questions** across 14 domains.

---

## Invocation Commands

### M0 (math, chemistry, law, physics — gemma4:12b)
```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli"
node plow-cli-12blade.js shard_m0_math_chem_law_physics.json `
  --model gemma4:12b `
  --out m0_results.jsonl `
  --telemetry m0_telemetry.json `
  --max-consequence-depth 3
```

### M1 (engineering, CS — gemma4:12b)
```powershell
node plow-cli-12blade.js shard_m1_engineering_cs.json `
  --model gemma4:12b `
  --out m1_results.jsonl `
  --telemetry m1_telemetry.json `
  --max-consequence-depth 2
```

### M2 (biology, business, economics — gemma4:12b)
```powershell
node plow-cli-12blade.js shard_m2_bio_biz_econ.json `
  --model gemma4:12b `
  --out m2_results.jsonl `
  --telemetry m2_telemetry.json `
  --max-consequence-depth 2
```

### M3 (philosophy, history — gemma4:12b)
```powershell
node plow-cli-12blade.js shard_m3_philosophy_history.json `
  --model gemma4:12b `
  --out m3_results.jsonl `
  --telemetry m3_telemetry.json `
  --max-consequence-depth 3
```

### M5 (psychology, other — gemma2:2b)
```powershell
node plow-cli-12blade.js shard_m5_psych_other.json `
  --model gemma2:2b `
  --out m5_results.jsonl `
  --telemetry m5_telemetry.json `
  --max-consequence-depth 1
```

---

## Aggregation Step

After all peers complete, run aggregation from M0:

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\plow-cli"
node aggregate.js `
  m0_results.jsonl m1_results.jsonl m2_results.jsonl `
  m3_results.jsonl m5_results.jsonl `
  --out constellation_aggregate.json `
  --tic-fields known,theories_open,eliminated,dependencies_upstream,applications_downstream
```

### aggregate.js TIC Extension (required)

The existing `aggregate.js` needs an extension to count TIC-class fields. Add:

```javascript
// TIC aggregation — count by class
const ticCounts = { KNOWN: 0, THEORY_OPEN: 0, ELIMINATED: 0, unknown: 0 };
const ticGates  = { all_passed: 0, G1_failed: 0, G2_failed: 0, G3_failed: 0, G4_failed: 0 };
const andonLog  = [];

for (const record of allRecords) {
  ticCounts[record.question_class] = (ticCounts[record.question_class] ?? 0) + 1;
  if (record.andon_triggered) andonLog.push({ qid: record.question_id, tier: record.andon_tier });
  for (const gate of record.verdict?.gates_failed ?? []) ticGates[`${gate}_failed`]++;
  if ((record.verdict?.gates_failed ?? []).length === 0) ticGates.all_passed++;
}
```

### Aggregate Output Format

```json
{
  "constellation_run_id": "<sha256-of-concatenated-results>",
  "total_questions": <N>,
  "tic_counts": {
    "KNOWN": <N>,
    "THEORY_OPEN": <N>,
    "ELIMINATED": <N>
  },
  "gate_summary": { "all_passed": <N>, "G1_failed": <N>, "G2_failed": <N>, "G3_failed": <N>, "G4_failed": <N> },
  "andon_events": <N>,
  "consequence_probes": <N>,
  "eliminations": <N>,
  "downstream_flags": <N>,
  "code_breaker_queue_entries": <N>,
  "avg_bmv": <float>,
  "per_peer": { "M0": {...}, "M1": {...}, ... }
}
```

---

## Per-Blade Expected Behavior at Scale

| Blade | At Scale Notes |
|-------|---------------|
| Spider | More vault hits as corpus grows — early runs sparse, later runs rich |
| Sprite | Direct passthrough; negligible overhead |
| Specialists | Wikipedia + arXiv rate limits may activate for large shards; add 5s stagger |
| Miner | ~40–60% pass rate expected across domains |
| Saladin | ~70–85% pass rate expected (Furnace burns ~15–30%) |
| Furnace | Top-6 survivors cap; adjust if BMV scores low |
| Three Fates | CONCORDANT ~60%, PARTIAL ~25%, DISCORDANT ~15% expected |
| Scribe | Every question mints 1 eblet; ELIMINATED mints + contradiction trail |
| Detective TEAM | Andon Tier 1 expected ~15% of questions; Tier 2 ~3–5%; Tier 3 rare |
| CONSEQUENCE_TRACE | Fires on all THEORY_OPEN (~15% of questions); depth-bounded |
| ELIMINATION_VERIFY | Fires on all ELIMINATED; Code Breakers queue grows with each run |
| DEPENDENCY_PROPAGATION | Fires on KNOWN + downstream_seed questions (~60% of KNOWN class) |

---

## Rollout Status

| Peer | Status | Notes |
|------|--------|-------|
| M0 | ✓ M0 VALIDATION COMPLETE (BP084) | 3-question validation GREEN |
| M1 | ○ PENDING | Awaiting Founder ratify for full rollout |
| M2 | ○ PENDING | Awaiting Founder ratify |
| M3 | ○ PENDING | Awaiting Founder ratify |
| M5 | ○ PENDING | Awaiting Founder ratify |
| Reserve | ○ PENDING | Awaiting constellation run completion |

---

*BP084 · Sonnet 4.6 · FOR THE KEEP.*
