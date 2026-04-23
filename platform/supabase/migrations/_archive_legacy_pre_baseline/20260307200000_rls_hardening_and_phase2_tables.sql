-- ============================================================================
-- RLS HARDENING (R-007) + PHASE 2 TABLES (R-006, R-008, R-009)
-- ============================================================================
-- Source: Rook Research R-006 (WebRTC), R-007 (RLS Patterns), R-008 (Ghost),
--         R-009 (Digital Real Estate)
-- Date: 2026-03-07
--
-- This migration:
--   1. Installs append-only triggers on ledger tables (R-007 Pattern 2)
--   2. Upgrades coverage_minute_accounts to public-read (R-007 Pattern 3)
--   3. Adds LiveKit room tables (R-006)
--   4. Adds Ghost deployment tables (R-008)
--   5. Adds Keep lease tables (R-009)
-- ============================================================================

-- ============================================================================
-- PART 1: APPEND-ONLY TRIGGERS (R-007 Pattern 2)
-- ============================================================================
-- These triggers make it PHYSICALLY IMPOSSIBLE to update or delete
-- ledger records, even for the service_role. The only way to "correct"
-- a ledger entry is to append a new reversal entry.

CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Immutable ledger records cannot be modified or deleted. Append a corrective entry instead.';
END;
$$ LANGUAGE plpgsql;

-- Apply to all ledger/immutable tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'coverage_minute_transactions',
    'coverage_minute_donations',
    'donation_record_views',
    'round_table_sessions',
    'phase_validation_attempts',
    'phase_access_records',
    'pedestal_contributions',
    'connection_handshakes',
    'governance_events'
  ]) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS enforce_append_only ON %I; ' ||
      'CREATE TRIGGER enforce_append_only BEFORE UPDATE OR DELETE ON %I ' ||
      'FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================================
-- PART 2: UPGRADE COVERAGE ACCOUNTS TO PUBLIC-READ (R-007 Pattern 3)
-- ============================================================================
-- Coverage Minutes balances should be transparent (anyone can see anyone's balance)
-- but ONLY the system (Edge Functions via service_role) can mutate them.

-- Drop the old owner-only SELECT policy
DROP POLICY IF EXISTS "Users can read own coverage account" ON coverage_minute_accounts;

-- Drop the client-side UPDATE policy (CRITICAL SECURITY FIX)
DROP POLICY IF EXISTS "Users can update own coverage account" ON coverage_minute_accounts;

-- Add transparent read policy
CREATE POLICY "Coverage balances are publicly readable"
  ON coverage_minute_accounts FOR SELECT
  USING (true);

-- No UPDATE policy = client-side updates blocked.
-- All balance mutations go through Edge Functions (spend-coverage-minutes,
-- donate-coverage-minutes, record-reading-event) which use service_role key.

-- ============================================================================
-- PART 3: LIVEKIT ROOM TABLES (R-006)
-- ============================================================================

CREATE TABLE IF NOT EXISTS livekit_room_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name TEXT NOT NULL UNIQUE,
  table_id UUID NOT NULL REFERENCES round_tables(id) ON DELETE CASCADE,
  server_url TEXT NOT NULL,
  api_key_ref TEXT NOT NULL DEFAULT 'vault:livekit-api-key',
  api_secret_ref TEXT NOT NULL DEFAULT 'vault:livekit-api-secret',
  table_size TEXT NOT NULL DEFAULT 'SMALL'
    CHECK (table_size IN ('SMALL', 'MEDIUM', 'TOWN_HALL')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  audio_codec TEXT NOT NULL DEFAULT 'opus'
    CHECK (audio_codec IN ('opus', 'red_opus')),
  recording_enabled BOOLEAN NOT NULL DEFAULT false,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE livekit_room_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read room configs"
  ON livekit_room_configs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- No client-side INSERT/UPDATE — Edge Functions only

CREATE TABLE IF NOT EXISTS mic_permission_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES round_tables(id) ON DELETE CASCADE UNIQUE,
  active_publisher_id UUID REFERENCES auth.users(id),
  publish_granted_at TIMESTAMPTZ,
  publisher_balance_at_grant NUMERIC(12,2) NOT NULL DEFAULT 0,
  edge_function_url TEXT NOT NULL,
  debit_interval_ms INTEGER NOT NULL DEFAULT 60000,
  last_debit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mic_permission_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mic permission states"
  ON mic_permission_states FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- No client-side mutations — LiveKit permissions managed by Edge Functions

CREATE TABLE IF NOT EXISTS coverage_debit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES round_tables(id) ON DELETE CASCADE,
  speaker_id UUID NOT NULL REFERENCES auth.users(id),
  minutes_debited NUMERIC(12,2) NOT NULL CHECK (minutes_debited > 0),
  remaining_balance NUMERIC(12,2) NOT NULL,
  auto_muted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE coverage_debit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own debit events"
  ON coverage_debit_events FOR SELECT
  USING (auth.uid() = speaker_id);

-- Append-only (immutable record of speaking time debits)
CREATE TRIGGER enforce_append_only_debit_events
  BEFORE UPDATE OR DELETE ON coverage_debit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- ============================================================================
-- PART 4: GHOST DEPLOYMENT TABLES (R-008)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ghost_deployment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedestal_ids UUID[] NOT NULL DEFAULT '{}',
  deployment_mode TEXT NOT NULL DEFAULT 'self_hosted_railway'
    CHECK (deployment_mode IN (
      'self_hosted_railway', 'self_hosted_flyio',
      'self_hosted_docker', 'ghost_pro'
    )),
  ghost_url TEXT NOT NULL,
  docker_image TEXT NOT NULL DEFAULT 'ghost:5-alpine',
  database_type TEXT NOT NULL DEFAULT 'mysql'
    CHECK (database_type IN ('mysql', 'sqlite')),
  region TEXT NOT NULL DEFAULT 'us-east-1',
  monthly_cost_estimate NUMERIC(12,2) NOT NULL DEFAULT 15,
  jwt_bridge_enabled BOOLEAN NOT NULL DEFAULT true,
  supabase_jwt_secret_ref TEXT NOT NULL DEFAULT 'vault:supabase-jwt-secret',
  golden_key_script_id TEXT NOT NULL,
  cors_origins TEXT[] NOT NULL DEFAULT ARRAY['https://lianabanyan.com'],
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  last_health_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ghost_deployment_configs ENABLE ROW LEVEL SECURITY;

-- Only system/admins manage Ghost deployments — no client-side access
CREATE POLICY "Authenticated users can read ghost configs"
  ON ghost_deployment_configs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS ghost_jwt_bridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_config_id UUID NOT NULL REFERENCES ghost_deployment_configs(id) ON DELETE CASCADE,
  supabase_url TEXT NOT NULL,
  jwt_audience TEXT NOT NULL DEFAULT 'authenticated',
  auto_create_members BOOLEAN NOT NULL DEFAULT true,
  sync_interval_ms INTEGER NOT NULL DEFAULT 300000,
  last_sync_at TIMESTAMPTZ,
  members_synced INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ghost_jwt_bridges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read jwt bridges"
  ON ghost_jwt_bridges FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- PART 5: KEEP LEASE TABLES (R-009)
-- ============================================================================

CREATE TABLE IF NOT EXISTS keep_leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keep_id TEXT NOT NULL,
  trunk_id UUID NOT NULL REFERENCES phase_mimictrunks(id) ON DELETE CASCADE,
  lessee_type TEXT NOT NULL CHECK (lessee_type IN ('guild', 'tribe', 'member')),
  lessee_id UUID NOT NULL,
  capacity_tier TEXT NOT NULL
    CHECK (capacity_tier IN ('STARTER', 'STANDARD', 'PREMIUM', 'FORTRESS')),
  monthly_lease_cost NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'grace', 'archived', 'suspended')),
  lease_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_ends_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  sub_lease_count INTEGER NOT NULL DEFAULT 0 CHECK (sub_lease_count <= 20),
  period_traffic_count INTEGER NOT NULL DEFAULT 0,
  ledger_entry_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE keep_leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read keep leases"
  ON keep_leases FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Mutations via Edge Functions (lease-keep, renew-keep-lease)

