import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RouteOption } from "./types";

type RouteCardProps = {
  route: RouteOption;
  requested: boolean;
  onRequest: (routeId: string) => Promise<void> | void;
};

export function RouteCard({ route, requested, onRequest }: RouteCardProps) {
  return (
    <Card data-xray-id="wheels-route-card">
      <CardContent className="space-y-2 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {route.originCity} to {route.destinationCity}
            </p>
            <p className="text-xs text-muted-foreground">
              {route.departureTime ? `Departs ${route.departureTime.slice(0, 5)} - ` : ""}
              {route.seatsAvailable} seat{route.seatsAvailable === 1 ? "" : "s"} available
            </p>
          </div>
          <div className="flex items-center gap-2">
            {route.costPerRide ? <Badge variant="secondary">${route.costPerRide.toFixed(2)}/ride</Badge> : null}
            {requested ? (
              <Badge variant="outline">Requested</Badge>
            ) : (
              <Button size="sm" onClick={() => onRequest(route.id)}>
                Request ride
              </Button>
            )}
          </div>
        </div>
        {route.daysAvailable.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {route.daysAvailable.map((day) => (
              <Badge key={`${route.id}-${day}`} variant="outline" className="capitalize">
                {day}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
