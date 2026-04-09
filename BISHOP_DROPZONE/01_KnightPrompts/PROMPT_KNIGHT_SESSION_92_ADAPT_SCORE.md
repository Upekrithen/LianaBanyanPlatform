# KNIGHT SESSION 92 — ADAPT Score Dashboard
## Bishop 029 | March 23, 2026
## Innovation Count: 1,938 (ADAPT Score already counted as #1937)
## Based on: K91 Front Door (in progress)

---

## MISSION

Build the measurement layer. The platform has 19 production systems, a front door, and a notification spine — but no way to know which systems are working and which are drifting. ADAPT Score gives every system a six-dimension effectiveness rating, enables local SOP adaptation with constitutional guardrails, and opens the door to cooperative integration partnerships.

You built the rooms, the hallway, and the front door. K92 installs the thermostats.

**Previous session**: K91 built the Front Door — Guided Discovery wizard, $5 Access Key membership gate, member profiles, notification spine, and the linear funnel connecting all entry points. Migration 20260323000023 (member_profiles + notifications).

---

## CONTEXT: WHAT EXISTS

| System | Route / Location | Status |
|--------|-----------------|--------|
| Ghost World | `/ghost-world` | LIVE (K88) |
| Housing | `/housing` | LIVE (K89) |
| Congress API | `/political-expedition` | LIVE (K90) |
| Front Door | `/welcome`, `/join`, `/first-steps` | LIVE (K91) |
| Political Expedition | `/political-expedition` | LIVE (K86/K90) |
| Lemon Lot | `/lemon-lot` | LIVE (K85) |
| Local Wheels | `/local-wheels` | LIVE (K85) |
| Rideshare Routes | `/rideshare-routes` | LIVE (K85) |
| Commerce Engine | storefronts, orders, earnings | LIVE (K80) |
| Star Chamber | `/star-chamber` | LIVE (K79/K80) |
| MoneyPenny | edge functions | LIVE (K84) |
| Crew Calls | `/crew-calls` | LIVE (K83) |
| Calendar | `/calendar` | LIVE (K82) |
| Design Arena | `/design-battle` | LIVE (K87) |
| Emporium | `/emporium` | LIVE (K87) |
| Crew Tables | `/crew-tables` | LIVE (K87) |
| Beacon | Two-Bite Teaching | LIVE (K75/K82) |
| Treasure Map | `/treasure-maps` | LIVE (K81) |
| Notifications | bell + panel | LIVE (K91) |

The problem: 19 systems running blind. No composite health score. No way for local nodes to propose SOP changes safely. No framework for integrating external cooperatives. ADAPT Score solves all three.

---

## ADAPT DIMENSIONS

Each system is measured on six dimensions:

| Dimension | Code | What It Measures |
|-----------|------|------------------|
| **E**ffectiveness | E | Is the system achieving its stated purpose? |
| **A**daptability | A | Can the system adjust to local conditions? |
| **D**urability | D | Does the system sustain itself over time without manual intervention? |
| **A**lignment | A2 | Does the system stay aligned with constitutional principles? |
| **P**articipation | P | Are members actively engaging with the system? |
| **T**ransmission | T | Can the system's benefits be replicated at other nodes? |

Composite score = average of all six dimensions. Tier mapping:

| Tier | Score Range | Color |
|------|-------------|-------|
| Platinum | 90-100 | `#E5E4E2` (platinum gray) |
| Gold | 75-89 | `#FFD700` |
| Silver | 60-74 | `#C0C0C0` |
| Bronze | 40-59 | `#CD7F32` |
| Red Flag | 0-39 | `#DC2626` |

---

## TASK 1: Migration

**File**: `supabase/migrations/20260323000024_adapt_score.sql`

