/**
 * Business Simulation Service
 *
 * Integrates Contingency Operators with Ghost World to let users
 * run "what-if" business simulations using platform economics defaults.
 *
 * Innovation #1188: Contingency Operators
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface BusinessScenario {
  id?: string;
  name: string;
  initiativeId: string;
  initiativeName: string;
  category: 'food' | 'health' | 'finance' | 'creative' | 'growth';
  assumptions: BusinessAssumptions;
  projections?: BusinessProjections;
  status: 'draft' | 'running' | 'completed';
  createdAt: Date;
}

export interface BusinessAssumptions {
  // Revenue assumptions
  averageOrderValue: number;
  ordersPerWeek: number;
  customerRetentionRate: number;

  // Cost assumptions
  costOfGoodsSoldPercent: number;
  platformFeePercent: number;  // Always 16.67% (Cost+20% = creator keeps 83.3%)

  // Capacity assumptions
  hoursPerWeek: number;
  productionCapacityUtilization: number;

  // Growth assumptions
  monthlyGrowthRate: number;
  customerAcquisitionCost: number;

  // Custom overrides
  customFactors: Record<string, number>;
}

export interface BusinessProjections {
  // Monthly projections
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;

  // Annual projections
  annualRevenue: number;
  annualProfit: number;

  // Break-even analysis
  breakEvenMonths: number;
  breakEvenOrders: number;

  // Metrics
  profitMargin: number;
  returnOnTime: number;  // $/hour worked

  // Scenario score (from CO)
  netScore: number;
  confidence: number;  // Based on real data availability
}

export interface InitiativeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'food' | 'health' | 'finance' | 'creative' | 'growth';
  defaultAssumptions: Partial<BusinessAssumptions>;
  factors: Array<{ name: string; weight: number; description?: string }>;
}

// ============================================================================
// PLATFORM CONSTANTS (from Master Context)
// ============================================================================

export const PLATFORM_ECONOMICS = {
  CREATOR_SHARE: 0.833,  // 83.3% - NEVER ROUND TO 83%
  PLATFORM_MARGIN: 0.20,  // Cost + 20%
  ANNUAL_MEMBERSHIP: 5,   // $5/year
  BREAK_EVEN_MEMBERS: 500,
  PROFITABLE_MEMBERS: 1000,
};

export const MANUFACTURING_MODEL = {
  PLATFORM_TIME_RATIO: 0.6,  // 3/5 days
  PERSONAL_TIME_RATIO: 0.4,  // 2/5 days
  RUSH_PREMIUM: 0.5,  // 50%
};

// ============================================================================
// INITIATIVE TEMPLATES (The Sweet Sixteen)
// ============================================================================

export const INITIATIVE_TEMPLATES: InitiativeTemplate[] = [
  // Food & Home
  {
    id: 'lets-make-dinner',
    name: "Let's Make Dinner",
    description: 'Neighbors feeding neighbors',
    category: 'food',
    defaultAssumptions: {
      averageOrderValue: 35,
      ordersPerWeek: 5,
      customerRetentionRate: 0.7,
      costOfGoodsSoldPercent: 0.35,
      hoursPerWeek: 15,
      productionCapacityUtilization: 0.7,
      monthlyGrowthRate: 0.05,
      customerAcquisitionCost: 5,
    },
    factors: [
      { name: 'Order Volume', weight: 0.25, description: 'Number of meal orders per week' },
      { name: 'Average Order Value', weight: 0.20, description: 'Typical order amount ($25-$50)' },
      { name: 'Cook Availability', weight: 0.15, description: 'Hours available for cooking' },
      { name: 'Delivery Range', weight: 0.10, description: 'Geographic service area' },
      { name: 'Customer Retention', weight: 0.15, description: 'Repeat customer rate' },
      { name: 'Food Cost', weight: 0.15, description: 'Ingredient costs as % of price' },
    ],
  },
  {
    id: 'lets-get-groceries',
    name: "Let's Get Groceries",
    description: 'Volume purchasing power',
    category: 'food',
    defaultAssumptions: {
      averageOrderValue: 75,
      ordersPerWeek: 3,
      customerRetentionRate: 0.8,
      costOfGoodsSoldPercent: 0.85,
      hoursPerWeek: 10,
      productionCapacityUtilization: 0.6,
      monthlyGrowthRate: 0.08,
      customerAcquisitionCost: 3,
    },
    factors: [
      { name: 'Order Aggregation', weight: 0.25, description: 'Volume discount from pooling' },
      { name: 'Delivery Efficiency', weight: 0.20, description: 'Orders per delivery run' },
      { name: 'Supplier Relationships', weight: 0.15, description: 'Wholesale pricing access' },
      { name: 'Inventory Turnover', weight: 0.15, description: 'Fresh stock management' },
      { name: 'Customer Density', weight: 0.15, description: 'Households per square mile' },
      { name: 'Basket Size', weight: 0.10, description: 'Items per order' },
    ],
  },
  {
    id: 'lets-go-shopping',
    name: "Let's Go Shopping",
    description: 'Cooperative buying power',
    category: 'food',
    defaultAssumptions: {
      averageOrderValue: 120,
      ordersPerWeek: 2,
      customerRetentionRate: 0.75,
      costOfGoodsSoldPercent: 0.80,
      hoursPerWeek: 8,
      productionCapacityUtilization: 0.5,
      monthlyGrowthRate: 0.06,
      customerAcquisitionCost: 8,
    },
    factors: [
      { name: 'Group Size', weight: 0.25, description: 'Members in buying group' },
      { name: 'Category Diversity', weight: 0.15, description: 'Product categories covered' },
      { name: 'Vendor Negotiation', weight: 0.20, description: 'Discount levels achieved' },
      { name: 'Order Coordination', weight: 0.15, description: 'Logistics efficiency' },
      { name: 'Member Participation', weight: 0.15, description: 'Active member ratio' },
      { name: 'Volume Tier', weight: 0.10, description: 'Current discount tier (5-20%)' },
    ],
  },
  {
    id: 'household-concierge',
    name: 'Household Concierge',
    description: 'World-class home management',
    category: 'food',
    defaultAssumptions: {
      averageOrderValue: 50,
      ordersPerWeek: 4,
      customerRetentionRate: 0.85,
      costOfGoodsSoldPercent: 0.25,
      hoursPerWeek: 20,
      productionCapacityUtilization: 0.8,
      monthlyGrowthRate: 0.04,
      customerAcquisitionCost: 15,
    },
    factors: [
      { name: 'Service Hours', weight: 0.25, description: 'Hours of service per client' },
      { name: 'Client Retention', weight: 0.20, description: 'Long-term relationship rate' },
      { name: 'Service Range', weight: 0.15, description: 'Types of services offered' },
      { name: 'Referral Rate', weight: 0.15, description: 'New clients from referrals' },
      { name: 'Premium Services', weight: 0.15, description: 'High-margin service mix' },
      { name: 'Scheduling Efficiency', weight: 0.10, description: 'Utilization of time' },
    ],
  },
  {
    id: 'family-table',
    name: 'The Family Table',
    description: 'Intergenerational connection + Do The Swoop',
    category: 'food',
    defaultAssumptions: {
      averageOrderValue: 25,
      ordersPerWeek: 7,
      customerRetentionRate: 0.9,
      costOfGoodsSoldPercent: 0.40,
      hoursPerWeek: 25,
      productionCapacityUtilization: 0.85,
      monthlyGrowthRate: 0.03,
      customerAcquisitionCost: 2,
    },
    factors: [
      { name: 'Meal Planning', weight: 0.20, description: 'Weekly meal coordination' },
      { name: 'Family Participation', weight: 0.20, description: 'Household engagement' },
      { name: 'Dietary Compliance', weight: 0.15, description: 'Special needs accommodation' },
      { name: 'Waste Reduction', weight: 0.15, description: 'Food waste minimization' },
      { name: 'Swoop Success', weight: 0.15, description: 'Last-mile delivery wins' },
      { name: 'Community Integration', weight: 0.15, description: 'Cross-household sharing' },
    ],
  },
  // Health & Safety
  {
    id: 'tatiana-schlossburg-health-accords',
    name: 'Tatiana Schlossburg Health Accords',
    description: 'Affordable prescriptions',
    category: 'health',
    defaultAssumptions: {
      averageOrderValue: 45,
      ordersPerWeek: 2,
      customerRetentionRate: 0.95,
      costOfGoodsSoldPercent: 0.70,
      hoursPerWeek: 5,
      productionCapacityUtilization: 0.3,
      monthlyGrowthRate: 0.10,
      customerAcquisitionCost: 0,
    },
    factors: [
      { name: 'Medication Pool Size', weight: 0.25, description: 'Formulary breadth' },
      { name: 'Savings Rate', weight: 0.25, description: 'Discount vs retail' },
      { name: 'Compliance Rate', weight: 0.20, description: 'Prescription adherence' },
      { name: 'Bulk Purchasing', weight: 0.15, description: 'Volume discount levels' },
      { name: 'Distribution Efficiency', weight: 0.15, description: 'Delivery logistics' },
    ],
  },
  {
    id: 'msa',
    name: 'MSA',
    description: 'Medical savings accounts',
    category: 'health',
    defaultAssumptions: {
      averageOrderValue: 100,
      ordersPerWeek: 0.25,
      customerRetentionRate: 0.98,
      costOfGoodsSoldPercent: 0.05,
      hoursPerWeek: 2,
      productionCapacityUtilization: 0.2,
      monthlyGrowthRate: 0.08,
      customerAcquisitionCost: 5,
    },
    factors: [
      { name: 'Account Balance', weight: 0.25, description: 'Average account size' },
      { name: 'Contribution Rate', weight: 0.20, description: 'Regular deposits' },
      { name: 'Utilization Rate', weight: 0.20, description: 'Funds used for care' },
      { name: 'Network Discounts', weight: 0.20, description: 'Provider savings' },
      { name: 'Member Growth', weight: 0.15, description: 'New account signups' },
    ],
  },
  {
    id: 'defense-klaus',
    name: 'Defense Klaus',
    description: 'Personal safety ("For Someone You Love")',
    category: 'health',
    defaultAssumptions: {
      averageOrderValue: 85,
      ordersPerWeek: 0.5,
      customerRetentionRate: 0.90,
      costOfGoodsSoldPercent: 0.45,
      hoursPerWeek: 8,
      productionCapacityUtilization: 0.6,
      monthlyGrowthRate: 0.12,
      customerAcquisitionCost: 20,
    },
    factors: [
      { name: 'Product Sales', weight: 0.25, description: 'Device unit sales' },
      { name: 'Subscription Revenue', weight: 0.20, description: 'Monitoring services' },
      { name: 'Network Coverage', weight: 0.15, description: 'Response availability' },
      { name: 'Device Reliability', weight: 0.15, description: 'Uptime and performance' },
      { name: 'Training Completion', weight: 0.15, description: 'User preparedness' },
      { name: 'Response Time', weight: 0.10, description: 'Emergency response speed' },
    ],
  },
  {
    id: 'rally-group',
    name: 'Rally Group',
    description: 'Crisis response everywhere',
    category: 'health',
    defaultAssumptions: {
      averageOrderValue: 0,
      ordersPerWeek: 0,
      customerRetentionRate: 0.95,
      costOfGoodsSoldPercent: 0,
      hoursPerWeek: 5,
      productionCapacityUtilization: 0.3,
      monthlyGrowthRate: 0.15,
      customerAcquisitionCost: 0,
    },
    factors: [
      { name: 'Volunteer Availability', weight: 0.25, description: 'Active responders' },
      { name: 'Response Time', weight: 0.25, description: 'Minutes to arrival' },
      { name: 'Geographic Coverage', weight: 0.20, description: 'Service area density' },
      { name: 'Training Level', weight: 0.15, description: 'Responder certification' },
      { name: 'Community Trust', weight: 0.15, description: 'Public confidence' },
    ],
  },
  // Finance & Work
  {
    id: 'vsl',
    name: 'VSL',
    description: 'Village savings & loans',
    category: 'finance',
    defaultAssumptions: {
      averageOrderValue: 50,
      ordersPerWeek: 1,
      customerRetentionRate: 0.92,
      costOfGoodsSoldPercent: 0.02,
      hoursPerWeek: 4,
      productionCapacityUtilization: 0.5,
      monthlyGrowthRate: 0.06,
      customerAcquisitionCost: 2,
    },
    factors: [
      { name: 'Savings Pool', weight: 0.25, description: 'Total community savings' },
      { name: 'Loan Repayment', weight: 0.25, description: 'On-time repayment rate' },
      { name: 'Member Participation', weight: 0.20, description: 'Active savers ratio' },
      { name: 'Interest Spread', weight: 0.15, description: 'Lending margin' },
      { name: 'Default Rate', weight: 0.15, description: 'Non-performing loans' },
    ],
  },
  {
    id: 'lets-make-bread',
    name: "Let's Make Bread",
    description: 'Cooperative manufacturing',
    category: 'finance',
    defaultAssumptions: {
      averageOrderValue: 65,
      ordersPerWeek: 8,
      customerRetentionRate: 0.75,
      costOfGoodsSoldPercent: 0.40,
      hoursPerWeek: 24,  // 3/5 platform, 2/5 personal
      productionCapacityUtilization: 0.75,
      monthlyGrowthRate: 0.07,
      customerAcquisitionCost: 10,
    },
    factors: [
      { name: 'Production Capacity', weight: 0.20, description: 'Items per week capability' },
      { name: 'Material Costs', weight: 0.20, description: 'Raw material expenses' },
      { name: 'Rush Order Ratio', weight: 0.15, description: '50% premium orders' },
      { name: 'Equipment Utilization', weight: 0.15, description: 'Machine uptime' },
      { name: 'Quality Rejection Rate', weight: 0.10, description: 'Failed prints/items' },
      { name: 'Personal Time Allocation', weight: 0.20, description: '2/5 days for own projects' },
    ],
  },
  {
    id: 'harper-guild',
    name: 'Harper Guild',
    description: 'HR & ethics for all',
    category: 'finance',
    defaultAssumptions: {
      averageOrderValue: 40,
      ordersPerWeek: 3,
      customerRetentionRate: 0.85,
      costOfGoodsSoldPercent: 0.15,
      hoursPerWeek: 12,
      productionCapacityUtilization: 0.7,
      monthlyGrowthRate: 0.05,
      customerAcquisitionCost: 8,
    },
    factors: [
      { name: 'Review Volume', weight: 0.25, description: 'Cases reviewed per week' },
      { name: 'Quality Score', weight: 0.25, description: 'Review accuracy rating' },
      { name: 'Turnaround Time', weight: 0.20, description: 'Review completion speed' },
      { name: 'Specialization', weight: 0.15, description: 'Expertise depth' },
      { name: 'Reputation', weight: 0.15, description: 'Community trust score' },
    ],
  },
  // Creative & Learning
  {
    id: 'jukebox',
    name: 'JukeBox',
    description: 'Fair music licensing',
    category: 'creative',
    defaultAssumptions: {
      averageOrderValue: 15,
      ordersPerWeek: 20,
      customerRetentionRate: 0.70,
      costOfGoodsSoldPercent: 0.50,
      hoursPerWeek: 10,
      productionCapacityUtilization: 0.8,
      monthlyGrowthRate: 0.10,
      customerAcquisitionCost: 3,
    },
    factors: [
      { name: 'Catalog Size', weight: 0.20, description: 'Tracks available' },
      { name: 'Licensing Revenue', weight: 0.25, description: 'Per-play earnings' },
      { name: 'Artist Payout', weight: 0.20, description: '83.3% to creators' },
      { name: 'Platform Plays', weight: 0.20, description: 'Monthly streams' },
      { name: 'New Submissions', weight: 0.15, description: 'Catalog growth' },
    ],
  },
  {
    id: 'didasko',
    name: 'Didasko (Academic)',
    description: 'BOUNTY K-12 curriculum',
    category: 'creative',
    defaultAssumptions: {
      averageOrderValue: 25,
      ordersPerWeek: 5,
      customerRetentionRate: 0.90,
      costOfGoodsSoldPercent: 0.10,
      hoursPerWeek: 15,
      productionCapacityUtilization: 0.6,
      monthlyGrowthRate: 0.08,
      customerAcquisitionCost: 5,
    },
    factors: [
      { name: 'Content Quality', weight: 0.25, description: 'Curriculum effectiveness' },
      { name: 'Student Engagement', weight: 0.20, description: 'Completion rates' },
      { name: 'Teacher Adoption', weight: 0.20, description: 'Educator uptake' },
      { name: 'Assessment Results', weight: 0.20, description: 'Learning outcomes' },
      { name: 'Content Volume', weight: 0.15, description: 'Lessons available' },
    ],
  },
  // Growth
  {
    id: 'power-to-the-people',
    name: 'Power to the People',
    description: 'Political expedition and civic engagement',
    category: 'growth',
    defaultAssumptions: {
      averageOrderValue: 30,
      ordersPerWeek: 2,
      customerRetentionRate: 0.80,
      costOfGoodsSoldPercent: 0.20,
      hoursPerWeek: 8,
      productionCapacityUtilization: 0.5,
      monthlyGrowthRate: 0.15,
      customerAcquisitionCost: 10,
    },
    factors: [
      { name: 'Civic Participation', weight: 0.25, description: 'Voter engagement' },
      { name: 'Policy Research', weight: 0.15, description: 'Issue analysis' },
      { name: 'Community Organizing', weight: 0.20, description: 'Grassroots mobilization' },
      { name: 'Transparency Index', weight: 0.20, description: 'Open governance' },
      { name: 'Coalition Building', weight: 0.20, description: 'Cross-initiative alignment' },
    ],
  },
  {
    id: 'brass-tacks',
    name: 'Brass Tacks',
    description: 'Medallion sponsorship program',
    category: 'growth',
    defaultAssumptions: {
      averageOrderValue: 25,
      ordersPerWeek: 1,
      customerRetentionRate: 0.95,
      costOfGoodsSoldPercent: 0.05,
      hoursPerWeek: 3,
      productionCapacityUtilization: 0.4,
      monthlyGrowthRate: 0.20,
      customerAcquisitionCost: 0,
    },
    factors: [
      { name: 'Sponsor Signups', weight: 0.30, description: 'New Johnny Appleseeds' },
      { name: 'Sponsored Members', weight: 0.25, description: 'Seedlings planted' },
      { name: 'Conversion Rate', weight: 0.20, description: 'Seedlings to full members' },
      { name: 'Sponsor Retention', weight: 0.15, description: 'Continuing sponsors' },
      { name: 'Network Effect', weight: 0.10, description: 'Referral multiplier' },
    ],
  },
  // Custom Business
  {
    id: 'custom',
    name: 'Custom Business',
    description: 'Your own business idea',
    category: 'growth',
    defaultAssumptions: {
      averageOrderValue: 50,
      ordersPerWeek: 5,
      customerRetentionRate: 0.70,
      costOfGoodsSoldPercent: 0.40,
      hoursPerWeek: 20,
      productionCapacityUtilization: 0.60,
      monthlyGrowthRate: 0.05,
      customerAcquisitionCost: 10,
    },
    factors: [
      { name: 'Market Demand', weight: 0.20, description: 'Customer need strength' },
      { name: 'Competitive Position', weight: 0.15, description: 'Market differentiation' },
      { name: 'Operational Efficiency', weight: 0.20, description: 'Cost management' },
      { name: 'Customer Acquisition', weight: 0.20, description: 'Growth capability' },
      { name: 'Revenue Stability', weight: 0.15, description: 'Income consistency' },
      { name: 'Scalability', weight: 0.10, description: 'Growth potential' },
    ],
  },
];

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Creates a new business scenario with default assumptions
 */
