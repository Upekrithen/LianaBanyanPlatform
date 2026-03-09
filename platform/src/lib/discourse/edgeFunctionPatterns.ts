/**
 * EDGE FUNCTION PATTERNS — Secure Mutation Architecture
 * ======================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 7
 * Source: Rook Research R-011 (Supabase Edge Function Patterns)
 *
 * This file defines the TypeScript types that model our Edge Function
 * architecture. Every state mutation (spending Credits/Minutes, joining
 * Guilds, processing contributions, granting mic permissions) goes
 * through an Edge Function — NEVER through client-side RLS policies.
 *
 * KEY ARCHITECTURAL RULES (R-011):
 *
 *   1. TWO CLIENTS: Every Edge Function instantiates two Supabase clients.
 *      - Client A: Uses the user's JWT (proves identity via auth.getUser())
 *      - Client B: Uses service_role key (bypasses RLS for secure mutations)
 *      Never mix these. Auth client reads. Admin client writes.
 *
 *   2. RPCs FOR ATOMICITY: Never do read-modify-write in Edge Function code.
 *      Wrap balance deductions + item grants in a single PostgreSQL function
 *      (.rpc()) so the transaction succeeds or fails atomically.
 *      Example: decrement_coverage_minutes(user_id, amount) — one atomic call.
 *
 *   3. IDEMPOTENCY IS MANDATORY: Network requests drop. If a user clicks
 *      "Donate 50 Minutes" and loses signal before the response arrives,
 *      they will retry. The idempotencyKey ensures the DB only processes
 *      the transaction ONCE, even if the Edge Function is called 5 times.
 *
 *   4. RATE LIMITING: Simple per-user, per-endpoint throttle.
 *      Prevents abuse without adding external dependencies (no Redis needed).
 *
 *   5. LEDGER WRITE: Every mutation appends to the Immutable Ledger
 *      (ideally inside the same PostgreSQL RPC for atomicity).
 *
 * Runtime: Deno/TypeScript (Supabase Edge Functions)
 * Dependencies: @supabase/supabase-js, livekit-server-sdk (for mic endpoints)
 */

import type { SecureMutationEndpoint } from "./rlsPatterns";

// ── Constants ──────────────────────────────────────────────────────────────

/** Default rate limit: minimum milliseconds between requests per user per endpoint */
export const DEFAULT_RATE_LIMIT_MS = 1_000;

/** Idempotency key expiry time (24 hours) — after this, same key can be reused */
export const IDEMPOTENCY_KEY_EXPIRY_HOURS = 24;

/** Maximum request body size for Edge Functions (bytes) */
export const MAX_REQUEST_BODY_BYTES = 64_000; // 64KB

/** CORS origin whitelist for Edge Functions */
export const EDGE_FUNCTION_CORS_ORIGINS = [
  "https://lianabanyan.com",
  "https://www.lianabanyan.com",
  "https://hexisle.lianabanyan.com",
  "https://discourse.lianabanyan.com",
  "https://library.lianabanyan.com",
  "https://cephas.lianabanyan.com",
  "https://areopagus.lianabanyan.com",
  "https://hexislo.com",
] as const;

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * The two-client pattern: every Edge Function creates exactly two Supabase clients.
 * This is the FOUNDATION of the secure mutation architecture.
 *
 * Why two clients?
 *   - userClient proves WHO the caller is (JWT validation)
 *   - adminClient performs the restricted action (bypasses RLS)
 *   - If we used userClient for mutations, client-side RLS policies
 *     would need UPDATE permissions — which opens attack surface
 *   - If we used adminClient for auth, we'd skip JWT validation
 *     entirely — any request could impersonate any user
 */
export interface TwoClientPattern {
  /** Client A: created with user's JWT Authorization header + anon key */
  userClientRole: "anon_with_jwt";
  /** Client B: created with service_role key (bypasses RLS) */
  adminClientRole: "service_role";
  /** The user client is ONLY used for: auth.getUser() */
  userClientUsedFor: "auth_validation_only";
  /** The admin client is used for: all database reads and writes */
  adminClientUsedFor: "database_operations";
}

/**
 * Idempotency configuration for an Edge Function.
 * Prevents double-processing of retried requests.
 *
 * Flow:
 *   1. Client generates a UUID idempotencyKey before sending the request
 *   2. Edge Function checks idempotency_keys table for existing key
 *   3. If found → return cached response (no DB mutation)
 *   4. If not found → process mutation, save key + response
 *   5. Key expires after IDEMPOTENCY_KEY_EXPIRY_HOURS
 */
