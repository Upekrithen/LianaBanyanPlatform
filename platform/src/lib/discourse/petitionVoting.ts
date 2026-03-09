/**
 * PETITION & REFERENDUM VOTING — Marks-Based Democratic Participation
 * =====================================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 10 (Q4 Resolution)
 * Source: Rook Research R-015 (Petition/Referendum Voting Mechanics)
 *
 * FOUNDER-APPROVED SYSTEM:
 *
 *   Members vote on petitions/referendums using Marks (effort-debt currency).
 *   Marks cannot be purchased — they emerge from differential/participation.
 *   This ensures voting power comes from genuine engagement, not wallet size.
 *
 *   The SAME 6-tier diminishing returns structure as subscriber donations,
 *   but with one critical difference: TIERS NEVER RESET. Ever.
 *
 *   Each petition is a separate 6-tier ladder:
 *     Tier 1:   1 Mark   → 1 vote
 *     Tier 2:   5 Marks  → 1 vote
 *     Tier 3:  10 Marks  → 1 vote
 *     Tier 4:  25 Marks  → 1 vote
 *     Tier 5:  50 Marks  → 1 vote
 *     Tier 6: 100 Marks  → 1 vote
 *
 *   Total at full depth: 191 Marks for 6 votes maximum per petition.
 *   Each vote can be FOR (+1) or AGAINST (-1). Net score determines outcome.
 *
 * KEY DESIGN DECISIONS:
 *
 *   1. LIFETIME — NO RESET — Tiers on a specific petition NEVER reset.
 *      Once you've spent your influence on a petition, it's permanent.
 *      "You can't recycle on that." — Founder
 *
 *   2. PER-PETITION LADDER — Each petition is independent. Spending Marks
 *      on Petition A does not affect your tier on Petition B.
 *      But the Marks themselves are consumed globally.
 *
 *   3. MARKS ONLY — Credits cannot buy votes. Marks emerge from genuine
 *      participation (effort-debt). This prevents plutocratic capture.
 *
 *   4. FOR OR AGAINST AT EACH TIER — You can change direction between tiers.
 *      Tier 1 = FOR, Tier 3 = AGAINST. Max influence per person: +/-6.
 *
 *   5. MEASURED SILENCE (R-015) — Because tiers never reset, members must
 *      choose carefully which petitions to spend their deep tiers on.
 *      Creates a culture of strategic civic engagement.
 *
 *   6. PETITION CREATION: STAKE + CO-SIGNER THRESHOLD (R-015) —
 *      Creating a petition requires burning Marks (prevents spam).
 *      Petition must reach co-signer threshold before going to general vote.
 *      If threshold reached, creator's stake is refunded.
 *
 * POLITICAL MOVEMENTS ANALYSIS:
 *   The aggregate petition data — anonymized, no demographics, but proven
 *   by immutable ledger — becomes the most reliable grassroots political
 *   intelligence available. 5 years of this = unprecedented value.
 *   See participationRevenue.ts for the Attention-as-Funding model.
 */

// ── Constants ──────────────────────────────────────────────────────────────

/** Voting tiers — cost in Marks per vote */
export const VOTING_TIERS = [
  { tier: 1, marksCost: 1, label: "Voice" },
  { tier: 2, marksCost: 5, label: "Conviction" },
  { tier: 3, marksCost: 10, label: "Commitment" },
  { tier: 4, marksCost: 25, label: "Dedication" },
  { tier: 5, marksCost: 50, label: "Devotion" },
  { tier: 6, marksCost: 100, label: "Cornerstone" },
] as const;

/** Maximum tier depth per petition */
export const MAX_VOTING_TIER = 6;

/** Total Marks cost at full depth (1+5+10+25+50+100) */
export const FULL_DEPTH_MARKS_COST = 191;

/** Maximum votes per member per petition */
export const MAX_VOTES_PER_PETITION = 6;

/** Marks required to CREATE a petition (stake — refunded if threshold met) */
export const PETITION_CREATION_STAKE = 50;

/** Co-signer threshold before petition goes to general vote */
export const PETITION_COSIGNER_THRESHOLD = 500;

/** Marks required to co-sign a petition */
export const PETITION_COSIGN_COST = 1;

/** Minimum account age (days) to create a petition */
export const MIN_ACCOUNT_AGE_FOR_PETITION = 30;

