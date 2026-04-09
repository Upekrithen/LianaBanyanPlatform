-- ============================================
-- Roommate Accountability System
-- Mission TWO: Cooperative Housing Extension
-- Knight Session 153
-- ============================================

-- =====================
-- 1. Core Tables
-- =====================

CREATE TABLE IF NOT EXISTS roommate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES auth.users(id),
  property_id UUID NOT NULL REFERENCES housing_properties(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),

  dishwashing_commitment TEXT NOT NULL CHECK (dishwashing_commitment IN ('daily', 'every_other_day', '3x_week', 'weekly')),
  garbage_removal_commitment TEXT NOT NULL CHECK (garbage_removal_commitment IN ('daily', 'every_other_day', '3x_week', 'weekly')),
  kitchen_hygiene_commitment TEXT NOT NULL CHECK (kitchen_hygiene_commitment IN ('after_each_use', 'daily', 'weekly')),
  bathroom_hygiene_commitment TEXT NOT NULL CHECK (bathroom_hygiene_commitment IN ('after_each_use', 'daily', 'weekly')),
  common_area_commitment TEXT NOT NULL CHECK (common_area_commitment IN ('daily', 'weekly')),

  weekly_marks_pledge INT NOT NULL DEFAULT 10,
  marks_staked_current INT NOT NULL DEFAULT 0,
  roommate_score NUMERIC DEFAULT NULL,

  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roommate_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES roommate_applications(id),
  property_id UUID NOT NULL REFERENCES housing_properties(id),
  member_id UUID NOT NULL REFERENCES auth.users(id),

  dishwashing_commitment TEXT NOT NULL,
  garbage_removal_commitment TEXT NOT NULL,
  kitchen_hygiene_commitment TEXT NOT NULL,
  bathroom_hygiene_commitment TEXT NOT NULL,
  common_area_commitment TEXT NOT NULL,

  weekly_marks_pledge INT NOT NULL DEFAULT 10,
  monthly_forfeit_cap INT NOT NULL DEFAULT 30,

  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'probation', 'completed', 'terminated')),

  current_escrow INT NOT NULL DEFAULT 0,
  total_forfeited INT NOT NULL DEFAULT 0,
  total_weeks INT NOT NULL DEFAULT 0,
  clean_weeks INT NOT NULL DEFAULT 0,
  roommate_score NUMERIC,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, member_id, start_date)
);

CREATE TABLE IF NOT EXISTS roommate_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES roommate_agreements(id),
  stamper_id UUID NOT NULL REFERENCES auth.users(id),
  respondent_id UUID NOT NULL REFERENCES auth.users(id),

  category TEXT NOT NULL CHECK (category IN ('dishwashing', 'garbage_removal', 'kitchen_hygiene', 'bathroom_hygiene', 'common_area')),

  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  photo_metadata JSONB DEFAULT '{}',
  description TEXT,

  status TEXT NOT NULL DEFAULT 'filed' CHECK (status IN ('filed', 'contested', 'upheld', 'dismissed', 'resolved_by_steward')),
  contested_at TIMESTAMPTZ,
  contest_evidence TEXT,
  contest_photo_urls TEXT[],
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  marks_forfeited INT DEFAULT 0,
  forfeited_to TEXT DEFAULT 'housing_cooperative_fund',

  incident_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  grace_period_ends TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),

  CONSTRAINT different_people CHECK (stamper_id != respondent_id)
);

-- =====================
-- 2. RLS
-- =====================

ALTER TABLE roommate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE roommate_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roommate_stamps ENABLE ROW LEVEL SECURITY;

-- Applications: own + stewards of property
CREATE POLICY "Members view own applications" ON roommate_applications
  FOR SELECT USING (auth.uid() = applicant_id OR is_admin());
CREATE POLICY "Members create own applications" ON roommate_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Admins manage applications" ON roommate_applications
  FOR ALL USING (is_admin());
CREATE POLICY "Stewards review applications" ON roommate_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM housing_occupancy
      WHERE housing_occupancy.property_id = roommate_applications.property_id
        AND housing_occupancy.member_id = auth.uid()
        AND housing_occupancy.role = 'steward'
        AND housing_occupancy.is_active = true
    )
  );

-- Agreements: own + stewards + co-residents
CREATE POLICY "Members view own agreements" ON roommate_agreements
  FOR SELECT USING (
    auth.uid() = member_id
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM housing_occupancy
      WHERE housing_occupancy.property_id = roommate_agreements.property_id
        AND housing_occupancy.member_id = auth.uid()
        AND housing_occupancy.is_active = true
    )
  );
CREATE POLICY "Admins manage agreements" ON roommate_agreements
  FOR ALL USING (is_admin());

