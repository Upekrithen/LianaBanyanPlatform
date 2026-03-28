import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Wrench, Palette, ArrowRight, ArrowLeft, Save, ShoppingCart, Check, AlertTriangle, X, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { CanisterStackDiagram } from "@/components/factory/CanisterStackDiagram";
import {
  usePressureCalculator,
  useMaterialCompatibility,
  useSaveConfiguration,
  useCanisterProducts,
  useRecommendedSetup,
  MATERIALS,
  SIZE_SPECS,
  type CanisterSize,
  type PressureMethod,
  type MaterialStatus,
} from "@/hooks/useCanisterSystem";

type WorkMode = 'casting' | 'thermoplastic' | null;

const GALOMB_MAX_PSI = 1500;
const LNS_MAX_PSI = 2200;

export default function CanisterConfigurator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const saveMutation = useSaveConfiguration();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1: Work mode
  const [workMode, setWorkMode] = useState<WorkMode>(null);

  // Step 2: Configuration
  const [size, setSize] = useState<CanisterSize>('M');
  const [stackCount, setStackCount] = useState(1);
  const [method, setMethod] = useState<PressureMethod>('gravity');
  const [handleInches, setHandleInches] = useState(8);
  const [forceLbs, setForceLbs] = useState(30);
  const [weightKg, setWeightKg] = useState(20);
  const [configName, setConfigName] = useState('');

  // Auto-adjust when workMode changes
  const handleWorkModeSelect = (mode: WorkMode) => {
    setWorkMode(mode);
    if (mode === 'thermoplastic') {
      setSize('S');
      setMethod('screw_press');
      setStackCount(1);
    } else {
      setSize('M');
      setMethod('gravity');
      setStackCount(1);
    }
    setStep(2);
  };

  // Enforce stack limits
  const maxStack = method === 'screw_press' ? 3 : 6;
  const clampedStack = Math.min(stackCount, maxStack);

  // Pressure calculation
  const { psi } = usePressureCalculator(size, method, weightKg, handleInches, forceLbs);
  const materials = useMaterialCompatibility(psi);

  // Products for cost estimation
  const { data: products = [] } = useCanisterProducts();

  const costEstimate = useMemo(() => {
    let total = 0;
    const items: { name: string; price: number }[] = [];

    if (method === 'screw_press') {
      const kit = products.find(p => p.product_type === 'thermoplastic_kit');
      if (kit) { items.push({ name: kit.name, price: kit.price_usd }); total += kit.price_usd; }
    } else {
      const kit = products.find(p => p.product_type === 'gravity_kit');
      if (kit) { items.push({ name: kit.name, price: kit.price_usd }); total += kit.price_usd; }
    }

    if (clampedStack > 1) {
      const sleeve = products.find(p => p.product_type === 'sleeve' && p.size === size);
      if (sleeve) {
        const extra = clampedStack - 1;
        items.push({ name: `${extra}x ${sleeve.name}`, price: sleeve.price_usd * extra });
        total += sleeve.price_usd * extra;
      }
    }

    const pair = products.find(p => p.product_type === 'canister_pair' && p.size === size);
    if (pair) {
      items.push({ name: `${clampedStack}x ${pair.name}`, price: pair.price_usd * clampedStack });
      total += pair.price_usd * clampedStack;
    }

    return { items, total };
  }, [products, method, size, clampedStack]);

  const handleSave = async () => {
    if (!configName.trim()) {
      toast({ title: 'Name required', description: 'Give your configuration a name', variant: 'destructive' });
      return;
    }
    try {
      await saveMutation.mutateAsync({
        name: configName,
        canister_size: size,
        stack_count: clampedStack,
        pressure_method: method,
        weight_kg: method === 'gravity' ? weightKg : undefined,
        handle_length_inches: method === 'screw_press' ? handleInches : undefined,
        hand_force_lbs: method === 'screw_press' ? forceLbs : undefined,
        estimated_pressure_psi: psi,
        materials_compatible: materials.filter(m => m.status !== 'red').map(m => m.name),
        total_cost_estimate: costEstimate.total,
      });
      toast({ title: 'Configuration Saved', description: `"${configName}" saved successfully` });
      setConfigName('');
    } catch {
      toast({ title: 'Error', description: 'Could not save configuration', variant: 'destructive' });
    }
  };

  // Comparison against commercial desktop molders
  const comparison = useMemo(() => {
    if (psi >= GALOMB_MAX_PSI && psi >= LNS_MAX_PSI) {
      return { text: `Your setup achieves ${Math.round(psi).toLocaleString()} PSI — that EXCEEDS a Galomb B100 ($1,100) AND an LNS ($1,800)`, tone: 'win' as const };
    }
    if (psi >= GALOMB_MAX_PSI) {
      return { text: `Your setup achieves ${Math.round(psi).toLocaleString()} PSI — that EXCEEDS a Galomb B100 ($1,100)`, tone: 'win' as const };
    }
    if (psi > 100) {
      return { text: `Your setup achieves ${Math.round(psi).toLocaleString()} PSI — great for casting materials`, tone: 'ok' as const };
    }
    return { text: `${Math.round(psi).toLocaleString()} PSI — ideal for gravity-fed casting`, tone: 'ok' as const };
  }, [psi]);

  const statusIcon = (s: MaterialStatus) => {
    if (s === 'green') return <Check className="h-4 w-4 text-green-400" />;
    if (s === 'yellow') return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    return <X className="h-4 w-4 text-red-400" />;
  };

  const statusBg = (s: MaterialStatus) => {
    if (s === 'green') return 'bg-green-500/10 text-green-400 border-green-500/30';
    if (s === 'yellow') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  };

  // Pressure gauge arc
  const maxGauge = method === 'screw_press' ? 6000 : 200;
  const gaugePercent = Math.min(psi / maxGauge, 1);

  return (
    <PortalPageLayout title="Canister System Configurator" subtitle="Build your modular injection molding setup">
      <div className="max-w-6xl mx-auto space-y-8 p-4">

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center">
          {[1, 2, 3].map(s => (
            <button
              key={s}
              onClick={() => { if (s === 1 || workMode) setStep(s); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s ? 'bg-primary text-primary-foreground scale-110' : step > s ? 'bg-primary/30 text-primary' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* STEP 1: What do you want to make? */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What do you want to make?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card
                className={`cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/50 ${workMode === 'casting' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-zinc-700'}`}
                onClick={() => handleWorkModeSelect('casting')}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="text-5xl">
                    <Palette className="h-14 w-14 mx-auto text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold">Casting</h3>
                  <p className="text-zinc-400 text-sm">Resin, wax, silicone, ceramic slip, alloys</p>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                    Gravity mode &middot; No electricity &middot; Stack up to 6
                  </Badge>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:scale-[1.02] hover:border-blue-500/50 ${workMode === 'thermoplastic' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-700'}`}
                onClick={() => handleWorkModeSelect('thermoplastic')}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="text-5xl">
                    <Wrench className="h-14 w-14 mx-auto text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Thermoplastic</h3>
                  <p className="text-zinc-400 text-sm">PE, PP, ABS — real injection molding</p>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    Screw press &middot; S piston &middot; Up to 5,200+ PSI
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* STEP 2: Configure */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <h2 className="text-xl font-bold">Configure Your Stack</h2>
              <Button size="sm" onClick={() => setStep(3)} disabled={!size}>
                Results <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Controls */}
              <div className="space-y-6">
                {/* Size selector */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">Canister Size</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.entries(SIZE_SPECS) as [CanisterSize, typeof SIZE_SPECS[CanisterSize]][]).map(([s, spec]) => (
                      <Card
                        key={s}
                        className={`cursor-pointer transition-all hover:scale-[1.02] ${size === s ? 'ring-2' : 'border-zinc-700'}`}
                        style={size === s ? { borderColor: spec.color, boxShadow: `0 0 12px ${spec.color}33` } : {}}
                        onClick={() => {
                          setSize(s);
                          if (s === 'S' && method === 'gravity' && workMode === 'thermoplastic') setMethod('screw_press');
                          if (s !== 'S' && method === 'screw_press' && workMode === 'casting') setMethod('gravity');
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-black" style={{ color: spec.color }}>{s}</div>
                          <div className="text-xs text-zinc-400">{spec.diameter}</div>
                          <div className="text-xs text-zinc-500">{spec.maxVolume}</div>
                          <Badge variant="outline" className="mt-2 text-[10px]" style={{ borderColor: `${spec.color}44`, color: spec.color }}>
                            {spec.primaryMode}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Pressure method toggle */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">Pressure Method</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={method === 'gravity' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setMethod('gravity')}
                    >
                      Gravity
                    </Button>
                    <Button
                      variant={method === 'screw_press' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setMethod('screw_press')}
                    >
                      Screw Press
                    </Button>
                  </div>
                  {size === 'S' && method === 'screw_press' && (
                    <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> S + Screw Press = thermoplastic workhorse (up to 5,200+ PSI)
                    </p>
                  )}
                </div>

                {/* Stack count */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">
                    Stack Height: {clampedStack} canister{clampedStack > 1 ? 's' : ''}
                  </h3>
                  <Slider
                    value={[clampedStack]}
                    onValueChange={([v]) => setStackCount(v)}
                    min={1}
                    max={maxStack}
                    step={1}
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Max {maxStack} for {method === 'screw_press' ? 'screw press (pressure drop)' : 'gravity mode'}
                  </p>
                </div>

                {/* Method-specific controls */}
                {method === 'screw_press' ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">Handle Length</h3>
                      <div className="flex gap-2">
                        {[6, 8, 10].map(h => (
                          <Button
                            key={h}
                            variant={handleInches === h ? 'default' : 'outline'}
                            className="flex-1"
                            onClick={() => setHandleInches(h)}
                          >
                            {h}"
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">
                        Hand Force: {forceLbs} lbs
                      </h3>
                      <Slider
                        value={[forceLbs]}
                        onValueChange={([v]) => setForceLbs(v)}
                        min={10}
                        max={50}
                        step={5}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold mb-3 text-sm text-zinc-400 uppercase tracking-wide">
                      Weight: {weightKg} kg ({Math.round(weightKg * 2.205)} lbs)
                    </h3>
                    <Slider
                      value={[weightKg]}
                      onValueChange={([v]) => setWeightKg(v)}
                      min={5}
                      max={200}
                      step={5}
                    />
                  </div>
                )}
              </div>

              {/* Right: Visual Diagram */}
              <div className="flex flex-col items-center justify-center">
                <CanisterStackDiagram
                  size={size}
                  stackCount={clampedStack}
                  method={method}
                  handleInches={handleInches}
                  pressurePsi={psi}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Results Dashboard */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Configure
              </Button>
              <h2 className="text-xl font-bold">Results Dashboard</h2>
              <div />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pressure Gauge */}
              <Card className="border-zinc-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Achievable Pressure</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <svg viewBox="0 0 200 120" width="200" height="120">
                    {/* Background arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#333"
                      strokeWidth={12}
                      strokeLinecap="round"
                    />
                    {/* Filled arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke={psi > 3000 ? '#3b82f6' : psi > 500 ? '#22c55e' : '#f59e0b'}
                      strokeWidth={12}
                      strokeLinecap="round"
                      strokeDasharray={`${gaugePercent * 251.33} 251.33`}
                      className="transition-all duration-700"
                    />
                    <text x={100} y={85} textAnchor="middle" fontSize={28} fontWeight={800} fill="white">
                      {Math.round(psi).toLocaleString()}
                    </text>
                    <text x={100} y={105} textAnchor="middle" fontSize={12} fill="#999">PSI</text>
                  </svg>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {size} &middot; {method === 'screw_press' ? `Screw ${handleInches}"` : `${weightKg}kg`} &middot; Stack {clampedStack}
                  </Badge>
                </CardContent>
              </Card>

              {/* Comparison callout */}
              <Card className={`border-zinc-700 ${comparison.tone === 'win' ? 'bg-green-500/5 border-green-500/30' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {comparison.tone === 'win' && <Zap className="h-4 w-4 text-green-400" />}
                    Competitive Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm ${comparison.tone === 'win' ? 'text-green-400' : 'text-zinc-300'}`}>
                    {comparison.text}
                  </p>
                  {comparison.tone === 'win' && costEstimate.total > 0 && (
                    <p className="text-xs text-zinc-500 mt-3">
                      Your cost: ~${costEstimate.total} vs. Galomb $1,100 / LNS $1,800
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Cost breakdown */}
              <Card className="border-zinc-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Estimated Cost</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {costEstimate.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-zinc-400">{item.name}</span>
                      <span className="font-mono">${item.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${costEstimate.total}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Material Compatibility Table */}
            <Card className="border-zinc-700">
              <CardHeader>
                <CardTitle className="text-sm">Material Compatibility</CardTitle>
                <CardDescription>Based on {Math.round(psi).toLocaleString()} PSI achievable pressure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {materials.map(mat => (
                    <div
                      key={mat.name}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${statusBg(mat.status)}`}
                    >
                      {statusIcon(mat.status)}
                      <div className="flex-1">
                        <div className="font-medium">{mat.name}</div>
                        <div className="text-[10px] opacity-70">{mat.minPsi}–{mat.maxPsi.toLocaleString()} PSI</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase">{mat.category}</Badge>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-400" /> Full compatibility</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-400" /> Marginal — may work</span>
                  <span className="flex items-center gap-1"><X className="h-3 w-3 text-red-400" /> Insufficient pressure</span>
                </div>
              </CardContent>
            </Card>

            {/* Visual + Save + Order */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-sm">Your Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CanisterStackDiagram
                    size={size}
                    stackCount={clampedStack}
                    method={method}
                    handleInches={handleInches}
                    pressurePsi={psi}
                  />
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* Save */}
                {user && (
                  <Card className="border-zinc-700">
                    <CardHeader>
                      <CardTitle className="text-sm">Save Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Configuration name..."
                        value={configName}
                        onChange={e => setConfigName(e.target.value)}
                      />
                      <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Order CTA */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-6 text-center space-y-3">
                    <h3 className="text-lg font-bold">Ready to Build?</h3>
                    <p className="text-sm text-zinc-400">Browse the full product catalog to order kits, canisters, and add-ons.</p>
                    <Button asChild className="w-full">
                      <Link to="/factory/canister/shop">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Browse Product Catalog
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
