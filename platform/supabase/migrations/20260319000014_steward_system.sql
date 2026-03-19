-- ============================================================================
-- Migration: 20260319000014_steward_system.sql
-- Session 42 Task B: Steward profiles + campaigns
-- ============================================================================

CREATE TABLE IF NOT EXISTS steward_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                text NOT NULL CHECK (tier IN ('apprentice','journeyman','master_steward','grand_steward')) DEFAULT 'apprentice',
  total_pledged       numeric DEFAULT 0,
  total_released      numeric DEFAULT 0,
  total_absorbed      numeric DEFAULT 0,
  campaigns_completed integer DEFAULT 0
);

ALTER TABLE steward_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "steward_profiles_select_auth" ON steward_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "steward_profiles_insert_own" ON steward_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "steward_profiles_update_own" ON steward_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS steward_campaigns (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  steward_id            uuid NOT NULL REFERENCES steward_profiles(id) ON DELETE CASCADE,
  project_id            uuid NOT NULL,
  pledged_marks         numeric NOT NULL,
  backed_marks_received numeric DEFAULT 0,
  lb_pool_allocation    numeric DEFAULT 0,
  status                text NOT NULL CHECK (status IN ('active','completed','failed')),
  deferred_compensation numeric DEFAULT 0,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE steward_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "steward_campaigns_select_auth" ON steward_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "steward_campaigns_insert_own" ON steward_campaigns FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM steward_profiles WHERE steward_profiles.id = steward_campaigns.steward_id AND steward_profiles.user_id = auth.uid()));
CREATE POLICY "steward_campaigns_update_own" ON steward_campaigns FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM steward_profiles WHERE steward_profiles.id = steward_campaigns.steward_id AND steward_profiles.user_id = auth.uid()));
