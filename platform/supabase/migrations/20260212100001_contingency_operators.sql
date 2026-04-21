-- ============================================================================
-- CONTINGENCY OPERATORS (THOUGHT EXPERIMENT SYSTEM)
-- Innovation #1188
-- ============================================================================
-- STATUS: READY TO DEPLOY (Additive Only - Fully Reversible)
--
-- This migration creates the Contingency Operators system for non-destructive
-- what-if scenario testing. All tables are NEW - no existing tables modified.
--
-- TO REVERT: Run the rollback script at the bottom of this file
-- ============================================================================

-- ============================================================================
-- THOUGHT EXPERIMENTS (Sandboxes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.thought_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,

  -- The Delta (single-point change being tested)
  delta_type text NOT NULL,  -- 'pricing', 'threshold', 'currency', 'policy', etc.
  delta_config jsonb NOT NULL,  -- Specific change parameters
  delta_description text NOT NULL,  -- Human-readable "What if..."

  -- C.O. Parameters
  chain_depth integer DEFAULT 3 CHECK (chain_depth >= 1 AND chain_depth <= 20),
  factors jsonb NOT NULL DEFAULT '[]'::jsonb,  -- Array of {name, weight}
  extension_threshold numeric DEFAULT 0.10 CHECK (extension_threshold >= 0 AND extension_threshold <= 1),
  max_extensions integer DEFAULT 3 CHECK (max_extensions >= 0 AND max_extensions <= 10),

  -- State
  status text DEFAULT 'running' CHECK (status IN ('running', 'paused', 'variant', 'adopted', 'discarded')),
  forked_at timestamptz DEFAULT now(),
  forked_from_reality_snapshot_id uuid,  -- Optional reference to a REALITY snapshot

  -- Hierarchy
  parent_experiment_id uuid REFERENCES public.thought_experiments(id),
  extension_number integer DEFAULT 0,

  -- Results
  current_net_score numeric DEFAULT 0,
  last_computed_at timestamptz,

  -- Ownership
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for querying active experiments
CREATE INDEX IF NOT EXISTS idx_thought_experiments_status
  ON public.thought_experiments(status);

CREATE INDEX IF NOT EXISTS idx_thought_experiments_created_by
  ON public.thought_experiments(created_by);

CREATE INDEX IF NOT EXISTS idx_thought_experiments_parent
  ON public.thought_experiments(parent_experiment_id);

-- ============================================================================
-- VECTOR CHANGE EFFECTS (Results per factor per snapshot)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vector_change_effects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.thought_experiments(id) ON DELETE CASCADE,

  -- Factor being measured
  factor_name text NOT NULL,
  factor_weight numeric DEFAULT 1.0,

  -- Measurements
  reality_value numeric,
  sandbox_value numeric,
  delta_percent numeric,
  direction text CHECK (direction IN ('positive', 'negative', 'neutral')),

  -- Confidence and context
  confidence numeric DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  chain_depth integer DEFAULT 1,
  data_points_count integer DEFAULT 0,

  -- Timing
  period_start timestamptz,
  period_end timestamptz,
  computed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vector_effects_experiment
  ON public.vector_change_effects(experiment_id);

CREATE INDEX IF NOT EXISTS idx_vector_effects_factor
  ON public.vector_change_effects(factor_name);

-- ============================================================================
-- EXPERIMENT SNAPSHOTS (Iterative History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.experiment_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES public.thought_experiments(id) ON DELETE CASCADE,

  -- Snapshot data
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  vector_effects_summary jsonb DEFAULT '[]'::jsonb,
  net_score numeric,

  -- Context
  snapshot_number integer NOT NULL,
  notes text,

  -- Timing
  snapshot_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiment_snapshots_experiment
  ON public.experiment_snapshots(experiment_id);

-- Ensure snapshot numbers are sequential per experiment
CREATE UNIQUE INDEX IF NOT EXISTS idx_experiment_snapshots_unique_number
  ON public.experiment_snapshots(experiment_id, snapshot_number);

-- ============================================================================
-- EXPERIMENT EXTENSIONS (Secondary Sandbox Spawns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.experiment_extensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.thought_experiments(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES public.thought_experiments(id) ON DELETE CASCADE,

  extension_number integer NOT NULL,
  spawn_trigger_score numeric,  -- Net score that triggered spawn
  spawn_reason text,

  spawned_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extensions_parent
  ON public.experiment_extensions(parent_id);

CREATE INDEX IF NOT EXISTS idx_extensions_child
  ON public.experiment_extensions(child_id);

-- ============================================================================
-- REALITY SNAPSHOTS (Optional baseline captures)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reality_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Snapshot identification
  name text,
  description text,

  -- Aggregated platform state at snapshot time
  member_count integer,
  active_orders_count integer,
  total_revenue numeric,
  metrics_snapshot jsonb DEFAULT '{}'::jsonb,

  -- Source
  snapshot_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- ============================================================================
-- FACTOR TEMPLATES (Predefined factor sets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.co_factor_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,

  -- Factor definitions
  factors jsonb NOT NULL DEFAULT '[]'::jsonb,  -- Array of {name, weight, description}

  -- Categorization
  category text,  -- 'economic', 'engagement', 'growth', etc.
  is_default boolean DEFAULT false,

  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Seed some default factor templates
INSERT INTO public.co_factor_templates (name, description, factors, category, is_default)
VALUES
  (
    'Economic Health',
    'Core economic metrics for platform sustainability',
    '[
      {"name": "revenue_per_member", "weight": 0.25, "description": "Average revenue generated per active member"},
      {"name": "transaction_volume", "weight": 0.25, "description": "Total transaction count"},
      {"name": "creator_retention", "weight": 0.20, "description": "Percentage of creators still active after 90 days"},
      {"name": "margin_stability", "weight": 0.15, "description": "Variance in platform margin"},
      {"name": "currency_velocity", "weight": 0.15, "description": "Rate of Credits/Marks/Joules circulation"}
    ]'::jsonb,
    'economic',
    true
  ),
  (
    'Member Engagement',
    'User activity and satisfaction indicators',
    '[
      {"name": "daily_active_users", "weight": 0.20, "description": "DAU count"},
      {"name": "session_duration", "weight": 0.15, "description": "Average time on platform"},
      {"name": "feature_adoption", "weight": 0.20, "description": "Percentage using key features"},
      {"name": "referral_rate", "weight": 0.25, "description": "Members who have referred others"},
      {"name": "support_tickets", "weight": 0.20, "description": "Inverse - fewer is better"}
    ]'::jsonb,
    'engagement',
    true
  ),
  (
    'Food Ecosystem',
    'Let''s Make Dinner and related initiative metrics',
    '[
      {"name": "lmd_order_volume", "weight": 0.25, "description": "Total meal orders"},
      {"name": "maker_participation", "weight": 0.20, "description": "Active makers in system"},
      {"name": "aggregation_efficiency", "weight": 0.20, "description": "Orders bundled vs solo"},
      {"name": "delivery_completion", "weight": 0.20, "description": "Successful deliveries"},
      {"name": "taste_tester_activity", "weight": 0.15, "description": "New recipe trial rate"}
    ]'::jsonb,
    'initiative',
    false
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate net score from vector effects
CREATE OR REPLACE FUNCTION public.calculate_experiment_net_score(p_experiment_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_net_score numeric := 0;
  v_effect RECORD;
BEGIN
  FOR v_effect IN
    SELECT
      factor_weight,
      delta_percent,
      confidence
    FROM public.vector_change_effects
    WHERE experiment_id = p_experiment_id
      AND computed_at = (
        SELECT MAX(computed_at)
        FROM public.vector_change_effects
        WHERE experiment_id = p_experiment_id
      )
  LOOP
    -- Weighted contribution: delta * weight * confidence
    v_net_score := v_net_score + (
      COALESCE(v_effect.delta_percent, 0) *
      COALESCE(v_effect.factor_weight, 1) *
      COALESCE(v_effect.confidence, 0.5)
    );
  END LOOP;

  RETURN v_net_score;
END;
$$;

-- Function to check if experiment should spawn extension
CREATE OR REPLACE FUNCTION public.check_extension_spawn(p_experiment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_experiment RECORD;
  v_current_extensions integer;
  v_net_score numeric;
BEGIN
  -- Get experiment config
  SELECT * INTO v_experiment
  FROM public.thought_experiments
  WHERE id = p_experiment_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Count existing extensions
  SELECT COUNT(*) INTO v_current_extensions
  FROM public.experiment_extensions
  WHERE parent_id = p_experiment_id;

  -- Check if at max
  IF v_current_extensions >= v_experiment.max_extensions THEN
    RETURN false;
  END IF;

  -- Calculate current net score
  v_net_score := public.calculate_experiment_net_score(p_experiment_id);

  -- Check threshold
  RETURN v_net_score >= v_experiment.extension_threshold;
END;
$$;

-- Function to create experiment snapshot
CREATE OR REPLACE FUNCTION public.create_experiment_snapshot(
  p_experiment_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_snapshot_id uuid;
  v_snapshot_number integer;
  v_net_score numeric;
  v_effects_summary jsonb;
BEGIN
  -- Get next snapshot number
  SELECT COALESCE(MAX(snapshot_number), 0) + 1 INTO v_snapshot_number
  FROM public.experiment_snapshots
  WHERE experiment_id = p_experiment_id;

  -- Calculate current net score
  v_net_score := public.calculate_experiment_net_score(p_experiment_id);

  -- Get effects summary
  SELECT jsonb_agg(
    jsonb_build_object(
      'factor', factor_name,
      'delta_percent', delta_percent,
      'direction', direction,
      'confidence', confidence
    )
  ) INTO v_effects_summary
  FROM public.vector_change_effects
  WHERE experiment_id = p_experiment_id
    AND computed_at = (
      SELECT MAX(computed_at)
      FROM public.vector_change_effects
      WHERE experiment_id = p_experiment_id
    );

  -- Create snapshot
  INSERT INTO public.experiment_snapshots (
    experiment_id,
    snapshot_number,
    net_score,
    vector_effects_summary,
    notes
  )
  VALUES (
    p_experiment_id,
    v_snapshot_number,
    v_net_score,
    COALESCE(v_effects_summary, '[]'::jsonb),
    p_notes
  )
  RETURNING id INTO v_snapshot_id;

  -- Update experiment current score
  UPDATE public.thought_experiments
  SET
    current_net_score = v_net_score,
    last_computed_at = now(),
    updated_at = now()
  WHERE id = p_experiment_id;

  RETURN v_snapshot_id;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.thought_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_change_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_factor_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "experiments_select" ON public.thought_experiments;
DROP POLICY IF EXISTS "experiments_insert_own" ON public.thought_experiments;
DROP POLICY IF EXISTS "experiments_update_own" ON public.thought_experiments;
DROP POLICY IF EXISTS "experiments_delete_own" ON public.thought_experiments;
DROP POLICY IF EXISTS "effects_select" ON public.vector_change_effects;
DROP POLICY IF EXISTS "effects_insert" ON public.vector_change_effects;
DROP POLICY IF EXISTS "snapshots_select" ON public.experiment_snapshots;
DROP POLICY IF EXISTS "snapshots_insert" ON public.experiment_snapshots;
DROP POLICY IF EXISTS "extensions_select" ON public.experiment_extensions;
DROP POLICY IF EXISTS "extensions_insert" ON public.experiment_extensions;
DROP POLICY IF EXISTS "reality_select" ON public.reality_snapshots;
DROP POLICY IF EXISTS "reality_insert" ON public.reality_snapshots;
DROP POLICY IF EXISTS "templates_select" ON public.co_factor_templates;

-- Thought experiments: creators can manage their own, all can read
CREATE POLICY "experiments_select" ON public.thought_experiments
  FOR SELECT USING (true);

CREATE POLICY "experiments_insert_own" ON public.thought_experiments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "experiments_update_own" ON public.thought_experiments
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "experiments_delete_own" ON public.thought_experiments
  FOR DELETE USING (auth.uid() = created_by);

-- Vector effects: read all, modify only linked experiments
CREATE POLICY "effects_select" ON public.vector_change_effects
  FOR SELECT USING (true);

CREATE POLICY "effects_insert" ON public.vector_change_effects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.thought_experiments
      WHERE id = experiment_id AND created_by = auth.uid()
    )
  );

-- Snapshots: same as effects
CREATE POLICY "snapshots_select" ON public.experiment_snapshots
  FOR SELECT USING (true);

CREATE POLICY "snapshots_insert" ON public.experiment_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.thought_experiments
      WHERE id = experiment_id AND created_by = auth.uid()
    )
  );

-- Extensions: same pattern
CREATE POLICY "extensions_select" ON public.experiment_extensions
  FOR SELECT USING (true);

CREATE POLICY "extensions_insert" ON public.experiment_extensions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.thought_experiments
      WHERE id = parent_id AND created_by = auth.uid()
    )
  );

