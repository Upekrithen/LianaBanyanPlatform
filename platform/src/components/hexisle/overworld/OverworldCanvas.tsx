/**
 * OVERWORLD CANVAS
 * ================
 * HTML5 Canvas renderer for the 2D Mario World-style overworld.
 * Performance target: 60fps with hundreds of hexes via viewport culling.
 *
 * Layer order (back to front):
 *   1. Ocean hexes (blue hex grid)
 *   2. Canal channels (teal shimmer hexes)
 *   3. Terrain hexes (colored by TerrainType)
 *   4. Path lines (dotted connections between beacons)
 *   5. Pipe station markers (colored pipe caps)
 *   6. Beacon nodes (numbered circles)
 *   7. Gondola sprites (on canal channels)
 *   8. Horizon islands (dim outlines at edges)
 *   9. Player ghost (glowing "you are here")
 *
 * The canvas viewport follows the player position.
 * Only visible hexes are drawn (viewport culling).
 */

import { useRef, useEffect, useCallback } from "react";
import { useOverworldNavigation } from "@/contexts/OverworldNavigationContext";
import {
  OVERWORLD_HEX_SIZE,
  hexToScreen,
  drawHex,
  lerpViewport,
  viewportTargetForHex,
  getCanalShimmerColor,
  getGhostGlowIntensity,
  type Viewport,
} from "@/lib/hexOverworldUtils";
import {
  getBeaconsForIsland,
  getPathsForIsland,
  type OverworldBeaconPoint,
  type OverworldPath,
} from "@/lib/hexOverworldPaths";
import { TERRAIN_COLORS } from "@/lib/hexIsleWorldData";

// ─── Constants ──────────────────────────────────────────────────────────────

const OCEAN_COLOR = "#1a4a7a";
const OCEAN_HEX_STROKE = "#1e5590";
const BEACON_RADIUS = 10;
const BEACON_ACTIVE_COLOR = "#fbbf24";
const BEACON_COLOR = "#94a3b8";
const PATH_COLOR_LAND = "#8B7355";
const PATH_COLOR_OCEAN = "#3b82f6";
const PATH_COLOR_CANAL = "#3b82a0";
const GHOST_COLOR = "#e0f0ff";
const GHOST_GLOW_COLOR = "#60a5fa";
const PLAYER_RADIUS = 8;

// ─── Ocean Hex Grid ─────────────────────────────────────────────────────────

function drawOceanGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  time: number,
) {
  const size = OVERWORLD_HEX_SIZE * viewport.zoom;
  // Approximate visible range in hex coords
  const rangeQ = Math.ceil(viewport.width / (size * 1.5)) + 2;
  const rangeR = Math.ceil(viewport.height / (size * Math.sqrt(3))) + 2;

  const centerQ = Math.round(
    (viewport.centerX / (size * 1.5)),
  );
  const centerR = Math.round(
    (viewport.centerY / (size * Math.sqrt(3))),
  );

  for (let q = centerQ - rangeQ; q <= centerQ + rangeQ; q++) {
    for (let r = centerR - rangeR; r <= centerR + rangeR; r++) {
      const { x, y } = hexToScreen(q, r, viewport);
      // Skip if off screen
      if (x < -size * 2 || x > viewport.width + size * 2) continue;
      if (y < -size * 2 || y > viewport.height + size * 2) continue;

      drawHex(ctx, x, y, size * 0.85, OCEAN_COLOR, OCEAN_HEX_STROKE, 0.5);
    }
  }
}

// ─── Terrain Hexes ──────────────────────────────────────────────────────────

function drawTerrainHexes(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  paths: OverworldPath[],
  time: number,
) {
  const size = OVERWORLD_HEX_SIZE * viewport.zoom;

  for (const path of paths) {
    for (const hex of path.hexSteps) {
      const { x, y } = hexToScreen(hex.q, hex.r, viewport);
      if (x < -size * 2 || x > viewport.width + size * 2) continue;
      if (y < -size * 2 || y > viewport.height + size * 2) continue;

      const fillColor = hex.terrain === "canal"
        ? getCanalShimmerColor(time)
        : (TERRAIN_COLORS as Record<string, string>)[hex.terrain] ?? "#666";

      const strokeColor = hex.terrain === "canal"
        ? "#2a7090"
        : undefined;

      drawHex(ctx, x, y, size * 0.85, fillColor, strokeColor, 0.8);
    }
  }
}

// ─── Path Lines ─────────────────────────────────────────────────────────────

