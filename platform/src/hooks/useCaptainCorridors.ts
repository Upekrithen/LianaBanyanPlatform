import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CaptainCorridor {
  id: string;
  captain_id: string;
  name: string;
  description: string | null;
  status: "active" | "completed" | "paused";
  created_at: string;
}

export interface CorridorBusiness {
  id: string;
  corridor_id: string;
  business_name: string;
  address: string | null;
  category: "food" | "service" | "retail" | "manufacturing" | "other";
  status: "onboarded" | "campaign_active" | "not_approached" | "declined" | "corporate_skip";
  campaign_id: string | null;
  onboarded_at: string | null;
  created_at: string;
}

export interface CorridorWithStats extends CaptainCorridor {
  businesses: CorridorBusiness[];
  onboarded: number;
  campaignActive: number;
  notApproached: number;
  declined: number;
  corporateSkip: number;
  total: number;
  progressPct: number;
}

export function useCaptainCorridors() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["captain-corridors", user?.id],
    queryFn: async () => {
      const { data: corridors, error: cErr } = await supabase
        .from("captain_corridors" as any)
        .select("*")
        .eq("captain_id", user!.id)
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;

      const corridorIds = (corridors ?? []).map((c: any) => c.id);

      let businesses: CorridorBusiness[] = [];
      if (corridorIds.length > 0) {
        const { data: biz, error: bErr } = await supabase
          .from("corridor_businesses" as any)
          .select("*")
          .in("corridor_id", corridorIds);
        if (bErr) throw bErr;
        businesses = (biz ?? []) as CorridorBusiness[];
      }

      return (corridors ?? []).map((c: any): CorridorWithStats => {
        const cBiz = businesses.filter((b) => b.corridor_id === c.id);
        const onboarded = cBiz.filter((b) => b.status === "onboarded").length;
        const campaignActive = cBiz.filter((b) => b.status === "campaign_active").length;
        const notApproached = cBiz.filter((b) => b.status === "not_approached").length;
        const declined = cBiz.filter((b) => b.status === "declined").length;
        const corporateSkip = cBiz.filter((b) => b.status === "corporate_skip").length;
        const total = cBiz.length;
        const actionable = total - corporateSkip;
        const progressPct = actionable > 0 ? Math.round((onboarded / actionable) * 100) : 0;

        return {
          ...c,
          businesses: cBiz,
          onboarded,
          campaignActive,
          notApproached,
          declined,
          corporateSkip,
          total,
          progressPct,
        };
      });
    },
    enabled: !!user,
  });
}

export function useAddCorridor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("captain_corridors" as any)
        .insert({
          captain_id: user.id,
          name: input.name,
          description: input.description || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as CaptainCorridor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captain-corridors"] });
    },
  });
}

export function useAddCorridorBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      corridor_id: string;
      business_name: string;
      address?: string;
      category?: CorridorBusiness["category"];
    }) => {
      const { data, error } = await supabase
        .from("corridor_businesses" as any)
        .insert({
          corridor_id: input.corridor_id,
          business_name: input.business_name,
          address: input.address || null,
          category: input.category || "other",
        })
        .select()
        .single();
      if (error) throw error;
      return data as CorridorBusiness;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captain-corridors"] });
    },
  });
}

export function useUpdateCorridorBusinessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      status,
    }: {
      businessId: string;
      status: CorridorBusiness["status"];
    }) => {
      const update: Record<string, unknown> = { status };
      if (status === "onboarded") {
        update.onboarded_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from("corridor_businesses" as any)
        .update(update)
        .eq("id", businessId)
        .select()
        .single();
      if (error) throw error;
      return data as CorridorBusiness;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captain-corridors"] });
    },
  });
}
