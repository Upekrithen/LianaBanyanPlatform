/**
 * Badge Awards System
 * ====================
 * Calculates and awards badges based on user achievements.
 *
 * Badge Categories:
 * - lb_achievement: Platform-wide achievements
 * - guild: Guild membership badges
 * - lone_wolf: Solo contractor progression
 * - skill: Skill certifications
 * - clan: Tribe/Clan membership
 * - food: Food ecosystem badges (NEW)
 */

import { supabase } from "@/integrations/supabase/client";
import {
  COOKING_SPOON_THRESHOLDS,
  HOT_PEPPER_THRESHOLDS,
  calculateCookingSpoonLevel,
  calculateHotPepperLevel
} from "./pantryCredits";

// Badge definitions
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string; // Emoji or icon name
  levels?: number;
  color: string;
}

export const FOOD_BADGES: BadgeDefinition[] = [
  {
    id: 'cooking_spoon',
    name: 'Cooking Spoon',
    description: 'Earned by sharing recipes that others cook',
    category: 'food',
    icon: '🥄',
    levels: 5,
    color: 'amber',
  },
  {
    id: 'hot_pepper',
    name: 'Hot Pepper',
    description: 'Earned when your recipe goes viral',
    category: 'food',
    icon: '🌶️',
    levels: 5,
    color: 'rose',
  },
  {
    id: 'chef_hat',
    name: 'Chef Hat',
    description: 'Certified meal provider on Let\'s Make Dinner',
    category: 'food',
    icon: '👨‍🍳',
    levels: 3,
    color: 'white',
  },
  {
    id: 'meal_saver',
    name: 'Meal Saver',
    description: 'Meals provided to those in need',
    category: 'food',
    icon: '❤️',
    levels: 5,
    color: 'red',
  },
  {
    id: 'grocery_runner',
    name: 'Grocery Runner',
    description: 'Completed delivery jobs',
    category: 'food',
    icon: '🛒',
    levels: 5,
    color: 'emerald',
  },
];

export const DELIVERY_BADGES: BadgeDefinition[] = [
  {
    id: 'first_delivery',
    name: 'First Delivery',
    description: 'Completed your first grocery delivery',
    category: 'delivery',
    icon: '📦',
    color: 'blue',
  },
  {
    id: 'neighborhood_hero',
    name: 'Neighborhood Hero',
    description: 'Completed 10 deliveries in your area',
    category: 'delivery',
    icon: '🦸',
    color: 'purple',
  },
  {
    id: 'five_star',
    name: 'Five Star',
    description: 'Maintained 5-star rating for 25+ deliveries',
    category: 'delivery',
    icon: '⭐',
    color: 'amber',
  },
];

export const TASTE_TESTER_BADGES: BadgeDefinition[] = [
  {
    id: 'taste_tester',
    name: 'Taste Tester',
    description: 'Early adopter of new recipes',
    category: 'taste',
    icon: '🍽️',
    levels: 5,
    color: 'purple',
  },
  {
    id: 'master_taster',
    name: 'Master Taster',
    description: 'Tested 10+ recipes that reached 5K orders',
    category: 'taste',
    icon: '🏆',
    color: 'amber',
  },
  {
    id: 'recipe_scout',
    name: 'Recipe Scout',
    description: 'Found hidden gem recipes before they went viral',
    category: 'taste',
    icon: '🔍',
    levels: 3,
    color: 'emerald',
  },
];

export const DOCUMENTATION_BADGES: BadgeDefinition[] = [
  {
    id: 'helpful_guide',
    name: 'Helpful Guide',
    description: 'Contributed documentation that helped others',
    category: 'documentation',
    icon: '📚',
    levels: 5,
    color: 'blue',
  },
  {
    id: 'cottage_expert',
    name: 'Cottage Expert',
    description: 'Verified contributor of cottage law guides',
    category: 'documentation',
    icon: '🏠',
    color: 'amber',
  },
  {
    id: 'knowledge_keeper',
    name: 'Knowledge Keeper',
    description: 'Featured documentation with 50+ helpful votes',
    category: 'documentation',
    icon: '🧠',
    color: 'purple',
  },
];

