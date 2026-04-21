/**
 * WILL-O'-WISP CHASE MODE
 * ========================
 * The competitive skill game where players ante Marks and chase the wisp
 * through a random mirror path. Beat half the participants to win!
 *
 * "The real ones are something to see. ;)" — Founder
 *
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, Users, Coins, AlertTriangle, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  MIRROR_GRAPH,
  generateChasePath,
  getNextSteps,
  isInPickle,
  MirrorPath
} from '@/lib/mirrorGraph';
import { processChaseCompletion, CrowFeather } from '@/lib/crowFeatherService';
import {
  isGhostMode,
  getCurrentGhostSession,
  canGhostAffordAnte,
  deductGhostAnte,
  addGhostWinnings,
  updateGhostChaseStats,
  GhostSession
} from '@/lib/ghostWorld';
import './WispChaseMode.css';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ChaseStatus = 'lobby' | 'countdown' | 'active' | 'finished' | 'lost';
export type ChaseDifficulty = 'novice' | 'journeyman' | 'expert' | 'legendary';

interface ChaseParticipant {
  userId: string;
  displayName: string;
  avatar?: string;
  progress: number; // 0 to path.length
  status: 'chasing' | 'finished' | 'lost' | 'quit';
  finishPosition?: number;
}

interface WispChaseModeProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty?: ChaseDifficulty;
  anteAmount?: number;
  chaseId?: string; // For joining existing chase
  onCrowFeatherEarned?: (feather: CrowFeather) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const WispChaseMode: React.FC<WispChaseModeProps> = ({
  isOpen,
  onClose,
  difficulty = 'novice',
  anteAmount = 10,
  chaseId,
  onCrowFeatherEarned,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────

  const [status, setStatus] = useState<ChaseStatus>('lobby');
  const [path, setPath] = useState<MirrorPath | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeElapsedMs, setTimeElapsedMs] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [participants, setParticipants] = useState<ChaseParticipant[]>([]);
  const [userMarks, setUserMarks] = useState(0);
  const [antePaid, setAntePaid] = useState(false);
  const [pickleState, setPickleState] = useState<{ isPickle: boolean; severity: number; hint?: string }>({ isPickle: false, severity: 0 });
  const [finishPosition, setFinishPosition] = useState<number | null>(null);
  const [payout, setPayout] = useState(0);
  const [ghostSession, setGhostSession] = useState<GhostSession | null>(null);
  const [isGhost, setIsGhost] = useState(false);

  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOAD USER BALANCE (supports both authenticated users and Ghosts)
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadBalance() {
      // Check if in Ghost mode first
      if (isGhostMode()) {
        const session = getCurrentGhostSession();
        if (session) {
          setGhostSession(session);
          setIsGhost(true);
          // Ghosts use candles as their "marks" for chase mode
          setUserMarks(Math.floor(session.loot.candles));
          return;
        }
      }

      // Authenticated user
      setIsGhost(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('marks')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserMarks(data.marks || 0);
      }
    }

    if (isOpen) {
      loadBalance();
    }
  }, [isOpen]);

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE PATH
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && !path) {
      const seed = chaseId || `chase-${Date.now()}-${Math.random()}`;
      const generatedPath = generateChasePath(difficulty, seed);
      setPath(generatedPath);
    }
  }, [isOpen, difficulty, chaseId, path]);

  // ─────────────────────────────────────────────────────────────────────────────
  // TIMER
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (status === 'active') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeElapsedMs(Date.now() - startTimeRef.current);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  // ─────────────────────────────────────────────────────────────────────────────
  // COUNTDOWN
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (status === 'countdown' && countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'countdown' && countdownSeconds === 0) {
      setStatus('active');
    }
  }, [status, countdownSeconds]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PICKLE DETECTION
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (status !== 'active' || !path) return;

    const currentMirrorId = path.nodes[currentIndex];
    const expectedTimePerStep = path.estimatedTimeMs / path.nodes.length;
    const expectedTimeMs = expectedTimePerStep * (currentIndex + 1);

    const pickle = isInPickle(
      currentMirrorId,
      path.nodes,
      currentIndex,
      timeElapsedMs,
      expectedTimeMs
    );

    setPickleState(pickle);
  }, [status, path, currentIndex, timeElapsedMs]);

  // ─────────────────────────────────────────────────────────────────────────────
  // ANTE UP (supports both authenticated users and Ghosts)
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAnteUp = async () => {
    if (userMarks < anteAmount) {
      toast({
        title: "Insufficient Marks",
        description: `You need ${anteAmount} ${isGhost ? 'Candles' : 'Marks'} to join the fray. You have ${userMarks}.`,
        variant: "destructive",
      });
      return;
    }

    let participantId = 'ghost-user';
    let participantName = 'Ghost';

    // Handle Ghost mode
    if (isGhost && ghostSession) {
      if (!canGhostAffordAnte(ghostSession, anteAmount)) {
        toast({
          title: "Insufficient Candles",
          description: `You need ${anteAmount} Candles to ante. Collect more candles first!`,
          variant: "destructive",
        });
        return;
      }

      // Deduct ante from ghost's session candles
      const updatedSession = deductGhostAnte(ghostSession, anteAmount);
      setGhostSession(updatedSession);
      setUserMarks(Math.floor(updatedSession.loot.candles));
      participantId = ghostSession.sessionId;
      participantName = '👻 You (Ghost)';
    } else {
      // Authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "You must be logged in to join the chase. Or explore as a Ghost!",
          variant: "destructive",
        });
        return;
      }

      participantId = user.id;
      participantName = 'You';

      // Deduct ante from user's marks
      const { error } = await supabase
        .from('profiles')
        .update({ marks: userMarks - anteAmount })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to process ante. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setUserMarks(prev => prev - anteAmount);
    }

    setAntePaid(true);

    // Add self as participant
    setParticipants(prev => [...prev, {
      userId: participantId,
      displayName: participantName,
      progress: 0,
      status: 'chasing',
    }]);

    // Add simulated opponents for demo (in real version, this comes from real-time)
    const simulatedOpponents: ChaseParticipant[] = [
      { userId: 'sim-1', displayName: 'ChaseRunner42', progress: 0, status: 'chasing' },
      { userId: 'sim-2', displayName: 'MirrorMaster', progress: 0, status: 'chasing' },
      { userId: 'sim-3', displayName: 'WispHunter', progress: 0, status: 'chasing' },
    ];
    setParticipants(prev => [...prev, ...simulatedOpponents]);

    toast({
      title: "Ante Paid!",
      description: `${anteAmount} Marks added to the pot. Get ready...`,
    });

    // Start countdown
    setStatus('countdown');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVIGATE TO MIRROR
  // ─────────────────────────────────────────────────────────────────────────────

  const handleMirrorClick = (mirrorId: string) => {
    if (status !== 'active' || !path) return;

    const expectedNext = path.nodes[currentIndex + 1];

    if (mirrorId === expectedNext) {
      // Correct choice!
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      // Update progress for user
      setParticipants(prev => prev.map(p =>
        p.displayName === 'You' ? { ...p, progress: newIndex } : p
      ));

      // Check if finished
      if (newIndex >= path.nodes.length - 1) {
        handleFinish();
      } else {
        // Navigate to the route
        const nextMirror = MIRROR_GRAPH[mirrorId];
        if (nextMirror) {
          // Don't actually navigate - just show progress
          toast({
            title: `🪞 ${nextMirror.emoji} ${nextMirror.name}`,
            description: `${newIndex}/${path.nodes.length - 1} mirrors traversed`,
          });
        }
      }

      // Simulate opponent progress
      simulateOpponentProgress();
    } else {
      // Wrong choice!
      toast({
        title: "Wrong Mirror!",
        description: "That's not the path the wisp took...",
        variant: "destructive",
      });

      // Add pickle time
      setPickleState({ isPickle: true, severity: 0.3, hint: "Wrong turn! Find your way back." });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SIMULATE OPPONENTS
  // ─────────────────────────────────────────────────────────────────────────────

  const simulateOpponentProgress = () => {
    if (!path) return;

    setParticipants(prev => prev.map(p => {
      // Skip the player (whether authenticated or ghost)
      if (p.displayName === 'You' || p.displayName === '👻 You (Ghost)' || p.status !== 'chasing') return p;

      // Random chance to advance
      const advanceChance = difficulty === 'novice' ? 0.3 :
                           difficulty === 'journeyman' ? 0.4 :
                           difficulty === 'expert' ? 0.5 : 0.6;

      if (Math.random() < advanceChance) {
        const newProgress = Math.min(p.progress + 1, path.nodes.length - 1);
        return { ...p, progress: newProgress };
      }
      return p;
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FINISH (supports both authenticated users and Ghosts)
  // ─────────────────────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    setStatus('finished');

    // Determine position among participants
    const finishedParticipants = participants.filter(p =>
      p.status === 'finished' || p.displayName === 'You' || p.displayName === '👻 You (Ghost)'
    );
    const position = finishedParticipants.length;
    setFinishPosition(position);

    // Update self as finished
    setParticipants(prev => prev.map(p =>
      (p.displayName === 'You' || p.displayName === '👻 You (Ghost)')
        ? { ...p, status: 'finished', finishPosition: position }
        : p
    ));

    // Calculate payout (simplified)
    const totalParticipants = participants.length;
    const isWinner = position <= Math.ceil(totalParticipants / 2);

    const { data: { user } } = await supabase.auth.getUser();
    let playerPayout = 0;

    if (isWinner) {
      const totalPot = anteAmount * totalParticipants;
      const winnerPot = Math.floor(totalPot * 0.8); // 80% after platform cut
      const numWinners = Math.ceil(totalParticipants / 2);

      // Tiered payout - higher positions get more
      const tierMultiplier = (numWinners - position + 1) / ((numWinners * (numWinners + 1)) / 2);
      playerPayout = Math.floor(winnerPot * tierMultiplier);

      setPayout(playerPayout);

      // Credit winnings based on user type
      if (isGhost && ghostSession) {
        // Ghost mode - add to session candles
        const updatedSession = addGhostWinnings(ghostSession, playerPayout);
        setGhostSession(updatedSession);
        setUserMarks(Math.floor(updatedSession.loot.candles));

        // Update Ghost chase stats
        updateGhostChaseStats(position, totalParticipants, anteAmount, playerPayout, timeElapsedMs, 'finished');
      } else if (user) {
        await supabase
          .from('profiles')
          .update({ marks: userMarks + playerPayout })
          .eq('id', user.id);

        setUserMarks(prev => prev + playerPayout);
      }

      toast({
        title: `🏆 You finished ${getOrdinal(position)}!`,
        description: `Won ${playerPayout} ${isGhost ? 'Candles' : 'Marks'}!`,
      });
    } else {
      // Update Ghost stats for loss
      if (isGhost && ghostSession) {
        updateGhostChaseStats(position, totalParticipants, anteAmount, 0, timeElapsedMs, 'lost');
      }

      toast({
        title: `You finished ${getOrdinal(position)}`,
        description: `Better luck next time. You needed to beat half to win.`,
        variant: "destructive",
      });
    }

    // Check for Crow Feathers (records) - works for BOTH users and Ghosts!
    // "Crow Feathers are the ONLY thing that persists for Ghosts"
    const userId = isGhost && ghostSession
      ? ghostSession.sessionId  // Ghost uses session ID as pseudo-user-ID
      : user?.id;

    if (userId) {
      try {
        const result = await processChaseCompletion(
          userId,
          chaseId || `local-${Date.now()}`,
          timeElapsedMs,
          position,
          difficulty,
          playerPayout
        );

        // Notify if Crow Feather earned
        if (result.crowFeathersEarned.length > 0 && onCrowFeatherEarned) {
          // Show the first one earned (typically speed record)
          onCrowFeatherEarned(result.crowFeathersEarned[0]);
        }
      } catch (error) {
        console.error('Error checking for crow feathers:', error);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // QUIT
  // ─────────────────────────────────────────────────────────────────────────────

  const handleQuit = () => {
    if (status === 'active') {
      setStatus('lost');
      setParticipants(prev => prev.map(p =>
        (p.displayName === 'You' || p.displayName === '👻 You (Ghost)')
          ? { ...p, status: 'quit' } : p
      ));

      // Update Ghost chase stats for quit
      if (isGhost && ghostSession) {
        updateGhostChaseStats(999, participants.length, anteAmount, 0, timeElapsedMs, 'quit');
      }

      toast({
        title: "You quit the chase",
        description: `Lost your ${anteAmount} ${isGhost ? 'Candle' : 'Mark'} ante.`,
        variant: "destructive",
      });
    }
    onClose();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getDifficultyColor = (d: ChaseDifficulty): string => {
    switch (d) {
      case 'novice': return '#34d399';
      case 'journeyman': return '#60a5fa';
      case 'expert': return '#f59e0b';
      case 'legendary': return '#ef4444';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  const currentMirror = path ? MIRROR_GRAPH[path.nodes[currentIndex]] : null;
  const nextSteps = path ? getNextSteps(path.nodes[currentIndex], path.nodes, currentIndex) : null;

  return (
    <div className="wisp-chase-overlay">
      {/* Header Stats Bar */}
      <div className="chase-header">
        <div className="chase-stat">
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeElapsedMs)}</span>
        </div>
        <div className="chase-stat">
          <Users className="w-4 h-4" />
          <span>{participants.length} in the fray</span>
        </div>
        <div className="chase-stat">
          <Coins className="w-4 h-4" />
          <span>{anteAmount * participants.length} Marks pot</span>
        </div>
        <div
          className="chase-difficulty"
          style={{ color: getDifficultyColor(difficulty) }}
        >
          {difficulty.toUpperCase()}
        </div>
        <button className="chase-close" onClick={handleQuit}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="chase-content">
        {/* LOBBY STATE */}
        {status === 'lobby' && (
          <div className="chase-lobby">
            <div className="chase-wisp-icon">🕯️</div>
            <h2>Will-o'-Wisp Chase</h2>
            <p className="chase-difficulty-label" style={{ color: getDifficultyColor(difficulty) }}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
            </p>

            <div className="chase-path-preview">
              <h4>The Path</h4>
              <div className="path-nodes">
                {path?.nodes.map((nodeId, i) => {
                  const node = MIRROR_GRAPH[nodeId];
                  return (
                    <span key={i} className="path-node">
                      {node?.emoji || '?'}
                    </span>
                  );
                })}
              </div>
              <p>{path?.nodes.length || 0} mirrors to traverse</p>
            </div>

            <div className="ante-section">
              <div className="ante-info">
                <Coins className="w-5 h-5" />
                <span>Ante: {anteAmount} Marks</span>
              </div>
              <p className="balance-info">Your balance: {userMarks} Marks</p>
            </div>

            <Button
              onClick={handleAnteUp}
              disabled={userMarks < anteAmount}
              className="ante-button"
            >
              <Zap className="w-4 h-4 mr-2" />
              Ante Up & Join the Fray
            </Button>

            {userMarks < anteAmount && (
              <p className="insufficient-funds">
                Need {anteAmount - userMarks} more Marks
              </p>
            )}

            <p className="chase-rules">
              Beat half the participants to win!<br />
              Platform takes 20% • Tiered payout by finish order
            </p>
          </div>
        )}

        {/* COUNTDOWN STATE */}
        {status === 'countdown' && (
          <div className="chase-countdown">
            <div className="countdown-number">{countdownSeconds}</div>
            <p>Get ready to chase...</p>
            <div className="chase-wisp-icon pulsing">🕯️</div>
          </div>
        )}

        {/* ACTIVE CHASE STATE */}
        {status === 'active' && path && currentMirror && nextSteps && (
          <div className="chase-active">
            {/* Current Position */}
            <div className="current-position">
              <span className="current-emoji">{currentMirror.emoji}</span>
              <h3>{currentMirror.name}</h3>
              <p className="progress-text">
                {currentIndex} / {path.nodes.length - 1} mirrors
              </p>
            </div>

            {/* Progress Bar */}
            <div className="chase-progress">
              <div
                className="chase-progress-fill"
                style={{ width: `${(currentIndex / (path.nodes.length - 1)) * 100}%` }}
              />
            </div>

            {/* Pickle Warning */}
            {pickleState.isPickle && (
              <div className="pickle-warning" style={{ opacity: pickleState.severity }}>
                <AlertTriangle className="w-5 h-5" />
                <span>{pickleState.hint}</span>
              </div>
            )}

            {/* Mirror Choices */}
            <div className="mirror-choices">
              <h4>Choose a Mirror</h4>
              <div className="mirror-grid">
                {/* Show all connected mirrors (including wrong ones) */}
                {[nextSteps.correct, ...nextSteps.alternatives].filter(Boolean).sort(() => Math.random() - 0.5).map(mirrorId => {
                  const mirror = MIRROR_GRAPH[mirrorId!];
                  if (!mirror) return null;
                  return (
                    <button
                      key={mirrorId}
                      className="mirror-choice"
                      onClick={() => handleMirrorClick(mirrorId!)}
                    >
                      <span className="mirror-emoji">{mirror.emoji}</span>
                      <span className="mirror-name">{mirror.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Leaderboard */}
            <div className="chase-leaderboard">
              <h4>The Fray</h4>
              <div className="leaderboard-list">
                {[...participants]
                  .sort((a, b) => b.progress - a.progress)
                  .map((p, i) => (
                    <div
                      key={p.userId}
                      className={`leaderboard-entry ${p.displayName === 'You' ? 'is-you' : ''}`}
                    >
                      <span className="lb-position">{i + 1}</span>
                      <span className="lb-name">{p.displayName}</span>
                      <span className="lb-progress">{p.progress}/{path.nodes.length - 1}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* FINISHED STATE */}
        {(status === 'finished' || status === 'lost') && (
          <div className="chase-finished">
            {payout > 0 ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400" />
                <h2>Victory!</h2>
                <p className="finish-position">You finished {getOrdinal(finishPosition || 0)}</p>
                <div className="payout-display">
                  <Coins className="w-6 h-6" />
                  <span>+{payout} Marks</span>
                </div>
              </>
            ) : (
              <>
                <div className="lost-icon">💀</div>
                <h2>{status === 'lost' ? 'Quit' : 'Defeated'}</h2>
                <p className="finish-position">
                  {status === 'lost'
                    ? 'You abandoned the chase'
                    : `You finished ${getOrdinal(finishPosition || participants.length)}`
                  }
                </p>
                <p className="lost-message">
                  Lost {anteAmount} Marks<br />
                  You needed to beat half the participants
                </p>
              </>
            )}

            <div className="final-leaderboard">
              <h4>Final Results</h4>
              {participants
                .sort((a, b) => (a.finishPosition || 99) - (b.finishPosition || 99))
                .map((p, i) => (
                  <div
                    key={p.userId}
                    className={`final-entry ${p.displayName === 'You' ? 'is-you' : ''} ${i < Math.ceil(participants.length / 2) ? 'winner' : 'loser'}`}
                  >
                    <span>{i < Math.ceil(participants.length / 2) ? '🏆' : '💀'}</span>
                    <span>{p.displayName}</span>
                  </div>
                ))
              }
            </div>

            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </div>

      {/* Floating Wisp */}
      {status === 'active' && (
        <div className="floating-wisp">
          <span>🕯️</span>
        </div>
      )}
    </div>
  );
};

export default WispChaseMode;
