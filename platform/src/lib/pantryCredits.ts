/**
 * The Pantry — Recipe Credit System
 * ==================================
 * Recipe creators earn credits from LB's 20% margin when their recipes are used.
 * 
 * Credit Model:
 * - Base rate: $0.05 per use (from LB's 16.7% margin)
 * - Vote multiplier: Popular recipes earn more (up to 5x)
 * - Diminishing returns: Credits decrease as total uses grow
 * - Lifetime cap: $500 maximum per recipe
 * - After cap: Cooking Spoon badges awarded instead of credits
 */

export interface CreditCalculation {
  credits: number;
  baseRate: number;
  voteMultiplier: number;
  diminishingFactor: number;
  isCapped: boolean;
  totalCreditsEarned: number;
  creditsRemaining: number;
}

export interface RecipeStats {
  voteCount: number;
  makeCount: number;
  totalUses: number;
  totalCreditsEarned: number;
  isCapped: boolean;
}

// Credit system constants
export const CREDIT_CONSTANTS = {
  BASE_RATE: 0.05, // $0.05 base per use
  LIFETIME_CAP: 500, // $500 maximum per recipe
  MAX_VOTE_MULTIPLIER: 5, // Maximum 5x multiplier
  DIMINISHING_THRESHOLD: 10000, // Uses at which diminishing returns start heavily
  MIN_DIMINISHING_FACTOR: 0.1, // Minimum 10% of base rate
} as const;

/**
 * Calculate the vote multiplier based on vote count
 * Uses logarithmic scaling: min(5, 1 + log10(votes + 1))
 * 
 * Examples:
 * - 0 votes → 1x
 * - 9 votes → 2x
 * - 99 votes → 3x
 * - 999 votes → 4x
 * - 9999+ votes → 5x (capped)
 */
export function calculateVoteMultiplier(voteCount: number): number {
  if (voteCount <= 0) return 1;
  return Math.min(
    CREDIT_CONSTANTS.MAX_VOTE_MULTIPLIER, 
    1 + Math.log10(voteCount + 1)
  );
}

/**
 * Calculate the diminishing factor based on total uses
 * Uses linear scaling: max(0.1, 1 - (uses / 10000))
 * 
 * Examples:
 * - 0 uses → 100%
 * - 2500 uses → 75%
 * - 5000 uses → 50%
 * - 7500 uses → 25%
 * - 9000+ uses → 10% (minimum)
 */
export function calculateDiminishingFactor(totalUses: number): number {
  if (totalUses <= 0) return 1;
  return Math.max(
    CREDIT_CONSTANTS.MIN_DIMINISHING_FACTOR,
    1 - (totalUses / CREDIT_CONSTANTS.DIMINISHING_THRESHOLD)
  );
}

/**
 * Calculate credits for a single recipe use
 * @param stats - Current recipe statistics
 * @returns Credit calculation details
 */
export function calculateRecipeCredit(stats: RecipeStats): CreditCalculation {
  const { voteCount, totalUses, totalCreditsEarned, isCapped } = stats;
  
  // If already capped, no more credits
  if (isCapped || totalCreditsEarned >= CREDIT_CONSTANTS.LIFETIME_CAP) {
    return {
      credits: 0,
      baseRate: CREDIT_CONSTANTS.BASE_RATE,
      voteMultiplier: calculateVoteMultiplier(voteCount),
      diminishingFactor: calculateDiminishingFactor(totalUses),
      isCapped: true,
      totalCreditsEarned,
      creditsRemaining: 0
    };
  }
  
  // Calculate multipliers
  const voteMultiplier = calculateVoteMultiplier(voteCount);
  const diminishingFactor = calculateDiminishingFactor(totalUses);
  
  // Calculate raw credits
  let credits = CREDIT_CONSTANTS.BASE_RATE * voteMultiplier * diminishingFactor;
  
  // Round to 4 decimal places
  credits = Math.round(credits * 10000) / 10000;
  
  // Check if this use would exceed the cap
  const creditsRemaining = CREDIT_CONSTANTS.LIFETIME_CAP - totalCreditsEarned;
  const willBeCapped = credits >= creditsRemaining;
  
  // Cap credits if needed
  if (willBeCapped) {
    credits = creditsRemaining;
  }
  
  return {
    credits,
    baseRate: CREDIT_CONSTANTS.BASE_RATE,
    voteMultiplier,
    diminishingFactor,
    isCapped: willBeCapped,
    totalCreditsEarned: totalCreditsEarned + credits,
    creditsRemaining: Math.max(0, creditsRemaining - credits)
  };
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1) {
    return `$${credits.toFixed(2)}`;
  }
  // Show cents for small amounts
  return `${(credits * 100).toFixed(1)}¢`;
}

