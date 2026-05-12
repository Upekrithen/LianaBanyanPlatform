/**
 * THE CROW'S NEST — Flyover Item Catalog
 * ========================================
 * ~40 curated items across 5 sections representing everything
 * the Liana Banyan platform offers. Each item provides content
 * at three inline depth levels (glimpse, peek, tell_me_more)
 * plus navigation links for deeper engagement (sample, show_me, to_go).
 *
 * All content is static TypeScript — zero API calls to browse.
 * SEC-safe language throughout (no speculative-finance or ownership-claim terms).
 */

// ============================================================================
// TYPES
// ============================================================================

export type CrowsNestSection =
  | "getting_started"
  | "sweet_sixteen"
  | "platform_mechanics"
  | "build_tools"
  | "world";

export interface ToGoItem {
  label: string;
  type: "read" | "watch" | "try" | "decide" | "share";
  route?: string;
  externalUrl?: string;
  estimatedMinutes?: number;
}

export interface CrowsNestItem {
  id: string;
  sectionId: CrowsNestSection;
  /** Lucide icon name */
  icon: string;
  title: string;
  /** ~25 words max, 10-second read */
  glimpse: string;
  /** ~75 words, 30-second read */
  peek: string;
  /** ~200 words, 1-2 minute read */
  tellMeMore: string;
  /** Route to the actual feature page */
  sampleRoute?: string;
  /** Route to guided tour (ShowMeHelp context) */
  showMeRoute?: string;
  /** Take-home action items */
  toGoItems?: ToGoItem[];
  /** Search/filter tags */
  tags: string[];
  /** Cross-reference IDs */
  relatedItemIds?: string[];
  /** Deep link to Cephas knowledge base */
  cephasUrl?: string;
  /** Access gate: ghost (everyone), member, or paid */
  requiredTier?: "ghost" | "member" | "paid";
}

export interface CrowsNestSectionDef {
  id: CrowsNestSection;
  title: string;
  subtitle: string;
  /** Lucide icon name */
  icon: string;
  sortOrder: number;
  /** Item IDs in display order */
  items: string[];
}

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

export const CROWS_NEST_SECTIONS: CrowsNestSectionDef[] = [
  {
    id: "getting_started",
    title: "Getting Started",
    subtitle: "Your first 5 minutes",
    icon: "Compass",
    sortOrder: 1,
    items: [
      "welcome",
      "how-it-works",
      "first-steps",
      "ghost-world",
      "cue-cards",
      "your-profile",
      "the-crows-nest",
    ],
  },
  {
    id: "sweet_sixteen",
    title: "The Sweet Sixteen",
    subtitle: "16 initiatives, one platform",
    icon: "Grid3x3",
    sortOrder: 2,
    items: [
      "lets-make-dinner",
      "lets-get-groceries",
      "lets-go-shopping",
      "household-concierge",
      "family-table",
      "health-accords",
      "msa",
      "defense-klaus",
      "rally-group",
      "vsl",
      "lets-make-bread",
      "harper-guild",
      "jukebox",
      "didasko",
      "power-to-the-people",
      "brass-tacks",
    ],
  },
  {
    id: "platform_mechanics",
    title: "Platform Mechanics",
    subtitle: "How the gears turn",
    icon: "Settings",
    sortOrder: 3,
    items: [
      "three-currencies",
      "c-plus-20",
      "guilds-and-handshake",
      "court-of-justice",
      "the-300-framework",
      "marks-differential",
      "deck-cards",
      "brewster-bonus",
      "as-you-wish",
      "seed-the-quan",
    ],
  },
  {
    id: "build_tools",
    title: "Build Tools",
    subtitle: "Make things, launch things",
    icon: "Wrench",
    sortOrder: 4,
    items: [
      "keeps",
      "lark-builder",
      "hexel-cad",
      "patent-system",
      "sponsor-portal",
      "cephas-knowledge-base",
    ],
  },
  {
    id: "world",
    title: "The World",
    subtitle: "Explore the virtual frontier",
    icon: "Globe",
    sortOrder: 5,
    items: [
      "hexisle",
      "hexisle-3d",
      "ghost-world-explore",
      "alcove-hallway",
      "beacon-system",
      "the-hexagon",
    ],
  },
];

// ============================================================================
// ITEMS — GETTING STARTED (5)
// ============================================================================

const GETTING_STARTED_ITEMS: CrowsNestItem[] = [
  {
    id: "welcome",
    sectionId: "getting_started",
    icon: "Hand",
    title: "Welcome to Liana Banyan",
    glimpse:
      "A cooperative platform where everyone benefits. The more people participate, the more everyone earns.",
    peek:
      "Liana Banyan is a cooperative — not a corporation. Members collectively govern the platform through the 300 Framework. Every transaction uses transparent Cost+20% pricing, meaning creators keep 83.3% of every sale. Three currencies (Credits, Marks, Joules) power everything. Membership costs $5.",
    tellMeMore:
      "Liana Banyan was founded by Jonathan Jones, a U.S. Army National Guard veteran (Infantry 11B, Aviation 15A) and father of eight. The platform operates sixteen interconnected initiatives — from food service (Let's Make Dinner) to music licensing (JukeBox) to virtual worlds (HexIsle). Every initiative shares the same three-currency system, the same cooperative governance, and the same constitutional pricing floor. The platform is designed so that growth benefits participants, not outside parties. There is no outside capital. The operating agreement locks Cost+20% permanently — the margin can never increase. Membership is $5 because the barrier should be low enough that anyone can walk through the door.",
    sampleRoute: "/",
    tags: ["overview", "cooperative", "introduction", "membership"],
    relatedItemIds: ["how-it-works", "three-currencies", "c-plus-20"],
    toGoItems: [
      { label: "Browse the platform homepage", type: "try", route: "/", estimatedMinutes: 3 },
      { label: "Read the 300 Framework paper", type: "read", route: "/cephas/academic/300-framework-tldr", estimatedMinutes: 10 },
    ],
  },
  {
    id: "how-it-works",
    sectionId: "getting_started",
    icon: "Lightbulb",
    title: "How It Works",
    glimpse:
      "Three paths: get a job (bounties), build a business (Cost+20%), or back a project (PreOrder).",
    peek:
      "The platform offers three main paths. Get a Job: find bounties (tasks) posted by members, complete work, earn Credits. Build a Business: sell products or services with transparent Cost+20% pricing. Back a Project: PreOrder fund innovations before they exist. You can do all three simultaneously. Most members start with one and expand over time.",
    tellMeMore:
      "Every path feeds into the same economy. When you complete a bounty, you earn Credits. When you sell through Cost+20%, your transparent pricing builds trust with buyers who can see exactly where their money goes. When you back a project through PreOrder Pledge, you commit to buying when it ships — no payment until delivery. The Handshake Protocol governs all professional relationships: 30 days to evaluate, three possible outcomes (continue, part ways, or extend). Guilds organize members by specialty. The Harper's Guild watches for ethical issues. The Court of Justice resolves disputes. Everything connects through the three currencies: Credits (spend), Marks (backed effort), and Joules (locked value storage).",
    sampleRoute: "/discover",
    tags: ["overview", "paths", "bounties", "pricing", "preorder"],
    relatedItemIds: ["welcome", "three-currencies", "guilds-and-handshake"],
    toGoItems: [
      { label: "Explore the three paths on the homepage", type: "try", route: "/", estimatedMinutes: 2 },
      { label: "Browse available bounties", type: "try", route: "/discover", estimatedMinutes: 5 },
    ],
  },
  {
    id: "first-steps",
    sectionId: "getting_started",
    icon: "Footprints",
    title: "First Steps",
    glimpse:
      "Walk the Alcove Hallway to learn the fundamentals. Drop Beacons to mark what interests you.",
    peek:
      "The Alcove Hallway is your guided path through 18 learning stops organized in three tiers: Foundation (what is LB, currencies, membership), Mechanics (Brewster Bonus, bidding, Golden Key), and Depth (Howey defense, patents, governance). Each stop earns Marks. Complete all 18 for the Founder's Forge badge. Drop Beacons anywhere to bookmark interesting spots.",
    tellMeMore:
      "Think of the Alcove Hallway as a museum corridor. Each alcove is a stopping point where you learn one concept. You cannot skip ahead — each stop unlocks the next. There are comprehension questions at each stop (basic, applied, synthesis) that earn escalating Marks. Complete a full tier of six stops and you earn a Pattern Key. The three Pattern Keys (Fledgling, Flight, Murder) unlock progressively deeper platform features. Beacons are your personal bookmarks — colored pins you drop anywhere (green for return, blue for important, yellow for decision, red for blocked). Your beacon trail persists across sessions. The Red Carpet invites you deeper when the system detects genuine engagement.",
    sampleRoute: "/learn",
    tags: ["learning", "alcove", "beacons", "onboarding", "marks"],
    relatedItemIds: ["alcove-hallway", "beacon-system", "marks-differential"],
    toGoItems: [
      { label: "Start the Alcove Hallway (Stop 1)", type: "try", route: "/learn", estimatedMinutes: 5 },
      { label: "Drop your first Beacon", type: "try", route: "/beacon", estimatedMinutes: 2 },
    ],
  },
  {
    id: "your-profile",
    sectionId: "getting_started",
    icon: "User",
    title: "Your Profile",
    glimpse:
      "Your portfolio, deck, beacon trail, and progress — all in one place. Ghost visitors can browse freely.",
    peek:
      "Ghosts (unregistered visitors) can explore freely — browsing, reading, dropping beacons, and collecting Crow Feathers. Members ($5) unlock their profile: a portfolio of completed work, a Deck of collected cards, their beacon trail history, and alcove progress. Paid members access premium features. All progress persists locally for ghosts and syncs across devices for members.",
    tellMeMore:
      "The platform uses a three-tier access model. Ghosts see everything marked public — they can browse all initiatives, read documentation, walk the Alcove Hallway, and get a genuine feel for the platform without creating an account. This is intentional: we want you to know exactly what you are joining before you spend $5. When you do join, your ghost progress (beacons, reading history, Crow Feathers) merges with your new member profile. Paid membership unlocks guild participation, bounty posting, business listing, and the Sponsor Portal. The Seamless Onboard system handles the transition — no separate registration wall, just a natural upgrade when you are ready.",
    sampleRoute: "/portfolio",
    requiredTier: "member",
    tags: ["profile", "portfolio", "ghost", "membership", "onboarding"],
    relatedItemIds: ["welcome", "first-steps", "deck-cards"],
    toGoItems: [
      { label: "Create your member profile", type: "try", route: "/auth", estimatedMinutes: 3 },
    ],
  },
  {
    id: "the-crows-nest",
    sectionId: "getting_started",
    icon: "Search",
    title: "The Crow's Nest",
    glimpse:
      "You're in it. Climb the mast, survey the horizon, cherry-pick what catches your eye.",
    peek:
      "The Crow's Nest is this guided discovery system. Browse everything the platform offers in quick glimpses, peek deeper at what interests you, queue items for later, and pack a To-Go bag of homework. The floating magnifying glass button opens it from any page. In the HexIsle world, the Crow's Nest is a physical lookout tower in the Harbor District.",
    tellMeMore:
      "Named after the nautical lookout platform atop a ship's mast, the Crow's Nest lets you survey the entire Liana Banyan horizon from one vantage point. Each item has six depth levels: Glimpse (10 seconds), Peek (30 seconds), Tell Me More (1-2 minutes), Sample (visit the actual page), Show Me (guided tour), and To-Go (take-home homework). Add items to your Queue (watchlist) to explore later. Pack action items into your To-Go Bag with time estimates. The Crow's Nest ties to the Crow Feathers reading-progress system — earn your sight before you earn your feathers. In the HexIsle 3D world, you can climb the physical Crow's Nest tower in Verdana's Harbor District and see the same items as landmarks on the horizon.",
    sampleRoute: "/crows-nest",
    tags: ["discovery", "navigation", "guide", "overview"],
    relatedItemIds: ["welcome", "how-it-works"],
  },
];

