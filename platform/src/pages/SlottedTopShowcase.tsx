import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Package, ArrowRight, FileDown, Hammer, Star } from 'lucide-react';

const SPECS = [
  { label: 'Material', value: 'PLA / PETG / Resin compatible' },
  { label: 'Load Rating', value: '5 kg per hinge joint' },
  { label: 'Sizes', value: 'Small (25mm), Medium (40mm), Large (60mm)' },
  { label: 'Compatibility', value: 'All HexIsle terrain bases' },
  { label: 'Print Time', value: '~45 min (S), ~90 min (M), ~180 min (L)' },
  { label: 'Infill', value: '20% recommended, supports optional' },
  { label: 'Layer Height', value: '0.2mm standard, 0.12mm for precision fit' },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'The Slot', description: 'A precision-cut channel runs along the edge of each terrain piece. Designed for zero-tolerance fit at standard FDM tolerances.' },
  { step: 2, title: 'The Tab', description: 'The matching tab slides into the slot with a satisfying click. No glue, no magnets, no screws.' },
  { step: 3, title: 'The Lock', description: 'A twist-lock mechanism prevents accidental separation during gameplay while allowing easy disassembly for storage.' },
];

const PRODUCTION_STEPS = [
  { key: 'design', label: 'Design', done: true },
  { key: 'prototype', label: 'Prototype', done: true, current: true },
  { key: 'testing', label: 'Testing', done: false },
  { key: 'production', label: 'Production', done: false },
  { key: 'shipping', label: 'Shipping', done: false },
];

export default function SlottedTopShowcase() {
  const navigate = useNavigate();

  const { data: compatibleProducts = [] } = useQuery({
    queryKey: ['slottedtop-compatible'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_products')
        .select('id, title, slug, price_cents, images, category')
        .eq('is_hexisle', true)
        .neq('slug', 'slottedtop-hinge')
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-gray-950 to-amber-900/20" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <Badge className="bg-amber-500 text-white text-sm px-4 py-1">Featured Product</Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-white to-amber-400 bg-clip-text text-transparent">
              SlottedTop
            </span>
          </h1>
          <p className="text-xl text-gray-300 font-light">The Universal Hinge System</p>
          <p className="text-2xl font-bold text-amber-400">"The last hinge you'll ever need."</p>

          <div className="max-w-2xl mx-auto aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Package className="w-20 h-20 text-gray-700 mx-auto" />
              <p className="text-gray-600 text-sm">Product photos coming — Founder, drop images in platform/public/dss/</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8" onClick={() => navigate('/products/slottedtop-hinge')}>
              Back on Kickstarter
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-900 text-lg px-8" onClick={() => navigate('/stl-vault')}>
              <FileDown className="w-5 h-5 mr-2" />Download STL
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(item => (
              <Card key={item.step} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center mx-auto text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">Specifications</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              {SPECS.map((spec, i) => (
                <div key={spec.label} className={`flex justify-between items-center px-6 py-4 ${i < SPECS.length - 1 ? 'border-b border-gray-800' : ''}`}>
                  <span className="text-gray-400 font-medium">{spec.label}</span>
                  <span className="text-white text-right">{spec.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Production Status */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center">Production Status</h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {PRODUCTION_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-3">
                {i > 0 && <div className={`w-8 h-0.5 ${step.done ? 'bg-cyan-500' : 'bg-gray-700'}`} />}
                <div className="flex flex-col items-center gap-1">
                  {step.done ? (
                    <CheckCircle2 className={`w-8 h-8 ${step.current ? 'text-cyan-400' : 'text-green-500'}`} />
                  ) : (
                    <Circle className="w-8 h-8 text-gray-700" />
                  )}
                  <span className={`text-xs ${step.current ? 'text-cyan-400 font-bold' : step.done ? 'text-green-400' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm">
            Currently in prototype phase. Test pilots needed — <button className="text-cyan-400 underline" onClick={() => navigate('/test-pilot')}>join the Test Pilot program</button>.
          </p>
        </div>
      </section>

      {/* Compatible Products */}
      {compatibleProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center">Compatible Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {compatibleProducts.map((p: any) => (
                <Card
                  key={p.id}
                  className="bg-gray-900 border-gray-800 cursor-pointer hover:border-cyan-800 transition-colors"
                  onClick={() => navigate(`/products/${p.slug}`)}
                >
                  <div className="aspect-[4/3] bg-gray-800 flex items-center justify-center">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-10 h-10 text-gray-700" />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-white line-clamp-1">{p.title}</p>
                    <p className="text-xs text-cyan-400">${(p.price_cents / 100).toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-900/20 to-amber-900/20">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to Build?</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold" onClick={() => navigate('/products/slottedtop-hinge')}>
              View Product Page <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 text-gray-300" onClick={() => navigate('/makers')}>
              <Hammer className="w-4 h-4 mr-2" />Find a Maker
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
