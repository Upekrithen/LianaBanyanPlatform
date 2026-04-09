/**
 * X-RAY GLOSSARY — Explanations for every annotated element
 * ==========================================================
 * Maps data-xray-id values to brief explanations + learn-more links.
 * When X-Ray Goggles are on, hovering any element shows its explanation.
 *
 * Add entries here as new data-xray-id attributes are added to components.
 * If no entry exists, the overlay falls back to showing just the component name.
 */

export interface XRayGlossaryEntry {
  /** Brief 1-2 sentence explanation */
  explanation: string;
  /** How this connects to other platform systems */
  connectedTo?: string;
  /** Why this exists — the reasoning */
  why?: string;
  /** URL for "Learn more" link (opens in new tab) */
  learnMoreUrl?: string;
  /** Label for the learn more link (default: "Learn more") */
  learnMoreLabel?: string;
  /** Links to /faq#[anchor] for deep FAQ integration */
  faqAnchorId?: string;
  /** STL download URL (HexIsle pieces) */
  downloadUrl?: string;
  /** Improvement submission URL (Piggy-Back Protocol) */
  piggybackUrl?: string;
  /** Patent cross-reference innovation number */
  innovationNumber?: number;
  /** Elbow Grease effort level (1-10) for this element */
  elbowGreaseLevel?: number;
}

function buildShellEntries(pageSlug: string, pageTitle: string): Record<string, XRayGlossaryEntry> {
  return {
    [`${pageSlug}-shell`]: {
      explanation: `${pageTitle} shell that frames this workspace as one coherent operating surface.`,
      connectedTo: "Carries sidebar/top-level navigation context so members can move without losing place.",
      why: "Operational pages should feel like one room, not disconnected cards.",
      elbowGreaseLevel: 1,
    },
    [`${pageSlug}-header`]: {
      explanation: `${pageTitle} header with page identity, orientation breadcrumbs, and top controls.`,
      connectedTo: "Bridges global navigation with the current workflow state for this page.",
      why: "Members should always know where they are before taking action.",
      elbowGreaseLevel: 1,
    },
    [`${pageSlug}-hero`]: {
      explanation: `${pageTitle} hero band that states the purpose, action path, and proof context up front.`,
      connectedTo: "Sets the next-click intent before members move into detailed panels.",
      why: "Clear orientation first prevents noise and rework in downstream actions.",
      elbowGreaseLevel: 1,
    },
    [`${pageSlug}-main`]: {
      explanation: `${pageTitle} main workspace where the substantive cards, tools, and ledgers live.`,
      connectedTo: "Receives the intent set in the hero and turns it into step-level execution.",
      why: "The main body is where judgment turns into cooperative movement.",
      elbowGreaseLevel: 2,
    },
  };
}

function buildSinglePageEntry(id: string, title: string, explanation: string): Record<string, XRayGlossaryEntry> {
  return {
    [id]: {
      explanation,
      connectedTo: `${title} is part of the K295-K320 V2 instrumentation surface and now renders in X-Ray Goggles mode.`,
      why: "Every major builder surface needs discoverable structure for first-pass orientation.",
      elbowGreaseLevel: 2,
    },
  };
}

const V2_SHELL_PAGES = [
  ["welcome", "Welcome Gate"],
  ["membership", "Membership"],
  ["ghost-browse", "Ghost Browse"],
  ["hexisle", "HexIsle Landing"],
  ["red-carpet", "Red Carpet"],
  ["ledger", "Transparency Ledger"],
  ["wallet", "Wallet"],
  ["cold-start", "Cold Start"],
  ["captain", "Captain Dashboard"],
  ["marketplace", "Marketplace"],
  ["cephas", "Cephas Gateway"],
  ["calendar", "Calendar"],
  ["adapt", "ADAPT Score Profile"],
  ["family-table", "Family Table Hub"],
  ["crew-call", "Crew Call Board"],
  ["tribes", "Tribe Directory"],
  ["guilds", "Guild Directory"],
  ["star-chamber", "Star Chamber"],
  ["backer-election", "Backer Election"],
  ["design-democracy", "Design Democracy"],
  ["wheels", "Vehicle / Local Wheels"],
  ["housing", "Housing Hub"],
  ["pioneers", "Pioneer Showcase"],
  ["political-expedition", "Political Expedition"],
] as const;

/**
 * Glossary lookup map. Keys are data-xray-id values (lowercase, kebab-case).
 */
