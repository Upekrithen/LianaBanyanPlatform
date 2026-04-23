-- K163: Seed 10 Cephas Pudding articles from Bishop B044
-- Member-facing, conversational guides explaining core platform systems

-- 1. three-currencies
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'three-currencies',
  'Three Currencies, One Cooperative',
  'article',
  'how-it-works',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_THREE_CURRENCY_INTRO.md',
  'live',
  'B044',
  'Explains the three-currency system (Credits, Marks, Joules) and their cooperative flywheel dynamics. Credits = spend, Marks = effort, Joules = stored surplus.',
  ARRAY['credits-marks-joules-foundational'],
  $md_three_currencies$Most platforms have one currency: dollars. You pay, you get something, the platform takes its cut.

Liana Banyan has three currencies. Each one does something different, and together they create an economy where doing more for your community literally makes everything cheaper.

---

## Credits — The Simple One

Credits are the easiest to understand. One dollar equals one Credit. You buy them, you spend them. They work like money inside the platform.

The difference? When you spend Credits at Liana Banyan, 83.3% goes to the creator or worker. The platform keeps Cost + 20% — just enough to keep the lights on. Compare that to the 30-50% that other platforms take.

Credits are a one-way valve. You buy them with dollars, but you never cash them out to dollars. They stay in the cooperative economy, circulating between members.

---

## Marks — The Effort Currency

Marks are where it gets interesting. You cannot buy Marks. You can only earn them by contributing to the cooperative — completing bounties, filling crew tables, running deliveries, designing cue cards, reviewing products, helping neighbors.

The more Marks you earn, the more the platform recognizes your contribution. Marks unlock access to better tools, lower prices through volume discounts, and voting weight in cooperative decisions.

Think of Marks as the cooperative keeping score of who shows up and does the work. Not who has the most money — who contributes the most effort.

Marks come in two flavors:
- **Backed Marks** are collateralized by Joules and carry governance weight
- **Pledged Marks** are escrowed for specific projects

---

## Joules — The Forever Stamp

Joules are the rarest currency. They represent surplus value that the cooperative generates over time. When the platform does well, surplus flows into Joules.

Joules back the value of Marks. They are the cooperative''s stored energy — its proof that the work everyone did created something lasting.

You do not spend Joules directly. They work behind the scenes, giving Marks their weight and ensuring the cooperative economy has real substance behind it.

---

## How They Work Together

Here is the simplest way to think about it:

- **Credits** = what you spend (like money)
- **Marks** = what you earn by contributing (like reputation + rewards)
- **Joules** = what the cooperative saves (like equity)

A new member starts by spending Credits. As they contribute, they earn Marks. The more people contribute, the more Joules accumulate. The more Joules there are, the more valuable Marks become. The more valuable Marks are, the more incentive there is to contribute.

It is a flywheel. The academic term is "compounding cooperative velocity." The plain-English version: the more we help each other, the better it gets for everyone.

---

## One Rule That Changes Everything

All three currencies are worth the same amount. One Credit = one Mark = one Joule in face value.

But you cannot buy Marks or Joules with dollars. The only way to get them is through participation. This means the people who contribute the most have the most influence — not the people who spend the most money.

That is the whole point.

---

*Want to start earning Marks? Check your Crew Call board for available bounties, or ask your Captain about local opportunities.*$md_three_currencies$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 2. captain-system
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'captain-system',
  'Your Captain Has Arrived',
  'article',
  'how-it-works',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_CAPTAIN_SYSTEM.md',
  'live',
  'B044',
  'Moses Model captain progression (Walking Billboard → Apprentice → Captain → Senior Captain), Pitch Packet, Calling Card, Geographic Corridor system.',
  ARRAY['#1963', '#1964', '#1965', '#1966', '#1975', '#1976', '#1977', '#1978', '#1985', '#1986', '#1987', '#1988'],
  $md_captain_system$Every cooperative needs someone local who knows the neighborhood, knows the businesses, and is willing to do the legwork to get things started. In Liana Banyan, that person is called a Captain.

A Captain is not an employee. A Captain is a member who steps up and says: "I will help build this in my area." And the platform gives them the tools to do it.

---

## What Does a Captain Actually Do?

A Captain walks into local businesses — restaurants, shops, service providers — and shows them what the cooperative can offer. More customers. Lower delivery costs. A community that already wants to buy local.

