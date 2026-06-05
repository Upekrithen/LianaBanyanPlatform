/**
 * DefenseKlausSpinoutPage -- Wave 21 Phase beta
 * ================================================
 * Route: /spinouts/defense-klaus
 *
 * Full business-plan landing for the Defense Klaus SPINOUT ENTITY.
 * Distinct from the /initiatives/defense-klaus initiative page.
 *
 * Doctrine:
 *   - Securities-clean: Marks = participation, never equity or guaranteed return.
 *   - The legal-defense fund is a mutual-aid pool, NOT an investment vehicle.
 *   - Cost+20% production pricing; factory nodes earn 83.3% of manufacturing margin.
 *   - IP: product design is platform IP (Brand Stamp, IP Ledger).
 *   - Marks awarded for contributing to the legal-defense fund pool.
 *   - Order flow: members request a unit via the bounty system.
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
  Shield,
  Factory,
  Scale,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  MapPin,
  Layers,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { usePageSEO } from "@/hooks/usePageSEO";

const PRODUCTION_LEVELS = [
  {
    level: 1,
    name: "Prototype",
    role: "First design iteration and fit-testing the palm-claw mechanism.",
    batch: "1-10 units",
    who: "Certified design node",
  },
  {
    level: 2,
    name: "Pilot",
    role: "First real run: validate assembly steps, GPS module calibration, pull-test the claws.",
    batch: "10-100 units",
    who: "Single certified factory node",
  },
  {
    level: 3,
    name: "Small Batch",
    role: "Initial member fulfillment. Artisan quality. Each unit inspected before ship.",
    batch: "100-500 units",
    who: "1-2 factory nodes",
  },
  {
    level: 4,
    name: "Medium Run",
    role: "Coordinated production: standardized BOM, quality protocol across nodes, inventory managed.",
    batch: "500-5,000 units",
    who: "2-5 factory nodes",
  },
  {
    level: 5,
    name: "Large Run",
    role: "Network-wide production. Anchor compatibility layer routes BOM to best-priced nodes.",
    batch: "5,000-50,000 units",
    who: "Multiple nodes in parallel",
  },
  {
    level: 6,
    name: "Mass Production",
    role: "Full cooperative manufacturing network. Decentralized, no single point of failure.",
    batch: "50,000+ units",
    who: "Full factory network",
  },
];

const COST_BREAKDOWN = [
  { label: "Direct manufacturing cost (materials + labor at node)", value: "~$3.00", note: "Node keeps 83.3% of the $3 margin" },
  { label: "Platform coordination fee (Cost+20%)", value: "$0.60", note: "Covers IP amortization, dispatch, logistics overhead" },
  { label: "Legal defense fund deposit (100% of net proceeds)", value: "$2.40", note: "Goes directly into the mutual-aid pool" },
  { label: "Member price", value: "$6.00", note: "All-in. No hidden charges." },
];

const FUND_RULES = [
  "Every cooperative member has equal access to the fund regardless of contribution level.",
  "No means-testing. No asset checks. No tiers.",
  "The fund covers legal representation costs for members facing criminal or civil proceedings.",
  "The Defense Klaus spinout entity administers disbursements by a member-elected committee.",
  "The fund is a mutual-aid pool - not an investment, not a contract of insurance, not a security.",
  "Members who contribute Marks to the fund pool earn participation Marks - not a return or dividend.",
  "Fund balances and disbursements are published monthly on the public IP ledger.",
];

const BOUNTY_STEPS = [
  {
    step: 1,
    title: "Member submits a unit request",
    description:
      "Any cooperative member can open a Defense Klaus request via the Bounty system. A minimum $1 Marks deposit places the request in the queue.",
  },
  {
    step: 2,
    title: "Bounty is assigned to a certified factory node",
    description:
      "The platform dispatches the order to the nearest available Level 2+ certified node. The node confirms capacity and accepts the bounty.",
  },
  {
    step: 3,
    title: "Production and quality check",
    description:
      "The node produces the unit. A platform-standard pull-test and GPS activation check is logged before shipping.",
  },
  {
    step: 4,
    title: "Shipping and legal fund deposit",
    description:
      "Unit ships to the member. $2.40 from the transaction is deposited automatically into the legal defense fund pool.",
  },
  {
    step: 5,
    title: "IP Ledger stamp",
    description:
      "Each unit's production record is written to the IP Ledger with a Brand Stamp hash, linking the physical product to the platform IP record.",
  },
];

// ─── Live-data hook: fund pool stats ─────────────────────────────────────────

interface DkPoolStats {
  total_pool_cents: number;
  contributor_count: number;
  pending_contributions: number;
}

function useDkPoolStats() {
  return useQuery<DkPoolStats>({
    queryKey: ["dk-pool-stats"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("dk_pool_stats")
        .select("*")
        .maybeSingle();
      return data ?? { total_pool_cents: 0, contributor_count: 0, pending_contributions: 0 };
    },
    staleTime: 2 * 60_000,
  });
}

interface DkOrderCount {
  count: number;
}

function useDkOrderCount() {
  return useQuery<DkOrderCount>({
    queryKey: ["dk-order-count"],
    queryFn: async () => {
      const { count } = await (supabase as any)
        .from("dk_orders")
        .select("*", { count: "exact", head: true });
      return { count: count ?? 0 };
    },
    staleTime: 2 * 60_000,
  });
}

export default function DefenseKlausSpinoutPage() {
  usePageSEO({
    title: "Defense Klaus | Liana Banyan Spinout",
    description: "Community defense and neighborhood safety cooperative spinout from the Liana Banyan platform.",
    canonical: "https://lianabanyan.com/spinouts/defense-klaus",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: poolStats } = useDkPoolStats();
  const { data: orderData } = useDkOrderCount();

  const poolDollars = ((poolStats?.total_pool_cents ?? 0) / 100).toFixed(2);
  const orderCount = orderData?.count ?? 0;

  return (
    <PortalPageLayout variant="stage" xrayId="defense-klaus-spinout-page">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Back nav */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/spinouts")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          All 7 Spinouts
        </Button>

        {/* Hero */}
        <div className="rounded-2xl border-2 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-amber-500/30 p-6 space-y-3">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🛡️</span>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">Defense Klaus</h1>
                <Badge variant="outline">Spinout Entity #1</Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400">Forming</Badge>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl">
                Physical personal-protection device manufactured through the decentralized factory
                network. 100% of proceeds fund the shared legal-defense pool for all cooperative
                members.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary" className="text-xs">Safety &amp; Legal</Badge>
                <Badge variant="secondary" className="text-xs">Cost+20%</Badge>
                <Badge variant="secondary" className="text-xs">Mutual-Aid Fund</Badge>
                <Badge variant="secondary" className="text-xs">L1-L6 Production</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Live Fund Stats */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-400" />
              Legal Defense Fund -- Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-400">${poolDollars}</div>
                <div className="text-xs text-muted-foreground mt-1">Pool Balance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{poolStats?.contributor_count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Contributors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{orderCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Unit Orders</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Live from Supabase. Marks = participation -- not equity or financial return.
            </p>
          </CardContent>
        </Card>

        {/* Why this is a spinout */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Why Defense Klaus Is a Spinout (Not an Initiative)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              The Defense Klaus Initiative (#8) is the community safety program funded by the
              cooperative. The Defense Klaus Spinout is the separate legal entity that holds
              the manufacturing contracts, administers the legal defense fund, and owns the
              product IP under a Brand Stamp license from the platform.
            </p>
            <p>
              Legal separation is required because: (1) the legal defense fund requires its own
              fiduciary structure and disbursement committee, and (2) manufacturing contracts
              with external factory nodes require an entity capable of entering agreements.
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
                Individuals facing legal jeopardy - especially in underserved communities - cannot
                afford legal representation. The system is stacked against those who cannot pay.
                A $6 safety product that simultaneously builds a legal defense reserve is a
                structural fix, not a donation.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Who We Serve</p>
              <p className="text-muted-foreground">
                All 2,270+ cooperative members are the first customers. Each bracelet purchase
                funds legal defense access for the buyer and every other member. The product
                is also available to non-members at the same price, with proceeds still
                flowing to the member fund.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Offering</p>
              <p className="text-muted-foreground italic">
                "I help cooperative members protect themselves physically and legally so they
                never face danger or the legal system alone."
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Day 30: First factory node certified for Defense Klaus production (Level 2 minimum)</li>
                <li>Day 60: First 500 units produced and shipped to members via bounty queue</li>
                <li>Day 90: Legal fund holds first meaningful reserve; first legal-assist case documented and published</li>
              </ol>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">
                <strong>Legal Gate:</strong> Held pending legal defense fund formation review and
                member committee election. Founder action required before fund activation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* The Product */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              The Physical Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              The Defense Klaus safety bracelet is a wearable personal-protection device. It is
              designed to be inconspicuous, durable, and manufacturable by cooperative factory nodes
              at the Cost+20% margin.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <p className="font-semibold flex items-center gap-1"><span className="text-base">🦾</span> Palm-Claw Mechanism</p>
                <p className="text-muted-foreground text-xs">
                  Pull-up deployable claws sit recessed in the wrist band. Single-pull activation.
                  Force-tested at 40+ Newtons. Designed to be tool-free, field-replaceable after
                  deployment. Palm placement keeps hands functional for grip tasks.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <p className="font-semibold flex items-center gap-1"><MapPin className="h-4 w-4 text-amber-500" /> GPS Broadcast</p>
                <p className="text-muted-foreground text-xs">
                  Same pull activates a low-power GPS beacon broadcasting to the member's
                  emergency contacts and the cooperative's safety network. Broadcast lasts 6 hours
                  on a single charge. Charges via USB-C. Location data is member-controlled
                  and never stored by the platform.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <p className="font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4 text-green-500" /> $6 Member Price</p>
                <p className="text-muted-foreground text-xs">
                  All-in price to cooperative members. No subscription, no upsell, no tier.
                  Non-members pay the same price. Pricing is fixed by the Cost+20% model
                  and is publicly auditable on the IP Ledger.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <p className="font-semibold flex items-center gap-1"><Users className="h-4 w-4 text-blue-500" /> Made by Members</p>
                <p className="text-muted-foreground text-xs">
                  Every unit is produced by a certified cooperative factory node. No offshore
                  manufacturing contracts. Node operators set their own schedules and accept
                  bounties on their timeline. Quality is enforced by the Anchor protocol.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost+20% Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Cost+20% Pricing Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Every dollar is accounted for and publicly auditable. The $6 member price
              breaks down as follows:
            </p>
            <div className="space-y-2">
              {COST_BREAKDOWN.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                  <div className="space-y-0.5 flex-1">
                    <p className="font-medium text-foreground">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.note}</p>
                  </div>
                  <span className="font-mono font-semibold text-green-400 shrink-0">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Factory nodes earn 83.3% of the $3 manufacturing margin. The 16.7% platform fee
              covers the IP license, Anchor protocol certification, dispatch overhead, and
              payment processing. Cost telemetry is published per-batch on the IP Ledger.
            </p>
          </CardContent>
        </Card>

        {/* L1-L6 Production */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-primary" />
              How the Decentralized Factory System Produces It
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Six production levels from prototype to mass scale.
              <Button variant="link" size="sm" className="px-1 h-auto text-xs" onClick={() => navigate("/factory/production-systems")}>
                Full system overview
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PRODUCTION_LEVELS.map((lvl) => (
                <div key={lvl.level} className="flex items-start gap-3 text-sm">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">L{lvl.level}</span>
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{lvl.name}</span>
                      <Badge variant="outline" className="text-xs">{lvl.batch}</Badge>
                      <span className="text-xs text-muted-foreground">{lvl.who}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{lvl.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
              Node certification is managed by the Anchor spinout. A Defense Klaus production
              node must hold a Level 2+ certification and pass the pull-test protocol before
              receiving bounties. Volume discount tiers apply at L4+.
            </p>
          </CardContent>
        </Card>

        {/* The Legal Defense Fund */}
        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              The Legal-Defense Fund
            </CardTitle>
            <Badge variant="outline" className="w-fit text-xs border-green-500/40 text-green-400">
              Mutual-Aid Pool - NOT an Investment Vehicle
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              The legal-defense fund is a mutual-aid pool administered by the Defense Klaus
              spinout entity. It is not a financial product, not a contract of insurance, and
              not a security.
            </p>
            <div className="space-y-2">
              {FUND_RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground text-xs">{rule}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-1">
              <p className="text-xs font-semibold text-amber-400">Securities-Clean Disclosure</p>
              <p className="text-xs text-muted-foreground">
                Purchasing a Defense Klaus unit does not entitle the buyer to any share of the
                fund, any return on investment, or any equity in the Defense Klaus spinout entity.
                Marks earned for contributing to the fund represent participation in the
                cooperative - they are not transferable financial instruments and carry no
                guaranteed value.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order / Request Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Order / Request Flow via the Bounty System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {BOUNTY_STEPS.map((step) => (
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
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate("/bounty-poster-generator")}
              >
                Open Bounty Poster Generator
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* IP Ledger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              IP Ledger and Brand Stamp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              The Defense Klaus product design - including the palm-claw mechanism geometry,
              the GPS activation circuit schematic, and the bracelet BOM - is registered as
              platform IP on the IP Ledger.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-3 space-y-1">
                <p className="font-semibold text-xs">IP Type</p>
                <p className="text-xs text-muted-foreground">Registered product design (physical hardware)</p>
              </div>
              <div className="rounded-lg border bg-card p-3 space-y-1">
                <p className="font-semibold text-xs">Brand Stamp</p>
                <p className="text-xs text-muted-foreground">Each production batch stamped with SHA-256 hash linked to the IP ledger entry</p>
              </div>
              <div className="rounded-lg border bg-card p-3 space-y-1">
                <p className="font-semibold text-xs">License to Nodes</p>
                <p className="text-xs text-muted-foreground">Factory nodes produce under a cooperative IP license - not a franchise. Nodes cannot sub-license.</p>
              </div>
              <div className="rounded-lg border bg-card p-3 space-y-1">
                <p className="font-semibold text-xs">Derivative Works</p>
                <p className="text-xs text-muted-foreground">Node improvements to the design must be submitted back to the IP Ledger under the cooperative IP branch protocol.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks for Contributing */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Marks for Legal-Defense Fund Contributions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Members who contribute above-baseline to the legal-defense fund pool - either by
              purchasing additional units, gifting units, or making direct pool contributions -
              earn participation Marks.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  1 Mark per $1 contributed to the legal-defense fund above the base unit purchase.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Marks earned here are participation Marks - they represent your role in the
                  cooperative's mutual-aid infrastructure, not a financial claim on the fund.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Factory nodes that produce Defense Klaus units earn Marks in addition to their
                  83.3% manufacturing margin - for certified contribution to the safety network.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
              <p className="text-xs text-amber-300 font-semibold">Marks Disclosure</p>
              <p className="text-xs text-muted-foreground mt-1">
                Marks represent participation in the Liana Banyan cooperative. They are not
                equity, shares, or guaranteed financial return in any spinout entity. Marks
                rates are set by the Founder and subject to ratification. Rates are held
                pending Founder review.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigate to initiative page */}
        <Card className="border-border/50">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              See the Defense Klaus Initiative page for the community safety program and
              the "I Need a Hero" response protocol.
            </div>
            <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => navigate("/initiatives/defense-klaus")}>
              Initiative Page
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Canon ref */}
        <p className="text-xs text-muted-foreground text-center">
          Canon reference: Defense Klaus Spinout Entity - canonical_values.yaml spinout_entities.
          Wave 21 Phase beta.
        </p>

        {/* Marks footer disclaimer */}
        <p className="text-xs text-muted-foreground/60 text-center border-t border-border pt-4">
          Marks represent participation in the Liana Banyan cooperative - not equity, shares,
          or guaranteed financial return in any spinout entity.
          The legal-defense fund is a mutual-aid pool, not an investment vehicle or contract of insurance.
        </p>
      </div>
    </PortalPageLayout>
  );
}
