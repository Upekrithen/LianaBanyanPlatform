/**
 * Tier A NEEDS — spec constants
 * ==============================
 * KN-H2 / BP017 Pod-H #2 of 5.
 *
 * Single source of truth for Tier A UI spec-bullets, empirical floor numbers,
 * and tooltip metadata in TierSelectionStep.tsx.
 *
 * Derived from: platform/src/data/lb_frame_tier_specs/tier_a_needs.md
 * Keep both files in sync when updating the spec.
 *
 * Anti-extraction by structural form:
 *   Barrier-of-entry is NOT capital. Cohort-class advancement is the gate.
 */

// ─── Spec bullets (rendered when Tier A card is selected) ──────────────────

/**
 * Primary spec bullets for the Tier A radio-card.
 * Sourced from tier_a_needs.md "What's included" section.
 */
export const TIER_A_SPEC_BULLETS: readonly string[] = [
  "Default Claude Code plan (no upgrade required)",
  "Standard token budget + message-rate limits (no overrides)",
  "Pheromone substrate read-only — query the cooperative warehouse",
  "Detective TEAM read-only — cross-cathedral fan-out for canon search",
  "Brittle Cathedral fingerprint (refreshes via npm run rebuild)",
  "Lone Wolf cohort-class default (separately advanceable)",
] as const;

// ─── Empirical floor (from tier_a_needs.md "Empirical floor" section) ──────

/**
 * Empirical floor receipt summary for Tier A.
 * Verified via R10 cross-vendor benchmark (hard-retrieval institutional knowledge).
 * K477+K481 cross-universe receipts; 8 models / 4 vendors.
 * BRIDLE Rule 4: if lift_pp_min < TARGET_LIFT_PP, surface error — do NOT inflate numbers.
 */
export const TIER_A_EMPIRICAL_FLOOR = {
  benchmark: "R10-v1",
  refs: ["K477", "K481", "R10-cross-vendor"],
  cold_hot_rate_min_pct: 5.3,
  cold_hot_rate_max_pct: 12.0,
  hot_rate_min_pct: 89.3,
  hot_rate_max_pct: 98.7,
  lift_pp_min: 78,
  lift_pp_max: 93.4,
  target_lift_pp: 30,
  pass: true,
  receipt_pointer:
    "BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json",
} as const;

// ─── Canonical plan properties ───────────────────────────────────────────────

export const TIER_A_PLAN_SPEC = {
  plan_requirement: "Default Claude Code Pro/Standard plan",
  upgrade_required: false,
  anyone_can_run: true,
  mcp_slots: "Default (5–10 slots)",
  cohort_class_default: "Lone Wolf",
  bag_of_holding_class: "Small bag (default-plan context-budget); warehouse-access full",
  substrate_mode: "read-only",
  cathedral_fingerprint: "brittle (cron-class; npm run rebuild)",
} as const;

// ─── Tooltip / advisory note ──────────────────────────────────────────────────

/**
 * Tooltip content shown on Tier A card hover or info-button press.
 */
export const TIER_A_TOOLTIP =
  "Tier A runs on whatever Claude Code plan you have today. No upgrade required. " +
  "The cooperative is non-extractive: capital alone cannot purchase higher-tier participation. " +
  "Cathedral Effect retrieval lift (~+78–93 pp over default AI baseline, mean +86 pp) is demonstrated at this tier. " +
  "Reckoning velocity increases with Tier B/C but retrieval quality holds at Tier A.";

// ─── What Tier A cannot do (without advancement) ─────────────────────────────

export const TIER_A_LIMITATIONS: readonly string[] = [
  "Apiarist Hive participation (requires Federation cohort-class)",
  "Excalibur Class subscription (requires Excalibur subscriber)",
  "Fluid Cathedral fingerprint (requires Pied Piper Tier 1+ via Cue Card recency gate)",
  "Event-driven substrate write-back (requires Detective TEAM write-back, Pod-C)",
] as const;
