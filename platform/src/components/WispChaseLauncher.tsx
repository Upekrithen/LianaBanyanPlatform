/**
 * WISP CHASE LAUNCHER
 * ====================
 * Entry point for Will-o'-Wisp Chase Mode.
 * Checks unlock status, allows difficulty selection, and launches chases.
 *
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Lock,
  Unlock,
  AlertTriangle,
  Trophy,
  Zap,
  Shield,
  Skull,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { checkUnlockStatus, skipAheadUnlock, getUserWispStats, UserWispStats } from '@/lib/wispChaseService';
import { CrowFeather } from '@/lib/crowFeatherService';
import WispChaseMode, { ChaseDifficulty } from './WispChaseMode';

// ═══════════════════════════════════════════════════════════════════════════════
// DIFFICULTY CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const DIFFICULTIES: {
  id: ChaseDifficulty;
  name: string;
  icon: React.ReactNode;
  color: string;
  ante: number;
  description: string;
}[] = [
  {
    id: 'novice',
    name: 'Novice',
    icon: <Shield className="w-5 h-5" />,
    color: '#34d399',
    ante: 10,
    description: '3-5 mirrors, gentle path',
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    icon: <Zap className="w-5 h-5" />,
    color: '#60a5fa',
    ante: 25,
    description: '5-8 mirrors, deeper routes',
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: <Skull className="w-5 h-5" />,
    color: '#f59e0b',
    ante: 50,
    description: '8-12 mirrors, pickle zones',
  },
  {
    id: 'legendary',
    name: 'Legendary',
    icon: <Crown className="w-5 h-5" />,
    color: '#ef4444',
    ante: 100,
    description: '12-20 mirrors, maximum risk',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface WispChaseLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onCrowFeatherEarned?: (feather: CrowFeather) => void;
}

export const WispChaseLauncher: React.FC<WispChaseLauncherProps> = ({
  isOpen,
  onClose,
  onCrowFeatherEarned,
}) => {
  const { toast } = useToast();

  // State
  const [unlockStatus, setUnlockStatus] = useState<{
    unlocked: boolean;
    reason?: string;
    canSkipAhead: boolean;
  }>({ unlocked: false, canSkipAhead: false });
  const [userStats, setUserStats] = useState<UserWispStats | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChaseDifficulty>('novice');
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [chaseActive, setChaseActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load unlock status and stats
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const status = await checkUnlockStatus();
      const stats = await getUserWispStats();
      setUnlockStatus(status);
      setUserStats(stats);
      setLoading(false);
    }

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Handle skip ahead
  const handleSkipAhead = async () => {
    const result = await skipAheadUnlock();
    if (result.success) {
      setUnlockStatus({ unlocked: true, reason: 'skip_ahead', canSkipAhead: false });
      setShowSkipWarning(false);
      toast({
        title: "Chase Mode Unlocked!",
        description: "You've chosen to skip ahead. Good luck!",
      });
    }
  };

  // Launch chase
  const handleLaunchChase = () => {
    setChaseActive(true);
  };

  // Render loading
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <div className="flex items-center justify-center p-8">
            <Flame className="w-8 h-8 animate-pulse text-amber-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render chase mode
  if (chaseActive) {
    return (
      <WispChaseMode
        isOpen={true}
        onClose={() => {
          setChaseActive(false);
          onClose();
        }}
        difficulty={selectedDifficulty}
        anteAmount={DIFFICULTIES.find(d => d.id === selectedDifficulty)?.ante || 10}
        onCrowFeatherEarned={onCrowFeatherEarned}
      />
    );
  }

  // Render skip warning dialog
  if (showSkipWarning) {
    return (
      <Dialog open={true} onOpenChange={() => setShowSkipWarning(false)}>
        <DialogContent className="bg-slate-900 border-amber-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              Skip Ahead Warning
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              You're about to unlock Chase Mode early. This means:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <p className="text-sm text-slate-400">
              <strong className="text-white">Real Stakes:</strong> You can lose Marks if you don't beat half the participants.
            </p>
            <p className="text-sm text-slate-400">
              <strong className="text-white">No Training Wheels:</strong> The full competitive experience with all its risks.
            </p>
            <p className="text-sm text-slate-400">
              <strong className="text-white">No Refunds:</strong> Antes are non-refundable once paid.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSkipWarning(false)}
              className="border-slate-600"
            >
              Go Back
            </Button>
            <Button
              onClick={handleSkipAhead}
              className="bg-amber-600 hover:bg-amber-700"
            >
              I Accept the Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main launcher dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span className="text-3xl">🕯️</span>
            Will-o'-Wisp Chase
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {unlockStatus.unlocked
              ? "Chase the wisp through the mirrors. Beat half to win!"
              : "Complete training or earn reputation to unlock Chase Mode."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Stats Display */}
        {userStats && (
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{userStats.wins}</div>
              <div className="text-xs text-slate-500">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{userStats.losses}</div>
              <div className="text-xs text-slate-500">Losses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${userStats.netProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {userStats.netProfit >= 0 ? '+' : ''}{userStats.netProfit}
              </div>
              <div className="text-xs text-slate-500">Net Marks</div>
            </div>
          </div>
        )}

        {/* Unlock Status */}
        {!unlockStatus.unlocked && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="font-medium">Chase Mode Locked</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Unlock by earning reputation, placing on leaderboards, or skip ahead at your own risk.
            </p>
            {unlockStatus.canSkipAhead && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSkipWarning(true)}
                className="border-amber-600 text-amber-500 hover:bg-amber-600/20"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Skip Ahead (Risky)
              </Button>
            )}
          </div>
        )}

        {/* Difficulty Selection */}
        {unlockStatus.unlocked && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-400">Select Difficulty</h4>
            <div className="grid grid-cols-2 gap-3">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${selectedDifficulty === diff.id
                      ? 'border-opacity-100 bg-opacity-20'
                      : 'border-opacity-30 bg-opacity-5 hover:border-opacity-50'
                    }
                  `}
                  style={{
                    borderColor: diff.color,
                    backgroundColor: selectedDifficulty === diff.id ? `${diff.color}20` : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-2 mb-1" style={{ color: diff.color }}>
                    {diff.icon}
                    <span className="font-semibold">{diff.name}</span>
                  </div>
                  <div className="text-xs text-slate-400">{diff.description}</div>
                  <div className="text-xs font-medium mt-2" style={{ color: diff.color }}>
                    Ante: {diff.ante} Marks
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <DialogFooter className="pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {unlockStatus.unlocked ? (
            <Button
              onClick={handleLaunchChase}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <Flame className="w-4 h-4 mr-2" />
              Join the Fray
            </Button>
          ) : (
            <Button
              disabled
              className="bg-slate-700 cursor-not-allowed"
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Required
            </Button>
          )}
        </DialogFooter>

        {/* Rules Reminder */}
        <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-800">
          Beat half the participants to win • Platform takes 20% • Tiered payout by finish order
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WispChaseLauncher;
