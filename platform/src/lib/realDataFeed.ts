/**
 * Real Data Feed
 *
 * Progressive enhancement for Business Simulator.
 * Queries actual platform metrics when available,
 * falls back to defaults when no data exists.
 *
 * Weights: 100% defaults initially, gradually shifts to real data as volume increases.
 *
 * Innovation #1188: Contingency Operators
 */

import { supabase } from '@/integrations/supabase/client';
import { PLATFORM_ECONOMICS, INITIATIVE_TEMPLATES } from './businessSimulationService';

// ============================================================================
// TYPES
// ============================================================================

export interface RealDataMetrics {
  // Order metrics
  actualAverageOrderValue?: number;
  actualOrdersPerDay?: number;
  actualCustomerRetentionRate?: number;

  // Cost metrics
  actualCostOfGoodsSoldPercent?: number;
  actualDeliverySuccessRate?: number;

  // Capacity metrics
  actualActiveCreators?: number;
  actualOrderFulfillmentRate?: number;

  // Confidence
  dataConfidence: number;  // 0-1 based on data volume
  dataPointCount: number;
  lastUpdated: Date;
}

export interface InitiativeMetrics {
  initiativeId: string;
  metrics: RealDataMetrics;
}

export interface DataWeight {
  defaultWeight: number;  // Weight for default assumptions
  realWeight: number;     // Weight for real data
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Minimum data points needed for each confidence threshold
const CONFIDENCE_THRESHOLDS = {
  LOW: 10,      // 10+ data points = 30% real data weight
  MEDIUM: 50,   // 50+ data points = 60% real data weight
  HIGH: 200,    // 200+ data points = 85% real data weight
  FULL: 500,    // 500+ data points = 95% real data weight
};

// Tables to query for different initiatives
const INITIATIVE_DATA_SOURCES: Record<string, string[]> = {
  'lets-make-dinner': ['meal_offerings', 'meal_orders', 'cook_profiles'],
  'lets-get-groceries': ['shopping_orders', 'pantry_items', 'demand_aggregation'],
  'lets-go-shopping': ['shopping_orders', 'volume_discounts'],
  'household-concierge': ['concierge_requests', 'service_completions'],
  'family-table': ['family_meals', 'swoop_deliveries'],
  'tatiana-schlossburg-health-accords': ['medication_requests', 'rx_fulfillments'],
  'msa': ['msa_accounts', 'msa_transactions'],
  'defense-klaus': ['defense_klaws_preorders', 'subscription_plans'],
  'rally-group': ['rally_responses', 'volunteer_profiles'],
  'vsl': ['vsl_groups', 'loan_records', 'savings_deposits'],
  'lets-make-bread': ['bread_productions', 'manufacturing_orders'],
  'harper-guild': ['guild_reviews', 'ethics_cases'],
  'jukebox': ['track_submissions', 'licensing_plays'],
  'didasko': ['bounty_submissions', 'lesson_completions'],
  'power-to-the-people': ['civic_engagement_records', 'ppp_transactions'],
  'brass-tacks': ['medallion_sponsorships', 'seedling_conversions'],
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calculate data weight based on number of data points
 */
export function calculateDataWeight(dataPointCount: number): DataWeight {
  if (dataPointCount >= CONFIDENCE_THRESHOLDS.FULL) {
    return { defaultWeight: 0.05, realWeight: 0.95 };
  } else if (dataPointCount >= CONFIDENCE_THRESHOLDS.HIGH) {
    return { defaultWeight: 0.15, realWeight: 0.85 };
  } else if (dataPointCount >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return { defaultWeight: 0.40, realWeight: 0.60 };
  } else if (dataPointCount >= CONFIDENCE_THRESHOLDS.LOW) {
    return { defaultWeight: 0.70, realWeight: 0.30 };
  }
  // Below threshold: use defaults entirely
  return { defaultWeight: 1.0, realWeight: 0.0 };
}

/**
 * Get real data metrics for a specific initiative
 */
export async function getInitiativeRealData(initiativeId: string): Promise<RealDataMetrics> {
  const defaultMetrics: RealDataMetrics = {
    dataConfidence: 0,
    dataPointCount: 0,
    lastUpdated: new Date(),
  };

  try {
    // Get data sources for this initiative
    const sources = INITIATIVE_DATA_SOURCES[initiativeId];
    if (!sources || sources.length === 0) {
      return defaultMetrics;
    }

    // Aggregate data from all sources
    let totalDataPoints = 0;
    const metrics: Partial<RealDataMetrics> = {};

    // Initiative-specific queries
    switch (initiativeId) {
      case 'lets-make-dinner':
        const dinnerData = await getMealOrderMetrics();
        Object.assign(metrics, dinnerData);
        totalDataPoints = dinnerData.dataPointCount;
        break;

      case 'lets-get-groceries':
        const groceryData = await getGroceryOrderMetrics();
        Object.assign(metrics, groceryData);
        totalDataPoints = groceryData.dataPointCount;
        break;

      case 'defense-klaus':
        const defenseData = await getDefenseKlausMetrics();
        Object.assign(metrics, defenseData);
        totalDataPoints = defenseData.dataPointCount;
        break;

      case 'vsl':
        const vslData = await getVSLMetrics();
        Object.assign(metrics, vslData);
        totalDataPoints = vslData.dataPointCount;
        break;

      default:
        // For other initiatives, get generic metrics if available
        const genericData = await getGenericMetrics(initiativeId);
        Object.assign(metrics, genericData);
        totalDataPoints = genericData.dataPointCount;
    }

    // Calculate confidence based on data volume
    const weight = calculateDataWeight(totalDataPoints);

    return {
      ...metrics,
      dataConfidence: weight.realWeight,
      dataPointCount: totalDataPoints,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`Failed to fetch real data for ${initiativeId}:`, error);
    return defaultMetrics;
  }
}

/**
 * Blend default assumptions with real data based on confidence
 */
export function blendWithRealData<T extends Record<string, number>>(
  defaults: T,
  realData: Partial<T>,
  dataWeight: DataWeight
): T {
  const blended = { ...defaults };

  for (const key of Object.keys(realData) as (keyof T)[]) {
    const realValue = realData[key];
    if (typeof realValue === 'number' && typeof defaults[key] === 'number') {
      blended[key] = (
        (defaults[key] as number) * dataWeight.defaultWeight +
        realValue * dataWeight.realWeight
      ) as T[keyof T];
    }
  }

  return blended;
}

// ============================================================================
// INITIATIVE-SPECIFIC DATA FETCHERS
// ============================================================================

/**
 * Get meal order metrics for Let's Make Dinner
 */
async function getMealOrderMetrics(): Promise<RealDataMetrics> {
  const metrics: RealDataMetrics = {
    dataConfidence: 0,
    dataPointCount: 0,
    lastUpdated: new Date(),
  };

  try {
    // Count total meal orders
    const { count: orderCount } = await supabase
      .from('meal_orders')
      .select('*', { count: 'exact', head: true });

    if (orderCount && orderCount > 0) {
      metrics.dataPointCount = orderCount;

      // Get average order value (from meal_offerings table)
      const { data: offerings } = await supabase
        .from('meal_offerings')
        .select('price')
        .not('price', 'is', null);

      if (offerings && offerings.length > 0) {
        const avgPrice = offerings.reduce((sum, o) => sum + (o.price || 0), 0) / offerings.length;
        metrics.actualAverageOrderValue = avgPrice;
      }

      // Get orders per day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentOrders } = await supabase
        .from('meal_orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentOrders) {
        metrics.actualOrdersPerDay = recentOrders / 30;
      }
    }

    const weight = calculateDataWeight(metrics.dataPointCount);
    metrics.dataConfidence = weight.realWeight;

    return metrics;
  } catch (error) {
    console.error('Error fetching meal order metrics:', error);
    return metrics;
  }
}

/**
 * Get grocery order metrics for Let's Get Groceries
 */
async function getGroceryOrderMetrics(): Promise<RealDataMetrics> {
  const metrics: RealDataMetrics = {
    dataConfidence: 0,
    dataPointCount: 0,
    lastUpdated: new Date(),
  };

  try {
    // Count shopping orders
    const { count: orderCount } = await supabase
      .from('shopping_orders')
      .select('*', { count: 'exact', head: true });

    if (orderCount && orderCount > 0) {
      metrics.dataPointCount = orderCount;

      // Get average order value
      const { data: orders } = await supabase
        .from('shopping_orders')
        .select('total_amount')
        .not('total_amount', 'is', null)
        .limit(100);

      if (orders && orders.length > 0) {
        const avgTotal = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length;
        metrics.actualAverageOrderValue = avgTotal;
      }
    }

    const weight = calculateDataWeight(metrics.dataPointCount);
    metrics.dataConfidence = weight.realWeight;

    return metrics;
  } catch (error) {
    console.error('Error fetching grocery order metrics:', error);
    return metrics;
  }
}

/**
 * Get Defense Klaus metrics
 */
async function getDefenseKlausMetrics(): Promise<RealDataMetrics> {
  const metrics: RealDataMetrics = {
    dataConfidence: 0,
    dataPointCount: 0,
    lastUpdated: new Date(),
  };

  try {
    // Count preorders
    const { count: preorderCount } = await supabase
      .from('defense_klaws_preorders')
      .select('*', { count: 'exact', head: true });

    if (preorderCount) {
      metrics.dataPointCount = preorderCount;
    }

    const weight = calculateDataWeight(metrics.dataPointCount);
    metrics.dataConfidence = weight.realWeight;

    return metrics;
  } catch (error) {
    console.error('Error fetching Defense Klaus metrics:', error);
    return metrics;
  }
}

/**
 * Get VSL (Village Savings & Loans) metrics
 */
async function getVSLMetrics(): Promise<RealDataMetrics> {
  const metrics: RealDataMetrics = {
    dataConfidence: 0,
    dataPointCount: 0,
    lastUpdated: new Date(),
  };

  try {
    // Count VSL groups
    const { count: groupCount } = await supabase
      .from('clans')
      .select('*', { count: 'exact', head: true })
      .eq('formation_type', 'vsl');

    if (groupCount) {
      metrics.dataPointCount = groupCount;
    }

    const weight = calculateDataWeight(metrics.dataPointCount);
    metrics.dataConfidence = weight.realWeight;

    return metrics;
  } catch (error) {
    console.error('Error fetching VSL metrics:', error);
    return metrics;
  }
}

/**
 * Get generic metrics for initiatives without specific data sources
 */
async function getGenericMetrics(initiativeId: string): Promise<RealDataMetrics> {
  const metrics: RealDataMetrics = {
    dataConfidence: 0,
    dataPointCount: 0,
    lastUpdated: new Date(),
  };

  // Use platform-wide metrics as fallback
  try {
    // Get total member count
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // Use member count as a proxy for overall platform health
    // This affects confidence but not specific metrics
    metrics.dataPointCount = Math.floor((memberCount || 0) / 10);

    const weight = calculateDataWeight(metrics.dataPointCount);
    metrics.dataConfidence = weight.realWeight;

    return metrics;
  } catch (error) {
    console.error('Error fetching generic metrics:', error);
    return metrics;
  }
}

// ============================================================================
// DASHBOARD FUNCTIONS
// ============================================================================

/**
 * Get all initiative metrics summary
 */
export async function getAllInitiativeMetrics(): Promise<InitiativeMetrics[]> {
  const results: InitiativeMetrics[] = [];

  for (const template of INITIATIVE_TEMPLATES) {
    if (template.id === 'custom') continue;

    const metrics = await getInitiativeRealData(template.id);
    results.push({
      initiativeId: template.id,
      metrics,
    });
  }

  return results;
}

/**
 * Get platform-wide metrics for the simulator dashboard
 */
export async function getPlatformMetrics(): Promise<{
  totalMembers: number;
  totalOrders: number;
  avgConfidence: number;
  dataHealth: 'healthy' | 'growing' | 'early';
}> {
  try {
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    const { count: orderCount } = await supabase
      .from('meal_orders')
      .select('*', { count: 'exact', head: true });

    const totalMembers = memberCount || 0;
    const totalOrders = orderCount || 0;
    const totalData = totalMembers + totalOrders;

    // Calculate average confidence
    const weight = calculateDataWeight(totalData);
    const avgConfidence = weight.realWeight;

    // Determine data health
    let dataHealth: 'healthy' | 'growing' | 'early';
    if (totalData >= CONFIDENCE_THRESHOLDS.HIGH) {
      dataHealth = 'healthy';
    } else if (totalData >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      dataHealth = 'growing';
    } else {
      dataHealth = 'early';
    }

    return {
      totalMembers,
      totalOrders,
      avgConfidence,
      dataHealth,
    };
  } catch (error) {
    console.error('Error fetching platform metrics:', error);
    return {
      totalMembers: 0,
      totalOrders: 0,
      avgConfidence: 0,
      dataHealth: 'early',
    };
  }
}
