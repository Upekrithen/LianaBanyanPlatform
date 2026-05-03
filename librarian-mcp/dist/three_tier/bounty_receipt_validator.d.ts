/**
 * Bounty Empirical-Receipt Validator — KN-H7 / BP017
 * ====================================================
 * Validates submitted Bounty receipts against per-tier empirical criteria.
 *
 * Four Bounty classes (per Three-Tier canon BP017 + KN-H6 submission schemas):
 *   A. tier_a_floor_verification:   HOT-rate lift ≥30pp; tier_config 'needs'; valid question bank
 *   B. tier_b_uplift_verification:  Cathedral lift ≥30pp; Reckoning velocity ≥2× Tier A reference
 *   C. tier_c_founder_replication:  Cathedral lift ≥30pp; founder_cascade_reference; own-corpus
 *   D. cross_tier_comparison:       All 3 tiers lift ≥30pp; same submitter; same bank; monotone uplift
 *
 * Anti-marketing-class discipline (B132/B133 — feedback_empirically_valid_praise_only):
 *   Cathedral Effect cross-vendor baselines (K477/K481/K499): R11 typical HOT-rate 30–50pp.
 *   If reported lift_pp > 60pp (>20% above typical 50pp ceiling) without exceptional evidence,
 *   flag as warnings.suspicious_inflation and route to Founder review. Do NOT auto-approve.
 *
 * BRIDLE Rule 4 conservative defaults:
 *   When ANY criterion fails — including borderline results (e.g. velocity 1.5–2×) —
 *   the receipt FAILS. Anti-extraction structural form: Bounty Marks-payouts must be
 *   empirically anchored, not commercially motivated approximations.
 *
 * Composes with:
 *   - KN-H6 bounty_poster_tier_generator.ts (submission_schema + VALIDATION_CRITERIA)
 *   - KN-H2 tier_a_floor_verification.ts (Tier A floor receipt anchor)
 *   - KN094 Bounty #7 Heartbeat Interval Tuning (precedent Bounty system)
 *   - KN-H8: Marks payout integration (next in Pod-H sequence)
 *
 * Cathedral Effect baseline anchors:
 *   K477: injection-pathway iterations; K481: speed-run covenant Iter-C;
 *   K499: R13 cross-vendor benchmark (800/800 HOT; typical lift 30–50pp).
 */
import { type TierBountyClass } from "./bounty_poster_tier_generator.js";
export interface FailureDetail {
    /** Field or criterion that was not met */
    field: string;
    /** Human-readable criterion description */
    criterion: string;
    /** Actual submitted value (if numeric) */
    actual?: string | number | boolean;
    /** Expected threshold or value */
    expected?: string | number | boolean;
    /** BRIDLE rule applied, if any */
    bridle_rule?: "rule_4";
}
export interface WarningDetail {
    /** Short code identifying the warning type */
    code: string;
    /** Human-readable warning message */
    message: string;
    /** Whether this warning requires Founder review before approval */
    requires_founder_review: boolean;
}
export interface BountyReceiptValidationResult {
    /** true = receipt passes all criteria; false = one or more criteria failed */
    pass: boolean;
    /**
     * Numeric margin relative to the primary threshold (lift_pp vs 30pp).
     * Positive = above threshold (good). Negative = below threshold (failing).
     * For cross-tier: margin is min(tier_a_lift, tier_b_lift, tier_c_lift) − 30.
     */
    margin: number;
    /** Specific criteria not met — each entry is a distinct failure */
    failures: FailureDetail[];
    /** Borderline or suspicious results — surface for Founder review; do not auto-approve */
    warnings: WarningDetail[];
    /** Echo of the submitted bounty_id */
    bounty_id: string;
    /** Bounty class validated against */
    bounty_class: TierBountyClass;
    /** ISO 8601 timestamp of this validation run */
    validated_at: string;
    /** true if any warning has requires_founder_review=true */
    requires_founder_review: boolean;
    /** true if BRIDLE Rule 4 was applied to convert a borderline result to FAIL */
    bridle_rule_4_applied: boolean;
}
/**
 * Validates a submitted Bounty empirical receipt against per-tier criteria.
 *
 * Returns:
 *   - pass: true only if ALL criteria are met (no failures)
 *   - margin: lift_pp − 30 (primary threshold); negative = failing
 *   - failures: specific criteria not met (each is a distinct, actionable failure)
 *   - warnings: borderline or suspicious results requiring Founder review
 *   - requires_founder_review: true if any warning flags manual review
 *   - bridle_rule_4_applied: true if BRIDLE Rule 4 converted a borderline → FAIL
 *
 * BRIDLE Rule 4: when any criterion fails, the receipt FAILS.
 * Do NOT approve borderline cases without explicit evidence.
 */
