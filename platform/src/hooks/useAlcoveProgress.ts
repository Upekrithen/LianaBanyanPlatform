import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ALCOVES, ALCOVE_REWARDS, PATTERN_KEYS, type Alcove, type AlcoveTier, type PatternKeyLevel } from "@/lib/alcoveSystem";

type AlcoveProgressRow = {
  stop_slug: string;
  tier: number;
  visited_at: string | null;
  comprehended_at: string | null;
  marks_awarded: number | null;
};

export type AlcoveProgressItem = {
  alcove: Alcove;
  visited: boolean;
  comprehended: boolean;
  marksAwarded: number;
  visitedAt: string | null;
  comprehendedAt: string | null;
};

export type UseAlcoveProgressResult = {
  isLoading: boolean;
  stops: AlcoveProgressItem[];
  completedCount: number;
  currentTier: AlcoveTier;
  totalMarks: number;
  patternKeys: PatternKeyLevel[];
  foundersForgeUnlocked: boolean;
  markVisited: (alcove: Alcove) => Promise<void>;
  markComprehended: (alcove: Alcove) => Promise<void>;
};

export function useAlcoveProgress(): UseAlcoveProgressResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["alcove-progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alcove_progress" as never)
        .select("stop_slug,tier,visited_at,comprehended_at,marks_awarded")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []) as AlcoveProgressRow[];
    },
    staleTime: 15_000,
  });

  const rowBySlug = useMemo(() => {
    const map = new Map<string, AlcoveProgressRow>();
    (data ?? []).forEach((row) => map.set(row.stop_slug, row));
    return map;
  }, [data]);

  const stops = useMemo<AlcoveProgressItem[]>(() => {
    return ALCOVES.map((alcove) => {
      const row = rowBySlug.get(alcove.id);
      return {
        alcove,
        visited: !!row?.visited_at,
        comprehended: !!row?.comprehended_at,
        marksAwarded: Number(row?.marks_awarded ?? 0),
        visitedAt: row?.visited_at ?? null,
        comprehendedAt: row?.comprehended_at ?? null,
      };
    });
  }, [rowBySlug]);

  const completedCount = useMemo(() => stops.filter((s) => s.comprehended).length, [stops]);

  const currentTier = useMemo<AlcoveTier>(() => {
    if (completedCount >= 12) return 3;
    if (completedCount >= 6) return 2;
    return 1;
  }, [completedCount]);

  const patternKeys = useMemo<PatternKeyLevel[]>(() => {
    const result: PatternKeyLevel[] = [];
    ([1, 2, 3] as const).forEach((tier) => {
      const done = stops.filter((s) => s.alcove.tier === tier).every((s) => s.comprehended);
      if (done) result.push(PATTERN_KEYS[tier]);
    });
    return result;
  }, [stops]);

  const totalMarks = useMemo(() => {
    const base = stops.reduce((sum, stop) => sum + stop.marksAwarded, 0);
    const tierBonus = patternKeys.length * ALCOVE_REWARDS.tierComplete;
    const allCompleteBonus = completedCount === 18 ? ALCOVE_REWARDS.allComplete : 0;
    return base + tierBonus + allCompleteBonus;
  }, [stops, patternKeys, completedCount]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["alcove-progress", user?.id] });
  };

  const markVisited = async (alcove: Alcove) => {
    if (!user?.id) return;
    const existing = rowBySlug.get(alcove.id);
    const existingMarks = Number(existing?.marks_awarded ?? 0);
    const nextMarks = Math.max(existingMarks, ALCOVE_REWARDS.visit);
    await supabase.from("alcove_progress" as never).upsert(
      {
        user_id: user.id,
        stop_slug: alcove.id,
        tier: alcove.tier,
        visited_at: existing?.visited_at ?? new Date().toISOString(),
        marks_awarded: nextMarks,
      } as never,
      { onConflict: "user_id,stop_slug" },
    );
    await refresh();
  };

  const markComprehended = async (alcove: Alcove) => {
    if (!user?.id) return;
    const existing = rowBySlug.get(alcove.id);
    const visitReward = ALCOVE_REWARDS.visit;
    const questionRewards = alcove.questions.reduce((sum, q) => sum + q.reward, 0);
    const maxReward = visitReward + questionRewards;
    const existingMarks = Number(existing?.marks_awarded ?? 0);
    await supabase.from("alcove_progress" as never).upsert(
      {
        user_id: user.id,
        stop_slug: alcove.id,
        tier: alcove.tier,
        visited_at: existing?.visited_at ?? new Date().toISOString(),
        comprehended_at: new Date().toISOString(),
        marks_awarded: Math.max(existingMarks, maxReward),
      } as never,
      { onConflict: "user_id,stop_slug" },
    );
    await refresh();
  };

  return {
    isLoading,
    stops,
    completedCount,
    currentTier,
    totalMarks,
    patternKeys,
    foundersForgeUnlocked: completedCount === 18,
    markVisited,
    markComprehended,
  };
}

