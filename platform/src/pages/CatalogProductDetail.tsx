import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle2, Circle, Loader2, Package, Star, Hammer, Users, Clock, ExternalLink, Percent, Info } from 'lucide-react';
import { useCoalitionDiscount } from '@/hooks/useCoalitionDiscount';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  price_cents: number;
  cost_cents: number | null;
  images: { url: string; alt: string; order: number }[];
  status: string;
  production_status: string | null;
  crowdfund_goal_cents: number | null;
  crowdfund_raised_cents: number;
  crowdfund_backer_count: number;
  crowdfund_deadline: string | null;
  is_hexisle: boolean;
  is_featured: boolean;
  maker_id: string | null;
  tags: string[];
}

interface Maker {
  id: string;
  business_name: string;
  slug: string;
  capabilities: string[];
  capacity_weekly: number | null;
  rating: number;
  completed_orders: number;
  is_verified: boolean;
}

const PRODUCTION_STEPS = [
  { key: 'design', label: 'Design' },
  { key: 'prototype', label: 'Prototype' },
  { key: 'testing', label: 'Testing' },
  { key: 'production_ready', label: 'Production' },
  { key: 'in_production', label: 'Manufacturing' },
  { key: 'fulfilled', label: 'Shipped' },
] as const;

const REWARD_TIERS = [
  { amount: 2500, name: 'Supporter', description: '1 unit + digital thank-you card' },
  { amount: 7500, name: 'Builder', description: '3 units + terrain base + sticker pack' },
  { amount: 20000, name: 'Collector', description: 'Full collection + signed concept art + early access' },
];

