/**
 * THE CROW'S NEST — State Management Context
 * ============================================
 * Manages browse state, queue (watchlist), view history, to-go bag,
 * and overlay visibility. Uses localStorage for persistence (ghosts
 * and members alike — Supabase sync deferred to post-auth hardening).
 *
 * Pattern adapted from SpotlightContext dual-persistence model.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { DepthLevel } from "@/data/crowsNestDepths";
import type { CrowsNestSection, ToGoItem } from "@/data/crowsNestItems";

// ============================================================================
// TYPES
// ============================================================================

export interface QueueEntry {
  itemId: string;
  addedAt: number;
  preferredDepth?: DepthLevel;
}

export interface ViewHistoryEntry {
  itemId: string;
  depth: DepthLevel;
  viewedAt: number;
}

interface CrowsNestState {
  // Browse
  activeSection: CrowsNestSection | null;
  expandedItemId: string | null;
  expandedDepth: DepthLevel;
  searchQuery: string;

  // Queue (watchlist)
  queue: QueueEntry[];

  // History
  viewHistory: ViewHistoryEntry[];

  // To-Go bag
  toGoBag: Array<ToGoItem & { completed: boolean }>;

  // UI
  isOverlayOpen: boolean;
  overlayMode: "browse" | "queue" | "to_go";
}

interface CrowsNestContextType extends CrowsNestState {
  // Browse actions
  expandItem: (itemId: string, depth: DepthLevel) => void;
  collapseItem: () => void;
  setSection: (section: CrowsNestSection | null) => void;
  setSearch: (query: string) => void;

  // Queue actions
  addToQueue: (itemId: string, depth?: DepthLevel) => void;
  removeFromQueue: (itemId: string) => void;
  isInQueue: (itemId: string) => boolean;
  clearQueue: () => void;

  // To-Go actions
  addToGoBag: (items: ToGoItem[]) => void;
  toggleToGoComplete: (index: number) => void;
  clearCompletedToGo: () => void;
  clearToGoBag: () => void;
  copyToGoList: () => void;

  // History
  hasVisitedDepth: (itemId: string, depth: DepthLevel) => boolean;
  getVisitedDepths: (itemId: string) => DepthLevel[];

  // Overlay
  toggleOverlay: () => void;
  openOverlay: (mode?: "browse" | "queue" | "to_go") => void;
  closeOverlay: () => void;
  setOverlayMode: (mode: "browse" | "queue" | "to_go") => void;
}

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY = "crows_nest_state";

interface PersistedState {
  queue: QueueEntry[];
  viewHistory: ViewHistoryEntry[];
  toGoBag: Array<ToGoItem & { completed: boolean }>;
}

function loadPersistedState(): PersistedState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedState;
      return {
        queue: Array.isArray(parsed.queue) ? parsed.queue : [],
        viewHistory: Array.isArray(parsed.viewHistory) ? parsed.viewHistory : [],
        toGoBag: Array.isArray(parsed.toGoBag) ? parsed.toGoBag : [],
      };
    }
  } catch {
    // Ignore parse errors — start fresh
  }
  return { queue: [], viewHistory: [], toGoBag: [] };
}

function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — degrade gracefully
  }
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const DEFAULT_STATE: CrowsNestState = {
  activeSection: null,
  expandedItemId: null,
  expandedDepth: "glimpse",
  searchQuery: "",
  queue: [],
  viewHistory: [],
  toGoBag: [],
  isOverlayOpen: false,
  overlayMode: "browse",
};

// ============================================================================
// CONTEXT
// ============================================================================

const CrowsNestContext = createContext<CrowsNestContextType | undefined>(undefined);

export function CrowsNestProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CrowsNestState>(() => {
    const persisted = loadPersistedState();
    return {
      ...DEFAULT_STATE,
      queue: persisted.queue,
      viewHistory: persisted.viewHistory,
      toGoBag: persisted.toGoBag,
    };
  });

  // Persist queue, history, and to-go bag on change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    savePersistedState({
      queue: state.queue,
      viewHistory: state.viewHistory,
      toGoBag: state.toGoBag,
    });
  }, [state.queue, state.viewHistory, state.toGoBag]);

  // ── Browse actions ──

  const expandItem = useCallback((itemId: string, depth: DepthLevel) => {
    setState((prev) => {
      const newHistory = [
        ...prev.viewHistory,
        { itemId, depth, viewedAt: Date.now() },
      ];
      return {
        ...prev,
        expandedItemId: itemId,
        expandedDepth: depth,
        viewHistory: newHistory,
      };
    });
  }, []);

  const collapseItem = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expandedItemId: null,
      expandedDepth: "glimpse",
    }));
  }, []);

  const setSection = useCallback((section: CrowsNestSection | null) => {
    setState((prev) => ({
      ...prev,
      activeSection: section,
      expandedItemId: null,
      expandedDepth: "glimpse",
    }));
  }, []);

  const setSearch = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  // ── Queue actions ──

  const addToQueue = useCallback((itemId: string, depth?: DepthLevel) => {
    setState((prev) => {
      if (prev.queue.some((q) => q.itemId === itemId)) return prev;
      return {
        ...prev,
        queue: [...prev.queue, { itemId, addedAt: Date.now(), preferredDepth: depth }],
      };
    });
  }, []);

  const removeFromQueue = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      queue: prev.queue.filter((q) => q.itemId !== itemId),
    }));
  }, []);

  const isInQueue = useCallback(
    (itemId: string) => state.queue.some((q) => q.itemId === itemId),
    [state.queue]
  );

  const clearQueue = useCallback(() => {
    setState((prev) => ({ ...prev, queue: [] }));
  }, []);

  // ── To-Go actions ──

  const addToGoBag = useCallback((items: ToGoItem[]) => {
    setState((prev) => {
      const existingLabels = new Set(prev.toGoBag.map((t) => t.label));
      const newItems = items
        .filter((item) => !existingLabels.has(item.label))
        .map((item) => ({ ...item, completed: false }));
      if (newItems.length === 0) return prev;
      return { ...prev, toGoBag: [...prev.toGoBag, ...newItems] };
    });
  }, []);

  const toggleToGoComplete = useCallback((index: number) => {
    setState((prev) => {
      const updated = [...prev.toGoBag];
      if (updated[index]) {
        updated[index] = { ...updated[index], completed: !updated[index].completed };
      }
      return { ...prev, toGoBag: updated };
    });
  }, []);

  const clearCompletedToGo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      toGoBag: prev.toGoBag.filter((item) => !item.completed),
    }));
  }, []);

  const clearToGoBag = useCallback(() => {
    setState((prev) => ({ ...prev, toGoBag: [] }));
  }, []);

  const copyToGoList = useCallback(() => {
    const text = state.toGoBag
      .map((item) => {
        const check = item.completed ? "[x]" : "[ ]";
        const time = item.estimatedMinutes ? ` (~${item.estimatedMinutes} min)` : "";
        return `${check} ${item.label}${time}`;
      })
      .join("\n");
    navigator.clipboard.writeText(text).catch(() => {
      // Clipboard API may not be available — degrade silently
    });
  }, [state.toGoBag]);

  // ── History ──

  const hasVisitedDepth = useCallback(
    (itemId: string, depth: DepthLevel) =>
      state.viewHistory.some((h) => h.itemId === itemId && h.depth === depth),
    [state.viewHistory]
  );

  const getVisitedDepths = useCallback(
    (itemId: string): DepthLevel[] => {
      const depths = new Set(
        state.viewHistory
          .filter((h) => h.itemId === itemId)
          .map((h) => h.depth)
      );
      return Array.from(depths);
    },
    [state.viewHistory]
  );

  // ── Overlay ──

  const toggleOverlay = useCallback(() => {
    setState((prev) => ({ ...prev, isOverlayOpen: !prev.isOverlayOpen }));
  }, []);

  const openOverlay = useCallback((mode: "browse" | "queue" | "to_go" = "browse") => {
    setState((prev) => ({ ...prev, isOverlayOpen: true, overlayMode: mode }));
  }, []);

  const closeOverlay = useCallback(() => {
    setState((prev) => ({ ...prev, isOverlayOpen: false }));
  }, []);

  const setOverlayMode = useCallback((mode: "browse" | "queue" | "to_go") => {
    setState((prev) => ({ ...prev, overlayMode: mode }));
  }, []);

  // ── Value ──

  const value: CrowsNestContextType = {
    ...state,
    expandItem,
    collapseItem,
    setSection,
    setSearch,
    addToQueue,
    removeFromQueue,
    isInQueue,
    clearQueue,
    addToGoBag,
    toggleToGoComplete,
    clearCompletedToGo,
    clearToGoBag,
    copyToGoList,
    hasVisitedDepth,
    getVisitedDepths,
    toggleOverlay,
    openOverlay,
    closeOverlay,
    setOverlayMode,
  };

  return (
    <CrowsNestContext.Provider value={value}>
      {children}
    </CrowsNestContext.Provider>
  );
}

export function useCrowsNest(): CrowsNestContextType {
  const context = useContext(CrowsNestContext);
  if (!context) {
    throw new Error("useCrowsNest must be used within a CrowsNestProvider");
  }
  return context;
}
