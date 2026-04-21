-- K421 Task 4: Bump canonical count 2265 → 2267
-- Added: #2263 (Triple-Redundant Verification), #2266 (Opt-In Member Documentation),
--        #2267 (Member-Generated Guide Corpus)
-- Also bump crown_jewels count: +3 new CJs (#2263, #2266, #2267) → 222+3 = 225

UPDATE public.platform_canonical
SET value = 2267, last_updated_by = 'K421', updated_at = now()
WHERE key = 'innovation_count' AND value < 2267;

UPDATE public.platform_canonical
SET value = 2267, last_updated_by = 'K421', updated_at = now()
WHERE key = 'canonical_chain_end' AND value < 2267;

UPDATE public.platform_canonical
SET value = 225, last_updated_by = 'K421', updated_at = now()
WHERE key = 'crown_jewel_count' AND value < 225;

UPDATE public.platform_canonical
SET value = 225, last_updated_by = 'K421', updated_at = now()
WHERE key = 'crown_jewels' AND value < 225;
