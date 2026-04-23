-- =============================================================================
-- INNOVATION LOG — Session 11B Batch 2 — 8 BandWagon innovations #1615-#1622
-- =============================================================================
-- Source: BISHOP_DROPZONE/THRESH_FOR_KNIGHT_SESSION_11B_BATCH2.md (Bishop thresh, March 14, 2026)
-- Count after: 1,622

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1615, 'BandWagon — Taste-Prediction Influence Compounding', 'System where members who successfully identify and sponsor high-quality projects earn increased Service Allocation Authority (SAA), creating a virtuous cycle of demonstrated judgment → expanded cooperative resource allocation capability. Frame as earned allocation authority not investment return.', 'Platform Economics / Currency', 'Bag 7', 'pending'),
  (1616, 'Taste Ranger — Generalized Quality Scout Role', 'Platform-wide quality scout role (Scout → Ranger → Curator → TasteMaker → Patron → Luminary) for identifying and backing high-quality projects across all initiatives, distinct from initiative-specific guilds (e.g. Palate Guild = food only).', 'Reputation / Roles', 'Bag 8', 'pending'),
  (1617, 'Backed Marks — Collateral-Sourced Currency Subtype', 'New Mark subtype backed by cooperative-held Joule collateral, spendable ONLY on project sponsorship (not personal essentials), preserving the "Marks from effort differential only" rule for standard Marks while enabling influence-based allocation. Cooperative owns the Joules; member directs, does not own.', 'Platform Economics / Currency', 'Bag 7', 'pending'),
  (1618, 'Positive-Only Quality Assurance Mechanic', 'Quality assurance system that uses ONLY promotion (magnitude of backing, presence of backing) rather than demotion (negative ratings, rejection) to surface quality — absence of backing is sufficient signal without public shaming.', 'Reputation / Roles', 'Bag 8', 'pending'),
  (1619, 'Shared Influence Pool — First-100 Proportional Attribution', 'When multiple members back the same project, the first 100 backers share resulting influence proportionally to their backing amount, with diminishing returns beyond 100 to incentivize early (harder, more valuable) backing.', 'Platform Economics / Currency', 'Bag 7', 'pending'),
  (1620, 'Business Swoop — Single-Influencer Full Project Sponsorship', 'High-tier Taste Ranger (Patron/Luminary) fully funds a project through accumulated Backed Marks allocation authority, functioning as a one-person incubator where the sponsor directs resources but the creator retains project control.', 'Platform Economics / Currency', 'Bag 7', 'pending'),
  (1621, 'TasteMaker Trust Chain — Attributed Recommendation Daisy Chain', 'Trackable attribution chain where the originator of a recommendation receives highest influence credit, first followers receive second share, chain followers receive diminishing shares, with maximum 5-link depth, branching support, and trust scores based on follow rate × conversion quality × influence reach.', 'Reputation / Roles', 'Bag 8', 'pending'),
  (1622, 'Fantasy-to-Real Bridge — Prediction Graduation to Economic Allocation', 'Fantasy League predictions graduate from theoretical scoring to actual economic backing — demonstrated prediction accuracy in the game unlocks the ability to allocate real Backed Marks to real projects, bridging gamified engagement with cooperative resource allocation.', 'Gamification / Onboarding', 'Bag 9', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
