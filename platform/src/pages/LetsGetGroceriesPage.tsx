import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Calendar, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GroceryOrderForm } from "@/components/GroceryOrderForm";

export default function LetsGetGroceriesPage() {
  const { data: { user } } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await supabase.auth.getUser(),
  });

  const { data: myOrders, isLoading } = useQuery({
    queryKey: ["my-grocery-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("grocery_orders")
        .select("*")
        .eq("user_id", user.id)
        .order("delivery_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: schedules } = useQuery({
    queryKey: ["grocery-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grocery_schedules")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Let's Get Groceries</h1>
          <p className="text-muted-foreground">
            Scheduled grocery delivery with service integrations and volume pricing
          </p>
        </div>
      </div>

      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/10">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled Delivery
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Daily, weekly, or custom schedules</li>
                <li>Integrated with HEB, Instacart, etc.</li>
                <li>Bulk delivery to Nodes</li>
                <li>Curbside or home delivery options</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Volume Pricing
              </h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Orders aggregated for savings</li>
                <li>Bulk purchasing discounts</li>
                <li>Shared delivery costs</li>
                <li>Member-only pricing tiers</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Service Integration</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">HEB Curbside</Badge>
                <Badge variant="outline">HEB Favor</Badge>
                <Badge variant="outline">Instacart</Badge>
                <Badge variant="outline">Amazon Fresh</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Place Order</TabsTrigger>
          <TabsTrigger value="my-orders">My Orders ({myOrders?.length || 0})</TabsTrigger>
          <TabsTrigger value="schedules">Delivery Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="mt-6">
          <GroceryOrderForm />
        </TabsContent>

        <TabsContent value="my-orders" className="mt-6">
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading your orders...</p>
            ) : myOrders && myOrders.length > 0 ? (
              myOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Order for {new Date(order.delivery_date).toLocaleDateString()}</CardTitle>
                      <Badge>{order.status}</Badge>
                    </div>
                    <CardDescription>
                      {order.delivery_preference === "node_pickup" ? "Node Pickup" : "Home Delivery"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Items:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                          <li key={idx}>
                            {item.name} - Qty: {item.quantity} @ ${item.unit_price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">${order.total_cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No orders yet. Place your first order!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {schedules?.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {schedule.integration_service?.replace(/_/g, " ").toUpperCase()}
                  </CardTitle>
                  <CardDescription>
                    {schedule.delivery_frequency} delivery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Delivery Days:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.delivery_days?.map((day: string) => (
                        <Badge key={day} variant="secondary">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
