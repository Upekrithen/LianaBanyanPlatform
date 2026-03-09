/**
 * WORLD NAVIGATION CONTEXT
 * ========================
 * Manages camera state and navigation for the HexIsle 3D world.
 * Consumed by both 3D scene components and 2D HUD overlays.
 *
 * Three zoom levels:
 *   - Archipelago: full south-to-north chain overview
 *   - Island: zoomed to one island, hex terrain visible
 *   - City: zoomed to city structures, building labels visible
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  ISLANDS,
  type IslandDef,
  type CityDef,
  type ViewPhase,
  hexToWorld,
  HEIGHT_SCALE,
} from "@/lib/hexIsleWorldData";
import { getCitiesForIsland } from "@/lib/hexCityData";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CameraMode = "archipelago" | "island" | "city";

export interface WorldNavState {
  cameraMode: CameraMode;
  viewPhase: ViewPhase;
  activeIslandId: number | null;
  activeIsland: IslandDef | null;
  activeCityId: string | null;
  activeCity: CityDef | null;
  targetPosition: { x: number; y: number; z: number } | null;
  isTransitioning: boolean;
}

export interface WorldNavActions {
  flyToIsland: (islandId: number) => void;
  flyToCity: (islandId: number, cityId: string) => void;
  goToArchipelago: () => void;
  goToIsland: () => void;   // Back up from city → island view
  setTransitioning: (v: boolean) => void;
  setViewPhase: (phase: ViewPhase) => void;
  /** Translate a hex position on an island to 3D world coordinates */
  hexToWorldPosition: (islandId: number, q: number, r: number) => { x: number; y: number; z: number } | null;
}

type WorldNavContextType = WorldNavState & WorldNavActions;

// ─── Context ────────────────────────────────────────────────────────────────

const WorldNavigationContext = createContext<WorldNavContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function WorldNavigationProvider({ children }: { children: ReactNode }) {
  const [cameraMode, setCameraMode] = useState<CameraMode>("archipelago");
  const [viewPhase, setViewPhase] = useState<ViewPhase>("world3d");
  const [activeIslandId, setActiveIslandId] = useState<number | null>(null);
  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [isTransitioning, setTransitioning] = useState(false);

  const activeIsland = activeIslandId
    ? ISLANDS.find(i => i.id === activeIslandId) ?? null
    : null;

  const activeCity = (activeIslandId && activeCityId)
    ? getCitiesForIsland(activeIslandId).find(c => c.id === activeCityId) ?? null
    : null;

  const flyToIsland = useCallback((islandId: number) => {
    const island = ISLANDS.find(i => i.id === islandId);
    if (!island) return;

    setActiveIslandId(islandId);
    setActiveCityId(null);
    setCameraMode("island");
    setTargetPosition({
      x: island.worldPosition.x,
      y: 15,
      z: island.worldPosition.z + 12,
    });
    setTransitioning(true);
  }, []);

  const flyToCity = useCallback((islandId: number, cityId: string) => {
    const island = ISLANDS.find(i => i.id === islandId);
    if (!island) return;

    const cities = getCitiesForIsland(islandId);
    const city = cities.find(c => c.id === cityId);
    if (!city) return;

    // Find the city center by averaging building label positions
    let centerX = 0, centerZ = 0, count = 0;
    for (const building of city.buildings) {
      const { x, z } = hexToWorld(building.labelQ, building.labelR);
      centerX += x;
      centerZ += z;
      count++;
    }
    if (count > 0) {
      centerX /= count;
      centerZ /= count;
    }

    setActiveIslandId(islandId);
    setActiveCityId(cityId);
    setCameraMode("city");
    setTargetPosition({
      x: island.worldPosition.x + centerX,
      y: 8,
      z: island.worldPosition.z + centerZ + 8,
    });
    setTransitioning(true);
  }, []);

  const goToIsland = useCallback(() => {
    if (!activeIslandId) return;
    setActiveCityId(null);
    flyToIsland(activeIslandId);
  }, [activeIslandId, flyToIsland]);

  const goToArchipelago = useCallback(() => {
    setActiveIslandId(null);
    setActiveCityId(null);
    setCameraMode("archipelago");
    setTargetPosition({ x: 8, y: 80, z: 40 });
    setTransitioning(true);
  }, []);

  /**
   * Cross-phase coordinate translation:
   * Given a hex (q, r) on an island, return the absolute 3D world position.
   * Used when switching from 2D overworld → 3D world to preserve player location.
   */
  const hexToWorldPosition = useCallback((islandId: number, q: number, r: number) => {
    const island = ISLANDS.find(i => i.id === islandId);
    if (!island) return null;

    const local = hexToWorld(q, r);
    return {
      x: island.worldPosition.x + local.x,
      y: 2, // ground level for player placement
      z: island.worldPosition.z + local.z,
    };
  }, []);

  return (
    <WorldNavigationContext.Provider
      value={{
        cameraMode,
        viewPhase,
        activeIslandId,
        activeIsland,
        activeCityId,
        activeCity,
        targetPosition,
        isTransitioning,
        flyToIsland,
        flyToCity,
        goToArchipelago,
        goToIsland,
        setTransitioning,
        setViewPhase,
        hexToWorldPosition,
      }}
    >
      {children}
    </WorldNavigationContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useWorldNavigation(): WorldNavContextType {
  const ctx = useContext(WorldNavigationContext);
  if (!ctx) throw new Error("useWorldNavigation must be used within WorldNavigationProvider");
  return ctx;
}
