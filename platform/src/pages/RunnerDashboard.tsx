import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, DollarSign, Truck, Clock, Camera, Upload, CheckCircle, ExternalLink, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StorefrontRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  business_location: string | null;
  delivery_window_start: string;
  delivery_window_end: string;
  delivery_fee: number;
  is_open: boolean;
}

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
}

interface OnboardingCredit {
  id: string;
  storefront_id: string;
  is_qualified: boolean;
  orders_count: number;
  credit_percentage: number;
}

interface ParsedItem {
  item_name: string;
  qty: number;
  price: number;
}

function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function RunnerDashboard() {
  const { user } = useAuth();
  const [storefronts, setStorefronts] = useState<StorefrontRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [credits, setCredits] = useState<OnboardingCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stampOrderId, setStampOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch storefronts owned by this runner
      const { data: sfs } = await supabase
        .from('storefronts' as never)
        .select('id, name, slug, category, business_location, delivery_window_start, delivery_window_end, delivery_fee, is_open')
        .eq('user_id', user.id) as { data: StorefrontRow[] | null };

      const myStorefronts = sfs || [];
      setStorefronts(myStorefronts);

      if (myStorefronts.length === 0) {
        setLoading(false);
        return;
      }

      const sfIds = myStorefronts.map(s => s.id);

      // Fetch tomorrow's and today's orders
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const { data: ords } = await supabase
        .from('menu_orders' as never)
        .select('id, storefront_id, customer_email, customer_name, items, delivery_fee, subtotal, total, delivery_date, delivery_status, stripe_payment_status, stamp_photo_url')
        .in('storefront_id', sfIds)
        .in('delivery_date', [today, tomorrow])
        .eq('stripe_payment_status', 'paid')
        .order('delivery_date', { ascending: true } as never) as { data: OrderRow[] | null };

      setOrders(ords || []);

      // Fetch onboarding credits
      const { data: creds } = await supabase
        .from('onboarding_credits' as never)
        .select('id, storefront_id, is_qualified, orders_count, credit_percentage')
        .eq('onboarder_id', user.id) as { data: OnboardingCredit[] | null };

      setCredits(creds || []);
      setLoading(false);
    })();
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const tomorrowOrders = useMemo(() => orders.filter(o => o.delivery_date === tomorrow), [orders, tomorrow]);
  const todayOrders = useMemo(() => orders.filter(o => o.delivery_date === today), [orders, today]);

  // Group tomorrow's orders by storefront for route planning
  const routeStops = useMemo(() => {
    const stops: { storefront: StorefrontRow; orders: OrderRow[]; itemCount: number; revenue: number }[] = [];
    for (const sf of storefronts) {
      const sfOrders = tomorrowOrders.filter(o => o.storefront_id === sf.id);
      if (sfOrders.length === 0) continue;
      let itemCount = 0;
      let revenue = 0;
      for (const order of sfOrders) {
        revenue += order.total;
        const parsed: ParsedItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        itemCount += parsed.reduce((sum, p) => sum + p.qty, 0);
      }
      stops.push({ storefront: sf, orders: sfOrders, itemCount, revenue });
    }
    return stops;
  }, [storefronts, tomorrowOrders]);

  const totalEarnings = useMemo(() => {
    const allPaid = orders.filter(o => o.stripe_payment_status === 'paid');
    return allPaid.reduce((sum, o) => sum + o.delivery_fee, 0);
  }, [orders]);

  const totalOnboardingRevenue = useMemo(() => {
    return credits
      .filter(c => c.is_qualified)
      .reduce((sum, c) => sum + c.credit_percentage, 0);
  }, [credits]);

  const handleStampUpload = async (file: File) => {
    if (!stampOrderId || !user) return;
    setUploading(stampOrderId);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `stamps/${user.id}/${stampOrderId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('public-uploads')
        .upload(path, file, { upsert: true });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage
        .from('public-uploads')
        .getPublicUrl(path);

      await supabase
        .from('menu_orders' as never)
        .update({ stamp_photo_url: urlData.publicUrl, delivery_status: 'delivered' } as never)
        .eq('id', stampOrderId);

      setOrders(prev => prev.map(o =>
        o.id === stampOrderId ? { ...o, stamp_photo_url: urlData.publicUrl, delivery_status: 'delivered' } : o
      ));

      toast.success('STAMP photo uploaded — order marked delivered');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(null);
      setStampOrderId(null);
    }
  };

  if (loading) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="runner-dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-slate-400">Loading runner dashboard...</div>
        </div>
      </PortalPageLayout>
    );
  }

  if (storefronts.length === 0) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="runner-dashboard">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="text-center py-16">
          <Truck className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h1 className="text-2xl font-bold mb-2">No Routes Yet</h1>
          <p className="text-slate-400 mb-6">Onboard a local business to start running deliveries and earning passive income.</p>
          <Link to="/tools/storefront-builder">
            <Button className="bg-amber-600 hover:bg-amber-700">Onboard a Business</Button>
          </Link>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="runner-dashboard">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-xray-id="runner-dash-title">Runner Dashboard</h1>
        <p className="text-slate-400 mt-1">Your delivery route and earnings</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Tomorrow's Stops</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{routeStops.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Tomorrow's Orders</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{tomorrowOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Delivery Earnings</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">${totalEarnings.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Storefronts</p>
            <p className="text-3xl font-bold text-slate-300 mt-1">{storefronts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding credit status */}
      {credits.length > 0 && (
        <Card className="bg-emerald-950/30 border-emerald-800/50 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-emerald-300 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Onboarding Credits (Passive Income)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {credits.map(credit => {
                const sf = storefronts.find(s => s.id === credit.storefront_id);
                return (
                  <div key={credit.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-800">
                    <div>
                      <p className="font-medium">{sf?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{credit.orders_count}/10 qualifying orders</p>
                    </div>
                    <div className="text-right">
                      {credit.is_qualified ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" /> {credit.credit_percentage}% Passive
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-600 text-slate-400">
                          {10 - credit.orders_count} orders to qualify
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {totalOnboardingRevenue > 0 && (
              <p className="text-sm text-emerald-400 mt-3">
                You may earn {totalOnboardingRevenue}% passive income from qualified storefronts — paid from the platform's share, not the business's 83.3%.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tomorrow's route */}
      <h2 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <Truck className="w-5 h-5 text-blue-400" /> Tomorrow's Route
      </h2>

      {routeStops.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="py-8 text-center text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No deliveries scheduled for tomorrow yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {routeStops.map((stop, idx) => (
            <Card key={stop.storefront.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <div className="flex items-stretch">
                {/* Route number */}
                <div className="w-14 bg-blue-600/20 flex flex-col items-center justify-center border-r border-slate-700 shrink-0">
                  <span className="text-2xl font-bold text-blue-400">{idx + 1}</span>
                  <MapPin className="w-4 h-4 text-blue-500 mt-1" />
                </div>

                <CardContent className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{stop.storefront.name}</h3>
                      {stop.storefront.business_location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {stop.storefront.business_location}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">${stop.revenue.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">
                        {formatTime(stop.storefront.delivery_window_start)}–{formatTime(stop.storefront.delivery_window_end)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {stop.orders.length} order{stop.orders.length === 1 ? '' : 's'}</span>
                    <span className="flex items-center gap-1">{stop.itemCount} item{stop.itemCount === 1 ? '' : 's'}</span>
                    <Link to={`/menu/${stop.storefront.slug}`} className="flex items-center gap-1 text-amber-400 hover:text-amber-300">
                      <ExternalLink className="w-3 h-3" /> Menu
                    </Link>
                  </div>

                  {/* Individual orders within this stop */}
                  <div className="mt-3 space-y-2">
                    {stop.orders.map(order => {
                      const parsed: ParsedItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      const isDelivered = order.delivery_status === 'delivered';
                      return (
                        <div key={order.id} className={`p-2 rounded border ${isDelivered ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-slate-900/50 border-slate-800'}`}>
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{order.customer_name || order.customer_email}</p>
                              <p className="text-xs text-slate-500">{parsed.map(p => `${p.qty}× ${p.item_name}`).join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {isDelivered ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Delivered
                                </Badge>
                              ) : (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                                  disabled={uploading === order.id}
                                  onClick={() => {
                                    setStampOrderId(order.id);
                                    fileInputRef.current?.click();
                                  }}>
                                  {uploading === order.id ? 'Uploading...' : (
                                    <><Camera className="w-3 h-3 mr-1" /> STAMP</>
                                  )}
                                </Button>
                              )}
                              <span className="text-sm font-bold text-amber-400">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Today's deliveries */}
      {todayOrders.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" /> Today's Orders ({todayOrders.length})
          </h2>
          <div className="space-y-2 mb-8">
            {todayOrders.map(order => {
              const sf = storefronts.find(s => s.id === order.storefront_id);
              const parsed: ParsedItem[] = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              const isDelivered = order.delivery_status === 'delivered';
              return (
                <Card key={order.id} className={`border ${isDelivered ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-slate-800/50 border-slate-700'}`}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sf?.name} → {order.customer_name || order.customer_email}</p>
                      <p className="text-xs text-slate-500">{parsed.map(p => `${p.qty}× ${p.item_name}`).join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isDelivered ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : order.stamp_photo_url ? (
                        <Camera className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Button size="sm" variant="outline" className="border-slate-600 text-xs h-7"
                          onClick={() => {
                            setStampOrderId(order.id);
                            fileInputRef.current?.click();
                          }}>
                          <Upload className="w-3 h-3 mr-1" /> STAMP
                        </Button>
                      )}
                      <span className="text-sm font-bold text-amber-400">${order.total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* My storefronts */}
      <h2 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <Store className="w-5 h-5 text-amber-400" /> My Storefronts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {storefronts.map(sf => (
          <Link key={sf.id} to={`/menu/${sf.slug}`}>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{sf.name}</p>
                  {sf.business_location && <p className="text-xs text-slate-500">{sf.business_location}</p>}
                </div>
                <Badge className={sf.is_open ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}>
                  {sf.is_open ? 'Open' : 'Closed'}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
        <Link to="/tools/storefront-builder">
          <Card className="bg-slate-800/50 border-slate-700 border-dashed hover:border-amber-500/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-center gap-2 text-slate-500 hover:text-amber-400">
              <Store className="w-5 h-5" /> Onboard Another Business
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Hidden file input for STAMP uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleStampUpload(file);
          e.target.value = '';
        }}
      />
    </PortalPageLayout>
  );
}
