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
}

/**
 * Glossary lookup map. Keys are data-xray-id values (lowercase, kebab-case).
 */
export const XRAY_GLOSSARY: Record<string, XRayGlossaryEntry> = {
  // ─── LANDING / HERO ───
  "main-card": {
    explanation: "The main hero card. HEOHO — Help Each Other Help Ourselves. This is the first thing visitors see.",
    connectedTo: "Leads to Ghost World (explore freely) or Real World (join for $5/year). Feeds into the Welcome Fable for first-time visitors.",
    why: "Every visitor should immediately understand what this platform is about — interdependence, not charity. The hero sets the tone for everything that follows.",
    learnMoreUrl: "https://cephas.lianabanyan.com/about",
    learnMoreLabel: "About Liana Banyan",
  },
  "hero-card": {
    explanation: "The flip card shows two sides of the platform story. Click or tap to flip between them.",
    connectedTo: "The two sides represent the dual nature of the platform — what you give and what you receive. Ties to the C+20 reciprocity model.",
    why: "Showing both sides in one card communicates that participation is a two-way street — not donation, not extraction.",
  },
  "hero-section": {
    explanation: "The main hero card. HEOHO — Help Each Other Help Ourselves. This is the first thing visitors see.",
    connectedTo: "Leads to Ghost World (explore freely) or Real World (join for $5/year). Feeds into the Welcome Fable for first-time visitors.",
    why: "Every visitor should immediately understand what this platform is about — interdependence, not charity. The hero sets the tone for everything that follows.",
    learnMoreUrl: "https://cephas.lianabanyan.com/about",
    learnMoreLabel: "About Liana Banyan",
  },
  "hero-flip-card": {
    explanation: "The flip card shows two sides of the platform story. Click or tap to flip between them.",
    connectedTo: "The two sides represent the dual nature of the platform — what you give and what you receive. Ties to the C+20 reciprocity model.",
    why: "Showing both sides in one card communicates that participation is a two-way street — not donation, not extraction.",
  },
  "rotating-quotes": {
    explanation: "Rotating testimonial quotes from members and supporters. Real voices showing real impact — auto-cycles every few seconds.",
    connectedTo: "Feeds from Success Stories and member testimonials. Each quote links to the member's public profile or story if they've opted in.",
    why: "Social proof from real people beats any marketing copy. Seeing someone like you succeed makes the possibility real.",
  },
  "cooperative-commerce-header": {
    explanation: "The 'Cooperative Commerce' header — this platform is a worker-owned cooperative, not a corporation extracting value. Cost+20% pricing, member-governed.",
    connectedTo: "Ties directly to the C+20 economic model, Fly on the Wall transparency ledger, and the 16 initiatives funded by the 20% margin.",
    why: "Naming what we are up front. Not 'social enterprise' or 'marketplace' — cooperative commerce. The words matter because the structure matters.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/economic-model",
    learnMoreLabel: "Economic Model",
  },
  "heoho-headline": {
    explanation: "Help Each Other, Help Ourselves — the foundational principle. Interdependence, not collectivism. Each person maintains individual agency.",
    connectedTo: "This philosophy powers every system: Cost+20% pricing, Marks from differential, BandWagon earned authority, and the Three-Currency economy.",
    why: "Interdependence preserves individual agency while creating collective benefit. Collectivism subordinates the individual — we don't do that. (1 Corinthians 12:21-26)",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/heoho",
    learnMoreLabel: "The HEOHO Philosophy",
  },
  "heoho-title": {
    explanation: "Help Each Other, Help Ourselves — the foundational principle. Interdependence, not collectivism. Each person maintains individual agency.",
    connectedTo: "This philosophy powers every system: Cost+20% pricing, Marks from differential, BandWagon earned authority, and the Three-Currency economy.",
    why: "Interdependence preserves individual agency while creating collective benefit. Collectivism subordinates the individual — we don't do that. (1 Corinthians 12:21-26)",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/heoho",
    learnMoreLabel: "The HEOHO Philosophy",
  },
  "enter-watch-buttons": {
    explanation: "ENTER takes you into the platform. WATCH plays the Welcome Fable — a short animated story about why this exists and how it works.",
    connectedTo: "ENTER leads to Ghost World (explore freely) or the onboarding flow. WATCH triggers the Welcome Fable cinematic experience.",
    why: "Two clear paths: jump in or learn first. No one should feel forced to commit before understanding what they're joining.",
  },
  "durins-door": {
    explanation: "Durin's Door — the hidden keyhole in the 'O' of Ourselves. Enter the password to unlock special access (Hofund system).",
    connectedTo: "Part of the Hofund security system. Links to Crown Letter delegation chains and special-access areas.",
    why: "Some things should be discovered, not advertised. The hidden door rewards curious explorers and provides secure access to privileged features.",
  },

  // ─── WELCOME GATE / FABLE ───
  "welcomegate-fable": {
    explanation: "The Welcome Fable — a short animated story that introduces the platform's purpose. Plays once for first-time visitors.",
    learnMoreUrl: "https://cephas.lianabanyan.com/about/origin-story",
    learnMoreLabel: "The Origin Story",
  },
  "welcomegate-tabs": {
    explanation: "Navigation tabs for the welcome experience. Cinema-style controls let you pace the story.",
  },

  // ─── NAVIGATION & STRUCTURE ───
  "crows-nest": {
    explanation: "The Crow's Nest — a discovery flyover of the entire platform. Peek at any feature before diving in. Three depth levels: Glimpse, Peek, Tell Me More.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/crows-nest",
    learnMoreLabel: "Crow's Nest Guide",
  },
  "patent-portfolio": {
    explanation: "The patent portfolio ticker. Shows the estimated value of the cooperative's IP holdings — 60% of Founder patents go to the platform.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/ip-portfolio",
    learnMoreLabel: "IP Portfolio Details",
  },
  "alpha-badge": {
    explanation: "Alpha release indicator. The platform is live but in early access. Everything works, but expect rapid improvements.",
  },

  // ─── CURRENCY SYSTEM ───
  "credits-display": {
    explanation: "Credits — purchased with fiat ($1 = 1 Credit). Universal use, closed-loop (no cash-out). The everyday spending currency.",
    connectedTo: "Used to buy goods in the Mall, back Production Runs, purchase Cue Card decks, and pay for services. Feeds into Bounty payouts and Lark rewards.",
    why: "Closed-loop prevents extraction. Your dollar stays in the ecosystem working for everyone, not flowing out to shareholders. 1 Credit = 1 Mark = 1 Joule in value.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/three-currencies",
    learnMoreLabel: "Three-Currency System",
  },
  "marks-display": {
    explanation: "Marks — effort-debt currency earned through participation. Restricted to essentials (food, medical). Cleared by contributing to the cooperative.",
    connectedTo: "Earned from Bounties, Larks, and participation. Used for BandWagon project backing (earn SAA), Pledged Mark Voting, and Steward escrow. Backed Marks fund projects.",
    why: "Marks emerge from differential ONLY — never granted as gifts. This ensures every Mark represents real contribution. When you earn Marks, you've actually done something.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/three-currencies",
    learnMoreLabel: "How Marks Work",
  },
  "joules-display": {
    explanation: "Joules — surplus storage with 'forever stamp' mechanic. Locks your exchange rate at purchase time. LB owns the Joules; you earn authority to direct them.",
    connectedTo: "Earned through Production Run backing (5x Pre-Mint multiplier). Powers governance weight and Service Allocation Authority. Not ownership — earned direction authority.",
    why: "The 'forever stamp' protects early supporters. If you buy Joules at today's rate, that rate is locked forever — like buying a stamp before the price goes up.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/three-currencies",
    learnMoreLabel: "Joules Explained",
  },

  // ─── BABYLON CANDLES ───
  "babylon-candle": {
    explanation: "Babylon Candles — one-use invitation tokens that transport someone directly into the platform. Like a teleportation spell from Stardust. Give one to someone you want to invite.",
    connectedTo: "Feeds the TasteMaker Trust Chain (attribution daisy chain, max 5 links). Your candle recipient becomes part of your referral network, earning you Pioneer-tier referral Marks.",
    why: "Personal invitation > mass marketing. When YOU give someone a candle, they arrive knowing someone real brought them here. That trust compounds through the attribution chain.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/babylon-candles",
    learnMoreLabel: "Babylon Candle System",
  },
  "babylon-candle-card": {
    explanation: "Each candle is personalized with your name as the inviter. When someone lights it (uses the link), they arrive with your attribution permanently recorded.",
    connectedTo: "Links to Six-Tier Referral Rewards (Pioneer 10 Marks → Ambassador 1 Mark) and the Vouched By / Recommended By delegation system.",
    why: "Attribution matters. The person who planted the seed should always get credit. Timestamp-verified: the cue card must be sent BEFORE the person signs up.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/babylon-candles",
    learnMoreLabel: "How Candles Work",
  },

  // ─── CUE CARDS ───
  "cue-card": {
    explanation: "Cue Cards — shareable recruitment cards included with your $5/year membership. Each card is both a benefit communication and a recruitment tool with your attribution code.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/cue-cards",
    learnMoreLabel: "Cue Card System",
  },

  // ─── INITIATIVES ───
  "lets-make-dinner": {
    explanation: "Let's Make Dinner — run a kitchen node. Cook meals for your community using pre-sold capacity. Church kitchens, food trucks, or home kitchens during off-hours.",
    connectedTo: "Uses Cold Start Recipe Cards for launch strategy. Captains get Naval Rank progression. Feeds Success Stories and the live ticker. Grocery nodes supply ingredients.",
    why: "Pre-sold capacity = zero startup risk. The 50% rule means you only cook what's already paid for. Every kitchen that sits empty 5 days a week is a wasted resource.",
    learnMoreUrl: "/initiatives/lets-make-dinner",
    learnMoreLabel: "Explore Let's Make Dinner",
  },
  "lets-get-groceries": {
    explanation: "Let's Get Groceries — aggregate buying power. Run a distribution hub that coordinates bulk purchasing and delivers groceries at volume-discount prices.",
    connectedTo: "Supplies ingredients to Kitchen Nodes. Uses Cold Start 'Grocery Run' strategy. Volume = savings that compound across households. Feeds into Success Ticker.",
    why: "You're going to the store this week anyway. Start by picking up groceries for one neighbor. Then five. Then the whole block. Aggregation creates savings no individual can access alone.",
    learnMoreUrl: "/initiatives/lets-get-groceries",
    learnMoreLabel: "Explore Let's Get Groceries",
  },
  "lets-go-shopping": {
    explanation: "Let's Go Shopping — curate local retail. Connect platform creators with local buyers through pop-ups, storefronts, or online showcases.",
    learnMoreUrl: "/initiatives/lets-go-shopping",
    learnMoreLabel: "Explore Let's Go Shopping",
  },
  "defense-klaus": {
    explanation: "Defense Klaus — community safety net. Passive abuse detection, Community Alert Network, and emergency support systems. The submarine blast door for families in crisis.",
    learnMoreUrl: "/initiatives/defense-klaus",
    learnMoreLabel: "Defense Klaus System",
  },

  // ─── BANDWAGON ───
  "bandwagon": {
    explanation: "BandWagon — back projects with Marks. If the project succeeds, you earn increased Service Allocation Authority. Not investment return — earned authority to allocate cooperative resources.",
    connectedTo: "Drives Production Runs (Fantasy Draft). Feeds TasteMaker Trust Chain and Taste Ranger progression (Scout → Luminary). Powers Backed Marks and Business Swoop mechanics.",
    why: "This is NOT an investment return. This is earned authority to allocate cooperative resources based on demonstrated judgment. Your track record of picking winners = your allocation budget.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/bandwagon",
    learnMoreLabel: "BandWagon Deep Dive",
  },
  "bandwagon-card": {
    explanation: "BandWagon backing card. Shows project status, backers, and your potential SAA increase if the project succeeds.",
    connectedTo: "First 100 backers share influence proportionally (First-100 Rule). Links to Fantasy League prediction accuracy → unlocks real Backed Marks allocation.",
    why: "Positive-only QA — promotes, doesn't ding. Absence of backing is sufficient signal. No downvotes needed when attention is the currency.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/bandwagon",
  },

  // ─── PRODUCTION RUNS ───
  "production-run": {
    explanation: "Production Run — a maker's product needs 500 pre-orders to trigger manufacturing. Zero risk (only produce what's pre-sold). First 100 backers get multiplier bonuses.",
    connectedTo: "Feeds BandWagon (back runs → earn SAA), Success Stories (completed runs become shareable), and the live Success Ticker. Makers earn XP through production labor formula.",
    why: "500 pre-orders means the maker has guaranteed revenue before producing a single unit. No speculative manufacturing. All pre-orders paid in full before production begins.",
    learnMoreUrl: "/production-runs",
    learnMoreLabel: "Browse Production Runs",
  },
  "production-run-draft": {
    explanation: "The Draft Board — Fantasy Football-style picking of production runs to back. Filter by trending, almost-funded, HexIsle-compatible, or new proposals.",
    connectedTo: "Your draft picks appear alongside the live Success Ticker so you can compare your picks with platform-wide results. Ties to TasteMaker progression and referral chains.",
    why: "Like Fantasy Football — you pick the projects you believe in, watch them fund and ship, and your track record builds your reputation. Prediction accuracy → real allocation authority.",
    learnMoreUrl: "/production-runs",
  },

  // ─── COLD START ───
  "cold-start-cards": {
    explanation: "Cold Start Recipe Cards — step-by-step playbooks for launching your node or project. Pick a strategy, follow the steps, scale when ready.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/cold-start",
    learnMoreLabel: "Cold Start Strategies",
  },

  // ─── STEWARDS ───
  "steward-card": {
    explanation: "Steward system — project managers who pledge their own Marks (skin in the game). Pledged Marks are escrowed per-project. Released on success, absorbed on failure.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/stewards",
    learnMoreLabel: "Steward System",
  },

  // ─── GHOST WORLD ───
  "ghost-world": {
    explanation: "Ghost World — the pre-member experience. Browse freely, no account needed. Find Golden Keys, explore, build your ghost profile. Everything carries over when you join.",
    learnMoreUrl: "/ghost",
    learnMoreLabel: "Enter Ghost World",
  },
  "ghost-profile": {
    explanation: "Your Ghost Profile tracks session time, pages visited, documents read, and golden keys found. Join to save permanently.",
  },
  "golden-keys": {
    explanation: "Golden Keys — hidden puzzles scattered across Cephas articles. Find them to unlock rewards and prove your exploration depth.",
  },

  // ─── XP & REPUTATION ───
  "xp-score": {
    explanation: "XP Score — multiplicative accomplishment metric. XP = Accomplishment Score × Bounty Points. Aggregate and cumulative — never decreases.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/xp-system",
    learnMoreLabel: "XP Score System",
  },

  // ─── COVERAGE MINUTES ───
  "coverage-minutes": {
    explanation: "Coverage Minutes / The Muffled Rule — speaking time is gated by listening time. 3-minute chunks, 180-minute cap, 90-day expiry. Earn the right to speak by listening first.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/muffled-rule",
    learnMoreLabel: "The Muffled Rule",
  },

  // ─── SPONSOR ───
  "plant-a-seed": {
    explanation: "Plant a Seed — every $5 sponsors one membership. That person gets a year of access, credits to start, and a real shot at building something. You see their milestone progress.",
    learnMoreUrl: "/sponsor",
    learnMoreLabel: "Sponsor Portal",
  },
  "plant-seeds-explainer": {
    explanation: "Back early, earn more. Support projects at various production levels and receive Joule multipliers. The earlier you believe, the more you earn.",
    learnMoreUrl: "/plant-seeds",
  },

  // ─── HEXISLE ───
  "hexisle": {
    explanation: "HexIsle / Tereno — the hexagonal terrain board game system. 60mm tiles with water table integration, compliant mechanisms, and the definitive 27-piece stack.",
    learnMoreUrl: "https://hexisle.web.app",
    learnMoreLabel: "HexIsle Portal",
  },

  // ─── LEGAL / TRANSPARENCY ───
  "fly-on-the-wall": {
    explanation: "Fly on the Wall — the public ledger. Real bank transactions proving the system works. Complete transparency. Test-Net By Design.",
    learnMoreUrl: "/fly-on-the-wall",
    learnMoreLabel: "View Public Ledger",
  },
  "cost-plus-20": {
    explanation: "Cost + 20% — the platform's pricing model. Sellers set prices. Market discovery. 20% floor ensures sustainability without extraction. Creator keeps 83.3%.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/economic-model",
    learnMoreLabel: "Economic Model",
  },

  // ─── BOUNTIES / LARKS ───
  "bounty-board": {
    explanation: "Bounty Board — tasks posted by the platform or members. Complete a bounty to earn Credits and XP. STAMP verification required.",
    learnMoreUrl: "/bounties",
    learnMoreLabel: "View Bounties",
  },
  "lark-submission": {
    explanation: "Lark — your feedback, idea, or bug report for any platform component. Accepted Larks earn Credits + Marks. Every contribution is tracked on the IP ledger.",
  },

  // ─── SUCCESS STORIES ───
  "success-stories": {
    explanation: "Success Stories — real results from real members. Shared because they chose to. Anonymizable: 'Member 458 in Chicago sold 2,300 units this week.'",
  },
  "success-ticker": {
    explanation: "Live activity ticker showing anonymized platform achievements in real-time. Production runs funded, nodes launched, milestones reached.",
  },

  // ─── GUILDS ───
  "guild-hub": {
    explanation: "Guild Hub — professional communities organized by skill and initiative. Join a guild to access training, mentorship, and crew formation.",
    learnMoreUrl: "/guilds",
    learnMoreLabel: "Browse Guilds",
  },

  // ─── FOOTER ───
  "platform-footer": {
    explanation: "Platform footer — links to legal, community, and platform tools. 1,336 patent claims, 1,662 innovations. Service sponsorship, not securities.",
  },

  // ─── SIX DEGREES ───
  "six-degrees": {
    explanation: "Six Degrees of Separation — the universal connection engine. Bounty campaigns that leverage social networks to reach anyone: outreach (Crown Letters), medical (rare specialist access), and opportunity (job/mentorship connections).",
    connectedTo: "Feeds into Herald referral chains, Babylon Candles, and the TasteMaker Trust Chain. Each referral hop is tracked and rewarded. Backer campaigns fund the bounties.",
    why: "You already know someone who knows someone. Six Degrees turns that latent social capital into directed action — finding a transplant surgeon, reaching a celebrity for a Crown Letter, or connecting a veteran to a job.",
    learnMoreUrl: "/six-degrees",
    learnMoreLabel: "Six Degrees Engine",
  },

  // ─── CHALK OUTLINE ONBOARDING ───
  "chalk-outline-onboarding": {
    explanation: "Chalk Outline Onboarding — project creation as a coloring book. New creators see a translucent overlay with dashed chalk outlines for every field. Fill in a section and it solidifies. Lock completed sections, preview your live page, and launch when ready.",
    connectedTo: "Powers the /create route and Creator Invite system. Drafted data persists to Supabase project_drafts. On launch, creates a live products entry. Ties into the CREATOR_INVITE_FIELDS template for invited creators.",
    why: "Nobody likes blank forms. The chalk outline shows exactly what the finished page looks like — you just color it in. Reduces creator friction from 'what do I do?' to 'fill this in.' Progress bar and lock/unlock give a sense of momentum.",
    learnMoreUrl: "/create",
    learnMoreLabel: "Try It Now",
  },

  // ─── DOUBLE-DIPPING & STACKING ───
  "double-dipping-stacking": {
    explanation: "Double-Dipping and Stacking — reward layers that intentionally compound. Like an ice cream cone: each scoop is a separate reward, and they stack. Herald referral bonus + BandWagon SAA increase + Production Run early-backer multiplier + Guild XP = four scoops from one action.",
    connectedTo: "Ties into Credits, Marks, Joules, XP, SAA, Herald rewards, BandWagon, and Production Run backing. Every system is designed to create at least two reward pathways per action.",
    why: "Traditional platforms penalize 'double-dipping.' We encourage it. If one action genuinely serves multiple community goals, why wouldn't we reward all of them? The ice cream cone model: each scoop costs us nothing extra because the value was already created.",
  },

  // ─── STAR CHAMBER ───
  "star-chamber": {
    explanation: "Star Chamber — multi-AI governance verification. Seven specialized AI agents (Knight, Bishop, Rook, Pawn, Queen, King, Jester) evaluate platform decisions. 5 of 7 must agree before any system-level action proceeds. Dissenting opinions are recorded and published.",
    connectedTo: "Feeds into Fly on the Wall transparency ledger. Each Star Chamber ruling is timestamped and publicly auditable. Connects to the STAMP verification system for bounty/quality assurance.",
    why: "No single AI — and no single human — should have unchecked authority over community decisions. Seven diverse agents with different optimization functions (legal, technical, ethical, financial, creative, strategic, adversarial) catch blind spots that any one perspective would miss.",
    learnMoreUrl: "https://cephas.lianabanyan.com/under-the-hood/star-chamber",
    learnMoreLabel: "Star Chamber Governance",
  },

  // ─── LIFECOMPASS ───
  "life-compass": {
    explanation: "LifeCompass — personal goal tracking integrated into the platform. Set milestones (financial, educational, health, career), track progress, and receive personality-matched recommendations for initiatives, guilds, and bounties that align with your stated goals.",
    connectedTo: "Connects to Guild recommendations, Bounty matching, Initiative suggestions, and the XP system. Your LifeCompass goals influence which Cold Start Recipe Cards are suggested and which Production Runs appear in your feed.",
    why: "A cooperative that doesn't help you reach your personal goals isn't cooperating. LifeCompass ensures every platform interaction moves you toward something you actually want — not just what the algorithm thinks will keep you scrolling.",
  },

  // ─── WHY NO ADS / WHY NO VC ───
  "why-no-ads-vc": {
    explanation: "Why No Ads and Why No V.C. — two philosophy pages explaining the platform's funding model. No external advertising (growth is word-of-mouth via Heralds). No venture capital (funded by patents and grit, 100% member-owned). Every dollar that would go to Big Tech or investors goes to the community instead.",
    connectedTo: "Ties to the Herald system (referral bonuses replace ad spend), the patent portfolio (7 provisionals with 1,662 innovations replace VC runway), and the Joules system (early supporters get forever-stamp rates instead of dilution).",
    why: "If you take ad money, users become the product. If you take VC money, the exit becomes the product. We took neither, so the cooperative stays the product — owned by and for its members.",
    learnMoreUrl: "/why-no-ads",
    learnMoreLabel: "Why No Ads?",
  },
};

/**
 * Look up a glossary entry by xray ID.
 * Returns undefined if no entry exists (overlay will show just the name).
 */
export function getXRayExplanation(id: string): XRayGlossaryEntry | undefined {
  return XRAY_GLOSSARY[id] || XRAY_GLOSSARY[id.toLowerCase()];
}
