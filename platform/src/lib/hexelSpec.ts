/**
 * HEXEL SPECIFICATION — The Physical Truth of HexIsle
 * =====================================================
 * Innovation #1535: Hexel Spec — 12-Piece Modular Hex Assembly
 *
 * CRITICAL DESIGN DOCUMENT: This defines the PHYSICAL hex system.
 * The digital world (3D renderer, 2D overworld) must reflect this truth.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHAT A HEXEL ACTUALLY IS:
 * ═══════════════════════════════════════════════════════════════════
 *
 * A Hexel is a 12-PIECE mechanical assembly. NOT a flat tile. NOT layers.
 * It is a modular machine with internal cavities.
 *
 * When Hexels connect to each other, their internal cavities link up
 * to form a DISTRIBUTED HYDRAULIC AND PNEUMATIC POWER NETWORK.
 * The connected cavity system IS the engine. Water and air pressure
 * flow through the linked network, powering gear systems and mechanisms
 * across the entire hex grid.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ANATOMY (bottom to top):
 * ═══════════════════════════════════════════════════════════════════
 *
 *   CAPSTONE ——————————————— Terrain skin (grass, sand, ice, etc.)
 *                            Sits on Slotted Top. DON'T interfere. ✓
 *
 *   SLOTTED TOP ——————————— "FlyingButtress" (v40 in Fusion 360)
 *     (FlyingButtress)       Universal interface. Trapdoor function.
 *                            Compliant mechanisms hold pieces above & below.
 *                            Red hexagonal cage with castellated edges.
 *
 *   TOP MODULE (1/4) ————— INTERCHANGEABLE — the top quarter of the Hexel:
 *                            • Wave Component → creates ocean/river surface
 *                            • Treasure Chest → loot container
 *                            • Monster Trap → encounter trigger
 *                            • Cave Entrance → vertical passage
 *                            • Mechanism Housing → custom game mechanic
 *                            • Empty → just the cavity below
 *
 *   HEXEL BODY (3/4) ————— The bottom three-quarters: 12-piece assembly.
 *                            Internal cavities that link with adjacent Hexels.
 *                            Connected cavities = hydraulic + pneumatic grid.
 *                            This IS the power system. This IS the engine.
 *
 * ═══════════════════════════════════════════════════════════════════
 * THE POWER GRID:
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Hexel body's internal cavities serve as:
 *   - Hydraulic channels (water/fluid under pressure → drives gears)
 *   - Pneumatic channels (air pressure → drives mechanisms)
 *   - Structural lattice (load-bearing framework)
 *
 * When you place Hexels side by side, their cavities CONNECT through
 * the lateral interfaces (gold rings, tripod anchors). The entire
 * hex grid becomes one continuous hydraulic/pneumatic system.
 *
 * Each Hexel is an ACCESS POINT into this power network.
 * The Slotted Top (FlyingButtress) trapdoor opens to reveal
 * whatever Top Module is installed, which in turn sits above
 * the cavity network.
 *
 * ═══════════════════════════════════════════════════════════════════
 * THE TERRAIN PROBLEM:
 * ═══════════════════════════════════════════════════════════════════
 *
 * CAPSTONES don't interfere — they're designed for the Slotted Top.
 * They sit on top, they snap on, they snap off. No problem.
 *
 * But OTHER TERRAIN (external systems, flat tiles, non-Hexel pieces)
 * MAY interfere because they could:
 *   1. Block the Slotted Top trapdoor mechanism
 *   2. Obstruct lateral cavity connections between Hexels
 *   3. Break the hydraulic/pneumatic seal at the edges
 *   4. Prevent access to the Top Module slot
 *   5. Add weight/height that the compliant mechanisms can't handle
 *
 * The Hexel system must be designed independently of flat hex standards.
 * External terrain compatibility requires an adapter, not conformance.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CAD COMPONENT MAP (FlyingButtress v40 — Fusion 360):
 * ═══════════════════════════════════════════════════════════════════
 *
 *   RED body        = SlottedTop PRESENT — the FlyingButtress cage
 *   CYAN pieces     = Compliant mechanism arms (flex-grip snap locks)
 *   ORANGE serpentine = Lateral inter-hex compliant connectors
 *   BLUE cylinders  = gorgon — central rotational lock mechanism
 *   GOLD rings      = Lateral sealing connections (3 of 6 vertices)
 *   ORANGE cylinders = tripodVerticesAnchor — vertical anchor posts (3 of 6)
 *   ORANGE sphere   = Joint element / pivot
 *
 * Related CAD files (threeSisters05 family):
 *   snapCap          = Capstone
 *   BedrockUnderworldSawtooth = Hexel body / Wave Component base
 *   medusaNake       = Variant mechanism
 *   rotor12          = Rotational component
 *   tripleThreat     = Multi-function variant
 *   Sawtooth60       = Compliant tooth mechanism
 *   goldenLotus07    = Connection ring variant
 *   ouralis15        = Structural component
 *
 * "The digital world IS the real world. We just haven't connected them yet."
 */

// ============================================================================
// HEXEL BODY — The 12-Piece Assembly
// ============================================================================

/**
 * The 12-piece Hexel assembly. Each piece has a role in the system.
 * The Founder's CAD uses the "threeSisters05" naming convention.
 * Piece names are derived from the Fusion 360 component browser.
 */
