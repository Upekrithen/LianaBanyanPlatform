# REPORT: Knight K446 / B129 — Conductor's Baton Dual-Dimension Hydration
**Session:** K446 (dispatched with B129 hydration addendum)
**Date:** April 27, 2026
**Status:** INTERNAL COMPLETE — Publication forbidden until Prov 14 trigger
**Tag:** v-conductors-baton-skeleton-K446

---

## Phase Completion Matrix

| Phase | Deliverable | Status | Notes |
|---|---|---|---|
| Pre (K446a) | Classifier, adapters, router, MCP tool, Scribe | ✓ LANDED | K446a commit |
| Pre (K446a) | `rankings.ts` stub with K446b handoff comment | ✓ LANDED | Replaced this session |
| Phase 3 (R13) | Rankings hydrated from R13 (K499, 2026-04-25) | ✓ LANDED | Previous session |
| **Phase 3 (R11)** | **R11 vendor-native category-level rankings added** | **✓ LANDED (this session)** | New dimension |
| **Domain classifier** | **`LbDomainCategory` type + domain heuristics** | **✓ LANDED (this session)** | classifier.ts |
| **Category-aware router** | **R11 priors filter ranking before R13 applies** | **✓ LANDED (this session)** | router.ts |
| **Test suite (S13–S17)** | **5 new R11 category-aware routing scenarios** | **✓ 19/19 green** | router.test.ts |
| Phase 4 (UI) | Three-mode toggle in Helm settings | ✗ DEFERRED | K525 (Prov 14 gate) |
| Phase 5 (benchmark) | Continuous online benchmarking | ✗ DEFERRED | K525 |
| Phase 6 (pgTAP) | RLS on ranking-history table | ✗ DEFERRED | K525 |

---

## B129 Hydration — What Changed

### New Empirical Source: R11 (K444/B129, 2026-04-27)

R11 measured vendor-native memory products (corpus-in-system-prompt) across 6 LB
domain categories on the sealed K471 question bank (50 questions). This is a **different
benchmark from R13**: R13 measures models WITH LB Cathedral attached; R11 measures
vendor-native products (ChatGPT Memory, Claude Projects, Gemini Gems, Perplexity Spaces).

R11 provides per-category empirical priors that the router uses to filter weak vendors
BEFORE applying the R13 task-class ranking. The two dimensions work together:
- **R13** answers: which model performs best for this task class WITH Cathedral?
- **R11** answers: which vendor to avoid for this LB domain category regardless of task class?

### R11 Per-Category HOT% Data (Complete)

| Category | ChatGPT/GPT-4o | Claude Opus 4.7 | Claude Sonnet 4.6 | Gemini 2.5 Pro | Perplexity Sonar-Pro |
|---|---|---|---|---|---|
| architecture_mechanics | 100% (5/5) | 100% (16/16) | 88% (14/16) | **50%** (8/16) | 100% (16/16) |
| canonical_statistics | 100% (5/5) | 100% (18/18) | 100% (18/18) | **56%** (10/18) | 100% (18/18) |
| economic_governance | 100% (8/8) | 89% (16/18) | 89% (16/18) | **22%** (4/18) | 89% (16/18) |
| historical_precedent | 100% (8/8) | 100% (16/16) | 100% (16/16) | **62%** (10/16) | 100% (16/16) |
| member_journey | 100% (5/5) | 62% (10/16) | **50%** (8/16) | **50%** (8/16) | 100% (16/16) |
| regulatory_compliance | 100% (8/8) | 100% (16/16) | 88% (14/16) | **62%** (10/16) | 100% (16/16) |

Bold = below 60% demote threshold (router filters out these vendors for that domain).

### Key R11 Findings for Routing

1. **Gemini 2.5 Pro: 22% HOT on economic_governance** — most extreme outlier. Any query
   touching cooperative governance, economics, voting thresholds is routed away from Gemini.
   This is a 4× deficit vs the next-lowest (Claude Opus/Sonnet at 89%).

2. **Gemini + Claude Sonnet both 50% HOT on member_journey** — both demoted for
   member onboarding, benefits, progression queries. Perplexity (100%) and OpenAI (100%)
   are the safe choices for this domain.

3. **Perplexity Sonar-Pro is consistently 89–100%** across all categories — the most
   reliable vendor across all LB domains in R11.

