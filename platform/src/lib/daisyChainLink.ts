/**
 * DAISY CHAIN LINK — Universal Cross-Project Linking System
 * ==========================================================
 * Innovation #1464: DaisyChainLink Architecture
 *
 * The DaisyChain is how projects connect to each other across the platform.
 * Every project can link to any other project. The Coaster Medallion project
 * is special — it DaisyChainLinks to EVERY project because it prints the
 * physical medallion that represents membership/stake in that project.
 *
 * A DaisyChainLink creates:
 * 1. Cross-pollination bonuses (Chain Voting 5% stacking)
 * 2. Shared audience discovery
 * 3. Creator-to-creator Joule rewards
 * 4. Physical medallion eligibility (via Coaster Medallion project)
 *
 * Pattern: Derived from DefenseKlausDaisyChain (referral chain)
 *   but generalized to connect PROJECTS, not just users.
 *
 * Literary reference: Jason and the Argonauts — assembled team on a quest.
 *   Each project is a hero on the Argo. The DaisyChain IS the ship.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type LinkType =
  | 'medallion'        // Coaster Medallion → any project (universal, auto-created)
  | 'senior-pics'      // Mutual swap between two projects (MedallionSwap pattern)
  | 'parent-child'     // Initiative spawns sub-projects
  | 'initiative-hub'   // Sweet Sixteen initiative → all its projects
  | 'maker-product'    // Maker/printer → product they manufacture
  | 'supply-chain'     // Upstream supplier → downstream product
  | 'cross-initiative' // Links between projects in different initiatives
  | 'derivative';      // Fork/remix of another project

export type LinkStatus =
  | 'proposed'         // One side has offered the link
  | 'active'           // Both sides accepted (or auto-linked for medallion type)
  | 'paused'           // Temporarily suspended
  | 'dissolved';       // Permanently removed

export interface DaisyChainLink {
  id: string;
  linkType: LinkType;
  status: LinkStatus;

  // The two connected projects
  projectA: {
    id: string;
    name: string;
    slug: string;
    initiative: string;        // Which of the Sweet Sixteen
    initiativeSlug: string;
    medallionDesignId?: string; // Their medallion design, if any
  };
  projectB: {
    id: string;
    name: string;
    slug: string;
    initiative: string;
    initiativeSlug: string;
    medallionDesignId?: string;
  };

  // Chain Voting economics
  chainVotingBonus: number;       // Percentage bonus (default 5%)
  crossPurchaseCount: number;     // How many users bought from both
  jouleRewardsDistributed: number; // Total Joules given to creators

  // Metadata
  createdAt: string;
  createdBy: string;              // User who proposed the link
  acceptedAt?: string;
  acceptedBy?: string;

  // Physical medallion link (if applicable)
  physicalMedallionEligible: boolean;
  coasterMedallionProjectId?: string; // Always points to the Coaster Medallion project
}

export interface DaisyChainNetwork {
  /** The central project whose network we're viewing */
  centerId: string;
  centerName: string;

  /** All links radiating from this project */
  links: DaisyChainLink[];

  /** Aggregate stats */
  totalLinkedProjects: number;
  totalCrossPurchases: number;
  totalJouleRewards: number;
  networkReach: number;           // 2nd-degree connections (links of links)

  /** Is this the Coaster Medallion? If so, it links to EVERYTHING */
  isUniversalHub: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THE SWEET SIXTEEN — Initiative Registry
// Every project belongs to one of these 16 initiatives
// ═══════════════════════════════════════════════════════════════════════════════

export interface Initiative {
  number: number;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  emoji: string;
  /** The DaisyChainLink hub for this initiative — all projects under it auto-link here */
  hubProjectId?: string;
}

