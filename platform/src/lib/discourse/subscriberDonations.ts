/**
 * SUBSCRIBER DONATION TIERS — Diminishing Returns Grassroots Proof
 * ==================================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 1 (Q1 Resolution)
 * Source: Rook Research R-014 (Subscriber Donation Tier Mathematics)
 *
 * FOUNDER-APPROVED SYSTEM:
 *
 *   Subscribers can donate their earned Coverage Minutes to creators.
 *   Each donation passes through a 6-tier diminishing returns system
 *   that proves genuine grassroots popularity — not whale capture.
 *
 *   Tier 1: 1:1   — Donor spends 1 minute,  creator receives 1 minute
 *   Tier 2: 5:1   — Donor spends 5 minutes, creator receives 1 minute
 *   Tier 3: 10:1  — Donor spends 10 minutes, creator receives 1 minute
 *   Tier 4: 25:1  — Donor spends 25 minutes, creator receives 1 minute
 *   Tier 5: 50:1  — Donor spends 50 minutes, creator receives 1 minute
 *   Tier 6: 100:1 — Donor spends 100 minutes, creator receives 1 minute
 *
 *   Total at full depth: Donor spends 191 minutes, creator receives 6 minutes.
 *
 * KEY DESIGN DECISIONS:
 *
 *   1. TIER RESET AFTER DECAY — Tiers are NOT lifetime. Once ALL of a
 *      subscriber's prior donations to a creator fully decay (90 days),
 *      their tier counter resets to 0. They can donate again from Tier 1.
 *      "I don't want it to be impossible to get and keep an audience."
 *
 *   2. 5K MILESTONE REWARDS — Every 5,000 unique active donating subscribers
 *      increases the creator's bonus cap by 100% (from 500% base).
 *      At 50K, the jump is +200%. Milestones are DYNAMIC — drop below
 *      threshold = lose the milestone. Must be maintained.
 *
 *   3. SEPARATE BONUS POOL — Donated minutes go into a bonus pool that
 *      does NOT count toward the 3-hour session broadcast cap.
 *      The cap still applies to personally earned minutes.
 *
 *   4. SAME-TABLE ACTIVATION — Subscriber donations only activate when
 *      both subscriber and creator are present in the same Round Table.
 *
 *   5. 7-DAY COOLDOWN — After a tier fully resets (all donations decayed),
 *      the subscriber must wait 7 days before donating again. Prevents
 *      mechanical "every 91 days" automation.
 *
 *   6. SYBIL PREVENTION (R-014) — Minimum participation requirement before
 *      a member can donate. Unverified accounts default to worst tier
 *      or are barred from donating. Prevents whale smurfing.
 *
 * ANTI-WHALE MATH (R-014):
 *   - A Twitch whale dropping $10K would hit the 100:1 tier, yielding
 *     only $100 of effective value at the top end.
 *   - A creator with 10,000 fans giving $5 each has vastly more platform
 *     power than a creator with 10 fans giving $5,000 each.
 *   - 90% retention + stagnant audience → severe plateau at 25:1/50:1 walls.
 *   - System mathematically prevents "cults of personality."
 */

import { COVERAGE_MINUTE_DECAY_DAYS } from "./coverageMinutes";

// ── Constants ──────────────────────────────────────────────────────────────

/** The 6 donation tiers — donor cost per 1 minute credited to creator */
export const DONATION_TIERS = [
  { tier: 1, donorCostPerMinute: 1, label: "Grassroots" },
  { tier: 2, donorCostPerMinute: 5, label: "Supporter" },
  { tier: 3, donorCostPerMinute: 10, label: "Advocate" },
  { tier: 4, donorCostPerMinute: 25, label: "Champion" },
  { tier: 5, donorCostPerMinute: 50, label: "Patron" },
  { tier: 6, donorCostPerMinute: 100, label: "Benefactor" },
] as const;

/** Maximum tier depth */
export const MAX_DONATION_TIER = 6;

/** Total donor cost at full depth (1+5+10+25+50+100) */
export const FULL_DEPTH_DONOR_COST = 191;

/** Total creator receives at full depth (6 minutes, 1 per tier) */
export const FULL_DEPTH_CREATOR_RECEIVES = 6;

/** Base bonus cap — donated minutes capped at this % of personally earned */
export const BASE_BONUS_CAP_PERCENT = 500;

