-- ============================================================================
-- Migration: Hitbase Counter System Detail Innovations #1731-#1739
-- Source: Founder Session with Bishop 012 (continued) — March 18, 2026
-- These expand on existing #1579-#1583 with mechanical details revealed by Founder
-- ============================================================================

INSERT INTO innovation_log (innovation_number, title, description, category, status, patent_bag)
VALUES
(1731, 'Pez-Style Coin-Loading HP Fuel System',
 'A system comprises: (1) a vertical coin-loading recess within the character boot base accepting stackable game coins, (2) a mechanical stopping tooth that halts counter rotation after one full revolution per coin, (3) a coin ejection mechanism wherein the topmost coin is expelled from the front of the base (Pez dispenser style) when its corresponding rotation completes, and (4) a state termination condition wherein absence of loaded coins prevents the stopping tooth from being cleared, halting the counter permanently until resupply — wherein the system creates a physical fuel economy for hit points where each coin literally powers one rotation of the damage counter, coins visibly deplete during combat, and the character falls supine when fuel is exhausted.',
 'Gaming', 'documented', NULL),

(1732, 'Coin Denomination Seating Depth',
 'A system comprises: (1) a vertical coin recess with depth-indexed seating positions, (2) coin denominations with corresponding physical profiles that determine maximum insertion depth — a 6-denomination coin seats at the bottom of the recess (allowing 6 total coins stacked above), while a 1-denomination coin seats at the top (allowing only 3 total coins), (3) hole/notch patterns on each coin face corresponding to protruding coin-catcher features rising from the recess bottom, wherein higher-denomination coins have more matching holes/notches allowing deeper seating — wherein the system physically gates maximum HP capacity by coin denomination, making resource management a tangible stacking puzzle rather than abstract number tracking.',
 'Gaming', 'documented', NULL),

(1733, 'Dice-Face Protrusion-Hole Terrain Geometry',
 'A system comprises: (1) terrain hexel surfaces with hole patterns arranged in standard die-face configurations (1 through 6 holes positioned like a six-sided die), (2) character boot bases with protrusion patterns (1-prong, 3-prong, 3-in-a-diagonal, etc.) that must physically fit into terrain holes for the piece to stand, (3) gravity-enforced incompatibility wherein mismatched protrusion-hole combinations cause the piece to fall over like a sharpened pencil on a flat table, and (4) a combinatorial compatibility matrix — e.g., a 3-prong boot fits 4-hole terrain (3 of 4 corners match) and 5-hole terrain, but a 3-diagonal boot fails on 5-hole terrain (middle matches but outer two do not); a 1-prong boot fits 1, 3, or 5-hole terrain but not 4-hole — wherein the system enforces complex unit-terrain restrictions through dice-face geometry alone, superseding named-shape root configurations with richer combinatorial possibilities.',
 'Gaming', 'documented', NULL),

(1734, 'Middle-Hole Shape Terrain-Type Cross-Compatibility',
 'A system comprises: (1) a central middle hole on coins and terrain hexels shaped as one of three geometric primitives — circle, triangle, or square, (2) a directional compatibility matrix wherein circle-hole coins fit on triangle-hole terrain but NOT square-hole terrain, square-hole coins do NOT fit on triangle-hole terrain, and triangle-hole coins fit NEITHER circle-hole nor square-hole terrain, (3) terrain-type encoding wherein the middle hole shape represents biome category (e.g., lava boots with one shape work on normal land but not water, which uses a different shape from the same 1/3/5 hole family) — wherein the system creates natural biome restrictions through geometric shape-fitting rather than rules, enabling terrain-type gameplay (fire/water/earth) to emerge from physical compatibility without any rulebook.',
 'Gaming', 'documented', NULL),

(1735, 'Coin Notch Denomination System',
 'A system comprises: (1) notches along each side of a game coin replacing or supplementing traditional hole patterns, (2) a shaped middle hole (circle, triangle, or square) providing terrain-type identity, (3) a combinatorial denomination space wherein the number of side-notches PLUS the middle-hole shape uniquely identify each coin denomination and terrain compatibility — wherein the system creates a large variety of distinct coin types from simple geometric features (notch count × hole shape), enabling rich economic and terrain gameplay without requiring printed numbers, colors, or any literacy to distinguish denominations.',
 'Gaming', 'documented', NULL),

(1736, 'Twist-Lock Bayonet Overlay Mount',
 'A system comprises: (1) a character boot base with bayonet-mount receptacle geometry, (2) a Rucksack overlay (level/equipment carrier) that attaches by placing down onto the boot base and twisting to lock (quarter-turn bayonet engagement), (3) a character figure that sits on top of the locked overlay assembly, and (4) a sequential assembly order — load coins into boot base FIRST, then twist-lock the overlay, then place character — wherein the system requires physical disassembly to change overlays (level up), creating a gameplay constraint that leveling cannot occur in the field without returning to a designated Armory location.',
 'Gaming', 'documented', NULL),

(1737, 'Roman Numeral Level Display with Scabbard Weapon Slots',
 'A system comprises: (1) a hexagonal Rucksack overlay emblazoned with Roman numerals (II through XII) on all six outward-facing sides providing 360-degree level visibility to all players at the table, (2) scabbard-style vertical slots of varying depths sized to hold specific weapon miniatures upright (broadsword, spear, staff, longbow, crossbow, round shield, empire shield, etc.), (3) a level-gated slot count wherein higher-level overlays contain progressively more weapon slots, and (4) a visual-is-canonical principle wherein the weapons physically present in the overlay ARE the character inventory — no separate tracking required — wherein the system makes every character a self-documenting game piece: level (Roman numeral), available weapons (slotted in), current weapon (in hand), and hit points (coins in boots) are all physically visible without stat cards, character sheets, or digital aids.',
 'Gaming', 'documented', NULL),

(1738, 'Armory-Only Leveling with Field Promotion Exception',
 'A system comprises: (1) a physical assembly requirement (twist-lock bayonet mount) that mechanically prevents overlay swapping without full disassembly, (2) a gameplay rule emerging from physical design wherein characters must return to a designated Armory hexel to level up (remove character, twist-off old overlay, insert higher-level overlay, reassemble), (3) a rare Field Promotion exception mechanic allowing in-field leveling under special game conditions, and (4) a logistics gameplay layer wherein Armory access, supply lines, and retreat routes become strategically significant — wherein the system derives a meaningful gameplay constraint directly from the physical mechanism rather than imposing it as an arbitrary rule, making the restriction feel natural and self-enforcing.',
 'Gaming', 'documented', NULL),

(1739, '12-Action Turn Economy with Weapon Swap Cost',
 'A system comprises: (1) a fixed budget of 12 actions per player per turn, (2) a weapon-swap action cost wherein changing the weapon held in a character''s hand (moving it from scabbard slot to hand position) consumes one of the 12 available actions, (3) a tactical tension between versatility (carrying many weapons in a high-level overlay) and efficiency (each swap costs precious actions), and (4) integration with the physical overlay system wherein the number of available weapon slots (level-dependent) and the in-hand weapon are both physically visible to all players — wherein the system creates deep tactical decision-making around loadout management where the physical state of the miniature communicates the full action economy to every player at the table.',
 'Gaming', 'documented', NULL);

-- Update canonical count: 1,730 → 1,739
-- Update canonical count: 1,730 → 1,739
-- Note: platform_canonical may not exist in all environments; the code-side
-- pollination (useCanonicalStats, etc.) is the primary source of truth.
