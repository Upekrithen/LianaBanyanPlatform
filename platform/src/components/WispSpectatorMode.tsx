/**
 * WISP SPECTATOR MODE
 * ====================
 * Watch ongoing Will-o'-Wisp chases without participating.
 * Live position tracking of all participants.
 *
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, Users, Clock, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { MIRROR_GRAPH } from '@/lib/mirrorGraph';
import { WispChase } from '@/lib/wispChaseService';
import './WispSpectatorMode.css';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SpectatorParticipant {
  userId: string;
  displayName: string;
  avatar?: string;
  currentMirrorIndex: number;
  status: 'chasing' | 'finished' | 'lost' | 'quit';
  finishPosition?: number;
}

interface WispSpectatorModeProps {
  isOpen: boolean;
  onClose: () => void;
  chaseId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const WispSpectatorMode: React.FC<WispSpectatorModeProps> = ({
  isOpen,
  onClose,
  chaseId,
}) => {
  const [chase, setChase] = useState<WispChase | null>(null);
  const [participants, setParticipants] = useState<SpectatorParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [spectatorCount, setSpectatorCount] = useState(1);

  // Load chase data
  useEffect(() => {
    async function loadChase() {
      if (!chaseId) return;

      setLoading(true);

      const { data: chaseData, error } = await supabase
        .from('wisp_chases')
        .select('*')
        .eq('id', chaseId)
        .single();

      if (error || !chaseData) {
        console.error('Failed to load chase:', error);
        setLoading(false);
        return;
      }

      setChase({
        id: chaseData.id,
        createdAt: new Date(chaseData.created_at),
        startedAt: chaseData.started_at ? new Date(chaseData.started_at) : undefined,
        endedAt: chaseData.ended_at ? new Date(chaseData.ended_at) : undefined,
        status: chaseData.status,
        anteAmount: chaseData.ante_amount,
        minParticipants: chaseData.min_participants,
        maxParticipants: chaseData.max_participants,
        platformCut: parseFloat(chaseData.platform_cut),
        totalPot: chaseData.total_pot,
        participantCount: chaseData.participant_count,
        pathSeed: chaseData.path_seed,
        pathLength: chaseData.path_length,
        difficulty: chaseData.difficulty,
        pathMirrors: chaseData.path_mirrors || [],
        createdBy: chaseData.created_by,
        title: chaseData.title,
        description: chaseData.description,
      });

      setLoading(false);
    }

    if (isOpen && chaseId) {
      loadChase();
    }
  }, [isOpen, chaseId]);

  // Subscribe to real-time participant updates
  useEffect(() => {
    if (!isOpen || !chaseId) return;

    // Load initial participants
    loadParticipants();

    // Subscribe to changes
    const channel = supabase
      .channel(`spectator-${chaseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wisp_chase_participants',
          filter: `chase_id=eq.${chaseId}`,
        },
        (payload) => {
          loadParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, chaseId]);

  // Timer for elapsed time
  useEffect(() => {
    if (!isOpen || !chase?.startedAt || chase.status !== 'active') return;

    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - chase.startedAt!.getTime());
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, chase]);

  const loadParticipants = async () => {
    const { data, error } = await supabase
      .from('wisp_chase_participants')
      .select(`
        id,
        user_id,
        current_mirror_index,
        status,
        finish_position,
        profiles!inner(display_name, avatar_url)
      `)
      .eq('chase_id', chaseId)
      .order('current_mirror_index', { ascending: false });

    if (error || !data) {
      console.error('Failed to load participants:', error);
      return;
    }

    setParticipants(data.map((p: any) => ({
      userId: p.user_id,
      displayName: p.profiles?.display_name || 'Anonymous',
      avatar: p.profiles?.avatar_url,
      currentMirrorIndex: p.current_mirror_index,
      status: p.status,
      finishPosition: p.finish_position,
    })));
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (d: string): string => {
    switch (d) {
      case 'novice': return '#34d399';
      case 'journeyman': return '#60a5fa';
      case 'expert': return '#f59e0b';
      case 'legendary': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="wisp-spectator-dialog bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span>Spectator Mode</span>
            {chase && (
              <span
                className="text-sm ml-2 px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${getDifficultyColor(chase.difficulty)}20`,
                  color: getDifficultyColor(chase.difficulty)
                }}
              >
                {chase.difficulty.toUpperCase()}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading chase...</div>
          </div>
        ) : !chase ? (
          <div className="text-center py-8 text-slate-400">
            Chase not found
          </div>
        ) : (
          <div className="spectator-content">
            {/* Stats Bar */}
            <div className="spectator-stats">
              <div className="stat-item">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div className="stat-item">
                <Users className="w-4 h-4" />
                <span>{participants.length} racers</span>
              </div>
              <div className="stat-item">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>{spectatorCount} watching</span>
              </div>
              <div className="stat-item">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{chase.totalPot} Marks pot</span>
              </div>
            </div>

            {/* Path visualization */}
            <div className="spectator-path">
              <h4>The Path ({chase.pathMirrors.length} mirrors)</h4>
              <div className="path-track">
                {chase.pathMirrors.map((mirrorId, index) => {
                  const mirror = MIRROR_GRAPH[mirrorId];
                  const participantsHere = participants.filter(
                    p => p.currentMirrorIndex === index && p.status === 'chasing'
                  );

                  return (
                    <div key={index} className="path-node-wrapper">
                      <div
                        className={`path-node ${participantsHere.length > 0 ? 'has-players' : ''}`}
                        title={mirror?.name || mirrorId}
                      >
                        <span className="node-emoji">{mirror?.emoji || '?'}</span>
                        {participantsHere.length > 0 && (
                          <span className="player-count">{participantsHere.length}</span>
                        )}
                      </div>
                      {index < chase.pathMirrors.length - 1 && (
                        <div className="path-connector" />
                      )}
                    </div>
                  );
                })}
                <div className="path-finish">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="spectator-leaderboard">
              <h4>Live Standings</h4>
              <div className="leaderboard-entries">
                {participants
                  .sort((a, b) => {
                    // Finished first, then by position, then by progress
                    if (a.status === 'finished' && b.status !== 'finished') return -1;
                    if (b.status === 'finished' && a.status !== 'finished') return 1;
                    if (a.finishPosition && b.finishPosition) {
                      return a.finishPosition - b.finishPosition;
                    }
                    return b.currentMirrorIndex - a.currentMirrorIndex;
                  })
                  .map((p, idx) => (
                    <div
                      key={p.userId}
                      className={`leaderboard-entry ${p.status === 'finished' ? 'finished' : ''} ${p.status === 'quit' ? 'quit' : ''}`}
                    >
                      <span className="entry-position">
                        {p.finishPosition || idx + 1}
                      </span>
                      <span className="entry-name">{p.displayName}</span>
                      <span className="entry-progress">
                        {p.status === 'finished' ? (
                          <Trophy className="w-4 h-4 text-amber-400" />
                        ) : p.status === 'quit' ? (
                          <span className="text-red-400 text-xs">QUIT</span>
                        ) : (
                          `${p.currentMirrorIndex}/${chase.pathMirrors.length}`
                        )}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Chase status */}
            {chase.status === 'completed' && (
              <div className="chase-complete-banner">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>Chase Complete!</span>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVE CHASES LIST
// For browsing and joining as spectator
// ═══════════════════════════════════════════════════════════════════════════════

interface ActiveChasesListProps {
  onSelectChase: (chaseId: string) => void;
}

export const ActiveChasesList: React.FC<ActiveChasesListProps> = ({ onSelectChase }) => {
  const [chases, setChases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveChases();

    // Subscribe to new chases
    const channel = supabase
      .channel('active-chases')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wisp_chases',
          filter: `status=eq.active`,
        },
        () => loadActiveChases()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActiveChases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wisp_chases')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setChases(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-slate-400 text-center py-4">Loading active chases...</div>;
  }

  if (chases.length === 0) {
    return (
      <div className="text-center py-8">
        <Eye className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400">No active chases right now</p>
        <p className="text-slate-500 text-sm">Check back soon or start your own!</p>
      </div>
    );
  }

  return (
    <div className="active-chases-list">
      <h4 className="text-sm font-medium text-slate-400 mb-3">Active Chases</h4>
      {chases.map(chase => (
        <button
          key={chase.id}
          onClick={() => onSelectChase(chase.id)}
          className="active-chase-item"
        >
          <div className="chase-item-header">
            <span className="text-lg">🕯️</span>
            <span className="font-medium">{chase.title || `${chase.difficulty} Chase`}</span>
            <span
              className="difficulty-badge"
              style={{
                color: chase.difficulty === 'legendary' ? '#ef4444' :
                       chase.difficulty === 'expert' ? '#f59e0b' :
                       chase.difficulty === 'journeyman' ? '#60a5fa' : '#34d399'
              }}
            >
              {chase.difficulty}
            </span>
          </div>
          <div className="chase-item-stats">
            <span>{chase.participant_count} racers</span>
            <span>{chase.total_pot} Marks pot</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default WispSpectatorMode;
