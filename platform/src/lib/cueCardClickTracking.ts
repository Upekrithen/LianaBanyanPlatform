/**
 * CUE CARD CLICK TRACKING
 * =======================
 * Tracks clicks on shared Cue Cards and triggers Frame Lock unlocks on Deck Cards.
 *
 * The viral loop:
 * 1. User stamps a Cue Card with their QR
 * 2. User shares to TikTok/social/direct link
 * 3. Friends click the shared link
 * 4. Clicks are tracked and counted
 * 5. Every 5 clicks unlocks one Frame Lock on the linked Deck Card
 * 6. 20 clicks = full unlock = Deck Card collected + Candle Burst reward
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface ShareClick {
  cueCardId: string; // FK to leviathan_cue_cards.id
  clickToken?: string; // unique token for this click
  anonymousSessionId?: string;
  ipCountry?: string;
  userAgentClass?: 'mobile' | 'desktop' | 'bot';
  platform?: 'tiktok' | 'facebook' | 'twitter' | 'linkedin' | 'direct' | 'other';
}

export interface FrameLockProgress {
  deckCardId: string;
  userId: string;
  totalClicks: number;
  clicksPerLock: number;
  lockTop: boolean;
  lockRight: boolean;
  lockBottom: boolean;
  lockLeft: boolean;
  isFullyUnlocked: boolean;
  unlockedAt?: string;
}

export interface ClickResult {
  success: boolean;
  error?: string;
  clickId?: string;
  totalClicks?: number;
  locksUnlocked?: number;
  isFullyUnlocked?: boolean;
  rewardEarned?: boolean;
}

// ============================================================================
// SHARE ID GENERATION
// ============================================================================

/**
 * Generate a unique share ID for a user's share of a Cue Card template
 * Format: {userId}_{templateId}_{timestamp}
 */
export function generateShareId(userId: string, templateId: string): string {
  const timestamp = Date.now().toString(36);
  return `${userId.slice(0, 8)}_${templateId.slice(0, 8)}_${timestamp}`;
}

/**
 * Parse a share ID to extract components
 */
export function parseShareId(shareId: string): { userPrefix: string; templatePrefix: string; timestamp: string } | null {
  const parts = shareId.split('_');
  if (parts.length !== 3) return null;
  return {
    userPrefix: parts[0],
    templatePrefix: parts[1],
    timestamp: parts[2]
  };
}

// ============================================================================
// CLICK TRACKING
// ============================================================================

/**
 * Record a click on a shared Cue Card
 * This is called when someone visits a shared link (via RedCarpet routing)
 * Wave A schema: cue_card_share_clicks(cue_card_id, click_token, anonymous_session_id, etc.)
 */
