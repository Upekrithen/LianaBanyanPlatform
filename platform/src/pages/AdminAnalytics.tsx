/**
 * ADMIN ANALYTICS DASHBOARD
 * ==========================
 * Platform-wide analytics for Liana Banyan stewards.
 * Privacy-first: no PII displayed. Only aggregate metrics.
 * Data from analytics_daily_summary and analytics_page_views views.
 *
 * Innovation #1548 — Admin Analytics Dashboard (Session 8A)
 * BP072-W9-C4: Test telemetry + Star-Chamber/Augur logs + error budget
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  BarChart3, TrendingUp, Users, Eye, MousePointer, CreditCard,
  ArrowRight, Calendar, RefreshCw, ShieldCheck, Activity,
  Layers, Globe, TestTube, Gavel, AlertTriangle, CheckCircle2,
  XCircle, Clock, Gauge,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

interface DailySummary {
  event_date: string;
  event_type: string;
  event_count: number;
  unique_users: number;
  unique_sessions: number;
}

interface PageViewSummary {
  view_date: string;
  page_path: string;
  view_count: number;
  unique_viewers: number;
  unique_sessions: number;
}

interface PlatformStats {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  topEventTypes: Array<{ type: string; count: number }>;
  topPages: Array<{ path: string; views: number; uniqueViewers: number }>;
  dailyTrend: Array<{ date: string; events: number; users: number }>;
  pledgeStats: { totalPledges: number; totalAmount: number; uniqueBackers: number };
  creditStats: { totalPurchases: number };
}

// ─── C4: Additional Types ────────────────────────────────────

interface TestTelemetryEntry {
  metric_name: string;
  metric_value: number;
  recorded_at: string;
  context: Record<string, unknown> | null;
}

interface VerdictLogEntry {
  id: string;
  case_id?: string;
  verdict?: string;
  status?: string;
  created_at: string;
  context?: Record<string, unknown> | null;
}

interface ErrorBudget {
  errorRate: number;
  budget: number;
  consumed: number;
  remaining: number;
}

// ─── Helpers ─────────────────────────────────────────────────

const EVENT_TYPE_LABELS: Record<string, { label: string; icon: typeof Activity }> = {
  page_view: { label: "Page Views", icon: Eye },
  project_viewed: { label: "Project Views", icon: Layers },
  project_backed: { label: "Projects Backed", icon: ArrowRight },
  credit_purchased: { label: "Credit Purchases", icon: CreditCard },
  portal_entry: { label: "Portal Entries", icon: Globe },
  initiative_viewed: { label: "Initiative Views", icon: TrendingUp },
  user_signup: { label: "Sign-ups", icon: Users },
  user_login: { label: "Logins", icon: Users },
  pledge_cancelled: { label: "Pledges Cancelled", icon: MousePointer },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Data Fetching ──────────────────────────────────────────

function useAnalyticsData(days: number) {
  return useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: async (): Promise<PlatformStats> => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split("T")[0];

      // Fetch daily summary
      const { data: dailyData } = await supabase
        .from("analytics_daily_summary" as any)
        .select("*")
        .gte("event_date", sinceStr)
        .order("event_date", { ascending: false });

      // Fetch page views
      const { data: pageData } = await supabase
        .from("analytics_page_views" as any)
        .select("*")
        .gte("view_date", sinceStr)
        .order("view_count", { ascending: false })
        .limit(20);

      const summaries = (dailyData || []) as unknown as DailySummary[];
      const pages = (pageData || []) as unknown as PageViewSummary[];

      // Aggregate stats
      const totalEvents = summaries.reduce((s, d) => s + d.event_count, 0);
      const allUserIds = new Set<number>();
      const allSessionIds = new Set<number>();
      summaries.forEach((d) => {
        allUserIds.add(d.unique_users);
        allSessionIds.add(d.unique_sessions);
      });

      // Top event types
      const typeMap = new Map<string, number>();
      summaries.forEach((d) => {
        typeMap.set(d.event_type, (typeMap.get(d.event_type) || 0) + d.event_count);
      });
      const topEventTypes = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Top pages
      const pageMap = new Map<string, { views: number; uniqueViewers: number }>();
      pages.forEach((p) => {
        const existing = pageMap.get(p.page_path) || { views: 0, uniqueViewers: 0 };
        pageMap.set(p.page_path, {
          views: existing.views + p.view_count,
          uniqueViewers: existing.uniqueViewers + p.unique_viewers,
        });
      });
      const topPages = Array.from(pageMap.entries())
        .map(([path, stats]) => ({ path, ...stats }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15);

      // Daily trend (aggregate all event types per day)
      const dayMap = new Map<string, { events: number; users: number }>();
      summaries.forEach((d) => {
        const existing = dayMap.get(d.event_date) || { events: 0, users: 0 };
        dayMap.set(d.event_date, {
          events: existing.events + d.event_count,
          users: Math.max(existing.users, d.unique_users),
        });
      });
      const dailyTrend = Array.from(dayMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Pledge stats
      const pledgeEvents = summaries.filter((d) => d.event_type === "project_backed");
      const pledgeStats = {
        totalPledges: pledgeEvents.reduce((s, d) => s + d.event_count, 0),
        totalAmount: 0, // Would need separate query for amounts
        uniqueBackers: pledgeEvents.reduce((s, d) => s + d.unique_users, 0),
      };

      // Credit stats
      const creditEvents = summaries.filter((d) => d.event_type === "credit_purchased");
      const creditStats = {
        totalPurchases: creditEvents.reduce((s, d) => s + d.event_count, 0),
      };

      // Unique users/sessions are approximate (sum of daily uniques, not true uniques)
      const uniqueUsers = summaries.reduce((s, d) => s + d.unique_users, 0);
      const uniqueSessions = summaries.reduce((s, d) => s + d.unique_sessions, 0);

      return {
        totalEvents,
        uniqueUsers,
        uniqueSessions,
        topEventTypes,
        topPages,
        dailyTrend,
        pledgeStats,
        creditStats,
      };
    },
    staleTime: 60_000, // 1 minute
  });
}

// ─── C4: Test Telemetry Hook ─────────────────────────────────

function useTestTelemetry() {
  return useQuery({
    queryKey: ["admin-test-telemetry"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_metrics" as any)
        .select("metric_name, metric_value, recorded_at, context")
        .ilike("metric_name", "test_%")
        .order("recorded_at", { ascending: false })
        .limit(100) as { data: TestTelemetryEntry[] | null };

      const entries = data || [];

      // Aggregate by metric name for sparkline/summary
      const nameMap = new Map<string, { latest: number; history: number[] }>();
      entries.forEach((e) => {
        const existing = nameMap.get(e.metric_name) || { latest: 0, history: [] };
        existing.history.push(e.metric_value);
        if (existing.history.length === 1) existing.latest = e.metric_value;
        nameMap.set(e.metric_name, existing);
      });

      const summary = Array.from(nameMap.entries()).map(([name, d]) => ({
        name,
        latest: d.latest,
        history: d.history.slice(0, 20).reverse(),
        total: d.history.reduce((s, v) => s + v, 0),
      }));

      // Pass/fail extraction if stored as test_pass / test_fail metrics
      const passSeries = entries.filter((e) => e.metric_name === "test_pass");
      const failSeries = entries.filter((e) => e.metric_name === "test_fail");
      const totalPass = passSeries.reduce((s, e) => s + e.metric_value, 0);
      const totalFail = failSeries.reduce((s, e) => s + e.metric_value, 0);

      return { summary, entries, totalPass, totalFail };
    },
    staleTime: 60_000,
  });
}

// ─── C4: Verdict Log / Augur Hook ────────────────────────────

function useVerdictLog(limit = 30) {
  return useQuery({
    queryKey: ["admin-verdict-log", limit],
    queryFn: async () => {
      const { data } = await supabase
        .from("verdict_log" as any)
        .select("id, case_id, verdict, status, created_at, context")
        .order("created_at", { ascending: false })
        .limit(limit) as { data: VerdictLogEntry[] | null };

      const entries = data || [];

      // Reconciliation state summary
      const statusCounts = entries.reduce<Record<string, number>>((acc, e) => {
        const s = e.status || "unknown";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});

      const verdictCounts = entries.reduce<Record<string, number>>((acc, e) => {
        const v = e.verdict || "pending";
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      }, {});

      return { entries, statusCounts, verdictCounts };
    },
    staleTime: 30_000,
  });
}

// ─── C4: Error Budget Hook ───────────────────────────────────

function useErrorBudget() {
  return useQuery({
    queryKey: ["admin-error-budget"],
    queryFn: async (): Promise<ErrorBudget> => {
      const { data } = await supabase
        .from("platform_metrics" as any)
        .select("metric_name, metric_value")
        .eq("metric_name", "error_rate")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle() as { data: { metric_name: string; metric_value: number } | null };

      const errorRate = data?.metric_value ?? 0;
      const budget = 0.1; // 0.1% SLO error budget
      const consumed = Math.min(errorRate, budget);
      const remaining = Math.max(0, budget - consumed);

      return { errorRate, budget, consumed, remaining };
    },
    staleTime: 60_000,
  });
}

// ─── Components ─────────────────────────────────────────────

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: typeof Activity;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === "number" ? formatNumber(value) : value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function BarChart({ data, maxValue }: { data: Array<{ label: string; value: number }>; maxValue: number }) {
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-24 truncate text-right" title={item.label}>
            {item.label}
          </span>
          <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-sm transition-all duration-500"
              style={{ width: `${Math.max(2, (item.value / maxValue) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium w-12 text-right">{formatNumber(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DailyTrendChart({ data }: { data: Array<{ date: string; events: number; users: number }> }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data available yet</p>;
  }

  const maxEvents = Math.max(...data.map((d) => d.events), 1);
  const chartHeight = 200;

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-[2px] h-[200px]">
        {data.map((day, i) => {
          const height = (day.events / maxEvents) * chartHeight;
          return (
            <div
              key={i}
              className="flex-1 bg-primary/40 hover:bg-primary/70 transition-colors rounded-t-sm cursor-default group relative"
              style={{ height: `${height}px` }}
              title={`${formatDate(day.date)}: ${day.events} events, ~${day.users} users`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {day.events}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{data.length > 0 ? formatDate(data[0].date) : ""}</span>
        <span>{data.length > 0 ? formatDate(data[data.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function AdminAnalytics() {
  const [days, setDays] = useState(7);
  const { data: stats, isLoading, refetch, isRefetching } = useAnalyticsData(days);
  const { data: testTelemetry } = useTestTelemetry();
  const { data: verdictLog } = useVerdictLog();
  const { data: errorBudget } = useErrorBudget();

  return (
    <PortalPageLayout maxWidth="xl" xrayId="admin-analytics">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-7 h-7" />
              Platform Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Aggregate platform usage metrics. No PII displayed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[7, 14, 30, 90].map((d) => (
                <Button
                  key={d}
                  variant={days === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDays(d)}
                >
                  {d}d
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-xs text-green-700 dark:text-green-400">
              Privacy-first analytics. No PII collected. No cross-site tracking. No cookies.
              All data stays within the Liana Banyan cooperative.
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !stats ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
              <p className="text-sm text-muted-foreground">
                Analytics events will appear here once the analytics_events table is populated.
                Events are tracked automatically as users interact with the platform.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Event Breakdown</TabsTrigger>
              <TabsTrigger value="pages">Page Views</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="tests">Test Telemetry</TabsTrigger>
              <TabsTrigger value="augur">Augur / Verdicts</TabsTrigger>
              <TabsTrigger value="error-budget">Error Budget</TabsTrigger>
            </TabsList>

            {/* ════════ OVERVIEW ════════ */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Events"
                  value={stats.totalEvents}
                  description={`Last ${days} days`}
                  icon={Activity}
                />
                <StatCard
                  title="Unique Users"
                  value={stats.uniqueUsers}
                  description="Approximate (daily sum)"
                  icon={Users}
                />
                <StatCard
                  title="Unique Sessions"
                  value={stats.uniqueSessions}
                  description="Per-page-load sessions"
                  icon={Layers}
                />
                <StatCard
                  title="Projects Backed"
                  value={stats.pledgeStats.totalPledges}
                  description={`${stats.pledgeStats.uniqueBackers} unique backers`}
                  icon={ArrowRight}
                />
              </div>

              {/* Daily Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Daily Activity Trend
                  </CardTitle>
                  <CardDescription>Total events per day over the last {days} days</CardDescription>
                </CardHeader>
                <CardContent>
                  <DailyTrendChart data={stats.dailyTrend} />
                </CardContent>
              </Card>

              {/* Quick Stats Row */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Credit Purchases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatNumber(stats.creditStats.totalPurchases)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Checkout sessions initiated in the last {days} days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Event Types Tracked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.topEventTypes.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Distinct event types observed
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ════════ EVENT BREAKDOWN ════════ */}
            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="w-5 h-5" />
                    Event Type Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of all tracked events over the last {days} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.topEventTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No events recorded yet
                    </p>
                  ) : (
                    <BarChart
                      data={stats.topEventTypes.map((e) => ({
                        label: EVENT_TYPE_LABELS[e.type]?.label || e.type,
                        value: e.count,
                      }))}
                      maxValue={stats.topEventTypes[0]?.count || 1}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Event Type Cards */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {stats.topEventTypes.map((evt) => {
                  const config = EVENT_TYPE_LABELS[evt.type];
                  const Icon = config?.icon || Activity;
                  return (
                    <Card key={evt.type}>
                      <CardContent className="pt-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {config?.label || evt.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(evt.count)} events
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ════════ PAGE VIEWS ════════ */}
            <TabsContent value="pages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Top Pages
                  </CardTitle>
                  <CardDescription>
                    Most visited pages over the last {days} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.topPages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No page view data yet
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-xs text-muted-foreground font-semibold uppercase border-b pb-2 mb-2">
                        <span>Page Path</span>
                        <span className="w-16 text-right">Views</span>
                        <span className="w-16 text-right">Users</span>
                      </div>
                      {stats.topPages.map((page, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1fr_auto_auto] gap-4 text-sm py-1.5 border-b border-border/50 last:border-0"
                        >
                          <span className="font-mono text-xs truncate" title={page.path}>
                            {page.path}
                          </span>
                          <span className="w-16 text-right font-medium">
                            {formatNumber(page.views)}
                          </span>
                          <span className="w-16 text-right text-muted-foreground">
                            {formatNumber(page.uniqueViewers)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════ ENGAGEMENT ════════ */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Avg Events/Day"
                  value={
                    stats.dailyTrend.length > 0
                      ? Math.round(stats.totalEvents / stats.dailyTrend.length)
                      : 0
                  }
                  description={`Over ${stats.dailyTrend.length} days with activity`}
                  icon={Activity}
                />
                <StatCard
                  title="Avg Users/Day"
                  value={
                    stats.dailyTrend.length > 0
                      ? Math.round(
                          stats.dailyTrend.reduce((s, d) => s + d.users, 0) / stats.dailyTrend.length
                        )
                      : 0
                  }
                  description="Approximate daily active users"
                  icon={Users}
                />
                <StatCard
                  title="Pledge-to-View Ratio"
                  value={
                    stats.topEventTypes.find((e) => e.type === "project_viewed")?.count
                      ? `${(
                          (stats.pledgeStats.totalPledges /
                            (stats.topEventTypes.find((e) => e.type === "project_viewed")?.count || 1)) *
                          100
                        ).toFixed(1)}%`
                      : "N/A"
                  }
                  description="Percentage of project views that result in a pledge"
                  icon={TrendingUp}
                />
              </div>

              {/* Engagement Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Funnel</CardTitle>
                  <CardDescription>
                    From page views to conversions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Page Views", type: "page_view" },
                      { label: "Project Views", type: "project_viewed" },
                      { label: "Credit Purchases", type: "credit_purchased" },
                      { label: "Projects Backed", type: "project_backed" },
                    ].map((step, i) => {
                      const count = stats.topEventTypes.find((e) => e.type === step.type)?.count || 0;
                      const maxCount = stats.topEventTypes.find((e) => e.type === "page_view")?.count || 1;
                      const width = Math.max(5, (count / maxCount) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-32">{step.label}</span>
                          <div className="flex-1 h-8 bg-muted rounded overflow-hidden relative">
                            <div
                              className="h-full bg-primary/50 rounded transition-all duration-700"
                              style={{ width: `${width}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {formatNumber(count)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════ TEST TELEMETRY ════════ */}
            <TabsContent value="tests" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Total Passes"
                  value={testTelemetry?.totalPass ?? 0}
                  description="Summed test_pass metric entries"
                  icon={CheckCircle2}
                />
                <StatCard
                  title="Total Failures"
                  value={testTelemetry?.totalFail ?? 0}
                  description="Summed test_fail metric entries"
                  icon={XCircle}
                />
                <StatCard
                  title="Test Metrics Tracked"
                  value={testTelemetry?.summary.length ?? 0}
                  description="Distinct test_* metric names"
                  icon={TestTube}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Metric Breakdown
                  </CardTitle>
                  <CardDescription>
                    Platform metrics with test_* prefix — run counts, pass/fail trends.
                    Populated by CI pipeline via platform_metrics table.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!testTelemetry || testTelemetry.summary.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <TestTube className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No test telemetry data yet.</p>
                      <p className="text-xs mt-1">
                        CI pipeline should emit <code>test_pass</code> / <code>test_fail</code> metrics
                        via <code>recordMetric()</code> in <code>lib/nervous-system/platformMetrics.ts</code>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-xs text-muted-foreground font-semibold uppercase border-b pb-2 mb-2">
                        <span>Metric</span>
                        <span className="w-20 text-right">Latest</span>
                        <span className="w-20 text-right">Total</span>
                      </div>
                      {testTelemetry.summary.map((m) => (
                        <div key={m.name} className="grid grid-cols-[1fr_auto_auto] gap-4 text-sm py-1 border-b border-border/50 last:border-0">
                          <span className="font-mono text-xs text-muted-foreground">{m.name}</span>
                          <span className="w-20 text-right font-medium">{formatNumber(m.latest)}</span>
                          <span className="w-20 text-right text-muted-foreground">{formatNumber(m.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ════════ AUGUR / VERDICT LOGS ════════ */}
            <TabsContent value="augur" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(verdictLog?.statusCounts || {}).slice(0, 3).map(([status, count]) => (
                  <StatCard
                    key={status}
                    title={`Status: ${status}`}
                    value={count as number}
                    icon={Gavel}
                  />
                ))}
                {Object.keys(verdictLog?.statusCounts || {}).length === 0 && (
                  <StatCard
                    title="Total Verdicts"
                    value={verdictLog?.entries.length ?? 0}
                    description="From verdict_log table"
                    icon={Gavel}
                  />
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5" />
                    Star-Chamber / Augur Log
                  </CardTitle>
                  <CardDescription>
                    Recent augur firings, reconciliation state, and verdict outcomes.
                    Source: <code>verdict_log</code> table.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!verdictLog || verdictLog.entries.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      <Gavel className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No verdict log entries yet.</p>
                      <p className="text-xs mt-1">
                        Star Chamber verdicts and Augur gate firings will appear here
                        as they are recorded in the <code>verdict_log</code> table.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {verdictLog.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 text-sm rounded-md border px-3 py-2"
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            entry.verdict === "approved" ? "bg-green-500"
                            : entry.verdict === "rejected" ? "bg-red-500"
                            : "bg-amber-500"
                          }`} />
                          <span className="font-mono text-xs text-muted-foreground w-24 shrink-0 truncate">
                            {entry.id.slice(0, 8)}
                          </span>
                          {entry.case_id && (
                            <span className="text-xs text-muted-foreground">
                              case: {entry.case_id.slice(0, 8)}
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[10px] ml-auto shrink-0 ${
                              entry.verdict === "approved" ? "border-green-500/40 text-green-600"
                              : entry.verdict === "rejected" ? "border-red-500/40 text-red-600"
                              : "border-amber-500/40 text-amber-600"
                            }`}
                          >
                            {entry.verdict || entry.status || "pending"}
                          </Badge>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reconciliation Summary */}
              {verdictLog && Object.keys(verdictLog.verdictCounts).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Verdict Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={Object.entries(verdictLog.verdictCounts).map(([label, value]) => ({
                        label,
                        value: value as number,
                      }))}
                      maxValue={Math.max(...Object.values(verdictLog.verdictCounts) as number[])}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ════════ ERROR BUDGET ════════ */}
            <TabsContent value="error-budget" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  title="Current Error Rate"
                  value={errorBudget ? `${(errorBudget.errorRate * 100).toFixed(3)}%` : "Loading..."}
                  description="From platform_metrics error_rate"
                  icon={AlertTriangle}
                />
                <StatCard
                  title="SLO Budget"
                  value={errorBudget ? `${(errorBudget.budget * 100).toFixed(2)}%` : "--"}
                  description="Target: 0.1% error budget"
                  icon={Gauge}
                />
                <StatCard
                  title="Budget Remaining"
                  value={
                    errorBudget
                      ? `${((errorBudget.remaining / errorBudget.budget) * 100).toFixed(1)}%`
                      : "--"
                  }
                  description="Available error capacity"
                  icon={Activity}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Error Budget
                  </CardTitle>
                  <CardDescription>
                    SLO: 99.9% uptime (0.1% error budget). Tracks platform reliability against target.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {errorBudget ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Budget consumed</span>
                          <span>
                            {errorBudget.budget > 0
                              ? `${((errorBudget.consumed / errorBudget.budget) * 100).toFixed(1)}%`
                              : "0%"}
                          </span>
                        </div>
                        <div className="h-4 bg-muted rounded overflow-hidden">
                          <div
                            className={`h-full rounded transition-all duration-700 ${
                              errorBudget.consumed / errorBudget.budget > 0.8
                                ? "bg-red-500"
                                : errorBudget.consumed / errorBudget.budget > 0.5
                                ? "bg-amber-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(100, errorBudget.budget > 0
                                ? (errorBudget.consumed / errorBudget.budget) * 100
                                : 0)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground">Error rate</p>
                          <p className="text-xl font-bold">{(errorBudget.errorRate * 100).toFixed(3)}%</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground">Budget remaining</p>
                          <p className="text-xl font-bold text-green-600">
                            {(errorBudget.remaining * 100).toFixed(3)}%
                          </p>
                        </div>
                      </div>

                      {errorBudget.consumed / errorBudget.budget > 0.5 && (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Error budget is over 50% consumed. Review recent deployments and
                            incident logs to protect the SLO.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Gauge className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No error rate data recorded yet.</p>
                      <p className="text-xs mt-1">
                        Emit <code>error_rate</code> metrics via{" "}
                        <code>recordMetric('error_rate', value)</code> in the platform metrics service.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <Calendar className="w-3 h-3 inline-block mr-1" />
          Data retention: 90 days. Events older than 90 days are automatically purged.
          <br />
          All analytics are aggregate-level. No personally identifiable information is stored in events.
        </div>
      </div>
    </PortalPageLayout>
  );
}
