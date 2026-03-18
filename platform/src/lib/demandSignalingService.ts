/**
 * DEMAND SIGNALING SERVICE — Shadow Mark Per-Area Allocation Engine
 * ================================================================
 * Implements innovations #1710-#1719 (Bishop Session 012):
 *   - Per-area context-triggered Shadow Mark allocation
 *   - Brewster's Millions forced distribution across pedestals
 *   - 50% carry-forward persistence compounding
 *   - 3-day crystallization threshold
 *   - Beacon streak persistence amplifier
 *   - Pre-operational feature thermometer data
 *
 * SEC-safe: effort-earned currency backed by patent portfolio,
 * not investment. Fails all 4 Howey prongs.
 */

// ─── Area Allocation Configuration ───

export type AreaCategory =
  | 'marketplace'
  | 'services'
  | 'infrastructure'
  | 'governance'
  | 'hexisle'
  | 'community';

export interface AreaAllocationConfig {
  category: AreaCategory;
  label: string;
  shadowMarksPerEntry: number;
  rechargeCooldownHours: number;
  icon: string;
}

export const AREA_ALLOCATIONS: Record<AreaCategory, AreaAllocationConfig> = {
  marketplace:     { category: 'marketplace',     label: 'Marketplace',    shadowMarksPerEntry: 50, rechargeCooldownHours: 24, icon: '🏪' },
  services:        { category: 'services',        label: 'Services',       shadowMarksPerEntry: 30, rechargeCooldownHours: 24, icon: '🛎️' },
  infrastructure:  { category: 'infrastructure',  label: 'Infrastructure', shadowMarksPerEntry: 40, rechargeCooldownHours: 24, icon: '🔧' },
  governance:      { category: 'governance',      label: 'Governance',     shadowMarksPerEntry: 20, rechargeCooldownHours: 24, icon: '🏛️' },
  hexisle:         { category: 'hexisle',         label: 'HexIsle',        shadowMarksPerEntry: 50, rechargeCooldownHours: 24, icon: '⬡' },
  community:       { category: 'community',       label: 'Community',      shadowMarksPerEntry: 30, rechargeCooldownHours: 24, icon: '🤝' },
};

// ─── Beacon Streak Persistence Boost ───

export interface BeaconStreakTier {
  minDays: number;
  carryForwardRate: number;
  crystallizationDays: number;
  label: string;
}

export const BEACON_STREAK_TIERS: BeaconStreakTier[] = [
  { minDays: 90,  carryForwardRate: 0.75, crystallizationDays: 2,  label: '90-Day Veteran' },
  { minDays: 30,  carryForwardRate: 0.70, crystallizationDays: 2,  label: '30-Day Regular' },
  { minDays: 14,  carryForwardRate: 0.65, crystallizationDays: 2,  label: '14-Day Engaged' },
  { minDays: 7,   carryForwardRate: 0.60, crystallizationDays: 3,  label: '7-Day Active' },
  { minDays: 3,   carryForwardRate: 0.55, crystallizationDays: 3,  label: '3-Day Streak' },
  { minDays: 0,   carryForwardRate: 0.50, crystallizationDays: 3,  label: 'Base' },
];

export function getBeaconTier(streakDays: number): BeaconStreakTier {
  return BEACON_STREAK_TIERS.find(t => streakDays >= t.minDays) ?? BEACON_STREAK_TIERS[BEACON_STREAK_TIERS.length - 1];
}

// ─── Pedestal / Pre-Operational Feature ───

export type PedestalStatus = 'pre-operational' | 'alpha' | 'beta' | 'operational';

export interface Pedestal {
  id: string;
  featureName: string;
  description: string;
  area: AreaCategory;
  status: PedestalStatus;
  activationThreshold: number;
  currentCommitments: number;
  creditPledges: number;
  shadowMarkTotal: number;
  alphaLeadWeeks: number;
  betaLeadWeeks: number;
  operationalLeadWeeks: number;
  icon: string;
}

// ─── User Allocation State ───

export interface UserPedestalAllocation {
  pedestalId: string;
  freshToday: number;
  carryForward: number;
  total: number;
  consecutiveDays: number;
  crystallized: number;
  lastAllocatedAt: string | null;
}

