-- K242: Beacon Wallet view for reading beacons

CREATE OR REPLACE VIEW public.beacon_wallet AS
SELECT
  COALESCE(b.member_id, b.user_id) AS member_id,
  b.user_id,
  b.id AS beacon_id,
  b.reading_paper_key,
  b.reading_ref_code,
  b.reading_position,
  b.reading_depth,
  b.reading_completed_at,
  b.created_at AS started_at,
  b.updated_at AS last_read_at,
  rp.percent_complete,
  rp.coverage_minutes_earned AS coverage_minutes,
  rp.golden_keys_found AS golden_keys
FROM public.beacons b
LEFT JOIN public.reading_progress rp
  ON rp.member_id = COALESCE(b.member_id, b.user_id)
  AND rp.content_id = b.reading_paper_key
WHERE b.orange_subtype = 'reading'
ORDER BY b.updated_at DESC;