export const SWEET_SIXTEEN: Initiative[] = [
  { number: 1,  name: "Let's Make Dinner",           slug: "lets-make-dinner",       emoji: "\u{1F37D}\uFE0F", tagline: "Neighbors feeding neighbors",              category: "Food & Community" },
  { number: 2,  name: "Let's Get Groceries",         slug: "lets-get-groceries",     emoji: "\u{1F6D2}",       tagline: "Community provisioning at scale",           category: "Food & Supply" },
  { number: 3,  name: "Let's Go Shopping",           slug: "lets-go-shopping",       emoji: "\u{1F6CD}\uFE0F", tagline: "Ethical retail, cooperative scale",         category: "Retail & Commerce" },
  { number: 4,  name: "Household Concierge",         slug: "household-concierge",    emoji: "\u{1F3E0}",       tagline: "A shared Butler for your home",             category: "Home Services" },
  { number: 5,  name: "The Family Table",            slug: "family-table",           emoji: "\u2764\uFE0F",    tagline: "Private family operations hub",             category: "Family & Private" },
  { number: 6,  name: "Tatiana Schlossberg Health Accords / LifeLine Medications", slug: "health-accords", emoji: "\u{1F48A}", tagline: "Navigating medical systems together", category: "Healthcare" },
  { number: 7,  name: "MSA (Medical Savings Accounts)", slug: "msa",                 emoji: "\u{1F6E1}\uFE0F", tagline: "Cooperative medical savings",               category: "Healthcare & Finance" },
  { number: 8,  name: "Defense Klaus",               slug: "defense-klaus",          emoji: "\u{1F6E1}\uFE0F", tagline: "Personal safety, cooperative protection",   category: "Safety & Legal" },
  { number: 9,  name: "Rally Group",                 slug: "rally-group",            emoji: "\u{1F465}",       tagline: "Community action, organized",               category: "Community Action" },
  { number: 10, name: "VSL (Voucher Short Loans)",   slug: "vsl",                    emoji: "\u{1F4B0}",       tagline: "Community lending, not extraction",         category: "Community Finance" },
  { number: 11, name: "Let's Make Bread",            slug: "lets-make-bread",        emoji: "\u{1F35E}",       tagline: "Let's make money \u2014 business incubator",     category: "Business & Entrepreneurship" },
  { number: 12, name: "Harper Guild",                slug: "harper-guild",           emoji: "\u2696\uFE0F",    tagline: "Ethics checkers and truth-tellers",         category: "Information & Ethics" },
  { number: 13, name: "JukeBox",                     slug: "jukebox",                emoji: "\u{1F3B5}",       tagline: "Music licensing, cooperative style",        category: "Music & Licensing" },
  { number: 14, name: "Didasko",                     slug: "didasko",                emoji: "\u{1F393}",       tagline: "Education without extraction",              category: "Education & Academia" },
  { number: 15, name: "Power to the People",         slug: "power-to-the-people",    emoji: "\u26A1",          tagline: "Civic engagement, cooperative backbone",    category: "Civic & Political" },
  { number: 16, name: "Brass Tacks",                 slug: "brass-tacks",            emoji: "\u{1F528}",       tagline: "Manufacturing, made cooperative",           category: "Manufacturing & Production" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COASTER MEDALLION — The Universal Project
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The Coaster Medallion is a PROJECT that lives under Brass Tacks (#16)
 * but DaisyChainLinks to EVERY other project on the platform.
 *
 * Why? Because it PRINTS the physical medallion that represents your
 * membership/stake in any project. When you back a HexIsle character,
 * you get a physical Coaster Medallion for that project. When you join
 * Defense Klaus, you get a Coaster Medallion. It's the universal receipt,
 * the physical proof, the thing you hold in your hand.
 *
 * Origin story (a "Just So Story"):
 * - Started as a QR code card idea
 * - Card was too big → tried tea mug coaster
 * - Coaster needed a compliant mechanism counter
 * - Counter became the medallion
 * - Medallion became the universal token
 *
 * Production pipeline:
 * - Designed in Fusion 360
 * - Prototyped on Formlabs Form 4 ($4,499) or Form 3+ ($2,499)
 * - Bulk resin as low as $35/L
 * - Volume discount: 6 levels from SLA Prototype ($50) to Mass Production ($10)
 *
 * The Coaster Medallion project is the physical manifestation of DaisyChainLink.
 * Every project gets a medallion. Every medallion connects back to this project.
 */

export const COASTER_MEDALLION_PROJECT = {
  id: 'coaster-medallion-001',
  name: 'Coaster Medallion',
  slug: 'coaster-medallion',
  sku: 'LB-BRASS-MEDALLION-001',
  initiative: SWEET_SIXTEEN[15], // Brass Tacks (#16)

  tagline: 'The physical proof of everything you back',
  description: `Every project on the platform gets a physical medallion. When you back a project,
  support an initiative, or join a guild — you earn a Coaster Medallion for that connection.
  It's not a trophy. It's not a toy. It's a physical, hexagonal proof that you showed up and put
  skin in the game. Your QR code. Your compliant mechanism counter. Your "Just So Story" made real.`,

  originStory: {
    phase1: 'Started as a QR code business card for the platform',
    phase2: 'Card was too big — tried embedding it in a tea mug coaster',
    phase3: 'Coaster needed a way to track engagement — added compliant mechanism counter',
    phase4: 'Counter medallion became the universal token for project backing',
    phase5: 'Medallion became DaisyChainLinked to every project — the physical glue of the cooperative',
    literaryRef: 'Just So Stories (Kipling) — "How the Medallion Got Its Shape"',
  },

  // Manufacturing specs
  manufacturing: {
    designSoftware: 'Autodesk Fusion 360',
    prototypePrinter: 'Formlabs Form 4',
    prototypeCost: 4499,           // Form 4 printer cost
    alternativePrinter: 'Formlabs Form 3+',
    alternativeCost: 2499,         // Form 3+ printer cost
    bulkResinCostPerLiter: 35,     // Minimum bulk resin price
    shape: 'hexagonal',            // Hex = HexIsle DNA
    features: [
      'QR code (links to project page + member profile)',
      'Compliant mechanism counter (tracks engagements)',
      'Project-specific design on face',
      'Universal LB logo on reverse',
      'Serial number (matches blockchain NFT if minted)',
    ],
    productionLevels: [
      { level: 1, name: 'SLA Prototype',       units: 10,      unitPrice: 50, method: 'Formlabs SLA' },
      { level: 2, name: 'Small Batch',          units: 100,     unitPrice: 30, method: 'Formlabs SLS / FDM' },
      { level: 3, name: 'Medium Run',           units: 1000,    unitPrice: 20, method: 'SLS Printing' },
      { level: 4, name: 'Desktop Injection',    units: 10000,   unitPrice: 15, method: 'Desktop injection molding' },
      { level: 5, name: 'Factory Tooling',      units: 100000,  unitPrice: 12, method: 'Injection molding' },
      { level: 6, name: 'Mass Production',      units: 1000000, unitPrice: 10, method: 'Mass injection + Cost+20%' },
    ],
  },

  // DaisyChainLink to ALL projects
  universalLink: true,
  linkType: 'medallion' as LinkType,

  // Economics
  economics: {
    creatorShare: 0.833,           // 83.3% to the designer/maker
    platformMargin: 0.20,         // Cost + 20%
    poolContribution: 0.3333,     // 33.33% of pledges → LB Funding Pool
    chainVotingBonus: 0.05,       // 5% stacking bonus per chain
    jouleRefundOnLevelUp: true,   // Early backers get Joule difference if price drops
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEXISLE PROJECT — Crown Jewel #3: Tereno Hydraulic
// ═══════════════════════════════════════════════════════════════════════════════

export const HEXISLE_PROJECT = {
  id: 'hexisle-tereno-001',
  name: 'HexIsle: Tereno Water Table',
  slug: 'hexisle',
  sku: 'LB-BRASS-HEXISLE-001',
  initiative: SWEET_SIXTEEN[15], // Brass Tacks (#16) — Manufacturing

  tagline: 'No batteries. No arguments. Just physics.',
  subtitle: 'Water-Powered Gaming Platform',
  crownJewel: 3,                 // Crown Jewel #3: Tereno Hydraulic
  domain: 'hexislo.com',         // Spanish spelling — intentional, NOT a typo

  description: `A physical, tactile strategy game played on hexagonal tiles with water
  channels. No screens. No batteries. Pure physics and strategy. The tiles interlock via
  "If It Fits, It Sits" (IIFIS) — if the piece physically fits in the hex, it's a legal move.
  Water flows through channels to power mechanisms and determine outcomes.
  Diceless combat. Real hydraulics. Made by the cooperative, for the cooperative.`,

  // Sub-products within HexIsle
  subProducts: {
    terrainTiles: {
      name: 'Tereno Tiles',
      description: 'Hexagonal terrain tiles with water channels',
      variants: ['Plains', 'Forest', 'Mountain', 'River', 'Ocean', 'Desert', 'City'],
      mechanism: 'IIFIS — If It Fits, It Sits',
      material: 'Resin (SLA/SLS) → Injection molded at scale',
    },
    characters: {
      name: 'Character Miniatures',
      roster: [
        { name: 'Navigator Frame', trait: 'Current-route specialist', scale: '28mm' },
        { name: 'Engineer Frame',  trait: 'Bridge and dam systems specialist', scale: '28mm' },
        { name: 'Tidecaller Frame', trait: 'Upper-current scouting specialist', scale: '28mm' },
      ],
      addYourOwn: true, // "Add Your Own" is ALWAYS the first card
      creatorRoyalty: 0.833,
    },
    waterTable: {
      name: 'The Water Table Base',
      description: 'Main game board with integrated water reservoir and pump system',
      mechanism: 'Gravity-fed hydraulic channels between hex tiles',
    },
    accessories: {
      name: 'Accessories',
      items: ['Fitted Coffers (storage)', 'IIFIS Boots (tile connectors)', 'Treasury Coins (scoring)'],
    },
  },

  // Manufacturing pipeline (DaisyChainLinked to Coaster Medallion)
  manufacturing: {
    designSoftware: 'Autodesk Fusion 360',
    currentStage: 'prototype',   // Idea → Prototype → Vote → Produce → Ship
    productionLevels: [
      { level: 1, price: 100, method: 'SLA Prototyping',           status: 'unlocked' },
      { level: 2, price: 85,  method: 'FDM Short Run',             status: 'voting' },
      { level: 3, price: 70,  method: 'SLS Printing',              status: 'locked' },
      { level: 4, price: 60,  method: 'Desktop Injection Molding',  status: 'locked' },
      { level: 5, price: 50,  method: 'Factory Tooling',           status: 'locked' },
      { level: 6, price: 40,  method: 'Mass Production (Cost+20%)', status: 'locked' },
    ],
    formlabsIntegration: {
      localAPI: 'PreFormServer — job submission to Form 4/3+',
      webAPI: 'Fleet monitoring, OAuth 2.0, cloud-based',
      pythonSDK: 'formlabs/formlabs-api-python (GitHub)',
      formNow: 'now.formlabs.com — on-demand overflow printing',
    },
    makerPivot: {
      description: 'Have a 3D printer? Become a Pioneer Node and manufacture tiles for your region.',
      requirements: ['Formlabs Form 3+ or Form 4', 'PreFormServer installed', 'Quality certification'],
      earnings: '83.3% of manufacturing margin',
    },
  },

  // 12 Cities (from TwelveCities.tsx)
  twelveCities: [
    'Aquilae', 'Tereno', 'Ventara', 'Pyralis', 'Glacium', 'Verdana',
    'Umbria', 'Solara', 'Abyssia', 'Nexara', 'Crystallum', 'Ethereon',
  ],

  // DaisyChainLinks
  daisyChainLinks: [
    { to: 'coaster-medallion-001', type: 'medallion' as LinkType, auto: true },
    // More links added dynamically as projects swap medallions
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// DAISY CHAIN OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a DaisyChainLink between two projects.
 * If one side is the Coaster Medallion, auto-activate (no acceptance needed).
 */
export function createDaisyChainLink(
  projectA: DaisyChainLink['projectA'],
  projectB: DaisyChainLink['projectB'],
  linkType: LinkType,
  createdBy: string,
): DaisyChainLink {
  const isMedallionLink = linkType === 'medallion' ||
    projectA.id === COASTER_MEDALLION_PROJECT.id ||
    projectB.id === COASTER_MEDALLION_PROJECT.id;

  return {
    id: `dcl-${projectA.id}-${projectB.id}-${Date.now()}`,
    linkType,
    status: isMedallionLink ? 'active' : 'proposed',
    projectA,
    projectB,
    chainVotingBonus: 0.05,       // Default 5%
    crossPurchaseCount: 0,
    jouleRewardsDistributed: 0,
    createdAt: new Date().toISOString(),
    createdBy,
    acceptedAt: isMedallionLink ? new Date().toISOString() : undefined,
    acceptedBy: isMedallionLink ? 'SYSTEM' : undefined,
    physicalMedallionEligible: true,
    coasterMedallionProjectId: COASTER_MEDALLION_PROJECT.id,
  };
}

/**
 * Auto-link the Coaster Medallion to ALL projects on the platform.
 * Called when a new project is created.
 */
export function autoLinkCoasterMedallion(
  newProject: DaisyChainLink['projectA'],
): DaisyChainLink {
  return createDaisyChainLink(
    {
      id: COASTER_MEDALLION_PROJECT.id,
      name: COASTER_MEDALLION_PROJECT.name,
      slug: COASTER_MEDALLION_PROJECT.slug,
      initiative: COASTER_MEDALLION_PROJECT.initiative.name,
      initiativeSlug: COASTER_MEDALLION_PROJECT.initiative.slug,
    },
    newProject,
    'medallion',
    'SYSTEM',
  );
}

/**
 * Calculate Chain Voting bonus for a user across linked projects.
 * 5% stacking per chain, caps at 100%, then sustains at 20%.
 */
export function calculateChainVotingBonus(
  projectsPurchased: string[],
  network: DaisyChainNetwork,
): { bonusPercentage: number; bonusJoules: number; chainLength: number } {
  // Find how many purchased projects are linked to each other
  const linkedPurchases = projectsPurchased.filter(pid =>
    network.links.some(link =>
      (link.projectA.id === pid || link.projectB.id === pid) &&
      link.status === 'active'
    )
  );

  const chainLength = linkedPurchases.length;

  // 5% per link, cap at 100% (20 links), then sustain at 20%
  let bonusPercentage: number;
  if (chainLength <= 20) {
    bonusPercentage = chainLength * 0.05;
  } else {
    bonusPercentage = 0.20; // Sustained rate after cap
  }

  return {
    bonusPercentage,
    bonusJoules: 0, // Calculated at transaction time based on purchase amount
    chainLength,
  };
}

/**
 * Get all projects linked to a given project (1st degree connections).
 */
export function getLinkedProjects(
  projectId: string,
  allLinks: DaisyChainLink[],
): Array<{ project: DaisyChainLink['projectA']; linkType: LinkType; bonus: number }> {
  return allLinks
    .filter(link =>
      link.status === 'active' &&
      (link.projectA.id === projectId || link.projectB.id === projectId)
    )
    .map(link => ({
      project: link.projectA.id === projectId ? link.projectB : link.projectA,
      linkType: link.linkType,
      bonus: link.chainVotingBonus,
    }));
}

/**
 * Generate the full DaisyChain network for a project.
 * Includes 2nd-degree reach calculation.
 */
export function buildDaisyChainNetwork(
  projectId: string,
  projectName: string,
  allLinks: DaisyChainLink[],
): DaisyChainNetwork {
  const directLinks = allLinks.filter(
    link => link.status === 'active' &&
    (link.projectA.id === projectId || link.projectB.id === projectId)
  );

  // 2nd degree: projects linked to my linked projects
  const firstDegreeIds = new Set(
    directLinks.map(link =>
      link.projectA.id === projectId ? link.projectB.id : link.projectA.id
    )
  );

  const secondDegreeLinks = allLinks.filter(link => {
    if (link.status !== 'active') return false;
    const hasFirstDegree = firstDegreeIds.has(link.projectA.id) || firstDegreeIds.has(link.projectB.id);
    const notSelf = link.projectA.id !== projectId && link.projectB.id !== projectId;
    return hasFirstDegree && notSelf;
  });

  const secondDegreeIds = new Set(
    secondDegreeLinks.flatMap(link => [link.projectA.id, link.projectB.id])
  );
  // Remove first-degree and self
  firstDegreeIds.forEach(id => secondDegreeIds.delete(id));
  secondDegreeIds.delete(projectId);

  return {
    centerId: projectId,
    centerName: projectName,
    links: directLinks,
    totalLinkedProjects: firstDegreeIds.size,
    totalCrossPurchases: directLinks.reduce((sum, l) => sum + l.crossPurchaseCount, 0),
    totalJouleRewards: directLinks.reduce((sum, l) => sum + l.jouleRewardsDistributed, 0),
    networkReach: firstDegreeIds.size + secondDegreeIds.size,
    isUniversalHub: projectId === COASTER_MEDALLION_PROJECT.id,
  };
}

/**
 * Get all initiatives that a project is linked to via DaisyChain.
 * Useful for showing "This project connects to 12 of 16 initiatives."
 */
export function getLinkedInitiatives(
  projectId: string,
  allLinks: DaisyChainLink[],
): Initiative[] {
  const linkedSlugs = new Set<string>();

  allLinks
    .filter(link =>
      link.status === 'active' &&
      (link.projectA.id === projectId || link.projectB.id === projectId)
    )
    .forEach(link => {
      const other = link.projectA.id === projectId ? link.projectB : link.projectA;
      linkedSlugs.add(other.initiativeSlug);
    });

  return SWEET_SIXTEEN.filter(init => linkedSlugs.has(init.slug));
}
