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

// ─── Constants ────────────────────────────────────────────────────────────

/** Default Member pay rate per topic per year. Bishop suggested starter; Founder may adjust. */
export const DEFAULT_M_SHARE_USD = 1.00;

/** Cost+20% Structural Bylaw — IMMUTABLE */
export const LB_MARGIN_FACTOR = 1.20 as const;

/** Category bundle discount */
export const BUNDLE_DISCOUNT_FACTOR = 0.70 as const;

/** Subscription-to-one-time multiplier (5-year amortization) */
export const SUBSCRIPTION_AMORTIZATION = 5;

// ─── Pricing Calculation ──────────────────────────────────────────────────

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
export function calculateExcaliburPricing(
  slice: Pick<ExcaliburSlice, "granularity" | "contributing_members" | "topics_included">,
  mShareOverride?: number,
): PricingResult {
  const mShare = mShareOverride ?? DEFAULT_M_SHARE_USD;
  const contributors = slice.contributing_members.filter(m => m.opt_in_status === "opted_in");
  const n = contributors.length;
  const cost = mShare * n;

  let oneTime = cost * LB_MARGIN_FACTOR;
  const bundleDiscount = slice.granularity === "category";
  if (bundleDiscount) {
    oneTime = oneTime * BUNDLE_DISCOUNT_FACTOR;
  }

  const subscriptionAnnual = oneTime * SUBSCRIPTION_AMORTIZATION;

  return {
    one_time: Math.round(oneTime * 100) / 100,
    subscription_annual: Math.round(subscriptionAnnual * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    n_opted_in_contributors: n,
    m_share: mShare,
    margin_factor: LB_MARGIN_FACTOR,
    bundle_discount_applied: bundleDiscount,
  };
}

/**
 * Generates full ExcaliburPricing object for a slice.
 */
export function buildSlicePricing(
  slice: Pick<ExcaliburSlice, "granularity" | "contributing_members" | "topics_included">,
  mShareOverride?: number,
): ExcaliburPricing {
  const result = calculateExcaliburPricing(slice, mShareOverride);
  const contributors = slice.contributing_members.filter(m => m.opt_in_status === "opted_in");
  const n = contributors.length;

  return {
    one_time_payment: result.one_time,
    subscription_annual: result.subscription_annual,
    cost_anchor: {
      member_pay_rate: result.m_share,
      n_contributors: n,
      lb_margin_factor: LB_MARGIN_FACTOR,
      ...(slice.granularity === "category" ? { bundle_discount_factor: BUNDLE_DISCOUNT_FACTOR } : {}),
    },
  };
}

// ─── Member Share-Back Calculation ────────────────────────────────────────

/**
 * Calculates a single member's share-back pay for a given subscription revenue amount.
 * Per KN105 spec.
 */
export function calculateMemberShareBack(
  member: Pick<MemberContribution, "contribution_share_proportion">,
  subscriptionRevenue: number,
): number {
  // Unwind the 20% margin to get the cost portion
  const costPortion = subscriptionRevenue / LB_MARGIN_FACTOR;
  const memberShare = costPortion * member.contribution_share_proportion;
  return Math.round(memberShare * 100) / 100;
}

/**
 * Calculates share-back for all opted-in contributors from total subscription revenue.
 * Returns per-member share-back amounts.
 */
export function calculateAllShareBacks(
  members: MemberContribution[],
  totalSubscriptionRevenue: number,
): Array<{ member_id: string; share_back: number }> {
  const optedIn = members.filter(m => m.opt_in_status === "opted_in");
  return optedIn.map(m => ({
    member_id: m.member_id,
    share_back: calculateMemberShareBack(m, totalSubscriptionRevenue),
  }));
}

/**
 * Normalizes contribution_share_proportions so they sum to 1.0
 * among all opted-in contributors.
 */
export function normalizeContributionProportions(members: MemberContribution[]): MemberContribution[] {
  const optedIn = members.filter(m => m.opt_in_status === "opted_in");
  const totalWeight = optedIn.reduce((s, m) => s + m.contribution_share_proportion, 0);
  if (totalWeight === 0) return members;

  return members.map(m => {
    if (m.opt_in_status !== "opted_in") return m;
    return {
      ...m,
      contribution_share_proportion: m.contribution_share_proportion / totalWeight,
    };
  });
}
