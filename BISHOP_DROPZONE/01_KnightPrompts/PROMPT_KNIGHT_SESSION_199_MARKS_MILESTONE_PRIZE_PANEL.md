# KNIGHT SESSION 199 — Marks Milestone Popup + Prize Panel (Crown Jewel)
## Priority: HIGH — First earning → first spending → first BUSINESS loop
## Bishop B052 (Updated)
## Depends on: K198 (Tour Packages) — build AFTER K198
## Innovation: #2121 (Crown Jewel)

---

## CONTEXT

When a member earns ANY Marks for the first time, they need immediate positive reinforcement that teaches them what Marks ARE and what they can DO with them. At 100 Marks, the Prize Panel doesn't just show 3 preorder options — it shows them **how to launch a business TODAY**.

The tagline: **"Don't Wait for Your Ship to Come In — Launch Your Ship Yourself TODAY."**

People think starting a business is hard. We're taking the guesswork out of it. You can accept payments TODAY. Set up subscriptions to your work TODAY. Work from home providing services TODAY. The Prize Panel makes this viscerally clear with three tabs showing at least 9 real things you can do RIGHT NOW.

---

## TASK 1: Marks Milestone Popup

**New component:** `platform/src/components/marks/MarksMilestonePopup.tsx`

**Triggers when:**
- Member's total Marks crosses any milestone threshold
- Thresholds: 1 (first ever), 10, 25, 50, 75, 100, 250, 500, 1000

### Popup Design — Milestones 1 through 75

**First Mark (threshold = 1):**
```
┌──────────────────────────────────────────┐
│                                          │
│           🎉 CONGRATULATIONS!            │
│                                          │
│     You earned your first Mark!          │
│                                          │
│     ██░░░░░░░░░░░░░░░░░░  1/100         │
│                                          │
│     Marks are your effort. They don't    │
│     expire. They build credentials.      │
│     They unlock doors.                   │
│                                          │
│     At 100 Marks, you unlock the         │
│     Prize Panel — and you'll see         │
│     exactly how to launch YOUR           │
│     business. Today.                     │
│                                          │
│         [ KEEP EARNING → ]               │
│                                          │
└──────────────────────────────────────────┘
```

**Subsequent milestones (10, 25, 50, 75):**
```
┌──────────────────────────────────────────┐
│                                          │
│           ⭐ 25 MARKS!                   │
│                                          │
│     ████████████░░░░░░░░  25/100         │
│                                          │
│     You're 25% to your Prize Panel.      │
│     Here's what you've built:            │
│                                          │
│     📸 Photography: 15 Marks             │
│     🐚 Pearl Diver: 8 Marks             │
│     ✍️ Feedback: 2 Marks                │
│                                          │
│         [ KEEP GOING → ]                 │
│                                          │
└──────────────────────────────────────────┘
```

---

## TASK 2: Prize Panel at 100 Marks — THREE TABS

This is the big one. At 100 Marks, the popup transforms into a **tabbed Prize Panel** with the headline:

**"Don't Wait for Your Ship to Come In — Launch Your Ship Yourself TODAY."**

### Three Folder Tabs

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│     🏆 100 MARKS — YOU UNLOCKED THE PRIZE PANEL!         │
│     ████████████████████  100/100 ✓                      │
│                                                          │
│     "Don't Wait for Your Ship to Come In —               │
│      Launch Your Ship Yourself TODAY."                   │
│                                                          │
│  ┌────────────┐┌──────────────┐┌──────────────────┐      │
│  │ What Can I ││ What Can I   ││ How Can I Make   │      │
│  │    GET     ││    DO        ││    MONEY         │      │
│  └────────────┘└──────────────┘└──────────────────┘      │
│                                                          │
│  ═══════════════════════════════════════════════════      │
│                                                          │
│  (Active tab content below — 3+ cards per tab)           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### TAB 1: "What Can I Get" (Spend Marks)
Your 10-Mark bonus can go toward any of these:

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 🍽️ | PreOrder a Meal | Fund a meal from a local restaurant through Mission ONE |
| 2 | 🔩 | PreOrder a Slotted Top | Back the Canister System — first manufacturing run |
| 3 | 🛠️ | PreOrder a Service | Book a service from a member near you |
| 4 | 🎨 | Get Your Logo Made | Commission a logo through the Brand Bounty system — a real designer makes YOUR brand |
| 5 | 📦 | Get Your Brand Package | Logo + color palette + business card template — the full starter kit |

**Contextual rotation:** Cards 1-3 rotate based on earning category (photography earners see camera-related items, cooking earners see kitchen items). Cards 4-5 always appear — everyone needs a brand.

### TAB 2: "What Can I Do" (Use the Platform)
Things you can do RIGHT NOW with your membership:

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 💳 | Accept Payments Today | Set up your member payment profile. Start accepting Credits from other members immediately. |
| 2 | 🔄 | Set Up Subscriptions | Create a subscription to your work — monthly recipes, photos, tutoring, services. Members subscribe with any of 4 currencies. |
| 3 | 🏠 | Work From Home | Browse the services board. Teach, cook, photograph, scout deals, write — all from home. |
| 4 | 📢 | Launch a Campaign | Create a business campaign to announce what you offer. Gets featured in the marketplace. |
| 5 | 🤝 | Join a Guild | Connect with other professionals in your field. Photography Guild, Cooking Guild, Teaching Guild — find your people. |

