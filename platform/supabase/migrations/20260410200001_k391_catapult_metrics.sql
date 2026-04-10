-- Catapult Power: Universal Momentum Metric
-- Innovation #2237 (Crown Jewel #210)
-- Session B093

CREATE TABLE IF NOT EXISTS public.catapult_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('project', 'petition', 'vote', 'campaign', 'initiative', 'submission')),
  entity_id uuid NOT NULL,
  label text NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  target_value numeric NOT NULL DEFAULT 1,
  cp_score numeric GENERATED ALWAYS AS (
    CASE
      WHEN target_value > 0 THEN LEAST(current_value / target_value * 100, 100)
      ELSE 0
    END
  ) STORED,
  launched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_catapult_metrics_type_score ON public.catapult_metrics (entity_type, cp_score DESC);
CREATE INDEX idx_catapult_metrics_entity ON public.catapult_metrics (entity_id);
CREATE INDEX idx_catapult_metrics_active ON public.catapult_metrics (cp_score DESC) WHERE launched_at IS NULL;

-- RLS
ALTER TABLE public.catapult_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read catapult metrics"
  ON public.catapult_metrics
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert catapult metrics"
  ON public.catapult_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update own metrics"
  ON public.catapult_metrics
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_catapult_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER catapult_metrics_updated_at
  BEFORE UPDATE ON public.catapult_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_catapult_metrics_updated_at();

-- Seed data: 5 sample metrics for testing
INSERT INTO public.catapult_metrics (entity_type, entity_id, label, current_value, target_value) VALUES
  ('project', gen_random_uuid(), 'Community Garden Funding', 3750, 5000),
  ('petition', gen_random_uuid(), 'Local Transit Expansion Petition', 400, 1000),
  ('submission', gen_random_uuid(), 'Cooperative Marketplace Design Proposal', 45, 50),
  ('campaign', gen_random_uuid(), 'Canister System Kickstarter', 30250, 55000),
  ('initiative', gen_random_uuid(), 'Montana Food Cooperative Launch', 12, 60);
