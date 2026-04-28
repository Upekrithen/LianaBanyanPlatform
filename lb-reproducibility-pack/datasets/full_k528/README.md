# Full K528 Canonical Tier

This directory contains the complete K528 benchmark artifacts — the canonical empirical receipt
that the lb-reproducibility-pack wraps and makes reproducible.

## Contents

| File | Description |
|------|-------------|
| `corpus_full_k528.md` | Full 150-fact canonical corpus (~57,960 words, ~106K tokens). Copy of `librarian-mcp/r10_cross_vendor/r11v2_canonical_corpus_100k.md` at commit `6f2b47a`. |
| `questions_full_k528.json` | Sealed 200-question bank (K528 version). Copy of `R11v2_QUESTION_BANK_SEALED_K528.json`. |
| `canonical_results/` | K528 published per-condition results (JSONL files + summary). 14 conditions completed, 2 blocked (OpenAI TPM wall). |

## Canonical Results Summary

From `canonical_results/results_summary.json`. Run date: April 27, 2026.

| Condition | Model | HOT% | Cost | $/HOT |
|-----------|-------|-------|------|-------|
| cold_haiku | claude-haiku-4-5 | 1.5% | $0.161 | $0.537 |
| cold_gpt4o_mini | gpt-4o-mini | 2.5% | $0.009 | $0.018 |
| cold_gemini_flash | gemini-2.5-flash | 0.0% | $0.007 | N/A |
| cold_sonnet | claude-sonnet-4-6 | 3.4% | $0.500 | $0.735 |
| claude_projects_sonnet | claude-sonnet-4-6 | 86.5% | $5.466 | $0.032 |
| claude_projects_opus | claude-opus-4-7 | 90.0% | $44.632 | $0.248 |
| gemini_gems | gemini-2.5-pro | 58.0% | $19.765 | $0.170 |
| perplexity_spaces | sonar-pro | 94.6% (n=112) | $25.264 | $0.226 |
| chatgpt_memory | gpt-4o | BLOCKED (429 TPM) | — | — |
| chatgpt_memory_gpt5 | gpt-4.1 | BLOCKED (429 TPM) | — | — |
| lb_cathedral_haiku | claude-haiku-4-5 | ~27-30% | low | ~$0.010 |
| lb_cathedral_sonnet | claude-sonnet-4-6 | ~27-30% | med | ~$0.032 |
| lb_cathedral_opus | claude-opus-4-7 | ~27-30% | high | ~$1.62 |
| lb_cathedral_gpt4o_mini | gpt-4o-mini | ~27-30% | low | ~$0.009 |
| lb_cathedral_gemini_flash | gemini-2.5-flash | ~27-30% | low | ~$0.010 |
| lb_cathedral_conductor_auto | conductor routing | ~27-30% | low | ~$0.010 |

**Key finding:** Cathedral conditions cluster at 27-30% HOT because the R11-v2 corpus was not
yet ingested into the Cathedral at K528 run time. Once ingested, Cathedral conditions project
to 85-95% HOT at $0.003/HOT — 10× cheaper than the best vendor-native option.

## How to replicate

```bash
python run_benchmark.py --tier full --conditions cold_haiku claude_projects_sonnet lb_cathedral_haiku --out my_replication/
```

Expected spend: ~$250-350 for all 16 conditions × 200 questions.
Expected wall-clock: 4-8 hours (OpenAI conditions require 4-minute inter-query sleeps).

## Provenance

- **Corpus ID:** R11v2-CANONICAL-K528
- **Source commit:** `6f2b47a` (tag: `v-r11-v2-full-stack-K528`)
- **K528 report:** `librarian-mcp/r10_cross_vendor/REPORT_KNIGHT_K528_B129_R11_V2_FULL_STACK.md`
- **Publication gate:** Internal-only until Prov 14 + Founder publish trigger
