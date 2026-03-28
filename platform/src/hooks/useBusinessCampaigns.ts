import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BusinessCampaign {
  id: string;
  business_name: string;
  business_type: string;
  business_address: string | null;
  business_city: string;
  business_state: string | null;
  business_website: string | null;
  business_phone: string | null;
  nominated_by: string;
  nomination_reason: string | null;
  slug: string;
  description: string | null;
  proposed_discount_pct: number;
  image_url: string | null;
  pledge_count: number;
  pledge_total_credits: number;
  pledge_threshold: number;
  status: string;
  captain_id: string | null;
  pitched_at: string | null;
  accepted_at: string | null;
  created_at: string;
  expires_at: string;
}

export interface CampaignPledge {
  id: string;
  campaign_id: string;
  user_id: string;
  pledge_type: string;
  credit_amount: number;
  marks_amount: number;
  note: string | null;
  created_at: string;
}

export interface PitchPacket {
  id: string;
  campaign_id: string;
  captain_id: string;
  pledge_count: number;
  total_pledged: number;
  avg_order_value: number | null;
  proposed_discount: string | null;
  qr_code_url: string | null;
  generated_at: string;
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurants",
  food_truck: "Food Trucks",
  bakery: "Bakeries",
  catering: "Catering",
  barber: "Barbers",
  salon: "Salons",
  spa: "Spas",
  mechanic: "Mechanics",
  auto_service: "Auto Service",
  dry_cleaner: "Dry Cleaners",
  laundry: "Laundry",
  grocery: "Grocery",
  convenience: "Convenience",
  tutoring: "Tutoring",
  education: "Education",
  gym: "Gyms",
  fitness: "Fitness",
  pet_service: "Pet Services",
  veterinary: "Veterinary",
  home_service: "Home Services",
  plumbing: "Plumbing",
  electrical: "Electrical",
  cleaning: "Cleaning",
  retail: "Retail",
  other: "Other",
};

export function getBusinessTypeLabel(type: string): string {
  return BUSINESS_TYPE_LABELS[type] ?? type;
}

const FILTER_GROUPS: { label: string; types: string[] }[] = [
  { label: "All", types: [] },
  { label: "Restaurants", types: ["restaurant", "food_truck", "bakery", "catering"] },
  { label: "Services", types: ["barber", "salon", "spa", "mechanic", "auto_service", "dry_cleaner", "laundry", "home_service", "plumbing", "electrical", "cleaning"] },
  { label: "Retail", types: ["grocery", "convenience", "retail"] },
];

export { FILTER_GROUPS as CAMPAIGN_FILTER_GROUPS };

export function useBusinessCampaigns(filter?: string) {
  return useQuery({
    queryKey: ["business-campaigns", filter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_campaigns" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let campaigns = (data ?? []) as BusinessCampaign[];

      if (filter && filter !== "all") {
        const group = FILTER_GROUPS.find((g) => g.label === filter);
        if (group && group.types.length > 0) {
          campaigns = campaigns.filter((c) => group.types.includes(c.business_type));
        }
      }

      return campaigns;
    },
  });
}

export function useBusinessCampaign(slug: string | undefined) {
  return useQuery({
    queryKey: ["business-campaign", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("business_campaigns" as any)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as BusinessCampaign;
    },
    enabled: !!slug,
  });
}

export function useCampaignPledges(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["campaign-pledges", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from("campaign_pledges" as any)
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CampaignPledge[];
    },
    enabled: !!campaignId,
  });
}

