import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ContributionMissionCard,
  HousingFundGraph,
  HousingMission,
  HousingPropertyListing,
  HousingTabKey,
  HousingTabbedRail,
  HousingTimeline,
  HousingTimelineEvent,
  MyHousingStoryCard,
  PriorityLadderVisualization,
  PropertyListingCard,
  RoommateStampEvent,
  RoommateStampHistory,
} from "@/components/v2/housing";

function tierFromScore(score: number) {
  if (score >= 85) return "Tier 1";
  if (score >= 60) return "Tier 2";
  if (score >= 35) return "Tier 3";
  return "Tier 4";
}

export default function HousingHubV2Page() {
  const { user } = useAuth();
  const tourTarget = useTourTarget("housing");
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<HousingTabKey>("properties");

  const propertiesQuery = useQuery({
    queryKey: ["housing-v2-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housing_properties")
        .select(
          "id,title,city,state,property_type,status,acquisition_cost,monthly_revenue,monthly_expenses,created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        title: string;
        city: string;
        state: string | null;
        property_type: string;
        status: string;
        acquisition_cost: number | null;
        monthly_revenue: number | null;
        monthly_expenses: number | null;
        created_at: string;
      }>;
    },
  });

  const waterwheelQuery = useQuery({
    queryKey: ["housing-v2-waterwheel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housing_waterwheel")
        .select(
          "id,property_id,period_start,gross_revenue,airbnb_share,tenant_subsidy,maintenance_fund,cooperative_fund,multiplier_effect",
        )
        .order("period_start", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        property_id: string;
        period_start: string;
        gross_revenue: number;
        airbnb_share: number;
        tenant_subsidy: number;
        maintenance_fund: number;
        cooperative_fund: number;
        multiplier_effect: number | null;
      }>;
    },
  });

  const contributionsQuery = useQuery({
    queryKey: ["housing-v2-contributions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housing_contributions")
        .select("id,amount,currency,contribution_type,verified,created_at,property_id")
        .eq("contributor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        amount: number;
        currency: string;
        contribution_type: string;
        verified: boolean | null;
        created_at: string;
        property_id: string | null;
      }>;
    },
  });

  const occupancyQuery = useQuery({
    queryKey: ["housing-v2-occupancy", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housing_occupancy")
        .select("id,move_in_date,role,property_id,is_active")
        .eq("member_id", user!.id)
        .eq("is_active", true)
        .order("move_in_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        move_in_date: string;
        role: string;
        property_id: string;
        is_active: boolean;
      }>;
    },
  });

  const roommateStampsQuery = useQuery({
    queryKey: ["housing-v2-roommate-stamps", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roommate_stamps")
        .select("id,category,status,incident_date,description,stamper_id,respondent_id,created_at")
        .or(`stamper_id.eq.${user!.id},respondent_id.eq.${user!.id}`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        category: string;
        status: string;
        incident_date: string;
        description: string | null;
        stamper_id: string;
        respondent_id: string;
        created_at: string;
      }>;
    },
  });

  const missionMutation = useMutation({
    mutationFn: async (mission: HousingMission) => {
      if (!user?.id) throw new Error("Sign in required.");
      const { error } = await supabase.from("housing_contributions").insert({
        contributor_id: user.id,
        property_id: null,
        contribution_type: "maintenance_labor",
        amount: 10,
        currency: "marks",
        description: `Mission accepted: ${mission.name}`,
        verified: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mission accepted and queued for steward review.");
      queryClient.invalidateQueries({ queryKey: ["housing-v2-contributions"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not accept mission."),
  });

  const latestWaterwheelByProperty = useMemo(() => {
    const map = new Map<string, (typeof waterwheelQuery.data)[number]>();
    for (const row of waterwheelQuery.data ?? []) {
      if (!map.has(row.property_id)) {
        map.set(row.property_id, row);
      }
    }
    return map;
  }, [waterwheelQuery.data]);

  const priorityScore = useMemo(() => {
    const verifiedContrib = (contributionsQuery.data ?? []).filter((contrib) => Boolean(contrib.verified));
    const verifiedAmount = verifiedContrib.reduce((sum, contrib) => sum + Number(contrib.amount ?? 0), 0);
    const verifiedCount = verifiedContrib.length;
    const occupancyBonus = (occupancyQuery.data ?? []).length > 0 ? 20 : 0;
    return Math.min(100, verifiedAmount / 10 + verifiedCount * 3 + occupancyBonus);
  }, [contributionsQuery.data, occupancyQuery.data]);

  const tier = useMemo(() => {
    const tierLabel = tierFromScore(priorityScore);
    const nextTierLabel = tierLabel === "Tier 1" ? "Tier 1" : tierLabel === "Tier 2" ? "Tier 1" : tierLabel === "Tier 3" ? "Tier 2" : "Tier 3";
    const threshold = tierLabel === "Tier 1" ? 100 : tierLabel === "Tier 2" ? 85 : tierLabel === "Tier 3" ? 60 : 35;
    return {
      tierLabel,
      priorityScore,
      nextTierLabel,
      pointsToNextTier: Math.max(0, threshold - priorityScore),
    };
  }, [priorityScore]);

  const listingData = useMemo<HousingPropertyListing[]>(
    () =>
      (propertiesQuery.data ?? []).map((property) => {
        const wheel = latestWaterwheelByProperty.get(property.id);
        return {
          id: property.id,
          title: property.title,
          city: property.city,
          state: property.state,
          propertyType: property.property_type,
          status: property.status,
          acquisitionCost: property.acquisition_cost,
          monthlyRevenue: property.monthly_revenue,
          monthlyExpenses: property.monthly_expenses,
          waterwheel: {
            airbnbShare: Number(wheel?.airbnb_share ?? 30),
            tenantSubsidy: Number(wheel?.tenant_subsidy ?? 40),
            maintenanceFund: Number(wheel?.maintenance_fund ?? 15),
            cooperativeFund: Number(wheel?.cooperative_fund ?? 15),
            multiplierEffect: wheel?.multiplier_effect ?? null,
          },
        };
      }),
    [propertiesQuery.data, latestWaterwheelByProperty],
  );

  const story = useMemo(() => {
    const lastActions = (contributionsQuery.data ?? []).slice(0, 3).map((contrib) => ({
      id: contrib.id,
      label: `${contrib.contribution_type.replace(/_/g, " ")} contribution (${contrib.amount} ${contrib.currency})`,
      happenedAt: contrib.created_at,
    }));

    const nextMove =
      tier.pointsToNextTier <= 0
        ? "Maintain contribution cadence to keep your current rung."
        : `Complete one more verified mission or contribution to close ${tier.pointsToNextTier.toFixed(1)} points.`;

    return { tier, lastActions, nextMove };
  }, [contributionsQuery.data, tier]);

  const timelineEvents = useMemo<HousingTimelineEvent[]>(() => {
    const events: HousingTimelineEvent[] = [];
    for (const contrib of contributionsQuery.data ?? []) {
      events.push({
        id: `c-${contrib.id}`,
        occurredAt: contrib.created_at,
        title: contrib.contribution_type.replace(/_/g, " "),
        narrative: "Contribution moved your cooperative housing standing upward.",
        priorityDelta: Math.max(1, Number(contrib.amount || 0) / 20),
      });
    }
    for (const occupancy of occupancyQuery.data ?? []) {
      events.push({
        id: `o-${occupancy.id}`,
        occurredAt: occupancy.move_in_date,
        title: "Active occupancy chapter began",
        narrative: `Role: ${occupancy.role}. Accountability continuity reinforced your priority story.`,
        priorityDelta: 5,
      });
    }
    return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 10);
  }, [contributionsQuery.data, occupancyQuery.data]);

  const missions = useMemo<HousingMission[]>(
    () => [
      {
        id: "mission-clean-turnover",
        name: "Turnover cleanup sprint",
        whyItMatters: "Reduces vacancy downtime so the next member moves in faster.",
        timeEstimate: "90 minutes",
        impactLabel: "May add +6 priority, +25 Marks equivalent",
      },
      {
        id: "mission-maintenance-walk",
        name: "Maintenance walk-through",
        whyItMatters: "Prevents deferred repairs and protects subsidy capacity.",
        timeEstimate: "45 minutes",
        impactLabel: "May add +4 priority, +15 Marks equivalent",
      },
      {
        id: "mission-neighbor-intake",
        name: "Neighbor intake support",
        whyItMatters: "Speeds onboarding and keeps accountability expectations clear.",
        timeEstimate: "30 minutes",
        impactLabel: "May add +3 priority, +10 Marks equivalent",
      },
    ],
    [],
  );

  const fundPoints = useMemo(() => {
    const rows = (waterwheelQuery.data ?? []).slice(0, 6).reverse();
    if (rows.length === 0) {
      return [
        { label: "M1", fundValue: 2200, subsidyCount: 1 },
        { label: "M2", fundValue: 2700, subsidyCount: 1 },
        { label: "M3", fundValue: 3300, subsidyCount: 2 },
      ];
    }
    return rows.map((row, index) => ({
      label: `P${index + 1}`,
      fundValue: Number(row.cooperative_fund ?? 0),
      subsidyCount: Number((row.tenant_subsidy ?? 0) > 0 ? 1 : 0),
    }));
  }, [waterwheelQuery.data]);

  const roommateEvents = useMemo<RoommateStampEvent[]>(
    () =>
      (roommateStampsQuery.data ?? []).map((stamp) => ({
        id: stamp.id,
        category: stamp.category,
        status: stamp.status,
        incidentDate: stamp.incident_date,
        narrative: stamp.description || "Accountability stamp recorded.",
      })),
    [roommateStampsQuery.data],
  );

  return (
    <AppShell
      xrayBase="housing"
      pageTitle="Housing Hub"
      breadcrumbs="Member workspace / Cooperative housing"
      hero={
        <Hero
          variant="app"
          eyebrow="Housing that remembers what you've done"
          headline="A housing cockpit where contribution moves you up the line."
          body="Your first view combines cooperative properties, your WaterWheel footprint, and a live priority ladder tied to your contributions."
          primaryCTA={{ label: "See where I stand", href: "#housing-priority-anchor" }}
          secondaryCTA={{ label: "See how to move up", href: "#housing-contribute-anchor" }}
          proofStrip={[
            "WaterWheel breakdown on every listing",
            "Priority tier + next rung visible",
            "Accountability stamps woven into housing story",
          ]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />
        <div id="housing-priority-anchor" data-xray-id="housing-tour-anchor" />
        <MyHousingStoryCard story={story} />
        <PriorityLadderVisualization tier={tier} />

        <Tabs value={tab} onValueChange={(value) => setTab(value as HousingTabKey)}>
          <HousingTabbedRail tab={tab} />

          <TabsContent value="properties" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Chapter 1: Properties map your current standing to available cooperative housing opportunities.
            </p>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {listingData.map((property) => (
                <PropertyListingCard key={property.id} property={property} tier={tier} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-housing" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Chapter 2: My Housing connects events to your ladder movement so the next action is always clear.
            </p>
            <HousingTimeline events={timelineEvents} />
          </TabsContent>

          <TabsContent value="contribute" className="mt-4 space-y-4" id="housing-contribute-anchor">
            <p className="text-sm text-muted-foreground">
              Chapter 3: Contribution missions convert time and effort into housing priority movement.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {missions.map((mission) => (
                <ContributionMissionCard key={mission.id} mission={mission} onTakeMission={missionMutation.mutateAsync} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="housing-fund" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Chapter 4: Housing Fund shows how monthly flow enables subsidy outcomes for members.
            </p>
            <HousingFundGraph points={fundPoints} />
          </TabsContent>

          <TabsContent value="roommate" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Chapter 5: Roommate story is accountability-only, centered on stamp history and resolution outcomes.
            </p>
            <RoommateStampHistory events={roommateEvents} />
          </TabsContent>
        </Tabs>

        <StickyMobileCTA primary={{ label: "See where I stand", href: "#housing-priority-anchor" }} />
      </div>
    </AppShell>
  );
}
