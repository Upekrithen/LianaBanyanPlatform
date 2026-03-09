/**
 * HEXISLE CITY DATA
 * =================
 * Defines the interior structures of cities within each island.
 * Each city is a collection of named buildings, each building a cluster
 * of HexCells that overlay the base island terrain.
 *
 * VERDANA — THE PORT CITY
 * ========================
 * The first city. A "sampler of all" 12 city types as mini-districts:
 *
 *   1. Tower of Peace      (Book of Peace / Knowledge)
 *   2. Harbor District      (Trade & Logistics)
 *   3. Market Square        (Commerce)
 *   4. The Tavern           (Assembly / Ghost World staging)
 *   5. Canal Quarter        (Arts & Entertainment — Vienna-style canals)
 *   6. Forge Corner         (Manufacturing / Innovation)
 *   7. The Garden           (Agriculture / Growth)
 *   8. Academy Terrace      (Education)
 *   9. Alchemist's Nook     (Research / R&D)
 *  10. The Ramparts         (Defense / Fortress Walls)
 *  11. Artisan Lane         (Crafts & Design)
 *  12. The Common           (Community / Assembly)
 *
 * Plus: The Hexagon Compound (WALLED, separate), Canteen, First Guild Tower,
 * Example Keep, The Well, Pipe Portal Stations, Storefronts, The Inn.
 */

import { type HexCell, type CityDef, type CityBuilding, type BuildingArchetype } from "./hexIsleWorldData";
import { getCanalHexCells, getCanalVenueBuildings } from "./hexCanalDistrict";
import { getPipeStationBuildings } from "./hexPipePortals";

// ─── Building Generators (Original) ──────────────────────────────────────────

/**
 * The Hexagon — THE iconic central structure.
 * 7-hex rosette: 1 center hex + 6 surrounding ring hexes.
 */
function buildTheHexagon(
  centerQ: number,
  centerR: number,
): CityBuilding {
  const ring = [
    { dq: 1, dr: 0 },
    { dq: 1, dr: -1 },
    { dq: 0, dr: -1 },
    { dq: -1, dr: 0 },
    { dq: -1, dr: 1 },
    { dq: 0, dr: 1 },
  ];

  const cells: HexCell[] = [
    { q: centerQ, r: centerR, height: 7, terrain: "stone", features: ["shelter"] },
    ...ring.map(({ dq, dr }) => ({
      q: centerQ + dq,
      r: centerR + dr,
      height: 5 + Math.random() * 0.5,
      terrain: "stone" as const,
    })),
  ];

  return {
    name: "The Hexagon",
    type: "hexagon",
    cells,
    labelQ: centerQ,
    labelR: centerR,
    labelHeight: 10,
    color: "#d4a855",
    description: "The central hub of Verdana. All roads lead to The Hexagon.",
  };
}

/** Elongated meeting/assembly building. */
function buildHall(
  name: string,
  startQ: number,
  startR: number,
  direction: "east" | "southeast" | "northeast",
  length: number = 4,
): CityBuilding {
  const dirOffsets = {
    east: { dq: 1, dr: 0 },
    southeast: { dq: 0, dr: 1 },
    northeast: { dq: 1, dr: -1 },
  };
  const dir = dirOffsets[direction];

  const cells: HexCell[] = [];
  for (let i = 0; i < length; i++) {
    const q = startQ + dir.dq * i;
    const r = startR + dir.dr * i;
    const isEndcap = i === 0 || i === length - 1;
    cells.push({ q, r, height: isEndcap ? 3.5 : 4, terrain: "stone" });
  }

  const midIdx = Math.floor(length / 2);
  return {
    name,
    type: "hall",
    cells,
    labelQ: startQ + dir.dq * midIdx,
    labelR: startR + dir.dr * midIdx,
    labelHeight: 7,
    color: "#8b6f47",
    description: "A gathering place for council, ceremony, and fellowship.",
  };
}

/** Waterfront docks and warehouses. */
function buildHarbor(
  positions: Array<{ q: number; r: number; height: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r, height }) => ({
    q, r, height,
    terrain: height <= 1.5 ? "shore" as const : "stone" as const,
  }));

  return {
    name: "The Harbor",
    type: "harbor",
    cells,
    labelQ,
    labelR,
    labelHeight: 5,
    color: "#4a90d9",
    description: "Where ships dock and goods flow. The lifeline of trade.",
  };
}