export const RECIPE_PORTFOLIO_BADGES: BadgeDefinition[] = [
  {
    id: 'secret_keeper',
    name: 'Secret Keeper',
    description: 'Managing proprietary recipes',
    category: 'portfolio',
    icon: '🔐',
    levels: 3,
    color: 'slate',
  },
  {
    id: 'recipe_graduate',
    name: 'Recipe Graduate',
    description: 'Successfully graduated a recipe to the Pantry',
    category: 'portfolio',
    icon: '🎓',
    color: 'emerald',
  },
  {
    id: 'icing_earner',
    name: 'Icing Earner',
    description: 'Earned Icing from popular vetted recipes',
    category: 'portfolio',
    icon: '🧁',
    levels: 5,
    color: 'rose',
  },
];

export const ALL_BADGES = [
  ...FOOD_BADGES,
  ...DELIVERY_BADGES,
  ...TASTE_TESTER_BADGES,
  ...DOCUMENTATION_BADGES,
  ...RECIPE_PORTFOLIO_BADGES
];

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return ALL_BADGES.find(b => b.id === badgeId);
}

/**
 * Calculate level description for tiered badges
 */
export function getLevelDescription(badgeId: string, level: number): string {
  switch (badgeId) {
    case 'cooking_spoon':
      const spoonThreshold = COOKING_SPOON_THRESHOLDS.find(t => t.level === level);
      return spoonThreshold
        ? `${spoonThreshold.recipes}+ recipes with ${spoonThreshold.makes}+ makes each`
        : '';

    case 'hot_pepper':
      const pepperThreshold = HOT_PEPPER_THRESHOLDS.find(t => t.level === level);
      return pepperThreshold
        ? `Recipe reached ${pepperThreshold.uses.toLocaleString()}+ uses`
        : '';

    case 'chef_hat':
      const chefLevels = ['10+ meals', '50+ meals', '200+ meals'];
      return chefLevels[level - 1] || '';

    case 'meal_saver':
      const mealLevels = ['5 charity meals', '25 charity meals', '100 charity meals', '500 charity meals', '1000+ charity meals'];
      return mealLevels[level - 1] || '';

    case 'grocery_runner':
      const runnerLevels = ['5 deliveries', '25 deliveries', '100 deliveries', '500 deliveries', '1000+ deliveries'];
      return runnerLevels[level - 1] || '';

    default:
      return `Level ${level}`;
  }
}

// ============================================================================
// BADGE CALCULATION
// ============================================================================

/**
 * Calculate all food ecosystem badges for a user
 */
