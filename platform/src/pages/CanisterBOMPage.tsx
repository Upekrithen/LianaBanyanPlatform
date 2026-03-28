/**
 * CanisterBOMPage — S Piston BOM Reference
 * Real, buyable BOM from Pawn B26 with McMaster-Carr part numbers.
 * Innovation reference for the canister injection molding system.
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Wrench,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Scale,
  Coins,
} from "lucide-react";

const BOM_ITEMS = [
  { component: '1/2"-10 ACME Lead Screw, 3ft', partNumber: "99030A005", source: "McMaster-Carr", qty: 1, price: "$17.84", notes: "Cut to length" },
  { component: "Bronze ACME Nut (Precision)", partNumber: "1343K134", source: "McMaster-Carr", qty: 1, price: "$51.53", notes: "1,300 lb thrust rated" },
  { component: '2" Steel Round Bar (piston disc)', partNumber: "—", source: "Metal supplier", qty: 1, price: "~$15.00", notes: "Machine to disc" },
  { component: "PTFE O-Ring Dash-222", partNumber: "Dash-222", source: "McMaster-Carr", qty: 2, price: "~$7.00", notes: '2" bore seal' },
  { component: 'Steel Cylinder (2" ID, machined)', partNumber: "Custom", source: "Local shop / Xometry", qty: 1, price: "~$150.00", notes: "Thick wall" },
  { component: "Silicone Heater Band 50mm 200W", partNumber: "—", source: "AliExpress", qty: 1, price: "~$38.00", notes: "110/220V" },
  { component: "Inkbird PID ITC-106VH Kit", partNumber: "ITC-106VH", source: "Amazon/Inkbird", qty: 1, price: "~$60.00", notes: "With K-type + SSR" },
  { component: 'Thrust bearing 1/2"', partNumber: "—", source: "McMaster/Amazon", qty: 1, price: "~$15.00", notes: "Screw support" },
  { component: "Frame/brackets/misc", partNumber: "—", source: "Metal supplier", qty: 1, price: "~$40.00", notes: "Steel plate" },
];

const COMPARISONS = [
  { name: "Holipress", price: "~$800–1,200", note: "Turnkey but less customizable" },
  { name: "Alibaba Manual Press", price: "~$460–1,000", note: "Hydraulic, not screw-driven" },
  { name: "Morgan Press", price: "~$1,200+", note: "Highest-rated desktop, 5,000 PSI" },
  { name: "S Piston Prototype", price: "~$430–450", note: "Matching Morgan Press PSI at 1/3 the cost", highlight: true },
];

export default function CanisterBOMPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">

        {/* Hero */}
        <div className="text-center space-y-6 py-8">
          <Badge variant="outline" className="text-sm px-4 py-1">S Piston — Bill of Materials</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Build Your Own <span className="text-amber-500">Injection Molder</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real part numbers. Real prices. Every component you need to build the S Piston prototype for under $450.
          </p>
        </div>

        {/* BOM Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-500" /> Component Table
            </CardTitle>
            <CardDescription>All parts sourced from McMaster-Carr, Amazon, and standard metal suppliers.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Component</th>
                  <th className="pb-3 pr-4 font-medium">Part #</th>
                  <th className="pb-3 pr-4 font-medium">Source</th>
                  <th className="pb-3 pr-4 font-medium text-center">Qty</th>
                  <th className="pb-3 pr-4 font-medium text-right">Unit Price</th>
                  <th className="pb-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {BOM_ITEMS.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-4 font-medium">{item.component}</td>
                    <td className="py-3 pr-4">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.partNumber}</code>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{item.source}</td>
                    <td className="py-3 pr-4 text-center">{item.qty}</td>
                    <td className="py-3 pr-4 text-right font-mono">{item.price}</td>
                    <td className="py-3 text-muted-foreground text-xs">{item.notes}</td>
                  </tr>
                ))}
                <tr className="font-bold text-lg">
                  <td className="pt-4" colSpan={4}>TOTAL</td>
                  <td className="pt-4 text-right text-amber-500 font-mono">~$430–450</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Comparison */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">How It Compares</h2>
            <p className="text-muted-foreground">Desktop injection molding options on the market today.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {COMPARISONS.map((c) => (
              <Card
                key={c.name}
                className={c.highlight
                  ? "border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20"
                  : "border-border/50"
                }
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${c.highlight ? "bg-amber-500/10" : "bg-muted"}`}>
                    {c.highlight
                      ? <Scale className="h-5 w-5 text-amber-500" />
                      : <DollarSign className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {c.name}
                      {c.highlight && <Badge className="ml-2 bg-amber-500 text-white text-[10px]">OURS</Badge>}
                    </h3>
                    <p className="font-mono font-bold text-lg">{c.price}</p>
                    <p className="text-sm text-muted-foreground">{c.note}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-primary/20 bg-primary/5 text-center">
          <CardContent className="py-10 space-y-4">
            <Coins className="h-10 w-10 mx-auto text-amber-500" />
            <h3 className="text-2xl font-bold">Build One Yourself — Claim the Bounty</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Complete a working S Piston build and document it. Earn 500 Marks.
            </p>
            <Button size="lg" className="gap-2" onClick={() => navigate("/production")}>
              Claim the Bounty <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </PortalPageLayout>
  );
}
