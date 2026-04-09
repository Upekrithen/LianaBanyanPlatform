import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Coalition,
  CoalitionDetailWorkspace,
  CollectivePurchasingPanel,
  CrossPromotionBoard,
  InviteStorefrontFlow,
  MyCoalitionsOverview,
  PurchasingNeed,
  SharedDiscountManager,
  CoalitionDiscount,
  PromotionItem,
} from "@/components/v2/coalitions";

const WILDFIRE_COALITIONS: Coalition[] = [
  {
    id: "coalition-1",
    name: "Main Street Fresh Alliance",
    status: "active",
    memberCount: 6,
    summary: "Local grocery + bakery + refill shop coordination.",
  },
  {
    id: "coalition-2",
    name: "Neighborhood Home Goods Circle",
    status: "forming",
    memberCount: 4,
    summary: "Shared supplier batches and weekend cross-promotion.",
  },
];

export default function CoalitionManagementV2Page() {
  const { user } = useAuth();
  const { isRunning: isWildfireTour } = useWildfireRun();
  const tourTarget = useTourTarget("coalitions");
  const [selectedCoalitionId, setSelectedCoalitionId] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<CoalitionDiscount[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [purchasingNeeds, setPurchasingNeeds] = useState<PurchasingNeed[]>([]);
  const [invites, setInvites] = useState<string[]>([]);

  const coalitionQuery = useQuery({
    queryKey: ["coalitions-v2", user?.id],
    enabled: !!user && !isWildfireTour,
    queryFn: async (): Promise<Coalition[]> => {
      const { data, error } = await supabase
        .from("coalitions" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) return [];

      return ((data ?? []) as Array<Record<string, unknown>>).map((row, index) => ({
        id: String(row.id ?? `coalition-${index}`),
        name: typeof row.name === "string" && row.name ? row.name : "Coalition",
        status:
          row.status === "active" || row.status === "forming" || row.status === "paused"
            ? row.status
            : "forming",
        memberCount: Number(row.member_count ?? 0),
        summary:
          typeof row.description === "string" && row.description
            ? row.description
            : "Coalition coordination workspace.",
      }));
    },
  });

  const coalitions = useMemo(() => {
    if (isWildfireTour) return WILDFIRE_COALITIONS;
    return coalitionQuery.data ?? [];
  }, [isWildfireTour, coalitionQuery.data]);

  const selectedCoalition = useMemo(
    () => coalitions.find((coalition) => coalition.id === selectedCoalitionId) ?? null,
    [coalitions, selectedCoalitionId],
  );

  return (
    <AppShell
      xrayBase="coalitions"
      pageTitle="Coalition Management"
      breadcrumbs="Captain workspace / Storefront alliances"
      hero={
        <Hero
          variant="app"
          eyebrow="Coalition Management"
          headline="Build stronger storefronts together"
          body="Coalitions let businesses coordinate discounts, share promotion, and combine purchasing power without requiring enterprise-software habits. This page makes coalition work accessible, visible, and action-oriented."
          primaryCTA={{ label: "Manage Coalition", href: "#coalitions-overview-anchor" }}
          secondaryCTA={{ label: "Invite a Storefront", href: "#coalitions-invite-anchor" }}
          proofStrip={["Shared discounts", "Cross-promotion", "Collective purchasing"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />
        <div id="coalitions-overview-anchor" data-xray-id="coalitions-tour-anchor" />

        <MyCoalitionsOverview
          coalitions={coalitions}
          activeCoalitionId={selectedCoalitionId}
          onSelectCoalition={setSelectedCoalitionId}
        />
        <CoalitionDetailWorkspace coalition={selectedCoalition} />
        <SharedDiscountManager
          discounts={discounts}
          onAddDiscount={(discount) => setDiscounts((current) => [discount, ...current])}
        />
        <CrossPromotionBoard
          items={promotions}
          onAddItem={(item) => setPromotions((current) => [item, ...current])}
        />
        <CollectivePurchasingPanel
          needs={purchasingNeeds}
          onAddNeed={(need) => setPurchasingNeeds((current) => [need, ...current])}
        />

        <div id="coalitions-invite-anchor" data-xray-id="coalitions-invite-anchor" />
        <InviteStorefrontFlow
          invites={invites}
          onInvite={(email) => setInvites((current) => [email, ...current])}
        />
      </div>
      <StickyMobileCTA primary={{ label: "Manage Coalition", href: "#coalitions-overview-anchor" }} />
    </AppShell>
  );
}
