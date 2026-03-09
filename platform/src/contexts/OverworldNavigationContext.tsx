/**
 * OVERWORLD NAVIGATION CONTEXT
 * ============================
 * Manages player position, movement, and viewport for the 2D overworld.
 * The overworld is a Mario World-style hex map where the player moves
 * hex-by-hex between numbered beacon stops.
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { type ViewPhase } from "@/lib/hexIsleWorldData";
import {
  type VesselType,
  type OverworldBeaconPoint,
  VESSEL_SPEEDS,
  getBeaconsForIsland,
  getBeaconById,
  getAdjacentBeacons,
  getPathBetweenBeacons,
} from "@/lib/hexOverworldPaths";
import {
  type Viewport,
  createDefaultViewport,
  viewportTargetForHex,
} from "@/lib/hexOverworldUtils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OverworldNavState {
  viewPhase: ViewPhase;
  playerPosition: { q: number; r: number };
  currentBeaconId: string | null;
  currentIslandId: number;
  currentVessel: VesselType;
  visibleBeacons: OverworldBeaconPoint[];
  isMoving: boolean;
  moveProgress: number;        // 0-1 during hex movement animation
  moveFromHex: { q: number; r: number } | null;
  moveToHex: { q: number; r: number } | null;
  viewport: Viewport;
}

export interface OverworldNavActions {
  switchView: (phase: ViewPhase) => void;
  moveToBeacon: (beaconId: string) => void;
  moveAlongPath: (targetBeaconId: string) => void;
  setVessel: (vessel: VesselType) => void;
  enterBeacon: (beaconId: string) => void;
  setPlayerPosition: (q: number, r: number) => void;
  setViewport: (viewport: Viewport) => void;
  completeMove: () => void;
}

type OverworldNavContextType = OverworldNavState & OverworldNavActions;

// ─── Context ────────────────────────────────────────────────────────────────

const OverworldNavigationContext = createContext<OverworldNavContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function OverworldNavigationProvider({ children }: { children: ReactNode }) {
  const [viewPhase, setViewPhase] = useState<ViewPhase>("overworld");
  const [playerPosition, setPlayerPositionState] = useState({ q: 0, r: 8 }); // Start at Shore
  const [currentBeaconId, setCurrentBeaconId] = useState<string | null>("harvest-1");
  const [currentIslandId, setCurrentIslandId] = useState(1);
  const [currentVessel, setCurrentVessel] = useState<VesselType>("foot");
  const [isMoving, setIsMoving] = useState(false);
  const [moveProgress, setMoveProgress] = useState(0);
  const [moveFromHex, setMoveFromHex] = useState<{ q: number; r: number } | null>(null);
  const [moveToHex, setMoveToHex] = useState<{ q: number; r: number } | null>(null);
  const [viewport, setViewport] = useState<Viewport>(createDefaultViewport(800, 600));

  // Calculate visible beacons based on current position
  const allBeacons = getBeaconsForIsland(currentIslandId);
  const currentIndex = allBeacons.findIndex(b => b.id === currentBeaconId);
  const start = Math.max(0, currentIndex - 2);
  const end = Math.min(allBeacons.length, currentIndex + 4);
  const visibleBeacons = allBeacons.slice(start, end);

  const switchView = useCallback((phase: ViewPhase) => {
    setViewPhase(phase);
  }, []);

  const setPlayerPosition = useCallback((q: number, r: number) => {
    setPlayerPositionState({ q, r });
  }, []);

  const moveToBeacon = useCallback((beaconId: string) => {
    const beacon = getBeaconById(beaconId);
    if (!beacon) return;

    // Check if the beacon is adjacent to current
    const adjacent = currentBeaconId
      ? getAdjacentBeacons(currentBeaconId, currentIslandId)
      : [];

    if (!adjacent.includes(beaconId) && currentBeaconId !== null) return;

    setMoveFromHex(playerPosition);
    setMoveToHex(beacon.hexPosition);
    setIsMoving(true);
    setMoveProgress(0);
  }, [currentBeaconId, currentIslandId, playerPosition]);

  const moveAlongPath = useCallback((targetBeaconId: string) => {
    // For now, same as moveToBeacon — path animation handled by canvas
    moveToBeacon(targetBeaconId);
  }, [moveToBeacon]);

  const completeMove = useCallback(() => {
    if (moveToHex) {
      setPlayerPositionState(moveToHex);
      // Find which beacon we arrived at
      const beacons = getBeaconsForIsland(currentIslandId);
      const arrivedAt = beacons.find(
        b => b.hexPosition.q === moveToHex.q && b.hexPosition.r === moveToHex.r
      );
      if (arrivedAt) {
        setCurrentBeaconId(arrivedAt.id);
      }
    }
    setIsMoving(false);
    setMoveProgress(0);
    setMoveFromHex(null);
    setMoveToHex(null);
  }, [moveToHex, currentIslandId]);

  const setVessel = useCallback((vessel: VesselType) => {
    setCurrentVessel(vessel);
  }, []);

  const enterBeacon = useCallback((beaconId: string) => {
    const beacon = getBeaconById(beaconId);
    if (!beacon || !beacon.route) return;
    // Navigation to beacon route is handled by the consuming component
    // via react-router's navigate()
  }, []);

  return (
    <OverworldNavigationContext.Provider
      value={{
        viewPhase,
        playerPosition,
        currentBeaconId,
        currentIslandId,
        currentVessel,
        visibleBeacons,
        isMoving,
        moveProgress,
        moveFromHex,
        moveToHex,
        viewport,
        switchView,
        moveToBeacon,
        moveAlongPath,
        setVessel,
        enterBeacon,
        setPlayerPosition,
        setViewport,
        completeMove,
      }}
    >
      {children}
    </OverworldNavigationContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useOverworldNavigation(): OverworldNavContextType {
  const ctx = useContext(OverworldNavigationContext);
  if (!ctx) throw new Error("useOverworldNavigation must be used within OverworldNavigationProvider");
  return ctx;
}
