-- ============================================================================
-- Session 29b: Bishop Session 012 innovations (renumbered #1691-#1709)
-- Sources: XRAY_FAQ, KICKSTARTER_CAMPAIGN_COPY, CREW_CALL_BOUNTIES, CHARACTER_LORE
-- 19 innovations total
-- ============================================================================

INSERT INTO innovation_log (innovation_number, title, description, category, status, patent_bag)
VALUES
  -- X-Ray / FAQ Content (#1691-#1693)
  (1691, 'X-Ray Hexel Piece Tooltips', '27 interactive X-Ray Goggles tooltip entries explaining each canonical Hexel piece''s function, layer position, mechanical connections, and patent references. Each tooltip links to FAQ, STL download, Piggy-Back submission, and innovation number.', 'ux-design', 'documented', NULL),
  (1692, 'FAQ Deep-Link Architecture', 'Anchor-based FAQ entries for every Hexel piece, linked from X-Ray tooltips and campaign pages. Each piece gets a dedicated FAQ section with question, detailed answer, learn-more URL, and innovation cross-reference tags.', 'ux-design', 'documented', NULL),
  (1693, 'Piece-Level Open Build Integration', 'Download/Piggyback/Innovation links embedded in every X-Ray tooltip. Each of the 27 canonical pieces links to its STL download, Piggy-Back improvement submission form, and patent innovation number — creating a path from curiosity to contribution.', 'ux-design', 'documented', NULL),

  -- Campaign Copy (#1694-#1700)
  (1694, 'Dual-Mode Character Miniatures', 'Rotatable 180-degree base revealing two character evolutions in one miniature. Farmer/Warrior and Healer/Assassin share a pivot point (hoe-handle/sword-handle, staff/blade). Dual-class campaigns (5 and 7) each deliver two characters in one product.', 'manufacturing', 'documented', NULL),
  (1695, 'Mountable Creature System', 'Character-creature magnetic base combination amplifying Hexel mechanism interaction. War Horse (Campaign 8) accepts character snap-on via compliant mechanism clip; combined magnetic field pulls NeedleValves harder and triggers Timing Belts faster.', 'manufacturing', 'documented', NULL),
  (1696, 'King-Class Adjacent Hex Influence', 'Enhanced magnetic array affecting 6 surrounding hexes in addition to current hex. The King''s 7-hex field activates NeedleValves, advances Timing Belts, and opens pneumatic pathways across adjacent tiles — a physical expression of accumulated influence.', 'manufacturing', 'documented', NULL),
  (1697, 'Queen-Class Hydraulic Modulation', 'Pneumatic resonance chamber modulating adjacent hex flow patterns. The Queen''s base creates a standing wave in the hydraulic network that reorients current patterns, shifts wave directions, and changes trade flow — influence vs. the King''s force.', 'manufacturing', 'documented', NULL),
  (1698, 'Chain Backer Dynamic Pricing', 'Tier price reductions unlocked by verified chain length. Campaigns 9+ offer earned loyalty discounts (e.g., 8-link chain = Dynasty tier drops from $200 to $175; 13-link complete chain = Full Table drops from $5,000 to $4,000). System tracks and verifies chain automatically.', 'platform-economics', 'documented', NULL),
  (1699, 'Community-Refined Assembly Launch', 'Complete Hexel assembled from community-improved individual pieces with contributor attribution. Campaign 12 incorporates the best Piggy-Back submissions from Campaigns 1-11. Contributors'' names appear on the pieces they improved.', 'manufacturing', 'documented', NULL),
  (1700, 'Scale-Tiered Water Table Fulfillment', 'Quarter/Half/Full table options allowing backers to enter at their commitment level. Campaign 13 offers 19-Hexel starter ($150), 100-Hexel quarter ($500), 200-Hexel half ($2,000), and full 420-Hexel table ($5,000). Each tier is a functional product.', 'platform-economics', 'documented', NULL),

  -- Crew Call Bounties (#1701-#1703)
  (1701, 'Structured Bounty Specification Format', 'Standardized bounty template with problem statement, 5 deliverables, 5-point STAMP criteria, XP calculation formula (base × quality_score / 5.0), context document references, and Primary/Secondary/Backup assignment structure. Process Pioneer bonus for first completions.', 'platform-economics', 'documented', NULL),
  (1702, 'Pneumatic Plant Growth Bounty', 'Engineering bounty targeting the pneumatic power chain: telescoping ratchet mechanism for Hexel-powered plant growth at 60mm scale. 3-segment nested extension under 2.17 PSI, ratchet-click locking, frond deployment, and Flying Flower palm-twist launch.', 'manufacturing', 'documented', NULL),
  (1703, 'Compliant Mechanism Fatigue Bounty', 'Material science bounty for SlottedTop flex-grip snap lock durability testing. Test fixture design for repeatable cycle testing, 3-material comparison matrix (SLA tough resin, ABS injection, TPU), creep assessment at 100/500/1000/5000 cycles, failure mode analysis.', 'manufacturing', 'documented', NULL),

  -- Character Lore (#1704-#1709)
  (1704, 'Dual-Path Character Progression Narrative', 'Two parallel 4-character story arcs with escalating mechanical interaction tiers. Sword Path: Peasant→Farmer→Warrior→King (land mastery). Crown Path: Merchant→Healer→Assassin→Queen (system mastery). Each character has full lore, traits, quotes, and visual tells.', 'ux-design', 'documented', NULL),
  (1705, 'Character-Hexel Mechanical Interaction Tiers', 'Basic (single NeedleValve trigger) → Intermediate (trigger + pneumatic/trap activation) → Advanced (multi-hex influence) progression tied to character evolution. Each tier unlocks deeper board interaction, creating physical gameplay progression.', 'manufacturing', 'documented', NULL),
  (1706, 'Character Interaction Matrix', 'Combinatorial gameplay effects when characters from different paths occupy same/adjacent hexes. 8 key combinations: Farmer+Warrior (grow+defend), Healer+Assassin (equilibrium), King+Queen (full spectrum), Warrior+Assassin (lethal), Farmer+Healer (sanctuary), etc.', 'ux-design', 'documented', NULL),
  (1707, 'Healer Counter-Mechanism', 'Pneumatic pathway restoration and Timing Belt deceleration as mechanical counterbalance to Warrior/Assassin trap acceleration. Roots that were closed from trap damage reopen; Timing Belts that were advancing toward trap activation slow their count.', 'manufacturing', 'documented', NULL),
  (1708, 'Queen Pneumatic Resonance', 'Standing wave creation in hydraulic network that reorients adjacent hex flow patterns. Distinct from King''s magnetic force approach — Queen modulates the medium itself rather than overpowering individual mechanisms. Adjacent hex current patterns shift toward the Queen.', 'manufacturing', 'documented', NULL),
  (1709, 'Character-as-Cooperative-Metaphor', 'Sword Path = Steward (producer who works the land, grows the harvest, defends, and earns authority through demonstrated capability). Crown Path = TasteMaker (connector who discovers quality, propagates trust, and earns influence through demonstrated judgment). Both necessary.', 'ux-design', 'documented', NULL)
ON CONFLICT (innovation_number) DO NOTHING;

-- Update canonical count 1690 → 1709
UPDATE platform_canonical SET value = '1709', updated_at = NOW() WHERE key = 'innovation_count';
