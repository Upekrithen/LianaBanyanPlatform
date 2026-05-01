# KN070 Receipt — Visual Timeline /timeline route
**Bean**: KN070 / BP006 / Pod EE Bean 2
**Filed**: 2026-05-01 by Knight (Cursor AI)
**Call Sign**: v-visual-timeline-deployment-KN070 · a17919d

---

## What Landed

New view in the Helm PWA (librarian-mcp-helm-pwa) rendering a horizontal SVG timeline of LB Frame prior-art evidence.

### Files Changed
- `librarian-mcp-helm-pwa/src/renderer/src/components/VisualTimelinePanel.tsx` — new (1,072 lines)
- `discipline_wing/tests_kn070.py` — new test suite

(App.tsx already updated in KN069 — VisualTimelinePanel route was pre-wired.)

### View Details
- Route: 'timeline' view in Helm PWA (maps to Librarian.the2ndSecond.com/timeline)
- Event count: 19 canonical events across all marker types
- Nav: "📅 Timeline" in sidebar between Glossary and Rules

### Data Sources Represented
| Source | Events | Anchors |
|---|---|---|
| USPTO Provisional Receipts | 4 (Prov 13–16) | 64/036,646 / 64/052,602 / 64/052,618 / TBD |
| KN052 Cost-Comparison Shadow | 1 | Commit 875ecd6 |
| Monolith Markers | 3 (B133 / BP002 / BP005) | Session IDs |
| Bean Landing Markers | 2 (KN069 / KN070) | Tags |
| Conference Markers | 2 (PCC Bangkok / INDL-9 Geneva) | Dates |
| Milestone Markers | 7 (Pod Q/R/S/U/V/Y + PCT) | Commit hashes |

### Features Implemented
- **SVG timeline**: horizontal scrollable, date-proportional positioning
- **Marker types**: 6 types with distinct colors — gold (patent), purple (monolith), green (bean), cyan (conference), orange (empirical), blue (milestone)
- **Gold patent markers** with inner dot — distinct from all other types per spec
- **Monolith markers** with diamond overlay — visually distinguished
- **Year tick marks**: vertical gridlines with year labels
- **95+ consecutive clean bean counter**: badge in SVG corner
- **Type filter chips**: toggle each marker type on/off (minimum 1 must remain)
- **Date range filter**: from/to date inputs filter events
- **Click-to-select detail card**: full description + anchor + tags + USPTO URL clickthrough
- **Empirical-velocity callout**: KN052 receipt displayed (84 sessions in 12 days vs 421 in 1+ year)
- **Cross-links**: → Glossary (KN069 compose) / Home / Observers / Wing

### Defensive Value
Visual prior-art evidence that any technical evaluator can verify against canonical sources (USPTO Patent Center, git commit history, empirical receipts). The empirical-velocity proof from KN052 (84 sessions in 12 days vs 421 sessions in 1+ year) is visceral in visual form in a way prose cannot match.

## Test Results

```
KN070 VisualTimelinePanel Tests: 45/45 passed
```

8 test classes × 4–9 sub-tests each:
- T01 RouteRegistered (4 tests) — import, view type, render branch, nav item
- T02 DataAggregationCorrectness (9 tests) — all data sources, Prov 13/14/15, KN052, Monolith 1+2+3, EVENTS array, 15+ events
- T03 MarkersDisplay (8 tests) — all 6 types, gold color, PCC Bangkok, INDL-9, 95+ counter
- T04 HoverTooltips (5 tests) — selectedId, detail card, onSelect, description display, aria-label
- T05 ResponsiveOnMobile (4 tests) — overflowX auto, flexWrap, min SVG width, svg role
- T06 DateRangeFilter (5 tests) — dateFrom/dateTo states, 2 date inputs, useMemo, aria-labels
- T07 PatentMarkerClickthrough (4 tests) — USPTO URL, url field, window.open, conversion deadline
- T08 MonolithMarkerSummary (6 tests) — 3+ monolith events, "consecutive clean", purple color, empirical-velocity, cross-link to glossary

## Composition Receipts

Composes with:
- KN069 (SubstrateGlossaryPanel) — cross-link "📖 Substrate Glossary" from timeline
- KN052 (Cost-Comparison Shadow) — empirical-velocity proof anchored at commit 875ecd6
- KN056 (Conductor's Baton) — b862577 receipt on timeline
- KN057 (Federation Library L5) — ec1bda0 receipt on timeline
- KN064 (LibrarianPage) — extends the Helm PWA with timeline view
- Chronicler/Chronos/TimeWave (#2299–#2304) — temporal substrate conceptual parent

## Ratification Candidates Discovered

None in this bean. The timeline itself creates a new prior-art record that could be cited in future provisionals as a "substrate-timeline visualization tool with filterable marker types and empirical-receipt anchoring."

---

*KN070 Phase F receipt. Knight (Cursor AI). BP006 Pod EE. 2026-05-01.*
*THE SHADOW KNOWS!*
