import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, Wrench, Layers, BookOpen, ArrowLeft, Check, X, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useCanisterProducts, type CanisterProduct } from "@/hooks/useCanisterSystem";

const SIZE_COLORS: Record<string, string> = {
  S: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  M: 'bg-green-500/20 text-green-400 border-green-500/30',
  L: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  XL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  universal: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
};

const TAB_TYPES: Record<string, string[]> = {
  kits: ['gravity_kit', 'thermoplastic_kit', 'combined_kit'],
  canisters: ['canister_pair'],
  addons: ['screw_press', 'heated_barrel', 'sleeve', 'base', 'cap', 'sprue_plug'],
  molds: ['mold_library'],
};

function ProductCard({ product }: { product: CanisterProduct }) {
  return (
    <Card className="border-zinc-700 hover:border-zinc-500 transition-colors">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-sm">{product.name}</h3>
          <Badge variant="outline" className={SIZE_COLORS[product.size] ?? SIZE_COLORS.universal}>
            {product.size}
          </Badge>
        </div>
        {product.description && (
          <p className="text-xs text-zinc-400">{product.description}</p>
        )}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-black">${product.price_usd}</span>
            {product.price_credits && (
              <span className="text-xs text-zinc-500 ml-2">or {product.price_credits} credits</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {product.in_stock ? (
              <span className="text-green-400 flex items-center gap-1"><Check className="h-3 w-3" /> In Stock</span>
            ) : (
              <span className="text-zinc-500 flex items-center gap-1"><X className="h-3 w-3" /> Pre-order</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const COMPARISON = [
  { name: 'Canister System (S + Screw)', price: '~$329', maxPsi: '5,207', open: true, multiCavity: true, portable: true },
  { name: 'Galomb Model B100', price: '$1,100', maxPsi: '~1,500', open: false, multiCavity: false, portable: false },
  { name: 'LNS Technologies', price: '$1,800', maxPsi: '~2,200', open: false, multiCavity: false, portable: false },
  { name: 'Holipress', price: '$400', maxPsi: '~800', open: false, multiCavity: false, portable: true },
];

export default function CanisterProductCatalog() {
  const { toast } = useToast();
  const { data: products = [], isLoading } = useCanisterProducts();
  const [moldRequest, setMoldRequest] = useState({ description: '', email: '' });

  const grouped = useMemo(() => {
    const result: Record<string, CanisterProduct[]> = { kits: [], canisters: [], addons: [], molds: [] };
    for (const p of products) {
      for (const [tab, types] of Object.entries(TAB_TYPES)) {
        if (types.includes(p.product_type)) {
          result[tab].push(p);
          break;
        }
      }
    }
    return result;
  }, [products]);

  const handleMoldRequest = () => {
    if (!moldRequest.description.trim()) {
      toast({ title: 'Description required', variant: 'destructive' });
      return;
    }
    toast({ title: 'Request Submitted', description: 'We\'ll reach out about your custom mold design.' });
    setMoldRequest({ description: '', email: '' });
  };

  return (
    <PortalPageLayout title="Canister System — Product Catalog" subtitle="Kits, canisters, add-ons, and mold libraries">
      <div className="max-w-5xl mx-auto space-y-8 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/factory/canister"><ArrowLeft className="mr-1 h-4 w-4" /> Configurator</Link>
          </Button>
        </div>

        <Tabs defaultValue="kits" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto">
            <TabsTrigger value="kits" className="text-xs gap-1"><Package className="h-3 w-3" /> Kits</TabsTrigger>
            <TabsTrigger value="canisters" className="text-xs gap-1"><Layers className="h-3 w-3" /> Canisters</TabsTrigger>
            <TabsTrigger value="addons" className="text-xs gap-1"><Wrench className="h-3 w-3" /> Add-ons</TabsTrigger>
            <TabsTrigger value="molds" className="text-xs gap-1"><BookOpen className="h-3 w-3" /> Mold Libraries</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="text-center py-12 text-zinc-500 animate-pulse">Loading products...</div>
          ) : (
            <>
              {Object.entries(grouped).map(([tab, items]) => (
                <TabsContent key={tab} value={tab}>
                  {items.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">No products in this category yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                  )}
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>

        {/* Custom Mold Request */}
        <Card className="border-zinc-700">
          <CardHeader>
            <CardTitle className="text-sm">Custom Mold Request</CardTitle>
            <CardDescription>Need a bespoke A/B canister pair for your product? Describe what you need.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Describe your part (dimensions, material, quantity, use case)..."
              value={moldRequest.description}
              onChange={e => setMoldRequest(s => ({ ...s, description: e.target.value }))}
              rows={4}
            />
            <Input
              placeholder="Contact email"
              type="email"
              value={moldRequest.email}
              onChange={e => setMoldRequest(s => ({ ...s, email: e.target.value }))}
            />
            <Button onClick={handleMoldRequest}>
              <Send className="mr-2 h-4 w-4" /> Submit Request
            </Button>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="border-zinc-700">
          <CardHeader>
            <CardTitle className="text-sm">How We Compare</CardTitle>
            <CardDescription>Canister System vs. commercial desktop injection molders</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium">System</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium">Price</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium">Max PSI</th>
                  <th className="text-center py-2 px-3 text-zinc-400 font-medium">Open Design</th>
                  <th className="text-center py-2 px-3 text-zinc-400 font-medium">Multi-Cavity</th>
                  <th className="text-center py-2 px-3 text-zinc-400 font-medium">Portable</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.name} className={`border-b border-zinc-800 ${i === 0 ? 'bg-primary/5' : ''}`}>
                    <td className="py-2 px-3 font-medium">{row.name}</td>
                    <td className="py-2 px-3">{row.price}</td>
                    <td className="py-2 px-3 font-mono">{row.maxPsi}</td>
                    <td className="py-2 px-3 text-center">{row.open ? <Check className="h-4 w-4 text-green-400 mx-auto" /> : <X className="h-4 w-4 text-zinc-600 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{row.multiCavity ? <Check className="h-4 w-4 text-green-400 mx-auto" /> : <X className="h-4 w-4 text-zinc-600 mx-auto" />}</td>
                    <td className="py-2 px-3 text-center">{row.portable ? <Check className="h-4 w-4 text-green-400 mx-auto" /> : <X className="h-4 w-4 text-zinc-600 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
