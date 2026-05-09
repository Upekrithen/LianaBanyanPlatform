/**
 * SE-4 Shadow E-Signal — Envelope Types (LB-STACK-0172 / BP033)
 * ==============================================================
 * Three load-bearing primitives for safe 13th Floor recursive SEG dispatch:
 *   Primitive 1 — Burst Signaling (Lamport/vector clock per event)
 *   Primitive 2 — Power-Set Uniqueness (combinatorial Shadow ID)
 *   Primitive 3 — HMAC Tamper-Detect (payload fingerprint per output)
 *
 * A&A candidate: Prov-19 — "13th Floor Recursive SEG Architecture as
 * Cooperative Substrate Primitive"
 *
 * Implemented: BP033 / B-SE4-1 through B-SE4-3 (Bushel SE4 Retrofit)
 */

// ─── Shadow class registry ────────────────────────────────────────────────────

export type SE4ShadowClass =
  | 'augur'
  | 'shadow_proper'
  | 'wrasse'
  | 'pheromone'
  | 'chronicler'
  | 'detective'
  | 'knight_bushel'
  | 'pawn_research'
  | 'rook_surface';

// ─── HMAC config ──────────────────────────────────────────────────────────────

export interface SE4HMACConfig {
  algorithm: 'SHA-256' | 'SHA-3';
  rotation: 'per-session' | 'per-day' | 'per-cohort';
}

// ─── Core envelope ────────────────────────────────────────────────────────────

/**
 * SE4Envelope — attached to every Shadow output.
 * Carries:
 *   - Lamport clock for event ordering (epoch_id)
 *   - Power-set identity for collision avoidance (cell_identities)
 *   - HMAC payload fingerprint for tamper detection (payload_hash)
 */
export interface SE4Envelope {
  signal_id: string;               // UUID v4 — unique per event
  epoch_id: string;                // Lamport clock: "<epoch>:<shadow_id>"
  parent_shadow_id: string | null; // null for root; set for recursive spawns
  shadow_class: SE4ShadowClass;
  cell_identities: string[];       // power-set encoded IDs (e.g. ['cell_3'])
  payload_hash: string;            // HMAC-SHA256(payload_bytes, session_key)
  burst_count: number;             // default 1; >1 for partial-return streams
  hmac_config: SE4HMACConfig;
}

// ─── Validation result ────────────────────────────────────────────────────────

export interface SE4ValidationResult {
  valid: boolean;
  tamperDetected: boolean;
  clockViolation: boolean;
  collisionDetected: boolean;
}

// ─── Signed output wrapper ────────────────────────────────────────────────────

/** A signed Shadow output pairing payload T with its SE4Envelope. */
export interface SE4SignedOutput<T> {
  payload: T;
  shadow_id: string;
  envelope: SE4Envelope;
}

// ─── Compositional Detective result ───────────────────────────────────────────

export interface SE4DetectiveHit {
  scribe: string;
  tablet_id: string;
  match_strength: number;
  decay_score: number;
  ts: string;
  cathedral?: string;
  matched_claims: string[];
}

/**
 * Detective compositional query result (power-set burst).
 * unionHits — hits for any claim in the array
 * intersectionSubsets — hits per subset (keyed by sorted claim names joined '&')
 */
export interface SE4DetectiveResult {
  claims: string[];
  burstCount: number;
  unionHits: SE4DetectiveHit[];
  intersectionSubsets: Record<string, SE4DetectiveHit[]>;
  envelope: SE4Envelope;
}

// ─── Chronicler audit window ──────────────────────────────────────────────────

export interface SE4ChroniclerAuditWindow {
  events: unknown[];
  diagnosticEnvelope: SE4Envelope;
  checksumValid: boolean;
  anomalyClass: string | null;
}

export type SE4AnomalyClass =
  | 'dropped-event'
  | 'duplicate-write'
  | 'clock-regression'
  | 'hmac-failure'
  | 'power-set-collision';

// ─── Rook multi-surface ───────────────────────────────────────────────────────

export type SE4RookSurface = 'gemini_app' | 'gemini_cli' | 'gemini_code_assist';

export interface SE4RookReturnFields {
  se4: SE4Envelope;
  se4_shadow_id: string;
  surface: SE4RookSurface;
}

// ─── Wrasse composite trigger ─────────────────────────────────────────────────

export type SE4WrasseCompositeMode = 'any' | 'all' | 'power-set';

export interface SE4WrasseCompositeReceipt {
  matchedSubset: string[];
  envelope: SE4Envelope;
  injectionPayload: string;
}

// ─── Pawn parallel fire ───────────────────────────────────────────────────────

export interface SE4PawnParallelFireReceipt {
  dispatches: SE4PawnDispatch[];
  returns: SE4PawnReturn[];
  collisionRate: number;
  parallelEfficiency: number;
}

export interface SE4PawnDispatch {
  dispatch_id: string;
  shadow_id: string;
  envelope: SE4Envelope;
  task: string;
}

export interface SE4PawnReturn {
  dispatch_id: string;
  shadow_id: string;
  envelope: SE4Envelope;
  partial: boolean;
  result?: unknown;
}

// ─── Shadow-proper background task ───────────────────────────────────────────

export interface SE4ShadowBackgroundTaskReceipt {
  task_id: string;
  envelope: SE4Envelope;
  hmacVerified: boolean;
  epochsElapsed: number;
}
