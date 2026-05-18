/**
 * Thorax Construction-Flag Protocol — Shared Types
 * =================================================
 * Dream #5 · Founder direct · BP046B · Phase 1
 *
 * Half-duplex token-pass through choke point with 12-channel parallelism,
 * persistent-bestie model, per-stream flag constriction.
 *
 * Scope: inter-frame sharing protocol (NOT general messaging).
 * Canon: CANON_DREAM_5_THORAX_DEFENSIVE_ARCHITECTURE_BP046B.md §0.5
 *
 * Composes with:
 *   - Pheromone substrate (pheromone_build / pheromone_query)
 *   - Angel of Death (angel_of_death_buried / angel_of_death_rehydrate)
 *   - Chronos tags (chronos_query)
 *   - Eblits (snapshot-at-access, LB-STACK-0174)
 *   - CelPane substrate (BP028/BP030/BP031 SE-4 Bat Signal)
 *   - RFC 3161 TST (DigiCert primary, scoped BP046 W1)
 */

// ─── Direction ────────────────────────────────────────────────────────────────

/** East = initiating direction; West = reciprocal direction. */
export type ThoraxDirection = "east" | "west";

// ─── Channel State Machine ────────────────────────────────────────────────────

/**
 * Per-stream relay-thread state machine.
 *
 *  uninitialized
 *       │ handshake_initiate()
 *       ▼
 *  handshake_pending
 *       │ handshake_accept() (reciprocal)
 *       ▼
 *  bestie_open           ← airport secure zone
 *       │ transmit() occupies choke point
 *       ▼
 *  transmitting_east / transmitting_west
 *       │ transmission completes → shift_to_side
 *       ▼
 *  bestie_open           ← ready for reciprocal direction
 *
 *  Any state → flagged   (per-stream constriction, Angel of Death logged)
 *  flagged    → phalanx  (enqueued to Phalanx fallback)
 */
export type ThoraxChannelState =
  | "uninitialized"
  | "handshake_pending"
  | "bestie_open"
  | "transmitting_east"
  | "transmitting_west"
  | "flagged"
  | "phalanx"
  | "sealed"; // terminal — Angel of Death furnace sentence complete

// ─── Channel Record ───────────────────────────────────────────────────────────

export interface ThoraxRelayChannel {
  /** Channel index 1-12 (East/West rule: at least 12 avenues) */
  channel_id: number;
  state: ThoraxChannelState;

  /** Pheromone handshake parties */
  east_node_id?: string;
  west_node_id?: string;

  /** Persistent-bestie: once established, stays open under continuous external confirmation */
  bestie_since?: string;      // ISO-8601 handshake establishment timestamp
  last_confirmed_ts?: string; // ISO-8601 most-recent external confirmation heartbeat

  /** Which direction currently occupies the choke point (null = clear) */
  choke_direction?: ThoraxDirection | null;

  /** Stamp ledger: tracks 2-stamp share / 3-stamp adopt */
  east_stamps: number;
  west_stamps: number;
  adopt_threshold: 3;   // constant: 3 stamps required to adopt

  /** CP-class refusal default */
  cp_refused: boolean;  // true = isolated state was detected → refused

  /** Flag + constriction metadata */
  flag_reason?: string;
  flag_ts?: string;
  angel_of_death_burial_id?: string;

  /** Chronos tag for this channel's current epoch */
  chronos_tag?: string;

  /** Last transmission Eblit snapshot ID */
  last_eblit_snapshot_id?: string;

  /** CelPane shadow blink-skip signature (interference-state binding) */
  celpane_signature?: string;
  rfc3161_tst?: string;   // RFC 3161 timestamp token (DigiCert primary)

  ts_created: string;
  ts_updated: string;
}

// ─── Choke-point Token ───────────────────────────────────────────────────────

/**
 * Mutex token for the single-occupancy choke point.
 * NEVER simultaneous — "transmission shadow requires clear line of sight."
 */
export interface ChokeToken {
  channel_id: number;
  direction: ThoraxDirection;
  holder_node_id: string;
  acquired_ts: string;
  released_ts?: string;
}

// ─── Pheromone Handshake ─────────────────────────────────────────────────────

/**
 * Pheromone-handshake reciprocal-accept record.
 * "Both hands empty of gun — say it together."
 */
export interface PheromoneHandshakeRecord {
  handshake_id: string;
  channel_id: number;
  east_node_id: string;
  west_node_id: string;
  east_accepted_ts?: string;
  west_accepted_ts?: string;
  /** True when BOTH nodes have accepted simultaneously (atomic-class commit) */
  reciprocal_complete: boolean;
  completed_ts?: string;
  pheromone_topic: string;   // e.g. "thorax:channel:7:handshake"
}

