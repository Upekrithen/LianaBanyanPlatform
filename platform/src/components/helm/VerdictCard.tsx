/**
 * VerdictCard — Bushel 19 / BP021
 * ================================
 * Per-verdict reusable card for the member-visible verdict UX.
 * Shows: verdict-type + stage + reasoning + canonical-precedent-cited + appeal-status.
 *
 * Renders for all three stages: Bouncer (pre-block), Scales (weighted), Judge (appellate).
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ShieldX, Scale, Gavel, ArrowRight, Clock, CheckCircle2,
  AlertTriangle, MessageSquarePlus,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

export type VerdictStage = "bouncer" | "scales" | "judge";

export type VerdictType =
  | "PASS_OVERRIDE"
  | "ROUTE_TO_SCALES"
  | "PASS"
  | "BLOCK"
  | "JUDGE";

export type AppealStatus = "none" | "pending" | "resolved" | "escalated";

export interface VerdictRecord {
  case_id: string;
  stage: VerdictStage;
  verdict: VerdictType;
  rationale: string;
  matched_pattern_id?: string | null;
  canonical_precedent_cited?: string | null;
  appeal_status?: AppealStatus;
  decided_at: string;
  eblet_path?: string | null;
  scribe_id?: string | null;
}

// ── Config maps ─────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<VerdictType, {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
  rowClass: string;
}> = {
  PASS_OVERRIDE: {
    label: "PASS — Override",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    badgeClass: "text-emerald-700 border-emerald-300 bg-emerald-50",
    rowClass: "border-emerald-200 bg-emerald-50/20",
  },
  PASS: {
    label: "PASS",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    badgeClass: "text-emerald-700 border-emerald-300 bg-emerald-50",
    rowClass: "border-emerald-200 bg-emerald-50/20",
  },
  ROUTE_TO_SCALES: {
    label: "Route to Scales",
    icon: <ArrowRight className="h-3.5 w-3.5" />,
    badgeClass: "text-blue-700 border-blue-300 bg-blue-50",
    rowClass: "border-blue-200 bg-blue-50/20",
  },
  JUDGE: {
    label: "Escalate to Judge",
    icon: <Gavel className="h-3.5 w-3.5" />,
    badgeClass: "text-amber-700 border-amber-300 bg-amber-50",
    rowClass: "border-amber-200 bg-amber-50/20",
  },
  BLOCK: {
    label: "BLOCK",
    icon: <ShieldX className="h-3.5 w-3.5" />,
    badgeClass: "text-red-700 border-red-300 bg-red-50",
    rowClass: "border-red-200 bg-red-50/20",
  },
};

const STAGE_CONFIG: Record<VerdictStage, {
  label: string;
  icon: React.ReactNode;
  description: string;
}> = {
  bouncer: {
    label: "Bouncer",
    icon: <ShieldCheck className="h-4 w-4 text-slate-500" />,
    description: "First-line fast-pass check against safe-pattern registry",
  },
  scales: {
    label: "Scales",
    icon: <Scale className="h-4 w-4 text-slate-500" />,
    description: "Criteria-weighted evaluation (6 rubric dimensions)",
  },
  judge: {
    label: "Judge",
    icon: <Gavel className="h-4 w-4 text-slate-500" />,
    description: "Appellate authority — precedent-applied final verdict",
  },
};

const APPEAL_STATUS_CONFIG: Record<AppealStatus, {
  label: string;
  className: string;
}> = {
  none: { label: "No appeal filed", className: "text-slate-500 border-slate-200" },
  pending: { label: "Appeal pending", className: "text-amber-700 border-amber-300 bg-amber-50" },
  resolved: { label: "Appeal resolved", className: "text-emerald-700 border-emerald-300 bg-emerald-50" },
  escalated: { label: "Escalated to Pedestal Forum", className: "text-purple-700 border-purple-300 bg-purple-50" },
};

// ── Component ────────────────────────────────────────────────────────────────

interface VerdictCardProps {
  record: VerdictRecord;
  onAppeal?: (caseId: string) => void;
  compact?: boolean;
}

export function VerdictCard({ record, onAppeal, compact = false }: VerdictCardProps) {
  const vCfg = VERDICT_CONFIG[record.verdict] ?? VERDICT_CONFIG.BLOCK;
  const sCfg = STAGE_CONFIG[record.stage];
  const appealCfg = APPEAL_STATUS_CONFIG[record.appeal_status ?? "none"];

  const decidedDate = new Date(record.decided_at);
  const dateStr = decidedDate.toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
  const timeStr = decidedDate.toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <Card className={`border ${vCfg.rowClass} transition-colors`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          {/* Stage + Verdict badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-xs gap-1 text-slate-600 border-slate-300 bg-slate-50">
              {sCfg.icon}
              {sCfg.label}
            </Badge>
            <Badge variant="outline" className={`text-xs gap-1 ${vCfg.badgeClass}`}>
              {vCfg.icon}
              {vCfg.label}
            </Badge>
          </div>

          {/* Date */}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {dateStr} {timeStr}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-2">
        {/* Rationale */}
        <p className="text-sm text-foreground leading-relaxed">
          {record.rationale}
        </p>

        {/* Path */}
        {record.eblet_path && (
          <p className="text-xs text-muted-foreground font-mono truncate">
            {record.eblet_path}
          </p>
        )}

        {/* Matched pattern / precedent */}
        {record.matched_pattern_id && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="h-3 w-3 shrink-0" />
            <span>Pattern: <code className="font-mono">{record.matched_pattern_id}</code></span>
          </div>
        )}
        {record.canonical_precedent_cited && (
          <div className="flex items-start gap-1.5 text-xs text-slate-600">
            <Gavel className="h-3 w-3 shrink-0 mt-0.5" />
            <span>Precedent: {record.canonical_precedent_cited}</span>
          </div>
        )}

        {/* Case ID (compact: hidden) */}
        {!compact && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            case: {record.case_id}
          </p>
        )}

        {/* Appeal status + action */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          <Badge variant="outline" className={`text-xs ${appealCfg.className}`}>
            {record.appeal_status === "none" || !record.appeal_status
              ? <AlertTriangle className="h-3 w-3 mr-1 inline" />
              : <MessageSquarePlus className="h-3 w-3 mr-1 inline" />}
            {appealCfg.label}
          </Badge>

          {record.verdict === "BLOCK" && record.appeal_status === "none" && onAppeal && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1"
              onClick={() => onAppeal(record.case_id)}
            >
              <MessageSquarePlus className="h-3 w-3" />
              File Appeal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
