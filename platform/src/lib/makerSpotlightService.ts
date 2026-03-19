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
  1: "Established",
  2: "Rising",
  3: "Pioneer",
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
  // Tier 1: ESTABLISHED (24 makers)
  { id: "ms1", handle: "forgecoreco", displayName: "ForgeCore Co", tier: 1, specialty: "Plant accessories, coasters, sports toys", description: "High-volume 3D print manufacturer with 514K+ likes.", verified: true, bestPostLikes: "514K", sellsOn: "Own site", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 1, active: true },
  { id: "ms2", handle: "nicholepaclibar", displayName: "Nichole Paclibar", tier: 1, specialty: "Product influencer", description: "Product influencer with 664K likes reach. Amazon affiliate network.", verified: true, bestPostLikes: "664K", sellsOn: "Amazon affiliate", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "influencer", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 2, active: true },
  { id: "ms3", handle: "loftedgoods", displayName: "Lofted Goods", tier: 1, specialty: "Wall-mount planters with drip jars", description: "Innovative wall-mount planters with integrated drip jar systems. STL file seller.", verified: true, bestPostLikes: "230K", sellsOn: "STL files", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 3, active: true },
  { id: "ms4", handle: "forest.ofcreativity", displayName: "Forest of Creativity", tier: 1, specialty: "Air-dry clay DIY tutorials", description: "Air-dry clay tutorial creator with 199K likes. Educational content focus.", verified: false, bestPostLikes: "199K", sellsOn: "Tutorial content", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "educator", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 4, active: true },
  { id: "ms5", handle: "geekmonkey.in", displayName: "GeekMonkey", tier: 1, specialty: "Creative bookshelves, gift products", description: "Creative bookshelves and gift products. India-based maker with 157K likes.", verified: true, bestPostLikes: "157K", sellsOn: "India-based store", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 5, active: true },
  { id: "ms6", handle: "gazzaladradesign", displayName: "Gazzaladra Design", tier: 1, specialty: "3D printed notebooks, home products", description: "3D printed notebooks and home products. Active on Thangs3D with 132K likes.", verified: true, bestPostLikes: "132K", sellsOn: "Thangs3D", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 6, active: true },
  { id: "ms7", handle: "craftykid3d", displayName: "CraftyKid3D", tier: 1, specialty: "Dragon book nooks", description: "Dragon book nook specialist with 123K likes. Patreon-based creator.", verified: true, bestPostLikes: "123K", sellsOn: "Patreon", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 7, active: true },
  { id: "ms8", handle: "germy_ballswell", displayName: "Germy Ballswell", tier: 1, specialty: "Engineering projects, potato cannon", description: "Engineering projects including the famous potato cannon. 110K likes.", verified: true, bestPostLikes: "110K", sellsOn: "Files in bio", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 8, active: true },
  { id: "ms9", handle: "ghost_doggy_shop", displayName: "Ghost Doggy Shop", tier: 1, specialty: "Finished 3D printed products", description: "Taiwan-based finished 3D printed products shop. 103K likes.", verified: false, bestPostLikes: "103K", sellsOn: "Direct sales", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 9, active: true },
  { id: "ms10", handle: "makerspace.online", displayName: "MakerSpace Online", tier: 1, specialty: "Business card embossers", description: "Business card embossers and maker tools. Active on MakerWorld.", verified: false, bestPostLikes: "101K", sellsOn: "MakerWorld", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 10, active: true },
  { id: "ms11", handle: "fun.gift.idea", displayName: "Fun Gift Idea", tier: 1, specialty: "3D printed gift items", description: "3D printed gift items with 443K likes. Gift-focused product line.", verified: false, bestPostLikes: "443K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 11, active: true },
  { id: "ms12", handle: "niotoys1", displayName: "NIO Toys", tier: 1, specialty: "Mechanical toys", description: "Mechanical toy designer with 63.8K likes. Intricate mechanisms.", verified: false, bestPostLikes: "63.8K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 12, active: true },
  { id: "ms13", handle: "tales3dmaker", displayName: "Tales 3D Maker", tier: 1, specialty: "Mesh/mold 3D printing techniques", description: "Advanced mesh and mold 3D printing techniques. 56.7K likes.", verified: false, bestPostLikes: "56.7K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 13, active: true },
  { id: "ms14", handle: "measuredandslow", displayName: "Measured and Slow", tier: 1, specialty: "3D printed dragon scale fabric", description: "Dragon scale fabric pioneer using 3D printing. 57.5K likes.", verified: false, bestPostLikes: "57.5K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 14, active: true },
  { id: "ms15", handle: "hammerlyceramics", displayName: "Hammerly Ceramics", tier: 1, specialty: "Slip cast ceramics, lamps, mugs", description: "Architecture-inspired slip cast ceramics. Lamps, mugs, and art pieces. 55.4K likes.", verified: true, bestPostLikes: "55.4K", sellsOn: "Own shop", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: true, rotationOrder: 15, active: true },
  { id: "ms16", handle: "armas.4am", displayName: "Armas 4AM", tier: 1, specialty: "Robotics, cycloidal gearboxes", description: "Robotics and cycloidal gearbox specialist. 46.3K likes.", verified: true, bestPostLikes: "46.3K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 16, active: true },
  { id: "ms17", handle: "curv.lab", displayName: "Curv Lab", tier: 1, specialty: "3D printable RC car chassis", description: "3D printable RC car chassis designer. Active at curvlab.com. 37.6K likes.", verified: true, bestPostLikes: "37.6K", sellsOn: "curvlab.com", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 17, active: true },
  { id: "ms18", handle: "playconveyor", displayName: "Play Conveyor", tier: 1, specialty: "Modular storage containers", description: "Modular storage container system. Active on Thangs3D. 36.3K likes.", verified: true, bestPostLikes: "36.3K", sellsOn: "Thangs3D", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 18, active: true },
  { id: "ms19", handle: "concept_bytes", displayName: "Concept Bytes", tier: 1, specialty: "Smart chess board, engineering", description: "Smart chess board and engineering projects. 33.9K likes.", verified: true, bestPostLikes: "33.9K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 19, active: true },
  { id: "ms20", handle: "seekamaze", displayName: "SeekAmaze", tier: 1, specialty: "DIY craftsmanship/hacks", description: "DIY craftsmanship and hacks creator. 32.9K likes.", verified: false, bestPostLikes: "32.9K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 20, active: true },
  { id: "ms21", handle: "krysplants", displayName: "Krys Plants", tier: 1, specialty: "Novelty plant accessories", description: "Novelty plant accessories with dedicated store. 32.6K likes.", verified: true, bestPostLikes: "32.6K", sellsOn: "Own store", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 21, active: true },
  { id: "ms22", handle: "josefprusa", displayName: "Josef Prusa", tier: 1, specialty: "Prusa Research founder", description: "Founder of Prusa Research — legendary 3D printer manufacturer. 31.4K likes.", verified: true, bestPostLikes: "31.4K", sellsOn: "Printables.com", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 22, active: true },
  { id: "ms23", handle: "pyahik", displayName: "Pyahik", tier: 1, specialty: "Resin keychains, small business", description: "Resin keychain artisan with dedicated shop. 31.8K likes.", verified: true, bestPostLikes: "31.8K", sellsOn: "Own shop", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 23, active: true },
  { id: "ms24", handle: "dinarakasko", displayName: "Dinara Kasko", tier: 1, specialty: "Silicone mold cake design", description: "Silicone mold cake/pastry designer. Food + manufacturing crossover. 24.7K likes.", verified: true, bestPostLikes: "24.7K", sellsOn: "Own mold shop", externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "food", hexisleRelevant: false, slipCastingPioneer: true, rotationOrder: 24, active: true },
  // Tier 2: RISING (15 makers)
  { id: "ms25", handle: "yird_ceramics", displayName: "Yird Ceramics", tier: 2, specialty: "Slip cast cups with plaster molds", description: "Traditional slip casting with plaster molds. 25.6K likes.", verified: false, bestPostLikes: "25.6K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: true, rotationOrder: 25, active: true },
  { id: "ms26", handle: "turn.studio", displayName: "Turn Studio", tier: 2, specialty: "Full slip casting pipeline", description: "Full 3D to silicone to plaster to porcelain pipeline. 23.1K likes.", verified: false, bestPostLikes: "23.1K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: true, rotationOrder: 26, active: true },
  { id: "ms27", handle: "bloblab3d", displayName: "BlobLab 3D", tier: 2, specialty: "Character design (Blob Beetles)", description: "Character designer specializing in Blob Beetles. 22.1K likes.", verified: false, bestPostLikes: "22.1K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 27, active: true },
  { id: "ms28", handle: "elle.stvdio", displayName: "Elle Studio", tier: 2, specialty: "Beehive designs, flying butterflies", description: "Beehive designs and flying butterfly mechanisms. 20.7K likes.", verified: true, bestPostLikes: "20.7K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 28, active: true },
  { id: "ms29", handle: "volex3d", displayName: "Volex 3D", tier: 2, specialty: "3D printed workshop tools", description: "Workshop tool curator and creator. Credits other makers. 18.7K likes.", verified: false, bestPostLikes: "18.7K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 29, active: true },
  { id: "ms30", handle: "theworkspacehero", displayName: "The Workspace Hero", tier: 2, specialty: "3D printable notebook system", description: "3D printable notebook system designer. 15.9K likes.", verified: false, bestPostLikes: "15.9K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 30, active: true },
  { id: "ms31", handle: "frankmontano", displayName: "Frank Montano", tier: 2, specialty: "Mold making with silicone/resin", description: "Silicone and resin mold making specialist. 12K likes.", verified: false, bestPostLikes: "12K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 31, active: true },
  { id: "ms32", handle: "pathofseb", displayName: "Path of Seb", tier: 2, specialty: "Engineering/robotics projects", description: "Engineering and robotics project creator. 11.4K likes.", verified: false, bestPostLikes: "11.4K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 32, active: true },
  { id: "ms33", handle: "wigglitz.zb", displayName: "Wigglitz", tier: 2, specialty: "Print farm operation", description: "Print farm operator scaling 3D production. 8.1K likes.", verified: true, bestPostLikes: "8.1K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 33, active: true },
  { id: "ms34", handle: "3d_printer_academy", displayName: "3D Printer Academy", tier: 2, specialty: "3D printing education", description: "3D printing education platform. ~5K likes.", verified: false, bestPostLikes: "5K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "educator", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 34, active: true },
  { id: "ms35", handle: "nibblecommunity", displayName: "Nibble Community", tier: 2, specialty: "Engineering education platform", description: "Engineering education community. 6.7K likes.", verified: false, bestPostLikes: "6.7K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "educator", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 35, active: true },
  { id: "ms36", handle: "nvkv.makes", displayName: "NVKV Makes", tier: 2, specialty: "Mechanical coupling demos", description: "Mechanical coupling demonstration creator. 6.4K likes.", verified: false, bestPostLikes: "6.4K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 36, active: true },
  { id: "ms37", handle: "printsculptors", displayName: "Print Sculptors", tier: 2, specialty: "Fidget toys, clickers", description: "Fidget toy and clicker specialist. 40.6K likes.", verified: true, bestPostLikes: "40.6K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 37, active: true },
  { id: "ms38", handle: "krakdrag3d", displayName: "KrakDrag 3D", tier: 2, specialty: "Cyber Cat headphone holder", description: "Cyber Cat headphone holder designer. 63.3K likes.", verified: false, bestPostLikes: "63.3K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 38, active: true },
  { id: "ms39", handle: "elden_designs", displayName: "Elden Designs", tier: 2, specialty: "3D printed lamp designs", description: "Lamp designer using 3D printing. 5.3K likes.", verified: false, bestPostLikes: "5.3K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 39, active: true },
  // Tier 3: PIONEER (8 makers)
  { id: "ms40", handle: "fusefoxdesign", displayName: "FuseFox Design (Tactocrat)", tier: 3, specialty: "Magnetic spring mechanisms", description: "Magnetic spring mechanism specialist. HexIsle partner candidate. ~2K likes.", verified: false, bestPostLikes: "2K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: true, slipCastingPioneer: false, rotationOrder: 40, active: true },
  { id: "ms41", handle: "greg.dean.mann", displayName: "Greg Dean Mann", tier: 3, specialty: "Lamp design", description: "Lamp designer. ~1K likes.", verified: false, bestPostLikes: "1K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 41, active: true },
  { id: "ms42", handle: "moritz__walter", displayName: "Moritz Walter", tier: 3, specialty: "Tool design", description: "Tool designer and maker. ~1K likes.", verified: false, bestPostLikes: "1K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 42, active: true },
  { id: "ms43", handle: "elega.yyc", displayName: "Elega YYC", tier: 3, specialty: "Clip design", description: "Clip designer. ~500 likes.", verified: false, bestPostLikes: "500", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: false, slipCastingPioneer: false, rotationOrder: 43, active: true },
  { id: "ms44", handle: "emgi3d", displayName: "EMGI 3D", tier: 3, specialty: "Mechanism design", description: "Mechanism designer. HexIsle-relevant compliant mechanisms. ~2K likes.", verified: false, bestPostLikes: "2K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: true, slipCastingPioneer: false, rotationOrder: 44, active: true },
  { id: "ms45", handle: "abyssalcactus", displayName: "Abyssal Cactus", tier: 3, specialty: "Print-in-place hinge design", description: "Print-in-place hinge specialist. Compliant mechanism expertise. 2.5K likes.", verified: false, bestPostLikes: "2.5K", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: true, slipCastingPioneer: false, rotationOrder: 45, active: true },
  { id: "ms46", handle: "tabletopstamps", displayName: "Tabletop Stamps", tier: 3, specialty: "Modular dungeon stamps for D&D", description: "Modular dungeon stamps. Commenters requesting hex stamps. 675 likes.", verified: false, bestPostLikes: "675", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: true, slipCastingPioneer: false, rotationOrder: 46, active: true },
  { id: "ms47", handle: "theupgradefactory", displayName: "The Upgrade Factory", tier: 3, specialty: "Tabletop terrain (BattleTech/D&D)", description: "Tabletop terrain for BattleTech and D&D. Kickstarter funded. HexIsle-relevant.", verified: true, bestPostLikes: "13", sellsOn: null, externalUrl: null, lbProjectUrl: null, imageUrl: null, category: "maker", hexisleRelevant: true, slipCastingPioneer: false, rotationOrder: 47, active: true },
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
