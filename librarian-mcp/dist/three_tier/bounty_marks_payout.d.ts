/**
 * Bounty Marks Payout Integration — KN-H8 / BP017
 * ==================================================
 * Wires the Bounty Marks payout to the platform Marks ledger.
 * Triggered by KN-H7 validator PASS results.
 *
 * FORK doctrine compliance (CRITICAL):
 *   - bounty_marks_payout is Marks-class only.
 *   - cash_out_bounty_marks_to_fiat DOES NOT EXIST in this codebase.
 *     This is structural absence (not policy-disabled). The function has
 *     never been written and must never be written.
 *   - Composes with KN105 Excalibur share-back-pay FORK-compliant precedent.
 *
 * Tier multipliers per Three-Tier canon BP017:
 *   - Tier A (needs):     standard_rate × 1.0
 *   - Tier B (suggests):  standard_rate × 1.25
 *   - Tier C (founder):   standard_rate × 1.5  (+ Apiarist Project-cohort uplift per BP016)
 *   - Cross-tier:         standard_rate × 2.0
 *
 * BRIDLE Rule 4 conservative defaults (Phase B5):
 *   - Validator PASS but margin < 0.5pp: completion_quality_factor capped at 0.70
 *   - Validator FAIL: NO payout (default-deny)
 *   - FORK compliance failure: HALT + Founder review (structurally impossible by design)
 *
 * Year of Jubilee ledger semantics (B127 #2308):
 *   - All payouts append-only
 *   - No mutation / no deletion / immutable audit trail
 *   - One payout per receipt (idempotency enforced by unique index on receipt_id)
 *
 * Membership-orthogonal:
 *   - $5/year membership is access-gate; bounty payouts are LB-currency-class
 *   - These are independent systems
 *
 * Composes with:
 *   - KN-H6: bounty_poster_tier_generator.ts (poster + TierBountyClass)
 *   - KN-H7: bounty_receipt_validator.ts (BountyReceiptValidationResult)
 *   - KN105: excalibur_class/share_back_ledger.ts (append-only ledger pattern)
 *   - KN094: Bounty #7 Heartbeat Interval Tuning (existing Bounty system)
 */
import type { TierBountyClass } from "./bounty_poster_tier_scaffold.js";
import type { BountyReceiptValidationResult } from "./bounty_receipt_validator.js";
/**
 * Computes the completion_quality_factor from the validator margin.
 *
 * margin = lift_pp − 30 (positive = above threshold; negative = failing).
 *
 * BRIDLE Rule 4 (Phase B5): bare pass (margin < 0.5pp) is capped at 0.70.
 * This ensures Bounty Marks payouts are empirically anchored, not
 * commercially motivated approximations.
 *
 * Scale:
 *   margin ≥ 10pp:        1.00 (solid pass)
 *   5 ≤ margin < 10pp:    0.90
 *   1 ≤ margin < 5pp:     0.80
 *   0.5 ≤ margin < 1pp:   0.75
 *   0 < margin < 0.5pp:   0.70 (BRIDLE Rule 4 cap — bare pass)
 *   margin ≤ 0:           N/A (validator FAIL → no payout path)
 */
export declare function computeCompletionQualityFactor(margin: number): number;
/**
 * Computes marks_earned = floor(standard_rate × tier_multiplier × quality_factor).
 *
 * FORK doctrine: result is always a Marks count, never a USD equivalent.
 * The type system enforces this: there is no fiat-bridge function.
 */
export declare function computeMarksEarned(standard_rate: number, tier_class: TierBountyClass, quality_factor: number): number;
export interface BountyPayoutLedgerEntry {
    payout_id: string;
    receipt_id: string;
    member_id: string;
    bounty_id: string;
    tier_class: TierBountyClass;
    standard_rate: number;
    tier_multiplier: number;
    completion_quality_factor: number;
    marks_earned: number;
    validation_pass_at: string;
    payout_at: string;
    fork_compliant: true;
    membership_orthogonal: true;
    payout_version: string;
    canon_reference: string;
}
export interface ProcessBountyMarksPayoutArgs {
    /** UUID of the bounty_receipts_validation_log row to pay out */
    receipt_id: string;
    /** UUID of the member receiving the payout (must match receipt.submitted_by) */
    member_id: string;
    /** Base Marks rate before tier multiplier. Defaults to 100 Marks. */
    standard_rate?: number;
}
export interface ProcessBountyMarksPayoutResult {
    ok: boolean;
    payout?: BountyPayoutLedgerEntry;
    /** Set when ok=false */
    error?: string;
    /** FORK compliance attestation — always true when ok=true */
    fork_doctrine_compliant?: boolean;
    /** Membership independence attestation */
    membership_orthogonal?: boolean;
}
/**
 * Computes payout parameters from a validation result.
 * Does NOT write to any storage — use for testing and dry-run previews.
 *
 * Returns the full payout computation including tier_multiplier,
 * completion_quality_factor, and marks_earned.
 *
 * FORK doctrine: marks_earned is a Marks count, NOT fiat.
 */
