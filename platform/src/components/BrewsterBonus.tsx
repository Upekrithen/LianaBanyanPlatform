/**
 * BREWSTER BONUS — Visual Dashboard Component
 * ===============================================
 * Displays the participant's Brewster Bonus progress,
 * tier breakdown, and bonus calculations.
 *
 * Variants:
 *   "dashboard" — Full dashboard with tier ladder + progress
 *   "compact"   — Mini badge for portfolio/wallet display
 *   "card"      — Explainer card for landing pages
 *   "cue-card"  — QR-optimized summary for Cue Card export
 *
 * Innovation #1424 — The Brewster Bonus Mechanic
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Flame, Zap, TrendingUp, Gift, Award, Info,
  ChevronRight, ArrowRight, Shield,
} from 'lucide-react';
import {
  BREWSTER_TIERS,
  calculateBrewsterBonus,
  getCurrentTier,
  getNextTier,
  getTierProgress,
  formatBonus,
  getBrewsterMessage,
  type BrewsterTier,
  type BrewsterBonusResult,
} from '@/lib/brewsterBonus';
import { CurrencyGlyph, CurrencyAmount, Anvil } from '@/components/CreditSymbol';

// ============================================================================
// TIER COLORS (Tailwind)
// ============================================================================

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-500',  glow: 'shadow-amber-500/20' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', glow: 'shadow-orange-500/20' },
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-500',    glow: 'shadow-red-500/20' },
  rose:   { bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   text: 'text-rose-500',   glow: 'shadow-rose-500/20' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500', glow: 'shadow-purple-500/20' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-500', glow: 'shadow-indigo-500/20' },
};

// ============================================================================
// VARIANTS
// ============================================================================

interface BrewsterBonusProps {
  /** How many Marks the user has deployed and cleared */
  marksCleared?: number;
  /** Total Marks currently backed (for progress calculation) */
  totalMarksBacked?: number;
  /** Whether the Mark Pouch is fully empty */
  isFullyClear?: boolean;
  /** Display variant */
  variant?: 'dashboard' | 'compact' | 'card' | 'cue-card';
  /** Optional className */
  className?: string;
}

