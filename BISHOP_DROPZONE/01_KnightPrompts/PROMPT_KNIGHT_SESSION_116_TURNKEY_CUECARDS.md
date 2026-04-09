# KNIGHT SESSION 116: Turn-Key Project Template + Cue Card Campaign System

## Brief
Call `brief_me("turn-key project template, cue card campaign system, creator onboarding")`

## Context
K107-K115 complete and deployed. All 7 portals operational. Product catalog, makers, production pipeline, factory node, subscriptions, coalitions, Ghost World, and Calendar all live. Now we build the fastest creator onboarding hook in the platform — the Turn-Key Project Template (#1942) and Cue Card Campaign System (#1945). These two systems convert "I make stuff" into "I have a funded production campaign" in under 10 minutes.

Canonical stats: 1,988 innovations | 1,511 claims | 10 provisionals | 21 production systems

**CRITICAL RULE:** Platform tokens/credits are NOT securities. Never use 'equity', 'shares', 'dividends', 'ROI', or 'invest'. Use 'participation', 'allocation', 'contribution', 'back'. Never promise passive income. Use 'may earn' not 'will earn'. Buyers purchase PRODUCTS at retail price, not investment interests. The Matched-Fund Tiered Production Cascade is a commercial pre-order system, not crowdfunding.

## Deliverable 1: Turn-Key Project Template System

### Migration: `20260326000010_turnkey_projects.sql`
```sql
-- Turn-Key Project Templates
CREATE TABLE IF NOT EXISTS turnkey_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded', 'producing', 'complete', 'paused')),
  
  -- Matched funding (#1943)
  creator_backing_credits INT DEFAULT 0,
  community_matched INT DEFAULT 0,
  matching_cap INT DEFAULT 0,
  
  -- Tier tracking
  current_tier TEXT DEFAULT 'prototype' CHECK (current_tier IN ('prototype', 'early_adopter', 'tier2_500', 'tier3_5k', 'tier4_mass')),
  early_adopter_slots INT DEFAULT 50,
  early_adopter_filled INT DEFAULT 0,
  
  -- Production routing
  production_method TEXT CHECK (production_method IN ('fdm', 'sla', 'sls', 'injection', 'handmade', 'digital', 'mixed')),
  stl_file_url TEXT,
  
  -- Cue Card used (nullable — manual setup if no cue card)
  cue_card_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Turn-Key tier history (tracks cascade progression)
CREATE TABLE IF NOT EXISTS turnkey_tier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  units_target INT NOT NULL,
  units_filled INT DEFAULT 0,
  unit_price_credits INT NOT NULL,
  production_method TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Turn-Key backers (people who pre-ordered at a tier)
CREATE TABLE IF NOT EXISTS turnkey_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES turnkey_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  tier TEXT NOT NULL,
  credits_paid INT NOT NULL,
  fulfillment_type TEXT DEFAULT 'shipped' CHECK (fulfillment_type IN ('shipped', 'print_yourself', 'digital')),
  status TEXT DEFAULT 'backed' CHECK (status IN ('backed', 'producing', 'shipped', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id, tier)
);

ALTER TABLE turnkey_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnkey_tier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnkey_backers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active projects" ON turnkey_projects FOR SELECT USING (status != 'draft' OR auth.uid() = creator_id);
CREATE POLICY "Creator manages own project" ON turnkey_projects FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view tier history" ON turnkey_tier_history FOR SELECT USING (true);
CREATE POLICY "Creator manages tier history" ON turnkey_tier_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM turnkey_projects WHERE id = project_id AND creator_id = auth.uid())
);

CREATE POLICY "Anyone can view backers count" ON turnkey_backers FOR SELECT USING (true);
CREATE POLICY "Users manage own backing" ON turnkey_backers FOR ALL USING (auth.uid() = user_id);
```

### Pages

**Page 1: `/projects/create` — Turn-Key Project Setup Wizard**

Multi-step wizard (4 steps, one page with step navigation):

**Step 1 — "What are you making?"**
- Title (text input)
- Category (dropdown: Tabletop Terrain, Leather Goods, Food & Kitchen, Jewelry, Board Games, Woodworking, Digital Design, Other)
- Description (textarea, 500 char max)
- Upload up to 5 images
- If a `cue_card_id` query param is present, pre-fill from that Cue Card's defaults

**Step 2 — "Show your prototype"**
- Upload STL/OBJ file (optional — only for physical products)
- "I already have a prototype" checkbox → photo upload
- "I need to make a prototype first" → show cost estimate from Cue Card defaults
- Estimated prototype cost display

**Step 3 — "Back your project"**
- "How many Credits are you putting in?" — slider from 50 to 5,000
- Matching explanation card: "You put in [X] Credits. The community can match up to [X] more."
- Visual: two progress bars side by side — "Your Backing" | "Community Match"
- Cost+20% price auto-calculator: "Each Early Adopter pays [calculated] Credits"
- Show 50 Early Adopter slots with fill meter (starts at 0)

**Step 4 — "Launch"**
- Summary card showing: title, category, images, backing amount, matching cap, Early Adopter price, production method
- "Launch Project" button (requires $5 membership — show upgrade CTA if not Member/Builder)
- On launch: insert into `turnkey_projects`, create first tier in `turnkey_tier_history`, set status to 'active'

Slug auto-generated from title (kebab-case, unique check).

**Page 2: `/projects` — Project Directory**

Grid of active Turn-Key projects. Each card shows:
- Lead image
- Title + category badge
- Creator name + avatar
- Matched funding progress bar (creator backing vs community match, side by side)
- Early Adopter fill meter: "12/50 Early Adopter slots filled"
- Current tier badge (Prototype → Early Adopter → Tier 2 → Tier 3 → Tier 4)
- "Back This Project" CTA button

Filters: category dropdown, sort by (newest, most backed, almost funded)

**Page 3: `/projects/:slug` — Project Detail**

Full project page:
- Image gallery (carousel)
- Title, description, creator profile link
- **Matched Funding Panel:**
  - Creator's backing: [X] Credits (with green checkmark)
  - Community matched: [Y] / [X] Credits
  - Visual: two-tone progress bar
  - "Back This Project" button → opens backing modal
- **Tiered Production Cascade visualization:**
  ```
  [Prototype ✓] → [Early Adopter 12/50] → [Tier 2: 500 🔒] → [Tier 3: 5K 🔒] → [Tier 4: 50K 🔒]
  ```
  - Completed tiers: green checkmark
  - Current tier: animated fill bar
  - Locked tiers: padlock icon with "Unlocks when [prior tier] completes"
- **Early Adopter section:**
  - Two options: "Print It Yourself" (downloads STL) | "Get It Shipped" (production + shipping)
  - Price in Credits for each option
  - Slot counter with urgency: "38 of 50 slots remaining"
- **Production Method badge:** FDM / SLA / SLS / Injection / Handmade / Digital
- **Backer list** (anonymized): "47 people have backed this project"

**Backing Modal:**
- Select tier (Early Adopter shown first)
- Select fulfillment: "Print It Yourself" or "Get It Shipped"
- Credits cost display
- "Confirm Backing" button
- On confirm: insert into `turnkey_backers`, increment `early_adopter_filled` and `community_matched`

### Components
- `TurnKeyWizard.tsx` — 4-step wizard container with step indicators
- `TurnKeyProjectCard.tsx` — card for directory grid
- `TurnKeyProjectDetail.tsx` — full detail page
- `MatchedFundingBar.tsx` — dual progress bar (creator | community)
- `TierCascadeVisual.tsx` — horizontal tier progression with lock/unlock states
- `BackingModal.tsx` — modal for backing a project
- `EarlyAdopterMeter.tsx` — slot fill meter with urgency styling

### Hooks
- `useTurnKeyProjects()` — fetch all active projects with filters
- `useTurnKeyProject(slug)` — fetch single project with tier history and backer count
- `useCreateTurnKey()` — mutation for creating a new project
- `useBackProject()` — mutation for backing a project

## Deliverable 2: Cue Card Campaign System

### Migration: `20260326000011_cue_card_campaigns.sql`
```sql
CREATE TABLE IF NOT EXISTS cue_card_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  craft_type TEXT NOT NULL,
  description_template TEXT NOT NULL,
  icon TEXT DEFAULT '🎨',
  
  -- Default pricing
  recommended_backing_min INT DEFAULT 100,
  recommended_backing_max INT DEFAULT 1000,
  early_adopter_slots INT DEFAULT 50,
  
  -- Production path
  default_production_path TEXT NOT NULL,
  -- e.g. "SLA prototype → SLS mold → injection mold"
  
  -- Template fields
  suggested_categories TEXT[] DEFAULT '{}',
  marketing_copy_template TEXT,
  tip_text TEXT,
  
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cue_card_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active cue cards" ON cue_card_campaigns FOR SELECT USING (is_active = true);

-- Add foreign key to turnkey_projects
ALTER TABLE turnkey_projects 
  ADD CONSTRAINT fk_cue_card 
  FOREIGN KEY (cue_card_id) REFERENCES cue_card_campaigns(id);
```

### Seed Data: 7 Cue Cards

Insert these in the migration:

```sql
INSERT INTO cue_card_campaigns (title, slug, craft_type, icon, description_template, default_production_path, recommended_backing_min, recommended_backing_max, suggested_categories, marketing_copy_template, tip_text, sort_order) VALUES
(
  'Terrain for Fun & Profit',
  'terrain-fun-profit',
  'Tabletop Terrain',
  '🏰',
  'I make [TERRAIN TYPE] for tabletop gaming. My design features [KEY FEATURE] and is compatible with [GAME SYSTEM / SCALE].',
  'SLA prototype → SLS mold → injection mold',
  200, 1000,
  ARRAY['tabletop', 'terrain', '3d-printing', 'gaming'],
  'Level up your tabletop with handcrafted terrain. Each piece is designed for easy printing and built to last.',
  'Upload your STL — Early Adopters can print it themselves while you build toward injection molding.',
  1
),
(
  'Knife Sheaths & Leather',
  'knife-sheaths-leather',
  'Leather Goods',
  '🔪',
  'I craft [LEATHER ITEM TYPE] using [LEATHER TYPE]. Each piece is [HAND-STITCHED / TOOLED / MOLDED] and designed for [USE CASE].',
  'Hand prototype → pattern template → batch production',
  50, 500,
  ARRAY['leather', 'knives', 'handmade', 'edc'],
  'Handcrafted leather goods made to order. Quality materials, honest pricing, built to last a lifetime.',
  'Your dad''s knife sheaths are the proof-of-concept story. Start with what you already make.',
  2
),
(
  'Local Kitchen to Market',
  'local-kitchen-market',
  'Food & Kitchen',
  '🍳',
  'I make [FOOD PRODUCT] using [KEY INGREDIENTS / METHOD]. Available for [LOCAL DELIVERY / PICKUP / SHIPPING].',
  'Recipe development → health permit → storefront listing',
  100, 500,
  ARRAY['food', 'local', 'kitchen', 'meal-prep'],
  'From our kitchen to your table. Fresh, local, made with care.',
  'Check local cottage food laws — many states allow home kitchen sales under a certain revenue threshold.',
  3
),
(
  'Custom Jewelry',
  'custom-jewelry',
  'Jewelry & Accessories',
  '💎',
  'I create [JEWELRY TYPE] using [MATERIALS]. Each piece is [HANDMADE / CAST / 3D-PRINTED] and features [SIGNATURE STYLE].',
  'Wax prototype → casting → small batch',
  100, 750,
  ARRAY['jewelry', 'accessories', 'handmade', 'custom'],
  'Unique jewelry designed and crafted by hand. No two pieces are exactly alike.',
  'Wax carving or 3D-printed wax models let you prototype fast before committing to casting.',
  4
),
(
  'Board Game Launch',
  'board-game-launch',
  'Tabletop Games',
  '🎲',
  'I designed [GAME NAME], a [GAME TYPE] game for [PLAYER COUNT] players. It features [CORE MECHANIC] and plays in [TIME].',
  'PnP prototype → offset print run → fulfillment',
  300, 2000,
  ARRAY['board-games', 'tabletop', 'card-games', 'gaming'],
  'A new tabletop experience from an independent designer. Playtested, refined, ready for your table.',
  'Start with a Print-and-Play version for Early Adopters — it validates demand AND gives you playtest feedback.',
  5
),
(
  'Woodworking Workshop',
  'woodworking-workshop',
  'Wood Products',
  '🪵',
  'I build [WOOD PRODUCT] from [WOOD TYPE]. Each piece is [CNC-CUT / HAND-CARVED / TURNED] and finished with [FINISH TYPE].',
  'Shop prototype → CNC template → batch production',
  150, 1000,
  ARRAY['woodworking', 'furniture', 'handmade', 'cnc'],
  'Solid wood, honest craftsmanship. Built in my shop, shipped to your door.',
  'CNC templates let other makers in the network reproduce your design at scale — you earn from every unit.',
  6
),
(
  'Digital Design',
  'digital-design',
  'Digital Assets',
  '🎨',
  'I create [DIGITAL PRODUCT TYPE] for [USE CASE]. Formats include [FILE FORMATS]. [LICENSE TYPE] license included.',
  'Create → list → deliver (no physical production)',
  25, 200,
  ARRAY['digital', 'design', 'templates', 'assets'],
  'Professional digital assets ready to download. Created by an independent designer, priced fairly.',
  'Digital products have zero production cost after creation — your Early Adopter tier is pure margin.',
  7
);
```

### Pages

**Page 4: `/cue-cards/campaigns` — Cue Card Library**

Visual grid of all active Cue Cards. Each card shows:
- Large icon (emoji)
- Title (e.g., "Terrain for Fun & Profit")
- Craft type subtitle
- One-line description of the production path
- "Start This Campaign" button → navigates to `/projects/create?cue_card=[slug]`

Header text: **"What do you want to make?"**
Subheader: "Pick a Cue Card. We'll set up everything. You just add your idea."

Layout: 2-column grid on mobile, 3-column on tablet, 4-column on desktop. Cards have hover lift effect.

**Page 5: `/cue-cards/campaigns/:slug` — Cue Card Detail**

Full detail page for a single Cue Card:
- Icon + title + craft type
- Description template preview (with [PLACEHOLDER] fields highlighted)
- **Production Path visualization:**
  ```
  [SLA prototype] → [SLS mold] → [Injection mold]
  ```
  Horizontal steps with arrows, each step in a rounded badge
- Recommended backing range: "$[min] – $[max]"
- Suggested categories as tag chips
- Marketing copy template preview
- Tip text in a callout box
- **"Use This Cue Card" button** → `/projects/create?cue_card=[slug]`
- **"See Projects Using This Card"** → filtered view of `/projects?cue_card=[slug]`

### Components
- `CueCardCampaignGrid.tsx` — library grid container
- `CueCardCampaignCard.tsx` — individual card in grid
- `CueCardCampaignDetail.tsx` — full detail page
- `ProductionPathVisual.tsx` — horizontal step visualization of production path

### Hooks
- `useCueCardCampaigns()` — fetch all active cue cards
- `useCueCardCampaign(slug)` — fetch single cue card

### Integration with Turn-Key Wizard
When `/projects/create?cue_card=[slug]` is loaded:
1. Fetch the Cue Card by slug
2. Pre-fill Step 1: category from `craft_type`, description from `description_template`
3. Pre-fill Step 3: backing slider defaults from `recommended_backing_min` / `recommended_backing_max`
4. Store `cue_card_id` on the project record
5. Show banner at top of wizard: "Using Cue Card: [title]" with option to "Start from Scratch" (clears pre-fill)

## Deliverable 3: Navigation + Wiring

### UnifiedNavigation Updates
Add to the marketplace portal section of UnifiedNavigation.tsx:
- "Projects" → `/projects` (directory)
- "Start a Project" → `/cue-cards/campaigns` (cue card library — the primary onboarding entry)

### App.tsx Routes
Add to the marketplace routes in App.tsx:
```tsx
<Route path="/projects" element={<ProjectDirectory />} />
<Route path="/projects/create" element={<TurnKeyWizard />} />
<Route path="/projects/:slug" element={<TurnKeyProjectDetail />} />
<Route path="/cue-cards/campaigns" element={<CueCardCampaignLibrary />} />
<Route path="/cue-cards/campaigns/:slug" element={<CueCardCampaignDetail />} />
```

### CrossPortalNav
Add "Start a Project" link to CrossPortalNav on ALL portals — this is the primary onboarding funnel.

### Canonical Stats
Update `useCanonicalStats.ts` DEFAULTS:
- `innovationCount: 1988` (was 1979)

## Build + Deploy
Build and deploy all 8 hosting targets when complete.

## Quality Checks
- [ ] Turn-Key wizard creates a project record on launch
- [ ] Cue Card pre-fills wizard correctly via query param
- [ ] Project directory shows all active projects with matched funding bars
- [ ] Project detail page shows tier cascade with lock/unlock states
- [ ] Backing modal inserts backer record and updates counters
- [ ] All 7 Cue Cards appear in the library grid
- [ ] Cue Card detail shows production path visualization
- [ ] Navigation links added to UnifiedNavigation and CrossPortalNav
- [ ] Routes wired in App.tsx
- [ ] All 8 Firebase targets deployed
- [ ] No securities language anywhere — check all copy

## Design Notes
- The Turn-Key wizard should feel FAST. Four steps, no friction. The goal is under 10 minutes from "I want to make this" to "My project is live."
- Cue Card library is the FIRST thing a new creator sees. "What do you want to make?" is the question. The answer is a click.
- Matched Funding bars should be visually prominent — they're the hook. "You put in $200, the community matches $200."
- Tier cascade is aspirational — show the full path even when locked. Creators should see where their project COULD go.
- Early Adopter urgency: "38 of 50 slots remaining" drives action.
- The $5 membership gate on project launch is the conversion point. Don't hide it — celebrate it. "For $5/year, you get all of this."

## FOR THE KEEP.
