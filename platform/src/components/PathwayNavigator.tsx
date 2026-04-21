/**
 * PathwayNavigator
 *
 * Shows available paths from current page with progressive disclosure.
 * Maximum 2 paths at user's level, remaining shown as locked.
 */

import { useLocation } from 'react-router-dom';
import { usePathwayProgress } from '@/contexts/PathwayProgressContext';
import { PathwayLink } from '@/components/PathwayLink';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PathwayLevel,
  ALL_PATHWAYS,
  THREE_PACKS,
  getPathwaysByLevel,
} from '@/lib/pathwayLevels';
import { Compass, Lock, Star, Trophy, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PathwayNavigatorProps {
  maxPaths?: number;
  showProgress?: boolean;
  showThreePack?: boolean;
  variant?: 'sidebar' | 'inline' | 'floating';
  className?: string;
}

const LEVEL_COLORS: Record<PathwayLevel, string> = {
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-purple-500',
};

export function PathwayNavigator({
  maxPaths = 2,
  showProgress = true,
  showThreePack = true,
  variant = 'inline',
  className = '',
}: PathwayNavigatorProps) {
  const location = useLocation();
  const { progress, canAccessLevel, getCompletedCount, getNextThreePack } = usePathwayProgress();

  // Find current pathway based on route
  const currentPathway = ALL_PATHWAYS.find(p =>
    location.pathname === p.route ||
    location.pathname.startsWith(p.route + '/')
  );

  // Get available paths at user's level
  const availablePaths = ALL_PATHWAYS
    .filter(p => p.level <= progress.currentLevel && p.id !== currentPathway?.id)
    .slice(0, maxPaths);

  // Get locked paths (next level)
  const lockedPaths = ALL_PATHWAYS
    .filter(p => p.level === progress.currentLevel + 1)
    .slice(0, 2);

  // Get current three-pack progress
  const nextPackId = getNextThreePack();
  const nextPack = THREE_PACKS.find(p => p.id === nextPackId);
  const packProgress = nextPack
    ? (nextPack.pathwayIds.filter(id => progress.completedPathways.includes(id)).length / 3) * 100
    : 0;

  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`fixed right-4 top-24 w-64 z-40 ${className}`}
      >
        <Card className="bg-slate-900/95 backdrop-blur-sm border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Compass className="w-4 h-4 text-amber-400" />
              Your Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Level indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Current Level</span>
              <Badge className={`${LEVEL_COLORS[progress.currentLevel]} text-white`}>
                Level {progress.currentLevel}
              </Badge>
            </div>

            {/* Progress */}
            {showProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Pathways Complete</span>
                  <span className="text-white">{getCompletedCount()}</span>
                </div>
                <Progress value={(getCompletedCount() / ALL_PATHWAYS.length) * 100} className="h-1" />
              </div>
            )}

            {/* Available paths */}
            <div className="space-y-2">
              <span className="text-xs text-white/60">Continue exploring:</span>
              {availablePaths.map(path => (
                <PathwayLink
                  key={path.id}
                  to={path.route}
                  level={path.level}
                  userLevel={progress.currentLevel}
                  icon={<span className="text-sm">{path.icon}</span>}
                  variant="compact"
                  className="text-sm"
                >
                  {path.name}
                </PathwayLink>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-white">Level {progress.currentLevel}</span>
          <Badge className={`${LEVEL_COLORS[progress.currentLevel]} text-white text-xs`}>
            {progress.currentLevel === 1 ? 'Starter' : progress.currentLevel === 2 ? 'Intermediate' : 'Advanced'}
          </Badge>
        </div>

        {/* Three-pack progress */}
        {showThreePack && nextPack && (
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">{nextPack.name}</span>
              <span className="text-xs text-white/50">{Math.round(packProgress)}%</span>
            </div>
            <Progress value={packProgress} className="h-2" />
            <p className="text-xs text-white/50 mt-1">
              Complete to unlock Level {(nextPack.unlocksLevel || progress.currentLevel + 1)}
            </p>
          </div>
        )}

        {/* Available paths */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/70 flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Available Paths
          </h4>
          {availablePaths.map(path => (
            <PathwayLink
              key={path.id}
              to={path.route}
              level={path.level}
              userLevel={progress.currentLevel}
              icon={<span>{path.icon}</span>}
              description={path.description}
              variant="button"
            >
              {path.name}
            </PathwayLink>
          ))}
        </div>

        {/* Locked paths preview */}
        {lockedPaths.length > 0 && (
          <div className="space-y-2 opacity-60">
            <h4 className="text-sm font-medium text-white/50 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Coming at Level {progress.currentLevel + 1}
            </h4>
            {lockedPaths.map(path => (
              <PathwayLink
                key={path.id}
                to={path.route}
                level={path.level}
                userLevel={progress.currentLevel}
                icon={<span>{path.icon}</span>}
                description={path.description}
                variant="button"
              >
                {path.name}
              </PathwayLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with level */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          Continue Your Journey
        </h3>
        <Badge className={`${LEVEL_COLORS[progress.currentLevel]} text-white`}>
          Level {progress.currentLevel}
        </Badge>
      </div>

      {/* Available paths as cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availablePaths.map(path => (
          <PathwayLink
            key={path.id}
            to={path.route}
            level={path.level}
            userLevel={progress.currentLevel}
            icon={<span className="text-2xl">{path.icon}</span>}
            description={path.description}
            variant="card"
          >
            {path.name}
          </PathwayLink>
        ))}
      </div>

      {/* Locked preview */}
      {lockedPaths.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-white/50 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Complete a three-pack to unlock Level {progress.currentLevel + 1}:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
            {lockedPaths.map(path => (
              <PathwayLink
                key={path.id}
                to={path.route}
                level={path.level}
                userLevel={progress.currentLevel}
                icon={<span className="text-2xl">{path.icon}</span>}
                description={path.description}
                variant="card"
              >
                {path.name}
              </PathwayLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PathwayNavigator;
