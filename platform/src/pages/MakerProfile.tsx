import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Hammer, Star, MapPin, Package, Clock, Loader2, ArrowRight } from 'lucide-react';

interface Maker {
  id: string;
  user_id: string | null;
  business_name: string;
  slug: string;
  description: string | null;
  capabilities: string[];
  equipment: { name: string; type: string; specs?: string }[];
  location_city: string | null;
  location_state: string | null;
  location_country: string;
  capacity_weekly: number | null;
  rating: number;
  completed_orders: number;
  is_verified: boolean;
  is_accepting_orders: boolean;
  portfolio_images: { url: string; alt: string }[];
  created_at: string;
}

interface CompletedProduct {
  id: string;
  title: string;
  slug: string;
  category: string;
  images: { url: string; alt: string }[];
}

export default function MakerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: maker, isLoading } = useQuery({
    queryKey: ['maker-profile', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('makers')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as Maker | null;
    },
    enabled: !!slug,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['maker-products', maker?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_products')
        .select('id, title, slug, category, images')
        .eq('maker_id', maker!.id)
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data || []) as CompletedProduct[];
    },
    enabled: !!maker?.id,
  });

  const { data: orderStats } = useQuery({
    queryKey: ['maker-order-stats', maker?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_orders')
        .select('status')
        .eq('maker_id', maker!.id);
      if (error) throw error;
      const total = data?.length || 0;
      const delivered = data?.filter(o => o.status === 'delivered').length || 0;
      const active = data?.filter(o => !['delivered', 'disputed'].includes(o.status)).length || 0;
      return { total, delivered, active };
    },
    enabled: !!maker?.id,
  });

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading...">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
      </PortalPageLayout>
    );
  }

  if (!maker) {
    return (
      <PortalPageLayout title="Maker Not Found">
        <div className="text-center py-20 space-y-3">
          <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">This maker profile doesn't exist.</p>
          <Button onClick={() => navigate('/makers')}>Browse Makers</Button>
        </div>
      </PortalPageLayout>
    );
  }

  const caps = (maker.capabilities as string[]) || [];
  const equipment = (maker.equipment as { name: string; type: string; specs?: string }[]) || [];
  const portfolio = (maker.portfolio_images as { url: string; alt: string }[]) || [];
  const location = [maker.location_city, maker.location_state, maker.location_country].filter(Boolean).join(', ');

  return (
    <PortalPageLayout title={maker.business_name} backButton>
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <Hammer className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{maker.business_name}</h1>
                  {maker.is_verified && <Badge className="bg-blue-500 text-white">Verified</Badge>}
                  {maker.is_accepting_orders ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Accepting Orders</Badge>
                  ) : (
                    <Badge variant="outline">At Capacity</Badge>
                  )}
                </div>
                {location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-4 h-4" />{location}
                  </p>
                )}
                {maker.description && <p className="text-sm">{maker.description}</p>}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{Number(maker.rating).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">{maker.completed_orders} completed orders</span>
                  {maker.capacity_weekly && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />{maker.capacity_weekly} units/week
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                className="flex-1"
                disabled={!maker.is_accepting_orders}
                onClick={() => navigate(`/production/new?maker=${maker.slug}`)}
              >
                <Hammer className="w-4 h-4 mr-2" />Hire for Production
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {orderStats && (
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orderStats.total}</p><p className="text-xs text-muted-foreground">Total Orders</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orderStats.delivered}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{orderStats.active}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
          </div>
        )}

        {/* Capabilities */}
        <Card>
          <CardHeader><CardTitle>Capabilities</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {caps.length > 0 ? caps.map(c => (
              <Badge key={c} variant="secondary" className="text-sm px-3 py-1">{c.replace(/_/g, ' ')}</Badge>
            )) : (
              <p className="text-sm text-muted-foreground">No capabilities listed yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Equipment */}
        {equipment.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Equipment</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {equipment.map((eq, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <p className="font-medium">{eq.name}</p>
                    <p className="text-xs text-muted-foreground">{eq.type}{eq.specs ? ` — ${eq.specs}` : ''}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Images */}
        {portfolio.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {portfolio.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img.url} alt={img.alt || `Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products */}
        {products.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Products Made by {maker.business_name}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.map(p => (
                  <div
                    key={p.id}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/products/${p.slug}`)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-1">
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{p.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalPageLayout>
  );
}