```sql
-- ============================================
-- MIGRATION: 20260323000024_adapt_score.sql
-- Knight Session 92: ADAPT Score Dashboard
-- 6 tables: adapt_scores, adapt_baselines, local_sop,
--           integration_partners, integration_bounties, sop_adaptations
-- ============================================

-- ADAPT Scores: individual dimension measurements
CREATE TABLE IF NOT EXISTS adapt_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID,
  system_id TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('effectiveness','adaptability','durability','alignment','participation','transmission')),
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  measured_at TIMESTAMPTZ DEFAULT now(),
  measured_by UUID REFERENCES auth.users(id)
);

ALTER TABLE adapt_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view adapt scores"
  ON adapt_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages adapt scores"
  ON adapt_scores FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_adapt_scores_system ON adapt_scores(system_id, dimension);
CREATE INDEX idx_adapt_scores_node ON adapt_scores(node_id, system_id);
CREATE INDEX idx_adapt_scores_measured ON adapt_scores(measured_at DESC);

-- ADAPT Baselines: canonical configuration per system
CREATE TABLE IF NOT EXISTS adapt_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT UNIQUE NOT NULL,
  initiative_id INT,
  baseline_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE adapt_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view baselines"
  ON adapt_baselines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages baselines"
  ON adapt_baselines FOR ALL
  USING (public.is_admin());

-- Local SOP: proposed and approved local adaptations
CREATE TABLE IF NOT EXISTS local_sop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID,
  system_id TEXT NOT NULL,
  title TEXT NOT NULL,
  modification_description TEXT NOT NULL,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed','constitutional_check','initiative_check','approved','rejected','monitoring','promoted','rolled_back')),
  constitutional_violation BOOLEAN DEFAULT false,
  initiative_violation BOOLEAN DEFAULT false,
  adapt_impact NUMERIC(5,2),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE local_sop ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view local SOPs"
  ON local_sop FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can propose SOPs"
  ON local_sop FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own proposed SOPs"
  ON local_sop FOR UPDATE
  USING (auth.uid() = created_by AND status = 'proposed');

CREATE POLICY "Admin manages all SOPs"
  ON local_sop FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_local_sop_system ON local_sop(system_id, status);
CREATE INDEX idx_local_sop_node ON local_sop(node_id, status);

-- Integration Partners: external cooperatives
CREATE TABLE IF NOT EXISTS integration_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit_union','food_coop','housing_coop','worker_coop','agricultural_coop','other')),
  tier TEXT DEFAULT 'data_mirror' CHECK (tier IN ('data_mirror','credit_bridge','full_mesh')),
  adapt_score NUMERIC(5,2),
  website TEXT,
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE integration_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view partners"
  ON integration_partners FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages partners"
  ON integration_partners FOR ALL
  USING (public.is_admin());

-- Integration Bounties: rewards for building integrations
CREATE TABLE IF NOT EXISTS integration_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES integration_partners(id),
  title TEXT NOT NULL,
  description TEXT,
  reward_credits NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','claimed','in_progress','review','completed','cancelled')),
  claimed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE integration_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view bounties"
  ON integration_bounties FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can claim open bounties"
  ON integration_bounties FOR UPDATE
  USING (auth.uid() IS NOT NULL AND status = 'open');

CREATE POLICY "Admin manages bounties"
  ON integration_bounties FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_bounties_status ON integration_bounties(status);
CREATE INDEX idx_bounties_partner ON integration_bounties(partner_id);

-- SOP Adaptations: the review/check records for each SOP change
CREATE TABLE IF NOT EXISTS sop_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID,
  local_sop_id UUID REFERENCES local_sop(id),
  proposed_change TEXT NOT NULL,
  constitutional_check_passed BOOLEAN,
  initiative_check_passed BOOLEAN,
  auto_approved BOOLEAN DEFAULT false,
  adapt_delta NUMERIC(5,2),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sop_adaptations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view adaptations"
  ON sop_adaptations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manages adaptations"
  ON sop_adaptations FOR ALL
  USING (public.is_admin());

CREATE INDEX idx_sop_adaptations_sop ON sop_adaptations(local_sop_id);

-- ============================================
-- SEED DATA: Baselines for 19 production systems
-- ============================================

INSERT INTO adapt_baselines (system_id, initiative_id, baseline_config) VALUES
  ('ghost_world', NULL, '{"description": "Risk-free practice environment with time dilation", "constitutional_rules": ["no_real_currency_in_ghost"], "route": "/ghost-world", "session": "K88"}'),
  ('housing', 2, '{"description": "Cooperative Housing Acquisition and listings", "constitutional_rules": ["cost_plus_20", "one_way_valve", "margin_lock"], "route": "/housing", "session": "K89"}'),
  ('congress_api', 15, '{"description": "Live bill tracking and member-to-bill mapping", "constitutional_rules": ["nonpartisan_data_only"], "route": "/political-expedition", "session": "K90"}'),
  ('front_door', NULL, '{"description": "Guided Discovery wizard, $5 Access Key, member profiles", "constitutional_rules": ["five_dollar_flat_fee"], "route": "/welcome", "session": "K91"}'),
  ('political_expedition', 15, '{"description": "Political Expedition with Congress.gov integration", "constitutional_rules": ["nonpartisan_data_only"], "route": "/political-expedition", "session": "K86"}'),
  ('lemon_lot', 9, '{"description": "Peer-to-peer vehicle sharing marketplace", "constitutional_rules": ["cost_plus_20", "member_insured", "lb_marketplace_only"], "route": "/lemon-lot", "session": "K85"}'),
  ('local_wheels', 9, '{"description": "LB fleet vehicles with 20% Earn-Down", "constitutional_rules": ["cost_plus_20", "earn_down_20_percent"], "route": "/local-wheels", "session": "K85"}'),
  ('rideshare_routes', 9, '{"description": "Recurring commute matching under Rally Group", "constitutional_rules": ["person_to_person", "own_insurance"], "route": "/rideshare-routes", "session": "K85"}'),
  ('commerce_engine', NULL, '{"description": "Scan-order-pay-distribute-earnings loop", "constitutional_rules": ["cost_plus_20", "one_way_valve", "margin_lock", "creator_keeps_83_percent"], "route": null, "session": "K80"}'),
  ('star_chamber', NULL, '{"description": "AI-powered dispute resolution with mutual fallback", "constitutional_rules": ["four_judge_system", "human_appeal_right"], "route": "/star-chamber", "session": "K79"}'),
  ('moneypenny', NULL, '{"description": "AI virtual assistant with intelligence layer", "constitutional_rules": ["sec_safe_prompts", "no_financial_advice"], "route": null, "session": "K84"}'),
  ('crew_calls', NULL, '{"description": "Real dispatch for cooperative work requests", "constitutional_rules": ["cost_plus_20", "worker_accepts_voluntarily"], "route": "/crew-calls", "session": "K83"}'),
  ('calendar', NULL, '{"description": "FullCalendar with 6 plug types", "constitutional_rules": ["family_plug_private"], "route": "/calendar", "session": "K82"}'),
  ('design_arena', NULL, '{"description": "Design Battle auto-trigger and competition", "constitutional_rules": ["you_didnt_lose_portfolio", "maker_spotlight_tiers"], "route": "/design-battle", "session": "K87"}'),
  ('emporium', NULL, '{"description": "Maker Spotlight voting and gallery", "constitutional_rules": ["established_rising_pioneer_tiers"], "route": "/emporium", "session": "K87"}'),
  ('crew_tables', NULL, '{"description": "Round Table with role slots around Treasure Map center", "constitutional_rules": ["strangers_assemble"], "route": "/crew-tables", "session": "K87"}'),
  ('beacon', NULL, '{"description": "Two-Bite Teaching system with Save for Later", "constitutional_rules": ["bite_1_save", "bite_2_full_palette"], "route": null, "session": "K75"}'),
  ('treasure_map', NULL, '{"description": "12 maps with 4-level progression", "constitutional_rules": ["starter_to_network_progression"], "route": "/treasure-maps", "session": "K81"}'),
  ('notifications', NULL, '{"description": "Bell + panel notification spine", "constitutional_rules": ["user_owns_notifications"], "route": null, "session": "K91"}')
ON CONFLICT (system_id) DO NOTHING;

-- ============================================
-- SEED DATA: 3 sample integration partners
-- ============================================

INSERT INTO integration_partners (name, type, tier, adapt_score, website, contact_info) VALUES
  ('Mountain West Credit Union', 'credit_union', 'data_mirror', NULL, 'https://example-credit-union.com', '{"note": "Sample partner for development"}'),
  ('Boise Food Co-op', 'food_coop', 'data_mirror', NULL, 'https://example-food-coop.com', '{"note": "Sample partner for development"}'),
  ('Community Housing Partners NW', 'housing_coop', 'data_mirror', NULL, 'https://example-housing-coop.com', '{"note": "Sample partner for development"}');

-- ============================================
-- SEED DATA: 3 sample bounties
-- ============================================

INSERT INTO integration_bounties (partner_id, title, description, reward_credits, status)
SELECT
  ip.id,
  'Build Credit Union Data Mirror',
  'Create read-only API bridge to pull member account summaries from credit union core banking system. Data mirror tier only — no write operations. Must use OAuth2 with member consent flow.',
  500.00,
  'open'
FROM integration_partners ip WHERE ip.name = 'Mountain West Credit Union'
UNION ALL
SELECT
  ip.id,
  'Food Co-op Inventory Sync',
  'Build bidirectional inventory sync between LB Commerce Engine and food co-op POS system. Map product categories to LB storefront items. Real-time stock level updates.',
  350.00,
  'open'
FROM integration_partners ip WHERE ip.name = 'Boise Food Co-op'
UNION ALL
SELECT
  ip.id,
  'Housing Co-op Listing Feed',
  'Create automated feed of available cooperative housing units into LB Housing system. Include unit details, availability dates, cooperative membership requirements, and cost information.',
  400.00,
  'open'
FROM integration_partners ip WHERE ip.name = 'Community Housing Partners NW';
```

