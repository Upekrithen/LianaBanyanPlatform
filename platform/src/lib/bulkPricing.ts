/**
 * Bulk Pricing Utility for Packed Lunches and Baked Goods
 * 
 * Handles:
 * - Volume discount tiers (5+ = 5%, 10+ = 10%, 20+ = 15%, 40+ = 20%)
 * - Increment ordering (order in multiples of 5 for packed lunches)
 * - Mixed orders (bulk + individual pricing)
 * - Baked goods categories (cookies, cakes, breads, etc.)
 */

export type OfferingType = 'standard' | 'packed_lunch' | 'baked_goods' | 'catering';

export interface VolumeDiscountTier {
  min_qty: number;
  discount_percent: number;
}

// Default volume discount tiers
export const DEFAULT_VOLUME_TIERS: VolumeDiscountTier[] = [
  { min_qty: 5, discount_percent: 5 },
  { min_qty: 10, discount_percent: 10 },
  { min_qty: 20, discount_percent: 15 },
  { min_qty: 40, discount_percent: 20 },
];

// Cottage law food categories
export const BAKED_GOODS_CATEGORIES = [
  'cookies',
  'cakes',
  'cupcakes',
  'breads',
  'muffins',
  'brownies',
  'pastries',
  'pies',
  'biscuits',
  'scones',
  'granola',
  'candy',
  'jams',
  'jellies',
  'honey',
  'other',
] as const;

export type BakedGoodsCategory = typeof BAKED_GOODS_CATEGORIES[number];

// Bulk increment defaults by offering type
export const BULK_INCREMENTS: Record<OfferingType, number> = {
  standard: 1,
  packed_lunch: 5,
  baked_goods: 6, // Half-dozen
  catering: 10,
};

export const BULK_MINIMUMS: Record<OfferingType, number> = {
  standard: 1,
  packed_lunch: 1,
  baked_goods: 1,
  catering: 10,
};

export interface BulkOrderCalculation {
  quantity: number;
  unitPrice: number;
  baseTotal: number;
  
  // Bulk portion
  bulkUnits: number;
  bulkUnitPrice: number;
  bulkDiscount: number;
  bulkTotal: number;
  
  // Individual portion (for mixed orders)
  individualUnits: number;
  individualUnitPrice: number;
  individualTotal: number;
  
  // Final totals
  discountAmount: number;
  discountPercent: number;
  finalTotal: number;
  
  // Savings info
  savings: number;
  savingsPercent: number;
}

/**
 * Get the applicable discount tier for a given quantity
 */
export function getDiscountTier(
  quantity: number,
  tiers: VolumeDiscountTier[] = DEFAULT_VOLUME_TIERS
): VolumeDiscountTier | null {
  // Sort tiers by min_qty descending to find highest applicable
  const sortedTiers = [...tiers].sort((a, b) => b.min_qty - a.min_qty);
  
  for (const tier of sortedTiers) {
    if (quantity >= tier.min_qty) {
      return tier;
    }
  }
  
  return null;
}

/**
 * Calculate bulk order pricing with mixed order support
 * 
 * Example: 43 packed lunches
 * - 40 at 20% discount (bulk)
 * - 3 at full price (individual)
 */
