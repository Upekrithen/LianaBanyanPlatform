/**
 * HEXEL PIECE GRAMMAR — Formal Schema for All Physical Components
 * =================================================================
 * Innovation #1537: Hexel Piece Grammar — Complete Mechanical Taxonomy
 *
 * This is the CANONICAL machine-readable registry of every physical piece
 * in the Hexel system. Derived from exhaustive search of:
 *
 *   ✅ HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md (Jan 22, 2026 — Knight)
 *   ✅ PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md (24 innovations, 70 claims)
 *   ✅ HEXEL-TECHNICAL-SPECIFICATION-INNOVATION-54.md (Spec-54)
 *   ✅ KICKSTARTER-CAMPAIGN-2-HEXISLE-HEXEL-GAME.md
 *   ✅ HEXISLE_COMPONENT_GLOSSARY.md (OBJ mapping)
 *   ✅ Founder's verbal descriptions (Session 7E, March 8, 2026)
 *   ✅ hexelSpec.ts (Innovation #1535)
 *   ✅ hexelComponentMap.ts (Innovation #1536)
 *   ✅ 33-core innovations filing (Dec 10, 2025)
 *   ✅ Bag 6 diceless combat patent
 *   ✅ Tereno Hydraulic Gaming System licensing doc
 *
 * ═══════════════════════════════════════════════════════════════════
 * GAP ANALYSIS RESULTS:
 * ═══════════════════════════════════════════════════════════════════
 *
 * DOCUMENTED IN PATENTS BUT MISSING FROM CODE:
 *   ChannelLock, HollowLog, NeedleValve, Main Gear, Cradle,
 *   Football (cam follower), Swan Neck, SnapCap (connector),
 *   Timing Belt, Clamshell (SnapCap/SnapBottom housing),
 *   Hollow Rooster Tooth Air Pistons, Roots, Capwave,
 *   Compliant Mechanism Grippers, Flip-Lid, Flip-Axis
 *
 * DESCRIBED BY FOUNDER BUT NOT IN ANY PATENT DOC:
 *   TurnTable (flow redirector — push-down-and-turn),
 *   Sirens (pneumatic scream + magnetic flotation),
 *   Capshaft (assembly shaft through clamshell),
 *   PGear height-activated magnetic triggers for buildings/fenceposts,
 *   Timer Belt configurable multi-player triggers (3 for trap, 6 for portal),
 *   "Watering plants" as the pneumatic mechanic name
 *
 * ALREADY IN CODE (hexelSpec.ts + hexelComponentMap.ts):
 *   FlyingButtress/SlottedTop, Gorgon, SnapBase, TripodVerticesAnchor,
 *   Capstone/snapCap, BedrockUnderworldSawtooth, NueWall, Base,
 *   Helical Gear, Golden Lotus, Ouralis, Rotor, OG Gear Needle,
 *   BTHU Waterfall, RingOfPower, OneWay valve, SphereOfInfluence,
 *   Holder, Harmonized, Kirby, Sawtooth60, TripleThreat, MedusaNake,
 *   Signal/SignalRoof, Prototype pieces
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEFINITIVE HEXEL STACK (from Technical Handover, bottom to top):
 * ═══════════════════════════════════════════════════════════════════
 *
 *   12. CAPSTONE/CAPWAVE ————— Terrain surface (static) / Water surface (moves)
 *   11. CRADLE ———————————————— DYNAMIC: goes UP AND DOWN. Flips like SlottedTop.
 *                                SlottedTop sits ON TOP of Cradle. Trap trigger =
 *                                Cradle flip (can be water or land context).
 *                                Football (wave gen) rides inside Cradle.
 *   10. MAIN GEAR ———————————— Driven by 3x PGears, 12x Ouralis speed
 *    9. TIMING BELT —————————— Hidden below Sawtooth mushroom (optional)
 *    8. SAWTOOTH CORAL ——————— Ship keel engagement, slanted sides, 6 diff angles
 *    7. 3x PGEAR SHAFTS ————— At 3 vertices, mushroom heads, NeedleValve center
 *    6. OURALIS ——————————————— 20-tooth dual-level gear + rotor connection
 *    5. ROTOR ————————————————— Permanently attached to Ouralis after print
 *    4. GOLDEN LOTUS —————————— 6 Tesla-valve cups, Rooster Teeth, flow → rotation
 *    3. CLAMSHELL ———————————— SnapCap/SnapBottom waterproof housing for GL + Rotor
 *    2. HOLLOW LOG ——————————— Central fluid column, 15.5mm dia
 *    1. CHANNEL LOCK ————————— Base foundation, 60mm dia, 9mm tall, 3 grooves
 *    0. SWAN NECK ———————————— Inter-Hexel dual-channel hydraulic connector
 *
 * Note: The "12 pieces" in the Hexel refers to the internal assembly.
 * Additional pieces (Cradle, Football, Timing Belt, NeedleValve, etc.)
 * are sub-components that nest within the main stack.
 *
 * ═══════════════════════════════════════════════════════════════════
 * POWER CHAIN (from Bag 5, verified against Handover):
 * ═══════════════════════════════════════════════════════════════════
 *
 *   Water Table (2.17 psi) → Swan Neck → ChannelLock → HollowLog
 *   → Golden Lotus (6 Tesla cups + Rooster Teeth, AC → unidirectional)
 *   → Rotor (18 closed cavities, full 12mm height)
 *   → Ouralis (20T dual-level, 3 cam slopes for tide)
 *   → 3x PGears (20:3 = 6.67:1 speed, mushroom heads)
 *   → Main Gear (12x Ouralis speed)
 *   → Football cam (variable amplitude via Cradle height)
 *   → Wave Generator (BTHU Waterfall)
 *   OR → Trap mechanism (via Timing Belt countdown)
 *   OR → Monster/Siege Engine/Drawbridge (repurposed)
 *
 *   PNEUMATIC BRANCH:
 *   Golden Lotus motion → Hollow Rooster Tooth Air Pistons
 *   → One-way ball valves → Roots (player-controlled direction)
 *   → Plant growth (telescoping ratchet segments)
 *   → Bloom sequence → Flying Flower launch
 *
 * DIMENSIONAL HISTORY (Founder, Session 7E, March 8 2026):
 *   Original Hexel = 42mm flat-to-flat. Switched to 60mm for "lots of good
 *   reasons." The 42mm→60mm port is INCOMPLETE for some components (Football,
 *   wave generator area). Porting = resizing each part and verifying fit.
 *   42mm versions still exist in CAD as the trap/wave gen basis.
 *   POST-LAUNCH TASK: Complete the 42→60mm port for remaining components.
 *
 * "The digital world IS the real world. We just haven't connected them yet."
 */

// ============================================================================
// PIECE GRAMMAR — Core Types
// ============================================================================

/**
 * The canonical layer assignment in the Hexel stack.
 * Every physical piece exists at exactly one layer.
 */
