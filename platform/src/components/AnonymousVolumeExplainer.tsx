/**
 * ANONYMOUS VOLUME AGGREGATION EXPLAINER
 * ========================================
 * "Anonymous Volume Aggregation means charity recipients are
 *  indistinguishable from paying customers. Dignity intact."
 *
 * This component explains the AVA system — one of the platform's
 * most compelling mechanics. Used on:
 *   - Let's Make Dinner page
 *   - Rally Group / Swoop pages
 *   - Benefits pages
 *   - How It Works sections
 *   - Crown letters and marketing materials
 *
 * Key selling points:
 *   1. Same $10 donation buys ~3x more food at volume pricing
 *   2. Recipients are indistinguishable from paying customers
 *   3. Restaurants get guaranteed volume at fair prices
 *   4. Batch pricing reduces cost-per-unit for everyone
 *   5. No means testing, no stigma, no food-shelf shame
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Users, DollarSign, Heart, Eye, EyeOff,
  TrendingDown, ArrowRight, Sparkles, ChefHat,
} from "lucide-react";

interface AVAExplainerProps {
  /** Display mode */
  variant?: "card" | "dialog" | "inline" | "compact";
  /** For dialog mode — controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show the "3x impact" comparison */
  showComparison?: boolean;
}

// The core AVA benefits — used across all variants
const AVA_BENEFITS = [
  {
    icon: EyeOff,
    title: "Indistinguishable Orders",
    description: "Charity recipients get the exact same meal, from the same restaurant, in the same packaging. Nobody — not the restaurant, not the delivery driver, not the neighbors — can tell who paid and who received a Swoop.",
    highlight: "Dignity intact.",
  },
  {
    icon: TrendingDown,
    title: "3x More Food, Same Money",
    description: "When 6 neighbors order from the same pizza shop, the platform aggregates them into one volume order. A pizza that costs $15 retail drops to ~$7.20 at Cost+20%. The same $10 donation buys nearly three meals instead of one.",
    highlight: "Same money. Triple the impact.",
  },
  {
    icon: ChefHat,
    title: "Restaurants Win Too",
    description: "Restaurants get guaranteed, predictable volume orders at fair prices — keeping 83.3% of every dollar. No 30% DoorDash cut. No algorithm deciding if they exist this week. Scheduled, predictable income.",
    highlight: "Predictable income is awesome.",
  },
  {
    icon: ShieldCheck,
    title: "No Means Testing",
    description: "No applications. No proof of income. No bureaucracy. If you need food, you get food. The platform doesn't decide who deserves to eat — the community does, through Swoop donations.",
    highlight: "No shame. No gatekeeping.",
  },
  {
    icon: Users,
    title: "Batch Pricing Benefits Everyone",
    description: "Volume aggregation doesn't just help charity recipients — it reduces prices for ALL members. When your order gets batched with your neighbors', everyone saves. Rising tide, all boats.",
    highlight: "The more people participate, the cheaper it gets for everyone.",
  },
];

// The comparison table data
const COMPARISON = {
  traditional: {
    label: "Traditional Charity",
    overhead: "30-50%",
    dignity: "Food bank stigma",
    sustainability: "Depends on grants",
    restaurantBenefit: "None (donated food)",
    scalability: "Slow (compliance, boards)",
    replicability: "Low",
  },
  mikePuckett: {
    label: "Mike's Model",
    overhead: "~0%",
    dignity: "Better (delivered pizza)",
    sustainability: "Depends on Mike",
    restaurantBenefit: "Some (orders at retail)",
    scalability: "Limited (one person)",
    replicability: "Medium",
  },
  lianaBanyan: {
    label: "LB Platform + AVA",
    overhead: "16.7% (transparent)",
    dignity: "Best (indistinguishable)",
    sustainability: "Self-sustaining",
    restaurantBenefit: "Maximum (guaranteed volume)",
    scalability: "Unlimited (infrastructure)",
    replicability: "High (blueprint system)",
  },
};

export function AnonymousVolumeExplainer({
  variant = "card",
  open = false,
  onOpenChange,
  showComparison = true,
}: AVAExplainerProps) {
  const [localOpen, setLocalOpen] = useState(false);

  const isOpen = open || localOpen;
  const handleOpenChange = onOpenChange || setLocalOpen;

  // Compact variant — single-line teaser
  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => handleOpenChange(true)}
      >
        <EyeOff className="w-4 h-4 text-green-500 flex-shrink-0" />
        <span className="text-sm">
          <strong>Anonymous Volume Aggregation:</strong> Recipients are indistinguishable from paying customers.
          Same $10 buys 3x more food.
        </span>
        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    );
  }

  // Inline variant — embedded section
  if (variant === "inline") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-lg">Anonymous Volume Aggregation</h3>
        </div>
        <p className="text-muted-foreground">
          When multiple orders go to the same restaurant, the platform batches them.
          The restaurant sees volume, not individuals. Charity recipients are
          indistinguishable from paying customers. Dignity intact.
        </p>
        {AVA_BENEFITS.slice(0, 3).map((benefit, i) => (
          <div key={i} className="flex items-start gap-3">
            <benefit.icon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sm">{benefit.title}</div>
              <div className="text-sm text-muted-foreground">{benefit.description}</div>
              <div className="text-sm font-semibold text-green-500 mt-1">{benefit.highlight}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Card variant — standalone card
  if (variant === "card") {
    return (
      <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-green-500" />
            Anonymous Volume Aggregation
          </CardTitle>
          <CardDescription>
            The mechanism that preserves dignity while multiplying impact.
            Recipients are indistinguishable from paying customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AVA_BENEFITS.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
              <benefit.icon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{benefit.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{benefit.description}</div>
                <Badge variant="outline" className="mt-2 text-green-500 border-green-500/30">
                  {benefit.highlight}
                </Badge>
              </div>
            </div>
          ))}

          {showComparison && (
            <>
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  How It Compares
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2" />
                        <th className="text-left p-2">{COMPARISON.traditional.label}</th>
                        <th className="text-left p-2">{COMPARISON.mikePuckett.label}</th>
                        <th className="text-left p-2 text-green-500 font-bold">{COMPARISON.lianaBanyan.label}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Overhead", key: "overhead" as const },
                        { label: "Dignity", key: "dignity" as const },
                        { label: "Sustainability", key: "sustainability" as const },
                        { label: "Restaurant Benefit", key: "restaurantBenefit" as const },
                        { label: "Scalability", key: "scalability" as const },
                        { label: "Replicability", key: "replicability" as const },
                      ].map((row) => (
                        <tr key={row.key} className="border-b">
                          <td className="p-2 font-medium text-muted-foreground">{row.label}</td>
                          <td className="p-2">{COMPARISON.traditional[row.key]}</td>
                          <td className="p-2">{COMPARISON.mikePuckett[row.key]}</td>
                          <td className="p-2 font-medium text-green-500">{COMPARISON.lianaBanyan[row.key]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Dialog variant
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-green-500" />
            Anonymous Volume Aggregation
          </DialogTitle>
          <DialogDescription>
            How we preserve dignity while multiplying impact.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {AVA_BENEFITS.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3">
              <benefit.icon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">{benefit.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{benefit.description}</div>
                <div className="text-sm font-semibold text-green-500 mt-1">{benefit.highlight}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => handleOpenChange(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AnonymousVolumeExplainer;
