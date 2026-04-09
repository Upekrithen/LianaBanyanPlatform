# Knight Session 164 — Treasure Map Flip Cards + Bounty Indicators + Local Directory

**Priority:** HIGH
**Dispatched by:** Bishop (Foreman) B045 | **Date:** March 29, 2026
**Updated from:** B044 version (Task 1 redundancy removed — K163 already handled DB seeding)
**Estimated scope:** Full session
**Prerequisite:** K163 complete (confirmed deployed — 10 pudding articles in DB + Hugo + all 8 targets)
**Next migration:** 20260329000012

---

## TASK 1: Verify Older Pudding Articles in DB (Quick Check)

K163 already seeded all 10 NEW pudding articles with full `content_markdown`. This task is now VERIFICATION ONLY.

Check that these 7 OLDER pudding articles also have full `content_markdown` in `cephas_content_registry`:
- battery-dispatch
- roommate-accountability
- currency-differential
- more-than-me
- lifeline-medications
- anticipated-critiques
- youre-in-charge-of-you

If any are missing `content_markdown`, backfill them from their Hugo source files. If all 17 are present, move on. This should take 5 minutes, not a full task.

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
* [3-4 bullet items]

MONTHLY POTENTIAL: $X-$Y
```

#### Section 2: "Your Mini Business Plan"
Collapsed by default, expandable. 3-5 bullets showing the economics:
- Starting point (1 shop, 1 route)
- Per-unit economics ($8-12 per delivery)
- Weekly math (5 deliveries x 5 days = $200-300/week)
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
[ <- Back ]     [ More Details ]     [ Get Started -> ]
```
- **Back** — flips to front
- **More Details** — navigates to `/treasure-maps/:mapId`
- **Get Started** — navigates to `/treasure-maps/:mapId?action=start`

### Card Back Content — All 8 Maps

#### 1. Breakfast Runner — The Donut Run
- **Who:** Early risers, parents after school drop-off, anyone with free mornings
- **Need:** Car/bike + insulated bag, smartphone, 2-3 hours before 9 AM
- **Potential:** $500-$1,500/month (delivery fees)
- **Plan:** 1 bakery -> 5 stops -> $8-12/delivery -> 5 deliveries x 5 days = $200-300/week
- **Pitch Preview:** Bakery Cue Card with sample data — "Fresh pastries delivered before your customers arrive"

#### 2. Lunch Runner — The Office Feed
- **Who:** Midday availability, students between classes, remote workers wanting structure
- **Need:** Car + insulated bag, smartphone, 3 hours around noon
- **Potential:** $800-$2,000/month (delivery fees)
- **Plan:** 1 restaurant -> 10 office pre-orders -> $10-15/delivery -> scale to 3 restaurants
- **Pitch Preview:** Restaurant Cue Card — "10 pre-orders by 10 AM, delivered by noon"

#### 3. Taco Truck Circuit — Skip-the-Line
- **Who:** Foodies who know the truck schedule, neighborhood connectors
- **Need:** Car, smartphone, knowledge of local food truck locations
- **Potential:** $600-$1,500/month
- **Plan:** Map 3 trucks -> pre-order skip-the-line -> 15% of order value -> scale routes
- **Pitch Preview:** Truck Cue Card — "Pre-orders = no wait, your food reaches desks hot"

#### 4. Catering Coordinator — Big Orders, Big Margins
- **Who:** Organized, former event planners, detail-oriented
- **Need:** Car/van, smartphone, calendar discipline
- **Potential:** $1,200-$3,000/month
- **Plan:** 1 corporate account -> weekly catering -> $50-100/order fee -> scale to 5 accounts
- **Pitch Preview:** Business Cue Card — "Guaranteed weekly volume, Cost+20%, one contact"

#### 5. Grocery Runner — The Pantry Path
- **Who:** Efficient shoppers, people who already grocery shop for family
- **Need:** Car, insulated bags (hot + cold), smartphone, 3-4 hours
- **Potential:** $700-$1,800/month
- **Plan:** 5 households -> weekly runs -> $15-25/run -> add subscription tiers
- **Pitch Preview:** Savings comparison — 83.3% to store vs 70% on Instacart/DoorDash

#### 6. Service Runner — Beyond Food
- **Who:** Handyperson, cleaner, tutor, pet sitter — anyone with a marketable skill
- **Need:** Existing tools/skills, smartphone, willingness to show up
- **Potential:** $800-$2,500/month (varies by skill)
- **Plan:** List 1 service -> set rate -> 3 first clients -> earn Marks -> volume pricing
- **Pitch Preview:** Service listing preview — clean, professional, cooperative pricing

#### 7. Seeder/Presenter — The Bounty Scout
- **Who:** Social people, community connectors, people who love talking about ideas
- **Need:** Smartphone, enthusiasm, willingness to attend local events
- **Potential:** XP + Marks + Steward income path
- **Plan:** 1 event -> present LB -> earn Seed Marks -> 5 signups = Steward candidate
- **Pitch Preview:** Presentation deck thumbnail — "This is what you'll show"