/** Fortified tower cluster. */
function buildKeep(
  name: string,
  centerQ: number,
  centerR: number,
  adjacentOffsets: Array<{ dq: number; dr: number }>,
): CityBuilding {
  const cells: HexCell[] = [
    { q: centerQ, r: centerR, height: 8, terrain: "stone" },
    ...adjacentOffsets.map(({ dq, dr }) => ({
      q: centerQ + dq,
      r: centerR + dr,
      height: 6 + Math.random() * 0.5,
      terrain: "stone" as const,
    })),
  ];

  return {
    name,
    type: "keep",
    cells,
    labelQ: centerQ,
    labelR: centerR,
    labelHeight: 11,
    color: "#7a6d5e",
    description: "A fortified tower. Protection for the city and its people.",
  };
}

/** Guild-specific tall tower. */
function buildGuildTower(
  guildName: string,
  q: number,
  r: number,
  height: number = 9,
  color: string = "#b8860b",
): CityBuilding {
  return {
    name: `${guildName} Tower`,
    type: "guild_tower",
    cells: [{ q, r, height, terrain: "stone" }],
    labelQ: q,
    labelR: r,
    labelHeight: height + 3,
    color,
    description: `The tower of the ${guildName}. A beacon of expertise.`,
  };
}

/** Commerce/trade area with low platforms. */
function buildMarket(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 1.5 + Math.random() * 0.3,
    terrain: "stone" as const,
  }));

  return {
    name: "Market Square",
    type: "market",
    cells,
    labelQ,
    labelR,
    labelHeight: 5,
    color: "#2ecc71",
    description: "The bustling heart of commerce. Stalls, carts, and traders.",
  };
}

/** City entrance/wall structure. */
function buildGate(
  centerQ: number,
  centerR: number,
  flanks: Array<{ dq: number; dr: number }>,
): CityBuilding {
  const cells: HexCell[] = [
    { q: centerQ, r: centerR, height: 3, terrain: "stone" },
    ...flanks.map(({ dq, dr }) => ({
      q: centerQ + dq,
      r: centerR + dr,
      height: 5.5,
      terrain: "stone" as const,
    })),
  ];

  return {
    name: "The Gate",
    type: "gate",
    cells,
    labelQ: centerQ,
    labelR: centerR,
    labelHeight: 8,
    color: "#95a5a6",
    description: "The main entrance to the city. All who enter are welcome.",
  };
}

/** Water infrastructure hex. */
function buildWell(
  q: number,
  r: number,
  wellType: string,
): CityBuilding {
  return {
    name: `The ${wellType}`,
    type: "well",
    cells: [{ q, r, height: 2, terrain: "stone" }],
    labelQ: q,
    labelR: r,
    labelHeight: 5,
    color: "#3498db",
    description: "Fresh water for the people. The foundation of life.",
  };
}

// ─── New Building Generators (Port City Districts) ──────────────────────────

/** Tower of Peace — tall 3-hex knowledge citadel. Home of Sinbad. */
function buildTower(
  name: string,
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }, i) => ({
    q, r,
    height: i === 0 ? 11 : 10 + Math.random() * 0.5,
    terrain: "stone" as const,
  }));

  return {
    name,
    type: "tower",
    cells,
    labelQ,
    labelR,
    labelHeight: 14,
    color: "#f1c40f",
    description: "The knowledge citadel. Sinbad guards the archives within.",
  };
}

/** Tavern — crew prep area, L-shaped. */
function buildTavern(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 3 + Math.random() * 0.5,
    terrain: "stone" as const,
  }));

  return {
    name: "The Tavern",
    type: "tavern",
    cells,
    labelQ,
    labelR,
    labelHeight: 6,
    color: "#e67e22",
    description: "Crew staging area. Ghost World adventures begin here.",
  };
}

/** Canteen — dining/social spot. */
function buildCanteen(
  q: number,
  r: number,
): CityBuilding {
  return {
    name: "The Canteen",
    type: "canteen",
    cells: [
      { q, r, height: 3, terrain: "stone" },
      { q: q + 1, r, height: 2.8, terrain: "stone" },
    ],
    labelQ: q,
    labelR: r,
    labelHeight: 6,
    color: "#e74c3c",
    description: "Hot food and good company. Every adventure needs fuel.",
  };
}

/** Academy — education/training. */
function buildAcademy(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 3.5 + Math.random() * 0.3,
    terrain: "stone" as const,
  }));

  return {
    name: "Academy Terrace",
    type: "academy",
    cells,
    labelQ,
    labelR,
    labelHeight: 7,
    color: "#9b59b6",
    description: "Where knowledge meets practice. Training grounds and lecture halls.",
  };
}

