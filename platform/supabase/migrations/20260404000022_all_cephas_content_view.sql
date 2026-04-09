-- K275/B075: Unified Cephas content feed for All the Pudding TV Guide.
CREATE OR REPLACE VIEW public.all_cephas_content AS
SELECT
  'pudding'::text AS content_type,
  p.id::text AS content_id,
  p.title,
  LEFT(COALESCE(p.pudding_text, p.not_pudding_summary, ''), 150) AS excerpt,
  p.primary_spice::text AS primary_spice,
  ARRAY(SELECT unnest(COALESCE(p.secondary_spices, '{}'::text[]))::text) AS secondary_spices,
  p.created_at AS publish_date,
  GREATEST(1, CEIL(GREATEST(1, array_length(regexp_split_to_array(COALESCE(p.pudding_text, ''), E'\\s+'), 1)) / 200.0)::int) AS estimated_reading_minutes,
  COALESCE(p.pepper_rating_avg, 0)::numeric AS pepper_rating_avg,
  COALESCE(p.view_count, 0)::int AS view_count,
  p.source_paper,
  p.pudding_text
FROM public.cephas_puddings p
WHERE p.status IN ('draft', 'published')

UNION ALL

SELECT
  CASE
    WHEN e.channel = 'bst' THEN 'bst_episode'
    WHEN e.channel = 'spoonfuls' THEN 'spoonful'
    WHEN e.channel = 'skipping_stones' THEN 'skipping_stone'
    ELSE 'bst_episode'
  END AS content_type,
  e.id::text AS content_id,
  CASE
    WHEN e.channel = 'bst' THEN 'BST Episode'
    WHEN e.channel = 'spoonfuls' THEN 'Spoonful'
    WHEN e.channel = 'skipping_stones' THEN 'Skipping Stone'
    ELSE 'Episode'
  END AS title,
  LEFT(e.content, 150) AS excerpt,
  e.primary_spice::text AS primary_spice,
  ARRAY(SELECT unnest(COALESCE(e.secondary_spices, '{}'::public.spice_type[]))::text) AS secondary_spices,
  COALESCE(e.scheduled_for, e.created_at) AS publish_date,
  GREATEST(1, CEIL(GREATEST(1, array_length(regexp_split_to_array(COALESCE(e.content, ''), E'\\s+'), 1)) / 200.0)::int) AS estimated_reading_minutes,
  0::numeric AS pepper_rating_avg,
  0::int AS view_count,
  NULL::text AS source_paper,
  e.content AS pudding_text
FROM public.crewman_episodes e
WHERE e.channel IN ('bst', 'spoonfuls', 'skipping_stones')

UNION ALL

SELECT
  'news_slot'::text AS content_type,
  n.id::text AS content_id,
  'News Slot'::text AS title,
  LEFT(n.content, 150) AS excerpt,
  NULL::text AS primary_spice,
  '{}'::text[] AS secondary_spices,
  COALESCE((n.scheduled_date::text || ' ' || n.slot_time::text)::timestamptz, n.created_at) AS publish_date,
  2::int AS estimated_reading_minutes,
  0::numeric AS pepper_rating_avg,
  0::int AS view_count,
  NULL::text AS source_paper,
  n.content AS pudding_text
FROM public.distribution_news_slots n
WHERE n.status IN ('scheduled', 'dispatched');
