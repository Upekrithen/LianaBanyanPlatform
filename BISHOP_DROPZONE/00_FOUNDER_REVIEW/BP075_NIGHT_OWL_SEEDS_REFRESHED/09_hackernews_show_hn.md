---
platform: Hacker News (Show HN)
variant_id: Variant-7 (BP075 refresh)
refreshed_by: Bishop SEG BP075
refreshed_at: 2026-06-05
source: BP074_NIGHT_OWL_SEEDS/09_hackernews_show_hn.md
augur_reconciliation: No Augur stub for this file. The SKU tier list (NANO/CORE/LITE/FULL) in the original described bundle sizes for v0.1.26, which is not yet released. BP075 removes the SKU list; references v0.1.25 as the current live installer; notes v0.1.26 in verification. Membership pricing ($5/year identical for all members) is not mentioned in this file (appropriate for HN register).
changes_from_bp074:
  - outbound_url resolved to lianabanyan.com/proofs (was placeholder in Section 1 and noted in Section 2)
  - SKU tier list removed (was v0.1.26-specific; v0.1.26 not yet live; could trigger Augur-Pricing)
  - v0.1.25 identified as current live installer; v0.1.26 in verification noted
  - MMLU-Pro + GPQA benchmark updated: dispatched tonight, results expected approximately 28-30h
  - L08, L09, and L10 flags labeled explicitly by name in both Section 1 and Section 2
  - First-comment seed updated to match (references dispatched-tonight, not just "designed")
gate_status: READY FOR FOUNDER REVIEW
pre_dispatch_verify:
  - Bishop prediction hash: f42ad294...aac58 (85 plus-or-minus 3)
  - Knight prediction hash: 9839b78b...d87b
  - Actual score: 100.0% (25/25)
  - Arithmetic check: upper bound 88, actual 100, delta +12pp (NOT +15pp)
  - Banyan Metric: 90.45
  - Latency HOT: approximately 4,776ms
  - Title uses limitation-leads option
  - First-comment seed included as Section 2
  - EIN omitted (not appropriate for HN)
  - No em-dashes
  - No emojis
  - outbound_url: lianabanyan.com/proofs (confirmed)
  - No SKU tier list
---

# Hacker News -- Show HN (Variant 7, BP075 refresh)

---

## SECTION 1: SUBMISSION TITLE + BODY (what goes in the HN post itself)

**Title:**
Show HN: Gemma 4 12B hit 100% on our local harness -- L08 ceiling effect, L09 num_predict flag, sealed prediction +12pp off

---

**Body (self-text):**

Google's Gemma 4 12B scored 100.0% (25/25) on our local eval harness (lm-eval-harness, Ollama, commodity hardware). Banyan Metric 90.45. HOT latency approximately 4,776ms. $0.00 marginal.

Two honesty flags in the title on purpose:

**L08 -- ceiling effect:** 25 questions is a small subset. The ceiling effect means we cannot extract a substrate-attribution delta at 100%. A model this capable may saturate a 25-question harness regardless of what is installed alongside it. I am not claiming our local substrate caused the score. The substrate delta is 0pp on this question set by construction.

**L09 -- num_predict:** num_predict must be 2048 for this model, not the default 100. The thinking-model architecture requires enough token budget to complete the reasoning chain. Default budget truncates output and suppresses scores significantly.

What I think is worth the Show HN: the sealed prediction protocol.

Two independent Anthropic Sonnet instances, separate context windows, no shared state, each wrote a sealed prediction before the eval ran. Bishop: 85 plus-or-minus 3 (hash f42ad294...aac58). Knight: independent hash 9839b78b...d87b. Actual: 100.0%, which is +12pp above the upper bound of the sealed prediction band (100 vs predicted center 85, +12pp above the upper bound of the band). Both predictions hash-verifiable.

**L10 PENDING -- formal benchmark:** The substrate-controlled comparison (present vs absent, same questions) was dispatched tonight against Google's MMLU-Pro (their published anchor 77.2%) and GPQA Diamond (their anchor 78.8%). 4-condition matrix. Results expected approximately 28-30 hours. Will post results with the same sealed-prediction format.

Methodology and Proof Cue Card: lianabanyan.com/proofs

MnemosyneC is the substrate layer. Local, $5/yr, no cloud, no VC. Current live installer: v0.1.25 (v0.1.26 is in verification on a cold-machine test and not yet released to GitHub Releases). Methodology questions welcome.

---

## SECTION 2: FIRST-COMMENT SEED (post immediately as the submitter's first reply)

**First comment text:**

Anticipating the obvious objections -- they are correct and I tried to lead with them.

**L08 -- Sample size and ceiling effect:** 25 questions is not a serious benchmark on its own. It is a ceiling-level result on a small subset. The 100% score tells us the model is very capable; it does not tell us anything about the substrate's contribution. We know that. The substrate delta is 0pp on this question set by construction.

**L09 -- num_predict methodology:** The num_predict setting was 2048, not the default 100. This model's thinking-model architecture requires that budget. Without it, outputs truncate mid-reasoning chain and scores drop significantly. Any comparison against a default-setting run is not apples-to-apples.

**Why publish a ceiling result:** The sealed-prediction protocol is the thing being demonstrated, not the score. Two independent predictions, hash-verifiable, written cold before the result. +12pp off the upper bound is interesting calibration data even if the score itself is uninterpretable for substrate attribution.

**L10 PENDING -- formal benchmark:** 4-condition matrix, substrate present vs absent, MMLU-Pro + GPQA Diamond. Google published 77.2% and 78.8% respectively for this model. Those benchmarks have variance room. The harness was dispatched tonight. Results expected approximately 28-30 hours. If the substrate shows lift, we will report it with the same protocol. If 0pp, same.

Current live installer is v0.1.25. v0.1.26 is in verification on a cold-machine test and not yet released to GitHub Releases. Happy to discuss harness setup or prediction methodology in thread.

---

## Pre-Dispatch Verify Checklist

- [ ] lianabanyan.com/proofs live with Sound Barrier card visible in incognito
- [ ] v0.1.25 download with verification banner confirmed live
- [ ] +12pp arithmetic confirmed (upper bound 88, actual 100)
- [ ] No "+15pp" anywhere
- [ ] No em-dashes
- [ ] No emojis
- [ ] Title leads with L08/L09 flags
- [ ] L08, L09, and L10 labeled explicitly by name in both Section 1 and Section 2
- [ ] First-comment seed preempts sample-size, ceiling-effect, and num_predict objections
- [ ] EIN omitted
- [ ] No SKU tier list (removed; v0.1.26 not yet live)
- [ ] Google anchors cited as Google's published numbers
- [ ] outbound_url: lianabanyan.com/proofs (confirmed)
- [ ] HN best submission time: early-morning Pacific (9am-11am Mon-Fri) for maximum front-page reach
