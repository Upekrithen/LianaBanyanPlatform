/**
 * CREW MEMBER CARD — Avatar, name/offer title, price, status badge
 * Used on invite page and dashboard member grids.
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface CrewMemberCardProps {
  offerTitle: string;
  offerDescription?: string | null;
  offerPrice?: number | null;
  status?: "joined" | "backed" | "fulfilled" | "dropped";
  /** Optional display name (e.g. from profile); falls back to initial from offer */
  displayName?: string | null;
  className?: string;
}

export function CrewMemberCard({
  offerTitle,
  offerDescription,
  offerPrice,
  status,
  displayName,
  className,
}: CrewMemberCardProps) {
  const initial = (displayName || offerTitle).slice(0, 1).toUpperCase();
  const statusLabel = status === "joined" ? "Joined" : status === "backed" ? "Backed" : status === "fulfilled" ? "Fulfilled" : status === "dropped" ? "Dropped" : null;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card transition-colors",
        className
      )}
      data-xray-id="crew-member-card"
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarFallback className="bg-green-500/20 text-green-600 dark:text-green-400 text-lg font-semibold">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        {displayName && (
          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        )}
        <p className="font-medium truncate">{offerTitle}</p>
        {offerDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">{offerDescription}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        {offerPrice != null && (
          <p className="font-semibold text-green-600 dark:text-green-400">${Number(offerPrice).toFixed(0)}</p>
        )}
        {statusLabel && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {statusLabel}
          </span>
        )}
      </div>
    </div>
  );
}
