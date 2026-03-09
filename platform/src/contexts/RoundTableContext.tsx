/**
 * ROUND TABLE CONTEXT PROVIDER
 * ==============================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 1
 * Ticket: B-010
 *
 * Active round table state management:
 *   - Current table and topic
 *   - Mic request queue (FIFO)
 *   - Active speaker tracking
 *   - Coverage minute consumption per participant
 *   - Auto-mute enforcement when minutes run out
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  type RoundTable,
  type RoundTableParticipant,
  type MicRequest,
  type RoundTableSession,
  type TableStatus,
  createRoundTable,
  joinTable,
  requestMic,
  grantNextMic,
  releaseMic,
  shouldAutoMute,
  getTableSummary,
  MAX_TABLE_PARTICIPANTS,
  MIC_DEBIT_INTERVAL_MS,
  MIC_COOLDOWN_SECONDS,
} from "@/lib/discourse/roundTables";

import type { CoverageMinuteAccount } from "@/lib/discourse/coverageMinutes";

// ── Context Types ──────────────────────────────────────────────────────────

interface RoundTableState {
  /** Current active table (null if not at a table) */
  currentTable: RoundTable | null;
  /** Whether the user is currently speaking */
  isSpeaking: boolean;
  /** Whether the user is in the mic queue */
  isInQueue: boolean;
  /** Position in the mic queue (0 if not in queue) */
  queuePosition: number;
  /** Active speaker info */
  activeSpeaker: { memberId: string; startedAt: string } | null;
  /** Number of participants */
  participantCount: number;
  /** Queue length */
  queueLength: number;
  /** Table status */
  tableStatus: TableStatus | null;
  /** Cooldown active (after auto-mute) */
  isCooldownActive: boolean;
  /** Seconds of speaking in current session */
  sessionMinutesSpoken: number;
  /** Is the context loading */
  isLoading: boolean;
}

interface RoundTableActions {
  /** Create a new Round Table for a topic */
  createTable: (
    topicId: string,
    topicName: string,
    topicDescription: string,
  ) => void;
  /** Join an existing Round Table */
  joinExistingTable: (table: RoundTable) => { success: boolean; reason?: string };
  /** Leave the current Round Table */
  leaveTable: () => void;
  /** Request the microphone */
  requestMicrophone: (
    account: CoverageMinuteAccount,
    estimatedDuration?: number,
  ) => { queued: boolean; position: number; reason?: string };
  /** Release the microphone voluntarily */
  releaseMicrophone: () => { minutesSpoken: number };
  /** Grant mic to next person in queue (moderator action) */
  grantNextSpeaker: () => MicRequest | null;
  /** Check if auto-mute should trigger */
  checkAutoMute: (speakerAccount: CoverageMinuteAccount) => boolean;
  /** Force-mute the active speaker (moderator action) */
  forceMute: () => { minutesSpoken: number };
  /** Get the table summary */
  getSummary: () => ReturnType<typeof getTableSummary> | null;
  /** Start the table session (moderator action) */
  startSession: () => void;
  /** End the table session (moderator action) */
  endSession: () => void;
  /** Pause the table session (moderator action) */
  pauseSession: () => void;
}

type RoundTableContextType = RoundTableState & RoundTableActions;

// ── Context ────────────────────────────────────────────────────────────────

