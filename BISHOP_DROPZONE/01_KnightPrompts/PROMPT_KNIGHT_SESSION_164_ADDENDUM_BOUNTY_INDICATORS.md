# K164 Addendum — Bounty/Lark Indicators on Deck Cards + Shadow Marks for Data Population

**Priority:** Include with K164 main prompt
**Dispatched by:** Bishop (Foreman) B044 | **Date:** March 29, 2026

---

## CONCEPT: Every Data-Filling Task Is a Bounty

The Local Directory, Treasure Map data, Cue Card content, and any other user-populatable data should tie into the existing Shadow Marks reward system. When members populate, verify, or update cooperative data, they earn Marks on a decreasing scarcity curve.

### Reward Tiers (Apply Shadow Marks Pattern)

Use the existing `shadowMarksService.ts` tier logic, generalized beyond recipes:

| Data Fill Level | Originator Reward | Confirmer Reward | Updater Reward |
|----------------|-------------------|------------------|----------------|
| EMPTY (0 entries in category/area) | 50 Marks | — | — |
| SPARSE (1-4 entries) | 30 Marks | 15 Marks | 25 Marks |
| GROWING (5-9 entries) | 15 Marks | 8 Marks | 15 Marks |
| ESTABLISHED (10-19 entries) | 5 Marks | 3 Marks | 5 Marks |
| FULL (20+ entries) | 0 (standard) | 1 Mark | 3 Marks |

**Key rules:**
- **Originator** = first person to add a listing (restaurant, food pantry, node, service). Highest reward because you did the work of discovery.
- **Confirmer** = verifies an existing listing is accurate (still open, hours correct, menu current). Worth something because confirmed data > unconfirmed. First confirmer gets more than 10th confirmer.
- **Updater** = notices something changed and updates it (new hours, closed permanently, menu changed). Treated as new origination for the changed field — because stale data is worse than no data.
- **Confirmation still counts** even at FULL — "if you did the work, you deserve benefit." But being confirmer #256 is 1 Mark, not 50.

### Applies To (Not Just Local Directory)

| Data Type | Originator Example | Confirmer Example |
|-----------|-------------------|-------------------|
| Local Directory listings | Add a restaurant, food pantry, or service | Verify it's still open, hours are right |
| Treasure Map local data | Identify a bakery for Breakfast Runner route | Confirm the bakery accepts pre-orders |
| Cue Card content | Create a Cue Card for a new business | Verify the QR code works, info is current |
| Ghost World storefronts | Set up a new storefront listing | Confirm products/prices are accurate |
| Cephas resource links | Add a helpful link to an article | Verify the link still works |

---

## UI: Bounty Poster Indicator on Deck Cards

### The Sign

Every Deck Card (Treasure Map cards, directory entries, storefronts, cue cards) that has active bounties should display a small **Bounty Poster indicator** — a visual badge near the unlock/action button.

**Design:**
- Small scroll/poster icon (like a wanted poster or quest notice)
- Amber/gold color to stand out without dominating
- Tooltip on hover: "Bounties available — earn Marks by contributing data"
- Shows on ANY card where the underlying data category is below FULL threshold

**Placement:** Near the existing unlock button area on DeckCardFrame / Treasure Map cards. Similar to how demand signals show earmarked credits — but this shows available bounty Marks.

**Example states:**
```
🏷️ 50 Marks — Be the first to add this!     (EMPTY)
🏷️ 30 Marks — Help fill this out            (SPARSE)
🏷️ 15 Marks — Almost there                  (GROWING)
🏷️  5 Marks — Confirm what's here           (ESTABLISHED)
   [no badge]                                 (FULL — no bounty)
```

### Lark vs Bounty Distinction

- **Bounty** = structured task with specific deliverable (add this listing, verify this data)
- **Lark** = spontaneous helpful action that earns Marks (noticed something wrong, fixed it)

Both should trigger the same reward tiers. The indicator badge can say "Bounties & Larks" or just use the scroll icon universally.

---

## IMPLEMENTATION

### Option A: Extend shadowMarksService.ts (Recommended)

Generalize the existing service from recipe-only to any data category:

```typescript
// Extend existing shadowMarksService.ts
interface DataBountyCategory {
  table: string;           // 'local_directory', 'storefronts', 'cue_cards'
  scopeField: string;      // 'area_id', 'category', 'map_id'
  scopeValue: string;      // the specific area/category being checked
}

function getDataBountyTier(entryCount: number): {
  originatorReward: number;
  confirmerReward: number;
  updaterReward: number;
  tierName: string;
}
```

### Option B: New bountyTierService.ts

If Shadow Marks is too recipe-specific to generalize cleanly, create a parallel service that uses the same tier thresholds but works across all data types.

### Database

Add to existing tables or create:
```sql
-- Track who originated/confirmed/updated what
CREATE TABLE IF NOT EXISTS data_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES profiles(id),
  table_name TEXT NOT NULL,        -- 'local_directory', 'storefronts', etc.
  record_id TEXT NOT NULL,         -- the specific record
  contribution_type TEXT NOT NULL, -- 'originate', 'confirm', 'update'
  marks_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for tier calculation
CREATE INDEX idx_data_contributions_scope 
ON data_contributions(table_name, record_id, contribution_type);
```

---

## LEGAL NOTE

Bounty rewards for data population are Marks (cooperative effort currency), not dollars. Members earn Marks for contributing to the cooperative's shared knowledge base. This is labor compensation within the cooperative framework, not payment for user-generated content in the surveillance capitalism sense.

The data contributed (restaurant hours, menu items, service listings) is cooperative property, not individual IP. Members are contributing to a shared resource, not creating content for the platform to monetize.

---

## DO NOT
- Do not pay for directory PLACEMENT (that would make it advertising)
- Do not allow bounty gaming (rate-limit contributions per member per day)
- Do not award Marks for duplicate/spam entries
- 83.3% is exact — never rounded

---

*Dispatched by Bishop (Foreman), Session B044*
*FOR THE KEEP!*
