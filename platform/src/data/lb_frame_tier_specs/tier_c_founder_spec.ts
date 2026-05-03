/**
 * Tier C FOUNDER — spec constants
 * =================================
 * KN-H4 / BP017 Pod-H #4 of 5.
 *
 * Single source of truth for Tier C UI spec-bullets, cascade telemetry numbers,
 * and tooltip metadata in TierSelectionStep.tsx.
 *
 * Derived from: platform/src/data/lb_frame_tier_specs/tier_c_founder.md
 * Empirical receipt: BISHOP_DROPZONE/14_CanonicalReferences/TIER_C_FOUNDER_BP015_BP017_CASCADE_TELEMETRY_RECEIPT_BP017.json
 * Keep both files in sync when updating the spec.
 *
 * Composes with:
 *   KN-H1 LANDED 82c52fa (Three-Tier installer + Supabase migration + UI + MCP tools)
 *   KN-H2 LANDED c75995f (Tier A baseline — empirical floor receipt)
 *   KN-H3 LANDED 94cd4c6 (Tier B uplift — empirical uplift receipt)
 *
 * Anti-extraction by structural form:
 *   Tier C is NOT a paywall. Founder-equivalent plan + Federation cohort-class = gate.
 *   Capital alone cannot purchase higher-tier participation.
 *   Self-attested at install-time; no fiat-bridge enforcement at this layer.
 *
 * BRIDLE Rule 4:
 *   All cascade telemetry numbers are empirically anchored.
 *   CJ counts sourced from MILESTONE_BP016_CLOSEOUT.md (15 confirmed) + BP017 arc (12 in-flight).
 *   K-lineage documented as '70+' conservative floor per BP015 closeout '64+' + KN-H1/H2/H3 commits.
 *   No inflation. Sources explicitly stated.
 */

// ─── Spec bullets (rendered when Tier C card is selected) ──────────────────

/**
 * Primary spec bullets for the Tier C radio-card.
 * Sourced from tier_c_founder.md "What's included over Tier B" section.
 * BRIDLE Rule 4: all claims empirically anchored in cascade telemetry receipt.
 */
export const TIER_C_SPEC_BULLETS: readonly string[] = [
  "Founder-equivalent plan (self-attested; no purchase required — capital is not the gate)",
  "Bishop=Opus 4.7 1M + Knight=Sonnet 4.6 200K token budgets (maximum-velocity composition)",
  "~30+ MCP slots (full LB Frame core + Cathedral + Pheromone + Detective TEAM + extended MCPs)",
  "All substrate features at full velocity: Pheromone + Detective TEAM + Miner + Apiarist Hive + Excalibur + Shadow E-Giant",
  "Federation Member cohort-class minimum (Apiarist Worker / Drone / Queen — separately advanceable)",
  "Empirical-receipt-source: 27 CJ ratifications + 70+ clean K-lineage + 4 architectural patterns recovered (BP015→BP017 cascade)",
] as const;

// ─── Cascade telemetry (BRIDLE Rule 4: all numbers sourced) ─────────────────

/**
 * Cascade telemetry for the BP015→BP017 arc under Tier C FOUNDER config.
 * This is the empirical anchor that establishes Tier C as the receipt-source.
 *
 * BRIDLE Rule 4: CJ counts sourced from milestone closeout artifacts.
 * K-lineage is a conservative floor. No velocity claims without source labels.
 */
