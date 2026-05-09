/**
 * MoneyPenny — Shared Types (Bushel 82, BP034)
 * All types shared across Gateway, MCCI, Calendar, and Agent subsystems.
 */

// ─── Core Primitives ────────────────────────────────────────────────────────

export type ISO8601 = string;  // ISO 8601 timestamp string
export type ThreadHandle = string;  // UUID

// ─── Caller Classification (§4.1) ───────────────────────────────────────────

export type CallerClass =
  | 'WARREN_BUFFETT'         // Founder-direct unblockable; no priority can interrupt
  | 'MACKENZIE_SCOTT'        // Important but interruptible; can be substantive-held
  | 'TALENTS_PRACTITIONER'   // PF300 cohort; substantive-engaged; Founder-batch processed
  | 'FAMILY'                 // Founder family; routed direct regardless UNLESS sleep-class
  | 'COUNSEL'                // Legal counsel; routed direct in any non-sleep state
  | 'PRESS'                  // Journalists; substantive-held with prep window
  | 'UNKNOWN'                // Cold inbound; substantive-held; vetted before Founder sees
  | 'INTERNAL_AI'            // AI surfaces invoking MoneyPenny for context handoff
  ;

export type InboundChannel = 'phone' | 'email' | 'slack' | 'web' | 'ai_tool';

export interface CallerIdentifier {
  id: string;           // email, phone, name, or AI surface ID
  display_name?: string;
  channel: InboundChannel;
}

export interface CallerProfile {
  class: CallerClass;
  identifier: CallerIdentifier;
  history: ThreadHandle[];
  metadata: {
    first_contact: ISO8601;
    last_contact: ISO8601;
    interaction_count: number;
    substantive_summary: string;   // 3K-summary of relationship
  };
}

// ─── Availability Classes (§6.1) ────────────────────────────────────────────

export type AvailabilityClass =
  | 'DEEP_WORK'   // only WB + FAMILY-non-sleep + COUNSEL interrupt
  | 'OPEN_BLOCK'  // most classes accepted
  | 'OUT'         // hard-out; no interrupts
  | 'SLEEP'       // family-only-emergency
  | 'FAMILY'      // family-time; only WB-class interrupts
  | 'COUNSEL'     // counsel-time; only WB-class + SCOTUS-class interrupt
  ;

// ─── Routing Decision ───────────────────────────────────────────────────────

export type RoutingOutcome =
  | 'ROUTE_DIRECT'           // Send directly to Founder
  | 'HOLD_SUBSTANTIVE'       // Hold and engage with Substantive Engager
  | 'HOLD_QUEUE'             // Queue without engagement (sleep state)
  | 'HUMAN_REVIEW'           // Flag for human review
  | 'INTERNAL_HANDOFF'       // AI-to-AI context handoff
  ;

export interface RoutingDecision {
  outcome: RoutingOutcome;
  thread_id: ThreadHandle;
  caller_class: CallerClass;
  availability_at_decision: AvailabilityClass;
  reason: string;
  receipt_path: string;         // path to substrate Eblet receipt
  hold_handle?: HoldHandle;
  direct_route_reason?: string;
  ts: ISO8601;
}

// ─── Hold Handle ────────────────────────────────────────────────────────────

export interface HoldHandle {
  hold_id: string;             // UUID
  thread_id: ThreadHandle;
  caller_class: CallerClass;
  held_at: ISO8601;
  reason: string;
  engager_assigned: KissakiRank;
  status: 'active' | 'delivered' | 'released';
}

// ─── Kissaki Guild Rank (LB-STACK-0167) ─────────────────────────────────────

export type KissakiRank = 'APPRENTICE' | 'JOURNEYMAN' | 'MASTER' | 'KISSAKI';

export interface KissakiAssignment {
  rank: KissakiRank;
  role: string;
  substrate_ai: string;
  context_depth: 'fast_classify' | 'full_canon' | 'deep_synthesis' | 'founder_direct';
}

// ─── MCCI Thread Store (§5.1) ────────────────────────────────────────────────

export type ThreadClass = 'relationship' | 'topic' | 'project' | 'session';
export type ThreadState = 'active' | 'dormant' | 'archived';

export interface ThreadContext {
  full: string;                   // append-only log
  compressed_3k: string;         // current 3K-summary per LB-STACK-0222
  summary_version: number;       // increments every handoff
  last_compression_at: ISO8601;
}

export interface Thread {
  id: ThreadHandle;
  class: ThreadClass;
  participants: string[];         // caller IDs + agent IDs
  state: ThreadState;
  context: ThreadContext;
  metadata: {
    created_at: ISO8601;
    last_active: ISO8601;
    related_threads: ThreadHandle[];
    canon_refs: string[];         // LB-STACK-* references
  };
}

// ─── Handoff Protocol (§5.2) ─────────────────────────────────────────────────

export interface HandoffPacket {
  thread_id: ThreadHandle;
  from_agent: string;
  to_agent: string;
  compressed_3k: string;
  last_3_full_messages: string[];
  open_questions: string[];
  canon_refs: string[];
  escalation_triggers: string[];
  summary_version: number;
  ts: ISO8601;
}

// ─── Context Packet (resurrection output, §5.4) ──────────────────────────────

export interface ContextPacket {
  thread_id: ThreadHandle;
  compressed_3k: string;
  last_3_full_messages: string[];
  days_dormant: number;
  new_signal?: InboundSignal;
  suggested_open: string;
  canon_refs_loaded: string[];
}

// ─── Inbound Signal ──────────────────────────────────────────────────────────

export interface InboundSignal {
  channel: InboundChannel;
  caller: CallerIdentifier;
  signal: string;
  metadata?: Record<string, unknown>;
  ts: ISO8601;
}

// ─── Calendar / Scheduling ───────────────────────────────────────────────────

export interface CalendarBlock {
  id: string;
  title: string;
  start: ISO8601;
  end: ISO8601;
  availability_class: AvailabilityClass;
  source: 'outlook' | 'google' | 'icloud' | 'manual';
}

export interface SchedulingRequest {
  caller_class: CallerClass;
  duration_minutes: number;
  preferred_window_start?: ISO8601;
  preferred_window_end?: ISO8601;
  notes?: string;
}

export type TimeSlot = {
  kind: 'slot';
  start: ISO8601;
  end: ISO8601;
  prep_window_start: ISO8601;  // substantive-prep starts here
  confidence: number;
};

export type HumanReviewFlag = {
  kind: 'human_review';
  reason: string;
};

// ─── MCP Tool Status ─────────────────────────────────────────────────────────

export interface MoneyPennyStatus {
  active_threads: number;
  on_hold: number;
  founder_availability: AvailabilityClass;
  oldest_held_call: { thread_id: ThreadHandle; age_seconds: number } | null;
  uptime_seconds: number;
  total_routed_today: number;
  receipt_count_today: number;
}

// ─── Routing Receipt (substrate Eblet) ───────────────────────────────────────

export interface RoutingReceipt {
  receipt_id: string;
  thread_id: ThreadHandle;
  caller_class: CallerClass;
  outcome: RoutingOutcome;
  availability_at_decision: AvailabilityClass;
  channel: InboundChannel;
  reason: string;
  ts: ISO8601;
}

// ─── Transition Packet (hold → Founder handoff) ───────────────────────────────

export interface TransitionPacket {
  thread_id: ThreadHandle;
  hold_id: string;
  caller_class: CallerClass;
  summary: string;            // 3K-summary of held conversation
  open_questions: string[];
  suggested_pickup_line: string;
  engager_notes: string;
  ts: ISO8601;
}
