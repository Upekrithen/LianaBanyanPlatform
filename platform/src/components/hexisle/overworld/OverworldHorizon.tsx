/**
 * OVERWORLD HORIZON
 * =================
 * Dim island silhouettes at viewport edges — distant islands
 * visible as low-opacity outlines, fading to mist.
 *
 * Note: Horizon island rendering is handled by OverworldCanvas.tsx.
 * This module provides configuration and helper functions for
 * the horizon effect.
 */

// ─── Horizon Configuration ──────────────────────────────────────────────────

export const HORIZON_CONFIG = {
  /** Base opacity for horizon islands */
  baseOpacity: 0.15,
  /** Minimum opacity (very distant) */
  minOpacity: 0.03,
  /** Maximum distance before island is fully invisible */
  maxVisibleDistance: 500,
  /** Shimmer speed for horizon fog effect */
  fogShimmerSpeed: 0.0005,
  /** Fog color */
  fogColor: "rgba(100, 130, 180, 0.08)",
  /** Silhouette color */
  silhouetteColor: "#2a4a6a",
};

// ─── Horizon Helpers ────────────────────────────────────────────────────────

/**
 * Calculate opacity for a horizon island based on distance from player.
 */
export function getHorizonOpacity(distance: number): number {
  if (distance >= HORIZON_CONFIG.maxVisibleDistance) return 0;
  const normalized = distance / HORIZON_CONFIG.maxVisibleDistance;
  return Math.max(
    HORIZON_CONFIG.minOpacity,
    HORIZON_CONFIG.baseOpacity * (1 - normalized),
  );
}

/**
 * Get the screen edge position for a horizon island silhouette.
 * Returns an angle and distance from viewport center.
 */
export function getHorizonScreenPosition(
  direction: number,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number } {
  const edgeRadius = Math.min(viewportWidth, viewportHeight) * 0.45;
  return {
    x: viewportWidth / 2 + Math.cos(direction) * edgeRadius,
    y: viewportHeight / 2 + Math.sin(direction) * edgeRadius,
  };
}

/**
 * Draw fog shimmer effect at viewport edges.
 * Creates a subtle mist that enhances the horizon feel.
 */
export function drawHorizonFog(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
): void {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.6,
  );
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.7, "transparent");
  gradient.addColorStop(1, HORIZON_CONFIG.fogColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export default HORIZON_CONFIG;
