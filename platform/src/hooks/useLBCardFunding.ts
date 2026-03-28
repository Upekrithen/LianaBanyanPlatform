import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FundingSchedule {
  id: string;
  funder_id: string;
  recipient_id: string;
  card_serial: string | null;
  stripe_subscription_id: string | null;
  amount: number;
  currency: string;
  frequency: string;
  purpose: string | null;
  purpose_note: string | null;
  status: string;
  next_funding_at: string | null;
  last_funded_at: string | null;
  total_funded: number;
  funding_count: number;
  created_at: string;
  updated_at: string;
}

export interface FundingTransaction {
  id: string;
  schedule_id: string | null;
  funder_id: string;
  recipient_id: string;
  amount: number;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  purpose: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface FundingSource {
  id: string;
  card_owner_id: string;
  authorized_funder_id: string;
  authorized_at: string;
  revoked_at: string | null;
}

const QK = {
  schedules: (role: string, uid?: string) => ["lb-funding-schedules", role, uid],
  schedule: (id: string) => ["lb-funding-schedule", id],
  transactions: (scheduleId?: string) => ["lb-funding-txns", scheduleId],
  funders: (uid?: string) => ["lb-authorized-funders", uid],
};

export function useFundingSchedules(role: "funder" | "recipient") {
  const { user } = useAuth();
  return useQuery({
    queryKey: QK.schedules(role, user?.id),
    queryFn: async (): Promise<FundingSchedule[]> => {
      if (!user) return [];
      const col = role === "funder" ? "funder_id" : "recipient_id";
      const { data, error } = await supabase
        .from("lb_card_funding_schedules" as never)
        .select("*")
        .eq(col, user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FundingSchedule[];
    },
    enabled: !!user,
  });
}

export function useFundingSchedule(id: string) {
  return useQuery({
    queryKey: QK.schedule(id),
    queryFn: async (): Promise<FundingSchedule | null> => {
      const { data, error } = await supabase
        .from("lb_card_funding_schedules" as never)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as FundingSchedule | null;
    },
    enabled: !!id,
  });
}

export function useCreateFundingSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      recipient_id: string;
      amount: number;
      frequency: string;
      purpose?: string;
      purpose_note?: string;
      card_serial?: string;
      funding_relationship?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "create-funding-schedule",
        { body: params },
      );
      if (error) throw error;
      const body = data as { error?: string; schedule?: FundingSchedule };
      if (body.error) throw new Error(body.error);
      return body.schedule!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lb-funding-schedules"] });
    },
  });
}

export function usePauseFundingSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "pause" | "resume";
    }) => {
      const newStatus = action === "pause" ? "paused" : "active";
      const { error } = await supabase
        .from("lb_card_funding_schedules" as never)
        .update({ status: newStatus } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lb-funding-schedules"] });
    },
  });
}

export function useCancelFundingSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lb_card_funding_schedules" as never)
        .update({ status: "cancelled" } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lb-funding-schedules"] });
    },
  });
}

export function useFundingTransactions(scheduleId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: QK.transactions(scheduleId),
    queryFn: async (): Promise<FundingTransaction[]> => {
      if (!user) return [];
      let q = supabase
        .from("lb_card_funding_transactions" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (scheduleId) {
        q = q.eq("schedule_id", scheduleId);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as FundingTransaction[];
    },
    enabled: !!user,
  });
}

export function useAuthorizedFunders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: QK.funders(user?.id),
    queryFn: async (): Promise<FundingSource[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("lb_card_funding_sources" as never)
        .select("*")
        .eq("card_owner_id", user.id)
        .is("revoked_at", null);
      if (error) throw error;
      return (data ?? []) as FundingSource[];
    },
    enabled: !!user,
  });
}

export function useAuthorizeFunder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (funderUserId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("lb_card_funding_sources" as never)
        .upsert(
          {
            card_owner_id: user.id,
            authorized_funder_id: funderUserId,
            authorized_at: new Date().toISOString(),
            revoked_at: null,
          } as never,
          { onConflict: "card_owner_id,authorized_funder_id" },
        )
        .select()
        .single();
      if (error) throw error;
      return data as FundingSource;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lb-authorized-funders"] });
    },
  });
}

export function useRevokeFunder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { error } = await supabase
        .from("lb_card_funding_sources" as never)
        .update({ revoked_at: new Date().toISOString() } as never)
        .eq("id", sourceId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lb-authorized-funders"] });
    },
  });
}
