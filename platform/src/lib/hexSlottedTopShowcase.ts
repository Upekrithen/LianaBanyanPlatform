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
  compatibleCount: COMPATIBLE_SYSTEMS.filter(s => s.rating !== "incompatible").length,
  retentionRange: "32-35mm",
  clearanceRange: "0.5-2.0mm per side",
};