export function usePledgeCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      campaignId,
      creditAmount,
      pledgeType = "advance_order",
      note,
    }: {
      campaignId: string;
      creditAmount: number;
      pledgeType?: "advance_order" | "recurring" | "marks_seed";
      note?: string;
    }) => {
      if (!user) throw new Error("Must be logged in to pledge");

      const { data, error } = await supabase
        .from("campaign_pledges" as any)
        .upsert(
          {
            campaign_id: campaignId,
            user_id: user.id,
            pledge_type: pledgeType,
            credit_amount: creditAmount,
            note: note || null,
          },
          { onConflict: "campaign_id,user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      // Update campaign aggregate counts
      const { data: agg } = await supabase
        .from("campaign_pledges" as any)
        .select("credit_amount")
        .eq("campaign_id", campaignId);

      const pledgeCount = agg?.length ?? 0;
      const pledgeTotal = (agg ?? []).reduce(
        (sum: number, p: any) => sum + Number(p.credit_amount),
        0
      );

      await supabase
        .from("business_campaigns" as any)
        .update({
          pledge_count: pledgeCount,
          pledge_total_credits: pledgeTotal,
          ...(pledgeCount >= 30 ? { status: "threshold_met" } : {}),
        })
        .eq("id", campaignId);

      return data as CampaignPledge;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["business-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["business-campaign"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-pledges", vars.campaignId] });
    },
  });
}

export function useNominateBusiness() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      businessName: string;
      businessType: string;
      businessCity: string;
      businessState?: string;
      businessAddress?: string;
      businessWebsite?: string;
      businessPhone?: string;
      nominationReason: string;
      proposedDiscountPct?: number;
      initialPledge?: number;
    }) => {
      if (!user) throw new Error("Must be logged in to nominate");

      const slug = input.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data, error } = await supabase
        .from("business_campaigns" as any)
        .insert({
          business_name: input.businessName,
          business_type: input.businessType,
          business_city: input.businessCity,
          business_state: input.businessState || null,
          business_address: input.businessAddress || null,
          business_website: input.businessWebsite || null,
          business_phone: input.businessPhone || null,
          nominated_by: user.id,
          nomination_reason: input.nominationReason,
          slug,
          proposed_discount_pct: input.proposedDiscountPct ?? 10,
        })
        .select()
        .single();

      if (error) throw error;

      const campaign = data as BusinessCampaign;

      if (input.initialPledge && input.initialPledge > 0) {
        await supabase.from("campaign_pledges" as any).insert({
          campaign_id: campaign.id,
          user_id: user.id,
          pledge_type: "advance_order",
          credit_amount: input.initialPledge,
          note: "Nominator's seed pledge",
        });

        await supabase
          .from("business_campaigns" as any)
          .update({
            pledge_count: 1,
            pledge_total_credits: input.initialPledge,
          })
          .eq("id", campaign.id);
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-campaigns"] });
    },
  });
}

export function useGeneratePitchPacket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      campaignId,
      campaign,
    }: {
      campaignId: string;
      campaign: BusinessCampaign;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const avgOrder =
        campaign.pledge_count > 0
          ? campaign.pledge_total_credits / campaign.pledge_count
          : 0;

      const qrUrl = `${window.location.origin}/campaigns/${campaign.slug}`;

      const { data, error } = await supabase
        .from("pitch_packets" as any)
        .insert({
          campaign_id: campaignId,
          captain_id: user.id,
          pledge_count: campaign.pledge_count,
          total_pledged: campaign.pledge_total_credits,
          avg_order_value: Math.round(avgOrder * 100) / 100,
          proposed_discount: `${campaign.proposed_discount_pct}% volume discount`,
          qr_code_url: qrUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PitchPacket;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["pitch-packet", vars.campaignId] });
    },
  });
}

export function usePitchPacket(campaignId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pitch-packet", campaignId, user?.id],
    queryFn: async () => {
      if (!campaignId || !user) return null;
      const { data, error } = await supabase
        .from("pitch_packets" as any)
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("captain_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PitchPacket | null;
    },
    enabled: !!campaignId && !!user,
  });
}

export function useClaimCaptain() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ campaignId }: { campaignId: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("business_campaigns" as any)
        .update({ captain_id: user.id })
        .eq("id", campaignId)
        .is("captain_id", null)
        .select()
        .single();

      if (error) throw error;
      return data as BusinessCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["business-campaign"] });
    },
  });
}
