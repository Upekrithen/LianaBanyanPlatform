import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Users, Coins } from "lucide-react";
import { Link } from "react-router-dom";

export type VehicleRoute = {
  id: string;
  originCity: string;
  destinationCity: string;
  departureTime?: string | null;
  seatsAvailable: number;
  costPerRide?: number | null;
  daysAvailable: string[];
  driverId?: string | null;
  pricingMode?: "credits" | "marks";
};

type RouteCardProps = {
  route: VehicleRoute;
  requested?: boolean;
  onRequest?: (routeId: string) => void;
  linkToDetail?: boolean;
};

function CostPlusBreakdown({ cost }: { cost: number }) {
  const platformMargin = cost * 0.2;
  const riderPays = cost + platformMargin;
  const creatorKeeps = riderPays * 0.833;

  return (
    <div className="text-xs text-muted-foreground space-y-0.5 mt-2 p-2 bg-muted/30 rounded-md">
      <div className="flex justify-between"><span>Gas/cost basis:</span><span>{cost.toFixed(2)} credits</span></div>
      <div className="flex justify-between"><span>Platform margin (Cost+20%):</span><span>{platformMargin.toFixed(2)} credits</span></div>
      <div className="flex justify-between font-medium text-foreground"><span>Driver keeps (83.3%):</span><span>{creatorKeeps.toFixed(2)} credits</span></div>
    </div>
  );
}

export function RouteCard({ route, requested, onRequest, linkToDetail = true }: RouteCardProps) {
  const isMarks = route.pricingMode === "marks";

  const content = (
    <Card className="transition-shadow hover:shadow-md" data-xray-id="vehicle-route-card">
      <CardContent className="space-y-2 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{route.originCity}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{route.destinationCity}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {route.departureTime && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {route.departureTime.slice(0, 5)}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {route.seatsAvailable} seat{route.seatsAvailable === 1 ? "" : "s"}
            </Badge>
            {route.costPerRide != null && (
              <Badge variant="secondary" className="gap-1">
                <Coins className="h-3 w-3" />
                {isMarks ? `${route.costPerRide} Marks` : `${route.costPerRide.toFixed(2)} credits`}
              </Badge>
            )}
          </div>
        </div>

        {route.daysAvailable.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {route.daysAvailable.map((day) => (
              <Badge key={day} variant="outline" className="text-[10px] capitalize">{day}</Badge>
            ))}
          </div>
        )}

        {route.costPerRide != null && !isMarks && <CostPlusBreakdown cost={route.costPerRide} />}

        {isMarks && route.costPerRide != null && (
          <p className="text-xs text-muted-foreground mt-1">
            Effort-based differential: {route.costPerRide} Marks
          </p>
        )}

        {onRequest && !requested && (
          <Button size="sm" className="mt-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRequest(route.id); }}>
            Request ride
          </Button>
        )}
        {requested && <Badge variant="outline" className="mt-2">Requested</Badge>}
      </CardContent>
    </Card>
  );

  if (linkToDetail) {
    return <Link to={`/v2/rideshare/${route.id}`} className="block">{content}</Link>;
  }
  return content;
}
