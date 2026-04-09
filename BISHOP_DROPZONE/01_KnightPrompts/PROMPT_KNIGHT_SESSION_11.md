# KNIGHT SESSION 11 — Full Build Queue
## Date: March 13, 2026
## Priority: BUILD THE WEBSITE, COLD STARTS, CARDS, HEXISLE

---

## READ FIRST

This is a large session with 6 build tasks. Follow them IN ORDER. Each builds on the previous. If you approach your context limit (~3 major features), STOP, commit, deploy, and hand off the remaining tasks to the next Knight session.

**CRITICAL: Warn the Founder when you're at ~80% context. Say "Approaching session limit — recommend handoff after this."**

---

## STEP 0: HOUSEKEEPING (Do this FIRST, before anything else)

### 0A. Commit the 40 unstaged files from Session 10
There are 40 modified files from the last Knight session (CO Role Templates, Temperament Weighting, Reviewer Pipeline migration, innovation count 1,599). They are NOT committed.

```bash
cd /c/Users/Administrator/Documents/LianaBanyanPlatform
git add platform/ .cursor/
git commit -m "feat: Session 10 — CO role templates, temperament weighting, reviewer pipeline, innovation count 1,599"
git push
```

### 0B. Deploy ALL pending commits
Commits 0821647, a69f8c1, c0356fb are pushed but NOT deployed. Plus your new commit.

```bash
cd platform
npm run build
firebase deploy --only hosting:main -P default
```

### 0C. Run ALL pending migrations
```bash
cd platform
npx supabase db push --linked
```

Verify with `npx supabase migration list --linked` — all migrations should show as applied.

---

## STEP 1: WELCOMEGATE "FLATTENED DECK" REDESIGN

### What exists now
`platform/src/components/WelcomeGate.tsx` — progressive reveal with 30 fable frames, ENTER button → /portal, rotating quotes.

### What to build
Replace the current single-view WelcomeGate with a **three-tab card system**:

**Tab A — "Concept"**
- The 30 fable frames (images already at `public/images/fable/1.png` through `30.png`)
- Fast flipbook auto-play (FABLE_FRAME_COUNT = 30, ~1.5s per frame)
- Controls bar: ◀ (back) | 1× 2× 3× (speed) | ⏸ (pause) | Skip ▶ (skip to end)
- After animation completes or Skip pressed: show settled state with "Concept" summary text
- Keep RotatingQuotes below the player

**Tab B — "Get Started"**
- Four large, clear buttons (full-width, stacked on mobile, 2×2 grid on desktop):
  - 🟢 "Earn" → navigates to `/treasure-map`
  - 🔵 "Build" → navigates to `/crew/new`
  - 🟡 "Learn" → navigates to `/academy`
  - 🟣 "Explore" → navigates to `/portal`
- NO flipping, NO animations. Clean, immediate.
- Below buttons: "Not sure? Take the 5-minute Treasure Map quiz →"
- `data-xray-id="welcomegate-get-started"`

**Tab C — "More Detail"**
- Heading: "Member-Owned. Member-Governed. You are a Member-Owner."
- Content sections (collapsible accordions):
  - Mutual Aid: "Every transaction generates reciprocal value..."
  - Transparent Pricing: "Cost+20% floor. Sellers set prices. No hidden fees."
  - Universal Access: "Credits, Marks, Joules — three currencies, one value..."
  - Earned Participation: "The people doing the work make the decisions..."
- One big CTA button at bottom: "Tour the 16 Initiatives" → launches Wildfire Beacon Run or navigates to `/portal`
- Below: SEC-safe disclosure: "This is not an investment. You're backing real products and services from real people."
- `data-xray-id="welcomegate-more-detail"`

**Tab implementation:**
- Use shadcn/ui Tabs component
- Tab labels: "Concept" | "Get Started" | "More Detail"
- Default active tab: "Concept"
- Preserve existing ENTER button behavior (navigates to /portal)
- Preserve ESC to dismiss for session
- `data-xray-id="welcomegate-tabs"`

**After build:** Add this comment at the top of WelcomeGate.tsx:
```typescript
/**
 * DO NOT TOUCH — WelcomeGate "Flattened Deck" (Session 11)
 * Three-tab system: Concept (flipbook) | Get Started (BLUF triage) | More Detail (HEOHO)
 * Approved by Founder + Rook. Any changes require explicit Founder approval.
 */
```

---

## STEP 2: SAN ANTONIO LANDING PAGE

### New page: `platform/src/pages/SanAntonioLanding.tsx`
### Route: `/sanantonio`

