import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Route, Plus, Search, Coins } from "lucide-react";
import { RouteCard, type VehicleRoute } from "@/components/vehicle/RouteCard";
import { RideMatchDialog, type RideMatchPayload } from "@/components/vehicle/RideMatchDialog";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WILDFIRE_ROUTES: VehicleRoute[] = [
  { id: "wf-r1", originCity: "Austin", destinationCity: "San Antonio", departureTime: "07:30", seatsAvailable: 3, costPerRide: 8.50, daysAvailable: ["Monday", "Wednesday", "Friday"], pricingMode: "credits" },
  { id: "wf-r2", originCity: "Denver", destinationCity: "Boulder", departureTime: "08:00", seatsAvailable: 2, costPerRide: 5.00, daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], pricingMode: "credits" },
  { id: "wf-r3", originCity: "Portland", destinationCity: "Salem", departureTime: "06:45", seatsAvailable: 4, costPerRide: 15, daysAvailable: ["Monday", "Friday"], pricingMode: "marks" },
  { id: "wf-r4", originCity: "Nashville", destinationCity: "Murfreesboro", departureTime: "07:00", seatsAvailable: 3, costPerRide: 6, daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], pricingMode: "credits" },
];

type RouteDraft = {
  originCity: string;
  destinationCity: string;
  departureTime: string;
  seatsAvailable: number;
  costPerRide: string;
  pricingMode: "credits" | "marks";
  schedule: "recurring" | "one-time";
  daysAvailable: string[];
  note: string;
};

const EMPTY_DRAFT: RouteDraft = {
  originCity: "", destinationCity: "", departureTime: "", seatsAvailable: 3,
  costPerRide: "", pricingMode: "credits", schedule: "recurring", daysAvailable: [], note: "",
};

