/**
 * BandWagon Positive-Only Quality Display
 * Show ONLY backing count and total backed amount. No negative ratings, no thumbs down.
 * Absence of backing = sufficient signal. Sort by backing magnitude, not rating.
 * SEC: earned allocation authority / sponsorship language only.
 */

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

export interface BandWagonQualityDisplayProps {
  backerCount: number;
  totalBackedAmount: number;
  className?: string;
  /** Optional label prefix */
  label?: string;
}

/**
 * Use this (or the same pattern) wherever project/listing UIs show BandWagon data.
 * Do NOT add: thumbs down, negative ratings, rejection indicators.
 * Sort lists by totalBackedAmount or backerCount (magnitude), not by a "rating" score.
 */
export function BandWagonQualityDisplay({
  backerCount,
  totalBackedAmount,
  className,
  label = "Backed",
}: BandWagonQualityDisplayProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}
      data-xray-id="bandwagon-quality-display"
      title={`${backerCount} backers · ${totalBackedAmount.toFixed(0)} Backed Marks`}
    >
      <Heart className="h-4 w-4" aria-hidden />
      <span>
        {label}: {backerCount} backers · {totalBackedAmount.toFixed(0)} Backed Marks
      </span>
    </span>
  );
}
