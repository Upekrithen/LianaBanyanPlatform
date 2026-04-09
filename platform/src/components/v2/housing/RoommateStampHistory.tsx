import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoommateStampEvent } from "./types";

type RoommateStampHistoryProps = {
  events: RoommateStampEvent[];
};

function formatCategory(value: string) {
  return value.replace(/_/g, " ");
}

export function RoommateStampHistory({ events }: RoommateStampHistoryProps) {
  return (
    <Card data-xray-id="housing-roommate-stamp-history">
      <CardHeader>
        <CardTitle>Roommate Stamp History</CardTitle>
        <CardDescription>Accountability story only: commitments, stamps, and outcomes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stamp events yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-md border p-2.5">
              <div>
                <p className="text-sm font-medium capitalize">{formatCategory(event.category)}</p>
                <p className="text-xs text-muted-foreground">{event.narrative}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(event.incidentDate).toLocaleDateString()}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {formatCategory(event.status)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
