/**
 * HEXEL COMPONENT MAP — CAD-to-Code Registry
 * =============================================
 * Innovation #1536: Hexel Component Map & Power Transmission Architecture
 *
 * Maps the Founder's Fusion 360 CAD components to their functional roles
 * in the Hexel system. Derived from direct analysis of:
 *   - FlyingButtress v40 (Slotted Top assembly)
 *   - checkIt05_threshold v112 (complete Hexel assembly)
 *   - WORKINGairPump v19 (hydraulic/pneumatic pump assembly)
 *
 * The Tereno world is powered by a universal hydraulic/pneumatic system
 * formed by connected Hexel cavities. The power transmission chain:
 *
 *   Adjacent Hexels generate INVERSE HYDRAULIC ACTION
 *       |
 *       v
 *   Golden Lotus (toothed ring) rotates
 *       |
 *       v
 *   Ouralis (driven rotor component) turns
 *       |
 *       v
 *   Wave Generator creates wave/tide motion (inside Sawtooth)
 *       |
 *       OR (repurposed)
 *       v
 *   Monster mechanism / Siege engine / Drawbridge / Chainsaw arm / etc.
 *
 * The Sawtooth's top IS the bottom of sea level. Everything below
 * sea level is powered by this hydraulic chain. Wave Generators
 * sit inside the Sawtooth. The power can be harnessed for ANY
 * mechanism instead of waves — it's a universal power plant.
 *
 * CAD Project: "Tereno" (the world name)
 * Fusion 360 workspace: 2026 > ComponentsRaw
 */

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

/**
 * Functional role categories for Hexel components.
 */
export type ComponentRole =
  | 'structural'          // Body walls, floor, cavity definition
  | 'power_transmission'  // Gears, rotors, hydraulic elements
  | 'seal'                // Rings, gaskets, cavity seals
  | 'interface'           // Connection points between Hexels/layers
  | 'mechanism'           // Moving parts with functional output
  | 'signal'              // Communication/indication components
  | 'terrain'             // Surface pieces (Capstones)
  | 'valve'               // Flow control elements
  | 'anchor';             // Structural anchoring (vertical/lateral)

/**
 * Individual CAD component definition.
 * Each entry maps a Fusion 360 file/component to its role in the system.
 */
export interface HexelComponent {
  /** Fusion 360 component/file name */
  cadName: string;
  /** Latest known version */
  cadVersion: number;
  /** Human-readable name */
  displayName: string;
  /** Functional role in the Hexel system */
  role: ComponentRole;
  /** Component family prefix */
  family: string;
  /** What this piece does in the system */
  description: string;
  /** Where in the Hexel stack this sits */
  stackPosition: 'body' | 'top_module' | 'slotted_top' | 'capstone' | 'sub_assembly';
  /** What it connects to (other component cadNames) */
  connectsTo: string[];
  /** Color in Fusion 360 CAD (for visual identification) */
  cadColor?: string;
  /** Is this a candidate for the final canonical set? */
  canonicalCandidate: boolean;
  /** Notes from Founder */
  notes?: string;
}

// ============================================================================
// THE KNOWN COMPONENTS (from CAD browser analysis)
// ============================================================================