export function createBusinessScenario(
  initiativeId: string,
  customConfig?: Partial<BusinessAssumptions>
): BusinessScenario {
  const template = INITIATIVE_TEMPLATES.find(t => t.id === initiativeId)
    || INITIATIVE_TEMPLATES.find(t => t.id === 'custom')!;

  const defaultAssumptions = getDefaultAssumptions(initiativeId);

  return {
    name: `${template.name} Simulation`,
    initiativeId,
    initiativeName: template.name,
    category: template.category,
    assumptions: {
      ...defaultAssumptions,
      ...customConfig,
    },
    status: 'draft',
    createdAt: new Date(),
  };
}

/**
 * Returns platform economics defaults for an initiative
 */
export function getDefaultAssumptions(initiativeId: string): BusinessAssumptions {
  const template = INITIATIVE_TEMPLATES.find(t => t.id === initiativeId)
    || INITIATIVE_TEMPLATES.find(t => t.id === 'custom')!;

  return {
    averageOrderValue: template.defaultAssumptions.averageOrderValue || 50,
    ordersPerWeek: template.defaultAssumptions.ordersPerWeek || 5,
    customerRetentionRate: template.defaultAssumptions.customerRetentionRate || 0.70,
    costOfGoodsSoldPercent: template.defaultAssumptions.costOfGoodsSoldPercent || 0.40,
    platformFeePercent: 1 - PLATFORM_ECONOMICS.CREATOR_SHARE,  // Always 16.7%
    hoursPerWeek: template.defaultAssumptions.hoursPerWeek || 20,
    productionCapacityUtilization: template.defaultAssumptions.productionCapacityUtilization || 0.60,
    monthlyGrowthRate: template.defaultAssumptions.monthlyGrowthRate || 0.05,
    customerAcquisitionCost: template.defaultAssumptions.customerAcquisitionCost || 10,
    customFactors: {},
  };
}