/** Milestone bonus cap increases */
export const MILESTONE_THRESHOLDS = [
  { subscribers: 5_000, bonusCapPercent: 600, label: "Bronze Beacon" },
  { subscribers: 10_000, bonusCapPercent: 700, label: "Silver Beacon" },
  { subscribers: 25_000, bonusCapPercent: 800, label: "Gold Beacon" },
  { subscribers: 50_000, bonusCapPercent: 1_000, label: "Platinum Beacon" },
] as const;

/** Cooldown period (days) after full tier reset before re-donation */
export const TIER_RESET_COOLDOWN_DAYS = 7;

/** Minimum earned Coverage Minutes before a member can donate */
export const MIN_EARNED_MINUTES_TO_DONATE = 30;

/** Minimum account age (days) before a member can donate (Sybil prevention) */
export const MIN_ACCOUNT_AGE_DAYS = 14;

/** Coverage Minute decay period (days) — imported from coverageMinutes */
export const DONATION_DECAY_DAYS = COVERAGE_MINUTE_DECAY_DAYS;

// ── Types ──────────────────────────────────────────────────────────────────

/** Donation tier number (1-6) */
export type DonationTierNumber = 1 | 2 | 3 | 4 | 5 | 6;

/** Milestone level */
export type MilestoneLevel = "none" | "bronze" | "silver" | "gold" | "platinum";

// ── Interfaces ─────────────────────────────────────────────────────────────

/**
 * A subscriber's donation relationship to a specific creator.
 * Tracks tier progress and decay status.
 */
export interface SubscriberDonationState {
  /** Record ID */
  id: string;
  /** Subscriber (donor) member ID */
  subscriberId: string;
  /** Creator (recipient) member ID */
  creatorId: string;
  /** Current tier (1-6, or 0 if not yet donated / fully decayed) */
  currentTier: number;
  /** Minutes donated at each tier (array index = tier - 1) */
  minutesDonatedByTier: [number, number, number, number, number, number];
  /** When each tier's donation was made (ISO timestamps, null if not yet donated) */
  tierDonatedAt: [string | null, string | null, string | null, string | null, string | null, string | null];
  /** Total minutes spent by this subscriber donating to this creator */
  totalMinutesSpent: number;
  /** Total minutes received by creator from this subscriber */
  totalMinutesReceived: number;
  /** When the last donation was made */
  lastDonatedAt: string | null;
  /** When all donations will have fully decayed (computed) */
  fullDecayAt: string | null;
  /** Whether a cooldown is in effect (post-decay reset) */
  isInCooldown: boolean;
  /** When the cooldown expires (null if not in cooldown) */
  cooldownExpiresAt: string | null;
  /** Ledger entry IDs for each donation */
  ledgerEntryIds: string[];
  /** Created at */
  createdAt: string;
}

/**
 * Creator's donation dashboard — aggregate state across all subscribers.
 */
export interface CreatorDonationDashboard {
  /** Creator member ID */
  creatorId: string;
  /** Total unique subscribers who have ever donated */
  lifetimeUniqueSubscribers: number;
  /** Currently active unique donating subscribers (non-decayed) */
  activeUniqueSubscribers: number;
  /** Peak active subscribers ever reached (the "high water mark") */
  peakActiveSubscribers: number;
  /** When the peak was reached */
  peakReachedAt: string | null;
  /** Current milestone level */
  currentMilestone: MilestoneLevel;
  /** Current bonus cap percentage */
  currentBonusCapPercent: number;
  /** Total minutes in the bonus pool (from subscriber donations) */
  bonusPoolMinutes: number;
  /** Maximum bonus pool size (based on personally earned minutes + milestone) */
  maxBonusPoolSize: number;
  /** Personally earned Coverage Minutes (used to calculate cap) */
  personallyEarnedMinutes: number;
  /** Distribution by tier (how many subscribers at each tier) */
  subscribersByTier: [number, number, number, number, number, number];
  /** Last updated */
  updatedAt: string;
}

/**
 * River Level display data — the high water mark visualization.
 * "Like river levels on the shore show how high the river has ever gone,
 *  even when the river is now at 5 feet lower."
 */
export interface RiverLevelDisplay {
  /** Entity ID (creator, petition, etc.) */
  entityId: string;
  /** Entity type */
  entityType: "creator" | "petition" | "initiative";
  /** Current level (active count) */
  currentLevel: number;
  /** Peak level ever reached */
  peakLevel: number;
  /** When the peak was reached */
  peakReachedAt: string;
  /** Trend direction */
  trend: "rising" | "falling" | "stable";
  /** Trend magnitude (change per period) */
  trendMagnitude: number;
  /** Historical snapshots for charting (quarterly) */
  historicalSnapshots: Array<{
    period: string;
    level: number;
    snapshotAt: string;
  }>;
}

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Get the donor cost for a specific tier.
 */
