-- =============================================================================
-- BOOTSTRAP FOUNDER AS ADMIN
-- Date: March 9, 2026
-- Purpose: Insert Founder accounts into user_roles as admin
-- Required for RLS policies to work (is_admin() checks this table)
-- Conditional: only inserts if the user exists in auth.users
-- =============================================================================

-- Founder account 1: upekrithen@gmail.com
INSERT INTO public.user_roles (user_id, role, notes)
SELECT '330eafae-4dfe-4e01-941f-47d7df55b7b5'::uuid, 'admin', 'Founder bootstrap — primary account'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = '330eafae-4dfe-4e01-941f-47d7df55b7b5')
ON CONFLICT (user_id, role) DO NOTHING;

-- Founder account 2: support@lianabanyan.com
INSERT INTO public.user_roles (user_id, role, notes)
SELECT '86380080-9d6e-41f3-b67f-27d39e6dc6f1'::uuid, 'admin', 'Founder bootstrap — platform support account'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = '86380080-9d6e-41f3-b67f-27d39e6dc6f1')
ON CONFLICT (user_id, role) DO NOTHING;

-- NOTE: If neither user exists yet, this migration succeeds silently.
-- Once the Founder signs up, run manually in Supabase SQL Editor:
--
--   INSERT INTO public.user_roles (user_id, role, notes)
--   SELECT id, 'admin', 'Founder bootstrap'
--   FROM auth.users
--   WHERE email IN ('upekrithen@gmail.com', 'support@lianabanyan.com')
--   ON CONFLICT (user_id, role) DO NOTHING;
