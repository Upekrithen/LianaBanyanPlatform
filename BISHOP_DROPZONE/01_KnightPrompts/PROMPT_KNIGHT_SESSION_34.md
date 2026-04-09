# PROMPT — Knight Session 34
## Written by Bishop Session 012 (continued) — March 18, 2026
## Predecessor: Knight Session 33

---

## SESSION CONTEXT

**Canonical innovation count:** 1,748 (verify — Knight 33 may have added)
**This session focus:** Spotlight Carousel System — the universal content surface

---

## ⚡ PRIORITY 1: Spotlight Carousel System

### Founder's Vision
The three bottom cards on the landing page ("Built to Last", "What's In It For You?", "Know a Maker?") currently work as static buttons that replace the hero card face when clicked. The Founder wants to evolve this into:

1. **Horizontal carousel** — swipe/arrow left-right through cards
2. **Algorithmically selected content** — time of day, view ratios, recency, A/B testing
3. **Category dropdown** — switch between content feeds ("Newest Projects", "Campaigns Ending Soon", "New Member Benefits", etc.)
4. **Click any card → takes over the hero card face** (the spotlight pattern already built)
5. **Fly on the Wall tracking** — every impression, click, dwell time recorded

### Why This Matters
This pattern is **replicable across every detail page**. Build the rail once, feed it different cars. The landing page becomes the template. Initiative pages, the Mall, the Helm — they all get their own carousel with context-appropriate categories.

### 1A. Create `SpotlightCarousel` Component

`src/components/SpotlightCarousel.tsx`

```tsx
interface SpotlightCard {
  id: string;
  category: string;           // 'featured' | 'campaigns' | 'benefits' | 'projects' | 'announcements'
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string; color?: string }[];
  bodyPreview: string;        // Short text shown on the card face
  bodyFull: React.ReactNode;  // Rich content shown when spotlighted in hero
  ctaLabel?: string;
  ctaRoute?: string;
  priority: number;           // Algorithm weight (higher = more likely to show)
  validFrom?: string;         // ISO date — only show after this date
  validUntil?: string;        // ISO date — expire after this date
  timeOfDayBias?: 'morning' | 'afternoon' | 'evening' | null;  // Time-based weighting
}

interface SpotlightCarouselProps {
  cards: SpotlightCard[];
  category: string;                   // Active category filter
  categories: { id: string; label: string; icon?: string }[];
  onCategoryChange: (cat: string) => void;
  onCardClick: (card: SpotlightCard) => void;  // Parent handles spotlight display
  activeCardId?: string | null;       // Which card is currently spotlighted
  className?: string;
}
```

**Key behaviors:**
- Left/right arrows + swipe (touch support)
- Shows 3 cards at a time on desktop, 1 on mobile, 2 on tablet
- Category dropdown above the row — styled to match platform (dark, amber accents)
- Active card gets green border highlight (matching existing spotlight pattern)
- Smooth scroll between cards
- Auto-rotate every 8 seconds when user isn't interacting (pause on hover)
- Dot indicators below showing position

### 1B. Category System

Default categories for the landing page:

| Category | Label | Content Source |
|----------|-------|----------------|
| `featured` | Featured | Hand-picked by Founder (via Moneypenny) |
| `campaigns` | Campaigns Ending Soon | From `launch_conditions` — closest to threshold |
| `benefits` | New Member Benefits | Static cards about $5/year, 83.3%, etc. |
| `projects` | Newest Projects | From Supabase — most recently created |
| `announcements` | Announcements | Time-limited cards (patent filing, new paper, etc.) |
| `makers` | Maker Spotlight | Creator Draft Pick system highlights |

### 1C. Algorithm Selection

Create `src/lib/spotlightAlgorithm.ts`:

```tsx
interface AlgorithmConfig {
  timeOfDayWeight: number;      // 0-1, how much time-of-day matters
  recencyWeight: number;        // 0-1, how much freshness matters
  viewRatioWeight: number;      // 0-1, how much under-viewed cards are boosted
  randomSalt: number;           // 0-1, randomness factor
}

function selectCards(
  allCards: SpotlightCard[],
  category: string,
  config: AlgorithmConfig,
  impressionCounts: Record<string, number>,  // card_id → view count
  currentHour: number                         // 0-23
): SpotlightCard[]
```

Algorithm logic:
1. Filter by category + valid date range
2. Score each card: `priority × timeBonus × recencyBonus × underviewedBonus + randomSalt`
3. Sort by score descending
4. Return top N (visible card count)

This is the engine for A/B testing. Change weights → different user experiences → measure click-through → publish findings.

### 1D. Fly on the Wall Tracking

Create `spotlight_impressions` Supabase table:

```sql
CREATE TABLE spotlight_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id text NOT NULL,
  category text NOT NULL,
  position_in_carousel int,           -- which slot (0, 1, 2)
  action text DEFAULT 'impression',   -- impression, click, spotlight, cta_click, dismiss
  session_id text,                    -- browser session identifier
  dwell_ms int,                       -- how long card was visible before action
  algorithm_config jsonb,             -- snapshot of weights used for this selection
  page_context text DEFAULT 'landing', -- which page the carousel is on
  created_at timestamptz DEFAULT now()
);

-- RLS: insert-only for anonymous, full access for service role
ALTER TABLE spotlight_impressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log impressions"
  ON spotlight_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role reads all"
  ON spotlight_impressions FOR SELECT USING (auth.role() = 'service_role');
```

