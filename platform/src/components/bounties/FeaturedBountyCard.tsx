/**
 * FeaturedBountyCard — individual Bounty Poster card in the LB Frame onboarding flow
 * KN088 / BP009. Ships inside LB Frame v1 featured Bounties display.
 *
 * Each card ships with:
 *   - Kallistra cooperative framing built in (Stance on Competition)
 *   - Dual-license door indicator (AGPL / Apache / Both)
 *   - Marks reward with explicit closed-loop disclaimer
 *
 * data-xray-id: featured-bounty-card
 */

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeaturedBounty } from "@/data/featured_bounties_bp009";

interface FeaturedBountyCardProps {
  bounty: FeaturedBounty;
  onSubmit?: (bounty: FeaturedBounty) => void;
  compact?: boolean;
}

const TIER_STYLES = {
  high:     "border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20",
  mid:      "border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20",
  standard: "border-border",
} as const;

const TIER_BADGE_STYLES = {
  high:     "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  mid:      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  standard: "bg-secondary text-secondary-foreground",
} as const;

const LICENSE_LABELS = {
  AGPL:   "Community (AGPL)",
  Apache: "Big-Guy (Apache)",
  Both:   "Community + Big-Guy",
} as const;

export function FeaturedBountyCard({
  bounty,
  onSubmit,
  compact = false,
}: FeaturedBountyCardProps) {
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        TIER_STYLES[bounty.tier]
      )}
      data-xray-id="featured-bounty-card"
      data-bounty-slug={bounty.slug}
    >
      <CardContent className={cn("space-y-3", compact ? "pt-4 pb-2 px-4" : "pt-5 pb-3 px-5")}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="">
              {bounty.iconEmoji}
            </span>
            <div>
              <p className={cn("font-semibold leading-tight", compact ? "text-sm" : "text-base")}>
                {bounty.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{bounty.tagline}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={cn("text-xs font-semibold whitespace-nowrap", TIER_BADGE_STYLES[bounty.tier])}>
              <Trophy className="w-3 h-3 mr-1" />
              {bounty.rewardMarks.toLocaleString()} Marks
            </Badge>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {LICENSE_LABELS[bounty.licenseScope]}
            </Badge>
          </div>
        </div>

        {!compact && (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bounty.description}
            </p>

            {/* Kallistra cooperative framing — per BRIDLE Rule 6 */}
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground italic border border-border/50">
              Working on {bounty.enterpriseCohort
                ? `${bounty.enterpriseCohort.split('/')[0].trim()} / related tech`
                : "this domain"}?
              {" "}You're already doing what we need. We're inviting you to work this Bounty and
              gain substrate access + cooperative network — without giving up your brand, customers, or IP.
            </div>

            {bounty.enterpriseCohort && (
              <div className="text-xs">
                <span className="text-muted-foreground">Empirical anchor for: </span>
                <span className="text-foreground font-medium">{bounty.enterpriseCohort}</span>
              </div>
            )}

            <div className="text-xs">
              <span className="text-muted-foreground">Verification: </span>
              <span className="text-foreground">{bounty.verificationMethod}</span>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className={cn("gap-2", compact ? "pb-3 px-4" : "pb-4 px-5")}>
        {onSubmit && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSubmit(bounty)}
          >
            Submit Work
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          asChild
        >
          <a
            href={`/bounties/${bounty.slug}`}
            target={compact ? "_blank" : undefined}
            rel={compact ? "noopener noreferrer" : undefined}
          >
            {compact && <ExternalLink className="w-3 h-3" />}
            {compact ? "Details" : "View Full Bounty"}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
