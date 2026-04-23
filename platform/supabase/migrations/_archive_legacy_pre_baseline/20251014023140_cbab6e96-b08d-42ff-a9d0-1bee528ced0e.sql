-- Fix final search_path warnings for trigger functions
ALTER FUNCTION public.update_subdomain_timestamp() SET search_path = public;
ALTER FUNCTION public.update_test_flow_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.xmlescape(text) SET search_path = public;
