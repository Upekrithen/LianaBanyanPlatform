import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteOption } from "./types";
import { RouteCard } from "./RouteCard";

type RouteMatchBoardProps = {
  routes: RouteOption[];
  requestedRouteIds: string[];
  onRequestRoute: (routeId: string) => Promise<void> | void;
};

export function RouteMatchBoard({ routes, requestedRouteIds, onRequestRoute }: RouteMatchBoardProps) {
  return (
    <Card data-xray-id="wheels-route-match-board">
      <CardHeader>
        <CardTitle>Route Match Board</CardTitle>
        <CardDescription>Active route options with fast request actions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active route postings yet.</p>
        ) : (
          routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              requested={requestedRouteIds.includes(route.id)}
              onRequest={onRequestRoute}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