export function calculateBulkOrder(
  quantity: number,
  unitPrice: number,
  offeringType: OfferingType = 'standard',
  customTiers?: VolumeDiscountTier[]
): BulkOrderCalculation {
  const tiers = customTiers || DEFAULT_VOLUME_TIERS;
  const baseTotal = quantity * unitPrice;
  
  // Find the highest tier that applies
  const discountTier = getDiscountTier(quantity, tiers);
  
  if (!discountTier) {
    // No discount applies
    return {
      quantity,
      unitPrice,
      baseTotal,
      bulkUnits: 0,
      bulkUnitPrice: unitPrice,
      bulkDiscount: 0,
      bulkTotal: 0,
      individualUnits: quantity,
      individualUnitPrice: unitPrice,
      individualTotal: baseTotal,
      discountAmount: 0,
      discountPercent: 0,
      finalTotal: baseTotal,
      savings: 0,
      savingsPercent: 0,
    };
  }
  
  // For mixed orders: bulk portion gets discount, remainder is full price
  const bulkUnits = Math.floor(quantity / discountTier.min_qty) * discountTier.min_qty;
  const individualUnits = quantity - bulkUnits;
  
  // Calculate bulk portion
  const discountMultiplier = 1 - (discountTier.discount_percent / 100);
  const bulkUnitPrice = unitPrice * discountMultiplier;
  const bulkTotal = bulkUnits * bulkUnitPrice;
  
  // Calculate individual portion (full price)
  const individualTotal = individualUnits * unitPrice;
  
  // Final calculation
  const finalTotal = bulkTotal + individualTotal;
  const discountAmount = baseTotal - finalTotal;
  const discountPercent = (discountAmount / baseTotal) * 100;
  
  return {
    quantity,
    unitPrice,
    baseTotal,
    bulkUnits,
    bulkUnitPrice,
    bulkDiscount: discountTier.discount_percent,
    bulkTotal,
    individualUnits,
    individualUnitPrice: unitPrice,
    individualTotal,
    discountAmount,
    discountPercent,
    finalTotal,
    savings: discountAmount,
    savingsPercent: discountPercent,
  };
}

/**
 * Calculate pricing with simple discount (all units same price)
 */
export function calculateSimpleBulkDiscount(
  quantity: number,
  unitPrice: number,
  customTiers?: VolumeDiscountTier[]
): {
  quantity: number;
  unitPrice: number;
  discountedUnitPrice: number;
  discountPercent: number;
  baseTotal: number;
  finalTotal: number;
  savings: number;
} {
  const tiers = customTiers || DEFAULT_VOLUME_TIERS;
  const discountTier = getDiscountTier(quantity, tiers);
  
  const baseTotal = quantity * unitPrice;
  
  if (!discountTier) {
    return {
      quantity,
      unitPrice,
      discountedUnitPrice: unitPrice,
      discountPercent: 0,
      baseTotal,
      finalTotal: baseTotal,
      savings: 0,
    };
  }
  
  const discountMultiplier = 1 - (discountTier.discount_percent / 100);
  const discountedUnitPrice = unitPrice * discountMultiplier;
  const finalTotal = quantity * discountedUnitPrice;
  
  return {
    quantity,
    unitPrice,
    discountedUnitPrice,
    discountPercent: discountTier.discount_percent,
    baseTotal,
    finalTotal,
    savings: baseTotal - finalTotal,
  };
}

/**
 * Format bulk pricing for display
 */
export function formatBulkPricing(calc: BulkOrderCalculation): string {
  if (calc.bulkUnits === 0) {
    return `${calc.quantity} × $${calc.unitPrice.toFixed(2)} = $${calc.finalTotal.toFixed(2)}`;
  }
  
  let result = '';
  
  if (calc.bulkUnits > 0) {
    result += `${calc.bulkUnits} × $${calc.bulkUnitPrice.toFixed(2)} (${calc.bulkDiscount}% off)`;
  }
  
  if (calc.individualUnits > 0) {
    if (result) result += ' + ';
    result += `${calc.individualUnits} × $${calc.unitPrice.toFixed(2)}`;
  }
  
  result += ` = $${calc.finalTotal.toFixed(2)}`;
  
  if (calc.savings > 0) {
    result += ` (Save $${calc.savings.toFixed(2)})`;
  }
  
  return result;
}

/**
 * Get the next tier info for "order X more to save" prompts
 */
