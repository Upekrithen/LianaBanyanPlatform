import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekThreadEvent } from "./types";

type TripStoryCardProps = {
  routeEvents: WeekThreadEvent[];
};

export function TripStoryCard({ routeEvents }: TripStoryCardProps) {
  const totalHours = routeEvents.reduce((sum, event) => sum + Math.max(0, event.endHour - event.startHour), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trip story</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          Route thread captured {routeEvents.length} movement blocks this week across {totalHours} hours.
        </p>
        <p className="text-muted-foreground">
          Does this route pattern still match the commitments you are trying to prioritize?
        </p>
      </CardContent>
    </Card>
  );
}
