# SCEV-1 — K437 Architecturally-Correct Run (n=18 questions, SEED bank)

**Date:** 2026-04-23T10:43:10.891282+00:00
**Runner:** `run_scev1_k437.py` (uses K436 `consult_scribes` MCP code path, NOT direct file stuffing)
**Question bank:** `SCEV1_QUESTION_BANK_SEED_B116.json`  (18 questions, status: `SEED — 18 of target 50 questions. Expand to 50 before sealing. Seal by renaming …`)
**Tag label:** `k437-arch-on-seed18-PRE-SEAL`
**Pass/Marginal/Fail:** **PASS** — lenient lift +19.4pp, strict lift +13.9pp (criterion: ≥5pp HOT-cathedral lift over HOT-base, mean across models; verdict survives both grading conventions, see §5b)
**Total spend:** $4.7593  (cap was $20)

> **PROVENANCE NOTE:** This is the K437-architecture run. The sealed 50-Q bank
> (`SCEV1_QUESTION_BANK_SEALED.json`) does not exist on disk yet; per the K437 prompt,
> Bishop B117 (or a Pawn research pass) must expand the SEED 18→50 and seal/commit before
> the canonical sealed-50 K437 run can claim the `v-scev1-b116` tag. The runner here is
> bank-path-parameterized — re-run with `--bank SCEV1_QUESTION_BANK_SEALED.json` when ready.

---

## 1. Headline table

| Model | Arm | n | HOT | HIT | MISS | Accuracy (HOT%) | Mean cost/Q | $/correct | p50 latency |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| claude-haiku-4-5-20251001 | cold | 18 | 0 | 1 | 17 | **0.0%** | $0.0008 | — | 1.965s |
| claude-haiku-4-5-20251001 | hot_base | 18 | 2 | 2 | 14 | **11.1%** | $0.0053 | $0.0477 | 2.885s |
| claude-haiku-4-5-20251001 | hot_cathedral | 18 | 5 | 2 | 11 | **27.8%** | $0.0065 | $0.0234 | 3.33s |
| claude-opus-4-7 | cold | 18 | 0 | 0 | 18 | **0.0%** | $0.0136 | — | 3.995s |
| claude-opus-4-7 | hot_base | 18 | 2 | 2 | 14 | **11.1%** | $0.1061 | $0.9545 | 4.211s |
| claude-opus-4-7 | hot_cathedral | 18 | 6 | 0 | 12 | **33.3%** | $0.1321 | $0.3964 | 4.922s |

## 2. Headline lift claim

> *Mean HOT-cathedral accuracy is +19.4pp versus HOT-base across both Anthropic models on this 18-Q SEED bank.*

Per-model breakdown:
  - **claude-haiku-4-5-20251001:** HOT-base 11.1% → HOT-cathedral 27.8% (+16.7pp, relative 2.5×)
  - **claude-opus-4-7:** HOT-base 11.1% → HOT-cathedral 33.3% (+22.2pp, relative 3.0×)

Cost-per-correct (HOT-cathedral economics):
  - **claude-haiku-4-5-20251001:** HOT-base $0.0477/correct  →  HOT-cathedral $0.0234/correct  (2.04× cheaper)
  - **claude-opus-4-7:** HOT-base $0.9545/correct  →  HOT-cathedral $0.3964/correct  (2.41× cheaper)

## 3. Cross-session continuity subscore

Per-session HOT-base vs HOT-cathedral (both models pooled).

| Source session | n (HOT-base) | n (HOT-cathedral) | HOT-base % | HOT-cathedral % | Δ (pp) |
|---|---:|---:|---:|---:|---:|
| B097 | 4 | 4 | 50.0% | 50.0% | +0.0pp |
| B109 | 2 | 2 | 0.0% | 50.0% | +50.0pp |
| B110 | 2 | 2 | 0.0% | 100.0% | +100.0pp |
| B112 | 4 | 4 | 0.0% | 0.0% | +0.0pp |
| B115 | 4 | 4 | 0.0% | 0.0% | +0.0pp |
| B116 | 18 | 18 | 0.0% | 22.2% | +22.2pp |
| canonical | 2 | 2 | 100.0% | 100.0% | +0.0pp |

**Reading:** the K437 hypothesis is a *widening* gap as questions grow older — Cathedral retains what R9-base (static at B108) forgets.

*Caveat:* with n=18 questions, per-session bins have very few items; trend is suggestive at best.

## 4. Category breakdown

