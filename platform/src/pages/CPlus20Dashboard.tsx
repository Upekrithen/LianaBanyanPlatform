import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scale, Calculator, BookOpen, ShieldCheck, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { type C20Example, C20_LAWS, SAMPLE_EXAMPLES, calculateC20, fetchC20Examples } from "@/lib/c20Service";

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-green-500/20 text-green-400",
  maker: "bg-blue-500/20 text-blue-400",
  craft: "bg-amber-500/20 text-amber-400",
  service: "bg-purple-500/20 text-purple-400",
  art: "bg-pink-500/20 text-pink-400",
  education: "bg-cyan-500/20 text-cyan-400",
  game: "bg-red-500/20 text-red-400",
};

export default function CPlus20Dashboard() {
  const { user } = useAuth();
  const [costInput, setCostInput] = useState(25);
  const [examples, setExamples] = useState<C20Example[]>(SAMPLE_EXAMPLES);
  const [expandedLaw, setExpandedLaw] = useState<number | null>(null);
  const calc = calculateC20(costInput);

  useEffect(() => { fetchC20Examples().then(setExamples); }, []);

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="cplus20-dashboard">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scale className="w-8 h-8 text-green-400" />
            C+20 Reciprocity
          </h1>
          <p className="text-slate-400">Fair Pricing, Transparent Economics — Every product at Cost Plus 20%. Every penny accounted for.</p>
        </header>

        {/* Interactive Calculator */}
        <Card className="bg-slate-900/60 border-green-800/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-400" />
              Interactive Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Enter Product Cost (Ↄ‖)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={costInput}
                onChange={e => setCostInput(Math.max(0, Number(e.target.value)))}
                className="bg-slate-800 border border-slate-700 rounded px-4 py-3 text-2xl font-bold w-full max-w-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-slate-800"><p className="text-xs text-slate-400">Base Cost</p><p className="text-xl font-bold">Ↄ‖ {calc.baseCost.toFixed(2)}</p></div>
              <div className="p-3 rounded-lg bg-green-900/30 border border-green-800/40"><p className="text-xs text-green-400">C+20 Price</p><p className="text-xl font-bold text-green-400">Ↄ‖ {calc.finalPrice.toFixed(2)}</p></div>
              <div className="p-3 rounded-lg bg-slate-800"><p className="text-xs text-slate-400">Margin (20%)</p><p className="text-xl font-bold">Ↄ‖ {calc.marginAmount.toFixed(2)}</p></div>
              <div className="p-3 rounded-lg bg-slate-800"><p className="text-xs text-slate-400">Your Total</p><p className="text-xl font-bold">Ↄ‖ {(calc.baseCost + calc.marginAmount).toFixed(2)}</p></div>
            </div>

            {/* Split bar */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Margin Split Breakdown</p>
              <div className="flex h-6 rounded-full overflow-hidden">
                <div className="bg-green-500 flex items-center justify-center text-xs font-bold" style={{ width: "83.3%" }}>Creator 83.3%</div>
                <div className="bg-blue-500 flex items-center justify-center text-xs font-bold" style={{ width: "13.3%" }}></div>
                <div className="bg-amber-500 flex items-center justify-center text-xs font-bold" style={{ width: "3.4%" }}></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-green-400">Creator: Ↄ‖ {calc.creatorShare.toFixed(2)}</span>
                <span className="text-blue-400">Platform: Ↄ‖ {calc.platformShare.toFixed(2)}</span>
                <span className="text-amber-400">Gleaner's: Ↄ‖ {calc.gleanersShare.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Real Examples</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {examples.map(ex => (
              <Card key={ex.id} className="bg-slate-900/60 border-slate-800">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{ex.productName}</span>
                    <Badge className={`${CATEGORY_COLORS[ex.category] || "bg-slate-500/20 text-slate-400"} border-0 text-xs`}>{ex.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-slate-400">Ↄ‖ {ex.baseCost.toFixed(2)}</span>
                    <ArrowRight className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 font-bold">Ↄ‖ {ex.finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span className="text-green-400">Creator: Ↄ‖ {ex.creatorShare.toFixed(2)}</span>
                    <span className="text-blue-400">Platform: Ↄ‖ {ex.platformShare.toFixed(2)}</span>
                    <span className="text-amber-400">Gleaner's: Ↄ‖ {ex.gleanersShare.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* 20 Laws */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            The 20 Laws of C+20
          </h2>
          <div className="space-y-2">
            {C20_LAWS.map(law => (
              <div key={law.number} className="border border-slate-800 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedLaw(expandedLaw === law.number ? null : law.number)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-6">{law.number}.</span>
                    <span className="font-medium text-sm">{law.title}</span>
                  </div>
                  {expandedLaw === law.number ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedLaw === law.number && (
                  <div className="px-4 pb-3 pl-13">
                    <p className="text-sm text-slate-400 ml-9">{law.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* Toe-Dipping Limits */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-400" /> Toe-Dipping Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">Per-product participation limits prevent any single buyer from cornering supply.</p>
            <Card className="bg-slate-800/60 border-slate-700">
              <CardContent className="py-3">
                <p className="text-sm"><strong>Example:</strong> If Sarah makes 50 sourdough starters, no single member can buy more than 10.</p>
                <div className="mt-2 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Max 20% of total supply per member</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Dollar-for-Dollar */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Dollar-for-Dollar Margin Sacrifice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">When the cooperative reduces its margin, that savings becomes YOUR increased purchasing power.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/60 border-slate-700">
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-slate-400">Standard Split</p>
                  <p className="text-lg font-bold">Platform: 13.3%</p>
                  <p className="text-xs text-slate-400">Your Ↄ‖ 100 buys Ↄ‖ 100 worth</p>
                </CardContent>
              </Card>
              <Card className="bg-green-900/20 border-green-800/40">
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-green-400">Reduced Split</p>
                  <p className="text-lg font-bold text-green-400">Platform: 10%</p>
                  <p className="text-xs text-green-400">Your Ↄ‖ 100 buys Ↄ‖ 103.30 worth</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
