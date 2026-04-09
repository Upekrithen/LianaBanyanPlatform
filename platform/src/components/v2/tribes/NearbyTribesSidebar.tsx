import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TribeCardData } from "./TribeCard";

type NearbyTribesSidebarProps = {
  tribes: TribeCardData[];
  onJoin: (tribeId: string) => void;
};

export function NearbyTribesSidebar({ tribes, onJoin }: NearbyTribesSidebarProps) {
  if (tribes.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Nearby tribes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tribes.slice(0, 3).map((tribe) => (
          <article key={tribe.id} className="rounded-xl border p-3">
            <p className="text-sm font-medium">{tribe.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{tribe.charterExcerpt}</p>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary">{tribe.geoTag ?? "Nearby"}</Badge>
              <Button size="sm" onClick={() => onJoin(tribe.id)}>
                {tribe.joinType === "Open" ? "Join" : "Request"}
              </Button>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
