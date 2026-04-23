-- B084: Insert Puddings #182-#187 (6 new from deep parse findings)
-- + 3 Cephas articles registered
-- Session tag: B084

---------------------------------------------------
-- PUDDINGS #182-#187
---------------------------------------------------

INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
)
VALUES
  (
    182,
    'Four Versions, Four Audiences',
    'four-versions-four-audiences',
    NULL,
    NULL,
    'You wrote the paper. The architecture is sound. The economics are rigorous. And nobody reads it...',
    'Describes the four-audience content strategy: Technical Blueprint for developers, Academic White Paper for institutions, Marketing-Branded for creators/media, and Thought Leadership for board/governance. Same source content, four rendering formats optimized for reception.',
    'cinnamon',
    ARRAY['basil', 'oregano'],
    ARRAY[]::INTEGER[],
    'B084',
    'draft'
  ),
  (
    183,
    'v33: The Pivot That Changed Everything',
    'v33-the-pivot',
    NULL,
    NULL,
    'Thirty-two versions of the strategy failed before version thirty-three cracked it...',
    'Documents the Amalgamated Launch strategy: three simultaneous $1K Kickstarters targeting different audiences to trigger the Trending algorithm. Pre-loaded backer base ensures Day 1 funding. The pivot from single-campaign to multi-surface launch.',
    'pepper',
    ARRAY['garlic', 'paprika'],
    ARRAY[]::INTEGER[],
    'B084',
    'draft'
  ),
  (
    184,
    'The Arena: Seven Ways to Work',
    'the-arena-seven-ways-to-work',
    NULL,
    NULL,
    'Every platform has one way to hire. Apply, interview, maybe get the job. Liana Banyan has seven...',
    'Maps all seven platform hiring models to game combat archetypes: Challenge=Tournament, Assignments=Mercenary, Larks=Quests, Fractional=Guild, Milestone=Campaign, Hybrid=Raid, Contract=Quest Chain. Complete work taxonomy with Credit/Mark flow per model.',
    'cumin',
    ARRAY['pepper', 'sugar'],
    ARRAY[2195]::INTEGER[],
    'B084',
    'draft'
  ),
  (
    185,
    'A Dollar in the Account',
    'a-dollar-in-the-account',
    NULL,
    NULL,
    'There was a time when one dollar in a checking account was the difference between getting to work and not...',
    'Traces the direct line from USAA micro-generosity experiences (overdraft grace, free car seats, CD-to-credit pathways) to the platform Super Short Loan (innovation #37, Crown Jewel) and the broader economic design philosophy of Cost+20%.',
    'sugar',
    ARRAY['ginger', 'basil'],
    ARRAY[37]::INTEGER[],
    'B084',
    'draft'
  ),
  (
    186,
    '100 Companies for 100 Days',
    '100-companies-100-days',
    NULL,
    NULL,
    'Day one, you feature a food truck in San Antonio. Day two, a furniture maker in Montana...',
    'Describes a launch campaign concept: feature one real company per day for 100 consecutive days with documentation blueprint. Connected to Concurrent Distribution Grid (innovation #2141, CJ) for scheduling and Battery Dispatch for multi-channel posting.',
    'paprika',
    ARRAY['cumin', 'garlic'],
    ARRAY[2141]::INTEGER[],
    'B084',
    'draft'
  ),
  (
    187,
    'The Original Recipe Book',
    'the-original-recipe-book',
    NULL,
    NULL,
    'Before the platform, before the patents, before the AI agents, there was a college freshman in a library...',
    'Connects the Founder origin story (student librarian compiling drink recipes from 1800s library books) to the seven-food metaphor chain (Stone Soup, Bread, Pudding, Spoonfuls, Spices, Popcorn) and the platform documentation philosophy.',
    'ginger',
    ARRAY['sugar', 'cinnamon'],
    ARRAY[]::INTEGER[],
    'B084',
    'draft'
  )
ON CONFLICT (pudding_number) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  pudding_text = EXCLUDED.pudding_text,
  not_pudding_summary = EXCLUDED.not_pudding_summary,
  primary_spice = EXCLUDED.primary_spice,
  secondary_spices = EXCLUDED.secondary_spices,
  innovations_referenced = EXCLUDED.innovations_referenced,
  bishop_session = EXCLUDED.bishop_session,
  status = EXCLUDED.status,
  updated_at = now();

---------------------------------------------------
-- 3 CEPHAS ARTICLES (into cephas_content_registry)
---------------------------------------------------

INSERT INTO cephas_content_registry (
  slug, title, category, style, source_path,
  implementation_status, bishop_session, content_markdown
)
VALUES
  (
    'seven-ways-to-work',
    'Seven Ways to Work: The Arena Guide to Earning on Liana Banyan',
    'article',
    'pudding',
    'Cephas/cephas-hugo/content/articles/seven-ways-to-work.md',
    'in_development',
    'B084',
    'Full content in Hugo file. See source_path.'
  ),
  (
    'escape-velocity-program',
    'Escape Velocity: Your First Six Months on Liana Banyan',
    'article',
    'pudding',
    'Cephas/cephas-hugo/content/articles/escape-velocity-program.md',
    'in_development',
    'B084',
    'Full content in Hugo file. See source_path.'
  ),
  (
    'documentation-as-democracy',
    'Documentation as Democracy: Why We Show Everything',
    'article',
    'pudding',
    'Cephas/cephas-hugo/content/articles/documentation-as-democracy.md',
    'in_development',
    'B084',
    'Full content in Hugo file. See source_path.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();

---------------------------------------------------
-- UPDATE CANONICAL COUNTS
---------------------------------------------------

UPDATE platform_canonical SET value = '187', updated_at = now()
WHERE key = 'pudding_articles';
