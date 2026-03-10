/**
 * SLOTTED TOP SHOWCASE — Innovation #1552
 * =========================================
 * Universal Hex Terrain Retention via Lithographic Compliant Pincers.
 *
 * The SlottedTop is the crown jewel of the Hexel piece grammar:
 * a single lithographic compliant mechanism that grips ANY flat hex terrain
 * tile in the 32-35mm range as a snap-on terrain skin. Active trap mechanics
 * are preserved underneath — terrain appears normal from above while the
 * Cradle flip mechanism remains fully operational below.
 *
 * This makes HexIsle the universal hex platform that bridges every major
 * hex gaming ecosystem: BattleTech, Open WarHex, Green Stuff World, and
 * the 33mm international standard.
 *
 * Patent-relevant. Innovation #1552.
 */

// ─── SlottedTop Dimensional Constants ──────────────────────────────────────

/** Center hexagon: flat-to-flat measurement in mm */
export const CENTER_HEX_MM = 24;

/** Gap between center hex edge and half-hex protrusion inner edge, in mm */
export const GAP_MM = 6;

/** Total SlottedTop flat-to-flat: center + 2 gaps = retention zone boundary */
export const RETENTION_ZONE_MM = CENTER_HEX_MM + 2 * GAP_MM; // 36mm

/** Total piece flat-to-flat in mm (full SlottedTop with protrusions) */
export const TOTAL_PIECE_MM = 60;

// ─── Compatible Hex Terrain Systems ────────────────────────────────────────

export type CompatibilityRating = "perfect" | "excellent" | "good" | "near" | "incompatible";

export interface HexTerrainSystem {
  name: string;
  company: string;
  hexSizeMm: number;
  clearancePerSideMm: number;
  rating: CompatibilityRating;
  marketSize: "dominant" | "major" | "growing" | "niche";
  notes: string;
}

/**
 * Every major hex terrain system analyzed against the 24mm + 6mm SlottedTop.
 * Clearance = (RETENTION_ZONE_MM - hexSizeMm) / 2
 */
export const COMPATIBLE_SYSTEMS: HexTerrainSystem[] = [
  {
    name: "Open WarHex",
    company: "GarageBay9",
    hexSizeMm: 34.29,
    clearancePerSideMm: +(RETENTION_ZONE_MM - 34.29) / 2, // 0.855mm
    rating: "perfect",
    marketSize: "growing",
    notes: "1.35\" (34.29mm). Near-perfect snap fit. Primary partnership target.",
  },
  {
    name: "BattleTech (classic)",
    company: "Catalyst Game Labs",
    hexSizeMm: 32,
    clearancePerSideMm: +(RETENTION_ZONE_MM - 32) / 2, // 2.0mm
    rating: "excellent",
    marketSize: "dominant",
    notes: "The largest hex wargaming franchise on Earth. 32mm classic tiles.",
  },
  {
    name: "BattleTech (new)",
    company: "Catalyst Game Labs",
    hexSizeMm: 33,
    clearancePerSideMm: +(RETENTION_ZONE_MM - 33) / 2, // 1.5mm
    rating: "excellent",
    marketSize: "dominant",
    notes: "Updated BattleTech hex size. Perfect center of the sweet spot.",
  },
  {
    name: "33mm Standard",
    company: "International Standard",
    hexSizeMm: 33,
    clearancePerSideMm: +(RETENTION_ZONE_MM - 33) / 2, // 1.5mm
    rating: "excellent",
    marketSize: "major",
    notes: "The most common flat-to-flat hex size across multiple systems.",
  },
  {
    name: "Green Stuff World",
    company: "Green Stuff World",
    hexSizeMm: 32,
    clearancePerSideMm: +(RETENTION_ZONE_MM - 32) / 2, // 2.0mm
    rating: "excellent",
    marketSize: "growing",
    notes: "Popular terrain tiles for tabletop RPGs. 32mm format.",
  },
  {
    name: "1\" Standard",
    company: "Various",
    hexSizeMm: 25.4,
    clearancePerSideMm: +(RETENTION_ZONE_MM - 25.4) / 2, // 5.3mm
    rating: "good",
    marketSize: "major",
    notes: "Common US hex size. Functional but loose — supplemental retention possible.",
  },
];

// ─── Innovation Data ───────────────────────────────────────────────────────

export interface InnovationRecord {
  number: number;
  title: string;
  category: string;
  sessionId: string;
  patentRelevant: boolean;
  description: string;
  keyDimensions: Record<string, string>;
}

