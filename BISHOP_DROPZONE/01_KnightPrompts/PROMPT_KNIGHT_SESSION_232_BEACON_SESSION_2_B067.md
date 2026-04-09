# KNIGHT SESSION 232 — Beacon Domain v2: Session 2 (9 Stub Implementations)
## Priority: MEDIUM | Complexity: MEDIUM-HIGH
## Prerequisite: K227 (Beacon v2 Phase 1 — structure + stubs DONE), K231 (deployed)

---

## CONTEXT

K227 migrated the Beacon domain to v2 structure and created 9 stub components (empty `export {}` files with TODO comments). This session implements all 9 stubs by porting logic from the v1 originals, adapting imports to v2 paths, and preserving all existing functionality.

**Firebase deploy of K231 is CONFIRMED** — all 8 targets live as of April 3, 2026.

---

## THE 9 STUBS TO IMPLEMENT

All stubs are in `platform-v2/src/domains/beacon/components/`.

### Beacon Components (5 files)

#### 1. `beacon/AnchorSystem.tsx` (v1: 786 lines)
**Source:** `platform/src/components/AnchorBeaconSystem.tsx`
**What it does:** Multi-account social dispatch system — drop anchor beacons on pages to share context-linked cue cards via social platforms with scheduling.
**Key exports:** `AnchorBeacon`, `CueCardDispatchDialog`, `InfoFlipCard`, `AnchorBeaconExplainer`, `DEFAULT_DISPATCH_CHANNELS`
**Key features:**
- Multi-account selection (up to 6 per platform: Twitter, LinkedIn, Facebook, Bluesky, Threads, TikTok, Instagram)
- Card navigation (prev/next)
- Custom message composition
- Email, SMS, copy-link dispatch channels
- Schedule dispatch (date/time picker)
- Accordion-based info flip cards with embedded anchors
**External deps:** `getAllAccounts`, `postToMultipleAccounts` from social OAuth lib, sonner toast
**Supabase:** None (uses OAuth lib)

#### 2. `beacon/DropButton.tsx` (v1: 531 lines)
**Source:** `platform/src/components/BeaconDropButton.tsx`
**What it does:** Six-color beacon system with Orange Protocol for user-defined purposes.
**Key exports:** `BeaconDropButton`, `BEACON_COLORS`, `ORANGE_SUBTYPES`
**Key features:**
- 6 colors: Green (Return), Blue (Important), Yellow (Decision), Red (Blocked), Purple (Complete), Orange (Custom)
- Orange Protocol: 8 subtypes (game_marker, share_person, social_cue, gift, treasure, learning, trade_route, custom)
- Multi-step flow: onboarding -> color -> orange subtype -> details
- Ghost Mode indicator
- localStorage onboarding flag
**Supabase:** `beacons` table — INSERT (user_id, name, icon, beacon_type, beacon_color, location_path, notes, beacon_number, orange_subtype, orange_payload)

#### 3. `beacon/LanternCard.tsx` (v1: 394 lines)
**Source:** `platform/src/components/BeaconLanternCard.tsx`
**What it does:** Draggable flip card for quick beacon color selection, floats on-screen.
**Key exports:** `BeaconLanternCard`
**Key features:**
- Draggable positioning with bounds checking (saves to localStorage: `lb_lantern_position`, `lb_lantern_visible`, `lb_lantern_minimized`)
- 3D flip animation (front: color selector, back: explanation)
- Minimize to corner icon
- Color emoji display
- "Share as Cue Card" and navigation buttons
**Supabase:** None (localStorage only)

#### 4. `beacon/Leaderboard.tsx` (v1: 291 lines)
**Source:** `platform/src/components/BeaconRunLeaderboard.tsx`
**What it does:** Ranked leaderboard of Beacon Run completions with fastest times and crow feather tracking.
**Key exports:** `BeaconRunLeaderboard`
**Key features:**
- Global stats tab (total runs, completions, fastest time, most popular)
- Speed leaderboard ranked with medals
- Crow Feathers tab with achievement tracking
- Ghost Mode Only badge
- Dark theme styling
**Supabase:** `beacon_run_progress` (SELECT with JOIN to profiles, beacon_runs), `beacon_runs` (SELECT)
**External deps:** `formatCompletionTime`, `getBeaconRunCrowFeathers` from ghostWorld lib

#### 5. `beacon/RunGame.tsx` (v1: 556 lines)
**Source:** `platform/src/components/BeaconRunGame.tsx`
**What it does:** Complete Beacon Run game system — creation, card display, active run timer, progress tracking.
**Key exports:** `BeaconRunCard`, `BeaconRunCreator`, `ActiveRunTracker`, `formatTime`
**Key features:**
- Difficulty levels: easy (1x), medium (1.5x), hard (2x), expert (3x)
- Ante system (entry fee in credits) + prize pool
- Completion rate tracking
- Run creation flow with form validation (min 2 game_marker beacons required)
- Active run timer with pause/resume
- Progress tracking with beacon waypoints
**Supabase:** `beacons` (SELECT orange game_markers), `beacon_runs` (INSERT), `beacon_run_leaderboard` (SELECT with JOIN to profiles)

### Treasure Components (4 files)

