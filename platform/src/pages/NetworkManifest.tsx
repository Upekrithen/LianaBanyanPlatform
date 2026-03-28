import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface ManifestOrder {
  id: string;
  quantity: number;
  total_cost_cents: number;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  catalog_products: { title: string; slug: string } | null;
  makers: { business_name: string; location_city: string | null; location_state: string | null } | null;
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  shipped: { label: 'In Transit', color: 'bg-blue-500' },
  delivered: { label: 'Delivered', color: 'bg-green-600' },
  quality_check: { label: 'QC', color: 'bg-amber-500' },
  printing: { label: 'Producing', color: 'bg-purple-500' },
  accepted: { label: 'Accepted', color: 'bg-cyan-500' },
  pending: { label: 'Pending', color: 'bg-gray-500' },
};

export default function NetworkManifest() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['network-manifests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_orders')
        .select('*, catalog_products(title, slug), makers(business_name, location_city, location_state)')
        .in('status', ['shipped', 'delivered', 'quality_check', 'printing', 'accepted'])
        .order('updated_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as ManifestOrder[];
    },
  });

  const shipped = orders.filter(o => o.status === 'shipped');
  const delivered = orders.filter(o => o.status === 'delivered');
  const inProduction = orders.filter(o => ['printing', 'quality_check', 'accepted'].includes(o.status));
  const totalUnits = orders.reduce((s, o) => s + o.quantity, 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-6 h-6" />Shipping Manifests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track production orders from maker to destination.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orders.length}</p><p className="text-xs text-muted-foreground">Total Orders</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{totalUnits}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-500">{shipped.length}</p><p className="text-xs text-muted-foreground">In Transit</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-500">{delivered.length}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="w-16 h-16 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground">No active production orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* In Transit */}
          {shipped.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4 text-blue-500" />In Transit ({shipped.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {shipped.map(o => <ManifestRow key={o.id} order={o} />)}
              </CardContent>
            </Card>
          )}

          {/* In Production */}
          {inProduction.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4 text-purple-500" />In Production ({inProduction.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {inProduction.map(o => <ManifestRow key={o.id} order={o} />)}
              </CardContent>
            </Card>
          )}

          {/* Delivered */}
          {delivered.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Delivered ({delivered.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {delivered.map(o => <ManifestRow key={o.id} order={o} />)}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ManifestRow({ order }: { order: ManifestOrder }) {
  const cfg = STATUS_BADGES[order.status] || { label: order.status, color: 'bg-gray-500' };
  const makerLocation = [order.makers?.location_city, order.makers?.location_state].filter(Boolean).join(', ');

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{order.catalog_products?.title || 'Product'}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
          <span>×{order.quantity} units</span>
          <span>Maker: {order.makers?.business_name || 'Unknown'}{makerLocation ? ` (${makerLocation})` : ''}</span>
          {order.due_date && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Due {new Date(order.due_date).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-medium">${(order.total_cost_cents / 100).toLocaleString()}</span>
        <Badge className={`${cfg.color} text-white text-[10px]`}>{cfg.label}</Badge>
      </div>
    </div>
  );
}
