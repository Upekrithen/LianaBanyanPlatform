/**
 * KNOWLEDGE BASE — The Platform's Self-Explanation Layer
 * ======================================================
 * Part of the Nervous System. This is the canonical FAQ data source —
 * organized by chapters and categories, with anchor IDs for deep linking.
 *
 * Content drawn from:
 *   - xrayGlossary.ts (tooltip explanations)
 *   - alcoveSystem.ts (progressive disclosure learning)
 *   - WhyNoAds.tsx / WhyNoVC.tsx (philosophy pages)
 *   - Academic papers and Cephas articles
 *
 * Every entry has:
 *   - A unique anchor ID (for deep linking: /faq#no-ads)
 *   - A chapter assignment
 *   - A question + answer
 *   - Optional "learn more" link
 *   - Optional related innovation numbers
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FAQEntry {
  /** Unique anchor ID for deep linking (kebab-case) */
  id: string;
  /** The question */
  question: string;
  /** The answer (supports basic markdown-like formatting) */
  answer: string;
  /** Optional longer explanation shown when expanded further */
  detail?: string;
  /** URL for "Learn more" link */
  learnMoreUrl?: string;
  /** Label for learn more link */
  learnMoreLabel?: string;
  /** Related innovation numbers from patent portfolio */
  innovations?: number[];
  /** Tags for search */
  tags: string[];
}

export interface FAQChapter {
  /** Chapter ID */
  id: string;
  /** Chapter title */
  title: string;
  /** Chapter subtitle / description */
  subtitle: string;
  /** Icon (emoji) */
  icon: string;
  /** Entries in this chapter */
  entries: FAQEntry[];
}

// ============================================================================
// CHAPTERS
// ============================================================================