export const INNOVATION_1552: InnovationRecord = {
  number: 1552,
  title: "Universal Hex Terrain Retention via Lithographic Compliant Pincers",
  category: "hexel-cad",
  sessionId: "8B",
  patentRelevant: true,
  description:
    "SlottedTop pincers (compliant mechanism in 6mm gap between 24mm center hex and half-hex protrusions) grip any flat hex terrain tile in the 32-35mm range. Compatible with Open WarHex (34.29mm, 0.855mm clearance), BattleTech (32-33mm, 1.5-2mm clearance), and 33mm standard. Single lithographic part — 3D printable and injection-mold ready. Trap mechanism preserved: unlocked pincers release on Cradle flip, locked pincer (torus) acts as hinge. Terrain appears normal from above; active mechanism hidden below.",
  keyDimensions: {
    "Center Hex": "24mm flat-to-flat",
    "Gap Width": "6mm (per side)",
    "Retention Zone": "36mm (maximum tile diameter)",
    "Compatible Range": "32-35mm",
    "Total Piece": "60mm flat-to-flat",
    "Sweet Spot": "0.5-2.0mm clearance per side",
  },
};

// ─── Hexel Piece Grammar Stack ─────────────────────────────────────────────

export interface HexelPiece {
  name: string;
  position: number;      // Stack position (1 = bottom, 14 = top)
  role: string;
  innovationLink?: number; // Related innovation number
}

/**
 * The Definitive Hexel Stack — 14-piece grammar from bottom to top.
 * SlottedTop sits at position 14 (the crown) — the piece players interact
 * with most and the one that holds the terrain skin.
 */
export const HEXEL_STACK: HexelPiece[] = [
  { name: "ChannelLock", position: 1, role: "Base anchor with hydraulic channels" },
  { name: "HollowLog", position: 2, role: "Water reservoir and routing" },
  { name: "Clamshell", position: 3, role: "Protective enclosure" },
  { name: "GoldenLotus", position: 4, role: "Valve mechanism" },
  { name: "Rotor", position: 5, role: "Rotation driver" },
  { name: "Ouralis", position: 6, role: "Planetary gear carrier" },
  { name: "PGear-1", position: 7, role: "Planetary gear" },
  { name: "PGear-2", position: 8, role: "Planetary gear" },
  { name: "PGear-3", position: 9, role: "Planetary gear" },
  { name: "SawtoothCoral + TimingBelt", position: 10, role: "Ratchet mechanism" },
  { name: "MainGear", position: 11, role: "Primary drive gear" },
  { name: "Cradle + Football", position: 12, role: "Flip mechanism + wave generator area" },
  { name: "Capstone", position: 13, role: "Structural cap" },
  {
    name: "SlottedTop",
    position: 14,
    role: "Crown piece. Universal hex terrain adapter with compliant pincers. Innovation #1552.",
    innovationLink: 1552,
  },
];

// ─── Compliant Mechanism Details ───────────────────────────────────────────

export interface CompliantMechanism {
  name: string;
  description: string;
  partCount: number;
  manufacturing: string[];
}

export const GORGON_MECHANISM: CompliantMechanism = {
  name: "Gorgon Body",
  description:
    "Single lithographic compliant mechanism integrating pincers (terrain retention), " +
    "flails (character interaction), actuators (trap triggers), and torus locking ring " +
    "(flip hinge). Named 'Gorgon' because the pincers radiate outward like Medusa's snakes. " +
    "FlyingButtress v52 final form.",
  partCount: 1, // That's the whole point — ONE part, multiple functions
  manufacturing: [
    "FDM 3D printing (consumer grade)",
    "SLA/resin 3D printing (high detail)",
    "Injection molding (mass production)",
    "CNC milling (prototype runs)",
  ],
};

// ─── Trap Mechanism Integration ────────────────────────────────────────────

export interface TrapMechanism {
  mode: string;
  description: string;
}

export const TRAP_MODES: TrapMechanism[] = [
  {
    mode: "Normal Terrain",
    description:
      "Terrain tile sits flat on SlottedTop. From above, looks like standard hex terrain. " +
      "No visible mechanism. Player walks across unaware.",
  },
  {
    mode: "Unlocked Pincers (Trapdoor)",
    description:
      "When Cradle flips, unlocked pincers release the terrain tile. " +
      "Tile falls away revealing the trap below. One-shot surprise mechanic.",
  },
  {
    mode: "Locked Pincer (Hinge)",
    description:
      "One pincer locked with torus ring acts as hinge point. " +
      "Terrain tile swings open like a trapdoor on one edge. " +
      "Repeatable. Tile stays attached but reveals contents below.",
  },
];

