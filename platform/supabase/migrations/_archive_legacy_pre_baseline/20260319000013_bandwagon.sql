-- ============================================================================
-- Migration: 20260319000013_bandwagon.sql
-- Session 42 Task A: BandWagon backings + Taste Ranger profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS bandwagon_backings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id    uuid NOT NULL,
  marks_pledged numeric NOT NULL,
  backed_at     timestamptz DEFAULT now(),
  status        text NOT NULL CHECK (status IN ('active','released','absorbed')),
  saa_earned    numeric DEFAULT 0
);

ALTER TABLE bandwagon_backings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bw_backings_select_auth" ON bandwagon_backings FOR SELECT TO authenticated USING (true);
CREATE POLICY "bw_backings_insert_own" ON bandwagon_backings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bw_backings_update_own" ON bandwagon_backings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS taste_ranger_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                text NOT NULL CHECK (tier IN ('scout','ranger','curator','tastemaker','patron','luminary')) DEFAULT 'scout',
  total_saa           numeric DEFAULT 0,
  successful_backings integer DEFAULT 0,
  trust_chain_links   jsonb DEFAULT '[]'
);

ALTER TABLE taste_ranger_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tr_profiles_select_auth" ON taste_ranger_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "tr_profiles_insert_own" ON taste_ranger_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tr_profiles_update_own" ON taste_ranger_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
