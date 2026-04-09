import { useMemo } from "react";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useCaptain } from "@/hooks/useCaptain";
import { useCaptainOrders } from "@/hooks/useCaptainOrders";
import {
  CaptainSummaryStrip,
  IntelligenceCard,
  PhotoCoverageCard,
  PipelineCard,
  PriorityQueueCard,
  PriorityQueueItem,
  SupportingCardStrip,
  TerritoryCard,
} from "@/components/v2/captain";

export default function CaptainDashboardPage() {
  const tourTarget = useTourTarget("captain");
  const { captain } = useCaptain();
  const { data: orders = [] } = useCaptainOrders(captain?.id);
  const activeOrders = useMemo(
    () => orders.filter((order) => order.status === "active" || order.status === "shipped"),
    [orders],
  );

  const priorityQueueItems: PriorityQueueItem[] = useMemo(() => {
    const liveItems = activeOrders.slice(0, 5).map((order) => ({
      id: order.id,
      statusLine:
        order.status === "shipped"
          ? `Shipped batch needs confirmation follow-up: ${order.batch_description}`
          : `Active assignment nearing deadline: ${order.batch_description}`,
      actionLabel: order.status === "shipped" ? "Track confirmations" : "Review assignment",
      actionHref: "#captain-deeper-layers",
    }));

    if (liveItems.length > 0) return liveItems;

    return [
      {
        id: "stub-intel",
        statusLine: "No active queue items yet. Confirm your first standing workflow.",
        actionLabel: "Open captain onboarding",
        actionHref: "/captain/become",
      },
    ];
  }, [activeOrders]);

  const territoryLabel = captain?.city && captain?.region ? `${captain.city}, ${captain.region}` : "Assigned territory pending";
  const utilityStrip = ["Territory", "Pipeline", "Intelligence", "Photo coverage"];
  const summaryItems = [
    { label: "Territory", value: territoryLabel },
    { label: "Pipeline", value: `${activeOrders.length} active standing items` },
    { label: "Intelligence", value: activeOrders.length > 0 ? "New field updates waiting" : "Awaiting incoming signals" },
    { label: "Photo coverage", value: activeOrders.length > 0 ? "Coverage in progress" : "No new uploads yet" },
  ];

  return (
    <AppShell
      xrayBase="captain"
      pageTitle="Captain Dashboard"
      breadcrumbs="Member workspace / Captain"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="Captain Dashboard."
            headline="Run the field from one screen."
            body="See territory status, active pipeline, incoming intelligence, and photo coverage in the order that helps you act."
            primaryCTA={{ label: "Open priority queue", href: "#priority-queue" }}
            secondaryCTA={{ label: "Review full territory", href: "#territory-full" }}
          />
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
      <div className="space-y-6 pb-24">
        <StickyMobileCTA primary={{ label: "Open priority queue", href: "#priority-queue" }} />

        <CaptainSummaryStrip items={summaryItems} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PriorityQueueCard
              title="Priority Queue"
              description="Curated actions that need captain attention today."
              items={priorityQueueItems}
              emptyState="No urgent actions detected yet."
              tourTargetProps={tourTarget}
            />
          </div>
          <SupportingCardStrip className="lg:grid-cols-1">
            <PipelineCard
              compact
              preview={`${activeOrders.length} active deals and assignments in flight.`}
              recommendation="Start with deadlines due in the next 24 hours."
            />
            <TerritoryCard
              compact
              preview={`${territoryLabel}. Coverage standing visible for captain review.`}
              recommendation="Confirm strongest and weakest coverage zones."
            />
            <IntelligenceCard
              compact
              preview="Incoming tips and signal capture are staged for review."
              recommendation="Scan high-confidence leads before routing crews."
            />
            <PhotoCoverageCard
              compact
              preview="Photo bounty map coverage is tracked in field standing."
              recommendation="Close missing photo lanes before shift end."
            />
          </SupportingCardStrip>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <PipelineCard
              preview={`${activeOrders.length} active deals / jobs / work-in-flight entries currently open.`}
              recommendation="Recommended action: move top two orders to confirmation-ready standing."
            />
            <TerritoryCard
              preview={`Current territory standing: ${territoryLabel}.`}
              recommendation="Recommended action: review zone coverage map before assigning new jobs."
            />
          </div>
          <div className="space-y-6">
            <IntelligenceCard
              preview="Tips, competitor signals, and opportunity feeds are grouped by urgency."
              recommendation="Recommended action: process top priority signals and assign follow-up."
            />
            <PhotoCoverageCard
              preview="Bounty photo standing and map coverage progression are ready for review."
              recommendation="Recommended action: push coverage requests to under-documented lanes."
            />
          </div>
        </div>

        <div id="captain-deeper-layers" className="space-y-4">
          <Card id="territory-full">
            <CardHeader>
              <CardTitle>Territory drill-down</CardTitle>
              <CardDescription>Map and assignment drill-down is staged as the next layer.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Territory map expansion is intentionally stubbed for this session per spec.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline, Intelligence, and Photo drill-downs</CardTitle>
              <CardDescription>Each block supports deeper operational detail below fold.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Deep detail views are prepared as drill-down stubs and can be wired to live feeds in a follow-up session.
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
