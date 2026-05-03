/**
 * Tier C Cascade Telemetry Compiler — KN-H4 / BP017
 * ====================================================
 * Compiles the BP015→BP017 cascade telemetry from milestone artifacts,
 * canonical_values.yaml, and git log. Documents Founder's config as the
 * empirical-receipt-source for the LB Frame Three-Tier system.
 *
 * Verification strategy (BRIDLE Rule 4 compliant):
 *   1. Crown-Jewel ratifications: read from milestone closeout artifacts (hard sources).
 *      If any count cannot be loaded, surface error — do NOT document inflated claims.
 *   2. K-lineage clean count: read from git log — count commits without --no-verify.
 *      Source explicitly labeled. Conservative floor only.
 *   3. Pods landed: derive from git tag/commit metadata — verify SHAs exist.
 *   4. Architectural patterns: loaded from BP017 cascade spec (4 confirmed).
 *   5. Canonical values: read from canonical_values.yaml (single source of truth).
 *
 * BRIDLE Rule 4 + Rule 5:
 *   - If any count fails to verify, surface ERROR receipt — do NOT silently inflate.
 *   - All velocity/throughput claims labeled with source (milestone-artifact vs spec-basis).
 *   - Exit non-zero if BRIDLE check fails.
 *
 * Usage:
 *   npx ts-node librarian-mcp/src/three_tier/cascade_telemetry_compiler.ts
 *
 * Output:
 *   BISHOP_DROPZONE/14_CanonicalReferences/TIER_C_FOUNDER_BP015_BP017_CASCADE_TELEMETRY_RECEIPT_BP017.json
 *
 * Composes with:
 *   KN-H1 LANDED 82c52fa (Three-Tier installer + UI + MCP tools)
 *   KN-H2 LANDED c75995f (Tier A baseline empirical floor receipt)
 *   KN-H3 LANDED 94cd4c6 (Tier B uplift empirical receipt)
 */
interface CanonicalValues {
    innovation_count: number;
    crown_jewels: number;
    patent_provisionals_filed: number;
    formal_claims_approximate: number;
    production_systems: number;
}
export interface TierCCascadeReceipt {
    schema_version: "1.0";
    generated_at: string;
    tier: "founder";
    tier_label: "Tier C — FOUNDER";
    session_arc: "BP015 → BP016 → BP017";
    receipt_class: "cascade-telemetry-empirical-receipt-source";
    refs: string[];
    canonical_values_at_receipt: CanonicalValues;
    cj_bp015: number;
    cj_bp015_note: string;
    cj_bp016: number;
    cj_bp016_source: string;
    cj_bp017_floor: number;
    cj_bp017_source: string;
    cj_total_floor: number;
    k_lineage_floor: number;
    k_lineage_note: string;
    zero_no_verify_events: boolean;
    pods_landed_count: number;
    pods_landed: Array<{
        pod: string;
        commit: string;
        description: string;
    }>;
    architectural_patterns_recovered: number;
    architectural_patterns_class: string;
    bp015_beans_landed: number;
    bp015_beans_per_min: number;
    bp015_capacity_floor: string;
    bp016_cj_density_note: string;
    tier_a_receipt_verified: boolean;
    tier_b_receipt_verified: boolean;
    empirical_receipt_source_note: string;
    bridle_rule_4_applied: boolean;
    bridle_note: string;
    receipt_path: string;
}
export declare function compileCascadeTelemetry(): TierCCascadeReceipt;
export {};
