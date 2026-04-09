# Knight Session K367 — Battery Dispatch Opening Gambit Salvo
## Priority: CRITICAL — Air cover for letter dispatch
## Bishop B087 | April 7, 2026

---

## Context

The Opening Gambit is firing. 43+ letters going out via the Letter Dispatch system (K362). Battery Dispatch (K160) is a live production system that posts cue cards and content across social media on scheduled cadences.

This session creates the **social media air cover** — cue cards and posts that go live BEFORE or SAME DAY as the emails, so when recipients Google "Liana Banyan" or "Jonathan Jones cooperative platform," they see activity everywhere.

The Battery Dispatch system supports: X/Twitter, LinkedIn, Bluesky, Threads, Facebook, Instagram, Discord, Medium.

Rate limits per platform (from dispatchGuardrails.ts):
- X: 4/hour, 5 min interval, 280 chars
- LinkedIn: 3/hour, 15 min interval, 3,000 chars
- Bluesky: 6/hour, 5 min interval, 300 chars
- Threads: 4/hour, 10 min interval, 500 chars
- Facebook: 4/hour, 10 min interval
- Medium: External publishing (longer form)

Existing campaign scripts in platform/src/scripts/:
- scheduleLittleRedHenPosts.ts (25 posts, 3 acts)
- scheduleOpeningGambitPosts.ts (7-day sequence, 5 phases)
- scheduleGrassrootsIntelligencePosts.ts (5-day civic campaign)

---

## TASK 1: Create Opening Gambit Social Campaign Script

**File:** `platform/src/scripts/scheduleOpeningGambitSalvo.ts`

Create a 14-day social media campaign with **5 content streams** running concurrently across platforms. Follow the pattern of existing campaign scripts (scheduleLittleRedHenPosts.ts).

### Stream 1: Platform Identity Posts (Days 1-14, daily)
Short punchy posts establishing what Liana Banyan IS.

```
Day 1: "A cooperative platform where creators keep 83.3%. Not 50%. Not 70%. 83.3%. The math is in the bylaws. lianabanyan.com"
Day 2: "$5/year membership. Not $5/month. $5/year. That's the structural bylaw. Cost + 20% on everything. lianabanyan.com"
Day 3: "12 provisional patents. 2,224 innovations. Built by a veteran father of eight with four AI agents. The platform is live. lianabanyan.com"
Day 4: "35 production systems. 23 domains. 8 portals. One cooperative. No investors. No VC. $5/year. lianabanyan.com"
Day 5: "Credits, Marks, and Joules. Three currencies. Credits = dollars. Marks = effort. Joules = governance weight. All equal value. lianabanyan.com"
Day 6: "Cost + 20%. That's the platform margin. Not 30% like Apple. Not 20-45% like Amazon. Cost + 20%. Enforced at the database level. lianabanyan.com"
Day 7: "The creator keeps 83.3% on every transaction. That's $416.67 on a $500 sale. We keep $83.33. That covers infrastructure. lianabanyan.com"
Day 8: "202 Crown Jewels. Each one is an innovation so fundamental it defines a category. They're all patented. lianabanyan.com"
Day 9: "You build the Features — We're building the Board. Triple meaning. Think about it. lianabanyan.com"
Day 10: "Platform cooperativism isn't a theory anymore. It's 35 production systems with 12 patents. lianabanyan.com"
Day 11: "Every neighborhood on the platform has a Content Shield. CSS sandboxed. Economic rules enforced at the database trigger level. You can't enshittify this. lianabanyan.com"
Day 12: "Political Expedition: Write letters to Congress about cooperative economics. The templates are live. The rep lookup works. Power to the People. lianabanyan.com/political-expedition"
Day 13: "WildFire Tour: Try the entire platform before you spend $5. No signup. No credit card. Just look. lianabanyan.com/wildfire-tour"
Day 14: "We didn't raise money. We filed patents. 12 provisionals. ~2,393 formal claims. The moat is intellectual property, not capital. lianabanyan.com"
```

### Stream 2: Cue Card Posts (Days 1-14, 2x daily)
Link to specific platform features with cue card landing pages. These drive traffic to Red Carpet pages.

```
"Cooperatives shouldn't charge 30%. See why we charge Cost + 20%: lianabanyan.com/cephas/cost-plus-twenty"
"What if your membership cost $5/year and gave you three currencies? lianabanyan.com/cephas/three-currency-system"
"The Spice Rack: 10 skills. 10 business dimensions. Find your spice. lianabanyan.com/cephas/the-spice-rack"
"Stone Soup economics: everyone brings something. The platform provides the pot. lianabanyan.com/cephas/stone-soup"
"38 academic papers. Peer-reviewable. On cooperative platform economics. lianabanyan.com/cephas"
"Skipping Stones: from a tweet to a paper in four clicks. lianabanyan.com/cephas/skipping-stones"
"The Concurrent Distribution Grid: ~720 posts/month across all channels. 50 days before repeat. lianabanyan.com/cephas/distribution-grid"
"Family Table: meal planning meets cooperative economics. lianabanyan.com/family-table"
"Housing on a cooperative platform. No landlord markup. Cost + 20%. lianabanyan.com/housing"
"Design Democracy: community members vote on platform design. Not a suggestion box — actual governance. lianabanyan.com/design-democracy"
"ADAPT Score: your portable professional reputation. Guilds verify it. It follows you. lianabanyan.com/adapt"
"Treasure Maps: find cooperative opportunities near you. lianabanyan.com/treasure-maps"
"Helm: your personal workspace. One Helm. Many Bridges. lianabanyan.com/helm"
"X-Ray Goggles: see how the platform works. Member-facing transparency. lianabanyan.com/x-ray"
```