// ============================================================================
// ITEMS — THE SWEET SIXTEEN (16)
// ============================================================================

const SWEET_SIXTEEN_ITEMS: CrowsNestItem[] = [
  {
    id: "hexisle",
    sectionId: "world",
    icon: "Hexagon",
    title: "HexIsle",
    glimpse:
      "A virtual island world built on hexagonal terrain. Build, explore, govern, and trade across connected islands.",
    peek:
      "HexIsle is Liana Banyan's virtual world — hexagonal islands rising from a procedural ocean. Each island serves a function: Harvest (starter), Company (business), Treasure (rewards), and more. Build structures called Keeps, navigate between islands by ship, and govern through The Hexagon compound. The world renders in full 3D with a 2D overworld map and portal-based navigation.",
    tellMeMore:
      "HexIsle represents the physical geography of the platform's cooperative economy. Harvest Island is where everyone starts — the Port City of Verdana sits there with districts sampling all twelve city types (Tower of Peace, Harbor, Market Square, Canal Quarter, Forge Corner, and more). Players build hexagonal structures called Keeps that represent real projects, businesses, or community spaces. Each island has rentable real estate — storefronts, workshops, guild outposts. The Pipe Portal subway connects locations with Mario-style warp pipes (color-coded, skill-gated). The Canal Quarter offers Vienna-style waterways with gondola access and venue entrance fees. Everything in the virtual world maps to real platform features.",
    sampleRoute: "/hexisle",
    tags: ["gaming", "virtual-world", "hexagonal", "islands", "building"],
    relatedItemIds: ["hexisle-3d", "keeps", "the-hexagon"],
    toGoItems: [
      { label: "Visit HexIsle portal view", type: "try", route: "/hexisle", estimatedMinutes: 3 },
      { label: "Explore the 3D world", type: "try", route: "/hexisle/world-3d", estimatedMinutes: 5 },
    ],
  },
  {
    id: "c-plus-20",
    sectionId: "platform_mechanics",
    icon: "Calculator",
    title: "C+20 (Cost Plus 20%)",
    glimpse:
      "Constitutional pricing: sellers show their true cost, add exactly 20%. Creators keep 83.3%.",
    peek:
      "Cost+20% is the platform's pricing constitution. Every seller shows their true cost (materials, labor, overhead) and adds exactly 20%. The creator keeps 83.3% of the sale price. This margin is locked in the operating agreement — it can never increase. Buyers see complete transparency. The C+20 Calculator helps sellers verify their numbers and earn a certification badge.",
    tellMeMore:
      "Most platforms take 15-30% and raise fees over time. LB locks the margin permanently at Cost+20% (which means the platform's share is 16.7% of the sale price, or equivalently, the creator keeps 83.3%). This is constitutional — written into the cooperative's operating agreement, changeable only by supermajority vote. The system incentivizes honesty because transparent pricing builds customer trust. Sellers can offer both C+20 and regular pricing side by side. The anonymous volume feature (AVA) protects pricing privacy when needed. The Howey defense depends on this structure: because there is no expectation of financial return from the efforts of others, the cooperative's instruments are not securities.",
    sampleRoute: "/c20",
    tags: ["pricing", "transparency", "economics", "cost", "margin"],
    relatedItemIds: ["three-currencies", "brewster-bonus"],
    toGoItems: [
      { label: "Try the C+20 Calculator", type: "try", route: "/c20", estimatedMinutes: 5 },
      { label: "Read the Cost+20% paper", type: "read", route: "/cephas/academic/cost-plus-20", estimatedMinutes: 10 },
    ],
  },
  {
    id: "ghost-world",
    sectionId: "getting_started",
    icon: "Ghost",
    title: "Ghost World",
    glimpse:
      "Explore the platform freely as a Ghost before committing. No registration required.",
    peek:
      "Ghost World is the unregistered visitor experience. Browse all public content, walk the Alcove Hallway, read Cephas articles, collect Crow Feathers, and drop Beacons — all without creating an account. Your progress saves locally and merges with your member profile when you join. The Ghost icon is the 'you are here' marker in the overworld.",
    tellMeMore:
      "Most platforms lock content behind registration walls. LB does the opposite: Ghost World lets you experience nearly everything before spending $5. This is deliberate — the Founder believes you should know exactly what you are joining. Ghosts can browse initiatives, read the 300 Framework, explore HexIsle's portal view, and get a real feel for the cooperative's philosophy. The Seamless Onboard system tracks engagement naturally. When a ghost encounters a members-only feature, a gentle prompt explains what membership unlocks — no aggressive upsells, no dark patterns. Ghost data (beacons, reading progress, to-go items) persists in localStorage and auto-merges on registration.",
    sampleRoute: "/ghost",
    tags: ["exploration", "free", "onboarding", "unregistered"],
    relatedItemIds: ["welcome", "your-profile", "first-steps"],
    toGoItems: [
      { label: "Enter Ghost World", type: "try", route: "/ghost", estimatedMinutes: 5 },
    ],
  },
  {
    id: "cue-cards",
    sectionId: "getting_started",
    icon: "Layers",
    title: "Cue Cards & Deck System",
    glimpse:
      "Collect cards representing concepts, achievements, and tools. Unlock all four corner locks to master each card.",
    peek:
      "Every major concept on the platform is a Cue Card with four corner locks. Unlock all four to collect it in your Deck. Cards come in seven rarity tiers (Common through Mythic) with distinct visual treatments. Your Deck is your portfolio of mastered concepts. Deck Cards can bypass costs and unlock features throughout the platform — like skip tickets in the Canal Quarter.",
    tellMeMore:
      "The Cue Card system turns platform literacy into a collectible game. Each card has a front (artwork, rarity border, title) and a back (instructions, destination link, action). The four corner locks represent four different ways to engage with that concept: reading about it, trying it, teaching it to someone else, and passing a comprehension check. Cards are both learning tools and access tokens — holding certain cards unlocks features, bypasses fees, or grants guild privileges. The Deck Collection page shows all your collected cards organized by rarity and category. Cards tie into the broader economy through the Deck Card bypass system: present the right card at a Pipe Portal and ride free, or flash your card at a Canal Quarter venue for complimentary entry.",
    sampleRoute: "/cue-cards",
    tags: ["cards", "collection", "learning", "achievements", "rarity"],
    relatedItemIds: ["deck-cards", "alcove-hallway", "beacon-system"],
    toGoItems: [
      { label: "Browse the Cue Card studio", type: "try", route: "/cue-cards", estimatedMinutes: 3 },
      { label: "Check your Deck collection", type: "try", route: "/deck", estimatedMinutes: 2 },
    ],
  },
  {
    id: "lets-make-dinner",
    sectionId: "sweet_sixteen",
    icon: "ChefHat",
    title: "Let's Make Dinner",
    glimpse:
      "Community-powered food service. Chefs, kitchens, and diners connected through transparent pricing.",
    peek:
      "Let's Make Dinner connects local chefs, commercial kitchens, and hungry community members through Cost+20% pricing. Chefs register as service nodes, list their menus, and diners order meals knowing exactly what they cost to make. Group cooking sessions (Family Table) let communities cook together. The Pantry provides bulk ingredient sourcing at volume pricing.",
    tellMeMore:
      "This initiative reimagines food service. Instead of restaurants with opaque pricing and razor-thin margins, Let's Make Dinner creates a transparent food network. Chefs show their true costs (ingredients, labor, kitchen rental) and add exactly 20%. Diners choose chefs by cuisine, price, ratings, and proximity. Commercial kitchens list available time slots. The Family Table sub-initiative organizes group cooking sessions where communities cook together and share meals. The Pantry handles bulk purchasing — when the network buys ingredients at volume, savings pass directly to chefs and diners. Lifeline Medications (a sibling initiative) applies the same model to prescription costs.",
    sampleRoute: "/initiatives/lets-make-dinner",
    tags: ["food", "community", "cooking", "chefs", "transparent-pricing"],
    relatedItemIds: ["c-plus-20", "family-table", "rally-group"],
    toGoItems: [
      { label: "Browse the chef marketplace", type: "try", route: "/initiatives/lets-make-dinner/chefs", estimatedMinutes: 3 },
      { label: "Learn about Family Table sessions", type: "try", route: "/initiatives/family-table", estimatedMinutes: 3 },
    ],
  },
  {
    id: "lets-get-groceries",
    sectionId: "sweet_sixteen",
    icon: "ShoppingCart",
    title: "Let's Get Groceries",
    glimpse:
      "Grocery co-op with bulk purchasing power. Cost+20% on groceries. Member-owned distribution and same-day local delivery.",
    peek:
      "Let's Get Groceries brings cooperative economics to grocery shopping. Bulk purchasing power lowers costs for everyone. True cost plus 20% — no hidden markups. Member-owned distribution network. Same-day local delivery. Credits and Marks accepted. Integrates with The Pantry and Let's Make Dinner for meal planning.",
    tellMeMore:
      "Let's Get Groceries is the grocery co-op initiative. Members pool purchasing power to buy at volume; savings pass through at Cost+20% pricing. The network supports member-owned distribution — not a corporate supply chain. Same-day local delivery connects neighborhoods. You can pay with Credits (purchased) or Marks (earned through participation). The initiative ties into The Pantry for bulk ingredient sourcing and Let's Make Dinner for meal planning. Transparent pricing at every step.",
    sampleRoute: "/initiatives/lets-get-groceries",
    tags: ["groceries", "co-op", "bulk", "delivery", "cost-plus-20"],
    relatedItemIds: ["lets-make-dinner", "household-concierge", "c-plus-20"],
    toGoItems: [
      { label: "Explore Let's Get Groceries", type: "try", route: "/initiatives/lets-get-groceries", estimatedMinutes: 3 },
    ],
  },
  {
    id: "lets-go-shopping",
    sectionId: "sweet_sixteen",
    icon: "Store",
    title: "Let's Go Shopping",
    glimpse:
      "The cooperative marketplace. Creators keep 83.3%. No algorithm manipulation. Quality curation by Harper Guild.",
    peek:
      "Let's Go Shopping is the cooperative marketplace — Etsy-style but cooperative. Every sale uses Cost+20%: creators keep 83.3%. No algorithm manipulation; quality curation by Harper Guild. Cross-initiative product listings. Discover goods from every initiative in one place.",
    tellMeMore:
      "Let's Go Shopping is the platform's unified marketplace. Sellers list products and services at transparent Cost+20% pricing. Creators keep 83.3% of every transaction. The Harper Guild curates for quality and fairness — no black-box algorithms favoring paid promotion. Listings span all initiatives: food, crafts, services, digital goods. Buy with Credits or (where applicable) Marks. The marketplace connects to Let's Make Bread for seller onboarding and Household Concierge for local delivery coordination.",
    sampleRoute: "/initiatives/lets-go-shopping",
    tags: ["marketplace", "shopping", "creators", "curation", "cost-plus-20"],
    relatedItemIds: ["harper-guild", "lets-make-bread", "c-plus-20"],
    toGoItems: [
      { label: "Browse the marketplace", type: "try", route: "/initiatives/lets-go-shopping", estimatedMinutes: 3 },
    ],
  },
  {
    id: "lets-make-bread",
    sectionId: "sweet_sixteen",
    icon: "Building2",
    title: "Let's Make Bread",
    glimpse:
      "The business incubator. Launch your idea with cooperative infrastructure, mentoring, and transparent economics.",
    peek:
      "Let's Make Bread is the platform's business incubator — not literal baking. Bring your business idea, and the cooperative provides infrastructure (payment processing, transparent pricing, customer network), mentoring through guild connections, and the Cost+20% framework. Start with one item, test for 30 days, compare results. The Forge Corner in HexIsle is the virtual workshop.",
    tellMeMore:
      "Traditional incubators take large stakes in your company. Let's Make Bread takes nothing — you use the cooperative's infrastructure at Cost+20% and keep everything you build. The four-step process: (1) Pick ONE item to price transparently, (2) Calculate your true cost and add 20%, (3) List it alongside your regular pricing, (4) Track results for 30 days. The platform provides the stage — as the saying goes, 'You have a Play, I have a Stage.' Guild mentors match with new businesses by specialty. The Handshake Protocol governs all professional relationships. Didasko (the teaching initiative) provides skill-building workshops. Academy Terrace in HexIsle is the virtual classroom.",
    sampleRoute: "/initiatives/bread",
    tags: ["business", "incubator", "entrepreneurship", "mentoring"],
    relatedItemIds: ["c-plus-20", "guilds-and-handshake", "sponsor-portal"],
    toGoItems: [
      { label: "Visit Let's Make Bread", type: "try", route: "/initiatives/bread", estimatedMinutes: 3 },
    ],
  },
  {
    id: "rally-group",
    sectionId: "sweet_sixteen",
    icon: "Users",
    title: "Rally Group",
    glimpse:
      "Community organizing that turns collective attention into cooperative action.",
    peek:
      "Rally Group is the platform's community organizing initiative. Members rally around causes, projects, and collective goals. The Radio Contest mechanic applies: 2/3 open participation plus 1/3 reserved for smaller voices. Attention beats capital — showing up early and staying engaged matters more than spending power. Rally Groups can spawn bounties, fund projects, and coordinate real-world action.",
    tellMeMore:
      "Rally Groups are the cooperative's civic muscle. When enough members care about something — a neighborhood project, a policy proposal, a community need — they form a Rally Group. The group uses the platform's voting system (senate mechanics) to make decisions, coordinates through The Battery (timed content dispatch), and funds action through collective PreOrder Pledges. The Radio Contest ensures that small participants get guaranteed representation: one-third of all rally positions are reserved for members who otherwise would be drowned out by larger voices. This is structural fairness — built into the protocol, not enforced by goodwill.",
    sampleRoute: "/initiatives/rally-group",
    tags: ["community", "organizing", "voting", "collective-action"],
    relatedItemIds: ["as-you-wish", "court-of-justice", "power-to-the-people"],
    toGoItems: [
      { label: "Explore Rally Group", type: "try", route: "/initiatives/rally-group", estimatedMinutes: 3 },
    ],
  },
  {
    id: "jukebox",
    sectionId: "sweet_sixteen",
    icon: "Music",
    title: "JukeBox",
    glimpse:
      "Music licensing and One Take Wonders. Artists keep 83.3% through transparent licensing.",
    peek:
      "JukeBox handles music licensing through Cost+20% economics. Artists list their work with transparent costs, licensees pay fair rates, and everyone sees the math. One Take Wonders showcases live single-take performances — raw talent, no studio polish. The Canal Quarter in HexIsle features music halls and performance venues where JukeBox content comes alive.",
    tellMeMore:
      "The music industry is famously opaque about licensing costs and royalty splits. JukeBox applies the same Cost+20% transparency to music: artists show what it costs to produce and license their work, add 20%, and keep 83.3% of every transaction. One Take Wonders is the flagship format — single-take live performances that prove talent without studio engineering. These performances become licensable content on the platform. The Canal Quarter in HexIsle's Port City has music halls, galleries, and clubs where JukeBox content is experienced in-world. Artists can book virtual venues, charge entrance fees (1-3 Credits), and offer all-access passes.",
    sampleRoute: "/initiatives/jukebox",
    tags: ["music", "licensing", "artists", "performance", "one-take"],
    relatedItemIds: ["c-plus-20", "lets-make-bread"],
    toGoItems: [
      { label: "Visit JukeBox", type: "try", route: "/initiatives/jukebox", estimatedMinutes: 3 },
    ],
  },
  {
    id: "didasko",
    sectionId: "sweet_sixteen",
    icon: "GraduationCap",
    title: "Didasko",
    glimpse:
      "Learn and teach on the same platform. Earn Marks for study bounties. Community-driven courses and skill certification.",
    peek:
      "Didasko is the education initiative. Learn and teach on the same platform. Earn Marks while learning through study bounties. Community-driven courses. Skill certification through peer validation. Academic bounties for research contributions.",
    tellMeMore:
      "Didasko turns education into participation. Members create and take courses; completion and quality are verified by peers. Study bounties reward learners with Marks. Teachers earn through Cost+20% pricing on courses and tutoring. Skill certification is peer-validated — no single authority. Academic bounties fund research and documentation that benefits the whole cooperative. The initiative connects to Let's Make Bread (business skills), Harper Guild (ethics training), and the Cephas knowledge base. Learning is a form of contribution; contribution earns Marks.",
    sampleRoute: "/initiatives/didasko",
    tags: ["education", "learning", "teaching", "bounties", "certification"],
    relatedItemIds: ["lets-make-bread", "harper-guild", "marks-differential"],
    toGoItems: [
      { label: "Explore Didasko", type: "try", route: "/initiatives/didasko", estimatedMinutes: 3 },
    ],
  },
  {
    id: "household-concierge",
    sectionId: "sweet_sixteen",
    icon: "Home",
    title: "Household Concierge",
    glimpse:
      "A shared butler for YOUR household. Coordinate chores, groceries, meals, and services.",
    peek:
      "Household Concierge is a shared butler service for your household — not a neighborhood program. It coordinates household operations: chore schedules, grocery lists (integrated with The Pantry), meal planning (connected to Let's Make Dinner), and service provider matching. MatchTrade connects households for skill swaps ('I'll babysit if you fix my AC').",
    tellMeMore:
      "Running a household is a full-time job that nobody gets paid for. Household Concierge applies cooperative economics to domestic operations. The service coordinates grocery sourcing through The Pantry's bulk purchasing network, connects with local chefs through Let's Make Dinner, matches service providers through MatchTrade (direct skill-for-skill exchanges without currency), and manages household schedules. The key innovation is that YOUR household is the unit — this is not a neighborhood association or community program. Each household runs its own concierge instance, but benefits from the cooperative's collective purchasing power and service network. Garage sales connect through the Family Table's community marketplace.",
    sampleRoute: "/initiatives/household-concierge",
    tags: ["household", "services", "groceries", "chores", "matchtrade"],
    relatedItemIds: ["lets-make-dinner", "family-table"],
    toGoItems: [
      { label: "Explore Household Concierge", type: "try", route: "/initiatives/household-concierge", estimatedMinutes: 3 },
    ],
  },
  {
    id: "vsl",
    sectionId: "sweet_sixteen",
    icon: "Receipt",
    title: "VSL (Voucher Short Loans)",
    glimpse:
      "Short-term voucher-based lending. Borrow against your earned Credits for immediate needs.",
    peek:
      "Voucher Short Loans let members borrow against their earned Credits for short-term needs. This is not traditional lending — it is a voucher system backed by your verified platform participation. No interest charges. The cooperative's Medical Savings Accounts (MSA) sub-initiative handles medical expense vouchers specifically. Marks clear through participation, not payment.",
    tellMeMore:
      "Traditional short-term loans (payday lending) carry predatory interest rates. VSL replaces this with a voucher system where your platform participation history backs the loan. If you have earned Credits through bounties, business sales, or backed projects, you can draw a short-term voucher against that history. The voucher is denominated in Marks (effort-debt currency), which you clear through continued participation — not through interest payments. The system is designed to bridge gaps, not create debt cycles. Medical Savings Accounts (MSA) apply the same model specifically to medical expenses. The Brewster Bonus rewards members who clear their Marks efficiently.",
    sampleRoute: "/initiatives/vsl",
    tags: ["lending", "vouchers", "short-term", "medical", "msa"],
    relatedItemIds: ["three-currencies", "marks-differential", "brewster-bonus"],
    toGoItems: [
      { label: "Learn about VSL", type: "try", route: "/initiatives/vsl", estimatedMinutes: 3 },
    ],
  },
  {
    id: "harper-guild",
    sectionId: "sweet_sixteen",
    icon: "Shield",
    title: "Harper's Guild",
    glimpse:
      "Ethics checkers and truth-tellers. The cooperative's elite taskforce: Analyze, Assess, Advise.",
    peek:
      "The Harper's Guild is LB's ethics and truth-verification taskforce. Harpers are embedded undercover throughout the platform — in Inns, Taverns, shops, and community spaces. Their mission: Analyze (observe), Assess (evaluate), and Advise (recommend action). They carry a subtle guild badge visible on hover. The Underground Railroad runs beneath The Ramparts for protected communication.",
    tellMeMore:
      "Every organization needs people who tell the truth when it is uncomfortable. The Harper's Guild fills this role. Harpers are volunteer members who undergo ethics training and agree to a code of conduct focused on fairness, transparency, and protection of vulnerable participants. They operate both openly (at guild meetings, in the Court of Justice) and embedded (undercover in community spaces, monitoring for predatory behavior, scams, or manipulation). In HexIsle, Harpers appear as regular NPCs but carry a subtle guild badge that appears on hover. The Underground Railroad network provides protected communication channels when sensitive issues need escalation. Harpers report to the Court of Justice and can recommend sanctions, mediation, or intervention.",
    sampleRoute: "/initiatives/harper-guild",
    tags: ["ethics", "truth", "verification", "protection", "guild"],
    relatedItemIds: ["court-of-justice", "guilds-and-handshake", "defense-klaus"],
    toGoItems: [
      { label: "Visit Harper's Guild", type: "try", route: "/initiatives/harper-guild", estimatedMinutes: 3 },
    ],
  },
  {
    id: "power-to-the-people",
    sectionId: "sweet_sixteen",
    icon: "Zap",
    title: "Power to the People",
    glimpse:
      "The political expedition. Cooperative civics applied to real-world governance and community action.",
    peek:
      "Power to the People is LB's political expedition initiative. It applies cooperative principles to civic engagement: transparent campaign financing (Cost+20% applied to political spending), community organizing (Rally Groups), and democratic decision-making (Senate voting mechanics). Worker participation (not financial stakes) in governance decisions.",
    tellMeMore:
      "This initiative takes the cooperative's internal governance tools and points them outward. The Senate voting system — already used for internal platform decisions — becomes a template for community governance. Rally Groups organize around civic issues. The 300 Framework's capacity allocation model shows how resources can be distributed transparently. Campaign financing gets the Cost+20% treatment: every dollar spent is visible, costs are transparent, and the community can see exactly where political resources flow. The Underground Railroad (Harper's Guild network) provides protected channels for whistleblowers and activists. This is not a political party — it is a toolkit for participatory democracy.",
    sampleRoute: "/initiatives/power-to-the-people",
    tags: ["politics", "civics", "governance", "democracy", "community"],
    relatedItemIds: ["rally-group", "court-of-justice", "the-300-framework"],
    toGoItems: [
      { label: "Visit Power to the People", type: "try", route: "/initiatives/power-to-the-people", estimatedMinutes: 3 },
    ],
  },
  {
    id: "brass-tacks",
    sectionId: "sweet_sixteen",
    icon: "Wrench",
    title: "Brass Tacks",
    glimpse:
      "Manufacturing and hardware. Get things physically made. Distributed manufacturing network. Prototype to production at Cost+20%.",
    peek:
      "Brass Tacks is the manufacturing and hardware initiative. Get things physically made through the distributed manufacturing network. Connects with HexIsle printers and fabrication. Quality assurance through the test-pilot program. From prototype to production at Cost+20%.",
    tellMeMore:
      "Brass Tacks handles physical manufacturing on the platform. Members submit designs; the network of makers, printers, and fabricators produces at transparent Cost+20% pricing. The initiative connects to HexIsle for 3D printing and desktop fabrication. Quality is assured through a test-pilot program — independent verification before scale. From single prototypes to short runs, the same pricing and participation rules apply. Creators keep 83.3%; the platform takes cost plus 20%. No venture subsidies; the economics work from day one.",
    sampleRoute: "/initiatives/brass-tacks",
    tags: ["manufacturing", "hardware", "making", "prototype", "cost-plus-20"],
    relatedItemIds: ["hexisle", "lets-make-bread", "c-plus-20"],
    toGoItems: [
      { label: "Explore Brass Tacks", type: "try", route: "/initiatives/brass-tacks", estimatedMinutes: 3 },
    ],
  },
  {
    id: "family-table",
    sectionId: "sweet_sixteen",
    icon: "Utensils",
    title: "Family Table",
    glimpse:
      "PRIVATE family operations hub. Meals, schedules, budgets, and traditions for YOUR family.",
    peek:
      "Family Table is the private operations hub for your family — not a community program. It manages meal planning, family budgets, schedules, traditions, and group cooking sessions. Connected to Let's Make Dinner for chef services and The Pantry for groceries. Garage sales and community marketplace features. The Founder has eight kids — this was built from real need.",
    tellMeMore:
      "Family Table exists because the Founder has eight children (four grown and on their own, four still at home) and needed a tool to manage household operations. It coordinates meal planning with the Let's Make Dinner chef network, connects to The Pantry for bulk grocery purchasing, manages family budgets through the three-currency system, and preserves family traditions and recipes. Group cooking sessions bring families together around food. The garage sales feature connects to the broader community marketplace. This is intentionally private — your family's data, your family's operations, your family's business. The platform provides the infrastructure; you control everything.",
    sampleRoute: "/initiatives/family-table",
    tags: ["family", "private", "meals", "budget", "household"],
    relatedItemIds: ["lets-make-dinner", "household-concierge"],
    toGoItems: [
      { label: "Visit Family Table", type: "try", route: "/initiatives/family-table", estimatedMinutes: 3 },
    ],
  },
  {
    id: "defense-klaus",
    sectionId: "sweet_sixteen",
    icon: "ShieldCheck",
    title: "Defense Klaus",
    glimpse:
      "Platform security and member protection. Visible guard stations plus undercover Harper network.",
    peek:
      "Defense Klaus is the platform's security initiative. Visible guard stations in The Ramparts district handle overt security. The Harper's Guild provides undercover ethics monitoring. The Underground Railroad offers protected communication. The Court of Justice resolves disputes. Brass Tacks provides practical safety resources. Together they form a layered protection system.",
    tellMeMore:
      "Defense Klaus operates on the principle that security should be both visible and invisible. The visible layer (guard stations, The Ramparts, posted guidelines) deters obvious bad actors. The invisible layer (undercover Harpers, encrypted channels, the Underground Railroad) catches subtler threats — manipulation, fraud, predatory behavior. The Court of Justice provides due process for disputes. Brass Tacks offers practical safety tools and resources. In HexIsle, The Ramparts district has the visible Defense Klaus HQ, while Harpers are embedded throughout all other districts. The name references both defensive walls (Klaus/claws) and the cooperative's commitment to protecting its members.",
    sampleRoute: "/initiatives/defense-klaus",
    tags: ["security", "protection", "safety", "moderation"],
    relatedItemIds: ["harper-guild", "court-of-justice"],
    toGoItems: [
      { label: "Visit Defense Klaus", type: "try", route: "/initiatives/defense-klaus", estimatedMinutes: 3 },
    ],
  },
  {
    id: "health-accords",
    sectionId: "sweet_sixteen",
    icon: "Heart",
    title: "Health Accords",
    glimpse:
      "Cooperative health services. Medical Savings Accounts, Lifeline Medications, and transparent healthcare pricing.",
    peek:
      "Health Accords applies Cost+20% transparency to healthcare. Medical Savings Accounts (MSA) let members save for medical expenses in Credits. Lifeline Medications sources prescription drugs at volume pricing, passing savings directly to members. Health service providers list their true costs. The goal: make healthcare economics as transparent as every other transaction on the platform.",
    tellMeMore:
      "Healthcare pricing is notoriously opaque. Health Accords brings the same transparency that Cost+20% applies to every other transaction. Medical Savings Accounts are denominated in platform Credits — members save specifically for medical expenses with full visibility into their balance and spending. Lifeline Medications aggregates prescription drug purchasing power across the cooperative, negotiating volume pricing and passing savings through at Cost+20%. Health service providers (doctors, therapists, dentists) list their true costs just like any other seller on the platform. This does not replace insurance — it supplements it with transparent, cooperative pricing for services that members need.",
    sampleRoute: "/initiatives/health-accords",
    tags: ["health", "medical", "msa", "medications", "transparency"],
    relatedItemIds: ["vsl", "c-plus-20"],
    toGoItems: [
      { label: "Visit Health Accords", type: "try", route: "/initiatives/health-accords", estimatedMinutes: 3 },
    ],
  },
  {
    id: "msa",
    sectionId: "sweet_sixteen",
    icon: "HeartPulse",
    title: "MSA (Medical Savings Accounts)",
    glimpse:
      "Savings accounts for medical expenses. Not insurance. Affordable services at Cost+20%. Community health network.",
    peek:
      "MSA is the Medical Savings Accounts initiative — not insurance. Members save for medical expenses in platform Credits. Services are offered at Cost+20% by participating providers. Community health network. Marks accepted for essential care. Preventive care incentives built in.",
    tellMeMore:
      "MSA provides medical savings accounts denominated in platform Credits. This is not insurance; it is cooperative savings for healthcare costs. Participating providers list services at transparent Cost+20% pricing. Members use saved Credits (or Marks, where eligible) to pay. The community health network includes preventive care incentives — the system rewards staying healthy. Lifeline Medications (under Health Accords) handles prescription volume pricing. VSL offers voucher support for short-term medical cash flow. Together they form a transparent, participation-based health finance layer.",
    sampleRoute: "/initiatives/msa",
    tags: ["medical", "savings", "health", "cost-plus-20", "community"],
    relatedItemIds: ["health-accords", "vsl", "c-plus-20"],
    toGoItems: [
      { label: "Learn about MSA", type: "try", route: "/initiatives/msa", estimatedMinutes: 3 },
    ],
  },
  {
    id: "seed-the-quan",
    sectionId: "platform_mechanics",
    icon: "Sprout",
    title: "Seed the Quan",
    glimpse:
      "Culture and community identity. The platform's heart — where values become visible action.",
    peek:
      "Seed the Quan is the cultural initiative — the cooperative's values made tangible. It encompasses community storytelling, brand identity, the Red Carpet recognition system, the Coaster Medallion loyalty art project, and the broader cultural narrative of cooperative economics. 'No Atomo. Superman!' is the rallying cry — we are more than the sum of our parts.",
    tellMeMore:
      "Every organization has a culture. Most do not design it intentionally. Seed the Quan is LB's deliberate cultural architecture. The Red Carpet system recognizes outstanding contributors with public celebration (not monetary rewards — recognition is its own currency). The Coaster Medallion project creates physical art tokens representing platform milestones. Community storytelling — through Cephas articles, the Battery content dispatch system, and member spotlights — reinforces cooperative values. The name replaces the earlier placeholder 'WWWWW' and references the idea that culture is planted, watered, and grown — it does not happen by accident. The Founder's philosophy: 'No Atomo. Superman!' — individuals are powerful, but together we are something greater.",
    sampleRoute: "/redcarpet",
    tags: ["culture", "community", "values", "recognition", "storytelling"],
    relatedItemIds: ["rally-group", "guilds-and-handshake"],
    toGoItems: [
      { label: "Visit the Red Carpet", type: "try", route: "/redcarpet", estimatedMinutes: 3 },
    ],
  },
];

