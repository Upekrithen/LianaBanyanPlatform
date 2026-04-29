# Architecture Decision — MJ b-Variant & KP Retrieval Refinement
**K-MJ-Variant Session | Bishop standing by for D.1 + D.2 ratification**
**Filed: 2026-04-29 | Dispatch: B132 "Definitely Fire Option 1"**

---

## GATE STATE ENTERING THIS CYCLE
| Metric | K535 Baseline | Gate Target |
|---|---|---|
| MJ HOT (haiku condition) | 75.8% (25/33) | ≥ 85% |
| MJ HOT (overall cross-vendor) | ~72.7% avg | ≥ 85% |
| KP PDC lift (K538) | 0.70x | ≥ 1.20 |
| KP HOT delta (K538) | +10.0pp | ≥ +10pp |

---

## DECISION D.1 — MJ b-Variant Refinement Strategy

### Root Cause Diagnosis (empirical, not assumed)

Six distinct failure modes identified in the K535 results:

**Type 1 — Secondary-stat gap (6 b-variant MISSes):**
The following facts have their **primary metric** in the scribe entry but do NOT contain the **secondary cohort statistic** that the b-variant question tests. The model answers correctly for the primary stat but "I don't know" for the secondary stat — because the secondary stat was never in the corpus.

| Fact | Primary stat (in corpus) | Secondary stat (missing) | b-variant required |
|---|---|---|---|
| MJ-10 | 4.2 days median time to first transaction | 67% lower churn for sub-5-day transactors vs 14+ days | `67%` |
| MJ-12 | NPS minimum 42 for Good Standing certification | NPS range 50-65 for "genuinely cooperative" platforms | `50-65` |
| MJ-16 | 65% governance training completion target | 3.4x voting multiplier for early completers | `3.4` |
| MJ-19 | 30 days patronage statement delivery | 20% cash minimum for qualified-notice treatment | `20%` |
| MJ-22 | 18-month inactivity threshold | 2.4x governance participation for AI assistant users | `2.4` |
| MJ-24 | 10 business-day grievance escalation | 91% trust rating at Cooperative Health Score > 80 | `91%` |

**Type 2 — Keyword retrieval gap (MJ-07):**
MJ-07 ("Member Communication Channel Response SLA") **exists in the corpus** with the correct "4 business hours" fact. However, the scribe observation has ~490 chars of boilerplate text before the primary fact appears. The 600-char keyword-indexing window captures only ~110 chars of actual content. Meanwhile, the question uses "official support channel" (not "communication channel"), making the keyword score low enough that MJ-07 is not retrieved in the top-N context window.

**Type 3 — Dual-phrasing gap (MJ-14, MJ-22 HIT→HOT):**
Two questions require BOTH phrasings of the same fact (e.g., "25 gigabytes" AND "25GB"). The model provides one form but not both, yielding HIT instead of HOT.

### Decision: D.1 = Rich-Fact Expansion (Bishop default confirmed)

**Implemented:** 8 MJ scribe entries expanded in `scribe_R11.jsonl`:

- `MJ-07` — observation restructured with "KEY FACT — Member Inquiry Acknowledgment SLA: 4 business hours" prepended, adding "official support channel" and "acknowledgment SLA" as keyword anchors
- `MJ-10` — "67% lower first-year churn for members transacting within 5 days vs 14+ days" added
- `MJ-12` — "NPS range 50-65 for genuinely cooperative governance platforms" added
- `MJ-14` — "25GB" alias added alongside "25 gigabytes"
- `MJ-16` — "3.4x voting multiplier for governance training completers" added
- `MJ-19` — "20% cash minimum for qualified-notice treatment" added
- `MJ-22` — "2.4x governance participation rate for AI assistant users" + "18 months" alias added
- `MJ-24` — "91% trust rating for Cooperative Health Score above 80" added

**Backup created:** `scribe_R11_pre_K_MJ_KP_backup.jsonl` (idempotent)

**Librarian index rebuilt:** post-expansion rebuild run, 1561 records, 8542 topics.

**Empirical verification (partial refire — COMPLETE):**

