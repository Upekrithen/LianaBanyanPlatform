/**
 * CANAL ACCESS CONTEXT
 * ====================
 * Manages venue access, all-access passes, gondola state,
 * and golden key collection for the Vienna-style Canal Quarter.
 *
 * Economics:
 *   - Each venue: 1-3 Credits entrance
 *   - All-Access Pass: 3x single-venue price, 24h unlimited
 *   - Gondola-only venues require gondola OR long walk path with golden keys
 *   - Deck Cards can skip entrance fees
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  type CanalVenue,
  type AllAccessPass,
  type GondolaDock,
  generateCanalDistrict,
  ALL_ACCESS_PASS,
} from "@/lib/hexCanalDistrict";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CanalAccessState {
  venues: CanalVenue[];
  visitedVenueIds: string[];
  activePass: AllAccessPass | null;
  passExpiresAt: number | null;   // timestamp
  currentGondolaDockId: string | null;
  isOnGondola: boolean;
  goldenKeysFound: number;
  totalGoldenKeys: number;
}

export interface CanalAccessActions {
  enterVenue: (venueId: string) => { allowed: boolean; cost: number; reason?: string };
  buyAllAccessPass: () => { purchased: boolean; cost: number };
  boardGondola: (dockId: string) => boolean;
  exitGondola: () => void;
  collectGoldenKey: () => void;
  checkAccess: (venueId: string) => { hasAccess: boolean; cost: number; accessMode: string };
  isPassActive: () => boolean;
}

type CanalAccessContextType = CanalAccessState & CanalAccessActions;

// ─── Context ────────────────────────────────────────────────────────────────

const CanalAccessContext = createContext<CanalAccessContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function CanalAccessProvider({ children }: { children: ReactNode }) {
  const [district] = useState(() => generateCanalDistrict());
  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>([]);
  const [activePass, setActivePass] = useState<AllAccessPass | null>(null);
  const [passExpiresAt, setPassExpiresAt] = useState<number | null>(null);
  const [currentGondolaDockId, setCurrentGondolaDockId] = useState<string | null>(null);
  const [isOnGondola, setIsOnGondola] = useState(false);
  const [goldenKeysFound, setGoldenKeysFound] = useState(0);

  // Count total golden keys available in the district
  const totalGoldenKeys = district.venues.filter(v => v.hasGoldenKeys).length * 3; // 3 keys per venue path

  const isPassActive = useCallback(() => {
    if (!activePass || !passExpiresAt) return false;
    return Date.now() < passExpiresAt;
  }, [activePass, passExpiresAt]);

  const checkAccess = useCallback((venueId: string) => {
    const venue = district.venues.find(v => v.id === venueId);
    if (!venue) return { hasAccess: false, cost: 0, accessMode: "none" };

    // All-Access Pass covers everything
    if (isPassActive()) {
      return { hasAccess: true, cost: 0, accessMode: "pass" };
    }

    // Gondola-only venues require gondola or walk path completion
    if (venue.accessModes.includes("gondola_only") && !isOnGondola) {
      return {
        hasAccess: false,
        cost: venue.entranceFee,
        accessMode: "gondola_only",
      };
    }

    return {
      hasAccess: true,
      cost: venue.entranceFee,
      accessMode: isOnGondola ? "gondola" : "walk",
    };
  }, [district, isPassActive, isOnGondola]);

  const enterVenue = useCallback((venueId: string) => {
    const access = checkAccess(venueId);

    if (!access.hasAccess) {
      return {
        allowed: false,
        cost: 0,
        reason: access.accessMode === "gondola_only"
          ? "This venue can only be reached by gondola or the long walking path."
          : "Access denied.",
      };
    }

    // Mark as visited
    if (!visitedVenueIds.includes(venueId)) {
      setVisitedVenueIds(prev => [...prev, venueId]);
    }

    return { allowed: true, cost: access.cost };
  }, [checkAccess, visitedVenueIds]);

  const buyAllAccessPass = useCallback(() => {
    const pass = ALL_ACCESS_PASS;
    setActivePass(pass);
    setPassExpiresAt(Date.now() + pass.durationHours * 60 * 60 * 1000);
    return { purchased: true, cost: pass.cost };
  }, []);

  const boardGondola = useCallback((dockId: string) => {
    const dock = district.network.docks.find(d => d.id === dockId);
    if (!dock) return false;
    setCurrentGondolaDockId(dockId);
    setIsOnGondola(true);
    return true;
  }, [district]);

  const exitGondola = useCallback(() => {
    setIsOnGondola(false);
    setCurrentGondolaDockId(null);
  }, []);

  const collectGoldenKey = useCallback(() => {
    setGoldenKeysFound(prev => prev + 1);
  }, []);

  return (
    <CanalAccessContext.Provider
      value={{
        venues: district.venues,
        visitedVenueIds,
        activePass,
        passExpiresAt,
        currentGondolaDockId,
        isOnGondola,
        goldenKeysFound,
        totalGoldenKeys,
        enterVenue,
        buyAllAccessPass,
        boardGondola,
        exitGondola,
        collectGoldenKey,
        checkAccess,
        isPassActive,
      }}
    >
      {children}
    </CanalAccessContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCanalAccess(): CanalAccessContextType {
  const ctx = useContext(CanalAccessContext);
  if (!ctx) throw new Error("useCanalAccess must be used within CanalAccessProvider");
  return ctx;
}