export type HexelLayer =
  | 'L0_inter_hexel'      // Swan Neck, SnapCap connector (between Hexels)
  | 'L1_base'             // ChannelLock (foundation)
  | 'L2_column'           // HollowLog (central fluid pathway)
  | 'L3_clamshell_bottom' // SnapBottom half of clamshell housing
  | 'L4_actuator'         // Golden Lotus (flow → rotation converter)
  | 'L5_clamshell_top'    // SnapCap half of clamshell housing
  | 'L6_rotor'            // Rotor (permanently attached to Ouralis)
  | 'L7_primary_gear'     // Ouralis (20T dual-level, cam slopes)
  | 'L8_planetary'        // PGears × 3 at vertices + NeedleValve
  | 'L9_underverse'       // PGear grooves, HoFund passage
  | 'L10_sawtooth'        // Sawtooth Coral (ship interaction, timing belt)
  | 'L11_main_gear'       // Main Gear (12x speed)
  | 'L12_cradle'          // Cradle (Football wave gen, flip-lid)
  | 'L13_surface'         // Capstone (land) or Capwave (water)
  | 'L14_slotted_top'     // FlyingButtress (Slotted Top, trapdoor)
  | 'L15_terrain_skin';   // Capstone terrain skin (snap-on)

/**
 * Physical system the piece belongs to.
 */
export type PieceSystem =
  | 'hydraulic'           // Part of the water/fluid power system
  | 'pneumatic'           // Part of the air pressure system
  | 'mechanical'          // Gears, cams, linkages
  | 'structural'          // Frame, housing, containment
  | 'magnetic'            // Magnets, magnetic triggers
  | 'interface'           // Connection between layers/Hexels
  | 'surface'             // Top-level terrain/water pieces
  | 'trigger'             // Player-activated mechanisms
  | 'character';          // Character base system pieces

/**
 * Manufacturing method applicable to the piece.
 */
export type ManufacturingMethod =
  | 'lithographic'        // 3D printed (SLA) — same file works for injection mold
  | 'fdm'                 // FDM 3D printed
  | 'cnc'                 // CNC machined (precision gears)
  | 'injection_mold'      // Injection molded (production)
  | 'flexible'            // TPU or living hinge (compliant mechanisms)
  | 'metal'               // Metal component (springs, magnets)
  | 'mixed';              // Multiple methods in one piece

/**
 * Power type flowing through or acted upon by this piece.
 */
export type PowerType =
  | 'hydraulic_ac'        // Alternating hydraulic pressure (bidirectional)
  | 'hydraulic_dc'        // Baseline gravity pressure (unidirectional)
  | 'pneumatic'           // Air pressure
  | 'rotational'          // Mechanical rotation
  | 'translational'       // Linear motion (piston, slide)
  | 'magnetic'            // Magnetic field interaction
  | 'none';               // No power flows through

// ============================================================================
// FORMAL PIECE DEFINITION
// ============================================================================

/**
 * A single physical piece in the Hexel system.
 * This is the grammar's atomic unit — every physical component
 * maps to exactly one HexelPiece entry.
 */
export interface HexelPiece {
  /** Unique identifier (kebab-case) */
  id: string;

  /** Human-readable display name */
  name: string;

  /** Fusion 360 CAD name(s) — may have multiple for variants */
  cadNames: string[];

  /** Latest known CAD version */
  cadVersion: number;

  /** Which layer in the Hexel stack */
  layer: HexelLayer;

  /** Physical system(s) this piece participates in */
  systems: PieceSystem[];

  /** Quantity per Hexel (e.g., PGear = 3, NeedleValve = 3) */
  quantityPerHexel: number;

  /** Physical dimensions (mm) */
  dimensions: {
    /** Diameter or width (flat-to-flat for hex shapes) */
    width: number;
    /** Height / thickness */
    height: number;
    /** Wall thickness (if hollow) */
    wallThickness?: number;
    /** Additional dimensional notes */
    notes?: string;
  };

  /** What power types flow through this piece */
  powerInput: PowerType[];
  /** What power types this piece outputs */
  powerOutput: PowerType[];

  /** IDs of pieces this connects to (above) */
  connectsAbove: string[];
  /** IDs of pieces this connects to (below) */
  connectsBelow: string[];
  /** IDs of pieces this connects to (laterally / same level) */
  connectsLateral: string[];

  /** Manufacturing method(s) */
  manufacturing: ManufacturingMethod[];

  /** Detailed functional description */
  description: string;

  /** Patent references (Bag#, Innovation#, Claim#s) */
  patentRefs: Array<{
    bag: number;
    innovation: number;
    claims: number[];
  }>;

  /** Is this a canonical piece for the final ~18 set? */
  canonical: boolean;

  /** Source documents where this piece is described */
  sources: string[];

  /** Founder's corrections or notes (verbatim where possible) */
  founderNotes?: string;
}

// ============================================================================
// THE COMPLETE PIECE REGISTRY
// ============================================================================

