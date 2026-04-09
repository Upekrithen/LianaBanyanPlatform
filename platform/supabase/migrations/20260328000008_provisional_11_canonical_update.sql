-- Provisional Patent Application #11 filed March 28, 2026
-- Updates canonical stats: 114 new innovations (#1980-#2093), 5 new Crown Jewels, ~570 new claims

UPDATE platform_canonical SET value = 2093 WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 151 WHERE key = 'crown_jewels';
UPDATE platform_canonical SET value = 11 WHERE key = 'patent_applications';
UPDATE platform_canonical SET value = 2081 WHERE key = 'patent_claims';
