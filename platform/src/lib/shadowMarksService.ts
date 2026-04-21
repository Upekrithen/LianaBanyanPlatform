/**
 * SHADOW MARKS SERVICE
 * ====================
 * Shadow Marks are speculative reputation that "crystallize" into real Marks
 * through community validation (votes/orders).
 *
 * Educational metaphor: Seeds that need sunlight (votes) to grow into plants (real Marks)
 *
 * Key concepts:
 * - Category-based bounties reward filling empty/sparse shelves
 * - Shadow Marks decay over time if not validated
 * - Votes/orders "crystallize" Shadow Marks into permanent Marks
 * - Teaches the concept of vesting in an approachable way
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ───

export type ShelfStatus = 'empty' | 'sparse' | 'growing' | 'established' | 'full';
export type ShadowMarkStatus = 'vesting' | 'partial' | 'crystallized' | 'expired';

export interface CategoryBounty {
  id: string;
  cuisine: string;
  mealType: string;
  style: string;
  displayName: string;
  description: string | null;
  icon: string;
  recipeCount: number;
  shadowMarksAvailable: number;
  bountyMessage: string;
  shelfStatus: ShelfStatus;
}

export interface ShadowMark {
  id: string;
  sourceType: string;
  sourceId: string | null;
  initialAmount: number;
  currentAmount: number;
  crystallizedAmount: number;
  status: ShadowMarkStatus;
  votesNeeded: number;
  votesReceived: number;
  createdAt: string;
  expiresAt: string;
}

export interface ShadowMarksSummary {
  vestingCount: number;
  totalShadow: number;
  totalCrystallized: number;
  totalExpired: number;
}

// ─── Bounty Tier Constants ───

export const BOUNTY_TIERS = {
  empty: { marks: 50, label: 'Be the FIRST! 🏆', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  sparse: { marks: 30, label: 'Help fill the shelf', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  growing: { marks: 15, label: 'Add variety', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  established: { marks: 5, label: 'Standard contribution', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  full: { marks: 0, label: 'Shelf is full', color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

// ─── Vesting Schedule Constants ───

export const VESTING_SCHEDULE = {
  decayStartDays: 3,       // Decay starts after 3 days
  decayIntervalDays: 4,    // Then every 4 days
  decayRate: 0.20,         // 20% per decay interval
  expirationDays: 30,      // Fully expires after 30 days
  votesToCrystallize: {
    50: 10,  // 50 marks → needs 10 votes
    30: 7,   // 30 marks → needs 7 votes
    15: 5,   // 15 marks → needs 5 votes
    5: 3,    // 5 marks → needs 3 votes
  },
};

// ─── API Functions ───

/**
 * Get all category bounty opportunities, sorted by highest bounty first.
 */
export async function getCategoryBounties(): Promise<CategoryBounty[]> {
  const { data, error } = await supabase
    .from('pantry_bounty_opportunities')
    .select('*');

  if (error) throw error;

  return (data || []).map(d => ({
    id: d.id,
    cuisine: d.cuisine,
    mealType: d.meal_type,
    style: d.style,
    displayName: d.display_name,
    description: d.description,
    icon: d.icon,
    recipeCount: d.recipe_count,
    shadowMarksAvailable: d.shadow_marks_available,
    bountyMessage: d.bounty_message,
    shelfStatus: d.shelf_status as ShelfStatus,
  }));
}

/**
 * Get bounty opportunities filtered by criteria.
 */
export async function getFilteredBounties(filters: {
  minBounty?: number;
  cuisine?: string;
  mealType?: string;
}): Promise<CategoryBounty[]> {
  const all = await getCategoryBounties();

  return all.filter(b => {
    if (filters.minBounty && b.shadowMarksAvailable < filters.minBounty) return false;
    if (filters.cuisine && b.cuisine !== filters.cuisine && b.cuisine !== 'Any') return false;
    if (filters.mealType && b.mealType !== filters.mealType) return false;
    return true;
  });
}

/**
 * Get top bounty opportunities (for banner display).
 */
