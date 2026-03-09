/**
 * INTER-ISLAND TRAVEL SYSTEM — Ocean Crossings & Navigation
 * ===========================================================
 * Innovation #1530: Inter-Island Travel System
 *
 * Connects the 7 islands of HexIsle via ocean routes.
 * Travel is NOT instant — it's a journey with encounters, hazards, and choices.
 *
 * Architecture:
 *   - Vessel types determine which routes are available
 *   - Routes have distance, hazards, and encounter tables
 *   - Weather system affects travel time and risk
 *   - Beacons on each island serve as docking points
 *   - Travel costs Credits or Joules (stored surplus = long journeys)
 *   - Ghost players can travel but lose loot on the half-life decay
 *
 * Islands (canonical order):
 *   1. Harvest (farming, basics)
 *   2. Navigate (exploration, mapping)
 *   3. Engineer (building, crafting)
 *   4. Battle (competition, conflict)
 *   5. Seek (discovery, mystery)
 *   6. Magic (rises from center of Seek)
 *   7. Train (mastery, mentoring)
 *
 * "The sea doesn't care about your schedule. Respect the crossing."
 */

// ============================================================================
// TYPES
// ============================================================================

export type VesselType =
  | 'foot'          // Walking — island internal only, cannot cross water
  | 'rowboat'       // Adjacent island crossings only, slow, cheap
  | 'raft'          // Adjacent + 1 skip, medium speed, fragile
  | 'small_ship'    // Any discovered island, moderate speed
  | 'medium_ship'   // Any island, faster, cargo capacity
  | 'guild_vessel';  // Guild-owned, fastest, crew required

export type WeatherCondition =
  | 'calm'          // Perfect sailing. Base travel time.
  | 'fair'          // Minor waves. +10% time.
  | 'choppy'        // Rough seas. +25% time. Rowboats risky.
  | 'storm'         // Dangerous. +50% time. Rowboats/rafts cannot sail.
  | 'tempest';      // Impassable. No crossing possible. Wait it out.

export type TravelStatus =
  | 'docked'        // At port, not traveling
  | 'boarding'      // Preparing to depart
  | 'sailing'       // In transit
  | 'encounter'     // Random event during travel
  | 'arriving'      // Approaching destination
  | 'shipwrecked';  // Failed crossing (loot loss, return to origin)

export type EncounterType =
  | 'trade_ship'    // NPC merchant vessel — buy/sell at sea
  | 'flotsam'       // Salvageable wreckage — free items
  | 'sea_creature'  // Passive observation — lore/discovery
  | 'storm_front'   // Weather worsens — decision point
  | 'ghost_ship'    // Ghost World encounter — phantom vessel
  | 'pirate'        // Challenge — ante items or flee
  | 'lighthouse'    // Beacon — reveals map areas
  | 'whirlpool'     // Hazard — navigate or lose items
  | 'island_sighting'; // Discover new island

export interface OceanRoute {
  id: string;
  name: string;
  fromIslandId: number;
  toIslandId: number;
  // Route properties
  distanceNautical: number;     // Affects travel time
  baseTimeMinutes: number;      // At calm weather, medium_ship
  minimumVessel: VesselType;    // Smallest vessel that can attempt this route
  // Encounters
  encounterChance: number;      // 0-1 probability per travel segment
  encounterTable: EncounterTableEntry[];
  // Hazards
  hazardLevel: number;          // 1-10 difficulty
  commonWeather: WeatherCondition[];
  // Cost
  baseCostCredits: number;      // Ferry cost (NPC captain)
  baseCostJoules: number;       // Alternative: Joule payment
  // Discovery
  requiresDiscovery: boolean;   // Must player have found this route first?
  discoveryMethod: string;      // How to discover (e.g., "Complete Navigate Island quest")
  // Visual
  hexPath: Array<{ q: number; r: number }>; // Overworld hex path
}

export interface EncounterTableEntry {
  type: EncounterType;
  weight: number;               // Relative probability
  description: string;
  outcome: EncounterOutcome;
}

export interface EncounterOutcome {
  creditsGain?: number;
  creditsLoss?: number;
  itemGain?: string;
  itemLoss?: string;
  timeAdjustMinutes?: number;
  loreDiscovery?: string;
  mapReveal?: boolean;
  vesselDamage?: number;        // 0-100 percent
}

