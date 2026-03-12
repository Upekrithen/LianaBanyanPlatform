-- ============================================
-- AMBASSADOR ONBOARDING SYSTEM (V1 + V2)
-- Innovation #11: Human-Guided Chain Onboarding + Lighthouse Ladder
-- ============================================

-- Ambassadors: registered members who guide new members through onboarding
CREATE TABLE IF NOT EXISTS ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  ambassador_number integer UNIQUE,
  parent_ambassador_id uuid REFERENCES ambassadors(id),
  generation integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'paused', 'retired')),
  slots_filled integer NOT NULL DEFAULT 0,
  marks_earned integer NOT NULL DEFAULT 0,
  city text,
  focus_areas text[],
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- V2: Level and graduation fields
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1
  CHECK (level >= 1 AND level <= 5);
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS level_title text NOT NULL DEFAULT 'Torch Bearer';
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS certified_at_level timestamptz[];
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS total_downstream integer NOT NULL DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS crew_success_rate numeric DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS avg_onboarding_minutes integer;

-- Ambassador recruits: the 10 people each Ambassador is responsible for
CREATE TABLE IF NOT EXISTS ambassador_recruits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  recruit_user_id uuid REFERENCES auth.users(id),
  recruit_name text,
  recruit_contact text,
  slot_number integer NOT NULL CHECK (slot_number >= 1 AND slot_number <= 10),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited', 'walkthrough_started', 'signed_up', 'crew_joined',
    'first_backing', 'completed', 'ambassador_ready', 'declined'
  )),
  walkthrough_started_at timestamptz,
  signed_up_at timestamptz,
  crew_joined_at timestamptz,
  first_backing_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ambassador_id, slot_number)
);

-- Walkthrough sequences and steps (V1)
CREATE TABLE IF NOT EXISTS walkthrough_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS walkthrough_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid NOT NULL REFERENCES walkthrough_sequences(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  instruction text NOT NULL,
  screen_hint text,
  tip text,
  common_questions text[],
  estimated_seconds integer DEFAULT 60,
  requires_action boolean DEFAULT false,
  action_label text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sequence_id, step_number)
);

CREATE TABLE IF NOT EXISTS walkthrough_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES walkthrough_steps(id) ON DELETE CASCADE,
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  recruit_id uuid REFERENCES ambassador_recruits(id),
  feedback_type text NOT NULL CHECK (feedback_type IN (
    'confusing', 'too_slow', 'too_fast', 'wrong_screen', 'great', 'suggestion'
  )),
  details text,
  suggested_reword text,
  created_at timestamptz DEFAULT now()
);

-- V2: Ambassador social links
CREATE TABLE IF NOT EXISTS ambassador_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'twitter', 'facebook', 'linkedin', 'other')),
  handle text NOT NULL,
  url text,
  follower_count integer,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(ambassador_id, platform)
);

-- V2: Ambassador testimonials
CREATE TABLE IF NOT EXISTS ambassador_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  recruit_user_id uuid REFERENCES auth.users(id),
  recruit_display_name text NOT NULL,
  testimonial_text text NOT NULL CHECK (char_length(testimonial_text) <= 500),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- V2: Level certifications
CREATE TABLE IF NOT EXISTS ambassador_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  from_level integer NOT NULL,
  to_level integer NOT NULL,
  assessment_score numeric,
  passed boolean NOT NULL DEFAULT false,
  temperament_data jsonb,
  certified_at timestamptz DEFAULT now(),
  UNIQUE(ambassador_id, to_level)
);

-- V2: Mini business plan snapshots
CREATE TABLE IF NOT EXISTS ambassador_business_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  role_type text NOT NULL CHECK (role_type IN ('ambassador', 'meal_maker', 'grocery_runner', 'hexisle_maker', 'general')),
  plan_data jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- V2: Mentor relationships (10 slots per level)
CREATE TABLE IF NOT EXISTS ambassador_mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  mentor_level integer NOT NULL,
  mentee_level integer NOT NULL,
  slot_number integer NOT NULL CHECK (slot_number >= 1 AND slot_number <= 10),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'paused', 'ended')),
  started_at timestamptz DEFAULT now(),
  graduated_at timestamptz,
  UNIQUE(mentor_id, slot_number)
);

