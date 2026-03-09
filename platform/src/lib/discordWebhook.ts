/**
 * DISCORD WEBHOOK INTEGRATION
 * =============================
 * Sends messages to Discord channels via webhooks.
 *
 * Discord is integrated as:
 *   1. Webhook posting (for The Battery, announcements, etc.)
 *   2. Server invite links (displayed on profiles, Rally Group pages)
 *   3. Embed formatting (rich messages with images, fields, colors)
 *
 * Discord does NOT use OAuth for posting — it uses webhook URLs.
 * Members provide their Discord webhook URL in Plug settings.
 * The Battery sends formatted embeds to all connected Discord webhooks.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number; // Decimal color (e.g., 0x5865F2 = 5793522)
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; icon_url?: string; url?: string };
  footer?: { text: string; icon_url?: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: string; // ISO8601
}

export interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

export interface DiscordPlugConfig {
  webhookUrl: string;
  serverInviteUrl?: string;
  channelName?: string;
  serverName?: string;
}

// ============================================================================
// BRANDING
// ============================================================================

const LB_BRAND = {
  name: 'Liana Banyan',
  avatarUrl: 'https://lianabanyan.com/lb-icon.png',
  color: 0x6366F1, // indigo-500
  footerText: 'Liana Banyan • Cost+20% Forever',
  footerIcon: 'https://lianabanyan.com/lb-icon.png',
};

// ============================================================================
// SENDING
// ============================================================================

/**
 * Send a message via Discord webhook
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  // Validate webhook URL
  if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') &&
      !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
    return { success: false, error: 'Invalid Discord webhook URL' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: payload.username || LB_BRAND.name,
        avatar_url: payload.avatar_url || LB_BRAND.avatarUrl,
        content: payload.content,
        embeds: payload.embeds,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Discord API error: ${response.status} — ${errorText}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: `Network error: ${(err as Error).message}` };
  }
}

// ============================================================================
// PRE-BUILT EMBED TEMPLATES
// ============================================================================

/**
 * Create a standard Liana Banyan announcement embed
 */
export function createAnnouncementEmbed(opts: {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}): DiscordEmbed {
  return {
    title: opts.title,
    description: opts.description,
    url: opts.url || 'https://lianabanyan.com',
    color: LB_BRAND.color,
    image: opts.imageUrl ? { url: opts.imageUrl } : undefined,
    author: {
      name: LB_BRAND.name,
      icon_url: LB_BRAND.avatarUrl,
      url: 'https://lianabanyan.com',
    },
    footer: {
      text: LB_BRAND.footerText,
      icon_url: LB_BRAND.footerIcon,
    },
    fields: opts.fields,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a Battery fire notification embed
 */
export function createBatteryFireEmbed(opts: {
  campaignName: string;
  postsScheduled: number;
  platforms: string[];
  firstFireDate: string;
  duration: string;
}): DiscordEmbed {
  return {
    title: `🎯 Fire Mission: ${opts.campaignName}`,
    description: 'The Battery has fired. Posts are now scheduled across all platforms.',
    color: 0xEF4444, // red-500
    fields: [
      { name: 'Total Volleys', value: opts.postsScheduled.toString(), inline: true },
      { name: 'Platforms', value: opts.platforms.join(', '), inline: true },
      { name: 'First Volley', value: opts.firstFireDate, inline: true },
      { name: 'Campaign Duration', value: opts.duration, inline: true },
    ],
    author: {
      name: 'The Battery — Fire Control',
      icon_url: LB_BRAND.avatarUrl,
    },
    footer: {
      text: '"As You Wish" — Confirmed',
      icon_url: LB_BRAND.footerIcon,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a Swoop notification embed (Rally Group)
 */
export function createSwoopEmbed(opts: {
  familyName: string;
  reason: string;
  location: string;
  needsMeals: boolean;
  needsServices: boolean;
  needsFunding: boolean;
}): DiscordEmbed {
  const needs: string[] = [];
  if (opts.needsMeals) needs.push('🍕 Meal Train');
  if (opts.needsServices) needs.push('🛠️ Services');
  if (opts.needsFunding) needs.push('💰 Financial Support');

  return {
    title: `💜 Swoop Alert: ${opts.familyName}`,
    description: opts.reason,
    color: 0xA855F7, // purple-500
    fields: [
      { name: 'Location', value: opts.location, inline: true },
      { name: 'Needs', value: needs.join('\n') || 'TBD', inline: true },
    ],
    author: {
      name: 'Rally Group — The Swoop',
      icon_url: LB_BRAND.avatarUrl,
    },
    footer: {
      text: 'Community moves together',
      icon_url: LB_BRAND.footerIcon,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a new member welcome embed
 */
export function createWelcomeEmbed(memberNumber: number): DiscordEmbed {
  return {
    title: '🎉 New Member Joined!',
    description: `Member #${memberNumber} has joined the cooperative. Welcome aboard!`,
    color: 0x22C55E, // green-500
    fields: [
      { name: 'Founding Members', value: `${memberNumber} / 300`, inline: true },
      { name: 'Progress', value: `${Math.round((memberNumber / 300) * 100)}%`, inline: true },
    ],
    footer: {
      text: LB_BRAND.footerText,
      icon_url: LB_BRAND.footerIcon,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// PLUG MANAGEMENT
// ============================================================================

/**
 * Save Discord webhook configuration for a user
 */
export async function saveDiscordPlug(
  userId: string,
  config: DiscordPlugConfig
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_social_plugs')
    .upsert({
      user_id: userId,
      platform: 'discord',
      is_enabled: true,
      platform_username: config.channelName || config.serverName || 'Discord',
      platform_user_id: config.webhookUrl,
      plug_features: {
        webhook_url: config.webhookUrl,
        server_invite: config.serverInviteUrl || '',
        server_name: config.serverName || '',
        channel_name: config.channelName || '',
      },
    }, {
      onConflict: 'user_id,platform',
    });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Get all Discord webhooks to post to (admin/Battery use)
 */
export async function getDiscordWebhooks(): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_social_plugs')
    .select('platform_user_id, plug_features')
    .eq('platform', 'discord')
    .eq('is_enabled', true);

  if (error || !data) return [];

  return data
    .map(row => row.plug_features?.webhook_url || row.platform_user_id)
    .filter(Boolean) as string[];
}

/**
 * Broadcast a message to all connected Discord webhooks
 */
export async function broadcastToDiscord(
  payload: DiscordWebhookPayload
): Promise<{ sent: number; failed: number }> {
  const webhooks = await getDiscordWebhooks();
  let sent = 0;
  let failed = 0;

  for (const webhookUrl of webhooks) {
    const result = await sendDiscordWebhook(webhookUrl, payload);
    if (result.success) sent++;
    else failed++;
  }

  return { sent, failed };
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a Discord webhook URL
 */
export function isValidDiscordWebhook(url: string): boolean {
  return /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
}

/**
 * Validate a Discord invite URL
 */
export function isValidDiscordInvite(url: string): boolean {
  return /^https:\/\/(discord\.gg|discord\.com\/invite)\/[\w-]+$/.test(url);
}
