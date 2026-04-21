/**
 * SOCIAL PLUG SYSTEM
 * ==================
 * Universal plug management for social platform integrations.
 *
 * Design Principles:
 * 1. Everything works without social - Core games are complete standalone
 * 2. Social is additive - Plugs add bonuses, never requirements
 * 3. Platform agnostic - Same mechanics work across all platforms
 * 4. User choice - Users pick which platforms to connect
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type SocialPlatform =
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'bluesky'
  | 'threads'
  | 'mastodon'
  | 'discord'
  | 'imgur'
  | 'substack';

export interface SocialPlug {
  id: string;
  userId: string;
  platform: SocialPlatform;
  isEnabled: boolean;
  platformUsername?: string;
  platformUserId?: string;
  features: Record<string, boolean>;
  connectedAt: string;
  lastUsedAt?: string;
}

export interface PlatformFeatures {
  platform: SocialPlatform;
  displayName: string;
  icon: string;
  color: string;
  features: Record<string, boolean>;
  isAvailable: boolean;
  requiresApproval: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface ShareResult {
  success: boolean;
  shareId?: string;
  platformPostId?: string;
  shareUrl?: string;
  error?: string;
}

// ============================================================================
// PLUG MANAGEMENT
// ============================================================================

/**
 * Get all connected plugs for a user
 */
export async function getUserPlugs(userId: string): Promise<SocialPlug[]> {
  const { data, error } = await supabase
    .from('user_social_plugs')
    .select('*')
    .eq('user_id', userId)
    .order('platform');

  if (error) {
    console.error('Error fetching user plugs:', error);
    return [];
  }

  return (data || []).map(plug => ({
    id: plug.id,
    userId: plug.user_id,
    platform: plug.platform as SocialPlatform,
    isEnabled: plug.is_enabled,
    platformUsername: plug.platform_username,
    platformUserId: plug.platform_user_id,
    features: plug.plug_features || {},
    connectedAt: plug.connected_at,
    lastUsedAt: plug.last_used_at
  }));
}

/**
 * Get enabled plugs only
 */
export async function getEnabledPlugs(userId: string): Promise<SocialPlug[]> {
  const plugs = await getUserPlugs(userId);
  return plugs.filter(p => p.isEnabled);
}

/**
 * Check if a specific platform is connected and enabled
 */
export async function isPlugEnabled(userId: string, platform: SocialPlatform): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_social_plugs')
    .select('is_enabled')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single();

  if (error || !data) return false;
  return data.is_enabled;
}

/**
 * Toggle a plug on/off
 */
export async function togglePlug(
  userId: string,
  platform: SocialPlatform,
  enabled: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('user_social_plugs')
    .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('platform', platform);

  return !error;
}

/**
 * Connect a new social platform
 */
export async function connectPlug(
  userId: string,
  platform: SocialPlatform,
  connectionData: {
    platformUserId?: string;
    platformUsername?: string;
    oauthToken?: string;
    oauthRefreshToken?: string;
    oauthExpiresAt?: string;
  }
): Promise<{ success: boolean; plugId?: string; error?: string }> {
  const { data, error } = await supabase
    .from('user_social_plugs')
    .upsert({
      user_id: userId,
      platform,
      platform_user_id: connectionData.platformUserId,
      platform_username: connectionData.platformUsername,
      oauth_token: connectionData.oauthToken,
      oauth_refresh_token: connectionData.oauthRefreshToken,
      oauth_expires_at: connectionData.oauthExpiresAt,
      is_enabled: true,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,platform'
    })
    .select()
    .single();

  if (error) {
    console.error('Error connecting plug:', error);
    return { success: false, error: error.message };
  }

  return { success: true, plugId: data.id };
}

/**
 * Disconnect a social platform
 */
export async function disconnectPlug(userId: string, platform: SocialPlatform): Promise<boolean> {
  const { error } = await supabase
    .from('user_social_plugs')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);

  return !error;
}

// ============================================================================
// PLATFORM FEATURES
// ============================================================================

/**
 * Get available platform features
 */
export async function getAvailablePlatforms(): Promise<PlatformFeatures[]> {
  const { data, error } = await supabase
    .from('social_plug_features')
    .select('*')
    .eq('is_available', true)
    .order('display_name');

  if (error) {
    console.error('Error fetching platforms:', error);
    return [];
  }

  return (data || []).map(p => ({
    platform: p.platform as SocialPlatform,
    displayName: p.display_name,
    icon: p.icon,
    color: p.color,
    features: p.features || {},
    isAvailable: p.is_available,
    requiresApproval: p.requires_approval,
    approvalStatus: p.approval_status as 'pending' | 'approved' | 'rejected'
  }));
}

/**
 * Check if a platform feature is available
 */