---

## TASK 2: ADAPT Score Page

**File**: `src/pages/AdaptScore.tsx`
**Route**: `/adapt-score` (aliases: `/adapt`, `/effectiveness`)

Four-tab layout using shadcn/ui Tabs. Page header: "ADAPT Score" with subtitle "Measuring what matters. Adapting what works."

### Tab 1: Dashboard

The main overview. Displays all 19 systems as score cards in a responsive grid (3 columns desktop, 2 tablet, 1 mobile).

**Data fetching**: Query `adapt_baselines` for system list. For each system, query latest `adapt_scores` grouped by dimension. Compute composite score as average of 6 dimensions.

**Layout**:
- Top banner: Platform-wide composite ADAPT score (average of all systems). Large number with tier badge and color.
- Tier distribution bar: horizontal stacked bar showing how many systems are in each tier (Platinum/Gold/Silver/Bronze/Red Flag).
- Grid of `AdaptScoreCard` components (one per system).

**Click behavior**: Clicking any system card expands it inline (or navigates to a detail view — Knight's choice) showing:
- `AdaptRadarChart` for that system (6-dimension radar)
- Score history sparkline (last 30 days if data exists)
- Link to that system's actual route
- List of active Local SOPs affecting this system
- "Propose Adaptation" button → switches to Tab 2 with system pre-selected

**Empty state**: If no scores recorded yet, show all systems at 0 with a message: "ADAPT measurements begin when members start using the platform. Scores update automatically based on participation data."

### Tab 2: Local SOP

List + form for SOP adaptation proposals.

**List view**: Table or card list of all `local_sop` entries, sorted by created_at DESC. Columns/fields:
- Title
- System (from system_id, display friendly name from baselines)
- Status badge (color-coded by status)
- Proposer (display_name from member_profiles join)
- Created date
- ADAPT Impact (+/- delta, if measured)

**Filter bar**: Filter by status (all, proposed, approved, monitoring, rejected, promoted, rolled_back) and by system.

**Status pipeline visualization** (`SOPPipeline` component): Horizontal flow chart showing the stages:

```
proposed → constitutional_check → initiative_check → approved → monitoring → promoted
                    ↓                    ↓                            ↓
                rejected             rejected                   rolled_back
```

Each stage is a node. Active SOPs are shown as dots/counts at each stage. Clicking a stage filters the list to that status.

**New Adaptation Form** (expandable panel or modal):
- System dropdown (populated from adapt_baselines)
- Title (text input, required)
- Modification Description (textarea, required, min 50 chars)
- "Submit for Review" button

On submit:
1. Insert into `local_sop` with status = 'proposed'
2. Run constitutional check logic (see Task 4)
3. Create `sop_adaptations` record with check results
4. If auto-approved, update status to 'approved' and set approved_at
5. If violation detected, update status to 'rejected' with constitutional_violation or initiative_violation = true
6. If flagged for review, update status to 'constitutional_check'
7. Send notification to proposer via create-notification edge function

### Tab 3: Integration Partners

Directory of connected cooperatives.

**List view**: Card grid of `integration_partners`. Each card shows:
- Partner name (large)
- Type badge (credit_union, food_coop, etc. — friendly display names)
- Tier badge with color:
  - `data_mirror` → gray badge, "Data Mirror"
  - `credit_bridge` → blue badge, "Credit Bridge"
  - `full_mesh` → green badge, "Full Mesh"
- ADAPT compatibility score (if measured)
- Website link (external, opens new tab)
- "View Details" expand → shows contact_info, related bounties

**"Propose Partnership" form** (admin only — check is_admin()):
- Partner name (text, required)
- Type (select from enum values)
- Website (URL input)
- Notes (textarea)
- "Submit" → inserts into integration_partners at data_mirror tier

**Empty state**: "No integration partners yet. As Liana Banyan grows, cooperatives in your area can connect their systems to share resources."

### Tab 4: Bounties

Integration bounties listing.

**Active bounties** (status = 'open' or 'in_progress'): Card grid. Each `BountyCard` shows:
- Title (large)
- Partner name (from join to integration_partners)
- Description (truncated, expand on click)
- Reward: "[amount] Credits" with credit icon
- Status badge
- If open: "Claim This Bounty" button (sets status = 'claimed', claimed_by = auth.uid())
- If claimed by current user: "Mark In Progress" / "Submit for Review" buttons
- If in_progress and claimed by current user: "Submit for Review" button

**Completed bounties** (collapsible section below active):
- Card list showing completed bounties with developer attribution (claimed_by → member_profiles display_name)
- Completion date

**Admin actions** (if is_admin()):
- "Create Bounty" form: partner dropdown, title, description, reward amount
- "Review" button on bounties in 'review' status → approve (set completed) or reject (set back to in_progress)

---

## TASK 3: Components

### 3A: AdaptRadarChart.tsx

**File**: `src/components/adapt/AdaptRadarChart.tsx`

Props:
```typescript
interface AdaptRadarChartProps {
  scores: {
    effectiveness: number;
    adaptability: number;
    durability: number;
    alignment: number;
    participation: number;
    transmission: number;
  };
  size?: 'sm' | 'md' | 'lg'; // default 'md'
  showLabels?: boolean; // default true
  tierColor?: string; // override fill color based on tier
}
```

Implementation:
- Use recharts `RadarChart` with `PolarGrid`, `PolarAngleAxis`, `Radar`
- Labels on axes: E, A, D, A, P, T (or full words if size = 'lg')
- Fill color based on composite score tier (or tierColor prop)
- Opacity: 0.6 fill, 1.0 stroke
- Grid lines at 25, 50, 75, 100
- Responsive: size 'sm' = 200px, 'md' = 300px, 'lg' = 400px

### 3B: AdaptScoreCard.tsx

**File**: `src/components/adapt/AdaptScoreCard.tsx`

Props:
```typescript
interface AdaptScoreCardProps {
  systemId: string;
  systemName: string;
  route?: string;
  scores: Record<string, number>; // dimension → score
  onClick?: () => void;
}
```

Layout:
- Card with slight shadow
- System name (bold, left-aligned)
- Mini radar chart (size = 'sm', right side or top)
- Composite score number (large, colored by tier)
- Tier badge (Platinum/Gold/Silver/Bronze/Red Flag)
- Route link (small, gray, if route exists)
- Hover effect: slight scale-up
- Click triggers onClick prop

### 3C: SOPPipeline.tsx

**File**: `src/components/adapt/SOPPipeline.tsx`

Props:
```typescript
interface SOPPipelineProps {
  counts: Record<string, number>; // status → count of SOPs at that stage
  onStageClick?: (status: string) => void;
}
```

Layout:
- Horizontal pipeline with nodes connected by arrows
- Each node: circle with count inside, label below
- Main flow: proposed → constitutional_check → initiative_check → approved → monitoring → promoted
- Branch arrows down to: rejected (from constitutional_check and initiative_check), rolled_back (from monitoring)
- Active stages (count > 0) are colored; empty stages are gray
- Click a stage to filter (calls onStageClick)
- Responsive: wraps to 2 rows on mobile

### 3D: BountyCard.tsx

**File**: `src/components/adapt/BountyCard.tsx`

Props:
```typescript
interface BountyCardProps {
  bounty: {
    id: string;
    title: string;
    description: string;
    reward_credits: number;
    status: string;
    partner_name: string;
    claimed_by?: string;
    completed_at?: string;
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onClaim?: (bountyId: string) => void;
  onStatusChange?: (bountyId: string, newStatus: string) => void;
}
```

Layout:
- Card with left color stripe (green for open, blue for claimed/in_progress, purple for review, gray for completed)
- Title (bold)
- Partner name (small, gray)
- Description (max 3 lines, "Show more" toggle)
- Reward amount: shield icon + "[amount] Credits"
- Status badge (top-right corner)
- Action button(s) based on status and user (see Tab 4 spec)

---

## TASK 4: Constitutional Check Logic

**File**: `src/lib/constitutionalCheck.ts`

This is a client-side validation that runs when a Local SOP is submitted. It checks the proposed modification against hard constitutional rules.

```typescript
interface ConstitutionalCheckResult {
  passed: boolean;
  constitutionalViolation: boolean;
  initiativeViolation: boolean;
  autoApproved: boolean;
  flags: string[];
  reason?: string;
}

function runConstitutionalCheck(
  systemId: string,
  modificationDescription: string,
  baselineConfig: any
): ConstitutionalCheckResult
```

**Check logic**:

1. **Cost+20% floor check**: Scan modification description for keywords: "margin", "cost plus", "cost+", "pricing", "markup", "percentage", "creator share", "83%", "16.7%", "20%". If found AND the baseline_config.constitutional_rules includes "cost_plus_20":
   - If description contains "lower", "reduce", "decrease", "remove", "eliminate" near pricing keywords → `constitutionalViolation = true`, reason: "Cannot modify Cost+20% pricing floor. This is a constitutional protection."
   - Auto-reject.

2. **One-way valve check**: Scan for "valve", "withdrawal", "cash out", "cash-out", "redeem", "convert to cash", "extract". If baseline has "one_way_valve" rule:
   - If description suggests allowing extraction → `constitutionalViolation = true`, reason: "Cannot modify one-way valve. Credits and Marks cannot be converted to cash."
   - Auto-reject.

3. **Margin lock check**: Scan for "margin", "lock", "unlock", "flexible margin", "dynamic pricing". If baseline has "margin_lock" rule:
   - If description suggests unlocking or making margin variable → `constitutionalViolation = true`, reason: "Cannot unlock margin. The 20% margin is permanently locked by operating agreement."
   - Auto-reject.

4. **Member protection check**: Scan for "privacy", "data", "personal information", "tracking", "surveillance", "mandatory", "require", "force". If any found:
   - `initiativeViolation = false` but flag for review: "Modification may affect member protections. Requires manual review."
   - Set status to `constitutional_check`, NOT auto-approve.

5. **All checks pass**: If none of the above trigger:
   - `autoApproved = true`
   - Set status to `approved`
   - Set adapt_impact to 0 (baseline — will be measured during 30-day monitoring)
   - Begin monitoring period (approved_at = now())

**Note**: This is intentionally keyword-based for V1. Future versions will use Star Chamber AI for semantic analysis. The keywords are guardrails, not perfect filters — manual review catches what keywords miss.

---

## TASK 5: Route and Navigation Wiring

### Routes

Add to `App.tsx`:
```
/adapt-score → AdaptScore
/adapt → redirect to /adapt-score
/effectiveness → redirect to /adapt-score
```

### Sidebar

Add "ADAPT Score" link in the Platform Tools nav group:
- Icon: `BarChart3` (from Lucide)
- Label: "ADAPT Score"
- Route: `/adapt-score`
- Position: after existing Platform Tools entries

---

## TASK 6: Update Stats

Update `useCanonicalStats.ts` DEFAULTS to innovation count: **1,938**

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/pages/AdaptScore.tsx` | 4-tab ADAPT Score dashboard |
| `src/components/adapt/AdaptRadarChart.tsx` | 6-dimension radar chart |
| `src/components/adapt/AdaptScoreCard.tsx` | System summary card with mini radar |
| `src/components/adapt/SOPPipeline.tsx` | Visual status flow for SOP adaptations |
| `src/components/adapt/BountyCard.tsx` | Integration bounty card with actions |
| `src/lib/constitutionalCheck.ts` | Constitutional validation logic |
| `supabase/migrations/20260323000024_adapt_score.sql` | 6 tables + seed data |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes: /adapt-score, /adapt, /effectiveness |
| `src/components/layout/Sidebar.tsx` (or equivalent) | Add "ADAPT Score" link with BarChart3 icon |
| `useCanonicalStats.ts` | Innovation count → 1,938 |

## DO NOT TOUCH

- Front Door files (K91) — do not modify GuidedDiscovery, MembershipGate, FirstSteps, MemberProfile
- Notification files (K91) — do not modify NotificationBell, NotificationPanel, create-notification
- Housing files (K89)
- Ghost World files (K88)
- Congress API edge function (K90)
- Arena/Emporium/Crew Tables UI (K87)
- Vehicle files (K85)
- Star Chamber AI logic (K79/K80)
- MoneyPenny files (K84)
- Calendar files (K82)
- Treasure Map game logic (K81)
- Commerce Engine edge functions (K80)

---

## BUILD ORDER

```
Migration (6 tables + seed data) — FIRST, everything depends on these
  ↓
Task 3 (Components) — AdaptRadarChart, AdaptScoreCard, SOPPipeline, BountyCard
  ↓ (components must exist before page uses them)
Task 4 (Constitutional Check logic) — standalone lib file
  ↓
Task 2 (ADAPT Score page with 4 tabs) — uses components + constitutional check
  ↓
Task 5 (Route + nav wiring)
  ↓
Task 6 (Stats update) — anytime
```

---

## DEPLOY CHECKLIST

1. Push migration: `npx supabase db push --linked`
2. Verify 6 new tables created: `adapt_scores`, `adapt_baselines`, `local_sop`, `integration_partners`, `integration_bounties`, `sop_adaptations`
3. Verify seed data: 19 baselines, 3 partners, 3 bounties
4. `npm run build` — zero errors
5. `firebase deploy --only hosting:main`
6. Test Dashboard tab: all 19 systems display as score cards with 0/empty state
7. Test radar chart: click a system card, verify 6-dimension radar renders
8. Test Local SOP tab: submit a benign adaptation → auto-approved
9. Test constitutional violation: submit SOP that mentions "lower the margin" → auto-rejected with violation message
10. Test Integration Partners tab: 3 sample partners display with tier badges
11. Test Bounties tab: 3 sample bounties display, claim button works
12. Test route aliases: `/adapt` and `/effectiveness` redirect to `/adapt-score`
13. Test sidebar: "ADAPT Score" link appears in Platform Tools group
14. Zero console errors

---

## SUCCESS CRITERIA

- [ ] 6 new tables created with proper RLS policies
- [ ] 19 system baselines seeded with constitutional rules
- [ ] 3 sample integration partners and 3 bounties seeded
- [ ] Dashboard tab shows all 19 systems as score cards
- [ ] Platform-wide composite score displays with tier badge
- [ ] Tier distribution bar shows system counts per tier
- [ ] Click system card shows 6-dimension radar chart (recharts)
- [ ] Radar chart renders E/A/D/A/P/T axes correctly
- [ ] Local SOP tab lists existing adaptations with status badges
- [ ] SOP Pipeline visualization shows status flow with counts
- [ ] New adaptation form submits and runs constitutional check
- [ ] Cost+20% violation auto-rejects with clear message
- [ ] One-way valve violation auto-rejects
- [ ] Margin lock violation auto-rejects
- [ ] Member protection flag sends to manual review
- [ ] Clean SOPs auto-approve and enter monitoring
- [ ] Integration Partners tab shows partner directory with tier badges
- [ ] "Propose Partnership" form works for admin users
- [ ] Bounties tab shows open bounties with reward amounts
- [ ] Claim button sets bounty to claimed with current user
- [ ] Completed bounties show developer attribution
- [ ] Admin can create bounties and review submissions
- [ ] Routes /adapt and /effectiveness redirect to /adapt-score
- [ ] Sidebar shows "ADAPT Score" with BarChart3 icon
- [ ] Innovation count updated to 1,938
- [ ] Zero console errors

---

Nineteen systems. Six dimensions. One score. The thermostats are installed.

**FOR THE KEEP.**
