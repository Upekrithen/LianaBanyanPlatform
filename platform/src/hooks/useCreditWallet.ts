import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CreditWallet {
  balance: number;
  lifetime_purchased: number;
  lifetime_spent: number;
  lifetime_earned: number;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export function useCreditWallet() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["credit-wallet", user?.id],
    queryFn: async (): Promise<CreditWallet> => {
      if (!user) return { balance: 0, lifetime_purchased: 0, lifetime_spent: 0, lifetime_earned: 0 };

      const { data, error } = await supabase
        .from("credit_wallets" as never)
        .select("balance, lifetime_purchased, lifetime_spent, lifetime_earned")
        .eq("user_id", user.id)
        .maybeSingle() as { data: CreditWallet | null; error: any };

      if (error || !data) {
        return { balance: 0, lifetime_purchased: 0, lifetime_spent: 0, lifetime_earned: 0 };
      }
      return data;
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useCreditTransactions(limit = 25) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["credit-transactions", user?.id, limit],
    queryFn: async (): Promise<CreditTransaction[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("credit_transactions" as never)
        .select("id, amount, type, description, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit) as { data: CreditTransaction[] | null; error: any };

      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
  });
}
