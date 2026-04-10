/**
 * ARCHIPELAGO TOUR CONTEXT
 * Lightweight client-side-only tour state for the Museum portal.
 * Ghost World = tour narrative. Real World (X-Ray) = business mapping.
 * Progressive island unlock: flip a card → next island unlocks.
 *
 * All state in localStorage — no Supabase writes.
 * K358 / B092 — WildFire Tour via Archipelago.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const TOUR_KEY = "wildfire_tour";
const PROGRESS_KEY = "hexisle_tour_progress";

interface TourProgress {
  flippedIslands: string[];
  visitedDistricts: string[];
}

interface ArchipelagoTourContextType {
  isTourActive: boolean;
  startTour: () => void;
  endTour: () => void;

  flippedIslands: string[];
  visitedDistricts: string[];

  markIslandFlipped: (slug: string) => void;
  markDistrictVisited: (slug: string) => void;

  isIslandUnlocked: (slug: string) => boolean;
  showCompletion: boolean;
  dismissCompletion: () => void;
  allIslandsFlipped: boolean;

  /** LRH dialogue key for the current tour moment */
  currentDialogue: string | null;
  advanceDialogue: () => void;
}

/**
 * Island unlock graph — matches the archipelago path topology.
 * prerequisite: which island(s) must be flipped first.
 */
const UNLOCK_PREREQUISITES: Record<string, string[]> = {
  harvest: [],
  navigate: ["harvest"],
  engineer: ["navigate"],
  battle: ["engineer"],
  seek: ["battle"],
  magic: ["battle"],
  train: ["seek", "magic"],
};

const ALL_ISLANDS = ["harvest", "navigate", "engineer", "battle", "seek", "magic", "train"];

function loadProgress(): TourProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { flippedIslands: [], visitedDistricts: [] };
}

function saveProgress(p: TourProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function getDialogue(flipped: string[]): string | null {
  if (flipped.length === 0) return "welcome";
  if (flipped.length === 1 && flipped[0] === "harvest") return "after-harvest";
  if (flipped.length >= ALL_ISLANDS.length) return "complete";
  return null;
}

const DIALOGUE_TEXT: Record<string, { title: string; message: string }> = {
  welcome: {
    title: "Welcome to the Archipelago",
    message: "Each island teaches a skill. Start with Harvest — tap the golden island at the south.",
  },
  "after-harvest": {
    title: "Manufacturing unlocked!",
    message: "You just learned about Manufacturing. Navigate Island is next — chart the trade routes.",
  },
  complete: {
    title: "All seven islands explored!",
    message: "You've seen Manufacturing, Sales, R&D, Competition, Quality, Service, and Leadership. Ready to make it real?",
  },
};

const ArchipelagoTourContext = createContext<ArchipelagoTourContextType | undefined>(undefined);

export function ArchipelagoTourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [progress, setProgress] = useState<TourProgress>(loadProgress);
  const [showCompletion, setShowCompletion] = useState(false);
  const [dialogueDismissed, setDialogueDismissed] = useState(false);

  useEffect(() => {
    setIsTourActive(localStorage.getItem(TOUR_KEY) === "true");
    setProgress(loadProgress());
  }, []);

  const allIslandsFlipped = ALL_ISLANDS.every((i) => progress.flippedIslands.includes(i));

  useEffect(() => {
    if (isTourActive && allIslandsFlipped) {
      setShowCompletion(true);
    }
  }, [isTourActive, allIslandsFlipped]);

  const startTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "true");
    localStorage.removeItem(PROGRESS_KEY);
    setIsTourActive(true);
    setProgress({ flippedIslands: [], visitedDistricts: [] });
    setShowCompletion(false);
    setDialogueDismissed(false);
  }, []);

  const endTour = useCallback(() => {
    localStorage.removeItem(TOUR_KEY);
    setIsTourActive(false);
    setShowCompletion(false);
  }, []);

  const markIslandFlipped = useCallback((slug: string) => {
    setProgress((prev) => {
      if (prev.flippedIslands.includes(slug)) return prev;
      const next = { ...prev, flippedIslands: [...prev.flippedIslands, slug] };
      saveProgress(next);
      setDialogueDismissed(false);
      return next;
    });
  }, []);

  const markDistrictVisited = useCallback((slug: string) => {
    setProgress((prev) => {
      if (prev.visitedDistricts.includes(slug)) return prev;
      const next = { ...prev, visitedDistricts: [...prev.visitedDistricts, slug] };
      saveProgress(next);
      return next;
    });
  }, []);

  const isIslandUnlocked = useCallback(
    (slug: string) => {
      if (!isTourActive) return true;
      const prereqs = UNLOCK_PREREQUISITES[slug] || [];
      if (prereqs.length === 0) return true;
      return prereqs.every((p) => progress.flippedIslands.includes(p));
    },
    [isTourActive, progress.flippedIslands]
  );

  const dialogueKey = isTourActive ? getDialogue(progress.flippedIslands) : null;
  const currentDialogue =
    dialogueKey && !dialogueDismissed ? dialogueKey : null;

  const advanceDialogue = useCallback(() => {
    setDialogueDismissed(true);
  }, []);

  const dismissCompletion = useCallback(() => {
    setShowCompletion(false);
  }, []);

  return (
    <ArchipelagoTourContext.Provider
      value={{
        isTourActive,
        startTour,
        endTour,
        flippedIslands: progress.flippedIslands,
        visitedDistricts: progress.visitedDistricts,
        markIslandFlipped,
        markDistrictVisited,
        isIslandUnlocked,
        showCompletion,
        dismissCompletion,
        allIslandsFlipped,
        currentDialogue,
        advanceDialogue,
      }}
    >
      {children}
    </ArchipelagoTourContext.Provider>
  );
}

export function useArchipelagoTour() {
  const ctx = useContext(ArchipelagoTourContext);
  if (!ctx) throw new Error("useArchipelagoTour must be inside ArchipelagoTourProvider");
  return ctx;
}

/** Safe hook — returns inactive state when outside provider */
export function useArchipelagoTourSafe() {
  const ctx = useContext(ArchipelagoTourContext);
  if (!ctx) {
    return {
      isTourActive: false,
      isIslandUnlocked: () => true,
      flippedIslands: [] as string[],
      visitedDistricts: [] as string[],
    } as ArchipelagoTourContextType;
  }
  return ctx;
}

export { DIALOGUE_TEXT, ALL_ISLANDS };