// ============================================================================
// ITEMS — PLATFORM MECHANICS (8)
// ============================================================================

const PLATFORM_MECHANICS_ITEMS: CrowsNestItem[] = [
  {
    id: "three-currencies",
    sectionId: "platform_mechanics",
    icon: "Coins",
    title: "The Three Currencies",
    glimpse:
      "Credits (spend), Marks (effort-debt), Joules (locked value). All equal: 1 Credit = 1 Mark = 1 Joule.",
    peek:
      "Three currencies, three purposes, one value. Credits are purchased with fiat ($1 = 1 Credit) and spent on goods and services — closed-loop, no cash-out. Marks emerge from differential only — never granted as gifts — and are restricted to essentials (food, medical). Joules lock value at purchase-time exchange rates, acting as 'forever stamps.' Sellers set prices. Market discovery. Cost+20% floor.",
    tellMeMore:
      "The three-currency system is LB's core economic innovation. Credits are the universal spending currency — buy with dollars, spend on anything, closed-loop (cannot be converted back to cash). Marks are effort-debt currency: they emerge from the differential between what you contribute and what you consume. Marks are NEVER granted as gifts or rewards — they arise only from genuine participation differentials. They can only be spent on essentials (food, medical, housing). Joules are surplus storage — when you have excess Credits, you can lock them as Joules at the current exchange rate, creating a 'forever stamp' that preserves purchasing power. All three currencies are always worth the same (1:1:1) but are earned and spent differently. This structure prevents speculation (Joules cannot be traded), ensures essentials access (Marks), and enables commerce (Credits).",
    sampleRoute: "/learn/currencies",
    tags: ["currency", "credits", "marks", "joules", "economics"],
    relatedItemIds: ["c-plus-20", "marks-differential", "brewster-bonus"],
    toGoItems: [
      { label: "Read the three-currency deep dive", type: "read", route: "/learn/currencies", estimatedMinutes: 5 },
      { label: "Read the academic paper on currency design", type: "read", route: "/cephas/academic/three-currency-system", estimatedMinutes: 15 },
    ],
  },
  {
    id: "guilds-and-handshake",
    sectionId: "platform_mechanics",
    icon: "Handshake",
    title: "Guilds & Handshake Protocol",
    glimpse:
      "Seven specialty guilds. 30-day Handshake: evaluate together, three outcomes, no lock-in.",
    peek:
      "Members organize into seven guilds by specialty, each with defined positions (7 NOIDs per guild). The Handshake Protocol governs all professional relationships: 30 days to evaluate, three outcomes (continue, part ways, or extend). No contracts, no lock-in — just mutual agreement renewed by demonstrated value. The Guild Hub shows all guilds and open positions.",
    tellMeMore:
      "Guilds are the cooperative's professional structure. Each guild specializes in a domain: technology, creative, operations, education, and more. Guild membership is earned through demonstrated skill (Golden Key pattern: learn, prove, earn). The Handshake Protocol replaces traditional contracts with a rolling 30-day evaluation: both parties work together for 30 days, then choose one of three outcomes — continue (renew for another 30 days), part ways (clean separation, no penalties), or extend (upgrade the relationship). This prevents exploitation (you can always leave) while rewarding consistency (long handshake chains build reputation). Guild mentors match with new members for the Let's Make Bread incubator. The Harper's Guild is special — it operates both openly and undercover as the ethics enforcement arm.",
    sampleRoute: "/guilds/hub",
    tags: ["guilds", "handshake", "protocol", "professional", "evaluation"],
    relatedItemIds: ["harper-guild", "lets-make-bread", "the-300-framework"],
    toGoItems: [
      { label: "Visit the Guild Hub", type: "try", route: "/guilds/hub", estimatedMinutes: 3 },
      { label: "Browse open guild positions", type: "try", route: "/guilds", estimatedMinutes: 5 },
    ],
  },
  {
    id: "court-of-justice",
    sectionId: "platform_mechanics",
    icon: "Scale",
    title: "Court of Justice",
    glimpse:
      "Dispute resolution through the Star Chamber. Fair process, transparent outcomes, community accountability.",
    peek:
      "The Court of Justice resolves disputes between members through a structured process. The Star Chamber (located in the Alchemist's Nook in HexIsle) handles formal proceedings. Harper's Guild members serve as investigators. Outcomes are transparent and community-accountable. The system prioritizes mediation before adjudication.",
    tellMeMore:
      "Every cooperative needs a fair way to resolve conflicts. The Court of Justice provides structured dispute resolution: mediation first (most disputes resolve here), investigation second (Harpers verify facts), and formal proceedings third (the Star Chamber). All outcomes are transparent — the community can see how disputes were resolved (with privacy protections for individuals). The system distinguishes between honest mistakes (education and correction), negligence (restitution and monitoring), and intentional harm (sanctions or removal). Appeals are possible through the Senate. In HexIsle, the Star Chamber entrance is in the Alchemist's Nook district, representing the intersection of investigation (alchemy) and justice.",
    sampleRoute: "/senate",
    tags: ["justice", "disputes", "mediation", "governance", "accountability"],
    relatedItemIds: ["harper-guild", "defense-klaus", "the-300-framework"],
  },
  {
    id: "the-300-framework",
    sectionId: "platform_mechanics",
    icon: "LayoutGrid",
    title: "The 300 Framework",
    glimpse:
      "Cooperative governance model. 300 capacity units allocated across initiatives by member vote.",
    peek:
      "The 300 Framework divides the cooperative's operational capacity into 300 units, allocated across initiatives by member vote. No single initiative can consume more than its allocation. Rebalancing happens through Senate proposals and community voting. This prevents any one initiative from dominating resources and ensures proportional representation.",
    tellMeMore:
      "Traditional organizations allocate resources top-down. The 300 Framework distributes capacity bottom-up through democratic allocation. The cooperative's total operational capacity is modeled as 300 units. Members vote on how those units are distributed across the sixteen initiatives. More popular or impactful initiatives receive more units — but the system has guardrails: minimum allocations ensure every initiative stays viable, and maximum caps prevent monopolization. Reallocation proposals go through the Senate, require quorum, and use ranked-choice voting. The framework is named for its three-hundred-unit structure (not the Spartans, though the metaphor of disciplined collective defense is apt). The academic paper provides the full mathematical model.",
    tags: ["governance", "capacity", "allocation", "voting", "framework"],
    relatedItemIds: ["court-of-justice", "rally-group", "as-you-wish"],
    toGoItems: [
      { label: "Read the 300 Framework paper", type: "read", route: "/cephas/academic/300-framework-tldr", estimatedMinutes: 10 },
    ],
  },
  {
    id: "marks-differential",
    sectionId: "platform_mechanics",
    icon: "TrendingUp",
    title: "Marks Differential",
    glimpse:
      "Marks emerge from genuine effort differentials only. Never gifted, never manufactured. Participation proves value.",
    peek:
      "Marks are the effort-debt currency that ONLY emerges from verified participation differentials. You cannot buy Marks. You cannot gift Marks. They arise when your contribution exceeds your consumption. Marks are restricted to essentials (food, medical, housing) and are cleared through the Brewster Bonus when you deploy them productively. This prevents speculative accumulation.",
    tellMeMore:
      "The Marks differential is what makes LB's currency system impossible to game. Unlike Credits (purchased with dollars) or Joules (locked from excess Credits), Marks can only emerge from a genuine gap between what you contribute and what you consume. The system tracks verified participation: bounties completed, services rendered, products sold, and community contributions. When your contributions exceed your consumption, the differential generates Marks. These Marks can only be spent on essentials — food, medical care, housing. When you deploy all your Marks productively and clear your pouch, the Brewster Bonus rewards your efficiency with Credits. This creates a virtuous cycle: participate genuinely, earn Marks, clear them efficiently, earn bonus Credits. No shortcuts, no manipulation, no speculation.",
    tags: ["marks", "differential", "effort", "essentials", "participation"],
    relatedItemIds: ["three-currencies", "brewster-bonus", "vsl"],
  },
  {
    id: "deck-cards",
    sectionId: "platform_mechanics",
    icon: "CreditCard",
    title: "Deck Cards & Rarity",
    glimpse:
      "Seven rarity tiers from Common to Mythic. Collect by unlocking corner locks. Cards grant platform privileges.",
    peek:
      "The Deck Card system assigns rarity tiers to every concept card: Common, Uncommon, Rare, Epic, Legendary, Mythic, and Unique. Each tier has distinct visual treatments (border colors, glow effects, shimmer patterns). Rarity reflects the concept's depth and difficulty to master. Higher-rarity cards grant greater platform privileges — fee bypasses, guild access, advanced feature unlocks.",
    tellMeMore:
      "Deck Cards turn platform literacy into tangible status. Common cards represent basic concepts anyone can master quickly. Mythic cards represent deep, cross-cutting concepts that require understanding multiple systems. The four corner locks on each card test different engagement modes: reading (passive), trying (active), teaching (social), and comprehending (synthesis). Cards are not purchased or traded — they are earned through genuine engagement. The rarity system prevents status inflation: Mythic cards are genuinely hard to earn. In practical terms, holding specific cards unlocks specific features: a Pipe Portal card lets you ride free, a Canal Quarter card grants venue access, a Guild card opens professional opportunities. Your Deck is your portable proof of platform mastery.",
    sampleRoute: "/deck",
    tags: ["cards", "rarity", "collection", "privileges", "mastery"],
    relatedItemIds: ["cue-cards", "alcove-hallway"],
    toGoItems: [
      { label: "Browse your Deck collection", type: "try", route: "/deck", estimatedMinutes: 3 },
    ],
  },
  {
    id: "brewster-bonus",
    sectionId: "platform_mechanics",
    icon: "Flame",
    title: "The Brewster Bonus",
    glimpse:
      "Clear all your Marks, get a tiered loyalty bonus in Credits. Efficiency rewards participation.",
    peek:
      "Deploy all your Marks productively, clear your pouch, and the Brewster Bonus rewards you with a tiered Credits payout. Rates DECAY at higher tiers — this is intentional. The system rewards breadth of participation, not concentration of capital. The bonus comes from real volume savings when projects buy in bulk, not from new member fees or speculation.",
    tellMeMore:
      "The Brewster Bonus is funded by real volume savings. When cooperative projects purchase in bulk, the volume discounts create a savings pool. This pool funds the Brewster Bonus for members who deploy their Marks efficiently. The decay structure is the key insight: higher tiers earn lower bonus RATES (not lower bonuses — the absolute amount still grows, but at a declining rate). This prevents wealth concentration and ensures the system rewards participation over accumulation. A member who clears 10 Marks gets a higher rate than one who clears 1,000 — because the system values many participants earning moderate bonuses over few participants earning large ones. This is structurally the opposite of compound interest and speculative returns.",
    sampleRoute: "/learn/brewster-bonus",
    tags: ["bonus", "marks", "loyalty", "rewards", "clearing"],
    relatedItemIds: ["marks-differential", "three-currencies"],
    toGoItems: [
      { label: "Read Brewster Bonus mechanics", type: "read", route: "/learn/brewster-bonus", estimatedMinutes: 5 },
    ],
  },
  {
    id: "as-you-wish",
    sectionId: "platform_mechanics",
    icon: "Sparkles",
    title: '"As You Wish"',
    glimpse:
      "The universal confirmation phrase. Nothing happens without your explicit consent.",
    peek:
      'Every transaction, decision, and deployment requires you to say "As You Wish" to proceed. This is not a gimmick — it is a consent architecture. No auto-renewals, no hidden charges, no dark patterns. The phrase comes from a deliberate design choice: every action should be intentional, every commitment should be conscious.',
    tellMeMore:
      'Most platforms optimize for reducing friction — making it easy to click, buy, subscribe, and forget. LB does the opposite with "As You Wish." Every significant action requires explicit confirmation using this phrase. This creates intentional friction: a moment to pause and confirm that yes, you really want to do this. The design prevents impulse purchases, accidental subscriptions, and unconscious commitments. It also creates a cultural ritual — the phrase is recognizable, memorable, and slightly theatrical (borrowed from The Princess Bride). In practical terms, the "As You Wish" confirmation appears on all transactions, membership changes, governance votes, and irreversible actions. It can never be pre-filled, auto-completed, or bypassed by any system.',
    sampleRoute: "/learn/as-you-wish",
    tags: ["consent", "confirmation", "friction", "intentional", "safety"],
    relatedItemIds: ["welcome", "court-of-justice"],
  },
];