export interface TravelSession {
  id: string;
  playerId: string;
  routeId: string;
  vesselType: VesselType;
  status: TravelStatus;
  // Timing
  departedAt: string;
  estimatedArrivalAt: string;
  actualArrivalAt?: string;
  // Weather
  currentWeather: WeatherCondition;
  weatherChanges: WeatherChange[];
  // Encounters
  encounters: TravelEncounter[];
  // Cargo
  cargoItems: string[];         // Item IDs being transported
  cargoCapacity: number;        // Max items based on vessel
  // State
  progress: number;             // 0-100 percent of route completed
  vesselHealth: number;         // 0-100 percent
}

export interface WeatherChange {
  timestamp: string;
  from: WeatherCondition;
  to: WeatherCondition;
}

export interface TravelEncounter {
  id: string;
  type: EncounterType;
  description: string;
  occurredAt: string;
  resolved: boolean;
  playerChoice?: string;
  outcome: EncounterOutcome;
}

// ============================================================================
// VESSEL CONFIGURATION
// ============================================================================

export const VESSEL_CONFIG: Record<VesselType, {
  label: string;
  description: string;
  maxDistance: number;           // Max nautical distance per journey
  speedMultiplier: number;      // 1.0 = base speed
  cargoCapacity: number;        // Items
  survivalRating: number;       // 1-10 (how well it handles bad weather)
  acquisitionCost: number;      // Credits to acquire
  crewRequired: number;         // Minimum crew
  canTraverseWeather: WeatherCondition[];
}> = {
  foot: {
    label: 'On Foot',
    description: 'Walking. Cannot cross water.',
    maxDistance: 0,
    speedMultiplier: 0.5,
    cargoCapacity: 5,
    survivalRating: 0,
    acquisitionCost: 0,
    crewRequired: 0,
    canTraverseWeather: [],
  },
  rowboat: {
    label: 'Rowboat',
    description: 'Simple rowboat. Adjacent islands only. Slow but cheap.',
    maxDistance: 20,
    speedMultiplier: 0.5,
    cargoCapacity: 10,
    survivalRating: 2,
    acquisitionCost: 15,
    crewRequired: 1,
    canTraverseWeather: ['calm', 'fair'],
  },
  raft: {
    label: 'Raft',
    description: 'Makeshift raft. Can skip one island. Fragile.',
    maxDistance: 40,
    speedMultiplier: 0.6,
    cargoCapacity: 15,
    survivalRating: 3,
    acquisitionCost: 25,
    crewRequired: 1,
    canTraverseWeather: ['calm', 'fair', 'choppy'],
  },
  small_ship: {
    label: 'Small Ship',
    description: 'Proper sailing vessel. Any discovered island.',
    maxDistance: 100,
    speedMultiplier: 1.0,
    cargoCapacity: 30,
    survivalRating: 6,
    acquisitionCost: 100,
    crewRequired: 2,
    canTraverseWeather: ['calm', 'fair', 'choppy', 'storm'],
  },
  medium_ship: {
    label: 'Medium Ship',
    description: 'Cargo vessel. Fast, reliable, spacious.',
    maxDistance: 200,
    speedMultiplier: 1.5,
    cargoCapacity: 75,
    survivalRating: 8,
    acquisitionCost: 300,
    crewRequired: 4,
    canTraverseWeather: ['calm', 'fair', 'choppy', 'storm'],
  },
  guild_vessel: {
    label: 'Guild Vessel',
    description: 'Guild-owned flagship. Fastest. Full crew.',
    maxDistance: 500,
    speedMultiplier: 2.0,
    cargoCapacity: 150,
    survivalRating: 10,
    acquisitionCost: 0, // Guild-owned, not purchasable
    crewRequired: 8,
    canTraverseWeather: ['calm', 'fair', 'choppy', 'storm', 'tempest'],
  },
};

// ============================================================================
// OCEAN ROUTES — Canonical Connections
// ============================================================================