### Stream 3: Academic/Thought Leader Tags (Days 1-7)
Posts that reference or tag the Phase 1 and Phase 2 letter recipients' work. NOT cold DMs — public posts engaging with their IDEAS.

```
"Platform cooperativism (@trebaborscholz @ntnsndr) isn't just theory. We built it. 35 systems. 12 patents. $5/year. lianabanyan.com"
"The enshittification thesis (@doctorow) has an answer: immutable economic rules enforced at the database level. Cost + 20%. Forever. lianabanyan.com"
"@erikbryn's work on AI and the digital economy — what if the AI agents worked FOR the cooperative? Four agents. One platform. lianabanyan.com"
"@AnandWrites asked 'Winners Take All' — what if winners built the board instead? lianabanyan.com"
"@rushkoff's Team Human meets cooperative economics. The humans own the platform. The AI works for them. lianabanyan.com"
"@KateRaworth's Doughnut Economics in code: Cost + 20% floor. 83.3% creator ceiling. The math fits inside the doughnut. lianabanyan.com"
"@JulietSchor asked what comes after the gig. Answer: a cooperative with $5/year membership and three currencies. lianabanyan.com"
```

### Stream 4: Medium Articles (Days 1, 4, 7, 10)
Longer-form posts on Medium targeting Mackenzie Scott's reading ecosystem.

```
Day 1: "An Open Letter to Anyone Building Cooperative Platforms" (repost/update existing Medium article)
Day 4: "12 Patents, $5/Year Membership, and Why We Don't Take VC" (new)
Day 7: "The 83.3% Platform: How Cost + 20% Changes Creator Economics" (new)
Day 10: "Political Expedition: Power to the People Via Cooperative Technology" (new)
```

### Stream 5: LinkedIn Deep Posts (Days 2, 5, 8, 11)
Professional-length posts for the academic and business audience.

```
Day 2: Platform cooperativism thesis — what we built and why (reference Scholz, Schneider, Benkler)
Day 5: The patent strategy — 12 provisionals protecting cooperative innovation (reference WorkHelix, Brynjolfsson)
Day 8: Three-currency economics — Credits, Marks, Joules (reference Raworth, Mazzucato)
Day 11: Four-agent AI architecture — how Bishop, Knight, Rook, and Pawn built a platform (reference Acemoglu)
```

---

## TASK 2: Create the Campaign Scheduling Migration

**File:** `platform/supabase/migrations/20260407200000_k367_opening_gambit_salvo.sql`

Insert all posts into `member_scheduled_posts` table with staggered scheduling:

- Stream 1: 1 post/day at 9:00 AM CT across X, LinkedIn, Bluesky
- Stream 2: 2 posts/day at 11:00 AM and 3:00 PM CT across X, Bluesky, Threads
- Stream 3: 1 post/day at 10:00 AM CT on X and LinkedIn only (Days 1-7)
- Stream 4: Medium articles at 8:00 AM CT on publish days
- Stream 5: LinkedIn posts at 7:30 AM CT on publish days

Total: ~14 + 28 + 7 + 4 + 4 = **~57 scheduled posts** across 14 days

Use the Founder's account (or a platform service account) as the posting identity.

Status should be `scheduled` (not `draft`) so the cron picks them up.

---

## TASK 3: Wire Campaign Script into Battery Dashboard

Update TheBattery.tsx (or create a new campaign loader component) to:

1. Show "Opening Gambit Salvo" as a loadable campaign
2. Display all 57 posts grouped by stream with day indicators
3. Allow the Founder to ARM the campaign and FIRE with "As You Wish"
4. Show per-platform post counts and scheduling timeline

---

## TASK 4: Create Medium Article Drafts

**Files:** Create 3 new Medium article drafts in `BISHOP_DROPZONE/09_Articles/`:

1. `ARTICLE_MEDIUM_12_PATENTS_NO_VC.md` — "12 Patents, $5/Year Membership, and Why We Don't Take VC"
2. `ARTICLE_MEDIUM_83_PERCENT_PLATFORM.md` — "The 83.3% Platform: How Cost + 20% Changes Creator Economics"
3. `ARTICLE_MEDIUM_POLITICAL_EXPEDITION.md` — "Political Expedition: Power to the People Via Cooperative Technology"

Each article: 800-1,200 words. SEC-safe language. Current stats (2,224/12/202). Link to lianabanyan.com. Written in Founder's voice (veteran, father of eight, built with AI agents).

---

## Done-when Checklist

- [ ] scheduleOpeningGambitSalvo.ts created with 5 content streams
- [ ] Migration inserts ~57 scheduled posts across 14 days
- [ ] Posts staggered across X, LinkedIn, Bluesky, Threads, Medium
- [ ] TheBattery shows "Opening Gambit Salvo" as loadable campaign
- [ ] 3 Medium article drafts created with current stats
- [ ] Stream 3 posts reference academic/thought leader work (NOT cold pitches)
- [ ] All posts respect platform rate limits from dispatchGuardrails.ts
- [ ] No SEC-unsafe language in any post
- [ ] TypeScript compiles cleanly
- [ ] Build passes

---

*Prompt written by Bishop (Claude Opus 4.6), Session B087, April 7, 2026*
*Letters are the missiles. This is the air cover.*
