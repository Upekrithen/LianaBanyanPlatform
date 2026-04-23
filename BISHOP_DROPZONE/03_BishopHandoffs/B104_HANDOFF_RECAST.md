# B104 ReCast Handoff

**Session**: B104 (continuation of B103)  
**Date**: 2026-04-13, ~4:30 PM  
**Founder status**: Departing for Seattle Tuesday Apr 14 at 0400, returning Thursday Apr 16 afternoon  
**Context**: Pre-launch sprint. Three major tasks: (1) page-by-page visual review, (2) content editing, (3) staging for Founder's absence  

---

## WHAT WAS ACCOMPLISHED THIS SESSION

### B103 (before compaction):
- HEOHOCardFront.tsx restructured: LIANA BANYAN logo to top, added "Self-Funding 16 Initiatives" line, added "Find Out More" button with SweetSixteenReveal component
- K424 Knight Prompt written and executed — all 7 tasks complete, TS clean, build succeeds:
  - PortalArchway.tsx completely rewritten (image-based archway with PORTAL_REGISTRY)
  - XRayContext.tsx updated with CharacterLocation type
  - LRHGuide.tsx away state when character teleported
  - Door1Tour.tsx: Stop 5 X-Ray Goggles added
  - MuseumShell.tsx: filters annotations during tour mode
  - discoveryFlow.ts: new file with data structures
  - DeckCardFrame.tsx: frameImage prop added
  - Museum → Threshold rename across 9 files
- Unicode escapes fixed in Door1Tour.tsx (emoji rendering)
- Two Etsy art purchases (~$66): Occult Tarot frames, Arcane Gems, Flower Tarot, Hex Tokens, steampunk borders
- Third Etsy purchase from AvalonPages (order #4027898912): Celtic Book, Celtic Azure Sea Pages, Soft Castlecore Pages, plus others

### B104 (this session, post-compaction):
- Started build warning fixes — partial edit to PortalDeckCard.tsx (duration-[400ms] class changed but needs style completion)
- Librarian updated with B104 session

---

## IN-PROGRESS WORK (pick up here)

### Build Warning Fixes (Founder explicitly asked):
1. **Tailwind ambiguous classes**: 
   - `duration-[400ms]` in `platform/src/components/PortalDeckCard.tsx` line 63 — PARTIAL FIX: className changed to remove duration class, but `transitionDuration: '400ms'` needs adding to the style object on line 65
   - `duration-[600ms]` in `platform/src/components/FlipSection.tsx` line 19 — NOT YET FIXED, same approach: remove from className, add to style object
2. **Rollup annotation warnings**: Add `onwarn` handler to vite.config.ts rollupOptions to filter `INVALID_ANNOTATION` warnings
3. **Chunk size >500kB**: Add `build.chunkSizeWarningLimit: 1000` to vite.config.ts (or further split manualChunks)
4. **Browserslist stale**: Run `npx update-browserslist-db@latest` in platform/

### Etsy Downloads Inventory:
Files in `C:\Users\Administrator\Downloads\`:
- TarotoccultI.pdf
- ThankYou.pdf, ThankYou (1).pdf, ThankYou (2).pdf, ThankYou (3).pdf
- Digit4.1.pdf
- steampborders_veriepear1-8.zip, steampborders_veriepear9-14.zip, steampborders_veriepear15-20.zip
- TarotFlowers.pdf
- HexTokens.pdf
- TarotGemtags.pdf

Need to: open each PDF/zip, verify contents match what was purchased, organize into platform asset pipeline (platform/public/assets/frames/ or similar), crop Etsy confirmation for independent seller policy support.

### Etsy confirmation screenshot:
Founder wants Etsy "Order confirmed. Thanks for supporting independent sellers!" screenshot cropped for use in Liana Banyan policy documentation.

---

## PENDING TASKS (priority order)

1. **Finish build warning fixes** (in progress above)
2. **Inventory + organize Etsy art downloads** 
3. **Crop Etsy confirmation screenshot**
4. **Fix WildFire Tour "Not Both" issue** — Tour button AND tour pill shouldn't both show
5. **Continue page-by-page visual review** — only HEOHOCardFront done so far
6. **Tour white screen fix on mobile** (from B102)
7. **Wave 2 pre-staging** for autonomous firing while Founder in Seattle
8. **Content review**: 266 files in 00_FOUNDER_REVIEW/
9. **Preface+Burst dispatch queue** is EMPTY — needs loading

---

## STANDING DIRECTIVES

- **ALWAYS build for the LONG HAUL** — no bandaids, no workarounds, the right way every time
- **Always provide analysis and recommendations**
- **Write to Librarian/Romulator BEFORE context fills** — do NOT let auto-compaction happen
- **Handoff file for "ReCast" command** — this file
- **Build command**: `cd C:\Users\Administrator\documents\lianabanyanplatform\platform; npm run build` then `firebase deploy --only hosting:main -P default`
- **Command syntax**: Use `;` not `&&`. Or use full path.

---

## KEY FILES

| File | Status | Notes |
|------|--------|-------|
| platform/src/components/museum/HEOHOCardFront.tsx | Modified B103 | SweetSixteenReveal, new layout |
| platform/src/components/museum/PortalArchway.tsx | Rewritten K424 | Image-based archway, PORTAL_REGISTRY |
| platform/src/components/museum/XRayContext.tsx | Modified K424 | CharacterLocation type |
| platform/src/components/museum/LRHGuide.tsx | Modified K424 | Away state |
| platform/src/pages/museum/Door1Tour.tsx | Modified K424+B103 | X-Ray tour stop, Unicode fixes |
| platform/src/components/cards/DeckCardFrame.tsx | Modified K424 | frameImage prop, PORTAL_FRAME_MAP |
| platform/src/lib/discoveryFlow.ts | New K424 | Discovery flow data structures |
| platform/src/components/PortalDeckCard.tsx | PARTIAL EDIT B104 | duration class removed, needs style fix |
| platform/src/components/FlipSection.tsx | NEEDS FIX | duration-[600ms] ambiguous |
| platform/vite.config.ts | NEEDS UPDATE | Rollup warnings, chunk size |

---

## ART ASSETS STATUS

**Purchased (need organizing)**:
- Occult Tarot Card Frames (29 images, 1536x2304px, transparent BG)
- Arcane Gems tags
- Flower Tarot frames
- Hex Tokens
- Steampunk borders (20 images in 3 zips)
- AvalonPages: Celtic Book, Celtic Azure Sea, Soft Castlecore, others

**Needed from Ausbin**:
- Threshold archway (normal + X-Ray)
- Wharf archway (normal + X-Ray)
- Hexagon archway (normal + X-Ray)
- Bay archway (normal + X-Ray)
- Tower of Peace archway (normal + X-Ray)
- Salt Mines archway EXISTS (saltMine.png, two versions)

---

## SESSION END
Librarian updated: B104. Next Bishop session: B105.
