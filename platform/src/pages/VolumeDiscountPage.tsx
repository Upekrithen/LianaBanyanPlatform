/**
 * VolumeDiscountPage — Wave 6 Phase U
 * ======================================
 * The cooperative volume-discount pricing model.
 * Route: /factory/volume-discount
 *
 * Shows how Cost+20% interacts with volume purchasing to pass
 * savings through to members. Canon: 83.3% to workers.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calculator, TrendingDown } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface Tier {
  minUnits: number;
  maxUnits: number | null;
  discountPct: number;
  label: string;
}

const VOLUME_TIERS: Tier[] = [
  { minUnits: 1, maxUnits: 9, discountPct: 0, label: "Individual" },
  { minUnits: 10, maxUnits: 49, discountPct: 5, label: "Small Circle" },
  { minUnits: 50, maxUnits: 199, discountPct: 10, label: "Neighborhood" },
  { minUnits: 200, maxUnits: 999, discountPct: 15, label: "District" },
  { minUnits: 1000, maxUnits: 4999, discountPct: 20, label: "Regional" },
  { minUnits: 5000, maxUnits: null, discountPct: 25, label: "Network" },
];

export default function VolumeDiscountPage() {
  const navigate = useNavigate();
  const [unitCost, setUnitCost] = useState("10");
  const [units, setUnits] = useState("50");

  const cost = parseFloat(unitCost) || 0;
  const qty = parseInt(units) || 0;

  const tier = VOLUME_TIERS.find(
    (t) => qty >= t.minUnits && (t.maxUnits === null || qty <= t.maxUnits)
  ) ?? VOLUME_TIERS[0];

  const discount = tier.discountPct / 100;
  const effectiveCost = cost * (1 - discount);
  const platformPrice = effectiveCost * 1.2;
  const workerEarns = platformPrice * 0.833;
  const platformMargin = platformPrice * 0.167;

  const totalRetail = cost * 1.2 * qty;
  const totalVolume = platformPrice * qty;
  const totalSavings = totalRetail - totalVolume;

  return (
    <PortalPageLayout variant="stage" xrayId="volume-discount">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/factory/production-systems")} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Production Systems
        </Button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <TrendingDown className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold">Volume Discount Model</h1>
            <p className="text-muted-foreground">How collective buying reduces cost for everyone</p>
          </div>
        </div>

        {/* Explanation */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
            <p>
              The cooperative's volume purchasing power lowers the cost basis for goods and
              services. The savings are passed directly to members through lower Cost+20%
              prices - not retained as extra margin.
            </p>
            <p>
              <strong className="text-foreground">How it works:</strong> When a neighborhood
              of 50 households orders together, the wholesale cost drops. The lower cost means
              a lower platform price at Cost+20%. Workers still earn 83.3%.
            </p>
          </CardContent>
        </Card>

        {/* Tier Table */}
        <Card>
          <CardHeader>
            <CardTitle>Volume Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left pb-2 font-medium">Tier</th>
                    <th className="text-left pb-2 font-medium">Units</th>
                    <th className="text-right pb-2 font-medium">Cost Reduction</th>
                  </tr>
                </thead>
                <tbody>
                  {VOLUME_TIERS.map((t) => (
                    <tr
                      key={t.label}
                      className={`border-b border-border/40 ${
                        tier.label === t.label ? "bg-primary/10" : ""
                      }`}
                    >
                      <td className="py-2 font-medium">
                        {t.label}
                        {tier.label === t.label && (
                          <span className="ml-2 text-xs text-primary">(current)</span>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {t.maxUnits ? `${t.minUnits}-${t.maxUnits}` : `${t.minUnits}+`}
                      </td>
                      <td className="py-2 text-right">
                        {t.discountPct === 0 ? (
                          <span className="text-muted-foreground">No discount</span>
                        ) : (
                          <span className="text-green-400 font-medium">-{t.discountPct}% cost</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Calculator */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle>Volume Savings Calculator</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Unit direct cost ($)</label>
                <Input
                  type="number"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Number of units</label>
                <Input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  min="1"
                  step="1"
                />
              </div>
            </div>

            {cost > 0 && qty > 0 && (
              <div className="rounded-xl bg-muted/30 p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume tier</span>
                  <span className="font-medium">{tier.label} ({tier.discountPct}% reduction)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective unit cost</span>
                  <span className="font-medium">${effectiveCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform price (Cost+20%)</span>
                  <span className="font-medium">${platformPrice.toFixed(2)}/unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Worker earns (83.3%)</span>
                  <span className="font-medium text-green-400">${workerEarns.toFixed(2)}/unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform margin (16.7%)</span>
                  <span className="font-medium">${platformMargin.toFixed(2)}/unit</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total order cost</span>
                  <span>${totalVolume.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-400 font-medium">
                    <span>Saved vs. no-discount price</span>
                    <span>-${totalSavings.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => navigate("/factory/production-systems")}>
          Back to Production Systems
        </Button>
      </div>
    </PortalPageLayout>
  );
}
