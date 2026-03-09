/**
 * OVERWORLD HUD
 * =============
 * 2D overlay for the overworld canvas showing:
 *   - Current beacon name, number, district
 *   - Forward/backward controls along path
 *   - Distance to next beacon (hex count)
 *   - Vessel selector at harbors
 *   - Pipe Portal line indicator (if at station)
 *   - Canal Quarter venue list (if in canal area)
 *   - All-Access Pass status
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ship,
  Train,
  Footprints,
} from "lucide-react";
import { useOverworldNavigation } from "@/contexts/OverworldNavigationContext";
import {
  getBeaconsForIsland,
  getAdjacentBeacons,
  VESSEL_SPEEDS,
  type VesselType,
} from "@/lib/hexOverworldPaths";

// ─── Vessel Icons & Labels ──────────────────────────────────────────────────

const VESSEL_LABELS: Record<VesselType, string> = {
  foot: "On Foot",
  rowboat: "Rowboat",
  raft: "Raft",
  small_ship: "Small Ship",
  medium_ship: "Medium Ship",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function OverworldHUD() {
  const {
    currentBeaconId,
    currentIslandId,
    currentVessel,
    isMoving,
    moveToBeacon,
    setVessel,
  } = useOverworldNavigation();

  const beacons = getBeaconsForIsland(currentIslandId);
  const currentBeacon = beacons.find(b => b.id === currentBeaconId);
  const adjacent = currentBeaconId
    ? getAdjacentBeacons(currentBeaconId, currentIslandId)
    : [];

  // Split adjacent into "back" and "forward" by beacon number
  const currentNum = currentBeacon?.beaconNumber ?? 0;
  const backBeacon = adjacent.find(b => b.beaconNumber < currentNum);
  const forwardBeacon = adjacent.find(b => b.beaconNumber > currentNum);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top: Current Location */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <Card className="bg-black/70 backdrop-blur-sm border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <div>
                <h2 className="text-white font-bold text-sm">
                  {currentBeacon
                    ? `#${currentBeacon.beaconNumber} ${currentBeacon.name}`
                    : "Unknown Location"
                  }
                </h2>
                {currentBeacon?.description && (
                  <p className="text-white/50 text-[10px] mt-0.5 max-w-[200px]">
                    {currentBeacon.description}
                  </p>
                )}
              </div>
            </div>

            {/* Pipe station indicator */}
            {currentBeacon?.hasPipeStation && (
              <div className="mt-2 flex items-center gap-1.5">
                <Train className="h-3 w-3 text-green-400" />
                <span className="text-green-400 text-[10px]">Pipe Station Available</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Right: Vessel Display */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <Card className="bg-black/70 backdrop-blur-sm border-white/10">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              {currentVessel === "foot" ? (
                <Footprints className="h-3.5 w-3.5 text-amber-300" />
              ) : (
                <Ship className="h-3.5 w-3.5 text-cyan-300" />
              )}
              <span className="text-white/80 text-xs">
                {VESSEL_LABELS[currentVessel]}
              </span>
              <Badge variant="outline" className="text-[9px] text-white/50 border-white/20 py-0">
                Speed {VESSEL_SPEEDS[currentVessel]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Center: Navigation Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={!backBeacon || isMoving}
            onClick={() => backBeacon && moveToBeacon(backBeacon.id)}
            className="text-white hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {backBeacon ? `#${backBeacon.beaconNumber}` : "—"}
          </Button>

          {/* Current position indicator */}
          <div className="text-center min-w-[60px]">
            <span className="text-amber-400 font-bold text-sm">
              {currentBeacon ? `#${currentBeacon.beaconNumber}` : "—"}
            </span>
            <span className="text-white/40 text-xs block">
              of {beacons.length}
            </span>
          </div>

          {/* Forward button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={!forwardBeacon || isMoving}
            onClick={() => forwardBeacon && moveToBeacon(forwardBeacon.id)}
            className="text-white hover:bg-white/10 disabled:opacity-30"
          >
            {forwardBeacon ? `#${forwardBeacon.beaconNumber}` : "—"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Bottom Left: Movement hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <p className="text-white/25 text-[10px]">
          {isMoving ? "Moving..." : "Use arrows to travel between beacons"}
        </p>
      </div>

      {/* Bottom Right: Island info */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <p className="text-white/25 text-[10px]">
          Harvest Island • 2D Overworld
        </p>
      </div>
    </div>
  );
}

export default OverworldHUD;
