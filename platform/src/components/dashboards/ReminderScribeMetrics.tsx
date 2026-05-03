/**
 * Reminder Scribe Metrics Dashboard — KN-I4 / BP017
 * ==================================================
 * Per-discipline-rule violation/correction metrics; per-AI-cohort-member;
 * rolling time windows; correction-stickiness; FORK-class CRITICAL alerts.
 *
 * Visible to Founder QueTuner for cohort-state cue reading.
 *
 * Anti-shame discipline (Reminder Scribe canon BP017 turn 22):
 *   Empirical numbers + rates ONLY. No moral judgment language.
 *   No personalized callouts beyond per-cohort-member metrics permitted.
 *
 * Privacy / visibility scopes (Phase B5):
 *   - personal: this member's AI metrics only (default for member view)
 *   - federation_aggregate: anonymized cross-member aggregates (Federation class)
 *   - public_aggregate: Tier-A floor metrics (public; anonymized)
 *
 * BRIDLE Rule 4: data_available=false surfaces "DATA UNAVAILABLE" prominently.
 * Never renders stale zero-counts as "no violations".
 *
 * Composes with:
 *   KN-I3 substrate_writeback.ts — provenance ledger (b59b20b)
 *   KN-I2 catechist/grader.ts — Catechist rolling-7d summary
 *   KN-I1 rules_registry.ts — rule metadata
 */

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types (mirrored from librarian-mcp metrics_aggregator — no runtime import) ──

type RollingWindow = "7d" | "30d" | "90d" | "all_time";
type AiMember = "bishop" | "knight" | "pawn" | "rook" | "all";

interface ViolationCell {
  ai_member: string;
  rule_id: string;
  violations: number;
  corrections: number;
  overrides: number;
  stickiness_pct: number;
}

interface ForkClassAlert {
  is_critical: boolean;
  fork_violations_detected: number;
  affected_rule_ids: string[];
  alert_message: string;
  earliest_fork_ts: string | null;
}

interface DriftFlag {
  rule_id: string;
  ai_member: string;
  current_stickiness_pct: number;
  threshold_pct: number;
  drifting: boolean;
}

