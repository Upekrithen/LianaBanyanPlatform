-- ============================================================
-- PROGRESSIVE DISCOVERY SYSTEM — February 10, 2026
-- ============================================================
-- Chalk-outline bookshelf, deck card placement, discovery gates,
-- Keep size tiers, CSS Zen Garden themes
-- ============================================================

-- ─── DISCOVERY CATEGORIES (what categories exist) ───

CREATE TABLE IF NOT EXISTS discovery_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  trigger_type text NOT NULL DEFAULT 'visit',
    -- 'always'    = visible from start (Essentials)
    -- 'visit'     = appears after visiting a route
    -- 'action'    = appears after performing an action
    -- 'gate'      = requires explicit gate acceptance
  trigger_value text,
    -- route path for 'visit', action_id for 'action', gate_id for 'gate'
  max_visible_slots integer DEFAULT 3,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discovery_categories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_categories' AND policyname = 'Discovery categories are public') THEN
    CREATE POLICY "Discovery categories are public" ON discovery_categories FOR SELECT USING (true);
  END IF;
END $$;

-- ─── DISCOVERABLE CARDS (what can be placed in slots) ───

CREATE TABLE IF NOT EXISTS discoverable_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug text NOT NULL REFERENCES discovery_categories(slug),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  destination_route text NOT NULL,
  card_type text DEFAULT 'location',
    -- 'location'   = navigates to a place
    -- 'ability'    = grants a capability
    -- 'hall'       = Hexagon hall access
    -- 'island'     = HexIsle island
    -- 'arena'      = Switzerland Rule arena
  hint_text text,
    -- shown on the back of the chalk-outline flip card
  discovery_route text,
    -- visiting this route "discovers" this card for the user
  sort_order integer DEFAULT 0,
  glow_level integer DEFAULT 0,
    -- 0=none, 1-5=increasingly bright glow when undiscovered but nearby
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discoverable_cards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discoverable_cards' AND policyname = 'Discoverable cards are public') THEN
    CREATE POLICY "Discoverable cards are public" ON discoverable_cards FOR SELECT USING (true);
  END IF;
END $$;

-- ─── USER DISCOVERY STATE (what has user discovered) ───

CREATE TABLE IF NOT EXISTS user_discovery_state (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category_slug text NOT NULL,
  card_slug text,
    -- NULL = discovered the category, non-null = discovered specific card
  discovered_at timestamptz DEFAULT now(),
  stamp_id uuid REFERENCES acknowledgment_stamps(id),
  UNIQUE(user_id, category_slug, card_slug)
);

ALTER TABLE user_discovery_state ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_discovery_state' AND policyname = 'Users see own discoveries') THEN
    CREATE POLICY "Users see own discoveries" ON user_discovery_state FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_discovery_state' AND policyname = 'Users can discover') THEN
    CREATE POLICY "Users can discover" ON user_discovery_state FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── USER CARD PLACEMENTS (which cards are in which slots) ───

CREATE TABLE IF NOT EXISTS user_card_placements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category_slug text NOT NULL,
  slot_index integer NOT NULL,
    -- 0-based position within the category's viewport
  card_slug text NOT NULL,
  placed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_slug, slot_index),
  UNIQUE(user_id, card_slug)
    -- each card can only be placed once
);

ALTER TABLE user_card_placements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_card_placements' AND policyname = 'Users see own placements') THEN
    CREATE POLICY "Users see own placements" ON user_card_placements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_card_placements' AND policyname = 'Users can place cards') THEN
    CREATE POLICY "Users can place cards" ON user_card_placements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_card_placements' AND policyname = 'Users can move cards') THEN
    CREATE POLICY "Users can move cards" ON user_card_placements FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_card_placements' AND policyname = 'Users can remove cards') THEN
    CREATE POLICY "Users can remove cards" ON user_card_placements FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── USER BOOKSHELF CONFIG (viewport position per category) ───

