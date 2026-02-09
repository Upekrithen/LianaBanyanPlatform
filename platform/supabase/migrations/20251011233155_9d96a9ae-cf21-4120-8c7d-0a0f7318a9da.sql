-- Create helper function to increment credential usage
CREATE OR REPLACE FUNCTION public.increment_credential_usage(credential_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.xml_access_credentials
  SET 
    usage_count = usage_count + 1,
    last_used_at = now()
  WHERE id = credential_id;
END;
$$;