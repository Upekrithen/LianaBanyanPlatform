/**
 * OVERWORLD HEX GRID
 * ==================
 * Hex grid drawing utilities used by OverworldCanvas.
 *
 * Provides static terrain hex rendering functions that can be called
 * from the canvas render loop. Terrain colors from TERRAIN_COLORS,
 * canal hexes with shimmer animation, pipe station hexes with caps.
 *
 * Note: This is a utility module, not a React component. The actual
 * drawing happens inside OverworldCanvas.tsx's render loop. This module
 * exists as a logical separation point for hex grid rendering logic
 * that may grow more complex with additional terrain features.
 */

import {
  OVERWORLD_HEX_SIZE,
  hexToScreen,
  drawHex,
  getCanalShimmerColor,
  type Viewport,
} from "@/lib/hexOverworldUtils";
import { TERRAIN_COLORS, type TerrainType } from "@/lib/hexIsleWorldData";
import { PIPE_COLORS, type PipeColor } from "@/lib/hexPipePortals";

// ─── Terrain Hex Rendering ──────────────────────────────────────────────────

/**
 * Draw a single terrain hex with appropriate color and styling.
 * Canal hexes get shimmer animation, pipe stations get colored caps.
 */
export function drawTerrainHex(
  ctx: CanvasRenderingContext2D,
  q: number,
  r: number,
  terrain: TerrainType,
  viewport: Viewport,
  time: number,
  pipeColor?: PipeColor,
): void {
  const size = OVERWORLD_HEX_SIZE * viewport.zoom;
  const { x, y } = hexToScreen(q, r, viewport);

  // Skip off-screen hexes
  if (x < -size * 2 || x > viewport.width + size * 2) return;
  if (y < -size * 2 || y > viewport.height + size * 2) return;

  // Fill color
  const fillColor = terrain === "canal"
    ? getCanalShimmerColor(time)
    : (TERRAIN_COLORS as Record<string, string>)[terrain] ?? "#666";

  const strokeColor = terrain === "canal" ? "#2a7090" : undefined;

  drawHex(ctx, x, y, size * 0.85, fillColor, strokeColor, 0.8);

  // Pipe station cap overlay
  if (pipeColor) {
    const capSize = size * 0.35;
    ctx.beginPath();
    ctx.arc(x, y, capSize, 0, Math.PI * 2);
    ctx.fillStyle = PIPE_COLORS[pipeColor];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Draw height indicator via hex border intensity.
 * Higher hexes get lighter borders, lower get darker — creating depth.
 */
export function getHeightBorderColor(height: number): string {
  const brightness = Math.min(255, Math.round(80 + height * 15));
  return `rgb(${brightness}, ${brightness}, ${brightness})`;
}

export default { drawTerrainHex, getHeightBorderColor };
