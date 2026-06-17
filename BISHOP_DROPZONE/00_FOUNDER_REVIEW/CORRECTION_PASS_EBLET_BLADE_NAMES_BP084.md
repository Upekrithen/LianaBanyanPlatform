---
title: "Correction Pass — Eblet Quotes + Blade Names — BP084"
type: correction-report
session: Knight correction SEG (Sonnet 4.6)
date: 2026-06-16
status: complete
commit: cf617ea
---

# Correction Pass Report — BP084 3-Level Papers + PROV_22 Sections

**Sonnet 4.6** — Knight (Cursor AI) correction pass per Founder mandate.

---

## Correction 1 — Wrong Blade Names Audit

**Finding:** No wrong blade names ("Domain split", "Question fan-out", "Model dispatch", "Quarantine check", "Adjudicate", "Eblet mint", "Reputation update", "Vault write", "Cross-domain link") were present in any of the 6 target files.

Grep confirmed zero hits across:
- `PAPERS/KNOWING_WHAT_IS_NOT_TRUE_L1_PUBLIC_BP084.md`
- `PAPERS/KNOWING_WHAT_IS_NOT_TRUE_L2_EXPLAINER_BP084.md`
- `PAPERS/KNOWING_WHAT_IS_NOT_TRUE_L3_TECHNICAL_BP084.md`
- `PROV_22_NEW_SECTIONS/INNOVATION_N_TRUTH_INTEGRITY_CHAIN.md`
- `PROV_22_NEW_SECTIONS/INNOVATION_N1_CODE_BREAKERS_GOLD_REFINED.md`
- `PROV_22_NEW_SECTIONS/INTEGRATION_PLAN.md`

All files refer to "nine-stage plow pipeline" or "Loops 1-9" generically, or name specific correct blades (e.g., "Scribe stage", "Three Fates concordance arbitration"). **No fixes needed for Correction 1.**

Note: The wrong names DO appear in `KNIGHT_YOKE_12_BLADE_PLOW_3Q_M0_TEST_MESH_ROLLOUT_BP084.md` (the old yoke prompt) and in the TIC canon eblet itself (which is outside the workspace). Neither of those are in scope for this correction pass.

---

## Correction 2 — Canon Eblet Verbatim Alignment

### Files UPDATED

#### `PROV_22_NEW_SECTIONS/INNOVATION_N_TRUTH_INTEGRITY_CHAIN.md`

**Problem:** Section heading said `(verbatim from canon: founders_anecdote_africa_mother_dog_bp084)` but the body was a paraphrased literary retelling — missing Abraham, the wife holding the Founder against her shoulder, the white-person detail, "mewling about", and the verbatim closing line "She was logical. But incorrect."

**Fix:** Replaced paraphrased block with actual Founder verbatim quote in blockquote, followed by a brief TIC-specific analysis paragraph.

**Sharp: Africa anecdote in INNOVATION_N now verbatim from canon ✅**

---

#### `PAPERS/KNOWING_WHAT_IS_NOT_TRUE_L3_TECHNICAL_BP084.md`

**Problem:** Section 10 "Patent Application Status" header said "Claim language (from canon eblet specification, formal patent prose pending counsel review)" but the claim language shown differed from the canon:
- TIC Claim 1: Wrong title ("managing epistemic status" vs. "representing knowledge claims in a verified-knowledge accumulator"), missing all 5 structured fields as sub-items (a)-(e)
- TIC Claim 2: Wrong (described dependency tracking mechanism; canon says downstream traversal on update)
- TIC Claim 3: Wrong (described propagation; canon says hasty-generalization detection step)
- TIC Claim 4: Wrong (described hasty-gen guard; canon says distributed plow loop probing consequence chains)
- TIC Claim 5: Wrong (described consequence-tracing; canon says elimination logged with marks-token reward)
- Claims 6-8: Structurally different from canon (cooperative mechanism framing vs. "The method of claim 1/6" framing)

**Fix:** Replaced all 8 claims with verbatim language from the two canon eblets:
- Claims 1-5: verbatim from `canon_truth_integrity_chain_dependency_argument_eblet_chronos_bp084`
- Claims 6-8: verbatim from `canon_code_breakers_guild_gold_refined_by_fire_elimination_marks_bp084`

