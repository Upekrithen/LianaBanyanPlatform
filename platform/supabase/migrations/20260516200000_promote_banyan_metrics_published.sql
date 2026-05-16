-- Promote 6 banyan_metric_stats rows from draft → published
-- BP045 W1 NOVACULA — Founder direct ratified
-- Column: publication_status (not 'status'); identifier: metric_axis (not 'metric_key')
UPDATE public.banyan_metric_stats
  SET publication_status = 'published',
      computed_at        = NOW()
WHERE metric_axis IN ('speed', 'cost_reduction', 'accuracy', 'free_forever', 'immutable_backup', 'federation_sharing')
  AND publication_status = 'draft';