// ============================================================================
// ITEMS — BUILD TOOLS (6)
// ============================================================================

const BUILD_TOOLS_ITEMS: CrowsNestItem[] = [
  {
    id: "keeps",
    sectionId: "build_tools",
    icon: "Castle",
    title: "Keeps",
    glimpse:
      "Build hexagonal structures that represent real projects. Your Keep is your headquarters in HexIsle.",
    peek:
      "Keeps are hexagonal buildings in HexIsle that represent real-world projects, businesses, or community spaces. Build your Keep on rentable hex plots across any island. Customize with building archetypes (tower, tavern, gallery, forge, academy). Your Keep is your headquarters — a visible, explorable presence in the virtual world linked to your real platform activity.",
    tellMeMore:
      "Keeps bridge the virtual and real worlds. When you start a business through Let's Make Bread, your Keep appears in HexIsle. When you post bounties, they show on your Keep's quest board. When you earn achievements, they decorate your Keep's walls. The Example Keep in Port City (Verdana) is an explorable tutorial that teaches new members how to build. Keeps come in different sizes: single-hex outposts, 3-hex fortified clusters, or larger compounds. Location matters — harbor-front plots cost more but get more foot traffic. The Founder's Keep is a mythic structure in the far north, locked behind a Snow Gate (level 60, 12 locks) that shimmers with ice-blue light.",
    sampleRoute: "/hexisle/keeps",
    tags: ["building", "hexisle", "headquarters", "projects", "real-estate"],
    relatedItemIds: ["hexisle", "hexisle-3d", "lark-builder"],
    toGoItems: [
      { label: "Visit the Keeps Lobby", type: "try", route: "/hexisle/keeps", estimatedMinutes: 3 },
      { label: "Explore the Island Builder", type: "try", route: "/hexisle/builder", estimatedMinutes: 5 },
    ],
  },
  {
    id: "lark-builder",
    sectionId: "build_tools",
    icon: "PenTool",
    title: "Lark Builder",
    glimpse:
      "Visual builder for platform content. Create cue cards, landing pages, and initiative components.",
    peek:
      "The Lark Builder is the platform's visual content creation tool. Build cue cards with custom artwork, create landing pages for initiatives, and configure business components — all through a guided interface. The side panel provides context-aware help and templates. No coding required for most content. Advanced users can customize deeper through the component library.",
    tellMeMore:
      "Lark Builder democratizes content creation on the platform. Instead of requiring technical skills to create cue cards, landing pages, and business profiles, the builder provides a guided visual interface. The side panel (LarkSidePanel) shows context-aware tips, template suggestions, and compliance checks (including SEC language scanning). Content created through Lark Builder automatically inherits the platform's design system — consistent typography, colors, spacing, and accessibility. The builder supports fractional IP participation through the Sponsor Portal integration: when you create content that others use, the transparent licensing tracks usage and distributes Credit accordingly. The Lark Wrapper component handles the technical infrastructure so creators focus on content.",
    sampleRoute: "/cue-cards",
    tags: ["builder", "content", "visual", "cards", "creation"],
    relatedItemIds: ["cue-cards", "sponsor-portal"],
    toGoItems: [
      { label: "Open the Cue Card Studio", type: "try", route: "/cue-cards", estimatedMinutes: 5 },
    ],
  },
  {
    id: "hexel-cad",
    sectionId: "build_tools",
    icon: "Box",
    title: "Hexel CAD System",
    glimpse:
      "27-piece mechanical taxonomy for physical hexagonal products. From ChannelLock to SlottedTop.",
    peek:
      "The Hexel CAD system defines a 27-piece mechanical grammar for hexagonal physical products. Each piece (ChannelLock, HollowLog, Clamshell, GoldenLotus, Rotor, and more) has precise engineering specifications. The definitive stack order defines how pieces assemble. 60mm flat-to-flat dimensions. Fusion 360 integration. Patent-pending mechanical designs across multiple provisional applications.",
    tellMeMore:
      "Hexel CAD is where the virtual world meets physical manufacturing. The 27-piece grammar defines every mechanical component that can exist in the hexagonal product line: from the ChannelLock base (water management) through the HollowLog shell and Clamshell housing, up through the GoldenLotus aesthetic piece, the Rotor and Ouralis mechanical components, planetary gears, the SawtoothCoral timing mechanism, and the Capstone and SlottedTop crown pieces. The Cradle piece has a flip mechanism — the entire assembly goes up/down AND flips, allowing the system to function as both a water trap and a land trap. All pieces are 60mm flat-to-flat (upgraded from the original 42mm). The system has tools for Fusion 360 extraction (Python), grammar validation (TypeScript), and component mapping (47+ piece-to-part mappings). Patent claims span 2,097 across eleven provisional applications.",
    tags: ["cad", "engineering", "hexagonal", "mechanical", "manufacturing", "patents"],
    relatedItemIds: ["hexisle", "patent-system"],
    toGoItems: [
      { label: "Read about piece engineering", type: "read", route: "/cephas/hexel/piece-grammar", estimatedMinutes: 10 },
    ],
  },
  {
    id: "patent-system",
    sectionId: "build_tools",
    icon: "FileCheck",
    title: "Patent System",
    glimpse:
      "2,506 claims across 17 provisional applications. Micro-entity filing at $65 each. Innovation catalog of 2,270 items.",
    peek:
      "The platform's patent portfolio spans 2,506 claims across seventeen provisional patent applications, filed as micro-entity ($65 each). The innovation catalog tracks 2,270 distinct innovations (Session 17: delegation, XP, trickle onboarding, STAMP). Patent Buckets organize innovations into themed bags (7 bags + 2 showcase pedestals with 408 claims in the codebase). Fractional IP participation lets sponsors contribute to patents and share in licensing revenue.",
    tellMeMore:
      "The patent system is one of LB's most ambitious features. Every innovation — from the three-currency system to the Brewster Bonus to the hexagonal CAD grammar — is cataloged, numbered, and (where applicable) included in provisional patent applications. The micro-entity designation means each filing costs $65 instead of thousands. Patent Buckets organize related innovations into themed bags for filing. The Sponsor Portal lets members contribute to patent development and earn fractional IP participation in licensing revenue. This is NOT a security (the Howey defense depends on this distinction) — it is service-based participation in patent licensing outcomes. The Hall of Innovations displays the full catalog, and each innovation links to its patent bucket, cue card, and Cephas knowledge base entry.",
    sampleRoute: "/sponsor",
    tags: ["patents", "innovation", "intellectual-property", "licensing", "micro-entity"],
    relatedItemIds: ["sponsor-portal", "hexel-cad", "c-plus-20"],
    toGoItems: [
      { label: "Visit the Sponsor Portal", type: "try", route: "/sponsor", estimatedMinutes: 5 },
      { label: "Browse the Hall of Innovations", type: "try", route: "/hall-of-innovations", estimatedMinutes: 5 },
    ],
  },
  {
    id: "sponsor-portal",
    sectionId: "build_tools",
    icon: "HeartHandshake",
    title: "Sponsor Portal",
    glimpse:
      "Back innovations through PreOrder Pledges. Earn fractional IP participation in patent licensing.",
    peek:
      "The Sponsor Portal connects innovation creators with backers. PreOrder Pledges let you commit to purchasing when a product ships — no payment until delivery. Sponsors can also contribute to patent development and earn fractional IP participation (not securities — service-based participation). The Johnny Appleseed path is for builders who want to plant seeds across multiple innovations.",
    tellMeMore:
      "The Sponsor Portal is where innovation meets community backing. Unlike crowdfunding platforms that take 5-10% plus payment processing fees, the Sponsor Portal operates at Cost+20% — the same transparent margin as everything else. PreOrder Pledges are commitments, not payments: you promise to buy when the product ships, giving creators demand validation without financial risk to backers. Sponsors who contribute time, expertise, or resources to patent development earn fractional IP participation in licensing outcomes. This is structured as service-based participation (not securities) through the cooperative's operating agreement. The Howey defense analysis (available in the Alcove Hallway) explains why this structure avoids securities classification.",
    sampleRoute: "/sponsor",
    tags: ["sponsorship", "preorder", "innovation", "backing", "participation"],
    relatedItemIds: ["patent-system", "c-plus-20", "lets-make-bread"],
    toGoItems: [
      { label: "Visit the Sponsor Portal", type: "try", route: "/sponsor", estimatedMinutes: 5 },
    ],
  },
  {
    id: "cephas-knowledge-base",
    sectionId: "build_tools",
    icon: "BookOpen",
    title: "Cephas Knowledge Base",
    glimpse:
      "The platform's documentation and academic papers. Cephas means 'rock' — the foundation of understanding.",
    peek:
      "Cephas is LB's knowledge base — academic papers, technical documentation, and deep-dive articles on every aspect of the cooperative. Named from the word meaning 'rock' (foundation). Crow Feathers track your reading progress. Papers cover the 300 Framework, Cost+20% economics, currency design, the Howey defense, and more. All publicly accessible.",
    tellMeMore:
      "Cephas is the intellectual backbone of the cooperative. Every major design decision, economic model, and governance structure has a corresponding academic paper or technical document. The 300 Framework paper explains capacity allocation. The Cost+20% paper derives the pricing math. The three-currency paper models the economic dynamics. The Howey defense paper explains why the cooperative's instruments are not securities. Reading progress is tracked through Crow Feathers — visual indicators that fill as you scroll through articles, showing exactly how much of each document you have read. Cephas is publicly accessible because transparency is a core value: anyone should be able to understand exactly how the cooperative works before joining.",
    sampleRoute: "/cephas",
    tags: ["knowledge", "documentation", "papers", "academic", "reading"],
    relatedItemIds: ["the-300-framework", "c-plus-20", "three-currencies"],
    toGoItems: [
      { label: "Browse Cephas articles", type: "read", route: "/cephas", estimatedMinutes: 10 },
    ],
  },
];

