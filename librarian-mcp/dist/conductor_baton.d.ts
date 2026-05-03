/**
 * Conductor's Baton — Substrate-Side Tier Router
 * KN056 · BP005 · B127 Layer 2 Deployment
 *
 * Routes substrate operations (Librarian MCP internal substrate calls) to the
 * appropriate Anthropic model tier: Haiku 4.5 / Sonnet 4.6 / Opus 4.7.
 * Based on task taxonomy per Conductor's Baton (#2277) + TS-110 classification.
 *
 * Composites with K525 circuitBreaker + costCap + exponential backoff patterns.
 * All routing decisions logged to substrate_savings_log.jsonl with `tier` field.
 *
 * Augur-Pricing exemption: documentation-class. LB membership $5/year unchanged.
 * Vendor-API spend figures are industry-term, membership-orthogonal.
 *
 * Pre-registration (per #2298 — locked before run):
 *   Hypothesis: routing substrate ops to Haiku 4.5 for factual tasks unlocks L2
 *   of B127 algorithm, pushing compound savings from 12.3× to ≥18× empirically.
 *   Measurement: L2 = total_sonnet_counterfactual / total_actual (Opus-ops excluded).
 *   Success criteria: ≥18× compound + 0 circuit-breaker events + ≤2pp HOT regression.
 */
export type SubstrateTier = "haiku" | "sonnet" | "opus";
export interface TierSpec {
    model: string;
    cost_per_input_k_usd: number;
    cost_per_output_k_usd: number;
}
export declare const TIER_SPECS: Record<SubstrateTier, TierSpec>;
export interface TierRoutingConfig {
    tiers: {
        haiku: {
            model: string;
            cost_per_input_k_usd: number;
            operations: string[];
        };
        sonnet: {
            model: string;
            cost_per_input_k_usd: number;
            operations: string[];
        };
        opus: {
            model: string;
            cost_per_input_k_usd: number;
            operations: string[];
        };
    };
    routing_rules: {
        fallback_tier: SubstrateTier;
        circuit_breaker_demotion: {
            haiku_fails_to: SubstrateTier;
            sonnet_fails_to: SubstrateTier;
        };
    };
}
export interface TierDecision {
    operation_type: string;
    tier: SubstrateTier;
    model: string;
    cost_per_input_k_usd: number;
    cost_per_output_k_usd: number;
    rationale: string;
    circuit_breaker_demoted: boolean;
    ts: string;
}
export interface SubstrateCostRecord {
    ts: string;
    operation_type: string;
    tier: SubstrateTier;
    model: string;
    input_tokens: number;
    output_tokens: number;
    actual_cost_usd: number;
    counterfactual_cost_usd: number;
    saved_usd: number;
    l2_local_factor: number;
    source: "KN056_tier_routing";
}
export declare function loadTierConfig(): TierRoutingConfig;
/** Reset cache (for tests). */
export declare function resetTierConfigCache(): void;
/**
 * Classify a substrate operation type to a tier.
 * Uses exact match against config operation lists, with normalized keys.
 * Falls back to "sonnet" for unclassified operation types.
 */
export declare function classifySubstrateOperation(opType: string, config?: TierRoutingConfig): SubstrateTier;
/**
 * Route a substrate operation to the appropriate tier.
 *
 * K525 circuit-breaker composition:
 *   - If circuitBreakerActive and tier would be haiku → demote to sonnet
 *   - If circuitBreakerActive and tier would be sonnet → demote to opus (fail-safe to highest)
 *   This matches K525 Phase A.1 pattern: open breaker excludes vendor from candidate set.
 */
export declare function routeSubstrate(opType: string, options?: {
    circuitBreakerActive?: boolean;
    config?: TierRoutingConfig;
}): TierDecision;
/**
 * Compute per-operation cost record.
 * Counterfactual baseline: all-Sonnet (current system default).
 * L2 local factor: how much cheaper this specific op is vs Sonnet baseline.
 * Note: Opus ops produce l2_local_factor < 1 (more expensive than Sonnet).
 * These are excluded from the aggregate L2 multiplier per KN056 eblet D.6 note.
 */
export declare function computeCostRecord(decision: TierDecision, inputTokens: number, outputTokens: number): SubstrateCostRecord;
/**
 * Compute aggregate L2 multiplier from a batch of cost records.
 * Excludes Opus ops from L2 scope (per KN056 eblet D.6 and b127_l2_anchor note).
 * Opus ops represent new orchestration capability, not Sonnet replacements.
 */
export declare function computeL2Multiplier(records: SubstrateCostRecord[]): {
    l2_multiplier: number;
    total_actual_usd: number;
    total_counterfactual_usd: number;
    total_saved_usd: number;
    haiku_op_count: number;
    sonnet_op_count: number;
    opus_op_count_excluded: number;
};
/**
 * Compute full B127 compound savings multiplier given L2 measurement.
 * Anchors from KN052 receipt:
 *   L1 = 2.5  (cold multiplier, CONFIRMED KN052)
 *   L3 = 3.94 (context density, K518 anchor, CONFIRMED KN052)
 *   L4 = 1.25 (accuracy rework reduction, PARTIAL KN052)
 */
export declare function computeB127Compound(l2Multiplier: number): {
    l1: number;
    l2: number;
    l3: number;
    l4: number;
    compound: number;
    savings_percent: number;
};
export declare function logSubstrateCostRecord(record: SubstrateCostRecord, overrideLogPath?: string): void;
