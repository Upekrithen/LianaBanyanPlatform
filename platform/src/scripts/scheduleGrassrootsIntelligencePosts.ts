/**
 * GRASSROOTS INTELLIGENCE — Social Media Campaign Scheduler
 * ==========================================================
 * Coordinated 5-day campaign based on the Grassroots Intelligence paper,
 * Political Expedition cue card, and Marks-Based Democracy paper.
 *
 * Theme: "Your signature should cost you something."
 * Tonal arc: Broken Petitions → Real Reading → Effort Democracy → The Data → Join
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

export interface GrassrootsPost {
  postNumber: number;
  day: number;
  dayName: string;
  platform: string;
  scheduledTime: string;
  title: string;
  content: string;
  type: 'thread' | 'article' | 'post' | 'engagement';
  linkedArticle?: string;
  hashtags: string[];
  imageUrls: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================================================
// GRASSROOTS INTELLIGENCE POST DEFINITIONS
// ============================================================================

const GRASSROOTS_POSTS: GrassrootsPost[] = [
  // ═══════════════════════════════════════════════════════════════════
  // DAY 1: BROKEN PETITIONS (The Problem)
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 1,
    day: 1,
    dayName: 'Broken Petitions',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'Your Signature Costs Nothing — Twitter Thread',
    type: 'thread',
    priority: 'critical',
    content: `You signed a petition last week. So did 50,000 other people.

The politician who received it knew that each signature cost three seconds and a mouse click.

So they filed it and moved on.

Thread. 🧵

---

Here's the math nobody tells you about online petitions:

→ Average time to sign: 3 seconds
→ Average reading of the issue: 0 seconds
→ Average understanding of the legislation: 0%
→ Value to a politician: Filing cabinet

50,000 unread signatures = 50,000 mouse clicks = nothing.

---

What if your signature actually cost you something?

Not money. Effort.

What if you had to READ the source material before you could sign? What if the platform tracked your reading time against the length of the content?

What if your signature carried the weight of your understanding?

---

That's what we built at @LianaBanyan.

Before you can sign a petition, you read the source material. Actually read it. The platform measures your engagement — Coverage Minutes prove you did the work.

Ten thousand signatures from people who each spent twenty minutes understanding the legislation is a fundamentally different document than ten thousand clicks.

---

Every petition you sign costs you real effort.

That's why politicians will actually read it.

lianabanyan.com/political-expedition`,
    hashtags: ['#LianaBanyan', '#PoliticalExpedition', '#PowerToThePeople', '#EffortDemocracy'],
    imageUrls: [],
  },

  {
    postNumber: 2,
    day: 1,
    dayName: 'Broken Petitions',
    platform: 'linkedin',
    scheduledTime: '10:00 AM',
    title: 'The Signature That Costs Something',
    type: 'post',
    priority: 'critical',
    content: `Online petitions are broken. Not because the causes are wrong — because the signatures are free.

A politician receives a petition with 50,000 names and knows each one cost three seconds and a mouse click. So they file it and move on.

We built something different at Liana Banyan. Before you can sign a petition, you read the source material. Actually read it. The platform measures your engagement time against the content length.

Your signature carries the weight of your understanding.

This isn't about making democracy harder. It's about making democracy mean something. When 10,000 people each spend 20 minutes understanding a piece of legislation before signing, that petition becomes a fundamentally different document.

Coverage Minutes prove you did the work. Politicians see effort-backed petitions. And for the first time, a signature actually costs something — your attention.

We call it the Political Expedition. "Power to the People" — Initiative #15 of 16.`,
    hashtags: ['#cooperativeeconomics', '#civicengagement', '#platformdemocracy'],
    imageUrls: [],
  },

  {
    postNumber: 3,
    day: 1,
    dayName: 'Broken Petitions',
    platform: 'bluesky',
    scheduledTime: '12:00 PM',
    title: 'Broken Petitions — Bluesky',
    type: 'post',
    priority: 'high',
    content: `Online petitions: 50,000 signatures, each costing 3 seconds and a mouse click.

Politicians know. They file them.

What if you had to READ the source material before signing? What if the platform tracked your reading time?

10,000 informed signatures > 50,000 clicks.

That's what @lianabanyan.com built. Your signature carries the weight of your understanding.

lianabanyan.com/political-expedition`,
    hashtags: ['#EffortDemocracy', '#PowerToThePeople'],
    imageUrls: [],
  },

  {
    postNumber: 4,
    day: 1,
    dayName: 'Broken Petitions',
    platform: 'reddit',
    scheduledTime: '2:00 PM',
    title: 'What if petition signatures actually meant something?',
    type: 'post',
    priority: 'high',
    content: `I spent 9 years building a cooperative platform. One of our 16 initiatives is called the Political Expedition — it solves a problem with online petitions that nobody talks about.

The problem: A politician receives 50,000 petition signatures and knows each one cost 3 seconds. So they file it.

Our solution: Before you can sign, you read the source material. The platform tracks your reading time against the content length. Your signature carries the weight of your understanding.

10,000 signatures from people who each spent 20 minutes reading the legislation is a fundamentally different document.

No demographics collected. No party affiliation. Zero personal data. Just effort-weighted civic engagement.

The paper explaining the full system: lianabanyan.com/economics/grassroots-intelligence

Subreddits: r/politics, r/civictech, r/technology`,
    hashtags: [],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 2: EFFORT-WEIGHTED DEMOCRACY (The Innovation)
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 5,
    day: 2,
    dayName: 'Effort Democracy',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'Marks and the Six Tiers — Thread',
    type: 'thread',
    priority: 'critical',
    content: `Yesterday I talked about petitions that cost effort.

Today: HOW that effort works.

It starts with a currency you can't buy.

Thread. 🧵

---

Marks are an effort-debt currency.

→ Can't be purchased
→ Can't be gifted
→ Can't be transferred
→ Can't be earned passively

Every Mark represents genuine human effort. Period.

---

When you vote on a petition, you spend Marks. Six tiers:

Tier 1 — Voice: 1 Mark
Tier 2 — Conviction: 5 Marks
Tier 3 — Commitment: 10 Marks
Tier 4 — Dedication: 25 Marks
Tier 5 — Devotion: 50 Marks
Tier 6 — Cornerstone: 100 Marks

Full-depth voting = 191 Marks of accumulated effort.

---

Here's the thing: your vote NEVER resets.

If you voted Tier 4 on climate legislation, that's permanent. Forever. Your civic commitment is a lifetime record.

It's not a poll. It's a statement of values backed by real work.

---

This is democracy that means something.

Not one person = one click.
Not one dollar = one voice.

One person = effort invested = proportional voice.

Wealth can't buy it. Bots can't fake it. Only sustained participation earns it.

lianabanyan.com/political-expedition`,
    hashtags: ['#LianaBanyan', '#EffortDemocracy', '#SixTiers'],
    imageUrls: [],
  },

  {
    postNumber: 6,
    day: 2,
    dayName: 'Effort Democracy',
    platform: 'linkedin',
    scheduledTime: '10:00 AM',
    title: 'The Currency You Cannot Buy',
    type: 'post',
    priority: 'high',
    content: `Quadratic voting is elegant. It's also broken — because it uses money.

If civic expression costs money, you've just rebuilt plutocracy with extra math.

We built an alternative. Marks are an effort-debt currency that cannot be purchased, gifted, or transferred. Every Mark represents genuine human participation — reading, contributing, helping others.

When you vote on a petition, you spend Marks across six tiers from Voice (1 Mark) to Cornerstone (100 Marks). Full-depth commitment = 191 Marks of accumulated effort.

The key innovation: your civic commitment never resets. If you voted Tier 4 on climate legislation, that's a permanent statement of values. Not a poll response that evaporates in a news cycle.

This is effort-weighted democracy. Not wealth-weighted. Not one-click-one-voice. Your voice is proportional to your sustained participation in the community.

The full paper: Marks-Based Democratic Participation.`,
    hashtags: ['#civictech', '#democraticinnovation', '#cooperativeeconomics'],
    imageUrls: [],
  },

  {
    postNumber: 7,
    day: 2,
    dayName: 'Effort Democracy',
    platform: 'medium',
    scheduledTime: '12:00 PM',
    title: 'What If Your Vote Cost Effort Instead of Money?',
    type: 'article',
    priority: 'medium',
    content: 'Full article from academic paper PAPER_MARKS_DEMOCRATIC_PARTICIPATION.md — adapted for general audience. Submit to: Better Marketing, Towards Data Science, Democracy publications.',
    hashtags: [],
    linkedArticle: 'PAPER_MARKS_DEMOCRATIC_PARTICIPATION.md',
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 3: THE DATA (Zero Demographics)
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 8,
    day: 3,
    dayName: 'The Data',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'Zero Demographics — Thread',
    type: 'thread',
    priority: 'critical',
    content: `Traditional polling asks who you are before it asks what you think.

Age. Gender. Race. Income. Education. Location.

Then it uses those demographics to weight your opinion.

We deleted all of it.

Thread. 🧵

---

Grassroots Intelligence generates political trend data WITHOUT demographics.

No age. No gender. No race. No income. No education. No location. No party affiliation.

Just: what did you read, how deeply did you engage, and how much effort did you spend expressing your position?

---

Why zero demographics?

1. Can't be de-anonymized (no demographic cross-referencing)
2. Can't be gamed (no category to optimize for)
3. Can't be biased (no social desirability effect)
4. Can't be faked (every data point = verified human effort)

---

The result: political intelligence that measures what people ACTUALLY care about, weighted by how much they care.

Not what they tell a pollster on the phone.
Not what an algorithm amplifies.
Not what bots inflate.

Effort-verified civic engagement. Nothing else.

---

A petition with 5,000 Tier-4 votes tells you more than any poll with 50,000 respondents.

Because every single one of those 5,000 people spent real effort reading, understanding, and committing.

That's intelligence you can trust.

lianabanyan.com/economics/grassroots-intelligence`,
    hashtags: ['#LianaBanyan', '#GrassrootsIntelligence', '#ZeroDemographics'],
    imageUrls: [],
  },

  {
    postNumber: 9,
    day: 3,
    dayName: 'The Data',
    platform: 'hackernews',
    scheduledTime: '10:00 AM',
    title: 'Show HN: Effort-gated civic participation with zero demographic data collection',
    type: 'post',
    priority: 'high',
    content: `We built a political intelligence system that generates trend data WITHOUT collecting demographics.

Technical approach:
- Effort-debt currency (Marks) that cannot be purchased, only earned through participation
- 6-tier voting system with diminishing returns (1/5/10/25/50/100 Marks)
- Coverage Minutes: reading time tracked against content length (238 WPM benchmark)
- Merkle tree integrity: buyers verify aggregated stats against ledger root
- Minimum 100-participant aggregation threshold prevents de-anonymization

What we measure: engagement intensity, tier-weighted voting patterns, temporal trends, cross-petition momentum.

What we don't collect: age, gender, race, income, education, location, party affiliation.

The insight: When every data point represents verified human effort (impossible to fake/purchase/automate), you don't NEED demographics. The effort signal IS the signal.

Full paper: lianabanyan.com/economics/grassroots-intelligence
Technical stack: Supabase (Postgres + RLS), React/Vite, Merkle hash chains.`,
    hashtags: [],
    imageUrls: [],
  },

  {
    postNumber: 10,
    day: 3,
    dayName: 'The Data',
    platform: 'reddit',
    scheduledTime: '12:00 PM',
    title: 'We built political trend intelligence without collecting a single demographic',
    type: 'post',
    priority: 'medium',
    content: 'Technical deep-dive for r/civictech, r/privacy, r/datascience — zero-demographic intelligence model, Merkle verification, effort-gated participation.',
    hashtags: [],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 4: THE MUFFLED RULE (Civility by Architecture)
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 11,
    day: 4,
    dayName: 'Architectural Civility',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'The Muffled Rule — Thread',
    type: 'thread',
    priority: 'high',
    content: `Every social media platform has the same moderation problem:

The damage is done before the moderator arrives.

Trolls are fast. Moderators are slow. By the time you remove the post, 10,000 people saw it.

We solved it with architecture.

Thread. 🧵

---

The Muffled Rule: Your mic only works for as long as you have listened to others speak.

Want to talk for 10 minutes? You need 10 Coverage Minutes.

Coverage Minutes are earned by:
→ Listening at Round Tables (1:1 ratio)
→ Reading articles (proportional to length)
→ Verified engagement (composite read-proof)

---

When your Coverage Minutes run out, your mic automatically turns off.

Not banned. Not muted by a moderator. Structurally limited.

You can earn more by listening. Reading. Engaging.

The loudest voices? They've earned it through sustained engagement.

---

The trolls? They'd have to read thousands of words of content they hate to earn enough minutes to post one hateful paragraph.

The economics don't make sense. Abuse is structurally unprofitable.

That's not moderation. That's architecture.

lianabanyan.com/economics/muffled-rule`,
    hashtags: ['#LianaBanyan', '#MuffledRule', '#ArchitecturalCivility'],
    imageUrls: [],
  },

  {
    postNumber: 12,
    day: 4,
    dayName: 'Architectural Civility',
    platform: 'linkedin',
    scheduledTime: '10:00 AM',
    title: 'We Made Trolling Structurally Unprofitable',
    type: 'post',
    priority: 'medium',
    content: `Content moderation has a fundamental timing problem: the damage happens before the moderator arrives.

We built something different. The Muffled Rule: your mic only works for as long as you have listened to others speak.

Speaking costs Coverage Minutes. Listening earns them. When your balance hits zero, your mic automatically turns off. No moderator needed.

Trolls would need to read thousands of words of content they hate to earn enough minutes for one hateful paragraph. The economics simply don't work.

Three layers of protection:
1. Structural disincentive (earning minutes requires genuine engagement)
2. Community flagging (bidirectional voting by engaged members)
3. Harper Guild (ethics enforcement with transparent action logging)

This is the difference between moderation and architecture. Moderation is a bandage. Architecture is the immune system.`,
    hashtags: ['#civictech', '#contentmoderation', '#cooperativedesign'],
    imageUrls: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // DAY 5: JOIN THE EXPEDITION (Call to Action)
  // ═══════════════════════════════════════════════════════════════════
  {
    postNumber: 13,
    day: 5,
    dayName: 'Join the Expedition',
    platform: 'twitter',
    scheduledTime: '8:00 AM',
    title: 'Four Papers, One Vision — Thread',
    type: 'thread',
    priority: 'high',
    content: `This week I shared four pieces of the same puzzle:

Day 1: Petitions that cost effort
Day 2: A currency you can't buy
Day 3: Intelligence without demographics
Day 4: Civility by architecture

Together, they form the Political Expedition — Initiative #15 of 16 at @LianaBanyan.

---

Here's the vision:

A place where you have to READ before you sign.
A place where your civic voice grows with your participation.
A place where your data is never sold with your identity attached.
A place where trolls go broke trying to disrupt the conversation.

---

Non-partisan. Non-ideological. Equal access.

Whether you're left, right, center, or none of the above — your effort earns the same voice.

The only currency is participation. The only gate is reading.

$5/year. 16 charitable initiatives. Creators keep 83.3%.

lianabanyan.com/political-expedition`,
    hashtags: ['#LianaBanyan', '#PoliticalExpedition', '#PowerToThePeople'],
    imageUrls: [],
  },

  {
    postNumber: 14,
    day: 5,
    dayName: 'Join the Expedition',
    platform: 'linkedin',
    scheduledTime: '10:00 AM',
    title: 'The Political Expedition — All Four Papers',
    type: 'post',
    priority: 'medium',
    content: `This week I introduced four innovations that together form our Political Expedition initiative:

1. Effort-backed petitions (Coverage Minutes prove you read the issue)
2. Marks-based voting (six-tier effort-weighted democratic participation)
3. Grassroots Intelligence (zero-demographic political trend data)
4. The Muffled Rule (architectural civility — your mic works as long as you've listened)

Each paper contains patent-pending innovations. Together, they create a civic engagement platform where:

→ Your signature carries the weight of your understanding
→ Your voice grows with your sustained participation
→ Your identity is never attached to your data
→ Abuse is structurally unprofitable

All four papers are available at lianabanyan.com/economics

Non-partisan. Non-ideological. Equal access. $5/year.`,
    hashtags: ['#cooperativeeconomics', '#civictech', '#platformdemocracy'],
    imageUrls: [],
  },

  {
    postNumber: 15,
    day: 5,
    dayName: 'Join the Expedition',
    platform: 'twitter',
    scheduledTime: '2:00 PM',
    title: 'Thank You — Grassroots Wrap',
    type: 'engagement',
    priority: 'low',
    content: `To everyone who read this week's threads and engaged with the ideas:

You just demonstrated the exact behavior the Political Expedition is built to reward.

You read. You thought. You responded with substance.

That's not a click. That's participation.

Welcome to the Expedition.

lianabanyan.com/political-expedition`,
    hashtags: ['#LianaBanyan', '#PowerToThePeople'],
    imageUrls: [],
  },
];

// ============================================================================
// PLATFORM MAPPING
// ============================================================================

const PLATFORM_MAP: Record<string, string> = {
  twitter: 'twitter',
  linkedin: 'linkedin',
  medium: 'medium',
  reddit: 'reddit',
  bluesky: 'bluesky',
  hackernews: 'hackernews',
  facebook: 'facebook',
  threads: 'threads',
  discord: 'discord',
};

// ============================================================================
// PREVIEW & SCHEDULING
// ============================================================================

export function previewGrassrootsPosts(): GrassrootsPost[] {
  return [...GRASSROOTS_POSTS];
}

export function getGrassrootsPostsForPlatform(platform: string): GrassrootsPost[] {
  return GRASSROOTS_POSTS.filter(p => p.platform === platform);
}

export function getGrassrootsPostsForDay(day: number): GrassrootsPost[] {
  return GRASSROOTS_POSTS.filter(p => p.day === day);
}

export function getGrassrootsDays(): Array<{ day: number; name: string; postCount: number }> {
  const days = new Map<number, { name: string; count: number }>();
  for (const post of GRASSROOTS_POSTS) {
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

export function getGrassrootsPlatforms(): string[] {
  return [...new Set(GRASSROOTS_POSTS.map(p => p.platform))];
}

export interface GrassrootsScheduleOptions {
  postNumbers?: number[];
  launchDate: Date;
  overridePlatform?: string;
}

export async function scheduleGrassrootsIntelligencePosts(options: GrassrootsScheduleOptions): Promise<{
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
    ? GRASSROOTS_POSTS.filter(p => postNumbers.includes(p.postNumber))
    : GRASSROOTS_POSTS;

  let postsCreated = 0;

  for (const post of postsToSchedule) {
    const dayOffset = post.day - 1;
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
      console.error(`Error scheduling Grassroots post ${post.postNumber}:`, error);
    } else {
      postsCreated++;
    }
  }

  return { success: true, postsCreated };
}

export { GRASSROOTS_POSTS, PLATFORM_MAP as GRASSROOTS_PLATFORM_MAP };
