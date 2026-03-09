/**
 * HEXISLE OVERWORLD UTILITIES
 * ===========================
 * Coordinate math, viewport management, and visibility calculations
 * for the 2D Mario World-style overworld renderer.
 *
 * The overworld uses flat-top hexagons matching the 3D world's coordinate system.
 * The viewport follows the player and only shows the current section.
 */

import { HEX_RADIUS } from "./hexIsleWorldData";
import { type OverworldBeaconPoint } from "./hexOverworldPaths";

// ─── Constants ──────────────────────────────────────────────────────────────

/** Hex size for 2D rendering (pixels). Separate from 3D HEX_RADIUS. */
export const OVERWORLD_HEX_SIZE = 24;

/** Visible radius in hexes from the player's position */
export const VISIBLE_HEX_RADIUS = 18;

/** Number of forward beacons to show */
export const VISIBLE_BEACONS_FORWARD = 3;

/** Number of backward beacons to show */
export const VISIBLE_BEACONS_BACKWARD = 2;

/** Horizon island opacity */
export const HORIZON_OPACITY = 0.15;

/** Player ghost glow radius (pixels) */
export const GHOST_GLOW_RADIUS = 12;

// ─── Viewport ───────────────────────────────────────────────────────────────

export interface Viewport {
  centerX: number;    // World-space center X (pixels)
  centerY: number;    // World-space center Y (pixels)
  width: number;      // Canvas width (pixels)
  height: number;     // Canvas height (pixels)
  zoom: number;       // Zoom factor (1.0 = default)
}

export function createDefaultViewport(canvasWidth: number, canvasHeight: number): Viewport {
  return {
    centerX: 0,
    centerY: 0,
    width: canvasWidth,
    height: canvasHeight,
    zoom: 1.0,
  };
}

// ─── Coordinate Conversions ─────────────────────────────────────────────────

/**
 * Convert axial hex coordinates (q, r) to screen pixels.
 * Uses flat-top hexagon layout matching the 3D world.
 */
export function hexToScreen(
  q: number,
  r: number,
  viewport: Viewport,
): { x: number; y: number } {
  const size = OVERWORLD_HEX_SIZE * viewport.zoom;

  // Flat-top hex: x = size * 3/2 * q, y = size * sqrt(3) * (r + q/2)
  const worldX = size * (3 / 2) * q;
  const worldY = size * Math.sqrt(3) * (r + q / 2);

  // Transform to screen coordinates (centered on viewport)
  const screenX = worldX - viewport.centerX + viewport.width / 2;
  const screenY = worldY - viewport.centerY + viewport.height / 2;

  return { x: screenX, y: screenY };
}

/**
 * Convert screen pixels to axial hex coordinates (q, r).
 * Returns fractional coordinates — use hexRound() to snap to nearest hex.
 */
export function screenToHex(
  screenX: number,
  screenY: number,
  viewport: Viewport,
): { q: number; r: number } {
  const size = OVERWORLD_HEX_SIZE * viewport.zoom;

  // Reverse the screen transform
  const worldX = screenX - viewport.width / 2 + viewport.centerX;
  const worldY = screenY - viewport.height / 2 + viewport.centerY;

  // Reverse flat-top hex math
  const q = (2 / 3) * worldX / size;
  const r = (-1 / 3 * worldX + Math.sqrt(3) / 3 * worldY) / size;

  return hexRound(q, r);
}

/**
 * Round fractional hex coordinates to the nearest integer hex.
 * Uses cube coordinate rounding.
 */
export function hexRound(q: number, r: number): { q: number; r: number } {
  const s = -q - r;

  let rQ = Math.round(q);
  let rR = Math.round(r);
  const rS = Math.round(s);

  const dQ = Math.abs(rQ - q);
  const dR = Math.abs(rR - r);
  const dS = Math.abs(rS - s);

  if (dQ > dR && dQ > dS) {
    rQ = -rR - rS;
  } else if (dR > dS) {
    rR = -rQ - rS;
  }

  return { q: rQ, r: rR };
}

// ─── Hex Geometry (for Canvas Drawing) ──────────────────────────────────────

/**
 * Get the 6 corner points of a flat-top hexagon at screen position.
 * Returns points in order for canvas path drawing.
 */
export function getHexCorners(
  centerX: number,
  centerY: number,
  size: number,
): Array<{ x: number; y: number }> {
  const corners: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    corners.push({
      x: centerX + size * Math.cos(angle),
      y: centerY + size * Math.sin(angle),
    });
  }
  return corners;
}

