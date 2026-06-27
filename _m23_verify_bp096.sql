-- M23 post-apply verification
\echo '=== city_claims + deduct_marks check ==='
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('city_claims', 'csia_suggestions');

SELECT proname AS rpc_name
FROM pg_proc
WHERE proname = 'deduct_marks'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

SELECT indexname
FROM pg_indexes
WHERE tablename = 'city_claims';

\echo '=== M23 verify complete ==='
