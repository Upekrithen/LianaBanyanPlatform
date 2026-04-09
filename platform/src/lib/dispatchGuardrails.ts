/**
 * BATTERY DISPATCH GUARDRAILS
 * Per-platform rate limits and disclosure rules from Pawn legal review.
 * These are conservative adapter defaults — if a platform returns stricter
 * limits at runtime, dynamically ratchet down.
 */

import type { SocialPlatform } from './socialPlugSystem';

export interface PlatformGuardrail {
  maxPerHour: number;
  minIntervalMs: number;
  charLimit: number;
  disclosureTags: string[];
  apiNotes: string;
  cautionLevel: 'standard' | 'elevated' | 'high';
}

export const PLATFORM_GUARDRAILS: Record<SocialPlatform, PlatformGuardrail> = {
  twitter:   { maxPerHour: 4,  minIntervalMs: 5 * 60_000,  charLimit: 280,   disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official X API with user auth', cautionLevel: 'standard' },
  tiktok:    { maxPerHour: 3,  minIntervalMs: 15 * 60_000, charLimit: 2200,  disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official TikTok Content Posting API only', cautionLevel: 'high' },
  instagram: { maxPerHour: 4,  minIntervalMs: 10 * 60_000, charLimit: 2200,  disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official Instagram Graph API only', cautionLevel: 'elevated' },
  linkedin:  { maxPerHour: 3,  minIntervalMs: 15 * 60_000, charLimit: 3000,  disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official LinkedIn share/post APIs', cautionLevel: 'standard' },
  facebook:  { maxPerHour: 4,  minIntervalMs: 10 * 60_000, charLimit: 63206, disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official Meta APIs only', cautionLevel: 'standard' },
  discord:   { maxPerHour: 6,  minIntervalMs: 5 * 60_000,  charLimit: 2000,  disclosureTags: [],                    apiNotes: 'Bot, webhook, or API with server auth', cautionLevel: 'standard' },
  bluesky:   { maxPerHour: 6,  minIntervalMs: 5 * 60_000,  charLimit: 300,   disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official AT Protocol / Bluesky APIs', cautionLevel: 'standard' },
  threads:   { maxPerHour: 4,  minIntervalMs: 10 * 60_000, charLimit: 500,   disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official Threads API / Meta-approved', cautionLevel: 'elevated' },
  mastodon:  { maxPerHour: 6,  minIntervalMs: 5 * 60_000,  charLimit: 500,   disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Instance API with OAuth', cautionLevel: 'standard' },
  youtube:   { maxPerHour: 2,  minIntervalMs: 30 * 60_000, charLimit: 5000,  disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official YouTube Data API only', cautionLevel: 'elevated' },
  substack:  { maxPerHour: 2,  minIntervalMs: 30 * 60_000, charLimit: 50000, disclosureTags: [],                    apiNotes: 'Draft creation + user confirmation preferred', cautionLevel: 'elevated' },
  imgur:     { maxPerHour: 4,  minIntervalMs: 10 * 60_000, charLimit: 500,   disclosureTags: ['#ad', '#sponsored'], apiNotes: 'Official Imgur API with user auth', cautionLevel: 'elevated' },
};

export const PLATFORM_DISPLAY: Record<SocialPlatform, { name: string; icon: string; color: string; bgColor: string }> = {
  twitter:   { name: 'X / Twitter', icon: '𝕏',  color: '#000000', bgColor: 'bg-black' },
  tiktok:    { name: 'TikTok',      icon: '♪',  color: '#00f2ea', bgColor: 'bg-black' },
  instagram: { name: 'Instagram',   icon: '📷', color: '#E4405F', bgColor: 'bg-gradient-to-br from-purple-600 to-pink-500' },
  linkedin:  { name: 'LinkedIn',    icon: 'in', color: '#0A66C2', bgColor: 'bg-blue-700' },
  facebook:  { name: 'Facebook',    icon: 'f',  color: '#1877F2', bgColor: 'bg-blue-600' },
  discord:   { name: 'Discord',     icon: '🎮', color: '#5865F2', bgColor: 'bg-indigo-600' },
  bluesky:   { name: 'Bluesky',     icon: '🦋', color: '#0085FF', bgColor: 'bg-sky-500' },
  threads:   { name: 'Threads',     icon: '@',  color: '#000000', bgColor: 'bg-black' },
  mastodon:  { name: 'Mastodon',    icon: '🐘', color: '#6364FF', bgColor: 'bg-indigo-500' },
  youtube:   { name: 'YouTube',     icon: '▶',  color: '#FF0000', bgColor: 'bg-red-600' },
  substack:  { name: 'Substack',    icon: '✍',  color: '#FF6719', bgColor: 'bg-orange-500' },
  imgur:     { name: 'Imgur',        icon: '🖼', color: '#1BB76E', bgColor: 'bg-emerald-600' },
};

export type DispatchMode = 'now' | 'scheduled' | 'stagger';

export interface DispatchPlatformContent {
  platform: SocialPlatform;
  content: string;
  mediaUrls: string[];
  disclosureTags: string[];
  approved: boolean;
  skipped: boolean;
  exceedsLimit: boolean;
  platformSpecific?: Record<string, string>;
}

/**
 * Adapt base content for a specific platform (truncation, formatting).
 */
export function adaptContentForPlatform(
  baseContent: string,
  platform: SocialPlatform,
  disclosureTags: string[]
): string {
  const guardrail = PLATFORM_GUARDRAILS[platform];
  const tagSuffix = disclosureTags.length > 0 ? '\n\n' + disclosureTags.join(' ') : '';
  const fullContent = baseContent + tagSuffix;

  if (fullContent.length <= guardrail.charLimit) return fullContent;

  const truncated = fullContent.slice(0, guardrail.charLimit - 3) + '...';
  return truncated;
}

/**
 * Calculate stagger schedule for multiple platforms.
 * Returns timestamps offset from a base time using each platform's min interval.
 */
export function calculateStaggerSchedule(
  platforms: SocialPlatform[],
  baseTime: Date
): { platform: SocialPlatform; scheduledFor: Date }[] {
  let offset = 0;
  return platforms.map((platform, i) => {
    const guardrail = PLATFORM_GUARDRAILS[platform];
    if (i > 0) offset += guardrail.minIntervalMs;
    return {
      platform,
      scheduledFor: new Date(baseTime.getTime() + offset),
    };
  });
}

/**
 * Check if a platform needs a cooldown based on recent dispatch history.
 */
export function getCooldownMessage(
  platform: SocialPlatform,
  lastDispatchTime: Date | null
): string | null {
  if (!lastDispatchTime) return null;
  const guardrail = PLATFORM_GUARDRAILS[platform];
  const elapsed = Date.now() - lastDispatchTime.getTime();
  const remaining = guardrail.minIntervalMs - elapsed;

  if (remaining <= 0) return null;

  const display = PLATFORM_DISPLAY[platform];
  const minutes = Math.ceil(remaining / 60_000);
  return `${display.name} needs a breather — next dispatch available in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

/**
 * Format interval for user display.
 */
export function formatInterval(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

/**
 * Platform-specific disclosure templates (Bishop B042).
 * Only platforms with dedicated templates are listed. Others use generic #ad #sponsored tags.
 */
export interface PlatformDisclosureTemplate {
  platform: SocialPlatform;
  pinnedComment?: string;
  firstLines?: string;
  fullParagraph?: string;
  preFooter?: string;
  humanApprovalGate?: string;
  verbalNote?: string;
  avoidWords: string[];
  encouragedWords: string[];
}

/**
 * Discord Permission Architecture (Pawn-specified guardrails).
 * Discord is fundamentally different from broadcast platforms — it's a community
 * server with roles, channels, and permissions that need structural governance.
 */
export interface DiscordPermissionTemplate {
  role: string;
  permissions: string[];
  channels: string[];
  notes: string;
}

export const DISCORD_PERMISSION_ARCHITECTURE = {
  auditWarnings: {
    everyoneTag: '⚠️ @everyone and @here tags are PROHIBITED in automated dispatches. These require explicit admin approval for each use.',
    botLeastPrivilege: '🔒 Bot accounts must use least-privilege: Send Messages + Embed Links only. No Manage Messages, no Kick/Ban, no role management.',
    financialDataGating: '💰 Financial data (Credit balances, Marks totals, escrow amounts) may ONLY be posted in channels requiring @Backer-General role or higher.',
  },
  roleHierarchy: [
    { role: '@Visitor', permissions: ['Read Messages'], channels: ['#welcome', '#faq', '#announcements'], notes: 'Default role for new server members. Read-only access.' },
    { role: '@Member', permissions: ['Read Messages', 'Send Messages', 'Add Reactions'], channels: ['#general', '#introductions', '#marketplace'], notes: 'Verified Liana Banyan members ($5/yr). Can participate in general discussions.' },
    { role: '@Backer-General', permissions: ['Read Messages', 'Send Messages', 'Attach Files', 'Embed Links'], channels: ['#backer-lounge', '#project-updates', '#financial-transparency'], notes: 'Members who have made a backer election. Access to financial transparency channels.' },
    { role: '@Captain', permissions: ['Read Messages', 'Send Messages', 'Manage Messages', 'Create Threads'], channels: ['#captain-bridge', '#corridor-ops', '#recruitment'], notes: 'Active Captains. Can moderate their corridor channels and create recruitment threads.' },
    { role: '@Steward', permissions: ['Read Messages', 'Send Messages', 'Manage Messages', 'Manage Threads'], channels: ['#steward-quarters', '#dispute-resolution', '#housing-ops'], notes: 'Property stewards. Elevated moderation for housing-related channels.' },
    { role: '@Admin', permissions: ['Administrator'], channels: ['ALL'], notes: 'Platform administrators. Full server control.' },
  ] as DiscordPermissionTemplate[],
  botPermissions: {
    required: ['Send Messages', 'Embed Links'],
    prohibited: ['Administrator', 'Manage Server', 'Manage Roles', 'Kick Members', 'Ban Members', 'Manage Channels'],
    conditional: {
      'Manage Messages': 'Only if bot handles pin/unpin operations in announcement channels',
      'Read Message History': 'Required for context-aware replies in support channels',
      'Add Reactions': 'Required for poll/voting features only',
    },
  },
  channelCategories: {
    public: ['#welcome', '#faq', '#announcements', '#marketplace', '#showcase'],
    memberOnly: ['#general', '#introductions', '#challenges', '#say-it-fast'],
    backerGated: ['#backer-lounge', '#financial-transparency', '#project-updates', '#escrow-status'],
    captainOnly: ['#captain-bridge', '#corridor-ops', '#recruitment', '#marks-dashboard'],
    stewardOnly: ['#steward-quarters', '#dispute-resolution', '#housing-ops', '#stamp-review'],
    adminOnly: ['#admin-ops', '#cron-logs', '#error-reports', '#deploy-status'],
  },
} as const;

export const DISCLOSURE_TEMPLATES: Partial<Record<SocialPlatform, PlatformDisclosureTemplate>> = {
  linkedin: {
    platform: 'linkedin',
    pinnedComment: `Ad disclosure: Liana Banyan operates a cooperative-style platform where 83.3% of every transaction goes directly to creators and service providers. Platform Credits are prepaid service access within the Liana Banyan platform — they are not securities, equity, crypto, tokens, or cash equivalents, and they may not be converted to cash. All offers require human approval before fulfillment. If you use my link or participate in this offer, I may earn Marks (non-cash recognition for participation). Learn more at lianabanyan.com/disclosure #ad`,
    avoidWords: ['invest', 'equity', 'dividends', 'contribution impact', 'crypto', 'passive income', 'residual income', 'downline', 'ground floor', 'unlimited earning', 'guaranteed', 'will earn', 'life-changing income', 'join my team', 'financial freedom'],
    encouragedWords: ['83.3% creator share', 'Cost+20% pricing', 'cooperative-style membership', 'prepaid platform access', 'human-approved offers', 'community-funded'],
  },
  youtube: {
    platform: 'youtube',
    firstLines: `Ad disclosure: Liana Banyan operates a cooperative-style platform where 83.3% of every transaction goes directly to creators and service providers. Credits are prepaid platform access — not securities, equity, crypto, tokens, or cash equivalents — and they cannot be converted to cash. If you interact with this link or offer, I may earn Marks for participating and sharing. Details below. #ad`,
    fullParagraph: `--- FULL DISCLOSURE ---\n\nLiana Banyan Corporation (Wyoming C-Corp, EIN 41-2797446) operates a cooperative-style platform where 83.3% of every transaction flows directly to creators and service providers. Platform Credits are prepaid service access redeemable only within the Liana Banyan platform. Credits are NOT securities, equity, shares, cryptocurrency, tokens, or cash equivalents. Credits may not be converted to fiat currency — the one-way valve is permanent and irrevocable. All pricing operates at the Cost+20% constitutional floor. No guaranteed returns or income. Backer offers require human approval before fulfillment. This video may contain incentivized content, and I may earn Marks (non-cash recognition for participation) if you engage with this offer.\n\nLearn more: lianabanyan.com/disclosure`,
    verbalNote: `"Quick note — Liana Banyan is a cooperative-style platform where 83.3% of every transaction goes to creators. Credits are prepaid service access, not securities or crypto. I earn Marks for sharing — that's non-cash recognition. Full disclosure in the description."`,
    avoidWords: ['invest', 'equity', 'dividends', 'contribution impact', 'crypto', 'passive income', 'residual income', 'guaranteed', 'will earn', 'life-changing income', 'join my team', 'financial freedom', 'downline', 'ground floor', 'unlimited earning'],
    encouragedWords: ['83.3% creator share', 'Cost+20%', 'cooperative-style platform', 'prepaid service access'],
  },
  substack: {
    platform: 'substack',
    preFooter: `**Disclosure:** Liana Banyan Corporation (Wyoming C-Corp) operates a cooperative-style platform where 83.3% of every transaction flows directly to creators and service providers. Platform Credits are prepaid service access within the Liana Banyan platform — they are not securities, equity, crypto, tokens, or cash equivalents, and they may not be converted to cash. All pricing operates at the Cost+20% constitutional floor. No returns or income are promised or implied. Every backer offer requires human review and approval before fulfillment — no offer is automatically accepted or processed without a real person confirming it. This post may contain incentivized content, and I may earn Marks (non-cash recognition for participation) if you engage with this offer. Learn more at lianabanyan.com/disclosure.`,
    humanApprovalGate: `Every backer offer on Liana Banyan goes through a human approval gate. When you submit a backer election, a real person reviews it before anything happens. No automated fulfillment. No instant charges. You may withdraw your election at any time before approval is granted.`,
    avoidWords: ['invest', 'equity', 'dividends', 'contribution impact', 'crypto', 'passive income', 'residual income', 'guaranteed', 'will earn', 'life-changing income', 'join my team', 'financial freedom', 'downline', 'ground floor', 'unlimited earning'],
    encouragedWords: ['83.3% creator share', 'Cost+20%', 'cooperative-style membership', 'human-approved offers'],
  },
};
