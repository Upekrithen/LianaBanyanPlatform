# Knight Session 65 Prompt
## DailyNewsWidget + Defense Klaus Banner + Crown Letter Updates + Privacy/Terms Pages
## Priority: HIGH — Founder requested all. Privacy/Terms URGENT (Twilio A2P review depends on them).

---

## Task 0: Privacy Policy + Terms Pages (URGENT — do first)

Twilio A2P campaign is under review. They may crawl these URLs. If they get 404s, the campaign could be rejected and Moneypenny SMS stays blocked.

**Create two pages:**

### `/privacy` — Privacy Policy
1. Create `src/pages/PrivacyPolicy.tsx`
2. Route: `/privacy`
3. Layout: PortalPageLayout variant="stage"
4. Content — standard cooperative privacy policy covering:
   - What data we collect (email, username, platform activity)
   - What we DON'T collect (demographics — zero demographics policy)
   - How data is used (platform operations, never sold to third parties)
   - SMS: "We send SMS messages only to users who initiate contact or opt in through account settings. Reply STOP to unsubscribe."
   - Cookies: minimal, functional only
   - Third parties: Supabase (database), Firebase (hosting), Twilio (SMS)
   - Contact: Founder@LianaBanyan.com
   - Last updated: March 20, 2026

### `/terms` — Terms and Conditions
1. Create `src/pages/TermsAndConditions.tsx`
2. Route: `/terms`
3. Layout: PortalPageLayout variant="stage"
4. Content — standard cooperative terms covering:
   - Program name: Liana Banyan Cooperative Platform
   - Membership: $5 entry, permanent
   - SMS program: message frequency varies, msg & data rates may apply
   - Opt-out: text STOP to unsubscribe from SMS
   - Help: text HELP for assistance
   - Support contact: Founder@LianaBanyan.com, 406-578-1232
   - Three-Currency System: Credits, Marks, Joules (NOT securities, NOT investments)
   - Cost+20% pricing model
   - IP contribution-back clause (member innovations contribute to cooperative IP estate)
   - Dispute resolution: Star Chamber governance
   - SEC-safe language throughout
   - Last updated: March 20, 2026

**Both pages need to be live ASAP.** Deploy after building these two.

---

## Task 1: Wire DailyNewsWidget into Homepage (5 min)

The `DailyNewsWidget` component is exported from `src/pages/DailyNews.tsx` (line 310) but is NOT imported anywhere. It was built to be embedded on the homepage.

**Action:**
1. Import `DailyNewsWidget` from `../pages/DailyNews` into `src/pages/Index.tsx`
2. Place it in the authenticated "Your Keep" view section
3. It's a self-contained carousel with auto-advance — just drop it in

**The widget already handles:**
- Time-slotted news rotation
- LIVE indicator
- 6 slide types
- Auto-advance at configurable intervals
- Link to full `/daily-news` page

---

## Task 2: Defense Klaus "I Need a Hero" Banner

Add a permanent accent banner to the Defense Klaus initiative pages:

**Pages:** `DefenseKlaus.tsx` (pedestal) AND `DefenseKlausSub.tsx` (detail) — or wherever these live in the current routing

**Banner content:**
```
$5/Week: "I Need a Hero"
3 Elves + 3 Spotters minimum per activation. Never respond alone.
Your $5 subscription funds the standing bounty.
[Sign Up] [Learn More]
```

**Style:** Full-width accent banner at top of page content (below header, above main content). Gradient background matching portal palette. NOT the same as Mission ONE event banner — this is PERMANENT on Defense Klaus pages only.

**[Sign Up]** → links to subscription flow (placeholder route `/defense-klaus/subscribe` for now)
**[Learn More]** → scrolls to explanation section on same page

---

## Task 3: Crown Letter Update Route (scaffold)

New route: `/updates/crown/:slug`

**Purpose:** Living update page for each Crown Letter recipient. Shows what's changed since the letter was sent.

**Scaffold only — Bishop will write content later:**
1. Create `src/pages/CrownLetterUpdate.tsx`
2. Route: `/updates/crown/:slug` (dynamic)
3. Layout: PortalPageLayout variant="stage"
4. Sections (placeholder content):
   - Letter sent date
   - Timeline of changes (innovation count, features, missions)
   - Current platform state
   - "What Changed That Matters To You" (personalized per slug)
5. Slugs to support: `scott`, `buffett`, `khan`, `dougherty`, `newmark`, `glenn`, `williams`, `kaiser`, `seibel`, `simon`, `schlossberg`

**Migration:** `crown_letter_updates` table:
- id (uuid)
- letter_slug (text, unique)
- recipient_name (text)
- letter_sent_date (timestamptz)
- updates (jsonb array of {date, headline, body, relevance_tags})
- created_at, updated_at

---

## Task 4: Innovation count update

Update `useCanonicalStats.ts` DEFAULTS: innovationCount → 1,810

---

## Notes
- Do NOT start Part 2 (interior color token sweep) yet
- All Part 1 wrapper migration should be complete or nearly complete after Session 64
- The "needs care" complex pages (Dashboard, SaltMines, BeaconExplainer, TheHelm, etc.) can wait for a dedicated session
- Privacy/Terms pages are BLOCKING for Twilio — do these first, deploy, then proceed with other tasks