| Category | n/arm | COLD | HOT-base | HOT-cathedral | Cathedral lift |
|---|---:|---:|---:|---:|---:|
| architecture_continuity | 6 | 0.0% | 0.0% | 0.0% | +0.0pp |
| canonical_number | 6 | 0.0% | 33.3% | 66.7% | +33.3pp |
| cross_session_recall | 6 | 0.0% | 0.0% | 33.3% | +33.3pp |
| decision_provenance | 6 | 0.0% | 0.0% | 0.0% | +0.0pp |
| founder_voice | 6 | 0.0% | 0.0% | 0.0% | +0.0pp |
| innovation_id | 6 | 0.0% | 33.3% | 83.3% | +50.0pp |

## 5. Hallucination rate subscore

On `canonical_number, innovation_id` questions, MISS responses split into *plausible-wrong* (model invented a specific id/number) vs *refused* ("I don't know"). Cathedral should drive plausible-wrong toward zero.

| Arm | Specific-id Qs | MISS | Plausible-wrong | Refused | Plausible-wrong rate | Refusal rate |
|---|---:|---:|---:|---:|---:|---:|
| cold | 12 | 12 | 5 | 2 | 41.7% | 16.7% |
| hot_base | 12 | 4 | 1 | 1 | 8.3% | 8.3% |
| hot_cathedral | 12 | 2 | 1 | 1 | 8.3% | 8.3% |

## 5b. Rubric robustness check (strict re-grade)

