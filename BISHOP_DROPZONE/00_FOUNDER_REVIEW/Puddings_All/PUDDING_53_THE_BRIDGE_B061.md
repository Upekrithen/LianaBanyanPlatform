# Pudding #53: The Bridge

*Why a cooperative marketplace sends your customers to your competitors.*

---

## At a Glance

Most marketplaces want to trap your customers. Buy here, not there. Stay in our ecosystem. Do not leave.

Liana Banyan does the opposite. Your product page has a section called "Also Available On" — with links to your Etsy shop, your Shopify store, your personal website. Links that open in a new tab and send your customer *away* from the cooperative.

This is not a bug. It is the business model.

---

## More Info

### The Walled Garden Problem

Amazon does not want you to know that the seller has a personal website where the product is $5 cheaper. Etsy does not want you to know the maker has an Instagram shop with more selection. Apple does not want you to know the app is free on Android.

Walled gardens work because they capture traffic. The platform's value proposition to sellers is: "We have the eyeballs. You need the eyeballs. Pay us to access the eyeballs." The higher the wall, the more the platform can charge.

But this creates a misalignment. The seller wants to sell everywhere. The platform wants the seller to sell *only here.* The seller's success and the platform's revenue model are pulling in opposite directions.

### How Bridges Work

On Liana Banyan, a creator registers their external sales channels as "Bridges." A Bridge is a verified link to another place where the creator sells the same product — Etsy, Shopify, Square, a personal website, an Instagram Shop.

These Bridges appear on the creator's product page:

```
Also available on:
🔗 Etsy  |  🌐 jonesleather.com  |  □ Square
```

Click any of those links and you leave the cooperative. The customer goes to the creator's other shop. The cooperative earns nothing on that transaction.

So why does the cooperative do this?

### The Business Model Alignment

Because the cooperative does not make money from transactions in the way other platforms do.

The cooperative's revenue comes from:
- **$5/year membership** — flat, universal, non-negotiable
- **Cost+20% on production** — when the cooperative's manufacturing and logistics infrastructure processes an order
- **Credits/Marks/Joules circulation** — the cooperative's internal economy

The cooperative does NOT charge:
- Sales commissions
- Listing fees
- Advertising fees
- Payment processing markups

This means the cooperative does not lose money when a customer buys from the creator's Etsy shop instead. The cooperative's revenue is based on *membership* and *production*, not on *capturing transactions.*

In fact, the cooperative GAINS when a creator succeeds on other platforms:
1. **Successful creators stay.** A creator who sells well on Etsy AND on Liana Banyan has no reason to leave either.
2. **External success is social proof.** "This maker sells 500 units a month on Etsy" makes other cooperative members more likely to support the maker's Design Democracy proposals.
3. **Bridge traffic data proves value.** The cooperative tracks how many customers it sends to the creator's other channels. "We sent 200 customers to your Etsy this month" is a retention argument no other platform can make — because no other platform *helps you sell somewhere else.*

---

## Full Detail

### The Traffic Export Metric

Most platforms measure traffic they *capture*. Sessions, page views, conversion rates — all metrics of containment.

The cooperative measures traffic it *exports*. Every Bridge click is logged. At the end of the month, a creator can see:

```
Your Bridges This Month:
├── Etsy: 187 referrals
├── jonesleather.com: 43 referrals
└── Square: 12 referrals
Total: 242 customers sent to your other shops
```

This is not altruism. It is a *competitive advantage*. No other marketplace can show a creator this number — because no other marketplace is willing to generate it.

### Why Creators Choose Both

A creator who sells on Etsy and Liana Banyan gets two different things:

**From Etsy**: Massive traffic. Search visibility. A marketplace of millions.

**From Liana Banyan**: Community backing. Design Democracy votes on their next product. Cooperative purchasing that reduces material costs. Treasure Maps that plan their business. And Bridges that send Liana Banyan customers to their Etsy shop.

The cooperative is not trying to replace Etsy. It is trying to make Etsy work better for the creator — while also providing things Etsy cannot: democratic governance, community investment, cooperative economics, and transparent pricing.

### The Outbound Commerce Model

Innovation #1954 formalized this as the Outbound Commerce Bridge — a platform architecture where marketplace revenue comes from production and membership, not from capturing transactions. The model makes traffic export structurally aligned with the platform's interests rather than structurally opposed.

This only works because of Cost+20%. If the cooperative charged sales commissions, every Bridge click would be lost revenue. But because the cooperative charges on *production* (when it manufactures, ships, or processes), a customer who buys the same product on Etsy instead of on the cooperative represents no revenue loss — the cooperative never processed that production anyway.

The Bridge turns a competitor's sale into a relationship-building event. The creator sees the cooperative helping them, not trapping them. And the cooperative's honest pitch becomes: "We make money when we help you make things. Not when we stand between you and your customers."

---

*Pudding #53 — The Bridge*
*Bishop B061 | April 2, 2026*
*~900 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  53,
  'The Bridge',
  'the-bridge',
  'Why a cooperative marketplace sends your customers to your competitors.',
  'pudding-53-the-bridge',
  900,
  ARRAY['bridge', 'outbound-commerce', 'traffic-export', 'creator-economics', 'walled-garden'],
  ARRAY['1954']::text[],
  'bishop',
  'draft'
);
```
