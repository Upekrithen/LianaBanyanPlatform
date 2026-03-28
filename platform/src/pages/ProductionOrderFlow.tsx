import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useToast } from '@/hooks/use-toast';
import { Hammer, Package, Star, Loader2, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  price_cents: number;
  cost_cents: number | null;
  images: { url: string; alt: string }[];
}

interface Maker {
  id: string;
  business_name: string;
  slug: string;
  capabilities: string[];
  location_city: string | null;
  location_state: string | null;
  capacity_weekly: number | null;
  rating: number;
  completed_orders: number;
  is_verified: boolean;
  is_accepting_orders: boolean;
}

const CATEGORY_TO_CAPABILITIES: Record<string, string[]> = {
  terrain: ['3d_printing', 'resin', 'casting'],
  hinge: ['3d_printing', 'cnc'],
  miniature: ['resin', '3d_printing', 'casting'],
  accessory: ['3d_printing', 'laser', 'cnc'],
  tool: ['cnc', 'metalwork', '3d_printing'],
  furniture: ['woodwork', 'cnc', 'metalwork'],
};

export default function ProductionOrderFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const productSlug = searchParams.get('product');
  const makerSlug = searchParams.get('maker');

  const [selectedMakerId, setSelectedMakerId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('50');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data: product } = useQuery({
    queryKey: ['production-product', productSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_products')
        .select('id, title, slug, category, price_cents, cost_cents, images')
        .eq('slug', productSlug)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!productSlug,
  });

  const { data: preselectedMaker } = useQuery({
    queryKey: ['production-maker', makerSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('makers')
        .select('*')
        .eq('slug', makerSlug)
        .maybeSingle();
      if (error) throw error;
      if (data) setSelectedMakerId(data.id);
      return data as Maker | null;
    },
    enabled: !!makerSlug,
  });

  const relevantCapabilities = product ? CATEGORY_TO_CAPABILITIES[product.category] || [] : [];

  const { data: compatibleMakers = [] } = useQuery({
    queryKey: ['compatible-makers', product?.category],
    queryFn: async () => {
      let q = supabase
        .from('makers')
        .select('*')
        .eq('is_accepting_orders', true)
        .order('rating', { ascending: false });

      const { data, error } = await q.limit(20);
      if (error) throw error;

      const makers = (data || []) as Maker[];
      if (relevantCapabilities.length === 0) return makers;
      return makers.filter(m => {
        const caps = (m.capabilities as string[]) || [];
        return caps.some(c => relevantCapabilities.includes(c));
      });
    },
    enabled: !!product && !makerSlug,
  });

  const selectedMaker = useMemo(() => {
    if (preselectedMaker && selectedMakerId === preselectedMaker.id) return preselectedMaker;
    return compatibleMakers.find(m => m.id === selectedMakerId) || null;
  }, [selectedMakerId, preselectedMaker, compatibleMakers]);

  const unitCostCents = product?.cost_cents || Math.round(product?.price_cents ? product.price_cents * 0.6 : 0);
  const qty = parseInt(quantity) || 0;
  const totalCostCents = unitCostCents * qty;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please sign in');
      if (!product) throw new Error('No product selected');
      if (!selectedMakerId) throw new Error('No maker selected');
      if (qty <= 0) throw new Error('Quantity must be positive');

      const { error } = await supabase.from('production_orders').insert({
        product_id: product.id,
        maker_id: selectedMakerId,
        quantity: qty,
        unit_cost_cents: unitCostCents,
        total_cost_cents: totalCostCents,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Production order created!', description: 'The maker will review your order.' });
      navigate('/products');
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  if (!user) {
    return (
      <PortalPageLayout title="Production Order">
        <div className="text-center py-20 space-y-3">
          <p className="text-muted-foreground">Please sign in to create a production order.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout title="New Production Order" subtitle="Commission a maker to produce your product at Cost+20%" backButton>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Product Summary */}
        {product && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" />Product</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground/30" /></div>
                )}
              </div>
              <div>
                <p className="font-semibold">{product.title}</p>
                <p className="text-sm text-muted-foreground">Unit cost: ${(unitCostCents / 100).toFixed(2)} | Retail: ${(product.price_cents / 100).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!product && !productSlug && (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-muted-foreground">Select a product from the catalog first.</p>
              <Button onClick={() => navigate('/products')}>Browse Products</Button>
            </CardContent>
          </Card>
        )}

        {/* Maker Selection */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Hammer className="w-4 h-4" />Select Maker</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {selectedMaker ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <Hammer className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{selectedMaker.business_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(selectedMaker.rating).toFixed(1)}
                    <span>|</span>{selectedMaker.completed_orders} orders
                    {selectedMaker.is_verified && <Badge variant="outline" className="text-[9px]">Verified</Badge>}
                  </div>
                </div>
                {!makerSlug && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMakerId(null)}>Change</Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {compatibleMakers.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-muted-foreground">No makers available for this product category yet.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/makers')}>Browse All Makers</Button>
                  </div>
                ) : (
                  compatibleMakers.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedMakerId(m.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                        <Hammer className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{m.business_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />{Number(m.rating).toFixed(1)}
                          {m.location_city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{m.location_city}</span>}
                          {m.capacity_weekly && <span>{m.capacity_weekly}/wk</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due">Due Date</Label>
                <Input id="due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for Maker</Label>
              <Textarea
                id="notes"
                placeholder="Material preference, color, special instructions..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {product && qty > 0 && (
              <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span>Unit cost:</span><span>${(unitCostCents / 100).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Quantity:</span><span>×{qty}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>${(totalCostCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Priced at Cost+20%. Creator keeps 83.3%.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => createOrderMutation.mutate()}
          disabled={createOrderMutation.isPending || !product || !selectedMakerId || qty <= 0}
        >
          {createOrderMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Order...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-2" />Create Production Order</>
          )}
        </Button>
      </div>
    </PortalPageLayout>
  );
}
