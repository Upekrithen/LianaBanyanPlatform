/**
 * SupplyChain — /supply-chain on .net
 * Visual flow diagram of material flow: supplier → maker → product → customer.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Factory, Package, Truck,
  ShoppingBag, Loader2, Boxes
} from "lucide-react";

interface ChainNode {
  id: string;
  product_title: string;
  product_slug: string;
  maker_name: string;
  maker_location: string;
  quantity: number;
  status: string;
  total_cost_cents: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "text-gray-400",
  accepted: "text-cyan-400",
  printing: "text-purple-400",
  quality_check: "text-amber-400",
  shipped: "text-blue-400",
  delivered: "text-green-400",
};

export default function SupplyChain() {
  const { data: chains = [], isLoading } = useQuery({
    queryKey: ["supply-chain"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_orders")
        .select("id, quantity, total_cost_cents, status, catalog_products(title, slug), makers(business_name, location_city, location_state)")
        .in("status", ["pending", "accepted", "printing", "quality_check", "shipped"])
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => {
        const product = row.catalog_products as { title: string; slug: string } | null;
        const maker = row.makers as { business_name: string; location_city: string | null; location_state: string | null } | null;
        return {
          id: row.id as string,
          product_title: product?.title || "Product",
          product_slug: product?.slug || "",
          maker_name: maker?.business_name || "TBD",
          maker_location: [maker?.location_city, maker?.location_state].filter(Boolean).join(", ") || "Network",
          quantity: row.quantity as number,
          status: row.status as string,
          total_cost_cents: row.total_cost_cents as number,
        };
      }) as ChainNode[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Boxes className="w-6 h-6" /> Supply Chain
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Material flow from design through production to delivery across the network.
        </p>
      </div>

      {/* Pipeline Legend */}
      <Card className="bg-zinc-900/40 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            <span className="flex items-center gap-1 text-zinc-400"><ShoppingBag className="w-4 h-4" />Design</span>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
            <span className="flex items-center gap-1 text-cyan-400"><Factory className="w-4 h-4" />Maker</span>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
            <span className="flex items-center gap-1 text-purple-400"><Package className="w-4 h-4" />Production</span>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
            <span className="flex items-center gap-1 text-amber-400">QC</span>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
            <span className="flex items-center gap-1 text-blue-400"><Truck className="w-4 h-4" />Shipping</span>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
            <span className="flex items-center gap-1 text-green-400">Delivered</span>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : chains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Boxes className="w-16 h-16 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground">No active supply chains.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supply chain entries appear when production orders are created through the product catalog.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chains.map((chain) => (
            <Card key={chain.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Product */}
                  <div className="flex-1 p-4 border-r border-dashed">
                    <p className="text-xs text-muted-foreground mb-1">Product</p>
                    <p className="font-medium text-sm">{chain.product_title}</p>
                    <p className="text-xs text-muted-foreground">{chain.quantity.toLocaleString()} units</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center px-2">
                    <ArrowRight className="w-4 h-4 text-zinc-600" />
                  </div>

                  {/* Maker */}
                  <div className="flex-1 p-4 border-r border-dashed">
                    <p className="text-xs text-muted-foreground mb-1">Maker</p>
                    <p className="font-medium text-sm">{chain.maker_name}</p>
                    <p className="text-xs text-muted-foreground">{chain.maker_location}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center px-2">
                    <ArrowRight className="w-4 h-4 text-zinc-600" />
                  </div>

                  {/* Status */}
                  <div className="flex-1 p-4 border-r border-dashed">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className={`font-medium text-sm capitalize ${STATUS_COLORS[chain.status] || "text-zinc-400"}`}>
                      {chain.status.replace("_", " ")}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center px-2">
                    <ArrowRight className="w-4 h-4 text-zinc-600" />
                  </div>

                  {/* Value */}
                  <div className="w-28 p-4 flex flex-col justify-center items-end">
                    <p className="text-xs text-muted-foreground mb-1">Value</p>
                    <p className="font-bold text-sm">${(chain.total_cost_cents / 100).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
