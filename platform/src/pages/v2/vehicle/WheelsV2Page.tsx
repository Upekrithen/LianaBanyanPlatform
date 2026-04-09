import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Route, Truck, ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { VehicleSearchBar, type VehicleSearchFilters } from "@/components/vehicle/VehicleSearchBar";
import { RouteCard, type VehicleRoute } from "@/components/vehicle/RouteCard";
import { VehicleListingCard, type VehicleListing } from "@/components/vehicle/VehicleListingCard";

type TabKey = "find-ride" | "offer-ride" | "buy-sell" | "local-wheels";

const WILDFIRE_ROUTES: VehicleRoute[] = [
  { id: "wf-r1", originCity: "Austin", destinationCity: "San Antonio", departureTime: "07:30", seatsAvailable: 3, costPerRide: 8.50, daysAvailable: ["Monday", "Wednesday", "Friday"], pricingMode: "credits" },
  { id: "wf-r2", originCity: "Denver", destinationCity: "Boulder", departureTime: "08:00", seatsAvailable: 2, costPerRide: 5.00, daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], pricingMode: "credits" },
  { id: "wf-r3", originCity: "Portland", destinationCity: "Salem", departureTime: "06:45", seatsAvailable: 4, costPerRide: 15, daysAvailable: ["Monday", "Friday"], pricingMode: "marks" },
];

const WILDFIRE_LISTINGS: VehicleListing[] = [
  { id: "wf-l1", year: 2019, make: "Toyota", model: "Camry", color: "Silver", dailyRate: 35, location: "Austin, TX", features: ["Bluetooth", "Backup Camera", "AC"], totalRentals: 12, certifiedByCrew: true, photos: [] },
  { id: "wf-l2", year: 2021, make: "Honda", model: "Civic", color: "Blue", dailyRate: 30, location: "Denver, CO", features: ["GPS", "AC", "Heated Seats"], totalRentals: 5, certifiedByCrew: false, photos: [] },
  { id: "wf-l3", year: 2017, make: "Ford", model: "F-150", color: "White", dailyRate: 50, location: "Portland, OR", features: ["4WD", "Tow Hitch", "Roof Rack"], totalRentals: 8, certifiedByCrew: true, photos: [] },
];

function normalizeLocation(city?: string | null, state?: string | null) {
  return [city, state].filter(Boolean).join(", ") || "Location pending";
}