CREATE TABLE IF NOT EXISTS user_bookshelf_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category_slug text NOT NULL,
  viewport_offset integer DEFAULT 0,
    -- which row of 3 is currently visible (0 = first 3, 1 = next 3, etc.)
  is_collapsed boolean DEFAULT false,
  custom_sort_order integer,
  UNIQUE(user_id, category_slug)
);

ALTER TABLE user_bookshelf_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_bookshelf_config' AND policyname = 'Users see own bookshelf') THEN
    CREATE POLICY "Users see own bookshelf" ON user_bookshelf_config FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_bookshelf_config' AND policyname = 'Users can configure bookshelf') THEN
    CREATE POLICY "Users can configure bookshelf" ON user_bookshelf_config FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_bookshelf_config' AND policyname = 'Users can update bookshelf') THEN
    CREATE POLICY "Users can update bookshelf" ON user_bookshelf_config FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── DISCOVERY GATES (the "Do you want to Discover X?" prompts) ───

CREATE TABLE IF NOT EXISTS discovery_gates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gate_slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category_slug text NOT NULL REFERENCES discovery_categories(slug),
  trigger_route text NOT NULL,
    -- when user visits this route, gate appears
  icon text,
  yes_label text DEFAULT 'Yes, show me',
  no_label text DEFAULT 'Not now',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discovery_gates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discovery_gates' AND policyname = 'Gates are public') THEN
    CREATE POLICY "Gates are public" ON discovery_gates FOR SELECT USING (true);
  END IF;
END $$;

-- ─── USER GATE RESPONSES (has user accepted/dismissed a gate) ───

CREATE TABLE IF NOT EXISTS user_gate_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  gate_slug text NOT NULL,
  response text NOT NULL,
    -- 'accepted', 'dismissed'
  responded_at timestamptz DEFAULT now(),
  stamp_id uuid REFERENCES acknowledgment_stamps(id),
  UNIQUE(user_id, gate_slug)
);

ALTER TABLE user_gate_responses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_gate_responses' AND policyname = 'Users see own gate responses') THEN
    CREATE POLICY "Users see own gate responses" ON user_gate_responses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_gate_responses' AND policyname = 'Users can respond to gates') THEN
    CREATE POLICY "Users can respond to gates" ON user_gate_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── KEEP SIZE TIERS ───

CREATE TABLE IF NOT EXISTS keep_tiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  max_categories integer NOT NULL,
  max_slots_per_category integer NOT NULL DEFAULT 3,
  requirement_type text NOT NULL,
    -- 'free', 'membership', 'bounties', 'keep_launch', 'crown_nomination', 'crown_holder'
  requirement_value integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keep_tiers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'keep_tiers' AND policyname = 'Keep tiers are public') THEN
    CREATE POLICY "Keep tiers are public" ON keep_tiers FOR SELECT USING (true);
  END IF;
END $$;

-- ─── CSS ZEN GARDEN: User Themes ───

CREATE TABLE IF NOT EXISTS user_themes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  target_element text NOT NULL,
    -- data-zen attribute value this theme targets
  css_content text NOT NULL,
  preview_image_url text,
  status text DEFAULT 'submitted',
    -- 'submitted', 'approved', 'featured', 'rejected'
  vote_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_themes' AND policyname = 'Themes are publicly viewable') THEN
    CREATE POLICY "Themes are publicly viewable" ON user_themes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_themes' AND policyname = 'Users can submit themes') THEN
    CREATE POLICY "Users can submit themes" ON user_themes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_themes' AND policyname = 'Users can update own themes') THEN
    CREATE POLICY "Users can update own themes" ON user_themes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── CSS ZEN GARDEN: Theme Votes ───

CREATE TABLE IF NOT EXISTS theme_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  theme_id uuid REFERENCES user_themes(id) NOT NULL,
  vote integer NOT NULL DEFAULT 1,
    -- 1 = upvote, -1 = downvote
  voted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, theme_id)
);

