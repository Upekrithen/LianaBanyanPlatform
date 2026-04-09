# KNIGHT SESSION 93 — Personal Red Carpet + Cue Card Slingshot
## Bishop 029 | March 23, 2026
## Innovation Count: 1,938
## Based on: K92 ADAPT Score (deployed), K91 Front Door (deployed)

---

## MISSION

Build the viral growth engine. The Front Door (K91) lets people in. K93 makes every invitation personal and every act of service a client pipeline. Personal Red Carpet (#1917) generates context-encoded invitation links that produce customized onboarding per invitee. Cue Card Slingshot (#1914) auto-slots Shepherds as the default service provider for downstream customers of businesses they've served. Together they create organic, structural growth — not marketing campaigns.

**Previous session**: K92 built ADAPT Score — 6 tables, 4-tab dashboard, constitutional check logic, radar charts, SOP pipeline, integration partner directory, bounty system. Migration 20260323000024. Innovation count: 1,938.

---

## CONTEXT: WHAT EXISTS

| System | Route / Location | Status |
|--------|-----------------|--------|
| Front Door | `/welcome`, `/join`, `/first-steps` | LIVE (K91) |
| ADAPT Score | `/adapt-score` | LIVE (K92) |
| Ghost World | `/ghost-world` | LIVE (K88) |
| Housing | `/housing` | LIVE (K89) |
| Congress API | `/political-expedition` | LIVE (K90) |
| Design Arena | `/design-battle` | LIVE (K87) |
| Emporium | `/emporium` | LIVE (K87) |
| Crew Tables | `/crew-tables` | LIVE (K87) |
| Commerce Engine | storefronts, orders, earnings | LIVE (K80) |
| Star Chamber | `/star-chamber` | LIVE (K79/K80) |
| MoneyPenny | edge functions | LIVE (K84) |
| Crew Calls | `/crew-calls` | LIVE (K83) |
| Calendar | `/calendar` | LIVE (K82) |
| Beacon | Two-Bite Teaching | LIVE (K75/K82) |
| Treasure Map | `/treasure-maps` | LIVE (K81) |
| Notifications | bell + panel | LIVE (K91) |
| Lemon Lot | `/lemon-lot` | LIVE (K85) |
| Local Wheels | `/local-wheels` | LIVE (K85) |
| Rideshare Routes | `/rideshare-routes` | LIVE (K85) |
| Political Expedition | `/political-expedition` | LIVE (K86) |

**K91 tables available**: `member_profiles`, `notifications`. The Front Door has: GuidedDiscovery wizard, MembershipGate ($5 Access Key), FirstSteps onboarding, NotificationBell + NotificationPanel.

**K80 tables available**: `storefronts`, `storefront_items`, `menu_orders`, `storefront_transfers`.

**K83 tables available**: `crew_calls`, `crew_call_responses`.

**K87 tables available**: `arena_submissions`, `crew_tables`, `crew_table_seats`.

---

## TASK 1: Migration

**File**: `supabase/migrations/20260323000025_red_carpet_slingshot.sql`

```sql
-- ============================================
-- MIGRATION: 20260323000025_red_carpet_slingshot.sql
-- Knight Session 93: Personal Red Carpet + Cue Card Slingshot
-- 4 tables: invitations, invitation_beacon_stops, slingshot_slots, slingshot_history
-- ============================================

-- =====================
-- INVITATIONS: Context-encoded invitation links
-- =====================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id),
  invite_code TEXT UNIQUE NOT NULL,
  -- Context fields (encoded into the link)
  suggested_role TEXT,
  -- e.g., 'delivery_driver', 'shade_tree_mechanic', 'storefront_owner',
  -- 'family_member', 'neighbor', 'designer', 'cook', 'volunteer'
  initiative_connection TEXT,
  -- e.g., 'rally_group', 'lets_make_bread', 'mission_one', 'lifeline'
  personal_message TEXT,
  inviter_node TEXT,
  -- geographic / business context
  inviter_business_id UUID,
  -- if inviter has a storefront, link to it
  -- Tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  invitee_id UUID REFERENCES auth.users(id),
  -- set when someone claims the invite
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviters manage own invitations"
  ON invitations FOR ALL
  USING (auth.uid() = inviter_id);

CREATE POLICY "Anyone can read active invitations by code"
  ON invitations FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admin manages all invitations"
  ON invitations FOR ALL
  USING (public.is_admin());

CREATE UNIQUE INDEX idx_invitations_code ON invitations(invite_code);
CREATE INDEX idx_invitations_inviter ON invitations(inviter_id);
CREATE INDEX idx_invitations_status ON invitations(status, expires_at);

-- =====================
-- INVITATION BEACON STOPS: Which beacon stops are prioritized for this invitation
-- =====================
CREATE TABLE IF NOT EXISTS invitation_beacon_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  beacon_key TEXT NOT NULL,
  -- e.g., 'rally_group', 'commerce_engine', 'lemon_lot', 'mission_one'
  priority_order INT NOT NULL,
  -- 1 = first stop, 2 = second, etc. Max 8 stops per invitation
  is_required BOOLEAN DEFAULT true
  -- required stops always show; optional stops appear in "Explore More"
);

ALTER TABLE invitation_beacon_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read beacon stops"
  ON invitation_beacon_stops FOR SELECT
  USING (true);

CREATE POLICY "Admin manages beacon stops"
  ON invitation_beacon_stops FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_beacon_stops_invitation ON invitation_beacon_stops(invitation_id, priority_order);

-- =====================
-- SLINGSHOT SLOTS: Auto-slot tracking for Shepherds
-- =====================
CREATE TABLE IF NOT EXISTS slingshot_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shepherd_id UUID NOT NULL REFERENCES auth.users(id),
  origin_business_id UUID NOT NULL,
  -- the storefront whose cue card the shepherd designed
  origin_submission_id UUID REFERENCES arena_submissions(id),
  -- the specific arena submission that created this slingshot
  service_type TEXT NOT NULL,
  -- 'cue_card', 'logo', 'menu_template', 'photography', 'branding', 'general'
  generation INT DEFAULT 1 CHECK (generation >= 1 AND generation <= 3),
  -- 1 = direct customer of origin business
  -- 2 = customer of a customer (weaker)
  -- 3 = max reach (general pool ranking only)
  is_active BOOLEAN DEFAULT true,
  -- deactivates if shepherd lapses monthly Mark
  total_jobs_from_slot INT DEFAULT 0,
  total_earnings_from_slot NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_job_at TIMESTAMPTZ
);

ALTER TABLE slingshot_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shepherds view own slots"
  ON slingshot_slots FOR SELECT
  USING (auth.uid() = shepherd_id);

CREATE POLICY "Members view active slots for matching"
  ON slingshot_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin manages all slots"
  ON slingshot_slots FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_slingshot_shepherd ON slingshot_slots(shepherd_id, is_active);
CREATE INDEX idx_slingshot_origin ON slingshot_slots(origin_business_id, service_type);
CREATE INDEX idx_slingshot_generation ON slingshot_slots(generation, is_active);

-- =====================
-- SLINGSHOT HISTORY: Job tracking from slingshot-matched work
-- =====================
CREATE TABLE IF NOT EXISTS slingshot_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES slingshot_slots(id),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  -- the downstream customer who received the auto-slot suggestion
  accepted BOOLEAN,
  -- did the customer accept the auto-slotted shepherd?
  override_shepherd_id UUID REFERENCES auth.users(id),
  -- if customer chose someone else
  job_amount NUMERIC(10,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE slingshot_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shepherds view own history"
  ON slingshot_history FOR SELECT
  USING (auth.uid() = (SELECT shepherd_id FROM slingshot_slots WHERE id = slot_id));

CREATE POLICY "Customers view own history"
  ON slingshot_history FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Admin manages all history"
  ON slingshot_history FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_slingshot_history_slot ON slingshot_history(slot_id);
CREATE INDEX idx_slingshot_history_customer ON slingshot_history(customer_id);

-- =====================
-- ROLE-TO-INITIATIVE MAPPING: Used by Red Carpet to select beacon stops
-- =====================
CREATE TABLE IF NOT EXISTS role_initiative_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  primary_initiatives TEXT[] NOT NULL,
  -- initiative keys in priority order
  recommended_treasure_map TEXT,
  -- which of the 12 maps to start on
  first_bounty_type TEXT,
  -- category of starter bounty to pre-load
  beacon_stop_keys TEXT[] NOT NULL
  -- ordered beacon stops for this role's Red Carpet run
);

ALTER TABLE role_initiative_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read role map"
  ON role_initiative_map FOR SELECT
  USING (true);

CREATE POLICY "Admin manages role map"
  ON role_initiative_map FOR ALL
  USING (public.is_admin());

-- SEED: Role-to-initiative mappings
INSERT INTO role_initiative_map (role_key, display_name, primary_initiatives, recommended_treasure_map, first_bounty_type, beacon_stop_keys) VALUES
  ('delivery_driver', 'Delivery Driver', ARRAY['rally_group', 'local_wheels'], 'routes', 'delivery', ARRAY['rally_group', 'local_wheels', 'commerce_engine', 'crew_calls', 'lemon_lot', 'calendar', 'treasure_map', 'notifications']),
  ('shade_tree_mechanic', 'Shade-Tree Mechanic', ARRAY['rally_group', 'crew_calls'], 'service_runner', 'vehicle_inspection', ARRAY['crew_calls', 'lemon_lot', 'local_wheels', 'safety_ledger', 'commerce_engine', 'calendar', 'treasure_map', 'notifications']),
  ('storefront_owner', 'Business Owner', ARRAY['lets_make_bread', 'commerce_engine'], 'breakfast', 'setup_storefront', ARRAY['commerce_engine', 'emporium', 'crew_tables', 'design_arena', 'calendar', 'subscriptions', 'treasure_map', 'notifications']),
  ('cook', 'Cook / Food Service', ARRAY['stocked_local_larder', 'lets_make_bread'], 'breakfast', 'first_menu_item', ARRAY['commerce_engine', 'stocked_local_larder', 'crew_calls', 'calendar', 'emporium', 'treasure_map', 'subscriptions', 'notifications']),
  ('designer', 'Designer / Artist', ARRAY['the_forge', 'arena'], 'maker', 'arena_submission', ARRAY['design_arena', 'emporium', 'crew_tables', 'commerce_engine', 'ghost_world', 'treasure_map', 'calendar', 'notifications']),
  ('volunteer', 'Volunteer', ARRAY['mission_one', 'lifeline'], 'helper', 'first_volunteer_shift', ARRAY['mission_one', 'crew_calls', 'stocked_local_larder', 'calendar', 'notifications', 'treasure_map', 'beacon', 'ghost_world']),
  ('family_member', 'Family Member', ARRAY['household_concierge', 'family_table'], 'family', 'family_table_accept', ARRAY['notifications', 'calendar', 'commerce_engine', 'treasure_map', 'ghost_world', 'beacon', 'crew_calls', 'housing']),
  ('neighbor', 'Neighbor', ARRAY['mission_one', 'stocked_local_larder'], 'helper', 'first_delivery_accept', ARRAY['mission_one', 'stocked_local_larder', 'commerce_engine', 'crew_calls', 'housing', 'calendar', 'treasure_map', 'notifications']),
  ('teacher', 'Teacher / Educator', ARRAY['didasko', 'academy'], 'educator', 'first_lesson', ARRAY['didasko', 'ghost_world', 'design_arena', 'treasure_map', 'calendar', 'notifications', 'beacon', 'crew_tables']),
  ('musician', 'Musician / Creator', ARRAY['jukebox', 'the_forge'], 'maker', 'first_track_upload', ARRAY['jukebox', 'design_arena', 'emporium', 'crew_tables', 'ghost_world', 'commerce_engine', 'treasure_map', 'notifications'])
ON CONFLICT (role_key) DO NOTHING;
```

---

## TASK 2: Invitation Generator

### Route: `/invite` (new page) — also accessible from profile and Helm

**File**: `src/pages/InviteGenerator.tsx`

### 2A: Generate Invitation Form

Layout: Clean card-based form. Header: "Invite Someone to Liana Banyan" with subtitle "Every invitation is personal."

**Fields**:

1. **Who are you inviting?** (suggested_role) — Select dropdown populated from `role_initiative_map`:
   - Delivery Driver
   - Shade-Tree Mechanic
   - Business Owner
   - Cook / Food Service
   - Designer / Artist
   - Volunteer
   - Family Member
   - Neighbor
   - Teacher / Educator
   - Musician / Creator

2. **What will they work on?** (initiative_connection) — Auto-populated from the selected role's `primary_initiatives`, displayed as friendly names. User can change.

3. **Your business** (inviter_business_id) — Dropdown of the inviter's storefronts (query `storefronts` WHERE `owner_id = auth.uid()`). Optional. Only shown if user has storefronts.

4. **Personal message** (personal_message) — Textarea, max 280 characters. Optional. Placeholder: "Hey, I think you'd be great at..."

5. **Generate Link** button.

### 2B: Link Generation Logic

On submit:
1. Generate a unique `invite_code`: 8-character alphanumeric (use `crypto.randomUUID().slice(0,8)` or similar)
2. Insert into `invitations` table with all context fields
3. Query `role_initiative_map` for the selected role → get `beacon_stop_keys`
4. Insert rows into `invitation_beacon_stops` with priority_order 1-8
5. If inviter has a storefront AND selected role is 'storefront_owner' or 'cook' or 'delivery_driver':
   - Create a `slingshot_slot` for the inviter as shepherd for the new member's future work
   - Set `generation = 1`, `service_type` based on role
6. Display the generated link: `https://lianabanyan.com/welcome?invite={invite_code}`
7. Copy-to-clipboard button, share via text/email buttons, QR code (use a simple QR library or Canvas API)

### 2C: My Invitations Dashboard

Below the generator form, show a list of the user's sent invitations:

| Column | Content |
|--------|---------|
| Code | Invite code (truncated) |
| Role | Display name from role_initiative_map |
| Status | Active / Used / Expired badge |
| Sent | Date |
| Claimed by | Invitee display name (if used) |

Stats banner at top: "You've invited X people. Y have joined. Z are active."

---

## TASK 3: Red Carpet Welcome Flow

### Modify: Front Door Welcome Page

The existing `/welcome` route (GuidedDiscovery from K91) needs to detect invitation context.

### 3A: Invitation Detection

When `/welcome` loads, check for `?invite=` URL parameter.

If present:
1. Query `invitations` WHERE `invite_code = param` AND `status = 'active'` AND `expires_at > now()`
2. If found → render **Red Carpet Welcome** instead of generic GuidedDiscovery
3. If not found (expired/used/invalid) → render generic GuidedDiscovery with subtle message: "This invitation has expired. You can still join!"

### 3B: Red Carpet Welcome Component

**File**: `src/components/onboarding/RedCarpetWelcome.tsx`

Props:
```typescript
interface RedCarpetWelcomeProps {
  invitation: {
    id: string;
    inviter_id: string;
    suggested_role: string;
    initiative_connection: string;
    personal_message: string | null;
    inviter_business_id: string | null;
  };
  inviterProfile: {
    display_name: string;
    avatar_url: string | null;
  };
  roleInfo: {
    display_name: string;
    beacon_stop_keys: string[];
    recommended_treasure_map: string;
    first_bounty_type: string;
  };
}
```

**Layout — 3 Steps**:

**Step 1: Personal Welcome**
```
Welcome to Liana Banyan

You were invited by [Inviter Name] [avatar]
[If business]: from [Business Name]

[If personal_message]: "[message]"

[Inviter Name] thinks you'd be great as a [Role Display Name].

[Continue →]
```

**Step 2: Your Path (Tailored Beacon Run)**
- Show the first 4 beacon stops from `invitation_beacon_stops` (priority_order 1-4) as preview cards
- Each card: Icon + system name + one-sentence description
- "These are your first stops. There's much more to explore."
- [Start Your Journey →]

**Step 3: Join**
- Reuse the existing MembershipGate ($5 Access Key) from K91
- After payment/join, update the invitation: `status = 'used'`, `invitee_id = auth.uid()`, `used_at = now()`
- Set the new member's `member_profiles` `interests` field from the role's `primary_initiatives`
- Set the new member's default treasure map from `recommended_treasure_map`
- Trigger notification to inviter: "Your invitation was accepted by [new member name]!"
- Redirect to `/first-steps` (existing K91 flow) but with Red Carpet beacon ordering

### 3C: First Steps Override

Modify the existing FirstSteps component (from K91) to check if the member arrived via invitation:
- Query `invitations` WHERE `invitee_id = auth.uid()` → if found, load the `invitation_beacon_stops` ordering
- Reorder the beacon stops displayed in FirstSteps to match the invitation's priority order
- Show "Recommended by [inviter name]" badge on the first 3 stops
- Remaining platform stops appear under "Explore More" section

---

## TASK 4: Cue Card Slingshot System

### 4A: Auto-Slot Creation (on Arena Submission Approval)

Modify the STAMP Review approval handler in `DesignBattleArena.tsx` (or wherever the approval logic lives from K87):

When an arena submission is approved AND the submission's category is one of: `'cue_card_template'`, `'logo'`, `'menu_template'`, `'business_card_template'`:

1. Check if the submission's `creator_id` already has a `slingshot_slot` for that `origin_business_id` and `service_type`
2. If not → create a new `slingshot_slot`:
   ```
   shepherd_id: submission.creator_id
   origin_business_id: (determine from context — see 4B)
   origin_submission_id: submission.id
   service_type: map category to service_type
   generation: 1
   is_active: true
   ```
3. Toast to the creator (via notification): "Your design is now generating referrals! When customers of [Business Name] need design work, you'll be recommended first."

### 4B: Business Context for Slingshot

The origin_business_id links the slingshot to a specific storefront. Two paths:

**Path 1: Direct commission** — A storefront owner commissions a design via the Emporium "Commission This Designer" flow. The `origin_business_id` is the commissioner's storefront ID.

**Path 2: Template purchase** — A storefront owner purchases a template via "Use This Template." The `origin_business_id` is the purchaser's storefront ID.

In both cases, after a successful Emporium transaction involving a design template:
1. Get the buyer's storefront ID from `storefronts WHERE owner_id = buyer_id`
2. Create slingshot_slot linking the designer (seller) to the buyer's business
3. The slot is now active — when the buyer's CUSTOMERS start their own projects, the designer auto-slots

### 4C: Auto-Slot Display (Matching Interface)

**File**: `src/components/slingshot/SlingshotSuggestion.tsx`

When a member is browsing the Emporium or creating a new storefront:

1. Query: Does this member have a "parent" storefront? (Are they a customer of any LB business?)
   - Check `menu_orders` WHERE `customer_id = auth.uid()` → get `storefront_id` → that's the parent business
2. If parent business found → query `slingshot_slots` WHERE `origin_business_id = parent_storefront_id` AND `is_active = true`
3. If slot found → display suggestion banner at top of Emporium:

```
┌──────────────────────────────────────────────────────────┐
│ 🎯 Recommended for you                                  │
│                                                          │
│ [Designer Name] designed the cue card for [Business].    │
│ They're available to design yours too.                   │
│                                                          │
│ [View Their Work]  [Commission Them]  [Browse Others]    │
└──────────────────────────────────────────────────────────┘
```

4. "View Their Work" → filters Emporium to that designer's submissions
5. "Commission Them" → opens commission request form pre-filled with designer
6. "Browse Others" → dismisses banner, shows full Emporium

**Override mechanic**: The suggestion is a DEFAULT, not a lock. "Browse Others" is always available. The 100-point XP threshold from the Shepherding system applies: a competing designer must have 100+ XP points MORE than the auto-slotted shepherd AND be closer in proximity to appear ABOVE them in the default listing order.

### 4D: Shepherd Pipeline Dashboard

**File**: `src/components/slingshot/ShepherdPipeline.tsx`

Add a "My Pipeline" section to the member profile or a new tab on an existing dashboard:

**Data**:
- Query `slingshot_slots WHERE shepherd_id = auth.uid()`
- For each slot, query `slingshot_history` for job counts and earnings

**Layout**:

```
Your Cue Card Slingshot Pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Active Slots: 3          Total Jobs: 12          Total Earnings: 1,847 Credits

┌─────────────────────────────────────┐
│ Slot: La Capital del Sabor          │
│ Type: Cue Card                      │
│ Generation: 1 (Direct)              │
│ Jobs from this slot: 4              │
│ Earnings: $623.40                   │
│ Last job: 2 days ago                │
│ Status: 🟢 Active                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Slot: Mountain Coffee Roasters      │
│ Type: Logo                          │
│ Generation: 1 (Direct)              │
│ Jobs from this slot: 8              │
│ Earnings: $1,223.60                 │
│ Last job: 5 hours ago               │
│ Status: 🟢 Active                   │
└─────────────────────────────────────┘
```

**Attenuation display**: Show generation level with explanation:
- Generation 1: "Direct — you're the default designer for their customers" (bold)
- Generation 2: "Recommended — you appear as 'recommended' for their customers' customers" (normal)
- Generation 3: "Reach — you appear in general pool with ranking boost" (muted)

---

## TASK 5: Route and Navigation Wiring

### Routes

Add to `App.tsx`:
```
/invite → InviteGenerator
/welcome?invite=CODE → detected by existing /welcome route (no new route needed)
/pipeline → ShepherdPipeline (or add as tab on existing profile/dashboard page)
```

### Sidebar

Add "Invite" link in the Community nav group:
- Icon: `UserPlus` (from Lucide)
- Label: "Invite Someone"
- Route: `/invite`

Add "My Pipeline" link in the My Business nav group (only show if user has slingshot_slots):
- Icon: `GitBranch` (from Lucide)
- Label: "My Pipeline"
- Route: `/pipeline`

---

## TASK 6: Update Stats

Update `useCanonicalStats.ts` DEFAULTS to innovation count: **1,938** (unchanged from K92)

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/pages/InviteGenerator.tsx` | Invitation link generator + dashboard |
| `src/components/onboarding/RedCarpetWelcome.tsx` | Personalized welcome flow for invitees |
| `src/components/slingshot/SlingshotSuggestion.tsx` | Auto-slot recommendation banner |
| `src/components/slingshot/ShepherdPipeline.tsx` | Shepherd's pipeline dashboard |
| `supabase/migrations/20260323000025_red_carpet_slingshot.sql` | 5 tables + seed data |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes: /invite, /pipeline |
| `src/components/layout/Sidebar.tsx` (or equivalent) | Add "Invite Someone" and "My Pipeline" links |
| GuidedDiscovery / Welcome page (K91) | Add invitation detection + Red Carpet branch |
| FirstSteps (K91) | Add invitation-aware beacon ordering |
| DesignBattleArena.tsx / STAMP approval (K87) | Add slingshot slot creation on design approval |
| Emporium.tsx (K87) | Add SlingshotSuggestion banner |

## DO NOT TOUCH

- ADAPT Score files (K92)
- Front Door MembershipGate payment logic (K91) — Red Carpet REUSES it
- Housing files (K89)
- Ghost World files (K88)
- Congress API (K90)
- Commerce Engine edge functions (K80)
- Star Chamber (K79/K80)
- MoneyPenny (K84)
- Calendar (K82)
- Beacon core logic (K75/K82)
- Treasure Map game logic (K81)
- Vehicle files (K85)
- Political Expedition (K86)
- Crew Call dispatch (K83)

---

## BUILD ORDER

```
Migration (5 tables + seed data) — FIRST
  ↓
Task 2 (InviteGenerator) — standalone page, no dependencies on other new tasks
  ↓
Task 3A-B (RedCarpetWelcome + invitation detection) — needs migration tables
  ↓
Task 3C (FirstSteps override) — needs Red Carpet flow working
  ↓
Task 4A-B (Slingshot slot creation) — needs migration tables
  ↓
Task 4C (SlingshotSuggestion banner) — needs slots to exist
  ↓
Task 4D (ShepherdPipeline dashboard) — needs slots + history
  ↓
Task 5 (Routes + nav)
  ↓
Task 6 (Stats)
```

---

## DEPLOY CHECKLIST

1. Push migration: `npx supabase db push --linked`
2. Verify 5 new tables: `invitations`, `invitation_beacon_stops`, `slingshot_slots`, `slingshot_history`, `role_initiative_map`
3. Verify 10 role-initiative seed entries
4. `npm run build` — zero errors
5. `firebase deploy --only hosting:main`
6. Test: Generate invitation link as logged-in user → code appears, copy works
7. Test: Open invitation link in incognito → Red Carpet Welcome shows with inviter name + role
8. Test: Complete join via Red Carpet → inviter gets notification, invitation marked 'used'
9. Test: FirstSteps shows reordered beacon stops matching the invitation's role
10. Test: Approve a cue_card design in Arena → slingshot_slot created for designer
11. Test: As a customer of a business with a slingshot → see recommendation banner in Emporium
12. Test: View Shepherd Pipeline dashboard → shows active slots with stats
13. Test: Expired invitation link → falls back to generic GuidedDiscovery
14. Test: Generate QR code → scannable, leads to correct invitation URL
15. Zero console errors

---

## SUCCESS CRITERIA

- [ ] 5 tables created with proper RLS policies
- [ ] 10 role-to-initiative mappings seeded
- [ ] Invitation generator creates unique codes with context
- [ ] Generated links include invite parameter
- [ ] QR code generation works
- [ ] Copy-to-clipboard works
- [ ] My Invitations dashboard shows sent invitations with status
- [ ] Red Carpet Welcome detects invite parameter on /welcome
- [ ] Personal welcome shows inviter name, avatar, role suggestion, personal message
- [ ] Tailored beacon preview shows first 4 relevant stops
- [ ] Join flow reuses MembershipGate ($5)
- [ ] Invitation marked 'used' after join, invitee_id set
- [ ] Inviter receives notification when invitation is accepted
- [ ] FirstSteps beacon ordering matches invitation context
- [ ] "Recommended by [inviter]" badge on first 3 stops
- [ ] STAMP approval of design creates slingshot_slot
- [ ] Slingshot suggestion banner appears in Emporium for qualifying customers
- [ ] "Browse Others" dismisses banner
- [ ] Shepherd Pipeline shows all active slots with job counts and earnings
- [ ] Generation display (Direct / Recommended / Reach) renders correctly
- [ ] Sidebar shows "Invite Someone" link with UserPlus icon
- [ ] "My Pipeline" link appears only for users with slingshot_slots
- [ ] Zero console errors

---

**Every invitation is personal. Every cue card builds a pipeline. One act of service becomes a gravity well of future work. The growth engine is structural, not promotional.**

**FOR THE KEEP.**