interface MetricsDashboardPayload {
  schema_version: "1.0";
  generated_at: string;
  window: RollingWindow;
  window_days: number;
  data_available: boolean;
  unavailable_reason?: string;
  violations_heatmap: ViolationCell[];
  cohort_stickiness_pct: number;
  marks_cost_spend: Array<{ ai_member: string; rule_id: string; marks_spent: number }>;
  total_marks_spent: number;
  presend_blocks_by_member: Record<string, number>;
  total_presend_blocks: number;
  fork_class_alert: ForkClassAlert;
  cohort_discipline_rate: number;
  drift_flags: DriftFlag[];
  total_violations: number;
  total_corrections: number;
  total_overrides: number;
  entry_count: number;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReminderScribeMetricsProps {
  /** Metrics payload from reminder_scribe_metrics_query MCP tool. */
  payload: MetricsDashboardPayload | null;
  /** Whether data is currently loading. */
  loading?: boolean;
  /** Filter controls passed down from parent (controlled). */
  selectedWindow?: RollingWindow;
  selectedMember?: AiMember;
  onWindowChange?: (w: RollingWindow) => void;
  onMemberChange?: (m: AiMember) => void;
  /** Visibility scope for privacy controls. */
  visibilityScope?: "personal" | "federation_aggregate" | "public_aggregate";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StickinessIndicator({ pct }: { pct: number }) {
  if (pct >= 90) return <span className="text-emerald-600 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3" />{pct}%</span>;
  if (pct >= 70) return <span className="text-amber-600 font-medium flex items-center gap-1"><Minus className="w-3 h-3" />{pct}%</span>;
  return <span className="text-rose-600 font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3" />{pct}%</span>;
}

function ForkClassAlertBanner({ alert }: { alert: ForkClassAlert }) {
  if (!alert.is_critical) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        <span>{alert.alert_message}</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-lg border-2 border-rose-500 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-200">
      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
      <div>
        <div className="font-bold text-rose-700 dark:text-rose-400 mb-1">FORK-CLASS CRITICAL ALERT</div>
        <div>{alert.alert_message}</div>
        {alert.earliest_fork_ts && (
          <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">First detected: {alert.earliest_fork_ts}</div>
        )}
      </div>
    </div>
  );
}

function CohortSummaryCard({ payload }: { payload: MetricsDashboardPayload }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "Discipline rate", value: `${payload.cohort_discipline_rate}%`, sub: "composite across all rules" },
        { label: "Correction stickiness", value: `${payload.cohort_stickiness_pct}%`, sub: `${payload.window} window` },
        { label: "Total violations", value: payload.total_violations, sub: `${payload.total_corrections} corrected` },
        { label: "Marks spent (overrides)", value: payload.total_marks_spent, sub: `${payload.total_overrides} overrides` },
      ].map((stat) => (
        <Card key={stat.label} className="border-muted/50">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-xl font-bold mt-0.5">{stat.value}</div>
            <div className="text-xs text-muted-foreground/70 mt-0.5">{stat.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ViolationHeatmap({ cells }: { cells: ViolationCell[] }) {
  if (cells.length === 0) {
    return <div className="text-sm text-muted-foreground italic">No violations recorded in this window. Discipline clean.</div>;
  }
  const sorted = [...cells].sort((a, b) => b.violations - a.violations);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-muted/40 text-left">
            <th className="py-1.5 pr-3 text-xs font-medium text-muted-foreground">AI Member</th>
            <th className="py-1.5 pr-3 text-xs font-medium text-muted-foreground">Rule</th>
            <th className="py-1.5 pr-3 text-xs font-medium text-muted-foreground text-right">Violations</th>
            <th className="py-1.5 pr-3 text-xs font-medium text-muted-foreground text-right">Corrections</th>
            <th className="py-1.5 pr-3 text-xs font-medium text-muted-foreground text-right">Overrides</th>
            <th className="py-1.5 text-xs font-medium text-muted-foreground text-right">Stickiness</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((cell) => (
            <tr key={`${cell.ai_member}-${cell.rule_id}`} className="border-b border-muted/20 hover:bg-muted/20">
              <td className="py-1.5 pr-3">
                <Badge variant="outline" className="text-xs capitalize">{cell.ai_member}</Badge>
              </td>
              <td className="py-1.5 pr-3 font-mono text-xs">{cell.rule_id}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums">{cell.violations}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums">{cell.corrections}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums">{cell.overrides}</td>
              <td className="py-1.5 text-right">
                <StickinessIndicator pct={cell.stickiness_pct} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DriftFlagsPanel({ flags }: { flags: DriftFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20 p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-400">Drift Indicators</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        Correction-stickiness below {flags[0]?.threshold_pct}% threshold — review these rule/member combinations:
      </div>
      <ul className="space-y-1">
        {flags.map((f) => (
          <li key={`${f.ai_member}-${f.rule_id}`} className="text-xs flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">{f.ai_member}</Badge>
            <span className="font-mono">{f.rule_id}</span>
            <span className="text-amber-700 dark:text-amber-400">{f.current_stickiness_pct}% stickiness</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const WINDOW_OPTIONS: { value: RollingWindow; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all_time", label: "All time" },
];

const MEMBER_OPTIONS: { value: AiMember; label: string }[] = [
  { value: "all", label: "All members" },
  { value: "bishop", label: "Bishop" },
  { value: "knight", label: "Knight" },
  { value: "pawn", label: "Pawn" },
  { value: "rook", label: "Rook" },
];

export function ReminderScribeMetrics({
  payload,
  loading = false,
  selectedWindow = "7d",
  selectedMember = "all",
  onWindowChange,
  onMemberChange,
  visibilityScope = "personal",
}: ReminderScribeMetricsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="rounded-lg border border-muted p-6 text-center text-sm text-muted-foreground">
        No metrics data loaded. Call reminder_scribe_metrics_query to populate.
      </div>
    );
  }

  if (!payload.data_available) {
    return (
      <div className="rounded-lg border-2 border-rose-300 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/20 p-4 text-sm">
        <div className="font-bold text-rose-700 dark:text-rose-400 mb-1">DATA UNAVAILABLE</div>
        <div className="text-rose-600 dark:text-rose-300">{payload.unavailable_reason}</div>
        <div className="mt-2 text-xs text-muted-foreground">
          Generated at: {payload.generated_at} — Do not interpret as zero violations.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reminder Scribe Metrics</h2>
          <div className="text-xs text-muted-foreground mt-0.5">
            Empirical-receipt dashboard — counts and rates only
            {visibilityScope !== "personal" && (
              <Badge variant="outline" className="ml-2 text-xs capitalize">{visibilityScope.replace("_", " ")}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Window filter */}
          <div className="flex rounded-lg border border-muted/60 overflow-hidden text-xs">
            {WINDOW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onWindowChange?.(opt.value)}
                className={`px-2.5 py-1 transition-colors ${
                  selectedWindow === opt.value
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-background hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Member filter */}
          <div className="flex rounded-lg border border-muted/60 overflow-hidden text-xs">
            {MEMBER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onMemberChange?.(opt.value)}
                className={`px-2.5 py-1 capitalize transition-colors ${
                  selectedMember === opt.value
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-background hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FORK-class alert (always prominent) */}
      <ForkClassAlertBanner alert={payload.fork_class_alert} />

      {/* Cohort summary cards */}
      <CohortSummaryCard payload={payload} />

      {/* Drift flags */}
      <DriftFlagsPanel flags={payload.drift_flags} />

      {/* Violations heatmap */}
      <div>
        <h3 className="text-sm font-medium mb-2">Violations × Corrections × Stickiness</h3>
        <Card className="border-muted/50">
          <CardContent className="p-4">
            <ViolationHeatmap cells={payload.violations_heatmap} />
          </CardContent>
        </Card>
      </div>

      {/* Pre-send blocks */}
      {payload.total_presend_blocks > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Pre-send Blocks by AI Member</h3>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(payload.presend_blocks_by_member).map(([member, count]) => (
              <div
                key={member}
                className="rounded-lg border border-muted/60 px-3 py-1.5 text-sm flex items-center gap-2"
              >
                <Badge variant="outline" className="text-xs capitalize">{member}</Badge>
                <span className="tabular-nums font-medium">{count}</span>
                <span className="text-xs text-muted-foreground">block{count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-muted-foreground border-t border-muted/40 pt-3">
        Generated: {payload.generated_at} · {payload.entry_count} provenance entries · {payload.window} window
        <span className="ml-2 italic">Anti-shame discipline preserved per Reminder Scribe canon BP017 turn 22.</span>
      </div>
    </div>
  );
}

export default ReminderScribeMetrics;
