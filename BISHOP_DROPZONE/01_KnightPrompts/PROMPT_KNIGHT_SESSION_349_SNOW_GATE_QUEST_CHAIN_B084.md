# K349: Snow Gate Quest Chain — The Path to the Northern Province
# Priority: HIGH — the game layer that makes the Snow Gate meaningful
# Bishop: B084 | Date: 2026-04-06

## OVERVIEW

The Snow Gate is not just a level check. It's a multi-step puzzle quest that uses real platform systems (Durin's Doors, Babylon Candles, Golden Keys, Treasure Maps, Deck Cards, Beacons) to create a discovery path through the platform's own content.

The Snow Gate Deck Card is the centerpiece. It has the Defense Klaus image. It responds to hover and click with X-ray state changes and cryptic clues. Those clues begin a quest chain that weaves through papers, archives, the Labyrinth, Guild Towers, and island geography.

## PHASE 1: Snow Gate Deck Card — 3-State Interaction

### Card States

Create/update the Snow Gate Deck Card component with three visual states:

**State 1 — Default (not touched)**
- Defense Klaus shield image (use existing DK branding)
- 12 lock icons visible around the border (6 corners + 6 sides)
- Lock types shown: 2× Marks locks, 2× Credits locks, 2× Joules locks, 2× Golden Key locks, 2× Deck Card locks, 2× Level locks
- Faint northern shimmer (#b8d4e3) around edges
- Text: "The Snow Gate" in ice-blue serif

**State 2 — Hover (X-ray OFF)**
- Defense Klaus FADES OUT, **Denken appears** with goggles DOWN (`/images/reserve-denken/denken-correct-xray-off.png`)
- The visual transition hints: behind the shield, a philosopher waits
- Cryptic Clue #1 appears as shimmer text:
  > "The Lighthouse shows the way, but the Ladder reaches higher. Drink from Paper Three to quench your thirst for what Self-Funding truly means."
- This clue points to: **Paper #3 "Self-Funding Economics"** (aka "The Lighthouse Ladder")
- Reading that paper fully (tracked via `paper_read_completions`) reveals a hidden Golden Key embedded in the conclusion

**State 3 — Click (X-ray ON)**
- **Denken** with goggles ON in full thermal/X-ray mode (`/images/reserve-denken/denken-correct-xray-on.png`)
- Cryptic Clue #2 appears:
  > "Six threads of light, seven sections of wax. The Candle remembers every island it has touched. Collect the fragments where the Judges deliberate."
- This clue points to: Collect **7 Babylon Candle fragments** from completing Star Chamber case reviews
- Each Star Chamber case you vote on drops 1 candle fragment (tracked via `candle_burst_pairs`)
- 7 fragments = 1 complete Babylon Candle = portal capability

**Back of Card (flip mechanic)**
When the card is flipped (existing flip mechanic in Deck Card system):
- Shows a treasure map fragment
- Text: "The Crow who nests highest sees farthest. Follow the beacon that was set before you arrived."
- Below: A miniature map showing the northward path with landmarks
- Shows lock progress: "X of 12 locks opened"

## PHASE 2: The Quest Chain (12 Locks)

Each lock corresponds to a real platform achievement. The member doesn't need to do them in order — they can discover and complete them organically. But together they form a coherent journey through the platform.

### Corner Locks (6)

**Lock 1: The Lighthouse (Paper Reading)**
- Complete reading of Paper #3 "Self-Funding Economics" (the clue from State 2)
- Verification: `paper_read_completions` WHERE paper = 'self-funding-economics'
- Reward: Golden Key + Lock 1 opens

**Lock 2: The Four Judges (Star Chamber Participation)**
- Cast votes on 4 Star Chamber cases (any cases)
- Verification: `star_chamber_verdicts` COUNT >= 4
- Reward: 1st Babylon Candle fragment + Lock 2 opens

**Lock 3: The Cornerstone (Boaz Contribution)**
- Make a Corner Contribution on any project (the Boaz Principle)
- Verification: `gleaners_distributions` WHERE contributor = user
- Reward: "Cornerstone" badge + Lock 3 opens

**Lock 4: The Spyglass (Crow's Nest Mastery)**
- Discover 20+ items in the Crow's Nest catalog
- Verification: `discovery_gates` COUNT >= 20
- Reward: Crow's Nest Spyglass Deck Card + Lock 4 opens

**Lock 5: The Forge (Create Something)**
- Complete at least 1 project through the Production Level system (reach "Iron" stage)
- Verification: `production_campaigns` WHERE stage >= 'iron'
- Reward: Forgemaster badge + Lock 5 opens

**Lock 6: The Bridge (Sponsor Someone)**
- Sponsor another member via Cue Card or Sponsorship system
- Verification: `sponsorship_attributions` WHERE sponsor = user
- Reward: Bridge Builder Deck Card + Lock 6 opens

### Side Locks (6)

**Lock 7: The Labyrinth Key (Bug Hunt)**
- Report and verify 3 bugs through the QA/error reporting system
- Verification: `error_reports` WHERE reporter = user AND status = 'verified', COUNT >= 3
- Reward: Labyrinth Key (opens Guild Tower basement) + Lock 7 opens

**Lock 8: The Beacon Trail (Navigation)**
- Drop beacons on 6 different pages (one of each color)
- Verification: `beacons` WHERE user = user, 6 distinct `beacon_color` values
- Reward: Morpheus Beacon (special beacon that other users can follow) + Lock 8 opens

**Lock 9: The Durin Door (Password Discovery)**
- Solve 3 Durin's Door passwords across different locations
- Verification: `durins_door_configs` + user completion records
- Reward: "Friend of Durin" badge + Lock 9 opens

**Lock 10: The Candle Complete (7 Fragments)**
- Collect all 7 Babylon Candle fragments (from Star Chamber + various activities)
- Fragment sources: 4 from Star Chamber votes (Lock 2 gives 1st), 1 from reading a Pudding series, 1 from completing a Treasure Map, 1 from the Alcove Hallway
- Verification: `candle_burst_pairs` fragment count >= 7
- Reward: Complete Babylon Candle (portal capability) + Lock 10 opens

**Lock 11: The Mirror Room (Self-Assessment)**
- Complete an ADAPT Score self-assessment
- Verification: `adapt_scores` WHERE user = user EXISTS
- Reward: "Mirror" Deck Card (shows your own stats reflected) + Lock 11 opens

**Lock 12: The Two Mirrors (Reciprocity)**
- Both GIVE and RECEIVE a peer review/recommendation
- Verification: `peer_contracts` or `review_history` WHERE user appears as both reviewer and reviewed
- Reward: "Two Mirrors" Deck Card + final Lock 12 opens

## PHASE 3: The Morpheus Path (Walk-Around Route)

For members who haven't opened the Snow Gate yet, there's a "walk around" path:

1. The Crow's Nest treasure map shows a winding path AROUND the Snow Gate pedestal
2. Following it leads to a scenic overlook where you can SEE the Northern Province (preview of what's inside)
3. A Morpheus Beacon (set by the system, not a user) marks this path
4. At the overlook, a sign reads: "What lies beyond the Snow Gate is not hidden. It is waiting. The 12 locks are not barriers — they are proof you understand what you are entering."
5. From here, the member can see:
   - Titles of the Galactic Empire documents
   - Innovation count sourced from Northern Province content
   - Denken mascot visible in the distance (shimmer effect)
   - But cannot interact or read the content

## PHASE 4: The Portal Sequence (After All 12 Locks)

When all 12 locks are complete:

1. The Snow Gate card glows — all 12 lock icons turn gold
2. The Babylon Candle activates — portal animation
3. The member is transported to the Northern Province landing page
4. Mascot switches from LRH to Denken
5. Visual theme shifts to ice-blue
6. A welcome message: "The hen showed you the way. The philosopher shows you what it means."
7. First-visit reward: "Snow Gate Pioneer" Deck Card (Mythic rarity)

## PHASE 5: The Guild Tower Basement (Labyrinth)

Lock 7 awards the Labyrinth Key. This opens the Guild Tower basement:

- Route: `/guilds/:guildId/labyrinth` (or `/northern/labyrinth`)
- The Labyrinth is Innovation #2170 (Gamified IDE)
- It's a CSS maze rendered from the guild's actual codebase/project structure
- Functions are corridors, bugs are minotaurs, deployments are escapes
- Completing a Labyrinth run earns Credits + contributes to the guild's QA score

## IMPLEMENTATION NOTES

### Supabase Schema Additions

```sql
-- Snow Gate lock progress per user
CREATE TABLE IF NOT EXISTS snow_gate_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  lock_number INTEGER NOT NULL CHECK (lock_number BETWEEN 1 AND 12),
  lock_name TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, lock_number)
);

-- Babylon Candle fragments per user
CREATE TABLE IF NOT EXISTS babylon_candle_fragments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  fragment_number INTEGER NOT NULL CHECK (fragment_number BETWEEN 1 AND 7),
  source TEXT NOT NULL, -- 'star_chamber', 'pudding_series', 'treasure_map', 'alcove'
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fragment_number)
);

-- Morpheus Beacon (system-set beacon for the walk-around path)
INSERT INTO beacons (name, beacon_color, location_path, page_title, notes)
VALUES ('Morpheus Path', 'purple', '/northern/overlook', 'Northern Province Overlook',
        'Follow this beacon to see what waits beyond the Snow Gate.');
```

### Component: SnowGateDeckCard.tsx

```tsx
// Three-state card with Defense Klaus imagery
// Hover: X-ray OFF + Clue 1
// Click: X-ray ON + Clue 2
// Flip: Treasure map + lock progress
// Props: lockProgress (from snow_gate_progress), candleFragments (count)
```

### Hook: useSnowGateProgress.ts

```tsx
// Queries snow_gate_progress for current user
// Checks each lock condition against real platform tables
// Returns: { locks: boolean[12], totalCompleted: number, candleFragments: number, hasAccess: boolean }
```

## REFERENCE

- Durin's Door: `platform/src/lib/durinsDoor.ts` + `platform/src/hooks/useDurinsDoor.ts`
- Babylon Candles: `platform/src/components/atti/CandleBurst.tsx` + `candle_burst_pairs` table
- Golden Keys: `glowing_keys` table + `platform/src/data/questDeckCards.ts`
- Treasure Maps: `treasure_maps` table + `platform/src/data/wildfireRuns.ts`
- Beacons: `beacons` table + `platform/src/components/BeaconDropButton.tsx`
- Deck Cards: `platform/src/styles/landing.css` (.deck-card-frame with 4 locks)
- Star Chamber: `star_chamber_cases` + `star_chamber_verdicts`
- ADAPT Scores: `adapt_scores` table
- Paper Reading: `paper_read_completions` table
- Snow Gate: `platform/src/lib/hexFounderKeep.ts` (level 60 + 12 locks)
- KeepsLobby: `platform/src/pages/cue-cards/KeepsLobby.tsx`

## PAPERS REFERENCED IN CLUES

- Paper #3: "Self-Funding Economics" — the "Lighthouse Ladder" / "drink from Paper Three"
- All clues reference REAL platform content that members must discover and engage with

## TONE

The clues should feel like Myst puzzles meets Tolkien riddles — not tutorial text. The member should feel like they're discovering secrets, not completing a checklist. The 12 locks are achievements that happen naturally as they USE the platform. The Snow Gate quest is the thread that connects them.
