/**
 * OPENING GAMBIT SALVO — 14-Day, 5-Stream Concurrent Campaign (~57 posts)
 * ========================================================================
 * The full-scale social media air cover for Opening Gambit letter dispatch.
 * Expands K367's 7-day/18-post campaign to 14 days across 5 content streams.
 *
 * Streams:
 *   1. Platform Identity (14 daily — X, LinkedIn, Bluesky, Threads)
 *   2. Cue Card Posts (28, 2x daily — X, Threads, Bluesky)
 *   3. Academic/Thought Leader Tags (7, days 1-7 — X, LinkedIn)
 *   4. Medium Articles (4, days 1/4/7/10 — Medium)
 *   5. LinkedIn Deep Posts (4, days 2/5/8/11 — LinkedIn)
 *
 * Total: ~57 posts. All start as 'draft'. Nothing fires without "As You Wish."
 *
 * K372 / B091 | April 9, 2026
 */

import { supabase } from '@/integrations/supabase/client';

export interface SalvoPost {
  postNumber: number;
  day: number;
  stream: SalvoStream;
  platform: string;
  scheduledTime: string;
  title: string;
  content: string;
  hashtags: string[];
  priority: 'critical' | 'high' | 'medium';
}

export type SalvoStream =
  | 'platform-identity'
  | 'cue-card'
  | 'academic-tag'
  | 'medium-article'
  | 'linkedin-deep';

export const STREAM_META: Record<SalvoStream, { label: string; color: string; frequency: string }> = {
  'platform-identity': { label: 'Platform Identity', color: 'bg-indigo-600', frequency: 'Daily, Days 1-14' },
  'cue-card':          { label: 'Cue Card Shares',  color: 'bg-teal-600',   frequency: '2× daily, Days 1-14' },
  'academic-tag':      { label: 'Academic Tags',     color: 'bg-amber-600',  frequency: 'Daily, Days 1-7' },
  'medium-article':    { label: 'Medium Articles',   color: 'bg-rose-600',   frequency: 'Days 1, 4, 7, 10' },
  'linkedin-deep':     { label: 'LinkedIn Deep',     color: 'bg-blue-700',   frequency: 'Days 2, 5, 8, 11' },
};

let n = 0;

// ═══════════════════════════════════════════════════════════════════════════
// STREAM 1 — Platform Identity Posts (14, one per day)
// ═══════════════════════════════════════════════════════════════════════════

