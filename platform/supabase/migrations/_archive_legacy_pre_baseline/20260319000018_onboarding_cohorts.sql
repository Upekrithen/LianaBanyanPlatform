-- ============================================================================
-- Migration: 20260319000018_onboarding_cohorts.sql
-- Session 44 Task B: Trickle Incentive Onboarding system
-- ============================================================================

CREATE TABLE IF NOT EXISTS onboarding_cohorts (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_number          integer NOT NULL UNIQUE,
  max_members            integer NOT NULL,
  opened_at              timestamptz DEFAULT now(),
  expansion_trigger_met  boolean DEFAULT false,
  goals_completion_pct   numeric DEFAULT 0
);

ALTER TABLE onboarding_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cohorts_select_auth" ON onboarding_cohorts FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS onboarding_members (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id        uuid NOT NULL REFERENCES onboarding_cohorts(id) ON DELETE CASCADE,
  founding_status  boolean DEFAULT true,
  testing_goals    jsonb DEFAULT '{"profile_complete":false,"browsed_main_square":false,"visited_3_stores":false,"used_demand_signaling":false,"sent_cue_card":false,"provided_feedback":false}',
  joined_at        timestamptz DEFAULT now(),
  goals_completed_at timestamptz
);

ALTER TABLE onboarding_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ob_members_select_own" ON onboarding_members FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ob_members_update_own" ON onboarding_members FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed cohort 1
INSERT INTO onboarding_cohorts (cohort_number, max_members) VALUES (1, 50);