/**
 * Calculates projected outcomes from assumptions
 */
export function calculateProjectedOutcomes(
  assumptions: BusinessAssumptions,
  monthsToProject: number = 12
): BusinessProjections {
  // Weekly calculations
  const weeklyRevenue = assumptions.averageOrderValue * assumptions.ordersPerWeek;
  const weeklyCOGS = weeklyRevenue * assumptions.costOfGoodsSoldPercent;
  const weeklyPlatformFee = weeklyRevenue * assumptions.platformFeePercent;
  const weeklyProfit = weeklyRevenue - weeklyCOGS - weeklyPlatformFee;

  // Monthly (4.33 weeks/month)
  const monthlyRevenue = weeklyRevenue * 4.33;
  const monthlyProfit = weeklyProfit * 4.33;
  const monthlyExpenses = (weeklyCOGS + weeklyPlatformFee) * 4.33;

  // Apply growth over projection period
  let cumulativeRevenue = 0;
  let currentMonthlyRevenue = monthlyRevenue;
  for (let m = 0; m < monthsToProject; m++) {
    cumulativeRevenue += currentMonthlyRevenue;
    currentMonthlyRevenue *= (1 + assumptions.monthlyGrowthRate);
  }
  const annualRevenue = cumulativeRevenue;
  const annualProfit = annualRevenue * (weeklyProfit / weeklyRevenue);

  // Break-even analysis (simplified)
  const fixedCosts = assumptions.customerAcquisitionCost * 10;  // Assume 10 initial customers
  const profitPerOrder = (assumptions.averageOrderValue * PLATFORM_ECONOMICS.CREATOR_SHARE)
    - (assumptions.averageOrderValue * assumptions.costOfGoodsSoldPercent);
  const breakEvenOrders = fixedCosts > 0 ? Math.ceil(fixedCosts / profitPerOrder) : 0;
  const breakEvenMonths = Math.ceil(breakEvenOrders / (assumptions.ordersPerWeek * 4.33));

  // Metrics
  const profitMargin = weeklyRevenue > 0 ? weeklyProfit / weeklyRevenue : 0;
  const returnOnTime = assumptions.hoursPerWeek > 0 ? weeklyProfit / assumptions.hoursPerWeek : 0;

  // Net score (0-1 scale based on profitability and sustainability)
  const profitabilityScore = Math.min(1, Math.max(0, profitMargin * 2));
  const sustainabilityScore = Math.min(1, assumptions.customerRetentionRate);
  const utilizationScore = assumptions.productionCapacityUtilization;
  const netScore = (profitabilityScore * 0.4) + (sustainabilityScore * 0.35) + (utilizationScore * 0.25);

  return {
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    annualRevenue,
    annualProfit,
    breakEvenMonths,
    breakEvenOrders,
    profitMargin,
    returnOnTime,
    netScore,
    confidence: 0.3,  // Low confidence until real data available
  };
}