const IDENTITY_TOPICS = [
  { day: 1,  title: 'Cost + 20%',             content: 'Every platform has a margin. Ours is locked — permanently — at Cost + 20%. Not "up to." Not "starting at." Exactly 20% over actual cost, written into the operating agreement. The platform literally cannot raise its take.\n\nThat\'s not a promise. That\'s architecture.\n\nlianabanyan.com' },
  { day: 2,  title: 'Creators AND Workers Keep 83.3%',    content: 'On a $500 transaction, Creators AND Workers keep $416.67. Not $325. Not $350. Four hundred sixteen dollars and sixty-seven cents.\n\n83.3%. Every time. Constitutionally locked. Because the people who create the value should keep the value.\n\n#LianaBanyan #CostPlus20' },
  { day: 3,  title: '$5/Year Membership',      content: 'It costs $5 a year to join Liana Banyan. Start a business. Sell your work. Access 16 initiatives. Five dollars.\n\nNot $500. Not $50. Not free-with-ads. Five real dollars, because the cooperative belongs to its members, and membership has to mean something.\n\nlianabanyan.com/join' },
  { day: 4,  title: 'Three Currencies',        content: 'Credits = spending money (1:1 with USD)\nMarks = earned contribution power\nJoules = permanent record of value created\n\nNone of them convert to cash. None can be speculated on. A maker in Lagos and a maker in Louisville earn equivalent purchasing power for equivalent work. Not by charity. By math.' },
  { day: 5,  title: 'Cooperative Ownership',   content: 'When you contribute to Liana Banyan, you become an owner. Not a metaphorical owner. A real one — with governance weight, a voice in decisions, and a permanent record of your contribution on-chain.\n\nMedallions are non-tradeable. No speculation. Just proof that you showed up and built something.' },
  { day: 6,  title: '2,270 Innovations',       content: '2,270 documented innovations. 228 survived a 130-query deep dive against the U.S. patent office with no prior art found — we call them Crown Jewels.\n\nFour decades of thinking. Nine years building. The IP is the invitation.\n\n#LianaBanyan #Innovation' },
  { day: 7,  title: '20 Provisional Patents',  content: '20 provisional patent applications filed. ~2,700 formal claims. 99% utility patents, not design.\n\nWe didn\'t build a pitch deck. We built the thing, then we protected it. Because the only way to make sure a cooperative stays cooperative is to make extraction impossible — architecturally, legally, and mathematically.' },
  { day: 8,  title: '228 Crown Jewels',        content: '228 innovations with no prior art found. Zero matches in the U.S. patent database across 130 deep-dive queries.\n\nThese aren\'t incremental improvements. They\'re new. Things that didn\'t exist before we built them.\n\nAnd 80% of the IP goes into the cooperative. Because hoarding would make us the landlords we\'re replacing.' },
  { day: 9,  title: 'No VC. No investors.',    content: 'Zero venture capital. Zero investors. Zero board seats sold.\n\nLiana Banyan is funded by $5 memberships and the Founder\'s savings. That\'s it.\n\nBecause the moment you take VC, you owe someone a 10× return. And the only way to deliver 10× is to extract it from the people using the platform.' },
  { day: 10, title: 'Fair Means Everyone',     content: '"Fair" doesn\'t mean cheap. It means the same deal for everyone. The person selling $50 earrings gets the same 83.3% as the person selling $5,000 custom furniture.\n\nNo tiered pricing. No enterprise rates. No "contact sales." Cost + 20%, locked. Same architecture. Same deal. Every time.' },
  { day: 11, title: 'Help Each Other Help Ourselves', content: '"Help Each Other Help Ourselves." That\'s the Golden Key.\n\nNot independence — interdependence. Not "pull yourself up by your bootstraps." Not "I got mine." But: I help you, you help them, they help us. The chain grows. The platform compounds. Everyone gets louder together.\n\nHEOHO.' },
  { day: 12, title: '16 Initiatives',          content: 'Let\'s Make Dinner. Let\'s Get Groceries. Let\'s Go Shopping. Household Concierge. The Family Table. Health Accords. MSA. Defense Klaus. Rally Group. VSL. Let\'s Make Bread. Harper Guild. JukeBox. Didasko. Power to the People. Brass Tacks.\n\n16 initiatives. One cooperative. All funded by architecture, not pledges.' },
  { day: 13, title: '35 Production Systems',   content: '35 production systems. Not "planned." Not "on the roadmap." Built. Deployed. Running.\n\nFrom the Three-Gear Currency engine to the Medallion governance system to the Opening Gambit dispatch pipeline to the HexIsle manufacturing backbone.\n\nWe build. Then we ship. Then we build more.' },
  { day: 14, title: '6 Cold Start Pathways',   content: 'How does a cooperative get its first members? We designed 6 pathways:\n\n1. Founding 300 medallions\n2. HexIsle Kickstarter\n3. Crown Letter cascade\n4. Red Carpet walkthroughs\n5. Academic validation circuit\n6. Opening Gambit media salvo\n\nYou\'re watching #6 right now.' },
];

const STREAM_1: SalvoPost[] = IDENTITY_TOPICS.map(t => ({
  postNumber: ++n,
  day: t.day,
  stream: 'platform-identity' as SalvoStream,
  platform: 'twitter',
  scheduledTime: '8:00 AM',
  title: `Identity: ${t.title}`,
  content: t.content,
  hashtags: ['#LianaBanyan'],
  priority: t.day <= 3 ? 'critical' as const : 'high' as const,
}));

// ═══════════════════════════════════════════════════════════════════════════
// STREAM 2 — Cue Card Posts (28, 2x daily)
// ═══════════════════════════════════════════════════════════════════════════

