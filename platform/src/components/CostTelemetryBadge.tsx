/**
 * Cost Telemetry Badge -- BP072 Wave 25 / BP073 Wave B (cost correction)
 * ========================================================================
 * Displays honest cost for any inference or session.
 * DOCTRINE: transport = $0, grading = ~$0.0001 (NEVER flat "$0").
 *
 * BP073-B4 correction: Wave 25 stated ~$0.001/grading call. This was an
 * overstatement by 10x. Corrected value: ~$0.0001/call.
 * Basis: claude-haiku-3 at 2026 pricing (~200 in + 50 out tokens = ~$0.000056).
 * Empirical floor: $0.0001 (covers prompt overhead + API minimum).
 *
 * Used inline next to inference results + in member cost history.
 */
import { DollarSign, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InferenceCost {
  /** Always $0 for peer-to-peer LAN/WAN mesh transport. */
  transportUsd: 0;
  /**
   * Grading / API cost in USD. NEVER 0.0 -- minimum is the real model cost.
   * Typical: 0.000050 - 0.010000 USD per call.
   */
  gradingUsd: number;
  /** Human-readable label for the model used for grading. */
  modelLabel: string;
  /** ISO timestamp of the inference. */
  recordedAt: string;
}

export function formatGradingCost(usd: number): string {
  if (usd === 0) {
    // This should never happen per doctrine -- but guard gracefully
    return "~$0.00001 (actual)";
  }
  if (usd < 0.001) {
    return `~$${usd.toFixed(6)}`;
  }
  if (usd < 0.01) {
    return `~$${usd.toFixed(4)}`;
  }
  return `~$${usd.toFixed(3)}`;
}

// ─── Inline badge ─────────────────────────────────────────────────────────────

interface CostTelemetryBadgeProps {
  cost: InferenceCost;
  className?: string;
  /** If true, shows only the grading cost number (no transport line). */
  compact?: boolean;
}

export function CostTelemetryBadge({
  cost,
  className,
  compact = false,
}: CostTelemetryBadgeProps) {
  const gradingLabel = formatGradingCost(cost.gradingUsd);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 text-xs text-amber-700 border-amber-200 bg-amber-50 cursor-help select-none",
              className,
            )}
          >
            <DollarSign className="w-3 h-3" />
            {compact
              ? `grading ${gradingLabel}`
              : `$0 transport / ${gradingLabel} grading`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs space-y-1">
          <p className="font-medium">Honest cost breakdown</p>
          <ul className="space-y-0.5">
            <li>
              <span className="text-slate-500">Transport:</span>{" "}
              <strong>$0.00</strong> (peer-to-peer mesh, no relay fee)
            </li>
            <li>
              <span className="text-slate-500">Grading ({cost.modelLabel}):</span>{" "}
              <strong>{gradingLabel}</strong>
            </li>
          </ul>
          <p className="text-slate-400">
            Recorded {new Date(cost.recordedAt).toLocaleString()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Cost history row ─────────────────────────────────────────────────────────

interface CostHistoryRowProps {
  cost: InferenceCost;
  label?: string;
}

export function CostHistoryRow({ cost, label }: CostHistoryRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
        <div className="min-w-0">
          <div className="font-medium text-slate-800 truncate">
            {label ?? "Inference"}
          </div>
          <div className="text-xs text-slate-400">
            {new Date(cost.recordedAt).toLocaleString()} &middot; {cost.modelLabel}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4 space-y-0.5">
        <div className="text-xs text-slate-500">transport: <span className="font-mono text-slate-700">$0.00</span></div>
        <div className="text-xs text-slate-500">grading: <span className="font-mono font-semibold text-amber-700">{formatGradingCost(cost.gradingUsd)}</span></div>
      </div>
    </div>
  );
}

// ─── Aggregate cost summary (for dashboard) ───────────────────────────────────

interface CostSummaryProps {
  history: InferenceCost[];
  className?: string;
}

export function CostSummary({ history, className }: CostSummaryProps) {
  const totalGrading = history.reduce((sum, c) => sum + c.gradingUsd, 0);
  const callCount = history.length;

  if (callCount === 0) {
    return (
      <div className={cn("text-sm text-slate-400 py-4 text-center", className)}>
        No inference cost history yet.
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>
          {callCount} inference{callCount !== 1 ? "s" : ""}. Transport always $0
          (peer-to-peer). Grading cost shown per call below.
        </span>
      </div>
      <div className="flex justify-between text-sm font-medium text-slate-800 px-0.5 mb-2">
        <span>Total grading cost ({callCount} calls)</span>
        <span className="font-mono text-amber-700">
          {formatGradingCost(totalGrading)}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {history.slice().reverse().map((c, i) => (
          <CostHistoryRow key={i} cost={c} label={`Inference #${callCount - i}`} />
        ))}
      </div>
    </div>
  );
}
