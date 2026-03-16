/**
 * COLD START STRATEGY RECIPE CARDS
 * =================================
 * Step-by-step playbooks users can browse and apply to their business projects.
 * Each strategy is a "recipe card" — pick one, follow the steps, scale.
 *
 * Pattern: Start with yourself → Invite one person → Serve a small group → Scale
 */

export interface ColdStartStep {
  step: number;
  action: string;
  detail: string;
  metric?: string; // What success looks like
}

export interface ColdStartStrategy {
  id: string;
  name: string;
  tagline: string;
  initiative: string; // Which Sweet Sixteen initiative this applies to
  icon: string; // Emoji
  difficulty: "easy" | "medium" | "advanced";
  timeToFirstWin: string; // e.g., "1 week"
  capitalNeeded: string; // e.g., "$0" or "$50"
  steps: ColdStartStep[];
  successMetric: string;
  guildSupport: string; // What guild/community channel helps
  realExample?: string; // Optional success story hook
}

export const COLD_START_STRATEGIES: ColdStartStrategy[] = [
  // ─── LET'S MAKE DINNER ───
  {
    id: "lmd-sunday-prep",
    name: "The Sunday Prep",
    tagline: "Cook for yourself, then invite one neighbor",
    initiative: "lets-make-dinner",
    icon: "🍳",
    difficulty: "easy",
    timeToFirstWin: "1 week",
    capitalNeeded: "$0",
    steps: [
      { step: 1, action: "Prep your own meals for the week", detail: "Cook what you already eat. Document your process — photos, portions, costs.", metric: "5 meals prepped" },
      { step: 2, action: "Invite one person", detail: "Neighbor, coworker, friend. 'I'm meal prepping Sunday — want in? I'll make extra.'", metric: "1 person says yes" },
      { step: 3, action: "Cook together or deliver", detail: "Either they join you in the kitchen or you drop off their portions. Split the grocery cost.", metric: "2 people fed" },
      { step: 4, action: "Add 3 more people", detail: "Word of mouth. Post in your neighborhood group. 'Sunday Prep Club — $8/meal, home-cooked.'", metric: "5 people fed weekly" },
      { step: 5, action: "Hit the 50% threshold", detail: "Pre-sell 50% of your weekly capacity on the platform. Your node activates automatically.", metric: "25+ meals/week pre-sold" },
      { step: 6, action: "Become a Captain", detail: "You're now running a kitchen node. Guild support kicks in — bulk purchasing, recipe cards, insurance guidance.", metric: "Node status: ACTIVE" },
    ],
    successMetric: "25+ meals pre-sold per week",
    guildSupport: "Kitchen Captains Guild — recipe sharing, bulk ingredient sourcing, food safety tips",
  },
  {
    id: "lmd-church-kitchen",
    name: "The Church Kitchen",
    tagline: "Unused kitchens, unlimited potential",
    initiative: "lets-make-dinner",
    icon: "⛪",
    difficulty: "medium",
    timeToFirstWin: "2 weeks",
    capitalNeeded: "$0",
    steps: [
      { step: 1, action: "Find an unused commercial kitchen", detail: "Churches, community centers, restaurants during off-hours. Most sit empty 5+ days a week.", metric: "1 kitchen identified" },
      { step: 2, action: "Propose a pilot", detail: "'Let us cook meals for the community Tuesdays and Thursdays. We'll pay rent or share meals with your congregation.'", metric: "Agreement secured" },
      { step: 3, action: "Pre-sell 12 meals", detail: "Post on platform + neighborhood. '$8/meal, home-style cooking, ready for pickup Tuesday 5pm.'", metric: "12 pre-orders" },
      { step: 4, action: "Cook and deliver", detail: "First batch. Get feedback. Adjust. The 50% rule means you only cook what's already paid for.", metric: "12 meals delivered, feedback collected" },
      { step: 5, action: "Scale to 50+", detail: "Add menu variety. Tuesday = comfort food, Thursday = healthy options. Pre-orders grow through word of mouth.", metric: "50+ meals/week" },
      { step: 6, action: "Recruit a Captain", detail: "Someone with a food handler's license runs the kitchen. You coordinate orders and logistics.", metric: "Captain assigned, node fully operational" },
    ],
    successMetric: "50+ meals/week from a previously unused kitchen",
    guildSupport: "Kitchen Captains Guild + Facility Partnerships channel",
  },

  // ─── LET'S GET GROCERIES ───
  {
    id: "lgg-grocery-run",
    name: "The Grocery Run",
    tagline: "You're going to the store anyway",
    initiative: "lets-get-groceries",
    icon: "🛒",
    difficulty: "easy",
    timeToFirstWin: "3 days",
    capitalNeeded: "$0",
    steps: [
      { step: 1, action: "Plan your own grocery trip", detail: "You're going anyway. Make your list. Note what you're buying and where.", metric: "Your list is ready" },
      { step: 2, action: "Ask one neighbor", detail: "'I'm heading to Costco Saturday — need anything?' Text, knock on the door, post in your group chat.", metric: "1 person adds to your list" },
      { step: 3, action: "Pick up their groceries too", detail: "Buy their items. They Venmo you or pay on platform. You just saved them a trip — and you got bulk pricing.", metric: "2 households served" },
      { step: 4, action: "Make it weekly", detail: "'Saturday Grocery Run — add your list by Thursday.' Post on platform. 5 households = real bulk savings.", metric: "5 households, weekly" },
      { step: 5, action: "Hit the volume discount", detail: "10+ households ordering together = wholesale pricing from suppliers. Everyone saves 15-30%.", metric: "10+ households, measurable savings" },
      { step: 6, action: "Activate your node", detail: "50% pre-sold capacity reached. You're a distribution hub. Platform handles payments, you handle logistics.", metric: "Node status: ACTIVE" },
    ],
    successMetric: "10+ households saving 15-30% on groceries weekly",
    guildSupport: "Distribution Guild — route optimization, supplier connections, cold chain tips",
  },
  {
    id: "lgg-bulk-buy-club",
    name: "The Bulk Buy Club",
    tagline: "Costco quantities, neighborhood distribution",
    initiative: "lets-get-groceries",
    icon: "📦",
    difficulty: "medium",
    timeToFirstWin: "1 week",
    capitalNeeded: "$50",
    steps: [
      { step: 1, action: "Identify 3 staples everyone buys", detail: "Rice, cooking oil, paper towels — things that are always cheaper in bulk but too much for one family.", metric: "3 products identified" },
      { step: 2, action: "Get quotes from wholesale", detail: "Costco, Restaurant Depot, local wholesale. Calculate per-unit cost vs retail.", metric: "Price comparison ready" },
      { step: 3, action: "Pre-sell splits", detail: "'50lb bag of rice = $25. Split 5 ways = $5 each (retail: $8). Who's in?'", metric: "5 buyers committed" },
      { step: 4, action: "Buy and distribute", detail: "Purchase bulk. Split at your garage/porch. Everyone picks up or you deliver locally.", metric: "5 families saved money" },
      { step: 5, action: "Expand the catalog", detail: "Add 10 more products. Create a weekly order form on the platform. Savings compound.", metric: "15+ products, 10+ families" },
      { step: 6, action: "Warehouse/pickup point", detail: "Your garage becomes a micro-hub. Weekly pickup window. Platform handles orders and payments.", metric: "Micro-hub operational" },
    ],
    successMetric: "15+ products distributed to 10+ families weekly",
    guildSupport: "Distribution Guild — supplier negotiation, inventory management",
  },

  // ─── LET'S GO SHOPPING (MAKER PRODUCTION RUNS) ───
  {
    id: "lgs-production-run",
    name: "The Production Run",
    tagline: "500 units, one maker, zero risk",
    initiative: "lets-go-shopping",
    icon: "🏭",
    difficulty: "medium",
    timeToFirstWin: "2 weeks",
    capitalNeeded: "$0",
    steps: [
      { step: 1, action: "Browse maker proposals", detail: "47 creators from the Instagram Factor-y collection. Each has a product ready for production.", metric: "Pick your favorite" },
      { step: 2, action: "Back a production run", detail: "Pre-order the product. Your $$ goes into escrow. Production only starts when 500 units are pre-sold.", metric: "Your pre-order placed" },
      { step: 3, action: "Share the proposal", detail: "Post to your network. Every share that converts = TasteMaker attribution chain. You're the scout.", metric: "3+ referral conversions" },
      { step: 4, action: "Watch the run fill up", detail: "Fantasy League-style: track how fast the 500 slots fill. First 100 backers get multiplier bonuses.", metric: "500 pre-orders reached" },
      { step: 5, action: "Production begins", detail: "Maker produces 500 units. Platform handles QA (STAMP verification). You get your product + Joules.", metric: "Product delivered" },
      { step: 6, action: "Success story created", detail: "The maker has revenue. You have product. The platform has a proven production run. Share if you choose.", metric: "Shareable success story" },
    ],
    successMetric: "500-unit production run completed, maker paid, backers satisfied",
    guildSupport: "Maker's Guild — production support, QA standards, logistics coordination",
  },
  {
    id: "lgs-curate-shop",
    name: "The Pop-Up Curator",
    tagline: "Curate makers, host pop-ups, build a storefront",
    initiative: "lets-go-shopping",
    icon: "🎪",
    difficulty: "advanced",
    timeToFirstWin: "1 month",
    capitalNeeded: "$100",
    steps: [
      { step: 1, action: "Pick 5 makers you love", detail: "Browse production run catalog. Select products you'd personally buy and recommend.", metric: "5 products curated" },
      { step: 2, action: "Host a pop-up", detail: "Farmers market booth, church hall, your front yard. Display samples. Take pre-orders on the platform.", metric: "1 pop-up event held" },
      { step: 3, action: "Collect 20 pre-orders", detail: "Customers order on their phones at your pop-up. You earn TasteMaker attribution for each sale.", metric: "20 pre-orders from pop-up" },
      { step: 4, action: "Go monthly", detail: "Same location, same time, growing catalog. Makers ship directly to your hub. You display and sell.", metric: "Monthly pop-up established" },
      { step: 5, action: "Permanent space", detail: "Enough volume to justify rent. A community storefront stocked by platform makers.", metric: "Retail node activated" },
      { step: 6, action: "Scale the catalog", detail: "50+ products from 15+ makers. You're a local retail node — the physical front-end of the LB Mall.", metric: "Full retail node operational" },
    ],
    successMetric: "Permanent retail node with 50+ products from 15+ makers",
    guildSupport: "Retail Guild — merchandising, pop-up logistics, maker introductions",
  },

  // ─── UNIVERSAL STRATEGIES ───
  {
    id: "universal-cue-card",
    name: "The Cue Card Drop",
    tagline: "Leave cards everywhere, let the platform sell itself",
    initiative: "universal",
    icon: "🃏",
    difficulty: "easy",
    timeToFirstWin: "1 day",
    capitalNeeded: "$0",
    steps: [
      { step: 1, action: "Get your cue card deck", detail: "Included with your $5/year membership. Digital + printable versions.", metric: "Deck in hand" },
      { step: 2, action: "Drop one card today", detail: "Coffee shop bulletin board. Laundromat. Library. Church. Break room. Anywhere people wait.", metric: "1 card placed" },
      { step: 3, action: "Track your referrals", detail: "Each card has your unique attribution code. Watch conversions on your dashboard.", metric: "First scan/signup" },
      { step: 4, action: "Target 10 locations", detail: "Map your neighborhood. 10 high-traffic spots. Rotate cards weekly.", metric: "10 locations seeded" },
      { step: 5, action: "Earn referral Marks", detail: "Pioneer tier (first 100 signups) = 10 Marks per conversion. That's real value.", metric: "Marks earned from referrals" },
      { step: 6, action: "Build your attribution chain", detail: "Your referrals refer others. TasteMaker Trust Chain pays 5 links deep.", metric: "Multi-level attribution active" },
    ],
    successMetric: "10+ referral conversions from cue card drops",
    guildSupport: "Ambassador Guild — best placement strategies, card design tips",
  },
  {
    id: "universal-discord-crew",
    name: "The Crew Call",
    tagline: "Find your people, build your crew",
    initiative: "universal",
    icon: "🎬",
    difficulty: "easy",
    timeToFirstWin: "1 day",
    capitalNeeded: "$0",
    steps: [
      { step: 1, action: "Join the LB Community Hub", detail: "Discord server — channels for every initiative, guild, and region. Introduce yourself.", metric: "Joined and introduced" },
      { step: 2, action: "Find your initiative channel", detail: "#lets-make-dinner, #lets-get-groceries, #makers-guild, etc. See who's active in your area.", metric: "Found your channel" },
      { step: 3, action: "Post your intent", detail: "'Starting a grocery run node in Phoenix. Looking for 5 households to pilot. Who's nearby?'", metric: "First response" },
      { step: 4, action: "Form a crew of 3", detail: "You + 2 others. Primary/Secondary/Backup roles. Natural mentorship chain.", metric: "Crew formed" },
      { step: 5, action: "Run your first operation", detail: "Execute your Cold Start recipe card together. Crew support means you're never alone.", metric: "First operation complete" },
      { step: 6, action: "Process Pioneer status", detail: "First in your region for your initiative? You're the Process Pioneer — permanent IP ledger entry.", metric: "Pioneer badge earned" },
    ],
    successMetric: "Crew of 3 running operations together",
    guildSupport: "Your initiative's guild channel + regional crew channels",
  },
];

/**
 * Get strategies for a specific initiative
 */
export function getStrategiesForInitiative(initiative: string): ColdStartStrategy[] {
  return COLD_START_STRATEGIES.filter(
    s => s.initiative === initiative || s.initiative === "universal"
  );
}

/**
 * Get all unique initiative categories
 */
export function getInitiativeCategories(): string[] {
  return [...new Set(COLD_START_STRATEGIES.map(s => s.initiative))];
}