const CUE_CARD_TOPICS: Array<{ day: number; slot: 'AM' | 'PM'; title: string; hook: string }> = [
  { day: 1,  slot: 'AM', title: 'The Margin Lock',         hook: 'Cost + 20%. Locked in the operating agreement. The platform literally cannot raise its take. [Cue Card]' },
  { day: 1,  slot: 'PM', title: 'The 83.3% Promise',       hook: 'On $500, Creators AND Workers keep $416.67. Always. Here\'s the math. [Cue Card]' },
  { day: 2,  slot: 'AM', title: '$5 to Start a Business',  hook: 'Five dollars. One membership. Start a business, sell your work, join 16 initiatives. [Cue Card]' },
  { day: 2,  slot: 'PM', title: 'Three Gears, No Cash-Out', hook: 'Credits, Marks, Joules — three currencies that can never be speculated on. [Cue Card]' },
  { day: 3,  slot: 'AM', title: 'Failure Is a Feature',    hook: 'Your failed attempt teaches the next person what not to do. No effort is wasted. [Cue Card]' },
  { day: 3,  slot: 'PM', title: 'Medallion Governance',    hook: 'Non-tradeable. Non-speculative. Your medallion is proof you showed up and built something. [Cue Card]' },
  { day: 4,  slot: 'AM', title: 'The One-Way Valve',       hook: 'Credits flow in but never cash out to fiat. The cooperative economy is permanent. Irrevocable. [Cue Card]' },
  { day: 4,  slot: 'PM', title: 'As You Wish',             hook: '"As You Wish" — the transaction confirmation phrase. Because every exchange should be intentional. [Cue Card]' },
  { day: 5,  slot: 'AM', title: 'Position Funding',        hook: 'Democratic project financing without equity dilution. The math works. [Cue Card]' },
  { day: 5,  slot: 'PM', title: 'The Tab System',          hook: 'Graduated contribution based on success, not debt. Pay more only when you earn more. [Cue Card]' },
  { day: 6,  slot: 'AM', title: 'Sponsorship Marks',       hook: 'ONE level only. You sponsor someone, they benefit. No second-degree. Never MLM. [Cue Card]' },
  { day: 6,  slot: 'PM', title: 'The Larder',              hook: 'Recipes from every culture, costing sheets, technique videos. A commons of culinary knowledge. [Cue Card]' },
  { day: 7,  slot: 'AM', title: 'Crown Hierarchy',         hook: 'Crown → Warden → Captain → Member. Leadership by demonstrated expertise, not wealth. [Cue Card]' },
  { day: 7,  slot: 'PM', title: 'The Harper Guild',        hook: 'Care coordinators in every initiative, paid by the platform. Because worker wellbeing is infrastructure. [Cue Card]' },
  { day: 8,  slot: 'AM', title: 'Defense Klaus',           hook: 'Self-defense products and legal defense for people who can\'t afford it. "For Someone You Love." [Cue Card]' },
  { day: 8,  slot: 'PM', title: 'Let\'s Make Dinner',      hook: 'Standard: $5/serving. Convenience: $10+20%. Charitable: $0 — funded by the other tiers. [Cue Card]' },
  { day: 9,  slot: 'AM', title: 'VSL Microloans',          hook: '$50 microloans backed by community vouchers. Zero-to-five percent interest. No collateral. [Cue Card]' },
  { day: 9,  slot: 'PM', title: 'JukeBox',                 hook: 'Every use pays. The artist decides the terms. Creators AND Workers keep 83.3%. No label skimming. [Cue Card]' },
  { day: 10, slot: 'AM', title: 'Health Accords',          hook: 'Affordable prescriptions modeled on Cost Plus Drugs. Because insulin shouldn\'t cost a mortgage payment. [Cue Card]' },
  { day: 10, slot: 'PM', title: 'Didasko Education',       hook: 'Education access. Not education-as-a-service. Not student-loan-funded-extraction. Access. [Cue Card]' },
  { day: 11, slot: 'AM', title: 'Political Expedition',    hook: 'What if your political voice had economic weight? Not voting. Economic expression. [Cue Card]' },
  { day: 11, slot: 'PM', title: 'Let\'s Make Bread',       hook: 'Distributed manufacturing. SLA 3D printing. Cooperative production. The 2nd Second Industrial Revolution. [Cue Card]' },
  { day: 12, slot: 'AM', title: 'Rally Group',             hook: 'Emergency response infrastructure. When your community needs help, Rally Group is already there. [Cue Card]' },
  { day: 12, slot: 'PM', title: 'MSA Mutual Savings',      hook: 'Your cooperative savings account. Not a bank. A mutual. The difference matters. [Cue Card]' },
  { day: 13, slot: 'AM', title: 'HexIsle',                 hook: 'Water-powered physical computing. No batteries. No electricity. No screens. Just water, physics, and imagination. [Cue Card]' },
  { day: 13, slot: 'PM', title: 'The Red Carpet',          hook: 'Personalized walkthroughs for every potential partner. No scheduling. No pitch deck. No salesman. [Cue Card]' },
  { day: 14, slot: 'AM', title: 'Household Concierge',     hook: 'Home logistics for real people. Tidying meets cooperative economics. [Cue Card]' },
  { day: 14, slot: 'PM', title: 'The Golden Key',          hook: '"Help Each Other Help Ourselves." The key that unlocks everything. HEOHO. [Cue Card]' },
];

