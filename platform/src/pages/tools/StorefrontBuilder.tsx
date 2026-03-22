import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Plus, Trash2, Clock, Truck, Image, ChevronRight, ChevronLeft, Eye, Check, Paintbrush, CreditCard, FileImage, Package, Sparkles, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  item_name: string;
  description: string;
  price: string;
  category: string;
  available_days: string[];
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = { mon: 'M', tue: 'T', wed: 'W', thu: 'Th', fri: 'F', sat: 'Sa', sun: 'Su' };
const CATEGORIES = [
  { value: 'food_drink', label: 'Food & Drink' },
  { value: 'services', label: 'Services' },
  { value: 'crafts_making', label: 'Crafts & Making' },
  { value: 'digital', label: 'Digital' },
  { value: 'home_garden', label: 'Home & Garden' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function StorefrontBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('food_drink');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [cutoffTime, setCutoffTime] = useState('00:00');
  const [deliveryStart, setDeliveryStart] = useState('07:00');
  const [deliveryEnd, setDeliveryEnd] = useState('08:00');
  const [deliveryFee, setDeliveryFee] = useState('2.00');
  const [items, setItems] = useState<MenuItem[]>([]);

  const addItem = () => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      item_name: '',
      description: '',
      price: '',
      category: 'general',
      available_days: [...DAYS],
    }]);
  };

  const updateItem = (id: string, field: keyof MenuItem, value: string | string[]) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleDay = (itemId: string, day: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const days = item.available_days.includes(day)
        ? item.available_days.filter(d => d !== day)
        : [...item.available_days, day];
      return { ...item, available_days: days };
    }));
  };

  const canProceed = () => {
    if (step === 1) return businessName.trim().length > 0;
    if (step === 2) return items.length > 0 && items.every(i => i.item_name && i.price);
    return true;
  };

  const handlePublish = async () => {
    if (!user) { toast.error('Please sign in first'); return; }
    setSaving(true);
    try {
      const slug = slugify(businessName) + '-' + Date.now().toString(36);

      const { data: storefront, error: sfErr } = await supabase
        .from('storefronts' as never)
        .insert({
          user_id: user.id,
          name: businessName,
          owner_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Owner',
          category,
          business_location: location || null,
          phone: phone || null,
          slug,
          order_cutoff_time: cutoffTime + ':00',
          delivery_window_start: deliveryStart + ':00',
          delivery_window_end: deliveryEnd + ':00',
          delivery_fee: parseFloat(deliveryFee) || 2.0,
          is_open: true,
        } as never)
        .select('id')
        .single() as { data: { id: string } | null; error: unknown };

      if (sfErr || !storefront) throw new Error('Failed to create storefront');

      const itemRows = items.map((item, idx) => ({
        storefront_id: storefront.id,
        item_name: item.item_name,
        description: item.description || null,
        price: parseFloat(item.price),
        category: item.category,
        available_days: item.available_days,
        sort_order: idx,
        is_active: true,
      }));

      const { error: itemErr } = await supabase
        .from('storefront_items' as never)
        .insert(itemRows as never);

      if (itemErr) throw new Error('Failed to add menu items');

      toast.success('Storefront published!');
      setPublishedSlug(slug);
      setStep(5);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="storefront-builder">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-8">
        <Store className="w-12 h-12 mx-auto mb-3 text-amber-400" />
        <h1 className="text-3xl font-bold mb-2" data-xray-id="sfb-title">Storefront Builder</h1>
        <p className="text-muted-foreground">Create a menu page for a local business. They get orders — you may earn onboarding credit.</p>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            s === step ? 'bg-amber-500 text-black' : s < step ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-muted-foreground'
          }`}>
            {s < step ? <Check className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      {/* Step 1: Business Info */}
      {step === 1 && (
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Business Name *</Label>
              <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g., Sunrise Donuts" className="mt-1" />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., 123 Main St, Boise, ID" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., (208) 555-1234" className="mt-1" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Menu Items */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="bg-card/50 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Menu Items</CardTitle>
              <Button size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items yet. Click "Add Item" to start building the menu.</p>
                </div>
              )}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-slate-900/50 rounded-lg border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">Item {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Name *</Label>
                        <Input value={item.item_name} onChange={e => updateItem(item.id, 'item_name', e.target.value)} placeholder="Glazed Donut" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Price *</Label>
                        <Input type="number" step="0.01" min="0" value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)} placeholder="2.50" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Classic hand-glazed..." rows={2} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Input value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)} placeholder="Donuts" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Available Days</Label>
                      <div className="flex gap-1 mt-1">
                        {DAYS.map(d => (
                          <button key={d} onClick={() => toggleDay(item.id, d)} className={`w-8 h-8 rounded text-xs font-bold ${
                            item.available_days.includes(d) ? 'bg-amber-500 text-black' : 'bg-slate-700 text-muted-foreground'
                          }`}>
                            {DAY_LABELS[d]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Delivery Settings */}
      {step === 3 && (
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400" /> Order & Delivery Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Order Cutoff Time</Label>
              <p className="text-xs text-muted-foreground mb-1">Orders placed after this time go to the next day</p>
              <Input type="time" value={cutoffTime} onChange={e => setCutoffTime(e.target.value)} className="mt-1 w-48" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Delivery Window Start</Label>
                <Input type="time" value={deliveryStart} onChange={e => setDeliveryStart(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Delivery Window End</Label>
                <Input type="time" value={deliveryEnd} onChange={e => setDeliveryEnd(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Delivery Fee ($)</Label>
              <Input type="number" step="0.50" min="0" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} className="mt-1 w-32" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <div className="space-y-4">
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-amber-400" /> Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{businessName || 'Untitled Business'}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline">{CATEGORIES.find(c => c.value === category)?.label}</Badge>
                  {location && <Badge variant="outline">{location}</Badge>}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery: {deliveryStart}–{deliveryEnd} | Cutoff: {cutoffTime === '00:00' ? 'Midnight' : cutoffTime} | Fee: ${deliveryFee}
                </p>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-3">Menu ({items.length} items)</h3>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      <p className="text-xs text-slate-600">{item.category}</p>
                    </div>
                    <p className="font-bold text-amber-400">${parseFloat(item.price || '0').toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 5: Success + Design Onboarding Prompt */}
      {step === 5 && publishedSlug && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border-emerald-500/30">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your storefront is live!</h2>
              <p className="text-muted-foreground mb-4">
                Customers can now order from <span className="text-emerald-400 font-medium">{businessName}</span>
              </p>
              <Link to={`/menu/${publishedSlug}`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Eye className="w-4 h-4" /> View Your Storefront
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Want to attract customers?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Stand out with professional designs. Browse templates from LB designers or commission custom work.
              </p>

              <div className="grid gap-3">
                <Link to="/emporium/templates?category=cue_card_template" className="block">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border hover:border-amber-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Cue Card</p>
                      <p className="text-xs text-muted-foreground">Hand out cards that link directly to your storefront</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>

                <Link to="/emporium/templates?category=logo" className="block">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border hover:border-amber-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                      <Paintbrush className="w-5 h-5 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Logo</p>
                      <p className="text-xs text-muted-foreground">Get a custom logo from an LB designer</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>

                <Link to="/emporium/templates?category=business_card_template" className="block">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50 border border-border hover:border-amber-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileImage className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Business Card</p>
                      <p className="text-xs text-muted-foreground">Professional business cards with your storefront QR code</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              </div>

              <Separator className="border-border" />

              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New Business Starter Package</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get everything at once — assemble a Crew Table with a designer, photographer, writer, and printer.
                      Your team builds your brand together.
                    </p>
                    <Link to="/bandwagon">
                      <Button size="sm" className="mt-3 gap-1 bg-purple-600 hover:bg-purple-700">
                        <Users className="w-3 h-3" /> Create Crew Table
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      {step < 5 && (
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="border-slate-600">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="bg-amber-600 hover:bg-amber-700">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handlePublish} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? 'Publishing...' : 'Publish Storefront'}
          </Button>
        )}
      </div>
      )}
    </PortalPageLayout>
  );
}
