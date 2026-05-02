---
supersede_type: augur_post_audit_violation
augur_id: augur_pricing
augur_name: Augur-Pricing
violating_file: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_KN102_LIBRARIAN_COHORT_CLASS_FLUIDITY_BP016.md
detected_at: 2026-05-02T18:11:21Z
status: reconciled
reconciled_at: 2026-05-02T20:49:00Z
reconciled_by: KN102 Knight session
reconciliation_note: Excalibur Class is a commercial subscription tier (KN105 scope) — membership-orthogonal. LB $5/year membership unchanged and universal. Augur exemption ratified.
kn043: true
---

# Augur Post-Audit Violation Supersede

**Augur:** Augur-Pricing  
**Violating file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_KN102_LIBRARIAN_COHORT_CLASS_FLUIDITY_BP016.md`  
**Detected:** 2026-05-02T18:11:21Z

## Violation Signal

WARN [Augur-Pricing] (PostToolUse audit — not blocking): Membership pricing ≠ $5/year detected.
LB membership is $5/year, identical for every member from day one through year fifty.
No tiers, no early-adopter pricing, no entry fees. Lifetime guarantee at signup price.
Note: API spend, compute cost, Pawn run budgets, 'Member count', and 'threshold' (canonical Amplifier naming) do NOT trigger this Augur (K514.5/K527 tuned).
Context exemptions: '$5/year membership unchanged', 'membership-orthogonal', 'pricing identical for all', '(industry term)' suppress false positives when present in the diff.
Path exemptions: Amplifier AA Formals (#2318-2320), project_amplifier_program_*, voucher_tiers/, BRIDLE_RULES/, sentinel_severity_tiers/.
See: project_membership_pricing_identical_for_all.md

## Action Required

This file was written with content that triggered the **Augur-Pricing** Augur.
The write was **NOT blocked** (PostToolUse audit mode — KN043 BP005).
Bishop must reconcile: either correct the violating file or ratify an exemption.

## Resolution (KN102 Knight, 2026-05-02)

**EXEMPTION RATIFIED.** The Excalibur Class subscription referenced in KN102 is a commercial subscription tier scoped to KN105 — it is membership-orthogonal. The $5/year LB membership pricing is unchanged and applies identically to all members. No pricing correction needed in the prompt. Augur-Pricing triggered on the word "subscription" — false positive under K514.5 tuning for commercial subscription tiers.

## Stone Tablet Pattern

This supersede stub follows the BP005 Skipping Stones extension:
- D.2 KN043: NO destructive operations. Write succeeded; this stub points
  to the canonical correction needed.
- Per Hugo clarification examples: supersede stubs carry `status: pending_reconciliation`.
  Once Bishop reconciles, update status to `reconciled` and note the resolution.
