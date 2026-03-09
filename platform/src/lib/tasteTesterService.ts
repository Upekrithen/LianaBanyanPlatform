/**
 * Taste Tester Service
 * 
 * Manages the early adopter reward system for trying new/experimental recipes.
 * 
 * Rules:
 * - First 5,000 orders of a recipe qualify for Taste Tester rewards
 * - Rewards: Marks + Reputation Points (diminishing scale)
 * - When user has 10+ recipes they tested that all reached 5K, they become "Master Taster"
 * - Master Taster: All accumulated Marks convert to Credits
 */

import { supabase } from '@/integrations/supabase/client';

export interface TasteTesterReward {
  marks: number;
  reputation: number;
}

export interface TasteTesterRecord {
  id: string;
  user_id: string;
  recipe_id?: string;
  portfolio_recipe_id?: string;
  order_id: string;
  order_number: number;
  ordered_at: string;
  marks_earned: number;
  reputation_earned: number;
  recipe_reached_5k: boolean;
  recipe_reached_5k_at?: string;
  converted_to_credits: boolean;
  converted_at?: string;
  credits_received: number;
}

export interface TasteTesterStats {
  user_id: string;
  total_recipes_tested: number;
  total_marks_earned: number;
  total_reputation_earned: number;
  current_marks_balance: number;
  total_marks_converted: number;
  total_credits_from_conversion: number;
  recipes_reached_5k: number;
  is_master_taster: boolean;
  master_taster_achieved_at?: string;
}

// Taste tester reward tiers (diminishing returns)
export const TASTE_TESTER_TIERS = [
  { maxOrder: 100, marks: 5, reputation: 10 },
  { maxOrder: 500, marks: 3, reputation: 5 },
  { maxOrder: 2000, marks: 2, reputation: 3 },
  { maxOrder: 5000, marks: 1, reputation: 1 },
];

export const MASTER_TASTER_THRESHOLD = 10; // 10 successful recipes needed
export const VETTING_THRESHOLD = 5000; // Orders needed to vet a recipe

/**
 * Calculate rewards for a taste test based on order number
 */
export function calculateTasteTesterReward(orderNumber: number): TasteTesterReward {
  if (orderNumber > VETTING_THRESHOLD) {
    return { marks: 0, reputation: 0 };
  }
  
  for (const tier of TASTE_TESTER_TIERS) {
    if (orderNumber <= tier.maxOrder) {
      return { marks: tier.marks, reputation: tier.reputation };
    }
  }
  
  return { marks: 0, reputation: 0 };
}

/**
 * Check if a recipe is eligible for taste tester rewards
 */
export function isRecipeEligibleForTasteTesting(totalOrders: number): boolean {
  return totalOrders < VETTING_THRESHOLD;
}

/**
 * Get the current order number for a recipe (for taste tester tracking)
 */
export async function getRecipeOrderCount(
  recipeId: string,
  isPortfolio: boolean = false
): Promise<number> {
  try {
    // In production, query actual order count from database
    // For now, return a placeholder
    return 0;
  } catch (error) {
    console.error('Error getting recipe order count:', error);
    return 0;
  }
}

/**
 * Record a taste test (when user orders a recipe in testing phase)
 */
export async function recordTasteTest(
  recipeId: string,
  orderId: string,
  orderNumber: number,
  isPortfolio: boolean = false
): Promise<{ record?: TasteTesterRecord; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: 'Not authenticated' };
    }

    const reward = calculateTasteTesterReward(orderNumber);
    
    if (reward.marks === 0 && reward.reputation === 0) {
      return { error: 'Recipe no longer in testing phase' };
    }
    
    const record: TasteTesterRecord = {
      id: `tt-${Date.now()}`,
      user_id: userData.user.id,
      recipe_id: isPortfolio ? undefined : recipeId,
      portfolio_recipe_id: isPortfolio ? recipeId : undefined,
      order_id: orderId,
      order_number: orderNumber,
      ordered_at: new Date().toISOString(),
      marks_earned: reward.marks,
      reputation_earned: reward.reputation,
      recipe_reached_5k: false,
      converted_to_credits: false,
      credits_received: 0,
    };
    
    // INFRASTRUCTURE NOTE: This function needs to insert the taste test record
    // into the taste_test_records table in Supabase
    
    return { record };
  } catch (error) {
    console.error('Error recording taste test:', error);
    return { error: 'Failed to record taste test' };
  }
}

