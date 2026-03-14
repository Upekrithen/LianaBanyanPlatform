-- =============================================================================
-- USPTO FILED APPLICATIONS + INNOVATION RANGES (single source of truth)
-- Date: March 13, 2026
-- Purpose: Store which innovation numbers are in which filed application.
--          Correct filed = 1,193 innovations (not 1,336; 1,336 = claim count).
--          Unfiled = 401 innovations. See CONTEXT_MANAGEMENT/MASTER_PATENT_FILING_MANIFEST.md
-- =============================================================================

-- Table: applications we have USPTO receipts for
CREATE TABLE IF NOT EXISTS public.uspto_filed_application (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text NOT NULL UNIQUE,
  filed_at date NOT NULL,
  docket text,
  title text,
  claim_count integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.uspto_filed_application IS 'USPTO provisional applications we have receipts for. Innovation coverage in uspto_filed_innovation_range.';

-- Table: which innovation number ranges are in each application
CREATE TABLE IF NOT EXISTS public.uspto_filed_innovation_range (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.uspto_filed_application(id) ON DELETE CASCADE,
  start_innovation integer NOT NULL,
  end_innovation integer NOT NULL,
  CHECK (start_innovation <= end_innovation),
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.uspto_filed_innovation_range IS 'Innovation number ranges covered by each uspto_filed_application. Union of all ranges = filed set.';

-- Seed the 6 applications (from receipts + Feb 24 spec)
INSERT INTO public.uspto_filed_application (application_number, filed_at, docket, title, claim_count, notes)
VALUES
  ('63/925,672', '2025-11-26', NULL, 'Cooperative Commerce Platform with Distributed Economic Architecture', 123, 'Prov 1'),
  ('63/927,674', '2025-11-30', 'LB-PROV-002', 'Physical Medallion, Community Engagement', 72, 'Bag 2+3'),
  ('63/938,216', '2025-12-10', 'LB-PROV-005', 'Hydraulic / game system (Behemoth)', 397, 'Behemoth'),
  ('63/967,200', '2026-01-23', NULL, 'Provisional 2', 292, '#54-#120'),
  ('63/969,601', '2026-01-28', 'LB-PROV-006', 'Non-Speculative Platform Economics...', 44, 'Prov 3'),
  ('63/989,913', '2026-02-24', 'LB-PROV-007', 'Cooperative Platform Systems... (191 pg)', 408, 'LEVIATHAN+27-31 + Include bags 5-10,14-16,21-26')
ON CONFLICT (application_number) DO NOTHING;

-- Ranges per application (from MASTER_PATENT_FILING_MANIFEST)
-- Prov 1: #1-#53
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 1, 53 FROM public.uspto_filed_application WHERE application_number = '63/925,672';

-- Prov 2 (63/967,200): #54-#120
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 54, 120 FROM public.uspto_filed_application WHERE application_number = '63/967,200';

-- Prov 3 (63/969,601): #121-#210
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 121, 210 FROM public.uspto_filed_application WHERE application_number = '63/969,601';

-- Behemoth (63/938,216): #211-#956
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 211, 956 FROM public.uspto_filed_application WHERE application_number = '63/938,216';

-- 63/927,674: Bag 2+3 #38-#53 (overlap with Prov 1 for #38-#53)
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 38, 53 FROM public.uspto_filed_application WHERE application_number = '63/927,674';

-- Feb 24 (63/989,913): #956-#1000, #1050-#1140, #1228-#1329
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 956, 1000 FROM public.uspto_filed_application WHERE application_number = '63/989,913';
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 1050, 1140 FROM public.uspto_filed_application WHERE application_number = '63/989,913';
INSERT INTO public.uspto_filed_innovation_range (application_id, start_innovation, end_innovation)
SELECT id, 1228, 1329 FROM public.uspto_filed_application WHERE application_number = '63/989,913';

-- =============================================================================
-- Set innovation_log.status from document-based ranges (1193 filed, 401 unfiled)
-- Replaces the earlier 1-1336 / 1337-1594 assumption (1336 was claim count, not innovations).
-- =============================================================================

-- Filed: in any of the ranges (#1-#1000, #1050-#1140, #1228-#1329)
UPDATE public.innovation_log
SET status = 'filed'
WHERE (innovation_number BETWEEN 1 AND 1000)
   OR (innovation_number BETWEEN 1050 AND 1140)
   OR (innovation_number BETWEEN 1228 AND 1329);

-- Unfiled (Single Provisional): #1001-#1049, #1141-#1227, #1330-#1594
UPDATE public.innovation_log
SET status = 'pending',
    patent_bag = 'Single Provisional'
WHERE (innovation_number BETWEEN 1001 AND 1049)
   OR (innovation_number BETWEEN 1141 AND 1227)
   OR (innovation_number BETWEEN 1330 AND 1594);

COMMENT ON TABLE public.innovation_log IS 'Innovation registry. 1,594 total. Filed = 1,193 (#1-#1000, #1050-#1140, #1228-#1329) in 6 provisionals. Unfiled = 401 for Single Provisional. See uspto_filed_application + uspto_filed_innovation_range and CONTEXT_MANAGEMENT/MASTER_PATENT_FILING_MANIFEST.md.';
