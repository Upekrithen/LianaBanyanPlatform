/**
 * PEDESTAL GOVERNANCE — Content Moderation with Bidirectional Voting
 * ==================================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 5 (Pedestal Governance)
 * Source: Rook Research R-017 (Harper Guild Architecture)
 *
 * Pedestal Governance implements community-driven content moderation
 * for Public Pedestals (20K+ Credits funded). The system uses a
 * multi-layer approach:
 *
 *   LAYER 1 — FUNDER FLAGGING:
 *     - Any funder of a Pedestal can flag content they believe violates
 *       the Shirley Temple Policy (family-safe, ethical, truthful)
 *     - Each funder gets 3 flags per 30-day window (prevents flag spam)
 *     - Flagging is a RIGHT of funders — they funded it, they moderate it
 *
 *   LAYER 2 — BIDIRECTIONAL VOTE:
 *     - When flags exceed a threshold (5% of unique viewers OR 3 absolute),
 *       the content is auto-hidden and a 48-hour vote begins
 *     - ALL funders of that Pedestal can vote: FOR (keep) or AGAINST (remove)
 *     - 1 funder = 1 vote (simple democracy, no tiers)
 *     - Majority wins; ties favor keeping the content (benefit of the doubt)
 *
 *   LAYER 3 — REVIEW STATUS:
 *     - If a creator's content gets taken down 3 times across ANY Pedestal,
 *       the creator enters "Review Status"
 *     - Review Status = all new content from this creator requires
 *       pre-approval before appearing on Public Pedestals
 *     - Creator can appeal to the Harper Guild (ethics enforcement body)
 *
 *   MARKET GOVERNANCE (Nuclear Backstop):
 *     - If a Public Pedestal consistently hosts problematic content,
 *       funders can withdraw their contributions (within terms)
 *     - Funding drops below 20K = reverts to Private (audience evaporates)
 *     - This creates massive economic pressure for quality curation
 *
 * WHY 1 FUNDER = 1 VOTE (not tiered):
 *   - Pedestal funders already proved commitment with Credits
 *   - Adding Mark-based tiers would over-complicate a moderation vote
 *   - Equal voice in moderation = fairness (larger contribution ≠ more moderation power)
 *   - The petition system (petitionVoting.ts) handles weighted civic expression;
 *     content moderation is a binary keep/remove decision
 *
 * SUBSCRIBER DONATION VISIBILITY:
 *   - Funders can see aggregate subscriber donation status for a Pedestal's
 *     content creators (not individual donor details, just tier distribution)
 *   - This helps funders assess creator quality and community support
 *   - Individual subscription details remain private
 *
 * SEC-SAFE: This is content moderation, not a financial governance mechanism.
 * No economic benefits are generated. Funding contributions are service payments,
 * not ownership stakes. Votes determine content visibility, not financial outcomes.
 */

import type { PedestalStatus } from "./pedestals";

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum flags a single funder can submit per window */
export const MAX_FLAGS_PER_FUNDER_PER_WINDOW = 3;

/** Flag window duration (days) */
export const FLAG_WINDOW_DAYS = 30;

/** Voting period duration (hours) */
export const VOTING_PERIOD_HOURS = 48;

/** Percentage of unique viewers that must flag before auto-hide triggers */
export const FLAG_THRESHOLD_PERCENT = 5;

/** Minimum absolute flag count before threshold check (prevents tiny-audience manipulation) */
export const MIN_FLAG_COUNT = 3;

/** Number of confirmed takedowns before creator enters Review Status */
export const TAKEDOWN_REVIEW_THRESHOLD = 3;

/** Appeal window for creators after a takedown (days) */
export const CREATOR_APPEAL_WINDOW_DAYS = 7;

/** Minimum funders required to make a moderation vote valid */
export const MIN_VOTERS_FOR_VALID_ROUND = 5;

/** Grace period before auto-hidden content is permanently removed if no vote (hours) */
export const AUTO_HIDE_GRACE_PERIOD_HOURS = 72;

// ── Types ──────────────────────────────────────────────────────────────────

/** Reasons a funder can flag content */
export type ContentFlagReason =
  | "shirley_temple_violation"    // not family-safe
  | "misinformation"             // factually inaccurate or misleading
  | "harassment"                 // targeting individuals or groups
  | "spam"                       // irrelevant or promotional
  | "copyright_concern"          // potential copyright issue
  | "off_topic"                  // doesn't belong on this Pedestal
  | "other";                     // custom reason (requires description)