/**
 * Draw a filled hexagon on a canvas context.
 */
export function drawHex(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  fillColor: string,
  strokeColor?: string,
  strokeWidth: number = 1,
): void {
  const corners = getHexCorners(centerX, centerY, size);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

// ─── Visibility Calculations ────────────────────────────────────────────────

/**
 * Calculate hex distance between two hex positions.
 */
export function hexDistance(
  q1: number, r1: number,
  q2: number, r2: number,
): number {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

/**
 * Check if a hex position is within the visible viewport.
 */
export function isHexVisible(
  q: number,
  r: number,
  playerQ: number,
  playerR: number,
): boolean {
  return hexDistance(q, r, playerQ, playerR) <= VISIBLE_HEX_RADIUS;
}

/**
 * Calculate which beacons should be visible based on the player's current beacon.
 * Shows the nearest VISIBLE_BEACONS_FORWARD forward + VISIBLE_BEACONS_BACKWARD backward.
 */
export function calculateVisibleBeacons(
  allBeacons: OverworldBeaconPoint[],
  currentBeaconIndex: number,
): OverworldBeaconPoint[] {
  const start = Math.max(0, currentBeaconIndex - VISIBLE_BEACONS_BACKWARD);
  const end = Math.min(allBeacons.length, currentBeaconIndex + VISIBLE_BEACONS_FORWARD + 1);
  return allBeacons.slice(start, end);
}

/**
 * Get horizon island data — dim outlines of distant islands.
 * Returns simplified positions and opacity based on distance from player.
 */
export function getHorizonIslands(
  playerIslandId: number,
  playerQ: number,
  playerR: number,
  islandPositions: Array<{ id: number; worldX: number; worldZ: number }>,
): Array<{ id: number; screenDirection: number; opacity: number }> {
  return islandPositions
    .filter(island => island.id !== playerIslandId)
    .map(island => {
      // Calculate approximate direction from player to island center
      const dx = island.worldX - playerQ;
      const dz = island.worldZ - playerR;
      const direction = Math.atan2(dz, dx);

      // Distance affects opacity — farther = more faded
      const dist = Math.sqrt(dx * dx + dz * dz);
      const opacity = Math.max(0.05, HORIZON_OPACITY * (1 - dist / 500));

      return { id: island.id, screenDirection: direction, opacity };
    });
}

// ─── Viewport Management ────────────────────────────────────────────────────

/**
 * Center the viewport on a hex position (smooth lerp target).
 */
export function viewportTargetForHex(
  q: number,
  r: number,
  viewport: Viewport,
): { centerX: number; centerY: number } {
  const size = OVERWORLD_HEX_SIZE * viewport.zoom;
  const centerX = size * (3 / 2) * q;
  const centerY = size * Math.sqrt(3) * (r + q / 2);
  return { centerX, centerY };
}

/**
 * Smoothly lerp the viewport toward a target position.
 */
export function lerpViewport(
  viewport: Viewport,
  targetX: number,
  targetY: number,
  speed: number = 0.08,
): Viewport {
  return {
    ...viewport,
    centerX: viewport.centerX + (targetX - viewport.centerX) * speed,
    centerY: viewport.centerY + (targetY - viewport.centerY) * speed,
  };
}

// ─── Animation Helpers ──────────────────────────────────────────────────────

/**
 * Get interpolated position between two hex positions.
 * t goes from 0 (at fromHex) to 1 (at toHex).
 */
export function lerpHexPosition(
  fromQ: number, fromR: number,
  toQ: number, toR: number,
  t: number,
  viewport: Viewport,
): { x: number; y: number } {
  const from = hexToScreen(fromQ, fromR, viewport);
  const to = hexToScreen(toQ, toR, viewport);
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

/**
 * Canal water shimmer color based on time.
 * Simple sine wave for subtle animation.
 */
export function getCanalShimmerColor(time: number): string {
  const base = [59, 130, 160]; // #3b82a0 base
  const shimmer = Math.sin(time * 0.002) * 15;
  const r = Math.round(base[0] + shimmer);
  const g = Math.round(base[1] + shimmer * 0.5);
  const b = Math.round(base[2] - shimmer * 0.3);
  return `rgb(${r},${g},${b})`;
}

/**
 * Ghost glow intensity oscillation.
 */
export function getGhostGlowIntensity(time: number): number {
  return 0.6 + 0.4 * Math.sin(time * 0.003);
}
