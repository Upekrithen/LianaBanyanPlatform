/**
 * OVERWORLD OCEAN
 * ===============
 * Hexagonalized ocean rendering for the 2D overworld canvas.
 *
 * The ocean is rendered as a blue hex grid with subtle wave color cycling.
 * Ships are visible on ocean hexes when near harbors.
 * Movement range rings show vessel reach when at a harbor beacon.
 *
 * Note: Ocean hex drawing is handled by OverworldCanvas.tsx's render loop.
 * This module provides ocean-specific configuration and helper functions.
 */

import { type VesselType, VESSEL_SPEEDS } from "@/lib/hexOverworldPaths";

// ─── Ocean Configuration ────────────────────────────────────────────────────

export const OCEAN_CONFIG = {
  /** Base ocean hex fill color */
  baseColor: "#1a4a7a",
  /** Ocean hex stroke color */
  strokeColor: "#1e5590",
  /** Deep ocean color (for distant hexes) */
  deepColor: "#0d2d52",
  /** Wave shimmer amplitude */
  shimmerAmplitude: 10,
  /** Wave shimmer speed multiplier */
  shimmerSpeed: 0.001,
  /** Ship dot color */
  shipColor: "#f5f5f5",
  /** Ship dot radius */
  shipRadius: 3,
  /** Movement range ring color */
  rangeRingColor: "rgba(251, 191, 36, 0.2)",
  /** Movement range ring stroke */
  rangeRingStroke: "rgba(251, 191, 36, 0.4)",
};

// ─── Ocean Rendering Helpers ────────────────────────────────────────────────

/**
 * Get ocean hex color with subtle wave shimmer based on time.
 * Creates gentle color variation across the ocean surface.
 */
export function getOceanHexColor(q: number, r: number, time: number): string {
  const offset = (q * 7 + r * 13) % 100; // pseudo-random per hex
  const wave = Math.sin(time * OCEAN_CONFIG.shimmerSpeed + offset * 0.1);
  const shimmer = Math.round(wave * OCEAN_CONFIG.shimmerAmplitude);

  const baseR = 26 + shimmer;
  const baseG = 74 + Math.round(shimmer * 0.6);
  const baseB = 122 + Math.round(shimmer * 0.3);

  return `rgb(${baseR}, ${baseG}, ${baseB})`;
}

/**
 * Get the maximum movement range in hexes for a vessel type.
 * Used to draw range rings at harbors.
 */
export function getVesselRange(vessel: VesselType): number {
  return VESSEL_SPEEDS[vessel] * 3; // 3 turns of movement
}

/**
 * Check if a harbor beacon should show vessel selection.
 */
export function isHarborBeacon(beaconId: string): boolean {
  return beaconId === "harvest-9" || beaconId === "harvest-15";
}

export default OCEAN_CONFIG;