export interface UserAreaState {
  area: AreaCategory;
  lastEntryAt: string | null;
  availableSM: number;
  allocations: UserPedestalAllocation[];
}

// ─── Carry-Forward Math ───

/**
 * Calculate carry-forward accumulation over consecutive days.
 * Geometric series: sum = X / (1 - r) where X = daily, r = carry rate.
 * Day N total = X * (1 - r^N) / (1 - r)
 */
export function calculateCarryForward(
  dailyAllocation: number,
  consecutiveDays: number,
  carryRate: number,
): { total: number; carryPortion: number; freshPortion: number } {
  if (consecutiveDays <= 0) return { total: 0, carryPortion: 0, freshPortion: 0 };
  if (consecutiveDays === 1) return { total: dailyAllocation, carryPortion: 0, freshPortion: dailyAllocation };

  const total = dailyAllocation * (1 - Math.pow(carryRate, consecutiveDays)) / (1 - carryRate);
  return {
    total: Math.round(total * 100) / 100,
    carryPortion: Math.round((total - dailyAllocation) * 100) / 100,
    freshPortion: dailyAllocation,
  };
}

/**
 * Asymptotic maximum for carry-forward (geometric series limit).
 */
export function carryForwardLimit(dailyAllocation: number, carryRate: number): number {
  return dailyAllocation / (1 - carryRate);
}

// ─── Crystallization Logic ───

export interface CrystallizationResult {
  eligible: boolean;
  crystallizableAmount: number;
  daysUntilCrystallization: number;
  progressPercent: number;
}

export function calculateCrystallization(
  allocation: UserPedestalAllocation,
  crystallizationDays: number,
): CrystallizationResult {
  const daysRemaining = Math.max(0, crystallizationDays - allocation.consecutiveDays);
  const eligible = allocation.consecutiveDays >= crystallizationDays;
  const crystallizable = eligible ? Math.floor(allocation.carryForward) : 0;
  const progress = Math.min(100, (allocation.consecutiveDays / crystallizationDays) * 100);

  return {
    eligible,
    crystallizableAmount: crystallizable,
    daysUntilCrystallization: daysRemaining,
    progressPercent: progress,
  };
}

// ─── Thermometer Display Data ───

export interface ThermometerData {
  pedestal: Pedestal;
  progressPercent: number;
  commitmentCount: number;
  activationThreshold: number;
  estimatedDaysToThreshold: number | null;
  milestones: {
    label: string;
    reached: boolean;
    leadsToWeeks: number;
  }[];
}

export function buildThermometerData(
  pedestal: Pedestal,
  dailyGrowthRate: number = 0,
): ThermometerData {
  const progress = Math.min(100, (pedestal.currentCommitments / pedestal.activationThreshold) * 100);
  const remaining = pedestal.activationThreshold - pedestal.currentCommitments;
  const estDays = dailyGrowthRate > 0 ? Math.ceil(remaining / dailyGrowthRate) : null;

  return {
    pedestal,
    progressPercent: Math.round(progress * 10) / 10,
    commitmentCount: pedestal.currentCommitments,
    activationThreshold: pedestal.activationThreshold,
    estimatedDaysToThreshold: estDays,
    milestones: [
      { label: 'Alpha', reached: pedestal.status !== 'pre-operational', leadsToWeeks: pedestal.alphaLeadWeeks },
      { label: 'Beta', reached: pedestal.status === 'beta' || pedestal.status === 'operational', leadsToWeeks: pedestal.betaLeadWeeks },
      { label: 'Operational', reached: pedestal.status === 'operational', leadsToWeeks: pedestal.operationalLeadWeeks },
    ],
  };
}

// ─── Ranked Choice Production Tier ───

export type TierPreferenceStatus = 'active' | 'cascaded' | 'filled' | 'expired' | 'cancelled';

export interface ProductionTierPreference {
  userId: string;
  featureId: string;
  primaryTier: number;
  primaryPrice: number;
  primaryTimeWindowDays: number;
  fallbackTier: number;
  fallbackPrice: number;
  fallbackTimeWindowDays: number;
  creditHold: number;
  unitCount: number;
  expiresAt: string;
  createdAt: string;
  status: TierPreferenceStatus;
  cascadedAt?: string;
  filledAt?: string;
}

/**
 * Calculate units received after cascade to cheaper tier.
 */
