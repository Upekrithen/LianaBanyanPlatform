# CT_VOTING_RECON_BP085 — BP082 Voting Infrastructure Recon
**Date:** 2026-06-18 · **Session:** BP085 · **Agent:** Knight (Sonnet 4.6)

---

## Existing Tables (8)

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `council_voting_cycles` | `id`, `initiative_id`, `cycle_label`, `cycle_start`, `cycle_end`, `status` (open/closed/tallied) | BP039 — voting cycles for crown elections |
| `council_votes` | `id`, `cycle_id`, `voter_member_id`, `candidate_crown_id`, `vote_class` (support/abstain/reject) | BP039 — individual council votes; UNIQUE(cycle, voter, candidate) |
| `governance_audit_log` | `id`, `action_type`, `summary`, `actor_id`, `reference_id`, `metadata`, `created_at` | W12 — immutable append-only; no UPDATE/DELETE policy |
| `admin_governance_overrides` | `id`, `admin_id`, `override_type`, `target_id`, `reason`, `previous_value`, `new_value` | W12 — every override triggers governance_audit_log insert |
| `pedestal_vote_canon` | `id`, `recipient_name`, `recipient_slug`, `initiative_id`, `pedestal_class`, `vote_status` | BP039 — dispatch flow tracking |
| `vote_allocations` | `votable_item_id`, `member_id`, `vote_class`, `credits_allocated` | W12 — general governance votes; 5% cap enforced by RPC |
| `guild_master_profiles` | `id`, `user_id`, `display_name`, `specialty`, `experience_years`, `linkedin_url`, `linkedin_verified`, `rating`, `bio` | BP073 W9 — guild master registry |
| `member_profiles` | (base table + added cols) `reputation_score`, `governance_flags` | W12 additions |

## Existing Views (2)

| View | Source Tables | Purpose |
|------|---------------|---------|
| `council_vote_tallies` | `council_votes` | Aggregated support/abstain/reject counts per cycle+candidate |
| `member_activity_feed` | `shadow_marks_ledger`, `vote_allocations`, `bounty_claims`, `ip_ledger` | Unified participation activity feed |

## Existing RPCs (3)

| RPC | Signature | Purpose |
|-----|-----------|---------|
| `cast_vote_with_cap_check` | `(p_item_id uuid, p_vote_class text) → uuid` | General governance vote with 5% server-side cap; writes to governance_audit_log |
| `cast_council_vote_with_cap_check` | `(p_cycle_id uuid, p_candidate_crown uuid, p_vote_class text) → uuid` | Council crown election vote with 5% cap |
| `refresh_reputation_score` | `(p_user_id uuid) → integer` | Recalculates reputation from marks + bounties + ip_ledger + votes |

## Migration Files Scanned

Key migrations for governance:
- `20260512130000_bp039_council_voting.sql` — council_voting_cycles + council_votes
- `20260512140000_bp039_pedestal_vote_canon.sql` — pedestal dispatch table
- `20260603000012_w12_governance_real.sql` — governance_audit_log + admin_overrides + RPCs + member_profiles columns
- `20260603120001_bp073_w9_guild_master_profiles.sql` — guild_master_profiles

## GAP ANALYSIS — Programming Central Needs

| Need | Status | Notes |
|------|--------|-------|
| `hiring_directors` table | **MISSING** | SEG-3 PAUSED — awaiting Founder gate |
| `node_operators` view | **MISSING** | Depends on hiring_directors |
| Coding contracts table | **MISSING** | No table for programming contracts |
| Guild Director election trigger | **MISSING** | `council_voting_cycles` can be adapted but no guild-specific director trigger exists |
| BP082 vote tier table | **MISSING** | No dedicated tier table (20/30/50/75/100/150/200/300/500/1000 tiers) |

## Existing Infrastructure Reusable for Programming Central

- `council_voting_cycles` + `cast_council_vote_with_cap_check` → Guild Director elections can use this
- `vote_allocations` + `cast_vote_with_cap_check` → Vote Hub general voting
- `governance_audit_log` → Immutable record for all ouster/election events
- `guild_master_profiles` → Guilds Directors display data source
- `member_profiles.reputation_score` → Reputation weight: `1 + log10(Marks+1)`
