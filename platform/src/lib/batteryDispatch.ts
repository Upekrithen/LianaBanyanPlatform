/**
 * BATTERY DISPATCH -- Bounty-Poster -> Marks flow
 * Scope 29: Mikey-hire test path
 *
 * Sends a formatted Battery Dispatch embed to a Discord webhook for a bounty.
 * Gate: Stripe/Marks must be operational before Marks are actually awarded.
 *
 * Uses discordWebhook.ts under the hood.
 */

import { sendDiscordWebhook, broadcastToDiscord, type DiscordEmbed } from './discordWebhook';

export interface BountyDispatchPayload {
  title: string;
  description?: string;
  marks: number;
  claimUrl: string;
  postedBy?: string;
  category?: string;
  expiresAt?: string;
}

/**
 * Build a Battery Dispatch embed for a bounty.
 */
export function buildBountyDispatchEmbed(bounty: BountyDispatchPayload): DiscordEmbed {
  const fields = [
    { name: 'Marks Reward', value: `${bounty.marks} Marks`, inline: true },
    { name: 'Category', value: bounty.category || 'General', inline: true },
  ];
  if (bounty.postedBy) fields.push({ name: 'Posted By', value: bounty.postedBy, inline: true });
  if (bounty.expiresAt) fields.push({ name: 'Expires', value: new Date(bounty.expiresAt).toLocaleDateString(), inline: true });

  return {
    title: `Battery Dispatch: ${bounty.title}`,
    description: bounty.description || 'A new bounty is available. Claim it to earn Marks.',
    url: bounty.claimUrl,
    color: 0xF59E0B, // amber-500 -- bounty gold
    fields,
    author: {
      name: 'Liana Banyan -- Battery Dispatch',
      icon_url: 'https://lianabanyan.com/lb-icon.png',
      url: 'https://lianabanyan.com',
    },
    footer: {
      text: 'Marks = cooperative participation -- not equity, shares, or returns.',
      icon_url: 'https://lianabanyan.com/lb-icon.png',
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send a Battery Dispatch for a single bounty to a specific webhook URL.
 */
export async function sendBatteryDispatch(
  webhookUrl: string,
  bounty: BountyDispatchPayload
): Promise<{ success: boolean; error?: string }> {
  const embed = buildBountyDispatchEmbed(bounty);
  return sendDiscordWebhook(webhookUrl, { embeds: [embed] });
}

/**
 * Broadcast a Battery Dispatch for a bounty to all connected Discord webhooks.
 */
export async function broadcastBatteryDispatch(
  bounty: BountyDispatchPayload
): Promise<{ sent: number; failed: number }> {
  const embed = buildBountyDispatchEmbed(bounty);
  return broadcastToDiscord({ embeds: [embed] });
}
