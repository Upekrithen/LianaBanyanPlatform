# B105 HANDOFF — ReCast File
**Session:** B105 (continuation of B104 after context recovery)
**Date:** Monday April 13, 2026
**Founder Status:** Departing for Seattle Tuesday Apr 14 at 0400, returning Thursday Apr 16 afternoon

---

## STANDING DIRECTIVES (ALWAYS IN EFFECT)

1. **Build for the LONG HAUL** — no bandaids, no workarounds, the right way every time
2. **Always provide analysis and recommendations** — don't just execute, think
3. **Write to Librarian/Romulator before context fills** — never compact without saving state
4. **Handoff file for "ReCast" command** — this file opens automatically when Founder types ReCast
5. **Use `;` not `&&`** on Founder's Windows system for chained commands
6. **Chess piece system:** Bishop (Claude Cowork), Knight (Cursor), Pawn — coordinate via Knight-Bishop Bridge MCP

---

## WHAT WAS ACCOMPLISHED (B104 + B105)

### Front Page Visual Fixes (5 of 5 code changes complete, NOT YET DEPLOYED)

1. **THE THRESHOLD header removed** — `PortalArchway.tsx` line 169: wrapped title in `{portal !== "threshold" && (...)}` so it no longer collides with quotes
2. **WildFire Tour pill removed** — `HomeScreen.tsx`: removed TourBanner import and render entirely (B104 "Not Both" fix)
3. **Hex background brightened around card** — `MuseumShell.tsx` line 42: opacity `0.02 -> 0.07` so hexagonal pattern visible around the card
4. **Card vertical spacing tightened** — `HEOHOCardFront.tsx` line 313: `pt-4 pb-4 gap-3 justify-evenly` -> `pt-2 pb-2 gap-2 justify-center`
5. **Tree logo LEFT AS RAINBOW** — Founder clarified: "white and green" meant text colors (Liana=white, Banyan=green), NOT the tree. Tree stays multicolor. Logo filter was applied then reverted.

### Files Changed (all saved, awaiting build+deploy)
- `platform/src/components/museum/PortalArchway.tsx`
- `platform/src/pages/museum/HomeScreen.tsx`
- `platform/src/components/museum/MuseumShell.tsx`
- `platform/src/components/museum/HEOHOCardFront.tsx`

### Other Work
- Art assets inventoried and organized (B104): 230+ files in `ArtAssets/` with deduplication
- PortalDeckCard.tsx and FlipSection.tsx Tailwind duration warnings fixed (B104)
- vite.config.ts annotation warnings suppressed and chunk limit bumped (B104)
- PortalArchway.tsx truncation fixed — was cut off at line 222 mid-tag, completed full JSX (B104)
- PLACE CARD overlay hidden when empty + no handler (B104)

---

## IMMEDIATE NEXT STEPS (Priority Order)

### 1. Preview and Deploy Front Page Fixes
```
cd C:\Users\Administrator\documents\lianabanyanplatform\platform; npm run dev
```
- Check localhost:8080 — verify all 5 fixes look right
- If adjustments needed (especially card spacing), tweak and reload
- When approved:
```
cd C:\Users\Administrator\documents\lianabanyanplatform\platform; npm run build; firebase deploy --only hosting:main -P default
```

