-- B035: Update canonical stats to 2,062 innovations / 27 production systems / 138 crown jewels
UPDATE platform_canonical SET value = 2062, updated_at = now() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 27, updated_at = now() WHERE key = 'production_systems';
UPDATE platform_canonical SET value = 138, updated_at = now() WHERE key = 'crown_jewels';
