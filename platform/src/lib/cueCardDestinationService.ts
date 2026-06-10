/**
 * CUE CARD DESTINATION SERVICE
 * ============================
 * Innovation #1355-#1362: Contextual Cue Card Routing
 *
 * Your stamp, your identity — but configurable destination context.
 *
 * Integrates with:
 * - Slingshot Pass-Through (#1244-#1252) — Gravity well routing
 * - The Furnace (#1253-#1260) — Verification registry
 *
 * Use Cases:
 * 1. Single Project: "Back HexIsle" → shows only HexIsle
 * 2. Multi Project: "See My Work" → chooser with 3 projects
 * 3. Category: "Join the Food Revolution" → all food projects you support
 * 4. Third-Party: "Support My Friend's Project" → earn promotion credit
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type DestinationType = 'onboard' | 'storefront' | 'walkthrough';

export interface CueCardDestination {
  id: string;
  cue_card_id: string; // FK to leviathan_cue_cards.id
  destination_type: DestinationType;
  destination_url: string;
  ab_variant: string | null;
  priority: number;
  active: boolean;
  created_at: string;
}

// Wave A schema has no project binding on destinations
export interface DestinationWithDetails extends CueCardDestination {
  cue_card?: {
    short_token: string;
    creator_user_id: string;
    template_id: string | null;
  };
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  verification_status?: 'verified' | 'pending' | 'suspicious' | 'blocked';
  trust_score?: number;
  short_token?: string; // Wave A uses short_token, not card_code
  creator_user_id?: string; // Wave A uses creator_user_id, not stamp_owner
  destination_type?: DestinationType;
  total_scans?: number;
  created_at?: string;
}

export interface CreateDestinationResult {
  destination_id: string;
  short_token: string; // Wave A uses short_token
  destination_url: string;
}

export interface PromotionClickResult {
  attribution_id: string;
  marks_awarded: number;
}

// ============================================================================
// DESTINATION MANAGEMENT
// ============================================================================

/**
 * Create a cue card destination
 * Wave A schema: simplified destination model (type, url, variant)
 */
