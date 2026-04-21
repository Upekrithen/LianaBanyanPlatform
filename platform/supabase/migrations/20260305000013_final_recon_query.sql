-- Final Recon Query for Supabase Security Advisor
-- This will show us exactly what the linter is seeing right now.

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
