# Knight Session K424 — Portal Archway Rewrite + X-Ray Tour Integration + Discovery Flow

**Dispatched by**: Bishop B103  
**Priority**: CRITICAL — Pre-launch architecture correction  
**Supersedes**: K422 (Portal Archway concept was fundamentally wrong)  
**Innovations touched**: Portal System, Deck Card System, X-Ray Tour, LRH Guide, Discovery Flow, Cold Start  

---

## WHAT K422 GOT WRONG

K422 built PortalArchway.tsx as a **CSS viewport frame** — thin SVG lines, decorative dots, side rails with NichoSlots bolted to the browser chrome. This is NOT what the portal system is.

**The portal archway is an ILLUSTRATED DOORWAY.** It's a piece of art — a physical gateway you walk through. Each portal has unique hand-drawn archway art (drawn by Ausbin). The HEOHO card / front door sits in front of the archway. You discover Deck Cards through exploration, then PLACE them in the matching archway slot to open/unlock that portal area.

**Delete the current PortalArchway.tsx entirely.** What follows is the correct architecture.

---

## THE PORTAL SYSTEM — CORRECT DESIGN

### What a Portal Archway IS:
- A full-screen illustrated stone/material doorway (PNG art with transparent background)
- Each portal has its own unique archway art drawn by Ausbin (Salt Mines = stone Stonehenge-style entrance, others TBD)
- TWO versions of each archway: **normal** and **X-Ray** (different art, same structure)
- A **Deck Card slot** in the mouth/opening of the archway — this is where you place the portal's key card
- The archway is a PLACE in the world, not browser UI decoration

### What a Portal Archway is NOT:
- NOT a CSS viewport frame or border
- NOT SVG decorative chrome around the browser window
- NOT decorative furniture with NichoSlots bolted to side rails
- NOT a thin overlay on top of content

### Portal Names and Themes:

| Portal | Name | Archway Material | Art Status |
|--------|------|-----------------|------------|
| Front Door | **The Threshold** (shows "LIANA BANYAN" + tree logo, replaced by portal titles as you go deeper) | TBD by Ausbin | Pending |
| Employment | **The Salt Mines** | Rough-hewn stone, Stonehenge-style | Art EXISTS (saltMine.png, two versions) |
| Commerce | **The Wharf** | TBD by Ausbin | Pending |
| Islands | **The Hexagon** | TBD by Ausbin | Pending |
| Time/Content | **The Bay** | TBD by Ausbin | Pending |
| Peace/Governance | **The Tower of Peace** | TBD by Ausbin | Pending |

### Deck Card Frames (SEPARATE from archways):
- Purchased asset: Occult Tarot Card Frames collection (29 images, 1536x2304px, transparent BG)
- These are the ornate borders that wrap AROUND individual Deck Cards
- Each portal's cards use a signature frame style so you can tell at a glance which portal a card belongs to
- DeckCardFrame.tsx should be updated to render these PNG frames as image borders, NOT SVG-drawn borders
- Rarity still affects glow/shimmer, but the frame art itself comes from the purchased asset

---

## TASK 1: Rewrite PortalArchway.tsx

**File**: `platform/src/components/museum/PortalArchway.tsx` — DELETE and rewrite

**New architecture**:
```tsx
interface PortalArchwayProps {
  portal: PortalId;
  children: ReactNode;
  archwayArt: string;        // URL to normal archway PNG
  archwayArtXray: string;    // URL to X-Ray version PNG
  deckCardSlot: {
    state: 'empty' | 'filled' | 'locked';
    card?: DeckCardData;      // The card placed in this archway (if filled)
  };
}
```

**Rendering**:
- Full-viewport illustrated archway as background image (the PNG art)
- Deck Card slot positioned in the mouth/opening of the archway
- Empty slot: subtle outlined card shape, glows on hover, invites placement
- Filled slot: shows the placed Deck Card with its frame, portal "opens" (content visible through archway)
- Locked slot: padlock icon, card shape visible but darkened
- Swap archway art between normal and X-Ray based on `useXRay()` context
- Desktop only — mobile shows content directly without archway framing
- Children (page content) render THROUGH the archway opening when portal is unlocked/opened

**DO NOT** render NichoSlots on the archway side rails. NichoSlots are environmental — they appear IN the world (cliff faces, keep walls, treasure map locations), not on architectural chrome.

---

## TASK 2: LRH Tour Integration — X-Ray Walkthrough Stop

**Files**: `platform/src/pages/museum/Door1Tour.tsx`, `platform/src/components/museum/LRHGuide.tsx`, `platform/src/components/museum/XRayPanel.tsx`

### The Problem:
Currently, X-Ray panels (Xpanels) all appear simultaneously when X-Ray mode is on, and LRH appears in two places at once (her FAB position AND inside the Xpanel). The tour does not include an X-Ray introduction.

### The Fix:

**Add a new tour stop** (between current Stop 4 and Stop 5) — the X-Ray Walkthrough:

1. LRH (colorized/hover version, NOT thermal yet) announces: "Now we're going into X-Ray Goggles Mode"
2. X-Ray mode activates — LRH transitions to thermal version
3. **First Xpanel appears SOLO** (e.g., "The Deck Card") — LRH teleports INTO this panel, explains it
4. User clicks Next → LRH jumps to second Xpanel ("Cephas Library"), explains it
5. Next → "Frame Locks"
6. Next → "Your Guide" (meta moment — LRH explains herself)
7. LRH explains: "These panels appear on every page. You can move them, minimize them, or expand them. They're always here when you need context."
8. X-Ray mode deactivates, tour continues to Stop 5 (Your Turn)

