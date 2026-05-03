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
import { type TierBountyClass } from "./bounty_poster_tier_scaffold.js";
export interface MarksPayRate {
    /** Always "Marks" — FORK doctrine: Bounty never pays fiat. */
    readonly currency: "Marks";
    /** Computed Marks amount: standard_rate × tier_multiplier */
    readonly amount: number;
    /** Multiplier applied per tier class (1.0 / 1.25 / 1.5 / 2.0) */
    readonly multiplier: number;
    /** Base standard rate before multiplier */
    readonly standard_rate: number;
}
/** JSON Schema for empirical-receipt submission, per Bounty class. */
export interface SubmissionSchema {
    /** Schema version */
    schema_version: "1.0";
    /** Bounty class this schema applies to */
    bounty_class: TierBountyClass;
    /** Required fields for a valid receipt submission */
    required_fields: SubmissionField[];
    /** Optional enrichment fields */
    optional_fields: SubmissionField[];
}
export interface SubmissionField {
    name: string;
    type: "string" | "number" | "boolean" | "array" | "object";
    description: string;
}
export interface ValidationCriteria {
    /** Human-readable pass criteria */
    pass_conditions: string[];
    /** Human-readable fail conditions */
    fail_conditions: string[];
    /** Minimum Cathedral Effect lift threshold (percentage points) */
    min_cathedral_lift_pp: number;
    /** Whether Furnace gear-tooth-fit score is required */
    furnace_score_required: boolean;
    /** Minimum Furnace score if required */
    min_furnace_score?: number;
    /** Notes for KN-H7 validator */
    validator_notes: string;
}
export type CohortClassEligibility = "federation_member_or_higher" | "any_authenticated_user";
export interface TierBountyPoster {
    /** UUID v4 — unique Bounty Poster instance identifier */
    bounty_id: string;
    /** Tier Bounty class (4 classes per Three-Tier canon) */
    tier_class: TierBountyClass;
    /** Human-readable description sourced from Three-Tier canon */
    description: string;
    /** Short poster headline */
    poster_headline: string;
    /** Poster sub-headline */
    poster_subhead: string;
    /** FORK-compliant Marks pay-rate (never fiat) */
    marks_pay_rate: MarksPayRate;
    /** JSON schema for empirical-receipt submission */
    submission_schema: SubmissionSchema;
    /** Pass/fail thresholds — composes with KN-H7 validator */
    validation_criteria: ValidationCriteria;
    /** Cohort class required to submit (per Bounty Poster precedent) */
    cohort_class_eligibility: CohortClassEligibility;
    /** Empirical anchor document / receipt pointer */
    empirical_anchor: string;
    /** ISO timestamp when this poster was generated */
    generated_at: string;
    /** Source canon reference */
    canon_reference: "BP017-Three-Tier-Bounty-Poster-Addendum";
}
declare const SUBMISSION_SCHEMAS: Record<TierBountyClass, SubmissionSchema>;
declare const VALIDATION_CRITERIA: Record<TierBountyClass, ValidationCriteria>;
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
export declare function generateTierBountyPoster(tier_class: TierBountyClass, standard_rate?: number): TierBountyPoster;
/**
 * Generates all four Bounty Poster instances at once.
 * Returns them ordered A → B → C → Cross-tier.
 */
export declare function generateAllTierBountyPosters(standard_rate?: number): TierBountyPoster[];
export interface GenerateTierBountyPosterArgs {
    tier_class: TierBountyClass;
    /** Base Marks rate before tier multiplier. Defaults to 100 Marks. */
    standard_rate?: number;
    /** If true, generates all four classes at once (ignores tier_class). */
    generate_all?: boolean;
}
export interface GenerateTierBountyPosterResult {
    ok: boolean;
    poster?: TierBountyPoster;
    all_posters?: TierBountyPoster[];
    error?: string;
}
/**
 * MCP tool handler: generate_tier_bounty_poster
 * Creates a Bounty Poster instance for a given tier class.
 * FORK doctrine: marks_pay_rate is Marks-class only.
 */
export declare function handleGenerateTierBountyPoster(args: GenerateTierBountyPosterArgs): GenerateTierBountyPosterResult;
export type { TierBountyClass };
export { SUBMISSION_SCHEMAS, VALIDATION_CRITERIA };