export async function recordClick(click: ShareClick): Promise<ClickResult> {
  try {
    // Generate a unique click token if not provided
    const clickToken = click.clickToken || generateClickToken();

    // Insert the click record
    const { data, error } = await supabase
      .from('cue_card_share_clicks')
      .insert({
        cue_card_id: click.cueCardId,
        click_token: clickToken,
        anonymous_session_id: click.anonymousSessionId || null,
        ip_country: click.ipCountry || null,
        user_agent_class: click.userAgentClass || null,
        clicked_at: new Date().toISOString(),
        converted: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error recording click:', error);
      return { success: false, error: error.message };
    }

    // Count total clicks for this cue card
    const { count } = await supabase
      .from('cue_card_share_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('cue_card_id', click.cueCardId);

    return {
      success: true,
      clickId: data.id,
      totalClicks: count || 1
    };
  } catch (err) {
    console.error('Error in recordClick:', err);
    return { success: false, error: 'Failed to record click' };
  }
}

/**
 * Generate a unique click token
 */
function generateClickToken(): string {
  return `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Record a click for ghost users (stored locally until they sign up)
 */
export function recordGhostClick(click: ShareClick): void {
  const ghostClicks = JSON.parse(localStorage.getItem('ghost_cue_card_clicks') || '[]');

  // Check for duplicate
  const isDuplicate = ghostClicks.some((c: ShareClick) =>
    c.cueCardId === click.cueCardId && c.anonymousSessionId === click.anonymousSessionId
  );

  if (!isDuplicate) {
    ghostClicks.push({
      ...click,
      clickedAt: new Date().toISOString()
    });
    localStorage.setItem('ghost_cue_card_clicks', JSON.stringify(ghostClicks));
  }
}

// ============================================================================
// FRAME LOCK PROGRESS
// ============================================================================

/**
 * Get the current frame lock progress for a user on a specific Deck Card
 */
export async function getFrameLockProgress(
  deckCardId: string,
  userId: string
): Promise<FrameLockProgress | null> {
  const { data, error } = await supabase
    .from('social_frame_locks')
    .select('*')
    .eq('deck_card_id', deckCardId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    deckCardId: data.deck_card_id,
    userId: data.user_id,
    totalClicks: data.total_clicks,
    clicksPerLock: data.clicks_per_lock,
    lockTop: data.lock_top,
    lockRight: data.lock_right,
    lockBottom: data.lock_bottom,
    lockLeft: data.lock_left,
    isFullyUnlocked: data.is_fully_unlocked,
    unlockedAt: data.unlocked_at
  };
}

/**
 * Get frame lock progress from localStorage for ghost users
 */
export function getGhostFrameLockProgress(deckCardId: string): FrameLockProgress | null {
  const ghostProgress = JSON.parse(localStorage.getItem('ghost_frame_lock_progress') || '{}');
  return ghostProgress[deckCardId] || null;
}

/**
 * Update ghost frame lock progress locally
 */
export function updateGhostFrameLockProgress(deckCardId: string, clicks: number, clicksPerLock: number = 5): void {
  const ghostProgress = JSON.parse(localStorage.getItem('ghost_frame_lock_progress') || '{}');

  const locksUnlocked = Math.min(4, Math.floor(clicks / clicksPerLock));

  ghostProgress[deckCardId] = {
    deckCardId,
    userId: 'ghost',
    totalClicks: clicks,
    clicksPerLock,
    lockTop: locksUnlocked < 1,
    lockRight: locksUnlocked < 2,
    lockBottom: locksUnlocked < 3,
    lockLeft: locksUnlocked < 4,
    isFullyUnlocked: locksUnlocked >= 4,
    unlockedAt: locksUnlocked >= 4 ? new Date().toISOString() : undefined
  };

  localStorage.setItem('ghost_frame_lock_progress', JSON.stringify(ghostProgress));
}

// ============================================================================
// CLICK COUNTS
// ============================================================================

/**
 * Get total clicks for a specific Cue Card
 * Wave A schema: no direct sharer_id or template_id on clicks table
 */
export async function getClickCount(cueCardId: string): Promise<number> {
  const { count, error } = await supabase
    .from('cue_card_share_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('cue_card_id', cueCardId);

  if (error) {
    console.error('Error getting click count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get click counts for all Cue Cards created by a user
 * Wave A schema: must join through leviathan_cue_cards to find user's cards
 */
export async function getAllClickCounts(creatorUserId: string): Promise<Record<string, number>> {
  // First get all cue cards created by this user
  const { data: cueCards, error: cardsError } = await supabase
    .from('leviathan_cue_cards')
    .select('id')
    .eq('creator_user_id', creatorUserId);

  if (cardsError || !cueCards) return {};

  const cueCardIds = cueCards.map(card => card.id);
  if (cueCardIds.length === 0) return {};

  // Get clicks for all those cards
  const { data: clicks, error: clicksError } = await supabase
    .from('cue_card_share_clicks')
    .select('cue_card_id')
    .in('cue_card_id', cueCardIds);

  if (clicksError || !clicks) return {};

  // Count clicks per card
  const counts: Record<string, number> = {};
  clicks.forEach(click => {
    counts[click.cue_card_id] = (counts[click.cue_card_id] || 0) + 1;
  });

  return counts;
}

// ============================================================================
// CANDLE BURST REWARDS
// ============================================================================

/**
 * Award a Candle Burst reward when a Deck Card is fully unlocked
 */
export async function awardCandleBurstReward(
  userId: string,
  triggerType: 'social_unlock' | 'beacon_run' | 'golden_key' | 'pair_bonus',
  triggerId: string
): Promise<{ rewardId: string; pairCode: string } | null> {
  // Generate a pair code for potential pairing
  const pairCode = generatePairCode();

  const { data, error } = await supabase
    .from('candle_burst_rewards')
    .insert({
      user_id: userId,
      trigger_type: triggerType,
      trigger_id: triggerId,
      candle_uses: 3,
      pair_code: pairCode
    })
    .select()
    .single();

  if (error) {
    console.error('Error awarding candle burst:', error);
    return null;
  }

  return {
    rewardId: data.id,
    pairCode: data.pair_code
  };
}

/**
 * Generate a human-readable pair code
 */
function generatePairCode(): string {
  const adjectives = ['swift', 'bright', 'bold', 'calm', 'keen', 'wise', 'fair', 'true'];
  const nouns = ['beacon', 'candle', 'flame', 'spark', 'light', 'glow', 'star', 'moon'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${adj}-${noun}-${num}`;
}

/**
 * Claim a Candle Burst reward with a choice
 */
export async function claimCandleBurstReward(
  rewardId: string,
  choice: 'burst' | 'store' | 'pair'
): Promise<{ success: boolean; candleUses?: number; pairCode?: string }> {
  const { data: reward, error: fetchError } = await supabase
    .from('candle_burst_rewards')
    .select('*')
    .eq('id', rewardId)
    .single();

  if (fetchError || !reward) {
    return { success: false };
  }

  if (reward.is_claimed) {
    return { success: false };
  }

  // Update the reward with the choice
  const { error: updateError } = await supabase
    .from('candle_burst_rewards')
    .update({
      reward_choice: choice,
      is_claimed: true,
      claimed_at: new Date().toISOString()
    })
    .eq('id', rewardId);

  if (updateError) {
    return { success: false };
  }

  if (choice === 'burst') {
    // Award 3 candle uses immediately
    await addCandleUses(reward.user_id, 3);
    return { success: true, candleUses: 3 };
  } else if (choice === 'store') {
    // Store toward Babylon (tracked separately)
    await incrementStoredBursts(reward.user_id);
    return { success: true };
  } else if (choice === 'pair') {
    // Return pair code for sharing
    return { success: true, pairCode: reward.pair_code };
  }

  return { success: false };
}

/**
 * Add candle uses to a user's profile
 */
async function addCandleUses(userId: string, uses: number): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('candle_state')
    .eq('id', userId)
    .single();

  const currentState = profile?.candle_state || { standard: 0, babylon: 0 };
  const newStandard = (currentState.standard || 0) + (uses / 10); // Convert uses to candles

  await supabase
    .from('profiles')
    .update({
      candle_state: { ...currentState, standard: newStandard }
    })
    .eq('id', userId);
}

/**
 * Increment stored bursts toward Babylon conversion
 */
async function incrementStoredBursts(userId: string): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('candle_state')
    .eq('id', userId)
    .single();

  const currentState = profile?.candle_state || { standard: 0, babylon: 0, storedBursts: 0 };
  const newStoredBursts = (currentState.storedBursts || 0) + 1;

  // If 3 bursts stored, convert to 1 Mini Black Babylon
  if (newStoredBursts >= 3) {
    await supabase
      .from('profiles')
      .update({
        candle_state: {
          ...currentState,
          babylon: (currentState.babylon || 0) + 1,
          storedBursts: 0
        }
      })
      .eq('id', userId);
  } else {
    await supabase
      .from('profiles')
      .update({
        candle_state: { ...currentState, storedBursts: newStoredBursts }
      })
      .eq('id', userId);
  }
}

