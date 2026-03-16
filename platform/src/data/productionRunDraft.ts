/**
 * PRODUCTION RUN DRAFT — Fantasy Football for Maker Products
 * ===========================================================
 * Members browse maker proposals and "draft" production runs to back.
 * Each run needs 500 pre-orders to trigger production.
 * First 100 backers get multiplier bonuses (BandWagon First-100 Rule).
 *
 * Source: Instagram Factor-y Collection (47 creators)
 * Goal: Get each maker their first 500-unit production run
 */

export interface MakerProfile {
  id: string;
  handle: string;
  name: string;
  specialty: string;
  tier: 1 | 2 | 3;
  followers: string;
  verified: boolean;
  sellsOn?: string;
  hexIsleRelevant?: boolean;
  slipCastingPioneer?: boolean;
}

export interface ProductionRun {
  id: string;
  maker: MakerProfile;
  productName: string;
  description: string;
  category: string;
  priceEstimate: string; // Cost+20% pricing
  targetUnits: number;
  currentPreorders: number;
  backers: number;
  status: "proposal" | "funding" | "funded" | "production" | "shipped" | "complete";
  hexIsleCompatible?: string; // Tier if applicable
  imageEmoji: string; // Placeholder until real images
}

// Top maker profiles from the Instagram Factor-y collection
export const FACTOR_Y_MAKERS: MakerProfile[] = [
  // ─── TIER 1: HIGH-VALUE ───
  { id: "m1", handle: "@forgecoreco", name: "ForgeCore Co", specialty: "Plant accessories, coasters, sports toys", tier: 1, followers: "514K", verified: true, sellsOn: "Own site" },
  { id: "m2", handle: "@loftedgoods", name: "Lofted Goods", specialty: "Wall-mount planters with drip jars", tier: 1, followers: "230K", verified: true, sellsOn: "STL files" },
  { id: "m3", handle: "@gazzaladradesign", name: "Gazzaladra Design", specialty: "3D printed notebooks, home products", tier: 1, followers: "132K", verified: true, sellsOn: "Thangs3D" },
  { id: "m4", handle: "@craftykid3d", name: "CraftyKid3D", specialty: "Dragon book nooks", tier: 1, followers: "123K", verified: true, sellsOn: "Patreon" },
  { id: "m5", handle: "@hammerlyceramics", name: "Hammerly Ceramics", specialty: "Slip cast ceramics, lamps, mugs", tier: 1, followers: "55.4K", verified: true, sellsOn: "Own shop", slipCastingPioneer: true },
  { id: "m6", handle: "@armas.4am", name: "Armas 4AM", specialty: "Robotics, cycloidal gearboxes", tier: 1, followers: "46.3K", verified: true },
  { id: "m7", handle: "@curv.lab", name: "Curv Lab", specialty: "3D printable RC car chassis", tier: 1, followers: "37.6K", verified: true, sellsOn: "curvlab.com" },
  { id: "m8", handle: "@playconveyor", name: "Play Conveyor", specialty: "Modular storage containers", tier: 1, followers: "36.3K", verified: true, sellsOn: "Thangs3D" },
  { id: "m9", handle: "@concept_bytes", name: "Concept Bytes", specialty: "Smart chess board, engineering", tier: 1, followers: "33.9K", verified: true },
  { id: "m10", handle: "@krysplants", name: "Krys Plants", specialty: "Novelty plant accessories", tier: 1, followers: "32.6K", verified: true, sellsOn: "Own store" },
  { id: "m11", handle: "@pyahik", name: "Pyahik", specialty: "Resin keychains, small business", tier: 1, followers: "31.8K", verified: true, sellsOn: "Own shop" },
  { id: "m12", handle: "@dinarakasko", name: "Dinara Kasko", specialty: "Silicone mold cake design", tier: 1, followers: "24.7K", verified: true, sellsOn: "Own mold shop", slipCastingPioneer: true },
  { id: "m13", handle: "@niotoys1", name: "NioToys", specialty: "Mechanical toys", tier: 1, followers: "63.8K", verified: false },
  { id: "m14", handle: "@printsculptors", name: "Print Sculptors", specialty: "Fidget toys, clickers", tier: 2, followers: "40.6K", verified: true },

  // ─── TIER 2: MID-VALUE ───
  { id: "m15", handle: "@yird_ceramics", name: "Yird Ceramics", specialty: "Slip cast cups with plaster molds", tier: 2, followers: "25.6K", verified: false, slipCastingPioneer: true },
  { id: "m16", handle: "@turn.studio", name: "Turn Studio", specialty: "Full slip casting pipeline", tier: 2, followers: "23.1K", verified: false, slipCastingPioneer: true },
  { id: "m17", handle: "@bloblab3d", name: "BlobLab 3D", specialty: "Character design (Blob Beetles)", tier: 2, followers: "22.1K", verified: false },
  { id: "m18", handle: "@elle.stvdio", name: "Elle Studio", specialty: "Beehive designs, flying butterflies", tier: 2, followers: "20.7K", verified: true },
  { id: "m19", handle: "@krakdrag3d", name: "KrakDrag 3D", specialty: "Cyber Cat headphone holder", tier: 2, followers: "63.3K", verified: false },
  { id: "m20", handle: "@elden_designs", name: "Elden Designs", specialty: "3D printed lamp designs", tier: 2, followers: "5.3K", verified: false },

  // ─── TIER 3: EMERGING + HEXISLE ───
  { id: "m21", handle: "@fusefoxdesign", name: "FuseFox Design (Tactocrat)", specialty: "Magnetic spring mechanisms", tier: 3, followers: "~2K", verified: false, hexIsleRelevant: true },
  { id: "m22", handle: "@tabletopstamps", name: "Tabletop Stamps", specialty: "Modular dungeon stamps for D&D", tier: 3, followers: "675", verified: false, hexIsleRelevant: true },
  { id: "m23", handle: "@theupgradefactory", name: "The Upgrade Factory", specialty: "Tabletop terrain (BattleTech/D&D)", tier: 3, followers: "13", verified: true, hexIsleRelevant: true },
  { id: "m24", handle: "@abyssalcactus", name: "Abyssal Cactus", specialty: "Print-in-place hinge design", tier: 3, followers: "2.5K", verified: false, hexIsleRelevant: true },
  { id: "m25", handle: "@emgi3d", name: "EMGI 3D", specialty: "Mechanism design", tier: 3, followers: "~2K", verified: false, hexIsleRelevant: true },
  { id: "m26", handle: "@greg.dean.mann", name: "Greg Dean Mann", specialty: "Lamp design", tier: 3, followers: "~1K", verified: false },
  { id: "m27", handle: "@moritz__walter", name: "Moritz Walter", specialty: "Tool design", tier: 3, followers: "~1K", verified: false },
  { id: "m28", handle: "@cartyski", name: "Cartyski", specialty: "Spring-loaded mechanisms", tier: 3, followers: "N/A", verified: true },
];