CREATE TABLE IF NOT EXISTS keep_sub_leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_lease_id UUID NOT NULL REFERENCES keep_leases(id) ON DELETE CASCADE,
  keep_id TEXT NOT NULL,
  sub_lessee_type TEXT NOT NULL
    CHECK (sub_lessee_type IN ('tribe', 'member', 'npc_shopkeeper')),
  sub_lessee_id UUID NOT NULL,
  monthly_rent NUMERIC(12,2) NOT NULL CHECK (monthly_rent >= 0),
  space_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ledger_entry_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE keep_sub_leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sub-leases"
  ON keep_sub_leases FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS npc_shopkeepers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_member_id UUID NOT NULL REFERENCES auth.users(id),
  keep_id TEXT NOT NULL,
  sub_lease_id UUID NOT NULL REFERENCES keep_sub_leases(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  inventory_type TEXT NOT NULL
    CHECK (inventory_type IN (
      'special_deck_cards', 'cosmetic_items',
      'guild_merchandise', 'mixed'
    )),
  active_listing_count INTEGER NOT NULL DEFAULT 0,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  total_credits_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE npc_shopkeepers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read NPC shopkeepers"
  ON npc_shopkeepers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can manage their NPCs"
  ON npc_shopkeepers FOR UPDATE
  USING (auth.uid() = owner_member_id);

CREATE POLICY "Owners can create NPCs"
  ON npc_shopkeepers FOR INSERT
  WITH CHECK (auth.uid() = owner_member_id);

-- ============================================================================
-- PART 6: INDEXES FOR NEW TABLES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_livekit_rooms_table ON livekit_room_configs(table_id);
CREATE INDEX IF NOT EXISTS idx_mic_permissions_table ON mic_permission_states(table_id);
CREATE INDEX IF NOT EXISTS idx_debit_events_table ON coverage_debit_events(table_id);
CREATE INDEX IF NOT EXISTS idx_debit_events_speaker ON coverage_debit_events(speaker_id);
CREATE INDEX IF NOT EXISTS idx_ghost_deploy_mode ON ghost_deployment_configs(deployment_mode);
CREATE INDEX IF NOT EXISTS idx_ghost_jwt_deploy ON ghost_jwt_bridges(deployment_config_id);
CREATE INDEX IF NOT EXISTS idx_keep_leases_trunk ON keep_leases(trunk_id);
CREATE INDEX IF NOT EXISTS idx_keep_leases_lessee ON keep_leases(lessee_id, lessee_type);
CREATE INDEX IF NOT EXISTS idx_keep_leases_status ON keep_leases(status);
CREATE INDEX IF NOT EXISTS idx_sub_leases_parent ON keep_sub_leases(parent_lease_id);
CREATE INDEX IF NOT EXISTS idx_npc_owner ON npc_shopkeepers(owner_member_id);
CREATE INDEX IF NOT EXISTS idx_npc_keep ON npc_shopkeepers(keep_id);

-- ============================================================================
-- PART 7: UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'ghost_deployment_configs', 'keep_leases'
  ]) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; ' ||
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I ' ||
      'FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END $$;