function drawPathLines(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  beacons: OverworldBeaconPoint[],
  paths: OverworldPath[],
) {
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;

  for (const path of paths) {
    if (path.hexSteps.length < 2) continue;

    const color = path.isOcean
      ? PATH_COLOR_OCEAN
      : path.hexSteps.some(h => h.terrain === "canal")
        ? PATH_COLOR_CANAL
        : PATH_COLOR_LAND;

    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();

    const first = hexToScreen(path.hexSteps[0].q, path.hexSteps[0].r, viewport);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < path.hexSteps.length; i++) {
      const pt = hexToScreen(path.hexSteps[i].q, path.hexSteps[i].r, viewport);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

// ─── Beacon Nodes ───────────────────────────────────────────────────────────

function drawBeacons(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  beacons: OverworldBeaconPoint[],
  currentBeaconId: string | null,
  time: number,
) {
  const size = OVERWORLD_HEX_SIZE * viewport.zoom;

  for (const beacon of beacons) {
    const { x, y } = hexToScreen(
      beacon.hexPosition.q,
      beacon.hexPosition.r,
      viewport,
    );

    if (x < -30 || x > viewport.width + 30) continue;
    if (y < -30 || y > viewport.height + 30) continue;

    const isCurrent = beacon.id === currentBeaconId;
    const radius = BEACON_RADIUS * viewport.zoom;

    // Pulse animation for current beacon
    const pulseScale = isCurrent
      ? 1.0 + Math.sin(time * 0.004) * 0.15
      : 1.0;

    // Outer glow for current
    if (isCurrent) {
      ctx.beginPath();
      ctx.arc(x, y, radius * pulseScale * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, 0.15)`;
      ctx.fill();
    }

    // Circle
    ctx.beginPath();
    ctx.arc(x, y, radius * pulseScale, 0, Math.PI * 2);
    ctx.fillStyle = isCurrent ? BEACON_ACTIVE_COLOR : BEACON_COLOR;
    ctx.fill();
    ctx.strokeStyle = isCurrent ? "#f59e0b" : "#64748b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Number
    ctx.fillStyle = isCurrent ? "#1a1a1a" : "#fff";
    ctx.font = `bold ${Math.round(9 * viewport.zoom)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(beacon.beaconNumber), x, y);

    // Name label below
    ctx.fillStyle = isCurrent ? "#fbbf24" : "#94a3b8";
    ctx.font = `${Math.round(7 * viewport.zoom)}px sans-serif`;
    ctx.fillText(beacon.name, x, y + radius * pulseScale + 8 * viewport.zoom);

    // Pipe station indicator
    if (beacon.hasPipeStation) {
      const pipeY = y - radius * pulseScale - 6 * viewport.zoom;
      ctx.fillStyle = "#22c55e";
      ctx.font = `bold ${Math.round(8 * viewport.zoom)}px sans-serif`;
      ctx.fillText("P", x, pipeY);
    }
  }
}

// ─── Player Ghost ───────────────────────────────────────────────────────────

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  playerQ: number,
  playerR: number,
  time: number,
) {
  const { x, y } = hexToScreen(playerQ, playerR, viewport);
  const glowIntensity = getGhostGlowIntensity(time);
  const r = PLAYER_RADIUS * viewport.zoom;

  // Glow aura
  const gradient = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 3);
  gradient.addColorStop(0, `rgba(96, 165, 250, ${0.4 * glowIntensity})`);
  gradient.addColorStop(0.5, `rgba(96, 165, 250, ${0.15 * glowIntensity})`);
  gradient.addColorStop(1, "rgba(96, 165, 250, 0)");
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Ghost body (simple teardrop shape)
  ctx.beginPath();
  ctx.arc(x, y - r * 0.2, r * 0.7, Math.PI, 0); // top dome
  // Wavy bottom
  ctx.quadraticCurveTo(x + r * 0.7, y + r * 0.5, x + r * 0.3, y + r * 0.8);
  ctx.quadraticCurveTo(x, y + r * 0.5, x - r * 0.3, y + r * 0.8);
  ctx.quadraticCurveTo(x - r * 0.7, y + r * 0.5, x - r * 0.7, y - r * 0.2);
  ctx.fillStyle = GHOST_COLOR;
  ctx.fill();
  ctx.strokeStyle = GHOST_GLOW_COLOR;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  const eyeY = y - r * 0.15;
  const eyeSpacing = r * 0.25;
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.arc(x - eyeSpacing, eyeY, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + eyeSpacing, eyeY, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function OverworldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const {
    playerPosition,
    currentBeaconId,
    currentIslandId,
    viewport,
    setViewport,
  } = useOverworldNavigation();

  const beacons = getBeaconsForIsland(currentIslandId);
  const paths = getPathsForIsland(currentIslandId);

  // Animation loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();

    // Update viewport to follow player
    const target = viewportTargetForHex(
      playerPosition.q,
      playerPosition.r,
      viewport,
    );
    const newViewport = lerpViewport(viewport, target.centerX, target.centerY);
    // Only update if viewport has moved meaningfully
    if (
      Math.abs(newViewport.centerX - viewport.centerX) > 0.01 ||
      Math.abs(newViewport.centerY - viewport.centerY) > 0.01
    ) {
      setViewport(newViewport);
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw layers
    drawOceanGrid(ctx, viewport, now);
    drawTerrainHexes(ctx, viewport, paths, now);
    drawPathLines(ctx, viewport, beacons, paths);
    drawBeacons(ctx, viewport, beacons, currentBeaconId, now);
    drawPlayer(ctx, viewport, playerPosition.q, playerPosition.r, now);

    animFrameRef.current = requestAnimationFrame(render);
  }, [viewport, playerPosition, currentBeaconId, beacons, paths, setViewport]);

  // Canvas setup + resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      setViewport(prev => ({
        ...prev,
        width: rect.width,
        height: rect.height,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [setViewport]);

  // Start animation loop
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
}

export default OverworldCanvas;
