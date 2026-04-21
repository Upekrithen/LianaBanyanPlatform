/**
 * Icing Pool Service
 *
 * Manages the bonus pool distributed to makers of popular recipes.
 *
 * The "Icing" system:
 * - Funded from 20% of LB's 16.7% margin on VOLUME INCREASES
 * - Only applies to recipes with 5,000+ orders (vetted)
 * - Distributed monthly to makers proportionally
 * - Separate from base earnings (this is bonus on top)
 */

import { supabase } from '@/integrations/supabase/client';

export interface IcingPool {
  id: string;
  period_start: string;
  period_end: string;
  period_type: 'weekly' | 'monthly' | 'quarterly';
  previous_period_volume: number;
  current_period_volume: number;
  volume_increase: number;
  lb_margin_rate: number;
  icing_rate: number;
  margin_from_increase: number;
  total_icing_pool: number;
  status: 'accumulating' | 'calculated' | 'distributed';
  calculated_at?: string;
  distributed_at?: string;
  created_at: string;
}

export interface IcingRecipeStats {
  id: string;
  pool_id: string;
  recipe_id?: string;
  portfolio_recipe_id?: string;
  previous_orders: number;
  current_orders: number;
  order_increase: number;
  previous_revenue: number;
  current_revenue: number;
  revenue_increase: number;
  icing_allocated: number;
}

export interface IcingDistribution {
  id: string;
  pool_id: string;
  recipe_stats_id: string;
  maker_id: string;
  maker_orders_count: number;
  total_recipe_orders: number;
  share_percentage: number;
  icing_amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paid_at?: string;
  payment_reference?: string;
}

// Constants
export const LB_MARGIN_RATE = 0.167; // 16.7%
export const ICING_RATE = 0.20; // 20% of margin from volume increase
export const VETTING_THRESHOLD = 5000; // Orders needed for recipe to qualify

/**
 * Calculate icing pool amount from volume increase
 */
export function calculateIcingPool(
  previousVolume: number,
  currentVolume: number
): {
  volumeIncrease: number;
  marginFromIncrease: number;
  icingPool: number;
} {
  const volumeIncrease = Math.max(0, currentVolume - previousVolume);
  const marginFromIncrease = volumeIncrease * LB_MARGIN_RATE;
  const icingPool = marginFromIncrease * ICING_RATE;

  return {
    volumeIncrease: Math.round(volumeIncrease * 100) / 100,
    marginFromIncrease: Math.round(marginFromIncrease * 100) / 100,
    icingPool: Math.round(icingPool * 100) / 100,
  };
}

/**
 * Calculate maker's share of icing for a recipe
 */
export function calculateMakerIcingShare(
  makerOrders: number,
  totalRecipeOrders: number,
  recipeIcingAllocation: number
): {
  sharePercentage: number;
  icingAmount: number;
} {
  if (totalRecipeOrders === 0) {
    return { sharePercentage: 0, icingAmount: 0 };
  }

  const sharePercentage = (makerOrders / totalRecipeOrders) * 100;
  const icingAmount = (makerOrders / totalRecipeOrders) * recipeIcingAllocation;

  return {
    sharePercentage: Math.round(sharePercentage * 100) / 100,
    icingAmount: Math.round(icingAmount * 100) / 100,
  };
}

/**
 * Calculate recipe's share of the icing pool based on volume increase
 */
export function calculateRecipeIcingAllocation(
  recipeVolumeIncrease: number,
  totalVolumeIncrease: number,
  totalIcingPool: number
): number {
  if (totalVolumeIncrease === 0) return 0;

  const share = (recipeVolumeIncrease / totalVolumeIncrease) * totalIcingPool;
  return Math.round(share * 100) / 100;
}

/**
 * Get current icing pool (accumulating period)
 */
export async function getCurrentIcingPool(): Promise<IcingPool | null> {
  try {
    // In production, query the most recent accumulating pool
    return null;
  } catch (error) {
    console.error('Error getting current icing pool:', error);
    return null;
  }
}

/**
 * Get icing distributions for a maker
 */
export async function getMakerIcingDistributions(
  makerId: string
): Promise<IcingDistribution[]> {
  try {
    // In production, query icing_distributions table
    return [];
  } catch (error) {
    console.error('Error getting maker icing distributions:', error);
    return [];
  }
}

/**
 * Get total icing earned by a maker
 */
export async function getTotalMakerIcing(
  makerId: string
): Promise<{
  totalEarned: number;
  pendingPayout: number;
  lastPayout?: {
    amount: number;
    date: string;
  };
}> {
  try {
    // In production, aggregate from icing_distributions
    return {
      totalEarned: 0,
      pendingPayout: 0,
    };
  } catch (error) {
    console.error('Error getting total maker icing:', error);
    return { totalEarned: 0, pendingPayout: 0 };
  }
}

/**
 * Check if a recipe qualifies for icing (vetted with 5K+ orders)
 */
export function isRecipeIcingEligible(totalOrders: number): boolean {
  return totalOrders >= VETTING_THRESHOLD;
}

/**
 * Format icing amount for display
 */
export function formatIcingAmount(amount: number): string {
  return `$${amount.toFixed(2)} Icing`;
}

/**
 * Get period label for an icing pool
 */
export function formatIcingPeriod(pool: IcingPool): string {
  const start = new Date(pool.period_start);
  const end = new Date(pool.period_end);

  if (pool.period_type === 'monthly') {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (pool.period_type === 'weekly') {
    return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else {
    return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
  }
}

/**
 * Calculate projected icing for a recipe based on current trends
 */
export function projectRecipeIcing(
  currentOrders: number,
  previousOrders: number,
  estimatedTotalPool: number,
  estimatedTotalIncrease: number
): number {
  const increase = Math.max(0, currentOrders - previousOrders);
  if (estimatedTotalIncrease === 0) return 0;

  const share = (increase / estimatedTotalIncrease) * estimatedTotalPool;
  return Math.round(share * 100) / 100;
}

/**
 * Get breakdown of icing calculation for transparency
 */
export function getIcingBreakdown(pool: IcingPool): {
  step1_volumeIncrease: string;
  step2_lbMargin: string;
  step3_icingRate: string;
  step4_totalPool: string;
} {
  return {
    step1_volumeIncrease: `Volume increase: $${pool.previous_period_volume.toFixed(2)} → $${pool.current_period_volume.toFixed(2)} = +$${pool.volume_increase.toFixed(2)}`,
    step2_lbMargin: `LB's margin from increase: $${pool.volume_increase.toFixed(2)} × ${(LB_MARGIN_RATE * 100).toFixed(1)}% = $${pool.margin_from_increase.toFixed(2)}`,
    step3_icingRate: `Icing pool rate: ${(ICING_RATE * 100).toFixed(0)}% of margin`,
    step4_totalPool: `Total Icing Pool: $${pool.margin_from_increase.toFixed(2)} × ${(ICING_RATE * 100).toFixed(0)}% = $${pool.total_icing_pool.toFixed(2)}`,
  };
}

/**
 * Get icing eligibility explanation for a recipe
 */
export function getIcingEligibilityExplanation(totalOrders: number): string {
  if (totalOrders >= VETTING_THRESHOLD) {
    return `This recipe is Icing-eligible with ${totalOrders.toLocaleString()} orders! Makers earn bonus Icing from volume growth.`;
  }

  const remaining = VETTING_THRESHOLD - totalOrders;
  const percentage = Math.round((totalOrders / VETTING_THRESHOLD) * 100);

  return `${remaining.toLocaleString()} more orders needed for Icing eligibility (${percentage}% there). Currently in Taste Tester phase.`;
}