// ============================================================================
// PAIRING SYSTEM
// ============================================================================

/**
 * Join a pair using a pair code
 */
export async function joinPair(pairCode: string, joiningUserId: string): Promise<{
  success: boolean;
  candleUsesEach?: number;
  error?: string;
}> {
  // Find the reward with this pair code
  const { data: reward, error: fetchError } = await supabase
    .from('candle_burst_rewards')
    .select('*')
    .eq('pair_code', pairCode)
    .single();

  if (fetchError || !reward) {
    return { success: false, error: 'Invalid pair code' };
  }

  if (reward.paired_with_user_id) {
    return { success: false, error: 'This pair code has already been used' };
  }

  if (reward.user_id === joiningUserId) {
    return { success: false, error: 'Cannot pair with yourself' };
  }

  // Update the reward to mark as paired
  const { error: updateError } = await supabase
    .from('candle_burst_rewards')
    .update({
      paired_with_user_id: joiningUserId,
      pair_stage: 1
    })
    .eq('id', reward.id);

  if (updateError) {
    return { success: false, error: 'Failed to join pair' };
  }

  // Award 9 candle uses to both users
  await addCandleUses(reward.user_id, 9);
  await addCandleUses(joiningUserId, 9);

  return { success: true, candleUsesEach: 9 };
}

