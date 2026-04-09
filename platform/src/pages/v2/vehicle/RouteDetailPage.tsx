import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clock, Users, Coins, MapPin, CalendarDays } from "lucide-react";
import { RideMatchDialog, type RideMatchPayload } from "@/components/vehicle/RideMatchDialog";
import { type VehicleRoute } from "@/components/vehicle/RouteCard";

function CostPlusBreakdown({ cost }: { cost: number }) {
  const platformMargin = cost * 0.2;
  const riderPays = cost + platformMargin;
  const driverKeeps = riderPays * 0.833;

  return (
    <div className="text-sm space-y-1 p-3 bg-muted/30 rounded-md">
      <div className="flex justify-between"><span className="text-muted-foreground">Gas/cost basis:</span><span>{cost.toFixed(2)} credits</span></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Platform margin (Cost+20%):</span><span>{platformMargin.toFixed(2)} credits</span></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Rider pays:</span><span className="font-medium">{riderPays.toFixed(2)} credits</span></div>
      <div className="flex justify-between border-t pt-1"><span className="font-medium">Driver keeps (83.3%):</span><span className="font-medium">{driverKeeps.toFixed(2)} credits</span></div>
    </div>
  );
}

export default function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [matchOpen, setMatchOpen] = useState(false);

  const routeQuery = useQuery({
    queryKey: ["route-detail", routeId],
    enabled: !!routeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rideshare_routes")
        .select("*")
        .eq("id", routeId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const matchesQuery = useQuery({
    queryKey: ["route-detail-matches", routeId],
    enabled: !!routeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rideshare_matches")
        .select("id,rider_id,status,created_at,pickup_address,days_requested")
        .eq("route_id", routeId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const alreadyRequested = useMemo(
    () => (matchesQuery.data ?? []).some((m: any) => m.rider_id === user?.id),
    [matchesQuery.data, user?.id],
  );

  const isOwnRoute = routeQuery.data?.driver_id === user?.id;

  const matchMutation = useMutation({
    mutationFn: async (payload: RideMatchPayload) => {
      if (!user?.id) throw new Error("Sign in required.");
      const { error } = await supabase.from("rideshare_matches").insert({
        route_id: payload.routeId,
        rider_id: user.id,
        pickup_address: payload.pickupAddress || null,
        days_requested: payload.daysRequested,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ride request sent.");
      setMatchOpen(false);
      queryClient.invalidateQueries({ queryKey: ["route-detail-matches", routeId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not request ride."),
  });

  const route = routeQuery.data;
  const vehicleRoute: VehicleRoute | null = route ? {
    id: route.id,
    originCity: route.origin_city,
    destinationCity: route.destination_city,
    departureTime: route.departure_time,
    seatsAvailable: route.seats_available,
    costPerRide: route.cost_per_ride ? Number(route.cost_per_ride) : null,
    daysAvailable: route.days_available ?? [],
    driverId: route.driver_id,
    pricingMode: "credits",
  } : null;

  return (
    <AppShell
      xrayBase="route-detail"
      pageTitle={route ? `${route.origin_city} → ${route.destination_city}` : "Route Detail"}
      breadcrumbs={
        <span className="flex items-center gap-1">
          <Link to="/v2/rideshare" className="underline">Rideshare</Link> / Route detail
        </span>
      }
    >
      <div className="space-y-6 pb-24">
        <Link to="/v2/rideshare" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to routes
        </Link>

        {routeQuery.isLoading && <Card><CardContent className="py-8 text-center text-muted-foreground">Loading route...</CardContent></Card>}
        {routeQuery.error && <Card><CardContent className="py-8 text-center text-destructive">Route not found.</CardContent></Card>}

        {route && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl flex items-center gap-2">
                    {route.origin_city} <ArrowRight className="h-5 w-5" /> {route.destination_city}
                  </CardTitle>
                </div>
                <CardDescription>
                  {route.vehicle_description || "Cooperative rideshare route"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {route.departure_time && (
                    <Badge variant="outline" className="gap-1 text-sm py-1">
                      <Clock className="h-3.5 w-3.5" /> Departs {String(route.departure_time).slice(0, 5)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1 text-sm py-1">
                    <Users className="h-3.5 w-3.5" /> {route.seats_available} seat{route.seats_available === 1 ? "" : "s"} available
                  </Badge>
                  {route.cost_per_ride != null && (
                    <Badge variant="secondary" className="gap-1 text-sm py-1">
                      <Coins className="h-3.5 w-3.5" /> {Number(route.cost_per_ride).toFixed(2)} credits/ride
                    </Badge>
                  )}
                </div>

                {(route.days_available ?? []).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Schedule</p>
                    <div className="flex flex-wrap gap-1">
                      {(route.days_available as string[]).map((day: string) => (
                        <Badge key={day} variant="outline" className="capitalize">{day}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {route.cost_per_ride != null && <CostPlusBreakdown cost={Number(route.cost_per_ride)} />}

                {!isOwnRoute && !alreadyRequested && (
                  <Button className="w-full" onClick={() => setMatchOpen(true)}>Request to join this route</Button>
                )}
                {alreadyRequested && (
                  <div className="rounded-md border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
                    You've already requested this route. The driver will respond soon.
                  </div>
                )}
                {isOwnRoute && (
                  <div className="rounded-md border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
                    This is your route. {(matchesQuery.data ?? []).length} rider request{(matchesQuery.data ?? []).length === 1 ? "" : "s"} so far.
                  </div>
                )}
              </CardContent>
            </Card>

            {isOwnRoute && (matchesQuery.data ?? []).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rider Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(matchesQuery.data ?? []).map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="text-sm">
                        <p className="font-medium">{match.pickup_address || "No pickup specified"}</p>
                        <p className="text-xs text-muted-foreground">
                          {(match.days_requested ?? []).join(", ") || "Flexible"} · {match.status}
                        </p>
                      </div>
                      <Badge variant={match.status === "accepted" ? "default" : match.status === "pending" ? "secondary" : "outline"}>
                        {match.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {vehicleRoute && (
        <RideMatchDialog
          route={vehicleRoute}
          open={matchOpen}
          onOpenChange={setMatchOpen}
          onSubmit={(payload) => matchMutation.mutateAsync(payload)}
          isPending={matchMutation.isPending}
        />
      )}
    </AppShell>
  );
}
