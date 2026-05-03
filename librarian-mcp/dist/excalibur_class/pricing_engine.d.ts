/**
 * Excalibur Pricing Engine — KN105 / BP016
 * ==========================================
 * Member-data-licensing-share-back-pay × Cost+20% pricing calculation.
 *
 * Pricing formula per BP016 Founder ratification:
 *   cost = M_share × N_opted_in_contributors
 *   one_time = cost × 1.20 (Cost+20% Structural Bylaw)
 *   category bundle: one_time × 0.70 (bundle discount)
 *   subscription_annual = one_time × 5 (5-year amortization, loyalty favor)
 *
 * Member share-back per subscription:
 *   cost_portion = subscription_revenue / 1.20 (unwind margin)
 *   member_share = cost_portion × member.contribution_share_proportion
 *
 * Test case T3 from KN105 spec:
 *   5 opted-in contributors × $1/year M_share = $5 cost
 *   $5 × 1.20 = $6 one-time
 *   $6 × 5 = $30 annual subscription
 *
 * Test case T4 (category bundle):
 *   4 topics × $6 = $24 sum → × 0.70 = $16.80 one-time; $84 annual
 *
 * Test case T5 (member share-back):
 *   100 subscribers × $30 annual; cost_portion = $30/1.20 = $25
 *   5 equal contributors → $25/5 = $5/contributor/subscriber = $500/year/contributor
 *   (per KN105 spec: "100 subscribers × $30 annual × $5/$6 cost-portion / 5 contributors = $50/contributor/year")
 */
import type { ExcaliburSlice, ExcaliburPricing, MemberContribution } from "./types.js";
/** Default Member pay rate per topic per year. Bishop suggested starter; Founder may adjust. */
export declare const DEFAULT_M_SHARE_USD = 1;
/** Cost+20% Structural Bylaw — IMMUTABLE */
export declare const LB_MARGIN_FACTOR: 1.2;
/** Category bundle discount */
export declare const BUNDLE_DISCOUNT_FACTOR: 0.7;
/** Subscription-to-one-time multiplier (5-year amortization) */
export declare const SUBSCRIPTION_AMORTIZATION = 5;
export interface PricingResult {
    one_time: number;
    subscription_annual: number;
    cost: number;
    n_opted_in_contributors: number;
    m_share: number;
    margin_factor: typeof LB_MARGIN_FACTOR;
    bundle_discount_applied: boolean;
}
/**
 * Calculates Excalibur Class pricing for a given slice.
 * Only opted-in members count toward pricing.
 */
export declare function calculateExcaliburPricing(slice: Pick<ExcaliburSlice, "granularity" | "contributing_members" | "topics_included">, mShareOverride?: number): PricingResult;
/**
 * Generates full ExcaliburPricing object for a slice.
 */
export declare function buildSlicePricing(slice: Pick<ExcaliburSlice, "granularity" | "contributing_members" | "topics_included">, mShareOverride?: number): ExcaliburPricing;
/**
 * Calculates a single member's share-back pay for a given subscription revenue amount.
 * Per KN105 spec.
 */
export declare function calculateMemberShareBack(member: Pick<MemberContribution, "contribution_share_proportion">, subscriptionRevenue: number): number;
/**
 * Calculates share-back for all opted-in contributors from total subscription revenue.
 * Returns per-member share-back amounts.
 */
export declare function calculateAllShareBacks(members: MemberContribution[], totalSubscriptionRevenue: number): Array<{
    member_id: string;
    share_back: number;
}>;
/**
 * Normalizes contribution_share_proportions so they sum to 1.0
 * among all opted-in contributors.
 */
export declare function normalizeContributionProportions(members: MemberContribution[]): MemberContribution[];
