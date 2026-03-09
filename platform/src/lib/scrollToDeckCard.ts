/**
 * SCROLLS → DECK CARDS CONVERSION SYSTEM
 * ======================================
 * "The scroll is the journey. The Deck Card is the destination."
 * 
 * Scrolls (Treasure Map collections) can be combined to create Deck Cards.
 * - Reading creates knowledge (scrolls contain what you learned)
 * - Collecting combines knowledge (multiple scrolls unlock frames)
 * - Deck Cards enable action (the door to APPLICATION of knowledge)
 * 
 * Core insight: "Books are great, and doing makes it happen."
 */

import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type BeaconColor = 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'orange' | 'gold';
export type FrameSide = 'front' | 'back' | 'left' | 'right';
export type FrameTier = 'basic' | 'enhanced' | 'master';

export interface ScrollAnchor {
  id: string;
  path: string;
  color: BeaconColor;
  text: string;
  selector: string;
  note?: string;
  canBeCueCard?: boolean;
  createdAt: string;
}

export interface TreasureScroll {
  id: string;
  name: string;
  path: string;
  pageTitle: string;
  anchors: ScrollAnchor[];
  createdAt: string;
  // Sealing
  isSealed: boolean;
  sealedAt?: string;
  readProgress: number; // 0-100
  hasOfValueNote: boolean;
  // Conversion tracking
  usedInForge?: string; // Deck Card ID if used
}

export interface DeckCardFrame {
  side: FrameSide;
  tier: FrameTier;
  scrollsRequired: number;
  scrollColorRequired: BeaconColor;
  isUnlocked: boolean;
  unlockedAt?: string;
  scrollsUsed: string[]; // Scroll IDs
}

