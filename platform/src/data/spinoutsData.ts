/**
 * Spinouts Data — Wave 6 Phase T
 * ================================
 * The 7 spinout entities for LianaBanyan. Spinouts are distinct commercial or
 * organizational entities that grow from cooperative roots but operate under
 * their own governance and legal structure.
 *
 * Canon: spinout_entities_NOT_initiatives (canonical_values.yaml)
 * Securities-clean: Marks = participation, not equity or guaranteed return.
 */

export interface SpinoutFeature {
  heading: string;
  points: string[];
}

export interface SpinoutBusinessPlan {
  problem: string;
  customers: string;
  offering: string;
  economics: string;
  ninetyDays: string[];
  legalGate?: string;
}

export interface SpinoutData {
  id: string;
  slug: string;
  slugAliases?: string[];
  number: number;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  category: string;
  color: string;
  features: SpinoutFeature[];
  businessPlan: SpinoutBusinessPlan;
  legalStatus: "forming" | "formed" | "active";
  heldForFounder?: boolean;
  canonRef?: string;
}

export const SPINOUTS: SpinoutData[] = [
  {
    id: "defense-klaus-spinout",
    slug: "defense-klaus",
    number: 1,
    name: "Defense Klaus (Spinout)",
    emoji: "🛡️",
    tagline: "Physical protection product + legal defense ecosystem",
    description:
      "Defense Klaus is a physical personal-protection product manufactured in the decentralized factory network. The $6 safety bracelet features deployable palm-claws and a GPS broadcast mechanism. 100% of product proceeds fund the shared legal-defense pool for all cooperative members. The spinout entity handles manufacturing contracts, IP, and the legal fund administration.",
    category: "Safety & Legal",
    color: "from-amber-500/20 to-yellow-600/20 border-amber-500/30",
    features: [
      {
        heading: "The Product",
        points: [
          "$6 safety bracelet with pull-up palm claws",
          "GPS broadcast activation for emergency location",
          "Made by member factory nodes",
          "Cost+20% production - nodes keep 83.3%",
        ],
      },
      {
        heading: "The Legal Fund",
        points: [
          "100% of proceeds fund the shared legal defense pool",
          "Every cooperative member has equal access",
          "No means-testing, no tiers",
          "Administered by the Defense Klaus spinout entity",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Individuals facing legal jeopardy - especially in underserved communities - cannot afford legal representation. The system is stacked against those who cannot pay.",
      customers:
        "All 2,270+ cooperative members are the first customers. Each bracelet purchase funds access to legal defense for themselves and every other member.",
      offering:
        "I help cooperative members protect themselves physically and legally so they never face danger or the legal system alone.",
      economics:
        "Product price: $6. Direct cost to factory: ~$3. Platform cost + margin (20%): $0.60. Legal fund deposit: $2.40. 100% of net proceeds fund the legal defense pool. Factory nodes earn 83.3% of the $3 manufacturing margin.",
      ninetyDays: [
        "Day 30: First factory node certified for Defense Klaus production",
        "Day 60: First 500 units produced and shipped to members",
        "Day 90: Legal fund holds first meaningful reserve; first legal-assist case documented",
      ],
      legalGate: "Held pending legal defense fund formation review",
    },
    legalStatus: "forming",
    heldForFounder: false,
    canonRef: "Defense Klaus - canonical_values.yaml spinout_entities",
  },

  {
    id: "battery-dispatch-spinout",
    slug: "battery-dispatch",
    number: 2,
    name: "Battery Dispatch (Spinout)",
    emoji: "⚡",
    tagline: "Cooperative energy dispatch network",
    description:
      "Battery Dispatch coordinates cooperative energy purchasing, local battery storage nodes, and demand-response pools. The spinout entity negotiates with utilities on behalf of member neighborhoods, operates the dispatch algorithm, and manages the cooperative energy reserve infrastructure.",
    category: "Energy & Infrastructure",
    color: "from-yellow-500/20 to-green-500/20 border-yellow-500/30",
    features: [
      {
        heading: "Energy Purchasing",
        points: [
          "Aggregate neighborhood demand for bulk utility rates",
          "Cooperative negotiation with regional energy suppliers",
          "Members pay at Cost+20% - savings over retail passed through",
          "Switzerland Protocol: no political agenda, just lower bills",
        ],
      },
      {
        heading: "Dispatch Network",
        points: [
          "Local battery storage nodes at member facilities",
          "Demand-response coordination reduces peak load costs",
          "Node operators earn from dispatch participation",
          "Grid resilience benefits whole neighborhoods",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Residential energy customers have zero negotiating power vs. utilities. Demand-response programs require scale. Individuals cannot participate meaningfully alone.",
      customers:
        "Member households in high-density cooperative neighborhoods. Initial focus: 50-household pilot blocks where aggregate demand creates negotiating leverage.",
      offering:
        "I help cooperative neighborhoods reduce energy costs and build grid resilience so members pay less and their streets survive outages.",
      economics:
        "Coordination fee: Cost+20% on energy savings generated. If the cooperative saves a household $400/year, the coordination fee is $80. The household keeps the remaining $320.",
      ninetyDays: [
        "Day 30: First pilot neighborhood demand-response pool formed (50+ households)",
        "Day 60: First utility negotiation meeting with aggregate member data",
        "Day 90: First batch rate negotiated and reported to member households",
      ],
    },
    legalStatus: "forming",
    canonRef: "Battery Dispatch - Wave 6 Phase T",
  },

  {
    id: "anchor-spinout",
    slug: "anchor",
    slugAliases: ["anchor-spinout"],
    number: 3,
    name: "Anchor (Spinout)",
    emoji: "⚓",
    tagline: "Persistent context for every conversation and contribution",
    description:
      "Anchor is the context-anchoring platform: every piece of content, conversation, or contribution on LianaBanyan can be bound to a permanent URN (Uniform Resource Name) through the yoke-bridge protocol. Anchors make ideas permanent, attributable, and buildable. Other members can reference, extend, and build upon your anchors, and you earn Marks every time they do. The IP-Ledger records every anchor as a provenance entry.",
    category: "Context & Provenance",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    features: [
      {
        heading: "Create an Anchor",
        points: [
          "Bind any content or conversation to a permanent yoke-bridge URN",
          "Format: urn:lb:anchor:<unique-id> -- permanent and portable",
          "Every anchor creates an IP-Ledger provenance entry automatically",
          "Marks awarded for anchors with high quality scores",
        ],
      },
      {
        heading: "Share & Build",
        points: [
          "Share an anchor URN across surfaces -- it travels via yoke-handoff protocol",
          "Other members build new anchors on top of yours (cite-and-extend)",
          "You earn Marks each time someone builds on your anchor",
          "NOT A FINANCIAL RETURN -- Marks = cooperative participation only",
        ],
      },
      {
        heading: "IP-Ledger Integration",
        points: [
          "Every anchor creation is a hash-chained ledger record",
          "Attribution is permanent and tamper-evident",
          "Provenance chain: who created, who extended, when, and in what order",
          "Available to all members for audit and reference",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Content and ideas on the internet are ephemeral, unattributed, and unverifiable. Conversations disappear, contributions are forgotten, and there is no durable provenance layer that ties ideas to their creators across time and surfaces.",
      customers:
        "Every LianaBanyan member who creates content, hosts conversations, or contributes to any initiative. Anchor serves as the provenance layer for the entire cooperative ecosystem.",
      offering:
        "I provide permanent, attributable, buildable context so that every cooperative contribution is anchored to its creator and traceable across the platform.",
      economics:
        "Anchor earns a coordination fee on external provenance verifications: Cost+20% per verification batch. Internal member use is included in membership. 83.3% of coordination fees flow to the Anchor operations team.",
      ninetyDays: [
        "Day 30: First 500 anchors created by early member cohort",
        "Day 60: IP-Ledger integration verified: every anchor produces a provenance record",
        "Day 90: First cross-surface anchor citation published (Anchor -> initiative page)",
      ],
    },
    legalStatus: "forming",
    canonRef: "Anchor - Wave 22 Phase B / yoke-bridge URN infrastructure",
  },

  {
    id: "cai-bonfire-spinout",
    slug: "cai-bonfire",
    slugAliases: ["cai-bonfire-spinout"],
    number: 4,
    name: "CAI Bonfire (Spinout)",
    emoji: "🔥",
    tagline: "The community AI gathering -- contribute, evaluate, improve together",
    description:
      "CAI Bonfire (#17 per BP041 Founder direct) is the cooperative AI community gathering. Members contribute prompts, training data, and evaluations to shared model improvement pools. Every contribution is logged in the IP-Ledger for provenance and attribution. Marks are earned for quality contributions -- NOT A FINANCIAL RETURN. Compute is priced at Cost+20% with full honest disclosure. Bonfire is Option B: community-owned AI development that serves, rather than extracts from, the communities that built it.",
    category: "Community AI",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    features: [
      {
        heading: "Contribute to the Bonfire",
        points: [
          "Submit prompts, training examples, or evaluation benchmarks",
          "Every contribution tracked via IP-Ledger provenance record",
          "Quality review by the Bonfire evaluation committee",
          "Marks for contributions that pass quality review",
        ],
      },
      {
        heading: "Compute at Cost+20%",
        points: [
          "All training runs priced at honest Cost+20% -- no margin games",
          "Members see the real compute cost before authorizing any run",
          "83.3% of coordination fees flow to the Bonfire operations team",
          "Cooperative compute pool: member nodes contribute capacity",
        ],
      },
      {
        heading: "Community Model Governance",
        points: [
          "Members vote on which model versions become canonical",
          "Open benchmarks published: any community can run and verify",
          "Option B: cooperative-class AI vs. extractive corporate AI",
          "NOT ONE of the 16 Sweet Sixteen -- a distinct legal entity",
        ],
      },
    ],
    businessPlan: {
      problem:
        "AI development is concentrated in entities optimizing for extraction. Communities contribute vast amounts of data and labor but receive none of the governance, attribution, or benefit. There is no community-owned alternative at scale.",
      customers:
        "All 2,270+ cooperative members who need AI tools for their businesses, initiative operations, and daily cooperative work. Also: academic researchers and other cooperative networks seeking Option B AI development.",
      offering:
        "I provide community-owned AI tools and training infrastructure so cooperative members can automate and scale without depending on extractive corporate AI platforms.",
      economics:
        "Compute: Cost+20% on all training and inference runs. Full cost disclosed before any run. Base model access: included in membership ($5/year). Specialized fine-tunes: Cost+20% per run. 83.3% of coordination fees to the Bonfire operations team. Marks = cooperative participation, NOT A FINANCIAL RETURN.",
      ninetyDays: [
        "Day 30: Bonfire research charter ratified by cooperative governance vote",
        "Day 60: First community benchmark dataset published and IP-Ledger logged",
        "Day 90: First open model released under cooperative license with provenance chain",
      ],
    },
    legalStatus: "forming",
    canonRef: "CAI Bonfire (#17 SPINOUT) - canonical_values.yaml / BP041 Founder direct",
  },

  {
    id: "mnemosynec-spinout",
    slug: "mnemosynec-spinout",
    slugAliases: ["mnemosyne-c"],
    number: 5,
    name: "MnemosyneC (Spinout)",
    emoji: "🧠",
    tagline: "Memory and knowledge management for cooperatives",
    description:
      "MnemosyneC is the knowledge-management and institutional-memory spinout of LianaBanyan. It provides the memory layer for cooperative operations: structured knowledge bases, provenance tracking, corpus management, and the benchmark infrastructure that proves cooperative AI quality. The spinout exemplar shows how cooperative technology can become a standalone entity.",
    category: "Knowledge & AI",
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    features: [
      {
        heading: "Memory Infrastructure",
        points: [
          "Structured knowledge bases for cooperative operations",
          "Provenance tracking: every claim traced to source",
          "Corpus management for organizational memory",
          "Integration with Librarian MCP for real-time context",
        ],
      },
      {
        heading: "The Spinout Exemplar",
        points: [
          "First spinout to go through the full formation process",
          "Blueprint for how cooperative tech becomes standalone entity",
          "Benchmark-verified: 92.7% / 3.6% Cardboard Boots figure",
          "Open architecture that other cooperatives can adopt",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Cooperatives and community organizations lose institutional knowledge constantly. There is no memory layer that is affordable, open, and built for community governance.",
      customers:
        "Other cooperatives, community land trusts, mutual aid networks, and any organization that needs durable memory without corporate lock-in.",
      offering:
        "I provide cooperative organizations with durable, provenance-tracked knowledge infrastructure so their institutional memory survives leadership transitions.",
      economics:
        "Subscription: Cost+20% on hosting and maintenance. Base tier: $20/month per organization. 83.3% to the MnemosyneC operations team.",
      ninetyDays: [
        "Day 30: MnemosyneC spinout charter filed",
        "Day 60: First external cooperative customer onboarded",
        "Day 90: Benchmark verification published to /proofs",
      ],
    },
    legalStatus: "forming",
    heldForFounder: false,
    canonRef: "MnemosyneC - mnemosynec.ai / dns-staging.config.ts",
  },

  {
    id: "polex-spinout",
    slug: "polex-spinout",
    number: 6,
    name: "PolEx (Spinout)",
    emoji: "🗳️",
    tagline: "Political Expedition - civic engagement infrastructure",
    description:
      "PolEx (Political Expedition) is the civic engagement spinout, operating under strict FEC advisory opinion and Hill Letter #5 compliance. It provides the infrastructure for non-partisan political tracking, voter education, and community civic action - connected to Power to the People initiative but operating as a distinct legal entity to maintain compliance.",
    category: "Civic & Political",
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    features: [
      {
        heading: "What PolEx Does",
        points: [
          "Non-partisan congressional and local government tracking",
          "Voter education infrastructure with cited sources",
          "Community civic engagement coordination",
          "Distinct legal entity: FEC AO + Hill Letter #5 compliant",
        ],
      },
      {
        heading: "Why It Is a Spinout",
        points: [
          "Strict FEC compliance requires separate legal structure",
          "5 domain areas require distinct governance",
          "Political activities cannot comingle with commercial cooperative",
          "Independence protects both the cooperative and the civic mission",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Non-partisan civic infrastructure is underfunded. Voter education tools are either partisan or corporate. The public square needs community-owned alternatives.",
      customers:
        "Cooperative members seeking civic engagement tools. Also: other cooperatives, libraries, and community organizations needing non-partisan political tracking.",
      offering:
        "I provide community organizations with non-partisan civic infrastructure so they can engage their members in democracy without becoming a political actor.",
      economics:
        "Licensing: Cost+20% on the platform tools for external organizations. Non-commercial use (members): included in membership. Grants from civic foundations supplement operations.",
      ninetyDays: [
        "Day 30: FEC advisory opinion filed (gates: FEC AO + HL#5)",
        "Day 60: Congressional tracking database populated for initial districts",
        "Day 90: First voter education module published for member review",
      ],
      legalGate: "Held pending FEC AO + Hill Letter #5 clearance",
    },
    legalStatus: "forming",
    heldForFounder: false,
    canonRef: "PolEx (Political Expedition) - canonical_values.yaml spinout_entities",
  },

  {
    id: "stand-in-the-gap",
    slug: "stand-in-the-gap",
    number: 8,
    name: "Stand in the Gap",
    emoji: "🤝",
    tagline: "Mutual aid when the market won't move at Cost+20%",
    description:
      "Stand in the Gap is the cooperative's mutual-aid engine. When a member needs something and the open market refuses to provide it at Cost+20% or better, the community steps in. Gap-fillers earn Marks for their contribution. Every solution that closes a gap becomes a documented platform knowledge asset in the IP-Ledger so the next person with the same need finds a path already lit.",
    category: "Mutual Aid",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    features: [
      {
        heading: "The Gap Flow",
        points: [
          "Any member posts a gap: what they need, the Cost+20% ceiling they can pay",
          "Community sees the open gap on the Gap Board",
          "Gap-fillers respond and fulfil the need within the ceiling",
          "Marks awarded to gap-fillers; gap logged to IP-Ledger as a knowledge asset",
        ],
      },
      {
        heading: "Why This Is a Spinout",
        points: [
          "Operates as a distinct entity to coordinate cross-initiative gaps",
          "Gap-fill knowledge assets are IP held by the cooperative, not one initiative",
          "Governance: Gap Review Council verifies fulfilment before Marks vest",
          "Securities-clean: Marks are participation, not equity or guaranteed return",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Markets routinely fail members in underserved areas, niche needs, or low-volume requests. The cooperative exists precisely because the market said no.",
      customers:
        "All 2,270+ cooperative members who hit a wall -- a need the market won't meet at a fair price. Also: the gap-fillers who earn Marks by stepping in.",
      offering:
        "I connect members who need something with members who can provide it, at Cost+20% or better, so no one in the cooperative is left without a path.",
      economics:
        "No platform fee on gap transactions. Cost+20% ceiling is enforced by the Gap Review Council. Marks for gap-fillers are minted by the cooperative treasury. Every closed gap is logged to the IP-Ledger as a reusable knowledge asset.",
      ninetyDays: [
        "Day 30: Gap Board live with first 10 open gaps posted by beta members",
        "Day 60: First 25 gaps closed, Marks awarded, IP-Ledger entries created",
        "Day 90: Gap pattern analysis published -- recurring gaps trigger initiative proposals",
      ],
    },
    legalStatus: "forming",
    heldForFounder: false,
    canonRef: "Stand in the Gap - Wave 23 Phase beta / spinout_entities",
  },

  {
    id: "harper-guild-spinout",
    slug: "harper-guild-spinout",
    number: 7,
    name: "Harper Guild (Spinout)",
    emoji: "⚖️",
    tagline: "Ethics and HR infrastructure for small cooperatives",
    description:
      "The Harper Guild spinout takes the cooperative's internal ethics and audit function and offers it as a service to external small businesses and cooperatives. Where the initiative provides internal cooperative auditing, the spinout sells Harper-quality ethics checking, HR infrastructure, and fact-verification services to the broader market.",
    category: "Ethics & HR",
    color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
    features: [
      {
        heading: "External Harper Services",
        points: [
          "Ethics audits for small cooperatives and businesses",
          "HR documentation and fair employment practice review",
          "Fact-verification services for community publications",
          "Dispute resolution using Harper protocols",
        ],
      },
      {
        heading: "The Spinout Model",
        points: [
          "Senior Harpers from the internal guild provide the service",
          "Harpers earn 83.3% of every external engagement fee",
          "Strict firewall between internal and external work",
          "External clients cannot influence internal cooperative audits",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Small cooperatives and businesses cannot afford HR departments or ethics consultants. They operate without the guardrails that prevent them from becoming exploitative.",
      customers:
        "Small cooperatives, worker-owned businesses, community land trusts, and non-profits in the 10-200 employee range who need ethics/HR support they cannot afford full-time.",
      offering:
        "I provide small cooperatives with Harper-quality ethics checking and HR support so they can operate fairly without the overhead of a full HR department.",
      economics:
        "Project-based: Cost+20% on Harper time. Estimated $500-$2,000 per engagement. Harpers keep 83.3%. Audit certifications: $250/year renewal.",
      ninetyDays: [
        "Day 30: First 3 external Harper engagements scoped and priced",
        "Day 60: Harper external work firewall protocol documented and reviewed",
        "Day 90: First external ethics audit completed and certification issued",
      ],
    },
    legalStatus: "forming",
    canonRef: "Harper Guild Spinout - Wave 6 Phase T",
  },

  {
    id: "map-and-compass-spinout",
    slug: "map-and-compass",
    number: 8,
    name: "Map & Compass (Spinout)",
    emoji: "🧭",
    tagline: "Navigate the platform and your real-world cooperative community",
    description:
      "Map & Compass is the wayfinding spinout: it helps members navigate both the LianaBanyan platform and their real-world cooperative community. Every member gets a visual onboarding path showing where they are and where they are going. Community resource maps surface local services, member skills, and initiative connections. Map & Compass integrates with unTech onboarding and every initiative page to ensure no member gets lost.",
    category: "Navigation & Onboarding",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    features: [
      {
        heading: "Your Onboarding Path",
        points: [
          "Visual path: where you are, what is next, what you have completed",
          "Integrates with unTech onboarding sequence automatically",
          "Personalized by role, skills, and initiative interests",
          "Step completion tracked and celebrated with Marks participation",
        ],
      },
      {
        heading: "Community Resource Map",
        points: [
          "Local services offered by member businesses and nodes",
          "Member skill directory: find who can help you with what",
          "Initiative connection map: which initiatives operate near you",
          "Cooperative wayfinding -- no corporate directory, no ads",
        ],
      },
      {
        heading: "Platform Navigation Layer",
        points: [
          "Contextual cue cards: the right information at the right moment",
          "Initiative discovery: find initiatives relevant to your situation",
          "Progress tracking across all cooperative participations",
          "Wayfinding API for third-party cooperative networks",
        ],
      },
    ],
    businessPlan: {
      problem:
        "Members join cooperatives with good intentions and then get lost. There is no wayfinding layer: no way to see where you are, what is next, or who around you can help. Good people disengage because the path is invisible.",
      customers:
        "All 2,270+ cooperative members who need onboarding navigation. External cooperatives and networks that want the Map & Compass wayfinding layer for their own communities.",
      offering:
        "I provide cooperative members with clear wayfinding -- a visual path through their onboarding, their community, and the platform -- so no one gets lost and everyone finds their next step.",
      economics:
        "Internal member wayfinding: included in $5/year membership. External cooperative licensing: Cost+20% on the platform tools. 83.3% of licensing fees to the Map & Compass operations team.",
      ninetyDays: [
        "Day 30: Onboarding path visualization live for all new members entering via unTech",
        "Day 60: Community resource map populated with first 100 member skill listings",
        "Day 90: First external cooperative network licensed the wayfinding API",
      ],
    },
    legalStatus: "forming",
    canonRef: "Map & Compass - Wave 22 Phase B / unTech onboarding integration",
  },
];

export const SPINOUTS_BY_SLUG: Record<string, SpinoutData> = (() => {
  const map: Record<string, SpinoutData> = {};
  for (const s of SPINOUTS) {
    map[s.slug] = s;
    for (const alias of s.slugAliases ?? []) {
      map[alias] = s;
    }
  }
  return map;
})();

export function getSpinout(slug: string): SpinoutData | null {
  return SPINOUTS_BY_SLUG[slug] ?? null;
}