### LRH Dual-Presence Bug Fix:
- When LRH is inside an Xpanel, she MUST disappear from her FAB position (bottom-right)
- She teleports — she's in ONE place at a time, always
- Her FAB shows an empty perch / "away" state when she's in a panel

### Explainer Character States (applies to LRH and ALL future guide characters):

| State | Visual | When |
|-------|--------|------|
| **Default** | Single color, static silhouette | Idle, no interaction |
| **Active/Explaining** | Colorized "hover" version — full color, animated | During explanations, tour stops, when clicked. This is the version used for ALL teaching moments |
| **X-Ray Thermal** | Thermal vision version | When X-Ray mode is ON. Shows MORE things, explains all Xpanels in their area of expertise |

**IMPORTANT**: Explainer characters ALWAYS use the colorized version when explaining, not the default single-color version. The plain version is ONLY for idle/dormant state.

---

## TASK 3: Discovery → Placement Flow (Foundation)

This is the mechanical foundation for the treasure map / card discovery system. Full game loop implementation comes later, but the DATA STRUCTURES and FLOW need to be correct now.

### The Flow:
1. User completes 90-second tour, chooses one of 3 pathways (browse/build/join)
2. Following a pathway earns **dashmark paths** on the big map to the next waypoint(s)
3. Three initial paths exist from the start
4. One path leads through the **Larks & Bounty system** explanation
5. During that explanation, user DISCOVERS the **Salt Mines Deck Card** — their first found card
6. User can then PLACE that card in the Salt Mines archway slot — first "found-then-placed" experience
7. This teaches the core mechanic: find cards → place them → open areas

### NichoSlot Placement Rules:
- NichoSlots appear IN THE WORLD — against cliff faces, on keep walls, in treasure map locations
- They are environmental discovery cues: "something goes here"
- An empty NichoSlot next to a filled one (like a blank wall next to a tapestry in a Keep) is a spatial hint
- NichoSlots do NOT appear as browser UI chrome or decorative frame borders
- The Wile E. Coyote mental model: card-shaped slot on a cliff face = "place a card here to open the tunnel"

### Cold Start Deck Card:
- Create a Deck Card definition for "Cold Start"
- Content: explains the Jeep of Theseus concept, what Cold Start means at Liana Banyan, and how a new member can be earning money within 7 days of effort
- This card is connected to the Cold Start Pathways which link to Salt Mines contracts
- Frame style: assign from the purchased Etsy frame collection (portal-appropriate)

---

## TASK 4: Rename "The Museum" → "The Threshold"

**Scope**: All references to "museum" as a user-facing LABEL need updating. The route/folder structure can stay as `museum/` internally for now — this is a display-name change.

**Changes**:
- PortalArchway themes: `museum.label` → "THE THRESHOLD" (or "LIANA BANYAN" with tree logo)
- Any user-visible text that says "The Museum" → "The Threshold"
- The front door archway shows "LIANA BANYAN" with the tree logo in the title position
- As users navigate to a specific portal, the archway title transitions to that portal's name
- Internal code references (`/museum`, `MuseumShell`, etc.) stay as-is — cosmetic rename only

**NOTE**: The Firebase hosting target `museum` also stays as-is. This is purely the user-facing display name.

---

## TASK 5: Update DeckCardFrame.tsx for Image-Based Frames

**File**: `platform/src/components/cards/DeckCardFrame.tsx`

Current state: SVG-drawn frame borders with 8 style variants.

**Update to support image-based frames**:
- Add a `frameImage` prop (URL to PNG frame asset from the purchased Etsy collection)
- When `frameImage` is provided, render the PNG frame as an absolutely-positioned border image around the card content
- The PNG frames have transparent backgrounds — they layer over the card content
- Fall back to SVG-drawn frames when no image is provided (backwards compatibility)
- Each portal's cards get a signature frame from the collection
- Rarity still affects glow, shimmer, particle effects — but the frame ART comes from the image

### Frame-to-Portal Mapping (initial assignment, Founder to refine):
- Assign each portal a primary frame style from the 29-image collection
- This mapping should be configurable (not hardcoded) — store in a config object
- The Founder will make final frame assignments after reviewing the purchased assets

---

## RUN ORDER

1. **PortalArchway.tsx rewrite** — delete SVG chrome, build image-based archway with card slot
2. **LRH dual-presence fix** — she's in one place at a time, always
3. **X-Ray tour stop** — add walkthrough stop to Door1Tour.tsx
4. **Rename Museum → Threshold** — display name only
5. **DeckCardFrame image support** — add PNG frame rendering
6. **Discovery flow data structures** — card definitions, placement state, dashmark paths
7. **Cold Start Deck Card** — create the card definition and content

## ART ASSETS NEEDED (from Ausbin):
- Threshold archway (normal + X-Ray versions)
- The Wharf archway (normal + X-Ray)
- The Hexagon archway (normal + X-Ray)
- The Bay archway (normal + X-Ray)
- The Tower of Peace archway (normal + X-Ray)
- Salt Mines archway already EXISTS (saltMine.png, two versions)

## ART ASSETS AVAILABLE:
- Salt Mines archway PNGs (in codebase)
- Etsy Occult Tarot Card Frames (29 images, 1536x2304px, transparent BG) — for DeckCardFrame borders
- Need to be purchased and added to `platform/public/assets/frames/` or similar

---

## SESSION END
Run `scrambler_session_closeout` for K424.