export interface IdempotencyConfig {
  /** Table name for storing idempotency keys */
  tableName: "idempotency_keys";
  /** Column for the key itself (UUID from client) */
  keyColumn: "key";
  /** Column for the cached response JSON */
  responseColumn: "response";
  /** Column for the user who made the request */
  userIdColumn: "user_id";
  /** Column for the endpoint name */
  endpointColumn: "endpoint";
  /** Column for when the key was created */
  createdAtColumn: "created_at";
  /** Expiry time in hours */
  expiryHours: number;
}

/** Default idempotency config */
export const DEFAULT_IDEMPOTENCY_CONFIG: IdempotencyConfig = {
  tableName: "idempotency_keys",
  keyColumn: "key",
  responseColumn: "response",
  userIdColumn: "user_id",
  endpointColumn: "endpoint",
  createdAtColumn: "created_at",
  expiryHours: IDEMPOTENCY_KEY_EXPIRY_HOURS,
};

/**
 * Rate limit configuration for an Edge Function.
 * Simple per-user, per-endpoint throttle stored in database.
 */
export interface RateLimitConfig {
  /** Table name for rate limit tracking */
  tableName: "rate_limits";
  /** Minimum milliseconds between requests */
  minIntervalMs: number;
  /** Maximum requests per window (sliding window) */
  maxRequestsPerWindow: number;
  /** Window size in seconds */
  windowSizeSeconds: number;
}

/**
 * Standard Edge Function response structure.
 * All Edge Functions return this shape.
 */
export interface EdgeFunctionResponse<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data (on success) */
  data?: T;
  /** Error message (on failure) */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: EdgeFunctionErrorCode;
}

/** Standard error codes across all Edge Functions */
export type EdgeFunctionErrorCode =
  | "UNAUTHORIZED"          // JWT invalid or missing
  | "RATE_LIMITED"          // too many requests
  | "IDEMPOTENT_DUPLICATE"  // request already processed (returns cached response)
  | "INSUFFICIENT_BALANCE"  // not enough Credits/Minutes
  | "INVALID_PAYLOAD"       // request body validation failed
  | "NOT_FOUND"             // referenced entity doesn't exist
  | "FORBIDDEN"             // user doesn't have permission for this action
  | "CONFLICT"              // state conflict (e.g., mic already granted to someone)
  | "INTERNAL_ERROR";       // unexpected server error

/**
 * Edge Function registration — maps each of the 13 secure mutation endpoints
 * to its configuration.
 */
export interface EdgeFunctionRegistration {
  /** Endpoint name (matches SecureMutationEndpoint) */
  endpoint: SecureMutationEndpoint;
  /** HTTP method */
  method: "POST";
  /** Whether this endpoint requires an idempotency key */
  requiresIdempotency: boolean;
  /** Rate limit interval (ms) */
  rateLimitMs: number;
  /** Which PostgreSQL RPC this endpoint calls for atomicity */
  atomicRpc: string;
  /** Tables this endpoint mutates (via service_role) */
  mutatesTables: string[];
  /** Ledger table this endpoint appends to */
  ledgerTable: string;
  /** Whether this endpoint needs the LiveKit Server SDK */
  requiresLiveKit: boolean;
}

// ── Edge Function Registry ─────────────────────────────────────────────────
//
// Complete configuration for all 13 secure mutation endpoints.
// Each entry defines what RPC to call, what tables it touches,
// and what ledger table it writes to.