// ─── Feature Highlights (for UI cards) ─────────────────────────────────────

export interface FeatureHighlight {
  title: string;
  stat: string;
  description: string;
  icon: string; // Lucide icon name reference
}

export const SLOTTED_TOP_HIGHLIGHTS: FeatureHighlight[] = [
  {
    title: "Universal Compatibility",
    stat: "32-35mm",
    description: "Grips any flat hex tile from BattleTech, WarHex, Green Stuff World, and the 33mm standard.",
    icon: "Hexagon",
  },
  {
    title: "Single Lithographic Part",
    stat: "1 piece",
    description: "The Gorgon body integrates pincers, flails, actuators, and torus as one compliant mechanism. No assembly.",
    icon: "Cog",
  },
  {
    title: "Hidden Trap Mechanics",
    stat: "3 modes",
    description: "Normal terrain, trapdoor release, and hinged flip. All invisible from above until triggered.",
    icon: "Shield",
  },
  {
    title: "Manufacturing Ready",
    stat: "4 methods",
    description: "3D printable (FDM + SLA), injection-moldable, and CNC-machinable. From garage to factory floor.",
    icon: "Wrench",
  },
  {
    title: "Patent Protected",
    stat: "#1552",
    description: "Documented innovation with formal patent claims. Universal hex terrain adapter with compliant retention.",
    icon: "Award",
  },
  {
    title: "The Crown Piece",
    stat: "#14 of 14",
    description: "Sits atop the 14-piece Hexel stack. The piece players interact with most. The face of every Hexel.",
    icon: "Crown",
  },
];

// ─── Ecosystem Bridge Narrative ────────────────────────────────────────────

/**
 * The strategic narrative: HexIsle doesn't compete with existing hex ecosystems.
 * It ABSORBS them. Any hex terrain tile from any system becomes a HexIsle terrain skin.
 * This is the "Glue and enabling power table" — the Founder's words.
 */
export const ECOSYSTEM_NARRATIVE = {
  tagline: "The Universal Hex Platform",
  subtitle: "Your hex terrain. Our active mechanics. One snap.",
  thesis:
    "HexIsle doesn't replace your hex tiles — it activates them. " +
    "Snap any 32-35mm flat hex tile onto a Hexel's SlottedTop and it becomes " +
    "active terrain with hidden trap mechanics, water power, and physics-driven gameplay. " +
    "BattleTech tiles. WarHex tiles. Green Stuff World tiles. They all fit. " +
    "They all become HexIsle terrain.",
  competitorInvite:
    "We don't crush competitors. We invite them in. If you make hex terrain, " +
    "your tiles physically fit on our active mechanical platform — no modification needed. " +
    "Your customers get more value. Our customers get more terrain options. Everyone wins.",
  ipSharing:
    "We share our IP with partners who want to build for the Hexel ecosystem. " +
    "Design files, dimensional specs, integration rules — all available. " +
    "Build for HexIsle, sell through HexIsle, keep 83.3% of every sale.",
  compatibleCount: COMPATIBLE_SYSTEMS.filter(s => s.rating !== "incompatible").length,
  retentionRange: "32-35mm",
  clearanceRange: "0.5-2.0mm per side",
};

// ─── Dimensional Analysis (Full Engineering Detail) ────────────────────────

export interface DimensionalEntry {
  label: string;
  tileSizeMm: number;
  overhangPerSideMm: number;
  clearancePerSideMm: number;
  verdict: string;
}

/**
 * The 24mm Center Hex — why it's perfect:
 * The center hex is what the terrain tile SITS ON. It needs to be significantly
 * smaller than the smallest compatible tile so the tile always has full coverage
 * with overhang into the pincer zone.
 *
 * 24mm gives 4-5mm of overhang across the entire target range. That's the
 * mechanical sweet spot — enough edge for the pincers to grip, enough center
 * for the tile to sit flat.
 */
export const CENTER_HEX_ANALYSIS: DimensionalEntry[] = [
  { label: "Green Stuff World",  tileSizeMm: 32,    overhangPerSideMm: 4.0,   clearancePerSideMm: 2.0,   verdict: "Full coverage" },
  { label: "BattleTech (old)",   tileSizeMm: 32,    overhangPerSideMm: 4.0,   clearancePerSideMm: 2.0,   verdict: "Full coverage" },
  { label: "BattleTech (new)",   tileSizeMm: 33,    overhangPerSideMm: 4.5,   clearancePerSideMm: 1.5,   verdict: "Full coverage" },
  { label: "33mm standard",      tileSizeMm: 33,    overhangPerSideMm: 4.5,   clearancePerSideMm: 1.5,   verdict: "Full coverage" },
  { label: "Open WarHex",        tileSizeMm: 34.29, overhangPerSideMm: 5.145, clearancePerSideMm: 0.855, verdict: "Near-perfect snap" },
];