export function getDonorCostForTier(tier: DonationTierNumber): number {
  const entry = DONATION_TIERS.find(t => t.tier === tier);
  return entry?.donorCostPerMinute ?? 100;
}

/**
 * Calculate the total cost for a subscriber to donate through all tiers.
 */
export function calculateFullDonationCost(): {
  totalDonorCost: number;
  totalCreatorReceives: number;
  breakdown: Array<{ tier: number; donorCost: number; creatorReceives: number }>;
} {
  const breakdown = DONATION_TIERS.map(t => ({
    tier: t.tier,
    donorCost: t.donorCostPerMinute,
    creatorReceives: 1,
  }));

  return {
    totalDonorCost: FULL_DEPTH_DONOR_COST,
    totalCreatorReceives: FULL_DEPTH_CREATOR_RECEIVES,
    breakdown,
  };
}

/**
 * Determine the current milestone level for a creator based on active subscribers.
 */
export function getMilestoneLevel(activeSubscribers: number): {
  level: MilestoneLevel;
  bonusCapPercent: number;
  label: string;
  nextMilestone?: { subscribers: number; label: string };
} {
  let level: MilestoneLevel = "none";
  let bonusCapPercent = BASE_BONUS_CAP_PERCENT;
  let label = "No milestone";
  let nextMilestone: { subscribers: number; label: string } | undefined;

  for (let i = MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
    const milestone = MILESTONE_THRESHOLDS[i];
    if (activeSubscribers >= milestone.subscribers) {
      switch (i) {
        case 0: level = "bronze"; break;
        case 1: level = "silver"; break;
        case 2: level = "gold"; break;
        case 3: level = "platinum"; break;
      }
      bonusCapPercent = milestone.bonusCapPercent;
      label = milestone.label;

      if (i < MILESTONE_THRESHOLDS.length - 1) {
        const next = MILESTONE_THRESHOLDS[i + 1];
        nextMilestone = { subscribers: next.subscribers, label: next.label };
      }
      break;
    }
  }

  if (level === "none" && MILESTONE_THRESHOLDS.length > 0) {
    nextMilestone = {
      subscribers: MILESTONE_THRESHOLDS[0].subscribers,
      label: MILESTONE_THRESHOLDS[0].label,
    };
  }

  return { level, bonusCapPercent, label, nextMilestone };
}

/**
 * Calculate the maximum bonus pool size for a creator.
 * bonusPool = personallyEarned * (bonusCapPercent / 100)
 */
export function calculateMaxBonusPool(
  personallyEarnedMinutes: number,
  activeSubscribers: number,
): { maxBonusPool: number; bonusCapPercent: number; milestone: MilestoneLevel } {
  const milestone = getMilestoneLevel(activeSubscribers);
  const maxBonusPool = Math.floor(personallyEarnedMinutes * (milestone.bonusCapPercent / 100));

  return {
    maxBonusPool,
    bonusCapPercent: milestone.bonusCapPercent,
    milestone: milestone.level,
  };
}

/**
 * Check if a subscriber can donate to a creator right now.
 */
export function canDonate(
  donationState: SubscriberDonationState | null,
  subscriberEarnedMinutes: number,
  subscriberAccountAgeDays: number,
  subscriberCurrentBalance: number,
): { allowed: boolean; reason?: string; nextTier?: DonationTierNumber } {
  // Sybil prevention: minimum account age
  if (subscriberAccountAgeDays < MIN_ACCOUNT_AGE_DAYS) {
    return {
      allowed: false,
      reason: `Account must be at least ${MIN_ACCOUNT_AGE_DAYS} days old to donate.`,
    };
  }

  // Sybil prevention: minimum earned minutes
  if (subscriberEarnedMinutes < MIN_EARNED_MINUTES_TO_DONATE) {
    return {
      allowed: false,
      reason: `Must have earned at least ${MIN_EARNED_MINUTES_TO_DONATE} Coverage Minutes through participation before donating.`,
    };
  }

  // No existing relationship = start at Tier 1
  if (!donationState) {
    const cost = getDonorCostForTier(1);
    if (subscriberCurrentBalance < cost) {
      return { allowed: false, reason: `Insufficient balance. Need ${cost} minutes.` };
    }
    return { allowed: true, nextTier: 1 };
  }

  // Cooldown check
  if (donationState.isInCooldown && donationState.cooldownExpiresAt) {
    const cooldownEnd = new Date(donationState.cooldownExpiresAt).getTime();
    if (Date.now() < cooldownEnd) {
      const daysLeft = Math.ceil((cooldownEnd - Date.now()) / (24 * 60 * 60 * 1000));
      return {
        allowed: false,
        reason: `Cooldown active. ${daysLeft} day(s) remaining before you can donate again.`,
      };
    }
  }

  // Already at max tier
  if (donationState.currentTier >= MAX_DONATION_TIER) {
    return {
      allowed: false,
      reason: "Already donated through all 6 tiers. Wait for full decay to reset.",
    };
  }

  // Next tier cost check
  const nextTier = (donationState.currentTier + 1) as DonationTierNumber;
  const cost = getDonorCostForTier(nextTier);
  if (subscriberCurrentBalance < cost) {
    return {
      allowed: false,
      reason: `Insufficient balance for Tier ${nextTier}. Need ${cost} minutes, have ${subscriberCurrentBalance}.`,
    };
  }

  return { allowed: true, nextTier };
}

