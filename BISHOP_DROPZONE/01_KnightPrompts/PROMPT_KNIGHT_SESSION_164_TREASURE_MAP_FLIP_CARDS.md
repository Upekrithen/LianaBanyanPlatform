# Knight Session 164 — Treasure Map Flip Cards + Cephas DB Safety + Local Directory

**Priority:** HIGH
**Dispatched by:** Bishop (Foreman) B044 | **Date:** March 29, 2026
**Estimated scope:** Full session
**Prerequisite:** K162 complete (confirmed deployed)

---

## TASK 1: Cephas Content Registry — Database Safety Migration

All pudding articles MUST be in the `cephas_content_registry` table with full `content_markdown` so they survive any file-level incident. Create migration:

```sql
-- Migration: 20260329XXXXXX_cephas_pudding_safety_insert.sql
```

Read each of these 10 files from BISHOP_DROPZONE and INSERT with full content_markdown:

| File | Slug | Category |
|------|------|----------|
| CEPHAS_PUDDING_THREE_CURRENCY_INTRO.md | three-currencies | how-it-works |
| CEPHAS_PUDDING_CAPTAIN_SYSTEM.md | captain-system | how-it-works |
| CEPHAS_PUDDING_COLD_START_HUB.md | cold-start-hub | getting-started |
| CEPHAS_PUDDING_MONEYPENNY_RECEPTIONIST.md | moneypenny-receptionist | platform-tools |
| CEPHAS_PUDDING_LB_CARD.md | lb-card | how-it-works |
| CEPHAS_PUDDING_GUEST_MARKS_WALLET.md | guest-marks-wallet | getting-started |
| CEPHAS_PUDDING_PATHFINDER_JOURNAL.md | pathfinder-journal | platform-tools |
| CEPHAS_PUDDING_MARKS_PAYBACK.md | marks-payback | how-it-works |
| CEPHAS_PUDDING_BACKER_ELECTION.md | backer-election | how-it-works |
| CEPHAS_PUDDING_GHOST_WORLD.md | ghost-world | platform-features |

Use `ON CONFLICT (slug) DO UPDATE SET content_markdown = EXCLUDED.content_markdown`. Also verify existing pudding articles are present (battery-dispatch, roommate-accountability, currency-differential, more-than-me, lifeline-medications, anticipated-critiques, youre-in-charge-of-you).

---

## TASK 2: Treasure Map Deck Cards — Flip to Red Carpet

**Current state:** `platform/src/pages/TreasureMaps.tsx` — 8 static shadcn Cards, hardcoded data.
**Existing flip components:** `DeckCard.tsx` (3D flip), `PortalDeckCard.tsx` (hover/tap flip).

### The Concept

Each Treasure Map card is a DECK CARD. It flips.

**FRONT** = what we have now (keep it, add "Tap to flip" hint).

**BACK** = the Member's Red Carpet. This is NOT showing what the restaurant will see. This is showing the MEMBER what THEIR business opportunity looks like — the same way a restaurant's Cue Card shows the restaurant THEIR opportunity.

Both the Member's card and the Restaurant's Cue Card follow the same pattern:
1. Mini business plan (how YOU make money from this)
2. What the economics look like for YOU
3. What you need to get started
4. A preview of the tools you'll use (including the pitch card you'll hand to partners)

The Member reading the Treasure Map flip card should feel exactly what the restaurant owner feels reading a Cue Card: "This makes sense. I should do this."

### BACK Layout (4 sections, scrollable)

#### Section 1: "Is This For You?"
```
WHO THIS IS FOR:
[1-2 sentences describing the ideal person]

WHAT YOU NEED:
• [3-4 bullet items]

MONTHLY POTENTIAL: $X–$Y
```

#### Section 2: "Your Mini Business Plan"
Collapsed by default, expandable. 3-5 bullets showing the economics:
- Starting point (1 shop, 1 route)
- Per-unit economics ($8-12 per delivery)
- Weekly math (5 deliveries × 5 days = $200-300/week)
- Growth path (scale to 3 shops, add subscription)

#### Section 3: "Your Pitch Preview"
Two sub-parts:

**A) What YOU will carry:** A thumbnail preview of the Cue Card the member will hand to businesses. Use sample data — specifically, use the Founder's target restaurant as the example. Until Seeders customize these, show sample data that gives a realistic feel:
- Business name: [Sample Restaurant Name]
- QR code (placeholder)
- "Scan to see pre-order demand in your area"
- Sample metrics: "12 orders waiting this week | Est. $480/week revenue"

**B) Local Directory Preview:** A mini-view of what's already nearby — available meal sources, restaurants, food pantries, charitable resources, and other nodes. This is a LISTING (directory), not advertising:
- Sorted by proximity
- Equal format for all entries (commercial and charitable)
- No paid placement, no boosting
- Shows usage metrics to the listed entity (how many views, when) so they can maintain their listing

This is like a phone book, not an ad platform. Include a small "See what's near you" preview showing 2-3 sample entries.

**Legal note (Bishop ruling):** This is a cooperative DIRECTORY, not advertising. Entries are neutral listings with equal format. Usage analytics shown to listed entities are business intelligence, not ad metrics. No FTC advertising disclosure required. The inclusion of charitable/food pantry listings alongside commercial restaurants reinforces the community resource guide character.

#### Section 4: Action Buttons
```
[ ← Back ]     [ More Details ]     [ Get Started → ]
```
- **Back** — flips to front
- **More Details** — navigates to `/treasure-maps/:mapId`
- **Get Started** — navigates to `/treasure-maps/:mapId?action=start`

### Card Back Content — All 8 Maps

#### 1. Breakfast Runner — The Donut Run
- **Who:** Early risers, parents after school drop-off, anyone with free mornings
- **Need:** Car/bike + insulated bag, smartphone, 2-3 hours before 9 AM
- **Potential:** $500–$1,500/month (delivery fees)
- **Plan:** 1 bakery → 5 stops → $8-12/delivery → 5 deliveries × 5 days = $200-300/week
- **Pitch Preview:** Bakery Cue Card with sample data — "Fresh pastries delivered before your customers arrive"

#### 2. Lunch Runner — The Office Feed
- **Who:** Midday availability, students between classes, remote workers wanting structure
- **Need:** Car + insulated bag, smartphone, 3 hours around noon
- **Potential:** $800–$2,000/month (delivery fees)
- **Plan:** 1 restaurant → 10 office pre-orders → $10-15/delivery → scale to 3 restaurants
- **Pitch Preview:** Restaurant Cue Card — "10 pre-orders by 10 AM, delivered by noon"

#### 3. Taco Truck Circuit — Skip-the-Line
- **Who:** Foodies who know the truck schedule, neighborhood connectors
- **Need:** Car, smartphone, knowledge of local food truck locations
- **Potential:** $600–$1,500/month
- **Plan:** Map 3 trucks → pre-order skip-the-line → 15% of order value → scale routes
- **Pitch Preview:** Truck Cue Card — "Pre-orders = no wait, your food reaches desks hot"

#### 4. Catering Coordinator — Big Orders, Big Margins
- **Who:** Organized, former event planners, detail-oriented
- **Need:** Car/van, smartphone, calendar discipline
- **Potential:** $1,200–$3,000/month
- **Plan:** 1 corporate account → weekly catering → $50-100/order fee → scale to 5 accounts
- **Pitch Preview:** Business Cue Card — "Guaranteed weekly volume, Cost+20%, one contact"

#### 5. Grocery Runner — The Pantry Path
- **Who:** Efficient shoppers, people who already grocery shop for family
- **Need:** Car, insulated bags (hot + cold), smartphone, 3-4 hours
- **Potential:** $700–$1,800/month
- **Plan:** 5 households → weekly runs → $15-25/run → add subscription tiers
- **Pitch Preview:** Savings comparison — 83.3% to store vs 70% on Instacart/DoorDash

#### 6. Service Runner — Beyond Food
- **Who:** Handyperson, cleaner, tutor, pet sitter — anyone with a marketable skill
- **Need:** Existing tools/skills, smartphone, willingness to show up
- **Potential:** $800–$2,500/month (varies by skill)
- **Plan:** List 1 service → set rate → 3 first clients → earn Marks → volume pricing
- **Pitch Preview:** Service listing preview — clean, professional, cooperative pricing