The Captain carries a Pitch Packet: a one-page printable document with real numbers. How many members are nearby. What the average order looks like. What the business would keep (83.3% of every transaction — always).

The Captain does not sell anything. The Captain shows business owners a better deal than what they are currently getting from DoorDash, UberEats, or Yelp.

---

## How Do You Become One?

Captains are not appointed. They earn it through a progression system we call the Moses Model — named after the idea that leaders emerge from the community they serve.

**Stage 1 — Walking Billboard.** You start by simply being visible. Wearing the brand. Sharing your QR-coded Calling Card. Every scan earns you Marks.

**Stage 2 — Apprentice.** Once you have shown consistency, you shadow an existing Captain. Learn the pitch. See how the conversations go. Practice with the Tiered Commitment Chart (the C+20 through C+90 negotiation framework).

**Stage 3 — Captain.** You get your own territory — a Geographic Corridor. The platform gives you a dashboard showing which businesses in your area are not yet onboarded. You get batch order tools, delivery tracking, and a Pedestal (a public leadership profile where the community can see your track record and support you).

**Stage 4 — Senior Captain.** You have proven results. Multiple businesses onboarded. Consistent delivery. You start training new Apprentices. The cycle continues.

---

## What Do Captains Earn?

Captains earn Marks for every business they onboard, every order they facilitate, and every Apprentice they train. Marks unlock volume discounts, governance weight, and cooperative benefits.

Captains also get a Calling Card — a personalized QR card powered by Durin's Door that routes people directly to their local cooperative page. Hand it to a restaurant owner, and they scan straight to their onboarding flow. Hand it to a neighbor, and they scan straight to membership signup.

One card. Infinite uses. And every scan is tracked, so the Captain gets credit for the connection.

---

## The Captain's Toolkit

- **Pitch Packet** — printable one-page with local stats and the Cost+20% value proposition
- **Tiered Commitment Chart** — the C+20 through C+90 escalation framework for restaurant negotiations
- **Calling Card** — QR-coded personal access card via Durin's Door
- **Captain's Dashboard** — real-time view of territory, businesses, orders, and Apprentices
- **Pedestal** — public leadership profile with community support signals
- **Batch Order Tools** — manage multiple business orders with stake-based commitment

---

## Why It Works

Most platforms hire salespeople. Liana Banyan grows Captains from the community. A Captain is a neighbor talking to a neighbor. They eat at the restaurants they onboard. They know the mechanic they are signing up. They live in the corridor they serve.

That trust cannot be hired. It can only be earned.

---

*Interested in becoming a Captain? Start by getting your Calling Card and sharing it with five local businesses. The platform tracks your progress automatically.*$md_captain_system$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 3. cold-start-hub
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'cold-start-hub',
  'Six Doors In',
  'article',
  'getting-started',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_COLD_START_HUB.md',
  'live',
  'B044',
  'Six onboarding paths (Food/Orange, Manufacturing/Slate, Service/Blue, Local Business/Emerald, Guild/Purple, Tribe/Gold) solving the cooperative cold-start problem.',
  ARRAY['#2007', '#2008', '#2009'],
  $md_cold_start_hub$The hardest part of any cooperative is getting started. You need members before you have services, but you need services before members will join. Every cooperative in history has faced this chicken-and-egg problem.

Liana Banyan solves it with six doors. Six different ways to walk in, each one designed around something people already do.

---

## Door 1: Food (Orange Path)

"I want to feed my family better and cheaper."

This is the most natural entry point. Join a meal plan. Order from a local restaurant through the cooperative instead of through a delivery app. Start a Breakfast Runner node in your neighborhood. The food path gets people in the door with something they need every single day.

## Door 2: Manufacturing (Slate Path)

"I want to make things."

The Canister System, HexIsle terrain, 3D printing, desktop injection molding. If you are a maker, a hobbyist, or someone who wants to learn — this path connects you with tools, materials, and other makers. Start with a bounty. Build something. Earn Marks.

## Door 3: Service (Blue Path)

"I have a skill people need."

Mechanic, tutor, photographer, cleaner, driver, designer, developer. The service path matches your skills with people in your area who need them. Set your own rates. The platform takes Cost+20%. You keep 83.3%.

## Door 4: Local Business (Emerald Path)

