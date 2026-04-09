import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ActiveAssignmentsPanel,
  Assignment,
  AvailableBountiesMap,
  BountyCard,
  BountyItem,
  EarningsEntry,
  EarningsTracker,
  PhotographerProfileSummary,
  ProofSubmissionFlow,
} from "@/components/v2/bounty-photography";

const WILDFIRE_BOUNTIES: BountyItem[] = [
  {
    id: "b1",
    title: "Weekend menu spotlight",
    merchant: "Riverside Bakery",
    city: "Boise",
    distanceMiles: 1.9,
    payoutUsd: 35,
    status: "open",
  },
  {
    id: "b2",
    title: "Storefront opening hour reel",
    merchant: "Green Fork Market",
    city: "Boise",
    distanceMiles: 3.4,
    payoutUsd: 42,
    status: "open",
  },
];

const WILDFIRE_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    bountyTitle: "Lunch special post",
    merchant: "Main Street Deli",
    dueAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    status: "claimed",
  },
];

const WILDFIRE_EARNINGS: EarningsEntry[] = [
  {
    id: "e1",
    title: "Bakery opening storyboard",
    amountUsd: 40,
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
];

export default function BountyPhotographyV2Page() {
  const { user } = useAuth();
  const { isRunning: isWildfireTour } = useWildfireRun();
  const tourTarget = useTourTarget("bounty-photography");
  const [radiusMiles, setRadiusMiles] = useState(10);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [proofLog, setProofLog] = useState<Array<{ socialLink: string; merchantConfirmation: string }>>([]);

  const bountiesQuery = useQuery({
    queryKey: ["bounty-photography-v2", user?.id],
    enabled: !!user && !isWildfireTour,
    queryFn: async (): Promise<BountyItem[]> => {
      // Use real data once connected; default user state remains empty.
      const { data, error } = await supabase
        .from("bounty_photography_jobs" as never)
        .select("*")
        .limit(20);
      if (error) return [];
      return ((data ?? []) as Array<Record<string, unknown>>).map((row, index) => ({
        id: String(row.id ?? `job-${index}`),
        title: String(row.title ?? "Photo bounty"),
        merchant: String(row.merchant_name ?? "Local merchant"),
        city: String(row.city ?? "Local"),
        distanceMiles: Number(row.distance_miles ?? 0),
        payoutUsd: Number(row.payout_usd ?? 0),
        status: (row.status as BountyItem["status"]) ?? "open",
      }));
    },
  });

  const bounties = useMemo(() => {
    if (isWildfireTour) return WILDFIRE_BOUNTIES;
    return bountiesQuery.data ?? [];
  }, [isWildfireTour, bountiesQuery.data]);

  const assignments = isWildfireTour ? WILDFIRE_ASSIGNMENTS : [];
  const earnings = isWildfireTour ? WILDFIRE_EARNINGS : [];

  return (
    <AppShell
      xrayBase="bounty-photography"
      pageTitle="Bounty Photography"
      breadcrumbs="Member workspace / Local cooperative work"
      hero={
        <Hero
          variant="app"
          eyebrow="Bounty Photography"
          headline="Find local shoots, deliver proof, keep the work human"
          body="This dashboard helps photographers discover nearby bounties, manage active assignments, submit social-post links instead of uploads, and track earnings in a workflow designed to feel cooperative rather than extractive."
          primaryCTA={{ label: "View Available Bounties", href: "#bounty-photography-map-anchor" }}
          secondaryCTA={{ label: "My Active Assignments", href: "#bounty-photography-active-anchor" }}
          proofStrip={["Zero-storage model", "Social-post proof", "Local bounties"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />
        <div className="flex items-center gap-2 text-sm" data-xray-id="bounty-photography-radius-control">
          <span className="text-muted-foreground">Radius:</span>
          {[5, 10, 25].map((option) => (
            <button
              key={option}
              type="button"
              className={`rounded border px-2 py-1 ${radiusMiles === option ? "border-primary bg-primary/5" : "border-border"}`}
              onClick={() => setRadiusMiles(option)}
            >
              {option} mi
            </button>
          ))}
        </div>

        <div id="bounty-photography-map-anchor" data-xray-id="bounty-photography-tour-anchor" />
        <AvailableBountiesMap bounties={bounties} radiusMiles={radiusMiles} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {bounties
            .filter((bounty) => bounty.distanceMiles <= radiusMiles)
            .map((bounty) => (
              <BountyCard
                key={bounty.id}
                bounty={{
                  ...bounty,
                  status: claimed.includes(bounty.id) ? "claimed" : bounty.status,
                }}
                onClaim={() => {
                  setClaimed((current) => [...current, bounty.id]);
                  toast.success("Assignment claimed.");
                }}
              />
            ))}
        </div>

        <div id="bounty-photography-active-anchor" data-xray-id="bounty-photography-active-anchor" />
        <ActiveAssignmentsPanel assignments={assignments} />
        <ProofSubmissionFlow
          onSubmitProof={(payload) => {
            setProofLog((current) => [payload, ...current]);
            toast.success("Proof link submitted.");
          }}
        />
        <EarningsTracker entries={earnings} />
        <PhotographerProfileSummary
          completedAssignments={earnings.length}
          activeAssignments={assignments.length}
          localRadiusMiles={radiusMiles}
        />
      </div>
      <StickyMobileCTA primary={{ label: "View Available Bounties", href: "#bounty-photography-map-anchor" }} />
    </AppShell>
  );
}