**Hero section:**
```
Headline: "San Antonio, let's help each other eat and earn."
Subheadline: "Join a 12-person Crew, back one neighbor's offer for about $20, and end the month with your own first customer."
```
- Primary CTA button: "Start the Treasure Map" → `/treasure-map`
- Secondary link: "See active Crews in San Antonio"
- `data-xray-id="sa-landing-hero"`

**Three path tiles (cards, not buttons):**

Tile 1 — Let's Make Dinner:
- Icon: 🍽️
- Title: "Let's Make Dinner — Neighbor Dinners"
- Copy: "Pre-order a family-style meal from a home cook in your neighborhood. Each cook joins a 12-person Crew, lists one small dinner ($15–$20), backs one other member's meal, and delivers within 4 weeks."
- CTA: "I want to cook or host dinners" → `/crew/new?focus=dinner`
- Secondary: "I just want to buy dinners →" → `/crew?focus=dinner`

Tile 2 — Let's Get Groceries:
- Icon: 🛒
- Title: "Let's Get Groceries — Errands into Income"
- Copy: "Have a car or a good walking route? Join a grocery Crew that keeps our dinner Crews stocked. Each member takes short routes, shares tips, and backs one other member's offer."
- CTA: "I want to run grocery routes" → `/crew/new?focus=grocery`

Tile 3 — HexIsle & Projects:
- Icon: 🎲
- Title: "Build Something: HexIsle & Projects"
- Copy: "Want to make more than meals? Back and build real products like HexIsle—a tabletop game with transparent costs and a public build journal—and learn how to launch your own listing."
- CTA: "See HexIsle Founding Run" → `/hexisle`

**"How it works in San Antonio" section** — 3 numbered steps:
1. "Take the Treasure Map" — "In about 5 minutes we'll ask about your time, tools, and comfort level, then suggest 1–3 starting plays."
2. "Join or start a Crew" — "Crews are 12 people in San Antonio. Each lists one small offer ($15–$20), backs one other member, and has 4 weeks to complete their first run."
3. "Complete your first run" — "When your Crew finishes, you'll have at least one real customer, a story page you can share, and a clear next step."

**"Why San Antonio first?" section:**
```
Joint Base San Antonio, working-class families on the West Side, and home cooks all over
the city already know how to make a little stretch a long way. Let's Make Dinner and
Let's Get Groceries are designed so that the same $15–$20 you might spend on a single
corporate meal can instead become a neighbor's first sale — and a full dinner for more
than one person.
```

**Trust & compliance panel:**
- "Texas cottage-food compliant; we follow the state's list of allowed foods and labeling rules."
- "This is not an investment. You're backing real products and services from real people."
- "Transparent 20% platform margin funds charitable initiatives and keeps Liana Banyan running."

**Meal comparison table** (use a simple Table component):
| Service | $/meal | Who cooks | Local? |
|---------|--------|-----------|--------|
| FitFoodieSA | $8–12 | Local SATX kitchen | ✅ |
| 210Fit Prep | ~$8–12 | Local SATX kitchen | ✅ |
| ProMeals | $8.99–10.99 | Houston kitchen | ❌ |
| Snap Kitchen | $10–14 | Multi-city brand | ❌ |
| Factor | $13–16 | National brand | ❌ |
| **Let's Make Dinner** | **$4–10/person** | **Your neighbor** | **✅✅** |

`data-xray-id="sa-landing-page"`

Register in App.tsx: `<Route path="/sanantonio" element={<SanAntonioLanding />} />`

---

## STEP 3: CUE CARD SHARING SYSTEM

### New page: `platform/src/pages/CueCardShare.tsx`
### Route: `/cue-cards/:cardType`

Card types: `dinner`, `grocery`, `ambassador`, `hexisle`

**Each card type has front/back content:**

`dinner`:
- Front: "Turn one recipe into rent money." / "San Antonio's neighbor-to-neighbor dinner crews."
- Back: "$15–$20/order, feeds 2–4 • Texas cottage-food law • 12-person Crews • Everyone gets a first customer"

`grocery`:
- Front: "Got a car? Turn errands into income." / "Join a 12-person grocery Crew in San Antonio."
- Back: "Short, local routes • Back one member, they back yours • Works alongside dinner Crews"

`ambassador`:
- Front: "Get Famous. Become a Liana Banyan Ambassador." / "Earn rewards tied to our patent portfolio."
- Back: "Guide 10 new members • Earn Marks by tier • Level up: Torch Bearer → Lamplighter → Beacon Master"

