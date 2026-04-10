-- K399: Canonical numbers sweep (B093 innovations through #2238)
-- Updates platform_canonical key-value pairs, inserts B093 innovations, sweeps letter templates
-- Schema verified against live DB: platform_canonical uses (key, value) pairs;
-- letter_dispatch_queue uses letter_body (not letter_content), recipient_name (not contact_name)

-- ═══════════════════════════════════════════════════════════════
-- Task 1: Update platform_canonical (key-value schema)
-- ═══════════════════════════════════════════════════════════════
UPDATE platform_canonical SET value = 2238 WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 2238 WHERE key = 'canonical_chain_end';
UPDATE platform_canonical SET value = 211  WHERE key = 'crown_jewel_count';
UPDATE platform_canonical SET value = 211  WHERE key = 'crown_jewels';
UPDATE platform_canonical SET value = 2393 WHERE key = 'patent_claims';
UPDATE platform_canonical SET value = 12   WHERE key = 'provisional_count';
UPDATE platform_canonical SET value = 39   WHERE key = 'paper_count';
UPDATE platform_canonical SET value = 39   WHERE key = 'academic_papers';

-- ═══════════════════════════════════════════════════════════════
-- Task 1B: Insert B093 innovations (#2225-#2238) — skip existing
-- ═══════════════════════════════════════════════════════════════
INSERT INTO innovation_log (innovation_number, title, description, is_crown_jewel, session_id)
SELECT * FROM (VALUES
  (2225, 'Hologram Character Refresh', 'Four-tier CRT shimmer system for character hologram overlays on the Living Board', false, 'B093'),
  (2226, 'YOU ARE HERE Welcome Beacon', 'Animated welcome beacon with radar pulse on Living Board entry', false, 'B093'),
  (2227, 'RADAR Ping System', 'Real-time activity radar showing live member actions across the Living Board map', true, 'B093'),
  (2228, 'Campaign Forge / The Living Board', 'Interactive campaign creation and management workspace overlaid on the game board', true, 'B093'),
  (2229, 'Wardrobe Department', 'Character customization and avatar wardrobe system for Living Board personas', false, 'B093'),
  (2230, 'DM Summoning Protocol', 'Direct message summoning system for recruiting collaborators to campaigns', true, 'B093'),
  (2231, 'Live Play Broadcasting', 'Real-time broadcast layer for ongoing campaign activity visible to spectators', false, 'B093'),
  (2232, 'Submissions Pedestal', 'Showcase platform for member-submitted content awaiting community review', true, 'B093'),
  (2233, 'The Rolodex — Tiered Reciprocal Promotion', 'Multi-tier promotional exchange system where promotion given equals promotion received', true, 'B093'),
  (2234, 'Affiliation Badge System', 'Visual badge system showing member affiliations across guilds and tribes', false, 'B093'),
  (2235, 'Pioneer Proposal Rewards', 'Reward mechanism for members who submit accepted pioneer proposals', true, 'B093'),
  (2236, 'Helm Card Dashboard', 'Unified personal dashboard consolidating all member metrics and status on a single card', true, 'B093'),
  (2237, 'Catapult Power', 'Amplification mechanic that launches member content to wider audience tiers', true, 'B093'),
  (2238, 'Mission Briefings', 'Structured task briefing system for campaign participants with objectives and rewards', true, 'B093')
) AS new_innovations(innovation_number, title, description, is_crown_jewel, session_id)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il
  WHERE il.innovation_number = new_innovations.innovation_number
);

-- ═══════════════════════════════════════════════════════════════
-- Task 2: Letter body number sweep — hardcoded → {{templateVar}}
-- Column: letter_body (not letter_content)
-- ═══════════════════════════════════════════════════════════════

-- Innovation counts (with commas)
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,238 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2,238 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,224 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2,224 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,222 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2,222 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,199 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2,199 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,161 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2,161 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,130 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2,130 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '1,662 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%1,662 innovations%';

-- Innovation counts (without commas)
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2238 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2238 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2224 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2224 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2222 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2222 innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2199 innovations', '{{innovationCount}} innovations') WHERE letter_body LIKE '%2199 innovations%';

-- "patentable innovations" variant (with commas)
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,238 patentable innovations', '{{innovationCount}} patentable innovations') WHERE letter_body LIKE '%2,238 patentable innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,224 patentable innovations', '{{innovationCount}} patentable innovations') WHERE letter_body LIKE '%2,224 patentable innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,222 patentable innovations', '{{innovationCount}} patentable innovations') WHERE letter_body LIKE '%2,222 patentable innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,199 patentable innovations', '{{innovationCount}} patentable innovations') WHERE letter_body LIKE '%2,199 patentable innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,161 patentable innovations', '{{innovationCount}} patentable innovations') WHERE letter_body LIKE '%2,161 patentable innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,130 patentable innovations', '{{innovationCount}} patentable innovations') WHERE letter_body LIKE '%2,130 patentable innovations%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '1,662 patentable innovations', '{{innovationCount}} patentable innovations') WHERE letter_body LIKE '%1,662 patentable innovations%';

