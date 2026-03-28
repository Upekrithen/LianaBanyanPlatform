import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CaptainOrderAssignment {
  id: string;
  captain_id: string;
  project_id: string | null;
  batch_description: string;
  total_units: number;
  total_fiat_value: number;
  marks_staked: number;
  recipients_total: number;
  confirmations_received: number;
  confirmation_threshold: number;
  status: "active" | "shipped" | "confirmed" | "failed" | "disputed";
  fulfillment_deadline: string;
  created_at: string;
}

export function useCaptainOrders(captainId: string | undefined) {
  return useQuery({
    queryKey: ["captain-orders", captainId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("captain_order_assignments")
        .select("*")
        .eq("captain_id", captainId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CaptainOrderAssignment[];
    },
    enabled: !!captainId,
  });
}
