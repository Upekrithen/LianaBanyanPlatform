# MESH_PLOW_WIRING_RECEIPT.md
**Knight (Sonnet 4.6) → Bishop | BP080 | 2026-06-12**

---

## §2 Truth-Always — Critical Finding Before Anything Else

**The "70/70 PASS / BMV 93.6" cited in the Founder prompt is NOT from `test_plowed_bp078.py`.**

The actual Phase B receipt (`benchmarks/BP078_PHASE11_TEST_AGAINST_PLOWED_SUBSTRATE_RECEIPT.eblet.md`,
run 2026-06-09) shows:

| Metric | Actual Phase B result |
|---|---|
| Total questions | 116 |
| PASS | **1** (0.9%) |
| FAIL | 115 |
| ANDON | 0 |

The "70/70 / BMV 93.6" is from `replication-kit/receipts/results_bp077_phase7_close_50_50.jsonl` —
the **Staggered Swarm pipeline** (`truth_single_giants_bp077.py`, `run_n50_swarm_bp077.py`)
running on **50 simple general-knowledge questions** (literary, historical, geodata, bio_historical
domains — "Who wrote Hamlet?", "What is the capital of Japan?", etc.).

These are two fundamentally different systems. The Staggered Swarm mines FRESH eblets live per
question via Spider/Sprite/multiple operators. The Phase B concordance pipeline uses a STATIC
pre-mined cache and applies a term-overlap heuristic.

---

## SEG-AUDIT Results

### Referenced files that DO NOT EXIST
- `benchmarks/run_bp077_phase8_*.py` — **0 files found** (glob returned empty)
- `benchmarks/truth_single_giants_bp077.py` — **not here** (it lives in `replication-kit/`)

### Actual reference implementations found

| File | Location | What it produces |
|---|---|---|
| `truth_single_giants_bp077.py` | `replication-kit/` | Staggered Swarm, mines live, BMV 93.6 on simple Qs |
| `run_n50_swarm_bp077.py` | `replication-kit/` | 50-question swarm batch runner |
| `test_plowed_bp078.py` | `benchmarks/` | Phase B concordance, 1/116 PASS on MMLU-Pro |
| `replow_andon_bp078.py` | `benchmarks/` | Phase C re-plow via Wikipedia API |

### Architecture comparison

| | Staggered Swarm (BP077) | Phase B Concordance (BP078) |
|---|---|---|
| Eblet source | LIVE mining per question (Wikipedia/arXiv/wikidata/PubMed) | Static cache `substrate_bp078_cache.jsonl` (1,342 eblets) |
| BMV dimensions | cluster_count, operator_count, swarm_wall, eblets, concordance | eblet_coverage, source_quality, concordance, response_ok |
| Questions used | 50 simple fact Qs (literary/historical/geodata) | 116 MMLU-Pro hard science Qs |
| Result | **70/70 all_pass=true, avg BMV ≈ 93.6** | **1/116 PASS (0.9%)** |
| Internet required | YES — Wikipedia API per question | NO — static cache |

---

## SEG-WIRE-PLOW Results

### Changes made to `scripts/mesh_test_runner.py`
- Added `from pathlib import Path`
- Added Plow constants: `SUBSTRATE_CACHE_DEFAULT`, `ANTIPOP_MIN_WEIGHT`, `BMV_PASS_THRESHOLD`, `PLOW_ALL_CATEGORIES`, `PLOW_SKIPPED_CATEGORIES`
- Added helper functions: `_truncate_sentences`, `_extract_key_terms`, `_plow_concordance`, `_compute_bmv`, `_build_plow_context`, `_plow_synthesize`, `_load_plow_substrate`
- Added `run_plow_smoke()` function
- Updated `main()`: `--mode {mcq, plow-smoke}`, `--substrate`, `--smoke-n` flags; `--shard` now optional (required only for `--mode mcq`); plow-smoke routing added
- File grew from 520 to ~862 lines

**Syntax check: PASS** (`py_compile` exit 0, `--help` clean)

---

## SEG-SMOKE-TEST Results (Path A, Phase B concordance, 60 questions)

**Run:** `python scripts/mesh_test_runner.py --mode plow-smoke --node M0 --smoke-n 5`
**Wall clock:** ~44 minutes (60 LLM calls × ~44s avg, gemma4:12b, no ANDON)
**Substrate:** `benchmarks/substrate_bp078_cache.jsonl` (1,342 eblets, 12 active categories)

### Per-Domain BMV Table

