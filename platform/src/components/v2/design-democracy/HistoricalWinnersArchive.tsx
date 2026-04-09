import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WinnerArchiveItem } from "./types";

type HistoricalWinnersArchiveProps = {
  items: WinnerArchiveItem[];
};

export function HistoricalWinnersArchive({ items }: HistoricalWinnersArchiveProps) {
  return (
    <Card data-xray-id="design-democracy-winners-archive">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Historical winners archive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed rounds yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.battleId} className="rounded-lg border p-3">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                Winner: {item.winnerName} · Completed {new Date(item.completedAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