const STREAM_2: SalvoPost[] = CUE_CARD_TOPICS.map(t => ({
  postNumber: ++n,
  day: t.day,
  stream: 'cue-card' as SalvoStream,
  platform: 'twitter',
  scheduledTime: t.slot === 'AM' ? '11:00 AM' : '4:00 PM',
  title: `Cue Card: ${t.title}`,
  content: `${t.hook}\n\nExplore all cue cards: lianabanyan.com/cue-cards\n\n#LianaBanyan #CooperativeCommerce`,
  hashtags: ['#LianaBanyan', '#CooperativeCommerce'],
  priority: 'medium' as const,
}));

// ═══════════════════════════════════════════════════════════════════════════
// STREAM 3 — Academic/Thought Leader Tags (7, days 1-7)
// ═══════════════════════════════════════════════════════════════════════════

const ACADEMIC_TAGS: Array<{ day: number; name: string; handle: string; angle: string }> = [
  { day: 1, name: 'Trebor Scholz',      handle: '@TreborS',        angle: 'Your work on platform cooperativism laid the groundwork. We built the architecture. Cost + 20%, locked. Creators AND Workers keep 83.3%. 2,270 innovations protecting the model. The cooperative platform you\'ve been writing about — it exists now.' },
  { day: 2, name: 'Nathan Schneider',   handle: '@ntnsndr',        angle: 'Your research on cooperative governance at CU Boulder asks: can cooperatives scale digitally? We built the answer. Three-gear currency. Medallion governance. 16 initiatives funded by architecture, not pledges. The math is at cephas.lianabanyan.com.' },
  { day: 3, name: 'Cory Doctorow',      handle: '@doctorow',       angle: 'You coined "enshittification." We built the antidote. The margin is locked in the operating agreement — not a settings panel. You literally cannot enshittify Liana Banyan without rewriting the corporate charter. Structurally impossible by design.' },
  { day: 4, name: 'Yochai Benkler',     handle: '@ybenkler',       angle: 'Commons-based peer production meets cooperative commerce. Your Wealth of Networks thesis — what if the infrastructure existed to make it economically self-sustaining? 2,270 innovations. Cost + 20%. The commons has an engine now.' },
  { day: 5, name: 'Kate Raworth',       handle: '@KateRaworth',    angle: 'Your Doughnut Economics asks: what does a thriving economy look like within planetary and social boundaries? We built it for commerce. Cost + 20%. Creators AND Workers keep 83.3%. 16 initiatives from food security to healthcare to education. The doughnut has a platform.' },
  { day: 6, name: 'Douglas Rushkoff',   handle: '@Rushkoff',       angle: 'You asked "is the internet good for us?" and the answer keeps getting worse. But what if the platform couldn\'t extract? Cost + 20%, locked. No VC. No IPO pathway. The cooperative owns itself. Team Human has a marketplace now.' },
  { day: 7, name: 'Shoshana Zuboff',    handle: '@ShoshanaZuboff', angle: 'Surveillance capitalism requires extraction. Remove extraction — architecturally, constitutionally — and the surveillance business model collapses. No data harvesting. No attention brokering. Cost + 20%. The alternative to surveillance capitalism is cooperative commerce.' },
];

