-- ============================================================
-- SWITZERLAND RULE ARENAS + UNIVERSAL STAMP SYSTEM
-- February 9, 2026
-- ============================================================
--
-- "Let your yea be yea and your nay be nay."
--
-- The Personal Stamp is the atomic unit of accountability.
-- It applies EVERYWHERE a member says "yes" or "no":
--   - Arena gateway crossings (Switzerland Rule)
--   - Shirley Temple Protocol (content visibility changes)
--   - Cue card QR stamps
--   - Contract signing
--   - Work submission ("I submit this as my own")
--   - Legal acknowledgments
--   - Glowing Keys validation (maintenance program)
--   - Petition signatures
--   - Anything requiring "I read this / I agree / I did this"
--
-- Every stamp is a SHA-256 hash recorded to the IP Ledger.
-- Permanent. Immutable. Your word, recorded.
--
-- GLOWING KEYS: A maintenance/validation program.
-- Keys glow brighter = worth more. Some keys have only 100
-- stamps before they vanish and reappear somewhere else that
-- needs validation — new features, updated content, etc.
-- You get rewarded for stamping wherever a key hides.
--
-- Three Arenas (OUTSIDE LB proper):
--   1. Political Expedition — political/civic
--   2. Areopagus — religious/theological
--   3. Crucible — debate/argumentation
--
-- Credits, MARKS, and Joules still work past the gateway.
-- Harpers classify content inside LB; they don't moderate arenas.
-- Reputation is organic. Classification governs visibility.
-- ============================================================

-- ─── ARENAS (created first so other tables can reference it) ───

CREATE TABLE IF NOT EXISTS arenas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  portal_name text NOT NULL,
  description text,
  category text NOT NULL,
  icon text,
  entry_flagstone_text text,
  exit_flagstone_text text,
  discord_invite_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arenas' AND policyname = 'Arenas are publicly readable') THEN
    CREATE POLICY "Arenas are publicly readable" ON arenas FOR SELECT USING (true);
  END IF;
END $$;

-- ─── UNIVERSAL ACKNOWLEDGMENT STAMPS (IP Ledger) ───
-- The foundation. Every meaningful "yes" or "no" in the system.

CREATE TABLE IF NOT EXISTS acknowledgment_stamps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  action_type text NOT NULL,
    -- Arena: 'arena_enter', 'arena_exit'
    -- Shirley Temple: 'visibility_change', 'classification_accept'
    -- Cue Cards: 'cue_card_stamp'
    -- Contracts: 'contract_sign', 'contract_accept', 'contract_reject'
    -- Work: 'work_submit', 'work_certify_own'
    -- Legal: 'legal_acknowledge', 'terms_accept', 'privacy_accept'
    -- Glowing Keys: 'key_validate', 'key_stamp'
    -- Petitions: 'petition_sign'
    -- General: 'read_confirm', 'age_verify'
  action_id text NOT NULL,
  arena_id uuid REFERENCES arenas(id),
  stamp_hash text NOT NULL,
  flagstone_text_shown text,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  stamped_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stamps_user ON acknowledgment_stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_stamps_action ON acknowledgment_stamps(action_type, action_id);
CREATE INDEX IF NOT EXISTS idx_stamps_time ON acknowledgment_stamps(stamped_at);

ALTER TABLE acknowledgment_stamps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'acknowledgment_stamps' AND policyname = 'Users see own stamps') THEN
    CREATE POLICY "Users see own stamps" ON acknowledgment_stamps FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'acknowledgment_stamps' AND policyname = 'Users can create stamps') THEN
    CREATE POLICY "Users can create stamps" ON acknowledgment_stamps FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── GLOWING KEYS — Maintenance/Validation Program ───
-- Keys glow. Brighter glow = more reward.
-- Some keys are limited: 100 stamps, then they vanish
-- and reappear somewhere new that needs validation.
-- Easy keys exist. Hard keys exist. All reward you for stamping.

