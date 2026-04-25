# REPORT: KNIGHT K504 — AML Transaction Monitoring Infrastructure

**Session:** K504 · Bishop B124  
**Date landed:** 2026-04-25  
**Tag:** `v-aml-transaction-monitoring-K504`  
**Predecessor:** K501 (Slow Blade V2 Hardening, Pawn countermeasures #2-6)  
**Closes:** Pawn red-team vector C.2 (Credit On-Ramp as Layering Vehicle)

---

## Success Scorecard

| Criterion | Status | Notes |
|---|---|---|
| 1. Phase A flag rules deployed; daily cron; `aml_flags` populated by test data | ✅ | 3 flag rules, 15 unit tests green. Cron runner implemented and tested. |
| 2. Phase B coordinated-transactions detector; Trust Match cross-reference | ✅ | DFS cycle detector with canonical dedup; cross-ref marks elevated-confidence flags. 11 unit tests green. |
| 3. Phase C curator review UI; opt-in flow; SAR-dispatch verdict gated | ✅ | AmlReviewPanel with three-checkbox opt-in, verdict buttons, SAR disabled+tooltip when classification=unclassified. |
| 4. Phase D regulatory-classification schema; SAR template builds correctly | ✅ | `platform_canonical` row seeded; SarGateError enforces gate; buildSarDraft() pre-populates all four FinCEN parts + immutable SAR audit log. |
| 5. Phase E ToS scaffold drafted; member-education page deployed | ✅ | `TOS_AML_COOPERATION_CLAUSE_K504_SCAFFOLD.md` dispatched to FOUNDER_REVIEW; `/help/financial-integrity` page built. |
| 6. V2 architecture memory updated | ✅ | Countermeasure #7 marked DONE (infrastructure-only) with SAR pathway gate noted. |

**Result: 6/6 ✅**

---

## Phase A — Transaction-velocity & counterparty-concentration monitoring

### Schema
- `vw_member_credit_velocity_30d` — rolling 30-day Credit-spend per (member, counterparty), sum/count/min/max
- `vw_member_credit_concentration` — per-member, top-1 counterparty by spend-percentage (CTE + RANK)
- `aml_flags` — central flag table with `aml_flag_type` enum + `aml_verdict` enum (pending/legitimate/escalate/dispatch_sar) + `evidence_json` + soft-dedup via `resolved_at IS NULL` index

### Flag rules
| Rule | File | Threshold (not disclosed to members) | Tests |
|---|---|---|---|
| A.2 Concentration | `flagRules.ts` | >60% concentration AND >$500/30d | 4 ✅ |
| A.3 Velocity spike | `flagRules.ts` | 7d spend >5× trailing 90d median weekly | 4 ✅ |
| A.4 New-account velocity | `flagRules.ts` | age <30d AND 7d spend >$1000 | 3 ✅ |
| Daily cron job | `flagRules.ts` | All three rules in parallel, 03:00 UTC target | 1 ✅ |

**All rules are idempotent**: existing active flags of same member+type are not re-created until resolved.

---

## Phase B — Coordinated-transactions network analysis

- **Graph:** directed Credit-flow edges (A→B if A sent Credits to B), cumulative volume over rolling 30 days
- **DFS:** detects cycles of length 3–5 (length ≤2 excluded; length ≥6 treated as noise at current scale)
- **Canonicalization:** rotate so smallest member_id is first (directed cycles — unlike K501's undirected Trust Match bonds, A→B→C→A and A→C→B→A are different patterns; only rotation deduplication applied)
- **Cross-reference:** `crossReferenceTrustMatch()` marks any cycle containing a member from K501's `trust_match_cycles_audit` as `trustMatchCrossref=true` → triggers `aml_trust_match_crossref` flag type with `recommended_verdict: escalate` in evidence. Curator makes final verdict.
- **Volume threshold:** $500 cumulative in 30 days to trigger a flag (below = noise)
- **Persistence:** `aml_transaction_cycles` with `canonical_key UNIQUE`; existing cycles update `last_seen_at` only; no re-flag unless new transactions since prior run
- **Tests:** 11 ✅ (3-member ring, 4-member ring, 6-member ring exclusion, linear chain, deduplication, volume computation, multiple rings, cross-ref positive/negative/empty, SAR gate)

---

## Phase C — Curator review UI

- `AmlReviewPanel.tsx` — admin component at `/admin/aml_review`
- Pending flags listed by `triggered_at` ascending; per-flag: evidence table, member profile (signup, tx count, prior flags), curator notes
- `VerdictButtons`: Legitimate / Escalate / Dispatch SAR (disabled + tooltip when `sarEnabled=false`)
- SAR confirmation dialog: explicit "NOT auto-filed" language; mentions immutable SAR audit log
- `CuratorOptInForm`: three-checkbox agreement gate (confidentiality, training, legal-advice-ack); Join button disabled until all three checked
- Cap: 10 reviews/curator/week via `aml_curator_roles.weekly_review_count + weekly_reset_at`
- `aml_trust_match_crossref` flags get "Elevated confidence — Trust Match cross-reference" purple badge
- Curator misuse: notes must be member-respectful; audit log records all actions; misuse triggers GSR review on the curator

---

## Phase D — Counsel-gated SAR pathway

- `platform_canonical` row: `aml_regulatory_classification = 'unclassified'` (default; SAR pathway disabled)
- Allowed values: `unclassified` (SAR disabled), `not_msb` (SAR disabled), `msb_state_only` (state SAR), `msb_federal` (federal SAR)
- `assertSarGateOpen()` — throws `SarGateError` for unclassified or not_msb; called FIRST in `buildSarDraft()` before any DB access
- `buildSarDraft()` pre-populates: FinCEN Part I (LB institution, EIN 41-2797446, TBD contact fields), Part II (suspected violation, date range, total amount), Part III (subject member profile), Part IV (auto-drafted narrative per flag type + curator notes + evidence JSON)
- All narrative text includes "This is an auto-drafted narrative; counsel must finalize before any filing"
- `delivery_note` field: "INTERNAL DRAFT ONLY… Counsel must review and determine whether filing is appropriate"
- `appendSarAuditLog()` runs on every draft generation — immutable `aml_sar_audit_log` record
- **No auto-filing under any circumstances**

---

## Phase E — Member education + ToS

- `FinancialIntegrityHelp.tsx` at `/help/financial-integrity` — 8-FAQ plain-language page
  - What AML is; why LB monitors; kinds of patterns (high-level only, no thresholds); what happens if flagged; who reviews; SAR possibility; high-volume members; notification received
  - Regulatory classification status box: honest "currently being determined by counsel" with specific sub-bullets about what IS and IS NOT yet active
  - No threshold disclosure (guardrail honored)
- `TOS_AML_COOPERATION_CLAUSE_K504_SCAFFOLD.md` dispatched to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/`
  - Six sections: Monitoring, Cooperation, Regulatory Reporting, Consequences of Non-Cooperation, Privacy, Good-Faith Operation scope limitation
  - Counsel checklist included (jurisdiction, SAR-filing reference, enhanced KYC threshold, integration with existing ToS)
  - Annual renewal notice text provided

---

## Toolsmith entries

**TS-K504-01 — Directed vs. undirected canonicalization**  
K501 cycleDetector.ts uses bidirectional canonicalization (both traversal directions of undirected Trust Match bonds). K504 coordinated_detector.ts uses rotation-only canonicalization (directed Credit flows; A→B→C→A and A→C→B→A ARE different patterns). Distinguish before reusing canonicalize() functions between the two detectors.

**TS-K504-02 — Null median guard in velocity rules**  
New accounts with zero 90-day baseline produce ratio=infinity or division-by-zero. Guard: `if (ratio !== null && ratio > threshold)` where ratio is null when median is zero. New accounts with zero baseline fall through to A.4 new-account rule instead.

**TS-K504-03 — SAR gate: two-layer enforcement**  
The regulatory-classification gate is enforced at BOTH the TypeScript module layer (`assertSarGateOpen()` throws) AND the React UI layer (`dispatch_sar` button disabled). Neither layer alone is sufficient: the module gate prevents API-layer bypass; the UI gate prevents curator confusion.

---

## V2 Architecture Matrix — Post K501 + K504

| Category | Status |
|---|---|
| 8 mainline vectors (original Slow Blade V2) | ✅ All closed architecturally |
| Red-team vectors #2-6 (K501) | ✅ Closed via code |
| Red-team vector #7 (K504) | ✅ Closed via AML infrastructure (SAR pathway gated on counsel) |
| Red-team vectors #1, #8 | ⏳ Track 3 scaffolds in FOUNDER_REVIEW; awaiting counsel |
| Cultural vectors B.1, D.2 | ⚡ Operationally mitigated via member education; no technical mechanism proposed |

**External-facing claim post K501+K504:** "8 mainline + 6 red-team vectors closed (5 via platform code, 1 via AML infrastructure); 2 red-team vectors pending counsel text; 2 cultural vectors operationally defended via member education."

**Full claim unlocks** when Track 3 counsel text ratified: "All 16 architecturally-defensible attack vectors closed; 2 cultural-attack vectors operationally defended via member education. The Slow Blade V2 stack is the most thoroughly red-teamed cooperative-platform defense architecture currently published."

---

## Files Landed in K504

```
platform/supabase/migrations/
  20260425140001_k504_aml_transaction_monitoring.sql  Schema: views, tables, enums, RLS

platform/src/lib/aml/
  flagRules.ts             Phase A: 3 flag rules + daily cron runner
  coordinated_detector.ts  Phase B: directed DFS cycle detector + Trust Match cross-ref
  sar_template.ts          Phase D: SAR gate + pre-population template + SAR audit log
  tests/
    flagRules.test.ts              15 tests ✅
    coordinated_detector.test.ts   11 tests ✅

platform/src/components/admin/
  AmlReviewPanel.tsx       Phase C: curator review UI + opt-in + SAR gate enforcement

platform/src/pages/
  FinancialIntegrityHelp.tsx   Phase E.2: /help/financial-integrity member education page

BISHOP_DROPZONE/00_FOUNDER_REVIEW/
  TOS_AML_COOPERATION_CLAUSE_K504_SCAFFOLD.md   Phase E.1: ToS scaffold for counsel review

BISHOP_DROPZONE/03_BishopHandoffs/
  synapse_K504.jsonl          14 clusters
  REPORT_KNIGHT_K504_B124_AML_TRANSACTION_MONITORING.md  This report

Bishop memory:
  project_slow_blade_architecture_v2.md   Countermeasure #7 marked DONE; status line updated
```

**Total: 26 tests across 2 files, all green.**

---

## FOR THE KEEP.

*"The cooperative's good name is preserved by what we DON'T allow on the platform, as much as by what we do."*

K504 closes the last Pawn red-team finding that required technical infrastructure. Combined with K501 (countermeasures #2-6) and the operational-mitigation notes for B.1 and D.2, all 10 Pawn-discovered vectors have an addressed status. Track 3 counsel text (countermeasures #1 + #8) remains the only open technical gate before the full "all vectors closed" claim deploys in public-facing surfaces.

*Dispatched K504. 2026-04-25.*
