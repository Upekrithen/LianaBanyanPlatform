/**
 * ATTENTION RESERVE BIDDING — The Radio Contest
 * ================================================
 * "A vigilant community member with 10 Credits ready can capture
 * opportunity before a distracted participant with 10,000 Credits."
 *
 * Innovation #2  — Democratic Funding / Position Funding (original)
 * Innovation #1423 — Attention Reserve Bidding (extension)
 *
 * Rules:
 *   - 2/3 of capacity: OPEN BIDDING (anyone, highest commitment wins)
 *   - 1/3 of capacity: RESERVED (small participants only, first-come-first-served)
 *
 * The 1/3 reserve is a FLOOR, not a ceiling:
 *   - If enough small participants arrive early, they can capture from
 *     the open 2/3 AS WELL (bidding is open to everyone)
 *   - Theoretical max: 100% goes to small participants
 *   - Guaranteed min: 33.3% goes to small participants
 *
 * The Radio Contest Metaphor:
 *   - You can't BUY tickets. You have to LISTEN.
 *   - The person who camps at 5 AM beats the rich person at 9 AM.
 *   - Attention is the only equalizer.
 *
 * "Enemies at the Gate" Protection:
 *   - If you bid big, you deliver big or you pay for it.
 *   - Your Marks/Credits/Joules are yours to use as you see fit.
 *   - But the platform remembers who delivers and who doesn't.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type BidCurrency = 'credits' | 'marks' | 'joules';
export type BidTier = 'open' | 'reserved';
export type BidStatus = 'active' | 'won' | 'outbid' | 'expired' | 'cancelled';
export type AuctionStatus = 'draft' | 'open' | 'closed' | 'fulfilled' | 'cancelled';

export interface AuctionItem {
  id: string;
  /** What's being auctioned (product, service, slot, opportunity) */
  title: string;
  description: string;
  category: string;
  /** Total available capacity (e.g., 90 tournament slots) */
  totalCapacity: number;
  /** Calculated: Math.floor(totalCapacity * 2/3) */
  openCapacity: number;
  /** Calculated: totalCapacity - openCapacity */
  reservedCapacity: number;
  /** Maximum currency balance to qualify for reserved tier */
  reserveThreshold: number;
  /** Minimum bid (open tier) */
  minimumBid: number;
  /** Accepted currencies */
  acceptedCurrencies: BidCurrency[];
  /** Auction timing */
  opensAt: string;
  closesAt: string;
  status: AuctionStatus;
  /** Creator */
  createdBy: string;
  createdAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName?: string;
  /** Which tier this bid is in */
  tier: BidTier;
  /** Amount bid */
  amount: number;
  /** Currency used */
  currency: BidCurrency;
  /** When the bid was placed (crucial for first-come-first-served) */
  placedAt: string;
  status: BidStatus;
  /** Bidder's total balance at time of bid (for threshold check) */
  bidderBalance: number;
}

export interface AuctionResult {
  auctionId: string;
  totalBids: number;
  openWinners: Bid[];
  reservedWinners: Bid[];
  /** Small participants who also won open slots */
  overflowWinners: Bid[];
  /** Stats */
  smallParticipantPercentage: number;
  largestBid: number;
  smallestWinningBid: number;
}

// ============================================================================
// CAPACITY CALCULATION
// ============================================================================

/**
 * Calculate open and reserved capacity for an auction.
 *
 * Open tier gets 2/3 (rounded down).
 * Reserved tier gets the remainder (always ≥ 1/3).
 */
export function calculateCapacity(totalCapacity: number): {
  open: number;
  reserved: number;
} {
  const open = Math.floor(totalCapacity * (2 / 3));
  const reserved = totalCapacity - open;
  return { open, reserved };
}

// ============================================================================
// BID PLACEMENT
// ============================================================================

/**
 * Determine which tier a bidder qualifies for.
 *
 * If their total balance (across all currencies) is at or below
 * the reserve threshold, they qualify for the reserved tier AND
 * can also bid in the open tier.
 */
export function determineBidTier(
  bidderTotalBalance: number,
  reserveThreshold: number,
): BidTier[] {
  if (bidderTotalBalance <= reserveThreshold) {
    // Small participant: can bid in BOTH tiers
    return ['reserved', 'open'];
  }
  // Large participant: open tier only
  return ['open'];
}

/**
 * Check if a bid is valid.
 */
export function validateBid(
  bid: Omit<Bid, 'id' | 'status'>,
  auction: AuctionItem,
): { valid: boolean; error?: string } {
  // Check auction is open
  const now = new Date();
  if (now < new Date(auction.opensAt)) {
    return { valid: false, error: 'Auction has not opened yet.' };
  }
  if (now > new Date(auction.closesAt)) {
    return { valid: false, error: 'Auction has closed.' };
  }
  if (auction.status !== 'open') {
    return { valid: false, error: 'Auction is not accepting bids.' };
  }

  // Check currency is accepted
  if (!auction.acceptedCurrencies.includes(bid.currency)) {
    return { valid: false, error: `${bid.currency} is not accepted for this auction.` };
  }

  // Check minimum bid (open tier only)
  if (bid.tier === 'open' && bid.amount < auction.minimumBid) {
    return { valid: false, error: `Minimum bid is ${auction.minimumBid}.` };
  }

  // Check reserve eligibility
  if (bid.tier === 'reserved' && bid.bidderBalance > auction.reserveThreshold) {
    return { valid: false, error: 'Your balance exceeds the reserve threshold for this auction.' };
  }

  return { valid: true };
}

// ============================================================================
// AUCTION RESOLUTION
// ============================================================================