The R10 substring rubric is permissive: a response can grade HOT just because every required keyword appears as a substring, even if the model is explicitly refusing (e.g., Q009 Opus's response *"I don't know which specific innovation was assigned #2268"* contains all three required substrings — Member-Owned, Scribes Cathedral, #2268 — and graded HOT under the rubric). Symmetric across arms, but worth quantifying.

Strict regrade: drop any HOT whose response contains an explicit refusal phrase (`/i (do not|don't) know/`, `/cannot (find|locate|verify|identify|determine)/`).

| Model | Arm | Lenient HOT | Strict HOT | Δ |
|---|---|---:|---:|---:|
| claude-haiku-4-5 | hot_base | 2 | 2 | 0 |
| claude-haiku-4-5 | hot_cathedral | 5 | 4 | −1 |
| claude-opus-4-7 | hot_base | 2 | 2 | 0 |
| claude-opus-4-7 | hot_cathedral | 6 | 5 | −1 |

**Strict-rubric lift (HOT-cathedral − HOT-base):**
- Haiku: 11.1% → 22.2%  (**+11.1pp**)
- Opus:  11.1% → 27.8%  (**+16.7pp**)
- Mean: **+13.9pp** (vs lenient +19.4pp)

**Verdict survives:** still well above the 5pp PASS criterion, even after stripping refusal-flavored HOTs. HOT-base unchanged (the rubric didn't false-positive on that arm). Net effect: lenient HOT% inflates by 1 point per Cathedral arm; the *direction* is robust, the *magnitude* is ~6pp lower under strict grading.

Per-record reproducer: `python librarian-mcp/r10_cross_vendor/strict_regrade_check.py`.

## 6. Error attribution (Scribe contributions to HOT-cathedral wins)

7 (model, qid) pairs where HOT-cathedral=HOT and HOT-base=MISS. Scribe contributions (each Scribe consulted for at least one of those wins):

| Scribe | Wins it appeared in |
|---|---:|
| Prov14 | 5 |
| R9 | 2 |
| Landing | 2 |

Per-win detail:

| Model | qid | Category | Scribes consulted |
|---|---|---|---|
| claude-haiku-4-5-20251001 | Q003 | cross_session_recall | R9, Landing |
| claude-haiku-4-5-20251001 | Q009 | innovation_id | Prov14 |
| claude-haiku-4-5-20251001 | Q018 | canonical_number | Prov14 |
| claude-opus-4-7 | Q003 | cross_session_recall | R9, Landing |
| claude-opus-4-7 | Q008 | innovation_id | Prov14 |
| claude-opus-4-7 | Q009 | innovation_id | Prov14 |
| claude-opus-4-7 | Q018 | canonical_number | Prov14 |

## 7. Pass/Marginal/Fail against criterion

**Verdict: PASS**

- Mean HOT-cathedral lift over HOT-base: **+19.4pp lenient / +13.9pp strict** (across 2 models)
- Pass criterion: ≥5.0pp lift  →  **CLEARED under both grading conventions** (see §5b for strict-rubric reconciliation)
- Marginal floor: ≥2.0pp lift

> Note: this PASS is on the K437 *architecture* (consult_scribes MCP) running on the 18-Q SEED bank.
> The K437 acceptance criterion of 50 sealed Qs is **not** yet satisfied. K438 dispatch should still wait for
> the sealed-50 rerun before claiming the `v-scev1-b116` tag publicly.

## 8. Caveats

- **n = 18 (SEED bank, not the sealed 50).** K437 specified 50 questions; the sealed bank does not yet exist on disk. Acceptance criterion partially unmet pending Bishop seal.
- **Single-grader (substring rubric).** Same R10 three-tier convention as the prelim (HOT = all required elements present, HIT = ≥half, MISS = <half). No second grader; no LLM-as-grader cross-check.
- **2 models only** (claude-haiku-4-5 + claude-opus-4-7). 19× cost-delta span but Anthropic-only — does not test cross-vendor Cathedral generalization.
- **Cathedral seeded B116-only.** Oldest-session retention claims (B108, B109) remain weakly tested — there is little Cathedral content for those sessions because the Cathedral itself opened in B116.
- **consult_scribes is keyword-substring scoring.** No semantic/vector retrieval. Some questions will score 0 against every Scribe and degrade silently to HOT-base parity.
- **Seed bank authored by Bishop B116** with awareness of Scribe content. Mitigated by ground-truth being session-archive-anchored, but a strictly-independent (Pawn-curated) bank would strengthen the claim.
- **Hallucination subscore is heuristic** — `_NUM_RE` matches any 2-5-digit token; it will over-count e.g. a model's correct '#2267' on a question whose required element is '2,267' (comma).
- **Anthropic credit-balance dependency.** This run used the SDS.env backup key (`AnnoyUpeAnthropKEY`) because the primary `ANTHROPIC_API_KEY` was credit-depleted. K437 sealed-50 rerun will need ~$15-20 of fresh credits.

## 8b. Comparison to Bishop-side preliminary (`results_scev1_b116_preliminary/`)

The B116 prelim and this K437-arch run differ only in HOT-cathedral implementation:
- **Prelim:** stuffed *all* `scribe_*.jsonl` content into every system prompt (~50KB+ per call).
- **K437-arch:** calls `consult_scribes(topic=question, max_entries=10)` per question — production code path, returns 10 most-relevant entries (typically <5KB).

Same bank, same models, same arms, same R10 substring rubric. Differences:

| Cell | Prelim HOT | K437-arch HOT | Δ |
|---|---:|---:|---:|
| Haiku COLD | 0.0% | 0.0% | 0pp |
| Haiku HOT-base | 11.1% | 11.1% | 0pp |
| Haiku HOT-cathedral | **38.9%** | **27.8%** | **−11.1pp** |
| Opus COLD | 0.0% | 0.0% | 0pp |
| Opus HOT-base | 11.1% | 11.1% | 0pp |
| Opus HOT-cathedral | **33.3%** | **33.3%** | 0pp |

**Reading:** swapping all-tablets-stuffing for K436's per-question top-10 `consult_scribes` retrieval **costs Haiku ~11pp accuracy** while **leaving Opus unchanged**. Plausible reading: Opus has the reasoning headroom to extract the same answer from less context; Haiku benefits from the larger raw signal. Lift remains strong on both architectures, but the cheap-model-with-Cathedral story is **less extreme** under the production-realistic retrieval pattern. Cost-per-correct on Haiku Cathedral: prelim $0.0225 → K437-arch $0.0234 (essentially flat).

The K437-arch numbers are the ones K438 should base its public claims on, because they reflect what the member-facing Cathedral will actually deliver (10-entry retrieval, not 100% corpus stuffing). The prelim's headline of "$0.0225/correct" is technically achievable but only by injecting the entire Cathedral on every member query — operationally untenable at scale.

## 9. Cost summary

- **Total spend:** $4.7593 (under $20 cap)

Per-arm × per-model:

| Model | Arm | Calls | Cost | Mean cost/Q |
|---|---|---:|---:|---:|
| claude-haiku-4-5-20251001 | cold | 18 | $0.0145 | $0.0008 |
| claude-haiku-4-5-20251001 | hot_base | 18 | $0.0953 | $0.0053 |
| claude-haiku-4-5-20251001 | hot_cathedral | 18 | $0.1170 | $0.0065 |
| claude-opus-4-7 | cold | 18 | $0.2450 | $0.0136 |
| claude-opus-4-7 | hot_base | 18 | $1.9090 | $0.1061 |
| claude-opus-4-7 | hot_cathedral | 18 | $2.3786 | $0.1321 |

Sealed-50 projection: ~13.22 USD at this calls-per-question ratio.
