-- K162: Canonical Reconciliation (Bishop B044)
-- Adds canonical chain numbering to innovation_log, inserts B043 innovations,
-- backfills canonical→prov11 mapping, updates stats.
--
-- NOTE: platform_canonical is a key-value stats store (key TEXT, value NUMERIC).
-- innovation_log stores individual innovations (innovation_number = Prov 11 filing #).
-- This migration adds canonical_number as the Bishop-assigned chain number.

-- ─── 1. Add canonical_number column to innovation_log ───────────────────────
ALTER TABLE innovation_log ADD COLUMN IF NOT EXISTS canonical_number INTEGER;
CREATE INDEX IF NOT EXISTS idx_innovation_log_canonical ON innovation_log(canonical_number);

-- ─── 2. Insert B043 K153-K159 innovations (canonical #2022-#2039) ───────────
-- These have Prov 11 claim numbers beyond 2093 (assigned in B043, not yet filed)

INSERT INTO innovation_log (innovation_number, title, description, category, status, session_tag, canonical_number)
SELECT v.prov11, v.title, v.description, v.category, 'deployed', v.session_tag, v.canonical
FROM (VALUES
  (2094, 'Photo-Metadata-Verified Complaint Stamps', 'Cooperative housing accountability via timestamped photo evidence', 'Housing / Accountability', 'B043/K153', 2022),
  (2095, 'Currency Staking for Cooperative Housing Accountability', 'Escrow-based housing contribution with forfeiture mechanics', 'Housing / Economics', 'B043/K153', 2023),
  (2096, 'Reciprocal Weighted Reputation Scoring', 'Bi-directional roommate reputation with weighted consensus', 'Housing / Trust', 'B043/K153', 2024),
  (2097, 'Commitment-Tier-Based Application Grading', 'Housing applications scored by cooperative commitment level', 'Housing / Governance', 'B043/K153', 2025),
  (2098, 'Auto-Escrow with Monthly Forfeit Caps', 'Automated housing escrow with capped monthly forfeitures', 'Housing / Economics', 'B043/K153', 2026),
  (2099, 'Grace Period with Contest-and-Steward-Resolution Flow', 'Multi-stage dispute resolution with evidence and appeals', 'Housing / Governance', 'B043/K153', 2027),
  (2100, 'Three-Function Escrow Lifecycle for Project Sponsorship', 'Hold/release/refund escrow pattern for bounty sponsorship', 'Economics / Sponsorship', 'B043/K154', 2028),
  (2101, 'Marks Payback Auto-Renewal Mechanic', 'Participation-funded membership renewal via Marks balance', 'Economics / Membership', 'B043/K154', 2029),
  (2102, 'Three-Reading-Level Academic Paper System', 'Academic content with plain/detailed/technical reading levels', 'Content / Education', 'B043/K155', 2030),
  (2103, 'Content Registry Architecture with Category-Aware Rendering', 'Cephas content registry with slug-based routing and category rendering', 'Content / Architecture', 'B043/K155', 2031),
  (2104, 'FHA Reasonable Accommodation Integration', 'Fair Housing Act compliance in cooperative housing platform', 'Compliance / Housing', 'B043/K156', 2032),
  (2105, 'Three-Level Digital Appeal Process for Cooperative Disputes', 'Stamp → Contest → Appeal with steward mediation', 'Governance / Disputes', 'B043/K156', 2033),
  (2106, 'Guest Marks Wallet for Contest Compliance', 'No-Purchase-Necessary wallet enabling non-member participation', 'Compliance / Economics', 'B043/K156', 2034),
  (2107, 'Irrevocable Backer Election with Promissory Estoppel', 'Legally-binding one-way election for Credits/Community Fund', 'Compliance / Finance', 'B043/K156', 2035),
  (2108, 'Platform-Specific Disclosure Template System', 'Per-platform FTC-compliant disclosure templates for social media', 'Compliance / Social', 'B043/K157', 2036),
  (2109, 'Promotional Content Guardrails with Anti-MLM Filtering', 'AvoidWords engine preventing prohibited financial language', 'Compliance / Social', 'B043/K157', 2037),
  (2110, 'Distributed Cron Job Scheduling with Observability Logging', 'pg_cron + cron_job_log for background task orchestration', 'Infrastructure / DevOps', 'B043/K158', 2038),
  (2111, 'Content Registry Slug Uniqueness with Safe Merging', 'Idempotent slug deduplication with content merge-before-delete', 'Data / Content', 'B043/K159', 2039)
) AS v(prov11, title, description, category, session_tag, canonical)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il WHERE il.innovation_number = v.prov11
);

-- ─── 3. Insert design-only B035/B036 innovations (no Prov 11 number) ────────
-- These have canonical numbers but were never filed in a provisional

INSERT INTO innovation_log (innovation_number, title, description, category, status, session_tag, canonical_number)
SELECT v.canonical, v.title, v.description, v.category, 'design', v.session_tag, v.canonical
FROM (VALUES
  (2044, 'Marks Half-Life Decay (Membership Conversion Funnel)', 'Time-decay Marks incentivize membership conversion', 'Economics / Membership', 'B036'),
  (2046, 'X-Ray Bounty Arena as a Service (BaaS)', 'White-label QA bounty system for external cooperatives', 'QA / Service', 'B036'),
  (2049, 'DO THE WORK = GET THE STATUS Cue Card System', 'Motivational cue card for effort-based recognition', 'Content / Engagement', 'B036'),
  (2050, 'Desktop Injection Molder Factory Node Placement', 'Desktop manufacturing nodes in the cooperative network', 'Manufacturing / Placement', 'B036'),
  (2051, 'Manufacturing Escalation Ladder (3-Level)', 'Three-tier manufacturing from desktop to SLS to industrial', 'Manufacturing / Operations', 'B036'),
  (2052, 'SLS Production Node (The Shop Tier)', 'Mid-tier SLS production capability in factory network', 'Manufacturing / Operations', 'B036'),
  (2053, 'Project-Entity Requirement (Every Project = Business Entity)', 'Mandatory LLC/entity formation for each product line', 'Governance / Business', 'B036'),
  (2054, 'Multi-Vendor Prototype Validation', 'Competitive prototyping across multiple vendor bids', 'Manufacturing / QA', 'B036'),
  (2055, 'Founder Project-Entity Portfolio (LLC per Product Line)', 'Portfolio of LLCs mapping to Founder product lines', 'Governance / Business', 'B036'),
  (2056, 'Sponsored Business Starter Kit ($100, 10K units)', 'Low-barrier sponsored entry into cooperative manufacturing', 'Commerce / Onboarding', 'B036')
) AS v(canonical, title, description, category, session_tag)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il WHERE il.innovation_number = v.canonical
);

