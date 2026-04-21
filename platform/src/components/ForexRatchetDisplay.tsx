/**
 * FOREX RATCHET DISPLAY — Currency Appreciation Mechanism
 * ========================================================
 * Shows the Forex Ratchet valuation system where exchange rates
 * are captured at purchase time, locked to the transaction, and
 * ratchet forward (never backward).
 *
 * Innovation #1239: Forex Ratchet Valuation
 * - Captures external Forex market signals at purchase time
 * - Locks the exchange rate to the transaction
 * - Ratchets forward (never backward)
 * - Maintains internal stability while reflecting external market reality
 *
 * This component visualizes:
 * - Current GAP (Generalized Appreciation Protocol) rate
 * - Historical ratchet progression
 * - User's locked-in rates on their holdings
 * - Comparison to current market rates
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  TrendingUp, Lock, ArrowUpRight, Clock, Shield,
  Coins, Sparkles, Zap, ChevronUp, Info
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface RatchetSnapshot {
  date: string;
  rate: number;
  trigger: string;
}

interface LockedRate {
  currency: "credits" | "marks" | "joules";
  amount: number;
  lockedRate: number;
  lockedAt: string;
  currentValue: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA — Initial ratchet history (supplemented by Supabase when available)
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_RATCHET_HISTORY: RatchetSnapshot[] = [
  { date: "2026-01-01", rate: 1.00, trigger: "Platform Launch" },
  { date: "2026-01-15", rate: 1.02, trigger: "First 100 Members" },
  { date: "2026-02-01", rate: 1.05, trigger: "Patent Filing #6" },
  { date: "2026-02-10", rate: 1.08, trigger: "Initiative Launch" },
  { date: "2026-02-18", rate: 1.12, trigger: "Crown Jewel Validation" },
];

const CURRENT_GAP_RATE = 1.12;

// ═══════════════════════════════════════════════════════════════════════════════
// RATCHET VISUALIZATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface RatchetVisualizationProps {
  history: RatchetSnapshot[];
  currentRate: number;
}

function RatchetVisualization({ history, currentRate }: RatchetVisualizationProps) {
  const maxRate = Math.max(...history.map(h => h.rate), currentRate) * 1.1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Ratchet History</span>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {((currentRate - 1) * 100).toFixed(1)}% appreciation
        </Badge>
      </div>

      <div className="relative h-32 border rounded-lg p-2 bg-muted/30">
        {/* Grid lines */}
        <div className="absolute inset-2 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="border-b border-dashed border-muted-foreground/20" />
          ))}
        </div>

        {/* Ratchet steps */}
        <div className="relative h-full flex items-end gap-1">
          {history.map((snapshot, index) => {
            const height = (snapshot.rate / maxRate) * 100;
            const isLatest = index === history.length - 1;

            return (
              <Tooltip key={snapshot.date}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex-1 rounded-t transition-all cursor-pointer hover:opacity-80 ${
                      isLatest
                        ? "bg-gradient-to-t from-green-500 to-green-400"
                        : "bg-gradient-to-t from-blue-500/50 to-blue-400/50"
                    }`}
                    style={{ height: `${height}%` }}
                  >
                    {isLatest && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <ChevronUp className="h-4 w-4 text-green-500 animate-bounce" />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <p className="font-bold">{snapshot.rate.toFixed(2)}x GAP</p>
                    <p>{snapshot.trigger}</p>
                    <p className="text-muted-foreground">{snapshot.date}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Key insight */}
      <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
        <Lock className="h-4 w-4 text-green-600 mt-0.5" />
        <div className="text-xs">
          <p className="font-medium text-green-700">Ratchet Never Goes Backward</p>
          <p className="text-green-600/80">
            Once the GAP rate increases, it's locked in. Your holdings can only appreciate.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOCKED RATE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface LockedRateCardProps {
  lockedRate: LockedRate;
  currentGapRate: number;
}

function LockedRateCard({ lockedRate, currentGapRate }: LockedRateCardProps) {
  const appreciation = ((currentGapRate / lockedRate.lockedRate) - 1) * 100;
  const currentValue = lockedRate.amount * (currentGapRate / lockedRate.lockedRate);

  const icons = {
    credits: <Coins className="h-4 w-4 text-yellow-600" />,
    marks: <Sparkles className="h-4 w-4 text-purple-600" />,
    joules: <Zap className="h-4 w-4 text-blue-600" />,
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icons[lockedRate.currency]}
            <span className="font-medium capitalize">{lockedRate.currency}</span>
          </div>
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            {lockedRate.lockedRate.toFixed(2)}x
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Original Amount</span>
            <span>{lockedRate.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Locked Rate</span>
            <span>{lockedRate.lockedRate.toFixed(2)}x GAP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Rate</span>
            <span className="text-green-600">{currentGapRate.toFixed(2)}x GAP</span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Value</span>
              <div className="text-right">
                <span className="font-bold text-lg">{currentValue.toFixed(0)}</span>
                <span className="text-green-600 text-sm ml-2">
                  +{appreciation.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FOREX RATCHET DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

interface ForexRatchetDisplayProps {
  compact?: boolean;
}

export function ForexRatchetDisplay({ compact = false }: ForexRatchetDisplayProps) {
  const { user } = useAuth();

  // User locked rates — will be fetched from database when forex_locked_rates table exists
  // For now, empty array until the persistence layer is built
  const lockedRates: LockedRate[] = [];

  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">GAP Rate</p>
                <p className="text-xs text-muted-foreground">Forex Ratchet</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{CURRENT_GAP_RATE.toFixed(2)}x</p>
              <p className="text-xs text-green-600/80">
                +{((CURRENT_GAP_RATE - 1) * 100).toFixed(1)}% since launch
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Forex Ratchet Valuation
          </CardTitle>
          <CardDescription>
            Exchange rates captured at purchase time, locked to your transaction, ratcheting forward only
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current GAP Rate */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Current GAP Rate</p>
              <p className="text-3xl font-bold text-green-600">{CURRENT_GAP_RATE.toFixed(2)}x</p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-500/20 text-green-700 gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {((CURRENT_GAP_RATE - 1) * 100).toFixed(1)}% appreciation
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Since platform launch</p>
            </div>
          </div>

          {/* Ratchet Visualization */}
          <RatchetVisualization history={SEED_RATCHET_HISTORY} currentRate={CURRENT_GAP_RATE} />
        </CardContent>
      </Card>

      {/* User's Locked Rates */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Your Locked Rates
            </CardTitle>
            <CardDescription>
              Each purchase locks in the GAP rate at that moment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lockedRates.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {lockedRates.map((rate) => (
                  <LockedRateCard
                    key={rate.currency}
                    lockedRate={rate}
                    currentGapRate={CURRENT_GAP_RATE}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your locked rates will appear here once you make your first purchase.</p>
                <p className="text-xs mt-1 opacity-60">
                  Today's rate: {CURRENT_GAP_RATE.toFixed(2)}x — buy now and it's locked forever.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Forex Ratchet Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-blue-500/20">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-medium">1. Capture</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                When you purchase Credits, Marks, or Joules, the current GAP rate is captured and locked to your transaction.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-green-500/20">
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-medium">2. Lock</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Your locked rate never decreases. Even if external markets fluctuate, your rate only goes up.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-purple-500/20">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="font-medium">3. Ratchet</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                As the platform grows and external signals improve, the GAP rate ratchets forward — your holdings appreciate automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForexRatchetDisplay;
