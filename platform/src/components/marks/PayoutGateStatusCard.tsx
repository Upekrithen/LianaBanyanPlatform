/**
 * PayoutGateStatusCard -- Wave 11 / S20 / S27
 * ==============================================
 * Reusable payout gate status component.
 * Reads live from payout_gate_status view (backed by platform_canonical).
 * Shows green/amber/red status with HELD wording for rates.
 *
 * MARKS_AUTO_PAYOUT_ENABLED=false (default): amber -- manual approval mode.
 * MARKS_AUTO_PAYOUT_ENABLED=true: green -- auto payout live.
 *
 * SECURITIES-CLEAN: No financial return language. Participation credits only.
 * BP073-W11 / S20 / S27
 */

import { usePayoutGateStatus } from "@/hooks/usePayoutQueue";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Lock, Zap, CheckCircle, AlertCircle } from "lucide-react";

export interface PayoutGateStatusCardProps {
  /** If true, shows expanded detail (default: compact). */
  expanded?: boolean;
}

export function PayoutGateStatusCard({ expanded = false }: PayoutGateStatusCardProps) {
  const { data: gate, isLoading, error } = usePayoutGateStatus();

  if (isLoading) {
    return <Skeleton className="h-14 rounded-lg" />;
  }

  if (error || !gate) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-300/40 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Gate status unavailable. Defaulting to manual approval mode.
      </div>
    );
  }

  const isLive = gate.auto_payout_enabled;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
        isLive
          ? "border-green-500/30 bg-green-500/8 text-green-700 dark:text-green-400"
          : "border-amber-500/30 bg-amber-500/8 text-amber-700 dark:text-amber-400"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isLive ? (
          <Zap className="h-5 w-5 text-green-600" />
        ) : (
          <Lock className="h-5 w-5 text-amber-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold">
            {isLive ? "Auto-Payout LIVE" : "Manual Approval (Gate Held)"}
          </p>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              isLive ? "border-green-500/30 text-green-700" : "border-amber-500/30 text-amber-700"
            }`}
          >
            {isLive ? "LIVE" : "HELD"}
          </Badge>
        </div>
        <p className="text-xs mt-0.5 opacity-80">
          {isLive
            ? "Marks are allocated automatically on verified events. " +
              "Participation credits -- NOT equity or guaranteed return."
            : "Marks allocations staged for Founder manual approval. " +
              "Gate opens when Founder sets MARKS_AUTO_PAYOUT_ENABLED=true. " +
              "Rates HELD pending 15-language ratification."}
        </p>

        {expanded && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
            <span>Join rate: {gate.join_marks_units > 0 ? gate.join_marks_units : "HELD"}</span>
            <span>Renewal rate: {gate.renewal_marks_units > 0 ? gate.renewal_marks_units : "HELD"}</span>
            <span className="col-span-2 text-muted-foreground">
              Last checked: {new Date(gate.checked_at).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
      {isLive && (
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
      )}
    </div>
  );
}