-- ─── 4. Backfill canonical_number for Rook extraction innovations ───────────
-- These already exist in innovation_log by their prov11 number; add canonical mapping

UPDATE innovation_log SET canonical_number = 2057 WHERE innovation_number = 1980 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2058 WHERE innovation_number = 1981 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2059 WHERE innovation_number = 1982 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2060 WHERE innovation_number = 1983 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2061 WHERE innovation_number = 1985 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2062 WHERE innovation_number = 1986 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2063 WHERE innovation_number = 1987 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2064 WHERE innovation_number = 1990 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2065 WHERE innovation_number = 1991 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2066 WHERE innovation_number = 1997 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2067 WHERE innovation_number = 1998 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2068 WHERE innovation_number = 1999 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2069 WHERE innovation_number = 2001 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2070 WHERE innovation_number = 2002 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2071 WHERE innovation_number = 2055 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2072 WHERE innovation_number = 2057 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2073 WHERE innovation_number = 2059 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2074 WHERE innovation_number = 2063 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2075 WHERE innovation_number = 2065 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2076 WHERE innovation_number = 2067 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2077 WHERE innovation_number = 2068 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2078 WHERE innovation_number = 2069 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2079 WHERE innovation_number = 2070 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2080 WHERE innovation_number = 2071 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2081 WHERE innovation_number = 2072 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2082 WHERE innovation_number = 2073 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2083 WHERE innovation_number = 2074 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2084 WHERE innovation_number = 2075 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2085 WHERE innovation_number = 2076 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2086 WHERE innovation_number = 2077 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2087 WHERE innovation_number = 2078 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2088 WHERE innovation_number = 2079 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2089 WHERE innovation_number = 2080 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2090 WHERE innovation_number = 2081 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2091 WHERE innovation_number = 2082 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2092 WHERE innovation_number = 2083 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2093 WHERE innovation_number = 2084 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2094 WHERE innovation_number = 2085 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2095 WHERE innovation_number = 2086 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2096 WHERE innovation_number = 2087 AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2097 WHERE innovation_number = 2088 AND canonical_number IS NULL;

