import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, MapPin, Clock, Truck, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StorefrontData {
  id: string;
  name: string;
  category: string;
  business_location: string | null;
  logo_url: string | null;
  order_cutoff_time: string;
  delivery_window_start: string;
  delivery_window_end: string;
  delivery_fee: number;
  is_open: boolean;
}

interface ItemData {
  id: string;
  item_name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  category: string;
}

interface CartItem {
  item: ItemData;
  qty: number;
}

function formatTime(t: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function MenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [items, setItems] = useState<ItemData[]>([]);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: sf } = await supabase
        .from('storefronts' as never)
        .select('id, name, category, business_location, logo_url, order_cutoff_time, delivery_window_start, delivery_window_end, delivery_fee, is_open')
        .eq('slug', slug)
        .single() as { data: StorefrontData | null };

      if (!sf) { setLoading(false); return; }
      setStorefront(sf);

      const { data: menuItems } = await supabase
        .from('storefront_items' as never)
        .select('id, item_name, description, price, photo_url, category')
        .eq('storefront_id', sf.id)
        .eq('is_active', true)
        .order('sort_order' as never) as { data: ItemData[] | null };

      setItems(menuItems || []);
      setLoading(false);
    })();
  }, [slug]);

  const addToCart = (item: ItemData) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      next.set(item.id, { item, qty: (existing?.qty || 0) + 1 });
      return next;
    });
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(itemId);
      if (!existing) return next;
      const newQty = existing.qty + delta;
      if (newQty <= 0) next.delete(itemId);
      else next.set(itemId, { ...existing, qty: newQty });
      return next;
    });
  };

  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);
  const subtotal = useMemo(() => cartItems.reduce((sum, ci) => sum + ci.item.price * ci.qty, 0), [cartItems]);
  const deliveryFee = storefront?.delivery_fee || 2;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);
  const totalItems = useMemo(() => cartItems.reduce((sum, ci) => sum + ci.qty, 0), [cartItems]);

  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category));
    return Array.from(cats);
  }, [items]);

  const handleCheckout = async () => {
    if (!storefront || cartItems.length === 0) return;
    if (!customerEmail.trim()) { toast.error('Email is required'); return; }
    setCheckingOut(true);

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const deliveryDate = tomorrow.toISOString().split('T')[0];

      const orderItems = cartItems.map(ci => ({
        item_id: ci.item.id,
        item_name: ci.item.item_name,
        price: ci.item.price,
        qty: ci.qty,
      }));

      const { data, error } = await supabase.functions.invoke('create-menu-checkout', {
        body: {
          storefront_id: storefront.id,
          storefront_name: storefront.name,
          customer_email: customerEmail,
          customer_name: customerName,
          items: orderItems,
          delivery_fee: deliveryFee,
          subtotal,
          total,
          delivery_date: deliveryDate,
        },
      });

      if (error) throw new Error('Checkout failed');
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading menu...</div>
      </div>
    );
  }

  if (!storefront) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-6">
        <div>
          <Store className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-300 mb-2">Storefront Not Found</h1>
          <p className="text-slate-500 mb-4">This menu doesn't exist or has been deactivated.</p>
          <Link to="/" className="text-amber-400 hover:text-amber-300">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-4">
            <ArrowLeft className="w-3 h-3" /> Liana Banyan
          </Link>
          <div className="flex items-start gap-4">
            {storefront.logo_url ? (
              <img src={storefront.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Store className="w-8 h-8 text-amber-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold" data-xray-id="menu-title">{storefront.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-400">
                {storefront.business_location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {storefront.business_location}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Order by {storefront.order_cutoff_time === '00:00:00' ? 'Midnight' : formatTime(storefront.order_cutoff_time)}
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3" /> {formatTime(storefront.delivery_window_start)}–{formatTime(storefront.delivery_window_end)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {categories.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-slate-300 mb-3 capitalize">{cat}</h2>
            <div className="space-y-2">
              {items.filter(i => i.category === cat).map(item => {
                const inCart = cart.get(item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.item_name}</p>
                      {item.description && <p className="text-xs text-slate-500 truncate">{item.description}</p>}
                      <p className="text-sm font-bold text-amber-400 mt-0.5">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => updateCartQty(item.id, -1)} className="h-7 w-7 p-0 border-slate-600">
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold">{inCart.qty}</span>
                          <Button size="sm" variant="outline" onClick={() => updateCartQty(item.id, 1)} className="h-7 w-7 p-0 border-slate-600">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(item)} className="bg-amber-600 hover:bg-amber-700 h-7">
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>This menu is being set up. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Cart footer */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 px-4 py-3 z-50">
          <div className="max-w-2xl mx-auto">
            {showCart ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Your Order</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCart(false)} className="text-slate-400">Close</Button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {cartItems.map(ci => (
                    <div key={ci.item.id} className="flex justify-between text-sm">
                      <span>{ci.qty}× {ci.item.item_name}</span>
                      <span className="text-amber-400">${(ci.item.price * ci.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm text-slate-400 pt-1 border-t border-slate-800">
                    <span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-700">
                    <span>Total</span><span className="text-amber-400">${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Email *</Label>
                    <Input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="you@email.com" className="mt-1 h-9" />
                  </div>
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your name" className="mt-1 h-9" />
                  </div>
                </div>
                <Button onClick={handleCheckout} disabled={checkingOut || !customerEmail.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {checkingOut ? 'Redirecting to Stripe...' : `Pay $${total.toFixed(2)}`}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowCart(true)} className="w-full bg-amber-600 hover:bg-amber-700 flex justify-between px-4">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {totalItems} item{totalItems > 1 ? 's' : ''}
                </span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
