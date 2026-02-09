-- Fix search_path security warnings for existing functions
ALTER FUNCTION public.increment_credential_usage(uuid) SET search_path = public;
ALTER FUNCTION public.log_agent_action(text, text, uuid, jsonb, text, text) SET search_path = public;