export declare function computeBountyPayout(validation: BountyReceiptValidationResult, standard_rate?: number): {
    tier_multiplier: number;
    completion_quality_factor: number;
    marks_earned: number;
    fork_compliant: true;
    membership_orthogonal: true;
};
/**
 * MCP tool handler: process_bounty_marks_payout
 *
 * Write-class tool — atomically processes a Bounty Marks payout.
 *
 * Flow:
 *   1. Delegates to Supabase process_bounty_marks_payout() PL/pgSQL function.
 *   2. The function atomically:
 *        a. Verifies pass=true, Founder review clear, not already paid
 *        b. Computes marks_earned (standard_rate × multiplier × quality_factor)
 *        c. INSERTs into bounty_payout_ledger
 *        d. UPDATEs profiles.current_marks_balance += marks_earned
 *        e. INSERTs into backed_marks_ledger (source: bounty_payout, direction: credit)
 *        f. UPDATEs bounty_receipts_validation_log.marks_payout_status = 'paid'
 *   3. Returns the payout ledger entry.
 *
 * FORK doctrine: this function cannot bridge Marks to fiat.
 * cash_out_bounty_marks_to_fiat DOES NOT EXIST in this codebase.
 */
export declare function handleProcessBountyMarksPayout(args: ProcessBountyMarksPayoutArgs): Promise<ProcessBountyMarksPayoutResult>;
export declare const KN_H8_COMPUTATION_TEST_CASES: readonly [{
    readonly id: "T3";
    readonly description: "Tier multipliers correct: A=1.0, B=1.25, C=1.5, Cross=2.0";
    readonly cases: readonly [{
        readonly tier_class: TierBountyClass;
        readonly expected: 1;
    }, {
        readonly tier_class: TierBountyClass;
        readonly expected: 1.25;
    }, {
        readonly tier_class: TierBountyClass;
        readonly expected: 1.5;
    }, {
        readonly tier_class: TierBountyClass;
        readonly expected: 2;
    }];
    readonly verify: (tc: {
        tier_class: TierBountyClass;
        expected: number;
    }) => {
        pass: boolean;
        actual: number;
        expected: number;
    };
}, {
    readonly id: "T4";
    readonly description: "Completion quality factor: margin >= 10 → 1.0; bare pass (< 0.5) → 0.70";
    readonly cases: readonly [{
        readonly margin: 15;
        readonly expected: 1;
    }, {
        readonly margin: 10;
        readonly expected: 1;
    }, {
        readonly margin: 7;
        readonly expected: 0.9;
    }, {
        readonly margin: 3;
        readonly expected: 0.8;
    }, {
        readonly margin: 0.7;
        readonly expected: 0.75;
    }, {
        readonly margin: 0.3;
        readonly expected: 0.7;
    }, {
        readonly margin: 0.01;
        readonly expected: 0.7;
    }];
    readonly verify: (tc: {
        margin: number;
        expected: number;
    }) => {
        pass: boolean;
        actual: number;
        expected: number;
    };
}, {
    readonly id: "T5";
    readonly description: "marks_earned = floor(standard_rate × multiplier × quality_factor)";
    readonly cases: readonly [{
        readonly tier_class: TierBountyClass;
        readonly standard_rate: 100;
        readonly margin: 15;
        readonly expected: 100;
    }, {
        readonly tier_class: TierBountyClass;
        readonly standard_rate: 100;
        readonly margin: 7;
        readonly expected: 112;
    }, {
        readonly tier_class: TierBountyClass;
        readonly standard_rate: 100;
        readonly margin: 3;
        readonly expected: 120;
    }, {
        readonly tier_class: TierBountyClass;
        readonly standard_rate: 100;
        readonly margin: 0.2;
        readonly expected: 140;
    }];
    readonly verify: (tc: {
        tier_class: TierBountyClass;
        standard_rate: number;
        margin: number;
        expected: number;
    }) => {
        pass: boolean;
        actual: number;
        expected: number;
    };
}, {
    readonly id: "T6";
    readonly description: "Validator FAIL → computeBountyPayout throws (default-deny)";
    readonly verify: () => {
        pass: boolean;
        reason: string;
    } | {
        pass: boolean;
        reason?: undefined;
    };
}, {
    readonly id: "T7";
    readonly description: "Membership-orthogonal: $5/year unchanged; bounty payout is LB-currency-class";
    readonly verify: () => {
        pass: boolean;
        result: {
            tier_multiplier: number;
            completion_quality_factor: number;
            marks_earned: number;
            fork_compliant: true;
            membership_orthogonal: true;
        };
    };
}, {
    readonly id: "T8";
    readonly description: "FORK doctrine: cash_out_bounty_marks_to_fiat symbol structurally absent";
    readonly verify: () => {
        pass: boolean;
        note: string;
    };
}];
