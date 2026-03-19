/**
 * PRE-ORDER FLOW — Multi-step pledge commitment
 * ===============================================
 * Browse items → Select quantities → Review cost breakdown → Commit pledge
 * Fetches items + pricing from founding_run_items at the current production level.
 * Falls back to hardcoded sample data if Supabase is unavailable.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  CheckCircle,
  ShieldCheck,
  Package,
  DollarSign,
  Heart,
  Truck,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PreOrderItem {
  id: string;
  name: string;
  description: string;
  unitCost: number;
  costBreakdown: { materials: number; production: number; shipping: number; platform: number };
}

const SAMPLE_ITEMS: PreOrderItem[] = [
  {
    id: "starter-set",
    name: "Starter Set — 6 Miniatures",
    description: "Kai, Mira, Zephyr, Flint, Coral, Sage. Unpainted resin.",
    unitCost: 35,
    costBreakdown: { materials: 15.75, production: 7, shipping: 5.25, platform: 7 },
  },
  {
    id: "island-tiles",
    name: "Island Hex Tiles (Set of 12)",
    description: "Modular terrain tiles. Interlocking PLA+.",
    unitCost: 25,
    costBreakdown: { materials: 11.25, production: 5, shipping: 3.75, platform: 5 },
  },
  {
    id: "slotted-top",
    name: "Slotted Top — Signature Piece",
    description: "Hex-slot spinning top with brass insert.",
    unitCost: 15,
    costBreakdown: { materials: 6.75, production: 3, shipping: 2.25, platform: 3 },
  },
  {
    id: "full-collection",
    name: "Full Founding Collection",
    description: "Everything + Pioneer paint guide, stand, Founder's Wall.",
    unitCost: 85,
    costBreakdown: { materials: 38.25, production: 17, shipping: 12.75, platform: 17 },
  },
];

const LEVEL_NAMES = ['', 'SLA Prototyping', 'FDM Short Run', 'SLS Printing', 'Desktop Injection', 'Factory Tooling', 'Mass Production'];

const STEPS = [
  { step: 1, title: "Select Items" },
  { step: 2, title: "Review Cost" },
  { step: 3, title: "Commit Pledge" },
];

export default function PreOrderFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePioneer, setAgreePioneer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ITEMS, setItems] = useState<PreOrderItem[]>(SAMPLE_ITEMS);
  const [productionLevel, setProductionLevel] = useState(1);
  const [runId, setRunId] = useState<string>("00000000-0000-0000-0000-000000000001");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRunItems();
  }, []);

  const fetchRunItems = async () => {
    try {
      const { data: run } = await supabase
        .from("founding_runs")
        .select("id, current_production_level")
        .eq("status", "funding")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!run) { setLoading(false); return; }

      setRunId(run.id);
      const level = run.current_production_level ?? 1;
      setProductionLevel(level);

      const { data: items } = await supabase
        .from("founding_run_items")
        .select("id, item_key, name, description, unit_cost, cost_materials, cost_production, cost_shipping, cost_platform, sort_order")
        .eq("run_id", run.id)
        .order("sort_order", { ascending: true });

      if (!items || items.length === 0) { setLoading(false); return; }

      // Try to get tier-specific pricing for the current production level
      const itemIds = items.map(i => i.id);
      const { data: tiers } = await supabase
        .from("founding_run_item_tiers")
        .select("item_id, unit_cost, cost_materials, cost_production, cost_shipping, cost_platform")
        .in("item_id", itemIds)
        .eq("production_level", level);

      const tierMap = new Map(tiers?.map(t => [t.item_id, t]) ?? []);

      const mapped: PreOrderItem[] = items.map(item => {
        const tier = tierMap.get(item.id);
        const cost = tier?.unit_cost ?? item.unit_cost;
        const mat = tier?.cost_materials ?? item.cost_materials ?? cost * 0.45;
        const prod = tier?.cost_production ?? item.cost_production ?? cost * 0.20;
        const ship = tier?.cost_shipping ?? item.cost_shipping ?? cost * 0.15;
        const plat = tier?.cost_platform ?? item.cost_platform ?? cost * 0.20;
        return {
          id: item.item_key || item.id,
          name: item.name,
          description: item.description || "",
          unitCost: Number(cost),
          costBreakdown: {
            materials: Number(mat),
            production: Number(prod),
            shipping: Number(ship),
            platform: Number(plat),
          },
        };
      });

      setItems(mapped);
    } catch (err) {
      console.warn("PreOrderFlow: using sample data", err);
    } finally {
      setLoading(false);
    }
  };

  const setQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const selectedItems = ITEMS.filter((item) => (quantities[item.id] ?? 0) > 0);
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.unitCost * (quantities[item.id] ?? 0),
    0,
  );
  const totalBreakdown = selectedItems.reduce(
    (acc, item) => {
      const qty = quantities[item.id] ?? 0;
      return {
        materials: acc.materials + item.costBreakdown.materials * qty,
        production: acc.production + item.costBreakdown.production * qty,
        shipping: acc.shipping + item.costBreakdown.shipping * qty,
        platform: acc.platform + item.costBreakdown.platform * qty,
      };
    },
    { materials: 0, production: 0, shipping: 0, platform: 0 },
  );

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return selectedItems.length > 0;
      case 2:
        return true;
      case 3:
        return agreeTerms && agreePioneer;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const orderItems = selectedItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: quantities[item.id] ?? 0,
        unitCost: item.unitCost,
      }));

      const { data, error } = await supabase.functions.invoke("create-preorder-checkout", {
        body: { items: orderItems, run_id: runId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => navigate("/hexisle/founding-run")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Founding Run
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Pre-Order — Founding Run #1
          </h1>
          <p className="text-muted-foreground">
            Select your items, review where every dollar goes, commit your
            pledge.
          </p>
          {productionLevel > 0 && (
            <Badge variant="outline" className="text-xs">
              Production Level {productionLevel}: {LEVEL_NAMES[productionLevel] || 'Unknown'} — Prices reflect current manufacturing tier
            </Badge>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Progress */}
        {!loading && (<>
        <div className="space-y-3">
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className={`text-center flex-1 ${s.step <= currentStep ? "text-green-500" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                    s.step < currentStep
                      ? "bg-green-500 text-white"
                      : s.step === currentStep
                        ? "bg-green-500/20 text-green-500 border-2 border-green-500"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.step < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    s.step
                  )}
                </div>
                <p className="text-xs">{s.title}</p>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Step {currentStep}: {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ── Step 1: Select Items ── */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {ITEMS.map((item) => {
                  const qty = quantities[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                        qty > 0
                          ? "border-green-500 bg-green-500/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <p className="text-green-500 font-bold mt-1">
                          ${item.unitCost}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setQty(item.id, -1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                          disabled={qty === 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty(item.id, 1)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {selectedItems.length > 0 && (
                  <div className="text-right text-lg font-bold">
                    Total: ${totalAmount}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Review Cost Breakdown ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Here's exactly where your ${totalAmount} goes. No hidden
                  fees. No mystery markup.
                </p>
                {selectedItems.map((item) => {
                  const qty = quantities[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-card border rounded-lg space-y-2"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          {item.name} &times; {qty}
                        </span>
                        <span className="font-bold">
                          ${item.unitCost * qty}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <span>
                          Materials: ${(item.costBreakdown.materials * qty).toFixed(2)}
                        </span>
                        <span>
                          Production: ${(item.costBreakdown.production * qty).toFixed(2)}
                        </span>
                        <span>
                          Shipping: ${(item.costBreakdown.shipping * qty).toFixed(2)}
                        </span>
                        <span className="text-green-500">
                          Platform: ${(item.costBreakdown.platform * qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <Package className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="font-bold">
                        ${totalBreakdown.materials.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Materials
                      </p>
                    </div>
                    <div>
                      <Users className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                      <p className="font-bold">
                        ${totalBreakdown.production.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Production
                      </p>
                    </div>
                    <div>
                      <Truck className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                      <p className="font-bold">
                        ${totalBreakdown.shipping.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shipping
                      </p>
                    </div>
                    <div>
                      <Heart className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <p className="font-bold">
                        ${totalBreakdown.platform.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        16 Initiatives
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-2xl font-bold">${totalAmount}</p>
                    <p className="text-xs text-muted-foreground">
                      Total pledge amount
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Commit Pledge ── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-4 bg-card border rounded-lg space-y-2">
                  <p className="font-semibold">Your Pledge Summary</p>
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.name} &times; {quantities[item.id]}
                      </span>
                      <span>${item.unitCost * (quantities[item.id] ?? 0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t mt-2">
                    <span>Total</span>
                    <span>${totalAmount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={agreePioneer}
                      onCheckedChange={(c) => setAgreePioneer(c === true)}
                    />
                    <Label className="text-sm">
                      I understand this is a Founding Run — estimated delivery
                      8–12 weeks from funding. Timelines may shift and I'll be
                      notified via the Build Journal.
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={agreeTerms}
                      onCheckedChange={(c) => setAgreeTerms(c === true)}
                    />
                    <Label className="text-sm">
                      I agree to the pre-order terms. Funds are held until the
                      production threshold is met. Full refund available if
                      threshold is not reached.
                    </Label>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Your pledge is a commitment to purchase when production
                    begins. If the funding threshold isn't met, you get a full
                    refund. You're building the playbook — thank you, Pioneer.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              currentStep === 1
                ? navigate("/hexisle/founding-run")
                : setCurrentStep((s) => s - 1)
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />{" "}
            {currentStep === 1 ? "Back" : "Previous"}
          </Button>
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="bg-green-600 hover:bg-green-500"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              {submitting
                ? "Committing..."
                : `Commit Pledge — $${totalAmount}`}
            </Button>
          )}
        </div>
        </>)}
      </div>
    </div>
  );
}
