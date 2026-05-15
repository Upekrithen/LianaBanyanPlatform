/**
 * DUAL MODE TOGGLE
 * ================
 * Top-right corner toggle between Mode A and Mode B.
 *
 * Mode A — Cooperative-Substrate State Visualization
 *   Agents + canon flow + pheromone trails visible.
 *   Bishop/Knight/Pawn/Rook substrate-cells at canonical positions.
 *   New canon Eblets ripple as visual events on Bedrock-cell layer.
 *
 * Mode B — Governance Interactions
 *   Member voting + Crown-letter dispatches + The 300 governance markers.
 *   Patent-Pledge member hexes distinguished.
 *   Tatiana Schlossburg-class tribute cells.
 *
 * Canon: BP037 Refinement 3 — "Mode toggle: top-right corner; subtle; doesn't dominate visual."
 */

import { Network, Vote } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type OperationalMode = "substrate" | "governance";

// ─── Component ───────────────────────────────────────────────────────────────

interface DualModeToggleProps {
  mode: OperationalMode;
  onToggle: (mode: OperationalMode) => void;
}

export function DualModeToggle({ mode, onToggle }: DualModeToggleProps) {
  const isSubstrate = mode === "substrate";

  return (
    <div className="fixed top-4 right-4 z-30">
      <div className="flex items-center bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg gap-1">
        {/* Mode A */}
        <button
          onClick={() => onToggle("substrate")}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            transition-all duration-250
            ${isSubstrate
              ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
              : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
            }
          `}
          title="Mode A — Cooperative Substrate State Visualization"
        >
          <Network className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mode A</span>
          <span className="sm:hidden">A</span>
        </button>

        {/* Mode B */}
        <button
          onClick={() => onToggle("governance")}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            transition-all duration-250
            ${!isSubstrate
              ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
              : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
            }
          `}
          title="Mode B — Governance Interactions"
        >
          <Vote className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Mode B</span>
          <span className="sm:hidden">B</span>
        </button>
      </div>

      {/* Mode description label */}
      <div className="mt-1.5 text-right">
        <p className="text-[9px] text-white/30 uppercase tracking-wider">
          {isSubstrate ? "Substrate State" : "Governance"}
        </p>
      </div>
    </div>
  );
}
