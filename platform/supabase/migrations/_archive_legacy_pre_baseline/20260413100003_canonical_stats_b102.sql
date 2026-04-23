-- ═══════════════════════════════════════════════════════════════
-- K420 Task 4: Canonical Stats Reconciliation — B102
-- Brings platform_canonical in sync with canonical_values.yaml
-- TouchStone: B096-canonical-stats-update
-- ═══════════════════════════════════════════════════════════════

-- innovation_count: 2262 → 2263
UPDATE public.platform_canonical
SET value = 2263, last_updated_by = 'K420', updated_at = now()
WHERE key = 'innovation_count' AND value < 2263;

-- canonical_chain_end: 2262 → 2263
UPDATE public.platform_canonical
SET value = 2263, last_updated_by = 'K420', updated_at = now()
WHERE key = 'canonical_chain_end' AND value < 2263;

-- crown_jewels: 221 → 222
UPDATE public.platform_canonical
SET value = 222, last_updated_by = 'K420', updated_at = now()
WHERE key = 'crown_jewels' AND value < 222;

-- crown_jewel_count: 221 → 222
UPDATE public.platform_canonical
SET value = 222, last_updated_by = 'K420', updated_at = now()
WHERE key = 'crown_jewel_count' AND value < 222;

-- production_systems: 35 → 36
UPDATE public.platform_canonical
SET value = 36, last_updated_by = 'K420', updated_at = now()
WHERE key = 'production_systems' AND value < 36;

-- paper_count: 39 → 41
UPDATE public.platform_canonical
SET value = 41, last_updated_by = 'K420', updated_at = now()
WHERE key = 'paper_count' AND value < 41;

-- academic_papers: 39 → 41
UPDATE public.platform_canonical
SET value = 41, last_updated_by = 'K420', updated_at = now()
WHERE key = 'academic_papers' AND value < 41;

-- pudding_articles: 187 → 189
UPDATE public.platform_canonical
SET value = 189, last_updated_by = 'K420', updated_at = now()
WHERE key = 'pudding_articles' AND value < 189;

-- patent_claims: 2405 → 2412
UPDATE public.platform_canonical
SET value = 2412, description = 'Total formal claims across 13 provisionals', last_updated_by = 'K420', updated_at = now()
WHERE key = 'patent_claims' AND value < 2412;

-- spoonfuls_count: 599 → 706
UPDATE public.platform_canonical
SET value = 706, last_updated_by = 'K420', updated_at = now()
WHERE key = 'spoonfuls_count' AND value < 706;

-- bst_episode_count: 488 → 584
UPDATE public.platform_canonical
SET value = 584, last_updated_by = 'K420', updated_at = now()
WHERE key = 'bst_episode_count' AND value < 584;

-- glass_door_letters: INSERT if not exists, otherwise update
INSERT INTO public.platform_canonical (key, value, description, last_updated_by, updated_at)
VALUES ('glass_door_letters', 95, 'Crown/outreach letters in dispatch queue', 'K420', now())
ON CONFLICT (key) DO UPDATE SET
  value = 95,
  last_updated_by = 'K420',
  updated_at = now()
WHERE platform_canonical.value < 95;

-- bishop_sessions: update to B102
UPDATE public.platform_canonical
SET value = 102, last_updated_by = 'K420', updated_at = now()
WHERE key = 'bishop_sessions' AND value < 102;

-- last_reconciliation_session: update to B102
UPDATE public.platform_canonical
SET value = 102, description = 'Bishop session that performed last reconciliation (B102)', last_updated_by = 'K420', updated_at = now()
WHERE key = 'last_reconciliation_session';
