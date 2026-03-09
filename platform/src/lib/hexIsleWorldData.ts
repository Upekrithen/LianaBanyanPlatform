/**
 * HEXISLE 3D WORLD DATA
 * =====================
 * Canonical island positions, heightmaps, and terrain types for the 3D world.
 *
 * Geography follows the world map by James Ausbin (Creative Director):
 *   South-to-north archipelago journey: 1→2→3→4→5/6→7
 *   Island 5 (Seek) = caldera ring of 5 islets
 *   Island 6 (Magic) = lost city rising from center of caldera
 *
 * Art Reference: Asteroid-ProofVault/mediaFiles/.../Hexisle Art/
 * Lore Source: "Hexisle Lore Official - James Ausbin, Creative Director.rtf"
 */

// ─── Terrain Types ──────────────────────────────────────────────────────────

export type TerrainType =
  | "ocean"
  | "shore"
  | "grass"
  | "rock"
  | "cliff"
  | "snow"
  | "forest"
  | "volcanic"
  | "ruins"
  | "magic"
  | "stump"     // Fossilized tree stumps (Engineer)
  | "storm"     // Storm-wracked terrain (Battle)
  | "ice"       // Frozen terrain (Train)
  | "machine"   // Siege engine hull (Train)
  | "stone"     // Intact built structures (city buildings)
  | "canal";    // Water channels in Vienna-style canal districts

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  ocean:    "#0c4a6e",
  shore:    "#c2b280",
  grass:    "#5b8c3e",
  rock:     "#7a7a7a",
  cliff:    "#4a4a4a",
  snow:     "#e8f0ff",
  forest:   "#2d5a1e",
  volcanic: "#3d1c1c",
  ruins:    "#8b8378",
  magic:    "#00ff88",
  stump:    "#6b4423",
  storm:    "#2d3748",
  ice:      "#b8d4e3",
  machine:  "#5a5a6e",
  stone:    "#9a8e82",
  canal:    "#3b82a0",
};

export const TERRAIN_ROUGHNESS: Record<TerrainType, number> = {
  ocean: 0.1, shore: 0.9, grass: 0.8, rock: 0.95, cliff: 0.95,
  snow: 0.3, forest: 0.85, volcanic: 0.9, ruins: 0.85, magic: 0.2,
  stump: 0.9, storm: 0.8, ice: 0.15, machine: 0.7, stone: 0.6, canal: 0.3,
};

export const TERRAIN_EMISSIVE: Partial<Record<TerrainType, string>> = {
  magic:    "#00ff88",
  volcanic: "#ff4400",
  canal:    "#1a6b8a",
};

// ─── Hex Cell ───────────────────────────────────────────────────────────────

export interface HexCell {
  q: number;                  // Axial coordinate (column)
  r: number;                  // Axial coordinate (row)
  height: number;             // Column height (0-15 scale, 0 = sea floor)
  terrain: TerrainType;       // Determines material/color
  features?: HexFeature[];    // Objects placed on top of this hex
}

export type HexFeature =
  | "tree"
  | "cave"
  | "lore_cave"    // Plot-relevant cave (Islands 1 & 4)
  | "ruin"
  | "key"          // Seek island keys
  | "weapon"       // Battle island debris
  | "shipwreck"
  | "whirlpool"
  | "shelter"      // Starting shelter on Harvest
  | "portal"       // Magic portal
  | "forcefield"   // Train island barrier
  | "spire";       // Magic city spire

// ─── City & Building Definitions ──────────────────────────────────────────

