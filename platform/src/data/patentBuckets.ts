// Patent Bucket Pedestal System — February 24, 2026
// Application #63/989,913 (LB-PROV-007)
// 102 innovations, 408 claims across 6 bags
// PLUS: 2 Showcase Pedestals (Nine Laws + HexIsle)

export type ValuationHorizon = {
  conservative: number;
  moderate: number;
  aggressive: number;
};

export type InnovationValuation = {
  oneYear: ValuationHorizon;
  fiveYear: ValuationHorizon;
  tenYear: ValuationHorizon;
};

export type Category =
  | "Economics"
  | "Platform"
  | "UX"
  | "Security"
  | "Manufacturing"
  | "Governance"
  | "Showcase";

export type InnovationRef = {
  id: number;
  code: string;
  name: string;
  shortDescription: string;
  category: Category;
  isCrownJewel?: boolean;
  valuations: InnovationValuation;
  containedInBucket?: string; // For showcase pedestals - which actual bucket contains this
};

export type StakePolicy = {
  maxPayoutPerStake: number;
  autoSplitThresholdMultiple: number;
  childStakeDefaultSize: number;
};

export type OwnershipRules = {
  founderRetention: number;
  maxTransferable: number;
  platformRetentionMin: number;
  perPersonCapCredits: number;
  stakeCapUsd: number;
};

export type VotingStatus = {
  targetAmount: number;
  currentAmount: number;
  backerCount: number;
  percentFunded: number;
};

export type Bucket = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  iconImage?: string; // For custom artwork like Salt Mines
  innovations: InnovationRef[];
  totals: {
    oneYear: ValuationHorizon;
    fiveYear: ValuationHorizon;
    tenYear: ValuationHorizon;
  };
  stats: {
    innovationsCount: number;
    claimsCount: number;
  };
  voting: VotingStatus;
  ownershipRules: OwnershipRules;
  stakePolicy: StakePolicy;
  isShowcase?: boolean; // True for showcase pedestals that link to other buckets
  linkedBuckets?: string[]; // For showcase pedestals - which buckets contain these innovations
};

// Standard ownership rules (from LEVIATHAN #1228-1231)
const standardOwnershipRules: OwnershipRules = {
  founderRetention: 0.20,
  maxTransferable: 0.40,
  platformRetentionMin: 0.40,
  perPersonCapCredits: 5_000,
  stakeCapUsd: 10_000_000,
};

// Standard stake policy (from LEVIATHAN #1230-1231)
const standardStakePolicy: StakePolicy = {
  maxPayoutPerStake: 10_000_000,
  autoSplitThresholdMultiple: 10,
  childStakeDefaultSize: 2_500,
};