"I own a business and want more customers."

A Captain shows up with a Pitch Packet. The numbers make sense. You onboard through the cooperative, get access to a pre-built customer base, and pay less than you pay DoorDash or UberEats. Your business gets a Cue Card, a listing, and a direct connection to local demand.

## Door 5: Guild (Purple Path)

"I want to organize with people in my profession."

Guilds are professional groups. Photographers. Developers. Chefs. Mechanics. A Guild gets its own treasury, visual identity, volume discounts, and benefit cascade. If you are good at what you do and want to be part of a professional network that actually helps you earn more — start or join a Guild.

## Door 6: Tribe (Gold Path)

"I want to connect with people who share my life."

Tribes are personal groups. Your church. Your running club. Your neighborhood block. Your homeschool co-op. A Tribe gets its own Family Table (shared meal planning), treasury, and visual identity. You can belong to as many Tribes as you want. Guilds are professional. Tribes are personal.

---

## Why Six Paths?

Because not everyone joins a cooperative for the same reason. A single mom joins because she wants cheaper groceries. A maker joins because she wants access to an injection molder. A restaurant owner joins because a Captain showed him the math.

Six paths means six different "aha" moments. Six different ways to answer the question: "Why should I join?"

And once you are in through any door, you can see all the others. The food member discovers the service marketplace. The maker discovers the Guild system. The restaurant owner discovers the delivery network.

One door in. The whole cooperative opens up.

---

*Not sure which path is right for you? Visit the Cold Start Hub — it asks three questions and points you to the door that fits.*$md_cold_start_hub$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 4. moneypenny-receptionist
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'moneypenny-receptionist',
  'MoneyPenny: Your AI Receptionist',
  'article',
  'platform-tools',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md',
  'live',
  'B044',
  '4-tier AI receptionist (Known Contacts → Platform Members → Verified Externals → Unknown) with configurable screening, auto-response, and availability controls.',
  ARRAY['#2021'],
  $md_moneypenny$Every business needs someone answering the door. Screening calls. Sorting the real opportunities from the noise. Big companies hire a receptionist. Small businesses let everything go to voicemail.

Liana Banyan gives every member MoneyPenny — an AI receptionist that screens, sorts, and responds to inbound contacts so you do not have to.

---

## How MoneyPenny Works

When someone contacts you through the platform — whether it is a business inquiry, a collaboration request, or a customer question — MoneyPenny handles the first interaction.

MoneyPenny checks four things:

**Tier 1 — Known Contacts.** Is this person already in your contacts list? If yes, they get through immediately. No screening needed. Your people are your people.

**Tier 2 — Platform Members.** Is this person a Liana Banyan member? Members have a track record. MoneyPenny can see their Marks, their reputation, their history. Members get a fast response with context.

**Tier 3 — Verified Externals.** Is this someone from outside the platform who has been verified? A business owner responding to a Captain's pitch, for example. MoneyPenny sends them a polite acknowledgment and queues the message for your review.

**Tier 4 — Unknown.** Everyone else. MoneyPenny sends a professional auto-response ("Thank you for reaching out. Your message has been received and will be reviewed.") and puts the message in your screening queue. No personal information is shared. No commitment is made.

---

## What You Control

MoneyPenny is not a black box. You control:

- **Your contacts list** — who gets through automatically
- **Your auto-response templates** — what unknown contacts receive
- **Your screening preferences** — how aggressive the filtering is
- **Your availability** — when you want to be reachable vs when MoneyPenny handles everything

---

## Why This Matters

If you are a Captain onboarding businesses, you get a lot of inbound messages. Some are serious. Some are spam. Some are competitors fishing for information.

If you are a creator selling through the marketplace, customers have questions. Some need a real answer. Some are covered by your FAQ.

If you are just a member living your life, you do not want random platform messages interrupting your dinner.

MoneyPenny handles all of this. Quietly. Professionally. And you decide how much of it you ever see.

---

*MoneyPenny is enabled by default for all members. Customize your settings in your Helm under Contact Preferences.*$md_moneypenny$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 5. lb-card
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'lb-card',
  'The LB Card: Your Cooperative Wallet',
  'article',
  'how-it-works',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_LB_CARD.md',
  'live',
  'B044',
  'Stripe-powered prepaid LB Card: scheduled funding, community-supported funding, charity card linking. 83.3% to vendor on every transaction.',
  ARRAY['#1967', '#1968', '#1969', '#1970', '#1971', '#2008', '#2009'],
  $md_lb_card$The LB Card is a prepaid card that lives inside the cooperative. You load it with Credits, and you spend it at any participating business on the platform. Simple as that.

