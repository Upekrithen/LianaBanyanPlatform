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

export type DestinationType = 'single_project' | 'multi_project' | 'category' | 'portfolio';

export interface CueCardDestination {
  id: string;
  user_id: string;
  cue_card_template_id: string | null;
  destination_type: DestinationType;
  project_ids: string[];
  category_slug: string | null;
  include_owned_only: boolean;
  portfolio_filter: string | null;
  is_own_project: boolean;
  promotion_credit_rate: number;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DestinationWithProjects extends CueCardDestination {
  bound_projects_detail: Array<{ id: string; name: string }> | null;
  template_title: string | null;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  verification_status?: 'verified' | 'pending' | 'suspicious' | 'blocked';
  trust_score?: number;
  card_code?: string;
  stamp_owner?: string;
  destination_type?: DestinationType;
  bound_projects?: Array<{ id: string; name: string }>;
  category_slug?: string;
  is_own_project?: boolean;
  total_scans?: number;
  created_at?: string;
}

export interface CreateDestinationResult {
  destination_id: string;
  card_code: string;
  context_url: string;
}

export interface PromotionClickResult {
  attribution_id: string;
  marks_awarded: number;
}

// ============================================================================
// DESTINATION MANAGEMENT
// ============================================================================

/**
 * Create or update a cue card destination
 */
export async function createDestination(
  userId: string,
  templateId: string | null,
  destinationType: DestinationType,
  options: {
    projectIds?: string[];
    categorySlug?: string;
    includeOwnedOnly?: boolean;
    isOwnProject?: boolean;
    displayName?: string;
  } = {}
): Promise<CreateDestinationResult | null> {
  const { data, error } = await supabase.rpc('create_cue_card_destination', {
    p_user_id: userId,
    p_template_id: templateId,
    p_destination_type: destinationType,
    p_project_ids: options.projectIds || [],
    p_category_slug: options.categorySlug || null,
    p_include_owned_only: options.includeOwnedOnly || false,
    p_is_own_project: options.isOwnProject !== false,
    p_display_name: options.displayName || null,
  });

  if (error) {
    console.error('Error creating destination:', error);
    return null;
  }

  return data as CreateDestinationResult;
}

/**
 * Get all destinations for a user
 */
export async function getUserDestinations(userId: string): Promise<DestinationWithProjects[]> {
  const { data, error } = await supabase
    .from('v_user_cue_card_destinations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }

  return (data || []) as DestinationWithProjects[];
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
 */
export async function verifyCueCard(
  heraldId: string,
  contextId: string
): Promise<VerificationResult> {
  const { data, error } = await supabase.rpc('verify_cue_card', {
    p_herald_id: heraldId,
    p_context_id: contextId,
  });

  if (error) {
    console.error('Error verifying cue card:', error);
    return { valid: false, error: error.message };
  }

  return data as VerificationResult;
}

/**
 * Get Leviathan registry entry for a card code
 */
export async function getLeviathanEntry(cardCode: string) {
  const { data, error } = await supabase
    .from('leviathan_cue_cards')
    .select(`
      *,
      profiles:stamp_owner_id (display_name, full_name),
      cue_card_destinations:destination_id (*)
    `)
    .eq('card_code', cardCode)
    .single();

  if (error) {
    console.error('Error fetching Leviathan entry:', error);
    return null;
  }

  return data;
}

// ============================================================================
// PROMOTION ATTRIBUTION
// ============================================================================

/**
 * Record a promotion click (when someone promotes a project they don't own)
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
  const { data, error } = await supabase.rpc('record_promotion_click', {
    p_promoter_id: promoterId,
    p_project_id: projectId,
    p_destination_id: destinationId,
    p_clicker_id: options.clickerId || null,
    p_clicker_ghost_id: options.clickerGhostId || null,
    p_click_source: options.clickSource || 'qr_scan',
    p_platform: options.platform || 'direct',
  });

  if (error) {
    console.error('Error recording promotion click:', error);
    return null;
  }

  return data as PromotionClickResult;
}

/**
 * Get promotion statistics for a user
 */
export async function getPromotionStats(userId: string) {
  const { data, error } = await supabase
    .from('v_promotion_leaderboard')
    .select('*')
    .eq('promoter_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching promotion stats:', error);
    return null;
  }

  return data || {
    total_clicks: 0,
    total_marks_earned: 0,
    projects_promoted: 0,
    signups_generated: 0,
    backers_generated: 0,
  };
}

/**
 * Get promotion history for a user
 */
export async function getPromotionHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('promotion_attributions')
    .select(`
      *,
      projects:project_id (name)
    `)
    .eq('promoter_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching promotion history:', error);
    return [];
  }

  return data || [];
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
  displayMode: 'portfolio' | 'single_project' | 'project_chooser' | 'category_browse';
  heraldId: string;
  heraldName: string;
  destination: CueCardDestination | null;
  projects: Array<{ id: string; name: string; description?: string }>;
  categorySlug: string | null;
  isOwnProject: boolean;
  verificationStatus: 'verified' | 'pending' | 'suspicious' | 'blocked';
  trustScore: number;
}

/**
 * Resolve RedCarpet context from URL parameters
 * This is the main function called by RedCarpet.tsx to determine what to display
 */
export async function resolveRedCarpetContext(
  heraldId: string,
  contextId: string | null
): Promise<RedCarpetContext | null> {
  // Fetch herald info
  const { data: herald } = await supabase
    .from('profiles')
    .select('display_name, full_name')
    .eq('id', heraldId)
    .single();

  if (!herald) {
    return null;
  }

  const heraldName = herald.display_name || herald.full_name || 'Unknown';

  // If no context, show full portfolio
  if (!contextId) {
    return {
      displayMode: 'portfolio',
      heraldId,
      heraldName,
      destination: null,
      projects: [],
      categorySlug: null,
      isOwnProject: true,
      verificationStatus: 'verified',
      trustScore: 100,
    };
  }

  // Verify and fetch destination
  const verification = await verifyCueCard(heraldId, contextId);
  
  if (!verification.valid) {
    return null;
  }

  const destination = await getDestination(contextId);
  
  if (!destination) {
    return null;
  }

  // Determine display mode and fetch projects
  let displayMode: RedCarpetContext['displayMode'] = 'portfolio';
  let projects: Array<{ id: string; name: string; description?: string }> = [];

  switch (destination.destination_type) {
    case 'single_project':
      displayMode = 'single_project';
      if (destination.project_ids.length > 0) {
        const { data } = await supabase
          .from('projects')
          .select('id, name, description')
          .in('id', destination.project_ids);
        projects = data || [];
      }
      break;

    case 'multi_project':
      displayMode = 'project_chooser';
      if (destination.project_ids.length > 0) {
        const { data } = await supabase
          .from('projects')
          .select('id, name, description')
          .in('id', destination.project_ids);
        projects = data || [];
      }
      break;

    case 'category':
      displayMode = 'category_browse';
      // Projects will be fetched by the category browser component
      break;

    case 'portfolio':
    default:
      displayMode = 'portfolio';
      break;
  }

  // Record promotion attribution if not own project
  if (!destination.is_own_project && destination.project_ids.length > 0) {
    // This will be called with clicker info when we have it
    // For now, just note that attribution tracking is needed
  }

  return {
    displayMode,
    heraldId,
    heraldName,
    destination,
    projects,
    categorySlug: destination.category_slug,
    isOwnProject: destination.is_own_project,
    verificationStatus: verification.verification_status || 'verified',
    trustScore: verification.trust_score || 100,
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
