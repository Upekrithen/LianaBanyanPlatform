-- ═══════════════════════════════════════════════════════════════════════════════
-- INNOVATION LOG — Session 7E Gap Bridging (March 8, 2026)
-- Innovations #1529-#1534
-- ═══════════════════════════════════════════════════════════════════════════════
-- NPC Shopkeeper System + Inter-Island Travel + Manufacturing Pipeline +
-- Inn Bridge System + Areopagus Governance Integration + Harper Charter
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO innovation_log (innovation_number, title, description, category, session_tag) VALUES
(1529, 'NPC Shopkeeper System',
 'In-game commerce system with 10 NPC types (merchant, blacksmith, gondolier, ferryman, innkeeper, librarian, postmaster, alchemist, realtor, harbormaster). Full inventory management with stock tracking, rarity tiers, skill requirements. Three-currency transactions (Credits, Marks, Joules). C+20% pricing enforcement on all items. As You Wish confirmation for purchases. Harper monitoring flags on high-value or suspicious transactions. 6 seed NPCs for Verdana: Mercer Flint (General Merchant), Kira Ashdown (Master Smith), Marco Tide (Head Gondolier), Captain Salt (Harbor Ferryman), Sage Inkwell (Academy Librarian), Courier Brass (Postmaster General).',
 'Architecture/Commerce', 'Session 7E'),

(1530, 'Inter-Island Travel System',
 'Ocean crossing system connecting all 7 HexIsle islands. 6 vessel types with progressive capabilities: foot (speed 1), rowboat (2), raft (3), small_ship (4), medium_ship (6), guild_vessel (8). 5 weather conditions affecting travel (calm, breezy, choppy, stormy, fog). 9 encounter types with weighted probability tables per route: merchant_ship, pirate, sea_creature, floating_debris, weather_change, island_sighting, nothing, guild_patrol, ghost_ship. 7 ocean routes with unique encounter tables, hazard levels, minimum vessel requirements, and discovery prerequisites. Travel time calculation based on vessel speed, weather, and route distance.',
 'Architecture/Travel', 'Session 7E'),

(1531, 'Physical Manufacturing Pipeline',
 'Complete pipeline for real-world product manufacturing: 11 stages (design, prototype, testing, revision, approved, sourcing, production, quality_check, packaging, shipping, delivered). 9 manufacturing methods including 3D printing (FDM/SLA/SLS), CNC, injection molding, casting, laser cutting, hand assembly, PCB. 5 quality grades (prototype through museum). Pioneer Node matching algorithm pairs orders with local makers based on equipment, capacity, rating, and pricing. C+20% pricing validation at every stage. Capstone Manufacturing Spec defined with placeholder dimensions (50mm diameter, 30mm height, 2mm walls, 5mm channels) awaiting Founder Hexel Spec finalization. Guild oversight and fulfillment tracking throughout.',
 'Architecture/Manufacturing', 'Session 7E'),

(1532, 'Inn Bridge System',
 'HexIsle accommodation bridge connecting in-game Inns to real-world lodging providers (Airbnb, VRBO, Booking, Hostelworld, Direct). 6 room types: bunk, private, suite, entire_place, glamping, unique. In-game benefits for real-world stays: rest bonuses (+10% to +40% Coverage Minutes), free Coverage Minutes (3-24), fast travel passes, lore unlocks, storage upgrades, temporary guild access. Revenue model: platform earns C+20% on the bridge fee only (NOT on the room rate). Harper verification required for listing quality and safety. Booking system with availability checking, blackout dates, and guest review system. Seed data: Wayward Rest at Verdana Harbor.',
 'Architecture/Commerce', 'Session 7E'),

(1533, 'Areopagus Governance Integration System',
 'Complete governance framework: (1) Dispute Escalation Ladder — 4 levels from flagged through community_review, steward_mediation, to arbitration with 3-member panels requiring unanimous decisions. (2) Anti-Capture Mechanisms — equal time tracking, capture risk scoring with 5 thresholds (content share 30%, featured share 25%, dispute asymmetry 3x, badge concentration 40%, vote weight 40%). (3) Perspective Voting — badge-weighted votes with anti-brigading multipliers (organic=1.0, direct_link=0.1), controversy index calculation. (4) Amendment Process — multi-threshold adoption, 8 immutable provisions including Three Columns, Switzerland Protocol, No-Council Principle, and C+20% Floor. 72-hour cooling-off period on amendments. (5) Syndication Workflow — Substack/Medium with CTA blur at 10% driving user acquisition.',
 'Architecture/Governance', 'Session 7E'),

(1534, 'Harper Charter (Appendix H)',
 'Formal charter for Harper Guild operations. Keirsey Temperament integration (Guardian, Artisan, Idealist, Rational) with 50% cap per type to prevent monoculture. Three-tier vouching system: Observer (1 vouch), Analyst (2 vouches from Analysts+), Lead (3 vouches including 1 Lead). Collective removal via Review Panel requiring 2/3 majority from 5+ voting members. Harper scope cap at 30% of any single doctrine scope. 8 defined Red Lines: ad-hominem attacks, Switzerland Protocol violations, doxxing/deanonymizing, edit-warring, brigading, scope-flooding, credential fraud, incitement. Bias tracking with running average and probation triggers. Review panels for disputed decisions.',
 'Architecture/Governance', 'Session 7E')

ON CONFLICT (innovation_number) DO NOTHING;

-- Update the table comment
COMMENT ON TABLE public.innovation_log IS 'Complete verified innovation registry. Contains 1,534 innovations. Sources: Original Behemoth (1-53), Bags 5-10, BATCH files, filings, Feb-Mar 2026 sessions. RANGE: #1-#1534. Next: #1535.';
