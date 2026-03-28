import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ShareChain {
  id: string;
  user_id: string;
  current_streak: number;
  highest_streak: number;
  bonus_pct: number;
  sustained: boolean;
  last_share_at: string | null;
  chain_expires_at: string | null;
  total_shares: number;
  total_bonus_points: number;
  total_bonus_marks: number;
  created_at: string;
  updated_at: string;
}

function computeChainBonus(streak: number, sustained: boolean): number {
  if (sustained) return 20;
  return Math.min(streak * 5, 100);
}

function computeChainExpiry(engagement: {
  views: number;
  clicks: number;
}): string {
  const baseHours = 48;
  const viewBonus = Math.floor(engagement.views / 10);
  const clickBonus = engagement.clicks * 4;
  const totalHours = Math.min(baseHours + viewBonus + clickBonus, 168);
  return new Date(Date.now() + totalHours * 3_600_000).toISOString();
}

export function useShareChain() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["share-chain", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("share_chains" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as ShareChain | null;
    },
    enabled: !!user,
  });

  const recordShare = useMutation({
    mutationFn: async (engagement?: { views: number; clicks: number }) => {
      if (!user) throw new Error("Must be logged in");
      const eng = engagement ?? { views: 0, clicks: 0 };

      const existing = query.data;
      const now = new Date().toISOString();
      const newExpiry = computeChainExpiry(eng);

      if (!existing) {
        const bonus = computeChainBonus(1, false);
        const { data, error } = await supabase
          .from("share_chains" as any)
          .insert({
            user_id: user.id,
            current_streak: 1,
            highest_streak: 1,
            bonus_pct: bonus,
            sustained: false,
            last_share_at: now,
            chain_expires_at: newExpiry,
            total_shares: 1,
          })
          .select()
          .single();
        if (error) throw error;
        return data as ShareChain;
      }

      const chainAlive =
        existing.chain_expires_at != null &&
        new Date(existing.chain_expires_at) > new Date();

      let newStreak: number;
      let sustained = existing.sustained;

      if (chainAlive) {
        newStreak = existing.current_streak + 1;
      } else {
        newStreak = 1;
        sustained = false;
      }

      if (newStreak >= 21 && !sustained) {
        sustained = true;
        newStreak = 0;
      }

      const bonus = computeChainBonus(newStreak, sustained);
      const highestStreak = Math.max(existing.highest_streak, newStreak);

      const { data, error } = await supabase
        .from("share_chains" as any)
        .update({
          current_streak: newStreak,
          highest_streak: highestStreak,
          bonus_pct: bonus,
          sustained,
          last_share_at: now,
          chain_expires_at: newExpiry,
          total_shares: existing.total_shares + 1,
          updated_at: now,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as ShareChain;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["share-chain"] });
    },
  });

  const chain = query.data;
  const isAlive =
    chain?.chain_expires_at != null &&
    new Date(chain.chain_expires_at) > new Date();

  const hoursRemaining =
    chain?.chain_expires_at != null
      ? Math.max(
          0,
          Math.round(
            (new Date(chain.chain_expires_at).getTime() - Date.now()) /
              3_600_000,
          ),
        )
      : 0;

  return {
    chain,
    isAlive,
    hoursRemaining,
    bonusPct: chain?.bonus_pct ?? 0,
    streak: chain?.current_streak ?? 0,
    isSustained: chain?.sustained ?? false,
    recordShare: recordShare.mutateAsync,
    isRecording: recordShare.isPending,
    isLoading: query.isLoading,
  };
}
