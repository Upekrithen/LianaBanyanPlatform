# SCEV-1 — K437 Architecturally-Correct Run (n=50 questions, SEALED bank)

**Date:** 2026-04-23T11:32:40.989292+00:00
**Runner:** `run_scev1_k437.py` (uses K436 `consult_scribes` MCP code path, NOT direct file stuffing)
**Question bank:** `SCEV1_QUESTION_BANK_SEALED.json`  (50 questions, status: `SEALED — 50 questions. Source of record for K437-on-sealed-50 run and K438 gate …`)
**Tag label:** `v-scev1-b116`
**Pass/Marginal/Fail:** **PASS** — lenient lift +6.0pp, strict lift +5.0pp (criterion: ≥5.0pp; verdict survives both grading conventions, see §5b)
**Total spend:** $13.3979  (cap was $20)

> **PROVENANCE NOTE:** This is the canonical K437 run on the **sealed** 50-Q bank shipped by
> Bishop B117 (`SCEV1_QUESTION_BANK_SEALED.json`). Reuses the SEED-18 runner/analyzer scripts unchanged in
> behavior; the only differences vs the SEED-18 report are (a) which bank is loaded and
> (b) the analyzer now emits §5b (strict regrade) and §8b (vs prior run) directly. K438
> Cathedral-ship dispatch is gated on this run's verdict.

---

## 1. Headline table

| Model | Arm | n | HOT | HIT | MISS | Accuracy (HOT%) | Mean cost/Q | $/correct | p50 latency |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| claude-haiku-4-5-20251001 | cold | 50 | 0 | 3 | 47 | **0.0%** | $0.0008 | — | 1.934s |
| claude-haiku-4-5-20251001 | hot_base | 50 | 2 | 10 | 38 | **4.0%** | $0.0053 | $0.1330 | 2.846s |
| claude-haiku-4-5-20251001 | hot_cathedral | 50 | 4 | 16 | 30 | **8.0%** | $0.0064 | $0.0805 | 3.65s |
| claude-opus-4-7 | cold | 50 | 0 | 3 | 47 | **0.0%** | $0.0148 | — | 3.86s |
| claude-opus-4-7 | hot_base | 50 | 2 | 10 | 38 | **4.0%** | $0.1090 | $2.7246 | 3.777s |
| claude-opus-4-7 | hot_cathedral | 50 | 6 | 9 | 35 | **12.0%** | $0.1316 | $1.0968 | 5.134s |

## 2. Headline lift claim

> *Mean HOT-cathedral accuracy is +6.0pp versus HOT-base across both Anthropic models on this 50-Q SEALED bank.*

Per-model breakdown:
  - **claude-haiku-4-5-20251001:** HOT-base 4.0% → HOT-cathedral 8.0% (+4.0pp, relative 2.0×)
  - **claude-opus-4-7:** HOT-base 4.0% → HOT-cathedral 12.0% (+8.0pp, relative 3.0×)

Cost-per-correct (HOT-cathedral economics):
  - **claude-haiku-4-5-20251001:** HOT-base $0.1330/correct  →  HOT-cathedral $0.0805/correct  (1.65× cheaper)
  - **claude-opus-4-7:** HOT-base $2.7246/correct  →  HOT-cathedral $1.0968/correct  (2.48× cheaper)

## 3. Cross-session continuity subscore

Per-session HOT-base vs HOT-cathedral (both models pooled).

| Source session | n (HOT-base) | n (HOT-cathedral) | HOT-base % | HOT-cathedral % | Δ (pp) |
|---|---:|---:|---:|---:|---:|
| B036 | 4 | 4 | 0.0% | 0.0% | +0.0pp |
| B097 | 10 | 10 | 20.0% | 20.0% | +0.0pp |
| B107 | 2 | 2 | 0.0% | 0.0% | +0.0pp |
| B109 | 2 | 2 | 0.0% | 100.0% | +100.0pp |
| B110 | 10 | 10 | 0.0% | 10.0% | +10.0pp |
| B112 | 4 | 4 | 0.0% | 0.0% | +0.0pp |
| B113 | 8 | 8 | 0.0% | 0.0% | +0.0pp |
| B113-B114 | 2 | 2 | 0.0% | 0.0% | +0.0pp |
| B114 | 2 | 2 | 0.0% | 0.0% | +0.0pp |
| B115 | 8 | 8 | 0.0% | 0.0% | +0.0pp |
| B116 | 36 | 36 | 0.0% | 8.3% | +8.3pp |
| B117 | 4 | 4 | 0.0% | 0.0% | +0.0pp |
| canonical | 4 | 4 | 50.0% | 50.0% | +0.0pp |
| cross-session | 4 | 4 | 0.0% | 0.0% | +0.0pp |

