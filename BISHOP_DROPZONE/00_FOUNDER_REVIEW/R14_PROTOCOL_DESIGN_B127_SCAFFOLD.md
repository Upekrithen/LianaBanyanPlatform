# R14 Protocol Design — Locking the 90/90 Tagline Canonically

**Status**: B127 SCAFFOLD pending Founder ratification.
**Filing target**: PROMPT_KNIGHT_R14_B127_REPRODUCIBILITY_VALIDATION.md (when ratified).
**Companion**: PAPER_PENNY_SAVED_IS_PENNY_EARNED_B127_SCAFFOLD.md (R14 produces Section 5 numbers).
**Predecessors**: R10 (B112 lock, 86.1pp) / R13 (B125 lock, 86.2pp) / K511 (B126 local-LLM, 80.0pp).

---

## Goal

Lock the canonical tagline "Cathedral Librarian: Totally FREE. Use whatever you ALREADY use. 90 percent cheaper, 90 percent MORE ACCURATE. Like, For REAL." with definitive empirical evidence.

R14 = comprehensive 8-model x 4-vendor empirical replication of R10/R13/K511 on the CURRENT canonical Cathedral, PLUS aggregate substrate-savings telemetry across same-session execution.

## Pre-registration (Brick Walls discipline — declare BEFORE running)

### Hypotheses (to be confirmed/refuted)

H1 (accuracy lift): mean HOT-COLD delta >= 80pp across 8-model matrix on current canonical Cathedral.
H2 (cost cliff): cheapest substrate-equipped model HOT >= most-expensive substrate-equipped model HOT minus 5pp (cost-delta >= 10x).
H3 (substrate-savings density): per-session context-window utilization at task-complete <= 50 percent of 200K Cursor budget for sessions of K514-K518 architectural-significance class.
H4 (vendor-neutral): no single vendor accounts for >35 percent of HOT performance band.

### Failure modes pre-registered
- If H1 is +20-40pp: Cathedral lift narrowed since R10/R13. Investigate: Scribe Coverage Discovery class (project_scribe_coverage_discovery.md); per-category disaggregate.
- If H2 fails: cost-cliff has narrowed; tagline tightens to "X percent cheaper" honest number.
- If H3 fails: substrate is accuracy-only mechanism; tagline drops "context efficiency" claim.
- If H4 fails: tagline qualifies "vendor-neutral within tested family."

## Model matrix (8 models x 4 vendors)

| Vendor | High tier | Low tier |
|---|---|---|
| Anthropic | Opus 4.7 | Haiku 4.5 |
| Google | Gemini 3.1 Pro | Gemini 2.5 Flash |
| OpenAI | GPT-5.5 | GPT-5.4-mini |
| Perplexity | Sonar Pro | Sonar |

Each cell runs against:
- COLD baseline (no Cathedral)
- HOT condition (Cathedral injection)

8 cells x 2 conditions = 16 cells. 1,200 calls per cell suggested (matches R10), 800 minimum (matches R13 budget posture).

## Sealed query bank

Reuse two existing B124 Pawn-generated sealed banks:
- **ODNYWS** (Founder unpublished portal-fantasy novel; 50 questions, 4 Bishop-substitutions applied, Diana/Vigil privacy-redacted).
- **Cultural-References** (LB internal vocabulary; 50 questions across 5 difficulty classes including specific_fact, named_entity, mechanism, relationship, founder_phrasing).

100 questions total. Stratified sampling within each cell.

Bank validation: Pawn returned banks already; Bishop quality review applied B124. No re-generation needed pre-R14.

## Conditions

| Condition | Bishop substrate | Knight substrate | Notes |
|---|---|---|---|
| baseline | OFF | OFF | "model alone" |
| Cathedral-Bishop | ON | OFF | single-Cathedral lift |
| Cathedral-Knight | OFF | ON | single-Cathedral cross-class lift |
| Cathedral-Multi | ON | ON | multi-Cathedral cross-class lift (B121 K455a finding replication) |

Optional: Cathedral-Pawn condition if K507 wrapper is operational.

## Metrics

### Primary
- HOT-COLD delta percentage points (per cell, per condition)
- Cost per correct answer (USD per accepted output)

### Secondary
- Per-session context utilization (per Knight Cursor session)
- Inter-rater kappa across substring-grader, LLM-judge, and human spot-check (sample N=20 per cell)
- Vendor latency (informational; not load-bearing for tagline claims)

### Aggregate substrate-savings (NEW vs R10/R13)
- Cumulative input plus output tokens per cell-condition pair
- Counterfactual cost = actual times cold_multiplier (cold_multiplier per-vendor-tier from R13)
- Net savings USD per cell-condition pair
- Lifecycle calibration: log substrate-savings ledger entries via record_substrate_savings MCP for each R14 cell completion

## Budget

- Cells: 16 cells x 100 calls = 1,600 calls minimum (or 16 x 1,200 = 19,200 max)
- Estimated USD 5-10 (matches B124 K499 R13 USD 22 cap with smaller bank)
- Estimated 1-2 hours wall (matches K499 46 minutes for 800 calls; doubles for 4 conditions instead of 2)

## Knight prompt structure (when ratified)

Working title: PROMPT_KNIGHT_R14_B127_REPRODUCIBILITY_VALIDATION.md

Phases:
- Phase A — environment audit (Cathedral state hash, vendor API keys, sealed bank checksum)
- Phase B — execute matrix (parallelize via Playwright with stagger-throttle per K475 pattern)
- Phase C — verification (kappa cross-check, sealed-contamination check, 0 percent COLD baseline confirmation)
- Phase D — analysis (per-cell tables, headline aggregate, hypothesis-by-hypothesis confirm/refute)
- Phase E — close (R14 lock memo, paper Section 5 numbers committed, Knight handoff)

## Deliverables

1. R14 raw data (results JSONL per cell-condition)
2. R14 summary table (markdown, 8 models x 4 vendors x 4 conditions)
3. R14 lock memo (1-pager — hypothesis confirm/refute, headline numbers, anomalies flagged)
4. Penny Saved paper Section 5 — numerical fill-in
5. Substrate-savings ledger entries (per cell)
6. Synapse cluster ~10-12 per Bishop discipline

## Open questions for Founder ratification

- Budget cap: USD 10 sufficient or USD 25 cap as K499 had?
- Sealed bank size per cell: 100 questions (R10 had 1,200 across 8 models; R13 had 800)?
- Include Cathedral-Pawn condition or skip until K507 hardening complete?
- R14 dispatch immediately after K522 lands, or run in parallel with K520 (MAJCOM)?
- Calibration cycle: incorporate R14 results into 30-day Phase E cold-multiplier recalibration?

## R14 R-series lineage flag

R14 is the empirical that locks the 90/90 tagline canonically. Sister R-series:
- R9 (B108) — first Cathedral Effect detection
- R10 (B112) — cross-vendor lock at 86.1pp
- R11 (B120) — Founder-adjudicated re-test post Cathedral expansion
- R12 (B122) — Pawn-Comet definitive benchmark
- R13 (B125) — cross-vendor cross-Cathedral 86.2pp lock
- R14 (B127) — comprehensive lock on current canonical, plus substrate-savings aggregate

Each R-series increment refined the empirical. R14 is the publishable headline. Year of Jubilee analog: R-series itself is an append-only ledger; R14 fills the next slot, does not overwrite predecessors.

---

*Filed B127 by Bishop, 2026-04-26. Long Haul AND Fix Along the Way. Both, Always.*