/**
 * Creates a thought experiment in Supabase from a business scenario
 */
export async function createThoughtExperiment(
  scenario: BusinessScenario,
  userId?: string
): Promise<{ id: string } | null> {
  const template = INITIATIVE_TEMPLATES.find(t => t.id === scenario.initiativeId);
  if (!template) return null;

  const projections = calculateProjectedOutcomes(scenario.assumptions);

  try {
    const { data, error } = await supabase
      .from('thought_experiments')
      .insert({
        name: scenario.name,
        description: `Business simulation for ${scenario.initiativeName}`,
        delta_type: 'initiative',
        delta_description: `What if I started a ${scenario.initiativeName} business?`,
        delta_config: {
          initiativeId: scenario.initiativeId,
          assumptions: scenario.assumptions,
        },
        chain_depth: 3,
        factors: template.factors,
        extension_threshold: 0.15,
        max_extensions: 2,
        status: 'running',
        current_net_score: projections.netScore,
        created_by: userId || null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to create thought experiment:', err);
    return null;
  }
}

/**
 * Gets initiative template by ID
 */
export function getInitiativeTemplate(initiativeId: string): InitiativeTemplate | undefined {
  return INITIATIVE_TEMPLATES.find(t => t.id === initiativeId);
}

/**
 * Gets all initiative templates grouped by category
 */
export function getInitiativesByCategory(): Record<string, InitiativeTemplate[]> {
  return INITIATIVE_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, InitiativeTemplate[]>);
}
