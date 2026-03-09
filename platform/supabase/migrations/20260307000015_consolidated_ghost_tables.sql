-- CONSOLIDATED GHOST TABLE MIGRATION
-- Auto-generated: Creates 100 tables from 33 migrations that were marked applied but never ran
-- All statements use CREATE TABLE IF NOT EXISTS for safety


-- ========== FROM: 20260210000005_ghost_world_half_life.sql ==========
-- ════════════════════════════════════════════════════════════════════════════
-- GHOST WORLD & HALF-LIFE LEADERBOARDS
-- ════════════════════════════════════════════════════════════════════════════
-- 
-- "Not in normal mode. You'd have to go Ghost."
-- "The crow remembers what the ghost forgets."
--
-- This migration creates the tables for:
-- 1. Crow Feathers (permanent achievements for Ghost World players)
-- 2. Ghost Leaderboards (time-bracketed speedrun records)
-- 3. Real World Leaderboards (service/trust metrics for members)
-- 4. Session Purchases (when users pay to keep their loot)
-- 5. Treasure Maps (member-created beacon routes)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════
-- CROW FEATHERS
-- Permanent achievements for Ghost World players
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS crow_feathers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  record_value DECIMAL(12,2) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure crow_feathers has ALL columns needed across Ghost World, Beacon, and Portfolio systems
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS time_bracket TEXT;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS session_duration_minutes INTEGER;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS superseded_by INTEGER;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS feather_number INTEGER;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS ghost_id UUID;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS beacon_run_id UUID;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS previous_holder_id UUID;
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS previous_record_value DECIMAL(12,2);
ALTER TABLE crow_feathers ADD COLUMN IF NOT EXISTS achieved_at TIMESTAMPTZ;

-- Index for fast user lookups (only after columns exist)
CREATE INDEX IF NOT EXISTS idx_crow_feathers_user ON crow_feathers(user_id);
CREATE INDEX IF NOT EXISTS idx_crow_feathers_category ON crow_feathers(category);

-- Add unique on feather_number if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crow_feathers_feather_number_key' AND conrelid = 'crow_feathers'::regclass
  ) THEN
    ALTER TABLE crow_feathers ADD CONSTRAINT crow_feathers_feather_number_key UNIQUE (feather_number);
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- GHOST LEADERBOARDS
-- Current records for each category/time bracket combination
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ghost_leaderboard (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  time_bracket TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  record_value DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  crow_feather_id INTEGER REFERENCES crow_feathers(id),
  UNIQUE(category, time_bracket)
);

CREATE INDEX IF NOT EXISTS idx_ghost_leaderboard_category ON ghost_leaderboard(category);

-- ════════════════════════════════════════════════════════════════════
-- REAL WORLD LEADERBOARDS (Members Only)
-- Service, trust, and reliability metrics
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS real_leaderboard (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'five_star_deliveries', 'on_time_rate', 'gratitude_marks',
    'consistency_streak', 'guild_rank', 'response_time',
    'collaboration_score'
  )),
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN (
    'lifetime', 'rolling_30', 'rolling_7', 'current'
  )),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  rank INTEGER,
  UNIQUE(category, user_id)
);

CREATE INDEX IF NOT EXISTS idx_real_leaderboard_category ON real_leaderboard(category, rank);

-- ════════════════════════════════════════════════════════════════════
-- SESSION PURCHASES
-- When users pay to keep their Ghost World loot
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS session_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_duration_minutes INTEGER NOT NULL,
  items_preserved JSONB NOT NULL DEFAULT '{}',
  price_paid DECIMAL(6,2) NOT NULL,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('save', 'end')),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_purchases_user ON session_purchases(user_id);

-- ════════════════════════════════════════════════════════════════════
-- GHOST SESSIONS
-- Track active and historical Ghost World sessions
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ghost_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  is_paused BOOLEAN DEFAULT FALSE,
  paused_at TIMESTAMPTZ,
  loot JSONB NOT NULL DEFAULT '{}',
  saved_loot JSONB,
  saved_at TIMESTAMPTZ,
  free_cue_card_id UUID,
  free_cue_card_selected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ghost_sessions_user ON ghost_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ghost_sessions_active ON ghost_sessions(user_id, ended_at) WHERE ended_at IS NULL;

-- ════════════════════════════════════════════════════════════════════
-- TREASURE MAPS
-- Member-created beacon routes for Ghost World speedruns
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treasure_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Route data
  beacons JSONB NOT NULL DEFAULT '[]',
  starting_location TEXT NOT NULL,
  ending_location TEXT NOT NULL,
  estimated_time_minutes INTEGER,
  
  -- Requirements
  required_candles INTEGER DEFAULT 0,
  required_equipment JSONB DEFAULT '[]',
  
  -- Economics
  ante_price DECIMAL(6,2) DEFAULT 0,
  creator_earnings DECIMAL(12,2) DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  
  -- Records
  best_time_seconds INTEGER,
  best_time_user_id UUID REFERENCES auth.users(id),
  best_time_at TIMESTAMPTZ,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure treasure_maps has ALL columns from every ghost migration definition
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS map_type TEXT;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS difficulty_level INTEGER;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS beacons JSONB;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS beacon_ids UUID[];
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS route_data JSONB;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS starting_location TEXT;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS ending_location TEXT;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS required_candles INTEGER DEFAULT 0;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS required_equipment JSONB;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS ante_price DECIMAL(6,2) DEFAULT 0;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS creator_earnings DECIMAL(12,2) DEFAULT 0;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS total_runs INTEGER DEFAULT 0;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS best_time_seconds INTEGER;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS best_time_user_id UUID;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS best_time_at TIMESTAMPTZ;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS price_marks INTEGER DEFAULT 0;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS is_for_sale BOOLEAN DEFAULT FALSE;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS times_sold INTEGER DEFAULT 0;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS rating_sum INTEGER DEFAULT 0;
ALTER TABLE treasure_maps ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_treasure_maps_creator ON treasure_maps(creator_id);
CREATE INDEX IF NOT EXISTS idx_treasure_maps_published ON treasure_maps(is_published, difficulty_level);

-- ════════════════════════════════════════════════════════════════════
-- TREASURE MAP RUNS
-- Records of players completing treasure maps
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS treasure_map_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES treasure_maps(id) NOT NULL,
  runner_id UUID REFERENCES auth.users(id) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completion_time_seconds INTEGER,
  ante_paid DECIMAL(6,2),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN (
    'in_progress', 'completed', 'abandoned', 'failed'
  )),
  beacons_reached JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_map_runs_map ON treasure_map_runs(map_id);
CREATE INDEX IF NOT EXISTS idx_map_runs_runner ON treasure_map_runs(runner_id);

-- ════════════════════════════════════════════════════════════════════
-- MEMBER EQUIPMENT / ARMORY
-- Equipment members can bring into Ghost World
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS member_armory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_data JSONB DEFAULT '{}',
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  acquired_from TEXT,  -- 'purchase', 'reward', 'trade', etc.
  is_tradeable BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_member_armory_user ON member_armory(user_id);

