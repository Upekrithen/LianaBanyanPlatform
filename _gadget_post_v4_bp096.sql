-- §14 POST-APPLY GADGET — M22-EXTENDED v4 csia_suggestions
\echo '=== §14 POST-APPLY GADGET: csia_suggestions ==='

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'csia_suggestions';

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'csia_suggestions'
ORDER BY ordinal_position;

SELECT indexname
FROM pg_indexes
WHERE tablename = 'csia_suggestions'
ORDER BY indexname;

SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'csia_suggestions'
ORDER BY policyname;

SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'csia_suggestions';

\echo '=== v4 gadget complete ==='
