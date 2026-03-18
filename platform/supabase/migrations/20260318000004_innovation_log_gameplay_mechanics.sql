-- ============================================================================
-- Migration: HexIsle Gameplay Mechanics Innovations #1740-#1748
-- Source: Founder Session with Bishop 012 (continued) — March 18, 2026
-- Terrain modification, alliance cairns, combat mechanics, equipment economy
-- ============================================================================

INSERT INTO innovation_log (innovation_number, title, description, category, status, patent_bag)
VALUES
(1740, 'Twist-Unlock Terrain Modification During Gameplay',
 'A system comprises: (1) all hexel terrain components attached from above via twist-lock mechanism, (2) a gameplay action wherein a player character equipped with a shovel or pickax can uproot terrain pieces by twist-unlocking them during play, exposing the hydraulic, pneumatic, and gear mechanisms underneath, (3) construction actions including fortification, monster placement, trap setting, and foundation building using the exposed mechanical layer, and (4) integration with the 12-action turn economy wherein terrain modification consumes actions — wherein the system enables real-time battlefield engineering during gameplay without disrupting adjacent terrain, mirroring real construction where you dig in one spot without affecting the surrounding landscape, all driven by the same twist-lock mechanism used for initial board assembly.',
 'Gaming', 'documented', NULL),

(1741, 'Truce/Alliance Cairn with Shield Mount System',
 'A system comprises: (1) a physical cairn piece resembling stacked rocks made from vertically stacked coin rolls, (2) shield mounts on all 6 hexagonal faces allowing 2 to 6 players to display their Brand Mark shields as alliance participants, (3) a treaty mechanic wherein one shield on a face indicates truce and additional shields from other players formalize alliance, (4) cairn placement on a single hexel between player territories at a mutually agreed location, (5) dual function as treaty indicator AND secure cache for weapons and coins stored inside, and (6) an initiation protocol wherein the proposing player places a cairn with optional coins and at least one shield on the outer edge of their territory — wherein the system creates visible, physical diplomacy where alliances are literally built and can be seen by every player at the table, with the cairn serving simultaneously as peace treaty, shared treasury, and strategic asset.',
 'Gaming', 'documented', NULL),

(1742, 'Cairn as Defensible Vault with Shield Durability',
 'A system comprises: (1) cairn shields that function as defensive barriers requiring enemy attack to breach, (2) shield durability determined by coins placed in shield slots (no coin = dead/unusable shield), (3) escalating defense strength proportional to number of active shields on the cairn (more shields = harder to attack successfully), (4) breach reward wherein a successfully attacked cairn yields all coins stored inside to the attacker, and (5) a risk/reward calculation where more coins stored increases both the value of the target and the defensive investment needed — wherein the system creates a physical vault mechanic where defensive strength, stored value, and breach reward are all visible and tangible, requiring no bookkeeping or hidden information.',
 'Gaming', 'documented', NULL),

(1743, 'Brand Mark Equipment Personalization',
 'A system comprises: (1) all equipment ordered by a player bearing that player''s personal Brand Mark emblems (shields, weapons, armor, horse equipment), (2) visual identification of equipment provenance wherein looted enemy equipment retains the defeated player''s Brand Mark — making it visible to all that the wielder is using captured gear, (3) a social-mechanical layer wherein brand visibility communicates combat history and territorial conquest — wherein the system transforms equipment into a narrative artifact where every piece tells a story of who made it, who carried it, and who took it, all communicated through physical markings without any rulebook or stat tracking.',
 'Gaming', 'documented', NULL),

(1744, 'Coin-Strength Equipment Slot Durability',
 'A system comprises: (1) equipment armory slots that accept coins to determine the equipment''s operational strength and durability, (2) a coin-as-durability mechanic wherein each coin in an equipment slot absorbs one hit before being discarded (two 1-coins in a shield = shield takes 2 hits then is spent), (3) zero-coin equipment rendered unusable (dead shield) until re-coined, (4) defeated enemy equipment requiring the winner''s own coins to activate for use, and (5) equipment ransom wherein defeated (supine) players can offer coins to the winner to buy back their equipment — wherein the system unifies the economic and combat layers so that every piece of equipment is simultaneously an inventory item, a combat asset, and a financial instrument, all tracked by the physical presence or absence of coins.',
 'Gaming', 'documented', NULL),

