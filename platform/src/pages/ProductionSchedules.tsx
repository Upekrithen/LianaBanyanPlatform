/**
 * ProductionSchedules — /production-schedules on .net
 * Real page showing all active production orders grouped by maker with status tracking.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Factory, Clock, CheckCircle2,
  Loader2, Package, AlertCircle
} from "lucide-react";

interface ProdOrder {
  id: string;
  quantity: number;
  unit_cost_cents: number;
  total_cost_cents: number;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  catalog_products: { title: string; slug: string } | null;
  makers: { business_name: string; slug: string; location_city: string | null; location_state: string | null } | null;
}

const STATUS_ORDER = ["pending", "accepted", "printing", "quality_check", "shipped", "delivered"];
const STATUS_LABELS: Record<string, { label: string; color: string; pct: number }> = {
  pending: { label: "Pending", color: "bg-gray-500", pct: 10 },
  accepted: { label: "Accepted", color: "bg-cyan-500", pct: 25 },
  printing: { label: "Producing", color: "bg-purple-500", pct: 50 },
  quality_check: { label: "QC", color: "bg-amber-500", pct: 75 },
  shipped: { label: "Shipped", color: "bg-blue-500", pct: 90 },
  delivered: { label: "Delivered", color: "bg-green-600", pct: 100 },
};

export default function ProductionSchedules() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["production-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_orders")
        .select("*, catalog_products(title, slug), makers(business_name, slug, location_city, location_state)")
        .not("status", "eq", "delivered")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as ProdOrder[];
    },
  });

  const byMaker = orders.reduce<Record<string, ProdOrder[]>>((acc, o) => {
    const key = o.makers?.business_name || "Unassigned";
    (acc[key] = acc[key] || []).push(o);
    return acc;
  }, {});

  const overdue = orders.filter(
    (o) => o.due_date && new Date(o.due_date) < new Date() && !["shipped", "delivered"].includes(o.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" /> Production Schedules
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Active production orders across the network, grouped by maker.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orders.length}</p><p className="text-xs text-muted-foreground">Active Orders</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{Object.keys(byMaker).length}</p><p className="text-xs text-muted-foreground">Active Makers</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orders.reduce((s, o) => s + o.quantity, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-500">{overdue.length}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Factory className="w-16 h-16 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground">No active production orders.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Orders appear here once a creator hires a maker through the product catalog.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(byMaker).map(([makerName, makerOrders]) => (
            <Card key={makerName}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Factory className="w-4 h-4 text-violet-400" />
                  {makerName}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {makerOrders.length} order{makerOrders.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {makerOrders.map((o) => {
                  const cfg = STATUS_LABELS[o.status] || { label: o.status, color: "bg-gray-500", pct: 0 };
                  const isOverdue = o.due_date && new Date(o.due_date) < new Date() && !["shipped", "delivered"].includes(o.status);
                  return (
                    <div key={o.id} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate flex items-center gap-2">
                            {o.catalog_products?.title || "Product"}
                            {isOverdue && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <span>{o.quantity.toLocaleString()} units</span>
                            <span>${(o.total_cost_cents / 100).toLocaleString()}</span>
                            {o.due_date && (
                              <span className={`flex items-center gap-1 ${isOverdue ? "text-amber-500 font-medium" : ""}`}>
                                <Clock className="w-3 h-3" />
                                Due {new Date(o.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={`${cfg.color} text-white text-[10px]`}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={cfg.pct} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{cfg.pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