/**
 * The 6mm Gap — Goldilocks Zone:
 * Retention zone = 24 + (2 x 6) = 36mm max tile diameter.
 * Compliant pincers spring outward at rest, flex inward when tile is pressed down.
 * The 0.855mm clearance for WarHex is actually ideal: tight enough for secure
 * retention, loose enough for tool-free snap-in/snap-out.
 */
export const GAP_ANALYSIS = {
  retentionZoneFormula: "24mm center + (2 x 6mm gap) = 36mm max tile diameter",
  clearanceRange: "0.5mm to 2.0mm per side",
  pincerBehavior: "Spring outward at rest, flex inward when tile is pressed down",
  warHexIdeal: "0.855mm for WarHex — tight enough for secure retention, loose enough for tool-free snap-in/snap-out",
};

/**
 * What You'd Lose by Widening to 7mm:
 * Each point explains why the 6mm gap is right and 7mm would be worse.
 */
export const WIDENING_TRADEOFFS: string[] = [
  "WarHex clearance goes to 1.855mm — still works but looser, less satisfying snap",
  "32mm tiles get 3mm clearance — pincers need to flex 3mm inward, harder to maintain grip force",
  "Total piece becomes 62mm — breaks the clean 60mm footprint already built around",
  "You gain Terragon/Heroscape (38.1mm) — but those are niche markets vs. BattleTech (the biggest hex wargaming franchise on earth)",
  "Every existing Fusion 360 model needs rebasing — the dimensional cascade touches Football, Cradle, ChannelLock, everything",
];

/**
 * Strategic Call:
 * The 32-35mm range covers 90%+ of the hex terrain market.
 * The remaining 10% gets the Wide Adapter variant.
 */
export const STRATEGIC_CALL = {
  marketCoverage: "90%+",
  coveredSystems: ["BattleTech (all variants)", "Open WarHex", "Green Stuff World", "33mm standard"],
  wideAdapterVariant: {
    centerHex: "24mm (same)",
    gapWidth: "7.5mm",
    retentionZone: "39mm",
    purpose: "Product line extension for Terragon (38.1mm) and Heroscape (38.1mm playable area)",
    note: "Product line extension, not a base model change",
  },
  bottomLine: "24mm center + 6mm gap — don't touch it. It's right.",
};

// ─── Manufacturing Path ───────────────────────────────────────────────────

export interface ManufacturingStage {
  phase: number;
  name: string;
  method: string;
  unitRange: string;
  costPerUnit: string;
  timeline: string;
  description: string;
}

export const MANUFACTURING_PATH: ManufacturingStage[] = [
  {
    phase: 1,
    name: "MVP Prototype",
    method: "Formlabs Form Now (SLA on-demand)",
    unitRange: "10-50 units",
    costPerUnit: "$100",
    timeline: "2-4 weeks",
    description:
      "High-quality SLA resin prints via Formlabs Form Now on-demand service. " +
      "Upload designs, select materials, receive finished parts. No printer ownership needed. " +
      "Perfect for validation, photography, and first backers.",
  },
  {
    phase: 2,
    name: "Small Batch",
    method: "FDM short run (community printers + Nodes)",
    unitRange: "100+ units preordered",
    costPerUnit: "$85",
    timeline: "4-6 weeks",
    description:
      "Community Node operators print at registered locations. Quality verified via test prints. " +
      "Bounties paid to prototypers and testers for quality assurance reports.",
  },
  {
    phase: 3,
    name: "Medium Production",
    method: "SLS Nylon (placed SLS machines at Nodes)",
    unitRange: "500-1,000 units",
    costPerUnit: "$70",
    timeline: "6-8 weeks",
    description:
      "First placed SLS machines (Formlabs Fuse, Sinterit) at established Nodes. " +
      "Funded by the 1/3, 1/3, 1/3 model: 1/3 community pre-orders, 1/3 platform treasury, " +
      "1/3 Node operator contribution. Locations chosen from existing Node infrastructure.",
  },
  {
    phase: 4,
    name: "Scale Production",
    method: "Desktop injection molding",
    unitRange: "2,000-10,000 units",
    costPerUnit: "$60",
    timeline: "Ongoing",
    description:
      "Desktop injection molding at Node locations. Tooling funded through production revenue. " +
      "Each Node serves its geographic region — decentralized, local industry.",
  },
  {
    phase: 5,
    name: "Mass Production",
    method: "Factory tooling + industrial injection molding",
    unitRange: "10,000+ units",
    costPerUnit: "$40-50",
    timeline: "Ongoing",
    description:
      "Full factory tooling at dedicated facilities. Cost + 20% floor pricing. " +
      "Creator/worker keeps 83.3%. Local industry, decentralized manufacturing. " +
      "Every product made through the Liana Banyan cooperative manufacturing network.",
  },
];