/**
 * Calculate projected earnings for a recipe
 * @param voteCount - Current vote count
 * @param projectedUses - Number of uses to project
 * @returns Total projected earnings
 */
export function projectRecipeEarnings(
  voteCount: number,
  projectedUses: number,
  currentCredits: number = 0
): number {
  let total = currentCredits;
  
  for (let i = 0; i < projectedUses; i++) {
    if (total >= CREDIT_CONSTANTS.LIFETIME_CAP) break;
    
    const calc = calculateRecipeCredit({
      voteCount,
      makeCount: 0, // Not used in calculation
      totalUses: i,
      totalCreditsEarned: total,
      isCapped: false
    });
    
    total += calc.credits;
  }
  
  return Math.min(total, CREDIT_CONSTANTS.LIFETIME_CAP);
}

/**
 * Calculate badge eligibility based on recipe stats
 */
export interface BadgeEligibility {
  cookingSpoon: number; // Level 0-5
  hotPepper: number; // Level 0-5
}

export const COOKING_SPOON_THRESHOLDS = [
  { level: 1, makes: 10, recipes: 5 },
  { level: 2, makes: 25, recipes: 10 },
  { level: 3, makes: 50, recipes: 25 },
  { level: 4, makes: 100, recipes: 50 },
  { level: 5, makes: 250, recipes: 100 },
] as const;

export const HOT_PEPPER_THRESHOLDS = [
  { level: 1, uses: 100 },
  { level: 2, uses: 500 },
  { level: 3, uses: 1000 },
  { level: 4, uses: 5000 },
  { level: 5, uses: 10000 },
] as const;

/**
 * Calculate Cooking Spoon badge level
 * Based on total recipes with X+ makes
 */
export function calculateCookingSpoonLevel(
  recipesWithMakes: { makeCount: number }[]
): number {
  for (let i = COOKING_SPOON_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = COOKING_SPOON_THRESHOLDS[i];
    const qualifyingRecipes = recipesWithMakes.filter(
      r => r.makeCount >= threshold.makes
    ).length;
    
    if (qualifyingRecipes >= threshold.recipes) {
      return threshold.level;
    }
  }
  return 0;
}

/**
 * Calculate Hot Pepper badge level
 * Based on highest-used single recipe
 */
export function calculateHotPepperLevel(maxRecipeUses: number): number {
  for (let i = HOT_PEPPER_THRESHOLDS.length - 1; i >= 0; i--) {
    const threshold = HOT_PEPPER_THRESHOLDS[i];
    if (maxRecipeUses >= threshold.uses) {
      return threshold.level;
    }
  }
  return 0;
}

/**
 * Get badge eligibility for a creator
 */
export function calculateBadgeEligibility(
  recipesWithMakes: { makeCount: number; totalUses: number }[]
): BadgeEligibility {
  const maxUses = Math.max(0, ...recipesWithMakes.map(r => r.totalUses));
  
  return {
    cookingSpoon: calculateCookingSpoonLevel(recipesWithMakes),
    hotPepper: calculateHotPepperLevel(maxUses)
  };
}

/**
 * Generate a description of how credits work for UI
 */
export function getCreditExplanation(): string {
  return `Recipe creators earn credits when their recipes are used. 
  Base rate: ${formatCredits(CREDIT_CONSTANTS.BASE_RATE)} per use. 
  Popular recipes with more votes earn up to ${CREDIT_CONSTANTS.MAX_VOTE_MULTIPLIER}x more. 
  Credits decrease gradually after many uses. 
  Lifetime cap: ${formatCredits(CREDIT_CONSTANTS.LIFETIME_CAP)} per recipe. 
  After the cap, Cooking Spoon badges are awarded instead.`;
}