-- Reality snapshots: anyone can read, authenticated can create
CREATE POLICY "reality_select" ON public.reality_snapshots
  FOR SELECT USING (true);

CREATE POLICY "reality_insert" ON public.reality_snapshots
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Factor templates: all can read, only admins would modify (via service role)
CREATE POLICY "templates_select" ON public.co_factor_templates
  FOR SELECT USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.thought_experiments IS 'Innovation #1188: Contingency Operators - Non-destructive what-if scenario sandboxes';
COMMENT ON TABLE public.vector_change_effects IS 'Quantified divergence between sandbox projections and REALITY baseline';
COMMENT ON TABLE public.experiment_snapshots IS 'Iterative history of experiment state over time';
COMMENT ON TABLE public.experiment_extensions IS 'Secondary sandbox spawns when results exceed thresholds';
COMMENT ON TABLE public.reality_snapshots IS 'Optional baseline captures of platform state';
COMMENT ON TABLE public.co_factor_templates IS 'Predefined factor sets for common experiment types';

-- ============================================================================
-- ROLLBACK SCRIPT (Run this to fully revert)
-- ============================================================================
/*
-- ROLLBACK: Remove all Contingency Operators tables
DROP FUNCTION IF EXISTS public.create_experiment_snapshot(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_extension_spawn(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_experiment_net_score(uuid) CASCADE;
DROP TABLE IF EXISTS public.experiment_extensions CASCADE;
DROP TABLE IF EXISTS public.experiment_snapshots CASCADE;
DROP TABLE IF EXISTS public.vector_change_effects CASCADE;
DROP TABLE IF EXISTS public.reality_snapshots CASCADE;
DROP TABLE IF EXISTS public.co_factor_templates CASCADE;
DROP TABLE IF EXISTS public.thought_experiments CASCADE;
*/
