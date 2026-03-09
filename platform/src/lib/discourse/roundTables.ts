/**
 * ROUND TABLES — Structured Discourse System
 * ===========================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 1
 *
 * Round Tables are the venue for voice-based discourse in Political Discourse
 * and Areopagus. Key architectural constraints:
 *
 *   - ONE microphone works at a time per table
 *   - ONE table per topic — structured discourse by design
 *   - No shouting, no interrupting — physically impossible by architecture
 *   - Coverage Minutes are consumed while speaking, earned while listening
 *   - When your Coverage Minutes run out, your mic mutes
 *
 * This creates organically enforced civility. You earn respect by listening.
 */

import {
  type CoverageMinuteAccount,
  canSpeak,
  MAX_SESSION_BROADCAST,
  ACCUMULATION_INCREMENT,
} from "./coverageMinutes";

// ─── Constants ──────────────────────────────────────────────────────────────

/** Maximum participants per round table */
export const MAX_TABLE_PARTICIPANTS = 12;

/** Minimum Coverage Minutes balance to join a table */
export const MIN_BALANCE_TO_JOIN = 0; // can join to listen with 0 balance

/** How often (in ms) to debit Coverage Minutes while speaking */
export const MIC_DEBIT_INTERVAL_MS = 60_000; // every 60 seconds

/** Grace period (seconds) after mic auto-mute before another can speak */
export const MIC_COOLDOWN_SECONDS = 5;

// ── WebRTC Infrastructure (R-006 Integration) ────────────────────────────
//
// Per Rook research R-006: LiveKit is the recommended WebRTC provider.
//
// Architecture:
//   - LiveKit SFU (Selective Forwarding Unit) — open-source, Go-based
//   - Start with LiveKit Cloud, migrate to Self-Hosted for Phase MimicTrunks
//   - Server-side `canPublish` permission enforces one-mic-at-a-time at NETWORK level
//   - Data Channels (or Supabase Realtime) for mic queue state
//   - Edge Function deducts 1 Coverage Minute per minute while `canPublish: true`
//   - If balance hits 0, Edge Function revokes `canPublish` instantly (mid-sentence)
//
// Why LiveKit over alternatives:
//   - Daily.co: Too expensive per-user-minute for long-form discourse
//   - Janus: Steep learning curve, barebones APIs
//   - Custom SFU (Pion/Mediasoup): Massive technical debt, requires WebRTC team
//
// Audio-only SFU is extremely efficient: ~30-50 kbps per user.
// 200 users in a Town Hall with 1 speaker = trivial bandwidth.

/** Supported WebRTC providers (LiveKit recommended) */
export const WEBRTC_PROVIDERS = [
  "livekit_cloud",
  "livekit_selfhosted",
  "daily",
  "custom_sfu",
] as const;

export type WebRTCProvider = typeof WEBRTC_PROVIDERS[number];

/** Default WebRTC provider */
export const DEFAULT_WEBRTC_PROVIDER: WebRTCProvider = "livekit_cloud";

/** LiveKit Room participant limits by table size category */
export const LIVEKIT_TABLE_SIZES = {
  /** Small Round Table: intimate discussion */
  SMALL: { maxParticipants: 12, label: "Small Table" },
  /** Medium Forum: broader debate */
  MEDIUM: { maxParticipants: 50, label: "Medium Forum" },
  /** Town Hall: large-scale discourse */
  TOWN_HALL: { maxParticipants: 200, label: "Town Hall" },
} as const;

export type LiveKitTableSize = keyof typeof LIVEKIT_TABLE_SIZES;

