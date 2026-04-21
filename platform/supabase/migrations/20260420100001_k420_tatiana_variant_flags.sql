-- K420: Tatiana Schlossberg letter variant classification per Founder ratification B109
-- "Direct" variants (New Yorker response) = context_only, NOT for dispatch
-- "In Honor Of" variant (memorial framing) = approved send version, Wave 2

-- 1. Archive the direct variant in helm_content_queue
UPDATE helm_content_queue
SET status = 'archived',
    founder_reviewed = true,
    founder_notes = 'B109 directive: Direct (New Yorker response) variant is Cephas context only, NOT for dispatch. The "In Honor Of" memorial variant is the approved send version.',
    tags = array_append(COALESCE(tags, '{}'), 'do_not_dispatch'),
    updated_at = now()
WHERE slug = 'academic-tatiana-schlossberg';

-- 2. Insert "In Honor Of" tribute variant for Wave 2 dispatch
INSERT INTO helm_content_queue (
  slug, title, content_type, source_file_path, destination,
  recipient_name, status, founder_reviewed, founder_notes,
  wave, priority, tags
) VALUES (
  'tribute-tatiana-schlossberg-in-honor-of',
  'In Honor of Tatiana Schlossberg — The Health Accords',
  'tribute_letter',
  'Cephas/cephas-hugo/content/tributes/tatiana-schlossberg-health-accords-tribute.md',
  'review',
  'Tatiana Schlossberg (memorial)',
  'draft',
  true,
  'B109 directive: "In Honor Of" memorial variant is the Founder-ratified send version. Wave 2 dispatch. Do NOT send in K420 session.',
  2,
  2,
  ARRAY['tribute', 'tatiana-schlossberg', 'health-accords', 'wave-2', 'send_ready']
) ON CONFLICT (slug) DO UPDATE SET
  founder_notes = EXCLUDED.founder_notes,
  tags = EXCLUDED.tags,
  wave = EXCLUDED.wave,
  updated_at = now();
