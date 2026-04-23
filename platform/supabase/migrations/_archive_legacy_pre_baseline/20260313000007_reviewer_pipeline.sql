-- ============================================================
-- REVIEWER PIPELINE — "The Harper's Eye"
-- Migration 000007
-- ============================================================

-- 1. Reviewer applications
CREATE TABLE IF NOT EXISTS reviewer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  tier text NOT NULL CHECK (tier IN ('content', 'stat')) DEFAULT 'content',
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')) DEFAULT 'pending',
  motivation text NOT NULL,
  relevant_experience text,
  sample_review text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tier)
);

-- 2. Active reviewers
CREATE TABLE IF NOT EXISTS reviewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) UNIQUE,
  tier text NOT NULL CHECK (tier IN ('content', 'stat', 'harper')) DEFAULT 'content',
  reviews_completed integer NOT NULL DEFAULT 0,
  reviews_overturned integer NOT NULL DEFAULT 0,
  accuracy_rate numeric(5,2) GENERATED ALWAYS AS (
    CASE WHEN reviews_completed > 0
      THEN ((reviews_completed - reviews_overturned)::numeric / reviews_completed * 100)
      ELSE 100.0
    END
  ) STORED,
  promoted_at timestamptz,
  suspended_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Review queue
CREATE TABLE IF NOT EXISTS review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN (
    'portfolio_item', 'recipe', 'business_plan', 'proposal',
    'marketplace_listing', 'cue_card', 'testimonial', 'other'
  )),
  content_id uuid NOT NULL,
  content_table text NOT NULL,
  content_snapshot jsonb NOT NULL,
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  assigned_to uuid REFERENCES reviewers(id),
  assigned_at timestamptz,
  status text NOT NULL CHECK (status IN (
    'pending', 'assigned', 'approved', 'rejected',
    'needs_revision', 'escalated', 'auto_flagged'
  )) DEFAULT 'pending',
  sec_flags jsonb,
  sec_flag_count integer NOT NULL DEFAULT 0,
  reviewer_notes text,
  rejection_reason text,
  revision_instructions text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Review history
CREATE TABLE IF NOT EXISTS review_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_item_id uuid NOT NULL REFERENCES review_queue(id),
  reviewer_id uuid NOT NULL REFERENCES reviewers(id),
  action text NOT NULL CHECK (action IN (
    'claimed', 'approved', 'rejected', 'needs_revision',
    'escalated', 'released', 'overturned'
  )),
  notes text,
  sec_flags_at_review jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. SEC dangerous terms
CREATE TABLE IF NOT EXISTS sec_dangerous_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN (
    'equity', 'investment', 'returns', 'securities', 'ownership'
  )),
  suggestion text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'warning', 'info')) DEFAULT 'warning',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO sec_dangerous_terms (term, category, suggestion, severity) VALUES
  ('equity', 'equity', 'participation / service allocation', 'critical'),
  ('invest', 'investment', 'sponsor / contribute / back', 'critical'),
  ('investment', 'investment', 'sponsorship / contribution / backing', 'critical'),
  ('investor', 'investment', 'sponsor / backer', 'critical'),
  ('ROI', 'returns', 'service value / utility benefit', 'critical'),
  ('return on', 'returns', 'service value / utility benefit', 'critical'),
  ('returns', 'returns', 'service value / utility benefit', 'warning'),
  ('shares', 'ownership', 'membership participation / service units', 'critical'),
  ('ownership', 'ownership', 'membership participation', 'warning'),
  ('dividend', 'returns', 'platform benefit / service credit', 'critical'),
  ('profit', 'returns', 'platform benefit / surplus', 'warning'),
  ('convertible note', 'securities', 'REMOVE — do not use', 'critical'),
  ('stock', 'securities', 'membership participation', 'warning'),
  ('securities', 'securities', 'service arrangements', 'critical'),
  ('shareholder', 'ownership', 'member / participant', 'critical'),
  ('stakeholder', 'ownership', 'participant / community member', 'info')
ON CONFLICT (term) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_assigned ON review_queue(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_review_queue_submitted ON review_queue(submitted_by);
CREATE INDEX IF NOT EXISTS idx_review_history_queue ON review_history(queue_item_id);
CREATE INDEX IF NOT EXISTS idx_reviewers_tier ON reviewers(tier);

ALTER TABLE reviewer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sec_dangerous_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviewer_applications_own_read ON reviewer_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY reviewer_applications_own_insert ON reviewer_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY reviewer_applications_harper_read ON reviewer_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reviewers WHERE user_id = auth.uid() AND tier = 'harper')
  );
CREATE POLICY reviewer_applications_harper_update ON reviewer_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM reviewers WHERE user_id = auth.uid() AND tier = 'harper')
  );

CREATE POLICY reviewers_own_read ON reviewers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY reviewers_harper_read ON reviewers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reviewers r WHERE r.user_id = auth.uid() AND r.tier = 'harper')
  );

CREATE POLICY review_queue_reviewer_read ON review_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reviewers WHERE user_id = auth.uid())
  );
CREATE POLICY review_queue_reviewer_update ON review_queue
  FOR UPDATE USING (
    assigned_to IN (SELECT id FROM reviewers WHERE user_id = auth.uid())
  );
CREATE POLICY review_queue_submit ON review_queue
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY review_history_reviewer_read ON review_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reviewers WHERE user_id = auth.uid())
  );
CREATE POLICY review_history_reviewer_insert ON review_history
  FOR INSERT WITH CHECK (
    reviewer_id IN (SELECT id FROM reviewers WHERE user_id = auth.uid())
  );

CREATE POLICY sec_terms_public_read ON sec_dangerous_terms
  FOR SELECT USING (true);
