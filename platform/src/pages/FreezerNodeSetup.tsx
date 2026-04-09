import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Snowflake, MapPin, ChefHat, Truck, Calendar, ShieldCheck, ArrowLeft,
  ShoppingCart, ChevronDown, Anchor, TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PioneerBadge } from "@/components/PioneerBadge";
import { usePioneerAssignment } from "@/hooks/usePioneerAssignment";
import { useCooperativePurchasing } from "@/hooks/useCooperativePurchasing";
import { DEFAULT_VOLUME_TIERS, getDiscountTier } from "@/lib/bulkPricing";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

interface FreezerNode {
  id: string;
  name: string;
  address: string | null;
  kitchen_type: string;
  max_batch_size: number;
  delivery_radius_km: number;
  offers_pickup: boolean;
  offers_delivery: boolean;
  prep_days: string[];
  pickup_days: string[];
  food_handler_cert: boolean;
  active: boolean;
  pioneer_number: number | null;
}

function SourceIngredientsPanel() {
  const { activeGroupBuys, joinGroupBuy } = useCooperativePurchasing({ status: ["gathering", "threshold_met"] });
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);

  const foodBuys = activeGroupBuys.filter(
    (gb) => gb.status === "gathering" || gb.status === "threshold_met"
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-500" />
                Source Ingredients
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
            <CardDescription>
              Join cooperative purchases from Pearl Diver tips to source ingredients at bulk pricing
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3">
            {foodBuys.length > 0 ? (
              foodBuys.map((gb) => {
                const tier = gb.unit_price_cooperative
                  ? getDiscountTier(gb.current_quantity, DEFAULT_VOLUME_TIERS)
                  : null;
                const alreadyJoined = (gb.participants ?? []).some(
                  (p) => p.member_id === user?.id
                );
                return (
                  <div
                    key={gb.id}
                    className="rounded-lg border p-3 space-y-2 hover:border-cyan-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{gb.title}</p>
                        {gb.store_name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {gb.store_name}
                            {gb.store_location ? ` — ${gb.store_location}` : ""}
                          </p>
                        )}
                      </div>
                      <Badge variant={gb.status === "threshold_met" ? "default" : "secondary"} className="text-[10px] shrink-0">
                        {gb.current_quantity}/{gb.threshold_quantity} joined
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      {gb.unit_price_retail != null && (
                        <span className="text-muted-foreground line-through">
                          ${gb.unit_price_retail.toFixed(2)} retail
                        </span>
                      )}
                      {gb.unit_price_cooperative != null && (
                        <span className="font-medium text-emerald-600">
                          ${gb.unit_price_cooperative.toFixed(2)} co-op
                        </span>
                      )}
                      {gb.savings_percentage != null && gb.savings_percentage > 0 && (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <TrendingDown className="w-3 h-3" />
                          Save {gb.savings_percentage}%
                        </span>
                      )}
                      {tier && (
                        <span className="text-blue-600">
                          +{tier.discount_percent}% bulk tier
                        </span>
                      )}
                    </div>
                    {alreadyJoined ? (
                      <Badge variant="outline" className="text-xs">
                        <ShoppingCart className="w-3 h-3 mr-1" /> Already joined
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          if (!user) { toast({ title: "Sign in to join", variant: "destructive" }); return; }
                          joinGroupBuy.mutate(
                            { purchaseId: gb.id, quantity: 1 },
                            {
                              onSuccess: () => toast({ title: "Joined Group Buy", description: "You're now part of this cooperative purchase." }),
                              onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
                            }
                          );
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" /> Join Group Buy
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <Anchor className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No active cooperative purchases yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  When Pearl Divers find deals with 5+ upvotes, group buys appear here for ingredient sourcing.
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function FreezerNodeSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { assignPioneer, isNewPioneer } = usePioneerAssignment("freezer_node");

  const { data: existing, isLoading } = useQuery({
    queryKey: ["freezer-node-mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freezer_nodes" as never)
        .select("*")
        .eq("operator_id", user!.id)
        .maybeSingle();
      if (error) return null;
      return data as FreezerNode | null;
    },
  });

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [kitchenType, setKitchenType] = useState("home");
  const [maxBatch, setMaxBatch] = useState("20");
  const [deliveryRadius, setDeliveryRadius] = useState("10");
  const [offersPickup, setOffersPickup] = useState(true);
  const [offersDelivery, setOffersDelivery] = useState(true);
  const [prepDays, setPrepDays] = useState<string[]>([]);
  const [pickupDays, setPickupDays] = useState<string[]>([]);
  const [foodCert, setFoodCert] = useState(false);

  const populated = existing && !name;
  if (populated && existing) {
    setTimeout(() => {
      setName(existing.name);
      setAddress(existing.address ?? "");
      setKitchenType(existing.kitchen_type);
      setMaxBatch(String(existing.max_batch_size));
      setDeliveryRadius(String(existing.delivery_radius_km));
      setOffersPickup(existing.offers_pickup);
      setOffersDelivery(existing.offers_delivery);
      setPrepDays(existing.prep_days ?? []);
      setPickupDays(existing.pickup_days ?? []);
      setFoodCert(existing.food_handler_cert);
    }, 0);
  }

  const toggleDay = (day: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(day) ? list.filter((d) => d !== day) : [...list, day]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        operator_id: user!.id,
        name,
        address: address || null,
        kitchen_type: kitchenType,
        max_batch_size: parseInt(maxBatch),
        delivery_radius_km: parseInt(deliveryRadius),
        offers_pickup: offersPickup,
        offers_delivery: offersDelivery,
        prep_days: prepDays,
        pickup_days: pickupDays,
        food_handler_cert: foodCert,
        active: true,
      };
      if (existing) {
        const { error } = await supabase
          .from("freezer_nodes" as never)
          .update(payload as never)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("freezer_nodes" as never)
          .insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["freezer-node-mine"] });
      toast({ title: existing ? "Node Updated" : "Freezer Node Registered!", description: "Your node is now active." });
      if (isNewPioneer) await assignPioneer();
      navigate("/freezer-nodes");
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save. Try again.", variant: "destructive" });
    },
  });

  if (!user) return null;

  return (
    <PortalPageLayout
      title={existing ? "Edit Freezer Node" : "Register Freezer Node"}
      subtitle="Batch-cook meals, freeze in portions, feed the neighborhood. Keep 83.3%."
      icon={Snowflake}
      iconColor="text-cyan-500"
    >
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/freezer-nodes")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Freezer Nodes
      </Button>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-cyan-500" />
                  Node Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Node Name</Label>
                  <Input id="name" placeholder={"e.g. Maria's Kitchen"} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="address">Address (for pickup / delivery radius)</Label>
                  <Input id="address" placeholder="123 Main St, City, State" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kitchen Type</Label>
                    <Select value={kitchenType} onValueChange={setKitchenType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Kitchen</SelectItem>
                        <SelectItem value="commercial">Rented Commercial</SelectItem>
                        <SelectItem value="church">Church Kitchen</SelectItem>
                        <SelectItem value="community">Community Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Max Meals per Batch</Label>
                    <Select value={maxBatch} onValueChange={setMaxBatch}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-500" />
                  Fulfillment Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Offers Pickup</Label>
                  <Switch checked={offersPickup} onCheckedChange={setOffersPickup} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Offers Delivery</Label>
                  <Switch checked={offersDelivery} onCheckedChange={setOffersDelivery} />
                </div>
                {offersDelivery && (
                  <div>
                    <Label>Delivery Radius (km)</Label>
                    <Input type="number" value={deliveryRadius} onChange={(e) => setDeliveryRadius(e.target.value)} min={1} max={50} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Batch Prep Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((d) => (
                      <Badge
                        key={`prep-${d}`}
                        variant={prepDays.includes(d) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleDay(d, prepDays, setPrepDays)}
                      >
                        {d.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Pickup / Delivery Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((d) => (
                      <Badge
                        key={`pickup-${d}`}
                        variant={pickupDays.includes(d) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleDay(d, pickupDays, setPickupDays)}
                      >
                        {d.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-500" />
                  Food Safety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Food Handler Certification</Label>
                    <p className="text-sm text-muted-foreground">I attest I have a current food handler certification or equivalent.</p>
                  </div>
                  <Switch checked={foodCert} onCheckedChange={setFoodCert} />
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              disabled={!name.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : existing ? "Update Node" : "Register Freezer Node"}
            </Button>

            {/* Source Ingredients Panel */}
            <SourceIngredientsPanel />
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p><strong>1.</strong> Register your node (this page)</p>
                <p><strong>2.</strong> Batch-cook meals and add them to your inventory in Helm</p>
                <p><strong>3.</strong> Neighbors browse and order frozen meals from you</p>
                <p><strong>4.</strong> You keep <strong>83.3%</strong> of every sale</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Economics Example</CardTitle>
                <CardDescription>20-serving batch</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Ingredient cost: ~$40 (bulk pricing via Let's Get Groceries)</p>
                <p>Price per portion: $8 (Cost + 20%)</p>
                <p>Keep 4 for family, sell 16 = <strong>$128</strong></p>
                <p>Your share (83.3%): <strong>$106.62</strong></p>
                <p className="text-muted-foreground">2 batches/week × 4 weeks = may earn ~$853/month</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200">
              <CardContent className="pt-6 text-center">
                <PioneerBadge role="freezer_node" className="text-lg px-4 py-1" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PortalPageLayout>
  );
}