export type HexelPieceRole =
  | 'body_wall'           // Hexagonal wall segments (structural, forms cavity)
  | 'body_floor'          // Base plate / floor of the cavity
  | 'body_channel'        // Internal hydraulic/pneumatic channel walls
  | 'lateral_connector'   // Side-to-side hex connection interface
  | 'vertical_anchor'     // tripodVerticesAnchor — connects to piece above/below
  | 'seal_ring'           // Gold ring — seals lateral hydraulic connection
  | 'compliant_arm'       // Cyan flex-grip — holds pieces via material deflection
  | 'gorgon'              // Central rotational lock mechanism
  | 'snap_base'           // snapBase — foundation for snap connections
  | 'rotor'               // Rotational element for gear/mechanism interface
  | 'sawtooth'            // Compliant tooth for engagement/grip
  | 'top_module_seat';    // The socket where the Top Module sits

/**
 * The power network formed by connected Hexel cavities.
 */
export type PowerNetworkType =
  | 'hydraulic'           // Fluid under pressure — drives gear systems
  | 'pneumatic'           // Air under pressure — drives mechanisms
  | 'structural';         // Load-bearing lattice — no fluid

export type CavityConnectionState =
  | 'sealed'              // Connected and sealed to adjacent Hexel — fluid can flow
  | 'open'                // Connected but unsealed — air flows, fluid drains
  | 'blocked'             // Physically blocked (no adjacent Hexel on this side)
  | 'valved';             // Connected with controllable valve (can open/close flow)

export interface HexelCavityNetwork {
  /** 6 lateral connections (one per hex side) */
  lateralConnections: [
    CavityConnectionState, CavityConnectionState, CavityConnectionState,
    CavityConnectionState, CavityConnectionState, CavityConnectionState
  ];
  /** What's flowing through this Hexel's cavity */
  activeNetwork: PowerNetworkType;
  /** Pressure level in the cavity (0-1, where 1 = max operating pressure) */
  pressureLevel: number;
  /** Flow direction (radians, 0 = east) — for directional hydraulic flow */
  flowDirection?: number;
  /** Is this Hexel currently contributing power to the grid? */
  powered: boolean;
  /** Can the cavity be accessed from above (through Slotted Top)? */
  accessibleFromAbove: boolean;
}

// ============================================================================
// TOP MODULE — The Interchangeable Top Quarter
// ============================================================================

/**
 * The top 1/4 of each Hexel is an INTERCHANGEABLE module slot.
 * The Slotted Top sits ON TOP of whatever module is installed here.
 *
 * The module type determines what's revealed when the trapdoor opens.
 * This is NOT "water under every hex" — it's WHATEVER YOU PUT IN THE SLOT.
 */
export type TopModuleType =
  | 'wave_component'      // Ocean/river surface — wave motion visible
  | 'treasure_chest'      // Loot container — opens when trapdoor springs
  | 'monster_trap'        // Encounter trigger — creature emerges
  | 'cave_entrance'       // Vertical passage to underground/dungeon
  | 'mechanism_housing'   // Custom game mechanic (puzzle, lock, gear)
  | 'storage_vault'       // Secure storage (in-game inventory expansion)
  | 'spring_launcher'     // Launches player/objects upward (pneumatic powered)
  | 'empty';              // Nothing installed — just the raw cavity below

/**
 * Wave Component subtypes — when the Top Module IS a wave component.
 */
export type WaveType =
  | 'ocean'               // Deep ocean water — full wave action
  | 'shallows'            // Coastal shallow water — gentle wave
  | 'river'               // Flowing freshwater — directional current
  | 'lake'                // Still freshwater — minimal wave
  | 'lava_flow'           // Volcanic lava — same wave mechanics, lethal
  | 'frozen';             // Ice surface — frozen wave component

export interface TopModuleDef {
  /** What type of module is installed */
  type: TopModuleType;
  /** Wave subtype (only relevant if type === 'wave_component') */
  waveType?: WaveType;
  /** What's revealed when the Slotted Top trapdoor opens */
  revealContents: string;
  /** Is this module removable/swappable by the player? */
  playerSwappable: boolean;
  /** Does this module connect to the cavity power network? */
  usesCavityPower: boolean;
  /** Does this module produce sound? (water, hissing, growling, etc.) */
  ambientSound?: string;
  /** Custom data for the specific module type */
  moduleData?: Record<string, unknown>;
}

/**
 * What happens when the trapdoor reveals each module type.
 */
export const TOP_MODULE_REVEAL: Record<TopModuleType, {
  revealDescription: string;
  playerCanFallIn: boolean;
  emitsContent: boolean;
  soundCategory: string;
  requiresCavityPower: boolean;
}> = {
  wave_component:     { revealDescription: 'Water surface visible — wave motion active',     playerCanFallIn: true,  emitsContent: true,  soundCategory: 'splash',  requiresCavityPower: true  },
  treasure_chest:     { revealDescription: 'Chest visible below — loot accessible',          playerCanFallIn: false, emitsContent: false, soundCategory: 'creak',   requiresCavityPower: false },
  monster_trap:       { revealDescription: 'Creature springs from below!',                   playerCanFallIn: false, emitsContent: true,  soundCategory: 'roar',    requiresCavityPower: true  },
  cave_entrance:      { revealDescription: 'Dark passage descends into underground',         playerCanFallIn: true,  emitsContent: false, soundCategory: 'echo',    requiresCavityPower: false },
  mechanism_housing:  { revealDescription: 'Mechanical device exposed — interact to operate', playerCanFallIn: false, emitsContent: false, soundCategory: 'gear',    requiresCavityPower: true  },
  storage_vault:      { revealDescription: 'Vault storage accessible — inventory expansion',  playerCanFallIn: false, emitsContent: false, soundCategory: 'click',   requiresCavityPower: false },
  spring_launcher:    { revealDescription: 'Pneumatic launcher ready — WHOOSH!',             playerCanFallIn: false, emitsContent: true,  soundCategory: 'whoosh',  requiresCavityPower: true  },
  empty:              { revealDescription: 'Raw cavity visible — hydraulic network exposed',  playerCanFallIn: true,  emitsContent: false, soundCategory: 'silence', requiresCavityPower: false },
};

