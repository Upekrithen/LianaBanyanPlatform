/**
 * WORLD HUD
 * =========
 * 2D shadcn/ui overlay positioned over the 3D Canvas.
 * Shows: island info, navigation, building list, minimap, view toggle.
 *
 * Three modes:
 *   - Archipelago: island quick-nav bar at bottom
 *   - Island: island info card + city buildings panel
 *   - City: focused building info + back to island
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Map,
  ChevronLeft,
  Compass,
  Mountain,
  Waves,
  Swords,
  Search,
  Sparkles,
  GraduationCap,
  Building2,
  Landmark,
  Anchor,
  ShieldCheck,
  Castle,
  Store,
  Columns,
  Droplets,
  TowerControl,
  Beer,
  Palette,
  UtensilsCrossed,
  Hammer,
  Sprout,
  Fence,
  Gem,
  Users,
  Music,
  Pipette,
  Ship,
  Bed,
  Home,
  Train,
  Ticket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorldNavigation } from "@/contexts/WorldNavigationContext";
import { ISLANDS, type BuildingArchetype } from "@/lib/hexIsleWorldData";
import { getCitiesForIsland } from "@/lib/hexCityData";
import { generatePipeNetwork, PIPE_COLORS, GLYPH_SYMBOLS } from "@/lib/hexPipePortals";
import { generateCanalDistrict } from "@/lib/hexCanalDistrict";

// ─── Island Icons ───────────────────────────────────────────────────────────

const ISLAND_ICONS: Record<number, React.ReactNode> = {
  1: <Mountain className="h-3.5 w-3.5" />,
  2: <Compass className="h-3.5 w-3.5" />,
  3: <Waves className="h-3.5 w-3.5" />,
  4: <Swords className="h-3.5 w-3.5" />,
  5: <Search className="h-3.5 w-3.5" />,
  6: <Sparkles className="h-3.5 w-3.5" />,
  7: <GraduationCap className="h-3.5 w-3.5" />,
};

// ─── Building Type Icons ───────────────────────────────────────────────────

const BUILDING_TYPE_ICONS: Record<BuildingArchetype, React.ReactNode> = {
  hexagon:      <Landmark className="h-3 w-3" />,
  hall:         <Columns className="h-3 w-3" />,
  harbor:       <Anchor className="h-3 w-3" />,
  keep:         <ShieldCheck className="h-3 w-3" />,
  guild_tower:  <Castle className="h-3 w-3" />,
  market:       <Store className="h-3 w-3" />,
  garden:       <Building2 className="h-3 w-3" />,
  gate:         <Building2 className="h-3 w-3" />,
  well:         <Droplets className="h-3 w-3" />,
  workshop:     <Building2 className="h-3 w-3" />,
  tower:        <TowerControl className="h-3 w-3" />,
  tavern:       <Beer className="h-3 w-3" />,
  gallery:      <Palette className="h-3 w-3" />,
  canteen:      <UtensilsCrossed className="h-3 w-3" />,
  academy:      <GraduationCap className="h-3 w-3" />,
  forge:        <Hammer className="h-3 w-3" />,
  garden_plot:  <Sprout className="h-3 w-3" />,
  rampart:      <Fence className="h-3 w-3" />,
  artisan_shop: <Gem className="h-3 w-3" />,
  commons:      <Users className="h-3 w-3" />,
  canal_venue:  <Music className="h-3 w-3" />,
  pipe_station: <Pipette className="h-3 w-3" />,
  gondola_dock: <Ship className="h-3 w-3" />,
  storefront:   <Store className="h-3 w-3" />,
  inn:          <Bed className="h-3 w-3" />,
  rental_plot:  <Home className="h-3 w-3" />,
};

// ─── Component ──────────────────────────────────────────────────────────────

export function WorldHUD() {
  const navigate = useNavigate();
  const {
    cameraMode,
    activeIsland,
    activeIslandId,
    activeCity,
    flyToIsland,
    flyToCity,
    goToArchipelago,
    goToIsland,
  } = useWorldNavigation();

  // Overlay toggle state
  const [showPipeMap, setShowPipeMap] = useState(false);
  const [showCanalVenues, setShowCanalVenues] = useState(false);

  // Get cities for the active island
  const cities = activeIslandId ? getCitiesForIsland(activeIslandId) : [];
  const hasCities = cities.length > 0;

  // Pipe network and canal data (only for Harvest Island / city view)
  const pipeNetwork = activeIslandId ? generatePipeNetwork(activeIslandId) : null;
  const hasPipeStations = pipeNetwork && pipeNetwork.stations.length > 0;
  const canalDistrict = activeIslandId === 1 ? generateCanalDistrict() : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-auto">
        {/* Left: Title + Navigation */}
        <div className="flex items-center gap-2">
          {/* Back button: city→island, island→archipelago */}
          {cameraMode === "city" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToIsland}
              className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Island
            </Button>
          )}
          {cameraMode === "island" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToArchipelago}
              className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Archipelago
            </Button>
          )}

          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <h1 className="text-white font-bold text-sm">
              {cameraMode === "archipelago"
                ? "HexIsle Archipelago"
                : cameraMode === "city" && activeCity
                  ? `${activeCity.name} — ${activeCity.subtitle}`
                  : `${activeIsland?.id}. ${activeIsland?.name}`
              }
            </h1>
            {cameraMode === "city" && activeIsland && (
              <p className="text-white/60 text-xs mt-0.5">
                {activeIsland.name} Island
              </p>
            )}
            {cameraMode === "island" && activeIsland && (
              <p className="text-white/60 text-xs mt-0.5">
                {activeIsland.theme} — {activeIsland.businessSkill}
              </p>
            )}
          </div>
        </div>

        {/* Right: View Toggle + Overlay Toggles */}
        <div className="flex items-center gap-2">
          {/* Pipe Map toggle (when island has pipe stations) */}
          {hasPipeStations && cameraMode !== "archipelago" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPipeMap(!showPipeMap)}
              className={`backdrop-blur-sm ${
                showPipeMap
                  ? "bg-green-600/70 text-white hover:bg-green-600/90"
                  : "bg-black/50 text-white hover:bg-black/70"
              }`}
            >
              <Train className="h-4 w-4 mr-1" />
              Pipes
            </Button>
          )}

          {/* Canal Venues toggle (Harvest Island only) */}
          {canalDistrict && cameraMode !== "archipelago" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCanalVenues(!showCanalVenues)}
              className={`backdrop-blur-sm ${
                showCanalVenues
                  ? "bg-cyan-600/70 text-white hover:bg-cyan-600/90"
                  : "bg-black/50 text-white hover:bg-black/70"
              }`}
            >
              <Ticket className="h-4 w-4 mr-1" />
              Canal
            </Button>
          )}

          {/* View toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/hexisle/world-map")}
            className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
          >
            <Map className="h-4 w-4 mr-1" />
            2D Map
          </Button>
        </div>
      </div>

      {/* Pipe Portal Subway Map Overlay */}
      {showPipeMap && pipeNetwork && (
        <div className="absolute top-16 right-4 pointer-events-auto w-64">
          <Card className="bg-black/80 backdrop-blur-sm border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Train className="h-3 w-3" />
                  Pipe Portal Lines
                </p>
                <button
                  onClick={() => setShowPipeMap(false)}
                  className="text-white/40 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {pipeNetwork.lines.map(line => (
                  <div key={line.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                        style={{ backgroundColor: PIPE_COLORS[line.color] }}
                      >
                        {GLYPH_SYMBOLS[line.glyph]}
                      </span>
                      <span className="text-white/90 text-[11px] font-medium">
                        {line.name}
                      </span>
                      {line.unlockLevel > 0 && (
                        <Badge variant="outline" className="text-[8px] text-white/50 border-white/20 py-0">
                          Lv.{line.unlockLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="ml-5 flex flex-wrap gap-1">
                      {line.stations.map(stationId => {
                        const station = pipeNetwork.stations.find(s => s.id === stationId);
                        return station ? (
                          <span
                            key={stationId}
                            className="text-[9px] text-white/60 bg-white/5 px-1.5 py-0.5 rounded"
                          >
                            {station.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {pipeNetwork.transferStations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-white/40 text-[9px]">
                    Transfer stations:{" "}
                    {pipeNetwork.transferStations.map(id => {
                      const s = pipeNetwork.stations.find(st => st.id === id);
                      return s?.name;
                    }).filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Canal Quarter Venue List Overlay */}
      {showCanalVenues && canalDistrict && (
        <div className="absolute top-16 right-4 pointer-events-auto w-64">
          <Card className="bg-black/80 backdrop-blur-sm border-white/10">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  Canal Quarter Venues
                </p>
                <button
                  onClick={() => setShowCanalVenues(false)}
                  className="text-white/40 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>
              <div className="space-y-1.5">
                {canalDistrict.venues.map(venue => (
                  <div key={venue.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Music className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                      <span className="text-white/90 text-[11px] truncate">
                        {venue.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {venue.accessModes.includes("gondola_only") && (
                        <Badge variant="outline" className="text-[8px] text-cyan-400/80 border-cyan-400/30 py-0">
                          Gondola
                        </Badge>
                      )}
                      <Badge className="text-[8px] bg-amber-600/70 hover:bg-amber-600/70 py-0">
                        {venue.entranceFee}C
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px]">All-Access Pass</span>
                  <Badge className="text-[9px] bg-purple-600/70 hover:bg-purple-600/70">
                    {canalDistrict.allAccessPass.cost}C / {canalDistrict.allAccessPass.durationHours}h
                  </Badge>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-white/30 text-[9px]">
                  {canalDistrict.network.docks.length} gondola docks
                  {" "}&bull;{" "}
                  {canalDistrict.venues.filter(v => v.hasGoldenKeys).length} golden key paths
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Island Info Panel (when zoomed to island) */}
      {activeIsland && (cameraMode === "island" || cameraMode === "city") && (
        <div className="absolute bottom-20 left-4 pointer-events-auto max-w-xs">
          <Card className="bg-black/70 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: activeIsland.colorAccent }}
                >
                  {ISLAND_ICONS[activeIsland.id]}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">
                    {activeIsland.loreTitle}
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-white/60 border-white/20">
                    {activeIsland.theme}
                  </Badge>
                </div>
              </div>
              <p className="text-white/70 text-xs italic leading-relaxed">
                {activeIsland.loreBlurb}
              </p>

              {/* City buildings list */}
              {hasCities && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-2">
                    Structures in {cities[0].name}
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {cities[0].buildings.map((building) => (
                      <button
                        key={`${cities[0].id}-${building.name}`}
                        onClick={() => flyToCity(activeIsland.id, cities[0].id)}
                        className="w-full flex items-center gap-2 px-2 py-1 text-left rounded hover:bg-white/10 transition-colors group"
                      >
                        <span
                          className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: building.color }}
                        />
                        <span className="text-white/80 group-hover:text-white text-[11px] flex items-center gap-1">
                          {BUILDING_TYPE_ICONS[building.type]}
                          {building.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom: Island Quick Nav (archipelago mode) */}
      {cameraMode === "archipelago" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg p-1.5">
            {ISLANDS.filter(i => i.id !== 6).map((island) => (
              <button
                key={island.id}
                onClick={() => flyToIsland(island.id)}
                className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5"
                title={`${island.name} — ${island.theme}`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: island.colorAccent }}
                />
                {island.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <p className="text-white/30 text-[10px]">
          {cameraMode === "archipelago"
            ? "Click island to explore • Scroll to zoom • Drag to orbit"
            : "Click building labels for details • Scroll to zoom • Drag to orbit"
          }
        </p>
      </div>
    </div>
  );
}

export default WorldHUD;
