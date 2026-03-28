import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { BusinessCampaign } from "@/hooks/useBusinessCampaigns";

export type PipelineStage =
  | "early"
  | "rallying"
  | "ready_to_pitch"
  | "pitched"
  | "accepted"
  | "declined"
  | "onboarded";

export interface PipelineCampaign extends BusinessCampaign {
  stage: PipelineStage;
}

function deriveStage(c: BusinessCampaign): PipelineStage {
  if (c.status === "accepted" || c.status === "onboarded") return "onboarded";
  if (c.status === "declined") return "declined";
  if (c.status === "pitched") {
    if (c.accepted_at) return "onboarded";
    return "pitched";
  }
  if (c.pitched_at) return "pitched";

  const threshold = c.pledge_threshold || 30;
  const ratio = c.pledge_count / threshold;
  if (ratio >= 1) return "ready_to_pitch";
  if (ratio >= 0.33) return "rallying";
  return "early";
}

export function useCaptainPipeline() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["captain-pipeline", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_campaigns" as any)
        .select("*")
        .eq("captain_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const campaigns = (data ?? []) as BusinessCampaign[];
      return campaigns.map((c): PipelineCampaign => ({
        ...c,
        stage: deriveStage(c),
      }));
    },
    enabled: !!user,
  });
}

const STAGE_ORDER: Record<PipelineStage, number> = {
  ready_to_pitch: 0,
  rallying: 1,
  early: 2,
  pitched: 3,
  onboarded: 4,
  accepted: 5,
  declined: 6,
};

export function groupByStage(campaigns: PipelineCampaign[]) {
  const active = campaigns.filter(
    (c) => c.stage === "early" || c.stage === "rallying" || c.stage === "ready_to_pitch"
  );
  active.sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]);

  const pitched = campaigns.filter((c) => c.stage === "pitched");
  const onboarded = campaigns.filter((c) => c.stage === "onboarded");
  const declined = campaigns.filter((c) => c.stage === "declined");

  return { active, pitched, onboarded, declined };
}
