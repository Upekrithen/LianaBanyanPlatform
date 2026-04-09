import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsEntry } from "./types";

type EarningsTrackerProps = {
  entries: EarningsEntry[];
};

export function EarningsTracker({ entries }: EarningsTrackerProps) {
  const total = entries.reduce((sum, entry) => sum + entry.amountUsd, 0);

  return (
    <Card data-xray-id="bounty-photography-earnings-tracker">
      <CardHeader>
        <CardTitle>Earnings tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total earned</p>
          <p className="text-2xl font-semibold">${total.toFixed(2)}</p>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed payout entries yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{entry.title}</p>
              <p className="text-muted-foreground">
                ${entry.amountUsd.toFixed(2)} · {new Date(entry.paidAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
