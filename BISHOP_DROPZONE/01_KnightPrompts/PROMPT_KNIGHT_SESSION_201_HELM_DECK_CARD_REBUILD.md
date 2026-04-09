# KNIGHT SESSION 201 — Helm Rebuild: Deck Card Pattern
## Priority: HIGH — The Helm is the member's home base
## Bishop B052
## Depends on: K200 (Elbow Grease Badge)
## Design Principle: SAME CARD PATTERN AS LANDING PAGE — deck cards that flip, slideshow or grid

---

## CONTEXT

The landing page has a main card + hero card that flips. That pattern works. Now apply the SAME pattern to the Helm (`/helm`) — every project, subscription, crew, and activity gets a deck card. The member's Helm IS their Keep, their dashboard, their cockpit.

**Key insight from Founder:** "Deck cards for each project, slideshow through or show all at once, click to flip and show details — same pattern as the first page."

**Routing:** 
- `/` → Always the public landing page (Founder directive B052)
- `/helm` → Your Helm (deck of cards for everything you're involved in)
- `/bridge/:slug` → A specific project's Bridge (control panel)

---

## TASK 1: Helm Page Rebuild

**Modify:** `platform/src/pages/TheHelm.tsx` (or create new if needed)

### Layout

Two view modes, toggleable:

**Slideshow Mode** (default):
```
┌──────────────────────────────────────────────────────┐
│  ⚓ YOUR HELM          [Grid View] [Slideshow]       │
│                                                      │
│         ┌─────────────────────────────┐              │
│    ◄    │                             │    ►         │
│         │    DECK CARD (front)        │              │
│         │                             │              │
│         │    📸 Bounty Photography    │              │
│         │    Active · 127 Marks       │              │
│         │                             │              │
│         │    "Click to flip"          │              │
│         │                             │              │
│         └─────────────────────────────┘              │
│                                                      │
│              ● ○ ○ ○ ○ ○ (dot indicators)            │
│                                                      │
│  [← Prev]                            [Next →]       │
└──────────────────────────────────────────────────────┘
```

**Grid Mode:**
```
┌──────────────────────────────────────────────────────┐
│  ⚓ YOUR HELM          [Grid View] [Slideshow]       │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 📸 Photo │  │ 🐚 Pearl │  │ 🍽️ LMD   │          │
│  │ 127 Marks│  │  42 Marks│  │ Crew: 3/6│          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 🏔️ Montana│  │ ⭐ Marks │  │ 🔖 Beacons│         │
│  │ Backed   │  │ 169 total│  │ 4 saved  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└──────────────────────────────────────────────────────┘
```

### Card Categories

Each card type uses the SAME `DeckCardFrame` component with different content:

#### 1. Project Cards (things you're working on / backing)
**Front:**
- Project icon + name
- Status badge (Active / Backed / Completed)
- Mark count earned from this project
- Production level indicator (1-6)

**Back (on flip):**
- Detailed stats (Marks earned, Joules, time invested)
- Oar Slots visualization (how many crew slots filled)
- Recent activity (last 3 actions)
- CTAs: "Go to Bridge →" | "Invite Crew"

#### 2. Role Cards (your active roles)
**Front:**
- Role icon + name (Photographer, Pearl Diver, Teacher, etc.)
- Elbow Grease level badge
- Mark earnings this month
- Guild membership badge (if applicable)

**Back (on flip):**
- Earnings breakdown (this week / this month / all time)
- Available bounties for this role
- Reputation score
- CTAs: "Find Bounties →" | "View Earnings"

#### 3. Subscription Cards (things you're subscribed to)
**Front:**
- Subscription name + icon
- Payment method (Marks / Credits / Joules / Dollars)
- Next payment date
- Status (Active / Paused)

**Back (on flip):**
- Payment history (last 3)
- Total spent
- CTAs: "Manage →" | "Pause" | "Cancel"

#### 4. Stats Card (always present, always first in slideshow)
**Front:**
- "⚓ Your Helm"
- Total Marks (big number)
- Trail Map progress (X/12 stops)
- Elbow Grease highest level achieved
- Member since date

**Back (on flip):**
- Marks by category breakdown (with emoji)
- Joules balance
- Credits balance
- Prize Panel progress (X/100 toward next)
- CTAs: "View Trail Map →" | "View Prize Panel"

#### 5. Beacon Card (if member has beacons)
**Front:**
- 🔖 icon + beacon count
- Color breakdown (green/gold/red/blue)
- Most recent beacon page title

**Back (on flip):**
- List of all beacons with colors
- Click any beacon → navigate to that page
- CTA: "Clear All" | "Export"

---

## TASK 2: Deck Card Data Aggregation Hook

**New hook:** `platform/src/hooks/useHelmCards.ts`

```typescript
export interface HelmCard {
  id: string;
  type: 'stats' | 'project' | 'role' | 'subscription' | 'beacon';
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  frontData: Record<string, string | number>;
  backData: Record<string, string | number>;
  ctaLinks: Array<{ label: string; href: string }>;
  elbowGreaseLevel?: number;
  priority: number; // for sort order
}

export function useHelmCards(): { cards: HelmCard[]; loading: boolean } {
  // Queries:
  // 1. mark_work_records → group by category for role cards + stats
  // 2. founding_run_pledges → backed projects
  // 3. member_subscriptions → active subscriptions
  // 4. localStorage beacons → beacon card
  // 5. user_preferences → trail marker, settings
  // 6. tour_package_progress → completed tours
  
  // Returns sorted array: stats card first, then by most recent activity
}
```

---

## TASK 3: Slideshow Navigation

Use existing `SpotlightCarousel` pattern or build a simpler version:

- Left/right arrow buttons (keyboard: ← →)
- Swipe support on mobile (touch events)
- Dot indicators showing position
- Auto-play OFF (user controls the pace)
- Click card to flip (same CSS 3D transform as hero card on landing page)
- Click outside flipped card to flip back

### CSS

Reuse the `.hero-flip` / `.flipped` pattern from `landing.css`:

```css
.helm-card-flip {
  perspective: 1000px;
}
.helm-card-flip .card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.helm-card-flip.flipped .card-inner {
  transform: rotateY(180deg);
}
.helm-card-flip .card-front,
.helm-card-flip .card-back {
  backface-visibility: hidden;
}
.helm-card-flip .card-back {
  transform: rotateY(180deg);
}
```

---

## TASK 4: "ENTER" Button Routing for Authenticated Users

**Modify:** `platform/src/pages/Index.tsx`

When an authenticated user clicks "ENTER" on the landing page, navigate to `/helm` instead of showing the Keep view inline:

```typescript
// In the ENTER button onClick:
if (user) {
  navigate('/helm');
} else {
  navigate('/join');
}
```

This completes the flow: Landing → ENTER → Helm (your deck of cards).

---

## TASK 5: Route Registration

Ensure `/helm` route exists and points to the rebuilt TheHelm page:

```tsx
// In routes/tools.tsx or routes/dashboard.tsx
<Route path="/helm" element={<ExplorerRoute><LazyPage><TheHelm /></LazyPage></ExplorerRoute>} />
```

---

## VERIFICATION

1. Go to lianabanyan.com → see landing page (always, even when logged in)
2. Click ENTER (logged in) → navigate to /helm
3. /helm shows Stats card first in slideshow mode
4. Arrow keys navigate between cards
5. Click a card → flips to show details (same animation as hero card)
6. Click outside → flips back
7. Toggle to Grid view → see all cards at once
8. Each card type has correct front/back content
9. "Go to Bridge" CTA on project cards → navigates to project detail
10. Mobile: swipe between cards works
11. Empty state (no projects yet): Stats card + "Start Your First Project" CTA card

---

## DEPLOY

```powershell
cd platform; npm run build; firebase deploy --only hosting -P default
```

---

*Knight Session 201 — Bishop B052*
*One Helm. Many Bridges. Every project is a card you flip.*
*Same pattern as the landing page. Consistency IS the brand.*
*FOR THE KEEP!*
