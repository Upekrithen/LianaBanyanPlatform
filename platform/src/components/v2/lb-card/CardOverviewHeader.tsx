import { CreditCard, Lock, Unlock, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CardOverviewHeaderProps = {
  lastFour: string;
  balanceCents: number;
  isFrozen: boolean;
  onAddFunds: () => void;
  onToggleFreeze: () => void;
  onViewDetails: () => void;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function CardOverviewHeader({
  lastFour,
  balanceCents,
  isFrozen,
  onAddFunds,
  onToggleFreeze,
  onViewDetails,
}: CardOverviewHeaderProps) {
  return (
    <Card data-xray-id="lb-card-overview-header">
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">LB Card</p>
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-base tracking-[0.2em]">•••• {lastFour}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {isFrozen ? "Card is frozen. Purchases are blocked." : "Card is active for spending."}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/20 px-4 py-3 sm:text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Main balance</p>
            <p className="text-2xl font-semibold tabular-nums">{formatUsd(balanceCents)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onAddFunds}>
            Add Funds
          </Button>
          <Button type="button" variant="outline" onClick={onToggleFreeze}>
            {isFrozen ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isFrozen ? "Unfreeze" : "Freeze"}
          </Button>
          <Button type="button" variant="secondary" onClick={onViewDetails}>
            <WalletCards className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