/**
 * Check if user is eligible for Master Taster status
 */
export async function checkMasterTasterEligibility(
  userId: string
): Promise<{ eligible: boolean; recipesReached5k: number }> {
  try {
    // In production, query actual count from database
    const recipesReached5k = 0;
    
    return {
      eligible: recipesReached5k >= MASTER_TASTER_THRESHOLD,
      recipesReached5k,
    };
  } catch (error) {
    console.error('Error checking master taster eligibility:', error);
    return { eligible: false, recipesReached5k: 0 };
  }
}

/**
 * Convert marks to credits when user achieves Master Taster
 */
export async function convertMarksToCredits(
  userId: string
): Promise<{ credits: number; error?: string }> {
  try {
    const { eligible } = await checkMasterTasterEligibility(userId);
    
    if (!eligible) {
      return { credits: 0, error: 'Not eligible for Master Taster status' };
    }
    
    // In production:
    // 1. Get current marks balance
    // 2. Convert to credits (1:1 ratio)
    // 3. Update user's credits
    // 4. Reset marks balance
    // 5. Set Master Taster status
    
    return { credits: 0 }; // Placeholder
  } catch (error) {
    console.error('Error converting marks to credits:', error);
    return { credits: 0, error: 'Failed to convert marks' };
  }
}

/**
 * Get taste tester stats for a user
 */
export async function getTasteTesterStats(
  userId: string
): Promise<TasteTesterStats | null> {
  try {
    // In production, query from user_taste_tester_stats table
    return null;
  } catch (error) {
    console.error('Error getting taste tester stats:', error);
    return null;
  }
}

/**
 * Get taste test history for a user
 */
export async function getTasteTesterHistory(
  userId: string
): Promise<TasteTesterRecord[]> {
  try {
    // In production, query from taste_tester_records table
    return [];
  } catch (error) {
    console.error('Error getting taste tester history:', error);
    return [];
  }
}

/**
 * Calculate progress towards Master Taster
 */
export function calculateMasterTasterProgress(
  recipesReached5k: number
): {
  current: number;
  required: number;
  percentage: number;
  remaining: number;
} {
  return {
    current: recipesReached5k,
    required: MASTER_TASTER_THRESHOLD,
    percentage: Math.min(100, (recipesReached5k / MASTER_TASTER_THRESHOLD) * 100),
    remaining: Math.max(0, MASTER_TASTER_THRESHOLD - recipesReached5k),
  };
}

/**
 * Format taste tester reward for display
 */
export function formatTasteTesterReward(reward: TasteTesterReward): string {
  if (reward.marks === 0 && reward.reputation === 0) {
    return 'No reward (recipe already vetted)';
  }
  
  const parts: string[] = [];
  if (reward.marks > 0) parts.push(`${reward.marks} Marks`);
  if (reward.reputation > 0) parts.push(`${reward.reputation} Rep`);
  
  return parts.join(' + ');
}

/**
 * Get explanation text for taste tester rewards at current order number
 */
export function getTasteTesterExplanation(orderNumber: number): string {
  if (orderNumber <= 100) {
    return 'Early adopter! You\'re among the first 100 to try this recipe. Max rewards!';
  } else if (orderNumber <= 500) {
    return 'Pioneer taster! You\'re in the first 500 orders. Great rewards!';
  } else if (orderNumber <= 2000) {
    return 'Recipe explorer! Helping establish this recipe. Good rewards!';
  } else if (orderNumber <= 5000) {
    return 'Final stretch! Recipe almost vetted. Standard rewards.';
  } else {
    return 'This recipe has been fully vetted (5,000+ orders). No taste tester rewards.';
  }
}
