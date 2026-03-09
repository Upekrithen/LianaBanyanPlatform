// Patent Valuation Logic — Relief-from-Royalty Method
// Based on ReCast Handoff (December 11, 2025) and February 24, 2026 filing

import type { Category, InnovationValuation } from './patentBuckets';

// Base rates by category (1-year values in USD)
const baseRates: Record<Category, {
  oneYearMin: number;
  oneYearMax: number;
  fiveYearMinMult: number;
  fiveYearMaxMult: number;
  tenYearMinMult: number;
  tenYearMaxMult: number;
}> = {
  Economics:      { oneYearMin: 50_000, oneYearMax: 100_000, fiveYearMinMult: 5,  fiveYearMaxMult: 10, tenYearMinMult: 20, tenYearMaxMult: 50 },
  Platform:       { oneYearMin: 25_000, oneYearMax: 75_000,  fiveYearMinMult: 4,  fiveYearMaxMult: 8,  tenYearMinMult: 15, tenYearMaxMult: 40 },
  UX:             { oneYearMin: 15_000, oneYearMax: 50_000,  fiveYearMinMult: 3,  fiveYearMaxMult: 6,  tenYearMinMult: 10, tenYearMaxMult: 30 },
  Security:       { oneYearMin: 40_000, oneYearMax: 100_000, fiveYearMinMult: 5,  fiveYearMaxMult: 12, tenYearMinMult: 25, tenYearMaxMult: 60 },
  Manufacturing:  { oneYearMin: 30_000, oneYearMax: 80_000,  fiveYearMinMult: 4,  fiveYearMaxMult: 10, tenYearMinMult: 20, tenYearMaxMult: 50 },
  Governance:     { oneYearMin: 20_000, oneYearMax: 60_000,  fiveYearMinMult: 3,  fiveYearMaxMult: 7,  tenYearMinMult: 12, tenYearMaxMult: 35 },
};

export type Scenario = 'conservative' | 'moderate' | 'aggressive';

/**
 * Calculate valuation for a single innovation using Relief-from-Royalty method
 * 
 * Crown jewels receive 2-3x multiplier based on scenario:
 * - Conservative: 2x
 * - Moderate: 2.5x
 * - Aggressive: 3x
 */
export function valueInnovation(
  category: Category,
  isCrownJewel: boolean,
): InnovationValuation {
  const base = baseRates[category];

  // Crown jewel multipliers
  const crownMultipliers = {
    conservative: isCrownJewel ? 2 : 1,
    moderate: isCrownJewel ? 2.5 : 1,
    aggressive: isCrownJewel ? 3 : 1,
  };

  // Calculate 1-year values
  const oneYearBase = {
    conservative: base.oneYearMin,
    moderate: (base.oneYearMin + base.oneYearMax) / 2,
    aggressive: base.oneYearMax,
  };

  // Calculate multipliers for 5 and 10 year
  const fiveYearMult = {
    conservative: base.fiveYearMinMult,
    moderate: (base.fiveYearMinMult + base.fiveYearMaxMult) / 2,
    aggressive: base.fiveYearMaxMult,
  };

  const tenYearMult = {
    conservative: base.tenYearMinMult,
    moderate: (base.tenYearMinMult + base.tenYearMaxMult) / 2,
    aggressive: base.tenYearMaxMult,
  };

  return {
    oneYear: {
      conservative: oneYearBase.conservative * crownMultipliers.conservative,
      moderate: oneYearBase.moderate * crownMultipliers.moderate,
      aggressive: oneYearBase.aggressive * crownMultipliers.aggressive,
    },
    fiveYear: {
      conservative: oneYearBase.conservative * fiveYearMult.conservative * crownMultipliers.conservative,
      moderate: oneYearBase.moderate * fiveYearMult.moderate * crownMultipliers.moderate,
      aggressive: oneYearBase.aggressive * fiveYearMult.aggressive * crownMultipliers.aggressive,
    },
    tenYear: {
      conservative: oneYearBase.conservative * tenYearMult.conservative * crownMultipliers.conservative,
      moderate: oneYearBase.moderate * tenYearMult.moderate * crownMultipliers.moderate,
      aggressive: oneYearBase.aggressive * tenYearMult.aggressive * crownMultipliers.aggressive,
    },
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format valuation range for display
 */
export function formatValuationRange(
  conservative: number,
  aggressive: number,
): string {
  return `${formatCurrency(conservative)} – ${formatCurrency(aggressive)}`;
}

/**
 * Calculate funding thresholds for ownership percentages
 * Based on ReCast handoff methodology
 */
export function calculateFundingThresholds(
  oneYearModerate: number,
): {
  fivePercent: number;
  tenPercent: number;
  twentyFivePercent: number;
  fortyPercent: number;
} {
  // Funding thresholds are based on percentage of 1-year moderate valuation
  // These match the pattern from the Behemoth portfolio
  return {
    fivePercent: Math.round(oneYearModerate * 0.05),
    tenPercent: Math.round(oneYearModerate * 0.10),
    twentyFivePercent: Math.round(oneYearModerate * 0.25),
    fortyPercent: Math.round(oneYearModerate * 0.40),
  };
}
