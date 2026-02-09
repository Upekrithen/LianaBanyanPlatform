import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingOrderCard } from "@/components/ShoppingOrderCard";
import { CreateShoppingOrderDialog } from "@/components/CreateShoppingOrderDialog";

export default function LetsGoShoppingPage() {
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["shopping-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shopping_orders")
        .select("*")
        .in("status", ["open", "threshold_met"])
        .order("closes_at", { ascending: true });

      if (error) throw error;
      return data;
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

      <Card className="border-primary/20 bg-gradient-to-br from-blue-500/5 to-purple-500/10">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Volume Savings</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Orders aggregate purchases for holidays and events</li>
                <li>More participants = bigger discounts</li>
                <li>Automatic tiered discounts (10-20% off)</li>
                <li>Minimum quantity thresholds for each order</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Delivery & Pickup</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Bulk delivery to LB Nodes</li>
                <li>Choose Node pickup or home delivery</li>
                <li>Organized by event/holiday timing</li>
                <li>Track order progress in real-time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
