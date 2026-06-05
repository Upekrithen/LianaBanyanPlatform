/**
 * BatteryDispatchSpinoutPage -- Wave 21 Phase beta
 * ==================================================
 * Route: /spinouts/battery-dispatch
 *
 * Full business-plan landing for the Battery Dispatch SPINOUT ENTITY.
 *
 * Doctrine:
 *   - Securities-clean: Marks = participation, never equity or guaranteed return.
 *   - Cost+20% for all energy coordination services.
 *   - Honest cost telemetry: real numbers, no "$0" claims.
 *   - IP: dispatch algorithm is platform IP (IP Ledger registration).
 *   - Member energy contribution tracked per household per billing cycle.
 */

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Battery,
  Activity,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  BarChart3,
  DollarSign,
  Users,
  FileText,
  Cpu,
  TrendingDown,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { usePageSEO } from "@/hooks/usePageSEO";

const CONTRIBUTION_TYPES = [
  {
    type: "Battery Storage Node",
    emoji: "🔋",
    description:
      "Member installs a cooperative-compatible battery system at their home or business. The node participates in demand-response events when the grid is stressed. Minimum 10 kWh capacity.",
    earnRate: "Cost+20% on every kWh dispatched through your node",
    setupCost: "Member-owned hardware; platform provides dispatch firmware free",
  },
  {
    type: "Demand Flexibility",
    emoji: "📉",
    description:
      "Member opts into smart load-shifting. During peak periods, select appliances (water heater, EV charger, pool pump) are deferred 30-90 minutes. No cold showers.",
    earnRate: "Marks per kW of flexible load registered",
    setupCost: "Free enrollment. Requires smart-plug or smart-panel integration.",
  },
  {
    type: "Solar Export",
    emoji: "☀️",
    description:
      "Members with rooftop solar export excess generation to the cooperative pool during peak-day windows. The pool distributes that energy to members with evening demand.",
    earnRate: "Cost+20% on exported kWh credited against member bill",
    setupCost: "Existing solar installation required. Cooperative metering firmware.",
  },
  {
    type: "Neighborhood Pool Anchor",
    emoji: "🏘️",
    description:
      "A member with an oversized battery or commercial storage becomes a neighborhood pool anchor. Other members can draw from the anchor's reserve during local outages.",
    earnRate: "Cost+20% on kWh drawn from anchor storage by other members",
    setupCost: "25 kWh minimum. Anchor certification required (Anchor spinout protocol).",
  },
];

const DISPATCH_STEPS = [
  {
    step: 1,
    title: "Signal Detection",
    description:
      "The dispatch algorithm monitors real-time grid pricing signals and weather forecasts. When a peak event is predicted (>15 min ahead), the algorithm pre-stages battery drawdown orders.",
  },
  {
    step: 2,
    title: "Node Ranking",
    description:
      "Nodes are ranked by: state of charge, proximity to the requesting cluster, current load, and member preference settings. Least-cost dispatch is selected first.",
  },
  {
    step: 3,
    title: "Dispatch Authorization",
    description:
      "Node operators receive a dispatch authorization push notification. Operators can accept, defer (once per event), or decline without penalty. Auto-accept is opt-in.",
  },
  {
    step: 4,
    title: "Energy Flow + Metering",
    description:
      "Approved dispatch flows. Each kWh is metered by the cooperative firmware and logged to the IP Ledger with a timestamp, node ID, and receiving cluster ID.",
  },
  {
    step: 5,
    title: "Cost Accounting",
    description:
      "After each event: direct cost (wholesale rate + metering overhead) is calculated. Cost+20% coordination fee is applied. Node operator receives their margin. Member bills are updated.",
  },
  {
    step: 6,
    title: "Telemetry Publish",
    description:
      "All event costs, margins, and kWh moved are published to the member portal within 24 hours. No estimated bills. No hidden charges. Every cent is traceable.",
  },
];

