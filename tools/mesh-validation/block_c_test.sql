-- Block C empirical test: verify cathedral.fates_log write via psql (bypasses RLS)
SELECT count(*) AS before_count FROM cathedral.fates_log;

INSERT INTO cathedral.fates_log (member_id, session_id, content_hash, themes, scores, dispatches, coverage_gaps)
VALUES (
  'bb6752ab-2cc5-489d-b04f-aed42d98ebda',
  'BP094-S9-BLOCK-C-TEST',
  'bp094s9blockc_empirical_test',
  '["block_c_test","service_key_fix","session_9"]'::jsonb,
  '{}'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb
)
RETURNING log_id;

SELECT count(*) AS after_count FROM cathedral.fates_log;
