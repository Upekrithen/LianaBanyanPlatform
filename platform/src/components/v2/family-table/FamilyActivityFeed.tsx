import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type FamilyActivityItem = {
  id: string;
  timestamp: string;
  sentence: string;
};

type FamilyActivityFeedProps = {
  items: FamilyActivityItem[];
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function FamilyActivityFeed({ items }: FamilyActivityFeedProps) {
  return (
    <Card id="family-activity-feed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Family activity feed</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border bg-background p-3">
                <p className="text-sm">{item.sentence}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatWhen(item.timestamp)}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            No activity yet. Invite a family member to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
