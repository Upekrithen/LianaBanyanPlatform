# Pudding #68: The Cooperative Purchasing

*What if 500 families buying rice together paid what restaurants pay?*

---

## At a Glance

You buy rice at the grocery store. $1.50 a pound. The restaurant down the street buys rice from a distributor. $0.75 a pound. Same rice. Half the price. The difference is volume.

What if your family bought rice with 499 other families — and got the restaurant price?

That is Cooperative Purchasing.

---

## More Info

### The Volume Discount You Cannot Access

Wholesale pricing exists for everyone who buys in bulk. Restaurants, hotels, hospitals, schools — they all buy at prices 30-60% below retail. The prices are not secret. They are not special. They are just for buyers who order in quantity.

A single family cannot order a pallet of rice. They have nowhere to store it. They cannot use it before it goes stale. The volume discount is structurally inaccessible to individual households — not because someone is hoarding it, but because the logistics do not work at household scale.

### How Cooperative Purchasing Works

The cooperative aggregates household demand into wholesale-scale orders.

1. **Members indicate what they need.** Through the platform, members in a geographic area say: "I need 10 pounds of rice this month." "I need 5 pounds of flour." "I need a case of canned tomatoes."

2. **The cooperative aggregates orders.** When enough members in an area need the same product, the total reaches wholesale minimums. Five hundred families each needing 10 pounds of rice = 5,000 pounds. That is a wholesale order.

3. **The cooperative places the order.** At wholesale price. The cooperative adds Cost+20%. Rice that costs $0.75/pound wholesale becomes $0.90/pound to the member. Still 40% below retail.

4. **Distribution happens locally.** The order is delivered to a Captain's location, a community center, a participating restaurant, or a Pioneer Node. Members pick up their share. No last-mile delivery cost. No warehouse. No cold chain.

### The Math

| Item | Retail | Wholesale | Co-op (Cost+20%) | Member Savings |
|------|--------|-----------|-------------------|---------------|
| Rice (per lb) | $1.50 | $0.75 | $0.90 | 40% |
| Flour (per lb) | $0.80 | $0.40 | $0.48 | 40% |
| Olive oil (per liter) | $8.00 | $4.50 | $5.40 | 33% |
| Canned tomatoes (case) | $18.00 | $9.00 | $10.80 | 40% |

A family spending $600/month on groceries might spend $400 through Cooperative Purchasing. That is $2,400/year in savings — from a $5 membership.

---

## Full Detail

### Why Not Just Join Costco?

Costco is a buying club. So is Cooperative Purchasing. The differences:

**Costco requires a $65/year membership.** The cooperative requires $5/year. That is $60/year the cooperative saves you before you buy a single item.

**Costco requires you to buy in Costco quantities.** A family of two does not need 48 rolls of toilet paper. Cooperative Purchasing splits bulk orders into household quantities. You get the wholesale price without the warehouse storage problem.

**Costco keeps the margin.** Costco's operating margin is about 3.4% — but that is on top of a markup that already exceeds their wholesale cost. The cooperative's margin is Cost+20% of its *actual* cost — the wholesale price plus logistics. The cooperative's total markup is lower because it is not trying to generate profit for shareholders.

**Costco is a corporation.** You have no say in what Costco stocks, how it operates, or where your money goes. In the cooperative, you vote on what gets ordered, where distribution points are located, and how the food network operates in your area.

### The Captain's Food Network

Cooperative Purchasing does not run itself. It needs someone to coordinate orders, manage distribution points, and build relationships with wholesale suppliers. That person is the geographic Captain.

A Captain's food network responsibilities:
- Aggregate member orders in their area
- Identify local distribution points (community centers, churches, Captain's own garage)
- Build relationships with regional wholesale distributors
- Ensure quality and freshness
- Coordinate pickup schedules

The Captain does not get paid for this. They benefit from the same wholesale prices as every other member — plus the Marks they earn for community leadership.

### Beyond Groceries

Cooperative Purchasing is not limited to food. The same aggregation model works for:

- **Building materials** — Fifty members renovating kitchens buy lumber at contractor prices
- **Craft supplies** — A hundred leather crafters buy hide at tannery prices
- **Office supplies** — The cooperative's home businesses buy paper and ink at corporate volume discounts
- **Fuel** — Members in rural areas aggregate fuel purchases for fleet pricing

Any product where volume unlocks a lower price is a candidate for Cooperative Purchasing. The cooperative is a buying club that operates across every category its members need.

### The Relationship to Mission ONE

Cooperative Purchasing and Mission ONE (surplus food recovery) are two layers of the same food security strategy:

- **Mission ONE** handles *tonight* — surplus meals from local restaurants, available now, at deep discount
- **Cooperative Purchasing** handles *this week* — wholesale groceries, ordered in advance, picked up at a distribution point

Together, they cover both emergency food access (tonight) and structural food affordability (ongoing). A family using both systems can dramatically reduce their food costs while eating well — fresh restaurant surplus and wholesale staples, all at Cost+20%.

---

*Pudding #68 — The Cooperative Purchasing*
*Bishop B061 | April 2, 2026*
*~850 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  68,
  'The Cooperative Purchasing',
  'the-cooperative-purchasing',
  'What if 500 families buying rice together paid what restaurants pay?',
  'pudding-68-the-cooperative-purchasing',
  850,
  ARRAY['cooperative-purchasing', 'wholesale', 'food-security', 'volume-discount', 'captain'],
  ARRAY['2111']::text[],
  'bishop',
  'draft'
);
```
