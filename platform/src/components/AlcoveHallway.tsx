/**
 * ALCOVE HALLWAY — Progressive Disclosure Navigation
 * ====================================================
 * Visual representation of the 18-stop learning journey.
 * Each alcove is a stopping point in a hallway — visit,
 * learn, answer questions, earn rewards.
 *
 * Displays as:
 *   - A horizontal scrolling hallway (desktop)
 *   - A vertical card stack (mobile)
 *
 * Tiers:
 *   1-6:   Foundation (green)
 *   7-12:  Mechanics (amber)
 *   13-18: Depth (indigo)
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronRight, Lock, Check, Star, Award,
  BookOpen, Zap, Trophy,
} from 'lucide-react';
import {
  ALCOVES,
  PATTERN_KEYS,
  ALCOVE_REWARDS,
  getAlcovesByTier,
  getTotalPossibleRewards,
  type Alcove,
  type AlcoveTier,
  type AlcoveProgress,
  type AlcoveStatus,
  type HallwayProgress,
} from '@/lib/alcoveSystem';

// ============================================================================
// TIER STYLING
// ============================================================================

const TIER_STYLES: Record<AlcoveTier, {
  label: string;
  color: string;
  bg: string;
  border: string;
  progressColor: string;
  keyName: string;
}> = {
  1: {
    label: 'Foundation',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    progressColor: 'bg-emerald-500',
    keyName: 'Fledgling Key 🐦',
  },
  2: {
    label: 'Mechanics',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    progressColor: 'bg-amber-500',
    keyName: 'Flight Key 🕊️',
  },
  3: {
    label: 'Depth',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    progressColor: 'bg-indigo-500',
    keyName: 'Murder Key 🐦‍⬛',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface AlcoveHallwayProps {
  /** User's progress through alcoves */
  progress?: HallwayProgress;
  /** Callback when an alcove is clicked */
  onAlcoveClick?: (alcove: Alcove) => void;
  /** Show compact mode (list) or full mode (cards) */
  variant?: 'full' | 'compact' | 'minimap';
  /** Optional className */
  className?: string;
}

