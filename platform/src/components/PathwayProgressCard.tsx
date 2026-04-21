/**
 * PathwayProgressCard
 *
 * Displays user's pathway progress with level, completed pathways,
 * and three-pack progress toward next level.
 */

import { Link } from 'react-router-dom';
import { usePathwayProgress } from '@/contexts/PathwayProgressContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Star,
  Trophy,
  Lock,
  Unlock,
  ChevronRight,
  Compass,
  CheckCircle2,
  Circle,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  PathwayLevel,
  ALL_PATHWAYS,
  THREE_PACKS,
  getPathwayById,
} from '@/lib/pathwayLevels';
import { LEVEL_1_RUNS, LEVEL_2_RUNS, LEVEL_3_RUNS } from '@/data/wildfireRuns';

interface PathwayProgressCardProps {
  variant?: 'full' | 'compact' | 'mini';
  showWildfireRuns?: boolean;
  className?: string;
}

const LEVEL_COLORS: Record<PathwayLevel, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' },
  2: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' },
  3: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' },
};

const LEVEL_NAMES: Record<PathwayLevel, string> = {
  1: 'Starter',
  2: 'Intermediate',
  3: 'Advanced',
};

export function PathwayProgressCard({
  variant = 'full',
  showWildfireRuns = true,
  className = '',
}: PathwayProgressCardProps) {
  const {
    progress,
    isLoading,
    getCompletedCount,
    getNextThreePack,
    completePathway,
    toggleLevelGating,
    canToggleLevelGating,
    isLevelGatingEnabled,
  } = usePathwayProgress();

  if (isLoading) {
    return (
      <Card className={`bg-slate-900/50 border-slate-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-700 rounded w-1/3" />
            <div className="h-8 bg-slate-700 rounded w-1/2" />
            <div className="h-2 bg-slate-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = LEVEL_COLORS[progress.currentLevel];
  const nextPackId = getNextThreePack();
  const nextPack = THREE_PACKS.find(p => p.id === nextPackId);

  // Calculate three-pack progress
  const packPathwaysComplete = nextPack
    ? nextPack.pathwayIds.filter(id => progress.completedPathways.includes(id)).length
    : 0;
  const packProgress = nextPack ? (packPathwaysComplete / 3) * 100 : 0;

  // Get available wildfire runs for current level
  const availableRuns = progress.currentLevel === 1
    ? LEVEL_1_RUNS
    : progress.currentLevel === 2
      ? [...LEVEL_1_RUNS, ...LEVEL_2_RUNS]
      : [...LEVEL_1_RUNS, ...LEVEL_2_RUNS, ...LEVEL_3_RUNS];

  if (variant === 'mini') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Badge className={`${colors.bg} text-white`}>
          Lvl {progress.currentLevel}
        </Badge>
        <span className="text-sm text-white/60">
          {getCompletedCount()} pathways complete
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={`bg-slate-900/50 border-slate-700 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="font-medium text-white">Level {progress.currentLevel}</span>
              <Badge className={`${colors.bg} text-white text-xs`}>
                {LEVEL_NAMES[progress.currentLevel]}
              </Badge>
            </div>
            <span className="text-sm text-white/60">{getCompletedCount()} done</span>
          </div>

          {nextPack && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">{nextPack.name}</span>
                <span className="text-white/60">{packPathwaysComplete}/3</span>
              </div>
              <Progress value={packProgress} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={`bg-slate-900/50 border-slate-700 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-white">
            <Compass className="w-5 h-5 text-amber-400" />
            Your Journey
          </span>
          <Badge className={`${colors.bg} text-white`}>
            Level {progress.currentLevel} — {LEVEL_NAMES[progress.currentLevel]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Pathways Explored</span>
            <span className="text-white font-medium">
              {getCompletedCount()} / {ALL_PATHWAYS.length}
            </span>
          </div>
          <Progress
            value={(getCompletedCount() / ALL_PATHWAYS.length) * 100}
            className="h-2"
          />
        </div>

        {/* Three-Pack Progress */}
        {nextPack && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{nextPack.name}</h4>
              <Badge variant="outline" className="text-xs">
                {nextPack.unlocksLevel ? `Unlocks Level ${nextPack.unlocksLevel}` : 'Bonus Pack'}
              </Badge>
            </div>
            <p className="text-sm text-white/60 mb-3">{nextPack.description}</p>

            {/* Three-pack pathways */}
            <div className="space-y-2">
              {nextPack.pathwayIds.map(pathwayId => {
                const pathway = getPathwayById(pathwayId);
                const isComplete = progress.completedPathways.includes(pathwayId);

                return (
                  <div
                    key={pathwayId}
                    className={`flex items-center gap-3 p-2 rounded ${
                      isComplete ? 'bg-green-500/10' : 'bg-white/5'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/30" />
                    )}
                    <span className={isComplete ? 'text-green-400' : 'text-white/70'}>
                      {pathway?.icon} {pathway?.name || pathwayId}
                    </span>
                    {!isComplete && pathway && (
                      <Link
                        to={pathway.route}
                        className="ml-auto text-xs text-primary hover:underline"
                      >
                        Start →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3">
              <Progress value={packProgress} className="h-2" />
              <p className="text-xs text-white/50 mt-1 text-center">
                {packPathwaysComplete}/3 complete
              </p>
            </div>
          </div>
        )}

        {/* Wildfire Beacon Runs */}
        {showWildfireRuns && (
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Available Wildfire Runs
            </h4>
            <div className="space-y-2">
              {availableRuns.slice(0, 3).map(run => (
                <Link
                  key={run.id}
                  to={`/wildfire-runs?run=${run.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{run.icon}</span>
                    <div>
                      <div className="text-white font-medium">{run.name}</div>
                      <div className="text-xs text-white/50">
                        {run.totalNodes} stops • {run.estimatedMinutes} min
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>
              ))}
            </div>
            <Link to="/wildfire-runs">
              <Button variant="outline" size="sm" className="w-full mt-3">
                View All Runs
              </Button>
            </Link>
          </div>
        )}

        {/* Level Unlock Status */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex gap-2">
            {([1, 2, 3] as PathwayLevel[]).map(level => (
              <div
                key={level}
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  progress.currentLevel >= level
                    ? LEVEL_COLORS[level].bg + ' text-white'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {progress.currentLevel >= level ? (
                  <Unlock className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                <span className="text-xs font-medium">{level}</span>
              </div>
            ))}
          </div>
          <span className="text-xs text-white/50">
            {progress.currentLevel < 3
              ? `Complete a three-pack to unlock Level ${progress.currentLevel + 1}`
              : 'All levels unlocked!'
            }
          </span>
        </div>

        {/* Level Gating Toggle - only shown when user can toggle */}
        {canToggleLevelGating() && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              {isLevelGatingEnabled() ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Unlock className="w-4 h-4 text-green-400" />
              )}
              <span className="text-sm text-white/80">
                Level Gating
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLevelGating}
              className={isLevelGatingEnabled()
                ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
              }
            >
              {isLevelGatingEnabled() ? 'Turn Off' : 'Turn On'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PathwayProgressCard;
