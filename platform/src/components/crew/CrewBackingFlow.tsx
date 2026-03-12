/**
 * CREW BACKING FLOW — Confirm backing with cost breakdown (80% maker / 20% platform).
 * SEC-safe: "back", "offer", transparent breakdown. data-xray-id: crew-backing-confirm
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CrewOfferMember } from "./CrewOfferGrid";

const CREATOR_SHARE_PCT = 80;
const PLATFORM_SHARE_PCT = 20;

export interface CrewBackingFlowProps {
  member: CrewOfferMember;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function CrewBackingFlow({ member, onConfirm, onCancel }: CrewBackingFlowProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const price = member.offer_price != null ? Number(member.offer_price) : 0;
  const toMaker = (price * CREATOR_SHARE_PCT) / 100;
  const toPlatform = (price * PLATFORM_SHARE_PCT) / 100;
  const displayName = member.display_name || "Crew member";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Card className="border-green-500/50" data-xray-id="crew-backing-confirm">
        <CardContent className="p-6">
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            You&apos;ve backed {displayName}!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            They&apos;ll deliver &quot;{member.offer_title}&quot; within the 4-week window.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border" data-xray-id="crew-backing-confirm">
      <CardHeader>
        <p className="text-sm text-muted-foreground">
          You&apos;re backing {displayName}&apos;s offer:
        </p>
        <p className="font-semibold text-lg">&quot;{member.offer_title}&quot;</p>
        <p className="text-green-600 dark:text-green-400 font-semibold">
          ${price.toFixed(0)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="font-medium mb-2">Where your money goes:</p>
          <p>
            ${toMaker.toFixed(2)} → {displayName} (the maker)
          </p>
          <p className="text-muted-foreground">
            ${toPlatform.toFixed(2)} → Platform initiatives
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            disabled={loading}
            data-xray-id="crew-backing-confirm-btn"
          >
            {loading ? "Confirming…" : "Confirm — Back this offer"}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
