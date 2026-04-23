-- ============================================================================
-- Health Accords Consolidation
-- Founder decision: Health Accords is ONE initiative with sub-components
-- (MSA, Swoop, "combine knowledge of all people" eye mystery)
-- Remove duplicate lifeline-medications entry
-- ============================================================================

DELETE FROM public.launch_conditions WHERE initiative_slug = 'lifeline-medications';