#### 7. Seeder/Presenter — The Bounty Scout
- **Who:** Social people, community connectors, people who love talking about ideas
- **Need:** Smartphone, enthusiasm, willingness to attend local events
- **Potential:** XP + Marks + Steward income path
- **Plan:** 1 event → present LB → earn Seed Marks → 5 signups = Steward candidate
- **Pitch Preview:** Presentation deck thumbnail — "This is what you'll show"

#### 8. LB Designer — Creative Services Engine
- **Who:** Graphic designers, artists, crafters, anyone with visual skills
- **Need:** Design software (even Canva), portfolio of 3+ samples
- **Potential:** $500–$5,000/month
- **Plan:** 1 contest → win → earn Marks → hired for Cue Cards/Deck Cards → Designer Guild
- **Pitch Preview:** Sample Cue Card the designer would create

### Data Structure

Expand the existing `TreasureMap` interface in `TreasureMaps.tsx`:

```typescript
interface TreasureMapCard {
  // Existing
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  description: string;
  startupCost: string;
  monthlyEstimate: string;
  firstDollar: string;
  innovationRange: string;
  levels: { title: string; description: string }[];
  
  // NEW — card back
  whoThisIsFor: string;
  whatYouNeed: string[];
  monthlyPotential: string;
  miniBusinessPlan: string[];
  pitchPreview: {
    businessType: string;
    tagline: string;
    sampleMetric: string;
    sampleRevenue: string;
  };
}
```

### Flip Animation
Use `DeckCard.tsx` or `PortalDeckCard.tsx` pattern. Desktop: hover or click to flip. Mobile: tap to flip. Back must be scrollable within card frame. Buttons sticky at bottom.

### Demand Signals
Keep `useDemandSignals()` on the FRONT. These are real-time earmarked credits showing actual demand.

---

## TASK 3: Local Resource Directory Component (Foundation)

Create a lightweight `LocalDirectory` component that can be embedded as a preview on the Treasure Map card backs and eventually used standalone.

```typescript
// platform/src/components/LocalDirectory.tsx
interface DirectoryEntry {
  name: string;
  type: 'restaurant' | 'food_pantry' | 'charitable' | 'node' | 'service';
  distance: string;  // "0.3 mi"
  description: string;
  views_this_week?: number;
}
```

For now, this can use hardcoded sample data showing 3-4 entries of mixed types (restaurant + food pantry + node). The preview on the card back just shows "See what's near you" with a few entries to give the member a sense of what the local ecosystem looks like.

**This is a LISTING, not advertising.** Equal format. No paid placement. No boost. Usage analytics are shown to the listed entity as business intelligence, not ad metrics.

---

## VERIFICATION

- [ ] All 8 cards flip correctly (desktop + mobile)
- [ ] Back shows: Who, What You Need, Potential, Mini Plan, Pitch Preview, Buttons
- [ ] Cephas content registry has all 17 pudding articles with full content_markdown
- [ ] Build succeeds
- [ ] Deploy to hosting:main + push migration

---

## DO NOT
- Do not remove front card content — enhance, don't replace
- Do not make Cue Card previews functional — visual preview only
- Do not charge for directory placement — it's a neutral listing
- Do not use persuasive/comparative language in directory entries
- 83.3% is exact — never rounded
- Entity: Liana Banyan Corporation, EIN 41-2797446, Wyoming C-Corp

---

## FILES TO READ
1. `platform/src/pages/TreasureMaps.tsx`
2. `platform/src/components/DeckCard.tsx`
3. `platform/src/components/PortalDeckCard.tsx`
4. `platform/src/data/treasureMapGuides.ts`
5. `platform/src/pages/tools/CueCardGenerator.tsx`
6. All `BISHOP_DROPZONE/CEPHAS_PUDDING_*.md` files

---

*Dispatched by Bishop (Foreman), Session B044*
*FOR THE KEEP!*