/**
 * The manufacturing philosophy: ALL product making goes to LOCAL INDUSTRY
 * through decentralized Factory Nodes. No single factory. No single point of failure.
 */
export const MANUFACTURING_PHILOSOPHY = {
  core: "All product manufacturing routes through the Liana Banyan decentralized Factory network. " +
        "No single factory. No single supplier. Local industry, local jobs, local resilience.",
  slsMachineModel: "1/3, 1/3, 1/3 — community pre-orders, platform treasury, Node operator contribution",
  nodePlacement: "SLS machines placed at locations that are already established Nodes — " +
                 "the beginning infrastructure started by the 16 initiatives and the Marketing Deck Cards (Cue Card) system",
  pricing: "Cost + 20% floor. Sellers set prices. Market discovery. Creator/worker keeps 83.3%.",
  incentive: "Nodes earn priority bounty assignments, higher Joule allocations, and equipment subsidies (first 100 pioneers)",
};

// ─── Design Contests & Licensing ──────────────────────────────────────────

export interface DesignContest {
  name: string;
  category: string;
  description: string;
  prize: string;
  integrationRules: string[];
}

/**
 * Official Tereno HexIsle Models — design contests that produce licensed products.
 * The Wide Adapter SlottedTop variant is the first example of how the community
 * creates official product line extensions.
 */
export const DESIGN_CONTESTS: DesignContest[] = [
  {
    name: "Wide Adapter SlottedTop",
    category: "Product Line Extension",
    description:
      "Design a SlottedTop variant with 24mm center hex, 7.5mm gaps, and 39mm retention zone " +
      "for Terragon (38.1mm) and Heroscape (38.1mm) compatibility. Same snap-in mechanism, wider gap. " +
      "Winner becomes an Official Tereno HexIsle Model with licensing included.",
    prize: "Official Tereno licensing + 83.3% of all sales through the platform",
    integrationRules: [
      "Must maintain 24mm center hex (non-negotiable — universal standard)",
      "Must use compliant pincer retention (no adhesives, magnets, or clips)",
      "Must be single lithographic part (3D printable without assembly)",
      "Must preserve trap mechanism compatibility (Cradle flip still works)",
      "Must pass snap-in/snap-out test: tool-free, repeatable, no damage to tiles",
      "STL file submitted for quality verification at registered Node",
    ],
  },
  {
    name: "Biome Terrain Skin Pack",
    category: "Terrain Design",
    description:
      "Design a set of 7 terrain skins (hex tiles) in a thematic biome: desert, arctic, volcanic, swamp, " +
      "forest, ocean reef, or alien. Must be flat hex tiles in the 32-35mm range that snap onto SlottedTop.",
    prize: "Official Tereno licensing + 83.3% of all sales + featured in HexIsle campaign",
    integrationRules: [
      "Hex tiles must be 32-35mm flat-to-flat (within SlottedTop retention zone)",
      "Flat bottom surface (sits flush on 24mm center hex)",
      "No protrusions below 0.5mm from bottom face (pincers need clearance)",
      "STL files provided for community prototyping",
    ],
  },
  {
    name: "Character Figure Design",
    category: "Game Piece",
    description:
      "Design a character figure that interfaces with the Hexel IIFIS (If It Fits It Sits) boot system. " +
      "Figure must have boot slots compatible with terrain-specific biome boots.",
    prize: "Official Tereno licensing + 83.3% of all sales + IP credit in patent documentation",
    integrationRules: [
      "Boot slot geometry matches IIFIS specification",
      "Figure fits within single hex footprint (max 24mm base diameter)",
      "Backpack ratchet compatible (push-down Hit Point counter mechanism)",
      "Coin slot pattern defined (Square/Circle/Triangle currency slots)",
    ],
  },
];

// ─── Bounty Programs ──────────────────────────────────────────────────────

