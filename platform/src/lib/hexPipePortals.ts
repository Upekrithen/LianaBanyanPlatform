/**
 * HEXISLE PIPE PORTALS — Underground Transit System
 * ==================================================
 * Mario warp-pipe style underground transit network for the HexIsle game world.
 *
 * Each city can have multiple colored "pipe lines" connecting key locations.
 * Players travel between stations by paying a transit cost (default: 1 Mark).
 * Skilled players or those holding specific deck cards ride for free.
 *
 * Line Colors map to scope:
 *   Green  — City Core Loop      (unlocked from start)
 *   Blue   — Culture Line        (unlocked at level 5)
 *   Red    — Inter-Island Line   (unlocked at level 15)
 *   Gold   — Reserved (future)
 *   Purple — Reserved (future)
 *   Orange — Reserved (future)
 *
 * Glyph Symbols encode the currency dimension:
 *   ● Circle   — Credits
 *   ■ Square   — Marks
 *   ▲ Triangle — Joules
 *
 * Architecture:
 *   PipeStation  — A single hex where a pipe entrance sits
 *   PipeLine     — An ordered sequence of stations sharing a color/glyph
 *   PipeNetwork  — All lines + stations + transfer stations for an island
 */

import { type HexCell, type CityBuilding } from "./hexIsleWorldData";

// ─── Pipe Colors ────────────────────────────────────────────────────────────

export type PipeColor = "green" | "blue" | "red" | "gold" | "purple" | "orange";

export const PIPE_COLORS: Record<PipeColor, string> = {
  green:  "#22c55e",
  blue:   "#3b82f6",
  red:    "#ef4444",
  gold:   "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
};

// ─── Glyph System ───────────────────────────────────────────────────────────

export type PipeGlyph = "circle" | "square" | "triangle"; // ● ■ ▲ — Credits / Marks / Joules

export const GLYPH_SYMBOLS: Record<PipeGlyph, string> = {
  circle:   "●",
  square:   "■",
  triangle: "▲",
};

export const GLYPH_CURRENCY: Record<PipeGlyph, string> = {
  circle:   "Credits",
  square:   "Marks",
  triangle: "Joules",
};

// ─── Core Interfaces ────────────────────────────────────────────────────────

export interface PipeStation {
  id: string;
  name: string;
  hexPosition: { q: number; r: number };
  cityId?: string;
  islandId: number;
  lineColor: PipeColor;
  glyph: PipeGlyph;
  transitCost: number;          // default 1 Mark
  requiredSkillLevel?: number;  // skill gate for free passage
  requiredDeckCard?: string;    // deck card that skips cost
  description: string;
}

export interface PipeLine {
  id: string;
  name: string;
  color: PipeColor;
  glyph: PipeGlyph;
  stations: string[];            // ordered station IDs
  scope: "city" | "island" | "inter_island";
  unlockLevel: number;           // 0=always, 5=island, 15=inter-island
}

export interface PipeNetwork {
  lines: PipeLine[];
  stations: PipeStation[];
  transferStations: string[];    // stations where lines intersect
}

// ─── Verdana Pipe Stations ──────────────────────────────────────────────────

/**
 * Green Line ● (Circle / Credits) — City Core Loop
 * Connects the harbor, market, tavern, and commons in a ring.
 * Unlocked from the very start of the game.
 */
