-- B075 Canonical Stats Sync — April 4, 2026
-- Run via: npx supabase db query --linked -f scripts/b075_canonical_stats_sync.sql

-- Innovation count
INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('innovation_count', '2148', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '2148', updated_at = NOW();

-- Crown Jewel count
INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('crown_jewel_count', '182', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '182', updated_at = NOW();

-- Patent provisional count (Prov 12 filing today)
INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('provisional_count', '12', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '12', updated_at = NOW();

-- BST episode count
INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('bst_episode_count', '488', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '488', updated_at = NOW();

-- Spoonfuls count
INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('spoonfuls_count', '599', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '599', updated_at = NOW();

-- Pudding count
INSERT INTO platform_canonical (key, value, updated_at)
VALUES ('pudding_count', '112', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '112', updated_at = NOW();

-- Total distributable episodes
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('total_distributable_episodes', '979', 'Total BST + Spoonfuls episodes staged', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '979', updated_at = NOW();

-- Days of hourly content
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('days_hourly_content', '20.3', 'Days of continuous hourly BST posting', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '20.3', updated_at = NOW();

-- Compiled documents count
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('compiled_documents_count', '38', 'Documents compiled in compilation pipeline', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '38', updated_at = NOW();

-- BST chapter count
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('bst_chapter_count', '10', 'BST chapters produced', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '10', updated_at = NOW();

-- Paper count
INSERT INTO platform_canonical (key, value, description, updated_at)
VALUES ('paper_count', '34', 'Academic papers written', NOW())
ON CONFLICT (key) DO UPDATE
SET value = '34', updated_at = NOW();
