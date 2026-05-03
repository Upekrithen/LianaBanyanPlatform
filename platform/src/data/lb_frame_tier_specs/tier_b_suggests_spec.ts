/**
 * Tier B SUGGESTS — spec constants
 * ==================================
 * KN-H3 / BP017 Pod-H #3 of 5.
 *
 * Single source of truth for Tier B UI spec-bullets, empirical uplift numbers,
 * and tooltip metadata in TierSelectionStep.tsx.
 *
 * Derived from: platform/src/data/lb_frame_tier_specs/tier_b_suggests.md
 * Keep both files in sync when updating the spec.
 *
 * Composes with:
 *   KN-H1 LANDED 82c52fa (Three-Tier installer + Supabase migration + UI + Python Phase 1)
 *   KN-H2 LANDED (Tier A baseline — empirical floor receipt)
 *   KN102+KN103 LANDED 42ad0c3 (cohort-class probe + Cue Card 7-day recency Fluid Cathedral)
 *   KN104 Detective TEAM PRE-COLOSSUS LANDED 5e7f540 (full Detective TEAM access at Tier B)
 *
 * Anti-extraction by structural form:
 *   Tier B is recommended, not required. Barrier-of-entry is NOT capital.
 *   Anyone can pick any tier — advisory is informational only.
 */

// ─── Spec bullets (rendered when Tier B card is selected) ──────────────────

/**
 * Primary spec bullets for the Tier B radio-card.
 * Sourced from tier_b_suggests.md "What's included over Tier A" section.
 */
export const TIER_B_SPEC_BULLETS: readonly string[] = [
  "Claude Code Max or equivalent (recommended, not required)",
  "1M-context Opus 4.7 token budget (vs default Tier A bag)",
  "15–20 MCP slots minimum (full LB Frame core + Cathedral + Pheromone + Detective TEAM)",
  "Full Pheromone substrate (read + write — was read-only at Tier A)",
  "Detective TEAM full access + write-back loop (was read-only at Tier A)",
  "Fluid Cathedral fingerprint via Cue Card 7-day recency gate (was Brittle at Tier A)",
  "Pied Piper Tier 1+ cohort-class recommended (separately advanceable)",
] as const;

// ─── Empirical uplift (from tier_b_suggests.md "Empirical uplift" section) ─

/**
 * Empirical uplift receipt summary for Tier B over Tier A baseline.
 * HOT-rate verified via R10 cross-vendor benchmark (same substrate quality at both tiers).
 * Reckoning velocity + Pod-scaffolding targets from BP017 canon spec (architectural basis).
 * BRIDLE Rule 4: velocity_source = "bp017-spec" clearly distinguishes from live-benchmark.
 */
export const TIER_B_EMPIRICAL_UPLIFT = {
  baseline_tier: "needs" as const,
  baseline_receipt_pointer:
    "BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json",
  refs: ["KN-H3", "BP017", "KN102", "KN103", "KN104", "R10-cross-vendor"],
  hot_rate_min_pct: 89.3,
  hot_rate_max_pct: 98.7,
  hot_rate_note:
    "HOT-rate is substrate-dependent, not plan-dependent. Same R10 data applies at Tier B. " +
    "Fluid Cathedral may improve HOT-rate in fast-evolving knowledge domains.",
  reckoning_velocity_uplift_target_x: 2.5,
  reckoning_velocity_uplift_range: "2–3×" as const,
  reckoning_velocity_description: "5-min cluster fan-out vs ~15-min at Tier A",
  reckoning_velocity_source: "bp017-spec" as const,
  pod_scaffolding_rate_target_min_x: 1.5,
  pod_scaffolding_rate_description:
    "~1 K-prompt per 30 min sustained (vs ~60 min at Tier A)",
  pod_scaffolding_source: "bp017-spec" as const,
  cathedral_hot_between_rebuilds_pct_range: "70–85" as const,
  receipt_pointer:
    "BISHOP_DROPZONE/14_CanonicalReferences/TIER_B_EMPIRICAL_UPLIFT_RECEIPT_BP017.json",
} as const;

// ─── Canonical plan properties ───────────────────────────────────────────────

export const TIER_B_PLAN_SPEC = {
  plan_requirement: "Claude Code Max or equivalent higher-tier (recommended, not required)",
  plan_note: "Tier B advisory surfaces if plan below Max-equivalent. Informational only — does not block.",
  upgrade_required: false,
  anyone_can_run: true,
  mcp_slots: "15–20 slots minimum",
  cohort_class_recommended: "Pied Piper Tier 1+",
  bag_of_holding_class:
    "Bigger bag (Claude Code Max context-budget); event-driven warehouse-write at Pied Piper+ cohort",
  substrate_mode: "read+write",
  cathedral_fingerprint: "fluid (event-driven; Cue Card 7-day recency gate)",
  pheromone_mode: "read+write",
  detective_team_mode: "full (read+write-back)",
} as const;

// ─── Tooltip / advisory note ──────────────────────────────────────────────────

/**
 * Tooltip content shown on Tier B card hover or info-button press.
 */
export const TIER_B_TOOLTIP =
  "Tier B runs on Claude Code Max or equivalent. Recommended for faster Reckoning velocity (2–3× Tier A) " +
  "and sustained Pod scaffolding (~30 min per K-prompt vs ~60 min). Retrieval HOT-rate is the same — " +
  "substrate quality does not depend on plan tier. Tier B uplifts the bag: bigger token budget, " +
  "higher message-rate limits, full Pheromone write, Detective TEAM write-back, and Fluid Cathedral " +
  "fingerprint (event-driven freshness). Tier B is recommended, not required — anyone can run any tier.";

/**
 * Plan-tier advisory shown if user picks Tier B but surface indicates below Max-equivalent.
 * Informational only — does NOT block. Per Three-Tier canon: user sovereignty preserved.
 */
export const TIER_B_PLAN_ADVISORY =
  "Advisory (informational — does not block): Tier B is recommended for Claude Code Max or equivalent. " +
  "If your plan has lower token budgets or message-rate limits, Reckoning velocity may be slower — " +
  "but LB Frame still runs. Your bag is smaller; the warehouse is still full. " +
  "Capital alone is not the gate. You have full sovereignty to pick any tier.";

// ─── What Tier B cannot do (without separate advancement) ────────────────────

export const TIER_B_LIMITATIONS: readonly string[] = [
  "Excalibur Class subscription (requires Excalibur subscriber, KN105 — separately advanceable)",
  "Federation full-write to Project Gold (requires Federation cohort-class — separately advanceable)",
  "Civilization-tier Codex / Reliquary write (requires Thirteenth Warrior cohort — separately advanceable)",
] as const;