/** Content moderation status lifecycle */
export type ContentModerationStatus =
  | "published"                  // normal, visible
  | "flagged"                    // has flags but below threshold
  | "auto_hidden"               // flags exceeded threshold, awaiting vote
  | "under_vote"                // 48-hour bidirectional vote in progress
  | "kept"                      // vote completed: content stays (FOR won)
  | "taken_down"                // vote completed: content removed (AGAINST won)
  | "appealed"                  // creator appealed the takedown
  | "appeal_upheld"             // Harper Guild upheld the appeal (content restored)
  | "appeal_denied"             // Harper Guild denied the appeal (takedown stands)
  | "pre_approval_required";    // creator in Review Status, needs mod approval

/** Vote direction in a moderation round */
export type ModerationVoteDirection = "for_keeping" | "against_keeping";

/** Moderation round outcome */
export type ModerationOutcome =
  | "content_kept"              // FOR votes >= AGAINST votes (ties favor keeping)
  | "content_removed"           // AGAINST votes > FOR votes
  | "insufficient_votes"        // fewer than MIN_VOTERS_FOR_VALID_ROUND voted
  | "expired_no_vote";          // voting period ended with 0 votes

/** Creator's review status */
export type CreatorReviewStatus =
  | "good_standing"             // < TAKEDOWN_REVIEW_THRESHOLD takedowns
  | "warning"                   // 1-2 takedowns, approaching threshold
  | "review_status"             // >= TAKEDOWN_REVIEW_THRESHOLD takedowns — pre-approval required
  | "suspended";                // Harper Guild suspended the creator (severe violations)

// ── Interfaces ─────────────────────────────────────────────────────────────

/**
 * Content item on a Pedestal subject to governance.
 */
export interface PedestalContentItem {
  /** Content ID */
  id: string;
  /** Pedestal ID this content belongs to */
  pedestalId: string;
  /** Creator member ID (who published/curated this content) */
  creatorMemberId: string;
  /** Content title */
  title: string;
  /** Source feed ID (from SubscriptionFeed) */
  feedId: string;
  /** Current moderation status */
  moderationStatus: ContentModerationStatus;
  /** Unique viewer count (for flag threshold calculation) */
  uniqueViewerCount: number;
  /** Total flag count */
  flagCount: number;
  /** Active moderation round ID (if under vote) */
  activeModerationRoundId?: string;
  /** Published at */
  publishedAt: string;
  /** Last status change */
  statusChangedAt: string;
  /** Ledger entry ID for moderation events */
  ledgerEntryId?: string;
}

/**
 * Content flag — a funder's objection to specific content.
 */
export interface ContentFlag {
  /** Flag ID */
  id: string;
  /** Content item ID being flagged */
  contentId: string;
  /** Pedestal ID */
  pedestalId: string;
  /** Funder member ID who submitted the flag */
  flaggerMemberId: string;
  /** Reason for flagging */
  reason: ContentFlagReason;
  /** Optional description (required for "other" reason) */
  description?: string;
  /** Timestamp */
  flaggedAt: string;
  /** Whether this flag contributed to triggering a vote */
  triggeredVote: boolean;
}

/**
 * Funder's flag budget — tracks how many flags they have remaining
 * in the current 30-day window.
 */
export interface FunderFlagBudget {
  /** Funder member ID */
  memberId: string;
  /** Pedestal ID */
  pedestalId: string;
  /** Flags used in current window */
  flagsUsed: number;
  /** Flags remaining */
  flagsRemaining: number;
  /** Current window start date */
  windowStart: string;
  /** Current window end date */
  windowEnd: string;
}

/**
 * Moderation Vote — a single funder's vote in a moderation round.
 * 1 funder = 1 vote, no tiers.
 */