But what makes it different from any other prepaid card is what happens around it.

---

## How It Works

Your LB Card is a Stripe-powered prepaid card tied to your membership. You load Credits onto it (remember: $1 = 1 Credit, one-way — Credits never convert back to dollars). Then you use those Credits at participating restaurants, shops, and service providers.

When you spend 10 Credits at a local restaurant through the cooperative:
- The restaurant gets 8.33 Credits (83.3%)
- The platform gets 1.67 Credits (Cost+20%)
- The restaurant pays less than they pay DoorDash or UberEats
- You pay less than retail because of cooperative volume pricing

Everyone wins except the extractive middleman.

---

## Scheduled Funding

You can set up automatic funding — load your card on a schedule. Every Monday, add 20 Credits. Every payday, add 50. Set it and forget it.

This matters because predictable funding means predictable demand. When 500 members all load their cards on Monday, the cooperative knows how much purchasing power is coming. That lets Captains negotiate better deals with local businesses. Guaranteed demand is the most powerful negotiating tool in commerce.

---

## Community-Supported Funding

Here is where it gets interesting. Authorized community funders can add Credits to other members' LB Cards.

A Guild can fund its members' cards for work-related purchases. A Tribe can pool resources for shared meals. A sponsor can seed new members'' cards as part of an onboarding campaign.

This is not charity. It is cooperative economics. The community invests in its members, and those members spend locally, and that spending comes back as lower prices and better services for everyone.

---

## Charity Card Linking

Every LB Card can be linked to a charity partner. When you spend, a percentage flows to the charitable organization of your choice — automatically, transparently, every transaction.

You do not have to think about it. You do not have to write a check. You just live your life, spend your Credits, and your community benefits.

---

## What the Card Is Not

The LB Card is not a credit card. There is no debt, no interest, no credit score impact. It is prepaid — you can only spend what you have loaded.

The LB Card is not a bank account. Liana Banyan is not a bank. Credits are prepaid service access within the cooperative, not deposits.

The LB Card is not an investment. Credits do not appreciate. They do not earn returns. They are spent on goods and services within the cooperative economy.

---

*Ready to get your LB Card? It activates automatically with your $5 annual membership.*$md_lb_card$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 6. guest-marks-wallet
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'guest-marks-wallet',
  'Try Before You Join',
  'article',
  'getting-started',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_GUEST_MARKS_WALLET.md',
  'live',
  'B044',
  'Guest Marks Wallet: 90-day no-purchase-necessary participation path. Earn Marks without membership, auto-transfers on $5/yr signup. Contest compliance + trust-building.',
  ARRAY['#2034'],
  $md_guest_wallet$You do not have to be a member to start earning at Liana Banyan.

The Guest Marks Wallet lets anyone — member or not — participate in contests, challenges, and bounties and earn Marks without signing up first.

---

## How It Works

When you enter a contest or complete a challenge on the platform, you earn Marks. If you are not a member yet, those Marks go into a Guest Wallet tied to your email address.

Your Guest Wallet holds your Marks for 90 days. During that time, you can see what you have earned, but you cannot spend them yet.

When you decide to join (it is $5 per year), your Guest Wallet balance transfers to your member account instantly. Every Mark you earned before joining is yours.

---

## Why This Exists

Two reasons.

First, it solves a legal problem. Contests and challenges that offer prizes need a genuine "no purchase necessary" alternative. The Guest Wallet is that alternative — you can participate and earn without spending a dollar.

Second, it solves a trust problem. Nobody wants to commit to a new platform before they know if it is worth it. The Guest Wallet lets you do real work, earn real value, and decide for yourself.

---

## The Rules

- Guest Wallets expire after 90 days if you do not sign up
- Guest Marks cannot be transferred, sold, or converted to cash
- One Guest Wallet per email address
- When you become a member, your balance moves automatically — nothing is lost

---

