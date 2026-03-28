import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreditPurchase {
  id: string;
  user_id: string;
  amount_credits: number;
  amount_usd: number;
  stripe_session_id: string | null;
  status: string;
  package_size: string | null;
  bonus_pct: number;
  created_at: string;
}

export function useCreditBalance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["credit-balance", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("transaction_ledger" as any)
        .select("amount")
        .eq("user_id", user.id)
        .in("ledger_category", [
          "project_funder_credit",
          "commerce_creator",
          "project_funding",
        ]);
      if (error) return 0;
      const total = (data ?? []).reduce(
        (sum: number, r: { amount: number }) => sum + (r.amount ?? 0),
        0
      );
      return Math.max(0, total);
    },
    enabled: !!user,
  });
}

export function usePurchaseHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["credit-purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("credit_purchases" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data ?? []) as CreditPurchase[];
    },
    enabled: !!user,
  });
}

export function useBuyCredits() {
  return useMutation({
    mutationFn: async (packageSize: string) => {
      const { data, error } = await supabase.functions.invoke(
        "create-credit-checkout",
        { body: { package_size: packageSize } }
      );
      if (error) throw error;
      const body = data as { url?: string; error?: string };
      if (body.error) throw new Error(body.error);
      if (body.url) {
        window.location.href = body.url;
      }
      return body;
    },
  });
}
