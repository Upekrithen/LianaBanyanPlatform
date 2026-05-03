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
import { readFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const TIER_SPECS = {
    haiku: {
        model: "claude-haiku-4-5",
        cost_per_input_k_usd: 0.0008,
        cost_per_output_k_usd: 0.004,
    },
    sonnet: {
        model: "claude-sonnet-4-6",
        cost_per_input_k_usd: 0.003,
        cost_per_output_k_usd: 0.015,
    },
    opus: {
        model: "claude-opus-4-7",
        cost_per_input_k_usd: 0.015,
        cost_per_output_k_usd: 0.075,
    },
};
// ---------------------------------------------------------------------------
// Config loader (cached)
// ---------------------------------------------------------------------------
let _cachedConfig = null;
export function loadTierConfig() {
    if (_cachedConfig)
        return _cachedConfig;
    const configPath = resolve(__dirname, "..", "conductor", "tier_routing_config.json");
    const raw = readFileSync(configPath, "utf-8");
    _cachedConfig = JSON.parse(raw);
    return _cachedConfig;
}
/** Reset cache (for tests). */
export function resetTierConfigCache() {
    _cachedConfig = null;
}
// ---------------------------------------------------------------------------
// Core routing logic
// ---------------------------------------------------------------------------
/**
 * Classify a substrate operation type to a tier.
 * Uses exact match against config operation lists, with normalized keys.
 * Falls back to "sonnet" for unclassified operation types.
 */
export function classifySubstrateOperation(opType, config) {
    const cfg = config ?? loadTierConfig();
    const normalized = opType.toLowerCase().replace(/[-\s]/g, "_");
    for (const op of cfg.tiers.haiku.operations) {
        if (normalized === op || normalized.includes(op) || op.includes(normalized)) {
            return "haiku";
        }
    }
    for (const op of cfg.tiers.opus.operations) {
        if (normalized === op || normalized.includes(op) || op.includes(normalized)) {
            return "opus";
        }
    }
    return "sonnet";
}
/**
 * Route a substrate operation to the appropriate tier.
 *
 * K525 circuit-breaker composition:
 *   - If circuitBreakerActive and tier would be haiku → demote to sonnet
 *   - If circuitBreakerActive and tier would be sonnet → demote to opus (fail-safe to highest)
 *   This matches K525 Phase A.1 pattern: open breaker excludes vendor from candidate set.
 */
export function routeSubstrate(opType, options = {}) {
    const { circuitBreakerActive = false } = options;
    const cfg = options.config ?? loadTierConfig();
    const tier = classifySubstrateOperation(opType, cfg);
    let effectiveTier = tier;
    let circuitBreakerDemoted = false;
    let rationale = `Tier routing: '${opType}' → ${tier} (${TIER_SPECS[tier].model})`;
    if (circuitBreakerActive) {
        const demotion = cfg.routing_rules.circuit_breaker_demotion;
        if (tier === "haiku") {
            effectiveTier = demotion.haiku_fails_to;
            circuitBreakerDemoted = true;
            rationale = `Tier routing: '${opType}' → ${effectiveTier} (demoted from haiku — circuit breaker active)`;
        }
        else if (tier === "sonnet") {
            effectiveTier = demotion.sonnet_fails_to;
            circuitBreakerDemoted = true;
            rationale = `Tier routing: '${opType}' → ${effectiveTier} (demoted from sonnet — circuit breaker active)`;
        }
    }
    const spec = TIER_SPECS[effectiveTier];
    return {
        operation_type: opType,
        tier: effectiveTier,
        model: spec.model,
        cost_per_input_k_usd: spec.cost_per_input_k_usd,
        cost_per_output_k_usd: spec.cost_per_output_k_usd,
        rationale,
        circuit_breaker_demoted: circuitBreakerDemoted,
        ts: new Date().toISOString(),
    };
}
// ---------------------------------------------------------------------------
// Cost telemetry
// ---------------------------------------------------------------------------
/**
 * Compute per-operation cost record.
 * Counterfactual baseline: all-Sonnet (current system default).
 * L2 local factor: how much cheaper this specific op is vs Sonnet baseline.
 * Note: Opus ops produce l2_local_factor < 1 (more expensive than Sonnet).
 * These are excluded from the aggregate L2 multiplier per KN056 eblet D.6 note.
 */
export function computeCostRecord(decision, inputTokens, outputTokens) {
    const spec = TIER_SPECS[decision.tier];
    const sonnetSpec = TIER_SPECS.sonnet;
    const actualCost = (inputTokens / 1000) * spec.cost_per_input_k_usd +
        (outputTokens / 1000) * spec.cost_per_output_k_usd;
    const counterfactualCost = (inputTokens / 1000) * sonnetSpec.cost_per_input_k_usd +
        (outputTokens / 1000) * sonnetSpec.cost_per_output_k_usd;
    const savedUsd = counterfactualCost - actualCost;
    const l2LocalFactor = counterfactualCost > 0 ? counterfactualCost / actualCost : 1.0;
    return {
        ts: decision.ts,
        operation_type: decision.operation_type,
        tier: decision.tier,
        model: decision.model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        actual_cost_usd: Math.round(actualCost * 1_000_000) / 1_000_000,
        counterfactual_cost_usd: Math.round(counterfactualCost * 1_000_000) / 1_000_000,
        saved_usd: Math.round(savedUsd * 1_000_000) / 1_000_000,
        l2_local_factor: Math.round(l2LocalFactor * 10000) / 10000,
        source: "KN056_tier_routing",
    };
}
/**
 * Compute aggregate L2 multiplier from a batch of cost records.
 * Excludes Opus ops from L2 scope (per KN056 eblet D.6 and b127_l2_anchor note).
 * Opus ops represent new orchestration capability, not Sonnet replacements.
 */
export function computeL2Multiplier(records) {
    const l2Records = records.filter((r) => r.tier !== "opus");
    const opusCount = records.filter((r) => r.tier === "opus").length;
    const totalActual = l2Records.reduce((s, r) => s + r.actual_cost_usd, 0);
    const totalCounterfactual = l2Records.reduce((s, r) => s + r.counterfactual_cost_usd, 0);
    const totalSaved = totalCounterfactual - totalActual;
    const l2Multiplier = totalActual > 0 ? totalCounterfactual / totalActual : 1.0;
    return {
        l2_multiplier: Math.round(l2Multiplier * 10000) / 10000,
        total_actual_usd: Math.round(totalActual * 1_000_000) / 1_000_000,
        total_counterfactual_usd: Math.round(totalCounterfactual * 1_000_000) / 1_000_000,
        total_saved_usd: Math.round(totalSaved * 1_000_000) / 1_000_000,
        haiku_op_count: l2Records.filter((r) => r.tier === "haiku").length,
        sonnet_op_count: l2Records.filter((r) => r.tier === "sonnet").length,
        opus_op_count_excluded: opusCount,
    };
}
/**
 * Compute full B127 compound savings multiplier given L2 measurement.
 * Anchors from KN052 receipt:
 *   L1 = 2.5  (cold multiplier, CONFIRMED KN052)
 *   L3 = 3.94 (context density, K518 anchor, CONFIRMED KN052)
 *   L4 = 1.25 (accuracy rework reduction, PARTIAL KN052)
 */
export function computeB127Compound(l2Multiplier) {
    const L1 = 2.5;
    const L3 = 3.94;
    const L4 = 1.25;
    const compound = L1 * l2Multiplier * L3 * L4;
    const savingsPercent = (1 - 1 / compound) * 100;
    return {
        l1: L1,
        l2: Math.round(l2Multiplier * 10000) / 10000,
        l3: L3,
        l4: L4,
        compound: Math.round(compound * 100) / 100,
        savings_percent: Math.round(savingsPercent * 10) / 10,
    };
}
// ---------------------------------------------------------------------------
// Telemetry log writer (non-fatal, fire-and-forget)
// ---------------------------------------------------------------------------
export function logSubstrateCostRecord(record, overrideLogPath) {
    try {
        const stitchpunksDir = process.env.LIBRARIAN_STITCHPUNKS_DIR
            ? resolve(process.env.LIBRARIAN_STITCHPUNKS_DIR)
            : resolve(__dirname, "..", "stitchpunks", "data");
        const targetPath = overrideLogPath ?? resolve(stitchpunksDir, "substrate_savings_log.jsonl");
        const parentDir = dirname(targetPath);
        if (!existsSync(parentDir))
            mkdirSync(parentDir, { recursive: true });
        appendFileSync(targetPath, JSON.stringify(record) + "\n", "utf-8");
    }
    catch {
        // Non-fatal: telemetry must never crash substrate operations.
    }
}
//# sourceMappingURL=conductor_baton.js.map