export async function getTopBounties(limit = 5): Promise<CategoryBounty[]> {
  const all = await getCategoryBounties();
  return all
    .filter(b => b.shadowMarksAvailable > 0)
    .slice(0, limit);
}

/**
 * Get user's shadow marks.
 */
export async function getUserShadowMarks(): Promise<ShadowMark[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('shadow_marks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(d => ({
    id: d.id,
    sourceType: d.source_type,
    sourceId: d.source_id,
    initialAmount: d.initial_amount,
    currentAmount: d.current_amount,
    crystallizedAmount: d.crystallized_amount,
    status: d.status as ShadowMarkStatus,
    votesNeeded: d.votes_needed,
    votesReceived: d.votes_received,
    createdAt: d.created_at,
    expiresAt: d.expires_at,
  }));
}

/**
 * Get user's shadow marks summary.
 */
export async function getShadowMarksSummary(): Promise<ShadowMarksSummary | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_shadow_marks_summary')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (!data) {
    return {
      vestingCount: 0,
      totalShadow: 0,
      totalCrystallized: 0,
      totalExpired: 0,
    };
  }

  return {
    vestingCount: data.milestone_completion_count || 0,
    totalShadow: data.total_shadow || 0,
    totalCrystallized: data.total_crystallized || 0,
    totalExpired: data.total_expired || 0,
  };
}

/**
 * Vote for a recipe with Marks (crystallizes creator's shadow marks).
 */
export async function voteForRecipe(recipeId: string, marksToCommit: number): Promise<{
  voteRecorded: boolean;
  shadowMarksCrystallized: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in to vote');

  if (marksToCommit < 1) throw new Error('Must commit at least 1 Mark');

  const { data, error } = await supabase
    .rpc('process_recipe_vote', {
      p_recipe_id: recipeId,
      p_voter_id: user.id,
      p_marks_committed: marksToCommit,
    });

  if (error) throw error;

  const result = data?.[0] || { vote_recorded: false, shadow_marks_crystallized: 0 };

  return {
    voteRecorded: result.vote_recorded,
    shadowMarksCrystallized: result.shadow_marks_crystallized || 0,
  };
}

/**
 * Calculate estimated crystallization from a vote.
 */
export function estimateCrystallization(
  currentVotes: number,
  votesNeeded: number,
  shadowAmount: number,
  newVotes: number
): number {
  const beforeRatio = Math.min(currentVotes / votesNeeded, 1);
  const afterRatio = Math.min((currentVotes + newVotes) / votesNeeded, 1);
  const newCrystallized = Math.floor(shadowAmount * afterRatio) - Math.floor(shadowAmount * beforeRatio);
  return Math.max(0, newCrystallized);
}

/**
 * Calculate days until next decay.
 */
