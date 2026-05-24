/**
 * Watchdog Knight — Shared Types (Bushel BP034)
 * LB-STACK-0165 Watchdog Cooperative Repair Loop
 * LB-STACK-0223 Hall Monitor (advisory class)
 * LB-STACK-0171 Coroner Scribe (post-mortem on watchdog-detected failures)
 */

export type ISO8601 = string;

export type HealthStatus = 'ok' | 'degraded' | 'down' | 'unknown';

/** Per-subject health check result (R-MECHANISM-VERIFY: no asserted 'ok' without round-trip). */
export interface HealthCheckResult {
  subject: string;
  status: HealthStatus;
  latency_ms: number;
  metadata: {
    last_activity?: ISO8601;
    error?: string;
    version?: string;
    details?: Record<string, unknown>;
  };
  checked_at: ISO8601;
}

/** Aggregate health state persisted to disk (G3). */
export interface WatchdogState {
  subjects: Record<string, HealthCheckResult>;
  last_poll_at: ISO8601;
  daemon_start: ISO8601;
  poll_count: number;
}

/** Alerting event appended to history.jsonl. */
export interface HealthEvent {
  event_type:
    | 'status_change'
    | 'recovery'
    | 'coroner_dispatch'
    | 'hall_monitor_dispatch'
    | 'moneypenny_dispatch'
    | 'self_restart_attempt'
    | 'poll_cycle_complete'
    | 'brand_lint_event'        // K533 #27 / BP044 W1 — brand-canon hard-enforcement gate
    | 'passive_surveillance_gap'; // BP044 W1 — gap-detection alert from Passive-Surveillance Logger
  subject?: string;
  from_status?: HealthStatus;
  to_status?: HealthStatus;
  details?: string;
  ts: ISO8601;
  /** brand_lint_event fields (populated when event_type = 'brand_lint_event') */
  severity?: 'structural_inversion' | 'wording_drift' | 'innocent_variation';
  phrase_id?: string;
  canonical?: string;
  bypass_active?: boolean;
  blocked?: boolean;
  session?: string;
  /** passive_surveillance_gap fields (populated when event_type = 'passive_surveillance_gap') */
  surveillance_alert_id?: string;
  surveillance_endpoint?: string;
  surveillance_gap_type?: PassiveSurveillanceGapAlert['gap_type'];
  surveillance_gap_hours?: number;
}

/**
 * Passive-Surveillance gap-detection alert (BP044 W1).
 * Appended to ~/.claude/state/watchdog/passive_surveillance_alerts.jsonl
 * by the AMPLIFY Computer substrate-API gap-detection scheduler.
 *
 * Dispatched to Bishop via KNIGHT_BISHOP_MESSAGES.md yoke path.
 * NEVER dispatched to the queryer that triggered the gap (informative-silence class).
 *
 * Federal Body Cam doctrine inversion:
 *   The substrate logs the surveilors. They do not log the substrate.
 */
export interface PassiveSurveillanceGapAlert {
  alert_id:            string;
  ts:                  ISO8601;
  endpoint:            string;
  gap_type:            'extended_silence' | 'burst_after_silence' | 'pattern_shift';
  actor_ip:            string;        // anonymized (last IPv4 octet zeroed)
  actor_agent:         string;
  baseline_rph:        number;
  observed_gap_hours:  number;
  detail:              string;
  dispatched_to:       string[];      // ['bishop', 'watchdog']
  reviewed?:           boolean;
  reviewed_by?:        string;
  reviewed_at?:        ISO8601;
  review_notes?:       string;
}

/** Subject configuration — latency thresholds and metadata. */
export interface SubjectConfig {
  id: string;
  label: string;
  /** fast-class: degraded > 500ms; slow-class: degraded > 5000ms */
  latency_class: 'fast' | 'slow';
  /** true = triggers MoneyPenny critical alert if down >5 min */
  critical: boolean;
}

/** Registry of known subjects. */
export const SUBJECT_CONFIGS: Record<string, SubjectConfig> = {
  'librarian-mcp':      { id: 'librarian-mcp',      label: 'Librarian MCP server',          latency_class: 'fast',  critical: true  },
  'moneypenny':         { id: 'moneypenny',          label: 'MoneyPenny daemon (B82)',        latency_class: 'fast',  critical: true  },
  'drekaskip':          { id: 'drekaskip',           label: 'Drekaskip Wave Generator (B61A)',latency_class: 'fast',  critical: false },
  'hearth':             { id: 'hearth',              label: 'Hearth Ollama backend (B69)',    latency_class: 'slow',  critical: false },
  'sweat-scribe':       { id: 'sweat-scribe',        label: 'Sweat Scribe daemon (B80)',      latency_class: 'slow',  critical: false },
  'tears-scribe':       { id: 'tears-scribe',        label: 'Tears Scribe daemon (B81)',      latency_class: 'slow',  critical: false },
  'forager-scribe':     { id: 'forager-scribe',      label: 'Forager Scribe daemon',         latency_class: 'slow',  critical: false },
  'substrate-api':      { id: 'substrate-api',       label: 'Substrate API :11480',          latency_class: 'fast',  critical: true  },
  'knight-bishop-bridge': { id: 'knight-bishop-bridge', label: 'Knight-Bishop bridge MCP',  latency_class: 'fast',  critical: false },
};

export const DEGRADED_THRESHOLD_FAST_MS = 500;
export const DEGRADED_THRESHOLD_SLOW_MS = 5000;
export const DOWN_TIMEOUT_MS = 30_000;
export const CRITICAL_DOWN_ALERT_MS = 5 * 60 * 1000;  // 5 minutes
export const MULTI_DOWN_ALERT_COUNT = 3;