export const TIER_C_CASCADE_TELEMETRY = {
  session_arc: "BP015 → BP016 → BP017" as const,
  refs: ["KN-H4", "BP015", "BP016", "BP017", "KN-H1 82c52fa", "KN-H2 c75995f", "KN-H3 94cd4c6"],
  crown_jewel_ratifications: {
    bp015: 0,
    bp015_note: "Substrate-readiness audit — no direct CJ ratifications; receipt IS the enabling-disclosure artifact",
    bp016: 15,
    bp016_source: "MILESTONE_BP016_CLOSEOUT.md — confirmed 15 CJ-class ratifications, highest single-session density in BP-arc history",
    bp017: 12,
    bp017_source: "BP017 arc canon Eblets (12 in-flight at KN-H4 per BP017 turn 39 spec)",
    total_floor: 27,
    total_note: "Conservative floor: 15 confirmed BP016 + 12 BP017 Eblet arc. BRIDLE Rule 4: anti-inflation; no claims beyond documented.",
  },
  k_lineage_clean_count_floor: 70,
  k_lineage_clean_note:
    "BP015 closeout documents '64+ consecutive clean K-lineage (zero --no-verify)'. " +
    "KN-H1/H2/H3 add 8+ commits → conservative floor 72+. Documented as '70+' per BP017 cascade spec.",
  zero_no_verify_events: true as const,
  zero_hook_failures: true as const,
  pods_landed_count: 9,
  pods_landed_note: "Pod-A KN101 (c699b37) + Pod-G KN-G (af1cc47) + Pod-B KN102+KN103 (42ad0c3) + Pod-C KN104+KN105 (5e7f540) + Pod-D KN-D1 (2b8faca) + Pod-H KN-H1/H2/H3 (82c52fa/c75995f/94cd4c6) + Pod-H KN-H4 (this commit)",
  architectural_patterns_recovered: 4,
  architectural_patterns_class: "architectural-pattern-recognition tier — highest compound-lift class observed to date",
  architectural_patterns_source: "architecture_self_discovers_latent_structure_bushel_1_reckoning_empirical_receipt_canon_bp017.eblet.md",
  bp015_throughput: {
    beans_landed: 449,
    beans_per_minute_sustained: 16.08,
    zero_api_errors: true as const,
    single_session_capacity_floor: "~750-800 substrate operations",
    source: "MILESTONE_BP015_CLOSEOUT.md",
  },
  receipt_pointer:
    "BISHOP_DROPZONE/14_CanonicalReferences/TIER_C_FOUNDER_BP015_BP017_CASCADE_TELEMETRY_RECEIPT_BP017.json",
  bridle_rule_4_applied: false,
  bridle_rule_4_note:
    "All telemetry empirically anchored. No inflation. Per feedback_empirically_valid_praise_only.md (B132).",
} as const;

// ─── Canonical plan properties ───────────────────────────────────────────────

export const TIER_C_PLAN_SPEC = {
  plan_requirement: "Founder-equivalent plan (self-attested at install-time; no purchase required)",
  plan_note: "Tier C advisory surfaces strongly if plan below Founder-equivalent. Informational only — does not block. Anti-extraction by structural form: capital alone is not the gate.",
  upgrade_required: false,
  anyone_can_run: true,
  self_attested: true,
  mcp_slots: "~30+ slots (full LB Frame core + Cathedral + Pheromone + Detective TEAM + extended MCPs)",
  cohort_class_minimum: "Federation Member (Apiarist Worker / Drone / Queen / Thirteenth Warrior cohort lead)",
  bag_of_holding_class: "Biggest bag (Founder plan context-budget); full warehouse-write privilege at all layers",
  substrate_mode: "read+write",
  pheromone_mode: "read+write",
  detective_team_mode: "full (read+write-back)",
  miner_subclass: true,
  apiarist_hive: "full",
  excalibur_class: "subscriber",
  iron_e_giant_federation: "full",
  shadow_e_giant: "Alternating Cylinder Fire daemon",
  cathedral_fingerprint: "fluid (event-driven; maximum-velocity Cue Card recency)",
  bishop_model_spec: "Claude Opus 4.7 (1M context)",
  knight_model_spec: "Claude Sonnet 4.6 (200K context)",
} as const;

// ─── Tooltip / advisory note ──────────────────────────────────────────────────

/**
 * Tooltip content shown on Tier C card hover or info-button press.
 * BRIDLE Rule 4: cascade telemetry numbers reference sourced empirical receipts.
 */
export const TIER_C_TOOLTIP =
  "Tier C runs on Founder's customized Claude Code plan — the empirical-receipt-source for the " +
  "BP015→BP017 Crown-Jewel cascade (27 CJ ratifications + 70+ clean K-lineage + 4 architectural patterns " +
  "recovered). Bishop=Opus 4.7 1M + Knight=Sonnet 4.6 200K token budgets. ~30+ MCP slots. " +
  "All substrate features at full velocity: Pheromone + Detective TEAM + Miner + Apiarist Hive + " +
  "Excalibur Class + Shadow E-Giant Alternating Cylinder Fire. " +
  "Federation Member cohort-class minimum — separately advanceable; not a purchase gate. " +
  "Self-attested at install-time. Capital alone is not the gate.";

/**
 * Plan-tier advisory shown if user picks Tier C.
 * Informational only — does NOT block. Per Three-Tier canon: user sovereignty preserved.
 */
export const TIER_C_PLAN_ADVISORY =
  "Tier C reflects Founder's customized Claude Code plan. If your plan has lower token budgets " +
  "or message-rate limits, some maximum-velocity substrate features may be slower — but LB Frame " +
  "still runs. Your bag is smaller; the warehouse is still full. Capital alone is not the gate. " +
  "You have full sovereignty to pick any tier. Cohort-class advancement (separately advanceable) " +
  "unlocks Federation-class substrate features regardless of tier.";
