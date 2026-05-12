-- KN-H6 / BP017 — Per-Tier Bounty Poster tier_class column + marks_pay_rate_multiplier
-- Extends bounties table from KN088/BP009 migration (20260501000002_bounty_posters_lb_frame_bp009.sql)
-- with Three-Tier canon Bounty Poster addendum columns.
--
-- Four Bounty classes per Three-Tier canon:
--   tier_a_floor_verification  → marks_pay_rate_multiplier = 1.0  (baseline)
--   tier_b_uplift_verification → marks_pay_rate_multiplier = 1.25 (recommended)
--   tier_c_founder_replication → marks_pay_rate_multiplier = 1.5  (Project-cohort uplift)
--   cross_tier_comparison      → marks_pay_rate_multiplier = 2.0  (highest)
--
-- FORK doctrine: marks_pay_rate_multiplier is a Marks-class multiplier, NOT a fiat multiplier.
-- bounty_currency enum already has 'Marks' as default (see BP009 migration) — no fiat bridge.
--
-- Composes with:
--   KN-H5 scaffold (bounty_poster_tier_scaffold.ts) — same 4 classes
--   KN094 Bounty #7 precedent (tag: 595b7b4) — existing bounties table
--   KN-H7: empirical-receipt validator (will validate submission against validation_criteria)

