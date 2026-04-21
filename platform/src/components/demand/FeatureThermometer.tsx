/**
 * FeatureThermometer — Pre-Operational Feature Progress Display
 * Innovation #1715: Live progress toward activation threshold.
 * Shows Shadow Mark commitments, Credit pledges, milestone timeline,
 * user's personal allocation with persistence day count.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Thermometer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Coins,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  Zap,
  TrendingUp,
} from 'lucide-react';
import type {
  Pedestal,
  UserPedestalAllocation,
  BeaconStreakTier,
  CrystallizationResult,
} from '@/lib/demandSignalingService';
import {
  buildThermometerData,
  calculateCrystallization,
  calculateCarryForward,
} from '@/lib/demandSignalingService';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'pre-operational': { label: 'PRE-OPERATIONAL', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  'alpha':           { label: 'ALPHA',           color: 'text-blue-400',  bg: 'bg-blue-500/20' },
  'beta':            { label: 'BETA',            color: 'text-purple-400', bg: 'bg-purple-500/20' },
  'operational':     { label: 'OPERATIONAL',     color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
};

interface FeatureThermometerProps {
  pedestal: Pedestal;
  userAllocation?: UserPedestalAllocation | null;
  beaconTier?: BeaconStreakTier;
  dailyGrowthRate?: number;
  onAllocate?: (pedestalId: string, amount: number) => void;
  onPledgeCredits?: (pedestalId: string) => void;
  compact?: boolean;
}

export function FeatureThermometer({
  pedestal,
  userAllocation,
  beaconTier,
  dailyGrowthRate = 0,
  onAllocate,
  onPledgeCredits,
  compact = false,
}: FeatureThermometerProps) {
  const [expanded, setExpanded] = useState(false);
  const thermo = buildThermometerData(pedestal, dailyGrowthRate);
  const statusConf = STATUS_CONFIG[pedestal.status] ?? STATUS_CONFIG['pre-operational'];

  const crystallization: CrystallizationResult | null = userAllocation && beaconTier
    ? calculateCrystallization(userAllocation, beaconTier.crystallizationDays)
    : null;

  if (compact) {
    return (
      <Card className="border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-colors" data-xray-id={`thermometer-${pedestal.id}`}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{pedestal.icon}</span>
              <span className="font-semibold text-white text-sm">{pedestal.featureName}</span>
            </div>
            <Badge className={`${statusConf.bg} ${statusConf.color} text-[10px]`}>
              {statusConf.label}
            </Badge>
          </div>
          <Progress value={thermo.progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{thermo.commitmentCount} / {thermo.activationThreshold} orders</span>
            <span>{thermo.progressPercent}%</span>
          </div>
          {userAllocation && userAllocation.total > 0 && (
            <div className="text-xs text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {userAllocation.total} SM allocated · Day {userAllocation.consecutiveDays}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700 bg-slate-900/50" data-xray-id={`thermometer-${pedestal.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{pedestal.icon}</span>
            <div>
              <h3 className="font-semibold text-white">{pedestal.featureName}</h3>
              <p className="text-xs text-slate-400">{pedestal.description}</p>
            </div>
          </div>
          <Badge className={`${statusConf.bg} ${statusConf.color}`}>
            {statusConf.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Thermometer Bar */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <Progress value={thermo.progressPercent} className="flex-1 h-3" />
            <span className="text-sm font-mono text-white w-16 text-right">
              {thermo.progressPercent}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 px-6">
            <span>{thermo.commitmentCount} committed</span>
            <span>{thermo.activationThreshold} needed</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded bg-slate-800/50">
            <Coins className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-white">{pedestal.creditPledges.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Credits Pledged</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-800/50">
            <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-white">{pedestal.shadowMarkTotal.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Shadow Marks</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-800/50">
            <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-sm font-semibold text-white">
              {thermo.estimatedDaysToThreshold ? `~${thermo.estimatedDaysToThreshold}d` : '—'}
            </div>
            <div className="text-[10px] text-slate-500">Est. Days Left</div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="flex items-center gap-2 text-xs">
          {thermo.milestones.map((m, i) => (
            <React.Fragment key={m.label}>
              {i > 0 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
              <div className={`flex items-center gap-1 ${m.reached ? 'text-emerald-400' : 'text-slate-500'}`}>
                {m.reached
                  ? <CheckCircle2 className="w-3 h-3" />
                  : <Circle className="w-3 h-3" />
                }
                <span>{m.label}</span>
                <span className="text-slate-600">({m.leadsToWeeks}w)</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* User Allocation Section */}
        {userAllocation && userAllocation.total > 0 && (
          <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Your Allocation
              </span>
              <span className="text-sm text-white font-mono">{userAllocation.total} SM</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-400">
                Fresh today: <span className="text-white">{userAllocation.freshToday}</span>
              </div>
              <div className="text-slate-400">
                Carry-forward: <span className="text-white">{userAllocation.carryForward.toFixed(1)}</span>
              </div>
            </div>
            {crystallization && (
              <div className="flex items-center gap-2 text-xs">
                {crystallization.eligible ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Crystallizes {crystallization.crystallizableAmount} Marks today!
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Day {userAllocation.consecutiveDays} of {beaconTier?.crystallizationDays ?? 3} — crystallizes
                    {crystallization.daysUntilCrystallization === 1 ? ' tomorrow' : ` in ${crystallization.daysUntilCrystallization} days`}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onAllocate && pedestal.status === 'pre-operational' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => onAllocate(pedestal.id, 0)}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Reserve with Shadow Marks
            </Button>
          )}
          {onPledgeCredits && pedestal.status === 'pre-operational' && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onPledgeCredits(pedestal.id)}
            >
              <Coins className="w-4 h-4 mr-1" />
              Pledge Credits
            </Button>
          )}
        </div>

        {/* Expandable Details */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full gap-1 text-slate-400 hover:text-white">
              How this works
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2 text-xs text-slate-400">
            <p>
              <strong className="text-white">Shadow Marks:</strong> Free allocation when you enter this area.
              Distribute across features to show what you want built. Persists at {beaconTier ? `${(beaconTier.carryForwardRate * 100).toFixed(0)}%` : '50%'}/day.
              Crystallizes into real Marks after {beaconTier?.crystallizationDays ?? 3} days of consistent allocation.
            </p>
            <p>
              <strong className="text-white">Credits:</strong> Lock in your price with a ranked choice preference.
              If your preferred tier doesn't fill, your order cascades to the next tier — same Credits, more units.
              Credits return if neither tier fills.
            </p>
            <div className="flex gap-2 pt-1">
              <a href="/faq#shadow-marks" className="text-amber-400 hover:text-amber-300">What are Shadow Marks?</a>
              <a href="/faq#brewster-bonus" className="text-amber-400 hover:text-amber-300">What is Brewster's?</a>
              <a href="/faq#pre-operational" className="text-amber-400 hover:text-amber-300">Pre-operational features</a>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

/**
 * Compact grid of thermometers for area overview.
 */
export function ThermometerGrid({
  pedestals,
  userAllocations,
  beaconTier,
}: {
  pedestals: Pedestal[];
  userAllocations?: Record<string, UserPedestalAllocation>;
  beaconTier?: BeaconStreakTier;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-xray-id="thermometer-grid">
      {pedestals.map(p => (
        <FeatureThermometer
          key={p.id}
          pedestal={p}
          userAllocation={userAllocations?.[p.id]}
          beaconTier={beaconTier}
          compact
        />
      ))}
    </div>
  );
}