// ============================================================================
// ITEMS — THE WORLD (5)
// ============================================================================

const WORLD_ITEMS: CrowsNestItem[] = [
  {
    id: "hexisle-3d",
    sectionId: "world",
    icon: "Globe",
    title: "HexIsle 3D World",
    glimpse:
      "Walk through Verdana's Port City in full 3D. Hexagonal terrain, building labels, interactive navigation.",
    peek:
      "The 3D world renders HexIsle as an explorable landscape using React Three Fiber. Hexagonal terrain columns rise from the ocean. Buildings are labeled with their function. Navigation uses click-to-move with camera controls. Port City (Verdana) on Harvest Island is the deployed starting area with all twelve city-type districts sampled as neighborhoods.",
    tellMeMore:
      "HexIsle 3D is built with React Three Fiber (R3F) — no separate game engine, no additional downloads, runs in the browser. The terrain renderer uses InstancedMesh for performance, drawing hundreds of hexagonal columns efficiently. Each hex has a terrain type (grassland, forest, mountain, shore, ocean) with corresponding colors and roughness values. Buildings sit atop hex columns and display labels on hover. The camera system supports orbit, pan, and zoom. Port City (Verdana) samples all twelve planned city types as mini-districts: Tower of Peace, Harbor, Market Square, The Tavern, Canal Quarter, Forge Corner, The Garden, Academy Terrace, Alchemist's Nook, The Ramparts, Artisan Lane, and The Common. The Hexagon is a walled compound separate from the town proper. The Crow's Nest lookout tower sits in the Harbor District.",
    sampleRoute: "/hexisle/world-3d",
    tags: ["3d", "world", "exploration", "hexagonal", "browser"],
    relatedItemIds: ["hexisle", "keeps", "the-hexagon"],
    toGoItems: [
      { label: "Enter the 3D World", type: "try", route: "/hexisle/world-3d", estimatedMinutes: 5 },
    ],
  },
  {
    id: "ghost-world-explore",
    sectionId: "world",
    icon: "Ghost",
    title: "Ghost World Explorer",
    glimpse:
      "The unregistered exploration mode. Your Ghost icon moves through the platform, leaving a trail of discovery.",
    peek:
      "Ghost World is both a concept (unregistered access) and an exploration mode. Your Ghost icon — the LB loading-screen ghost — serves as your 'you are here' marker throughout the platform. Ghost progress (beacons, reading, feathers) persists locally. In the overworld, the Ghost sprite glows so you always know which one is you. Ghost trails show recently visited hexes.",
    tellMeMore:
      "The Ghost World concept runs deeper than simple unregistered access. The Ghost is your avatar — a friendly spirit exploring the cooperative's landscape before committing to membership. In the 2D overworld, the Ghost sprite moves hex-by-hex between beacon stops, leaving faint afterimages on recently visited hexes. The glow effect ensures you always know which Ghost is yours (important when the world eventually has other players visible). The Ghost rides in a gondola when traversing the Canal Quarter. Direction indicators show which way you are headed. All Ghost World progress — beacons dropped, Crow Feathers earned, alcoves visited, items queued in the Crow's Nest — persists in localStorage. When (if) you create a member account, all Ghost data merges seamlessly.",
    sampleRoute: "/ghost",
    tags: ["ghost", "exploration", "unregistered", "avatar", "discovery"],
    relatedItemIds: ["ghost-world", "beacon-system", "first-steps"],
    toGoItems: [
      { label: "Enter Ghost World", type: "try", route: "/ghost", estimatedMinutes: 5 },
    ],
  },
  {
    id: "alcove-hallway",
    sectionId: "world",
    icon: "GraduationCap",
    title: "The Alcove Hallway",
    glimpse:
      "18 learning stops in 3 tiers. Walk the hallway, answer questions, earn Marks, collect Pattern Keys.",
    peek:
      "The Alcove Hallway is the platform's guided learning path: 18 stops organized in three tiers. Foundation (stops 1-6): What is LB, Cost+20%, currencies, membership. Mechanics (stops 7-12): Brewster Bonus, Radio Contest, anonymous volume. Depth (stops 13-18): Howey defense, patents, governance. Each stop earns Marks. Complete a tier for a Pattern Key. Complete all 18 for the Founder's Forge badge.",
    tellMeMore:
      "Think of the Alcove Hallway as a museum corridor where each alcove is a stopping point for one concept. You progress linearly — each stop unlocks the next. At each stop, comprehension questions test three levels: Basic (yes/no or multiple choice, 2 Marks), Applied (connecting concepts, 5 Marks), and Synthesis (deep understanding, 10 Marks). The three tiers have distinct visual themes: Foundation (emerald), Mechanics (amber), and Depth (indigo). Completing all six stops in a tier earns a Pattern Key (Fledgling, Flight, or Murder — referencing crow terminology). The keys unlock progressively deeper platform features. Completing all 18 stops earns the Founder's Forge badge, the highest learning achievement. The hallway connects to Cephas articles for deep dives and to the Crow's Nest for related discovery items.",
    sampleRoute: "/learn",
    tags: ["learning", "hallway", "progressive", "questions", "marks"],
    relatedItemIds: ["first-steps", "cephas-knowledge-base", "deck-cards"],
    toGoItems: [
      { label: "Start the Alcove Hallway", type: "try", route: "/learn", estimatedMinutes: 10 },
    ],
  },
  {
    id: "beacon-system",
    sectionId: "world",
    icon: "MapPin",
    title: "The Beacon System",
    glimpse:
      "Drop colored pins to bookmark anything. Six colors, personal notes, persistent across sessions.",
    peek:
      "Beacons are personal bookmarks you drop anywhere on the platform. Six colors: green (return here), blue (important), yellow (decision needed), red (blocked/stuck), purple (completed), orange (custom). Add personal notes to each. Beacons persist across sessions (localStorage for ghosts, Supabase for members). The Wildfire Beacon Run is a timed challenge through a sequence of beacons.",
    tellMeMore:
      "The Beacon System reflects the Founder's belief that people learn nonlinearly. Instead of forcing a linear path, beacons let you mark what catches your attention and return later. The six colors create a visual language: green beacons are 'I want to come back,' blue beacons mark important concepts, yellow beacons flag decisions you need to think about, red beacons mark where you got stuck, purple beacons celebrate completed items, and orange beacons are wildcards for your own categories. Your beacon trail — the history of where you have been and what caught your eye — becomes a personal learning map. The Wildfire Beacon Run adds a gamification layer: timed sequences of beacons that test how quickly you can navigate through platform concepts. Beacon data uses dual persistence: localStorage for ghosts, Supabase for members.",
    sampleRoute: "/beacon",
    tags: ["beacons", "bookmarks", "navigation", "colors", "persistence"],
    relatedItemIds: ["first-steps", "ghost-world-explore"],
    toGoItems: [
      { label: "Drop your first Beacon", type: "try", route: "/beacon", estimatedMinutes: 2 },
    ],
  },
  {
    id: "the-hexagon",
    sectionId: "world",
    icon: "Hexagon",
    title: "The Hexagon",
    glimpse:
      "The walled compound at the heart of governance. Star Chamber, Steward Council, seven-hex rosette.",
    peek:
      "The Hexagon is a walled compound separate from Port City's open districts. A 12-hex stone wall perimeter surrounds a seven-hex rosette interior (center hex rises highest). Inside: the Star Chamber archive, Steward Council meeting nook, and governance records. Access through a single gate connected to the town proper. Like a medieval university — enclosed, distinct identity, seat of collective wisdom.",
    tellMeMore:
      "The Hexagon represents the cooperative's governance in physical form. Its walled structure communicates that governance is serious — separate from commerce, protected from casual interference. The seven-hex rosette (one center, six surrounding) mirrors the hexagonal design language used throughout the platform. The center hex rises highest, representing the collective decision-making process that sits above any individual concern. The Star Chamber houses the archive of all governance decisions, dispute resolutions, and constitutional amendments. The Steward Council meets here to review platform operations. In practical terms, The Hexagon links to the Senate voting system, the Court of Justice, and the 300 Framework capacity allocator. Access is through a single gate — symbolically, there is one way into governance: through demonstrated engagement and earned trust.",
    sampleRoute: "/hexisle",
    tags: ["governance", "hexagon", "compound", "star-chamber", "council"],
    relatedItemIds: ["the-300-framework", "court-of-justice", "hexisle-3d"],
    toGoItems: [
      { label: "Visit the HexIsle portal", type: "try", route: "/hexisle", estimatedMinutes: 3 },
    ],
  },
];

