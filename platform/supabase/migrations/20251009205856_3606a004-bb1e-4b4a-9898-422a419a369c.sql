-- Fix the xmlescape function to have proper search_path
CREATE OR REPLACE FUNCTION public.xmlescape(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT replace(replace(replace(replace(replace(input, '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&apos;');
$$;
