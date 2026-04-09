# K354: "For Rent" Signs — Every Shelf Advertises the Empty Shelf Next to It
# Priority: CRITICAL — this IS the growth engine
# Bishop: B084 | Date: 2026-04-07
# Related: Innovation #2189 (Steward Director System), #2104 (Cue Card Pioneer Program)

## THE CONCEPT

Every storefront display on the platform should include at least one "FOR RENT" slot that invites new members to open their own shop. The message adapts to context:

- Next to a bookshelf: **"Written a book? Sell it here. $5/year."**
- Next to an apple cart: **"Grow apples? Even in your backyard? Sell them here. $5/year."**
- Next to a photography studio: **"Take photos? Turn them into income. $5/year."**
- Next to a code tool: **"Built something useful? Ship it here. $5/year."**
- Next to a podcast: **"Have a mic and something to say? Broadcast here. $5/year."**

The "$5/year" is the real membership cost. The 6 production levels are the turn-key operation behind the scenes. The member doesn't need to understand production levels — they just see "List it → We handle the rest."

## PHASE 1: ForRentCard Component

Create `platform/src/components/marketplace/ForRentCard.tsx`:

```tsx
interface ForRentCardProps {
  category: string;          // 'food_drink', 'crafts_making', 'digital', 'service', etc.
  contextProduct?: string;   // "apples", "books", "photos" — adapts the pitch
  variant?: 'card' | 'inline' | 'banner';  // Display format
}

// The component renders differently based on variant:
// 'card' — same size as a product card, dashed border, "FOR RENT" header
// 'inline' — slim horizontal strip between product rows
// 'banner' — full-width CTA at bottom of a storefront page
```

### Card Variant (default):
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                         │
│    📦  FOR RENT         │
│                         │
│  [Contextual pitch]     │
│                         │
│  $5/year membership     │
│  You keep 83.3%         │
│  We handle the rest.    │
│                         │
│  [ Start Selling → ]    │
│                         │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Contextual Pitches by Category:

```typescript
const PITCHES: Record<string, { headline: string; subtext: string; emoji: string }> = {
  food_drink: {
    headline: "Cook something people love?",
    subtext: "From your kitchen to their table. Food trucks, home cooks, bakers — your recipes, your prices, your customers.",
    emoji: "🍳",
  },
  crafts_making: {
    headline: "Make things with your hands?",
    subtext: "Leather, wood, pottery, jewelry, candles — if you make it, you can sell it here. No middleman. No percentage to Amazon.",
    emoji: "🪵",
  },
  digital: {
    headline: "Built something useful?",
    subtext: "Code, templates, designs, tools — ship it here. Digital delivery, instant access, you keep 83.3% of every sale.",
    emoji: "💻",
  },
  service: {
    headline: "Have a skill people need?",
    subtext: "Tutoring, repair, consulting, cleaning, photography — name your rate, keep your earnings.",
    emoji: "🔧",
  },
  photography: {
    headline: "Take photos worth sharing?",
    subtext: "Real estate, portraits, events, stock — your lens, your prices. Zero storage fees.",
    emoji: "📸",
  },
  broadcast: {
    headline: "Have an audience?",
    subtext: "Podcast, YouTube, Twitch, Instagram — earn from your audience through cooperative commerce, not ads.",
    emoji: "📡",
  },
  education: {
    headline: "Know something worth teaching?",
    subtext: "Language, music, math, coding — teach from your living room via Zoom. Set your rate. Keep 83.3%.",
    emoji: "📚",
  },
  default: {
    headline: "Have something to offer?",
    subtext: "Whatever you make, grow, teach, fix, or create — there's a shelf here with your name on it.",
    emoji: "✨",
  },
};
```

### The "$5/year + 6 Production Levels" Pitch:

Below the contextual pitch, every ForRentCard shows:

```
$5/year membership. That's it.

Here's what you get:
✓ Your own storefront
✓ You set your prices (Cost+20% floor)
✓ You keep 83.3% of every sale
✓ Production scales automatically (6 levels)
✓ Community pre-orders fund your growth
✓ No inventory risk — sell first, make second

[ Start for $5 → ]
```

