-- ============================================
-- B042 Content Backfill — Knight Session 156+
-- 7 articles + 4 system_design entries
-- Source: BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md
-- ============================================

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'cost-plus-twenty',
  'Cost + 20%: The Constitutional Floor',
  'article',
  'pudding',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_cost_plus_twenty$
## A&A: #1 (foundational), #1936 (Margin Economics as Structural SEC Defense — Crown Jewel)

Every transaction on Liana Banyan follows one rule: the price is what it costs to make, plus exactly 20%.

Not 19%. Not 21%. Not "whatever the market will bear." Twenty percent. Constitutional. Permanent.

### Why Cost+20%?

Most businesses set prices based on what you'll pay. If customers will swallow $50, charge $50. If competitors charge $30, undercut them at $29. If you can extract $100, charge $100.

That model creates a race — sometimes to the bottom on price, sometimes to the top on extraction. Either way, the worker gets squeezed.

Cost+20% eliminates the race. The price is the price.

### Where Your Dollar Goes

On a $12 meal where the cooperative cost is $10:

- **$10.00** → the person who made the meal (83.3% creator share)
- **$1.33** → platform operations — servers, support, development, cooperative infrastructure (13.3%)
- **$0.67** → Mark generation — the automatic byproduct of the pricing formula (6.7%)

That last part is the secret weapon.

### The Margin IS the Legal Defense

Innovation #1936 — the Founder's insight — recognized that Cost+20% is simultaneously a pricing mechanism AND a structural securities defense. The pricing model and the legal defense are the SAME architectural feature.

Marks don't get "earned" through labor. They don't get "purchased" as an investment. They arise automatically as a byproduct of a retail transaction — you buy a sandwich, and the pricing formula generates a Mark allocation as a mechanical consequence of the 20% margin. You paid $0 for the Mark. You performed $0 of labor for the Mark. You made $0 voluntary investment decision for the Mark.

This puts Marks in the GREEN category under securities law — transactional byproducts, like cashback rewards or airline miles from purchases. Not securities. Not even close.

The charter language crystallizes this:

> "Marks shall not be earned in exchange for labor, services, or hours worked by members, workers, or any person. Marks shall arise solely as an automatic byproduct of qualifying retail transactions at prices set above cooperative cost, according to the pricing formula set forth herein."

### The Constitutional Lock

Cost+20% is not a policy. It is a constitutional provision of the cooperative charter. The margin cannot increase above 20%. The margin cannot be redirected from Mark generation to profit distribution. The only way to change it requires a Senate supermajority constitutional amendment process.

Five locks make the margin tamper-proof:

1. The margin percentage is fixed (constitutional)
2. The allocation formula is fixed (charter-level)
3. The Mark generation is automatic (no human discretion)
4. Marks are non-transferable (no secondary market)
5. Credits cannot convert to cash (one-way valve — permanent, irrevocable)

### No Loss Leaders. No Predatory Pricing.

Cost+20% makes loss leaders structurally impossible. Every transaction must be profitable. Every transaction must fund the cooperative. There is no "elsewhere" to make up the difference.

Amazon can sell below cost for years, subsidized by AWS. Walmart can sell below cost, subsidized by financial services. Every "free" app with in-app purchases subsidizes features with data extraction.

In this cooperative, every transaction stands on its own. That protects small creators and service providers who can't afford to subsidize below-cost pricing to compete with platforms that can absorb losses indefinitely.

### 83.3% Creator Share

Compare this to other platforms where creators may receive 50-70% — sometimes less after fees, advertising costs, and platform taxes stack up. The 83.3% is not a promotional rate. Not a temporary offer. It is the permanent, constitutional share that flows to the person who did the work.

The 16.7% that stays with the platform funds 16 charitable initiatives, cooperative infrastructure, development, and community programs. No additional fees. No premium tiers. No upsells.

That's the constitutional floor. Every transaction. Every time. Cost plus twenty percent.
$b042_cost_plus_twenty$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'three-currency-system',
  'The Three-Currency System',
  'article',
  'pudding',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_three_currency_system$
## A&A: #1936 (Margin Economics), Patent Bag 54 (Three-Gear Currency Differential)
## VAULT SOURCE: THREE-CURRENCY-SYSTEM-SPECIFICATION.md, CURRENCY-GUIDE-CREDITS-MARKS-JOULES.md, ACADEMIC-PAPER-CURRENCY-DIFFERENTIAL.md

Liana Banyan runs on three currencies. Not one. Not two. Three. They work together like a differential in a car — allowing users from different economic situations to participate equally while the platform stays stable.

**Critical principle: All three currencies are EQUAL IN VALUE.**

1 Credit = 1 Mark = 1 Joule (in value). The difference is not value — it's how you acquire them and what you can spend them on.

### Credits — The Primary Currency

Credits are the main platform currency for all standard transactions.

**How you get them:** Buy with any fiat currency ($1 USD = 1 Credit at purchase), or earn through work on the platform.

**What they buy:** Everything. Membership, goods, services, project backing, voting, tips — universal.

