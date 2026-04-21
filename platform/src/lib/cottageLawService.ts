/**
 * Cottage Law Compliance Service
 *
 * Helps makers understand and comply with cottage food laws by state.
 *
 * Features:
 * - State-specific rules lookup
 * - Community-contributed guides
 * - Permit threshold tracking
 * - Step-by-step compliance guides
 */

import { supabase } from '@/integrations/supabase/client';

export interface CottageLawRule {
  id: string;
  state_code: string;
  state_name: string;
  is_allowed: boolean;
  annual_revenue_limit?: number;
  daily_limit?: number;
  weekly_limit?: number;
  monthly_limit?: number;
  allowed_food_types: string[];
  prohibited_food_types: string[];
  registration_required: boolean;
  permit_required: boolean;
  permit_threshold_weekly?: number;
  food_handler_cert_required: boolean;
  kitchen_inspection_required: boolean;
  labeling_required: boolean;
  required_label_items: string[];
  direct_sales_only: boolean;
  online_sales_allowed: boolean;
  farmers_market_allowed: boolean;
  official_url?: string;
  application_url?: string;
  last_verified?: string;
  effective_date?: string;
}

export interface CottageLawGuide {
  id: string;
  state_code: string;
  county?: string;
  city?: string;
  jurisdiction_type: 'state' | 'county' | 'city';
  title: string;
  summary?: string;
  full_content: string;
  permit_thresholds: PermitThreshold[];
  step_by_step_permit: PermitStep[];
  local_resources: LocalResource[];
  effective_date?: string;
  last_verified?: string;
  source_urls: string[];
  contributor_id: string;
  vote_count: number;
  average_rating?: number;
  helpful_count: number;
  not_helpful_count: number;
  price_credits: number;
  times_purchased: number;
  total_revenue: number;
  status: 'draft' | 'review' | 'published' | 'outdated' | 'archived';
}

export interface PermitThreshold {
  qty: number;
  type: 'none' | 'registration' | 'basic_permit' | 'full_license';
  description?: string;
}

export interface PermitStep {
  step_number: number;
  title: string;
  description: string;
  documents_needed?: string[];
  estimated_time?: string;
  cost?: number;
  link?: string;
}

export interface LocalResource {
  name: string;
  type: 'health_dept' | 'extension_office' | 'business_license' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  url?: string;
  notes?: string;
}

export interface UserCottageLawStatus {
  user_id: string;
  state_code: string;
  current_weekly_output: number;
  current_monthly_revenue: number;
  current_annual_revenue: number;
  has_permit: boolean;
  permit_number?: string;
  permit_expires?: string;
  has_food_handler_cert: boolean;
  cert_number?: string;
  cert_expires?: string;
  approaching_threshold: boolean;
  over_threshold: boolean;
}

// Default label requirements for cottage foods
export const DEFAULT_LABEL_ITEMS = [
  'producer_name',
  'producer_address',
  'product_name',
  'ingredients',
  'allergens',
  'made_in_home_kitchen',
  'net_weight',
];

// Common cottage law compliant food types
export const COMMON_COTTAGE_FOODS = [
  'cookies',
  'cakes',
  'breads',
  'candies',
  'jams',
  'jellies',
  'fruit_pies',
  'granola',
  'dry_mixes',
  'honey',
  'popcorn',
];

// Foods that typically require permits/licenses
export const TYPICALLY_PROHIBITED = [
  'meat',
  'dairy',
  'eggs',
  'seafood',
  'fermented_foods',
  'canned_vegetables',
  'cream_pies',
  'custards',
];

/**
 * Get cottage law rules for a state
 */