/** Estimated monthly cost per table size at 40 hrs/mo active time (R-006) */
export const LIVEKIT_COST_ESTIMATES = {
  SMALL: { cloud: 5, selfHosted: 50 },
  MEDIUM: { cloud: 25, selfHosted: 50 },
  TOWN_HALL: { cloud: 100, selfHosted: 100 },
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────

export type TableStatus = "waiting" | "active" | "paused" | "concluded";
export type ParticipantRole = "speaker" | "listener" | "moderator";
export type MicRequestStatus = "queued" | "active" | "expired" | "cancelled";

// ── WebRTC Room Types (R-006 Integration) ───────────────────────────────────

/**
 * LiveKit Room configuration for a Round Table.
 * The `canPublish` permission is the KEY enforcement mechanism:
 * all participants join with canPublish: false, only the active speaker
 * gets canPublish: true via server-side API call.
 */
export interface LiveKitRoomConfig {
  /** LiveKit Room name (maps to Round Table ID) */
  roomName: string;
  /** LiveKit server URL */
  serverUrl: string;
  /** API key reference (stored in Supabase vault, NOT client-side) */
  apiKeyRef: string;
  /** API secret reference (stored in Supabase vault) */
  apiSecretRef: string;
  /** Table size category */
  tableSize: LiveKitTableSize;
  /** Whether the room is currently active */
  isActive: boolean;
  /** Audio codec (Opus recommended for voice) */
  audioCodec: "opus" | "red_opus";
  /** Whether recording is enabled (for transparency ledger) */
  recordingEnabled: boolean;
  /** Region for latency optimization */
  region: string;
  /** Created at */
  createdAt: string;
}

/**
 * Server-side mic permission state.
 * This is the enforcement layer: only one participant has canPublish: true
 * at any given time. All permission changes go through the LB Edge Function,
 * which also manages Coverage Minutes deductions.
 */
export interface MicPermissionState {
  /** Round Table ID */
  tableId: string;
  /** Currently publishing participant (null = silence) */
  activePublisherId: string | null;
  /** When the active publisher was granted canPublish */
  publishGrantedAt: string | null;
  /** Coverage Minutes remaining for active publisher at grant time */
  publisherBalanceAtGrant: number;
  /** Edge Function endpoint that manages permissions */
  edgeFunctionUrl: string;
  /** Interval (ms) at which Edge Function deducts Coverage Minutes */
  debitIntervalMs: number;
  /** Last debit timestamp */
  lastDebitAt: string | null;
}

/**
 * Coverage Minutes consumption event fired by the Edge Function
 * while a speaker holds `canPublish: true`.
 */
export interface CoverageDebitEvent {
  /** Event ID */
  id: string;
  /** Round Table ID */
  tableId: string;
  /** Speaker's member ID */
  speakerId: string;
  /** Minutes debited */
  minutesDebited: number;
  /** Remaining balance after debit */
  remainingBalance: number;
  /** Whether the speaker was auto-muted (balance hit 0) */
  autoMuted: boolean;
  /** Timestamp */
  timestamp: string;
  /** Ledger entry ID */
  ledgerEntryId: string;
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface RoundTable {
  id: string;
  topicId: string;
  topicName: string;
  topicDescription: string;
  status: TableStatus;
  activeSpeakerId: string | null;      // only ONE mic active
  activeSpeakerStartedAt: string | null;
  moderatorId: string;
  participantIds: string[];
  maxParticipants: number;
  micRequestQueue: MicRequest[];       // FIFO queue
  coverageConsumed: Record<string, number>; // memberId → minutes consumed speaking
  coverageEarned: Record<string, number>;   // memberId → minutes earned listening
  sessionStartedAt: string;
  sessionEndedAt?: string;
  createdAt: string;
  ledgerSessionId: string;            // recorded in Immutable Ledger
}

export interface RoundTableParticipant {
  memberId: string;
  memberName: string;
  role: ParticipantRole;
  joinedAt: string;
  sessionMinutesSpoken: number;       // within this session
  sessionMinutesListened: number;     // within this session
  isMuted: boolean;                   // mic off (either voluntary or out of minutes)
  coverageBalance: number;            // snapshot of their balance
}

export interface MicRequest {
  id: string;
  memberId: string;
  memberName: string;
  requestedAt: string;
  status: MicRequestStatus;
  estimatedDuration?: number;         // how long they want to speak (optional)
  grantedAt?: string;
  releasedAt?: string;
}

export interface RoundTableSession {
  id: string;
  tableId: string;
  topicId: string;
  startedAt: string;
  endedAt?: string;
  totalParticipants: number;
  totalMinutesSpoken: number;
  totalMinutesListened: number;
  speakerHistory: Array<{
    memberId: string;
    startedAt: string;
    endedAt: string;
    minutesSpoken: number;
  }>;
  ledgerEntryId: string;
}

// ─── Table Management Functions ─────────────────────────────────────────────

/**
 * Create a new Round Table for a topic.
 * One table per topic — enforced at the caller level.
 */
export function createRoundTable(
  topicId: string,
  topicName: string,
  topicDescription: string,
  moderatorId: string,
): RoundTable {
  const now = new Date().toISOString();
  return {
    id: `rt-${topicId}-${Date.now()}`,
    topicId,
    topicName,
    topicDescription,
    status: "waiting",
    activeSpeakerId: null,
    activeSpeakerStartedAt: null,
    moderatorId,
    participantIds: [moderatorId],
    maxParticipants: MAX_TABLE_PARTICIPANTS,
    micRequestQueue: [],
    coverageConsumed: {},
    coverageEarned: {},
    sessionStartedAt: now,
    createdAt: now,
    ledgerSessionId: `ledger-rt-${Date.now()}`,
  };
}

/**
 * Join a Round Table as a listener.
 * No minimum balance required — you can always listen.
 */
export function joinTable(
  table: RoundTable,
  memberId: string,
): { success: boolean; reason?: string } {
  if (table.participantIds.length >= table.maxParticipants) {
    return { success: false, reason: "Table is full." };
  }

  if (table.participantIds.includes(memberId)) {
    return { success: false, reason: "Already at this table." };
  }

  if (table.status === "concluded") {
    return { success: false, reason: "This discussion has concluded." };
  }

  return { success: true };
}

/**
 * Request the microphone.
 * Adds the request to the FIFO queue. The mic is granted in order.
 * The requester must have Coverage Minutes to speak.
 */
export function requestMic(
  table: RoundTable,
  memberId: string,
  memberName: string,
  account: CoverageMinuteAccount,
  estimatedDuration?: number,
): { queued: boolean; position: number; reason?: string } {
  // Check if they have any Coverage Minutes at all
  const speakCheck = canSpeak(
    account,
    ACCUMULATION_INCREMENT, // minimum to get on mic
    table.coverageConsumed[memberId] ?? 0,
  );

  if (!speakCheck.allowed) {
    return { queued: false, position: -1, reason: speakCheck.reason };
  }

  // Check if already in queue
  const existing = table.micRequestQueue.find(
    r => r.memberId === memberId && r.status === "queued",
  );
  if (existing) {
    const pos = table.micRequestQueue.filter(r => r.status === "queued").indexOf(existing);
    return { queued: true, position: pos + 1, reason: "Already in queue." };
  }

  const request: MicRequest = {
    id: `mic-${memberId}-${Date.now()}`,
    memberId,
    memberName,
    requestedAt: new Date().toISOString(),
    status: "queued",
    estimatedDuration,
  };

  table.micRequestQueue.push(request);
  const position = table.micRequestQueue.filter(r => r.status === "queued").length;

  return { queued: true, position };
}

/**
 * Grant the mic to the next person in the queue.
 * Called when the current speaker releases or is muted.
 */
export function grantNextMic(table: RoundTable): MicRequest | null {
  const next = table.micRequestQueue.find(r => r.status === "queued");
  if (!next) return null;

  next.status = "active";
  next.grantedAt = new Date().toISOString();
  table.activeSpeakerId = next.memberId;
  table.activeSpeakerStartedAt = next.grantedAt;

  return next;
}

/**
 * Release the mic (voluntary or forced by running out of minutes).
 * Records the speaking duration and earned listening minutes for all others.
 */
export function releaseMic(
  table: RoundTable,
  memberId: string,
  reason: "voluntary" | "out_of_minutes" | "moderator_action",
): { minutesSpoken: number } {
  if (table.activeSpeakerId !== memberId) {
    return { minutesSpoken: 0 };
  }

  const now = new Date().toISOString();
  const startedAt = table.activeSpeakerStartedAt
    ? new Date(table.activeSpeakerStartedAt).getTime()
    : Date.now();
  const minutesSpoken = Math.max(0, (Date.now() - startedAt) / 60_000);

  // Update the active mic request
  const activeRequest = table.micRequestQueue.find(
    r => r.memberId === memberId && r.status === "active",
  );
  if (activeRequest) {
    activeRequest.status = "expired";
    activeRequest.releasedAt = now;
  }

  // Record coverage consumed (speaker) and earned (listeners)
  table.coverageConsumed[memberId] =
    (table.coverageConsumed[memberId] ?? 0) + minutesSpoken;

  for (const participantId of table.participantIds) {
    if (participantId !== memberId) {
      table.coverageEarned[participantId] =
        (table.coverageEarned[participantId] ?? 0) + minutesSpoken;
    }
  }

  // Clear the active speaker
  table.activeSpeakerId = null;
  table.activeSpeakerStartedAt = null;

  return { minutesSpoken };
}

/**
 * Check if the active speaker should be auto-muted (out of Coverage Minutes).
 */
export function shouldAutoMute(
  table: RoundTable,
  speakerAccount: CoverageMinuteAccount,
): boolean {
  if (!table.activeSpeakerId) return false;

  const sessionUsed = table.coverageConsumed[table.activeSpeakerId] ?? 0;
  const check = canSpeak(speakerAccount, ACCUMULATION_INCREMENT, sessionUsed);

  return !check.allowed;
}

/**
 * Get the current state summary of a Round Table.
 */
export function getTableSummary(table: RoundTable): {
  topicName: string;
  status: TableStatus;
  participantCount: number;
  activeSpeaker: string | null;
  queueLength: number;
  totalMinutesSpoken: number;
} {
  const totalSpoken = Object.values(table.coverageConsumed).reduce((a, b) => a + b, 0);
  const queueLength = table.micRequestQueue.filter(r => r.status === "queued").length;

  return {
    topicName: table.topicName,
    status: table.status,
    participantCount: table.participantIds.length,
    activeSpeaker: table.activeSpeakerId,
    queueLength,
    totalMinutesSpoken: Math.round(totalSpoken),
  };
}

// ── Edge Function Architecture (R-010 Integration) ──────────────────────────
//
// Per Rook research R-010: LiveKit Edge Function Architecture.
//
// The Muffled Rule enforcement requires 4 Edge Functions working together:
//
//   1. `request_mic` — Adds user to the mic queue in the database
//   2. `yield_mic` — Active speaker voluntarily releases the mic
//   3. `livekit_webhook_handler` — Handles participant disconnect events
//   4. `coverage_debit_loop` — pg_cron-driven debit of Coverage Minutes
//
// CRITICAL ARCHITECTURE DECISIONS:
//   - Supabase Edge Functions are STATELESS and SHORT-LIVED (max ~25s)
//   - Mic queue state lives in the DATABASE, not in memory
//   - pg_cron calls the debit Edge Function every 60 seconds
//   - LiveKit Server SDK provides `updateParticipant()` to force-revoke
//     `canPublish` — this mutes speakers INSTANTLY at the SFU level
//   - All balance deductions use PostgreSQL RPCs for ATOMICITY
//     (prevents race conditions if debit loop fires concurrently)
//   - LiveKit Data Channels deliver system messages (e.g., "Speaker out of minutes")
//
// Dependencies:
//   - `livekit-server-sdk` (Deno/npm) for RoomServiceClient
//   - Supabase vault for LIVEKIT_API_KEY and LIVEKIT_API_SECRET
//   - pg_cron extension for the 1-minute debit loop
//   - PostgreSQL RPC: `decrement_coverage_minutes(user_id, amount)`

/** Edge Function endpoints for LiveKit mic management */
export const LIVEKIT_EDGE_FUNCTIONS = [
  "request-mic",
  "yield-mic",
  "livekit-webhook-handler",
  "coverage-debit-loop",
] as const;

export type LiveKitEdgeFunction = (typeof LIVEKIT_EDGE_FUNCTIONS)[number];

/**
 * Mic queue entry — persisted in database (not in-memory).
 * The queue is FIFO: first to request, first to speak.
 */
export interface MicQueueEntry {
  /** Queue entry ID */
  id: string;
  /** Round Table / LiveKit Room ID */
  roomId: string;
  /** Member ID requesting the mic */
  userId: string;
  /** Member display name */
  userName: string;
  /** When the request was made */
  createdAt: string;
  /** Current Coverage Minutes balance at request time */
  balanceAtRequest: number;
  /** Estimated speaking duration (optional) */
  estimatedDurationMinutes?: number;
}

/**
 * Configuration for the pg_cron-driven Coverage Minutes debit loop.
 * pg_cron calls the `coverage-debit-loop` Edge Function every intervalMs.
 */
export interface DebitLoopConfig {
  /** pg_cron schedule expression (default: '* * * * *' = every minute) */
  cronSchedule: string;
  /** Amount to debit per interval (default: 1 minute) */
  debitAmountPerInterval: number;
  /** Whether to send system messages via LiveKit Data Channel on auto-mute */
  sendSystemMessageOnMute: boolean;
  /** Data Channel reliability mode (1 = RELIABLE for system messages) */
  dataChannelReliability: 1 | 0;
}

/** Default debit loop configuration */
export const DEFAULT_DEBIT_LOOP_CONFIG: DebitLoopConfig = {
  cronSchedule: "* * * * *", // every minute
  debitAmountPerInterval: 1,
  sendSystemMessageOnMute: true,
  dataChannelReliability: 1, // RELIABLE
};

/**
 * LiveKit webhook event types that the handler processes.
 * We only care about participant lifecycle events for queue management.
 */
export type LiveKitWebhookEventType =
  | "participant_joined"
  | "participant_left"
  | "track_published"
  | "track_unpublished"
  | "room_started"
  | "room_finished";

/**
 * Incoming LiveKit webhook payload (simplified for our use case).
 */
export interface LiveKitWebhookPayload {
  /** Webhook event type */
  event: LiveKitWebhookEventType;
  /** Room information */
  room: { name: string; sid: string };
  /** Participant info (present for participant events) */
  participant?: {
    sid: string;
    identity: string; // maps to member ID
    state: "JOINING" | "JOINED" | "ACTIVE" | "DISCONNECTED";
  };
  /** Track info (present for track events) */
  track?: { sid: string; type: "AUDIO" | "VIDEO" | "DATA"; source: string };
}

/**
 * System message sent via LiveKit Data Channel when auto-mute occurs.
 * The frontend listens for these to show UI notifications.
 */
export interface LiveKitSystemMessage {
  /** Message type discriminator */
  type: "SYSTEM_MSG";
  /** Human-readable text */
  text: string;
  /** Message category for UI styling */
  category: "auto_mute" | "queue_advance" | "session_warning" | "balance_low";
  /** Affected user ID (if applicable) */
  targetUserId?: string;
  /** Timestamp */
  timestamp: string;
}

/**
 * Result of the `advanceQueue` operation inside the Edge Function.
 */
export interface QueueAdvanceResult {
  /** Whether a new speaker was granted the mic */
  advanced: boolean;
  /** New speaker's member ID (if advanced) */
  newSpeakerId?: string;
  /** New speaker's name (if advanced) */
  newSpeakerName?: string;
  /** Remaining queue length */
  remainingQueueLength: number;
  /** Reason if not advanced */
  reason?: string;
}

/**
 * Result of the `revokeMic` operation.
 * Called when: balance hits 0, session limit reached, speaker yields, speaker disconnects.
 */
export interface MicRevocationResult {
  /** Whether revocation succeeded */
  revoked: boolean;
  /** Reason for revocation */
  reason: "out_of_minutes" | "session_limit" | "voluntary_yield" | "disconnect" | "moderator_action";
  /** Minutes spoken in this turn */
  minutesSpokenThisTurn: number;
  /** Queue advance result (did someone else get the mic?) */
  queueAdvance: QueueAdvanceResult;
}

/**
 * Create a system message for LiveKit Data Channel broadcast.
 */
export function createSystemMessage(
  text: string,
  category: LiveKitSystemMessage["category"],
  targetUserId?: string,
): LiveKitSystemMessage {
  return {
    type: "SYSTEM_MSG",
    text,
    category,
    targetUserId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a mic queue entry for a member requesting the mic.
 */
export function createMicQueueEntry(
  roomId: string,
  userId: string,
  userName: string,
  currentBalance: number,
  estimatedDuration?: number,
): MicQueueEntry {
  return {
    id: `mq-${roomId}-${userId}-${Date.now()}`,
    roomId,
    userId,
    userName,
    createdAt: new Date().toISOString(),
    balanceAtRequest: currentBalance,
    estimatedDurationMinutes: estimatedDuration,
  };
}

// ── WebRTC Room Management Functions (R-006 Integration) ────────────────────

/**
 * Create a LiveKit room configuration for a Round Table.
 * Defaults to LiveKit Cloud with Opus audio codec.
 */
export function createLiveKitRoomConfig(
  tableId: string,
  serverUrl: string,
  tableSize: LiveKitTableSize = "SMALL",
  region: string = "us-east-1",
): LiveKitRoomConfig {
  return {
    roomName: `rt-${tableId}`,
    serverUrl,
    apiKeyRef: `vault:livekit-api-key`,
    apiSecretRef: `vault:livekit-api-secret`,
    tableSize,
    isActive: false,
    audioCodec: "opus",
    recordingEnabled: false,
    region,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create the initial mic permission state for a Round Table.
 * All permissions start revoked — no one can publish until granted.
 */
export function createMicPermissionState(
  tableId: string,
  edgeFunctionUrl: string,
): MicPermissionState {
  return {
    tableId,
    activePublisherId: null,
    publishGrantedAt: null,
    publisherBalanceAtGrant: 0,
    edgeFunctionUrl,
    debitIntervalMs: MIC_DEBIT_INTERVAL_MS,
    lastDebitAt: null,
  };
}

/**
 * Determine the appropriate LiveKit table size based on expected participants.
 * Falls back to TOWN_HALL for anything over MEDIUM capacity.
 */
export function getTableSizeForCapacity(expectedParticipants: number): LiveKitTableSize {
  if (expectedParticipants <= LIVEKIT_TABLE_SIZES.SMALL.maxParticipants) return "SMALL";
  if (expectedParticipants <= LIVEKIT_TABLE_SIZES.MEDIUM.maxParticipants) return "MEDIUM";
  return "TOWN_HALL";
}

/**
 * Check if a speaker should be force-muted based on a Coverage Debit Event.
 * Called by the Edge Function after each debit interval.
 */
export function shouldForceRevoke(
  remainingBalance: number,
  sessionMinutesSpoken: number,
): { revoke: boolean; reason?: string } {
  if (remainingBalance <= 0) {
    return { revoke: true, reason: "Coverage Minutes depleted." };
  }

  if (sessionMinutesSpoken >= MAX_SESSION_BROADCAST) {
    return { revoke: true, reason: `Session broadcast limit (${MAX_SESSION_BROADCAST} min) reached.` };
  }

  return { revoke: false };
}
