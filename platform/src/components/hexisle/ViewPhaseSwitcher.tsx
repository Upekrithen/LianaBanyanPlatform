/**
 * VIEW PHASE SWITCHER
 * ===================
 * Google Maps-style floating pill for switching between the three
 * HexIsle view representations:
 *
 *   [ Portal View ] [ 2D Map ] [ 3D World ]
 *
 * Positioned at bottom-right, semi-transparent backdrop.
 * Preserves player location across switches via routing.
 *
 * The three views are the same world seen through different lenses —
 * the Split Infinity metaphor (Proton/Phaze).
 *
 * Routes:
 *   /hexisle           → Portal View (island cards)
 *   /hexisle/overworld  → 2D Overworld Map
 *   /hexisle/world-3d   → 3D World (R3F scene)
 */

import { useNavigate, useLocation } from "react-router-dom";
import { Map, Globe, Layers } from "lucide-react";
import type { ViewPhase } from "@/lib/hexIsleWorldData";

// ─── Route Mapping ──────────────────────────────────────────────────────────

const PHASE_ROUTES: Record<ViewPhase, string> = {
  portals: "/hexisle",
  overworld: "/hexisle/overworld",
  world3d: "/hexisle/world-3d",
};

const ROUTE_TO_PHASE: Record<string, ViewPhase> = {
  "/hexisle": "portals",
  "/hexisle/overworld": "overworld",
  "/hexisle/world-3d": "world3d",
};

// ─── Phase Display Config ───────────────────────────────────────────────────

const PHASE_CONFIG: Record<
  ViewPhase,
  { label: string; icon: React.ReactNode; shortLabel: string }
> = {
  portals: {
    label: "Portal View",
    shortLabel: "Portals",
    icon: <Layers className="h-3.5 w-3.5" />,
  },
  overworld: {
    label: "2D Map",
    shortLabel: "2D",
    icon: <Map className="h-3.5 w-3.5" />,
  },
  world3d: {
    label: "3D World",
    shortLabel: "3D",
    icon: <Globe className="h-3.5 w-3.5" />,
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ViewPhaseSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current phase from URL
  const currentPhase: ViewPhase =
    ROUTE_TO_PHASE[location.pathname] ?? "portals";

  const phases: ViewPhase[] = ["portals", "overworld", "world3d"];

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
      <div className="flex items-center bg-black/60 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/10">
        {phases.map((phase) => {
          const config = PHASE_CONFIG[phase];
          const isActive = phase === currentPhase;

          return (
            <button
              key={phase}
              onClick={() => {
                if (!isActive) {
                  navigate(PHASE_ROUTES[phase]);
                }
              }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200
                ${isActive
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }
              `}
              title={config.label}
            >
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
              <span className="sm:hidden">{config.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ViewPhaseSwitcher;
