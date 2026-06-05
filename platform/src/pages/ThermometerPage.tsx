/**
 * THERMOMETER PAGE â€” Wave 9 / Phase C3
 * ======================================
 * Trust-building tool from the Scott letter: grantees/members self-verify
 * savings against their own books.
 *
 * Input: user's current costs / savings
 * Output: comparison against 83.3% / Cost+20% canon figures
 *
 * "NOT A GUARANTEE â€” your results may vary" prominently displayed.
 * Securities-clean throughout.
 *
 * BP072-W9-C3
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { usePageSEO } from "@/hooks/usePageSEO";
import {
  Thermometer, TrendingUp, AlertCircle, ShieldCheck, Calculator,
  ExternalLink, RotateCcw, ChevronRight, Info,
} from "lucide-react";

// â”€â”€â”€ Canon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CANON_SAVINGS_RATE = 83.3; // %
const CANON_PLATFORM_MARGIN = 20; // Cost+20%

// Thermometer reading zones
function getZone(userRate: number): {
  label: string;
  color: string;
  description: string;
  bgClass: string;
  borderClass: string;
} {
  if (userRate >= 80) return {
    label: "Exceptional",
    color: "text-green-600",
    bgClass: "bg-green-500",
    borderClass: "border-green-500/40",
    description: "Your savings are at or above the platform average. You are getting full cooperative value.",
  };
  if (userRate >= 60) return {
    label: "Strong",
    color: "text-blue-600",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-500/40",
    description: "Solid cooperative savings. A few categories may have room to improve.",
  };
  if (userRate >= 40) return {
    label: "Moderate",
    color: "text-amber-600",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-500/40",
    description: "You are saving meaningfully but there is more value to unlock.",
  };
  return {
    label: "Early Stage",
    color: "text-red-500",
    bgClass: "bg-red-500",
    borderClass: "border-red-500/40",
    description: "Savings are below typical levels. Review your spending categories with the platform tools.",
  };
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface CalculationResult {
  yourSavingsRate: number;
  yourAnnualSavings: number;
  canonSavings: number;
  deltaVsCanon: number;
  memberCostExample: number;
}

function calculate(
  retailSpend: number,
  actualSpend: number
): CalculationResult | null {
  if (retailSpend <= 0 || actualSpend < 0 || actualSpend > retailSpend) return null;

  const yourAnnualSavings = retailSpend - actualSpend;
  const yourSavingsRate = (yourAnnualSavings / retailSpend) * 100;
  const canonSavings = (CANON_SAVINGS_RATE / 100) * retailSpend;
  const deltaVsCanon = yourSavingsRate - CANON_SAVINGS_RATE;

  // Cost+20% example for their spend level
  const memberCostExample = actualSpend / (1 + CANON_PLATFORM_MARGIN / 100);

  return {
    yourSavingsRate,
    yourAnnualSavings,
    canonSavings,
    deltaVsCanon,
    memberCostExample,
  };
}

export default function ThermometerPage() {
  usePageSEO({
    title: "Thermometer | Liana Banyan",
    description: "Platform launch progress thermometer. Track the Liana Banyan cooperative path to full community funding and launch.",
    canonical: "https://lianabanyan.com/thermometer",
  });
  const { t } = useTranslation();
  const [retailSpend, setRetailSpend] = useState<string>("");
  const [actualSpend, setActualSpend] = useState<string>("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [attempted, setAttempted] = useState(false);

  const handleCalculate = useCallback(() => {
    setAttempted(true);
    const retail = parseFloat(retailSpend.replace(/,/g, ""));
    const actual = parseFloat(actualSpend.replace(/,/g, ""));
    setResult(calculate(retail, actual));
  }, [retailSpend, actualSpend]);

  const handleReset = () => {
    setRetailSpend("");
    setActualSpend("");
    setResult(null);
    setAttempted(false);
  };

  const zone = result ? getZone(result.yourSavingsRate) : null;
  const inputsValid =
    retailSpend !== "" &&
    actualSpend !== "" &&
    !isNaN(parseFloat(retailSpend)) &&
    !isNaN(parseFloat(actualSpend));

  return (
    <PortalPageLayout maxWidth="lg" xrayId="thermometer">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Thermometer className="h-7 w-7 text-orange-500" />
            Savings Thermometer
          </h1>
          <p className="mt-1 text-muted-foreground">
            Self-verify your savings against your own books. Compare to the platform{" "}
            {CANON_SAVINGS_RATE}% average.
          </p>
        </div>

        {/* Prominent disclaimer */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              NOT A GUARANTEE â€” your results may vary.
            </p>
            <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
              This calculator uses figures you enter. The platform {CANON_SAVINGS_RATE}% average is
              a historical verified figure across all categories, not a minimum or promise.
              Individual savings depend on category, volume, and supplier agreements.
              This tool is for self-verification only and does not constitute a financial
              projection, investment claim, or guaranteed outcome.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Enter Your Numbers
            </CardTitle>
            <CardDescription>
              Use your actual books. No data is stored or transmitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="retail-spend">
                  What you would have paid (retail / list price)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="retail-spend"
                    type="number"
                    min={0}
                    placeholder="e.g. 10000"
                    value={retailSpend}
                    onChange={(e) => setRetailSpend(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The retail/list price you would have paid without membership
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual-spend">
                  What you actually paid (member price)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="actual-spend"
                    type="number"
                    min={0}
                    placeholder="e.g. 1670"
                    value={actualSpend}
                    onChange={(e) => setActualSpend(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  What you actually paid as a cooperative member
                </p>
              </div>
            </div>

            {attempted && inputsValid && !result && (
              <p className="text-sm text-red-500">
                Actual spend cannot exceed retail spend. Please check your numbers.
              </p>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCalculate} disabled={!inputsValid} className="flex-1 sm:flex-none">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate My Savings
              </Button>
              {result && (
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && zone && (
          <>
            {/* Thermometer Visual */}
            <Card className={`border-2 ${zone.borderClass}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Thermometer className={`h-5 w-5 ${zone.color}`} />
                    Your Savings Reading
                  </span>
                  <Badge className={`${zone.color} border ${zone.borderClass} bg-transparent`}>
                    {zone.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Big number */}
                <div className="text-center py-4">
                  <p className={`text-6xl font-bold tabular-nums ${zone.color}`}>
                    {result.yourSavingsRate.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground mt-2">Your savings rate</p>
                </div>

                {/* Thermometer bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="font-medium">Platform avg: {CANON_SAVINGS_RATE}%</span>
                    <span>100%</span>
                  </div>
                  <div className="relative h-6 rounded-full bg-muted overflow-hidden">
                    {/* Canon marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-primary z-10"
                      style={{ left: `${CANON_SAVINGS_RATE}%` }}
                    />
                    {/* Your bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${zone.bgClass}`}
                      style={{ width: `${Math.min(100, result.yourSavingsRate)}%` }}
                    />
                  </div>
                  <div
                    className="text-xs text-muted-foreground"
                    style={{ marginLeft: `${Math.min(95, result.yourSavingsRate)}%` }}
                  >
                    You
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{zone.description}</p>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-5 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    ${result.yourAnnualSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Your savings (entered period)</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    ${result.canonSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Platform avg savings ({CANON_SAVINGS_RATE}%) on same spend</p>
                </CardContent>
              </Card>

              <Card className="sm:col-span-2 lg:col-span-1">
                <CardContent className="pt-5 text-center">
                  <p className={`text-3xl font-bold tabular-nums ${result.deltaVsCanon >= 0 ? "text-green-600" : "text-amber-600"}`}>
                    {result.deltaVsCanon >= 0 ? "+" : ""}{result.deltaVsCanon.toFixed(1)}pp
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    vs platform average ({result.deltaVsCanon >= 0 ? "above" : "below"})
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cost+20% context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4" />
                  Cost+{CANON_PLATFORM_MARGIN}% Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  The cooperative's Cost+{CANON_PLATFORM_MARGIN}% model means the platform charges
                  exactly {CANON_PLATFORM_MARGIN}% above cost. Based on your actual spend, your implied
                  underlying cost is approximately{" "}
                  <span className="font-semibold">
                    ${result.memberCostExample.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>.
                </p>
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    NOT A GUARANTEE. These calculations are based on your self-reported figures.
                    Verify against your own accounts receivable / payable records.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild variant="outline">
                <Link to="/metrics">
                  <TrendingUp className="mr-1.5 h-4 w-4" />
                  View Full Platform Metrics
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/proofs">
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  Verification Posters
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/speak-friend">
                  <ChevronRight className="mr-1.5 h-4 w-4" />
                  Ask About Membership
                </Link>
              </Button>
            </div>
          </>
        )}

        {/* Info cards â€” always visible */}
        {!result && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <p className="font-medium">Platform Average</p>
                </div>
                <p className="text-4xl font-bold">{CANON_SAVINGS_RATE}%</p>
                <p className="text-sm text-muted-foreground">
                  Verified savings rate across all categories and members.
                  Enter your own numbers above to see how you compare.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <p className="font-medium">Cost+{CANON_PLATFORM_MARGIN}% Model</p>
                </div>
                <p className="text-4xl font-bold">+{CANON_PLATFORM_MARGIN}%</p>
                <p className="text-sm text-muted-foreground">
                  Fixed, transparent platform margin above wholesale cost.
                  A $500 retail item costs a member approximately $416.67.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
