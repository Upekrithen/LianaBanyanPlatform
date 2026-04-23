-- K170: Templatize existing Cephas content
-- Replace hardcoded stats in all article content_markdown with {{template}} variables.
-- Only applies to rows that have content_markdown (not metadata-only entries).

-- Apply all replacements in a single pass per row.
-- Targets: innovation counts, patent claims, production systems, crown jewels,
--   initiative counts, creator retention, platform margin, founder title.

UPDATE cephas_content_registry
SET content_markdown = (
  SELECT r FROM (
    SELECT
      -- Innovation counts (various historical values)
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      -- Crown Jewels
      REPLACE(
      REPLACE(
      -- Patent applications
      REPLACE(
      REPLACE(
      -- Patent claims
      REPLACE(
      REPLACE(
      -- Production systems
      REPLACE(
      REPLACE(
      -- Charitable initiatives
      REPLACE(
      -- Creator retention in prose
      REPLACE(
      -- Platform margin
      REPLACE(
      REPLACE(
      -- Founder title
      REPLACE(
        content_markdown,
        'Founder & CEO', '{{founderTitle}}'),
        'Cost + 20%', '{{platformMargin}}'),
        'Cost+20%', '{{platformMargin}}'),
        'creators keep 83.3%', 'creators keep {{creatorRetention}}'),
        '16 charitable initiatives', '{{charitableInitiatives}} charitable initiatives'),
        '31 production systems', '{{productionSystems}} production systems'),
        '31 live production systems', '{{productionSystems}} live production systems'),
        'more than 2,000 formal claims', 'more than {{patentClaims}} formal claims'),
        '2,081 formal claims', '{{patentClaims}} formal claims'),
        '11 provisional applications', '{{patentApplications}} provisional applications'),
        '11 patent applications', '{{patentApplications}} patent applications'),
        '161 Crown Jewels', '{{crownJewels}} Crown Jewels'),
        '151 Crown Jewels', '{{crownJewels}} Crown Jewels'),
        '2,121 innovations', '{{innovationCount}} innovations'),
        '2,104 innovations', '{{innovationCount}} innovations'),
        '2,099 innovations', '{{innovationCount}} innovations'),
        '2,093 innovations', '{{innovationCount}} innovations'),
        '2,078 innovations', '{{innovationCount}} innovations')
      AS r
  ) sub
)
WHERE content_markdown IS NOT NULL
  AND category IN ('article', 'business-plan')
  AND (
    content_markdown LIKE '%2,121 innovations%'
    OR content_markdown LIKE '%2,104 innovations%'
    OR content_markdown LIKE '%2,099 innovations%'
    OR content_markdown LIKE '%2,093 innovations%'
    OR content_markdown LIKE '%2,078 innovations%'
    OR content_markdown LIKE '%161 Crown Jewels%'
    OR content_markdown LIKE '%151 Crown Jewels%'
    OR content_markdown LIKE '%31 production systems%'
    OR content_markdown LIKE '%11 provisional%'
    OR content_markdown LIKE '%11 patent applications%'
    OR content_markdown LIKE '%16 charitable%'
    OR content_markdown LIKE '%Cost + 20%%'
    OR content_markdown LIKE '%Cost+20%%'
    OR content_markdown LIKE '%Founder & CEO%'
    OR content_markdown LIKE '%83.3%%'
    OR content_markdown LIKE '%2,081 formal%'
  );

-- Also update letters and other content types
UPDATE cephas_content_registry
SET content_markdown = (
  SELECT r FROM (
    SELECT
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
      REPLACE(
        content_markdown,
        'Founder & CEO', '{{founderTitle}}'),
        '2,121 innovations', '{{innovationCount}} innovations'),
        '2,104 innovations', '{{innovationCount}} innovations'),
        '161 Crown Jewels', '{{crownJewels}} Crown Jewels'),
        '31 production systems', '{{productionSystems}} production systems'),
        '11 provisional applications', '{{patentApplications}} provisional applications')
      AS r
  ) sub
)
WHERE content_markdown IS NOT NULL
  AND category NOT IN ('article', 'business-plan')
  AND (
    content_markdown LIKE '%2,121 innovations%'
    OR content_markdown LIKE '%2,104 innovations%'
    OR content_markdown LIKE '%161 Crown Jewels%'
    OR content_markdown LIKE '%31 production systems%'
    OR content_markdown LIKE '%11 provisional%'
    OR content_markdown LIKE '%Founder & CEO%'
  );
