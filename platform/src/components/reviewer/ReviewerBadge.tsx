/**
 * REVIEWER BADGE — Tier icon for Content / Stat / Harper
 * data-xray-id: reviewer-badge
 */

import { cn } from "@/lib/utils";

export type ReviewerTier = "content" | "stat" | "harper";

const TIER_ICON: Record<ReviewerTier, string> = {
  content: "📋",
  stat: "📊",
  harper: "⚖️",
};

const TIER_LABEL: Record<ReviewerTier, string> = {
  content: "Content Reviewer",
  stat: "Stat Reviewer",
  harper: "Harper",
};

export interface ReviewerBadgeProps {
  tier: ReviewerTier;
  className?: string;
  showLabel?: boolean;
}

export function ReviewerBadge({ tier, className, showLabel = true }: ReviewerBadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      data-xray-id="reviewer-badge"
      title={TIER_LABEL[tier]}
    >
      <span aria-hidden>{TIER_ICON[tier]}</span>
      {showLabel && <span className="text-sm font-medium">{TIER_LABEL[tier]}</span>}
    </span>
  );
}