export const OCEAN_ROUTES: OceanRoute[] = [
  // === ADJACENT ROUTES (Rowboat accessible) ===
  {
    id: 'route-1-2',
    name: 'Harvest Strait',
    fromIslandId: 1, toIslandId: 2,
    distanceNautical: 15,
    baseTimeMinutes: 30,
    minimumVessel: 'rowboat',
    encounterChance: 0.2,
    encounterTable: [
      { type: 'flotsam', weight: 3, description: 'Driftwood and salvage from passing merchants', outcome: { itemGain: 'salvage-wood' } },
      { type: 'trade_ship', weight: 2, description: 'A merchant vessel heading north', outcome: {} },
      { type: 'sea_creature', weight: 1, description: 'Dolphins alongside your vessel', outcome: { loreDiscovery: 'Harvest dolphins are considered good luck by navigators' } },
    ],
    hazardLevel: 2,
    commonWeather: ['calm', 'fair'],
    baseCostCredits: 10,
    baseCostJoules: 5,
    requiresDiscovery: false,
    discoveryMethod: 'Available from start',
    hexPath: [],
  },
  {
    id: 'route-2-3',
    name: 'Navigator\'s Passage',
    fromIslandId: 2, toIslandId: 3,
    distanceNautical: 25,
    baseTimeMinutes: 45,
    minimumVessel: 'rowboat',
    encounterChance: 0.3,
    encounterTable: [
      { type: 'lighthouse', weight: 3, description: 'An ancient lighthouse beacon reveals the coast', outcome: { mapReveal: true } },
      { type: 'storm_front', weight: 2, description: 'Dark clouds approaching from the west', outcome: { timeAdjustMinutes: 15 } },
      { type: 'island_sighting', weight: 1, description: 'A distant island silhouette on the horizon', outcome: { loreDiscovery: 'Engineer Island visible through the morning mist' } },
    ],
    hazardLevel: 3,
    commonWeather: ['calm', 'fair', 'choppy'],
    baseCostCredits: 15,
    baseCostJoules: 8,
    requiresDiscovery: false,
    discoveryMethod: 'Available after arriving on Navigate Island',
    hexPath: [],
  },
  {
    id: 'route-3-4',
    name: 'Iron Channel',
    fromIslandId: 3, toIslandId: 4,
    distanceNautical: 30,
    baseTimeMinutes: 50,
    minimumVessel: 'raft',
    encounterChance: 0.35,
    encounterTable: [
      { type: 'pirate', weight: 3, description: 'A hostile vessel demands your cargo', outcome: { creditsLoss: 5 } },
      { type: 'whirlpool', weight: 2, description: 'Swirling waters threaten your course', outcome: { vesselDamage: 15, timeAdjustMinutes: 10 } },
      { type: 'ghost_ship', weight: 1, description: 'A translucent vessel passes silently', outcome: { loreDiscovery: 'Ghost ships are most common in the Iron Channel' } },
    ],
    hazardLevel: 5,
    commonWeather: ['fair', 'choppy'],
    baseCostCredits: 20,
    baseCostJoules: 12,
    requiresDiscovery: false,
    discoveryMethod: 'Available after arriving on Engineer Island',
    hexPath: [],
  },
  {
    id: 'route-4-5',
    name: 'Battle Narrows',
    fromIslandId: 4, toIslandId: 5,
    distanceNautical: 35,
    baseTimeMinutes: 60,
    minimumVessel: 'small_ship',
    encounterChance: 0.4,
    encounterTable: [
      { type: 'pirate', weight: 4, description: 'Arena runners challenge you to a wager', outcome: { creditsLoss: 10 } },
      { type: 'storm_front', weight: 3, description: 'The Narrows are famous for sudden squalls', outcome: { timeAdjustMinutes: 20 } },
      { type: 'trade_ship', weight: 2, description: 'A supply vessel carrying arena provisions', outcome: {} },
    ],
    hazardLevel: 7,
    commonWeather: ['choppy', 'storm'],
    baseCostCredits: 30,
    baseCostJoules: 18,
    requiresDiscovery: true,
    discoveryMethod: 'Complete Battle Island arena circuit',
    hexPath: [],
  },
  {
    id: 'route-5-6',
    name: 'The Ascension',
    fromIslandId: 5, toIslandId: 6,
    distanceNautical: 5,
    baseTimeMinutes: 15,
    minimumVessel: 'foot',
    encounterChance: 0.5,
    encounterTable: [
      { type: 'sea_creature', weight: 5, description: 'The waters glow with bioluminescence as Magic rises', outcome: { loreDiscovery: 'Magic Island rises from the heart of Seek when the seeker is ready' } },
    ],
    hazardLevel: 1,
    commonWeather: ['calm'],
    baseCostCredits: 0,
    baseCostJoules: 0,
    requiresDiscovery: true,
    discoveryMethod: 'Complete all Seek Island discovery quests — Magic rises from the center',
    hexPath: [],
  },
  {
    id: 'route-6-7',
    name: 'The Mastery Current',
    fromIslandId: 6, toIslandId: 7,
    distanceNautical: 50,
    baseTimeMinutes: 90,
    minimumVessel: 'medium_ship',
    encounterChance: 0.5,
    encounterTable: [
      { type: 'ghost_ship', weight: 3, description: 'A fleet of ghost ships surrounds your vessel', outcome: { loreDiscovery: 'The Mastery Current is where all ghost ships eventually drift' } },
      { type: 'lighthouse', weight: 2, description: 'The Founder\'s Beacon cuts through the fog', outcome: { mapReveal: true } },
      { type: 'storm_front', weight: 2, description: 'The final storm — a test of all you\'ve learned', outcome: { timeAdjustMinutes: 30, vesselDamage: 20 } },
    ],
    hazardLevel: 9,
    commonWeather: ['storm', 'tempest'],
    baseCostCredits: 50,
    baseCostJoules: 30,
    requiresDiscovery: true,
    discoveryMethod: 'Complete Magic Island mastery trials',
    hexPath: [],
  },

  // === SKIP ROUTES (Raft/Ship only) ===
  {
    id: 'route-1-3',
    name: 'The Long Reach',
    fromIslandId: 1, toIslandId: 3,
    distanceNautical: 45,
    baseTimeMinutes: 75,
    minimumVessel: 'raft',
    encounterChance: 0.35,
    encounterTable: [
      { type: 'trade_ship', weight: 3, description: 'A guild merchant vessel offers passage supplies', outcome: {} },
      { type: 'flotsam', weight: 3, description: 'Wreckage from a failed crossing', outcome: { itemGain: 'salvage-metal' } },
    ],
    hazardLevel: 4,
    commonWeather: ['fair', 'choppy'],
    baseCostCredits: 25,
    baseCostJoules: 15,
    requiresDiscovery: true,
    discoveryMethod: 'Purchase Sea Chart from Captain Salt',
    hexPath: [],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a vessel can attempt a specific route.
 */
export function canAttemptRoute(
  route: OceanRoute,
  vesselType: VesselType,
  currentWeather: WeatherCondition
): { canTravel: boolean; reason?: string } {
  const vessel = VESSEL_CONFIG[vesselType];
  const minimumVessel = VESSEL_CONFIG[route.minimumVessel];

  // Check vessel size
  if (vessel.maxDistance < route.distanceNautical) {
    return { canTravel: false, reason: `${vessel.label} cannot travel ${route.distanceNautical} nautical miles. Maximum: ${vessel.maxDistance}.` };
  }

  // Check weather tolerance
  if (!vessel.canTraverseWeather.includes(currentWeather)) {
    return { canTravel: false, reason: `${vessel.label} cannot sail in ${currentWeather} conditions.` };
  }

  // Check vessel minimum
  const vesselOrder: VesselType[] = ['foot', 'rowboat', 'raft', 'small_ship', 'medium_ship', 'guild_vessel'];
  if (vesselOrder.indexOf(vesselType) < vesselOrder.indexOf(route.minimumVessel)) {
    return { canTravel: false, reason: `This route requires at least a ${minimumVessel.label}.` };
  }

  return { canTravel: true };
}

/**
 * Calculate travel time based on vessel and weather.
 */
export function calculateTravelTime(
  route: OceanRoute,
  vesselType: VesselType,
  weather: WeatherCondition
): number {
  const vessel = VESSEL_CONFIG[vesselType];
  const weatherMultipliers: Record<WeatherCondition, number> = {
    calm: 1.0,
    fair: 1.1,
    choppy: 1.25,
    storm: 1.5,
    tempest: 999, // Should not be sailing
  };

  return Math.ceil(route.baseTimeMinutes / vessel.speedMultiplier * weatherMultipliers[weather]);
}

/**
 * Roll for a random encounter during travel.
 */
export function rollEncounter(route: OceanRoute): TravelEncounter | null {
  if (Math.random() > route.encounterChance) return null;

  // Weighted random selection
  const totalWeight = route.encounterTable.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of route.encounterTable) {
    roll -= entry.weight;
    if (roll <= 0) {
      return {
        id: crypto.randomUUID(),
        type: entry.type,
        description: entry.description,
        occurredAt: new Date().toISOString(),
        resolved: false,
        outcome: entry.outcome,
      };
    }
  }

  return null;
}

/**
 * Get available routes from an island.
 */
export function getRoutesFromIsland(islandId: number): OceanRoute[] {
  return OCEAN_ROUTES.filter(r => r.fromIslandId === islandId || r.toIslandId === islandId);
}

/**
 * Get the direct route between two islands (if exists).
 */
export function getRoute(fromIslandId: number, toIslandId: number): OceanRoute | null {
  return OCEAN_ROUTES.find(r =>
    (r.fromIslandId === fromIslandId && r.toIslandId === toIslandId) ||
    (r.fromIslandId === toIslandId && r.toIslandId === fromIslandId)
  ) || null;
}

export default {
  VESSEL_CONFIG,
  OCEAN_ROUTES,
  canAttemptRoute,
  calculateTravelTime,
  rollEncounter,
  getRoutesFromIsland,
  getRoute,
};