// ============================================================================
// SLOTTED TOP — "FlyingButtress" (The Universal Interface)
// ============================================================================

/**
 * The Slotted Top is "FlyingButtress v40" in the Founder's Fusion 360 CAD.
 *
 * Named after gothic flying buttresses because it transfers load from
 * whatever sits above (Capstones, buildings) down to the Hexel body
 * below, while keeping the structure open enough for the trapdoor to work.
 *
 * Physical structure (from CAD images):
 *   - RED hexagonal cage body with castellated (battlement-style) edges
 *   - 6 internal triangular sections radiating from center (star pattern)
 *   - CYAN compliant mechanism arms at vertices and sides (flex-grip)
 *   - BLUE gorgon at center (rotational lock)
 *   - Slots for lateral connection to adjacent Slotted Tops
 *   - TRAPDOOR function — each triangular section can open independently
 *
 * The compliant mechanisms use material deflection (not separate parts)
 * to achieve hinge/spring/latch functions. This is what holds both
 * the Capstone above and the Top Module below in place.
 */
export type TrapdoorState =
  | 'closed'              // Normal — terrain visible, walkable surface
  | 'open'                // Trapdoor sprung — reveals Top Module below
  | 'locked_closed'       // Mechanically locked shut (building on top, etc.)
  | 'locked_open'         // Permanently open (harbor, well, canal)
  | 'partial';            // Partially open (grate, portcullis, bridge gap)

export type SlotOccupant =
  | 'empty'               // Slot available
  | 'capstone'            // Terrain Capstone seated above
  | 'foundation'          // Building foundation locked in above
  | 'foliage'             // Tree/bush/undergrowth piece above
  | 'fixture'             // Permanent fixture (well, lamp post, pier)
  | 'mechanism'           // Moving part (drawbridge, gate, windmill)
  | 'top_module';         // Connected to Top Module below

export interface SlottedTopDef {
  /** Hex position in the grid */
  position: { q: number; r: number };
  /** Current trapdoor state */
  trapdoorState: TrapdoorState;
  /** What's in each edge slot (6 sides of the hex) */
  edgeSlots: [SlotOccupant, SlotOccupant, SlotOccupant, SlotOccupant, SlotOccupant, SlotOccupant];
  /** What's seated in the top slot (Capstone, foundation, etc.) */
  topSlot: SlotOccupant;
  /** What's connected below (Top Module interface) */
  bottomSlot: SlotOccupant;
  /** Whether the compliant mechanism is locked (prevents trapdoor) */
  mechanismLocked: boolean;
  /** Lock reason (if locked) */
  lockReason?: 'heavy_capstone' | 'building_above' | 'structural' | 'puzzle_locked' | 'frozen' | 'external_terrain';
  /** Hinge direction — which side the trapdoor pivots on (0-5) */
  hingeDirection: 0 | 1 | 2 | 3 | 4 | 5;
  /** Gorgon state — is the central rotational lock engaged? */
  gorgonEngaged: boolean;
  /** Can this Slotted Top be removed from the grid? */
  removable: boolean;
}

// ============================================================================
// CAPSTONE — Terrain Skin (Sits on Slotted Top)
// ============================================================================

/**
 * Capstones are terrain skins that snap onto the Slotted Top.
 * They are DESIGNED FOR THE SYSTEM — they DON'T interfere.
 *
 * "snapCap" in the Founder's CAD (threeSisters05_snapCap).
 */
export type CapstoneTerrain =
  | 'grass'               // Standard grassland — light, trapdoor-compatible
  | 'sand'                // Beach/desert — loose, trapdoor-compatible
  | 'undergrowth'         // Dense vegetation — flexes, trapdoor-compatible
  | 'rock'                // Stone — HEAVY, may lock trapdoor closed
  | 'ice'                 // Frozen — rigid, locks trapdoor closed
  | 'snow'                // Snow cover — light, trapdoor-compatible
  | 'lava'                // Volcanic crust — HEAVY, locks trapdoor, emissive
  | 'mud'                 // Swamp/marsh — soft, trapdoor-compatible
  | 'crystal'             // Magic terrain — translucent, shows below
  | 'coral'               // Reef surface — underwater terrain
  | 'ruin_stone'          // Ancient stonework — partial coverage, gaps
  | 'metal_plate'         // Industrial — heavy, locks trapdoor
  | 'wood_plank'          // Dock/bridge — trapdoor IS the plank
  | 'bare';               // No capstone — raw Slotted Top visible

export interface CapstoneTrapdoorBehavior {
  /** Can the trapdoor still open with this capstone seated? */
  allowsTrapdoor: boolean;
  /** If trapdoor opens, does the capstone fall through? */
  fallsOnOpen: boolean;
  /** If trapdoor opens, does the capstone hinge on one side? */
  hingesOnOpen: boolean;
  /** Weight class — heavy capstones may prevent trapdoor */
  weightClass: 'light' | 'medium' | 'heavy';
  /** Can you SEE the Top Module through this capstone? */
  transparent: boolean;
  /** Does this capstone let fluid through? (grate, coral, mud) */
  permeable: boolean;
}

