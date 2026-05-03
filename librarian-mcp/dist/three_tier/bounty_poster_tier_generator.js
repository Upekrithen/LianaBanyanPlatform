/**
 * Bounty Poster Tier Generator — KN-H6 / BP017
 * ================================================
 * Generates per-tier Bounty Poster instances for the Three-Tier LB Frame
 * empirical-verification Bounty system.
 *
 * Four Bounty classes per Three-Tier canon BP017 Bounty Poster addendum:
 *   A. Tier A NEEDS empirical floor verification    → Marks × 1.0
 *   B. Tier B SUGGESTS uplift verification          → Marks × 1.25
 *   C. Tier C FOUNDER empirical-receipt-source      → Marks × 1.5
 *   D. Cross-tier comparison receipt                → Marks × 2.0
 *
 * FORK doctrine compliance:
 *   marks_pay_rate is typed as MarksPayRate — a branded value that names the
 *   currency as "Marks" at the type level. The fiat bridge is structurally
 *   impossible: amount is a Marks count, NOT a USD equivalent.
 *   Reference: project_mark_backing_oneway.md — Bounty pays in Marks, NOT fiat.
 *
 * Apiarist Project-cohort composition:
 *   Tier C × 1.5 multiplier includes Project-cohort GREATER % payment uplift
 *   per BP016 Apiarist Hive canon. The multiplier encodes this composition.
 *
 * Composes with:
 *   - KN-H5 scaffold: bounty_poster_tier_scaffold.ts (pay-rate metadata + lookup)
 *   - KN094 Bounty #7 Heartbeat Interval Tuning (precedent; tag: 595b7b4)
 *   - KN-H7: empirical-receipt validator (will validate submission_schema receipts)
 */
