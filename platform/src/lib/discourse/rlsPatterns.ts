/**
 * ROW LEVEL SECURITY PATTERNS — Supabase RLS Policy Library
 * ===========================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 7
 * Source: Rook Research R-007 (Supabase RLS Pattern Library)
 *
 * This file defines the TypeScript types that model our three RLS patterns:
 *
 *   1. Multi-Tenant Guild/Tribe Hierarchy — users see only their org's data
 *   2. Append-Only Ledger Tables — no updates, no deletes, ever
 *   3. Owner-Spends-But-Anyone-Views — transparent balances, secure mutations
 *
 * IMPORTANT ARCHITECTURAL DECISION (R-007):
 *   - RLS should primarily control READ access (SELECT policies)
 *   - State MUTATIONS (spending minutes, transferring funds, joining guilds)
 *     should go through Edge Functions using the service_role key
 *   - This prevents client-side manipulation of balances/state
 *   - Edge Functions bypass RLS, validate auth, perform the mutation, and
 *     write to the Immutable Ledger in a single transaction
 *
 * SQL templates for each pattern are documented in comments below.
 * Migration file: 20260307200000_rls_hardening_and_phase2_tables.sql
 *   - Append-only triggers installed on 9 ledger tables
 *   - Coverage accounts upgraded to public-read
 *   - Phase 2 tables created (LiveKit rooms, Ghost deployment, Keep leases)
 */

// ── Constants ──────────────────────────────────────────────────────────────

/** Number of discourse tables requiring RLS policies */
export const DISCOURSE_TABLE_COUNT = 26;

/** RLS pattern types used across the platform */
export const RLS_PATTERN_TYPES = [
  "multi_tenant_hierarchy",   // Guild/Tribe membership-gated reads
  "append_only_ledger",       // Immutable ledger (no UPDATE/DELETE)
  "owner_spends_public_views", // Transparent balances, secure spending
  "public_read",              // Anyone can read (e.g., public Pedestals)
  "owner_only",               // Only the owner can read/write
] as const;

export type RLSPatternType = typeof RLS_PATTERN_TYPES[number];

/** Edge Function endpoints that bypass RLS for state mutations */
export const SECURE_MUTATION_ENDPOINTS = [
  "spend-coverage-minutes",
  "transfer-credits",
  "donate-coverage-minutes",
  "join-guild",
  "leave-guild",
  "join-tribe",
  "leave-tribe",
  "process-pedestal-contribution",
  "lease-keep",
  "renew-keep-lease",
  "record-reading-event",
  "grant-mic-permission",
  "revoke-mic-permission",
] as const;

export type SecureMutationEndpoint = typeof SECURE_MUTATION_ENDPOINTS[number];

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * Describes which RLS pattern a table uses and its policy configuration.
 */
export interface TableRLSConfig {
  /** Table name in Supabase */
  tableName: string;
  /** Primary RLS pattern */
  pattern: RLSPatternType;
  /** Whether RLS is currently enabled on this table */
  rlsEnabled: boolean;
  /** SELECT policy description */
  selectPolicy: string;
  /** INSERT policy description (if applicable) */
  insertPolicy?: string;
  /** Whether UPDATE is allowed via RLS (false = Edge Function only) */
  updateViaRLS: boolean;
  /** Whether DELETE is allowed at all (false for ledger tables) */
  deleteAllowed: boolean;
  /** Edge Function endpoints that mutate this table */
  mutationEndpoints: SecureMutationEndpoint[];
  /** Whether an append-only trigger is installed */
  hasAppendOnlyTrigger: boolean;
}

/**
 * RLS migration status tracker — used to track which tables
 * have been migrated from the current "publicly readable" state
 * to proper RLS policies.
 */
export interface RLSMigrationStatus {
  /** Table name */
  tableName: string;
  /** Migration status */
  status: "pending" | "in_progress" | "completed" | "failed";
  /** Pattern applied */
  patternApplied?: RLSPatternType;
  /** Migration timestamp */
  migratedAt?: string;
  /** Error message (if failed) */
  error?: string;
  /** Whether the append-only trigger was installed (ledger tables only) */
  appendOnlyTriggerInstalled: boolean;
}

// ── Table → Pattern Mapping ────────────────────────────────────────────────
//
// Defines which RLS pattern each of the 26 discourse tables should use.
// This is the blueprint for the RLS migration.

