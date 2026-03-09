/**
 * HEXISLE OVERWORLD PATHS
 * =======================
 * Beacon points, paths, and vessel data for the 2D overworld.
 * The overworld is a Mario World-style map where the player moves
 * hex-by-hex between numbered beacon stops.
 *
 * Vessels determine travel speed:
 *   foot=1, rowboat=2, raft=3, small_ship=4, medium_ship=6 hex/turn
 */

import { type TerrainType } from "./hexIsleWorldData";

// ─── Types ──────────────────────────────────────────────────────────────────

export type VesselType = "foot" | "rowboat" | "raft" | "small_ship" | "medium_ship";

export const VESSEL_SPEEDS: Record<VesselType, number> = {
  foot: 1,
  rowboat: 2,
  raft: 3,
  small_ship: 4,
  medium_ship: 6,
};

export const VESSEL_NAMES: Record<VesselType, string> = {
  foot: "On Foot",
  rowboat: "Rowboat",
  raft: "Raft",
  small_ship: "Small Ship",
  medium_ship: "Medium Ship",
};

export interface OverworldBeaconPoint {
  id: string;
  name: string;
  beaconNumber: number;
  hexPosition: { q: number; r: number };
  islandId: number;
  districtId?: string;
  route?: string;               // React Router path to enter this location
  description: string;
  hasPipeStation?: boolean;
}

export interface OverworldPath {
  from: string;                 // beacon ID
  to: string;                   // beacon ID
  hexSteps: Array<{ q: number; r: number; terrain: TerrainType }>;
  isOcean: boolean;
  requiredVessel?: VesselType;
}

// ─── Harvest Island Beacons (15 stops) ──────────────────────────────────────

export const HARVEST_BEACONS: OverworldBeaconPoint[] = [
  {
    id: "harvest-1", name: "The Shore", beaconNumber: 1,
    hexPosition: { q: 0, r: 8 }, islandId: 1,
    description: "Where you first wash ashore. The beginning of everything.",
  },
  {
    id: "harvest-2", name: "Town Gate", beaconNumber: 2,
    hexPosition: { q: -1, r: 6 }, islandId: 1, districtId: "ramparts",
    description: "The Ramparts guard Verdana's southern approach.",
  },
  {
    id: "harvest-3", name: "Market Square", beaconNumber: 3,
    hexPosition: { q: 3, r: 3 }, islandId: 1, districtId: "market-square",
    hasPipeStation: true,
    description: "The bustling heart of commerce in Verdana.",
  },
  {
    id: "harvest-4", name: "The Tavern", beaconNumber: 4,
    hexPosition: { q: 1, r: 4 }, islandId: 1, districtId: "tavern-district",
    hasPipeStation: true,
    description: "Crew staging area. Ghost World adventures begin here.",
  },
  {
    id: "harvest-5", name: "Artisan Lane", beaconNumber: 5,
    hexPosition: { q: 4, r: 2 }, islandId: 1, districtId: "artisan-lane",
    description: "Craft workshops and design studios line the lane.",
  },
  {
    id: "harvest-6", name: "Canal Quarter Entrance", beaconNumber: 6,
    hexPosition: { q: -3, r: 1 }, islandId: 1, districtId: "canal-quarter",
    hasPipeStation: true,
    description: "Where the canals begin. Galleries and clubs await.",
  },
  {
    id: "harvest-7", name: "Gondola Dock", beaconNumber: 7,
    hexPosition: { q: -4, r: 3 }, islandId: 1, districtId: "canal-quarter",
    description: "Board a gondola to reach hidden canal venues.",
  },
  {
    id: "harvest-8", name: "Tower of Peace", beaconNumber: 8,
    hexPosition: { q: -2, r: -1 }, islandId: 1, districtId: "tower-of-peace",
    hasPipeStation: true,
    description: "The knowledge citadel. Sinbad guards the archives.",
  },
  {
    id: "harvest-9", name: "The Harbor", beaconNumber: 9,
    hexPosition: { q: 5, r: 0 }, islandId: 1, districtId: "harbor-district",
    hasPipeStation: true,
    description: "Ships dock here. The lifeline of trade.",
  },
  {
    id: "harvest-10", name: "Academy & Forge", beaconNumber: 10,
    hexPosition: { q: -1, r: -2 }, islandId: 1, districtId: "academy-terrace",
    hasPipeStation: true,
    description: "Where knowledge meets craft. Training grounds and workshops.",
  },
  {
    id: "harvest-11", name: "Hexagon Gate", beaconNumber: 11,
    hexPosition: { q: 0, r: 2 }, islandId: 1, districtId: "hexagon-compound",
    hasPipeStation: true,
    description: "The gateway to The Hexagon compound.",
  },
  {
    id: "harvest-12", name: "The Hexagon", beaconNumber: 12,
    hexPosition: { q: 2, r: 2 }, islandId: 1, districtId: "hexagon-compound",
    description: "The iconic central hub. All roads lead here.",
  },
  {
    id: "harvest-13", name: "Hilltop Lookout", beaconNumber: 13,
    hexPosition: { q: 0, r: -4 }, islandId: 1,
    description: "A high point overlooking the island. Navigate Island shimmers on the horizon.",
  },
  {
    id: "harvest-14", name: "Lore Cave", beaconNumber: 14,
    hexPosition: { q: -2, r: -6 }, islandId: 1,
    route: "/hexisle/lore/harvest",
    description: "A cave depicting a door marked by a star. The journey's first mystery.",
  },
  {
    id: "harvest-15", name: "North Shore Dock", beaconNumber: 15,
    hexPosition: { q: 0, r: -8 }, islandId: 1,
    description: "The dock faces the open ocean. Navigate Island awaits across the waves.",
  },
];

