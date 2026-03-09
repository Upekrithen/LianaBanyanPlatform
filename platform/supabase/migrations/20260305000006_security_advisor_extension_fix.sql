-- Fix for Supabase Security Advisor (Extension in Public)
-- This script moves the pg_net extension out of the public schema
-- into the extensions schema, which is the best practice for security.

-- First, ensure the extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move the pg_net extension
ALTER EXTENSION pg_net SET SCHEMA extensions;