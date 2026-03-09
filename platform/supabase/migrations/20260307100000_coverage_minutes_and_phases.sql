-- ============================================================================
-- COVERAGE MINUTES, ROUND TABLES, PHASE MIMICTRUNKS, PEDESTALS,
-- GUILD/TRIBE PHASES, SOURCE DISTRIBUTION, REAL WORLD PUZZLES
-- ============================================================================
-- Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md
-- Tickets: B-008 (Supabase Schema -- All New Tables)
-- Date: 2026-03-07
--
-- 13 tables + 8 immutable ledger section tables = 21 total
-- ============================================================================

-- ── 1. COVERAGE MINUTE ACCOUNTS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coverage_minute_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  earned_minutes NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_minutes NUMERIC(12,2) NOT NULL DEFAULT 0,
  donated_minutes NUMERIC(12,2) NOT NULL DEFAULT 0,
  received_donations NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_session_broadcast INTEGER NOT NULL DEFAULT 180,
  accumulation_level INTEGER NOT NULL DEFAULT 0,
  accumulation_increment INTEGER NOT NULL DEFAULT 3,
  reading_speed_tier TEXT NOT NULL DEFAULT 'normal'
    CHECK (reading_speed_tier IN ('slow', 'normal', 'fast', 'speed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id)
);

ALTER TABLE coverage_minute_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own coverage account"
  ON coverage_minute_accounts FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can update own coverage account"
  ON coverage_minute_accounts FOR UPDATE
  USING (auth.uid() = member_id);

CREATE POLICY "System can insert coverage accounts"
  ON coverage_minute_accounts FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── 2. COVERAGE MINUTE TRANSACTIONS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coverage_minute_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('earned', 'spent', 'donated', 'received')),
  minutes NUMERIC(12,2) NOT NULL CHECK (minutes > 0),
  source TEXT NOT NULL,
  content_id TEXT,
  round_table_id UUID,
  donation_id UUID,
  balance_after NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE coverage_minute_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON coverage_minute_transactions FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "System can insert transactions"
  ON coverage_minute_transactions FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── 3. COVERAGE MINUTE DONATIONS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coverage_minute_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  minutes NUMERIC(12,2) NOT NULL CHECK (minutes > 0),
  ledger_entry_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_member_id != to_member_id)
);

ALTER TABLE coverage_minute_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read donations they sent or received"
  ON coverage_minute_donations FOR SELECT
  USING (auth.uid() = from_member_id OR auth.uid() = to_member_id);

CREATE POLICY "Users can create donations from themselves"
  ON coverage_minute_donations FOR INSERT
  WITH CHECK (auth.uid() = from_member_id);

-- ── 4. DONATION RECORD VIEWS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS donation_record_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES coverage_minute_donations(id) ON DELETE CASCADE,
  fee_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  ledger_entry_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE donation_record_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own donation views"
  ON donation_record_views FOR SELECT
  USING (auth.uid() = viewer_member_id);

CREATE POLICY "Users can create donation views"
  ON donation_record_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_member_id);

-- ── 5. READING PROGRESS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL
    CHECK (content_type IN (
      'cephas_article', 'member_publication', 'external_newsletter',
      'external_newspaper', 'library_content', 'external_site', 'email'
    )),
  percent_complete NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  coverage_minutes_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  golden_keys_found INTEGER NOT NULL DEFAULT 0,
  plane_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, content_id)
);

ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reading progress"
  ON reading_progress FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can upsert own reading progress"
  ON reading_progress FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR UPDATE
  USING (auth.uid() = member_id);

-- ── 6. ROUND TABLES ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS round_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  topic_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'active', 'paused', 'concluded')),
  active_speaker_id UUID REFERENCES auth.users(id),
  active_speaker_started_at TIMESTAMPTZ,
  moderator_id UUID NOT NULL REFERENCES auth.users(id),
  participant_ids UUID[] NOT NULL DEFAULT '{}',
  max_participants INTEGER NOT NULL DEFAULT 12,
  coverage_consumed JSONB NOT NULL DEFAULT '{}',
  coverage_earned JSONB NOT NULL DEFAULT '{}',
  session_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ledger_session_id TEXT NOT NULL,
  UNIQUE(topic_id)
);

ALTER TABLE round_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read round tables"
  ON round_tables FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Moderators can create round tables"
  ON round_tables FOR INSERT
  WITH CHECK (auth.uid() = moderator_id);

