import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MembershipTier = "free" | "member" | "builder" | "patron";

export interface MembershipSubscription {
  tier: MembershipTier;
  status: string;
  price_usd: number | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
}

export function useMembership() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["membership-subscription", user?.id],
    queryFn: async (): Promise<MembershipSubscription> => {
      if (!user) return { tier: "free", status: "none", price_usd: null, current_period_end: null, cancel_at_period_end: false, stripe_customer_id: null };

      const { data, error } = await supabase
        .from("membership_subscriptions" as never)
        .select("tier, status, price_usd, current_period_end, cancel_at_period_end, stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle() as { data: MembershipSubscription | null; error: any };

      if (error || !data) {
        return { tier: "free", status: "none", price_usd: null, current_period_end: null, cancel_at_period_end: false, stripe_customer_id: null };
      }

      return data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (params: { type: "membership" | "credits"; tier?: string; quantity?: number }) => {
      const { data, error } = await supabase.functions.invoke(
        "stripe-create-checkout-session",
        { body: params }
      );
      if (error) throw error;
      const body = data as { url?: string; error?: string };
      if (body.error) throw new Error(body.error);
      if (body.url) window.location.href = body.url;
      return body;
    },
  });
}

export function useManageSubscription() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "stripe-create-portal-session",
        { body: {} }
      );
      if (error) throw error;
      const body = data as { url?: string; error?: string };
      if (body.error) throw new Error(body.error);
      if (body.url) window.location.href = body.url;
      return body;
    },
  });
}
