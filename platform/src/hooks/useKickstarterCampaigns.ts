/**
 * useKickstarterCampaigns — Extended hooks for Kickstarter campaign pages
 * ========================================================================
 * Builds on useChainDashboard (K144) with pledge mutations, single-campaign
 * lookup, and per-campaign bounty queries.
 *
 * K146 / Bishop 036
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  type KickstarterCampaign,
  type ChainLink,
  useChainStatus,
  useCampaigns,
} from "@/hooks/useChainDashboard";

export { useChainStatus, useCampaigns };
export type { KickstarterCampaign, ChainLink };

const BONUS_PER_LINK = 5;
const CHAIN_TIMER_DAYS = 14;

export interface RewardTier {
  id: string;
  name: string;
  price: number;
  earlyBirdPrice?: number;
  earlyBirdLimit?: number;
  description: string;
  includes: string[];
}

export const REWARD_TIERS: RewardTier[] = [
  {
    id: "digital",
    name: "Digital Explorer",
    price: 5,
    description: "Get the STL file, spec card, and your first chain link.",
    includes: ["STL file download", "Digital spec card", "Chain link"],
  },
  {
    id: "single",
    name: "Single Unit",
    price: 15,
    earlyBirdPrice: 12,
    earlyBirdLimit: 100,
    description: "One physical unit with spec card and chain link.",
    includes: ["1 physical unit", "Printed spec card", "Chain link"],
  },
  {
    id: "pair",
    name: "Pair",
    price: 25,
    description: "Two units — one to keep, one to share.",
    includes: ["2 physical units", "Chain link"],
  },
  {
    id: "starter-island",
    name: "Starter Island",
    price: 50,
    description: "Seven units with pouch, Cue Card deck, and chain link.",
    includes: ["7 physical units", "Carry pouch", "Cue Card deck", "Chain link"],
  },
  {
    id: "builder",
    name: "Builder",
    price: 100,
    description: "Nineteen units, premium case, founding badge, and full deck.",
    includes: [
      "19 physical units",
      "Premium case",
      "Founding badge",
      "Cue Card deck",
      "Chain link",
    ],
  },
  {
    id: "architect",
    name: "Architect",
    price: 250,
    description:
      "Thirty-seven units, premium case, 1-year membership, and your name in credits.",
    includes: [
      "37 physical units",
      "Premium display case",
      "1-year LB membership",
      "Name in credits",
      "Chain link",
    ],
  },
];

export function useCampaign(slug: string | undefined) {
  const { campaigns, isLoading } = useCampaigns();
  const campaign = campaigns.find((c) => c.slug === slug) ?? null;
  return { campaign, campaigns, isLoading };
}

export function useMyPledges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-pledges", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("chain_links")
        .select("*, kickstarter_campaigns(*)")
        .eq("user_id", user!.id)
        .order("chain_position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<
        ChainLink & { kickstarter_campaigns: KickstarterCampaign }
      >;
    },
    enabled: !!user,
  });
}

export function usePledge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      tierId,
      amount,
    }: {
      campaignId: string;
      tierId: string;
      amount: number;
    }) => {
      if (!user) throw new Error("Must be logged in to pledge");

      const { data: existingChain } = await (supabase as any)
        .from("member_chains")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const nextPosition = (existingChain?.chain_length ?? 0) + 1;
      const nextBonus = nextPosition * BONUS_PER_LINK;
      const expiresAt = new Date(
        Date.now() + CHAIN_TIMER_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error: linkError } = await (supabase as any)
        .from("chain_links")
        .insert({
          user_id: user.id,
          campaign_id: campaignId,
          pledge_amount: amount,
          pledge_tier: tierId,
          chain_position: nextPosition,
          bonus_pct: nextBonus,
        });
      if (linkError) throw linkError;

      if (existingChain) {
        const { error: chainError } = await (supabase as any)
          .from("member_chains")
          .update({
            chain_length: nextPosition,
            max_chain_length: Math.max(
              existingChain.max_chain_length,
              nextPosition
            ),
            current_bonus_pct: nextBonus,
            chain_expires_at: expiresAt,
            last_backed_campaign: nextPosition,
          })
          .eq("user_id", user.id);
        if (chainError) throw chainError;
      } else {
        const { error: chainError } = await (supabase as any)
          .from("member_chains")
          .insert({
            user_id: user.id,
            chain_length: 1,
            max_chain_length: 1,
            current_bonus_pct: BONUS_PER_LINK,
            chain_expires_at: expiresAt,
            last_backed_campaign: 1,
          });
        if (chainError) throw chainError;
      }

      return { position: nextPosition, bonus: nextBonus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-chain"] });
      queryClient.invalidateQueries({ queryKey: ["chain-links"] });
      queryClient.invalidateQueries({ queryKey: ["my-pledges"] });
      queryClient.invalidateQueries({ queryKey: ["kickstarter-campaigns"] });
    },
  });
}

export function useCampaignBounties(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["campaign-bounties", campaignId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("bounties")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!campaignId,
  });
}
