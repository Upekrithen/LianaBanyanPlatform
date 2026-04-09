import { useMemo, useState } from "react";
import { Factory, Shield, Store, Users, UtensilsCrossed, Wrench } from "lucide-react";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import {
  PathwayDifferences,
  PathwayGrid,
  RecommendationDrawer,
  WhatHappensNext,
} from "@/components/v2/cold-start";
import { ColdStartPathway } from "@/components/v2/cold-start/types";

const PATHWAYS: ColdStartPathway[] = [
  {
    id: "food",
    name: "Food",
    icon: UtensilsCrossed,
    purpose: "Launch meal, grocery, and food-service transactions with immediate local demand.",
    bestFor: "best for: cooks, growers, meal-makers",
    capabilities: ["Menu or offering setup", "Local demand signal launch", "First order workflow"],
    setupHref: "/cold-start/food",
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: Factory,
    purpose: "Start production-oriented offers and move from prototype to repeatable fulfillment.",
    bestFor: "best for: makers, builders, production",
    capabilities: ["Production run planning", "Capacity and materials setup", "Fulfillment-ready checklist"],
    setupHref: "/cold-start/manufacturing",
  },
  {
    id: "service",
    name: "Service",
    icon: Wrench,
    purpose: "Publish skills-for-hire offers and begin exchanging value through service outcomes.",
    bestFor: "best for: skills-for-hire, crew members",
    capabilities: ["Service offer template", "Scope and turnaround setup", "Request and confirmation flow"],
    setupHref: "/cold-start/service",
  },
  {
    id: "local-business",
    name: "Local Business",
    icon: Store,
    purpose: "Bring an existing storefront into cooperative operations without rebuilding everything.",
    bestFor: "best for: existing shops, storefronts",
    capabilities: ["Store profile setup", "Inventory and listing bridge", "Neighborhood launch checklist"],
    setupHref: "/cold-start/local-business",
  },
  {
    id: "guild",
    name: "Guild",
    icon: Shield,
    purpose: "Coordinate professional bodies around standards, charters, and shared contribution work.",
    bestFor: "best for: professional bodies, charters",
    capabilities: ["Charter setup flow", "Member role definition", "Shared operating rituals"],
    setupHref: "/cold-start/guild",
  },
  {
    id: "tribe",
    name: "Tribe",
    icon: Users,
    purpose: "Organize neighborhoods, families, or interest groups around practical cooperative movement.",
    bestFor: "best for: neighborhoods, interests, family",
    capabilities: ["Group starter structure", "Shared priorities board", "First collective transaction path"],
    setupHref: "/cold-start/tribe",
  },
];

const MOBILE_FILTERS = [
  { label: "Food", id: "food" },
  { label: "Make", id: "manufacturing" },
  { label: "Serve", id: "service" },
  { label: "Shop", id: "local-business" },
  { label: "Guild", id: "guild" },
  { label: "Tribe", id: "tribe" },
] as const;

export default function ColdStartPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const gridTourTarget = useTourTarget("cold-start");
  const utilityStrip = useMemo(() => ["6 pathways", "Change later", "Guided setup"], []);

  return (
    <AppShell
      xrayBase="cold-start"
      pageTitle="Cold Start"
      breadcrumbs="Member workspace / Cold Start"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="Cold Start."
            headline="Choose your starting path."
            body="Pick the lane that best matches what you want to build first. You can expand later."
            secondaryCTA={{ label: "I'm not sure yet.", onClick: () => setDrawerOpen(true) }}
          />
          <p className="text-xs text-muted-foreground md:hidden">Change later.</p>
          <p className="text-xs text-muted-foreground">You can expand later.</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {utilityStrip.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>&middot;</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-24" data-xray-id="cold-start-page">
        <section
          className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground"
          data-xray-id="cold-start-reassurance-band"
        >
          Most people begin with the path closest to their first transaction.
        </section>

        <section
          className="sticky top-16 z-10 -mx-1 flex gap-2 overflow-x-auto border-y bg-background/95 px-1 py-2 backdrop-blur md:hidden"
          data-xray-id="cold-start-mobile-filter-chips"
        >
          {MOBILE_FILTERS.map((filter) => (
            <a
              key={filter.id}
              href={`#pathway-${filter.id}`}
              className="shrink-0 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              {filter.label}
            </a>
          ))}
        </section>

        <div {...gridTourTarget} data-xray-id="cold-start-pathway-grid">
          <PathwayGrid pathways={PATHWAYS} />
        </div>

        <div data-xray-id="cold-start-pathway-differences">
          <PathwayDifferences pathways={PATHWAYS} />
        </div>
        <div data-xray-id="cold-start-what-happens-next">
          <WhatHappensNext />
        </div>

        <StickyMobileCTA primary={{ label: "I'm not sure yet.", onClick: () => setDrawerOpen(true) }} />

        <RecommendationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} pathways={PATHWAYS} />
      </div>
    </AppShell>
  );
}

