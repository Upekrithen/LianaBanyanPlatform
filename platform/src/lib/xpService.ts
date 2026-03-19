// XP Score System — Service Layer
// Paper 7: "The XP Score System: Multiplicative Accomplishment Metrics"
// XP never decreases — aggregate and cumulative. Starting reputation: 100.

export interface XPTier {
  name: string;
  minXP: number;
  maxXP: number;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export interface XPScore {
  userId: string;
  totalXP: number;
  tier: XPTier;
  foundingStatus: boolean;
  lastUpdated: string;
}

export interface XPEvent {
  id: string;
  userId: string;
  type: 'bounty' | 'product' | 'production_labor';
  xpAwarded: number;
  description: string;
  stampVerifiedBy: string;
  stampVerifiedAt: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  tier: XPTier;
  topAchievement: string;
  category: 'creator' | 'steward' | 'backer';
  foundingStatus: boolean;
}

export const XP_TIERS: XPTier[] = [
  {
    name: 'Bronze',
    minXP: 0,
    maxXP: 9_999,
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-700/30',
  },
  {
    name: 'Silver',
    minXP: 10_000,
    maxXP: 99_999,
    textColor: 'text-slate-300',
    bgColor: 'bg-slate-700/20',
    borderColor: 'border-slate-400/30',
  },
  {
    name: 'Gold',
    minXP: 100_000,
    maxXP: 999_999,
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    name: 'Platinum',
    minXP: 1_000_000,
    maxXP: 9_999_999,
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-400/30',
  },
  {
    name: 'Diamond',
    minXP: 10_000_000,
    maxXP: 99_999_999,
    textColor: 'text-cyan-300',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-400/30',
  },
  {
    name: 'Obsidian',
    minXP: 100_000_000,
    maxXP: Infinity,
    textColor: 'text-slate-100',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-300/30',
  },
];

export function getTier(xp: number): XPTier {
  for (let i = XP_TIERS.length - 1; i >= 0; i--) {
    if (xp >= XP_TIERS[i].minXP) return XP_TIERS[i];
  }
  return XP_TIERS[0];
}

export function getBoxNotation(xp: number): { boxes: number; remainder: number } {
  const boxes = Math.floor(xp / 10_000);
  const remainder = xp % 10_000;
  return { boxes, remainder };
}

export const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'DevGuild', xp: 67_800, tier: getTier(67_800), topAchievement: 'CodeForge Tools shipped 50+ digital products', category: 'creator', foundingStatus: true },
  { rank: 2, name: 'Harbor Woodworks', xp: 45_000, tier: getTier(45_000), topAchievement: 'Custom furniture, 100% quality stamps', category: 'creator', foundingStatus: true },
  { rank: 3, name: 'Academy Guild', xp: 31_500, tier: getTier(31_500), topAchievement: 'Didasko tutoring, 200+ sessions', category: 'steward', foundingStatus: true },
  { rank: 4, name: 'Captain Mike', xp: 22_100, tier: getTier(22_100), topAchievement: 'Boise Node founding captain', category: 'steward', foundingStatus: true },
  { rank: 5, name: 'Sarah Chen', xp: 14_200, tier: getTier(14_200), topAchievement: 'Sourdough pioneer, first Food maker', category: 'creator', foundingStatus: true },
  { rank: 6, name: 'Maple Forge', xp: 12_800, tier: getTier(12_800), topAchievement: 'CNC cutting boards, 40 preorders fulfilled', category: 'creator', foundingStatus: true },
  { rank: 7, name: 'Lisa Rivera', xp: 11_300, tier: getTier(11_300), topAchievement: 'First Steward to complete 10 campaigns', category: 'steward', foundingStatus: true },
  { rank: 8, name: 'PrintLab Co-op', xp: 10_500, tier: getTier(10_500), topAchievement: '3D-printed HexIsle accessories, Tier 4 certified', category: 'creator', foundingStatus: false },
  { rank: 9, name: 'Sam Okafor', xp: 9_800, tier: getTier(9_800), topAchievement: 'Top BandWagon backer, 25 successful picks', category: 'backer', foundingStatus: true },
  { rank: 10, name: 'Mountain Thread', xp: 8_600, tier: getTier(8_600), topAchievement: 'Hand-sewn leather goods, zero returns', category: 'creator', foundingStatus: true },
  { rank: 11, name: 'Jake Thornton', xp: 7_400, tier: getTier(7_400), topAchievement: 'Production labor champion, 300+ units stamped', category: 'creator', foundingStatus: false },
  { rank: 12, name: 'Desert Glass Studio', xp: 6_900, tier: getTier(6_900), topAchievement: 'Blown glass ornaments, holiday run sold out', category: 'creator', foundingStatus: true },
  { rank: 13, name: 'Maria Gonzalez', xp: 5_500, tier: getTier(5_500), topAchievement: 'Cottage law tamales, 50 repeat customers', category: 'creator', foundingStatus: true },
  { rank: 14, name: 'Beacon Node Alpha', xp: 4_800, tier: getTier(4_800), topAchievement: 'First service node, 99.8% uptime', category: 'steward', foundingStatus: true },
  { rank: 15, name: 'Wei Zhang', xp: 4_200, tier: getTier(4_200), topAchievement: 'Documentation marketplace, 15 guides published', category: 'creator', foundingStatus: false },
  { rank: 16, name: 'Clara Bennett', xp: 3_600, tier: getTier(3_600), topAchievement: 'Harper Guild truth-teller, 20 audits', category: 'steward', foundingStatus: true },
  { rank: 17, name: 'Rook Collective', xp: 2_900, tier: getTier(2_900), topAchievement: 'Collaborative pottery, kiln-share model', category: 'creator', foundingStatus: false },
  { rank: 18, name: 'Danny Marsh', xp: 2_100, tier: getTier(2_100), topAchievement: 'BandWagon early adopter, 10 projects backed', category: 'backer', foundingStatus: true },
  { rank: 19, name: 'Sunrise Candles', xp: 1_400, tier: getTier(1_400), topAchievement: 'Soy candle startup, first production run', category: 'creator', foundingStatus: true },
  { rank: 20, name: 'Terrence King', xp: 800, tier: getTier(800), topAchievement: 'Newest member, completed onboarding bounties', category: 'backer', foundingStatus: true },
];

