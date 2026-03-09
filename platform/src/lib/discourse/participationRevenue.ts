/**
 * PARTICIPATION REVENUE — Attention-as-Funding System
 * =====================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 10
 * Innovation: "Reading for a cause, paying attention for a PURPOSE
 *              that ACCOMPLISHES by FUNDING THOSE PURPOSES."
 *
 * The Attention-as-Funding model transforms passive participation into
 * active cause-directed funding:
 *
 *   1. Members PARTICIPATE: read articles, listen at Round Tables,
 *      vote on petitions, engage with content
 *   2. Participation generates AGGREGATED GRASSROOTS DATA — no demographics,
 *      no individual records, just proven engagement intensity
 *   3. That data has MARKET VALUE: political trend analysis, cultural
 *      movement tracking, grassroots sentiment data — all backed by
 *      an immutable ledger proving real effort-gated engagement
 *   4. Data products are sold to anyone with Credits (transparent marketplace)
 *   5. Revenue flows to a PARTICIPATION REVENUE POOL
 *   6. Each member's proportional share is calculated from their participation
 *   7. The member DIRECTS their share to causes, initiatives, campaigns,
 *      or petitions they support
 *   8. Members NEVER receive cash or Credits back — allocation goes
 *      directly to the cause (SEC-safe, not a financial return)
 *
 * WHY THIS IS DIFFERENT:
 *   - Advertising model: Your attention funds advertisers' goals
 *   - Subscription model: Your money funds creators' goals
 *   - LB Attention-as-Funding: Your attention funds YOUR goals
 *
 * PRIVACY ARCHITECTURE:
 *   - Individual participation records = ENCRYPTED in immutable ledger
 *   - Data products = AGGREGATED (minimum 100 participants per data point)
 *   - Buyers get statistical intelligence, NEVER individual records
 *   - Merkle tree proves data integrity without exposing leaf nodes
 *
 * SEC-SAFE BY DESIGN:
 *   - Members don't receive financial benefits or payouts
 *   - Allocation is cause-directed, not member-directed wealth
 *   - Analogous to United Way workplace giving, not securities
 *   - Credits are closed-loop (no cash-out)
 *   - Data sale is a platform service, not a securities offering
 */

// ── Constants ──────────────────────────────────────────────────────────────

/** Minimum participants per data point to prevent de-anonymization */
export const MIN_AGGREGATION_THRESHOLD = 100;

/** Platform operating cost share of data revenue (Cost + 20%) */
export const PLATFORM_REVENUE_SHARE = 0.20;

/** Member-directed allocation share (remainder after platform costs) */
export const MEMBER_ALLOCATION_SHARE = 0.80;

/** Minimum data product price (Credits) */
export const MIN_DATA_PRODUCT_PRICE = 100;

/** Data product refresh interval (days) — how often trend data updates */
export const DATA_REFRESH_INTERVAL_DAYS = 7;

/** Allocation direction window (days) — members have this long to direct their share */
export const ALLOCATION_DIRECTION_WINDOW_DAYS = 30;

/** Default allocation if member doesn't direct within window */
export const DEFAULT_ALLOCATION_TARGET = "platform_general_fund";

// ── Types ──────────────────────────────────────────────────────────────────

/** Categories of participation that generate data value */
export type ParticipationCategory =
  | "reading"           // reading articles (Coverage Minutes earned)
  | "listening"         // listening at Round Tables (Coverage Minutes earned)
  | "petition_voting"   // voting on petitions/referendums (Marks spent)
  | "pedestal_funding"  // funding Pedestals (Credits contributed)
  | "discourse"         // speaking at Round Tables (Coverage Minutes spent)
  | "content_creation"; // publishing content (Coverage Minutes spent)