-- Stamps: participants + stewards
CREATE POLICY "Stamp participants can view" ON roommate_stamps
  FOR SELECT USING (
    auth.uid() = stamper_id
    OR auth.uid() = respondent_id
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM roommate_agreements ra
      JOIN housing_occupancy ho ON ho.property_id = ra.property_id
      WHERE ra.id = roommate_stamps.agreement_id
        AND ho.member_id = auth.uid()
        AND ho.role = 'steward'
        AND ho.is_active = true
    )
  );
CREATE POLICY "Members file stamps" ON roommate_stamps
  FOR INSERT WITH CHECK (auth.uid() = stamper_id);
CREATE POLICY "Respondents contest stamps" ON roommate_stamps
  FOR UPDATE USING (auth.uid() = respondent_id OR is_admin());
CREATE POLICY "Admins manage stamps" ON roommate_stamps
  FOR ALL USING (is_admin());

-- =====================
-- 3. Reputation Integration
-- =====================

-- Add agreement reference + interaction_type to existing reputation_ratings
-- Actual remote schema: id, subject_id, rater_id, rating, category, comment, contract_id, created_at, user_id
ALTER TABLE reputation_ratings ADD COLUMN IF NOT EXISTS agreement_id UUID REFERENCES roommate_agreements(id);
ALTER TABLE reputation_ratings ADD COLUMN IF NOT EXISTS interaction_type TEXT DEFAULT 'general';

-- Create project_type_weights if not exists (not present in remote DB)
CREATE TABLE IF NOT EXISTS project_type_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type TEXT NOT NULL UNIQUE,
  quality_weight NUMERIC NOT NULL DEFAULT 40.0,
  timeliness_weight NUMERIC NOT NULL DEFAULT 20.0,
  professionalism_weight NUMERIC NOT NULL DEFAULT 20.0,
  collaboration_weight NUMERIC NOT NULL DEFAULT 10.0,
  standards_compliance_weight NUMERIC NOT NULL DEFAULT 10.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE project_type_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view project type weights" ON project_type_weights FOR SELECT USING (true);
CREATE POLICY "Admins manage project type weights" ON project_type_weights FOR ALL USING (is_admin());

INSERT INTO project_type_weights (project_type, quality_weight, timeliness_weight, professionalism_weight, collaboration_weight, standards_compliance_weight)
VALUES
  ('roommate_living', 40.0, 25.0, 15.0, 10.0, 10.0),
  ('creative', 50.0, 15.0, 15.0, 15.0, 5.0),
  ('manufacturing', 40.0, 25.0, 15.0, 10.0, 10.0),
  ('technical', 35.0, 25.0, 15.0, 15.0, 10.0)
ON CONFLICT (project_type) DO NOTHING;

-- =====================
-- 4. Score Calculation Function
-- =====================