export default function CatalogProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const coalitionDiscount = useCoalitionDiscount();

  const { data: product, isLoading } = useQuery({
    queryKey: ['catalog-product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!slug,
  });

  const { data: maker } = useQuery({
    queryKey: ['product-maker', product?.maker_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('makers')
        .select('*')
        .eq('id', product!.maker_id!)
        .maybeSingle();
      if (error) throw error;
      return data as Maker | null;
    },
    enabled: !!product?.maker_id,
  });

  const backMutation = useMutation({
    mutationFn: async (amountCents: number) => {
      if (!user || !product) throw new Error('Must be signed in');
      const { error } = await supabase.from('catalog_product_backers').insert({
        product_id: product.id,
        backer_id: user.id,
        amount_cents: amountCents,
        status: 'pledged',
      });
      if (error) throw error;
      await supabase.rpc('increment_crowdfund', { p_product_id: product.id, p_amount: amountCents });
    },
    onSuccess: () => {
      toast({ title: 'Pledge recorded!', description: 'Thank you for backing this project.' });
      queryClient.invalidateQueries({ queryKey: ['catalog-product', slug] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading...">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
      </PortalPageLayout>
    );
  }

  if (!product) {
    return (
      <PortalPageLayout title="Product Not Found">
        <div className="text-center py-20 space-y-3">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">This product doesn't exist or has been archived.</p>
          <Button onClick={() => navigate('/products')}>Back to Catalog</Button>
        </div>
      </PortalPageLayout>
    );
  }

  const hasCrowdfund = product.crowdfund_goal_cents && product.crowdfund_goal_cents > 0;
  const fundingPercent = hasCrowdfund
    ? Math.min(100, Math.round((product.crowdfund_raised_cents / product.crowdfund_goal_cents!) * 100))
    : 0;
  const daysLeft = product.crowdfund_deadline
    ? Math.max(0, Math.ceil((new Date(product.crowdfund_deadline).getTime() - Date.now()) / 86400000))
    : null;

  const currentStepIdx = PRODUCTION_STEPS.findIndex(s => s.key === product.production_status);
  const images = (product.images as { url: string; alt: string; order: number }[]) || [];

  return (
    <PortalPageLayout title={product.title} backButton>
      <div className="space-y-8">
        {/* Hero: Image + Summary */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {images[selectedImage]?.url ? (
                <img src={images[selectedImage].url} alt={images[selectedImage].alt || product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                  <Package className="w-20 h-20 text-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground/50 mt-2">Render Coming Soon</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                {product.is_hexisle && <Badge variant="outline">HexIsle</Badge>}
                {product.is_featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              <h1 className="text-2xl font-bold">{product.title}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-bold">${(product.price_cents / 100).toFixed(2)}</div>
              {coalitionDiscount.hasDiscount && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Percent className="w-3 h-3 mr-1" />
                    Save {coalitionDiscount.discountPercent}% with Coalition
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-xs">
                          Coalition discount via <strong>{coalitionDiscount.coalitionName}</strong>.
                          This discount comes from the platform's Cost+20% margin — the creator always receives their full listed price.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {hasCrowdfund && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Progress value={fundingPercent} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{fundingPercent}% funded</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{product.crowdfund_backer_count} backers</span>
                    {daysLeft !== null && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{daysLeft} days left</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${(product.crowdfund_raised_cents / 100).toLocaleString()} of ${(product.crowdfund_goal_cents! / 100).toLocaleString()} goal
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              {hasCrowdfund && daysLeft !== null && daysLeft > 0 ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    type="number"
                    placeholder="Amount ($)"
                    value={pledgeAmount}
                    onChange={e => setPledgeAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const cents = Math.round(parseFloat(pledgeAmount) * 100);
                      if (cents > 0) backMutation.mutate(cents);
                    }}
                    disabled={backMutation.isPending || !pledgeAmount}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {backMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Back This Project'}
                  </Button>
                </div>
              ) : product.production_status === 'production_ready' ? (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                  Order Now
                </Button>
              ) : (
                <Button variant="outline" className="flex-1" size="lg" disabled>
                  Coming Soon
                </Button>
              )}
            </div>

            {product.production_status === 'production_ready' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/production/new?product=${product.slug}`)}
              >
                <Hammer className="w-4 h-4 mr-2" />Hire a Maker for Production
              </Button>
            )}
          </div>
        </div>

        {/* Long Description */}
        {product.long_description && (
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{product.long_description}</p>
            </CardContent>
          </Card>
        )}

        {/* Production Timeline */}
        {product.production_status && (
          <Card>
            <CardHeader><CardTitle>Production Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {PRODUCTION_STEPS.map((step, i) => {
                  const isComplete = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <div key={step.key} className="flex items-center gap-2 shrink-0">
                      {i > 0 && <div className={`w-8 h-0.5 ${isComplete ? 'bg-green-500' : 'bg-muted'}`} />}
                      <div className="flex flex-col items-center gap-1">
                        {isComplete ? (
                          <CheckCircle2 className={`w-6 h-6 ${isCurrent ? 'text-blue-500' : 'text-green-500'}`} />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground/30" />
                        )}
                        <span className={`text-[11px] ${isCurrent ? 'font-semibold text-blue-500' : isComplete ? 'text-green-600' : 'text-muted-foreground/50'}`}>
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Maker */}
        {maker && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/makers/${maker.slug}`)}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Hammer className="w-5 h-5" />Maker</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <Hammer className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{maker.business_name}</span>
                  {maker.is_verified && <Badge variant="outline" className="text-[10px]">Verified</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(maker.rating).toFixed(1)}</span>
                  <span>{maker.completed_orders} orders</span>
                  {maker.capacity_weekly && <span>{maker.capacity_weekly} units/wk</span>}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* Reward Tiers (crowdfunding) */}
        {hasCrowdfund && (
          <Card>
            <CardHeader><CardTitle>Reward Tiers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {REWARD_TIERS.map(tier => (
                <div
                  key={tier.amount}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => { setPledgeAmount(String(tier.amount / 100)); }}
                >
                  <div>
                    <p className="font-semibold">${(tier.amount / 100).toFixed(0)} — {tier.name}</p>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                  <Button size="sm" variant="outline">Select</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalPageLayout>
  );
}