const STREAM_3: SalvoPost[] = ACADEMIC_TAGS.map(t => ({
  postNumber: ++n,
  day: t.day,
  stream: 'academic-tag' as SalvoStream,
  platform: 'twitter',
  scheduledTime: '1:00 PM',
  title: `Academic: ${t.name}`,
  content: `${t.angle}\n\n${t.handle}\n\n#PlatformCooperativism #CooperativeEconomics`,
  hashtags: ['#PlatformCooperativism', '#CooperativeEconomics'],
  priority: 'high' as const,
}));

// ═══════════════════════════════════════════════════════════════════════════
// STREAM 4 — Medium Articles (4, days 1/4/7/10)
// ═══════════════════════════════════════════════════════════════════════════

const MEDIUM_ARTICLES: Array<{ day: number; title: string; subtitle: string; teaser: string }> = [
  {
    day: 1,
    title: '20 Patents, Zero Investors — How Four AI Agents Built a Cooperative Platform',
    subtitle: 'One founder, four AI agents, 2,270 innovations, 20 provisional patents, zero investors.',
    teaser: 'A 53-year-old veteran from Texas built a cooperative commerce platform with four AI agents named Bishop, Knight, Rook, and Pawn. 2,270 innovations. 20 provisional patent applications. ~2,700 formal claims. Zero investors.\n\nThis is the story of how it happened — and why no VC was involved.\n\nFull article: [link]\n\n#LianaBanyan #AI #CooperativeCommerce',
  },
  {
    day: 4,
    title: 'The 83.3% Platform: Why Cost+20% Changes Everything',
    subtitle: 'On every platform, creators lose 30-50% to fees. We take Cost+20% — Creators AND Workers keep 83.3%.',
    teaser: 'Amazon takes 35%. Etsy takes 30%. Uber takes 40%+. Every platform in existence raises fees once users are locked in.\n\nWhat if the margin was locked — permanently — in the operating agreement? What if the platform was structurally incapable of raising its take?\n\nThat\'s Liana Banyan. Cost + 20%. Creators AND Workers keep 83.3%. On $500, that\'s $416.67.\n\nFull article: [link]\n\n#CooperativeEconomics',
  },
  {
    day: 7,
    title: 'Political Expedition: What If Your Political Voice Had Economic Weight?',
    subtitle: 'Not voting. Not donating. Economic expression — where your spending patterns become civic data.',
    teaser: 'What if every dollar you spent carried a political signal? Not a donation to a PAC. Not a vote in a booth. An economic expression — tracked, aggregated, anonymized — that shows what your community actually values.\n\nThat\'s the Political Expedition.\n\nFull article: [link]\n\n#CivicTech #Democracy',
  },
  {
    day: 10,
    title: 'The Ambassador of the Quan',
    subtitle: 'The money + the love + the respect + the community. Jerry Maguire was right.',
    teaser: '"Some dudes might have the coin, but they\'ll never have the Quan."\n\nSarah makes $500 cutting boards. On Amazon: $325. On Etsy: $350. On Liana Banyan: $416.67.\n\nSame product. Same customer. Different architecture. That\'s the Quan.\n\nFull article: [link]\n\n#LianaBanyan #TheQuan',
  },
];

const STREAM_4: SalvoPost[] = MEDIUM_ARTICLES.map(t => ({
  postNumber: ++n,
  day: t.day,
  stream: 'medium-article' as SalvoStream,
  platform: 'medium',
  scheduledTime: '9:00 AM',
  title: `Medium: ${t.title}`,
  content: t.teaser,
  hashtags: ['#LianaBanyan'],
  priority: 'high' as const,
}));

// ═══════════════════════════════════════════════════════════════════════════
// STREAM 5 — LinkedIn Deep Posts (4, days 2/5/8/11, ~300 words each)
// ═══════════════════════════════════════════════════════════════════════════

