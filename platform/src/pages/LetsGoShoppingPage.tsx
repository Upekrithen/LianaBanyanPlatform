import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, TrendingDown, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import { ShoppingOrderCard } from "@/components/ShoppingOrderCard";
import { CreateShoppingOrderDialog } from "@/components/CreateShoppingOrderDialog";

export default function LetsGoShoppingPage() {
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["shopping-orders"],
    queryFn: async () => {
      // Real table: orders (order_type='shopping')
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_type", "shopping")
        .in("status", ["pending", "confirmed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const holidays = orders?.filter(o => o.category === "holiday") || [];
  const events = orders?.filter(o => o.category === "event") || [];
  const seasonal = orders?.filter(o => o.category === "seasonal") || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading shopping orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Let's Go Shopping</h1>
            <p className="text-muted-foreground">
              Join bulk orders for holidays and events to save with volume discounts
            </p>
          </div>
        </div>
        <CreateShoppingOrderDialog onCreated={refetch} />
      </div>

      {/* Progressive Disclosure for How It Works */}
      <div className="space-y-3">
        <ExpandableBlock
          title="📉 Volume Savings"
          subtitle="More participants = bigger discounts"
          preview="10-20% off through bulk ordering..."
          accentColor="#3b82f6"
          defaultExpanded={true}
        >
          <div className="flex items-start gap-3">
            <TrendingDown className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-3">
                <li>Orders aggregate purchases for holidays and events</li>
                <li>More participants = bigger discounts</li>
                <li>Automatic tiered discounts (10-20% off)</li>
                <li>Minimum quantity thresholds for each order</li>
              </ul>
              <DataVizBar
                title="Discount Tiers"
                subtitle="Based on participant count"
                data={[
                  { label: '5+ people', value: 10, color: '#3b82f6', icon: '👥' },
                  { label: '15+ people', value: 15, color: '#8b5cf6', icon: '👥' },
                  { label: '30+ people', value: 20, color: '#22c55e', icon: '👥' },
                ]}
                maxValue={25}
                showPercentages={true}
                height={20}
              />
            </div>
          </div>
        </ExpandableBlock>

        <ExpandableBlock
          title="🚚 Delivery & Pickup"
          subtitle="Bulk delivery to LB Nodes"
          preview="Choose Node pickup or home delivery..."
          accentColor="#8b5cf6"
          defaultExpanded={false}
        >
          <div className="flex items-start gap-3">
            <Truck className="h-6 w-6 text-purple-500 flex-shrink-0 mt-1" />
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Bulk delivery to LB Nodes</li>
              <li>Choose Node pickup or home delivery</li>
              <li>Organized by event/holiday timing</li>
              <li>Track order progress in real-time</li>
            </ul>
          </div>
        </ExpandableBlock>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Orders ({orders?.length || 0})</TabsTrigger>
          <TabsTrigger value="holiday">Holidays ({holidays.length})</TabsTrigger>
          <TabsTrigger value="event">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal ({seasonal.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders?.map((order) => (
              <ShoppingOrderCard key={order.id} order={order} onJoin={refetch} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="holiday" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {holidays.map((order) => (
              <ShoppingOrderCard key={order.id} order={order} onJoin={refetch} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="event" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((order) => (
              <ShoppingOrderCard key={order.id} order={order} onJoin={refetch} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seasonal.map((order) => (
              <ShoppingOrderCard key={order.id} order={order} onJoin={refetch} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {(!orders || orders.length === 0) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No shopping orders available yet. Create one to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
