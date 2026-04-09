import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  EarnDownProgressStrip,
  ActiveDriverMap,
  LemonListing,
  LemonLotGrid,
  ListingDetailSlideOver,
  LocalRideRequestDraft,
  MatchSuggestionsPanel,
  RecentRideItem,
  RecentRidesFeed,
  RideRequestCard,
  RouteMatchBoard,
  RouteOption,
  ThreeTabModeSelector,
  WheelsMode,
} from "@/components/v2/wheels";

type RouteDraft = {
  originCity: string;
  destinationCity: string;
  departureTime: string;
  seatsAvailable: number;
  costPerRide: string;
  cooperativeNote: string;
};

function normalizeLocation(city?: string | null, state?: string | null) {
  return [city, state].filter(Boolean).join(", ") || "Location pending";
}

export default function WheelsV2Page() {
  const { user } = useAuth();
  const tourTarget = useTourTarget("wheels");
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<WheelsMode>("local-wheels");
  const [selectedListing, setSelectedListing] = useState<LemonListing | null>(null);
  const [isListingOpen, setIsListingOpen] = useState(false);
  const [routeDraft, setRouteDraft] = useState<RouteDraft>({
    originCity: "",
    destinationCity: "",
    departureTime: "",
    seatsAvailable: 3,
    costPerRide: "",
    cooperativeNote: "",
  });

  const fleetQuery = useQuery({
    queryKey: ["wheels-v2-fleet"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("local_wheels_fleet")
        .select("id,make,model,year,assigned_driver_id,total_earned,total_earn_down,purchase_price,remaining_balance,updated_at");
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        make: string;
        model: string;
        year: number;
        assigned_driver_id: string | null;
        total_earned: number | null;
        total_earn_down: number | null;
        purchase_price: number | null;
        remaining_balance: number | null;
        updated_at: string;
      }>;
    },
  });

  const lemonLotQuery = useQuery({
    queryKey: ["wheels-v2-lemon-lot"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lemon_lot_vehicles")
        .select("id,year,make,model,color,daily_rate,location_city,location_state,owner_id,features,description,total_rentals")
        .eq("availability_status", "available")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        year: number;
        make: string;
        model: string;
        color: string | null;
        daily_rate: number;
        location_city: string | null;
        location_state: string | null;
        owner_id: string | null;
        features: string[] | null;
        description: string | null;
        total_rentals: number | null;
      }>;
    },
  });

  const routesQuery = useQuery({
    queryKey: ["wheels-v2-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rideshare_routes")
        .select("id,origin_city,destination_city,departure_time,seats_available,cost_per_ride,days_available,driver_id")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        origin_city: string;
        destination_city: string;
        departure_time: string | null;
        seats_available: number;
        cost_per_ride: number | null;
        days_available: string[] | null;
        driver_id: string | null;
      }>;
    },
  });

  const myMatchQuery = useQuery({
    queryKey: ["wheels-v2-my-matches", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rideshare_matches")
        .select("id,route_id,status,created_at,rideshare_routes(origin_city,destination_city)")
        .eq("rider_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        route_id: string;
        status: string;
        created_at: string;
        rideshare_routes: { origin_city: string; destination_city: string } | null;
      }>;
    },
  });

  const requestRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      if (!user?.id) throw new Error("Sign in required.");
      const { error } = await supabase.from("rideshare_matches").insert({
        route_id: routeId,
        rider_id: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ride request sent.");
      queryClient.invalidateQueries({ queryKey: ["wheels-v2-my-matches"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not request ride."),
  });

  const postRouteMutation = useMutation({
    mutationFn: async (payload: RouteDraft) => {
      if (!user?.id) throw new Error("Sign in required.");
      const { error } = await supabase.from("rideshare_routes").insert({
        driver_id: user.id,
        origin_city: payload.originCity,
        destination_city: payload.destinationCity,
        departure_time: payload.departureTime || null,
        seats_available: payload.seatsAvailable,
        cost_per_ride: payload.costPerRide ? Number(payload.costPerRide) : null,
        vehicle_description: payload.cooperativeNote || null,
        days_available: [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Route posted.");
      setRouteDraft({
        originCity: "",
        destinationCity: "",
        departureTime: "",
        seatsAvailable: 3,
        costPerRide: "",
        cooperativeNote: "",
      });
      queryClient.invalidateQueries({ queryKey: ["wheels-v2-routes"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not post route."),
  });

  const driverVehicle = useMemo(
    () => (fleetQuery.data ?? []).find((vehicle) => vehicle.assigned_driver_id === user?.id) ?? null,
    [fleetQuery.data, user?.id],
  );

  const activeDrivers = useMemo(
    () =>
      (fleetQuery.data ?? [])
        .filter((vehicle) => Boolean(vehicle.assigned_driver_id))
        .slice(0, 6)
        .map((vehicle) => {
          const completion = vehicle.purchase_price
            ? (Number(vehicle.total_earn_down ?? 0) / Math.max(1, Number(vehicle.purchase_price))) * 100
            : 0;
          return {
            id: vehicle.id,
            label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            area: "Local fleet area",
            adaptLabel: completion >= 75 ? "Strong" : completion >= 40 ? "Building" : "Early",
            completionPct: Math.min(100, Math.max(0, completion)),
          };
        }),
    [fleetQuery.data],
  );

  const lemonListings = useMemo<LemonListing[]>(
    () =>
      (lemonLotQuery.data ?? []).map((item) => ({
        id: item.id,
        year: item.year,
        make: item.make,
        model: item.model,
        color: item.color,
        dailyRate: Number(item.daily_rate ?? 0),
        location: normalizeLocation(item.location_city, item.location_state),
        ownerId: item.owner_id,
        features: item.features ?? [],
        description: item.description,
        totalRentals: Number(item.total_rentals ?? 0),
      })),
    [lemonLotQuery.data],
  );

  const routeOptions = useMemo<RouteOption[]>(
    () =>
      (routesQuery.data ?? []).map((route) => ({
        id: route.id,
        originCity: route.origin_city,
        destinationCity: route.destination_city,
        departureTime: route.departure_time,
        seatsAvailable: Number(route.seats_available ?? 0),
        costPerRide: route.cost_per_ride,
        daysAvailable: route.days_available ?? [],
        driverId: route.driver_id,
      })),
    [routesQuery.data],
  );

  const recentRides = useMemo<RecentRideItem[]>(
    () =>
      (myMatchQuery.data ?? []).map((match) => ({
        id: match.id,
        origin: match.rideshare_routes?.origin_city ?? "Origin pending",
        destination: match.rideshare_routes?.destination_city ?? "Destination pending",
        status: match.status,
        createdAt: match.created_at,
      })),
    [myMatchQuery.data],
  );

  const requestedRouteIds = useMemo(() => (myMatchQuery.data ?? []).map((match) => match.route_id), [myMatchQuery.data]);

  const matchSuggestions = useMemo(() => {
    const byPair = new Map<string, number>();
    for (const route of routeOptions) {
      const key = `${route.originCity} to ${route.destinationCity}`;
      byPair.set(key, (byPair.get(key) ?? 0) + 1);
    }
    return Array.from(byPair.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, count]) => ({ label, detail: `${count} active route${count === 1 ? "" : "s"}` }));
  }, [routeOptions]);

  const mobileCtaByMode: Record<WheelsMode, { label: string; href: string }> = {
    "local-wheels": { label: "Request a ride", href: "#wheels-local-request" },
    "lemon-lot": { label: "Browse listings", href: "#wheels-lemon-grid" },
    "rideshare-routes": { label: "Match a route", href: "#wheels-route-board" },
  };

  const handleQuickRideRequest = async (request: LocalRideRequestDraft) => {
    if (!user?.id) {
      toast.error("Sign in required.");
      return;
    }

    const matchedRoute = routeOptions.find(
      (route) =>
        route.originCity.toLowerCase().includes(request.originCity.toLowerCase()) &&
        route.destinationCity.toLowerCase().includes(request.destinationCity.toLowerCase()),
    );

    if (!matchedRoute) {
      toast.message("No exact route match yet. Your request was noted in the local feed.");
      return;
    }

    await requestRouteMutation.mutateAsync(matchedRoute.id);
  };

  return (
    <AppShell
      xrayBase="wheels"
      pageTitle="Vehicle / Local Wheels"
      breadcrumbs="Member workspace / Mobility"
      hero={
        <Hero
          variant="app"
          eyebrow="Local Wheels"
          headline="One garage for rides, listings, and routes."
          body="Request a ride, list a vehicle, or match a commuter route - with earn-down ownership economics visible the whole way."
          primaryCTA={{ label: "Pick a mode", href: "#wheels-mode-selector-anchor" }}
          secondaryCTA={{ label: "How earn-down works", href: "#wheels-earn-down-anchor" }}
          proofStrip={["Local Wheels", "Lemon Lot", "Rideshare Routes"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />
        <div id="wheels-mode-selector-anchor" data-xray-id="wheels-tour-anchor" />
        <ThreeTabModeSelector mode={mode} onModeChange={setMode} />

        {mode === "local-wheels" ? (
          <section className="space-y-4">
            <div id="wheels-local-request">
              <RideRequestCard onSubmit={handleQuickRideRequest} />
            </div>
            <div id="wheels-earn-down-anchor">
              <EarnDownProgressStrip
                isDriver={Boolean(driverVehicle)}
                vehicleLabel={driverVehicle ? `${driverVehicle.year} ${driverVehicle.make} ${driverVehicle.model}` : undefined}
                ownershipPct={
                  driverVehicle?.purchase_price
                    ? (Number(driverVehicle.total_earn_down ?? 0) / Math.max(1, Number(driverVehicle.purchase_price))) * 100
                    : 0
                }
                totalEarned={Number(driverVehicle?.total_earned ?? 0)}
                appliedToOwnership={Number(driverVehicle?.total_earn_down ?? 0)}
                onBecomeDriver={() => {
                  window.location.href = "/local-wheels";
                }}
              />
            </div>
            <ActiveDriverMap drivers={activeDrivers} />
            <RecentRidesFeed rides={recentRides} />
          </section>
        ) : null}

        {mode === "lemon-lot" ? (
          <section className="space-y-4">
            <div id="wheels-lemon-grid">
              <LemonLotGrid
                listings={lemonListings}
                onSelectListing={(listing) => {
                  setSelectedListing(listing);
                  setIsListingOpen(true);
                }}
              />
            </div>
            <Card data-xray-id="wheels-post-listing-cta">
              <CardHeader>
                <CardTitle>Post Listing CTA</CardTitle>
                <CardDescription>Bring another vehicle into circulation for cooperative access.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => (window.location.href = "/lemon-lot")}>Post a listing</Button>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {mode === "rideshare-routes" ? (
          <section className="space-y-4">
            <div id="wheels-route-board">
              <RouteMatchBoard
                routes={routeOptions}
                requestedRouteIds={requestedRouteIds}
                onRequestRoute={(routeId) => requestRouteMutation.mutateAsync(routeId)}
              />
            </div>
            <Card data-xray-id="wheels-post-route-cta">
              <CardHeader>
                <CardTitle>Post Route CTA</CardTitle>
                <CardDescription>Share your route with cooperative framing and transparent contribution costs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Origin city"
                    value={routeDraft.originCity}
                    onChange={(event) => setRouteDraft((prev) => ({ ...prev, originCity: event.target.value }))}
                  />
                  <Input
                    placeholder="Destination city"
                    value={routeDraft.destinationCity}
                    onChange={(event) => setRouteDraft((prev) => ({ ...prev, destinationCity: event.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    type="time"
                    value={routeDraft.departureTime}
                    onChange={(event) => setRouteDraft((prev) => ({ ...prev, departureTime: event.target.value }))}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={routeDraft.seatsAvailable}
                    onChange={(event) =>
                      setRouteDraft((prev) => ({ ...prev, seatsAvailable: Math.max(1, Number(event.target.value || 1)) }))
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Contribution per ride"
                    value={routeDraft.costPerRide}
                    onChange={(event) => setRouteDraft((prev) => ({ ...prev, costPerRide: event.target.value }))}
                  />
                </div>
                <Textarea
                  rows={3}
                  placeholder="Cooperative note (example: splitting fuel and keeping commuting predictable for everyone)."
                  value={routeDraft.cooperativeNote}
                  onChange={(event) => setRouteDraft((prev) => ({ ...prev, cooperativeNote: event.target.value }))}
                />
                <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Cooperative framing: route shares are contribution-based, not premium upsells.
                  </p>
                  <Badge variant="outline">Cost + 20%</Badge>
                </div>
                <Button
                  onClick={() => postRouteMutation.mutate(routeDraft)}
                  disabled={postRouteMutation.isPending || !routeDraft.originCity || !routeDraft.destinationCity}
                >
                  {postRouteMutation.isPending ? "Posting..." : "Post route"}
                </Button>
              </CardContent>
            </Card>
            <MatchSuggestionsPanel suggestions={matchSuggestions} />
          </section>
        ) : null}

        <StickyMobileCTA
          primary={mobileCtaByMode[mode]}
          secondary={{ label: "How earn-down works", href: "#wheels-earn-down-anchor" }}
        />
      </div>

      <ListingDetailSlideOver
        listing={selectedListing}
        open={isListingOpen}
        onOpenChange={setIsListingOpen}
        onRequestRental={async (listing) => {
          if (!user?.id) {
            toast.error("Sign in required.");
            return;
          }
          toast.success(`Rental request started for ${listing.year} ${listing.make} ${listing.model}.`);
          setIsListingOpen(false);
        }}
      />
    </AppShell>
  );
}
