/**
 * OVERWORLD PIPE TRANSIT
 * ======================
 * Full-screen animation when the player enters a pipe portal.
 * Shows pipe color fill, whoosh effect, glyph symbol, and destination info.
 *
 * Animation sequence:
 *   1. Pipe color fills screen from center (0-30%)
 *   2. Glyph symbol appears with line name (30-60%)
 *   3. Destination station name fades in (60-80%)
 *   4. Color drains to reveal destination (80-100%)
 */

import { useEffect, useState } from "react";
import { usePipePortal } from "@/contexts/PipePortalContext";
import { PIPE_COLORS, GLYPH_SYMBOLS } from "@/lib/hexPipePortals";

// ─── Component ──────────────────────────────────────────────────────────────

export function OverworldPipeTransit() {
  const {
    isTransiting,
    transitProgress,
    transitFromStation,
    transitToStation,
    activeLine,
  } = usePipePortal();

  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    if (!isTransiting) {
      setAnimPhase(0);
      return;
    }

    // Map transitProgress (0-1) to animation phase
    if (transitProgress < 0.3) setAnimPhase(1); // fill
    else if (transitProgress < 0.6) setAnimPhase(2); // glyph
    else if (transitProgress < 0.8) setAnimPhase(3); // destination
    else setAnimPhase(4); // drain
  }, [isTransiting, transitProgress]);

  if (!isTransiting || !activeLine) return null;

  const lineColor = PIPE_COLORS[activeLine.color];
  const glyphSymbol = GLYPH_SYMBOLS[activeLine.glyph];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: animPhase >= 1 && animPhase <= 3
          ? lineColor
          : "transparent",
        opacity: animPhase === 4 ? 1 - (transitProgress - 0.8) * 5 : 1,
        transition: "background-color 0.3s, opacity 0.2s",
      }}
    >
      {/* Glyph symbol */}
      {animPhase >= 2 && (
        <div className="text-center">
          <div
            className="text-6xl font-bold mb-4 animate-pulse"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {glyphSymbol}
          </div>
          <p className="text-white/80 text-sm font-medium mb-6">
            {activeLine.name}
          </p>

          {/* Destination info */}
          {animPhase >= 3 && transitToStation && (
            <div className="animate-fadeIn">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                Arriving at
              </p>
              <p className="text-white font-bold text-lg">
                {transitToStation.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress bar at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/70 rounded-full transition-all duration-100"
          style={{ width: `${transitProgress * 100}%` }}
        />
      </div>
    </div>
  );
}

export default OverworldPipeTransit;
