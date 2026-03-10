/**
 * C+20 RECIPROCITY SERVICE
 * ========================
 * Innovation #1347: C+20 Reciprocity Law
 * 
 * "For every dollar of margin a business voluntarily gives up by adopting 
 * Cost + 20% pricing, the system grants that business one dollar of C+20 
 * purchasing power inside the ecosystem."
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface C20ProductConfig {
  id: string;
  anchor_id: string;
  product_sku: string;
  product_name: string;
  reference_price: number;
  cost_basis: number;
  c20_price: number;
  margin_at_reference: number;
  margin_at_c20: number;
  margin_sacrificed_per_unit: number;
  c20_enabled: boolean;
  c20_max_units: number | null;
  c20_units_sold: number;
  c20_auto_revert: boolean;
  created_at: string;
  updated_at: string;
}

export interface C20ReciprocityLedgerEntry {
  id: string;
  anchor_id: string;
  transaction_type: 'MARGIN_CONTRIBUTION' | 'BALANCE_SPEND' | 'JOULE_CONVERSION' | 'BALANCE_ADJUSTMENT';
  amount: number;
  balance_before: number;
  balance_after: number;
  product_config_id?: string;
  order_id?: string;
  joule_amount?: number;
  joule_rate?: number;
  notes?: string;
  created_at: string;
}

export interface C20ReciprocitySummary {
  reciprocity_balance: number;
  total_margin_contributed: number;
  total_balance_spent: number;
  net_contribution: number;
  products_at_c20: number;
  total_c20_units_sold: number;
  total_c20_units_remaining: number;
}

export interface C20SpendResult {
  balance_used: number;
  joules_needed: number;
  remaining_balance: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const C20_RECIPROCITY_CONSTANTS = {
  // 1:1 reciprocity rate (1 dollar margin = 1 dollar purchasing power)
  RECIPROCITY_RATE: 1.0,
  
  // Joule conversion rate (at parity)
  JOULE_CONVERSION_RATE: 1.0,
  
  // Recommended toe-dipping defaults
  RECOMMENDED_MIN_PRODUCTS: 3,
  RECOMMENDED_MAX_PRODUCTS: 10,
  RECOMMENDED_UNITS_PER_PRODUCT: 25,
  RECOMMENDED_MAX_UNITS_PER_PRODUCT: 50,
};

// ============================================================================
// PRODUCT CONFIGURATION
// ============================================================================

/**
 * Add a product to C+20 pricing with optional unit limits (toe-dipping).
 */
