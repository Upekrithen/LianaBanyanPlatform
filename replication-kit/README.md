# Liana Banyan Platform -- Substrate Benchmark Reproducibility Kit

**Release:** bp077-substrate-proof-v1
**Date:** 2026-06-07
**Canonical URL:** https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/bp077-substrate-proof-v1
**License:** SSPL + Tributary Use Pledge §6

---

## What is this?

This kit reproduces the Staggered Swarm benchmark results from Blueprint Session 077 (BP077) of the Liana Banyan Platform. The benchmark tests whether a distilled substrate -- a dose-metered knowledge layer built from canonical eblets -- improves AI answer accuracy on domain-specific questions, compared to a baseline with no substrate.

The approach uses a **Staggered Swarm** pipeline (`truth_single_giants_bp077.py`) driven by a batch runner (`run_n50_swarm_bp077.py`) over a 50-question bank spanning 10 domains. Questions are isolated by domain; no cross-domain contamination occurs.

---

## Quick start

1. Clone this release or download and unzip.
2. Install Python 3.11+ (no external pip packages required -- stdlib only).
3. Install [Ollama](https://ollama.com) and pull your target model:
   ```
   ollama pull gemma2:12b
   ```
4. Ensure Ollama is running at `http://localhost:11434` (default endpoint).
5. Run the benchmark:
   ```
   python run_n50_swarm_bp077.py --batch-mode --gap 15
   ```
6. Results appear in `runs/BP077_GIANTS/` as JSONL files and trace logs.

---

## Expected results

Within rate-limit variance (5-10% tolerance on per-domain accuracy), results should match the published receipts in `receipts/`. The swarm proof documents (`swarm_proof_*.json`) contain the gate evaluations (G1 fact / G2 concordance / G3 BMV / G4 latency) for each run.

See `docs/REPRODUCE.md` for full step-by-step reproduction guidance.

---

## Directory structure

```
replication-kit/
  README.md                         -- this file
  LICENSE                           -- SSPL + Tributary Use Pledge §6
  run_n50_swarm_bp077.py            -- N=50 Staggered Swarm batch runner
  truth_single_giants_bp077.py      -- Staggered Swarm pipeline harness
  truth_single_bp076.py             -- Core truth-finder (imported by harness)
  requirements.txt                  -- Python version + runtime requirements
  questions/
    q_bank_bp077.jsonl              -- 50-question bank (one JSON per line)
    bp077_phase7_q50_bank.json      -- canonical source (array format)
  receipts/
    swarm_proof_*.json              -- swarm gate evaluation receipts
    focused8_close_q*.jsonl         -- per-question focused diagnostic runs
    results_bp077_phase7_close_50_50.jsonl  -- phase 7 close full 50-Q results
  substrate/
    r10v3_distilled_substrate_bp076.md  -- distilled r10v3 substrate (<=2KB)
  operator_rosters/
    README.md                       -- note: rosters are inline in the harness
  docs/
    METHODOLOGY.md                  -- Staggered Swarm methodology overview
    REPRODUCE.md                    -- step-by-step reproduction guide
```

---

## Designed-to-be-Copied

This kit is released under the Server Side Public License (SSPL). Any use in a competing service requires open-sourcing your full service stack under SSPL. The Tributary Use Pledge §6 applies. See `LICENSE`.

---

## Canonical citation

Liana Banyan Corporation. (2026). Substrate benchmark: per-domain Staggered Swarm methodology. bp077-substrate-proof-v1. https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/bp077-substrate-proof-v1