const VERDANA_GREEN_STATIONS: PipeStation[] = [
  {
    id: "harbor-station",
    name: "Harbor Station",
    hexPosition: { q: 5, r: -2 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "green",
    glyph: "circle",
    transitCost: 1,
    description: "Pipe entrance at the waterfront. Smell of salt and timber.",
  },
  {
    id: "market-station",
    name: "Market Station",
    hexPosition: { q: 3, r: 3 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "green",
    glyph: "circle",
    transitCost: 1,
    description: "Underground access beneath the bustling Market Square.",
  },
  {
    id: "tavern-station",
    name: "Tavern Station",
    hexPosition: { q: 1, r: 4 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "green",
    glyph: "circle",
    transitCost: 1,
    description: "A warm glow spills from the pipe. The tavern is close.",
  },
  {
    id: "common-station",
    name: "Common Station",
    hexPosition: { q: -2, r: 7 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "green",
    glyph: "circle",
    transitCost: 1,
    description: "Opens onto the common green. Festivals gather here.",
  },
];

/**
 * Blue Line ■ (Square / Marks) — Culture Line
 * Connects the canal quarter, hexagon gate, academy, and Tower of Peace.
 * Unlocked at player level 5.
 */
const VERDANA_BLUE_STATIONS: PipeStation[] = [
  {
    id: "canal-station",
    name: "Canal Quarter Station",
    hexPosition: { q: -4, r: 0 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "blue",
    glyph: "square",
    transitCost: 1,
    description: "Descend beside the canal. Water echoes through the tunnel.",
  },
  {
    id: "hexagon-gate-station",
    name: "Hexagon Gate Station",
    hexPosition: { q: 0, r: 2 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "blue",
    glyph: "square",
    transitCost: 1,
    description: "The grand pipe beneath The Hexagon. Transfer to the Green Line nearby.",
  },
  {
    id: "academy-station",
    name: "Academy Station",
    hexPosition: { q: -1, r: -2 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "blue",
    glyph: "square",
    transitCost: 1,
    description: "Scholars descend here. Books line the tunnel walls.",
  },
  {
    id: "tower-station",
    name: "Tower of Peace Station",
    hexPosition: { q: -2, r: -1 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "blue",
    glyph: "square",
    transitCost: 1,
    description: "A quiet station at the base of the Tower. Stillness underground.",
  },
];

/**
 * Red Line ▲ (Triangle / Joules) — Inter-Island Line
 * Only two stations in Verdana; connects to other islands via deep pipes.
 * Unlocked at player level 15.
 */
const VERDANA_RED_STATIONS: PipeStation[] = [
  {
    id: "verdana-central",
    name: "Verdana Central",
    hexPosition: { q: 2, r: 3 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "red",
    glyph: "triangle",
    transitCost: 2,
    description: "The deepest pipe in Verdana. Routes lead far beneath the sea.",
  },
  {
    id: "north-dock-station",
    name: "North Shore Dock",
    hexPosition: { q: 0, r: -5 },
    cityId: "verdana",
    islandId: 1,
    lineColor: "red",
    glyph: "triangle",
    transitCost: 2,
    description: "A lonely pipe at the northern shore. Waves crash above.",
  },
];

// ─── Verdana Pipe Lines ─────────────────────────────────────────────────────

const VERDANA_GREEN_LINE: PipeLine = {
  id: "verdana-green",
  name: "Green Line — City Core Loop",
  color: "green",
  glyph: "circle",
  stations: [
    "harbor-station",
    "market-station",
    "tavern-station",
    "common-station",
  ],
  scope: "city",
  unlockLevel: 0,
};

const VERDANA_BLUE_LINE: PipeLine = {
  id: "verdana-blue",
  name: "Blue Line — Culture Line",
  color: "blue",
  glyph: "square",
  stations: [
    "canal-station",
    "hexagon-gate-station",
    "academy-station",
    "tower-station",
  ],
  scope: "island",
  unlockLevel: 5,
};

const VERDANA_RED_LINE: PipeLine = {
  id: "verdana-red",
  name: "Red Line — Inter-Island Line",
  color: "red",
  glyph: "triangle",
  stations: [
    "verdana-central",
    "north-dock-station",
  ],
  scope: "inter_island",
  unlockLevel: 15,
};

// ─── Verdana Pipe Network ───────────────────────────────────────────────────

const VERDANA_PIPE_NETWORK: PipeNetwork = {
  lines: [
    VERDANA_GREEN_LINE,
    VERDANA_BLUE_LINE,
    VERDANA_RED_LINE,
  ],
  stations: [
    ...VERDANA_GREEN_STATIONS,
    ...VERDANA_BLUE_STATIONS,
    ...VERDANA_RED_STATIONS,
  ],
  transferStations: [
    "hexagon-gate-station",  // Green/Blue intersection area (near market-station)
    "verdana-central",       // Red/Green transfer
  ],
};

// ─── Empty Network (placeholder for future islands) ─────────────────────────

const EMPTY_PIPE_NETWORK: PipeNetwork = {
  lines: [],
  stations: [],
  transferStations: [],
};

// ─── Network Generators ─────────────────────────────────────────────────────

/**
 * Generate the pipe network for a given island.
 * Currently only Harvest Island (id 1) has a defined network (Verdana).
 * All other islands return an empty network placeholder.
 */
export function generatePipeNetwork(islandId: number): PipeNetwork {
  switch (islandId) {
    case 1:
      return VERDANA_PIPE_NETWORK;
    // Future islands:
    // case 2: return generateNavigatePipeNetwork();
    // case 3: return generateEngineerPipeNetwork();
    default:
      return EMPTY_PIPE_NETWORK;
  }
}

// ─── Building Generation ────────────────────────────────────────────────────

/**
 * Convert pipe stations into CityBuilding objects for hex rendering.
 * Each station occupies a single hex with stone terrain, height 2.5,
 * and building type "pipe_station".
 */
export function getPipeStationBuildings(islandId: number): CityBuilding[] {
  const network = generatePipeNetwork(islandId);

  return network.stations.map((station) => {
    const cell: HexCell = {
      q: station.hexPosition.q,
      r: station.hexPosition.r,
      height: 2.5,
      terrain: "stone",
    };

    return {
      name: station.name,
      type: "pipe_station",
      cells: [cell],
      labelQ: station.hexPosition.q,
      labelR: station.hexPosition.r,
      labelHeight: 5,
      color: PIPE_COLORS[station.lineColor],
      description: station.description,
    } as CityBuilding;
  });
}

// ─── Query Helpers ──────────────────────────────────────────────────────────

/**
 * Find the pipe station at a specific hex coordinate, or null if none exists.
 */
export function getPipeStationAtHex(
  q: number,
  r: number,
  network: PipeNetwork,
): PipeStation | null {
  return (
    network.stations.find(
      (s) => s.hexPosition.q === q && s.hexPosition.r === r,
    ) ?? null
  );
}

/**
 * Find the pipe line that contains a given station ID, or null if not found.
 */
export function getLineForStation(
  stationId: string,
  network: PipeNetwork,
): PipeLine | null {
  return (
    network.lines.find((line) => line.stations.includes(stationId)) ?? null
  );
}

// ─── Access & Cost Logic ────────────────────────────────────────────────────

/**
 * Check whether a player's level meets the unlock requirement for a pipe line.
 * @param line       The pipe line to check
 * @param playerLevel  The player's current level
 * @returns true if the player can access this line
 */
export function canAccessLine(line: PipeLine, playerLevel: number): boolean {
  return playerLevel >= line.unlockLevel;
}

/**
 * Calculate the transit cost for a station, accounting for skill gates
 * and deck card overrides.
 *
 * Priority:
 *   1. If the player holds the station's required deck card → free (0)
 *   2. If the player's skill level meets the station's skill gate → free (0)
 *   3. Otherwise → station.transitCost
 *
 * @param station          The station being entered
 * @param playerSkillLevel The player's relevant skill level
 * @param hasDeckCard      Whether the player holds the station's required deck card
 * @returns The cost in Marks (0 = free passage)
 */
export function getTransitCost(
  station: PipeStation,
  playerSkillLevel: number,
  hasDeckCard: boolean,
): number {
  // Deck card override — always free
  if (hasDeckCard && station.requiredDeckCard) {
    return 0;
  }

  // Skill gate — free if player meets or exceeds requirement
  if (
    station.requiredSkillLevel !== undefined &&
    playerSkillLevel >= station.requiredSkillLevel
  ) {
    return 0;
  }

  return station.transitCost;
}