Track these events:
- `impression` — card appeared in viewport
- `click` — card was clicked
- `spotlight` — card content replaced hero face
- `cta_click` — user clicked the CTA button within spotlight view
- `dismiss` — user clicked "← Back to Main"

### 1E. Spotlight Content Table (for dynamic cards)

```sql
CREATE TABLE spotlight_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  subtitle text,
  body_preview text NOT NULL,
  body_full text,              -- Markdown or HTML
  stats jsonb,                 -- [{ label, value, color }]
  cta_label text,
  cta_route text,
  priority int DEFAULT 50,     -- 1-100
  valid_from timestamptz,
  valid_until timestamptz,
  time_of_day_bias text,       -- morning, afternoon, evening, null
  is_active boolean DEFAULT true,
  created_by text DEFAULT 'founder',  -- founder, moneypenny, system
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE spotlight_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active spotlight content"
  ON spotlight_content FOR SELECT USING (is_active = true);
```

### 1F. Moneypenny Integration

In the Moneypenny Briefing dashboard (built in Session 33), add a **"Spotlight Manager"** panel:
- List all spotlight_content cards
- Toggle active/inactive
- Create new cards (form with all fields)
- Preview how it looks in the carousel
- View impression/click stats per card

This connects: **Moneypenny (approve content) → Carousel (display it) → Fly on the Wall (measure impact) → Papers (publish findings)**. Full loop.

---

## PRIORITY 2: Wire Carousel Into Landing Page

### Replace Static Bottom Cards

In `Index.tsx`, replace the current three static `<div>` cards with:

```tsx
<SpotlightCarousel
  cards={spotlightCards}
  category={spotlightCategory}
  categories={SPOTLIGHT_CATEGORIES}
  onCategoryChange={setSpotlightCategory}
  onCardClick={(card) => { setSpotlightCard(card.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
  activeCardId={spotlightCard}
/>
```

The existing `spotlightCard` state and hero-front conditional rendering (already built by Bishop) provides the display surface. The carousel just needs to SET which card is active.

### Seed Initial Content

Migrate the three existing cards (Built to Last, What's In It For You, Know a Maker) as `featured` category cards in `spotlight_content`. Then add:
- 2-3 `campaigns` cards (auto-generated from `launch_conditions` closest to threshold)
- 2-3 `announcements` cards (e.g., "8th Patent Filing Ready", "New Paper: XP Score System")
- 2-3 `benefits` cards (e.g., "83.3% Creator Split", "$5/Year Membership", "Joule Forever Stamps")

---

## PRIORITY 3: Reusable Pattern for Detail Pages

### Create `useSpotlightCarousel` Hook

```tsx
function useSpotlightCarousel(pageContext: string, defaultCategory?: string) {
  // Fetches cards from spotlight_content for this page context
  // Manages category state
  // Handles impression logging
  // Returns: { cards, category, setCategory, categories, logEvent }
}
```

This hook lets ANY page add a carousel in 3 lines:
```tsx
const spotlight = useSpotlightCarousel('hexisle-portal', 'campaigns');
// ... render <SpotlightCarousel {...spotlight} />
```

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/components/SpotlightCarousel.tsx` | Horizontal carousel with arrows, swipe, auto-rotate |
| `src/lib/spotlightAlgorithm.ts` | Card selection algorithm (time, recency, view ratio, random) |
| `src/hooks/useSpotlightCarousel.ts` | Reusable hook for any page |
| `src/components/moneypenny/SpotlightManager.tsx` | Moneypenny panel for managing carousel content |
| `supabase/migrations/NEXT_spotlight_system.sql` | spotlight_content + spotlight_impressions tables |

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Replace static bottom cards with `<SpotlightCarousel>`, wire to existing spotlight state |
| `src/pages/MoneypennyBriefing.tsx` | Add SpotlightManager panel |
| `src/App.tsx` | No new routes needed — carousel is a component, not a page |

---

## ACADEMIC VALUE

This carousel system generates publishable data:
- **A/B testing results** on cooperative commerce engagement
- **Time-of-day content optimization** (does "Campaigns Ending Soon" perform better at 6 PM?)
- **View ratio normalization** (ensuring all content gets fair exposure)
- **Click-through → conversion pipeline** (impression → click → spotlight → CTA → action)

All recorded in Fly on the Wall. All available for Cephas papers. The platform becomes its own research lab.

---

## CRITICAL RULES

1. **Innovation count = 1,748** — verify after any changes
2. **SEC language** — no "invest", "return", "profit", "dividend", "yield" in user-facing copy
3. **Carousel must work on mobile** — touch swipe, responsive card count
4. **Fly on the Wall tracking is NOT optional** — every impression must be logged
5. **Don't change detail pages yet** — Founder wants to review current detail pages first before applying this pattern
6. Build must pass `npx tsc --noEmit` before deploy

---

## COMMIT MESSAGE FORMAT

```
Session 34: [summary], [innovation count], POLLINATE if applicable
```
