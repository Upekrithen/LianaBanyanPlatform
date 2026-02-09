-- Fix security warning: Make function search path immutable
-- Update the auto_initialize_lockbox function with immutable search_path

DROP FUNCTION IF EXISTS public.auto_initialize_lockbox() CASCADE;

CREATE OR REPLACE FUNCTION public.auto_initialize_lockbox()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM public.initialize_project_lockbox(NEW.id);
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER auto_create_lockbox_on_project
AFTER INSERT ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.auto_initialize_lockbox();