export const HEXEL_COMPONENTS: HexelComponent[] = [
  // ── COMPLETE ASSEMBLIES ──
  {
    cadName: 'checkIt05_threshold',
    cadVersion: 112,
    displayName: 'Hexel Assembly (Complete)',
    role: 'structural',
    family: 'checkIt05',
    description: 'The complete Hexel assembly — all pieces together. 112 iterations of refinement. Contains all sub-components in their correct positions.',
    stackPosition: 'sub_assembly',
    connectsTo: ['WORKINGairPump', 'FlyingButtress', 'threeSisters05_snapCap'],
    canonicalCandidate: true,
    notes: 'This is THE hexel. v112 = 112 design iterations over 9 years.',
  },
  {
    cadName: 'WORKINGairPump',
    cadVersion: 19,
    displayName: 'Hydraulic/Pneumatic Pump Assembly',
    role: 'power_transmission',
    family: 'WORKINGairPump',
    description: 'The working hydraulic and pneumatic pump assembly. Contains helical gear, golden lotus, rotor, ouralis, signal, and sealing components. This IS the engine of each Hexel.',
    stackPosition: 'sub_assembly',
    connectsTo: ['BedrockUnderworldSawtooth', 'FlyingButtress'],
    canonicalCandidate: true,
    notes: 'v19. Active development. Sub-components visible in browser tree.',
  },
  {
    cadName: 'FlyingButtress',
    cadVersion: 40,
    displayName: 'Slotted Top (FlyingButtress)',
    role: 'interface',
    family: 'FlyingButtress',
    description: 'The universal interface layer. Hexagonal cage with castellated edges, compliant mechanism arms, gorgon central lock, trapdoor function. Sits on top of the Top Module, receives Capstones above.',
    stackPosition: 'slotted_top',
    connectsTo: ['threeSisters05_snapCap', 'gorgon', 'snapBase', 'tripodVerticesAnchor'],
    cadColor: 'red',
    canonicalCandidate: true,
    notes: 'Named after gothic flying buttresses — transfers load while keeping structure open.',
  },

  // ── HEXEL BODY COMPONENTS ──
  {
    cadName: 'BedrockUnderworldSawtooth',
    cadVersion: 2,
    displayName: 'Bedrock Underworld Sawtooth (Body Base)',
    role: 'structural',
    family: 'Bedrock',
    description: 'The Hexel body base. Sawtooth = wave form profile. Top of this piece = bottom of sea level. Wave generators sit inside it. Contains the cavity structure that links with adjacent Hexels.',
    stackPosition: 'body',
    connectsTo: ['WORKINGairPump', 'RingOfPower'],
    cadColor: 'green',
    canonicalCandidate: true,
    notes: 'Bedrock = foundation. Underworld = below sea level. Sawtooth = wave cam profile.',
  },
  {
    cadName: 'nueWall',
    cadVersion: 1,
    displayName: 'Wall Segment (Cavity Boundary)',
    role: 'structural',
    family: 'WORKINGairPump',
    description: 'Internal wall segment defining cavity boundaries. Separates hydraulic/pneumatic channels within the Hexel body.',
    stackPosition: 'body',
    connectsTo: ['BedrockUnderworldSawtooth'],
    cadColor: 'teal',
    canonicalCandidate: true,
  },
  {
    cadName: 'base',
    cadVersion: 1,
    displayName: 'Base Plate',
    role: 'structural',
    family: 'WORKINGairPump',
    description: 'Foundation base plate of the Hexel. Bottom of the stack.',
    stackPosition: 'body',
    connectsTo: ['BedrockUnderworldSawtooth', 'RingOfPower'],
    canonicalCandidate: true,
  },

  // ── POWER TRANSMISSION CHAIN ──
  {
    cadName: 'Helical Gear (24R@30.00 m=2.15)',
    cadVersion: 1,
    displayName: 'Helical Gear (Power Transmission)',
    role: 'power_transmission',
    family: 'WORKINGairPump',
    description: 'Helical gear for hydraulic/pneumatic power transmission. 24 teeth, 30mm reference, module 2.15. Meshes with golden Lotus to transfer power from hydraulic cavity pressure to rotational motion.',
    stackPosition: 'body',
    connectsTo: ['goldenLotus09', 'threeSisters05_rotor12'],
    cadColor: 'yellow',
    canonicalCandidate: true,
    notes: 'Precision gear — requires SLA or CNC for quality.',
  },
  {
    cadName: 'goldenLotus09',
    cadVersion: 9,
    displayName: 'Golden Lotus (Toothed Ring)',
    role: 'power_transmission',
    family: 'threeSisters05',
    description: 'The golden lotus — a large toothed ring turned by inverse hydraulic action from adjacent connected Hexels. When adjacent Hexels pressurize, the golden lotus rotates, driving the ouralis which generates wave motion or powers mechanisms.',
    stackPosition: 'body',
    connectsTo: ['Helical Gear', 'threeSisters05_ouralis15'],
    cadColor: 'gold/yellow',
    canonicalCandidate: true,
    notes: 'KEY POWER COMPONENT. Inverse hydraulic action → rotation.',
  },
  {
    cadName: 'threeSisters05_ouralis15',
    cadVersion: 15,
    displayName: 'Ouralis (Wave Driver)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'The ouralis — driven by the golden lotus rotation. Generates wave/tide motion inside the sawtooth. This is what makes the ocean move. Can be repurposed to power ANY mechanism instead of waves.',
    stackPosition: 'body',
    connectsTo: ['goldenLotus09', 'threeSisters05_BTHU_WATERFALL'],
    cadColor: 'teal/green',
    canonicalCandidate: true,
    notes: 'The wave generator. Connected to golden lotus. v15 iterations.',
  },
  {
    cadName: 'threeSisters05_rotor12',
    cadVersion: 12,
    displayName: 'Rotor (Rotational Element)',
    role: 'power_transmission',
    family: 'threeSisters05',
    description: 'Rotational element in the power transmission chain. Transfers rotational energy between the helical gear and mechanism outputs.',
    stackPosition: 'body',
    connectsTo: ['Helical Gear', 'threeSisters05_ouralis15'],
    cadColor: 'blue',
    canonicalCandidate: true,
  },
  {
    cadName: 'threeSisters05_OGpGearNeedleV',
    cadVersion: 1,
    displayName: 'OG Gear Needle (Fine Adjustment)',
    role: 'power_transmission',
    family: 'threeSisters05',
    description: 'Original gear needle variant. Fine adjustment or precision interface in the gear train.',
    stackPosition: 'body',
    connectsTo: ['Helical Gear', 'threeSisters05_rotor12'],
    canonicalCandidate: true,
  },
  {
    cadName: 'threeSisters05_BTHU_WATERFALL',
    cadVersion: 1,
    displayName: 'Below-Threshold Waterfall Unit',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Below-threshold-unit waterfall mechanism. Creates the visible waterfall/cascade effect at the wave component level. Powered by the ouralis.',
    stackPosition: 'top_module',
    connectsTo: ['threeSisters05_ouralis15'],
    canonicalCandidate: true,
    notes: 'BTHU = Below Threshold Unit. The waterfall output.',
  },

  // ── SEALING AND CONNECTION ──
  {
    cadName: 'RingOfPower',
    cadVersion: 1,
    displayName: 'Ring of Power (Hydraulic Seal)',
    role: 'seal',
    family: 'WORKINGairPump',
    description: 'The Ring of Power — hydraulic seal at the base of the Hexel. Seals the cavity to maintain pressure for the hydraulic power network. Critical for inter-Hexel power transmission.',
    stackPosition: 'body',
    connectsTo: ['base', 'BedrockUnderworldSawtooth'],
    cadColor: 'purple/blue',
    canonicalCandidate: true,
    notes: 'Without this seal, the hydraulic network loses pressure.',
  },
  {
    cadName: 'tripodVerticesAnchor',
    cadVersion: 1,
    displayName: 'Tripod Vertices Anchor',
    role: 'anchor',
    family: 'FlyingButtress',
    description: 'Three vertical anchor posts at alternating hex vertices (3 of 6). Connects the Slotted Top vertically to the Hexel body below. Three-point stability.',
    stackPosition: 'slotted_top',
    connectsTo: ['FlyingButtress', 'BedrockUnderworldSawtooth'],
    cadColor: 'orange',
    canonicalCandidate: true,
  },

  // ── SLOTTED TOP SUB-COMPONENTS ──
  {
    cadName: 'gorgon',
    cadVersion: 1,
    displayName: 'Gorgon (Central Rotational Lock)',
    role: 'mechanism',
    family: 'FlyingButtress',
    description: 'Central rotational lock mechanism in the Slotted Top. Controls the trapdoor engagement/release. Named after the mythological creature.',
    stackPosition: 'slotted_top',
    connectsTo: ['FlyingButtress'],
    cadColor: 'blue',
    canonicalCandidate: true,
  },
  {
    cadName: 'snapBase',
    cadVersion: 1,
    displayName: 'Snap Base (Foundation Interface)',
    role: 'interface',
    family: 'FlyingButtress',
    description: 'Foundation snap interface for the Slotted Top. Connects the FlyingButtress to the Top Module below.',
    stackPosition: 'slotted_top',
    connectsTo: ['FlyingButtress'],
    canonicalCandidate: true,
  },

  // ── TERRAIN / CAPSTONE ──
  {
    cadName: 'threeSisters05_snapCap',
    cadVersion: 1,
    displayName: 'Snap Cap (Capstone)',
    role: 'terrain',
    family: 'threeSisters05',
    description: 'The Capstone — snaps onto the Slotted Top. Terrain skin. Designed for the system — DOES NOT interfere with trapdoor or cavity network.',
    stackPosition: 'capstone',
    connectsTo: ['FlyingButtress'],
    canonicalCandidate: true,
    notes: 'This is what becomes grass, sand, ice, rock, etc.',
  },

  // ── SIGNAL / COMMUNICATION ──
  {
    cadName: 'signalRoof',
    cadVersion: 1,
    displayName: 'Signal Roof',
    role: 'signal',
    family: 'checkIt05',
    description: 'Signal tower roof piece. Part of the communication/indication system at the top of the Hexel.',
    stackPosition: 'top_module',
    connectsTo: ['signal04_threshold'],
    cadColor: 'blue',
    canonicalCandidate: false,
    notes: 'May be consolidated into signal04_threshold.',
  },
  {
    cadName: 'signal04_threshold',
    cadVersion: 4,
    displayName: 'Signal Threshold (Communication Tower)',
    role: 'signal',
    family: 'signal',
    description: 'Signal/communication threshold piece. May indicate hex state (active, powered, etc.) or serve as a beacon marker.',
    stackPosition: 'top_module',
    connectsTo: ['checkIt05_threshold'],
    canonicalCandidate: true,
  },

  // ── FLOW CONTROL ──
  {
    cadName: 'oneWay',
    cadVersion: 1,
    displayName: 'One-Way Valve',
    role: 'valve',
    family: 'checkIt05',
    description: 'One-way valve mechanism. Controls flow direction in the hydraulic/pneumatic cavity network. Prevents backflow.',
    stackPosition: 'body',
    connectsTo: ['BedrockUnderworldSawtooth'],
    canonicalCandidate: true,
    notes: 'Critical for directional hydraulic pressure.',
  },
  {
    cadName: 'sphereOfInfluence',
    cadVersion: 1,
    displayName: 'Sphere of Influence (Joint/Pivot)',
    role: 'mechanism',
    family: 'checkIt05',
    description: 'Spherical joint/pivot element. Allows multi-axis rotation at specific connection points.',
    stackPosition: 'body',
    connectsTo: ['checkIt05_threshold'],
    cadColor: 'orange',
    canonicalCandidate: true,
  },
  {
    cadName: 'Holder',
    cadVersion: 1,
    displayName: 'Holder (Component Bracket)',
    role: 'structural',
    family: 'checkIt05',
    description: 'Holds/brackets other components in position within the Hexel assembly.',
    stackPosition: 'body',
    connectsTo: ['checkIt05_threshold'],
    canonicalCandidate: false,
    notes: 'May be consolidated into body structure.',
  },
  {
    cadName: 'harmonized',
    cadVersion: 1,
    displayName: 'Harmonized (Combined Piece)',
    role: 'structural',
    family: 'WORKINGairPump',
    description: 'A harmonized/combined component — likely multiple pieces merged into one for manufacturing efficiency.',
    stackPosition: 'body',
    connectsTo: ['WORKINGairPump'],
    canonicalCandidate: true,
    notes: 'Name suggests this is a consolidation of multiple prior pieces into one.',
  },
  {
    cadName: 'kirby',
    cadVersion: 1,
    displayName: 'Kirby',
    role: 'mechanism',
    family: 'WORKINGairPump',
    description: 'Component role to be confirmed by Founder. Possibly named after Jack Kirby (comic art style) or functional nickname.',
    stackPosition: 'body',
    connectsTo: ['WORKINGairPump'],
    canonicalCandidate: true,
    notes: 'Name origin and specific function TBD.',
  },

  // ── COMPLIANT MECHANISMS (from FlyingButtress) ──
  {
    cadName: 'threeSisters05_Sawtooth60',
    cadVersion: 2,
    displayName: 'Sawtooth (Compliant Tooth Mechanism)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Sawtooth cam mechanism. The top of the sawtooth IS the bottom of sea level. Wave generators sit inside it. The sawtooth profile provides the cam action that converts rotational motion into wave motion.',
    stackPosition: 'body',
    connectsTo: ['threeSisters05_ouralis15', 'BedrockUnderworldSawtooth'],
    canonicalCandidate: true,
    notes: 'Top = sea level floor. Wave generators inside.',
  },
  {
    cadName: 'threeSisters05_tripleThreat',
    cadVersion: 4,
    displayName: 'Triple Threat (Multi-Function Variant)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Multi-function component variant. v4 with 4 iterations. Serves triple purpose in the mechanism.',
    stackPosition: 'body',
    connectsTo: [],
    canonicalCandidate: false,
    notes: 'May be consolidated into other pieces.',
  },
  {
    cadName: 'threeSisters05_medusaNake',
    cadVersion: 1,
    displayName: 'Medusa Nake (Variant Mechanism)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Variant mechanism component. Named in mythology theme (Medusa/Gorgon family).',
    stackPosition: 'body',
    connectsTo: ['gorgon'],
    canonicalCandidate: false,
    notes: 'Related to gorgon naming. Mythology theme: Medusa = type of gorgon.',
  },
  {
    cadName: 'prototype0602Nip_harmonized',
    cadVersion: 1,
    displayName: 'Prototype 0602 Nip (Harmonized)',
    role: 'structural',
    family: 'prototype',
    description: 'Earlier harmonized prototype. Possibly superseded by current harmonized component.',
    stackPosition: 'body',
    connectsTo: [],
    canonicalCandidate: false,
    notes: 'Early prototype — may be superseded.',
  },

  // ── NEWLY IDENTIFIED FROM FOUNDER CAD SCREENSHOTS (March 8, 2026) ──
  // Source: lockedDown v1, D09DEV v1, checkIt05 v21, threeSisters05 v82

  {
    cadName: 'channelLock',
    cadVersion: 1,
    displayName: 'ChannelLock (Base Foundation)',
    role: 'structural',
    family: 'threeSisters05',
    description: 'Base foundation of the Hexel. 60mm diameter circle, 9mm tall. 3 concentric ringed grooves (bulls-eye pattern) spaced 3mm apart. Center joined to HollowLog. Fluid-tight except at designed escape points. 6 air/fluid pipes at vertices.',
    stackPosition: 'body',
    connectsTo: ['RingOfPower', 'BedrockUnderworldSawtooth'],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82 and lockedDown v1 as green hexagonal base with concentric rings.',
  },
  {
    cadName: 'Sawtooth60',
    cadVersion: 1,
    displayName: 'Sawtooth60 (Current Direction / Ship Layer)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Ship interaction layer. 6 sides, each with DIFFERENT slant angle. Asymmetric tooth profile at 60-degree intervals. Adjacent Hexels have mirrored slants creating stable roadways. Styled as coral formations. Top = bottom of sea level. Bedrock, never moves.',
    stackPosition: 'body',
    connectsTo: ['threeSisters05_ouralis15', 'BedrockUnderworldSawtooth'],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82 browser. "Sawtooth Coral" — bedrock. 6 magnets at vertices.',
  },
  {
    cadName: '42Library_42timerBelt',
    cadVersion: 1,
    displayName: 'Timer Belt (Revolution Counter)',
    role: 'mechanism',
    family: '42Library',
    description: 'Hidden timing belt below Sawtooth Coral. Player-settable revolution count. NeedleValve engagement advances belt per PGear revolution. When belt reaches trigger point, opens airflow for trap activation. 5 revolutions = quick trap, 20 = delayed.',
    stackPosition: 'body',
    connectsTo: ['Sawtooth60', 'threeSisters05_OGpGearNeedleV'],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82 browser tree. Bag 5 Innovation #73.',
  },
  {
    cadName: 'BTHU_SmokeShow',
    cadVersion: 1,
    displayName: 'BTHU SmokeShow (Visual Effect Module)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Below-threshold unit visual effect variant. Creates smoke/mist effect at the wave component level.',
    stackPosition: 'top_module',
    connectsTo: ['threeSisters05_ouralis15'],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82. BTHU = Below Threshold Unit.',
  },
  {
    cadName: 'BTHU_lotusd',
    cadVersion: 1,
    displayName: 'BTHU Lotus\'d (Lotus Variant Output)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Below-threshold unit lotus variant. Golden Lotus-derived output mechanism.',
    stackPosition: 'top_module',
    connectsTo: ['goldenLotus09'],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82. Lotus variant of BTHU.',
  },
  {
    cadName: 'BTHU_disc',
    cadVersion: 1,
    displayName: 'BTHU Disc (Disc Variant Output)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Below-threshold unit disc variant. Disc-shaped output mechanism.',
    stackPosition: 'top_module',
    connectsTo: ['threeSisters05_ouralis15'],
    canonicalCandidate: false,
    notes: 'Visible in threeSisters05 v82. Disc variant.',
  },
  {
    cadName: 'roundabout',
    cadVersion: 1,
    displayName: 'Roundabout (Flow Distribution)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Circular flow distribution component. May function as the TurnTable / flow redirector the Founder described.',
    stackPosition: 'body',
    connectsTo: ['channelLock'],
    canonicalCandidate: true,
    notes: 'Two instances visible in threeSisters05 v82: roundabout:1 and roundabout (1):1.',
  },
  {
    cadName: 'insideBottomFromSixShooters',
    cadVersion: 1,
    displayName: 'Inside Bottom (Six Shooters Variant)',
    role: 'structural',
    family: 'threeSisters05',
    description: 'Internal bottom structure derived from "SixShooters" design iteration. Forms the interior base geometry.',
    stackPosition: 'body',
    connectsTo: ['channelLock'],
    canonicalCandidate: false,
    notes: 'Visible in threeSisters05 v82. May be consolidated.',
  },
  {
    cadName: 'yellowPetal',
    cadVersion: 1,
    displayName: 'Yellow Petal (Bloom Component)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Petal component for the pneumatic bloom sequence. Part of the Flying Flower system — petals unfold outward under pneumatic pressure.',
    stackPosition: 'top_module',
    connectsTo: [],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82. Related to Bag 5 Innovation #105 Bloom Sequence.',
  },
  {
    cadName: 'chandelier',
    cadVersion: 1,
    displayName: 'Chandelier (Hanging Mechanism)',
    role: 'mechanism',
    family: 'threeSisters05',
    description: 'Hanging mechanism component. May function as the Football/Cradle wave generator — the bell-weight that hangs down into the Sawtooth belly.',
    stackPosition: 'body',
    connectsTo: ['threeSisters05_ouralis15', 'Sawtooth60'],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82. Could be the "chandelier" = hanging wave gen.',
  },
  {
    cadName: 'orangeBase',
    cadVersion: 1,
    displayName: 'Orange Base (Foundation Variant)',
    role: 'structural',
    family: 'threeSisters05',
    description: 'Orange-colored base variant. Part of the foundation stack.',
    stackPosition: 'body',
    connectsTo: ['channelLock'],
    canonicalCandidate: false,
    notes: 'Visible in threeSisters05 v82.',
  },
  {
    cadName: 'triPod',
    cadVersion: 1,
    displayName: 'TriPod (Three-Point Anchor)',
    role: 'anchor',
    family: 'threeSisters05',
    description: 'Three-point anchor system. Related to tripodVerticesAnchor but as a standalone assembly piece in the threeSisters05 family.',
    stackPosition: 'slotted_top',
    connectsTo: ['FlyingButtress'],
    canonicalCandidate: true,
    notes: 'Visible in threeSisters05 v82. Assembly-level tripod.',
  },

  // ── From checkIt05 v21 browser tree ──
  {
    cadName: 'UnderworldRoof',
    cadVersion: 1,
    displayName: 'Underworld Roof',
    role: 'structural',
    family: 'checkIt05',
    description: 'Roof/ceiling of the Underverse layer. Forms the top boundary of the PGear/NeedleValve cavity. Separates the underworld (below) from the surface mechanics (above).',
    stackPosition: 'body',
    connectsTo: ['checkIt05_threshold', 'Sawtooth60'],
    canonicalCandidate: true,
    notes: 'Visible in checkIt05 v21. Underverse = the PGear/grooves layer.',
  },
  {
    cadName: 'BrandingIron',
    cadVersion: 1,
    displayName: 'Branding Iron',
    role: 'mechanism',
    family: 'checkIt05',
    description: 'Branding/marking mechanism. Function to be confirmed by Founder. May be related to the Capstone flip-axis trap reveal or the character trigger system.',
    stackPosition: 'body',
    connectsTo: [],
    canonicalCandidate: false,
    notes: 'Visible in checkIt05 v21. Function TBD.',
  },
  {
    cadName: 'hollowStumpFitSlot',
    cadVersion: 1,
    displayName: 'Hollow Stump Fit Slot',
    role: 'interface',
    family: 'checkIt05',
    description: 'Hollow stump-shaped socket for fit connections. Related to HollowLog — may be the interface where the HollowLog meets the upper assembly. Provides the fitment slot geometry.',
    stackPosition: 'body',
    connectsTo: ['checkIt05_threshold'],
    canonicalCandidate: true,
    notes: 'Visible in checkIt05 v21. "Hollow Stump" = HollowLog variant/socket.',
  },
  {
    cadName: 'LOOM',
    cadVersion: 1,
    displayName: 'LOOM',
    role: 'mechanism',
    family: 'checkIt05',
    description: 'Component function to be confirmed by Founder. Name suggests interlocking/weaving function — may relate to the timing belt weaving through the Sawtooth belly.',
    stackPosition: 'body',
    connectsTo: [],
    canonicalCandidate: false,
    notes: 'Visible in checkIt05 v21. Function TBD.',
  },
  {
    cadName: 'barrierReef',
    cadVersion: 1,
    displayName: 'Barrier Reef',
    role: 'structural',
    family: 'checkIt05',
    description: 'Barrier/reef structural element. May function as the outer perimeter wall of the Sawtooth Coral — the coral reef barrier that defines the hex boundary at sea level.',
    stackPosition: 'body',
    connectsTo: ['Sawtooth60', 'BedrockUnderworldSawtooth'],
    canonicalCandidate: true,
    notes: 'Visible in checkIt05 v21. Related to Sawtooth Coral outer structure.',
  },
  {
    cadName: 'wall',
    cadVersion: 1,
    displayName: 'Wall (Boundary Element)',
    role: 'structural',
    family: 'checkIt05',
    description: 'Wall segment component. May be an alternate name for NueWall or a distinct boundary element.',
    stackPosition: 'body',
    connectsTo: [],
    canonicalCandidate: false,
    notes: 'Visible in checkIt05 v21. Relationship to nueWall TBD.',
  },

  // ── From lockedDown v1 browser tree ──
  {
    cadName: 'Tarabithia',
    cadVersion: 1,
    displayName: 'Tarabithia',
    role: 'structural',
    family: 'lockedDown',
    description: 'Component in the lockedDown assembly. Name reference to "Bridge to Terabithia" — may represent a bridging or connecting element between assembly layers.',
    stackPosition: 'body',
    connectsTo: [],
    canonicalCandidate: false,
    notes: 'Visible in lockedDown v1 browser tree.',
  },
  {
    cadName: 'GreenWall',
    cadVersion: 1,
    displayName: 'Green Wall (Cavity Boundary)',
    role: 'structural',
    family: 'lockedDown',
    description: 'Green-colored wall component in the lockedDown assembly. May be a variant of NueWall with distinct color coding for a specific function.',
    stackPosition: 'body',
    connectsTo: ['GoldenLotus11'],
    canonicalCandidate: false,
    notes: 'Visible in lockedDown v1. Teal/green color in CAD.',
  },
  {
    cadName: 'GoldenLotus11',
    cadVersion: 11,
    displayName: 'Golden Lotus v11 (Latest Version)',
    role: 'power_transmission',
    family: 'lockedDown',
    description: 'Version 11 of the Golden Lotus flow-to-rotation converter. This is newer than goldenLotus09 in threeSisters05. Contains the 6 Tesla valve cups with alternating UP/DOWN orientations and Rooster Teeth.',
    stackPosition: 'body',
    connectsTo: ['GreenWall', 'stalagTites'],
    cadColor: 'gold/yellow',
    canonicalCandidate: true,
    notes: 'v11 in lockedDown v1 — newer than v9 (goldenLotus09) and v7 (goldenLotus07). Latest iteration.',
  },
  {
    cadName: 'stalagTites',
    cadVersion: 1,
    displayName: 'Stalactites/Stalagmites (Rooster Teeth)',
    role: 'mechanism',
    family: 'lockedDown',
    description: 'Stalactite/stalagmite-shaped protrusions inside the Tesla Valve cups. These ARE the Rooster Teeth — named "stalagTites" because they protrude upward (stalagmites) and downward (stalactites) alternately through the cups.',
    stackPosition: 'body',
    connectsTo: ['GoldenLotus11'],
    canonicalCandidate: true,
    notes: 'Visible in lockedDown v1. stalagTites = Rooster Teeth. Name confirms the alternating UP/DOWN protrusion pattern.',
  },

  // ── From threeSisters05 v82 — additional BTHU variants ──
  {
    cadName: 'threeSisters_triPodTEST_rogue',
    cadVersion: 1,
    displayName: 'TriPod Test Rogue (Experimental Anchor)',
    role: 'anchor',
    family: 'threeSisters05',
    description: 'Experimental/rogue variant of the tripod anchor system. Test iteration.',
    stackPosition: 'slotted_top',
    connectsTo: ['FlyingButtress'],
    canonicalCandidate: false,
    notes: 'Test variant visible in threeSisters05 v82.',
  },
];

