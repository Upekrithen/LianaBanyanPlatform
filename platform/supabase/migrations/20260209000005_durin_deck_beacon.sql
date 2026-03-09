-- ═══════════════════════════════════════════════════════════════
-- DURIN'S DOOR + DECK CARDS + BEACON DROPPER + TREASURE MAPS
-- Phase 1-3 tables for the interconnected game systems.
-- ═══════════════════════════════════════════════════════════════

-- ─── DURIN'S DOOR: Attempt & Unlock Tracking ───

CREATE TABLE IF NOT EXISTS public.durin_door_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  door_id         TEXT NOT NULL,
  password_tried  TEXT NOT NULL,
  language        TEXT,
  time_of_day     TEXT,
  was_correct     BOOLEAN NOT NULL DEFAULT false,
  reward_given    JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_durin_attempts_user ON public.durin_door_attempts(user_id);
CREATE INDEX idx_durin_attempts_ghost ON public.durin_door_attempts(ghost_id);
CREATE INDEX idx_durin_attempts_door ON public.durin_door_attempts(door_id);

CREATE TABLE IF NOT EXISTS public.durin_door_unlocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  door_id         TEXT NOT NULL,
  password_used   TEXT NOT NULL,
  language        TEXT NOT NULL,
  tier            TEXT NOT NULL,
  unlocked_at     TIMESTAMPTZ DEFAULT NOW(),
  -- Unique per user+door+password (separate constraints for user vs ghost)
  CONSTRAINT uq_durin_unlock_user UNIQUE (user_id, door_id, password_used)
);

CREATE INDEX idx_durin_unlocks_user ON public.durin_door_unlocks(user_id);

-- ─── DECK CARDS ───

