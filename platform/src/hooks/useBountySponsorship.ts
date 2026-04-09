/**
 * useBountySponsorship — K150 hook for bounty sponsorship CRUD.
 * Manages bounty_sponsorships table: create, list, update status.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BountySponsorship {
  id: string;
  sponsor_id: string;
  bounty_type: string;
  bounty_id: string;
  project_id: string | null;
  project_type: string | null;
  amount_credits: number;
  amount_marks_equivalent: number;
  payment_method: "credits" | "fiat_stripe" | "lb_card";
  ownership_transfer: boolean;
  license_type: string;
  ambassador_chain_id: string | null;
  captain_tier: string | null;
  plant_a_seed_id: string | null;
  status: "pledged" | "escrowed" | "released" | "refunded" | "disputed";
  created_at: string;
  completed_at: string | null;
}

export function useMySponsorships() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bounty-sponsorships", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bounty_sponsorships" as never)
        .select("*")
        .eq("sponsor_id", user!.id)
        .order("created_at", { ascending: false }) as { data: BountySponsorship[] | null };
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateSponsorship() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      bounty_type: string;
      bounty_id: string;
      amount_credits: number;
      amount_marks_equivalent: number;
      payment_method: "credits" | "fiat_stripe" | "lb_card";
      project_id?: string;
      project_type?: string;
      ownership_transfer?: boolean;
      license_type?: string;
      ambassador_chain_id?: string;
      captain_tier?: string;
      plant_a_seed_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("bounty_sponsorships" as never)
        .insert({
          sponsor_id: user!.id,
          bounty_type: params.bounty_type,
          bounty_id: params.bounty_id,
          amount_credits: params.amount_credits,
          amount_marks_equivalent: params.amount_marks_equivalent,
          payment_method: params.payment_method,
          project_id: params.project_id || null,
          project_type: params.project_type || null,
          ownership_transfer: params.ownership_transfer || false,
          license_type: params.license_type || "platform_use",
          ambassador_chain_id: params.ambassador_chain_id || null,
          captain_tier: params.captain_tier || null,
          plant_a_seed_id: params.plant_a_seed_id || null,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BountySponsorship;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bounty-sponsorships"] });
    },
  });
}

export function useUpdateSponsorshipStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: BountySponsorship["status"] }) => {
      const update: Record<string, unknown> = { status: params.status };
      if (params.status === "released") update.completed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("bounty_sponsorships" as never)
        .update(update as never)
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BountySponsorship;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bounty-sponsorships"] });
    },
  });
}