// Sample production run proposals (these would come from DB in production)
export const SAMPLE_PRODUCTION_RUNS: ProductionRun[] = [
  {
    id: "pr-001",
    maker: FACTOR_Y_MAKERS[0], // ForgeCore
    productName: "Monstera Leaf Coaster Set (4pc)",
    description: "Botanical coasters with drainage channels. Each coaster shaped like a different Monstera variety. Food-safe, dishwasher-safe.",
    category: "Home & Garden",
    priceEstimate: "$18",
    targetUnits: 500,
    currentPreorders: 347,
    backers: 289,
    status: "funding",
    imageEmoji: "🌿",
  },
  {
    id: "pr-002",
    maker: FACTOR_Y_MAKERS[3], // CraftyKid3D
    productName: "Dragon's Lair Book Nook",
    description: "Insert between books on your shelf — illuminated dragon cave with LED glow. Hand-painted details.",
    category: "Collectibles",
    priceEstimate: "$45",
    targetUnits: 500,
    currentPreorders: 128,
    backers: 112,
    status: "funding",
    imageEmoji: "🐉",
  },
  {
    id: "pr-003",
    maker: FACTOR_Y_MAKERS[4], // Hammerly Ceramics
    productName: "Architecture-Inspired Mug Collection",
    description: "Slip cast porcelain mugs with architectural column details. Each mug features a different classical order.",
    category: "Kitchen",
    priceEstimate: "$28",
    targetUnits: 500,
    currentPreorders: 67,
    backers: 54,
    status: "funding",
    imageEmoji: "☕",
  },
  {
    id: "pr-004",
    maker: FACTOR_Y_MAKERS[12], // NioToys
    productName: "Clockwork Walking Robot",
    description: "Fully mechanical walking toy — no batteries. Wind-up mechanism with exposed gears. Educational + fun.",
    category: "Toys",
    priceEstimate: "$22",
    targetUnits: 500,
    currentPreorders: 203,
    backers: 178,
    status: "funding",
    imageEmoji: "🤖",
  },
  {
    id: "pr-005",
    maker: FACTOR_Y_MAKERS[20], // FuseFox / Tactocrat
    productName: "Magnetic Spring Hex Tile Topper",
    description: "Snap-on hex tile accessories with magnetic spring mechanism. Compatible with HexIsle terrain system.",
    category: "Tabletop Gaming",
    priceEstimate: "$12",
    targetUnits: 500,
    currentPreorders: 42,
    backers: 38,
    status: "proposal",
    hexIsleCompatible: "Tier 4 — HexIsle Compatible",
    imageEmoji: "🧲",
  },
  {
    id: "pr-006",
    maker: FACTOR_Y_MAKERS[7], // Play Conveyor
    productName: "Modular Desk Organizer System",
    description: "Stackable, interlocking storage containers. Hexagonal grid. Infinitely expandable.",
    category: "Home & Office",
    priceEstimate: "$15",
    targetUnits: 500,
    currentPreorders: 89,
    backers: 73,
    status: "funding",
    imageEmoji: "📐",
  },
  {
    id: "pr-007",
    maker: FACTOR_Y_MAKERS[18], // KrakDrag 3D
    productName: "Cyber Cat Headphone Stand",
    description: "Cyberpunk-style cat figure that holds your headphones. LED-compatible eye slots. Weighted base.",
    category: "Tech Accessories",
    priceEstimate: "$32",
    targetUnits: 500,
    currentPreorders: 156,
    backers: 134,
    status: "funding",
    imageEmoji: "🐱",
  },
  {
    id: "pr-008",
    maker: FACTOR_Y_MAKERS[6], // Curv Lab
    productName: "Mini RC Drift Car Kit",
    description: "3D printable RC car chassis with pre-assembled electronics. Print your own body shell. Starter kit included.",
    category: "RC & Hobby",
    priceEstimate: "$55",
    targetUnits: 500,
    currentPreorders: 31,
    backers: 28,
    status: "proposal",
    imageEmoji: "🏎️",
  },
];

export type DraftFilter = "all" | "trending" | "almost-funded" | "hexisle" | "new";

export function filterRuns(runs: ProductionRun[], filter: DraftFilter): ProductionRun[] {
  switch (filter) {
    case "trending":
      return [...runs].sort((a, b) => b.backers - a.backers);
    case "almost-funded":
      return [...runs]
        .filter(r => r.currentPreorders / r.targetUnits >= 0.5)
        .sort((a, b) => (b.currentPreorders / b.targetUnits) - (a.currentPreorders / a.targetUnits));
    case "hexisle":
      return runs.filter(r => r.hexIsleCompatible);
    case "new":
      return runs.filter(r => r.status === "proposal");
    default:
      return runs;
  }
}