// ─── Harvest Island Paths ───────────────────────────────────────────────────

function generateHarvestPaths(): OverworldPath[] {
  const paths: OverworldPath[] = [];

  // Helper to create a simple land path between beacons
  function landPath(fromId: string, toId: string, steps: Array<{ q: number; r: number }>): OverworldPath {
    return {
      from: fromId, to: toId,
      hexSteps: steps.map(s => ({ ...s, terrain: "grass" as TerrainType })),
      isOcean: false,
    };
  }

  // #1 Shore → #2 Town Gate (3 hex)
  paths.push(landPath("harvest-1", "harvest-2", [
    { q: 0, r: 8 }, { q: -1, r: 7 }, { q: -1, r: 6 },
  ]));

  // #2 Town Gate → #3 Market Square (4 hex)
  paths.push(landPath("harvest-2", "harvest-3", [
    { q: -1, r: 6 }, { q: 0, r: 5 }, { q: 1, r: 4 }, { q: 3, r: 3 },
  ]));

  // #3 Market → #4 Tavern (3 hex)
  paths.push(landPath("harvest-3", "harvest-4", [
    { q: 3, r: 3 }, { q: 2, r: 4 }, { q: 1, r: 4 },
  ]));

  // #4 Tavern → #5 Artisan Lane (4 hex)
  paths.push(landPath("harvest-4", "harvest-5", [
    { q: 1, r: 4 }, { q: 2, r: 3 }, { q: 3, r: 2 }, { q: 4, r: 2 },
  ]));

  // #5 Artisan → #6 Canal Entrance (3 hex)
  paths.push(landPath("harvest-5", "harvest-6", [
    { q: 4, r: 2 }, { q: 2, r: 1 }, { q: -3, r: 1 },
  ]));

  // #6 Canal Entrance → #7 Gondola Dock (5 hex)
  paths.push(landPath("harvest-6", "harvest-7", [
    { q: -3, r: 1 }, { q: -3, r: 2 }, { q: -4, r: 2 }, { q: -4, r: 3 }, { q: -4, r: 3 },
  ]));

  // #7 Gondola Dock → #8 Tower of Peace (4 hex)
  paths.push(landPath("harvest-7", "harvest-8", [
    { q: -4, r: 3 }, { q: -3, r: 1 }, { q: -2, r: 0 }, { q: -2, r: -1 },
  ]));

  // #8 Tower → #9 Harbor (6 hex)
  paths.push(landPath("harvest-8", "harvest-9", [
    { q: -2, r: -1 }, { q: -1, r: -1 }, { q: 1, r: 0 }, { q: 3, r: 0 }, { q: 4, r: 0 }, { q: 5, r: 0 },
  ]));

  // #9 Harbor → #10 Academy & Forge (3 hex)
  paths.push(landPath("harvest-9", "harvest-10", [
    { q: 5, r: 0 }, { q: 3, r: -1 }, { q: -1, r: -2 },
  ]));

  // #10 Academy → #11 Hexagon Gate (4 hex)
  paths.push(landPath("harvest-10", "harvest-11", [
    { q: -1, r: -2 }, { q: -1, r: -1 }, { q: 0, r: 0 }, { q: 0, r: 2 },
  ]));

  // #11 Hexagon Gate → #12 Hexagon (7 hex winding path through compound)
  paths.push(landPath("harvest-11", "harvest-12", [
    { q: 0, r: 2 }, { q: 1, r: 1 }, { q: 1, r: 2 }, { q: 2, r: 1 }, { q: 2, r: 2 },
  ]));

  // #12 Hexagon → #13 Hilltop Lookout (8 hex)
  paths.push(landPath("harvest-12", "harvest-13", [
    { q: 2, r: 2 }, { q: 1, r: 1 }, { q: 1, r: 0 }, { q: 0, r: -1 }, { q: 0, r: -2 }, { q: 0, r: -3 }, { q: 0, r: -4 },
  ]));

  // #13 Lookout → #14 Lore Cave (12 hex, long trek)
  paths.push(landPath("harvest-13", "harvest-14", [
    { q: 0, r: -4 }, { q: -1, r: -4 }, { q: -1, r: -5 }, { q: -2, r: -5 }, { q: -2, r: -6 },
  ]));

  // #14 Lore Cave → #15 North Shore Dock (12 hex)
  paths.push(landPath("harvest-14", "harvest-15", [
    { q: -2, r: -6 }, { q: -1, r: -7 }, { q: 0, r: -7 }, { q: 0, r: -8 },
  ]));

  return paths;
}