export async function addProductToC20(
  anchorId: string,
  config: {
    productSku: string;
    productName: string;
    referencePrice: number;
    costBasis: number;
    maxUnits?: number;
    autoRevert?: boolean;
  }
): Promise<C20ProductConfig | null> {
  const { data, error } = await supabase
    .from('c20_product_config')
    .insert({
      anchor_id: anchorId,
      product_sku: config.productSku,
      product_name: config.productName,
      reference_price: config.referencePrice,
      cost_basis: config.costBasis,
      c20_max_units: config.maxUnits ?? null,
      c20_auto_revert: config.autoRevert ?? true,
      c20_enabled: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding product to C+20:', error);
    return null;
  }

  return data as C20ProductConfig;
}

/**
 * Update C+20 configuration for a product.
 */
export async function updateProductC20Config(
  configId: string,
  updates: {
    maxUnits?: number | null;
    autoRevert?: boolean;
    enabled?: boolean;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('c20_product_config')
    .update({
      c20_max_units: updates.maxUnits,
      c20_auto_revert: updates.autoRevert,
      c20_enabled: updates.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', configId);

  if (error) {
    console.error('Error updating C+20 config:', error);
  }
  return !error;
}

/**
 * Get all C+20 product configs for an anchor.
 */
export async function getAnchorC20Products(anchorId: string): Promise<C20ProductConfig[]> {
  const { data, error } = await supabase
    .from('c20_product_config')
    .select('*')
    .eq('anchor_id', anchorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching C+20 products:', error);
    return [];
  }

  return data as C20ProductConfig[];
}

/**
 * Check if a product is still available at C+20 pricing (toe-dipping check).
 */
export async function isProductC20Available(configId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_product_c20_available', { p_product_config_id: configId });

  if (error) {
    console.error('Error checking C+20 availability:', error);
    return false;
  }

  return data as boolean;
}

// ============================================================================
// RECIPROCITY BALANCE OPERATIONS
// ============================================================================

/**
 * Record a margin contribution when a C+20 sale occurs.
 * Returns the amount of reciprocity balance earned.
 */
export async function recordMarginContribution(
  anchorId: string,
  productConfigId: string,
  unitsSold: number = 1,
  orderId?: string
): Promise<number> {
  const { data, error } = await supabase
    .rpc('record_c20_margin_contribution', {
      p_anchor_id: anchorId,
      p_product_config_id: productConfigId,
      p_units_sold: unitsSold,
      p_order_id: orderId ?? null,
    });

  if (error) {
    console.error('Error recording margin contribution:', error);
    return 0;
  }

  return data as number;
}

/**
 * Spend reciprocity balance on a C+20 purchase.
 * Returns how much balance was used and how many Joules are needed for the remainder.
 */
export async function spendC20Balance(
  anchorId: string,
  amount: number,
  orderId?: string,
  notes?: string
): Promise<C20SpendResult | null> {
  const { data, error } = await supabase
    .rpc('spend_c20_balance', {
      p_anchor_id: anchorId,
      p_amount: amount,
      p_order_id: orderId ?? null,
      p_notes: notes ?? null,
    });

  if (error) {
    console.error('Error spending C+20 balance:', error);
    return null;
  }

  // RPC returns array of rows
  const result = Array.isArray(data) ? data[0] : data;
  return result as C20SpendResult;
}

/**
 * Convert Joules to C+20 purchasing power.
 * Returns the amount of C+20 balance added.
 */
export async function convertJoulesToC20Balance(
  anchorId: string,
  jouleAmount: number,
  notes?: string
): Promise<number> {
  const { data, error } = await supabase
    .rpc('convert_joules_to_c20_balance', {
      p_anchor_id: anchorId,
      p_joule_amount: jouleAmount,
      p_notes: notes ?? null,
    });

  if (error) {
    console.error('Error converting Joules to C+20 balance:', error);
    return 0;
  }

  return data as number;
}

// ============================================================================
// SUMMARY & REPORTING
// ============================================================================

/**
 * Get the C+20 reciprocity summary for an anchor.
 */
export async function getReciprocitySummary(anchorId: string): Promise<C20ReciprocitySummary | null> {
  const { data, error } = await supabase
    .rpc('get_c20_reciprocity_summary', { p_anchor_id: anchorId });

  if (error) {
    console.error('Error fetching reciprocity summary:', error);
    return null;
  }

  const result = Array.isArray(data) ? data[0] : data;
  return result as C20ReciprocitySummary;
}

/**
 * Get the reciprocity ledger history for an anchor.
 */
export async function getReciprocityLedger(
  anchorId: string,
  limit: number = 50
): Promise<C20ReciprocityLedgerEntry[]> {
  const { data, error } = await supabase
    .from('c20_reciprocity_ledger')
    .select('*')
    .eq('anchor_id', anchorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reciprocity ledger:', error);
    return [];
  }

  return data as C20ReciprocityLedgerEntry[];
}

/**
 * Get the public reciprocity leaderboard.
 */
export async function getReciprocityLeaderboard(limit: number = 20) {
  const { data, error } = await supabase
    .from('v_c20_reciprocity_leaderboard')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching reciprocity leaderboard:', error);
    return [];
  }

  return data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate the margin sacrificed for a product at C+20.
 */
export function calculateMarginSacrificed(
  referencePrice: number,
  costBasis: number
): {
  c20Price: number;
  marginAtReference: number;
  marginAtC20: number;
  marginSacrificed: number;
  percentSacrificed: number;
} {
  const c20Price = costBasis * 1.20;
  const marginAtReference = referencePrice - costBasis;
  const marginAtC20 = costBasis * 0.20;
  const marginSacrificed = marginAtReference - marginAtC20;
  const percentSacrificed = marginAtReference > 0 
    ? (marginSacrificed / marginAtReference) * 100 
    : 0;

  return {
    c20Price,
    marginAtReference,
    marginAtC20,
    marginSacrificed,
    percentSacrificed,
  };
}

/**
 * Calculate total reciprocity balance earned for a batch of products.
 */
export function calculateBatchReciprocity(
  products: Array<{
    referencePrice: number;
    costBasis: number;
    units: number;
  }>
): {
  totalMarginSacrificed: number;
  totalReciprocityBalance: number;
  perProductBreakdown: Array<{
    marginSacrificed: number;
    reciprocityEarned: number;
  }>;
} {
  const perProductBreakdown = products.map(p => {
    const { marginSacrificed } = calculateMarginSacrificed(p.referencePrice, p.costBasis);
    const totalForProduct = marginSacrificed * p.units;
    return {
      marginSacrificed: totalForProduct,
      reciprocityEarned: totalForProduct * C20_RECIPROCITY_CONSTANTS.RECIPROCITY_RATE,
    };
  });

  const totalMarginSacrificed = perProductBreakdown.reduce((sum, p) => sum + p.marginSacrificed, 0);
  const totalReciprocityBalance = totalMarginSacrificed * C20_RECIPROCITY_CONSTANTS.RECIPROCITY_RATE;

  return {
    totalMarginSacrificed,
    totalReciprocityBalance,
    perProductBreakdown,
  };
}

/**
 * Generate a toe-dipping recommendation based on product catalog.
 */
export function generateToeDippingRecommendation(
  products: Array<{
    referencePrice: number;
    costBasis: number;
    monthlyVolume: number;
  }>
): {
  recommendedProducts: number;
  recommendedUnitsEach: number;
  estimatedMarginSacrificed: number;
  estimatedReciprocityBalance: number;
  riskLevel: 'low' | 'medium' | 'high';
} {
  // Sort by margin percentage (highest first - easiest to sacrifice)
  const sorted = [...products].sort((a, b) => {
    const marginA = (a.referencePrice - a.costBasis) / a.referencePrice;
    const marginB = (b.referencePrice - b.costBasis) / b.referencePrice;
    return marginB - marginA;
  });

  // Recommend top 3-10 products
  const recommendedProducts = Math.min(
    C20_RECIPROCITY_CONSTANTS.RECOMMENDED_MAX_PRODUCTS,
    Math.max(C20_RECIPROCITY_CONSTANTS.RECOMMENDED_MIN_PRODUCTS, Math.floor(products.length * 0.2))
  );

  // Recommend 25-50 units based on volume
  const avgVolume = products.reduce((sum, p) => sum + p.monthlyVolume, 0) / products.length;
  const recommendedUnitsEach = avgVolume > 100 
    ? C20_RECIPROCITY_CONSTANTS.RECOMMENDED_MAX_UNITS_PER_PRODUCT
    : C20_RECIPROCITY_CONSTANTS.RECOMMENDED_UNITS_PER_PRODUCT;

  // Calculate estimated impact
  const selectedProducts = sorted.slice(0, recommendedProducts);
  const { totalMarginSacrificed, totalReciprocityBalance } = calculateBatchReciprocity(
    selectedProducts.map(p => ({
      referencePrice: p.referencePrice,
      costBasis: p.costBasis,
      units: recommendedUnitsEach,
    }))
  );

  // Assess risk level based on percentage of total revenue
  const totalMonthlyRevenue = products.reduce((sum, p) => sum + (p.referencePrice * p.monthlyVolume), 0);
  const impactPercentage = (totalMarginSacrificed / totalMonthlyRevenue) * 100;
  
  const riskLevel: 'low' | 'medium' | 'high' = 
    impactPercentage < 5 ? 'low' :
    impactPercentage < 15 ? 'medium' : 'high';

  return {
    recommendedProducts,
    recommendedUnitsEach,
    estimatedMarginSacrificed: totalMarginSacrificed,
    estimatedReciprocityBalance: totalReciprocityBalance,
    riskLevel,
  };
}

export default {
  addProductToC20,
  updateProductC20Config,
  getAnchorC20Products,
  isProductC20Available,
  recordMarginContribution,
  spendC20Balance,
  convertJoulesToC20Balance,
  getReciprocitySummary,
  getReciprocityLedger,
  getReciprocityLeaderboard,
  calculateMarginSacrificed,
  calculateBatchReciprocity,
  generateToeDippingRecommendation,
};
