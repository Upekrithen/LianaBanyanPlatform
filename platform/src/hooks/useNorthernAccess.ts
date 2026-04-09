import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const REQUIRED_LEVEL = 60;
const TOTAL_LOCKS = 12;

export interface NorthernAccessResult {
  hasAccess: boolean;
  level: number;
  locksCompleted: number;
  totalLocks: number;
  isLoading: boolean;
}

export function useNorthernAccess(): NorthernAccessResult {
  const { user } = useAuth();

  const { data: level = 0, isLoading: levelLoading } = useQuery({
    queryKey: ["northern-access-level", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_scores")
        .select("total_xp")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      // Existing platform level semantics are not globally canonicalized in one table.
      // For gate checks we convert XP to an approximate level until a dedicated level field is standardized.
      const totalXp = Number(data?.total_xp ?? 0);
      return Math.max(0, Math.floor(totalXp / 1000));
    },
    staleTime: 60_000,
  });

  const { data: locksCompleted = 0, isLoading: locksLoading } = useQuery({
    queryKey: ["northern-access-locks", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // K349 introduces this table. If migration is not applied yet, fail closed to 0.
      const { count, error } = await supabase
        .from("snow_gate_progress" as never)
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) return 0;
      return Number(count ?? 0);
    },
    staleTime: 30_000,
  });

  return useMemo(() => {
    const hasAccess = !!user && level >= REQUIRED_LEVEL && locksCompleted >= TOTAL_LOCKS;
    return {
      hasAccess,
      level,
      locksCompleted,
      totalLocks: TOTAL_LOCKS,
      isLoading: !!user && (levelLoading || locksLoading),
    };
  }, [user, level, locksCompleted, levelLoading, locksLoading]);
}

