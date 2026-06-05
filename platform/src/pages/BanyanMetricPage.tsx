/**
 * BANYAN METRIC PAGE â€” Wave 9 / Phase C2
 * ========================================
 * Live public platform stats: innovations / Crown Jewels / provisionals /
 * MnemosyneC benchmark / member count / Cost+20% canon.
 *
 * Canon: 2,270 / 228 / 21 / 83.3% / Cost+20%
 * Benchmark: 92.7% accuracy / 3.6% drift (uuid e9c2b1a7)
 *
 * BP072-W9-C2
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageSEO } from "@/hooks/usePageSEO";
import {
  Lightbulb, Star, FlaskConical, Users, TrendingUp, ShieldCheck,
  ExternalLink, RefreshCw, Activity, Cpu, Globe, AlertCircle,
} from "lucide-react";

// â”€â”€â”€ Canon Constants (never change without a board decision) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CANON = {
  innovations: 2_270,
  crownJewels: 228,
  provisionals: 21,
  savingsRate: 83.3,
  platformMargin: 20, // Cost+20%
} as const;

const BENCHMARK = {
  accuracy: 92.7,
  drift: 3.6,
  uuid: "e9c2b1a7",
} as const;

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface BanyanStats {
  innovations: number;
  crownJewels: number;
  provisionals: number;
  memberCount: number;
  activeMembers: number;
}

// â”€â”€â”€ Data Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function useBanyanStats() {
  return useQuery({
    queryKey: ["banyan-metric-stats"],
    queryFn: async (): Promise<BanyanStats> => {
      // Try banyan_metric_stats view first (BP045 migration), fall back to platform_metrics
      const { data: bmData } = await supabase
        .from("banyan_metric_stats" as never)
        .select("*")
        .maybeSingle() as { data: any };

      if (bmData) {
        return {
          innovations: bmData.innovation_count ?? CANON.innovations,
          crownJewels: bmData.crown_jewel_count ?? CANON.crownJewels,
          provisionals: bmData.provisional_count ?? CANON.provisionals,
          memberCount: bmData.member_count ?? 0,
          activeMembers: bmData.active_members ?? 0,
        };
      }

      // Fallback: query platform_metrics for innovation_count and active_members
      const { data: metricsData } = await supabase
        .from("platform_metrics" as never)
        .select("metric_name, metric_value")
        .in("metric_name", ["innovation_count", "active_members", "patent_claims"]) as {
          data: { metric_name: string; metric_value: number }[] | null;
        };

      const metricMap: Record<string, number> = {};
      (metricsData || []).forEach((m) => {
        metricMap[m.metric_name] = m.metric_value;
      });

      // Member count from member_profiles
      const { count: memberCount } = await supabase
        .from("member_profiles" as never)
        .select("*", { count: "exact", head: true }) as { count: number | null };

      return {
        innovations: metricMap["innovation_count"] ?? CANON.innovations,
        crownJewels: CANON.crownJewels, // authoritative canon until BM view is live
        provisionals: CANON.provisionals,
        memberCount: memberCount ?? 0,
        activeMembers: metricMap["active_members"] ?? 0,
      };
    },
    staleTime: 5 * 60_000, // 5 min
  });
}

// â”€â”€â”€ Sub-Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}

function StatTile({ icon, label, value, sub, highlight }: StatTileProps) {
  return (
    <Card className={highlight ? "border-primary/40 bg-primary/5" : ""}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
        <div className={`rounded-full p-3 ${highlight ? "bg-primary/20" : "bg-muted"}`}>
          {icon}
        </div>
        <p className="text-3xl font-bold tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function BenchmarkBadge() {
  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          MnemosyneC Benchmark
        </CardTitle>
        <CardDescription>Independent verification of platform accuracy claims</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{BENCHMARK.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Recall accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{BENCHMARK.drift}%</p>
            <p className="text-xs text-muted-foreground">Content drift</p>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <Badge variant="outline" className="font-mono text-xs">
              {BENCHMARK.uuid}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Proof UUID</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/proofs">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View Verification Posters
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CostPlusPanel() {
  const retailCost = 500;
  const memberCost = Math.round(retailCost / (1 + CANON.platformMargin / 100) * 100) / 100;
  const savings = retailCost - memberCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Cost+{CANON.platformMargin}% Pricing
        </CardTitle>
        <CardDescription>
          Members pay cost plus {CANON.platformMargin}% â€” the platform margin is fixed and transparent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold">${retailCost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Retail price</p>
          </div>
          <div className="text-2xl text-muted-foreground">â†’</div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-green-600">${memberCost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Member price</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-primary">${savings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">You save</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Example: A $500 retail item costs a member ${memberCost.toFixed(2)} â€” that's
          ${savings.toFixed(2)} saved. Average across all categories: {CANON.savingsRate}% savings rate.
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            NOT A GUARANTEE. Savings vary by category, supplier, and volume. The {CANON.savingsRate}%
            figure is a platform average across validated transactions, not a minimum or promise.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityHeatmapStub() {
  // Stub: real activity heatmap connects to analytics_daily_summary view when live
  const cells = Array.from({ length: 52 * 7 }, (_, i) => {
    const seed = (i * 37 + 13) % 100;
    return seed < 10 ? 3 : seed < 25 ? 2 : seed < 40 ? 1 : 0;
  });
  const intensityClass = ["bg-muted/20", "bg-primary/20", "bg-primary/50", "bg-primary/80"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Platform Activity
          <Badge variant="outline" className="text-[10px] font-normal">Preview</Badge>
        </CardTitle>
        <CardDescription>
          Activity heatmap â€” stub shape, connects to live analytics when DB view is deployed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))", gridTemplateRows: "repeat(7, 8px)" }}
          >
            {cells.map((intensity, i) => (
              <div
                key={i}
                className={`rounded-[1px] ${intensityClass[intensity]}`}
                title={`Week ${Math.floor(i / 7) + 1}, Day ${(i % 7) + 1}`}
              />
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          TODO: Connect to <code>analytics_daily_summary</code> view for real activity data.
        </p>
      </CardContent>
    </Card>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function BanyanMetricPage() {
  usePageSEO({
    title: "Banyan Metric | Liana Banyan",
    description: "The community health score for Liana Banyan. Track cooperative vitality, member engagement, and platform sustainability.",
    canonical: "https://lianabanyan.com/banyan-metric",
  });
  const { t } = useTranslation();
  const { data, isLoading, refetch, isRefetching } = useBanyanStats();

  return (
    <PortalPageLayout maxWidth="xl" xrayId="banyan-metric">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-7 w-7 text-primary" />
              Banyan Metrics
            </h1>
            <p className="mt-1 text-muted-foreground">
              Live platform statistics, innovation counts, and cooperative benchmarks.
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Canon stat tiles */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatTile
              icon={<Lightbulb className="h-6 w-6 text-yellow-600" />}
              label="Innovations"
              value={data?.innovations ?? CANON.innovations}
              sub="Registered in IP ledger"
              highlight
            />
            <StatTile
              icon={<Star className="h-6 w-6 text-amber-600" />}
              label="Crown Jewels"
              value={data?.crownJewels ?? CANON.crownJewels}
              sub="Elite-tier innovations"
            />
            <StatTile
              icon={<FlaskConical className="h-6 w-6 text-blue-600" />}
              label="Provisionals"
              value={data?.provisionals ?? CANON.provisionals}
              sub="Filed patent applications"
            />
            <StatTile
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              label="Avg Savings"
              value={`${CANON.savingsRate}%`}
              sub="Across all categories"
            />
            <StatTile
              icon={<Users className="h-6 w-6 text-violet-600" />}
              label="Members"
              value={data?.memberCount || "--"}
              sub={data?.activeMembers ? `${data.activeMembers} active` : "Loading..."}
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <BenchmarkBadge />
          <CostPlusPanel />
        </div>

        <ActivityHeatmapStub />

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">NOT A GUARANTEE.</span> Canon figures (2,270 innovations /
            228 Crown Jewels / 21 provisionals / 83.3% savings) are verified historical averages,
            not forward-looking projections. Results vary by member, category, and usage.
            Valuation displays are informational only and do not constitute a securities offering.
          </p>
        </div>

        {/* Platform integrity */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Cpu className="h-5 w-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Platform Integrity</p>
              <p className="text-xs text-muted-foreground">
                IP Ledger hash chain | MnemosyneC benchmark | Augur governance gate | Stripe Cost+20%
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/proofs">
                <ShieldCheck className="mr-1 h-4 w-4" />
                Verification
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