export const CAPSTONE_BEHAVIORS: Record<CapstoneTerrain, CapstoneTrapdoorBehavior> = {
  grass:        { allowsTrapdoor: true,  fallsOnOpen: true,  hingesOnOpen: false, weightClass: 'light',  transparent: false, permeable: false },
  sand:         { allowsTrapdoor: true,  fallsOnOpen: true,  hingesOnOpen: false, weightClass: 'light',  transparent: false, permeable: true  },
  undergrowth:  { allowsTrapdoor: true,  fallsOnOpen: false, hingesOnOpen: true,  weightClass: 'light',  transparent: false, permeable: false },
  rock:         { allowsTrapdoor: false, fallsOnOpen: false, hingesOnOpen: false, weightClass: 'heavy',  transparent: false, permeable: false },
  ice:          { allowsTrapdoor: false, fallsOnOpen: false, hingesOnOpen: false, weightClass: 'heavy',  transparent: true,  permeable: false },
  snow:         { allowsTrapdoor: true,  fallsOnOpen: true,  hingesOnOpen: false, weightClass: 'light',  transparent: false, permeable: true  },
  lava:         { allowsTrapdoor: false, fallsOnOpen: false, hingesOnOpen: false, weightClass: 'heavy',  transparent: false, permeable: false },
  mud:          { allowsTrapdoor: true,  fallsOnOpen: true,  hingesOnOpen: false, weightClass: 'medium', transparent: false, permeable: true  },
  crystal:      { allowsTrapdoor: true,  fallsOnOpen: false, hingesOnOpen: true,  weightClass: 'medium', transparent: true,  permeable: false },
  coral:        { allowsTrapdoor: true,  fallsOnOpen: false, hingesOnOpen: false, weightClass: 'medium', transparent: false, permeable: true  },
  ruin_stone:   { allowsTrapdoor: true,  fallsOnOpen: false, hingesOnOpen: true,  weightClass: 'medium', transparent: false, permeable: false },
  metal_plate:  { allowsTrapdoor: false, fallsOnOpen: false, hingesOnOpen: false, weightClass: 'heavy',  transparent: false, permeable: false },
  wood_plank:   { allowsTrapdoor: true,  fallsOnOpen: false, hingesOnOpen: true,  weightClass: 'medium', transparent: false, permeable: false },
  bare:         { allowsTrapdoor: true,  fallsOnOpen: false, hingesOnOpen: false, weightClass: 'light',  transparent: false, permeable: false },
};

// ============================================================================
// EXTERNAL TERRAIN INTERFERENCE
// ============================================================================

/**
 * THE TERRAIN PROBLEM:
 *
 * Capstones: designed for the Slotted Top → DON'T interfere ✓
 * External terrain (non-Hexel pieces): MAY interfere ✗
 *
 * External terrain could interfere by:
 *   1. BLOCKING TRAPDOOR — foreign piece covers/jams the FlyingButtress
 *   2. BREAKING SEAL — piece disrupts lateral cavity connections,
 *      leaking hydraulic fluid or pneumatic pressure
 *   3. OBSTRUCTING MODULE SLOT — piece prevents Top Module swap
 *   4. OVERLOADING — too heavy for compliant mechanisms
 *   5. MISALIGNING — hex dimensions don't match, gaps/overlaps
 *
 * Severity levels determine digital-world representation.
 */
export type TerrainInterferenceLevel =
  | 'none'                // No interference — Capstones, designed accessories
  | 'cosmetic'            // Visual mismatch but mechanically OK
  | 'functional'          // Blocks trapdoor or module access
  | 'structural'          // Damages seal, leaks pressure from cavity network
  | 'destructive';        // Breaks compliant mechanisms, permanent damage

export interface ExternalTerrainCheck {
  /** The external terrain piece being evaluated */
  terrainSource: string;
  /** Does it physically fit on the Slotted Top? */
  fitsDimensions: boolean;
  /** Does it block the trapdoor mechanism? */
  blocksTrapdoor: boolean;
  /** Does it interfere with lateral Hexel connections? */
  breaksLateralSeal: boolean;
  /** Does it obstruct Top Module swapping? */
  blocksModuleAccess: boolean;
  /** Weight within compliant mechanism tolerance? */
  withinWeightLimit: boolean;
  /** Overall interference level */
  interferenceLevel: TerrainInterferenceLevel;
}

/**
 * Evaluate whether an external (non-Capstone) terrain piece
 * can sit on a Hexel without interfering with the system.
 */
export function checkExternalTerrainFit(
  weight: number,       // grams
  footprintMM: number,  // flat-to-flat dimension in mm
  heightMM: number,     // total height in mm
  isRigid: boolean,     // can it flex at all?
  coversEdges: boolean, // does it extend over the hex edges?
): ExternalTerrainCheck {
  const dims = HEXEL_PHYSICAL_DIMENSIONS;

  const fitsDimensions = footprintMM <= dims.hexFlatToFlat;
  const blocksTrapdoor = isRigid && heightMM > dims.capstoneMaxHeight;
  const breaksLateralSeal = coversEdges; // If it extends past hex edges, it disrupts neighbors
  const blocksModuleAccess = isRigid && !fitsDimensions;
  const withinWeightLimit = weight <= dims.compliantMaxLoadGrams;

  let interferenceLevel: TerrainInterferenceLevel = 'none';

  if (breaksLateralSeal) {
    interferenceLevel = 'structural';
  } else if (blocksTrapdoor || blocksModuleAccess) {
    interferenceLevel = 'functional';
  } else if (!fitsDimensions) {
    interferenceLevel = 'cosmetic';
  }

  if (!withinWeightLimit) {
    interferenceLevel = 'destructive';
  }

  return {
    terrainSource: 'external',
    fitsDimensions,
    blocksTrapdoor,
    breaksLateralSeal,
    blocksModuleAccess,
    withinWeightLimit,
    interferenceLevel,
  };
}

