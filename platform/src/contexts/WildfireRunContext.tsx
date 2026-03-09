/**
 * WILDFIRE RUN CONTEXT
 * ====================
 * Global state management for active wildfire beacon runs.
 * Persists run state across page navigation.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WildfireRun } from "@/components/WildfireBeaconRun";
import { getRunBySlug } from "@/data/wildfireRuns";

interface WildfireRunContextType {
  activeRun: WildfireRun | null;
  startRun: (run: WildfireRun) => void;
  endRun: () => void;
  isRunning: boolean;
}

const WildfireRunContext = createContext<WildfireRunContextType | undefined>(undefined);

const STORAGE_KEY = "lb_active_wildfire_run";

export function WildfireRunProvider({ children }: { children: ReactNode }) {
  const [activeRun, setActiveRun] = useState<WildfireRun | null>(null);

  // Restore active run from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { slug } = JSON.parse(stored);
        const run = getRunBySlug(slug);
        if (run) {
          setActiveRun(run);
        }
      }
    } catch (e) {
      console.error("Failed to restore wildfire run:", e);
    }
  }, []);

  const startRun = (run: WildfireRun) => {
    setActiveRun(run);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slug: run.slug }));
  };

  const endRun = () => {
    setActiveRun(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <WildfireRunContext.Provider
      value={{
        activeRun,
        startRun,
        endRun,
        isRunning: activeRun !== null,
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