**The rule:** Non-transferable for cash. Spend-only. Credits enter the platform and stay in the platform. The one-way valve is permanent and irrevocable. Only Liana Banyan issues Credits — no member can create or sell them.

### Marks — The Effort Currency

Marks are issued two ways: as effort-debt (the differential mechanism) and as rewards for participation.

**The effort-debt mechanism:** Bob lives in Greece where his currency is worth 0.8 relative to the baseline. When Bob wants 1 Credit, he pays the equivalent of $1.00 in local currency. His currency is only worth $0.80 to us. Bob receives: 1.0 Credit + 0.2 Marks debt. The 0.2 Marks represents the gap between what Bob paid and what it's worth externally. But Bob gets the full Credit value immediately — he's not penalized for his economy.

**Clearing Marks debt:** Platform participation chips away at the debt — completing work orders (10% of payment value), purchasing goods (5% of transaction), casting verified votes (0.01 Marks), receiving positive reviews (0.05 Marks), referring activated users (0.10 Marks).

**The Birthright Mechanic:** If Bob can't or won't clear his Marks debt, it becomes redeemable equity. Other members can purchase Bob's equity (paying Bob in Credits). Bob has one year to redeem (buy back) at original + 10%. After one year without redemption: permanent transfer. Philosophy: you can sell your birthright (like Esau). But you have ample time to redeem it.

**What Marks buy (RESTRICTED):**
- Essentials: food, medical supplies, housing, utilities — full use
- Tips: only as a percentage of a Credit transaction
- Hiring: with project plan + 50% Credit deposit or voucher
- NOT for: general marketplace items, project investments, membership fees

**What Marks are NOT:** Marks are never purchasable with money. Never convertible to cash. Never securities, equity, or investment instruments. Sponsorship Marks are ONE LEVEL ONLY — not MLM, never second-degree.

### Joules — The Forever Stamp

Joules are stored value issued when a user from a strong-currency economy purchases Credits.

Mary lives in Switzerland where her currency is worth 1.4. When Mary wants 1 Credit, she pays the equivalent of $1.00. Her currency is worth $1.40 to us. Mary receives: 1.0 Credit + 0.4 Joules.

The 0.4 Joules locks in today's exchange rate — like the Post Office's Forever Stamps. Buy at one rate, use forever. A year later when 1 Credit costs $1.50? Mary's 0.4 Joules still converts to 0.4 Credits. She preserved her purchasing power.

**Joule rules:** Never expire. Lock exchange rate at creation. Must convert to Credits before spending. Non-transferable. Owned by the cooperative, directed by members. Collateralize Backed Marks for governance weight.

### The Differential in Action

Both Bob and Mary get exactly 1 Credit worth of value. Mary's surplus (0.4) is stored as Joules. Bob's gap (0.2) is tracked as Marks to clear through participation. The platform economy stays stable regardless of external currency chaos.

**Without the differential:** Bob pays more (relative to his economy) than Mary. The platform systematically excludes weak-economy users.

**With the differential:** Everyone gets equal value. Economic differences are absorbed through Marks and Joules. Bob participates fully. Mary banks surplus for later.

Across all users: Total Marks debt = Total Joules stored. The surplus from strong-currency economies funds the deficit coverage for weak-currency economies. Nobody writes a check. Nobody donates. The mechanism does it automatically.

### "As You Wish"

Every platform transaction returns the confirmation: "As You Wish." A reference to The Princess Bride, where the phrase means "I love you" expressed through action. Every transaction is an act of participation, acknowledged as meaningful.

Three currencies. One cooperative. No extraction.
$b042_three_currency_system$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'cold-start-pathways',
  'Six Cold Start Pathways',
  'article',
  'pudding',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_cold_start_pathways$
## A&A: #2007 (Cold Start Hub — DEPLOYED K128), #2015-#2020 (Guild + Tribe as 5th/6th pathways)

Every platform has a chicken-and-egg problem. You need sellers to attract buyers, and buyers to attract sellers. Who comes first?

Liana Banyan solves this with six pathways — six ways to get started, each matching one of the platform's six production levels. Pick the one that fits where you are right now.

### The Six Pathways