#### 8. LB Designer — Creative Services Engine
- **Who:** Graphic designers, artists, crafters, anyone with visual skills
- **Need:** Design software (even Canva), portfolio of 3+ samples
- **Potential:** $500-$5,000/month
- **Plan:** 1 contest -> win -> earn Marks -> hired for Cue Cards/Deck Cards -> Designer Guild
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

## TASK 3: Bounty Poster Indicators on Deck Cards + Shadow Marks for Data Population

(From B044 Addendum — incorporated directly into this prompt)

### Concept: Every Data-Filling Task Is a Bounty

The Local Directory, Treasure Map data, Cue Card content, and any other user-populatable data should tie into the existing Shadow Marks reward system. When members populate, verify, or update cooperative data, they earn Marks on a decreasing scarcity curve.

### Reward Tiers (Generalize shadowMarksService.ts)

| Data Fill Level | Originator Reward | Confirmer Reward | Updater Reward |
|----------------|-------------------|------------------|----------------|
| EMPTY (0 entries) | 50 Marks | — | — |
| SPARSE (1-4) | 30 Marks | 15 Marks | 25 Marks |
| GROWING (5-9) | 15 Marks | 8 Marks | 15 Marks |
| ESTABLISHED (10-19) | 5 Marks | 3 Marks | 5 Marks |
| FULL (20+) | 0 (standard) | 1 Mark | 3 Marks |

**Key rules:**
- **Originator** = first person to add a listing. Highest reward.
- **Confirmer** = verifies existing listing is accurate. First confirmer > 10th confirmer.
- **Updater** = notices something changed and updates it. Treated as new origination for changed field.
- Confirmation still counts at FULL — "if you did the work, you deserve benefit."

### Applies To ALL Data Types

| Data Type | Originator Example | Confirmer Example |
|-----------|-------------------|-------------------|
| Local Directory listings | Add a restaurant or food pantry | Verify it's still open |
| Treasure Map local data | Identify a bakery for route | Confirm it accepts pre-orders |
| Cue Card content | Create a Cue Card for business | Verify QR code works |
| Ghost World storefronts | Set up a storefront listing | Confirm products/prices |
| Cephas resource links | Add a helpful link to article | Verify link still works |

### UI: Bounty Poster Indicator

Every Deck Card with active bounties shows a small badge:
- Small scroll/poster icon (amber/gold)
- Tooltip: "Bounties available — earn Marks by contributing data"
- Shows on ANY card where data category is below FULL threshold

```
[amber badge] 50 Marks — Be the first to add this!     (EMPTY)
[amber badge] 30 Marks — Help fill this out            (SPARSE)
[amber badge] 15 Marks — Almost there                  (GROWING)
[amber badge]  5 Marks — Confirm what's here           (ESTABLISHED)
   [no badge]                                           (FULL)
```

### Implementation: Extend shadowMarksService.ts

```typescript
interface DataBountyCategory {
  table: string;           // 'local_directory', 'storefronts', 'cue_cards'
  scopeField: string;      // 'area_id', 'category', 'map_id'
  scopeValue: string;
}

function getDataBountyTier(entryCount: number): {
  originatorReward: number;
  confirmerReward: number;
  updaterReward: number;
  tierName: string;
}
```

### Database

```sql
CREATE TABLE IF NOT EXISTS data_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES profiles(id),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  contribution_type TEXT NOT NULL, -- 'originate', 'confirm', 'update'
  marks_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_data_contributions_scope 
ON data_contributions(table_name, record_id, contribution_type);
```

---

## TASK 4: Local Resource Directory Component (Foundation)

Create a lightweight `LocalDirectory` component embeddable on Treasure Map card backs and eventually standalone.

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

Hardcoded sample data for now: 3-4 entries of mixed types. "See what's near you" preview.

**This is a LISTING, not advertising.** Equal format. No paid placement. No boost. Usage analytics are business intelligence, not ad metrics.

---

## VERIFICATION

- [ ] All 8 cards flip correctly (desktop + mobile)
- [ ] Back shows: Who, What You Need, Potential, Mini Plan, Pitch Preview, Buttons
- [ ] All 17 pudding articles verified in cephas_content_registry with content_markdown
- [ ] Bounty indicators show on cards with sub-FULL data
- [ ] data_contributions table created
- [ ] Build succeeds
- [ ] Deploy to hosting:main + push migration 20260329000012

---

## DO NOT
- Do not remove front card content — enhance, don't replace
- Do not make Cue Card previews functional — visual preview only
- Do not charge for directory placement — it's a neutral listing
- Do not use persuasive/comparative language in directory entries
- Do not allow bounty gaming — rate-limit contributions per member per day
- 83.3% is exact — never rounded
- Entity: Liana Banyan Corporation, EIN 41-2797446, Wyoming C-Corp

---

## FILES TO READ
1. `platform/src/pages/TreasureMaps.tsx`
2. `platform/src/components/DeckCard.tsx`
3. `platform/src/components/PortalDeckCard.tsx`
4. `platform/src/data/treasureMapGuides.ts`
5. `platform/src/pages/tools/CueCardGenerator.tsx`
6. `platform/src/services/shadowMarksService.ts`

---

*Dispatched by Bishop (Foreman), Session B045 (updated from B044)*
*FOR THE KEEP!*