export const EDGE_FUNCTION_REGISTRY: EdgeFunctionRegistration[] = [
  {
    endpoint: "spend-coverage-minutes",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 1_000,
    atomicRpc: "decrement_coverage_minutes",
    mutatesTables: ["coverage_minute_accounts", "coverage_minute_transactions"],
    ledgerTable: "coverage_minute_transactions",
    requiresLiveKit: false,
  },
  {
    endpoint: "transfer-credits",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 2_000,
    atomicRpc: "transfer_credits_atomic",
    mutatesTables: ["credit_balances", "credit_transactions"],
    ledgerTable: "ledger_credit_transactions",
    requiresLiveKit: false,
  },
  {
    endpoint: "donate-coverage-minutes",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 5_000,
    atomicRpc: "donate_coverage_minutes_atomic",
    mutatesTables: ["coverage_minute_accounts", "coverage_minute_donations"],
    ledgerTable: "coverage_minute_transactions",
    requiresLiveKit: false,
  },
  {
    endpoint: "join-guild",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 5_000,
    atomicRpc: "join_guild_atomic",
    mutatesTables: ["guild_memberships", "guilds"],
    ledgerTable: "ledger_governance_events",
    requiresLiveKit: false,
  },
  {
    endpoint: "leave-guild",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 5_000,
    atomicRpc: "leave_guild_atomic",
    mutatesTables: ["guild_memberships", "guilds"],
    ledgerTable: "ledger_governance_events",
    requiresLiveKit: false,
  },
  {
    endpoint: "join-tribe",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 5_000,
    atomicRpc: "join_tribe_atomic",
    mutatesTables: ["tribe_memberships", "tribes"],
    ledgerTable: "ledger_governance_events",
    requiresLiveKit: false,
  },
  {
    endpoint: "leave-tribe",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 5_000,
    atomicRpc: "leave_tribe_atomic",
    mutatesTables: ["tribe_memberships", "tribes"],
    ledgerTable: "ledger_governance_events",
    requiresLiveKit: false,
  },
  {
    endpoint: "process-pedestal-contribution",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 2_000,
    atomicRpc: "process_contribution_atomic",
    mutatesTables: ["credit_balances", "pedestal_contributions", "pedestals"],
    ledgerTable: "ledger_pedestal_transactions",
    requiresLiveKit: false,
  },
  {
    endpoint: "lease-keep",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 10_000,
    atomicRpc: "lease_keep_atomic",
    mutatesTables: ["keep_leases", "credit_balances"],
    ledgerTable: "ledger_keep_leases",
    requiresLiveKit: false,
  },
  {
    endpoint: "renew-keep-lease",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 10_000,
    atomicRpc: "renew_keep_lease_atomic",
    mutatesTables: ["keep_leases", "credit_balances"],
    ledgerTable: "ledger_keep_leases",
    requiresLiveKit: false,
  },
  {
    endpoint: "record-reading-event",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 1_000,
    atomicRpc: "record_reading_event_atomic",
    mutatesTables: ["ghost_reading_events", "coverage_minute_accounts"],
    ledgerTable: "ledger_coverage_minutes",
    requiresLiveKit: false,
  },
  {
    endpoint: "grant-mic-permission",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 1_000,
    atomicRpc: "grant_mic_permission_atomic",
    mutatesTables: ["mic_permission_states", "mic_request_queue", "round_tables"],
    ledgerTable: "ledger_round_table_sessions",
    requiresLiveKit: true,
  },
  {
    endpoint: "revoke-mic-permission",
    method: "POST",
    requiresIdempotency: true,
    rateLimitMs: 1_000,
    atomicRpc: "revoke_mic_permission_atomic",
    mutatesTables: ["mic_permission_states", "coverage_debit_events", "round_tables"],
    ledgerTable: "ledger_round_table_sessions",
    requiresLiveKit: true,
  },
];

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Get the Edge Function registration for a specific endpoint.
 */
export function getEdgeFunctionConfig(
  endpoint: SecureMutationEndpoint,
): EdgeFunctionRegistration | undefined {
  return EDGE_FUNCTION_REGISTRY.find(r => r.endpoint === endpoint);
}

/**
 * Get all Edge Functions that require LiveKit Server SDK.
 */
export function getLiveKitEdgeFunctions(): EdgeFunctionRegistration[] {
  return EDGE_FUNCTION_REGISTRY.filter(r => r.requiresLiveKit);
}

/**
 * Get all Edge Functions that mutate a specific table.
 */
export function getEndpointsForTable(tableName: string): EdgeFunctionRegistration[] {
  return EDGE_FUNCTION_REGISTRY.filter(r => r.mutatesTables.includes(tableName));
}

/**
 * Get the PostgreSQL RPC name for a given endpoint.
 * This is the atomic function that the Edge Function calls
 * via adminClient.rpc().
 */
export function getAtomicRpc(endpoint: SecureMutationEndpoint): string | undefined {
  return getEdgeFunctionConfig(endpoint)?.atomicRpc;
}

/**
 * Validate that an idempotency key has the correct format (UUID v4).
 */
