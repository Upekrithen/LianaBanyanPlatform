---
knight_session: K471
bishop_session: B121
date: 2026-04-24
tag: v-r11-corpus-bank-realignment-K471
spend_usd: 0.36
predecessor_gate: K455a + K455b Mode A + K470
status: COMPLETE — bank aligned, verification run executed, handoff filed
publication_hold: IN FORCE until Prov 14 receipt
---

# K471 Handoff — R11 Corpus + Question Bank Realignment

## K471 Session Summary

K471 executed the full R11 question bank realignment per B121 dispatch. All 6 deliverables complete.

---

## Deliverable 1 — Mismatch Forensic Breakdown

### Root Cause

The K444 sealed bank (`R11_QUESTION_BANK_SEALED.json`, now preserved as `R11_QUESTION_BANK_SEALED_K444_LEGACY.json`) was generated against a **first-version R11 corpus** (R11-CANONICAL-K444, v1). The corpus ingested into Cathedrals at K455c / K455a / K470 is **R11-CANONICAL-K444-v2** — a significantly different document in all chapters except Canonical Statistics (CS).

### Chapter-by-Chapter Mismatch Analysis

| Chapter | K444 Bank Topic | Current Corpus Topic | K444 Answerable? |
|---|---|---|---|
| CS-01 | Verdania 847,293 members Q3 2025 | Same | ✓ (HOT) |
| CS-02 | Verdania $4.7B FY2024 | Same | ✓ (HOT) |
| CS-03 | 66.7% amendment threshold | Same | ✓ (HOT) |
| CS-04 | Cairnfield 180-day portability | Same | ✓ (HOT) |
| CS-05 | Solstice Index 4.18 Nov 2025 | Same | ✓ (HOT) |
| CS-06 | $312 member surplus 2024 | Same | ✓ (HOT) |
| CS-07 | Sundry Accord 15% extraordinary | Same | ✓ (HOT) |
| CS-08 | 2.3% voting weight cap | Same | ✓ (HOT) |
| CS-09 | Pelham Audit Standard / 7 years log retention | Reserve Funding Floor / 8.5% 12-month | ✗ |
| AM-01 through AM-08 | DLW co-signatures, Fjordgate consent membrane, Thornwick 256KB isolation, Cascadia 5-tier routing, Pelham 72-hr token rotation, 12 shards/100k, Witness Ledger 6-hr Merkle, Belfry 67% consensus | Thornwick 0.73:0.27 ratio, Scribe 1,536-dim embeddings, top-10 retrieval, 3,200 preload tokens, 400/50 chunk size, P99 ≤1,400ms latency, 180-day logarithmic decay, 0.72 hallucination confidence | ✗ all 8 |
| EG-01 through EG-09 | Sundry Accord tiers, CCF 40/35/25% split, Thornwick 45-day comment period, tenure coefficient patronage, Merton 30-day vendor switch, unanimous FCN approval, Havington 19% equity cap, Sundry 42-day AGM notice, Reciprocity Score 2.1 | Patronage 70/30 split, 3-yr staggered directors, CCF 4-tier classifications, 30%/55% bylaw quorum, 60-day exit rights, Federated Compact 12%/15%, board diversity 40%/30%, 45-day AGM notice, 25% buyback cap | ✗ all 9 |
| MJ-01 through MJ-08 | Cairnfield 14-day attestation, Golden Path 7-steps/corpus consent dropout, Cairnfield 72hr data access, Departure Protocol 30-day cooling, 18-month Steward Tier, 270-day Observer reclassification, $15/$90 referral credits, March 31 Compass Review | 10-business-day application processing, 75/100 Cooperative Principles Assessment, 90-day trial period, biannual surveys/30-day board reporting, 15-business-day mentorship/35% sector alignment, 60%/40% exit interview, 4-hr/3-day SLA, 5-year tenure milestones | ✗ all 8 |
| RC-01 through RC-08 | Pelham AI Charter 18-month FIA, Sundry Digital Rights 10-business-day algo explanation, Fjordgate Level 2 5-year AI log, $50M GMV Data Trust Officer, Northbridge quarterly model accuracy, Sundry Bilateral Data Adequacy, Cairnfield Privacy Seal annual audit, 6-month compliance buffer | Cooperative AI Governance Charter 24-month AI audit, 36-month inactive data retention, Meridian Data Framework cross-border, 72-hr incident notification, 12-month vendor assessment, whistleblower 3-element standard, $15k/$50k AML thresholds, 0.85 confidence disclosure | ✗ all 8 |
| HP-01 through HP-08 | Montclair 2019 fiduciary ruling, Verdania founded Reykjavik 2017 by 12 credit unions, Pelham Commons $1B 2022, Sundry Accord Nov 14 2021 by 47/9, 2020 Helsinki Fjordgate, Belfry 22-month Defensive Conversion, Mossworth 2023 99.7% Thornwick, Cooper-Anderson 2022 21-day disclosure | First Summit Reykjavik Mar 14 2019 Reykjavik Declaration, Verdania receivership Q2 2021/14 months, Sundry Accord Nairobi September 2020, Hartwell Q3 2022 first AI cert failure, Cairnfield Scotland April 2022, Thornwick Cooperative Research Institute Birmingham November 2024, Federated Compact Amsterdam June 30 2023, Cooperative AI Governance Charter February 12 2021/91% | ✗ all 8 |

