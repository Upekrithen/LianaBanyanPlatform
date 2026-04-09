# Knight Session 26 — Bishop 010 Handoff
## March 16, 2026

---

## CONTEXT

Bishop Session 010 was a marathon. Keyhole O on the landing page was finalized, four slideshow flipbooks were wired to the hero section, the Six Degrees Universal Connection Engine was designed and documented, four Political Expedition crown letters were drafted, the Chalk Outline Onboarding component was built, and multiple letter updates were made. Everything below is either partially built (component exists, needs wiring) or fully designed (doc exists, needs implementation).

**All deploys are live.** Firebase re-authed, firebase-tools updated to 15.10.0, all 7 hosting targets deployed successfully.

---

## TASK 1: Chalk Outline Onboarding — Wire to Routes + Supabase

### What Exists
- `platform/src/components/ChalkOutlineOnboarding.tsx` — Full component with:
  - White dashed chalk borders on empty fields (translucent)
  - Fields solidify with section-specific colors when filled (opaque)
  - Lock/Unlock toggle on each completed section (gold lock icon)
  - Save state to localStorage (resume later)
  - Progress bar with completion percentage
  - "Launch" button with "Are you sure?" confirmation dialog
  - Preview toggle (see finished page vs edit mode)
  - Two preset field templates exported: `PRODUCT_PROJECT_FIELDS` and `CREATOR_INVITE_FIELDS`

### What Needs Building
1. **Route**: `/create?invite=CREATOR_ID` — opens Chalk Outline overlay
2. **Supabase persistence**: Save field state to `project_drafts` table (not just localStorage)
3. **Invite link system**: Each of the 47 Instagram creators + Lawrence Kariuki Gichure gets a unique invite URL
4. **Pre-fill from invite data**: When `?invite=fusefoxdesign` is in URL, pre-fill creator name and Instagram handle
5. **Launch action**: On "Launch" confirmation, create entry in `products` table, set status to `live`
6. **Creator invite table**: `creator_invites` with columns: `id`, `creator_handle`, `invite_code`, `status` (pending/accepted/launched), `created_at`, `project_id` (nullable, linked on launch)

### Instagram Creators to Generate Invites For
Full list in `BISHOP_DROPZONE/INSTAGRAM_FACTORY_CREATORS_COMPLETE.md` — 47 unique creators. Key first targets:
- @fusefoxdesign (Tactocrat — HexIsle game pieces)
- @greg.dean.mann (lamps)
- @moritz__walter (tools)
- @elega.yyc (clips)
- @emgi3d (mechanisms)

### External Creator
- **Lawrence Kariuki Gichure** — CSA mechanical transplanting tool for smallholder vegetable farmers. Kenya-based. LinkedIn contact. Simple hand-operated seedling planter with spring-jaw mechanism. Category: Tools & Hardware / Agriculture.

---

## TASK 2: Mirror Mirror Accessibility Panel

### What Exists
- Mirror Mirror dialog text updated (live)
- Keyhole O with screen reader aria-label (live)
- CSS classes already in index.css for dyslexia font (`lb-dyslexia-font`)

### What Needs Building
**Named and numbered accessibility presets** — one-click profiles accessible from Mirror Mirror dialog:

| # | Name | What It Does |
|---|------|-------------|
| 1 | Standard | Default styling |
| 2 | Large Text | 125% font scaling, increased line height |
| 3 | Extra Large | 150% font scaling, extra spacing |
| 4 | High Contrast | White on pure black, no gradients |
| 5 | Dyslexia-Friendly | OpenDyslexic font (CDN loaded), increased letter/word spacing |
| 6 | Reduced Motion | Disables all animations |
| 7 | Dark Reader | Inverted colors for light sensitivity |
| 8 | Focus Mode | Dims everything except focused element |