CREATE POLICY "Moderators can update their round tables"
  ON round_tables FOR UPDATE
  USING (auth.uid() = moderator_id);

-- ── 7. ROUND TABLE SESSIONS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS round_table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES round_tables(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  total_participants INTEGER NOT NULL DEFAULT 0,
  total_minutes_spoken NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_minutes_listened NUMERIC(12,2) NOT NULL DEFAULT 0,
  speaker_history JSONB NOT NULL DEFAULT '[]',
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE round_table_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sessions"
  ON round_table_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert sessions"
  ON round_table_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── 8. MIC REQUESTS ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mic_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES round_tables(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'active', 'expired', 'cancelled')),
  estimated_duration INTEGER,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ
);

ALTER TABLE mic_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mic requests"
  ON mic_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own mic requests"
  ON mic_requests FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update own mic requests"
  ON mic_requests FOR UPDATE
  USING (auth.uid() = member_id);

-- ── 9. PHASE MIMICTRUNKS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS phase_mimictrunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  owner_type TEXT NOT NULL CHECK (owner_type IN ('member', 'guild', 'tribe')),
  owner_id UUID NOT NULL,
  parent_trunk_id UUID REFERENCES phase_mimictrunks(id),
  ledger_snapshot_id TEXT NOT NULL,
  ledger_snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_code_checksum TEXT NOT NULL DEFAULT '',
  dna_chain JSONB NOT NULL DEFAULT '{}',
  connection_status TEXT NOT NULL DEFAULT 'initializing'
    CHECK (connection_status IN ('active', 'suspended', 'validation_failed', 'initializing', 'offline')),
  last_validated_at TIMESTAMPTZ,
  validation_failure_count INTEGER NOT NULL DEFAULT 0,
  monthly_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  special_deck_card_id TEXT NOT NULL,
  golden_key_plane_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  suspended_at TIMESTAMPTZ
);

ALTER TABLE phase_mimictrunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read phase trunks"
  ON phase_mimictrunks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update their phase trunks"
  ON phase_mimictrunks FOR UPDATE
  USING (auth.uid()::TEXT = owner_id::TEXT AND owner_type = 'member');

CREATE POLICY "Members can create personal phase trunks"
  ON phase_mimictrunks FOR INSERT
  WITH CHECK (auth.uid()::TEXT = owner_id::TEXT AND owner_type = 'member');

-- ── 10. PHASE VALIDATION ATTEMPTS ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS phase_validation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trunk_id UUID NOT NULL REFERENCES phase_mimictrunks(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  results JSONB NOT NULL DEFAULT '[]',
  overall_result TEXT NOT NULL DEFAULT 'pending'
    CHECK (overall_result IN ('pass', 'fail', 'pending')),
  failed_components TEXT[] NOT NULL DEFAULT '{}',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE phase_validation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read validation attempts"
  ON phase_validation_attempts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── 11. PHASE ACCESS RECORDS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS phase_access_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trunk_id UUID NOT NULL REFERENCES phase_mimictrunks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  access_method TEXT NOT NULL
    CHECK (access_method IN ('deck_card', 'golden_key', 'guild_portal', 'tribe_portal')),
  special_deck_card_id TEXT,
  session_duration_minutes NUMERIC(12,2),
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE phase_access_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own access records"
  ON phase_access_records FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can insert own access records"
  ON phase_access_records FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── 12. PEDESTALS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pedestals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  curator_member_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'private'
    CHECK (status IN ('private', 'public', 'suspended', 'archived')),
  is_public BOOLEAN NOT NULL DEFAULT false,
  total_funding NUMERIC(12,2) NOT NULL DEFAULT 0,
  funder_count INTEGER NOT NULL DEFAULT 0,
  ledger_section_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  public_since TIMESTAMPTZ
);

ALTER TABLE pedestals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public pedestals visible to all authenticated users"
  ON pedestals FOR SELECT
  USING (auth.uid() IS NOT NULL AND (is_public = true OR auth.uid() = curator_member_id));

CREATE POLICY "Curators can create pedestals"
  ON pedestals FOR INSERT
  WITH CHECK (auth.uid() = curator_member_id);

CREATE POLICY "Curators can update own pedestals"
  ON pedestals FOR UPDATE
  USING (auth.uid() = curator_member_id);

