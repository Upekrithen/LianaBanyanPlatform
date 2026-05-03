/**
 * MyVerdictHistoryPage — Bushel 19 / BP021
 * ==========================================
 * Member-visible verdict history surface (Helm route: /helm/verdicts).
 *
 * Shows:
 *   - Bouncer pre-block verdicts
 *   - Scales weighted verdicts
 *   - Judge precedent-applied verdicts
 *
 * Per Bushel 19: "members can SEE their verdicts, the rubrics applied to them...
 * AND can file appeals via the Mordecai-Esther decree-composition mechanism."
 *
 * Data source: verdict_log Supabase table (populated when the backend
 * Bouncer/Scales/Judge trio issues verdicts). Empty-state shown for new members.
 *
 * G1: Member-visible verdict + grading pages live + Helm-routed ✓
 * G3: Appeal mechanism wired (form + migration + edge function) ✓
 * G4: Pedestal Forum invitation included in appeal flow ✓
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { VerdictCard, VerdictRecord } from "@/components/helm/VerdictCard";
import { AppealVerdictForm } from "@/components/helm/AppealVerdictForm";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Scale, ShieldCheck, Gavel, Info, BookOpen, MessageSquarePlus, Layers,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Hook ─────────────────────────────────────────────────────────────────────

function useVerdictHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["verdict_log", user?.id],
    queryFn: async (): Promise<VerdictRecord[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("verdict_log")
        .select("*")
        .order("decided_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data ?? []).map((row: Record<string, unknown>) => ({
        case_id: String(row.case_id ?? ""),
        stage: (row.stage as VerdictRecord["stage"]) ?? "bouncer",
        verdict: (row.verdict as VerdictRecord["verdict"]) ?? "BLOCK",
        rationale: String(row.rationale ?? ""),
        matched_pattern_id: row.matched_pattern_id as string | null,
        canonical_precedent_cited: row.canonical_precedent_cited as string | null,
        appeal_status: "none",
        decided_at: String(row.decided_at ?? ""),
        eblet_path: row.eblet_path as string | null,
        scribe_id: row.scribe_id as string | null,
      }));
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyVerdictState() {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-8 text-center space-y-4">
        <div className="flex justify-center gap-3 text-slate-300">
          <ShieldCheck className="h-8 w-8" />
          <Scale className="h-8 w-8" />
          <Gavel className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">No verdicts recorded yet</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The Bouncer-Scales-Judge trio evaluates content writes against the Augur Living Gate.
            Verdicts appear here when the backend has issued them for your content context.
          </p>
        </div>
        <div className="flex items-start gap-2 p-3 rounded border border-blue-200 bg-blue-50/30 text-left max-w-md mx-auto">
          <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800">
            You can still browse the canonical rubric that governs all verdicts.
            The scales are visible.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/helm/scales-rubric">
              <Scale className="h-3.5 w-3.5 mr-1.5" />
              View scales rubric
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/helm/miner-grading">
              <Layers className="h-3.5 w-3.5 mr-1.5" />
              View Miner grading
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

type StageFilter = "all" | "bouncer" | "scales" | "judge";

function FilterBar({
  active,
  onChange,
  counts,
}: {
  active: StageFilter;
  onChange: (f: StageFilter) => void;
  counts: Record<StageFilter, number>;
}) {
  const items: { key: StageFilter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <Layers className="h-3 w-3" /> },
    { key: "bouncer", label: "Bouncer", icon: <ShieldCheck className="h-3 w-3" /> },
    { key: "scales", label: "Scales", icon: <Scale className="h-3 w-3" /> },
    { key: "judge", label: "Judge", icon: <Gavel className="h-3 w-3" /> },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {items.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
            active === key
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {icon}
          {label}
          <span className="ml-1 opacity-60">{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MyVerdictHistoryPage() {
  const { data: records = [], isLoading, error } = useVerdictHistory();
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [appealingCaseId, setAppealingCaseId] = useState<string | null>(null);

  const filtered = stageFilter === "all"
    ? records
    : records.filter((r) => r.stage === stageFilter);

  const counts: Record<StageFilter, number> = {
    all: records.length,
    bouncer: records.filter((r) => r.stage === "bouncer").length,
    scales: records.filter((r) => r.stage === "scales").length,
    judge: records.filter((r) => r.stage === "judge").length,
  };

  const appealingRecord = appealingCaseId
    ? records.find((r) => r.case_id === appealingCaseId)
    : null;

  return (
    <PortalPageLayout
      title="Verdict History"
      subtitle="Bouncer, Scales, and Judge verdicts for your content context"
      backButton
    >
      {/* Nav links */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Button variant="outline" size="sm" asChild>
          <Link to="/helm/scales-rubric">
            <Scale className="h-3.5 w-3.5 mr-1.5" />
            The Scales Are Visible
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/helm/miner-grading">
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Miner Grading
          </Link>
        </Button>
      </div>

      {/* Info callout */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-blue-200 bg-blue-50/30 mb-5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 space-y-1">
          <p className="font-medium">Member-Visible Verdict Architecture</p>
          <p>
            Every verdict issued by the Bouncer-Scales-Judge trio is recorded here.
            BLOCK verdicts can be appealed via the Mordecai-Esther decree-composition mechanism —
            your counter-argument gains co-equal authority and joins the canonical precedent record.
          </p>
        </div>
      </div>

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
      {!isLoading && !error && records.length === 0 && <EmptyVerdictState />}

      {/* Appeal form overlay */}
      {appealingRecord && (
        <div className="mb-5">
          <AppealVerdictForm
            caseId={appealingRecord.case_id}
            verdictSummary={appealingRecord.rationale}
            stage={appealingRecord.stage}
            onSuccess={() => setAppealingCaseId(null)}
            onCancel={() => setAppealingCaseId(null)}
          />
        </div>
      )}

      {/* Filter + list */}
      {!isLoading && !error && records.length > 0 && (
        <div className="space-y-4">
          <FilterBar active={stageFilter} onChange={setStageFilter} counts={counts} />

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No {stageFilter} verdicts recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((record) => (
                <VerdictCard
                  key={record.case_id}
                  record={record}
                  onAppeal={setAppealingCaseId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </PortalPageLayout>
  );
}
