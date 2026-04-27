/**
 * ConductorTab — Member Helm Conductor Surface
 * K525 · Phase B.1 · Innovation #2277
 *
 * Gathers the Phase B member UI:
 *   - Cost Ticker (Phase B.4)
 *   - Spend Cap (Phase B.5)
 *   - Trust Surfaces (Phase B.3)
 *   - Nerd Mode collapsible (Phase B.2) — defaults closed; AUTO runs by default
 *   - Receipt Surface (Phase C)
 *
 * Visibility:
 *   The tab itself is rendered conditionally based on the
 *   `CONDUCTOR_BATON_ENABLED` feature flag (Phase D.1). Wave 0 dogfood = the
 *   Founder's flag flipped TRUE in their own session; everyone else sees no
 *   tab until Prov 14 trigger fires.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music2, Sparkles } from "lucide-react";
import { ConductorCostTicker } from "./ConductorCostTicker";
import { ConductorSpendCap } from "./ConductorSpendCap";
import { ConductorTrustSurfaces } from "./ConductorTrustSurfaces";
import { ConductorNerdMode } from "./ConductorNerdMode";
import { ConductorReceiptCard } from "./ConductorReceiptCard";

export function ConductorTab() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-indigo-500" />
            Conductor's Baton
            <Badge variant="outline" className="text-[10px] ml-2">
              Vendor-Neutral by Default
            </Badge>
          </CardTitle>
          <CardDescription>
            Every question you ask the Companion is auto-routed to the AI
            provider that performs best — and costs least — for that specific
            question. This page shows you exactly what the Conductor did,
            and lets you override or cap if you want to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              Default mode is <strong className="text-foreground">Automatic</strong> —
              no setup required. Power users can open Nerd Mode below to lock
              to one vendor or pick per-query.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top row: cost ticker + cap */}
      <div className="grid gap-4 md:grid-cols-2">
        <ConductorCostTicker />
        <ConductorSpendCap />
      </div>

      {/* Trust surfaces */}
      <ConductorTrustSurfaces />

      {/* Receipt card (Phase C) */}
      <ConductorReceiptCard />

      {/* Nerd Mode at the bottom — out of the way */}
      <ConductorNerdMode />

      {/* Footer */}
      <Card className="bg-muted/30">
        <CardContent className="pt-5 text-xs text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">How the Conductor decides:</strong>{" "}
            empirical R13 cross-vendor benchmarks (with the Liana Cathedral
            attached) for the primary task class, R11 per-domain HOT% priors
            when a Liana Banyan domain is detected, then a per-vendor circuit
            breaker that routes around currently-failing providers, then a
            token-budget check so models that can't fit your context aren't
            even attempted. Decisions are logged (hashed query only) to the
            Conductor scribe for member-visible audit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
