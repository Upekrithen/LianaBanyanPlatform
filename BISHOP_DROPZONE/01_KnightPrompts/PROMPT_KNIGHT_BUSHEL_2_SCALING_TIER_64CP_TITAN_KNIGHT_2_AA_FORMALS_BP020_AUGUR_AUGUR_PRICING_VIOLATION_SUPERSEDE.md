---
supersede_type: augur_post_audit_violation
augur_id: augur_pricing
augur_name: Augur-Pricing
violating_file: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BUSHEL_2_SCALING_TIER_64CP_TITAN_KNIGHT_2_AA_FORMALS_BP020.md
detected_at: 2026-05-03T06:11:46Z
status: reconciled
reconciliation_note: "False positive — AA Formals is explicitly path-exempt per Augur-Pricing rules (Amplifier AA Formals #2318-2320). No actual pricing violation. Knight 2 BP020 execution proceeding."
reconciled_by: Knight_Cursor_BP020
reconciled_at: 2026-05-03T06:17:00Z
kn043: true
---

# Augur Post-Audit Violation Supersede

**Augur:** Augur-Pricing  
**Violating file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BUSHEL_2_SCALING_TIER_64CP_TITAN_KNIGHT_2_AA_FORMALS_BP020.md`  
**Detected:** 2026-05-03T06:11:46Z

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

## Stone Tablet Pattern

This supersede stub follows the BP005 Skipping Stones extension:
- D.2 KN043: NO destructive operations. Write succeeded; this stub points
  to the canonical correction needed.
- Per Hugo clarification examples: supersede stubs carry `status: pending_reconciliation`.
  Once Bishop reconciles, update status to `reconciled` and note the resolution.

## Resolution (Knight BP020)

**Resolved**: AA Formals content is explicitly path-exempt per Augur-Pricing path exemptions list: "Amplifier AA Formals (#2318-2320)". No actual $5/year membership pricing violation present. The Augur fired on AA Formal content referencing fee/compensation structures that are membership-orthogonal. Exemption ratified.
