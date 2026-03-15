/**
 * PreorderFundedBadge — SEC-safety: "Pre-Sold • Paid Before Production"
 * Show on product listings, Creator Showcase cards, production run pages. Session 18.
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

const TOOLTIP = "All preorders are paid in full before manufacturing begins. No speculative production.";

export function PreorderFundedBadge({ className = "" }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={`inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary font-medium ${className}`}
            data-xray-id="preorder-funded-badge"
          >
            <Lock className="w-3 h-3" />
            Pre-Sold · Paid Before Production
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>{TOOLTIP}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