export function AlcoveHallway({
  progress,
  onAlcoveClick,
  variant = 'full',
  className = '',
}: AlcoveHallwayProps) {
  const [expandedTier, setExpandedTier] = useState<AlcoveTier | null>(1);

  const stats = useMemo(() => {
    if (!progress) return { visited: 0, comprehended: 0, totalMarks: 0 };

    const alcoveEntries = Object.values(progress.alcoves);
    return {
      visited: alcoveEntries.filter(a => a.status === 'visited' || a.status === 'comprehended').length,
      comprehended: alcoveEntries.filter(a => a.status === 'comprehended').length,
      totalMarks: progress.totalMarksEarned,
    };
  }, [progress]);

  if (variant === 'minimap') {
    return <MinimapView progress={progress} className={className} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            The Hallway
          </CardTitle>
          <CardDescription>
            18 alcoves of progressive discovery. Visit, learn, answer, earn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Overall Progress */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">{stats.visited}/18</div>
              <div className="text-xs text-muted-foreground">Visited</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">{stats.comprehended}/18</div>
              <div className="text-xs text-muted-foreground">Comprehended</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold">{stats.totalMarks}</div>
              <div className="text-xs text-muted-foreground">Marks Earned</div>
            </div>
          </div>
          <Progress
            value={(stats.visited / 18) * 100}
            className="h-2"
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {getTotalPossibleRewards()} total Marks available
          </div>
        </CardContent>
      </Card>

      {/* Tier Sections */}
      {([1, 2, 3] as AlcoveTier[]).map(tier => {
        const style = TIER_STYLES[tier];
        const tierAlcoves = getAlcovesByTier(tier);
        const isExpanded = expandedTier === tier;
        const tierVisited = tierAlcoves.filter(a => {
          const p = progress?.alcoves[a.id];
          return p && (p.status === 'visited' || p.status === 'comprehended');
        }).length;
        const tierComplete = tierVisited === 6;

        return (
          <Card key={tier} className={tierComplete ? `${style.border} border` : ''}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpandedTier(isExpanded ? null : tier)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedTier(isExpanded ? null : tier); }}}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center gap-2 text-lg ${style.color}`}>
                  <span className="text-sm font-mono opacity-60">
                    Stops {(tier - 1) * 6 + 1}–{tier * 6}
                  </span>
                  {style.label}
                  {tierComplete && (
                    <Badge variant="secondary" className="text-[10px]">
                      ✓ {style.keyName}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {tierVisited}/6
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-2">
                {tierAlcoves.map(alcove => {
                  const alcoveProgress = progress?.alcoves[alcove.id];
                  const status: AlcoveStatus = alcoveProgress?.status || 'available';

                  return (
                    <AlcoveCard
                      key={alcove.id}
                      alcove={alcove}
                      status={status}
                      progress={alcoveProgress}
                      tierStyle={style}
                      onClick={() => onAlcoveClick?.(alcove)}
                      variant={variant}
                    />
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Pattern Keys Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            Pattern Keys Collected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {([1, 2, 3] as AlcoveTier[]).map(tier => {
              const style = TIER_STYLES[tier];
              const earned = progress?.patternKeys.includes(PATTERN_KEYS[tier]);
              return (
                <div
                  key={tier}
                  className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                    earned
                      ? `${style.bg} ${style.border}`
                      : 'bg-muted/20 border-transparent opacity-40'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {earned ? '🔑' : '🔒'}
                  </div>
                  <div className={`text-xs font-medium ${earned ? style.color : ''}`}>
                    {style.keyName}
                  </div>
                </div>
              );
            })}
          </div>
          {progress?.foundersForgeBadge && (
            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-center">
              <div className="text-2xl">⚒️</div>
              <div className="font-bold text-sm">Founder's Forge Badge</div>
              <div className="text-xs text-muted-foreground">All 18 alcoves mastered</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function AlcoveCard({
  alcove,
  status,
  progress,
  tierStyle,
  onClick,
  variant,
}: {
  alcove: Alcove;
  status: AlcoveStatus;
  progress?: AlcoveProgress;
  tierStyle: typeof TIER_STYLES[1];
  onClick: () => void;
  variant: string;
}) {
  const statusIcons: Record<AlcoveStatus, React.ReactNode> = {
    locked: <Lock className="w-4 h-4 text-muted-foreground" />,
    available: <ChevronRight className="w-4 h-4 text-muted-foreground" />,
    visited: <Check className="w-4 h-4 text-green-500" />,
    comprehended: <Star className="w-4 h-4 text-amber-500" />,
  };

  const isActive = status === 'available' || status === 'visited' || status === 'comprehended';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        status === 'comprehended'
          ? `${tierStyle.bg} ${tierStyle.border}`
          : status === 'visited'
            ? 'bg-green-500/5 border-green-500/20'
            : isActive
              ? 'hover:bg-muted/50 border-transparent hover:border-muted'
              : 'opacity-40 border-transparent'
      }`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }}}
      role="button"
      tabIndex={isActive ? 0 : -1}
    >
      {/* Position Number */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        status === 'comprehended'
          ? `${tierStyle.bg} ${tierStyle.color}`
          : status === 'visited'
            ? 'bg-green-500/20 text-green-500'
            : 'bg-muted/50 text-muted-foreground'
      }`}>
        {alcove.position}
      </div>

      {/* Icon */}
      <span className="text-xl flex-shrink-0">{alcove.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{alcove.title}</div>
        <div className="text-xs text-muted-foreground truncate">{alcove.subtitle}</div>
      </div>

      {/* Questions Badge */}
      {alcove.questions.length > 0 && progress && (
        <Badge variant="outline" className="text-[10px] flex-shrink-0">
          {progress.questionsAnswered.length}/{alcove.questions.length}
        </Badge>
      )}

      {/* Status Icon */}
      <div className="flex-shrink-0">
        {statusIcons[status]}
      </div>
    </div>
  );
}

function MinimapView({
  progress,
  className,
}: {
  progress?: HallwayProgress;
  className?: string;
}) {
  return (
    <div className={`flex gap-0.5 ${className}`}>
      {ALCOVES.map(alcove => {
        const status = progress?.alcoves[alcove.id]?.status || 'available';
        const tier = alcove.tier;
        const style = TIER_STYLES[tier];

        return (
          <div
            key={alcove.id}
            className={`w-3 h-3 rounded-sm transition-all ${
              status === 'comprehended'
                ? `${style.progressColor}`
                : status === 'visited'
                  ? 'bg-green-500'
                  : 'bg-muted/30'
            }`}
            title={`${alcove.position}. ${alcove.title} (${status})`}
          />
        );
      })}
    </div>
  );
}

export default AlcoveHallway;