/** Data product types available for purchase */
export type DataProductType =
  | "petition_trend_report"        // aggregate vote counts, tier distribution, temporal trends
  | "grassroots_intensity_index"   // topic-level engagement scores, movement momentum
  | "cultural_engagement_report"   // most-read topics, reading engagement depth by category
  | "subscriber_ecosystem_report"  // creator support patterns, retention rates, seasonal trends
  | "movement_comparison_report"   // cross-petition momentum comparison
  | "longitudinal_trend_report";   // multi-year trend analysis (premium)

/** Where members can direct their participation revenue share */
export type AllocationTargetType =
  | "initiative"          // one of the 16 Sweet Sixteen initiatives
  | "petition_action"     // funding outcomes of a petition they voted on
  | "campaign_support"    // civic/political campaign support
  | "community_project"   // community-level project
  | "platform_general_fund"; // default: platform reinvestment

/** Data product time ranges */
export type DataProductTimeRange =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "longitudinal"; // multi-year

// ── Interfaces ─────────────────────────────────────────────────────────────

/**
 * Data Product — what's available for purchase.
 * Contains ONLY aggregated, anonymized data.
 * Individual records are NEVER included.
 */
export interface DataProduct {
  /** Product ID */
  id: string;
  /** Product type */
  productType: DataProductType;
  /** Human-readable title */
  title: string;
  /** Description of what's included */
  description: string;
  /** Time range covered */
  timeRange: DataProductTimeRange;
  /** Period start date */
  periodStart: string;
  /** Period end date */
  periodEnd: string;
  /** Price in Credits */
  priceCredits: number;
  /** Number of unique participants whose data is aggregated */
  participantCount: number;
  /** Whether aggregation threshold is met (must be >= MIN_AGGREGATION_THRESHOLD) */
  meetsPrivacyThreshold: boolean;
  /** Categories of participation data included */
  categoriesIncluded: ParticipationCategory[];
  /** Topics/petitions covered (for topic-specific reports) */
  topicIds?: string[];
  /** Last refresh date */
  lastRefreshedAt: string;
  /** Whether the product is currently available for purchase */
  isAvailable: boolean;
  /** Total purchases of this product */
  totalPurchases: number;
  /** Total revenue generated (Credits) */
  totalRevenue: number;
  /** Created at */
  createdAt: string;
}

/**
 * Participation contribution record — tracks a member's
 * participation for revenue share calculation.
 * This is an INTERNAL record, never exposed to data buyers.
 */
export interface ParticipationContribution {
  /** Contribution ID */
  id: string;
  /** Member ID */
  memberId: string;
  /** Category of participation */
  category: ParticipationCategory;
  /** Quantified contribution (minutes read, minutes listened, Marks spent, etc.) */
  quantifiedAmount: number;
  /** Unit of measurement */
  unit: "coverage_minutes" | "marks" | "credits";
  /** Topic or petition ID this contribution relates to */
  topicId?: string;
  /** Revenue period this contribution falls in */
  revenuePeriod: string; // YYYY-MM format
  /** Timestamp */
  contributedAt: string;
  /** Whether this has been included in a revenue share calculation */
  isProcessed: boolean;
}

/**
 * Revenue Period — aggregated revenue for a time period.
 * Platform takes its operating share; remainder goes to member allocation pool.
 */
export interface RevenuePeriod {
  /** Period ID */
  id: string;
  /** Period identifier (YYYY-MM) */
  period: string;
  /** Total data product revenue in this period (Credits) */
  totalRevenue: number;
  /** Platform operating share (Credits) */
  platformShare: number;
  /** Member allocation pool (Credits) */
  allocationPool: number;
  /** Total participation contributions in this period */
  totalContributions: number;
  /** Unique contributing members */
  uniqueContributors: number;
  /** Whether allocations have been finalized */
  isFinalized: boolean;
  /** Allocation deadline */
  allocationDeadline: string;
  /** Created at */
  createdAt: string;
}

/**
 * Member Revenue Share — a member's proportional share
 * of the allocation pool for a revenue period.
 */
