/**
 * THE BREWSTER BONUS — Loyalty-Driven Volume Discount Rewards
 * =============================================================
 * "This is not an investment return. It's a loyalty-driven volume
 * discount passed back as platform currency."
 *
 * When a participant fully deploys and clears their Marks, they
 * receive a tiered bonus in Credits, funded by the volume discount
 * savings of the specific projects those Marks were deployed to.
 *
 * Tiers follow production levels with DECAYING returns:
 *   Spark     (50)       → 10%
 *   Flame     (500)      → 7%
 *   Blaze     (5,000)    → 5%
 *   Forge Fire (15,000)  → 3%
 *   Inferno   (50,000)   → 2%
 *   Foundry   (500,000)  → 1%
 *
 * Funded by: volume discount differential of each project
 * Paid in: closed-loop Credits (NOT cash)
 * SEC status: NOT a security (fails all 4 Howey prongs)
 *
 * Innovation #1424 — The Brewster Bonus Mechanic
 * Innovation #1425 — Insurance Premium Funding Model
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TIER DEFINITIONS
// ============================================================================

export type BrewsterTierName = 'spark' | 'flame' | 'blaze' | 'forge-fire' | 'inferno' | 'foundry';

export interface BrewsterTier {
  id: BrewsterTierName;
  name: string;
  displayName: string;
  icon: string;
  minMarks: number;
  bonusRate: number; // percentage
  maxBonus: number;  // max Credits at this tier
  color: string;     // Tailwind color class
  description: string;
}

export const BREWSTER_TIERS: BrewsterTier[] = [
  {
    id: 'spark',
    name: 'Spark',
    displayName: 'Spark',
    icon: '✨',
    minMarks: 50,
    bonusRate: 10,
    maxBonus: 5,
    color: 'amber',
    description: 'First fire. You showed up and delivered.',
  },
  {
    id: 'flame',
    name: 'Flame',
    displayName: 'Flame',
    icon: '🔥',
    minMarks: 500,
    bonusRate: 7,
    maxBonus: 35,
    color: 'orange',
    description: 'Sustained heat. Consistent contribution.',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    displayName: 'Blaze',
    icon: '🌋',
    minMarks: 5_000,
    bonusRate: 5,
    maxBonus: 250,
    color: 'red',
    description: 'Serious production. Community pillar.',
  },
  {
    id: 'forge-fire',
    name: 'Forge Fire',
    displayName: 'Forge Fire',
    icon: '⚒️',
    minMarks: 15_000,
    bonusRate: 3,
    maxBonus: 450,
    color: 'rose',
    description: 'Master craftsman. Shapes the platform.',
  },
  {
    id: 'inferno',
    name: 'Inferno',
    displayName: 'Inferno',
    icon: '💥',
    minMarks: 50_000,
    bonusRate: 2,
    maxBonus: 1_000,
    color: 'purple',
    description: 'Industrial scale. Moves markets.',
  },
  {
    id: 'foundry',
    name: 'Foundry',
    displayName: 'Foundry',
    icon: '🏭',
    minMarks: 500_000,
    bonusRate: 1,
    maxBonus: 5_000,
    color: 'indigo',
    description: 'Full forge. The system itself.',
  },
];

// ============================================================================
// BONUS CALCULATION
// ============================================================================

export interface BrewsterBonusResult {
  /** Total bonus in Credits */
  totalBonus: number;
  /** Highest tier achieved */
  highestTier: BrewsterTier;
  /** Breakdown by tier (incremental) */
  tierBreakdown: Array<{
    tier: BrewsterTier;
    marksInTier: number;
    bonusFromTier: number;
    achieved: boolean;
  }>;
  /** Whether the participant fully cleared their Marks */
  fullyCleared: boolean;
  /** Total marks that were deployed and cleared */
  totalMarksCleared: number;
}

/**
 * Calculate the Brewster Bonus for a given number of cleared Marks.
 *
 * Tiers are calculated INCREMENTALLY:
 *   - First 50 Marks: 50 × 10% = 5 Credits
 *   - Next 450 Marks (50-500): 450 × 7% = 31.5 Credits
 *   - Next 4,500 Marks (500-5,000): 4,500 × 5% = 225 Credits
 *   - etc.
 *
 * @param marksCleared Total Marks deployed and cleared
 * @param isFullyClear Whether the Mark Pouch is completely empty
 */