export interface BountyProgram {
  title: string;
  reward: string;
  currency: string;
  description: string;
  requirements: string[];
}

export const BOUNTY_PROGRAMS: BountyProgram[] = [
  {
    title: "Game Piece Tester",
    reward: "5-25",
    currency: "Credits",
    description:
      "Download free STL files from the HexIsle repository. Print them. Play with them. " +
      "Report back: fit, feel, durability, fun factor. Detailed reports earn more.",
    requirements: [
      "Access to any FDM or SLA 3D printer",
      "Print the test file at specified settings",
      "Complete the structured test report form",
      "Submit photos of printed parts (minimum 3 angles)",
      "Optional: video of snap-in/snap-out test (bonus Credits)",
    ],
  },
  {
    title: "3D Print Prototyper",
    reward: "10-50",
    currency: "Credits",
    description:
      "Prototype new Hexel components as they're released weekly. Each week, a new piece " +
      "of the 14-piece Hexel stack drops. Print it, test it, improve it. " +
      "The best prototypers become registered Node operators.",
    requirements: [
      "Calibrated FDM or SLA printer (tolerance test passed)",
      "Print weekly release within 48 hours of drop",
      "Submit dimensional verification (caliper measurements)",
      "Report material recommendations for production",
      "Top prototypers invited to Node operator registration",
    ],
  },
  {
    title: "Compatibility Validator",
    reward: "15-40",
    currency: "Credits",
    description:
      "Own hex terrain from other systems? Test how it fits on the SlottedTop. " +
      "BattleTech, WarHex, Green Stuff World — we need real-world fit data. " +
      "Your measurements validate the compatibility matrix.",
    requirements: [
      "Own at least one hex terrain system (BattleTech, WarHex, Green Stuff World, etc.)",
      "Print or obtain a SlottedTop test piece",
      "Photograph tile seated on SlottedTop (top and side views)",
      "Measure actual clearance with calipers",
      "Rate snap quality: 1-5 scale (loose/snug/tight/press-fit/stuck)",
    ],
  },
];

// ─── Weekly Series Release Schedule ───────────────────────────────────────

export interface WeeklyRelease {
  week: number;
  partName: string;
  stackPosition: number;
  description: string;
  status: "released" | "upcoming" | "planned";
  detailPageRoute: string;
}

/**
 * Weekly Hexel Component Release Series:
 * Start with SlottedTop (the piece people can use NOW with their existing tiles),
 * then work down the stack adding each component until the full water table is ready.
 * The 7-hexel modular prototype IS the actual product because it is modular.
 */
export const WEEKLY_RELEASES: WeeklyRelease[] = [
  {
    week: 1,
    partName: "SlottedTop",
    stackPosition: 14,
    description: "The crown piece. Universal hex terrain adapter. Use it NOW with your existing tiles.",
    status: "released",
    detailPageRoute: "/hexisle/hexels/slotted-top",
  },
  {
    week: 2,
    partName: "SawtoothCoral + TimingBelt",
    stackPosition: 10,
    description: "The ratchet mechanism. Click-click-click — satisfying mechanical feedback.",
    status: "upcoming",
    detailPageRoute: "/hexisle/hexels/sawtooth-coral",
  },
  {
    week: 3,
    partName: "Capstone",
    stackPosition: 13,
    description: "Structural cap. Locks the SlottedTop assembly to the gear train below.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/capstone",
  },
  {
    week: 4,
    partName: "Cradle + Football",
    stackPosition: 12,
    description: "The flip mechanism. Land or water. Traps work both ways.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/cradle",
  },
  {
    week: 5,
    partName: "MainGear",
    stackPosition: 11,
    description: "Primary drive gear. The power that moves everything above it.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/main-gear",
  },
  {
    week: 6,
    partName: "Planetary Gears (PGear 1-3)",
    stackPosition: 7,
    description: "Three planetary gears. Torque multiplication from water to mechanism.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/pgears",
  },
  {
    week: 7,
    partName: "Ouralis",
    stackPosition: 6,
    description: "Planetary gear carrier. The frame that holds the gear train.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/ouralis",
  },
  {
    week: 8,
    partName: "Rotor",
    stackPosition: 5,
    description: "Rotation driver. Water enters, rotation exits.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/rotor",
  },
  {
    week: 9,
    partName: "GoldenLotus",
    stackPosition: 4,
    description: "Valve mechanism. Controls water flow direction and timing.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/golden-lotus",
  },
  {
    week: 10,
    partName: "Clamshell",
    stackPosition: 3,
    description: "Protective enclosure. Keeps the mechanism sealed and the water in.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/clamshell",
  },
  {
    week: 11,
    partName: "HollowLog",
    stackPosition: 2,
    description: "Water reservoir and routing. The hydraulic highway.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/hollow-log",
  },
  {
    week: 12,
    partName: "ChannelLock",
    stackPosition: 1,
    description: "Base anchor with hydraulic channels. The foundation of everything.",
    status: "planned",
    detailPageRoute: "/hexisle/hexels/channel-lock",
  },
];