**Reading:** the K437 hypothesis is a *widening* gap as questions grow older — Cathedral retains what R9-base (static at B108) forgets.

## 4. Category breakdown

| Category | n/arm | COLD | HOT-base | HOT-cathedral | Cathedral lift |
|---|---:|---:|---:|---:|---:|
| architecture_continuity | 16 | 0.0% | 0.0% | 0.0% | +0.0pp |
| canonical_number | 16 | 0.0% | 12.5% | 18.8% | +6.2pp |
| cross_session_recall | 18 | 0.0% | 0.0% | 11.1% | +11.1pp |
| decision_provenance | 16 | 0.0% | 0.0% | 0.0% | +0.0pp |
| founder_voice | 16 | 0.0% | 0.0% | 0.0% | +0.0pp |
| innovation_id | 18 | 0.0% | 11.1% | 27.8% | +16.7pp |

## 5. Hallucination rate subscore

On `canonical_number, innovation_id` questions, MISS responses split into *plausible-wrong* (model invented a specific id/number) vs *refused* ("I don't know"). Cathedral should drive plausible-wrong toward zero.

| Arm | Specific-id Qs | MISS | Plausible-wrong | Refused | Plausible-wrong rate | Refusal rate |
|---|---:|---:|---:|---:|---:|---:|
| cold | 34 | 34 | 8 | 4 | 23.5% | 11.8% |
| hot_base | 34 | 18 | 6 | 1 | 17.6% | 2.9% |
| hot_cathedral | 34 | 13 | 8 | 0 | 23.5% | 0.0% |

## 5b. Rubric robustness check (strict re-grade)

The R10 substring rubric is permissive: a response can grade HOT just because every required keyword appears as a substring, even if the model is explicitly refusing (e.g., "I don't know which specific innovation was assigned #2268" can contain all required substrings). This bias is symmetric across arms but worth quantifying.

Strict regrade: drop any HOT whose response contains an explicit refusal phrase (`/i (do not|don't) know/`, `/cannot (find|locate|verify|identify|determine)/`).

| Model | Arm | Lenient HOT | Strict HOT | Δ |
|---|---|---:|---:|---:|
| claude-haiku-4-5-20251001 | cold | 0 | 0 | +0 |
| claude-haiku-4-5-20251001 | hot_base | 2 | 2 | +0 |
| claude-haiku-4-5-20251001 | hot_cathedral | 4 | 4 | +0 |
| claude-opus-4-7 | cold | 0 | 0 | +0 |
| claude-opus-4-7 | hot_base | 2 | 2 | +0 |
| claude-opus-4-7 | hot_cathedral | 6 | 5 | -1 |

**Strict-rubric lift (HOT-cathedral − HOT-base):**
- claude-haiku-4-5-20251001: HOT-base 4.0% → Cathedral 8.0%  (+4.0pp)
- claude-opus-4-7: HOT-base 4.0% → Cathedral 10.0%  (+6.0pp)
- **Mean: +5.0pp** (vs lenient +6.0pp)

**Verdict survives the strict rubric:** still ≥5.0pp PASS criterion under refusal-stripped grading.

## 6. Error attribution (Scribe contributions to HOT-cathedral wins)

6 (model, qid) pairs where HOT-cathedral=HOT and HOT-base=MISS. Scribe contributions (each Scribe consulted for at least one of those wins):

| Scribe | Wins it appeared in |
|---|---:|
| Prov14 | 4 |
| R9 | 2 |
| Landing | 2 |

Per-win detail:

| Model | qid | Category | Scribes consulted |
|---|---|---|---|
| claude-haiku-4-5-20251001 | Q003 | cross_session_recall | R9, Landing |
| claude-haiku-4-5-20251001 | Q008 | innovation_id | Prov14 |
| claude-opus-4-7 | Q003 | cross_session_recall | R9, Landing |
| claude-opus-4-7 | Q008 | innovation_id | Prov14 |
| claude-opus-4-7 | Q035 | innovation_id | Prov14 |
| claude-opus-4-7 | Q018 | canonical_number | Prov14 |

## 7. Pass/Marginal/Fail against criterion

**Verdict: PASS**

- Mean HOT-cathedral lift over HOT-base: **+6.0pp** (across 2 models)
- Pass criterion: ≥5.0pp lift  →  **CLEARED**
- Marginal floor: ≥2.0pp lift