-- Crown Jewel counts
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '211 Crown Jewels', '{{crownJewelCount}} Crown Jewels') WHERE letter_body LIKE '%211 Crown Jewels%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '207 Crown Jewels', '{{crownJewelCount}} Crown Jewels') WHERE letter_body LIKE '%207 Crown Jewels%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '202 Crown Jewels', '{{crownJewelCount}} Crown Jewels') WHERE letter_body LIKE '%202 Crown Jewels%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '164 Crown Jewels', '{{crownJewelCount}} Crown Jewels') WHERE letter_body LIKE '%164 Crown Jewels%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '123 Crown Jewels', '{{crownJewelCount}} Crown Jewels') WHERE letter_body LIKE '%123 Crown Jewels%';

-- Crown Jewel singular
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '211 Crown Jewel', '{{crownJewelCount}} Crown Jewel') WHERE letter_body LIKE '%211 Crown Jewel%' AND letter_body NOT LIKE '%{{crownJewelCount}} Crown Jewels%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '207 Crown Jewel', '{{crownJewelCount}} Crown Jewel') WHERE letter_body LIKE '%207 Crown Jewel%' AND letter_body NOT LIKE '%{{crownJewelCount}} Crown Jewels%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '202 Crown Jewel', '{{crownJewelCount}} Crown Jewel') WHERE letter_body LIKE '%202 Crown Jewel%' AND letter_body NOT LIKE '%{{crownJewelCount}} Crown Jewels%';

-- Provisional patent counts
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '12 provisional', '{{provisionalCount}} provisional') WHERE letter_body LIKE '%12 provisional%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '11 provisional', '{{provisionalCount}} provisional') WHERE letter_body LIKE '%11 provisional%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '10 provisional', '{{provisionalCount}} provisional') WHERE letter_body LIKE '%10 provisional%';

-- Formal claims / patent claims counts (with commas)
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,393 formal', '{{patentClaims}} formal') WHERE letter_body LIKE '%2,393 formal%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,199 formal', '{{patentClaims}} formal') WHERE letter_body LIKE '%2,199 formal%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,187 formal', '{{patentClaims}} formal') WHERE letter_body LIKE '%2,187 formal%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2,091 formal', '{{patentClaims}} formal') WHERE letter_body LIKE '%2,091 formal%';

-- Without commas
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2393 formal', '{{patentClaims}} formal') WHERE letter_body LIKE '%2393 formal%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '2199 formal', '{{patentClaims}} formal') WHERE letter_body LIKE '%2199 formal%';

-- Paper counts
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '39 papers', '{{paperCount}} papers') WHERE letter_body LIKE '%39 papers%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '39 academic', '{{paperCount}} academic') WHERE letter_body LIKE '%39 academic%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '38 papers', '{{paperCount}} papers') WHERE letter_body LIKE '%38 papers%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '38 academic', '{{paperCount}} academic') WHERE letter_body LIKE '%38 academic%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '34 papers', '{{paperCount}} papers') WHERE letter_body LIKE '%34 papers%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '34 academic', '{{paperCount}} academic') WHERE letter_body LIKE '%34 academic%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '30 papers', '{{paperCount}} papers') WHERE letter_body LIKE '%30 papers%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '30 academic', '{{paperCount}} academic') WHERE letter_body LIKE '%30 academic%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '25 papers', '{{paperCount}} papers') WHERE letter_body LIKE '%25 papers%';
UPDATE letter_dispatch_queue SET letter_body = REPLACE(letter_body, '25 academic', '{{paperCount}} academic') WHERE letter_body LIKE '%25 academic%';

-- ═══════════════════════════════════════════════════════════════
-- Task 3: Paper cross-references to Crown Letters
-- Column: recipient_name (not contact_name), letter_body (not letter_content)
-- ═══════════════════════════════════════════════════════════════
UPDATE letter_dispatch_queue
SET letter_body = letter_body || E'\n\nOur latest academic paper, "Interdependent Creation: Cooperative World-Building as Economic Architecture," cites your foundational work on platform cooperativism as one of the intellectual pillars of our cooperative model.'
WHERE recipient_name ILIKE '%scholz%'
  AND recipient_name NOT ILIKE '%olaf%'
  AND letter_body NOT LIKE '%Interdependent Creation%';
