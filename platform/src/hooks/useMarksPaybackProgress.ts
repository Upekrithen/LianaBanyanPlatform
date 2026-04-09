/**
 * useMarksPaybackProgress — K151 Marks Payback dashboard hook
 * Queries Marks earned in the current membership year to show
 * progress toward the 100-Mark free-renewal threshold.
 *
 * K157 fix: aligned with actual transaction_ledger schema
 * (payee_id/payer_id, amount_cents, currency, status).
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MarksPaybackProgress {
  marksEarned: number;
  qualifies: boolean;
  creditBalance: number;
  renewalDate: string | null;
}

export function useMarksPaybackProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["marks-payback-progress", user?.id],
    queryFn: async (): Promise<MarksPaybackProgress> => {
      if (!user) return { marksEarned: 0, qualifies: false, creditBalance: 0, renewalDate: null };

      const { data: membership } = await supabase
        .from("membership_subscriptions")
        .select("current_period_end, current_period_start")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      const renewalDate = membership?.current_period_end || null;
      const yearStart = membership?.current_period_start
        || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

      // Marks earned = rows where user is payee, currency=marks, status=completed
      const { count } = await supabase
        .from("transaction_ledger" as never)
        .select("*", { count: "exact", head: true })
        .eq("payee_id", user.id)
        .eq("currency", "marks")
        .eq("status", "completed")
        .gte("created_at", yearStart);

      const marksEarned = count || 0;

      // Credit balance = sum(payee amounts) - sum(payer amounts) in cents
      const { data: creditRows } = await supabase
        .from("transaction_ledger" as never)
        .select("amount_cents, payer_id, payee_id")
        .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
        .eq("currency", "credits")
        .eq("status", "completed");

      let balanceCents = 0;
      for (const row of (creditRows || []) as { amount_cents: number; payer_id: string; payee_id: string }[]) {
        if (row.payee_id === user.id) balanceCents += row.amount_cents || 0;
        if (row.payer_id === user.id) balanceCents -= row.amount_cents || 0;
      }
      const creditBalance = balanceCents / 100;

      return {
        marksEarned,
        qualifies: marksEarned >= 100 && creditBalance >= 5,
        creditBalance,
        renewalDate,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