export function isValidIdempotencyKey(key: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(key);
}

/**
 * Check if a rate limit has been exceeded.
 * Returns true if the request should be blocked.
 */
export function isRateLimited(
  lastRequestTimestamp: string | null,
  minIntervalMs: number,
): boolean {
  if (!lastRequestTimestamp) return false;
  const elapsed = Date.now() - new Date(lastRequestTimestamp).getTime();
  return elapsed < minIntervalMs;
}

/**
 * Get a summary of all Edge Functions by category.
 */
export function getEdgeFunctionSummary(): {
  total: number;
  withIdempotency: number;
  withLiveKit: number;
  uniqueRpcs: number;
  uniqueMutatedTables: number;
} {
  const uniqueRpcs = new Set(EDGE_FUNCTION_REGISTRY.map(r => r.atomicRpc));
  const uniqueTables = new Set(EDGE_FUNCTION_REGISTRY.flatMap(r => r.mutatesTables));

  return {
    total: EDGE_FUNCTION_REGISTRY.length,
    withIdempotency: EDGE_FUNCTION_REGISTRY.filter(r => r.requiresIdempotency).length,
    withLiveKit: EDGE_FUNCTION_REGISTRY.filter(r => r.requiresLiveKit).length,
    uniqueRpcs: uniqueRpcs.size,
    uniqueMutatedTables: uniqueTables.size,
  };
}

// ── R-016 Integration: Implementation Patterns ────────────────────────────
//
// Rook Research R-016 specifies concrete Deno 2.x implementation patterns
// for deploying the Edge Functions defined above. These types model the
// project structure, pg_cron scheduling, processing locks, and
// Redis-free rate limiting via PostgreSQL UNLOGGED tables.

/**
 * Shared utility module — all Edge Functions import from _shared/.
 * Prevents code duplication across 13+ function directories.
 *
 * Directory structure:
 *   supabase/functions/_shared/cors.ts
 *   supabase/functions/_shared/supabaseAdmin.ts
 *   supabase/functions/_shared/auth.ts
 *   supabase/functions/_shared/ledger.ts
 *   supabase/functions/_shared/rateLimiter.ts
 */
export type SharedUtilityModule =
  | "cors"             // Standard CORS headers for all endpoints
  | "supabaseAdmin"    // Service role client instantiation
  | "auth"             // JWT validation logic (auth.getUser())
  | "ledger"           // Standardized immutable ledger write function
  | "rateLimiter";     // Rate limit check via PostgreSQL RPC

/** The shared utility modules every Edge Function imports */
export const SHARED_UTILITY_MODULES: SharedUtilityModule[] = [
  "cors",
  "supabaseAdmin",
  "auth",
  "ledger",
  "rateLimiter",
];

/**
 * pg_cron job configuration — schedules PostgreSQL functions or
 * Edge Function calls via pg_net at fixed intervals.
 *
 * Used for:
 *   - Coverage Minutes debit loop (1-minute interval)
 *   - Idempotency key cleanup (daily)
 *   - Rate limit table cleanup (hourly)
 *   - Revenue period finalization (monthly)
 */
export interface PgCronJobConfig {
  /** Job name (unique identifier in pg_cron) */
  jobName: string;
  /** Cron schedule expression (e.g., "* * * * *" = every minute) */
  cronSchedule: string;
  /** Whether this job calls an Edge Function (via pg_net) or a local SQL function */
  callType: "edge_function" | "sql_function";
  /** Edge Function endpoint (if callType = "edge_function") */
  edgeFunctionEndpoint?: string;
  /** SQL function name (if callType = "sql_function") */
  sqlFunctionName?: string;
  /** Whether a processing lock is required (prevents concurrent execution) */
  requiresProcessingLock: boolean;
  /** Description */
  description: string;
}