/**
 * Complete RLS configuration for all 26 discourse tables.
 * Based on R-007 analysis and the data model in the discourse/ directory.
 *
 * SQL TEMPLATE — Pattern 1: Multi-Tenant Guild/Tribe Hierarchy
 * ─────────────────────────────────────────────────────────────
 * ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
 *
 * -- Members can view their own org's data
 * CREATE POLICY "Members can view" ON {table}
 *   FOR SELECT
 *   USING (
 *     EXISTS (
 *       SELECT 1 FROM tribe_members
 *       WHERE tribe_members.tribe_id = {table}.tribe_id
 *       AND tribe_members.member_id = auth.uid()
 *     )
 *   );
 *
 * -- Leaders can manage
 * CREATE POLICY "Leaders can manage" ON {table}
 *   FOR ALL
 *   USING (
 *     EXISTS (
 *       SELECT 1 FROM tribe_members
 *       WHERE tribe_members.tribe_id = {table}.tribe_id
 *       AND tribe_members.member_id = auth.uid()
 *       AND tribe_members.role = 'leader'
 *     )
 *   );
 *
 * SQL TEMPLATE — Pattern 2: Append-Only Ledger
 * ─────────────────────────────────────────────
 * ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
 *
 * -- Publicly readable (transparency)
 * CREATE POLICY "Ledger is publicly readable" ON {table}
 *   FOR SELECT USING (true);
 *
 * -- Users can insert their own entries
 * CREATE POLICY "Users can insert own entries" ON {table}
 *   FOR INSERT WITH CHECK (auth.uid() = member_id);
 *
 * -- Append-only trigger (block UPDATE/DELETE absolutely)
 * CREATE OR REPLACE FUNCTION prevent_ledger_modification()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   RAISE EXCEPTION 'Immutable ledger records cannot be modified or deleted.';
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * CREATE TRIGGER enforce_append_only
 *   BEFORE UPDATE OR DELETE ON {table}
 *   FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();
 *
 * SQL TEMPLATE — Pattern 3: Owner-Spends-But-Anyone-Views
 * ───────────────────────────────────────────────────────
 * ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
 *
 * -- Anyone can view (transparency)
 * CREATE POLICY "Balances are public" ON {table}
 *   FOR SELECT USING (true);
 *
 * -- NO client-side UPDATE policy. All mutations via Edge Functions
 * -- using service_role key which bypasses RLS.
 */