export async function getStateCottageLawRules(
  stateCode: string
): Promise<CottageLawRule | null> {
  try {
    // In production, query cottage_law_rules table
    // For now, return sample data for common states
    const sampleRules: Record<string, Partial<CottageLawRule>> = {
      TX: {
        state_name: 'Texas',
        is_allowed: true,
        annual_revenue_limit: 50000,
        allowed_food_types: COMMON_COTTAGE_FOODS,
        prohibited_food_types: TYPICALLY_PROHIBITED,
        registration_required: false,
        permit_required: false,
        labeling_required: true,
        direct_sales_only: false,
        online_sales_allowed: true,
        official_url: 'https://www.dshs.texas.gov/foodestablishments/cottagefood/default.aspx',
      },
      CA: {
        state_name: 'California',
        is_allowed: true,
        annual_revenue_limit: 75000,
        weekly_limit: undefined,
        allowed_food_types: COMMON_COTTAGE_FOODS,
        prohibited_food_types: TYPICALLY_PROHIBITED,
        registration_required: true,
        permit_required: false,
        permit_threshold_weekly: 75000, // Revenue based
        labeling_required: true,
        direct_sales_only: false,
        online_sales_allowed: true,
        official_url: 'https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/CottageFoodOperations.aspx',
      },
      NY: {
        state_name: 'New York',
        is_allowed: true,
        allowed_food_types: ['baked_goods', 'candies', 'jams'],
        prohibited_food_types: [...TYPICALLY_PROHIBITED, 'cheesecake'],
        registration_required: true,
        permit_required: false,
        labeling_required: true,
        direct_sales_only: true,
        online_sales_allowed: false,
      },
    };

    const stateRules = sampleRules[stateCode.toUpperCase()];
    if (!stateRules) return null;

    return {
      id: `rule-${stateCode}`,
      state_code: stateCode.toUpperCase(),
      state_name: stateRules.state_name || stateCode,
      is_allowed: stateRules.is_allowed ?? true,
      allowed_food_types: stateRules.allowed_food_types || [],
      prohibited_food_types: stateRules.prohibited_food_types || [],
      registration_required: stateRules.registration_required ?? false,
      permit_required: stateRules.permit_required ?? false,
      food_handler_cert_required: false,
      kitchen_inspection_required: false,
      labeling_required: stateRules.labeling_required ?? true,
      required_label_items: DEFAULT_LABEL_ITEMS,
      direct_sales_only: stateRules.direct_sales_only ?? true,
      online_sales_allowed: stateRules.online_sales_allowed ?? false,
      farmers_market_allowed: true,
      official_url: stateRules.official_url,
      ...stateRules,
    } as CottageLawRule;
  } catch (error) {
    console.error('Error getting cottage law rules:', error);
    return null;
  }
}

/**
 * Get available guides for a location
 */
export async function getCottageLawGuides(
  stateCode: string,
  county?: string,
  city?: string
): Promise<CottageLawGuide[]> {
  try {
    // In production, query cottage_law_guides table
    return [];
  } catch (error) {
    console.error('Error getting cottage law guides:', error);
    return [];
  }
}

/**
 * Check if user needs a permit based on current output
 */
export function checkPermitRequirement(
  rules: CottageLawRule,
  weeklyOutput: number,
  monthlyRevenue: number,
  annualRevenue: number
): {
  required: boolean;
  threshold?: string;
  urgency: 'none' | 'approaching' | 'exceeded';
} {
  // Check permit threshold
  if (rules.permit_threshold_weekly && weeklyOutput >= rules.permit_threshold_weekly) {
    return {
      required: true,
      threshold: `Weekly output limit: ${rules.permit_threshold_weekly}`,
      urgency: 'exceeded',
    };
  }

  // Check revenue limits
  if (rules.annual_revenue_limit && annualRevenue >= rules.annual_revenue_limit) {
    return {
      required: true,
      threshold: `Annual revenue limit: $${rules.annual_revenue_limit.toLocaleString()}`,
      urgency: 'exceeded',
    };
  }

  // Check if approaching limits (80% threshold for warning)
  if (rules.permit_threshold_weekly) {
    const weeklyPct = weeklyOutput / rules.permit_threshold_weekly;
    if (weeklyPct >= 0.8) {
      return {
        required: false,
        threshold: `Approaching weekly limit (${Math.round(weeklyPct * 100)}%)`,
        urgency: 'approaching',
      };
    }
  }

  if (rules.annual_revenue_limit) {
    const annualPct = annualRevenue / rules.annual_revenue_limit;
    if (annualPct >= 0.8) {
      return {
        required: false,
        threshold: `Approaching annual limit (${Math.round(annualPct * 100)}%)`,
        urgency: 'approaching',
      };
    }
  }

  return { required: rules.permit_required, urgency: 'none' };
}

/**
 * Get user's cottage law compliance status
 */
export async function getUserComplianceStatus(
  userId: string,
  stateCode: string
): Promise<UserCottageLawStatus | null> {
  try {
    // In production, query user_cottage_law_status table
    return null;
  } catch (error) {
    console.error('Error getting user compliance status:', error);
    return null;
  }
}

