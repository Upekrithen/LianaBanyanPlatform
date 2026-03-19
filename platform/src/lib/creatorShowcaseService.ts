/**
 * Creator Showcase Service — Interfaces, sample data, and Supabase stubs
 * for the Creator Showcase page with Creator Draft Pick elements.
 *
 * "Get Famous. Make Money. Do Good."
 *
 * Six-Tier Referral: Pioneer (1-100) → Vanguard (101-500) → Pathfinder (501-2K)
 *   → Trailblazer (2K-10K) → Guide (10K-50K) → Ambassador (50K+)
 */

// ============================================================================
// TYPES
// ============================================================================

export type CreatorSpecialty =
  | '3d_printing'
  | 'lamp_design'
  | 'tool_making'
  | 'game_design'
  | 'ceramics'
  | 'woodworking'
  | 'electronics'
  | 'textiles';

export type ReferralTier = 'pioneer' | 'vanguard' | 'pathfinder' | 'trailblazer' | 'guide' | 'ambassador';

export interface ShowcaseCreator {
  id: string;
  displayName: string;
  specialty: CreatorSpecialty;
  specialtyLabel: string;
  avatarUrl: string | null;
  bio: string;
  xpScore: number;
  xpTier: string;
  productsCount: number;
  totalBackings: number;
  externalUrl: string | null;
  instagramHandle: string | null;
  featured: boolean;
  joinedAt: string;
}

export interface ReferralTierConfig {
  key: ReferralTier;
  label: string;
  range: string;
  marksReward: number;
  description: string;
}

// ============================================================================
// REFERRAL TIER CONFIGURATION
// ============================================================================

export const REFERRAL_TIERS: ReferralTierConfig[] = [
  { key: 'pioneer', label: 'Pioneer', range: '1 - 100', marksReward: 10, description: 'First wave. Maximum reward.' },
  { key: 'vanguard', label: 'Vanguard', range: '101 - 500', marksReward: 5, description: 'Early adopters who shape the platform.' },
  { key: 'pathfinder', label: 'Pathfinder', range: '501 - 2,000', marksReward: 3, description: 'Building the trail for others.' },
  { key: 'trailblazer', label: 'Trailblazer', range: '2,001 - 10,000', marksReward: 2, description: 'Scaling the community.' },
  { key: 'guide', label: 'Guide', range: '10,001 - 50,000', marksReward: 1.5, description: 'Established network effect.' },
  { key: 'ambassador', label: 'Ambassador', range: '50,001+', marksReward: 1, description: 'Universal floor. Everyone gets something, forever.' },
];

export const SPECIALTY_LABELS: Record<CreatorSpecialty, string> = {
  '3d_printing': '3D Printing',
  'lamp_design': 'Lamp Design',
  'tool_making': 'Tool Making',
  'game_design': 'Game Design',
  'ceramics': 'Ceramics',
  'woodworking': 'Woodworking',
  'electronics': 'Electronics',
  'textiles': 'Textiles',
};

// ============================================================================
// SAMPLE DATA — 8 creators with various specialties
// ============================================================================

