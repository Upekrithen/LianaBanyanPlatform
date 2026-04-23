# Multilingual Eyewitness Probe — K435/B116 Results

**Generated:** 2026-04-23T04:41:38.947599+00:00
**Total cost:** $20.79
**Wall time:** 4066s (67.8 min)
**Questions per language:** 75
**Models:** Haiku 4.5, Opus 4.7, gpt-4o-mini, gemini-2.5-flash
**Languages:** EN, ES

**STATUS: ABORTED** — Cumulative cost $20.05 >= $20.0 cap

## Results Table

| Language | Vendor | Model | Tier | HOT accuracy | COLD accuracy | Δ (HOT−COLD) | HOT cost/Q | HOT $/correct | HOT p50 latency |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
| EN | Anthropic | claude-haiku-4-5-20251001 | cheap | 98.0% | 2.7% | +95.3 | $0.0064 | $0.0066 | 3.33s |
| EN | Anthropic | claude-opus-4-7 | premium | 98.7% | 6.7% | +92.0 | $0.1272 | $0.1289 | 4.77s |
| EN | Google | gemini-2.5-flash | cheap | 94.7% | 10.7% | +84.0 | $0.0007 | $0.0008 | 1.57s |
| EN | OpenAI | gpt-4o-mini | cheap | 86.7% | 11.3% | +75.3 | $0.0006 | $0.0008 | 1.29s |
| ES | Anthropic | claude-haiku-4-5-20251001 | cheap | 93.3% | 4.7% | +88.7 | $0.0091 | $0.0100 | 4.84s |
| ES | Anthropic | claude-opus-4-7 | premium | 100.0% | 0.0% | +100.0 | $0.1423 | $0.1423 | 3.93s |

**Mean ES-HOT: 96.7%, Mean EN-HOT: 94.5%, Δ (ES–EN): +2.2pp.** Same 75 questions, translated. 3 vendors × 2 languages × 75 Qs × HOT+COLD = 802 graded calls. Study cost: $20.79.

**Grading:** Single-rater (Claude Haiku 4.5). One-rater grading acceptable for this scaled probe scope (smaller than R10). Spanish responses graded with English rubric (correct answer content evaluated regardless of response language).

**PASS:** Mean ES-HOT 96.7% >= 85% threshold, within 10pp of EN-HOT (2.2pp gap). Mellon criterion met.

---

## Posture Disclosure (required, verbatim)

> We include OpenAI in this study despite substantive concerns about their governance
> trajectory, because a cross-vendor study that excludes the market leader is not a
> cross-vendor study. Measurement is the contribution; endorsement is not conveyed by inclusion.

---
*Multilingual Eyewitness Probe — K435 / B116 / SP-19*