-- ── 13. PEDESTAL CONTRIBUTIONS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pedestal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedestal_id UUID NOT NULL REFERENCES pedestals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  contribution_type TEXT NOT NULL DEFAULT 'initial'
    CHECK (contribution_type IN ('initial', 'additional', 'recurring')),
  member_total_after NUMERIC(12,2) NOT NULL,
  ledger_entry_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (member_total_after <= 5000)
);

ALTER TABLE pedestal_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own contributions"
  ON pedestal_contributions FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can create own contributions"
  ON pedestal_contributions FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── 14. SUBSCRIPTION FEEDS ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscription_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedestal_id UUID NOT NULL REFERENCES pedestals(id) ON DELETE CASCADE,
  source TEXT NOT NULL
    CHECK (source IN ('newsletter', 'newspaper', 'cephas_article_feed', 'member_publication_feed', 'external_rss')),
  source_name TEXT NOT NULL,
  source_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by_member_id UUID NOT NULL REFERENCES auth.users(id),
  content_count INTEGER NOT NULL DEFAULT 0,
  last_content_at TIMESTAMPTZ
);

ALTER TABLE subscription_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active feeds"
  ON subscription_feeds FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can add feeds"
  ON subscription_feeds FOR INSERT
  WITH CHECK (auth.uid() = added_by_member_id);

-- ── 15. PRIVATE PORTFOLIO SUBSCRIPTIONS ──────────────────────────────────

CREATE TABLE IF NOT EXISTS private_portfolio_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL
    CHECK (source IN ('newsletter', 'newspaper', 'cephas_article_feed', 'member_publication_feed', 'external_rss')),
  source_name TEXT NOT NULL,
  source_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  coverage_minutes_earned NUMERIC(12,2) NOT NULL DEFAULT 0
);

ALTER TABLE private_portfolio_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own private subscriptions"
  ON private_portfolio_subscriptions FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can manage own subscriptions"
  ON private_portfolio_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update own subscriptions"
  ON private_portfolio_subscriptions FOR UPDATE
  USING (auth.uid() = member_id);

-- ── 16. GUILDS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  motto TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'forming', 'suspended', 'dissolved')),
  leader_id UUID NOT NULL REFERENCES auth.users(id),
  officer_ids UUID[] NOT NULL DEFAULT '{}',
  member_ids UUID[] NOT NULL DEFAULT '{}',
  member_count INTEGER NOT NULL DEFAULT 0,
  tribe_ids UUID[] NOT NULL DEFAULT '{}',
  phase_mimictrunk_id UUID REFERENCES phase_mimictrunks(id),
  monthly_phase_fee NUMERIC(12,2) NOT NULL DEFAULT 100,
  keep_ids TEXT[] NOT NULL DEFAULT '{}',
  banner_image_url TEXT,
  rules_document TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ledger_section_id TEXT NOT NULL
);

ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read guilds"
  ON guilds FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Leaders can create guilds"
  ON guilds FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their guilds"
  ON guilds FOR UPDATE
  USING (auth.uid() = leader_id);

-- ── 17. TRIBES ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'forming', 'suspended', 'dissolved')),
  leader_id UUID NOT NULL REFERENCES auth.users(id),
  member_ids UUID[] NOT NULL DEFAULT '{}',
  member_count INTEGER NOT NULL DEFAULT 0,
  is_chapter BOOLEAN NOT NULL DEFAULT false,
  parent_tribe_id UUID REFERENCES tribes(id),
  child_tribe_ids UUID[] NOT NULL DEFAULT '{}',
  nesting_depth INTEGER NOT NULL DEFAULT 1 CHECK (nesting_depth <= 3),
  phase_mimictrunk_id UUID REFERENCES phase_mimictrunks(id),
  monthly_phase_fee NUMERIC(12,2),
  keep_ids TEXT[] NOT NULL DEFAULT '{}',
  rules_document TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ledger_section_id TEXT NOT NULL
);

ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tribes"
  ON tribes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Leaders can create tribes"
  ON tribes FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their tribes"
  ON tribes FOR UPDATE
  USING (auth.uid() = leader_id);

