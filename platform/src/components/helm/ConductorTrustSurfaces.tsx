/**
 * ConductorTrustSurfaces — Per-Decision Transparency
 * K525 · Phase B.3 · Innovation #2277
 *
 * Surfaces that explain WHAT the Conductor did and WHY for the most recent
 * routing decisions. This is the opposite of a black box: members see the
 * exact rationale, including R11 category priors, circuit-breaker demotions,
 * and token-budget filters.
 *
 * Aligned with Liana Pillars:
 *   "#37 Let your yea be yea" — every routing decision is shown verbatim
 *   "#40 Always Offer What You Would Want" — full disclosure, not summary
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getRecentRoutes,
  type RouteEvent,
} from "@/lib/conductor/telemetry";
import { getAllCircuitStatuses, type CircuitStatus } from "@/lib/conductor/circuitBreaker";
import { Activity, Zap, ShieldAlert, ShieldCheck } from "lucide-react";

const POLL_MS = 5_000;

const STATE_COLOR: Record<string, string> = {
  closed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  half_open:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  open: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

function _shortTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function ConductorTrustSurfaces() {
  const [routes, setRoutes] = useState<RouteEvent[]>(() => getRecentRoutes(8));
  const [breakers, setBreakers] = useState<CircuitStatus[]>(() => getAllCircuitStatuses());

  useEffect(() => {
    const id = setInterval(() => {
      setRoutes(getRecentRoutes(8));
      setBreakers(getAllCircuitStatuses());
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const anyOpen = breakers.some((b) => b.state === "open");

  return (
    <div className="space-y-4">
      {/* Circuit-breaker summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {anyOpen ? (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            )}
            Vendor Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {breakers.map((b) => (
              <div
                key={b.vendor}
                className="flex flex-col items-center gap-1 rounded-md border bg-background p-2 text-center"
              >
                <span className="text-xs font-medium capitalize">{b.vendor}</span>
                <Badge
                  className={`text-[10px] ${STATE_COLOR[b.state] ?? ""}`}
                >
                  {b.state.replace("_", " ")}
                </Badge>
                {b.failuresInWindow > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {b.failuresInWindow} fails / 60s
                  </span>
                )}
              </div>
            ))}
          </div>
          {anyOpen && (
            <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">
              At least one vendor is temporarily auto-routed around. Your
              queries are still served by the next-best available vendor
              under the Conductor's empirical ranking.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent routing decisions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Routing Decisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No recent routing events. Decisions appear here as soon as you
              start querying through the Counterpart.
            </p>
          ) : (
            <div className="space-y-2">
              {routes.map((r) => (
                <div
                  key={`${r.ts}_${r.queryHash ?? ""}`}
                  className="flex items-start gap-2 rounded-md border bg-background p-2 text-xs"
                >
                  <Zap className="w-3 h-3 mt-0.5 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{r.vendor}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-mono text-[11px]">{r.model}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.queryClass}
                      </Badge>
                      {r.fallbackUsed && (
                        <Badge variant="secondary" className="text-[10px]">
                          fallback
                        </Badge>
                      )}
                      <span className="ml-auto text-muted-foreground">
                        {_shortTime(r.ts)}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground space-x-3">
                      {r.latencyMs !== null && (
                        <span>{r.latencyMs.toFixed(0)} ms</span>
                      )}
                      {r.costUsd !== null && (
                        <span>${r.costUsd.toFixed(5)}</span>
                      )}
                      {r.baselineCostUsd !== null &&
                        r.baselineCostUsd > (r.costUsd ?? 0) && (
                          <span className="text-green-600 dark:text-green-400">
                            saved $
                            {(r.baselineCostUsd - (r.costUsd ?? 0)).toFixed(5)}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
