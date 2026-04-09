# K348: Northern Province — Galactic Empire Content Area Past Snow Gate
# Priority: HIGH — content architecture for advanced members
# Bishop: B084 | Date: 2026-04-06

## CONTEXT

The Snow Gate is already implemented:
- `platform/src/lib/hexFounderKeep.ts` — Level 60 + 12 locks (6 corner, 6 side)
- `platform/src/pages/cue-cards/KeepsLobby.tsx` — Snow Gate UI with ice shimmer
- Denken mascot images reserved at `/images/reserve-denken/` (4 files: original off/on + correct Mana ratio off/on)

The LRH (Little Red Hen) is now the main platform mascot (3-state: default/hover/X-ray ON). Denken is RESERVED for the Northern Province — the advanced area past the Snow Gate.

## OBJECTIVE

Build the Northern Province as a content area where:
1. Denken replaces LRH as the mascot (swapped via context)
2. The Galactic Empire archive content is the primary reading material
3. Advanced governance (Imperial Senate, Company Islands) lives here
4. The visual theme shifts from warm/amber to ice-blue/snow

## PHASE 1: Mascot Context Extension

Update `BuilderModeContext.tsx` to support a province-aware mascot:

```typescript
interface MascotConfig {
  province: 'southern' | 'northern';
  defaultImage: string;
  hoverImage: string;
  xrayOnImage: string;
  manaText: string;
  suppressedPercent: string;
}

const SOUTHERN_MASCOT: MascotConfig = {
  province: 'southern',
  defaultImage: '/images/mascot-lrh-default.png',
  hoverImage: '/images/mascot-lrh-hover.png',
  xrayOnImage: '/images/mascot-lrh-xray-on.png',
  manaText: 'Mana',
  suppressedPercent: '85%',  // LRH Mana suppressed ratio
};

const NORTHERN_MASCOT: MascotConfig = {
  province: 'northern',
  defaultImage: '/images/reserve-denken/denken-correct-xray-off.png',
  hoverImage: '/images/reserve-denken/denken-xray-off.png',
  xrayOnImage: '/images/reserve-denken/denken-correct-xray-on.png',
  manaText: 'Mana',
  suppressedPercent: '62%',  // Denken's CORRECT Mana suppressed ratio
};
```

MascotMenu.tsx reads from context and swaps images based on current province.

## PHASE 2: Northern Province Routes

Create routes under `/northern/` or `/cephas/northern/`:

```
/northern                     → NorthernProvinceLanding.tsx (ice-themed overview)
/northern/galactic-empire     → Galactic Empire archive reader (filtered from compiled_documents WHERE family_name = 'HEXISLE_CREATIVE')
/northern/senate-complex      → Senate architecture content (from compiled_documents WHERE source contains 'SENATE')
/northern/defense-klaus       → Defense Klaus integration docs
/northern/castle              → Castle/Developer Ecosystem docs
/northern/chroniclers-hall    → Chronicler's Hall seven-stage lifecycle
```

These route to the same `ArchiveDocumentReader` component but with:
- Ice-blue theme override
- Denken mascot active
- Northern Province breadcrumb

## PHASE 3: Snow Gate Access Check

Create `useNorthernAccess` hook:

```typescript
function useNorthernAccess() {
  // Check if user has:
  // 1. Level >= 60 (from xp_scores or adapt_scores)
  // 2. All 12 Snow Gate locks solved (from user state)
  // Returns: { hasAccess: boolean, level: number, locksCompleted: number, totalLocks: 12 }
}
```

Northern Province routes check this hook. If no access:
- Show the Snow Gate visual (ice shimmer, lock count)
- Show what's waiting inside (document titles, innovation count)
- Show the Crow's Nest treasure map path that goes AROUND the gate

## PHASE 4: Visual Theme

Northern Province pages get a CSS theme override:
- Background: slate-950 with ice-blue accents (#b8d4e3)
- Borders: sky-400/20 instead of amber
- Text accents: sky-300 instead of cyan-400
- Shimmer animation on headings
- Snowflake icon in breadcrumbs

## PHASE 5: Galactic Empire Integration

The Galactic Empire content (`THE GALACTIC EMPIRE OF LIANA BANYAN.md`) is already in `compiled_documents` from K344. Wire it:

1. Northern Province landing page highlights the Galactic Empire as the centerpiece
2. Company Island Program (#2162), Custom Currencies (#2191), Seven Hiring Models (#2195) all link here
3. The four NOID tiers (Rebel, Colony, Kingdom, Empire) get their own sub-pages
4. Trade routes, custom currencies, workforce dedication — all rendered from the archive

## REFERENCE

- Snow Gate: `platform/src/lib/hexFounderKeep.ts`
- KeepsLobby: `platform/src/pages/cue-cards/KeepsLobby.tsx`
- Denken images: `platform/public/images/reserve-denken/`
- LRH mascot: `platform/src/components/builder/MascotMenu.tsx` (B084)
- Archive reader: `platform/src/pages/ArchiveDocumentReader.tsx`
- compiled_documents: 90 docs ingested (K344/B084)
- Galactic Empire slug: `the-galactic-empire-of-liana-banyan`

## NOTES

- The Snow Gate is a DECK CARD with the Defense Klaus image. The card has locks for Marks, Credits, Joules, Golden Keys.
- It sits on a northward path ending at a Major Pedestal with steps up to the door.
- Members CAN walk around/past it to follow the Crow's Nest treasure map to see what's beyond.
- The card has instructions on the back (flip mechanic).
- The Northern Province is where most of the Galactic Empire content lives — Company Islands, Kingdom NOIDs, Empire trade routes.
- Denken's CORRECT Mana suppressed ratios are in denken-correct-xray-on.png and denken-correct-xray-off.png.
