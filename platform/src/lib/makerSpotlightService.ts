/**
 * Maker Spotlight Service — "I'll Make You Famous!" System
 * =========================================================
 * Rotating maker slideshow: 3-min intervals, 3-6 slides per session (30s each),
 * reverts to base content between sessions, midnight rotation shifts order by 1.
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface MakerSpotlight {
  id: string;
  handle: string;
  displayName: string;
  tier: 1 | 2 | 3;
  specialty: string;
  description: string;
  verified: boolean;
  bestPostLikes: string;
  sellsOn: string | null;
  externalUrl: string | null;
  lbProjectUrl: string | null;
  imageUrl: string | null;
  category: string;
  hexisleRelevant: boolean;
  slipCastingPioneer: boolean;
  rotationOrder: number;
  active: boolean;
}

export type SpotlightPhase = "slideshow" | "idle";

export interface SpotlightState {
  phase: SpotlightPhase;
  currentSlideIndex: number;
  currentSessionStart: number;  // index of first slide in current session
  slidesPerSession: number;
  userOverride: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SLIDESHOW_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes between sessions
export const SLIDE_DURATION_MS = 30 * 1000; // 30 seconds per slide
export const SLIDES_PER_SESSION = 6; // 6 slides per session

export const TIER_LABELS: Record<number, string> = {
  1: "High-Value",
  2: "Mid-Value",
  3: "Emerging",
};

export const TIER_COLORS: Record<number, string> = {
  1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  3: "bg-green-500/20 text-green-400 border-green-500/30",
};

export const CATEGORY_COLORS: Record<string, string> = {
  maker: "bg-blue-500/20 text-blue-400",
  influencer: "bg-pink-500/20 text-pink-400",
  educator: "bg-cyan-500/20 text-cyan-400",
  food: "bg-green-500/20 text-green-400",
};

// ============================================================================
// SAMPLE DATA (47 makers from Instagram Factor-y collection)
// ============================================================================

export const SAMPLE_SPOTLIGHTS: MakerSpotlight[] = [
  { id: "ms1", handle: "forgecoreco", displayName: "ForgeCore Co", tier: 1, specialty: "Plant accessories, coasters, sports toys", description: "High-volume 3D print manufacturer with 514K+ likes.", verified: true, bestPostLikes: "514K", sellsOn: "Own site", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 1, active: true },
  { id: "ms2", handle: "nicholepaclibar", displayName: "Nichole Paclibar", tier: 1, specialty: "Product influencer", description: "Product influencer with 664K likes reach.", verified: true, bestPostLikes: "664K", sellsOn: "Amazon affiliate", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "influencer", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 2, active: true },
  { id: "ms3", handle: "loftedgoods", displayName: "Lofted Goods", tier: 1, specialty: "Wall-mount planters with drip jars", description: "Innovative wall-mount planters with integrated drip jar systems.", verified: true, bestPostLikes: "230K", sellsOn: "STL files", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 3, active: true },
  { id: "ms4", handle: "forest.ofcreativity", displayName: "Forest of Creativity", tier: 1, specialty: "Air-dry clay DIY tutorials", description: "Air-dry clay tutorial creator with 199K likes.", verified: false, bestPostLikes: "199K", sellsOn: "Tutorial content", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "educator", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 4, active: true },
  { id: "ms5", handle: "geekmonkey.in", displayName: "GeekMonkey", tier: 1, specialty: "Creative bookshelves, gift products", description: "Creative bookshelves and gift products from India.", verified: true, bestPostLikes: "157K", sellsOn: "India-based store", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 5, active: true },
  { id: "ms6", handle: "gazzaladradesign", displayName: "Gazzaladra Design", tier: 1, specialty: "3D printed notebooks, home products", description: "3D printed notebooks and home products on Thangs3D.", verified: true, bestPostLikes: "132K", sellsOn: "Thangs3D", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 6, active: true },
  { id: "ms7", handle: "craftykid3d", displayName: "CraftyKid3D", tier: 1, specialty: "Dragon book nooks", description: "Dragon book nook specialist. Patreon-based creator.", verified: true, bestPostLikes: "123K", sellsOn: "Patreon", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 7, active: true },
  { id: "ms8", handle: "hammerlyceramics", displayName: "Hammerly Ceramics", tier: 1, specialty: "Slip cast ceramics, lamps, mugs", description: "Architecture-inspired slip cast ceramics.", verified: true, bestPostLikes: "55.4K", sellsOn: "Own shop", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: true, rotationOrder: 15, active: true },
  { id: "ms9", handle: "josefprusa", displayName: "Josef Prusa", tier: 1, specialty: "Prusa Research founder", description: "Founder of Prusa Research — legendary 3D printer manufacturer.", verified: true, bestPostLikes: "31.4K", sellsOn: "Printables.com", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 22, active: true },
  { id: "ms10", handle: "dinarakasko", displayName: "Dinara Kasko", tier: 1, specialty: "Silicone mold cake design", description: "Silicone mold cake/pastry designer. Food + manufacturing crossover.", verified: true, bestPostLikes: "24.7K", sellsOn: "Own mold shop", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "food", hexisleRelevant: false, slipCastingPioneer: true, rotationOrder: 24, active: true },
  { id: "ms11", handle: "fusefoxdesign", displayName: "FuseFox Design (Tactocrat)", tier: 3, specialty: "Magnetic spring mechanisms", description: "Magnetic spring mechanism specialist. HexIsle partner candidate.", verified: false, bestPostLikes: "2K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: true, slipCastingPioneer: false, rotationOrder: 40, active: true },
  { id: "ms12", handle: "tabletopstamps", displayName: "Tabletop Stamps", tier: 3, specialty: "Modular dungeon stamps for D&D", description: "Modular dungeon stamps. Commenters requesting hex stamps.", verified: false, bestPostLikes: "675", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: true, slipCastingPioneer: false, rotationOrder: 46, active: true },
];

// ============================================================================
// ROTATION LOGIC
// ============================================================================

/**
 * Get the rotation offset for today based on midnight rotation rule.
 * Each day at midnight, the order shifts by 1.
 */
