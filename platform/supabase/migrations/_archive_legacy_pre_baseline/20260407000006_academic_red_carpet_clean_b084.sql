-- ============================================================================
-- MIGRATION: 20260407000001_academic_red_carpet_b084.sql
-- Bishop 084: Red Carpet + Cue Card campaigns for 5 Circle 2 academics
-- Recipients: McAfee, Jones, Tonetti, Rock, Mollick
-- Each gets: red_carpet_registry entry, red_carpet_recipients entry,
--            cue_card_campaign with curated content path
-- ============================================================================

-- =====================================================================
-- PART 1: red_carpet_registry — Dynamic registry entries (slug-based)
-- =====================================================================

INSERT INTO red_carpet_registry (
  slug, name, title, organization, bio, purpose, why_you,
  categories, known_emails, email_domains, walkthrough_config,
  initiatives, source, launch_flag, icon, category_label
) VALUES
  -- Andrew McAfee (MIT Sloan / Workhelix)
  ('andrew-mcafee', 'Andrew McAfee', 'Principal Research Scientist', 'MIT Sloan / Workhelix',
   'MIT Sloan researcher, co-founded Workhelix, co-author of The Second Machine Age and The Geek Way',
   'Academic advisor — AI productivity, organizational design, cooperative economics validation',
   'You study how organizations actually work — not the org chart, but the norms, culture, and decision architecture that determine outcomes. The Geek Way documented how the best tech companies operate through ownership, speed, science, and openness. Liana Banyan is a cooperative built on those same principles, with constitutional economics that lock them permanently. 2,222 innovations. 202 crown jewels. 2,187 formal patent claims. The AI runs the context — four agents coordinating across 35 production systems — but the economics belong to the members. 83.3% to creators. Cost+20%. DNA-locked.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['mit.edu','workhelix.com'],
   '{"theme":"academic","showSections":["economics","academic_papers","patent_portfolio","ai_architecture","founder"]}'::jsonb,
   ARRAY[]::text[],
   'bishop_084', 'AC', '🎓', 'Academic Partnership'),

  -- Chad Jones (Stanford GSB)
  ('chad-jones', 'Chad Jones', 'Professor of Economics', 'Stanford GSB',
   'Stanford GSB economist, research on economic growth theory, weak links, and AI macroeconomics',
   'Academic advisor — growth theory, weak-link economics, AI productivity modeling',
   'Your research on weak links showed that economic output depends on the weakest input in the chain. Liana Banyan''s architecture is designed around that insight: the Ratchet system ensures Credits never lose value, the DNA Lock prevents margin extraction, and the cooperative structure means no single weak link — a departing CEO, a hostile board, a greedy investor — can collapse the economics. 2,222 innovations across 35 production systems, all constitutionally locked at Cost+20%. Your growth models describe what happens when institutions get the fundamentals right. We built an institution that structurally cannot get them wrong.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['stanford.edu'],
   '{"theme":"academic","showSections":["economics","academic_papers","governance","patent_portfolio","founder"]}'::jsonb,
   ARRAY[]::text[],
   'bishop_084', 'AC', '🎓', 'Academic Partnership'),

  -- Christopher Tonetti (Stanford GSB)
  ('christopher-tonetti', 'Christopher Tonetti', 'Associate Professor of Finance', 'Stanford GSB',
   'Stanford GSB finance professor, research on nonrival goods, data ownership, organizational form',
   'Academic advisor — cooperative organizational form, nonrival economics, IP governance',
   'Your work on nonrival goods and data ownership asks who should control the value that ideas create. Liana Banyan answers structurally: the cooperative owns the IP, the members own the cooperative, and the economics are constitutionally locked — 83.3% to creators, Cost+20% margin, DNA Lock against extraction. The Company Island architecture means each initiative operates as a self-governing unit within the cooperative''s constitutional framework. 202 crown jewel innovations. 11 provisional patents filed. This is organizational form as economic infrastructure.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['stanford.edu'],
   '{"theme":"academic","showSections":["economics","governance","academic_papers","patent_portfolio","founder"]}'::jsonb,
   ARRAY[]::text[],
   'bishop_084', 'AC', '🎓', 'Academic Partnership'),

  -- Daniel Rock (Wharton / Workhelix)
  ('daniel-rock', 'Daniel Rock', 'Assistant Professor', 'Wharton / Workhelix',
   'Wharton professor, co-founded Workhelix, AI labor productivity data and measurement',
   'Academic advisor — AI labor productivity measurement, platform economics data',
   'You measure what AI actually does to labor productivity — not the hype, the data. Liana Banyan has 35 live production systems generating real economic data across manufacturing, housing, food, education, and commerce verticals. Four AI agents coordinate 2,222 innovations with measurable output: content production, patent documentation, campaign deployment, member onboarding. The Five Dollar Career paper models how a $5/month membership creates real career pathways through cooperative infrastructure. The data is here. The measurement opportunity is yours.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['wharton.upenn.edu','upenn.edu','workhelix.com'],
   '{"theme":"academic","showSections":["economics","academic_papers","ai_architecture","patent_portfolio","founder"]}'::jsonb,
   ARRAY[]::text[],
   'bishop_084', 'AC', '🎓', 'Academic Partnership'),

  -- Ethan Mollick (Wharton)
  ('ethan-mollick', 'Ethan Mollick', 'Associate Professor', 'Wharton',
   'Wharton professor, One Useful Thing newsletter, AI entrepreneurship and keeping AI weird',
   'Academic advisor — AI entrepreneurship, cooperative innovation, unconventional platform design',
   'You keep telling people to keep AI weird. We took that literally. Four AI agents — Bishop, Knight, Rook, Pawn — run as a coordinated team with a human founder as AI Tuner. They''ve produced 2,222 documented innovations, 38 academic papers, 181 Pudding articles, 584 episodic content pieces, and 11 provisional patent filings. The platform itself is the experiment: a cooperative where AI amplifies human agency instead of replacing it, where the economics are constitutionally locked against extraction, and where the entire architecture was built by a veteran with eight children and half his family''s emergency savings. This is AI entrepreneurship at its weirdest and most real.',
   ARRAY['academic'], ARRAY[]::text[], ARRAY['wharton.upenn.edu','upenn.edu'],
   '{"theme":"academic","showSections":["economics","ai_architecture","academic_papers","patent_portfolio","founder"]}'::jsonb,
   ARRAY[]::text[],
   'bishop_084', 'AC', '🎓', 'Academic Partnership')