/** Forge — manufacturing workshop. */
function buildForge(
  q: number,
  r: number,
): CityBuilding {
  return {
    name: "Forge Corner",
    type: "forge",
    cells: [
      { q, r, height: 4, terrain: "stone" },
      { q, r: r + 1, height: 3.5, terrain: "stone" },
    ],
    labelQ: q,
    labelR: r,
    labelHeight: 7,
    color: "#d35400",
    description: "The forge glows day and night. Prototypes and products born here.",
  };
}

/** Garden plot — small agricultural area. */
function buildGardenPlot(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 1.5,
    terrain: "grass" as const,
  }));

  return {
    name: "The Garden",
    type: "garden_plot",
    cells,
    labelQ,
    labelR,
    labelHeight: 4,
    color: "#27ae60",
    description: "Vertical farms and seed vaults. Growth in miniature.",
  };
}

/** Rampart — city wall segment with guard station. */
function buildRampart(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 5,
    terrain: "stone" as const,
  }));

  return {
    name: "The Ramparts",
    type: "rampart",
    cells,
    labelQ,
    labelR,
    labelHeight: 8,
    color: "#7f8c8d",
    description: "Defense Klaus HQ. The walls that guard Verdana.",
  };
}

/** Artisan shop row — craft workshops. */
function buildArtisanShop(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 2.5 + Math.random() * 0.3,
    terrain: "stone" as const,
  }));

  return {
    name: "Artisan Lane",
    type: "artisan_shop",
    cells,
    labelQ,
    labelR,
    labelHeight: 5,
    color: "#8e44ad",
    description: "Craft workshops and design studios. Where hands shape ideas.",
  };
}

/** The Common — open town square, event space. */
function buildCommons(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 0.5,
    terrain: "stone" as const,
  }));

  return {
    name: "The Common",
    type: "commons",
    cells,
    labelQ,
    labelR,
    labelHeight: 4,
    color: "#1abc9c",
    description: "The town square. Events, votes, and celebrations happen here.",
  };
}

/** Alchemist's Nook — R&D lab. */
function buildAlchemistNook(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }) => ({
    q, r,
    height: 3 + Math.random() * 0.4,
    terrain: "stone" as const,
  }));

  return {
    name: "Alchemist's Nook",
    type: "workshop",
    cells,
    labelQ,
    labelR,
    labelHeight: 6,
    color: "#16a085",
    description: "R&D labs and testing grounds. The Star Chamber entrance lies within.",
  };
}

/** The Inn — accommodation with real-world bridge. */
function buildInn(
  positions: Array<{ q: number; r: number }>,
  labelQ: number,
  labelR: number,
): CityBuilding {
  const cells: HexCell[] = positions.map(({ q, r }, i) => ({
    q, r,
    height: i === 0 ? 4 : 3.5,
    terrain: "stone" as const,
  }));

  return {
    name: "The Wayward Rest",
    type: "inn",
    cells,
    labelQ,
    labelR,
    labelHeight: 7,
    color: "#f39c12",
    description: "Rest here. Save progress. Browse real-world accommodations.",
  };
}

/** Storefronts — rentable retail hexes. */
function buildStorefront(
  name: string,
  q: number,
  r: number,
): CityBuilding {
  return {
    name,
    type: "storefront",
    cells: [{ q, r, height: 3, terrain: "stone" }],
    labelQ: q,
    labelR: r,
    labelHeight: 5,
    color: "#2980b9",
    description: "Rentable retail space. Yours to name and operate.",
  };
}

/** Wall segment — for Hexagon Compound perimeter. */
function buildWallSegment(
  positions: Array<{ q: number; r: number }>,
): HexCell[] {
  return positions.map(({ q, r }) => ({
    q, r,
    height: 4.5,
    terrain: "stone" as const,
  }));
}

// ─── Verdana — The Port City ────────────────────────────────────────────────

/**
 * Generate the full Port City layout for Harvest Island.
 * "Verdana — The Port City" — sampler of all 12 city types.
 *
 * Layout (hex grid, island center = 0,0):
 *
 *   NW: Canal Quarter (-5,-1 to -2,3) — Vienna canals, galleries, gondolas
 *   N:  Tower of Peace (-2,-2 to -2,0) + Academy (-1,-2)
 *   NE: Alchemist's Nook (-3,-2)
 *   E:  Harbor (5,-1 to 5,1) + Forge (5,2) + Artisan Lane (4,1-2)
 *   C:  Hexagon Compound (walled, centered at 2,2)
 *   SE: Market Square (3,2-3) + Canteen (2,4)
 *   S:  Tavern (1,3-4) + Inn (0,4-5) + Garden (-1,3-4)
 *   SW: Gate (-1,5-6) + Ramparts + Common (-2,6-7)
 */