**Sharp: Patent claims in L3 Section 10 now verbatim from canon ✅**

---

### Files PARTIALLY UPDATED (Africa anecdote consistency)

#### `PAPERS/KNOWING_WHAT_IS_NOT_TRUE_L1_PUBLIC_BP084.md`

**Problem:** Essay told anecdote without the critical "white person" mechanism. Stated "She had no mechanism for 'toddlers from missionary families in Africa are non-threatening'" — this wrong framing implied the dog knew the Founder was a child but considered him threatening. The canon is: the dog had never seen a white person, so she did not classify him as human at all. "To her, I was an alien being."

**Fix (surgical):** Replaced the wrong sentence with: "She had never seen a white person before in her life — to her, I was not a human child at all, I was an alien being come to snatch her children. She had no mechanism for 'pale-skinned creatures near my puppies can be harmless.'"

**Sharp: Africa anecdote in L1 now consistent with canon ✅**

---

#### `PAPERS/KNOWING_WHAT_IS_NOT_TRUE_L2_EXPLAINER_BP084.md`

**Problem:** Same missing mechanism — said "had no way to represent 'this specific toddler is not a threat'" without explaining why (never seen a white person → misclassified as non-human alien).

**Fix (surgical):** Added the white-person detail: "The mother dog had never seen a white person before in her life — she did not categorize me as a child she could choose to spare; she categorized me as an alien being, not human at all. She had no way to represent 'pale-skinned creatures near my puppies can be harmless.'"

**Sharp: Africa anecdote in L2 now consistent with canon ✅**

---

### Files CORRECT — Untouched

#### `PAPERS/KNOWING_WHAT_IS_NOT_TRUE_L3_TECHNICAL_BP084.md` (anecdote sections 1.1.1-1.1.3)

The L3 technical anecdote in Sections 1.1.1-1.1.3 correctly describes the mother dog as "a perfect Bayesian reasoner operating on an incomplete hypothesis space" and treats it analytically. The L3 doesn't claim verbatim and treats it as a formal case study. No changes needed to the anecdote body of L3.

#### `PROV_22_NEW_SECTIONS/INNOVATION_N1_CODE_BREAKERS_GOLD_REFINED.md`

Claim Groups 29.1-29.3 are expanded patent-draft claims (4-tier progression, member tiers, economic mechanism) — properly expanded beyond the 3 seed claims in the canon eblet. The canon eblet claims are seeds; the PROV_22 sections are the proper expanded filing drafts. No inconsistency — untouched.

#### `PROV_22_NEW_SECTIONS/INNOVATION_N_TRUTH_INTEGRITY_CHAIN.md` (Claim Groups 28.1-28.5)

Same as above — 28.1-28.5 are expanded from the 5 seed claims. Properly expanded, no inconsistency. Untouched.

#### `PROV_22_NEW_SECTIONS/INTEGRATION_PLAN.md`

No wrong blade names, no verbatim claim issues, no anecdote. Untouched.

---

## Summary

| File | Blade Names | Anecdote | Patent Claims | Action |
|------|-------------|----------|---------------|--------|
| L1 Public | ✅ None wrong | ✅ Aligned (white-person detail added) | N/A | Updated |
| L2 Explainer | ✅ None wrong | ✅ Aligned (white-person detail added) | N/A | Updated |
| L3 Technical | ✅ None wrong | ✅ Already analytical — untouched | ✅ Now verbatim from canon | Updated |
| INNOVATION_N TIC | ✅ None wrong | ✅ Now verbatim Founder quote | ✅ CG28 expanded draft — correct | Updated |
| INNOVATION_N1 CB | ✅ None wrong | N/A | ✅ CG29 expanded draft — correct | Untouched |
| INTEGRATION_PLAN | ✅ None wrong | N/A | N/A | Untouched |

**4 files changed · 15 insertions · 23 deletions**
**Commit:** cf617ea — pushed to main

---

*Correction pass · BP084 · Sonnet 4.6 · Knight (Cursor AI) · 2026-06-16*
*status: founder-ratify-pending (BP078 BLOOD — nothing publishes)*