export const SAMPLE_CREATORS: ShowcaseCreator[] = [
  {
    id: 'creator-001',
    displayName: 'FuseFox Design',
    specialty: 'game_design',
    specialtyLabel: 'Game Design',
    avatarUrl: null,
    bio: 'Tactical board game pieces and compliant mechanism designs. Exploring magnetic attachment systems.',
    xpScore: 4200,
    xpTier: 'Bronze',
    productsCount: 6,
    totalBackings: 42,
    externalUrl: null,
    instagramHandle: 'fusefoxdesign',
    featured: true,
    joinedAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'creator-002',
    displayName: 'Greg Dean Mann',
    specialty: 'lamp_design',
    specialtyLabel: 'Lamp Design',
    avatarUrl: null,
    bio: 'Handcrafted sculptural lamps merging art with function. Each piece tells a story in light and shadow.',
    xpScore: 8750,
    xpTier: 'Bronze',
    productsCount: 12,
    totalBackings: 87,
    externalUrl: null,
    instagramHandle: 'greg.dean.mann',
    featured: true,
    joinedAt: '2025-12-10T00:00:00Z',
  },
  {
    id: 'creator-003',
    displayName: 'Moritz Walter',
    specialty: 'tool_making',
    specialtyLabel: 'Tool Making',
    avatarUrl: null,
    bio: 'Precision hand tools for the modern workshop. CNC-machined and built to last generations.',
    xpScore: 6300,
    xpTier: 'Bronze',
    productsCount: 8,
    totalBackings: 63,
    externalUrl: null,
    instagramHandle: 'moritz__walter',
    featured: false,
    joinedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'creator-004',
    displayName: 'Elega Workshop',
    specialty: '3d_printing',
    specialtyLabel: '3D Printing',
    avatarUrl: null,
    bio: 'Functional clips, holders, and organizers. Designed for real life, printed with precision.',
    xpScore: 3100,
    xpTier: 'Bronze',
    productsCount: 15,
    totalBackings: 31,
    externalUrl: null,
    instagramHandle: 'elega.yyc',
    featured: false,
    joinedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'creator-005',
    displayName: 'EMGI 3D',
    specialty: '3d_printing',
    specialtyLabel: '3D Printing',
    avatarUrl: null,
    bio: 'Kinetic mechanisms and moving sculptures. Bringing engineering art to the desktop.',
    xpScore: 5600,
    xpTier: 'Bronze',
    productsCount: 9,
    totalBackings: 56,
    externalUrl: null,
    instagramHandle: 'emgi3d',
    featured: true,
    joinedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'creator-006',
    displayName: 'Rowan Ceramics',
    specialty: 'ceramics',
    specialtyLabel: 'Ceramics',
    avatarUrl: null,
    bio: 'Slip-cast hexagonal vessels and planters. Exploring the intersection of geometry and clay.',
    xpScore: 2400,
    xpTier: 'Bronze',
    productsCount: 5,
    totalBackings: 24,
    externalUrl: null,
    instagramHandle: null,
    featured: false,
    joinedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'creator-007',
    displayName: 'Timber & Thread',
    specialty: 'woodworking',
    specialtyLabel: 'Woodworking',
    avatarUrl: null,
    bio: 'Handcrafted wooden game boards and tabletop accessories. Each piece is one-of-a-kind.',
    xpScore: 7100,
    xpTier: 'Bronze',
    productsCount: 7,
    totalBackings: 71,
    externalUrl: null,
    instagramHandle: null,
    featured: false,
    joinedAt: '2025-11-28T00:00:00Z',
  },
  {
    id: 'creator-008',
    displayName: 'Circuit Weaver',
    specialty: 'textiles',
    specialtyLabel: 'Textiles',
    avatarUrl: null,
    bio: 'E-textile prototyping kits and wearable tech components. Making circuits soft.',
    xpScore: 1800,
    xpTier: 'Bronze',
    productsCount: 4,
    totalBackings: 18,
    externalUrl: null,
    instagramHandle: null,
    featured: false,
    joinedAt: '2026-03-01T00:00:00Z',
  },
];

// ============================================================================
// XP TIER HELPERS
// ============================================================================

export function getXpBoxDisplay(xp: number): { boxes: number; remainder: number; tierColor: string; tierName: string } {
  const boxes = Math.floor(xp / 10000);
  const remainder = xp % 10000;
  if (boxes >= 1000) return { boxes, remainder, tierColor: '#1a1a2e', tierName: 'Obsidian' };
  if (boxes >= 100) return { boxes, remainder, tierColor: '#b9f2ff', tierName: 'Diamond' };
  if (boxes >= 10) return { boxes, remainder, tierColor: '#e5e4e2', tierName: 'Platinum' };
  if (boxes >= 1) return { boxes, remainder, tierColor: '#ffd700', tierName: 'Gold' };
  if (xp >= 10000) return { boxes: 1, remainder: xp - 10000, tierColor: '#c0c0c0', tierName: 'Silver' };
  return { boxes: 0, remainder: xp, tierColor: '#cd7f32', tierName: 'Bronze' };
}

// ============================================================================
// SUPABASE STUBS — TODO: wire to live data
// ============================================================================

/** TODO(SUPABASE): Fetch all showcase creators */
export async function fetchShowcaseCreators(): Promise<ShowcaseCreator[]> {
  // TODO: const { data } = await supabase.from('profiles')
  //   .select('*').not('creator_type', 'is', null).order('created_at', { ascending: false });
  return SAMPLE_CREATORS;
}

/** TODO(SUPABASE): Fetch featured creators only */
export async function fetchFeaturedCreators(): Promise<ShowcaseCreator[]> {
  // TODO: const { data } = await supabase.from('profiles')
  //   .select('*').eq('featured', true).not('creator_type', 'is', null);
  return SAMPLE_CREATORS.filter(c => c.featured);
}
