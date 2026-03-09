-- Fix for Supabase Security Advisor (Extension in Public)
-- Since pg_net does not support SET SCHEMA directly, we must drop it and recreate it in the extensions schema.

-- First, ensure the extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Drop the extension from public
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Recreate it in the extensions schema
CREATE EXTENSION pg_net SCHEMA extensions;