/**
 * The 7-Hexel Modular Product:
 * Once all 14 pieces are released and validated, the product IS 7 connected Hexels.
 * Modular by design — buy 7, connect them, add water, play.
 * This is the actual product because each Hexel is a self-contained modular unit.
 */
export const MODULAR_PRODUCT = {
  name: "The Tereno Hydraulic Table",
  hexelCount: 7,
  description:
    "Seven Hexels snap together into a modular hydraulic game table. Each Hexel is a self-contained " +
    "14-piece mechanism: water channels, gear trains, trap mechanics, and universal terrain adapter. " +
    "Connect them. Add water. Play. This IS the product — modular by design, expandable forever.",
  whyModular: [
    "Start with 1 Hexel — it works standalone with any hex terrain tile",
    "Add more Hexels to expand your game board",
    "7 Hexels form the standard table configuration",
    "Water flows between connected Hexels through ChannelLock joints",
    "Each Hexel can have different terrain — mix and match freely",
    "Prototype each piece individually, validate, then assemble the full product",
  ],
  startNow:
    "You don't need all 14 pieces to start. The SlottedTop alone turns any hex tile into " +
    "a HexIsle terrain piece. Each weekly release adds another layer of functionality. " +
    "By week 12, you have a fully operational water-powered hex game tile.",
};

// ─── Collaboration & Open Invitation ──────────────────────────────────────

export const COLLABORATION_INVITE = {
  headline: "Build With Us",
  subheadline: "Your hex terrain. Your designs. Your manufacturing. Our active mechanics. Our platform. Our IP.",
  points: [
    {
      title: "Competitors Welcome",
      description:
        "We don't crush competitors — we invite them in. If you make hex terrain tiles, " +
        "your products physically fit on our active mechanical platform. No modification needed. " +
        "Your customers get more value. Our customers get more terrain options. Everyone wins.",
    },
    {
      title: "IP Shared Freely",
      description:
        "We share our IP with partners who want to build for the Hexel ecosystem. " +
        "Dimensional specs. Integration rules. Design files. STL templates. " +
        "Build for HexIsle, sell through HexIsle, keep 83.3% of every sale.",
    },
    {
      title: "Decentralized Manufacturing",
      description:
        "No single factory. No single supplier. Register as a manufacturing Node, " +
        "print or mold official Tereno products, serve your local region. " +
        "The Factory is everywhere. The industry is local.",
    },
    {
      title: "Design Contests = Real Products",
      description:
        "Win a design contest and your creation becomes an Official Tereno HexIsle Model. " +
        "Licensing included. You keep 83.3%. From community design to production shelf, " +
        "manufactured at the nearest Node.",
    },
  ],
  ctaLine: "If you make hex terrain, if you own a 3D printer, if you design game pieces — " +
           "this platform is built for you. Start with the SlottedTop. Start now.",
};

// ─── Community & Release Plan ────────────────────────────────────────────

/**
 * The Founder's Story — decades of designs, now releasing for everyone.
 * This is promotional content for universal integration.
 */
export const FOUNDER_STORY = {
  headline: "Decades of Designs. Now Releasing for Everyone.",
  narrative:
    "These designs didn't happen overnight. They've been refined over decades — " +
    "iterated, tested, rethought, and perfected through countless prototypes. " +
    "Now we're cleaning them up and releasing them as FREE STL files for personal use. " +
    "Every hex gamer, every terrain maker, every 3D printer enthusiast gets access.",
  freeSTLs: {
    title: "Free HexIsle STL Files",
    description:
      "Download and print Hexel parts for personal use. No cost, no catch. " +
      "These are production-quality design files refined over decades. " +
      "New files release at least every two weeks — we're ahead of schedule.",
    license: "Personal use free. Commercial use requires Node registration and official licensing.",
    schedule: "New STL files at least every two weeks. Weekly design updates and notes.",
  },
};

/**
 * Ancillary Design Submissions — opens 6 months after Water Table funding.
 * This gives everyone a countdown to work on ancillary designs and lets the
 * company mature enough to have staff to review and certify submissions.
 */
