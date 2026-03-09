/**
 * PIPE PORTAL CONTEXT
 * ===================
 * Manages pipe portal subway state — which lines are unlocked,
 * transit animations, skill gates, and cost calculations.
 *
 * Pipe Portals are Mario warp-pipe style transit connecting
 * locations within cities and between islands.
 *
 * Glyphs: ● Circle = Credits, ■ Square = Marks, ▲ Triangle = Joules
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  type PipeNetwork,
  type PipeStation,
  type PipeLine,
  generatePipeNetwork,
  getLineForStation,
  canAccessLine,
  getTransitCost,
  getPipeStationAtHex,
} from "@/lib/hexPipePortals";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PipePortalState {
  activeNetwork: PipeNetwork;
  currentStation: PipeStation | null;
  activeLine: PipeLine | null;
  isTransiting: boolean;
  transitProgress: number;     // 0-1 during transit animation
  transitFromStation: PipeStation | null;
  transitToStation: PipeStation | null;
  unlockedLineIds: string[];
  playerLevel: number;
  playerSkillLevel: number;
  hasDeckCardBypass: boolean;
}

export interface PipePortalActions {
  enterPipe: (stationId: string) => boolean;
  exitPipe: () => void;
  selectDestination: (stationId: string) => boolean;
  completeTransit: () => void;
  setPlayerLevel: (level: number) => void;
  setPlayerSkillLevel: (level: number) => void;
  setDeckCardBypass: (has: boolean) => void;
  checkStationAtHex: (q: number, r: number) => PipeStation | null;
}

type PipePortalContextType = PipePortalState & PipePortalActions;

// ─── Context ────────────────────────────────────────────────────────────────

const PipePortalContext = createContext<PipePortalContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function PipePortalProvider({
  islandId = 1,
  children,
}: {
  islandId?: number;
  children: ReactNode;
}) {
  const [network] = useState(() => generatePipeNetwork(islandId));
  const [currentStation, setCurrentStation] = useState<PipeStation | null>(null);
  const [activeLine, setActiveLine] = useState<PipeLine | null>(null);
  const [isTransiting, setIsTransiting] = useState(false);
  const [transitProgress, setTransitProgress] = useState(0);
  const [transitFromStation, setTransitFromStation] = useState<PipeStation | null>(null);
  const [transitToStation, setTransitToStation] = useState<PipeStation | null>(null);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerSkillLevel, setPlayerSkillLevel] = useState(0);
  const [hasDeckCardBypass, setDeckCardBypass] = useState(false);

  // Calculate unlocked lines based on player level
  const unlockedLineIds = network.lines
    .filter(line => canAccessLine(line, playerLevel))
    .map(line => line.id);

  const enterPipe = useCallback((stationId: string) => {
    const station = network.stations.find(s => s.id === stationId);
    if (!station) return false;

    const line = getLineForStation(stationId, network);
    if (!line || !canAccessLine(line, playerLevel)) return false;

    setCurrentStation(station);
    setActiveLine(line);
    return true;
  }, [network, playerLevel]);

  const selectDestination = useCallback((stationId: string) => {
    if (!currentStation || !activeLine) return false;

    const destStation = network.stations.find(s => s.id === stationId);
    if (!destStation) return false;

    // Check destination is on the same line
    if (!activeLine.stations.includes(stationId)) return false;

    // Calculate cost
    const cost = getTransitCost(currentStation, playerSkillLevel, hasDeckCardBypass);
    // In a real system, deduct cost here. For now, just start transit.

    setTransitFromStation(currentStation);
    setTransitToStation(destStation);
    setIsTransiting(true);
    setTransitProgress(0);
    return true;
  }, [currentStation, activeLine, network, playerSkillLevel, hasDeckCardBypass]);

  const exitPipe = useCallback(() => {
    setCurrentStation(null);
    setActiveLine(null);
  }, []);

  const completeTransit = useCallback(() => {
    if (transitToStation) {
      setCurrentStation(transitToStation);
    }
    setIsTransiting(false);
    setTransitProgress(0);
    setTransitFromStation(null);
    setTransitToStation(null);
  }, [transitToStation]);

  const checkStationAtHex = useCallback((q: number, r: number) => {
    return getPipeStationAtHex(q, r, network);
  }, [network]);

  return (
    <PipePortalContext.Provider
      value={{
        activeNetwork: network,
        currentStation,
        activeLine,
        isTransiting,
        transitProgress,
        transitFromStation,
        transitToStation,
        unlockedLineIds,
        playerLevel,
        playerSkillLevel,
        hasDeckCardBypass,
        enterPipe,
        exitPipe,
        selectDestination,
        completeTransit,
        setPlayerLevel,
        setPlayerSkillLevel,
        setDeckCardBypass,
        checkStationAtHex,
      }}
    >
      {children}
    </PipePortalContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePipePortal(): PipePortalContextType {
  const ctx = useContext(PipePortalContext);
  if (!ctx) throw new Error("usePipePortal must be used within PipePortalProvider");
  return ctx;
}
