-- ============================================================================
-- K353 Phases 4-6: Trunk Mirror + Harper Auto-Suspension + City Aggregation
-- Phase 4: trunk_mirror_submissions — local dev → review → deploy pipeline
-- Phase 5: neighborhood_harper_reviews + auto-suspend trigger
-- Phase 6: city_stats view for aggregation
-- ============================================================================

-- =====================
-- PHASE 4: Trunk Mirror Submissions
-- =====================
CREATE TABLE IF NOT EXISTS trunk_mirror_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  diff_summary TEXT,

  theme_config_draft JSONB DEFAULT '{}'::jsonb,
  custom_css_draft TEXT,
  component_bundle_url TEXT,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'deployed')),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tms_neighborhood ON trunk_mirror_submissions (neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_tms_status ON trunk_mirror_submissions (status);
CREATE INDEX IF NOT EXISTS idx_tms_submitted_by ON trunk_mirror_submissions (submitted_by);

ALTER TABLE trunk_mirror_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tms_public_read' AND tablename = 'trunk_mirror_submissions') THEN
    CREATE POLICY tms_public_read ON trunk_mirror_submissions
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tms_owner_manage' AND tablename = 'trunk_mirror_submissions') THEN
    CREATE POLICY tms_owner_manage ON trunk_mirror_submissions
      FOR ALL USING (submitted_by = auth.uid());
  END IF;
END $$;


-- =====================
-- PHASE 5: Harper Reviews for Neighborhoods + Auto-Suspension
-- =====================
CREATE TABLE IF NOT EXISTS neighborhood_harper_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  score NUMERIC(3,1) NOT NULL CHECK (score >= 0 AND score <= 5),
  category TEXT NOT NULL CHECK (category IN ('quality', 'compliance', 'presentation', 'community', 'overall')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (neighborhood_id, reviewer_id, category)
);

CREATE INDEX IF NOT EXISTS idx_nhr_neighborhood ON neighborhood_harper_reviews (neighborhood_id);
ALTER TABLE neighborhood_harper_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'nhr_public_read' AND tablename = 'neighborhood_harper_reviews') THEN
    CREATE POLICY nhr_public_read ON neighborhood_harper_reviews
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'nhr_reviewer_manage' AND tablename = 'neighborhood_harper_reviews') THEN
    CREATE POLICY nhr_reviewer_manage ON neighborhood_harper_reviews
      FOR ALL USING (reviewer_id = auth.uid());
  END IF;
END $$;

-- Function: recalculate harper_score on neighborhood from reviews
CREATE OR REPLACE FUNCTION recalc_neighborhood_harper_score()
RETURNS TRIGGER AS $$
DECLARE avg_score NUMERIC;
BEGIN
  SELECT COALESCE(AVG(score), 0) INTO avg_score
    FROM neighborhood_harper_reviews
   WHERE neighborhood_id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);

  UPDATE neighborhoods
     SET harper_score = avg_score,
         updated_at = now()
   WHERE id = COALESCE(NEW.neighborhood_id, OLD.neighborhood_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalc_harper_score ON neighborhood_harper_reviews;
CREATE TRIGGER trg_recalc_harper_score
  AFTER INSERT OR UPDATE OR DELETE ON neighborhood_harper_reviews
  FOR EACH ROW EXECUTE FUNCTION recalc_neighborhood_harper_score();

-- Function: auto-suspend neighborhoods with harper_score < 2.0
CREATE OR REPLACE FUNCTION auto_suspend_low_harper_neighborhoods()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.harper_score < 2.0 AND NEW.harper_score > 0 AND NEW.status = 'active' THEN
    NEW.status := 'suspended';
  END IF;

  IF NEW.harper_score >= 2.0 AND OLD.harper_score < 2.0 AND NEW.status = 'suspended' THEN
    NEW.status := 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_suspend_neighborhood ON neighborhoods;
CREATE TRIGGER trg_auto_suspend_neighborhood
  BEFORE UPDATE OF harper_score ON neighborhoods
  FOR EACH ROW EXECUTE FUNCTION auto_suspend_low_harper_neighborhoods();


-- =====================
-- PHASE 6: City Stats View
-- =====================
CREATE OR REPLACE VIEW city_neighborhood_stats AS
SELECT
  city,
  state,
  region,
  COUNT(*) FILTER (WHERE status = 'active') AS active_neighborhoods,
  COUNT(*) AS total_neighborhoods,
  COALESCE(SUM(storefront_count), 0) AS total_storefronts,
  COALESCE(SUM(visitor_count), 0) AS total_visitors,
  COALESCE(AVG(harper_score) FILTER (WHERE harper_score > 0), 0) AS avg_harper_score,
  COALESCE(AVG(rating_avg) FILTER (WHERE rating_count > 0), 0) AS avg_rating,
  MAX(created_at) AS newest_neighborhood
FROM neighborhoods
GROUP BY city, state, region
ORDER BY active_neighborhoods DESC, total_visitors DESC;
