/**
 * HEXISLE PROJECT SPECIFICATION — Crown Jewel #3: Tereno Hydraulic
 * ================================================================
 * Innovation #1467: Comprehensive HexIsle Project Module
 *
 * The complete specification for HexIsle, assembled from:
 * - HEXISLE_TECHNICAL_HANDOVER_COMPLETE.md (Vault)
 * - hexisle-tereno-33-core-innovations.md (Patent Filing)
 * - PAPER_HEXISLE_ITS_NOT_AMBITIOUS.md (Academic Paper)
 * - KICKSTARTER_CAMPAIGN_1_TERENO_PAGE_CONTENT.md
 * - KICKSTARTER_CAMPAIGN_2_HEXISLE_PAGE_CONTENT.md
 * - FUSION360_FILES_INDEX.md (146 CAD files)
 * - HexIsle Lore Official by Caleb Jones (Creative Director)
 * - TERENO_HEXISLE_COMPLETE_DOCUMENTATION.md
 * - E:\Disk 0\Drive E for Exisle (original archive, Bloom Toys era)
 *
 * Patent: 63/938,216 filed December 10, 2025 ($65 micro entity)
 * Additional patent: 63/925,672 (Bag #1)
 *
 * Domain: hexislo.com (Spanish spelling — intentional, NOT a typo)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE IDENTITY
// ═══════════════════════════════════════════════════════════════════════════════

export const HEXISLE_IDENTITY = {
  name: 'HexIsle',
  subtitle: 'The Tereno Water Table',
  tagline: 'No batteries. No arguments. Just physics.',
  crownJewel: 3,
  crownJewelName: 'Tereno Hydraulic',
  initiative: 'Brass Tacks (#16)',
  domain: 'hexislo.com', // Spanish spelling — intentional
  productionURL: 'https://hexisle.com',
  firebaseTarget: 'hexisle',

  description: `A physical, tactile strategy game played on hexagonal tiles with water
  channels. No screens. No batteries. Pure physics and strategy. The tiles interlock via
  "If It Fits, It Sits" (IIFIS) — if the piece physically fits in the hex, it's a legal move.
  Water flows through channels to power mechanisms and determine outcomes. Diceless combat.
  Real hydraulics. Made by the cooperative, for the cooperative.`,

  founderNote: `In 6th grade, I built floating cities for a school project. The newspaper
  called it "Wave of the Future." This is that wave, 40 years later. 1,200+ Fusion 360
  diagrams. 146 CAD files. 33 patented innovations. One water table.`,

  creativeDirector: 'Caleb Jones',
  artAssets: {
    islandMaps: [
      'Hexisle_map_final1.png', 'Hexisle_map_final2_big.png',
      'Hexisle_map_final4.png', 'hexisle2ndIsland_5point4.png',
      'hexisle3rdIsland_finalBig.png', 'hexisleIslands_FinalBig.png',
    ],
    conceptArt: [
      'HexisleConcepts_1.png', 'HexisleConcepts_2.png', 'HexisleConcepts_3.png',
      'HexisleConcepts_4.png', 'HexisleConcepts_5.png', 'HexisleConcepts_6.png',
      'HexisleConcepts_7.png', 'HexisleConcepts_worldMap.png',
    ],
    lorePDF: 'Hexisle Lore Official - Caleb Jones, Creative Director.pdf',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TERENO PLATFORM — The Game Creation Engine
// ═══════════════════════════════════════════════════════════════════════════════

export const TERENO_PLATFORM = {
  name: 'Tereno Platform',
  classification: 'F.M.C. (First, Mission Critical)',
  description: `The game creation platform that allows members to create games with
  real-world contract connections. HexIsle is the flagship game built on Tereno.`,

  capabilities: [
    'Multiple game types (custom, HexIsle variants, challenges, campaigns)',
    'Gameplay modes (real-time, async, turn-based, week-long)',
    'Real-world assignment connections',
    'Contract integration for real-world verification',
    'Empirical data collection for AI-suggested improvements',
    'Ghost Items system (purchasable virtual items → real products)',
    '89,000+ model variants per item type',
    'Skills system (earned only, NEVER purchased)',
    'Revenue sharing (15% to LB, configurable)',
  ],

  ghostItems: {
    description: 'Virtual items that connect to real products — purchasable with credits',
    categories: ['weapons', 'tools', 'consumables', 'armor', 'accessories'] as const,
    variantsPerType: 89000, // With Easter egg at 89,000!
    rarityLevels: ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const,
    unlockConditions: ['default', 'purchased', 'achievement', 'level', 'special_event'] as const,
    criticalDistinction: 'Ghost Items are PURCHASABLE. Skills are NOT. Skills are EARNED only.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEXEL — The Core Building Block
// ═══════════════════════════════════════════════════════════════════════════════

export interface HexelSpec {
  name: string;
  partCount: number;
  mechanism: string;
  scale: string;
  material: string;
  manufacturingMethod: string;
}

export const HEXEL: HexelSpec = {
  name: 'Hexel',
  partCount: 12,
  mechanism: '12-part modular game tile that snaps together, connects to others, ' +
    'contains working mechanisms, responds to player actions, works with water',
  scale: 'Configurable — 25mm/28mm/32mm via Universal Scale Adapter',
  material: 'Resin (SLA/SLS prototype) → Injection molded at scale',
  manufacturingMethod: 'POCF — Print Once Connect Forever',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORE MECHANISMS
// ═══════════════════════════════════════════════════════════════════════════════

export const CORE_MECHANISMS = {
  channelLock: {
    name: 'ChannelLock',
    role: 'Base connector',
    description: 'Hexagonal base that locks Hexels together and channels water between them',
  },
  hollowLog: {
    name: 'HollowLog',
    role: 'Central column',
    diameter: '15.50mm',
    description: 'Central water column in each Hexel, conducts hydraulic pressure',
  },
  goldenLotus: {
    name: 'Golden Lotus',
    role: 'Flow-to-rotation converter',
    description: '6-cup Tesla valve-shaped mechanism that converts hydraulic push/pull into rotational motion',
    innovation: 'Tesla Valve-shaped cups — the key breakthrough',
  },
  ouralis: {
    name: 'Ouralis',
    role: 'Tidal clock mechanism',
    rotations: 12,
    description: '12-rotation tide cycle that creates the game\'s clock. One full tide = one game turn.',
  },
  sawtooth60: {
    name: 'Sawtooth60',
    role: 'Current system',
    description: 'Sawtooth-pattern current framework that creates directional water flow in channels',
    depth: '36mm below Water Table Perimeter',
    grooveDepth: '18mm',
  },
  rotor: {
    name: 'Rotor',
    role: 'Motion output',
    description: 'Converts Golden Lotus rotation into visible game-state changes',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICS — Why It Works
// ═══════════════════════════════════════════════════════════════════════════════

export const PHYSICS = {
  headHeight: '3 feet (optimal)',
  operatingPressure: '~1.30 psi at 3-foot head',
  sweetSpotPressure: '~2.17 psi at 5-foot head',
  netTorquePerHexel: '~3.0 in-lb',
  requiredTorque: '~0.5 in-lb',
  safetyMargin: '6x (3.0 / 0.5)',
  totalHexels: 420,
  totalSystemWeight: '~320 lbs',
  footprint: '60 inches',
  shippingMethod: 'Flat-pack (zip-tie release, telescoping legs, 5-gallon jug fill)',
  waterSource: 'Gravity-fed — no pumps, no batteries, no electronics',
  acGeneration: 'AC pressure waves generated without pumps',
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEVEN ISLANDS — The Game World
// ═══════════════════════════════════════════════════════════════════════════════

export interface Island {
  number: number;
  name: string;
  theme: string;
  businessSkill: string;
  artFile: string;
}

export const SEVEN_ISLANDS: Island[] = [
  { number: 1, name: 'Harvest Island',     theme: 'Manufacturing',  businessSkill: 'Production & supply chain',    artFile: 'hexisle-1-harvest' },
  { number: 2, name: 'Navigate Island',    theme: 'Sales',          businessSkill: 'Market navigation & trade',    artFile: 'hexisle-2-navigate' },
  { number: 3, name: 'Engineer Island',    theme: 'R&D',           businessSkill: 'Research & development',        artFile: 'hexisle-3-engineer' },
  { number: 4, name: 'Battle Island',      theme: 'Competition',    businessSkill: 'Competitive strategy',         artFile: 'hexisle-4-battle' },
  { number: 5, name: 'Seek Island',        theme: 'Quality',        businessSkill: 'Quality assurance & testing',  artFile: 'hexisle-5-seek' },
  { number: 6, name: 'Magic Island',       theme: 'Service',        businessSkill: 'Customer service & delight',   artFile: 'hexisle-6-magic' },
  { number: 7, name: 'Train Island',       theme: 'Leadership',     businessSkill: 'Team building & management',   artFile: 'hexisle-7-train' },
];

// Cephas Names (Innovation #10)
export const CEPHAS_ISLAND_NAMES = {
  1: "Crafter's Cove",
  2: "Merchant's Mile",
  3: "Scholar's Spire",
  4: "Builder's Basin",
  5: "Healer's Haven",
  6: "Ranger's Rest",
  7: "Council Keep",
};

// Twelve Cities (TwelveCities.tsx)
export const TWELVE_CITIES = [
  'Aquilae', 'Tereno', 'Ventara', 'Pyralis', 'Glacium', 'Verdana',
  'Umbria', 'Solara', 'Abyssia', 'Nexara', 'Crystallum', 'Ethereon',
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTERS — The Player Roster
// ═══════════════════════════════════════════════════════════════════════════════

export interface HexIsleCharacter {
  name: string;
  title: string;
  trait: string;
  scale: string;
  preOrderCount: number;
  price: number; // in Credits
}

export const CHARACTERS: HexIsleCharacter[] = [
  { name: 'Navigator', title: 'Frame', trait: 'Current-route specialist', scale: '28mm', preOrderCount: 47, price: 12 },
  { name: 'Engineer',  title: 'Frame', trait: 'Bridge and dam systems specialist', scale: '28mm', preOrderCount: 38, price: 12 },
  { name: 'Tidecaller', title: 'Frame', trait: 'Upper-current scouting specialist', scale: '28mm', preOrderCount: 31, price: 12 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GAMES WITHIN HEXISLE
// ═══════════════════════════════════════════════════════════════════════════════

export const HEXISLE_GAMES = {
  mobblesAndBobbles: {
    name: 'Mobbles and Bobbles',
    description: 'Magnetic steel balls (Mobbles) and buoyant polymer balls (Bobbles) in a strategic transit game',
    mobbleDiameter: '8.4mm (Mag Pipe compatible)',
    mechanic: 'Players route balls through built-in pathways; Mobbles are magnetic, Bobbles float',
  },
  damsAndDrains: {
    name: 'Dams and Drains',
    description: 'Hydraulic cascade with real water, boats, barges, water locks, whirlpools, pumping stations',
    mechanic: 'Build dam structures, control water flow, navigate vessels through locks',
  },
  iifis: {
    name: 'If It Fits, It Sits (IIFIS)',
    description: 'The core rule: if the piece physically fits in the hex, it\'s a legal move. A 4-year-old can play without reading.',
    mechanic: 'Physical constraint = game rule. No rulebook needed for basic play.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 33 PATENTED INNOVATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PatentedInnovation {
  number: number;
  name: string;
  category: 'mechanical' | 'system' | 'energy' | 'manufacturing';
  description: string;
  // CAI implementation metadata (Wave 2 / BP025)
  status?: 'implemented' | 'stub' | 'pending';
  component?: string;
  hook?: string;
  wave?: number;
  old_one?: string;
  innovationId?: string;
}

export const PATENTED_INNOVATIONS: PatentedInnovation[] = [
  // Mechanical (#1-10)
  { number: 1,  category: 'mechanical',    name: 'Hexel 12-Part Modular Construction',           description: '12 parts snap together into one functional Hexel tile' },
  { number: 2,  category: 'mechanical',    name: 'Inverse Hydraulic Coupling',                   description: 'When A piston moves, B moves opposite — daisy chain linkage' },
  { number: 3,  category: 'mechanical',    name: 'Ouralis Tidal Mechanism',                      description: '12-rotation tide cycle = one game turn', status: 'implemented', innovationId: 'MISS-002', component: 'OuralisTidalMechanismEngine', hook: 'useOuralisTidalMechanism', wave: 2, old_one: 'urSu' },
  { number: 4,  category: 'mechanical',    name: 'Sawtooth60 Directional Current',               description: 'Sawtooth-pattern channels create directional water flow' },
  { number: 5,  category: 'mechanical',    name: 'Rudder Keel Ship Mechanics',                   description: 'Ships navigate currents using physics-based rudder/keel' },
  { number: 6,  category: 'mechanical',    name: 'Magnetic Character Placement',                 description: 'Characters magnetically snap to designated tile positions' },
  { number: 7,  category: 'mechanical',    name: 'Character-Triggered Mechanisms',                description: 'Placing a character activates tile mechanisms via weight/magnet' },
  { number: 8,  category: 'mechanical',    name: 'Compliant Mechanism Terrain Caps',              description: 'Capstone system — flexible snap-on terrain covers' },
  { number: 9,  category: 'mechanical',    name: 'Universal Scale Adapter',                       description: '25mm/28mm/32mm compatibility via adapter rings' },
  { number: 10, category: 'mechanical',    name: 'Hydraulic-to-Pneumatic Plant System',           description: 'Water pressure converts to air pressure for above-water effects' },

  // System (#11-23)
  { number: 11, category: 'system',        name: 'AC Pressure Generation',                        description: 'Creates alternating pressure waves without pumps' },
  { number: 12, category: 'system',        name: 'Clock-as-Game-State Controller',                description: 'Ouralis tide cycle IS the game clock — no timers needed' },
  { number: 13, category: 'system',        name: 'Banyan Tree Distribution Manifold',             description: 'Water distributes like a banyan tree root system', status: 'stub', innovationId: 'MISS-007', component: 'BanyanTreeDistributionManifoldEngine', hook: 'useBanyanTreeDistributionManifold', wave: 2, old_one: 'urSu' },
  { number: 14, category: 'system',        name: 'One-Way Valve Network',                         description: 'Tesla valve-inspired unidirectional flow control' },
  { number: 15, category: 'system',        name: 'Gravity-Powered Baseline',                      description: '8-foot column provides gravity-fed pressure' },
  { number: 16, category: 'system',        name: 'Cascading Hexagonal Containers',                description: 'Water cascades between nested hex containers' },
  { number: 17, category: 'system',        name: 'Continuous Fluid Loop',                         description: 'Water recirculates without external pumps' },
  { number: 18, category: 'system',        name: 'Multi-Character Trigger Gates',                 description: 'Multiple characters required to trigger certain mechanisms' },
  { number: 19, category: 'system',        name: 'Modular Canoe-to-Viking Ship Transform',        description: 'Ships grow by snapping additional hull segments' },
  { number: 20, category: 'system',        name: 'Turn-Based Growth Cycle',                       description: 'Plants/structures grow each tide cycle (turn)' },
  { number: 21, category: 'system',        name: 'Harvest-Only-When-Mature Lock',                 description: 'Physical lock prevents harvest before growth completes' },
  { number: 22, category: 'system',        name: 'Water Table Gravity Engine',                    description: '5+ gallon reservoir provides sustained hydraulic power' },
  { number: 23, category: 'system',        name: 'Snap-Together Board Assembly',                  description: 'Entire board assembles without tools, screws, or adhesive' },

  // Energy (#24-27)
  { number: 24, category: 'energy',        name: 'Stirling Cycle Water Fountain',                 description: 'Heat-driven fountain using Stirling engine principles' },
  { number: 25, category: 'energy',        name: 'Electrolysis Integration Module',               description: 'Water splitting for educational chemistry demonstrations' },
  { number: 26, category: 'energy',        name: 'Water Table-to-Stirling Converter',             description: 'Converts water table thermal energy to mechanical work' },
  { number: 27, category: 'energy',        name: 'Evaporative Purification Cycle',                description: 'Water purification through evaporation/condensation cycle' },

  // Manufacturing (#28-33)
  { number: 28, category: 'manufacturing', name: 'Lithographic Dual-Process Design',              description: '3D Print + Injection Mold from SAME CAD file' },
  { number: 29, category: 'manufacturing', name: 'Zero-Overhang Constraint System',               description: 'No undercuts in any mold — printable AND moldable' },
  { number: 30, category: 'manufacturing', name: 'Airtight Hydraulic Snap-Fit Assembly',           description: 'Seals without adhesive — hydraulic-tight snap connections', status: 'stub', innovationId: 'STUB-007', component: 'AirtightHydraulicSnapFitAssemblyEngine', hook: 'useAirtightHydraulicSnapFitAssembly', wave: 2, old_one: 'urSu' },
  { number: 31, category: 'manufacturing', name: 'Modular Character Component System',            description: 'Hair/clothes/accessories snap on — customize without reprinting' },
  { number: 32, category: 'manufacturing', name: 'POSTF (Print Once Snap Together Forever)',       description: 'Permanent snap without glue — works for home printing AND mass production' },
  { number: 33, category: 'manufacturing', name: 'Multi-Color Cost-Efficient Assembly',           description: 'Custom colors without painting — each piece is its own color' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MANUFACTURING PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

export const MANUFACTURING = {
  designSoftware: 'Autodesk Fusion 360',
  cadFileCount: 146,
  mainAssemblyFile: 'pGear12DD.f3d (157 MB)',
  patentNumber: '63/938,216',
  patentFilingDate: '2025-12-10',
  patentFilingCost: 65, // micro entity

  pocf: {
    name: 'POCF — Print Once Connect Forever',
    description: 'Every undercut designed as a separate piece with precision pegs. ' +
      'Prints flat (no supports), snaps together permanently. ' +
      'Works identically whether home-printed or mass-produced.',
    slogan: 'You\'re not getting hobbyist STLs. You\'re getting production-grade designs.',
  },

  productionLevels: [
    { level: 1, name: 'SLA Prototyping',     units: 10,      price: 100, method: 'Formlabs Form 4' },
    { level: 2, name: 'FDM Short Run',       units: 100,     price: 85,  method: 'FDM farm' },
    { level: 3, name: 'SLS Printing',        units: 1000,    price: 70,  method: 'SLS batch production' },
    { level: 4, name: 'Desktop Injection',   units: 10000,   price: 60,  method: 'Desktop injection molding' },
    { level: 5, name: 'Factory Tooling',     units: 100000,  price: 50,  method: 'Production injection molds' },
    { level: 6, name: 'Mass Production',     units: 1000000, price: 40,  method: 'Mass injection + Cost+20%' },
  ],

  formlabs: {
    printer: 'Form 4 ($4,499) / Form 3+ ($2,499)',
    bulkResin: '$35/L minimum',
    localAPI: 'PreFormServer for job submission',
    webAPI: 'OAuth 2.0 fleet monitoring',
    pythonSDK: 'formlabs/formlabs-api-python',
    formNow: 'now.formlabs.com (overflow)',
  },

  distributedManufacturing: {
    name: 'Pioneer Nodes',
    description: 'Makers with Formlabs printers register as manufacturing nodes. ' +
      'Platform sends jobs. They print, quality-check, and ship.',
    requirements: ['Formlabs Form 3+ or Form 4', 'PreFormServer installed', 'Quality certification'],
    creatorShare: 0.833,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// KICKSTARTER CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════════════════

export const KICKSTARTER_CAMPAIGNS = [
  {
    number: 1,
    name: 'Tereno: The Water Table',
    subtitle: 'Hydraulic Power for Tabletop Gaming',
    goal: 12000,
    category: 'Tabletop Games',
    description: 'The power source that drives HexIsle. A gaming surface that creates real tides, waves, and currents.',
  },
  {
    number: 2,
    name: 'HexIsle: The Hexel Game',
    subtitle: 'Modular Tiles That Actually Move',
    goal: 12000,
    category: 'Tabletop Games',
    description: '12-part modular tiles that snap together, connect to each other, and contain working mechanisms.',
  },
  {
    number: 3,
    name: 'Liana Banyan: Design to Doorstep',
    subtitle: 'Cooperative Manufacturing Pipeline',
    description: 'The manufacturing model that makes it all work.',
  },
  {
    number: 4,
    name: 'Farmer/Warrior',
    subtitle: 'Character expansion pack',
    description: 'Character miniatures for farming and combat roles.',
  },
  {
    number: 5,
    name: 'Healer/Assassin',
    subtitle: 'Character expansion pack',
    description: 'Character miniatures for healing and stealth roles.',
  },
  {
    number: 6,
    name: 'War Horse',
    subtitle: 'Vehicle/mount expansion',
    description: 'Mounts and vehicles for the HexIsle world.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VIDEO ASSETS
// ═══════════════════════════════════════════════════════════════════════════════

export const VIDEO_ASSETS = {
  kickstarterVideo: 'LianaBanyan_Kickstarter_Video1_FINAL.mp4',
  moreThanMe: 'Liana-Banyan-More-Than-Me-FINAL.mp4',
  founderJourney: 'LianaBanyan_FounderJourney_v1.mp4',
  calebPitchDeck: 'Caleb_Visual_Pitch_Deck.pdf',
};

// ═══════════════════════════════════════════════════════════════════════════════
// DAISYCHAINLINK — Physical AND Digital
// ═══════════════════════════════════════════════════════════════════════════════

export const HEXISLE_DAISYCHAIN = {
  physical: {
    description: 'The Hexels themselves connect in daisy chain linkage. ' +
      'A → B → C → D → ... → back to A. Inverse hydraulic coupling.',
    pattern: 'When A piston moves, B moves opposite',
    demo: '7-Hexel demo: center connects to one outer, outer ring connects around, last outer connects back to center',
  },
  digital: {
    coasterMedallion: true,
    seniorPicsSwaps: ['game-organizer-001'],
    chainVotingBonus: 0.05,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAI WAVE-2 IMPLEMENTATIONS — Old One: urZah / Bushel 29 / BP025
// ═══════════════════════════════════════════════════════════════════════════════

export interface WaveImplementation {
  id: string;
  name: string;
  status: 'stub' | 'implemented';
  wave: number;
  old_one: string;
  bushel: string;
  component: string;
  hook: string;
  depends_on: string[];
  description: string;
}

export const WAVE2_IMPLEMENTATIONS: WaveImplementation[] = [
  {
    id: 'MISS-015',
    name: 'Sawtooth60 Directional Current (gap close)',
    status: 'implemented',
    wave: 2,
    old_one: 'urZah',
    bushel: 'BP025',
    component: 'Sawtooth60DirectionalCurrentgapcloseEngine',
    hook: 'useSawtooth60DirectionalCurrentgapclose',
    depends_on: ['MISS-002'],
    description:
      'Sawtooth-pattern channels at 36mm depth create directional water flow. ' +
      '60-tooth sawtooth geometry at ChannelLock base enforces preferred current direction; ' +
      'reversed Hexel placement creates opposing current. ' +
      'Interfaces with OuralisTidalMechanismEngine for phase synchronisation.',
  },
  {
    id: 'MISS-008',
    name: 'One-Way Valve Network',
    status: 'implemented',
    wave: 2,
    old_one: 'urZah',
    bushel: 'BP025',
    component: 'OneWayValveNetworkEngine',
    hook: 'useOneWayValveNetwork',
    depends_on: ['MISS-007'],
    description:
      'Tesla valve-inspired unidirectional flow control at each ChannelLock junction. ' +
      'No moving parts; geometry alone enforces directionality at ~90% efficiency per junction. ' +
      'BanyanTree distribution manifold (MISS-007) wired as stub interface pending full coupling.',
  },
  {
    id: 'STUB-001',
    name: 'Sawtooth60 Directional Current (stub → full)',
    status: 'implemented',
    wave: 2,
    old_one: 'urZah',
    bushel: 'BP025',
    component: 'Sawtooth60DirectionalCurrentEngine',
    hook: 'useSawtooth60DirectionalCurrent',
    depends_on: ['MISS-002', 'MISS-015'],
    description:
      'Full directional-current simulation. Spec defined in hexisleProjectSpec.ts; ' +
      'CanalRenderer exists but directional-current simulation was not wired. ' +
      'Now implements: sawtooth geometry shader + current-force vector per-Hexel-edge. ' +
      'Four-phase lifecycle (idle → ramp_up → peak → ramp_down). ' +
      'Ouralis phase sync and MISS-015 gapclose bridge both active.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// E: DRIVE ARCHIVE — Bloom Toys Era
// ═══════════════════════════════════════════════════════════════════════════════

export const ARCHIVE = {
  eDrivePath: 'E:\\Disk 0\\Drive E for Exisle',
  era: 'Bloom Toys (predecessor company)',
  contents: 'Original engineering/design archive with hex tile system, characters, mechanisms',
  pitchDeckReference: '8 utility patents, 21 design patents (from Pitch Deck PDF)',
  note: '40+ years of development documented here',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAI CONDUCTOR — WAVE 2 IMPLEMENTATIONS (Old Ones Wave 2, Bushel 29 / BP025)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CaiInnovationEntry {
  id: string;
  name: string;
  old_one: string;
  wave: number;
  bushel: string;
  status: 'planned' | 'fix_upon_authority' | 'implemented';
  component: string;
  hook: string;
  depends_on?: string[];
  description: string;
  files: string[];
}

export const CAI_WAVE2_INNOVATIONS: CaiInnovationEntry[] = [
  {
    id: 'MISS-003',
    name: 'Rudder Keel Ship Mechanics',
    old_one: 'urUtt',
    wave: 2,
    bushel: 'BP025',
    status: 'implemented',
    component: 'RudderKeelShipMechanicsEngine',
    hook: 'useRudderKeelShipMechanics',
    depends_on: ['MISS-015', 'STUB-001'],
    description: 'Ships navigate currents using physics-based rudder/keel geometry. ' +
      'Sawtooth60 current exerts lateral force proportional to keel depth; ' +
      'rudder angle determines turning radius.',
    files: [
      'src/components/hexisle/RudderKeelShipMechanicsEngine.tsx',
      'src/hooks/useRudderKeelShipMechanics.ts',
    ],
  },
  {
    id: 'MISS-009',
    name: 'Gravity-Powered Baseline',
    old_one: 'urUtt',
    wave: 2,
    bushel: 'BP025',
    status: 'implemented',
    component: 'GravityPoweredBaselineEngine',
    hook: 'useGravityPoweredBaseline',
    description: '8-foot column provides gravity-fed pressure (~2.17 psi at 5-foot effective head). ' +
      'No pumps, no batteries. Water source: 5-gallon jug on telescoping legs (flat-pack ship).',
    files: [
      'src/components/hexisle/GravityPoweredBaselineEngine.tsx',
      'src/hooks/useGravityPoweredBaseline.ts',
    ],
  },
  {
    id: 'STUB-003',
    name: 'Clock-as-Game-State Controller',
    old_one: 'urUtt',
    wave: 2,
    bushel: 'BP025',
    status: 'implemented',
    component: 'ClockasGameStateControllerEngine',
    hook: 'useClockasGameStateController',
    depends_on: ['MISS-002'],
    description: 'Ouralis wired as game clock. OuralisClock React context + 12-step rotation state ' +
      '+ QuestSystem subscription to OuralisClock.tick event.',
    files: [
      'src/components/hexisle/ClockasGameStateControllerEngine.tsx',
      'src/components/hexisle/OuralisClockContext.tsx',
      'src/hooks/useClockasGameStateController.ts',
      'src/components/hexisle/QuestSystem.tsx', // updated: OuralisClock subscription added
    ],
  },
];