#### 6. `treasure/CraftSteps.tsx` (v1: ~112 lines combined)
**Sources:** `platform/src/components/treasure-map-craft/TreasureMapStep.tsx` (77 lines) + `TreasureMapProgressBar.tsx` (35 lines)
**What it does:** Step card component for treasure map craft flow + progress bar.
**Key exports:** `TreasureMapStepCard`, `TreasureMapProgressBar`
**Key features:**
- Circular checkbox (completed -> filled)
- Color-coded borders: emerald/amber/gray/white
- Time and cost estimate display
- Auth gating on toggle
- Progress bar with smooth animation + 100% success message
**Supabase:** None (presentation only)

#### 7. `treasure/KeyIndicator.tsx` (v1: 304 lines)
**Source:** `platform/src/components/TreasureKeyIndicator.tsx`
**What it does:** Hidden treasure key system for content pages — key count, hints, tier levels, answer submission.
**Key exports:** `TreasureKeyIndicator`
**Key features:**
- 3 variants: floating (bottom-right), inline (border box), minimal (compact)
- Tier colors: common/uncommon/rare/epic/legendary
- Key word submission with feather rewards
- Codebreaker integration via NotesOverlayContext
- Animated pulse on floating button
**Supabase:** `key_submissions` (INSERT, returns is_correct + feathers_awarded)
**External deps:** `getActiveKeysForDocument`, `hasKeys` from treasureKeyEmbed lib, NotesOverlayContext

#### 8. `treasure/MapRenderer.tsx` (v1: ~372 lines combined)
**Sources:** `platform/src/components/treasure-map/TreasureMapIntro.tsx` (45), `TreasureMapQuestion.tsx` (167), `TreasureMapResults.tsx` (160)
**What it does:** Visual treasure map path rendering — intro screen, quiz question UI, and results display.
**Key exports:** `TreasureMapIntro`, `TreasureMapQuestion`, `TreasureMapResults`
**Key features:**
- Intro: 3-minute estimate, start/skip CTAs
- Question: single/multi-select, progress bar, preview plays, maxSelections
- Results: 3 recommended earning plays with CTAs, "Start This Journey" button, crew/marketplace links
**Supabase:** `treasure_map_progress` (UPSERT in Results)

#### 9. `treasure/QuizEngine.tsx` (v1: 233 lines)
**Source:** `platform/src/components/treasure-map/TreasureMapKnowledgeQuiz.tsx`
**What it does:** Multi-question quiz fetching from DB, awarding marks on completion, with retry logic.
**Key exports:** `TreasureMapKnowledgeQuiz`
**Key features:**
- Max 3 attempts per map
- 5 questions default (configurable)
- Radio button 4-option format
- Marks table: 5->10, 4->8, 3->6, 2->4, 1->2, 0->0
- Pass threshold: 3/5 correct
- Retry with remaining attempts display
**Supabase:** `treasure_map_quizzes` (SELECT by map_id OR 'general', random shuffle)

---

## V2 IMPORT RULES

When porting, update all imports to v2 paths:
- `@/integrations/supabase/client` -> keep as-is (shared)
- `@/contexts/AuthContext` -> `../../hooks/useAuth` or keep shared path
- `@/components/ui/*` -> keep as-is (shared shadcn)
- `@/components/BeaconDropButton` -> `./DropButton` (local import within beacon/)
- `@/components/treasure-map/*` -> consolidated into the new files
- `@/lib/ghostWorld` -> keep as-is (shared)
- `@/lib/treasureKeyEmbed` -> keep as-is (shared)
- `@/contexts/NotesOverlayContext` -> keep as-is (shared)

## ALSO: Update related hooks if needed
- `platform-v2/src/domains/beacon/hooks/useBeaconRuns.ts` — verify exists and is wired
- `platform-v2/src/domains/beacon/hooks/useTreasureMaps.ts` — verify exists and is wired
- `platform-v2/src/domains/beacon/hooks/useCraftTreasureMaps.ts` — port from `platform/src/hooks/useCraftTreasureMaps.ts` (194 lines) if not already ported. Key tables: `craft_treasure_maps`, `craft_treasure_map_progress`.

## VALIDATION CHECKLIST

1. `cd platform-v2 && npm run build` — must succeed with 0 errors
2. Each component must export its named exports (not just `export {}`)
3. No `// TODO Session 2` comments remaining in any of the 9 files
4. All Supabase table references match existing schema (beacons, beacon_runs, beacon_run_progress, beacon_run_leaderboard, treasure_map_quizzes, treasure_map_progress, key_submissions, craft_treasure_maps, craft_treasure_map_progress)
5. `cd ../librarian-mcp && npx tsc && node dist/indexer/buildIndex.js` — rebuild Librarian index

## DO NOT
- Change any v1 files (they stay as-is)
- Add new database tables or migrations (all tables exist)
- Modify page files (pages already import from components/index)
- Create new routes (routes already exist from K227)

---

## TOTAL SCOPE
~3,854 lines of v1 code to port into 9 v2 files. This is a MEDIUM-HIGH session — mostly mechanical porting with import path updates. No new features, no new tables, no architectural changes.

## MANDATORY AT END
```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

*FOR THE KEEP!*