// ============================================================================
// COMPLETE HEXEL ASSEMBLY
// ============================================================================

/**
 * The complete Hexel — a 12-piece mechanical assembly.
 * Bottom 3/4 = structural body with hydraulic/pneumatic cavities.
 * Top 1/4 = interchangeable module slot.
 * Slotted Top on top of that.
 * Capstone on top of that.
 */
export interface HexelAssembly {
  /** Unique identifier */
  id: string;
  /** Grid position */
  position: { q: number; r: number };
  /** Island ID */
  islandId: number;
  /** District ID (if in a city) */
  districtId?: string;

  // ── HEXEL BODY (bottom 3/4) ──
  /** The internal cavity network state */
  cavityNetwork: HexelCavityNetwork;

  // ── TOP MODULE (top 1/4, interchangeable) ──
  /** What's installed in the top module slot */
  topModule: TopModuleDef;

  // ── SLOTTED TOP (FlyingButtress) ──
  /** The Slotted Top interface/trapdoor */
  slottedTop: SlottedTopDef;

  // ── CAPSTONE (terrain skin, optional) ──
  /** The terrain Capstone — null if bare */
  capstone: {
    terrain: CapstoneTerrain;
    /** Elevation added by the capstone */
    addedHeight: number;
    /** Capstone condition (wear, erosion, damage 0-100%) */
    condition: number;
    /** Custom color override (null = use TERRAIN_COLORS) */
    colorOverride?: string;
  } | null;

  // ── ABOVE CAPSTONE ──
  /** Features placed on the terrain surface */
  surfaceFeatures: SurfaceFeature[];
  /** Effective rendering height */
  totalHeight: number;
}

// ============================================================================
// SURFACE FEATURES — What sits ON the Capstone
// ============================================================================

export type SurfaceFeatureType =
  | 'building'            // Locks trapdoor (heavy)
  | 'tree'                // Falls if trapdoor opens
  | 'bush'                // Falls with capstone
  | 'boulder'             // Locks trapdoor (heavy)
  | 'sign_post'           // Light — on capstone
  | 'lamp_post'           // Fixture — through to Slotted Top
  | 'fence'               // Light — falls if trapdoor opens
  | 'bridge_segment'      // Spans hexels — anchored on edges
  | 'pier_post'           // Through all layers into water
  | 'well'                // Permanent opening through all layers
  | 'npc'                 // Character — affected by trapdoor
  | 'player'              // The player — affected by trapdoor
  | 'item_drop'           // Loose item — falls with capstone
  | 'pipe_entrance'       // Pipe Portal — through to underground
  | 'campfire'            // Light — on capstone
  | 'trap';               // Hidden — triggers trapdoor

export interface SurfaceFeature {
  type: SurfaceFeatureType;
  /** Does this feature lock the trapdoor? */
  locksTrapdoor: boolean;
  /** Does this feature fall when the trapdoor opens? */
  fallsWithCapstone: boolean;
  /** Does this feature go THROUGH the layers? */
  penetratesLayers: boolean;
  /** Feature height above capstone surface */
  height: number;
  /** Feature-specific data */
  data?: Record<string, unknown>;
}

