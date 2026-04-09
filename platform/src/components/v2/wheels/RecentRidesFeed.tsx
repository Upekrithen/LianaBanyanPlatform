import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentRideItem } from "./types";

type RecentRidesFeedProps = {
  rides: RecentRideItem[];
};

function formatStatus(status: string) {
  const normalized = (status || "").toLowerCase();
  if (!normalized) return "pending";
  return normalized.replace(/_/g, " ");
}

export function RecentRidesFeed({ rides }: RecentRidesFeedProps) {
  return (
    <Card data-xray-id="wheels-recent-rides-feed">
      <CardHeader>
        <CardTitle>Recent Rides Feed</CardTitle>
        <CardDescription>Latest ride and match activity for your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rides.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent rides yet.</p>
        ) : (
          rides.slice(0, 8).map((ride) => (
            <div key={ride.id} className="flex items-center justify-between rounded-md border p-2.5">
              <div>
                <p className="text-sm font-medium">
                  {ride.origin} to {ride.destination}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(ride.createdAt).toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {formatStatus(ride.status)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
