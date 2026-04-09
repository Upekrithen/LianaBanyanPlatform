import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BountyItem } from "./types";

type BountyCardProps = {
  bounty: BountyItem;
  onClaim: () => void;
};

export function BountyCard({ bounty, onClaim }: BountyCardProps) {
  return (
    <Card data-xray-id="bounty-photography-card">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="font-medium">{bounty.title}</p>
          <p className="text-sm text-muted-foreground">
            {bounty.merchant} · {bounty.city}
          </p>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{bounty.distanceMiles.toFixed(1)} miles</span>
          <span className="font-semibold">${bounty.payoutUsd.toFixed(2)}</span>
        </div>
        <Button type="button" onClick={onClaim} disabled={bounty.status !== "open"}>
          {bounty.status === "open" ? "Claim bounty" : "Already claimed"}
        </Button>
      </CardContent>
    </Card>
  );
}
