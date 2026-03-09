/**
 * WISP REALTIME SERVICE
 * ======================
 * Handles Supabase Realtime subscriptions for live Will-o'-Wisp Chase Mode.
 * Enables true multiplayer by syncing participant progress in real-time.
 * 
 * Uses Supabase Realtime Broadcast and Presence channels.
 * 
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface RealtimeParticipant {
  odivId: string;
  displayName: string;
  avatar?: string;
  progress: number;
  status: 'chasing' | 'finished' | 'lost' | 'quit';
  finishPosition?: number;
  lastUpdate: number;
}

export interface ChaseUpdatePayload {
  type: 'progress' | 'finished' | 'quit' | 'join';
  chaseId: string;
  userId: string;
  displayName: string;
  progress?: number;
  finishPosition?: number;
  finishTimeMs?: number;
  timestamp: number;
}

export interface ChasePresence {
  odivId: string;
  displayName: string;
  online_at: string;
}

type ParticipantUpdateCallback = (participants: RealtimeParticipant[]) => void;
type ChaseEventCallback = (event: ChaseUpdatePayload) => void;

// ═══════════════════════════════════════════════════════════════════════════════
// REALTIME CHANNEL MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

export class WispRealtimeManager {
  private channel: RealtimeChannel | null = null;
  private chaseId: string;
  private userId: string;
  private displayName: string;
  private participants: Map<string, RealtimeParticipant> = new Map();
  private onParticipantsUpdate: ParticipantUpdateCallback | null = null;
  private onChaseEvent: ChaseEventCallback | null = null;

  constructor(chaseId: string, userId: string, displayName: string) {
    this.chaseId = chaseId;
    this.userId = userId;
    this.displayName = displayName;
  }

  /**
   * Connect to the chase channel
   */
  async connect(): Promise<void> {
    // Create channel for this chase
    this.channel = supabase.channel(`wisp-chase-${this.chaseId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: this.userId },
      },
    });

    // Subscribe to presence (who's in the chase)
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel?.presenceState<ChasePresence>() || {};
      this.updateParticipantsFromPresence(state);
    });

    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
    });

    this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      // Mark as quit if they disconnect
      if (key && this.participants.has(key)) {
        const p = this.participants.get(key)!;
        p.status = 'quit';
        this.participants.set(key, p);
        this.notifyParticipantsUpdate();
      }
    });

    // Subscribe to broadcast messages (progress updates)
    this.channel.on('broadcast', { event: 'chase_update' }, ({ payload }) => {
      this.handleChaseUpdate(payload as ChaseUpdatePayload);
    });

    // Also subscribe to database changes for persistence
    this.channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wisp_chase_participants',
        filter: `chase_id=eq.${this.chaseId}`,
      },
      (payload: RealtimePostgresChangesPayload<any>) => {
        this.handleDbChange(payload);
      }
    );

    // Subscribe
    const status = await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track presence
        await this.channel?.track({
          odivId: this.userId,
          displayName: this.displayName,
          online_at: new Date().toISOString(),
        });
      }
    });

  }

  /**
   * Disconnect from the chase channel
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.participants.clear();
  }

  /**
   * Broadcast progress update to all participants
   */
  async broadcastProgress(progress: number): Promise<void> {
    if (!this.channel) return;

    const payload: ChaseUpdatePayload = {
      type: 'progress',
      chaseId: this.chaseId,
      userId: this.userId,
      displayName: this.displayName,
      progress,
      timestamp: Date.now(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'chase_update',
      payload,
    });
  }

  /**
   * Broadcast finish to all participants
   */
  async broadcastFinish(finishPosition: number, finishTimeMs: number): Promise<void> {
    if (!this.channel) return;

    const payload: ChaseUpdatePayload = {
      type: 'finished',
      chaseId: this.chaseId,
      userId: this.userId,
      displayName: this.displayName,
      finishPosition,
      finishTimeMs,
      timestamp: Date.now(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'chase_update',
      payload,
    });
  }

  /**
   * Broadcast quit to all participants
   */
  async broadcastQuit(): Promise<void> {
    if (!this.channel) return;

    const payload: ChaseUpdatePayload = {
      type: 'quit',
      chaseId: this.chaseId,
      userId: this.userId,
      displayName: this.displayName,
      timestamp: Date.now(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'chase_update',
      payload,
    });
  }

  /**
   * Set callback for participant updates
   */
  onParticipantsChange(callback: ParticipantUpdateCallback): void {
    this.onParticipantsUpdate = callback;
  }

  /**
   * Set callback for chase events
   */
  onEvent(callback: ChaseEventCallback): void {
    this.onChaseEvent = callback;
  }

  /**
   * Get current participants
   */
  getParticipants(): RealtimeParticipant[] {
    return Array.from(this.participants.values());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  private handleChaseUpdate(payload: ChaseUpdatePayload): void {
    const existing = this.participants.get(payload.userId) || {
      odivId: payload.userId,
      displayName: payload.displayName,
      progress: 0,
      status: 'chasing' as const,
      lastUpdate: Date.now(),
    };

    switch (payload.type) {
      case 'progress':
        existing.progress = payload.progress || existing.progress;
        existing.lastUpdate = payload.timestamp;
        break;
      case 'finished':
        existing.status = 'finished';
        existing.finishPosition = payload.finishPosition;
        existing.lastUpdate = payload.timestamp;
        break;
      case 'quit':
        existing.status = 'quit';
        existing.lastUpdate = payload.timestamp;
        break;
      case 'join':
        existing.status = 'chasing';
        existing.progress = 0;
        existing.lastUpdate = payload.timestamp;
        break;
    }

    this.participants.set(payload.userId, existing);
    this.notifyParticipantsUpdate();
    
    if (this.onChaseEvent) {
      this.onChaseEvent(payload);
    }
  }

  private handleDbChange(payload: RealtimePostgresChangesPayload<any>): void {
    // Handle database changes as backup/sync
    const record = payload.new as any;
    if (!record) return;

    const participant: RealtimeParticipant = {
      odivId: record.user_id,
      displayName: record.display_name || 'Unknown',
      progress: record.current_mirror_index || 0,
      status: record.status || 'chasing',
      finishPosition: record.finish_position,
      lastUpdate: Date.now(),
    };

    this.participants.set(record.user_id, participant);
    this.notifyParticipantsUpdate();
  }

  private updateParticipantsFromPresence(state: Record<string, ChasePresence[]>): void {
    for (const [userId, presences] of Object.entries(state)) {
      if (presences.length === 0) continue;
      const presence = presences[0];
      
      if (!this.participants.has(userId)) {
        this.participants.set(userId, {
          odivId: userId,
          displayName: presence.displayName,
          progress: 0,
          status: 'chasing',
          lastUpdate: Date.now(),
        });
      }
    }
    this.notifyParticipantsUpdate();
  }

  private notifyParticipantsUpdate(): void {
    if (this.onParticipantsUpdate) {
      this.onParticipantsUpdate(this.getParticipants());
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHMAKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find an active chase to join or create a new one
 */
export async function findOrCreateChase(
  difficulty: string,
  userId: string
): Promise<{ chaseId: string; isNew: boolean }> {
  // Look for pending chases at this difficulty
  const { data: pendingChases } = await supabase
    .from('wisp_chases')
    .select('*')
    .eq('difficulty', difficulty)
    .eq('status', 'pending')
    .lt('participant_count', 8) // Max 8 participants
    .order('created_at', { ascending: true })
    .limit(1);

  if (pendingChases && pendingChases.length > 0) {
    return { chaseId: pendingChases[0].id, isNew: false };
  }

  // Create new chase
  const { data: newChase, error } = await supabase
    .from('wisp_chases')
    .insert({
      difficulty,
      status: 'pending',
      created_by: userId,
      ante_amount: getAnteForDifficulty(difficulty),
    })
    .select()
    .single();

  if (error || !newChase) {
    throw new Error('Failed to create chase');
  }

  return { chaseId: newChase.id, isNew: true };
}

function getAnteForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'novice': return 10;
    case 'journeyman': return 25;
    case 'expert': return 50;
    case 'legendary': return 100;
    default: return 10;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  WispRealtimeManager,
  findOrCreateChase,
};
