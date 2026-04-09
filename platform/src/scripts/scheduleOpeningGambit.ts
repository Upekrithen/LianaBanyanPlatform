/**
 * OPENING GAMBIT — Social Media Launch Sequence
 * ==============================================
 * The coordinated 7-day launch across all platforms.
 * Loaded into The Battery, nothing fires until "As You Wish."
 *
 * Design philosophy (from BISHOP draft):
 *   Day 1: Pain (why this exists)
 *   Day 2: Vision (what it is)
 *   Day 3: Proof (why it works)
 *   Day 4: People (who it's for)
 *   Day 5: Architecture (how it's built)
 *   Days 6-7: Consolidation (engage, don't publish)
 *
 * Rules:
 *   - Maximum 4 posts per day
 *   - Minimum 2 hours between posts
 *   - Priority queue by importance
 *   - NOTHING fires without explicit "As You Wish" confirmation
 *
 * Innovation #1422+: Opening Gambit multi-platform launch sequence
 */

import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GambitPost {
  postNumber: number;
  day: number;                          // 1-7
  dayTheme: string;                     // "THE PAIN", "THE VISION", etc.
  timeSlot: string;                     // "8AM", "10AM", "12PM", "2PM"
  platform: string;                     // Primary platform
  crossPostTo?: string[];               // Additional platforms
  postType: "thread" | "article" | "single" | "engagement";
  title: string;                        // Internal title for Battery display
  content: string;                      // Full post content
  threadParts?: string[];               // For Twitter threads
  hashtags: string[];
  articleLink?: string;                 // Link to published article (filled after publish)
  status: "draft" | "approved" | "scheduled" | "fired";
  personalHook?: string;               // Which personal story is used
}

export interface GambitScheduleOptions {
  launchDate: Date;                     // Day 1 start date
  platforms: string[];                  // Which platforms to target
  userId?: string;
}

