/**
 * OVERWORLD MINIMAP
 * =================
 * Corner minimap showing player position relative to the island chain.
 * Pipe line colors overlaid, bright dot for current position.
 *
 * Renders a small canvas in the top-right showing:
 *   - Island outlines as colored dots
 *   - Current island highlighted
 *   - Player position as a bright pulsing dot
 *   - Pipe line color traces (future)
 */

import { useRef, useEffect } from "react";
import { ISLANDS } from "@/lib/hexIsleWorldData";
import { useOverworldNavigation } from "@/contexts/OverworldNavigationContext";

// ─── Constants ──────────────────────────────────────────────────────────────

const MINIMAP_WIDTH = 80;
const MINIMAP_HEIGHT = 160;
const DOT_RADIUS = 4;
const PLAYER_DOT_RADIUS = 3;

// ─── Component ──────────────────────────────────────────────────────────────

export function OverworldMinimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentIslandId } = useOverworldNavigation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = MINIMAP_WIDTH * dpr;
    canvas.height = MINIMAP_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.roundRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT, 8);
    ctx.fill();

    // Islands are arranged south-to-north in the chain
    // Map island positions to minimap space
    const sortedIslands = [...ISLANDS]
      .filter(i => i.id !== 6) // Exclude hidden island
      .sort((a, b) => b.worldPosition.z - a.worldPosition.z); // south first

    const yStep = (MINIMAP_HEIGHT - 30) / Math.max(sortedIslands.length - 1, 1);

    sortedIslands.forEach((island, i) => {
      const x = MINIMAP_WIDTH / 2 + (island.worldPosition.x - 8) * 0.8;
      const y = 15 + i * yStep;

      const isCurrent = island.id === currentIslandId;

      // Glow for current island
      if (isCurrent) {
        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `${island.colorAccent}33`;
        ctx.fill();
      }

      // Island dot
      ctx.beginPath();
      ctx.arc(x, y, isCurrent ? DOT_RADIUS * 1.3 : DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = isCurrent ? island.colorAccent : `${island.colorAccent}88`;
      ctx.fill();

      // Island number
      ctx.fillStyle = isCurrent ? "#fff" : "#ffffff66";
      ctx.font = `${isCurrent ? "bold " : ""}7px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(island.id), x, y);
    });
  }, [currentIslandId]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-16 right-4 pointer-events-none opacity-70"
      style={{
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
      }}
    />
  );
}

export default OverworldMinimap;
