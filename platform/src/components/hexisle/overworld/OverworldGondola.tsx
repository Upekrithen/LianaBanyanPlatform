/**
 * OVERWORLD GONDOLA
 * =================
 * Gondola boat sprite rendered on the 2D overworld canvas.
 * Draws gondola indicators at canal docks and shows fare info.
 *
 * This is a HUD overlay component (not drawn on canvas) that shows
 * gondola dock information when the player is in the canal quarter.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ship } from "lucide-react";
import { useCanalAccess } from "@/contexts/CanalAccessContext";
import { useOverworldNavigation } from "@/contexts/OverworldNavigationContext";

// ─── Component ──────────────────────────────────────────────────────────────

export function OverworldGondola() {
  const { currentBeaconId } = useOverworldNavigation();
  const {
    isOnGondola,
    activePass,
    isPassActive,
    boardGondola,
    exitGondola,
    venues,
  } = useCanalAccess();

  // Only show when player is at a canal quarter beacon
  const isCanalArea =
    currentBeaconId === "harvest-6" || currentBeaconId === "harvest-7";

  if (!isCanalArea) return null;

  return (
    <div className="absolute bottom-24 right-4 pointer-events-auto w-56">
      <Card className="bg-black/70 backdrop-blur-sm border-cyan-500/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Ship className="h-4 w-4 text-cyan-400" />
            <span className="text-white font-bold text-xs">Canal Quarter</span>
            {isPassActive() && (
              <Badge className="text-[8px] bg-purple-600/70 hover:bg-purple-600/70 py-0 ml-auto">
                Pass Active
              </Badge>
            )}
          </div>

          {isOnGondola ? (
            <div className="space-y-2">
              <p className="text-cyan-300 text-[11px]">
                Riding the gondola through the canals...
              </p>
              <button
                onClick={exitGondola}
                className="w-full text-xs bg-cyan-600/40 hover:bg-cyan-600/60 text-white py-1 rounded transition-colors"
              >
                Disembark
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-white/50 text-[10px]">
                {venues.length} venues along the canals
              </p>
              {!isPassActive() && (
                <p className="text-amber-400/70 text-[9px]">
                  All-Access Pass: 9 Credits / 24h
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default OverworldGondola;
