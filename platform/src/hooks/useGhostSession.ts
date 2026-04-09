/**
 * useGhostSession — Centralized ghost browsing session for unauthenticated visitors.
 *
 * Ghost Marks half-life: 50% decay every 24 hours of inactivity.
 * After 72 hours with no activity, session expires completely.
 * localStorage only — no Supabase auth required.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'lb_ghost_browsing_session';
const HALF_LIFE_MS = 24 * 60 * 60 * 1000; // 24 hours
const EXPIRY_MS = 72 * 60 * 60 * 1000; // 72 hours

export interface GhostBrowsingSession {
  ghostId: string;
  createdAt: string;
  lastActiveAt: string;
  tempMarks: number;
  pagesVisited: string[];
  actionsAttempted: string[];
  goldenKeysFound: number;
  beaconRunsCompleted: number;
}

function generateGhostId(): string {
  return `ghost_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function loadSession(): GhostBrowsingSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GhostBrowsingSession;
  } catch {
    return null;
  }
}

function saveSession(session: GhostBrowsingSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function applyDecay(session: GhostBrowsingSession): GhostBrowsingSession {
  const now = Date.now();
  const lastActive = new Date(session.lastActiveAt).getTime();
  const elapsed = now - lastActive;

  if (elapsed >= EXPIRY_MS) {
    return createFreshSession();
  }

  if (elapsed >= HALF_LIFE_MS) {
    const decayPeriods = Math.floor(elapsed / HALF_LIFE_MS);
    const decayFactor = Math.pow(0.5, decayPeriods);
    return {
      ...session,
      tempMarks: Math.floor(session.tempMarks * decayFactor),
      lastActiveAt: new Date().toISOString(),
    };
  }

  return session;
}

function createFreshSession(): GhostBrowsingSession {
  return {
    ghostId: generateGhostId(),
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    tempMarks: 0,
    pagesVisited: [],
    actionsAttempted: [],
    goldenKeysFound: 0,
    beaconRunsCompleted: 0,
  };
}

// Marks awards
const MARKS_AWARD = {
  viewTreasureMap: 5,
  completeBeaconRun: 10,
  findGoldenKey: 25,
  visitFivePages: 5,
  viewCueCard: 2,
  flipCard: 1,
} as const;

export function useGhostSession() {
  const { user } = useAuth();
  const [session, setSession] = useState<GhostBrowsingSession | null>(null);

  // On mount: load or create session (only for non-authed users)
  useEffect(() => {
    if (user) {
      setSession(null);
      return;
    }

    let loaded = loadSession();
    if (loaded) {
      loaded = applyDecay(loaded);
    } else {
      loaded = createFreshSession();
    }
    saveSession(loaded);
    setSession(loaded);
    localStorage.setItem('ghost_mode', 'true');
  }, [user]);

  const isGhost = !user && session !== null;
  const tempMarks = session?.tempMarks ?? 0;

  const updateSession = useCallback((updater: (prev: GhostBrowsingSession) => GhostBrowsingSession) => {
    setSession(prev => {
      if (!prev) return prev;
      const next = updater({ ...prev, lastActiveAt: new Date().toISOString() });
      saveSession(next);
      return next;
    });
  }, []);

  const awardMarks = useCallback((amount: number) => {
    updateSession(s => ({ ...s, tempMarks: s.tempMarks + amount }));
  }, [updateSession]);

  const trackPageVisit = useCallback((path: string) => {
    updateSession(s => {
      const alreadyVisited = s.pagesVisited.includes(path);
      const pages = alreadyVisited ? s.pagesVisited : [...s.pagesVisited, path];
      const bonus = !alreadyVisited && pages.length === 5 ? MARKS_AWARD.visitFivePages : 0;
      return { ...s, pagesVisited: pages, tempMarks: s.tempMarks + bonus };
    });
  }, [updateSession]);

  const trackActionAttempted = useCallback((action: string) => {
    updateSession(s => ({
      ...s,
      actionsAttempted: s.actionsAttempted.includes(action)
        ? s.actionsAttempted
        : [...s.actionsAttempted, action],
    }));
  }, [updateSession]);

  const awardTreasureMapView = useCallback(() => {
    awardMarks(MARKS_AWARD.viewTreasureMap);
  }, [awardMarks]);

  const awardBeaconRunComplete = useCallback(() => {
    updateSession(s => ({
      ...s,
      tempMarks: s.tempMarks + MARKS_AWARD.completeBeaconRun,
      beaconRunsCompleted: s.beaconRunsCompleted + 1,
    }));
  }, [updateSession]);

  const awardGoldenKeyFound = useCallback(() => {
    updateSession(s => ({
      ...s,
      tempMarks: s.tempMarks + MARKS_AWARD.findGoldenKey,
      goldenKeysFound: s.goldenKeysFound + 1,
    }));
  }, [updateSession]);

  const awardFlipCard = useCallback(() => {
    awardMarks(MARKS_AWARD.flipCard);
  }, [awardMarks]);

  const awardCueCardView = useCallback(() => {
    awardMarks(MARKS_AWARD.viewCueCard);
  }, [awardMarks]);

  // Check if Ghost Marks are fading (48+ hours since last activity)
  const isFading = useMemo(() => {
    if (!session) return false;
    const elapsed = Date.now() - new Date(session.lastActiveAt).getTime();
    return elapsed >= 48 * 60 * 60 * 1000;
  }, [session]);

  // For conversion on signup: returns session data then clears ghost storage
  const consumeForConversion = useCallback((): GhostBrowsingSession | null => {
    const current = loadSession();
    if (current) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('ghost_mode');
      localStorage.removeItem('ghost_entry_path');
    }
    setSession(null);
    return current;
  }, []);

  return {
    isGhost,
    session,
    tempMarks,
    isFading,
    awardMarks,
    trackPageVisit,
    trackActionAttempted,
    awardTreasureMapView,
    awardBeaconRunComplete,
    awardGoldenKeyFound,
    awardFlipCard,
    awardCueCardView,
    consumeForConversion,
    MARKS_AWARD,
  };
}