export async function calculateFoodBadges(userId: string): Promise<{
  cookingSpoon: number;
  hotPepper: number;
  chefHat: number;
  mealSaver: number;
  groceryRunner: number;
}> {
  // Get recipe stats
  const { data: recipes } = await supabase
    .from('pantry_recipes')
    .select('id, make_count, vote_count')
    .eq('creator_id', userId);

  // Get LMD chef stats
  const { data: chefStats } = await supabase
    .from('lmd_meals')
    .select('id, is_charity, portions_claimed')
    .eq('chef_id', userId);

  // Get delivery stats
  const { data: deliveryStats } = await supabase
    .from('delivery_worker_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Calculate Cooking Spoon
  const cookingSpoon = recipes
    ? calculateCookingSpoonLevel(recipes.map(r => ({ makeCount: r.make_count || 0 })))
    : 0;

  // Calculate Hot Pepper
  const maxUses = recipes
    ? Math.max(0, ...recipes.map(r => r.make_count || 0))
    : 0;
  const hotPepper = calculateHotPepperLevel(maxUses);

  // Calculate Chef Hat
  const totalMeals = chefStats?.reduce((sum, m) => sum + (m.portions_claimed || 0), 0) || 0;
  let chefHat = 0;
  if (totalMeals >= 200) chefHat = 3;
  else if (totalMeals >= 50) chefHat = 2;
  else if (totalMeals >= 10) chefHat = 1;

  // Calculate Meal Saver
  const charityMeals = chefStats?.filter(m => m.is_charity).reduce((sum, m) => sum + (m.portions_claimed || 0), 0) || 0;
  let mealSaver = 0;
  if (charityMeals >= 1000) mealSaver = 5;
  else if (charityMeals >= 500) mealSaver = 4;
  else if (charityMeals >= 100) mealSaver = 3;
  else if (charityMeals >= 25) mealSaver = 2;
  else if (charityMeals >= 5) mealSaver = 1;

  // Calculate Grocery Runner
  const deliveries = deliveryStats?.total_deliveries || 0;
  let groceryRunner = 0;
  if (deliveries >= 1000) groceryRunner = 5;
  else if (deliveries >= 500) groceryRunner = 4;
  else if (deliveries >= 100) groceryRunner = 3;
  else if (deliveries >= 25) groceryRunner = 2;
  else if (deliveries >= 5) groceryRunner = 1;

  return {
    cookingSpoon,
    hotPepper,
    chefHat,
    mealSaver,
    groceryRunner,
  };
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
  userId: string,
  badgeId: string,
  level: number = 1
): Promise<void> {
  const badge = getBadgeDefinition(badgeId);
  if (!badge) throw new Error(`Badge ${badgeId} not found`);

  // Upsert badge achievement
  const { error } = await supabase
    .from('user_badge_achievements')
    .upsert({
      user_id: userId,
      achievement_category: badge.category,
      achievement_name: badge.name,
      achievement_level: level,
      achievement_icon: badge.icon,
      visible_on_badge: true,
      earned_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,achievement_name',
    });

  if (error) throw error;
}

/**
 * Update all food badges for a user
 * Call this when recipe stats change or after meal/delivery completion
 */
export async function updateFoodBadges(userId: string): Promise<void> {
  const badges = await calculateFoodBadges(userId);

  // Award badges for each category at the appropriate level
  if (badges.cookingSpoon > 0) {
    await awardBadge(userId, 'cooking_spoon', badges.cookingSpoon);
  }

  if (badges.hotPepper > 0) {
    await awardBadge(userId, 'hot_pepper', badges.hotPepper);
  }

  if (badges.chefHat > 0) {
    await awardBadge(userId, 'chef_hat', badges.chefHat);
  }

  if (badges.mealSaver > 0) {
    await awardBadge(userId, 'meal_saver', badges.mealSaver);
  }

  if (badges.groceryRunner > 0) {
    await awardBadge(userId, 'grocery_runner', badges.groceryRunner);
  }
}

/**
 * Check and award first-time badges
 */
export async function checkFirstTimeBadges(
  userId: string,
  event: 'first_recipe' | 'first_meal' | 'first_delivery' | 'first_taste_test' | 'first_guide' | 'first_portfolio_recipe'
): Promise<void> {
  switch (event) {
    case 'first_recipe':
      // Check if this is their first approved recipe
      const { count: recipeCount } = await supabase
        .from('pantry_recipes')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', userId)
        .eq('is_approved', true);

      if (recipeCount === 1) {
        await awardBadge(userId, 'cooking_spoon', 0); // "Aspiring Chef" - pre-level badge
      }
      break;

    case 'first_meal':
      // Check if this is their first meal sold
      const { count: mealCount } = await supabase
        .from('lmd_meals')
        .select('id', { count: 'exact', head: true })
        .eq('chef_id', userId);

      if (mealCount === 1) {
        await awardBadge(userId, 'chef_hat', 0); // "First Dish" - pre-level badge
      }
      break;

    case 'first_delivery':
      await awardBadge(userId, 'first_delivery', 1);
      break;

    case 'first_taste_test':
      await awardBadge(userId, 'taste_tester', 1);
      break;

    case 'first_guide':
      await awardBadge(userId, 'helpful_guide', 1);
      break;

    case 'first_portfolio_recipe':
      await awardBadge(userId, 'secret_keeper', 1);
      break;
  }
}

/**
 * Calculate taste tester badges
 */
export async function calculateTasteTesterBadges(userId: string): Promise<{
  tasteTester: number;
  masterTaster: boolean;
  recipeScout: number;
}> {
  // Get taste tester stats
  const { data: stats } = await supabase
    .from('user_taste_tester_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!stats) {
    return { tasteTester: 0, masterTaster: false, recipeScout: 0 };
  }

  // Calculate taste tester level based on recipes tested
  let tasteTester = 0;
  if (stats.total_recipes_tested >= 100) tasteTester = 5;
  else if (stats.total_recipes_tested >= 50) tasteTester = 4;
  else if (stats.total_recipes_tested >= 25) tasteTester = 3;
  else if (stats.total_recipes_tested >= 10) tasteTester = 2;
  else if (stats.total_recipes_tested >= 1) tasteTester = 1;

  // Master taster from successful recipes
  const masterTaster = stats.is_master_taster || stats.recipes_reached_5k >= 10;

  // Recipe scout based on recipes that succeeded after early testing
  let recipeScout = 0;
  if (stats.recipes_reached_5k >= 10) recipeScout = 3;
  else if (stats.recipes_reached_5k >= 5) recipeScout = 2;
  else if (stats.recipes_reached_5k >= 1) recipeScout = 1;

  return { tasteTester, masterTaster, recipeScout };
}

/**
 * Calculate documentation badges
 */
export async function calculateDocumentationBadges(userId: string): Promise<{
  helpfulGuide: number;
  cottageExpert: boolean;
  knowledgeKeeper: boolean;
}> {
  // Get contributor stats
  const { data: stats } = await supabase
    .from('documentation_contributor_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!stats) {
    return { helpfulGuide: 0, cottageExpert: false, knowledgeKeeper: false };
  }

  // Calculate helpful guide level
  let helpfulGuide = 0;
  if (stats.total_helpful_votes >= 500) helpfulGuide = 5;
  else if (stats.total_helpful_votes >= 200) helpfulGuide = 4;
  else if (stats.total_helpful_votes >= 50) helpfulGuide = 3;
  else if (stats.total_helpful_votes >= 20) helpfulGuide = 2;
  else if (stats.total_helpful_votes >= 5) helpfulGuide = 1;

  // Check for featured content
  const { count: featuredCount } = await supabase
    .from('documentation_items')
    .select('id', { count: 'exact', head: true })
    .eq('contributor_id', userId)
    .eq('status', 'featured');

  const knowledgeKeeper = (featuredCount || 0) > 0;

  // Check for cottage law guides
  const { count: cottageCount } = await supabase
    .from('cottage_law_guides')
    .select('id', { count: 'exact', head: true })
    .eq('contributor_id', userId)
    .eq('status', 'published');

  const cottageExpert = (cottageCount || 0) >= 3;

  return { helpfulGuide, cottageExpert, knowledgeKeeper };
}

/**
 * Update all badges for new systems
 */
export async function updateAllNewBadges(userId: string): Promise<void> {
  // Update taste tester badges
  const tasteBadges = await calculateTasteTesterBadges(userId);
  if (tasteBadges.tasteTester > 0) {
    await awardBadge(userId, 'taste_tester', tasteBadges.tasteTester);
  }
  if (tasteBadges.masterTaster) {
    await awardBadge(userId, 'master_taster', 1);
  }
  if (tasteBadges.recipeScout > 0) {
    await awardBadge(userId, 'recipe_scout', tasteBadges.recipeScout);
  }

  // Update documentation badges
  const docBadges = await calculateDocumentationBadges(userId);
  if (docBadges.helpfulGuide > 0) {
    await awardBadge(userId, 'helpful_guide', docBadges.helpfulGuide);
  }
  if (docBadges.cottageExpert) {
    await awardBadge(userId, 'cottage_expert', 1);
  }
  if (docBadges.knowledgeKeeper) {
    await awardBadge(userId, 'knowledge_keeper', 1);
  }
}