// ============================================================================
// POWER TRANSMISSION CHAIN
// ============================================================================

/**
 * The hydraulic/pneumatic power transmission sequence.
 * This is how the Tereno world is powered.
 *
 * Reading from source to output:
 *
 *   SOURCE:     Adjacent Hexels' connected cavities under pressure
 *      ↓
 *   DRIVE:      Inverse hydraulic action → Golden Lotus (toothed ring) rotates
 *      ↓
 *   TRANSFER:   Golden Lotus meshes with Helical Gear
 *      ↓
 *   ROUTE:      Helical Gear → Rotor → Ouralis
 *      ↓
 *   OUTPUT A:   Ouralis drives Wave Generator (inside Sawtooth)
 *               → Ocean/river wave and tide motion
 *      ↓
 *   OUTPUT B:   (REPURPOSED) Same power drives ANY mechanism:
 *               → Monster animation (flailing arms, chainsaw)
 *               → Siege engine operation
 *               → Drawbridge lift
 *               → Trap activation
 *               → Signal/beacon mechanism
 *               → Custom game mechanic
 *
 *   CONTROL:    OneWay valve prevents backflow
 *               RingOfPower seals pressure
 *               Gorgon locks/unlocks Slotted Top trapdoor
 */
export interface PowerTransmissionStep {
  /** Step number in the chain (1 = source) */
  order: number;
  /** Component that performs this step */
  component: string;
  /** What this step does */
  action: string;
  /** Physical mechanism type */
  mechanismType: 'pressure' | 'rotation' | 'translation' | 'oscillation' | 'seal' | 'valve';
  /** Can the output be repurposed? */
  repurposable: boolean;
}