// ─── Ocean Crossing Paths ───────────────────────────────────────────────────

export const OCEAN_CROSSINGS: OverworldPath[] = [
  {
    from: "harvest-15",
    to: "navigate-1",  // Future: first beacon on Navigate Island
    hexSteps: [],      // Will be populated when Navigate Island paths are built
    isOcean: true,
    requiredVessel: "rowboat",
  },
];

// ─── Registry ───────────────────────────────────────────────────────────────

const BEACON_REGISTRY: Record<number, OverworldBeaconPoint[]> = {
  1: HARVEST_BEACONS,
};

const PATH_REGISTRY: Record<number, OverworldPath[]> = {
  1: generateHarvestPaths(),
};

// ─── Exports ────────────────────────────────────────────────────────────────

/** Get all beacons for an island */
export function getBeaconsForIsland(islandId: number): OverworldBeaconPoint[] {
  return BEACON_REGISTRY[islandId] ?? [];
}

/** Get all paths for an island */
export function getPathsForIsland(islandId: number): OverworldPath[] {
  return PATH_REGISTRY[islandId] ?? [];
}

/** Find a beacon by ID */
export function getBeaconById(beaconId: string): OverworldBeaconPoint | null {
  for (const beacons of Object.values(BEACON_REGISTRY)) {
    const found = beacons.find(b => b.id === beaconId);
    if (found) return found;
  }
  return null;
}

/** Get the path between two beacons */
export function getPathBetweenBeacons(fromId: string, toId: string): OverworldPath | null {
  for (const paths of Object.values(PATH_REGISTRY)) {
    const found = paths.find(p =>
      (p.from === fromId && p.to === toId) ||
      (p.from === toId && p.to === fromId)
    );
    if (found) return found;
  }
  // Check ocean crossings
  return OCEAN_CROSSINGS.find(p =>
    (p.from === fromId && p.to === toId) ||
    (p.from === toId && p.to === fromId)
  ) ?? null;
}

/** Get adjacent beacon IDs (connected by paths) */
export function getAdjacentBeacons(beaconId: string, islandId: number): string[] {
  const paths = getPathsForIsland(islandId);
  const adjacent: string[] = [];
  for (const path of paths) {
    if (path.from === beaconId) adjacent.push(path.to);
    if (path.to === beaconId) adjacent.push(path.from);
  }
  return adjacent;
}

/** Get hex distance between two beacons (path hex count) */
export function getHexDistance(fromId: string, toId: string): number {
  const path = getPathBetweenBeacons(fromId, toId);
  if (!path) return Infinity;
  return path.hexSteps.length;
}