### TAB 3: "How Can I Make Money" (Earn More Marks → Cash)
The money path — how Marks become real income:

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 📸 | Photograph Businesses | Bounty Photography — photograph local businesses, earn Marks per verified photo. |
| 2 | 🐚 | Scout Deals | Pearl Diver — log deals, discounts, and price comparisons. Earn Marks when members use your intel. |
| 3 | 👩‍🏫 | Teach From Home | Cooperative Classroom — teach anything via Zoom. Spanish, math, cooking, guitar. Set your price. |
| 4 | 🍳 | Prep & Sell Meals | Freezer Node — batch cook, store, distribute. Earn from Family Table orders and catering. |
| 5 | 🏗️ | Back Projects Early | Plant Seeds — back projects at Pre-Mint level for 5× Joules. Your backing earns returns as projects succeed. |
| 6 | ✍️ | Give Feedback | Every piece of feedback earns Marks. Press N anywhere. Your voice shapes the platform AND earns. |

### Tab Implementation

Use shadcn/ui `Tabs` component (already in the project):

```tsx
<Tabs defaultValue="get" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="get">What Can I Get</TabsTrigger>
    <TabsTrigger value="do">What Can I Do</TabsTrigger>
    <TabsTrigger value="money">How Can I Make Money</TabsTrigger>
  </TabsList>
  <TabsContent value="get">
    {/* 5 cards in responsive grid */}
  </TabsContent>
  <TabsContent value="do">
    {/* 5 cards */}
  </TabsContent>
  <TabsContent value="money">
    {/* 6 cards */}
  </TabsContent>
</Tabs>
```

Each card is clickable — navigates to the relevant page (e.g., "Accept Payments Today" → member payment setup, "Photograph Businesses" → Bounty Photography page).

### Card Design

Each card should be a compact, visually appealing tile:
```
┌─────────────────────┐
│  🍽️                 │
│  PreOrder a Meal    │
│  Fund a meal from   │
│  a local restaurant │
│  through Mission    │
│  ONE.               │
│                     │
│  [ GO → ]           │
└─────────────────────┘
```

Background: `bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50`
Transition: scale on hover (1.02)

---

## TASK 3: Real-Time Marks Listener

**New hook:** `platform/src/hooks/useMarksMilestone.ts`

```typescript
export function useMarksMilestone() {
  // 1. Query total marks from mark_work_records for current user
  // 2. Check against milestones: [1, 10, 25, 50, 75, 100, 250, 500, 1000]
  // 3. Compare with localStorage 'marks_milestone_last_shown'
  // 4. If new milestone > last shown → return { showMilestone: true, milestone, totalMarks }
  // 5. On dismiss → update localStorage
  // 6. For milestone >= 10, also return category breakdown
  // 7. For milestone >= 100, return primary earning category for contextual card rotation
}
```

**Integration:** Add to `AppShell.tsx` — renders `MarksMilestonePopup` globally when triggered.

---

## TASK 4: Marks Breakdown by Category

Query `mark_work_records` grouped by `work_type` or `category`:

```sql
SELECT category, SUM(marks_earned) as total
FROM mark_work_records
WHERE user_id = $1
GROUP BY category
ORDER BY total DESC;
```

Map categories to emoji:
- photography → 📸
- pearl_diver → 🐚
- feedback → ✍️
- cooking → 🍳
- teaching → 📚
- general → ⭐
- backing → 🏗️
- campaign → 📢

---

## TASK 5: Migration

```sql
-- K199: Marks Milestone system
-- Uses existing tables: mark_work_records, user_preferences, campaign_pledges

-- Ensure mark_work_records has category column
ALTER TABLE mark_work_records ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Update platform_canonical
UPDATE platform_canonical SET value = value::int + 1, updated_at = now()
WHERE key = 'innovation_count';

-- Log innovation
INSERT INTO innovation_log (innovation_number, title, description, category, status, is_crown_jewel)
VALUES (
  2121,
  'Marks Milestone Prize Panel with Three-Tab Business Launch',
  'Real-time celebration system triggering on Marks milestones with a three-tab Prize Panel at 100 Marks showing What Can I Get (spend), What Can I Do (platform actions), and How Can I Make Money (earning paths), with contextual card rotation based on earning category, creating a first-earning-to-business-launch loop.',
  'user_experience',
  'implemented',
  true
) ON CONFLICT (innovation_number) DO NOTHING;
```

---

## VERIFICATION

1. Earn 1 Mark → popup: "Your first Mark!" with 1/100 progress + business teaser
2. Earn 10+ Marks → popup with category breakdown
3. Earn 100 Marks → **Prize Panel** with 3 tabs
4. Tab 1 "What Can I Get" → 5 cards including brand/logo
5. Tab 2 "What Can I Do" → 5 cards including Accept Payments, Subscriptions, Work From Home
6. Tab 3 "How Can I Make Money" → 6 cards with all earning paths
7. Each card clickable → navigates to relevant page
8. Cards in Tab 1 rotate contextually based on earning category
9. Doesn't re-show for already-seen milestones
10. Works for both authenticated and ghost users (ghost sees "Join to claim your Marks")

---

## DEPLOY

```powershell
cd platform; npm run build; firebase deploy --only hosting -P default
```

---

*Knight Session 199 — Bishop B052*
*Don't Wait for Your Ship to Come In — Launch Your Ship Yourself TODAY.*
*Three tabs. Sixteen cards. Every door leads somewhere real.*
*Crown Jewel: The first cooperative onramp from earning to launching a business in under 5 minutes.*
*FOR THE KEEP!*
