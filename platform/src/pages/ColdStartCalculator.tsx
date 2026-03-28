/**
 * ColdStartCalculator — /cold-start-calculator on DSS portal
 * D3: Interactive widget modeling node startup costs, per-unit economics, and break-even vs FormNow.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Calculator, Printer, Cog, Factory, Zap,
  TrendingUp, ArrowRight, DollarSign, Package,
  CheckCircle2
} from "lucide-react";

const EQUIPMENT = {
  sla: { name: "Form 3+ (SLA)", price: 2499, icon: Printer, color: "text-cyan-400", bg: "bg-cyan-500/10", partsPerDay: 4 },
  sls: { name: "Fuse 1+ 30W (SLS)", price: 18500, icon: Cog, color: "text-orange-400", bg: "bg-orange-500/10", moldsPerDay: 1 },
  injector: { name: "Galomb B100 (Injection)", price: 1200, icon: Factory, color: "text-emerald-400", bg: "bg-emerald-500/10", partsPerDay: 200 },
};

const FORMNOW_PER_PART = 20;
const SLA_MATERIAL_PER_PART = 1.50;
const SLS_MATERIAL_PER_MOLD = 8;
const INJECTION_MATERIAL_PER_PART = 0.15;
const MOLD_LIFESPAN = 3000;

export default function ColdStartCalculator() {
  const [slaCount, setSlaCount] = useState(1);
  const [slsCount, setSlsCount] = useState(0);
  const [injectorCount, setInjectorCount] = useState(1);

  const calc = useMemo(() => {
    const startup =
      slaCount * EQUIPMENT.sla.price +
      slsCount * EQUIPMENT.sls.price +
      injectorCount * EQUIPMENT.injector.price;

    const hasInjection = injectorCount > 0 && slsCount > 0;
    const slaOnlyCostPerPart = SLA_MATERIAL_PER_PART + 2.00;
    const injectionCostPerPart = hasInjection
      ? INJECTION_MATERIAL_PER_PART + (SLS_MATERIAL_PER_MOLD / MOLD_LIFESPAN)
      : null;

    const effectiveCostPerPart = hasInjection ? injectionCostPerPart! : slaOnlyCostPerPart;

    const dailyCapacitySLA = slaCount * EQUIPMENT.sla.partsPerDay;
    const dailyCapacityInjection = injectorCount * EQUIPMENT.injector.partsPerDay;
    const dailyCapacity = hasInjection
      ? dailyCapacitySLA + dailyCapacityInjection
      : dailyCapacitySLA;

    const weeklyCapacity = dailyCapacity * 5;

    const breakEvenUnits = effectiveCostPerPart < FORMNOW_PER_PART
      ? Math.ceil(startup / (FORMNOW_PER_PART - effectiveCostPerPart))
      : Infinity;

    const savingsAt500 = 500 * FORMNOW_PER_PART - (startup + 500 * effectiveCostPerPart);
    const savingsAt1000 = 1000 * FORMNOW_PER_PART - (startup + 1000 * effectiveCostPerPart);
    const savingsAt5000 = 5000 * FORMNOW_PER_PART - (startup + 5000 * effectiveCostPerPart);

    return {
      startup,
      effectiveCostPerPart,
      dailyCapacity,
      weeklyCapacity,
      breakEvenUnits,
      savingsAt500,
      savingsAt1000,
      savingsAt5000,
      hasInjection,
      slaOnlyCostPerPart,
      injectionCostPerPart,
    };
  }, [slaCount, slsCount, injectorCount]);

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmt2 = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-zinc-100">
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 mb-3">
              Innovation #1939
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              <Calculator className="w-8 h-8 inline mr-2 text-orange-400" />
              Cold Start <span className="text-orange-400">Calculator</span>
            </h1>
            <p className="text-zinc-400">
              Model your node configuration. See startup costs, per-unit economics, and when you break even vs FormNow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-base">Configure Your Node</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* SLA Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Printer className="w-4 h-4 text-cyan-400" />
                        SLA Printers
                      </label>
                      <span className="text-lg font-bold text-cyan-400">{slaCount}</span>
                    </div>
                    <Slider
                      value={[slaCount]}
                      onValueChange={([v]) => setSlaCount(v)}
                      min={0}
                      max={10}
                      step={1}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Form 3+ @ {fmt(EQUIPMENT.sla.price)} each
                    </p>
                  </div>

                  {/* SLS Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Cog className="w-4 h-4 text-orange-400" />
                        SLS Printers
                      </label>
                      <span className="text-lg font-bold text-orange-400">{slsCount}</span>
                    </div>
                    <Slider
                      value={[slsCount]}
                      onValueChange={([v]) => setSlsCount(v)}
                      min={0}
                      max={4}
                      step={1}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Fuse 1+ 30W @ {fmt(EQUIPMENT.sls.price)} each
                    </p>
                  </div>

                  {/* Injection Molder Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Factory className="w-4 h-4 text-emerald-400" />
                        Injection Molders
                      </label>
                      <span className="text-lg font-bold text-emerald-400">{injectorCount}</span>
                    </div>
                    <Slider
                      value={[injectorCount]}
                      onValueChange={([v]) => setInjectorCount(v)}
                      min={0}
                      max={8}
                      step={1}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Galomb B100 @ {fmt(EQUIPMENT.injector.price)} each
                    </p>
                  </div>

                  {/* Suggested Configs */}
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-zinc-500 font-medium">Quick Presets</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setSlaCount(1); setSlsCount(0); setInjectorCount(1); }}
                        className="px-2.5 py-1 rounded text-xs border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors"
                      >
                        Starter (1+0+1)
                      </button>
                      <button
                        onClick={() => { setSlaCount(3); setSlsCount(1); setInjectorCount(3); }}
                        className="px-2.5 py-1 rounded text-xs border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors"
                      >
                        Mid (3+1+3)
                      </button>
                      <button
                        onClick={() => { setSlaCount(6); setSlsCount(2); setInjectorCount(5); }}
                        className="px-2.5 py-1 rounded text-xs border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors"
                      >
                        Full Node (6+2+5)
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-3 space-y-4">
              {/* Machine Visualization */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-400">Your Node</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: slaCount }).map((_, i) => (
                      <div key={`sla-${i}`} className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center" title="SLA Printer">
                        <Printer className="w-5 h-5 text-cyan-400" />
                      </div>
                    ))}
                    {Array.from({ length: slsCount }).map((_, i) => (
                      <div key={`sls-${i}`} className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center" title="SLS Printer">
                        <Cog className="w-5 h-5 text-orange-400" />
                      </div>
                    ))}
                    {Array.from({ length: injectorCount }).map((_, i) => (
                      <div key={`inj-${i}`} className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center" title="Injection Molder">
                        <Factory className="w-5 h-5 text-emerald-400" />
                      </div>
                    ))}
                    {slaCount + slsCount + injectorCount === 0 && (
                      <p className="text-sm text-zinc-600 py-2">Add machines above to see your node.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Economics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-xl font-bold">{fmt(calc.startup)}</p>
                    <p className="text-[10px] text-zinc-500">Startup Cost</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <Package className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                    <p className="text-xl font-bold">{fmt2(calc.effectiveCostPerPart)}</p>
                    <p className="text-[10px] text-zinc-500">Cost per Part</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-violet-400" />
                    <p className="text-xl font-bold">{calc.weeklyCapacity.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-500">Units / Week</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/60 border-zinc-800">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-xl font-bold">
                      {calc.breakEvenUnits === Infinity ? "N/A" : calc.breakEvenUnits.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-500">Break-Even vs FormNow</p>
                  </CardContent>
                </Card>
              </div>

              {/* FormNow Comparison */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    Savings vs FormNow ({fmt(FORMNOW_PER_PART)}/part)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { vol: 500, savings: calc.savingsAt500 },
                      { vol: 1000, savings: calc.savingsAt1000 },
                      { vol: 5000, savings: calc.savingsAt5000 },
                    ].map(({ vol, savings }) => {
                      const positive = savings > 0;
                      const formNowTotal = vol * FORMNOW_PER_PART;
                      const nodeTotal = calc.startup + vol * calc.effectiveCostPerPart;
                      const pctSaved = formNowTotal > 0 ? ((savings / formNowTotal) * 100) : 0;
                      return (
                        <div key={vol} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                          <div>
                            <p className="text-sm font-medium">{vol.toLocaleString()} units</p>
                            <div className="flex gap-4 text-[10px] text-zinc-500">
                              <span>FormNow: {fmt(formNowTotal)}</span>
                              <span>Node: {fmt(Math.round(nodeTotal))}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>
                              {positive ? "+" : ""}{fmt(Math.round(savings))}
                            </p>
                            {positive && (
                              <p className="text-[10px] text-emerald-500">{pctSaved.toFixed(0)}% saved</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {calc.hasInjection && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Injection molding active — per-part cost drops to {fmt2(calc.injectionCostPerPart!)}
                      </p>
                    </div>
                  )}

                  {!calc.hasInjection && (injectorCount > 0 || slsCount > 0) && !(injectorCount > 0 && slsCount > 0) && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <p className="text-xs text-amber-400">
                        Add both an SLS printer and an injection molder to unlock injection molding economics.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/factory-node" className="flex-1">
                  <Button variant="outline" className="w-full border-zinc-700 text-zinc-300">
                    &larr; Factory Node Overview
                  </Button>
                </Link>
                <Link to="/production-pathways" className="flex-1">
                  <Button variant="outline" className="w-full border-zinc-700 text-zinc-300">
                    Compare Pathways
                  </Button>
                </Link>
                <Link to="/register-maker" className="flex-1">
                  <Button className="w-full bg-orange-600 hover:bg-orange-500 text-white">
                    Start a Node <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
