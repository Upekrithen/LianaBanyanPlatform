/**
 * PLATFORM CONSTANTS
 * ==================
 * Centralized configuration for URLs, limits, and platform-wide values.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL URLS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cephas Documentation Site
 */
export const CEPHAS_URL = 'https://cephas.lianabanyan.com';

/**
 * Helper to build Cephas URLs
 */
export function cephasUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${CEPHAS_URL}${cleanPath}`;
}

// Common Cephas paths
export const CEPHAS_PATHS = {
  costPlusTwenty: '/under-the-hood/cost-plus-twenty/',
  switzerlandProtocol: '/under-the-hood/switzerland-protocol/',
  sceToAux: '/articles/sce-to-aux-apollo-12/',
  underTheHood: '/under-the-hood/',
  initiatives: '/initiatives/',
  letters: '/letters/',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM ECONOMICS
// ═══════════════════════════════════════════════════════════════════════════════

export const ECONOMICS = {
  creatorShare: 0.833, // 83.3%
  platformMargin: 0.20, // 20%
  membershipFee: 5, // $5/year
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// INITIATIVE SLUGS
// ═══════════════════════════════════════════════════════════════════════════════

export const INITIATIVE_SLUGS = [
  'lets-make-dinner',
  'lets-get-groceries',
  'lets-go-shopping',
  'household-concierge',
  'family-table',
  'tatiana-schlossburg-health-accords',
  'msa',
  'defense-klaus',
  'rally-group',
  'vsl',
  'lets-make-bread',
  'harper-guild',
  'jukebox',
  'didasko',
  'power-to-the-people',
  'brass-tacks',
] as const;

export type InitiativeSlug = typeof INITIATIVE_SLUGS[number];
