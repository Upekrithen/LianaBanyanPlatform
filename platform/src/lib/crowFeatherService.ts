/**
 * CROW FEATHER SERVICE
 * =====================
 * Crow Feathers are permanent achievements earned by setting records.
 * They're the ONLY thing that persists in Ghost World.
 *
 * "The only persistent thing for ghosts." — Founder
 *
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 * @see DESIGN_DOCS/HALF_LIFE_LEADERBOARDS.md
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type FeatherCategory =
  | 'chase_speed'      // Fastest chase completion
  | 'chase_streak'     // Longest win streak
  | 'chase_earnings'   // Most Marks earned in a single chase
  | 'discovery'        // Most areas discovered in time bracket
  | 'golden_keys'      // Most golden keys in time bracket
  | 'candles'          // Most candles collected
  | 'mirror_travel';   // Most mirrors traversed

export interface CrowFeather {
  id: string;
  userId: string;
  category: FeatherCategory;
  featherNumber: number; // Global unique number (#1, #847, etc.)
  achievedAt: Date;
  recordValue: number;
  previousRecordValue?: number;
  previousHolderId?: string;
  difficulty?: string;
  metadata?: Record<string, any>;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  value: number;
  rank: number;
  hasCrowFeather: boolean;
  featherNumber?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CROW FEATHER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a new record qualifies for a Crow Feather
 */
export async function checkForCrowFeather(
  userId: string,
  category: FeatherCategory,
  value: number,
  difficulty?: string,
  metadata?: Record<string, any>
): Promise<{ earned: boolean; feather?: CrowFeather }> {
  // Get current record for this category
  const { data: currentRecord } = await supabase
    .from('wisp_chase_results')
    .select('user_id, finish_time_ms')
    .eq('crow_feather_category', category)
    .eq('crow_feather_earned', true)
    .order('finish_time_ms', { ascending: true })
    .limit(1)
    .single();

  // For speed records, lower is better
  const isNewRecord = category.includes('speed')
    ? !currentRecord || value < currentRecord.finish_time_ms
    : !currentRecord || value > currentRecord.finish_time_ms;

  if (!isNewRecord) {
    return { earned: false };
  }

  // Award the Crow Feather
  const feather = await awardCrowFeather(
    userId,
    category,
    value,
    currentRecord?.finish_time_ms,
    currentRecord?.user_id,
    difficulty,
    metadata
  );

  return { earned: true, feather };
}

/**
 * Award a Crow Feather to a user
 */
