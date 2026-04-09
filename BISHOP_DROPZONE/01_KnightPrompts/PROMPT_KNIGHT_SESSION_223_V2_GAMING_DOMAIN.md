# KNIGHT SESSION 223 — v2 Gaming Domain Migration
## Priority: MEDIUM | Complexity: VERY HIGH (7-8 sessions) | Prerequisite: K209 (Currency)

---

## V1 INVENTORY
- **Tables (19+)**: arenas, acknowledgment_stamps, glowing_keys, glowing_key_stamps, content_classifications, arena_memberships, arena_posts, petitions, petition_signatures, arena_freezes, arena_reports, representative_tracking, crow_feathers, ghost_leaderboard, real_leaderboard, session_purchases, ghost_sessions, treasure_maps, treasure_map_runs, member_armory, fray_leagues, fray_entries, ghost_world_locations, ghost_transactions, hex_islands, hex_island_portals, hexisle_achievements, hexisle_downloads, hexisle_skill_verifications, tereno_certifications
- **Edge Functions**: 0 (all client-side)
- **Pages (31)**: HexIsle (16 pages incl. 3D world, overworld, encyclopedia, campaigns), Ghost World (3 pages), Islands (8 pages), Shared (4 — Arenas, TreasureMapGame, DesignBattleArena 865 lines)
- **Components (43)**: HexIsle (16), Overworld (11 — canvas, hex grid, minimap, gondola, pipes, beacons), 3D (9 — canal, city, terrain, ocean, camera, portals), Ghost World (6), Islands (15)
- **Hooks**: useHexIsleWorld, useGhostSession

## V2 STRUCTURE
```
platform-v2/src/domains/gaming/
├── pages/
│   ├── hexisle/
│   │   ├── HexIslePage.tsx, OverworldPage.tsx, World3DPage.tsx
│   │   ├── EncyclopediaPage.tsx, CampaignsPage.tsx, IslandPage.tsx
│   │   ├── ProjectsPage.tsx, DownloadsPage.tsx, VotePage.tsx
│   │   └── DashboardPage.tsx
│   ├── ghost/
│   │   ├── GhostWorldPage.tsx, GhostMapPage.tsx, GhostMallPage.tsx
│   ├── islands/
│   │   ├── IslandBuilderPage.tsx, IslandWorldMapPage.tsx
│   │   ├── IslandDetailPage.tsx, IslandAssignmentPage.tsx
│   ├── ArenaPage.tsx, TreasureMapGamePage.tsx, DesignBattleArenaPage.tsx
├── components/
│   ├── hexisle/ (overworld, 3D renderer, combat, quests, resources)
│   ├── ghost/ (hex grid, buildings, credit system)
│   ├── islands/ (builder, marketplace, charter)
│   └── arena/ (Switzerland Rule, stamps, glowing keys)
├── hooks/
│   ├── useHexIsleWorld.ts, useGhostSession.ts, useArena.ts, useTreasureMap.ts
├── lib/
│   ├── gamingTypes.ts, arenaRules.ts (Switzerland Rule, 4-tier moderation)
│   ├── ghostEconomy.ts (crow feathers, ghost credits, fray leagues)
│   ├── hexIsleWorld.ts (root lock, diceless combat)
│   └── islandSystem.ts (tereno, portals, certifications)
├── routes.tsx
└── index.ts
```

## KEY ARCHITECTURES
- **3D World**: WebGL renderer — camera rig, ocean, terrain, cities, portals, pipe transit
- **Overworld**: Top-down hex grid — minimap, gondola transit, beacon nodes, path lines
- **Root Lock**: Component locking mechanism (RootComponent, SocketComponent)
- **Diceless Combat**: Non-random combat system
- **Arena**: Switzerland Rule moderation, acknowledgment stamps, glowing keys
- **Ghost Economy**: Crow feathers, ghost credits, fray leagues (Discord), leaderboards
- **Ghost BROWSING (non-member preview) is in onboarding domain, NOT here**

## NOTE: This domain will need 7-8 Knight sub-sessions. Build core pages first, 3D/overworld later.

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