`hexisle`:
- Front: "Build the Game. Own the Story." / "HexIsle: A tabletop game built by its community."
- Back: "Transparent Cost+20% pricing • Pre-order funded • Public build journal • 27-piece hexel system"

**UI:**
- Credit-card-sized preview (aspect ratio 3.375:2.125, the CR80 standard)
- Click to flip (front ↔ back)
- QR code rendered on the back (use a QR library — encode the URL for each card type)
- Buttons below:
  - "Copy link" (copies the card page URL)
  - "Share via text" (opens SMS with pre-filled invite text)
  - "Download for printing" (generates a print-ready PNG at 300 DPI, 3.375" × 2.125")
- `data-xray-id="cue-card-share"`

Register routes in App.tsx.

---

## STEP 4: HEXISLE PAGE ENHANCEMENT

### Modify: `platform/src/pages/HexIsle.tsx` (or wherever HexIsle lives)

Add three new sections below existing content:

**"How It's Made" section:**
- "HexIsle uses a 27-piece mechanical taxonomy called the Hexel Piece Grammar."
- "Each piece — from the ChannelLock base to the Capstone crown — is designed to snap-fit together without glue or fasteners."
- "The Definitive Stack: ChannelLock → HollowLog → Clamshell → GoldenLotus → Rotor → Ouralis → PGears×3 → SawtoothCoral+TimingBelt → MainGear → Cradle+Football → Capstone → SlottedTop"
- Link: "See the full piece grammar →" (to Cephas HexIsle page if exists)

**"Production Journal" section:**
- Transparent build log (can be a simple timeline/list for now)
- Placeholder entries:
  - "2025-11-26: Patent filed — 37 core innovations (Application 63/925,672)"
  - "2026-01-28: HexIsle piece grammar finalized — 27 pieces catalogued"
  - "2026-02-24: LEVIATHAN PLUS filed — 102 additional innovations"
  - "2026-03-13: Founding Run page live"
- `data-xray-id="hexisle-production-journal"`

**"Cost Transparency" section:**
- Show the Cost+20% model visually
- "Every HexIsle set is priced at manufacturing cost plus exactly 20%. The margin funds platform operations and 16 charitable initiatives. No hidden markups."
- Simple breakdown: Materials $X + Labor $X + 20% = Price

**"Notify Me" section:**
- Email capture: "Get notified when HexIsle launches on Kickstarter"
- Stores in Supabase (can use a simple `hexisle_waitlist` table or existing newsletter table)
- `data-xray-id="hexisle-notify"`

---

## STEP 5: REVIEWER PIPELINE UI (If context allows)

Spec exists at: `BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION6_REVIEWER_PIPELINE.md`

Migration 000007 and 000008 were created in Session 10. Wire the UI:

- `ReviewerApplicationPage.tsx` — `/reviewer/apply`
- `ReviewerDashboard.tsx` — `/reviewer/dashboard`
- `ReviewerQueue.tsx` — content queue

If running low on context, skip this step. The migration is in place; UI can be built next session.

---

## STEP 6: FINAL DEPLOY

```bash
cd platform
npx tsc --noEmit          # TypeScript check
npm run build              # Build
firebase deploy --only hosting:main -P default   # Deploy
```

Then commit:
```bash
cd /c/Users/Administrator/Documents/LianaBanyanPlatform
git add platform/
git commit -m "feat: Session 11 — WelcomeGate Flattened Deck, SA landing page, cue cards, HexIsle production"
git push
```

---

## CONTEXT MANAGEMENT

- If you approach context limit during Step 3 or 4, STOP and hand off
- Commit message for partial: "feat: Session 11 partial — [what you completed]"
- Write a brief handoff at `BISHOP_DROPZONE/KNIGHT_HANDOFF_SESSION_11.md` listing what's done and what remains
- Session limit rule: **Proactively warn Founder at ~80% context**

---

## DATA-XRAY-IDS (For Bishop's verification)

| Component | data-xray-id |
|-----------|--------------|
| WelcomeGate tabs | welcomegate-tabs |
| Tab A flipbook | welcomegate-concept |
| Tab B triage | welcomegate-get-started |
| Tab C detail | welcomegate-more-detail |
| SA landing hero | sa-landing-hero |
| SA landing page | sa-landing-page |
| SA meal comparison | sa-meal-comparison |
| Cue card share | cue-card-share |
| HexIsle production journal | hexisle-production-journal |
| HexIsle notify | hexisle-notify |
| Reviewer application | reviewer-application |
| Reviewer dashboard | reviewer-dashboard |

---

*FOR THE KEEP.*
