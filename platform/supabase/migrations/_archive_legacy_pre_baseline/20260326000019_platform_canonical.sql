-- Platform Canonical Stats Table
-- Single source of truth for all canonical numbers across the platform.
-- The useCanonicalStats hook reads from this table at runtime.

CREATE TABLE IF NOT EXISTS platform_canonical (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_canonical ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read canonical stats"
  ON platform_canonical FOR SELECT
  USING (true);

CREATE POLICY "Only service role can update canonical stats"
  ON platform_canonical FOR ALL
  USING (auth.role() = 'service_role');

INSERT INTO platform_canonical (key, value) VALUES
  ('innovation_count', 2007),
  ('crown_jewels', 127),
  ('patent_applications', 10),
  ('patent_claims', 1511),
  ('domains', 14),
  ('initiatives', 16),
  ('membership_cost', 5),
  ('creator_keeps_pct', 83.3),
  ('platform_margin_pct', 20),
  ('spec_expanded', 653),
  ('portfolio_value_low', 630000),
  ('portfolio_value_high', 116000000),
  ('personal_investment', 525000),
  ('investment_years', 9),
  ('production_systems', 23)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
