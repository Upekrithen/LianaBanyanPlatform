# Knight Session K422 — Portal Archway System + Ornate Deck Card Frames

**Dispatched by**: Bishop B102
**Priority**: HIGH — Launch visual identity
**Innovations touched**: Deck Card System, Portal Surfaces, Crow's Nest, Binder

---

## THE VISION

Every portal surface gets a desktop-only ornate archway frame that tells visitors WHERE they are. The archway has **nicho slots** (like Mexican tin retablo shrine frames) where Deck Cards lock in. The cards themselves have ornate collectible frames at tarot-card quality.

This is NOT just decoration. It's a collectible artifact ecosystem:
- **Binder** = your complete card collection
- **Decks** = curated subsets for specific purposes
- **Hand** = cards currently in your archway nicho slots

---

## TASK 1: Replace OrnateCornerArt on HEOHO Card

**File**: `platform/src/components/museum/HEOHOCardFront.tsx` → `OrnateCornerArt` function (~line 520)

Current state: barely visible wireframe geometric shapes. Needs to become gold filigree celestial art.

**Design requirements**:
- Gold (#d69e2e) on dark slate (#0a1628)
- SVG-based for crisp rendering
- Celestial motifs: suns, moons, stars, compass roses
- Each corner unique but harmonious
- Must work with X-Ray mode (swap to cyan #22d3ee when `xrayOn`)
- Reference aesthetic: Occult Tarot Card Frames (crystals, gold filigree, shattered stone with gold veins, lilies, glowing sigils)
- The card should feel like an artifact you'd want to collect, not a div

**Quality bar**: Think Lotería card art meets steampunk industrial frame meets celestial tarot border. The frame should make someone stop and look.

---

## TASK 2: Portal Archway Component (Desktop Only)

**New component**: `platform/src/components/museum/PortalArchway.tsx`

A viewport-framing archway that renders on desktop (>768px) only. Hidden on mobile.

**Props**:
```tsx
interface PortalArchwayProps {
  portal: 'museum' | 'marketplace' | 'hexisle' | 'dss' | 'nonprofit' | 'network';
  children: React.ReactNode;
  nichoSlots?: number; // how many card slots in the archway (default 4)
}
```

**Portal-specific styles**:

| Portal | Archway Style | Color Palette |
|---|---|---|
| museum (.com) | Ornate iron + stone + celestial | Gold + dark slate |
| marketplace (.biz) | Salt Mine stone archway | Iron gray + amber glow |
| hexisle | Fantasy crystalline + shattered stone | Teal + gold veins |
| dss (the2ndsecond) | Clockwork + gear frame | Bronze + copper |
| nonprofit (.org) | Natural wood + vine + leaf | Green + earth tones |
| network (.net) | Wire + circuit + constellation | Blue + silver |

**Each archway has**:
- Ornate corner art (matching the portal's style)
- Nicho slots along the sides/top where Deck Cards can be placed
- Empty nicho slots show as subtle outlined frames (invitation to fill)
- Filled nicho slots show the card's miniature artwork
- Desktop only — `hidden md:block` or similar

**Integration**: Wrap the main content in each portal's App component. Check `portalDetector.ts` for which portal is active, render the matching archway.

---

## TASK 3: Deck Card Frame Component

**New component**: `platform/src/components/cards/DeckCardFrame.tsx`

A reusable ornate frame wrapper for any Deck Card content.

**Props**:
```tsx
interface DeckCardFrameProps {
  frameStyle: 'celestial' | 'crystal' | 'iron' | 'vine' | 'clockwork' | 'circuit' | 'loteria' | 'steampunk';
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary' | 'crown';
  children: React.ReactNode;
  qrCode?: string; // URL for QR code overlay
  cardNumber?: number;
  cardName?: string;
}
```

**Frame rendering**:
- SVG border art matching the frameStyle
- Rarity affects border glow/material (common=iron, rare=gold, legendary=crystal, crown=custom)
- Card number badge (top-left, like Lotería)
- Card name banner (bottom, parchment/scroll style like Lotería)
- QR code overlay (small, bottom-right corner)
- Aspect ratio: 5:7 (standard card ratio, matches HEOHO card)

---

## TASK 4: Nicho Slot Component

**New component**: `platform/src/components/cards/NichoSlot.tsx`

The slot in an archway where a Deck Card locks in. Inspired by Mexican tin retablo shrine frames.

**States**:
- **Empty**: subtle outlined frame, slight glow on hover, "tap to place a card" tooltip
- **Filled**: shows card miniature with frame, tap to expand/view full card
- **Locked**: shows a padlock icon, needs to be earned/unlocked first

---

## REFERENCE AESTHETICS (Founder-provided)

1. **Lotería cards** — numbered, named, ornate botanical borders, culturally rich
2. **Block-print Lotería** — simpler handmade aesthetic, colored borders
3. **Steampunk mech frame** — gears, rivets, cityscape, industrial density
4. **Tin nicho retablo frames** — physical metal shrine frames in hearts, hands, crowns, arches (the physical analog of our digital card slots)
5. **Occult tarot frames** — crystals, ravens, gold filigree, shattered stone, celestial motifs
6. **Gold celestial corners** — sun/moon/star motifs, minimal but rich

---

## RUN ORDER

1. OrnateCornerArt replacement (HEOHO card) — immediate visual upgrade
2. DeckCardFrame component — reusable for all future cards
3. PortalArchway component — desktop viewport framing
4. NichoSlot component — card slots in archways
5. Wire PortalArchway into MuseumApp as first integration

## SESSION END
Run `scrambler_session_closeout` for K422.
