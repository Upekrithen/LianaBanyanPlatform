import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface KickstarterCampaign {
  id: string;
  campaign_number: number;
  title: string;
  slug: string;
  product_type: "component" | "character" | "creature" | "assembly";
  status: "upcoming" | "live" | "funded" | "fulfilled" | "cancelled";
  goal_amount: number;
  raised_amount: number;
  backer_count: number;
  launch_date: string | null;
  end_date: string | null;
  fulfillment_date: string | null;
  kickstarter_url: string | null;
  created_at: string;
}

export interface MemberChain {
  id: string;
  user_id: string;
  chain_length: number;
  max_chain_length: number;
  current_bonus_pct: number;
  chain_expires_at: string | null;
  last_backed_campaign: number | null;
  created_at: string;
}

export interface ChainLink {
  id: string;
  user_id: string;
  campaign_id: string;
  backed_at: string;
  pledge_amount: number | null;
  pledge_tier: string | null;
  chain_position: number;
  bonus_pct: number;
}

export interface HexIsleDownload {
  id: string;
  piece_name: string;
  piece_slug: string;
  category: "terrain" | "character" | "creature" | "component" | "accessory" | "assembly";
  tier: "tereno_certified" | "tereno_approved" | "hexisle_official" | "hexisle_compatible" | "hexisle_adaptable" | "hexisle_inspired";
  stl_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  innovation_number: number | null;
  download_count: number;
  submitted_by: string | null;
  campaign_id: string | null;
  created_at: string;
}

// 5% per link, max 13 links = 65%
const BONUS_PER_LINK = 5;
const MAX_CHAIN = 13;
const CHAIN_FLOOR_PCT = 20;

export function useChainStatus() {
  const { user } = useAuth();

  const chainQuery = useQuery({
    queryKey: ["member-chain", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("member_chains")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as MemberChain | null;
    },
    enabled: !!user,
  });

  const linksQuery = useQuery({
    queryKey: ["chain-links", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("chain_links")
        .select("*")
        .eq("user_id", user!.id)
        .order("chain_position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChainLink[];
    },
    enabled: !!user,
  });

  const chain = chainQuery.data;
  const links = linksQuery.data ?? [];

  const isChainActive = chain?.chain_expires_at
    ? new Date(chain.chain_expires_at) > new Date()
    : false;

  const getTimeRemaining = (): number => {
    if (!chain?.chain_expires_at) return 0;
    const diff = new Date(chain.chain_expires_at).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const backedCampaignIds = new Set(links.map((l) => l.campaign_id));

  return {
    chain,
    links,
    isChainActive,
    getTimeRemaining,
    backedCampaignIds,
    chainLength: chain?.chain_length ?? 0,
    maxChain: chain?.max_chain_length ?? 0,
    bonusPct: chain?.current_bonus_pct ?? 0,
    isComplete: (chain?.chain_length ?? 0) >= MAX_CHAIN,
    floorPct: CHAIN_FLOOR_PCT,
    bonusPerLink: BONUS_PER_LINK,
    maxChainLength: MAX_CHAIN,
    isLoading: chainQuery.isLoading || linksQuery.isLoading,
  };
}

export function useCampaigns() {
  const campaignsQuery = useQuery({
    queryKey: ["kickstarter-campaigns"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("kickstarter_campaigns")
        .select("*")
        .order("campaign_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as KickstarterCampaign[];
    },
  });

  const getCampaign = (slug: string) =>
    campaignsQuery.data?.find((c) => c.slug === slug) ?? null;

  return {
    campaigns: campaignsQuery.data ?? [],
    getCampaign,
    isLoading: campaignsQuery.isLoading,
  };
}

export function useHexIsleDownloads(category?: string, tier?: string) {
  const downloadsQuery = useQuery({
    queryKey: ["hexisle-downloads", category, tier],
    queryFn: async () => {
      let query = (supabase as any).from("hexisle_downloads").select("*");
      if (category) query = query.eq("category", category);
      if (tier) query = query.eq("tier", tier);
      const { data, error } = await query.order("piece_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as HexIsleDownload[];
    },
  });

  const incrementDownload = async (id: string) => {
    await (supabase as any).rpc("increment_download_count", { download_id: id });
  };

  return {
    downloads: downloadsQuery.data ?? [],
    incrementDownload,
    isLoading: downloadsQuery.isLoading,
  };
}

export function useChainLeaderboard() {
  const leaderboardQuery = useQuery({
    queryKey: ["chain-leaderboard"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("member_chains")
        .select("user_id, chain_length, max_chain_length, profiles(display_name)")
        .order("chain_length", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as Array<{
        user_id: string;
        chain_length: number;
        max_chain_length: number;
        profiles: { display_name: string } | null;
      }>;
    },
  });

  const statsQuery = useQuery({
    queryKey: ["chain-stats"],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from("member_chains")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return { totalHolders: count ?? 0 };
    },
  });

  return {
    leaderboard: leaderboardQuery.data ?? [],
    totalHolders: statsQuery.data?.totalHolders ?? 0,
    isLoading: leaderboardQuery.isLoading,
  };
}
