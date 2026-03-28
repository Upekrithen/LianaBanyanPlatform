import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  TrendingUp,
  Users,
  DollarSign,
  Save,
  Sparkles,
  ShieldCheck,
  Hash,
  Repeat,
} from "lucide-react";
import type { BusinessCampaign } from "@/hooks/useBusinessCampaigns";

// ─── Tier Definitions ───

const DISCOUNT_TIERS = [
  { key: "c20", label: "C+20", discount: 50, color: "bg-emerald-500", promotion: "BEST DEAL", badge: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10" },
  { key: "c40", label: "C+40", discount: 40, color: "bg-blue-500", promotion: "Great Value", badge: "text-blue-600 border-blue-500/40 bg-blue-500/10" },
  { key: "c60", label: "C+60", discount: 25, color: "bg-amber-500", promotion: "Good Deal", badge: "text-amber-600 border-amber-500/40 bg-amber-500/10" },
  { key: "c90", label: "C+90", discount: 10, color: "bg-zinc-400", promotion: "Entry", badge: "text-zinc-500 border-zinc-400/40 bg-zinc-400/10" },
] as const;

type TierKey = typeof DISCOUNT_TIERS[number]["key"];

const BUSINESS_TYPE_DEFAULTS: Record<string, number> = {
  restaurant: 15,
  food_truck: 12,
  bakery: 12,
  catering: 30,
  grocery: 20,
  convenience: 8,
  barber: 20,
  salon: 30,
  spa: 30,
  mechanic: 30,
  retail: 20,
};

// ─── Types ───

export interface PitchCOScenario {
  discountTier: TierKey;
  weeklyOrders: number;
  avgOrderValue: number;
  monthlyFrequency: number;
}

export interface PitchCOResults {
  weeklyRevenue: number;
  monthlyRevenue: number;
  markEarnings: number;
  promotionLevel: string;
  discount: number;
}

interface PitchContingencyOperatorProps {
  campaign: BusinessCampaign;
  pledgeCount?: number;
  onSaveScenario?: (scenario: PitchCOScenario & PitchCOResults) => void;
  isMember?: boolean;
}

function computeResults(s: PitchCOScenario): PitchCOResults {
  const tier = DISCOUNT_TIERS.find((t) => t.key === s.discountTier) ?? DISCOUNT_TIERS[2];
  const discountedPrice = s.avgOrderValue * (1 - tier.discount / 100);
  const weeklyRevenue = s.weeklyOrders * discountedPrice;
  const monthlyRevenue = weeklyRevenue * s.monthlyFrequency;
  const markEarnings = monthlyRevenue * 0.833;

  return {
    weeklyRevenue,
    monthlyRevenue,
    markEarnings,
    promotionLevel: tier.promotion,
    discount: tier.discount,
  };
}

export function PitchContingencyOperator({
  campaign,
  pledgeCount,
  onSaveScenario,
  isMember = false,
}: PitchContingencyOperatorProps) {
  const defaultAvg = BUSINESS_TYPE_DEFAULTS[campaign.business_type] ?? 15;
  const pCount = pledgeCount ?? campaign.pledge_count ?? 0;

  const [scenario, setScenario] = useState<PitchCOScenario>({
    discountTier: "c60",
    weeklyOrders: pCount > 0 ? pCount : 50,
    avgOrderValue: defaultAvg,
    monthlyFrequency: 4,
  });

  const results = useMemo(() => computeResults(scenario), [scenario]);

  const update = useCallback(
    (patch: Partial<PitchCOScenario>) =>
      setScenario((prev) => ({ ...prev, ...patch })),
    [],
  );

  const selectedTier = DISCOUNT_TIERS.find((t) => t.key === scenario.discountTier)!;

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Business Research Tool</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Explore scenarios for {campaign.business_name}
            </p>
          </div>
          {pCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {pCount} waiting
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* ── Screen 1: Results FIRST (above fold on mobile) ── */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-3 border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Scenario Results
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              label="Monthly Revenue"
              value={results.monthlyRevenue}
              prefix="$"
              highlight
            />
            <ResultCard
              label="Annual Projection"
              value={results.monthlyRevenue * 12}
              prefix="$"
            />
            <ResultCard
              label="Monthly Owner Earnings"
              value={results.markEarnings}
              prefix="$"
              sub="(83.3%)"
            />
            <ResultCard
              label="Promotion Level"
              text={results.promotionLevel}
              badgeClass={selectedTier.badge}
            />
          </div>

          {pCount > 0 && (
            <p className="text-sm text-center text-muted-foreground pt-1">
              <strong className="text-foreground">{pCount}</strong> customers
              already waiting for {campaign.business_name}
            </p>
          )}
        </div>

        {/* ── Discount Tier Selector (buttons — kept as the ONE visual selector) ── */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            Discount Tier
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DISCOUNT_TIERS.map((tier) => (
              <button
                key={tier.key}
                onClick={() => update({ discountTier: tier.key })}
                className={`rounded-lg p-2 text-center border-2 transition-all text-xs sm:text-sm ${
                  scenario.discountTier === tier.key
                    ? `${tier.badge} border-current font-bold shadow-sm`
                    : "border-border text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                <div className="font-bold">{tier.label}</div>
                <div className="text-[10px] opacity-70">~{tier.discount}% off</div>
              </button>
            ))}
          </div>
          <Badge className={selectedTier.badge + " mt-1"}>
            {selectedTier.promotion === "BEST DEAL" && <Sparkles className="w-3 h-3 mr-1" />}
            Platform Promotion: {selectedTier.promotion}
          </Badge>
        </div>

        {/* ── Numeric Inputs (replacing sliders) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              Pledge Count
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={10000}
              value={scenario.weeklyOrders}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 0) update({ weeklyOrders: v });
              }}
              className="font-mono text-lg h-12"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Avg Order Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                step={1}
                value={scenario.avgOrderValue}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v >= 0) update({ avgOrderValue: v });
                }}
                className="font-mono text-lg h-12 pl-7"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2">
              <Repeat className="w-4 h-4 text-muted-foreground" />
              Orders / Month
            </label>
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={30}
                step={1}
                value={scenario.monthlyFrequency}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0) update({ monthlyFrequency: v });
                }}
                className="font-mono text-lg h-12"
              />
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-sm text-muted-foreground italic">
            Curious what happens if you adjust the numbers? Try different scenarios.
          </p>
          <Button
            className="gap-2"
            onClick={() =>
              onSaveScenario?.({ ...scenario, ...results })
            }
          >
            <Save className="w-4 h-4" />
            Save This Scenario
          </Button>
          {!isMember && (
            <p className="text-xs text-muted-foreground">
              Saved scenarios expire in 24 hours.{" "}
              <span className="text-primary font-medium">
                Members keep scenarios permanently ($5/year).
              </span>
            </p>
          )}
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-[10px] text-muted-foreground text-center leading-tight pt-2 border-t">
          This business research tool provides hypothetical scenario analysis
          only. Actual results depend on market conditions, customer behavior,
          and operational factors. This is not a financial projection.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Sub-component ───

function ResultCard({
  label,
  value,
  prefix,
  text,
  highlight,
  badgeClass,
  sub,
}: {
  label: string;
  value?: number;
  prefix?: string;
  text?: string;
  highlight?: boolean;
  badgeClass?: string;
  sub?: string;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${
        highlight
          ? "bg-emerald-500/10 border border-emerald-500/30"
          : "bg-background border"
      }`}
    >
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      {text ? (
        <Badge className={badgeClass}>
          {text === "BEST DEAL" && <Sparkles className="w-3 h-3 mr-1" />}
          {text}
        </Badge>
      ) : (
        <>
          <p
            className={`text-xl sm:text-2xl font-bold font-mono ${
              highlight ? "text-emerald-600 dark:text-emerald-400" : ""
            }`}
          >
            {prefix}
            {(value ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          {sub && (
            <p className="text-[10px] text-muted-foreground">{sub}</p>
          )}
        </>
      )}
    </div>
  );
}

export default PitchContingencyOperator;