export const SURFACE_FEATURE_DEFAULTS: Record<SurfaceFeatureType, Pick<SurfaceFeature, 'locksTrapdoor' | 'fallsWithCapstone' | 'penetratesLayers'>> = {
  building:        { locksTrapdoor: true,  fallsWithCapstone: false, penetratesLayers: false },
  tree:            { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  bush:            { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  boulder:         { locksTrapdoor: true,  fallsWithCapstone: false, penetratesLayers: false },
  sign_post:       { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  lamp_post:       { locksTrapdoor: false, fallsWithCapstone: false, penetratesLayers: true  },
  fence:           { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  bridge_segment:  { locksTrapdoor: false, fallsWithCapstone: false, penetratesLayers: false },
  pier_post:       { locksTrapdoor: false, fallsWithCapstone: false, penetratesLayers: true  },
  well:            { locksTrapdoor: false, fallsWithCapstone: false, penetratesLayers: true  },
  npc:             { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  player:          { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  item_drop:       { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  pipe_entrance:   { locksTrapdoor: false, fallsWithCapstone: false, penetratesLayers: true  },
  campfire:        { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
  trap:            { locksTrapdoor: false, fallsWithCapstone: true,  penetratesLayers: false },
};

// ============================================================================
// TERRAIN INTERACTION RULES (Capstone → Digital Terrain)
// ============================================================================

export interface TerrainInteractionRule {
  capstoneTerrain: CapstoneTerrain;
  /** Maps to TerrainType in hexIsleWorldData.ts */
  digitalTerrainType: string;
  /** Can this terrain coexist with an open trapdoor? */
  coexistsWithOpenTrapdoor: boolean;
  /** Can buildings be placed on this terrain? */
  allowsBuildings: boolean;
  /** Movement speed modifier (1.0 = normal) */
  movementSpeed: number;
  /** Can players stand on this? */
  walkable: boolean;
  /** What happens when trapdoor opens under this terrain */
  trapdoorOpenResult: 'falls_through' | 'hinges_open' | 'slides_off' | 'shatters' | 'blocked' | 'already_open';
}

export const TERRAIN_INTERACTION_RULES: TerrainInteractionRule[] = [
  { capstoneTerrain: 'grass',       digitalTerrainType: 'grass',    coexistsWithOpenTrapdoor: false, allowsBuildings: true,  movementSpeed: 1.0, walkable: true,  trapdoorOpenResult: 'falls_through' },
  { capstoneTerrain: 'sand',        digitalTerrainType: 'shore',    coexistsWithOpenTrapdoor: false, allowsBuildings: true,  movementSpeed: 0.8, walkable: true,  trapdoorOpenResult: 'falls_through' },
  { capstoneTerrain: 'undergrowth', digitalTerrainType: 'forest',   coexistsWithOpenTrapdoor: true,  allowsBuildings: false, movementSpeed: 0.6, walkable: true,  trapdoorOpenResult: 'hinges_open'   },
  { capstoneTerrain: 'rock',        digitalTerrainType: 'rock',     coexistsWithOpenTrapdoor: false, allowsBuildings: true,  movementSpeed: 0.9, walkable: true,  trapdoorOpenResult: 'blocked'       },
  { capstoneTerrain: 'ice',         digitalTerrainType: 'ice',      coexistsWithOpenTrapdoor: false, allowsBuildings: false, movementSpeed: 1.3, walkable: true,  trapdoorOpenResult: 'blocked'       },
  { capstoneTerrain: 'snow',        digitalTerrainType: 'snow',     coexistsWithOpenTrapdoor: false, allowsBuildings: true,  movementSpeed: 0.7, walkable: true,  trapdoorOpenResult: 'falls_through' },
  { capstoneTerrain: 'lava',        digitalTerrainType: 'volcanic', coexistsWithOpenTrapdoor: false, allowsBuildings: false, movementSpeed: 0.0, walkable: false, trapdoorOpenResult: 'blocked'       },
  { capstoneTerrain: 'mud',         digitalTerrainType: 'shore',    coexistsWithOpenTrapdoor: true,  allowsBuildings: false, movementSpeed: 0.4, walkable: true,  trapdoorOpenResult: 'slides_off'    },
  { capstoneTerrain: 'crystal',     digitalTerrainType: 'magic',    coexistsWithOpenTrapdoor: true,  allowsBuildings: true,  movementSpeed: 1.0, walkable: true,  trapdoorOpenResult: 'hinges_open'   },
  { capstoneTerrain: 'coral',       digitalTerrainType: 'shore',    coexistsWithOpenTrapdoor: true,  allowsBuildings: false, movementSpeed: 0.5, walkable: true,  trapdoorOpenResult: 'already_open'  },
  { capstoneTerrain: 'ruin_stone',  digitalTerrainType: 'ruins',    coexistsWithOpenTrapdoor: true,  allowsBuildings: false, movementSpeed: 0.7, walkable: true,  trapdoorOpenResult: 'hinges_open'   },
  { capstoneTerrain: 'metal_plate', digitalTerrainType: 'machine',  coexistsWithOpenTrapdoor: false, allowsBuildings: true,  movementSpeed: 1.0, walkable: true,  trapdoorOpenResult: 'blocked'       },
  { capstoneTerrain: 'wood_plank',  digitalTerrainType: 'stone',    coexistsWithOpenTrapdoor: true,  allowsBuildings: true,  movementSpeed: 1.0, walkable: true,  trapdoorOpenResult: 'hinges_open'   },
  { capstoneTerrain: 'bare',        digitalTerrainType: 'rock',     coexistsWithOpenTrapdoor: true,  allowsBuildings: true,  movementSpeed: 1.0, walkable: true,  trapdoorOpenResult: 'already_open'  },
];

// ============================================================================
// HEXEL-TO-HEXCELL BRIDGE (Physical → Digital Renderer)
// ============================================================================

/**
 * Maps a physical HexelAssembly to the simpler HexCell used by the 3D renderer.
 * The renderer doesn't need to know about hydraulic cavities or compliant
 * mechanisms — it needs terrain type, height, and features.
 */
export function hexelToHexCell(hexel: HexelAssembly): {
  q: number;
  r: number;
  height: number;
  terrain: string;
  features: string[];
} {
  let terrain: string;

  if (hexel.slottedTop.trapdoorState === 'locked_open' || hexel.slottedTop.trapdoorState === 'open') {
    // Trapdoor open — terrain determined by what Top Module is installed
    switch (hexel.topModule.type) {
      case 'wave_component':
        switch (hexel.topModule.waveType) {
          case 'ocean':
          case 'shallows':
            terrain = 'ocean';
            break;
          case 'river':
          case 'lake':
            terrain = 'canal';
            break;
          case 'lava_flow':
            terrain = 'volcanic';
            break;
          case 'frozen':
            terrain = 'ice';
            break;
          default:
            terrain = 'ocean';
        }
        break;
      case 'cave_entrance':
        terrain = 'ruins';
        break;
      case 'mechanism_housing':
        terrain = 'machine';
        break;
      case 'empty':
        terrain = 'rock'; // Raw cavity visible
        break;
      default:
        terrain = 'stone';
    }
  } else if (hexel.capstone) {
    const rule = TERRAIN_INTERACTION_RULES.find(r => r.capstoneTerrain === hexel.capstone!.terrain);
    terrain = rule?.digitalTerrainType ?? 'grass';
  } else {
    terrain = 'stone'; // Bare Slotted Top
  }

  const features: string[] = hexel.surfaceFeatures
    .map(f => {
      switch (f.type) {
        case 'tree': return 'tree';
        case 'building': return 'ruin';
        case 'well': return 'cave';
        case 'pipe_entrance': return 'portal';
        case 'trap': return 'key';
        default: return '';
      }
    })
    .filter(Boolean);

  return {
    q: hexel.position.q,
    r: hexel.position.r,
    height: hexel.totalHeight,
    terrain,
    features,
  };
}

// ============================================================================
// PHYSICAL DIMENSIONS — PLACEHOLDER (Awaiting Founder Finalization)
// ============================================================================

/**
 * Physical dimensions of the Hexel assembly.
 * NOTE: PLACEHOLDER values. The Founder is completing the water table
 * channel connections on the physical prototypes (FlyingButtress v40).
 * These will be updated when finalized.
 */
export const HEXEL_PHYSICAL_DIMENSIONS = {
  // Hex geometry
  hexFlatToFlat: 50,              // mm — flat-to-flat diameter
  hexPointToPoint: 57.74,         // mm — point-to-point
  hexSideLength: 28.87,           // mm — individual side

  // Hexel body (bottom 3/4 — 12-piece assembly)
  hexelBodyHeight: 22.5,          // mm — total body height (3/4 of full)
  cavityDiameter: 40,             // mm — internal cavity usable space
  cavityWallThickness: 2,         // mm — walls between cavity and exterior
  lateralChannelDiameter: 5,      // mm — inter-hex hydraulic channel
  lateralSealWidth: 3,            // mm — seal ring contact width
  tripodAnchorDiameter: 6,        // mm — vertical anchor post diameter
  tripodAnchorDepth: 8,           // mm — how deep the anchor engages

  // Top Module (top 1/4 — interchangeable)
  topModuleHeight: 7.5,           // mm — module slot height (1/4 of full)
  topModuleSnapDepth: 2,          // mm — how deep module seats into body
  waveAmplitude: 3,               // mm — max wave peak height (wave module)

  // Slotted Top (FlyingButtress)
  slottedTopHeight: 8,            // mm — including mechanism
  slotWidth: 2.5,                 // mm — compliant mechanism slot width
  slotDepth: 4,                   // mm — slot depth
  compliantThickness: 1.2,        // mm — flex arm thickness
  compliantMaxLoadGrams: 150,     // grams — max load before mechanism failure
  trapdoorHingeWidth: 3,          // mm — hinge connection width
  trapdoorClearance: 0.5,         // mm — gap for trapdoor swing
  gorgonDiameter: 8,              // mm — central rotational lock

  // Capstone
  capstoneHeight: 6,              // mm — terrain piece height
  capstoneMaxHeight: 10,          // mm — max before blocking trapdoor
  capstoneSnapDepth: 2,           // mm — seats into Slotted Top
  capstoneTextureDepth: 1.5,      // mm — surface texture relief

  // Full assembly
  totalAssemblyHeight: 44,        // mm — body(22.5) + module(7.5) + slotted(8) + capstone(6)
  wallThickness: 2,               // mm — minimum anywhere
  tolerance: 0.3,                 // mm — manufacturing tolerance (+/-)
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Can a trapdoor be opened at this hexel?
 */
export function canOpenTrapdoor(hexel: HexelAssembly): {
  canOpen: boolean;
  reason?: string;
} {
  const { slottedTop, capstone, surfaceFeatures } = hexel;

  if (slottedTop.trapdoorState === 'open' || slottedTop.trapdoorState === 'locked_open') {
    return { canOpen: false, reason: 'Trapdoor is already open' };
  }
  if (slottedTop.mechanismLocked) {
    return { canOpen: false, reason: `Trapdoor locked: ${slottedTop.lockReason}` };
  }
  if (slottedTop.gorgonEngaged) {
    return { canOpen: false, reason: 'Gorgon lock is engaged — must disengage first' };
  }
  if (capstone) {
    const behavior = CAPSTONE_BEHAVIORS[capstone.terrain];
    if (!behavior.allowsTrapdoor) {
      return { canOpen: false, reason: `${capstone.terrain} capstone is too heavy` };
    }
  }
  const blockingFeature = surfaceFeatures.find(f => f.locksTrapdoor);
  if (blockingFeature) {
    return { canOpen: false, reason: `${blockingFeature.type} locks the trapdoor` };
  }

  return { canOpen: true };
}

/**
 * What happens when a trapdoor opens? Returns the event sequence.
 */
export function getTrapdoorOpenSequence(hexel: HexelAssembly): string[] {
  const sequence: string[] = [];

  sequence.push('Gorgon lock releases, trapdoor mechanism activates');

  // Capstone behavior
  if (hexel.capstone) {
    const behavior = CAPSTONE_BEHAVIORS[hexel.capstone.terrain];
    if (behavior.fallsOnOpen) {
      sequence.push(`${hexel.capstone.terrain} capstone falls through`);
    } else if (behavior.hingesOnOpen) {
      sequence.push(`${hexel.capstone.terrain} capstone hinges open on side ${hexel.slottedTop.hingeDirection}`);
    }
  }

  // Surface features
  for (const feature of hexel.surfaceFeatures) {
    if (feature.fallsWithCapstone) {
      sequence.push(`${feature.type} falls with the capstone`);
    }
  }

  // Top Module reveal
  const reveal = TOP_MODULE_REVEAL[hexel.topModule.type];
  sequence.push(`Revealed: ${reveal.revealDescription}`);

  if (reveal.requiresCavityPower && hexel.cavityNetwork.powered) {
    sequence.push('Cavity network powers the module mechanism');
  }

  if (reveal.playerCanFallIn) {
    sequence.push('Opening large enough for player to fall through');
  }

  sequence.push(`Sound: ${reveal.soundCategory}`);

  return sequence;
}

/**
 * Get the digital terrain mapping for a capstone type.
 */
export function getDigitalTerrain(capstoneTerrain: CapstoneTerrain): string {
  const rule = TERRAIN_INTERACTION_RULES.find(r => r.capstoneTerrain === capstoneTerrain);
  return rule?.digitalTerrainType ?? 'grass';
}

/**
 * Check if a capstone can be placed on a Slotted Top.
 */
export function canPlaceCapstone(
  slottedTop: SlottedTopDef,
  terrain: CapstoneTerrain
): { canPlace: boolean; reason?: string } {
  if (slottedTop.topSlot !== 'empty' && slottedTop.topSlot !== 'capstone') {
    return { canPlace: false, reason: `Top slot occupied by ${slottedTop.topSlot}` };
  }
  if (slottedTop.trapdoorState === 'open' || slottedTop.trapdoorState === 'locked_open') {
    const rule = TERRAIN_INTERACTION_RULES.find(r => r.capstoneTerrain === terrain);
    if (rule && !rule.coexistsWithOpenTrapdoor) {
      return { canPlace: false, reason: `${terrain} cannot be placed on open trapdoor` };
    }
  }
  return { canPlace: true };
}

/**
 * Check if a Top Module can be swapped while installed.
 */
export function canSwapTopModule(hexel: HexelAssembly): {
  canSwap: boolean;
  reason?: string;
} {
  if (hexel.slottedTop.trapdoorState !== 'open' && hexel.slottedTop.trapdoorState !== 'locked_open') {
    return { canSwap: false, reason: 'Trapdoor must be open to access Top Module' };
  }
  if (hexel.capstone && !CAPSTONE_BEHAVIORS[hexel.capstone.terrain].allowsTrapdoor) {
    return { canSwap: false, reason: 'Heavy capstone blocks module access' };
  }
  if (!hexel.topModule.playerSwappable) {
    return { canSwap: false, reason: 'This module is permanently installed' };
  }
  return { canSwap: true };
}

/**
 * Calculate total rendering height of a hexel assembly.
 */
export function calculateTotalHeight(hexel: HexelAssembly): number {
  let height = 0;

  // Hexel body base
  height += 2;

  // Top Module adds to height
  height += 1;

  // Slotted Top
  height += 1;

  // Capstone
  if (hexel.capstone) {
    height += hexel.capstone.addedHeight;
  }

  // Open trapdoor = hole (lower effective height)
  if (hexel.slottedTop.trapdoorState === 'open' || hexel.slottedTop.trapdoorState === 'locked_open') {
    height = Math.max(0, height - 2);
  }

  return height;
}

/**
 * Check if two adjacent Hexels can form a sealed cavity connection.
 */
export function canSealCavityConnection(
  hexelA: HexelAssembly,
  hexelB: HexelAssembly,
  sharedSideA: number,  // 0-5, which side of A faces B
): boolean {
  const sharedSideB = (sharedSideA + 3) % 6; // Opposite side

  // Both must have unblocked lateral connections on the shared sides
  const aState = hexelA.cavityNetwork.lateralConnections[sharedSideA];
  const bState = hexelB.cavityNetwork.lateralConnections[sharedSideB];

  // Can seal if both sides are 'open' (ready to connect)
  return aState === 'open' && bState === 'open';
}

// ============================================================================
// TERRAIN COMPATIBILITY MODES
// ============================================================================

/**
 * How the Hexel system presents itself in different contexts:
 *
 *   FULL HEXEL (canonical):
 *     12-piece assembly. Hydraulic/pneumatic grid. Top Modules.
 *     Trapdoors. Gorgon locks. The real thing.
 *     Use: 3D World, physical tabletop, VR.
 *
 *   TERRAIN OVERLAY (2D digital):
 *     Flat terrain rendering. No physical mechanics. Fast.
 *     Use: 2D Overworld view.
 *
 *   CAPSTONE SOCKET ADAPTER (physical bridge):
 *     Adapter plate for mounting Capstones on non-Hexel surfaces.
 *     No Slotted Top, no cavity network, no trapdoor.
 *     Use: Cross-system compatibility (WarHex, etc.)
 *     WARNING: loses all Hexel functionality — cosmetic only.
 */
export type TerrainCompatibilityMode = 'full_hexel' | 'terrain_overlay' | 'capstone_socket_adapter';

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  CAPSTONE_BEHAVIORS,
  TOP_MODULE_REVEAL,
  TERRAIN_INTERACTION_RULES,
  HEXEL_PHYSICAL_DIMENSIONS,
  SURFACE_FEATURE_DEFAULTS,
  hexelToHexCell,
  canOpenTrapdoor,
  getTrapdoorOpenSequence,
  getDigitalTerrain,
  canPlaceCapstone,
  canSwapTopModule,
  calculateTotalHeight,
  canSealCavityConnection,
  checkExternalTerrainFit,
};