export const XRAY_GLOSSARY: Record<string, XRayGlossaryEntry> = {
  ...Object.assign({}, ...V2_SHELL_PAGES.map(([slug, title]) => buildShellEntries(slug, title))),
  ...buildSinglePageEntry(
    "storefront-builder",
    "Storefront Builder",
    "Five-step storefront setup covering type, template, inventory import, pricing, and launch checks.",
  ),
  ...buildSinglePageEntry(
    "cue-card-creator",
    "Cue Card Creator",
    "Cue card authoring studio for message, visual style, destination link, and send flow.",
  ),
  ...buildSinglePageEntry(
    "dispatch-compose",
    "Dispatch Compose",
    "Canonical dispatch composer that adapts one message across multiple channels with As You Wish confirmation.",
  ),
  ...buildSinglePageEntry(
    "treasure-map-builder",
    "Treasure Map Builder",
    "Learning-path builder that sequences Cephas content, quizzes, difficulty, and completion rewards.",
  ),
  ...buildSinglePageEntry(
    "beacon-run-creator",
    "Beacon Run Creator",
    "Story-first run builder for checkpoints, pacing, challenge types, and publish checks.",
  ),
  ...buildSinglePageEntry(
    "canister-configurator",
    "Canister Configurator",
    "Guided workshop questionnaire that maps work constraints to a practical kit recommendation.",
  ),
  ...buildSinglePageEntry(
    "adapt-overall-score-card",
    "Overall Score Card",
    "Composite ADAPT standing shown on a warm arc gauge so members can orient quickly without alarm framing.",
  ),
  ...buildSinglePageEntry(
    "adapt-five-pillar-breakdown",
    "Five Pillar Breakdown",
    "Horizontal pillar bars for adaptability, durability, alignment, participation, and transmission.",
  ),
  ...buildSinglePageEntry(
    "adapt-seven-day-trends",
    "Seven Day Trends",
    "Compact per-pillar trend sparklines that show movement over the last week.",
  ),
  ...buildSinglePageEntry(
    "adapt-percentile-context",
    "Percentile Context",
    "Top-X framing that positions current standing in a forward-looking way.",
  ),
  ...buildSinglePageEntry(
    "adapt-impact-explanation",
    "Impact Explanation",
    "Collapsed-by-default accordion that explains how ADAPT standing influences pathways and opportunities.",
  ),
  ...buildSinglePageEntry(
    "adapt-improvement-suggestions",
    "Improvement Suggestions",
    "Two to three factual nudges that frame room to grow without shaming language.",
  ),
  ...buildSinglePageEntry(
    "adapt-mobile-cta",
    "ADAPT Mobile CTA",
    "Sticky mobile action that keeps the full-breakdown jump action within thumb reach.",
  ),
  ...buildSinglePageEntry(
    "adapt-tour-anchor",
    "ADAPT Tour Anchor",
    "Tour-system landmark anchor for guided walkthroughs on the ADAPT profile page.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-countdown-banner",
    "Live Round Countdown Banner",
    "Sticky neutral countdown surface for active rounds that swaps to next-round messaging when no round is live.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-gallery",
    "Design Gallery",
    "Single-column mobile and two-column desktop gallery with relative framing labels instead of absolute ranking numbers.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-card",
    "Design Card",
    "Per-design voting card showing designer attribution, Credits-weighted vote total, and relative state.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-vote-explainer",
    "Mark-Weight Voting Explainer",
    "Collapsible explainer with localStorage persistence after first view so repeat visits stay focused on action.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-pipeline",
    "Four-Stage Pipeline Tracker",
    "Progress tracker from Voted to Prototyped to Produced to Shipped.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-submit-cta",
    "Submit Design CTA",
    "Action block clarifying free submission versus Credits-weighted voting in one place.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-winners-archive",
    "Historical Winners Archive",
    "Recent completed round winners with timestamped outcomes.",
  ),
  ...buildSinglePageEntry(
    "design-democracy-gallery-anchor",
    "Design Democracy Tour Anchor",
    "Tour landmark and CTA jump target for the active round gallery.",
  ),
  ...buildSinglePageEntry(
    "wheels-mode-selector",
    "Three-Tab Mode Selector",
    "Large sticky mode cards that keep Local Wheels, Lemon Lot, and Rideshare Routes in one operating surface.",
  ),
  ...buildSinglePageEntry(
    "wheels-ride-request-card",
    "Ride Request Card",
    "Fast rider intake card for city-to-city requests and seat/time capture.",
  ),
  ...buildSinglePageEntry(
    "wheels-earn-down-progress-strip",
    "Earn-Down Progress Strip",
    "Visible ownership accumulation strip showing 80/20 split and progress for assigned drivers.",
  ),
  ...buildSinglePageEntry(
    "wheels-active-driver-map",
    "Active Driver Map",
    "Driver visibility panel using ADAPT pins and no red-state signaling.",
  ),
  ...buildSinglePageEntry(
    "wheels-recent-rides-feed",
    "Recent Rides Feed",
    "Recent ride/match activity feed to keep mobility actions traceable in one place.",
  ),
  ...buildSinglePageEntry(
    "wheels-lemon-lot-grid",
    "Lemon Lot Grid",
    "Filterable listing grid for member vehicles with detail opened in a slide-over.",
  ),
  ...buildSinglePageEntry(
    "wheels-listing-detail-slideover",
    "Listing Detail Slide-Over",
    "In-context listing details that avoid full-page navigation jumps.",
  ),
  ...buildSinglePageEntry(
    "wheels-route-match-board",
    "Route Match Board",
    "Route options board for recurring commute matches and request actions.",
  ),
  ...buildSinglePageEntry(
    "wheels-route-card",
    "Route Card",
    "Per-route row showing commute path, seats, cost contribution, and request state.",
  ),
  ...buildSinglePageEntry(
    "wheels-match-suggestions-panel",
    "Match Suggestions Panel",
    "Clustered route suggestions based on currently active postings.",
  ),
  ...buildSinglePageEntry(
    "wheels-post-listing-cta",
    "Post Listing CTA",
    "Action panel that sends members to add another Lemon Lot listing.",
  ),
  ...buildSinglePageEntry(
    "wheels-post-route-cta",
    "Post Route CTA",
    "Inline cooperative route-post form with transparent contribution framing.",
  ),
  ...buildSinglePageEntry(
    "wheels-tour-anchor",
    "Wheels Tour Anchor",
    "Tour landmark for guided walkthrough entry into the unified wheels workspace.",
  ),
  ...buildSinglePageEntry(
    "housing-story-card",
    "My Housing Story Card",
    "Narrative card showing tier, recent actions, and the next meaningful move in housing priority.",
  ),
  ...buildSinglePageEntry(
    "housing-tabbed-rail",
    "Housing Tabbed Rail",
    "Five chapter tabs framing one continuous cooperative housing story.",
  ),
  ...buildSinglePageEntry(
    "housing-property-listing-card",
    "Property Listing Card",
    "Per-property chapter card with your standing context and mandatory WaterWheel breakdown.",
  ),
  ...buildSinglePageEntry(
    "housing-waterwheel-breakdown",
    "WaterWheel Breakdown",
    "Allocation split panel showing subsidy, maintenance, and cooperative fund flow on each listing.",
  ),
  ...buildSinglePageEntry(
    "housing-timeline",
    "Housing Timeline",
    "Narrative event timeline connecting actions and occupancy history to priority movement.",
  ),
  ...buildSinglePageEntry(
    "housing-contribution-mission-card",
    "Contribution Mission Card",
    "Mission-style contribution action with effort, purpose, and ladder impact framing.",
  ),
  ...buildSinglePageEntry(
    "housing-fund-graph",
    "Housing Fund Graph",
    "Story-first chart of fund growth and subsidy outcomes, avoiding bank-ledger framing.",
  ),
  ...buildSinglePageEntry(
    "housing-roommate-stamp-history",
    "Roommate Stamp History",
    "Accountability-only roommate history focused on stamp events and resolutions.",
  ),
  ...buildSinglePageEntry(
    "housing-priority-ladder",
    "Priority Ladder Visualization",
    "Always-visible tier and next-rung indicator answering where you stand and what moves you up.",
  ),
  ...buildSinglePageEntry(
    "housing-tour-anchor",
    "Housing Tour Anchor",
    "Tour landmark and CTA target for first-entry orientation on the Housing Hub.",
  ),
  ...buildSinglePageEntry(
    "pioneers-hero",
    "Pioneer Hero",
    "Narrative framing panel reinforcing that recognition exists within one living member story.",
  ),
  ...buildSinglePageEntry(
    "pioneers-filters-bar",
    "Pioneer Filters Bar",
    "Category chips and sorting controls for Marketplace, HexIsle, and Governance chapters.",
  ),
  ...buildSinglePageEntry(
    "pioneers-grid",
    "Pioneer Grid",
    "Responsive member grid with lightweight badge decoration and narrative-first card content.",
  ),
  ...buildSinglePageEntry(
    "pioneers-card",
    "Pioneer Card",
    "Member card showing avatar, role tagline, and joined phase without leaderboard dominance.",
  ),
  ...buildSinglePageEntry(
    "pioneers-profile-drawer",
    "Pioneer Profile Drawer",
    "Narrative profile drawer with contribution list and story paragraph, full-screen on mobile.",
  ),
  ...buildSinglePageEntry(
    "pioneers-reward-ladder",
    "Reward Ladder",
    "Positive diminishing-recognition timeline explaining early uncertainty and ongoing contribution value.",
  ),
  ...buildSinglePageEntry(
    "pioneers-contribution-paths",
    "Contribution Paths",
    "Current-path guidance surface that shifts between open-window and ongoing-path messaging.",
  ),
  ...buildSinglePageEntry(
    "pioneers-badges-row",
    "Badges Row",
    "Badge definitions with one-line meaning per badge so decoration supports narrative context.",
  ),
  ...buildSinglePageEntry(
    "pioneers-member-stories-carousel",
    "Member Stories Carousel",
    "Mixed Pioneer and non-Pioneer stories to keep cohort framing inclusive.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-issue-picker",
    "Issue Picker",
    "Five-category issue selection surface that starts the canonical issue-to-district-to-bill flow.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-issue-card",
    "Issue Card",
    "Issue card with current-chapter narrative snippet showing live legislative tension without partisan framing.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-legislative-story-panel",
    "Legislative Story Panel",
    "Narrative panel translating issue context into current legislative chapter guidance.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-active-bills-list",
    "Active Bills List",
    "Issue-relevant bill list filtered to the selected chapter and district context.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-bill-card",
    "Bill Card",
    "Bill summary card that anchors letter writing to one specific legislative object.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-letter-studio",
    "Letter Studio",
    "Issue-district-bill aware editor that keeps member voice primary while guiding structure.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-micro-note",
    "Micro Note",
    "Inline argumentative teaching callout that coaches structure without ghost-writing.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-template-picker",
    "Template Picker",
    "Five-category template starters that members adapt instead of copying as mandates.",
  ),
  ...buildSinglePageEntry(
    "political-expedition-submission-flow",
    "Submission Flow",
    "Recipient selection, review, and send handoff that requires member confirmation.",
  ),
  // ─── LANDING / HERO ───
  "main-card": {
    explanation: "The main hero card. HEOHO — Help Each Other Help Ourselves. This is the first thing visitors see.",
    connectedTo: "Leads to Ghost World (explore freely) or Real World (join for $5/year). Feeds into the Welcome Fable for first-time visitors.",
    why: "Every visitor should immediately understand what this platform is about — interdependence, not charity. The hero sets the tone for everything that follows.",
    learnMoreUrl: "/cephas/about",
    learnMoreLabel: "About Liana Banyan",
    elbowGreaseLevel: 1,
  },
  "hero-card": {
    explanation: "The flip card shows two sides of the platform story. Click or tap to flip between them.",
    connectedTo: "The two sides represent the dual nature of the platform — what you give and what you receive. Ties to the C+20 reciprocity model.",
    why: "Showing both sides in one card communicates that participation is a two-way street — not donation, not extraction.",
    elbowGreaseLevel: 1,
  },
  "hero-section": {
    explanation: "The main hero card. HEOHO — Help Each Other Help Ourselves. This is the first thing visitors see.",
    connectedTo: "Leads to Ghost World (explore freely) or Real World (join for $5/year). Feeds into the Welcome Fable for first-time visitors.",
    why: "Every visitor should immediately understand what this platform is about — interdependence, not charity. The hero sets the tone for everything that follows.",
    learnMoreUrl: "/cephas/about",
    learnMoreLabel: "About Liana Banyan",
    elbowGreaseLevel: 1,
  },
  "hero-flip-card": {
    explanation: "The flip card shows two sides of the platform story. Click or tap to flip between them.",
    connectedTo: "The two sides represent the dual nature of the platform — what you give and what you receive. Ties to the C+20 reciprocity model.",
    why: "Showing both sides in one card communicates that participation is a two-way street — not donation, not extraction.",
    elbowGreaseLevel: 1,
  },
  "rotating-quotes": {
    explanation: "Rotating testimonial quotes from members and supporters. Real voices showing real impact — auto-cycles every few seconds.",
    connectedTo: "Feeds from Success Stories and member testimonials. Each quote links to the member's public profile or story if they've opted in.",
    why: "Social proof from real people beats any marketing copy. Seeing someone like you succeed makes the possibility real.",
    elbowGreaseLevel: 1,
  },
  "cooperative-commerce-header": {
    explanation: "The 'Cooperative Commerce' header — this platform is a worker-owned cooperative, not a corporation extracting value. Cost+20% pricing, member-governed.",
    connectedTo: "Ties directly to the C+20 economic model, Fly on the Wall transparency ledger, and the 16 initiatives funded by the 20% margin.",
    why: "Naming what we are up front. Not 'social enterprise' or 'marketplace' — cooperative commerce. The words matter because the structure matters.",
    learnMoreUrl: "/cephas/under-the-hood/economic-model",
    learnMoreLabel: "Economic Model",
    elbowGreaseLevel: 1,
  },
  "heoho-headline": {
    explanation: "Help Each Other, Help Ourselves — the foundational principle. Interdependence, not collectivism. Each person maintains individual agency.",
    connectedTo: "This philosophy powers every system: Cost+20% pricing, Marks from differential, BandWagon earned authority, and the Three-Currency economy.",
    why: "Interdependence preserves individual agency while creating collective benefit. Collectivism subordinates the individual — we don't do that. (1 Corinthians 12:21-26)",
    learnMoreUrl: "/cephas/under-the-hood/heoho",
    learnMoreLabel: "The HEOHO Philosophy",
    elbowGreaseLevel: 1,
  },
  "heoho-title": {
    explanation: "Help Each Other, Help Ourselves — the foundational principle. Interdependence, not collectivism. Each person maintains individual agency.",
    connectedTo: "This philosophy powers every system: Cost+20% pricing, Marks from differential, BandWagon earned authority, and the Three-Currency economy.",
    why: "Interdependence preserves individual agency while creating collective benefit. Collectivism subordinates the individual — we don't do that. (1 Corinthians 12:21-26)",
    learnMoreUrl: "/cephas/under-the-hood/heoho",
    learnMoreLabel: "The HEOHO Philosophy",
    elbowGreaseLevel: 1,
  },
  "enter-watch-buttons": {
    explanation: "ENTER takes you into the platform. WATCH plays the Welcome Fable — a short animated story about why this exists and how it works.",
    connectedTo: "ENTER leads to Ghost World (explore freely) or the onboarding flow. WATCH triggers the Welcome Fable cinematic experience.",
    why: "Two clear paths: jump in or learn first. No one should feel forced to commit before understanding what they're joining.",
    elbowGreaseLevel: 1,
  },
  "durins-door": {
    explanation: "Durin's Door — the hidden keyhole in the 'O' of Ourselves. Enter the password to unlock special access (Hofund system).",
    connectedTo: "Part of the Hofund security system. Links to Crown Letter delegation chains and special-access areas.",
    why: "Some things should be discovered, not advertised. The hidden door rewards curious explorers and provides secure access to privileged features.",
    elbowGreaseLevel: 3,
  },

  // ─── WELCOME GATE / FABLE ───
  "welcomegate-fable": {
    explanation: "The Welcome Fable — a short animated story that introduces the platform's purpose. Plays once for first-time visitors.",
    learnMoreUrl: "/cephas/about/origin-story",
    learnMoreLabel: "The Origin Story",
    elbowGreaseLevel: 2,
  },
  "welcomegate-tabs": {
    explanation: "Navigation tabs for the welcome experience. Cinema-style controls let you pace the story.",
    elbowGreaseLevel: 1,
  },

  // ─── NAVIGATION & STRUCTURE ───
  "crows-nest": {
    explanation: "The Crow's Nest — a discovery flyover of the entire platform. Peek at any feature before diving in. Three depth levels: Glimpse, Peek, Tell Me More.",
    learnMoreUrl: "/cephas/under-the-hood/crows-nest",
    learnMoreLabel: "Crow's Nest Guide",
    elbowGreaseLevel: 1,
  },
  "patent-portfolio": {
    explanation: "The patent portfolio ticker. Shows the estimated value of the cooperative's IP holdings — 60% of Founder patents go to the platform.",
    learnMoreUrl: "/cephas/under-the-hood/ip-portfolio",
    learnMoreLabel: "IP Portfolio Details",
    elbowGreaseLevel: 1,
  },
  "alpha-badge": {
    explanation: "Alpha release indicator. The platform is live but in early access. Everything works, but expect rapid improvements.",
    elbowGreaseLevel: 1,
  },

  // ─── CURRENCY SYSTEM ───
  "credits-display": {
    explanation: "Credits — purchased with fiat ($1 = 1 Credit). Universal use, closed-loop (no cash-out). The everyday spending currency.",
    connectedTo: "Used to buy goods in the Mall, back Production Runs, purchase Cue Card decks, and pay for services. Feeds into Bounty payouts and Lark rewards.",
    why: "Closed-loop prevents extraction. Your dollar stays in the ecosystem working for everyone, not flowing out to outside owners. 1 Credit = 1 Mark = 1 Joule in value.",
    learnMoreUrl: "/cephas/under-the-hood/three-currencies",
    learnMoreLabel: "Three-Currency System",
    faqAnchorId: "three-currencies",
    elbowGreaseLevel: 2,
  },
  "marks-display": {
    explanation: "Marks — effort-debt currency earned through participation. Restricted to essentials (food, medical). Cleared by contributing to the cooperative.",
    connectedTo: "Earned from Bounties, Larks, and participation. Used for BandWagon project backing (earn SAA), Pledged Mark Voting, and Steward escrow. Backed Marks fund projects.",
    why: "Marks emerge from differential ONLY — never granted as gifts. This ensures every Mark represents real contribution. When you earn Marks, you've actually done something.",
    learnMoreUrl: "/cephas/under-the-hood/three-currencies",
    learnMoreLabel: "How Marks Work",
    faqAnchorId: "how-marks-work",
    elbowGreaseLevel: 2,
  },
  "joules-display": {
    explanation: "Joules — surplus storage with 'forever stamp' mechanic. Locks your exchange rate at purchase time. LB owns the Joules; you earn authority to direct them.",
    connectedTo: "Earned through Production Run backing (5x Pre-Mint multiplier). Powers governance weight and Service Allocation Authority. Not ownership — earned direction authority.",
    why: "The 'forever stamp' protects early supporters. If you buy Joules at today's rate, that rate is locked forever — like buying a stamp before the price goes up.",
    learnMoreUrl: "/cephas/under-the-hood/three-currencies",
    learnMoreLabel: "Joules Explained",
    faqAnchorId: "joules-forever-stamp",
    elbowGreaseLevel: 2,
  },

  // ─── BABYLON CANDLES ───
  "babylon-candle": {
    explanation: "Babylon Candles — one-use invitation tokens that transport someone directly into the platform. Like a teleportation spell from Stardust. Give one to someone you want to invite.",
    connectedTo: "Feeds the TasteMaker Trust Chain (attribution daisy chain, max 5 links). Your candle recipient becomes part of your referral network, earning you Pioneer-tier referral Marks.",
    why: "Personal invitation > mass marketing. When YOU give someone a candle, they arrive knowing someone real brought them here. That trust compounds through the attribution chain.",
    learnMoreUrl: "/cephas/under-the-hood/babylon-candles",
    learnMoreLabel: "Babylon Candle System",
    faqAnchorId: "babylon-candles",
    elbowGreaseLevel: 3,
  },
  "babylon-candle-card": {
    explanation: "Each candle is personalized with your name as the inviter. When someone lights it (uses the link), they arrive with your attribution permanently recorded.",
    connectedTo: "Links to Six-Tier Referral Rewards (Pioneer 10 Marks → Ambassador 1 Mark) and the Vouched By / Recommended By delegation system.",
    why: "Attribution matters. The person who planted the seed should always get credit. Timestamp-verified: the cue card must be sent BEFORE the person signs up.",
    learnMoreUrl: "/cephas/under-the-hood/babylon-candles",
    learnMoreLabel: "How Candles Work",
    faqAnchorId: "babylon-candles",
    elbowGreaseLevel: 3,
  },

  // ─── CUE CARDS ───
  "cue-card": {
    explanation: "Cue Cards — shareable recruitment cards included with your $5/year membership. Each card is both a benefit communication and a recruitment tool with your attribution code.",
    learnMoreUrl: "/cephas/under-the-hood/cue-cards",
    learnMoreLabel: "Cue Card System",
    faqAnchorId: "cue-cards",
    elbowGreaseLevel: 3,
  },

  // ─── INITIATIVES ───
  "lets-make-dinner": {
    explanation: "Let's Make Dinner — run a kitchen node. Cook meals for your community using pre-sold capacity. Church kitchens, food trucks, or home kitchens during off-hours.",
    connectedTo: "Uses Cold Start Recipe Cards for launch strategy. Captains get Naval Rank progression. Feeds Success Stories and the live ticker. Grocery nodes supply ingredients.",
    why: "Pre-sold capacity = zero startup risk. The 50% rule means you only cook what's already paid for. Every kitchen that sits empty 5 days a week is a wasted resource.",
    learnMoreUrl: "/initiatives/lets-make-dinner",
    learnMoreLabel: "Explore Let's Make Dinner",
    elbowGreaseLevel: 7,
  },
  "lets-get-groceries": {
    explanation: "Let's Get Groceries — aggregate buying power. Run a distribution hub that coordinates bulk purchasing and delivers groceries at volume-discount prices.",
    connectedTo: "Supplies ingredients to Kitchen Nodes. Uses Cold Start 'Grocery Run' strategy. Volume = savings that compound across households. Feeds into Success Ticker.",
    why: "You're going to the store this week anyway. Start by picking up groceries for one neighbor. Then five. Then the whole block. Aggregation creates savings no individual can access alone.",
    learnMoreUrl: "/initiatives/lets-get-groceries",
    learnMoreLabel: "Explore Let's Get Groceries",
    elbowGreaseLevel: 7,
  },
  "lets-go-shopping": {
    explanation: "Let's Go Shopping — curate local retail. Connect platform creators with local buyers through pop-ups, storefronts, or online showcases.",
    learnMoreUrl: "/initiatives/lets-go-shopping",
    learnMoreLabel: "Explore Let's Go Shopping",
    elbowGreaseLevel: 7,
  },
  "defense-klaus": {
    explanation: "Defense Klaus — community safety net. Passive abuse detection, Community Alert Network, and emergency support systems. The submarine blast door for families in crisis.",
    learnMoreUrl: "/initiatives/defense-klaus",
    learnMoreLabel: "Defense Klaus System",
    elbowGreaseLevel: 7,
  },

  // ─── BANDWAGON ───
  "bandwagon": {
    explanation: "BandWagon — back projects with Marks. If the project succeeds, you earn increased Service Allocation Authority. This is contribution impact — earned authority to allocate cooperative resources.",
    connectedTo: "Drives Production Runs (Fantasy Draft). Feeds TasteMaker Trust Chain and Taste Ranger progression (Scout → Luminary). Powers Backed Marks and Business Swoop mechanics.",
    why: "This is NOT a speculative return. This is earned authority to allocate cooperative resources based on demonstrated judgment. Your track record of picking winners = your allocation budget.",
    learnMoreUrl: "/cephas/under-the-hood/bandwagon",
    learnMoreLabel: "BandWagon Deep Dive",
    faqAnchorId: "bandwagon",
    elbowGreaseLevel: 2,
  },
  "bandwagon-card": {
    explanation: "BandWagon backing card. Shows project status, backers, and your potential SAA increase if the project succeeds.",
    connectedTo: "First 100 backers share influence proportionally (First-100 Rule). Links to Fantasy League prediction accuracy → unlocks real Backed Marks allocation.",
    why: "Positive-only QA — promotes, doesn't ding. Absence of backing is sufficient signal. No downvotes needed when attention is the currency.",
    learnMoreUrl: "/cephas/under-the-hood/bandwagon",
    elbowGreaseLevel: 2,
  },

  // ─── PRODUCTION RUNS ───
  "production-run": {
    explanation: "Production Run — a maker's product needs 500 pre-orders to trigger manufacturing. Zero risk (only produce what's pre-sold). First 100 backers get multiplier bonuses.",
    connectedTo: "Feeds BandWagon (back runs → earn SAA), Success Stories (completed runs become shareable), and the live Success Ticker. Makers earn XP through production labor formula.",
    why: "500 pre-orders means the maker has guaranteed revenue before producing a single unit. No speculative manufacturing. All pre-orders paid in full before production begins.",
    learnMoreUrl: "/production-runs",
    learnMoreLabel: "Browse Production Runs",
    faqAnchorId: "production-runs",
    elbowGreaseLevel: 7,
  },
  "production-run-draft": {
    explanation: "The Draft Board — Fantasy Football-style picking of production runs to back. Filter by trending, almost-funded, HexIsle-compatible, or new proposals.",
    connectedTo: "Your draft picks appear alongside the live Success Ticker so you can compare your picks with platform-wide results. Ties to TasteMaker progression and referral chains.",
    why: "Like Fantasy Football — you pick the projects you believe in, watch them fund and ship, and your track record builds your reputation. Prediction accuracy → real allocation authority.",
    learnMoreUrl: "/production-runs",
    elbowGreaseLevel: 2,
  },

  // ─── COLD START ───
  "cold-start-cards": {
    explanation: "Cold Start Recipe Cards — step-by-step playbooks for launching your node or project. Pick a strategy, follow the steps, scale when ready.",
    learnMoreUrl: "/cephas/under-the-hood/cold-start",
    learnMoreLabel: "Cold Start Strategies",
    elbowGreaseLevel: 7,
  },

  // ─── STEWARDS ───
  "steward-card": {
    explanation: "Steward system — project managers who pledge their own Marks (skin in the game). Pledged Marks are escrowed per-project. Released on success, absorbed on failure.",
    learnMoreUrl: "/cephas/under-the-hood/stewards",
    learnMoreLabel: "Steward System",
    faqAnchorId: "stewards",
    elbowGreaseLevel: 8,
  },

  // ─── GHOST WORLD ───
  "ghost-world": {
    explanation: "Ghost World — the pre-member experience. Browse freely, no account needed. Find Golden Keys, explore, build your ghost profile. Everything carries over when you join.",
    learnMoreUrl: "/ghost",
    learnMoreLabel: "Enter Ghost World",
    faqAnchorId: "ghost-world",
    elbowGreaseLevel: 1,
  },
  "ghost-profile": {
    explanation: "Your Ghost Profile tracks session time, pages visited, documents read, and golden keys found. Join to save permanently.",
    elbowGreaseLevel: 1,
  },
  "golden-keys": {
    explanation: "Golden Keys — hidden puzzles scattered across Cephas articles. Find them to unlock rewards and prove your exploration depth.",
    faqAnchorId: "golden-keys",
    elbowGreaseLevel: 3,
  },

  // ─── XP & REPUTATION ───
  "xp-score": {
    explanation: "XP Score — multiplicative accomplishment metric. XP = Accomplishment Score × Bounty Points. Aggregate and cumulative — never decreases.",
    learnMoreUrl: "/cephas/under-the-hood/xp-system",
    learnMoreLabel: "XP Score System",
    faqAnchorId: "xp-score",
    elbowGreaseLevel: 2,
  },

  // ─── COVERAGE MINUTES ───
  "coverage-minutes": {
    explanation: "Coverage Minutes / The Muffled Rule — speaking time is gated by listening time. 3-minute chunks, 180-minute cap, 90-day expiry. Earn the right to speak by listening first.",
    learnMoreUrl: "/cephas/under-the-hood/muffled-rule",
    learnMoreLabel: "The Muffled Rule",
    faqAnchorId: "coverage-minutes",
    elbowGreaseLevel: 2,
  },

  // ─── SPONSOR ───
  "plant-a-seed": {
    explanation: "Plant a Seed — every $5 sponsors one membership. That person gets a year of access, credits to start, and a real shot at building something. You see their milestone progress.",
    learnMoreUrl: "/sponsor",
    learnMoreLabel: "Sponsor Portal",
    elbowGreaseLevel: 2,
  },
  "plant-seeds-explainer": {
    explanation: "Back early, earn more. Support projects at various production levels and receive Joule multipliers. The earlier you believe, the more you earn.",
    learnMoreUrl: "/plant-seeds",
    elbowGreaseLevel: 2,
  },

  // ─── HEXISLE ───
  "hexisle": {
    explanation: "HexIsle / Tereno — the hexagonal terrain board game system. 60mm tiles with water table integration, compliant mechanisms, and the definitive 27-piece stack.",
    learnMoreUrl: "https://hexisle.web.app",
    learnMoreLabel: "HexIsle Portal",
    elbowGreaseLevel: 4,
  },

  // ─── LEGAL / TRANSPARENCY ───
  "fly-on-the-wall": {
    explanation: "Fly on the Wall — the public ledger. Real bank transactions proving the system works. Complete transparency. Test-Net By Design.",
    learnMoreUrl: "/fly-on-the-wall",
    learnMoreLabel: "View Public Ledger",
    faqAnchorId: "fly-on-the-wall",
    elbowGreaseLevel: 1,
  },
  "cost-plus-20": {
    explanation: "Cost + 20% — the platform's pricing model. Sellers set prices. Market discovery. 20% floor ensures sustainability without extraction. Creator keeps 83.3%.",
    learnMoreUrl: "/cephas/under-the-hood/economic-model",
    learnMoreLabel: "Economic Model",
    faqAnchorId: "cost-plus-20",
    elbowGreaseLevel: 1,
  },

  // ─── BOUNTIES / LARKS ───
  "bounty-board": {
    explanation: "Bounty Board — tasks posted by the platform or members. Complete a bounty to earn Credits and XP. STAMP verification required.",
    learnMoreUrl: "/bounties",
    learnMoreLabel: "View Bounties",
    elbowGreaseLevel: 3,
  },
  "lark-submission": {
    explanation: "Lark — your feedback, idea, or bug report for any platform component. Accepted Larks earn Credits + Marks. Every contribution is tracked on the IP ledger.",
    elbowGreaseLevel: 2,
  },

  // ─── SUCCESS STORIES ───
  "success-stories": {
    explanation: "Success Stories — real results from real members. Shared because they chose to. Anonymizable: 'Member 458 in Chicago sold 2,300 units this week.'",
    elbowGreaseLevel: 1,
  },
  "success-ticker": {
    explanation: "Live activity ticker showing anonymized platform achievements in real-time. Production runs funded, nodes launched, milestones reached.",
    elbowGreaseLevel: 1,
  },

  // ─── GUILDS ───
  "guild-hub": {
    explanation: "Guild Hub — professional communities organized by skill and initiative. Join a guild to access training, mentorship, and crew formation.",
    learnMoreUrl: "/guilds",
    learnMoreLabel: "Browse Guilds",
    faqAnchorId: "guilds",
    elbowGreaseLevel: 7,
  },

  // ─── FOOTER ───
  "platform-footer": {
    explanation: "Platform footer — links to legal, community, and platform tools. 2,097 patent claims, 2,128 innovations. Service sponsorship, not securities.",
    elbowGreaseLevel: 1,
  },

  // ─── SIX DEGREES ───
  "six-degrees": {
    explanation: "Six Degrees of Separation — the universal connection engine. Bounty campaigns that leverage social networks to reach anyone: outreach (Crown Letters), medical (rare specialist access), and opportunity (job/mentorship connections).",
    connectedTo: "Feeds into Herald referral chains, Babylon Candles, and the TasteMaker Trust Chain. Each referral hop is tracked and rewarded. Backer campaigns fund the bounties.",
    why: "You already know someone who knows someone. Six Degrees turns that latent social capital into directed action — finding a transplant surgeon, reaching a celebrity for a Crown Letter, or connecting a veteran to a job.",
    learnMoreUrl: "/six-degrees",
    learnMoreLabel: "Six Degrees Engine",
    faqAnchorId: "six-degrees",
    elbowGreaseLevel: 3,
  },

  // ─── CHALK OUTLINE ONBOARDING ───
  "chalk-outline-onboarding": {
    explanation: "Chalk Outline Onboarding — project creation as a coloring book. New creators see a translucent overlay with dashed chalk outlines for every field. Fill in a section and it solidifies. Lock completed sections, preview your live page, and launch when ready.",
    connectedTo: "Powers the /create route and Creator Invite system. Drafted data persists to Supabase project_drafts. On launch, creates a live products entry. Ties into the CREATOR_INVITE_FIELDS template for invited creators.",
    why: "Nobody likes blank forms. The chalk outline shows exactly what the finished page looks like — you just color it in. Reduces creator friction from 'what do I do?' to 'fill this in.' Progress bar and lock/unlock give a sense of momentum.",
    learnMoreUrl: "/create",
    learnMoreLabel: "Try It Now",
    faqAnchorId: "chalk-outline",
    elbowGreaseLevel: 4,
  },

  // ─── DOUBLE-DIPPING & STACKING ───
  "double-dipping-stacking": {
    explanation: "Double-Dipping and Stacking — reward layers that intentionally compound. Like an ice cream cone: each scoop is a separate reward, and they stack. Herald referral bonus + BandWagon SAA increase + Production Run early-backer multiplier + Guild XP = four scoops from one action.",
    connectedTo: "Ties into Credits, Marks, Joules, XP, SAA, Herald rewards, BandWagon, and Production Run backing. Every system is designed to create at least two reward pathways per action.",
    why: "Traditional platforms penalize 'double-dipping.' We encourage it. If one action genuinely serves multiple community goals, why wouldn't we reward all of them? The ice cream cone model: each scoop costs us nothing extra because the value was already created.",
    faqAnchorId: "double-dipping",
    elbowGreaseLevel: 2,
  },

  // ─── STAR CHAMBER ───
  "star-chamber": {
    explanation: "Star Chamber — multi-AI governance verification. Seven specialized AI agents (Knight, Bishop, Rook, Pawn, Queen, King, Jester) evaluate platform decisions. 5 of 7 must agree before any system-level action proceeds. Dissenting opinions are recorded and published.",
    connectedTo: "Feeds into Fly on the Wall transparency ledger. Each Star Chamber ruling is timestamped and publicly auditable. Connects to the STAMP verification system for bounty/quality assurance.",
    why: "No single AI — and no single human — should have unchecked authority over community decisions. Seven diverse agents with different optimization functions (legal, technical, ethical, financial, creative, strategic, adversarial) catch blind spots that any one perspective would miss.",
    learnMoreUrl: "/cephas/under-the-hood/star-chamber",
    learnMoreLabel: "Star Chamber Governance",
    faqAnchorId: "star-chamber",
    elbowGreaseLevel: 1,
  },

  // ─── LIFECOMPASS ───
  "life-compass": {
    explanation: "LifeCompass — personal goal tracking integrated into the platform. Set milestones (financial, educational, health, career), track progress, and receive personality-matched recommendations for initiatives, guilds, and bounties that align with your stated goals.",
    connectedTo: "Connects to Guild recommendations, Bounty matching, Initiative suggestions, and the XP system. Your LifeCompass goals influence which Cold Start Recipe Cards are suggested and which Production Runs appear in your feed.",
    why: "A cooperative that doesn't help you reach your personal goals isn't cooperating. LifeCompass ensures every platform interaction moves you toward something you actually want — not just what the algorithm thinks will keep you scrolling.",
    elbowGreaseLevel: 2,
  },

  // ─── WHY NO ADS / WHY NO VC ───
  "why-no-ads-vc": {
    explanation: "Why No Ads and Why No V.C. — two philosophy pages explaining the platform's funding model. No external advertising (growth is word-of-mouth via Heralds). No venture capital (funded by patents and grit, 100% member-owned). Every dollar that would go to Big Tech or backers goes to the community instead.",
    connectedTo: "Ties to the Herald system (referral bonuses replace ad spend), the patent portfolio (11 provisionals with 2,128 innovations replace VC runway), and the Joules system (early supporters get forever-stamp rates instead of dilution).",
    why: "If you take ad money, users become the product. If you take VC money, the exit becomes the product. We took neither, so the cooperative stays the product — owned by and for its members.",
    learnMoreUrl: "/why-no-ads",
    learnMoreLabel: "Why No Ads?",
    faqAnchorId: "no-ads",
    elbowGreaseLevel: 1,
  },

  // ─── HEXISLE PIECES (27 canonical components) ───
  "hexisle-swan-neck": {
    explanation: "Swan Neck — inter-Hexel dual-channel hydraulic connector. Routes water between adjacent Hexels through two opposing flow channels.",
    connectedTo: "Layer 0 (inter-Hexel). Connects to Channel Lock on each Hexel. Part of the hydraulic power chain from the Water Table.",
    why: "Without a connector between tiles, the hydraulic system stops at the tile boundary. The Swan Neck is the plumbing between rooms.",
    faqAnchorId: "hexisle-swan-neck",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    learnMoreUrl: "/hexisle/downloads",
    learnMoreLabel: "Download STL",
    elbowGreaseLevel: 4,
  },
  "hexisle-snap-cap-connector": {
    explanation: "Snap-Cap Connector — waterproof snap-fit coupling between Hexels. Mates with the Swan Neck for tool-free assembly.",
    connectedTo: "Layer 0 (inter-Hexel). Pairs with Swan Neck. Part of the weatherproof seal system.",
    faqAnchorId: "hexisle-snap-cap-connector",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-channel-lock": {
    explanation: "Channel Lock — foundation piece. 60mm diameter, 9mm tall, three grooves channel water inflow from Swan Neck upward into the Hollow Log.",
    connectedTo: "Layer 1 (base). Receives water from Swan Neck, feeds Hollow Log. The floor of every Hexel.",
    faqAnchorId: "hexisle-channel-lock",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-hollow-log": {
    explanation: "Hollow Log — central fluid column, 15.5mm diameter. The main highway for water flowing up through the Hexel.",
    connectedTo: "Layer 2 (column). Sits inside Channel Lock, feeds Golden Lotus above. Carries the 2.17 psi water from the Water Table.",
    faqAnchorId: "hexisle-hollow-log",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-clamshell": {
    explanation: "Clamshell — two-part (SnapCap/SnapBottom) waterproof housing for the Golden Lotus and Rotor. Snap-fit, no adhesive.",
    connectedTo: "Layers 3+5 (clamshell). Encloses the actuator and rotor. Waterproofing layer between fluid mechanics and gear train.",
    faqAnchorId: "hexisle-clamshell",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-golden-lotus": {
    explanation: "Golden Lotus — 6 Tesla-valve cups with Rooster Teeth. Converts alternating-current water flow into unidirectional rotation. The heart of every Hexel.",
    connectedTo: "Layer 4 (actuator). Receives fluid from Hollow Log, drives Rotor. Named for its lotus-petal Tesla valve geometry.",
    why: "Traditional valves use moving parts that wear out. Tesla valves have NO moving parts — the geometry itself forces one-way flow. Six cups means six pulses per cycle.",
    faqAnchorId: "hexisle-golden-lotus",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-rooster-teeth": {
    explanation: "Rooster Teeth — flow-directing ratchet teeth inside the Golden Lotus. Convert bidirectional AC water pulses into unidirectional rotation.",
    connectedTo: "Layer 4 (sub-component of Golden Lotus). Part of the AC-to-DC flow conversion chain.",
    faqAnchorId: "hexisle-rooster-teeth",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-rotor": {
    explanation: "Rotor — 18 closed cavities, full 12mm height. Permanently attached to Ouralis after printing. Spins with the converted water flow.",
    connectedTo: "Layer 6 (rotor). Driven by Golden Lotus, drives Ouralis gear. Permanently bonded post-print.",
    faqAnchorId: "hexisle-rotor",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-ouralis": {
    explanation: "Ouralis — 20-tooth dual-level gear with 3 cam slopes for tide simulation. The primary gear connecting water power to mechanical action.",
    connectedTo: "Layer 7 (primary gear). Driven by Rotor, drives 3× PGears at 6.67:1 speed ratio. The cam slopes create the ocean tide rhythm.",
    faqAnchorId: "hexisle-ouralis",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-pgear": {
    explanation: "PGear — three peripheral gears at Hexel vertices. Mushroom-head shafts with NeedleValve center. 20:3 gear ratio = 6.67× Ouralis speed.",
    connectedTo: "Layer 8 (PGear shafts). Driven by Ouralis, drives Main Gear at 12× Ouralis speed. Three per Hexel at the vertices.",
    faqAnchorId: "hexisle-pgear",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-needle-valve": {
    explanation: "Needle Valve — precision flow control at PGear center. Fine-tunes water flow through each peripheral gear shaft.",
    connectedTo: "Layer 8 (sub-component of PGear). Allows per-vertex flow tuning — different Hexels can run at different speeds.",
    faqAnchorId: "hexisle-needle-valve",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-sawtooth-coral": {
    explanation: "Sawtooth Coral — ship keel engagement piece with slanted sides at 6 different angles. Enables terrain-based ship movement mechanics.",
    connectedTo: "Layer 9 (terrain gear). Engages with ship keels for movement. Six angles = six hex directions.",
    faqAnchorId: "hexisle-sawtooth-coral",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-timing-belt": {
    explanation: "Timing Belt — hidden countdown mechanism below the Sawtooth mushroom. Configurable: 3 notches = trap trigger, 6 notches = portal event.",
    connectedTo: "Layer 9 (optional). Counts gear revolutions → triggers events. The game clock hidden inside terrain.",
    faqAnchorId: "hexisle-timing-belt",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-main-gear": {
    explanation: "Main Gear — driven by 3× PGears at 12× Ouralis speed. The high-speed output that powers wave generators and trap mechanisms.",
    connectedTo: "Layer 10 (output gear). Final mechanical output. Drives Football cam, wave generator, or trap mechanisms depending on Hexel configuration.",
    faqAnchorId: "hexisle-main-gear",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-cradle": {
    explanation: "Cradle — dynamic platform that goes UP AND DOWN. Flips like SlottedTop. Trap trigger = Cradle flip. Football wave gen rides inside.",
    connectedTo: "Layer 11 (dynamic). The moving part that creates waves or triggers traps. Carries the Football cam follower.",
    faqAnchorId: "hexisle-cradle",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-football": {
    explanation: "Football — cam follower for variable-amplitude wave generation. Rides inside the Cradle. Oval shape converts rotation to oscillation.",
    connectedTo: "Layer 11 (sub-component). Creates the ocean waves by converting Main Gear rotation into up-down Cradle motion.",
    faqAnchorId: "hexisle-football",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-capstone": {
    explanation: "Capstone — static terrain surface. The top visual layer that players see. Sits above the Cradle for land-type Hexels.",
    connectedTo: "Layer 12 (surface). The 'ground' that game pieces stand on. Swappable for different biome types.",
    faqAnchorId: "hexisle-capstone",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-capwave": {
    explanation: "Capwave — moving water surface. Oscillates with the Cradle to create visible wave motion. The ocean equivalent of the Capstone.",
    connectedTo: "Layer 12 (surface). Moves with Cradle motion → visible waves. Ships ride on the Capwave surface.",
    faqAnchorId: "hexisle-capwave",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-slotted-top": {
    explanation: "SlottedTop — terrain piece with Flying Buttress slots. Accepts buildings, fenceposts, and character bases. The 'soil' layer of the Hexel.",
    connectedTo: "Layer 11 (terrain). Sits on Cradle. SlottedTop + FlyingButtress = the building foundation system.",
    faqAnchorId: "hexisle-slotted-top",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-gorgon": {
    explanation: "Gorgon — decorative crown piece. Sits atop the Hexel stack as a visual accent. Named for its Medusa-like radial geometry.",
    connectedTo: "Layer 12 (decoration). Optional aesthetic piece. Different Gorgon designs per biome.",
    faqAnchorId: "hexisle-gorgon",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-roots": {
    explanation: "Roots — player-controlled pneumatic direction system. Redirects air piston output to choose which plant grows. One-way ball valves.",
    connectedTo: "Pneumatic branch. Player decision point: choose which direction to grow plants → different game outcomes.",
    faqAnchorId: "hexisle-roots",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-telescoping-plant": {
    explanation: "Telescoping Plant — ratchet segments that extend upward when pneumatically pumped. Grow plants by 'watering' them with air pressure.",
    connectedTo: "Pneumatic branch. Driven by Roots direction choice. Extends in discrete segments → bloom sequence → Flying Flower launch.",
    faqAnchorId: "hexisle-telescoping-plant",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-nue-wall": {
    explanation: "Nue Wall — defensive terrain wall piece. Slots into the Hexel edge for castle, cliff, or barrier terrain configurations.",
    connectedTo: "Layer 11 (terrain modifier). Creates elevation changes and defensive positions. Named after the Japanese chimera.",
    faqAnchorId: "hexisle-nue-wall",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-ring-of-power": {
    explanation: "Ring of Power — magnetic influence zone ring. Defines the area of effect for character abilities and terrain triggers.",
    connectedTo: "Layer 10 (interaction). Characters within the Ring trigger Hexel events. Magnetic coupling to character base magnets.",
    faqAnchorId: "hexisle-ring-of-power",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-one-way-valve": {
    explanation: "One-Way Valve — ball valve preventing backflow in the pneumatic system. Ensures air pressure builds in one direction only.",
    connectedTo: "Pneumatic branch. Prevents air from flowing backward when players pump the character's air piston.",
    faqAnchorId: "hexisle-one-way-valve",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-tripod-vertices-anchor": {
    explanation: "Tripod Vertices Anchor — three-point mounting system at Hexel vertices. Locks pieces in place across the three PGear shaft positions.",
    connectedTo: "Layer 8 (structural). Provides rigid mounting for PGear shafts and terrain pieces. Three-point = stable on any surface.",
    faqAnchorId: "hexisle-tripod-vertices-anchor",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },
  "hexisle-snap-base": {
    explanation: "Snap Base — quick-connect base for character figures and buildings. Snaps into SlottedTop without tools. The 'parking spot' for game pieces.",
    connectedTo: "Layer 11 (mounting). Characters and buildings attach here. Magnetic alignment + snap-fit = no fumbling during gameplay.",
    faqAnchorId: "hexisle-snap-base",
    piggybackUrl: "/hexisle/downloads#submit",
    innovationNumber: 1537,
    elbowGreaseLevel: 4,
  },

  // ═══════════════════════════════════════════════════════════════
  // MISSION ONE PAGE — B087
  // ═══════════════════════════════════════════════════════════════
  "mission-one-page": {
    explanation: "Mission ONE: the cooperative's charitable food program. Bishop Myriel's principle — set another place at the table, no questions asked.",
    connectedTo: "Links to Gleaner's Corner (3.3% fund), subscription flow, and Missions Two (Housing) and Three (Transportation).",
    why: "The first mission frames the cooperative as a community that feeds its members with dignity, not charity.",
    elbowGreaseLevel: 2,
  },
  "mission-one-hero": {
    explanation: "Hero banner: 'Everyone Eats Tonight.' Mission ONE's purpose stated in four words.",
    connectedTo: "Sets page intent before members explore the How It Works section below.",
    why: "Clear orientation first. Members know exactly what this page is about.",
    elbowGreaseLevel: 1,
  },
  "mission-one-bishop-frame": {
    explanation: "Narrative frame from Les Misérables: Bishop Myriel set a place for anyone at his table. No separate dining room. Just another place.",
    connectedTo: "Philosophical anchor for the entire program. Hospitality, not handout.",
    why: "Narrative framing establishes dignity-first cooperative identity.",
    elbowGreaseLevel: 1,
  },
  "mission-one-how-it-works": {
    explanation: "Four-step flow: Charity Medallion QR cards → Same Menu No Stigma → Let's Make Dinner delivery → Funded by 3.3% Network.",
    connectedTo: "Feeds from QR card system, restaurant partnerships, and Gleaner's Corner charitable fund.",
    why: "Members need to understand the mechanics before deciding to contribute.",
    elbowGreaseLevel: 2,
  },
  "mission-one-contribute": {
    explanation: "Three contribution paths: earmark credits to your city, fund monthly meal subscriptions, or monitor Gleaner's Corner growth.",
    connectedTo: "Links to Gleaner's Corner and subscription flow.",
    why: "Multiple paths accommodate different commitment levels. Everyone can participate.",
    elbowGreaseLevel: 2,
  },
  "mission-one-next-missions": {
    explanation: "Forward look: Mission TWO is Cooperative Housing. Mission THREE is Cooperative Transportation (Rideshare Routes — the Hood Uber fix).",
    connectedTo: "Links to /housing and /rideshare. Shows Mission ONE is first of three core initiatives.",
    why: "The cooperative doesn't stop at the dinner table. Food → Housing → Transportation.",
    elbowGreaseLevel: 1,
  },
  "mission-one-cta": {
    explanation: "Primary action: Fund a Meal Subscription. 28 meals per person per month from local restaurants.",
    connectedTo: "Leads to /subscribe flow. Tracks subscription creation.",
    why: "Clear final action after understanding the mission.",
    elbowGreaseLevel: 1,
  },

  // ═══════════════════════════════════════════════════════════════
  // GLEANER'S CORNER PAGE — B087
  // ═══════════════════════════════════════════════════════════════
  "gleaners-corner-page": {
    explanation: "Transparency hub: 3.3% of every transaction flows here. Members see where the charitable fund goes and direct it.",
    connectedTo: "Receives earmarks from subscription flow and wallet actions. Deploys to Mission ONE restaurants and nodes.",
    why: "Full transparency on charitable fund flow builds trust. This is the members' collective fund, not top-down charity.",
    elbowGreaseLevel: 2,
  },
  "gleaners-corner-hero": {
    explanation: "Gleaner's Corner header. The 3.3% is built into Cost+20% — it's not a fee on top. The creator still keeps 83.3%.",
    connectedTo: "Frames the page as a transparency tool for the network's charitable giving.",
    why: "Members should immediately understand this is their collective fund.",
    elbowGreaseLevel: 1,
  },
  "gleaners-corner-explanation": {
    explanation: "How the 3.3% works: automatic allocation from every transaction, earmarked by members, deployed to local nodes and restaurants.",
    connectedTo: "Ties to the Cost+20% economic model. Explains why creators still keep 83.3%.",
    why: "Full transparency prevents suspicion. Members choose where their 3.3% goes.",
    elbowGreaseLevel: 2,
  },
  "gleaners-corner-fund-distribution": {
    explanation: "Live chart showing fund allocation across initiatives: Let's Make Dinner, Let's Get Groceries, Let's Go Shopping, Mission ONE General.",
    connectedTo: "Updates real-time from earmarked_credits table. Shows collective member priorities.",
    why: "Visual democracy. Members see what the network collectively chose to fund.",
    elbowGreaseLevel: 2,
  },
};

/**
 * Look up a glossary entry by xray ID.
 * Returns undefined if no entry exists (overlay will show just the name).
 */
export function getXRayExplanation(id: string): XRayGlossaryEntry | undefined {
  return XRAY_GLOSSARY[id] || XRAY_GLOSSARY[id.toLowerCase()];
}