CREATE TABLE IF NOT EXISTS glowing_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key_code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  location_route text NOT NULL,        -- where the key currently lives (page route)
  location_hint text,                  -- clue to find it
  glow_level integer NOT NULL DEFAULT 1, -- 1-5, brighter = worth more
  reward_credits integer NOT NULL DEFAULT 5,
  reward_marks integer NOT NULL DEFAULT 1,
  max_stamps integer,                  -- NULL = unlimited, 100 = vanishes after 100
  current_stamps integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_wandering boolean DEFAULT false,  -- true = relocates after max_stamps
  next_location_route text,            -- where it goes after exhaustion
  purpose text DEFAULT 'validation',   -- 'validation','new_feature','maintenance','seasonal'
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE glowing_keys ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'glowing_keys' AND policyname = 'Glowing keys are publicly visible') THEN
    CREATE POLICY "Glowing keys are publicly visible" ON glowing_keys FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ─── GLOWING KEY STAMPS (who found what) ───

CREATE TABLE IF NOT EXISTS glowing_key_stamps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  key_id uuid REFERENCES glowing_keys(id) NOT NULL,
  stamp_id uuid REFERENCES acknowledgment_stamps(id), -- links to universal stamp
  credits_awarded integer NOT NULL DEFAULT 0,
  marks_awarded integer NOT NULL DEFAULT 0,
  glow_level_at_stamp integer,
  stamped_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key_id) -- one stamp per key per user
);

ALTER TABLE glowing_key_stamps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'glowing_key_stamps' AND policyname = 'Users see own key stamps') THEN
    CREATE POLICY "Users see own key stamps" ON glowing_key_stamps FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'glowing_key_stamps' AND policyname = 'Users can stamp keys') THEN
    CREATE POLICY "Users can stamp keys" ON glowing_key_stamps FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── CONTENT CLASSIFICATION (Shirley Temple Protocol) ───
-- "Can Shirley Temple watch it?" — per-tag visibility.
-- Every change requires a stamp. Harpers regulate classification inside LB.

CREATE TABLE IF NOT EXISTS content_classifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content_tag text NOT NULL,
  visibility_level integer NOT NULL DEFAULT 1,
    -- 1 = Family-safe ("Can Shirley Temple watch it?")
    -- 2 = Personal interest ("Do you want to watch it?")
    -- 3 = Hidden ("Do you want to NOT see anything about it?")
  set_at timestamptz DEFAULT now(),
  stamp_id uuid REFERENCES acknowledgment_stamps(id),
  UNIQUE(user_id, content_tag)
);

ALTER TABLE content_classifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_classifications' AND policyname = 'Users see own classifications') THEN
    CREATE POLICY "Users see own classifications" ON content_classifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_classifications' AND policyname = 'Users can set classifications') THEN
    CREATE POLICY "Users can set classifications" ON content_classifications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_classifications' AND policyname = 'Users can update own classifications') THEN
    CREATE POLICY "Users can update own classifications" ON content_classifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── ARENA MEMBERSHIPS ───

CREATE TABLE IF NOT EXISTS arena_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  arena_id uuid REFERENCES arenas(id) NOT NULL,
  tier integer NOT NULL DEFAULT 3,
  reputation_score numeric(6,2) DEFAULT 50.00,
  joined_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  is_frozen boolean DEFAULT false,
  freeze_until timestamptz,
  freeze_tier text,
  total_posts integer DEFAULT 0,
  total_reports_received integer DEFAULT 0,
  UNIQUE(user_id, arena_id)
);

ALTER TABLE arena_memberships ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_memberships' AND policyname = 'Users see own arena memberships') THEN
    CREATE POLICY "Users see own arena memberships" ON arena_memberships FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_memberships' AND policyname = 'Users can join arenas') THEN
    CREATE POLICY "Users can join arenas" ON arena_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_memberships' AND policyname = 'Users can update own membership') THEN
    CREATE POLICY "Users can update own membership" ON arena_memberships FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── ARENA POSTS ───