export function getDailyRotationOffset(): number {
  const now = new Date();
  const epoch = new Date("2026-01-01T00:00:00Z");
  const daysSinceEpoch = Math.floor((now.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceEpoch;
}

/**
 * Get the rotated spotlight order for today.
 */
export function getRotatedSpotlights(spotlights: MakerSpotlight[]): MakerSpotlight[] {
  if (spotlights.length === 0) return [];
  const sorted = [...spotlights].sort((a, b) => a.rotationOrder - b.rotationOrder);
  const offset = getDailyRotationOffset() % sorted.length;
  return [...sorted.slice(offset), ...sorted.slice(0, offset)];
}

/**
 * Get the current session's slides based on elapsed time.
 * Returns null during idle phase (between sessions).
 */
export function getCurrentSession(
  spotlights: MakerSpotlight[],
  startTime: number
): { slides: MakerSpotlight[]; slideIndex: number; phase: SpotlightPhase; sessionNumber: number } | null {
  if (spotlights.length === 0) return null;

  const now = Date.now();
  const elapsed = now - startTime;
  const sessionDuration = SLIDES_PER_SESSION * SLIDE_DURATION_MS;
  const cycleLength = SLIDESHOW_INTERVAL_MS + sessionDuration;
  const positionInCycle = elapsed % cycleLength;

  if (positionInCycle < SLIDESHOW_INTERVAL_MS) {
    // Idle phase
    const sessionNumber = Math.floor(elapsed / cycleLength);
    return { slides: [], slideIndex: -1, phase: "idle", sessionNumber };
  }

  // Slideshow phase
  const slideshowElapsed = positionInCycle - SLIDESHOW_INTERVAL_MS;
  const slideIndex = Math.min(
    Math.floor(slideshowElapsed / SLIDE_DURATION_MS),
    SLIDES_PER_SESSION - 1
  );
  const sessionNumber = Math.floor(elapsed / cycleLength);
  const startIdx = (sessionNumber * SLIDES_PER_SESSION) % spotlights.length;
  const slides: MakerSpotlight[] = [];
  for (let i = 0; i < SLIDES_PER_SESSION; i++) {
    slides.push(spotlights[(startIdx + i) % spotlights.length]);
  }

  return { slides, slideIndex, phase: "slideshow", sessionNumber };
}

// ============================================================================
// FETCH FUNCTIONS
// ============================================================================

export async function fetchSpotlights(): Promise<MakerSpotlight[]> {
  try {
    const { data, error } = await supabase
      .from("maker_spotlights")
      .select("*")
      .eq("active", true)
      .order("rotation_order", { ascending: true });
    if (error || !data?.length) return SAMPLE_SPOTLIGHTS;
    return data.map(mapSpotlight);
  } catch {
    return SAMPLE_SPOTLIGHTS;
  }
}

export async function fetchSpotlightsByTier(tier: number): Promise<MakerSpotlight[]> {
  try {
    const { data, error } = await supabase
      .from("maker_spotlights")
      .select("*")
      .eq("active", true)
      .eq("tier", tier)
      .order("rotation_order", { ascending: true });
    if (error || !data?.length) return SAMPLE_SPOTLIGHTS.filter(s => s.tier === tier);
    return data.map(mapSpotlight);
  } catch {
    return SAMPLE_SPOTLIGHTS.filter(s => s.tier === tier);
  }
}

export async function fetchHexIsleRelevant(): Promise<MakerSpotlight[]> {
  try {
    const { data, error } = await supabase
      .from("maker_spotlights")
      .select("*")
      .eq("active", true)
      .eq("hexisle_relevant", true)
      .order("rotation_order", { ascending: true });
    if (error || !data?.length) return SAMPLE_SPOTLIGHTS.filter(s => s.hexisleRelevant);
    return data.map(mapSpotlight);
  } catch {
    return SAMPLE_SPOTLIGHTS.filter(s => s.hexisleRelevant);
  }
}

function mapSpotlight(row: any): MakerSpotlight {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    tier: row.tier,
    specialty: row.specialty,
    description: row.description,
    verified: row.verified,
    bestPostLikes: row.best_post_likes,
    sellsOn: row.sells_on,
    externalUrl: row.external_url,
    lbProjectUrl: row.lb_project_url,
    imageUrl: row.image_url,
    category: row.category,
    hexisleRelevant: row.hexisle_relevant,
    slipCastingPioneer: row.slip_casting_pioneer,
    rotationOrder: row.rotation_order,
    active: row.active,
  };
}
