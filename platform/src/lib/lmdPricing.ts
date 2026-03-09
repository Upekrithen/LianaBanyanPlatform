/**
 * Let's Make Dinner — Pricing Tiers
 * ===================================
 * Standardized pricing based on order lead time:
 * - $5/serving — Preorder (48+ hours in advance)
 * - $10/serving — Day Before (6-48 hours)
 * - $15/serving — Rush (under 6 hours / prep time)
 * 
 * Chefs keep 83.3% — locked forever.
 */

export type PriceTier = 'preorder' | 'day-before' | 'rush' | 'charity';

export interface PriceTierInfo {
  price: number;
  tier: PriceTier;
  label: string;
  hoursOut: number;
  color: string;
  bgColor: string;
  description: string;
}

export const LMD_PRICING = {
  PREORDER: { 
    price: 5, 
    minHours: 48, 
    label: 'Preorder', 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Order 48+ hours ahead'
  },
  DAY_BEFORE: { 
    price: 10, 
    minHours: 6, 
    label: 'Day Before', 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Order 6-48 hours ahead'
  },
  RUSH: { 
    price: 15, 
    minHours: 0, 
    label: 'Rush', 
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    description: 'Under 6 hours'
  },
} as const;

/**
 * Calculate the price tier for a meal based on pickup datetime
 * @param pickupDate - The date of pickup (YYYY-MM-DD)
 * @param pickupTime - The time of pickup (HH:MM) - defaults to end of day
 * @param isCharity - If true, meal is free (charity)
 * @returns Pricing tier information
 */
export function calculateMealPrice(
  pickupDate: string,
  pickupTime?: string | null,
  isCharity: boolean = false
): PriceTierInfo {
  if (isCharity) {
    return {
      price: 0,
      tier: 'charity',
      label: 'Charity',
      hoursOut: 0,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      description: 'Free meal from community pool'
    };
  }

  const now = new Date();
  
  // Combine date and time
  const timeStr = pickupTime || '23:59';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const pickupDateTime = new Date(pickupDate);
  pickupDateTime.setHours(hours, minutes, 0, 0);
  
  const hoursOut = (pickupDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursOut >= 48) {
    return {
      price: LMD_PRICING.PREORDER.price,
      tier: 'preorder',
      label: LMD_PRICING.PREORDER.label,
      hoursOut,
      color: LMD_PRICING.PREORDER.color,
      bgColor: LMD_PRICING.PREORDER.bgColor,
      description: LMD_PRICING.PREORDER.description
    };
  }
  
  if (hoursOut >= 6) {
    return {
      price: LMD_PRICING.DAY_BEFORE.price,
      tier: 'day-before',
      label: LMD_PRICING.DAY_BEFORE.label,
      hoursOut,
      color: LMD_PRICING.DAY_BEFORE.color,
      bgColor: LMD_PRICING.DAY_BEFORE.bgColor,
      description: LMD_PRICING.DAY_BEFORE.description
    };
  }
  
  return {
    price: LMD_PRICING.RUSH.price,
    tier: 'rush',
    label: LMD_PRICING.RUSH.label,
    hoursOut: Math.max(0, hoursOut),
    color: LMD_PRICING.RUSH.color,
    bgColor: LMD_PRICING.RUSH.bgColor,
    description: LMD_PRICING.RUSH.description
  };
}

/**
 * Format hours until pickup into a readable string
 */
export function formatHoursUntilPickup(hoursOut: number): string {
  if (hoursOut < 0) return 'Pickup passed';
  if (hoursOut < 1) return `${Math.round(hoursOut * 60)} min`;
  if (hoursOut < 24) return `${Math.round(hoursOut)} hrs`;
  const days = Math.floor(hoursOut / 24);
  const remainingHours = Math.round(hoursOut % 24);
  if (remainingHours === 0) return `${days} day${days > 1 ? 's' : ''}`;
  return `${days}d ${remainingHours}h`;
}

/**
 * Get the next tier's price and time remaining
 * Useful for showing "Order within X hours to save $Y"
 */
export function getNextTierInfo(hoursOut: number): { 
  currentPrice: number; 
  nextPrice: number;
  hoursUntilNextTier: number;
  message: string;
} | null {
  if (hoursOut >= 48) {
    return {
      currentPrice: 5,
      nextPrice: 10,
      hoursUntilNextTier: hoursOut - 48,
      message: `Order now for $5 (${formatHoursUntilPickup(hoursOut - 48)} until price increases)`
    };
  }
  
  if (hoursOut >= 6) {
    return {
      currentPrice: 10,
      nextPrice: 15,
      hoursUntilNextTier: hoursOut - 6,
      message: `$10 now (${formatHoursUntilPickup(hoursOut - 6)} until rush pricing)`
    };
  }
  
  return null; // Already at rush pricing
}

/**
 * Calculate chef earnings (83.3% of price)
 */
export function calculateChefEarnings(price: number): number {
  return Number((price * 0.833).toFixed(2));
}

/**
 * Calculate LB margin (16.7% of price) - used for recipe credits
 */
export function calculateLBMargin(price: number): number {
  return Number((price * 0.167).toFixed(2));
}