| Domain | N | Pass | Fail | Andon | BMV_avg |
|---|---|---|---|---|---|
| math | 5 | 0 | 5 | 0 | 66.6 |
| physics | 5 | 0 | 5 | 0 | 63.0 |
| chemistry | 5 | 0 | 5 | 0 | 66.4 |
| biology | 5 | 0 | 5 | 0 | 55.0 |
| health | 5 | 0 | 5 | 0 | 66.5 |
| psychology | 5 | 0 | 5 | 0 | 66.4 |
| history | 5 | 0 | 5 | 0 | 66.7 |
| law | 5 | 0 | 5 | 0 | 67.1 |
| philosophy | 5 | 0 | 5 | 0 | 67.0 |
| economics | 5 | 0 | 5 | 0 | 66.4 |
| business | 5 | 0 | 5 | 0 | 62.4 |
| engineering | 5 | 0 | 5 | 0 | 59.8 |
| cs | 0 | 0 | 0 | 0 | 0.0 (skipped — no Phase A bank) |
| other | 0 | 0 | 0 | 0 | 0.0 (skipped — no Phase A bank) |
| **TOTAL** | **60** | **0** | **60** | **0** | — |

**Overall pass rate: 0.0%**

**BMV ≥ 90 target: NOT MET in any domain** (range: 55.0–67.1)

### Why: Concordance calibration failure on STEM content

The `_plow_concordance` heuristic requires the LLM's synthesized answer to contain
capitalized multi-word named entities or year/unit strings that appear across ≥2 source
repositories in the same eblet set. MMLU-Pro STEM questions (math/physics/chemistry/etc.)
are formula-heavy with few such cross-repo named entities. The concordance ratio never
reaches the 0.15 CONCORDANT threshold. This drives concordance_score to 0.0 for all 60
questions, pulling every BMV below the 70.0 PASS threshold.

This is **consistent with Phase B's actual documented result: 1/116 PASS (0.9%)**.
The smoke test is not a regression — it reproduces the Phase B concordance behavior exactly.

**The 70/70 / BMV 93.6 result requires the LIVE Staggered Swarm pipeline, not the static cache + concordance pipeline.**

---

## Founder Decision Required — Path Forward

Three options for the mesh benchmark:

### Option A — Keep Path A (Phase B concordance) as-is
**Already wired.** Result will be ~0–1% pass rate on MMLU-Pro hard science Qs.
Honest but not the "BMV 93.6" story. Useful as an Andon-detection pass.

### Option B — Port Staggered Swarm (truth_single_giants_bp077.py) into mesh_test_runner.py
This is the system that produced 70/70 / BMV 93.6. Requires:
- Live internet per question (Wikipedia API + wikidata + arXiv + PubMed)
- Full orchestrator port (~539K chars, ~11,500 lines)
- Per-question mining latency: 5–25s per question
- Estimated wall-clock for 12K questions: ~200–500 hours at 4 nodes
- **Scope: multi-session, not tonight**

### Option C — Path C hybrid (MCQ + Plow substrate context) — already planned
Per Founder direction:
- COLD = standard MMLU-Pro MCQ (question → Ollama → letter A–J → gold comparison)
- HOT = same MCQ + substrate eblets injected as context
- Delta = substrate lift (apples-to-apples vs Google 77.2%)
- **This is the right overnight run.** Wall-clock for 12K questions at 2 nodes: ~40–80 hours
  (est. 120ms–240ms per question for MCQ path at gemma4:12b latency)

### Option D — Staggered Swarm on BP077-style questions (NOT MMLU-Pro)
Run the existing `run_n50_swarm_bp077.py` at mesh scale with a curated question bank.
This reproduces the 93.6 BMV story on its actual question type. Different claim from MMLU-Pro.

---

## Recommendation

**Tonight: proceed to Path C (hybrid MCQ + substrate context).**
SEG-WIRE-PATH-C is the correct next SEG — adds `--mode hybrid` to `mesh_test_runner.py`,
identical to MCQ mode but with substrate eblets injected into the HOT prompt.
COLD accuracy vs HOT accuracy delta = the MnemosyneC lift we can publish against Google 77.2%.

The Phase B concordance wiring (Path A) stays in `mesh_test_runner.py` as `--mode plow-smoke`
for infrastructure health checks. It correctly documents the concordance pipeline's known behavior.

---

## Results JSON
`~/.mnemosynec/test-data/mmlu-pro/results/plow_smoke_M0_results.json`
sha256: `d4d77a058945740a182aca10cf19600355964b0ee0b841de241ced86a81aea55`

---

*Yoke-return: Knight (Sonnet 4.6) → Bishop. BP080. 2026-06-12. §2 Truth-Always.*
*Plow pipeline wired. Smoke test complete. BMV target not met on Phase B concordance — see diagnosis.*
*Awaiting Founder direction on mesh test methodology before firing full 12K run.*
