-- Fix remaining search_path security warnings
ALTER FUNCTION public.generate_module_hash(text, text, integer, uuid) SET search_path = public;
ALTER FUNCTION public.calculate_eoi_conversion_ratios(integer, integer) SET search_path = public;
ALTER FUNCTION public.calculate_commitment_ratios(integer, integer) SET search_path = public;
