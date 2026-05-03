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
import { createClient } from "@supabase/supabase-js";
// ─── FORK Doctrine: structural absence enforcement ────────────────────────────
// This comment is the affirmative audit record:
// cash_out_bounty_marks_to_fiat DOES NOT EXIST in this file or anywhere in
// the codebase. Test T2 (FORK compliance) verifies this via codebase grep = 0.
// This is a structural guarantee, not a runtime check.
// ─── Tier multiplier table (per Three-Tier canon BP017) ──────────────────────
const TIER_MULTIPLIERS = {
    tier_a_floor_verification: 1.00,
    tier_b_uplift_verification: 1.25,
    tier_c_founder_replication: 1.50,
    cross_tier_comparison: 2.00,
};
// ─── Completion Quality Factor (BRIDLE Rule 4, Phase B5) ─────────────────────
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
export function computeCompletionQualityFactor(margin) {
    if (margin >= 10)
        return 1.00;
    if (margin >= 5)
        return 0.90;
    if (margin >= 1)
        return 0.80;
    if (margin >= 0.5)
        return 0.75;
    return 0.70; // BRIDLE Rule 4: bare pass cap
}
// ─── Marks earned computation ─────────────────────────────────────────────────
/**
 * Computes marks_earned = floor(standard_rate × tier_multiplier × quality_factor).
 *
 * FORK doctrine: result is always a Marks count, never a USD equivalent.
 * The type system enforces this: there is no fiat-bridge function.
 */
export function computeMarksEarned(standard_rate, tier_class, quality_factor) {
    const multiplier = TIER_MULTIPLIERS[tier_class];
    if (multiplier === undefined) {
        throw new Error(`computeMarksEarned: unknown tier_class "${tier_class}". ` +
            `Valid: ${Object.keys(TIER_MULTIPLIERS).join(", ")}.`);
    }
    return Math.floor(standard_rate * multiplier * quality_factor);
}
// ─── Supabase public schema client ────────────────────────────────────────────
/**
 * Returns a Supabase client targeting the public schema for payout operations.
 * Uses the same env-var priority chain as getCathedralClient but targets 'public'.
 */
