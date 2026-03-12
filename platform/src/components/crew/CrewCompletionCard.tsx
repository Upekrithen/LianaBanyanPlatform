/**
 * CREW COMPLETION CARD — Run #1 complete: summary, testimonials, share, Start Run #2.
 * Celebratory styling (gold border/glow). data-xray-id on key elements.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface CrewCompletionCardProps {
  crewName: string;
  city: string | null;
  state: string | null;
  focusLabel: string;
  memberCount: number;
  ordersFulfilled: number;
  totalMoved: number;
  testimonials: { content: string; displayName?: string | null }[];
  onShare?: () => void;
}

export function CrewCompletionCard({
  crewName,
  city,
  state,
  focusLabel,
  memberCount,
  ordersFulfilled,
  totalMoved,
  testimonials,
  onShare,
}: CrewCompletionCardProps) {
  const location = [city, state].filter(Boolean).join(", ") || "—";
  const topTestimonials = testimonials.slice(0, 3);

  return (
    <Card
      className="border-2 border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/10"
      data-xray-id="crew-completion-card"
    >
      <CardContent className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-center">
          🎉 FOUNDING CREW RUN #1 COMPLETE!
        </h2>
        <p className="text-center font-medium">
          {crewName} — {location}
        </p>
        <p className="text-center text-sm text-muted-foreground">{focusLabel}</p>
        <div className="border-t border-b border-border py-3 text-center text-sm">
          {memberCount} members | {ordersFulfilled} orders fulfilled | $
          {totalMoved.toFixed(0)} moved
        </div>
        {topTestimonials.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top testimonials</p>
            <ul className="space-y-2">
              {topTestimonials.map((t, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground italic pl-2 border-l-2 border-amber-500/30"
                >
                  &quot;{t.content}&quot; — {t.displayName ?? "Member"}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {onShare && (
            <Button variant="default" onClick={onShare} data-xray-id="crew-share-story-btn">
              Share this story
            </Button>
          )}
          <Button variant="outline" disabled data-xray-id="crew-start-run-2-btn">
            Start Run #2 — Coming soon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
