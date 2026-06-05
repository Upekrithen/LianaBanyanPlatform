/**
 * SECURITIES-CLEAN VALUATION PANEL — Wave 9 / Phase C6
 * ======================================================
 * "NOT A GUARANTEE" enforced on every instance.
 * Forex-Ratchet display, Joule exchange, Cost+20% worked example.
 *
 * Wire into MemberDashboard and any page needing valuation context.
 *
 * BP072-W9-C6
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp, Zap, Coins, AlertCircle, Lock, Info,
  ChevronRight, ArrowRight, Shield,
} from "lucide-react";

// ─── Canon ───────────────────────────────────────────────────────────────────

const CANON_MARGIN = 20; // Cost+20%
const CANON_SAVINGS = 83.3; // %

// ─── NOT A GUARANTEE Banner (required on every display) ──────────────────────

export function NotAGuaranteeTag({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-1.5 rounded border border-amber-400/40 bg-amber-400/8 px-3 py-2 ${className}`}>
      <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-700 dark:text-amber-400">
        <span className="font-semibold">NOT A GUARANTEE.</span> Valuation,
        Forex-Ratchet, and Joule displays are informational. They do not constitute
        a securities offering, guaranteed return, or investment advice. Results
        vary by member, category, and participation level.
      </p>
    </div>
  );
}

// ─── Joule Display ───────────────────────────────────────────────────────────

interface JouleDisplayProps {
  joulesBalance: number;
  compact?: boolean;
}

export function JouleDisplay({ joulesBalance, compact = false }: JouleDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-purple-500/5 px-3 py-2">
        <Zap className="h-4 w-4 text-purple-600" />
        <span className="font-bold">{joulesBalance.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">Joules</span>
        <Badge variant="outline" className="ml-auto text-[10px]">NOT A GUARANTEE</Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-5 w-5 text-purple-600" />
          Joule Balance
        </CardTitle>
        <CardDescription>Platform energy credits for compute-intensive tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center py-2">
          <p className="text-4xl font-bold text-purple-600">{joulesBalance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Joules available</p>
        </div>
        <NotAGuaranteeTag />
      </CardContent>
    </Card>
  );
}

// ─── Forex Ratchet Compact Panel ─────────────────────────────────────────────

const SEED_RATCHET_HISTORY = [
  { date: "2026-01-01", rate: 1.00, trigger: "Platform Launch" },
  { date: "2026-01-15", rate: 1.02, trigger: "First 100 Members" },
  { date: "2026-02-01", rate: 1.05, trigger: "Patent Filing #6" },
  { date: "2026-02-10", rate: 1.08, trigger: "Initiative Launch" },
  { date: "2026-02-18", rate: 1.12, trigger: "Crown Jewel Validation" },
] as const;

const CURRENT_GAP_RATE = 1.12;

interface ForexRatchetPanelProps {
  compact?: boolean;
}

export function ForexRatchetPanel({ compact = false }: ForexRatchetPanelProps) {
  const appreciation = ((CURRENT_GAP_RATE - 1) * 100).toFixed(1);

  if (compact) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-green-600" />
            GAP Rate
          </span>
          <span className="text-lg font-bold text-green-600">{CURRENT_GAP_RATE.toFixed(2)}x</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Forex Ratchet: +{appreciation}% since launch. Rate only goes up.
        </p>
        <Badge variant="outline" className="text-[10px] font-normal text-amber-600 border-amber-400/40">
          NOT A GUARANTEE
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Forex Ratchet
        </CardTitle>
        <CardDescription>
          Exchange rates captured at purchase time, locked in, ratcheting forward only
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NotAGuaranteeTag />

        <div className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Current GAP Rate</p>
            <p className="text-3xl font-bold text-green-600">{CURRENT_GAP_RATE.toFixed(2)}x</p>
          </div>
          <Badge className="bg-green-500/20 text-green-700 gap-1">
            +{appreciation}% since launch
          </Badge>
        </div>

        {/* Ratchet step chart */}
        <div className="space-y-1.5">
          {SEED_RATCHET_HISTORY.map((snap, i) => {
            const width = ((snap.rate - 1) / (CURRENT_GAP_RATE - 1)) * 100;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-20 text-muted-foreground shrink-0">
                  {new Date(snap.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-green-500/60 rounded transition-all duration-700"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono">{snap.rate.toFixed(2)}x</span>
                <span className="w-28 text-muted-foreground truncate hidden sm:block">{snap.trigger}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            The GAP rate never decreases. Once set, your locked-in rate is protected
            against any future rate reset. This is a cooperative principle, not a
            legal guarantee.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Cost+20% Worked Example ─────────────────────────────────────────────────

interface CostPlusExampleProps {
  retailPrice?: number;
  compact?: boolean;
}

export function CostPlusExample({ retailPrice = 500, compact = false }: CostPlusExampleProps) {
  const [inputPrice, setInputPrice] = useState(String(retailPrice));
  const retail = parseFloat(inputPrice) || retailPrice;
  const memberPrice = retail / (1 + CANON_MARGIN / 100);
  const savings = retail - memberPrice;

  if (compact) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Cost+{CANON_MARGIN}% Example</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">${retail.toFixed(2)}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-bold text-green-600">${memberPrice.toFixed(2)}</span>
          <span className="text-xs text-green-600">(save ${savings.toFixed(2)})</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-normal text-amber-600 border-amber-400/40">
          NOT A GUARANTEE
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Cost+{CANON_MARGIN}% Worked Example
        </CardTitle>
        <CardDescription>
          The cooperative charges exactly {CANON_MARGIN}% above wholesale cost.
          Average member savings: {CANON_SAVINGS}% across all categories.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <NotAGuaranteeTag />

        <div className="space-y-2">
          <Label htmlFor="retail-example">Retail / list price ($)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="retail-example"
              type="number"
              min={1}
              value={inputPrice}
              onChange={(e) => setInputPrice(e.target.value)}
              className="pl-7 w-40"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">${retail.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Retail price</p>
            </div>
            <div className="flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">${memberPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Member price</p>
            </div>
          </div>
          <div className="mt-3 text-center border-t pt-3">
            <p className="text-2xl font-bold text-primary">${savings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              Saved ({((savings / retail) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Formula: Member Price = Retail / (1 + {CANON_MARGIN}% ) =
          ${retail.toFixed(2)} / 1.{CANON_MARGIN} = ${memberPrice.toFixed(2)}.
          Platform keeps exactly ${(memberPrice * CANON_MARGIN / 100).toFixed(2)} (the {CANON_MARGIN}% margin).
        </p>

        <Button variant="outline" size="sm" asChild>
          <Link to="/thermometer">
            <ChevronRight className="mr-1 h-4 w-4" />
            Check my savings with the Thermometer
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Combined Securities-Clean Valuation Panel ───────────────────────────────

interface SecuritiesCleanValuationPanelProps {
  joulesBalance?: number;
  compact?: boolean;
  showForex?: boolean;
  showCostPlus?: boolean;
  showJoule?: boolean;
}

/**
 * Drop-in valuation panel. "NOT A GUARANTEE" enforced on every instance.
 * Use `compact` for inline/sidebar usage, full for dedicated sections.
 */
export function SecuritiesCleanValuationPanel({
  joulesBalance = 0,
  compact = false,
  showForex = true,
  showCostPlus = true,
  showJoule = true,
}: SecuritiesCleanValuationPanelProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        <NotAGuaranteeTag />
        {showJoule && <JouleDisplay joulesBalance={joulesBalance} compact />}
        {showForex && <ForexRatchetPanel compact />}
        {showCostPlus && <CostPlusExample compact />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NotAGuaranteeTag />
      <div className="grid gap-4 md:grid-cols-2">
        {showForex && <ForexRatchetPanel />}
        {showCostPlus && <CostPlusExample />}
      </div>
      {showJoule && joulesBalance > 0 && <JouleDisplay joulesBalance={joulesBalance} />}
    </div>
  );
}

export default SecuritiesCleanValuationPanel;