/**
 * Resolve an auction — determine winners.
 *
 * Open tier: sorted by bid amount (highest first)
 * Reserved tier: sorted by placement time (earliest first — the Radio Contest)
 *
 * Overflow: If reserved tier has remaining capacity AND open tier is full,
 * small participants can overflow into open tier by time priority.
 */
export function resolveAuction(
  auction: AuctionItem,
  bids: Bid[],
): AuctionResult {
  const { open: openCapacity, reserved: reservedCapacity } = calculateCapacity(auction.totalCapacity);

  // Separate bids by tier
  const openBids = bids
    .filter(b => b.tier === 'open' && b.status === 'active')
    .sort((a, b) => b.amount - a.amount); // Highest first

  const reservedBids = bids
    .filter(b => b.tier === 'reserved' && b.status === 'active')
    .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime()); // Earliest first

  // Assign reserved winners (first-come-first-served)
  const reservedWinners = reservedBids.slice(0, reservedCapacity);

  // Assign open winners (highest bid)
  const openWinners = openBids.slice(0, openCapacity);

  // OVERFLOW: Small participants who didn't get a reserved slot
  // can still win open slots if they bid high enough
  const reservedLosers = reservedBids.slice(reservedCapacity);
  const openRemaining = openCapacity - openWinners.length;
  const overflowWinners: Bid[] = [];

  if (openRemaining > 0 && reservedLosers.length > 0) {
    // Sort remaining reserved bidders by time (earliest first)
    // They compete for remaining open slots
    const overflow = reservedLosers.slice(0, openRemaining);
    overflowWinners.push(...overflow);
  }

  // Additionally: if there are EXTRA reserved slots (not enough small
  // participants showed up), those slots convert to open
  const unusedReserved = reservedCapacity - reservedWinners.length;
  if (unusedReserved > 0) {
    // Extra open slots from unused reserve
    const extraOpen = openBids.slice(openCapacity, openCapacity + unusedReserved);
    openWinners.push(...extraOpen);
  }

  // Calculate stats
  const allWinners = [...reservedWinners, ...openWinners, ...overflowWinners];
  const smallWinners = allWinners.filter(b =>
    b.bidderBalance <= auction.reserveThreshold
  );

  return {
    auctionId: auction.id,
    totalBids: bids.length,
    openWinners,
    reservedWinners,
    overflowWinners,
    smallParticipantPercentage: allWinners.length > 0
      ? Math.round((smallWinners.length / allWinners.length) * 100)
      : 0,
    largestBid: Math.max(...bids.map(b => b.amount), 0),
    smallestWinningBid: allWinners.length > 0
      ? Math.min(...allWinners.map(b => b.amount))
      : 0,
  };
}

// ============================================================================
// RESERVE THRESHOLD CALCULATION
// ============================================================================

/**
 * Calculate the reserve threshold for an auction.
 *
 * Default: 10% of the average bid amount expected, or a fixed
 * threshold set by the auction creator.
 *
 * The threshold determines who counts as a "small participant."
 * Below threshold = can access reserved 1/3.
 */
export function suggestReserveThreshold(
  minimumBid: number,
  expectedAverageBid?: number,
): number {
  if (expectedAverageBid) {
    return Math.floor(expectedAverageBid * 0.1);
  }
  // Default: 2x the minimum bid
  return minimumBid * 2;
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Get a human-readable description of the auction's fairness structure.
 */
export function getAuctionFairnessLabel(auction: AuctionItem): string {
  const { open, reserved } = calculateCapacity(auction.totalCapacity);
  return `${open} open slots (bid to win) + ${reserved} reserved slots (first-come for balances ≤ ${auction.reserveThreshold})`;
}

/**
 * Get the Radio Contest metaphor explanation.
 */
export function getRadioContestExplanation(): string {
  return (
    'Like a radio call-in contest: you can\'t buy the prize. You have to listen. ' +
    'The person who shows up at 5 AM beats the wealthy person sleeping until 9 AM. ' +
    'The reserved 1/3 guarantees small participants always get a bite at the apple.'
  );
}

/**
 * Format bid currency display.
 */
export function formatBidAmount(amount: number, currency: BidCurrency): string {
  const symbols: Record<BidCurrency, string> = {
    credits: 'Ↄ‖',
    marks: 'Ↄ‖',
    joules: 'Ↄ‖',
  };
  const suffixes: Record<BidCurrency, string> = {
    credits: 'Cr',
    marks: 'Mk',
    joules: 'J',
  };
  return `${symbols[currency]}${amount.toLocaleString()} ${suffixes[currency]}`;
}

// ============================================================================
// REPUTATION TRACKING (Enemies at the Gate)
// ============================================================================

export interface BidderReputation {
  userId: string;
  totalBidsPlaced: number;
  totalBidsWon: number;
  totalDelivered: number;
  totalFailed: number;
  /** Delivery rate: delivered / won */
  deliveryRate: number;
  /** Penalty: Marks/Credits/Joules lost from failed deliveries */
  totalPenalties: number;
}

/**
 * Calculate delivery rate for reputation display.
 * "If you bid big, you deliver big, or you pay for it."
 */
export function calculateDeliveryRate(
  delivered: number,
  won: number,
): number {
  if (won === 0) return 1.0; // No history = benefit of the doubt
  return delivered / won;
}

/**
 * Determine if a bidder should be flagged for review.
 * Below 80% delivery rate triggers a warning.
 * Below 50% triggers a temporary bid restriction.
 */
export function getBidderReputationStatus(
  rep: BidderReputation,
): 'good' | 'warning' | 'restricted' {
  if (rep.deliveryRate >= 0.8) return 'good';
  if (rep.deliveryRate >= 0.5) return 'warning';
  return 'restricted';
}
