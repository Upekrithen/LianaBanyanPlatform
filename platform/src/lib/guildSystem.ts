/**
 * guildSystem.ts — Guild (NOID) Data Layer
 *
 * Guilds are Named Organizations of Interest & Discipline (NOIDs).
 * Members self-select into communities of interest — no questionnaires,
 * no forced selection. You choose where you belong.
 *
 * Innovation #1541 — Guild NOID System
 * Liana Banyan Platform
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GuildId =
  | "the-forge"
  | "the-scale"
  | "the-engine-room"
  | "the-war-table"
  | "the-ledger"
  | "the-crows-nest"
  | "the-quarterdeck";

export type GuildRole =
  | "explorer"
  | "apprentice"
  | "journeyman"
  | "master"
  | "founding_partner"
  | "reference_expert";

export type HandshakeStatus =
  | "proposed"
  | "accepted"
  | "in_progress"
  | "completed"
  | "declined";

export interface GuildPosition {
  id: string;
  title: string;
  type: "founding_partner" | "reference_expert" | "guild_member";
  description: string;
  marksCompensation: string;
  commitmentLevel: "full" | "part_time" | "advisory";
  requirements: string[];
  status: "open" | "filled" | "interviewing";
}

export interface Guild {
  id: GuildId;
  name: string;
  motto: string;
  icon: string;
  color: string;
  description: string;
  focus: string;
  partnerRole: string;
  partnerDescription: string;
  currentMembers: number;
  openPositions: GuildPosition[];
  cueCardId?: string;
}

export interface GuildMembership {
  guildId: GuildId;
  userId: string;
  role: GuildRole;
  joinedAt: string;
  marksEarned: number;
  contributionCount: number;
}

export interface HandshakeAgreement {
  id: string;
  guildId: GuildId;
  candidateName: string;
  candidateEmail?: string;
  positionId: string;
  status: HandshakeStatus;
  startDate: string;
  endDate: string;
  conversationsCompleted: number;
  totalConversations: number;
  maxHoursPerConversation: number;
  totalMaxHours: number;
  notes: string[];
  outcome?: "founding_partner" | "reference_expert" | "no_fit";
}

// ---------------------------------------------------------------------------
// The Handshake Protocol
// ---------------------------------------------------------------------------

export const HANDSHAKE_PROTOCOL = {
  name: "The Handshake",
  durationDays: 30,
  conversationsPerWeek: 2,
  maxHoursPerConversation: 3,
  totalConversations: 8,
  totalMaxHours: 24,
  description:
    "A 30-day mutual exploration between the Founder and a prospective " +
    "Guild partner. Eight conversations over four weeks — enough time to " +
    "discover whether the fit is real, without either side over-committing. " +
    "Marks compensation begins from the very first conversation.",
  terms: [
    "Both parties commit in writing before the first conversation",
    "2 conversations per week, up to 3 hours each, for 4 weeks",
    "Total commitment: 8 conversations, maximum 24 hours",
    "Marks compensation begins from conversation 1",
    "Either party may end the Handshake at any time",
    "After 30 days: Founder chooses outcome — Founding Partner, Reference Expert, or No Fit",
    "Reference Experts retain Guild standing and earn Marks for future contributions",
    "Founding Partners receive significant Marks allocation and core team status",
  ],
  marksForParticipation: 100,
  founderCommitment:
    "The Founder will be present, engaged, and transparent in every conversation.",
} as const;

// ---------------------------------------------------------------------------
// Guild Definitions
// ---------------------------------------------------------------------------

export const GUILDS: Guild[] = [
  // 1. The Forge — CAD / Mechanical Design
  {
    id: "the-forge",
    name: "The Forge",
    motto: "Where ideas become objects.",
    icon: "\u{1F525}", // fire
    color: "#f59e0b",
    description:
      "The Forge is where raw concepts are hammered into real, physical designs. " +
      "CAD modeling, mechanical engineering, prototyping, and the hexel piece " +
      "grammar all live here. If it has dimensions, The Forge builds it.",
    focus: "CAD modeling, mechanical design, prototyping, hexel piece grammar",
    partnerRole: "Fusion 360 Expert",
    partnerDescription:
      "A seasoned Fusion 360 professional who can translate the hexel piece " +
      "grammar into production-ready 3D models, manage parametric constraints, " +
      "and mentor the team on best practices for mechanical CAD.",
    currentMembers: 0,
    openPositions: [
      {
        id: "forge-fp-001",
        title: "Founding Partner — Fusion 360 Expert",
        type: "founding_partner",
        description:
          "Lead all CAD development for the hexel system. Build production-ready " +
          "models from the 27-piece grammar. Establish design standards and review " +
          "processes for mechanical components.",
        marksCompensation: "500 Marks/month",
        commitmentLevel: "full",
        requirements: [
          "5+ years professional Fusion 360 experience",
          "Portfolio of production-ready mechanical designs",
          "Experience with parametric modeling and design tables",
          "Ability to mentor junior designers",
          "Willingness to complete The Handshake (30-day mutual exploration)",
        ],
        status: "open",
      },
      {
        id: "forge-re-001",
        title: "Reference Expert — 3D Printing Specialist",
        type: "reference_expert",
        description:
          "Advise on material selection, print tolerances, and prototyping " +
          "workflows. Provide feedback on hexel piece designs for manufacturability.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "Professional 3D printing experience (FDM, SLA, or SLS)",
          "Understanding of design-for-manufacturing constraints",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
      {
        id: "forge-re-002",
        title: "Reference Expert — Materials Engineer",
        type: "reference_expert",
        description:
          "Guide material choices for hexel components across use cases — " +
          "land traps, water traps, educational kits. Advise on durability, " +
          "cost, and sustainability of material options.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "Background in materials science or mechanical engineering",
          "Experience evaluating plastics, composites, or metals for consumer products",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
    ],
  },

  // 2. The Scale — Law / IP / Compliance
  {
    id: "the-scale",
    name: "The Scale",
    motto: "Justice with precision.",
    icon: "\u{2696}\u{FE0F}", // balance scale
    color: "#6366f1",
    description:
      "The Scale safeguards the platform's legal foundations. Patent strategy, " +
      "compliance, cooperative law, SEC-safe language, and the Harper Guild's " +
      "truth-checking mandate all flow through here.",
    focus: "Patent law, IP strategy, cooperative compliance, SEC-safe language",
    partnerRole: "Patent Attorney + Business Attorney",
    partnerDescription:
      "Legal professionals who can manage a 2,097-claim patent portfolio, " +
      "navigate cooperative law, ensure SEC compliance for the three-currency " +
      "system, and provide strategic counsel as the platform scales.",
    currentMembers: 0,
    openPositions: [
      {
        id: "scale-fp-001",
        title: "Founding Partner — Patent Attorney",
        type: "founding_partner",
        description:
          "Own the patent strategy for 2,097 claims across 11 provisional " +
          "filings. Convert provisionals to non-provisionals. Identify white space " +
          "for new filings. Coordinate with the Founder on IP priorities.",
        marksCompensation: "500 Marks/month",
        commitmentLevel: "full",
        requirements: [
          "Registered patent attorney (USPTO)",
          "Experience with mechanical and software patents",
          "Comfort with micro-entity filings and provisional strategy",
          "Ability to work with a large, evolving patent portfolio",
          "Willingness to complete The Handshake (30-day mutual exploration)",
        ],
        status: "open",
      },
      {
        id: "scale-re-001",
        title: "Reference Expert — Cooperative Law Specialist",
        type: "reference_expert",
        description:
          "Advise on cooperative formation, governance structures, and " +
          "compliance with state and federal regulations for platform cooperatives.",
        marksCompensation: "200 Marks/month",
        commitmentLevel: "part_time",
        requirements: [
          "Experience with cooperative law or community-based legal structures",
          "Familiarity with SEC regulations around non-security instruments",
          "Available for 4-8 hours per month",
        ],
        status: "open",
      },
    ],
  },

  // 3. The Engine Room — Industrial / Manufacturing
  {
    id: "the-engine-room",
    name: "The Engine Room",
    motto: "Where production meets reality.",
    icon: "\u{2699}\u{FE0F}", // gear
    color: "#ef4444",
    description:
      "The Engine Room is where designs leave the screen and enter the real " +
      "world. Manufacturing processes, supply chain logistics, quality control, " +
      "and production scaling all happen here.",
    focus: "Manufacturing, production engineering, supply chain, quality control",
    partnerRole: "Industrial Mechanical Production Expert",
    partnerDescription:
      "A manufacturing veteran who understands injection molding, CNC machining, " +
      "assembly line design, and the bridge from prototype to mass production.",
    currentMembers: 0,
    openPositions: [
      {
        id: "engine-fp-001",
        title: "Founding Partner — Industrial Production Expert",
        type: "founding_partner",
        description:
          "Lead the transition from prototype hexel pieces to production-scale " +
          "manufacturing. Evaluate manufacturing partners, establish QC processes, " +
          "and design the production pipeline.",
        marksCompensation: "500 Marks/month",
        commitmentLevel: "full",
        requirements: [
          "10+ years in manufacturing or industrial engineering",
          "Experience with injection molding, CNC, or similar production methods",
          "Track record of scaling from prototype to production",
          "Supply chain management experience",
          "Willingness to complete The Handshake (30-day mutual exploration)",
        ],
        status: "open",
      },
      {
        id: "engine-re-001",
        title: "Reference Expert — Supply Chain Analyst",
        type: "reference_expert",
        description:
          "Advise on supplier selection, cost modeling, and logistics for " +
          "domestic and international manufacturing partnerships.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "Background in supply chain management or procurement",
          "Experience with cost analysis for physical goods",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
      {
        id: "engine-re-002",
        title: "Reference Expert — Quality Control Specialist",
        type: "reference_expert",
        description:
          "Establish quality standards for hexel components. Define inspection " +
          "criteria, tolerance acceptance ranges, and defect tracking processes.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "QC/QA experience in a manufacturing environment",
          "Familiarity with ISO standards or equivalent",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
    ],
  },

  // 4. The War Table — Gaming / Mechanics Design
  {
    id: "the-war-table",
    name: "The War Table",
    motto: "Strategy is everything.",
    icon: "\u{265F}\u{FE0F}", // chess pawn
    color: "#8b5cf6",
    description:
      "The War Table designs the game mechanics, progression systems, and " +
      "strategic layers that make the platform engaging. From the ghost world " +
      "to design battles, from badge systems to territory control — if it " +
      "plays, The War Table designed it.",
    focus: "Game mechanics, progression systems, strategic design, engagement loops",
    partnerRole: "Gaming Mechanics Expert",
    partnerDescription:
      "A game designer who understands economy balancing, progression curves, " +
      "engagement loops, and how to make complex systems feel intuitive and fun.",
    currentMembers: 0,
    openPositions: [
      {
        id: "war-fp-001",
        title: "Founding Partner — Gaming Mechanics Expert",
        type: "founding_partner",
        description:
          "Design and balance all game mechanics across the platform — the " +
          "ghost world, design battles, territory systems, badge progression, " +
          "and the three-currency economy as it intersects with gameplay.",
        marksCompensation: "500 Marks/month",
        commitmentLevel: "full",
        requirements: [
          "Professional game design experience (tabletop or digital)",
          "Strong understanding of economy balancing and progression systems",
          "Experience with community-driven gameplay mechanics",
          "Portfolio or examples of systems you have designed",
          "Willingness to complete The Handshake (30-day mutual exploration)",
        ],
        status: "open",
      },
      {
        id: "war-re-001",
        title: "Reference Expert — Narrative Designer",
        type: "reference_expert",
        description:
          "Help weave the platform lore — the literary canon, NPC personalities, " +
          "and world-building details — into cohesive, engaging narratives.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "Experience with narrative design or world-building",
          "Strong writing and storytelling skills",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
    ],
  },

  // 5. The Ledger — Finance / Business Operations
  {
    id: "the-ledger",
    name: "The Ledger",
    motto: "Every number tells a story.",
    icon: "\u{1F4D2}", // ledger
    color: "#10b981",
    description:
      "The Ledger manages the financial architecture of the platform. The " +
      "three-currency system (Credits, Marks, Joules), cost-plus pricing, " +
      "cooperative treasury mechanics, and financial transparency all live here.",
    focus: "Financial strategy, three-currency system, cooperative treasury, cost modeling",
    partnerRole: "CFO / Financial Strategist",
    partnerDescription:
      "A financial professional who can architect the economic layer of a " +
      "platform cooperative — from currency mechanics to treasury management " +
      "to financial reporting for a membership-driven organization.",
    currentMembers: 0,
    openPositions: [
      {
        id: "ledger-fp-001",
        title: "Founding Partner — Financial Strategist",
        type: "founding_partner",
        description:
          "Architect the financial systems for the three-currency economy. " +
          "Build treasury management processes, cost-plus pricing models, and " +
          "financial transparency reporting for cooperative members.",
        marksCompensation: "500 Marks/month",
        commitmentLevel: "full",
        requirements: [
          "CFO-level financial experience or equivalent",
          "Understanding of cooperative or membership-based financial models",
          "Experience with multi-currency or token-based economic systems",
          "Comfort with financial transparency and member reporting",
          "Willingness to complete The Handshake (30-day mutual exploration)",
        ],
        status: "open",
      },
      {
        id: "ledger-re-001",
        title: "Reference Expert — Tax & Compliance Advisor",
        type: "reference_expert",
        description:
          "Advise on tax implications of the three-currency system, cooperative " +
          "tax elections, and member contribution record reporting requirements.",
        marksCompensation: "200 Marks/month",
        commitmentLevel: "part_time",
        requirements: [
          "CPA or tax attorney credentials",
          "Familiarity with cooperative taxation (Subchapter T or equivalent)",
          "Available for 4-8 hours per month",
        ],
        status: "open",
      },
    ],
  },

  // 6. The Crow's Nest — Research / Discovery / Innovation
  {
    id: "the-crows-nest",
    name: "The Crow's Nest",
    motto: "See further. Know more.",
    icon: "\u{1F52D}", // telescope
    color: "#0ea5e9",
    description:
      "The Crow's Nest is where new ideas are spotted on the horizon. " +
      "Research, competitive analysis, academic partnerships, innovation " +
      "logging, and the THRESHING/POLLINATION cycle all happen here.",
    focus: "Research, innovation tracking, academic outreach, competitive analysis",
    partnerRole: "R&D Lead",
    partnerDescription:
      "A research-oriented professional who can run structured discovery " +
      "processes, evaluate emerging technologies, manage the innovation log, " +
      "and connect the platform with academic and industry research partners.",
    currentMembers: 0,
    openPositions: [
      {
        id: "crow-fp-001",
        title: "Founding Partner — R&D Lead",
        type: "founding_partner",
        description:
          "Lead structured research and discovery processes. Manage the " +
          "innovation log (1,540+ innovations and growing). Evaluate emerging " +
          "technologies for platform integration. Build academic and industry " +
          "research partnerships.",
        marksCompensation: "500 Marks/month",
        commitmentLevel: "full",
        requirements: [
          "Research background (academic or industry R&D)",
          "Experience managing innovation pipelines or patent research",
          "Strong analytical and documentation skills",
          "Network in relevant academic or technical communities",
          "Willingness to complete The Handshake (30-day mutual exploration)",
        ],
        status: "open",
      },
      {
        id: "crow-re-001",
        title: "Reference Expert — Academic Liaison",
        type: "reference_expert",
        description:
          "Connect the platform with university research programs, student " +
          "projects, and faculty collaborators. Identify grant opportunities " +
          "and co-research possibilities.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "Active connections to university engineering or business programs",
          "Experience with academic-industry partnerships",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
      {
        id: "crow-re-002",
        title: "Reference Expert — Technology Scout",
        type: "reference_expert",
        description:
          "Monitor emerging technologies in manufacturing, blockchain, AI, " +
          "and cooperative platforms. Provide monthly briefings on relevant " +
          "developments and opportunities.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "Broad technical literacy across multiple domains",
          "Habit of tracking technology trends and publications",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
    ],
  },

  // 7. The Quarterdeck — Leadership / Strategy / Operations
  {
    id: "the-quarterdeck",
    name: "The Quarterdeck",
    motto: "The ship needs a captain.",
    icon: "\u{2693}", // anchor
    color: "#dc2626",
    description:
      "The Quarterdeck is where strategy meets execution. Platform-wide " +
      "operations, leadership coordination, milestone tracking, and the " +
      "overall direction of Liana Banyan are steered from here.",
    focus: "Leadership, strategy, operations, milestone tracking, platform direction",
    partnerRole: "COO / CEO type",
    partnerDescription:
      "An operational leader who can translate vision into execution — " +
      "managing timelines, coordinating across guilds, tracking milestones, " +
      "and ensuring the platform ships on time and on mission.",
    currentMembers: 0,
    openPositions: [
      {
        id: "deck-fp-001",
        title: "Founding Partner — Operations Lead",
        type: "founding_partner",
        description:
          "Coordinate operations across all guilds. Manage milestone tracking, " +
          "cross-guild dependencies, and platform-wide priorities. Serve as " +
          "the operational counterpart to the Founder's vision.",
        marksCompensation: "500 Marks/month",
        commitmentLevel: "full",
        requirements: [
          "COO/CEO-level operational experience or equivalent",
          "Track record of shipping complex, multi-team projects",
          "Strong communication and coordination skills",
          "Comfort with ambiguity and rapid iteration",
          "Willingness to complete The Handshake (30-day mutual exploration)",
        ],
        status: "open",
      },
      {
        id: "deck-re-001",
        title: "Reference Expert — Project Management Advisor",
        type: "reference_expert",
        description:
          "Advise on project management frameworks, milestone structures, and " +
          "cross-team coordination patterns appropriate for a growing platform " +
          "cooperative.",
        marksCompensation: "150 Marks/month",
        commitmentLevel: "advisory",
        requirements: [
          "Senior project management experience (PMP, Agile, or equivalent)",
          "Experience managing distributed or remote teams",
          "Available for 2-4 hours per month of consultation",
        ],
        status: "open",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Look up a guild by its ID. Returns undefined if the guild is not found.
 */
