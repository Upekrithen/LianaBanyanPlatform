-- K147: Piggyback Improvement Pipeline

-- Improvement submissions
CREATE TABLE IF NOT EXISTS piggyback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_download_id UUID REFERENCES hexisle_downloads(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  improvement_type TEXT NOT NULL CHECK (improvement_type IN (
    'tolerance_fix','print_orientation','fdm_optimization','material_change',
    'mechanism_redesign','new_function','aesthetic_improvement','assembly_simplification',
    'cost_reduction','other'
  )),
  stl_url TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  test_results TEXT,
  printer_used TEXT,
  material_used TEXT,
  print_settings TEXT,

  -- Classification
  proposed_tier TEXT CHECK (proposed_tier IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),
  assigned_tier TEXT CHECK (assigned_tier IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),

  -- Review
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted','under_review','approved','rejected','revision_requested','promoted'
  )),
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,

  -- Rewards
  marks_awarded NUMERIC DEFAULT 0,
  is_process_pioneer BOOLEAN DEFAULT false,
  ip_ledger_entry TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE piggyback_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read approved submissions" ON piggyback_submissions
  FOR SELECT USING (status IN ('approved','promoted') OR auth.uid() = submitter_id);
CREATE POLICY "Authenticated users submit" ON piggyback_submissions
  FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "Submitters update own" ON piggyback_submissions
  FOR UPDATE USING (auth.uid() = submitter_id AND status IN ('submitted','revision_requested'));

-- Review queue for Founder/team
CREATE TABLE IF NOT EXISTS piggyback_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES piggyback_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approve','reject','request_revision','promote','assign_tier')),
  tier_assigned TEXT CHECK (tier_assigned IN (
    'tereno_certified','tereno_approved','hexisle_official',
    'hexisle_compatible','hexisle_adaptable','hexisle_inspired'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE piggyback_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewers manage reviews" ON piggyback_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Submitters read own reviews" ON piggyback_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM piggyback_submissions ps
      WHERE ps.id = piggyback_reviews.submission_id AND ps.submitter_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_piggyback_status ON piggyback_submissions(status);
CREATE INDEX IF NOT EXISTS idx_piggyback_submitter ON piggyback_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_piggyback_tier ON piggyback_submissions(assigned_tier) WHERE assigned_tier IS NOT NULL;
