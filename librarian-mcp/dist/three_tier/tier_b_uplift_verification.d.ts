/**
 * Tier B Uplift Verification Harness — KN-H3 / BP017
 * ====================================================
 * Verifies that Tier B SUGGESTS documented uplift targets hold vs Tier A NEEDS baseline.
 *
 * Verification strategy (BRIDLE Rule 4 compliant):
 *   1. HOT-rate: Load Tier A empirical floor receipt. Run same N hard-retrieval queries
 *      at Tier B substrate config. Tier B HOT-rate must be ≥ Tier A floor (retrieval
 *      quality is substrate-dependent, not plan-dependent; Fluid Cathedral may improve
 *      HOT-rate in fast-evolving domains — it cannot reduce it).
 *   2. Reckoning velocity: Verified against BP017 canon spec (architectural basis:
 *      higher token budget + message-rate limits → less context truncation + fewer
 *      rate-limit pauses → 2-3× Tier A velocity). Source labeled "bp017-spec" to
 *      clearly distinguish from live-benchmark measurement.
 *   3. Pod scaffolding rate: Verified against BP017 canon spec (~30 min per K-prompt
 *      vs ~60 min at Tier A). Source labeled "bp017-spec".
 *
 * BRIDLE Rule 4 + Rule 5:
 *   - If HOT-rate at Tier B < Tier A floor, this process exits non-zero (FAIL receipt).
 *   - If Reckoning velocity spec target is undocumented, surface error + exit non-zero.
 *   - Do NOT silently document inflated uplift numbers. Velocity source is always stated.
 *
 * Usage:
 *   npx ts-node librarian-mcp/src/three_tier/tier_b_uplift_verification.ts
 *
 * Output:
 *   BISHOP_DROPZONE/14_CanonicalReferences/TIER_B_EMPIRICAL_UPLIFT_RECEIPT_BP017.json
 *
 * Composes with:
 *   KN-H2 LANDED — Tier A baseline at BISHOP_DROPZONE/14_CanonicalReferences/TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json
 *   KN102+KN103 LANDED 42ad0c3 — Pied Piper Tier 1+ Fluid Cathedral fingerprint
 *   KN104 PRE-COLOSSUS LANDED 5e7f540 — Detective TEAM full access at Tier B
 */
export interface TierBUpliftVerification {
    vendor: string;
    model: string;
    tier_a_hot_accuracy_pct: number;
    tier_b_hot_accuracy_pct: number;
    hot_rate_maintained: boolean;
    hot_rate_delta_pp: number;
}
export interface TierBUpliftReceipt {
    schema_version: "1.1";
    generated_at: string;
    tier: "suggests";
    tier_label: "Tier B — SUGGESTS";
    baseline_tier: "needs";
    baseline_tier_label: "Tier A — NEEDS";
    baseline_receipt_pointer: string;
    baseline_generated_at: string;
    /** Benchmark used for HOT-rate comparison (same as Tier A baseline) */
    benchmark: string;
    benchmark_run: string;
    refs: string[];
    /** HOT-rate verification — Tier B vs Tier A baseline (substrate quality maintained) */
    n_vendor_pairs: number;
    vendor_verifications: TierBUpliftVerification[];
    tier_a_hot_rate_min_pct: number;
    tier_a_hot_rate_max_pct: number;
    tier_b_hot_rate_min_pct: number;
    tier_b_hot_rate_max_pct: number;
    hot_rate_maintained: boolean;
    hot_rate_note: string;
    /** Reckoning velocity uplift (BP017 canon spec — architectural basis) */
    reckoning_velocity_uplift_min_x: number;
    reckoning_velocity_uplift_target_x: number;
    reckoning_velocity_uplift_max_x: number;
    reckoning_velocity_description: string;
    reckoning_velocity_source: "bp017-spec";
    reckoning_velocity_meets_target: boolean;
    /** Pod scaffolding rate uplift (BP017 canon spec — architectural basis) */
    pod_scaffolding_uplift_min_x: number;
    pod_scaffolding_tier_a_rate: string;
    pod_scaffolding_tier_b_rate: string;
    pod_scaffolding_source: "bp017-spec";
    pod_scaffolding_meets_target: boolean;
    /** Fluid Cathedral HOT-rate between rebuilds */
    cathedral_hot_between_rebuilds_pct_range: string;
    cathedral_fingerprint_tier_b: "fluid (event-driven; Cue Card 7-day recency gate)";
    cathedral_fingerprint_tier_a: "brittle (cron-class; npm run rebuild)";
    /** Overall PASS/FAIL */
    uplift_pass: boolean;
    uplift_note: string;
    bridle_rule_4_applied: boolean;
    receipt_path: string;
}
export declare function runTierBUpliftVerification(): TierBUpliftReceipt;
