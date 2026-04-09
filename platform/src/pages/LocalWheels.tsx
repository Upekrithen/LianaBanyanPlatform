import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Truck, TrendingUp, DollarSign, User, Calendar, Shield, CheckCircle2, Clock, ShieldCheck, ShieldAlert, PlayCircle, StopCircle } from "lucide-react";
import { useSafetyLedger } from "@/hooks/useSafetyLedger";

function FleetEarningsCard({ vehicle: v }: { vehicle: any }) {
  const paidOff = v.purchase_price > 0 ? ((v.total_earn_down / v.purchase_price) * 100) : 0;
  const { activeEntry, startTrip, endTrip, isTripActive } = useSafetyLedger("local_wheels", v.id);

  const handleStartTrip = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => startTrip.mutate({ tripType: "local_wheels", tripId: v.id, lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => startTrip.mutate({ tripType: "local_wheels", tripId: v.id }),
      );
    } else {
      startTrip.mutate({ tripType: "local_wheels", tripId: v.id });
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{v.year} {v.make} {v.model}</CardTitle>
            <CardDescription>Your assigned fleet vehicle</CardDescription>
          </div>
          {isTripActive ? (
            <Button size="sm" variant="destructive" onClick={handleEndTrip} disabled={endTrip.isPending}>
              <StopCircle className="h-4 w-4 mr-1" /> End Trip
            </Button>
          ) : (
            <Button size="sm" onClick={handleStartTrip} disabled={startTrip.isPending}>
              <PlayCircle className="h-4 w-4 mr-1" /> Start Trip
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
            <DollarSign className="h-6 w-6 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">${v.total_earned?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">${v.total_earn_down?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Applied to Payoff ({v.earn_down_percentage}%)</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
            <Clock className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">${v.remaining_balance?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Remaining Balance</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Ownership Progress</span>
            <span className="font-semibold">{paidOff.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(100, paidOff)} className="h-3" />
        </div>
        {v.payoff_date && (
          <p className="text-sm text-muted-foreground">Projected payoff date: <strong>{new Date(v.payoff_date).toLocaleDateString()}</strong></p>
        )}
      </CardContent>
    </Card>
  );
}

function LocalWheels() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"fleet" | "earnings" | "apply">("fleet");

  const { data: fleet = [], isLoading } = useQuery({
    queryKey: ["local-wheels-fleet"],
    queryFn: async () => {
      const { data, error } = await supabase.from("local_wheels_fleet").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("crew_call_roles" as any).insert({
        user_id: user.id,
        role_type: "local_wheels_driver",
        reference_id: vehicleId,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted! A steward will review.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const myAssigned = fleet.filter((v: any) => v.assigned_driver_id === user?.id);

  if (!user) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="local-wheels-page">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Truck className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sign in to view Local Wheels fleet</p>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <LaunchConditionOverlay initiativeSlug="rally-group" initiativeName="Rally Group">
      <PortalPageLayout maxWidth="xl" xrayId="local-wheels-page">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Truck className="h-8 w-8 text-green-600" /> Local Wheels
              </h1>
              <p className="text-muted-foreground mt-1">LB fleet vehicles with Earn-Down to payoff — drive, earn, own</p>
            </div>
            <div className="flex gap-2">
              {(["fleet", "earnings", "apply"] as const).map((t) => (
                <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
                  {t === "fleet" ? "Fleet Overview" : t === "earnings" ? "My Earnings" : "Apply to Drive"}
                </Button>
              ))}
            </div>
          </div>

          {/* Fleet Overview */}
          {tab === "fleet" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground animate-pulse">Loading fleet...</div>
              ) : fleet.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Truck className="mx-auto h-10 w-10 mb-3 opacity-40" />
                    <p>No fleet vehicles available yet. Check back soon!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fleet.map((v: any) => {
                    const paidOff = v.purchase_price > 0 ? ((v.total_earn_down / v.purchase_price) * 100) : 0;
                    const remaining = v.remaining_balance;
                    return (
                      <Card key={v.id} className="overflow-hidden">
                        <div className={`h-1.5 ${remaining <= 0 ? "bg-green-500" : "bg-amber-500"}`} />
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{v.year} {v.make} {v.model}</CardTitle>
                            <Badge variant={v.status === "available" ? "default" : "secondary"}>{v.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Earn-Down Progress</span>
                              <span className="font-semibold">{paidOff.toFixed(1)}%</span>
                            </div>
                            <Progress value={Math.min(100, paidOff)} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="text-xs text-muted-foreground">Purchase</p>
                              <p className="font-semibold">${v.purchase_price?.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="text-xs text-muted-foreground">Remaining</p>
                              <p className="font-semibold">${remaining?.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="text-xs text-muted-foreground">Total Earned</p>
                              <p className="font-semibold text-green-600">${v.total_earned?.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-muted rounded text-center">
                              <p className="text-xs text-muted-foreground">Earn-Down</p>
                              <p className="font-semibold text-amber-600">${v.total_earn_down?.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            {v.assigned_driver_id ? "Driver assigned" : "Needs a driver"}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs">
                            {v.insurance_verified ? (
                              <span className="flex items-center gap-1 text-green-700 dark:text-green-400"><ShieldCheck className="h-3.5 w-3.5" /> Insured</span>
                            ) : (
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><ShieldAlert className="h-3.5 w-3.5" /> Insurance pending</span>
                            )}
                          </div>

                          {v.payoff_date && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" /> Est. payoff: {new Date(v.payoff_date).toLocaleDateString()}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground p-2 bg-green-50 dark:bg-green-950/30 rounded">
                            Driver keeps {v.driver_percentage}% of earnings • {v.earn_down_percentage}% goes to payoff
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* My Earnings */}
          {tab === "earnings" && (
            <div className="space-y-4">
              {myAssigned.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <TrendingUp className="mx-auto h-10 w-10 mb-3 opacity-40" />
                    <p>You're not assigned to any fleet vehicles yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setTab("apply")}>Apply to Drive</Button>
                  </CardContent>
                </Card>
              ) : (
                myAssigned.map((v: any) => <FleetEarningsCard key={v.id} vehicle={v} />)
              )}
            </div>
          )}

          {/* Apply to Drive */}
          {tab === "apply" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Apply to Drive</CardTitle>
                <CardDescription>Join the Local Wheels fleet. Drive an LB fleet vehicle, earn income, and work toward ownership through the Earn-Down program.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="font-medium">How Earn-Down Works</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• You drive a fleet vehicle for rideshare, deliveries, or personal errands</li>
                      <li>• 80% of all earnings go directly to you</li>
                      <li>• 20% goes toward paying off the vehicle</li>
                      <li>• Once paid off — the vehicle is yours</li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                    <Shield className="h-4 w-4 shrink-0 text-blue-600" />
                    For your safety, photos and location are recorded at trip start and end.
                  </div>
                </div>

                {fleet.filter((v: any) => v.status === "available").length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No vehicles currently available for assignment. Check back soon.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Available Vehicles</p>
                    {fleet.filter((v: any) => v.status === "available").map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{v.year} {v.make} {v.model}</p>
                          <p className="text-xs text-muted-foreground">${v.purchase_price?.toLocaleString()} • {v.earn_down_percentage}% earn-down</p>
                        </div>
                        <Button size="sm" onClick={() => applyMutation.mutate(v.id)} disabled={applyMutation.isPending}>
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}

export default LocalWheels;
