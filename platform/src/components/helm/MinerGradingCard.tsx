/**
 * MinerGradingCard — Bushel 19 / BP021
 * ======================================
 * Per-grading reusable card for the member-visible Miner grading UX.
 * Shows: grade + score + earnings-impact (as Marks tier language).
 *
 * Miners participate in content evaluation. Their Catechist grading scores
 * determine their earnings-tier placement. This card surfaces that data.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, Minus, Clock, Star, Coins,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type GradeVerdict = "PASS" | "WARN" | "FAIL" | "SKIP";

export interface MinerGradingRecord {
  session_id: string;
  ai_member: string;
  rule_id: string;
  rule_description: string;
  verdict: GradeVerdict;
  evidence?: string | null;
  graded_at: string;
  earnings_tier?: "standard" | "elevated" | "reduced" | null;
  violations_7d?: number;
  correction_stickiness_pct?: number;
}

// ── Config ───────────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<GradeVerdict, {
  label: string;
  badgeClass: string;
  rowClass: string;
}> = {
  PASS: {
    label: "PASS",
    badgeClass: "text-emerald-700 border-emerald-300 bg-emerald-50",
    rowClass: "border-emerald-200 bg-emerald-50/20",
  },
  WARN: {
    label: "WARN",
    badgeClass: "text-amber-700 border-amber-300 bg-amber-50",
    rowClass: "border-amber-200 bg-amber-50/20",
  },
  FAIL: {
    label: "FAIL",
    badgeClass: "text-red-700 border-red-300 bg-red-50",
    rowClass: "border-red-200 bg-red-50/20",
  },
  SKIP: {
    label: "SKIP",
    badgeClass: "text-slate-500 border-slate-200 bg-slate-50",
    rowClass: "border-slate-200 bg-slate-50/20",
  },
};

const EARNINGS_TIER_CONFIG = {
  standard: {
    label: "Standard earnings tier",
    icon: <Minus className="h-3.5 w-3.5" />,
    className: "text-slate-600 border-slate-300",
  },
  elevated: {
    label: "Elevated earnings tier",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    className: "text-emerald-700 border-emerald-300 bg-emerald-50",
  },
  reduced: {
    label: "Reduced earnings tier",
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    className: "text-amber-700 border-amber-300 bg-amber-50",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface MinerGradingCardProps {
  record: MinerGradingRecord;
  compact?: boolean;
}

export function MinerGradingCard({ record, compact = false }: MinerGradingCardProps) {
  const vCfg = VERDICT_CONFIG[record.verdict];
  const earningsCfg = record.earnings_tier
    ? EARNINGS_TIER_CONFIG[record.earnings_tier]
    : null;

  const gradedDate = new Date(record.graded_at);
  const dateStr = gradedDate.toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });

  const stickinessPct = record.correction_stickiness_pct ?? 100;
  const stickinessColor =
    stickinessPct >= 80 ? "text-emerald-600"
      : stickinessPct >= 50 ? "text-amber-600"
        : "text-red-600";

  return (
    <Card className={`border ${vCfg.rowClass} transition-colors`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-xs text-slate-600 border-slate-300 bg-slate-50">
              {record.rule_id}
            </Badge>
            <Badge variant="outline" className={`text-xs gap-1 ${vCfg.badgeClass}`}>
              {record.verdict}
            </Badge>
            {earningsCfg && (
              <Badge variant="outline" className={`text-xs gap-1 ${earningsCfg.className}`}>
                {earningsCfg.icon}
                {earningsCfg.label}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {dateStr}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Rule description */}
        <p className="text-sm text-foreground">{record.rule_description}</p>

        {/* Evidence */}
        {record.evidence && (
          <p className="text-xs text-muted-foreground italic">
            Evidence: {record.evidence}
          </p>
        )}

        {/* Stickiness + violations (when data available) */}
        {record.violations_7d !== undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Correction stickiness (7d)</span>
              <span className={`font-medium ${stickinessColor}`}>
                {stickinessPct}%
              </span>
            </div>
            <Progress value={stickinessPct} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {record.violations_7d} violation{record.violations_7d !== 1 ? "s" : ""} in rolling 7-day window
            </p>
          </div>
        )}

        {/* Session ID */}
        {!compact && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Star className="h-3 w-3" />
            <span>{record.ai_member} — session {record.session_id}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