const ECONOMICS_ROWS = [
  {
    label: "Wholesale energy cost (pass-through to member)",
    example: "$0.08/kWh",
    note: "Real-time market rate. Never marked up.",
  },
  {
    label: "Dispatch coordination fee (Cost+20%)",
    example: "$0.016/kWh",
    note: "20% of the wholesale cost. Covers algorithm, metering, payment processing.",
  },
  {
    label: "Node operator margin (included in cost-of-energy)",
    example: "$0.006/kWh",
    note: "Node earns 83.3% of the coordination fee it helped generate.",
  },
  {
    label: "Member all-in energy rate",
    example: "$0.096/kWh",
    note: "vs. $0.14+ retail. Estimated 31% savings at current rates.",
  },
];

const IP_ENTRIES = [
  {
    title: "Dispatch Algorithm v1",
    type: "Software",
    description:
      "The node-ranking, pre-staging, and event-settlement algorithm. Registered as platform IP. Nodes access it via cooperative license.",
  },
  {
    title: "Cooperative Metering Firmware",
    type: "Embedded Software",
    description:
      "The kWh metering and tamper-detection firmware deployed to node hardware. Open-audited by the member community annually.",
  },
  {
    title: "Pool Anchor Protocol",
    type: "Protocol",
    description:
      "The technical handshake and safety interlocks for neighborhood pool anchor nodes. Jointly developed with the Anchor spinout.",
  },
];

// ─── Live-data hook: dispatch summary ────────────────────────────────────────

interface BdDispatchSummary {
  total_events: number;
  completed_events: number;
  total_kwh_dispatched: number;
  total_node_participations: number;
}

function useBdDispatchSummary() {
  return useQuery<BdDispatchSummary>({
    queryKey: ["bd-dispatch-summary"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("bd_dispatch_summary")
        .select("*")
        .maybeSingle();
      return data ?? { total_events: 0, completed_events: 0, total_kwh_dispatched: 0, total_node_participations: 0 };
    },
    staleTime: 2 * 60_000,
  });
}

interface BdContributionCount {
  count: number;
  total_kwh: number;
}

function useBdContributionStats() {
  return useQuery<BdContributionCount>({
    queryKey: ["bd-contribution-stats"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("bd_contributions")
        .select("kwh_contributed")
        .eq("status", "active");
      const rows = (data as { kwh_contributed: number }[] | null) ?? [];
      return {
        count: rows.length,
        total_kwh: rows.reduce((acc, r) => acc + Number(r.kwh_contributed), 0),
      };
    },
    staleTime: 2 * 60_000,
  });
}