export interface ContentModerationVote {
  /** Vote ID */
  id: string;
  /** Moderation round ID */
  roundId: string;
  /** Voter member ID (must be a funder of this Pedestal) */
  voterMemberId: string;
  /** Vote direction */
  direction: ModerationVoteDirection;
  /** Optional reason for their vote */
  reason?: string;
  /** Timestamp */
  votedAt: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

/**
 * Moderation Round — the 48-hour bidirectional vote on flagged content.
 */
export interface ContentModerationRound {
  /** Round ID */
  id: string;
  /** Content item ID being voted on */
  contentId: string;
  /** Pedestal ID */
  pedestalId: string;
  /** Creator member ID (the content creator) */
  creatorMemberId: string;
  /** When the vote started */
  startedAt: string;
  /** When the vote ends (startedAt + VOTING_PERIOD_HOURS) */
  endsAt: string;
  /** Total eligible voters (funders of this Pedestal) */
  eligibleVoterCount: number;
  /** Votes FOR keeping the content */
  votesFor: number;
  /** Votes AGAINST keeping (remove) */
  votesAgainst: number;
  /** Total votes cast */
  totalVotes: number;
  /** Voter turnout percentage */
  turnoutPercent: number;
  /** Outcome (null while voting is in progress) */
  outcome: ModerationOutcome | null;
  /** Whether the round is still active */
  isActive: boolean;
  /** Flags that triggered this round */
  triggeringFlagIds: string[];
  /** Ledger entry ID */
  ledgerEntryId: string;
}

/**
 * Creator Moderation Record — tracks a creator's moderation history.
 * 3 takedowns = Review Status (pre-approval required for future content).
 */
export interface CreatorModerationRecord {
  /** Creator member ID */
  creatorMemberId: string;
  /** Current review status */
  reviewStatus: CreatorReviewStatus;
  /** Total confirmed takedowns across all Pedestals */
  totalTakedowns: number;
  /** Total flags received (including resolved) */
  totalFlagsReceived: number;
  /** Total moderation rounds involving this creator */
  totalModerationRounds: number;
  /** Total times content was kept after a vote */
  totalKeptAfterVote: number;
  /** Successful appeal count */
  successfulAppeals: number;
  /** Failed appeal count */
  failedAppeals: number;
  /** Date of last takedown */
  lastTakedownAt?: string;
  /** Date when Review Status was entered (if applicable) */
  reviewStatusEnteredAt?: string;
  /** Pedestals where this creator has had takedowns */
  pedestalsWithTakedowns: string[];
  /** Whether the creator has an active appeal */
  hasActiveAppeal: boolean;
  /** Ledger section ID for this creator's moderation history */
  ledgerSectionId: string;
}

/**
 * Creator Appeal — filed after a takedown, reviewed by Harper Guild.
 */
export interface CreatorAppeal {
  /** Appeal ID */
  id: string;
  /** Content item ID that was taken down */
  contentId: string;
  /** Moderation round ID that resulted in takedown */
  roundId: string;
  /** Creator member ID */
  creatorMemberId: string;
  /** Appeal reason/argument */
  appealText: string;
  /** When the appeal was filed */
  filedAt: string;
  /** Appeal deadline (takedownAt + CREATOR_APPEAL_WINDOW_DAYS) */
  deadline: string;
  /** Whether the appeal has been reviewed */
  isReviewed: boolean;
  /** Harper reviewer ID (if reviewed) */
  reviewerHarperId?: string;
  /** Review outcome */
  outcome?: "upheld" | "denied";
  /** Review notes from Harper */
  reviewNotes?: string;
  /** Reviewed at timestamp */
  reviewedAt?: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

/**
 * Subscriber Donation Visibility — aggregate view of subscriber
 * donation status for a Pedestal's content creators.
 * Funders can see this; individual donor details are NOT exposed.
 */
export interface SubscriberDonationVisibility {
  /** Pedestal ID */
  pedestalId: string;
  /** Number of content creators on this Pedestal */
  creatorCount: number;
  /** Aggregate tier distribution across all creators on this Pedestal */
  aggregateTierDistribution: {
    tier1_grassroots: number;
    tier2_supporter: number;
    tier3_advocate: number;
    tier4_champion: number;
    tier5_patron: number;
    tier6_benefactor: number;
  };
  /** Total active subscribers across all creators */
  totalActiveSubscribers: number;
  /** Average subscriber retention rate (percent) */
  averageRetentionPercent: number;
  /** Whether any creator has reached a milestone */
  creatorsAtMilestone: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  /** Last updated */
  lastUpdatedAt: string;
}

/**
 * Pedestal Governance Summary — dashboard view for funders.
 */
export interface PedestalGovernanceSummary {
  /** Pedestal ID */
  pedestalId: string;
  /** Pedestal name */
  pedestalName: string;
  /** Pedestal status */
  pedestalStatus: PedestalStatus;
  /** Total content items */
  totalContent: number;
  /** Currently flagged content count */
  flaggedContentCount: number;
  /** Content under active vote */
  underVoteCount: number;
  /** Total takedowns in history */
  totalTakedowns: number;
  /** Total moderation rounds completed */
  totalRoundsCompleted: number;
  /** Average turnout in moderation votes */
  averageTurnoutPercent: number;
  /** Creators in Review Status who publish to this Pedestal */
  creatorsInReviewStatus: number;
  /** Funder count (eligible voters) */
  funderCount: number;
  /** Active appeals */
  activeAppeals: number;
  /** Subscriber donation visibility (aggregate) */
  subscriberDonationVisibility?: SubscriberDonationVisibility;
}

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Check whether a funder can flag content on a Pedestal.
 * Must be a funder, must have flags remaining in current window.
 */
export function canFlag(
  budget: FunderFlagBudget,
  isFunder: boolean,
): { allowed: boolean; reason?: string; flagsRemaining?: number } {
  if (!isFunder) {
    return { allowed: false, reason: "Only funders of this Pedestal can flag content." };
  }

  if (budget.flagsRemaining <= 0) {
    const windowEnd = new Date(budget.windowEnd);
    return {
      allowed: false,
      reason: `You have used all ${MAX_FLAGS_PER_FUNDER_PER_WINDOW} flags for this 30-day window. Next window opens ${windowEnd.toLocaleDateString()}.`,
      flagsRemaining: 0,
    };
  }

  return { allowed: true, flagsRemaining: budget.flagsRemaining };
}

/**
 * Create a new flag budget for a funder (or reset expired window).
 */
export function createFlagBudget(
  memberId: string,
  pedestalId: string,
): FunderFlagBudget {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + FLAG_WINDOW_DAYS);

