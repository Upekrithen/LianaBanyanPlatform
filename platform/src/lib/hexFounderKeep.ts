/**
 * FOUNDER'S KEEP
 * ==============
 * The Founder's personal stronghold, far in the North beyond Train Island.
 * Locked behind a Snow Gate requiring level 60 and 12 correct locks.
 * Renders as a shimmering ice-blue structure in both 2D and 3D worlds.
 *
 * "In the North, behind the Snow Gate, where only the worthy may enter."
 */

// Shimmer color for the keep when viewed from afar
export const FOUNDER_SHIMMER_COLOR = "#b8d4e3";  // Ice/snow blue
export const FOUNDER_SHIMMER_GLOW = "#8fc5db";

export interface FounderKeepDef {
  id: string;
  name: string;
  worldPosition: { x: number; z: number };  // Far north, beyond Train Island
  requiredLevel: number;                      // 60
  gateType: "snow_gate";
  cornerLocks: number;                        // 6
  sideLocks: number;                          // 6
  totalLocks: number;                         // 12
  mascotFaceCard: string;                     // Reference to mascot brand face card
  shimmerColor: string;
  loreBlurb: string;
}

export interface LockState {
  cornerLocks: boolean[];  // 6 booleans
  sideLocks: boolean[];    // 6 booleans
}

/** The canonical Founder's Keep definition */
export const FOUNDERS_KEEP: FounderKeepDef = {
  id: "founders-keep",
  name: "The Founder's Keep",
  worldPosition: { x: 8, z: -120 },  // Far north, beyond all islands
  requiredLevel: 60,
  gateType: "snow_gate",
  cornerLocks: 6,
  sideLocks: 6,
  totalLocks: 12,
  mascotFaceCard: "mascot-founder-brand",
  shimmerColor: FOUNDER_SHIMMER_COLOR,
  loreBlurb: "In the North, behind the Snow Gate, the Founder's Keep shimmers like winter breath. Only those who have mastered all six islands and solved all twelve locks may enter. The mascot awaits within.",
};

/** Check if a player can access the Founder's Keep */
export function isAccessible(
  playerLevel: number,
  lockState: LockState,
): boolean {
  if (playerLevel < FOUNDERS_KEEP.requiredLevel) return false;
  const allCornerLocks = lockState.cornerLocks.length === 6 && lockState.cornerLocks.every(Boolean);
  const allSideLocks = lockState.sideLocks.length === 6 && lockState.sideLocks.every(Boolean);
  return allCornerLocks && allSideLocks;
}

/** Get a default (empty) lock state */
export function createEmptyLockState(): LockState {
  return {
    cornerLocks: [false, false, false, false, false, false],
    sideLocks: [false, false, false, false, false, false],
  };
}

/** Count how many locks are solved */
export function countSolvedLocks(lockState: LockState): number {
  const corners = lockState.cornerLocks.filter(Boolean).length;
  const sides = lockState.sideLocks.filter(Boolean).length;
  return corners + sides;
}

/** Get the shimmer intensity based on distance (for rendering) */
export function getShimmerIntensity(distanceFromPlayer: number): number {
  if (distanceFromPlayer < 10) return 1.0;
  if (distanceFromPlayer > 200) return 0.1;
  return 1.0 - (distanceFromPlayer - 10) / 200;
}