(1745, 'Attack Pattern Wheel with Level-Based Hit/Miss Sequence',
 'A system comprises: (1) a continuous rotating attack wheel built into the character overlay, activated by pushing an attack button on the front face (above the coin ejection slot), (2) a level-determined hit/miss pattern displayed as filled (hit) or blank (miss) sections on the wheel — Level 1: miss-miss-hit (1 in 3); Level 3: hit-miss-hit (2 in 3); scaling through Level XII, (3) attack cost via the same coin-consumption mechanic as HP (abstracting arrow cost, food for melee, and general attrition into unified attack currency), and (4) a continuous wheel that does NOT reset between turns, maintaining position across the entire game — wherein the system creates deterministic-yet-unpredictable combat where the pattern is known but the current wheel position creates tactical uncertainty, and all attack capability is physically visible on the miniature.',
 'Gaming', 'documented', NULL),

(1746, 'Level-Gated Target Selection (Attacker vs Defender Picks)',
 'A system comprises: (1) a target selection mechanic wherein combat level determines WHO chooses where a hit lands, (2) Level 1 disadvantage: the DEFENDER picks where the attacker''s hit lands (helmet, shield, leg, horse, etc.), (3) Level 3+ advantage: the ATTACKER picks where to hit the defender, and (4) scaling advantage through levels wherein higher-level attackers gain progressively more control over hit placement — wherein the system creates a meaningful level progression beyond raw damage, where combat skill is expressed as tactical precision (choosing where to strike) rather than just hitting harder, and the mechanic requires zero rules lookup since the level overlay''s Roman numeral tells both players who picks.',
 'Gaming', 'documented', NULL),

(1747, 'Attack Wheel Pre-Spending (Arrow Economy Manipulation)',
 'A system comprises: (1) the ability to intentionally expend attacks on non-combat targets (e.g., shooting arrows at a tree) to advance the attack wheel to a desired position, (2) strategic manipulation wherein a Level 1 archer on a miss-miss-hit pattern fires 2 arrows at a tree to guarantee the next shot hits, (3) a cost-benefit trade-off where pre-spent attacks consume coins/resources from the attack wheel''s fuel system, and (4) a multi-unit complexity layer wherein managing 12 archers'' individual wheel positions creates an optional depth of tactical tracking (players can meticulously track each wheel or let outcomes play out naturally) — wherein the system creates emergent tactical depth from a simple mechanical wheel, enabling both casual play (just push and see what happens) and deep strategic play (carefully managing wheel positions across multiple units).',
 'Gaming', 'documented', NULL),

(1748, 'Equipment Ransom and Spoils Economy',
 'A system comprises: (1) defeated (supine) characters retaining all equipment and weapons physically on their miniature, (2) a spoils mechanic wherein the victor can claim any equipment from the defeated character but must supply their own coins to activate it (equipment without coin = unusable), (3) a ransom mechanic wherein the defeated player can offer coins to the winner to buy back specific equipment pieces, (4) strategic valuation based on the coin-strength already invested in equipment (a 6-coin-strong armor piece is worth more to ransom than a 1-coin piece), and (5) equipment provenance tracking via Brand Marks showing original ownership — wherein the system creates a post-combat economy where defeat is not total elimination but a negotiation phase, equipment has tangible trade value based on its coin investment, and the physical state of the miniature (what''s still on it, what coins remain) serves as the complete ledger of what''s at stake.',
 'Gaming', 'documented', NULL);

-- Canonical count: 1,739 → 1,748
-- Code-side pollination handles the display count across all source files.