*Saw a challenge that looks interesting? Jump in. You do not need to be a member yet.*$md_guest_wallet$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 7. pathfinder-journal
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'pathfinder-journal',
  'PathFinder: Where Do You Want to Go?',
  'article',
  'platform-tools',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_PATHFINDER_JOURNAL.md',
  'live',
  'B044',
  'Career discovery journal: write → complete challenges → see emerging patterns → follow the thread to Guild openings, bounties, and Treasure Maps.',
  ARRAY['#2086'],
  $md_pathfinder$Most platforms show you what to buy. PathFinder helps you figure out what to build.

It is a career discovery journal built into the platform. You answer questions, complete challenges, and over time, PathFinder detects patterns in what you are good at and what you enjoy.

---

## How It Works

PathFinder is not a quiz that gives you an answer in 60 seconds. It is a journal that grows with you.

**Step 1 — Start writing.** What did you do today? What was satisfying? What was frustrating? PathFinder prompts you with questions, but you can write freely.

**Step 2 — Complete challenges.** The platform offers challenges across different disciplines — design, logistics, communication, technical, creative. Each one you complete adds data to your pattern profile.

**Step 3 — See your patterns.** Over time, PathFinder shows you what is emerging. "You have completed 8 design challenges and rated them all highly. You have avoided every logistics task. Have you considered the Designer Bounty pathway?"

**Step 4 — Follow the thread.** PathFinder connects your patterns to real opportunities on the platform. Guild openings. Bounties that match your strengths. Treasure Maps for career paths you had not considered.

---

## Why This Matters

Traditional job platforms ask you what you want to do and show you listings. But most people — especially young people, career changers, and people re-entering the workforce — do not know what they want to do.

PathFinder does not ask. It watches what you choose, what you finish, and what you come back to. Then it reflects those patterns back to you.

It is not an algorithm deciding for you. It is a mirror showing you what you have already decided.

---

*PathFinder is available in your Helm. Start your first journal entry anytime.*$md_pathfinder$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 8. marks-payback
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'marks-payback',
  'Marks Payback: Earn Your Membership',
  'article',
  'how-it-works',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_MARKS_PAYBACK.md',
  'live',
  'B044',
  'Participation-funded membership renewal: 100+ Marks + 5 Credits = auto-renewal. Weekly cron check for expiring memberships. Cooperative flywheel mechanics.',
  ARRAY['#2094'],
  $md_marks_payback$Liana Banyan membership costs $5 per year. But if you are an active participant, you may never pay that $5 again.

Marks Payback automatically renews your membership using Credits you have already earned — at zero out-of-pocket cost.

---

## How It Works

If you have earned 100 or more Marks during your membership year AND you have at least 5 Credits in your account, the platform automatically renews your membership for you.

- 5 Credits are deducted from your balance
- Your membership extends for another year
- You receive a notification: "Your membership has been renewed through Marks Payback"
- You pay nothing out of pocket

The system runs automatically every week, checking members whose memberships expire within 7 days.

---

## What It Means

The $5 membership fee is not a barrier — it is a commitment signal. But once you have demonstrated commitment through participation (100 Marks = roughly a few months of moderate activity), the cooperative says: "You have earned this. Your membership is on us."

The Credits still come from your account, so the cooperative still collects its operating revenue. But you earned those Credits through your participation, so you are effectively paying for your membership with your work.

This is the cooperative flywheel in action. Participate → earn Marks → earn Credits → membership renews automatically → keep participating.

---

## Eligibility

- Earn 100+ Marks in your current membership year
- Have 5+ Credits in your account
- That is it

No application. No approval. No paperwork. If you qualify, it happens automatically.

---

*Just keep contributing. When your renewal comes up, Marks Payback handles the rest.*$md_marks_payback$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 9. backer-election
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'backer-election',
  'Your Money, Your Choice',
  'article',
  'how-it-works',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_BACKER_ELECTION.md',
  'live',
  'B044',
  'Irrevocable 3-option backer election (Gift Receipt / Credits Election / Community Fund) with digital signature. Promissory estoppel compliance.',
  ARRAY['#2035'],
  $md_backer_election$When you back a project on Liana Banyan — whether it is a Kickstarter campaign, a bounty sponsorship, or a community initiative — you make a choice about what your contribution means. That choice is permanent, clear, and yours.

---

## Three Options

When you fund a project, you select one of three options:

**Option A — Gift Receipt.** Your contribution is a gift. You expect nothing in return. Simple, clean, no strings.