export function getNextTierSuggestion(
  currentQuantity: number,
  unitPrice: number,
  tiers: VolumeDiscountTier[] = DEFAULT_VOLUME_TIERS
): {
  additionalNeeded: number;
  nextTier: VolumeDiscountTier;
  potentialSavings: number;
  currentTotal: number;
  nextTierTotal: number;
} | null {
  const sortedTiers = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  
  // Find the next tier above current quantity
  const nextTier = sortedTiers.find(t => t.min_qty > currentQuantity);
  
  if (!nextTier) return null;
  
  const additionalNeeded = nextTier.min_qty - currentQuantity;
  const currentCalc = calculateSimpleBulkDiscount(currentQuantity, unitPrice, tiers);
  const nextTierCalc = calculateSimpleBulkDiscount(nextTier.min_qty, unitPrice, tiers);
  
  // Calculate savings per unit at next tier
  const currentPerUnit = currentCalc.finalTotal / currentQuantity;
  const nextPerUnit = nextTierCalc.finalTotal / nextTier.min_qty;
  
  // Potential savings if they had ordered at next tier quantity
  const potentialSavings = (currentPerUnit - nextPerUnit) * nextTier.min_qty;
  
  return {
    additionalNeeded,
    nextTier,
    potentialSavings,
    currentTotal: currentCalc.finalTotal,
    nextTierTotal: nextTierCalc.finalTotal,
  };
}

/**
 * Round quantity to nearest valid increment
 */
export function roundToIncrement(
  quantity: number,
  offeringType: OfferingType,
  roundUp: boolean = true
): number {
  const increment = BULK_INCREMENTS[offeringType];
  const minimum = BULK_MINIMUMS[offeringType];
  
  if (increment === 1) return Math.max(minimum, quantity);
  
  const rounded = roundUp
    ? Math.ceil(quantity / increment) * increment
    : Math.floor(quantity / increment) * increment;
  
  return Math.max(minimum, rounded);
}

/**
 * Get suggested quantities for quick-order buttons
 */
export function getSuggestedQuantities(
  offeringType: OfferingType,
  tiers: VolumeDiscountTier[] = DEFAULT_VOLUME_TIERS
): number[] {
  const increment = BULK_INCREMENTS[offeringType];
  const tierQuantities = tiers.map(t => t.min_qty);
  
  // Standard suggestions based on type
  const baseQuantities: number[] = [1];
  
  if (offeringType === 'packed_lunch') {
    baseQuantities.push(5, 10, 20, 25, 40, 50);
  } else if (offeringType === 'baked_goods') {
    baseQuantities.push(6, 12, 24, 48); // By the dozen
  } else if (offeringType === 'catering') {
    baseQuantities.push(10, 20, 40, 50, 100);
  } else {
    baseQuantities.push(2, 5, 10, 20);
  }
  
  // Combine and dedupe
  const allQuantities = [...new Set([...baseQuantities, ...tierQuantities])];
  return allQuantities.sort((a, b) => a - b);
}

/**
 * Format volume discount tiers for display
 */
export function formatVolumeTiers(tiers: VolumeDiscountTier[]): string[] {
  return tiers
    .sort((a, b) => a.min_qty - b.min_qty)
    .map(t => `${t.min_qty}+ units: ${t.discount_percent}% off`);
}

/**
 * Check if offering qualifies as cottage law compliant
 */
export function isCottageLawCategory(category: string | null): boolean {
  if (!category) return false;
  return (BAKED_GOODS_CATEGORIES as readonly string[]).includes(category.toLowerCase());
}

/**
 * Calculate maker earnings from bulk order
 * Creator keeps 83.3%, LB takes 16.7%
 */
export function calculateMakerEarnings(
  totalAmount: number,
  creatorPercent: number = 83.3
): {
  makerEarnings: number;
  lbMargin: number;
} {
  const makerEarnings = totalAmount * (creatorPercent / 100);
  const lbMargin = totalAmount - makerEarnings;
  
  return {
    makerEarnings: Math.round(makerEarnings * 100) / 100,
    lbMargin: Math.round(lbMargin * 100) / 100,
  };
}