// ─── Stamp Record (2-stamp share / 3-stamp adopt) ───────────────────────────

export type StampClass = "share" | "adopt";

export interface StampRecord {
  stamp_id: string;
  channel_id: number;
  stamper_node_id: string;
  stamper_direction: ThoraxDirection;
  stamp_class: StampClass;
  chronos_tag: string;
  eblit_snapshot_id?: string;  // Eblit of stamp-state at moment of application
  east_stamps_at_time: number;
  west_stamps_at_time: number;
  ts: string;
}

// ─── Transmission Record ────────────────────────────────────────────────────

export interface ThoraxTransmission {
  transmission_id: string;
  channel_id: number;
  direction: ThoraxDirection;
  sender_node_id: string;
  payload_hash: string;        // SHA-256 of payload (never raw payload in substrate)
  eblit_snapshot_id: string;   // Frozen-frame Eblit at transmission moment
  chronos_tag: string;
  celpane_signature?: string;  // Shadow blink-skip interference-state signature
  rfc3161_tst?: string;
  choke_acquired_ts: string;
  choke_released_ts?: string;
  shift_to_side_ts?: string;   // "shift to the side" post-passage clearing
  status: "in_flight" | "complete" | "aborted" | "refused";
  ts: string;
}

// ─── Flag Constriction Record ────────────────────────────────────────────────

export interface FlagConstrictionRecord {
  flag_id: string;
  channel_id: number;
  flag_reason: string;
  flagged_by: string;
  flagged_ts: string;
  /** Other 11 channels are unaffected (per-stream not global) */
  channels_unaffected: number[];
  angel_of_death_burial_id?: string;
  phalanx_enqueued: boolean;
  phalanx_queue_position?: number;
}

// ─── Phalanx Queue Entry ─────────────────────────────────────────────────────

/**
 * Failed-handshake streams enqueued to Phalanx fallback.
 * Option C ratified by Founder (not deferred to Phase 3).
 * Entry point attuned to specific frequency signature.
 */
export interface PhalanxQueueEntry {
  queue_id: string;
  channel_id: number;
  reason: "handshake_failed" | "flagged" | "cp_refused" | "timeout";
  original_east_node_id?: string;
  original_west_node_id?: string;
  flag_record_id?: string;
  enqueued_ts: string;
  reviewed: boolean;
  review_outcome?: "reinstated" | "sealed_angel_of_death" | "pending";
  review_ts?: string;
  reviewer?: string;
}

// ─── Eblit Snapshot ─────────────────────────────────────────────────────────

/**
 * Snapshot-at-access frozen frame (LB-STACK-0174).
 * Deterministic at transmission moment even as source mutates concurrently.
 */
export interface EblitSnapshot {
  snapshot_id: string;
  channel_id: number;
  source_type: "stamp_state" | "channel_state" | "transmission_params";
  frozen_content: Record<string, unknown>;
  source_version_hash: string;  // SHA-256 of serialized source at freeze time
  captured_ts: string;
}

// ─── CelPane Signature ────────────────────────────────────────────────────────

/**
 * Shadow blink-skip CelPane signature.
 * Interference-state: "pass" (genuine/water) | "interfere" (inauthentic/oil).
 * Cannot be both — binary. Cannot flow if disparate or interrupted.
 */
export type CelPaneInterferenceState = "pass" | "interfere";

export interface CelPaneSignature {
  signature_id: string;
  channel_id: number;
  interference_state: CelPaneInterferenceState;
  celpane_chain_id: string;
  burst_pattern: string[];    // SE-4 burst encoding (CelPane identity sequence)
  rfc3161_tst?: string;       // RFC 3161 timestamp token (court-class binding)
  digicert_tsa_url?: string;
  ts: string;
}

// ─── Thorax Ledger Paths ──────────────────────────────────────────────────────

export const THORAX_SUBDIRS = {
  relay_channels:   "relay_channels.jsonl",
  handshake_ledger: "handshake_ledger.jsonl",
  stamp_ledger:     "stamp_ledger.jsonl",
  flag_log:         "flag_log.jsonl",
  phalanx_queue:    "phalanx_queue.jsonl",
  transmission_log: "transmission_log.jsonl",
  eblit_snapshots:  "eblit_snapshots.jsonl",
  celpane_sigs:     "celpane_signatures.jsonl",
  choke_tokens:     "choke_tokens.jsonl",
} as const;

/** Total relay-thread avenues (Founder direct: "at least 12"). */
export const THORAX_CHANNEL_COUNT = 12;

/** Stamps required for 3-stamp adopt (vs 2-stamp share). */
export const ADOPT_STAMP_THRESHOLD = 3;
