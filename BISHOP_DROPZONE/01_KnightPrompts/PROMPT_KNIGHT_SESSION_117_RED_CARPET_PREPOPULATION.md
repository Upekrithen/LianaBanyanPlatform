# KNIGHT SESSION 117: Red Carpet Pre-Population — Demand-Signal Showcase for Creator Onboarding

## Brief
Call `brief_me("red carpet pre-population, demand signal showcase, creator onboarding cold-start")`

## Context
K116 deployed Turn-Key Project Templates + Cue Card Campaign System. The Turn-Key wizard, project directory, project detail pages, matched funding bars, tier cascade visualization, and 7 seed Cue Cards are all live. Now we add the killer onboarding loop: Red Carpet Pre-Population (#1948).

This is the cold-start solution. Instead of waiting for creators to find us, we pre-populate their projects, let the community pledge real Credits, and then show the creator: "947 people want your product. $2,340 pledged. Sign up for $5 and it's yours."

Canonical stats: 1,989 innovations | 1,511 claims | 10 provisionals | 21 production systems

**CRITICAL RULE:** Platform tokens/credits are NOT securities. Never use 'equity', 'shares', 'dividends', 'ROI', or 'invest'. Use 'participation', 'allocation', 'contribution', 'back'. Never promise passive income. Use 'may earn' not 'will earn'. Buyers purchase PRODUCTS at retail price, not investment interests. Pledges are escrowed pre-orders, not investments.

## Deliverable 1: Extend Turn-Key Projects for SHOWCASED Status

### Migration: `20260326000012_red_carpet_showcase.sql`
```sql
-- Add 'showcased' to turnkey_projects status check
ALTER TABLE turnkey_projects DROP CONSTRAINT IF EXISTS turnkey_projects_status_check;
ALTER TABLE turnkey_projects ADD CONSTRAINT turnkey_projects_status_check 
  CHECK (status IN ('draft', 'showcased', 'active', 'funded', 'producing', 'complete', 'paused'));

-- Add showcase-specific fields
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS is_showcased BOOLEAN DEFAULT false;
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_source_url TEXT;
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_source_platform TEXT 
  CHECK (showcase_source_platform IN ('reddit', 'etsy', 'instagram', 'discord', 'twitter', 'tiktok', 'website', 'manual'));
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_created_by UUID REFERENCES auth.users(id);
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS showcase_expires_at TIMESTAMPTZ;
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id);
ALTER TABLE turnkey_projects ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Demand signals table
CREATE TABLE IF NOT EXISTS showcase_demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('want', 'pledge', 'comment')),
  credits_pledged INT DEFAULT 0,
  comment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id, signal_type)
);

-- Pledge escrow tracking
CREATE TABLE IF NOT EXISTS showcase_pledge_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  credits_amount INT NOT NULL,
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'converted', 'refunded')),
  escrowed_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE showcase_demand_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_pledge_escrow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view demand signals" ON showcase_demand_signals FOR SELECT USING (true);
CREATE POLICY "Users manage own signals" ON showcase_demand_signals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view escrow counts" ON showcase_pledge_escrow FOR SELECT USING (true);
CREATE POLICY "Users manage own escrow" ON showcase_pledge_escrow FOR ALL USING (auth.uid() = user_id);

-- Update RLS on turnkey_projects to allow viewing showcased projects
DROP POLICY IF EXISTS "Anyone can view active projects" ON turnkey_projects;
CREATE POLICY "Anyone can view published projects" ON turnkey_projects 
  FOR SELECT USING (status IN ('showcased', 'active', 'funded', 'producing', 'complete') OR auth.uid() = creator_id);
```

## Deliverable 2: Red Carpet Showcase Banner + Demand UI

### Components

**`RedCarpetBanner.tsx`** — Prominent banner displayed on SHOWCASED project pages:
```
┌──────────────────────────────────────────────────────┐
│  🎪 RED CARPET SHOWCASE                              │
│                                                      │
│  This creator hasn't joined Liana Banyan yet.        │
│  Show them you want their product.                   │
│                                                      │
│  ⭐ [count] people want this                         │
│  💰 [amount] Credits pledged                         │
│  💬 [count] comments                                 │
│                                                      │
│  [I Want This ⭐]  [Pledge Credits 💰]               │
└──────────────────────────────────────────────────────┘
```

Styling: Amber/gold gradient background, prominent placement above the project content. Should feel like a VIP invitation.

**`DemandSignalPanel.tsx`** — Sidebar panel showing demand breakdown:
- "I Want This" count with individual avatars (first 10, then "+X more")
- Total Credits pledged with progress ring
- Comments feed (newest first, max 10 shown, "View all" link)
- "Pledge Credits" button opens pledge modal

**`PledgeModal.tsx`** — Modal for pledging Credits:
- Slider: 5 to 500 Credits
- Explanation: "Your Credits will be held in escrow. If [Creator] joins, your pledge converts to a pre-order. If they don't join within 90 days, your Credits are returned."
- "Pledge [X] Credits" confirm button
- On confirm: insert into `showcase_demand_signals` (type: 'pledge') + `showcase_pledge_escrow` (status: 'held')

**`WantThisButton.tsx`** — One-click "I Want This" button:
- Toggle button (click to want, click again to un-want)
- Shows count next to star icon
- On click: insert/delete from `showcase_demand_signals` (type: 'want')
- No Credits required — this is a free signal

**`ShowcaseCommentForm.tsx`** — Comment form for showcased projects:
- Simple textarea + "Post Comment" button
- On submit: insert into `showcase_demand_signals` (type: 'comment', comment_text)
- Display below demand panel as a feed

### Hooks
- `useShowcaseDemand(projectId)` — fetch all demand signals (want count, pledge total, comments)
- `usePledgeCredits()` — mutation for pledging Credits to escrow
- `useToggleWant()` — mutation for toggling "I Want This"
- `useShowcaseComment()` — mutation for posting a comment

## Deliverable 3: Showcase Admin — Pre-Population Interface

New page: `/admin/showcase` (admin-only, behind ProtectedRoute + admin check)

**Purpose:** Platform admins pre-populate projects from prospective creators.

**Form Fields:**
- Creator name (text)
- Source URL (the Reddit post, Etsy listing, Instagram profile, etc.)
- Source platform (dropdown: Reddit, Etsy, Instagram, Discord, Twitter, TikTok, Website, Manual)
- Product title
- Product description (can paste from source)
- Category (dropdown — same as Turn-Key categories)
- Upload images (drag & drop, up to 5)
- Assign Cue Card (dropdown of existing Cue Cards)
- Expiration (default: 90 days from now)

**On Submit:**
- Creates a `turnkey_projects` record with `status: 'showcased'`, `is_showcased: true`
- Sets `showcase_source_url`, `showcase_source_platform`, `showcase_created_by`, `showcase_expires_at`
- Project immediately appears in `/projects` directory with SHOWCASED badge

**Admin List View:**
- Table of all showcased projects
- Columns: Creator Name, Product, Source, Demand Count, Credits Pledged, Expires, Status
- Actions: Edit, Archive, "Send Red Carpet" (generates outreach link)

## Deliverable 4: Project Directory — Showcase Integration

Update the existing `/projects` page (ProjectDirectory.tsx from K116):

- Add a "Showcase" filter tab alongside existing category/sort filters
- SHOWCASED projects display with amber border and 🎪 badge
- Sort option: "Most Wanted" (by demand signal count)
- Sort option: "Most Pledged" (by total Credits in escrow)
- SHOWCASED projects show "X people want this" instead of Early Adopter count

Update `/projects/:slug` (TurnKeyProjectDetail.tsx from K116):

- If project `status === 'showcased'`:
  - Show `RedCarpetBanner` at top instead of normal backing panel
  - Show `DemandSignalPanel` in sidebar instead of tier cascade
  - Hide "Back This Project" button (replaced by "Pledge Credits" and "I Want This")
  - Show source attribution: "Spotted on [platform]" with link
- If project `status === 'active'` (creator claimed it):
  - Normal Turn-Key display
  - Show conversion banner: "🎉 [Creator] joined! Your pledges are now pre-orders."

## Deliverable 5: Claim Flow — Creator Takes Ownership

When a creator clicks their personalized Red Carpet link and signs up:

New page: `/projects/:slug/claim` (behind ProtectedRoute)

**Claim Flow:**
1. Creator sees their showcased project page with all demand data
2. Banner: "This is your product! Claim it to receive [X] Credits in pre-orders from [Y] people."
3. "Claim This Project" button
4. On claim:
   - Verify creator is a Member or Builder ($5+ subscription)
   - Set `claimed_by` and `claimed_at` on project
   - Change `status` from `showcased` to `active`
   - Convert all `showcase_pledge_escrow` records from `held` to `converted`
   - Move converted Credits into the project's `community_matched` field
   - Convert "I Want This" signals into Early Adopter notification list
   - Notify all pledgers: "Your pledge converted! [Creator] is now producing [Product]."
5. Creator lands on their project edit page — can update description, add STL files, adjust pricing

**If creator doesn't sign up within 90 days:**
- All `showcase_pledge_escrow` records change from `held` to `refunded`
- Credits returned to pledgers
- Project status changes to `paused`
- Notification to pledgers: "The creator didn't join. Your Credits have been returned."

## Deliverable 6: Navigation + Wiring

### App.tsx Routes
```tsx
<Route path="/projects/:slug/claim" element={<ProtectedRoute><ShowcaseClaimPage /></ProtectedRoute>} />
<Route path="/admin/showcase" element={<ProtectedRoute><ShowcaseAdminPage /></ProtectedRoute>} />
```

### UnifiedNavigation
No changes needed — showcased projects appear in the existing `/projects` directory.

### Canonical Stats
Update `useCanonicalStats.ts` DEFAULTS:
- `innovationCount: 1989` (was 1988)

## Build + Deploy
Build and deploy all 8 hosting targets when complete.

## Quality Checks
- [ ] Showcased project displays Red Carpet Banner with demand counts
- [ ] "I Want This" toggle works (add/remove signal)
- [ ] Pledge Credits modal creates escrow record
- [ ] Comments appear in demand panel feed
- [ ] Admin can pre-populate a showcased project from source URL
- [ ] Showcased projects appear in /projects directory with amber badge
- [ ] "Most Wanted" and "Most Pledged" sort options work
- [ ] Claim flow converts escrow to matched backing
- [ ] 90-day expiration returns Credits to pledgers
- [ ] All pledgers notified on claim conversion
- [ ] No securities language anywhere
- [ ] All 8 Firebase targets deployed

## Design Notes
- The Red Carpet Banner should feel EXCITING — amber/gold, sparkle energy. This is the "we already want your stuff" moment.
- Demand numbers should be BIG and prominent. "947 people want this" is the hook.
- The pledge flow must feel safe — "Your Credits are held, not spent. You get them back if the creator doesn't join."
- The claim flow should feel like a celebration — confetti animation on claim, "Welcome!" banner, immediate access to edit.
- Admin showcase page is utilitarian — speed matters. Paste URL, fill fields, submit. We'll pre-populate 50+ projects in the first week.
- SHOWCASED projects ARE content. They solve the empty marketplace problem from day one.

## SEC Compliance Notes
- Pledges are escrowed PRE-ORDERS for a specific product at a specific price, not investments.
- Credits pledged buy a PRODUCT, not a stake in anything.
- "I Want This" is demand signaling, not a commitment.
- The platform holds escrow as a marketplace intermediary, not as a funding portal.
- No "all-or-nothing" funding goals — each pledge is an individual pre-order intention.
- Refund within 90 days if creator doesn't join — this is a purchase protection mechanism.

## FOR THE KEEP.