import { randomUUID } from "crypto";
import { getBountyPayRateByClass, getAllTierBountyPayRates, } from "./bounty_poster_tier_scaffold.js";
// ─── Submission Schemas per Bounty Class ─────────────────────────────────────
const SUBMISSION_SCHEMAS = {
    tier_a_floor_verification: {
        schema_version: "1.0",
        bounty_class: "tier_a_floor_verification",
        required_fields: [
            {
                name: "cold_accuracy_pct",
                type: "number",
                description: "Cold-start accuracy percentage (0–100) on R10/R11 question bank",
            },
            {
                name: "hot_accuracy_pct",
                type: "number",
                description: "HOT (Cathedral-loaded) accuracy percentage (0–100) on same question bank",
            },
            {
                name: "lift_pp",
                type: "number",
                description: "Cathedral Effect lift in percentage points (hot - cold)",
            },
            {
                name: "tier_config",
                type: "string",
                description: "Self-attested tier config used: 'needs' (Tier A default plan)",
            },
            {
                name: "ai_model",
                type: "string",
                description: "AI model identifier (e.g. 'claude-haiku-3-5', 'gpt-4o-mini')",
            },
            {
                name: "question_bank_version",
                type: "string",
                description: "R10/R11/R13 question bank version used",
            },
            {
                name: "run_timestamp",
                type: "string",
                description: "ISO 8601 timestamp of run",
            },
        ],
        optional_fields: [
            {
                name: "substrate_savings_pct",
                type: "number",
                description: "Substrate savings vs cold Sonnet equivalent (from K505 telemetry)",
            },
            {
                name: "session_log_url",
                type: "string",
                description: "URL to session transcript or log artifact",
            },
            {
                name: "notes",
                type: "string",
                description: "Free-text notes on methodology or anomalies",
            },
        ],
    },
    tier_b_uplift_verification: {
        schema_version: "1.0",
        bounty_class: "tier_b_uplift_verification",
        required_fields: [
            {
                name: "tier_a_cold_accuracy_pct",
                type: "number",
                description: "Tier A cold-start accuracy (baseline reference, may cite prior receipt)",
            },
            {
                name: "tier_b_cold_accuracy_pct",
                type: "number",
                description: "Tier B cold-start accuracy on same question bank",
            },
            {
                name: "tier_b_hot_accuracy_pct",
                type: "number",
                description: "Tier B HOT (Cathedral-loaded) accuracy",
            },
            {
                name: "tier_b_lift_pp",
                type: "number",
                description: "Cathedral Effect lift at Tier B (hot - cold, pp)",
            },
            {
                name: "tier_a_reference_receipt",
                type: "string",
                description: "Reference to Tier A floor receipt (bounty_id or URL) — required for comparison",
            },
            {
                name: "tier_config",
                type: "string",
                description: "Self-attested tier config: 'suggests' (Claude Max or equivalent)",
            },
            {
                name: "ai_model",
                type: "string",
                description: "AI model identifier at Tier B",
            },
            {
                name: "reckoning_velocity_ratio",
                type: "number",
                description: "Reckoning velocity ratio vs Tier A (e.g. 2.1 = 2.1× faster Reckoning at Tier B)",
            },
            {
                name: "run_timestamp",
                type: "string",
                description: "ISO 8601 timestamp",
            },
        ],
        optional_fields: [
            {
                name: "question_bank_version",
                type: "string",
                description: "R10/R11/R13 question bank version",
            },
            {
                name: "substrate_savings_pct",
                type: "number",
                description: "Substrate savings vs cold same-tier equivalent",
            },
            {
                name: "notes",
                type: "string",
                description: "Free-text notes",
            },
        ],
    },
    tier_c_founder_replication: {
        schema_version: "1.0",
        bounty_class: "tier_c_founder_replication",
        required_fields: [
            {
                name: "founder_cascade_reference",
                type: "string",
                description: "Reference to Founder's BP015→BP017 cascade receipt (canonical anchor: KN-H4 LANDED tier-spec docs)",
            },
            {
                name: "replication_cold_accuracy_pct",
                type: "number",
                description: "Submitter cold-start accuracy at Tier C on same question bank",
            },
            {
                name: "replication_hot_accuracy_pct",
                type: "number",
                description: "Submitter HOT accuracy at Tier C",
            },
            {
                name: "replication_lift_pp",
                type: "number",
                description: "Submitter Cathedral Effect lift at Tier C (pp)",
            },
            {
                name: "reckoning_velocity_hours",
                type: "number",
                description: "Time in hours for Tier C Reckoning run (Founder reference: 36 hours for BP015→BP017 cascade)",
            },
            {
                name: "tier_config",
                type: "string",
                description: "Self-attested tier config: 'founder' (Tier C)",
            },
            {
                name: "ai_model",
                type: "string",
                description: "AI model identifier at Tier C",
            },
            {
                name: "corpus_folder_description",
                type: "string",
                description: "Brief description of own folder/project used in replication (does not need to be Founder's corpus)",
            },
            {
                name: "run_timestamp",
                type: "string",
                description: "ISO 8601 timestamp",
            },
        ],
        optional_fields: [
            {
                name: "crown_jewels_surfaced",
                type: "number",
                description: "Count of Crown Jewel-class innovations surfaced (Founder reference: 15)",
            },
            {
                name: "question_bank_version",
                type: "string",
                description: "Question bank version",
            },
            {
                name: "project_cohort_class",
                type: "string",
                description: "Project cohort class if applicable (composes with Apiarist BP016 uplift)",
            },
            {
                name: "notes",
                type: "string",
                description: "Free-text notes on replication methodology",
            },
        ],
    },
    cross_tier_comparison: {
        schema_version: "1.0",
        bounty_class: "cross_tier_comparison",
        required_fields: [
            {
                name: "tier_a_cold_accuracy_pct",
                type: "number",
                description: "Tier A cold-start accuracy",
            },
            {
                name: "tier_a_hot_accuracy_pct",
                type: "number",
                description: "Tier A HOT accuracy",
            },
            {
                name: "tier_b_cold_accuracy_pct",
                type: "number",
                description: "Tier B cold-start accuracy",
            },
            {
                name: "tier_b_hot_accuracy_pct",
                type: "number",
                description: "Tier B HOT accuracy",
            },
            {
                name: "tier_c_cold_accuracy_pct",
                type: "number",
                description: "Tier C cold-start accuracy",
            },
            {
                name: "tier_c_hot_accuracy_pct",
                type: "number",
                description: "Tier C HOT accuracy",
            },
            {
                name: "question_bank_version",
                type: "string",
                description: "R10/R11/R13 question bank version — MUST be same bank across all three tiers for valid comparison",
            },
            {
                name: "tier_a_model",
                type: "string",
                description: "AI model at Tier A",
            },
            {
                name: "tier_b_model",
                type: "string",
                description: "AI model at Tier B",
            },
            {
                name: "tier_c_model",
                type: "string",
                description: "AI model at Tier C",
            },
            {
                name: "same_submitter",
                type: "boolean",
                description: "Confirm all three runs were by the same submitter (required for comparison validity)",
            },
            {
                name: "run_timestamps",
                type: "object",
                description: "ISO 8601 timestamps for each tier run: {tier_a: string, tier_b: string, tier_c: string}",
            },
        ],
        optional_fields: [
            {
                name: "lift_delta_a_to_b_pp",
                type: "number",
                description: "Lift delta from Tier A to Tier B (pp)",
            },
            {
                name: "lift_delta_b_to_c_pp",
                type: "number",
                description: "Lift delta from Tier B to Tier C (pp)",
            },
            {
                name: "velocity_ratio_b_vs_a",
                type: "number",
                description: "Reckoning velocity ratio Tier B vs A",
            },
            {
                name: "velocity_ratio_c_vs_a",
                type: "number",
                description: "Reckoning velocity ratio Tier C vs A",
            },
            {
                name: "substrate_savings_by_tier",
                type: "object",
                description: "Substrate savings % per tier: {tier_a: number, tier_b: number, tier_c: number}",
            },
            {
                name: "notes",
                type: "string",
                description: "Free-text notes on comparative methodology",
            },
        ],
    },
};
// ─── Validation Criteria per Bounty Class ────────────────────────────────────
const VALIDATION_CRITERIA = {
    tier_a_floor_verification: {
        pass_conditions: [
            "lift_pp ≥ 30 (Cathedral Effect ≥30pp HOT over cold at Tier A)",
            "tier_config self-attested as 'needs'",
            "question_bank_version is R10, R11, or R13",
            "run_timestamp present and parseable ISO 8601",
        ],
        fail_conditions: [
            "lift_pp < 30 (below floor threshold)",
            "tier_config is 'suggests' or 'founder' (wrong tier for this class)",
            "Question bank not specified",
        ],
        min_cathedral_lift_pp: 30,
        furnace_score_required: false,
        validator_notes: "KN-H7 validator: check lift_pp ≥ 30, tier_config === 'needs', valid question_bank_version. " +
            "Cross-reference to R11 benchmark baseline (K477/K481 precedent).",
    },
    tier_b_uplift_verification: {
        pass_conditions: [
            "tier_b_lift_pp ≥ 30 (Cathedral Effect preserved at Tier B)",
            "reckoning_velocity_ratio ≥ 1.5 (at least 1.5× faster than Tier A)",
            "tier_a_reference_receipt provided and valid",
            "tier_config self-attested as 'suggests'",
        ],
        fail_conditions: [
            "tier_b_lift_pp < 30 (Cathedral Effect fails at Tier B)",
            "reckoning_velocity_ratio < 1.0 (Tier B slower than or equal to Tier A)",
            "No Tier A reference receipt — cannot validate uplift without floor anchor",
        ],
        min_cathedral_lift_pp: 30,
        furnace_score_required: false,
        validator_notes: "KN-H7 validator: verify Tier A reference receipt resolves; check velocity_ratio ≥ 1.5. " +
            "Expected 2–3× range per Three-Tier canon; receipts below 1.5× are edge-case — flag for Founder review.",
    },
    tier_c_founder_replication: {
        pass_conditions: [
            "replication_lift_pp ≥ 30 (Cathedral Effect confirmed at Tier C)",
            "founder_cascade_reference resolves to a valid Tier C receipt anchor",
            "corpus_folder_description present (proves submitter used own data, not Founder's)",
            "tier_config self-attested as 'founder'",
        ],
        fail_conditions: [
            "replication_lift_pp < 30 (Cathedral Effect fails at Tier C)",
            "corpus_folder_description missing (cannot confirm own-corpus replication)",
            "Submitter claims to use Founder's exact corpus — only own-corpus replications accepted",
        ],
        min_cathedral_lift_pp: 30,
        furnace_score_required: false,
        validator_notes: "KN-H7 validator: 1.5× multiplier includes Apiarist Project-cohort uplift (BP016). " +
            "Non-exclusive: any self-attested Tier C member may submit. Capital not the gate — contribution is. " +
            "reckoning_velocity_hours reference: Founder's 36-hour BP015→BP017 cascade.",
    },
    cross_tier_comparison: {
        pass_conditions: [
            "same_submitter === true (all three tiers by same member — required for comparative validity)",
            "same question_bank_version across all three tiers",
            "All three tiers show lift_pp ≥ 30 individually",
            "tier_c_hot_accuracy_pct > tier_b_hot_accuracy_pct > tier_a_hot_accuracy_pct (monotone uplift)",
            "run_timestamps present for all three tiers",
        ],
        fail_conditions: [
            "same_submitter === false or missing",
            "Different question_bank_version across tiers — invalidates comparison",
            "Any tier fails individual Cathedral Effect threshold (lift_pp < 30)",
            "Non-monotone accuracy pattern (lower tier outperforms higher without explanation)",
        ],
        min_cathedral_lift_pp: 30,
        furnace_score_required: false,
        validator_notes: "KN-H7 validator: 2.0× multiplier — highest Bounty class. Strict same-submitter, same-bank requirement. " +
            "Non-monotone results flagged for Founder review — not auto-rejected (anomalies may be valid findings). " +
            "Cross-reference R13 (K499) and K475 for three-tier composite precedent.",
    },
};
// ─── Generator ────────────────────────────────────────────────────────────────
/**
 * Generates a per-tier Bounty Poster instance for the Three-Tier LB Frame
 * empirical-verification system.
 *
 * FORK doctrine: marks_pay_rate is always Marks-class. The generator structurally
 * prevents fiat bridge: MarksPayRate.currency is always "Marks" (never "Credits" or "USD").
 *
 * @param tier_class  One of the four TierBountyClass variants
 * @param standard_rate  Base Marks rate before tier multiplier (default: 100 Marks)
 * @returns  TierBountyPoster instance with UUID, descriptions, schema, criteria
 */
