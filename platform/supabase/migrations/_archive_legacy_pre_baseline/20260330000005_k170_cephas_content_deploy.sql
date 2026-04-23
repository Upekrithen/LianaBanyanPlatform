-- K170: Cephas Day 0 Content Deploy
-- Inserts "6 Easy Steps" V2 business plan + 5 new Pudding articles
-- All content uses {{template}} variables for dynamic stats

-- ═══════════════════════════════════════════════════════════
-- 1. "How to Save the World in 6 Easy Steps" V2
-- ═══════════════════════════════════════════════════════════

INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, source_path, style,
  content_markdown, technical_summary, implementation_status,
  bishop_session, knight_session, innovation_ids
) VALUES (
  'six-easy-steps',
  'How to Save the World in 6 Easy Steps',
  'business-plan',
  'progressive-disclosure',
  'BISHOP_DROPZONE/HOW_TO_SAVE_THE_WORLD_IN_6_EASY_STEPS_V2.md',
  'pudding',
  $md$# How to Save the World in 6 Easy Steps

## A Business Plan for {{entityName}}
## Version 2.0 — Progressive Disclosure Edition

---

*A little girl told her mother she wanted to be an astronaut.*

*Her mother, trying to be helpful, said: "Well, sweetheart, you'll need advanced college degrees. You'll need to serve in the military and get piloting hours. And you'll need three years of experience leading others."*

*The girl looked at her mom and shrugged.*

*"No problem! That's just, like, three things."*

---

This is a business plan for saving the world. It has six steps. Each step is a self-contained economic engine that feeds the next. Each step starts with one person doing one thing in one place. Each step scales without permission, without venture capital, and without anyone's approval but the people doing the work.

If you're looking for a pitch deck, this isn't one. If you're looking for a fundraising ask, there's exactly one letter for that and it went to Warren Buffett. If you're looking for the catch — the hidden fee, the equity trap, the extraction mechanism buried in the fine print — you won't find one. We engineered it out.

What you'll find instead is a cooperative commerce platform with {{innovationCount}} documented innovations, {{patentApplications}} patent applications protecting more than {{patentClaims}} formal claims, {{productionSystems}} live production systems, {{charitableInitiatives}} charitable initiatives funded by commerce (not donations), and a three-currency economic system with mathematical solvency proofs.

Built by one veteran, four AI agents, and nine years of obsession.

That's just, like, six things.

---

### HOW TO READ THIS DOCUMENT

This business plan has three levels. Read as deep as you want.

**Level 1** is the story. You'll understand what we built and why it matters.

**▸ Level 2** is the machinery. You'll see the specific innovations by category — production systems, features, architecture — with their patent numbers. This is HOW it works.

**▸▸ Level 3** is the reasoning. You'll understand WHY each mechanism is designed the way it is — what alternatives were rejected, what the patent protects, and what makes it novel.

Every innovation is numbered. Every number maps to a formal Acknowledgment & Assignment in our records. Every claim is verifiable.

---

## THE ECONOMICS (Before We Start)

Every step runs on the same engine:

**{{platformMargin}}.** That's the platform margin. Not "up to" — exactly. Locked in the operating agreement. No board vote, no investor pressure, no quarterly earnings call can change it. Creators keep **{{creatorRetention}}** of every transaction. The platform takes what it needs to operate. The rest funds {{charitableInitiatives}} charitable initiatives automatically.

**Three currencies:** Credits ($1 = 1 Credit, one-way valve, never cash out to fiat), Marks (effort-differential — what you DID matters, not just what you paid), Joules (surplus stored value, like forever stamps). All equal value. All at permanent parity.

**{{membershipCost}} membership.** That's the stake. That's all you can lose. Start a business, join an initiative, access the cooperative. Five dollars a year for life if you sign up before launch.

**500 members = break-even. 1,000 = profitable.** In any locale. The math works because the margin is fixed, the costs are known, and the demand is validated before production begins.

> **▸ THE THREE GEARS — How the Currency System Works**
>
> | Gear | Currency | How Acquired | What It Does | Legal Classification |
> |------|----------|-------------|-------------|---------------------|
> | **Gear 1** | Credits | Purchase ($1 = 1 Credit) | Spend on platform | Prepaid value — like a gift card |
> | **Gear 2** | Marks | *Generated automatically* from Cost+20% margin differential | Measure contribution, earn governance weight | Transactional byproduct — NOT a security (#1936) |
> | **Gear 3** | Joules | Surplus Marks converted at member's discretion | Store value indefinitely ("forever stamps"), collateralize Backed Marks | Stored cooperative surplus |
>
> **Marks sub-types:**
> - **Earned Marks** — arise from the 6.7% differential on every transaction. You buy a meal, you get Marks. No labor required.
> - **Backed Marks** — Marks collateralized by Joules. Carry governance weight (voting power in the cooperative).
> - **Pledged Marks** — Marks escrowed for a specific project. Released when the project delivers.
> - **Shadow Marks** — Temporary Marks for Ghost (non-member) browsing. 90-day expiry with half-life decay.
>
> **The one-way valve:** Credits flow IN (cash → Credits). They never flow OUT (Credits → cash). Irrevocable. This isn't a policy — it's constitutional. The only path from Marks to cash is the Substitution channel: labor compensation settlement via the LB Card, which is a payroll event, not a currency conversion.
>
> > **▸▸ WHY THIS DESIGN**
> >
> > **Innovation #1936 — Margin Economics as Structural SEC Defense (Crown Jewel)**
> >
> > The three-gear system isn't just economics. It's a legal architecture. The Cost+20% pricing formula simultaneously sets retail prices AND generates Marks as a transactional byproduct. Under securities law (SEC v. Howey), a security requires "investment of money." When a member buys a $12 meal and receives Marks from the $2 margin, they invested nothing in the Marks — they bought a meal. The Marks are a mechanical consequence of the pricing formula.
> >
> > This defeats the Howey test at the threshold prong. No investment = no security. Period.
> >
> > **What was rejected:** Earlier designs (V2) characterized Marks as labor compensation. That works (Teamsters v. Daniel, 1979) but requires careful structuring. Margin Economics is categorically stronger — it moves from "Marks are compensation, not investment" (yellow zone) to "Marks aren't even labor-related — they're retail byproducts" (green zone).
> >
> > **What the patent protects:** A cooperative pricing formula that simultaneously sets prices, generates non-security work-credits, and structurally defeats securities classification — all from a single architectural rule.
> >
> > **The constitutional lock:** Cost+20% requires supermajority member-assembly approval to change. No board, no investor, no governance action can transform the margin into a securities mechanism. This is extraction-proof by design.

Now. Six steps.

---

## STEP 1: FEED PEOPLE

**Cold Start Pathway: Food**
**Initiatives: Let's Make Dinner, Let's Get Groceries, Family Table Cookbook**
**Crown Seats: Maneet Chauhan (Grand Chef), José Andrés (Provisioner), Samin Nosrat (Family Table)**

A restaurant owner in San Antonio lists her menu on the platform. A neighbor photographs the food. A delivery driver brings breakfast tacos to the office park down the road. The cook keeps {{creatorRetention}}. The photographer earns Marks. The driver accumulates toward vehicle ownership through the Earn-Down program. The office worker gets fresh food at her desk.

Nobody was rescued. Everybody benefited.

**Let's Make Dinner** is neighbors feeding neighbors. Not a charity — a cooperative meal coordination system where families sign up to cook for each other on rotating schedules. The Family Table connects through the cookbook system — shared recipes become shared meals become shared community.

**Let's Get Groceries** is cooperative purchasing. When 12 families buy flour together, they pay wholesale. The cooperative negotiates volume discounts and passes the savings through at {{platformMargin}}. Robinson-Patman compliance is handled through cost-justification (cooperative buying groups have recognized safe harbors).

**Why this is Step 1:** Food is the universal need. Everyone eats. The restaurant is the first domino. When La Capital del Sabor signs up as the first partner, the first real dollar flows through the Commerce Engine, and everything else becomes possible.

**The math:** A single restaurant doing $2,000/week through the platform generates $1,666.67 for the cook and $333.33 for the cooperative. At 10 restaurants, the local food node is self-sustaining.

> **▸ STEP 1 MACHINERY — Innovations by Category**
>
> **Production Systems:**
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #1980 | Family Table | Connects families through shared meal planning, cookbook access, scheduled orders. |
> | #1982 | Scheduled Meals | Rotating meal coordination — families sign up to cook for each other on configurable schedules. |
> | #1979 | Tiered Commitment Architecture | The negotiation framework for onboarding restaurants. C+20 → C+40 → C+60 → C+90. |
>
> **Features:**
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #1981 | Advance Payment Protocol | Pre-payment mechanism where customers fund meals before cooking begins. |
> | #1983 | Driver Funnel | Progressive driver onboarding: personal vehicle → cooperative fleet → Earn-Down to ownership. |
> | #1984 | Family Table Cookbook | Shared recipe database with costing sheets, technique videos, dietary adaptations. |
>
> **Architecture:**
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #1972 | Universal Business Onboarding (Crown Jewel) | One onboarding flow serves ALL business types — configuration, not code. |

---

## STEP 2: MAKE THINGS

**Cold Start Pathway: Manufacturing**
**Initiatives: Let's Make Bread (Industry), HexIsle, Decentralized Factory**
**Crown Seats: Dale Dougherty (Industry Chancellor), Harry Moser (Reshoring)**

A maker in her garage has a 3D printer, a bench, and an idea. She lists her products on the platform. Orders come through the Treasure Map. She doesn't need a factory. She doesn't need a loan. She needs 50 pre-orders at {{platformMargin}} to hit the crossover point.

**The Canister System** is the hardware. A desktop injection molder with swappable canisters — change materials in seconds, not minutes. At 5,207 PSI with an 8-inch handle, no commercial product uses a swappable canister as the injection barrel.

**The Factory Node** is the scaling mechanism. Start with one printer. Add the Canister System for production runs. The node is cooperative-owned — the maker who runs it owns it.

> **▸ STEP 2 MACHINERY**
>
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #1939 | Decentralized Factory Node | Cooperative-owned micro-manufacturing cell. |
> | #2022 | Canister Modular Injection System | Swappable barrel-as-canister architecture. Crown Jewel. |
> | #1940 | HexIsle OpenLOCK Adapter | Standardized terrain tile connector. |
> | #1941 | Capstone Project System | Structured first funded production run. |
> | #1943 | Tiered Production Cascade | 3D print → small batch → injection mold → full production. |

---

## STEP 3: SERVE EACH OTHER

**Cold Start Pathway: Service**
**Initiatives: Rally Group, Defense Klaus, LifeLine Medications, Housing, Political Expedition**

A wildfire hits a neighborhood. Before FEMA arrives, the Rally Group has already dispatched a Crew Call — local members with trucks, chainsaws, and first aid kits are on-site in hours. They earn Marks for their contribution. The community doesn't wait for someone else to save them. They save each other.

**Defense Klaus** is personal safety AND legal defense. **LifeLine Medications** is prescription access at cost plus 20%. **Housing** is cooperative listings with the Roommate Accountability System. **Political Expedition** is nonpartisan civic transparency.

> **▸ STEP 3 MACHINERY**
>
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #1927-#1929 | Cooperative Housing System | Listings at {{platformMargin}}. No algorithmic price gouging. |
> | #1993-#1994 | Sipping Tea Protocol | Slow-motion dispute resolution. Circle process structure. |
> | #1938 | Destination Network | Service routing — finds the nearest qualified provider. |

---

## STEP 4: BUILD BUSINESSES

**Cold Start Pathway: Local Business**
**System: $5 Incubator → Cue Card → Treasure Map → Captain → Business**

Anyone can try any venture for $5. A new member browses the 8 Treasure Maps — each one a different business category with demand signals on the front and a mini business plan on the back. The Cold Start Hub walks her through registration, first Cue Card, first customers. The Captain System kicks in at 20 orders.

> **▸ STEP 4 MACHINERY**
>
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #1945 | Cue Card Campaign System | Pre-built campaign templates by craft type. |
> | #1946 | Treasure Map Business Plans | Interactive business plan templates with milestone markers. |
> | #1975 | Walking Billboard Signal (Crown Jewel) | Every LB Card swipe generates a passive demand signal. |
> | #1976 | Captain's Apprentice Program | Shadow → Co-Lead → Solo mentorship. |
> | #1978 | Merchant-Initiated Reverse Funnel | Business owners notice LB Card transactions. |

---

## STEP 5: ORGANIZE

**Cold Start Pathway: Guild**

A Guild is a professional group. Plumbers, designers, delivery drivers, teachers. MANY Guilds per member. Solo workers get crushed. A Guild of 200 designers negotiates as a bloc.

> **▸ STEP 5 MACHINERY**
>
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #2015 | Guild Formation | Define → Banner → Recruit → Fund → Contest. |
> | #2016 | Guild Treasury | Collective Marks pool with spending thresholds. |
> | #2011 | Community-Governed Visual Design (Crown Jewel) | CSS Zen Garden model for cooperative identity. |

---

## STEP 6: BELONG

**Cold Start Pathway: Tribe**

A Tribe is a personal group. Your neighborhood. Your church community. Your running club. MANY Tribes per member.

Guilds are professional — what you DO. Tribes are personal — who you ARE.

> **▸ STEP 6 MACHINERY**
>
> | # | Innovation | What It Does |
> |---|-----------|-------------|
> | #2020 | Tribe Formation | The sixth and final pathway. |
> | #2019 | Tribe Mirror | Aggregated, non-identifying community data. |

---

## THE ENGINE UNDERNEATH

All six steps run on the same infrastructure:

| System | What It Does | Status |
|--------|-------------|--------|
| Commerce Engine | Scan→order→pay→distribute at {{platformMargin}} | LIVE |
| Star Chamber | 4-AI consensus verification | LIVE |
| MoneyPenny (#2021) | 4-tier AI receptionist | LIVE |
| Helm | Member's personal space | LIVE |
| Red Carpet (#1948) | Personalized VIP walkthrough | LIVE |
| Ghost World | Risk-free browsing with Shadow Marks | LIVE |
| Treasure Maps (#1946) | 8 business category guides | LIVE |
| ADAPT Score (#1937) | 6-dimension system health measurement | LIVE |

**Total: {{productionSystems}} production systems deployed. Zero down.**

---

## THE PROTECTION

**{{patentApplications}} provisional patent applications. More than {{patentClaims}} formal claims.** Filed by the Founder as a micro-entity. The filing protects cooperative infrastructure from extraction.

**{{crownJewels}} Crown Jewels** across the portfolio. 8 innovations with zero prior art found after extensive searches. The Canister System's swappable-barrel architecture has no commercial equivalent. The three-currency system has mathematical solvency proofs. The {{platformMargin}} margin lock is constitutionally embedded.

---

## THE PEOPLE

**96 letters are ready to send.** 28 Crown Letters offering leadership seats. All waiting for the site to work — the Dirty Dozen acceptance criteria must all be GREEN before Wave 1 fires.

**Current Dirty Dozen: {{dirtyDozenGreen}} of {{dirtyDozenTotal}} GREEN.**

---

## THE POINT

A little girl wanted to be an astronaut. Her mother listed everything it would take. Years of work. Enormous sacrifice. A path that most people would look at and say: impossible.

The girl looked at the list and saw three things.

Liana Banyan is the same list. Feed people. Make things. Serve each other. Build businesses. Organize. Belong.

That's just, like, six things.

The platform is built. The door is open. The kitchen is ready.

---

*Jonathan Jones*
*{{founderTitle}}, {{entityName}}*
*U.S. Army National Guard veteran of no particular note*
*Father of eight. Builder of cooperative infrastructure.*

*Help each other help ourselves.*

**FOR THE KEEP.**
$md$,
  'The 3-level progressive disclosure business plan for Liana Banyan Corporation. Level 1: story. Level 2: machinery (innovations by category). Level 3: reasoning (why each design). Six steps from food to belonging.',
  'live',
  'B048',
  'K170',
  ARRAY['1936','1937','1939','1940','1941','1943','1945','1946','1948','1972','1975','1976','1978','1979','1980','1981','1982','1983','1984','1993','1994','2007','2011','2015','2016','2019','2020','2021','2022']
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  knight_session = EXCLUDED.knight_session,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

-- Also insert alias slug that redirects
INSERT INTO cephas_content_registry (
  slug, title, category, source_path, style, content_markdown,
  technical_summary, implementation_status, bishop_session, knight_session
) VALUES (
  'business-plan',
  'How to Save the World in 6 Easy Steps',
  'business-plan',
  'alias:six-easy-steps',
  'pudding',
  'See [the full business plan](/cephas/business-plan/six-easy-steps).',
  'Alias entry — redirects to six-easy-steps.',
  'live', 'B048', 'K170'
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════
-- 2. Pudding Article #18: Zero Storage, Full Income
-- ═══════════════════════════════════════════════════════════

INSERT INTO cephas_content_registry (
  slug, title, category, source_path, style,
  content_markdown, technical_summary, implementation_status,
  bishop_session, knight_session, innovation_ids
) VALUES (
  'pudding/zero-storage-full-income',
  'Zero Storage, Full Income: The Content Economy That Costs Nothing to Run',
  'article',
  'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_18_ZERO_STORAGE_FULL_INCOME.md',
  'pudding',
  $md$What if a platform could host 10 million photos and pay $1.25 a month for storage?

Not a hypothetical. That's the math.

A typical photo is 3-5 megabytes. Ten million of them is 40 terabytes. On AWS S3 with CloudFront delivery, that's $30,000-$50,000 a year in hosting costs alone — before bandwidth, before backups, before redundancy. That's why content platforms need venture capital. That's why they take 30-63% of every transaction. The infrastructure bill has to be paid, and the creator pays it.

Liana Banyan stores photos differently. We don't store them at all.

## The Insight

When a Bounty Photographer takes a picture of a local business and posts it to Instagram, the photo lives on Instagram. When a Pearl Diver logs a deal and shares it on TikTok, the video lives on TikTok. When a Home Teacher records a lesson and puts it on YouTube, the recording lives on YouTube.

The content already has a home. The creator already chose where to put it. The platform doesn't need to duplicate it.

What the platform DOES need to store:

| Data | Size | Purpose |
|------|------|---------|
| The social media URL | ~200 bytes | Where the content lives |
| Business name + location | ~500 bytes | What it documents |
| Creator attribution | ~50 bytes | Who made it |
| Mark allocation record | ~100 bytes | What they earned |
| **Total per item** | **~850 bytes** | |

At 10 million items: approximately 8.5 gigabytes of metadata. On a standard database plan, that's $1.25 a month.

The content platform that costs $50,000 a year to run? Ours costs $15.

## How It Works in Practice

A member named Diana walks past a taco truck on Bandera Road in San Antonio. She takes three photos — the truck, the menu board, the line of customers at 7 AM. She posts them to her Instagram. Then she opens the LB app, taps "Claim Photo Bounty," pastes the Instagram URL, tags the business name and location.

The platform stores 850 bytes. Diana earns 6 Marks (2 per photo). The taco truck now has visual documentation in the cooperative's business intelligence system.

Diana never uploaded a file to LB. LB never hosted a pixel. Instagram did what Instagram does — stored and served the image. LB did what LB does — tracked who created what, where it lives, and what it's worth.

## Why Creators Keep Their Content

On traditional platforms, uploading content means giving up control. YouTube owns the delivery. Shutterstock owns the license. Udemy owns the relationship with the student.

In the zero-storage model, creators keep everything:
- **Their social media presence** — followers see the content on the creator's feed
- **Their audience** — the creator's followers, not the platform's
- **Their content** — stored on their account, their terms of service
- **Their Marks** — earned through the cooperative for the attribution

The platform is a registrar, not a landlord. It tracks WHO created WHAT, WHERE it lives, and HOW it connects to the cooperative economy. The content stays with the creator. The value flows to the creator. The platform takes its fixed {{platformMargin}} and nothing more.

## The Economics at Scale

| Scale | Content Items | Metadata Storage | Monthly Cost | Equivalent Traditional Hosting |
|-------|-------------|-----------------|-------------|-------------------------------|
| Startup (1K members) | 10,000 | ~8.5 MB | ~$0.01 | ~$50/month |
| Growth (10K members) | 100,000 | ~85 MB | ~$0.10 | ~$500/month |
| Scale (100K members) | 1,000,000 | ~850 MB | ~$1.25 | ~$5,000/month |
| National (1M members) | 10,000,000 | ~8.5 GB | ~$12.50 | ~$50,000/month |

The cost advantage is not 10x or even 100x. It's closer to **4,000x** at scale.

## Beyond Photos

The zero-storage pattern applies to every content type:

- **Photography** (#2100) — business photos on Instagram, TikTok, Facebook
- **Deal intelligence** (#2101) — deal tips on the Resource Board, influencer posts on social media
- **Teaching** (#2103) — lessons delivered via Zoom, recordings on YouTube if the teacher chooses
- **Recipes** — cooking demonstrations on TikTok, recipes in the Family Table Cookbook
- **Reviews** — product reviews on Reddit or YouTube

Every one stores ~850 bytes of metadata on LB. The cooperative economy runs on attribution, not on servers.

## The Platform as Registrar

Traditional platforms are **landlords** — they own the building, they set the rent, they can evict you.

Liana Banyan is a **registrar** — it records who owns what, who contributed what, and who earned what. The "building" is the entire internet. The "rent" is {{platformMargin}}. And you can't be evicted because you never moved in.

The registrar model is what makes {{creatorRetention}} creator retention possible. When you don't have a $50,000/month hosting bill, you don't need to extract $50,000/month from creators.

## What This Means

A cooperative that costs almost nothing to run can afford to give almost everything back to its members. That's not idealism. That's architecture.

{{innovationCount}} innovations. {{productionSystems}} production systems. {{crownJewels}} Crown Jewels. And the content layer that holds it all together costs $15 a month.

Zero storage. Full income. That's the deal.
$md$,
  'How LB achieves near-zero infrastructure costs through a metadata-only content architecture. Content lives on creators'' existing social media; the platform stores ~850 bytes per item.',
  'live', 'B048', 'K170',
  ARRAY['2100','2101','2103']
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════
-- 3. Pudding Article #19: Pearl Diver
-- ═══════════════════════════════════════════════════════════

INSERT INTO cephas_content_registry (
  slug, title, category, source_path, style,
  content_markdown, technical_summary, implementation_status,
  bishop_session, knight_session, innovation_ids
) VALUES (
  'pudding/pearl-diver-neighborhood-intelligence',
  'Pearl Diver: Your Neighborhood Knows More Than Google',
  'article',
  'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_19_PEARL_DIVER.md',
  'pudding',
  $md$Google can tell you a store's hours. It can tell you its rating. It can show you a Street View image from 2019.

It cannot tell you that the veteran's discount stacks on top of Tuesday's 50% off. It cannot tell you the best inventory arrives Monday afternoon. It cannot tell you that the cashier at register 3 applies the discount without asking, but the one at register 7 makes you show your VA card twice.

That knowledge exists. It just lives in someone's head — someone who shops there every week, who knows the rhythms of the clearance rack. That person is a Pearl Diver. And their knowledge is worth something.

## What a Pearl Diver Does

A Pearl Diver discovers deals, discounts, and purchasing intelligence in the physical world — the kind of information that no app, no algorithm, and no web scraper can find — and logs it to the cooperative's Resource Board for other members to use.

Two tracks, same system:

**The Quiet Pearl** logs deals on the Resource Board. No social media required. No audience needed. Just tips.

**The Pearl Influencer** does everything the Quiet Pearl does, plus posts finds to social media — haul videos on TikTok, deal grids on Instagram, flash alerts on X. Builds a following. Earns additional Marks.

Both tracks earn. The influencer track earns more. But the quiet track is always there for the person who just wants to help their neighbors save money.

## Why This Matters

Couponing apps — Honey, RetailMeNot, Rakuten, Ibotta — track ONLINE codes. Digital discounts. Cashback on e-commerce.

They do not track:
- Which physical store has 50% off on which day of the week
- Whether military, veteran, senior, or teacher discounts stack on top of sales
- What time clearance labels get applied (and which aisle first)
- Which locations of a chain carry products that other locations don't
- When seasonal clearance actually starts (not when the ad says — when it REALLY starts)

This is human intelligence. It requires feet in the aisles, eyes on the shelves, and the social knowledge that comes from shopping at the same store every week for years.

## The Economics

A single Pearl Diver who logs 15 verified tips per week earns 120-250 Marks per month from the Resource Board alone. Add subscriptions — other members paying to get your deal alerts early — and it becomes real income.

When 50 Pearl Divers in a city are logging deals daily, every member of the cooperative has access to a living map of the best prices in town. Updated in real time. Verified by other shoppers.

One Pearl Diver's tip about flour on clearance at HEB triggers a cooperative bulk buy. Twelve families buy together. They each save $6. The Pearl Diver earns 22 Marks. Someone who shops at HEB every Wednesday morning shared what they saw, and the cooperative turned that knowledge into savings for everyone.

## Subscriptions

Pearl Divers who build a reputation can offer subscriptions. Members pay in Marks, Credits, Joules, or dollars — their choice — for early alerts, personalized filtering, weekly digests, and flash notifications.

A Pearl Diver with 100 subscribers at 10 per month earns 833 per month from subscriptions alone — on top of Resource Board Marks and cooperative purchasing bonuses.

The quiet version works too. A Pearl Diver who never posts on social media and just logs 5 tips a week still earns Marks and still helps hundreds of families save money.

## Who Does This

Everyone who shops does this already. They just don't get paid for it. The person who texts their friend "Kohl's has shoes for $34 on Wednesdays — don't pay $89" is already a Pearl Diver. The parent who knows every back-to-school sale schedule is a Pearl Diver. The veteran who has memorized which stores stack their 20% is a Pearl Diver.

The cooperative just makes it count.
$md$,
  'Physical-world deal intelligence that no app can replicate. Pearl Divers earn Marks by logging discount schedules, stacking combinations, and clearance timing to the cooperative Resource Board.',
  'live', 'B048', 'K170',
  ARRAY['2101']
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════
-- 4. Pudding Article #20: The $5 Classroom
-- ═══════════════════════════════════════════════════════════

INSERT INTO cephas_content_registry (
  slug, title, category, source_path, style,
  content_markdown, technical_summary, implementation_status,
  bishop_session, knight_session, innovation_ids
) VALUES (
  'pudding/five-dollar-classroom',
  'The $5 Classroom: What Happens When Teachers Keep {{creatorRetention}}',
  'article',
  'BISHOP_DROPZONE/PUDDING_FULL/PUDDING_20_FIVE_DOLLAR_CLASSROOM.md',
  'pudding',
  $md$Udemy takes 63 cents of every dollar a teacher earns.

Read that again. A teacher creates a course, records the lectures, writes the quizzes, answers student questions, updates the material — and Udemy keeps sixty-three percent. On a $100 course, the teacher gets $37.

Preply takes 33%. Coursera varies but gatekeeps through institutions. iTalki takes about 15% but only supports one-on-one sessions.

Liana Banyan takes 16.7%. Fixed. Constitutional. Unchangeable.

On that same $100: the teacher keeps $83.30. That's $46.30 more per transaction. Over a year of teaching, that difference is the gap between a hobby and a career.

## The Cooperative Classroom

Any qualified member can teach from home. A living room, a Zoom account, and a {{membershipCost}} annual membership. That's the classroom.

Two revenue streams run simultaneously:

**Subscription group classes** — students subscribe monthly for recurring weekly sessions. A Spanish teacher runs Tuesday and Thursday evenings, 15 students max.

**Individual tutoring** — students book one-on-one sessions from the teacher's available time slots. Payment at booking, Zoom link auto-generated.

The platform handles scheduling, billing, reminders, student management, and discovery. The teacher handles teaching. Zoom handles the video. Nobody hosts video files.

## The Math

A Spanish teacher with a degree, teaching from her living room:

Three group classes per week. 25 students total across the three. Plus 8 individual tutoring sessions per week.

Group classes: 25 students at 25 per month = 625. Teacher keeps 520.63.

Individual sessions: 8 per week at 25 each, times 4 weeks = 800. Teacher keeps 666.40.

**Total: $1,187 per month. Teaching 11 hours per week. From the couch.**

Scale it to 20 hours per week and it crosses $2,400 per month. That's a full-time income in most American cities.

## Why Zoom, Not Our Own Video

The same architecture that makes zero-storage photography work makes zero-cost teaching possible. The platform doesn't host video. Zoom does. The platform's cost to facilitate a 1-hour lesson: effectively zero. That's why the margin stays at {{platformMargin}}. That's why the teacher keeps {{creatorRetention}}.

## Payment in Any Currency

Students pay however they want:

**Marks** — earned through contribution. A Bounty Photographer who earns Marks by documenting businesses can spend those Marks on a Spanish class. No real money changes hands.

**Credits** — purchased with dollars. $1 = 1 Credit. Simple.

**Joules** — stored surplus from long-time participation.

**Dollars** — Stripe recurring billing for those who prefer it.

The teacher doesn't care which currency arrives. All are at permanent parity.

## The Comparison

| | Udemy | Preply | iTalki | **LB Cooperative** |
|---|---|---|---|---|
| Teacher keeps | 37% | 67% | ~85% | **{{creatorRetention}}** |
| Group classes | No | No | No | **Yes** |
| 1-on-1 tutoring | No | Yes | Yes | **Yes** |
| Subscriptions | No | No | No | **Yes** |
| Multi-currency | No | No | No | **Yes** |
| Video hosting cost | Platform pays | Platform pays | Platform pays | **Zero (Zoom)** |
| Can raise take rate | Yes | Yes | Yes | **No. Constitutional.** |

The last row is what matters most. Every platform in this table CAN raise its take rate tomorrow. LB's margin is locked in the cooperative charter. No board. No investor. No quarterly earnings call can touch it.

## The Pioneer Reward

The first 10 Home Teachers receive Founders' Circle pioneer rewards — 50 bonus Marks per month for 12 months, plus a physical Pioneer Medallion, in exchange for letting their real success story be published as a case study.

Their stories become the proof that recruits the next 990.
$md$,
  'Cooperative online teaching at {{platformMargin}} margin. Teachers keep {{creatorRetention}} using Zoom-as-infrastructure for zero hosting costs. Compares take rates across Udemy, Preply, iTalki.',
  'live', 'B048', 'K170',
  ARRAY['2103','2104']
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════
-- 5. Pudding Article #21: Why the First 10 Matter
-- ═══════════════════════════════════════════════════════════

INSERT INTO cephas_content_registry (
  slug, title, category, source_path, style,
  content_markdown, technical_summary, implementation_status,
  bishop_session, knight_session, innovation_ids
) VALUES (
  'pudding/why-the-first-ten-matter',
  'Why the First 10 Matter: How Pioneers Prove a Career Exists',
  'article',
  'BISHOP_DROPZONE/PUDDING_ARTICLES_2100_2104_OUTLINES.md',
  'pudding',
  $md$Nobody will try a job that doesn't exist yet.

That's the cold-start problem for every new economic role. Pearl Diver. Bounty Photographer. Home Teacher. Captain. Every one of these roles is real, documented, and built into the platform's infrastructure. None of them have a track record yet. And without a track record, the next person won't try it.

So how do you prove a career exists? You pay the first 10 people to try it — and publish what happens.

## The Pioneer Program

The Pioneer Program solves the cold-start problem by incentivizing the first adopters with diminishing rewards in exchange for being showcased as case studies. Their real stories — real names, real photos, real income numbers — become the proof that recruits everyone who comes after.

**The reward structure:**

| Pioneer # | Monthly Bonus (Marks) | Duration | Total Bonus |
|-----------|----------------------|----------|-------------|
| 1-3 | 50 Marks/month | 12 months | 600 Marks |
| 4-6 | 35 Marks/month | 12 months | 420 Marks |
| 7-10 | 20 Marks/month | 12 months | 240 Marks |
| 11+ | 0 (standard earnings) | — | — |

The rewards are generous for the first 10 because the first 10 carry the heaviest burden: proving something works when nobody believes it yet.

## The Flywheel

Here's what happens when the first 10 succeed:

Pioneer tries the role → succeeds → story published → 10 more try it → they succeed → their stories published → 100 more try it → statistical proof emerges → 1,000+ → role is proven → pioneers needed for NEXT role

Each new role starts the cycle again. Pearl Diver pioneers recruit Pearl Diver adopters. Bounty Photography pioneers recruit photographers. Home Teacher pioneers recruit teachers. The flywheel never stops because there's always a next role.

## Why Real Names Matter

Anonymous case studies convince nobody. "User #4827 earned $1,200 in their first month" sounds like marketing copy.

"Diana Reyes, Pearl Diver in San Antonio, logged 47 deal tips in her first month and earned $340 in Marks. She found a Tuesday flour deal at HEB that triggered a cooperative bulk buy for 12 families." — that's a story someone can see themselves in.

The Pioneer Program requires opt-in consent for public case studies. No one is showcased without agreeing. But the ones who agree become the foundation for everyone who follows.

## The Economics of Proof

You don't need a million-dollar marketing budget to launch a new type of work. You need 10 brave people and a system that turns their success into everyone else's confidence.

At 10 pioneers per role, with 8 active Cue Card roles on the platform, that's 80 pioneers total. 80 people carrying the weight of proof for thousands who will follow. The cost in bonus Marks is modest — the value in validated proof is enormous.

At 1,000 practitioners in any role, the statistics speak for themselves. Average income ranges are published. Success rates are known. The Cue Card sells itself.

The pioneers made that possible. They took the risk of being first.

## Why Diminishing Rewards

The first pioneer takes the biggest risk — no one has done this before. The tenth pioneer takes less risk — nine success stories already exist. The rewards match the risk.

After 10, the role is proven. No more bonus needed. Standard platform economics apply. The flywheel has enough momentum to sustain itself.

This is the TasteTester pattern applied to careers: generous early incentives that taper to zero as adoption proves viability. Works for ice cream samples. Works for career creation.
$md$,
  'How the Pioneer Program solves the cold-start problem for new economic roles through diminishing-reward incentives and real-name case studies.',
  'live', 'B048', 'K170',
  ARRAY['2104']
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════
-- 6. Pudding Article #22: Four Currencies, One Subscription
-- ═══════════════════════════════════════════════════════════

INSERT INTO cephas_content_registry (
  slug, title, category, source_path, style,
  content_markdown, technical_summary, implementation_status,
  bishop_session, knight_session, innovation_ids
) VALUES (
  'pudding/four-currencies-one-subscription',
  'Four Currencies, One Subscription: How Cooperative Money Actually Works',
  'article',
  'BISHOP_DROPZONE/PUDDING_ARTICLES_2100_2104_OUTLINES.md',
  'pudding',
  $md$What if you could subscribe to your favorite creator by paying with effort instead of cash?

Not a metaphor. On Liana Banyan, a member who earns Marks through photography can spend those Marks on a Spanish class subscription — without any real money changing hands. The cooperative's internal economy circulates value between members at zero payment processing cost.

## The Four Currencies

The Universal Member Subscription system accepts four currencies at permanent parity:

| Currency | How You Get It | What It Costs to Transfer |
|----------|---------------|--------------------------|
| **Marks** | Earned through contribution to the cooperative | Zero. Ledger entry. |
| **Credits** | Purchased with dollars ($1 = 1 Credit) | Zero. Already in the system. |
| **Joules** | Converted from surplus Marks | Zero. Internal conversion. |
| **Dollars** | Credit card via Stripe | 2.9% + $0.30 per transaction |

Three of the four currencies cost nothing to move. Only dollars carry a fee — and that fee goes to Stripe, not to the cooperative.

## Why This Changes Everything

Every subscription paid in Marks is value that stays INSIDE the cooperative. No Stripe fees. No payment processor taking 2.9% + $0.30. No bank in the middle. Two members exchanging value directly, mediated by a ledger entry that costs a fraction of a penny.

Consider a Spanish teacher with 25 students:

**If all 25 pay in dollars:** 25 × $25/month = $625. Stripe takes $18.63. Teacher gets 83.3% of $606.37 = $505.11.

**If 15 pay in Marks and 10 in dollars:** 10 × $25 = $250 via Stripe ($7.55 in fees). 15 × 25 = 375 via internal ledger ($0). Teacher gets 83.3% of $617.45 = $514.33.

That's $9.22 more per month — just from the payment mix. Scale it across thousands of creators and millions of transactions, and the savings compound into meaningful economic advantage.

## The Marks Economy Flywheel

As the Marks economy grows, the cooperative becomes increasingly independent of external financial infrastructure:

1. **Member A** earns Marks by photographing businesses (Bounty Photography)
2. **Member A** subscribes to Member B's Spanish class using Marks
3. **Member B** uses those Marks to subscribe to Member C's meal plan (Let's Make Dinner)
4. **Member C** uses those Marks to get deal alerts from Member D (Pearl Diver)
5. **Member D** uses those Marks for tutoring from Member A's daughter (Home Teacher)

The value circulated through five members. Zero dollars left the cooperative. Zero payment fees were charged. The only cost was five ledger entries — approximately $0.005 in database operations.

That's not a side effect — it's the design.

## How Subscriptions Work

A creator sets up their subscription in the Helm:

1. **Name the offering** — "Tuesday Spanish Beginner Class" or "Weekly Deal Digest"
2. **Set the price** — any amount in any currency (all at parity)
3. **Choose billing cycle** — weekly, monthly, or per-session
4. **Publish** — subscribers can join via the creator's Cue Card or directly from the Helm

Subscribers choose which currency to pay with each billing cycle. They can switch freely. A student might pay in dollars for three months while they're new, then switch to Marks once they've earned enough through their own contributions.

## The Creator Keeps {{creatorRetention}}

Regardless of which currency arrives, the creator keeps {{creatorRetention}} of every transaction. The cooperative takes its {{platformMargin}} margin — no more, no less.

On a $25 monthly subscription:
- Creator receives 20.83 (in whatever currency the subscriber used)
- Cooperative retains 4.17 (funds infrastructure + {{charitableInitiatives}} charitable initiatives)

The margin is the same whether the subscriber pays in Marks, Credits, Joules, or dollars. Constitutional. Unchangeable.

## What This Means for the Future

Every successful cooperative faces a question: what happens when the internal economy grows larger than the external one? When members are trading more value internally than they're bringing in from outside?

The four-currency subscription system answers that question. It means the cooperative gets stronger as it grows. Transaction costs drop. Creator retention effectively increases (because processing fees disappear). The cooperative's dependency on external payment infrastructure decreases.

Cooperative currency isn't theoretical. It's a subscription you pay for with the effort you already put in. And it makes the whole system cheaper to run.
$md$,
  'How LB''s Universal Member Subscription system accepts Marks, Credits, Joules, and Dollars at permanent parity — enabling zero-fee internal economic circulation.',
  'live', 'B048', 'K170',
  ARRAY['2102']
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════
-- 7. Update pudding_articles count
-- ═══════════════════════════════════════════════════════════

UPDATE platform_canonical SET value = 22, updated_at = now() WHERE key = 'pudding_articles';