export function BrewsterBonus({
  marksCleared = 0,
  totalMarksBacked = 0,
  isFullyClear = false,
  variant = 'dashboard',
  className = '',
}: BrewsterBonusProps) {
  const result = useMemo(
    () => calculateBrewsterBonus(marksCleared, isFullyClear),
    [marksCleared, isFullyClear],
  );

  const currentTier = getCurrentTier(marksCleared);
  const nextTier = getNextTier(marksCleared);
  const progress = getTierProgress(marksCleared);

  if (variant === 'compact') {
    return <CompactBadge tier={currentTier} bonus={result.totalBonus} className={className} />;
  }

  if (variant === 'cue-card') {
    return <CueCardView result={result} className={className} />;
  }

  if (variant === 'card') {
    return <ExplainerCard className={className} />;
  }

  // Dashboard (default)
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className={`h-2 ${currentTier.color === 'amber' ? 'bg-amber-500' : currentTier.color === 'orange' ? 'bg-orange-500' : currentTier.color === 'red' ? 'bg-red-500' : currentTier.color === 'rose' ? 'bg-rose-500' : currentTier.color === 'purple' ? 'bg-purple-500' : 'bg-indigo-500'}`} />
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{currentTier.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                Brewster Bonus
                <Badge variant="outline" className={TIER_COLORS[currentTier.color]?.text}>
                  {currentTier.displayName}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {getBrewsterMessage(marksCleared, totalMarksBacked)}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Bonus Display */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <div className="text-sm text-muted-foreground">Current Bonus</div>
              <div className="text-3xl font-bold flex items-center gap-1">
                <Anvil size={28} />
                {formatBonus(result.totalBonus)}
                <span className="text-sm font-normal text-muted-foreground ml-1">Credits</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Marks Cleared</div>
              <div className="text-2xl font-bold">
                {marksCleared.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  Progress to {nextTier.displayName}
                </span>
                <span className="font-medium">
                  {marksCleared.toLocaleString()} / {nextTier.minMarks.toLocaleString()}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {(nextTier.minMarks - marksCleared).toLocaleString()} Marks to go
              </div>
            </div>
          )}

          {/* Key Quote */}
          <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-500/5 rounded-r-lg">
            <p className="text-sm italic text-muted-foreground">
              "This is not a speculative return. It's a loyalty-driven volume discount
              passed back as platform currency."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tier Ladder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Tier Ladder
          </CardTitle>
          <CardDescription>
            Bonus rates DECAY with volume — rewarding participation, not accumulation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BREWSTER_TIERS.map((tier, i) => {
              const achieved = marksCleared >= tier.minMarks;
              const isCurrent = tier.id === currentTier.id;
              const colors = TIER_COLORS[tier.color] || TIER_COLORS.amber;
              const tierResult = result.tierBreakdown[i];

              return (
                <div
                  key={tier.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCurrent
                      ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                      : achieved
                        ? `${colors.bg} ${colors.border} opacity-80`
                        : 'bg-muted/20 border-transparent opacity-50'
                  }`}
                >
                  <span className="text-2xl w-8 text-center">{tier.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{tier.displayName}</span>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-[10px]">CURRENT</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tier.description}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-mono font-bold">
                      {tier.bonusRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ≥{tier.minMarks.toLocaleString()} Marks
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 w-20">
                    {tierResult?.achieved ? (
                      <div className="text-sm font-medium flex items-center gap-0.5">
                        <Anvil size={12} />
                        {formatBonus(tierResult.bonusFromTier)}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              step={1}
              title="Back Your Marks"
              description="Lock Joules 1:1 as collateral. This declares your productive capacity."
              icon="🔒"
            />
            <StepCard
              step={2}
              title="Deploy & Deliver"
              description="Use Marks for bidding, trading, backing projects. Do the work."
              icon="⚡"
            />
            <StepCard
              step={3}
              title="Clear & Collect"
              description="Empty your Mark Pouch completely. Receive your Brewster Bonus in Credits."
              icon="🎁"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                <Shield className="w-4 h-4" />
                What It IS
              </h4>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Loyalty reward (like Costco rebate)</li>
                <li>• Funded by real volume savings</li>
                <li>• Paid in closed-loop Credits</li>
                <li>• Decaying returns at higher tiers</li>
                <li>• Requires YOUR productive effort</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600">
                <Info className="w-4 h-4" />
                What It Is NOT
              </h4>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Not a speculative return</li>
                <li>• Not speculative appreciation</li>
                <li>• Not funded by new members' money</li>
                <li>• Not redeemable for cash</li>
                <li>• Not a security under any Howey analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StepCard({ step, title, description, icon }: {
  step: number;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">Step {step}</div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
    </div>
  );
}

function CompactBadge({ tier, bonus, className }: {
  tier: BrewsterTier;
  bonus: number;
  className?: string;
}) {
  const colors = TIER_COLORS[tier.color] || TIER_COLORS.amber;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors.bg} ${colors.border} ${className}`}>
      <span className="text-sm">{tier.icon}</span>
      <span className={`text-xs font-semibold ${colors.text}`}>{tier.displayName}</span>
      {bonus > 0 && (
        <>
          <Separator orientation="vertical" className="h-3" />
          <span className="text-xs font-mono flex items-center gap-0.5">
            <Anvil size={10} />{formatBonus(bonus)}
          </span>
        </>
      )}
    </div>
  );
}

function CueCardView({ result, className }: {
  result: BrewsterBonusResult;
  className?: string;
}) {
  return (
    <div className={`p-6 space-y-4 max-w-sm ${className}`}>
      <div className="text-center">
        <h2 className="text-xl font-bold">The Brewster Bonus</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Clear your Marks. Get rewarded.
        </p>
      </div>

      <div className="space-y-2">
        {BREWSTER_TIERS.map(tier => (
          <div key={tier.id} className="flex items-center justify-between text-sm">
            <span>{tier.icon} {tier.displayName}</span>
            <span className="font-mono">{tier.bonusRate}% on ≥{tier.minMarks.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="text-center text-xs text-muted-foreground italic">
        "Not a speculative return. A loyalty-driven
        volume discount passed back as platform currency."
      </div>

      <div className="text-center text-[10px] text-muted-foreground">
        Scan QR for full details • lianabanyan.com/brewster
      </div>
    </div>
  );
}

function ExplainerCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          The Brewster Bonus
        </CardTitle>
        <CardDescription>
          Deploy your Marks. Clear your pouch. Get rewarded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          When you fully deploy and clear your backed Marks — meaning every Mark
          has been used in productive activity — you qualify for a tiered bonus
          funded by the volume savings of those projects.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {BREWSTER_TIERS.slice(0, 3).map(tier => (
            <div key={tier.id} className={`p-3 rounded-lg text-center ${TIER_COLORS[tier.color]?.bg} border ${TIER_COLORS[tier.color]?.border}`}>
              <div className="text-2xl">{tier.icon}</div>
              <div className="font-semibold text-sm mt-1">{tier.displayName}</div>
              <div className="text-xs text-muted-foreground">{tier.bonusRate}% bonus</div>
            </div>
          ))}
        </div>

        <div className="border-l-4 border-amber-500 pl-3 py-2">
          <p className="text-xs italic text-muted-foreground">
            "This is not a speculative return. It's a loyalty-driven volume
            discount passed back as platform currency."
          </p>
        </div>

        <div className="flex gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px]">SEC-Safe</Badge>
          <Badge variant="outline" className="text-[10px]">Closed-Loop</Badge>
          <Badge variant="outline" className="text-[10px]">Decaying Returns</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default BrewsterBonus;