-- ── 18. GUILD MEMBERSHIPS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS guild_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'recruit'
    CHECK (role IN ('leader', 'officer', 'member', 'recruit')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_at TIMESTAMPTZ,
  tribe_id UUID REFERENCES tribes(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(guild_id, member_id)
);

ALTER TABLE guild_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read guild memberships"
  ON guild_memberships FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own memberships"
  ON guild_memberships FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update own memberships"
  ON guild_memberships FOR UPDATE
  USING (auth.uid() = member_id);

-- ── 19. TRIBE MEMBERSHIPS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tribe_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID NOT NULL REFERENCES tribes(id) ON DELETE CASCADE,
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('leader', 'officer', 'member', 'recruit')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(tribe_id, member_id)
);

ALTER TABLE tribe_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tribe memberships"
  ON tribe_memberships FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own memberships"
  ON tribe_memberships FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── 20. SOURCE DISTRIBUTION PACKAGES ────────────────────────────────────

CREATE TABLE IF NOT EXISTS source_distribution_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trunk_id UUID NOT NULL REFERENCES phase_mimictrunks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'generating'
    CHECK (status IN ('generating', 'ready', 'downloaded', 'expired', 'invalidated')),
  manifest JSONB NOT NULL DEFAULT '{}',
  dna_chain JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  downloaded_at TIMESTAMPTZ,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE source_distribution_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own packages"
  ON source_distribution_packages FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can create own packages"
  ON source_distribution_packages FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── 21. CONNECTION HANDSHAKES ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS connection_handshakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES source_distribution_packages(id) ON DELETE CASCADE,
  trunk_id UUID NOT NULL REFERENCES phase_mimictrunks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'initiate'
    CHECK (current_step IN (
      'initiate', 'ledger_comparison', 'source_validation',
      'rules_verification', 'policy_confirmation', 'governance_check', 'complete'
    )),
  result TEXT NOT NULL DEFAULT 'pending'
    CHECK (result IN (
      'success', 'failed_ledger', 'failed_source', 'failed_rules',
      'failed_policies', 'failed_governance', 'timeout', 'pending'
    )),
  step_results JSONB NOT NULL DEFAULT '[]',
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE connection_handshakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own handshakes"
  ON connection_handshakes FOR SELECT
  USING (auth.uid() = member_id);

-- ── 22. REAL WORLD PUZZLES ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS real_world_puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  creator_member_id UUID NOT NULL REFERENCES auth.users(id),
  location TEXT NOT NULL
    CHECK (location IN ('library', 'publication', 'email', 'external_site', 'cephas_article', 'lb_island')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'active', 'paused', 'expired', 'archived')),
  difficulty TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  golden_key_chain JSONB NOT NULL DEFAULT '[]',
  key_count INTEGER NOT NULL DEFAULT 0,
  coverage_minutes_reward NUMERIC(12,2) NOT NULL DEFAULT 3,
  island_placement JSONB,
  content_reference JSONB NOT NULL DEFAULT '{}',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  completion_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE real_world_puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active puzzles visible to authenticated users"
  ON real_world_puzzles FOR SELECT
  USING (auth.uid() IS NOT NULL AND (status = 'active' OR auth.uid() = creator_member_id));

CREATE POLICY "Members can create puzzles"
  ON real_world_puzzles FOR INSERT
  WITH CHECK (auth.uid() = creator_member_id);

CREATE POLICY "Creators can update own puzzles"
  ON real_world_puzzles FOR UPDATE
  USING (auth.uid() = creator_member_id);

-- ── 23. PUZZLE ATTEMPTS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS puzzle_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puzzle_id UUID NOT NULL REFERENCES real_world_puzzles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  keys_found TEXT[] NOT NULL DEFAULT '{}',
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  coverage_minutes_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE puzzle_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own puzzle attempts"
  ON puzzle_attempts FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can create own attempts"
  ON puzzle_attempts FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update own attempts"
  ON puzzle_attempts FOR UPDATE
  USING (auth.uid() = member_id);

-- ── 24. PLANE ENTRIES ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS plane_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plane_id TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  key_found BOOLEAN NOT NULL DEFAULT false,
  engagement_seconds INTEGER NOT NULL DEFAULT 0,
  can_reenter BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE plane_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own plane entries"
  ON plane_entries FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can create own plane entries"
  ON plane_entries FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update own plane entries"
  ON plane_entries FOR UPDATE
  USING (auth.uid() = member_id);

-- ── 25. GOVERNANCE EVENTS (Immutable Append-Only) ───────────────────────