import { supabase } from "@/integrations/supabase/client";

function mapDbToLeaderboardEntry(row: any, rank: number): LeaderboardEntry {
  const xp = Number(row.total_xp ?? 0);
  const tier = getTier(xp);
  const profileName = row.profiles?.display_name || row.profiles?.full_name || `User ${rank}`;
  const category: 'creator' | 'steward' | 'backer' =
    Number(row.creator_xp ?? 0) >= Number(row.civic_xp ?? 0) && Number(row.creator_xp ?? 0) >= Number(row.production_xp ?? 0)
      ? 'creator'
      : Number(row.civic_xp ?? 0) >= Number(row.production_xp ?? 0)
        ? 'steward'
        : 'backer';

  return {
    rank,
    name: profileName,
    xp,
    tier,
    topAchievement: row.tier ? `${row.tier} tier` : '',
    category,
    foundingStatus: true,
  };
}

export async function fetchLeaderboard(
  _filter: 'all' | 'creators' | 'stewards' | 'backers' = 'all',
  _timeRange: 'all_time' | 'this_month' | 'this_week' = 'all_time'
): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('xp_scores')
      .select('*, profiles(display_name, full_name)')
      .order('total_xp', { ascending: false })
      .limit(100);
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((row: any, i: number) => mapDbToLeaderboardEntry(row, i + 1));
    }
  } catch (err) {
    console.warn('[XP] Leaderboard DB fetch failed, using sample', err);
  }
  return SAMPLE_LEADERBOARD;
}

export async function fetchUserXP(userId: string): Promise<XPScore | null> {
  try {
    const { data, error } = await supabase
      .from('xp_scores')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      const xp = Number(data.total_xp ?? 0);
      return {
        userId: data.user_id,
        totalXP: xp,
        tier: getTier(xp),
        foundingStatus: true,
        lastUpdated: data.last_updated ?? '',
      };
    }
  } catch (err) {
    console.warn('[XP] User XP DB fetch failed', err);
  }
  return null;
}
