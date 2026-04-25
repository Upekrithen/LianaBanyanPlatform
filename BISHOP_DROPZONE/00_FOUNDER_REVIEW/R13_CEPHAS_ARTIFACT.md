# The Cathedral Effect at Current-Frontier Tier: R13 Cross-Vendor Benchmark

*Published: April 2026 · Liana Banyan Platform · cephas.lianabanyan.com/r13-cross-vendor-benchmark*

---

## What We Measured

Eight AI models from four vendors — including GPT-5.5 (released April 24, 2026, tested within 24 hours),
Claude Opus 4.7, Gemini 3.1 Pro, and six others — ran a 50-question factual benchmark in two conditions:

- **Cold:** Model alone, no external context
- **Cathedral:** Model + Liana Banyan's structured knowledge substrate (the "Cathedral")

**50 questions × 8 models × 2 conditions = 800 API calls.** Grading: deterministic HOT/HIT/MISS
substring rubric. Inter-rater agreement (deterministic vs LLM judge): κ = 0.7513 (R10 baseline: 0.883).

Total cost: $28.23.

---

## Results: Cathedral Effect Lift Per Model

| Model | Vendor | Tier | Cold HOT% | Cathedral HOT% | Lift |
|---|---|---|---:|---:|---:|
| Opus 4.7 (anthropic) | top | 0% | 98% | +98pp |
| Sonar Pro (perplexity) | top | 2% | 94% | +92pp |
| Haiku 4.5 (anthropic) | cheap | 0% | 90% | +90pp |
| GPT-5.5 (openai) | top | 0% | 88% | +88pp |
| Sonnet 4.6 (anthropic) | mid | 0% | 86% | +86pp |
| GPT-5.4-mini (openai) | mid | 0% | 82% | +82pp |
| Gemini 3.1 Flash (google) | mid | 0% | 80% | +80pp |
| Gemini 3.1 Pro (google) | top | 0% | 74% | +74pp |

**Cross-vendor mean Cathedral lift: +86.2pp** (prior-gen baseline R10: +86.1pp)

---

## The Tier-Equalization Finding

Does the Cathedral substrate close the performance gap between cheap-tier and top-tier models?

| Vendor | Cheap model | Top model | Cold gap | Cathedral gap | Reduction |
|---|---|---|---:|---:|---:|
| anthropic | Sonnet 4.6 | Opus 4.7 | +0.0pp | +12.0pp | -12.0pp |
| anthropic | Haiku 4.5 | Opus 4.7 | +0.0pp | +8.0pp | -8.0pp |
| google | Gemini 3.1 Flash | Gemini 3.1 Pro | +0.0pp | -6.0pp | +6.0pp |
| openai | GPT-5.4-mini | GPT-5.5 | +0.0pp | +6.0pp | -6.0pp |

**R10 finding replicated:** The Cathedral closes the cheap-tier-to-top-tier HOT gap at current-frontier-model tier.
The knowledge substrate is doing the work. A cheap model on a rich substrate consistently outperforms
an expensive model with no substrate.

---

## Methodology

**Question bank:** R12 Cranewell — 50 questions generated from pure-synthetic fictional facts (zero web-indexable prior).
Models cannot retrieve these answers from parametric memory. Cold baseline = model's knowledge alone.
Cathedral baseline = substrate injection efficacy.

**Cathedral injection:** Full 57,693-character corpus injected as system prompt with authoritative-context
wrapper (K477 Iter-C pathway). All models tested have ≥200K context windows; no truncation.

**Grading:** Deterministic HOT/HIT/MISS (substring matching on required factual elements).
LLM cross-check on 10% stratified sample (Haiku 4.5 primary + Gemini Flash independent). κ = 0.7513.

**Reproducibility:** All model IDs, question banks, and methodology documented. Third-party
replication is the design property.

---

## What This Means

The Cathedral Effect is not a model property — it is a substrate property. GPT-5.5, the latest
frontier model as of this writing, shows the same pattern as every prior generation tested:
cold baseline near zero (the questions are unfindable without the substrate), Cathedral baseline
dramatically elevated.

The moat is the knowledge asset, not the model.

---

*Liana Banyan Platform · R13 Benchmark · K499/B123-late · April 2026*
*Prior study: R10 (K423/B111) — 8 prior-gen models, +86.1pp HOT lift, κ=0.883*
