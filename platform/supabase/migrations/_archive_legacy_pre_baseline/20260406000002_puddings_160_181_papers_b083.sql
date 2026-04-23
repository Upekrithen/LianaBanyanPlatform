-- B083: Insert Puddings #160-#181 (22 new) and Papers #36-#38 (3 new)
-- Session tag: B083

---------------------------------------------------
-- PUDDINGS #160-#181
---------------------------------------------------

INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
)
VALUES
  (
    160,
    'The Ratchet: Why Your Credits Never Lose Value',
    'the-ratchet-why-your-credits-never-lose-value',
    NULL,
    NULL,
    'A credit you earn today is worth the same tomorrow. Not because someone promises it — because the system locks it in place...',
    'Explains the one-way valve architecture that prevents Credit deflation. Credits enter the cooperative domain and never convert back to fiat.',
    'garlic',
    ARRAY['pepper', 'salt'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    161,
    'Your Castle Ready on Day One',
    'your-castle-ready-on-day-one',
    NULL,
    NULL,
    'Most platforms hand you a blank page and say good luck. Liana Banyan hands you a castle with the lights already on...',
    'Describes the Cold Start architecture that gives new members a fully functional Helm, pre-wired connections, and immediate earning pathways from first login.',
    'sugar',
    ARRAY['basil', 'cinnamon'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    162,
    'The Board Game Lobby: How Teams Form',
    'the-board-game-lobby-how-teams-form',
    NULL,
    NULL,
    'Imagine walking into a board game cafe. You do not sit down at a random table. You browse the lobbies...',
    'Explains the Crew Call system as a lobby mechanic where project creators post skill needs and members browse, match, and join teams before work begins.',
    'cumin',
    ARRAY['basil', 'oregano'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    163,
    'The Red Queen: Your Personal AI Manager',
    'the-red-queen-your-personal-ai-manager',
    NULL,
    NULL,
    'The Red Queen does not manage you. She manages the information around you so you can manage yourself...',
    'Describes the AI Nanny / MoneyPenny architecture as a personal AI manager that curates tasks, filters noise, and surfaces opportunities without replacing human agency.',
    'cinnamon',
    ARRAY['pepper', 'ginger'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    164,
    'Portal Doors: How You Navigate Between Communities',
    'portal-doors-how-you-navigate-between-communities',
    NULL,
    NULL,
    'You belong to a Guild. You belong to a Tribe. You run a Bridge. You live in a Helm. These are not separate apps...',
    'Explains the nine portal surfaces and how members navigate seamlessly between .com, .biz, .org, .net, and specialty domains without losing context or identity.',
    'oregano',
    ARRAY['sugar', 'basil'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    165,
    'The Flywheel: How Every Action Feeds the Next',
    'the-flywheel-how-every-action-feeds-the-next',
    NULL,
    NULL,
    'You post content. That content earns Credits. Those Credits fund a project. That project hires a member. That member posts content...',
    'Maps the complete cooperative flywheel from content creation through Credits to project funding to member hiring and back to content, showing how each action amplifies the next.',
    'garlic',
    ARRAY['ginger', 'cumin'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    166,
    'The Labyrinth: Where Bugs Are Monsters',
    'the-labyrinth-where-bugs-are-monsters',
    NULL,
    NULL,
    'Every platform has bugs. Most platforms hide them. Liana Banyan turns them into quests...',
    'Describes the gamified bug-reporting and QA system where members earn Credits by finding, documenting, and verifying bugs through a dungeon-crawl metaphor.',
    'pepper',
    ARRAY['cumin', 'sugar'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    167,
    'The Project Seed: From Idea to Diamond in Six Stages',
    'the-project-seed-from-idea-to-diamond-in-six-stages',
    NULL,
    NULL,
    'Every project starts as a seed. Not a business plan. Not a pitch deck. A seed...',
    'Walks through the six Production Levels from raw idea (Seed) through prototyping, testing, funding, scaling, and Diamond status with cooperative governance at each stage.',
    'basil',
    ARRAY['garlic', 'oregano'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    168,
    'Build Your Kingdom: What Companies Get When They Join',
    'build-your-kingdom-what-companies-get-when-they-join',
    NULL,
    NULL,
    'A company that joins Liana Banyan does not lose its identity. It gains an island...',
    'Explains B2B integration through the Corporate Island model — companies maintain sovereignty while accessing cooperative infrastructure, talent pools, and distribution networks.',
    'garlic',
    ARRAY['cumin', 'salt'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    169,
    'SCaaS: Your AIs Fact-Checker',
    'scaas-your-ais-fact-checker',
    NULL,
    NULL,
    'Every AI hallucinates. The question is not whether it will make something up. The question is who catches it...',
    'Describes the Star Chamber as a Service architecture where AI outputs are validated through multi-agent consensus, source verification, and human-in-the-loop escalation.',
    'pepper',
    ARRAY['cinnamon', 'ginger'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    170,
    'The Compensation Slider: You Choose Cash or Credits',
    'the-compensation-slider-you-choose-cash-or-credits',
    NULL,
    NULL,
    'At the end of every project, you get a slider. Left is cash. Right is Credits. You decide where it lands...',
    'Explains the Substitution mechanism where members choose their own cash-to-Credit ratio for compensation, with Credits providing higher cooperative purchasing power.',
    'salt',
    ARRAY['garlic', 'pepper'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    171,
    'The Chronicle Keeper: Game Masters Become Business Owners',
    'the-chronicle-keeper-game-masters-become-business-owners',
    NULL,
    NULL,
    'A game master runs a table of six adventurers through a dungeon every Saturday. That is a skill. That is also a business...',
    'Shows how the Chronicle system transforms game masters and content creators into cooperative business owners with structured revenue, IP protection, and audience-building tools.',
    'sugar',
    ARRAY['cumin', 'paprika'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    172,
    'Leave the Corners: Boaz Contribution Types',
    'leave-the-corners-boaz-contribution-types',
    NULL,
    NULL,
    'In the Book of Ruth, the landowner Boaz does not give Ruth a salary. He leaves the corners of his field unharvested...',
    'Explains the Boaz Principle contribution architecture where members can contribute labor, resources, mentorship, or access — each with its own Mark valuation and recognition path.',
    'basil',
    ARRAY['salt', 'oregano'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    173,
    'From Campaign to Novel',
    'from-campaign-to-novel',
    NULL,
    NULL,
    'A tabletop campaign runs for forty sessions. That is 120 hours of collaborative storytelling. That is a novel...',
    'Describes how HexIsle campaign transcripts are structured, edited, and published as cooperative fiction with shared IP and revenue splits among all contributors.',
    'paprika',
    ARRAY['sugar', 'cumin'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    174,
    'The Montana Principle: Would You Accept Your Own Deal',
    'the-montana-principle-would-you-accept-your-own-deal',
    NULL,
    NULL,
    'Before any deal goes live on Liana Banyan, the person offering it must answer one question: would you accept this deal yourself...',
    'Formalizes the Montana Principle as a self-dealing test for cooperative fairness — every offer, bounty, and contract must pass the mirror test before publication.',
    'salt',
    ARRAY['pepper', 'basil'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    175,
    'The Birthright: Your Marks Become Benefits',
    'the-birthright-your-marks-become-benefits',
    NULL,
    NULL,
    'You earned Marks. Those Marks funded a project. That project succeeded. Now those Marks carry weight...',
    'Explains how Backed Marks — Marks collateralized by Joules from successful projects — unlock governance rights, voting power, and benefit tiers within the cooperative.',
    'ginger',
    ARRAY['garlic', 'salt'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    176,
    'Daily Mazes: Sharpen Your Skills Earn Your Credits',
    'daily-mazes-sharpen-your-skills-earn-your-credits',
    NULL,
    NULL,
    'Every morning, a new maze appears on your Helm. Not a literal maze. A challenge tailored to your skill profile...',
    'Describes the daily challenge system where members complete skill-matched micro-tasks for Credits, building both competency and cooperative contribution history.',
    'cumin',
    ARRAY['sugar', 'pepper'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    177,
    'Your Island Your Rules: Four Ownership Models',
    'your-island-your-rules-four-ownership-models',
    NULL,
    NULL,
    'When you create a project on Liana Banyan, you choose how to own it. Not one way. Four ways...',
    'Details the four project ownership structures: Solo (full control), Partnership (shared equity), Cooperative (member-governed), and Sponsored (corporate-backed with member protection).',
    'oregano',
    ARRAY['garlic', 'basil'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    178,
    'The 20 Percent Rule: Why Sharing Makes You Richer',
    'the-20-percent-rule-why-sharing-makes-you-richer',
    NULL,
    NULL,
    'The Cost+20% formula is not a tax. It is a reinvestment. Every transaction adds exactly 20 percent to the cooperative treasury...',
    'Breaks down the Cost+20% pricing floor showing how the 20% margin funds infrastructure, member benefits, and project support while keeping prices below market rates.',
    'garlic',
    ARRAY['salt', 'pepper'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    179,
    'The Drink Cookbook: How One Old Book Started All This',
    'the-drink-cookbook-how-one-old-book-started-all-this',
    NULL,
    NULL,
    'There is a cookbook in the Jones family. It is old. The drinks section has a recipe for something that should not exist...',
    'Origin story connecting the family cookbook discovery to the Stone Soup fable and the founding insight that cooperation creates value no individual ingredient can.',
    'paprika',
    ARRAY['sugar', 'basil'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    180,
    'Wave Pricing: The Impatience Tax That Funds Everything',
    'wave-pricing-the-impatience-tax-that-funds-everything',
    NULL,
    NULL,
    'The first wave pays more. The second wave pays less. The third wave pays least. This is not a sale. This is physics...',
    'Explains wave-based pricing as a self-funding mechanism where early adopters voluntarily pay premium prices, funding production for later waves at lower costs.',
    'garlic',
    ARRAY['salt', 'cumin'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  ),
  (
    181,
    'BandWagon: Trust Your Taste',
    'bandwagon-trust-your-taste',
    NULL,
    NULL,
    'You know what is good before the algorithm does. BandWagon is the system that proves it...',
    'Describes the BandWagon taste-validation system where early endorsements of content, products, or projects earn retroactive Credits when those picks succeed.',
    'ginger',
    ARRAY['sugar', 'cinnamon'],
    ARRAY[]::INTEGER[],
    'B083',
    'draft'
  )
ON CONFLICT (pudding_number) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  source_paper = EXCLUDED.source_paper,
  source_paper_word_count = EXCLUDED.source_paper_word_count,
  pudding_text = EXCLUDED.pudding_text,
  not_pudding_summary = EXCLUDED.not_pudding_summary,
  primary_spice = EXCLUDED.primary_spice,
  secondary_spices = EXCLUDED.secondary_spices,
  innovations_referenced = EXCLUDED.innovations_referenced,
  bishop_session = EXCLUDED.bishop_session,
  status = EXCLUDED.status,
  updated_at = now();

---------------------------------------------------
-- PAPERS #36-#38 (into cephas_content_registry)
---------------------------------------------------

INSERT INTO cephas_content_registry (
  slug, title, category, style, source_path,
  implementation_status, bishop_session, paper_number,
  content_markdown
)
VALUES
  (
    'wave-based-pricing-impatience-tax',
    'Wave-Based Pricing: The Impatience Tax as Self-Funding Mechanism for Cooperative Manufacturing',
    'academic_paper',
    'clean_academic',
    'Cephas/papers/paper-36-wave-based-pricing.md',
    'planned',
    'B083',
    '36',
    'Draft placeholder — full content to be generated by Knight session.'
  ),
  (
    'corporate-island-b2b-integration',
    'The Corporate Island: B2B Integration in Cooperative Platforms Without Sovereignty Loss',
    'academic_paper',
    'clean_academic',
    'Cephas/papers/paper-37-corporate-island.md',
    'planned',
    'B083',
    '37',
    'Draft placeholder — full content to be generated by Knight session.'
  ),
  (
    'gamified-generosity-corner-contributions',
    'Gamified Generosity: How Corner Contributions Create Anti-Fragile Economic Networks',
    'academic_paper',
    'clean_academic',
    'Cephas/papers/paper-38-gamified-generosity.md',
    'planned',
    'B083',
    '38',
    'Draft placeholder — full content to be generated by Knight session.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  paper_number = EXCLUDED.paper_number,
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();

---------------------------------------------------
-- UPDATE CANONICAL COUNTS
---------------------------------------------------

UPDATE platform_canonical SET value = '181', updated_at = now()
WHERE key = 'pudding_articles';

UPDATE platform_canonical SET value = '38', updated_at = now()
WHERE key = 'academic_papers';