-- RLS (V1)
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkthrough_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkthrough_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkthrough_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ambassadors_public_read" ON ambassadors FOR SELECT USING (true);
CREATE POLICY "ambassadors_own_insert" ON ambassadors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ambassadors_own_update" ON ambassadors FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "recruits_ambassador_read" ON ambassador_recruits FOR SELECT
  USING (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid())
    OR recruit_user_id = auth.uid());
CREATE POLICY "recruits_ambassador_insert" ON ambassador_recruits FOR INSERT
  WITH CHECK (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "recruits_ambassador_update" ON ambassador_recruits FOR UPDATE
  USING (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));

CREATE POLICY "walkthrough_sequences_public_read" ON walkthrough_sequences FOR SELECT USING (true);
CREATE POLICY "walkthrough_steps_public_read" ON walkthrough_steps FOR SELECT USING (true);
CREATE POLICY "feedback_own_insert" ON walkthrough_feedback FOR INSERT
  WITH CHECK (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "feedback_public_read" ON walkthrough_feedback FOR SELECT USING (true);

-- RLS (V2 new tables)
ALTER TABLE ambassador_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_mentorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_links_public_read" ON ambassador_social_links FOR SELECT USING (true);
CREATE POLICY "social_links_own_write" ON ambassador_social_links FOR INSERT
  WITH CHECK (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "social_links_own_update" ON ambassador_social_links FOR UPDATE
  USING (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));

CREATE POLICY "amb_testimonials_public_read" ON ambassador_testimonials FOR SELECT USING (is_public = true);
CREATE POLICY "amb_testimonials_recruit_write" ON ambassador_testimonials FOR INSERT
  WITH CHECK (recruit_user_id = auth.uid());

CREATE POLICY "certifications_own_read" ON ambassador_certifications FOR SELECT
  USING (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "certifications_own_insert" ON ambassador_certifications FOR INSERT
  WITH CHECK (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));

CREATE POLICY "business_plans_public_read" ON ambassador_business_plans FOR SELECT
  USING (is_public = true OR ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "business_plans_own_write" ON ambassador_business_plans FOR INSERT
  WITH CHECK (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "business_plans_own_update" ON ambassador_business_plans FOR UPDATE
  USING (ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));

CREATE POLICY "mentorships_read" ON ambassador_mentorships FOR SELECT
  USING (mentor_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid())
    OR mentee_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "mentorships_mentor_write" ON ambassador_mentorships FOR INSERT
  WITH CHECK (mentor_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));
CREATE POLICY "mentorships_mentor_update" ON ambassador_mentorships FOR UPDATE
  USING (mentor_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid()));

-- Indexes (V1 + V2)
CREATE INDEX IF NOT EXISTS idx_ambassadors_user ON ambassadors(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassadors_parent ON ambassadors(parent_ambassador_id);
CREATE INDEX IF NOT EXISTS idx_recruits_ambassador ON ambassador_recruits(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_recruits_user ON ambassador_recruits(recruit_user_id);
CREATE INDEX IF NOT EXISTS idx_walkthrough_steps_seq ON walkthrough_steps(sequence_id, step_number);
CREATE INDEX IF NOT EXISTS idx_feedback_step ON walkthrough_feedback(step_id);
CREATE INDEX IF NOT EXISTS idx_social_links_ambassador ON ambassador_social_links(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_amb_testimonials_ambassador ON ambassador_testimonials(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_certifications_ambassador ON ambassador_certifications(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_business_plans_ambassador ON ambassador_business_plans(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON ambassador_mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee ON ambassador_mentorships(mentee_id);

-- Seed default walkthrough sequence (V1). Steps seeded separately or via app.
INSERT INTO walkthrough_sequences (sequence_key, title, description, version) VALUES
('default', 'Standard Onboarding Walkthrough', 'The default step-by-step guide for Ambassadors walking new members through the platform.', 1)
ON CONFLICT (sequence_key) DO NOTHING;