export async function createDestination(
  cueCardId: string,
  destinationType: DestinationType,
  destinationUrl: string,
  options: {
    abVariant?: string;
    priority?: number;
    active?: boolean;
  } = {}
): Promise<CreateDestinationResult | null> {
  const { data, error } = await supabase
    .from('cue_card_destinations')
    .insert({
      cue_card_id: cueCardId,
      destination_type: destinationType,
      destination_url: destinationUrl,
      ab_variant: options.abVariant || null,
      priority: options.priority || 1,
      active: options.active !== false
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating destination:', error);
    return null;
  }

  // Get the cue card's short_token
  const { data: cueCard } = await supabase
    .from('leviathan_cue_cards')
    .select('short_token')
    .eq('id', cueCardId)
    .single();

  return {
    destination_id: data.id,
    short_token: cueCard?.short_token || '',
    destination_url: destinationUrl
  };
}

/**
 * Get all destinations for cue cards created by a user
 * Wave A schema: destinations belong to cue cards, must join through leviathan_cue_cards
 */
export async function getUserDestinations(userId: string): Promise<DestinationWithDetails[]> {
  // First get all cue cards by this user
  const { data: cueCards, error: cardsError } = await supabase
    .from('leviathan_cue_cards')
    .select('id')
    .eq('creator_user_id', userId);

  if (cardsError || !cueCards) {
    console.error('Error fetching user cue cards:', cardsError);
    return [];
  }

  const cueCardIds = cueCards.map(card => card.id);
  if (cueCardIds.length === 0) return [];

  // Get destinations for those cards
  const { data, error } = await supabase
    .from('cue_card_destinations')
    .select(`
      *,
      leviathan_cue_cards:cue_card_id (
        short_token,
        creator_user_id,
        template_id
      )
    `)
    .in('cue_card_id', cueCardIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }

  return (data || []) as unknown as DestinationWithDetails[];
}

/**
 * Get a specific destination by ID
 */
export async function getDestination(destinationId: string): Promise<CueCardDestination | null> {
  const { data, error } = await supabase
    .from('cue_card_destinations')
    .select('*')
    .eq('id', destinationId)
    .single();

  if (error) {
    console.error('Error fetching destination:', error);
    return null;
  }

  return data as CueCardDestination;
}

/**
 * Delete a destination
 */
export async function deleteDestination(destinationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cue_card_destinations')
    .delete()
    .eq('id', destinationId);

  if (error) {
    console.error('Error deleting destination:', error);
    return false;
  }

  return true;
}

// ============================================================================
// VERIFICATION (FURNACE INTEGRATION)
// ============================================================================

/**
 * Verify a cue card (for Furnace and RedCarpet routing)
 * Wave A schema: simplified verification (check card exists and belongs to creator)
 * TODO: Replace with actual RPC if one exists in Wave A migration
 */
export async function verifyCueCard(
  creatorUserId: string,
  shortToken: string
): Promise<VerificationResult> {
  const { data, error } = await supabase
    .from('leviathan_cue_cards')
    .select('id, creator_user_id, short_token, created_at')
    .eq('short_token', shortToken)
    .eq('creator_user_id', creatorUserId)
    .single();

  if (error || !data) {
    console.error('Error verifying cue card:', error);
    return { valid: false, error: error?.message || 'Card not found' };
  }

  return {
    valid: true,
    verification_status: 'verified',
    trust_score: 100,
    short_token: data.short_token,
    creator_user_id: data.creator_user_id,
    created_at: data.created_at
  };
}

/**
 * Get Leviathan registry entry for a short token
 * Wave A schema: uses short_token (not card_code), creator_user_id (not stamp_owner_id)
 */
export async function getLeviathanEntry(shortToken: string) {
  const { data, error } = await supabase
    .from('leviathan_cue_cards')
    .select(`
      *,
      profiles:creator_user_id (display_name, full_name)
    `)
    .eq('short_token', shortToken)
    .single();

  if (error) {
    console.error('Error fetching Leviathan entry:', error);
    return null;
  }

  // Also fetch destinations for this card
  const { data: destinations } = await supabase
    .from('cue_card_destinations')
    .select('*')
    .eq('cue_card_id', data.id);

  return {
    ...data,
    destinations: destinations || []
  };
}

// ============================================================================
// PROMOTION ATTRIBUTION
// ============================================================================

/**
 * Record a promotion click (when someone promotes a project they don't own)
 * TODO: Wave A schema doesn't have promotion_attributions table yet
 */
export async function recordPromotionClick(
  promoterId: string,
  projectId: string,
  destinationId: string,
  options: {
    clickerId?: string;
    clickerGhostId?: string;
    clickSource?: 'qr_scan' | 'social_share' | 'direct_link';
    platform?: string;
  } = {}
): Promise<PromotionClickResult | null> {
  console.warn('recordPromotionClick: promotion_attributions table not in Wave A schema');
  return null;
}

/**
 * Get promotion statistics for a user
 * TODO: Wave A schema doesn't have v_promotion_leaderboard view yet
 */
export async function getPromotionStats(userId: string) {
  console.warn('getPromotionStats: v_promotion_leaderboard view not in Wave A schema');
  return {
    total_clicks: 0,
    total_marks_earned: 0,
    projects_promoted: 0,
    signups_generated: 0,
    backers_generated: 0,
  };
}

/**
 * Get promotion history for a user
 * TODO: Wave A schema doesn't have promotion_attributions table yet
 */
export async function getPromotionHistory(userId: string, limit = 50) {
  console.warn('getPromotionHistory: promotion_attributions table not in Wave A schema');
  return [];
}

// ============================================================================
// URL GENERATION
// ============================================================================

/**
 * Generate a context URL for a destination
 */
export function generateContextUrl(heraldId: string, contextId: string): string {
  return `https://lianabanyan.com/RedCarpet?herald=${heraldId}&ctx=${contextId}`;
}

/**
 * Parse a context URL to extract herald and context IDs
 */
export function parseContextUrl(url: string): { heraldId: string; contextId: string } | null {
  try {
    const urlObj = new URL(url);
    const heraldId = urlObj.searchParams.get('herald');
    const contextId = urlObj.searchParams.get('ctx');

    if (heraldId && contextId) {
      return { heraldId, contextId };
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// REDCARPET ROUTING HELPER
// ============================================================================

export interface RedCarpetContext {
  displayMode: 'onboard' | 'storefront' | 'walkthrough' | 'portfolio';
  creatorUserId: string;
  creatorName: string;
  destination: CueCardDestination | null;
  destinationUrl: string | null;
  verificationStatus: 'verified' | 'pending' | 'suspicious' | 'blocked';
  trustScore: number;
}

/**
 * Resolve RedCarpet context from URL parameters
 * This is the main function called by RedCarpet.tsx to determine what to display
 * Wave A schema: simplified routing based on destination_type and destination_url
 */
export async function resolveRedCarpetContext(
  shortToken: string
): Promise<RedCarpetContext | null> {
  // Fetch cue card and creator info
  const { data: cueCard, error: cardError } = await supabase
    .from('leviathan_cue_cards')
    .select(`
      *,
      profiles:creator_user_id (display_name, full_name)
    `)
    .eq('short_token', shortToken)
    .single();

  if (cardError || !cueCard) {
    console.error('Error fetching cue card:', cardError);
    return null;
  }

  const creatorName = cueCard.profiles?.display_name || cueCard.profiles?.full_name || 'Unknown';

  // Fetch active destination for this card (highest priority first)
  const { data: destinations } = await supabase
    .from('cue_card_destinations')
    .select('*')
    .eq('cue_card_id', cueCard.id)
    .eq('active', true)
    .order('priority', { ascending: false })
    .limit(1);

  const destination = destinations?.[0] || null;

  // Determine display mode based on destination type
  let displayMode: RedCarpetContext['displayMode'] = 'portfolio';
  if (destination) {
    displayMode = destination.destination_type;
  }

  return {
    displayMode,
    creatorUserId: cueCard.creator_user_id,
    creatorName,
    destination,
    destinationUrl: destination?.destination_url || null,
    verificationStatus: 'verified',
    trustScore: 100
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createDestination,
  getUserDestinations,
  getDestination,
  deleteDestination,
  verifyCueCard,
  getLeviathanEntry,
  recordPromotionClick,
  getPromotionStats,
  getPromotionHistory,
  generateContextUrl,
  parseContextUrl,
  resolveRedCarpetContext,
};
