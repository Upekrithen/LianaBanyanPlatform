import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SubscriptionEconomicsCardProps = {
  price: number;
  cycleLabel: string;
};

export function SubscriptionEconomicsCard({ price, cycleLabel }: SubscriptionEconomicsCardProps) {
  const creatorKeeps = Number((price * 0.833).toFixed(2));
  const platformSupports = Number((price - creatorKeeps).toFixed(2));

  return (
    <Card data-xray-id="subscription-channel-economics-card">
      <CardHeader>
        <CardTitle>Subscription economics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Price: <span className="font-medium text-foreground">${price.toFixed(2)} {cycleLabel}</span>
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Creator keeps 83.3%</p>
            <p className="text-lg font-semibold">${creatorKeeps.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cooperative support</p>
            <p className="text-lg font-semibold">${platformSupports.toFixed(2)}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Platform operations follow a Cost+20% model so channel support stays sustainable and transparent.
        </p>
      </CardContent>
    </Card>
  );
}
