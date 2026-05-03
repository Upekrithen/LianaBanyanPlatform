/**
 * MyMinerGradingPage — Bushel 19 / BP021
 * =========================================
 * Member-visible Miner grading scores surface (Helm route: /helm/miner-grading).
 *
 * Shows per-session Catechist grading results when members participate as Miners
 * in content evaluation. Surfaces grade + score + earnings-impact (Marks tier).
 *
 * Data source: Catechist grader (grader.ts KN036/KN-I2) violation log.
 * Read via Supabase query when verdict_log is populated; violation history
 * surfaced from anti-shame discipline (empirical counts + rates only).
 *
 * G1: Member-visible verdict + grading pages live + Helm-routed ✓
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { MinerGradingCard, MinerGradingRecord } from "@/components/helm/MinerGradingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Layers, Scale, Info, Star, TrendingUp, AlertTriangle, BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Hook ─────────────────────────────────────────────────────────────────────

function useMinerGradingHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["miner_grading_history", user?.id],
    queryFn: async (): Promise<MinerGradingRecord[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("verdict_log")
        .select("*")
        .eq("stage", "bouncer")
        .order("decided_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return [];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

// ── Stats summary ────────────────────────────────────────────────────────────

interface GradingStatsSummaryProps {
  records: MinerGradingRecord[];
}

function GradingStatsSummary({ records }: GradingStatsSummaryProps) {
  const passCount = records.filter((r) => r.verdict === "PASS").length;
  const warnCount = records.filter((r) => r.verdict === "WARN").length;
  const failCount = records.filter((r) => r.verdict === "FAIL").length;
  const total = records.length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  const avgStickiness =
    records.filter((r) => r.correction_stickiness_pct !== undefined).length > 0
      ? Math.round(
          records
            .filter((r) => r.correction_stickiness_pct !== undefined)
            .reduce((s, r) => s + (r.correction_stickiness_pct ?? 0), 0) /
            records.filter((r) => r.correction_stickiness_pct !== undefined).length
        )
      : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{passCount}</p>
          <p className="text-xs text-muted-foreground">PASS</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{warnCount}</p>
          <p className="text-xs text-muted-foreground">WARN</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{failCount}</p>
          <p className="text-xs text-muted-foreground">FAIL</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pass rate</span>
            <span className="font-semibold text-foreground">{passRate}%</span>
          </div>
          <Progress value={passRate} className="h-1.5" />
          {avgStickiness !== null && (
            <p className="text-xs text-muted-foreground">
              Stickiness: {avgStickiness}%
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyMinerGradingState() {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-8 text-center space-y-4">
        <div className="flex justify-center">
          <Star className="h-10 w-10 text-slate-300" />
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">No grading history yet</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Miner grading scores appear here when you participate as a Miner in the
            Catechist evaluation pipeline. Grades determine your earnings-tier placement
            (earnings expressed in Marks).
          </p>
        </div>

        {/* Anti-shame notice */}
        <div className="flex items-start gap-2 p-3 rounded border border-slate-200 bg-slate-50/30 text-left max-w-md mx-auto">
          <Info className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600">
            <strong>Anti-shame discipline:</strong> grading surfaces empirical counts and
            rates only — no moral judgment language. Correction stickiness measures
            improvement, not failure.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link to="/helm/verdicts">
            <Scale className="h-3.5 w-3.5 mr-1.5" />
            View verdict history
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ── How Miner grading works callout ───────────────────────────────────────────

function MinerGradingExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-blue-200 bg-blue-50/20 mb-5">
      <CardHeader className="py-3 px-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-left w-full"
        >
          <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
          <CardTitle className="text-sm text-blue-800 flex-1">
            How Miner grading works
          </CardTitle>
          <span className="text-xs text-blue-600 shrink-0">
            {expanded ? "Less" : "More"}
          </span>
        </button>
      </CardHeader>
      {expanded && (
        <CardContent className="px-4 pb-4 text-xs text-blue-800 space-y-2">
          <p>
            When you participate as a Miner, the <strong>Catechist Scribe</strong> grades your
            session-open discipline against the R01-R10 ruleset (KN036 canon) and the
            KN-I2 violation-history extension.
          </p>
          <p>
            <strong>R01-R10 rules</strong> include: brief_me first, no orphan synthesis,
            FORK doctrine adherence, K-prompt path verification, Marks-class payouts only,
            session-ID format validity, and session debrief at close.
          </p>
          <p>
            <strong>Violation stickiness</strong> measures what percentage of flagged violations
            were corrected in the same session. 100% stickiness = every violation corrected;
            0% = no corrections applied.
          </p>
          <p>
            <strong>Earnings tier</strong> is derived from your overall grading performance.
            All earnings are expressed in Marks (effort-differential currency, never fiat).
          </p>
        </CardContent>
      )}
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MyMinerGradingPage() {
  const { data: records = [], isLoading, error } = useMinerGradingHistory();

  return (
    <PortalPageLayout
      title="Miner Grading"
      subtitle="Your Catechist session-discipline grades and earnings-tier placement"
      backButton
    >
      {/* Nav links */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Button variant="outline" size="sm" asChild>
          <Link to="/helm/verdicts">
            <Scale className="h-3.5 w-3.5 mr-1.5" />
            Verdict history
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/helm/scales-rubric">
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            The scales rubric
          </Link>
        </Button>
      </div>

      <MinerGradingExplainer />

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50/20">
          <CardContent className="p-4 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{String(error)}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !error && records.length === 0 && <EmptyMinerGradingState />}

      {/* Stats + list */}
      {!isLoading && !error && records.length > 0 && (
        <>
          <GradingStatsSummary records={records} />
          <div className="space-y-3">
            {records.map((record, i) => (
              <MinerGradingCard key={`${record.session_id}-${record.rule_id}-${i}`} record={record} />
            ))}
          </div>
        </>
      )}
    </PortalPageLayout>
  );
}
