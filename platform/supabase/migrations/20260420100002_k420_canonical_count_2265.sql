-- K420: Canon Reconciliation — innovation_count 2263 → 2265
-- Per MEMORY.md, CANONICAL_LAWS §IX, and B109 directive
-- Innovations #2263 (Triple-Redundant Verification), #2264, #2265 assigned post-K413

UPDATE public.platform_canonical
SET value = 2265, last_updated_by = 'K420', updated_at = now()
WHERE key = 'innovation_count' AND value < 2265;

UPDATE public.platform_canonical
SET value = 2265, last_updated_by = 'K420', updated_at = now()
WHERE key = 'canonical_chain_end' AND value < 2265;