CREATE TABLE IF NOT EXISTS public.deck_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_code       TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  card_type       TEXT NOT NULL DEFAULT 'navigation',
  rarity          TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','uncommon','rare','epic','legendary','mythic','secret')),
  front_title     TEXT NOT NULL,
  front_subtitle  TEXT,
  front_image_url TEXT,
  front_icon      TEXT,
  back_title      TEXT NOT NULL,
  back_instructions TEXT NOT NULL,
  back_destination TEXT,
  back_action     TEXT,
  border_color    TEXT DEFAULT 'silver',
  credit_cost     NUMERIC DEFAULT 0,
  marks_value     NUMERIC DEFAULT 0,
  is_consumable   BOOLEAN DEFAULT true,
  max_uses        INTEGER DEFAULT 1,
  drop_rate       NUMERIC DEFAULT 0.6,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deck_card_collection (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  card_id         UUID NOT NULL REFERENCES public.deck_cards(id),
  uses_remaining  INTEGER DEFAULT 1,
  is_in_castle_keep BOOLEAN DEFAULT false,
  found_at        TEXT,
  found_method    TEXT DEFAULT 'discovered',
  acquired_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deck_collection_user ON public.deck_card_collection(user_id);
CREATE INDEX idx_deck_collection_ghost ON public.deck_card_collection(ghost_id);

CREATE TABLE IF NOT EXISTS public.deck_card_drops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID NOT NULL REFERENCES public.deck_cards(id),
  location_type   TEXT NOT NULL,
  location_path   TEXT NOT NULL,
  location_hint   TEXT,
  is_camouflaged  BOOLEAN DEFAULT false,
  camouflage_art  TEXT,
  dropped_by      UUID REFERENCES auth.users(id),
  found_by        UUID,
  found_at        TIMESTAMPTZ,
  regenerates     BOOLEAN DEFAULT true,
  regen_after_players INTEGER DEFAULT 1,
  players_since_found INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deck_drops_location ON public.deck_card_drops(location_path);

CREATE TABLE IF NOT EXISTS public.deck_card_forges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  card_id         UUID NOT NULL REFERENCES public.deck_cards(id),
  forge_type      TEXT NOT NULL DEFAULT 'personal_bookmark',
  credits_spent   NUMERIC NOT NULL DEFAULT 0,
  custom_back_art TEXT,
  custom_destination TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BEACON SYSTEM ───

CREATE TABLE IF NOT EXISTS public.beacon_folders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  name            TEXT NOT NULL DEFAULT 'My Beacons',
  icon            TEXT DEFAULT '📁',
  color           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.beacons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  name            TEXT NOT NULL,
  icon            TEXT DEFAULT '📍',
  folder_id       UUID REFERENCES public.beacon_folders(id),
  beacon_type     TEXT NOT NULL DEFAULT 'personal',
  location_type   TEXT NOT NULL,
  location_path   TEXT NOT NULL,
  location_context JSONB,
  notes           TEXT,
  reward_credits  NUMERIC DEFAULT 0,
  reward_marks    NUMERIC DEFAULT 0,
  deposited_by    UUID REFERENCES auth.users(id),
  last_visited    TIMESTAMPTZ,
  visit_count     INTEGER DEFAULT 0,
  is_archived     BOOLEAN DEFAULT false,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_beacons_user ON public.beacons(user_id);
CREATE INDEX idx_beacons_ghost ON public.beacons(ghost_id);
CREATE INDEX idx_beacons_location ON public.beacons(location_path);
CREATE INDEX idx_beacons_type ON public.beacons(beacon_type);

-- ─── TREASURE MAPS (Follow-Me Game) ───

CREATE TABLE IF NOT EXISTS public.treasure_maps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID REFERENCES auth.users(id),
  ghost_creator_id UUID REFERENCES public.ghost_profiles(id),
  name            TEXT NOT NULL,
  description     TEXT,
  map_type        TEXT DEFAULT 'ordered' CHECK (map_type IN ('ordered','unordered','branching')),
  visibility      TEXT DEFAULT 'private' CHECK (visibility IN ('private','friends','public','link_only')),
  reward_credits  INTEGER DEFAULT 0,
  reward_marks    INTEGER DEFAULT 0,
  reward_badge    TEXT,
  reward_card_id  UUID REFERENCES public.deck_cards(id),
  times_started   INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  avg_completion_minutes INTEGER,
  is_featured     BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treasure_maps_creator ON public.treasure_maps(creator_id);
CREATE INDEX idx_treasure_maps_visibility ON public.treasure_maps(visibility);

CREATE TABLE IF NOT EXISTS public.map_beacons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id          UUID NOT NULL REFERENCES public.treasure_maps(id) ON DELETE CASCADE,
  beacon_order    INTEGER NOT NULL,
  name            TEXT NOT NULL,
  location_type   TEXT NOT NULL,
  location_path   TEXT NOT NULL,
  task_description TEXT,
  task_type       TEXT DEFAULT 'visit',
  task_answer     TEXT,
  hint            TEXT,
  next_beacon_ids UUID[],
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_map_beacons_map ON public.map_beacons(map_id);

CREATE TABLE IF NOT EXISTS public.map_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id),
  ghost_id        UUID REFERENCES public.ghost_profiles(id),
  map_id          UUID NOT NULL REFERENCES public.treasure_maps(id),
  beacons_visited UUID[] DEFAULT '{}',
  current_beacon_id UUID REFERENCES public.map_beacons(id),
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  total_time_seconds INTEGER DEFAULT 0,
  session_count   INTEGER DEFAULT 1,
  CONSTRAINT uq_map_progress_user UNIQUE (user_id, map_id)
);

-- ─── GHOST POUCH (pending rewards) ───