> Note: this PASS is on the canonical K437 *architecture* (consult_scribes MCP) running
> on the 50-Q SEALED bank. K437 acceptance criterion is fully satisfied; the
> commit may carry the `v-scev1-b116` tag. K438 Cathedral-ship dispatch is unblocked.

## 8. Caveats

- **n = 50 (sealed bank, K437 acceptance criterion satisfied).** Bishop B117 sealed `SCEV1_QUESTION_BANK_SEALED.json`; this run is the canonical K437 evidence and is allowed to carry the `v-scev1-b116` tag if PASS.
- **Single-grader (substring rubric).** Same R10 three-tier convention as the prelim (HOT = all required elements present, HIT = ≥half, MISS = <half). No second grader; no LLM-as-grader cross-check. See §5b for the strict-rubric robustness check.
- **2 models only** (claude-haiku-4-5 + claude-opus-4-7). 19× cost-delta span but Anthropic-only — does not test cross-vendor Cathedral generalization.
- **Cathedral seeded B116-only.** Oldest-session retention claims (B108, B109) remain weakly tested — there is little Cathedral content for those sessions because the Cathedral itself opened in B116. Categories with no Cathedral coverage (e.g. `architecture_continuity`, `decision_provenance`, `founder_voice` in this bank) may degrade silently to HOT-base parity.
- **consult_scribes is keyword-substring scoring.** No semantic/vector retrieval. Some questions will score 0 against every Scribe and degrade silently to HOT-base parity.
- **Bank authored by Bishop B116/B117** with awareness of Scribe content. Mitigated by ground-truth being session-archive-anchored, but a strictly-independent (Pawn-curated) bank would strengthen the claim.
- **Hallucination subscore is heuristic** — `_NUM_RE` matches any 2-5-digit token; it will over-count e.g. a model's correct '#2267' on a question whose required element is '2,267' (comma).
- **Anthropic credit-balance dependency.** This run used the SDS.env backup key (`AnnoyUpeAnthropKEY`) since the primary `ANTHROPIC_API_KEY` was credit-depleted earlier in B117.

## 8b. Comparison to prior run (`SEED-18 / commit 7617a5f`)

Prior run: 18-Q bank, same architecture (`consult_scribes` MCP, top-10 retrieval), same models. Reproduces the 6-cell HOT% table side-by-side.

| Cell | Prior HOT% | This run HOT% | Δ |
|---|---:|---:|---:|
| claude-haiku-4-5-20251001 cold | 0.0% | 0.0% | +0.0pp |
| claude-haiku-4-5-20251001 hot_base | 11.1% | 4.0% | -7.1pp |
| claude-haiku-4-5-20251001 hot_cathedral | 27.8% | 8.0% | -19.8pp |
| claude-opus-4-7 cold | 0.0% | 0.0% | +0.0pp |
| claude-opus-4-7 hot_base | 11.1% | 4.0% | -7.1pp |
| claude-opus-4-7 hot_cathedral | 33.3% | 12.0% | -21.3pp |

**Mean Cathedral lift:** prior +19.4pp → this run +6.0pp (-13.4pp).
**Mean strict-rubric lift:** prior +13.9pp → this run +5.0pp (-8.9pp).

**Reading:** any drop from prior → this run on the SEALED bank reflects the larger and less Cathedral-friendly question pool — the SEED-18 bank was authored by Bishop B116 with awareness of Scribe content, so it skewed in favor of the Cathedral. The SEALED-50 bank adds 32 questions across categories the 4-Scribe MVP Cathedral may not cover (e.g. `architecture_continuity`, `founder_voice`). Direction of lift, however, is what K437 gates on — and it should remain ≥5pp under both rubrics for the canonical PASS to stand.

## 9. Cost summary

- **Total spend:** $13.3979 (under $20 cap)

Per-arm × per-model:

| Model | Arm | Calls | Cost | Mean cost/Q |
|---|---|---:|---:|---:|
| claude-haiku-4-5-20251001 | cold | 50 | $0.0391 | $0.0008 |
| claude-haiku-4-5-20251001 | hot_base | 50 | $0.2660 | $0.0053 |
| claude-haiku-4-5-20251001 | hot_cathedral | 50 | $0.3221 | $0.0064 |
| claude-opus-4-7 | cold | 50 | $0.7406 | $0.0148 |
| claude-opus-4-7 | hot_base | 50 | $5.4492 | $0.1090 |
| claude-opus-4-7 | hot_cathedral | 50 | $6.5808 | $0.1316 |

Per-call mean: $0.0447.
