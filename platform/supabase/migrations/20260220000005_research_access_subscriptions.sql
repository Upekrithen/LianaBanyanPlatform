-- ============================================================================
-- RESEARCH ACCESS SUBSCRIPTIONS
-- The Lemonade Stand Model — Real data, real users, minimal cost to fail
-- ============================================================================
--
-- Researchers can subscribe to run longitudinal studies using real platform
-- data at $5/month. They get:
-- - Access to Contingency Operators for their experiments
-- - Regular automated reports (frequency based on tier)
-- - Storage for report archives (or rolling replacement)
-- - Zero demographics by design — ethically clean research
--
-- This enables PhD research, business simulations, and "try before you bet
-- the farm" entrepreneurship testing.
-- ============================================================================

-- Research subscription tiers
CREATE TABLE IF NOT EXISTS public.research_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription details
  tier TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic', 'standard', 'premium', 'institutional')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),

  -- Pricing (in Credits or USD cents)
  monthly_rate_credits INTEGER DEFAULT 500, -- 500 Credits = ~$5
  monthly_rate_cents INTEGER DEFAULT 500,   -- $5.00

  -- Report configuration
  report_frequency TEXT DEFAULT 'weekly' CHECK (report_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  max_stored_reports INTEGER DEFAULT 12,    -- Rolling window
  report_format TEXT DEFAULT 'json' CHECK (report_format IN ('json', 'csv', 'pdf', 'all')),

  -- Experiment limits
  max_active_experiments INTEGER DEFAULT 3,
  max_chain_depth INTEGER DEFAULT 5,
  max_factors_per_experiment INTEGER DEFAULT 8,

  -- Storage allocation (in MB)
  storage_quota_mb INTEGER DEFAULT 100,
  storage_used_mb INTEGER DEFAULT 0,

  -- Research metadata (optional, for institutional tracking)
  institution_name TEXT,
  research_purpose TEXT,
  irb_approval_number TEXT, -- Institutional Review Board

  -- Billing
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 month'),
  stripe_subscription_id TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Research reports generated from experiments
CREATE TABLE IF NOT EXISTS public.research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.research_subscriptions(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES public.thought_experiments(id) ON DELETE SET NULL,

  -- Report content
  report_type TEXT NOT NULL DEFAULT 'snapshot' CHECK (report_type IN ('snapshot', 'comparison', 'longitudinal', 'summary')),
  report_title TEXT,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metrics captured
  factors_measured JSONB DEFAULT '[]'::jsonb,
  net_score_at_generation NUMERIC,
  data_points_count INTEGER DEFAULT 0,

  -- Period covered
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  -- Storage management
  size_bytes INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  archive_url TEXT, -- If moved to cold storage

  -- Retention
  retain_until TIMESTAMPTZ, -- NULL = keep forever, date = auto-delete after

  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Research access audit log (for compliance)
CREATE TABLE IF NOT EXISTS public.research_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.research_subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Action tracking
  action_type TEXT NOT NULL, -- 'experiment_created', 'report_generated', 'data_exported', etc.
  action_details JSONB DEFAULT '{}'::jsonb,

  -- Data accessed (for audit trail)
  data_scope TEXT, -- 'aggregate_only', 'anonymized', 'none'
  records_accessed INTEGER DEFAULT 0,

  -- Zero Demographics compliance
  demographics_accessed BOOLEAN DEFAULT false, -- Should ALWAYS be false
  pii_accessed BOOLEAN DEFAULT false,          -- Should ALWAYS be false

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_subs_user ON public.research_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_subs_status ON public.research_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_research_reports_sub ON public.research_reports(subscription_id);
CREATE INDEX IF NOT EXISTS idx_research_reports_experiment ON public.research_reports(experiment_id);
CREATE INDEX IF NOT EXISTS idx_research_log_sub ON public.research_access_log(subscription_id);

-- RLS
ALTER TABLE public.research_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_access_log ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see their own research data
CREATE POLICY "research_subs_own" ON public.research_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "research_reports_own" ON public.research_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.research_subscriptions
      WHERE id = subscription_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "research_log_own" ON public.research_access_log
  FOR SELECT USING (auth.uid() = user_id);

-- Insert audit log entries automatically
CREATE POLICY "research_log_insert" ON public.research_access_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check storage quota
CREATE OR REPLACE FUNCTION check_research_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription RECORD;
  v_total_used INTEGER;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription
  FROM public.research_subscriptions
  WHERE id = NEW.subscription_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;

  -- Calculate total storage used
  SELECT COALESCE(SUM(size_bytes), 0) / (1024 * 1024) INTO v_total_used
  FROM public.research_reports
  WHERE subscription_id = NEW.subscription_id
    AND NOT is_archived;

  -- Check quota
  IF v_total_used + (NEW.size_bytes / (1024 * 1024)) > v_subscription.storage_quota_mb THEN
    RAISE EXCEPTION 'Storage quota exceeded. Used: % MB, Quota: % MB',
      v_total_used, v_subscription.storage_quota_mb;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_storage_before_report
  BEFORE INSERT ON public.research_reports
  FOR EACH ROW
  EXECUTE FUNCTION check_research_storage_quota();

-- Function to auto-cleanup old reports (rolling window)
CREATE OR REPLACE FUNCTION cleanup_old_research_reports(p_subscription_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_subscription RECORD;
  v_deleted INTEGER := 0;
BEGIN
  SELECT * INTO v_subscription
  FROM public.research_subscriptions
  WHERE id = p_subscription_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Delete oldest reports beyond max_stored_reports
  WITH to_delete AS (
    SELECT id
    FROM public.research_reports
    WHERE subscription_id = p_subscription_id
      AND retain_until IS NULL -- Only auto-delete non-retained
    ORDER BY generated_at DESC
    OFFSET v_subscription.max_stored_reports
  )
  DELETE FROM public.research_reports
  WHERE id IN (SELECT id FROM to_delete);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Subscription tier definitions
CREATE TABLE IF NOT EXISTS public.research_tier_definitions (
  tier TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  monthly_credits INTEGER NOT NULL,
  monthly_usd_cents INTEGER NOT NULL,

  -- Limits
  max_experiments INTEGER NOT NULL,
  max_chain_depth INTEGER NOT NULL,
  max_factors INTEGER NOT NULL,
  storage_mb INTEGER NOT NULL,
  max_reports INTEGER NOT NULL,

  -- Features
  report_frequencies TEXT[] NOT NULL,
  export_formats TEXT[] NOT NULL,
  api_access BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false
);

-- Seed tier definitions
INSERT INTO public.research_tier_definitions
  (tier, display_name, description, monthly_credits, monthly_usd_cents,
   max_experiments, max_chain_depth, max_factors, storage_mb, max_reports,
   report_frequencies, export_formats, api_access, priority_support)
VALUES
  ('basic', 'Lemonade Stand',
   'Perfect for individual researchers and students. Test your hypotheses with real data.',
   500, 500, 3, 5, 8, 100, 12,
   ARRAY['weekly', 'monthly'], ARRAY['json', 'csv'], false, false),

  ('standard', 'Research Lab',
   'For serious research projects. More experiments, deeper analysis.',
   1500, 1500, 10, 10, 15, 500, 52,
   ARRAY['daily', 'weekly', 'biweekly', 'monthly'], ARRAY['json', 'csv', 'pdf'], true, false),

  ('premium', 'Research Institute',
   'Full research capabilities. Ideal for PhD programs and research teams.',
   5000, 5000, 25, 15, 25, 2000, 365,
   ARRAY['daily', 'weekly', 'biweekly', 'monthly'], ARRAY['json', 'csv', 'pdf', 'all'], true, true),

  ('institutional', 'University Partnership',
   'Custom pricing for academic institutions. Contact for details.',
   0, 0, 100, 20, 50, 10000, 1000,
   ARRAY['daily', 'weekly', 'biweekly', 'monthly'], ARRAY['json', 'csv', 'pdf', 'all'], true, true)
ON CONFLICT (tier) DO NOTHING;

-- Comments
COMMENT ON TABLE public.research_subscriptions IS 'The Lemonade Stand Model: Research access subscriptions for running experiments with real platform data';
COMMENT ON TABLE public.research_reports IS 'Generated reports from research experiments';
COMMENT ON TABLE public.research_access_log IS 'Audit trail for research data access - Zero Demographics compliance';
COMMENT ON TABLE public.research_tier_definitions IS 'Subscription tier configurations and pricing';

COMMENT ON COLUMN public.research_access_log.demographics_accessed IS 'Zero Demographics: This should ALWAYS be false. Platform does not collect demographic data.';
COMMENT ON COLUMN public.research_access_log.pii_accessed IS 'Zero Demographics: This should ALWAYS be false. Research uses only aggregate/anonymized data.';