export function generateTierBountyPoster(tier_class, standard_rate = 100) {
    const payRateMeta = getBountyPayRateByClass(tier_class);
    // FORK doctrine compliance: currency is locked to "Marks" at construction time.
    const marks_pay_rate = {
        currency: "Marks",
        amount: standard_rate * payRateMeta.marks_multiplier,
        multiplier: payRateMeta.marks_multiplier,
        standard_rate,
    };
    return {
        bounty_id: randomUUID(),
        tier_class,
        description: payRateMeta.description,
        poster_headline: payRateMeta.poster_headline,
        poster_subhead: payRateMeta.poster_subhead,
        marks_pay_rate,
        submission_schema: SUBMISSION_SCHEMAS[tier_class],
        validation_criteria: VALIDATION_CRITERIA[tier_class],
        cohort_class_eligibility: "federation_member_or_higher",
        empirical_anchor: payRateMeta.empirical_anchor,
        generated_at: new Date().toISOString(),
        canon_reference: "BP017-Three-Tier-Bounty-Poster-Addendum",
    };
}
/**
 * Generates all four Bounty Poster instances at once.
 * Returns them ordered A → B → C → Cross-tier.
 */
export function generateAllTierBountyPosters(standard_rate = 100) {
    return getAllTierBountyPayRates().map((meta) => generateTierBountyPoster(meta.bounty_class, standard_rate));
}
/**
 * MCP tool handler: generate_tier_bounty_poster
 * Creates a Bounty Poster instance for a given tier class.
 * FORK doctrine: marks_pay_rate is Marks-class only.
 */
export function handleGenerateTierBountyPoster(args) {
    try {
        if (args.generate_all) {
            return {
                ok: true,
                all_posters: generateAllTierBountyPosters(args.standard_rate),
            };
        }
        if (!args.tier_class) {
            return {
                ok: false,
                error: "Provide tier_class (tier_a_floor_verification | tier_b_uplift_verification | " +
                    "tier_c_founder_replication | cross_tier_comparison) or generate_all=true.",
            };
        }
        return {
            ok: true,
            poster: generateTierBountyPoster(args.tier_class, args.standard_rate),
        };
    }
    catch (err) {
        return { ok: false, error: err.message };
    }
}
export { SUBMISSION_SCHEMAS, VALIDATION_CRITERIA };
//# sourceMappingURL=bounty_poster_tier_generator.js.map
