/**
 * Bounty Poster Tier Scaffold — KN-H5 / BP017 Three-Tier Sovereignty
 * ====================================================================
 * Pod-H #5 of 5 — scaffold only. Full Bounty Poster Tier-testing integration
 * is Pod-H KN-H6/H7/H8 scope (per Three-Tier canon Bounty Poster addendum).
 *
 * Four Bounty classes per Three-Tier canon BP017 turn 19 addendum:
 *
 *   A. Tier A NEEDS empirical floor verification    → Marks pay-rate × 1.0 (baseline)
 *   B. Tier B SUGGESTS uplift verification          → Marks × 1.25
 *   C. Tier C FOUNDER empirical-receipt-source      → Marks × 1.5  (Project-cohort uplift)
 *   D. Cross-tier comparison receipt                → Marks × 2.0
 *
 * MCP tool: get_lb_frame_tier_bounty_pay_rate
 *   Returns BountyPayRateResult for a given tier Bounty class.
 *   Called by KN-H6+ to hydrate Bounty Poster renders.
 *
 * Cross-reference: bounties/KN094-BP011 Bounty #7 Heartbeat Interval Tuning
 *   precedent (tag: 595b7b4). This scaffold extends the existing Bounty system
 *   for tier-specific empirical-verification tasks.
 *
 * Anti-extraction by structural form:
 *   Bounty classes measure empirical uplift — not gatekeeping. Any member at
 *   any tier can participate in any Bounty class (canonical rule: capital is
 *   not the gate; contribution is).
 */
export type ResourceConfigTier = "needs" | "suggests" | "founder";
export type TierBountyClass = "tier_a_floor_verification" | "tier_b_uplift_verification" | "tier_c_founder_replication" | "cross_tier_comparison";
export interface BountyPayRateMeta {
    bounty_class: TierBountyClass;
    tier_label: string;
    tier_id: ResourceConfigTier | "cross_tier";
    marks_multiplier: number;
    uplift_class: "baseline" | "recommended" | "maximum" | "cross_tier";
    description: string;
    poster_headline: string;
    poster_subhead: string;
    empirical_anchor: string;
    notes: string;
}
export declare const TIER_BOUNTY_PAY_RATES: Record<TierBountyClass, BountyPayRateMeta>;
/**
 * Returns pay-rate metadata for a given tier Bounty class.
 * Called by MCP tool get_lb_frame_tier_bounty_pay_rate.
 * BRIDLE Rule 4: throws on unknown class — caller must handle.
 */
export declare function getBountyPayRateByClass(bountyClass: TierBountyClass): BountyPayRateMeta;
/**
 * Returns pay-rate metadata for a given tier (primary class for that tier).
 * Maps: needs→tier_a_floor_verification, suggests→tier_b_uplift_verification, founder→tier_c_founder_replication.
 * Cross-tier has no tier mapping — use getBountyPayRateByClass("cross_tier_comparison") directly.
 */
export declare function getPrimaryBountyPayRateForTier(tier: ResourceConfigTier): BountyPayRateMeta;
/**
 * Returns all four Bounty pay-rate definitions as an ordered array.
 * Used by KN-H6 Bounty Poster renderer to display the full tier-test menu.
 */
export declare function getAllTierBountyPayRates(): BountyPayRateMeta[];
export interface GetTierBountyPayRateArgs {
    bounty_class?: TierBountyClass;
    tier?: ResourceConfigTier;
    list_all?: boolean;
}
export interface GetTierBountyPayRateResult {
    ok: boolean;
    bounty_class?: TierBountyClass;
    tier?: string;
    marks_multiplier?: number;
    meta?: BountyPayRateMeta;
    all_classes?: BountyPayRateMeta[];
    error?: string;
}
/**
 * MCP tool handler: get_lb_frame_tier_bounty_pay_rate
 * Returns Bounty pay-rate metadata for a tier Bounty class.
 * Three modes:
 *   1. bounty_class: exact class lookup
 *   2. tier: primary class for that tier
 *   3. list_all: all four classes
 */
export declare function handleGetTierBountyPayRate(args: GetTierBountyPayRateArgs): GetTierBountyPayRateResult;
