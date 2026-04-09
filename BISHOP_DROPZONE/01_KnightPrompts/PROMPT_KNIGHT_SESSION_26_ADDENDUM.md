# Knight Session 26 — ADDENDUM (Bishop Management Directive)
## March 16, 2026 — Supersedes original Session 26 task list

Bishop is managing Knight's workload. These are binding instructions.

---

## THIS SESSION: 3 Features Only

### Feature 1: Political Expedition / Pnyx Merge
**Merge the old `PoliticalExpeditionPage.tsx` operational tools INTO the current `PowerToThePeoplePage.tsx`.**

- **KEEP** the current top section intact: Ella Wheeler Wilcox poem, Switzerland Protocol, Quad-Crown structure, Crown nomination sidebar
- **ADD** a new tabbed section below the philosophy: `Representatives` | `Tracked Bills` | `Take Action`
- **PORT** representative cards with vote alignment scores and contact actions from the old page
- **PORT** the bill tracker (bill number, status, relevance priority) from the old page
- **PORT** the Take Action panel (Contact Rep, Register to Vote, Join the Pnyx)
- **REPLACE** `LianaBanyanHeader` import with standard navigation (it doesn't exist in current platform)
- **USE** sample data with `SampleDataBadge` for representative lookup (no real API yet)
- **⚠️ ASK FOUNDER** before placing the Arena visualization — screenshot the layout first, confirm it doesn't conflict with Quad-Crown sidebar

### Feature 2: WhyNoAds + WhyNoVC Pages
**Port both pages from the old escape-velocity codebase.**

- Create `WhyNoAds.tsx` and `WhyNoVC.tsx` in `platform/src/pages/`
- Replace `LianaBanyanHeader` with standard back-button navigation
- **WhyNoVC number corrections**: Change "29 patent bags with 1,130 documented innovations" to "7 provisional applications with 1,662 documented innovations"
- Add routes `/why-no-ads` and `/why-no-vc` in `App.tsx` (public, no auth)
- Lazy-load both pages
- Cross-links between the two pages + to `/the-300` and `/fly-on-the-wall`

### Feature 3: Chalk Outline Onboarding Wiring
**The component `ChalkOutlineOnboarding.tsx` already exists and is fully built by Bishop. Knight wires it up.**

- Create route `/create` with `?invite=CREATOR_ID` parameter
- Create Supabase migration for `creator_invites` table:
  - `id` (uuid, primary key)
  - `creator_handle` (text)
  - `invite_code` (text, unique)
  - `status` (text: pending/accepted/launched)
  - `created_at` (timestamptz)
  - `project_id` (uuid, nullable, FK to products)
- Add Supabase persistence (save field state to `project_drafts` table, not just localStorage)
- Pre-fill creator name and Instagram handle when `?invite=CREATOR_ID` is in URL
- On "Launch" confirmation: create entry in `products` table, set status to `live`

---

## DO NOT TOUCH (Bishop's Tasks)

These are explicitly reserved for Bishop's next session:

- ❌ Accessibility presets (Mirror Mirror panel)
- ❌ X-Ray Goggles glossary entries and deep interconnection mode
- ❌ FAQ updates for new systems
- ❌ Six Degrees voting system implementation
- ❌ Profile Preview ("Mirror Mirror View")
- ❌ Fairness Dashboard

---

## FAQ Additions (Knight CAN Do)

Add collapsible FAQ sections explaining these systems. One paragraph each, plain language:

1. **Six Degrees of Separation** — How the cooperative connects people through referral chains (Outreach, Medical, Opportunity)
2. **Chalk Outline Onboarding** — How creators set up their project pages (fill in the outline, it solidifies)
3. **Double-Dipping and Stacking** — Platform philosophy that reward layers are designed to stack (with ice cream cone metaphor)
4. **Star Chamber** — Multi-AI governance verification (7 agents, 5/7 consensus required)
5. **LifeCompass** — Personal goal tracking with milestones and personality-matched recommendations
6. **WhyNoAds / WhyNoVC** — Brief explanation pointing to the new pages

---

## Approved Backlog (In Order, Future Sessions)

| Session | Features |
|---------|----------|
| Knight 27 | The 300 (dedicated page, update Canada Visa Crisis) + Star Chamber (7-agent UI) + Santa Evermore → Let's Go Shopping (scoping only) |
| Knight 28 | Boaz Principle visualization + Castle/12-Door hub (ASK FOUNDER about dashboard nav conflicts) + Alexandrian Library |
| Knight 29 | Letter Observatory + Fleet Formation + LifeCompass |
| Knight 30 | Santa Evermore / Let's Go Shopping full build (large scope, may need 2 sessions) |

All items above are **Founder-approved for merge**. No further approval needed except where noted "ASK FOUNDER."

---

## Build / Deploy / Commit

After completing Features 1-3 + FAQ additions:
- Build: `node node_modules\vite\bin\vite.js build`
- Deploy: `npx firebase deploy --only hosting`
- Commit with descriptive message covering all changes
- Auth: Founder@lianabanyan.com (already authenticated)

---

**FOR THE KEEP**
*Bishop Session 010 → Knight Session 26 Addendum*
*March 16, 2026*
*Bishop is managing. Follow these instructions exactly.*
