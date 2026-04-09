# KNIGHT SESSION 194 — Guided Tour Engine
## Priority: HIGH (Core content consumption experience)
## Depends on: Cephas content in DB, Crow's Nest depth system, CephasGatewayPage
## Bishop B051 | Innovations #2115-#2116

---

## CONTEXT

The platform has 391 Cephas concepts organized by category (under-the-hood, articles, pudding, initiatives, architecture, economics, etc.). Currently users browse them through CephasGatewayPage → CephasCategoryListingPage → CephasContentDetailPage. That's fine for reference, but it's not a **learning experience**.

The Founder wants a **Guided Tour** system — a dedicated page where users can learn the entire platform through three distinct modes, at three detail levels, with full navigation controls.

The existing Crow's Nest depth system (crowsNestDepths.ts) already defines 6 depth levels: Glimpse, Peek, Tell Me More, Sample, Show Me, To-Go. We map these to 3 user-facing levels:

| User Level | Internal Depths | Time |
|-----------|----------------|------|
| **Skipping Stones** | Glimpse + Peek | ~40 sec/item |
| **Wading In** | Tell Me More | ~2 min/item |
| **Deep Dive** | Sample + Show Me + To-Go | ~8 min/item |

---

## TASK 1: Database — Tour State & Categories

### Migration: `guided_tour_state`

```sql
-- User's tour progress and preferences
CREATE TABLE IF NOT EXISTS guided_tour_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  active_mode TEXT NOT NULL DEFAULT 'guided_tour'
    CHECK (active_mode IN ('topic', 'category', 'guided_tour')),
  active_topic TEXT, -- slug of focused topic (mode=topic)
  active_category TEXT, -- slug of focused category (mode=category)
  current_item_slug TEXT, -- where the user currently is
  current_category_index INTEGER DEFAULT 0, -- which category in guided tour
  detail_level TEXT NOT NULL DEFAULT 'wading_in'
    CHECK (detail_level IN ('skipping_stones', 'wading_in', 'deep_dive')),
  items_viewed INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- Return Beacons — saved positions the user can jump back to
CREATE TABLE IF NOT EXISTS tour_return_beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  item_slug TEXT NOT NULL,
  item_title TEXT NOT NULL,
  category TEXT NOT NULL,
  detail_level TEXT NOT NULL,
  note TEXT, -- optional user note about why they bookmarked
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Topic definitions — curated sequences of content items
CREATE TABLE IF NOT EXISTS tour_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT, -- e.g., "How to Restart Local Manufacturing"
  description TEXT,
  category TEXT NOT NULL, -- primary category this topic belongs to
  item_slugs TEXT[] NOT NULL, -- ordered array of cephas_content_registry slugs
  estimated_minutes INTEGER, -- total time at Wading In level
  icon TEXT DEFAULT 'BookOpen',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Category ordering for Guided Tour mode
CREATE TABLE IF NOT EXISTS tour_category_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Folder',
  sort_order INTEGER NOT NULL,
  item_count INTEGER DEFAULT 0 -- denormalized for display
);

ALTER TABLE guided_tour_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_return_beacons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tour state" ON guided_tour_state
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own beacons" ON tour_return_beacons
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read topics" ON tour_topics
  FOR SELECT USING (true);
CREATE POLICY "Anyone can read category order" ON tour_category_order
  FOR SELECT USING (true);
```

### Seed Topics

