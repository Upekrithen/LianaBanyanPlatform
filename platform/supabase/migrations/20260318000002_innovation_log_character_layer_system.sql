-- ============================================================================
-- Session 30+: Character Layer System innovations (#1720-#1730)
-- Source: CHARACTER_LAYER_SYSTEM_FOUNDER_CANONICAL.md (Bishop Session 012)
-- FOUNDER DIRECTIVE — Overrides earlier Character Progression Lore
-- 11 innovations total
-- ============================================================================

INSERT INTO innovation_log (innovation_number, title, description, category, status, patent_bag)
VALUES
  (1720, 'Physical Layer Equipment System', 'Characters progress by snapping physical layers onto the same base body using compliant mechanism clips. Peasant body IS Farmer body IS Warrior body IS King body. What changes is what is ON it. NOT separate miniatures. NOT dual-mode rotation.', 'game-design', 'documented', NULL),
  (1721, 'ScaleMail from Monster Fish', 'First armor layer crafted from harvested scales of monster fish caught through farming-to-fishing progression. NOT chainmail. Farming skill unlocks fishing skill, fishing catches monster fish, scales harvested and fashioned at smithy into ScaleMail that snaps over body tunic.', 'game-design', 'documented', NULL),
  (1722, 'Terrain Armor Biome Set', '8 biome-specific armor types earned by completing each Island: Flame Armor (Lava Lands — KEY progression piece, unlocks molten lava fire source), Frost Armor (Ice), Bark/Vine (Forest), Sand (Desert), Coral (Ocean), Mud (Swamp), Stone (Mountain), Crystal (Caves). Each snaps onto body over ScaleMail.', 'game-design', 'documented', NULL),
  (1723, 'Tool Crafting Chain', 'Sequential tool progression where each tool unlocks the next: Stick (found) → Staff (crafted) → Hoe (reshape) → Shovel (wider) → Bow (bent wood + sinew) → dig ore → Campfire → Oven → Axe head → Axe → Rocks + labor = Smithy → Anvil → ALL metal items (weapons, tools, armor components).', 'game-design', 'documented', NULL),
  (1724, 'Horse Layer Progression', 'Same horse body progresses through equipment addition/removal: WildHorse (bare) → add Bridle = Tamed → add Saddle/Yoke + Cart = FarmHorse → remove Cart + Yoke, add proper Saddle + Armor = WarHorse. Horse uses identical snap-on layer system as characters.', 'game-design', 'documented', NULL),
  (1725, 'Merchant Cloak Reveal Mechanic', 'Removing the Merchant''s Cloak physically reveals the Assassin beneath. Crown Path progression through SUBTRACTION (opposite of Sword Path''s additive layers). Cloak ON = Merchant (trading, legitimate). Cloak OFF = Assassin (concealed weapons visible).', 'game-design', 'documented', NULL),
  (1726, 'Crafting Resource Chain from Hexel Terrain', 'Natural resources sourced from specific Hexel terrain types: Sticks (forest hexes), Stones (mountain/cave), Ore (underground, requires Shovel), Fish (ocean, requires rod/net), Herbs (forest/meadow), Scales (monster fish), Earth/Clay (any land hex), Lava (lava hexes — shortcut fire source). Creates terrain-dependent crafting requiring Island exploration.', 'game-design', 'documented', NULL),
  (1727, 'Flame Armor Shortcut', 'Lava Lands Flame Armor grants access to molten lava as advanced fire source, bypassing the Campfire → Oven → basic metalwork chain. With molten fire: helmets, horse armor, siege engines, full armory all become craftable. KEY progression piece that accelerates mid-to-late game.', 'game-design', 'documented', NULL),
  (1728, 'Queen Fiery Wings + Crown Helmet', 'Crown Path capstone earned through Orb of Wisdom collection across Islands plus full Island clue chain. Fiery Wings snap onto back (dramatic visual — merchant cloak now has wings). Crown Helmet physically distinct from King''s Crown (wisdom-earned vs. conquest-earned).', 'game-design', 'documented', NULL),
  (1729, 'Open Progression Any-Path-to-Magic', 'Any character class can pursue magic directly — Peasant can seek magic, Merchant can seek magic. Founder''s canonical progression routes through physical/craft mastery first, but game allows any route. Magic items are their own equipment layer addable at any point.', 'game-design', 'documented', NULL),
  (1730, 'Progressive Complete Fulfillment with Retroactive Upgrade Parts', 'Each character campaign ships a complete body with ALL layers through that stage (no prior purchase required). Individual new parts release simultaneously for upgrading previously purchased bodies. Must own complete set before ordering extra parts. Creates 4-body evolution display for chain backers (Peasant → Farmer → Warrior → King or Merchant → Assassin → Healer → Queen).', 'business-model', 'documented', NULL)
ON CONFLICT (innovation_number) DO NOTHING;

-- Update canonical count 1719 → 1730
UPDATE platform_canonical SET value = '1730', updated_at = NOW() WHERE key = 'innovation_count';