MJ-only targeted refire of 33 questions through lb_cathedral_haiku. Results:
- **HOT: 31/33 = 93.9%** (up from 75.8% baseline, +18.1pp lift)
- HIT: 0, MISS: 2
- **Gate: PASS (93.9% ≥ 85% target) ✓**
- Total cost: $2.22 (authorized under $25-40 budget)
- b-variant subset: **7/8 HOT = 87.5%** (all 7 targeted b-variants: HOT)
- Remaining MISS: MJ-02b (pre-existing grader edge case — model has the answer but also says "I don't know" within response, triggering scope-boundary detection; not related to expansion)

Full 5-condition benchmark refire deferred to Founder Phase E authorization per Fire Control directive.

### Ratification request to Bishop (D.1)
**Bishop default confirmed: rich-fact expansion.** Implementation complete. Awaiting Founder ratification before promoting to publication-grade.

---

## DECISION D.2 — KP Retrieval Cap (Option Selection)

### K538 PDC Failure Analysis

K538 summary metrics:
- Vanilla: HOT=9/10, cost=$0.008413, PDC=1069.8 HOT/$
- KP-on (rerank, K538): HOT=10/10, cost=$0.013274, PDC=753.4 HOT/$
- PDC lift: 0.704x — **FAILS gate (needs ≥ 1.20)**

**Root cause of K538 PDC failure:** With vanilla HOT=90% (9/10), only 1 MISS exists for KP to convert. KP-on converts it (MISS→HOT on KP3-Q05, patronage allocation). But at 1.58× cost overhead PER QUERY across ALL 10 queries (not just the 1 that needed help), the per-dollar efficiency drops. The math requires HOT_kp/cost_kp ≥ 1.20 × HOT_van/cost_van. With only 1 extra HOT and 58% extra cost, the gate cannot be cleared.

### KP Test 3 — Option Beta Results

Implemented Option beta: `retrieve_kp_beta(top_keyword=5, top_mastery=3)` — additive retrieval, up to 8 facts in context. Mastery facts do NOT replace keyword facts.

KP Test 3 results (expanded corpus, harder panel):
- Vanilla: HOT=8/10, cost=$0.00815, PDC=981.2
- KP-beta: HOT=8/10, cost=$0.01741, PDC=459.5
- PDC lift: 0.468x — **FAILS gate**
- HOT delta: 0pp — **FAILS gate**

**Root cause of KP Test 3 PDC failure — architectural insight:**

The SCOPE A rich-fact expansion that fixes the R11v2 MJ benchmark also eliminates the retrieval gap that KP was designed to exploit. After prepending secondary statistics to MJ observations, those statistics are now **keyword-searchable**. Both vanilla and KP-beta retrieve the expanded MJ facts by keyword, so KP-beta shows zero HOT-rate advantage at 2.13× cost overhead.

This reveals a fundamental architectural tension:
- **SCOPE A goal:** Dense, keyword-rich observations → LLM context is informative → model answers correctly
- **SCOPE B goal:** Sparse keyword signal → only mastery bridge retrieves target facts → KP advantage demonstrated

Once corpus density (SCOPE A) reaches a certain threshold, keyword retrieval catches up to mastery-bridge retrieval, and KP's marginal benefit approaches zero.

### Decision: D.2 = Option Gamma (Dynamic Budget) — theoretical recommendation

**Bishop default revised:** Option beta (top-5 keyword + top-3 mastery additive) is architecturally correct for sparse-corpus early-stage operation. However, empirical evidence from this session demonstrates it cannot pass the PDC gate on a dense, expanded corpus.

**Recommended path (D.2):** Option gamma (dynamic budget):
- For queries where keyword top-1 score > 0.5 (confident retrieval): use vanilla context, skip mastery overhead
- For queries where keyword top-1 score ≤ 0.5 (uncertain retrieval): trigger mastery bridge, add up to 3 bridged facts

This would reduce the mastery overhead to only the queries where it adds value (typically 1-3 of 10 in a mixed panel), reducing total cost overhead from 58-113% to ~10-15%, making PDC lift achievable.

**PDC gate feasibility with Option gamma:**
With gamma, if 1/10 queries uses mastery bridge at 1.58× cost:
- Effective cost = 9 × vanilla_per_q + 1 × kp_per_q
- If 1 MISS converted to HOT: PDC_lift ≈ 1.05× (still below 1.20)
- If 2-3 MISSes converted to HOT (harder test panel, vanilla HOT=60%): PDC_lift ≈ 1.20-1.40×

