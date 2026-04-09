import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HousingTimelineEvent } from "./types";

type HousingTimelineProps = {
  events: HousingTimelineEvent[];
};

export function HousingTimeline({ events }: HousingTimelineProps) {
  return (
    <Card data-xray-id="housing-timeline">
      <CardHeader>
        <CardTitle>My Housing Timeline</CardTitle>
        <CardDescription>Narrative sequence showing how actions changed your priority.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No timeline events yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.narrative}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{new Date(event.occurredAt).toLocaleString()}</p>
                </div>
                <Badge variant="outline">+{event.priorityDelta.toFixed(1)} priority</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