export interface DeckCardForge {
  cardId: string;
  cardName: string;
  frames: {
    front: DeckCardFrame;
    back: DeckCardFrame;
    left: DeckCardFrame;
    right: DeckCardFrame;
  };
  isComplete: boolean;
  completedAt?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRAME REQUIREMENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Each frame side requires a specific beacon color type:
 * - Front: Gold ("Of Value") — What this card IS
 * - Back: Blue ("Important") — Key information
 * - Left: Yellow ("Decision") — Trade-offs / considerations
 * - Right: Green ("Return") — Related resources
 */
export const FRAME_COLOR_REQUIREMENTS: Record<FrameSide, BeaconColor> = {
  front: 'gold',   // "Of Value" scrolls
  back: 'blue',    // "Important" scrolls
  left: 'yellow',  // "Decision" scrolls
  right: 'green',  // "Return" scrolls
};

/**
 * Scrolls required per tier:
 * - Basic: 3 scrolls
 * - Enhanced: 5 scrolls + 1 sealed
 * - Master: 9 scrolls + 3 sealed
 */
export const TIER_REQUIREMENTS: Record<FrameTier, { total: number; sealed: number }> = {
  basic: { total: 3, sealed: 0 },
  enhanced: { total: 5, sealed: 1 },
  master: { total: 9, sealed: 3 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

const SCROLLS_STORAGE_KEY = 'liana_treasure_scrolls';

/**
 * Get all scrolls from localStorage
 */
export function getScrolls(): TreasureScroll[] {
  try {
    const stored = localStorage.getItem(SCROLLS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save scrolls to localStorage
 */
export function saveScrolls(scrolls: TreasureScroll[]): void {
  localStorage.setItem(SCROLLS_STORAGE_KEY, JSON.stringify(scrolls));
}

/**
 * Get a single scroll by ID
 */
export function getScrollById(scrollId: string): TreasureScroll | undefined {
  return getScrolls().find(s => s.id === scrollId);
}

/**
 * Check if a scroll can be sealed
 * Requirements:
 * 1. Read progress = 100% on all anchored pages
 * 2. Has at least one "Of Value" (gold) note
 */
export function canSealScroll(scroll: TreasureScroll): { canSeal: boolean; reason?: string } {
  if (scroll.isSealed) {
    return { canSeal: false, reason: 'Already sealed' };
  }
  
  if (scroll.readProgress < 100) {
    return { canSeal: false, reason: `Read progress: ${scroll.readProgress}% (need 100%)` };
  }
  
  if (!scroll.hasOfValueNote) {
    return { canSeal: false, reason: 'Needs at least one "Of Value" (gold) beacon with a note' };
  }
  
  return { canSeal: true };
}

/**
 * Seal a scroll (one-time action)
 */
export function sealScroll(scrollId: string): TreasureScroll | null {
  const scrolls = getScrolls();
  const index = scrolls.findIndex(s => s.id === scrollId);
  
  if (index === -1) return null;
  
  const scroll = scrolls[index];
  const { canSeal, reason } = canSealScroll(scroll);
  
  if (!canSeal) {
    console.warn(`Cannot seal scroll: ${reason}`);
    return null;
  }
  
  scroll.isSealed = true;
  scroll.sealedAt = new Date().toISOString();
  
  scrolls[index] = scroll;
  saveScrolls(scrolls);
  
  return scroll;
}

/**
 * Update scroll read progress
 */
export function updateScrollReadProgress(scrollId: string, progress: number): void {
  const scrolls = getScrolls();
  const index = scrolls.findIndex(s => s.id === scrollId);
  
  if (index === -1) return;
  
  scrolls[index].readProgress = Math.min(100, Math.max(0, progress));
  saveScrolls(scrolls);
}

/**
 * Check if scroll has "Of Value" note
 */
export function checkScrollHasOfValueNote(scroll: TreasureScroll): boolean {
  return scroll.anchors.some(a => a.color === 'gold' && a.note && a.note.length > 0);
}

/**
 * Get scrolls by dominant beacon color
 */
export function getScrollsByColor(color: BeaconColor): TreasureScroll[] {
  return getScrolls().filter(scroll => {
    const colorCounts = scroll.anchors.reduce((acc, anchor) => {
      acc[anchor.color] = (acc[anchor.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantColor = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return dominantColor === color;
  });
}

/**
 * Get sealed scrolls by color
 */
export function getSealedScrollsByColor(color: BeaconColor): TreasureScroll[] {
  return getScrollsByColor(color).filter(s => s.isSealed);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECK CARD FORGING
// ═══════════════════════════════════════════════════════════════════════════════

const FORGES_STORAGE_KEY = 'liana_deck_card_forges';

/**
 * Get all forges from localStorage
 */
export function getForges(): DeckCardForge[] {
  try {
    const stored = localStorage.getItem(FORGES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save forges to localStorage
 */
export function saveForges(forges: DeckCardForge[]): void {
  localStorage.setItem(FORGES_STORAGE_KEY, JSON.stringify(forges));
}

/**
 * Initialize a new forge for a deck card
 */
export function initializeForge(cardId: string, cardName: string): DeckCardForge {
  const createFrame = (side: FrameSide): DeckCardFrame => ({
    side,
    tier: 'basic',
    scrollsRequired: TIER_REQUIREMENTS.basic.total,
    scrollColorRequired: FRAME_COLOR_REQUIREMENTS[side],
    isUnlocked: false,
    scrollsUsed: [],
  });
  
  return {
    cardId,
    cardName,
    frames: {
      front: createFrame('front'),
      back: createFrame('back'),
      left: createFrame('left'),
      right: createFrame('right'),
    },
    isComplete: false,
  };
}

/**
 * Get or create a forge for a deck card
 */
export function getOrCreateForge(cardId: string, cardName: string): DeckCardForge {
  const forges = getForges();
  let forge = forges.find(f => f.cardId === cardId);
  
  if (!forge) {
    forge = initializeForge(cardId, cardName);
    forges.push(forge);
    saveForges(forges);
  }
  
  return forge;
}

/**
 * Check if scrolls can unlock a frame
 */
export function canUnlockFrame(
  forge: DeckCardForge,
  side: FrameSide,
  tier: FrameTier,
  scrollIds: string[]
): { canUnlock: boolean; reason?: string } {
  const frame = forge.frames[side];
  const requirements = TIER_REQUIREMENTS[tier];
  const requiredColor = FRAME_COLOR_REQUIREMENTS[side];
  
  // Get the scrolls
  const scrolls = scrollIds.map(id => getScrollById(id)).filter(Boolean) as TreasureScroll[];
  
  if (scrolls.length < requirements.total) {
    return { 
      canUnlock: false, 
      reason: `Need ${requirements.total} scrolls, have ${scrolls.length}` 
    };
  }
  
  // Check sealed requirement
  const sealedCount = scrolls.filter(s => s.isSealed).length;
  if (sealedCount < requirements.sealed) {
    return { 
      canUnlock: false, 
      reason: `Need ${requirements.sealed} sealed scrolls, have ${sealedCount}` 
    };
  }
  
  // Check color requirement (scrolls should have dominant color matching requirement)
  const matchingColorScrolls = scrolls.filter(scroll => {
    const hasMatchingAnchors = scroll.anchors.some(a => a.color === requiredColor);
    return hasMatchingAnchors;
  });
  
  if (matchingColorScrolls.length < requirements.total) {
    return { 
      canUnlock: false, 
      reason: `Need ${requirements.total} scrolls with ${requiredColor} beacons, have ${matchingColorScrolls.length}` 
    };
  }
  
  // Check if scrolls are already used
  const alreadyUsed = scrolls.filter(s => s.usedInForge);
  if (alreadyUsed.length > 0) {
    return { 
      canUnlock: false, 
      reason: `${alreadyUsed.length} scroll(s) already used in another forge` 
    };
  }
  
  return { canUnlock: true };
}

/**
 * Unlock a frame by consuming scrolls
 */
export function unlockFrame(
  cardId: string,
  side: FrameSide,
  tier: FrameTier,
  scrollIds: string[]
): DeckCardForge | null {
  const forges = getForges();
  const forgeIndex = forges.findIndex(f => f.cardId === cardId);
  
  if (forgeIndex === -1) return null;
  
  const forge = forges[forgeIndex];
  const { canUnlock, reason } = canUnlockFrame(forge, side, tier, scrollIds);
  
  if (!canUnlock) {
    console.warn(`Cannot unlock frame: ${reason}`);
    return null;
  }
  
  // Mark scrolls as used
  const scrolls = getScrolls();
  scrollIds.forEach(scrollId => {
    const scrollIndex = scrolls.findIndex(s => s.id === scrollId);
    if (scrollIndex !== -1) {
      scrolls[scrollIndex].usedInForge = cardId;
    }
  });
  saveScrolls(scrolls);
  
  // Update frame
  forge.frames[side] = {
    ...forge.frames[side],
    tier,
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    scrollsUsed: scrollIds,
  };
  
  // Check if all frames are unlocked
  const allUnlocked = Object.values(forge.frames).every(f => f.isUnlocked);
  if (allUnlocked) {
    forge.isComplete = true;
    forge.completedAt = new Date().toISOString();
  }
  
  forges[forgeIndex] = forge;
  saveForges(forges);
  
  return forge;
}

/**
 * Get forge progress summary
 */
export function getForgeProgress(forge: DeckCardForge): {
  framesUnlocked: number;
  totalFrames: number;
  percentComplete: number;
  nextFrameToUnlock: FrameSide | null;
} {
  const frames = Object.values(forge.frames);
  const framesUnlocked = frames.filter(f => f.isUnlocked).length;
  const totalFrames = frames.length;
  const percentComplete = (framesUnlocked / totalFrames) * 100;
  
  const nextFrameToUnlock = frames.find(f => !f.isUnlocked)?.side || null;
  
  return {
    framesUnlocked,
    totalFrames,
    percentComplete,
    nextFrameToUnlock,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL VALUE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the "value" of a scroll based on its contents
 */
export function calculateScrollValue(scroll: TreasureScroll): number {
  let value = 0;
  
  // Base value per anchor
  value += scroll.anchors.length * 10;
  
  // Bonus for "Of Value" anchors with notes
  const ofValueWithNotes = scroll.anchors.filter(a => a.color === 'gold' && a.note);
  value += ofValueWithNotes.length * 25;
  
  // Bonus for sealed scrolls
  if (scroll.isSealed) {
    value *= 2;
  }
  
  // Bonus for high read progress
  value += Math.floor(scroll.readProgress / 10) * 5;
  
  return value;
}

/**
 * Get recommended deck cards based on available scrolls
 */
export function getRecommendedCards(scrolls: TreasureScroll[]): {
  side: FrameSide;
  color: BeaconColor;
  availableScrolls: number;
  sealedScrolls: number;
  canUnlockBasic: boolean;
  canUnlockEnhanced: boolean;
  canUnlockMaster: boolean;
}[] {
  return (['front', 'back', 'left', 'right'] as FrameSide[]).map(side => {
    const color = FRAME_COLOR_REQUIREMENTS[side];
    const matchingScrolls = scrolls.filter(s => 
      s.anchors.some(a => a.color === color) && !s.usedInForge
    );
    const sealedScrolls = matchingScrolls.filter(s => s.isSealed);
    
    return {
      side,
      color,
      availableScrolls: matchingScrolls.length,
      sealedScrolls: sealedScrolls.length,
      canUnlockBasic: matchingScrolls.length >= TIER_REQUIREMENTS.basic.total,
      canUnlockEnhanced: matchingScrolls.length >= TIER_REQUIREMENTS.enhanced.total && 
                         sealedScrolls.length >= TIER_REQUIREMENTS.enhanced.sealed,
      canUnlockMaster: matchingScrolls.length >= TIER_REQUIREMENTS.master.total && 
                       sealedScrolls.length >= TIER_REQUIREMENTS.master.sealed,
    };
  });
}