ON CONFLICT (slug) DO NOTHING;


-- =====================================================================
-- PART 2: red_carpet_recipients — Domain-matched walkthrough entries
-- =====================================================================

INSERT INTO red_carpet_recipients (
  email_domain, recipient_name, role_offered, initiative, wave,
  personalized_greeting, walkthrough_sections, category, walkthrough_type
) VALUES
  -- Andrew McAfee
  ('mit.edu', 'Andrew McAfee', 'Academic Advisor', 'AI Productivity & Cooperative Economics', 3,
   'Professor McAfee, welcome. The architecture runs on the same principles you documented in The Geek Way — ownership, speed, science, openness. Except here, they''re constitutionally locked.',
   '["economics","academic_papers","ai_architecture","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),
  ('workhelix.com', 'Andrew McAfee', 'Academic Advisor', 'AI Productivity & Cooperative Economics', 3,
   'Professor McAfee, welcome. The architecture runs on the same principles you documented in The Geek Way — ownership, speed, science, openness. Except here, they''re constitutionally locked.',
   '["economics","academic_papers","ai_architecture","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),

  -- Chad Jones
  ('stanford.edu:chad-jones', 'Chad Jones', 'Academic Advisor', 'Growth Theory & Cooperative Economics', 3,
   'Professor Jones, welcome. Your weak-link insight is built into the DNA — every structural decision removes a link that could break the chain.',
   '["economics","academic_papers","governance","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),

  -- Christopher Tonetti
  ('stanford.edu:christopher-tonetti', 'Christopher Tonetti', 'Academic Advisor', 'Organizational Form & IP Governance', 3,
   'Professor Tonetti, welcome. The nonrival goods problem you study — who controls the value ideas create — has a structural answer here.',
   '["economics","governance","academic_papers","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),

  -- Daniel Rock
  ('wharton.upenn.edu', 'Daniel Rock', 'Academic Advisor', 'AI Labor Productivity Measurement', 3,
   'Professor Rock, welcome. Thirty-five live production systems. Four AI agents. Real labor productivity data. The measurement opportunity is yours.',
   '["economics","academic_papers","ai_architecture","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),
  ('upenn.edu:daniel-rock', 'Daniel Rock', 'Academic Advisor', 'AI Labor Productivity Measurement', 3,
   'Professor Rock, welcome. Thirty-five live production systems. Four AI agents. Real labor productivity data. The measurement opportunity is yours.',
   '["economics","academic_papers","ai_architecture","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),
  ('workhelix.com:daniel-rock', 'Daniel Rock', 'Academic Advisor', 'AI Labor Productivity Measurement', 3,
   'Professor Rock, welcome. Thirty-five live production systems. Four AI agents. Real labor productivity data. The measurement opportunity is yours.',
   '["economics","academic_papers","ai_architecture","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),

  -- Ethan Mollick
  ('wharton.upenn.edu:ethan-mollick', 'Ethan Mollick', 'Academic Advisor', 'AI Entrepreneurship & Cooperative Innovation', 3,
   'Professor Mollick, welcome. You said keep AI weird. Four AI agents, a veteran with eight kids, and half a family''s emergency savings. Weird enough?',
   '["economics","ai_architecture","academic_papers","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic'),
  ('upenn.edu:ethan-mollick', 'Ethan Mollick', 'Academic Advisor', 'AI Entrepreneurship & Cooperative Innovation', 3,
   'Professor Mollick, welcome. You said keep AI weird. Four AI agents, a veteran with eight kids, and half a family''s emergency savings. Weird enough?',
   '["economics","ai_architecture","academic_papers","patent_portfolio","founder"]'::jsonb,
   'academic', 'academic')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- PART 4: Link campaigns to walkthrough_config in registry
-- Update the registry entries with campaign slug references
-- =====================================================================

UPDATE red_carpet_registry
SET walkthrough_config = walkthrough_config || '{"curated_campaign":"academic-mcafee-ai-productivity","content_path":[{"type":"paper","ref":"self-funding-economics","label":"Self-Funding Economics"},{"type":"pudding","ref":"a-dollar-in-the-account","label":"A Dollar in the Account"},{"type":"paper","ref":"four-agent-architecture","label":"Four-Agent Architecture"}]}'::jsonb
WHERE slug = 'andrew-mcafee';

UPDATE red_carpet_registry
SET walkthrough_config = walkthrough_config || '{"curated_campaign":"academic-jones-growth-theory","content_path":[{"type":"paper","ref":"self-funding-economics","label":"Self-Funding Economics"},{"type":"pudding","ref":"the-ratchet","label":"The Ratchet"},{"type":"innovation","ref":"2222","label":"BandWagon"}]}'::jsonb
WHERE slug = 'chad-jones';

UPDATE red_carpet_registry
SET walkthrough_config = walkthrough_config || '{"curated_campaign":"academic-tonetti-org-form","content_path":[{"type":"paper","ref":"corporate-island","label":"Corporate Island"},{"type":"pudding","ref":"the-20-percent-rule","label":"The 20% Rule"},{"type":"innovation","ref":"2162","label":"Company Island"}]}'::jsonb
WHERE slug = 'christopher-tonetti';

UPDATE red_carpet_registry
SET walkthrough_config = walkthrough_config || '{"curated_campaign":"academic-rock-labor-productivity","content_path":[{"type":"paper","ref":"five-dollar-career","label":"The Five Dollar Career"},{"type":"pudding","ref":"arena-seven-ways-to-work","label":"Arena: Seven Ways to Work"},{"type":"page","ref":"/Stats","label":"Platform Statistics"}]}'::jsonb
WHERE slug = 'daniel-rock';

UPDATE red_carpet_registry
SET walkthrough_config = walkthrough_config || '{"curated_campaign":"academic-mollick-ai-entrepreneurship","content_path":[{"type":"paper","ref":"four-agent-architecture","label":"Four-Agent Architecture"},{"type":"pudding","ref":"v33-pivot","label":"The v33 Pivot"},{"type":"pudding","ref":"original-recipe-book","label":"The Original Recipe Book"}]}'::jsonb
WHERE slug = 'ethan-mollick';
