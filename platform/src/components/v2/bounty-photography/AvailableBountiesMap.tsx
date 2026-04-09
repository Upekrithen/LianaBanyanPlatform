import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BountyItem } from "./types";

type AvailableBountiesMapProps = {
  bounties: BountyItem[];
  radiusMiles: number;
};

export function AvailableBountiesMap({ bounties, radiusMiles }: AvailableBountiesMapProps) {
  const visible = bounties.filter((bounty) => bounty.distanceMiles <= radiusMiles);

  return (
    <Card data-xray-id="bounty-photography-map">
      <CardHeader>
        <CardTitle>Available bounties map</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Showing nearby bounties within {radiusMiles} miles.
        </p>
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No nearby bounties in this radius.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {visible.map((bounty) => (
              <div key={bounty.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{bounty.title}</p>
                <p className="text-muted-foreground">
                  {bounty.merchant} · {bounty.city}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {bounty.distanceMiles.toFixed(1)} mi away
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