export declare function validateBountyReceipt(bounty_id: string, bounty_class: TierBountyClass, receipt: Record<string, unknown>): BountyReceiptValidationResult;
export interface ValidateBountyReceiptArgs {
    /** UUID of the Bounty Poster instance being validated against */
    bounty_id: string;
    /** Tier Bounty class — determines which validation criteria apply */
    bounty_class: TierBountyClass;
    /** The submitted empirical receipt (parsed JSON object) */
    receipt_json: Record<string, unknown>;
}
export interface ValidateBountyReceiptResult {
    ok: boolean;
    validation?: BountyReceiptValidationResult;
    error?: string;
}
/**
 * MCP tool handler: validate_bounty_receipt
 *
 * Read-class tool — validates a submitted Bounty empirical receipt.
 * Returns pass/fail + margin + failures + warnings.
 * Suspicious-inflation and borderline results are flagged for Founder review.
 * BRIDLE Rule 4: borderline cases default to FAIL.
 */
export declare function handleValidateBountyReceipt(args: ValidateBountyReceiptArgs): ValidateBountyReceiptResult;
export declare const KN_H7_TEST_CASES: readonly [{
    readonly id: "T1";
    readonly description: "Tier A receipt with ≥30pp lift PASSES";
    readonly args: {
        readonly bounty_id: "test-bounty-t1";
        readonly bounty_class: TierBountyClass;
        readonly receipt_json: {
            readonly cold_accuracy_pct: 50;
            readonly hot_accuracy_pct: 82;
            readonly lift_pp: 32;
            readonly tier_config: "needs";
            readonly ai_model: "claude-haiku-3-5";
            readonly question_bank_version: "R11";
            readonly run_timestamp: "2026-05-01T12:00:00Z";
        };
    };
    readonly expected_pass: true;
}, {
    readonly id: "T2";
    readonly description: "Tier A receipt with <30pp lift FAILS";
    readonly args: {
        readonly bounty_id: "test-bounty-t2";
        readonly bounty_class: TierBountyClass;
        readonly receipt_json: {
            readonly cold_accuracy_pct: 55;
            readonly hot_accuracy_pct: 76;
            readonly lift_pp: 21;
            readonly tier_config: "needs";
            readonly ai_model: "claude-haiku-3-5";
            readonly question_bank_version: "R11";
            readonly run_timestamp: "2026-05-01T12:00:00Z";
        };
    };
    readonly expected_pass: false;
}, {
    readonly id: "T3";
    readonly description: "Tier B receipt with ≥2× Reckoning velocity PASSES";
    readonly args: {
        readonly bounty_id: "test-bounty-t3";
        readonly bounty_class: TierBountyClass;
        readonly receipt_json: {
            readonly tier_a_cold_accuracy_pct: 50;
            readonly tier_b_cold_accuracy_pct: 52;
            readonly tier_b_hot_accuracy_pct: 84;
            readonly tier_b_lift_pp: 32;
            readonly tier_a_reference_receipt: "prior-tier-a-receipt-uuid";
            readonly tier_config: "suggests";
            readonly ai_model: "claude-sonnet-4-6";
            readonly reckoning_velocity_ratio: 2.3;
            readonly run_timestamp: "2026-05-01T13:00:00Z";
        };
    };
    readonly expected_pass: true;
}, {
    readonly id: "T4";
    readonly description: "Tier C cascade-replication receipt PASSES with Crown-Jewel evidence";
    readonly args: {
        readonly bounty_id: "test-bounty-t4";
        readonly bounty_class: TierBountyClass;
        readonly receipt_json: {
            readonly founder_cascade_reference: "KN-H4 LANDED tier-spec docs / BP015→BP017 cascade receipt";
            readonly replication_cold_accuracy_pct: 48;
            readonly replication_hot_accuracy_pct: 81;
            readonly replication_lift_pp: 33;
            readonly reckoning_velocity_hours: 40;
            readonly tier_config: "founder";
            readonly ai_model: "claude-opus-4-7";
            readonly corpus_folder_description: "Own project folder: 65GB ML research corpus, 12,000 files, 2018-2026.";
            readonly run_timestamp: "2026-05-01T14:00:00Z";
            readonly crown_jewels_surfaced: 12;
        };
    };
    readonly expected_pass: true;
}, {
    readonly id: "T5";
    readonly description: "Cross-tier comparison receipt PASSES with all-3-tiers schema";
    readonly args: {
        readonly bounty_id: "test-bounty-t5";
        readonly bounty_class: TierBountyClass;
        readonly receipt_json: {
            readonly tier_a_cold_accuracy_pct: 48;
            readonly tier_a_hot_accuracy_pct: 80;
            readonly tier_b_cold_accuracy_pct: 50;
            readonly tier_b_hot_accuracy_pct: 85;
            readonly tier_c_cold_accuracy_pct: 52;
            readonly tier_c_hot_accuracy_pct: 90;
            readonly question_bank_version: "R13";
            readonly tier_a_model: "gpt-4o-mini";
            readonly tier_b_model: "claude-sonnet-4-6";
            readonly tier_c_model: "claude-opus-4-7";
            readonly same_submitter: true;
            readonly run_timestamps: {
                readonly tier_a: "2026-04-30T10:00:00Z";
                readonly tier_b: "2026-04-30T14:00:00Z";
                readonly tier_c: "2026-04-30T18:00:00Z";
            };
        };
    };
    readonly expected_pass: true;
}, {
    readonly id: "T6";
    readonly description: "Suspicious-inflation case flagged as warning + surfaces for Founder review";
    readonly args: {
        readonly bounty_id: "test-bounty-t6";
        readonly bounty_class: TierBountyClass;
        readonly receipt_json: {
            readonly cold_accuracy_pct: 20;
            readonly hot_accuracy_pct: 95;
            readonly lift_pp: 75;
            readonly tier_config: "needs";
            readonly ai_model: "claude-haiku-3-5";
            readonly question_bank_version: "R11";
            readonly run_timestamp: "2026-05-01T12:00:00Z";
        };
    };
    readonly expected_pass: true;
    readonly expected_requires_founder_review: true;
}, {
    readonly id: "T7";
    readonly description: "BRIDLE Rule 4: borderline velocity (1.7×, below 2×) defaults to FAIL — anti-marketing-class";
    readonly args: {
        readonly bounty_id: "test-bounty-t7";
        readonly bounty_class: TierBountyClass;
        readonly receipt_json: {
            readonly tier_a_cold_accuracy_pct: 50;
            readonly tier_b_cold_accuracy_pct: 52;
            readonly tier_b_hot_accuracy_pct: 84;
            readonly tier_b_lift_pp: 32;
            readonly tier_a_reference_receipt: "prior-tier-a-receipt-uuid";
            readonly tier_config: "suggests";
            readonly ai_model: "claude-sonnet-4-6";
            readonly reckoning_velocity_ratio: 1.7;
            readonly run_timestamp: "2026-05-01T13:00:00Z";
        };
    };
    readonly expected_pass: false;
    readonly expected_bridle_rule_4_applied: true;
}];
