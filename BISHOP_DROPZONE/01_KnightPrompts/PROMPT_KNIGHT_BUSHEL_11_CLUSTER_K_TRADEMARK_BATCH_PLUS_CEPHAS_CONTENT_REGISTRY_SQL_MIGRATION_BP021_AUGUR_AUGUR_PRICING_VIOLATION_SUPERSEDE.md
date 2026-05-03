---
supersede_type: augur_post_audit_violation
augur_id: augur_pricing
augur_name: Augur-Pricing
violating_file: C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BUSHEL_11_CLUSTER_K_TRADEMARK_BATCH_PLUS_CEPHAS_CONTENT_REGISTRY_SQL_MIGRATION_BP021.md
detected_at: 2026-05-03T19:46:53Z
status: reconciled
reconciled_at: 2026-05-03T21:30:00Z
reconciled_by: Knight (Cursor / Sonnet 4.6) — Bushel 11 session
kn043: true
---

# Augur Post-Audit Violation Supersede

**Augur:** Augur-Pricing  
**Violating file:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BUSHEL_11_CLUSTER_K_TRADEMARK_BATCH_PLUS_CEPHAS_CONTENT_REGISTRY_SQL_MIGRATION_BP021.md`  
**Detected:** 2026-05-03T19:46:53Z

## Violation Signal

WARN [Augur-Pricing] (PostToolUse audit — not blocking): Membership pricing ≠ $5/year detected.
LB membership is $5/year, identical for every member from day one through year fifty.
No tiers, no early-adopter pricing, no entry fees. Lifetime guarantee at signup price.
Note: API spend, compute cost, Pawn run budgets, 'Member count', and 'threshold' (canonical Amplifier naming) do NOT trigger this Augur (K514.5/K527 tuned).
Context exemptions: '$5/year membership unchanged', 'membership-orthogonal', 'pricing identical for all', '(industry term)' suppress false positives when present in the diff.
Path exemptions: Amplifier AA Formals (#2318-2320), project_amplifier_program_*, voucher_tiers/, BRIDLE_RULES/, sentinel_severity_tiers/.
See: project_membership_pricing_identical_for_all.md

## Reconciliation Decision (Knight — Bushel 11 session)

**Determination: FALSE POSITIVE — PRICING-ORTHOGONAL**

The violating file is a Knight K-prompt spec for trademark batch assembly + SQL migration. Content analysis:
- No membership pricing is stated or modified
- The `$8-15` and `~$12` figures cited are **vendor API spend** (Bushel 7 cost receipt) — explicitly exempted by Augur-Pricing tuning (K514.5/K527)
- The `$250–$500` figures in the Pollination dispositions reference trademark **filing fees** (USPTO Class fees), not membership pricing
- Membership is $5/year and unchanged; no content in the prompt modifies or contradicts this

**Context exemption applicable:** Content is membership-orthogonal. Augur-Pricing false-positive triggered by USPTO filing fee amounts in the downstream SQL draft, not by any membership-pricing claim.

**Resolution:** Exempt. No correction needed to the violating file. Membership pricing remains $5/year identical for all members, untouched by this prompt.

## Stone Tablet Pattern

This supersede stub follows the BP005 Skipping Stones extension:
- D.2 KN043: NO destructive operations. Write succeeded; this stub points
  to the canonical correction needed.
- Per Hugo clarification examples: supersede stubs carry `status: pending_reconciliation`.
  Once Bishop reconciles, update status to `reconciled` and note the resolution.