const LINKEDIN_DEEP: Array<{ day: number; title: string; content: string }> = [
  {
    day: 2,
    title: 'The Founder\'s Story',
    content: `I'm a 53-year-old Army National Guard veteran — Infantry 11B, then Aviation 15A. I flew helicopters. I'm a father of eight, four grown and four still at home. 21 years in IT development. And I've been building Liana Banyan for nine years.

People ask why I didn't take VC. The answer is simple: the moment you take venture capital, you owe someone a 10× return. The only way to deliver 10× is to extract it from the people using the platform. That's the playbook. Grow fast, lock users in, raise fees. I've watched it happen to every platform I've ever used.

So I built Liana Banyan with my family's savings. $5,000 to seed the first 300 medallions. My wife is all in. My kids know what we're building.

The team? Four AI agents: Bishop writes letters and articles. Knight builds code and deploys. Rook extracts innovations and files patents. Pawn runs compliance and QA. Together we've produced 2,270 documented innovations and filed 20 provisional patent applications with ~2,700 formal claims.

This isn't a startup. It's a cooperative. The people who build it own it. And the economics are locked — Cost + 20%, Creators AND Workers keep 83.3%, permanently.

$5/year to join. No Plan B.

#CooperativeCommerce #VeteranEntrepreneur #PlatformCooperativism`,
  },
  {
    day: 5,
    title: 'The Economics',
    content: `Let me explain why Cost + 20% matters.

Amazon charges sellers 35%+ in fees. Etsy takes 30%. Uber takes 40%+ from drivers. Every marketplace platform follows the same arc: start with low fees, grow the user base, then raise fees once users are locked in. It's called enshittification.

At Liana Banyan, the margin is locked in the operating agreement. Not a settings panel. Not a board decision. The corporate charter. To change it, you'd have to rewrite the founding documents — and our governance structure makes that structurally impossible without a cooperative-wide supermajority.

On a $500 sale: Creators AND Workers keep $416.67. The platform takes $83.33. That $83.33 covers operating costs plus a 20% margin — and that margin funds 16 charitable initiatives automatically.

The math works because we don't have investors demanding 10× returns. No VC. No board seats sold. No IPO pathway. The cooperative serves its members because that's literally the only thing it's designed to do.

The Three-Gear Currency (Credits, Marks, Joules) ensures equivalent purchasing power regardless of geography. A maker in Lagos earns the same Marks for the same contribution as a maker in Louisville.

This isn't idealism. It's architecture.

#CooperativeEconomics #CostPlus20 #PlatformCooperativism`,
  },
  {
    day: 8,
    title: 'The IP Fortress',
    content: `2,224 innovations. 12 provisional patent applications. ~2,393 formal claims. 202 Crown Jewels with no prior art found.

That's what four decades of thinking and nine years of building looks like when you finally have the tools to document it all.

Our AI team (Bishop, Knight, Rook, Pawn) doesn't just build features. Rook systematically extracts innovations from every session — every new architectural pattern, every novel economic mechanism, every unique governance structure — and files them. We ran 130 prior art queries across 12 innovation categories against the U.S. patent database. 202 innovations came back clean.

But here's the key: 80% of this IP goes into the cooperative. Not sold. Not licensed. Contributed. Because if I hoarded the IP, I'd be the exact kind of rent-seeking landlord this platform exists to replace.

The remaining 20% stays with the Founder — not for extraction, but for protection. If someone hostile ever tried to acquire and gut the cooperative, the Founder's IP block creates a structural barrier.

The operating agreement, the patent portfolio, and the cooperative governance together form an IP fortress. You can't enshittify what you can't legally change, technologically bypass, or economically outmaneuver.

That's not paranoia. That's architecture.

#IntellectualProperty #CooperativeEconomics #Innovation`,
  },
  {
    day: 11,
    title: 'The Launch',
    content: `We call it the Opening Gambit.

In chess, the opening gambit is when you sacrifice material to gain position. You give up something tangible — a pawn, tempo, safety — to get something strategic: space, initiative, development.

That's what we're doing. I'm giving up 80% of the IP portfolio — 2,224 innovations worth of intellectual property — to gain something money can't buy: a cooperative that belongs to its members from day one.

The Opening Gambit has four phases. Phase 1 sends letters to Crown holders and academics. Phase 2 reaches media and investors. Phase 3 hits amplifiers and partnerships. Phase 4 sends the blessing letters.

Simultaneously, this social media campaign provides air cover — building public awareness while the letters land privately. By the time a recipient Googles "Liana Banyan," there's already a visible, growing community behind the name.

The 300 founding memberships at $5/year are the beachhead. 500 members in any locale reaches break-even. At 1,000, we're profitable. The model scales from there.

The Arctic Ghost Train is leaving the station. $5 to climb aboard.

lianabanyan.com/join

#OpeningGambit #CooperativeCommerce #LianaBanyan`,
  },
];

