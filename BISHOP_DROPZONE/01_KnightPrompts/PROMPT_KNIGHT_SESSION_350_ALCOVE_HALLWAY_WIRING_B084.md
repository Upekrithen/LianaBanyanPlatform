# K350: Wire Alcove Hallway into the Member Journey
# Priority: CRITICAL — the 18-stop learning system exists but is orphaned
# Bishop: B084 | Date: 2026-04-07

## THE PROBLEM

The Alcove Hallway is a fully designed 18-stop learning path with 3 tiers:
- Tier 1 (Foundation): What Is LB, Cost+20%, 3 Currencies, 5-Dollar Door, Sweet Sixteen, Cold Start
- Tier 2 (Mechanics): Brewster Bonus, Bidding, AVA, Golden Key, Howey Analysis, Patent Portfolio
- Tier 3 (Depth): Governance, Medallions, Scaling, Innovation Adoption, Reputation, Badges

The architecture is in `platform/src/lib/alcoveSystem.ts` — all 18 stops defined with questions, rewards (Marks), and progression logic. The `AlcoveHallway` component renders in 3 modes (full, compact, minimap).

**But it's completely disconnected from the user journey:**
- No page routes exist for individual alcove stops (the routes in alcoveSystem.ts like `/learn/what-is-lb` don't have matching page components)
- No CTA to enter the Alcove from Helm, Dashboard, or onboarding
- No link from the Guided Tour (K194) to the Alcove
- New members don't know it exists

## OBJECTIVE

Wire the Alcove Hallway so new members discover it naturally and can progress through all 18 stops.

## PHASE 1: Create Alcove Page Routes

Create page components for the Alcove entry and individual stops:

### AlcoveHallwayPage.tsx (route: /learn)
- Renders the full AlcoveHallway component
- Shows all 18 stops grouped by tier
- Progress tracking (visited/comprehended states)
- Entry point with welcome text explaining the Alcove

### AlcoveStopPage.tsx (route: /learn/:stopSlug)
- Individual stop page
- Renders the stop content from alcoveSystem.ts
- Shows questions for that stop
- Awards Marks on completion
- Navigation to next/previous stop
- Progress indicator

Register routes in the app router.

## PHASE 2: Link Alcove from Key Surfaces

### From Helm (post-login dashboard):
- Add an "Alcove Hallway" card or CTA in the Helm page
- Show progress: "X of 18 stops completed"
- Prominent for new members, compact for returning members

### From Guided Tour (K194):
- The Guided Tour's stop #1 (Welcome) should mention the Alcove
- Add a tour stop specifically for the Alcove (or modify an existing one)
- After tour completion, suggest the Alcove as the next step

### From Cephas Gateway:
- Add "Start Learning" or "Alcove Hallway" link in the Cephas sidebar or header
- The Alcove is the structured learning path through Cephas content

### From onboarding:
- After registration, the welcome flow should present: "Take the Guided Tour" OR "Enter the Alcove Hallway"
- These are complementary: Tour is a flyover, Alcove is deep learning

## PHASE 3: Alcove Progress Tracking

Create database table if not exists:

```sql
CREATE TABLE IF NOT EXISTS alcove_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stop_slug TEXT NOT NULL,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  visited_at TIMESTAMPTZ DEFAULT now(),
  comprehended_at TIMESTAMPTZ, -- set when questions answered correctly
  marks_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, stop_slug)
);

CREATE INDEX idx_alcove_progress_user ON alcove_progress (user_id);
ALTER TABLE alcove_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own alcove progress" ON alcove_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alcove progress" ON alcove_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alcove progress" ON alcove_progress FOR UPDATE USING (auth.uid() = user_id);
```

### useAlcoveProgress hook:
```typescript
// Returns: { stops: AlcoveStop[], completedCount: number, currentTier: number, totalMarks: number }
// Merges alcoveSystem.ts definitions with alcove_progress DB state
```

## PHASE 4: Tier Completion Rewards

When a member completes all 6 stops in a tier:
- Tier 1: "Fledgling Pattern Key" → unlocks Tier 2
- Tier 2: "Flight Pattern Key" → unlocks Tier 3
- Tier 3: "Murder Pattern Key" (full crow reference) → Founder's Forge badge

These are already defined in alcoveSystem.ts. Wire the reward logic to actually award them.

## PHASE 5: Connect Alcove Stops to Cephas Content

Each Alcove stop teaches a concept. Link each to the relevant Cephas content:
- Stop "3 Currencies" → links to Pudding "Three Currencies, One Cooperative"
- Stop "Golden Key" → links to the Golden Key quest system
- Stop "Howey Analysis" → links to the legal disclaimer content
- etc.

This makes the Alcove a curated pathway THROUGH Cephas, not a separate system.

## VALIDATION

1. Navigate to /learn — see all 18 stops
2. Click a stop — see content + questions
3. Answer questions — earn Marks
4. See progress on Helm dashboard
5. Guided Tour mentions the Alcove
6. New member flow naturally leads to Alcove
7. `npm run build` passes

## REFERENCE

- Alcove system: `platform/src/lib/alcoveSystem.ts` (18 stops, 3 tiers, questions, rewards)
- AlcoveHallway component: search for AlcoveHallway in components
- Guided Tour: `platform/src/hooks/useGuidedTour.ts` (30 stops)
- Helm page: `platform/src/pages/HelmPage.tsx`
- Cephas gateway: `platform/src/pages/CephasGatewayV2Page.tsx`