ALTER TABLE theme_votes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'theme_votes' AND policyname = 'Votes are public') THEN
    CREATE POLICY "Votes are public" ON theme_votes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'theme_votes' AND policyname = 'Users can vote') THEN
    CREATE POLICY "Users can vote" ON theme_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════

-- ─── CATEGORIES ───

INSERT INTO discovery_categories (slug, name, description, icon, sort_order, trigger_type, trigger_value)
VALUES
  ('essentials',   'Essentials',   'Your core tools and identity.',                         '🏠', 0,  'always',  NULL),
  ('initiatives',  'Initiatives',  'The Sweet Sixteen charitable initiatives.',              '💖', 1,  'visit',   '/initiatives'),
  ('exploration',  'Exploration',  'Games, puzzles, and hidden discoveries.',                '🗺️', 2,  'visit',   '/ghost'),
  ('halls',        'Halls',        'The great halls of the Hexagon.',                        '🏛️', 3,  'gate',    'gate-hexagon'),
  ('governance',   'Governance',   'The 300, Star Chamber, and proposals.',                  '⚖️', 4,  'visit',   '/governance'),
  ('economy',      'Economy',      'Treasury, MatchTrade, manufacturing, and finance.',      '💰', 5,  'action',  'first_transaction'),
  ('arenas',       'Arenas',       'Political Expedition, Areopagus, Crucible.',             '⚔️', 6,  'visit',   '/arenas'),
  ('islands',      'Islands',      'The islands of HexIsle.',                                '🏝️', 7,  'visit',   '/hexisle')
ON CONFLICT (slug) DO NOTHING;

-- ─── DISCOVERABLE CARDS ───

