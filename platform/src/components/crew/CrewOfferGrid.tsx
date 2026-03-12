/**
 * CREW OFFER GRID — Grid of Crew members' offers for picking who to back.
 * Shows all members except current user. Status: Available / Already backed.
 * data-xray-id: crew-offer-grid
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface CrewOfferMember {
  id: string;
  user_id: string | null;
  offer_title: string;
  offer_description: string | null;
  offer_price: number | null;
  status: string;
  backed_by: string | null;
  display_name?: string | null;
}

export interface CrewOfferGridProps {
  members: CrewOfferMember[];
  currentUserId: string | undefined;
  myCrewMemberId: string | undefined;
  /** Member id that current user has already backed (if any) */
  backedMemberId: string | null;
  onBackOffer: (member: CrewOfferMember) => void;
  className?: string;
}

export function CrewOfferGrid({
  members,
  currentUserId,
  myCrewMemberId,
  backedMemberId,
  onBackOffer,
  className,
}: CrewOfferGridProps) {
  const others = members.filter((m) => m.user_id !== currentUserId);
  const canBack = !!myCrewMemberId && !backedMemberId;

  return (
    <div
      className={cn("space-y-4", className)}
      data-xray-id="crew-offer-grid"
    >
      <h2 className="font-semibold">Choose someone to back</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {others.map((m) => {
          const available = m.status === "joined" && !m.backed_by;
          const alreadyBackedByMe = m.id === backedMemberId;
          const alreadyBackedByOther = m.backed_by && !alreadyBackedByMe;
          const showBackButton = available && canBack;

          return (
            <Card
              key={m.id}
              className={cn(
                "border-2 transition-colors",
                available ? "border-border" : "border-muted opacity-80"
              )}
              data-xray-id="crew-offer-card"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-green-500/20 text-green-600 dark:text-green-400 text-sm font-semibold">
                      {(m.display_name || m.offer_title).slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {m.display_name || "Crew member"}
                    </p>
                    <p className="font-medium truncate text-foreground">
                      {m.offer_title}
                    </p>
                    {m.offer_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {m.offer_description}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                      ${m.offer_price != null ? Number(m.offer_price).toFixed(0) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alreadyBackedByMe
                        ? "You backed this offer"
                        : alreadyBackedByOther
                          ? "Already backed"
                          : "Available"}
                    </p>
                    {showBackButton && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => onBackOffer(m)}
                        data-xray-id="crew-back-offer-btn"
                      >
                        Back this offer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
