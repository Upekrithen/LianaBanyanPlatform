/**
 * HEXISLE CANAL DISTRICT — VERDANA'S CANAL QUARTER
 * =================================================
 * Vienna-style canal quarter data for Port City (Verdana) on Harvest Island.
 *
 * The Canal Quarter occupies the NORTHWEST area of Verdana, roughly
 * from q=-5 to q=-2, r=-2 to r=3. Winding waterways, gondola routes,
 * and entertainment venues line the canals — galleries, clubs, theaters,
 * music halls, and studios.
 *
 * Players can explore on foot (winding hex paths with hidden golden keys)
 * or pay Credits to ride gondolas between docks. An All-Access Pass covers
 * every venue for 24 hours at 3x the most expensive single-venue price.
 *
 * Currency: all fees denominated in Credits (1 Credit = $1 fiat equivalent).
 */

import { type HexCell, type CityBuilding, type BuildingArchetype } from "./hexIsleWorldData";

// ─── Venue & Access Types ────────────────────────────────────────────────────

export type VenueType = "gallery" | "club" | "theater" | "music_hall" | "studio";
export type AccessMode = "walk" | "gondola" | "gondola_only";

// ─── Canal Venue ─────────────────────────────────────────────────────────────

export interface CanalVenue {
  id: string;
  name: string;
  venueType: VenueType;
  entranceFee: number;        // Credits (1-3)
  hexPosition: { q: number; r: number };
  accessModes: AccessMode[];
  walkPathLength?: number;    // hex count for winding path (if walkable)
  hasGoldenKeys?: boolean;    // golden keys hidden on walk path
  description: string;
}

// ─── Gondola Infrastructure ──────────────────────────────────────────────────

export interface GondolaDock {
  id: string;
  name: string;
  hexPosition: { q: number; r: number };
}

export interface GondolaRoute {
  from: string;  // dock ID
  to: string;    // dock ID
  cost: number;  // Credits
  hexPath: Array<{ q: number; r: number }>;
}

// ─── Canal Network ───────────────────────────────────────────────────────────

export interface CanalChannel {
  id: string;
  hexes: Array<{ q: number; r: number }>;
}

export interface CanalNetwork {
  channels: CanalChannel[];
  docks: GondolaDock[];
  routes: GondolaRoute[];
}

// ─── All-Access Pass ─────────────────────────────────────────────────────────

export interface AllAccessPass {
  cost: number;              // 3x single-venue price
  durationHours: number;     // 24
  coversVenueTypes: VenueType[];
}

// ─── Canal Channel Layout ────────────────────────────────────────────────────

/**
 * Main Channel: runs west-to-east then bends south.
 *   (-5, 0) → (-4, 0) → (-3, 0) → (-3, 1) → (-3, 2)
 *
 * Branch Channel: splits south from the main channel.
 *   (-4, 1) → (-4, 2) → (-4, 3)
 */
const CANAL_CHANNELS: CanalChannel[] = [
  {
    id: "main_channel",
    hexes: [
      { q: -5, r: 0 },
      { q: -4, r: 0 },
      { q: -3, r: 0 },
      { q: -3, r: 1 },
      { q: -3, r: 2 },
    ],
  },
  {
    id: "branch_channel",
    hexes: [
      { q: -4, r: 1 },
      { q: -4, r: 2 },
      { q: -4, r: 3 },
    ],
  },
];

// ─── Gondola Docks ───────────────────────────────────────────────────────────

const GONDOLA_DOCKS: GondolaDock[] = [
  {
    id: "canal_entrance",
    name: "Canal Entrance Dock",
    hexPosition: { q: -5, r: 0 },
  },
  {
    id: "central_crossing",
    name: "Central Crossing Dock",
    hexPosition: { q: -3, r: 1 },
  },
  {
    id: "inner_quarter",
    name: "Inner Quarter Dock",
    hexPosition: { q: -4, r: 3 },
  },
];

// ─── Gondola Routes ──────────────────────────────────────────────────────────

/**
 * Three gondola routes connect the docks:
 *   Entrance → Central Crossing  (1 Credit, follows main channel)
 *   Central Crossing → Inner Quarter (1 Credit, follows bend into branch)
 *   Entrance → Inner Quarter direct  (2 Credits, express route)
 */
const GONDOLA_ROUTES: GondolaRoute[] = [
  {
    from: "canal_entrance",
    to: "central_crossing",
    cost: 1,
    hexPath: [
      { q: -5, r: 0 },
      { q: -4, r: 0 },
      { q: -3, r: 0 },
      { q: -3, r: 1 },
    ],
  },
  {
    from: "central_crossing",
    to: "inner_quarter",
    cost: 1,
    hexPath: [
      { q: -3, r: 1 },
      { q: -3, r: 2 },
      { q: -4, r: 3 },
    ],
  },
  {
    from: "canal_entrance",
    to: "inner_quarter",
    cost: 2,
    hexPath: [
      { q: -5, r: 0 },
      { q: -4, r: 0 },
      { q: -4, r: 1 },
      { q: -4, r: 2 },
      { q: -4, r: 3 },
    ],
  },
];

// ─── Canal Venues ────────────────────────────────────────────────────────────

/**
 * Six entertainment venues front the canals. Some are walkable, some
 * gondola-only. Gondola-only venues have winding walk paths with hidden
 * golden keys — rewarding explorers who take the scenic route.
 */