export function getDaysUntilDecay(createdAt: string, lastDecayAt: string | null): number {
  const created = new Date(createdAt);
  const now = new Date();

  if (!lastDecayAt) {
    // First decay happens after decay_start_days
    const firstDecay = new Date(created);
    firstDecay.setDate(firstDecay.getDate() + VESTING_SCHEDULE.decayStartDays);
    const diff = Math.ceil((firstDecay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  // Subsequent decays
  const lastDecay = new Date(lastDecayAt);
  const nextDecay = new Date(lastDecay);
  nextDecay.setDate(nextDecay.getDate() + VESTING_SCHEDULE.decayIntervalDays);
  const diff = Math.ceil((nextDecay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Format shadow mark status for display.
 */
export function formatShadowStatus(status: ShadowMarkStatus): {
  label: string;
  color: string;
  icon: string;
} {
  switch (status) {
    case 'vesting':
      return { label: 'Vesting', color: 'text-amber-400', icon: '⏳' };
    case 'partial':
      return { label: 'Partially Crystallized', color: 'text-blue-400', icon: '💎' };
    case 'crystallized':
      return { label: 'Fully Crystallized', color: 'text-emerald-400', icon: '✨' };
    case 'expired':
      return { label: 'Expired', color: 'text-gray-500', icon: '⌛' };
  }
}

// ─── Escape Velocity Constants ───

export const ESCAPE_VELOCITY = {
  threshold: 100,  // Votes needed for escape velocity
  bonusMarks: 50,  // Bonus MARKS awarded at escape velocity
  benefits: [
    'Permanent IP Ledger protection (SHA-256 hash)',
    'Hot Pepper 🌶️ badge recognition',
    'Portfolio protection (cannot be removed)',
    'Perpetual creator attribution rights',
    '+50 bonus MARKS'
  ]
};

export interface EscapeVelocityRecipe {
  id: string;
  title: string;
  creatorId: string;
  cuisine: string | null;
  mealType: string | null;
  voteCount: number;
  escapeVelocityReachedAt: string;
  ipLedgerHash: string;
  createdAt: string;
}

/**
 * Get recipes that have reached escape velocity (IP Ledger protected).
 */
export async function getEscapeVelocityRecipes(): Promise<EscapeVelocityRecipe[]> {
  const { data, error } = await supabase
    .from('pantry_escape_velocity_recipes')
    .select('*');

  if (error) throw error;

  return (data || []).map(r => ({
    id: r.id,
    title: r.title,
    creatorId: r.creator_id,
    cuisine: r.cuisine,
    mealType: r.meal_type,
    voteCount: r.vote_count,
    escapeVelocityReachedAt: r.escape_velocity_reached_at,
    ipLedgerHash: r.ip_ledger_hash,
    createdAt: r.created_at,
  }));
}

/**
 * Calculate progress toward escape velocity.
 */
export function calculateEscapeVelocityProgress(currentVotes: number): {
  progress: number;  // 0-100
  remaining: number; // Votes remaining
  reached: boolean;
} {
  const remaining = Math.max(0, ESCAPE_VELOCITY.threshold - currentVotes);
  return {
    progress: Math.min(100, (currentVotes / ESCAPE_VELOCITY.threshold) * 100),
    remaining,
    reached: currentVotes >= ESCAPE_VELOCITY.threshold,
  };
}

// ─── Data Bounty System ───
// Generalised reward tiers for any user-populatable data (directories, cue cards, storefronts, etc.)

export type DataFillLevel = 'empty' | 'sparse' | 'growing' | 'established' | 'full';

export interface DataBountyCategory {
  table: string;
  scopeField: string;
  scopeValue: string;
}

export interface DataBountyTier {
  originatorReward: number;
  confirmerReward: number;
  updaterReward: number;
  tierName: DataFillLevel;
  label: string;
}

const DATA_BOUNTY_TIER_MAP: Record<DataFillLevel, Omit<DataBountyTier, 'tierName'>> = {
  empty:       { originatorReward: 50, confirmerReward: 0,  updaterReward: 0,  label: 'Be the FIRST!' },
  sparse:      { originatorReward: 30, confirmerReward: 15, updaterReward: 25, label: 'Help fill this out' },
  growing:     { originatorReward: 15, confirmerReward: 8,  updaterReward: 15, label: 'Almost there' },
  established: { originatorReward: 5,  confirmerReward: 3,  updaterReward: 5,  label: 'Confirm what\'s here' },
  full:        { originatorReward: 0,  confirmerReward: 1,  updaterReward: 3,  label: 'Shelf is full' },
};

export function getDataFillLevel(entryCount: number): DataFillLevel {
  if (entryCount === 0) return 'empty';
  if (entryCount < 5) return 'sparse';
  if (entryCount < 10) return 'growing';
  if (entryCount < 20) return 'established';
  return 'full';
}

export function getDataBountyTier(entryCount: number): DataBountyTier {
  const tierName = getDataFillLevel(entryCount);
  return { tierName, ...DATA_BOUNTY_TIER_MAP[tierName] };
}

export async function recordDataContribution(
  tableName: string,
  recordId: string,
  contributionType: 'originate' | 'confirm' | 'update',
): Promise<{ marks_awarded: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { data, error } = await supabase
    .from('data_contributions' as any)
    .insert({
      contributor_id: user.id,
      table_name: tableName,
      record_id: recordId,
      contribution_type: contributionType,
      marks_awarded: 0,
    })
    .select('marks_awarded')
    .single();

  if (error) throw error;
  return { marks_awarded: (data as any)?.marks_awarded || 0 };
}