CREATE TABLE IF NOT EXISTS governance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL
    CHECK (action IN (
      'guild_created', 'guild_dissolved', 'tribe_created', 'tribe_dissolved',
      'member_joined', 'member_left', 'member_promoted', 'member_demoted',
      'phase_assigned', 'phase_revoked', 'rules_updated', 'leader_changed'
    )),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('guild', 'tribe')),
  entity_id UUID NOT NULL,
  actor_member_id UUID NOT NULL REFERENCES auth.users(id),
  target_member_id UUID REFERENCES auth.users(id),
  details TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ledger_entry_id TEXT NOT NULL
);

ALTER TABLE governance_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read governance events"
  ON governance_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can insert governance events"
  ON governance_events FOR INSERT
  WITH CHECK (auth.uid() = actor_member_id);

-- ── 26. SPECIAL DECK CARD LINKS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS special_deck_card_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT NOT NULL,
  trunk_id UUID NOT NULL REFERENCES phase_mimictrunks(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  UNIQUE(card_id, member_id)
);

ALTER TABLE special_deck_card_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deck card links"
  ON special_deck_card_links FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can insert own deck card links"
  ON special_deck_card_links FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ── INDEXES ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_coverage_accounts_member ON coverage_minute_accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_coverage_transactions_member ON coverage_minute_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_coverage_transactions_type ON coverage_minute_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_donations_from ON coverage_minute_donations(from_member_id);
CREATE INDEX IF NOT EXISTS idx_donations_to ON coverage_minute_donations(to_member_id);
CREATE INDEX IF NOT EXISTS idx_donation_views_viewer ON donation_record_views(viewer_member_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_member ON reading_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_content ON reading_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_round_tables_topic ON round_tables(topic_id);
CREATE INDEX IF NOT EXISTS idx_round_tables_status ON round_tables(status);
CREATE INDEX IF NOT EXISTS idx_mic_requests_table ON mic_requests(table_id);
CREATE INDEX IF NOT EXISTS idx_mic_requests_status ON mic_requests(status);
CREATE INDEX IF NOT EXISTS idx_phase_trunks_owner ON phase_mimictrunks(owner_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_phase_trunks_status ON phase_mimictrunks(connection_status);
CREATE INDEX IF NOT EXISTS idx_phase_access_member ON phase_access_records(member_id);
CREATE INDEX IF NOT EXISTS idx_phase_access_trunk ON phase_access_records(trunk_id);
CREATE INDEX IF NOT EXISTS idx_pedestals_status ON pedestals(status);
CREATE INDEX IF NOT EXISTS idx_pedestal_contributions_pedestal ON pedestal_contributions(pedestal_id);
CREATE INDEX IF NOT EXISTS idx_pedestal_contributions_member ON pedestal_contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_guilds_leader ON guilds(leader_id);
CREATE INDEX IF NOT EXISTS idx_guilds_status ON guilds(status);
CREATE INDEX IF NOT EXISTS idx_tribes_guild ON tribes(guild_id);
CREATE INDEX IF NOT EXISTS idx_tribes_leader ON tribes(leader_id);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_guild ON guild_memberships(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_memberships_member ON guild_memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_tribe_memberships_tribe ON tribe_memberships(tribe_id);
CREATE INDEX IF NOT EXISTS idx_tribe_memberships_member ON tribe_memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_source_packages_member ON source_distribution_packages(member_id);
CREATE INDEX IF NOT EXISTS idx_source_packages_trunk ON source_distribution_packages(trunk_id);
CREATE INDEX IF NOT EXISTS idx_handshakes_trunk ON connection_handshakes(trunk_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_creator ON real_world_puzzles(creator_member_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_status ON real_world_puzzles(status);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_puzzle ON puzzle_attempts(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_member ON puzzle_attempts(member_id);
CREATE INDEX IF NOT EXISTS idx_plane_entries_plane ON plane_entries(plane_id);
CREATE INDEX IF NOT EXISTS idx_plane_entries_member ON plane_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_governance_events_entity ON governance_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_deck_card_links_trunk ON special_deck_card_links(trunk_id);
CREATE INDEX IF NOT EXISTS idx_deck_card_links_member ON special_deck_card_links(member_id);

-- ── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'coverage_minute_accounts', 'round_tables', 'phase_mimictrunks',
    'pedestals', 'guilds', 'tribes', 'reading_progress', 'real_world_puzzles'
  ]) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END $$;
