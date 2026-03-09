/**
 * WISP CHASE SERVICE
 * ===================
 * Service layer for Will-o'-Wisp Chase Mode operations.
 * Handles database interactions, ante payments, payout calculations.
 * 
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

import { supabase } from '@/integrations/supabase/client';
import { generateChasePath, MirrorPath } from './mirrorGraph';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ChaseDifficulty = 'novice' | 'journeyman' | 'expert' | 'legendary';
export type ChaseStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type ParticipantStatus = 'joined' | 'chasing' | 'finished' | 'lost' | 'quit';

export interface WispChase {
  id: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: ChaseStatus;
  anteAmount: number;
  minParticipants: number;
  maxParticipants?: number;
  platformCut: number;
  totalPot: number;
  participantCount: number;
  pathSeed: string;
  pathLength: number;
  difficulty: ChaseDifficulty;
  pathMirrors: string[];
  createdBy?: string;
  title?: string;
  description?: string;
}

export interface ChaseParticipant {
  id: string;
  chaseId: string;
  userId: string;
  joinedAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  finishPosition?: number;
  finishTimeMs?: number;
  antePaid: number;
  payout: number;
  status: ParticipantStatus;
  pathProgress: { mirrorId: string; timestamp: number }[];
  currentMirrorIndex: number;
  pickleCount: number;
  pickleTimeLostMs: number;
}

export interface UserWispStats {
  userId: string;
  unlockedChaseMode: boolean;
  unlockReason?: 'reputation' | 'leaderboard' | 'skip_ahead';
  unlockedAt?: Date;
  totalChases: number;
  wins: number;
  losses: number;
  quits: number;
  totalAntePaid: number;
  totalPayout: number;
  netProfit: number;
  bestFinish?: number;
  bestTimeMs?: number;
  currentWinStreak: number;
  bestWinStreak: number;
  trainingWispsCompleted: number;
  firstCandleEarnedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHASE CREATION & MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a new chase event
 */