-- ─── 5. Backfill canonical_number for renumbered B035/B036 deployed innovations ──
-- These exist in innovation_log with prov11 numbers; link to new canonical numbers

UPDATE innovation_log SET canonical_number = 2040 WHERE innovation_number = 2056 AND title ILIKE '%canister%modular%' AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2041 WHERE innovation_number = 2058 AND title ILIKE '%x-ray%arena%error%' AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2042 WHERE innovation_number = 2059 AND title ILIKE '%x-ray%arena%documentation%' AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2043 WHERE innovation_number = 2062 AND title ILIKE '%marks-weighted%design%auction%' AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2045 WHERE innovation_number = 2061 AND title ILIKE '%self-generating%error%bounties%' AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2047 WHERE innovation_number = 2066 AND title ILIKE '%member%backing%chain%' AND canonical_number IS NULL;
UPDATE innovation_log SET canonical_number = 2048 WHERE innovation_number = 2064 AND title ILIKE '%slottedtop%canister%' AND canonical_number IS NULL;

-- ─── 6. Update platform_canonical stats ─────────────────────────────────────
UPDATE platform_canonical SET value = 2121, updated_at = now() WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 31, updated_at = now() WHERE key = 'production_systems';

INSERT INTO platform_canonical (key, value, description)
VALUES ('canonical_chain_end', 2097, 'Highest canonical chain number assigned')
ON CONFLICT (key) DO UPDATE SET value = 2097, updated_at = now();

INSERT INTO platform_canonical (key, value, description)
VALUES ('last_reconciliation_session', 44, 'Bishop session that performed last reconciliation (B044)')
ON CONFLICT (key) DO UPDATE SET value = 44, updated_at = now();

-- ─── 7. Update Cephas articles with renumbered B035/B036 references ─────────
-- 2nd Second Revolution article: #2022→#2040, #2023→#2041, #2024→#2042, etc.
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2022', '#2040'), updated_at = now() WHERE slug IN ('2nd-second-revolution', 'do-the-work', 'canister-system-paper', 'industry-backbone') AND content_markdown LIKE '%#2022%';
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2023', '#2041'), updated_at = now() WHERE content_markdown LIKE '%#2023%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2024', '#2042'), updated_at = now() WHERE content_markdown LIKE '%#2024%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2025', '#2043'), updated_at = now() WHERE content_markdown LIKE '%#2025%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2026', '#2044'), updated_at = now() WHERE content_markdown LIKE '%#2026%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2027', '#2045'), updated_at = now() WHERE content_markdown LIKE '%#2027%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2028', '#2046'), updated_at = now() WHERE content_markdown LIKE '%#2028%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2029', '#2047'), updated_at = now() WHERE content_markdown LIKE '%#2029%' AND slug IN ('2nd-second-revolution', 'do-the-work', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2030', '#2048'), updated_at = now() WHERE content_markdown LIKE '%#2030%' AND slug IN ('2nd-second-revolution', 'do-the-work', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2031', '#2049'), updated_at = now() WHERE content_markdown LIKE '%#2031%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2032', '#2051'), updated_at = now() WHERE content_markdown LIKE '%#2032%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
UPDATE cephas_content_registry SET content_markdown = REPLACE(content_markdown, '#2033', '#2052'), updated_at = now() WHERE content_markdown LIKE '%#2033%' AND slug IN ('2nd-second-revolution', 'industry-backbone');
