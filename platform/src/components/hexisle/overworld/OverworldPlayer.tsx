/**
 * OVERWORLD PLAYER
 * ================
 * Ghost icon sprite — the LB ghost from lianabanyan.com/ghost loading screen.
 * This is the "you are here" marker with a glow effect.
 *
 * Features:
 *   - Ghost glows so you always know which one is YOU
 *   - Smooth animation between hexes during movement
 *   - Direction indicator (ghost faces direction of travel)
 *   - Gondola sprite variant when on canal (ghost riding in gondola)
 *   - Ghost trail effect (faint afterimages on recently visited hexes)
 *
 * Note: The ghost drawing is done on canvas by OverworldCanvas.tsx.
 * This module provides the ghost sprite data and animation helpers
 * for the canvas renderer.
 */

import { getGhostGlowIntensity } from "@/lib/hexOverworldUtils";

// ─── Ghost Sprite Configuration ─────────────────────────────────────────────

export const GHOST_CONFIG = {
  /** Body color (soft white-blue) */
  bodyColor: "#e0f0ff",
  /** Glow aura color */
  glowColor: "#60a5fa",
  /** Eye color (deep navy) */
  eyeColor: "#1e3a5f",
  /** Gondola mode body color (slightly warmer) */
  gondolaBodyColor: "#d0e8f0",
  /** Trail afterimage opacity */
  trailOpacity: 0.15,
  /** Trail fade duration in ms */
  trailFadeDuration: 2000,
  /** Base radius in pixels */
  baseRadius: 8,
};

// ─── Ghost Trail System ─────────────────────────────────────────────────────

export interface GhostTrail {
  q: number;
  r: number;
  timestamp: number;
}

/**
 * Manage a rolling window of ghost trail positions.
 * Old positions fade out after trailFadeDuration.
 */
export function updateGhostTrail(
  trails: GhostTrail[],
  currentQ: number,
  currentR: number,
  now: number,
  maxTrails: number = 5,
): GhostTrail[] {
  // Remove expired trails
  const active = trails.filter(
    t => now - t.timestamp < GHOST_CONFIG.trailFadeDuration,
  );

  // Add current position if different from last trail
  const last = active[active.length - 1];
  if (!last || last.q !== currentQ || last.r !== currentR) {
    active.push({ q: currentQ, r: currentR, timestamp: now });
  }

  // Keep only the most recent maxTrails
  return active.slice(-maxTrails);
}

/**
 * Get trail opacity based on age.
 * Newer trails are more visible, older ones fade out.
 */
export function getTrailOpacity(trail: GhostTrail, now: number): number {
  const age = now - trail.timestamp;
  const fadeProgress = age / GHOST_CONFIG.trailFadeDuration;
  return Math.max(0, GHOST_CONFIG.trailOpacity * (1 - fadeProgress));
}

/**
 * Get the ghost glow intensity at a given time.
 * Re-exported from hexOverworldUtils for convenience.
 */
export { getGhostGlowIntensity };

export default GHOST_CONFIG;
