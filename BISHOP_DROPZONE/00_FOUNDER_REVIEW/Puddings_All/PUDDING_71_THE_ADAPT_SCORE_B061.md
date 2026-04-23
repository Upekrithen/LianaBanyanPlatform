# Pudding #71: The ADAPT Score

*What if your reputation was portable — and you earned it yourself?*

---

## At a Glance

On Uber, your 4.8 stars mean nothing on Airbnb. On Etsy, your 500 five-star reviews mean nothing on Amazon. Every platform makes you start from zero.

On Liana Banyan, you have one reputation — your ADAPT Score — and it follows you across every domain. Sell leather wallets, drive for Local Wheels, teach a Cooperative Classroom, lead a Wildfire Run. Every contribution feeds the same score. One reputation. Earned once. Portable everywhere.

---

## More Info

### The Reputation Silo Problem

Every platform builds its own reputation system. Uber rates drivers 1-5 stars. Airbnb rates hosts. Etsy counts reviews. LinkedIn tallies endorsements. None of them talk to each other.

This means a person who has spent ten years building trust on one platform starts at zero on every other platform. Their reputation is not theirs — it belongs to the platform. Leave Uber and your 4.9 stars stay behind. Leave Etsy and your 2,000 reviews disappear.

This is not an accident. Platform-specific reputation is a retention tool. The harder it is to leave, the more the platform can extract. Your reputation is a hostage.

### How ADAPT Works

ADAPT stands for the five dimensions the cooperative measures:

- **A — Activity.** How active you are. Transactions, votes, sessions, contributions.
- **D — Dependability.** Do you deliver on time? Do you show up when you said you would? Do your products match their descriptions?
- **A — Accountability.** How do you handle problems? Do you resolve disputes fairly? Do you accept acknowledgment stamps gracefully or escalate everything?
- **P — Participation.** Do you vote in Design Democracy? Do you attend Crew Calls? Do you contribute to initiatives beyond your own business?
- **T — Trust.** How do other members rate their interactions with you? Not just the product — the experience. Communication, professionalism, reliability.

Each dimension is scored independently. Your overall ADAPT Score is a composite — but you can see the breakdown. A member might be high on Activity and low on Participation. The score tells them exactly where to improve.

### One Score, Every Domain

The same ADAPT Score applies whether you are:
- Selling leather wallets on the marketplace
- Driving for Local Wheels
- Teaching a Cooperative Classroom
- Leading a Wildfire Run as Captain
- Manufacturing parts at a Pioneer Node
- Resolving disputes on a Star Chamber panel

Activity in any domain contributes to the same score. A leather crafter who also drives weekends and teaches monthly has three streams feeding their ADAPT Score. The cooperative does not care how you contribute — it cares that you do.

---

## Full Detail

### The Anti-Gaming Design

Most reputation systems can be gamed. Fake reviews on Amazon. Rating swaps on Uber ("I'll give you five stars if you give me five"). Purchased endorsements on LinkedIn.

ADAPT resists gaming through structural design:

**No self-rating.** You cannot rate yourself. Only other members rate their interactions with you.

**Weighted by interaction depth.** A rating from someone who completed a $500 transaction with you counts more than a rating from someone who sent you a message. The deeper the interaction, the more the rating matters.

**Decay over time.** Old ratings gradually lose weight. Your ADAPT Score reflects your *recent* behavior, not something you did three years ago. This means you cannot coast on past reputation — you have to keep showing up.

**Cross-domain verification.** A high ADAPT Score in one domain provides a floor in others. If you are a trusted leather crafter (high Trust, high Dependability), your baseline Trust score when you start driving for Local Wheels is higher than a brand-new member. But it is not the same as your marketplace score — you still need to prove yourself in the new domain.

### ADAPT and Marks

ADAPT Score and Marks are related but different:

- **Marks** are cumulative. They only go up. They represent your total lifetime contribution to the cooperative.
- **ADAPT Score** is dynamic. It can go up or down. It represents your current reliability and trustworthiness.

A member with 10,000 Marks (Forest level, 3x voting multiplier) who has been inactive for six months will have high Marks but a declining ADAPT Score. The Marks recognize what they built. The ADAPT Score reflects whether they are still building.

### Portable Beyond the Cooperative

The cooperative's long-term vision is for the ADAPT Score to be portable beyond Liana Banyan — a reputation credential that other cooperatives, employers, and communities can recognize. A member who moves to a new city and joins a local food cooperative should not start from zero. Their ADAPT Score from Liana Banyan should mean something.

This is not implemented yet. But the architecture is designed for it. The ADAPT Score is calculated from verifiable, auditable actions — not from opaque algorithms. It can be exported as a credential without exposing private transaction data. The member owns their score. The cooperative calculates it. The world can verify it.

That is portable reputation. Earned by you. Owned by you. Useful everywhere.

---

*Pudding #71 — The ADAPT Score*
*Bishop B061 | April 2, 2026*
*~900 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  71,
  'The ADAPT Score',
  'the-adapt-score',
  'What if your reputation was portable — and you earned it yourself?',
  'pudding-71-the-adapt-score',
  900,
  ARRAY['adapt-score', 'reputation', 'portable', 'cross-domain', 'anti-gaming'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
