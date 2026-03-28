import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PitchCOScenario, PitchCOResults } from "@/components/pitch/PitchContingencyOperator";

export interface SavedScenario {
  id: string;
  created_at: string;
  expires_at: string | null;
  user_id: string | null;
  session_id: string | null;
  campaign_id: string | null;
  business_type: string;
  scenario_name: string;
  discount_tier: string;
  weekly_orders: number;
  avg_order_value: number;
  delivery_pct: number;
  weekly_revenue: number | null;
  monthly_revenue: number | null;
  mark_earnings: number | null;
  promotion_level: string | null;
}

const SESSION_KEY = "lb_pitch_session_id";

function getSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function useSavedScenarios(campaignId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["saved-scenarios", user?.id, campaignId],
    queryFn: async () => {
      let q = supabase
        .from("saved_business_scenarios" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (user) {
        q = q.eq("user_id", user.id);
      } else {
        q = q.eq("session_id", getSessionId());
      }

      if (campaignId) {
        q = q.eq("campaign_id", campaignId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as SavedScenario[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (input: {
      scenario: PitchCOScenario & PitchCOResults;
      campaignId: string;
      businessType: string;
      name?: string;
      isMember?: boolean;
    }) => {
      const row: Record<string, unknown> = {
        campaign_id: input.campaignId,
        business_type: input.businessType,
        scenario_name: input.name || "Untitled Scenario",
        discount_tier: input.scenario.discountTier,
        weekly_orders: input.scenario.weeklyOrders,
        avg_order_value: input.scenario.avgOrderValue,
        delivery_pct: input.scenario.deliveryPct,
        weekly_revenue: input.scenario.weeklyRevenue,
        monthly_revenue: input.scenario.monthlyRevenue,
        mark_earnings: input.scenario.markEarnings,
        promotion_level: input.scenario.promotionLevel,
      };

      if (user) {
        row.user_id = user.id;
        row.expires_at = input.isMember ? null : new Date(Date.now() + 24 * 3600_000).toISOString();
      } else {
        row.session_id = getSessionId();
        row.expires_at = new Date(Date.now() + 24 * 3600_000).toISOString();
      }

      const { data, error } = await supabase
        .from("saved_business_scenarios" as any)
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      return data as SavedScenario;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-scenarios"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_business_scenarios" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-scenarios"] });
    },
  });

  return {
    scenarios: query.data ?? [],
    isLoading: query.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    remove: deleteMutation.mutateAsync,
  };
}
