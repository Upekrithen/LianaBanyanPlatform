/**
 * OPENING GAMBIT — Social Media Post Scheduler
 * ================================================
 * The coordinated 7-day launch sequence for Liana Banyan.
 *
 * Design: Vulnerability first, platform second, numbers third.
 * Tonal arc: Pain → Vision → Proof → People → Architecture → Consolidation
 *
 * Rules:
 *   - Maximum 4 posts per day
 *   - Minimum 2 hours between posts
 *   - Priority queue by importance
 *   - Manual override available (The Battery ARM/FIRE)
 *   - Nothing fires without "As You Wish"
 *
 * Usage: Import and call from The Battery admin panel
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface GambitPost {
  postNumber: number;
  day: number;
  dayName: string;
  platform: string;
  scheduledTime: string; // e.g., "8:00 AM CST"
  title: string;
  content: string;
  type: 'thread' | 'article' | 'post' | 'ama' | 'engagement';
  linkedArticle?: string;
  hashtags: string[];
  imageUrls: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// OPENING GAMBIT POST DEFINITIONS
// ============================================================================

const GAMBIT_POSTS: GambitPost[] = [
  // ═══════════════════════════════════════════════════════════════════
  // DAY 1: THE PAIN (Launch Day)
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 1,
    day: 1,
    dayName: 'The Pain',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'Twitter Launch Thread',
    type: 'thread',
    priority: 'critical',
    content: `I bought dog antibiotics from a pet store because I couldn't afford to take my daughter to the doctor.

That's not a metaphor. That's a Tuesday.

I spent 9 years building something so nobody has to do that again.

Thread. 🧵

---

My name is Jonathan Jones. U.S. Army National Guard veteran (Infantry 11B, Aviation 15A). Helicopter pilot. Father of eight — four grown and on their own, four still at home. 21-year IT developer.

For the last 9 years — every single day for the last 7 months — I've been building a cooperative commerce platform called Liana Banyan.

---

The core idea: What if the people who create the value keep the value?

Not 60% after fees. Not whatever the algorithm decides you're worth.

Workers, Builders, and Creators keep 83.3%. Every time. Constitutionally locked. Cost + 20%.

---

That 20% funds 16 charitable initiatives — from neighbors feeding neighbors (Let's Make Dinner) to $50 microloans (VSL) to affordable medications (Health Accords).

Not pledged. Not promised. Architecturally guaranteed.

---

I put my mortgage on this. Half my family's emergency savings funds the first 300 medallions.

My wife is all in. My kids know what we're building.

There is no Plan B.

---

I've played 25,399 games of chess. Lost half of them. Still in the top fraction of a percent.

Because losing is how you learn. And in this cooperative, failure is a feature — your failed attempt teaches the next person what not to do.

No effort is wasted. Every attempt matters.

---

I'm looking for 300 founding members. $5 a year. That's it.

Not $500. Not $5,000. Five dollars to join a cooperative that's structurally incapable of exploiting you.

Because I'm sick and tired of eking my way through life. And I bet you are too.

lianabanyan.com/join

---

"I don't know where I'm going, but I know what I'm looking for, and in time, I will find both."`,
    hashtags: ['#LianaBanyan', '#CooperativeCommerce', '#CostPlus20'],
    imageUrls: [],
  },

  {
    postNumber: 2,
    day: 1,
    dayName: 'The Pain',
    platform: 'linkedin',
    scheduledTime: '10:00 AM',
    title: 'I Bought Dog Antibiotics Because I Couldn\'t Afford a Doctor',
    type: 'post',
    priority: 'critical',
    content: `Nine years ago, I started building a cooperative commerce platform. Not because I had venture capital or a Stanford MBA. Because I had a family I couldn't afford to take to the doctor, and I was tired of systems designed to extract from people who can't afford to say no.

My name is Jonathan Jones. I'm a U.S. Army National Guard veteran (Infantry 11B, Aviation 15A), helicopter pilot, father of eight — four grown and on their own, four still at home — and a 21-year IT developer.

Liana Banyan is what came from forty years of thinking about that. A cooperative commerce platform where:

→ Workers, Builders, and Creators keep 83.3% of every transaction
→ The margin is constitutionally locked at Cost + 20%
→ 16 charitable initiatives are funded by architecture, not pledges
→ Every member can start a business for $5

The platform is live. The architecture is backed by 2,700 patent claims. The operating agreement locks the economics.

I'm looking for 300 founding members who are tired of eking their way through life.

$5 a year. No Plan B.`,
    hashtags: ['#cooperativeeconomics', '#socialenterprise', '#platformcooperativism'],
    linkedArticle: 'ARTICLE_01_EKING_DRAFT.md',
    imageUrls: [],
  },

  {
    postNumber: 3,
    day: 1,
    dayName: 'The Pain',
    platform: 'medium',
    scheduledTime: '12:00 PM',
    title: "I'm Sick and Tired of Eking My Way Through Life",
    type: 'article',
    priority: 'high',
    content: 'Full article from BISHOP_DROPZONE/ARTICLE_01_EKING_DRAFT.md — Submit to: Better Marketing, The Startup, Authority Magazine',
    hashtags: [],
    linkedArticle: 'ARTICLE_01_EKING_DRAFT.md',
    imageUrls: [],
  },

  {
    postNumber: 4,
    day: 1,
    dayName: 'The Pain',
    platform: 'reddit',
    scheduledTime: '2:00 PM',
    title: 'I spent 9 years building a cooperative commerce platform. Here\'s why I\'m giving the IP away.',
    type: 'ama',
    priority: 'high',
    content: `I'm a 53-year-old U.S. Army National Guard veteran and father of eight. For the last 9 years I've been building Liana Banyan — a cooperative commerce platform where Workers, Builders, and Creators keep 83.3% of every transaction, the margin is constitutionally locked, and 16 charitable initiatives are funded by the architecture itself.

I put 2,700 patent claims into this. But here's the thing — about 80% of that IP goes into the cooperative. Not because I'm generous. Because hoarding it would make me the exact kind of landlord I'm trying to replace.

The cost to join: $5/year. The economic model: Cost + 20%, locked in the operating agreement. The goal: 300 founding members who want to build something that can't be enshittified.

AMA in the comments.

Subreddits: r/Entrepreneur, r/cooperatives, r/leanstartups, r/smallbusiness`,
    hashtags: [],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 2: THE VISION
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 5,
    day: 2,
    dayName: 'The Vision',
    platform: 'medium',
    scheduledTime: '8:00 AM',
    title: 'The Ambassador of the Quan',
    type: 'article',
    priority: 'high',
    content: 'Full article from BISHOP_DROPZONE/ARTICLE_RUPRECHT_MEETS_THE_QUAN_DRAFT.md — Cross-link back to Article 1.',
    hashtags: [],
    linkedArticle: 'ARTICLE_RUPRECHT_MEETS_THE_QUAN_DRAFT.md',
    imageUrls: [],
  },

  {
    postNumber: 6,
    day: 2,
    dayName: 'The Vision',
    platform: 'twitter',
    scheduledTime: '10:00 AM',
    title: 'The Quan Thread — Sarah\'s Cutting Boards',
    type: 'thread',
    priority: 'high',
    content: `There's a scene in Jerry Maguire where Cuba Gooding Jr. says: "Some dudes might have the coin, but they'll never have the Quan."

The Quan = the money + the love + the respect + the community.

I've been thinking about that line for 30 years. Here's what I built:

---

Sarah makes $500 cutting boards.

On Amazon: She keeps $325 after 35% in fees.
On Etsy: She keeps $350.
On Liana Banyan: She keeps $416.50.

Over 100 sales, that's a $6,000-$9,000 difference.

Same product. Same customer. Different architecture.

---

The secret isn't being cheaper. It's being *incapable of becoming expensive.*

The margin is locked at Cost + 20%. Not "up to 20%." Not "20% for now." Locked. In the operating agreement. Forever.

That's the Quan.`,
    hashtags: ['#LianaBanyan', '#TheQuan', '#CostPlus20'],
    imageUrls: [],
  },

  {
    postNumber: 7,
    day: 2,
    dayName: 'The Vision',
    platform: 'linkedin',
    scheduledTime: '12:00 PM',
    title: 'The Math Behind Keeping 83.3%',
    type: 'post',
    priority: 'medium',
    content: `Yesterday I shared why I built Liana Banyan. Today: how it actually works.

The key insight: if you lock the margin constitutionally, the platform literally cannot enshittify. Not "won't" — "can't."

Read the full breakdown of how Cost+20% changes everything.`,
    hashtags: ['#cooperativeeconomics', '#platformcooperativism', '#83percent'],
    linkedArticle: 'ARTICLE_RUPRECHT_MEETS_THE_QUAN_DRAFT.md',
    imageUrls: [],
  },

  {
    postNumber: 8,
    day: 2,
    dayName: 'The Vision',
    platform: 'bluesky',
    scheduledTime: '2:00 PM',
    title: 'Bluesky: The Quan Thread (condensed)',
    type: 'thread',
    priority: 'medium',
    content: `Sarah makes $500 cutting boards.

On Amazon: $325 after fees.
On Etsy: $350.
On Liana Banyan: $416.50.

Over 100 sales = $6K-$9K difference. Same product. Different architecture.

The margin is locked at Cost+20%. Forever. In the operating agreement. That's what makes it impossible to enshittify.

lianabanyan.com/join`,
    hashtags: ['#LianaBanyan', '#CostPlus20'],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 3: THE PROOF
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 9,
    day: 3,
    dayName: 'The Proof',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'Fire Chief Thread — Architecture of Service',
    type: 'thread',
    priority: 'high',
    content: `A fire chief fell three stories while carrying a victim down a ladder.

His first words: "I slipped. Is she okay?"

I built that principle into every line of code, every contract term, every margin calculation in @LianaBanyan.

Accept responsibility. Put others first.

---

Here's what "put others first" looks like in architecture:

→ Cost + 20%: You always know the markup
→ No algorithmic suppression: Your work is shown, period
→ Failure is a feature: Your failed attempt teaches the next person
→ Medallions are non-tradeable: No speculation, just governance

---

I'm not asking you to trust me. I'm asking you to trust the math.

The operating agreement locks the margin. The governance is distributed. The economics are transparent.

$5/year. 300 founding spots.

lianabanyan.com/join`,
    hashtags: ['#LianaBanyan', '#TrustTheMath', '#CostPlus20'],
    imageUrls: [],
  },

  {
    postNumber: 10,
    day: 3,
    dayName: 'The Proof',
    platform: 'hackernews',
    scheduledTime: '10:00 AM',
    title: 'Show HN: Liana Banyan – Cooperative commerce platform where workers, builders, and creators keep 83.3%',
    type: 'post',
    priority: 'high',
    content: `Hi HN. I'm Jonathan, a U.S. Army National Guard vet and 21-year IT developer. I spent 9 years building a cooperative commerce platform.

Tech stack: Supabase (Postgres + RLS), React/Vite, Firebase multi-portal hosting, three-gear currency system (Credits/Marks/Joules), non-tradeable medallion governance.

The economic model: Cost + 20%, constitutionally locked. Workers, Builders, and Creators keep 83.3%. The 16.7% margin funds 16 charitable initiatives by architecture, not pledge.

What makes it different: The margin is in the operating agreement, not a settings panel. You literally cannot enshittify it without rewriting the corporate charter.

2,700 patent claims (80% contributed to the cooperative). Live at lianabanyan.com.

Looking for 300 founding members at $5/year to stress-test the model.

Full technical architecture: cephas.lianabanyan.com`,
    hashtags: [],
    imageUrls: [],
  },

  {
    postNumber: 11,
    day: 3,
    dayName: 'The Proof',
    platform: 'reddit',
    scheduledTime: '12:00 PM',
    title: 'Maker Communities — 3D workers, builders, and creators keep 83.3%',
    type: 'post',
    priority: 'medium',
    content: `I've spent 3 years designing a modular terrain system that's actually cooperative-owned. The IP belongs to the members who use it. Here's the tech:

HexIsle uses 60mm hexagonal tiles — not 42mm like most hex games. The larger footprint lets us do things that are physically impossible at smaller scales:

→ Hydraulic terrain: channels molded into tile undersides that route actual water for river/waterfall dioramas. The hex geometry makes every connection watertight without gaskets.

→ Compliant mechanisms: living hinges printed directly into the terrain. Drawbridges, trap doors, rotating platforms — no assembly, no glue, no separate hardware. Single-print articulation.

→ Tereno certification tiers: creators can submit terrain designs for testing. Tier 1 (tested by creator), Tier 2 (community-verified), Tier 3 (stress-tested for tournament play). Your certification level follows the design forever — it's a permanent quality signal.

The founding run is live now. SLA resin miniatures + PLA+ terrain tiles, cooperative-produced. Workers, Builders, and Creators keep 83.3% of every sale — the margin is constitutionally locked at Cost + 20%. That 20% funds 16 charitable initiatives.

Pre-orders open: lianabanyan.com/hexisle/founding-run

I'm happy to answer technical questions about the hex geometry, the hydraulic routing system, or how compliant mechanisms work at this scale.

Subreddits: r/PrintedMinis, r/TerrainBuilding, r/3Dprinting`,
    hashtags: [],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 4: THE PEOPLE
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 12,
    day: 4,
    dayName: 'The People',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'The Man With Two Suits',
    type: 'thread',
    priority: 'high',
    content: `When I needed a suit for an interview and couldn't afford one, my roommate gave me one of his two.

Another friend offered one of his fifteen — after the first guy already gave.

30 years later, that still makes me cry.

The man with two gave first. That's the Quan.

---

That's why @LianaBanyan costs $5 to join. Not $500.

Because a little generosity — just a tiny little bit — makes ALL the difference.

I know. It did for me.`,
    hashtags: ['#LianaBanyan', '#TheQuan', '#Generosity'],
    imageUrls: [],
  },

  {
    postNumber: 13,
    day: 4,
    dayName: 'The People',
    platform: 'linkedin',
    scheduledTime: '10:00 AM',
    title: 'The Man With Two Suits',
    type: 'post',
    priority: 'medium',
    content: 'Roommate suit story → why the $5 entry point matters → how the cooperative amplifies small generosity into structural change.',
    hashtags: ['#cooperativeeconomics', '#generosity', '#structuralchange'],
    imageUrls: [],
  },

  {
    postNumber: 14,
    day: 4,
    dayName: 'The People',
    platform: 'medium',
    scheduledTime: '12:00 PM',
    title: 'Boaz Principle / Treasure Map to the Quan',
    type: 'article',
    priority: 'medium',
    content: 'Publish Boaz Principle article (if ready) or preview of Article 3.',
    hashtags: [],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 5: THE ARCHITECTURE
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 15,
    day: 5,
    dayName: 'The Architecture',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'Chess + Architecture Thread',
    type: 'thread',
    priority: 'high',
    content: `I've played 25,399 games of chess.
Won roughly half. Lost roughly half.

And I'm in the top 0.4% of players worldwide.

How do you win if you lose half the time?

You play a different game.

That's what @LianaBanyan is. A different game.

---

The game most platforms play:
→ Grow fast
→ Attract users with low fees
→ Raise fees once they're locked in
→ Extract maximum value

Our game:
→ Lock the margin on Day 1
→ Make extraction architecturally impossible
→ Let Workers, Builders, and Creators keep 83.3% forever
→ Fund 16 initiatives automatically

---

Three-Gear Currency:
- Credits = 1:1 with USD (spending money)
- Marks = backed by Joules (earning power)
- Joules = forever stamps (contribution record)

A maker in Lagos and a maker in Louisville receive equivalent purchasing power for equivalent work.

Not by charity. By math.

---

Because in OUR Castle, we build more arrows instead of escape tunnels.

Most platforms build escape hatches for the people who run them. We built 2,270 innovations — and 80% of the IP goes into the cooperative.

That's not idealism. That's architecture.

lianabanyan.com/join`,
    hashtags: ['#LianaBanyan', '#Architecture', '#CostPlus20', '#ThreeGears'],
    imageUrls: [],
  },

  {
    postNumber: 16,
    day: 5,
    dayName: 'The Architecture',
    platform: 'hackernews',
    scheduledTime: '10:00 AM',
    title: 'Three-Gear Currency: How we solved the "same work, different value" problem',
    type: 'post',
    priority: 'medium',
    content: `Three-Gear Currency: How we solved the "same work, different value" problem

Most platforms have one currency: dollars. That creates a structural problem — a mass-produced cutting board from a factory in Shenzhen and a hand-carved one from a workshop in Louisville are priced against each other on the same axis. The factory always wins on price. The craftsperson always loses.

We built a three-gear system to decouple value from geography:

**Gear 1: Credits** — 1:1 with USD. This is spending money. You buy credits, you spend credits. No mystery. No token speculation. Credits are arcade tokens: they work inside the system and cannot be traded outside it.

**Gear 2: Marks** — Earned, not bought. Marks represent contribution to the cooperative. Review a product, teach a skill, moderate a community space, fulfill an order — you earn Marks. Marks unlock purchasing power within the platform (discounts, priority access, production capacity). A maker in Lagos who contributes 40 hours of community moderation earns the same Marks as a maker in Louisville who contributes 40 hours. Equivalent work = equivalent purchasing power.

**Gear 3: Joules** — The forever stamp. Joules are an immutable record of contribution. They never expire, can never be traded, and cannot be speculated on. They're minted on a test network (deliberately — not as a staging step, but as an architectural choice to prevent speculation). Your Joules are your permanent receipt: "I contributed this much to the cooperative." They influence governance weight and unlock higher certification tiers.

The key design constraint: no gear converts to cash. Credits convert to goods/services. Marks convert to platform purchasing power. Joules convert to governance weight. None of them convert to USD. This makes the entire system speculation-proof by architecture, not policy.

Purchasing power parity: because Marks are earned by contribution (not purchased), and because the platform margin is locked at Cost + 20%, a member in a low-cost-of-living area receives equivalent platform purchasing power to someone in Manhattan. The three-gear separation is what makes this work — if Marks were convertible to dollars, arbitrage would destroy the parity immediately.

Full technical docs: cephas.lianabanyan.com/under-the-hood/

Interested in the economic model or the governance implications — happy to go deeper in the comments.`,
    hashtags: [],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAYS 6-7: CONSOLIDATION (Weekend — Engagement Only)
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 17,
    day: 6,
    dayName: 'Consolidation',
    platform: 'twitter',
    scheduledTime: '10:00 AM',
    title: 'Week 1 Recap',
    type: 'engagement',
    priority: 'medium',
    content: `Week 1 of @LianaBanyan is in the books.

Here's the honest truth — no spin:

What landed:
→ The dog antibiotics story. It's real. That's why.
→ Makers immediately understood 83.3%
→ "The Man With Two Suits" got the most saves

What surprised us:
→ People asked about the three-gear currency more than the margin
→ International interest was immediate
→ People wanted to read the operating agreement (it's on the site)

What we're working on:
→ Onboarding flow — smoother path from "curious" to "founding member"
→ More Cephas documentation for the technically curious
→ Mobile experience polish

Every founding member matters. Every piece of feedback shapes what this becomes.

$5/year. No Plan B. lianabanyan.com/join`,
    hashtags: ['#LianaBanyan', '#WeekOne'],
    imageUrls: [],
  },

  {
    postNumber: 18,
    day: 6,
    dayName: 'Consolidation',
    platform: 'twitter',
    scheduledTime: '4:00 PM',
    title: 'Thank You',
    type: 'engagement',
    priority: 'low',
    content: `To everyone who signed up this week: thank you.

Not "thank you for your money." Thank you for believing that a $5 cooperative run by a National Guard vet and his family from Montana might actually work.

We'll prove you right. Or we'll learn why we were wrong. Either way, no effort is wasted.`,
    hashtags: ['#LianaBanyan'],
    imageUrls: [],
  },
];

// ============================================================================
// PLATFORM MAPPING (for Battery integration)
// ============================================================================

/**
 * Map Opening Gambit platforms to Battery platform IDs
 */
