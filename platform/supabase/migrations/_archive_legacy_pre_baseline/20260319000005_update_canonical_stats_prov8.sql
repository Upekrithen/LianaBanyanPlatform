-- Update platform_canonical stats after 8th provisional filing (64/009,803)
-- Filed March 18, 2026 — 89 innovations (#1663-#1751), 65 claims
-- Cumulative: 1,751 innovations, 1,401 claims, 8 provisional applications

UPDATE public.platform_canonical SET value = 1751 WHERE key = 'innovation_count';
UPDATE public.platform_canonical SET value = 1401 WHERE key = 'patent_claims';
UPDATE public.platform_canonical SET value = 8 WHERE key = 'patent_applications';

-- If rows don't exist yet, insert them
INSERT INTO public.platform_canonical (key, value)
VALUES
  ('innovation_count', 1751),
  ('patent_claims', 1401),
  ('patent_applications', 8)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