export const POWER_CHAIN: PowerTransmissionStep[] = [
  { order: 1, component: 'Adjacent Hexel Cavities',           action: 'Generate hydraulic pressure through connected cavity network',    mechanismType: 'pressure',    repurposable: false },
  { order: 2, component: 'RingOfPower',                       action: 'Seal cavity to maintain pressure',                                mechanismType: 'seal',        repurposable: false },
  { order: 3, component: 'oneWay',                            action: 'Enforce directional flow, prevent backflow',                      mechanismType: 'valve',       repurposable: false },
  { order: 4, component: 'goldenLotus09',                     action: 'Convert hydraulic pressure to rotation (inverse action)',          mechanismType: 'rotation',    repurposable: false },
  { order: 5, component: 'Helical Gear (24R@30.00 m=2.15)',   action: 'Transmit rotation with gear ratio change',                        mechanismType: 'rotation',    repurposable: false },
  { order: 6, component: 'threeSisters05_rotor12',            action: 'Transfer rotational energy to mechanism output',                  mechanismType: 'rotation',    repurposable: false },
  { order: 7, component: 'threeSisters05_ouralis15',          action: 'Convert rotation to wave/oscillation OR drive mechanism',          mechanismType: 'oscillation', repurposable: true  },
  { order: 8, component: 'threeSisters05_BTHU_WATERFALL',     action: 'Generate visible wave/tide motion at sea level',                  mechanismType: 'oscillation', repurposable: true  },
];

