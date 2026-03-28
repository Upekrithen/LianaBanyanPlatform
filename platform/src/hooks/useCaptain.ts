import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CaptainProfile {
  id: string;
  user_id: string;
  level: "captain_10" | "captain_50" | "captain_100" | "captain_1000";
  marks_staked: number;
  joules_backing: number;
  orders_managed: number;
  orders_fulfilled: number;
  fulfillment_rate: number;
  reputation_score: number;
  region: string | null;
  city: string | null;
  status: "active" | "probation" | "suspended" | "graduated";
  medallion_produced: boolean;
  medallion_qr_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface LevelRequirement {
  level: string;
  min_marks_staked: number;
  min_orders_fulfilled: number;
  min_fulfillment_rate: number;
  min_reputation_score: number;
  max_concurrent_orders: number;
}

const LEVEL_ORDER: Record<string, number> = {
  captain_10: 0,
  captain_50: 1,
  captain_100: 2,
  captain_1000: 3,
};

export function useCaptain() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["captain-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("captains")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as CaptainProfile | null;
    },
    enabled: !!user,
  });

  const requirementsQuery = useQuery({
    queryKey: ["captain-level-requirements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("captain_level_requirements")
        .select("*")
        .order("min_marks_staked", { ascending: true });
      if (error) throw error;
      return data as LevelRequirement[];
    },
  });

  const captain = profileQuery.data;
  const requirements = requirementsQuery.data ?? [];

  const currentLevelIndex = captain ? LEVEL_ORDER[captain.level] ?? 0 : -1;
  const nextLevel = requirements[currentLevelIndex + 1] ?? null;

  return {
    captain,
    requirements,
    nextLevel,
    currentLevelIndex,
    isCaptain: !!captain,
    isLoading: profileQuery.isLoading,
  };
}
