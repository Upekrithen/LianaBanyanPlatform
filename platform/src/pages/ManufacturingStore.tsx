/**
 * MANUFACTURING STORE — Let's Make Bread
 * ========================================
 * Cooperative manufacturing store. Members browse products made via
 * SLA 3D printing, desktop extruders, and molding.
 *
 * Backend: manufacturing_products, manufacturing_orders
 * Economics: Cost + 20% — creator/worker keeps 83.3%
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Factory, Package, Printer, Clock, ShoppingCart,
  Plus, Minus, Truck, CheckCircle, DollarSign,
} from "lucide-react";
import { WeNeedYouCard } from "@/components/cue-cards/WeNeedYouCard";
import { PreorderFundedBadge } from "@/components/ui/PreorderFundedBadge";
import { toast } from "sonner";
import { calculateCostPlus20 } from "@/lib/currencyService";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface ManufacturingProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  production_time_days: number;
  min_quantity: number;
  in_stock: boolean;
  customizable: boolean;
  image_url: string | null;
}

const PRODUCTION_METHODS = [
  { label: "SLA 3D Print", icon: "🖨️" },
  { label: "Desktop Extruder", icon: "🔧" },
  { label: "Molding", icon: "🏭" },
  { label: "Injection Molding", icon: "⚙️" },
];

const CATEGORY_COLORS: Record<string, string> = {
  accessories: "bg-blue-500/10 text-blue-600",
  home: "bg-green-500/10 text-green-600",
  outdoor: "bg-amber-500/10 text-amber-600",
  stationery: "bg-purple-500/10 text-purple-600",
  safety: "bg-red-500/10 text-red-600",
  games: "bg-pink-500/10 text-pink-600",
};

export default function ManufacturingStore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<ManufacturingProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["manufacturing-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("manufacturing_products")
        .select("*")
        .eq("in_stock", true)
        .order("category");
      return (data || []) as ManufacturingProduct[];
    },
  });

  const { data: myOrders } = useQuery({
    queryKey: ["my-manufacturing-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("manufacturing_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("ordered_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user || !selectedProduct) throw new Error("Not ready");

      const totalCost = selectedProduct.base_price * quantity;
      const completion = new Date();
      completion.setDate(completion.getDate() + selectedProduct.production_time_days + 2);

      const { error } = await supabase.from("manufacturing_orders").insert({
        user_id: user.id,
        order_number: `MFG-${Date.now().toString(36).toUpperCase()}`,
        subtotal: totalCost,
        total: totalCost,
        status: "pending",
        shipping_address: { address: shippingAddress, notes: notes || null, product_id: selectedProduct.id, product_name: selectedProduct.name, quantity },
        payment_status: "unpaid",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order placed! Your item will be produced cooperatively.");
      setOrderDialogOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
      setShippingAddress("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["my-manufacturing-orders"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    },
  });

  const openOrder = (product: ManufacturingProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    setOrderDialogOpen(true);
  };

  if (isLoading) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="manufacturing-store">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PortalPageLayout>
    );
  }

  const totalCost = selectedProduct ? selectedProduct.base_price * quantity : 0;
  const split = calculateCostPlus20(totalCost);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="manufacturing-store">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Factory className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manufacturing Store</h1>
          <p className="text-muted-foreground">
            Cooperative manufacturing. 95% cost reduction vs traditional. Creators/Workers keep 83.3%.
          </p>
          <div className="mt-2">
            <PreorderFundedBadge />
          </div>
        </div>
      </div>

      <WeNeedYouCard />

      {/* Production Methods */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PRODUCTION_METHODS.map(({ label, icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 text-center">
              <span className="text-2xl">{icon}</span>
              <p className="text-sm font-medium mt-1">{label}</p>
              <p className="text-xs text-muted-foreground">3/5 platform days</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge className={CATEGORY_COLORS[product.category] || "bg-muted"}>
                  {product.category}
                </Badge>
              </div>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Printer className="w-4 h-4" />
                  {product.customizable ? "Customizable" : "Standard"}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {product.production_time_days} days
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">${Number(product.base_price).toFixed(2)}</span>
                <span className="text-xs text-muted-foreground ml-1">Cost+20%</span>
              </div>
              <Button onClick={() => openOrder(product)} className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Order
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* My Orders */}
      {user && myOrders && myOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Orders
          </h2>
          <div className="space-y-3">
            {myOrders.map((order: any) => (
              <Card key={order.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.shipping_address?.product_name || order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_number} &middot; ${Number(order.total).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.status === "delivered" ? "default" : "outline"}>
                        {order.status}
                      </Badge>
                      {order.ordered_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ordered: {new Date(order.ordered_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>{selectedProduct?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-3 mt-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <label className="text-sm font-medium">Shipping Address</label>
              <Textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Full shipping address..."
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium">Production Notes (optional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Color preferences, customization..."
                className="mt-1"
              />
            </div>

            {/* Cost Breakdown */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Unit price</span>
                <span>${Number(selectedProduct?.base_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span>×{quantity}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Total</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Creator/Worker receives (83.3%)</span>
                <span>${split.creatorShare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Estimated delivery</span>
                <span>{selectedProduct?.production_time_days ? `${selectedProduct.production_time_days + 2} days` : "TBD"}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => placeOrder.mutate()}
              disabled={!shippingAddress || placeOrder.isPending}
              className="gap-2"
            >
              {placeOrder.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PortalPageLayout>
  );
}