  return {
    memberId,
    pedestalId,
    flagsUsed: 0,
    flagsRemaining: MAX_FLAGS_PER_FUNDER_PER_WINDOW,
    windowStart: now.toISOString(),
    windowEnd: windowEnd.toISOString(),
  };
}

/**
 * Check whether a flag budget window has expired and needs reset.
 */
export function isFlagWindowExpired(budget: FunderFlagBudget): boolean {
  return new Date() >= new Date(budget.windowEnd);
}

/**
 * Determine whether flagged content should trigger a moderation vote.
 * Triggers when: flagCount >= MIN_FLAG_COUNT AND flagCount/uniqueViewers >= FLAG_THRESHOLD_PERCENT%
 */
export function shouldTriggerVote(
  flagCount: number,
  uniqueViewerCount: number,
): { shouldTrigger: boolean; reason: string } {
  if (flagCount < MIN_FLAG_COUNT) {
    return {
      shouldTrigger: false,
      reason: `Flag count (${flagCount}) below minimum threshold (${MIN_FLAG_COUNT}).`,
    };
  }

  if (uniqueViewerCount <= 0) {
    // Content has flags but no recorded viewers — trigger for safety
    return { shouldTrigger: true, reason: "Flags present with no viewer data — triggering review." };
  }

  const flagPercent = (flagCount / uniqueViewerCount) * 100;
  if (flagPercent >= FLAG_THRESHOLD_PERCENT) {
    return {
      shouldTrigger: true,
      reason: `Flag rate (${flagPercent.toFixed(1)}%) exceeds threshold (${FLAG_THRESHOLD_PERCENT}%).`,
    };
  }

  return {
    shouldTrigger: false,
    reason: `Flag rate (${flagPercent.toFixed(1)}%) below threshold (${FLAG_THRESHOLD_PERCENT}%).`,
  };
}

/**
 * Create a new moderation round (48-hour bidirectional vote).
 */
export function createModerationRound(
  contentId: string,
  pedestalId: string,
  creatorMemberId: string,
  eligibleVoterCount: number,
  triggeringFlagIds: string[],
): ContentModerationRound {
  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setHours(endsAt.getHours() + VOTING_PERIOD_HOURS);

  return {
    id: `mod-round-${Date.now()}`,
    contentId,
    pedestalId,
    creatorMemberId,
    startedAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
    eligibleVoterCount,
    votesFor: 0,
    votesAgainst: 0,
    totalVotes: 0,
    turnoutPercent: 0,
    outcome: null,
    isActive: true,
    triggeringFlagIds,
    ledgerEntryId: `ledger-mod-${Date.now()}`,
  };
}

/**
 * Cast a moderation vote. 1 funder = 1 vote.
 * Returns whether the vote was accepted.
 */
export function canCastModerationVote(
  round: ContentModerationRound,
  voterMemberId: string,
  isFunder: boolean,
  hasAlreadyVoted: boolean,
): { allowed: boolean; reason?: string } {
  if (!round.isActive) {
    return { allowed: false, reason: "This moderation round has ended." };
  }

  if (new Date() > new Date(round.endsAt)) {
    return { allowed: false, reason: "Voting period has expired." };
  }

  if (!isFunder) {
    return { allowed: false, reason: "Only funders of this Pedestal can vote on content moderation." };
  }

  if (hasAlreadyVoted) {
    return { allowed: false, reason: "You have already voted in this moderation round." };
  }

  // Creator cannot vote on their own content
  if (voterMemberId === round.creatorMemberId) {
    return { allowed: false, reason: "Content creators cannot vote on moderation of their own content." };
  }

  return { allowed: true };
}

/**
 * Resolve a moderation round — determine the outcome.
 * Ties favor keeping the content (benefit of the doubt).
 */
export function resolveModerationRound(
  round: ContentModerationRound,
): ModerationOutcome {
  if (round.totalVotes === 0) {
    return "expired_no_vote";
  }

  if (round.totalVotes < MIN_VOTERS_FOR_VALID_ROUND) {
    return "insufficient_votes";
  }

  // Ties favor keeping the content
  if (round.votesAgainst > round.votesFor) {
    return "content_removed";
  }

  return "content_kept";
}

/**
 * Determine creator's review status based on takedown history.
 * 3+ takedowns = Review Status (pre-approval required).
 */
export function determineCreatorReviewStatus(
  totalTakedowns: number,
  isSuspended: boolean,
): CreatorReviewStatus {
  if (isSuspended) return "suspended";
  if (totalTakedowns >= TAKEDOWN_REVIEW_THRESHOLD) return "review_status";
  if (totalTakedowns > 0) return "warning";
  return "good_standing";
}

/**
 * Check if a creator can appeal a takedown.
 * Must be within the appeal window and not already have an active appeal.
 */
export function canAppeal(
  takedownTimestamp: string,
  hasActiveAppeal: boolean,
): { allowed: boolean; reason?: string; deadlineAt?: string } {
  if (hasActiveAppeal) {
    return { allowed: false, reason: "You already have an active appeal pending review." };
  }

  const takedownDate = new Date(takedownTimestamp);
  const deadline = new Date(takedownDate);
  deadline.setDate(deadline.getDate() + CREATOR_APPEAL_WINDOW_DAYS);

  if (new Date() > deadline) {
    return {
      allowed: false,
      reason: `Appeal window has expired. Takedowns must be appealed within ${CREATOR_APPEAL_WINDOW_DAYS} days.`,
    };
  }

  return { allowed: true, deadlineAt: deadline.toISOString() };
}

/**
 * Create a creator moderation record.
 */
export function createCreatorModerationRecord(
  creatorMemberId: string,
): CreatorModerationRecord {
  return {
    creatorMemberId,
    reviewStatus: "good_standing",
    totalTakedowns: 0,
    totalFlagsReceived: 0,
    totalModerationRounds: 0,
    totalKeptAfterVote: 0,
    successfulAppeals: 0,
    failedAppeals: 0,
    pedestalsWithTakedowns: [],
    hasActiveAppeal: false,
    ledgerSectionId: `ledger-creator-mod-${creatorMemberId}-${Date.now()}`,
  };
}

/**
 * Get a governance summary for a Pedestal dashboard.
 */
export function getGovernanceSummary(
  pedestalId: string,
  pedestalName: string,
  pedestalStatus: PedestalStatus,
  contentItems: PedestalContentItem[],
  rounds: ContentModerationRound[],
  funderCount: number,
  creatorsInReview: number,
  activeAppeals: number,
  subscriberVisibility?: SubscriberDonationVisibility,
): PedestalGovernanceSummary {
  const flaggedCount = contentItems.filter(
    c => c.moderationStatus === "flagged" || c.moderationStatus === "auto_hidden",
  ).length;
  const underVote = contentItems.filter(c => c.moderationStatus === "under_vote").length;
  const completedRounds = rounds.filter(r => !r.isActive);
  const takedowns = completedRounds.filter(r => r.outcome === "content_removed").length;

  const avgTurnout =
    completedRounds.length > 0
      ? completedRounds.reduce((sum, r) => sum + r.turnoutPercent, 0) / completedRounds.length
      : 0;

  return {
    pedestalId,
    pedestalName,
    pedestalStatus,
    totalContent: contentItems.length,
    flaggedContentCount: flaggedCount,
    underVoteCount: underVote,
    totalTakedowns: takedowns,
    totalRoundsCompleted: completedRounds.length,
    averageTurnoutPercent: Math.round(avgTurnout * 100) / 100,
    creatorsInReviewStatus: creatorsInReview,
    funderCount,
    activeAppeals,
    subscriberDonationVisibility: subscriberVisibility,
  };
}