export async function isPlatformFeatureAvailable(
  platform: SocialPlatform,
  feature: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('social_plug_features')
    .select('features')
    .eq('platform', platform)
    .single();

  if (error || !data) return false;
  return data.features?.[feature] === true;
}

// ============================================================================
// SHARE TRACKING
// ============================================================================

/**
 * Record a social share
 */
export async function recordShare(
  userId: string,
  platform: SocialPlatform,
  shareType: 'cue_card' | 'beacon_run' | 'golden_key' | 'deck_card' | 'general',
  contentId?: string,
  contentType?: string,
  shareUrl?: string,
  platformPostId?: string
): Promise<ShareResult> {
  const { data, error } = await supabase
    .from('social_shares')
    .insert({
      user_id: userId,
      platform,
      share_type: shareType,
      content_id: contentId,
      content_type: contentType,
      share_url: shareUrl,
      platform_post_id: platformPostId
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording share:', error);
    return { success: false, error: error.message };
  }

  // Update last_used_at on the plug
  await supabase
    .from('user_social_plugs')
    .update({ last_used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('platform', platform);

  return {
    success: true,
    shareId: data.id,
    platformPostId,
    shareUrl
  };
}

/**
 * Get share statistics for a user
 */
export async function getShareStats(userId: string): Promise<{
  totalShares: number;
  sharesByPlatform: Record<string, number>;
  totalClicks: number;
  totalConversions: number;
}> {
  const { data, error } = await supabase
    .from('social_shares')
    .select('platform, click_count, conversion_count')
    .eq('user_id', userId);

  if (error || !data) {
    return { totalShares: 0, sharesByPlatform: {}, totalClicks: 0, totalConversions: 0 };
  }

  const sharesByPlatform: Record<string, number> = {};
  let totalClicks = 0;
  let totalConversions = 0;

  data.forEach(share => {
    sharesByPlatform[share.platform] = (sharesByPlatform[share.platform] || 0) + 1;
    totalClicks += share.click_count || 0;
    totalConversions += share.conversion_count || 0;
  });

  return {
    totalShares: data.length,
    sharesByPlatform,
    totalClicks,
    totalConversions
  };
}

// ============================================================================
// SHARE URL GENERATION
// ============================================================================

/**
 * Generate a share URL for a piece of content
 */
export function generateShareUrl(
  contentType: 'cue_card' | 'beacon_run' | 'golden_key' | 'deck_card',
  contentId: string,
  sharerId: string,
  platform?: SocialPlatform
): string {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    type: contentType,
    id: contentId,
    ref: sharerId.slice(0, 8),
    ...(platform && { via: platform })
  });

  return `${baseUrl}/RedCarpet?${params.toString()}`;
}

/**
 * Generate platform-specific share URLs
 */
export function getPlatformShareUrl(
  platform: SocialPlatform,
  shareUrl: string,
  title: string,
  description?: string
): string {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'bluesky':
      return `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`;
    case 'threads':
      return `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`;
    case 'mastodon':
      return `https://mastodon.social/share?text=${encodedTitle}%20${encodedUrl}`;
    default:
      return shareUrl;
  }
}

// ============================================================================
// GHOST MODE SUPPORT
// ============================================================================

/**
 * Store plug preferences for ghost users (localStorage)
 */
export function setGhostPlugPreference(platform: SocialPlatform, enabled: boolean): void {
  const prefs = JSON.parse(localStorage.getItem('ghost_plug_prefs') || '{}');
  prefs[platform] = enabled;
  localStorage.setItem('ghost_plug_prefs', JSON.stringify(prefs));
}

/**
 * Get ghost user's plug preferences
 */
export function getGhostPlugPreferences(): Record<SocialPlatform, boolean> {
  return JSON.parse(localStorage.getItem('ghost_plug_prefs') || '{}');
}

/**
 * Migrate ghost plug preferences to user account
 */
export async function migrateGhostPlugs(userId: string): Promise<void> {
  const prefs = getGhostPlugPreferences();

  for (const [platform, enabled] of Object.entries(prefs)) {
    if (enabled) {
      await supabase
        .from('user_social_plugs')
        .upsert({
          user_id: userId,
          platform,
          is_enabled: true,
          plug_features: {},
          connected_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform'
        });
    }
  }

  // Clear ghost preferences
  localStorage.removeItem('ghost_plug_prefs');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getUserPlugs,
  getEnabledPlugs,
  isPlugEnabled,
  togglePlug,
  connectPlug,
  disconnectPlug,
  getAvailablePlatforms,
  isPlatformFeatureAvailable,
  recordShare,
  getShareStats,
  generateShareUrl,
  getPlatformShareUrl,
  setGhostPlugPreference,
  getGhostPlugPreferences,
  migrateGhostPlugs
};