// ============================================================================
// CANONICAL PIECE COUNT TRACKING
// ============================================================================

/**
 * The Founder is winnowing from 1200+ CAD models down to ~18 canonical pieces.
 * This tracks which components are candidates for the final set.
 */
export function getCanonicalCandidates(): HexelComponent[] {
  return HEXEL_COMPONENTS.filter(c => c.canonicalCandidate);
}

export function getComponentsByRole(role: ComponentRole): HexelComponent[] {
  return HEXEL_COMPONENTS.filter(c => c.role === role);
}

export function getComponentsByFamily(family: string): HexelComponent[] {
  return HEXEL_COMPONENTS.filter(c => c.family === family);
}

export function getComponentByName(cadName: string): HexelComponent | undefined {
  return HEXEL_COMPONENTS.find(c => c.cadName === cadName);
}

/**
 * Current canonical candidate count.
 * Target: ~18 pieces (Founder's goal).
 */
export function getCanonicalCount(): { current: number; target: number; remaining: number } {
  const current = getCanonicalCandidates().length;
  const target = 18;
  return { current, target, remaining: target - current };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  HEXEL_COMPONENTS,
  POWER_CHAIN,
  getCanonicalCandidates,
  getComponentsByRole,
  getComponentsByFamily,
  getComponentByName,
  getCanonicalCount,
};