export const ANCILLARY_DESIGN_PROGRAM = {
  title: "Ancillary Design Submissions",
  openDate: "6 Months After Water Table Funding",
  description:
    "Once we fund the Water Table (the full 7-Hexel Tereno Hydraulic Table), " +
    "we open the doors for community-designed ancillary parts. This gives you " +
    "a countdown to start designing — and gives us time to bring on staff who " +
    "can review, test, and certify community submissions properly.",
  timeline: {
    month1_2: {
      label: "Months 1-2: Foundation",
      tasks: [
        "Staff onboard — design reviewers, community managers, QA testers",
        "Design contest infrastructure goes live on the platform",
        "First placed SLS machine at an established Node",
        "Integration rules documentation published in full",
      ],
    },
    month3_4: {
      label: "Months 3-4: Portal Opens",
      tasks: [
        "Ancillary design submission portal opens for community uploads",
        "First community designs enter review pipeline",
        "Compatibility testing lab established at primary Node",
        "Design feedback loop — submit, review, iterate, resubmit",
      ],
    },
    month5_6: {
      label: "Months 5-6: First Certifications",
      tasks: [
        "First Official Tereno ancillary models certified and listed",
        "Community manufacturing begins — certified designs at registered Nodes",
        "Design contest winners announced — licensing activated",
        "Creator keeps 83.3% on every sale through the platform",
      ],
    },
  },
  whySixMonths:
    "Six months is ambitious but realistic. We need staff to do this right — " +
    "review designs, test compatibility, certify quality. This isn't a rubber stamp. " +
    "Every ancillary part has to work in concert with the Hexel stack. " +
    "That means the integration rules, the dimensional specs, the compliant pincers — " +
    "everything has to be validated. That takes people, and people take time to hire and train.",
  countdown:
    "Start designing now. The clock starts when we fund the Water Table. " +
    "You have six months from that moment to submit your first design. " +
    "Use the weekly STL releases to understand how the pieces fit together. " +
    "Design for the system. The system is open.",
};

/**
 * Release Cadence — weekly updates, bi-weekly file drops.
 * The Founder is ahead of schedule, so at least every two weeks.
 */
export const RELEASE_CADENCE = {
  title: "Release Schedule",
  updates: "Weekly — design notes, progress photos, dimensional data, community Q&A",
  fileDrops: "At least every two weeks — new STL files for the next Hexel component",
  ahead:
    "We're ahead of schedule. The designs exist — they've been in development for decades. " +
    "What we're doing now is cleaning them up, dimensioning them precisely, and releasing " +
    "them in a logical build order so everyone can follow along and start printing.",
  promise:
    "You will always have something new to print, something new to test, " +
    "something new to build with. This is an active project, not a one-time drop.",
};

/**
 * Discord Community — Q&A after each funded campaign.
 */
export const COMMUNITY_ENGAGEMENT = {
  title: "Active Participation Group Project",
  description:
    "This is not a store where you buy things and leave. This is a workshop. " +
    "An active participation group project where your feedback shapes what we build next. " +
    "We need people — designers, printers, testers, gamers, engineers.",
  discord: {
    title: "Discord Q&A Sessions",
    description:
      "After each funded campaign, the Founder hosts a live Q&A on the HexIsle Discord. " +
      "Every question raised up to that point gets addressed. No ducking, no corporate non-answers. " +
      "Real answers about real engineering decisions.",
    schedule: "Q&A after each funded campaign milestone",
    format: "All questions collected from Discord up to that point. Every one addressed.",
  },
  whatWeNeed: [
    {
      role: "Designers",
      description: "Create ancillary parts, terrain skins, character figures. Your designs become official products.",
    },
    {
      role: "3D Printers",
      description: "Print the weekly releases, validate dimensions, test fit. Best printers become Node operators.",
    },
    {
      role: "Game Piece Testers",
      description: "Own hex terrain? Test it on the SlottedTop. Your measurements validate our compatibility matrix.",
    },
    {
      role: "Engineers",
      description: "Mechanical, hydraulic, material science. Help us optimize the manufacturing path.",
    },
    {
      role: "Gamers",
      description: "Play on the platform. Break it. Tell us what works and what doesn't. User testing is engineering.",
    },
  ],
  invitation:
    "If you have ideas, skills, or just enthusiasm — we want you. " +
    "This project succeeds because of the people who show up and build with us. " +
    "Start with a SlottedTop. Print it. Test your hex tiles. Tell us what you find. " +
    "That's how this works. Help each other. Help ourselves.",
};
