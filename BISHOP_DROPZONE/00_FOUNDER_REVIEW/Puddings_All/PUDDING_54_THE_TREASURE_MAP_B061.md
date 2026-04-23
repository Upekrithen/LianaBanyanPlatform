# Pudding #54: The Treasure Map

*What if your business plan fit on one page and updated itself?*

---

## At a Glance

Business plans are documents people write to get money from investors. They are long, stale the moment they are finished, and designed to impress someone who is not going to do the work.

Treasure Maps are the opposite. They are short, living, and designed for the person doing the work — you.

---

## More Info

### The Business Plan Problem

A traditional business plan has sections like "Executive Summary," "Market Analysis," "Financial Projections," and "Exit Strategy." It is written in the third person. It assumes the reader is an investor deciding whether to hand over money.

A cooperative member starting a leather business does not need an exit strategy. They are not exiting. They are building something to sustain themselves and their community. They do not need a market analysis written in MBA-speak. They need to know: what do I buy, what do I make, what does it cost, who wants it, and how do I get it to them?

That is a Treasure Map.

### What a Treasure Map Looks Like

Each Treasure Map is specific to a craft. A leather crafter's Treasure Map is different from a terrain maker's, which is different from a food vendor's. But they all follow the same structure:

**Step 1: Materials.** What you need to start. Specific products, specific prices, specific links to where to buy them. Not "you'll need some supplies." Actual supplies. "Tandy Leather side, $80. Stitching groover, $12. Thread, $8."

**Step 2: Create Your First Piece.** Not "develop your product line." Make one thing. The Map tells you what to make first based on what sells best for your craft on the platform.

**Step 3: Set Up Your Project.** The Turn-Key Template pre-fills your project page. You add photos and a description. The pricing engine calculates your Cost+20% price automatically.

**Step 4: Get Your First Backers.** The Map connects you to the Cue Card system — a shareable card that explains what you make in 15 seconds. Share the Cue Card. Get your first five backers.

**Step 5: Scale.** The Map shows you what happens at each tier: 50 backers, 500 backers, 5,000 backers. Different production methods at each tier. Different economics. The Map does the math for you.

### The Living Document

Here is what makes a Treasure Map different from a business plan: it updates.

When you complete Step 1, the Map checks it off and highlights Step 2. When you get your first backer, the Map updates your economics panel with real numbers — not projections. When you hit 50 backers, the Map shows you the next production tier and what changes.

Your progress persists across sessions. Close your laptop, come back tomorrow — the Map knows where you left off. It is not a document you wrote once. It is a dashboard that tracks your journey.

---

## Full Detail

### The Economics Panel

Every Treasure Map includes a craft-specific economics panel that shows real numbers:

```
Your Economics (Leather Crafting)
├── Startup cost: $200-800
├── Time to first sale: 3-4 weeks
├── At 50 backers: ~$500/month
├── At 500 backers: ~$3,000/month
├── At 5,000 backers: ~$15,000/month
│
│ ████████░░ Step 3 of 5
│ Next: Set up your Turn-Key Project →
```

These numbers are not generic. They are calculated from:
- Your specific craft's material costs
- The Cost+20% pricing model at each tier
- Real production data from the cooperative's manufacturing network
- The Matched-Fund Tiered Production Cascade — which means at higher tiers, community backing multiplies your funding

### Why Craft-Specific Matters

A generic "start a business" guide says "research your market." A leather crafter's Treasure Map says "the most popular first project on this platform is a hand-stitched card wallet. Here are three tutorials. Here is the leather. It costs $12 in materials and sells for $35."

The specificity is the point. A person who has never started a business does not know what they do not know. They need someone to say: "Start here. Make this. It works." The Treasure Map is that someone.

### The Adaptive Router

Not every member starts at Step 1. If you are already selling on Etsy, you have materials and product — you do not need Steps 1 and 2. The Adaptive Experience-Gated Onboarding Router (Innovation #1951) asks you three questions when you start:

1. What do you want to do? (Sell / Buy / Support / Manufacture / Explore)
2. What is your craft? (Leather / Terrain / Food / Digital / Other)
3. Where are you in your journey? (Just an idea / Making things / Already selling)

If you answer "Already selling," the Map skips to Step 3. You are not forced through beginner content. You start where you actually are.

### Treasure Maps as Cold Start Tools

For the cooperative, every Treasure Map is a Cold Start solution. A new member who follows a Treasure Map to Step 4 has: materials, a product, a project page, a Cue Card, and five backers. That is a functioning micro-business inside the cooperative — in weeks, not months.

Multiply by a hundred members following Treasure Maps simultaneously, and you have a hundred new micro-businesses generating transactions, creating demand for materials, and building the economic activity that sustains the cooperative.

The Treasure Map does not just help the individual member. It builds the cooperative's economy, one completed step at a time.

---

*Pudding #54 — The Treasure Map*
*Bishop B061 | April 2, 2026*
*~950 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  54,
  'The Treasure Map',
  'the-treasure-map',
  'What if your business plan fit on one page and updated itself?',
  'pudding-54-the-treasure-map',
  950,
  ARRAY['treasure-map', 'onboarding', 'business-plan', 'cold-start', 'craft-specific'],
  ARRAY['1946', '1951', '1952']::text[],
  'bishop',
  'draft'
);
```
