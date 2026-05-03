import { useState } from "react";
import { useBushelScorecard, BushelScorecard } from "@/hooks/useBushelScorecard";
import { useCodexBindStatus } from "@/hooks/useCodexBindStatus";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Layers, ShieldCheck, Clock, DollarSign, Zap, CheckCircle2,
  AlertTriangle, BookOpen, Activity, TrendingUp, Lock,
} from "lucide-react";

// ---- Sub-components ----

function CostReceiptChip({ usd }: { usd: number | null }) {
  if (usd == null) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
      <DollarSign className="h-3 w-3" />{usd.toFixed(2)}
    </span>
  );
}

function BindStatusBadge({ codexId }: { codexId: string | null }) {
  const { data, isLoading } = useCodexBindStatus(codexId ?? "", undefined);

  if (!codexId) return <Badge variant="outline" className="text-xs text-slate-500">No Codex</Badge>;
  if (isLoading) return <Badge variant="outline" className="text-xs">Checking...</Badge>;
  if (!data) return null;

  if (data.status === "bound" || data.status === "verified") {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-300 bg-emerald-50">
        <ShieldCheck className="h-3 w-3" />
        {codexId} bound
      </Badge>
    );
  }
  if (data.status === "pending") {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-amber-700 border-amber-300">
        <Clock className="h-3 w-3" />
        {codexId} pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs gap-1 text-slate-600">
      <BookOpen className="h-3 w-3" />
      {codexId}
    </Badge>
  );
}

function TestPassBar({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const color =
    pct >= 95 ? "text-emerald-600" : pct >= 80 ? "text-amber-600" : "text-red-600";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Test pass rate</span>
        <span className={`font-medium ${color}`}>{pct}%</span>
      </div>
      <Progress
        value={pct}
        className="h-1.5"
      />
    </div>
  );
}

function BushelCard({ scorecard }: { scorecard: BushelScorecard }) {
  const completionPct = scorecard.totalUnits > 0
    ? Math.round((scorecard.shippedUnits / scorecard.totalUnits) * 100)
    : 0;
  const isLanded = !!scorecard.landedAt;
  const isInFlight = !isLanded && scorecard.totalUnits === 0;

  return (
    <Card className={`border transition-shadow hover:shadow-md ${isLanded ? "border-emerald-200 bg-emerald-50/30" : isInFlight ? "border-blue-200 bg-blue-50/20" : "border-amber-200 bg-amber-50/20"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{scorecard.label}</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Session {scorecard.session} · {scorecard.candlePower != null ? `${scorecard.candlePower} cP` : "—"}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${
              isLanded
                ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                : isInFlight
                ? "text-blue-700 border-blue-300 bg-blue-50"
                : "text-amber-700 border-amber-300 bg-amber-50"
            }`}
          >
            {isLanded ? "LANDED" : isInFlight ? "In Flight" : "Partial"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Build units breakdown */}
        {scorecard.totalUnits > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Build units</span>
              <span className="font-medium">
                {scorecard.shippedUnits}/{scorecard.totalUnits}
              </span>
            </div>
            <Progress value={completionPct} className="h-1.5" />
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> {scorecard.shippedUnits} shipped
              </span>
              {scorecard.partialUnits > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Activity className="h-3 w-3" /> {scorecard.partialUnits} partial
                </span>
              )}
              {scorecard.blockedUnits > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" /> {scorecard.blockedUnits} blocked
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No build units recorded yet.</p>
        )}

        {/* Test pass rate */}
        {scorecard.totalUnits > 0 && (
          <TestPassBar rate={scorecard.testPassRate} />
        )}

        {/* Codex + cost row */}
        <div className="flex items-center justify-between pt-1">
          <BindStatusBadge codexId={scorecard.codexId} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {scorecard.wallClockMinutes != null && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{scorecard.wallClockMinutes}m
              </span>
            )}
            <CostReceiptChip usd={scorecard.costReceiptUsd} />
          </div>
        </div>

        {/* Landed at */}
        {scorecard.landedAt && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 border-t pt-2">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            Landed {new Date(scorecard.landedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Main page ----

export default function BushelDashboard() {
  const { data: scorecards, isLoading } = useBushelScorecard();

  const landed = scorecards?.filter((s) => !!s.landedAt) ?? [];
  const inFlight = scorecards?.filter((s) => !s.landedAt) ?? [];

  const totalUnits = scorecards?.reduce((sum, s) => sum + s.shippedUnits, 0) ?? 0;
  const totalCost = scorecards?.reduce((sum, s) => sum + (s.costReceiptUsd ?? 0), 0) ?? 0;
  const totalCp = scorecards?.reduce((sum, s) => sum + (s.candlePower ?? 0), 0) ?? 0;

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Layers className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-foreground">Bushel Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Multi-agent Bushel operations — depth-3 nested 64 cP all-Sonnet. LB-CODEX-bound, HMAC-locked.
          </p>
        </div>

        {/* Stats row */}
        {!isLoading && scorecards && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Bushels Tracked", value: scorecards.length, icon: <Layers className="h-4 w-4 text-blue-500" /> },
              { label: "Units Shipped", value: totalUnits.toLocaleString(), icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
              { label: "Total cP Fired", value: totalCp, icon: <Zap className="h-4 w-4 text-amber-500" /> },
              { label: "API Spend", value: totalCost > 0 ? `$${totalCost.toFixed(2)}` : "—", icon: <DollarSign className="h-4 w-4 text-violet-500" /> },
            ].map(({ label, value, icon }) => (
              <Card key={label} className="bg-muted/40">
                <CardContent className="p-3 flex items-center gap-2">
                  {icon}
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-52 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Landed */}
        {landed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Landed Bushels ({landed.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {landed.map((s) => <BushelCard key={s.bushelId} scorecard={s} />)}
            </div>
          </div>
        )}

        {/* In Flight */}
        {inFlight.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              In Flight ({inFlight.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inFlight.map((s) => <BushelCard key={s.bushelId} scorecard={s} />)}
            </div>
          </div>
        )}

        {/* Substrate-as-backup tagline */}
        <Card className="bg-violet-50/50 border-violet-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Lock className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-violet-900">
                "Your work isn't gone when the tab closes. It was never in the tab."
              </p>
              <p className="text-xs text-violet-700 mt-0.5">
                Substrate-as-immutable-backup — proven 2× at scale (BP020). Every Bushel is pyramid-indexed, HMAC-locked, recoverable without session context.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