const PLATFORM_MAP: Record<string, string> = {
  twitter: 'twitter',
  linkedin: 'linkedin',
  medium: 'medium',
  reddit: 'reddit',
  bluesky: 'bluesky',
  hackernews: 'hackernews',
  imgur: 'imgur',
  discord: 'discord',
  facebook: 'facebook',
  instagram: 'instagram',
  threads: 'threads',
};

// ============================================================================
// PREVIEW & SCHEDULING
// ============================================================================

/**
 * Get all Opening Gambit posts for preview
 */
export function previewGambitPosts(): GambitPost[] {
  return [...GAMBIT_POSTS];
}

/**
 * Get posts filtered by platform
 */
export function getGambitPostsForPlatform(platform: string): GambitPost[] {
  return GAMBIT_POSTS.filter(p => p.platform === platform);
}

/**
 * Get posts for a specific day
 */
export function getGambitPostsForDay(day: number): GambitPost[] {
  return GAMBIT_POSTS.filter(p => p.day === day);
}

/**
 * Get unique days in the campaign
 */
export function getGambitDays(): Array<{ day: number; name: string; postCount: number }> {
  const days = new Map<number, { name: string; count: number }>();
  for (const post of GAMBIT_POSTS) {
    const existing = days.get(post.day);
    if (existing) {
      existing.count++;
    } else {
      days.set(post.day, { name: post.dayName, count: 1 });
    }
  }
  return Array.from(days.entries()).map(([day, { name, count }]) => ({
    day,
    name,
    postCount: count,
  }));
}