async function awardCrowFeather(
  userId: string,
  category: FeatherCategory,
  recordValue: number,
  previousRecordValue?: number,
  previousHolderId?: string,
  difficulty?: string,
  metadata?: Record<string, any>
): Promise<CrowFeather> {
  // Get next feather number
  const { data: countData } = await supabase
    .from('crow_feathers')
    .select('id', { count: 'exact' });

  const featherNumber = (countData?.length || 0) + 1;

  const { data: feather, error } = await supabase
    .from('crow_feathers')
    .insert({
      user_id: userId,
      category,
      feather_number: featherNumber,
      record_value: recordValue,
      previous_record_value: previousRecordValue,
      previous_holder_id: previousHolderId,
      difficulty,
      metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error awarding crow feather:', error);
    throw error;
  }

  return {
    id: feather.id,
    userId: feather.user_id,
    category: feather.category,
    featherNumber: feather.feather_number,
    achievedAt: new Date(feather.achieved_at),
    recordValue: feather.record_value,
    previousRecordValue: feather.previous_record_value,
    previousHolderId: feather.previous_holder_id,
    difficulty: feather.difficulty,
    metadata: feather.metadata,
  };
}

/**
 * Get user's Crow Feathers
 */
export async function getUserCrowFeathers(userId: string): Promise<CrowFeather[]> {
  const { data, error } = await supabase
    .from('crow_feathers')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(f => ({
    id: f.id,
    userId: f.user_id,
    category: f.category,
    featherNumber: f.feather_number,
    achievedAt: new Date(f.achieved_at),
    recordValue: f.record_value,
    previousRecordValue: f.previous_record_value,
    previousHolderId: f.previous_holder_id,
    difficulty: f.difficulty,
    metadata: f.metadata,
  }));
}

/**
 * Get total Crow Feather count for a user
 */
export async function getCrowFeatherCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('crow_feathers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return count || 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHASE LEADERBOARDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get chase speed leaderboard by difficulty
 */
export async function getChaseSpeedLeaderboard(
  difficulty: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('wisp_chase_results')
    .select(`
      user_id,
      finish_time_ms,
      crow_feather_earned,
      crow_feather_number,
      profiles!inner(display_name)
    `)
    .eq('difficulty', difficulty)
    .not('finish_time_ms', 'is', null)
    .order('finish_time_ms', { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((entry, index) => ({
    userId: entry.user_id,
    displayName: (entry.profiles as any)?.display_name || 'Unknown',
    value: entry.finish_time_ms,
    rank: index + 1,
    hasCrowFeather: entry.crow_feather_earned,
    featherNumber: entry.crow_feather_number,
  }));
}

/**
 * Get chase win streak leaderboard
 */
export async function getWinStreakLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('user_wisp_stats')
    .select(`
      user_id,
      best_win_streak,
      profiles!inner(display_name)
    `)
    .order('best_win_streak', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((entry, index) => ({
    userId: entry.user_id,
    displayName: (entry.profiles as any)?.display_name || 'Unknown',
    value: entry.best_win_streak,
    rank: index + 1,
    hasCrowFeather: false, // Would need to check crow_feathers table
  }));
}

/**
 * Get earnings leaderboard
 */
export async function getEarningsLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('user_wisp_stats')
    .select(`
      user_id,
      total_payout,
      profiles!inner(display_name)
    `)
    .order('total_payout', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((entry, index) => ({
    userId: entry.user_id,
    displayName: (entry.profiles as any)?.display_name || 'Unknown',
    value: entry.total_payout,
    rank: index + 1,
    hasCrowFeather: false,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// HALF-LIFE LEADERBOARDS (Time-Bracketed)
// ═══════════════════════════════════════════════════════════════════════════════

export type TimeBracket =
  | '15min'
  | '30min'
  | '1hour'
  | '2hours'
  | '4hours'
  | '8hours'
  | '12hours';

const TIME_BRACKET_MS: Record<TimeBracket, number> = {
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '2hours': 2 * 60 * 60 * 1000,
  '4hours': 4 * 60 * 60 * 1000,
  '8hours': 8 * 60 * 60 * 1000,
  '12hours': 12 * 60 * 60 * 1000,
};

/**
 * Get time-bracketed leaderboard for Ghost World
 * These are the "Half-Life" leaderboards
 */
export async function getHalfLifeLeaderboard(
  category: 'chases_completed' | 'marks_earned' | 'candles_collected',
  timeBracket: TimeBracket,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  // INFRASTRUCTURE NOTE: This function needs to query ghost_session_records within
  // the time bracket and return sorted leaderboard entries. Requires ghost session tracking tables.
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECORD CHECKING (For Chase Mode)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check and award records after a chase completion
 */
export async function processChaseCompletion(
  userId: string,
  chaseId: string,
  finishTimeMs: number,
  finishPosition: number,
  difficulty: string,
  payout: number
): Promise<{ crowFeathersEarned: CrowFeather[] }> {
  const feathersEarned: CrowFeather[] = [];

  // Check for speed record
  const speedCheck = await checkForCrowFeather(
    userId,
    'chase_speed',
    finishTimeMs,
    difficulty,
    { chaseId, finishPosition }
  );

  if (speedCheck.earned && speedCheck.feather) {
    feathersEarned.push(speedCheck.feather);
  }

  // Check for earnings record
  if (payout > 0) {
    const earningsCheck = await checkForCrowFeather(
      userId,
      'chase_earnings',
      payout,
      difficulty,
      { chaseId }
    );

    if (earningsCheck.earned && earningsCheck.feather) {
      feathersEarned.push(earningsCheck.feather);
    }
  }

  // Update user stats for streak checking
  const { data: stats } = await supabase
    .from('user_wisp_stats')
    .select('current_win_streak, best_win_streak')
    .eq('user_id', userId)
    .single();

  if (stats) {
    const newStreak = finishPosition <= 2 ? stats.current_win_streak + 1 : 0;
    const bestStreak = Math.max(newStreak, stats.best_win_streak);

    await supabase
      .from('user_wisp_stats')
      .update({
        current_win_streak: newStreak,
        best_win_streak: bestStreak,
      })
      .eq('user_id', userId);

    // Check for streak record
    if (newStreak > stats.best_win_streak) {
      const streakCheck = await checkForCrowFeather(
        userId,
        'chase_streak',
        newStreak,
        undefined,
        { chaseId }
      );

      if (streakCheck.earned && streakCheck.feather) {
        feathersEarned.push(streakCheck.feather);
      }
    }
  }

  return { crowFeathersEarned: feathersEarned };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  checkForCrowFeather,
  getUserCrowFeathers,
  getCrowFeatherCount,
  getChaseSpeedLeaderboard,
  getWinStreakLeaderboard,
  getEarningsLeaderboard,
  getHalfLifeLeaderboard,
  processChaseCompletion,
};