export function getGuildById(id: GuildId): Guild | undefined {
  return GUILDS.find((g) => g.id === id);
}

/**
 * Return all open positions across all guilds, or for a specific guild.
 */
export function getGuildPositions(guildId?: GuildId): GuildPosition[] {
  const guilds = guildId ? GUILDS.filter((g) => g.id === guildId) : GUILDS;
  return guilds.flatMap((g) => g.openPositions);
}

/**
 * Create a new Handshake Agreement for a candidate and a specific guild position.
 * The agreement follows the HANDSHAKE_PROTOCOL timing and structure.
 */
export function createHandshakeAgreement(
  guildId: GuildId,
  positionId: string,
  candidateName: string,
  candidateEmail?: string
): HandshakeAgreement {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + HANDSHAKE_PROTOCOL.durationDays);

  return {
    id: `hs-${guildId}-${Date.now()}`,
    guildId,
    candidateName,
    candidateEmail,
    positionId,
    status: "proposed",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    conversationsCompleted: 0,
    totalConversations: HANDSHAKE_PROTOCOL.totalConversations,
    maxHoursPerConversation: HANDSHAKE_PROTOCOL.maxHoursPerConversation,
    totalMaxHours: HANDSHAKE_PROTOCOL.totalMaxHours,
    notes: [],
  };
}