// ============================================================================
// COMBINED CATALOG
// ============================================================================

export const ALL_CROWS_NEST_ITEMS: CrowsNestItem[] = [
  ...GETTING_STARTED_ITEMS,
  ...SWEET_SIXTEEN_ITEMS,
  ...PLATFORM_MECHANICS_ITEMS,
  ...BUILD_TOOLS_ITEMS,
  ...WORLD_ITEMS,
];

/** Lookup an item by ID */
export function getCrowsNestItem(id: string): CrowsNestItem | undefined {
  return ALL_CROWS_NEST_ITEMS.find((item) => item.id === id);
}

/** Get all items for a section */
export function getItemsForSection(sectionId: CrowsNestSection): CrowsNestItem[] {
  const section = CROWS_NEST_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return [];
  return section.items
    .map((id) => getCrowsNestItem(id))
    .filter((item): item is CrowsNestItem => item !== undefined);
}

/** Get section definition by ID */
export function getCrowsNestSection(id: CrowsNestSection): CrowsNestSectionDef | undefined {
  return CROWS_NEST_SECTIONS.find((s) => s.id === id);
}

/** Search items by query (matches title, tags, and glimpse text) */
export function searchCrowsNestItems(query: string): CrowsNestItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_CROWS_NEST_ITEMS;
  return ALL_CROWS_NEST_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.glimpse.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}