CREATE TABLE IF NOT EXISTS arena_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  arena_id uuid REFERENCES arenas(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  parent_id uuid REFERENCES arena_posts(id),
  tier integer NOT NULL,
  title text,
  body text NOT NULL,
  sources text[],
  steelman text,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  is_removed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE arena_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_posts' AND policyname = 'Arena posts readable by members') THEN
    CREATE POLICY "Arena posts readable by members" ON arena_posts FOR SELECT USING (NOT is_removed);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_posts' AND policyname = 'Users can create arena posts') THEN
    CREATE POLICY "Users can create arena posts" ON arena_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_posts' AND policyname = 'Users can update own posts') THEN
    CREATE POLICY "Users can update own posts" ON arena_posts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── PETITIONS ───

CREATE TABLE IF NOT EXISTS petitions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  arena_id uuid REFERENCES arenas(id) NOT NULL,
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  petition_type text NOT NULL DEFAULT 'general',
  target_entity text,
  signature_threshold integer NOT NULL DEFAULT 500,
  current_signatures integer DEFAULT 0,
  status text DEFAULT 'collecting',
  civility_review_passed boolean,
  civility_reviewed_by text,
  town_hall_promoted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'petitions' AND policyname = 'Petitions are publicly readable') THEN
    CREATE POLICY "Petitions are publicly readable" ON petitions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'petitions' AND policyname = 'Members can create petitions') THEN
    CREATE POLICY "Members can create petitions" ON petitions FOR INSERT WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

-- ─── PETITION SIGNATURES ───

CREATE TABLE IF NOT EXISTS petition_signatures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id uuid REFERENCES petitions(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  comment text,
  signed_at timestamptz DEFAULT now(),
  UNIQUE(petition_id, user_id)
);

ALTER TABLE petition_signatures ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'petition_signatures' AND policyname = 'Signatures are publicly countable') THEN
    CREATE POLICY "Signatures are publicly countable" ON petition_signatures FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'petition_signatures' AND policyname = 'Members can sign petitions') THEN
    CREATE POLICY "Members can sign petitions" ON petition_signatures FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── FREEZE PENALTIES ───

CREATE TABLE IF NOT EXISTS arena_freezes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  arena_id uuid REFERENCES arenas(id),
  freeze_tier text NOT NULL,
  reason text NOT NULL,
  duration_hours integer NOT NULL,
  credits_to_resolve integer DEFAULT 0,
  resolved_by text,
  frozen_at timestamptz DEFAULT now(),
  unfrozen_at timestamptz,
  is_active boolean DEFAULT true
);

ALTER TABLE arena_freezes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_freezes' AND policyname = 'Users see own freezes') THEN
    CREATE POLICY "Users see own freezes" ON arena_freezes FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── ARENA REPORTS ───

CREATE TABLE IF NOT EXISTS arena_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES auth.users(id) NOT NULL,
  reported_user_id uuid REFERENCES auth.users(id) NOT NULL,
  arena_id uuid REFERENCES arenas(id),
  post_id uuid REFERENCES arena_posts(id),
  reason text NOT NULL,
  reporter_trust_level integer DEFAULT 1,
  effective_weight numeric(4,2) DEFAULT 1.00,
  status text DEFAULT 'pending',
  reviewed_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE arena_reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_reports' AND policyname = 'Users see own reports') THEN
    CREATE POLICY "Users see own reports" ON arena_reports FOR SELECT USING (auth.uid() = reporter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'arena_reports' AND policyname = 'Users can file reports') THEN
    CREATE POLICY "Users can file reports" ON arena_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;
END $$;

-- ─── REPRESENTATIVE TRACKING (Political Expedition) ───

CREATE TABLE IF NOT EXISTS representative_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  representative_name text NOT NULL,
  office text NOT NULL,
  state text,
  district text,
  party text,
  bill_id text,
  bill_title text,
  vote_cast text,
  vote_date date,
  alignment_tags text[],
  source_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE representative_tracking ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'representative_tracking' AND policyname = 'Representative tracking is public') THEN
    CREATE POLICY "Representative tracking is public" ON representative_tracking FOR SELECT USING (true);
  END IF;
END $$;

-- ─── SEED THE THREE ARENAS ───

