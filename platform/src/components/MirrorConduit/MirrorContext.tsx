import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MirrorConduit {
  id: string;
  mirrorALocation: string;
  mirrorBLocation: string;
  difficultyLevel: number;
  riddleClue?: string;
}

interface UserConduitProgress {
  conduitId: string;
  discoveredAt: Date | null;
  completedAt: Date | null;
  candleCollected: boolean;
}

interface MirrorContextType {
  conduits: MirrorConduit[];
  userProgress: Record<string, UserConduitProgress>;
  activeMirror: string | null;
  setActiveMirror: (location: string | null) => void;
  discoverConduit: (conduitId: string) => void;
  completeConduit: (conduitId: string) => void;
  collectCandle: (conduitId: string) => void;
  getConduitByMirror: (location: string) => MirrorConduit | undefined;
  isConduitDiscovered: (conduitId: string) => boolean;
  isConduitCompleted: (conduitId: string) => boolean;
  isTraveling: boolean;
  startTravel: (from: string, to: string) => void;
  travelDestination: string | null;
}

const MirrorContext = createContext<MirrorContextType | undefined>(undefined);

const DIFFICULTY_LABELS = [
  "Easy Pairs",
  "Room Pairs",
  "Building Pairs",
  "District Pairs",
  "Precarious Puzzles",
];

export function MirrorConduitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeMirror, setActiveMirror] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelDestination, setTravelDestination] = useState<string | null>(null);

  const { data: conduits = [] } = useQuery({
    queryKey: ["mirror-conduits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mirror_conduits")
        .select("*")
        .order("difficulty_level");

      if (error) throw error;

      return (data || []).map((c) => ({
        id: c.id,
        mirrorALocation: c.mirror_a_location,
        mirrorBLocation: c.mirror_b_location,
        difficultyLevel: c.difficulty_level,
        riddleClue: c.riddle_clue,
      })) as MirrorConduit[];
    },
  });

  const { data: userProgress = {} } = useQuery({
    queryKey: ["conduit-progress", user?.id],
    queryFn: async () => {
      if (!user) return {};

      const { data, error } = await supabase
        .from("user_conduit_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const progress: Record<string, UserConduitProgress> = {};
      (data || []).forEach((p) => {
        progress[p.conduit_id] = {
          conduitId: p.conduit_id,
          discoveredAt: p.discovered_at ? new Date(p.discovered_at) : null,
          completedAt: p.completed_at ? new Date(p.completed_at) : null,
          candleCollected: p.candle_collected,
        };
      });
      return progress;
    },
    enabled: !!user,
  });

  const discoverMutation = useMutation({
    mutationFn: async (conduitId: string) => {
      if (!user) return;

      await supabase.from("user_conduit_progress").upsert({
        user_id: user.id,
        conduit_id: conduitId,
        discovered_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conduit-progress"] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (conduitId: string) => {
      if (!user) return;

      await supabase
        .from("user_conduit_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("conduit_id", conduitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conduit-progress"] });
    },
  });

  const collectCandleMutation = useMutation({
    mutationFn: async (conduitId: string) => {
      if (!user) return;

      await supabase
        .from("user_conduit_progress")
        .update({ candle_collected: true })
        .eq("user_id", user.id)
        .eq("conduit_id", conduitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conduit-progress"] });
    },
  });

  const getConduitByMirror = useCallback(
    (location: string) => {
      return conduits.find(
        (c) => c.mirrorALocation === location || c.mirrorBLocation === location
      );
    },
    [conduits]
  );

  const isConduitDiscovered = useCallback(
    (conduitId: string) => {
      return !!userProgress[conduitId]?.discoveredAt;
    },
    [userProgress]
  );

  const isConduitCompleted = useCallback(
    (conduitId: string) => {
      return !!userProgress[conduitId]?.completedAt;
    },
    [userProgress]
  );

  const startTravel = useCallback((from: string, to: string) => {
    setIsTraveling(true);
    setTravelDestination(to);

    setTimeout(() => {
      setIsTraveling(false);
      setTravelDestination(null);
    }, 2000);
  }, []);

  return (
    <MirrorContext.Provider
      value={{
        conduits,
        userProgress,
        activeMirror,
        setActiveMirror,
        discoverConduit: discoverMutation.mutate,
        completeConduit: completeMutation.mutate,
        collectCandle: collectCandleMutation.mutate,
        getConduitByMirror,
        isConduitDiscovered,
        isConduitCompleted,
        isTraveling,
        startTravel,
        travelDestination,
      }}
    >
      {children}
    </MirrorContext.Provider>
  );
}

export function useMirrorConduit() {
  const context = useContext(MirrorContext);
  if (!context) {
    throw new Error("useMirrorConduit must be used within MirrorConduitProvider");
  }
  return context;
}

export { DIFFICULTY_LABELS };
