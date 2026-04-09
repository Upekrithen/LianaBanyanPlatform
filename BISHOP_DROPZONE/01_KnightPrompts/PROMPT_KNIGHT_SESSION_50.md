# Knight Session 50 — Work Order

**Issued by**: Bishop (Claude Desktop)
**Date**: 2026-03-18
**Base commit**: TBD (Knight 49 latest)
**Platform root**: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
**Stack**: React/Vite SPA, Supabase, Firebase (8 hosting targets), TypeScript, shadcn/ui

**THIS IS SESSION 50 — THE MILESTONE SESSION.** Focus on integration, polish, and launch readiness. No new feature pages. Make everything we have work together beautifully.

> **NotCents Economy context**: The three-currency system (Credits/Marks/Joules) is branded "The NotCents Economy." The Anvil (Ↄ‖) is the currency symbol. "Powered by NotCents™" should be in the site footer.

---

## TASK A: Homepage Integration

### Context

The homepage is the front door. After Sessions 37-49, the platform has grown enormously — dozens of new pages, systems, and features. The homepage needs to showcase this depth without overwhelming visitors. It should feel like a living, active platform, not a static landing page.

### Steps:

1. **Identify the active homepage component.** Check both `src/pages/Index.tsx` and `src/pages/PublicLandingView.tsx`. Whichever is the primary rendered homepage (the one at route `/`), that is what you enhance. If both exist, enhance the one that's actually mounted.

2. **Add these integration sections to the homepage** (in addition to whatever already exists — do NOT remove existing content):

   **Daily News Widget:**
   - Check if `src/pages/DailyNews.tsx` exports a compact widget/carousel component. If yes, embed it.
   - If no exportable widget exists, create a `DailyNewsWidget` component in `src/components/` that shows the 3 most recent news items as a horizontal card carousel.
   - Section title: "Platform News"

   **Main Square Preview:**
   - Card: "Visit Main Square" with Store icon
   - Show 3 featured stores (pull from Supabase if store data exists, otherwise use placeholder data)
   - "Browse All Stores" button linking to `/main-square`

   **BandWagon Preview:**
   - Card: "Back a Project" with Rocket icon
   - Show the most-funded active project (query from BandWagon tables if they exist)
   - Progress bar showing funding percentage
   - "See All Projects" button linking to `/bandwagon`

   **XP Leaderboard Preview:**
   - Card: "Top Contributors" with Trophy icon
   - Top 5 members by XP (query from XP tables if they exist, otherwise placeholder)
   - Box notation display for XP (Bronze/Silver/Gold tiers)
   - "Full Leaderboard" button linking to `/xp-leaderboard`

   **NotCents Economy Banner:**
   - Prominent banner or hero card:
     - "Powered by NotCents™" with the Anvil symbol (Ↄ‖)
     - Brief: "Three currencies. One fair economy. Credits for buying, Marks for effort, Joules for the future."
     - Three small cards in a row: Credits (green), Marks (blue), Joules (gold) — each with a one-line description
     - "Learn More" linking to `/c-plus-20`

   **Quick Navigation Cards:**
   - Responsive grid of navigation cards for major sections:
     - Economy: Main Square, BandWagon, C+20, XP Leaderboard
     - Making: Store Templates, Manufacturing, Tereno Certification
     - Community: Daily News, Vouch System, Coverage Minutes
     - Management: Steward Dashboard, Node Captain, Star Chamber
   - Each card: icon + name + one-line description + link
   - 4 columns on desktop, 2 on tablet, 1 on mobile

3. **Ensure the homepage is responsive** and looks good at mobile, tablet, and desktop widths.

---

## TASK B: Navigation Audit + Polish

### Context

Sessions 37-49 added many pages. The sidebar navigation may be inconsistent, some routes may be missing lazy imports, and the logical grouping of navigation items needs attention.

### Steps:

1. **Audit all routes in `App.tsx`** (or wherever routes are defined). List every route added in sessions 37-49. Verify:
   - Every page component is lazy-imported (no eager imports for page-level components)
   - Every route has a corresponding Suspense fallback
   - No duplicate routes
   - No broken imports (component files that don't exist)

2. **Audit sidebar navigation** (likely in `src/components/Sidebar.tsx` or `src/components/AppSidebar.tsx` or similar). Verify every new page has a sidebar entry. Group navigation items logically:

   **Economy:**
   - Main Square (`/main-square`)
   - BandWagon (`/bandwagon`)
   - XP Leaderboard (`/xp-leaderboard`)
   - C+20 Reciprocity (`/c-plus-20`)

   **Tools:**
   - Send Lists (`/send-lists` or wherever the send-list feature lives)
   - MoneyPenny Q&A (`/moneypenny-qa`)
   - Social Command Center (`/moneypenny-social`)

   **Making:**
   - Store Templates (`/store-templates`)
   - The Forge — Manufacturing (`/manufacturing`)
   - Tereno Certification (`/tereno-certification`)

   **Community:**
   - Daily News (`/daily-news`)
   - Vouch System (`/vouch`)
   - Ghost World (`/ghost-world`)
   - Coverage Minutes (`/coverage-minutes`)

   **Governance:**
   - Star Chamber (`/star-chamber`)
   - Steward Dashboard (`/steward-dashboard` or wherever it lives)
   - Node Captain (`/node-captain`)
   - Santa Ever After (`/santa`)

   NOTE: These are suggested groupings. Check what routes ACTUALLY exist in the codebase and group them sensibly. Do not add navigation entries for routes that don't exist. If a page exists at a different route than listed above, use the actual route.

3. **Fix any broken routes** or missing lazy imports. If a route points to a component that doesn't exist, either create a minimal placeholder page or remove the route.

4. **Mobile responsiveness check**: Open each new page (sessions 37-49) and verify basic mobile layout. Fix any obvious layout breaks (content overflowing, cards not stacking, tables not scrolling horizontally). You don't need pixel-perfect mobile design — just ensure nothing is broken.

5. **Run `npm run build`** and fix ALL TypeScript errors across the entire codebase. This is critical for Session 50 — zero build errors.

---

## TASK C: Performance Check + Final Documentation

### Steps:

1. **Build analysis:**
   - Run `npm run build` and record the output bundle sizes
   - If any single chunk exceeds 500KB, investigate and consider code splitting
   - Ensure all page components are lazy-loaded

2. **Image optimization:**
   - Check for any large unoptimized images in `public/` or `src/assets/`
   - If any images exceed 500KB, note them in the handoff (don't optimize manually — just document)

3. **Route inventory:**
   - Count and list ALL routes in the application
   - Count all page components
   - Count all Supabase migrations

4. **Update `MILESTONE_HANDOFF_MARCH_2026.md`** with a comprehensive Session 50 summary:
   - Total page count
   - Total route count
   - Total migration count
   - Navigation structure (the grouped sidebar)
   - Any remaining known issues or TODOs
   - "Session 50 complete — platform integrated and polished for Ring 1 testers"

5. **Deploy to Firebase.** Both hosting targets. This is the milestone deploy.

---

## Standard Knight Instructions

- **Build check**: Run `npm run build` before every commit. Fix any errors. **Session 50 demands ZERO build errors.**
- **Handoff**: Update `MILESTONE_HANDOFF_MARCH_2026.md` with comprehensive Session 50 summary.
- **Commits**: Separate commits per task (Task A, Task B, Task C).
- **Deploy**: Deploy to Firebase when ALL tasks complete. Both hosting targets.
- **Patterns**: Follow existing codebase patterns for components, hooks, and Supabase queries.
- **Migration numbering**: No new migrations expected this session. If needed, continue from 20260319000037 (Session 49 used 000033-000036).
- **NotCents branding**: Use Anvil symbol (Ↄ‖) for currency displays. "Powered by NotCents™" in footer.

**SESSION 50. THE MILESTONE. MAKE IT SHINE.**

**FOR THE KEEP!**