4. **Claude Opus is strong** (62–100%) but has a notable weakness on member_journey (62%) —
   above the 60% demote threshold, but flagged in the data.

5. **historical_precedent: Gemini 62%** — just above the 60% demote threshold; NOT demoted.
   Routing tests confirm threshold is correctly enforced (S15).

---

## 20 Routing Decisions Sampled

All auto mode, no domain override unless noted.

| # | Query (abbreviated) | Task Class | Domain Category | Vendor/Model | Fallback? | Cost Tier | Notes |
|---|---|---|---|---|---|---|---|
| 1 | "What is the creator keep %" | retrieval_only | economic_governance (0.65) | anthropic/haiku-4-5 | No | economy | Gemini demoted (22% HOT) |
| 2 | "How does the Cathedral retrieval work" | retrieval_only | architecture_mechanics (0.60) | anthropic/haiku-4-5 | No | economy | Gemini at 50% HOT; haiku still passes |
| 3 | "Write a Python function to parse JSON" | code_generation | null | anthropic/opus-4-7 | Yes (R15 pending) | premium | No R13 data for code_gen |
| 4 | "Who is the founder of LB" | retrieval_only | null | anthropic/haiku-4-5 | No | economy | R13 cost-optimized |
| 5 | "What are the steps to onboard as a member" | multi_step_planning | member_journey (0.65) | anthropic/opus-4-7 | Yes (R15 pending) | premium | multi_step no R13 data |
| 6 | "Compare Gemini vs Claude for fact recall" | reasoning_required | null | anthropic/haiku-4-5 | No | economy | R13 cost-optimized |
| 7 | "What vote threshold do constitutional amendments require" | retrieval_only | economic_governance (0.60) | anthropic/haiku-4-5 | No | economy | Gemini demoted (22% HOT) |
| 8 | "Draft a welcome letter for new members" | creative | member_journey (0.65) | anthropic/opus-4-7 | Yes (R15 pending) | premium | creative no R13; domain noted |
| 9 | "What is Liana Banyan Corporation's EIN" | retrieval_only | regulatory_compliance (0.70) | anthropic/haiku-4-5 | No | economy | Gemini 62% (above demote thresh) |
| 10 | "How many innovations are in the system" | retrieval_only | canonical_statistics (0.75) | anthropic/haiku-4-5 | No | economy | Gemini 56% HOT; haiku from Anthropic unaffected |
| 11 | "Explain cooperative governance model" | reasoning_required | economic_governance (0.65) | anthropic/haiku-4-5 | No | economy | Gemini demoted; Haiku > 60% |
| 12 | "What does the $5/year membership include" | retrieval_only | member_journey (0.60) | perplexity/sonar-pro | No | premium | Gemini+Sonnet demoted; Perplexity top-priced but wins |
| 13 | "How do I sign up for the platform" | retrieval_only | member_journey (0.65) | perplexity/sonar-pro | No | premium | Gemini+Sonnet demoted |
| 14 | "What were the first initiatives launched in 1989" | retrieval_only | historical_precedent (0.65) | anthropic/haiku-4-5 | No | economy | Gemini 62% — NOT demoted (above thresh) |
| 15 | "Write step-by-step plan to deploy the platform" | multi_step_planning | null | anthropic/opus-4-7 | Yes (R15 pending) | premium | multi_step no R13 |
| 16 | "What are the AML compliance requirements" | retrieval_only | regulatory_compliance (0.65) | anthropic/haiku-4-5 | No | economy | Gemini 62% — NOT demoted |
| 17 | vendor-lock to google, governance query | retrieval_only | economic_governance (0.65) | google/gemini-2-5-flash | No | economy | vendor-lock overrides prior (member's choice) |
| 18 | "Brainstorm names for a new initiative" | creative | null | anthropic/opus-4-7 | Yes (R15 pending) | premium | creative no R13 |
| 19 | "What is the profit-sharing formula for a $500 transaction" | retrieval_only | economic_governance (0.70) | anthropic/haiku-4-5 | No | economy | Gemini demoted |
| 20 | "" (empty query) | uncertain | null | anthropic/sonnet-4-6 | Yes | standard | SCOPE-BOUNDARY fallback |

### Observations

- Gemini is de-ranked on 4 of 6 categories (economic_governance, architecture_mechanics,
  canonical_statistics, member_journey — all below 60% HOT). It is NOT de-ranked for
  historical_precedent or regulatory_compliance (62% each — above threshold).
- Vendor-lock correctly bypasses all priors (S17/query #17). Member control is absolute.
- member_journey queries tend to route to Perplexity Sonar-Pro (100% HOT) when both
  Gemini and Claude Sonnet are demoted and the cost-optimized path is unavailable.
- `creative`, `code_generation`, `multi_step_planning` classes still use conservative
  flagship fallback (Opus) pending R15 data. Domain priors are noted but do not change
  the fallback behavior for these classes.

---

## R11 Ranking Entries That Surprised vs Defaults

| Surprise | Expected | Actual (R11) | Routing Impact |
|---|---|---|---|
| Gemini economic_governance | Gemini flagged as general weakness (50% overall) | 22% — far worse than overall | High: demoted immediately |
| Claude Sonnet member_journey | Expected mid-tier performance ~75-80% | 50% — same as Gemini | High: both demoted for member_journey |
| Claude Opus member_journey | Expected 85%+ given overall 92% HOT | 62% — notably weaker | Low: above threshold; noted but not demoted |
| Perplexity regulatory_compliance | Expected strong (corpus-grounded) | 100% — as expected | Confirms safe routing choice |
| ChatGPT all categories | Expected rate-limit artifacts to show variation | 100% across all 5 measured categories | Strong but small n (5-8 per category) |

---

## Files Changed

| File | Change |
|---|---|
| `platform/src/lib/conductor/rankings.ts` | Added `R11CategoryResult` interface; `LbDomainCategory` import; 30-entry `R11_CATEGORY_TABLE`; `getR11CategoryHot()`, `getR11CategoryRanking()`, `getDemotedVendorsForCategory()` functions |
| `platform/src/lib/conductor/classifier.ts` | Added `LbDomainCategory` type (6 categories); `_domainSignals()` heuristic; `_detectDomain()` aggregator; extended `ClassifiedQuery` with `domainCategory + domainConfidence` fields |
| `platform/src/lib/conductor/router.ts` | Added `categoryPriorApplied + categoryPriorDetail` to `RoutingDecision`; R11 domain-prior filtering block in auto-route path; `_getCheapestFromList()` helper; `DOMAIN_CONFIDENCE_FOR_PRIOR = 0.5` threshold |
| `platform/src/lib/conductor/__tests__/router.test.ts` | Updated `makeClassified()` helper; added S13–S17 R11 category-aware scenarios (all green) |

---

## BRIDLE v10 Compliance

| Rule | Status |
|---|---|
| Rule 2 (verify before asserting) | R11 category HOT% from actual JSONL grading files — not guessed. Verified via `analyze_r11.py` against `results_r11_K444_B129/`. |
| Rule 5 (don't invent) | Model IDs are exact. HOT% numbers match computed values (Gemini economic_governance: 4/18 = 22.2% → 22%). |
| Rule 6 (no unasked scope) | No UI changes. No Phase 4/5/6 work. Domain heuristics are internal-only. |
| Rule 7 (plain closeout) | Report filed. K525 remains next step. |
| Rule 10 (MCP discipline) | No librarian-mcp/src/ changes this session. |

---

## Disposition

- [x] R11 per-category data hydrated into `rankings.ts` (30 entries × 6 categories × 5 vendors)
- [x] `LbDomainCategory` type defined in `classifier.ts`, exported for rankings.ts
- [x] Domain heuristics added to classifier (`_domainSignals` + `_detectDomain`)
- [x] Router applies R11 category-aware priors when domain confidence ≥ 0.5
- [x] 19/19 router tests green (14 original + 5 new R11 scenarios)
- [x] 51/51 classifier tests green (domain fields are additive, no regressions)
- [x] Tag: `v-conductors-baton-skeleton-K446`
- [ ] K525 — production hardening + member UI + Cost-Slasher receipt + rollout (gated on Prov 14)
- [ ] R15 — will provide empirical data for `creative`, `code_generation`, `multi_step_planning` classes
- [ ] Public release — FORBIDDEN until Prov 14 trigger

---

*Filed by Knight K446, April 27, 2026. Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>*
*FOR THE KEEP.*