/**
 * Generate a suggested conversation schedule for a Handshake Agreement.
 * Returns an array of { week, conversationNumber, suggestedDate } objects.
 */
export function getHandshakeSchedule(
  startDate: string
): Array<{
  week: number;
  conversationNumber: number;
  suggestedDate: string;
  label: string;
}> {
  const start = new Date(startDate);
  const schedule: Array<{
    week: number;
    conversationNumber: number;
    suggestedDate: string;
    label: string;
  }> = [];

  for (let week = 1; week <= 4; week++) {
    for (let conv = 1; conv <= HANDSHAKE_PROTOCOL.conversationsPerWeek; conv++) {
      const conversationNumber = (week - 1) * HANDSHAKE_PROTOCOL.conversationsPerWeek + conv;
      const dayOffset = (week - 1) * 7 + (conv === 1 ? 1 : 4); // Mon & Thu pattern
      const suggestedDate = new Date(start);
      suggestedDate.setDate(suggestedDate.getDate() + dayOffset);

      schedule.push({
        week,
        conversationNumber,
        suggestedDate: suggestedDate.toISOString(),
        label: `Week ${week}, Conversation ${conv} of 2 (Session ${conversationNumber} of ${HANDSHAKE_PROTOCOL.totalConversations})`,
      });
    }
  }

  return schedule;
}