### 2. Send Trebor Scholz Letter TONIGHT (Monday night)
- File: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/CROWN_LETTER_TREBOR_SCHOLZ_SEC_FIXED_V14.md`
- Also: `LETTER-TREBOR-SCHOLZ-V13.md` (earlier version — Founder to pick which)
- Founder's decision: Only Scholz goes tonight. All others wait for Thursday morning (optimal send time)

### 3. Flight Reading — Papers Exported to Word
All Wave 1 and Wave 2 papers converted to .docx in the Documents folder:
- **`Documents/FlightReading_Wave1/`** — 33 .docx files (Crown letters, business letters, BST episodes)
- **`Documents/FlightReading_Wave2/`** — 18 .docx files (academic/thought leader letters, pudding articles)

**For offline access on the plane:** Copy both FlightReading folders to laptop before departing. Edit in Word offline. When back online, edits sync or can be manually applied.

**Alternative:** Enable Google Docs offline mode in Chrome Settings > Google Drive > Settings > Offline before departing. Everything syncs when you land.

### 4. Thursday Morning Dispatch (Apr 16)
- Remaining Wave 1 letters go out Thursday morning (9-10am ET is optimal)
- Wave 2 is pre-staged for Apr 14-15 but may shift to Thursday given Seattle trip
- Founder to review and approve on plane, then Bishop/Knight fire on Thursday

---

## PENDING WORK (Full Backlog)

### Site Visual Review (Task 1 — page by page)
- Only front page reviewed so far
- Remaining pages: /enter, /watch, /tour, /mirror, /yvaine, /why-no-ads, /why-no-vc, /helm, all portal pages
- Process: Founder screenshots each page, states what's wrong, Bishop fixes or writes Knight Prompt

### Content Review (Task 2 — edit/rewrite)
- 266 files in `00_FOUNDER_REVIEW/` across 5 waves
- Wave 1 (33 files) and Wave 2 (18 files) are priority
- Preface+Burst dispatch queue is EMPTY — needs seeding
- Founder reviewing on plane via Word exports

### Pre-staging for Autonomous Firing (Task 3)
- Wave 2 needs to be set for autonomous dispatch while Founder is in Seattle
- Helm dispatcher cron (`k411_helm_dispatcher_cron.sql`) runs every minute
- Platform configs in `dispatch_platform_config` table
- Need to verify edge functions are deployed and cron is active

### Build/Deploy Issues
- Chunk size: 4.1MB main bundle (needs route-based splitting — Knight task)
- Browserslist warning: cosmetic only, `npx browserslist@latest --update-db` or `npm install caniuse-lite@latest --save-dev --force`
- Static/dynamic import conflicts: some Radix components have both

### Art Assets
- Sort 196 anjoshan PNGs into per-product subfolders
- Move 4 large AvalonPages zips (5+ GB) from Downloads to `ArtAssets/pages/` — must be done in Windows Explorer, too large for mount
- Portal archway art needed from Ausbin for: Threshold, Wharf, Hexagon, Bay, Tower of Peace
- Empty folders waiting: anjoshan-tarot-occult, anjoshan-tarot-flowers, anjoshan-hex-tokens, anjoshan-arcane-gems

### Known Bugs
- Tour white screen on mobile (from B102)
- TourModeOverlay (separate from TourBanner) may still show — only shows when `isTourMode` from WildfireRunContext is true

---

## KEY ARCHITECTURE REFERENCE

### Portal System
6 portals defined in `PortalArchway.tsx` PORTAL_REGISTRY:
- **The Threshold** — front door (gold theme, `#d69e2e`)
- **The Salt Mines** — employment (gray, `#9ca3af`)
- **The Wharf** — commerce (blue, `#3b82f6`)
- **The Hexagon** — islands (teal, `#14b8a6`)
- **The Bay** — time & content (amber, `#d97706`)
- **The Tower of Peace** — peace & governance (green, `#22c55e`)

### HEOHO Card (HEOHOCardFront.tsx)
- Quote carousel (22 quotes, 8s rotation, Yvaine SHINE sequence)
- Card: 5:7 aspect ratio, dark navy background with hex pattern
- Top: LIANA [rainbow tree] BANYAN (white/green text)
- Middle: "NO ADS / COOPERATIVE COMMERCE / NO V.C." then "Help Each Other Help Ourselves" with keyhole easter egg
- Bottom: "Self-Funding 16 Initiatives" + Find Out More button + SweetSixteenReveal
- Below card: Enter/Watch buttons + WildFire Tour link
- Speak Friend input: type "friend" in any language -> navigates to /mirror

### Tech Stack
- React/TypeScript SPA with Vite (port 8080)
- Firebase Hosting (main site)
- Supabase (database, edge functions, auth)
- Tailwind CSS + Framer Motion
- ~12,924 modules in build

### Build Command
```
cd C:\Users\Administrator\documents\lianabanyanplatform\platform; npm run build; firebase deploy --only hosting:main -P default
```

### Key Directories
```
platform/src/components/museum/  — MuseumShell, HEOHOCardFront, PortalArchway, XRay system, LRH
platform/src/pages/museum/       — HomeScreen, portal pages
platform/src/components/wildfire/ — TourBanner, TourModeOverlay, ArchipelagoTourContext
BISHOP_DROPZONE/00_FOUNDER_REVIEW/ — All wave content (5 waves)
BISHOP_DROPZONE/03_BishopHandoffs/ — This file and previous handoffs
ArtAssets/                        — Etsy purchases organized by type
```

---

## LIBRARIAN SESSION LOG
Session B105 recorded with 4 files changed, 11 pending items. Use `mcp__librarian__get_session_context` or `mcp__librarian__brief_me` on next session start.
