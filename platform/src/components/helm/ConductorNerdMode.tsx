/**
 * ConductorNerdMode — Advanced Conductor Controls
 * K525 · Phase B.2 · Innovation #2277
 *
 * "Nerd Mode" panel exposes the manual + vendor-lock modes that were relegated
 * out of the default Helm experience at B129 Founder ratification. AUTO is the
 * default (and recommended) mode; this panel lets advanced members opt out.
 *
 * Wrapped in a collapsible disclosure so it doesn't visually distract members
 * who don't need it. Default-collapsed.
 *
 * Metaphor:
 *   "Automatic"  → mode=auto       (default; the Conductor picks the gear)
 *   "Manual"     → mode=manual     (member picks per-query)
 *   "Fixed Gear" → mode=vendor-lock (always one vendor, audit/regulatory)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Settings2 } from "lucide-react";
import { ConductorModeSelector } from "./ConductorModeSelector";

export function ConductorNerdMode() {
  const [open, setOpen] = useState(false);

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardHeader
        className="cursor-pointer py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Settings2 className="w-4 h-4" />
            Nerd Mode — advanced Conductor controls
          </span>
          <Badge variant="outline" className="text-[10px]">
            Optional
          </Badge>
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            By default, the Conductor picks the best AI model for each
            question automatically (Automatic). If you'd rather choose the
            model yourself per-query, or always route to one provider for
            audit/compliance, use the controls below.
          </p>

          <ConductorModeSelector />

          <div className="rounded-lg border bg-amber-50/40 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            <strong>Heads-up:</strong> Switching out of Automatic disables
            cost-optimization and category-aware priors. Your spend and
            quality may change visibly. The Cost Ticker on this page will
            keep tracking either way.
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              Collapse Nerd Mode
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
