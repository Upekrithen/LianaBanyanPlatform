/**
 * C+20 Journey Widget
 * 
 * Shows an anchor's progress toward full C+20 certification.
 * Displays current tier, progress to next tier, and benefits unlocked.
 */

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Zap, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getCostPlusTier, 
  getCostPlusTierInfo,
  type Anchor,
  type CostPlusTier 
} from '@/lib/costPlusService';
import { CostPlusBadge } from './CostPlusBadge';

interface CostPlusJourneyWidgetProps {
  anchor: Anchor;
  className?: string;
}

const TIER_ORDER: CostPlusTier[] = ['NONE', 'QUARTER', 'HALF', 'THREE_QUARTER', 'FULL'];

export function CostPlusJourneyWidget({ anchor, className }: CostPlusJourneyWidgetProps) {
  const tierInfo = getCostPlusTierInfo(anchor);
  const currentTierIndex = TIER_ORDER.indexOf(tierInfo.tier);
  const ratioPercent = Math.round((tierInfo.ratio || 0) * 100);
  const nextThresholdPercent = tierInfo.nextTierThreshold 
    ? Math.round(tierInfo.nextTierThreshold * 100) 
    : 100;
  const percentToNext = tierInfo.nextTierThreshold
    ? nextThresholdPercent - ratioPercent
    : 0;

  return (
    <div className={cn(
      'bg-slate-900/80 border border-slate-700 rounded-xl p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">C+20 Journey</h3>
        <CostPlusBadge anchor={anchor} size="md" showDetails />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Progress</span>
          <span className="text-white font-mono">{ratioPercent}%</span>
        </div>
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          {/* Tier markers */}
          <div className="absolute top-0 left-[25%] w-px h-full bg-slate-600" />
          <div className="absolute top-0 left-[50%] w-px h-full bg-slate-600" />
          <div className="absolute top-0 left-[75%] w-px h-full bg-slate-600" />
          <div className="absolute top-0 left-[95%] w-px h-full bg-slate-600" />
          
          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ratioPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              tierInfo.tier === 'FULL' && 'bg-gradient-to-r from-emerald-600 to-amber-500',
              tierInfo.tier === 'THREE_QUARTER' && 'bg-gradient-to-r from-emerald-700 to-emerald-500',
              tierInfo.tier === 'HALF' && 'bg-gradient-to-r from-teal-700 to-teal-500',
              tierInfo.tier === 'QUARTER' && 'bg-gradient-to-r from-cyan-800 to-cyan-600',
              tierInfo.tier === 'NONE' && 'bg-slate-600'
            )}
          />
        </div>
        
        {/* Tier labels */}
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span>
          <span>¼</span>
          <span>½</span>
          <span>¾</span>
          <span>Full</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
        <div className="text-sm text-slate-400 mb-1">Current Status</div>
        <div className="text-lg font-semibold text-white">{tierInfo.label}</div>
        <div className="text-sm text-slate-400 mt-1">{tierInfo.description}</div>
      </div>

      {/* Next Tier Goal */}
      {tierInfo.nextTier && (
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-dashed border-slate-600">
          <div className="flex items-center gap-2 text-sm text-amber-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Next Goal: {tierInfo.nextTier === 'QUARTER' ? '¼ Badge' : 
                              tierInfo.nextTier === 'HALF' ? '½ Badge' :
                              tierInfo.nextTier === 'THREE_QUARTER' ? '¾ Badge' : 'Full Badge'}</span>
          </div>
          <div className="text-white">
            Add <span className="font-mono text-amber-400">{percentToNext}%</span> more C+20 sales to reach {nextThresholdPercent}%
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Tip: Add more products at Cost + 20% pricing to increase your compliance ratio
          </div>
        </div>
      )}

      {/* Benefits Grid */}
      <div className="grid grid-cols-2 gap-3">
        <BenefitCard
          icon={<Zap className="w-4 h-4" />}
          label="Joule Multiplier"
          value={`${tierInfo.jouleMultiplier}×`}
          active={tierInfo.jouleMultiplier > 0.25}
        />
        <BenefitCard
          icon={<Award className="w-4 h-4" />}
          label="Marks Multiplier"
          value={`${tierInfo.marksMultiplier}×`}
          active={tierInfo.marksMultiplier > 0.5}
        />
        <BenefitCard
          icon={<Users className="w-4 h-4" />}
          label="Reciprocal Tier"
          value={`Level ${tierInfo.reciprocalTierMax}`}
          active={tierInfo.reciprocalTierMax > 1}
        />
        <BenefitCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="IP Stakes"
          value={tierInfo.ipStakeEligible ? 'Eligible' : 'Not Yet'}
          active={tierInfo.ipStakeEligible}
        />
      </div>

      {/* Tier Roadmap */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="text-sm text-slate-400 mb-3">Your Journey</div>
        <div className="flex items-center justify-between">
          {TIER_ORDER.map((tier, index) => {
            const isCompleted = index < currentTierIndex;
            const isCurrent = index === currentTierIndex;
            const tierLabel = tier === 'NONE' ? 'Start' : 
                             tier === 'QUARTER' ? '¼' :
                             tier === 'HALF' ? '½' :
                             tier === 'THREE_QUARTER' ? '¾' : '✓';
            
            return (
              <div key={tier} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  isCompleted && 'bg-emerald-600 text-white',
                  isCurrent && 'bg-amber-500 text-white ring-2 ring-amber-300',
                  !isCompleted && !isCurrent && 'bg-slate-700 text-slate-400'
                )}>
                  {tierLabel}
                </div>
                {index < TIER_ORDER.length - 1 && (
                  <ArrowRight className={cn(
                    'w-4 h-4 mx-1',
                    isCompleted ? 'text-emerald-500' : 'text-slate-600'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ 
  icon, 
  label, 
  value, 
  active 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  active: boolean;
}) {
  return (
    <div className={cn(
      'p-3 rounded-lg border',
      active 
        ? 'bg-emerald-900/30 border-emerald-700/50' 
        : 'bg-slate-800/30 border-slate-700/50'
    )}>
      <div className={cn(
        'flex items-center gap-2 text-xs mb-1',
        active ? 'text-emerald-400' : 'text-slate-500'
      )}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn(
        'font-mono font-semibold',
        active ? 'text-white' : 'text-slate-400'
      )}>
        {value}
      </div>
    </div>
  );
}

export default CostPlusJourneyWidget;