const CANAL_VENUES: CanalVenue[] = [
  {
    id: "durins_door",
    name: "Durin's Door Art Gallery",
    venueType: "gallery",
    entranceFee: 2,
    hexPosition: { q: -5, r: 1 },
    accessModes: ["walk", "gondola"],
    description:
      "A gallery carved into the canal wall, its entrance visible only by lantern light. Rotating exhibitions from across the archipelago.",
  },
  {
    id: "blue_lantern",
    name: "The Blue Lantern",
    venueType: "club",
    entranceFee: 1,
    hexPosition: { q: -4, r: -1 },
    accessModes: ["walk"],
    description:
      "A lively canal-side club marked by a single blue lantern above the door. Music, dancing, and cheap drinks.",
  },
  {
    id: "canal_theater",
    name: "Canal Theater",
    venueType: "theater",
    entranceFee: 3,
    hexPosition: { q: -3, r: -1 },
    accessModes: ["walk", "gondola"],
    description:
      "The grandest venue in the Quarter. Tiered seating rises from the water's edge for performances under the stars.",
  },
  {
    id: "harmony_hall",
    name: "Harmony Hall",
    venueType: "music_hall",
    entranceFee: 2,
    hexPosition: { q: -2, r: 1 },
    accessModes: ["walk", "gondola"],
    description:
      "An acoustically perfect hexagonal hall where musicians from every island perform. The sound carries across the water.",
  },
  {
    id: "the_undertow",
    name: "The Undertow",
    venueType: "club",
    entranceFee: 1,
    hexPosition: { q: -3, r: 3 },
    accessModes: ["gondola_only"],
    walkPathLength: 8,
    hasGoldenKeys: true,
    description:
      "A hidden speakeasy beneath the southern canal bend. Reachable by gondola — or by those brave enough to find the 8-hex winding path and its golden keys.",
  },
  {
    id: "dream_studio",
    name: "Dream Studio",
    venueType: "studio",
    entranceFee: 2,
    hexPosition: { q: -5, r: 2 },
    accessModes: ["gondola_only"],
    walkPathLength: 6,
    hasGoldenKeys: true,
    description:
      "A secluded creative workshop where artists craft one-of-a-kind works. The 6-hex path to the door hides golden keys among the canal reeds.",
  },
];

// ─── All-Access Pass ─────────────────────────────────────────────────────────

/**
 * The Canal Quarter All-Access Pass.
 * Cost: 9 Credits (3x the most expensive single venue — Canal Theater at 3).
 * Duration: 24 hours of unlimited entry to every venue in the Quarter.
 */
export const ALL_ACCESS_PASS: AllAccessPass = {
  cost: 9,
  durationHours: 24,
  coversVenueTypes: ["gallery", "club", "theater", "music_hall", "studio"],
};

// ─── District Generator ──────────────────────────────────────────────────────

/**
 * Generate the full Canal District data for Verdana's Canal Quarter.
 * Returns the canal network (channels, docks, routes), all venues,
 * and the All-Access Pass configuration.
 */
export function generateCanalDistrict(): {
  network: CanalNetwork;
  venues: CanalVenue[];
  allAccessPass: AllAccessPass;
} {
  return {
    network: {
      channels: CANAL_CHANNELS,
      docks: GONDOLA_DOCKS,
      routes: GONDOLA_ROUTES,
    },
    venues: CANAL_VENUES,
    allAccessPass: ALL_ACCESS_PASS,
  };
}

// ─── Hex Cell Generators ─────────────────────────────────────────────────────

/**
 * Get all canal water channel hex cells.
 * These are the actual water hexes that form the canal waterways.
 * Terrain: "canal", height: 0.3 (just above sea floor — shallow water).
 */
export function getCanalHexCells(): HexCell[] {
  const seen = new Set<string>();
  const cells: HexCell[] = [];

  for (const channel of CANAL_CHANNELS) {
    for (const hex of channel.hexes) {
      const key = `${hex.q},${hex.r}`;
      if (!seen.has(key)) {
        seen.add(key);
        cells.push({
          q: hex.q,
          r: hex.r,
          height: 0.3,
          terrain: "canal",
        });
      }
    }
  }

  return cells;
}

/**
 * Get all canal venue and dock structures as CityBuilding objects.
 * Venues are stone buildings (height 3-4) with type "canal_venue".
 * Docks are low stone platforms (height 1.2) with type "gondola_dock".
 * These can be merged into the island cell array via mergeCity().
 */
export function getCanalVenueBuildings(): CityBuilding[] {
  const buildings: CityBuilding[] = [];

  // ── Venue buildings ──
  for (const venue of CANAL_VENUES) {
    const height = venue.venueType === "theater" ? 4 : 3;
    const color = getVenueColor(venue.venueType);

    buildings.push({
      name: venue.name,
      type: "canal_venue" as BuildingArchetype,
      cells: [
        {
          q: venue.hexPosition.q,
          r: venue.hexPosition.r,
          height,
          terrain: "stone",
        },
      ],
      labelQ: venue.hexPosition.q,
      labelR: venue.hexPosition.r,
      labelHeight: height + 3,
      color,
      description: venue.description,
    });
  }

  // ── Gondola dock structures ──
  for (const dock of GONDOLA_DOCKS) {
    buildings.push({
      name: dock.name,
      type: "gondola_dock" as BuildingArchetype,
      cells: [
        {
          q: dock.hexPosition.q,
          r: dock.hexPosition.r,
          height: 1.2,
          terrain: "stone",
        },
      ],
      labelQ: dock.hexPosition.q,
      labelR: dock.hexPosition.r,
      labelHeight: 4,
      color: "#4a90d9",
      description: `Gondola boarding point. Hop aboard to glide through the Canal Quarter.`,
    });
  }

  return buildings;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Accent color per venue type for labels and highlights. */
function getVenueColor(venueType: VenueType): string {
  switch (venueType) {
    case "gallery":    return "#d4a855";
    case "club":       return "#9b59b6";
    case "theater":    return "#e74c3c";
    case "music_hall": return "#2ecc71";
    case "studio":     return "#e67e22";
  }
}