export type BuildingArchetype =
  | "hexagon"       // Central hexagonal structure — the iconic building
  | "hall"          // Assembly/meeting halls
  | "harbor"        // Waterfront docks and warehouses
  | "keep"          // Fortified tower structures
  | "guild_tower"   // Guild-specific tall towers
  | "market"        // Commerce/trade area
  | "garden"        // Agricultural/growth area
  | "gate"          // City entrance/wall
  | "well"          // Water well structure
  | "workshop"      // Crafting/manufacturing
  | "tower"         // Tall knowledge/peace towers (Tower of Peace)
  | "tavern"        // Crew prep area, social hub, Ghost World staging
  | "gallery"       // Art galleries along canals
  | "canteen"       // Dining/social spot
  | "academy"       // Education/training buildings
  | "forge"         // Manufacturing/prototype workshops
  | "garden_plot"   // Small agricultural plots
  | "rampart"       // City wall segments, guard stations
  | "artisan_shop"  // Craft workshops, design studios
  | "commons"       // Town square, event spaces
  | "canal_venue"   // Venues along Vienna-style canals (clubs, theaters)
  | "pipe_station"  // Mario warp pipe portal entrance
  | "gondola_dock"  // Canal gondola boarding point
  | "storefront"    // Rentable retail/commercial spaces
  | "inn"           // Accommodation + real-world Airbnb bridge
  | "rental_plot";  // Empty rentable hex plots

// ─── View Phase ───────────────────────────────────────────────────────────

/** Three representations of the same world (Split Infinity: Proton/Phaze) */
export type ViewPhase = "portals" | "overworld" | "world3d";

export interface CityBuilding {
  name: string;               // Display name, e.g. "The Hexagon"
  type: BuildingArchetype;    // Building category
  cells: HexCell[];           // Hex cells that form this building
  labelQ: number;             // Label position (hex q coord)
  labelR: number;             // Label position (hex r coord)
  labelHeight: number;        // Height above building for floating label
  color: string;              // Accent color for label/highlight
  description: string;        // Short blurb for HUD
}

export interface CityDef {
  id: string;                 // e.g. "verdana"
  name: string;               // e.g. "Verdana"
  subtitle: string;           // e.g. "Nature & Growth"
  islandId: number;           // Which island this city sits on
  buildings: CityBuilding[];  // All named structures
}

// ─── Island Definition ──────────────────────────────────────────────────────

export interface IslandDef {
  id: number;
  name: string;
  loreTitle: string;
  theme: string;
  businessSkill: string;
  worldPosition: { x: number; z: number };  // Position in world space
  colorAccent: string;                       // Primary island color
  cells: HexCell[];                          // The hex grid data
  loreBlurb: string;                         // Short description for HUD
  connections: number[];                     // Which islands connect to this one
  cities?: CityDef[];                        // Named cities within the island
}

// ─── Scale Constants ────────────────────────────────────────────────────────

/** Hex radius in world units. 1 hex = comfortably fits a human with gear */
export const HEX_RADIUS = 0.8;

/** Spacing between hex centers (flat-top hex: width = 2*r, horiz spacing = 1.5*r) */
export const HEX_SPACING = HEX_RADIUS * 1.5;

/** Sea level height (hexes below this are underwater) */
export const SEA_LEVEL = 1.0;

/** Height multiplier (converts 0-15 scale to world units) */
export const HEIGHT_SCALE = 0.5;

// ─── Hex Coordinate Math ────────────────────────────────────────────────────

/** Convert axial hex coordinates (q, r) to world-space (x, z) — flat-top hexagons */
export function hexToWorld(q: number, r: number): { x: number; z: number } {
  const x = HEX_RADIUS * (3 / 2) * q;
  const z = HEX_RADIUS * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x, z };
}

// ─── Heightmap Generators ───────────────────────────────────────────────────

/** Generate a filled hex disk of given radius in axial coords */
function hexDisk(radius: number): Array<{ q: number; r: number }> {
  const coords: Array<{ q: number; r: number }> = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      coords.push({ q, r });
    }
  }
  return coords;
}