export default function RideshareRoutesV2() {
  const { user } = useAuth();
  const tourTarget = useTourTarget("rideshare-v2");
  const { isRunning: isWildfireTour } = useWildfireRun();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"browse" | "create">("browse");
  const [draft, setDraft] = useState<RouteDraft>(EMPTY_DRAFT);
  const [filterCity, setFilterCity] = useState("");
  const [filterDay, setFilterDay] = useState<string | null>(null);
  const [matchRoute, setMatchRoute] = useState<VehicleRoute | null>(null);

  const routesQuery = useQuery({
    queryKey: ["rideshare-v2-routes"],
    enabled: !isWildfireTour,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rideshare_routes")
        .select("id,origin_city,destination_city,departure_time,seats_available,cost_per_ride,days_available,driver_id,vehicle_description")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const myMatchesQuery = useQuery({
    queryKey: ["rideshare-v2-my-matches", user?.id],
    enabled: !!user?.id && !isWildfireTour,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rideshare_matches")
        .select("id,route_id,status")
        .eq("rider_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const requestedIds = useMemo(() => new Set((myMatchesQuery.data ?? []).map((m: any) => m.route_id)), [myMatchesQuery.data]);

  const routes = useMemo<VehicleRoute[]>(() => {
    if (isWildfireTour) return WILDFIRE_ROUTES;
    return (routesQuery.data ?? []).map((r: any) => ({
      id: r.id, originCity: r.origin_city, destinationCity: r.destination_city,
      departureTime: r.departure_time, seatsAvailable: r.seats_available,
      costPerRide: r.cost_per_ride, daysAvailable: r.days_available ?? [],
      driverId: r.driver_id, pricingMode: "credits" as const,
    }));
  }, [isWildfireTour, routesQuery.data]);

  const filtered = useMemo(() => {
    let result = routes;
    if (filterCity) {
      const lc = filterCity.toLowerCase();
      result = result.filter((r) => r.originCity.toLowerCase().includes(lc) || r.destinationCity.toLowerCase().includes(lc));
    }
    if (filterDay) {
      result = result.filter((r) => r.daysAvailable.length === 0 || r.daysAvailable.includes(filterDay!));
    }
    return result;
  }, [routes, filterCity, filterDay]);

  const postMutation = useMutation({
    mutationFn: async (payload: RouteDraft) => {
      if (!user?.id) throw new Error("Sign in required.");
      const { error } = await supabase.from("rideshare_routes").insert({
        driver_id: user.id,
        origin_city: payload.originCity,
        destination_city: payload.destinationCity,
        departure_time: payload.departureTime || null,
        seats_available: payload.seatsAvailable,
        cost_per_ride: payload.costPerRide ? Number(payload.costPerRide) : null,
        days_available: payload.schedule === "recurring" ? payload.daysAvailable : [],
        vehicle_description: payload.note || null,
        origin_address: payload.originCity,
        origin_zip: "",
        destination_address: payload.destinationCity,
        destination_zip: "",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Route posted.");
      setDraft(EMPTY_DRAFT);
      setTab("browse");
      queryClient.invalidateQueries({ queryKey: ["rideshare-v2-routes"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not post route."),
  });

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
      setMatchRoute(null);
      queryClient.invalidateQueries({ queryKey: ["rideshare-v2-my-matches"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not request ride."),
  });

  const toggleDraftDay = (day: string) => {
    setDraft((prev) => ({
      ...prev,
      daysAvailable: prev.daysAvailable.includes(day)
        ? prev.daysAvailable.filter((d) => d !== day)
        : [...prev.daysAvailable, day],
    }));
  };

  return (
    <AppShell
      xrayBase="rideshare-v2"
      pageTitle="Rideshare Routes"
      breadcrumbs="Services / Mobility / Rideshare"
      hero={
        <Hero
          variant="app"
          eyebrow="Cooperative commuting"
          headline="Match a commuter route or post your own."
          body="Recurring routes, one-time trips, cooperative contribution pricing — with full Cost+20% transparency for Credits, effort-differential for Marks."
          primaryCTA={{ label: "Browse routes", href: "#rideshare-browse" }}
          secondaryCTA={{ label: "Post a route", href: "#rideshare-create" }}
          proofStrip={[`${routes.length} active route${routes.length === 1 ? "" : "s"}`, "Cost+20% visible", "Marks-friendly"]}
        />
      }
    >
      <div className="space-y-6 pb-24" {...tourTarget}>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "browse" | "create")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse"><Search className="mr-2 h-4 w-4" /> Browse Routes</TabsTrigger>
            <TabsTrigger value="create"><Plus className="mr-2 h-4 w-4" /> Post a Route</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-4" id="rideshare-browse">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input placeholder="Filter by city..." value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="flex-1" />
              <div className="flex flex-wrap gap-1">
                <Badge variant={filterDay === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterDay(null)}>All days</Badge>
                {DAYS.map((day) => (
                  <Badge key={day} variant={filterDay === day ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterDay(day)}>{day.slice(0, 3)}</Badge>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No routes match your filters. Try a different city or post your own.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <div key={r.id} onClick={() => !requestedIds.has(r.id) && setMatchRoute(r)} className="cursor-pointer">
                    <RouteCard route={r} requested={requestedIds.has(r.id)} linkToDetail />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-4" id="rideshare-create">
            <Card>
              <CardHeader>
                <CardTitle>Post a Route</CardTitle>
                <CardDescription>Share your commute with the cooperative. Riders contribute to fuel cost through transparent pricing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Origin city</Label>
                    <Input value={draft.originCity} onChange={(e) => setDraft((p) => ({ ...p, originCity: e.target.value }))} placeholder="Austin" />
                  </div>
                  <div className="space-y-1">
                    <Label>Destination city</Label>
                    <Input value={draft.destinationCity} onChange={(e) => setDraft((p) => ({ ...p, destinationCity: e.target.value }))} placeholder="San Antonio" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Departure time</Label>
                    <Input type="time" value={draft.departureTime} onChange={(e) => setDraft((p) => ({ ...p, departureTime: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Seats available</Label>
                    <Input type="number" min={1} max={7} value={draft.seatsAvailable} onChange={(e) => setDraft((p) => ({ ...p, seatsAvailable: Math.max(1, Number(e.target.value || 1)) }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Price per ride</Label>
                    <Input type="number" min={0} step="0.01" value={draft.costPerRide} onChange={(e) => setDraft((p) => ({ ...p, costPerRide: e.target.value }))} placeholder="8.50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pricing mode</Label>
                  <div className="flex gap-2">
                    <Badge variant={draft.pricingMode === "credits" ? "default" : "outline"} className="cursor-pointer" onClick={() => setDraft((p) => ({ ...p, pricingMode: "credits" }))}>
                      <Coins className="mr-1 h-3 w-3" /> Credits (Cost+20%)
                    </Badge>
                    <Badge variant={draft.pricingMode === "marks" ? "default" : "outline"} className="cursor-pointer" onClick={() => setDraft((p) => ({ ...p, pricingMode: "marks" }))}>
                      <Coins className="mr-1 h-3 w-3" /> Marks (differential)
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <div className="flex gap-2">
                    <Badge variant={draft.schedule === "recurring" ? "default" : "outline"} className="cursor-pointer" onClick={() => setDraft((p) => ({ ...p, schedule: "recurring" }))}>Recurring</Badge>
                    <Badge variant={draft.schedule === "one-time" ? "default" : "outline"} className="cursor-pointer" onClick={() => setDraft((p) => ({ ...p, schedule: "one-time" }))}>One-time</Badge>
                  </div>
                  {draft.schedule === "recurring" && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {DAYS.map((day) => (
                        <Badge key={day} variant={draft.daysAvailable.includes(day) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleDraftDay(day)}>
                          {day.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Vehicle / cooperative note</Label>
                  <Textarea rows={2} value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} placeholder="Blue Honda Civic, splitting fuel cooperatively..." />
                </div>

                <div className="rounded-md border bg-muted/30 px-3 py-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Route shares are contribution-based, not premium upsells.</p>
                  <Badge variant="outline">Cost + 20%</Badge>
                </div>

                <Button
                  className="w-full"
                  onClick={() => postMutation.mutate(draft)}
                  disabled={postMutation.isPending || !draft.originCity || !draft.destinationCity}
                >
                  {postMutation.isPending ? "Posting..." : "Post route"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <StickyMobileCTA
          primary={{ label: "Browse routes", href: "#rideshare-browse" }}
          secondary={{ label: "Vehicle Hub", href: "/v2/wheels" }}
        />
      </div>

      <RideMatchDialog
        route={matchRoute}
        open={matchRoute !== null}
        onOpenChange={(open) => !open && setMatchRoute(null)}
        onSubmit={(payload) => matchMutation.mutateAsync(payload)}
        isPending={matchMutation.isPending}
      />
    </AppShell>
  );
}