export const HEXEL_PIECES: HexelPiece[] = [
  // ═══════════════════════════════════════════════════════════════
  // LAYER 0 — INTER-HEXEL CONNECTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'swan-neck',
    name: 'Swan Neck (Inter-Hexel Hydraulic Connector)',
    cadNames: ['swanNeck'],
    cadVersion: 1,
    layer: 'L0_inter_hexel',
    systems: ['hydraulic', 'interface'],
    quantityPerHexel: 6,  // one per hex side
    dimensions: {
      width: 10,
      height: 12,
      notes: 'Dual-channel: Top A↔Bottom B, Bottom A↔Top B. Creates inverse coupling.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['hydraulic_ac'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['channel-lock'],
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Dual-channel inter-Hexel hydraulic connector. Contains BOTH flow directions in one lithographic piece. When A piston moves, B moves opposite (inverse coupling). Daisy-chains the entire Hexel field into one continuous hydraulic network.',
    patentRefs: [
      { bag: 5, innovation: 59, claims: [15, 16, 17, 18] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
    ],
  },
  {
    id: 'snap-cap-connector',
    name: 'SnapCap (Inter-Hexel Seal)',
    cadNames: ['SnapCap'],
    cadVersion: 1,
    layer: 'L0_inter_hexel',
    systems: ['structural', 'interface'],
    quantityPerHexel: 6,
    dimensions: {
      width: 12,
      height: 4,
      notes: 'Seals over Swan Neck. Mechanically locks Hexels together.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['swan-neck'],
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Seals over the Swan Neck dual-channel connector. Completes watertight connection between adjacent Hexels. Also provides mechanical locking.',
    patentRefs: [],
    canonical: true,
    sources: ['HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md'],
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 1 — BASE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'channel-lock',
    name: 'ChannelLock (Base Foundation)',
    cadNames: ['ChannelLock', 'base'],
    cadVersion: 1,
    layer: 'L1_base',
    systems: ['structural', 'hydraulic'],
    quantityPerHexel: 1,
    dimensions: {
      width: 60,
      height: 9,
      notes: '60mm diameter circle. 3 concentric ringed grooves (bulls-eye), 3mm spacing. Fluid-tight except at designed escape points.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['hydraulic_ac'],
    connectsAbove: ['hollow-log'],
    connectsBelow: [],
    connectsLateral: ['swan-neck'],
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Base foundation of the Hexel. 60mm diameter circle, 9mm tall. Features 3 concentric ringed grooves in a bulls-eye pattern spaced 3mm apart for structural strength. Center is joined to the upward HollowLog. Fluid-tight except at designed escape points. 6 air/fluid pipes at vertices connect to Bedrock distribution.',
    patentRefs: [
      { bag: 5, innovation: 61, claims: [] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'HEXEL-TECHNICAL-SPECIFICATION-INNOVATION-54.md',
    ],
    founderNotes: '6 air/fluid pipes at vertices for distribution. Bedrock level.',
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 2 — CENTRAL COLUMN
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'hollow-log',
    name: 'HollowLog (Central Fluid Column)',
    cadNames: ['HollowLog'],
    cadVersion: 1,
    layer: 'L2_column',
    systems: ['hydraulic', 'structural'],
    quantityPerHexel: 1,
    dimensions: {
      width: 15.5,
      height: 20,
      wallThickness: 3,
      notes: 'Diameter 15.50mm. Wall thickness 3mm. Interior is hollow fluid pathway.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['hydraulic_ac'],
    connectsAbove: ['golden-lotus'],
    connectsBelow: ['channel-lock'],
    connectsLateral: [],
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Central hollow column connecting ChannelLock base to Golden Lotus above. 15.5mm diameter, 3mm wall thickness. Interior is the primary fluid pathway delivering hydraulic AC pressure from the distribution network up to the actuator.',
    patentRefs: [],
    canonical: true,
    sources: ['HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md'],
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYERS 3-5 — CLAMSHELL + GOLDEN LOTUS (Actuator Assembly)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'clamshell',
    name: 'Clamshell (Waterproof Actuator Housing)',
    cadNames: ['SnapCap_housing', 'SnapBottom_housing'],
    cadVersion: 1,
    layer: 'L3_clamshell_bottom',  // spans L3-L5
    systems: ['structural', 'hydraulic'],
    quantityPerHexel: 1,  // 2 halves = 1 assembly
    dimensions: {
      width: 54,
      height: 12,
      wallThickness: 2,
      notes: 'Two lithographically-identical halves, one inverted. Interleaving retaining walls. SnapCap gaps at bottom (0-3mm), SnapBottom gaps at top (9-12mm). Gap size: 2mm × 3mm.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['hydraulic_ac'],
    connectsAbove: ['rotor'],
    connectsBelow: ['hollow-log'],
    connectsLateral: [],
    manufacturing: ['lithographic'],
    description: 'Waterproof actuator housing comprising two lithographically-produced identical halves (SnapCap + SnapBottom). When snapped together, interleaving retaining walls create complete 12mm barrier with gaps at alternating heights. Houses the Golden Lotus piston and Rotor. Hyper-waterproof seal without separate gaskets. Rooster Teeth from SnapCap (cups 1,3,5) hang down; from SnapBottom (cups 2,4,6) point up.',
    patentRefs: [
      { bag: 5, innovation: 63, claims: [27, 28, 29] },
    ],
    canonical: true,
    sources: [
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
    ],
    founderNotes: 'NueWall repeats 5 times radially to make 6 sides of the clamshell. Houses golden lotus and rotor. Capshaft assembly: clamshell → capshaft up from bottom → top snaps in → acts as bottom for Ouralis.',
  },
  {
    id: 'golden-lotus',
    name: 'Golden Lotus (Flow-to-Rotation Converter)',
    cadNames: ['goldenLotus09', 'EssenceGoldenLotus'],
    cadVersion: 9,
    layer: 'L4_actuator',
    systems: ['hydraulic', 'mechanical', 'pneumatic'],
    quantityPerHexel: 1,
    dimensions: {
      width: 50,
      height: 12,
      notes: '6 cups radially arranged. Cups 1,3,5 face UP; cups 2,4,6 face DOWN. Cup radial depth 10.5mm. Exit angle 30° clockwise from radial. Hexagonal void in center for Rotor.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['rotational', 'pneumatic'],
    connectsAbove: ['rotor'],
    connectsBelow: ['hollow-log'],
    connectsLateral: ['clamshell'],
    manufacturing: ['lithographic', 'cnc'],
    description: 'THE key power converter. 6 Tesla Valve cups arranged radially with alternating UP/DOWN orientations. Converts bidirectional hydraulic AC flow into unidirectional rotation — both PUSH and PULL create rotation in the SAME direction. Rooster Teeth (1.5mm protrusions, 2mm from wall, 6mm tall) inside each cup amplify torque by catching flow. Tesla pathway: 2mm wide, 6mm tall. Cup exit angle 30° clockwise creates tangential flow striking the Rotor vanes. Also drives Hollow Rooster Tooth Air Pistons for pneumatic system.',
    patentRefs: [
      { bag: 5, innovation: 58, claims: [11, 12, 13, 14] },
      { bag: 5, innovation: 64, claims: [30, 31, 32, 33] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
      'HEXEL-TECHNICAL-SPECIFICATION-INNOVATION-54.md',
    ],
    founderNotes: 'Inverse hydraulic action from adjacent Hexels rotates the golden lotus. KEY POWER COMPONENT.',
  },
  {
    id: 'rooster-teeth',
    name: 'Rooster Teeth (Torque Amplifiers + Air Pistons)',
    cadNames: ['roosterTeeth'],
    cadVersion: 1,
    layer: 'L4_actuator',
    systems: ['hydraulic', 'pneumatic'],
    quantityPerHexel: 6,  // one per cup
    dimensions: {
      width: 1.5,
      height: 6,
      notes: '1.5mm protrusion, 2mm from wall, 6mm tall (full cup height). Hollow core for pneumatic air piston function.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['pneumatic'],
    connectsAbove: ['roots'],
    connectsBelow: [],
    connectsLateral: ['golden-lotus'],
    manufacturing: ['lithographic'],
    description: 'Internal protrusions within Tesla Valve cups serving dual function: (1) Hydraulic: catch flow during push strokes to amplify torque on Rotor, (2) Pneumatic: hollow center passes through both roof and floor of rotor chamber — vertical motion of Golden Lotus compresses/expands air in hollow core. Top and bottom have ball-type one-way valves. 6 air columns total, one per rooster tooth. Twistable ring reverses airflow direction.',
    patentRefs: [
      { bag: 5, innovation: 58, claims: [13] },
      { bag: 5, innovation: 69, claims: [42, 43, 44] },
    ],
    canonical: true,
    sources: ['PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md'],
    founderNotes: 'Three vertices bring up air for pneumatic distribution from SawTooth sides.',
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 6 — ROTOR
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'rotor',
    name: 'Rotor (18-Cavity Rotation Element)',
    cadNames: ['threeSisters05_rotor12'],
    cadVersion: 12,
    layer: 'L6_rotor',
    systems: ['mechanical'],
    quantityPerHexel: 1,
    dimensions: {
      width: 54,
      height: 12,
      notes: '18 closed cavities (not open vanes). Inner radius 21.125mm, outer radius 27mm. 20° per cavity. Full 12mm height.',
    },
    powerInput: ['rotational'],
    powerOutput: ['rotational'],
    connectsAbove: ['ouralis'],
    connectsBelow: ['golden-lotus'],
    connectsLateral: [],
    manufacturing: ['lithographic'],
    description: 'Separate piece (for lithographic printing). Permanently attached to Ouralis after printing. 18 closed cavities at outer perimeter — fully enclosed (no gaps) creating sustained pressure pockets when fluid enters. Cavities extend full 12mm height to receive jets from both high gaps (9-12mm) and low gaps (0-3mm). Driven by Golden Lotus cups via Rooster Teeth tangential flow.',
    patentRefs: [
      { bag: 5, innovation: 65, claims: [34, 35] },
      { bag: 5, innovation: 66, claims: [36] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 7 — OURALIS (PRIMARY GEAR + CAM)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ouralis',
    name: 'Ouralis (Primary Gear / Tide Accumulator)',
    cadNames: ['threeSisters05_ouralis15', 'ouralis', 'ouralis11'],
    cadVersion: 15,
    layer: 'L7_primary_gear',
    systems: ['mechanical'],
    quantityPerHexel: 1,
    dimensions: {
      width: 50,
      height: 12.28,
      notes: '20 teeth per level. 2 stacked levels. Level height 6.14mm each. Offset half-tooth between levels (peak aligns with valley). Three cam slopes on top for Cradle legs.',
    },
    powerInput: ['rotational'],
    powerOutput: ['rotational', 'translational'],
    connectsAbove: ['pgear', 'cradle'],
    connectsBelow: ['rotor'],
    connectsLateral: [],
    manufacturing: ['lithographic', 'cnc'],
    description: 'Primary gear and tide accumulator. Integrated as single piece with Rotor (Innovation #66). 20-tooth dual-level design with offset half-tooth for smooth engagement. Engages 3 PGears at vertices (20:3 = 6.67:1 speed increase). Top surface has 3 circular cam slopes positioned 120° apart — three Cradle legs ride these slopes producing even vertical tide motion (sinusoidal). Named for its orbital-like periodic motion. Full tide cycle = 12 increments up, 12 increments down. Bedrock stays fixed — only Capwave surface rises.',
    patentRefs: [
      { bag: 5, innovation: 66, claims: [36] },
      { bag: 5, innovation: 67, claims: [37, 38] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
      'HEXEL-TECHNICAL-SPECIFICATION-INNOVATION-54.md',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 8 — PLANETARY GEARS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'pgear',
    name: 'PGear (Planetary Gear)',
    cadNames: ['threeSisters05_OGpGearNeedleV', 'pGear12DD'],
    cadVersion: 12,
    layer: 'L8_planetary',
    systems: ['mechanical', 'magnetic'],
    quantityPerHexel: 3,  // at 3 of 6 vertices
    dimensions: {
      width: 12,
      height: 18,
      notes: 'Shaft diameter 12mm. Mushroom head with 12 teeth (top, for Main Gear). Center hole 2.5mm for NeedleValve. Dual 3-tooth drive sections (stacked, offset). Gear ratio with Ouralis: 20:3 = 6.67:1.',
    },
    powerInput: ['rotational'],
    powerOutput: ['rotational'],
    connectsAbove: ['main-gear'],
    connectsBelow: ['ouralis'],
    connectsLateral: [],
    manufacturing: ['lithographic', 'cnc'],
    description: 'Planetary gear at hex vertex. Mushroom head (12 teeth) engages Main Gear above. Dual 3-tooth drive sections engaged by Ouralis below. 6.67:1 speed increase from Ouralis. Contains NeedleValve through center. PGears are basically transmissions — 1:24 gear ratio selectable by player. Height-determined activation via magnets.',
    patentRefs: [
      { bag: 5, innovation: 72, claims: [52, 53, 54] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
    ],
    founderNotes: 'PGears = basically transmissions. Height-determined activation. Player selects 1:24 gear ratio.',
  },
  {
    id: 'needle-valve',
    name: 'NeedleValve (Magnetic Trigger)',
    cadNames: ['NeedleValve'],
    cadVersion: 1,
    layer: 'L8_planetary',
    systems: ['magnetic', 'trigger'],
    quantityPerHexel: 3,  // one per PGear
    dimensions: {
      width: 2.5,
      height: 15,
      notes: '2.5mm diameter. Runs through center of PGear shaft. Magnet at top (3-5mm dia).',
    },
    powerInput: ['magnetic'],
    powerOutput: ['mechanical'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['pgear', 'timing-belt'],
    manufacturing: ['lithographic', 'metal'],
    description: 'Magnetic needle sitting in center of PGear shaft. When a ship/character/fencepost/building with a magnet passes over a vertex, the keel/base magnet attracts the needle upward. Raised needle tooth engages the timing belt. Each PGear revolution then advances the timing belt by one tooth. Never stops timing belt, only starts it. Also functions as blocking pin to open/close fluid pathways.',
    patentRefs: [
      { bag: 5, innovation: 72, claims: [52, 53, 54] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
    ],
    founderNotes: 'Characters, ships, fenceposts, buildings — anything with a magnet at its base triggers PGears. Multi-player trigger: 3 for trap, 6 for Portal.',
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 10 — SAWTOOTH CORAL + TIMING BELT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'sawtooth-coral',
    name: 'Sawtooth Coral (Bedrock / Ship Interaction)',
    cadNames: ['threeSisters05_Sawtooth60', 'BedrockUnderworldSawtooth', 'SawtoothCoral60'],
    cadVersion: 2,
    layer: 'L10_sawtooth',
    systems: ['structural', 'mechanical'],
    quantityPerHexel: 1,
    dimensions: {
      width: 60,
      height: 15,
      notes: '6 sides, each with DIFFERENT slant angle. Vertical frame with open windows. Adjacent Hexels have mirrored slants creating stable "roadways." Top of sawtooth = bottom of sea level.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: ['main-gear', 'cradle'],
    connectsBelow: ['pgear'],
    connectsLateral: ['sawtooth-coral'],  // interlocks with adjacent Hexel sawtooths
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Bedrock/coral piece. NEVER MOVES once placed. Top of sawtooth IS bottom of sea level. Wave generators sit inside it. Coral teeth at surface. Interior "belly" houses the timing belt. Slide grooves at vertices for ship keel interaction. Asymmetric tooth profile at 60° intervals — world builder orients Hexels to create current patterns (trade winds, gyres, straits). Styled as coral formations. 6 magnets at sawtooth vertices for magnetic flotation of ships and Sirens.',
    patentRefs: [
      { bag: 5, innovation: 73, claims: [55, 56, 57] },
      { bag: 5, innovation: 75, claims: [60, 61] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
      'HEXEL-TECHNICAL-SPECIFICATION-INNOVATION-54.md',
    ],
    founderNotes: '"Sawtooth Coral" — bedrock, never moves. Top = sea level floor. 6 magnets at vertices. Ships/Sirens hover via magnetic flotation.',
  },
  {
    id: 'timing-belt',
    name: 'Timing Belt (Revolution Counter / Trap Timer)',
    cadNames: ['timingBelt'],
    cadVersion: 1,
    layer: 'L10_sawtooth',
    systems: ['mechanical', 'trigger'],
    quantityPerHexel: 1,  // optional
    dimensions: {
      width: 55,
      height: 3,
      notes: 'Sits in skinny outer circumference of Sawtooth belly, below coral vertices. Player-settable revolution count.',
    },
    powerInput: ['rotational'],
    powerOutput: ['pneumatic'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['needle-valve', 'sawtooth-coral'],
    manufacturing: ['lithographic'],
    description: 'Hidden below Sawtooth Coral mushroom top. During setup, player rotates belt to set desired revolution count. When magnetic needle is raised and engaged, each PGear revolution advances belt by one tooth. When belt reaches trigger point, opens airflow from top of Sawtooth belly. Opened airflow activates connected trap/mechanism (Cradle flip-lid or Capstone flip-axis). Players don\'t know if it\'s active until trap springs. 5 revolutions = quick trap. 20 revolutions = delayed trap. Multi-player: 3 triggers for trap, 6 triggers for Portal.',
    patentRefs: [
      { bag: 5, innovation: 73, claims: [55, 56, 57] },
    ],
    canonical: true,
    sources: [
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
    ],
    founderNotes: 'Timer belt gears: 5 moves after passing = trap hits. Player-configurable without reading rules — just by placing pieces.',
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 11 — MAIN GEAR
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'main-gear',
    name: 'Main Gear (High-Speed Drive)',
    cadNames: ['mainGear'],
    cadVersion: 1,
    layer: 'L11_main_gear',
    systems: ['mechanical'],
    quantityPerHexel: 1,
    dimensions: {
      width: 45,
      height: 8,
      notes: 'Driven by 3× PGear mushroom heads (12 teeth each). ~12x Ouralis rotation rate. Single "pusher" tooth for Football engagement.',
    },
    powerInput: ['rotational'],
    powerOutput: ['rotational'],
    connectsAbove: ['cradle', 'football'],
    connectsBelow: ['pgear'],
    connectsLateral: [],
    manufacturing: ['lithographic', 'cnc'],
    description: 'High-speed gear above Sawtooth Coral. Driven by all 3 PGear mushroom heads simultaneously. Combined speed approximately 12x Ouralis rotation rate. Contains a single "pusher" tooth that strikes the Football cam follower on each revolution. Also drives player-placed mechanisms and the Cradle wave generation.',
    patentRefs: [],
    canonical: true,
    sources: ['HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md'],
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 12 — CRADLE + FOOTBALL (Wave Generator)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cradle',
    name: 'Cradle (Wave Generator Platform / Flip-Lid Reveal)',
    cadNames: ['cradle'],
    cadVersion: 1,
    layer: 'L12_cradle',
    systems: ['mechanical', 'trigger'],
    quantityPerHexel: 1,
    dimensions: {
      width: 40,
      height: 10,
      notes: 'Three legs extend down onto Ouralis cam slopes (120° apart). Holds Football wave generator. Contains hinged flip-lid for trap reveal.',
    },
    powerInput: ['rotational', 'translational'],
    powerOutput: ['translational'],
    connectsAbove: ['capstone', 'capwave'],
    connectsBelow: ['ouralis', 'main-gear'],
    connectsLateral: [],
    manufacturing: ['lithographic'],
    description: 'Multi-function platform: (1) TIDE: Three legs ride the three Ouralis cam slopes, producing even vertical motion (no tilt) — sinusoidal tide function. (2) WAVE: Football/wave generator base rocks back and forth driven by Main Gear pusher. (3) REVEAL: Half-circle base sits on hinged flip-lid. When timing belt trigger fires, lid flips, wave generator tips off, revealing concealed creature/treasure/hazard. Goes up incrementally via Ouralis slopes with vertical extensions.',
    patentRefs: [
      { bag: 5, innovation: 67, claims: [37, 38] },
      { bag: 5, innovation: 68, claims: [39, 40, 41] },
      { bag: 5, innovation: 74, claims: [58, 59] },
    ],
    canonical: true,
    sources: [
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
    ],
    founderNotes: 'Cradle goes up incrementally via ouralis slopes with vertical extensions. Holds treasure/monster sigils. Football Clapper hangs down center — one piece with Cradle. CRITICAL: The entire CRADLE goes up and down AND flips — just like SlottedTop flips. SlottedTop sits ON TOP of Cradle. When traps go off, the Cradle flip means they work in water OR land context. The wave generator (Football) and trap mechanisms are based on the original 42mm Hexel design — the 42→60mm port for these components is incomplete as of March 2026 (post-launch task).',
  },
  {
    id: 'football',
    name: 'Football (Variable-Amplitude Cam Follower)',
    cadNames: ['football', 'bellWeight'],
    cadVersion: 1,
    layer: 'L12_cradle',
    systems: ['mechanical'],
    quantityPerHexel: 1,
    dimensions: {
      width: 6,
      height: 15,
      notes: 'Half-circle rocking base. Center leg 3mm diameter extending down. Football-shaped (prolate spheroid) cam follower at bottom, 6mm at widest.',
    },
    powerInput: ['rotational'],
    powerOutput: ['translational'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['cradle'],
    manufacturing: ['lithographic'],
    description: 'The wave generator mechanism. Half-circle base rocks back and forth in the Cradle. Center leg (3mm) extends downward with football-shaped (prolate spheroid) cam follower at bottom (6mm widest). Main Gear pusher strikes the leg/football. VARIABLE AMPLITUDE: At LOW TIDE (Cradle down), pusher hits narrow leg (3mm) = small waves. At HIGH TIDE (Cradle up), pusher hits wide football (6mm) = large waves. Deep water = big turbulent waves; shallow water = small gentle waves. Bell-weight football mechanism: low tide small/gentle, high tide 3x stronger (can capsize rowboats).',
    patentRefs: [
      { bag: 5, innovation: 68, claims: [39, 40, 41] },
    ],
    canonical: true,
    sources: [
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
      'HEXISLE_COMPONENT_GLOSSARY.md',
    ],
    founderNotes: '"Football" is the wave generator mechanism. The bell-weight football is what the Founder calls it.',
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 13 — SURFACE (Capstone / Capwave)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'capstone',
    name: 'Capstone (Land Terrain Surface)',
    cadNames: ['threeSisters05_snapCap', 'snapCap'],
    cadVersion: 1,
    layer: 'L13_surface',
    systems: ['surface'],
    quantityPerHexel: 1,  // OR Capwave, not both
    dimensions: {
      width: 60,
      height: 6,
      notes: '60mm hexagonal. 14 terrain types. Contains flip-axis traps and compliant mechanism grippers for mounting structures.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: ['slotted-top'],
    connectsBelow: ['cradle', 'sawtooth-coral'],
    connectsLateral: [],
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Interchangeable terrain surface. Snaps onto Slotted Top. 14 terrain types (grass, sand, undergrowth, rock, ice, snow, lava, mud, crystal, coral, ruin_stone, metal_plate, wood_plank, bare). Contains flip-axis traps along longest dimension (Innovation #75). Compliant mechanism grippers (Innovation #76) hold removable structures — push down to insert (flexures spread and grip), pull up to remove. DOES NOT interfere with Hexel mechanics. Designed for the system.',
    patentRefs: [
      { bag: 5, innovation: 75, claims: [60, 61] },
      { bag: 5, innovation: 76, claims: [62, 63] },
    ],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
      'KICKSTARTER-CAMPAIGN-2-HEXISLE-HEXEL-GAME.md',
    ],
  },
  {
    id: 'capwave',
    name: 'Capwave (Water Surface)',
    cadNames: ['capwave'],
    cadVersion: 1,
    layer: 'L13_surface',
    systems: ['surface', 'mechanical'],
    quantityPerHexel: 1,  // OR Capstone, not both
    dimensions: {
      width: 60,
      height: 4,
      notes: 'Moving water surface. Engages with Ouralis tide mechanism. Moves with waves.',
    },
    powerInput: ['translational'],
    powerOutput: ['none'],
    connectsAbove: [],
    connectsBelow: ['cradle'],
    connectsLateral: [],
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Moving water surface piece. Replaces Capstone on water Hexels. Engages with the Ouralis tide mechanism — rises and falls with tide cycle. Shows visible wave motion from the Football/Cradle mechanism below. Ships interact with Capwave via rudder keels at high tide.',
    patentRefs: [],
    canonical: true,
    sources: [
      'HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md',
      'KICKSTARTER-CAMPAIGN-2-HEXISLE-HEXEL-GAME.md',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LAYER 14 — SLOTTED TOP (FlyingButtress)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'slotted-top',
    name: 'Slotted Top / FlyingButtress (Universal Interface)',
    cadNames: ['FlyingButtress'],
    cadVersion: 40,
    layer: 'L14_slotted_top',
    systems: ['structural', 'interface', 'mechanical'],
    quantityPerHexel: 1,
    dimensions: {
      width: 60,
      height: 8,
      notes: 'Red hexagonal cage with castellated edges. 6 internal triangular sections (star pattern). Compliant mechanism arms at vertices/sides (cyan). Gorgon central lock (blue). v40 in Fusion 360.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: ['capstone-terrain-skin'],
    connectsBelow: ['capstone', 'capwave'],
    connectsLateral: ['slotted-top'],
    manufacturing: ['lithographic', 'flexible'],
    description: 'The universal interface layer. Named after gothic flying buttresses — transfers load from above while keeping structure open for trapdoor. Red hexagonal cage body with castellated edges. 6 internal triangular trapdoor sections. Cyan compliant mechanism arms (flex-grip snap locks). Blue Gorgon at center (rotational lock). Orange tripodVerticesAnchor posts at 3 of 6 vertices. Orange serpentine lateral connectors. Trapdoor function: each triangular section can open independently.',
    patentRefs: [],
    canonical: true,
    sources: [
      'hexelSpec.ts',
      'hexelComponentMap.ts',
    ],
  },
  {
    id: 'gorgon',
    name: 'Gorgon (Central Rotational Lock)',
    cadNames: ['gorgon'],
    cadVersion: 1,
    layer: 'L14_slotted_top',
    systems: ['mechanical'],
    quantityPerHexel: 1,
    dimensions: {
      width: 8,
      height: 5,
      notes: 'Blue cylinders in CAD. Central position.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['slotted-top'],
    manufacturing: ['lithographic'],
    description: 'Central rotational lock mechanism in the Slotted Top. Controls trapdoor engagement/release. Named after mythological creature (Medusa = type of gorgon). Must be disengaged before trapdoor can open.',
    patentRefs: [],
    canonical: true,
    sources: ['hexelComponentMap.ts'],
  },

  // ═══════════════════════════════════════════════════════════════
  // PNEUMATIC SYSTEM — ROOTS + PLANTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'roots',
    name: 'Roots (Player-Controlled Airflow Interface)',
    cadNames: ['roots'],
    cadVersion: 1,
    layer: 'L13_surface',
    systems: ['pneumatic', 'trigger', 'interface'],
    quantityPerHexel: 6,  // one per rooster tooth air column
    dimensions: {
      width: 5,
      height: 8,
      notes: 'Surface-accessible. Twistable to reverse airflow direction. Mounting point for removable structures.',
    },
    powerInput: ['pneumatic'],
    powerOutput: ['pneumatic'],
    connectsAbove: [],
    connectsBelow: ['rooster-teeth'],
    connectsLateral: [],
    manufacturing: ['lithographic'],
    description: 'Player-accessible control elements at game surface connecting to Hollow Rooster Tooth Air Pistons below. Twisting a Root rotates the corresponding one-way valve ring, reversing air flow direction (push vs. pull). Also serve as physical mounting points for removable structures (plants, fenceposts, buildings). Removal of mounted structure deactivates pneumatic pathway. This is the "watering plants" mechanic — player shapes landscape\'s pneumatic behavior.',
    patentRefs: [
      { bag: 5, innovation: 70, claims: [45, 46, 47] },
    ],
    canonical: true,
    sources: ['PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md'],
    founderNotes: '"Watering plants" — the pneumatic plant growth mechanic. Player-controllable. Roots accept placement of plants, structures, fenceposts.',
  },
  {
    id: 'telescoping-plant',
    name: 'Telescoping Plant (Pneumatic Growth)',
    cadNames: ['palmTree', 'plant'],
    cadVersion: 1,
    layer: 'L13_surface',
    systems: ['pneumatic', 'mechanical'],
    quantityPerHexel: 0,  // player-placed, variable
    dimensions: {
      width: 8,
      height: 40,
      notes: 'Nested segments, each with ratchet click. Sequential extension bottom-to-top. Fronds deploy from top.',
    },
    powerInput: ['pneumatic'],
    powerOutput: ['none'],
    connectsAbove: [],
    connectsBelow: ['roots'],
    connectsLateral: [],
    manufacturing: ['lithographic', 'injection_mold'],
    description: 'Pneumatic plant growth mechanism. Nested telescoping segments extend sequentially under air pressure from Rooster Tooth air pistons via Roots. Each segment ratchet-clicks into place (cannot retract during play). Growth stages: Seedling → Segment 1 CLICK → Segment 2 CLICK → Segment 3 CLICK → Trunk complete → Fronds deploy. Harvestable: trunk = ship mast or building material, fronds = ship sail or thatch. After full height, bloom sequence (Innovation #105): petal segments unfold, center stamen rotates. Can be palm-twist launched as Flying Flower (Innovation #104).',
    patentRefs: [
      { bag: 5, innovation: 71, claims: [48, 49, 50, 51] },
      { bag: 5, innovation: 104, claims: [64, 65, 66, 67] },
      { bag: 5, innovation: 105, claims: [68, 69, 70] },
    ],
    canonical: true,
    sources: ['PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md'],
  },

  // ═══════════════════════════════════════════════════════════════
  // STRUCTURAL SUB-COMPONENTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'nue-wall',
    name: 'NueWall (Radial Wall Segment)',
    cadNames: ['nueWall'],
    cadVersion: 1,
    layer: 'L3_clamshell_bottom',
    systems: ['structural'],
    quantityPerHexel: 5,  // repeats 5 times radially to make 6 sides
    dimensions: {
      width: 25,
      height: 12,
      wallThickness: 2,
      notes: 'Repeats 5 times radially to create 6 sides of the clamshell housing.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['clamshell'],
    manufacturing: ['lithographic'],
    description: 'Internal wall segment defining cavity boundaries within the Clamshell housing. Repeats 5 times radially to create the 6-sided hexagonal structure. Separates hydraulic/pneumatic channels within the Hexel body.',
    patentRefs: [],
    canonical: true,
    sources: ['hexelComponentMap.ts'],
    founderNotes: 'NueWall repeats 5 times radially to make 6 sides.',
  },
  {
    id: 'ring-of-power',
    name: 'Ring of Power (Hydraulic Seal)',
    cadNames: ['RingOfPower'],
    cadVersion: 1,
    layer: 'L1_base',
    systems: ['hydraulic', 'structural'],
    quantityPerHexel: 1,
    dimensions: {
      width: 55,
      height: 3,
      notes: 'Sealing ring at base. Without it, hydraulic network loses pressure.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['hydraulic_ac'],
    connectsAbove: [],
    connectsBelow: ['channel-lock'],
    connectsLateral: [],
    manufacturing: ['lithographic'],
    description: 'Hydraulic seal at the base of the Hexel. Seals the cavity to maintain pressure for the hydraulic power network. Critical for inter-Hexel power transmission. Without this seal, the entire network loses pressure.',
    patentRefs: [],
    canonical: true,
    sources: ['hexelComponentMap.ts'],
  },
  {
    id: 'one-way-valve',
    name: 'One-Way Valve (Tesla Valve / Flow Control)',
    cadNames: ['oneWay', 'Tesla_Valve'],
    cadVersion: 1,
    layer: 'L0_inter_hexel',
    systems: ['hydraulic'],
    quantityPerHexel: 6,  // one per hydraulic port
    dimensions: {
      width: 6,
      height: 8,
      notes: 'No moving parts — pure fluid dynamics. Asymmetric channel geometry.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['hydraulic_ac'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['swan-neck'],
    manufacturing: ['lithographic'],
    description: 'One-way flow control without moving parts (Tesla Valve design). Installed in hydraulic ports between Hexels. Asymmetric channel geometry creates preferential flow direction. No moving parts = no wear, no maintenance, no failure points. Controls wave propagation directionality.',
    patentRefs: [
      { bag: 5, innovation: 58, claims: [11, 12, 13, 14] },
    ],
    canonical: true,
    sources: [
      'HEXEL-TECHNICAL-SPECIFICATION-INNOVATION-54.md',
      'PATENT_BAG_5_HYDRAULIC_OSCILLATION_SYSTEM.md',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SLOTTED TOP SUB-COMPONENTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'tripod-vertices-anchor',
    name: 'Tripod Vertices Anchor',
    cadNames: ['tripodVerticesAnchor'],
    cadVersion: 1,
    layer: 'L14_slotted_top',
    systems: ['structural', 'anchor'],
    quantityPerHexel: 3,  // at 3 of 6 vertices (alternating with PGears)
    dimensions: {
      width: 6,
      height: 8,
      notes: 'Orange cylinders in CAD. Three-point stability.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: [],
    connectsBelow: ['sawtooth-coral'],
    connectsLateral: ['slotted-top'],
    manufacturing: ['lithographic'],
    description: 'Three vertical anchor posts at alternating hex vertices (3 of 6, the other 3 have PGears). Connects Slotted Top vertically to the Hexel body below. Three-point stability.',
    patentRefs: [],
    canonical: true,
    sources: ['hexelComponentMap.ts'],
  },
  {
    id: 'snap-base',
    name: 'Snap Base (Foundation Interface)',
    cadNames: ['snapBase'],
    cadVersion: 1,
    layer: 'L14_slotted_top',
    systems: ['interface'],
    quantityPerHexel: 1,
    dimensions: {
      width: 50,
      height: 3,
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: [],
    connectsBelow: ['capstone', 'capwave'],
    connectsLateral: ['slotted-top'],
    manufacturing: ['lithographic'],
    description: 'Foundation snap interface for the Slotted Top. Connects the FlyingButtress to the Top Module (Capstone/Capwave) below.',
    patentRefs: [],
    canonical: true,
    sources: ['hexelComponentMap.ts'],
  },

  // ═══════════════════════════════════════════════════════════════
  // FOUNDER-DESCRIBED PIECES (Not yet in any patent doc)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'turntable',
    name: 'TurnTable (Hydraulic Flow Redirector)',
    cadNames: [],
    cadVersion: 0,
    layer: 'L0_inter_hexel',
    systems: ['hydraulic', 'trigger'],
    quantityPerHexel: 0,  // optional player-placed
    dimensions: {
      width: 15,
      height: 10,
      notes: 'Push-down-and-turn mechanism. Train change station. Dimensions TBD.',
    },
    powerInput: ['hydraulic_ac'],
    powerOutput: ['hydraulic_ac'],
    connectsAbove: [],
    connectsBelow: [],
    connectsLateral: ['swan-neck'],
    manufacturing: ['lithographic'],
    description: 'Push-down-and-turn mechanism to redirect hydraulic flow between Hexels. Functions like a train change station — redirects which channels receive flow. Player pushes down and twists to select flow direction. Used for "watering plants" mechanic — directing hydraulic power to specific Hexels/mechanisms.',
    patentRefs: [],
    canonical: false,  // awaiting Founder confirmation of canonical status
    sources: [],
    founderNotes: 'TurnTable / train change station to redirect hydraulic flow. Push-down-and-turn. "Watering plants" mechanic.',
  },
  {
    id: 'siren',
    name: 'Siren (Pneumatic Scream + Magnetic Flotation)',
    cadNames: [],
    cadVersion: 0,
    layer: 'L13_surface',
    systems: ['pneumatic', 'magnetic'],
    quantityPerHexel: 0,  // player-placed
    dimensions: {
      width: 15,
      height: 25,
      notes: 'Character piece. Magnets at base for flotation. Pneumatic air chamber for "Scream." Dimensions TBD.',
    },
    powerInput: ['pneumatic', 'magnetic'],
    powerOutput: ['pneumatic'],
    connectsAbove: [],
    connectsBelow: ['sawtooth-coral'],
    connectsLateral: [],
    manufacturing: ['lithographic'],
    description: 'Character/creature piece that uses pneumatic air as a "Scream" released when placed on waves. Magnetic flotation via magnets at the 6 Sawtooth vertices — Sirens hover above the wave surface using magnetic repulsion/attraction. When placed, pneumatic pressure builds up and releases through the Siren\'s air chamber creating an audible whistle/scream effect.',
    patentRefs: [],
    canonical: false,  // awaiting Founder confirmation
    sources: [],
    founderNotes: 'Sirens use pneumatic air as "Scream" released when placed on waves. Magnetic flotation for ships/Sirens (magnets at 6 SawTooth vertices).',
  },
  {
    id: 'capshaft',
    name: 'Capshaft (Assembly Shaft)',
    cadNames: [],
    cadVersion: 0,
    layer: 'L3_clamshell_bottom',
    systems: ['structural'],
    quantityPerHexel: 1,
    dimensions: {
      width: 8,
      height: 20,
      notes: 'Central shaft through clamshell. Goes up from bottom, top snaps in. Dimensions TBD.',
    },
    powerInput: ['none'],
    powerOutput: ['none'],
    connectsAbove: ['ouralis'],
    connectsBelow: ['channel-lock'],
    connectsLateral: ['clamshell'],
    manufacturing: ['lithographic'],
    description: 'Central assembly shaft through the Clamshell housing. Assembly sequence: clamshell placed → capshaft inserted from bottom → top snaps in → acts as bottom for Ouralis above. Provides structural alignment for the entire internal stack.',
    patentRefs: [],
    canonical: false,  // awaiting Founder confirmation
    sources: [],
    founderNotes: 'Clamshell → capshaft up from bottom → top snaps in → acts as bottom for Ouralis.',
  },
];

// ============================================================================
// WATER TABLE COMPONENTS (Outside the Hexel, part of Tereno)
// ============================================================================

export interface WaterTableComponent {
  id: string;
  name: string;
  description: string;
  patentRefs: Array<{ bag: number; innovation: number; claims: number[] }>;
}

export const WATER_TABLE_COMPONENTS: WaterTableComponent[] = [
  {
    id: 'reservoir-x',
    name: 'Reservoir X (Outer / Tabletop)',
    description: 'Largest reservoir. Stationary reference. Spans full 60" diameter field. Perimeter feed via six vertex columns.',
    patentRefs: [{ bag: 5, innovation: 55, claims: [1, 2, 3] }],
  },
  {
    id: 'reservoir-y',
    name: 'Reservoir Y (Middle / Oscillating Driver)',
    description: 'Oscillating driver connected to center via clock mechanism. When Y drops, Z rises. When Y rises, Z drops. Y + Z > X (critical weight relationship).',
    patentRefs: [{ bag: 5, innovation: 55, claims: [1, 2, 3] }],
  },
  {
    id: 'reservoir-z',
    name: 'Reservoir Z (Inner / Counterweight)',
    description: 'Counterweight reservoir. Connected to center via clock. Oscillates in opposition to Y. Critical weight: Y + Z must be greater than X.',
    patentRefs: [{ bag: 5, innovation: 55, claims: [1, 2, 3] }],
  },
  {
    id: 'water-wheel-escapement',
    name: 'Water Wheel Escapement (Table Clock)',
    description: 'Central flow regulator between Reservoirs Y and Z. Three functions: flow regulation, energy harvesting, time display. Adjustable resistance controls oscillation frequency (stormy seas vs calm vs frozen). Powered BY the same system it controls. "When you stop the clock, you literally stop the ocean."',
    patentRefs: [{ bag: 5, innovation: 56, claims: [4, 5, 6, 7] }],
  },
  {
    id: 'banyan-tree',
    name: 'Banyan Tree Distribution Manifold',
    description: '6 structural supports at hexagon vertices. Hollow cores = pressure conduits. 3 vertices connect to Hexel TOPS, 3 to Hexel BOTTOMS (creates AC alternating effect). Floor pipes 2-3" diameter, RiserPipe shafts 2-3" diameter.',
    patentRefs: [{ bag: 5, innovation: 57, claims: [8, 9, 10] }],
  },
  {
    id: 'central-column',
    name: 'Central Column (Clock + Master Valve)',
    description: 'Height: 8 feet (floor to ceiling option). 6-sided hexagonal. Transparent acrylic/glass. Contains master control valve, timing display, water wheel escapement. States: Running (open), Stopped (closed, frozen), Player Turn A/B (directional routing). 12 graduated chambers (each = 1 game time unit).',
    patentRefs: [{ bag: 5, innovation: 56, claims: [4, 5, 6, 7] }],
  },
];

// ============================================================================
// CHARACTER BASE SYSTEM
// ============================================================================

export interface CharacterBasePiece {
  id: string;
  name: string;
  description: string;
  stackOrder: number;  // 1 = bottom, 8 = top
}

export const CHARACTER_BASE_PIECES: CharacterBasePiece[] = [
  { id: 'char-magnet-shaft', name: 'Central Shaft + Magnet', description: 'Single shaft down the middle with 3-5mm magnet at end. Triggers Hexel interactions.', stackOrder: 1 },
  { id: 'char-air-piston', name: 'Air Piston', description: 'Trapped air pump mechanism. Hit pushes character → pulls piston → advances counters.', stackOrder: 2 },
  { id: 'char-compliant-mech', name: 'Compliant Mechanism', description: 'Bendable arc ring (squeeze input). One-way ratchet: slanted one direction, 90° stop other.', stackOrder: 3 },
  { id: 'char-mana-counter', name: 'Mana Counter Ring (Bottom)', description: 'Toothed timer belt with ratchet. Linked to HP via DANGER TAB. Ratio set by terrain/level.', stackOrder: 4 },
  { id: 'char-hp-counter', name: 'HP Counter Ring (Top)', description: 'Toothed timer belt with ratchet. View window displays remaining HP. When 0 = character stays supine.', stackOrder: 5 },
  { id: 'char-button', name: 'Button', description: 'Top of air piston. Vertical cylinder with cog in middle, cog teeth 6mm tall. Connects hit to counter advance.', stackOrder: 6 },
  { id: 'char-half-circle', name: 'Half-Circle Arc (Backrest)', description: 'Connected to piston below. Character back leans against it. Hit pushes back → pulls piston.', stackOrder: 7 },
  { id: 'char-figure', name: 'Character Figure', description: 'Bends at knees when hit (like humans do). Pops back upright if HP remains.', stackOrder: 8 },
];

// ============================================================================
// PIECE COUNT ANALYSIS
// ============================================================================

/**
 * Canonical piece count for the formal grammar.
 */
export function getPieceStats(): {
  totalPieces: number;
  canonicalPieces: number;
  founderDescribedOnly: number;
  targetCanonical: number;
  piecesPerHexel: number;
} {
  const canonical = HEXEL_PIECES.filter(p => p.canonical);
  const founderOnly = HEXEL_PIECES.filter(p => !p.canonical && p.founderNotes);
  const totalPartsPerHexel = HEXEL_PIECES
    .filter(p => p.canonical)
    .reduce((sum, p) => sum + p.quantityPerHexel, 0);

  return {
    totalPieces: HEXEL_PIECES.length,
    canonicalPieces: canonical.length,
    founderDescribedOnly: founderOnly.length,
    targetCanonical: 18,
    piecesPerHexel: totalPartsPerHexel,
  };
}

/**
 * Get pieces by layer for stack visualization.
 */
export function getPiecesByLayer(): Record<HexelLayer, HexelPiece[]> {
  const result = {} as Record<HexelLayer, HexelPiece[]>;
  for (const piece of HEXEL_PIECES) {
    if (!result[piece.layer]) {
      result[piece.layer] = [];
    }
    result[piece.layer].push(piece);
  }
  return result;
}

/**
 * Get pieces by system for power flow analysis.
 */
export function getPiecesBySystem(system: PieceSystem): HexelPiece[] {
  return HEXEL_PIECES.filter(p => p.systems.includes(system));
}

/**
 * Get the complete power chain from source to output.
 */
export function getHydraulicPowerChain(): HexelPiece[] {
  const chainOrder = [
    'swan-neck', 'one-way-valve', 'channel-lock', 'ring-of-power',
    'hollow-log', 'golden-lotus', 'rooster-teeth', 'rotor',
    'ouralis', 'pgear', 'main-gear', 'football', 'cradle',
  ];
  return chainOrder
    .map(id => HEXEL_PIECES.find(p => p.id === id))
    .filter((p): p is HexelPiece => p !== undefined);
}

/**
 * Get the pneumatic branch from Golden Lotus to plant growth.
 */
export function getPneumaticChain(): HexelPiece[] {
  const chainOrder = [
    'golden-lotus', 'rooster-teeth', 'roots', 'telescoping-plant',
  ];
  return chainOrder
    .map(id => HEXEL_PIECES.find(p => p.id === id))
    .filter((p): p is HexelPiece => p !== undefined);
}

/**
 * Get the trap trigger chain from magnetic activation to reveal.
 */
export function getTrapChain(): HexelPiece[] {
  const chainOrder = [
    'needle-valve', 'timing-belt', 'cradle',
  ];
  return chainOrder
    .map(id => HEXEL_PIECES.find(p => p.id === id))
    .filter((p): p is HexelPiece => p !== undefined);
}

/**
 * Validate piece connections — every connectsAbove should have
 * a matching connectsBelow on the target piece, and vice versa.
 */
export function validateConnections(): Array<{
  piece: string;
  connection: string;
  direction: 'above' | 'below' | 'lateral';
  issue: string;
}> {
  const issues: Array<{
    piece: string;
    connection: string;
    direction: 'above' | 'below' | 'lateral';
    issue: string;
  }> = [];

  for (const piece of HEXEL_PIECES) {
    // Check connectsAbove
    for (const aboveId of piece.connectsAbove) {
      const above = HEXEL_PIECES.find(p => p.id === aboveId);
      if (!above) {
        issues.push({
          piece: piece.id,
          connection: aboveId,
          direction: 'above',
          issue: `Referenced piece "${aboveId}" not found in registry`,
        });
      }
    }
    // Check connectsBelow
    for (const belowId of piece.connectsBelow) {
      const below = HEXEL_PIECES.find(p => p.id === belowId);
      if (!below) {
        issues.push({
          piece: piece.id,
          connection: belowId,
          direction: 'below',
          issue: `Referenced piece "${belowId}" not found in registry`,
        });
      }
    }
  }

  return issues;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  HEXEL_PIECES,
  WATER_TABLE_COMPONENTS,
  CHARACTER_BASE_PIECES,
  getPieceStats,
  getPiecesByLayer,
  getPiecesBySystem,
  getHydraulicPowerChain,
  getPneumaticChain,
  getTrapChain,
  validateConnections,
};
