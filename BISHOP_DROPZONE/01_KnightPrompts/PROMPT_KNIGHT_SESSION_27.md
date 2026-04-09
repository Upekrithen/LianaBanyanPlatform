# Knight Session 27 — Bishop 011 Handoff
## March 17, 2026

---

## CONTEXT

Bishop Session 011 completed landing page architecture changes: DenkenMenu (unified floating tool button), "No Ads · COOPERATIVE COMMERCE · No V.C." manifesto line, bottom explainer card commented out and replaced with Charity Card (3 deck cards front, 16 initiative pills back), hero card control fixes, and various CSS fixes. Build is clean and deployed.

The big theme from the Founder this session: **Action-First UI**. Direct quote: *"I would HATE having explanations thrown at me — I want to DO IT, and if I want help, I do X-Ray etc."* Every informational card should become an action card. Progressive disclosure via X-Ray Goggles for "how it works" details.

**All deploys are live.** Build clean at 33s.

---

## TASK 1: Portal Routing Hub — Action-First (`/portal`)

### Current State
The `/portal` page has cards/boxes that describe things but don't DO things. Founder wants every card to be an action.

### What Needs Building
1. **"Sponsor & Support"** → should route to `/plant-seeds` (page exists, excellent content, currently orphaned)
2. **"Sponsor Members"** → should route to `/sponsor` (page exists, currently orphaned)
3. **"Browse Projects"** → should route to actual project listings — HexIsle, initiatives being voted on, any of the 47 creators or others who sign up. NOT just scroll to an explanation.
4. **Every card/box must DO something** — link, navigate, open overlay, trigger action. If it just explains, move that content to X-Ray Goggles.

### Design Principle
- Default view = action cards (verb-first: "Back This", "Browse", "Invite", "Pledge")
- X-Ray Goggles mode = reveals "how it works" explanations overlaid on the action cards
- No standalone explanation cards in default view

---

## TASK 2: Production Levels on Build-a-Business — Action Buttons

### Current State
Production level cards on Build-a-Business page are display-only — they explain the tiers but have no actionable buttons.

### What Needs Building
1. Each production level card needs a **"Back This Project"** or **"Pledge"** button
2. Tier explanations should be behind X-Ray Goggles, not default display
3. Default card view: project name, creator, funding progress bar, pledge button
4. X-Ray view: adds tier explanation, margin breakdown, how cooperative funding works

---

## TASK 3: Plant Seeds / Build a Business — Link from Portal

### Current State
Both pages exist with excellent content (dark gradient, clear CTAs) but are orphaned — no navigation path reaches them.

### What Needs Building
1. Wire `/plant-seeds` and `/build-a-business` into Portal navigation
2. Add to DenkenMenu as future submenu items (or to main nav)
3. Preserve the consistent dark gradient + CTA motif
4. Ensure breadcrumb/back navigation works

---

## TASK 4: Charity Card Phase 2 — Wire Real Data

### Current State
Charity Card is live on landing page with hardcoded `INITIATIVE_DATA` array inline in Index.tsx. Uses conditional render fade-in (not CSS 3D flip). Placeholder taglines.

### What Needs Building
1. **Import from `daisyChainLink.ts`** — use `SWEET_SIXTEEN` constant instead of hardcoded `INITIATIVE_DATA`
2. **Real taglines from `SWEET_SIXTEEN_CANONICAL.md`** — replace placeholder taglines
3. **CSS 3D flip** — replace current conditional render (fade-in) with proper `transform-style: preserve-3d` + `backface-visibility: hidden` + `rotateY(180deg)` flip (same pattern as hero card)
4. **Initiative detail expansion** — pull features from `InitiativePage.tsx` `INITIATIVE_CONFIGS` for richer pill expansion
5. **Responsive polish** — 4×4 grid → 2×2 on mobile (CSS exists but may need tuning)

### Reference Files
- `SWEET_SIXTEEN_CANONICAL.md` — single source of truth for all 16 initiatives
- `platform/src/data/daisyChainLink.ts` — SWEET_SIXTEEN constant
- `platform/src/pages/InitiativePage.tsx` — INITIATIVE_CONFIGS with full details
- Current implementation: `platform/src/pages/Index.tsx` ~line 3603

---

## TASK 5: Browse Projects Page

### Current State
No dedicated project browsing page exists. "Browse Projects" in portal has nowhere meaningful to go.

### What Needs Building
1. `/projects` or `/browse` route with filterable project grid
2. Categories: HexIsle, Initiatives (16), Creator Submissions (47+ from Instagram Factor-y)
3. Each project card: image/placeholder, name, creator, funding %, "Back This" button
4. Filter/sort: category, funding status, newest, most backed
5. Can use mock data until real projects exist — but structure should be real

---

## FILES CHANGED IN BISHOP SESSION 011

| File | Changes |
|------|---------|
| `src/components/builder/DenkenMenu.tsx` | **NEW** — Unified floating avatar button with hover submenu (X-Ray + Crow's Nest) |
| `src/App.tsx` | DenkenMenu wired inside CrowsNestProvider; CrowsNestFloat + BuilderModeToggle commented out |
| `src/pages/Index.tsx` | Manifesto eyebrow line, Charity Card (front 3 cards + back 16 pills), explainer commented out, hero fixes |
| `src/styles/landing.css` | Liana white text, chalk outline fix, charity CSS, hero-front fixes |
| `src/components/RotatingQuotes.tsx` | Linter changes only |
| `src/components/builder/BuilderModeToggle.tsx` | Linter changes, preserved (replaced by DenkenMenu) |
| `src/pages/SaltMines.tsx` | Added missing `Info` import, removed duplicate `useAuth` import |

---

## FOUNDER DIRECTIVE — ACTION-FIRST UI

This is now a **design principle** for the entire platform:

> "I would HATE having explanations thrown at me — I want to DO IT, and if I want help, I do X-Ray etc."

**Rules:**
- Every visible card/section in default view must have a primary action (button, link, CTA)
- Explanatory content ("How it works", "What is this?") belongs in X-Ray Goggles mode ONLY
- Progressive disclosure: Action → X-Ray for context → Deep link for full details
- Portal especially: every box = a door to somewhere, not a poster on the wall

---

## PRIORITY ORDER

1. **Portal Routing Hub** (Task 1) — action-first, connects orphaned pages
2. **Production Level Actions** (Task 2) — completes Build-a-Business functionality
3. **Plant Seeds / BaB Linking** (Task 3) — quick win, pages already exist
4. **Charity Card Phase 2** (Task 4) — polish, real data
5. **Browse Projects** (Task 5) — needs most new code, can use mocks

---

## DEPLOY INFO
- Firebase tools: v15.10.0
- Build: `node node_modules\vite\bin\vite.js build`
- Deploy: `npx firebase deploy --only hosting`
- Exit code 1 on build = normal (chunk size warnings). Success = "✓ built in XXs"

---

**FOR THE KEEP**
*BISHOP Session 011 → Knight Session 27*
*March 17, 2026*
*Status: ALL DEPLOYED*