export function cascadeUnits(
  creditHold: number,
  originalPrice: number,
  cascadePrice: number,
): { originalUnits: number; cascadedUnits: number; bonusUnits: number } {
  const originalUnits = Math.floor(creditHold / originalPrice);
  const cascadedUnits = Math.floor(creditHold / cascadePrice);
  return {
    originalUnits,
    cascadedUnits,
    bonusUnits: cascadedUnits - originalUnits,
  };
}

// ─── Sample Pre-Operational Pedestals ───

export const SAMPLE_PEDESTALS: Pedestal[] = [
  {
    id: 'business-cards', featureName: 'Business Cards', area: 'services', status: 'pre-operational',
    description: 'Premium business cards printed through our cooperative network. Moo, Vistaprint, GotPrint. Cost+20%.',
    activationThreshold: 200, currentCommitments: 47, creditPledges: 1250, shadowMarkTotal: 890,
    alphaLeadWeeks: 2, betaLeadWeeks: 4, operationalLeadWeeks: 6, icon: '💳',
  },
  {
    id: 'letterhead', featureName: 'Letterhead', area: 'services', status: 'pre-operational',
    description: 'Custom letterhead with cooperative branding. Multiple paper stocks and finishes.',
    activationThreshold: 150, currentCommitments: 12, creditPledges: 300, shadowMarkTotal: 180,
    alphaLeadWeeks: 2, betaLeadWeeks: 4, operationalLeadWeeks: 6, icon: '📄',
  },
  {
    id: 'medallion-coins', featureName: 'Medallion Coins', area: 'services', status: 'pre-operational',
    description: 'Custom challenge coins and medallions. Die-cast metal with enamel fill.',
    activationThreshold: 100, currentCommitments: 34, creditPledges: 2100, shadowMarkTotal: 620,
    alphaLeadWeeks: 4, betaLeadWeeks: 6, operationalLeadWeeks: 8, icon: '🪙',
  },
  {
    id: 'tshirt-printing', featureName: 'T-Shirt Printing', area: 'services', status: 'pre-operational',
    description: 'DTG and screen print t-shirts. Volume discounts shared with members.',
    activationThreshold: 300, currentCommitments: 89, creditPledges: 4500, shadowMarkTotal: 1340,
    alphaLeadWeeks: 2, betaLeadWeeks: 3, operationalLeadWeeks: 4, icon: '👕',
  },
  {
    id: 'sticker-sheets', featureName: 'Sticker Sheets', area: 'services', status: 'pre-operational',
    description: 'Custom die-cut stickers. Full color, weatherproof vinyl or paper.',
    activationThreshold: 250, currentCommitments: 156, creditPledges: 3800, shadowMarkTotal: 2100,
    alphaLeadWeeks: 1, betaLeadWeeks: 2, operationalLeadWeeks: 3, icon: '🏷️',
  },
  {
    id: 'hexisle-expansion-packs', featureName: 'HexIsle Expansion Packs', area: 'hexisle', status: 'pre-operational',
    description: 'Custom Hexel terrain packs: Desert, Arctic, Volcanic. 7-tile sets with unique mechanisms.',
    activationThreshold: 500, currentCommitments: 78, creditPledges: 9500, shadowMarkTotal: 3200,
    alphaLeadWeeks: 8, betaLeadWeeks: 12, operationalLeadWeeks: 16, icon: '⬡',
  },
  {
    id: 'poster-printing', featureName: 'Poster Printing', area: 'services', status: 'pre-operational',
    description: 'Large format poster printing. Archival quality, multiple sizes and substrates.',
    activationThreshold: 200, currentCommitments: 23, creditPledges: 680, shadowMarkTotal: 340,
    alphaLeadWeeks: 2, betaLeadWeeks: 3, operationalLeadWeeks: 4, icon: '🖼️',
  },
  {
    id: 'label-printing', featureName: 'Label Printing', area: 'services', status: 'pre-operational',
    description: 'Product labels, jar labels, shipping labels. Roll and sheet formats.',
    activationThreshold: 150, currentCommitments: 8, creditPledges: 120, shadowMarkTotal: 90,
    alphaLeadWeeks: 2, betaLeadWeeks: 3, operationalLeadWeeks: 4, icon: '🏷️',
  },
];