/**
 * Check if all of a subscriber's donations to a creator have fully decayed.
 * If so, the tier resets (with cooldown).
 */
export function checkTierReset(donationState: SubscriberDonationState): {
  shouldReset: boolean;
  allDecayed: boolean;
} {
  if (!donationState.lastDonatedAt) {
    return { shouldReset: false, allDecayed: true };
  }

  // Find the LATEST donation timestamp across all tiers
  let latestDonation = 0;
  for (const timestamp of donationState.tierDonatedAt) {
    if (timestamp) {
      const ts = new Date(timestamp).getTime();
      if (ts > latestDonation) latestDonation = ts;
    }
  }

  if (latestDonation === 0) {
    return { shouldReset: false, allDecayed: true };
  }

  const decayMs = DONATION_DECAY_DAYS * 24 * 60 * 60 * 1000;
  const fullDecayAt = latestDonation + decayMs;
  const allDecayed = Date.now() >= fullDecayAt;

  return {
    shouldReset: allDecayed && donationState.currentTier > 0,
    allDecayed,
  };
}

/**
 * Scale calculation: how many subscribers at full depth to hit the bonus cap.
 * With 100 personally earned minutes and base 500% cap:
 *   Max bonus = 500 minutes. Each full-depth subscriber gives 6 minutes.
 *   500 / 6 = ~84 subscribers at full depth.
 * At Tier 1 only: 500 subscribers (500 / 1 = 500).
 */
export function calculateSubscribersToFillCap(
  personallyEarnedMinutes: number,
  activeSubscribers: number,
  averageTierDepth: number = 1,
): { subscribersNeeded: number; currentCapacity: number; percentFilled: number } {
  const { maxBonusPool } = calculateMaxBonusPool(personallyEarnedMinutes, activeSubscribers);

  // Average minutes per subscriber at the given average tier depth
  let avgMinutesPerSubscriber = 0;
  for (let t = 1; t <= Math.min(averageTierDepth, MAX_DONATION_TIER); t++) {
    avgMinutesPerSubscriber += 1; // 1 minute per tier to creator
  }

  const subscribersNeeded = avgMinutesPerSubscriber > 0
    ? Math.ceil(maxBonusPool / avgMinutesPerSubscriber)
    : Infinity;

  const currentCapacity = activeSubscribers * avgMinutesPerSubscriber;
  const percentFilled = maxBonusPool > 0
    ? Math.min(100, Math.round((currentCapacity / maxBonusPool) * 100))
    : 0;

  return { subscribersNeeded, currentCapacity, percentFilled };
}

/**
 * Create the initial donation state for a new subscriber-creator relationship.
 */
export function createDonationState(
  subscriberId: string,
  creatorId: string,
): SubscriberDonationState {
  return {
    id: `sd-${subscriberId}-${creatorId}-${Date.now()}`,
    subscriberId,
    creatorId,
    currentTier: 0,
    minutesDonatedByTier: [0, 0, 0, 0, 0, 0],
    tierDonatedAt: [null, null, null, null, null, null],
    totalMinutesSpent: 0,
    totalMinutesReceived: 0,
    lastDonatedAt: null,
    fullDecayAt: null,
    isInCooldown: false,
    cooldownExpiresAt: null,
    ledgerEntryIds: [],
    createdAt: new Date().toISOString(),
  };
}
