# KNIGHT SESSION 135 — X-Ray Overlay + Design Democracy
## Community-Governed Visual Design System
**Innovations:** #2010, #2011, #2012, #2013, #2014 | **Bishop:** 035 | **Date:** March 27, 2026

---

## CONTEXT
The X-Ray Goggles system already exists in the codebase. This session extends it with:
1. "You Can Do Better" overlay submission on Lark-bearing elements
2. CSS Zen Garden-style full-page theme submissions
3. Design Democracy voting
4. Tiered theme governance (Guild/Tribe/Personal)
5. Guild Banner Contests (extending K133's design_contests table)

This is a **Crown Jewel** (#2011) and **Paper Candidate** ("Design Democracy").

## DELIVERABLES

### Deliverable 1: Migration
Create `20260327000006_design_democracy.sql`:

**Table: element_overlays**
- id UUID PK
- element_ref TEXT NOT NULL — CSS selector or data-overlay-id of the target element
- page_path TEXT NOT NULL — which page this element lives on
- submitted_by UUID REFERENCES profiles(id) NOT NULL
- overlay_type TEXT CHECK (type IN ('text','image','svg','html'))
- overlay_content TEXT NOT NULL — the submitted replacement content
- screenshot_before TEXT — URL of screenshot showing original
- screenshot_after TEXT — URL of screenshot showing overlay applied
- status TEXT CHECK (status IN ('pending','voting','approved','rejected','featured')) DEFAULT 'pending'
- upvotes INTEGER DEFAULT 0
- downvotes INTEGER DEFAULT 0
- lark_id UUID — reference to the associated Lark/bounty if applicable
- created_at TIMESTAMPTZ DEFAULT now()
- approved_at TIMESTAMPTZ
- RLS: anyone can read approved; creator can manage own pending

**Table: page_themes**
- id UUID PK
- page_path TEXT — NULL means site-wide theme
- theme_name TEXT NOT NULL
- submitted_by UUID REFERENCES profiles(id) NOT NULL
- css_content TEXT NOT NULL — full CSS override
- preview_screenshot TEXT — URL of preview image
- status TEXT CHECK (status IN ('pending','voting','approved','rejected','featured')) DEFAULT 'pending'
- upvotes INTEGER DEFAULT 0
- downvotes INTEGER DEFAULT 0
- scope TEXT CHECK (scope IN ('element','page','site')) DEFAULT 'page'
- created_at TIMESTAMPTZ DEFAULT now()
- RLS: anyone can read approved/featured; creator can manage own

**Table: design_votes**
- id UUID PK
- voter_id UUID REFERENCES profiles(id) NOT NULL
- voteable_type TEXT CHECK (type IN ('element_overlay','page_theme','design_contest_submission'))
- voteable_id UUID NOT NULL
- vote INTEGER CHECK (vote IN (-1, 1)) — downvote or upvote
- created_at TIMESTAMPTZ DEFAULT now()
- UNIQUE(voter_id, voteable_type, voteable_id)
- RLS: one vote per user per item

**Table: theme_preferences**
- id UUID PK
- user_id UUID REFERENCES profiles(id) NOT NULL
- scope TEXT CHECK (scope IN ('personal','guild','tribe'))
- scope_id UUID — guild_id or tribe_id (NULL for personal)
- active_theme_id UUID REFERENCES page_themes(id)
- created_at TIMESTAMPTZ DEFAULT now()
- UNIQUE(user_id, scope, scope_id)
- RLS: owner only

### Deliverable 2: Hooks
Create `platform/src/hooks/useDesignDemocracy.ts`:
- useElementOverlays(pagePath) — overlays for a specific page
- useSubmitOverlay() — submit a new element overlay
- usePageThemes(pagePath?) — available themes for a page (or site-wide)
- useSubmitTheme() — submit a new page/site theme
- useDesignVote() — cast/change vote on overlay or theme
- useMyThemePreference(scope, scopeId?) — get user's active theme
- useSetThemePreference() — set user's active theme
- useThemeGallery() — featured/top-voted themes for browsing

### Deliverable 3: X-Ray Overlay Components
Create `platform/src/components/xray/`:

**OverlayTrigger.tsx** — The "You Can Do Better" badge
- Renders inline with element border when X-Ray mode is active
- Only visible on elements with data-overlay-id AND associated Larks
- Pulsing subtle animation to draw attention without being obtrusive
- Click → activates OverlayEditor for that element

**OverlayEditor.tsx** — The submission layer
- Absolute-positioned transparent div over target element
- Write mode: text input that covers the element
- Upload mode: drag-and-drop image/SVG that covers the element
- Preview toggle: see your overlay vs. see the original
- Submit button: sends to review queue
- Cancel: removes overlay, returns to X-Ray mode

**OverlayReviewPanel.tsx** — Voting on submitted overlays
- Before/after comparison (slider or toggle)
- Upvote/downvote buttons
- Comment thread (optional)
- Auto-promotion thresholds: 10 upvotes → voting, 25 upvotes + <5 downvotes → approved

### Deliverable 4: Theme Gallery Page
Create `platform/src/pages/ThemeGallery.tsx` at `/design/themes`:
- Grid of available themes with preview screenshots
- Filter: site-wide | per-page | my Guild | my Tribe
- "Apply Theme" button → sets in theme_preferences
- "Submit Theme" button → opens CSS editor (protected route)
- Current theme indicator
- Vote counts and featured badges

### Deliverable 5: Theme CSS Editor
Create `platform/src/pages/ThemeEditor.tsx` at `/design/themes/create`:
- **Protected route**
- CSS textarea with syntax highlighting (use Monaco editor if available, else plain textarea)
- Live preview in sandboxed iframe
- Class name reference panel (list of platform CSS classes available for override)
- Submit for review → creates page_themes record

### Deliverable 6: X-Ray Mode Enhancement
Update existing X-Ray Goggles toggle to:
- Show OverlayTrigger badges on Lark-bearing elements
- Add "Design Mode" sub-toggle within X-Ray
- Display active theme indicator in X-Ray toolbar

### Deliverable 7: Routes + Navigation
Add to App.tsx:
- `/design/themes` — ThemeGallery (ExplorerRoute)
- `/design/themes/create` — ThemeEditor (ProtectedRoute)

Add to UnifiedNavigation.tsx:
- "Theme Gallery" under Design section (Palette icon)

### Deliverable 8: Canonical Stats
Update useCanonicalStats.ts:
- innovationCount: current + 5 (implementing #2010-#2014)
- crownJewels: +1 (#2011 — Community-Governed Visual Design)

## RULES
- Credits NEVER cash out. One-way valve.
- No securities language.
- C+20 constitutional floor.
- Design contest submissions earn Marks (cooperative currency), not dollars.
- Accessibility: all community-submitted themes must pass WCAG AA contrast check (enforce in ThemeEditor before submit).
- Version history: original design ALWAYS preserved. Overlays ADD, they don't destroy.
- The X-Ray "You Can Do Better" sign is ONLY visible in X-Ray mode. Normal users never see it.

## BUILD ORDER
1. Migration → 2. Hooks → 3. X-Ray components (OverlayTrigger, OverlayEditor, OverlayReviewPanel) → 4. ThemeGallery → 5. ThemeEditor → 6. X-Ray enhancement → 7. Routes → 8. Stats → Build → Deploy

FOR THE KEEP!