/** Minimum earned Marks to create a petition */
export const MIN_MARKS_TO_CREATE_PETITION = 100;

/** Petition voting window (days) once threshold is met */
export const PETITION_VOTING_WINDOW_DAYS = 30;

/** Net score threshold for petition to PASS */
export const PETITION_PASS_THRESHOLD = 0; // any positive net score

/** Minimum total votes for a petition result to be considered valid */
export const PETITION_QUORUM = 100;

// ── Types ──────────────────────────────────────────────────────────────────

/** Vote direction */
export type VoteDirection = "for" | "against";

/** Petition status */
export type PetitionStatus =
  | "gathering_cosigners"   // created, needs co-signer threshold
  | "voting_open"           // threshold met, voting window active
  | "passed"                // voting closed, net score > 0, quorum met
  | "failed"                // voting closed, net score <= 0 or quorum not met
  | "expired"               // co-signer threshold not met in time
  | "withdrawn";            // creator withdrew the petition

/** Petition category — what domain this petition addresses */
export type PetitionCategory =
  | "platform_policy"       // changes to LB platform rules
  | "initiative_funding"    // funding for one of the 16 initiatives
  | "governance_change"     // structural governance changes
  | "community_action"      // community-level actions
  | "dispute_resolution"    // resolving disputes between members/guilds
  | "feature_request";      // platform feature requests

// ── Interfaces ─────────────────────────────────────────────────────────────

/**
 * A petition or referendum.
 */
