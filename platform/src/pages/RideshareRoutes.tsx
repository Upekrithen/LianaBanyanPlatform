import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Route, MapPin, Clock, Users, Plus, ArrowRight, Shield, CheckCircle2, Navigation, PlayCircle, StopCircle } from "lucide-react";
import { PioneerBadge } from "@/components/PioneerBadge";
import { usePioneerAssignment } from "@/hooks/usePioneerAssignment";
import { useSafetyLedger } from "@/hooks/useSafetyLedger";

type Tab = "browse" | "post" | "my-routes" | "my-rides";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Rider-facing price from driver's entered cost (gas) and platform fee % (default 20 = Cost+20%). */
function riderPaysFromCost(cost: number, platformFeePct: number | null | undefined) {
  const pct = (platformFeePct ?? 20) / 100;
  return {
    riderPays: cost * (1 + pct),
    platformPortion: cost * pct,
    feePct: platformFeePct ?? 20,
  };
}

function RideMatchCard({ match: m, route: r, userId }: { match: any; route: any; userId?: string }) {
  const { activeEntry, startTrip, endTrip, isTripActive } = useSafetyLedger("rideshare", m.id);

  const handleStartTrip = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => startTrip.mutate({ tripType: "rideshare", tripId: m.id, lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => startTrip.mutate({ tripType: "rideshare", tripId: m.id }),
      );
    } else {
      startTrip.mutate({ tripType: "rideshare", tripId: m.id });
    }
  };

  const handleEndTrip = () => {
    if (!activeEntry) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => endTrip.mutate({ ledgerEntryId: (activeEntry as any).id, lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => endTrip.mutate({ ledgerEntryId: (activeEntry as any).id }),
      );
    } else {
      endTrip.mutate({ ledgerEntryId: (activeEntry as any).id });
    }
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            {r ? (
              <p className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" /> {r.origin_city} <ArrowRight className="h-4 w-4" /> <MapPin className="h-4 w-4 text-red-600" /> {r.destination_city}
              </p>
            ) : (
              <p className="font-semibold">Route details unavailable</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Requested {new Date(m.created_at).toLocaleDateString()}</p>
            {r?.cost_per_ride > 0 && (() => {
              const c = Number(r.cost_per_ride);
              const { riderPays, platformPortion, feePct } = riderPaysFromCost(c, r.platform_fee_percentage);
              return (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ride cost: ${riderPays.toFixed(2)} (gas ${c.toFixed(2)} + platform {feePct}% ${platformPortion.toFixed(2)})
                </p>
              );
            })()}
          </div>
          <div className="flex items-center gap-2">
            {m.status === "accepted" && (
              isTripActive ? (
                <Button size="sm" variant="destructive" onClick={handleEndTrip} disabled={endTrip.isPending}>
                  <StopCircle className="h-3.5 w-3.5 mr-1" /> End Trip
                </Button>
              ) : (
                <Button size="sm" variant="default" onClick={handleStartTrip} disabled={startTrip.isPending}>
                  <PlayCircle className="h-3.5 w-3.5 mr-1" /> Start Trip
                </Button>
              )
            )}
            <Badge variant={m.status === "accepted" ? "default" : m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RideshareRoutes() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("browse");
  const { assignPioneer, isNewPioneer } = usePioneerAssignment("rideshare_driver");
  const [form, setForm] = useState({
    origin_address: "", origin_city: "", origin_zip: "",
    destination_address: "", destination_city: "", destination_zip: "",
    departure_time: "", return_time: "",
    days_available: [] as string[],
    seats_available: 3,
    cost_per_ride: "",
    vehicle_description: "",
  });

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["rideshare-routes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rideshare_routes").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: myRoutes = [] } = useQuery({
    queryKey: ["my-rideshare-routes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("rideshare_routes").select("*").eq("driver_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myMatches = [] } = useQuery({
    queryKey: ["my-rideshare-matches", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("rideshare_matches").select("*, rideshare_routes(*)").eq("rider_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: routeMatches = [] } = useQuery({
    queryKey: ["route-match-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const myRouteIds = myRoutes.map((r: any) => r.id);
      if (myRouteIds.length === 0) return [];
      const { data, error } = await supabase.from("rideshare_matches").select("*").in("route_id", myRouteIds).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && myRoutes.length > 0,
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      if (!form.origin_city || !form.destination_city || !form.departure_time) throw new Error("Fill required fields");
      const { error } = await supabase.from("rideshare_routes").insert({
        driver_id: user.id,
        origin_address: form.origin_address,
        origin_city: form.origin_city,
        origin_zip: form.origin_zip,
        destination_address: form.destination_address,
        destination_city: form.destination_city,
        destination_zip: form.destination_zip,
        departure_time: form.departure_time,
        return_time: form.return_time || null,
        days_available: form.days_available.map((d) => d.toLowerCase()),
        seats_available: form.seats_available,
        cost_per_ride: form.cost_per_ride ? parseFloat(form.cost_per_ride) : null,
        vehicle_description: form.vehicle_description || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Route posted! Riders can now find your commute.");
      qc.invalidateQueries({ queryKey: ["rideshare-routes"] });
      qc.invalidateQueries({ queryKey: ["my-rideshare-routes"] });
      setTab("my-routes");
      setForm({ origin_address: "", origin_city: "", origin_zip: "", destination_address: "", destination_city: "", destination_zip: "", departure_time: "", return_time: "", days_available: [], seats_available: 3, cost_per_ride: "", vehicle_description: "" });
      if (isNewPioneer) await assignPioneer();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const matchMutation = useMutation({
    mutationFn: async (routeId: string) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("rideshare_matches").insert({
        route_id: routeId,
        rider_id: user.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ride request sent! The driver will review.");
      qc.invalidateQueries({ queryKey: ["my-rideshare-matches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const acceptMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase.from("rideshare_matches").update({ status: "accepted", matched_at: new Date().toISOString() }).eq("id", matchId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rider accepted!");
      qc.invalidateQueries({ queryKey: ["route-match-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      days_available: prev.days_available.includes(day) ? prev.days_available.filter((d) => d !== day) : [...prev.days_available, day],
    }));
  };

  const alreadyMatched = (routeId: string) => myMatches.some((m: any) => m.route_id === routeId);

  if (!user) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="rideshare-routes-page">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Route className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sign in to browse or post commute routes</p>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <LaunchConditionOverlay initiativeSlug="rally-group" initiativeName="Rally Group">
      <PortalPageLayout maxWidth="xl" xrayId="rideshare-routes-page">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Navigation className="h-8 w-8 text-blue-600" /> Rideshare Routes
                <PioneerBadge role="rideshare_driver" />
              </h1>
              <p className="text-muted-foreground mt-1">Recurring commute matching — person-to-person, own insurance. LB is a matching service only.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["browse", "post", "my-routes", "my-rides"] as Tab[]).map((t) => (
                <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
                  {t === "browse" ? "Browse" : t === "post" ? "Post Route" : t === "my-routes" ? "My Routes" : "My Rides"}
                </Button>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-900 dark:text-amber-200">
            <strong>Important:</strong> Rideshare Routes is a person-to-person matching service. Each participant uses their own insurance. Liana Banyan is a marketplace connecting commuters — not a transportation company.
          </div>

          {/* Browse Routes */}
          {tab === "browse" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground animate-pulse">Loading routes...</div>
              ) : routes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Route className="mx-auto h-10 w-10 mb-3 opacity-40" />
                    <p>No routes posted yet. Be the first!</p>
                    <Button variant="outline" className="mt-4" onClick={() => setTab("post")}><Plus className="h-4 w-4 mr-1" /> Post a Route</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {routes.map((r: any) => (
                    <Card key={r.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                              <MapPin className="h-4 w-4 text-green-600 shrink-0" />
                              <span>{r.origin_city}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                              <span>{r.destination_city}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Departs {r.departure_time?.slice(0, 5)}</span>
                              {r.return_time && <span>• Returns {r.return_time?.slice(0, 5)}</span>}
                              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.seats_available} seat{r.seats_available !== 1 ? "s" : ""}</span>
                              {r.cost_per_ride != null && r.cost_per_ride > 0 && (() => {
                                const c = Number(r.cost_per_ride);
                                const { riderPays, platformPortion, feePct } = riderPaysFromCost(c, r.platform_fee_percentage);
                                return (
                                  <span title={`Gas: $${c.toFixed(2)} + Platform (${feePct}%): $${platformPortion.toFixed(2)}`}>
                                    • ${riderPays.toFixed(2)}/ride <span className="text-xs opacity-60">(Cost+{feePct}%)</span>
                                  </span>
                                );
                              })()}
                            </div>
                            {r.days_available?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {r.days_available.map((d: string) => <Badge key={d} variant="outline" className="text-xs capitalize">{d}</Badge>)}
                              </div>
                            )}
                            {r.vehicle_description && <p className="text-xs text-muted-foreground">{r.vehicle_description}</p>}
                          </div>
                          <div className="shrink-0">
                            {r.driver_id === user?.id ? (
                              <Badge variant="secondary">Your Route</Badge>
                            ) : alreadyMatched(r.id) ? (
                              <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" /> Requested</Badge>
                            ) : (
                              <Button size="sm" onClick={() => matchMutation.mutate(r.id)} disabled={matchMutation.isPending}>
                                Request Ride
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post a Route */}
          {tab === "post" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Post a Route</CardTitle>
                <CardDescription>Share your recurring commute and split gas costs with fellow members.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3 p-3 border rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-1"><MapPin className="h-4 w-4 text-green-600" /> Origin</p>
                    <Input placeholder="Address" value={form.origin_address} onChange={(e) => setForm((p) => ({ ...p, origin_address: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="City *" value={form.origin_city} onChange={(e) => setForm((p) => ({ ...p, origin_city: e.target.value }))} />
                      <Input placeholder="ZIP" value={form.origin_zip} onChange={(e) => setForm((p) => ({ ...p, origin_zip: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-3 p-3 border rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-1"><MapPin className="h-4 w-4 text-red-600" /> Destination</p>
                    <Input placeholder="Address" value={form.destination_address} onChange={(e) => setForm((p) => ({ ...p, destination_address: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="City *" value={form.destination_city} onChange={(e) => setForm((p) => ({ ...p, destination_city: e.target.value }))} />
                      <Input placeholder="ZIP" value={form.destination_zip} onChange={(e) => setForm((p) => ({ ...p, destination_zip: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><label className="text-xs font-medium">Departure Time *</label><Input type="time" value={form.departure_time} onChange={(e) => setForm((p) => ({ ...p, departure_time: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">Return Time</label><Input type="time" value={form.return_time} onChange={(e) => setForm((p) => ({ ...p, return_time: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">Seats Available</label><Input type="number" min={1} max={7} value={form.seats_available} onChange={(e) => setForm((p) => ({ ...p, seats_available: parseInt(e.target.value) || 1 }))} /></div>
                  <div>
                    <label className="text-xs font-medium">Your Gas Cost ($)</label>
                    <Input type="number" step="0.01" min="0" placeholder="5.00" value={form.cost_per_ride} onChange={(e) => setForm((p) => ({ ...p, cost_per_ride: e.target.value }))} />
                    {form.cost_per_ride && parseFloat(form.cost_per_ride) > 0 && (() => {
                      const c = parseFloat(form.cost_per_ride);
                      const { riderPays, feePct } = riderPaysFromCost(c, 20);
                      return (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Rider pays ${riderPays.toFixed(2)} (Cost+{feePct}%)</p>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">Days Available</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {DAYS.map((d) => (
                      <Badge key={d} variant={form.days_available.includes(d) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleDay(d)}>{d.slice(0, 3)}</Badge>
                    ))}
                  </div>
                </div>

                <div><label className="text-xs font-medium">Vehicle Description</label><Input placeholder="2020 Honda Civic, silver, 4-door" value={form.vehicle_description} onChange={(e) => setForm((p) => ({ ...p, vehicle_description: e.target.value }))} /></div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                  <Shield className="h-4 w-4 shrink-0 text-blue-600" />
                  For your safety, photos and location are recorded at trip start and end.
                </div>

                <Button className="w-full" onClick={() => postMutation.mutate()} disabled={postMutation.isPending || !form.origin_city || !form.destination_city || !form.departure_time}>
                  {postMutation.isPending ? "Posting..." : "Post Route"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* My Routes (driver view) */}
          {tab === "my-routes" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Posted Routes</h2>
              {myRoutes.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">You haven't posted any routes yet.<Button variant="link" onClick={() => setTab("post")} className="ml-1">Post one now</Button></CardContent></Card>
              ) : (
                myRoutes.map((r: any) => {
                  const matches = routeMatches.filter((m: any) => m.route_id === r.id);
                  return (
                    <Card key={r.id}>
                      <CardContent className="py-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-semibold">
                            <MapPin className="h-4 w-4 text-green-600" /> {r.origin_city} <ArrowRight className="h-4 w-4" /> <MapPin className="h-4 w-4 text-red-600" /> {r.destination_city}
                          </div>
                          <Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Departs {r.departure_time?.slice(0, 5)} • {r.seats_available} seats • {r.days_available?.map((d: string) => d.slice(0, 3)).join(", ")}</p>

                        {matches.length > 0 && (
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium mb-2">Match Requests ({matches.length})</p>
                            {matches.map((m: any) => (
                              <div key={m.id} className="flex items-center justify-between p-2 bg-muted rounded mb-1">
                                <div className="text-sm">
                                  <span className="font-medium">Rider</span>
                                  <Badge variant="outline" className="ml-2 text-xs">{m.status}</Badge>
                                </div>
                                {m.status === "pending" && (
                                  <Button size="sm" variant="default" onClick={() => acceptMutation.mutate(m.id)} disabled={acceptMutation.isPending}>Accept</Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* My Rides (rider view) */}
          {tab === "my-rides" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Ride Requests</h2>
              {myMatches.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">You haven't requested any rides yet.<Button variant="link" onClick={() => setTab("browse")} className="ml-1">Browse routes</Button></CardContent></Card>
              ) : (
                myMatches.map((m: any) => {
                  const r = m.rideshare_routes;
                  return <RideMatchCard key={m.id} match={m} route={r} userId={user?.id} />;
                })
              )}
            </div>
          )}
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}

export default RideshareRoutes;
