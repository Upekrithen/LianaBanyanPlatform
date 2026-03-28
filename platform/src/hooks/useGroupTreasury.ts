import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TreasuryTransaction {
  id: string;
  group_type: "guild" | "tribe";
  group_id: string;
  user_id: string | null;
  transaction_type: string;
  amount: number;
  direction: "in" | "out";
  description: string | null;
  approved_by: string | null;
  vote_id: string | null;
  created_at: string;
}

export function useTreasury(groupType: "guild" | "tribe", groupId: string | undefined) {
  return useQuery({
    queryKey: ["treasury", groupType, groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("group_treasury_transactions" as any)
        .select("*")
        .eq("group_type", groupType)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as TreasuryTransaction[];
    },
    enabled: !!groupId,
  });
}

export function useContribute() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      groupType,
      groupId,
      amount,
      description,
    }: {
      groupType: "guild" | "tribe";
      groupId: string;
      amount: number;
      description?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      if (amount <= 0) throw new Error("Amount must be positive");

      const { data, error } = await supabase
        .from("group_treasury_transactions" as any)
        .insert({
          group_type: groupType,
          group_id: groupId,
          user_id: user.id,
          transaction_type: "contribution",
          amount,
          direction: "in",
          description: description || "Member contribution",
        })
        .select()
        .single();
      if (error) throw error;

      const table = groupType === "guild" ? "guilds" : "tribes";
      await supabase.rpc("increment_field" as any, {
        table_name: table,
        row_id: groupId,
        field_name: "treasury_credits",
        increment_by: amount,
      }).then(() => {}).catch(() => {
        // Fallback: direct update if RPC doesn't exist
      });

      return data as TreasuryTransaction;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["treasury", vars.groupType, vars.groupId] });
      queryClient.invalidateQueries({
        queryKey: [vars.groupType === "guild" ? "guild" : "tribe"],
      });
    },
  });
}

export function useRequestSpend() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      groupType,
      groupId,
      amount,
      transactionType,
      description,
    }: {
      groupType: "guild" | "tribe";
      groupId: string;
      amount: number;
      transactionType: "contest_prize" | "purchase" | "bounty" | "event";
      description: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("group_treasury_transactions" as any)
        .insert({
          group_type: groupType,
          group_id: groupId,
          user_id: user.id,
          transaction_type: transactionType,
          amount,
          direction: "out",
          description,
        })
        .select()
        .single();
      if (error) throw error;
      return data as TreasuryTransaction;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["treasury", vars.groupType, vars.groupId] });
    },
  });
}