export async function createChase(options: {
  difficulty: ChaseDifficulty;
  anteAmount?: number;
  minParticipants?: number;
  maxParticipants?: number;
  title?: string;
  description?: string;
}): Promise<{ chase: WispChase | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { chase: null, error: 'Not authenticated' };
  }

  // Generate the path
  const pathSeed = `chase-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const path = generateChasePath(options.difficulty, pathSeed);

  // Default ante amounts by difficulty
  const defaultAntes = {
    novice: 10,
    journeyman: 25,
    expert: 50,
    legendary: 100,
  };

  const anteAmount = options.anteAmount ?? defaultAntes[options.difficulty];

  const { data, error } = await supabase
    .from('wisp_chases')
    .insert({
      status: 'pending',
      ante_amount: anteAmount,
      min_participants: options.minParticipants ?? 2,
      max_participants: options.maxParticipants,
      platform_cut: 0.20,
      path_seed: pathSeed,
      path_length: path.nodes.length,
      difficulty: options.difficulty,
      path_mirrors: path.nodes,
      created_by: user.id,
      title: options.title,
      description: options.description,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chase:', error);
    return { chase: null, error: error.message };
  }

  return { chase: mapChaseFromDb(data), error: null };
}

/**
 * Get active chases available to join
 */
export async function getActiveChases(): Promise<WispChase[]> {
  const { data, error } = await supabase
    .from('wisp_chases')
    .select('*')
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching active chases:', error);
    return [];
  }

  return data.map(mapChaseFromDb);
}

/**
 * Get a specific chase by ID
 */
export async function getChase(chaseId: string): Promise<WispChase | null> {
  const { data, error } = await supabase
    .from('wisp_chases')
    .select('*')
    .eq('id', chaseId)
    .single();

  if (error || !data) {
    return null;
  }

  return mapChaseFromDb(data);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICIPATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Join a chase (pays the ante)
 */
export async function joinChase(chaseId: string): Promise<{ 
  success: boolean; 
  error?: string;
  participant?: ChaseParticipant;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get chase details
  const chase = await getChase(chaseId);
  if (!chase) {
    return { success: false, error: 'Chase not found' };
  }

  if (chase.status !== 'pending') {
    return { success: false, error: 'Chase has already started' };
  }

  if (chase.maxParticipants && chase.participantCount >= chase.maxParticipants) {
    return { success: false, error: 'Chase is full' };
  }

  // Check user balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('marks')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.marks || 0) < chase.anteAmount) {
    return { success: false, error: `Insufficient Marks. Need ${chase.anteAmount}` };
  }

  // Deduct ante
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ marks: (profile.marks || 0) - chase.anteAmount })
    .eq('id', user.id);

  if (deductError) {
    return { success: false, error: 'Failed to deduct ante' };
  }

  // Add participant
  const { data: participant, error: joinError } = await supabase
    .from('wisp_chase_participants')
    .insert({
      chase_id: chaseId,
      user_id: user.id,
      ante_paid: chase.anteAmount,
      status: 'joined',
      path_progress: [],
      current_mirror_index: 0,
    })
    .select()
    .single();

  if (joinError) {
    // Refund ante
    await supabase
      .from('profiles')
      .update({ marks: profile.marks })
      .eq('id', user.id);
    return { success: false, error: 'Failed to join chase' };
  }

  // Update chase pot and participant count
  await supabase
    .from('wisp_chases')
    .update({
      total_pot: chase.totalPot + chase.anteAmount,
      participant_count: chase.participantCount + 1,
    })
    .eq('id', chaseId);

  return { success: true, participant: mapParticipantFromDb(participant) };
}

/**
 * Update participant progress
 */
export async function updateProgress(
  chaseId: string,
  mirrorId: string,
  isCorrect: boolean
): Promise<{ success: boolean; finished?: boolean; position?: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false };
  }

  // Get current participation
  const { data: participation } = await supabase
    .from('wisp_chase_participants')
    .select('*')
    .eq('chase_id', chaseId)
    .eq('user_id', user.id)
    .single();

  if (!participation) {
    return { success: false };
  }

  const progress = participation.path_progress || [];
  const newProgress = [...progress, { mirrorId, timestamp: Date.now() }];
  const newIndex = isCorrect ? participation.current_mirror_index + 1 : participation.current_mirror_index;

  // Check if finished
  const chase = await getChase(chaseId);
  const isFinished = chase && newIndex >= chase.pathLength - 1;

  if (isFinished) {
    // Count finished participants for position
    const { data: finishedParticipants } = await supabase
      .from('wisp_chase_participants')
      .select('id')
      .eq('chase_id', chaseId)
      .eq('status', 'finished');

    const position = (finishedParticipants?.length || 0) + 1;

    await supabase
      .from('wisp_chase_participants')
      .update({
        path_progress: newProgress,
        current_mirror_index: newIndex,
        status: 'finished',
        finished_at: new Date().toISOString(),
        finish_position: position,
        finish_time_ms: Date.now() - new Date(participation.started_at).getTime(),
      })
      .eq('id', participation.id);

    return { success: true, finished: true, position };
  }

  // Just update progress
  await supabase
    .from('wisp_chase_participants')
    .update({
      path_progress: newProgress,
      current_mirror_index: newIndex,
      pickle_count: isCorrect ? participation.pickle_count : participation.pickle_count + 1,
    })
    .eq('id', participation.id);

  return { success: true, finished: false };
}

/**
 * Quit a chase (forfeit ante)
 */
export async function quitChase(chaseId: string): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false };
  }

  await supabase
    .from('wisp_chase_participants')
    .update({ status: 'quit' })
    .eq('chase_id', chaseId)
    .eq('user_id', user.id);

  // Update user stats
  await supabase.rpc('increment_wisp_stat', {
    p_user_id: user.id,
    p_stat: 'quits',
    p_amount: 1,
  });

  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNLOCK CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if user has unlocked Chase Mode
 */
export async function checkUnlockStatus(): Promise<{
  unlocked: boolean;
  reason?: 'reputation' | 'leaderboard' | 'skip_ahead';
  canSkipAhead: boolean;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { unlocked: false, canSkipAhead: false };
  }

  // Check wisp stats
  const { data: stats } = await supabase
    .from('user_wisp_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (stats?.unlocked_chase_mode) {
    return { 
      unlocked: true, 
      reason: stats.unlock_reason,
      canSkipAhead: false 
    };
  }

  // Check reputation threshold
  const { data: profile } = await supabase
    .from('profiles')
    .select('reputation')
    .eq('id', user.id)
    .single();

  if (profile && (profile.reputation || 0) >= 100) {
    // Auto-unlock via reputation
    await unlockChaseMode(user.id, 'reputation');
    return { unlocked: true, reason: 'reputation', canSkipAhead: false };
  }

  // Check leaderboard time (simplified - check if on any leaderboard)
  const { data: leaderboardEntries } = await supabase
    .from('wisp_chase_results')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (leaderboardEntries && leaderboardEntries.length > 0) {
    await unlockChaseMode(user.id, 'leaderboard');
    return { unlocked: true, reason: 'leaderboard', canSkipAhead: false };
  }

  // Not unlocked, but can skip ahead
  return { unlocked: false, canSkipAhead: true };
}

/**
 * Skip ahead to unlock Chase Mode (user explicitly accepts risk)
 */
export async function skipAheadUnlock(): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false };
  }

  await unlockChaseMode(user.id, 'skip_ahead');
  return { success: true };
}

/**
 * Internal: Mark user as having unlocked chase mode
 */
async function unlockChaseMode(userId: string, reason: 'reputation' | 'leaderboard' | 'skip_ahead') {
  const { data: existing } = await supabase
    .from('user_wisp_stats')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase
      .from('user_wisp_stats')
      .update({
        unlocked_chase_mode: true,
        unlock_reason: reason,
        unlocked_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    await supabase
      .from('user_wisp_stats')
      .insert({
        user_id: userId,
        unlocked_chase_mode: true,
        unlock_reason: reason,
        unlocked_at: new Date().toISOString(),
      });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYOUT CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate payouts for a completed chase
 * Top 50% of finishers split the pot (after 20% platform cut)
 * Tiered by finish order: 1st gets most, etc.
 */
export function calculatePayouts(chase: WispChase, participants: ChaseParticipant[]): Map<string, number> {
  const payouts = new Map<string, number>();
  
  const finishers = participants
    .filter(p => p.status === 'finished')
    .sort((a, b) => (a.finishPosition || 999) - (b.finishPosition || 999));
  
  if (finishers.length === 0) {
    return payouts;
  }

  // Calculate winner pot (after platform cut)
  const winnerPot = Math.floor(chase.totalPot * (1 - chase.platformCut));
  
  // Top half are winners
  const numWinners = Math.ceil(participants.length / 2);
  const winners = finishers.slice(0, numWinners);
  
  // Tiered distribution: position 1 gets more than 2, etc.
  // Formula: share = (numWinners - position + 1) / sum(1..numWinners)
  const sumOfPositions = (numWinners * (numWinners + 1)) / 2;
  
  winners.forEach((winner, index) => {
    const position = index + 1;
    const share = (numWinners - position + 1) / sumOfPositions;
    const payout = Math.floor(winnerPot * share);
    payouts.set(winner.userId, payout);
  });
  
  // Losers get nothing
  finishers.slice(numWinners).forEach(loser => {
    payouts.set(loser.userId, 0);
  });
  
  return payouts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER STATS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get user's wisp statistics
 */
export async function getUserWispStats(): Promise<UserWispStats | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from('user_wisp_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!data) {
    return null;
  }

  return {
    userId: data.user_id,
    unlockedChaseMode: data.unlocked_chase_mode,
    unlockReason: data.unlock_reason,
    unlockedAt: data.unlocked_at ? new Date(data.unlocked_at) : undefined,
    totalChases: data.total_chases,
    wins: data.wins,
    losses: data.losses,
    quits: data.quits,
    totalAntePaid: data.total_ante_paid,
    totalPayout: data.total_payout,
    netProfit: data.net_profit,
    bestFinish: data.best_finish,
    bestTimeMs: data.best_time_ms,
    currentWinStreak: data.current_win_streak,
    bestWinStreak: data.best_win_streak,
    trainingWispsCompleted: data.training_wisps_completed,
    firstCandleEarnedAt: data.first_candle_earned_at ? new Date(data.first_candle_earned_at) : undefined,
  };
}

/**
 * Record completion of training wisp
 */
export async function recordTrainingWispComplete(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('user_wisp_stats')
    .select('user_id, training_wisps_completed, first_candle_earned_at')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    await supabase
      .from('user_wisp_stats')
      .update({
        training_wisps_completed: (existing.training_wisps_completed || 0) + 1,
        first_candle_earned_at: existing.first_candle_earned_at || new Date().toISOString(),
      })
      .eq('user_id', user.id);
  } else {
    await supabase
      .from('user_wisp_stats')
      .insert({
        user_id: user.id,
        training_wisps_completed: 1,
        first_candle_earned_at: new Date().toISOString(),
      });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DB MAPPERS
// ═══════════════════════════════════════════════════════════════════════════════

function mapChaseFromDb(data: any): WispChase {
  return {
    id: data.id,
    createdAt: new Date(data.created_at),
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    endedAt: data.ended_at ? new Date(data.ended_at) : undefined,
    status: data.status,
    anteAmount: data.ante_amount,
    minParticipants: data.min_participants,
    maxParticipants: data.max_participants,
    platformCut: parseFloat(data.platform_cut),
    totalPot: data.total_pot,
    participantCount: data.participant_count,
    pathSeed: data.path_seed,
    pathLength: data.path_length,
    difficulty: data.difficulty,
    pathMirrors: data.path_mirrors || [],
    createdBy: data.created_by,
    title: data.title,
    description: data.description,
  };
}

function mapParticipantFromDb(data: any): ChaseParticipant {
  return {
    id: data.id,
    chaseId: data.chase_id,
    userId: data.user_id,
    joinedAt: new Date(data.joined_at),
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    finishedAt: data.finished_at ? new Date(data.finished_at) : undefined,
    finishPosition: data.finish_position,
    finishTimeMs: data.finish_time_ms,
    antePaid: data.ante_paid,
    payout: data.payout || 0,
    status: data.status,
    pathProgress: data.path_progress || [],
    currentMirrorIndex: data.current_mirror_index || 0,
    pickleCount: data.pickle_count || 0,
    pickleTimeLostMs: data.pickle_time_lost_ms || 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  createChase,
  getActiveChases,
  getChase,
  joinChase,
  updateProgress,
  quitChase,
  checkUnlockStatus,
  skipAheadUnlock,
  calculatePayouts,
  getUserWispStats,
  recordTrainingWispComplete,
};
