-- =============================================================================
-- PATENT BAG FILING PLAN — Bags set to file
-- Date: March 13, 2026
-- Purpose: Track which patent bags are "set to file" (unfiled, ready for next run)
-- Used by: Innovation threshing / filing workflow; admin or "next to file" UI
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.patent_bag_filing_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id text NOT NULL UNIQUE,
  display_name text NOT NULL,
  filing_status text NOT NULL DEFAULT 'set_to_file'
    CHECK (filing_status IN ('set_to_file', 'filed', 'draft', 'on_hold')),
  claim_count_estimate integer,
  uspto_application_number text,
  filed_at timestamptz,
  notes text,
  consolidated_into text REFERENCES public.patent_bag_filing_plan(bag_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.patent_bag_filing_plan IS 'Patent bags and their filing status. set_to_file = ready for next USPTO filing run. Over 31 bags from innovation_log + audits.';
COMMENT ON COLUMN public.patent_bag_filing_plan.consolidated_into IS 'If set, file this bag as part of the canonical bag_id; do not file as separate application. See BISHOP_DROPZONE/PATENT_BAG_CANONICAL_MAPPING.md.';

-- Seed: ALL patent bags (31+). Bag 1–4 = filed (6 applications); rest = set_to_file unless noted.
-- consolidated_into = file as part of that bag (no separate application). See PATENT_BAG_CANONICAL_MAPPING.md.
INSERT INTO public.patent_bag_filing_plan (bag_id, display_name, filing_status, claim_count_estimate, notes, consolidated_into)
VALUES
  ('Bag 1', 'Core Platform Architecture', 'filed', 123, '63/925,672', NULL),
  ('Bag 2', 'Physical Medallion', 'filed', NULL, 'In 63/925,672 or 63/927,674', NULL),
  ('Bag 3', 'Community Engagement', 'filed', 72, '63/927,674', NULL),
  ('Bag 4', 'Competitor Welcome', 'filed', NULL, 'Filed', NULL),
  ('Bag 5', 'Hydraulic / Hexel mechanical', 'set_to_file', 56, 'Draft in 03_PATENT_BAGS', NULL),
  ('Bag 6', 'Diceless Combat, Tereno', 'set_to_file', 56, 'Draft in 03_PATENT_BAGS', NULL),
  ('Bag 7', 'Defense Klaus, Rally', 'set_to_file', 56, 'Draft in 03_PATENT_BAGS', NULL),
  ('Bag 8', 'LMD, JukeBox, VSL', 'set_to_file', 56, 'Draft in 03_PATENT_BAGS', NULL),
  ('Bag 9', 'Bread, Shopping, MSA', 'set_to_file', 56, 'Draft in 03_PATENT_BAGS', NULL),
  ('Bag 10', 'Ghost World, Treasure Map', 'set_to_file', 56, 'Draft in 03_PATENT_BAGS', NULL),
  ('Bag 14', 'Master provisional 14', 'set_to_file', NULL, 'BAGS 14-16 MASTER', NULL),
  ('Bag 15', 'Master provisional 15', 'set_to_file', NULL, 'BAGS 14-16 MASTER', NULL),
  ('Bag 16', 'Master provisional 16', 'set_to_file', NULL, 'BAGS 14-16 MASTER', NULL),
  ('Bag 18', 'Draft Night System', 'set_to_file', NULL, 'Innovations #942-#949', NULL),
  ('Bag 19', 'AI Context Management', 'set_to_file', NULL, 'Innovations #929-#941', NULL),
  ('Bag 20', 'Privacy & Sponsorship', 'set_to_file', NULL, 'Innovations #950-#1019', NULL),
  ('Bag 21', 'Community / platform', 'set_to_file', NULL, 'From audit JSON', NULL),
  ('Bag 22', 'Community Engagement', 'set_to_file', NULL, 'Innovations #1088-#1109', NULL),
  ('Bag 27', 'Economics / MARKS', 'set_to_file', NULL, 'Innovations #1111, #1113', NULL),
  ('Bag 28', 'Community / onboarding', 'set_to_file', NULL, 'Innovations #1112, #1114-#1117', NULL),
  ('Batch 1', 'Engagement Systems', 'set_to_file', NULL, '#151-#158', NULL),
  ('Batch 2', 'Infrastructure Systems', 'set_to_file', NULL, '#159-#162', NULL),
  ('Batch 3', 'Economic & Architectural', 'set_to_file', NULL, '#163-#168', NULL),
  ('Batch 4', 'Viral Marketing', 'set_to_file', NULL, '#169-#173', NULL),
  ('Batch 5', 'Game & Metaverse', 'set_to_file', NULL, '#174-#176', NULL),
  ('Batch 6', 'Initiative Systems', 'set_to_file', NULL, '#177-#179', NULL),
  ('Batch 7', 'Platform Infrastructure', 'set_to_file', NULL, '#180-#184', NULL),
  ('Batch 9', 'AI / attribution', 'set_to_file', NULL, 'From registry', NULL),
  ('Batch 11', 'Jan 24 batch 11', 'set_to_file', NULL, '#1210-#1213', NULL),
  ('Batch 12', 'Jan 24 batch 12', 'set_to_file', NULL, '#1214-#1216', NULL),
  ('Batch 13', 'Jan 24 batch 13', 'set_to_file', NULL, '#1217', NULL),
  ('Jan 24 Filing', 'Jan 24 comprehensive', 'set_to_file', NULL, 'Innovations in Jan 24 filing', NULL),
  ('Shadow Marks', 'Recipe bounties / reputation', 'set_to_file', NULL, '#1218-#1227', NULL),
  ('LMB', 'Let''s Make Bread', 'set_to_file', NULL, 'Initiative bag; file with Bag 9', 'Bag 9'),
  ('Harper', 'Harper Guild', 'set_to_file', NULL, 'Initiative bag', NULL),
  ('JukeBox', 'JukeBox initiative', 'set_to_file', NULL, 'Initiative bag; file with Bag 8', 'Bag 8'),
  ('Didasko', 'Didasko (Academic)', 'set_to_file', NULL, 'Initiative bag', NULL),
  ('International', 'International', 'set_to_file', NULL, 'Initiative bag', NULL),
  ('Brass Tacks', 'Brass Tacks', 'set_to_file', NULL, 'Initiative bag', NULL),
  ('HexIsle', 'HexIsle / mechanical', 'set_to_file', NULL, 'Initiative bag; file with Bag 5', 'Bag 5'),
  ('Tereno', 'Tereno platform', 'set_to_file', NULL, 'Initiative bag; file with Bag 6', 'Bag 6'),
  ('Platform', 'Platform governance / policy', 'set_to_file', NULL, 'Innovations #901+#', NULL),
  ('Session 7C', 'Session 7C extractions', 'set_to_file', NULL, '#1511-#1515', NULL),
  ('Reserved', 'Pre-Bag 19 placeholder', 'draft', NULL, 'Placeholder', NULL),
  ('TBD', 'Unassigned / to be assigned', 'draft', NULL, 'Innovations not yet bagged', NULL)
ON CONFLICT (bag_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  filing_status = EXCLUDED.filing_status,
  claim_count_estimate = COALESCE(EXCLUDED.claim_count_estimate, patent_bag_filing_plan.claim_count_estimate),
  notes = EXCLUDED.notes,
  consolidated_into = EXCLUDED.consolidated_into,
  updated_at = now();

-- RLS: allow read for authenticated; restrict write to service role / admin
ALTER TABLE public.patent_bag_filing_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patent_bag_filing_plan_public_read"
  ON public.patent_bag_filing_plan FOR SELECT
  USING (true);

-- Writes: admin only (or run via service_role in migrations)
CREATE POLICY "patent_bag_filing_plan_all_service_role"
  ON public.patent_bag_filing_plan FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
