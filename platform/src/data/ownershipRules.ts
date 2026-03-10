// Participation Rules — LEVIATHAN IP Load Balancing (#1228-1231)
// 60/20/20 split: Platform / Global Sponsor Pool / Founder
// NOTE: Export names kept as "ownership" for backward compatibility across 17+ consumers.
// User-facing text always uses "participation" / "membership" per SEC guidelines.

export const ownershipRules = {
  // Founder always retains 20%
  founderRetention: 0.20,

  // Maximum transferable to backers is 40%
  maxTransferable: 0.40,

  // Platform retains minimum 40% (60% of non-founder portion)
  platformRetentionMin: 0.40,

  // Per-person cap in Credits
  perPersonCapCredits: 5_000,

  // Maximum service value per stake (from #1230)
  stakeCapUsd: 10_000_000,
};

/**
 * Calculate participation allocation for a user's contribution
 *
 * From LEVIATHAN #1228-1231:
 * - 20% always retained by inventor (Founder)
 * - 40% maximum transferable to backers
 * - Platform retains remaining 40%
 * - Per-stake cap of $10M (after cap, stake retires and capacity recycles)
 * - Stakes auto-split into $1-5K child stakes when value exceeds 10x purchase
 */
export function allocateOwnership(
  bucketId: string,
  totalCreditsInBucket: number,
  userCredits: number,
  bucketValueUsd: number,
): {
  userOwnershipFraction: number;
  rawPayout: number;
  cappedPayout: number;
  wouldSplit: boolean;
  estimatedChildStakes: number;
} {
  // Cap user credits at per-person maximum
  const credits = Math.min(userCredits, ownershipRules.perPersonCapCredits);

  // Calculate user's share of the transferable pool
  const userShareOfCredits =
    totalCreditsInBucket > 0 ? credits / totalCreditsInBucket : 0;

  // User gets their share of the 40% transferable pool
  const transferablePool = ownershipRules.maxTransferable;
  const userOwnershipFraction = userShareOfCredits * transferablePool;

  // Calculate potential service value
  const rawPayout = userOwnershipFraction * bucketValueUsd;

  // Apply $10M cap
  const cappedPayout = Math.min(rawPayout, ownershipRules.stakeCapUsd);

  // Check if stake would split (value > 10x purchase price)
  // Assuming 1 Credit = $1 for simplicity
  const purchasePrice = credits;
  const wouldSplit = rawPayout > purchasePrice * 10;

  // If splitting, estimate number of child stakes ($2,500 default)
  const childStakeDefaultSize = 2_500;
  const estimatedChildStakes = wouldSplit
    ? Math.ceil(rawPayout / childStakeDefaultSize)
    : 1;

  return {
    userOwnershipFraction,
    rawPayout,
    cappedPayout,
    wouldSplit,
    estimatedChildStakes,
  };
}

/**
 * Display participation breakdown for a bucket
 */
export function getOwnershipBreakdown(
  totalCreditsInBucket: number,
  bucketValueUsd: number,
): {
  founderShare: number;
  platformShare: number;
  backerPoolShare: number;
  backerPoolValue: number;
  creditsPerPercent: number;
} {
  const founderShare = ownershipRules.founderRetention;
  const backerPoolShare = ownershipRules.maxTransferable;
  const platformShare = 1 - founderShare - backerPoolShare;

  const backerPoolValue = bucketValueUsd * backerPoolShare;

  // How many credits needed for 1% of the bucket
  const creditsPerPercent = totalCreditsInBucket > 0
    ? totalCreditsInBucket / (backerPoolShare * 100)
    : 0;

  return {
    founderShare,
    platformShare,
    backerPoolShare,
    backerPoolValue,
    creditsPerPercent,
  };
}
