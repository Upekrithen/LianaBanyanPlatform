import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Package, Search, Star, Hammer, Loader2, Percent } from 'lucide-react';
import { useCoalitionDiscount } from '@/hooks/useCoalitionDiscount';

type CategoryFilter = 'all' | 'terrain' | 'hinge' | 'miniature' | 'accessory' | 'tool' | 'game' | 'other';
type StatusFilter = 'all' | 'crowdfunding' | 'production_ready' | 'new';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price_cents: number;
  images: { url: string; alt: string }[];
  status: string;
  production_status: string | null;
  crowdfund_goal_cents: number | null;
  crowdfund_raised_cents: number;
  crowdfund_backer_count: number;
  crowdfund_deadline: string | null;
  is_hexisle: boolean;
  is_featured: boolean;
  created_at: string;
}

interface Maker {
  id: string;
  business_name: string;
  slug: string;
  description: string;
  capabilities: string[];
  rating: number;
  completed_orders: number;
  is_verified: boolean;
  portfolio_images: { url: string; alt: string }[];
}

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'hinge', label: 'Hinges' },
  { value: 'miniature', label: 'Miniatures' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'tool', label: 'Tools' },
  { value: 'game', label: 'Games' },
  { value: 'other', label: 'Other' },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'crowdfunding', label: 'Crowdfunding Now' },
  { value: 'production_ready', label: 'Production Ready' },
  { value: 'new', label: 'Newest' },
];

const PRODUCTION_LABELS: Record<string, { text: string; color: string }> = {
  design: { text: 'In Design', color: 'bg-slate-500' },
  prototype: { text: 'Prototype', color: 'bg-blue-500' },
  testing: { text: 'Testing', color: 'bg-amber-500' },
  production_ready: { text: 'Ready to Ship', color: 'bg-green-500' },
  in_production: { text: 'In Production', color: 'bg-purple-500' },
  fulfilled: { text: 'Fulfilled', color: 'bg-emerald-600' },
};

function ProductCard({ product, onClick, coalitionDiscount }: { product: Product; onClick: () => void; coalitionDiscount?: { hasDiscount: boolean; discountPercent: number } }) {
  const hasCrowdfund = product.crowdfund_goal_cents && product.crowdfund_goal_cents > 0;
  const fundingPercent = hasCrowdfund
    ? Math.min(100, Math.round((product.crowdfund_raised_cents / product.crowdfund_goal_cents!) * 100))
    : 0;
  const prodLabel = product.production_status ? PRODUCTION_LABELS[product.production_status] : null;
  const daysLeft = product.crowdfund_deadline
    ? Math.max(0, Math.ceil((new Date(product.crowdfund_deadline).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.images[0].alt || product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <Package className="w-12 h-12 text-muted-foreground/40" />
            <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50 bg-background/60 px-1.5 py-0.5 rounded">RENDER COMING</span>
          </div>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-white">Featured</Badge>
        )}
        {product.is_hexisle && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 text-xs">HexIsle</Badge>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{product.title}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">${(product.price_cents / 100).toFixed(2)}</span>
          {prodLabel && (
            <Badge variant="secondary" className={`text-[10px] text-white ${prodLabel.color}`}>{prodLabel.text}</Badge>
          )}
        </div>
        {coalitionDiscount?.hasDiscount && (
          <div className="flex items-center gap-1">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              <Percent className="w-2.5 h-2.5 mr-0.5" />Coalition: Save {coalitionDiscount.discountPercent}%
            </Badge>
          </div>
        )}
        {hasCrowdfund ? (
          <div className="space-y-1">
            <Progress value={fundingPercent} className="h-2" />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{fundingPercent}% funded</span>
              <span>{product.crowdfund_backer_count} backers</span>
              {daysLeft !== null && <span>{daysLeft}d left</span>}
            </div>
          </div>
        ) : (
          prodLabel?.text === 'Ready to Ship' && (
            <Badge className="w-full justify-center bg-green-600 text-white">Order Now</Badge>
          )
        )}
      </CardContent>
    </Card>
  );
}

function FeaturedMakerCard({ maker, onClick }: { maker: Maker; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
          <Hammer className="w-8 h-8 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{maker.business_name}</h3>
            {maker.is_verified && <Badge variant="outline" className="text-[10px] shrink-0">Verified</Badge>}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{maker.description || 'Professional maker'}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(maker.rating).toFixed(1)}</span>
            <span>{maker.completed_orders} orders</span>
            <span>{(maker.capabilities as string[])?.slice(0, 3).join(', ')}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">View</Button>
      </CardContent>
    </Card>
  );
}

export default function ProductCatalog() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const coalitionDiscount = useCoalitionDiscount();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['product-catalog', category, statusFilter, search],
    queryFn: async () => {
      let q = supabase
        .from('catalog_products')
        .select('*')
        .neq('status', 'archived')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (category !== 'all') q = q.eq('category', category);
      if (search) q = q.ilike('title', `%${search}%`);

      if (statusFilter === 'crowdfunding') {
        q = q.not('crowdfund_deadline', 'is', null).gte('crowdfund_deadline', new Date().toISOString());
      } else if (statusFilter === 'production_ready') {
        q = q.eq('production_status', 'production_ready');
      } else if (statusFilter === 'new') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        q = q.gte('created_at', weekAgo.toISOString());
      }

      const { data, error } = await q.limit(60);
      if (error) throw error;
      return (data || []) as Product[];
    },
  });

  const { data: featuredMaker } = useQuery({
    queryKey: ['featured-maker'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('makers')
        .select('*')
        .eq('is_verified', true)
        .order('completed_orders', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Maker | null;
    },
  });

  return (
    <PortalPageLayout title="Liana Banyan Marketplace" subtitle="Products, prototypes, and maker creations — all at Cost+20%">
      <div className="space-y-6">
        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <Button
                key={c.value}
                variant={category === c.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(s => (
              <Button
                key={s.value}
                variant={statusFilter === s.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(s.value)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <h3 className="text-lg font-medium">The first products are coming</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Drop a beacon to get notified when new products launch in this category.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <a href="/register-maker" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Register as a Maker
              </a>
              <a href="/makers" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted transition-colors">
                Browse Makers
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => navigate(`/products/${p.slug}`)} coalitionDiscount={coalitionDiscount} />
            ))}
          </div>
        )}

        {/* Featured Maker */}
        {featuredMaker && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Hammer className="w-5 h-5" /> Featured Maker
            </h2>
            <FeaturedMakerCard maker={featuredMaker} onClick={() => navigate(`/makers/${featuredMaker.slug}`)} />
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Button variant="outline" onClick={() => navigate('/makers')}>
            <Hammer className="w-4 h-4 mr-2" /> Browse Makers
          </Button>
          <Button variant="outline" onClick={() => navigate('/register-maker')}>
            Register as a Maker
          </Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