-- ════════════════════════════════════════════════════════════════════
-- JOIN THE FRAY - LEAGUE ENTRIES
-- Discord league competition entries
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS fray_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  map_id UUID REFERENCES treasure_maps(id),
  discord_channel_id TEXT,
  
  -- Schedule
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  
  -- Economics
  entry_ante DECIMAL(6,2) DEFAULT 0,
  prize_pool DECIMAL(12,2) DEFAULT 0,
  platform_cut_percent DECIMAL(4,2) DEFAULT 20,
  
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN (
    'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'
  )),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fray_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES fray_leagues(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  ante_paid DECIMAL(6,2),
  
  -- Results
  best_run_id UUID REFERENCES treasure_map_runs(id),
  best_time_seconds INTEGER,
  final_rank INTEGER,
  prize_earned DECIMAL(6,2),
  
  UNIQUE(league_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_fray_entries_league ON fray_entries(league_id);
CREATE INDEX IF NOT EXISTS idx_fray_entries_user ON fray_entries(user_id);

-- ════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════

-- Crow Feathers: Everyone can read, only system can write
ALTER TABLE crow_feathers ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_crow_feathers ON crow_feathers FOR SELECT USING (true);

-- Ghost Leaderboard: Public read
ALTER TABLE ghost_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_ghost_leaderboard ON ghost_leaderboard FOR SELECT USING (true);

-- Real Leaderboard: Public read
ALTER TABLE real_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_real_leaderboard ON real_leaderboard FOR SELECT USING (true);

-- Ghost Sessions: Users see their own
ALTER TABLE ghost_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_ghost_sessions ON ghost_sessions FOR ALL USING (auth.uid() = user_id);

-- Session Purchases: Users see their own
ALTER TABLE session_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_session_purchases ON session_purchases FOR ALL USING (auth.uid() = user_id);

-- Treasure Maps: Public read for published, creator can edit own
ALTER TABLE treasure_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_published_maps ON treasure_maps FOR SELECT USING (is_published = true OR auth.uid() = creator_id);
CREATE POLICY edit_own_maps ON treasure_maps FOR ALL USING (auth.uid() = creator_id);

-- Treasure Map Runs: Users see their own
ALTER TABLE treasure_map_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_map_runs ON treasure_map_runs FOR ALL USING (auth.uid() = runner_id);

-- Member Armory: Users see their own
ALTER TABLE member_armory ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_armory ON member_armory FOR ALL USING (auth.uid() = user_id);

-- Fray Leagues: Public read
ALTER TABLE fray_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_fray_leagues ON fray_leagues FOR SELECT USING (true);

-- Fray Entries: Public read for rankings, users manage their own
ALTER TABLE fray_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_fray_entries ON fray_entries FOR SELECT USING (true);
CREATE POLICY manage_own_fray_entries ON fray_entries FOR ALL USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ════════════════════════════════════════════════════════════════════

COMMENT ON TABLE crow_feathers IS 'Permanent Ghost World achievements - "The crow remembers what the ghost forgets"';
COMMENT ON TABLE ghost_leaderboard IS 'Current records for Ghost World speedrun categories';
COMMENT ON TABLE real_leaderboard IS 'Member service/trust leaderboards';
COMMENT ON TABLE ghost_sessions IS 'Active and historical Ghost World sessions';
COMMENT ON TABLE session_purchases IS 'When users pay to keep their Ghost World loot';
COMMENT ON TABLE treasure_maps IS 'Member-created beacon routes for speedruns';
COMMENT ON TABLE treasure_map_runs IS 'Individual attempts at completing treasure maps';
COMMENT ON TABLE member_armory IS 'Equipment members can bring into Ghost World';
COMMENT ON TABLE fray_leagues IS 'Join the Fray - organized Discord leagues';
COMMENT ON TABLE fray_entries IS 'User registrations for Fray leagues';

-- ========== FROM: 20260210000006_missing_platform_tables.sql ==========
-- ═══════════════════════════════════════════════════════════════════
-- MISSING PLATFORM TABLES — Feb 10, 2026
-- Creates all tables referenced in TypeScript code that don't yet
-- have CREATE TABLE statements in existing migrations.
-- ═══════════════════════════════════════════════════════════════════

-- ─── PROFILES (core, referenced everywhere) ───
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  location text,
  postal_code text,
  member_since timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── MEMBER MEDALLION COLLECTION ───
CREATE TABLE IF NOT EXISTS public.member_medallion_collection (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  medallion_id uuid,
  project_id uuid,
  medallion_type text NOT NULL DEFAULT 'member',
  chalk_level integer NOT NULL DEFAULT 1,
  earned_date timestamptz DEFAULT now(),
  display_order integer,
  is_featured boolean DEFAULT false,
  sponsor_attribution text,
  ip_ledger_entry_id uuid,
  blockchain_tx text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.member_medallion_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medallions_select_own" ON public.member_medallion_collection FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "medallions_insert_system" ON public.member_medallion_collection FOR INSERT WITH CHECK (true);

-- ─── GOVERNANCE: PROPOSALS, VOTES, STAR CHAMBER ───
CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  proposal_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  voting_starts_at timestamptz,
  voting_ends_at timestamptz,
  required_majority numeric DEFAULT 0.51,
  votes_for integer DEFAULT 0,
  votes_against integer DEFAULT 0,
  votes_abstain integer DEFAULT 0,
  result text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proposals_select_all" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "proposals_insert_auth" ON public.proposals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  vote text NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  weight numeric DEFAULT 1,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_all" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_own" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.votable_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.star_chamber_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  ai_reviewer_1 text,
  ai_reviewer_2 text,
  ai_score_1 numeric,
  ai_score_2 numeric,
  human_reviewer_id uuid REFERENCES auth.users(id),
  human_decision text,
  final_status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ─── CONTRACTS & ORDERS ───
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  contract_type text NOT NULL DEFAULT 'service',
  status text NOT NULL DEFAULT 'draft',
  creator_id uuid REFERENCES auth.users(id),
  counterparty_id uuid REFERENCES auth.users(id),
  project_id uuid,
  terms jsonb DEFAULT '{}',
  value_credits numeric DEFAULT 0,
  value_joules numeric DEFAULT 0,
  signed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts_select_parties" ON public.contracts FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = counterparty_id);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  project_id uuid,
  product_id uuid,
  order_type text NOT NULL DEFAULT 'purchase',
  status text NOT NULL DEFAULT 'pending',
  quantity integer DEFAULT 1,
  total_credits numeric DEFAULT 0,
  shipping_address jsonb,
  tracking_info jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── HEXISLE TABLES ───
CREATE TABLE IF NOT EXISTS public.hexisle_cities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  island_number integer NOT NULL,
  biome text DEFAULT 'temperate',
  difficulty integer DEFAULT 1,
  is_unlocked boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hexisle_player_state (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  current_city_id uuid REFERENCES public.hexisle_cities(id),
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  inventory jsonb DEFAULT '[]',
  unlocked_cities uuid[] DEFAULT '{}',
  achievements jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hexisle_quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id uuid REFERENCES public.hexisle_cities(id),
  title text NOT NULL,
  description text,
  quest_type text DEFAULT 'main',
  difficulty integer DEFAULT 1,
  reward_credits integer DEFAULT 0,
  reward_marks integer DEFAULT 0,
  reward_joules integer DEFAULT 0,
  prerequisites jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hexisle_player_quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  quest_id uuid REFERENCES public.hexisle_quests(id) NOT NULL,
  status text DEFAULT 'available',
  progress jsonb DEFAULT '{}',
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(user_id, quest_id)
);

CREATE TABLE IF NOT EXISTS public.hexisle_buildings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id uuid REFERENCES public.hexisle_cities(id),
  name text NOT NULL,
  building_type text NOT NULL,
  description text,
  level integer DEFAULT 1,
  capacity integer DEFAULT 10,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ─── LET'S MAKE DINNER (LMD) ───
CREATE TABLE IF NOT EXISTS public.lmd_chefs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  chef_name text NOT NULL,
  specialties text[],
  bio text,
  rating numeric DEFAULT 0,
  total_meals integer DEFAULT 0,
  is_active boolean DEFAULT true,
  postal_code text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lmd_meals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chef_id uuid REFERENCES public.lmd_chefs(id) NOT NULL,
  title text NOT NULL,
  description text,
  cuisine_type text,
  servings integer DEFAULT 4,
  price_credits numeric NOT NULL,
  dietary_tags text[],
  available_date date,
  available_time text,
  status text DEFAULT 'available',
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meal_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id uuid REFERENCES public.lmd_meals(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  servings_requested integer DEFAULT 1,
  status text DEFAULT 'pending',
  special_requests text,
  delivery_notes text,
  total_credits numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lmd_charity_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  balance_credits numeric DEFAULT 0,
  total_donated numeric DEFAULT 0,
  total_distributed numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── GOLDEN KEY / TREASURE SYSTEM ───
CREATE TABLE IF NOT EXISTS public.user_feathers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  feather_type text NOT NULL,
  count integer DEFAULT 0,
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.golden_key_multipliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key_type text NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1.0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treasure_winners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  treasure_type text NOT NULL,
  prize_description text,
  claimed boolean DEFAULT false,
  claimed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.key_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  key_code text NOT NULL,
  is_valid boolean DEFAULT false,
  response text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.golden_ticket_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  ticket_id uuid,
  attempt_code text,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─── SPONSOR SYSTEM ───
CREATE TABLE IF NOT EXISTS public.sponsor_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'seedling',
  total_sponsored numeric DEFAULT 0,
  total_memberships_funded integer DEFAULT 0,
  patent_selections uuid[],
  is_trailblazer boolean DEFAULT false,
  badge_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sponsor_commitments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  amount numeric NOT NULL,
  tier text NOT NULL,
  payment_intent_id text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sponsored_recipients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  recipient_user_id uuid REFERENCES auth.users(id),
  recipient_email text,
  membership_activated boolean DEFAULT false,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bracket_standings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  bracket_name text NOT NULL,
  position integer DEFAULT 0,
  score numeric DEFAULT 0,
  period text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.johnny_appleseed_offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id uuid REFERENCES public.sponsor_profiles(id) NOT NULL,
  offer_type text NOT NULL,
  quantity integer DEFAULT 1,
  remaining integer DEFAULT 1,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ─── HELP WANTED / SERVICES ───
CREATE TABLE IF NOT EXISTS public.help_wanted_listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  budget_credits numeric,
  budget_marks numeric,
  location text,
  postal_code text,
  status text DEFAULT 'open',
  applications_count integer DEFAULT 0,
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.help_wanted_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "help_wanted_select_all" ON public.help_wanted_listings FOR SELECT USING (true);
CREATE POLICY "help_wanted_insert_auth" ON public.help_wanted_listings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── REFERRALS ───
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) NOT NULL,
  referred_email text NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  reward_credits numeric DEFAULT 0,
  reward_marks numeric DEFAULT 0,
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) NOT NULL,
  referred_id uuid REFERENCES auth.users(id),
  referral_code text NOT NULL UNIQUE,
  status text DEFAULT 'pending',
  reward_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─── PROJECT EXTENSIONS ───
CREATE TABLE IF NOT EXISTS public.project_backings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount_credits numeric NOT NULL,
  joules_earned numeric DEFAULT 0,
  backing_stage text DEFAULT 'established',
  multiplier_used numeric DEFAULT 1,
  backed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_lifecycle_stages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  stage text NOT NULL,
  entered_at timestamptz DEFAULT now(),
  exited_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS public.project_funding (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  funder_id uuid REFERENCES auth.users(id),
  amount numeric NOT NULL,
  funding_type text DEFAULT 'credit',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id),
  role text DEFAULT 'member',
  status text DEFAULT 'pending',
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  section_type text DEFAULT 'text',
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_section_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id uuid REFERENCES public.project_sections(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_subdomains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  subdomain text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  custom_domain text,
  ssl_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ─── SOCIAL / HERALD ───
CREATE TABLE IF NOT EXISTS public.member_social_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  platform text NOT NULL,
  platform_user_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  username text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS public.member_scheduled_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  social_account_id uuid REFERENCES public.member_social_accounts(id),
  content text NOT NULL,
  media_urls text[],
  scheduled_for timestamptz NOT NULL,
  posted_at timestamptz,
  status text DEFAULT 'scheduled',
  platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ─── POSITION APPLICATIONS ───
CREATE TABLE IF NOT EXISTS public.position_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id uuid NOT NULL,
  applicant_id uuid REFERENCES auth.users(id) NOT NULL,
  cover_letter text,
  resume_url text,
  status text DEFAULT 'submitted',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ─── CHALLENGE SUBMISSIONS ───
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  challenge_id uuid,
  submission_type text NOT NULL,
  content text,
  file_url text,
  score numeric,
  status text DEFAULT 'submitted',
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── DEFENSE KLAUS / LIFELINE ───
CREATE TABLE IF NOT EXISTS public.legal_defense_fund (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'General Defense Fund',
  balance numeric DEFAULT 0,
  total_contributed numeric DEFAULT 0,
  total_disbursed numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.defense_claws_preorders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  quantity integer DEFAULT 1,
  recipient_name text,
  recipient_relationship text,
  shipping_address jsonb,
  payment_status text DEFAULT 'pending',
  payment_intent_id text,
  total_amount numeric NOT NULL DEFAULT 6.00,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lifeline_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  medication_name text NOT NULL,
  dosage text,
  prescriber text,
  pharmacy_preference text,
  urgency text DEFAULT 'standard',
  status text DEFAULT 'submitted',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ─── GHOST WORLD ───
CREATE TABLE IF NOT EXISTS public.ghost_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  ghost_name text,
  pages_visited text[] DEFAULT '{}',
  golden_keys_found text[] DEFAULT '{}',
  duration_seconds integer DEFAULT 0,
  converted_to_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- ─── PORTAL ACCESS ───
CREATE TABLE IF NOT EXISTS public.xml_access_credentials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  api_key text NOT NULL UNIQUE,
  portal text NOT NULL,
  permissions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── INNOVATION LOG (for Fly on the Wall) ───
CREATE TABLE IF NOT EXISTS public.innovation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  innovation_number integer NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  patent_bag text,
  status text DEFAULT 'documented',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.current_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key text NOT NULL UNIQUE,
  metric_value numeric NOT NULL,
  metric_label text,
  updated_at timestamptz DEFAULT now()
);

-- ─── VIEWS ───
DROP VIEW IF EXISTS public.v_current_transparency_metrics;
CREATE OR REPLACE VIEW public.v_current_transparency_metrics AS
SELECT
  (SELECT COUNT(*) FROM public.innovation_log) AS total_innovations,
  (SELECT COUNT(*) FROM public.proposals WHERE status = 'active') AS active_proposals,
  (SELECT COUNT(*) FROM public.profiles WHERE is_active = true) AS active_members,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'completed') AS completed_orders,
  (SELECT COALESCE(SUM(total_credits), 0) FROM public.orders WHERE status = 'completed') AS total_transaction_volume,
  now() AS snapshot_at;

DROP VIEW IF EXISTS public.initiative_stats;
CREATE OR REPLACE VIEW public.initiative_stats AS
SELECT
  i.id,
  i.name,
  i.initiative_slug AS slug,
  i.description,
  (SELECT COUNT(*) FROM public.profiles) AS member_count,
  0 AS order_count
FROM public.initiatives i;

-- ========== FROM: 20260210000007_seventy_times_seven.sql ==========
-- ============================================================================
-- 70 TIMES 7 — Fresh Start System
-- ============================================================================
-- Allows members to reset their reputation counters while keeping their
-- portfolio (owned items, collected cards, IP stakes, physical purchases).
--
-- Philosophy: People who constantly "start fresh" reveal their character
-- over time. A real reputation takes years to build. This system gives
-- everyone infinite chances while making persistence valuable.
--
-- Cost: 1 Mark per reset (makes resets non-trivial but affordable)
-- Limit: 490 total resets (70 × 7 = Biblical forgiveness)
-- ============================================================================

-- Fresh Start Log — Tracks every reset
CREATE TABLE IF NOT EXISTS fresh_start_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reset_number INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  marks_spent INTEGER NOT NULL DEFAULT 1,
  
  -- Snapshot of what was reset (for transparency)
  previous_reputation_score NUMERIC,
  previous_guild_level INTEGER,
  previous_discovery_count INTEGER,
  previous_completed_bounties INTEGER,
  
  -- What they kept
  kept_portfolio_value NUMERIC,
  kept_collected_cards INTEGER,
  kept_ip_stakes INTEGER,
  
  CONSTRAINT max_resets CHECK (reset_number <= 490)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_fresh_start_user ON fresh_start_log(user_id);

-- Add columns to profiles to track fresh start state
-- NOTE: account_age_days cannot be a GENERATED column because now() is not immutable.
-- It will be computed in application code or views instead.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fresh_start_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_fresh_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS credits_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS joules_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS guild_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'inactive';

-- Enable RLS
ALTER TABLE fresh_start_log ENABLE ROW LEVEL SECURITY;

-- Users can see their own history
CREATE POLICY "Users can view own fresh start history"
  ON fresh_start_log FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert (trigger the reset)
CREATE POLICY "Users can trigger fresh start"
  ON fresh_start_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Fresh Start Function — The actual reset logic
-- ============================================================================
CREATE OR REPLACE FUNCTION perform_fresh_start(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count INTEGER;
  v_marks_balance INTEGER;
  v_result JSON;
  v_previous_rep NUMERIC;
  v_previous_guild INTEGER;
  v_previous_discoveries INTEGER;
  v_previous_bounties INTEGER;
  v_portfolio_value NUMERIC;
  v_cards_count INTEGER;
  v_ip_count INTEGER;
BEGIN
  -- Get current fresh start count
  SELECT COALESCE(fresh_start_count, 0), COALESCE(marks_balance, 0)
  INTO v_current_count, v_marks_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Check limits
  IF v_current_count >= 490 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Maximum resets reached (70 × 7 = 490). Your journey is complete.'
    );
  END IF;

  -- Check if user has at least 1 Mark
  IF v_marks_balance < 1 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Fresh start costs 1 Mark. Earn Marks through platform activity.'
    );
  END IF;

  -- Capture current state for the log
  SELECT 
    COALESCE(reputation_score, 0),
    COALESCE(guild_level, 1),
    (SELECT COUNT(*) FROM user_discovered_cards WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM bounty_claims WHERE user_id = p_user_id AND status = 'completed')
  INTO v_previous_rep, v_previous_guild, v_previous_discoveries, v_previous_bounties
  FROM profiles WHERE id = p_user_id;

  -- Capture what they keep
  SELECT COALESCE(SUM(current_value), 0) INTO v_portfolio_value
  FROM user_portfolio WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_cards_count
  FROM user_collected_cards WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_ip_count
  FROM sponsor_pool_shares WHERE user_id = p_user_id;

  -- Log the fresh start
  INSERT INTO fresh_start_log (
    user_id,
    reset_number,
    marks_spent,
    previous_reputation_score,
    previous_guild_level,
    previous_discovery_count,
    previous_completed_bounties,
    kept_portfolio_value,
    kept_collected_cards,
    kept_ip_stakes
  ) VALUES (
    p_user_id,
    v_current_count + 1,
    1,
    v_previous_rep,
    v_previous_guild,
    v_previous_discoveries,
    v_previous_bounties,
    v_portfolio_value,
    v_cards_count,
    v_ip_count
  );

  -- RESET: Zero out counters (but NOT portfolio)
  UPDATE profiles SET
    marks_balance = marks_balance - 1,  -- Pay the cost
    fresh_start_count = COALESCE(fresh_start_count, 0) + 1,
    last_fresh_start = now(),
    -- Reset these counters
    reputation_score = 0,
    guild_level = 1,
    total_earned = 0,
    referral_count = 0,
    completed_bounties = 0,
    active_streak_days = 0
    -- NOTE: We do NOT reset: credits_balance, joules_balance, medallions_earned
    -- Those represent actual value/collateral
  WHERE id = p_user_id;

  -- Clear discovery progress (cards stay collected, but "new user" experience)
  DELETE FROM user_discovered_cards WHERE user_id = p_user_id;

  -- Build result
  v_result := json_build_object(
    'success', true,
    'reset_number', v_current_count + 1,
    'remaining_resets', 490 - (v_current_count + 1),
    'kept', json_build_object(
      'portfolio_value', v_portfolio_value,
      'collected_cards', v_cards_count,
      'ip_stakes', v_ip_count,
      'credits_balance', (SELECT credits_balance FROM profiles WHERE id = p_user_id),
      'joules_balance', (SELECT joules_balance FROM profiles WHERE id = p_user_id)
    ),
    'message', format('Fresh start #%s complete. You have %s resets remaining. Your portfolio (%s items) remains intact.',
      v_current_count + 1,
      490 - (v_current_count + 1),
      v_cards_count + v_ip_count
    )
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- View: Member Tenure and Reputation Stability
-- ============================================================================
-- This reveals the value of a stable reputation over time
DROP VIEW IF EXISTS member_reputation_stability;
CREATE OR REPLACE VIEW member_reputation_stability AS
SELECT
  p.id,
  p.full_name AS display_name,
  p.created_at AS member_since,
  EXTRACT(DAY FROM (now() - p.created_at))::INTEGER AS account_age_days,
  COALESCE(p.fresh_start_count, 0) AS total_resets,
  CASE
    WHEN EXTRACT(DAY FROM (now() - p.created_at)) > 365 AND COALESCE(p.fresh_start_count, 0) = 0 THEN 'Bedrock'
    WHEN EXTRACT(DAY FROM (now() - p.created_at)) > 365 AND COALESCE(p.fresh_start_count, 0) <= 3 THEN 'Established'
    WHEN EXTRACT(DAY FROM (now() - p.created_at)) > 180 THEN 'Growing'
    WHEN COALESCE(p.fresh_start_count, 0) > 10 THEN 'Wanderer'
    ELSE 'Newcomer'
  END AS reputation_tier,
  -- Stability score: account age / (resets + 1) - higher = more stable
  ROUND(EXTRACT(DAY FROM (now() - p.created_at))::numeric / (COALESCE(p.fresh_start_count, 0) + 1), 2) AS stability_score
FROM profiles p;

COMMENT ON VIEW member_reputation_stability IS 
'Shows the value of consistent reputation vs frequent resets. High stability_score = trustworthy long-term member.';

-- Grant access
GRANT SELECT ON member_reputation_stability TO authenticated;

-- ========== FROM: 20260213000001_fix_innovation_log_column.sql ==========
-- ============================================================================
-- FIX: Add ALL missing columns to innovation_log
-- Run this BEFORE the complete innovation registry migration
-- ============================================================================

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN description text;
    RAISE NOTICE 'Added description column';
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN category text;
    RAISE NOTICE 'Added category column';
  END IF;
END $$;

-- Add patent_bag column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'patent_bag'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN patent_bag text;
    RAISE NOTICE 'Added patent_bag column';
  END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'innovation_log' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.innovation_log ADD COLUMN status text DEFAULT 'documented';
    RAISE NOTICE 'Added status column';
  END IF;
END $$;

-- ============================================================================
-- FIX: Ensure current_metrics table exists with proper structure
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.current_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key text NOT NULL UNIQUE,
  metric_value numeric NOT NULL,
  metric_label text,
  updated_at timestamptz DEFAULT now()
);

-- Verify innovation_log columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'innovation_log'
ORDER BY ordinal_position;

-- Verify current_metrics exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'current_metrics'
ORDER BY ordinal_position;

-- ========== FROM: 20260214165116_gift_lists.sql ==========
-- ============================================================================
-- FAMILY TABLE EXPANSION: Gift Lists with Secret Sharing
-- ============================================================================
-- Creates tables for gift wishlists where:
-- - Owners can see their list items but NOT who claimed them
-- - Family members can claim items (hidden from owner)
-- - Supports Notion sync for importing existing lists
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY GIFT LISTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_gift_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    occasion TEXT CHECK (occasion IN ('birthday', 'holiday', 'anniversary', 'general', 'other')),
    occasion_date DATE, -- When gifts are needed by
    visibility TEXT DEFAULT 'family' CHECK (visibility IN ('family', 'specific_members')),
    notion_sync_url TEXT, -- Optional Notion database URL for sync
    notion_database_id TEXT, -- Notion database ID for API calls
    last_synced_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_lists_family ON family_gift_lists(family_id);
CREATE INDEX IF NOT EXISTS idx_gift_lists_owner ON family_gift_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_gift_lists_occasion_date ON family_gift_lists(occasion_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT LIST ITEMS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES family_gift_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT, -- Product link
    image_url TEXT, -- Product image
    price_estimate DECIMAL(10,2),
    price_currency TEXT DEFAULT 'USD',
    priority INT DEFAULT 2 CHECK (priority BETWEEN 1 AND 3), -- 1=high, 2=medium, 3=low
    quantity_wanted INT DEFAULT 1,
    quantity_claimed INT DEFAULT 0,
    claimed_by UUID REFERENCES family_members(id) ON DELETE SET NULL, -- HIDDEN FROM OWNER!
    claimed_at TIMESTAMPTZ,
    purchased BOOLEAN DEFAULT false,
    purchased_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    purchased_at TIMESTAMPTZ,
    notion_block_id TEXT, -- For Notion sync
    notes TEXT, -- Private notes from claimer (hidden from owner)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_items_list ON gift_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_gift_items_claimed ON gift_list_items(claimed_by);
CREATE INDEX IF NOT EXISTS idx_gift_items_purchased ON gift_list_items(purchased);

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT LIST ACCESS TABLE (Who Can See Which Lists)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_list_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES family_gift_lists(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT true,
    can_claim BOOLEAN DEFAULT true,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    UNIQUE(list_id, member_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gift_access_list ON gift_list_access(list_id);
CREATE INDEX IF NOT EXISTS idx_gift_access_member ON gift_list_access(member_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT CLAIM HISTORY (For Tracking Claim/Unclaim Actions)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_claim_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL REFERENCES gift_list_items(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('claim', 'unclaim', 'purchase')),
    action_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_gift_claim_history_item ON gift_claim_history(item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE family_gift_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_list_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_claim_history ENABLE ROW LEVEL SECURITY;

-- GIFT LISTS: Family members can view lists in their family
CREATE POLICY "Members can view family gift lists"
    ON family_gift_lists FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- GIFT LISTS: Members can create lists
CREATE POLICY "Members can create gift lists"
    ON family_gift_lists FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- GIFT LISTS: Owners can update their lists
CREATE POLICY "Owners can update their lists"
    ON family_gift_lists FOR UPDATE
    USING (
        owner_id IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );

-- GIFT LISTS: Owners can delete their lists
CREATE POLICY "Owners can delete their lists"
    ON family_gift_lists FOR DELETE
    USING (
        owner_id IN (
            SELECT id FROM family_members 
            WHERE user_id = auth.uid()
        )
    );

-- GIFT LIST ITEMS: Complex policy - owners see items WITHOUT claimed_by
-- We handle this via a view instead (see below)
CREATE POLICY "Members can view gift list items"
    ON gift_list_items FOR SELECT
    USING (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- GIFT LIST ITEMS: Owners can insert items to their lists
CREATE POLICY "Owners can insert items"
    ON gift_list_items FOR INSERT
    WITH CHECK (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.owner_id = fm.id
            WHERE fm.user_id = auth.uid()
        )
    );

-- GIFT LIST ITEMS: Owners can update their items (except claimed_by)
-- Members can update claimed_by on items they're claiming
CREATE POLICY "Members can update items"
    ON gift_list_items FOR UPDATE
    USING (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- GIFT LIST ACCESS: Members can view access settings
CREATE POLICY "Members can view access"
    ON gift_list_access FOR SELECT
    USING (
        list_id IN (
            SELECT gl.id FROM family_gift_lists gl
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- GIFT CLAIM HISTORY: Members can view history for items they can see
CREATE POLICY "Members can view claim history"
    ON gift_claim_history FOR SELECT
    USING (
        item_id IN (
            SELECT gi.id FROM gift_list_items gi
            JOIN family_gift_lists gl ON gi.list_id = gl.id
            JOIN family_members fm ON gl.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
            -- Exclude history for items on lists the user owns
            AND gl.owner_id NOT IN (
                SELECT id FROM family_members WHERE user_id = auth.uid()
            )
        )
    );

-- GIFT CLAIM HISTORY: Members can insert their own history
CREATE POLICY "Members can insert claim history"
    ON gift_claim_history FOR INSERT
    WITH CHECK (
        member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Gift Items for Owner (Hides claimed_by)
-- ─────────────────────────────────────────────────────────────────────────────
-- This view is used when the list owner views their own items.
-- They can see all item details EXCEPT who claimed them.
-- ─────────────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS gift_list_items_for_owner;
CREATE OR REPLACE VIEW gift_list_items_for_owner AS
SELECT 
    gi.id,
    gi.list_id,
    gi.name,
    gi.description,
    gi.url,
    gi.image_url,
    gi.price_estimate,
    gi.price_currency,
    gi.priority,
    gi.quantity_wanted,
    gi.quantity_claimed,
    -- Show that it's claimed, but NOT by whom
    CASE WHEN gi.claimed_by IS NOT NULL THEN true ELSE false END AS is_claimed,
    CASE WHEN gi.purchased THEN true ELSE false END AS is_purchased,
    gi.notion_block_id,
    gi.created_at,
    gi.updated_at
FROM gift_list_items gi
JOIN family_gift_lists gl ON gi.list_id = gl.id
JOIN family_members fm ON gl.owner_id = fm.id
WHERE fm.user_id = auth.uid();

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW: Gift Items for Family (Shows claimed_by for non-owners)
-- ─────────────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS gift_list_items_for_family;
CREATE OR REPLACE VIEW gift_list_items_for_family AS
SELECT 
    gi.*,
    fm_claimer.nickname AS claimed_by_name,
    fm_claimer.symbol AS claimed_by_symbol
FROM gift_list_items gi
JOIN family_gift_lists gl ON gi.list_id = gl.id
JOIN family_members fm ON gl.family_id = fm.family_id
LEFT JOIN family_members fm_claimer ON gi.claimed_by = fm_claimer.id
WHERE fm.user_id = auth.uid() 
  AND fm.is_active = true
  -- Only show full details if user is NOT the owner
  AND gl.owner_id NOT IN (
      SELECT id FROM family_members WHERE user_id = auth.uid()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to claim a gift item
CREATE OR REPLACE FUNCTION claim_gift_item(
    p_item_id UUID,
    p_member_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
    v_list RECORD;
    v_is_owner BOOLEAN;
BEGIN
    -- Get the item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Check if already claimed
    IF v_item.claimed_by IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item already claimed');
    END IF;
    
    -- Get the list
    SELECT * INTO v_list FROM family_gift_lists WHERE id = v_item.list_id;
    
    -- Check if claimer is the owner (can't claim your own items!)
    SELECT EXISTS(
        SELECT 1 FROM family_members fm
        WHERE fm.id = p_member_id 
        AND fm.id = v_list.owner_id
    ) INTO v_is_owner;
    
    IF v_is_owner THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot claim your own items');
    END IF;
    
    -- Claim the item
    UPDATE gift_list_items
    SET claimed_by = p_member_id,
        claimed_at = NOW(),
        quantity_claimed = quantity_claimed + 1,
        updated_at = NOW()
    WHERE id = p_item_id;
    
    -- Record in history
    INSERT INTO gift_claim_history (item_id, member_id, action)
    VALUES (p_item_id, p_member_id, 'claim');
    
    RETURN jsonb_build_object('success', true, 'message', 'Item claimed successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unclaim a gift item
CREATE OR REPLACE FUNCTION unclaim_gift_item(
    p_item_id UUID,
    p_member_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Get the item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Check if this member claimed it
    IF v_item.claimed_by != p_member_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You did not claim this item');
    END IF;
    
    -- Unclaim the item
    UPDATE gift_list_items
    SET claimed_by = NULL,
        claimed_at = NULL,
        quantity_claimed = GREATEST(0, quantity_claimed - 1),
        updated_at = NOW()
    WHERE id = p_item_id;
    
    -- Record in history
    INSERT INTO gift_claim_history (item_id, member_id, action)
    VALUES (p_item_id, p_member_id, 'unclaim');
    
    RETURN jsonb_build_object('success', true, 'message', 'Item unclaimed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark item as purchased
CREATE OR REPLACE FUNCTION mark_gift_purchased(
    p_item_id UUID,
    p_member_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- Get the item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_item_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item not found');
    END IF;
    
    -- Check if this member claimed it
    IF v_item.claimed_by != p_member_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You must claim an item before marking it purchased');
    END IF;
    
    -- Mark as purchased
    UPDATE gift_list_items
    SET purchased = true,
        purchased_by = p_member_id,
        purchased_at = NOW(),
        updated_at = NOW()
    WHERE id = p_item_id;
    
    -- Record in history
    INSERT INTO gift_claim_history (item_id, member_id, action)
    VALUES (p_item_id, p_member_id, 'purchase');
    
    RETURN jsonb_build_object('success', true, 'message', 'Item marked as purchased');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_gift_lists_updated_at ON family_gift_lists;
CREATE TRIGGER trigger_gift_lists_updated_at
    BEFORE UPDATE ON family_gift_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gift_items_updated_at ON gift_list_items;
CREATE TRIGGER trigger_gift_items_updated_at
    BEFORE UPDATE ON gift_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========== FROM: 20260214165117_family_calendars.sql ==========
-- ============================================================================
-- FAMILY TABLE EXPANSION: Family Calendars
-- ============================================================================
-- Creates tables for shared family calendars with:
-- - Multiple calendars per family (main, sports, medical, etc.)
-- - Google Calendar sync support
-- - Auto-generated events from meal plans, shopping, gifts
-- - Recurring event support (RRULE format)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY CALENDARS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_calendars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6', -- Hex color for display
    is_default BOOLEAN DEFAULT false, -- Main family calendar
    
    -- Google Calendar Integration
    google_calendar_id TEXT, -- Google Calendar ID for sync
    google_account_email TEXT, -- Which Google account owns this
    sync_enabled BOOLEAN DEFAULT false,
    sync_direction TEXT DEFAULT 'both' CHECK (sync_direction IN ('pull', 'push', 'both')),
    last_sync_at TIMESTAMPTZ,
    sync_token TEXT, -- For incremental sync
    
    -- Settings
    default_reminder_minutes INT DEFAULT 30,
    timezone TEXT DEFAULT 'America/Chicago',
    
    created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_calendars_family ON family_calendars(family_id);
CREATE INDEX IF NOT EXISTS idx_family_calendars_google ON family_calendars(google_calendar_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY EVENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    calendar_id UUID NOT NULL REFERENCES family_calendars(id) ON DELETE CASCADE,
    
    -- Event Details
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    event_type TEXT DEFAULT 'custom' CHECK (event_type IN (
        'birthday', 'holiday', 'anniversary',
        'appointment', 'medical', 
        'meal', 'shopping',
        'sports', 'school', 'work',
        'reminder', 'custom'
    )),
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT false,
    timezone TEXT,
    
    -- Recurrence (RRULE format: "FREQ=WEEKLY;BYDAY=MO,WE,FR")
    recurrence_rule TEXT,
    recurrence_end DATE,
    is_recurring BOOLEAN DEFAULT false,
    parent_event_id UUID REFERENCES family_events(id) ON DELETE CASCADE, -- For recurrence exceptions
    
    -- Attendees (family members)
    attendees UUID[] DEFAULT '{}', -- Array of family_member IDs
    
    -- Integration Links
    google_event_id TEXT, -- For Google Calendar sync
    source TEXT DEFAULT 'manual' CHECK (source IN (
        'manual', 'google', 'meal_plan', 'shopping', 'gift_occasion', 'recurring'
    )),
    source_id UUID, -- Link to meal_plan, shopping_order, gift_list, etc.
    
    -- Reminders
    reminder_minutes INT[], -- Array of reminder times (e.g., [30, 60, 1440])
    
    -- Metadata
    color TEXT, -- Override calendar color
    is_private BOOLEAN DEFAULT false, -- Only show to attendees
    created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_family_events_calendar ON family_events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_family_events_start ON family_events(start_time);
CREATE INDEX IF NOT EXISTS idx_family_events_type ON family_events(event_type);
CREATE INDEX IF NOT EXISTS idx_family_events_google ON family_events(google_event_id);
CREATE INDEX IF NOT EXISTS idx_family_events_source ON family_events(source, source_id);
CREATE INDEX IF NOT EXISTS idx_family_events_recurring ON family_events(is_recurring) WHERE is_recurring = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- GOOGLE CALENDAR OAUTH TOKENS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMPTZ NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['https://www.googleapis.com/auth/calendar'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, family_id, google_email)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_google_tokens_user ON google_calendar_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_tokens_family ON google_calendar_tokens(family_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENT RSVPS (For Attendee Responses)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_event_rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES family_events(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
    responded_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(event_id, member_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON family_event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_member ON family_event_rsvps(member_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE family_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_event_rsvps ENABLE ROW LEVEL SECURITY;

-- CALENDARS: Family members can view calendars
CREATE POLICY "Members can view family calendars"
    ON family_calendars FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- CALENDARS: Members can create calendars
CREATE POLICY "Members can create calendars"
    ON family_calendars FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- CALENDARS: Creators can update their calendars
CREATE POLICY "Creators can update calendars"
    ON family_calendars FOR UPDATE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
        OR family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND role = 'founder'
        )
    );

-- EVENTS: Family members can view events
CREATE POLICY "Members can view family events"
    ON family_events FOR SELECT
    USING (
        calendar_id IN (
            SELECT fc.id FROM family_calendars fc
            JOIN family_members fm ON fc.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
        AND (
            -- Public events or user is attendee
            is_private = false 
            OR created_by IN (SELECT id FROM family_members WHERE user_id = auth.uid())
            OR (SELECT id FROM family_members WHERE user_id = auth.uid()) = ANY(attendees)
        )
    );

-- EVENTS: Members can create events
CREATE POLICY "Members can create events"
    ON family_events FOR INSERT
    WITH CHECK (
        calendar_id IN (
            SELECT fc.id FROM family_calendars fc
            JOIN family_members fm ON fc.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- EVENTS: Creators can update their events
CREATE POLICY "Creators can update events"
    ON family_events FOR UPDATE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- EVENTS: Creators can delete their events
CREATE POLICY "Creators can delete events"
    ON family_events FOR DELETE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- GOOGLE TOKENS: Users can only see their own tokens
CREATE POLICY "Users can view their own tokens"
    ON google_calendar_tokens FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own tokens"
    ON google_calendar_tokens FOR ALL
    USING (user_id = auth.uid());

-- EVENT RSVPS: Members can view RSVPs
CREATE POLICY "Members can view RSVPs"
    ON family_event_rsvps FOR SELECT
    USING (
        event_id IN (
            SELECT fe.id FROM family_events fe
            JOIN family_calendars fc ON fe.calendar_id = fc.id
            JOIN family_members fm ON fc.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- EVENT RSVPS: Members can manage their own RSVPs
CREATE POLICY "Members can manage their RSVPs"
    ON family_event_rsvps FOR ALL
    USING (
        member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Function to create events from meal plans
CREATE OR REPLACE FUNCTION create_meal_plan_events(
    p_family_id UUID,
    p_meal_plan_id UUID,
    p_meal_date DATE,
    p_meal_slot TEXT, -- 'breakfast', 'lunch', 'dinner'
    p_meal_title TEXT
)
RETURNS UUID AS $$
DECLARE
    v_calendar_id UUID;
    v_event_id UUID;
    v_start_time TIMESTAMPTZ;
BEGIN
    -- Get default family calendar
    SELECT id INTO v_calendar_id
    FROM family_calendars
    WHERE family_id = p_family_id AND is_default = true
    LIMIT 1;
    
    -- If no default, get first calendar
    IF v_calendar_id IS NULL THEN
        SELECT id INTO v_calendar_id
        FROM family_calendars
        WHERE family_id = p_family_id
        LIMIT 1;
    END IF;
    
    -- If still no calendar, can't create event
    IF v_calendar_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Determine start time based on slot
    v_start_time := p_meal_date::timestamp + CASE p_meal_slot
        WHEN 'breakfast' THEN INTERVAL '8 hours'
        WHEN 'lunch' THEN INTERVAL '12 hours'
        WHEN 'dinner' THEN INTERVAL '18 hours'
        ELSE INTERVAL '12 hours'
    END;
    
    -- Create the event
    INSERT INTO family_events (
        calendar_id, title, event_type, start_time, end_time,
        source, source_id
    ) VALUES (
        v_calendar_id,
        p_meal_title,
        'meal',
        v_start_time,
        v_start_time + INTERVAL '1 hour',
        'meal_plan',
        p_meal_plan_id
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create events from gift list occasions
CREATE OR REPLACE FUNCTION create_gift_occasion_event(
    p_gift_list_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_list RECORD;
    v_calendar_id UUID;
    v_event_id UUID;
    v_member_name TEXT;
BEGIN
    -- Get the gift list
    SELECT gl.*, fm.nickname INTO v_list
    FROM family_gift_lists gl
    JOIN family_members fm ON gl.owner_id = fm.id
    WHERE gl.id = p_gift_list_id;
    
    IF v_list.occasion_date IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get default family calendar
    SELECT id INTO v_calendar_id
    FROM family_calendars
    WHERE family_id = v_list.family_id AND is_default = true
    LIMIT 1;
    
    IF v_calendar_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Create the event
    INSERT INTO family_events (
        calendar_id, 
        title, 
        event_type, 
        start_time, 
        all_day,
        source, 
        source_id
    ) VALUES (
        v_calendar_id,
        v_list.nickname || '''s ' || COALESCE(v_list.occasion, 'Gift Day'),
        CASE v_list.occasion
            WHEN 'birthday' THEN 'birthday'
            WHEN 'anniversary' THEN 'anniversary'
            WHEN 'holiday' THEN 'holiday'
            ELSE 'custom'
        END,
        v_list.occasion_date::timestamp,
        true,
        'gift_occasion',
        p_gift_list_id
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_calendars_updated_at ON family_calendars;
CREATE TRIGGER trigger_calendars_updated_at
    BEFORE UPDATE ON family_calendars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON family_events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON family_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_google_tokens_updated_at ON google_calendar_tokens;
CREATE TRIGGER trigger_google_tokens_updated_at
    BEFORE UPDATE ON google_calendar_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-CREATE DEFAULT CALENDAR FOR NEW FAMILIES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_default_family_calendar()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO family_calendars (family_id, name, is_default, color)
    VALUES (NEW.id, NEW.name || ' Calendar', true, '#3B82F6');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_default_calendar ON families;
CREATE TRIGGER trigger_create_default_calendar
    AFTER INSERT ON families
    FOR EACH ROW
    EXECUTE FUNCTION create_default_family_calendar();

-- ========== FROM: 20260214165119_shopping_integration.sql ==========
-- ============================================================================
-- GIFT LIST → SHOPPING INTEGRATION
-- ============================================================================
-- Connects family gift lists to Let's Go Shopping for volume discounts.
-- Family members can "cold start" shopping aggregations for gift items.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- GIFT SHOPPING AGGREGATIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
-- When a family member says "I'm buying this Nintendo Switch 2 on Thursday",
-- this creates a cold start that others can join for volume discounts.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_shopping_aggregations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to gift item (optional - can be standalone)
    gift_item_id UUID REFERENCES gift_list_items(id) ON DELETE SET NULL,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    
    -- Shopping details
    product_name TEXT NOT NULL,
    product_url TEXT,
    product_price DECIMAL(10,2),
    quantity_needed INT DEFAULT 1,
    
    -- Cold start window
    shopping_date DATE NOT NULL,
    shopping_time TIME,
    window_closes_at TIMESTAMPTZ NOT NULL,
    
    -- Aggregation status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'purchased', 'cancelled')),
    min_participants INT DEFAULT 2,
    current_participants INT DEFAULT 1,
    
    -- Discount tiers
    discount_tier INT DEFAULT 0, -- 0=none, 1=10%, 2=15%, 3=20%
    
    -- Creator
    created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_shopping_family ON gift_shopping_aggregations(family_id);
CREATE INDEX IF NOT EXISTS idx_gift_shopping_status ON gift_shopping_aggregations(status);
CREATE INDEX IF NOT EXISTS idx_gift_shopping_date ON gift_shopping_aggregations(shopping_date);
CREATE INDEX IF NOT EXISTS idx_gift_shopping_window ON gift_shopping_aggregations(window_closes_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- SHOPPING PARTICIPANTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gift_shopping_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aggregation_id UUID NOT NULL REFERENCES gift_shopping_aggregations(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    for_gift_item_id UUID REFERENCES gift_list_items(id) ON DELETE SET NULL, -- Which wishlist item this is for
    notes TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(aggregation_id, family_member_id)
);

CREATE INDEX IF NOT EXISTS idx_shopping_participants_agg ON gift_shopping_participants(aggregation_id);
CREATE INDEX IF NOT EXISTS idx_shopping_participants_member ON gift_shopping_participants(family_member_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE gift_shopping_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_shopping_participants ENABLE ROW LEVEL SECURITY;

-- Aggregations: Family members can view
CREATE POLICY "Members can view shopping aggregations"
    ON gift_shopping_aggregations FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Aggregations: Members can create
CREATE POLICY "Members can create aggregations"
    ON gift_shopping_aggregations FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Aggregations: Creators can update
CREATE POLICY "Creators can update aggregations"
    ON gift_shopping_aggregations FOR UPDATE
    USING (
        created_by IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- Participants: Members can view
CREATE POLICY "Members can view participants"
    ON gift_shopping_participants FOR SELECT
    USING (
        aggregation_id IN (
            SELECT gsa.id FROM gift_shopping_aggregations gsa
            JOIN family_members fm ON gsa.family_id = fm.family_id
            WHERE fm.user_id = auth.uid() AND fm.is_active = true
        )
    );

-- Participants: Members can join
CREATE POLICY "Members can join aggregations"
    ON gift_shopping_participants FOR INSERT
    WITH CHECK (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- Participants: Members can update their own participation
CREATE POLICY "Members can update participation"
    ON gift_shopping_participants FOR UPDATE
    USING (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- Participants: Members can leave
CREATE POLICY "Members can leave aggregations"
    ON gift_shopping_participants FOR DELETE
    USING (
        family_member_id IN (
            SELECT id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: Update participant count
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_shopping_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE gift_shopping_aggregations
        SET current_participants = current_participants + 1,
            discount_tier = CASE 
                WHEN current_participants + 1 >= 10 THEN 3
                WHEN current_participants + 1 >= 5 THEN 2
                WHEN current_participants + 1 >= 2 THEN 1
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = NEW.aggregation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE gift_shopping_aggregations
        SET current_participants = GREATEST(0, current_participants - 1),
            discount_tier = CASE 
                WHEN current_participants - 1 >= 10 THEN 3
                WHEN current_participants - 1 >= 5 THEN 2
                WHEN current_participants - 1 >= 2 THEN 1
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = OLD.aggregation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_shopping_participant_count ON gift_shopping_participants;
CREATE TRIGGER trigger_shopping_participant_count
    AFTER INSERT OR DELETE ON gift_shopping_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_shopping_participant_count();

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: Create Shopping Aggregation from Gift Item
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_gift_shopping_aggregation(
    p_gift_item_id UUID,
    p_family_member_id UUID,
    p_shopping_date DATE,
    p_shopping_time TIME DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_item RECORD;
    v_list RECORD;
    v_agg_id UUID;
BEGIN
    -- Get the gift item
    SELECT * INTO v_item FROM gift_list_items WHERE id = p_gift_item_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gift item not found';
    END IF;
    
    -- Get the list for family_id
    SELECT * INTO v_list FROM family_gift_lists WHERE id = v_item.list_id;
    
    -- Create the aggregation
    INSERT INTO gift_shopping_aggregations (
        gift_item_id,
        family_id,
        product_name,
        product_url,
        product_price,
        quantity_needed,
        shopping_date,
        shopping_time,
        window_closes_at,
        created_by
    ) VALUES (
        p_gift_item_id,
        v_list.family_id,
        v_item.name,
        v_item.url,
        v_item.price_estimate,
        v_item.quantity_wanted,
        p_shopping_date,
        p_shopping_time,
        (p_shopping_date::timestamp + COALESCE(p_shopping_time, '12:00'::time) - INTERVAL '2 hours')::timestamptz,
        p_family_member_id
    ) RETURNING id INTO v_agg_id;
    
    -- Add creator as first participant
    INSERT INTO gift_shopping_participants (aggregation_id, family_member_id, for_gift_item_id)
    VALUES (v_agg_id, p_family_member_id, p_gift_item_id);
    
    -- Create calendar event
    PERFORM create_shopping_calendar_event(v_agg_id);
    
    RETURN v_agg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: Create Calendar Event from Shopping Aggregation
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_shopping_calendar_event(p_aggregation_id UUID)
RETURNS UUID AS $$
DECLARE
    v_agg RECORD;
    v_calendar_id UUID;
    v_event_id UUID;
BEGIN
    -- Get the aggregation
    SELECT * INTO v_agg FROM gift_shopping_aggregations WHERE id = p_aggregation_id;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Get default family calendar
    SELECT id INTO v_calendar_id
    FROM family_calendars
    WHERE family_id = v_agg.family_id AND is_default = true
    LIMIT 1;
    
    IF v_calendar_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Create the event
    INSERT INTO family_events (
        calendar_id,
        title,
        description,
        event_type,
        start_time,
        end_time,
        source,
        source_id,
        created_by
    ) VALUES (
        v_calendar_id,
        'Shopping: ' || v_agg.product_name,
        'Window closes at ' || v_agg.window_closes_at::text,
        'shopping',
        v_agg.shopping_date::timestamp + COALESCE(v_agg.shopping_time, '12:00'::time),
        v_agg.shopping_date::timestamp + COALESCE(v_agg.shopping_time, '12:00'::time) + INTERVAL '1 hour',
        'shopping',
        p_aggregation_id,
        v_agg.created_by
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== FROM: 20260215001000_lmd_meal_requests.sql ==========
-- LMD MEAL REQUESTS — Mark-Backed Bounty System
-- ===============================================
-- Members can request meals with Marks (backed by Joules).
-- Two types: GENERAL (vote for what you want) and SPECIFIC (commit to buy)

CREATE TABLE IF NOT EXISTS lmd_meal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- What meal
  meal_name TEXT NOT NULL,
  pantry_recipe_id UUID REFERENCES pantry_recipes(id) ON DELETE SET NULL,
  
  -- Request type
  request_type TEXT NOT NULL CHECK (request_type IN ('general', 'specific')),
  
  -- Marks commitment (backed 1:1 by Joules)
  marks_committed INTEGER NOT NULL CHECK (marks_committed >= 5),
  
  -- For GENERAL requests
  duration_days INTEGER CHECK (duration_days IS NULL OR (duration_days >= 1 AND duration_days <= 7)),
  
  -- For SPECIFIC requests
  specific_date DATE,
  portion_count INTEGER CHECK (portion_count IS NULL OR portion_count >= 1),
  
  -- Location filter
  postal_code TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired', 'withdrawn', 'forfeited')),
  expires_at DATE NOT NULL,
  
  -- If fulfilled, link to the meal/order
  fulfilled_by_meal_id UUID REFERENCES lmd_meals(id) ON DELETE SET NULL,
  fulfilled_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lmd_requests_requester ON lmd_meal_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_lmd_requests_status ON lmd_meal_requests(status);
CREATE INDEX IF NOT EXISTS idx_lmd_requests_expires ON lmd_meal_requests(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_lmd_requests_postal ON lmd_meal_requests(postal_code) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_lmd_requests_recipe ON lmd_meal_requests(pantry_recipe_id) WHERE pantry_recipe_id IS NOT NULL;

-- RLS
ALTER TABLE lmd_meal_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can view active requests (chefs need to see demand)
CREATE POLICY "Active requests visible to all"
  ON lmd_meal_requests FOR SELECT
  USING (status = 'active');

-- Users can view their own requests (any status)
CREATE POLICY "Users view own requests"
  ON lmd_meal_requests FOR SELECT
  USING (auth.uid() = requester_id);

-- Users can create their own requests
CREATE POLICY "Users create own requests"
  ON lmd_meal_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update their own requests (withdraw, etc.)
CREATE POLICY "Users update own requests"
  ON lmd_meal_requests FOR UPDATE
  USING (auth.uid() = requester_id);

-- Function to auto-expire requests
CREATE OR REPLACE FUNCTION expire_lmd_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lmd_meal_requests
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND expires_at < CURRENT_DATE;
END;
$$;

-- Aggregated demand view for chefs
DROP VIEW IF EXISTS lmd_demand_summary;
CREATE OR REPLACE VIEW lmd_demand_summary AS
SELECT 
  meal_name,
  pantry_recipe_id,
  postal_code,
  COUNT(*) as request_count,
  SUM(marks_committed) as total_marks,
  MIN(expires_at) as earliest_expiry,
  MAX(expires_at) as latest_expiry,
  ARRAY_AGG(DISTINCT specific_date) FILTER (WHERE specific_date IS NOT NULL) as specific_dates
FROM lmd_meal_requests
WHERE status = 'active'
GROUP BY meal_name, pantry_recipe_id, postal_code
ORDER BY total_marks DESC;

-- Grant access to the view
GRANT SELECT ON lmd_demand_summary TO authenticated;
GRANT SELECT ON lmd_demand_summary TO anon;

COMMENT ON TABLE lmd_meal_requests IS 'Mark-backed meal requests for Let''s Make Dinner demand signaling';
COMMENT ON VIEW lmd_demand_summary IS 'Aggregated demand view showing what meals people want in each area';

-- ========== FROM: 20260217000001_design_battle_system.sql ==========
-- ============================================================================
-- DESIGN BATTLE SYSTEM
-- ============================================================================
-- Competitive bounty system where 2+ participants compete for the same work.
-- Auto-triggers when 2+ people sign up for the same bounty.
--
-- Key Features:
-- - Mixed currency ante (Credits, Marks, Joules)
-- - GAP rate conversion at contest time
-- - Winner takes 50% of pot + Crow Feathers
-- - Platform takes 16.7% margin
--
-- Migration: 20260217000001_design_battle_system.sql
-- ============================================================================

-- ============================================================================
-- DESIGN BATTLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL,
    bounty_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'voting', 'completed', 'cancelled')),
    skill_tier TEXT NOT NULL DEFAULT 'journeyman' CHECK (skill_tier IN ('novice', 'apprentice', 'journeyman', 'expert', 'master', 'grandmaster')),
    timeframe TEXT NOT NULL DEFAULT '1week' CHECK (timeframe IN ('1hour', '4hours', '1day', '3days', '1week', '2weeks', '1month', '3months')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Minimum ante requirements
    min_ante_credits DECIMAL(12,2) NOT NULL DEFAULT 1,
    min_ante_marks DECIMAL(12,2) NOT NULL DEFAULT 0,
    min_ante_joules DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Pot calculations
    total_pot DECIMAL(12,2) NOT NULL DEFAULT 0,
    platform_cut DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_pot DECIMAL(12,2) NOT NULL DEFAULT 0,
    winner_payout DECIMAL(12,2) NOT NULL DEFAULT 0,
    community_votes INTEGER NOT NULL DEFAULT 0,
    
    -- Participants
    participant_count INTEGER NOT NULL DEFAULT 0,
    winner_id UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active battles lookup
CREATE INDEX IF NOT EXISTS idx_design_battles_status ON design_battles(status);
CREATE INDEX IF NOT EXISTS idx_design_battles_bounty ON design_battles(bounty_id);
CREATE INDEX IF NOT EXISTS idx_design_battles_ends_at ON design_battles(ends_at);

-- ============================================================================
-- DESIGN BATTLE PARTICIPANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_battle_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID NOT NULL REFERENCES design_battles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    display_name TEXT NOT NULL,
    
    -- Ante details
    ante_original JSONB NOT NULL DEFAULT '{"credits": 0, "marks": 0, "joules": 0}',
    ante_credit_equivalent DECIMAL(12,2) NOT NULL DEFAULT 0,
    gap_rate_used DECIMAL(6,2) NOT NULL DEFAULT 1,
    converted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Submission
    submission_url TEXT,
    submitted_at TIMESTAMPTZ,
    
    -- Voting
    vote_count INTEGER NOT NULL DEFAULT 0,
    
    -- Results
    rank INTEGER,
    payout DECIMAL(12,2),
    crow_feather_earned BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(battle_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_battle_participants_battle ON design_battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_participants_user ON design_battle_participants(user_id);

-- ============================================================================
-- DESIGN BATTLE VOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS design_battle_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID NOT NULL REFERENCES design_battles(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES design_battle_participants(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES auth.users(id),
    vote_credits INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(battle_id, voter_id) -- One vote per battle per user
);

-- Index for vote counting
CREATE INDEX IF NOT EXISTS idx_battle_votes_participant ON design_battle_votes(participant_id);

-- ============================================================================
-- BOUNTY SIGNUPS TABLE (for auto-contest detection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bounty_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn', 'converted_to_battle')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(bounty_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bounty_signups_bounty ON bounty_signups(bounty_id);

-- ============================================================================
-- AUTO-CONTEST TRIGGER FUNCTION
-- ============================================================================
-- When 2+ people sign up for the same bounty, automatically create a Design Battle

CREATE OR REPLACE FUNCTION create_design_battle_on_overlap()
RETURNS TRIGGER AS $$
DECLARE
    signup_count INTEGER;
    existing_battle UUID;
    new_battle_id UUID;
    bounty_record RECORD;
BEGIN
    -- Count active signups for this bounty
    SELECT COUNT(*) INTO signup_count
    FROM bounty_signups
    WHERE bounty_id = NEW.bounty_id
    AND status = 'active';
    
    -- If 2+ signups, check if battle already exists
    IF signup_count >= 2 THEN
        SELECT id INTO existing_battle
        FROM design_battles
        WHERE bounty_id = NEW.bounty_id
        AND status IN ('pending', 'active');
        
        -- If no battle exists, create one
        IF existing_battle IS NULL THEN
            -- Get bounty details (assumes bounties table exists)
            -- If not, use placeholder values
            BEGIN
                SELECT title, skill_tier, timeframe INTO bounty_record
                FROM bounties
                WHERE id = NEW.bounty_id;
            EXCEPTION WHEN OTHERS THEN
                bounty_record.title := 'Bounty ' || NEW.bounty_id::TEXT;
                bounty_record.skill_tier := 'journeyman';
                bounty_record.timeframe := '1week';
            END;
            
            -- Create the Design Battle
            INSERT INTO design_battles (
                bounty_id,
                bounty_title,
                status,
                skill_tier,
                timeframe,
                starts_at,
                ends_at
            ) VALUES (
                NEW.bounty_id,
                COALESCE(bounty_record.title, 'Bounty ' || NEW.bounty_id::TEXT),
                'pending',
                COALESCE(bounty_record.skill_tier, 'journeyman'),
                COALESCE(bounty_record.timeframe, '1week'),
                NOW(),
                NOW() + INTERVAL '1 week' -- Default, will be updated based on timeframe
            )
            RETURNING id INTO new_battle_id;
            
            -- Update all active signups to converted_to_battle
            UPDATE bounty_signups
            SET status = 'converted_to_battle'
            WHERE bounty_id = NEW.bounty_id
            AND status = 'active';
            
            -- Log the auto-creation
            RAISE NOTICE 'Design Battle % created for bounty % with % participants', 
                new_battle_id, NEW.bounty_id, signup_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_design_battle ON bounty_signups;
CREATE TRIGGER trigger_auto_design_battle
    AFTER INSERT ON bounty_signups
    FOR EACH ROW
    EXECUTE FUNCTION create_design_battle_on_overlap();

-- ============================================================================
-- INCREMENT VOTE COUNT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_battle_votes(
    p_participant_id UUID,
    p_vote_count INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    UPDATE design_battle_participants
    SET vote_count = vote_count + p_vote_count
    WHERE id = p_participant_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETE BATTLE FUNCTION
-- ============================================================================
-- Called when battle ends to calculate final results

CREATE OR REPLACE FUNCTION complete_design_battle(p_battle_id UUID)
RETURNS TABLE (
    winner_user_id UUID,
    winner_payout DECIMAL,
    crow_feather_awarded BOOLEAN
) AS $$
DECLARE
    v_winner RECORD;
    v_total_ante DECIMAL;
    v_community_votes INTEGER;
    v_gross_pot DECIMAL;
    v_platform_cut DECIMAL;
    v_net_pot DECIMAL;
    v_winner_share DECIMAL;
    v_runner_up_share DECIMAL;
    v_participant_count INTEGER;
BEGIN
    -- Get winner (highest vote count)
    SELECT * INTO v_winner
    FROM design_battle_participants
    WHERE battle_id = p_battle_id
    ORDER BY vote_count DESC
    LIMIT 1;
    
    IF v_winner IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate pot
    SELECT 
        COALESCE(SUM(ante_credit_equivalent), 0),
        COUNT(*)
    INTO v_total_ante, v_participant_count
    FROM design_battle_participants
    WHERE battle_id = p_battle_id;
    
    SELECT community_votes INTO v_community_votes
    FROM design_battles
    WHERE id = p_battle_id;
    
    v_gross_pot := v_total_ante + COALESCE(v_community_votes, 0);
    v_platform_cut := ROUND(v_gross_pot * 0.167, 2);
    v_net_pot := v_gross_pot - v_platform_cut;
    v_winner_share := ROUND(v_net_pot * 0.50, 2);
    v_runner_up_share := ROUND((v_net_pot - v_winner_share) / GREATEST(v_participant_count - 1, 1), 2);
    
    -- Update winner
    UPDATE design_battle_participants
    SET rank = 1, payout = v_winner_share, crow_feather_earned = TRUE
    WHERE id = v_winner.id;
    
    -- Update runner-ups
    UPDATE design_battle_participants
    SET rank = 2, payout = v_runner_up_share, crow_feather_earned = FALSE
    WHERE battle_id = p_battle_id AND id != v_winner.id;
    
    -- Update battle
    UPDATE design_battles
    SET 
        status = 'completed',
        winner_id = v_winner.user_id,
        total_pot = v_gross_pot,
        platform_cut = v_platform_cut,
        net_pot = v_net_pot,
        winner_payout = v_winner_share,
        updated_at = NOW()
    WHERE id = p_battle_id;
    
    -- Award crow feather
    INSERT INTO crow_feathers (user_id, category, record_value, metadata)
    VALUES (
        v_winner.user_id,
        'design_battle',
        v_winner_share,
        jsonb_build_object('battle_id', p_battle_id)
    );
    
    RETURN QUERY SELECT v_winner.user_id, v_winner_share, TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE design_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_battle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_signups ENABLE ROW LEVEL SECURITY;

-- Design Battles: Anyone can view, only participants can update
CREATE POLICY "Anyone can view design battles"
    ON design_battles FOR SELECT
    USING (true);

CREATE POLICY "System can manage design battles"
    ON design_battles FOR ALL
    USING (true);

-- Participants: Anyone can view, users can manage their own
CREATE POLICY "Anyone can view participants"
    ON design_battle_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join battles"
    ON design_battle_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
    ON design_battle_participants FOR UPDATE
    USING (auth.uid() = user_id);

-- Votes: Anyone can view, users can vote once
CREATE POLICY "Anyone can view votes"
    ON design_battle_votes FOR SELECT
    USING (true);

CREATE POLICY "Users can vote"
    ON design_battle_votes FOR INSERT
    WITH CHECK (auth.uid() = voter_id);

-- Bounty Signups: Users manage their own
CREATE POLICY "Users can view own signups"
    ON bounty_signups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create signups"
    ON bounty_signups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signups"
    ON bounty_signups FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_design_battle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_design_battle_updated
    BEFORE UPDATE ON design_battles
    FOR EACH ROW
    EXECUTE FUNCTION update_design_battle_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE design_battles IS 'Competitive bounty contests where 2+ participants compete';
COMMENT ON TABLE design_battle_participants IS 'Participants in design battles with their antes and results';
COMMENT ON TABLE design_battle_votes IS 'Community votes on design battle submissions';
COMMENT ON TABLE bounty_signups IS 'Bounty signups that trigger auto-contest creation';
COMMENT ON FUNCTION create_design_battle_on_overlap() IS 'Auto-creates Design Battle when 2+ people sign up for same bounty';
COMMENT ON FUNCTION complete_design_battle(UUID) IS 'Finalizes battle, calculates payouts, awards crow feathers';

-- ========== FROM: 20260219000001_beacon_breadcrumb_navigation.sql ==========
-- ═══════════════════════════════════════════════════════════════
-- BEACON BREADCRUMB NAVIGATION SYSTEM
-- Six-color beacons + Orange Protocol + Ghost Mode Beacon Runs
-- Innovation: Beacon Breadcrumb Navigation System
-- Date: February 19, 2026
-- ═══════════════════════════════════════════════════════════════

-- ─── BEACON COLORS & ORANGE PROTOCOL ───

-- Add color to beacons (Green, Blue, Yellow, Red, Purple, Orange)
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  beacon_color TEXT DEFAULT 'green' CHECK (beacon_color IN ('green', 'blue', 'yellow', 'red', 'purple', 'orange'));

-- Add sequential beacon number per user
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  beacon_number INTEGER;

-- Orange Protocol fields
ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  orange_subtype TEXT CHECK (orange_subtype IS NULL OR orange_subtype IN (
    'game_marker', 'share_person', 'social_cue', 'gift', 
    'treasure', 'learning', 'trade_route', 'custom'
  ));

ALTER TABLE public.beacons ADD COLUMN IF NOT EXISTS
  orange_payload JSONB DEFAULT NULL;
  -- Structure: { subtype, customLabel, shareWith, isGameMarker, isTradeRoute }

-- ─── BEACON RUN GAMES (Ghost Mode Only) ───

CREATE TABLE IF NOT EXISTS public.beacon_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID REFERENCES auth.users(id),
  name            TEXT NOT NULL,
  description     TEXT,
  
  -- Route data
  beacon_ids      UUID[] NOT NULL DEFAULT '{}',
  total_beacons   INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER,
  
  -- Competition settings
  ante_credits    INTEGER DEFAULT 0,
  prize_pool_credits INTEGER DEFAULT 0,
  
  -- Stats
  times_started   INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  best_time_user_id UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  is_featured     BOOLEAN DEFAULT FALSE,
  
  -- Ghost Mode requirement (always true for Beacon Runs)
  requires_ghost_mode BOOLEAN DEFAULT TRUE
);

DROP INDEX IF EXISTS idx_beacon_runs_creator;
DROP INDEX IF EXISTS idx_beacon_runs_featured;
CREATE INDEX idx_beacon_runs_creator ON public.beacon_runs(creator_id);
CREATE INDEX idx_beacon_runs_featured ON public.beacon_runs(is_featured) WHERE is_featured = TRUE;

-- Beacon Run Progress
CREATE TABLE IF NOT EXISTS public.beacon_run_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  run_id          UUID NOT NULL REFERENCES public.beacon_runs(id) ON DELETE CASCADE,
  
  -- Progress
  beacons_reached UUID[] DEFAULT '{}',
  current_beacon_index INTEGER DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  
  -- Time tracking
  elapsed_seconds INTEGER DEFAULT 0,
  
  -- Ghost Mode verification
  ghost_session_id UUID,
  
  -- Crow Feather earned (if record set)
  crow_feather_id INTEGER REFERENCES public.crow_feathers(id)
);

DROP INDEX IF EXISTS idx_beacon_run_progress_user;
DROP INDEX IF EXISTS idx_beacon_run_progress_run;
CREATE INDEX idx_beacon_run_progress_user ON public.beacon_run_progress(user_id);
CREATE INDEX idx_beacon_run_progress_run ON public.beacon_run_progress(run_id);

-- ─── CROW FEATHERS FOR BEACON RUNS ───

-- Ensure crow_feathers table exists (from Half-Life system)
CREATE TABLE IF NOT EXISTS public.crow_feathers (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  category        TEXT NOT NULL,
  record_value    DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER,
  time_bracket    TEXT,
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  feather_number  INTEGER NOT NULL,
  superseded_by   INTEGER REFERENCES public.crow_feathers(id),
  
  -- Beacon Run specific
  beacon_run_id   UUID REFERENCES public.beacon_runs(id),
  
  UNIQUE(feather_number)
);

CREATE INDEX IF NOT EXISTS idx_crow_feathers_user ON public.crow_feathers(user_id);
CREATE INDEX IF NOT EXISTS idx_crow_feathers_category ON public.crow_feathers(category);

-- ─── GHOST MODE SESSIONS (for Members entering Ghost Mode) ───

CREATE TABLE IF NOT EXISTS public.ghost_mode_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  
  -- Session tracking
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- What they did in Ghost Mode
  beacons_dropped INTEGER DEFAULT 0,
  beacon_runs_created INTEGER DEFAULT 0,
  beacon_runs_played INTEGER DEFAULT 0,
  
  -- Crow Feathers earned
  crow_feathers_earned INTEGER DEFAULT 0,
  
  -- Equipment brought from Portfolio
  equipment_brought JSONB DEFAULT '[]'
);

CREATE INDEX idx_ghost_mode_sessions_user ON public.ghost_mode_sessions(user_id);

-- ─── Ensure columns exist for policies below ───
ALTER TABLE public.beacon_run_progress ADD COLUMN IF NOT EXISTS ghost_id UUID;
ALTER TABLE public.beacon_run_progress ADD COLUMN IF NOT EXISTS crow_feather_id INTEGER;

-- ─── RLS POLICIES ───

ALTER TABLE public.beacon_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beacon_run_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghost_mode_sessions ENABLE ROW LEVEL SECURITY;

-- Beacon Runs: creators can manage, all can view published
CREATE POLICY "beacon_runs_select" ON public.beacon_runs 
  FOR SELECT USING (published_at IS NOT NULL OR creator_id = auth.uid());
CREATE POLICY "beacon_runs_insert" ON public.beacon_runs 
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "beacon_runs_update" ON public.beacon_runs 
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "beacon_runs_delete" ON public.beacon_runs 
  FOR DELETE USING (auth.uid() = creator_id);

-- Beacon Run Progress: users can manage their own
CREATE POLICY "beacon_run_progress_select" ON public.beacon_run_progress 
  FOR SELECT USING (user_id = auth.uid() OR ghost_id IS NOT NULL);
CREATE POLICY "beacon_run_progress_insert" ON public.beacon_run_progress 
  FOR INSERT WITH CHECK (user_id = auth.uid() OR ghost_id IS NOT NULL);
CREATE POLICY "beacon_run_progress_update" ON public.beacon_run_progress 
  FOR UPDATE USING (user_id = auth.uid());

-- Ghost Mode Sessions: users can manage their own
CREATE POLICY "ghost_mode_sessions_all" ON public.ghost_mode_sessions 
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Crow Feathers: public read, authenticated insert
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crow_feathers' AND policyname = 'crow_feathers_select') THEN
    ALTER TABLE public.crow_feathers ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "crow_feathers_select" ON public.crow_feathers FOR SELECT USING (true);
    CREATE POLICY "crow_feathers_insert" ON public.crow_feathers FOR INSERT WITH CHECK (auth.uid() = user_id OR ghost_id IS NOT NULL);
  END IF;
END $$;

-- ─── LEADERBOARD CATEGORIES FOR BEACON RUNS ───

-- Add new categories to any existing leaderboard_categories table
-- Or create a simple tracking table
CREATE TABLE IF NOT EXISTS public.leaderboard_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  category_type   TEXT NOT NULL DEFAULT 'ghost' CHECK (category_type IN ('ghost', 'real', 'both')),
  time_bracketed  BOOLEAN DEFAULT FALSE,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.leaderboard_categories (name, display_name, category_type, time_bracketed, description) VALUES
  ('beacon_run_speed', 'Beacon Run Speed', 'ghost', FALSE, 'Fastest completion of a specific Beacon Run'),
  ('beacon_journeys_completed', 'Beacon Journeys', 'ghost', TRUE, 'Most Beacon Runs completed in a session'),
  ('beacons_dropped', 'Beacons Dropped', 'ghost', TRUE, 'Most beacons dropped in a session'),
  ('maps_created', 'Maps Created', 'ghost', FALSE, 'Total Beacon Run maps created')
ON CONFLICT (name) DO NOTHING;

-- ─── FUNCTION: Get next beacon number for user ───

CREATE OR REPLACE FUNCTION get_next_beacon_number(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(MAX(beacon_number), 0) + 1
  FROM public.beacons
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL;

-- ─── TRIGGER: Auto-assign beacon number on insert ───

CREATE OR REPLACE FUNCTION assign_beacon_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.beacon_number IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.beacon_number := get_next_beacon_number(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_number_trigger ON public.beacons;
CREATE TRIGGER beacon_number_trigger
  BEFORE INSERT ON public.beacons
  FOR EACH ROW
  EXECUTE FUNCTION assign_beacon_number();

-- ═══════════════════════════════════════════════════════════════
-- COMPLETE
-- "The crow remembers what the ghost forgets."
-- ═══════════════════════════════════════════════════════════════

-- ========== FROM: 20260220000002_campaign_plans.sql ==========
-- ═══════════════════════════════════════════════════════════════════════════
-- CAMPAIGN PLANS — Sellable Social Media Schedules
-- Applied: Feb 20, 2026 to ruuxzilgmuwddcofqecc (LianaBanyan direct Supabase)
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Create campaign_plans table
CREATE TABLE IF NOT EXISTS public.campaign_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- e.g., 'launch', 'awareness', 'holiday', 'engagement'
  tags TEXT[] DEFAULT '{}',
  
  -- Plan content (JSON array of scheduled cards)
  plan_data JSONB NOT NULL DEFAULT '[]',
  -- Structure: [{ day: 1, hour: 9, template_id: 'uuid', custom_text: '...', platforms: ['twitter', 'linkedin'] }, ...]
  
  -- Duration and scheduling
  duration_days INTEGER NOT NULL DEFAULT 7,
  posts_per_day INTEGER DEFAULT 3,
  total_posts INTEGER GENERATED ALWAYS AS (
    COALESCE(jsonb_array_length(plan_data), 0)
  ) STORED,
  
  -- Marketplace listing
  is_public BOOLEAN DEFAULT false,
  price_credits INTEGER DEFAULT 0, -- 0 = free
  
  -- Stats
  times_purchased INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  
  -- Shirley Temple categories
  content_categories TEXT[] DEFAULT ARRAY['family_safe'],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 2: Create campaign_plan_purchases table
CREATE TABLE IF NOT EXISTS public.campaign_plan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.campaign_plans(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Purchase details
  price_paid INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  
  -- Usage tracking
  times_deployed INTEGER DEFAULT 0,
  last_deployed_at TIMESTAMPTZ,
  
  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  UNIQUE(plan_id, buyer_id)
);

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_plans_creator ON public.campaign_plans(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_plans_public ON public.campaign_plans(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_campaign_plans_category ON public.campaign_plans(category);
CREATE INDEX IF NOT EXISTS idx_campaign_plan_purchases_buyer ON public.campaign_plan_purchases(buyer_id);

-- STEP 4: Enable RLS
ALTER TABLE public.campaign_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_plan_purchases ENABLE ROW LEVEL SECURITY;

-- STEP 5: RLS Policies for campaign_plans
CREATE POLICY "Users can view their own plans"
  ON public.campaign_plans FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can view public plans"
  ON public.campaign_plans FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Anon can view public plans"
  ON public.campaign_plans FOR SELECT
  TO anon
  USING (is_public = true);

CREATE POLICY "Users can create their own plans"
  ON public.campaign_plans FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own plans"
  ON public.campaign_plans FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete their own plans"
  ON public.campaign_plans FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- STEP 6: RLS Policies for campaign_plan_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.campaign_plan_purchases FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Plan creators can view purchases of their plans"
  ON public.campaign_plan_purchases FOR SELECT
  TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.campaign_plans WHERE creator_id = auth.uid())
  );

CREATE POLICY "Users can purchase plans"
  ON public.campaign_plan_purchases FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their own purchases (for rating)"
  ON public.campaign_plan_purchases FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid());

-- STEP 7: Function to update plan stats on purchase
CREATE OR REPLACE FUNCTION update_plan_purchase_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campaign_plans
  SET 
    times_purchased = times_purchased + 1,
    updated_at = now()
  WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Trigger for purchase stats
DROP TRIGGER IF EXISTS on_plan_purchase ON public.campaign_plan_purchases;
CREATE TRIGGER on_plan_purchase
  AFTER INSERT ON public.campaign_plan_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_purchase_stats();

-- STEP 9: Function to update average rating
CREATE OR REPLACE FUNCTION update_plan_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campaign_plans
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.campaign_plan_purchases
      WHERE plan_id = NEW.plan_id AND rating IS NOT NULL
    ),
    updated_at = now()
  WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 10: Trigger for rating updates
DROP TRIGGER IF EXISTS on_plan_rating ON public.campaign_plan_purchases;
CREATE TRIGGER on_plan_rating
  AFTER UPDATE OF rating ON public.campaign_plan_purchases
  FOR EACH ROW
  WHEN (NEW.rating IS DISTINCT FROM OLD.rating)
  EXECUTE FUNCTION update_plan_rating();

-- STEP 11: Comments
COMMENT ON TABLE public.campaign_plans IS 'Sellable social media campaign plans with scheduled cue cards';
COMMENT ON TABLE public.campaign_plan_purchases IS 'Tracks who purchased which campaign plans';
COMMENT ON COLUMN public.campaign_plans.plan_data IS 'JSON array of scheduled posts: [{day, hour, template_id, custom_text, platforms}]';
COMMENT ON COLUMN public.campaign_plans.content_categories IS 'Shirley Temple content categories for filtering';

-- ========== FROM: 20260220000004_ghost_share_tracking.sql ==========
-- Ghost Share Tracking: Capture emails from ghosts who share cue cards
-- When they sign up later, their rewards get applied

-- Table to track ghost shares before they become members
CREATE TABLE IF NOT EXISTS public.ghost_share_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ghost identification
  email TEXT NOT NULL,
  tracking_token UUID DEFAULT gen_random_uuid() UNIQUE,
  
  -- What they shared
  template_id UUID REFERENCES public.cue_card_templates(id) ON DELETE SET NULL,
  share_type TEXT DEFAULT 'cue_card', -- cue_card, beacon, referral
  
  -- Tracking metrics
  share_count INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0, -- people who signed up from their shares
  
  -- Reward accumulation (applied when they become member)
  pending_credits INTEGER DEFAULT 0,
  pending_marks INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, converted, expired
  converted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  
  -- Metadata
  first_share_at TIMESTAMPTZ DEFAULT now(),
  last_share_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT, -- hashed for privacy, used for fraud prevention
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_ghost_share_email ON public.ghost_share_tracking(email);
CREATE INDEX IF NOT EXISTS idx_ghost_share_token ON public.ghost_share_tracking(tracking_token);
CREATE INDEX IF NOT EXISTS idx_ghost_share_status ON public.ghost_share_tracking(status);

-- RLS: Public can insert (ghosts creating records), only system can read/update
ALTER TABLE public.ghost_share_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their own tracking records
CREATE POLICY "Ghosts can create share tracking"
  ON public.ghost_share_tracking
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous to read their own record by token (for the QR URL)
CREATE POLICY "Ghosts can read own tracking by token"
  ON public.ghost_share_tracking
  FOR SELECT
  TO anon
  USING (true); -- They need the token to look up

-- Authenticated users can read all (for admin/analytics)
CREATE POLICY "Authenticated can read ghost tracking"
  ON public.ghost_share_tracking
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to increment share count
CREATE OR REPLACE FUNCTION increment_ghost_share(p_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ghost_share_tracking
  SET 
    share_count = share_count + 1,
    last_share_at = now(),
    updated_at = now()
  WHERE tracking_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment click count (when someone scans their QR)
CREATE OR REPLACE FUNCTION increment_ghost_click(p_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ghost_share_tracking
  SET 
    click_count = click_count + 1,
    updated_at = now()
  WHERE tracking_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert ghost to member (called during signup)
CREATE OR REPLACE FUNCTION convert_ghost_to_member(p_email TEXT, p_user_id UUID)
RETURNS TABLE(
  credits_earned INTEGER,
  marks_earned INTEGER,
  shares_made INTEGER,
  conversions_made INTEGER
) AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Find the ghost record
  SELECT * INTO v_record
  FROM public.ghost_share_tracking
  WHERE email = p_email AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_record IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, 0;
    RETURN;
  END IF;
  
  -- Mark as converted
  UPDATE public.ghost_share_tracking
  SET 
    status = 'converted',
    converted_user_id = p_user_id,
    converted_at = now(),
    updated_at = now()
  WHERE id = v_record.id;
  
  -- Return the rewards to apply
  RETURN QUERY SELECT 
    v_record.pending_credits,
    v_record.pending_marks,
    v_record.share_count,
    v_record.conversion_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ghost_share_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ghost_share_tracking_updated_at
  BEFORE UPDATE ON public.ghost_share_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_ghost_share_updated_at();

-- Add reward when someone converts from a ghost's share
CREATE OR REPLACE FUNCTION reward_ghost_for_conversion(p_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ghost_share_tracking
  SET 
    conversion_count = conversion_count + 1,
    pending_credits = pending_credits + 50, -- 50 credits per conversion
    pending_marks = pending_marks + 10,     -- 10 marks per conversion
    updated_at = now()
  WHERE tracking_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== FROM: 20260220000005_research_access_subscriptions.sql ==========
-- ============================================================================
-- RESEARCH ACCESS SUBSCRIPTIONS
-- The Lemonade Stand Model — Real data, real users, minimal cost to fail
-- ============================================================================
-- 
-- Researchers can subscribe to run longitudinal studies using real platform
-- data at $5/month. They get:
-- - Access to Contingency Operators for their experiments
-- - Regular automated reports (frequency based on tier)
-- - Storage for report archives (or rolling replacement)
-- - Zero demographics by design — ethically clean research
--
-- This enables PhD research, business simulations, and "try before you bet
-- the farm" entrepreneurship testing.
-- ============================================================================

-- Research subscription tiers
CREATE TABLE IF NOT EXISTS public.research_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription details
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'premium', 'institutional')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  
  -- Pricing (in Credits or USD cents)
  monthly_rate_credits INTEGER DEFAULT 500, -- 500 Credits = ~$5
  monthly_rate_cents INTEGER DEFAULT 500,   -- $5.00
  
  -- Report configuration
  report_frequency TEXT DEFAULT 'weekly' CHECK (report_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  max_stored_reports INTEGER DEFAULT 12,    -- Rolling window
  report_format TEXT DEFAULT 'json' CHECK (report_format IN ('json', 'csv', 'pdf', 'all')),
  
  -- Experiment limits
  max_active_experiments INTEGER DEFAULT 3,
  max_chain_depth INTEGER DEFAULT 5,
  max_factors_per_experiment INTEGER DEFAULT 8,
  
  -- Storage allocation (in MB)
  storage_quota_mb INTEGER DEFAULT 100,
  storage_used_mb INTEGER DEFAULT 0,
  
  -- Research metadata (optional, for institutional tracking)
  institution_name TEXT,
  research_purpose TEXT,
  irb_approval_number TEXT, -- Institutional Review Board
  
  -- Billing
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 month'),
  stripe_subscription_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Research reports generated from experiments
CREATE TABLE IF NOT EXISTS public.research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.research_subscriptions(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES public.thought_experiments(id) ON DELETE SET NULL,
  
  -- Report content
  report_type TEXT NOT NULL DEFAULT 'snapshot' CHECK (report_type IN ('snapshot', 'comparison', 'longitudinal', 'summary')),
  report_title TEXT,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metrics captured
  factors_measured JSONB DEFAULT '[]'::jsonb,
  net_score_at_generation NUMERIC,
  data_points_count INTEGER DEFAULT 0,
  
  -- Period covered
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- Storage management
  size_bytes INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  archive_url TEXT, -- If moved to cold storage
  
  -- Retention
  retain_until TIMESTAMPTZ, -- NULL = keep forever, date = auto-delete after
  
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Research access audit log (for compliance)
CREATE TABLE IF NOT EXISTS public.research_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.research_subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action tracking
  action_type TEXT NOT NULL, -- 'experiment_created', 'report_generated', 'data_exported', etc.
  action_details JSONB DEFAULT '{}'::jsonb,
  
  -- Data accessed (for audit trail)
  data_scope TEXT, -- 'aggregate_only', 'anonymized', 'none'
  records_accessed INTEGER DEFAULT 0,
  
  -- Zero Demographics compliance
  demographics_accessed BOOLEAN DEFAULT false, -- Should ALWAYS be false
  pii_accessed BOOLEAN DEFAULT false,          -- Should ALWAYS be false
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_subs_user ON public.research_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_subs_status ON public.research_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_research_reports_sub ON public.research_reports(subscription_id);
CREATE INDEX IF NOT EXISTS idx_research_reports_experiment ON public.research_reports(experiment_id);
CREATE INDEX IF NOT EXISTS idx_research_log_sub ON public.research_access_log(subscription_id);

-- RLS
ALTER TABLE public.research_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_access_log ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see their own research data
CREATE POLICY "research_subs_own" ON public.research_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "research_reports_own" ON public.research_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.research_subscriptions 
      WHERE id = subscription_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "research_log_own" ON public.research_access_log
  FOR SELECT USING (auth.uid() = user_id);

-- Insert audit log entries automatically
CREATE POLICY "research_log_insert" ON public.research_access_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check storage quota
CREATE OR REPLACE FUNCTION check_research_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription RECORD;
  v_total_used INTEGER;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription
  FROM public.research_subscriptions
  WHERE id = NEW.subscription_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  -- Calculate total storage used
  SELECT COALESCE(SUM(size_bytes), 0) / (1024 * 1024) INTO v_total_used
  FROM public.research_reports
  WHERE subscription_id = NEW.subscription_id
    AND NOT is_archived;
  
  -- Check quota
  IF v_total_used + (NEW.size_bytes / (1024 * 1024)) > v_subscription.storage_quota_mb THEN
    RAISE EXCEPTION 'Storage quota exceeded. Used: % MB, Quota: % MB', 
      v_total_used, v_subscription.storage_quota_mb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_storage_before_report
  BEFORE INSERT ON public.research_reports
  FOR EACH ROW
  EXECUTE FUNCTION check_research_storage_quota();

-- Function to auto-cleanup old reports (rolling window)
CREATE OR REPLACE FUNCTION cleanup_old_research_reports(p_subscription_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_subscription RECORD;
  v_deleted INTEGER := 0;
BEGIN
  SELECT * INTO v_subscription
  FROM public.research_subscriptions
  WHERE id = p_subscription_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Delete oldest reports beyond max_stored_reports
  WITH to_delete AS (
    SELECT id
    FROM public.research_reports
    WHERE subscription_id = p_subscription_id
      AND retain_until IS NULL -- Only auto-delete non-retained
    ORDER BY generated_at DESC
    OFFSET v_subscription.max_stored_reports
  )
  DELETE FROM public.research_reports
  WHERE id IN (SELECT id FROM to_delete);
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Subscription tier definitions
CREATE TABLE IF NOT EXISTS public.research_tier_definitions (
  tier TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  monthly_credits INTEGER NOT NULL,
  monthly_usd_cents INTEGER NOT NULL,
  
  -- Limits
  max_experiments INTEGER NOT NULL,
  max_chain_depth INTEGER NOT NULL,
  max_factors INTEGER NOT NULL,
  storage_mb INTEGER NOT NULL,
  max_reports INTEGER NOT NULL,
  
  -- Features
  report_frequencies TEXT[] NOT NULL,
  export_formats TEXT[] NOT NULL,
  api_access BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false
);

-- Seed tier definitions
INSERT INTO public.research_tier_definitions 
  (tier, display_name, description, monthly_credits, monthly_usd_cents, 
   max_experiments, max_chain_depth, max_factors, storage_mb, max_reports,
   report_frequencies, export_formats, api_access, priority_support)
VALUES
  ('basic', 'Lemonade Stand', 
   'Perfect for individual researchers and students. Test your hypotheses with real data.',
   500, 500, 3, 5, 8, 100, 12,
   ARRAY['weekly', 'monthly'], ARRAY['json', 'csv'], false, false),
  
  ('standard', 'Research Lab',
   'For serious research projects. More experiments, deeper analysis.',
   1500, 1500, 10, 10, 15, 500, 52,
   ARRAY['daily', 'weekly', 'biweekly', 'monthly'], ARRAY['json', 'csv', 'pdf'], true, false),
  
  ('premium', 'Research Institute',
   'Full research capabilities. Ideal for PhD programs and research teams.',
   5000, 5000, 25, 15, 25, 2000, 365,
   ARRAY['daily', 'weekly', 'biweekly', 'monthly'], ARRAY['json', 'csv', 'pdf', 'all'], true, true),
  
  ('institutional', 'University Partnership',
   'Custom pricing for academic institutions. Contact for details.',
   0, 0, 100, 20, 50, 10000, 1000,
   ARRAY['daily', 'weekly', 'biweekly', 'monthly'], ARRAY['json', 'csv', 'pdf', 'all'], true, true)
ON CONFLICT (tier) DO NOTHING;

-- Comments
COMMENT ON TABLE public.research_subscriptions IS 'The Lemonade Stand Model: Research access subscriptions for running experiments with real platform data';
COMMENT ON TABLE public.research_reports IS 'Generated reports from research experiments';
COMMENT ON TABLE public.research_access_log IS 'Audit trail for research data access - Zero Demographics compliance';
COMMENT ON TABLE public.research_tier_definitions IS 'Subscription tier configurations and pricing';

COMMENT ON COLUMN public.research_access_log.demographics_accessed IS 'Zero Demographics: This should ALWAYS be false. Platform does not collect demographic data.';
COMMENT ON COLUMN public.research_access_log.pii_accessed IS 'Zero Demographics: This should ALWAYS be false. Research uses only aggregate/anonymized data.';

-- ========== FROM: 20260221000002_cold_start_service_nodes.sql ==========
-- COLD START THESEUS: Service Node System
-- =========================================
-- Economic Law #9: Pre-ordered capacity scheduling eliminates startup risk
-- 
-- Core Principle: Risk = 0 when Demand(pre-sold) ≥ Capacity(scheduled) × 0.5
-- 
-- Node Types:
-- - Church kitchens (unused weekdays)
-- - Food truck operators (provide license)
-- - Closed restaurants (off-hours)
-- - Home kitchens (cottage food laws)
-- - Shared facilities (pooled resources)

-- Service Node Types
CREATE TABLE IF NOT EXISTS service_node_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    initiative_id TEXT REFERENCES initiatives(id),
    capacity_unit TEXT NOT NULL DEFAULT 'jobs', -- 'meals', 'jobs', 'sessions', etc.
    min_presale_percent INTEGER NOT NULL DEFAULT 50, -- The 50% rule
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Nodes (the actual locations/operations)
CREATE TABLE IF NOT EXISTS service_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type_id UUID REFERENCES service_node_types(id),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Location
    zip_code TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    address TEXT,
    geo_lat DECIMAL(10, 8),
    geo_lng DECIMAL(11, 8),
    
    -- Infrastructure
    infrastructure_type TEXT NOT NULL, -- 'church_kitchen', 'food_truck', 'restaurant', 'home_kitchen', 'shared_facility'
    infrastructure_details JSONB DEFAULT '{}',
    
    -- Capacity
    weekly_capacity INTEGER NOT NULL DEFAULT 100, -- e.g., 100 meals/week
    presold_capacity INTEGER DEFAULT 0,
    reserved_capacity INTEGER DEFAULT 0, -- 50% for surge/redundancy
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending_activation',
    -- pending_activation: Collecting demand
    -- activating: 50% threshold reached, setting up
    -- active: Operating
    -- paused: Temporarily inactive
    -- closed: Permanently closed
    
    activation_threshold INTEGER, -- Auto-calculated: weekly_capacity * 0.5
    activation_date DATE,
    
    -- Ownership
    owner_id UUID REFERENCES auth.users(id),
    captain_id UUID REFERENCES auth.users(id), -- License holder
    
    -- Economics
    platform_fee_percent DECIMAL(5, 2) DEFAULT 20.00, -- Cost + 20%
    creator_share_percent DECIMAL(5, 2) DEFAULT 83.33,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Node Leadership (Captains, XOs, Guild Members)
CREATE TABLE IF NOT EXISTS node_leadership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES service_nodes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL, -- 'captain', 'xo', 'guild_member', 'volunteer'
    
    -- License info (for Captains)
    license_type TEXT, -- 'food_truck', 'commercial_kitchen', 'cottage_food', 'restaurant'
    license_number TEXT,
    license_expiry DATE,
    license_verified BOOLEAN DEFAULT FALSE,
    
    -- Rotation
    rotation_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Compensation clarity
    is_platform_employee BOOLEAN DEFAULT FALSE, -- Always false per patent
    owns_project BOOLEAN DEFAULT TRUE, -- They own their project
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-Orders (Ghost Credits → Soft Pledge → Hard Order)
CREATE TABLE IF NOT EXISTS node_preorders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES service_nodes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Order details
    service_type TEXT, -- 'meal', 'delivery', 'catering', etc.
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Commitment phase
    phase TEXT NOT NULL DEFAULT 'ghost',
    -- ghost: Interest signal (fake credits)
    -- soft_pledge: Committed, refundable
    -- hard_order: Non-refundable, 50% paid
    
    -- Payment
    upfront_amount DECIMAL(10, 2) DEFAULT 0, -- 50% at hard_order
    completion_amount DECIMAL(10, 2) DEFAULT 0, -- 50% on delivery
    upfront_paid BOOLEAN DEFAULT FALSE,
    completion_paid BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    requested_date DATE,
    requested_time TIME,
    scheduled_date DATE,
    scheduled_time TIME,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending',
    -- pending: Awaiting node activation
    -- scheduled: Node active, order scheduled
    -- in_progress: Being prepared
    -- ready: Ready for pickup/delivery
    -- completed: Delivered, completion payment collected
    -- cancelled: Cancelled (refund if soft_pledge)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demand Aggregation (Ghost Credits accumulation)
CREATE TABLE IF NOT EXISTS demand_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zip_code TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'meal_delivery', 'catering', 'baked_goods', etc.
    user_id UUID REFERENCES auth.users(id),
    
    -- Ghost credits used
    ghost_credits_spent INTEGER DEFAULT 0,
    marks_pledged DECIMAL(10, 2) DEFAULT 0,
    
    -- Demand details
    requested_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'one_time'
    max_price_willing DECIMAL(10, 2),
    dietary_requirements TEXT[],
    notes TEXT,
    
    -- Aggregation
    is_aggregated BOOLEAN DEFAULT FALSE,
    aggregated_into_node_id UUID REFERENCES service_nodes(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Node Activation Log (tracks the "shifting into gear" moment)
CREATE TABLE IF NOT EXISTS node_activation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES service_nodes(id) ON DELETE CASCADE,
    
    -- Metrics at activation
    presold_count INTEGER NOT NULL,
    presold_percent DECIMAL(5, 2) NOT NULL,
    total_demand_signals INTEGER,
    upfront_revenue DECIMAL(10, 2),
    
    -- The moment
    activation_timestamp TIMESTAMPTZ DEFAULT NOW(),
    activated_by UUID REFERENCES auth.users(id),
    
    -- Notes
    notes TEXT
);

-- Seed service node types for Let's Make Dinner
INSERT INTO service_node_types (code, name, description, capacity_unit, min_presale_percent)
VALUES 
    ('lmd_kitchen', 'Let''s Make Dinner Kitchen', 'Community kitchen node for meal preparation', 'meals', 50),
    ('lmd_delivery', 'Let''s Make Dinner Delivery', 'Delivery node for meal distribution', 'deliveries', 50),
    ('lmb_bakery', 'Let''s Make Bread Bakery', 'Community bakery node for baked goods', 'items', 50),
    ('lgg_hub', 'Let''s Get Groceries Hub', 'Grocery coordination and distribution hub', 'orders', 50),
    ('lgs_shop', 'Let''s Go Shopping Store', 'Community retail coordination node', 'orders', 50)
ON CONFLICT (code) DO NOTHING;

-- Function to calculate activation threshold
CREATE OR REPLACE FUNCTION calculate_activation_threshold()
RETURNS TRIGGER AS $$
BEGIN
    NEW.activation_threshold := CEIL(NEW.weekly_capacity * 0.5);
    NEW.reserved_capacity := CEIL(NEW.weekly_capacity * 0.5);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate thresholds
DROP TRIGGER IF EXISTS set_activation_threshold ON service_nodes;
CREATE TRIGGER set_activation_threshold
    BEFORE INSERT OR UPDATE OF weekly_capacity ON service_nodes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_activation_threshold();

-- Function to check if node should activate
CREATE OR REPLACE FUNCTION check_node_activation()
RETURNS TRIGGER AS $$
DECLARE
    node_record RECORD;
    presold_count INTEGER;
BEGIN
    -- Get the node
    SELECT * INTO node_record FROM service_nodes WHERE id = NEW.node_id;
    
    -- Only check if node is pending activation
    IF node_record.status != 'pending_activation' THEN
        RETURN NEW;
    END IF;
    
    -- Count hard orders for this node
    SELECT COUNT(*) INTO presold_count
    FROM node_preorders
    WHERE node_id = NEW.node_id
    AND phase = 'hard_order'
    AND status = 'pending';
    
    -- Check if threshold reached
    IF presold_count >= node_record.activation_threshold THEN
        -- Activate the node!
        UPDATE service_nodes
        SET status = 'activating',
            presold_capacity = presold_count,
            activation_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = NEW.node_id;
        
        -- Log the activation
        INSERT INTO node_activation_log (
            node_id,
            presold_count,
            presold_percent,
            upfront_revenue,
            notes
        )
        SELECT 
            NEW.node_id,
            presold_count,
            (presold_count::DECIMAL / node_record.activation_threshold) * 100,
            SUM(upfront_amount),
            'Automatic activation: 50% threshold reached'
        FROM node_preorders
        WHERE node_id = NEW.node_id
        AND phase = 'hard_order';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check activation on new hard orders
DROP TRIGGER IF EXISTS check_activation_on_preorder ON node_preorders;
CREATE TRIGGER check_activation_on_preorder
    AFTER INSERT OR UPDATE OF phase ON node_preorders
    FOR EACH ROW
    WHEN (NEW.phase = 'hard_order')
    EXECUTE FUNCTION check_node_activation();

-- View for node status dashboard
DROP VIEW IF EXISTS node_status_dashboard;
CREATE OR REPLACE VIEW node_status_dashboard AS
SELECT 
    sn.id,
    sn.name,
    sn.zip_code,
    sn.city,
    sn.state,
    sn.infrastructure_type,
    sn.weekly_capacity,
    sn.activation_threshold,
    sn.status,
    snt.name as node_type_name,
    snt.capacity_unit,
    
    -- Demand metrics
    (SELECT COUNT(*) FROM demand_signals ds WHERE ds.zip_code = sn.zip_code AND NOT ds.is_aggregated) as pending_demand_signals,
    
    -- Pre-order metrics
    (SELECT COUNT(*) FROM node_preorders np WHERE np.node_id = sn.id AND np.phase = 'ghost') as ghost_interest,
    (SELECT COUNT(*) FROM node_preorders np WHERE np.node_id = sn.id AND np.phase = 'soft_pledge') as soft_pledges,
    (SELECT COUNT(*) FROM node_preorders np WHERE np.node_id = sn.id AND np.phase = 'hard_order') as hard_orders,
    
    -- Progress to activation
    CASE 
        WHEN sn.activation_threshold > 0 THEN
            ROUND(
                (SELECT COUNT(*)::DECIMAL FROM node_preorders np 
                 WHERE np.node_id = sn.id AND np.phase = 'hard_order') 
                / sn.activation_threshold * 100, 1
            )
        ELSE 0
    END as activation_progress_percent,
    
    -- Revenue metrics
    (SELECT COALESCE(SUM(upfront_amount), 0) FROM node_preorders np 
     WHERE np.node_id = sn.id AND np.upfront_paid = TRUE) as collected_upfront,
    
    -- Leadership
    (SELECT display_name FROM profiles p 
     JOIN node_leadership nl ON nl.user_id = p.id 
     WHERE nl.node_id = sn.id AND nl.role = 'captain' AND nl.is_active = TRUE
     LIMIT 1) as captain_name

FROM service_nodes sn
LEFT JOIN service_node_types snt ON sn.node_type_id = snt.id;

-- RLS Policies
ALTER TABLE service_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;

-- Anyone can view active nodes
CREATE POLICY "Anyone can view active nodes"
    ON service_nodes FOR SELECT
    USING (status IN ('active', 'activating', 'pending_activation'));

-- Node owners and captains can update their nodes
CREATE POLICY "Owners and captains can update nodes"
    ON service_nodes FOR UPDATE
    USING (
        auth.uid() = owner_id 
        OR auth.uid() = captain_id
        OR EXISTS (
            SELECT 1 FROM node_leadership nl 
            WHERE nl.node_id = id 
            AND nl.user_id = auth.uid() 
            AND nl.role IN ('captain', 'xo')
        )
    );

-- Anyone can create demand signals
CREATE POLICY "Anyone can create demand signals"
    ON demand_signals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own demand signals
CREATE POLICY "Users can view own demand signals"
    ON demand_signals FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create and view their own preorders
CREATE POLICY "Users can manage own preorders"
    ON node_preorders FOR ALL
    USING (auth.uid() = user_id);

-- Leadership visible to node members
CREATE POLICY "Leadership visible to members"
    ON node_leadership FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM service_nodes sn 
            WHERE sn.id = node_id 
            AND (sn.owner_id = auth.uid() OR sn.captain_id = auth.uid())
        )
        OR user_id = auth.uid()
    );

COMMENT ON TABLE service_nodes IS 'Cold Start Theseus: Decentralized service nodes with 50% pre-sale activation threshold';
COMMENT ON TABLE node_preorders IS 'Three-phase demand crystallization: Ghost → Soft Pledge → Hard Order';
COMMENT ON TABLE demand_signals IS 'Ghost Credits demand aggregation before node creation';

-- ========== FROM: 20260221000003_sponsorship_cascade_system.sql ==========
-- SPONSORSHIP CASCADE SYSTEM
-- ===========================
-- 60/10/20/10 Patent Allocation with Cascade Sponsorship
-- 
-- Allocation:
-- - 60% Platform & Sponsors (primes the well)
-- - 10% Patent Buckets (member voting, 5K max per person)
-- - 20% Founder Reserve (development, emergency)
-- - 10% Prosecution Fund (legal + implementation)
--
-- Key Features:
-- - 25 Credit minimum to sponsor
-- - 5K Sponsor Badge for community seeders
-- - $10M cap with reset cycle
-- - Cloth Pouches (Forever Stamp model)

-- Patent Allocation Pools
CREATE TABLE IF NOT EXISTS patent_allocation_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_code TEXT UNIQUE NOT NULL,
    pool_name TEXT NOT NULL,
    allocation_percent DECIMAL(5, 2) NOT NULL,
    description TEXT,
    
    -- Pool limits
    cap_amount DECIMAL(15, 2), -- $10M for platform pool
    current_allocated DECIMAL(15, 2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    cycle_number INTEGER DEFAULT 1, -- Increments at cap reset
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the four allocation pools
INSERT INTO patent_allocation_pools (pool_code, pool_name, allocation_percent, description, cap_amount)
VALUES 
    ('platform_sponsors', 'Platform & Sponsors', 60.00, 'Operations + Cascade Pool (primes the well)', 10000000),
    ('patent_buckets', 'Patent Buckets', 10.00, 'Member voting, 5K max per person', NULL),
    ('founder_reserve', 'Founder Reserve', 20.00, 'Development reserve, emergency protection', NULL),
    ('prosecution_fund', 'Prosecution Fund', 10.00, 'Legal fees + Implementation costs', NULL)
ON CONFLICT (pool_code) DO NOTHING;

-- Sponsorship Records
CREATE TABLE IF NOT EXISTS sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sponsor info
    sponsor_id UUID REFERENCES auth.users(id),
    sponsor_type TEXT NOT NULL DEFAULT 'member', -- 'founder', 'member', 'cascade'
    
    -- Recipient info
    recipient_id UUID REFERENCES auth.users(id),
    recipient_email TEXT, -- For pending invitations
    
    -- Amount
    credit_amount DECIMAL(10, 2) NOT NULL,
    joule_equivalent DECIMAL(10, 2),
    
    -- Source tracking
    source_sponsorship_id UUID REFERENCES sponsorships(id), -- For cascade tracking
    pool_id UUID REFERENCES patent_allocation_pools(id),
    cycle_number INTEGER DEFAULT 1,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending',
    -- pending: Awaiting recipient claim
    -- active: Recipient has claimed
    -- split: Recipient has split to others
    -- expired: Unclaimed after timeout
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

-- Sponsorship Splits (tracking cascade)
CREATE TABLE IF NOT EXISTS sponsorship_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_sponsorship_id UUID REFERENCES sponsorships(id) ON DELETE CASCADE,
    target_sponsorship_id UUID REFERENCES sponsorships(id),
    split_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5K Sponsor Badges
CREATE TABLE IF NOT EXISTS sponsor_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    badge_type TEXT NOT NULL DEFAULT 'community_seeder',
    
    -- Metrics
    total_sponsored DECIMAL(10, 2) NOT NULL,
    people_sponsored INTEGER NOT NULL,
    cascade_depth INTEGER DEFAULT 0, -- How many levels deep their sponsorships went
    
    -- Badge earned
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Display
    is_visible BOOLEAN DEFAULT TRUE
);

-- Patent Bucket Allocations (10% pool, 5K max per person)
CREATE TABLE IF NOT EXISTS patent_bucket_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    bucket_id TEXT NOT NULL, -- 'crown_jewels', 'platform_tech', 'game_systems', etc.
    
    -- Allocation
    joule_amount DECIMAL(10, 2) NOT NULL,
    credit_equivalent DECIMAL(10, 2) NOT NULL,
    
    -- Voting
    vote_weight DECIMAL(10, 4), -- Proportional to contribution
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: 5K max per person across all buckets
    CONSTRAINT max_5k_per_person CHECK (credit_equivalent <= 5000)
);

-- Cloth Pouches (Forever Stamp model)
CREATE TABLE IF NOT EXISTS cloth_pouches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    
    -- Creation
    credit_amount DECIMAL(10, 2) NOT NULL, -- Credits committed
    service_units DECIMAL(10, 2) NOT NULL, -- Service amount locked in
    creation_rate DECIMAL(10, 4) NOT NULL, -- Rate at creation time
    
    -- Purpose
    purpose TEXT NOT NULL, -- 'patent_purchase', 'sponsorship', 'service_prepay'
    target_id UUID, -- What this pouch is for (patent, bucket, etc.)
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active',
    -- active: Can be invoked
    -- invoked: Has been used
    -- expired: Cancelled/expired
    
    -- Invocation
    invoked_at TIMESTAMPTZ,
    invoked_for TEXT, -- Description of what it was used for
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Non-transferable (enforced by user_id)
    CONSTRAINT non_transferable CHECK (user_id IS NOT NULL)
);

-- Sponsorship Cascade View
DROP VIEW IF EXISTS sponsorship_cascade_view;
CREATE OR REPLACE VIEW sponsorship_cascade_view AS
WITH RECURSIVE cascade AS (
    -- Base case: direct sponsorships from founder/platform
    SELECT 
        s.id,
        s.sponsor_id,
        s.recipient_id,
        s.credit_amount,
        s.status,
        1 as depth,
        ARRAY[s.id] as path
    FROM sponsorships s
    WHERE s.source_sponsorship_id IS NULL
    
    UNION ALL
    
    -- Recursive case: sponsorships that came from other sponsorships
    SELECT 
        s.id,
        s.sponsor_id,
        s.recipient_id,
        s.credit_amount,
        s.status,
        c.depth + 1,
        c.path || s.id
    FROM sponsorships s
    JOIN cascade c ON s.source_sponsorship_id = c.id
    WHERE NOT s.id = ANY(c.path) -- Prevent cycles
)
SELECT 
    c.*,
    p_sponsor.display_name as sponsor_name,
    p_recipient.display_name as recipient_name
FROM cascade c
LEFT JOIN profiles p_sponsor ON c.sponsor_id = p_sponsor.id
LEFT JOIN profiles p_recipient ON c.recipient_id = p_recipient.id;

-- Function to check if user can sponsor
CREATE OR REPLACE FUNCTION can_sponsor(p_user_id UUID, p_amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
    user_credits DECIMAL;
BEGIN
    -- Get user's available credits
    SELECT COALESCE(credits, 0) INTO user_credits
    FROM user_balances
    WHERE user_id = p_user_id;
    
    -- Must have at least 25 credits AND the amount they want to sponsor
    RETURN user_credits >= 25 AND user_credits >= p_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to create a sponsorship
CREATE OR REPLACE FUNCTION create_sponsorship(
    p_sponsor_id UUID,
    p_recipient_email TEXT,
    p_amount DECIMAL,
    p_source_sponsorship_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_sponsorship_id UUID;
    pool_id UUID;
BEGIN
    -- Validate sponsor can afford this
    IF NOT can_sponsor(p_sponsor_id, p_amount) THEN
        RAISE EXCEPTION 'Insufficient credits or below 25 credit minimum';
    END IF;
    
    -- Get platform pool ID
    SELECT id INTO pool_id FROM patent_allocation_pools WHERE pool_code = 'platform_sponsors';
    
    -- Create the sponsorship
    INSERT INTO sponsorships (
        sponsor_id,
        recipient_email,
        credit_amount,
        source_sponsorship_id,
        pool_id,
        sponsor_type
    )
    VALUES (
        p_sponsor_id,
        p_recipient_email,
        p_amount,
        p_source_sponsorship_id,
        pool_id,
        CASE WHEN p_source_sponsorship_id IS NOT NULL THEN 'cascade' ELSE 'member' END
    )
    RETURNING id INTO new_sponsorship_id;
    
    -- Deduct from sponsor's balance
    UPDATE user_balances
    SET credits = credits - p_amount,
        updated_at = NOW()
    WHERE user_id = p_sponsor_id;
    
    -- Update pool allocation
    UPDATE patent_allocation_pools
    SET current_allocated = current_allocated + p_amount,
        updated_at = NOW()
    WHERE id = pool_id;
    
    -- Check for 5K badge
    PERFORM check_sponsor_badge(p_sponsor_id);
    
    RETURN new_sponsorship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award 5K sponsor badge
CREATE OR REPLACE FUNCTION check_sponsor_badge(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    total_sponsored DECIMAL;
    people_count INTEGER;
    max_depth INTEGER;
BEGIN
    -- Calculate total sponsored
    SELECT 
        COALESCE(SUM(credit_amount), 0),
        COUNT(DISTINCT recipient_id)
    INTO total_sponsored, people_count
    FROM sponsorships
    WHERE sponsor_id = p_user_id
    AND status IN ('active', 'split');
    
    -- Calculate cascade depth
    SELECT COALESCE(MAX(depth), 0) INTO max_depth
    FROM sponsorship_cascade_view
    WHERE sponsor_id = p_user_id;
    
    -- Award badge if >= 5000
    IF total_sponsored >= 5000 THEN
        INSERT INTO sponsor_badges (user_id, total_sponsored, people_sponsored, cascade_depth)
        VALUES (p_user_id, total_sponsored, people_count, max_depth)
        ON CONFLICT (user_id) DO UPDATE
        SET total_sponsored = EXCLUDED.total_sponsored,
            people_sponsored = EXCLUDED.people_sponsored,
            cascade_depth = EXCLUDED.cascade_depth;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create a cloth pouch
CREATE OR REPLACE FUNCTION create_cloth_pouch(
    p_user_id UUID,
    p_credit_amount DECIMAL,
    p_purpose TEXT,
    p_target_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_pouch_id UUID;
    current_rate DECIMAL := 1.0; -- In production, this would come from HIVI
BEGIN
    -- Create the pouch
    INSERT INTO cloth_pouches (
        user_id,
        credit_amount,
        service_units,
        creation_rate,
        purpose,
        target_id
    )
    VALUES (
        p_user_id,
        p_credit_amount,
        p_credit_amount * current_rate, -- Same service amount as credits
        current_rate,
        p_purpose,
        p_target_id
    )
    RETURNING id INTO new_pouch_id;
    
    RETURN new_pouch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to invoke a cloth pouch
CREATE OR REPLACE FUNCTION invoke_cloth_pouch(
    p_pouch_id UUID,
    p_user_id UUID,
    p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    pouch_record RECORD;
BEGIN
    -- Get and lock the pouch
    SELECT * INTO pouch_record
    FROM cloth_pouches
    WHERE id = p_pouch_id
    AND user_id = p_user_id
    AND status = 'active'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Mark as invoked
    UPDATE cloth_pouches
    SET status = 'invoked',
        invoked_at = NOW(),
        invoked_for = p_description
    WHERE id = p_pouch_id;
    
    -- Add the service units to user's balance as Joules
    UPDATE user_balances
    SET joules = COALESCE(joules, 0) + pouch_record.service_units,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Pool cap reset function
CREATE OR REPLACE FUNCTION check_pool_cap_reset()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if platform pool hit cap
    IF NEW.pool_code = 'platform_sponsors' AND NEW.current_allocated >= NEW.cap_amount THEN
        -- Reset the pool
        NEW.current_allocated := 0;
        NEW.cycle_number := NEW.cycle_number + 1;
        NEW.updated_at := NOW();
        
        -- Log the reset
        RAISE NOTICE 'Platform pool reached $10M cap. Resetting to cycle %', NEW.cycle_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pool cap reset
DROP TRIGGER IF EXISTS pool_cap_reset_trigger ON patent_allocation_pools;
CREATE TRIGGER pool_cap_reset_trigger
    BEFORE UPDATE OF current_allocated ON patent_allocation_pools
    FOR EACH ROW
    EXECUTE FUNCTION check_pool_cap_reset();

-- RLS Policies
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE patent_bucket_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloth_pouches ENABLE ROW LEVEL SECURITY;

-- Users can view sponsorships they're involved in
CREATE POLICY "Users can view own sponsorships"
    ON sponsorships FOR SELECT
    USING (auth.uid() = sponsor_id OR auth.uid() = recipient_id);

-- Users can create sponsorships
CREATE POLICY "Users can create sponsorships"
    ON sponsorships FOR INSERT
    WITH CHECK (auth.uid() = sponsor_id);

-- Badges are public
CREATE POLICY "Badges are public"
    ON sponsor_badges FOR SELECT
    USING (is_visible = TRUE);

-- Users can view own bucket allocations
CREATE POLICY "Users can view own bucket allocations"
    ON patent_bucket_allocations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage own cloth pouches
CREATE POLICY "Users can manage own cloth pouches"
    ON cloth_pouches FOR ALL
    USING (auth.uid() = user_id);

COMMENT ON TABLE sponsorships IS 'Sponsorship Cascade: 25 Credit minimum, tracks cascade depth';
COMMENT ON TABLE sponsor_badges IS '5K Sponsor Badge: Community Seeder recognition';
COMMENT ON TABLE cloth_pouches IS 'Cloth Pouches: Forever Stamp model for prepaid service access';
COMMENT ON TABLE patent_allocation_pools IS '60/10/20/10 allocation with $10M cap reset';

-- ========== FROM: 20260223000000_defense_klaus_cold_start.sql ==========
-- Defense Klaus Cold Start Plan 001
-- Email-only registration with proxy identifiers for privacy

-- Voucher records table
CREATE TABLE IF NOT EXISTS public.defense_klaus_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proxy_id TEXT UNIQUE NOT NULL, -- DF-0000001 format
  email_hash TEXT NOT NULL, -- SHA-256 hash of email for lookup
  voucher_type TEXT CHECK (voucher_type IN ('bracelet', 'membership', 'both')) DEFAULT 'both',
  is_donated BOOLEAN DEFAULT false, -- Platform donation or user donation
  donor_user_id UUID REFERENCES auth.users(id), -- NULL for platform donations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  qr_code_data TEXT NOT NULL,
  
  -- Prevent duplicate emails
  CONSTRAINT unique_email_hash UNIQUE (email_hash)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_dk_vouchers_proxy_id ON public.defense_klaus_vouchers(proxy_id);
CREATE INDEX IF NOT EXISTS idx_dk_vouchers_email_hash ON public.defense_klaus_vouchers(email_hash);
CREATE INDEX IF NOT EXISTS idx_dk_vouchers_is_donated ON public.defense_klaus_vouchers(is_donated);

-- Ledger transactions for tracking (if not exists)
CREATE TABLE IF NOT EXISTS public.ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'credits',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ledger
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.ledger_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON public.ledger_transactions(transaction_type);

-- View for cold start stats
DROP VIEW IF EXISTS public.defense_klaus_cold_start_stats;
CREATE OR REPLACE VIEW public.defense_klaus_cold_start_stats AS
SELECT 
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE is_donated = true) as free_signups,
  COUNT(*) FILTER (WHERE is_donated = false) as paid_signups,
  COUNT(*) FILTER (WHERE donor_user_id IS NOT NULL) as user_donated,
  COUNT(*) FILTER (WHERE donor_user_id IS NULL AND is_donated = true) as platform_donated,
  5000 - COUNT(*) as remaining_slots,
  ROUND((COUNT(*)::numeric / 5000) * 100, 2) as percent_complete
FROM public.defense_klaus_vouchers;

-- RLS policies
ALTER TABLE public.defense_klaus_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert vouchers (for registration)
CREATE POLICY "Anyone can register for voucher" ON public.defense_klaus_vouchers
  FOR INSERT WITH CHECK (true);

-- Only system can read vouchers (privacy)
CREATE POLICY "System can read vouchers" ON public.defense_klaus_vouchers
  FOR SELECT USING (auth.role() = 'service_role');

-- Users can see their own donations
CREATE POLICY "Users can see own donations" ON public.defense_klaus_vouchers
  FOR SELECT USING (donor_user_id = auth.uid());

-- Ledger: users can see their own transactions
CREATE POLICY "Users can see own ledger" ON public.ledger_transactions
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert ledger" ON public.ledger_transactions
  FOR INSERT WITH CHECK (true);

-- Function to get next proxy ID
CREATE OR REPLACE FUNCTION get_next_dk_proxy_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(proxy_id FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.defense_klaus_vouchers;
  
  RETURN 'DF-' || LPAD(next_num::TEXT, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- Lawyer bounty board table
CREATE TABLE IF NOT EXISTS public.defense_klaus_lawyer_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  practice_areas TEXT[], -- e.g., ['criminal defense', 'civil rights']
  compensation_type TEXT CHECK (compensation_type IN ('hourly', 'flat_fee', 'contingency', 'pro_bono')),
  compensation_details TEXT,
  requirements TEXT[],
  is_active BOOLEAN DEFAULT true,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyer applications
CREATE TABLE IF NOT EXISTS public.defense_klaus_lawyer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID REFERENCES public.defense_klaus_lawyer_bounties(id),
  user_id UUID REFERENCES auth.users(id),
  bar_number TEXT,
  jurisdictions TEXT[],
  experience_years INTEGER,
  statement TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial lawyer bounty
INSERT INTO public.defense_klaus_lawyer_bounties (
  title,
  description,
  practice_areas,
  compensation_type,
  compensation_details,
  requirements
) VALUES (
  'Defense Klaus Legal Defense Fund - Founding Attorneys',
  'Join the founding team of attorneys for the Defense Klaus Legal Defense Fund. Provide legal defense services to members who purchase the Defense Klaus bracelet. Pooled fund model ensures sustainable compensation.',
  ARRAY['criminal defense', 'civil rights', 'personal injury', 'family law'],
  'hourly',
  'Competitive hourly rates paid from pooled fund. Rates negotiated based on jurisdiction and experience. Minimum guaranteed hours for active cases.',
  ARRAY[
    'Active bar membership in good standing',
    'Minimum 3 years practice experience',
    'Malpractice insurance',
    'Commitment to Cost+20% pricing model',
    'Agreement to platform ethics standards'
  ]
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.defense_klaus_vouchers IS 'Defense Klaus Cold Start Plan 001 - Email-only voucher registration with privacy-preserving proxy IDs';

-- Daisy Chain Referral System
CREATE TABLE IF NOT EXISTS public.defense_klaus_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_proxy_id TEXT NOT NULL,
  recipient_email_hash TEXT NOT NULL,
  slot_number INTEGER CHECK (slot_number IN (1, 2)) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Each referrer can only use each slot once
  CONSTRAINT unique_referrer_slot UNIQUE (referrer_proxy_id, slot_number)
);

-- Index for referral lookups
CREATE INDEX IF NOT EXISTS idx_dk_referrals_referrer ON public.defense_klaus_referrals(referrer_proxy_id);
CREATE INDEX IF NOT EXISTS idx_dk_referrals_status ON public.defense_klaus_referrals(status);

-- RLS for referrals
ALTER TABLE public.defense_klaus_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create referrals" ON public.defense_klaus_referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update referral status" ON public.defense_klaus_referrals
  FOR UPDATE USING (true);

-- View for daisy chain stats
DROP VIEW IF EXISTS public.defense_klaus_daisy_chain_stats;
CREATE OR REPLACE VIEW public.defense_klaus_daisy_chain_stats AS
SELECT 
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_referrals,
  COUNT(DISTINCT referrer_proxy_id) as unique_referrers,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'accepted')::numeric / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as acceptance_rate
FROM public.defense_klaus_referrals;

COMMENT ON TABLE public.defense_klaus_referrals IS 'Defense Klaus Daisy Chain - Each signup gets 2 gift passes to share';

-- ========== FROM: 20260223000003_beacon_navigation_system.sql ==========
-- =====================================================
-- BEACON BREADCRUMB NAVIGATION SYSTEM
-- Innovation: User-placed waypoints with portal-back
-- =====================================================

-- Beacons table (user-placed navigation markers)
CREATE TABLE IF NOT EXISTS beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Beacon identification
  beacon_color TEXT NOT NULL CHECK (beacon_color IN ('green', 'blue', 'yellow', 'red', 'purple', 'orange')),
  beacon_number INTEGER, -- Sequential per user (auto-assigned)
  
  -- Location
  path TEXT NOT NULL, -- URL path where beacon was dropped
  page_title TEXT, -- Human-readable page title
  
  -- Content
  note TEXT, -- User's note about why they marked this
  
  -- Orange Protocol (custom beacons)
  orange_subtype TEXT CHECK (orange_subtype IN (
    'game_marker', 'share_person', 'social_cue', 'gift',
    'treasure', 'learning', 'trade_route', 'custom'
  )),
  orange_payload JSONB, -- Custom data for orange beacons
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_orange CHECK (
    (beacon_color = 'orange' AND orange_subtype IS NOT NULL) OR
    (beacon_color != 'orange' AND orange_subtype IS NULL)
  )
);

-- Auto-assign beacon numbers per user
CREATE OR REPLACE FUNCTION assign_beacon_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(beacon_number), 0) + 1
  INTO NEW.beacon_number
  FROM beacons
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_number_trigger ON beacons;
CREATE TRIGGER beacon_number_trigger
  BEFORE INSERT ON beacons
  FOR EACH ROW
  EXECUTE FUNCTION assign_beacon_number();

-- Indexes for beacons (drop first to allow re-running)
DROP INDEX IF EXISTS idx_beacons_user;
DROP INDEX IF EXISTS idx_beacons_color;
DROP INDEX IF EXISTS idx_beacons_path;
DROP INDEX IF EXISTS idx_beacons_created;

CREATE INDEX idx_beacons_user ON beacons(user_id);
CREATE INDEX idx_beacons_color ON beacons(beacon_color);
CREATE INDEX idx_beacons_path ON beacons(path);
CREATE INDEX idx_beacons_created ON beacons(created_at DESC);

-- =====================================================
-- BEACON RUN GAMES (Ghost Mode Only)
-- =====================================================

-- Beacon Run courses (user-created games)
CREATE TABLE IF NOT EXISTS beacon_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Course info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  
  -- Route data
  beacon_ids UUID[] NOT NULL, -- Ordered array of beacon IDs
  total_beacons INTEGER NOT NULL,
  estimated_minutes INTEGER,
  
  -- Competition settings
  ante_credits INTEGER DEFAULT 0, -- Entry fee
  prize_pool_credits INTEGER DEFAULT 0,
  
  -- Stats
  times_started INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  best_time_user_id UUID REFERENCES profiles(id),
  
  -- Publication
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Ghost Mode requirement (always true for Beacon Runs)
  requires_ghost_mode BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate slug for beacon runs
CREATE OR REPLACE FUNCTION generate_beacon_run_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || 
                SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_run_slug_trigger ON beacon_runs;
CREATE TRIGGER beacon_run_slug_trigger
  BEFORE INSERT ON beacon_runs
  FOR EACH ROW
  EXECUTE FUNCTION generate_beacon_run_slug();

-- Beacon Run progress (tracking user attempts)
CREATE TABLE IF NOT EXISTS beacon_run_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  run_id UUID NOT NULL REFERENCES beacon_runs(id),
  
  -- Progress tracking
  beacons_reached UUID[] DEFAULT '{}',
  current_beacon_index INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  elapsed_seconds INTEGER DEFAULT 0,
  
  -- Ghost Mode verification
  ghost_session_id UUID, -- Links to ghost session for validation
  
  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  
  UNIQUE(user_id, run_id, started_at)
);

-- Beacon Run leaderboard entries
CREATE TABLE IF NOT EXISTS beacon_run_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES beacon_runs(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Performance
  completion_time_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ranking
  rank INTEGER,
  
  -- Crow Feathers earned
  crow_feathers_earned INTEGER DEFAULT 0,
  
  UNIQUE(run_id, user_id, completed_at)
);

-- =====================================================
-- TREASURE MAPS (Tradeable Journey Records)
-- =====================================================

CREATE TABLE IF NOT EXISTS treasure_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Map info
  name TEXT NOT NULL,
  description TEXT,
  map_type TEXT CHECK (map_type IN (
    'pathway_guide', 'completionist', 'speedrun', 
    'hidden_path', 'beacon_run_course'
  )),
  
  -- Content
  beacon_ids UUID[] NOT NULL, -- Beacons included in this map
  route_data JSONB, -- Additional route information
  
  -- Trading
  price_marks INTEGER DEFAULT 0, -- Price in Marks
  is_for_sale BOOLEAN DEFAULT FALSE,
  times_sold INTEGER DEFAULT 0,
  
  -- Stats
  rating_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Map purchases
CREATE TABLE IF NOT EXISTS treasure_map_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES treasure_maps(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(map_id, buyer_id)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_run_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_run_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_map_purchases ENABLE ROW LEVEL SECURITY;

-- Beacons: Users can only see/manage their own
CREATE POLICY "Users can view own beacons" ON beacons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own beacons" ON beacons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own beacons" ON beacons
  FOR DELETE USING (auth.uid() = user_id);

-- Beacon Runs: Anyone can view published, creators can manage
CREATE POLICY "Anyone can view published beacon runs" ON beacon_runs
  FOR SELECT USING (is_published = TRUE OR auth.uid() = creator_id);

CREATE POLICY "Users can create beacon runs" ON beacon_runs
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own beacon runs" ON beacon_runs
  FOR UPDATE USING (auth.uid() = creator_id);

-- Beacon Run Progress: Users can only see/manage their own
CREATE POLICY "Users can view own progress" ON beacon_run_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON beacon_run_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON beacon_run_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard: Anyone can view
CREATE POLICY "Anyone can view leaderboard" ON beacon_run_leaderboard
  FOR SELECT USING (TRUE);

-- Treasure Maps: Anyone can view for-sale, creators can manage
CREATE POLICY "Anyone can view for-sale maps" ON treasure_maps
  FOR SELECT USING (is_for_sale = TRUE OR auth.uid() = creator_id);

CREATE POLICY "Users can create maps" ON treasure_maps
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own maps" ON treasure_maps
  FOR UPDATE USING (auth.uid() = creator_id);

-- Map Purchases: Users can view their own
CREATE POLICY "Users can view own purchases" ON treasure_map_purchases
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create purchases" ON treasure_map_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update beacon run stats when completed
CREATE OR REPLACE FUNCTION update_beacon_run_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    -- Update run stats
    UPDATE beacon_runs
    SET 
      times_completed = times_completed + 1,
      best_time_seconds = CASE 
        WHEN best_time_seconds IS NULL OR NEW.elapsed_seconds < best_time_seconds 
        THEN NEW.elapsed_seconds 
        ELSE best_time_seconds 
      END,
      best_time_user_id = CASE 
        WHEN best_time_seconds IS NULL OR NEW.elapsed_seconds < best_time_seconds 
        THEN NEW.user_id 
        ELSE best_time_user_id 
      END
    WHERE id = NEW.run_id;
    
    -- Insert leaderboard entry
    INSERT INTO beacon_run_leaderboard (run_id, user_id, completion_time_seconds)
    VALUES (NEW.run_id, NEW.user_id, NEW.elapsed_seconds);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_run_completion_trigger ON beacon_run_progress;
CREATE TRIGGER beacon_run_completion_trigger
  AFTER UPDATE ON beacon_run_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_beacon_run_stats();

-- Increment times_started when progress created
CREATE OR REPLACE FUNCTION increment_run_started()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE beacon_runs
  SET times_started = times_started + 1
  WHERE id = NEW.run_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS beacon_run_started_trigger ON beacon_run_progress;
CREATE TRIGGER beacon_run_started_trigger
  AFTER INSERT ON beacon_run_progress
  FOR EACH ROW
  EXECUTE FUNCTION increment_run_started();

-- =====================================================
-- INDEXES (drop first to allow re-running)
-- =====================================================

DROP INDEX IF EXISTS idx_beacon_runs_creator;
DROP INDEX IF EXISTS idx_beacon_runs_published;
DROP INDEX IF EXISTS idx_beacon_runs_featured;
DROP INDEX IF EXISTS idx_beacon_run_progress_user;
DROP INDEX IF EXISTS idx_beacon_run_progress_run;
DROP INDEX IF EXISTS idx_beacon_run_leaderboard_run;
DROP INDEX IF EXISTS idx_beacon_run_leaderboard_time;
DROP INDEX IF EXISTS idx_treasure_maps_creator;
DROP INDEX IF EXISTS idx_treasure_maps_for_sale;

CREATE INDEX idx_beacon_runs_creator ON beacon_runs(creator_id);
CREATE INDEX idx_beacon_runs_published ON beacon_runs(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_beacon_runs_featured ON beacon_runs(is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_beacon_run_progress_user ON beacon_run_progress(user_id);
CREATE INDEX idx_beacon_run_progress_run ON beacon_run_progress(run_id);

CREATE INDEX idx_beacon_run_leaderboard_run ON beacon_run_leaderboard(run_id);
CREATE INDEX idx_beacon_run_leaderboard_time ON beacon_run_leaderboard(completion_time_seconds);

CREATE INDEX idx_treasure_maps_creator ON treasure_maps(creator_id);
CREATE INDEX idx_treasure_maps_for_sale ON treasure_maps(is_for_sale) WHERE is_for_sale = TRUE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE beacons IS 'User-placed navigation markers for the Beacon Breadcrumb system';
COMMENT ON TABLE beacon_runs IS 'User-created Beacon Run game courses (Ghost Mode only)';
COMMENT ON TABLE beacon_run_progress IS 'Tracks user progress through Beacon Run courses';
COMMENT ON TABLE beacon_run_leaderboard IS 'Completion times and rankings for Beacon Runs';
COMMENT ON TABLE treasure_maps IS 'Tradeable journey records created from beacon trails';

-- ========== FROM: 20260223000005_spotlight_logbook_leaderboards.sql ==========
-- ============================================================================
-- SPOTLIGHT, LOGBOOK, PORTFOLIO & LEADERBOARDS SYSTEM
-- Migration: 20260223000005
-- Date: February 23, 2026
-- ============================================================================

-- ============================================================================
-- PART 1: SPOTLIGHT RANGER MODE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_spotlight_prefs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ranger_mode_enabled BOOLEAN DEFAULT TRUE,
  dismissed_spotlights TEXT[] DEFAULT '{}',
  last_reset TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_spotlight_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_spotlight_prefs ON user_spotlight_prefs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 2: PORTFOLIO SYSTEM (Members Only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_portfolios (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_data JSONB DEFAULT '{}',
  quantity DECIMAL(10,2) DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  is_treasure_map BOOLEAN DEFAULT FALSE,
  map_data JSONB
);

CREATE TABLE IF NOT EXISTS portfolio_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  relationship TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS portfolio_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_portfolios(user_id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Session logs for export
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  entries JSONB DEFAULT '[]',
  collected_items JSONB DEFAULT '[]',
  areas_discovered TEXT[] DEFAULT '{}',
  exported_at TIMESTAMPTZ,
  emailed_at TIMESTAMPTZ
);

-- Free cue card tracking
CREATE TABLE IF NOT EXISTS user_free_cue_card (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  cue_card_id TEXT,
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID
);

-- RLS for portfolio tables
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_free_cue_card ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_portfolio ON user_portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_inventory ON portfolio_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_notes ON portfolio_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_maps ON portfolio_maps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_contacts ON portfolio_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_achievements ON portfolio_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_sessions ON session_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_free_card ON user_free_cue_card FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: CROW FEATHERS (Permanent for all users)
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS crow_feather_number_seq START 1;

CREATE TABLE IF NOT EXISTS crow_feathers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL,
  record_value DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  time_bracket TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  feather_number INTEGER NOT NULL DEFAULT nextval('crow_feather_number_seq'),
  superseded_by INTEGER REFERENCES crow_feathers(id),
  UNIQUE(feather_number)
);

DROP INDEX IF EXISTS idx_crow_feathers_user;
DROP INDEX IF EXISTS idx_crow_feathers_category;

CREATE INDEX idx_crow_feathers_user ON crow_feathers(user_id);
CREATE INDEX idx_crow_feathers_category ON crow_feathers(category, time_bracket);

ALTER TABLE crow_feathers ENABLE ROW LEVEL SECURITY;

-- Anyone can view crow feathers (public leaderboard)
DROP POLICY IF EXISTS view_crow_feathers ON crow_feathers;
CREATE POLICY view_crow_feathers ON crow_feathers FOR SELECT USING (true);
-- Only system can insert (via function)
DROP POLICY IF EXISTS insert_crow_feathers ON crow_feathers;
CREATE POLICY insert_crow_feathers ON crow_feathers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 4: GHOST WORLD LEADERBOARDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ghost_leaderboard (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  time_bracket TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  record_value DECIMAL(12,2) NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  crow_feather_id INTEGER REFERENCES crow_feathers(id),
  UNIQUE(category, time_bracket)
);

DROP INDEX IF EXISTS idx_ghost_leaderboard_category;
CREATE INDEX idx_ghost_leaderboard_category ON ghost_leaderboard(category, time_bracket);

ALTER TABLE ghost_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public viewing
DROP POLICY IF EXISTS view_ghost_leaderboard ON ghost_leaderboard;
CREATE POLICY view_ghost_leaderboard ON ghost_leaderboard FOR SELECT USING (true);

-- ============================================================================
-- PART 5: REAL WORLD LEADERBOARDS (Members Only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS real_leaderboard (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  username TEXT NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  period_type TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  rank INTEGER,
  UNIQUE(category, user_id)
);

DROP INDEX IF EXISTS idx_real_leaderboard_category;
CREATE INDEX idx_real_leaderboard_category ON real_leaderboard(category, rank);

ALTER TABLE real_leaderboard ENABLE ROW LEVEL SECURITY;

-- Public viewing
DROP POLICY IF EXISTS view_real_leaderboard ON real_leaderboard;
CREATE POLICY view_real_leaderboard ON real_leaderboard FOR SELECT USING (true);

-- ============================================================================
-- PART 6: SESSION PURCHASES
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_duration_minutes INTEGER NOT NULL,
  items_preserved JSONB NOT NULL,
  price_paid DECIMAL(6,2) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_purchases ON session_purchases FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 7: FUNCTIONS
-- ============================================================================

-- Function to check and award crow feather for a new record
CREATE OR REPLACE FUNCTION check_and_award_crow_feather(
  p_user_id UUID,
  p_username TEXT,
  p_category TEXT,
  p_time_bracket TEXT,
  p_record_value DECIMAL,
  p_session_duration_minutes INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_existing_record RECORD;
  v_feather_id INTEGER;
BEGIN
  -- Check if there's an existing record for this category/bracket
  SELECT * INTO v_existing_record
  FROM ghost_leaderboard
  WHERE category = p_category AND time_bracket = p_time_bracket;

  -- For labyrinth_speed, lower is better; for everything else, higher is better
  IF v_existing_record IS NULL OR 
     (p_category = 'labyrinth_speed' AND p_record_value < v_existing_record.record_value) OR
     (p_category != 'labyrinth_speed' AND p_record_value > v_existing_record.record_value) THEN
    
    -- Award new crow feather
    INSERT INTO crow_feathers (user_id, category, record_value, session_duration_minutes, time_bracket)
    VALUES (p_user_id, p_category, p_record_value, p_session_duration_minutes, p_time_bracket)
    RETURNING id INTO v_feather_id;

    -- Mark old feather as superseded
    IF v_existing_record IS NOT NULL AND v_existing_record.crow_feather_id IS NOT NULL THEN
      UPDATE crow_feathers SET superseded_by = v_feather_id
      WHERE id = v_existing_record.crow_feather_id;
    END IF;

    -- Update or insert leaderboard entry
    INSERT INTO ghost_leaderboard (category, time_bracket, user_id, username, record_value, session_duration_minutes, crow_feather_id)
    VALUES (p_category, p_time_bracket, p_user_id, p_username, p_record_value, p_session_duration_minutes, v_feather_id)
    ON CONFLICT (category, time_bracket)
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      username = EXCLUDED.username,
      record_value = EXCLUDED.record_value,
      session_duration_minutes = EXCLUDED.session_duration_minutes,
      achieved_at = NOW(),
      crow_feather_id = EXCLUDED.crow_feather_id;

    RETURN v_feather_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get time bracket from session duration
CREATE OR REPLACE FUNCTION get_time_bracket(duration_minutes INTEGER) RETURNS TEXT AS $$
BEGIN
  IF duration_minutes < 15 THEN RETURN 'Under 15 minutes';
  ELSIF duration_minutes < 30 THEN RETURN '15-30 minutes';
  ELSIF duration_minutes < 60 THEN RETURN '30 min - 1 hour';
  ELSIF duration_minutes < 120 THEN RETURN '1-2 hours';
  ELSIF duration_minutes < 180 THEN RETURN '2-3 hours';
  ELSIF duration_minutes < 240 THEN RETURN '3-4 hours';
  ELSIF duration_minutes < 360 THEN RETURN '4-6 hours';
  ELSIF duration_minutes < 480 THEN RETURN '6-8 hours';
  ELSIF duration_minutes < 600 THEN RETURN '8-10 hours';
  ELSE RETURN '10-12 hours';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Ensure profiles has membership_status column for trigger
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'inactive';

-- Function to create portfolio for new member
CREATE OR REPLACE FUNCTION create_member_portfolio() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_status = 'active' AND (OLD.membership_status IS NULL OR OLD.membership_status != 'active') THEN
    INSERT INTO user_portfolios (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create portfolio when membership activates
DROP TRIGGER IF EXISTS create_portfolio_on_membership ON profiles;
CREATE TRIGGER create_portfolio_on_membership
  AFTER UPDATE OF membership_status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_member_portfolio();

-- ============================================================================
-- PART 8: SEED DATA
-- ============================================================================

-- Insert some initial leaderboard categories into DNA lock for configuration
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('ghost_leaderboard_categories', 'golden_keys,areas_discovered,labyrinth_speed,conduit_jumps,friend_words,candles_earned,deck_cards_viewed,beacon_journeys', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Valid categories for Ghost World leaderboards', 'leaderboards'),
  ('real_leaderboard_categories', 'five_star_deliveries,on_time_rate,gratitude_received,collaboration_score,consistency_streak,guild_ranking', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Valid categories for Real World leaderboards', 'leaderboards'),
  ('session_purchase_prices', '0.50,1.00,1.50,2.50', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Session purchase prices by duration tier', 'pricing')
ON CONFLICT (parameter_key) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- ========== FROM: 20260223000006_mirror_conduits_gates.sql ==========
-- ============================================================================
-- MIRROR CONDUITS & GATES SYSTEM
-- Migration: 20260223000006
-- Date: February 23, 2026
-- ============================================================================

-- ============================================================================
-- PART 1: MIRROR CONDUITS
-- ============================================================================

CREATE TABLE IF NOT EXISTS mirror_conduits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_a_location TEXT NOT NULL,
  mirror_b_location TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  riddle_clue TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mirror_a_location, mirror_b_location)
);

CREATE TABLE IF NOT EXISTS user_conduit_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conduit_id UUID REFERENCES mirror_conduits(id) ON DELETE CASCADE,
  discovered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  candle_collected BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, conduit_id)
);

CREATE TABLE IF NOT EXISTS user_candles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  standard_amount DECIMAL(4,1) DEFAULT 0,
  babylon_amount DECIMAL(4,1) DEFAULT 0,
  last_regeneration TIMESTAMPTZ DEFAULT NOW(),
  regeneration_count INTEGER DEFAULT 0
);

-- RLS for conduit tables
ALTER TABLE mirror_conduits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conduit_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_candles ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_conduits ON mirror_conduits FOR SELECT USING (true);
CREATE POLICY own_conduit_progress ON user_conduit_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_candles ON user_candles FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 2: GATES & FRIEND WORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_friend_words (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  language TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_via TEXT CHECK (discovered_via IN ('lintel', 'manual', 'gift')),
  PRIMARY KEY (user_id, word)
);

CREATE TABLE IF NOT EXISTS gate_passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  friend_word TEXT NOT NULL,
  language TEXT NOT NULL,
  passed_at TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_gate_passages_gate;
CREATE INDEX idx_gate_passages_gate ON gate_passages(gate_id, passed_at DESC);

-- View for lintel display (last 3 per gate)
DROP VIEW IF EXISTS gate_lintels;
CREATE OR REPLACE VIEW gate_lintels AS
SELECT 
  gate_id,
  array_agg(friend_word ORDER BY passed_at DESC) AS recent_words,
  array_agg(language ORDER BY passed_at DESC) AS recent_languages
FROM (
  SELECT DISTINCT ON (gate_id, friend_word)
    gate_id,
    friend_word,
    language,
    passed_at
  FROM gate_passages
  ORDER BY gate_id, friend_word, passed_at DESC
) sub
GROUP BY gate_id;

-- RLS for friend words and passages
ALTER TABLE user_friend_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS own_friend_words ON user_friend_words;
DROP POLICY IF EXISTS view_gate_passages ON gate_passages;
DROP POLICY IF EXISTS insert_gate_passages ON gate_passages;

CREATE POLICY own_friend_words ON user_friend_words FOR ALL USING (auth.uid() = user_id);
CREATE POLICY view_gate_passages ON gate_passages FOR SELECT USING (true);
CREATE POLICY insert_gate_passages ON gate_passages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 3: CONTENT RATINGS & EXCEPTION STAMPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_content_rating (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_rating TEXT DEFAULT 'GA' CHECK (current_rating IN ('ST', 'KG', 'JR', 'GA', 'TN', 'MT', 'AD', 'UV')),
  verified_age BOOLEAN DEFAULT FALSE,
  rating_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exception_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_rating TEXT NOT NULL CHECK (from_rating IN ('ST', 'KG', 'JR', 'GA', 'TN', 'MT', 'AD', 'UV')),
  to_rating TEXT NOT NULL CHECK (to_rating IN ('ST', 'KG', 'JR', 'GA', 'TN', 'MT', 'AD', 'UV')),
  passphrase_hash TEXT NOT NULL,
  stamped_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Only user can see their own stamps (privacy-first)
ALTER TABLE user_content_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE exception_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_content_rating ON user_content_rating FOR ALL USING (auth.uid() = user_id);
CREATE POLICY own_exception_stamps ON exception_stamps FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 4: TREASURE MAPS (User-Created Circuits)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_treasure_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  beacon_path JSONB DEFAULT '[]',
  test_completed BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  publication_cost_paid BOOLEAN DEFAULT FALSE,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS treasure_map_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES user_treasure_maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  completion_time_seconds INTEGER,
  UNIQUE(map_id, user_id)
);

-- RLS for treasure maps
ALTER TABLE user_treasure_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_map_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_published_maps ON user_treasure_maps FOR SELECT USING (published = true OR auth.uid() = creator_id);
CREATE POLICY own_maps ON user_treasure_maps FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY own_completions ON treasure_map_completions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY view_completions ON treasure_map_completions FOR SELECT USING (true);

-- ============================================================================
-- PART 5: FUNCTIONS
-- ============================================================================

-- Function to regenerate candles with increasing intervals
CREATE OR REPLACE FUNCTION regenerate_candle(p_user_id UUID) RETURNS DECIMAL AS $$
DECLARE
  v_candles RECORD;
  v_wait_minutes INTEGER;
  v_can_regenerate BOOLEAN;
  v_new_amount DECIMAL;
BEGIN
  SELECT * INTO v_candles FROM user_candles WHERE user_id = p_user_id;
  
  IF v_candles IS NULL THEN
    INSERT INTO user_candles (user_id, standard_amount) VALUES (p_user_id, 0.1)
    RETURNING standard_amount INTO v_new_amount;
    RETURN v_new_amount;
  END IF;

  CASE v_candles.regeneration_count
    WHEN 0 THEN v_wait_minutes := 1;
    WHEN 1 THEN v_wait_minutes := 3;
    WHEN 2 THEN v_wait_minutes := 10;
    WHEN 3 THEN v_wait_minutes := 30;
    WHEN 4 THEN v_wait_minutes := 60;
    ELSE v_wait_minutes := 180;
  END CASE;

  v_can_regenerate := v_candles.last_regeneration + (v_wait_minutes || ' minutes')::INTERVAL <= NOW();

  IF v_can_regenerate THEN
    UPDATE user_candles
    SET 
      standard_amount = LEAST(standard_amount + 0.1, 10.0),
      last_regeneration = NOW(),
      regeneration_count = regeneration_count + 1
    WHERE user_id = p_user_id
    RETURNING standard_amount INTO v_new_amount;
    RETURN v_new_amount;
  END IF;

  RETURN v_candles.standard_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use a candle
CREATE OR REPLACE FUNCTION use_candle(
  p_user_id UUID,
  p_amount DECIMAL,
  p_is_babylon BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
DECLARE
  v_candles RECORD;
BEGIN
  SELECT * INTO v_candles FROM user_candles WHERE user_id = p_user_id;
  
  IF v_candles IS NULL THEN
    RETURN FALSE;
  END IF;

  IF p_is_babylon THEN
    IF v_candles.babylon_amount < p_amount THEN
      RETURN FALSE;
    END IF;
    UPDATE user_candles SET babylon_amount = babylon_amount - p_amount WHERE user_id = p_user_id;
  ELSE
    IF v_candles.standard_amount < p_amount THEN
      RETURN FALSE;
    END IF;
    UPDATE user_candles SET standard_amount = standard_amount - p_amount WHERE user_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock Black Babylon candles when threshold reached
CREATE OR REPLACE FUNCTION check_babylon_unlock() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.standard_amount >= 11.0 AND OLD.standard_amount < 11.0 THEN
    NEW.babylon_amount := COALESCE(NEW.babylon_amount, 0) + 1.0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS babylon_unlock_trigger ON user_candles;
CREATE TRIGGER babylon_unlock_trigger
  BEFORE UPDATE ON user_candles
  FOR EACH ROW
  EXECUTE FUNCTION check_babylon_unlock();

-- ============================================================================
-- PART 6: SEED DATA
-- ============================================================================

-- Seed some initial mirror conduits
INSERT INTO mirror_conduits (mirror_a_location, mirror_b_location, difficulty_level, riddle_clue)
VALUES 
  ('index:choose-path:left', 'index:choose-path:right', 1, NULL),
  ('landing:hero:mirror', 'initiatives:overview:mirror', 2, NULL),
  ('senate:hall:entrance', 'labyrinth:center:exit', 3, 'Where all guilds meet, beneath the tower'),
  ('guild:harper:door', 'guild:harper:practice', 2, NULL),
  ('treasury:chest:mirror', 'treasury:vault:mirror', 3, 'Where wealth is stored, another waits')
ON CONFLICT DO NOTHING;

-- Seed rating descriptions into DNA lock
INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('content_rating_ST', 'Shirley Temple - All ages, completely wholesome', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Content rating description', 'ratings'),
  ('content_rating_GA', 'General - General audiences', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Content rating description', 'ratings'),
  ('content_rating_UV', 'Ultra-Violet - Strictly age-gated explicit content', 'text', true, 'CONSTITUTIONAL_FOUNDING', 'Content rating description', 'ratings')
ON CONFLICT (parameter_key) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- ========== FROM: 20260223000008_social_plug_system.sql ==========
-- ============================================================================
-- SOCIAL PLUG SYSTEM
-- Universal plug management for social platform integrations
-- ============================================================================

-- PART 1: USER SOCIAL PLUGS
-- Tracks which social platforms a user has connected and enabled
CREATE TABLE IF NOT EXISTS user_social_plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  connection_data JSONB DEFAULT '{}',
  plug_features JSONB DEFAULT '{}',
  oauth_token TEXT,
  oauth_refresh_token TEXT,
  oauth_expires_at TIMESTAMPTZ,
  platform_user_id TEXT,
  platform_username TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_plugs_user ON user_social_plugs(user_id);
CREATE INDEX IF NOT EXISTS idx_social_plugs_platform ON user_social_plugs(platform);
CREATE INDEX IF NOT EXISTS idx_social_plugs_enabled ON user_social_plugs(user_id, is_enabled) WHERE is_enabled = true;

-- PART 2: CANDLE BURST PAIRS
-- Tracks pairing between users for the 9→10→2x progression
CREATE TABLE IF NOT EXISTS candle_burst_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_code TEXT UNIQUE NOT NULL,
  user_a_id UUID NOT NULL,
  user_b_id UUID,
  status TEXT DEFAULT 'pending',
  stage INTEGER DEFAULT 1,
  rewards_a JSONB DEFAULT '{}',
  rewards_b JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paired_at TIMESTAMPTZ,
  stage_2_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pairs_code ON candle_burst_pairs(pair_code);
CREATE INDEX IF NOT EXISTS idx_pairs_user_a ON candle_burst_pairs(user_a_id);
CREATE INDEX IF NOT EXISTS idx_pairs_user_b ON candle_burst_pairs(user_b_id) WHERE user_b_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pairs_status ON candle_burst_pairs(status);

-- PART 3: SOCIAL SHARE TRACKING
-- Tracks shares across all platforms for analytics and rewards
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  share_type TEXT NOT NULL,
  content_id UUID,
  content_type TEXT,
  share_url TEXT,
  platform_post_id TEXT,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_shares_content ON social_shares(content_id, content_type);

-- PART 4: PLUG FEATURE FLAGS
-- Global feature flags for social plug capabilities
CREATE TABLE IF NOT EXISTS social_plug_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  features JSONB DEFAULT '{}',
  oauth_config JSONB DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial platforms
INSERT INTO social_plug_features (platform, display_name, icon, color, features, is_available, approval_status)
VALUES 
  ('tiktok', 'TikTok', '♪', 'bg-pink-500', 
   '{"login": true, "share": true, "mini_game": false}', 
   true, 'pending'),
  ('facebook', 'Facebook', 'f', 'bg-blue-500',
   '{"login": true, "share": true, "pages": true}',
   true, 'approved'),
  ('twitter', 'Twitter/X', '𝕏', 'bg-black',
   '{"login": true, "share": true, "threads": false}',
   true, 'approved'),
  ('linkedin', 'LinkedIn', 'in', 'bg-blue-600',
   '{"login": true, "share": true, "company_pages": false}',
   true, 'approved'),
  ('instagram', 'Instagram', '📷', 'bg-gradient-to-br from-purple-500 to-pink-500',
   '{"login": false, "share": true, "stories": false}',
   true, 'pending'),
  ('youtube', 'YouTube', '▶', 'bg-red-600',
   '{"login": true, "share": false, "upload": false}',
   true, 'pending'),
  ('bluesky', 'Bluesky', '🦋', 'bg-sky-500',
   '{"login": true, "share": true}',
   true, 'approved'),
  ('threads', 'Threads', '@', 'bg-gray-800',
   '{"login": true, "share": true}',
   true, 'pending'),
  ('mastodon', 'Mastodon', '🐘', 'bg-purple-600',
   '{"login": true, "share": true}',
   true, 'approved'),
  ('discord', 'Discord', '🎮', 'bg-indigo-500',
   '{"login": true, "share": false, "webhooks": true}',
   true, 'pending')
ON CONFLICT (platform) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  features = EXCLUDED.features,
  updated_at = NOW();

-- PART 5: ROW LEVEL SECURITY
ALTER TABLE user_social_plugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candle_burst_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_plug_features ENABLE ROW LEVEL SECURITY;

-- Policies for user_social_plugs
DROP POLICY IF EXISTS view_own_plugs ON user_social_plugs;
DROP POLICY IF EXISTS manage_own_plugs ON user_social_plugs;
CREATE POLICY view_own_plugs ON user_social_plugs FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY manage_own_plugs ON user_social_plugs FOR ALL 
  USING (auth.uid() = user_id);

-- Policies for candle_burst_pairs
DROP POLICY IF EXISTS view_own_pairs ON candle_burst_pairs;
DROP POLICY IF EXISTS manage_own_pairs ON candle_burst_pairs;
DROP POLICY IF EXISTS join_pairs ON candle_burst_pairs;
CREATE POLICY view_own_pairs ON candle_burst_pairs FOR SELECT 
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY manage_own_pairs ON candle_burst_pairs FOR ALL 
  USING (auth.uid() = user_a_id);
CREATE POLICY join_pairs ON candle_burst_pairs FOR UPDATE 
  USING (user_b_id IS NULL AND status = 'pending');

-- Policies for social_shares
DROP POLICY IF EXISTS view_own_shares ON social_shares;
DROP POLICY IF EXISTS manage_own_shares ON social_shares;
CREATE POLICY view_own_shares ON social_shares FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY manage_own_shares ON social_shares FOR ALL 
  USING (auth.uid() = user_id);

-- Policies for social_plug_features (public read)
DROP POLICY IF EXISTS view_plug_features ON social_plug_features;
CREATE POLICY view_plug_features ON social_plug_features FOR SELECT 
  USING (true);

-- PART 6: HELPER FUNCTIONS

-- Get user's enabled plugs
CREATE OR REPLACE FUNCTION get_user_plugs(p_user_id UUID)
RETURNS TABLE (
  platform TEXT,
  is_enabled BOOLEAN,
  platform_username TEXT,
  features JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.platform,
    up.is_enabled,
    up.platform_username,
    up.plug_features
  FROM user_social_plugs up
  WHERE up.user_id = p_user_id
  ORDER BY up.platform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle a plug on/off
CREATE OR REPLACE FUNCTION toggle_social_plug(
  p_user_id UUID,
  p_platform TEXT,
  p_enabled BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_social_plugs
  SET is_enabled = p_enabled, updated_at = NOW()
  WHERE user_id = p_user_id AND platform = p_platform;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or join a pair
CREATE OR REPLACE FUNCTION join_candle_pair(
  p_pair_code TEXT,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_pair RECORD;
BEGIN
  SELECT * INTO v_pair FROM candle_burst_pairs WHERE pair_code = p_pair_code;
  
  IF v_pair IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid pair code');
  END IF;
  
  IF v_pair.user_b_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pair code already used');
  END IF;
  
  IF v_pair.user_a_id = p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot pair with yourself');
  END IF;
  
  UPDATE candle_burst_pairs
  SET 
    user_b_id = p_user_id,
    status = 'paired',
    paired_at = NOW()
  WHERE id = v_pair.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'pair_id', v_pair.id,
    'user_a_id', v_pair.user_a_id,
    'candle_uses_each', 9
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DONE!
SELECT 'Social Plug System migration complete!' as status;

-- ========== FROM: 20260223000012_social_shares.sql ==========
-- ═══════════════════════════════════════════════════════════════════════════════
-- SOCIAL SHARES TABLE
-- Phase 6: Golden Keys Social — Track cross-platform sharing
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- twitter, facebook, linkedin, bluesky, copy, cuecard
  content_type TEXT NOT NULL, -- golden_key_achievement, leaderboard, referral, etc.
  content_id TEXT, -- optional reference to specific content
  share_url TEXT, -- generated share URL if applicable
  referral_code TEXT, -- user's referral code used
  clicks INTEGER DEFAULT 0, -- tracked if we can
  conversions INTEGER DEFAULT 0, -- signups from this share
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_social_shares_user ON public.social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON public.social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_created ON public.social_shares(created_at DESC);

-- RLS
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own shares" ON public.social_shares;
CREATE POLICY "Users can view own shares" ON public.social_shares
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own shares" ON public.social_shares;
CREATE POLICY "Users can insert own shares" ON public.social_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- REFERRAL TRACKING TABLE
-- Track Daisy Chain referrals from Golden Key shares
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_code TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_platform TEXT, -- where the referral came from
  source_content TEXT, -- what content led to referral
  bonus_awarded BOOLEAN DEFAULT FALSE,
  bonus_feathers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer ON public.referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_code ON public.referral_tracking(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred ON public.referral_tracking(referred_user_id);

-- RLS
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view referrals they made" ON public.referral_tracking;
CREATE POLICY "Users can view referrals they made" ON public.referral_tracking
  FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "System can insert referrals" ON public.referral_tracking;
CREATE POLICY "System can insert referrals" ON public.referral_tracking
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: Award referral bonus
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION award_referral_bonus(
  p_referrer_code TEXT,
  p_referred_user_id UUID,
  p_source_platform TEXT DEFAULT NULL,
  p_source_content TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_referrer_id UUID;
  v_bonus_feathers INTEGER := 10; -- Base bonus
  v_result JSONB;
BEGIN
  -- Find referrer by code (first 8 chars of user_id)
  SELECT id INTO v_referrer_id 
  FROM auth.users 
  WHERE UPPER(LEFT(id::text, 8)) = UPPER(p_referrer_code)
  LIMIT 1;
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Don't allow self-referral
  IF v_referrer_id = p_referred_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;
  
  -- Check if already referred
  IF EXISTS (SELECT 1 FROM public.referral_tracking WHERE referred_user_id = p_referred_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already referred');
  END IF;
  
  -- Insert referral record
  INSERT INTO public.referral_tracking (
    referrer_id, referrer_code, referred_user_id, 
    source_platform, source_content, bonus_awarded, bonus_feathers
  ) VALUES (
    v_referrer_id, p_referrer_code, p_referred_user_id,
    p_source_platform, p_source_content, true, v_bonus_feathers
  );
  
  -- Award feathers to referrer (if user_feathers table exists)
  UPDATE public.user_feathers 
  SET total_feathers = total_feathers + v_bonus_feathers
  WHERE user_email = (SELECT email FROM auth.users WHERE id = v_referrer_id);
  
  RETURN jsonb_build_object(
    'success', true, 
    'referrer_id', v_referrer_id,
    'bonus_feathers', v_bonus_feathers
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.social_shares IS 'Tracks social media shares of Golden Key achievements';
COMMENT ON TABLE public.referral_tracking IS 'Tracks Daisy Chain referrals from Golden Key shares';

-- ========== FROM: 20260224000001_cost_plus_20_certification.sql ==========
-- ═══════════════════════════════════════════════════════════════
-- COST + 20% CERTIFICATION SYSTEM
-- Non-hideable badge and economic enforcement for C+20 compliance.
-- External shops can participate but only get full benefits if certified.
-- ═══════════════════════════════════════════════════════════════

-- ─── EXTEND ANCHORS TABLE ───
-- Add C+20 certification fields to existing anchors table.

ALTER TABLE public.anchors
ADD COLUMN IF NOT EXISTS pricing_policy TEXT 
  CHECK (pricing_policy IN ('C_PLUS_20', 'OPAQUE', 'OTHER')) 
  DEFAULT 'OPAQUE',
ADD COLUMN IF NOT EXISTS verified_cost_plus BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cost_plus_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cost_plus_verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS cost_plus_notes TEXT,
ADD COLUMN IF NOT EXISTS cost_plus_revoked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cost_plus_revoked_reason TEXT,
ADD COLUMN IF NOT EXISTS cost_plus_compliance_ratio NUMERIC(4,3) DEFAULT 0.000,
ADD COLUMN IF NOT EXISTS cost_plus_compliant_gmv NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cost_plus_total_gmv NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS c20_reciprocity_balance NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS c20_total_margin_contributed NUMERIC(14,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS c20_total_balance_spent NUMERIC(14,2) DEFAULT 0.00;

-- Index for finding certified anchors
CREATE INDEX IF NOT EXISTS idx_anchors_cost_plus_certified 
  ON public.anchors(verified_cost_plus) 
  WHERE verified_cost_plus = true;

CREATE INDEX IF NOT EXISTS idx_anchors_pricing_policy 
  ON public.anchors(pricing_policy);

-- ─── C+20 CERTIFICATION AUDITS ───
-- Audit trail for certification requests, approvals, and revocations.

CREATE TABLE IF NOT EXISTS public.cost_plus_audits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  
  -- Request info
  requested_by        UUID NOT NULL REFERENCES auth.users(id),
  request_type        TEXT NOT NULL CHECK (request_type IN ('certification', 'renewal', 'appeal')),
  
  -- Evidence (private, not published)
  evidence_url        TEXT,
  evidence_notes      TEXT,
  cost_breakdown      JSONB,  -- { "cogs": 100, "labor": 50, "fees": 20, "margin": 34 }
  
  -- Review
  reviewed_by         UUID REFERENCES auth.users(id),
  status              TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'revoked', 'expired')),
  review_notes        TEXT,
  reviewed_at         TIMESTAMPTZ,
  
  -- Validity period
  valid_from          TIMESTAMPTZ,
  valid_until         TIMESTAMPTZ,
  
  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_plus_audits_anchor ON public.cost_plus_audits(anchor_id);
CREATE INDEX idx_cost_plus_audits_status ON public.cost_plus_audits(status);
CREATE INDEX idx_cost_plus_audits_requested_by ON public.cost_plus_audits(requested_by);

-- ─── C+20 COUPON TYPES ───
-- Extend user_coupons to track C+20 enforcement on platform-routed transactions.

ALTER TABLE public.user_coupons
ADD COLUMN IF NOT EXISTS discount_type TEXT 
  CHECK (discount_type IN ('cost_plus_20', 'percentage', 'fixed', 'free_shipping', 'other'))
  DEFAULT 'other',
ADD COLUMN IF NOT EXISTS enforces_cost_plus BOOLEAN DEFAULT false;

-- ─── ECONOMIC MULTIPLIERS FOR C+20 STATUS ───
-- Track how C+20 status affects Joules and Marks earnings.

CREATE TABLE IF NOT EXISTS public.cost_plus_economics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Policy name
  policy_name         TEXT NOT NULL UNIQUE,
  
  -- Multipliers for certified anchors
  certified_joule_multiplier    DECIMAL(4,2) DEFAULT 1.00,
  certified_marks_multiplier    DECIMAL(4,2) DEFAULT 1.00,
  certified_ip_stake_eligible   BOOLEAN DEFAULT true,
  certified_reciprocal_tier_max INTEGER DEFAULT 3,
  
  -- Multipliers for non-certified anchors
  uncertified_joule_multiplier  DECIMAL(4,2) DEFAULT 0.25,
  uncertified_marks_multiplier  DECIMAL(4,2) DEFAULT 0.50,
  uncertified_ip_stake_eligible BOOLEAN DEFAULT false,
  uncertified_reciprocal_tier_max INTEGER DEFAULT 1,
  
  -- Description
  description         TEXT,
  
  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default economics policy
INSERT INTO public.cost_plus_economics (
  policy_name,
  certified_joule_multiplier,
  certified_marks_multiplier,
  certified_ip_stake_eligible,
  certified_reciprocal_tier_max,
  uncertified_joule_multiplier,
  uncertified_marks_multiplier,
  uncertified_ip_stake_eligible,
  uncertified_reciprocal_tier_max,
  description
) VALUES (
  'default',
  1.00,
  1.00,
  true,
  3,
  0.25,
  0.50,
  false,
  1,
  'Default C+20 economics policy. Certified anchors get full benefits; uncertified get reduced Joules/Marks and no IP stakes.'
) ON CONFLICT (policy_name) DO NOTHING;

-- ─── DNA LOCK ENTRIES ───
-- Add C+20 parameters to DNA Lock.

INSERT INTO public.dna_lock (parameter_key, parameter_value, category, description, locked_at, locked_by)
VALUES
  ('cost_plus_creator_cut', '0.833', 'economics', 'Creator keeps 83.3% on C+20 transactions (Cost + 20%)', NOW(), 'system'),
  ('cost_plus_platform_margin', '0.20', 'economics', 'Platform margin is 20% of cost on C+20 transactions', NOW(), 'system'),
  ('cost_plus_certification_validity_days', '365', 'compliance', 'C+20 certification valid for 365 days before renewal required', NOW(), 'system'),
  ('cost_plus_uncertified_joule_multiplier', '0.25', 'economics', 'Non-C+20 anchors earn 25% of normal Joules', NOW(), 'system'),
  ('cost_plus_uncertified_marks_multiplier', '0.50', 'economics', 'Non-C+20 anchors earn 50% of normal Marks', NOW(), 'system')
ON CONFLICT (parameter_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.cost_plus_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_plus_economics ENABLE ROW LEVEL SECURITY;

-- Audits: requesters can view their own, admins can view all
CREATE POLICY "Users can view their own C+20 audit requests" ON public.cost_plus_audits
  FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "Users can create C+20 audit requests" ON public.cost_plus_audits
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

-- Economics: public read (these are platform-wide policies)
CREATE POLICY "Anyone can view C+20 economics" ON public.cost_plus_economics
  FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to check if an anchor is C+20 certified
CREATE OR REPLACE FUNCTION public.is_cost_plus_certified(p_anchor_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.anchors
    WHERE id = p_anchor_id
      AND pricing_policy = 'C_PLUS_20'
      AND verified_cost_plus = true
      AND cost_plus_revoked_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get C+20 badge tier based on compliance ratio
CREATE OR REPLACE FUNCTION public.get_cost_plus_tier(p_anchor_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_ratio NUMERIC(4,3);
  v_verified BOOLEAN;
BEGIN
  SELECT cost_plus_compliance_ratio, verified_cost_plus 
  INTO v_ratio, v_verified
  FROM public.anchors 
  WHERE id = p_anchor_id;
  
  IF v_ratio IS NULL THEN
    RETURN 'NONE';
  END IF;
  
  -- Full badge requires both high ratio AND verification
  IF v_ratio >= 0.95 AND v_verified = true THEN
    RETURN 'FULL';
  ELSIF v_ratio >= 0.75 THEN
    RETURN 'THREE_QUARTER';
  ELSIF v_ratio >= 0.50 THEN
    RETURN 'HALF';
  ELSIF v_ratio >= 0.25 THEN
    RETURN 'QUARTER';
  ELSE
    RETURN 'NONE';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update compliance ratio after a transaction
CREATE OR REPLACE FUNCTION public.update_cost_plus_compliance(
  p_anchor_id UUID,
  p_transaction_amount NUMERIC(14,2),
  p_is_compliant BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.anchors
  SET 
    cost_plus_total_gmv = cost_plus_total_gmv + p_transaction_amount,
    cost_plus_compliant_gmv = CASE 
      WHEN p_is_compliant THEN cost_plus_compliant_gmv + p_transaction_amount 
      ELSE cost_plus_compliant_gmv 
    END,
    cost_plus_compliance_ratio = CASE 
      WHEN (cost_plus_total_gmv + p_transaction_amount) > 0 
      THEN (cost_plus_compliant_gmv + CASE WHEN p_is_compliant THEN p_transaction_amount ELSE 0 END) 
           / (cost_plus_total_gmv + p_transaction_amount)
      ELSE 0 
    END,
    updated_at = NOW()
  WHERE id = p_anchor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request C+20 certification
CREATE OR REPLACE FUNCTION public.request_cost_plus_certification(
  p_anchor_id UUID,
  p_evidence_url TEXT DEFAULT NULL,
  p_evidence_notes TEXT DEFAULT NULL,
  p_cost_breakdown JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_owner_id UUID;
BEGIN
  -- Verify caller owns the anchor
  SELECT owner_id INTO v_owner_id FROM public.anchors WHERE id = p_anchor_id;
  IF v_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not own this anchor';
  END IF;
  
  -- Check for existing pending request
  IF EXISTS (
    SELECT 1 FROM public.cost_plus_audits
    WHERE anchor_id = p_anchor_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'A pending certification request already exists for this anchor';
  END IF;
  
  -- Create audit request
  INSERT INTO public.cost_plus_audits (
    anchor_id,
    requested_by,
    request_type,
    evidence_url,
    evidence_notes,
    cost_breakdown
  ) VALUES (
    p_anchor_id,
    auth.uid(),
    'certification',
    p_evidence_url,
    p_evidence_notes,
    p_cost_breakdown
  ) RETURNING id INTO v_audit_id;
  
  -- Update anchor to show pending
  UPDATE public.anchors
  SET pricing_policy = 'C_PLUS_20',
      updated_at = NOW()
  WHERE id = p_anchor_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve C+20 certification (admin only)
CREATE OR REPLACE FUNCTION public.approve_cost_plus_certification(
  p_audit_id UUID,
  p_review_notes TEXT DEFAULT NULL,
  p_validity_days INTEGER DEFAULT 365
)
RETURNS BOOLEAN AS $$
DECLARE
  v_anchor_id UUID;
BEGIN
  -- Get anchor ID from audit
  SELECT anchor_id INTO v_anchor_id FROM public.cost_plus_audits WHERE id = p_audit_id;
  
  IF v_anchor_id IS NULL THEN
    RAISE EXCEPTION 'Audit request not found';
  END IF;
  
  -- Update audit record
  UPDATE public.cost_plus_audits
  SET status = 'approved',
      reviewed_by = auth.uid(),
      review_notes = p_review_notes,
      reviewed_at = NOW(),
      valid_from = NOW(),
      valid_until = NOW() + (p_validity_days || ' days')::INTERVAL,
      updated_at = NOW()
  WHERE id = p_audit_id;
  
  -- Update anchor
  UPDATE public.anchors
  SET verified_cost_plus = true,
      cost_plus_verified_at = NOW(),
      cost_plus_verified_by = auth.uid(),
      cost_plus_notes = p_review_notes,
      cost_plus_revoked_at = NULL,
      cost_plus_revoked_reason = NULL,
      updated_at = NOW()
  WHERE id = v_anchor_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke C+20 certification (admin only)
CREATE OR REPLACE FUNCTION public.revoke_cost_plus_certification(
  p_anchor_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update anchor
  UPDATE public.anchors
  SET verified_cost_plus = false,
      cost_plus_revoked_at = NOW(),
      cost_plus_revoked_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_anchor_id;
  
  -- Create revocation audit record
  INSERT INTO public.cost_plus_audits (
    anchor_id,
    requested_by,
    request_type,
    status,
    reviewed_by,
    review_notes,
    reviewed_at
  ) VALUES (
    p_anchor_id,
    auth.uid(),
    'certification',
    'revoked',
    auth.uid(),
    p_reason,
    NOW()
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get economic multipliers for an anchor
CREATE OR REPLACE FUNCTION public.get_anchor_economics(p_anchor_id UUID)
RETURNS TABLE (
  joule_multiplier DECIMAL(4,2),
  marks_multiplier DECIMAL(4,2),
  ip_stake_eligible BOOLEAN,
  reciprocal_tier_max INTEGER,
  is_certified BOOLEAN
) AS $$
DECLARE
  v_is_certified BOOLEAN;
  v_policy RECORD;
BEGIN
  -- Check certification status
  v_is_certified := public.is_cost_plus_certified(p_anchor_id);
  
  -- Get default policy
  SELECT * INTO v_policy FROM public.cost_plus_economics WHERE policy_name = 'default';
  
  IF v_is_certified THEN
    RETURN QUERY SELECT 
      v_policy.certified_joule_multiplier,
      v_policy.certified_marks_multiplier,
      v_policy.certified_ip_stake_eligible,
      v_policy.certified_reciprocal_tier_max,
      true;
  ELSE
    RETURN QUERY SELECT 
      v_policy.uncertified_joule_multiplier,
      v_policy.uncertified_marks_multiplier,
      v_policy.uncertified_ip_stake_eligible,
      v_policy.uncertified_reciprocal_tier_max,
      false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════════════════════════════

-- View of all C+20 certified anchors (for public display)
DROP VIEW IF EXISTS public.v_certified_anchors;
CREATE OR REPLACE VIEW public.v_certified_anchors AS
SELECT 
  a.id,
  a.display_name,
  a.destination_url,
  a.business_type,
  a.trust_score,
  a.total_pass_throughs,
  a.cost_plus_verified_at,
  cbt.display_name AS charitable_tier,
  cbt.icon AS charitable_icon
FROM public.anchors a
LEFT JOIN public.charitable_business_tiers cbt ON a.charitable_tier_id = cbt.id
WHERE a.verified_cost_plus = true
  AND a.pricing_policy = 'C_PLUS_20'
  AND a.cost_plus_revoked_at IS NULL
  AND a.status = 'active';

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE public.cost_plus_audits IS 'Audit trail for C+20 certification requests, approvals, and revocations';
COMMENT ON TABLE public.cost_plus_economics IS 'Economic multipliers for C+20 certified vs non-certified anchors';
COMMENT ON FUNCTION public.is_cost_plus_certified IS 'Check if an anchor has valid C+20 certification';
COMMENT ON FUNCTION public.request_cost_plus_certification IS 'Request C+20 certification for an anchor';
COMMENT ON FUNCTION public.approve_cost_plus_certification IS 'Approve a C+20 certification request (admin only)';
COMMENT ON FUNCTION public.revoke_cost_plus_certification IS 'Revoke C+20 certification from an anchor (admin only)';
COMMENT ON FUNCTION public.get_anchor_economics IS 'Get economic multipliers for an anchor based on C+20 status';
COMMENT ON VIEW public.v_certified_anchors IS 'Public view of all C+20 certified anchors';

-- ========== FROM: 20260224000002_c20_reciprocity_system.sql ==========
-- ============================================================================
-- C+20 RECIPROCITY SYSTEM
-- ============================================================================
-- Innovation #1347: C+20 Reciprocity Law
-- "For every dollar of margin a business voluntarily gives up by adopting 
-- Cost + 20% pricing, the system grants that business one dollar of C+20 
-- purchasing power inside the ecosystem."
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PRODUCT-LEVEL C+20 CONFIGURATION
-- ----------------------------------------------------------------------------
-- Allows businesses to "dip their toe" by setting per-product C+20 limits

CREATE TABLE IF NOT EXISTS public.c20_product_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  
  -- Pricing configuration
  reference_price NUMERIC(10,2) NOT NULL,      -- Normal retail price (e.g., $100)
  cost_basis NUMERIC(10,2) NOT NULL,           -- True cost (e.g., $40)
  c20_price NUMERIC(10,2) GENERATED ALWAYS AS (cost_basis * 1.20) STORED,
  margin_at_reference NUMERIC(10,2) GENERATED ALWAYS AS (reference_price - cost_basis) STORED,
  margin_at_c20 NUMERIC(10,2) GENERATED ALWAYS AS (cost_basis * 0.20) STORED,
  margin_sacrificed_per_unit NUMERIC(10,2) GENERATED ALWAYS AS 
    ((reference_price - cost_basis) - (cost_basis * 0.20)) STORED,
  
  -- C+20 limits (toe-dipping)
  c20_enabled BOOLEAN DEFAULT true,
  c20_max_units INTEGER,                       -- NULL = unlimited, e.g., 50
  c20_units_sold INTEGER DEFAULT 0,
  c20_auto_revert BOOLEAN DEFAULT true,        -- Revert to reference price when max hit
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(anchor_id, product_sku)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_c20_product_config_anchor 
  ON public.c20_product_config(anchor_id);

-- ----------------------------------------------------------------------------
-- 2. RECIPROCITY TRANSACTION LEDGER
-- ----------------------------------------------------------------------------
-- Tracks every margin contribution and balance spend

CREATE TABLE IF NOT EXISTS public.c20_reciprocity_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  
  -- Transaction type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'MARGIN_CONTRIBUTION',    -- Sold at C+20, earned reciprocity balance
    'BALANCE_SPEND',          -- Purchased at C+20, spent reciprocity balance
    'JOULE_CONVERSION',       -- Converted Joules to extend C+20 purchasing power
    'BALANCE_ADJUSTMENT'      -- Manual adjustment (admin)
  )),
  
  -- Amounts
  amount NUMERIC(14,2) NOT NULL,               -- Positive for contributions, negative for spends
  balance_before NUMERIC(14,2) NOT NULL,
  balance_after NUMERIC(14,2) NOT NULL,
  
  -- Reference data
  product_config_id UUID REFERENCES public.c20_product_config(id),
  order_id UUID,                               -- If tied to a specific order
  joule_amount NUMERIC(14,2),                  -- If JOULE_CONVERSION
  joule_rate NUMERIC(10,6),                    -- Forex rate at conversion
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_c20_reciprocity_ledger_anchor 
  ON public.c20_reciprocity_ledger(anchor_id);
CREATE INDEX IF NOT EXISTS idx_c20_reciprocity_ledger_type 
  ON public.c20_reciprocity_ledger(transaction_type);

-- ----------------------------------------------------------------------------
-- 3. DNA LOCK ENTRIES FOR RECIPROCITY ECONOMICS
-- ----------------------------------------------------------------------------

INSERT INTO public.dna_lock (parameter_key, parameter_value, category, description, locked_at, locked_by)
VALUES
  ('c20_reciprocity_rate', '1.0', 'economics', 'Dollars of C+20 purchasing power per dollar of margin sacrificed', NOW(), 'system'),
  ('c20_joule_conversion_rate', '1.0', 'economics', 'Joules to C+20 balance conversion rate (1:1 at parity)', NOW(), 'system'),
  ('c20_min_contribution_for_balance', '0.01', 'economics', 'Minimum margin contribution to earn balance', NOW(), 'system')
ON CONFLICT (parameter_key) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. FUNCTIONS
-- ----------------------------------------------------------------------------

-- Record a margin contribution when a C+20 sale occurs
CREATE OR REPLACE FUNCTION public.record_c20_margin_contribution(
  p_anchor_id UUID,
  p_product_config_id UUID,
  p_units_sold INTEGER DEFAULT 1,
  p_order_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_margin_per_unit NUMERIC(10,2);
  v_total_margin NUMERIC(14,2);
  v_balance_before NUMERIC(14,2);
  v_balance_after NUMERIC(14,2);
  v_reciprocity_rate NUMERIC(10,6);
BEGIN
  -- Get margin sacrificed per unit
  SELECT margin_sacrificed_per_unit INTO v_margin_per_unit
  FROM public.c20_product_config
  WHERE id = p_product_config_id;
  
  IF v_margin_per_unit IS NULL THEN
    RAISE EXCEPTION 'Product config not found';
  END IF;
  
  -- Calculate total margin contributed
  v_total_margin := v_margin_per_unit * p_units_sold;
  
  -- Get reciprocity rate from DNA lock
  SELECT COALESCE(parameter_value::NUMERIC, 1.0) INTO v_reciprocity_rate
  FROM public.dna_lock WHERE parameter_key = 'c20_reciprocity_rate';
  
  -- Get current balance
  SELECT c20_reciprocity_balance INTO v_balance_before
  FROM public.anchors WHERE id = p_anchor_id;
  
  v_balance_after := v_balance_before + (v_total_margin * v_reciprocity_rate);
  
  -- Update anchor balances
  UPDATE public.anchors
  SET 
    c20_reciprocity_balance = v_balance_after,
    c20_total_margin_contributed = c20_total_margin_contributed + v_total_margin,
    updated_at = NOW()
  WHERE id = p_anchor_id;
  
  -- Update product config units sold
  UPDATE public.c20_product_config
  SET 
    c20_units_sold = c20_units_sold + p_units_sold,
    updated_at = NOW()
  WHERE id = p_product_config_id;
  
  -- Record in ledger
  INSERT INTO public.c20_reciprocity_ledger (
    anchor_id, transaction_type, amount, 
    balance_before, balance_after,
    product_config_id, order_id, notes
  ) VALUES (
    p_anchor_id, 'MARGIN_CONTRIBUTION', v_total_margin * v_reciprocity_rate,
    v_balance_before, v_balance_after,
    p_product_config_id, p_order_id,
    format('Sold %s units, margin sacrificed: $%s each', p_units_sold, v_margin_per_unit)
  );
  
  RETURN v_total_margin * v_reciprocity_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Spend reciprocity balance on a C+20 purchase
CREATE OR REPLACE FUNCTION public.spend_c20_balance(
  p_anchor_id UUID,
  p_amount NUMERIC(14,2),
  p_order_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  balance_used NUMERIC(14,2),
  joules_needed NUMERIC(14,2),
  remaining_balance NUMERIC(14,2)
) AS $$
DECLARE
  v_current_balance NUMERIC(14,2);
  v_balance_to_use NUMERIC(14,2);
  v_joules_needed NUMERIC(14,2);
  v_balance_after NUMERIC(14,2);
BEGIN
  -- Get current balance
  SELECT c20_reciprocity_balance INTO v_current_balance
  FROM public.anchors WHERE id = p_anchor_id;
  
  -- Calculate how much balance to use vs Joules needed
  IF v_current_balance >= p_amount THEN
    v_balance_to_use := p_amount;
    v_joules_needed := 0;
  ELSE
    v_balance_to_use := v_current_balance;
    v_joules_needed := p_amount - v_current_balance;
  END IF;
  
  v_balance_after := v_current_balance - v_balance_to_use;
  
  -- Update anchor balance
  UPDATE public.anchors
  SET 
    c20_reciprocity_balance = v_balance_after,
    c20_total_balance_spent = c20_total_balance_spent + v_balance_to_use,
    updated_at = NOW()
  WHERE id = p_anchor_id;
  
  -- Record in ledger
  IF v_balance_to_use > 0 THEN
    INSERT INTO public.c20_reciprocity_ledger (
      anchor_id, transaction_type, amount,
      balance_before, balance_after,
      order_id, notes
    ) VALUES (
      p_anchor_id, 'BALANCE_SPEND', -v_balance_to_use,
      v_current_balance, v_balance_after,
      p_order_id, COALESCE(p_notes, 'C+20 purchase')
    );
  END IF;
  
  RETURN QUERY SELECT v_balance_to_use, v_joules_needed, v_balance_after;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convert Joules to C+20 purchasing power
CREATE OR REPLACE FUNCTION public.convert_joules_to_c20_balance(
  p_anchor_id UUID,
  p_joule_amount NUMERIC(14,2),
  p_notes TEXT DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_conversion_rate NUMERIC(10,6);
  v_c20_amount NUMERIC(14,2);
  v_balance_before NUMERIC(14,2);
  v_balance_after NUMERIC(14,2);
BEGIN
  -- Get conversion rate from DNA lock
  SELECT COALESCE(parameter_value::NUMERIC, 1.0) INTO v_conversion_rate
  FROM public.dna_lock WHERE parameter_key = 'c20_joule_conversion_rate';
  
  v_c20_amount := p_joule_amount * v_conversion_rate;
  
  -- Get current balance
  SELECT c20_reciprocity_balance INTO v_balance_before
  FROM public.anchors WHERE id = p_anchor_id;
  
  v_balance_after := v_balance_before + v_c20_amount;
  
  -- Update anchor balance
  UPDATE public.anchors
  SET 
    c20_reciprocity_balance = v_balance_after,
    updated_at = NOW()
  WHERE id = p_anchor_id;
  
  -- Record in ledger
  INSERT INTO public.c20_reciprocity_ledger (
    anchor_id, transaction_type, amount,
    balance_before, balance_after,
    joule_amount, joule_rate, notes
  ) VALUES (
    p_anchor_id, 'JOULE_CONVERSION', v_c20_amount,
    v_balance_before, v_balance_after,
    p_joule_amount, v_conversion_rate,
    COALESCE(p_notes, format('Converted %s Joules at rate %s', p_joule_amount, v_conversion_rate))
  );
  
  RETURN v_c20_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a product should still be sold at C+20 (toe-dipping limit)
CREATE OR REPLACE FUNCTION public.is_product_c20_available(p_product_config_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
  v_max_units INTEGER;
  v_units_sold INTEGER;
  v_auto_revert BOOLEAN;
BEGIN
  SELECT c20_enabled, c20_max_units, c20_units_sold, c20_auto_revert
  INTO v_enabled, v_max_units, v_units_sold, v_auto_revert
  FROM public.c20_product_config
  WHERE id = p_product_config_id;
  
  IF NOT v_enabled THEN
    RETURN false;
  END IF;
  
  -- If no max set, always available
  IF v_max_units IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if under limit
  RETURN v_units_sold < v_max_units;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get anchor's C+20 reciprocity summary
CREATE OR REPLACE FUNCTION public.get_c20_reciprocity_summary(p_anchor_id UUID)
RETURNS TABLE (
  reciprocity_balance NUMERIC(14,2),
  total_margin_contributed NUMERIC(14,2),
  total_balance_spent NUMERIC(14,2),
  net_contribution NUMERIC(14,2),
  products_at_c20 INTEGER,
  total_c20_units_sold INTEGER,
  total_c20_units_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.c20_reciprocity_balance,
    a.c20_total_margin_contributed,
    a.c20_total_balance_spent,
    a.c20_total_margin_contributed - a.c20_total_balance_spent,
    COUNT(pc.id)::INTEGER,
    COALESCE(SUM(pc.c20_units_sold), 0)::INTEGER,
    COALESCE(SUM(
      CASE 
        WHEN pc.c20_max_units IS NOT NULL 
        THEN GREATEST(0, pc.c20_max_units - pc.c20_units_sold)
        ELSE 0 
      END
    ), 0)::INTEGER
  FROM public.anchors a
  LEFT JOIN public.c20_product_config pc ON pc.anchor_id = a.id AND pc.c20_enabled = true
  WHERE a.id = p_anchor_id
  GROUP BY a.id, a.c20_reciprocity_balance, a.c20_total_margin_contributed, a.c20_total_balance_spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE public.c20_product_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.c20_reciprocity_ledger ENABLE ROW LEVEL SECURITY;

-- Product config: owners can manage their own
CREATE POLICY "Anchor owners can manage their product configs"
  ON public.c20_product_config
  FOR ALL
  USING (
    anchor_id IN (SELECT id FROM public.anchors WHERE owner_id = auth.uid())
  );

-- Ledger: owners can view their own
CREATE POLICY "Anchor owners can view their reciprocity ledger"
  ON public.c20_reciprocity_ledger
  FOR SELECT
  USING (
    anchor_id IN (SELECT id FROM public.anchors WHERE owner_id = auth.uid())
  );

-- Public can view aggregate stats (for transparency)
CREATE POLICY "Public can view product configs"
  ON public.c20_product_config
  FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- 6. PUBLIC VIEW FOR TRANSPARENCY
-- ----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.v_c20_reciprocity_leaderboard;
CREATE OR REPLACE VIEW public.v_c20_reciprocity_leaderboard AS
SELECT 
  a.id AS anchor_id,
  a.display_name,
  a.c20_total_margin_contributed AS total_contributed,
  a.c20_total_balance_spent AS total_spent,
  a.c20_reciprocity_balance AS current_balance,
  COUNT(pc.id) AS products_at_c20,
  SUM(pc.c20_units_sold) AS total_units_sold,
  a.cost_plus_compliance_ratio AS compliance_ratio,
  public.get_cost_plus_tier(a.id) AS badge_tier
FROM public.anchors a
LEFT JOIN public.c20_product_config pc ON pc.anchor_id = a.id AND pc.c20_enabled = true
WHERE a.c20_total_margin_contributed > 0
GROUP BY a.id
ORDER BY a.c20_total_margin_contributed DESC;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- ========== FROM: 20260304000002_care_unit_stewardship.sql ==========
-- Migration: Care Unit & Stewardship System
-- Date: 2026-03-04
-- Description: Adds tables for Initiative Deployment Thresholds, AI Advisors, and Human Accountability

-- 1. Initiative Care Units (Tracking Spark to Wildfire tiers)
CREATE TABLE IF NOT EXISTS public.initiative_care_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL, -- e.g., 'santa_ever_after', 'lets_make_dinner'
    name TEXT NOT NULL,
    current_tier TEXT NOT NULL DEFAULT 'SPARK', -- SPARK, EMBER, FLAME, FIRE, BLAZE, INFERNO, WILDFIRE
    cu_definition TEXT NOT NULL, -- e.g., '1 gift funded', '1 meal served'
    cost_per_cu NUMERIC NOT NULL DEFAULT 0,
    total_cu_funded INTEGER NOT NULL DEFAULT 0,
    total_cu_deployed INTEGER NOT NULL DEFAULT 0,
    ai_advisor_name TEXT NOT NULL, -- e.g., 'DANEEL', 'JARVIS'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Stewardship Applications (The Vetting Process)
CREATE TABLE IF NOT EXISTS public.stewardship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, vetting, approved, rejected
    legal_name TEXT NOT NULL,
    id_verified BOOLEAN NOT NULL DEFAULT FALSE,
    background_summary TEXT,
    scenario_responses JSONB, -- Answers to "what would you do if..."
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Stewardship Backers (The Six-Person Verification & Pledge)
CREATE TABLE IF NOT EXISTS public.stewardship_backers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.stewardship_applications(id) ON DELETE CASCADE,
    backer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- 'known' (family/friend) or 'unknown' (community verifier)
    pledge_amount_credits NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pledged', -- pledged, escrowed, released, forfeited
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Command Paths (Transfer of Authority)
CREATE TABLE IF NOT EXISTS public.command_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    current_steward_id UUID REFERENCES auth.users(id), -- Can be null if Founder holds it
    delegation_level TEXT NOT NULL DEFAULT 'full_steward', -- full_steward, operations_rep, communications_rep
    transferred_at TIMESTAMPTZ,
    probation_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.initiative_care_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_paths ENABLE ROW LEVEL SECURITY;

-- Basic read access for public data
CREATE POLICY "Public can view initiative care units" ON public.initiative_care_units FOR SELECT USING (true);
CREATE POLICY "Public can view command paths" ON public.command_paths FOR SELECT USING (true);

-- Users can view their own applications and pledges
CREATE POLICY "Users can view own applications" ON public.stewardship_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own pledges" ON public.stewardship_backers FOR SELECT USING (auth.uid() = backer_user_id);

-- ========== FROM: 20260304000003_cold_start_geographic.sql ==========
-- Migration: Cold Start Geographic System
-- Date: 2026-03-04
-- Description: Adds geographic targeting for The 300 (Naval Fleet / Captains) and localized progress tracking
-- Milestone 2: The Cold Start & Stewardship System
-- 
-- NAVAL RANK PROGRESSION:
-- - Captain: 1 ship (your own) - Local leader for ONE initiative in ONE city
-- - Commodore: 3+ ships - Leader of 3+ initiatives OR 1 initiative across 3+ cities
-- - Rear Admiral: Squadron - Regional coordinator (state-level)
-- - Vice Admiral: Fleet division - Multi-state coordinator
-- - Admiral: Full fleet - National coordinator
-- - Fleet Admiral / Crown: The public figure who sets national vision

-- 1. Add geographic columns to stewardship_applications
ALTER TABLE public.stewardship_applications 
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA',
ADD COLUMN IF NOT EXISTS region_type TEXT DEFAULT 'city'; -- 'city', 'county', 'state', 'national'

-- 2. Create geographic demand signals table (for "I want this in my area")
CREATE TABLE IF NOT EXISTS public.geographic_demand_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    zip_code TEXT NOT NULL,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    signal_type TEXT NOT NULL DEFAULT 'interest', -- 'interest', 'soft_pledge', 'hard_pledge'
    pledge_amount NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create geographic cold start thresholds table
CREATE TABLE IF NOT EXISTS public.cold_start_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    tier TEXT NOT NULL, -- SPARK, EMBER, FLAME, FIRE, BLAZE, INFERNO, WILDFIRE
    families_required INTEGER NOT NULL DEFAULT 50,
    captains_required INTEGER NOT NULL DEFAULT 1, -- Naval rank: Captain = 1 ship
    funding_required NUMERIC DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(initiative_id, tier)
);

-- 4. Create geographic progress tracking view
DROP VIEW IF EXISTS public.geographic_cold_start_progress;
CREATE OR REPLACE VIEW public.geographic_cold_start_progress AS
SELECT 
    gds.initiative_id,
    gds.zip_code,
    gds.city,
    gds.state,
    gds.country,
    COUNT(DISTINCT gds.user_id) as interested_families,
    COUNT(DISTINCT CASE WHEN gds.signal_type = 'hard_pledge' THEN gds.user_id END) as committed_families,
    COALESCE(SUM(gds.pledge_amount), 0) as total_pledged,
    (SELECT COUNT(*) FROM public.stewardship_applications sa 
     WHERE sa.initiative_id = gds.initiative_id 
     AND sa.city = gds.city 
     AND sa.state = gds.state 
     AND sa.status = 'approved'
     AND sa.region_type = 'city') as active_captains, -- Naval rank: Captain = local leader
    CASE 
        WHEN COUNT(DISTINCT gds.user_id) >= 500 THEN 'WILDFIRE'
        WHEN COUNT(DISTINCT gds.user_id) >= 250 THEN 'INFERNO'
        WHEN COUNT(DISTINCT gds.user_id) >= 150 THEN 'BLAZE'
        WHEN COUNT(DISTINCT gds.user_id) >= 100 THEN 'FIRE'
        WHEN COUNT(DISTINCT gds.user_id) >= 75 THEN 'FLAME'
        WHEN COUNT(DISTINCT gds.user_id) >= 50 THEN 'EMBER'
        ELSE 'SPARK'
    END as current_tier
FROM public.geographic_demand_signals gds
GROUP BY gds.initiative_id, gds.zip_code, gds.city, gds.state, gds.country;

-- 5. Seed default cold start thresholds for all initiatives
INSERT INTO public.cold_start_thresholds (initiative_id, tier, families_required, captains_required, description)
VALUES 
    -- Let's Make Dinner
    ('lets_make_dinner', 'SPARK', 1, 0, 'Gathering interest'),
    ('lets_make_dinner', 'EMBER', 50, 1, 'Need 50 families and 1 Captain to launch'),
    ('lets_make_dinner', 'FLAME', 75, 1, 'Growing momentum'),
    ('lets_make_dinner', 'FIRE', 100, 2, 'Sustainable operations'),
    ('lets_make_dinner', 'BLAZE', 150, 3, 'Expanding reach'),
    ('lets_make_dinner', 'INFERNO', 250, 4, 'Regional impact'),
    ('lets_make_dinner', 'WILDFIRE', 500, 5, 'Full deployment'),
    
    -- Defense Klaus
    ('defense_klaus', 'SPARK', 1, 0, 'Gathering interest'),
    ('defense_klaus', 'EMBER', 100, 1, 'Need 100 families and 1 Captain to launch'),
    ('defense_klaus', 'FLAME', 200, 2, 'Growing network'),
    ('defense_klaus', 'FIRE', 500, 3, 'Sustainable protection'),
    ('defense_klaus', 'BLAZE', 1000, 4, 'Regional coverage'),
    ('defense_klaus', 'INFERNO', 2500, 5, 'Major metro coverage'),
    ('defense_klaus', 'WILDFIRE', 5000, 6, 'Full deployment'),
    
    -- Let's Get Groceries
    ('lets_get_groceries', 'SPARK', 1, 0, 'Gathering interest'),
    ('lets_get_groceries', 'EMBER', 25, 1, 'Need 25 families and 1 Captain to launch'),
    ('lets_get_groceries', 'FLAME', 50, 1, 'Growing buying power'),
    ('lets_get_groceries', 'FIRE', 100, 2, 'Sustainable volume'),
    ('lets_get_groceries', 'BLAZE', 200, 3, 'Major discounts unlocked'),
    ('lets_get_groceries', 'INFERNO', 500, 4, 'Regional buying power'),
    ('lets_get_groceries', 'WILDFIRE', 1000, 5, 'Full deployment'),
    
    -- Family Table
    ('family_table', 'SPARK', 1, 0, 'Gathering interest'),
    ('family_table', 'EMBER', 10, 1, 'Need 10 families and 1 Captain to launch'),
    ('family_table', 'FLAME', 25, 1, 'Growing connections'),
    ('family_table', 'FIRE', 50, 2, 'Sustainable community'),
    ('family_table', 'BLAZE', 100, 3, 'Expanding reach'),
    ('family_table', 'INFERNO', 250, 4, 'Regional impact'),
    ('family_table', 'WILDFIRE', 500, 5, 'Full deployment')
ON CONFLICT (initiative_id, tier) DO NOTHING;

-- 6. RLS Policies
ALTER TABLE public.geographic_demand_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cold_start_thresholds ENABLE ROW LEVEL SECURITY;

-- Anyone can view thresholds and aggregated progress
CREATE POLICY "Public can view cold start thresholds" 
    ON public.cold_start_thresholds FOR SELECT USING (true);

-- Users can create and view their own demand signals
CREATE POLICY "Users can create demand signals" 
    ON public.geographic_demand_signals FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own demand signals" 
    ON public.geographic_demand_signals FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 7. Function to get progress for a specific city
CREATE OR REPLACE FUNCTION get_city_cold_start_progress(
    p_initiative_id TEXT,
    p_city TEXT,
    p_state TEXT
)
RETURNS TABLE (
    initiative_id TEXT,
    city TEXT,
    state TEXT,
    interested_families BIGINT,
    committed_families BIGINT,
    total_pledged NUMERIC,
    active_captains BIGINT,
    current_tier TEXT,
    next_tier TEXT,
    families_to_next_tier INTEGER,
    captains_to_next_tier INTEGER
) AS $$
DECLARE
    v_current_tier TEXT;
    v_families BIGINT;
    v_captains BIGINT;
BEGIN
    -- Get current counts
    SELECT 
        COUNT(DISTINCT gds.user_id),
        (SELECT COUNT(*) FROM public.stewardship_applications sa 
         WHERE sa.initiative_id = p_initiative_id 
         AND sa.city = p_city 
         AND sa.state = p_state 
         AND sa.status = 'approved'
         AND sa.region_type = 'city')
    INTO v_families, v_captains
    FROM public.geographic_demand_signals gds
    WHERE gds.initiative_id = p_initiative_id
    AND gds.city = p_city
    AND gds.state = p_state;

    RETURN QUERY
    WITH current_progress AS (
        SELECT 
            p_initiative_id as initiative_id,
            p_city as city,
            p_state as state,
            COALESCE(v_families, 0) as interested_families,
            (SELECT COUNT(DISTINCT user_id) FROM public.geographic_demand_signals 
             WHERE initiative_id = p_initiative_id AND city = p_city AND state = p_state 
             AND signal_type = 'hard_pledge') as committed_families,
            COALESCE((SELECT SUM(pledge_amount) FROM public.geographic_demand_signals 
             WHERE initiative_id = p_initiative_id AND city = p_city AND state = p_state), 0) as total_pledged,
            COALESCE(v_captains, 0) as active_captains
    ),
    tier_calc AS (
        SELECT 
            cp.*,
            CASE 
                WHEN cp.interested_families >= 500 THEN 'WILDFIRE'
                WHEN cp.interested_families >= 250 THEN 'INFERNO'
                WHEN cp.interested_families >= 150 THEN 'BLAZE'
                WHEN cp.interested_families >= 100 THEN 'FIRE'
                WHEN cp.interested_families >= 75 THEN 'FLAME'
                WHEN cp.interested_families >= 50 THEN 'EMBER'
                ELSE 'SPARK'
            END as current_tier
        FROM current_progress cp
    ),
    next_tier_info AS (
        SELECT 
            tc.*,
            CASE tc.current_tier
                WHEN 'SPARK' THEN 'EMBER'
                WHEN 'EMBER' THEN 'FLAME'
                WHEN 'FLAME' THEN 'FIRE'
                WHEN 'FIRE' THEN 'BLAZE'
                WHEN 'BLAZE' THEN 'INFERNO'
                WHEN 'INFERNO' THEN 'WILDFIRE'
                ELSE 'WILDFIRE'
            END as next_tier
        FROM tier_calc tc
    )
    SELECT 
        nti.initiative_id,
        nti.city,
        nti.state,
        nti.interested_families,
        nti.committed_families,
        nti.total_pledged,
        nti.active_captains,
        nti.current_tier,
        nti.next_tier,
        GREATEST(0, cst.families_required - nti.interested_families::INTEGER) as families_to_next_tier,
        GREATEST(0, cst.captains_required - nti.active_captains::INTEGER) as captains_to_next_tier
    FROM next_tier_info nti
    LEFT JOIN public.cold_start_thresholds cst 
        ON cst.initiative_id = nti.initiative_id 
        AND cst.tier = nti.next_tier;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.geographic_demand_signals IS 'Cold Start Milestone 2: Geographic demand aggregation for The 300 (Naval Fleet / Captains)';
COMMENT ON TABLE public.cold_start_thresholds IS 'Cold Start Milestone 2: Tier thresholds for SPARK → WILDFIRE progression (Captain = 1 ship)';
COMMENT ON VIEW public.geographic_cold_start_progress IS 'Cold Start Milestone 2: Aggregated progress by city for all initiatives';

-- ========== FROM: 20260304000004_storefront_aggregation_bounties.sql ==========
-- ═══════════════════════════════════════════════════════════════
-- MILESTONE 10: STOREFRONT AGGREGATION & QR CUE CARD BOUNTIES
-- ═══════════════════════════════════════════════════════════════

-- ─── BIZ STOREFRONTS (Aggregated Items) ───
-- Allows external businesses (Etsy, Shopify, etc.) to list a few 
-- items on the .biz portal without full duplicate data entry.
-- Tied to the "Cold Start C20" philosophy.

CREATE TABLE IF NOT EXISTS public.biz_storefront_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Item details
  external_item_id    TEXT, -- ID from Shopify, Etsy, etc.
  title               TEXT NOT NULL,
  description         TEXT,
  price_cents         INTEGER NOT NULL,
  currency            TEXT DEFAULT 'USD',
  image_url           TEXT,
  external_url        TEXT NOT NULL, -- Direct link to buy on their actual store
  
  -- C20 / Platform integration
  is_c20_eligible     BOOLEAN DEFAULT false,
  platform_margin_cents INTEGER DEFAULT 0, -- If sold through us, what is the margin?
  
  -- Status
  status              TEXT DEFAULT 'active', -- active, paused, out_of_stock
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biz_storefront_items_anchor ON public.biz_storefront_items(anchor_id);
CREATE INDEX idx_biz_storefront_items_owner ON public.biz_storefront_items(owner_id);

-- ─── QR CUE CARD PRINT BOUNTIES ───
-- Converts the 1 free digital QR Cue Card into a physical print bounty
-- fulfilled by the Salt Mines (volume dump).

CREATE TABLE IF NOT EXISTS public.qr_print_bounties (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cue_card_id         UUID NOT NULL REFERENCES public.cue_card_registry(id),
  requester_id        UUID NOT NULL REFERENCES auth.users(id),
  
  -- Order details
  quantity            INTEGER NOT NULL DEFAULT 250,
  material_type       TEXT DEFAULT 'standard_cardstock', -- standard_cardstock, nfc_plastic, metal
  shipping_address    JSONB NOT NULL,
  
  -- Financials (Volume Dump Mechanics)
  total_cost_cents    INTEGER NOT NULL,
  platform_margin_cents INTEGER NOT NULL, -- Cost + 20%
  ip_backing_joules   INTEGER DEFAULT 0, -- Joules backing this physical run
  
  -- Bounty Status (Salt Mines)
  bounty_status       TEXT DEFAULT 'open', -- open, claimed, printing, shipped, delivered
  claimed_by          UUID REFERENCES auth.users(id), -- The Maker/Printer in the Salt Mines
  claimed_at          TIMESTAMPTZ,
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_print_bounties_status ON public.qr_print_bounties(bounty_status);
CREATE INDEX idx_qr_print_bounties_requester ON public.qr_print_bounties(requester_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.biz_storefront_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_print_bounties ENABLE ROW LEVEL SECURITY;

-- Storefront items: public read, owner write
CREATE POLICY "Anyone can view storefront items" ON public.biz_storefront_items
  FOR SELECT USING (true);
CREATE POLICY "Owners can manage their storefront items" ON public.biz_storefront_items
  FOR ALL USING (auth.uid() = owner_id);

-- QR Print Bounties: public read (for Salt Mines), requester/claimer write
CREATE POLICY "Anyone can view open print bounties" ON public.qr_print_bounties
  FOR SELECT USING (true);
CREATE POLICY "Requesters can create print bounties" ON public.qr_print_bounties
  FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requesters can view their own bounties" ON public.qr_print_bounties
  FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Claimers can update their claimed bounties" ON public.qr_print_bounties
  FOR UPDATE USING (auth.uid() = claimed_by);

-- ========== FROM: 20260304000005_locality_and_garage_sales.sql ==========
-- ═══════════════════════════════════════════════════════════════
-- LOCALITY, MAPS, AND GARAGE SALES
-- ═══════════════════════════════════════════════════════════════

-- 1. Add Locality to Anchors (Businesses)
-- Allows filtering storefronts and businesses by zip, city, or lat/long
ALTER TABLE public.anchors 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT, -- State/Province
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS is_local_pickup_available BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_anchors_postal_code ON public.anchors(postal_code);
CREATE INDEX IF NOT EXISTS idx_anchors_city ON public.anchors(city);

-- 2. Family Table: Garage Sales
-- Integrating neighborhood garage sales into the Family Table ecosystem
CREATE TABLE IF NOT EXISTS public.family_garage_sales (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id             UUID NOT NULL REFERENCES auth.users(id),
  
  -- Details
  title               TEXT NOT NULL,
  description         TEXT,
  
  -- Locality
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),
  address_text        TEXT NOT NULL,
  city                TEXT,
  postal_code         TEXT,
  
  -- Schedule
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  
  -- Status
  status              TEXT DEFAULT 'scheduled', -- scheduled, active, completed, canceled
  
  -- Liana Banyan Integration
  accepts_marks       BOOLEAN DEFAULT true,
  marks_discount_pct  INTEGER DEFAULT 10, -- Discount if paying in Marks
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_garage_sales_locality ON public.family_garage_sales(postal_code, city);
CREATE INDEX idx_garage_sales_status ON public.family_garage_sales(status);
CREATE INDEX idx_garage_sales_dates ON public.family_garage_sales(start_time, end_time);

-- RLS
ALTER TABLE public.family_garage_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view garage sales" ON public.family_garage_sales
  FOR SELECT USING (true);
CREATE POLICY "Hosts can manage their garage sales" ON public.family_garage_sales
  FOR ALL USING (auth.uid() = host_id);

-- ========== FROM: 20260304000006_cold_start_c20_syncing.sql ==========
-- ═══════════════════════════════════════════════════════════════
-- COLD START C20 SYNCING LOGIC
-- ═══════════════════════════════════════════════════════════════

-- 1. StoreFront Sync Jobs
-- Tracks the automated or manual syncing of external storefronts
CREATE TABLE IF NOT EXISTS public.biz_storefront_sync_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync Details
  platform_type       TEXT NOT NULL, -- 'shopify', 'etsy', 'fiverr', 'custom'
  source_url          TEXT NOT NULL,
  
  -- Status
  status              TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  items_synced        INTEGER DEFAULT 0,
  error_message       TEXT,
  
  -- Timestamps
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_anchor ON public.biz_storefront_sync_jobs(anchor_id);
CREATE INDEX idx_sync_jobs_status ON public.biz_storefront_sync_jobs(status);

-- 2. Ready-Made Bounties (Salt Mines Integration)
-- Pre-defined templates for common business needs
CREATE TABLE IF NOT EXISTS public.ready_made_bounty_templates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Details
  title               TEXT NOT NULL UNIQUE,
  category            TEXT NOT NULL, -- 'design', 'development', 'syncing'
  short_description   TEXT NOT NULL,
  full_description    TEXT NOT NULL,
  
  -- Economics
  suggested_credits_min INTEGER NOT NULL,
  suggested_credits_max INTEGER NOT NULL,
  
  -- Tools/Platforms
  target_platforms    TEXT[], -- e.g., ['Google Sites', 'Squarespace', 'Wix']
  
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the Ready-Made Bounties
INSERT INTO public.ready_made_bounty_templates 
  (title, category, short_description, full_description, suggested_credits_min, suggested_credits_max, target_platforms)
VALUES
  ('WYSIWYG Website Setup', 'design', 'Basic website setup using drag-and-drop builders.', 'Need a simple web presence? A Maker will set up a clean, professional 3-page site using your preferred WYSIWYG builder. Includes linking your custom domain and setting up basic contact forms.', 500, 1500, ARRAY['Google Sites', 'Squarespace', 'Wix']),
  
  ('AI App Generation', 'development', 'Rapid prototyping using AI generation tools.', 'Have an idea for a simple web app or internal tool? A Maker will use modern AI generation tools to build a functional prototype based on your prompt.', 1000, 3000, ARRAY['Lovable', 'v0', 'Cursor']),
  
  ('StoreFront Syncing', 'syncing', 'Help linking external stores to the Liana Banyan .biz portal.', 'Need help getting your existing products into the Cold Start C20 system? A Maker will manually extract up to 20 of your best items and format them perfectly for your .biz Kaleidoscope listing.', 300, 800, ARRAY['Etsy', 'Shopify', 'Fiverr'])
ON CONFLICT (title) DO NOTHING;

-- 3. Kaleidoscope Placements
-- Tracks which businesses are featured in the Kaleidoscope based on trust/locality
CREATE TABLE IF NOT EXISTS public.kaleidoscope_placements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id           UUID NOT NULL REFERENCES public.anchors(id) ON DELETE CASCADE,
  
  -- Placement Details
  placement_type      TEXT DEFAULT 'organic', -- organic, featured (based on charitable tier)
  postal_code         TEXT NOT NULL,
  category            TEXT NOT NULL,
  
  -- Metrics
  impressions         INTEGER DEFAULT 0,
  clicks              INTEGER DEFAULT 0,
  
  -- Validity
  is_active           BOOLEAN DEFAULT true,
  last_verified_at    TIMESTAMPTZ DEFAULT NOW(),
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kaleidoscope_geo ON public.kaleidoscope_placements(postal_code, category);
CREATE INDEX idx_kaleidoscope_active ON public.kaleidoscope_placements(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE public.biz_storefront_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ready_made_bounty_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaleidoscope_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their sync jobs" ON public.biz_storefront_sync_jobs
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can create sync jobs" ON public.biz_storefront_sync_jobs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Anyone can view bounty templates" ON public.ready_made_bounty_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active kaleidoscope placements" ON public.kaleidoscope_placements
  FOR SELECT USING (is_active = true);

-- ========== FROM: 20260305000001_locality_and_bounties.sql ==========
-- Migration: Locality & QR Cue Card Bounties
-- Date: 2026-03-05
-- Description: Adds geolocation (lat/long) to businesses and garage sales, and creates schema for QR Cue Card print bounties.

-- 1. Add Locality (Lat/Long) to existing geographic tables
ALTER TABLE public.stewardship_applications 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create Local Listings table (expanded from just garage sales)
CREATE TABLE IF NOT EXISTS public.local_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id),
    listing_type TEXT NOT NULL, -- 'garage_sale', 'item', 'business', 'free', 'service'
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    start_time TIMESTAMPTZ, -- Optional for non-events
    end_time TIMESTAMPTZ,   -- Optional for non-events
    accepts_marks BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QR Cue Card Bounties Schema
CREATE TABLE IF NOT EXISTS public.qr_cue_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id),
    project_id UUID, -- Optional link to a specific project/initiative
    card_type TEXT NOT NULL, -- 'digital', 'physical_pending', 'physical_fulfilled'
    qr_hash TEXT UNIQUE NOT NULL, -- The immutable ledger hash
    design_data JSONB, -- The visual design of the card
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.print_bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES public.qr_cue_cards(id),
    requester_id UUID REFERENCES auth.users(id),
    fulfiller_id UUID REFERENCES auth.users(id), -- The Salt Mines worker who prints it
    production_level INTEGER NOT NULL CHECK (production_level BETWEEN 1 AND 6),
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_marks_locked DECIMAL(10, 2) NOT NULL, -- The Captain's collateral
    status TEXT DEFAULT 'open', -- 'open', 'claimed', 'printing', 'shipped', 'delivered'
    delivery_deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.local_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_cue_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_bounties ENABLE ROW LEVEL SECURITY;

-- ========== FROM: 20260305000009_care_units_stewardship.sql ==========
-- Migration: Category 1: Care Unit & Stewardship System
-- Description: Creates the tables for tracking Spark to Wildfire tiers, stewardship applications, backers, and command paths.

-- 1. initiative_care_units
CREATE TABLE IF NOT EXISTS public.initiative_care_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    geographic_area TEXT NOT NULL, -- e.g., 'Phoenix, AZ'
    tier TEXT NOT NULL CHECK (tier IN ('spark', 'ember', 'wildfire')),
    families_count INTEGER DEFAULT 0,
    captains_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. stewardship_applications
CREATE TABLE IF NOT EXISTS public.stewardship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    geographic_area TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ai_review', 'human_review', 'approved', 'rejected')),
    ai_advisor_recommendation TEXT,
    human_decision TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. stewardship_backers (The 6-person verification / escrow)
CREATE TABLE IF NOT EXISTS public.stewardship_backers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.stewardship_applications(id) ON DELETE CASCADE,
    backer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pledge_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'escrowed', 'released', 'forfeited')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. steward_pledges (Captain's own pledge)
CREATE TABLE IF NOT EXISTS public.steward_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    steward_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    amount_escrowed NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'forfeited')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. command_paths (Naval Rank hierarchy)
CREATE TABLE IF NOT EXISTS public.command_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_steward_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_steward_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    rank_level TEXT NOT NULL CHECK (rank_level IN ('captain', 'commodore', 'rear_admiral', 'vice_admiral', 'admiral', 'fleet_admiral')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies

ALTER TABLE public.initiative_care_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steward_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_paths ENABLE ROW LEVEL SECURITY;

-- initiative_care_units (Public read, admin write)
CREATE POLICY "initiative_care_units_select_all" ON public.initiative_care_units FOR SELECT USING (true);
CREATE POLICY "initiative_care_units_insert_admin" ON public.initiative_care_units FOR INSERT WITH CHECK ( (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin') );
CREATE POLICY "initiative_care_units_update_admin" ON public.initiative_care_units FOR UPDATE USING ( (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin') );

-- stewardship_applications (Users can read/write their own, admins can read/write all)
CREATE POLICY "stewardship_applications_select_own" ON public.stewardship_applications FOR SELECT USING (user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "stewardship_applications_insert_own" ON public.stewardship_applications FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "stewardship_applications_update_own" ON public.stewardship_applications FOR UPDATE USING (user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- stewardship_backers (Users can read/write their own pledges, applicant can read)
CREATE POLICY "stewardship_backers_select_own" ON public.stewardship_backers FOR SELECT USING (backer_user_id = (SELECT auth.uid()) OR application_id IN (SELECT id FROM public.stewardship_applications WHERE user_id = (SELECT auth.uid())) OR (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "stewardship_backers_insert_own" ON public.stewardship_backers FOR INSERT WITH CHECK (backer_user_id = (SELECT auth.uid()));
CREATE POLICY "stewardship_backers_update_own" ON public.stewardship_backers FOR UPDATE USING (backer_user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- steward_pledges (Users can read/write their own)
CREATE POLICY "steward_pledges_select_own" ON public.steward_pledges FOR SELECT USING (steward_user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));
CREATE POLICY "steward_pledges_insert_own" ON public.steward_pledges FOR INSERT WITH CHECK (steward_user_id = (SELECT auth.uid()));
CREATE POLICY "steward_pledges_update_own" ON public.steward_pledges FOR UPDATE USING (steward_user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- command_paths (Public read, admin write)
CREATE POLICY "command_paths_select_all" ON public.command_paths FOR SELECT USING (true);
CREATE POLICY "command_paths_insert_admin" ON public.command_paths FOR INSERT WITH CHECK ( (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin') );
CREATE POLICY "command_paths_update_admin" ON public.command_paths FOR UPDATE USING ( (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin') );

-- ========== FROM: 20260305000010_santa_ever_after.sql ==========
-- Migration: Category 4: Santa Ever After Nomination Protocol
-- Description: Creates the tables for the anti-fraud delivery architecture.

-- 1. santa_nominations
CREATE TABLE IF NOT EXISTS public.santa_nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nominator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL, -- In a real app, this would be encrypted
    reason_card TEXT NOT NULL, -- "Why They Deserve This"
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'assigned', 'delivered', 'flagged')),
    handshake_code TEXT, -- A 4-digit code generated upon approval
    oops_code TEXT, -- A distress code the recipient can use if they feel unsafe
    jesper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- The verified local deliverer
    purchaser_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- The person who paid (Purchaser != Deliverer)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.santa_nominations ENABLE ROW LEVEL SECURITY;

-- Nominators can see the nominations they submitted (but they won't see the Jesper's identity)
CREATE POLICY "santa_nominations_select_nominator" 
ON public.santa_nominations FOR SELECT 
USING (nominator_id = (SELECT auth.uid()));

-- Jespers can see nominations assigned to them
CREATE POLICY "santa_nominations_select_jesper" 
ON public.santa_nominations FOR SELECT 
USING (jesper_id = (SELECT auth.uid()));

-- Admins can see all
CREATE POLICY "santa_nominations_select_admin" 
ON public.santa_nominations FOR SELECT 
USING ( (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin') );

-- Anyone authenticated can insert a nomination
CREATE POLICY "santa_nominations_insert" 
ON public.santa_nominations FOR INSERT 
WITH CHECK ( auth.uid() IS NOT NULL );

-- Jespers can update status of their assigned deliveries
CREATE POLICY "santa_nominations_update_jesper" 
ON public.santa_nominations FOR UPDATE 
USING (jesper_id = (SELECT auth.uid()));

-- Admins can update any nomination
CREATE POLICY "santa_nominations_update_admin" 
ON public.santa_nominations FOR UPDATE 
USING ( (SELECT auth.uid()) IN (SELECT user_id FROM public.user_roles WHERE role = 'admin') );

-- ========== FROM: 20260306000000_farmer_supply_chain.sql ==========
-- ═══════════════════════════════════════════════════════════════════════
-- FARMER SUPPLY CHAIN — $5/Serving Vertical Integration
-- March 6, 2026
-- LMD (#1) + LGG (#2) + Brass Tacks (#16)
-- ═══════════════════════════════════════════════════════════════════════

-- 1. FARMER PROFILES
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  farm_name TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  county TEXT,
  state TEXT,
  distance_to_nearest_node NUMERIC,
  lat NUMERIC,
  lng NUMERIC,
  challenges TEXT[],
  advance_order_enabled BOOLEAN DEFAULT true,
  minimum_advance_order_days INTEGER DEFAULT 2,
  pickup_schedule TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. FARMER PRODUCE LISTINGS
CREATE TABLE IF NOT EXISTS farmer_produce (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('vegetables','fruits','herbs','dairy','eggs','meat','grains','honey','preserves','flowers')),
  item_name TEXT NOT NULL,
  seasonal_availability TEXT,
  organic_certified BOOLEAN DEFAULT false,
  estimated_weekly_volume TEXT,
  price_per_unit NUMERIC,
  unit TEXT DEFAULT 'lb',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DISTRIBUTION NODES
CREATE TABLE IF NOT EXISTS distribution_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('keep','guild-hall','member-home','church','school','business','mobile','farm-gate')),
  address TEXT,
  operator_id UUID REFERENCES auth.users(id),
  operator_share NUMERIC DEFAULT 0.833,
  has_refrigeration BOOLEAN DEFAULT false,
  has_freezer BOOLEAN DEFAULT false,
  has_freeze_dry BOOLEAN DEFAULT false,
  has_meal_prep_kitchen BOOLEAN DEFAULT false,
  parking_spaces INTEGER DEFAULT 0,
  max_weekly_volume TEXT,
  distribution_days TEXT[],
  advance_order_cutoff TEXT,
  zip_codes TEXT[],
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ADVANCE ORDERS — $5/serving
CREATE TABLE IF NOT EXISTS advance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  node_id UUID REFERENCES distribution_nodes(id),
  status TEXT NOT NULL DEFAULT 'advance-placed' CHECK (status IN ('advance-placed','farmer-confirmed','harvested','in-transit','at-node','picked-up','delivered')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  farmer_share NUMERIC DEFAULT 0,
  driver_share NUMERIC DEFAULT 0,
  node_operator_share NUMERIC DEFAULT 0,
  platform_margin NUMERIC DEFAULT 0,
  driver_id UUID REFERENCES auth.users(id),
  delivery_window_start TIMESTAMPTZ,
  delivery_window_end TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  order_placed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ADVANCE ORDER ITEMS
CREATE TABLE IF NOT EXISTS advance_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES advance_orders(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES farmer_profiles(id),
  produce_category TEXT,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  price_credits NUMERIC NOT NULL,
  organic BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FREEZE-DRIED MEAL KITS
CREATE TABLE IF NOT EXISTS meal_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 4,
  shelf_life TEXT DEFAULT '25 years',
  cost_basis NUMERIC NOT NULL,
  c20_price NUMERIC NOT NULL,
  advance_price_per_serving NUMERIC NOT NULL DEFAULT 5.00,
  walkup_price_per_serving NUMERIC NOT NULL DEFAULT 7.00,
  bulk_price_per_serving NUMERIC NOT NULL DEFAULT 4.00,
  cook_time TEXT DEFAULT '15 minutes',
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MEAL KIT INGREDIENTS
CREATE TABLE IF NOT EXISTS meal_kit_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES meal_kits(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  source TEXT CHECK (source IN ('local-farm','bulk-cooperative','specialty')),
  farmer_id UUID REFERENCES farmer_profiles(id),
  preservation_method TEXT CHECK (preservation_method IN ('freeze-dried','dehydrated','fresh','canned')),
  weight TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. STANDING ORDERS (recurring advance orders)
CREATE TABLE IF NOT EXISTS standing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  node_id UUID REFERENCES distribution_nodes(id),
  frequency TEXT NOT NULL CHECK (frequency IN ('one-time','weekly','biweekly','monthly')),
  preferred_day TEXT,
  preferred_time_window TEXT,
  advance_notice_days INTEGER DEFAULT 2,
  next_delivery_date DATE,
  pricing_tier TEXT NOT NULL DEFAULT 'advance' CHECK (pricing_tier IN ('advance','bulk')),
  price_per_serving NUMERIC NOT NULL DEFAULT 5.00,
  weekly_total NUMERIC DEFAULT 0,
  distributor_id UUID REFERENCES auth.users(id),
  distributor_earnings NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  pause_until DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. STANDING ORDER ITEMS
CREATE TABLE IF NOT EXISTS standing_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standing_order_id UUID REFERENCES standing_orders(id) ON DELETE CASCADE,
  kit_id UUID REFERENCES meal_kits(id),
  kit_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  servings INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. LOCAL DISTRIBUTOR BUSINESSES
CREATE TABLE IF NOT EXISTS local_distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  service_area TEXT[],
  node_ids UUID[],
  kit_types_offered TEXT[],
  weekly_capacity INTEGER DEFAULT 50,
  cost_per_serving_c20 NUMERIC DEFAULT 1.35,
  advance_retail_per_serving NUMERIC DEFAULT 5.00,
  walkup_retail_per_serving NUMERIC DEFAULT 7.00,
  bulk_retail_per_serving NUMERIC DEFAULT 4.00,
  active_standing_orders INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  member_since DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. PICKUP DRIVERS
CREATE TABLE IF NOT EXISTS pickup_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('car','van','truck','refrigerated-van')),
  vehicle_capacity TEXT,
  has_refrigeration BOOLEAN DEFAULT false,
  service_area TEXT[],
  available_days TEXT[],
  route_optimized BOOLEAN DEFAULT false,
  earnings_per_route NUMERIC DEFAULT 0,
  weekly_routes INTEGER DEFAULT 0,
  monthly_earnings NUMERIC DEFAULT 0,
  creator_share NUMERIC DEFAULT 0.833,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. PICKUP ROUTES
CREATE TABLE IF NOT EXISTS pickup_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES pickup_drivers(id),
  route_date DATE NOT NULL,
  total_miles NUMERIC DEFAULT 0,
  total_stops INTEGER DEFAULT 0,
  estimated_duration TEXT,
  fuel_cost NUMERIC DEFAULT 0,
  driver_earnings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','in-progress','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. PICKUP ROUTE STOPS
CREATE TABLE IF NOT EXISTS pickup_route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES pickup_routes(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  stop_type TEXT CHECK (stop_type IN ('farm-pickup','node-delivery')),
  location_id UUID,
  location_name TEXT,
  estimated_arrival TIMESTAMPTZ,
  items TEXT[],
  weight TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. MEAL-PREP PARTIES
CREATE TABLE IF NOT EXISTS meal_prep_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id),
  host_name TEXT NOT NULL,
  party_type TEXT NOT NULL CHECK (party_type IN ('fresh-cook','freeze-dried-kit','mixed','preservation')),
  node_id UUID REFERENCES distribution_nodes(id),
  home_address TEXT,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  participant_fee NUMERIC NOT NULL DEFAULT 20.00,
  party_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration TEXT DEFAULT '2 hours',
  total_revenue NUMERIC DEFAULT 0,
  host_share NUMERIC DEFAULT 0,
  ingredient_cost NUMERIC DEFAULT 0,
  platform_margin NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','in-progress','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. MEAL-PREP PARTY KITS
CREATE TABLE IF NOT EXISTS meal_prep_party_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES meal_prep_parties(id) ON DELETE CASCADE,
  kit_id UUID REFERENCES meal_kits(id),
  kit_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA: Initial meal kits at $5/serving
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO meal_kits (name, description, servings, cost_basis, c20_price, advance_price_per_serving, walkup_price_per_serving, bulk_price_per_serving, cook_time, difficulty)
VALUES
  ('Hearty Harvest Stew', 'Farm-fresh vegetables in a savory broth. Just add water, simmer 15 minutes.', 4, 4.50, 5.40, 5.00, 7.00, 4.00, '15 minutes', 'easy'),
  ('Garden Pasta Primavera', 'Seasonal vegetables over pasta with garlic herb sauce. Just add water, cook 20 minutes.', 4, 5.00, 6.00, 5.00, 7.00, 4.00, '20 minutes', 'easy'),
  ('Farm Breakfast Scramble', 'Eggs, peppers, onions, potatoes, cheese. Just add water, cook 10 minutes in skillet.', 2, 3.50, 4.20, 5.00, 7.00, 4.00, '10 minutes', 'easy'),
  ('Farmhouse Chicken Veggie Soup', 'Hearty chicken with farm vegetables in savory broth. Just add water, simmer 15 minutes.', 4, 5.50, 6.60, 5.00, 7.00, 4.00, '15 minutes', 'easy'),
  ('Frontier Chili Con Carne', 'Spiced ground beef with beans, tomatoes, peppers. Just add water, simmer 20 minutes.', 4, 6.00, 7.20, 5.00, 7.00, 4.00, '20 minutes', 'easy')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- RLS NOTE: These tables need proper RLS policies.
-- For now, enable RLS on all tables. Proper policies will be
-- added in the RLS audit migration.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_produce ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_kit_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE standing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE standing_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_prep_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_prep_party_kits ENABLE ROW LEVEL SECURITY;

-- Public read access for meal kits and distribution nodes (public-facing data)
CREATE POLICY "meal_kits_public_read" ON meal_kits FOR SELECT USING (true);
CREATE POLICY "distribution_nodes_public_read" ON distribution_nodes FOR SELECT USING (true);
CREATE POLICY "farmer_profiles_public_read" ON farmer_profiles FOR SELECT USING (is_active = true);

-- Authenticated users can create orders
CREATE POLICY "advance_orders_user_insert" ON advance_orders FOR INSERT WITH CHECK (auth.uid() = member_id);
CREATE POLICY "advance_orders_user_select" ON advance_orders FOR SELECT USING (auth.uid() = member_id OR auth.uid() = driver_id);
CREATE POLICY "standing_orders_user_insert" ON standing_orders FOR INSERT WITH CHECK (auth.uid() = member_id);
CREATE POLICY "standing_orders_user_select" ON standing_orders FOR SELECT USING (auth.uid() = member_id OR auth.uid() = distributor_id);
CREATE POLICY "standing_orders_user_update" ON standing_orders FOR UPDATE USING (auth.uid() = member_id);

-- Farmers manage their own profiles
CREATE POLICY "farmer_profiles_owner" ON farmer_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "farmer_produce_owner" ON farmer_produce FOR ALL USING (
  farmer_id IN (SELECT id FROM farmer_profiles WHERE user_id = auth.uid())
);

-- Drivers manage their own records
CREATE POLICY "pickup_drivers_owner" ON pickup_drivers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pickup_routes_driver" ON pickup_routes FOR ALL USING (
  driver_id IN (SELECT id FROM pickup_drivers WHERE user_id = auth.uid())
);

-- Distributors manage their own businesses
CREATE POLICY "local_distributors_owner" ON local_distributors FOR ALL USING (auth.uid() = member_id);

-- Party hosts manage their own events
CREATE POLICY "meal_prep_parties_host" ON meal_prep_parties FOR ALL USING (auth.uid() = host_id);
CREATE POLICY "meal_prep_parties_public_read" ON meal_prep_parties FOR SELECT USING (status = 'upcoming');

-- ========== FROM: 20260306000002_imgur_plug_and_payment_plugs.sql ==========
-- =====================================================================
-- Migration: Imgur Social Plug + Payment Plugs + As You Wish Confirmation
-- Date: March 6, 2026
-- Author: Bishop (Claude) under direction of Jonathan Jones, Founder
-- =====================================================================

-- =====================================================================
-- PART 1: Add Imgur to social_plug_features
-- =====================================================================

INSERT INTO social_plug_features (
  id, platform, display_name, icon, color, features,
  oauth_config, is_available, requires_approval, approval_status
) VALUES (
  gen_random_uuid(),
  'imgur',
  'Imgur',
  '🖼️',
  'bg-emerald-600',
  '{"login": true, "share": true, "upload": true, "gallery": true}'::jsonb,
  '{"authUrl": "https://api.imgur.com/oauth2/authorize", "tokenUrl": "https://api.imgur.com/oauth2/token", "scope": ""}'::jsonb,
  true,
  false,
  'approved'
) ON CONFLICT (platform) DO NOTHING;

-- =====================================================================
-- PART 2: Add Substack to social_plug_features (RSS-based, no OAuth)
-- =====================================================================

INSERT INTO social_plug_features (
  id, platform, display_name, icon, color, features,
  oauth_config, is_available, requires_approval, approval_status
) VALUES (
  gen_random_uuid(),
  'substack',
  'Substack',
  '📰',
  'bg-orange-500',
  '{"content_feed": true, "share": false, "login": false}'::jsonb,
  '{"type": "rss", "feedPattern": "https://{handle}.substack.com/feed"}'::jsonb,
  true,
  false,
  'approved'
) ON CONFLICT (platform) DO NOTHING;

-- =====================================================================
-- PART 3: Payment Plugs — External peer-to-peer payment rails
-- These are NOT payment processing (Stripe handles that).
-- These are member-exposed tip jars / donation rails.
-- =====================================================================

CREATE TABLE IF NOT EXISTS member_payment_plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN (
    'paypal', 'kofi', 'venmo', 'cashapp', 'zelle'
  )),
  handle_or_url TEXT NOT NULL,
  display_name TEXT, -- e.g., "My PayPal" or "Business Venmo"
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One entry per platform per user
  UNIQUE(user_id, platform)
);

-- RLS: Users manage only their own payment plugs
ALTER TABLE member_payment_plugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_own_payment_plugs ON member_payment_plugs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY manage_own_payment_plugs ON member_payment_plugs
  FOR ALL USING (auth.uid() = user_id);

-- Public can view active payment plugs (for profile display)
CREATE POLICY view_active_payment_plugs ON member_payment_plugs
  FOR SELECT USING (is_active = true);

-- Trigger: Only one primary per user
CREATE OR REPLACE FUNCTION enforce_single_primary_payment_plug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE member_payment_plugs
    SET is_primary = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_primary_payment_plug
  BEFORE INSERT OR UPDATE ON member_payment_plugs
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_primary_payment_plug();

-- Index for profile lookups
CREATE INDEX IF NOT EXISTS idx_payment_plugs_user
  ON member_payment_plugs(user_id) WHERE is_active = true;

-- =====================================================================
-- PART 4: "As You Wish" Confirmation Phrase
-- Default is "As You Wish" — members can customize
-- =====================================================================

-- user_preferences table does not exist yet — create it first
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  confirmation_phrase TEXT DEFAULT 'As You Wish',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON COLUMN user_preferences.confirmation_phrase IS
  'Custom transaction confirmation phrase. Default: "As You Wish". '
  'Displayed on the confirmation button for all transactions (credit purchases, '
  'Swoop donations, orders, etc). Members may customize to their preference.';

-- =====================================================================
-- PART 5: Payment platform metadata (lookup table)
-- =====================================================================

CREATE TABLE IF NOT EXISTS payment_platform_registry (
  platform TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  url_pattern TEXT, -- e.g., 'paypal.me/{handle}'
  url_prefix TEXT,  -- e.g., 'https://paypal.me/'
  handle_prefix TEXT, -- e.g., '$' for Cash App, '@' for Venmo
  validation_regex TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO payment_platform_registry (platform, display_name, icon, color, url_pattern, url_prefix, handle_prefix, validation_regex, is_available)
VALUES
  ('paypal', 'PayPal', '💳', 'bg-blue-600', 'paypal.me/{handle}', 'https://paypal.me/', NULL, '^[a-zA-Z0-9._-]+$', true),
  ('kofi', 'Ko-fi', '☕', 'bg-sky-400', 'ko-fi.com/{handle}', 'https://ko-fi.com/', NULL, '^[a-zA-Z0-9_]+$', true),
  ('venmo', 'Venmo', '💙', 'bg-blue-500', '@{handle}', 'https://venmo.com/', '@', '^@?[a-zA-Z0-9._-]+$', true),
  ('cashapp', 'Cash App', '💚', 'bg-green-500', '${handle}', 'https://cash.app/', '$', '^\$?[a-zA-Z0-9_]+$', true),
  ('zelle', 'Zelle', '💜', 'bg-purple-600', '{handle}', NULL, NULL, '^[a-zA-Z0-9.@+_-]+$', true)
ON CONFLICT (platform) DO NOTHING;

-- Public read access for the registry
ALTER TABLE payment_platform_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY view_payment_platforms ON payment_platform_registry
  FOR SELECT USING (true);