/**
 * Check if a food type is allowed under cottage law
 */
export function isFoodTypeAllowed(
  foodType: string,
  rules: CottageLawRule
): { allowed: boolean; reason?: string } {
  const normalizedType = foodType.toLowerCase().replace(/\s+/g, '_');

  if (rules.prohibited_food_types.includes(normalizedType)) {
    return {
      allowed: false,
      reason: `${foodType} is not allowed under ${rules.state_name} cottage food law`,
    };
  }

  if (rules.allowed_food_types.length > 0 &&
      !rules.allowed_food_types.includes(normalizedType)) {
    return {
      allowed: false,
      reason: `${foodType} is not on the approved list for ${rules.state_name}`,
    };
  }

  return { allowed: true };
}

/**
 * Generate required label content
 */
export function generateLabelContent(
  producerName: string,
  producerAddress: string,
  productName: string,
  ingredients: string[],
  allergens: string[],
  netWeight?: string
): string {
  const lines: string[] = [
    productName.toUpperCase(),
    '',
    `Produced by: ${producerName}`,
    producerAddress,
    '',
    `Ingredients: ${ingredients.join(', ')}`,
  ];

  if (allergens.length > 0) {
    lines.push(`Contains: ${allergens.join(', ')}`);
  }

  if (netWeight) {
    lines.push(`Net Wt: ${netWeight}`);
  }

  lines.push('');
  lines.push('MADE IN A HOME KITCHEN');
  lines.push('NOT INSPECTED BY THE STATE');

  return lines.join('\n');
}

/**
 * Get compliance checklist for a state
 */
export function getComplianceChecklist(rules: CottageLawRule): {
  item: string;
  required: boolean;
  completed?: boolean;
}[] {
  const checklist = [
    {
      item: 'Understand allowed food types',
      required: true,
    },
    {
      item: 'Register with state (if required)',
      required: rules.registration_required,
    },
    {
      item: 'Obtain permit/license',
      required: rules.permit_required,
    },
    {
      item: 'Complete food handler certification',
      required: rules.food_handler_cert_required,
    },
    {
      item: 'Schedule kitchen inspection',
      required: rules.kitchen_inspection_required,
    },
    {
      item: 'Create compliant labels',
      required: rules.labeling_required,
    },
    {
      item: 'Set up sales tracking for limits',
      required: !!rules.annual_revenue_limit || !!rules.weekly_limit,
    },
  ];

  return checklist.filter(item => item.required);
}

/**
 * Purchase a cottage law guide
 */
export async function purchaseGuide(
  guideId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // INFRASTRUCTURE NOTE: This function needs real purchase flow:
    // 1. Check if user has enough credits
    // 2. Deduct credits via currencyService
    // 3. Insert record into cottage_law_guide_purchases table
    // 4. Grant access to guide content
    // 5. Credit contributor (70% revenue share)
    return { success: true };
  } catch (error) {
    console.error('Error purchasing guide:', error);
    return { success: false, error: 'Failed to purchase guide' };
  }
}

/**
 * Rate a purchased guide
 */
export async function rateGuide(
  guideId: string,
  rating: number,
  wasHelpful: boolean,
  review?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // INFRASTRUCTURE NOTE: This function needs to update cottage_law_guide_purchases table
    // with the rating, wasHelpful flag, and review text, then recalculate guide averages
    return { success: true };
  } catch (error) {
    console.error('Error rating guide:', error);
    return { success: false, error: 'Failed to rate guide' };
  }
}

/**
 * Submit a new cottage law guide
 */
export async function submitGuide(
  guide: Omit<CottageLawGuide, 'id' | 'contributor_id' | 'vote_count' | 'average_rating' | 'helpful_count' | 'not_helpful_count' | 'times_purchased' | 'total_revenue' | 'status'>
): Promise<{ guideId?: string; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: 'Not authenticated' };
    }

    // INFRASTRUCTURE NOTE: This function needs to insert into cottage_law_guides table
    // with status 'review' and contributor_id = userData.user.id
    const guideId = `guide-${Date.now()}`;

    return { guideId };
  } catch (error) {
    console.error('Error submitting guide:', error);
    return { error: 'Failed to submit guide' };
  }
}