function generatePortCity(): CityDef {
  const buildings: CityBuilding[] = [];

  // ── 1. Tower of Peace (Book of Peace sampler) ──
  buildings.push(buildTower(
    "Tower of Peace",
    [{ q: -2, r: -1 }, { q: -2, r: 0 }, { q: -2, r: -2 }],
    -2, -1,
  ));

  // ── 2. Harbor District (Harbor sampler) ──
  buildings.push(buildHarbor(
    [
      { q: 5, r: 0, height: 1.5 },   // Main dock
      { q: 5, r: -1, height: 1.0 },   // Outer dock
      { q: 4, r: 1, height: 2.0 },    // Warehouse
      { q: 4, r: -1, height: 2.0 },   // Customs
      { q: 6, r: 0, height: 1.2 },    // Extended dock
    ],
    5, 0,
  ));

  // ── 3. Market Square (Marketplace Hub sampler) ──
  buildings.push(buildMarket(
    [
      { q: 3, r: 2 },
      { q: 3, r: 3 },
      { q: 4, r: 2 },
      { q: 3, r: 4 },
    ],
    3, 3,
  ));

  // ── 4. The Tavern (Assembly/Hearth sampler) ──
  buildings.push(buildTavern(
    [{ q: 1, r: 3 }, { q: 1, r: 4 }],
    1, 3,
  ));

  // ── 5. Canal Quarter (Concert Hall / Arts sampler) ──
  // Canal water channels + venue buildings come from hexCanalDistrict.ts
  // We add them below via getCanalHexCells() and getCanalVenueBuildings()

  // ── 6. Forge Corner (Forge of Innovation sampler) ──
  buildings.push(buildForge(5, 2));

  // ── 7. The Garden (Garden of Growth sampler) ──
  buildings.push(buildGardenPlot(
    [{ q: -1, r: 3 }, { q: -1, r: 4 }, { q: 0, r: 3 }],
    -1, 3,
  ));

  // ── 8. Academy Terrace (Academy Heights sampler) ──
  buildings.push(buildAcademy(
    [{ q: -1, r: -2 }, { q: 0, r: -2 }, { q: 0, r: -3 }],
    -1, -2,
  ));

  // ── 9. Alchemist's Nook (Alchemist's Quarter sampler) ──
  buildings.push(buildAlchemistNook(
    [{ q: -3, r: -2 }, { q: -3, r: -1 }],
    -3, -2,
  ));

  // ── 10. The Ramparts (Fortress Walls sampler) ──
  buildings.push(buildRampart(
    [{ q: -1, r: 5 }, { q: -2, r: 6 }, { q: 0, r: 5 }],
    -1, 5,
  ));

  // ── 11. Artisan Lane (Artisan Row sampler) ──
  buildings.push(buildArtisanShop(
    [{ q: 4, r: 1 }, { q: 3, r: 1 }],
    4, 1,
  ));

  // ── 12. The Common (Assembly Grounds sampler) ──
  buildings.push(buildCommons(
    [{ q: -2, r: 7 }, { q: -1, r: 7 }, { q: -2, r: 8 }],
    -2, 7,
  ));

  // ── The Hexagon Compound (WALLED, separate from Town Proper) ──
  buildings.push(buildTheHexagon(2, 2));

  // Compound wall (12-hex stone perimeter around The Hexagon)
  // The Hexagon rosette occupies: (2,2) center + ring at distance 1
  // Wall sits at distance 2 from center
  const wallCells = buildWallSegment([
    // Outer ring of the compound
    { q: 2, r: -1 }, { q: 3, r: -1 }, { q: 4, r: 0 },
    { q: 4, r: 1 },  { q: 3, r: 3 },  { q: 2, r: 4 },
    { q: 1, r: 4 },  { q: 0, r: 3 },  { q: -1, r: 3 },
    { q: 0, r: 1 },  { q: 0, r: 0 },  { q: 1, r: -1 },
  ]);
  buildings.push({
    name: "Compound Wall",
    type: "rampart",
    cells: wallCells,
    labelQ: 0, labelR: 0,
    labelHeight: 0, // Hidden label — wall itself is visual
    color: "#95a5a6",
    description: "The stone walls of The Hexagon Compound.",
  });

  // Star Chamber inside compound
  buildings.push(buildHall(
    "Star Chamber",
    3, 2,
    "east",
    2,
  ));

  // ── Hexagon Compound Gate (connects compound to Town Proper) ──
  buildings.push(buildGate(
    0, 2,
    [{ dq: -1, dr: 1 }, { dq: -1, dr: 0 }],
  ));

  // ── The Canteen ──
  buildings.push(buildCanteen(2, 4));

  // ── First Guild Tower ──
  buildings.push(buildGuildTower(
    "First Guild",
    1, 0,
    9,
    "#b8860b",
  ));

  // ── Example Keep (explorable tutorial, routes to /hexisle/keeps) ──
  buildings.push(buildKeep(
    "Example Keep",
    -1, -1,
    [{ dq: 0, dr: -1 }, { dq: -1, dr: 0 }],
  ));

  // ── The Well (artesian, central) ──
  buildings.push(buildWell(1, 2, "Artesian Well"));

  // ── The Inn (near Tavern) ──
  buildings.push(buildInn(
    [{ q: 0, r: 4 }, { q: 0, r: 5 }],
    0, 4,
  ));

  // ── Canal Quarter Buildings (from hexCanalDistrict.ts) ──
  const canalBuildings = getCanalVenueBuildings();
  buildings.push(...canalBuildings);

  // ── Pipe Portal Stations (from hexPipePortals.ts) ──
  const pipeBuildings = getPipeStationBuildings(1);
  buildings.push(...pipeBuildings);

  return {
    id: "verdana",
    name: "Verdana",
    subtitle: "The Port City",
    islandId: 1,
    buildings,
  };
}

