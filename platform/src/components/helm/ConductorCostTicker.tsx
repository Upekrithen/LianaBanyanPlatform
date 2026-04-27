/**
 * ConductorCostTicker — Member Helm Cost Visibility
 * K525 · Phase B.4 · Innovation #2277 + #2272
 *
 * Tiny live-updating widget that shows the member their running Conductor
 * spend, savings vs. single-vendor baseline, and vendor mix. Reads from the
 * in-process telemetry module (not the scribe) so it can render without a
 * round-trip to Supabase on every Helm view.
 *
 * Default window: last 7 days. Window selector lets the member zoom.
 *
 * Intentionally compact — fits in a sidebar card. The full vendor-mix and
 * latency-percentile dashboards live on the Conductor tab itself.
 */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCostSummary,
  type CostSummary,
} from "@/lib/conductor/telemetry";
import { DollarSign, TrendingDown } from "lucide-react";

const POLL_MS = 10_000; // refresh every 10s while panel is mounted

const VENDOR_COLOR: Record<string, string> = {
  anthropic: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  openai: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  google: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  perplexity:
    "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
};

interface ConductorCostTickerProps {
  windowHours?: number;
  className?: string;
}

export function ConductorCostTicker({
  windowHours = 24 * 7,
  className = "",
}: ConductorCostTickerProps) {
  const [summary, setSummary] = useState<CostSummary>(() =>
    getCostSummary(windowHours),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSummary(getCostSummary(windowHours));
    }, POLL_MS);
    return () => clearInterval(id);
  }, [windowHours]);

  const empty = summary.count === 0;

  return (
    <Card className={`bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950/30 dark:to-blue-950/30 border-blue-200 dark:border-blue-800 ${className}`}>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-semibold">Conductor Cost Ticker</h4>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Last {windowHours <= 24 ? "24h" : `${Math.round(windowHours / 24)}d`}
          </Badge>
        </div>

        {empty ? (
          <p className="text-xs text-muted-foreground">
            No routed queries yet in this window. Once you start using the Companion,
            this ticker will show what you spent and how much you saved.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Routed
                </p>
                <p className="text-sm font-bold">{summary.count}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Spent
                </p>
                <p className="text-sm font-bold">${summary.totalCostUsd.toFixed(4)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Saved
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  ${summary.totalSavingsUsd.toFixed(4)}
                </p>
              </div>
            </div>

            {summary.savingsPercent !== null && summary.savingsPercent > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingDown className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">
                  {summary.savingsPercent}% lower than single-vendor (Opus) baseline
                </span>
              </div>
            )}

            {summary.vendorMix.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {summary.vendorMix.map((v) => (
                  <Badge
                    key={v.vendor}
                    className={`text-[10px] ${VENDOR_COLOR[v.vendor] ?? ""}`}
                  >
                    {v.vendor} {v.percent.toFixed(0)}%
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
