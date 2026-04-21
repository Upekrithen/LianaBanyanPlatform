/**
 * PathwayProgressContext
 *
 * Manages user's pathway progress across the application.
 * Persists to localStorage for guests, syncs with Supabase for members.
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  UserPathwayProgress,
  DEFAULT_USER_PROGRESS,
  PathwayLevel,
  getUnlockedLevel,
  THREE_PACKS,
  checkThreePackCompletion,
  canDisableLevelGating,
} from '@/lib/pathwayLevels';

interface PathwayProgressContextType {
  progress: UserPathwayProgress;
  isLoading: boolean;
  completePathway: (pathwayId: string) => void;
  updatePathwayProgress: (pathwayId: string, percent: number) => void;
  startPathway: (pathwayId: string) => void;
  resetProgress: () => void;
  canAccessLevel: (level: PathwayLevel) => boolean;
  getCompletedCount: () => number;
  getNextThreePack: () => string | null;
  toggleLevelGating: () => void;
  canToggleLevelGating: () => boolean;
  isLevelGatingEnabled: () => boolean;
}

const PathwayProgressContext = createContext<PathwayProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'lb_pathway_progress';

export function PathwayProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserPathwayProgress>(DEFAULT_USER_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load progress on mount
  useEffect(() => {
    async function loadProgress() {
      setIsLoading(true);

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        // Try to load from database
        const { data, error } = await supabase
          .from('profiles')
          .select('pathway_progress')
          .eq('id', user.id)
          .single();

        if (data?.pathway_progress) {
          const dbProgress = data.pathway_progress as UserPathwayProgress;
          // Recalculate level based on completed pathways
          dbProgress.currentLevel = getUnlockedLevel(dbProgress.completedPathways);
          setProgress(dbProgress);
        } else {
          // No saved progress, check localStorage for guest progress to migrate
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const localProgress = JSON.parse(stored) as UserPathwayProgress;
              localProgress.currentLevel = getUnlockedLevel(localProgress.completedPathways);
              setProgress(localProgress);
              // Save to database
              await saveToDatabase(user.id, localProgress);
            } catch {
              setProgress(DEFAULT_USER_PROGRESS);
            }
          }
        }
      } else {
        // Guest user - load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const localProgress = JSON.parse(stored) as UserPathwayProgress;
            localProgress.currentLevel = getUnlockedLevel(localProgress.completedPathways);
            setProgress(localProgress);
          } catch {
            setProgress(DEFAULT_USER_PROGRESS);
          }
        }
      }

      setIsLoading(false);
    }

    loadProgress();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        // Migrate localStorage progress to database
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const localProgress = JSON.parse(stored) as UserPathwayProgress;
            await saveToDatabase(session.user.id, localProgress);
          } catch {
            // Ignore parse errors
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save to database helper
  async function saveToDatabase(uid: string, prog: UserPathwayProgress) {
    await supabase
      .from('profiles')
      .update({ pathway_progress: prog })
      .eq('id', uid);
  }

  // Save progress whenever it changes
  useEffect(() => {
    if (isLoading) return;

    // Always save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    // If logged in, also save to database
    if (userId) {
      saveToDatabase(userId, progress);
    }
  }, [progress, userId, isLoading]);

  const completePathway = useCallback((pathwayId: string) => {
    setProgress(prev => {
      if (prev.completedPathways.includes(pathwayId)) return prev;

      const newCompleted = [...prev.completedPathways, pathwayId];
      const newLevel = getUnlockedLevel(newCompleted);

      // Check which three-packs are now complete
      const newUnlockedPacks = THREE_PACKS
        .filter(pack => checkThreePackCompletion(pack.id, newCompleted))
        .map(pack => pack.id);

      return {
        ...prev,
        completedPathways: newCompleted,
        currentLevel: newLevel,
        unlockedThreePacks: newUnlockedPacks,
        pathwayProgress: {
          ...prev.pathwayProgress,
          [pathwayId]: 100,
        },
      };
    });
  }, []);

  const updatePathwayProgress = useCallback((pathwayId: string, percent: number) => {
    setProgress(prev => ({
      ...prev,
      pathwayProgress: {
        ...prev.pathwayProgress,
        [pathwayId]: Math.min(100, Math.max(0, percent)),
      },
    }));
  }, []);

  const startPathway = useCallback((pathwayId: string) => {
    setProgress(prev => ({
      ...prev,
      activePathway: pathwayId,
      pathwayProgress: {
        ...prev.pathwayProgress,
        [pathwayId]: prev.pathwayProgress[pathwayId] || 0,
      },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_USER_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
    if (userId) {
      saveToDatabase(userId, DEFAULT_USER_PROGRESS);
    }
  }, [userId]);

  const canAccessLevel = useCallback((level: PathwayLevel) => {
    return progress.currentLevel >= level;
  }, [progress.currentLevel]);

  const getCompletedCount = useCallback(() => {
    return progress.completedPathways.length;
  }, [progress.completedPathways]);

  const getNextThreePack = useCallback(() => {
    // Find a three-pack at current level that isn't complete
    const availablePacks = THREE_PACKS.filter(
      pack => pack.level === progress.currentLevel &&
              !progress.unlockedThreePacks.includes(pack.id)
    );
    return availablePacks[0]?.id || null;
  }, [progress.currentLevel, progress.unlockedThreePacks]);

  const canToggleLevelGating = useCallback(() => {
    return canDisableLevelGating(progress.currentLevel);
  }, [progress.currentLevel]);

  const toggleLevelGating = useCallback(() => {
    if (!canToggleLevelGating()) return;

    setProgress(prev => ({
      ...prev,
      levelGatingEnabled: !prev.levelGatingEnabled,
    }));
  }, [canToggleLevelGating]);

  const isLevelGatingEnabled = useCallback(() => {
    return progress.levelGatingEnabled;
  }, [progress.levelGatingEnabled]);

  return (
    <PathwayProgressContext.Provider
      value={{
        progress,
        isLoading,
        completePathway,
        updatePathwayProgress,
        startPathway,
        resetProgress,
        canAccessLevel,
        getCompletedCount,
        getNextThreePack,
        toggleLevelGating,
        canToggleLevelGating,
        isLevelGatingEnabled,
      }}
    >
      {children}
    </PathwayProgressContext.Provider>
  );
}

export function usePathwayProgress() {
  const context = useContext(PathwayProgressContext);
  if (!context) {
    throw new Error('usePathwayProgress must be used within PathwayProgressProvider');
  }
  return context;
}

export default PathwayProgressContext;