// ─── Merge City Buildings into Island Cells ────────────────────────────────

/**
 * Merge city building hexes into an island's cell array.
 * Building hexes REPLACE any existing cell at the same coordinates.
 * Also merges canal water channel hexes.
 * Returns a new array (does not mutate input).
 */
export function mergeCity(baseCells: HexCell[], city: CityDef): HexCell[] {
  const result = [...baseCells];

  // Collect all building hex coordinates for fast lookup
  const buildingCoords = new Map<string, HexCell>();
  for (const building of city.buildings) {
    for (const cell of building.cells) {
      buildingCoords.set(`${cell.q},${cell.r}`, cell);
    }
  }

  // Also merge canal water channels (terrain type: "canal")
  if (city.islandId === 1) {
    const canalCells = getCanalHexCells();
    for (const cell of canalCells) {
      buildingCoords.set(`${cell.q},${cell.r}`, cell);
    }
  }

  // Replace existing cells and add new ones
  const replaced = new Set<string>();
  for (let i = 0; i < result.length; i++) {
    const key = `${result[i].q},${result[i].r}`;
    if (buildingCoords.has(key)) {
      result[i] = buildingCoords.get(key)!;
      replaced.add(key);
    }
  }

  // Add any building hexes that didn't replace existing cells
  for (const [key, cell] of buildingCoords) {
    if (!replaced.has(key)) {
      result.push(cell);
    }
  }

  return result;
}

// ─── Exports ───────────────────────────────────────────────────────────────

/** All defined cities, indexed by island ID */
export const CITY_REGISTRY: Record<number, CityDef[]> = {
  1: [generatePortCity()],
  // Future: add cities for other islands
  // 2: [generateNavigateCity()],
  // 3: [generateEngineerCity()],
};

/** Get cities for a specific island */
export function getCitiesForIsland(islandId: number): CityDef[] {
  return CITY_REGISTRY[islandId] ?? [];
}

/** Get all building hex cells for an island's cities (for merging) */
export function getCityOverlayCells(islandId: number): HexCell[] {
  const cities = getCitiesForIsland(islandId);
  const allCells: HexCell[] = [];
  for (const city of cities) {
    for (const building of city.buildings) {
      allCells.push(...building.cells);
    }
  }
  return allCells;
}

/** Get all building labels for an island (for 3D Html labels) */
export function getCityBuildingLabels(islandId: number): Array<{
  name: string;
  type: string;
  q: number;
  r: number;
  labelHeight: number;
  color: string;
  description: string;
  cityName: string;
}> {
  const cities = getCitiesForIsland(islandId);
  const labels: Array<{
    name: string;
    type: string;
    q: number;
    r: number;
    labelHeight: number;
    color: string;
    description: string;
    cityName: string;
  }> = [];

  for (const city of cities) {
    for (const building of city.buildings) {
      // Skip hidden labels (labelHeight 0 = structural, not labeled)
      if (building.labelHeight <= 0) continue;
      labels.push({
        name: building.name,
        type: building.type,
        q: building.labelQ,
        r: building.labelR,
        labelHeight: building.labelHeight,
        color: building.color,
        description: building.description,
        cityName: city.name,
      });
    }
  }

  return labels;
}
