import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

type EarnDownProgressStripProps = {
  isDriver: boolean;
  vehicleLabel?: string;
  ownershipPct?: number;
  totalEarned?: number;
  appliedToOwnership?: number;
  onBecomeDriver?: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function EarnDownProgressStrip({
  isDriver,
  vehicleLabel,
  ownershipPct = 0,
  totalEarned = 0,
  appliedToOwnership = 0,
  onBecomeDriver,
}: EarnDownProgressStripProps) {
  if (!isDriver) {
    return (
      <Card data-xray-id="wheels-earn-down-progress-strip">
        <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Earn-down ownership is visible here once you are assigned as a driver.</p>
            <p className="text-xs text-muted-foreground">Drivers keep 80% of ride earnings, and 20% is applied to ownership accumulation.</p>
          </div>
          <Button type="button" variant="outline" onClick={onBecomeDriver}>
            Become a Driver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-xray-id="wheels-earn-down-progress-strip">
      <CardContent className="space-y-3 py-4">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold">Earn-down progress{vehicleLabel ? ` - ${vehicleLabel}` : ""}</p>
          <p className="text-xs text-muted-foreground">80/20 split visible in every cycle</p>
        </div>
        <Progress value={Math.min(100, Math.max(0, ownershipPct))} className="h-2.5" />
        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
          <p>
            Ownership: <span className="font-semibold text-foreground">{ownershipPct.toFixed(1)}%</span>
          </p>
          <p>
            Driver keep: <span className="font-semibold text-foreground">{formatCurrency(totalEarned)}</span>
          </p>
          <p>
            Applied to ownership: <span className="font-semibold text-foreground">{formatCurrency(appliedToOwnership)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