/** Registered pg_cron jobs for the platform */
export const PG_CRON_JOBS: PgCronJobConfig[] = [
  {
    jobName: "coverage-debit-loop",
    cronSchedule: "* * * * *", // every minute
    callType: "edge_function",
    edgeFunctionEndpoint: "coverage_debit_loop",
    requiresProcessingLock: true,
    description: "Deducts Coverage Minutes from active Round Table speakers every 60 seconds",
  },
  {
    jobName: "idempotency-key-cleanup",
    cronSchedule: "0 3 * * *", // daily at 3 AM
    callType: "sql_function",
    sqlFunctionName: "cleanup_expired_idempotency_keys",
    requiresProcessingLock: false,
    description: "Removes expired idempotency keys older than 24 hours",
  },
  {
    jobName: "rate-limit-cleanup",
    cronSchedule: "0 * * * *", // every hour
    callType: "sql_function",
    sqlFunctionName: "cleanup_stale_rate_limits",
    requiresProcessingLock: false,
    description: "Removes stale rate limit entries from the UNLOGGED table",
  },
  {
    jobName: "revenue-period-finalization",
    cronSchedule: "0 0 1 * *", // 1st of every month at midnight
    callType: "edge_function",
    edgeFunctionEndpoint: "finalize_revenue_period",
    requiresProcessingLock: true,
    description: "Finalizes the previous month's Participation Revenue allocations",
  },
];

/**
 * Processing Lock — prevents race conditions when pg_cron fires
 * while a previous job instance is still running.
 *
 * Implementation: A PostgreSQL table with a single row per job.
 * The Edge Function acquires the lock (UPDATE SET locked=true),
 * processes, then releases (UPDATE SET locked=false).
 * If lock is already held, the new instance exits immediately.
 */
export interface ProcessingLockConfig {
  /** Table name for processing locks */
  tableName: "processing_locks";
  /** Job name column */
  jobNameColumn: "job_name";
  /** Whether the lock is currently held */
  isLockedColumn: "is_locked";
  /** When the lock was acquired */
  lockedAtColumn: "locked_at";
  /** Safety timeout (minutes) — auto-release if held longer than this */
  safetyTimeoutMinutes: number;
}

/** Default processing lock configuration */
export const DEFAULT_PROCESSING_LOCK: ProcessingLockConfig = {
  tableName: "processing_locks",
  jobNameColumn: "job_name",
  isLockedColumn: "is_locked",
  lockedAtColumn: "locked_at",
  safetyTimeoutMinutes: 5,
};

/**
 * UNLOGGED Rate Limit Table — Redis-free rate limiting using PostgreSQL.
 *
 * WHY UNLOGGED:
 *   - Standard Postgres tables write to the Write-Ahead Log (WAL),
 *     which adds latency for high-frequency rate limit checks
 *   - UNLOGGED tables skip WAL, staying in memory/disk only
 *   - Data is lost on database crash, which is perfectly acceptable
 *     for rate limits (they just reset — no harm done)
 *   - Eliminates the need for an external Redis/Upstash dependency
 *
 * The rate limit check is done via a PostgreSQL RPC (check_rate_limit)
 * called by the Edge Function BEFORE doing any heavy processing.
 * This keeps the check extremely fast (~1ms per call).
 */
export interface UnloggedRateLimitConfig {
  /** Table name (UNLOGGED) */
  tableName: "api_rate_limits";
  /** Composite primary key: (ip_address, endpoint) */
  primaryKey: ["ip_address", "endpoint"];
  /** RPC function name for atomic rate limit check + increment */
  rpcFunctionName: "check_rate_limit";
  /** RPC parameters */
  rpcParams: {
    ipParam: "p_ip";
    endpointParam: "p_endpoint";
    limitParam: "p_limit";
    windowSecondsParam: "p_window_seconds";
  };
  /** Whether UNLOGGED table is being used (vs standard table) */
  isUnlogged: true;
}

/** Default UNLOGGED rate limit configuration */
export const DEFAULT_UNLOGGED_RATE_LIMIT: UnloggedRateLimitConfig = {
  tableName: "api_rate_limits",
  primaryKey: ["ip_address", "endpoint"],
  rpcFunctionName: "check_rate_limit",
  rpcParams: {
    ipParam: "p_ip",
    endpointParam: "p_endpoint",
    limitParam: "p_limit",
    windowSecondsParam: "p_window_seconds",
  },
  isUnlogged: true,
};

/**
 * Get all pg_cron jobs that require processing locks.
 */
export function getLockedCronJobs(): PgCronJobConfig[] {
  return PG_CRON_JOBS.filter(j => j.requiresProcessingLock);
}

/**
 * Get the pg_cron job configuration for a specific job.
 */
export function getCronJobConfig(jobName: string): PgCronJobConfig | undefined {
  return PG_CRON_JOBS.find(j => j.jobName === jobName);
}
