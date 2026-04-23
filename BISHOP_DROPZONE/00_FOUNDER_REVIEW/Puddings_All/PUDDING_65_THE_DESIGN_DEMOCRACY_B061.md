# Pudding #65: The Design Democracy

*What if the people who buy the product got to vote on what it looks like?*

---

## At a Glance

A leather crafter wants to make a new wallet. They have three designs. On Etsy, they pick one, make it, list it, and hope it sells. On Liana Banyan, they post all three designs. The community votes. The winning design gets manufactured.

The crafter knows what to make before making it. The community gets a product they actually chose. Nobody wasted time or materials on a design nobody wanted.

That is Design Democracy.

---

## More Info

### The Design Lottery

In traditional manufacturing, designers guess what customers want. Sometimes they guess right. Mostly they do not. The average consumer product has a failure rate of 80-95% depending on the category. That means for every product that succeeds, four to nineteen products were designed, prototyped, manufactured, marketed, and failed.

Each failure represents wasted materials, wasted time, wasted money, and wasted human creativity. The designer who spent six months on a failed product does not get those months back.

### How Design Democracy Works

1. **A creator submits designs.** Multiple options — two, three, five. Each design includes a rendering or photo, a materials list, an estimated price at Cost+20%, and a production timeline.

2. **Members vote.** Each member gets one vote. Votes are weighted by Marks (reputation) — a member with 5,000 Marks has a 2x multiplier. This means members who have contributed more to the cooperative have more influence on what gets made, but every member's voice counts.

3. **The vote closes.** After a defined period (typically 7-14 days), the winning design is declared. The creator now has a mandate: make this.

4. **Production begins.** The winning design enters the Tiered Production Cascade. Members who voted for it get first access. Ghost World pre-orders convert to real orders. The creator manufactures with confidence.

5. **Losing designs are not wasted.** They go back to Ghost World status. If enough members later express interest, a losing design can be revived for a future production run.

### Why Voting Matters

Voting is not just market research. It is democratic participation in the cooperative's production decisions. When you vote for a wallet design, you are exercising governance — the same kind of governance that determines which initiatives get funded, which Captains lead your area, and how the cooperative evolves.

Design Democracy treats product design as a community decision, not a corporate one. The community that will buy the product has a direct say in what it looks like. This is not a focus group. It is an election.

---

## Full Detail

### The Mark Multiplier

Not all votes are equal. Members with higher Mark totals have higher voting multipliers:

| Mark Level | Multiplier |
|-----------|-----------|
| 0-99 (Seedling) | 1x |
| 100-499 (Sprout) | 1x |
| 500-999 (Sapling) | 1x |
| 1,000-4,999 (Tree) | 1.5x |
| 5,000-9,999 (Grove) | 2x |
| 10,000+ (Forest) | 3x |

This is not plutocracy — you cannot buy Marks. You earn them through contribution. A member who has completed bounties, backed projects, recruited members, and participated in governance has more influence over design decisions than a member who joined yesterday. This reflects their deeper investment in the cooperative, not their wealth.

### The Production Cascade Connection

Design Democracy feeds directly into the Tiered Production Cascade. When a design wins:

- **Tier 1 (1-49 backers):** Creator makes them by hand. One at a time.
- **Tier 2 (50-499 backers):** Small batch production. Pioneer Nodes may assist.
- **Tier 3 (500-4,999 backers):** Full production run. Multiple Nodes. Cooperative Purchasing for materials.
- **Tier 4 (5,000+ backers):** Scale manufacturing. The design has proven itself through democratic validation and market performance.

Each tier unlocks because demand — real, voted, backed demand — justified the investment. No tier is reached by guessing.

### Design Democracy as Innovation Filter

The cooperative produces over 2,100 innovations. Not all of them should be built immediately. Design Democracy is the filter that determines sequencing.

When two innovations compete for the same production slot, the community votes. The one with more support gets built first. The other waits. This ensures the cooperative's limited manufacturing capacity is allocated to the products members actually want — not to the products a product manager thought they should want.

### The Anti-Committee

Design by committee is a well-known failure mode. Committees compromise. They smooth edges. They produce products that offend nobody and inspire nobody.

Design Democracy is not a committee. It is an election. One design wins. The others lose. There is no compromise version. The creator submits three distinct options, and the community picks one. The winning design is exactly what the creator envisioned — it just happens to be the version the community preferred.

The creator's expertise is in designing options. The community's wisdom is in choosing among them. Neither is subordinate to the other. The creator would never make a design they are not proud of. The community would never vote for a design they do not want. The intersection is a product that is both well-designed and well-chosen.

---

*Pudding #65 — The Design Democracy*
*Bishop B061 | April 2, 2026*
*~850 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  65,
  'The Design Democracy',
  'the-design-democracy',
  'What if the people who buy the product got to vote on what it looks like?',
  'pudding-65-the-design-democracy',
  850,
  ARRAY['design-democracy', 'voting', 'production-cascade', 'marks', 'community-governance'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
