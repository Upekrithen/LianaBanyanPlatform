# KN069 Receipt — Substrate Encyclopedia + /substrate-glossary
**Bean**: KN069 / BP006 / Pod EE Bean 1
**Filed**: 2026-05-01 by Knight (Cursor AI)
**Call Sign**: v-eblet-encyclopedia-cephas-deployment-KN069 · 5540a77

---

## What Landed

New view in the Helm PWA (librarian-mcp-helm-pwa) rendering the complete Liana Banyan Substrate Encyclopedia.

### Files Changed
- `librarian-mcp-helm-pwa/src/renderer/src/components/SubstrateGlossaryPanel.tsx` — new (1,569 lines)
- `librarian-mcp-helm-pwa/src/renderer/src/App.tsx` — updated (added 'glossary' view + nav item + imports)
- `discipline_wing/tests_kn069.py` — new test suite

### View Details
- Route: 'glossary' view in Helm PWA (maps to Librarian.the2ndSecond.com/substrate-glossary)
- Entry count: 67 entries across 8 primitive classes (exceeds 60+ requirement)
- Nav: "📖 Glossary" in sidebar between Phase-Shift and Timeline

### 8 Classes Covered
| Class | Name | Count |
|---|---|---|
| I | Substrate Storage + Memory | 7 |
| II | Architectural Substrate | 6 |
| III | Verification + Trust | 7 |
| IV | Federation Architecture | 13 |
| V | Discipline + Operational | 12 |
| VI | Stitchpunk Pantheon | 15 |
| VII | Brand Canon + Founder Voice | 12 |
| VIII | Empirical Receipts | 10 (Pod O through Pod AB) |

### Features Implemented
- **Search/filter**: useMemo case-insensitive search across name/def/details/cls/anchor
- **Class filter**: dropdown filters to single class (All classes default)
- **Expand/collapse**: each entry expandable to "How it works + Why it matters + Composes with"
- **Pheromone click-tracking**: console.log `[SubstrateGlossary] pheromone_anchor` on entry expand
- **Cross-links**: 4 buttons → Home / Timeline / Modules (Install) / Wing (Federation)
- **Pledge footer**: Cooperative Defensive Patent Pledge (#2260) + § 102(a) coverage statement
- **Accessible**: aria-expanded, aria-label on all interactive elements, aria-label on search input

## Test Results

```
KN069 SubstrateGlossaryPanel Tests: 33/33 passed
```

8 test classes × 4+ sub-tests each:
- T01 RouteRegistered (4 tests) — import, view type, render branch, nav item
- T02 EntriesDisplay (4 tests) — count ≥60, all 8 classes, colors, typed array
- T03 CrossLinksNavigate (5 tests) — all 4 cross-link targets + onNavigate prop
- T04 SearchFilter (4 tests) — state, input, class filter, useMemo
- T05 MobileResponsive (4 tests) — flexWrap, flex:1, minWidth, overflowY
- T06 PheromoneClickTracking (4 tests) — anchor, console.log, entry_id, timestamp
- T07 CanonSourceOfTruth (4 tests) — no fetch, no axios, pledge footer, § 102(a)
- T08 EntryStructureValid (4 tests) — interface, required fields, optional anchor, aria-expanded

## Defensive Value

Every primitive named + described publicly = prior-art per § 102(a). 67 entries creates comprehensive prior-art coverage for all substrate primitive classes. Smaller wedges available to competitors reduced by this comprehensive listing.

## Composition Receipts

Composes with:
- KN070 (VisualTimelinePanel) — cross-link from glossary to timeline; timeline markers can deep-link to glossary entries
- KN064 (LibrarianPage) — new 'glossary' view extends the PWA; Nav item added alongside existing views
- KN061 (Stage-2 Demo) — glossary is referenced in LB Frame broadcast funnel
- EBLET_ENCYCLOPEDIA_SCAFFOLD_BP005.md — this glossary is the deployed form of Bishop's scaffold

## Ratification Candidates Discovered

None identified. Glossary deployment is itself the observable; entries are all already-ratified primitives.

---

*KN069 Phase F receipt. Knight (Cursor AI). BP006 Pod EE. 2026-05-01.*
*THE SHADOW KNOWS!*