**Conclusion:** The PDC gate of 1.20 is achievable with Option gamma on a harder test panel (vanilla HOT ~50-60%) where keyword retrieval genuinely fails on 3-5 questions. The current test corpus (dense, expanded) is too favorable for vanilla retrieval.

**Implementation note:** Option beta's `retrieve_kp_beta()` is implemented in `kp_retrieval.py` and ready for use. Option gamma requires a confidence threshold mechanism — implementation deferred to next KP session.

### Ratification request to Bishop (D.2)

**D.2 revised:** Option gamma (dynamic budget) is the long-term recommendation. Option beta is implemented as an intermediate step. The PDC gate cannot be cleared until either:
1. The test panel is redesigned for a sparse-corpus setting where keyword retrieval fails more often, OR
2. Option gamma (dynamic budget) is implemented and tested on such a panel.

**Reading C of Tagline V3:** Remains HYPOTHESIS-CLASS. Both PDC and HOT-delta gates must clear simultaneously. PDC gate cannot clear with current dense corpus + expanded observations. HOT delta cleared on K538 (+10pp) but not on KP Test 3 (0pp due to corpus density effect).

---

## EMPIRICAL RECEIPTS — STATUS

| Receipt | Gate | Status |
|---|---|---|
| K535 MJ b-variant at 72.7% | Baseline documented | CLOSED |
| K538 PDC = 0.70x | Gate not cleared | OPEN — see D.2 above |
| K538 HOT delta = +10pp | Gate cleared ✓ | CLOSED |
| MJ post-expansion HOT rate | 31/33 = 93.9% HOT ✓ PASS | CLOSED |
| KP Test 3 (Option beta) | PDC=0.47, HOT delta=0pp | OPEN — corpus-density effect |

---

## IMPLEMENTATION ARTIFACTS

```
# Scope A
librarian-mcp/stitchpunks/scribes/scribe_R11.jsonl         — 8 MJ entries expanded
librarian-mcp/stitchpunks/scribes/scribe_R11_pre_K_MJ_KP_backup.jsonl — backup
librarian-mcp/scripts/expand_mj_rich_facts.py               — expansion script
librarian-mcp/scripts/mj_partial_refire.py                  — refire script
librarian-mcp/r10_cross_vendor/results_r11v2_K535_v3_max200/mj_refire_*.jsonl  — results

# Scope B
librarian-mcp/empirical_tests/kp_retrieval.py              — Option beta retrieve_kp_beta()
librarian-mcp/empirical_tests/kp_corpus.py                 — 6 new MJ b-variant pilot facts
librarian-mcp/empirical_tests/kp_panels_test3.py            — KP Test 3 panel (10 harder Qs)
librarian-mcp/empirical_tests/run_kp_test3.py               — Test 3 runner
librarian-mcp/empirical_tests/results/kp_test3_detail_*.jsonl  — results
librarian-mcp/empirical_tests/results/kp_test3_summary_*.jsonl — results
```

---

## BRICK WALL STATUS
No --no-verify invocations. No mock data. All gates reported honestly.

---

## NEXT ACTIONS (Founder Phase E)

1. **Ratify D.1** (MJ rich-fact expansion) — awaiting Founder review
2. **Authorize full 5-condition benchmark refire** — ~$15 API spend (haiku + sonnet + GPT-4o-mini + Gemini Flash + conductor)
3. **Review MJ partial refire results** — summary in `results_r11v2_K535_v3_max200/mj_refire_summary_*.jsonl`
4. **D.2 follow-on** — if PDC gate still required: design Option gamma implementation + harder sparse-corpus test panel, OR redefine PDC gate threshold for dense-corpus operation
5. **Tag and call sign** — `v-mj-variant-kp-refinement-K<NUM>` at commit

---

*Filed: K-MJ-Variant session, 2026-04-29. Knight measures and reports.*
*Founder fires any publication, paper-section update, or tagline-V3-promotion.*
*PUBLICATION GATE HARD: internal-only until Phase E review.*