export default function BatteryDispatchSpinoutPage() {
  usePageSEO({
    title: "Battery Dispatch | Liana Banyan Spinout",
    description: "Community energy storage and dispatch cooperative. A spinout from the Power to the People initiative.",
    canonical: "https://lianabanyan.com/spinouts/battery-dispatch",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: dispatchSummary } = useBdDispatchSummary();
  const { data: contribStats } = useBdContributionStats();

  return (
    <PortalPageLayout variant="stage" xrayId="battery-dispatch-spinout-page">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Back nav */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/spinouts")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All 7 Spinouts
        </Button>

        {/* Hero */}
        <div className="rounded-2xl border-2 bg-gradient-to-br from-yellow-500/20 to-green-500/20 border-yellow-500/30 p-6 space-y-3">
          <div className="flex items-start gap-4">
            <span className="text-5xl">⚡</span>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">Battery Dispatch</h1>
                <Badge variant="outline">Spinout Entity #2</Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400">Forming</Badge>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl">
                Cooperative energy dispatch network. Members contribute battery capacity
                and demand flexibility. The spinout negotiates with utilities, operates
                the dispatch algorithm, and passes savings through at Cost+20%.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary" className="text-xs">Energy &amp; Infrastructure</Badge>
                <Badge variant="secondary" className="text-xs">Cost+20%</Badge>
                <Badge variant="secondary" className="text-xs">Honest Telemetry</Badge>
                <Badge variant="secondary" className="text-xs">Demand Response</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Live Dispatch Stats */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-yellow-400" />
              Dispatch Network -- Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{dispatchSummary?.total_events ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Dispatch Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{Number(dispatchSummary?.total_kwh_dispatched ?? 0).toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">kWh Dispatched</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{contribStats?.count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Active Nodes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{Number(contribStats?.total_kwh ?? 0).toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">kWh Capacity</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Live from Supabase. Cost+20% -- honest telemetry, no $0 claims.
            </p>
          </CardContent>
        </Card>

        {/* Why a spinout */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Why Battery Dispatch Is a Spinout
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Energy dispatch requires licenses in most jurisdictions, utility interconnection
              agreements, and liability coverage that cannot sit inside the cooperative itself.
              The Battery Dispatch spinout entity holds the utility agreements, operates the
              dispatch algorithm as a licensed aggregator, and contracts with node operators
              under a standard cooperative agreement.
            </p>
            <p>
              The cooperative's Switzerland Protocol applies: no political energy agenda, no
              green-premium markup, just lower bills through coordinated purchasing power.
            </p>
          </CardContent>
        </Card>

        {/* Business Plan */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Plan
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Cost+20% template. Marks = participation, not equity or guaranteed return.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Problem</p>
              <p className="text-muted-foreground">
                Residential energy customers have zero negotiating power against utilities.
                Demand-response programs require scale that no individual household can
                achieve alone. Meanwhile, members with battery storage and solar have no
                mechanism to pool their capacity for collective benefit.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Who We Serve</p>
              <p className="text-muted-foreground">
                Member households in high-density cooperative neighborhoods. Initial focus:
                50-household pilot blocks where aggregate demand creates real negotiating
                leverage. Secondary: members with existing storage and solar who want to
                monetize idle capacity.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Offering</p>
              <p className="text-muted-foreground italic">
                "I help cooperative neighborhoods reduce energy costs and build grid
                resilience so members pay less and their streets survive outages."
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
              <p className="text-muted-foreground">
                Coordination fee: Cost+20% on energy savings generated. If the cooperative
                saves a household $400/year on their energy bill, the coordination fee is
                $80 (20%). The household keeps $320. Costs are real numbers published
                per-event. There are no "$0" claims anywhere on this platform.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Day 30: First pilot neighborhood demand-response pool formed (50+ households enrolled)</li>
                <li>Day 60: First utility negotiation meeting with aggregate member load data as leverage</li>
                <li>Day 90: First batch rate negotiated, published to member portal with full cost telemetry</li>
              </ol>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">
                <strong>Legal Gate:</strong> Utility aggregator licensing varies by state.
                Battery Dispatch will operate pilot pools in unlicensed-aggregation
                jurisdictions first. Full interstate dispatch requires Founder action on
                regulatory strategy before expansion.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Member Contribution Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-yellow-500" />
              How Members Contribute Energy Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {CONTRIBUTION_TYPES.map((ct) => (
                <div key={ct.type} className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ct.emoji}</span>
                    <p className="font-semibold text-sm">{ct.type}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{ct.description}</p>
                  <div className="space-y-1 pt-1">
                    <p className="text-xs">
                      <span className="font-medium text-green-400">Earn: </span>
                      <span className="text-muted-foreground">{ct.earnRate}</span>
                    </p>
                    <p className="text-xs">
                      <span className="font-medium text-amber-400">Setup: </span>
                      <span className="text-muted-foreground">{ct.setupCost}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dispatch Coordination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Dispatch Coordination: How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DISPATCH_STEPS.map((step) => (
              <div key={step.step} className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{step.step}</span>
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Member Energy Contribution Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Member Energy Contribution Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Every member's contribution is tracked per household per billing cycle.
              The member portal shows real-time data - not estimates.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-3 space-y-1 text-center">
                <p className="text-2xl font-bold text-yellow-400">kWh</p>
                <p className="text-xs text-muted-foreground">Contributed this cycle</p>
              </div>
              <div className="rounded-lg border bg-card p-3 space-y-1 text-center">
                <p className="text-2xl font-bold text-green-400">$</p>
                <p className="text-xs text-muted-foreground">Savings earned this cycle</p>
              </div>
              <div className="rounded-lg border bg-card p-3 space-y-1 text-center">
                <p className="text-2xl font-bold text-primary">★</p>
                <p className="text-xs text-muted-foreground">Marks earned for dispatch participation</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Each dispatch event logged with kWh, timestamp, node ID, and market
                  rate to the IP Ledger within 60 seconds of completion.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Monthly summary published to the member portal. Includes: total
                  contributed, total drawn, net balance, fees paid, and Marks earned.
                  Downloadable as CSV.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Anomaly detection: if a node's meter reading deviates more than 2%
                  from the dispatch authorization, an automatic audit flag is raised and
                  published to the member.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Honest Cost Telemetry */}
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              Cost+20% Pricing and Honest Cost Telemetry
            </CardTitle>
            <Badge variant="outline" className="w-fit text-xs border-green-500/40 text-green-400">
              No "$0" Claims. Real Numbers Only.
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Every cost is real and published. No "$0 energy" claims. No "free dispatch"
              promises. The Cost+20% model means members always pay the real cost of energy
              plus a transparent 20% coordination fee.
            </p>
            <div className="space-y-2">
              {ECONOMICS_ROWS.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                  <div className="space-y-0.5 flex-1">
                    <p className="font-medium text-foreground text-xs">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.note}</p>
                  </div>
                  <span className="font-mono font-semibold text-green-400 shrink-0 text-sm">{row.example}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Example above uses $0.08/kWh wholesale. Actual rates vary by market and event.
              All rates are published in real time on the member portal. Historical rate data
              is archived on the IP Ledger.
            </p>
          </CardContent>
        </Card>

        {/* IP Ledger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              IP Ledger: Dispatch Algorithm and Protocol Contributions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              The dispatch algorithm, metering firmware, and pool anchor protocol are
              registered as platform IP. Members who contribute improvements earn IP
              Ledger credits and participation Marks.
            </p>
            <div className="space-y-3">
              {IP_ENTRIES.map((entry) => (
                <div key={entry.title} className="rounded-lg border bg-card p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                    <p className="font-semibold text-sm">{entry.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
              <p className="text-xs font-semibold">Contributing to the Algorithm</p>
              <p className="text-xs text-muted-foreground">
                Members with energy systems experience can submit dispatch algorithm
                improvements via the cooperative IP branch protocol. Accepted improvements
                are merged into the canonical ledger, earn the contributor Marks, and are
                credited by name in the monthly algorithm release notes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Marks */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Marks for Energy Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Battery Storage Node operators earn 1 Mark per dispatch event
                  they participate in, in addition to their Cost+20% energy margin.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Demand Flexibility enrollees earn Marks for each peak event their
                  load-shifting contributes to - based on kW of deferred load.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Pool Anchor operators earn elevated Marks for providing neighborhood
                  resilience during outages - a contribution that benefits other members.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
              <p className="text-xs text-amber-300 font-semibold">Marks Disclosure</p>
              <p className="text-xs text-muted-foreground mt-1">
                Marks represent participation in the Liana Banyan cooperative. They are not
                equity, shares, or guaranteed financial return in the Battery Dispatch
                spinout or any other entity. Marks rates are held pending Founder ratification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Switzerland Protocol */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Switzerland Protocol
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Battery Dispatch operates under the cooperative's Switzerland Protocol: strictly
              neutral on energy policy, energy source preferences, and political agendas.
            </p>
            <p>
              The spinout dispatches the cheapest available energy for members at the moment
              of need. It does not preference solar over grid, gas over wind, or any political
              energy narrative. Members set their own preferences in their contribution settings.
              The platform respects them without lobbying for any outcome.
            </p>
          </CardContent>
        </Card>

        {/* Canon ref */}
        <p className="text-xs text-muted-foreground text-center">
          Canon reference: Battery Dispatch Spinout Entity - canonical_values.yaml spinout_entities.
          Wave 21 Phase beta.
        </p>

        {/* Marks footer disclaimer */}
        <p className="text-xs text-muted-foreground/60 text-center border-t border-border pt-4">
          Marks represent participation in the Liana Banyan cooperative - not equity, shares,
          or guaranteed financial return in any spinout entity.
          All energy costs are real numbers published per-event. No "$0" claims.
        </p>
      </div>
    </PortalPageLayout>
  );
}
