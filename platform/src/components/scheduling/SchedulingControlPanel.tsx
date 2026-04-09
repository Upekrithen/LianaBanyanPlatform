import type { SchedulingEntry } from "@/components/scheduling/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SchedulingControlPanelProps = {
  title?: string;
  description?: string;
  entries: SchedulingEntry[];
  onOpenEntry?: (entry: SchedulingEntry) => void;
};

export function SchedulingControlPanel({
  title = "Scheduling Control Panel",
  description = "Bulk view of scheduled items.",
  entries,
  onOpenEntry,
}: SchedulingControlPanelProps) {
  const sorted = [...entries].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scheduled entries yet.</p>
        ) : (
          sorted.slice(0, 12).map((entry) => (
            <div key={`${entry.contentType}:${entry.contentId}:${entry.scheduledAt.toISOString()}`} className="rounded border p-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{entry.contentTitle}</p>
                <p className="text-xs text-muted-foreground">{entry.scheduledAt.toLocaleString()}</p>
              </div>
              {onOpenEntry ? (
                <Button size="sm" variant="outline" onClick={() => onOpenEntry(entry)}>
                  Edit
                </Button>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