**Option B — Credits Election.** Your contribution converts to Credits at $1 = 1 Credit. Those Credits live in your account and can be spent on goods and services within the cooperative. This is not an investment. Credits do not appreciate. They are prepaid service access.

**Option C — Community Fund.** Your contribution goes to the cooperative's community fund. It supports the platform's mission broadly — infrastructure, member programs, community initiatives. This is not a tax-deductible charitable donation.

---

## Why It Is Permanent

Your election is irrevocable. Once you choose, it cannot be changed. This is not a limitation — it is a protection.

For you: it means the terms of your contribution are locked in. Nobody can change what your money means after the fact.

For the cooperative: it means every dollar has a clear, documented purpose. No ambiguity. No disputes.

For legal compliance: it means the cooperative can demonstrate to regulators exactly what every contribution is and is not. Credits are not securities. Gifts are not investments. Community fund contributions are not charitable deductions.

---

## How It Works

1. You find a project you want to support
2. You choose your contribution amount
3. You select Option A, B, or C
4. You confirm with a digital signature
5. Your election is recorded permanently

That is it. No fine print. No hidden terms. One choice, clearly explained, permanently recorded.

---

*Ready to back a project? Your Backer Election is part of every funding flow on the platform.*$md_backer_election$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- 10. ghost-world
INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, technical_summary,
  innovation_ids, content_markdown
) VALUES (
  'ghost-world',
  'Ghost World: Your Digital Storefront',
  'article',
  'platform-features',
  'pudding',
  'BISHOP_DROPZONE/CEPHAS_PUDDING_GHOST_WORLD.md',
  'live',
  'B044',
  'HexIsle Ghost World: hex-grid storefronts, pop-up kiosks, cross-island discovery feed, Deck Cards (Loteria system). Every member gets one free storefront.',
  ARRAY['hexisle-ghost-world-cluster'],
  $md_ghost_world$Every member of Liana Banyan gets a storefront. Not a profile page — a storefront. A place where people can find you, see what you offer, and buy from you. And it lives on a hex-grid island in Ghost World.

---

## What Is Ghost World?

Ghost World is the visual layer of the cooperative economy. Think of it as a map made of hexagonal tiles, where each tile represents a real member, business, or service.

Your storefront sits on your home island. Nearby tiles show other members and businesses in your area. The closer they are on the map, the closer they are in real life.

It is not a game. It is a visual way to discover what your community has to offer.

---

## Your First Store Is Free

Every member gets one storefront at no cost. Set it up in minutes:

1. Name your store
2. Describe what you offer (products, services, skills)
3. Set your prices (in Credits)
4. Upload photos
5. You are live

Your storefront syncs with your real-world presence. If you update your hours, your Ghost World store updates. If you add a new product, it appears on your tile. Real store = Ghost Store.

---

## Pop-Up Kiosks

Want to be visible in another neighborhood? Set up a Pop-Up Kiosk on a different island. Pop-Ups are temporary storefronts that let you test new markets without commitment.

A baker in one neighborhood can pop up on an island across town. A designer can set up a kiosk at a virtual craft fair. A service provider can place kiosks wherever demand is highest.

---

## Discovery

The hex grid is not just for looking at. It is a discovery engine.

Browse nearby tiles to find services you did not know existed. Filter by category — food, services, makers, entertainment. See which storefronts are popular (the busier the tile, the brighter it glows).

The Cross-Island Discovery Feed shows you trending storefronts, new arrivals, and businesses that match your past purchases.

---

## Deck Cards

Every storefront has a Deck Card — a digital business card that can be shared, collected, and displayed. Deck Cards are part of the Loteria system: collect cards from businesses you visit, and unlock rewards.

Your Deck Card is your identity in Ghost World. Make it memorable.

---

*Your storefront is waiting. Set it up in your Helm under "My Store."*$md_ghost_world$
) ON CONFLICT (slug) DO UPDATE SET
  content_markdown = EXCLUDED.content_markdown,
  technical_summary = EXCLUDED.technical_summary,
  updated_at = now();

-- Update Cephas entry count in platform_canonical
UPDATE platform_canonical
  SET value = (SELECT COUNT(*) FROM cephas_content_registry),
      updated_at = now()
  WHERE key = 'cephas_entry_count';
