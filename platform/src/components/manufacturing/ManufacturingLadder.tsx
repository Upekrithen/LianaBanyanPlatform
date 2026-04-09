import { useState } from 'react';
import { Check, Lock, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LadderLevel {
  level: number;
  name: string;
  equipment: string;
  detail: string;
  marksRequired: number;
  tierLabel: string;
  expandedInfo: string[];
}

const LEVELS: LadderLevel[] = [
  { level: 4, name: 'FACTORY', equipment: 'Industrial Press', detail: '50K+ parts/yr', marksRequired: 5000, tierLabel: 'Senior Partner (5,000+ Marks)', expandedInfo: [
    'Full industrial injection molding press',
    'High-volume production: 50,000+ parts per year',
    'Factory Node status — become a cooperative production hub',
    'Revenue share on all production runs through your facility',
    'Requires 5,000+ Marks earned through verified work',
  ]},
  { level: 3, name: 'SHOP', equipment: 'SLS Machine', detail: 'Custom orders', marksRequired: 2000, tierLabel: 'Partner (2,000+ Marks)', expandedInfo: [
    'Selective Laser Sintering machine for custom parts',
    'Take custom orders from the cooperative marketplace',
    'Higher-margin specialty production',
    'Train and mentor Kit/Bench members in your area',
    'Requires 2,000+ Marks earned through verified work',
  ]},
  { level: 2, name: 'BENCH', equipment: 'Desktop Molder (Babyplast)', detail: 'Small-batch production', marksRequired: 500, tierLabel: 'Partner (500+ Marks)', expandedInfo: [
    'Babyplast desktop injection molder — professional quality',
    'Small-batch production runs (100–5,000 parts)',
    'Fill cooperative orders assigned to your region',
    'Earn Marks faster with higher-volume output',
    'Requires 500+ Marks earned through Kit-level work',
  ]},
  { level: 1, name: 'KIT', equipment: 'Canister System', detail: '$250–400', marksRequired: 0, tierLabel: 'Anyone can start', expandedInfo: [
    'The Canister System — screw-press injection molder you build yourself',
    '$250–400 for the complete kit, assembled at your kitchen table',
    'Make keychains, phone cases, game tokens, small enclosures',
    'Thermoplastics: LDPE, PP, HDPE at ~5,207 PSI with 8" handle',
    'No experience needed — earn your first Marks immediately',
  ]},
];

type LevelState = 'completed' | 'current' | 'approaching' | 'locked';

function getLevelState(levelMarks: number, currentMarks: number, levels: LadderLevel[], idx: number): LevelState {
  const nextLevel = idx > 0 ? levels[idx - 1] : null;
  const nextThreshold = nextLevel?.marksRequired ?? Infinity;

  if (currentMarks >= nextThreshold) return 'completed';
  if (currentMarks >= levelMarks) {
    if (nextLevel && currentMarks >= levelMarks && currentMarks < nextThreshold) return 'current';
    if (!nextLevel && currentMarks >= levelMarks) return 'current';
    return 'current';
  }

  const prevLevel = idx < levels.length - 1 ? levels[idx + 1] : null;
  if (prevLevel && currentMarks >= prevLevel.marksRequired) return 'approaching';
  return 'locked';
}

const STATE_STYLES: Record<LevelState, { border: string; bg: string; text: string; icon: string; bar: string }> = {
  completed: {
    border: 'border-emerald-500/60',
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-400',
    icon: 'bg-emerald-500 text-white',
    bar: 'bg-emerald-500',
  },
  current: {
    border: 'border-amber-500/60',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400',
    icon: 'bg-amber-500 text-white animate-pulse',
    bar: 'bg-amber-500',
  },
  approaching: {
    border: 'border-amber-500/30',
    bg: 'bg-transparent',
    text: 'text-amber-300/70',
    icon: 'bg-transparent border-2 border-amber-500/50 text-amber-400',
    bar: 'bg-amber-500/40',
  },
  locked: {
    border: 'border-zinc-700/50',
    bg: 'bg-transparent',
    text: 'text-zinc-500',
    icon: 'bg-zinc-800 text-zinc-500',
    bar: 'bg-zinc-700',
  },
};

interface ManufacturingLadderProps {
  currentMarks: number;
  compact?: boolean;
  showDescriptions?: boolean;
}

export function ManufacturingLadder({ currentMarks, compact = false, showDescriptions = true }: ManufacturingLadderProps) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  return (
    <div className={cn('flex flex-col gap-0', compact ? 'max-w-xs' : 'max-w-lg w-full')} data-xray-id="manufacturing-ladder">
      {LEVELS.map((level, idx) => {
        const state = getLevelState(level.marksRequired, currentMarks, LEVELS, idx);
        const styles = STATE_STYLES[state];
        const nextThreshold = idx > 0 ? LEVELS[idx - 1].marksRequired : Infinity;
        const progress = state === 'current' && nextThreshold !== Infinity
          ? Math.min(1, (currentMarks - level.marksRequired) / (nextThreshold - level.marksRequired))
          : state === 'completed' ? 1 : 0;

        return (
          <div key={level.level} className="relative">
            {idx < LEVELS.length - 1 && (
              <div className="absolute left-5 top-full w-0.5 h-3 bg-zinc-700/50 z-0" />
            )}

            <div
              onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
              className={cn(
              'relative z-10 flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer hover:brightness-110',
              styles.border,
              styles.bg,
              compact && 'p-2 gap-2',
            )}>
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                styles.icon,
                compact && 'w-6 h-6',
              )}>
                {state === 'completed' ? <Check className="w-4 h-4" /> :
                  state === 'locked' ? <Lock className="w-3 h-3" /> :
                    level.level}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('font-bold text-sm', styles.text, compact && 'text-xs')}>
                    LEVEL {level.level}: {level.name}
                  </span>
                  {state === 'current' && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                      You are here
                    </span>
                  )}
                </div>

                {showDescriptions && !compact && (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-zinc-400">{level.equipment} · {level.detail}</p>
                    <p className="text-[11px] text-zinc-500">{level.tierLabel}</p>
                  </div>
                )}

                {state === 'current' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                      <span>{currentMarks.toLocaleString()} Marks</span>
                      {nextThreshold !== Infinity && <span>{nextThreshold.toLocaleString()} to next</span>}
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-700', styles.bar)}
                        style={{ width: `${progress * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {expandedLevel === level.level
                ? <ChevronDown className={cn('w-4 h-4 mt-1 flex-shrink-0', styles.text)} />
                : <ChevronRight className={cn('w-4 h-4 mt-1 flex-shrink-0', styles.text, 'opacity-40')} />
              }
            </div>

            {expandedLevel === level.level && (
              <div className={cn('relative z-10 mt-1 rounded-lg border p-4 space-y-1.5', styles.border, 'bg-zinc-900/60')}>
                {level.expandedInfo.map((info, j) => (
                  <p key={j} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {info}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
