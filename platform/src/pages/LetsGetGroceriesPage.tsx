import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Calendar, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import { GroceryOrderForm } from "@/components/GroceryOrderForm";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function LetsGetGroceriesPage() {
  const { data: { user } } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await supabase.auth.getUser(),
  });

  const { data: myOrders, isLoading } = useQuery({
    queryKey: ["my-grocery-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Real table: orders (order_type='grocery')
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("buyer_id", user.id)
        .eq("order_type", "grocery")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // No separate grocery_schedules table - use static content for now
  const schedules: any[] = [];

  return (
    <LaunchConditionOverlay initiativeSlug="lets-get-groceries" initiativeName="Let's Get Groceries">
    <PortalPageLayout maxWidth="xl" xrayId="lets-get-groceries">
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Let's Get Groceries</h1>
          <p className="text-muted-foreground">
            Scheduled grocery delivery with service integrations and volume pricing
          </p>
        </div>
      </div>

      {/* Progressive Disclosure for How It Works */}
      <div className="space-y-3">
        <ExpandableBlock
          title="📅 Scheduled Delivery"
          subtitle="Daily, weekly, or custom schedules"
          preview="Integrated with HEB, Instacart, and more..."
          accentColor="#22c55e"
          defaultExpanded={true}
        >
          <div className="flex items-start gap-3">
            <Calendar className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Daily, weekly, or custom schedules</li>
                <li>Integrated with HEB, Instacart, etc.</li>
                <li>Bulk delivery to Nodes</li>
                <li>Curbside or home delivery options</li>
              </ul>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="border-green-500/40">HEB Curbside</Badge>
                <Badge variant="outline" className="border-green-500/40">HEB Favor</Badge>
                <Badge variant="outline" className="border-green-500/40">Instacart</Badge>
                <Badge variant="outline" className="border-green-500/40">Amazon Fresh</Badge>
              </div>
            </div>
          </div>
        </ExpandableBlock>

        <ExpandableBlock
          title="📉 Volume Pricing"
          subtitle="Save more when neighbors order together"
          preview="Orders aggregated for bulk discounts..."
          accentColor="#f59e0b"
          defaultExpanded={false}
        >
          <div className="flex items-start gap-3">
            <TrendingDown className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-3">
                <li>Orders aggregated for savings</li>
                <li>Bulk purchasing discounts</li>
                <li>Shared delivery costs</li>
                <li>Member-only pricing tiers</li>
              </ul>
              <DataVizBar
                title="Typical Savings"
                subtitle="Based on order aggregation"
                data={[
                  { label: 'Bulk discount', value: 15, color: '#22c55e', icon: '💰' },
                  { label: 'Shared delivery', value: 10, color: '#f59e0b', icon: '🚚' },
                ]}
                maxValue={30}
                showPercentages={true}
                height={20}
              />
            </div>
          </div>
        </ExpandableBlock>
      </div>

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
    </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