INSERT INTO arenas (slug, name, portal_name, description, category, icon, entry_flagstone_text, exit_flagstone_text, discord_invite_url)
VALUES
  (
    'political-expedition',
    'Political Expedition',
    'Political Expedition',
    'Political and civic discussion. Track representatives. Advocate based on voting records. Vote FOR people who vote for you.',
    'political',
    '🏛️',
    E'You are crossing the gateway into Political Expedition.\n\n⬡ You are leaving Liana Banyan proper.\n⬡ The Switzerland Rule is SUSPENDED here.\n⬡ Your Credits, MARKS, and Joules still work.\n⬡ Reputation earned here carries back.\n⬡ Harpers do not moderate arena content — only classify it.\n\nLet your yea be yea and your nay be nay.\n\nBy stamping, you acknowledge these terms.\nThis acknowledgment is recorded to the IP Ledger.',
    E'Welcome back to neutral ground.\n\nThe Switzerland Rule is now active.\n\n⬡ Policy debates stay in Political Expedition\n⬡ No campaign language in neutral zones\n⬡ We build together, regardless of ballot\n\n"In essentials, unity. In non-essentials, liberty. In all things, charity."',
    NULL
  ),
  (
    'areopagus',
    'Areopagus',
    'Areopagus',
    'Religious and theological discussion. Every faith represented. Similarities, differences, and respectful dialogue.',
    'religious',
    '⛪',
    E'You are crossing the gateway into the Areopagus.\n\n⬡ You are leaving Liana Banyan proper.\n⬡ The Switzerland Rule is SUSPENDED here.\n⬡ Your Credits, MARKS, and Joules still work.\n⬡ Reputation earned here carries back.\n⬡ Harpers do not moderate arena content — only classify it.\n\nLet your yea be yea and your nay be nay.\n\nBy stamping, you acknowledge these terms.\nThis acknowledgment is recorded to the IP Ledger.',
    E'He who enters the Areopagus as a friend shall leave as a friend.\n\nThe Switzerland Rule is now active.\n\n⬡ Keep the discussion in the arena\n⬡ Do not pursue disagreements outside\n⬡ Treat all members as collaborators first',
    NULL
  ),
  (
    'crucible',
    'Crucible',
    'Crucible',
    'Debate and argumentation on any topic. Forge ideas in the heat of discourse. May the best argument win.',
    'debate',
    '🔥',
    E'You are crossing the gateway into the Crucible.\n\n⬡ You are leaving Liana Banyan proper.\n⬡ The Switzerland Rule is SUSPENDED here.\n⬡ Your Credits, MARKS, and Joules still work.\n⬡ Reputation earned here carries back.\n⬡ Harpers do not moderate arena content — only classify it.\n\nLet your yea be yea and your nay be nay.\n\nBy stamping, you acknowledge these terms.\nThis acknowledgment is recorded to the IP Ledger.',
    E'Babble-On no further.\n\nThe Switzerland Rule is now active.\n\n⬡ What happens in the Crucible stays in the Crucible\n⬡ No grudges carried to the main platform\n⬡ Sharpen iron with iron, not with spite',
    NULL
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  portal_name = EXCLUDED.portal_name,
  entry_flagstone_text = EXCLUDED.entry_flagstone_text,
  exit_flagstone_text = EXCLUDED.exit_flagstone_text;

-- ─── SEED GLOWING KEYS (maintenance/validation program) ───

INSERT INTO glowing_keys (key_code, title, description, location_route, location_hint, glow_level, reward_credits, reward_marks, max_stamps, is_wandering, purpose)
VALUES
  ('GLOW-LANDING-001',    'Welcome Glow',        'Validate the landing page is working correctly.',           '/',                    'The very first page.',            2, 10, 2, NULL,  false, 'validation'),
  ('GLOW-DINNER-002',     'Table Light',          'Confirm Let''s Make Dinner page loads with initiative data.', '/initiatives/lets-make-dinner', 'Where neighbors gather.', 2, 10, 2, NULL,  false, 'validation'),
  ('GLOW-HERALD-003',     'Chain Link',           'Validate Herald subscription tiers display correctly.',      '/herald',              'Don''t break the chain.',         3, 15, 3, 100,   true,  'validation'),
  ('GLOW-DURIN-004',      'Door Gleam',           'Test a Durin''s Door password in any language.',             '/durins-door',         'Speak friend.',                   4, 25, 5, 100,   true,  'validation'),
  ('GLOW-MANUFACTURING-005','Factory Spark',       'Browse the manufacturing catalog. Confirm products load.',  '/manufacturing',       'Where bread is made.',            2, 10, 2, NULL,  false, 'new_feature'),
  ('GLOW-LOOKING-006',    'Glass Gleam',          'Check the Looking Glass transparency log.',                  '/looking-glass',       'See through the glass.',          3, 15, 3, 100,   true,  'new_feature'),
  ('GLOW-ARENAS-007',     'Gateway Flame',        'Cross an arena gateway and stamp your agreement.',          '/arenas',              'Beyond the Switzerland Rule.',    4, 25, 5, 100,   true,  'new_feature'),
  ('GLOW-GOVERNANCE-008', 'Council Torch',        'Visit governance and review The 300 framework.',            '/governance',          'Where 300 govern.',               3, 15, 3, NULL,  false, 'validation'),
  ('GLOW-MATCHTRADE-009', 'Exchange Ember',       'View the MatchTrade service exchange.',                     '/matchtrade',          'MARKS for MARKS.',                2, 10, 2, NULL,  false, 'validation'),
  ('GLOW-GAME-010',       'Card Shimmer',         'Find 5 cards in the 52-Card Treasure Map Game.',            '/treasure-map-game',   'Collect the deck.',               5, 50, 10, 100,  true,  'new_feature'),
  ('GLOW-HOFUND-011',     'Bifrost Flash',        'Stamp a cue card in Hofund Studio.',                        '/hofund',              'Turn the dial.',                  3, 15, 3, NULL,  false, 'validation'),
  ('GLOW-SPONSOR-012',    'Seed Glow',            'Visit the Johnny Appleseed program.',                       '/sponsor',             'Plant seeds.',                    2, 10, 2, NULL,  false, 'validation'),
  ('GLOW-SEASONAL-W01',   'Winter Solstice Key',  'Seasonal wandering key. Find it before it moves.',          '/deck',                'Flip a card at midnight.',        5, 50, 10, 50,   true,  'seasonal'),
  ('GLOW-MAINT-M01',      'Checkup Key',          'Monthly maintenance validation. Verify core features.',     '/dashboard',           'Check your numbers.',             3, 20, 4, 100,   true,  'maintenance')
ON CONFLICT (key_code) DO NOTHING;

-- ─── SEED DNA LOCK for Switzerland Rule + Stamps ───

INSERT INTO dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('switzerland_rule',             'active',  'text',    true, 'SYSTEM', 'Political and religious topics confined to designated arenas', 'governance'),
  ('arena_freeze_yellow_hours',    '4',       'integer', true, 'SYSTEM', 'Yellow freeze duration in hours',                             'arenas'),
  ('arena_freeze_orange_hours',    '24',      'integer', true, 'SYSTEM', 'Orange freeze duration in hours',                             'arenas'),
  ('arena_freeze_red_days',        '7',       'integer', true, 'SYSTEM', 'Red freeze duration in days',                                 'arenas'),
  ('arena_freeze_black_days',      '30',      'integer', true, 'SYSTEM', 'Black freeze duration in days',                               'arenas'),
  ('petition_signature_threshold', '500',     'integer', true, 'SYSTEM', 'Signatures needed for Town Hall promotion',                    'arenas'),
  ('stamp_immutability',           'true',    'boolean', true, 'SYSTEM', 'Acknowledgment stamps cannot be deleted or modified',          'stamps'),
  ('stamp_hash_algorithm',         'SHA-256', 'text',    true, 'SYSTEM', 'Hash algorithm for stamp verification',                        'stamps')
ON CONFLICT (parameter_key) DO NOTHING;
