-- B054 Stats Update — April 1, 2026
-- Run via: npx supabase db query --linked -f scripts/b054_stats_update.sql

UPDATE platform_canonical SET value = '2128', updated_at = now() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = '167', updated_at = now() WHERE key = 'crown_jewels';
UPDATE platform_canonical SET value = '2097', updated_at = now() WHERE key = 'patent_claims';
UPDATE platform_canonical SET value = '35', updated_at = now() WHERE key = 'production_systems';
UPDATE platform_canonical SET value = '26', updated_at = now() WHERE key = 'pudding_articles';
UPDATE platform_canonical SET value = '54', updated_at = now() WHERE key = 'bishop_sessions';
UPDATE platform_canonical SET value = '204', updated_at = now() WHERE key = 'knight_sessions';
UPDATE platform_canonical SET value = '11', updated_at = now() WHERE key = 'dirty_dozen_green';
UPDATE platform_canonical SET value = '30', updated_at = now() WHERE key = 'academic_papers';
UPDATE platform_canonical SET value = '2128', updated_at = now() WHERE key = 'canonical_chain_end';
UPDATE platform_canonical SET value = '54', updated_at = now() WHERE key = 'last_reconciliation_session';
