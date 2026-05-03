---
supersede_type: augur_post_audit_violation
augur_id: augur_pricing
augur_name: Augur-Pricing
violating_file: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\12_Innovations_AA\AA_FORMAL_2NNN_ATREYU_LIBRARIAN_PERSONAL_TIER_BP016.md
detected_at: 2026-05-02T18:47:18Z
status: pending_reconciliation
kn043: true
name: Atreyu Librarian Personal Tier — Augur Pricing Violation Supersede
description: Augur post-audit violation stub for the Atreyu Librarian Personal Tier BP016 filing; pricing content triggered Augur-Pricing detector pending reconciliation; canonical content in the non-supersede sibling file.
type: aa_formal
innovation_id: "2NNN"
ratification_session: BP016
prov_filing_status: "none"
prov_filing_target: 14
crown_jewel_class: false
superseded_by: true
wrasseTriggers:
  - atreyu librarian personal tier augur pricing supersede
  - augur pricing violation atreyu
  - atreyu supersede pending reconciliation
  - aa formal 2nnn atreyu supersede
  - augur post audit violation atreyu bp016
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# Augur Post-Audit Violation Supersede

**Augur:** Augur-Pricing  
**Violating file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\12_Innovations_AA\AA_FORMAL_2NNN_ATREYU_LIBRARIAN_PERSONAL_TIER_BP016.md`  
**Detected:** 2026-05-02T18:47:18Z

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
