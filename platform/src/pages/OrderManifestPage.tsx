import React, { useState, useMemo } from "react";
import {
  ClipboardList, Printer, CheckCircle2, AlertTriangle,
  Calendar, Package, DollarSign, Clock, ChefHat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useRestaurantOrders, useDailyManifest, useConfirmOrderReady, type ScheduledOrder } from "@/hooks/useScheduledOrders";

function tomorrow(): string {
  return new Date(Date.now() + 86400000).toISOString().split("T")[0];
}

function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  preparing: "bg-amber-100 text-amber-800",
  ready: "bg-green-100 text-green-800",
  picked_up: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderManifestPage() {
  const [date, setDate] = useState(tomorrow());

  // In a real scenario, restaurantId comes from the logged-in captain's restaurant
  // For now, we use a placeholder that will resolve via RLS
  const [restaurantId] = useState<string | undefined>(undefined);

  const { data: manifest } = useDailyManifest(restaurantId, date);
  const { data: orders } = useRestaurantOrders(restaurantId, date);
  const confirmReady = useConfirmOrderReady();

  const itemTotals = useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, number>();
    for (const order of orders) {
      if (order.status === "cancelled") continue;
      for (const item of order.items) {
        map.set(item.name, (map.get(item.name) ?? 0) + item.quantity);
      }
    }
    return Array.from(map.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [orders]);

  const pickupWindows = useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, number>();
    for (const order of orders) {
      if (order.status === "cancelled") continue;
      const window = order.pickup_window ?? "Unscheduled";
      map.set(window, (map.get(window) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([window, count]) => ({ window, count }))
      .sort((a, b) => a.window.localeCompare(b.window));
  }, [orders]);

  const activeOrders = (orders ?? []).filter((o) => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((s, o) => s + (o.total_lb ?? 0), 0);
  const advancePaid = activeOrders.reduce((s, o) => s + o.advance_payment, 0);

  const handlePrint = () => window.print();

  const handleConfirmAll = async () => {
    if (!orders) return;
    for (const order of orders.filter((o) => o.status === "scheduled")) {
      await confirmReady.mutateAsync({ orderId: order.id, status: "confirmed" });
    }
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="order-manifest-page">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-blue-600" />
            Order Manifest
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your scheduled pre-orders from LB members
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Package className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{activeOrders.length}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <DollarSign className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <DollarSign className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">${advancePaid.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Advance Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <ChefHat className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{itemTotals.length}</p>
            <p className="text-xs text-muted-foreground">Unique Items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items to Prep */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {formatDate(date)} — Items to Prep
            </CardTitle>
          </CardHeader>
          <CardContent>
            {itemTotals.length > 0 ? (
              <div className="space-y-2">
                {itemTotals.map(({ name, qty }) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{name}</span>
                    <Badge variant="secondary" className="text-sm font-mono">{qty}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                <p>No orders for this date.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pickup Windows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Pickup Windows
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pickupWindows.length > 0 ? (
              <div className="space-y-3">
                {pickupWindows.map(({ window: w, count }) => (
                  <div key={w} className="flex items-center justify-between">
                    <span className="text-sm">{w}</span>
                    <Badge>{count} order{count > 1 ? "s" : ""}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No pickup windows set.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Individual Orders */}
      {activeOrders.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Individual Orders</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleConfirmAll} disabled={confirmReady.isPending}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm All
              </Button>
              <Button variant="outline" size="sm">
                <AlertTriangle className="w-4 h-4 mr-1" /> Flag Issue
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
                      {order.pickup_window && (
                        <span className="text-sm text-muted-foreground">{order.pickup_window}</span>
                      )}
                      <span className="text-sm text-muted-foreground">· {order.servings} serving{order.servings > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {order.items.map((item, i) => (
                        <span key={i}>{item.name} x{item.quantity}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">${(order.total_lb ?? 0).toFixed(2)}</p>
                    {order.advance_payment > 0 && (
                      <p className="text-xs text-muted-foreground">${order.advance_payment.toFixed(2)} advance</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PortalPageLayout>
  );
}