**Summary:** 8/50 K444 bank questions answered from current corpus (strict HOT). The 22% empirical finding from K455b reflected ~3 additional partial matches from adjacent corpus content.

---

## Deliverable 2 — K471 Bank Re-Seal Details

**Bank file:** `librarian-mcp/r10_cross_vendor/R11_QUESTION_BANK_SEALED_K471.json`  
**Corpus ID:** `R11-CANONICAL-K471`  
**Corpus source:** `r11_canonical_corpus.md` (R11-CANONICAL-K444-v2)  
**Sealed:** 2026-04-24 per K471 B121 dispatch authorization

**Category distribution:**
- Canonical Statistics (CS): 9 questions (CS-01 through CS-09)
- Architecture Mechanics (AM): 8 questions (AM-01 through AM-08)
- Economic/Governance (EG): 9 questions (EG-01 through EG-09)
- Member Journey (MJ): 8 questions (MJ-01 through MJ-08)
- Regulatory/Compliance (RC): 8 questions (RC-01 through RC-08)
- Historical/Precedent (HP): 8 questions (HP-01 through HP-08)
- **Total: 50 questions**

**Question style:** Retrieval-focused, declarative. All proper nouns and synthetic terms are exact matches to corpus. Answer strings are designed to match corpus phrasing as exact substrings.

**Alignment guarantee:** All 50 hot_required_elements verified as case-insensitive substrings of `r11_canonical_corpus.md` by `scripts/reseal-question-bank.mjs`. **Theoretical HOT ceiling = 100% (50/50).**

**Legacy bank preserved:** `R11_QUESTION_BANK_SEALED_K444_LEGACY.json` (original K444 bank, renamed; NOT deleted; remains the reference for K444/K455c/K455a/K455b prior reports which reference corpus_id R11-CANONICAL-K444).

**Tooling updated:**
- `run_r11.py`: defaults to K471 bank; `--legacy-k444` flag opts into K444 legacy bank
- `grade_r11.py`: defaults to K471 bank; `--legacy-k444` flag available
- `summarize_r11.py`: session references updated to K471

---

## Deliverable 3 — K471 Verification Benchmark Results

**Run:** 2-arm × 50 questions, Anthropic Haiku 4.5  
**Results directory:** `librarian-mcp/r10_cross_vendor/results_r11_k471_realignment/`  
**Total spend:** $0.3635 (well within $5 budget cap)

| Condition | n | HOT% | HIT% | MISS% | Retrieval-correct% | $/query | $/HOT |
|---|---|---|---|---|---|---|---|
| cold_haiku (bare, no Cathedral) | 50 | **0%** | 16% | 84% | — | $0.00080 | — |
| lb_cathedral_haiku (Haiku + Bishop Cathedral) | 50 | **18%** | 6% | 76% | **100%** | $0.00647 | $0.0360 |

**Lift:** +18pp HOT (0% → 18%). Retrieval-correct% = 100% (all 9 HOT answers are genuine Cathedral Effect, none from parametric recall).

**Chapter breakdown (Cathedral condition):**
| Chapter | HOT | HIT | MISS | Notes |
|---|---|---|---|---|
| CS (9 questions) | **9/9 = 100%** | 0 | 0 | All facts served perfectly |
| AM (8 questions) | 0/8 | 1 | 7 | Retrieval routes to real LB Architecture scribe |
| EG (9 questions) | 0/9 | 0 | 9 | R11 scribe consulted but canonical LB values override |
| MJ (8 questions) | 0/8 | 1 | 7 | Mixed routing, real LB values dominate response |
| RC (8 questions) | 0/8 | 1 | 7 | R11 scribe consulted but canonical LB values override |
| HP (8 questions) | 0/8 | 0 | 8 | Non-R11 scribes retrieved; synthetic HP facts not surfaced |

### Key Finding: Retrieval Confound, Not Bank Misalignment

The K471 bank alignment is **confirmed correct** (50/50 answerable, 100% theoretical ceiling, all 50 R11 scribe entries present in Cathedral at corpus_id R11-CANONICAL-K444-v2). The 18% vs expected 60-95% HOT ceiling is caused by **two retrieval confounds**, NOT by bank-corpus mismatch:

**Confound 1 — Architecture scribe collision (AM chapter):**  
The synthetic AM facts use "Thornwick architecture" — a proper noun that also exists in LB's real Architecture scribe (which describes LB's actual RAG system using Thornwick principles). The semantic router routes AM questions to the real Architecture scribe instead of the R11 scribe, returning real LB architecture info rather than the synthetic K471 AM facts (0.73:0.27 ratio, 1,536 dimensions, top-10 retrieval, etc.).

