import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LeadershipPedestal {
  id: string;
  seat_title: string;
  seat_type: "crown" | "board" | "advisory" | "ambassador" | "captain_regional";
  initiative: string | null;
  invited_name: string;
  invited_description: string | null;
  invited_image_url: string | null;
  letter_summary: string | null;
  support_count: number;
  status: "invited" | "accepted" | "active" | "declined" | "open";
  claimed_by: string | null;
  claimed_at: string | null;
  tier: "shield" | "spear" | "phalanx" | null;
  circle: string | null;
  created_at: string;
}

export function usePedestals(filters?: { seat_type?: string; tier?: string }) {
  return useQuery({
    queryKey: ["leadership-pedestals", filters],
    queryFn: async () => {
      let q = supabase
        .from("leadership_pedestals")
        .select("*")
        .order("support_count", { ascending: false });

      if (filters?.seat_type) q = q.eq("seat_type", filters.seat_type);
      if (filters?.tier) q = q.eq("tier", filters.tier);

      const { data, error } = await q;
      if (error) throw error;
      return data as LeadershipPedestal[];
    },
  });
}

export function usePedestal(id: string | undefined) {
  return useQuery({
    queryKey: ["leadership-pedestal", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leadership_pedestals")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as LeadershipPedestal;
    },
    enabled: !!id,
  });
}

export function usePedestalSignals(pedestalId: string | undefined) {
  return useQuery({
    queryKey: ["pedestal-signals", pedestalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedestal_support_signals")
        .select("*")
        .eq("pedestal_id", pedestalId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string;
        pedestal_id: string;
        user_id: string;
        signal_type: "support" | "comment";
        comment_text: string | null;
        created_at: string;
      }>;
    },
    enabled: !!pedestalId,
  });
}

export function useSupportPedestal() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pedestalId,
      commentText,
    }: {
      pedestalId: string;
      commentText?: string;
    }) => {
      if (!user) throw new Error("Must be signed in to support");

      const { error } = await supabase.from("pedestal_support_signals").upsert(
        {
          pedestal_id: pedestalId,
          user_id: user.id,
          signal_type: "support",
          comment_text: commentText ?? null,
        },
        { onConflict: "pedestal_id,user_id,signal_type" }
      );
      if (error) throw error;

      await supabase.rpc("increment_field", {
        table_name: "leadership_pedestals",
        field_name: "support_count",
        row_id: pedestalId,
      }).then(() => {});
    },
    onSuccess: () => {
      toast.success("Your support has been recorded!");
      qc.invalidateQueries({ queryKey: ["leadership-pedestals"] });
      qc.invalidateQueries({ queryKey: ["pedestal-signals"] });
    },
    onError: (err: Error) => {
      if (err.message.includes("duplicate")) {
        toast.info("You've already supported this appointment.");
      } else {
        toast.error(err.message);
      }
    },
  });
}
