import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BenefitTier {
  id: string;
  group_type: "guild" | "tribe";
  member_threshold: number;
  benefit_name: string;
  benefit_description: string;
  benefit_type: string;
  benefit_value: Record<string, any>;
  created_at: string;
}

const TIER_THRESHOLDS = [5, 10, 25, 50, 100] as const;

export function useGroupBenefits(groupType: "guild" | "tribe", groupId: string | undefined) {
  const tiersQuery = useQuery({
    queryKey: ["benefit-tiers", groupType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_benefit_tiers" as any)
        .select("*")
        .eq("group_type", groupType)
        .order("member_threshold", { ascending: true });
      if (error) throw error;
      return (data ?? []) as BenefitTier[];
    },
  });

  return tiersQuery;
}

export function useUnlockedBenefits(
  groupType: "guild" | "tribe",
  memberCount: number
) {
  const { data: tiers } = useGroupBenefits(groupType, "static");

  const unlocked = (tiers ?? []).filter((t) => memberCount >= t.member_threshold);
  const locked = (tiers ?? []).filter((t) => memberCount < t.member_threshold);

  return { unlocked, locked, allTiers: tiers ?? [] };
}

export function useNextBenefitTier(
  groupType: "guild" | "tribe",
  memberCount: number
) {
  const { data: tiers } = useGroupBenefits(groupType, "static");

  const next = (tiers ?? []).find((t) => t.member_threshold > memberCount) ?? null;
  const membersNeeded = next ? next.member_threshold - memberCount : 0;

  return { nextTier: next, membersNeeded };
}

export function useBenefitProgress(
  groupType: "guild" | "tribe",
  memberCount: number
) {
  const { data: tiers } = useGroupBenefits(groupType, "static");

  if (!tiers || tiers.length === 0) return { progress: 0, currentTierIndex: -1, totalTiers: 0 };

  let currentTierIndex = -1;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (memberCount >= tiers[i].member_threshold) {
      currentTierIndex = i;
      break;
    }
  }

  const totalTiers = tiers.length;
  const unlockedCount = currentTierIndex + 1;

  let progressToNext = 0;
  if (currentTierIndex < totalTiers - 1) {
    const currentThreshold = currentTierIndex >= 0 ? tiers[currentTierIndex].member_threshold : 0;
    const nextThreshold = tiers[currentTierIndex + 1].member_threshold;
    progressToNext = Math.min(
      100,
      Math.round(((memberCount - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    );
  } else if (currentTierIndex === totalTiers - 1) {
    progressToNext = 100;
  }

  return {
    progress: progressToNext,
    currentTierIndex,
    unlockedCount,
    totalTiers,
  };
}