**Implementation:**
- Store in localStorage (`lb-accessibility-preset`)
- Apply via CSS classes on `<html>` element (pattern: `lb-dyslexia-font`)
- Add preset selector to Mirror Mirror dialog (Durin's Door popup in Index.tsx ~line 1964)
- Presets stack where sensible (Large Text + Dyslexia-Friendly)
- Follow the Picasso theme system pattern in `platform/src/styles/`

---

## TASK 3: Public Profile Preview ("See yourself as others see you")

- Add tab to profile page: "My Profile" | "Mirror Mirror View"
- Mirror Mirror View renders profile with `isOwner: false`
- Shows: display name, XP, badges, public projects, reputation
- Hides: settings, private data, edit buttons, analytics
- Mirror frame CSS effect

---

## TASK 4: Cooperative Fairness Dashboard

- Sankey/alluvial flow: Purchase → 83.3% Creator / 13.3% Platform / 3.3% Gleaner's Corner
- Platform split across 16 initiatives
- Accessible from Mirror Mirror dialog AND `/fairness` route
- Can use mock data until real transactions exist

---

## TASK 5: Six Degrees Voting — Crown Letter Pedestals

### Reference Doc
`BISHOP_DROPZONE/SIX_DEGREES_UNIVERSAL_SYSTEM.md` — full design

### Build
- Crown letters on votable pedestals at `/press-junket` or `/red-carpet`
- SWOOP voting: "Vote to get this person's attention" (1 Credit = 1 vote)
- Threshold activation → bounty goes live (max 5 hunters)
- Fractional degree milestones (1-6 degrees)
- Time decay: full days 1-7, decreasing to 60% by day 30, 7-day cooldown
- Display all crown letters including 4 new Quad-Crown Political Expedition letters in `BISHOP_DROPZONE/`

---

## TASK 6: X-Ray Goggles — Deep Interconnection Mode

### Enhancement
Every glossary entry should show full system chain:
- "This [component] does [THIS] so that [THAT] because [WHY]"
- "Based on [FOUNDER ANECDOTE or LETTER or PAPER]"
- "Connected FROM [X] and TO [Z]"

Add `connectedSystems` array to entries showing which systems apply: BandWagon, SWOOP, Steward, STAMP, Bounty XP, Cue Cards, First-100, Six Degrees.

### New Glossary Entries
- `six-degrees-outreach`, `six-degrees-medical`, `six-degrees-opportunity`
- `chalk-outline`, `double-dipping`, `accessibility-presets`

---

## TASK 7: Lemonade Stand Images (Blocked on Son's Drawings)

When images arrive:
- Drop as `scene1.png`-`scene8.png` into `/public/lemonade/`
- In `LemonadeStandFlipbook.tsx`: uncomment `<img>` tags, remove emoji placeholders
- Rebuild and deploy

---

## FILES CREATED THIS SESSION

### New Components
| File | Purpose |
|------|---------|
| `src/components/LemonadeStandFlipbook.tsx` | 8-scene flipbook + "Where To Go From Here" end screen |
| `src/components/OriginStoryFlipbook.tsx` | 12-scene stick figure origin story (images exist at `/public/origin-story/`) |
| `src/components/ChalkOutlineOnboarding.tsx` | Chalk outline project creation overlay with Lock/Unlock |

### New Assets
| File | Purpose |
|------|---------|
| `public/origin-story/concept_01-12.jpg` | 12 origin story images (Founder's son's drawings) |

### New Documents
| File | Purpose |
|------|---------|
| `BISHOP_DROPZONE/SIX_DEGREES_UNIVERSAL_SYSTEM.md` | Full Six Degrees system design (crown jewel) |
| `BISHOP_DROPZONE/CROWN_LETTER_AOC_POLITICAL_EXPEDITION.md` | Door-Opening Crown (Left) |
| `BISHOP_DROPZONE/CROWN_LETTER_SCHWARZENEGGER_POLITICAL_EXPEDITION.md` | Door-Opening Crown (Right) |
| `BISHOP_DROPZONE/CROWN_LETTER_KEANU_REEVES_POLITICAL_EXPEDITION.md` | Builder Crown (Culture) |
| `BISHOP_DROPZONE/CROWN_LETTER_SANDRA_BULLOCK_POLITICAL_EXPEDITION.md` | Builder Crown (Action) |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Keyhole O positioning, slideshow selector (4 pills: Origin Story, Fable, Lemonade Stand, Founder's Office), activeSlideshow state, 3 flipbook imports |
| `src/data/xrayGlossary.ts` | Mirror Mirror dialog text |
| `01 MarkupFiles/LETTER-TATIANA-SCHLOSSBERG-002.md` | Six Medical Degrees section + Founder vision anecdote |
| `Asteroid-ProofVault/.../LETTER-TAYLOR-SWIFT-V03.md` | "Why Out of the Woods" section → Health Accords connection |

---

## INNOVATION BAG (20 items — Session 010)

1. No Demographics as structural anti-discrimination
2. Accessibility Presets (named/numbered one-click profiles)
3. Quad-Crown bipartisan proof architecture
4. Mirror Mirror "fairest" triple-meaning
5. **Six Degrees Universal Connection Engine** ← CROWN JEWEL
6. Fractional Degree Bounty System (1-6 degrees)
7. Time-Decay Bounty Valuation
8. Six Degrees of Opportunity (job/business matching)
9. Six Medical Degrees of Separation
10. Double-Dipping and Stacking + Ice Cream Cone cue card
11. Milestone-based bounty progression
12. SAA-as-backer-return model (SEC-clean)
13. Connection XP
14. Campaign cooldown rate limiting
15. Crowdfunded social capital bounties
16. Treasure Map diagnostic trails
17. Chalk Outline Onboarding UX pattern
18. Lock/Unlock field editing
19. CSA Agricultural Tool Manufacturing
20. Crown Letter Votable Pedestals

---

## DEPLOY INFO
- Firebase tools: v15.10.0
- Auth: Founder@lianabanyan.com
- Build: `node node_modules\vite\bin\vite.js build`
- Deploy: `npx firebase deploy --only hosting`
- All 7 targets: lianabanyan-main, lianabanyan-403dc, lianabanyan-biz-trunk, lianabanyan-org-trunk, lianabanyan-net-trunk, the2ndsecond-trunk, hexisle

## PRIORITY ORDER

1. **Chalk Outline Onboarding** (Task 1) — enables creator onboarding for launch
2. **Accessibility Panel** (Task 2) — proves "fairest" claim
3. **X-Ray deep mode** (Task 6) — press/academic differentiator
4. **Six Degrees Voting** (Task 5) — crowdfunded outreach
5. **Profile Preview** (Task 3) — nice to have
6. **Fairness Dashboard** (Task 4) — needs real transactions
7. **Lemonade images** (Task 7) — blocked on drawings

---

**FOR THE KEEP**
*BISHOP Session 010 → Knight Session 26*
*March 16, 2026*
*Status: ALL DEPLOYED — 7 targets live*
