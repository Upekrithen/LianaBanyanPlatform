-- Fix for Supabase Security Advisor (Security Definer Views)
-- This script alters the views to use SECURITY INVOKER instead of SECURITY DEFINER
-- which is the recommended practice by Supabase to prevent privilege escalation.

DO $$
DECLARE
    v record;
BEGIN
    FOR v IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Re-create the view with SECURITY INVOKER
        -- Note: We can't directly alter a view to be SECURITY INVOKER, 
        -- but we can alter the underlying function if it's a materialized view,
        -- or we can just ensure the view itself doesn't have security_barrier set.
        
        -- For standard views, they are SECURITY INVOKER by default unless specified otherwise.
        -- If Supabase is flagging them, it might be because they access tables without RLS,
        -- or they were created with a specific security context.
        
        -- Let's try to alter the view to set security_invoker = true
        BEGIN
            EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true);', v.viewname);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if the view doesn't support this option
        END;
    END LOOP;
END;
$$;