```sql
-- Seed featured topics
INSERT INTO tour_topics (slug, title, subtitle, category, item_slugs, estimated_minutes, is_featured, sort_order) VALUES
('local-manufacturing', 'How to Restart Local Manufacturing', 'From 3D Printer to Injection Molder to Factory Node', 'architecture', 
  ARRAY['the-canister-system-injection-molding-without-the-factory', 'injection-molding-for-the-rest-of-us-the-canister-system', 'hexisle-technical-system', 'the-superstructure', 'yggdrasil-architecture'],
  25, true, 1),
('three-gear-economics', 'Understanding the Three-Gear Economy', 'Credits, Marks, and Joules — Why Three Currencies?', 'economics',
  ARRAY['three-gear-currency-system', 'cost20-model', 'credits-joules', 'the-joules-pouch-seeds-for-tomorrow', 'ghost-credits-demand-validation', 'hivi-deterministic-economics', 'the-cloth-bag-analogy-why-joules-beat-credits'],
  35, true, 2),
('cooperative-governance', 'How a Cooperative Governs Itself', 'From The 300 to Star Chamber to the Founder''s Creed', 'governance',
  ARRAY['the-300-governance-system', 'star-chamber-verification', 'how-the-founder-gets-paid-complete-transparency', 'structural-bylaws-master-document', 'the-liana-banyan-covenant-imd-v20', 'the-founders-creed'],
  30, true, 3),
('defense-and-safety', 'Defense Klaus: Protecting Every Member', 'Harbor Defense, Rally Group, and the Family Shield', 'under-the-hood',
  ARRAY['defense-klaus-family-shield-harbor-defense-network', 'the-rally-group-safety-at-every-entry', 'privacy-architecture', 'zero-pii-policy', 'sentinel-monitoring-system'],
  20, true, 4),
('patent-portfolio', 'The Innovation Engine', 'How 2,100+ Ideas Become Protected IP', 'patents',
  ARRAY['the-behemoth-patent-portfolio', 'patent-prior-art-research-deep-analysis', '-crown-jewels-patent-portfolio', 'patent-ownership-mechanics-upekrithen-lb-ironclad', 'patent-ownership-offering-for-crowns-sponsors'],
  25, true, 5),
('getting-started', 'Your First Day on Liana Banyan', 'From $5 Membership to First Mark', 'articles',
  ARRAY['how-liana-banyan-actually-works', 'how-liana-banyan-actually-works-full-guide', 'member-benefits-overview', 'the-liana-banyan-origin-story', 'the-founders-story'],
  20, true, 0);

-- Seed category ordering for Guided Tour
INSERT INTO tour_category_order (category, display_name, description, icon, sort_order, item_count) VALUES
('articles', 'Articles & Stories', 'Platform explanations and origin stories', 'FileText', 1, 30),
('pudding', 'The Pudding', 'Proof-in-the-pudding essays showing real results', 'Cake', 2, 5),
('economics', 'Economics & Currency', 'Three-Gear system, Cost+20%, and deterministic economics', 'Coins', 3, 6),
('initiatives', 'The Sweet Sixteen', 'All 16 charitable initiatives', 'Heart', 4, 15),
('governance', 'Governance', 'The 300, Star Chamber, and cooperative democracy', 'Scale', 5, 5),
('architecture', 'Architecture & Infrastructure', 'Yggdrasil, Bifrost, HELM, and system design', 'Building', 6, 15),
('under-the-hood', 'Under the Hood', 'Deep technical and operational details', 'Wrench', 7, 70),
('patents', 'Patent Portfolio', 'The BEHEMOTH and innovation protection', 'Shield', 8, 15),
('letters', 'Letters & Outreach', 'Crown Letters, partnership letters, and media pitches', 'Mail', 9, 80),
('hexisle', 'HexIsle', 'Modular terrain system and game design', 'Hexagon', 10, 10),
('sacred-texts', 'Sacred Texts', 'Foundational documents and charter pledges', 'BookOpen', 11, 2),
('cue-cards', 'Cue Cards', 'Role-specific production credentials', 'CreditCard', 12, 3);
```

---

## TASK 2: GuidedTourPage Component

**NEW FILE**: `platform/src/pages/GuidedTourPage.tsx`

Route: `/tour` (public, no auth required — this is how people learn about LB)

### Layout

```
┌─────────────────────────────────────────────────────┐
│  GUIDED TOUR                                         │
│  ┌────────────┬────────────┬───────────────────┐    │
│  │   Topic    │  Category  │   Guided Tour     │    │
│  └────────────┴────────────┴───────────────────┘    │
│                                                      │
│  Detail Level: [Skipping Stones] [Wading In] [Deep] │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │           CONTENT AREA                       │   │
│  │   (renders based on mode + detail level)     │   │
│  │                                              │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ ← Prev │ Next → │ Skip Category │ 📝 Note  │    │
│  │        │        │ 🔖 Beacon     │ Exit      │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Progress: ████████░░░░░░░  Category 3/12  Item 7/15│
└─────────────────────────────────────────────────────┘
```

### Mode Behavior

**Topic Mode**:
- Landing: Grid of featured topics (6 seed topics + any added later)
- Each topic card shows: title, subtitle, estimated time, item count
- Click → sequential playthrough of that topic's item_slugs
- Navigation: ← Prev | Next → | Return to Topics

**Category Mode**:
- Landing: Grid of all categories (from tour_category_order)
- Click category → all items in that category with cross-connections
- Items shown as cards with depth controls (Glimpse/Peek/Tell Me More)
- Navigation: ← Prev | Next → | Return to Categories