/**
 * Get unique platforms in the campaign
 */
export function getGambitPlatforms(): string[] {
  return [...new Set(GAMBIT_POSTS.map(p => p.platform))];
}

export interface GambitScheduleOptions {
  /** Which posts to schedule (by postNumber). If empty, schedules all. */
  postNumbers?: number[];
  /** Launch date (Day 1). Posts are offset from this. */
  launchDate: Date;
  /** Override platform target (posts to this platform instead of their default) */
  overridePlatform?: string;
}

/**
 * Schedule Opening Gambit posts to the database
 */
export async function scheduleOpeningGambitPosts(options: GambitScheduleOptions): Promise<{
  success: boolean;
  postsCreated: number;
  error?: string;
}> {
  const { launchDate, postNumbers, overridePlatform } = options;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, postsCreated: 0, error: 'No user logged in' };
  }

  const postsToSchedule = postNumbers
    ? GAMBIT_POSTS.filter(p => postNumbers.includes(p.postNumber))
    : GAMBIT_POSTS;

  let postsCreated = 0;

  for (const post of postsToSchedule) {
    // Calculate scheduled time based on day offset and time
    const dayOffset = post.day - 1; // Day 1 = launch date
    const timeMatch = post.scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = parseInt(timeMatch?.[1] || '9');
    const minutes = parseInt(timeMatch?.[2] || '0');
    const ampm = timeMatch?.[3]?.toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const scheduledFor = new Date(launchDate);
    scheduledFor.setDate(scheduledFor.getDate() + dayOffset);
    scheduledFor.setHours(hours, minutes, 0, 0);

    const platform = overridePlatform || PLATFORM_MAP[post.platform] || post.platform;

    // Combine content with hashtags
    const fullContent = post.hashtags.length > 0
      ? `${post.content}\n\n${post.hashtags.join(' ')}`
      : post.content;

    const { error } = await supabase
      .from('member_scheduled_posts')
      .insert({
        user_id: user.id,
        content: fullContent,
        media_urls: post.imageUrls,
        scheduled_for: scheduledFor.toISOString(),
        status: 'scheduled',
        platform: platform,
      });

    if (error) {
      console.error(`Error scheduling Gambit post ${post.postNumber}:`, error);
    } else {
      postsCreated++;
    }
  }

  return { success: true, postsCreated };
}

// ============================================================================
// WEEK 2 TRIGGERS (Conditional — milestone-based)
// ============================================================================

export const WEEK_2_TRIGGERS = [
  { memberCount: 25, action: 'Send Buffett letter, announce on social' },
  { memberCount: 35, action: 'Send Melinda French Gates letter' },
  { memberCount: 50, action: 'Begin Crown Letter batch (first 10)' },
  { memberCount: 100, action: 'Press kit ready at lianabanyan.com/press' },
];

export { GAMBIT_POSTS, PLATFORM_MAP };
