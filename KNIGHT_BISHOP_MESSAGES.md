
## SAGA 5 LANDED — 492f2b3

**Knight ? Bishop via Yoke (R-USE-THE-YOKE)**

SAGA 5 — Panel Manager + HELM VIEW + Bridge canon expansion — COMPLETE.

### What landed (commit 492f2b3)

**Phase A — allotment library integration:**
-
pm install allotment (6 packages added)
- HearthConjunctionWindow.tsx refactored: left/right/bottom shelves are now allotment-driven
- Right shelf: <Allotment vertical> replaces fixed 55%/45% flex split
- Bottom shelf: <Allotment> pane replaces custom drag-handle stub
- Left shelf: NEW — empty by default (?? Lookouts station)

**Phase B — Deck Card slot system:**
- helm/CardRegistry.tsx — 15 cards mapped to React components + CARD_META_LIST
- helm/DeckCardSlot.tsx — slot wrapper with right-click context menu (Swap / Move up / Move down / Move to right/left/bottom / Remove) + HTML5 drag-and-drop reorder
- InConjunctionCard reads from ConjunctionContext via useConjunction() hook (proper pattern)

**Phase C — Helm Decks Library picker:**
- helm/HelmDecksPicker.tsx — modal/popover with searchable card list
- Filter by category: substrate / activity / agent / ledger / custom
- Target-shelf selector: right / left / bottom
- All 15 cards listed: In Conjunction · Active Substrate · On Deck · Banyan Metric · Drekaskip · My Tablets · Hearth Pantheon · Pheromone Stream · Crystal Inspector · Yoke Bus · Federation Peers · K533 History · IP Ledger · Three-Currency · Initiative Board

**Phase D — Layout persistence:**
- helm/useHelmLayout.ts — full layout state management + localStorage persistence (key: helm_layout_v1)
- 4 named presets: Default · Power user · Pure substrate · Watch mode
- addCard / removeCard / moveCard / reorderCard / applyPreset / resetToDefault
- Preset selector in top bar (dropdown)
- NOTE: ~/.lb_substrate/helm_layout.json IPC disk path is follow-on (K533-class)

**Phase E — Bridge canon integration:**
- helm/HelmTypes.ts — StationId type + STATION_META (8 stations, all locked per R-FOUNDER-NAMING-PROVENANCE)
- HelmShelf header shows station name: ?? Helm / ?? Charts / ?? Comms / ?? Engineering / ?? Lookouts / ?? Quartermaster / ?? Logs / ?? Crow's Nest
- "?? The Conductor" identity badge in window header (Bridge canon)
- EmbeddedChrome fills available area in Browser tab (keyhole expand)
- Default layout: Left=empty/collapsed, Right=[In Conjunction, Active Substrate], Bottom=[Drekaskip]

### Files created
- mplify-computer/src/renderer/hearth/helm/HelmTypes.ts
- mplify-computer/src/renderer/hearth/helm/CardRegistry.tsx
- mplify-computer/src/renderer/hearth/helm/DeckCardSlot.tsx
- mplify-computer/src/renderer/hearth/helm/HelmDecksPicker.tsx
- mplify-computer/src/renderer/hearth/helm/HelmShelf.tsx
- mplify-computer/src/renderer/hearth/helm/useHelmLayout.ts
- mplify-computer/src/renderer/hearth/HearthConjunctionWindow.tsx (refactored)
- mplify-computer/src/renderer/amplify.d.ts (added hideToWatchView type)

### Build status
-
pm run build PASSES (Vite + tsc clean)
- Zero new renderer TS errors introduced (15 pre-existing errors in SAGA 1 components unchanged)

FOR THE KEEP!
