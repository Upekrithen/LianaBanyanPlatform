# Knight Session K421 — Deck Cards: Auto Shop + Triple Double Ladder

**Dispatched by**: Bishop B102
**Priority**: MEDIUM — clears 2 stale TouchStone deliverables
**TouchStone IDs**: B096-deck-card-auto-shop, B096-deck-card-triple-double

---

## Task 1: The Auto Shop Deck Card (Currency Vocabulary Trainer)

**Source**: Pudding #182, "The Shop That Fixed My Son's Car"

This Deck Card teaches the four-currency vocabulary (Credits, Marks, Joules, Backed Marks) through the real-world story of Pudding #182.

**What to build**: `platform/src/pages/museum/AutoShopCard.tsx`

**Design**:
- Interactive card with flip/reveal mechanic
- Front: The scenario (son's car breaks down, shop fronts everything)
- Back: The four-currency mapping table from Pudding #182:

| What happened | Currency | What's really going on |
|---|---|---|
| Tow truck + parts | **Credits** | Real cost, cash, 1:1 |
| Labor discount + priority | **Marks** | The differential — relationship value |
| Nine months of IT work | **Joules** | Surplus effort already banked |
| Shop fronting on a phone call | **Backed Marks** | Reservoir is real, trust is visible |
| "We'll work something out" | **Time-patient settlement** | Clock is cooperative, not adversarial |

- Each row should be tappable to expand with the full explanation from the Pudding
- Bottom: "See the full story" link → Pudding #182
- Use existing Deck Card component patterns (check `platform/src/components/helm/` for prior deck cards)
- Mascot: use the Stag (9-point Northern) — represents steady, reliable strength

**Verification predicate**: `file_exists: platform/src/pages/museum/AutoShopCard.tsx`

---

## Task 2: The Triple Double Ladder Deck Card

**Source**: Pudding #183, "The Triple Double and the Lottery Ticket Monkeys" + Innovation #2235

This Deck Card is an interactive panel on the member's Helm showing their Triple Double progress.

**What to build**: `platform/src/components/helm/TripleDoublePanel.tsx`

**Design**:
- Vertical ladder visualization with 4 rungs:
  - Rung 0: $24,000/yr ($100/day × 5 × 48)
  - Rung 1: $48,000/yr (2×)
  - Rung 2: $96,000/yr (2×)
  - Rung 3: $192,000/yr (2×)
- Each rung shows the member's current position (placeholder for now — wire to real earnings data later)
- Animated glow on current rung
- Header: "Hit the Triple Double"
- Subheader: "Swing for the Fences. No effort is wasted."
- **Attempts counter** at the bottom:
  - Label: "No Effort Is Wasted"
  - Shows: "Attempts this month: {count}"
  - Counts: Cue Cards sent + Projects launched + Campaigns fired
  - Only goes up. Never resets mid-month.
  - Click the "No Effort Is Wasted" header → opens Pudding #24
- Bottom link: "Read the full story" → Pudding #183
- Use `shadcn/ui` components, match existing Helm panel patterns
- Mascot: use the Owl — represents wisdom, long-term thinking

**Verification predicate**: `file_exists: platform/src/components/helm/TripleDoublePanel.tsx`

---

## Run Order
1. Build AutoShopCard.tsx
2. Build TripleDoublePanel.tsx
3. Verify both render in the app (check for import errors)
4. Verify both TouchStone predicates pass

## Session End
Run `scrambler_session_closeout` for K421.