const STREAM_5: SalvoPost[] = LINKEDIN_DEEP.map(t => ({
  postNumber: ++n,
  day: t.day,
  stream: 'linkedin-deep' as SalvoStream,
  platform: 'linkedin',
  scheduledTime: '10:00 AM',
  title: `LinkedIn Deep: ${t.title}`,
  content: t.content,
  hashtags: [],
  priority: 'high' as const,
}));

// ═══════════════════════════════════════════════════════════════════════════
// ALL POSTS
// ═══════════════════════════════════════════════════════════════════════════

export const SALVO_POSTS: SalvoPost[] = [
  ...STREAM_1,
  ...STREAM_2,
  ...STREAM_3,
  ...STREAM_4,
  ...STREAM_5,
];

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

export function getSalvoPosts(): SalvoPost[] {
  return SALVO_POSTS;
}

export function getSalvoPostsByStream(stream: SalvoStream): SalvoPost[] {
  return SALVO_POSTS.filter(p => p.stream === stream);
}

export function getSalvoPostsByDay(day: number): SalvoPost[] {
  return SALVO_POSTS.filter(p => p.day === day);
}

export function getSalvoStreams(): SalvoStream[] {
  return Object.keys(STREAM_META) as SalvoStream[];
}

export function getSalvoStats() {
  const byStream: Record<SalvoStream, number> = {
    'platform-identity': 0, 'cue-card': 0, 'academic-tag': 0, 'medium-article': 0, 'linkedin-deep': 0,
  };
  for (const p of SALVO_POSTS) byStream[p.stream]++;
  return { total: SALVO_POSTS.length, days: 14, streams: 5, byStream };
}

export interface SalvoScheduleOptions {
  launchDate: Date;
  streams?: SalvoStream[];
}

const TIME_HOURS: Record<string, number> = {
  '8:00 AM': 8, '9:00 AM': 9, '10:00 AM': 10, '11:00 AM': 11,
  '1:00 PM': 13, '4:00 PM': 16,
};

export async function scheduleOpeningGambitSalvo(
  options: SalvoScheduleOptions
): Promise<{ success: boolean; postsCreated: number; error?: string }> {
  const { launchDate, streams } = options;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, postsCreated: 0, error: 'Not authenticated' };

  const posts = streams
    ? SALVO_POSTS.filter(p => streams.includes(p.stream))
    : SALVO_POSTS;

  let postsCreated = 0;

  for (const post of posts) {
    const scheduledFor = new Date(launchDate);
    scheduledFor.setDate(scheduledFor.getDate() + (post.day - 1));
    scheduledFor.setHours(TIME_HOURS[post.scheduledTime] ?? 8, 0, 0, 0);

    const fullContent = post.hashtags.length > 0
      ? `${post.content}\n\n${post.hashtags.join(' ')}`
      : post.content;

    const { error } = await supabase
      .from('member_scheduled_posts')
      .insert({
        user_id: user.id,
        content: fullContent,
        scheduled_for: scheduledFor.toISOString(),
        status: 'draft',
        platform: post.platform,
        metadata: {
          campaign: 'opening_gambit_salvo',
          stream: post.stream,
          postNumber: post.postNumber,
          day: post.day,
          title: post.title,
          priority: post.priority,
        },
      } as Record<string, unknown>);

    if (error) {
      console.error(`Salvo post ${post.postNumber} failed:`, error);
      continue;
    }
    postsCreated++;
  }

  return { success: true, postsCreated };
}