**Confound 2 — Canonical LB substrate override (EG/MJ/RC/HP chapters):**  
The R11 scribe IS consulted for many EG/RC/HP questions (confirmed in scribes_consulted log). However, LB's Cathedral contains extremely strong canonical values (83.3% creator share, $5/year membership, specific LB regulatory facts) that semantically compete with the synthetic K471 facts. When the model synthesizes a response from all 10 retrieved scribes, the LB canonical substrate appears to dominate over the R11 synthetic scribe entries for non-CS topics.

**Confound 3 — Scribe routing entropy (MJ/HP chapters):**  
Some MJ and HP questions use generic language ("membership", "historical") that routes to non-R11 scribes entirely (Decisions, Prov14, etc.). R11 scribe is not retrieved, so the correct answer is not available to the model.

### Alignment Status: CONFIRMED with caveat

The bank-corpus alignment problem identified in K455b is **RESOLVED**. The K471 bank correctly represents the current corpus (100% theoretical ceiling). The remaining HOT ceiling limitation (18% empirical vs 100% theoretical) is a Cathedral retrieval quality issue, not a bank alignment issue. This is a separate problem requiring a different remediation (K472 scope).

---

## Deliverable 4 — A&A #2278 Exhibit C Update

**File updated:** `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2278_THE_CATHEDRAL_EFFECT_B121.md`

Exhibit C now contains a "K471 Realignment Verification" sub-section covering:
- Mismatch forensic summary (chapter-by-chapter breakdown)
- K471 bank re-seal details and alignment guarantee
- 2-arm verification results table
- Retrieval confound diagnosis (Architecture scribe collision + canonical LB override)
- CS chapter Strong Cathedral Effect finding (100% HOT, 9/9)
- Revised classification: Weak Cathedral Effect at verified floor (18%), but with confound explanation
- Implications for K472+: index prioritization OR corpus-injection mode to unlock true magnitude

**Classification implications:**
- K455c (+14pp, Weak) and K455a (Vendor-Agnostic Weak, 12-18pp range) remain valid as **relative comparisons under the same ceiling** — all conditions hit the K444 ceiling equally, so relative findings are unaffected
- Absolute numbers post-realignment (K471 bank) show **same approximate ceiling** — demonstrating the ceiling was NOT purely bank-corpus mismatch, but retrieval confound
- True Cathedral Effect for K471 facts: **Strong Effect confirmed for CS chapter** (0% → 100%), **Weak or Null for other chapters** pending K472 retrieval fix
- Vendor-Agnostic classification: **still confirmed** from K455a multi-vendor run

---

## Deliverable 5 — Tests

**Test file:** `librarian-mcp/tests/test_r11_bank_realignment.mjs`

All 5 tests pass:
- **Test A:** K471 bank exists, valid JSON, 50 questions ✓
- **Test B:** All 50 questions' hot_required_elements are exact corpus substrings ✓
- **Test C:** Legacy K444 bank preserved and marked as K444 corpus_id ✓
- **Test D:** run_r11.py defaults to K471 bank, --legacy-k444 flag references legacy ✓
- **Test E:** reseal-question-bank.mjs reproducible (50/50 both runs, ALL CHECKS PASSED) ✓

---

## Deliverable 6 — Rebuild, Commits, Tag

**Commits:** Two commits (see git log)
1. `bank-reseal: K471 R11 bank realignment — 50/50 aligned, K444 legacy preserved`
2. `k471-verification: run results, tests, tooling updates, A&A exhibit update`

**Tag:** `v-r11-corpus-bank-realignment-K471` on HEAD

**Spend summary:**
- Verification benchmark: $0.3635 (100 API calls, Haiku 4.5, 2 conditions × 50 questions)
- Budget cap: $5.00 — well within cap ($0.36 actual)
- Total K471 session spend: ~$0.36

---

## Recommended Next Steps (K472 Scope)

1. **Retrieval fix — option A (index reweighting):** Update `consult_scribes` to boost R11 scribe entries when query context matches known R11 question patterns (Thornwick ratio, Cooperative Capital Framework, etc.)
2. **Retrieval fix — option B (corpus-injection mode):** Add a benchmark runner mode that injects the corpus directly into context (bypassing semantic routing) and re-run 2-arm with K471 bank to establish true 100%-retrieval-available HOT baseline
3. **Full K455 re-runs under K471 bank:** Run K455c (cross-Cathedral), K455a (4-vendor matrix), K455b Mode A under K471 bank to get the corrected absolute numbers — K472 dispatch pending
4. **Per-category lift matrix (Exhibit D, A&A #2278):** Once retrieval is fixed, run the full K455a conditions with per-category breakdown to populate Exhibit D

---

*K471 complete — B121 2026-04-24. Spend $0.36 / $5.00 cap. Publication hold IN FORCE.*

**FOR THE KEEP!**