export const DISCOURSE_TABLE_RLS_MAP: TableRLSConfig[] = [
  // ── Ledger tables (append-only) ──
  {
    tableName: "ledger_coverage_minutes",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "Users insert own entries; system via service_role",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["spend-coverage-minutes", "donate-coverage-minutes", "record-reading-event"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ledger_credit_transactions",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["transfer-credits", "process-pedestal-contribution"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ledger_governance_events",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["join-guild", "leave-guild", "join-tribe", "leave-tribe"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ledger_pedestal_transactions",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["process-pedestal-contribution"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ledger_keep_leases",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["lease-keep", "renew-keep-lease"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ledger_phase_validations",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ledger_round_table_sessions",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["grant-mic-permission", "revoke-mic-permission"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ledger_source_distribution",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  // ── Balance tables (owner-spends, public-views) ──
  {
    tableName: "coverage_minute_accounts",
    pattern: "owner_spends_public_views",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["spend-coverage-minutes", "donate-coverage-minutes", "record-reading-event"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "credit_balances",
    pattern: "owner_spends_public_views",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["transfer-credits", "process-pedestal-contribution", "lease-keep"],
    hasAppendOnlyTrigger: false,
  },
  // ── Guild/Tribe tables (multi-tenant hierarchy) ──
  {
    tableName: "guilds",
    pattern: "public_read",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (guild discovery)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["join-guild", "leave-guild"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "tribes",
    pattern: "multi_tenant_hierarchy",
    rlsEnabled: false,
    selectPolicy: "Members of parent Guild can view",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["join-tribe", "leave-tribe"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "tribe_keeps",
    pattern: "multi_tenant_hierarchy",
    rlsEnabled: false,
    selectPolicy: "Members of parent Tribe can view",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["lease-keep"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "guild_memberships",
    pattern: "multi_tenant_hierarchy",
    rlsEnabled: false,
    selectPolicy: "Guild members can view fellow members",
    insertPolicy: "System via service_role (join flows)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["join-guild", "leave-guild"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "tribe_memberships",
    pattern: "multi_tenant_hierarchy",
    rlsEnabled: false,
    selectPolicy: "Tribe members can view fellow members",
    insertPolicy: "System via service_role (join flows)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["join-tribe", "leave-tribe"],
    hasAppendOnlyTrigger: false,
  },
  // ── Pedestal tables ──
  {
    tableName: "pedestals",
    pattern: "public_read",
    rlsEnabled: false,
    selectPolicy: "Public Pedestals readable by all; private by funders only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["process-pedestal-contribution"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "pedestal_contributions",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (transparency)",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["process-pedestal-contribution"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "subscription_feeds",
    pattern: "public_read",
    rlsEnabled: false,
    selectPolicy: "Readable by all (content discovery)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  // ── Private member data (owner-only) ──
  {
    tableName: "private_portfolio_subscriptions",
    pattern: "owner_only",
    rlsEnabled: false,
    selectPolicy: "Owner can view their own subscriptions only",
    insertPolicy: "Owner can insert own subscriptions",
    updateViaRLS: true,
    deleteAllowed: true,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  // ── Round Table tables ──
  {
    tableName: "round_tables",
    pattern: "public_read",
    rlsEnabled: false,
    selectPolicy: "Publicly readable (join any table)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["grant-mic-permission", "revoke-mic-permission"],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "mic_request_queue",
    pattern: "public_read",
    rlsEnabled: false,
    selectPolicy: "Readable by all participants in the table",
    insertPolicy: "Authenticated users can request mic",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["grant-mic-permission", "revoke-mic-permission"],
    hasAppendOnlyTrigger: false,
  },
  // ── Phase MimicTrunk tables ──
  {
    tableName: "phase_mimictrunks",
    pattern: "multi_tenant_hierarchy",
    rlsEnabled: false,
    selectPolicy: "Members of owning Guild/Tribe can view",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "phase_access_records",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Readable by Phase owner and the accessing member",
    insertPolicy: "System via service_role only",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "special_deck_card_links",
    pattern: "owner_only",
    rlsEnabled: false,
    selectPolicy: "Owner can view their own card links",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  // ── Ghost/Newsletter integration tables ──
  {
    tableName: "ghost_integrations",
    pattern: "multi_tenant_hierarchy",
    rlsEnabled: false,
    selectPolicy: "Pedestal curator can view their integrations",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: [],
    hasAppendOnlyTrigger: false,
  },
  {
    tableName: "ghost_reading_events",
    pattern: "append_only_ledger",
    rlsEnabled: false,
    selectPolicy: "Readable by the reader and the Pedestal curator",
    insertPolicy: "System via service_role (from Edge Function)",
    updateViaRLS: false,
    deleteAllowed: false,
    mutationEndpoints: ["record-reading-event"],
    hasAppendOnlyTrigger: false,
  },
];

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Get all tables that use a specific RLS pattern.
 */
export function getTablesByPattern(pattern: RLSPatternType): TableRLSConfig[] {
  return DISCOURSE_TABLE_RLS_MAP.filter(t => t.pattern === pattern);
}

/**
 * Get the RLS configuration for a specific table.
 */
export function getTableRLSConfig(tableName: string): TableRLSConfig | undefined {
  return DISCOURSE_TABLE_RLS_MAP.find(t => t.tableName === tableName);
}

/**
 * Get all tables that are NOT yet RLS-enabled (migration targets).
 */
export function getPendingRLSTables(): TableRLSConfig[] {
  return DISCOURSE_TABLE_RLS_MAP.filter(t => !t.rlsEnabled);
}

/**
 * Get all tables that need append-only triggers installed.
 */
export function getTablesNeedingAppendOnlyTrigger(): TableRLSConfig[] {
  return DISCOURSE_TABLE_RLS_MAP.filter(
    t => t.pattern === "append_only_ledger" && !t.hasAppendOnlyTrigger,
  );
}

/**
 * Get the Edge Function endpoints that a table depends on for mutations.
 */
export function getMutationEndpoints(tableName: string): SecureMutationEndpoint[] {
  const config = getTableRLSConfig(tableName);
  return config?.mutationEndpoints ?? [];
}

/**
 * Summary of the RLS migration status across all discourse tables.
 */
export function getRLSMigrationSummary(): {
  total: number;
  enabled: number;
  pending: number;
  appendOnlyCount: number;
  appendOnlyTriggersInstalled: number;
  byPattern: Record<RLSPatternType, number>;
} {
  const enabled = DISCOURSE_TABLE_RLS_MAP.filter(t => t.rlsEnabled).length;
  const appendOnly = DISCOURSE_TABLE_RLS_MAP.filter(t => t.pattern === "append_only_ledger");
  const triggersInstalled = appendOnly.filter(t => t.hasAppendOnlyTrigger).length;

  const byPattern = {} as Record<RLSPatternType, number>;
  for (const pattern of RLS_PATTERN_TYPES) {
    byPattern[pattern] = DISCOURSE_TABLE_RLS_MAP.filter(t => t.pattern === pattern).length;
  }

  return {
    total: DISCOURSE_TABLE_RLS_MAP.length,
    enabled,
    pending: DISCOURSE_TABLE_RLS_MAP.length - enabled,
    appendOnlyCount: appendOnly.length,
    appendOnlyTriggersInstalled: triggersInstalled,
    byPattern,
  };
}
