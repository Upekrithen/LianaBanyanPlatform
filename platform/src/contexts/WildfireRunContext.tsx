/**
 * WILDFIRE RUN CONTEXT
 * ====================
 * Global state management for active wildfire beacon runs AND tour mode.
 * Persists run/tour state across page navigation via localStorage.
 *
 * Tour mode: prospective members explore with mock data, no Supabase writes.
 * K358 / B086 — April 7, 2026
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { WildfireRun } from "@/components/WildfireBeaconRun";
import { SpotlightStop } from "@/components/SpotlightOverlay";
import { getRunBySlug } from "@/data/wildfireRuns";
import { TOUR_PROFILE, TOUR_STATS, TOUR_PAGES_FOR_COMPLETION } from "@/data/tourMockData";

export type TourMode = 'classic' | 'spotlight';

interface SpotlightState {
  tourName: string;
  stops: SpotlightStop[];
  isActive: boolean;
}

interface WildfireRunContextType {
  activeRun: WildfireRun | null;
  startRun: (run: WildfireRun) => void;
  endRun: () => void;
  isRunning: boolean;

  tourMode: TourMode;
  setTourMode: (mode: TourMode) => void;

  spotlight: SpotlightState;
  startSpotlightTour: (tourName: string, stops: SpotlightStop[]) => void;
  endSpotlightTour: () => void;

  isTourMode: boolean;
  startTour: () => void;
  endTour: () => void;
  tourPagesVisited: number;
  trackTourPage: (pageId: string) => void;
  tourProfile: typeof TOUR_PROFILE;
  tourStats: typeof TOUR_STATS;
  showTourCompletion: boolean;
  dismissTourCompletion: () => void;
}

const WildfireRunContext = createContext<WildfireRunContextType | undefined>(undefined);

const STORAGE_KEY = "lb_active_wildfire_run";
const TOUR_KEY = "lb_wildfire_tour";
const TOUR_PAGES_KEY = "lb_tour_pages";

const EMPTY_SPOTLIGHT: SpotlightState = { tourName: '', stops: [], isActive: false };

export function WildfireRunProvider({ children }: { children: ReactNode }) {
  const [activeRun, setActiveRun] = useState<WildfireRun | null>(null);
  const [isTourMode, setIsTourMode] = useState(false);
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set());
  const [showTourCompletion, setShowTourCompletion] = useState(false);
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const [tourMode, setTourMode] = useState<TourMode>('spotlight');
  const [spotlight, setSpotlight] = useState<SpotlightState>(EMPTY_SPOTLIGHT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { slug } = JSON.parse(stored);
        const run = getRunBySlug(slug);
        if (run) setActiveRun(run);
      }
      const tourStored = localStorage.getItem(TOUR_KEY);
      if (tourStored === "true") setIsTourMode(true);
      const pagesStored = localStorage.getItem(TOUR_PAGES_KEY);
      if (pagesStored) {
        try {
          setVisitedPages(new Set(JSON.parse(pagesStored)));
        } catch { /* ignore */ }
      }
    } catch (e) {
      console.error("Failed to restore wildfire state:", e);
    }
  }, []);

  useEffect(() => {
    if (isTourMode && visitedPages.size >= TOUR_PAGES_FOR_COMPLETION && !completionDismissed) {
      setShowTourCompletion(true);
    }
  }, [isTourMode, visitedPages.size, completionDismissed]);

  const startRun = (run: WildfireRun) => {
    setActiveRun(run);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slug: run.slug }));
  };

  const endRun = () => {
    setActiveRun(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const startTour = useCallback(() => {
    setIsTourMode(true);
    setVisitedPages(new Set());
    setCompletionDismissed(false);
    localStorage.setItem(TOUR_KEY, "true");
    localStorage.removeItem(TOUR_PAGES_KEY);
  }, []);

  const endTour = useCallback(() => {
    setIsTourMode(false);
    setVisitedPages(new Set());
    setShowTourCompletion(false);
    setCompletionDismissed(false);
    localStorage.removeItem(TOUR_KEY);
    localStorage.removeItem(TOUR_PAGES_KEY);
  }, []);

  const trackTourPage = useCallback((pageId: string) => {
    setVisitedPages((prev) => {
      if (prev.has(pageId)) return prev;
      const next = new Set(prev);
      next.add(pageId);
      localStorage.setItem(TOUR_PAGES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const dismissTourCompletion = useCallback(() => {
    setShowTourCompletion(false);
    setCompletionDismissed(true);
  }, []);

  const startSpotlightTour = useCallback((tourName: string, stops: SpotlightStop[]) => {
    setSpotlight({ tourName, stops, isActive: true });
  }, []);

  const endSpotlightTour = useCallback(() => {
    setSpotlight(EMPTY_SPOTLIGHT);
  }, []);

  return (
    <WildfireRunContext.Provider
      value={{
        activeRun,
        startRun,
        endRun,
        isRunning: activeRun !== null,
        tourMode,
        setTourMode,
        spotlight,
        startSpotlightTour,
        endSpotlightTour,
        isTourMode,
        startTour,
        endTour,
        tourPagesVisited: visitedPages.size,
        trackTourPage,
        tourProfile: TOUR_PROFILE,
        tourStats: TOUR_STATS,
        showTourCompletion,
        dismissTourCompletion,
      }}
    >
      {children}
    </WildfireRunContext.Provider>
  );
}

export function useWildfireRun() {
  const context = useContext(WildfireRunContext);
  if (context === undefined) {
    throw new Error("useWildfireRun must be used within a WildfireRunProvider");
  }
  return context;
}

/** Safe variant — returns isRunning: false when WildfireRunProvider is absent */
export function useWildfireRunSafe() {
  const context = useContext(WildfireRunContext);
  if (context === undefined) {
    return { isRunning: false, activeRun: null } as any;
  }
  return context;
}