export interface Petition {
  /** Petition ID */
  id: string;
  /** Title */
  title: string;
  /** Full description of what's being petitioned */
  description: string;
  /** Category */
  category: PetitionCategory;
  /** Creator member ID */
  creatorId: string;
  /** Creator's stake (Marks burned to create) */
  creatorStake: number;
  /** Whether the stake has been refunded (threshold met) */
  stakeRefunded: boolean;
  /** Current status */
  status: PetitionStatus;
  /** Co-signer count */
  cosignerCount: number;
  /** Co-signer threshold required */
  cosignerThreshold: number;
  /** Total FOR votes (weighted: each vote = 1, regardless of tier cost) */
  totalForVotes: number;
  /** Total AGAINST votes */
  totalAgainstVotes: number;
  /** Net score (FOR - AGAINST) */
  netScore: number;
  /** Total unique voters */
  uniqueVoterCount: number;
  /** Tier-weighted intensity score (Tier 1 = 1pt, Tier 6 = 6pts) */
  tierWeightedIntensity: number;
  /** Voting window start (null if still gathering co-signers) */
  votingOpenedAt: string | null;
  /** Voting window end */
  votingClosesAt: string | null;
  /** Peak supporter count (high water mark for River Level display) */
  peakSupporterCount: number;
  /** When peak was reached */
  peakReachedAt: string | null;
  /** Historical snapshots for trend charting */
  historicalSnapshots: Array<{
    period: string;
    forVotes: number;
    againstVotes: number;
    netScore: number;
    uniqueVoters: number;
    snapshotAt: string;
  }>;
  /** Linked to Attention-as-Funding (participationRevenue) */
  participationRevenueLinked: boolean;
  /** Created at */
  createdAt: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

/**
 * A member's vote record on a specific petition.
 * Each tier is a separate vote — FOR or AGAINST.
 * NEVER resets. Permanent. Immutable ledger entry.
 */
export interface PetitionVoteRecord {
  /** Record ID */
  id: string;
  /** Petition ID */
  petitionId: string;
  /** Voter member ID */
  voterId: string;
  /** Votes cast at each tier (null = not yet voted at this tier) */
  votesByTier: [
    VoteDirection | null,
    VoteDirection | null,
    VoteDirection | null,
    VoteDirection | null,
    VoteDirection | null,
    VoteDirection | null,
  ];
  /** Current highest tier voted at */
  highestTierVoted: number;
  /** Total Marks spent on this petition (cumulative, never refunded) */
  totalMarksSpent: number;
  /** Net personal score (sum of FOR=+1, AGAINST=-1 across tiers) */
  personalNetScore: number;
  /** Whether the voter is approaching a cliff edge (next tier costs significantly more) */
  approachingCliffEdge: boolean;
  /** Tier-weighted intensity (sum of tier numbers for voted tiers) */
  personalIntensity: number;
  /** Each tier's ledger entry ID */
  tierLedgerEntryIds: [string | null, string | null, string | null, string | null, string | null, string | null];
  /** First vote timestamp */
  firstVotedAt: string;
  /** Last vote timestamp */
  lastVotedAt: string;
}

/**
 * Petition co-signer record.
 */
export interface PetitionCoSigner {
  /** Co-signer record ID */
  id: string;
  /** Petition ID */
  petitionId: string;
  /** Co-signer member ID */
  memberId: string;
  /** Marks spent to co-sign */
  marksSpent: number;
  /** Co-signed at */
  cosignedAt: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Get the Marks cost for a specific voting tier.
 */
export function getVotingTierCost(tier: number): number {
  const entry = VOTING_TIERS.find(t => t.tier === tier);
  return entry?.marksCost ?? 100;
}

/**
 * Check if a member can vote on a petition at the next tier.
 */
export function canVote(
  petition: Petition,
  voteRecord: PetitionVoteRecord | null,
  voterMarksBalance: number,
): { allowed: boolean; reason?: string; nextTier?: number; cost?: number; isCliffEdge?: boolean } {
  // Petition must be in voting phase
  if (petition.status !== "voting_open") {
    return { allowed: false, reason: "Voting is not currently open on this petition." };
  }

  // Check voting window
  if (petition.votingClosesAt && Date.now() > new Date(petition.votingClosesAt).getTime()) {
    return { allowed: false, reason: "Voting window has closed." };
  }

  // No existing record = start at Tier 1
  if (!voteRecord) {
    const cost = getVotingTierCost(1);
    if (voterMarksBalance < cost) {
      return { allowed: false, reason: `Insufficient Marks. Need ${cost}, have ${voterMarksBalance}.` };
    }
    return { allowed: true, nextTier: 1, cost, isCliffEdge: false };
  }

  // Already at max tier
  if (voteRecord.highestTierVoted >= MAX_VOTING_TIER) {
    return {
      allowed: false,
      reason: "Already voted at all 6 tiers on this petition. Your influence is permanently spent.",
    };
  }

  // Next tier
  const nextTier = voteRecord.highestTierVoted + 1;
  const cost = getVotingTierCost(nextTier);

  if (voterMarksBalance < cost) {
    return {
      allowed: false,
      reason: `Insufficient Marks for Tier ${nextTier}. Need ${cost}, have ${voterMarksBalance}.`,
    };
  }

  // Cliff edge warning (R-015): warn when next tier is significantly more expensive
  const currentTierCost = getVotingTierCost(voteRecord.highestTierVoted);
  const isCliffEdge = cost >= currentTierCost * 2;

  return { allowed: true, nextTier, cost, isCliffEdge };
}

/**
 * Check if a petition has met its co-signer threshold.
 */
export function hasMetThreshold(petition: Petition): boolean {
  return petition.cosignerCount >= petition.cosignerThreshold;
}

/**
 * Check if a petition has met quorum for its result to be valid.
 */
export function hasQuorum(petition: Petition): boolean {
  return petition.uniqueVoterCount >= PETITION_QUORUM;
}

/**
 * Calculate the tier-weighted intensity score for a petition.
 * Higher tiers contribute more intensity (Tier 1 = 1pt, Tier 6 = 6pts).
 * This shows DEPTH of commitment, not just breadth.
 */
export function calculateTierWeightedIntensity(
  votesByTier: Array<{ tier: number; count: number }>,
): number {
  return votesByTier.reduce((sum, v) => sum + (v.tier * v.count), 0);
}

/**
 * Determine the petition outcome after voting closes.
 */
export function determinePetitionOutcome(petition: Petition): {
  outcome: "passed" | "failed";
  reason: string;
  netScore: number;
  quorumMet: boolean;
} {
  const quorumMet = hasQuorum(petition);

  if (!quorumMet) {
    return {
      outcome: "failed",
      reason: `Quorum not met. ${petition.uniqueVoterCount} of ${PETITION_QUORUM} required voters.`,
      netScore: petition.netScore,
      quorumMet: false,
    };
  }

  if (petition.netScore > PETITION_PASS_THRESHOLD) {
    return {
      outcome: "passed",
      reason: `Passed with net score of +${petition.netScore} (${petition.totalForVotes} FOR, ${petition.totalAgainstVotes} AGAINST).`,
      netScore: petition.netScore,
      quorumMet: true,
    };
  }

  return {
    outcome: "failed",
    reason: `Failed with net score of ${petition.netScore} (${petition.totalForVotes} FOR, ${petition.totalAgainstVotes} AGAINST).`,
    netScore: petition.netScore,
    quorumMet: true,
  };
}

/**
 * Check if a member can create a petition.
 */
export function canCreatePetition(
  memberMarksBalance: number,
  memberAccountAgeDays: number,
  memberTotalMarksEarned: number,
): { allowed: boolean; reason?: string } {
  if (memberAccountAgeDays < MIN_ACCOUNT_AGE_FOR_PETITION) {
    return {
      allowed: false,
      reason: `Account must be at least ${MIN_ACCOUNT_AGE_FOR_PETITION} days old to create a petition.`,
    };
  }

  if (memberTotalMarksEarned < MIN_MARKS_TO_CREATE_PETITION) {
    return {
      allowed: false,
      reason: `Must have earned at least ${MIN_MARKS_TO_CREATE_PETITION} Marks through participation.`,
    };
  }

  if (memberMarksBalance < PETITION_CREATION_STAKE) {
    return {
      allowed: false,
      reason: `Creating a petition requires staking ${PETITION_CREATION_STAKE} Marks. You have ${memberMarksBalance}.`,
    };
  }

  return { allowed: true };
}

/**
 * Create a new petition.
 */
export function createPetition(
  title: string,
  description: string,
  category: PetitionCategory,
  creatorId: string,
): Petition {
  const now = new Date().toISOString();
  return {
    id: `pet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    description,
    category,
    creatorId,
    creatorStake: PETITION_CREATION_STAKE,
    stakeRefunded: false,
    status: "gathering_cosigners",
    cosignerCount: 0,
    cosignerThreshold: PETITION_COSIGNER_THRESHOLD,
    totalForVotes: 0,
    totalAgainstVotes: 0,
    netScore: 0,
    uniqueVoterCount: 0,
    tierWeightedIntensity: 0,
    votingOpenedAt: null,
    votingClosesAt: null,
    peakSupporterCount: 0,
    peakReachedAt: null,
    historicalSnapshots: [],
    participationRevenueLinked: true,
    createdAt: now,
    ledgerEntryId: `ledger-pet-${Date.now()}`,
  };
}

/**
 * Get a summary of the political movements analysis for multiple petitions.
 * This is the data that feeds into the Political Movements Analysis Meter
 * and the Attention-as-Funding data products.
 */
export function getPoliticalMovementsSummary(petitions: Petition[]): {
  totalPetitions: number;
  activePetitions: number;
  passedPetitions: number;
  failedPetitions: number;
  totalUniqueVoters: number;
  totalMarksSpent: number;
  averageNetScore: number;
  highestIntensityPetition: { id: string; title: string; intensity: number } | null;
  byCategory: Record<PetitionCategory, number>;
} {
  const active = petitions.filter(p => p.status === "voting_open" || p.status === "gathering_cosigners");
  const passed = petitions.filter(p => p.status === "passed");
  const failed = petitions.filter(p => p.status === "failed");

  const totalVoters = petitions.reduce((sum, p) => sum + p.uniqueVoterCount, 0);
  const avgNet = petitions.length > 0
    ? petitions.reduce((sum, p) => sum + p.netScore, 0) / petitions.length
    : 0;

  let highest: { id: string; title: string; intensity: number } | null = null;
  for (const p of petitions) {
    if (!highest || p.tierWeightedIntensity > highest.intensity) {
      highest = { id: p.id, title: p.title, intensity: p.tierWeightedIntensity };
    }
  }

  const byCategory = {} as Record<PetitionCategory, number>;
  for (const p of petitions) {
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  }

  return {
    totalPetitions: petitions.length,
    activePetitions: active.length,
    passedPetitions: passed.length,
    failedPetitions: failed.length,
    totalUniqueVoters: totalVoters,
    totalMarksSpent: 0, // calculated from vote records, not petition aggregate
    averageNetScore: Math.round(avgNet * 10) / 10,
    highestIntensityPetition: highest,
    byCategory,
  };
}
