import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LbCategorySpend } from "./types";

type InsightsPanelProps = {
  categorySpend: LbCategorySpend[];
  memberBusinessPercent: number;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function InsightsPanel({ categorySpend, memberBusinessPercent }: InsightsPanelProps) {
  const max = Math.max(...categorySpend.map((item) => item.amountCents), 1);

  return (
    <Card data-xray-id="lb-card-insights-panel">
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {categorySpend.length === 0 ? (
            <p className="text-sm text-muted-foreground">No category activity yet.</p>
          ) : (
            categorySpend.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="font-medium tabular-nums">{formatUsd(item.amountCents)}</span>
                </div>
                <div className="h-2 rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary"
                    style={{ width: `${Math.max(6, Math.round((item.amountCents / max) * 100))}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="rounded-lg border bg-muted/20 p-3 text-sm">
          <p className="font-medium">
            {memberBusinessPercent}% spent at local/member businesses
          </p>
          <p className="text-muted-foreground">
            Cooperative spending visibility helps reinforce the local loop.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