export interface GambitScheduleResult {
  success: boolean;
  postsCreated: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST CONTENT — DAY 1: THE PAIN (Launch Day)
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_1_POSTS: GambitPost[] = [
  {
    postNumber: 1,
    day: 1,
    dayTheme: "THE PAIN",
    timeSlot: "8AM",
    platform: "twitter",
    crossPostTo: ["bluesky"],
    postType: "thread",
    title: "Day 1 — Twitter Thread: Dog Antibiotics",
    content: "", // Assembled from threadParts
    threadParts: [
      `I bought dog antibiotics from a pet store because I couldn't afford to take my daughter to the doctor.

That's not a metaphor. That's a Tuesday.

I spent 9 years building something so nobody has to do that again.

Thread. 🧵`,

      `My name is Jonathan Jones. U.S. Army National Guard veteran (Infantry 11B, Aviation 15A). Helicopter pilot. Father of eight — four grown and on their own, four still at home. 21-year IT developer.

For the last 9 years — every single day for the last 7 months — I've been building a cooperative commerce platform called Liana Banyan.`,

      `The core idea: What if the people who create the value keep the value?

Not 60% after fees. Not whatever the algorithm decides you're worth.

83.3%. Every time. Constitutionally locked. Cost + 20%, and the creator keeps the rest.`,

      `That 20% funds 16 charitable initiatives — from neighbors feeding neighbors (Let's Make Dinner) to $50 microloans (VSL) to affordable medications (Health Accords).

Not pledged. Not promised. Architecturally guaranteed.`,

      `I put my mortgage on this. Half my family's emergency savings funds the first 300 medallions.

My wife is all in. My kids know what we're building.

There is no Plan B.`,

      `I've played 25,399 games of chess. Lost half of them. Still in the top fraction of a percent.

Because losing is how you learn. And in this cooperative, failure is a feature — your failed attempt teaches the next person what not to do.

No effort is wasted. Every attempt matters.`,

      `I'm looking for 300 founding members. $5 a year. That's it.

Not $500. Not $5,000. Five dollars to join a cooperative that's structurally incapable of exploiting you.

Because I'm sick and tired of eking my way through life. And I bet you are too.

lianabanyan.com/join`,

      `"I don't know where I'm going, but I know what I'm looking for, and in time, I will find both."

#LianaBanyan #CooperativeCommerce #2ndSecondIndustrialRevolution`,
    ],
    hashtags: ["LianaBanyan", "CooperativeCommerce", "2ndSecondIndustrialRevolution"],
    personalHook: "Pet antibiotics, chess, eking",
    status: "draft",
  },
  {
    postNumber: 2,
    day: 1,
    dayTheme: "THE PAIN",
    timeSlot: "10AM",
    platform: "linkedin",
    postType: "single",
    title: "Day 1 — LinkedIn: Dog Antibiotics Long-Form",
    content: `I Bought Dog Antibiotics Because I Couldn't Afford a Doctor

Nine years ago, I started building a cooperative commerce platform. Not because I had venture capital or a Stanford MBA. Because I had a family I couldn't afford to take to the doctor, and I was tired of systems designed to extract from people who can't afford to say no.

My name is Jonathan Jones. I'm a U.S. Army National Guard veteran (Infantry 11B, Aviation 15A), helicopter pilot, father of eight — four grown and on their own, four still at home — and a 21-year IT developer.

Liana Banyan is what came from forty years of thinking about that. A cooperative commerce platform where:

→ Creators keep 83.3% of every transaction
→ The margin is constitutionally locked at Cost + 20%
→ 16 charitable initiatives are funded by architecture, not pledges
→ Every member can start a business for $5

The platform is live. The architecture is backed by 2,097 patent claims. The operating agreement locks the economics.

I'm looking for 300 founding members who are tired of eking their way through life.

$5 a year. No Plan B.

#cooperativeeconomics #socialenterprise #platformcooperativism`,
    hashtags: ["cooperativeeconomics", "socialenterprise", "platformcooperativism"],
    personalHook: "Pet antibiotics, paper route",
    status: "draft",
  },
  {
    postNumber: 3,
    day: 1,
    dayTheme: "THE PAIN",
    timeSlot: "12PM",
    platform: "medium",
    postType: "article",
    title: "Day 1 — Medium Article: Eking",
    content: `[ARTICLE 1: "I'm Sick and Tired of Eking My Way Through Life"]

Submit to: Better Marketing, The Startup, Authority Magazine

Cross-link: Full article from BISHOP_DROPZONE/ARTICLE_01_EKING_DRAFT.md`,
    hashtags: ["LianaBanyan", "CooperativeEconomics"],
    articleLink: "", // Fill after publishing
    personalHook: "Eking, antibiotics, Christmas Eve 1992",
    status: "draft",
  },
  {
    postNumber: 4,
    day: 1,
    dayTheme: "THE PAIN",
    timeSlot: "2PM",
    platform: "reddit",
    postType: "single",
    title: "Day 1 — Reddit r/Entrepreneur: 9 Years Building",
    content: `I spent 9 years building a cooperative commerce platform. Here's why I'm giving the IP away.

I'm a 53-year-old U.S. Army National Guard veteran and father of eight. For the last 9 years I've been building Liana Banyan — a cooperative commerce platform where creators keep 83.3% of every transaction, the margin is constitutionally locked, and 16 charitable initiatives are funded by the architecture itself.

I put 2,097 patent claims into this. But here's the thing — about 80% of that IP goes into the cooperative. Not because I'm generous. Because hoarding it would make me the exact kind of landlord I'm trying to replace.

The cost to join: $5/year. The economic model: Cost + 20%, locked in the operating agreement. The goal: 300 founding members who want to build something that can't be enshittified.

AMA in the comments.

Also post to: r/cooperatives, r/leanstartups, r/smallbusiness`,
    hashtags: [],
    personalHook: "9 years, IP contribution",
    status: "draft",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// POST CONTENT — DAY 2: THE VISION
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_2_POSTS: GambitPost[] = [
  {
    postNumber: 5,
    day: 2,
    dayTheme: "THE VISION",
    timeSlot: "8AM",
    platform: "medium",
    postType: "article",
    title: "Day 2 — Medium Article: Ambassador of the Quan",
    content: `[ARTICLE 2: "The Ambassador of the Quan"]

Merged Ruprecht+Quan version from BISHOP_DROPZONE/ARTICLE_RUPRECHT_MEETS_THE_QUAN_DRAFT.md

Cross-link back to Article 1.`,
    hashtags: ["LianaBanyan", "TheQuan"],
    personalHook: "Jerry Maguire, USAA lifeline",
    status: "draft",
  },
  {
    postNumber: 6,
    day: 2,
    dayTheme: "THE VISION",
    timeSlot: "10AM",
    platform: "twitter",
    crossPostTo: ["bluesky"],
    postType: "thread",
    title: "Day 2 — Twitter Thread: The Quan Math",
    content: "",
    threadParts: [
      `There's a scene in Jerry Maguire where Cuba Gooding Jr. says: "Some dudes might have the coin, but they'll never have the Quan."

The Quan = the money + the love + the respect + the community.

I've been thinking about that line for 30 years. Here's what I built:`,

      `Sarah makes $500 cutting boards.

On Amazon: She keeps $325 after 35% in fees.
On Etsy: She keeps $350.
On Liana Banyan: She keeps $416.50.

Over 100 sales, that's a $6,000-$9,000 difference.

Same product. Same customer. Different architecture.`,

      `The secret isn't being cheaper. It's being *incapable of becoming expensive.*

The margin is locked at Cost + 20%. Not "up to 20%." Not "20% for now." Locked. In the operating agreement. Forever.

That's the Quan.

#LianaBanyan #CooperativeCommerce`,
    ],
    hashtags: ["LianaBanyan", "CooperativeCommerce"],
    personalHook: "Jerry Maguire, Sarah's cutting boards",
    status: "draft",
  },
  {
    postNumber: 7,
    day: 2,
    dayTheme: "THE VISION",
    timeSlot: "12PM",
    platform: "linkedin",
    postType: "single",
    title: "Day 2 — LinkedIn: The Math Behind 83.3%",
    content: `The Math Behind Keeping 83.3%

Yesterday I shared why I built Liana Banyan. Today: how it actually works.

The key insight: if you lock the margin constitutionally, the platform literally cannot enshittify. Not "won't" — "can't."

#CooperativeCommerce #PlatformCooperativism`,
    hashtags: ["CooperativeCommerce", "PlatformCooperativism"],
    personalHook: "Cost+20% math",
    status: "draft",
  },
  {
    postNumber: 8,
    day: 2,
    dayTheme: "THE VISION",
    timeSlot: "2PM",
    platform: "bluesky",
    postType: "single",
    title: "Day 2 — Bluesky: Quan Thread Mirror",
    content: `Mirror of Twitter thread (condensed to 4 posts per Bluesky format). Use same content from Post 6, trimmed.`,
    hashtags: ["LianaBanyan"],
    personalHook: "Quan + math",
    status: "draft",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// POST CONTENT — DAY 3: THE PROOF
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_3_POSTS: GambitPost[] = [
  {
    postNumber: 9,
    day: 3,
    dayTheme: "THE PROOF",
    timeSlot: "8AM",
    platform: "twitter",
    crossPostTo: ["bluesky"],
    postType: "thread",
    title: "Day 3 — Twitter Thread: Fire Chief Principle",
    content: "",
    threadParts: [
      `A fire chief fell three stories while carrying a victim down a ladder.

His first words: "I slipped. Is she okay?"

I built that principle into every line of code, every contract term, every margin calculation in @LianaBanyan.

Accept responsibility. Put others first.`,

      `Here's what "put others first" looks like in architecture:

→ Cost + 20%: You always know the markup
→ No algorithmic suppression: Your work is shown, period
→ Failure is a feature: Your failed attempt teaches the next person
→ Medallions are non-tradeable: No speculation, just governance`,

      `I'm not asking you to trust me. I'm asking you to trust the math.

The operating agreement locks the margin. The governance is distributed. The economics are transparent.

$5/year. 300 founding spots.

lianabanyan.com/join`,
    ],
    hashtags: ["LianaBanyan", "CooperativeCommerce"],
    personalHook: "Fire Chief mantra",
    status: "draft",
  },
  {
    postNumber: 10,
    day: 3,
    dayTheme: "THE PROOF",
    timeSlot: "10AM",
    platform: "hackernews",
    postType: "single",
    title: "Day 3 — Show HN: Cooperative Commerce Platform",
    content: `Show HN: Liana Banyan \u2013 Cooperative commerce platform where creators keep 83.3%

Hi HN. I'm Jonathan, a U.S. Army National Guard vet and 21-year IT developer. I spent 9 years building a cooperative commerce platform.

Tech stack: Supabase (Postgres + RLS), React/Vite, Firebase multi-portal hosting, three-gear currency system (Credits/Marks/Joules), non-tradeable medallion governance on-chain.

The economic model: Cost + 20%, constitutionally locked. Creators keep 83.3%. The 16.7% margin funds 16 charitable initiatives by architecture, not pledge.

What makes it different: The margin is in the operating agreement, not a settings panel. You literally cannot enshittify it without rewriting the corporate charter.

2,097 patent claims (80% contributed to the cooperative). Live at lianabanyan.com.

Looking for 300 founding members at $5/year to stress-test the model.

Full technical architecture: cephas.lianabanyan.com`,
    hashtags: [],
    personalHook: "Technical architecture, patent claims",
    status: "draft",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// POST CONTENT — DAY 4: THE PEOPLE
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_4_POSTS: GambitPost[] = [
  {
    postNumber: 11,
    day: 4,
    dayTheme: "THE PEOPLE",
    timeSlot: "8AM",
    platform: "twitter",
    crossPostTo: ["bluesky"],
    postType: "thread",
    title: "Day 4 — Twitter Thread: The Man With Two Suits",
    content: "",
    threadParts: [
      `When I needed a suit for an interview and couldn't afford one, my roommate gave me one of his two.

Another friend offered one of his fifteen — after the first guy already gave.

30 years later, that still makes me cry.

The man with two gave first. That's the Quan.`,

      `That's why @LianaBanyan costs $5 to join. Not $500.

Because a little generosity — just a tiny little bit — makes ALL the difference.

I know. It did for me.

lianabanyan.com/join`,
    ],
    hashtags: ["LianaBanyan", "TheQuan"],
    personalHook: "Roommate suit",
    status: "draft",
  },
  {
    postNumber: 12,
    day: 4,
    dayTheme: "THE PEOPLE",
    timeSlot: "10AM",
    platform: "linkedin",
    postType: "single",
    title: "Day 4 — LinkedIn: The Man With Two Suits",
    content: `The Man With Two Suits

When I needed a suit for an interview and couldn't afford one, my roommate gave me one of his two.

That small act of generosity — from a man who had barely more than I did — changed my life.

That's why Liana Banyan costs $5 to join. Because the cooperative model amplifies small generosity into structural change.

#CooperativeEconomics #Community`,
    hashtags: ["CooperativeEconomics", "Community"],
    personalHook: "Roommate suit → $5 entry point",
    status: "draft",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// POST CONTENT — DAY 5: THE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_5_POSTS: GambitPost[] = [
  {
    postNumber: 13,
    day: 5,
    dayTheme: "THE ARCHITECTURE",
    timeSlot: "8AM",
    platform: "twitter",
    crossPostTo: ["bluesky"],
    postType: "thread",
    title: "Day 5 — Twitter Thread: Chess & Architecture",
    content: "",
    threadParts: [
      `I've played 25,399 games of chess.
Won roughly half. Lost roughly half.

And I'm in the top 0.4% of players worldwide.

How do you win if you lose half the time?

You play a different game.

That's what @LianaBanyan is. A different game.`,

      `The game most platforms play:
→ Grow fast
→ Attract users with low fees
→ Raise fees once they're locked in
→ Extract maximum value

Our game:
→ Lock the margin on Day 1
→ Make extraction architecturally impossible
→ Let creators keep 83.3% forever
→ Fund 16 initiatives automatically`,

      `Three-Gear Currency:
- Credits = 1:1 with USD (spending money)
- Marks = backed by Joules (earning power)
- Joules = forever stamps (contribution record)

A maker in Lagos and a maker in Louisville receive equivalent purchasing power for equivalent work.

Not by charity. By math.`,

      `Because in OUR Castle, we build more arrows instead of escape tunnels.

Most platforms build escape hatches for the people who run them. We built 2,128 innovations — and 80% of the IP goes into the cooperative.

That's not idealism. That's architecture.

lianabanyan.com/join`,
    ],
    hashtags: ["LianaBanyan", "CooperativeCommerce", "ThreeGearCurrency"],
    personalHook: "Chess statistics, arrows not escape tunnels",
    status: "draft",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// POST CONTENT — DAYS 6-7: CONSOLIDATION
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_6_7_POSTS: GambitPost[] = [
  {
    postNumber: 14,
    day: 6,
    dayTheme: "CONSOLIDATION",
    timeSlot: "10AM",
    platform: "twitter",
    crossPostTo: ["linkedin", "bluesky"],
    postType: "engagement",
    title: "Day 6 — Engagement: Week 1 Recap",
    content: `[X] members joined in 5 days. Here's what we learned.

[Honest recap — what worked, what surprised us, what we're fixing]

This will be written live based on actual results from Days 1-5.`,
    hashtags: ["LianaBanyan"],
    personalHook: "Honest transparency",
    status: "draft",
  },
  {
    postNumber: 15,
    day: 6,
    dayTheme: "CONSOLIDATION",
    timeSlot: "4PM",
    platform: "twitter",
    crossPostTo: ["bluesky"],
    postType: "engagement",
    title: "Day 6 — Engagement: Thank You",
    content: `To everyone who signed up this week: thank you.

Not "thank you for your money." Thank you for believing that a $5 cooperative run by a National Guard vet and his family from Montana might actually work.

We'll prove you right. Or we'll learn why we were wrong. Either way, no effort is wasted.

#LianaBanyan`,
    hashtags: ["LianaBanyan"],
    personalHook: "Gratitude, vulnerability",
    status: "draft",
  },
  {
    postNumber: 16,
    day: 7,
    dayTheme: "CONSOLIDATION",
    timeSlot: "10AM",
    platform: "discord",
    postType: "engagement",
    title: "Day 7 — Discord: Rest Day Community Check-In",
    content: `Rest day. Monitor. Respond to every comment. Plan Week 2.

Post to Discord: "How's everyone feeling? What questions do you have? We're here all day."`,
    hashtags: [],
    personalHook: "Community presence",
    status: "draft",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ALL POSTS COMBINED
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_GAMBIT_POSTS: GambitPost[] = [
  ...DAY_1_POSTS,
  ...DAY_2_POSTS,
  ...DAY_3_POSTS,
  ...DAY_4_POSTS,
  ...DAY_5_POSTS,
  ...DAY_6_7_POSTS,
];

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all Opening Gambit posts for preview in The Battery
 */
export function getOpeningGambitPosts(): GambitPost[] {
  return ALL_GAMBIT_POSTS;
}

/**
 * Get posts for a specific day
 */
export function getPostsForDay(day: number): GambitPost[] {
  return ALL_GAMBIT_POSTS.filter(p => p.day === day);
}

/**
 * Get all unique days and their themes
 */
export function getDayThemes(): Array<{ day: number; theme: string; postCount: number }> {
  const days = new Map<number, { theme: string; count: number }>();
  ALL_GAMBIT_POSTS.forEach(p => {
    if (!days.has(p.day)) {
      days.set(p.day, { theme: p.dayTheme, count: 0 });
    }
    days.get(p.day)!.count++;
  });
  return Array.from(days.entries()).map(([day, { theme, count }]) => ({
    day,
    theme,
    postCount: count,
  }));
}

/**
 * Calculate time slots for posts relative to a launch date.
 * Returns ISO timestamps for each post.
 */
function calculateScheduleTimes(launchDate: Date): Map<number, Date> {
  const timeSlotHours: Record<string, number> = {
    "8AM": 8, "9AM": 9, "10AM": 10, "12PM": 12, "2PM": 14, "4PM": 16,
  };

  const schedule = new Map<number, Date>();

  ALL_GAMBIT_POSTS.forEach(post => {
    const postDate = new Date(launchDate);
    postDate.setDate(postDate.getDate() + (post.day - 1)); // Day 1 = launch date
    postDate.setHours(timeSlotHours[post.timeSlot] || 8, 0, 0, 0);
    schedule.set(post.postNumber, postDate);
  });

  return schedule;
}

/**
 * Schedule all Opening Gambit posts into the database.
 * Posts are created with status "draft" — they must be individually
 * approved and then ARMed in The Battery before firing.
 *
 * NOTHING fires without "As You Wish."
 */
export async function scheduleOpeningGambit(
  options: GambitScheduleOptions
): Promise<GambitScheduleResult> {
  const { launchDate, platforms, userId } = options;

  let targetUserId = userId;
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, postsCreated: 0, error: "Not authenticated" };
    targetUserId = user.id;
  }

  const schedule = calculateScheduleTimes(launchDate);
  let postsCreated = 0;

  for (const post of ALL_GAMBIT_POSTS) {
    // Skip platforms not in the target list
    if (!platforms.includes(post.platform) && post.platform !== "hackernews" && post.platform !== "reddit") {
      // Check if any crossPostTo platforms match
      const hasCrossPost = post.crossPostTo?.some(p => platforms.includes(p));
      if (!hasCrossPost) continue;
    }

    const scheduledFor = schedule.get(post.postNumber);
    if (!scheduledFor) continue;

    // Build full content for thread posts
    let fullContent = post.content;
    if (post.threadParts && post.threadParts.length > 0) {
      fullContent = post.threadParts.join("\n\n---\n\n");
    }

    // Insert into scheduled posts (same table as Little Red Hen scheduler)
    const { error } = await supabase
      .from("member_scheduled_posts")
      .insert({
        user_id: targetUserId,
        content: fullContent,
        scheduled_for: scheduledFor.toISOString(),
        status: "draft",  // NOT "scheduled" — requires manual approval
        platform: post.platform,
        metadata: {
          campaign: "opening_gambit",
          postNumber: post.postNumber,
          day: post.day,
          dayTheme: post.dayTheme,
          timeSlot: post.timeSlot,
          title: post.title,
          postType: post.postType,
          crossPostTo: post.crossPostTo,
          hashtags: post.hashtags,
          personalHook: post.personalHook,
        },
      } as Record<string, unknown>);

    if (error) {
      console.error(`Failed to schedule post ${post.postNumber}:`, error);
      continue;
    }

    // Also insert cross-posts as separate rows
    if (post.crossPostTo) {
      for (const crossPlatform of post.crossPostTo) {
        if (!platforms.includes(crossPlatform)) continue;

        await supabase
          .from("member_scheduled_posts")
          .insert({
            user_id: targetUserId,
            content: fullContent,
            scheduled_for: scheduledFor.toISOString(),
            status: "draft",
            platform: crossPlatform,
            metadata: {
              campaign: "opening_gambit",
              postNumber: post.postNumber,
              day: post.day,
              dayTheme: post.dayTheme,
              timeSlot: post.timeSlot,
              title: `[Cross-post] ${post.title}`,
              postType: post.postType,
              originalPlatform: post.platform,
              hashtags: post.hashtags,
            },
          } as Record<string, unknown>);

        postsCreated++;
      }
    }

    postsCreated++;
  }

  return {
    success: true,
    postsCreated,
  };
}

/**
 * Preview the full Opening Gambit schedule with calculated dates
 */
export function previewOpeningGambit(launchDate: Date): Array<GambitPost & { scheduledFor: Date }> {
  const schedule = calculateScheduleTimes(launchDate);

  return ALL_GAMBIT_POSTS.map(post => ({
    ...post,
    scheduledFor: schedule.get(post.postNumber) || launchDate,
  }));
}

/**
 * Platform-specific post counts
 */
export function getPostCountByPlatform(): Record<string, number> {
  const counts: Record<string, number> = {};
  ALL_GAMBIT_POSTS.forEach(post => {
    counts[post.platform] = (counts[post.platform] || 0) + 1;
    post.crossPostTo?.forEach(cp => {
      counts[cp] = (counts[cp] || 0) + 1;
    });
  });
  return counts;
}

/**
 * Week 2 triggers (conditional, based on member count)
 */
export const WEEK_2_TRIGGERS = [
  { threshold: 25, action: "Send Buffett letter, announce on social" },
  { threshold: 35, action: "Send Melinda French Gates letter" },
  { threshold: 50, action: "Begin Crown Letter batch (first 10)" },
  { threshold: 0, action: "Any celebrity responds → engagement post + thank you thread" },
  { threshold: 0, action: "Press inquiry → lianabanyan.com/press kit" },
] as const;
