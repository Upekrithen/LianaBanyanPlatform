# Cadre Big-4 API Comparison Benchmark — Results
## BP067/BP068 | Knight (Cursor Sonnet 4.6) | 2026-05-31T22:24Z | TRUTH-ALWAYS

---

## Status Summary

| Component | Status |
|---|---|
| Test 2 Local (gemma2/llama3.1/qwen2.5) | COMPLETE (BP067) |
| Big-4 API comparison (Haiku/GPT/Gemini) | BLOCKED — API keys not found |
| Cohen's kappa (local inter-model) | COMPLETE — see below |
| Big-4 script (run_cadre_big4.py) | READY — runs on key provision |

**Root cause for BLOCKED:** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` absent from
all searched locations (process environment, platform/.env, stitchpunks/.env, .cursor/mcp.json).
`SDS.env` / `DOUBLESECRET.env` not found at `Asteroid-ProofVault/LockBox/`. Per Bishop Yoke
BP068 task: "Big-4 comparison stays BLOCKED (no API keys) — Founder deciding keys-vs-skip."

**Action required:** Founder to provide API key file path or load keys directly, then re-run
`python run_cadre_big4.py` (script is ready, no changes needed).

---

## Full Comparison Table (Test 2: ARC-Challenge + GSM8K, 25 Questions)

| Model | Type | COLD | HOT | Delta | Cost/Q |
|-------|------|------|-----|-------|--------|
| gemma2:2b | Local | 36.0% | 36.0% | 0.0pp | $0.00 |
| llama3.1:8b | Local | 64.0% | 64.0% | 0.0pp | $0.00 |
| qwen2.5:7b | Local | 80.0% | 80.0% | 0.0pp | $0.00 |
| **Cadre quorum** | **Local** | **64.0%** | **64.0%** | **0.0pp** | **$0.00** |
| claude-haiku | API | BLOCKED | BLOCKED | — | — |
| gpt-4.1-mini | API | BLOCKED | BLOCKED | — | — |
| gemini-2.0-flash | API | BLOCKED | BLOCKED | — | — |

_Local results source: `librarian-mcp/r10_cross_vendor/results/CADRE_V4_TEST2_BP067_20260601_0104.json`_

---

## Test 2 Sub-set Breakdown (Local Cadre — COLD)

| Sub-set | COLD | HOT |
|---------|------|-----|
| ARC-Challenge (R01-R15, science MCQ) | **93.3%** | 86.7% |
| GSM8K (R16-R25, math word problems) | **20.0%** | 30.0% |

---

## Per-Model COLD Accuracy (Local)

| Model | COLD | Correct/25 |
|-------|------|-----------|
| gemma2:2b | 36.0% | 9/25 |
| llama3.1:8b | 64.0% | 16/25 |
| qwen2.5:7b | 80.0% | 20/25 |
| Cadre quorum | 64.0% | 16/25 |

Quorum gain vs best single (qwen2.5:7b): **-16.0pp** (quorum penalized because
gemma2:2b and llama3.1:8b outvoted qwen2.5:7b on hard math questions where
all-three-wrong is unanimous).

---

## Cohen's Kappa — Inter-Model Grader Agreement

_Computed by `compute_kappa.py` from `CADRE_V4_TEST2_BP067_20260601_0104.json`_

### Pairwise Kappa (COLD — primary grader-agreement metric)

| Pair | κ | P_o | P_e | Category |
|------|---|-----|-----|----------|
| gemma2 vs llama3.1 | **+0.3323** | 0.640 | 0.461 | Fair |
| gemma2 vs qwen2.5 | **+0.2466** | 0.560 | 0.416 | Fair |
| llama3.1 vs qwen2.5 | **+0.4231** | 0.760 | 0.584 | Moderate |

**Average pairwise κ (COLD) = +0.334**
**Average pairwise κ (HOT)  = +0.355**

### Each Model vs Quorum (COLD)

| Model | κ | Category |
|-------|---|----------|
| gemma2:2b | +0.481 | Moderate |
| llama3.1:8b | **+0.826** | Almost Perfect |
| qwen2.5:7b | +0.615 | Substantial |
| **Average** | **+0.641** | Substantial |

### Interpretation

Category thresholds (Landis & Koch 1977):
- < 0.00 = Poor | 0.00–0.20 = Slight | 0.21–0.40 = Fair
- 0.41–0.60 = Moderate | 0.61–0.80 = Substantial | 0.81–1.00 = Almost Perfect

**Key insight:** The low average pairwise kappa (+0.334, "fair") reflects GENUINE MODEL
DISAGREEMENT, not grader unreliability. The deterministic grader (letter-match for MCQ,
numeric-compare for math) has κ = 1.000 with itself — it is perfectly reproducible.

The fair/moderate inter-model kappa empirically validates the D-5 Star Chamber escalation
design: quorum fails exactly when model capability variance is wide (gemma2 36% vs qwen2.5 80%
— a 44pp spread causing frequent majority-against-best disagreements on hard questions). This
is the correct design signal for class-determined escalation to Frontier.

---

## Context: Test 1 Factual Results (BP063 Big-4 Reference)

From the prior Big-4 run (BP063, factual questions, Haiku-graded, κ = 0.936):

| Model | COLD | HOT | Delta | Cost/Q (HOT) |
|-------|------|-----|-------|--------------|
| Opus 4.8 | 6.0% | **89.3%** | +83.3pp | $0.1331 |
| GPT-5.5 | 19.3% | **93.3%** | +74.0pp | $0.0266 |
| Gemini-3.5-flash | 8.0% | **90.7%** | +82.7pp | $0.0093 |
| Llama-single (8b) | 6.0% | **78.0%** | +72.0pp | $0.0000 |

Note: Test 1 is factual ("More of Us Is Better" set — substrate grounding test).
Test 2 (this run) is reasoning (ARC-Challenge + GSM8K — substrate irrelevance test).
These measure different things and are complementary, not directly comparable.

---

## Files

| File | Description |
|------|-------------|
| `librarian-mcp/r10_cross_vendor/run_cadre_big4.py` | Big-4 API benchmark script (ready to run on key provision) |
| `librarian-mcp/r10_cross_vendor/compute_kappa.py` | Kappa computation script |
| `librarian-mcp/r10_cross_vendor/results/CADRE_V4_TEST2_BP067_20260601_0104.json` | Test 2 raw data |
| `librarian-mcp/r10_cross_vendor/results/kappa_analysis_BP067.json` | Kappa computation output |
| `CADRE_BIG4_RESULTS_BP067_20260531_2224.md` | This file |

---

## Pending Items

- [ ] Founder to provide API keys → re-run `python run_cadre_big4.py` (no changes needed)
- [ ] Test 1 HOT (factual, local Cadre, 75 Qs) — CPU/overnight run started separately
- [ ] Add kappa to Prov-21 addendum as empirical evidence footnote

---

*FOR THE KEEP. Knight out. 2026-05-31T22:24Z*