export const patentBuckets: Bucket[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET A: IP ECONOMICS (#1228-#1233, #1239)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "A",
    slug: "ip-economics",
    name: "IP Economics",
    tagline: "Core economic primitives for cooperative IP revenue, control, and currency valuation.",
    icon: "🏛️",
    innovations: [
      {
        id: 1228,
        code: "IP-ECON-LOAD-BALANCING",
        name: "IP Load Balancing Core Architecture",
        shortDescription:
          "60/20/20 IP revenue split with dual participation via a global sponsor pool and targeted patent buckets.",
        category: "Economics",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 100_000, moderate: 190_000, aggressive: 300_000 },
          fiveYear: { conservative: 800_000, moderate: 1_400_000, aggressive: 3_000_000 },
          tenYear: { conservative: 4_000_000, moderate: 6_700_000, aggressive: 12_000_000 },
        },
      },
      {
        id: 1229,
        code: "IP-GOV-BUCKET-VOTING",
        name: "Patent Bucket Voting System",
        shortDescription:
          "Credits-based voting on patent buckets that funds prosecution and grants proportional stakes in each bucket.",
        category: "Governance",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 300_000, aggressive: 600_000 },
          tenYear: { conservative: 600_000, moderate: 1_250_000, aggressive: 2_500_000 },
        },
      },
      {
        id: 1230,
        code: "IP-ECON-STAKE-CAP",
        name: "Per-Stake Cap and Recycling",
        shortDescription:
          "$10M maximum payout per stake with automatic retirement and recycling of economic capacity.",
        category: "Economics",
        valuations: {
          oneYear: { conservative: 50_000, moderate: 75_000, aggressive: 120_000 },
          fiveYear: { conservative: 350_000, moderate: 560_000, aggressive: 900_000 },
          tenYear: { conservative: 1_500_000, moderate: 2_250_000, aggressive: 3_600_000 },
        },
      },
      {
        id: 1231,
        code: "IP-ECON-STAKE-SPLIT",
        name: "Stake Splitting for Accessibility",
        shortDescription:
          "Automatic splitting of high-value stakes into $1–5K child stakes while preserving total claim.",
        category: "Economics",
        valuations: {
          oneYear: { conservative: 50_000, moderate: 75_000, aggressive: 120_000 },
          fiveYear: { conservative: 350_000, moderate: 560_000, aggressive: 900_000 },
          tenYear: { conservative: 1_500_000, moderate: 2_250_000, aggressive: 3_600_000 },
        },
      },
      {
        id: 1232,
        code: "IP-ECON-BUCKET-REBALANCE",
        name: "Dynamic Bucket Rebalancing",
        shortDescription:
          "Periodic rebalancing of patent buckets to prevent over-concentration while preserving stake values.",
        category: "Economics",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 60_000, aggressive: 90_000 },
          fiveYear: { conservative: 250_000, moderate: 450_000, aggressive: 750_000 },
          tenYear: { conservative: 1_000_000, moderate: 1_800_000, aggressive: 3_000_000 },
        },
      },
      {
        id: 1233,
        code: "IP-LEGAL-THREE-TIER-CONTROL",
        name: "Three-Tier IP Control Framework",
        shortDescription:
          "49/60/75% creator-share tiers that formalize an inverse relationship between control and revenue.",
        category: "Governance",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 70_000, moderate: 125_000, aggressive: 200_000 },
          fiveYear: { conservative: 400_000, moderate: 750_000, aggressive: 1_500_000 },
          tenYear: { conservative: 1_600_000, moderate: 3_100_000, aggressive: 6_000_000 },
        },
      },
      {
        id: 1239,
        code: "IP-ECON-FOREX-RATCHET",
        name: "Forex Ratchet Valuation",
        shortDescription:
          "Joule valuation engine that captures external Forex rates and ratchets locked rates forward for redemption.",
        category: "Economics",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 100_000, moderate: 190_000, aggressive: 300_000 },
          fiveYear: { conservative: 800_000, moderate: 1_400_000, aggressive: 3_000_000 },
          tenYear: { conservative: 4_000_000, moderate: 6_700_000, aggressive: 12_000_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 440_000, moderate: 765_000, aggressive: 1_010_000 },
      fiveYear: { conservative: 3_100_000, moderate: 5_400_000, aggressive: 9_800_000 },
      tenYear: { conservative: 13_700_000, moderate: 24_000_000, aggressive: 42_700_000 },
    },
    stats: { innovationsCount: 7, claimsCount: 52 },
    voting: { targetAmount: 150_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET B: MANUFACTURING PIPELINE (#1234-#1238)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "B",
    slug: "manufacturing-pipeline",
    name: "Manufacturing Pipeline",
    tagline: "Decentralized manufacturing, pioneer nodes, and design battles.",
    icon: "⚙️",
    innovations: [
      {
        id: 1234,
        code: "MFG-PIPELINE-DECENTRALIZED",
        name: "Decentralized Manufacturing Pipeline",
        shortDescription:
          "Idea → Prototype → Vote → Produce → Ship pipeline with distributed manufacturing nodes and bounty system.",
        category: "Manufacturing",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 55_000, aggressive: 80_000 },
          fiveYear: { conservative: 200_000, moderate: 400_000, aggressive: 800_000 },
          tenYear: { conservative: 900_000, moderate: 1_650_000, aggressive: 3_000_000 },
        },
      },
      {
        id: 1235,
        code: "MFG-PIONEER-NODES",
        name: "Pioneer Node Benefits",
        shortDescription:
          "First 100 manufacturing nodes receive subsidized equipment, priority bounties, higher Joule allocation, and governance weight.",
        category: "Manufacturing",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 45_000, aggressive: 70_000 },
          fiveYear: { conservative: 150_000, moderate: 320_000, aggressive: 600_000 },
          tenYear: { conservative: 700_000, moderate: 1_350_000, aggressive: 2_500_000 },
        },
      },
      {
        id: 1236,
        code: "MFG-BLUEPRINT-SCROLL",
        name: "Blueprint Scroll Visualization",
        shortDescription:
          "Treasure map-style product journey visualization with scroll unfurl animation and interactive markers.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 32_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 160_000, aggressive: 300_000 },
          tenYear: { conservative: 300_000, moderate: 640_000, aggressive: 1_200_000 },
        },
      },
      {
        id: 1237,
        code: "MFG-DESIGN-BATTLE-TRIGGER",
        name: "Design Battle Auto-Contest Trigger",
        shortDescription:
          "Database trigger automatically creates Design Battle when 2+ people sign up for the same bounty.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 240_000, aggressive: 480_000 },
          tenYear: { conservative: 500_000, moderate: 960_000, aggressive: 1_800_000 },
        },
      },
      {
        id: 1238,
        code: "MFG-MIXED-CURRENCY-ANTE",
        name: "Mixed Currency Ante with GAP Conversion",
        shortDescription:
          "Design Battle participants ante with Credits, Marks, or Joules, all converted to credit-equivalent using GAP rate.",
        category: "Economics",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 70_000, aggressive: 100_000 },
          fiveYear: { conservative: 280_000, moderate: 525_000, aggressive: 900_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_100_000, aggressive: 3_600_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 130_000, moderate: 242_000, aggressive: 365_000 },
      fiveYear: { conservative: 825_000, moderate: 1_645_000, aggressive: 3_080_000 },
      tenYear: { conservative: 3_600_000, moderate: 6_700_000, aggressive: 12_100_000 },
    },
    stats: { innovationsCount: 5, claimsCount: 20 },
    voting: { targetAmount: 50_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET C: GOVERNANCE & UX (#1240-#1243)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "C",
    slug: "governance-ux",
    name: "Governance & UX",
    tagline: "Senate Hexagon navigation and treasury controls with ghost-world browsing UX.",
    icon: "🏰",
    innovations: [
      {
        id: 1240,
        code: "GOV-SENATE-HEXAGON",
        name: "Senate Hexagon Navigation Hub",
        shortDescription:
          "MYST-style click-to-teleport governance navigation with six halls and Tower levels.",
        category: "Governance",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 60_000 },
          fiveYear: { conservative: 100_000, moderate: 200_000, aggressive: 400_000 },
          tenYear: { conservative: 400_000, moderate: 800_000, aggressive: 1_500_000 },
        },
      },
      {
        id: 1241,
        code: "UX-TREASURY-CHEST-TIERS",
        name: "Treasury Chest Color Tiers",
        shortDescription:
          "RPG-style currency display with chest colors by value tier (Wood → Diamond).",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 60_000, moderate: 150_000, aggressive: 300_000 },
          tenYear: { conservative: 250_000, moderate: 600_000, aggressive: 1_200_000 },
        },
      },
      {
        id: 1242,
        code: "UX-GHOST-TREASURY-TABS",
        name: "Ordinary World vs Ghost World Treasury Tabs",
        shortDescription:
          "Treasury dialog with dual tabs showing real currency (Ordinary World) and practice currency (Ghost World).",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 60_000, moderate: 150_000, aggressive: 300_000 },
          tenYear: { conservative: 250_000, moderate: 600_000, aggressive: 1_200_000 },
        },
      },
      {
        id: 1243,
        code: "UX-HOFUND-GHOST-BROWSE",
        name: "Hofund Ghost World Browsing",
        shortDescription:
          "Cue Card Studio allows unauthenticated browsing with conversion prompts only when attempting member-specific actions.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 100_000, moderate: 240_000, aggressive: 480_000 },
          tenYear: { conservative: 400_000, moderate: 960_000, aggressive: 1_800_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 70_000, moderate: 140_000, aggressive: 225_000 },
      fiveYear: { conservative: 320_000, moderate: 740_000, aggressive: 1_480_000 },
      tenYear: { conservative: 1_300_000, moderate: 2_960_000, aggressive: 5_700_000 },
    },
    stats: { innovationsCount: 4, claimsCount: 16 },
    voting: { targetAmount: 30_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET D: QR SECURITY (#1244-#1252)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "D",
    slug: "qr-security",
    name: "QR Security",
    tagline: "Slingshot pass-through architecture with Hofund verification and anti-counterfeit systems.",
    icon: "🔐",
    innovations: [
      {
        id: 1244,
        code: "SEC-CUE-CARD-TRACKING",
        name: "Cue Card Share Click Tracking",
        shortDescription:
          "Tracking system that monitors clicks on shared Cue Cards for Frame Lock progress and attribution analytics.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1245,
        code: "SEC-HOFUND-CHECKPOINT",
        name: "Hofund Verification Checkpoint",
        shortDescription:
          "Gravity well verification checkpoint through which all platform QR codes must route before reaching destination.",
        category: "Security",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 80_000, moderate: 175_000, aggressive: 300_000 },
          fiveYear: { conservative: 600_000, moderate: 1_400_000, aggressive: 3_000_000 },
          tenYear: { conservative: 3_000_000, moderate: 7_000_000, aggressive: 15_000_000 },
        },
      },
      {
        id: 1246,
        code: "SEC-ANCHOR-REGISTRATION",
        name: "Anchor Registration System",
        shortDescription:
          "Registration system for external destinations with domain verification via DNS TXT, meta tag, or file upload.",
        category: "Security",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 70_000, aggressive: 100_000 },
          fiveYear: { conservative: 280_000, moderate: 560_000, aggressive: 1_000_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_240_000, aggressive: 4_000_000 },
        },
      },
      {
        id: 1247,
        code: "SEC-SLINGSHOT-PASSTHROUGH",
        name: "Slingshot Pass-Through Architecture",
        shortDescription:
          "Gravitational routing system where QR codes route through verification before reaching external destinations.",
        category: "Security",
        valuations: {
          oneYear: { conservative: 50_000, moderate: 90_000, aggressive: 140_000 },
          fiveYear: { conservative: 350_000, moderate: 720_000, aggressive: 1_400_000 },
          tenYear: { conservative: 1_500_000, moderate: 2_880_000, aggressive: 5_600_000 },
        },
      },
      {
        id: 1248,
        code: "SEC-THREE-TIER-PASSTHROUGH",
        name: "Three-Tier Pass-Through Levels",
        shortDescription:
          "Transparent, Rewarded, and Interactive tiers with escalating benefits and Marks earning.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 55_000, aggressive: 85_000 },
          fiveYear: { conservative: 180_000, moderate: 385_000, aggressive: 750_000 },
          tenYear: { conservative: 800_000, moderate: 1_540_000, aggressive: 3_000_000 },
        },
      },
      {
        id: 1249,
        code: "SEC-USER-COUPON",
        name: "User Coupon Mechanism",
        shortDescription:
          "Temporary member status system for pass-through customers enabling Cost+20% pricing without membership.",
        category: "Economics",
        valuations: {
          oneYear: { conservative: 35_000, moderate: 65_000, aggressive: 100_000 },
          fiveYear: { conservative: 245_000, moderate: 520_000, aggressive: 1_000_000 },
          tenYear: { conservative: 1_050_000, moderate: 2_080_000, aggressive: 4_000_000 },
        },
      },
      {
        id: 1250,
        code: "SEC-RECIPROCAL-NETWORK",
        name: "Reciprocal Network",
        shortDescription:
          "Cross-promotion system where Level 3 businesses can host pass-throughs for other network businesses.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1251,
        code: "SEC-WHITE-LABEL-CUE",
        name: "White-Label Cue Cards",
        shortDescription:
          "Subscription system for branding removal on promotional materials with tiered access to pass-through levels.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1252,
        code: "SEC-ANTI-COUNTERFEIT",
        name: "Anti-Counterfeit Security Architecture",
        shortDescription:
          "Comprehensive security with cryptographic QR signing, rate limiting, anomaly detection, and audit trails.",
        category: "Security",
        valuations: {
          oneYear: { conservative: 60_000, moderate: 100_000, aggressive: 150_000 },
          fiveYear: { conservative: 420_000, moderate: 800_000, aggressive: 1_500_000 },
          tenYear: { conservative: 1_800_000, moderate: 3_200_000, aggressive: 6_000_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 365_000, moderate: 695_000, aggressive: 1_100_000 },
      fiveYear: { conservative: 2_495_000, moderate: 5_365_000, aggressive: 10_610_000 },
      tenYear: { conservative: 11_250_000, moderate: 22_860_000, aggressive: 45_440_000 },
    },
    stats: { innovationsCount: 9, claimsCount: 38 },
    voting: { targetAmount: 140_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET E: TRUST & VERIFICATION (#1253-#1260)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "E",
    slug: "trust-verification",
    name: "Trust & Verification",
    tagline: "The Furnace public QR verification registry with trust scores and counterfeit detection.",
    icon: "🔥",
    innovations: [
      {
        id: 1253,
        code: "TRUST-FURNACE-REGISTRY",
        name: "The Furnace — Public QR Verification Registry",
        shortDescription:
          "Public-facing verification page where users can upload, paste, or photograph Cue Cards to verify authenticity.",
        category: "Security",
        valuations: {
          oneYear: { conservative: 50_000, moderate: 90_000, aggressive: 140_000 },
          fiveYear: { conservative: 350_000, moderate: 720_000, aggressive: 1_400_000 },
          tenYear: { conservative: 1_500_000, moderate: 2_880_000, aggressive: 5_600_000 },
        },
      },
      {
        id: 1254,
        code: "TRUST-OCR-QR-EXTRACT",
        name: "OCR-Based QR Extraction for Verification",
        shortDescription:
          "System that extracts QR code data from screenshots or photos using computer vision for verification.",
        category: "Security",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 70_000, aggressive: 100_000 },
          fiveYear: { conservative: 280_000, moderate: 560_000, aggressive: 1_000_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_240_000, aggressive: 4_000_000 },
        },
      },
      {
        id: 1255,
        code: "TRUST-LEVIATHAN-REGISTRY",
        name: "Leviathan-Backed Cue Card Registry",
        shortDescription:
          "Central registry storing canonical records for every Cue Card including payload hash, security state, and usage history.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 35_000, moderate: 65_000, aggressive: 100_000 },
          fiveYear: { conservative: 245_000, moderate: 520_000, aggressive: 1_000_000 },
          tenYear: { conservative: 1_050_000, moderate: 2_080_000, aggressive: 4_000_000 },
        },
      },
      {
        id: 1256,
        code: "TRUST-SCORE-BUSINESS",
        name: "Trust Score for Verified Businesses",
        shortDescription:
          "Algorithmic trust score (0-100) based on verification history, scan patterns, user reports, and account age.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 55_000, aggressive: 85_000 },
          fiveYear: { conservative: 180_000, moderate: 385_000, aggressive: 750_000 },
          tenYear: { conservative: 800_000, moderate: 1_540_000, aggressive: 3_000_000 },
        },
      },
      {
        id: 1257,
        code: "TRUST-COUNTERFEIT-PATTERN",
        name: "Counterfeit Pattern Detection",
        shortDescription:
          "System that analyzes reported counterfeits to identify patterns and proactively warn users.",
        category: "Security",
        valuations: {
          oneYear: { conservative: 45_000, moderate: 80_000, aggressive: 120_000 },
          fiveYear: { conservative: 315_000, moderate: 640_000, aggressive: 1_200_000 },
          tenYear: { conservative: 1_350_000, moderate: 2_560_000, aggressive: 4_800_000 },
        },
      },
      {
        id: 1258,
        code: "TRUST-MICRO-CALLOUT",
        name: "Micro-Trust Callout Design Pattern",
        shortDescription:
          "Standardized placement and styling for verification callouts on Cue Cards (6-8pt, corner placement).",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 60_000, moderate: 150_000, aggressive: 300_000 },
          tenYear: { conservative: 250_000, moderate: 600_000, aggressive: 1_200_000 },
        },
      },
      {
        id: 1259,
        code: "TRUST-DUAL-PATH-VERIFY",
        name: "Dual-Path Verification Architecture",
        shortDescription:
          "Single Leviathan registry serving both transparent runtime verification (Hofund) and explicit manual verification (Furnace).",
        category: "Security",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 70_000, aggressive: 100_000 },
          fiveYear: { conservative: 280_000, moderate: 560_000, aggressive: 1_000_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_240_000, aggressive: 4_000_000 },
        },
      },
      {
        id: 1260,
        code: "TRUST-REPORT-BLOCK-PIPELINE",
        name: "Furnace Report-and-Block Pipeline",
        shortDescription:
          "Workflow where user reports trigger automated analysis, human review queue, and potential blocking.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 55_000, aggressive: 85_000 },
          fiveYear: { conservative: 180_000, moderate: 385_000, aggressive: 750_000 },
          tenYear: { conservative: 800_000, moderate: 1_540_000, aggressive: 3_000_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 285_000, moderate: 515_000, aggressive: 780_000 },
      fiveYear: { conservative: 1_890_000, moderate: 3_920_000, aggressive: 7_400_000 },
      tenYear: { conservative: 8_150_000, moderate: 15_680_000, aggressive: 29_600_000 },
    },
    stats: { innovationsCount: 8, claimsCount: 32 },
    voting: { targetAmount: 100_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET F: CHARITABLE INTEGRATION (#1261-#1266)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "F",
    slug: "charitable-integration",
    name: "Charitable Integration",
    tagline: "Kindling charitable business tiers with patent fund matching and impact tracking.",
    icon: "🔥",
    innovations: [
      {
        id: 1261,
        code: "CHAR-KINDLING-TIERS",
        name: "Kindling Charitable Business Tiers",
        shortDescription:
          "Four-tier system (Ember/Flame/Blaze/Inferno) for businesses committing to donate a percentage of sales.",
        category: "Economics",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 60_000, moderate: 125_000, aggressive: 200_000 },
          fiveYear: { conservative: 420_000, moderate: 940_000, aggressive: 2_000_000 },
          tenYear: { conservative: 1_800_000, moderate: 3_750_000, aggressive: 8_000_000 },
        },
      },
      {
        id: 1262,
        code: "CHAR-PATENT-MATCHING",
        name: "Patent Fund Matching for Charitable Donations",
        shortDescription:
          "60% patent revenue fund provides matching donations for Flame-tier and above businesses, up to 100%.",
        category: "Economics",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 70_000, aggressive: 100_000 },
          fiveYear: { conservative: 280_000, moderate: 525_000, aggressive: 900_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_100_000, aggressive: 3_600_000 },
        },
      },
      {
        id: 1263,
        code: "CHAR-TRUST-BONUS",
        name: "Trust Score Bonus for Charitable Commitment",
        shortDescription:
          "Algorithmic boost to business trust scores based on charitable tier level (+5 to +25).",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1264,
        code: "CHAR-IMPACT-TRACKING",
        name: "Impact Tracking and Display",
        shortDescription:
          "System tracking cumulative donations and displaying total community impact in verification results.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1265,
        code: "CHAR-INITIATIVE-ROUTING",
        name: "Initiative-Specific Donation Routing",
        shortDescription:
          "Mechanism wherein businesses designate which initiatives receive their donations.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 90_000, moderate: 210_000, aggressive: 420_000 },
          tenYear: { conservative: 375_000, moderate: 840_000, aggressive: 1_680_000 },
        },
      },
      {
        id: 1266,
        code: "CHAR-KINDLING-BADGES",
        name: "Kindling Badge System",
        shortDescription:
          "Fire-themed visual badges displayed on Cue Cards, Furnace results, and profiles.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 60_000, moderate: 150_000, aggressive: 300_000 },
          tenYear: { conservative: 250_000, moderate: 600_000, aggressive: 1_200_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 170_000, moderate: 335_000, aggressive: 530_000 },
      fiveYear: { conservative: 1_090_000, moderate: 2_385_000, aggressive: 4_740_000 },
      tenYear: { conservative: 4_625_000, moderate: 9_530_000, aggressive: 18_960_000 },
    },
    stats: { innovationsCount: 6, claimsCount: 22 },
    voting: { targetAmount: 70_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET G: RECOGNITION SYSTEMS (#1267-#1272)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "G",
    slug: "recognition-systems",
    name: "Recognition Systems",
    tagline: "Unified badge system with Stamps identity and trust score aggregation.",
    icon: "🏆",
    innovations: [
      {
        id: 1267,
        code: "REC-UNIFIED-BADGES",
        name: "Unified Badge System",
        shortDescription:
          "Single system tracking all contribution types with automatic badge awards based on cumulative thresholds.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1268,
        code: "REC-STAMPS-IDENTITY",
        name: "Stamps — Member QR Identity",
        shortDescription:
          "Unique cryptographic identity (ST-YYMM-XXXX format) for each member that signs all their Cue Cards.",
        category: "Security",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 70_000, aggressive: 100_000 },
          fiveYear: { conservative: 280_000, moderate: 560_000, aggressive: 1_000_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_240_000, aggressive: 4_000_000 },
        },
      },
      {
        id: 1269,
        code: "REC-TRUST-AGGREGATION",
        name: "Trust Score Aggregation from Badges",
        shortDescription:
          "Automatic trust score calculation based on accumulated badges across all categories.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1270,
        code: "REC-BADGE-STACKING",
        name: "Badge Stacking Display",
        shortDescription:
          "Visual display of all earned badges on profiles showing combined impact across contribution types.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 60_000, moderate: 150_000, aggressive: 300_000 },
          tenYear: { conservative: 250_000, moderate: 600_000, aggressive: 1_200_000 },
        },
      },
      {
        id: 1271,
        code: "REC-AUTO-BADGE-TRIGGERS",
        name: "Automatic Badge Triggers",
        shortDescription:
          "Database triggers that automatically check and award badges when contribution thresholds are reached.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1272,
        code: "REC-INITIATIVE-TRACKING",
        name: "Initiative Contribution Tracking",
        shortDescription:
          "System tracking credits contributed to specific initiatives for initiative-specific recognition.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 140_000, moderate: 270_000, aggressive: 425_000 },
      fiveYear: { conservative: 850_000, moderate: 1_900_000, aggressive: 3_680_000 },
      tenYear: { conservative: 3_650_000, moderate: 7_600_000, aggressive: 14_720_000 },
    },
    stats: { innovationsCount: 6, claimsCount: 24 },
    voting: { targetAmount: 55_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET H: KNOWLEDGE GAMIFICATION (#1273-#1277)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "H",
    slug: "knowledge-gamification",
    name: "Knowledge Gamification",
    tagline: "Scrolls to Deck Cards progression with sealed scroll mechanics and knowledge pipeline.",
    icon: "📜",
    innovations: [
      {
        id: 1273,
        code: "KNOW-SCROLL-TO-CARD",
        name: "Scroll-to-Card Progression",
        shortDescription:
          "System for converting reading artifacts (Scrolls) into actionable game pieces (Deck Cards).",
        category: "UX",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 100_000, moderate: 240_000, aggressive: 480_000 },
          tenYear: { conservative: 400_000, moderate: 960_000, aggressive: 1_920_000 },
        },
      },
      {
        id: 1274,
        code: "KNOW-MULTI-SCROLL-FRAME",
        name: "Multi-Scroll Frame Unlocking",
        shortDescription:
          "System requiring diverse knowledge types (different scroll colors) for complete Deck Cards.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 32_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 192_000, aggressive: 375_000 },
          tenYear: { conservative: 300_000, moderate: 768_000, aggressive: 1_500_000 },
        },
      },
      {
        id: 1275,
        code: "KNOW-SEALED-SCROLL",
        name: "Sealed Scroll Mechanics",
        shortDescription:
          "Completion-gated tradeable knowledge containers that become sealed when fully read.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 32_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 192_000, aggressive: 375_000 },
          tenYear: { conservative: 300_000, moderate: 768_000, aggressive: 1_500_000 },
        },
      },
      {
        id: 1276,
        code: "KNOW-ACTION-PIPELINE",
        name: "Knowledge-to-Action Pipeline",
        shortDescription:
          "Explicit progression from learning (scrolls) to doing (Deck Cards) where cards enable platform actions.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1277,
        code: "KNOW-BEACON-NOTE-CHAIN",
        name: "Beacon-Note-Cue Card Chain",
        shortDescription:
          "Short insights (beacon notes) convertible to Cue Cards and propagated through sharing systems.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 90_000, moderate: 184_000, aggressive: 295_000 },
      fiveYear: { conservative: 490_000, moderate: 1_184_000, aggressive: 2_350_000 },
      tenYear: { conservative: 2_000_000, moderate: 4_736_000, aggressive: 9_400_000 },
    },
    stats: { innovationsCount: 5, claimsCount: 20 },
    voting: { targetAmount: 40_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET I: INTERACTIVE LEARNING (#1278-#1287)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "I",
    slug: "interactive-learning",
    name: "Interactive Learning",
    tagline: "TV View walkthrough mode with beacon routes, release points, and training courses.",
    icon: "📺",
    innovations: [
      {
        id: 1278,
        code: "LEARN-TV-VIEW-MODE",
        name: "TV View Walkthrough Mode",
        shortDescription:
          "Non-interactive presentation playing through beacon-marked pages using live rendering.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1279,
        code: "LEARN-NUMBERED-ROUTES",
        name: "Numbered Beacon Routes",
        shortDescription:
          "Sequencing system allowing users to number beacons across different colors for ordered walkthroughs.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 32_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 192_000, aggressive: 375_000 },
          tenYear: { conservative: 300_000, moderate: 768_000, aggressive: 1_500_000 },
        },
      },
      {
        id: 1280,
        code: "LEARN-RELEASE-POINTS",
        name: "Release Points (Timed Interaction Windows)",
        shortDescription:
          "Designated beacons in TV View mode allowing temporary interaction before auto-resuming.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 90_000, moderate: 216_000, aggressive: 440_000 },
          tenYear: { conservative: 360_000, moderate: 864_000, aggressive: 1_760_000 },
        },
      },
      {
        id: 1281,
        code: "LEARN-COUNTDOWN-CHALLENGES",
        name: "Countdown Challenges with Zap-Back Progression",
        shortDescription:
          "Gamified beacon interactions with time limits and escalating consequences for missed deadlines.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 90_000, moderate: 216_000, aggressive: 440_000 },
          tenYear: { conservative: 360_000, moderate: 864_000, aggressive: 1_760_000 },
        },
      },
      {
        id: 1282,
        code: "LEARN-TRAINING-COURSES",
        name: "Training Courses (Solitaire Method)",
        shortDescription:
          "Structured beacon routes teaching platform proficiency through guided interaction sequences.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1283,
        code: "LEARN-COURSE-COMPLETION-TRACKING",
        name: "Course Completion Tracking",
        shortDescription:
          "System tracking user progress through training courses with completion certificates.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1284,
        code: "LEARN-BEACON-BRANCHING",
        name: "Beacon Branching Logic",
        shortDescription:
          "Conditional routing in beacon sequences based on user choices or completion status.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1285,
        code: "LEARN-VOICE-NARRATION-SYNC",
        name: "Voice Narration Sync",
        shortDescription:
          "Audio narration synchronized with beacon progression for accessibility and engagement.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1286,
        code: "LEARN-INTERACTIVE-QUIZ-BEACONS",
        name: "Interactive Quiz Beacons",
        shortDescription:
          "Beacons that present quiz questions and gate progression on correct answers.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 90_000, moderate: 216_000, aggressive: 440_000 },
          tenYear: { conservative: 360_000, moderate: 864_000, aggressive: 1_760_000 },
        },
      },
      {
        id: 1287,
        code: "LEARN-PROGRESS-PERSISTENCE",
        name: "Cross-Session Progress Persistence",
        shortDescription:
          "System that saves beacon progress across sessions allowing users to resume where they left off.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 16_000, moderate: 32_000, aggressive: 50_000 },
          fiveYear: { conservative: 80_000, moderate: 192_000, aggressive: 385_000 },
          tenYear: { conservative: 320_000, moderate: 768_000, aggressive: 1_540_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 180_000, moderate: 362_000, aggressive: 575_000 },
      fiveYear: { conservative: 965_000, moderate: 2_300_000, aggressive: 4_620_000 },
      tenYear: { conservative: 4_000_000, moderate: 9_208_000, aggressive: 18_480_000 },
    },
    stats: { innovationsCount: 10, claimsCount: 40 },
    voting: { targetAmount: 75_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET J: RESEARCH & QA (#1288-#1293, #1315-#1320)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "J",
    slug: "research-qa",
    name: "Research & QA",
    tagline: "Research toggle system and CODE-BREAKERS guild with automatic bounty generation.",
    icon: "🔬",
    innovations: [
      {
        id: 1288,
        code: "RES-PRE-DECISION-TOGGLE",
        name: "Pre-Decision Commitment Toggle",
        shortDescription:
          "Data-sharing commitment required before accessing research, ensuring reciprocal contribution.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1289,
        code: "RES-COMMITMENT-LOCK",
        name: "Commitment Lock Mechanism",
        shortDescription:
          "Toggle stays on if research accessed but campaign not sent, preventing free-riding.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
      {
        id: 1290,
        code: "RES-RECIPROCAL-POOL",
        name: "Reciprocal Research Pool",
        shortDescription:
          "Research pool where access level is proportional to contribution, incentivizing data sharing.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1291,
        code: "RES-TEMPLATE-ATTRIBUTION",
        name: "Template Attribution Marks",
        shortDescription:
          "Reputation currency rewards for template creators based on usage and effectiveness.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1292,
        code: "RES-TIMEFRAME-OPTIMIZATION",
        name: "Time Frame Optimization Research",
        shortDescription:
          "Aggregated data on expiration window effectiveness for campaign optimization.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
      {
        id: 1293,
        code: "RES-CONTINGENCY-INTEGRATION",
        name: "Contingency Operator Integration",
        shortDescription:
          "Simulation access gated by research contribution, linking testing to data sharing.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1315,
        code: "QA-CODEBREAKERS-GUILD",
        name: "CODE-BREAKERS Guild",
        shortDescription:
          "Quality assurance tribe using beacons for bug marking, with attribution and bounties.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1316,
        code: "QA-BEACON-BUG-REPORTING",
        name: "Beacon-Based Bug Reporting System",
        shortDescription:
          "Using existing beacon system to mark UI elements as bugs with visual indicators.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1317,
        code: "QA-SEVERITY-BOUNTIES",
        name: "Severity-Tiered Automatic Bounty Generation",
        shortDescription:
          "Bug reports automatically generate bounty values based on severity classification.",
        category: "Economics",
        valuations: {
          oneYear: { conservative: 22_000, moderate: 44_000, aggressive: 70_000 },
          fiveYear: { conservative: 132_000, moderate: 308_000, aggressive: 616_000 },
          tenYear: { conservative: 550_000, moderate: 1_232_000, aggressive: 2_464_000 },
        },
      },
      {
        id: 1318,
        code: "QA-GUILD-RANKS",
        name: "Guild Rank Progression for QA Contributors",
        shortDescription:
          "Rank system for CODE-BREAKERS based on bug discovery quantity and quality.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1319,
        code: "QA-BUG-ATTRIBUTION",
        name: "Individual Attribution for Bug Discovery",
        shortDescription:
          "Credit tracking for bug discovery persisting through fix lifecycle.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1320,
        code: "QA-BUG-BEACON-STORAGE",
        name: "Bug-as-Beacon Dual Storage Pattern",
        shortDescription:
          "Bug reports stored as structured data and visual beacons for dual-mode access.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 231_000, moderate: 462_000, aggressive: 740_000 },
      fiveYear: { conservative: 1_341_000, moderate: 3_142_000, aggressive: 6_261_000 },
      tenYear: { conservative: 5_700_000, moderate: 12_576_000, aggressive: 25_044_000 },
    },
    stats: { innovationsCount: 12, claimsCount: 48 },
    voting: { targetAmount: 95_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET K: VISUAL PROGRESSION (#1294-#1296)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "K",
    slug: "visual-progression",
    name: "Visual Progression",
    tagline: "Progressive badge borders with shape transformations and color evolution.",
    icon: "🎨",
    innovations: [
      {
        id: 1294,
        code: "VIS-PROGRESSIVE-BORDERS",
        name: "Progressive Badge Borders",
        shortDescription:
          "Badge borders that evolve with contribution level, providing visual status indicators.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1295,
        code: "VIS-SHAPE-TRANSFORMATION",
        name: "Shape Transformation Progression",
        shortDescription:
          "Circle → Square → Hexagon → Star shape progression indicating achievement levels.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1296,
        code: "VIS-COLOR-EVOLUTION",
        name: "Color Evolution System",
        shortDescription:
          "Bronze → Silver → Gold → Platinum → Diamond color progression for badges.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 45_000, moderate: 90_000, aggressive: 150_000 },
      fiveYear: { conservative: 225_000, moderate: 540_000, aggressive: 1_080_000 },
      tenYear: { conservative: 900_000, moderate: 2_160_000, aggressive: 4_320_000 },
    },
    stats: { innovationsCount: 3, claimsCount: 12 },
    voting: { targetAmount: 20_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET L: NAVIGATION ENHANCEMENT (#1297-#1310)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "L",
    slug: "navigation-enhancement",
    name: "Navigation Enhancement",
    tagline: "Natural path links, golden key deposit, ghost/real mode, and WildFire showcase.",
    icon: "🧭",
    innovations: [
      {
        id: 1297,
        code: "NAV-NATURAL-PATH-LINKS",
        name: "Natural Path Links",
        shortDescription:
          "Contextual navigation based on user journey, suggesting logical next steps.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1298,
        code: "NAV-BREADCRUMB-TRAILS",
        name: "Breadcrumb Trail System",
        shortDescription:
          "Visual trail showing user's navigation history with quick return options.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1299,
        code: "NAV-CONTEXT-AWARE-MENU",
        name: "Context-Aware Menu System",
        shortDescription:
          "Dynamic menus that adapt based on current page context and user state.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
      {
        id: 1300,
        code: "NAV-GOLDEN-KEY-DEPOSIT",
        name: "Golden Key Deposit",
        shortDescription:
          "Membership-gated permanent storage system for valuable platform assets.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1301,
        code: "NAV-KEY-RETRIEVAL-CEREMONY",
        name: "Key Retrieval Ceremony",
        shortDescription:
          "Ritual-like process for accessing deposited items with verification steps.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1302,
        code: "NAV-DEPOSIT-INHERITANCE",
        name: "Deposit Inheritance Rules",
        shortDescription:
          "System for transferring deposited assets to designated beneficiaries.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1303,
        code: "NAV-GHOST-REAL-MODE",
        name: "Ghost vs Real Mode Toggle",
        shortDescription:
          "System-wide toggle between practice (Ghost) and binding (Real) interactions.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 60_000, aggressive: 95_000 },
          fiveYear: { conservative: 180_000, moderate: 420_000, aggressive: 855_000 },
          tenYear: { conservative: 900_000, moderate: 1_680_000, aggressive: 3_420_000 },
        },
      },
      {
        id: 1304,
        code: "NAV-MAKE-THIS-COUNT",
        name: "Make This Count Conversion",
        shortDescription:
          "One-click conversion of Ghost mode actions to Real mode with confirmation.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1305,
        code: "NAV-MODE-INDICATOR",
        name: "Fixed Mode Indicator",
        shortDescription:
          "Persistent visual indicator showing current Ghost/Real mode state.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 12_000, moderate: 24_000, aggressive: 40_000 },
          fiveYear: { conservative: 60_000, moderate: 144_000, aggressive: 288_000 },
          tenYear: { conservative: 240_000, moderate: 576_000, aggressive: 1_152_000 },
        },
      },
      {
        id: 1306,
        code: "NAV-WILDFIRE-TOUR",
        name: "WildFire Deck-Card Tour",
        shortDescription:
          "Guided platform showcase using deck cards as navigation waypoints.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 22_000, moderate: 44_000, aggressive: 70_000 },
          fiveYear: { conservative: 132_000, moderate: 308_000, aggressive: 616_000 },
          tenYear: { conservative: 550_000, moderate: 1_232_000, aggressive: 2_464_000 },
        },
      },
      {
        id: 1307,
        code: "NAV-TOUR-PROGRESS",
        name: "Numbered Tour Progress",
        shortDescription:
          "Progress tracking through WildFire tours with completion indicators.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1308,
        code: "NAV-DETOUR-LOOPS",
        name: "Detour Loop System",
        shortDescription:
          "Optional side paths in tours that return to main route after completion.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1309,
        code: "NAV-BEACON-DROP-TOUR",
        name: "Beacon Dropping During Tours",
        shortDescription:
          "Ability to drop personal beacons during guided tours for later reference.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
      {
        id: 1310,
        code: "NAV-TOUR-EXIT-RESUME",
        name: "Tour Exit with Resume Awareness",
        shortDescription:
          "Exit tours at any point with ability to resume from last position.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 260_000, moderate: 520_000, aggressive: 840_000 },
      fiveYear: { conservative: 1_473_000, moderate: 3_466_000, aggressive: 6_929_000 },
      tenYear: { conservative: 6_290_000, moderate: 13_864_000, aggressive: 27_716_000 },
    },
    stats: { innovationsCount: 14, claimsCount: 56 },
    voting: { targetAmount: 105_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET M: ANIMATION & SIMULATION (#1311-#1314, #1321-#1329)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "M",
    slug: "animation-simulation",
    name: "Animation & Simulation",
    tagline: "Spinning word wheel, dispatch plugins, and contingency operators.",
    icon: "🎰",
    innovations: [
      {
        id: 1311,
        code: "ANIM-SPINNING-WHEEL",
        name: "Spinning Word Wheel",
        shortDescription:
          "Animated selection interface with physics-based wheel spin for random selection.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1312,
        code: "ANIM-WHEEL-SEGMENTS",
        name: "Dynamic Wheel Segments",
        shortDescription:
          "Wheel segments that adjust size based on probability weighting.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 12_000, moderate: 24_000, aggressive: 40_000 },
          fiveYear: { conservative: 60_000, moderate: 144_000, aggressive: 288_000 },
          tenYear: { conservative: 240_000, moderate: 576_000, aggressive: 1_152_000 },
        },
      },
      {
        id: 1313,
        code: "ANIM-WHEEL-SOUND-SYNC",
        name: "Wheel Sound Synchronization",
        shortDescription:
          "Audio feedback synchronized with wheel rotation speed and segment passing.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 10_000, moderate: 20_000, aggressive: 35_000 },
          fiveYear: { conservative: 50_000, moderate: 120_000, aggressive: 245_000 },
          tenYear: { conservative: 200_000, moderate: 480_000, aggressive: 980_000 },
        },
      },
      {
        id: 1314,
        code: "ANIM-WHEEL-RESULT-REVEAL",
        name: "Dramatic Result Reveal",
        shortDescription:
          "Animated reveal sequence when wheel stops with celebration effects.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 12_000, moderate: 24_000, aggressive: 40_000 },
          fiveYear: { conservative: 60_000, moderate: 144_000, aggressive: 288_000 },
          tenYear: { conservative: 240_000, moderate: 576_000, aggressive: 1_152_000 },
        },
      },
      {
        id: 1321,
        code: "SIM-DISPATCH-PLUGINS",
        name: "Dispatch Plugins",
        shortDescription:
          "Modular notification routing system with pluggable delivery channels.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1322,
        code: "SIM-CHANNEL-PRIORITY",
        name: "Channel Priority Routing",
        shortDescription:
          "Notification routing based on channel availability and user preferences.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
      {
        id: 1323,
        code: "SIM-FALLBACK-CHAINS",
        name: "Fallback Delivery Chains",
        shortDescription:
          "Automatic fallback to alternative channels if primary delivery fails.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
      {
        id: 1324,
        code: "SIM-DELIVERY-CONFIRMATION",
        name: "Delivery Confirmation Tracking",
        shortDescription:
          "System tracking notification delivery status across all channels.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
      {
        id: 1325,
        code: "SIM-CONTINGENCY-OPERATORS",
        name: "Contingency Operators",
        shortDescription:
          "Conditional action triggers based on defined scenarios and thresholds.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
      {
        id: 1326,
        code: "SIM-SCENARIO-BUILDER",
        name: "Scenario Builder Interface",
        shortDescription:
          "Visual interface for creating contingency scenarios without coding.",
        category: "UX",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1327,
        code: "SIM-TRIGGER-CHAINS",
        name: "Trigger Chain Execution",
        shortDescription:
          "Sequential execution of contingency actions with dependency management.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 18_000, moderate: 36_000, aggressive: 55_000 },
          fiveYear: { conservative: 108_000, moderate: 252_000, aggressive: 495_000 },
          tenYear: { conservative: 450_000, moderate: 1_008_000, aggressive: 1_980_000 },
        },
      },
      {
        id: 1328,
        code: "SIM-SIMULATION-SANDBOX",
        name: "Contingency Simulation Sandbox",
        shortDescription:
          "Safe environment for testing contingency scenarios before activation.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 20_000, moderate: 40_000, aggressive: 65_000 },
          fiveYear: { conservative: 120_000, moderate: 280_000, aggressive: 560_000 },
          tenYear: { conservative: 500_000, moderate: 1_120_000, aggressive: 2_240_000 },
        },
      },
      {
        id: 1329,
        code: "SIM-RESEARCH-GATED-ACCESS",
        name: "Research-Gated Simulation Access",
        shortDescription:
          "Simulation access gated by research contribution level.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 15_000, moderate: 30_000, aggressive: 50_000 },
          fiveYear: { conservative: 75_000, moderate: 180_000, aggressive: 360_000 },
          tenYear: { conservative: 300_000, moderate: 720_000, aggressive: 1_440_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 223_000, moderate: 446_000, aggressive: 720_000 },
      fiveYear: { conservative: 1_259_000, moderate: 2_964_000, aggressive: 5_906_000 },
      tenYear: { conservative: 5_330_000, moderate: 11_856_000, aggressive: 23_644_000 },
    },
    stats: { innovationsCount: 13, claimsCount: 52 },
    voting: { targetAmount: 90_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCKET P: PEDESTAL VOTING SYSTEM (#1330)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "P",
    slug: "pedestal-voting",
    name: "Pedestal Voting System",
    tagline: "The meta-innovation: interactive pedestal cards for patent portfolio voting.",
    icon: "🗳️",
    innovations: [
      {
        id: 1330,
        code: "META-PEDESTAL-VOTING",
        name: "Patent Bucket Pedestal Voting System",
        shortDescription:
          "System for presenting patent portfolios as interactive pedestal cards with voting, valuations, and fractional ownership.",
        category: "Platform",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
          fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
          tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 80_000 },
      fiveYear: { conservative: 150_000, moderate: 350_000, aggressive: 700_000 },
      tenYear: { conservative: 700_000, moderate: 1_400_000, aggressive: 2_800_000 },
    },
    stats: { innovationsCount: 1, claimsCount: 5 },
    voting: { targetAmount: 10_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOWCASE PEDESTAL 1: THE NINE ECONOMIC LAWS (Salt Mines Entrance)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "NINE",
    slug: "nine-economic-laws",
    name: "The Nine Economic Laws",
    tagline: "The mathematical foundation of Margin Economics and Interdependence — 37 years in the making.",
    icon: "⛏️",
    iconImage: "/images/salt-mines-entrance.png",
    isShowcase: true,
    linkedBuckets: ["A", "F", "HEXISLE"], // These buckets contain Nine Laws innovations
    innovations: [
      {
        id: 9001,
        code: "LAW-1-FOREX-DIFFERENTIAL",
        name: "Law #1: Forex-Differential Absorption",
        shortDescription:
          "Platform absorbs forex differentials into a collective buffer, smoothing individual losses through statistical averaging.",
        category: "Showcase",
        containedInBucket: "A",
        valuations: {
          oneYear: { conservative: 50_000, moderate: 100_000, aggressive: 175_000 },
          fiveYear: { conservative: 350_000, moderate: 750_000, aggressive: 1_500_000 },
          tenYear: { conservative: 1_500_000, moderate: 3_000_000, aggressive: 6_000_000 },
        },
      },
      {
        id: 9002,
        code: "LAW-2-RATCHET-HIVI",
        name: "Law #2: Ratchet Value Accumulation (HIVI)",
        shortDescription:
          "One-way ratchet where internal exchange rate can only increase, never decrease. Value accumulates deterministically.",
        category: "Showcase",
        isCrownJewel: true,
        containedInBucket: "A",
        valuations: {
          oneYear: { conservative: 80_000, moderate: 175_000, aggressive: 300_000 },
          fiveYear: { conservative: 600_000, moderate: 1_400_000, aggressive: 3_000_000 },
          tenYear: { conservative: 3_000_000, moderate: 7_000_000, aggressive: 15_000_000 },
        },
      },
      {
        id: 9003,
        code: "LAW-3-COST-PLUS-20",
        name: "Law #3: Quality-Volume Alignment (Cost+20%)",
        shortDescription:
          "Fixed 20% margin aligns incentives — enough for sellers to thrive, low enough for buyer trust. The Definition of a Bargain.",
        category: "Showcase",
        isCrownJewel: true,
        containedInBucket: "A",
        valuations: {
          oneYear: { conservative: 100_000, moderate: 200_000, aggressive: 350_000 },
          fiveYear: { conservative: 750_000, moderate: 1_600_000, aggressive: 3_500_000 },
          tenYear: { conservative: 4_000_000, moderate: 8_000_000, aggressive: 17_500_000 },
        },
      },
      {
        id: 9004,
        code: "LAW-4-ONE-WAY-VALVE",
        name: "Law #4: One-Way Valve Decoupling",
        shortDescription:
          "Credits flow in easily (cash → credits), but flowing out requires friction — time delays, usage requirements, or verification.",
        category: "Showcase",
        containedInBucket: "A",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 80_000, aggressive: 140_000 },
          fiveYear: { conservative: 280_000, moderate: 600_000, aggressive: 1_200_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_400_000, aggressive: 4_800_000 },
        },
      },
      {
        id: 9005,
        code: "LAW-5-STRUCTURAL-GLEANING",
        name: "Law #5: Structural Gleaning (3.3% Gleaner's Corner)",
        shortDescription:
          "3.3% of every transaction flows to Gleaner's Corner — structural allocation (not charity) for those in need. Ruth in Boaz's fields.",
        category: "Showcase",
        containedInBucket: "F",
        valuations: {
          oneYear: { conservative: 50_000, moderate: 100_000, aggressive: 175_000 },
          fiveYear: { conservative: 350_000, moderate: 750_000, aggressive: 1_500_000 },
          tenYear: { conservative: 1_500_000, moderate: 3_000_000, aggressive: 6_000_000 },
        },
      },
      {
        id: 9006,
        code: "LAW-6-BOAZ-PRINCIPLE",
        name: "Law #6: Generosity for Potential (Boaz Principle)",
        shortDescription:
          "Credit based on potential, not just history. Community vouching unlocks opportunities that credit scores alone would deny.",
        category: "Showcase",
        containedInBucket: "F",
        valuations: {
          oneYear: { conservative: 60_000, moderate: 125_000, aggressive: 200_000 },
          fiveYear: { conservative: 420_000, moderate: 940_000, aggressive: 2_000_000 },
          tenYear: { conservative: 1_800_000, moderate: 3_750_000, aggressive: 8_000_000 },
        },
      },
      {
        id: 9007,
        code: "LAW-7-INCEPTION",
        name: "Law #7: Inception Principle",
        shortDescription:
          "Tracks the moment of conception — when an idea becomes actionable. Creates provenance chain across development lifecycle.",
        category: "Showcase",
        containedInBucket: "A",
        valuations: {
          oneYear: { conservative: 45_000, moderate: 90_000, aggressive: 155_000 },
          fiveYear: { conservative: 315_000, moderate: 675_000, aggressive: 1_350_000 },
          tenYear: { conservative: 1_350_000, moderate: 2_700_000, aggressive: 5_400_000 },
        },
      },
      {
        id: 9008,
        code: "LAW-8-SIMULTANEOUS-PRICING",
        name: "Law #8: Simultaneous Pricing Paradox",
        shortDescription:
          "Everyone sees the same price at the same time. No hidden deals, no preferential treatment, no information advantage.",
        category: "Showcase",
        isCrownJewel: true,
        containedInBucket: "A",
        valuations: {
          oneYear: { conservative: 100_000, moderate: 200_000, aggressive: 350_000 },
          fiveYear: { conservative: 750_000, moderate: 1_600_000, aggressive: 3_500_000 },
          tenYear: { conservative: 4_000_000, moderate: 8_000_000, aggressive: 17_500_000 },
        },
      },
      {
        id: 9009,
        code: "LAW-9-JEEP-THESEUS",
        name: "Law #9: Jeep of Theseus (Cold Start)",
        shortDescription:
          "Ghost Credits simulate demand before real transactions. As real activity replaces simulated, the system 'shifts into gear'.",
        category: "Showcase",
        containedInBucket: "L",
        valuations: {
          oneYear: { conservative: 70_000, moderate: 140_000, aggressive: 240_000 },
          fiveYear: { conservative: 490_000, moderate: 1_050_000, aggressive: 2_100_000 },
          tenYear: { conservative: 2_100_000, moderate: 4_200_000, aggressive: 8_400_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 595_000, moderate: 1_210_000, aggressive: 2_085_000 },
      fiveYear: { conservative: 4_305_000, moderate: 9_365_000, aggressive: 19_650_000 },
      tenYear: { conservative: 20_450_000, moderate: 42_050_000, aggressive: 88_600_000 },
    },
    stats: { innovationsCount: 9, claimsCount: 126 },
    voting: { targetAmount: 250_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOWCASE PEDESTAL 2: HEXISLE MECHANICAL SYSTEMS (Salt Mines Entrance)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "HEXISLE",
    slug: "hexisle-mechanical",
    name: "HexIsle Mechanical Systems",
    tagline: "The ONLY modular game terrain with real hydraulic/pneumatic/magnetic subsystems that actually DO something.",
    icon: "⛏️",
    iconImage: "/images/salt-mines-entrance.png",
    isShowcase: true,
    linkedBuckets: ["B"], // HexIsle innovations span multiple filings
    innovations: [
      {
        id: 8001,
        code: "HEX-GOLDEN-LOTUS",
        name: "Golden Lotus Configuration",
        shortDescription:
          "Tesla valves in CENTER pointing OUTWARD, rotor ring on OUTSIDE — ~5.0 in-lb torque with 10× safety margin.",
        category: "Showcase",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 80_000, moderate: 175_000, aggressive: 300_000 },
          fiveYear: { conservative: 600_000, moderate: 1_400_000, aggressive: 3_000_000 },
          tenYear: { conservative: 3_000_000, moderate: 7_000_000, aggressive: 15_000_000 },
        },
      },
      {
        id: 8002,
        code: "HEX-HOLLOWLOG",
        name: "HollowLog Central Passage",
        shortDescription:
          "15mm central conduit with 2mm sleeve wall enabling vertical integration across all Hexel layers.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 60_000, aggressive: 100_000 },
          fiveYear: { conservative: 210_000, moderate: 450_000, aggressive: 900_000 },
          tenYear: { conservative: 900_000, moderate: 1_800_000, aggressive: 3_600_000 },
        },
      },
      {
        id: 8003,
        code: "HEX-ROOSTER-TEETH",
        name: "Rooster Teeth Torque Amplification",
        shortDescription:
          "Triangular ramp protrusions inside cups that catch pushing flow and amplify rotational torque.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 80_000, aggressive: 140_000 },
          fiveYear: { conservative: 280_000, moderate: 600_000, aggressive: 1_200_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_400_000, aggressive: 4_800_000 },
        },
      },
      {
        id: 8004,
        code: "HEX-36-VANE-ROTOR",
        name: "36-Vane Rotor Ring",
        shortDescription:
          "Outer perimeter rotor with 36 vanes at 10° spacing, providing 2,160 mm² vane area for hydraulic actuation.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 35_000, moderate: 70_000, aggressive: 120_000 },
          fiveYear: { conservative: 245_000, moderate: 525_000, aggressive: 1_050_000 },
          tenYear: { conservative: 1_050_000, moderate: 2_100_000, aggressive: 4_200_000 },
        },
      },
      {
        id: 8005,
        code: "HEX-AC-PHASE-OPERATION",
        name: "AC Phase Unidirectional Rotation",
        shortDescription:
          "Both upstroke and downstroke drive same rotational direction via Tesla valve curves and 30° exit angles.",
        category: "Showcase",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 60_000, moderate: 125_000, aggressive: 200_000 },
          fiveYear: { conservative: 420_000, moderate: 940_000, aggressive: 2_000_000 },
          tenYear: { conservative: 1_800_000, moderate: 3_750_000, aggressive: 8_000_000 },
        },
      },
      {
        id: 8006,
        code: "HEX-SWAN-NECK-COUPLING",
        name: "Swan Neck Inverse Coupling",
        shortDescription:
          "Hexels ASSIST each other through inverse coupling — parallel flow architecture prevents competition.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 45_000, moderate: 90_000, aggressive: 155_000 },
          fiveYear: { conservative: 315_000, moderate: 675_000, aggressive: 1_350_000 },
          tenYear: { conservative: 1_350_000, moderate: 2_700_000, aggressive: 5_400_000 },
        },
      },
      {
        id: 8007,
        code: "HEX-HOFUND-REVERSIBLE-VALVE",
        name: "HoFund Reversible Pneumatic Valve",
        shortDescription:
          "Position-controlled reversible valve system enabling bidirectional pneumatic routing.",
        category: "Showcase",
        isCrownJewel: true,
        valuations: {
          oneYear: { conservative: 70_000, moderate: 140_000, aggressive: 240_000 },
          fiveYear: { conservative: 490_000, moderate: 1_050_000, aggressive: 2_100_000 },
          tenYear: { conservative: 2_100_000, moderate: 4_200_000, aggressive: 8_400_000 },
        },
      },
      {
        id: 8008,
        code: "HEX-OURALIS-CAM",
        name: "Ouralis Tidal Mechanism",
        shortDescription:
          "Cam-driven tidal mechanism for wave generation in terrain surface gameplay.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 35_000, moderate: 70_000, aggressive: 120_000 },
          fiveYear: { conservative: 245_000, moderate: 525_000, aggressive: 1_050_000 },
          tenYear: { conservative: 1_050_000, moderate: 2_100_000, aggressive: 4_200_000 },
        },
      },
      {
        id: 8009,
        code: "HEX-PETAL-LOCK",
        name: "Petal Lock 60° Twist Connection",
        shortDescription:
          "60° twist-lock mechanism connecting terrain surface to HollowLog central conduit.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 30_000, moderate: 60_000, aggressive: 100_000 },
          fiveYear: { conservative: 210_000, moderate: 450_000, aggressive: 900_000 },
          tenYear: { conservative: 900_000, moderate: 1_800_000, aggressive: 3_600_000 },
        },
      },
      {
        id: 8010,
        code: "HEX-WATERCAP-CONNECTOR",
        name: "WaterCap Universal Connector Valve",
        shortDescription:
          "60° twist-lock unified connector principle for all fluid/pneumatic connections.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 50_000, moderate: 100_000, aggressive: 175_000 },
          fiveYear: { conservative: 350_000, moderate: 750_000, aggressive: 1_500_000 },
          tenYear: { conservative: 1_500_000, moderate: 3_000_000, aggressive: 6_000_000 },
        },
      },
      {
        id: 8011,
        code: "HEX-CLAMSHELL-ASSEMBLY",
        name: "Clamshell Sealed Chamber",
        shortDescription:
          "Two-piece sealed chamber design containing Golden Lotus pumps and internal mechanisms.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 25_000, moderate: 50_000, aggressive: 85_000 },
          fiveYear: { conservative: 175_000, moderate: 375_000, aggressive: 750_000 },
          tenYear: { conservative: 750_000, moderate: 1_500_000, aggressive: 3_000_000 },
        },
      },
      {
        id: 8012,
        code: "HEX-469-HEXEL-VALIDATION",
        name: "469-Hexel System Validation",
        shortDescription:
          "Validated system architecture: 5-gallon reservoir, 2.17 psi, 10× torque margin, 95% pressure retention at furthest Hexel.",
        category: "Showcase",
        valuations: {
          oneYear: { conservative: 40_000, moderate: 80_000, aggressive: 140_000 },
          fiveYear: { conservative: 280_000, moderate: 600_000, aggressive: 1_200_000 },
          tenYear: { conservative: 1_200_000, moderate: 2_400_000, aggressive: 4_800_000 },
        },
      },
    ],
    totals: {
      oneYear: { conservative: 540_000, moderate: 1_100_000, aggressive: 1_875_000 },
      fiveYear: { conservative: 3_820_000, moderate: 8_340_000, aggressive: 17_000_000 },
      tenYear: { conservative: 16_800_000, moderate: 34_750_000, aggressive: 71_000_000 },
    },
    stats: { innovationsCount: 12, claimsCount: 154 },
    voting: { targetAmount: 220_000, currentAmount: 0, backerCount: 0, percentFunded: 0 },
    ownershipRules: standardOwnershipRules,
    stakePolicy: standardStakePolicy,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO TOTALS
// ═══════════════════════════════════════════════════════════════════════════

export function calculatePortfolioTotals() {
  const totals = {
    oneYear: { conservative: 0, moderate: 0, aggressive: 0 },
    fiveYear: { conservative: 0, moderate: 0, aggressive: 0 },
    tenYear: { conservative: 0, moderate: 0, aggressive: 0 },
    innovationsCount: 0,
    claimsCount: 0,
  };

  // Only count non-showcase buckets to avoid double-counting
  for (const bucket of patentBuckets) {
    if (!bucket.isShowcase) {
      totals.oneYear.conservative += bucket.totals.oneYear.conservative;
      totals.oneYear.moderate += bucket.totals.oneYear.moderate;
      totals.oneYear.aggressive += bucket.totals.oneYear.aggressive;
      totals.fiveYear.conservative += bucket.totals.fiveYear.conservative;
      totals.fiveYear.moderate += bucket.totals.fiveYear.moderate;
      totals.fiveYear.aggressive += bucket.totals.fiveYear.aggressive;
      totals.tenYear.conservative += bucket.totals.tenYear.conservative;
      totals.tenYear.moderate += bucket.totals.tenYear.moderate;
      totals.tenYear.aggressive += bucket.totals.tenYear.aggressive;
      totals.innovationsCount += bucket.stats.innovationsCount;
      totals.claimsCount += bucket.stats.claimsCount;
    }
  }

  return totals;
}

// Get showcase buckets
export function getShowcaseBuckets() {
  return patentBuckets.filter(b => b.isShowcase);
}

// Get regular buckets
export function getRegularBuckets() {
  return patentBuckets.filter(b => !b.isShowcase);
}

// Crown jewels for quick reference
export const crownJewels = [1228, 1233, 1239, 1245, 1261];

// Showcase crown jewels (Nine Laws + HexIsle)
export const showcaseCrownJewels = {
  nineLaws: [9002, 9003, 9008], // HIVI, Cost+20%, Simultaneous Pricing
  hexisle: [8001, 8005, 8007], // Golden Lotus, AC Phase, HoFund Valve
};