const RoundTableContext = createContext<RoundTableContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function RoundTableProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [currentTable, setCurrentTable] = useState<RoundTable | null>(null);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [sessionMinutesSpoken, setSessionMinutesSpoken] = useState(0);
  const [isLoading] = useState(false);

  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const memberId = user?.id ?? "";
  const isSpeaking = currentTable?.activeSpeakerId === memberId;
  const isInQueue = currentTable
    ? currentTable.micRequestQueue.some(
        r => r.memberId === memberId && r.status === "queued",
      )
    : false;
  const queuePosition = currentTable
    ? (() => {
        const queued = currentTable.micRequestQueue.filter(r => r.status === "queued");
        const idx = queued.findIndex(r => r.memberId === memberId);
        return idx >= 0 ? idx + 1 : 0;
      })()
    : 0;
  const activeSpeaker = currentTable?.activeSpeakerId
    ? {
        memberId: currentTable.activeSpeakerId,
        startedAt: currentTable.activeSpeakerStartedAt ?? new Date().toISOString(),
      }
    : null;
  const participantCount = currentTable?.participantIds.length ?? 0;
  const queueLength = currentTable
    ? currentTable.micRequestQueue.filter(r => r.status === "queued").length
    : 0;
  const tableStatus = currentTable?.status ?? null;

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  // ── Actions ──

  const createTableAction = useCallback((
    topicId: string,
    topicName: string,
    topicDescription: string,
  ) => {
    if (!memberId) return;

    const table = createRoundTable(topicId, topicName, topicDescription, memberId);
    setCurrentTable(table);
    setSessionMinutesSpoken(0);
  }, [memberId]);

  const joinExistingTable = useCallback((table: RoundTable) => {
    if (!memberId) return { success: false, reason: "Not authenticated." };

    const result = joinTable(table, memberId);
    if (result.success) {
      // Add ourselves to the participant list
      table.participantIds.push(memberId);
      setCurrentTable({ ...table });
      setSessionMinutesSpoken(0);
    }

    return result;
  }, [memberId]);

  const leaveTable = useCallback(() => {
    if (!currentTable || !memberId) return;

    // If we're speaking, release the mic first
    if (currentTable.activeSpeakerId === memberId) {
      releaseMic(currentTable, memberId, "voluntary");
    }

    // Remove ourselves from the participant list
    currentTable.participantIds = currentTable.participantIds.filter(id => id !== memberId);

    // Cancel any queued mic requests
    for (const req of currentTable.micRequestQueue) {
      if (req.memberId === memberId && req.status === "queued") {
        req.status = "cancelled";
      }
    }

    setCurrentTable(null);
    setSessionMinutesSpoken(0);
  }, [currentTable, memberId]);

  const requestMicrophone = useCallback((
    account: CoverageMinuteAccount,
    estimatedDuration?: number,
  ) => {
    if (!currentTable || !memberId || !user) {
      return { queued: false, position: -1, reason: "Not at a table." };
    }

    const memberName = user.user_metadata?.full_name ?? user.email ?? "Member";
    const result = requestMic(
      currentTable,
      memberId,
      memberName,
      account,
      estimatedDuration,
    );

    // Force re-render with updated queue
    setCurrentTable({ ...currentTable });

    return result;
  }, [currentTable, memberId, user]);

  const releaseMicrophone = useCallback(() => {
    if (!currentTable || !memberId) return { minutesSpoken: 0 };

    const result = releaseMic(currentTable, memberId, "voluntary");
    setSessionMinutesSpoken(prev => prev + result.minutesSpoken);

    // Start cooldown
    setIsCooldownActive(true);
    cooldownTimerRef.current = setTimeout(() => {
      setIsCooldownActive(false);
    }, MIC_COOLDOWN_SECONDS * 1000);

    // Force re-render
    setCurrentTable({ ...currentTable });

    return result;
  }, [currentTable, memberId]);

  const grantNextSpeaker = useCallback(() => {
    if (!currentTable) return null;

    const granted = grantNextMic(currentTable);
    setCurrentTable({ ...currentTable });
    return granted;
  }, [currentTable]);

  const checkAutoMute = useCallback((speakerAccount: CoverageMinuteAccount) => {
    if (!currentTable) return false;
    return shouldAutoMute(currentTable, speakerAccount);
  }, [currentTable]);

  const forceMute = useCallback(() => {
    if (!currentTable || !currentTable.activeSpeakerId) return { minutesSpoken: 0 };

    const result = releaseMic(
      currentTable,
      currentTable.activeSpeakerId,
      "moderator_action",
    );

    setIsCooldownActive(true);
    cooldownTimerRef.current = setTimeout(() => {
      setIsCooldownActive(false);
    }, MIC_COOLDOWN_SECONDS * 1000);

    setCurrentTable({ ...currentTable });
    return result;
  }, [currentTable]);

  const getSummary = useCallback(() => {
    if (!currentTable) return null;
    return getTableSummary(currentTable);
  }, [currentTable]);

  const startSession = useCallback(() => {
    if (!currentTable) return;
    currentTable.status = "active";
    setCurrentTable({ ...currentTable });
  }, [currentTable]);

  const endSession = useCallback(() => {
    if (!currentTable) return;
    currentTable.status = "concluded";
    currentTable.sessionEndedAt = new Date().toISOString();

    // Release active speaker if any
    if (currentTable.activeSpeakerId) {
      releaseMic(currentTable, currentTable.activeSpeakerId, "moderator_action");
    }

    setCurrentTable({ ...currentTable });
  }, [currentTable]);

  const pauseSession = useCallback(() => {
    if (!currentTable) return;
    currentTable.status = "paused";

    // Release active speaker if any
    if (currentTable.activeSpeakerId) {
      releaseMic(currentTable, currentTable.activeSpeakerId, "moderator_action");
    }

    setCurrentTable({ ...currentTable });
  }, [currentTable]);

  // ── Context Value ──

  const value: RoundTableContextType = {
    currentTable,
    isSpeaking,
    isInQueue,
    queuePosition,
    activeSpeaker,
    participantCount,
    queueLength,
    tableStatus,
    isCooldownActive,
    sessionMinutesSpoken,
    isLoading,
    createTable: createTableAction,
    joinExistingTable,
    leaveTable,
    requestMicrophone,
    releaseMicrophone,
    grantNextSpeaker,
    checkAutoMute,
    forceMute,
    getSummary,
    startSession,
    endSession,
    pauseSession,
  };

  return (
    <RoundTableContext.Provider value={value}>
      {children}
    </RoundTableContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useRoundTable() {
  const context = useContext(RoundTableContext);
  if (!context) {
    throw new Error("useRoundTable must be used within a RoundTableProvider");
  }
  return context;
}