export const FAQ_CHAPTERS: FAQChapter[] = [
  // ─── CHAPTER 1: THE BASICS ───
  {
    id: 'basics',
    title: 'The Basics',
    subtitle: 'What is this place and how does it work?',
    icon: '🌳',
    entries: [
      {
        id: 'what-is-lb',
        question: 'What is Liana Banyan?',
        answer: "A cooperative platform where everyone benefits. Not a corporation extracting value — a cooperative where members own the platform, govern it together, and share in its success.",
        detail: "Liana Banyan is the world's first cooperative platform designed so that the more people participate, the more everyone benefits. Traditional platforms extract value from users and send it to shareholders. We do the opposite: 83.3% of every transaction goes to the creator, 16.7% funds the cooperative's 16 initiatives, and 0% goes to outside investors.",
        learnMoreUrl: '/learn/what-is-lb',
        learnMoreLabel: 'Alcove: What Is Liana Banyan?',
        tags: ['basics', 'cooperative', 'platform', 'overview'],
      },
      {
        id: 'how-much-does-it-cost',
        question: 'How much does membership cost?',
        answer: "$5 per year. That's it. No upsells, no premium tiers, no hidden fees. Five dollars gets you full access to everything.",
        detail: "The $5 covers your Cue Card deck (shareable recruitment cards), full platform access, and participation in all 16 initiatives. There is no 'premium' version. Every member gets the same access. The platform sustains itself through the Cost+20% model on marketplace transactions, not membership fees.",
        learnMoreUrl: '/learn/membership',
        learnMoreLabel: 'Alcove: The Five-Dollar Door',
        tags: ['cost', 'membership', 'pricing', '$5'],
      },
      {
        id: 'cost-plus-20',
        question: 'What is Cost+20%?',
        answer: "The platform's constitutional pricing floor. Sellers set their own prices, but a 20% margin funds the cooperative. The creator keeps 83.3% of every dollar.",
        detail: "Cost+20% means the platform takes a 20% margin on marketplace transactions (83.3% creator / 16.7% platform). That 20% funds all 16 initiatives — food programs, education, housing, everything. Sellers set their own prices through market discovery. The 20% floor is constitutional — it can't be changed without member governance approval.",
        learnMoreUrl: '/learn/cost-plus-20',
        learnMoreLabel: 'Alcove: Cost+20%',
        tags: ['pricing', 'economics', 'cost-plus-20', 'margin', 'creator'],
      },
      {
        id: 'sweet-sixteen',
        question: 'What are the 16 initiatives?',
        answer: "Sixteen interconnected programs funded by the platform's 20% margin: food, groceries, shopping, education, housing assistance, healthcare, political engagement, entertainment, business incubation, international aid, family services, and more.",
        learnMoreUrl: '/learn/initiatives',
        learnMoreLabel: 'Alcove: The Sweet Sixteen',
        tags: ['initiatives', 'programs', 'sweet-sixteen'],
      },
      {
        id: 'as-you-wish',
        question: 'What does "As You Wish" mean?',
        answer: "It's the universal transaction confirmation phrase. Every significant action on the platform is confirmed with 'As You Wish' — a deliberate, human-speed pause before anything irreversible happens.",
        learnMoreUrl: '/learn/as-you-wish',
        learnMoreLabel: 'Alcove: As You Wish',
        tags: ['confirmation', 'as-you-wish', 'transaction'],
      },
    ],
  },

  // ─── CHAPTER 2: MONEY & CURRENCY ───
  {
    id: 'currency',
    title: 'Money & Currency',
    subtitle: 'Credits, Marks, and Joules — the three-currency system',
    icon: '💰',
    entries: [
      {
        id: 'three-currencies',
        question: 'What are Credits, Marks, and Joules?',
        answer: "Three currencies, equal value (1:1:1), different purposes. Credits are bought with dollars for everyday spending. Marks are earned through effort for essentials. Joules store surplus value with a 'forever stamp' rate lock.",
        detail: "Credits: purchased with fiat ($1 = 1 Credit), universal use, closed-loop (no cash-out). Marks: effort-debt currency earned through participation, restricted to essentials (food, medical), cleared via contribution. Joules: surplus storage with 'forever stamp' mechanic — locks your exchange rate at purchase time. LB owns the Joules; members earn authority to direct them, not ownership.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/three-currencies',
        learnMoreLabel: 'Three-Currency Deep Dive',
        tags: ['credits', 'marks', 'joules', 'currency', 'money'],
      },
      {
        id: 'how-marks-work',
        question: 'How do you earn Marks?',
        answer: "Marks emerge from differential ONLY — never granted as gifts. You earn them by completing bounties, participating in initiatives, Lark submissions, and platform contribution. Every Mark represents real work.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/three-currencies',
        learnMoreLabel: 'How Marks Work',
        tags: ['marks', 'earning', 'differential', 'bounties'],
      },
      {
        id: 'joules-forever-stamp',
        question: 'What is the "forever stamp" mechanic?',
        answer: "When you acquire Joules, your exchange rate is locked at that moment — forever. Like buying postage stamps before the price goes up. Early supporters permanently benefit from today's rates.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/three-currencies',
        learnMoreLabel: 'Joules Explained',
        tags: ['joules', 'forever-stamp', 'exchange-rate'],
      },
      {
        id: 'brewster-bonus',
        question: 'What is the Brewster Bonus?',
        answer: "A reward multiplier for early backers of production runs. The earlier you believe in a project, the higher your multiplier. First 100 backers share influence proportionally.",
        learnMoreUrl: '/learn/brewster-bonus',
        learnMoreLabel: 'Alcove: Brewster Bonus',
        tags: ['brewster', 'bonus', 'early-backer', 'multiplier'],
      },
    ],
  },

  // ─── CHAPTER 3: GROWTH & MARKETING ───
  {
    id: 'growth',
    title: 'Growth & Marketing',
    subtitle: 'How we grow without ads or investors',
    icon: '🚀',
    entries: [
      {
        id: 'no-ads',
        question: 'Why no outside advertising?',
        answer: "Ad-funded platforms sell YOUR attention to advertisers — you become the product. They optimize for addiction, not help, and harvest your data for targeting. We chose a different path: every dollar that would go to Big Tech goes to our community instead.",
        detail: "Instead of paying Facebook to show you ads, we pay our own members to invite people they actually know and trust. Heralds (our word-of-mouth recruiters) earn 25 Marks per successful referral. Cost per customer via Herald referral: $25 (and it goes to a member). Referral lifetime value: 3-5x higher than paid acquisition. Referral churn rate: 37% lower than paid users. Word-of-mouth isn't just cheaper — it's better.",
        learnMoreUrl: '/why-no-ads',
        learnMoreLabel: 'Full Explanation: Why No Ads',
        tags: ['no-ads', 'advertising', 'herald', 'word-of-mouth', 'growth', 'marketing'],
      },
      {
        id: 'no-vc',
        question: 'Why no venture capital?',
        answer: "V.C. money comes with strings: 10x return demands force unsustainable growth, exit pressure means selling you in 5-7 years, and each funding round dilutes everyone. We're funded by 7 provisional patents with 1,690 innovations and started with $1,000. No burn rate. We own 100% — forever.",
        detail: "The math: At Year 10, if we're worth $500M with VC money, we'd own ~$25M. Growing organically, even at half that valuation ($250M), we own ALL of it. Our patent portfolio IS our runway. Micro-entity filing at $65 per provisional. Your early contribution = permanent credit via Ghost Attribution. The 300 founding members get Joules — no VC means no dilution of YOUR stake.",
        learnMoreUrl: '/why-no-vc',
        learnMoreLabel: 'Full Explanation: Why No V.C.',
        tags: ['no-vc', 'venture-capital', 'patents', 'bootstrap', 'ownership', 'growth'],
      },
      {
        id: 'herald-system',
        question: 'What is the Herald system?',
        answer: "Heralds are members who invite others through word-of-mouth. Instead of paying Google/Meta for ads, we pay Heralds 25 Marks per successful referral. That's our entire advertising budget — going to real people, not corporations.",
        learnMoreUrl: '/why-no-ads',
        learnMoreLabel: 'Herald Details',
        tags: ['herald', 'referral', 'word-of-mouth', 'invitation'],
      },
      {
        id: 'cue-cards',
        question: 'What are Cue Cards?',
        answer: "Shareable recruitment cards included with your $5/year membership. Each card is both a benefit explainer AND a recruitment tool carrying your unique referral code. Five cards in the deck: Invite a Creator, Become a Steward, Get Famous, I Don't Want Your $, We Need You.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/cue-cards',
        learnMoreLabel: 'Cue Card System',
        tags: ['cue-cards', 'recruitment', 'referral', 'deck'],
      },
      {
        id: 'the-furnace',
        question: 'What is The Furnace?',
        answer: "Every Cue Card has a QR code linked to an immutable verification registry. Scan it and you can verify the card is authentic, see the business's trust score, and confirm their charitable tier (Ember → Flame → Blaze → Inferno). The Furnace prevents fake cards and builds trust.",
        learnMoreUrl: '/the-furnace',
        learnMoreLabel: 'Visit The Furnace',
        tags: ['furnace', 'verification', 'qr-code', 'trust', 'cue-cards'],
      },
      {
        id: 'cue-card-drop',
        question: 'What is the Cue Card Drop?',
        answer: "Our cold start viral loop in 6 steps: Get your deck → drop a card at a coffee shop, laundromat, library, church → track your referral scans → seed 10 locations → earn Pioneer-tier Marks (10 per conversion) → build your attribution chain 5 links deep.",
        tags: ['cue-card-drop', 'cold-start', 'viral', 'growth'],
      },
      {
        id: 'referral-tiers',
        question: 'How do referral rewards work?',
        answer: "Six-tier rewards based on when you join: Pioneer (members 1-100, 10 Marks/referral) → Vanguard (101-500, 5) → Pathfinder (501-2K, 3) → Trailblazer (2K-10K, 2) → Guide (10K-50K, 1.5) → Ambassador (50K+, 1 Mark). Everyone gets something forever — the universal floor is 1 Mark.",
        tags: ['referral', 'tiers', 'rewards', 'pioneer', 'ambassador'],
      },
    ],
  },

  // ─── CHAPTER 4: CREATING & MAKING ───
  {
    id: 'creating',
    title: 'Creating & Making',
    subtitle: 'Production runs, guilds, and the maker ecosystem',
    icon: '⚒️',
    entries: [
      {
        id: 'production-runs',
        question: 'How do production runs work?',
        answer: "A maker's product needs pre-orders to trigger manufacturing. Zero risk — only produce what's already paid for. All pre-orders paid in full before production begins. First 100 backers get Brewster Bonus multipliers.",
        learnMoreUrl: '/production-runs',
        learnMoreLabel: 'Browse Production Runs',
        tags: ['production', 'manufacturing', 'pre-order', 'maker'],
      },
      {
        id: 'xp-score',
        question: 'What is the XP Score?',
        answer: "Multiplicative accomplishment metric. XP = Accomplishment Score × Bounty Points. Aggregate and cumulative — never decreases. Replaces misleading star-count ratings. STAMP verification required before XP is awarded.",
        detail: "Box notation display: every 10,000 XP = 1 box. Tier colors: Bronze (0-9999) → Silver → Gold → Platinum → Diamond → Obsidian. All members start at 100 reputation; XP adds on top as EXPERIENCE.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/xp-system',
        learnMoreLabel: 'XP Score System',
        tags: ['xp', 'score', 'reputation', 'accomplishment'],
      },
      {
        id: 'guilds',
        question: 'What are Guilds?',
        answer: "Professional communities organized by skill and initiative. Join a guild to access training, mentorship, and crew formation. Guilds provide the structure for the modular manufacturing system.",
        learnMoreUrl: '/guilds',
        learnMoreLabel: 'Browse Guilds',
        tags: ['guilds', 'community', 'skills', 'mentorship'],
      },
      {
        id: 'stewards',
        question: 'What is a Steward?',
        answer: "A project/campaign manager who pledges their own Marks as skin in the game. Pledged Marks are escrowed per-project — released on success plus proportional surplus, absorbed on failure. Progression: Apprentice → Journeyman → Master → Grand Steward.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/stewards',
        learnMoreLabel: 'Steward System',
        tags: ['steward', 'project-management', 'pledged-marks'],
      },
      {
        id: 'bandwagon',
        question: 'What is BandWagon?',
        answer: "Back projects with Marks. If the project succeeds, you earn increased Service Allocation Authority (SAA) — the ability to direct more cooperative resources. This is NOT an investment return. This is earned authority based on demonstrated judgment.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/bandwagon',
        learnMoreLabel: 'BandWagon Deep Dive',
        tags: ['bandwagon', 'backing', 'saa', 'projects'],
      },
    ],
  },

  // ─── CHAPTER 5: GOVERNANCE & TRUST ───
  {
    id: 'governance',
    title: 'Governance & Trust',
    subtitle: 'How decisions get made and trust is maintained',
    icon: '⚖️',
    entries: [
      {
        id: 'the-300',
        question: 'What are "The 300"?',
        answer: "The first 300 founding members shape the cooperative's constitution. Every voice matters. They receive Joules (equity-like authority tokens) and permanent Founding Status. No VC means no dilution of their stake.",
        learnMoreUrl: '/learn/the-300',
        learnMoreLabel: 'Alcove: The 300',
        tags: ['the-300', 'founding', 'governance', 'constitution'],
      },
      {
        id: 'howey-defense',
        question: 'Is this a security? (The Howey Defense)',
        answer: "No. Credits, Marks, and Joules fail ALL FOUR prongs of the Howey Test: no investment of money (membership is $5 for services), no common enterprise (each initiative operates independently), no expectation of profits (Marks emerge from effort, not appreciation), no reliance on others' efforts (members actively participate).",
        learnMoreUrl: '/learn/howey',
        learnMoreLabel: 'Alcove: The Howey Defense',
        tags: ['howey', 'securities', 'legal', 'sec'],
      },
      {
        id: 'star-chamber',
        question: 'What is the Star Chamber?',
        answer: "Multi-AI governance verification. Seven specialized AI agents evaluate platform decisions. 5 of 7 must agree before any system-level action proceeds. Dissenting opinions are recorded and published. No single AI — and no single human — should have unchecked authority.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/star-chamber',
        learnMoreLabel: 'Star Chamber Governance',
        tags: ['star-chamber', 'ai', 'governance', 'verification'],
      },
      {
        id: 'fly-on-the-wall',
        question: 'What is Fly on the Wall?',
        answer: "The public ledger. Real bank transactions proving the system works. Complete transparency. Every dollar in, every dollar out, verifiable by any member. Test-Net By Design.",
        learnMoreUrl: '/fly-on-the-wall',
        learnMoreLabel: 'View Public Ledger',
        tags: ['fly-on-the-wall', 'transparency', 'ledger', 'audit'],
      },
      {
        id: 'coverage-minutes',
        question: 'What is the Muffled Rule?',
        answer: "Speaking time is gated by listening time. 3-minute chunks, 180-minute cap, 90-day expiry. Earn the right to speak by listening first. Prevents any single voice from dominating community discourse.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/muffled-rule',
        learnMoreLabel: 'The Muffled Rule',
        tags: ['muffled-rule', 'coverage-minutes', 'speaking', 'listening', 'governance'],
      },
      {
        id: 'patent-portfolio',
        question: 'What is the patent portfolio?',
        answer: "7 provisional applications filed as a micro-entity ($65 each). 1,690 innovations documented. This is the cooperative's runway — IP as a shared asset instead of venture capital debt. 60% of Founder patents go to the platform.",
        learnMoreUrl: '/learn/patents',
        learnMoreLabel: 'Alcove: Patent Portfolio',
        tags: ['patents', 'ip', 'innovations', 'portfolio'],
      },
    ],
  },

  // ─── CHAPTER 6: EXPLORATION & ONBOARDING ───
  {
    id: 'exploration',
    title: 'Exploration & Onboarding',
    subtitle: 'Ghost World, Golden Keys, and finding your way',
    icon: '🔮',
    entries: [
      {
        id: 'ghost-world',
        question: 'What is Ghost World?',
        answer: "The pre-member experience. Browse freely, no account needed. Find Golden Keys, explore every page, build a ghost profile. Everything carries over when you join. Risk-free practice realm with time dilation (1hr = 10hr of content).",
        learnMoreUrl: '/ghost',
        learnMoreLabel: 'Enter Ghost World',
        tags: ['ghost-world', 'exploration', 'pre-member', 'free'],
      },
      {
        id: 'golden-keys',
        question: 'What are Golden Keys?',
        answer: "Hidden puzzles scattered across Cephas articles and platform pages. Find them to unlock rewards and prove your exploration depth. Part of the gamification layer that rewards curiosity.",
        learnMoreUrl: '/learn/golden-key',
        learnMoreLabel: 'Alcove: The Golden Key',
        tags: ['golden-keys', 'puzzles', 'exploration', 'rewards'],
      },
      {
        id: 'babylon-candles',
        question: 'What are Babylon Candles?',
        answer: "One-use invitation tokens that transport someone directly into the platform — like a teleportation spell from Stardust. When YOU give someone a candle, they arrive knowing someone real brought them here. Your attribution is permanently recorded.",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/babylon-candles',
        learnMoreLabel: 'Babylon Candle System',
        tags: ['babylon-candles', 'invitation', 'referral', 'onboarding'],
      },
      {
        id: 'chalk-outline',
        question: 'What is Chalk Outline Onboarding?',
        answer: "Project creation as a coloring book. New creators see translucent overlays with dashed chalk outlines for every field. Fill in a section and it solidifies. Lock completed sections, preview your live page, launch when ready. Nobody likes blank forms.",
        learnMoreUrl: '/create',
        learnMoreLabel: 'Try It Now',
        tags: ['chalk-outline', 'onboarding', 'creator', 'project-creation'],
      },
      {
        id: 'alcove-hallway',
        question: 'What is the Alcove Hallway?',
        answer: "A progressive disclosure learning system with 18 stops in 3 tiers. Foundation (What is LB, currencies, membership) → Mechanics (Brewster Bonus, bidding, AVA) → Depth (Howey Defense, patents, governance). Answer comprehension questions to earn Marks. Complete all 18 for the Founder's Forge badge.",
        learnMoreUrl: '/learn',
        learnMoreLabel: 'Enter the Hallway',
        tags: ['alcove', 'hallway', 'learning', 'education', 'progressive-disclosure'],
      },
    ],
  },

  // ─── CHAPTER 7: COMMUNITY SYSTEMS ───
  {
    id: 'community',
    title: 'Community Systems',
    subtitle: 'How members interact, trade, and help each other',
    icon: '🤝',
    entries: [
      {
        id: 'heoho',
        question: 'What does HEOHO mean?',
        answer: "Help Each Other, Help Ourselves. The foundational principle. Interdependence, not collectivism. Each person maintains individual agency while creating collective benefit. Collectivism subordinates the individual — we don't do that. (1 Corinthians 12:21-26)",
        learnMoreUrl: 'https://cephas.lianabanyan.com/under-the-hood/heoho',
        learnMoreLabel: 'The HEOHO Philosophy',
        tags: ['heoho', 'philosophy', 'interdependence', 'foundational'],
      },
      {
        id: 'matchtrade',
        question: 'What is MatchTrade?',
        answer: "Marks-for-Marks service exchange. Post what you need, post what you offer. Platform matches locally. 'I'll babysit if you fix my AC.' Every offer backed by Joules in your Stake Account.",
        learnMoreUrl: '/learn/matchtrade',
        learnMoreLabel: 'Alcove: MatchTrade',
        tags: ['matchtrade', 'exchange', 'services', 'local'],
      },
      {
        id: 'six-degrees',
        question: 'What is Six Degrees?',
        answer: "The universal connection engine. Bounty campaigns that leverage social networks to reach anyone: outreach (Crown Letters), medical (rare specialist access), and opportunity (job/mentorship connections). You already know someone who knows someone.",
        learnMoreUrl: '/six-degrees',
        learnMoreLabel: 'Six Degrees Engine',
        tags: ['six-degrees', 'connections', 'social', 'outreach'],
      },
      {
        id: 'defense-klaus',
        question: 'What is Defense Klaus?',
        answer: "Community safety net. Passive abuse detection, Community Alert Network, and emergency support systems. The submarine blast door for families in crisis. Integrates with Family Table for private family operations.",
        learnMoreUrl: '/initiatives/defense-klaus',
        learnMoreLabel: 'Defense Klaus System',
        tags: ['defense-klaus', 'safety', 'protection', 'family'],
      },
      {
        id: 'double-dipping',
        question: 'What is "double-dipping and stacking"?',
        answer: "Reward layers that intentionally compound. Like an ice cream cone: each scoop is a separate reward. Herald referral bonus + BandWagon SAA increase + Production Run early-backer multiplier + Guild XP = four scoops from one action. Traditional platforms penalize double-dipping. We encourage it.",
        tags: ['double-dipping', 'stacking', 'rewards', 'multiplier'],
      },
    ],
  },

  // ─── CHAPTER 8: HEXISLE — THE HYDRAULIC GAMING TABLE ───
  {
    id: 'hexisle',
    title: 'HexIsle — Hydraulic Gaming Table',
    subtitle: 'The 27-piece gravity-powered gaming system and Kickstarter chain',
    icon: '⬡',
    entries: [
      {
        id: 'hexisle-overview',
        question: 'What is HexIsle?',
        answer: "A hexagonal terrain board game powered by real water. 60mm tiles with internal hydraulic mechanisms create ocean waves, grow plants, trigger traps, and move ships — all without batteries or electricity. 27 canonical mechanical pieces, fully 3D-printable.",
        detail: "HexIsle (also called Tereno) uses 2.17 psi of water pressure from a central Water Table to drive every tile. Each Hexel contains a Golden Lotus (Tesla-valve turbine), gear train, and configurable output mechanism. The system supports diceless combat, pneumatic plant growth, and gravity-powered wave generation.",
        learnMoreUrl: "/hexisle",
        learnMoreLabel: "HexIsle Portal",
        innovations: [1537],
        tags: ['hexisle', 'tereno', 'board-game', 'hydraulic', 'hexel'],
      },
      {
        id: 'hexisle-chain',
        question: 'What is the HexIsle Chain?',
        answer: "A 13-campaign Kickstarter loyalty mechanic. Back consecutive campaigns to earn a 5% stacking Joule bonus per link (up to 65%). Break the chain and your bonus drops to a 20% floor — you keep something, but growth stops.",
        detail: "Chain timer: 14 days between backings (21 during holiday weeks). Perks escalate: free STLs at link 2, free color upgrade at 3, exclusive stretch goals at 4, free shipping at 5, platform perks at 6-8, early access at 9-12, and Complete Collection pricing + Steward nomination at 13.",
        learnMoreUrl: "/chain",
        learnMoreLabel: "Track Your Chain",
        tags: ['hexisle', 'chain', 'kickstarter', 'loyalty', 'joules'],
      },
      {
        id: 'hexisle-swan-neck',
        question: 'What is the Swan Neck connector?',
        answer: "The inter-Hexel hydraulic connector. Dual-channel design routes water between adjacent tiles. Layer 0 — the plumbing between rooms.",
        innovations: [1537],
        tags: ['hexisle', 'swan-neck', 'connector', 'hydraulic'],
      },
      {
        id: 'hexisle-snap-cap-connector',
        question: 'What is the Snap-Cap Connector?',
        answer: "Waterproof snap-fit coupling between Hexels. Mates with the Swan Neck for tool-free assembly and weatherproof seal.",
        innovations: [1537],
        tags: ['hexisle', 'snap-cap', 'connector', 'waterproof'],
      },
      {
        id: 'hexisle-channel-lock',
        question: 'What is the Channel Lock?',
        answer: "Foundation piece. 60mm diameter, 9mm tall, three grooves channel water inflow from Swan Neck upward into the Hollow Log. Layer 1 — the floor of every Hexel.",
        innovations: [1537],
        tags: ['hexisle', 'channel-lock', 'base', 'foundation'],
      },
      {
        id: 'hexisle-hollow-log',
        question: 'What is the Hollow Log?',
        answer: "Central fluid column, 15.5mm diameter. The main highway for water flowing up through the Hexel from Channel Lock to Golden Lotus. Layer 2.",
        innovations: [1537],
        tags: ['hexisle', 'hollow-log', 'column', 'fluid'],
      },
      {
        id: 'hexisle-clamshell',
        question: 'What is the Clamshell housing?',
        answer: "Two-part waterproof housing (SnapCap + SnapBottom) for the Golden Lotus and Rotor. Snap-fit, no adhesive required. Layers 3+5.",
        innovations: [1537],
        tags: ['hexisle', 'clamshell', 'housing', 'waterproof'],
      },
      {
        id: 'hexisle-golden-lotus',
        question: 'What is the Golden Lotus?',
        answer: "The heart of every Hexel. Six Tesla-valve cups with Rooster Teeth that convert alternating-current water flow into unidirectional rotation — no moving valve parts, just geometry forcing one-way flow. Layer 4.",
        detail: "Named for its lotus-petal geometry. Tesla valves are valvular conduits with zero moving parts — the fluid path itself creates preferential flow direction. Six cups = six pulses per cycle for smooth rotation.",
        innovations: [1537],
        tags: ['hexisle', 'golden-lotus', 'tesla-valve', 'actuator'],
      },
      {
        id: 'hexisle-rooster-teeth',
        question: 'What are Rooster Teeth?',
        answer: "Flow-directing ratchet teeth inside the Golden Lotus. Convert bidirectional AC water pulses into unidirectional rotation — the mechanical rectifier of the hydraulic circuit.",
        innovations: [1537],
        tags: ['hexisle', 'rooster-teeth', 'ratchet', 'flow'],
      },
      {
        id: 'hexisle-rotor',
        question: 'What is the Rotor?',
        answer: "18 closed cavities, full 12mm height. Permanently bonded to Ouralis after printing. Spins with the converted water flow from the Golden Lotus. Layer 6.",
        innovations: [1537],
        tags: ['hexisle', 'rotor', 'spin', 'actuator'],
      },
      {
        id: 'hexisle-ouralis',
        question: 'What is the Ouralis gear?',
        answer: "20-tooth dual-level gear with 3 cam slopes for tide simulation. The primary gear connecting water power to mechanical action. Drives 3× PGears at 6.67:1 speed ratio. Layer 7.",
        innovations: [1537],
        tags: ['hexisle', 'ouralis', 'gear', 'tide'],
      },
      {
        id: 'hexisle-pgear',
        question: 'What are PGears?',
        answer: "Three peripheral gears at Hexel vertices with mushroom-head shafts. 20:3 gear ratio = 6.67× Ouralis speed. Three per Hexel, positioned at the triangle vertices. Layer 8.",
        innovations: [1537],
        tags: ['hexisle', 'pgear', 'peripheral', 'gear'],
      },
      {
        id: 'hexisle-needle-valve',
        question: 'What is the Needle Valve?',
        answer: "Precision flow control at PGear center. Fine-tunes water flow through each peripheral gear shaft — different Hexels can run at different speeds.",
        innovations: [1537],
        tags: ['hexisle', 'needle-valve', 'flow-control'],
      },
      {
        id: 'hexisle-sawtooth-coral',
        question: 'What is Sawtooth Coral?',
        answer: "Ship keel engagement piece with slanted sides at 6 different angles. Ships slot into the Sawtooth to move across water Hexels. Six angles = six hex directions. Layer 9.",
        innovations: [1537],
        tags: ['hexisle', 'sawtooth-coral', 'ship', 'terrain'],
      },
      {
        id: 'hexisle-timing-belt',
        question: 'What is the Timing Belt?',
        answer: "Hidden countdown mechanism below the Sawtooth. Counts gear revolutions to trigger events. Configurable: 3 notches = trap trigger, 6 notches = portal event. Layer 9.",
        innovations: [1537],
        tags: ['hexisle', 'timing-belt', 'timer', 'trap'],
      },
      {
        id: 'hexisle-main-gear',
        question: 'What is the Main Gear?',
        answer: "High-speed output gear driven by 3× PGears at 12× Ouralis speed. Powers wave generators, trap mechanisms, or siege engines depending on configuration. Layer 10.",
        innovations: [1537],
        tags: ['hexisle', 'main-gear', 'output', 'speed'],
      },
      {
        id: 'hexisle-cradle',
        question: 'What is the Cradle?',
        answer: "Dynamic platform that moves up and down. Can flip to trigger traps. The Football cam follower rides inside for wave generation. Layer 11.",
        innovations: [1537],
        tags: ['hexisle', 'cradle', 'dynamic', 'wave'],
      },
      {
        id: 'hexisle-football',
        question: 'What is the Football?',
        answer: "Cam follower for variable-amplitude wave generation. Oval shape converts Main Gear rotation into Cradle oscillation — creating visible ocean waves. Layer 11.",
        innovations: [1537],
        tags: ['hexisle', 'football', 'cam', 'wave-generation'],
      },
      {
        id: 'hexisle-capstone',
        question: 'What is the Capstone?',
        answer: "Static terrain surface — the ground game pieces stand on. Sits above the Cradle for land-type Hexels. Swappable for different biome types (grass, desert, mountain). Layer 12.",
        innovations: [1537],
        tags: ['hexisle', 'capstone', 'terrain', 'surface'],
      },
      {
        id: 'hexisle-capwave',
        question: 'What is the Capwave?',
        answer: "Moving water surface that oscillates with the Cradle to create visible wave motion. Ships ride on the Capwave. The ocean equivalent of the Capstone. Layer 12.",
        innovations: [1537],
        tags: ['hexisle', 'capwave', 'water', 'wave'],
      },
      {
        id: 'hexisle-slotted-top',
        question: 'What is the Slotted Top?',
        answer: "Terrain piece with Flying Buttress slots. Accepts buildings, fenceposts, and character bases. The 'soil' layer with modular mounting points. Layer 11.",
        innovations: [1537],
        tags: ['hexisle', 'slotted-top', 'terrain', 'building'],
      },
      {
        id: 'hexisle-gorgon',
        question: 'What is the Gorgon?',
        answer: "Decorative crown piece atop the Hexel stack. Radial geometry named after Medusa. Different designs per biome — purely aesthetic. Layer 12.",
        innovations: [1537],
        tags: ['hexisle', 'gorgon', 'decoration', 'crown'],
      },
      {
        id: 'hexisle-roots',
        question: 'What is the Roots system?',
        answer: "Player-controlled pneumatic direction system. One-way ball valves let players choose which plant grows — a decision point in the pneumatic game mechanics.",
        innovations: [1537],
        tags: ['hexisle', 'roots', 'pneumatic', 'player-control'],
      },
      {
        id: 'hexisle-telescoping-plant',
        question: 'What is the Telescoping Plant?',
        answer: "Ratchet segments that extend upward when pneumatically pumped. 'Water your plants' by pumping air — the plants physically grow in discrete steps toward bloom and Flying Flower launch.",
        innovations: [1537],
        tags: ['hexisle', 'telescoping-plant', 'pneumatic', 'growth'],
      },
      {
        id: 'hexisle-open-ip',
        question: 'What is the Open IP model?',
        answer: "Each HexIsle piece gets STL downloads on Kickstarter campaigns. Community prints, experiments, and submits improvements via the Piggy-Back Protocol. Best improvements become official products through the Tereno tier system.",
        detail: "Tier system: Tereno Certified (Gold) → Tereno Approved (Silver) → HexIsle Official (Blue) → HexIsle Compatible (Green) → HexIsle Adaptable (Yellow) → HexIsle Inspired (White). Community-submitted improvements get classified and the best ones earn official status + IP Ledger entry.",
        learnMoreUrl: "/hexisle/downloads",
        learnMoreLabel: "HexIsle Downloads",
        tags: ['hexisle', 'open-ip', 'stl', 'piggyback', 'community'],
      },
      {
        id: 'hexisle-leap-frog',
        question: 'What is the Leap Frog cadence?',
        answer: "Characters (ready NOW) alternate with components (need dev time). If a component needs more time, the next character launches instead — the biweekly cadence never breaks. Two character progression lines serve as safety nets.",
        tags: ['hexisle', 'leap-frog', 'cadence', 'kickstarter'],
      },
    ],
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Get all FAQ entries flat (across all chapters) */
export function getAllFAQEntries(): FAQEntry[] {
  return FAQ_CHAPTERS.flatMap(ch => ch.entries);
}

/** Find a specific entry by ID */
export function getFAQEntry(id: string): FAQEntry | undefined {
  return getAllFAQEntries().find(e => e.id === id);
}

/** Search FAQ entries by query string (searches question, answer, tags) */
export function searchFAQ(query: string): FAQEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return getAllFAQEntries().filter(entry =>
    entry.question.toLowerCase().includes(q) ||
    entry.answer.toLowerCase().includes(q) ||
    entry.tags.some(t => t.includes(q))
  );
}

/** Get chapter by ID */
export function getFAQChapter(id: string): FAQChapter | undefined {
  return FAQ_CHAPTERS.find(ch => ch.id === id);
}