CREATE TABLE IF NOT EXISTS public.ghost_pouch (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghost_id        UUID NOT NULL REFERENCES public.ghost_profiles(id),
  reward_type     TEXT NOT NULL CHECK (reward_type IN ('credits','marks','joules','card','badge')),
  amount          NUMERIC DEFAULT 0,
  card_id         UUID REFERENCES public.deck_cards(id),
  badge_name      TEXT,
  source          TEXT NOT NULL,
  source_id       UUID,
  claimed         BOOLEAN DEFAULT false,
  claimed_at      TIMESTAMPTZ,
  claimed_by_user UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ghost_pouch_ghost ON public.ghost_pouch(ghost_id);
CREATE INDEX idx_ghost_pouch_unclaimed ON public.ghost_pouch(ghost_id) WHERE claimed = false;

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════

DO $$ 
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'durin_door_attempts', 'durin_door_unlocks',
    'deck_cards', 'deck_card_collection', 'deck_card_drops', 'deck_card_forges',
    'beacon_folders', 'beacons', 'treasure_maps', 'map_beacons', 'map_progress',
    'ghost_pouch'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('CREATE POLICY "auth_access_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "anon_read_%s" ON public.%I FOR SELECT TO anon USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- Anon can insert attempts (ghost world)
CREATE POLICY "anon_insert_durin" ON public.durin_door_attempts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_beacon" ON public.beacons FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_collection" ON public.deck_card_collection FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_progress" ON public.map_progress FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_pouch" ON public.ghost_pouch FOR INSERT TO anon WITH CHECK (true);

-- ─── TREASURE MAP END-QUESTION (12 answers, time-rotating) ───

ALTER TABLE public.treasure_maps ADD COLUMN IF NOT EXISTS
  end_questions JSONB DEFAULT '[]';
  -- Array of {question, answers: string[12], correct_index_by_hour: number[24]}
  -- Each hour maps to which answer index is correct

ALTER TABLE public.map_progress ADD COLUMN IF NOT EXISTS
  marks_earned NUMERIC DEFAULT 0;
ALTER TABLE public.map_progress ADD COLUMN IF NOT EXISTS  
  end_question_answered BOOLEAN DEFAULT false;
ALTER TABLE public.map_progress ADD COLUMN IF NOT EXISTS
  end_question_correct BOOLEAN DEFAULT false;

-- ─── LANGUAGE PREFERENCE (set by Durin's Door usage) ───

ALTER TABLE public.ghost_profiles ADD COLUMN IF NOT EXISTS
  preferred_language TEXT DEFAULT 'english';
ALTER TABLE public.ghost_profiles ADD COLUMN IF NOT EXISTS
  language_set_by_door TEXT;

-- User language preference (for members)
CREATE TABLE IF NOT EXISTS public.user_language_preference (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'english',
  set_by_door     TEXT,
  set_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_language_preference ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_lang" ON public.user_language_preference FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── CARD USE TYPES (expanded from simple consumable boolean) ───

ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS
  use_type TEXT DEFAULT 'single' CHECK (use_type IN ('single','multi','daily','weekly','monthly','yearly','unlimited','keep_only'));
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS
  cooldown_hours INTEGER DEFAULT 0;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS
  is_portal BOOLEAN DEFAULT false;
ALTER TABLE public.deck_cards ADD COLUMN IF NOT EXISTS
  portal_persists_in_keep BOOLEAN DEFAULT false;

ALTER TABLE public.deck_card_collection ADD COLUMN IF NOT EXISTS
  last_used_at TIMESTAMPTZ;
ALTER TABLE public.deck_card_collection ADD COLUMN IF NOT EXISTS
  total_uses INTEGER DEFAULT 0;
ALTER TABLE public.deck_card_collection ADD COLUMN IF NOT EXISTS
  next_available_at TIMESTAMPTZ;

-- ─── LOOKING GLASS (5 facets + bridge + helm) ───

CREATE TABLE IF NOT EXISTS public.looking_glass (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 5 facets (configurable)
  facet_1_type    TEXT DEFAULT 'bridge',
  facet_1_label   TEXT DEFAULT 'The Bridge',
  facet_1_destination TEXT DEFAULT '/dashboard',
  
  facet_2_type    TEXT DEFAULT 'helm',
  facet_2_label   TEXT DEFAULT 'The Helm',
  facet_2_destination TEXT DEFAULT '/the-helm',
  
  facet_3_type    TEXT DEFAULT 'deck',
  facet_3_label   TEXT DEFAULT 'My Deck',
  facet_3_destination TEXT DEFAULT '/deck',
  
  facet_4_type    TEXT DEFAULT 'hofund',
  facet_4_label   TEXT DEFAULT 'Hofund',
  facet_4_destination TEXT DEFAULT '/hofund',
  
  facet_5_type    TEXT DEFAULT 'door',
  facet_5_label   TEXT DEFAULT 'Durin''s Door',
  facet_5_destination TEXT DEFAULT '/durins-door',
  
  -- Portal cards placed on the glass (disappear on use unless in keep)
  active_portal_card_id UUID REFERENCES public.deck_card_collection(id),
  
  -- Language (set by Durin's Door)
  display_language TEXT DEFAULT 'english',
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE public.looking_glass ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_glass" ON public.looking_glass FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED: Starter deck cards
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.deck_cards (card_code, name, card_type, rarity, front_title, front_subtitle, back_title, back_instructions, back_destination, border_color, credit_cost, is_consumable, drop_rate) VALUES
('NAV-BRIDGE', 'The Bridge', 'navigation', 'common', 'The Bridge', 'Cross to the next island', 'Place on Tapestry', 'Cross the Bifrost to reach the other side. This card is consumed on use.', '/hexisle', 'silver', 5, true, 0.6),
('NAV-MARSH', 'Marsh Crossing', 'navigation', 'common', 'The Marsh', 'A shortcut through the reeds', 'Place on Tapestry', 'Wade through the marsh. Faster but muddier. Card consumed on use.', '/explore', 'silver', 5, true, 0.6),
('ACC-GALLERY', 'Art Gallery Pass', 'access', 'uncommon', 'The Gallery', 'Curated member art', 'Flash this card', 'Show at the gallery entrance. Grants one visit. DULLARD code also works.', '/gallery', 'green', 10, true, 0.25),
('ACC-LIBRARY', 'Deep Library Card', 'access', 'uncommon', 'The Deep Library', 'Academic papers & research', 'Present to the Librarian', 'Access the research archives for one session.', '/library', 'green', 10, true, 0.25),
('ACC-FORGE', 'Forge Key', 'access', 'rare', 'The Forge', '3D printing & manufacturing', 'Insert into the lock', 'Unlock the Forge for one build session. Bring your own materials.', '/forge', 'blue', 25, true, 0.1),
('ACC-OBSERVATORY', 'Observatory Token', 'access', 'rare', 'The Observatory', 'Platform analytics', 'Place on the telescope', 'View the Fly on the Wall transparency dashboard with enhanced detail.', '/fly-on-the-wall', 'blue', 15, true, 0.1),
('ACC-VAULT', 'Vault Seal', 'access', 'epic', 'The Vault', 'Patent portfolio deep dive', 'Break the seal', 'Access the complete patent research archive. Crown Jewels included.', '/vault', 'purple', 50, true, 0.04),
('ACC-JOURNAL', 'Founder Journal Key', 'access', 'legendary', 'Founders Journal', 'Private development history', 'Turn the key', 'Read the founder''s private journal entries. Handle with care.', '/founders-journal', 'gold', 100, true, 0.009),
('GIFT-CANDLE', 'Babylon Candle', 'gift', 'epic', 'Babylon Candle', '10 Uses Left', 'Light for transport', 'Tristan and Yvain left this for you. 100 Credits inside. Gift from your Sponsor.', null, 'purple', 0, false, 0.0),
('SOCIAL-HERALD', 'Herald Card', 'social', 'uncommon', 'Herald Card', 'Share the word', 'Post to social media', 'Pre-loaded cue card ready to share. Earns Herald chain credit.', '/hofund', 'green', 0, true, 0.25),
('ECON-CREDIT100', 'Credit Vault', 'economic', 'rare', 'Credit Vault', 'Stores up to 500 credits', 'Open the vault', 'A portable credit container. Store credits here for safekeeping.', null, 'blue', 0, false, 0.0),
('GOV-VOTE', 'Vote Card', 'governance', 'uncommon', 'Vote Card', '1x governance vote', 'Cast at the chamber', 'One vote on any active proposal. Use wisely.', '/governance', 'green', 5, true, 0.25),
('SECRET-PHOENIX', 'Phoenix Card', 'secret', 'secret', '???', 'What burns and rises?', 'From ashes', 'You found the Phoenix. This card resets ONE consumed card back to your deck.', null, 'black', 0, false, 0.0);