INSERT INTO discoverable_cards (category_slug, slug, name, description, icon, destination_route, card_type, hint_text, discovery_route, sort_order)
VALUES
  -- Essentials (always visible)
  ('essentials', 'portfolio',     'Portfolio',       'Your dashboard and overview.',           '📂', '/portfolio',       'location', 'Visit your Portfolio to place this card.',     '/portfolio',       0),
  ('essentials', 'hofund-studio', 'Hofund Studio',   'Your QR code and cue card workshop.',    '📡', '/hofund',          'location', 'Open Hofund Studio to claim this card.',       '/hofund',          1),
  ('essentials', 'herald',        'Herald Program',  'Don''t break the chain.',                '📯', '/herald',          'location', 'Visit the Herald to discover this card.',      '/herald',          2),
  ('essentials', 'dashboard',     'Dashboard',       'Your full member dashboard.',            '📊', '/dashboard',       'location', 'Open Dashboard to place this card.',           '/dashboard',       3),
  ('essentials', 'deck-cards',    'Deck Cards',      'Your card collection.',                  '🃏', '/deck',            'location', 'Visit your Deck to discover this card.',       '/deck',            4),
  ('essentials', 'the-helm',      'The Helm',        'Beacons and treasure maps.',             '🧭', '/the-helm',        'location', 'Visit The Helm to claim this card.',           '/the-helm',        5),

  -- Initiatives
  ('initiatives', 'lets-make-dinner',     'Let''s Make Dinner',     'Neighbors feeding neighbors.',        '🍽️', '/initiatives/lets-make-dinner',     'location', 'Visit Let''s Make Dinner.',         '/initiatives/lets-make-dinner',     0),
  ('initiatives', 'defense-klaus',        'Defense Klaus',          'For someone you love.',               '🛡️', '/initiatives/defense-claws',        'location', 'Visit Defense Klaus.',              '/initiatives/defense-claws',        1),
  ('initiatives', 'rally-group',          'Rally Group',            'Crisis response everywhere.',         '🚨', '/initiatives/rally-group',          'location', 'Visit Rally Group.',                '/initiatives',                      2),
  ('initiatives', 'lets-get-groceries',   'Let''s Get Groceries',   'Volume purchasing power.',            '🛒', '/initiatives/lets-get-groceries',   'location', 'Visit Let''s Get Groceries.',       '/initiatives/lets-get-groceries',   3),
  ('initiatives', 'lets-go-shopping',     'Let''s Go Shopping',     'Cooperative buying power.',           '🛍️', '/initiatives/lets-go-shopping',     'location', 'Visit Let''s Go Shopping.',         '/initiatives/lets-go-shopping',     4),
  ('initiatives', 'jukebox',              'JukeBox',                'Fair music licensing. 83.3%.',        '🎵', '/initiatives/jukebox',              'location', 'Visit JukeBox.',                   '/initiatives',                      5),
  ('initiatives', 'vsl',                  'VSL',                    'Village Savings & Loans.',            '🏦', '/initiatives/vsl',                  'location', 'Visit VSL.',                       '/initiatives',                      6),
  ('initiatives', 'didasko',              'Didasko',                'BOUNTY K-12 curriculum.',             '📚', '/initiatives/didasko',              'location', 'Visit Didasko.',                   '/initiatives',                      7),

  -- Exploration
  ('exploration', 'ghost-world',    'Ghost World',      'Anonymous exploration.',               '👻', '/ghost',              'location', 'Enter Ghost World to discover this card.',     '/ghost',              0),
  ('exploration', 'durins-door',    'Durin''s Door',    '9 doors, 50+ passwords.',             '🚪', '/durins-door',        'location', 'Try Durin''s Door.',                          '/durins-door',        1),
  ('exploration', '52-card-hunt',   '52-Card Hunt',     'Find hidden cards.',                  '🃏', '/treasure-map-game',  'location', 'Play the 52-Card Hunt.',                      '/treasure-map-game',  2),
  ('exploration', 'golden-keys',    'Golden Keys',      'Hidden puzzles, hidden rewards.',      '🔑', '/golden-key',         'location', 'Search for Golden Keys.',                     '/golden-key',         3),

  -- Halls (Hexagon)
  ('halls', 'observatory',    'Observatory',      'Platform analytics and transparency.',  '🔭', '/fly-on-the-wall',  'hall', 'Discover the Observatory in the Hexagon.',  '/fly-on-the-wall',  0),
  ('halls', 'guild-hall',     'Guild Hall',        'Where skills meet purpose.',            '🏛️', '/guilds',           'hall', 'Visit the Guild Hall.',                     '/guilds',           1),
  ('halls', 'looking-glass',  'Looking Glass',     'Every decision logged.',                '🔍', '/looking-glass',    'hall', 'Look through the Looking Glass.',           '/looking-glass',    2),
  ('halls', 'brainstorm',     'Brainstorm',        'Innovation chamber.',                   '🧠', '/help-wanted',      'hall', 'Enter the Brainstorm chamber.',             '/help-wanted',      3),
  ('halls', 'tavern',         'Tavern',            'Where members gather.',                 '🍺', '/tribes',           'hall', 'Visit the Tavern.',                         '/tribes',           4),
  ('halls', 'hall-of-records','Hall of Records',   'IP Ledger and patent portfolio.',       '📜', '/looking-glass',    'hall', 'Enter the Hall of Records.',                '/looking-glass',    5),

  -- Governance
  ('governance', 'the-300',        'The 300',          '100 AI + 100 Human + 100 Mixed.',     '🏛️', '/governance',       'location', 'Visit Governance.',                '/governance',       0),
  ('governance', 'star-chamber',   'Star Chamber',     'Dual AI verification.',               '⭐', '/governance',       'location', 'Visit the Star Chamber.',           '/governance',       1),
  ('governance', 'petitions',      'Petitions',        'Member-proposed, signature-driven.',   '📝', '/petitions',        'location', 'Browse Petitions.',                '/petitions',        2),

  -- Economy
  ('economy', 'treasury',       'Treasury',         'Your three-gear currency.',             '💰', '/portfolio',        'ability', 'Make your first transaction.',        NULL, 0),
  ('economy', 'matchtrade',     'MatchTrade',       'MARKS for MARKS.',                      '🤝', '/matchtrade',       'location', 'Visit MatchTrade.',                  '/matchtrade',       1),
  ('economy', 'manufacturing',  'Manufacturing',    'Cooperative 3D printing.',              '🏭', '/manufacturing',    'location', 'Browse Manufacturing.',               '/manufacturing',    2),
  ('economy', 'help-wanted',    'Help Wanted',      'Find work, post bounties.',             '📋', '/help-wanted',      'location', 'Visit Help Wanted.',                 '/help-wanted',      3),

  -- Arenas
  ('arenas', 'political-expedition', 'Political Expedition', 'Political and civic discourse.',   '🏛️', '/arenas', 'arena', 'Cross the gateway.',  '/arenas', 0),
  ('arenas', 'areopagus',           'Areopagus',            'Religious and theological.',        '⛪', '/arenas', 'arena', 'Cross the gateway.',  '/arenas', 1),
  ('arenas', 'crucible',            'Crucible',             'Debate and argumentation.',          '🔥', '/arenas', 'arena', 'Cross the gateway.',  '/arenas', 2),

  -- Islands
  ('islands', 'hexisle-harvest',  'Harvest Island',   'Farm and gather resources.',           '🌾', '/hexisle', 'island', 'Explore HexIsle.',  '/hexisle', 0),
  ('islands', 'hexisle-navigate', 'Navigate Island',  'Chart the seas.',                     '🧭', '/hexisle', 'island', 'Explore HexIsle.',  '/hexisle', 1),
  ('islands', 'hexisle-engineer', 'Engineer Island',  'Build and craft.',                    '⚙️', '/hexisle', 'island', 'Explore HexIsle.',  '/hexisle', 2)
