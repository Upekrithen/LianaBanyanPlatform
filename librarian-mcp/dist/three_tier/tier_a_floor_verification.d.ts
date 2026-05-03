/**
 * Tier A Floor Verification Harness — KN-H2 / BP017
 * ====================================================
 * Verifies that Cathedral Effect lift holds at Tier A (default-plan) config.
 *
 * Sources empirical data from R10 cross-vendor benchmark results
 * (librarian-mcp/r10_cross_vendor/results/). Calculates HOT-rate and
 * lift-vs-cold-baseline across all vendor pairs. Checks ≥30pp lift target.
 *
 * BRIDLE Rule 4 + Rule 5:
 *   If lift_pp_min < TARGET_LIFT_PP, this process exits non-zero and writes
 *   an ERROR receipt. Do NOT silently document inflated numbers.
 *
 * Usage:
 *   npx ts-node librarian-mcp/src/three_tier/tier_a_floor_verification.ts
 *
 * Output:
 *   BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json
 */
interface VendorPairLift {
    vendor: string;
    model: string;
    cold_accuracy_pct: number;
    hot_accuracy_pct: number;
    lift_pp: number;
    meets_target: boolean;
}
export interface TierAFloorReceipt {
    schema_version: "1.0";
    generated_at: string;
    tier: "needs";
    tier_label: "Tier A — NEEDS";
    benchmark: string;
    benchmark_run: string;
    refs: string[];
    n_vendor_pairs: number;
    vendor_pairs: VendorPairLift[];
    cold_accuracy_pct_min: number;
    cold_accuracy_pct_max: number;
    hot_accuracy_pct_min: number;
    hot_accuracy_pct_max: number;
    lift_pp_min: number;
    lift_pp_max: number;
    lift_pp_mean: number;
    target_lift_pp: number;
    empirical_floor_pass: boolean;
    empirical_floor_note: string;
    bridle_rule_4_applied: boolean;
    receipt_path: string;
}
export declare function runTierAFloorVerification(): TierAFloorReceipt;
export {};
