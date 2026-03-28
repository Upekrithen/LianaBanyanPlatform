import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EarningsSummary {
  totalEarned: number;
  availableToWithdraw: number;
  platformFee: number;
  netPayout: number;
  connectStatus: "connected" | "pending" | "none";
  payoutsEnabled: boolean;
}

export interface PayoutRecord {
  id: string;
  amount_cents: number;
  fee_cents: number;
  net_amount_cents: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export function useEarnings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["earnings-summary", user?.id],
    queryFn: async (): Promise<EarningsSummary> => {
      if (!user) {
        return { totalEarned: 0, availableToWithdraw: 0, platformFee: 0, netPayout: 0, connectStatus: "none", payoutsEnabled: false };
      }

      const { data: wallet } = await supabase
        .from("credit_wallets" as never)
        .select("lifetime_earned")
        .eq("user_id", user.id)
        .maybeSingle() as { data: { lifetime_earned: number } | null };

      // Sum credits earned from backing/reward transactions still in wallet
      const { data: available } = await supabase
        .from("credit_transactions" as never)
        .select("amount")
        .eq("user_id", user.id)
        .in("type", ["reward", "match"]) as { data: { amount: number }[] | null };

      const availableCredits = (available ?? []).reduce((s, r) => s + r.amount, 0);
      const earned = wallet?.lifetime_earned || 0;

      // Check Connect account
      const { data: connect } = await supabase
        .from("member_connect_accounts" as never)
        .select("onboarding_status, payouts_enabled")
        .eq("user_id", user.id)
        .maybeSingle() as { data: { onboarding_status: string; payouts_enabled: boolean } | null };

      const platformFee = Math.round(availableCredits * 0.167);
      const netPayout = availableCredits - platformFee;

      return {
        totalEarned: earned,
        availableToWithdraw: Math.max(0, availableCredits),
        platformFee,
        netPayout: Math.max(0, netPayout),
        connectStatus: connect?.onboarding_status === "complete" ? "connected" : connect ? "pending" : "none",
        payoutsEnabled: connect?.payouts_enabled ?? false,
      };
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function usePayoutHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["payout-history", user?.id],
    queryFn: async (): Promise<PayoutRecord[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("member_payouts" as never)
        .select("id, amount_cents, fee_cents, net_amount_cents, status, created_at, completed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25) as { data: PayoutRecord[] | null; error: any };

      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useRequestPayout() {
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data, error } = await supabase.functions.invoke(
        "stripe-connect-payout",
        { body: { amount } }
      );
      if (error) throw error;
      const body = data as { success?: boolean; error?: string; net_payout_usd?: string };
      if (body.error) throw new Error(body.error);
      return body;
    },
  });
}
