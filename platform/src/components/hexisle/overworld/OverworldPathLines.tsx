/**
 * OVERWORLD PATH LINES
 * ====================
 * Path connection drawing helpers for the 2D overworld canvas.
 *
 * Path types and their visual styles:
 *   - Land paths: brown dashes
 *   - Ocean paths: blue dashes
 *   - Canal paths: teal dashes
 *   - Pipe portal connections: colored line matching pipe line color
 *   - Animated dash flow in movement direction
 *
 * Note: Path line drawing is handled by OverworldCanvas.tsx.
 * This module provides path-specific configuration and utilities.
 */

import { type OverworldPath } from "@/lib/hexOverworldPaths";

// ─── Path Line Configuration ────────────────────────────────────────────────

export const PATH_CONFIG = {
  /** Land path color (earthy brown) */
  landColor: "#8B7355",
  /** Ocean path color (sea blue) */
  oceanColor: "#3b82f6",
  /** Canal path color (teal) */
  canalColor: "#3b82a0",
  /** Pipe portal path color (inherits from line) */
  pipeDefaultColor: "#22c55e",
  /** Dash pattern for regular paths */
  dashPattern: [4, 4] as number[],
  /** Dash pattern for pipe connections */
  pipeDashPattern: [6, 3] as number[],
  /** Line width for regular paths */
  lineWidth: 2,
  /** Line width for pipe connections */
  pipeLineWidth: 2.5,
  /** Opacity for regular paths */
  opacity: 0.6,
  /** Animated dash offset speed */
  dashAnimSpeed: 0.02,
};

// ─── Path Helpers ───────────────────────────────────────────────────────────

/**
 * Determine the path color based on its terrain content.
 */
export function getPathColor(path: OverworldPath): string {
  if (path.isOcean) return PATH_CONFIG.oceanColor;
  const hasCanal = path.hexSteps.some(h => h.terrain === "canal");
  if (hasCanal) return PATH_CONFIG.canalColor;
  return PATH_CONFIG.landColor;
}

/**
 * Calculate animated dash offset for path direction flow.
 * Creates the effect of dashes moving along the path.
 */
export function getAnimatedDashOffset(time: number): number {
  return (time * PATH_CONFIG.dashAnimSpeed) % 8;
}

export default PATH_CONFIG;