**Guided Tour Mode**:
- No landing — starts immediately at Category 1, Item 1
- Auto-advances through items within each category
- Category transitions show a brief interstitial: "Now entering: Economics & Currency — 6 items"
- Navigation: ← Prev | Next → | Skip to Next Category | Place Beacon | Exit
- Progress bar shows: category X/12, item Y/N, overall %

### Detail Level Switcher

3-position toggle visible at all times (sticky header):
- **Skipping Stones** (ripple icon) — shows Glimpse + Peek fields from Crow's Nest data
- **Wading In** (wave icon) — shows Tell Me More field
- **Deep Dive** (anchor icon) — shows full content + action buttons (Try It, Show Me, Pack To-Go)

Switching levels re-renders current content immediately (smooth expand/contract). Choice persists in guided_tour_state (authenticated) or localStorage (anonymous).

### Content Rendering

For each content item, pull from `cephas_content_registry` (DB) or fall back to Crow's Nest items (in-memory data). Render with react-markdown + remark-gfm. Apply template variable replacement from useCanonicalStats (same as K193).

### Return Beacons

When user clicks "Place Beacon":
1. Save current position to `tour_return_beacons` (or localStorage if anonymous)
2. Show toast: "Beacon placed at [item title]. You can return here anytime."
3. Beacons visible in a collapsible sidebar panel or dropdown
4. Click a beacon → jump to that item in that mode at that detail level

---

## TASK 3: Content Query Pattern

The tour needs to query Cephas content by category. Use existing `cephas_content_registry` table:

```typescript
// Fetch all items for a category, ordered by sort_order
const { data } = await supabase
  .from('cephas_content_registry')
  .select('slug, title, section, content, summary, keywords')
  .eq('section', category)
  .order('sort_order', { ascending: true });
```

For Guided Tour mode, iterate through `tour_category_order` (sorted by sort_order), and for each category, load its items.

---

## TASK 4: Navigation Integration

1. Add "Guided Tour" to AppSidebar (Compass icon, under Cephas/Knowledge)
2. Add prominent CTA on CephasGatewayPage: "Take the Guided Tour →"
3. Route: `/tour` (lazy-loaded)
4. Add to PressJunket.tsx guided tours section (15/45/90 min tours can link to specific topics)

---

## TASK 5: Innovation Log

```sql
INSERT INTO innovation_log (innovation_number, title, description, category, status)
VALUES 
(2115, 'Guided Tour Engine (Three-Mode Content Navigation)', 'Three-mode content navigation system: Topic Focus (curated sequential chains), Category Browse (all items with connections), and Guided Tour (auto-advancing through all categories with skip/save/exit). Integrates with 6-depth Crow''s Nest system mapped to 3 user-facing levels (Skipping Stones/Wading In/Deep Dive). Return Beacons for save-and-resume.', 'user_experience', 'implemented'),
(2116, 'Adaptive Detail Level Switcher', 'Three-position detail toggle (Skipping Stones/Wading In/Deep Dive) that changes how content renders in real-time. Maps to internal 6-depth system. Persists in localStorage or user profile. Content smoothly expands/contracts without page reload.', 'user_experience', 'implemented')
ON CONFLICT (innovation_number) DO NOTHING;

UPDATE platform_canonical SET value = 2117, updated_at = now() WHERE key = 'innovation_count';
```

---

## CONSTRAINTS
- Content comes from DB (cephas_content_registry), NOT Hugo files
- Template variables ({{innovationCount}} etc.) must render with live stats
- Anonymous users can use the tour (localStorage state) — no auth required
- Authenticated users get persistent state in DB
- Must work on mobile (responsive layout)
- Cost+20% and 83.3% are CONSTITUTIONAL — never misquote in tour content

---

## ACCEPTANCE CRITERIA
- [ ] guided_tour_state, tour_return_beacons, tour_topics, tour_category_order tables created
- [ ] 6 featured topics seeded
- [ ] 12 categories seeded with ordering
- [ ] GuidedTourPage at /tour with all 3 modes working
- [ ] Detail level switcher (3 positions) functional
- [ ] Return Beacons save and restore
- [ ] Progress tracking (items viewed, time, current position)
- [ ] Sidebar + CephasGateway integration
- [ ] Innovation #2115 + #2116 logged
- [ ] Build passes, deploy all 8 targets

---

*Knight Session 194 — Guided Tour Engine*
*If you just sit there, you learn the entire platform.*
*FOR THE KEEP!*