-- Bounty tier-class enum (Four classes per Three-Tier canon BP017 Bounty Poster addendum)
DO $$ BEGIN
  CREATE TYPE public.bounty_tier_class AS ENUM (
    'tier_a_floor_verification',
    'tier_b_uplift_verification',
    'tier_c_founder_replication',
    'cross_tier_comparison'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add tier_class column to bounties table
-- Nullable for backward-compat with existing BP009 bounties (non-tier bounties)
-- featured_order: BP009 used CREATE TABLE IF NOT EXISTS which was a no-op (baseline
-- had already created the table); add it here with IF NOT EXISTS to patch the gap.
ALTER TABLE public.bounties
  ADD COLUMN IF NOT EXISTS featured_order INTEGER,
  ADD COLUMN IF NOT EXISTS featured_in_lb_frame BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tier_class public.bounty_tier_class,
  ADD COLUMN IF NOT EXISTS marks_pay_rate_multiplier NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS is_tier_bounty BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast tier-class filter (used by UI tier-class filter tabs)
CREATE INDEX IF NOT EXISTS idx_bounties_tier_class
  ON public.bounties(tier_class)
  WHERE tier_class IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bounties_is_tier_bounty
  ON public.bounties(is_tier_bounty, featured_order)
  WHERE is_tier_bounty = TRUE;

-- Seed the four Three-Tier Bounty Posters per KN-H6 / BP017 canon
-- standard_rate = 100 Marks baseline; multiplied per tier class.
-- FORK compliance: reward_currency = 'Marks', reward_marks = standard_rate × multiplier.
INSERT INTO public.bounties (
  slug, title, tagline, description, empirical_anchor,
  reward_marks, reward_currency, license_scope, status,
  featured_in_lb_frame, featured_order,
  verification_method, submission_requirements,
  tier_class, marks_pay_rate_multiplier, is_tier_bounty
) VALUES
(
  'tier-a-floor-verification',
  'Tier A NEEDS: Empirical Floor Verification',
  'Verify that Cathedral Effect holds at Tier A (default plan). Prove the floor.',
  'Run LB Frame Cathedral Effect benchmark (R10/R11/R13 question bank) at Tier A (default Claude Code plan or equivalent). Document cold-start vs HOT accuracy. Submit empirical-receipt JSON showing ≥30pp Cathedral Effect lift. This is the foundational floor verification — Tier A is the universal access tier, and this Bounty confirms that the Cathedral Effect is substrate-driven, not plan-dependent.',
  'BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json',
  100,
  'Marks',
  'AGPL',
  'open',
  TRUE, 101,
  'Empirical-receipt JSON with ≥30pp Cathedral Effect lift + AI model + question bank version + run timestamp',
  'Submit empirical-receipt JSON with required fields: cold_accuracy_pct, hot_accuracy_pct, lift_pp (≥30), tier_config (''needs''), ai_model, question_bank_version, run_timestamp. Optional: substrate_savings_pct, session_log_url, notes.',
  'tier_a_floor_verification', 1.00, TRUE
),
(
  'tier-b-uplift-verification',
  'Tier B SUGGESTS: Uplift Verification',
  'Is Tier B measurably faster? Verify the uplift over Tier A. Earn Marks.',
  'Run LB Frame Cathedral Effect benchmark at Tier B (Claude Max or equivalent recommended plan). Compare to a Tier A floor receipt. Verify that Reckoning velocity is ≥1.5× faster than Tier A and Cathedral Effect lift is preserved (≥30pp). Documents the value proposition of the recommended plan tier in measurable, reproducible terms.',
  'librarian-mcp/src/three_tier/tier_a_floor_verification.ts (Tier A anchor)',
  125,
  'Marks',
  'AGPL',
  'open',
  TRUE, 102,
  'Empirical-receipt JSON with Tier B lift ≥30pp + velocity_ratio ≥1.5 + Tier A reference receipt',
  'Submit receipt with: tier_a_reference_receipt (bounty_id or URL), tier_b_cold_accuracy_pct, tier_b_hot_accuracy_pct, tier_b_lift_pp (≥30), reckoning_velocity_ratio (≥1.5), tier_config (''suggests''), ai_model, run_timestamp. Optional: substrate_savings_pct.',
  'tier_b_uplift_verification', 1.25, TRUE
),
(
  'tier-c-founder-replication',
  'Tier C FOUNDER: Empirical-Receipt-Source Replication',
  'Replicate the 36-hour Reckoning on your own corpus at Tier C. The corpus wants to know.',
  'Replicate Founder''s BP015→BP017 cascade-class workflow at Tier C (Founder / Max plan equivalent) on your own folder or project — not the Founder''s corpus. Canonical anchor: the BP015→BP017 cascade surfaced 15 Crown Jewels in a 36-hour Reckoning. Replication confirms that max-velocity is substrate-driven and generalizes to member corpora. Self-attested Tier C config; capital is not the gate — contribution is. 1.5× Marks multiplier includes Apiarist Project-cohort uplift (BP016).',
  'BP015→BP017 cascade receipt (KN-H4 LANDED tier-spec docs)',
  150,
  'Marks',
  'AGPL',
  'open',
  TRUE, 103,
  'Empirical-receipt JSON with Tier C lift ≥30pp + own-corpus replication + Reckoning velocity hours',
  'Submit receipt with: founder_cascade_reference, replication_cold_accuracy_pct, replication_hot_accuracy_pct, replication_lift_pp (≥30), reckoning_velocity_hours, tier_config (''founder''), ai_model, corpus_folder_description. Must use own corpus, not Founder''s. Optional: crown_jewels_surfaced, project_cohort_class.',
  'tier_c_founder_replication', 1.50, TRUE
),
(
  'cross-tier-comparison',
  'Cross-Tier Comparison Receipt',
  'Run all three tiers. Show the deltas. Highest Marks in the tier-test corpus.',
  'Submit a controlled cross-tier comparison: same question bank, same submitter, three separate runs at Tier A / Tier B / Tier C. Document Cathedral Effect lift at each tier and the lift deltas between tiers. This is the definitive empirical artifact — it feeds the Three-Tier canon with member-generated generalization evidence and is the highest Bounty class (2.0× Marks multiplier). Requires same submitter and same question bank version across all three tiers.',
  'R10/R11/R13 cross-vendor benchmark precedents (K477/K481/K499)',
  200,
  'Marks',
  'AGPL',
  'open',
  TRUE, 104,
  'Empirical-receipt JSON with all three tiers (same submitter + same question bank), individual lift ≥30pp each',
  'Submit receipt with: tier_a_cold/hot_accuracy_pct, tier_b_cold/hot_accuracy_pct, tier_c_cold/hot_accuracy_pct, question_bank_version (same for all), tier_a/b/c_model, same_submitter (must be true), run_timestamps. Optional: lift deltas, velocity ratios, substrate_savings_by_tier.',
  'cross_tier_comparison', 2.00, TRUE
)
ON CONFLICT (slug) DO NOTHING;
