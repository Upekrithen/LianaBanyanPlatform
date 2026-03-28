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
import { Car, Star, MapPin, DollarSign, Plus, ArrowLeft, Shield, Calendar, CheckCircle2 } from "lucide-react";

type Tab = "browse" | "list" | "detail" | "my-vehicles";

const FEATURE_OPTIONS = ["AC", "Bluetooth", "4WD", "GPS", "Backup Camera", "Heated Seats", "Sunroof", "Tow Hitch", "Roof Rack", "Child Seat Anchors"];

const COST_PLUS_20_FLOOR = 15; // minimum $15/day to cover Cost+20% baseline

function LemonLot() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("browse");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [form, setForm] = useState({ make: "", model: "", year: new Date().getFullYear(), color: "", description: "", daily_rate: "", weekly_rate: "", monthly_rate: "", location_city: "", location_state: "", location_zip: "", insurance_provider: "", insurance_policy_number: "", features: [] as string[] });
  const [rentalDates, setRentalDates] = useState({ start: "", end: "" });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["lemon-lot-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lemon_lot_vehicles").select("*").eq("availability_status", "available").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: myVehicles = [] } = useQuery({
    queryKey: ["my-lemon-lot-vehicles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("lemon_lot_vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myRentals = [] } = useQuery({
    queryKey: ["my-lemon-lot-rentals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("lemon_lot_rentals").select("*").or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const listMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      const dailyRate = parseFloat(form.daily_rate);
      if (dailyRate < COST_PLUS_20_FLOOR) throw new Error(`Minimum daily rate is $${COST_PLUS_20_FLOOR} (Cost+20% floor)`);
      const { error } = await supabase.from("lemon_lot_vehicles").insert({
        owner_id: user.id,
        make: form.make,
        model: form.model,
        year: form.year,
        color: form.color,
        description: form.description,
        daily_rate: dailyRate,
        weekly_rate: form.weekly_rate ? parseFloat(form.weekly_rate) : null,
        monthly_rate: form.monthly_rate ? parseFloat(form.monthly_rate) : null,
        location_city: form.location_city,
        location_state: form.location_state,
        location_zip: form.location_zip,
        insurance_provider: form.insurance_provider,
        insurance_policy_number: form.insurance_policy_number,
        features: form.features,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vehicle listed on the Lemon Lot!");
      qc.invalidateQueries({ queryKey: ["lemon-lot-vehicles"] });
      qc.invalidateQueries({ queryKey: ["my-lemon-lot-vehicles"] });
      setTab("my-vehicles");
      setForm({ make: "", model: "", year: new Date().getFullYear(), color: "", description: "", daily_rate: "", weekly_rate: "", monthly_rate: "", location_city: "", location_state: "", location_zip: "", insurance_provider: "", insurance_policy_number: "", features: [] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rentalMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedVehicle) throw new Error("Sign in required");
      if (!rentalDates.start || !rentalDates.end) throw new Error("Select rental dates");
      const start = new Date(rentalDates.start);
      const end = new Date(rentalDates.end);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
      const totalCost = days * selectedVehicle.daily_rate;
      const ownerPayout = +(totalCost * 0.833).toFixed(2);
      const platformFee = +(totalCost * 0.133).toFixed(2);
      const gleanersShare = +(totalCost * 0.033).toFixed(2);
      const remainder = +(totalCost - ownerPayout - platformFee - gleanersShare).toFixed(2);

      const { error } = await supabase.from("lemon_lot_rentals").insert({
        vehicle_id: selectedVehicle.id,
        renter_id: user.id,
        owner_id: selectedVehicle.owner_id,
        start_date: rentalDates.start,
        end_date: rentalDates.end,
        daily_rate: selectedVehicle.daily_rate,
        total_cost: totalCost,
        platform_fee: platformFee,
        owner_payout: ownerPayout + remainder,
        gleaners_share: gleanersShare,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rental request submitted! The owner will confirm.");
      qc.invalidateQueries({ queryKey: ["my-lemon-lot-rentals"] });
      setTab("browse");
      setSelectedVehicle(null);
      setRentalDates({ start: "", end: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFeature = (f: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter((x) => x !== f) : [...prev.features, f],
    }));
  };

  if (!user) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="lemon-lot-page">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Car className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Sign in to browse or list vehicles on the Lemon Lot</p>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <LaunchConditionOverlay initiativeSlug="rally-group" initiativeName="Rally Group">
      <PortalPageLayout maxWidth="xl" xrayId="lemon-lot-page">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Car className="h-8 w-8 text-amber-600" /> Lemon Lot
              </h1>
              <p className="text-muted-foreground mt-1">Peer-to-peer vehicle sharing — Cost+20%, member-owned, member-insured</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["browse", "list", "my-vehicles"] as Tab[]).map((t) => (
                <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => { setTab(t); setSelectedVehicle(null); }}>
                  {t === "browse" ? "Browse" : t === "list" ? "List Your Vehicle" : "My Vehicles"}
                </Button>
              ))}
            </div>
          </div>

          {/* Browse */}
          {tab === "browse" && !selectedVehicle && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground animate-pulse">Loading vehicles...</div>
              ) : vehicles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Car className="mx-auto h-10 w-10 mb-3 opacity-40" />
                    <p>No vehicles listed yet. Be the first!</p>
                    <Button variant="outline" className="mt-4" onClick={() => setTab("list")}><Plus className="h-4 w-4 mr-1" /> List Your Vehicle</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((v: any) => (
                    <Card key={v.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedVehicle(v); setTab("detail"); }}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{v.year} {v.make} {v.model}</CardTitle>
                          {v.average_rating > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1"><Star className="h-3 w-3" /> {v.average_rating}</Badge>
                          )}
                        </div>
                        {v.color && <CardDescription>{v.color}</CardDescription>}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-foreground">${v.daily_rate}/day</span>
                          {v.weekly_rate && <span className="text-xs">• ${v.weekly_rate}/wk</span>}
                        </div>
                        {(v.location_city || v.location_state) && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {[v.location_city, v.location_state].filter(Boolean).join(", ")}
                          </div>
                        )}
                        {v.features?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {v.features.slice(0, 4).map((f: string) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
                            {v.features.length > 4 && <Badge variant="outline" className="text-xs">+{v.features.length - 4}</Badge>}
                          </div>
                        )}
                        {v.total_rentals > 0 && <p className="text-xs text-muted-foreground">{v.total_rentals} rental{v.total_rentals !== 1 ? "s" : ""}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vehicle Detail */}
          {tab === "detail" && selectedVehicle && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => { setTab("browse"); setSelectedVehicle(null); }}><ArrowLeft className="h-4 w-4 mr-1" /> Back to Browse</Button>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</CardTitle>
                  {selectedVehicle.color && <CardDescription>{selectedVehicle.color} {selectedVehicle.mileage ? `• ${selectedVehicle.mileage.toLocaleString()} mi` : ""}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedVehicle.description && <p className="text-sm">{selectedVehicle.description}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">${selectedVehicle.daily_rate}</p>
                      <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                    {selectedVehicle.weekly_rate && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">${selectedVehicle.weekly_rate}</p>
                        <p className="text-xs text-muted-foreground">per week</p>
                      </div>
                    )}
                    {selectedVehicle.monthly_rate && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">${selectedVehicle.monthly_rate}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                    )}
                  </div>

                  {selectedVehicle.features?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Features</p>
                      <div className="flex flex-wrap gap-1.5">{selectedVehicle.features.map((f: string) => <Badge key={f} variant="secondary">{f}</Badge>)}</div>
                    </div>
                  )}

                  {(selectedVehicle.location_city || selectedVehicle.location_state) && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {[selectedVehicle.location_city, selectedVehicle.location_state, selectedVehicle.location_zip].filter(Boolean).join(", ")}
                    </div>
                  )}

                  {selectedVehicle.insurance_verified && (
                    <div className="flex items-center gap-1.5 text-sm text-green-700"><Shield className="h-4 w-4" /> Insurance verified</div>
                  )}

                  {/* Rental Request */}
                  {selectedVehicle.owner_id !== user?.id && (
                    <div className="border-t pt-4 space-y-3">
                      <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Request Rental</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                          <Input type="date" value={rentalDates.start} onChange={(e) => setRentalDates((p) => ({ ...p, start: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">End Date</label>
                          <Input type="date" value={rentalDates.end} onChange={(e) => setRentalDates((p) => ({ ...p, end: e.target.value }))} />
                        </div>
                      </div>
                      {rentalDates.start && rentalDates.end && (
                        <div className="text-sm p-3 bg-muted rounded-lg">
                          {(() => {
                            const days = Math.max(1, Math.ceil((new Date(rentalDates.end).getTime() - new Date(rentalDates.start).getTime()) / 86400000));
                            const total = days * selectedVehicle.daily_rate;
                            return <><p><strong>{days} day{days !== 1 ? "s" : ""}</strong> × ${selectedVehicle.daily_rate}/day = <strong>${total.toFixed(2)}</strong></p><p className="text-xs text-muted-foreground mt-1">Owner receives 83.3% (${(total * 0.833).toFixed(2)})</p></>;
                          })()}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                        <Shield className="h-4 w-4 shrink-0 text-blue-600" />
                        For your safety, photos and location are recorded at trip start and end.
                      </div>
                      <Button className="w-full" onClick={() => rentalMutation.mutate()} disabled={rentalMutation.isPending || !rentalDates.start || !rentalDates.end}>
                        {rentalMutation.isPending ? "Submitting..." : "Request Rental"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* List Vehicle Form */}
          {tab === "list" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> List Your Vehicle</CardTitle>
                <CardDescription>Share your vehicle with the community. Minimum ${COST_PLUS_20_FLOOR}/day (Cost+20% floor).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><label className="text-xs font-medium">Make *</label><Input placeholder="Toyota" value={form.make} onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">Model *</label><Input placeholder="Camry" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">Year *</label><Input type="number" min={1980} max={2027} value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) || 2024 }))} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Color</label><Input placeholder="Silver" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">Daily Rate * (min ${COST_PLUS_20_FLOOR})</label><Input type="number" min={COST_PLUS_20_FLOOR} step="0.01" placeholder="35.00" value={form.daily_rate} onChange={(e) => setForm((p) => ({ ...p, daily_rate: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Weekly Rate (optional)</label><Input type="number" step="0.01" placeholder="200.00" value={form.weekly_rate} onChange={(e) => setForm((p) => ({ ...p, weekly_rate: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">Monthly Rate (optional)</label><Input type="number" step="0.01" placeholder="750.00" value={form.monthly_rate} onChange={(e) => setForm((p) => ({ ...p, monthly_rate: e.target.value }))} /></div>
                </div>
                <div><label className="text-xs font-medium">Description</label><Textarea placeholder="Tell renters about your vehicle..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} /></div>

                <div>
                  <label className="text-xs font-medium">Features</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {FEATURE_OPTIONS.map((f) => (
                      <Badge key={f} variant={form.features.includes(f) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleFeature(f)}>{f}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><label className="text-xs font-medium">City</label><Input placeholder="Boise" value={form.location_city} onChange={(e) => setForm((p) => ({ ...p, location_city: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">State</label><Input placeholder="ID" maxLength={2} value={form.location_state} onChange={(e) => setForm((p) => ({ ...p, location_state: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">ZIP</label><Input placeholder="83702" value={form.location_zip} onChange={(e) => setForm((p) => ({ ...p, location_zip: e.target.value }))} /></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Insurance Provider</label><Input placeholder="USAA" value={form.insurance_provider} onChange={(e) => setForm((p) => ({ ...p, insurance_provider: e.target.value }))} /></div>
                  <div><label className="text-xs font-medium">Policy Number</label><Input placeholder="Policy #" value={form.insurance_policy_number} onChange={(e) => setForm((p) => ({ ...p, insurance_policy_number: e.target.value }))} /></div>
                </div>

                <Button className="w-full" onClick={() => listMutation.mutate()} disabled={listMutation.isPending || !form.make || !form.model || !form.daily_rate}>
                  {listMutation.isPending ? "Listing..." : "List Vehicle on the Lemon Lot"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* My Vehicles */}
          {tab === "my-vehicles" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">My Vehicles</h2>
              {myVehicles.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">You haven't listed any vehicles yet.<Button variant="link" onClick={() => setTab("list")} className="ml-1">List one now</Button></CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {myVehicles.map((v: any) => (
                    <Card key={v.id}>
                      <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-semibold">{v.year} {v.make} {v.model}</p>
                            <p className="text-sm text-muted-foreground">${v.daily_rate}/day • {v.total_rentals} rental{v.total_rentals !== 1 ? "s" : ""} • {v.availability_status}</p>
                          </div>
                          <Badge variant={v.availability_status === "available" ? "default" : "secondary"}>{v.availability_status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {myRentals.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mt-6">Rental History</h2>
                  <div className="space-y-2">
                    {myRentals.map((r: any) => (
                      <Card key={r.id}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{r.start_date} → {r.end_date}</p>
                              <p className="text-xs text-muted-foreground">${r.total_cost} total • {r.owner_id === user?.id ? `You earned $${r.owner_payout}` : `You paid $${r.total_cost}`}</p>
                            </div>
                            <Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}

export default LemonLot;