export default function VehicleWheelsV2Page() {
  const { user } = useAuth();
  const tourTarget = useTourTarget("vehicle-wheels");
  const { isRunning: isWildfireTour } = useWildfireRun();
  const [tab, setTab] = useState<TabKey>("find-ride");
  const [_filters, setFilters] = useState<VehicleSearchFilters | null>(null);

  const routesQuery = useQuery({
    queryKey: ["vehicle-v2-routes"],
    enabled: !isWildfireTour,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rideshare_routes")
        .select("id,origin_city,destination_city,departure_time,seats_available,cost_per_ride,days_available,driver_id")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string; origin_city: string; destination_city: string;
        departure_time: string | null; seats_available: number;
        cost_per_ride: number | null; days_available: string[] | null; driver_id: string | null;
      }>;
    },
  });

  const listingsQuery = useQuery({
    queryKey: ["vehicle-v2-listings"],
    enabled: !isWildfireTour,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lemon_lot_vehicles")
        .select("id,year,make,model,color,daily_rate,location_city,location_state,owner_id,features,description,total_rentals,insurance_verified")
        .eq("availability_status", "available")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string; year: number; make: string; model: string; color: string | null;
        daily_rate: number; location_city: string | null; location_state: string | null;
        owner_id: string | null; features: string[] | null; description: string | null;
        total_rentals: number | null; insurance_verified: boolean | null;
      }>;
    },
  });

  const fleetQuery = useQuery({
    queryKey: ["vehicle-v2-fleet"],
    enabled: !isWildfireTour,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("local_wheels_fleet")
        .select("id,make,model,year,assigned_driver_id,total_earned,total_earn_down,purchase_price,remaining_balance,status");
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string; make: string; model: string; year: number;
        assigned_driver_id: string | null; total_earned: number | null;
        total_earn_down: number | null; purchase_price: number | null;
        remaining_balance: number | null; status: string | null;
      }>;
    },
  });

  const routes = useMemo<VehicleRoute[]>(() => {
    if (isWildfireTour) return WILDFIRE_ROUTES;
    return (routesQuery.data ?? []).map((r) => ({
      id: r.id, originCity: r.origin_city, destinationCity: r.destination_city,
      departureTime: r.departure_time, seatsAvailable: r.seats_available,
      costPerRide: r.cost_per_ride, daysAvailable: r.days_available ?? [],
      driverId: r.driver_id, pricingMode: "credits" as const,
    }));
  }, [isWildfireTour, routesQuery.data]);

  const listings = useMemo<VehicleListing[]>(() => {
    if (isWildfireTour) return WILDFIRE_LISTINGS;
    return (listingsQuery.data ?? []).map((v) => ({
      id: v.id, year: v.year, make: v.make, model: v.model, color: v.color,
      dailyRate: Number(v.daily_rate), location: normalizeLocation(v.location_city, v.location_state),
      ownerId: v.owner_id, features: v.features ?? [], description: v.description,
      totalRentals: Number(v.total_rentals ?? 0), certifiedByCrew: v.insurance_verified === true, photos: [],
    }));
  }, [isWildfireTour, listingsQuery.data]);

  const fleet = useMemo(() => {
    if (isWildfireTour) return [
      { id: "wf-f1", label: "2022 Chevy Bolt", pct: 62, earned: 8400, status: "active" },
      { id: "wf-f2", label: "2020 Toyota Prius", pct: 88, earned: 14200, status: "active" },
    ];
    return (fleetQuery.data ?? []).filter((v) => v.assigned_driver_id).map((v) => ({
      id: v.id,
      label: `${v.year} ${v.make} ${v.model}`,
      pct: v.purchase_price ? Math.min(100, (Number(v.total_earn_down ?? 0) / Math.max(1, Number(v.purchase_price))) * 100) : 0,
      earned: Number(v.total_earned ?? 0),
      status: v.status ?? "available",
    }));
  }, [isWildfireTour, fleetQuery.data]);

  return (
    <AppShell
      xrayBase="vehicle-wheels"
      pageTitle="Vehicle Hub"
      breadcrumbs="Services / Mobility"
      hero={
        <Hero
          variant="app"
          eyebrow="Last Domain — 23/23"
          headline="One garage for rides, listings, and local fleet."
          body="Find a commuter match, list a vehicle for cooperative sharing, or track earn-down fleet progress — all with transparent pricing."
          primaryCTA={{ label: "Find a ride", href: "#vehicle-tabs" }}
          secondaryCTA={{ label: "Browse Lemon Lot", href: "/v2/lemon-lot" }}
          proofStrip={["Rideshare Routes", "Lemon Lot", "Local Wheels", "Cost+20% visible"]}
        />
      }
    >
      <div className="space-y-6 pb-24" {...tourTarget}>
        <div id="vehicle-tabs" />
        <VehicleSearchBar onSearch={setFilters} />

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="find-ride" className="gap-1"><Route className="h-4 w-4 hidden sm:inline" /> Find a Ride</TabsTrigger>
            <TabsTrigger value="offer-ride" className="gap-1"><MapPin className="h-4 w-4 hidden sm:inline" /> Offer a Ride</TabsTrigger>
            <TabsTrigger value="buy-sell" className="gap-1"><ShoppingBag className="h-4 w-4 hidden sm:inline" /> Buy/Sell</TabsTrigger>
            <TabsTrigger value="local-wheels" className="gap-1"><Truck className="h-4 w-4 hidden sm:inline" /> Local Wheels</TabsTrigger>
          </TabsList>

          <TabsContent value="find-ride" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Rideshare Routes</h2>
              <Link to="/v2/rideshare"><Button variant="outline" size="sm">View all routes</Button></Link>
            </div>
            {routes.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No active routes yet. Be the first to offer a ride.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {routes.slice(0, 6).map((r) => (
                  <RouteCard key={r.id} route={r} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="offer-ride" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Offer a Ride</CardTitle>
                <CardDescription>Post your commute or one-time route for cooperative matching.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/v2/rideshare">
                  <Button className="w-full">
                    <Route className="mr-2 h-4 w-4" />
                    Go to Rideshare to post a route
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buy-sell" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Lemon Lot Vehicles</h2>
              <Link to="/v2/lemon-lot"><Button variant="outline" size="sm">View all listings</Button></Link>
            </div>
            {listings.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No vehicles listed yet.</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.slice(0, 6).map((l) => (
                  <VehicleListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="local-wheels" className="space-y-4 mt-4">
            <h2 className="text-lg font-semibold">Local Wheels Fleet</h2>
            <p className="text-sm text-muted-foreground">Cooperative fleet vehicles with earn-down ownership economics.</p>
            {fleet.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No fleet vehicles active in your area.</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {fleet.map((v) => (
                  <Card key={v.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{v.label}</CardTitle>
                      <CardDescription>Earn-down: {v.pct.toFixed(0)}% toward ownership</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-emerald-600 transition-all" style={{ width: `${v.pct}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Total earned: {v.earned.toLocaleString()} credits</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <StickyMobileCTA
          primary={{ label: "Find a ride", href: "/v2/rideshare" }}
          secondary={{ label: "Browse vehicles", href: "/v2/lemon-lot" }}
        />
      </div>
    </AppShell>
  );
}
