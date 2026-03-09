/**
 * CITY STRUCTURES
 * ===============
 * Renders floating 3D labels for named buildings within a city
 * when the camera is zoomed in to island level.
 *
 * Uses drei Html for CSS-in-3D labels positioned above each building.
 * Labels show building name, type icon, and accent color.
 * Only visible when cameraMode === "island" and viewing the right island.
 */

import { useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import {
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
  GraduationCap,
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
} from "lucide-react";
import { hexToWorld, type BuildingArchetype, ISLANDS } from "@/lib/hexIsleWorldData";
import { getCityBuildingLabels } from "@/lib/hexCityData";
import { HEIGHT_SCALE } from "@/lib/hexIsleWorldData";
import { CanalRenderer } from "./CanalRenderer";
import { PipePortalRenderer } from "./PipePortalRenderer";
import { PhasePortalRenderer } from "./PhasePortalRenderer";
import {
  VERDANA_PHASE_PORTALS,
  getPhaseOverlay,
} from "@/lib/hexIslePhaseBridge";
import { getCitiesForIsland } from "@/lib/hexCityData";

// ─── Building Icons ──────────────────────────────────────────────────────────

const BUILDING_ICONS: Record<BuildingArchetype, React.ReactNode> = {
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

// ─── Single Building Label ────────────────────────────────────────────────

interface BuildingLabelProps {
  name: string;
  type: string;
  worldX: number;
  worldZ: number;
  labelHeight: number;
  color: string;
  description: string;
}

function BuildingLabel({
  name,
  type,
  worldX,
  worldZ,
  labelHeight,
  color,
  description,
}: BuildingLabelProps) {
  const [hovered, setHovered] = useState(false);
  const handleOver = useCallback(() => setHovered(true), []);
  const handleOut = useCallback(() => setHovered(false), []);

  const icon = BUILDING_ICONS[type as BuildingArchetype] ?? <Building2 className="h-3 w-3" />;

  return (
    <group position={[worldX, labelHeight * HEIGHT_SCALE, worldZ]}>
      <Html
        center
        distanceFactor={30}
        style={{
          pointerEvents: "auto",
          userSelect: "none",
        }}
      >
        <div
          onMouseEnter={handleOver}
          onMouseLeave={handleOut}
          className={`
            transition-all duration-200 cursor-default
            ${hovered ? "scale-110" : "scale-100"}
          `}
        >
          {/* Building label */}
          <div
            className={`
              px-2 py-1 rounded-md text-center whitespace-nowrap
              ${hovered
                ? "bg-white/95 shadow-lg"
                : "bg-black/70 shadow-md"
              }
            `}
            style={{
              borderLeft: `3px solid ${color}`,
            }}
          >
            <div className="flex items-center gap-1">
              <span style={{ color: hovered ? color : "#fff" }}>
                {icon}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  hovered ? "text-slate-900" : "text-white/90"
                }`}
              >
                {name}
              </span>
            </div>

            {/* Description tooltip on hover */}
            {hovered && (
              <p className="text-[9px] text-slate-600 mt-0.5 max-w-[140px] text-left leading-tight">
                {description}
              </p>
            )}
          </div>

          {/* Connector line */}
          <div
            className="w-px h-4 mx-auto"
            style={{ backgroundColor: color, opacity: 0.5 }}
          />
        </div>
      </Html>
    </group>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface CityStructuresProps {
  islandId: number;
}

export function CityStructures({ islandId }: CityStructuresProps) {
  const labels = getCityBuildingLabels(islandId);
  const island = ISLANDS.find(i => i.id === islandId);

  // Island world offset for sub-renderers
  const islandOffset = island
    ? { x: island.worldPosition.x, z: island.worldPosition.z }
    : { x: 0, z: 0 };

  return (
    <group>
      {/* Building labels */}
      {labels.map((label, i) => {
        const { x, z } = hexToWorld(label.q, label.r);
        return (
          <BuildingLabel
            key={`${label.cityName}-${label.name}-${i}`}
            name={label.name}
            type={label.type}
            worldX={x}
            worldZ={z}
            labelHeight={label.labelHeight}
            color={label.color}
            description={label.description}
          />
        );
      })}

      {/* Canal Quarter — water channels, gondolas, dock markers (Harvest Island only) */}
      {islandId === 1 && (
        <CanalRenderer islandOffset={islandOffset} />
      )}

      {/* Pipe Portal warp pipes (all islands with pipe networks) */}
      <PipePortalRenderer
        islandId={islandId}
        islandOffset={islandOffset}
        playerLevel={0}
      />

      {/* Phase MimicTrunk portals (Guild Tower, Hexagon, Keeps) */}
      {islandId === 1 && (
        <PhasePortalRenderer
          overlay={getPhaseOverlay(
            [], // ownedTrunks — populated when PhaseMimicTrunkProvider wraps scene
            VERDANA_PHASE_PORTALS,
            null, // currentPhase
            getCitiesForIsland(1).flatMap(c => c.buildings),
            1,
          )}
          islandId={1}
        />
      )}
    </group>
  );
}

export default CityStructures;