/** Distance from center in axial coordinates */
function hexDist(q: number, r: number): number {
  return (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2;
}

// ─── Island 1: Harvest ──────────────────────────────────────────────────────
// Flat beach rising to gentle hills. Rivers, lakes, lone tree on hill.
// Lore: cave with star/door plot hook

function generateHarvest(): HexCell[] {
  const cells: HexCell[] = [];
  const disk = hexDisk(6);

  for (const { q, r } of disk) {
    const dist = hexDist(q, r);
    const isEdge = dist >= 5;
    const isRiver = (q === 0 && r >= -2 && r <= 3);
    const isHill = (q === -2 && r === -3);

    let height = isEdge ? 0.5 : 1 + Math.random() * 1.5;
    let terrain: TerrainType = "grass";
    const features: HexFeature[] = [];

    if (isRiver) {
      height = 0.3;
      terrain = "shore";
    } else if (isHill) {
      height = 4;
      terrain = "rock";
      features.push("tree");
    } else if (isEdge) {
      terrain = "shore";
    } else if (dist <= 1) {
      // Center area — shelter
      terrain = "shore";
      height = 0.8;
      if (q === 0 && r === 0) features.push("shelter");
    }

    // Lore cave on north side
    if (q === 1 && r === -4) {
      terrain = "rock";
      height = 3;
      features.push("lore_cave");
    }

    cells.push({ q, r, height, terrain, features: features.length ? features : undefined });
  }

  return cells;
}

// ─── Island 2: Navigate ─────────────────────────────────────────────────────
// Rocky walls, narrow fjords, whirlpools, shipwrecks

function generateNavigate(): HexCell[] {
  const cells: HexCell[] = [];
  const disk = hexDisk(5);

  for (const { q, r } of disk) {
    const dist = hexDist(q, r);
    // Create fjord channels: alternating walls and water
    const isWall = Math.abs(q) % 2 === 0 && dist < 4;
    const isChannel = Math.abs(q) % 2 === 1;

    let height: number;
    let terrain: TerrainType;
    const features: HexFeature[] = [];

    if (isWall && dist < 4) {
      height = 6 + Math.random() * 3;
      terrain = "cliff";
      if (Math.random() < 0.3) {
        terrain = "forest";
        features.push("tree");
      }
    } else if (isChannel || dist >= 4) {
      height = 0;
      terrain = "ocean";
      if (Math.random() < 0.15) features.push("whirlpool");
      if (Math.random() < 0.08) features.push("shipwreck");
    } else {
      height = 2 + Math.random() * 2;
      terrain = "rock";
    }

    cells.push({ q, r, height, terrain, features: features.length ? features : undefined });
  }

  return cells;
}

// ─── Island 3: Engineer ─────────────────────────────────────────────────────
// Fossilized tree stumps as towers, bridges between, ape creatures

function generateEngineer(): HexCell[] {
  const cells: HexCell[] = [];
  const disk = hexDisk(5);

  // Define stump center positions (clusters of tall hexes)
  const stumps = [
    { q: 0, r: 0 },   // Central giant stump
    { q: -3, r: 1 },  // Left stump
    { q: 3, r: -2 },  // Right stump
    { q: 0, r: -3 },  // North stump
    { q: -1, r: 3 },  // South stump
    { q: 2, r: 1 },   // Southeast
  ];

  for (const { q, r } of disk) {
    // Check if near any stump center
    let nearestStumpDist = Infinity;
    for (const s of stumps) {
      const d = hexDist(q - s.q, r - s.r);
      nearestStumpDist = Math.min(nearestStumpDist, d);
    }

    let height: number;
    let terrain: TerrainType;
    const features: HexFeature[] = [];

    if (nearestStumpDist === 0) {
      // Stump center — tall
      height = 7 + Math.random() * 3;
      terrain = "stump";
      features.push("tree"); // Canopy on top
    } else if (nearestStumpDist === 1) {
      // Stump ring
      height = 5 + Math.random() * 2;
      terrain = "stump";
    } else if (nearestStumpDist === 2) {
      // Bridge zone (sometimes)
      if (Math.random() < 0.3) {
        height = 5;
        terrain = "forest"; // bridge/walkway
      } else {
        height = 0;
        terrain = "ocean";
      }
    } else {
      height = 0;
      terrain = "ocean";
      if (Math.random() < 0.1) features.push("whirlpool");
    }

    cells.push({ q, r, height, terrain, features: features.length ? features : undefined });
  }

  return cells;
}

// ─── Island 4: Battle ───────────────────────────────────────────────────────
// Single dark mountain in permanent storm. Weapons in sand. Lore cave at summit.

function generateBattle(): HexCell[] {
  const cells: HexCell[] = [];
  const disk = hexDisk(6);

  for (const { q, r } of disk) {
    const dist = hexDist(q, r);
    const features: HexFeature[] = [];

    // Mountain profile: height decreases from center
    let height = Math.max(0, 12 - dist * 2 + (Math.random() - 0.5));
    let terrain: TerrainType;

    if (dist <= 1) {
      terrain = "storm";
      height = 12 + Math.random();
      if (q === 0 && r === 0) features.push("lore_cave"); // Summit cave
    } else if (dist <= 3) {
      terrain = "storm";
      // Weapons scattered
      if (Math.random() < 0.4) features.push("weapon");
    } else if (dist <= 5) {
      terrain = "rock";
      height = Math.max(1, height);
      if (Math.random() < 0.2) features.push("weapon");
    } else {
      terrain = "shore";
      height = 0.5;
    }

    cells.push({ q, r, height, terrain, features: features.length ? features : undefined });
  }

  return cells;
}

// ─── Island 5: Seek (Caldera) ───────────────────────────────────────────────
// 5 islets in a ring. Each holds a KEY. Center = whirlpool/portal.

function generateSeek(): HexCell[] {
  const cells: HexCell[] = [];

  // 5 islet positions arranged in a ring (pentagonal)
  const isletCenters = [
    { q: 0, r: -5 },   // North
    { q: 4, r: -2 },   // Northeast
    { q: 3, r: 3 },    // Southeast
    { q: -3, r: 4 },   // Southwest
    { q: -4, r: 0 },   // Northwest
  ];

  // Generate small hex clusters for each islet
  isletCenters.forEach((center, i) => {
    const isletDisk = hexDisk(2);
    for (const { q: dq, r: dr } of isletDisk) {
      const q = center.q + dq;
      const r = center.r + dr;
      const dist = hexDist(dq, dr);
      const features: HexFeature[] = [];

      let height = 3 - dist + Math.random();
      let terrain: TerrainType = dist === 0 ? "rock" : "grass";

      if (dist === 0) {
        height = 4;
        features.push("key"); // Each center has a key
      }

      cells.push({ q, r, height, terrain, features: features.length ? features : undefined });
    }
  });

  // Center whirlpool area
  const centerDisk = hexDisk(2);
  for (const { q, r } of centerDisk) {
    cells.push({
      q, r,
      height: 0,
      terrain: "ocean",
      features: (q === 0 && r === 0) ? ["whirlpool", "portal"] : undefined,
    });
  }

  return cells;
}

// ─── Island 6: Magic ────────────────────────────────────────────────────────
// Same 5 islets as Seek + glowing city rising from center

function generateMagic(): HexCell[] {
  // Start with Seek's layout
  const cells = generateSeek();

  // Replace center ocean hexes with magic spire
  const spireRadius = 3;
  const spireDisk = hexDisk(spireRadius);
  for (const { q, r } of spireDisk) {
    const dist = hexDist(q, r);
    // Remove any existing ocean hex at this position
    const existingIdx = cells.findIndex(c => c.q === q && c.r === r && c.terrain === "ocean");
    if (existingIdx >= 0) cells.splice(existingIdx, 1);

    const height = 10 - dist * 2 + Math.random();
    cells.push({
      q, r,
      height: Math.max(2, height),
      terrain: "magic",
      features: (q === 0 && r === 0) ? ["spire"] : undefined,
    });
  }

  return cells;
}

// ─── Island 7: Train ────────────────────────────────────────────────────────
// Capsized siege engine — long hull, mechanical structures, ice/snow

function generateTrain(): HexCell[] {
  const cells: HexCell[] = [];

  // Hull shape: long and narrow, tilted
  for (let q = -8; q <= 8; q++) {
    const halfWidth = q >= -4 && q <= 4 ? 3 : 2;
    for (let r = -halfWidth; r <= halfWidth; r++) {
      const features: HexFeature[] = [];
      const distFromCenter = hexDist(q, r);

      // Tilted hull: higher on one side
      const tiltOffset = r * 0.8;
      let height = 3 + tiltOffset + Math.random() * 0.5;
      let terrain: TerrainType;

      if (Math.abs(q) <= 2 && Math.abs(r) <= 1) {
        // Central superstructure
        height = 6 + Math.random();
        terrain = "machine";
        if (q === 0 && r === 0) features.push("portal"); // The Door
      } else if (Math.abs(r) === halfWidth) {
        // Hull edges
        terrain = "ice";
        height = Math.max(1, height);
      } else {
        terrain = Math.random() < 0.4 ? "machine" : "ice";
        if (Math.random() < 0.15) features.push("ruin");
      }

      // Snow on top hexes
      if (height > 4 && Math.random() < 0.3) terrain = "snow";

      cells.push({ q, r, height: Math.max(0.5, height), terrain, features: features.length ? features : undefined });
    }
  }

  return cells;
}

// ─── City Data Integration ──────────────────────────────────────────────────

import { getCitiesForIsland, mergeCity } from "./hexCityData";

/** Merge all city buildings into an island's base hex cells */
function withCities(islandId: number, baseCells: HexCell[]): HexCell[] {
  const cities = getCitiesForIsland(islandId);
  let cells = baseCells;
  for (const city of cities) {
    cells = mergeCity(cells, city);
  }
  return cells;
}

// ─── All Islands ────────────────────────────────────────────────────────────

export const ISLANDS: IslandDef[] = [
  {
    id: 1,
    name: "Harvest",
    loreTitle: "Harvest Island",
    theme: "Manufacturing",
    businessSkill: "Production & supply chain",
    worldPosition: { x: 0, z: 80 },
    colorAccent: "#c2b280",
    cells: withCities(1, generateHarvest()),
    loreBlurb: "You awake to the sound of waves. A desolate beach stretches before you...",
    connections: [2],
    cities: getCitiesForIsland(1),
  },
  {
    id: 2,
    name: "Navigate",
    loreTitle: "Navigate Island",
    theme: "Sales",
    businessSkill: "Market navigation & trade",
    worldPosition: { x: 16, z: 56 },
    colorAccent: "#4a4a4a",
    cells: generateNavigate(),
    loreBlurb: "Great walls of rock rise from the sea. Fjords snake through them like a maze...",
    connections: [1, 3],
  },
  {
    id: 3,
    name: "Engineer",
    loreTitle: "Engineer Island",
    theme: "R&D",
    businessSkill: "Research & development",
    worldPosition: { x: 24, z: 32 },
    colorAccent: "#6b4423",
    cells: generateEngineer(),
    loreBlurb: "Massive fossilized tree stumps reach from the sea. Bridges connect the spires...",
    connections: [2, 4],
  },
  {
    id: 4,
    name: "Battle",
    loreTitle: "Battle Island",
    theme: "Competition",
    businessSkill: "Competitive strategy",
    worldPosition: { x: 0, z: 8 },
    colorAccent: "#2d3748",
    cells: generateBattle(),
    loreBlurb: "A thunderhead covers this island in permanent storms. Weapons grow from the sand...",
    connections: [3, 5],
  },
  {
    id: 5,
    name: "Seek",
    loreTitle: "Seek Island",
    theme: "Quality",
    businessSkill: "Quality assurance & testing",
    worldPosition: { x: -3, z: -20 },
    colorAccent: "#7a7a7a",
    cells: generateSeek(),
    loreBlurb: "A chain of five islands crowned by glaciers. Seek the keys...",
    connections: [4, 6],
  },
  {
    id: 6,
    name: "Magic",
    loreTitle: "Magic Island",
    theme: "Service",
    businessSkill: "Customer service & delight",
    worldPosition: { x: -3, z: -20 },  // Same position as Seek — rises from center
    colorAccent: "#00ff88",
    cells: generateMagic(),
    loreBlurb: "The hidden city of magic reveals itself, rising from the depths...",
    connections: [5, 7],
  },
  {
    id: 7,
    name: "Train",
    loreTitle: "Train Island",
    theme: "Leadership",
    businessSkill: "Team building & management",
    worldPosition: { x: -8, z: -48 },
    colorAccent: "#b8d4e3",
    cells: generateTrain(),
    loreBlurb: "A great siege engine lies capsized in the water, miles long, reclaimed by nature...",
    connections: [6],
  },
];

// ─── Connection Paths ───────────────────────────────────────────────────────

export const JOURNEY_PATH = [1, 2, 3, 4, 5, 7]; // 6 shares position with 5

/** Get island by ID */
export function getIsland(id: number): IslandDef | undefined {
  return ISLANDS.find(i => i.id === id);
}
