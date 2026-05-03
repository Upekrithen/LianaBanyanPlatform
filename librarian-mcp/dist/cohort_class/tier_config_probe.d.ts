/**
 * Tier-Config Probe — KN-H1 / BP017
 * ===================================
 * Reads and writes a member's LB Frame resource-config tier choice.
 * Called at LB Frame Handshake Phase 1 Discovery (Step 1.3), orthogonally
 * to the cohort-class probe (KN102/Step 1.2).
 *
 * Three tiers (Founder ratification BP017 turn 18):
 *   needs    — Tier A: whatever user has out-of-box; no upgrade required
 *   suggests — Tier B: recommended uplift; documented better experience
 *   founder  — Tier C: Founder-customized; empirical-receipt-source
 *
 * Anti-extraction by structural form: capital alone cannot purchase Tier C.
 * Tier C is self-attested — any user may select it regardless of Claude plan.
 * No fiat-bridge at this layer; plan-tier advisory is informational only.
 *
 * BRIDLE Rule 4: if DB unavailable, returns tier_state='not_chosen' (safe
 * fallback — Handshake surfaces the picker again; does NOT silently proceed).
 */
export type ResourceConfigTier = "needs" | "suggests" | "founder";
export interface TierMetadata {
    plan_requirement?: string;
    plan_recommendation?: string;
    plan_note?: string;
    upgrade_required: boolean;
    anyone_can_run: boolean;
    empirical_note: string;
}
export interface TierConfigResult {
    user_id: string;
    tier: ResourceConfigTier | null;
    tier_chosen_at: string | null;
    tier_state: "chosen" | "not_chosen";
    tier_label: string | null;
    tier_metadata: TierMetadata | null;
    /** True if result is a fallback (DB unavailable or no row) */
    fallback: boolean;
    error?: string;
    /** ISO-8601 timestamp when this probe ran */
    probed_at: string;
}
export interface TierSetResult {
    success: boolean;
    user_id: string;
    tier: ResourceConfigTier | null;
    prev_tier: ResourceConfigTier | null;
    tier_chosen_at: string | null;
    reselection: boolean;
    error?: string;
}
/**
 * Probe a member's current LB Frame resource-config tier.
 * Calls `get_lb_frame_resource_config_tier(member_id)` RPC.
 * Falls back gracefully if DB is unreachable (BRIDLE Rule 4).
 */
export declare function probeTierConfig(memberId: string): Promise<TierConfigResult>;
/**
 * Persists a member's tier selection to `user_preferences`.
 * Calls `set_lb_frame_resource_config_tier(user_id, tier)` RPC.
 * Returns success=false + error on any failure (BRIDLE Rule 8: surface error, don't silently proceed).
 */
export declare function setTierConfig(userId: string, tier: ResourceConfigTier): Promise<TierSetResult>;
/** Tier labels for display in Handshake UI and MCP summaries */
export declare const TIER_DISPLAY: Record<ResourceConfigTier, {
    short: string;
    long: string;
    tagline: string;
}>;
/**
 * One-line summary for brief_me / handshake phase output.
 */
export declare function formatTierSummary(result: TierConfigResult): string;
/**
 * Plan-tier advisory (informational only — does NOT block).
 * Surface if Tier C is chosen but environment indicates a non-Founder plan.
 * Per Three-Tier canon: user sovereignty preserved; advisory is informational.
 */
export declare function buildPlanTierAdvisory(tier: ResourceConfigTier, detectedSurface?: string): string | null;