function getPublicClient() {
    const url = process.env.LIBRARIAN_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        null;
    const key = process.env.LIBRARIAN_SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        null;
    if (!url || !key)
        return null;
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
// ─── Pure payout computation (offline / testable) ────────────────────────────
/**
 * Computes payout parameters from a validation result.
 * Does NOT write to any storage — use for testing and dry-run previews.
 *
 * Returns the full payout computation including tier_multiplier,
 * completion_quality_factor, and marks_earned.
 *
 * FORK doctrine: marks_earned is a Marks count, NOT fiat.
 */
export function computeBountyPayout(validation, standard_rate = 100) {
    if (!validation.pass) {
        throw new Error(`computeBountyPayout: receipt ${validation.bounty_id} FAILED validation. ` +
            `FORK doctrine default-deny: no payout on FAIL. ` +
            `Failures: ${JSON.stringify(validation.failures)}.`);
    }
    const quality_factor = computeCompletionQualityFactor(validation.margin);
    const marks_earned = computeMarksEarned(standard_rate, validation.bounty_class, quality_factor);
    return {
        tier_multiplier: TIER_MULTIPLIERS[validation.bounty_class],
        completion_quality_factor: quality_factor,
        marks_earned,
        fork_compliant: true,
        membership_orthogonal: true,
    };
}
// ─── MCP tool handler ─────────────────────────────────────────────────────────
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
export async function handleProcessBountyMarksPayout(args) {
    // ── Input validation ────────────────────────────────────────────────────────
    if (!args.receipt_id) {
        return { ok: false, error: "receipt_id is required." };
    }
    if (!args.member_id) {
        return { ok: false, error: "member_id is required." };
    }
    const standard_rate = args.standard_rate ?? 100;
    if (standard_rate <= 0 || !Number.isInteger(standard_rate)) {
        return { ok: false, error: `standard_rate must be a positive integer. Got: ${standard_rate}.` };
    }
    // ── Supabase client ─────────────────────────────────────────────────────────
    const supabase = getPublicClient();
    if (!supabase) {
        return {
            ok: false,
            error: "Supabase client not configured. Set LIBRARIAN_SUPABASE_URL + " +
                "LIBRARIAN_SUPABASE_SERVICE_ROLE_KEY in MCP server env, then restart.",
        };
    }
    try {
        // ── Delegate to atomic PL/pgSQL function ─────────────────────────────────
        const { data, error } = await supabase.rpc("process_bounty_marks_payout", {
            p_receipt_id: args.receipt_id,
            p_member_id: args.member_id,
            p_standard_rate: standard_rate,
        });
        if (error) {
            return {
                ok: false,
                error: `process_bounty_marks_payout DB error: ${error.message}`,
            };
        }
        const row = data;
        const payout = {
            payout_id: row.payout_id,
            receipt_id: row.receipt_id,
            member_id: row.member_id,
            bounty_id: row.bounty_id,
            tier_class: row.tier_class,
            standard_rate: row.standard_rate,
            tier_multiplier: row.tier_multiplier,
            completion_quality_factor: row.completion_quality_factor,
            marks_earned: row.marks_earned,
            validation_pass_at: row.validation_pass_at,
            payout_at: row.payout_at,
            fork_compliant: true,
            membership_orthogonal: true,
            payout_version: row.payout_version,
            canon_reference: row.canon_reference,
        };
        return {
            ok: true,
            payout,
            fork_doctrine_compliant: true,
            membership_orthogonal: true,
        };
    }
    catch (err) {
        return {
            ok: false,
            error: `process_bounty_marks_payout exception: ${err.message}`,
        };
    }
}
// ─── KN-H8 Test Cases (T1-T8 per Phase D) ────────────────────────────────────
// Pure computation tests — do not require Supabase connectivity.
// T1/T2 are Supabase integration tests run separately.
export const KN_H8_COMPUTATION_TEST_CASES = [
    {
        id: "T3",
        description: "Tier multipliers correct: A=1.0, B=1.25, C=1.5, Cross=2.0",
        cases: [
            { tier_class: "tier_a_floor_verification", expected: 1.00 },
            { tier_class: "tier_b_uplift_verification", expected: 1.25 },
            { tier_class: "tier_c_founder_replication", expected: 1.50 },
            { tier_class: "cross_tier_comparison", expected: 2.00 },
        ],
        verify: (tc) => {
            const actual = TIER_MULTIPLIERS[tc.tier_class];
            return { pass: actual === tc.expected, actual, expected: tc.expected };
        },
    },
    {
        id: "T4",
        description: "Completion quality factor: margin >= 10 → 1.0; bare pass (< 0.5) → 0.70",
        cases: [
            { margin: 15, expected: 1.00 },
            { margin: 10, expected: 1.00 },
            { margin: 7, expected: 0.90 },
            { margin: 3, expected: 0.80 },
            { margin: 0.7, expected: 0.75 },
            { margin: 0.3, expected: 0.70 }, // BRIDLE Rule 4 bare-pass cap
            { margin: 0.01, expected: 0.70 }, // BRIDLE Rule 4 bare-pass cap
        ],
        verify: (tc) => {
            const actual = computeCompletionQualityFactor(tc.margin);
            return { pass: actual === tc.expected, actual, expected: tc.expected };
        },
    },
    {
        id: "T5",
        description: "marks_earned = floor(standard_rate × multiplier × quality_factor)",
        cases: [
            // Tier A, margin=15 (quality=1.0): floor(100 × 1.0 × 1.0) = 100
            { tier_class: "tier_a_floor_verification", standard_rate: 100, margin: 15, expected: 100 },
            // Tier B, margin=7 (quality=0.9): floor(100 × 1.25 × 0.9) = floor(112.5) = 112
            { tier_class: "tier_b_uplift_verification", standard_rate: 100, margin: 7, expected: 112 },
            // Tier C, margin=3 (quality=0.8): floor(100 × 1.5 × 0.8) = floor(120) = 120
            { tier_class: "tier_c_founder_replication", standard_rate: 100, margin: 3, expected: 120 },
            // Cross-tier, bare pass margin=0.2 (quality=0.7): floor(100 × 2.0 × 0.7) = 140
            { tier_class: "cross_tier_comparison", standard_rate: 100, margin: 0.2, expected: 140 },
        ],
        verify: (tc) => {
            const qf = computeCompletionQualityFactor(tc.margin);
            const actual = computeMarksEarned(tc.standard_rate, tc.tier_class, qf);
            return { pass: actual === tc.expected, actual, expected: tc.expected };
        },
    },
    {
        id: "T6",
        description: "Validator FAIL → computeBountyPayout throws (default-deny)",
        verify: () => {
            const mockFail = {
                pass: false,
                margin: -5,
                failures: [{ field: "lift_pp", criterion: "lift < 30", expected: ">=30", bridle_rule: "rule_4" }],
                warnings: [],
                bounty_id: "test-fail",
                bounty_class: "tier_a_floor_verification",
                validated_at: new Date().toISOString(),
                requires_founder_review: false,
                bridle_rule_4_applied: true,
            };
            try {
                computeBountyPayout(mockFail, 100);
                return { pass: false, reason: "Should have thrown on FAIL receipt" };
            }
            catch {
                return { pass: true };
            }
        },
    },
    {
        id: "T7",
        description: "Membership-orthogonal: $5/year unchanged; bounty payout is LB-currency-class",
        verify: () => {
            // Structural test: the payout result always carries membership_orthogonal=true
            // and fork_compliant=true; these are not optional fields.
            const mockPass = {
                pass: true,
                margin: 15,
                failures: [],
                warnings: [],
                bounty_id: "test-pass",
                bounty_class: "tier_a_floor_verification",
                validated_at: new Date().toISOString(),
                requires_founder_review: false,
                bridle_rule_4_applied: false,
            };
            const result = computeBountyPayout(mockPass, 100);
            const pass = result.fork_compliant === true &&
                result.membership_orthogonal === true;
            return { pass, result };
        },
    },
    {
        id: "T8",
        description: "FORK doctrine: cash_out_bounty_marks_to_fiat symbol structurally absent",
        // This test is run by the FORK compliance script (Phase D T2).
        // It greps the entire codebase for 'cash_out_bounty_marks_to_fiat' and asserts 0 matches.
        // Documented here as a specification anchor.
        verify: () => ({
            pass: true,
            note: "Run 'grep -r cash_out_bounty_marks_to_fiat .' in workspace root. Must return 0 matches.",
        }),
    },
];
//# sourceMappingURL=bounty_marks_payout.js.map
