# Pudding #62: The Five-Dollar Membership

*The hardest price in the world is the one that never changes.*

---

## At a Glance

Five dollars a year. That is what it costs to join Liana Banyan. The Founder pays five dollars. The first member pays five dollars. The millionth member pays five dollars. There are no tiers. No premium plans. No enterprise pricing. No "free trial that becomes $49.99/month."

Five dollars. Forever.

---

## More Info

### Why Five Dollars

Not free. Not ten. Not "starting at." Five.

**Why not free?** Because free users are not members — they are traffic. A free platform must monetize your attention (advertising) or your data (surveillance). A cooperative that costs nothing attracts people who value it at nothing. Five dollars is the minimum viable commitment: enough to filter out bots and tire-kickers, low enough that no human being in the target market is excluded.

**Why not more?** Because the membership is not the revenue model. The cooperative makes money through Cost+20% on transactions — the operating margin on actual commerce. Membership is the *entry fee*, not the *business model*. Charging more for membership would add revenue the cooperative does not need while excluding people it should serve.

**Why not tiered?** Because tiers create classes. A "premium" member who pays $99/year gets better features than a "basic" member who pays $5. That is how corporate platforms work: segment the market, extract more from people who can pay more. A cooperative has one class of member. One vote per person. One price.

### What Five Dollars Buys

Your $5/year membership gives you:

- **Full marketplace access** — buy, sell, browse, back projects
- **One vote in every election** — Design Democracy, Board representatives, initiative councils
- **All 35 production systems** — food network, manufacturing, housing, governance, everything
- **A Helm** — your personal dashboard, your Treasure Maps, your Cue Cards
- **Participation in all 16 initiatives** — food security, healthcare access, civic engagement, and thirteen more
- **The entire cooperative economy** — Credits, Marks, Joules, Cooperative Purchasing, Wildfire Runs

There is no feature behind a paywall. There is no "upgrade to unlock." Every member gets everything.

---

## Full Detail

### The Architecture of Simplicity

The five-dollar membership eliminates an entire category of engineering decisions. In every other platform, engineers must build:

- **Feature gating** — which features are available at which tier
- **Billing systems** — monthly/annual, proration, upgrades, downgrades, failed payments
- **Tier management** — admin tools for managing different membership levels
- **Pricing experiments** — A/B tests to optimize conversion at different price points
- **Enterprise sales** — custom pricing, contracts, invoicing for large accounts

The cooperative needs none of this. One price. One tier. One annual charge. The billing system is a single Stripe subscription with one SKU. The feature gate is binary: member or not. The entire pricing infrastructure is approximately twelve lines of code.

This is not minimalism for its own sake. It is Cost+20% applied to the membership itself. Every line of code the cooperative does not have to write reduces its operating cost, which reduces the Cost+20% floor, which increases the creator's 83.3%.

### The Social Contract

Five dollars a year is not just a price. It is a social contract. It says:

- **We trust you.** We are not going to nickel-and-dime you. We are not going to raise the price when we have leverage. We are not going to add a "convenience fee" or a "processing fee" or a "platform fee." Five dollars covers your seat at the table.

- **You trust us.** You are committing five dollars to an organization that promises to operate at Cost+20%, to give creators 83.3%, and to never take venture capital. If we break that promise, you are out five dollars. The risk is yours. The obligation is ours.

- **We are in this together.** The Founder pays the same five dollars you do. The Captain pays five. The leather crafter pays five. The person who joined yesterday pays five. There is no VIP. There is no "valued customer." There are members.

### Why It Cannot Change

The five-dollar price is a structural bylaw. It is not a marketing decision. It is not a "launch price" that will increase later. It is written into the cooperative's operating agreement the same way Cost+20% is written in.

Changing it would require a vote of the membership — the same membership that benefits from the low price. This is the cooperative's version of a constitutional amendment: theoretically possible, practically immovable.

This is the hardest thing about the five-dollar membership. It is easy to charge five dollars when you have no members. It is harder when you have a thousand. It is hardest when you have a million — when the temptation to "just add a small increase" could generate millions in revenue.

The cooperative's answer is: no. Five dollars. The price is the promise. The promise is the cooperative.

### The Math That Makes It Work

A million members at $5/year = $5 million in membership revenue. Plus Cost+20% on every transaction across 35 production systems. Plus Credit purchases for platform services. Plus manufacturing margin through Pioneer Nodes.

The five-dollar membership is the floor of a revenue model, not the ceiling. It funds the right to participate. Everything else funds the operations.

And the 83.3%? That comes from the commerce margin. Not from your five dollars. Your five dollars buys your seat. What you build with that seat — that is between you and the cooperative.

---

*Pudding #62 — The Five-Dollar Membership*
*Bishop B061 | April 2, 2026*
*~900 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  62,
  'The Five-Dollar Membership',
  'the-five-dollar-membership',
  'The hardest price in the world is the one that never changes.',
  'pudding-62-the-five-dollar-membership',
  900,
  ARRAY['membership', 'five-dollars', 'pricing', 'social-contract', 'no-tiers'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