-- Commitment tier scores for the formula
CREATE OR REPLACE FUNCTION roommate_commitment_score(commitment TEXT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN CASE commitment
    WHEN 'daily' THEN 5
    WHEN 'after_each_use' THEN 5
    WHEN 'every_other_day' THEN 4
    WHEN '3x_week' THEN 3
    WHEN 'weekly' THEN 2
    ELSE 2
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_roommate_score(p_agreement_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_agreement roommate_agreements%ROWTYPE;
  v_commitment_avg NUMERIC;
  v_followthrough NUMERIC;
  v_peer_avg NUMERIC;
  v_tenure_score NUMERIC;
  v_total_score NUMERIC;
BEGIN
  SELECT * INTO v_agreement FROM roommate_agreements WHERE id = p_agreement_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  -- 20%: Commitment level (average of all 5 categories)
  v_commitment_avg := (
    roommate_commitment_score(v_agreement.dishwashing_commitment) +
    roommate_commitment_score(v_agreement.garbage_removal_commitment) +
    roommate_commitment_score(v_agreement.kitchen_hygiene_commitment) +
    roommate_commitment_score(v_agreement.bathroom_hygiene_commitment) +
    roommate_commitment_score(v_agreement.common_area_commitment)
  ) / 5.0;

  -- 40%: Follow-through rate (clean_weeks / total_weeks)
  IF v_agreement.total_weeks > 0 THEN
    v_followthrough := (v_agreement.clean_weeks::NUMERIC / v_agreement.total_weeks) * 5.0;
  ELSE
    v_followthrough := 5.0;
  END IF;

  -- 25%: Peer reputation ratings (roommate_living type)
  SELECT COALESCE(AVG(rating), 5.0) INTO v_peer_avg
  FROM reputation_ratings
  WHERE subject_id = v_agreement.member_id
    AND interaction_type = 'roommate_living';

  -- 15%: Tenure bonus (caps at 5.0 after 52 weeks)
  v_tenure_score := LEAST(v_agreement.total_weeks / 52.0 * 5.0, 5.0);

  v_total_score := (v_commitment_avg * 0.20) +
                   (v_followthrough * 0.40) +
                   (v_peer_avg * 0.25) +
                   (v_tenure_score * 0.15);

  -- Clamp to 0-5
  v_total_score := GREATEST(LEAST(v_total_score, 5.0), 0.0);

  UPDATE roommate_agreements SET roommate_score = v_total_score, updated_at = now()
  WHERE id = p_agreement_id;

  RETURN v_total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 5. Weekly Escrow Processing Function
-- =====================

CREATE OR REPLACE FUNCTION process_roommate_escrow()
RETURNS TABLE(agreement_id UUID, action TEXT, marks_amount INT) AS $$
DECLARE
  v_agreement RECORD;
  v_upheld_count INT;
  v_forfeit_amount INT;
  v_month_forfeited INT;
BEGIN
  FOR v_agreement IN
    SELECT * FROM roommate_agreements WHERE status IN ('active', 'probation')
  LOOP
    -- Count upheld stamps this week
    SELECT COUNT(*) INTO v_upheld_count
    FROM roommate_stamps
    WHERE roommate_stamps.agreement_id = v_agreement.id
      AND respondent_id = v_agreement.member_id
      AND status = 'upheld'
      AND created_at >= (now() - interval '7 days');

    -- Check monthly forfeit so far
    SELECT COALESCE(SUM(marks_forfeited), 0) INTO v_month_forfeited
    FROM roommate_stamps
    WHERE roommate_stamps.agreement_id = v_agreement.id
      AND respondent_id = v_agreement.member_id
      AND status = 'upheld'
      AND created_at >= date_trunc('month', now());

    -- Process forfeits (respect monthly cap of 30)
    IF v_upheld_count > 0 AND v_month_forfeited < v_agreement.monthly_forfeit_cap THEN
      v_forfeit_amount := LEAST(
        v_agreement.current_escrow,
        v_agreement.weekly_marks_pledge,
        v_agreement.monthly_forfeit_cap - v_month_forfeited
      );

      IF v_forfeit_amount > 0 THEN
        UPDATE roommate_agreements
        SET current_escrow = current_escrow - v_forfeit_amount,
            total_forfeited = total_forfeited + v_forfeit_amount,
            updated_at = now()
        WHERE id = v_agreement.id;

        -- Record as housing contribution (forfeited to cooperative fund)
        INSERT INTO housing_contributions (contributor_id, property_id, contribution_type, amount, currency, description, verified, verified_at)
        VALUES (v_agreement.member_id, v_agreement.property_id, 'mark_pledge', v_forfeit_amount, 'marks',
                'Roommate accountability forfeit — ' || v_upheld_count || ' upheld stamp(s)', true, now());

        agreement_id := v_agreement.id; action := 'forfeit'; marks_amount := v_forfeit_amount;
        RETURN NEXT;
      END IF;

      -- Update week as not clean
      UPDATE roommate_agreements
      SET total_weeks = total_weeks + 1, updated_at = now()
      WHERE id = v_agreement.id;
    ELSE
      -- Clean week
      UPDATE roommate_agreements
      SET total_weeks = total_weeks + 1, clean_weeks = clean_weeks + 1, updated_at = now()
      WHERE id = v_agreement.id;
    END IF;

    -- Refill escrow from pledge
    UPDATE roommate_agreements
    SET current_escrow = current_escrow + v_agreement.weekly_marks_pledge, updated_at = now()
    WHERE id = v_agreement.id;

    agreement_id := v_agreement.id; action := 'escrow_refill'; marks_amount := v_agreement.weekly_marks_pledge;
    RETURN NEXT;

    -- Recalculate roommate score
    PERFORM calculate_roommate_score(v_agreement.id);

    -- Trigger steward review if 3+ forfeits this month
    IF v_month_forfeited + COALESCE(v_forfeit_amount, 0) >= v_agreement.monthly_forfeit_cap THEN
      UPDATE roommate_agreements SET status = 'probation', updated_at = now()
      WHERE id = v_agreement.id AND status = 'active';

      agreement_id := v_agreement.id; action := 'probation_triggered'; marks_amount := 0;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 6. Indexes
-- =====================

CREATE INDEX IF NOT EXISTS idx_roommate_apps_applicant ON roommate_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_roommate_apps_property ON roommate_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_roommate_agreements_member ON roommate_agreements(member_id);
CREATE INDEX IF NOT EXISTS idx_roommate_agreements_property ON roommate_agreements(property_id);
CREATE INDEX IF NOT EXISTS idx_roommate_stamps_agreement ON roommate_stamps(agreement_id);
CREATE INDEX IF NOT EXISTS idx_roommate_stamps_respondent ON roommate_stamps(respondent_id);
CREATE INDEX IF NOT EXISTS idx_roommate_stamps_status ON roommate_stamps(status);
CREATE INDEX IF NOT EXISTS idx_reputation_agreement ON reputation_ratings(agreement_id);
