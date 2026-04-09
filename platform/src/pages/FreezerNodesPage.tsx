import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Snowflake, Search, MapPin, ChefHat, Truck, Calendar, ShoppingCart, Plus, Minus,
  Package, Clock, ArrowRight, Star, Users, DollarSign, Leaf,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FreezerNodeRow {
  id: string;
  name: string;
  address: string | null;
  kitchen_type: string;
  max_batch_size: number;
  offers_pickup: boolean;
  offers_delivery: boolean;
  delivery_radius_km: number;
  prep_days: string[];
  pickup_days: string[];
  food_handler_cert: boolean;
  pioneer_number: number | null;
}

interface InventoryRow {
  id: string;
  node_id: string;
  meal_name: string;
  description: string | null;
  portions_available: number;
  price_per_portion: number;
  dietary_tags: string[];
  frozen_date: string;
  expiry_date: string;
  photo_url: string | null;
}

interface CartItem {
  inventory: InventoryRow;
  quantity: number;
}

const KITCHEN_LABELS: Record<string, string> = {
  home: "Home Kitchen",
  commercial: "Commercial Kitchen",
  church: "Church Kitchen",
  community: "Community Center",
};

const DIETARY_COLORS: Record<string, string> = {
  vegetarian: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  vegan: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "gluten-free": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  halal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  kosher: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "dairy-free": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "nut-free": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function freshnessColor(frozenDate: string): string {
  const days = Math.floor((Date.now() - new Date(frozenDate).getTime()) / 86400000);
  if (days < 30) return "text-green-600";
  if (days < 60) return "text-yellow-600";
  return "text-red-600";
}

export default function FreezerNodesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState("all");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderDialog, setOrderDialog] = useState(false);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [currency, setCurrency] = useState("credits");

  const { data: nodes } = useQuery({
    queryKey: ["freezer-nodes-browse"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freezer_nodes" as never)
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []) as FreezerNodeRow[];
    },
  });

  const { data: allInventory } = useQuery({
    queryKey: ["freezer-inventory-browse"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freezer_inventory" as never)
        .select("*")
        .eq("status", "available")
        .gt("portions_available", 0)
        .order("frozen_date", { ascending: false });
      if (error) return [];
      return (data ?? []) as InventoryRow[];
    },
  });

  const filteredNodes = (nodes ?? []).filter((n) => {
    if (search && !n.name.toLowerCase().includes(search.toLowerCase()) && !n.address?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inventoryForNode = (nodeId: string) => {
    let items = (allInventory ?? []).filter((i) => i.node_id === nodeId);
    if (dietaryFilter !== "all") {
      items = items.filter((i) => i.dietary_tags?.includes(dietaryFilter));
    }
    return items;
  };

  const totalMeals = (allInventory ?? []).reduce((s, i) => s + i.portions_available, 0);
  const totalNodes = filteredNodes.length;

  const addToCart = (item: InventoryRow) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.inventory.id === item.id);
      if (existing) {
        if (existing.quantity >= item.portions_available) return prev;
        return prev.map((c) => c.inventory.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { inventory: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.inventory.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((c) => c.inventory.id !== itemId);
      return prev.map((c) => c.inventory.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const cartTotal = cart.reduce((s, c) => s + c.quantity * c.inventory.price_per_portion, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const cartNodeId = cart.length > 0 ? cart[0].inventory.node_id : null;

  const placeOrder = async () => {
    if (!user || cart.length === 0 || !cartNodeId) return;
    const { error } = await supabase
      .from("freezer_orders" as never)
      .insert({
        customer_id: user.id,
        node_id: cartNodeId,
        items: cart.map((c) => ({
          inventory_id: c.inventory.id,
          meal_name: c.inventory.meal_name,
          quantity: c.quantity,
          price: c.inventory.price_per_portion,
        })),
        total_amount: cartTotal,
        currency,
        fulfillment_type: fulfillment,
        status: "pending",
      } as never);
    if (error) {
      toast({ title: "Order Failed", description: "Could not place order.", variant: "destructive" });
      return;
    }
    toast({ title: "Order Placed!", description: `${cartCount} meals ordered for ${cartTotal.toFixed(2)} ${currency}.` });
    setCart([]);
    setOrderDialog(false);
  };

  return (
    <PortalPageLayout
      title="Freezer Nodes"
      subtitle="Browse neighborhood freezer nodes — batch-cooked meals at Cost + 20%"
      icon={Snowflake}
      iconColor="text-cyan-500"
    >
      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 text-center">
            <Snowflake className="w-6 h-6 mx-auto mb-1 text-cyan-500" />
            <p className="text-2xl font-bold">{totalNodes}</p>
            <p className="text-xs text-muted-foreground">Active Nodes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
            <p className="text-2xl font-bold">{totalMeals}</p>
            <p className="text-xs text-muted-foreground">Meals Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Leaf className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{new Set((allInventory ?? []).flatMap((i) => i.dietary_tags ?? [])).size}</p>
            <p className="text-xs text-muted-foreground">Dietary Options</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <ShoppingCart className="w-6 h-6 mx-auto mb-1 text-indigo-500" />
            <p className="text-2xl font-bold">{cartCount}</p>
            <p className="text-xs text-muted-foreground">In Cart</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or location..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Dietary filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dietary</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="gluten-free">Gluten-Free</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="kosher">Kosher</SelectItem>
            <SelectItem value="dairy-free">Dairy-Free</SelectItem>
            <SelectItem value="nut-free">Nut-Free</SelectItem>
          </SelectContent>
        </Select>
        {user && (
          <Button onClick={() => navigate("/freezer-nodes/setup")}>
            <ChefHat className="w-4 h-4 mr-2" /> Start a Node
          </Button>
        )}
      </div>

      {/* Cart Bar */}
      {cart.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-cyan-600" />
              <span className="font-medium">{cartCount} meal{cartCount !== 1 ? "s" : ""}</span>
              <span className="text-muted-foreground">·</span>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            <Button onClick={() => setOrderDialog(true)}>
              Place Order <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Node Cards */}
      <div className="space-y-6">
        {filteredNodes.map((node) => {
          const inv = inventoryForNode(node.id);
          return (
            <Card key={node.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Snowflake className="w-5 h-5 text-cyan-500" />
                      {node.name}
                      {node.pioneer_number && node.pioneer_number <= 10 && (
                        <Badge className="bg-amber-500 text-white ml-2">Pioneer #{node.pioneer_number}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-4 flex-wrap">
                      {node.address && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{node.address}</span>
                      )}
                      <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" />{KITCHEN_LABELS[node.kitchen_type] ?? node.kitchen_type}</span>
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" />{inv.length} meals available</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {node.offers_pickup && <Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />Pickup</Badge>}
                    {node.offers_delivery && <Badge variant="outline"><Truck className="w-3 h-3 mr-1" />Delivery</Badge>}
                  </div>
                </div>
                {(node.pickup_days?.length > 0 || node.prep_days?.length > 0) && (
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {node.prep_days?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Prep: {node.prep_days.map((d) => d.slice(0, 3)).join(", ")}
                      </span>
                    )}
                    {node.pickup_days?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pickup: {node.pickup_days.map((d) => d.slice(0, 3)).join(", ")}
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              {selectedNode === node.id && (
                <CardContent>
                  {inv.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No meals currently available at this node.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inv.map((item) => {
                        const inCart = cart.find((c) => c.inventory.id === item.id);
                        const canAdd = !cartNodeId || cartNodeId === node.id;
                        return (
                          <Card key={item.id} className="border">
                            <CardContent className="pt-4 space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium">{item.meal_name}</h4>
                                <span className="font-bold text-lg">${item.price_per_portion.toFixed(2)}</span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {(item.dietary_tags ?? []).map((tag) => (
                                  <Badge key={tag} variant="secondary" className={`text-[10px] ${DIETARY_COLORS[tag] ?? ""}`}>
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className={freshnessColor(item.frozen_date)}>
                                  Frozen {new Date(item.frozen_date).toLocaleDateString()}
                                </span>
                                <span>{item.portions_available} left</span>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                {inCart ? (
                                  <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="font-medium w-6 text-center">{inCart.quantity}</span>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => addToCart(item)} disabled={inCart.quantity >= item.portions_available}>
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button size="sm" className="w-full" onClick={() => addToCart(item)} disabled={!canAdd}>
                                    <ShoppingCart className="w-3 h-3 mr-2" />
                                    {canAdd ? "Add to Cart" : "Cart has items from another node"}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}

        {filteredNodes.length === 0 && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Snowflake className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">No Freezer Nodes Yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a Freezer Node in your neighborhood!</p>
              {user && (
                <Button onClick={() => navigate("/freezer-nodes/setup")}>
                  <ChefHat className="w-4 h-4 mr-2" /> Start a Freezer Node
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* How It Works */}
      <Card className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-200 dark:border-cyan-800">
        <CardHeader>
          <CardTitle>How Freezer Nodes Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <ChefHat className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
              <h4 className="font-medium">Batch Cook</h4>
              <p className="text-sm text-muted-foreground">Operators prepare 20+ servings in one session</p>
            </div>
            <div>
              <Snowflake className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
              <h4 className="font-medium">Freeze & Store</h4>
              <p className="text-sm text-muted-foreground">Portioned, labeled, stored for up to 90 days</p>
            </div>
            <div>
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
              <h4 className="font-medium">Neighbors Order</h4>
              <p className="text-sm text-muted-foreground">Browse meals, pick up or request delivery</p>
            </div>
            <div>
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
              <h4 className="font-medium">Keep 83.3%</h4>
              <p className="text-sm text-muted-foreground">Cooperative pricing — operators keep the lion's share</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Dialog */}
      <Dialog open={orderDialog} onOpenChange={setOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Order</DialogTitle>
            <DialogDescription>
              {cartCount} meal{cartCount !== 1 ? "s" : ""} — ${cartTotal.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {cart.map((c) => (
                <div key={c.inventory.id} className="flex justify-between text-sm">
                  <span>{c.quantity}× {c.inventory.meal_name}</span>
                  <span className="font-medium">${(c.quantity * c.inventory.price_per_portion).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <Label>Fulfillment</Label>
              <Select value={fulfillment} onValueChange={(v) => setFulfillment(v as "pickup" | "delivery")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credits">Credits</SelectItem>
                  <SelectItem value="marks">Marks</SelectItem>
                  <SelectItem value="joules">Joules</SelectItem>
                  <SelectItem value="dollars">Dollars</SelectItem>
                </SelectContent>
              </Select>
              {currency === "dollars" && (
                <p className="text-xs text-muted-foreground mt-1">Stripe processing fees apply for dollar payments.</p>
              )}
              {currency !== "dollars" && (
                <p className="text-xs text-muted-foreground mt-1">Internal currency — zero processing fees.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialog(false)}>Cancel</Button>
            <Button onClick={placeOrder}>Confirm Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
