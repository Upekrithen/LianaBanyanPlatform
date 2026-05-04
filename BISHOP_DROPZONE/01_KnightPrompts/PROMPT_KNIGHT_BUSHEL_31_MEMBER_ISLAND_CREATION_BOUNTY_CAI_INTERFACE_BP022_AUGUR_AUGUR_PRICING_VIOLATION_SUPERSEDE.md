---
supersede_type: augur_post_audit_violation
augur_id: augur_pricing
augur_name: Augur-Pricing
violating_file: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BUSHEL_31_MEMBER_ISLAND_CREATION_BOUNTY_CAI_INTERFACE_BP022.md
detected_at: 2026-05-04T00:34:54Z
status: reconciled
reconciled_at: 2026-05-04T00:50:00Z
reconciliation_note: "False positive. Bushel 31 contains Marks-class bounty multipliers (4.0x Tier 6) and IP Ledger economics (83.3% creator-keeps / Cost+20%). LB membership $5/year is UNCHANGED throughout. Context exemption applied: membership-orthogonal + pricing identical for all. Augur triggered on bounty multiplier language — not a membership pricing change. Knight BP022 / Bushel 31 Phase G."
kn043: true
---

# Augur Post-Audit Violation Supersede

**Augur:** Augur-Pricing  
**Violating file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BUSHEL_31_MEMBER_ISLAND_CREATION_BOUNTY_CAI_INTERFACE_BP022.md`  
**Detected:** 2026-05-04T00:34:54Z

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
