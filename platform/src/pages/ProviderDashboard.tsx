import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Store, Package, DollarSign, Clock, CheckCircle, Truck, AlertCircle, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderRow {
  id: string;
  storefront_id: string;
  customer_email: string;
  customer_name: string | null;
  items: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  delivery_date: string;
  delivery_status: string;
  stripe_payment_status: string;
  stamp_photo_url: string | null;
  created_at: string;
}

interface StorefrontRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  business_location: string | null;
  is_open: boolean;
}

interface ParsedItem {
  item_name: string;
  qty: number;
  price: number;
}

const STATUS_FLOW = ['pending', 'aggregated', 'preparing', 'out_for_delivery', 'delivered'] as const;
type DeliveryStatus = typeof STATUS_FLOW[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  aggregated: { label: 'Aggregated', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Package },
  preparing: { label: 'Preparing', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Store },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
};

function formatDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [storefronts, setStorefronts] = useState<StorefrontRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedStorefront, setSelectedStorefront] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: sfs } = await supabase
        .from('storefronts' as never)
        .select('id, name, slug, category, business_location, is_open')
        .eq('user_id', user.id) as { data: StorefrontRow[] | null };

      const myStorefronts = sfs || [];
      setStorefronts(myStorefronts);

      if (myStorefronts.length === 0) {
        setLoading(false);
        return;
      }

      const sfIds = myStorefronts.map(s => s.id);
      const { data: ords } = await supabase
        .from('menu_orders' as never)
        .select('id, storefront_id, customer_email, customer_name, items, delivery_fee, subtotal, total, delivery_date, delivery_status, stripe_payment_status, stamp_photo_url, created_at')
        .in('storefront_id', sfIds)
        .order('delivery_date', { ascending: false } as never) as { data: OrderRow[] | null };

      setOrders(ords || []);
      setLoading(false);
    })();
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filteredOrders = useMemo(() => {
    if (selectedStorefront === 'all') return orders;
    return orders.filter(o => o.storefront_id === selectedStorefront);
  }, [orders, selectedStorefront]);

  const paidOrders = useMemo(() => filteredOrders.filter(o => o.stripe_payment_status === 'paid'), [filteredOrders]);
  const todayOrders = useMemo(() => paidOrders.filter(o => o.delivery_date === today), [paidOrders, today]);
  const tomorrowOrders = useMemo(() => paidOrders.filter(o => o.delivery_date === tomorrow), [paidOrders, tomorrow]);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const thisWeekOrders = useMemo(() =>
    paidOrders.filter(o => o.delivery_date >= weekStartStr && o.delivery_date <= today),
    [paidOrders, weekStartStr, today]
  );
  const weekRevenue = useMemo(() => thisWeekOrders.reduce((sum, o) => sum + o.total, 0), [thisWeekOrders]);

  const consolidateItems = (orderList: OrderRow[]): Map<string, { name: string; qty: number }> => {
    const map = new Map<string, { name: string; qty: number }>();
    for (const order of orderList) {
      const parsed: ParsedItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      for (const item of parsed) {
        const key = item.item_name.toLowerCase();
        const existing = map.get(key);
        if (existing) existing.qty += item.qty;
        else map.set(key, { name: item.item_name, qty: item.qty });
      }
    }
    return map;
  };

  const advanceStatus = async (orderId: string, current: string) => {
    const idx = STATUS_FLOW.indexOf(current as DeliveryStatus);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];

    const { error } = await supabase
      .from('menu_orders' as never)
      .update({ delivery_status: next } as never)
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, delivery_status: next } : o));
    toast.success(`Order marked as ${STATUS_CONFIG[next]?.label || next}`);
  };

  const triggerAggregation = async () => {
    toast.info('Running order aggregation...');
    const { data, error } = await supabase.functions.invoke('aggregate-orders', {
      body: { delivery_date: tomorrow },
    });
    if (error) {
      toast.error('Aggregation failed');
    } else {
      toast.success(`Aggregated ${data?.total_orders || 0} orders across ${data?.storefronts_processed || 0} storefronts`);
      // Refresh orders
      if (user && storefronts.length > 0) {
        const sfIds = storefronts.map(s => s.id);
        const { data: ords } = await supabase
          .from('menu_orders' as never)
          .select('id, storefront_id, customer_email, customer_name, items, delivery_fee, subtotal, total, delivery_date, delivery_status, stripe_payment_status, stamp_photo_url, created_at')
          .in('storefront_id', sfIds)
          .order('delivery_date', { ascending: false } as never) as { data: OrderRow[] | null };
        setOrders(ords || []);
      }
    }
  };

  if (loading) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="provider-dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-slate-400">Loading provider dashboard...</div>
        </div>
      </PortalPageLayout>
    );
  }

  if (storefronts.length === 0) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="provider-dashboard">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="text-center py-16">
          <Store className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h1 className="text-2xl font-bold mb-2">No Storefronts Yet</h1>
          <p className="text-slate-400 mb-6">Create a storefront to start receiving orders.</p>
          <Link to="/tools/storefront-builder">
            <Button className="bg-amber-600 hover:bg-amber-700">Build a Storefront</Button>
          </Link>
        </div>
      </PortalPageLayout>
    );
  }

  const tomorrowConsolidated = consolidateItems(tomorrowOrders.filter(o => o.delivery_status !== 'delivered'));

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="provider-dashboard">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-xray-id="provider-dash-title">Provider Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your storefront orders</p>
        </div>
        <Button onClick={triggerAggregation} variant="outline" className="border-slate-600">
          <Package className="w-4 h-4 mr-2" /> Aggregate Orders
        </Button>
      </div>

      {/* Storefront selector */}
      {storefronts.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button size="sm" variant={selectedStorefront === 'all' ? 'default' : 'outline'} onClick={() => setSelectedStorefront('all')} className={selectedStorefront === 'all' ? 'bg-amber-600' : 'border-slate-600'}>
            All ({storefronts.length})
          </Button>
          {storefronts.map(sf => (
            <Button key={sf.id} size="sm" variant={selectedStorefront === sf.id ? 'default' : 'outline'} onClick={() => setSelectedStorefront(sf.id)} className={selectedStorefront === sf.id ? 'bg-amber-600' : 'border-slate-600'}>
              {sf.name}
            </Button>
          ))}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Today's Orders</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{todayOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Tomorrow Pre-orders</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{tomorrowOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">This Week Revenue</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">${weekRevenue.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-3xl font-bold text-slate-300 mt-1">{paidOrders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tomorrow's consolidated prep list */}
      {tomorrowConsolidated.size > 0 && (
        <Card className="bg-blue-950/30 border-blue-800/50 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-300 flex items-center gap-2">
              <Package className="w-5 h-5" /> Tomorrow's Prep List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from(tomorrowConsolidated.values()).map(item => (
                <div key={item.name} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-slate-800">
                  <span className="text-sm truncate">{item.name}</span>
                  <Badge variant="outline" className="ml-2 border-blue-500/30 text-blue-400 font-bold">{item.qty}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders list */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-300">Orders</h2>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No orders yet. Share your menu link to start receiving orders!</p>
          </div>
        )}
        {filteredOrders.map(order => {
          const parsed: ParsedItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          const statusConf = STATUS_CONFIG[order.delivery_status] || STATUS_CONFIG.pending;
          const StatusIcon = statusConf.icon;
          const isExpanded = expandedOrder === order.id;
          const isPaid = order.stripe_payment_status === 'paid';

          return (
            <Card key={order.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{order.customer_name || order.customer_email}</p>
                      <p className="text-xs text-slate-500">{formatDate(order.delivery_date)} · {parsed.length} item{parsed.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={`${statusConf.color} border text-xs`}>{statusConf.label}</Badge>
                    {!isPaid && <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs">Unpaid</Badge>}
                    <span className="font-bold text-amber-400">${order.total.toFixed(2)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                    <div className="space-y-1">
                      {parsed.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-300">{item.qty}× {item.item_name}</span>
                          <span className="text-slate-400">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.delivery_fee > 0 && (
                        <div className="flex justify-between text-sm text-slate-500 pt-1 border-t border-slate-800">
                          <span>Delivery fee</span>
                          <span>${order.delivery_fee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Email: {order.customer_email}
                        {order.stamp_photo_url && <> · <Camera className="w-3 h-3 inline" /> STAMP photo</>}
                      </p>
                      {isPaid && order.delivery_status !== 'delivered' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); advanceStatus(order.id, order.delivery_status); }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7">
                          Mark as {STATUS_CONFIG[STATUS_FLOW[STATUS_FLOW.indexOf(order.delivery_status as DeliveryStatus) + 1]]?.label || 'Next'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PortalPageLayout>
  );
}
