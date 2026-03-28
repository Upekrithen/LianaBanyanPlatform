import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DemandSignal {
  id: string;
  merchant_name: string;
  merchant_category: string | null;
  approximate_location: string | null;
  unique_cardholders: number;
  monthly_spend_estimate: number;
  last_updated: string;
  status: "unassigned" | "campaign_created" | "onboarded";
}

export function useDemandSignals(statusFilter?: DemandSignal["status"]) {
  return useQuery({
    queryKey: ["demand-signals", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("demand_signals" as any)
        .select("*")
        .order("unique_cardholders", { ascending: false });

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DemandSignal[];
    },
  });
}