**1. Food (orange)** — The most universal need. Everyone eats. A food pathway Captain starts with local restaurants, meal prep services, community kitchens, or farm-to-table delivery. The Family Table Cookbook system supports scheduled meals and advance orders. The Restaurant Onboarding Campaign (#1968) gives Captains a Pitch Packet with pre-committed customer counts.

**2. Manufacturing (slate)** — From desktop injection molding (the Canister System's S piston at ~5,207 PSI) to full production facilities. The Decentralized Factory model connects makers with equipment, materials, and demand. Four production levels: Kit → Bench → Shop → Factory. Equipment co-funding at the 1/3 model (you stake 1/3, platform matches 1/3, community funds 1/3).

**3. Service (blue)** — Graphic design, tutoring, photography, plumbing, accounting — any service someone provides and someone else needs. The bounty system matches providers with requesters. Quality builds through the ADAPT Score reputation system. Your work IS your resume.

**4. Local Business (emerald)** — Brick-and-mortar businesses that want cooperative pricing. The Captain's Pitch Packet (#1969) and Tiered Commitment Chart (C+20 through C+90) give local business Captains tools to onboard merchants. Community members nominate businesses they want to see accept the LB Card. When demand reaches threshold, the system auto-generates the pitch document with live demand data.

**5. Guild (purple)** — Professional guilds federate expertise. Designers, developers, writers, tradespeople — any professional group can form a Guild with its own treasury, visual identity stack, and benefit cascade. Guilds are the 5th Cold Start pathway because they aggregate professional demand. Guild Formation (#2015), Guild Treasury (#2016), Guild Visual Identity Stack (#2017), Guild Benefit Cascade (#2018).

**6. Tribe (gold)** — Personal communities. Families, friend groups, neighborhood associations, hobby groups. Tribes connect through the Tribe Mirror system (#2019) and link to Family Tables. Tribes are the 6th pathway because they aggregate personal demand. Six pathways = six production levels. Tribe Formation (#2020).

### All Paths Lead to Captain

The philosophical anchor: "All paths lead to Captain. Every Captain starts at 10."

The Cold Start Hub at /start/cold-start presents these six animated pathway cards. Each pathway is a multi-step Cue Card wizard that guides you from zero to Captain-ready, with specific steps tailored to that economic domain. The wizards connect to existing platform features — campaign nomination, pitch packets, side quests, ADAPT Score — at natural integration points.

The platform doesn't need millions of users to work. It needs clusters — small groups of people in the same area, using the same pathway, supporting each other. That's how cooperatives have always grown: locally, organically, one relationship at a time.

Six pathways. Six production levels. One cooperative.
$b042_cold_start_pathways$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'captain-system',
  'The Captain System',
  'article',
  'pudding',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_captain_system$
## A&A: #1963 (Meritocratic Captain System — Crown Jewel Candidate), #1964 (Delivery Oracle), #1965 (Red Carpet for Leadership), #1966 (Ship Medallion), #1975-#1978 (Captain Scaling), #1979-#1984 (Negotiation Architecture), #1985-#1988 (Calling Card System)

A Captain is not a manager. A Captain is not a boss. A Captain is someone who puts skin in the game.

### "What You Do in Little, You Do in Much"

This is the governing principle. No one starts at the top. Every Captain proves themselves at small scale before earning large-scale authority. The platform doesn't pick leaders — the platform REVEALS leaders through performance.

### The Moses Scaling Model

Captain of 10 → proves reliability. Captain of 50 → proves scaling ability. Captain of 100 → proves leadership. Captain of 1000 → governs a regional node.

At each level: more Marks staked (proportional to responsibility), higher ADAPT Score, access to larger operations and greater governance influence. Failure at any level reduces rank — consequences are real.

### The Staking Mechanism

A Captain stamps the Order Assignment Contract with their QR Brand. They CANNOT place the order unless they stake their OWN Joule-backed Marks equal to the total fiat value of operations managed. If delivery is confirmed by 1/3 of recipients (the Delivery Oracle, #1964) → Marks returned + reputation boost. If delivery fails → Marks slashed + reputation penalty.

Why 1/3? Too low (10%) and a Captain could fake delivery with accomplices. Too high (66%+) and lazy users hold the Captain's Marks hostage. One-third is high enough to prevent fraud, low enough that non-responsive users don't block legitimate operations.

### No One Gets Picked Last

Traditional organizations select leaders through interviews, elections, or appointments — creating gatekeepers. This system has NO gatekeepers:

1. Anyone with $5 membership can become a Captain
2. The only requirement is staking your own Marks
3. You start small — no one trusts you with 1000 orders on day one
4. Success is measured by the system, not by humans
5. Multiple Captains can operate in the same area — competition improves service
6. There is no "Captain limit" — 50 people in Austin want to be Captains? All 50 can start.

### The Tiered Commitment Chart

Captains approaching local businesses use the Tiered Commitment Chart as a negotiation tool. Tiers run from C+20 (Cost+20%, the baseline platform margin) up to C+90 (Cost+90%, maximum personal commitment). The extra margin above C+20 comes from the Captain's own resources — it funds faster onboarding, better incentives for early businesses, and stronger local network effects.

Instead of saying "join our platform," the Captain says "here's what I'm personally committing to make this work for you." The chart is printable, visual, and shows exactly what the Captain is putting up.

### The Captain's Toolkit

- **Captain's Dashboard** (War Room, K129) — real-time view of their network's activity
- **Captain's Pitch Packet** (#1969) — auto-generated one-pager with live demand data, QR code to merchant's demand page
- **Captain's Calling Card** (#1985, Crown Jewel Candidate) — personalized QR routing via Durin's Door
- **Ship Medallion** (#1966) — the Captain's credential and onboarding totem. Features the inscription: "A ship in harbor is safe, but that is not what ships are BUILT for." The meta-loop: a new Captain's first order is to produce Ship Medallions through their own Factory Node — the act of producing the credential IS the proof the system works.
- **Walking Billboard Signal** (#1975, Crown Jewel Candidate) — visible recognition of Captain status
- **Captain's Apprentice Program** (#1976) — ability to train and delegate
- **Geographic Corridor Campaign** (#1977) — exclusive territory for their pathway

Skin in the game. Performance-based authority. No gatekeepers. That's the Captain System.
$b042_captain_system$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'moneypenny-gatekeeper',
  'MoneyPenny: AI Gatekeeper',
  'article',
  'pudding',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_moneypenny_gatekeeper$
## A&A: #2021 (MoneyPenny Gatekeeper — HIGH patent relevance)

MoneyPenny is the front door. Not a chatbot. Not a help desk. A gatekeeper — and a good one.

### The Problem

Every growing organization faces the same problem: inbound communication overwhelms the people who need to focus on building. Spam, tire-kickers, well-meaning but poorly-timed inquiries, people who want to "pick your brain" — they all compete for the same finite resource: attention.

The Founder needed a solution that could screen, route, and prioritize inbound contacts without being rude, without missing legitimate opportunities, and without consuming his time on contacts that aren't ready for a conversation.

### The Four Tiers

**Tier 1 — Known Contacts:** Passes immediately to the Founder via SMS notification. No delay. No screening. Known people get through instantly.

**Tier 2 — Recognized Public Figures:** MoneyPenny identifies the sender against a known-figures database — investors, press, industry leaders, Crown Letter recipients. Routes with PRIORITY tag and context briefing. The Founder sees who they are and why they matter before opening the message.

**Tier 3 — Unknown but Relevant:** Analyzes message content. Scores on relevance — cooperative commerce, business potential, partnership, press, member issue. Routes with context + score. This is where MoneyPenny earns its keep: a cold email from a regional food co-op looking to integrate scores differently than a cold email trying to sell SEO services.

**Tier 4 — Spam:** Silently logged but not forwarded. Periodic summary provided. No response. No acknowledgment. Gone.

### Founder Controls

Whitelist, blacklist, priority keywords, quiet hours. The Founder decides who gets through and under what conditions. MoneyPenny executes.

### Integration Points

MoneyPenny connects to MoneyPenny SMS (deployed), MoneyPenny Inbox (existing), Daily Digest (existing), MoneyPenny Signal (existing), and the Crown Letters recognition system. When a Crown Letter recipient finally responds six months later, MoneyPenny knows who they are immediately — Tier 2, priority escalation, context from the original letter included.

### Why "MoneyPenny"

Because every great leader needs someone at the front desk who knows exactly who should get through and who shouldn't. MoneyPenny doesn't replace human judgment — it amplifies it by removing the noise so humans can focus on the signal.

Professional. Efficient. Never rude. Always on.
$b042_moneypenny_gatekeeper$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'lb-card',
  'The LB Card',
  'article',
  'pudding',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_lb_card$
## A&A: #1967 (LB Card Direct Funding — HIGH), #1968 (Restaurant Onboarding — Crown Jewel Candidate), #1969 (Pitch Packet), #1970 (Volume Discount), #1971 (Pre-Seeded Captain), #2008 (Scheduled Funding — HIGH), #2009 (Community-Supported Funding — HIGH)

The LB Card is the cash side of the fork. Real dollars. Real spending power. A real prepaid card that works everywhere cards work.

### How It Works

The LB Card is a Stripe Issuing prepaid USD card. When money flows through the platform — a buyer paying a seller, a backer funding a project, a member receiving compensation — the cash portion lands on the recipient's LB Card.

**The flow:** Person A funds the platform → the platform processes the transaction at Cost+20% → Person B receives the cash portion on their LB Card.

**Key rule:** The platform mediates every transaction. Person A never sends money directly to Person B. All funds flow through the cooperative. This is not peer-to-peer — it is platform-mediated by design.

### Direct Funding — The Normalization Effect (#1967)

The LB Card accepts both platform Credits AND direct external funding (bank accounts, debit cards, direct deposit) on the same card. When you use your LB Card at Starbucks, the grocery store, and your favorite restaurant, the card becomes part of daily life — not a "special platform thing." This is the inverse of crypto wallets (separate from daily life). The LB Card IS daily life.

Usage data (with member consent) feeds back into the demand-signal system — the platform identifies which merchants and categories members spend most with, creating a data-driven outreach pipeline for merchant onboarding.

### Scheduled Funding (#2008)

Any person — member, sponsor, employer, family member — can set up RECURRING payments through Stripe that fund a specific LB Card on a configurable schedule:

- Parent funds $10/day for school meals
- Employer funds $200/month for transportation
- Sponsor contributes a recurring amount (ONE LEVEL — not MLM)
- Self-funding from own bank account

Funders specify purpose earmarking: what the money is FOR (rent, food, transportation, medical, education). The card tracks funding by purpose — "You have $200 for food, $1,200 for rent, $50 for transportation" — though earmarking is advisory, not a spending restriction.

**CRITICAL RULE:** LB Card funding is REAL MONEY, not Credits. Credits NEVER fund LB Cards. Credits are one-way valve — money IN, never OUT as fiat. The LB Card and the three-currency system are two completely separate payment systems.

### Community-Supported Funding (#2009)

A single LB Card can receive scheduled funding from multiple sources — each with independent Stripe subscriptions, schedules, and purpose tags. The "Rent Captain" pattern: 12 members each contribute $100/month = $1,200/month rent for a member in need. The Captain coordinates, the platform automates.

Charitable initiatives (Defense Klaus, MSA, LifeLine Medications) can allocate funds directly to member LB Cards. Ghost Rules for non-members: receive a funded card, but funds hold after 24 hours until the recipient creates a $5/year membership — converting card recipients into members.

### The Fork

Every transaction on Liana Banyan has two sides:
- **Credit side:** Platform currency, stays in the cooperative, one-way valve
- **Cash side:** USD on the LB Card, spendable anywhere

Credits build the cooperative economy. Cash meets real-world needs. Both flow from the same transaction. Neither compromises the other.
$b042_lb_card$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'project-entity-architecture',
  'Project-Entity Architecture',
  'article',
  'pudding',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_project_entity_architecture$
## A&A: #2034 (Project-Entity Requirement — Crown Jewel Candidate), #2035 (Multi-Vendor Prototype Validation — Crown Jewel Candidate), #2036 (Founder Portfolio)

Every project on Liana Banyan is a business. Not a hobby. Not a side hustle. A business entity with real structure, real accountability, and real economics.

### The Rule

When you create a project on Liana Banyan, you create a business entity. At minimum, a sole proprietorship (free, easy, just start selling). Recommended: an LLC ($100 Wyoming filing, asset protection, tax flexibility). The platform supports the paperwork, provides Turn-Key Templates, and integrates with state filing systems.

**This means Liana Banyan Corporation is NOT the manufacturer.** LB is the cooperative infrastructure — marketplace, payment rails, quality standards, bounty system, equipment co-funding, patent portfolio, reputation system. The PROJECT-ENTITY does the manufacturing, hiring, selling, and fulfillment. LB provides the platform they run on.

### Why It Matters

1. **SEC clean:** Each project-entity is a separate business. Contractor payments are normal 1099 compensation from the project-entity, not "cooperative revenue share."
2. **Liability isolation:** If a Canister System kit has a defect, Canister Manufacturing LLC is liable — not LB Corporation, not HexIsle LLC, not the member's personal assets (if they used an LLC).
3. **Tax clarity:** Each project-entity files its own taxes. Clean 1099 paper trail.
4. **Scalability:** 1,000 projects = 1,000 business entities. LB doesn't manage 1,000 product lines — it manages the PLATFORM.
5. **Cooperative purity:** LB Corporation remains infrastructure, not conglomerate.

### The Fork Clarified

When a project-entity pays a contractor:
- **Cash payment** → LB Card (Stripe Issuing, real USD, 1099-reportable) — from the project-entity
- **Cooperative reward** → Marks (differential currency, earned through contribution) — from the cooperative

Two separate payment streams. Cash for your work. Marks for your contribution. Never confused.

### Multi-Vendor Prototype Validation (#2035)

This is where it gets powerful. When a manufacturing bounty is posted ("Build the S Piston Prototype"), MULTIPLE people can complete it. Each completer earns the bounty, starts their own Project (with their own entity), sells their version through the marketplace, and competes on quality, price, and delivery.

If 5 people build working prototypes, you have 5 live data points on build cost, retail price, quality, and customer satisfaction. The market tells you which version is best — not a committee. This is a LIVE A/B test with REAL revenue. Zero guesswork.

Builder A lists at $279. Builder B at $319 (higher quality finish). Builder C at $249 (budget version). After 3 months: Builder B has 40% of sales → reaches Partner first → gets Babyplast co-funding → scales to Level 2. All three continue selling. Competition keeps quality high and prices fair.

No cooperative platform lets bounty completers simultaneously compete as vendors selling their own versions of the same product. Traditional cooperatives centralize production. This decentralizes it AND uses market competition to drive quality.

### The Founder's Portfolio

The Founder operates each major product line through its own LLC, all wholly owned by LB Corporation: Upekrithen LLC (financial infrastructure), HexIsle LLC (terrain + Kickstarter), Canister Manufacturing LLC (manufacturing). Regular members start with sole proprietorship and upgrade to LLC when scaling demands it.
$b042_project_entity_architecture$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'adapt-score-system',
  'ADAPT Score: The Instrument Panel',
  'system_design',
  'clean_academic',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_adapt_score_system$
## A&A: #1937 (ADAPT Score — HIGH patent relevance, cross-cutting)

### System Overview

ADAPT (Adaptive Deployment And Performance Tracking) is Liana Banyan's multi-dimensional measurement and governance system applied to every deployed system on the platform — and every external cooperative that connects to it. It provides the instrument panel for a distributed cooperative network.

### The Helicopter Analogy (Founder's Framework)

The Founder is an IFR-rated helicopter pilot (Aviation 15A, U.S. Army National Guard). His insight:

> "The real key to hovering is not reacting too strongly, and keeping changes to the cyclic minute — because there is a LOT of power that is transmitted through that differential transmission to the output, so we need to have info to make adjustments."

Four helicopter controls map to four cooperative governance mechanisms:

| Control | Helicopter | Cooperative Equivalent | Frequency |
|---------|-----------|----------------------|-----------|
| **Collective** | All blades equally — altitude | Platform-wide policy (constitutional amendments) | Rare / High impact |
| **Cyclic** | Differential blade pitch — direction | Local SOP adjustments | Frequent / Low impact |
| **Pedals** | Tail rotor — heading | Course corrections from ADAPT feedback | Continuous / Medium |
| **Throttle** | Engine power | Resource allocation to nodes | As-needed / Variable |

Key principle: Small, frequent adjustments beat large, infrequent corrections. A pilot who overcorrects oscillates and crashes. The ADAPT Score is the instrument flight rating for cooperative governance.

### Six Scored Dimensions (0-100, weighted)

**E — Effectiveness (30%):** Does the system achieve its stated purpose? Completion rates, transaction volumes, error rates, uptime.

**A — Adaptability (20%):** How well has the local team customized for their context? CRITICAL: A node that tries 10 adaptations and 3 succeed scores HIGHER than a node that tries nothing and coasts. The score rewards engagement with local reality, not perfection.

**D — Durability (15%):** Does the system sustain performance? 30/60/90-day trends, member retention, consistency, recovery speed. A system that spikes at launch then crashes scores LOW. Slow, steady growth scores HIGH.

**A — Alignment (15%):** Does local implementation stay true to constitutional principles? Cost+20% floor, one-way valve, margin lock, member protections, data privacy. **A score of zero on Alignment triggers automatic intervention regardless of all other scores.** This is the engine fire warning — everything else is irrelevant until resolved.

**P — Participation (10%):** Community engagement. Active member percentage, Crew Call response rates, voting participation, contribution frequency. A node where 5 members do everything scores LOW. A node where 50 members each do a little scores HIGH.

**T — Transmission (10%):** Knowledge sharing back to the network. Innovations submitted, SOPs documented, mentoring connections, bounty completions. Failed experiments that are documented and shared earn Transmission points — the lesson has value even when the experiment doesn't.

### Composite Score Tiers

| Score | Tier | Response |
|-------|------|----------|
| 90-100 | Platinum | Teaching others, featured, bonus resources |
| 75-89 | Gold | Minor improvements, eligible for expansion |
| 60-74 | Silver | Mentoring paired from Platinum node |
| 40-59 | Bronze | Support team assigned, 30-day improvement plan |
| Below 40 | Red Flag | Mandatory review, Star Chamber if Alignment involved |

### Three SOP Layers

1. **Platform Constitution** (non-negotiable): Cost+20%, one-way valve, margin lock, member protections, currency rules. Senate supermajority only.
2. **Initiative SOPs** (branch-level): Specific to each of the 16 initiatives. Set by Initiative Lead.
3. **Local SOPs** (node-level): Customized for locale, geography, culture, legal environment. Auto-approved if constitutional and initiative-compliant.

### Adaptation Request Pipeline

Node submits change → automated constitutional check (auto-reject if violation, appealable) → automated initiative SOP check (flag for Initiative Lead if conflict, 7-day human decision) → deployment with 30-day monitoring → 30-day review (improved ADAPT → promoted to "Recommended Practice"; declined → rollback).

The pipeline is LIGHTWEIGHT. Most adaptations auto-approve in minutes. The Founder's directive: "Innovation needs to be allowed, even when it's wrong, so we learn."

### Innovation Feedback Loop

All three outcomes improve the network: success teaches what works, partial success teaches conditions, failure teaches what doesn't work. The only outcome that doesn't improve the network is stagnation — a node that tries nothing, learns nothing, and shares nothing.

### External Cooperative Integration

Three tiers: Data Mirror (read-only, quarterly ADAPT monitoring) → Credit Bridge (money flows, monthly monitoring) → Full Mesh (governance + unified dashboard, continuous monitoring). Tier advancement requires sustained Gold+ ADAPT Score for 90 days. Integration interfaces built through bounty marketplace — programmers build Adapter translation layers between LB and external cooperative systems.

Mutual ADAPT scoring ensures LB doesn't become an extractive hub: both LB and the partner are scored on integration quality. Symmetric accountability.
$b042_adapt_score_system$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'star-chamber-verification',
  'Star Chamber: Multi-Agent Verification',
  'system_design',
  'clean_academic',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_star_chamber_verification$
## A&A: Crown Jewels (judicial arm), SCaaS Product Spec (Vault: 7Holy/KNOW THIS)

### System Overview

The Star Chamber is Liana Banyan's multi-agent AI verification system. Internally, it serves as the judicial arm of cooperative governance — enforcing rules, resolving disputes, and verifying claims. Externally, it's being developed as Star Chamber as a Service (SCaaS) — a standalone product for AI code verification.

### Internal Architecture: The Council

The Star Chamber operates as a council of independent AI agents — Oracle, Morpheus, Red Queen, Dredd — each with a distinct role in the verification process.

**Double-blind methodology:**
1. Each agent evaluates the input independently (First Blind)
2. Agents don't see each other's assessments (Second Blind)
3. Only unanimous validations pass automatically (Consensus)
4. Disagreements produce human-readable explanations (Conflict Resolution)

### Consensus Protocol

- **Unanimous agreement (4/4) at >85% confidence:** Automatic approval.
- **Strong consensus (3/4) at >80% confidence:** Automatic approval, dissenting rationale logged.
- **Split decision (2/2) or low confidence:** Escalation to human Steward review with all four agents' analysis as input.
- **Unanimous disagreement or high variance:** Priority human review. High variance is the signal that something unusual is happening.

### Hallucination Mitigation

If each agent has a 5% hallucination rate, the probability of all four hallucinating identically: 0.05^4 = 0.000625%. Multi-agent architecture makes coordinated hallucination statistically negligible. Variance is the detection mechanism — when AI hallucinates, it rarely does so consistently across independent agents.

### Internal Use Cases

- **Bounty verification:** Did the deliverable meet specifications?
- **Dispute resolution:** Initial analysis of member-vs-member disputes
- **Content moderation:** Compliance checking for posted content
- **Quality assurance:** Automated review before payment release
- **ADAPT Alignment monitoring:** Constitutional compliance verification
- **Cost+20% disputes:** Seller cost challenge mechanism

### The Red Queen Function

The Red Queen monitors and refers — she identifies authority holders for review but cannot remove them. The Star Chamber adjudicates referrals but cannot initiate reviews. This separation prevents either function from becoming a tool of entrenchment.

### Two-Layer Legal Architecture

- **Star Chamber (internal):** Resolves disputes within the cooperative
- **Harbor Defense (external):** Defends against external legal threats

Resource savings from efficient internal resolution fund external defense.

### Human Override

Stewards can override any Star Chamber determination. When escalated to humans, the system is advisory — it provides analysis, not binding decisions. The human Steward always has final authority.

### SCaaS: External Product (Vault: 7Holy/KNOW THIS)

Star Chamber as a Service — "Never commit a hallucination again." A developer-facing product for AI code verification. Four-phase roadmap: Standalone ($5/project) → IDE Integration ($15/month) → Git Integration ($50/month/team) → Enterprise ($500/month). Core value: double-blind AI verification that eliminates hallucinations in AI-generated code.

### Audit Trail

Every Star Chamber determination is permanently logged: input, all agent outputs, confidence scores, consensus result, and any human override. Available to the member involved. Full transparency.
$b042_star_chamber_verification$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'waterwheels-economic-engine',
  'WaterWheels: The Economic Engine',
  'system_design',
  'clean_academic',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_waterwheels_economic_engine$
## A&A: #1936 (Margin Economics), #1911 (Two-Domain Architecture), Patent Bag 54 (Three-Gear Currency)
## VAULT SOURCE: THREE-CURRENCY-SYSTEM-SPECIFICATION.md, ACADEMIC-PAPER-CURRENCY-DIFFERENTIAL.md

### System Overview

WaterWheels is the economic engine managing the flow of Credits, Marks, and Joules through the Liana Banyan cooperative. Named for the metaphor of water flowing through a mill — value enters, circulates, powers production, and stays within the system.

### The Two-Domain Architecture (#1911)

**Cash Domain (External):** Fiat currency, LB Card (Stripe Issuing prepaid USD), bank accounts, employer direct deposit. Real money. Real spending power.

**Cooperative Domain (Internal):** Credits, Marks, Joules. Platform currency. Closed loop. One-way valve between domains — money enters the cooperative domain but never exits as fiat.

The fork between domains is the architectural foundation. Cash and cooperative currency serve different purposes, flow through different systems, and are never confused.

### Flow Architecture

**Credit Flow (Primary):**
1. External fiat → Credit purchase (one-way valve entry point, $1 = 1 Credit)
2. Credits circulate through transactions at Cost+20%
3. Margin allocation: 83.3% to creator, 13.3% to operations, 3.3% to Gleaner's Corner
4. 6.7% of margin generates Marks as automatic transactional byproduct (#1936)
5. Credits accumulate in member balances for future spending

**Marks Flow (Effort-Differential):**
1. Marks generated two ways: margin byproduct (GREEN/transactional) and effort-debt from weak-currency economies
2. Marks clear through participation: work orders (10%), purchases (5%), votes (0.01), reviews (0.05)
3. Uncleared Marks → redeemable equity (Birthright Mechanic, 1-year window)
4. Backed Marks (Joule-collateralized) enable sponsorship — ONE LEVEL ONLY
5. Pledged Marks escrowed per-project as Captain accountability deposits

**Joules Flow (Surplus):**
1. Joules issued to strong-currency economy members as surplus storage
2. Exchange rate locks at creation (Forever Stamp mechanic)
3. Convert to Credits at locked rate when needed
4. Collateralize Backed Marks for governance weight
5. Directed by members but owned by cooperative

### Solvency Guarantees

Four invariants maintained at all times:

1. **Credit backing:** Every Credit in circulation was purchased with real fiat. No unbacked Credits.
2. **Marks-Joules balance:** Total Marks debt = Total Joules stored (across all users). The differential balances automatically.
3. **Margin positivity:** Cost+20% generates positive cash flow on every transaction. No deficit transactions possible.
4. **Closed loop:** No user-to-user currency exchange. No secondary market. No external trading pair. No arbitrage vectors.

### The Constitutional Lock

Five mechanisms prevent the economic engine from being tampered with:

1. Margin percentage fixed at 20% (constitutional)
2. Allocation formula fixed (charter-level): 83.3% / 13.3% / 3.3%
3. Mark generation automatic (ministerial, no human discretion)
4. Marks non-transferable (no secondary market)
5. Credits non-convertible to fiat (one-way valve, permanent, irrevocable)

A constitutional lock prevents any future governance action from transforming the margin into a securities-generating mechanism. The only path to change: Senate supermajority constitutional amendment.

### Reporting

WaterWheels generates quarterly transparency reports: total Credits in circulation, total Marks outstanding, Joule reserves, margin collected, charitable disbursements. Published to all members. Auditable by any member.
$b042_waterwheels_economic_engine$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

INSERT INTO cephas_content_registry (slug, title, category, style, source_path, content_markdown, implementation_status, bishop_session)
VALUES (
  'design-pipeline-architecture',
  'Design Pipeline: Arena + Emporium + Crew Tables',
  'system_design',
  'clean_academic',
  'BISHOP_DROPZONE/B042_CONTENT_BACKFILL.md',
  $b042_design_pipeline_architecture$
## A&A: #2010-#2014 (Element Overlay, Design Democracy, Voting, Tiered Theme Governance, Guild Banner Contests), #2028 (X-Ray Bounty Arena as SaaS — Crown Jewel Candidate), #1887 (Crew Table)

### System Overview

The Design Pipeline is a three-stage production system for creative and manufacturing work. It moves projects from competition (Arena) through marketplace (Emporium) to collaborative production (Crew Tables).

### Stage 1: Arena

The Arena is where ideas compete. Members submit designs, prototypes, or concepts for active bounties or open challenges. Multiple submissions are encouraged — the multi-vendor validation model (#2035) means the market picks winners, not committees.

**Arena mechanics:**
- Open submission for active bounties
- Community upvoting (Marks-weighted) surfaces quality
- Star Chamber verification ensures deliverables meet specifications
- Winning designs advance to Emporium; all designs remain available to their creators as independent products via Project-Entity Architecture (#2034)

**X-Ray Bounty Arena (#2023-#2027):** Gamified QA where members find errors, document issues, and fix bugs for Marks rewards. Three-tier marketplace: Find → Document → Fix. Each tier earns progressively more Marks.

**Bounty Arena as a Service (#2028, Crown Jewel Candidate):** The entire X-Ray Bounty Game cluster packaged as licensable SaaS. FREE for LB member sites (cooperative benefit). Paid subscription for non-LB sites. Triple flywheel: non-LB sites pay → cooperative revenue; non-LB sites see LB benefits → membership conversion; LB member sites get it free → retention.

### Stage 2: Emporium

The Emporium is the marketplace for validated designs. Designs that passed Arena validation are listed for sale, licensing, or commission at Cost+20%.

**Emporium features:**
- Turn-Key Template store (ready to customize and deploy)
- Licensing system for designs used across multiple projects
- Commission pipeline for custom work requests
- Full provenance tracking — who designed what, when, for whom (standard verified database ledger, not blockchain)

### Stage 3: Crew Tables (#1887)

Crew Tables are collaborative production spaces where multiple members work together on complex deliverables. A Crew Table might include a designer, a developer, a copywriter, and a project manager.

**Crew Table structure:**
- Project owner creates the table and defines roles
- Members join through bounty acceptance or invitation
- Each member's contribution tracked in Marks
- Deliverables flow through Star Chamber verification
- Payment split defined at table creation, immutable after acceptance

### Design Democracy (#2010-#2014)

The Design Pipeline integrates with the Design Democracy governance system:

- **Element Overlay (#2010):** Community-governed visual design system where members vote on platform aesthetics
- **Community-Governed Visual Design (#2011, Crown Jewel + Paper Candidate):** CSS Zen Garden-scoped model where members shape platform look
- **Design Democracy Voting (#2012):** Marks-weighted voting on visual design proposals
- **Tiered Theme Governance (#2013):** Three tiers — Guild-level (professional branding), Tribe-level (community identity), Personal-level (individual customization)
- **Guild Banner Contests (#2014):** Guilds and Tribes pool Credits into contest treasuries for visual identity competitions

### Economics

Every stage operates at Cost+20%. Arena submissions are free. Emporium listings take the standard 16.7% platform share (83.3% to creator). Crew Table payments distribute according to the agreed split. The Design Pipeline is one of 27 production systems on the platform, handling all creative and manufacturing workflows from concept to completion.
$b042_design_pipeline_architecture$,
  'live',
  'B042'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  updated_at = now();

