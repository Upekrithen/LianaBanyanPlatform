# KNIGHT SESSION 91 — The Front Door: Onboarding + Profile + Notifications
## Bishop 028 | March 23, 2026
## Innovation Count: 1,936 (adding #1936: Margin Economics as SEC Defense)
## Based on: K90 Congress API (in progress)

---

## MISSION

Build the front door. The platform has 17 production systems but no coherent path for a new person to become a member. A visitor who arrives today encounters disconnected pages with no guided flow. This session builds: (1) a linear welcome funnel connecting existing entry points, (2) the $5 Access Key membership gate, (3) member profiles that make participation visible, and (4) a notification spine that makes the platform feel alive.

You built 17 rooms but no hallway. K91 builds the hallway.

**Previous session**: K90 wired Political Expedition to Congress.gov API — live bill tracking, member-to-bill mapping, bill search, action timelines. Migration 20260323000021-22, congress-api-sync edge function.

---

## CONTEXT: WHAT EXISTS (Entry-Related)

| Component | Route / Location | Status |
|-----------|-----------------|--------|
| RedCarpet.tsx | `/red-carpet/*` | ✅ LIVE — handles 8 entry modes (email, slug, herald, cue card, referral, press, QR) |
| OnboardingStart.tsx | `/onboarding` | ✅ LIVE — "You have a... I have a..." dropdown routing |
| TrickleOnboarding.tsx | behind auth | ✅ LIVE — progressive disclosure |
| Subscriptions.tsx | `/subscriptions` | ✅ LIVE — coalition tier calculator |
| Dashboard.tsx | `/dashboard` | ✅ LIVE — 20+ widget components |
| Treasure Maps | `/treasure-maps` | ✅ LIVE with progression (K81) |
| Guided Discovery Configurator | — | ❌ NOT BUILT — specified (#1920) but never implemented |
| $5 Access Key | — | ❌ NOT BUILT — specified (#1935) but never implemented |
| Stripe Checkout | commerce loop | ✅ LIVE — interim for all payments |
| Design Arena | `/design-battle` | ✅ LIVE — Arena + Emporium + Crew Tables (K87) |
| Political Expedition | `/political-expedition` | ✅ LIVE (K86/K90) |
| Vehicle Systems | `/lemon-lot`, `/local-wheels`, `/rideshare-routes` | ✅ LIVE (K85) |
| Housing | `/housing` | ✅ LIVE (K89) |
| Ghost World | `/ghost-world` | ✅ LIVE (K88) |

The problem: a new visitor can land on any of these 17 systems but there is NO linear path from "I just heard about this" to "I am a participating member." RedCarpet handles inbound context. OnboardingStart asks a dropdown question. Neither connects to a payment step, profile creation, or personalized first experience. The funnel has pieces but no spine.

---

## TASK 1: Guided Discovery Wizard

**File**: `src/pages/GuidedDiscovery.tsx`
**Route**: `/welcome` (also accessible from `/discover`)

A 4-screen visual wizard that replaces the dropdown-based OnboardingStart with a card-based flow. Use shadcn/ui Card components. Each screen fills the viewport center with a clean, focused layout. Progress indicator at the top (Step 1 of 4, etc.).

### Screen 1: "What brings you here?"

Card grid (pick one or more, highlight on select):

| Card | Label | Tags |
|------|-------|------|
| 🍽️ | "I want affordable food" | `food`, `mission_one` |
| 🏠 | "I need housing help" | `housing`, `mission_two` |
| 🚗 | "I need transportation" | `transport`, `mission_three` |
| 🎨 | "I make things (crafts, art, food)" | `maker`, `forge`, `arena` |
| 💼 | "I run a small business" | `business`, `lmb`, `storefront` |
| 🤝 | "I want to help my community" | `volunteer`, `rally`, `crew` |
| 🔍 | "I'm just exploring" | `explore` |

Multi-select allowed. At least one required. "Next" button at bottom.

### Screen 2: "How did you hear about us?"

Single-select cards:
- Friend or Family
- QR Code
- Social Media
- YouTube
- News or Article
- Just Found It

This seeds attribution tracking. Store value as `attribution_source` in localStorage.

### Screen 3: "Here's your path"

Based on tags from Screen 1, recommend 2-3 Treasure Maps. Mapping logic:

| Tag(s) | Primary Map | Secondary Map(s) |
|--------|-------------|-------------------|
| `food` | Breakfast Runner | Let's Get Groceries |
| `maker` | Maker Economy | Design Arena |
| `business` | Let's Make Bread | Storefront Builder |
| `housing` | Mission TWO | Neighborhood Node |
| `transport` | Rally Group Transport | Local Wheels |
| `volunteer` | Rally Group | Crew Call |
| `explore` | Platform Explorer | Breakfast Runner |

If multiple tag groups selected, show the primary map from the first tag and secondaries from others (max 3 total).

Display as map cards with:
- Map name and icon
- Short description (one line)
- "This is your starting point" badge on the primary
- "Also recommended" label on secondaries

"Continue" button → Screen 4.

### Screen 4: "Join for $5 a year"

Transition screen with a brief value statement and a single CTA:

- Headline: "One key unlocks everything."
- Subtext: "For $5 a year, you get access to [dynamic count from useCanonicalStats] cooperative services, a personal storefront (free), design tools, community maps, and a voice in how this platform grows."
- Benefits list (icon + one-liner each):
  - First Store Free
  - Ghost World placement
  - Design Arena
  - Crew Tables
  - Calendar
  - Housing listings
  - Political tools
  - Vacation network
- Button: "Get My Access Key — $5/year" → navigates to `/join`
- Small link below: "I want to look around first" → navigates to `/discover`

**Data persistence**: Store all selections (`tags`, `attribution_source`, `recommended_maps`) in localStorage under key `lb_discovery_state`. This data is consumed after payment in the Membership Gate.

---

## TASK 2: $5 Membership Gate

**File**: `src/pages/MembershipGate.tsx`
**Route**: `/join`

Single-purpose payment page. Clean and focused — no sidebar, no nav clutter.

### Layout

- Centered card (max-width 500px)
- LB logo at top
- Headline: "Your Access Key"
- Copy: "For $5 a year, you become a cooperative member with full access to [count] services."
- Benefits checklist (checkmarks):
  - Your own storefront (first one is free — costs LB $0.06/month)
  - Ghost World island placement
  - Design Arena submissions
  - Crew Table participation
  - Full calendar with 6 plug types
  - Housing & vehicle listings
  - Political Expedition tools
  - Member Vacation Network access
  - 5 starter Credits upon joining
- Stripe Checkout button: "$5 — Get Access Key"
- Below button: "Already a member? Sign in" → `/auth`

### Payment Flow

1. Member clicks the Stripe button
2. Use existing Stripe Checkout integration from Commerce Engine (K80)
3. Create a Stripe product "$5 Access Key" (or use existing if Knight already created one)
4. Price: $5.00 one-time (NOT subscription — annual renewal is a later feature)
5. On Stripe success callback:
   a. Create/update Supabase auth user (if not already signed in, Stripe redirect handles this)
   b. Insert `member_profiles` row with data from `lb_discovery_state` localStorage
   c. Seed 5 starter Credits into member's account (use existing credit system)
   d. Create `treasure_map_progress` entries for recommended maps from discovery wizard
   e. Clear `lb_discovery_state` from localStorage
   f. Show "As You Wish" confirmation message (toast or inline)
   g. Redirect to `/first-steps`

### Edge Cases

- If user arrives at `/join` without going through `/welcome`: show the page normally, skip map assignment (they can pick maps later)
- If user is already authenticated: skip auth step, just process payment
- If payment fails: show error with retry option, do not redirect

---

## TASK 3: First Steps Dashboard

**File**: `src/pages/FirstSteps.tsx`
**Route**: `/first-steps`

A stripped-down post-signup view designed to feel like a guided first day, NOT the full Dashboard. Protected route (auth required).

### Layout

- Welcome header: "Welcome to Liana Banyan, [display_name or 'new member']!"
- Subtitle: "Here's what we set up for you."

### Section 1: Your Path

Show 2-3 assigned Treasure Maps (from `treasure_map_progress` entries created at signup):
- Each map as a card with:
  - Map name and stage indicator
  - Step 1 highlighted with "Start Here" badge
  - Brief description of what this map teaches
  - "Begin" button → `/treasure-maps?map=[map_id]`
- If no maps assigned (user skipped discovery): show "Pick a path" link → `/treasure-maps`

### Section 2: Your Member Card

Preview card showing:
- Display name (or "Set your name" link)
- "Member since [today's date]"
- Placeholder QR code (or generated from member ID)
- "Complete Your Profile" link → `/member/[username]?edit=true`

### Section 3: Quick Actions

3 CTA buttons:
- "Place Your Storefront" → `/tools/storefront-builder` (shown if tags include `business` or `maker`)
- "Find Your Reps" → `/political-expedition` (always shown)
- "Explore the Platform" → `/dashboard`

### Auto-Redirect Logic

Track visits to `/first-steps` in localStorage (key: `lb_first_steps_visits`, increment on each load).
After 3 visits, auto-redirect to `/dashboard` with a toast: "Your full dashboard is ready."

---

## TASK 4: Member Profile Page

**File**: `src/pages/MemberProfile.tsx`
**Route**: `/member/:username`

### Migration: `supabase/migrations/20260323000023_front_door.sql`

```sql
-- ============================================
-- MIGRATION: 20260323000023_front_door.sql
-- Knight Session 91: The Front Door
-- member_profiles + notifications
-- ============================================

-- Member Profiles
CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  attribution_source TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by anyone"
  ON member_profiles FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own profile always"
  ON member_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own profile"
  ON member_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admin manages all profiles"
  ON member_profiles FOR ALL
  USING (public.is_admin());

-- Username generation helper: user_id prefix + random suffix
-- Knight can use this or generate usernames in the client
CREATE OR REPLACE FUNCTION generate_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  candidate TEXT;
  suffix INT;
BEGIN
  candidate := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
  IF length(candidate) < 3 THEN
    candidate := 'member';
  END IF;
  candidate := left(candidate, 20);
  -- Check uniqueness
  IF NOT EXISTS (SELECT 1 FROM member_profiles WHERE username = candidate) THEN
    RETURN candidate;
  END IF;
  -- Add numeric suffix
  suffix := 1;
  WHILE EXISTS (SELECT 1 FROM member_profiles WHERE username = candidate || suffix::TEXT) LOOP
    suffix := suffix + 1;
  END LOOP;
  RETURN candidate || suffix::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System creates notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin manages all notifications"
  ON notifications FOR ALL
  USING (public.is_admin());

-- Index for fast unread count queries
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id)
  WHERE read_at IS NULL;

-- Index for notification listing (newest first)
CREATE INDEX idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- Index for profile lookups by username
CREATE INDEX idx_member_profiles_username
  ON member_profiles(username);

-- Trigger to update updated_at on member_profiles
CREATE OR REPLACE FUNCTION update_member_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_member_profiles_updated
  BEFORE UPDATE ON member_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_member_profile_timestamp();
```

### Profile Page Layout

**Public view** (`/member/:username`):

- Avatar (large circle, fallback to initials)
- Display name (large)
- Username (small, gray, `@username`)
- Location (if set)
- "Member since [joined_at formatted]"
- Bio (if set)
- Tags displayed as colored badges (maker, food, business, volunteer, etc.)

**Activity Sections** (tabs or stacked sections):

- **Treasure Maps**: List of maps with progress bars (query `treasure_map_progress` by user_id)
- **XP & Level**: Current XP score and tier name (from existing XP system)
- **Badges**: Earned platform badges (from existing badge tables if any, otherwise placeholder section)
- **Design Arena**: Submissions with thumbnails and ratings (query `arena_submissions` by creator_id)
- **Crew Tables**: Active tables they sit at (query `crew_table_seats` by member_id, join `crew_tables`)
- **Ghost World**: Buildings placed (query Ghost World tables by user_id)

Each section only renders if the member has data in that system. Empty sections are hidden, not shown as empty.

**Edit mode** (own profile, triggered by edit button or `?edit=true` query param):

- Inline edit for: display_name, bio, location, avatar_url, is_public toggle
- Tags are NOT directly editable (they come from discovery wizard and platform activity)
- Save button → upsert to `member_profiles`
- Cancel button → revert to view mode

---

## TASK 5: Notification Spine

### 5A: NotificationBell Component

**File**: `src/components/notifications/NotificationBell.tsx`

Top-nav bell icon:
- Use a bell icon (Lucide `Bell` or similar)
- Red circle badge showing unread count (hide if 0)
- Click toggles the NotificationPanel dropdown
- Close panel on click outside

**Data fetching**:
- On mount: query `notifications` where `user_id = auth.uid()` and `read_at IS NULL`, count result
- Poll every 60 seconds for new count (or use Supabase realtime channel on `notifications` table — Knight's choice, polling is fine for V1)
- Cache count in state, update on poll

### 5B: NotificationPanel Component

**File**: `src/components/notifications/NotificationPanel.tsx`

Dropdown panel (absolute positioned below bell):
- Max height with scroll
- Header: "Notifications" + "Mark all read" button
- List of notifications, newest first (limit 20, paginate later)
- Each notification row:
  - Type icon (mapped from `type` field — see icon map below)
  - Title (bold)
  - Body preview (truncated to 2 lines)
  - Relative timestamp ("2 hours ago", "yesterday")
  - Unread indicator (blue dot on left)
- Click a notification: mark as read (`read_at = now()`), navigate to `link`
- Empty state: "You're all caught up!" with a checkmark icon

**Type → Icon mapping**:

| Type | Icon | Color |
|------|------|-------|
| `order_update` | ShoppingBag | green |
| `crew_call` | Users | blue |
| `star_chamber` | Scale | purple |
| `arena_result` | Trophy | gold |
| `map_complete` | Map | teal |
| `housing_update` | Home | orange |
| `bill_update` | Landmark | red |
| `system` | Info | gray |
| `welcome` | PartyPopper | gold |

### 5C: Notification Creation Edge Function

**File**: `supabase/functions/create-notification/index.ts`

```typescript
// Edge function: create-notification
// POST body: { user_id, type, title, body?, link? }
// Auth: LB_SYSTEM_KEY required in Authorization header
//
// Valid types: order_update, crew_call, star_chamber, arena_result,
//              map_complete, housing_update, bill_update, system, welcome
//
// Returns: { id, created_at } on success
// Errors: 401 if bad key, 400 if missing required fields
```

Implementation:
1. Verify `Authorization: Bearer ${LB_SYSTEM_KEY}` header
2. Validate required fields: `user_id`, `type`, `title`
3. Validate `type` against allowed list
4. Insert into `notifications` table
5. Return the created notification ID and timestamp

### 5D: Wire Notifications Into Existing Systems

Add a one-liner `create-notification` call at these integration points:

**1. Welcome notification** (in Membership Gate, after successful payment):
```
type: 'welcome'
title: 'Welcome to Liana Banyan!'
body: 'Your Access Key is active. You have 5 starter Credits. Start with your first Treasure Map.'
link: '/first-steps'
```

**2. Commerce Engine** (in `distribute-order-earnings` edge function):
```
type: 'order_update'
title: 'You earned Credits!'
body: 'Your order earned [amount] Credits from [storefront_name].'
link: '/dashboard'
```

**3. Star Chamber verdict** (in Star Chamber verdict handler):
```
type: 'star_chamber'
title: 'Case verdict delivered'
body: 'Case #[case_number] has received a verdict.'
link: '/star-chamber/case/[case_id]'
```

**4. Design Arena battle result** (in battle resolution logic from K87):
```
type: 'arena_result'
title: 'Battle results are in!'
body: 'The [category] Design Battle has ended. Check your results.'
link: '/design-battle'
```

**5. Congress API bill update** (in `congress-api-sync` edge function, K90):
```
type: 'bill_update'
title: 'Bill update: [bill_number]'
body: '[latest_action_description]'
link: '/political-expedition'
```

For the edge function integrations (distribute-order-earnings, congress-api-sync), call `create-notification` via internal Supabase function invoke. For client-side integrations (Star Chamber, Arena), call the edge function URL with the system key.

---

## TASK 6: Funnel Wiring

Connect all entry points into the linear flow. This is the hallway.

### Route Flow

```
Visitor arrives
    ↓
/  (Index) ──→ "Get Started" CTA ──→ /welcome
                                         ↓
/red-carpet/* ──→ RedCarpet processing ──→ /welcome (with context preserved in localStorage)
                                         ↓
/welcome (Guided Discovery Wizard)
    Screen 1: What brings you here?
    Screen 2: How did you hear about us?
    Screen 3: Here's your path
    Screen 4: Join for $5
                    ↓
/join (Membership Gate)
    Stripe Checkout → $5 payment
    On success → create profile, seed Credits, assign maps
                    ↓
/first-steps (First Steps Dashboard)
    Your Path → Your Card → Quick Actions
    After 3 visits → auto-redirect
                    ↓
/dashboard (Full Dashboard)
```

### Specific Wiring Changes

**Index.tsx** (`/`):
- Add a prominent "Get Started" CTA button in the hero section
- Button navigates to `/welcome`
- Style: primary button, large, above the fold

**RedCarpet.tsx** (after processing entry mode):
- After entry context is stored (slug, referral code, etc.), redirect to `/welcome`
- Preserve entry context in localStorage alongside discovery state

**OnboardingStart.tsx** (`/onboarding`):
- Replace the component body with a redirect to `/welcome`
- Keep the file for backward compatibility but its only job is: `useEffect(() => navigate('/welcome'), [])`

**App.tsx**:
- Add routes:
  - `/welcome` → `GuidedDiscovery`
  - `/discover` → redirect to `/welcome`
  - `/join` → `MembershipGate`
  - `/first-steps` → `FirstSteps` (protected)
  - `/member/:username` → `MemberProfile`

---

## TASK 7: Navigation Updates

### Top Nav

- Add `NotificationBell` component to the right side of the top nav bar, next to the user avatar/menu
- Only show when user is authenticated
- Bell + avatar should be visually grouped

### Sidebar

- Add "My Profile" link in the user section of the sidebar
- Links to `/member/[current_user_username]`
- Icon: User (Lucide)
- Position: directly under any existing user-related links

### Dashboard Widget

- Add a "Complete Your Profile" card to the Dashboard
- Show only if `member_profiles` row is missing OR if `display_name` is null OR `bio` is null
- Card text: "Your profile is incomplete. A complete profile helps your community find you."
- CTA: "Complete Profile" → `/member/[username]?edit=true`
- Dismiss option: store dismissal in localStorage

---

## TASK 8: Update Stats

Update `useCanonicalStats.ts` DEFAULTS to innovation count: **1,936**

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/pages/GuidedDiscovery.tsx` | 4-screen onboarding wizard |
| `src/pages/MembershipGate.tsx` | $5 Access Key payment page |
| `src/pages/FirstSteps.tsx` | Post-signup simplified dashboard |
| `src/pages/MemberProfile.tsx` | Public member profile with activity sections |
| `src/components/notifications/NotificationBell.tsx` | Bell icon with unread count badge |
| `src/components/notifications/NotificationPanel.tsx` | Dropdown notification list |
| `supabase/functions/create-notification/index.ts` | Notification creation edge function |
| `supabase/migrations/20260323000023_front_door.sql` | member_profiles + notifications tables |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes: /welcome, /discover, /join, /first-steps, /member/:username |
| `src/pages/Index.tsx` | Add "Get Started" CTA button → /welcome |
| `src/pages/OnboardingStart.tsx` | Replace body with redirect to /welcome |
| `src/components/layout/Sidebar.tsx` (or equivalent) | Add "My Profile" link |
| `src/components/layout/TopNav.tsx` (or equivalent) | Add NotificationBell |
| `src/pages/Dashboard.tsx` | Add "Complete Your Profile" card |
| `supabase/functions/distribute-order-earnings/index.ts` | Add notification call after earnings distribution |
| `src/pages/PoliticalExpedition.tsx` | Wire bill update notifications (if client-side tracking exists) |
| `useCanonicalStats.ts` | Innovation count → 1,936 |

## DO NOT TOUCH

- Housing files (K89)
- Ghost World files (K88)
- Congress API edge function internals (K90) — only ADD notification call, do not refactor
- Arena/Emporium/Crew Tables UI (K87) — only ADD notification emit on battle result
- Vehicle files (K85)
- Star Chamber AI logic (K79/K80) — only ADD notification emit on verdict
- MoneyPenny files (K84)
- Calendar files (K82)
- Treasure Map game logic (K81) — only READ from treasure_map_progress

---

## BUILD ORDER

```
Migration (member_profiles + notifications tables) — FIRST, everything depends on these
  ↓
Task 1 (Guided Discovery wizard) ──┐
Task 2 (Membership Gate)          ──┤── PARALLEL — no dependencies between them
Task 4 (Member Profile page)      ──┘
  ↓
Task 3 (First Steps dashboard) — needs Task 2 (payment redirect target)
  ↓
Task 5 (Notification spine) — needs tables from migration
  ↓
Task 6 (Funnel wiring) — needs Tasks 1-3 to exist
Task 7 (Nav updates) — needs Task 4 + Task 5
  ↓
Task 8 (Stats update) — anytime
```

---

## DEPLOY CHECKLIST

1. Push migration: `npx supabase db push --linked`
2. Deploy edge function: `npx supabase functions deploy create-notification`
3. Create "$5 Access Key" product in Stripe Dashboard (price: $5.00, one-time)
4. `npm run build` — zero errors
5. `firebase deploy --only hosting:main`
6. Test full funnel: `/` → click "Get Started" → `/welcome` → complete wizard → `/join` → pay $5 → `/first-steps`
7. Test profile: `/member/testuser` → profile page renders with activity sections
8. Test notification bell: shows in top nav with unread count
9. Test notification: complete a commerce order → notification appears in panel
10. Test redirect: visit `/first-steps` 3 times → auto-redirects to `/dashboard`
11. Test OnboardingStart: visit `/onboarding` → redirects to `/welcome`
12. Test non-member: visit `/join` directly without wizard → page works, skips map assignment

---

## SUCCESS CRITERIA

- [ ] Guided Discovery wizard renders 4 screens with card selection
- [ ] Discovery selections persist in localStorage across screens
- [ ] Recommended Treasure Maps display based on tag selections
- [ ] $5 payment processes through Stripe Checkout
- [ ] Member profile record created in `member_profiles` on signup
- [ ] 5 starter Credits seeded into new member's account
- [ ] Treasure Map progress entries created from discovery recommendations
- [ ] "As You Wish" confirmation displays after successful payment
- [ ] First Steps page shows personalized content based on tags
- [ ] First Steps auto-redirects to Dashboard after 3 visits
- [ ] Member Profile page displays avatar, name, bio, location, tags
- [ ] Profile activity sections show maps, arena, crew tables, ghost world data
- [ ] Profile edit mode works for own profile only
- [ ] NotificationBell shows in top nav with red unread count badge
- [ ] NotificationPanel lists notifications with type icons and timestamps
- [ ] Click notification marks it read and navigates to link
- [ ] "Mark all read" clears all unread notifications
- [ ] Welcome notification created on signup
- [ ] Commerce earnings notification fires from distribute-order-earnings
- [ ] At least 3 existing systems emit notifications
- [ ] All entry points funnel through /welcome → /join → /first-steps
- [ ] OnboardingStart.tsx redirects to /welcome
- [ ] Index.tsx has "Get Started" CTA
- [ ] Sidebar has "My Profile" link
- [ ] Dashboard shows "Complete Your Profile" card for incomplete profiles
- [ ] Zero console errors

---

Seventeen rooms. One hallway. The front door is open.

**FOR THE KEEP.**