export interface MemberRevenueShare {
  /** Share ID */
  id: string;
  /** Member ID */
  memberId: string;
  /** Revenue period */
  revenuePeriod: string;
  /** Member's total participation score for this period */
  participationScore: number;
  /** Share of allocation pool (Credits) */
  shareAmount: number;
  /** Percentage of total pool */
  sharePercent: number;
  /** Where the member directed their share */
  allocations: AllocationDirective[];
  /** Whether the member has finalized their allocation direction */
  isDirected: boolean;
  /** Deadline for directing allocation */
  directionDeadline: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

/**
 * Allocation Directive — how a member directs their revenue share.
 * A member can split their share across multiple targets.
 */
export interface AllocationDirective {
  /** Directive ID */
  id: string;
  /** Target type */
  targetType: AllocationTargetType;
  /** Target ID (initiative ID, petition ID, campaign ID, etc.) */
  targetId: string;
  /** Target display name */
  targetName: string;
  /** Percentage of share directed here (all directives must sum to 100) */
  percentOfShare: number;
  /** Credits allocated */
  creditsAllocated: number;
}

/**
 * Data Product Purchase — record of a buyer purchasing a data product.
 */
export interface DataProductPurchase {
  /** Purchase ID */
  id: string;
  /** Data product ID */
  productId: string;
  /** Buyer member ID */
  buyerMemberId: string;
  /** Price paid (Credits) */
  pricePaid: number;
  /** Purchase timestamp */
  purchasedAt: string;
  /** Idempotency key */
  idempotencyKey: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

/**
 * Allocation Summary — shown to each member on their dashboard.
 * "Your participation this quarter generated X Credits in data value,
 *  directed to [cause]."
 */
export interface AllocationSummary {
  /** Member ID */
  memberId: string;
  /** Revenue period */
  revenuePeriod: string;
  /** Total participation across all categories */
  totalParticipation: Record<ParticipationCategory, number>;
  /** Revenue share amount (Credits) */
  shareAmount: number;
  /** Where the share was directed */
  allocations: Array<{
    targetName: string;
    targetType: AllocationTargetType;
    amount: number;
    percentOfShare: number;
  }>;
  /** Cumulative lifetime participation value */
  lifetimeTotalDirected: number;
  /** Participation rank (percentile among all members) */
  participationPercentile: number;
}

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Calculate a member's participation score for a revenue period.
 * Different categories contribute differently:
 *   - Reading/Listening: 1 point per Coverage Minute earned
 *   - Petition voting: 5 points per Mark spent (higher weight — voting costs real effort)
 *   - Discourse: 2 points per Coverage Minute spent speaking
 *   - Content creation: 3 points per Coverage Minute spent publishing
 *   - Pedestal funding: 1 point per Credit contributed
 */
export const PARTICIPATION_WEIGHTS: Record<ParticipationCategory, number> = {
  reading: 1,
  listening: 1,
  petition_voting: 5,
  pedestal_funding: 1,
  discourse: 2,
  content_creation: 3,
};

export function calculateParticipationScore(
  contributions: ParticipationContribution[],
): number {
  return contributions.reduce((score, c) => {
    const weight = PARTICIPATION_WEIGHTS[c.category] ?? 1;
    return score + (c.quantifiedAmount * weight);
  }, 0);
}

/**
 * Calculate the revenue split for a period.
 * Platform gets PLATFORM_REVENUE_SHARE (20%), members get the rest (80%).
 */
export function calculateRevenueSplit(totalRevenue: number): {
  platformShare: number;
  allocationPool: number;
} {
  const platformShare = Math.ceil(totalRevenue * PLATFORM_REVENUE_SHARE);
  const allocationPool = totalRevenue - platformShare;
  return { platformShare, allocationPool };
}

/**
 * Calculate a member's share of the allocation pool.
 */
export function calculateMemberShare(
  memberScore: number,
  totalPoolScore: number,
  allocationPool: number,
): { shareAmount: number; sharePercent: number } {
  if (totalPoolScore <= 0) {
    return { shareAmount: 0, sharePercent: 0 };
  }

  const sharePercent = (memberScore / totalPoolScore) * 100;
  const shareAmount = Math.floor((memberScore / totalPoolScore) * allocationPool);

  return {
    shareAmount,
    sharePercent: Math.round(sharePercent * 100) / 100,
  };
}

/**
 * Validate allocation directives — they must sum to exactly 100%.
 */
export function validateAllocationDirectives(
  directives: AllocationDirective[],
): { valid: boolean; reason?: string } {
  if (directives.length === 0) {
    return { valid: false, reason: "At least one allocation directive required." };
  }

  const totalPercent = directives.reduce((sum, d) => sum + d.percentOfShare, 0);
  if (Math.abs(totalPercent - 100) > 0.01) {
    return {
      valid: false,
      reason: `Allocation percentages must sum to 100%. Currently: ${totalPercent}%.`,
    };
  }

  for (const d of directives) {
    if (d.percentOfShare <= 0) {
      return { valid: false, reason: `Allocation to "${d.targetName}" must be positive.` };
    }
  }

  return { valid: true };
}

/**
 * Check whether a data product meets privacy thresholds.
 * Products with fewer than MIN_AGGREGATION_THRESHOLD participants
 * cannot be sold — they risk de-anonymization.
 */
export function meetsPrivacyThreshold(participantCount: number): boolean {
  return participantCount >= MIN_AGGREGATION_THRESHOLD;
}

/**
 * Create a new data product listing.
 */
export function createDataProduct(
  productType: DataProductType,
  title: string,
  description: string,
  timeRange: DataProductTimeRange,
  periodStart: string,
  periodEnd: string,
  priceCredits: number,
  participantCount: number,
  categoriesIncluded: ParticipationCategory[],
  topicIds?: string[],
): DataProduct {
  const now = new Date().toISOString();
  return {
    id: `dp-${productType}-${Date.now()}`,
    productType,
    title,
    description,
    timeRange,
    periodStart,
    periodEnd,
    priceCredits: Math.max(priceCredits, MIN_DATA_PRODUCT_PRICE),
    participantCount,
    meetsPrivacyThreshold: meetsPrivacyThreshold(participantCount),
    categoriesIncluded,
    topicIds,
    lastRefreshedAt: now,
    isAvailable: meetsPrivacyThreshold(participantCount),
    totalPurchases: 0,
    totalRevenue: 0,
    createdAt: now,
  };
}

/**
 * Create a revenue period for allocation processing.
 */
export function createRevenuePeriod(
  period: string,
  totalRevenue: number,
  totalContributions: number,
  uniqueContributors: number,
): RevenuePeriod {
  const split = calculateRevenueSplit(totalRevenue);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + ALLOCATION_DIRECTION_WINDOW_DAYS);

  return {
    id: `rp-${period}-${Date.now()}`,
    period,
    totalRevenue,
    platformShare: split.platformShare,
    allocationPool: split.allocationPool,
    totalContributions,
    uniqueContributors,
    isFinalized: false,
    allocationDeadline: deadline.toISOString(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get a summary of available data products by type.
 */
export function getDataProductSummary(products: DataProduct[]): {
  total: number;
  available: number;
  belowPrivacyThreshold: number;
  byType: Record<DataProductType, number>;
  totalRevenue: number;
} {
  const available = products.filter(p => p.isAvailable).length;
  const belowThreshold = products.filter(p => !p.meetsPrivacyThreshold).length;
  const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);

  const byType = {} as Record<DataProductType, number>;
  for (const p of products) {
    byType[p.productType] = (byType[p.productType] ?? 0) + 1;
  }

  return { total: products.length, available, belowPrivacyThreshold: belowThreshold, byType, totalRevenue };
}
