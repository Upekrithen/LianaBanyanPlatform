-- =============================================================================
-- MIGRATION: 20260328000002_seed_cephas_content_registry
-- PURPOSE:   Populate cephas_content_registry with all known Cephas articles,
--            academic papers, and dispatches. Idempotent via ON CONFLICT.
-- DATE:      2026-03-28  |  Bishop 037
-- =============================================================================

INSERT INTO public.cephas_content_registry (slug, title, category, style, technical_summary, implementation_status, source_path)
VALUES
  -- ─── Cephas Articles (12) ──────────────────────────────────────────────────
  ('2nd-second-revolution', 'The 2nd Second Industrial Revolution', 'article', 'pudding', 'The Grand Experiment to Save the World — 4-level manufacturing escalation from Kit to Bench to Shop to Factory. Community-funded production nodes replace traditional supply chains.', 'live', 'CEPHAS_ARTICLE_2ND_SECOND_REVOLUTION.md'),
  ('accounts-payable-eligible-marks', 'Accounts Payable & Eligible Marks', 'article', 'pudding', 'How cooperative Marks create a parallel accounting system where effort-differential currency backs real economic value without securities classification.', 'live', 'CEPHAS_ARTICLE_ACCOUNTS_PAYABLE.md'),
  ('how-to-bake-ai-cake', 'How to Bake an AI Cake', 'article', 'pudding', 'The AI collaboration model — how four AI systems (Rook, Knight, Bishop, Pawn) work together with a human Founder to build a platform at unprecedented speed.', 'live', 'CEPHAS_ARTICLE_AI_CAKE.md'),
  ('canister-system', 'The Canister System', 'article', 'pudding', 'Modular injection molding system — S piston screw-press configuration for thermoplastic injection at ~5,207 PSI. Democratizes manufacturing for hobbyists and makers.', 'live', 'CEPHAS_ARTICLE_CANISTER_SYSTEM.md'),
  ('canister-system-for-makers', 'Injection Molding for the Rest of Us', 'article', 'pudding', 'Maker-focused guide to the Canister System — materials, pressures, real-world products, and the bridge from 3D printing to injection molding at ~50 units.', 'live', 'CEPHAS_ARTICLE_CANISTER_SYSTEM_FOR_MAKERS.md'),
  ('design-democracy', 'Design Democracy', 'article', 'pudding', 'Community-governed visual design system — Element Overlay, voting thresholds, tiered theme governance across Guild/Tribe/Personal layers. Members shape the platform look.', 'live', 'CEPHAS_ARTICLE_DESIGN_DEMOCRACY.md'),
  ('do-the-work', 'DO THE WORK = GET THE STATUS', 'article', 'pudding', 'The Bounty-to-Partnership Pipeline — Marks thresholds replace hiring. Complete bounties, accumulate Marks, unlock production roles. Meritocratic advancement without gatekeepers.', 'live', 'CEPHAS_ARTICLE_DO_THE_WORK.md'),
  ('executive-pay', 'Executive Pay & the Cooperative Alternative', 'article', 'pudding', 'How cooperative governance eliminates extractive executive compensation. Cost+20 constitutional floor ensures fair pricing while C-suite pay ratios stay bounded.', 'live', 'CEPHAS_ARTICLE_EXECUTIVE_PAY.md'),
  ('waterwheels', 'WaterWheels: Cooperative Infrastructure', 'article', 'pudding', 'The economic engine — how Credits, Marks, and Joules flow through the cooperative like water through a mill. Three currencies, one-way valves, margin locks.', 'live', 'CEPHAS_ARTICLE_WATERWHEELS.md'),
  ('why-start-a-guild', 'Why Start a Guild?', 'article', 'pudding', 'Professional guilds as the 5th Cold Start pathway — Guild Treasury, Visual Identity Stack, Benefit Cascade, and how guilds federate professional expertise on the platform.', 'live', 'CEPHAS_ARTICLE_WHY_START_A_GUILD.md'),
  ('why-start-a-tribe', 'Why Start a Tribe?', 'article', 'pudding', 'Personal tribes as the 6th Cold Start pathway — Tribe Mirror, Family Table connections, and how tribes create personal communities distinct from professional guilds.', 'live', 'CEPHAS_ARTICLE_WHY_START_A_TRIBE.md'),
  ('xray-bounty-game', 'Find a Bug, Earn a Coin', 'article', 'pudding', 'X-Ray Bounty Arena — gamified QA where members find errors, document issues, and fix bugs for Marks rewards. Three-tier marketplace: Find, Document, Fix.', 'live', 'CEPHAS_ARTICLE_XRAY_BOUNTY_GAME.md'),

  -- ─── Academic Papers (7) ───────────────────────────────────────────────────
  ('compounding-innovation-velocity', 'Compounding Innovation Velocity', 'academic_paper', 'clean_academic', 'How AI-augmented cooperative development achieves exponential innovation rates — 2,078 innovations in 4 months through systematic Bishop/Knight/Pawn coordination.', 'live', 'PAPER_COMPOUNDING_INNOVATION_VELOCITY.md'),
  ('executive-pay-cooperative', 'Executive Pay in Cooperative Governance', 'academic_paper', 'clean_academic', 'Academic analysis of executive compensation structures in cooperative vs. extractive models. Cost+20 constitutional pricing as a structural alternative to pay ratio caps.', 'live', 'PAPER_EXECUTIVE_PAY_IN_DEPTH.md'),
  ('waterwheels-economics', 'WaterWheels: Three-Currency Economic Architecture', 'academic_paper', 'clean_academic', 'Full academic treatment of the Credits/Marks/Joules system — one-way valves, Joule-backed Mark collateral, and how cooperative currencies avoid securities classification.', 'live', 'PAPER_WATERWHEELS_FULL.md'),
  ('how-to-bake-ai-cake-paper', 'How to Bake an AI Cake (Academic)', 'academic_paper', 'clean_academic', 'Academic paper on multi-agent AI collaboration patterns — role specialization (strategy/code/research), knowledge compounding, and human-AI cooperative workflows.', 'live', 'PAPER_HOW_TO_BAKE_AI_CAKE_FULL.md'),
  ('accounts-payable-marks-paper', 'Accounts Payable & Eligible Marks (Academic)', 'academic_paper', 'clean_academic', 'Formal economic analysis of effort-differential currency systems — how Marks create non-extractive value capture without fiat conversion or securities registration.', 'live', 'PAPER_ACCOUNTS_PAYABLE_ELIGIBLE_MARKS_V3.md'),
  ('sipping-tea', 'Sipping Tea with the LibrarAIn', 'academic_paper', 'clean_academic', 'How Cooperative AI Architecture inverts the cost curve — shared AI costs across members create institutional knowledge compounding that individual users cannot achieve.', 'in_development', 'PAPER_SIPPING_TEA_DRAFT_V1.md'),
  ('design-democracy-paper', 'Design Democracy (Academic)', 'academic_paper', 'clean_academic', 'Academic treatment of community-governed visual design — voting thresholds, tier governance, and how democratic aesthetics create collective ownership of platform identity.', 'in_development', 'PAPER_DESIGN_DEMOCRACY_DRAFT_V1.md'),

  -- ─── Core Economic Documents ───────────────────────────────────────────────
  ('cost-plus-twenty', 'Cost + 20%: The Constitutional Floor', 'article', 'pudding', 'The non-negotiable pricing model — every transaction adds exactly 20% margin. This funds 16 charitable initiatives. No race to the bottom. No loss leaders. Permanent.', 'live', 'C_PLUS_20_DASHBOARD'),
  ('three-currency-system', 'The Three-Currency System', 'article', 'pudding', 'Credits ($1=1, one-way valve), Marks (effort-differential, governance weight), and Joules (surplus forever stamps). All equal value at Cost+20 floor. Backed. Locked. Permanent.', 'live', 'WATERWHEELS'),
  ('cold-start-pathways', 'Six Cold Start Pathways', 'article', 'pudding', 'Food, Manufacturing, Service, Local Business, Guild, Tribe — six pathways matching six production levels. Each pathway has a Captain, a Cue Card, and a Pitch Packet.', 'live', 'COLD_START_HUB'),
  ('captain-system', 'The Captain System', 'article', 'pudding', 'Skin-in-the-game leadership — Captains commit personal resources (C+20 through C+90 tiers), recruit businesses, and earn Marks proportional to their commitment level.', 'live', 'CAPTAIN_SYSTEM'),
  ('moneypenny-gatekeeper', 'MoneyPenny: AI Gatekeeper', 'article', 'pudding', '4-tier AI receptionist for inbound contact screening — filters spam, routes legitimate inquiries, and protects Founder time while maintaining professional engagement.', 'live', 'MONEYPENNY_GATEKEEPER'),
  ('lb-card', 'The LB Card', 'article', 'pudding', 'Stripe Issuing prepaid USD card — cash side of the fork. Person A funds Platform, Platform funds Person B. Never direct P2P. Closed-loop under $2K/day for regulatory exemption.', 'live', 'LB_CARD'),
  ('project-entity-architecture', 'Project-Entity Architecture', 'article', 'pudding', 'Every project = a business entity (sole prop minimum, LLC recommended). Multi-vendor prototype validation. Bounty completers sell their own versions. Market picks the winner.', 'live', 'PROJECT_ENTITY_ARCHITECTURE')

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  style = EXCLUDED.style,
  technical_summary = EXCLUDED.technical_summary,
  implementation_status = EXCLUDED.implementation_status,
  source_path = EXCLUDED.source_path,
  updated_at = now();