The "Start for $5" button routes to:
1. If not logged in → `/join` (membership gate)
2. If logged in → `/tools/storefront-builder` (create your shop)

## PHASE 2: Place ForRentCards Everywhere

### In Storefront Highlights (Marketplace page):
After the real storefront cards, add 1-2 ForRentCards matching the visible categories:
```
[LB Cue Cards] [Montana Makers] [Creator #1] [FOR RENT: Make things?]
```

### In Storefront Detail Pages:
At the bottom of every storefront, show a ForRentCard:
```
Liked what you saw?
[FOR RENT: Have something similar? Open your own shop. $5/year.]
```

### In Product Grids:
Every product grid of 6+ items should have one ForRentCard as the last item:
```
[Product] [Product] [Product]
[Product] [Product] [FOR RENT]
```

### In Search Results:
When searching the marketplace, if results < 6, show a ForRentCard:
```
3 results for "handmade soap"
[Result 1] [Result 2] [Result 3] [FOR RENT: Make soap? Sell it here.]
```

### In Empty States:
When a category has zero listings:
```
No listings in "Musical Instruments" yet.
[FOR RENT: Play music? Sell instruments? Be the first. $5/year.]
```

### In the Cold Start Hub:
Each of the 7 pathways gets a small ForRent reminder:
```
FOOD NODE — Best for cooks & food lovers
"143 food storefronts already open. Yours could be #144."
```

## PHASE 3: Contextual "Does This Sound Like You?" Examples

For key categories, create real examples (anonymized):

### Spanish Teacher (Rosario / MIL):
```
Does this sound like you?
"Maria teaches Spanish from her living room 3 days a week via Zoom.
She charges $25/hour. On Liana Banyan, she keeps $20.83 per session.
She started with 2 students from her neighborhood. Now she has 14."
→ [I teach something too → ]
```

### Instagram Creator:
```
Does this sound like you?
"James has 12,000 followers on Instagram where he sells custom leather wallets.
Instagram takes nothing — but drives zero repeat business.
On Liana Banyan, his followers become members who order directly.
He keeps 83.3% and his customers come back."
→ [I sell on Instagram too → ]
```

### Backyard Farmer:
```
Does this sound like you?
"Elena grows tomatoes and herbs in her backyard in San Antonio.
She listed her surplus on Liana Banyan for pickup.
Neighbors pre-order weekly. She makes $80/week from her garden."
→ [I grow things too → ]
```

These examples use REAL economics (Cost+20%, 83.3%) with fictional names.

## PHASE 4: Production Level Explainer (Inline)

When a ForRentCard is clicked or expanded, show how the 6 production levels work WITHOUT using the term "production levels":

```
How it works:

1. List it → Describe what you sell. Set your price.
2. People order → Pre-orders fund production. No upfront cost to you.
3. Threshold reached → When enough orders come in, production starts.
4. We handle fulfillment → Printing, shipping, packaging — or you handle it yourself.
5. You get paid → 83.3% of every sale, minus Cost+20%.
6. Scale up → More orders = lower per-unit cost = more profit for you.

The platform grows WITH you. Start with 5 orders. Scale to 5,000.
```

## VALIDATION

1. Every storefront display shows at least one ForRentCard
2. ForRentCards adapt their pitch to the surrounding category
3. "Start for $5" routes to membership or storefront builder
4. "Does this sound like you?" examples use real economics
5. Empty marketplace categories show ForRent instead of blank space
6. `npm run build` passes

## REFERENCE

- Membership cost: $5/year (from platform_canonical)
- Creator keeps: 83.3% (from platform_canonical)
- Platform margin: Cost+20% (from platform_canonical)
- Storefront builder: `/tools/storefront-builder`
- Cold Start: `platform/src/pages/ColdStartHub.tsx` (7 pathways)
- Production levels: 50, 500, 5K, 15K, 50K, 500K
- Steward Director: Innovation #2189
- Cooperative Classroom: Innovation #2103 (teaching)
- Bounty Photography: Innovation #2100 (photography)