// ============================================================================
// GLOBAL POOLS
// ============================================================================

/**
 * Get a global unlock pool status
 */
export async function getGlobalPoolStatus(deckCardId: string): Promise<{
  totalClicks: number;
  clicksNeeded: number;
  isUnlocked: boolean;
  contributorCount: number;
} | null> {
  const { data, error } = await supabase
    .from('global_unlock_pools')
    .select('*')
    .eq('deck_card_id', deckCardId)
    .single();

  if (error || !data) return null;

  return {
    totalClicks: data.total_clicks,
    clicksNeeded: data.clicks_needed,
    isUnlocked: data.is_unlocked,
    contributorCount: data.contributors?.length || 0
  };
}

/**
 * Contribute to a global pool
 */
export async function contributeToGlobalPool(
  deckCardId: string,
  userId: string
): Promise<boolean> {
  const { data: pool, error: fetchError } = await supabase
    .from('global_unlock_pools')
    .select('*')
    .eq('deck_card_id', deckCardId)
    .single();

  if (fetchError || !pool) return false;

  // Add user to contributors if not already there
  const contributors = pool.contributors || [];
  if (!contributors.includes(userId)) {
    contributors.push(userId);
  }

  const newClickCount = pool.total_clicks + 1;
  const locksUnlocked = Math.min(4, Math.floor(newClickCount / (pool.clicks_needed / 4)));

  const { error: updateError } = await supabase
    .from('global_unlock_pools')
    .update({
      total_clicks: newClickCount,
      contributors,
      lock_top: locksUnlocked < 1,
      lock_right: locksUnlocked < 2,
      lock_bottom: locksUnlocked < 3,
      lock_left: locksUnlocked < 4,
      is_unlocked: locksUnlocked >= 4,
      unlocked_at: locksUnlocked >= 4 ? new Date().toISOString() : null
    })
    .eq('id', pool.id);

  return !updateError;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateShareId,
  parseShareId,
  recordClick,
  recordGhostClick,
  getFrameLockProgress,
  getGhostFrameLockProgress,
  updateGhostFrameLockProgress,
  getClickCount,
  getAllClickCounts,
  awardCandleBurstReward,
  claimCandleBurstReward,
  joinPair,
  getGlobalPoolStatus,
  contributeToGlobalPool
};