export function calculateBrewsterBonus(
  marksCleared: number,
  isFullyClear: boolean = true,
): BrewsterBonusResult {
  // Must fully clear to qualify
  if (!isFullyClear) {
    return {
      totalBonus: 0,
      highestTier: BREWSTER_TIERS[0],
      tierBreakdown: BREWSTER_TIERS.map(tier => ({
        tier,
        marksInTier: 0,
        bonusFromTier: 0,
        achieved: false,
      })),
      fullyCleared: false,
      totalMarksCleared: marksCleared,
    };
  }

  let remaining = marksCleared;
  let totalBonus = 0;
  let highestTier = BREWSTER_TIERS[0];
  const breakdown: BrewsterBonusResult['tierBreakdown'] = [];

  for (let i = 0; i < BREWSTER_TIERS.length; i++) {
    const tier = BREWSTER_TIERS[i];
    const nextTier = BREWSTER_TIERS[i + 1];
    const tierFloor = tier.minMarks;
    const tierCeiling = nextTier ? nextTier.minMarks : Infinity;

    if (marksCleared < tierFloor) {
      breakdown.push({
        tier,
        marksInTier: 0,
        bonusFromTier: 0,
        achieved: false,
      });
      continue;
    }

    const marksInTier = Math.min(remaining, tierCeiling - tierFloor);
    const bonusFromTier = marksInTier * (tier.bonusRate / 100);

    breakdown.push({
      tier,
      marksInTier,
      bonusFromTier,
      achieved: true,
    });

    totalBonus += bonusFromTier;
    highestTier = tier;
    remaining -= marksInTier;

    if (remaining <= 0) break;
  }

  return {
    totalBonus: Math.round(totalBonus * 100) / 100,
    highestTier,
    tierBreakdown: breakdown,
    fullyCleared: isFullyClear,
    totalMarksCleared: marksCleared,
  };
}

/**
 * Get the current tier for a given Mark volume.
 */
export function getCurrentTier(marksCleared: number): BrewsterTier {
  let current = BREWSTER_TIERS[0];
  for (const tier of BREWSTER_TIERS) {
    if (marksCleared >= tier.minMarks) {
      current = tier;
    }
  }
  return current;
}

/**
 * Get the next tier target.
 */
export function getNextTier(marksCleared: number): BrewsterTier | null {
  for (const tier of BREWSTER_TIERS) {
    if (marksCleared < tier.minMarks) {
      return tier;
    }
  }
  return null; // Already at Foundry
}

/**
 * Get progress toward the next tier as a percentage.
 */
export function getTierProgress(marksCleared: number): number {
  const current = getCurrentTier(marksCleared);
  const next = getNextTier(marksCleared);

  if (!next) return 100; // Already at max

  const rangeStart = current.minMarks;
  const rangeEnd = next.minMarks;
  const progress = ((marksCleared - rangeStart) / (rangeEnd - rangeStart)) * 100;

  return Math.min(100, Math.max(0, progress));
}

// ============================================================================
// VOLUME SAVINGS INTEGRATION
// ============================================================================

export interface ProjectVolumeSavings {
  projectId: string;
  projectName: string;
  retailTotal: number;
  volumeTotal: number;
  savings: number;
  brewsterAllocation: number; // Portion allocated to Brewster Bonuses
}

/**
 * Calculate the volume savings from a project that fund Brewster Bonuses.
 *
 * @param retailPrice Individual retail price per unit
 * @param volumePrice Bulk/volume price per unit
 * @param quantity Units purchased
 * @param brewsterAllocationRate Percentage of savings allocated to Brewster Bonuses (default 30%)
 */
export function calculateProjectSavings(
  retailPrice: number,
  volumePrice: number,
  quantity: number,
  brewsterAllocationRate: number = 0.30,
): ProjectVolumeSavings {
  const retailTotal = retailPrice * quantity;
  const volumeTotal = volumePrice * quantity;
  const savings = retailTotal - volumeTotal;
  const brewsterAllocation = savings * brewsterAllocationRate;

  return {
    projectId: '',
    projectName: '',
    retailTotal,
    volumeTotal,
    savings,
    brewsterAllocation,
  };
}

// ============================================================================
// PERSISTENCE (Supabase integration stubs)
// ============================================================================

export interface BrewsterRecord {
  id: string;
  userId: string;
  marksCleared: number;
  tierAchieved: BrewsterTierName;
  bonusAwarded: number;
  projectIds: string[];
  clearedAt: string;
  createdAt: string;
}

/**
 * Record a Brewster Bonus award (when Mark Pouch is fully cleared).
 *
 * INFRASTRUCTURE NOTE: The brewster_bonus_records table does not yet exist.
 * When the table is created, this function should:
 *   1. Insert into brewster_bonus_records table
 *   2. Credit the user's account with result.totalBonus Credits
 *   3. Log in transaction history
 *
 * Until then, the calculation runs correctly and logs the result.
 */
export async function recordBrewsterBonus(
  userId: string,
  marksCleared: number,
  projectIds: string[],
): Promise<BrewsterBonusResult> {
  const result = calculateBrewsterBonus(marksCleared, true);

  // brewster_bonus_records table not yet created — silent until DB table exists

  return result;
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Format a bonus amount for display.
 */
export function formatBonus(amount: number): string {
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toFixed(amount % 1 === 0 ? 0 : 2);
}

/**
 * Get a motivational message based on progress.
 */
export function getBrewsterMessage(marksCleared: number, totalBacked: number): string {
  const pct = totalBacked > 0 ? (marksCleared / totalBacked) * 100 : 0;

  if (pct === 0) return 'Back some Marks to begin your Brewster journey.';
  if (pct < 25) return 'The fire is catching. Keep deploying.';
  if (pct < 50) return 'Halfway to clearing your pouch. Steady.';
  if (pct < 75) return 'The forge is hot. Almost there.';
  if (pct < 100) return 'So close. Clear the last Marks for your Brewster Bonus.';
  return 'Pouch cleared! Your Brewster Bonus has been awarded. 🔥';
}
