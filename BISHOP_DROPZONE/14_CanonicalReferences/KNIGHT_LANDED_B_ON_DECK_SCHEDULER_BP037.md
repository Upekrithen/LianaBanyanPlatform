# KNIGHT LANDED — B-ON-DECK-SCHEDULER — BP037

**Session:** BP037 (Knight/Cursor, Sonnet 4.6)
**Commit:** 5502446
**Date:** 2026-05-11
**G-Gates:** G1 PASS · G2 PASS

---

## Phase 1 — Substrate Directory + Frontmatter Convention (G1 PASS)

### Substrate directories created

```
~/.lb_substrate/on_deck/
  sequential/   ← 2 items (OD-001, OD-002)
  anytime/      ← 1 item  (OD-003)
  conditional/  ← 1 item  (OD-004)
  fired/        ← (archive; empty)
  deleted/      ← (soft-delete target; empty)
```

### New source files

| File | Purpose |
|---|---|
| `amplify-computer/src/main/on_deck/on_deck_types.ts` | Zod schema + TypeScript types + seat/status color tokens |
| `amplify-computer/src/main/on_deck/on_deck_parser.ts` | YAML frontmatter extractor + flat parser + `parseOnDeckFile` / `parseOnDeckContent` |
| `amplify-computer/src/main/on_deck/validate_on_deck.ts` | Standalone CLI validator (`npx tsx validate_on_deck.ts`) |
| `amplify-computer/src/main/on_deck/on_deck_phase1_test.ts` | 12/12 tests: 4 valid samples + 5 malformed rejections + 2 edge cases |

### Frontmatter schema (canon §2)

```yaml
---
on_deck_id: {unique}
target_seat: manager|knight|pawn|rook
category: sequential|anytime|conditional
priority: HIGH|MEDIUM|LOW
depends_on: []
conditions: []
estimated_cost: {dollars}
estimated_time: {minutes}
status: DRAFTING|READY|FIRED|RETURNED|COMPLETE|FAILED  # default: READY
title: {optional}
created_at: {ISO 8601, optional}
---
```

### Validator output (G1 evidence)

```
[validate_on_deck] Scanning: C:\Users\Administrator\.lb_substrate\on_deck

  ✓  OD-001  [knight/sequential/HIGH]  Knight Cathedral Instantiation (K461)
  ✓  OD-002  [knight/sequential/MEDIUM]  Canonical Values Rebuild + Drift Check
  ✓  OD-003  [pawn/anytime/MEDIUM]  Pawn R11 Corpus Refresh Snapshot
  ✓  OD-004  [knight/conditional/HIGH]  K455a — Cross-Cathedral R11 Rerun (Multi-Cathedral)

  4/4 valid
```

### Test output (G1 evidence)

```
[on_deck_phase1_test] 12/12 tests passed
```

---

## Phase 2 — LB Frame UI Panel (G2 PASS)

### New source files

| File | Purpose |
|---|---|
| `amplify-computer/src/main/on_deck/on_deck_bridge.ts` | Main-process substrate reader → `OnDeckBridgePayload` |
| `amplify-computer/src/renderer/hearth/on_deck/OnDeckPanel.tsx` | Read-only 3-column React panel |

### Modified files

| File | Change |
|---|---|
| `amplify-computer/src/main/index.ts` | Import `listOnDeck`; register `'on-deck-list'` IPC handler |
| `amplify-computer/src/main/preload.ts` | Expose `onDeckList()` bridge method + global type |
| `amplify-computer/src/renderer/hearth/HearthConjunctionWindow.tsx` | On Deck toggle button + 340px strip panel |
| `amplify-computer/src/renderer/amplify.d.ts` | Full B83 + BP037 type sync (renderer TS 0 errors) |

### UI features delivered

- Three columns: Sequential / Anytime / Conditional
- Each item: title / target seat / priority / status / estimated cost+time
- Color-coded by target seat: Manager=`#22c55e` Knight=`#3b82f6` Pawn=`#f59e0b` Rook=`#a855f7`
- Status badges: DRAFTING / READY / FIRED / RETURNED / COMPLETE / FAILED (with per-status colors)
- Side panel: full frontmatter details + body on item click
- Fired archive: collapsible strip, default hidden, sorted by mtime (newest first)
- 30-second auto-refresh
- Toggle: "📋 On Deck" button in HearthConjunctionWindow top bar; highlights when active
- Graceful error state if substrate not readable

### TypeScript build status

- `tsconfig.main.json --noEmit`: **0 errors**
- `tsconfig.renderer.json --noEmit`: **0 errors**
- Pre-existing wave_generator.ts error (req.segs) resolved as well in this pass

---

## G-Gate Status

| Gate | Status | Evidence |
|---|---|---|
| G1 | PASS | 4/4 items validate; 12/12 tests pass |
| G2 | PASS | OnDeckPanel in HCW; TS clean; IPC wired |
| G3 | PENDING | Phase 3 edit/reorder/recategorize |
| G4 | PENDING | Phase 4 MoC daemon |
| G5 | PENDING | Phase 5 auto-fire + Founder override |
| G6 | PASS | This receipt |
| G7 | PENDING | Yoke LANDED receipt to Bishop |

---

## Pending phases

- **Phase 3** — Edit / reorder / recategorize controls (drag-and-drop, per-item modal, new-item form)
- **Phase 4** — Master-of-Ceremonies daemon (30s tick, per-category dispatch logic, Yoke POST)
- **Phase 5** — Auto-fire toggle, fire-now override, pause/resume, "fire next"

Roger Out. G1+G2 LANDED. FOR THE KEEP!