ON CONFLICT (slug) DO NOTHING;

-- ─── DISCOVERY GATES ───

INSERT INTO discovery_gates (gate_slug, title, description, category_slug, trigger_route, icon)
VALUES
  ('gate-hexagon',    'The Hexagon',    'The Hexagon is the central hub of Liana Banyan. Six great halls surround a central senate floor. Do you want to discover what''s inside?', 'halls',      '/guilds',      '🏛️'),
  ('gate-governance', 'Governance',     'The 300 govern Liana Banyan: 100 AI, 100 Human, 100 Mixed. Proposals, voting, and constitutional bylaws. Do you want to participate?',     'governance', '/governance',  '⚖️'),
  ('gate-arenas',     'The Arenas',     'Three arenas exist outside Liana Banyan proper for political, religious, and debate discourse. The Switzerland Rule applies. Do you want to see them?', 'arenas', '/arenas', '⚔️'),
  ('gate-islands',    'HexIsle',        'Seven islands. Seven quests. Build cooperative cities, trade resources, and prove the model works in a game world. Do you want to play?',   'islands',    '/hexisle',     '🏝️'),
  ('gate-economy',    'The Treasury',   'Credits buy services. MARKS track reputation. Joules lock value. Three gears, one engine. Do you want to open the Treasury?',              'economy',    '/matchtrade',  '💰')
ON CONFLICT (gate_slug) DO NOTHING;

-- ─── KEEP SIZE TIERS ───

INSERT INTO keep_tiers (slug, name, max_categories, requirement_type, requirement_value, sort_order)
VALUES
  ('locker',  'Locker',  1, 'free',             0,  0),
  ('closet',  'Closet',  3, 'membership',       0,  1),
  ('chest',   'Chest',   6, 'bounties',         10, 2),
  ('hut',     'Hut',     9, 'keep_launch',      1,  3),
  ('cubicle', 'Cubicle', 12, 'crown_nomination', 1,  4),
  ('keep',    'Keep',    99, 'crown_holder',     1,  5)
ON CONFLICT (slug) DO NOTHING;
