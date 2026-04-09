# KNIGHT SESSION 227 — v2 Beacon Domain Migration
## Priority: MEDIUM | Complexity: HIGH (4-5 sessions)

---

## V1 INVENTORY
- **Tables (12+)**: beacons (10 cols), beacon_runs (21 cols), beacon_run_progress (10 cols), beacon_run_leaderboard (7 cols), beacon_points (15 cols), beacon_progress (9 cols), beacon_folders, map_beacons, treasure_winners, treasure_maps (30 cols), treasure_map_runs, treasure_map_purchases, treasure_map_completions, treasure_map_progress, treasure_map_quizzes
- **Edge Functions (2)**: beacon-track, treasure-map-progress
- **Pages (13)**: BeaconExplainer, BeaconRunCreator, TreasureIsland, WildfireBeaconRun, TreasureMaps, TreasureMapGame, TreasureMapBuilder, TreasureMapCreator, CraftTreasureMapPage, TreasureMapGuide + more
- **Components (25+)**: AnchorBeaconSystem, BeaconDropButton, BeaconDropUI, BeaconLanternCard, BeaconRunGame, BeaconRunLeaderboard, BeaconRunCueCard, SnowDoorBeacons, treasure-map/ (5 files), treasure-map-craft/ (3 files), TreasureKeyIndicator + more
- **Hooks**: useCraftTreasureMaps

## V2 STRUCTURE
```
platform-v2/src/domains/beacon/
├── pages/
│   ├── BeaconExplainerPage.tsx      # What beacons are (FocusShell — educational)
│   ├── BeaconRunCreatorPage.tsx     # Create a beacon run (AppShell)
│   ├── BeaconRunPage.tsx            # Active run gameplay (AppShell)
│   ├── WildfireRunPage.tsx          # Wildfire beacon run variant
│   ├── TreasureMapPage.tsx          # Map browser (AppShell)
│   ├── TreasureMapGamePage.tsx      # Active map gameplay
│   ├── TreasureMapBuilderPage.tsx   # Create maps (AppShell)
│   └── TreasureIslandPage.tsx       # Island-based treasure hunt
├── components/
│   ├── beacon/ (AnchorSystem, DropButton, LanternCard, RunGame, Leaderboard)
│   ├── treasure/ (MapRenderer, QuizEngine, CraftSteps, ProgressBar, KeyIndicator)
├── hooks/
│   ├── useBeaconRuns.ts, useTreasureMaps.ts, useCraftTreasureMaps.ts
├── lib/
│   ├── beaconTypes.ts, beaconRules.ts, treasureMapEngine.ts, quizQuestions.ts
├── routes.tsx
└── index.ts
```

## KEY RULES
- Beacons are location-based discovery points
- Beacon Runs are gamified exploration paths with leaderboards
- Treasure Maps are knowledge-quiz paths through content
- Wildfire Runs are viral beacon chains
- BeaconExplainerPage is FocusShell (educational/public). All others AppShell.

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
