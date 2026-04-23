# The Eyewitness Benchmark — R10 Cross-Vendor Replication Results
**Generated:** 2026-04-21 (Knight K423 / Bishop B111)
**Total cost:** ~$18 (inference $15.04 + grading $2.85)
**Inference calls:** 1,200 (4 vendors × 2 models × 2 conditions × 75 questions)
**Grading calls:** 1,200 primary (Haiku) + 120 spot-check (Opus) + 56 cross-check (Gemini)
**Questions:** 75 (55 canonical knowledge + 20 reasoning)

## Comparison Table

| Vendor | Model | Tier | HOT accuracy | COLD accuracy | Δ (HOT−COLD) | HOT cost/Q | COLD cost/Q | HOT p50 latency |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Anthropic | claude-haiku-4-5-20251001 | cheap | **98.7%** | 5.3% | +93.4 | $0.0066 | $0.0009 | 3.49s |
| Anthropic | claude-opus-4-7 | premium | **98.7%** | 6.7% | +92.0 | $0.1272 | $0.0222 | 5.87s |
| Perplexity | sonar-pro | premium | **98.0%** | 9.3% | +88.7 | $0.0144 | $0.0034 | 2.74s |
| Google | gemini-2.5-flash | cheap | 94.7% | 12.0% | +82.7 | $0.0007 | $0.0002 | 1.54s |
| Google | gemini-2.5-pro | premium | 94.0% | 8.7% | +85.3 | $0.0061 | $0.0016 | 5.41s |
| OpenAI (direct) | gpt-4o | premium | 93.3% | 8.7% | +84.6 | $0.0106 | $0.0015 | 7.38s |
| Perplexity | sonar | cheap | 92.0% | 7.3% | +84.7 | $0.0041 | $0.0003 | 3.14s |
| OpenAI (direct) | gpt-4o-mini | cheap | 89.3% | 11.3% | +78.0 | $0.0006 | $0.0001 | 1.69s |

## Analysis

The R9 preload works across all four vendors — every model jumps from single-digit COLD accuracy to 89%+ HOT accuracy, confirming that the knowledge-transfer mechanism is vendor-agnostic. The floor is 78 percentage points of improvement (GPT-4o-mini) and the ceiling is 93.4 points (Haiku). No model "already knew" the Liana Banyan corpus; COLD accuracy never exceeds 12%.

Anthropic dominates at the top: both Haiku and Opus hit 98.7% HOT accuracy, proving that even the cheapest Anthropic tier carries the preload faithfully. The surprise is Perplexity Sonar Pro at 98.0% — essentially matching Opus despite being a search-augmented model rather than a pure context-window reasoner. This suggests that Perplexity's retrieval layer may reinforce preload fidelity rather than competing with it. The Google models cluster at 94–95%, solid but consistently 4–5 points below the leaders. OpenAI's GPT-4o performs respectably at 93.3%, but GPT-4o-mini is the clear laggard at 89.3%, the only model below 90%.

On cost efficiency, Gemini 2.5 Flash is the standout: $0.0007/question HOT achieves 94.7% accuracy — that's 9× cheaper than Haiku for a 4-point accuracy trade-off. For bulk workloads where 95% is acceptable, Flash is the rational choice. For canonical authority (patent evidence, compliance), the Anthropic 98.7% accuracy justifies the premium. Latency tells a similar story: Flash and GPT-4o-mini lead at 1.5–1.7s, while GPT-4o trails at 7.4s — the slowest model in the benchmark by a wide margin.

## Inter-Rater Agreement

| Check | Kappa | n | Interpretation |
|---|---:|---:|---|
| Haiku vs Opus spot-check | **0.883** | 120 | Almost perfect agreement |
| Haiku vs Gemini Flash cross-grader | **0.850** | 56 | Almost perfect agreement |

*Primary grades: Claude Haiku 4.5 (canonical per B111 spec). Opus spot-check and Gemini Flash cross-check run on independent stratified samples with different random seeds. Both kappas >0.80 confirm grading stability across vendors and model tiers.*

## Methodology

- **Study design:** Single-blind. Grader receives question + reference answer + candidate response. No vendor, model, or condition identifiers are passed to the grader.
- **Conditions:** HOT = R9-v2 preload (~4,500 tokens) as system prompt. COLD = minimal "helpful assistant" system prompt.
- **Grading:** 3-tier rubric (CORRECT = 1.0, PARTIAL = 0.5, INCORRECT = 0.0) applied per-question with question-specific criteria.
- **Reproducibility:** All inference and grading JSONL files preserved. Random seeds fixed (42 for spot-check, 77 for cross-check, 99 reserved).
- **Budget:** $80 cap enforced programmatically. Actual spend ~$18.

---

## Posture Disclosure (required, verbatim)

> We include OpenAI in this study despite substantive concerns about their governance
> trajectory, because a cross-vendor study that excludes the market leader is not a
> cross-vendor study. Measurement is the contribution; endorsement is not conveyed by inclusion.

---
*The Eyewitness Benchmark — R10 Cross-Vendor Replication — K423 / B111 / SP-19*