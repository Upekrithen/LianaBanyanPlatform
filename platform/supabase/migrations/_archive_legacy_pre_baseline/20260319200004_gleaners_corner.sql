-- ═══════════════════════════════════════════════════════════════════════════════
-- GLEANER'S CORNER — Revenue Split Distribution Tracking
-- Session 49 — March 19, 2026
-- ═══════════════════════════════════════════════════════════════════════════════

-- Fund summary (single row, updated by system)
CREATE TABLE IF NOT EXISTS gleaners_fund_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_collected numeric NOT NULL DEFAULT 0,
  total_distributed numeric NOT NULL DEFAULT 0,
  reserve_balance numeric NOT NULL DEFAULT 0,
  families_supported integer NOT NULL DEFAULT 0,
  meals_funded integer NOT NULL DEFAULT 0,
  medical_covered integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Distribution log
CREATE TABLE IF NOT EXISTS gleaners_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  recipient_count integer NOT NULL DEFAULT 1,
  total_marks numeric NOT NULL DEFAULT 0,
  category text NOT NULL CHECK (category IN ('food', 'medical', 'emergency')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE gleaners_fund_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE gleaners_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gleaners_fund_summary_read"
  ON gleaners_fund_summary FOR SELECT TO authenticated USING (true);
CREATE POLICY "gleaners_fund_summary_admin"
  ON gleaners_fund_summary FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "gleaners_distributions_read"
  ON gleaners_distributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "gleaners_distributions_admin"
  ON gleaners_distributions FOR ALL TO authenticated USING (public.is_admin());

-- Seed data
INSERT INTO gleaners_fund_summary (total_collected, total_distributed, reserve_balance, families_supported, meals_funded, medical_covered)
VALUES (4230, 3890, 340, 12, 340, 8);

INSERT INTO gleaners_distributions (date, recipient_count, total_marks, category, description) VALUES
  ('2026-03-15', 3, 450, 'food', 'Monthly grocery allocation — 3 households'),
  ('2026-03-12', 1, 280, 'medical', 'Dental appointment coverage'),
  ('2026-03-10', 2, 320, 'food', 'Weekly essentials — 2 families'),
  ('2026-03-08', 1, 175, 'emergency', 'Emergency utility assistance'),
  ('2026-03-05', 4, 520, 'food', 'Bi-weekly food allocation — 4 households'),
  ('2026-03-02', 1, 390, 'medical', 'Prescription coverage — chronic condition'),
  ('2026-02-28', 2, 410, 'food', 'Monthly grocery allocation — 2 households'),
  ('2026-02-25', 1, 150, 'emergency', 'Urgent transportation need'),
  ('2026-02-22', 3, 485, 'food', 'Weekly essentials — 3 families'),
  ('2026-02-18', 1, 710, 'medical', 'Specialist visit and follow-up care');
