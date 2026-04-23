---
knight_session: K454
bishop_session: B119
bridle_version: 10
status: READY TO DISPATCH
predecessor_gate: mascots(B119) commit 2568c14 (summoned prop landed) ✓
target_tag: v-mini-wildfire-tour-K454
task_class: new UI component + route integration
estimated_model: Sonnet 4.6
scope_size: medium (single-session, 2-3 hours)
---

**THE BRIDLE — read this before you respond. Follow all ten rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.
10. **MCP tooling discipline.** Always use `npm run build-guarded` (not raw `npm run build`) when modifying `librarian-mcp/src/`. Always use `npm start` (not raw `node dist/server.js`) to run the MCP server. The guard emits structured `server_rebuilding` errors during build windows; the supervisor auto-restarts on silent crash. Bypassing either returns us to the pre-K448 / pre-K449 silent-hang regime.

**End of BRIDLE. Task follows.**

---

## Context (Founder-specified)

> *"use the color to indicate who is speaking, when we have BOTH of them on the page during a mini-wildfire tour — which just plays like the 90 second tour, but to explain all the other things. that way, the user can see, the colored one is speaking, the plain one is not, and it switches. Then, when in X-Ray mode, they are both still switch, just from colored to Xray instead of colored to gray (speaking to non)."*

The `summoned` prop (committed B119 in `2568c14`) already composes for this. This session builds the **wrapper component** that orchestrates a multi-mascot tour: a speaker flag flips between mascots as narration advances.

**Existing pieces you build on (already shipped):**
- `platform/src/components/museum/Mascot.tsx` — accepts `summoned` prop. When true, renders colored (hover) in normal mode, thermal (xray) in X-Ray mode. When false, renders muted default.
- `platform/src/components/museum/MascotDialogue.tsx` — single-mascot summon wrapper.
- `platform/src/components/museum/XRayContext.tsx` — global X-Ray Mode state.
- `platform/src/data/mascots.ts` — 17-character registry. Use canonical `id` strings only.

## Scope

### Phase 1 — WildfireTour component

Build `platform/src/components/tour/MiniWildfireTour.tsx`:

```tsx
interface TourStep {
  speakerId: string;          // mascot id from registry
  topic: string;              // short topic for the bubble title
  message: React.ReactNode;   // the narration body
  helperMessage?: React.ReactNode;
  durationMs?: number;        // auto-advance after N ms; if omitted, user must click "Next"
}

interface MiniWildfireTourProps {
  steps: TourStep[];                           // narration sequence (2+ steps)
  allMascots: string[];                        // all mascot ids visible across the tour (superset of speakerIds)
  autoPlay?: boolean;                          // default false; user presses play
  onComplete?: () => void;
  layout?: "horizontal" | "vertical";          // default horizontal — side-by-side row
  mascotSize?: number;                         // default 80 (larger than MascotDialogue's 56 for tour context)
  className?: string;
}
```

**Behavior:**
- Renders all `allMascots` in a row (or column in vertical layout) at `mascotSize`.
- For each step, ONE mascot (the speakerId) has `summoned={true}`; all others `summoned={false}`.
- The speaker's bubble renders adjacent — MascotBubble or a new `TourBubble` component if styling differs.
- Advance on: (a) `durationMs` elapsed, (b) user clicks "Next", (c) programmatic `next()` call.
- Pause/Play/Previous/Next/Skip controls at the bottom of the tour frame.
- `Previous` walks back one step (re-renders the earlier bubble; useful for "wait, read that again").
- `Skip` calls `onComplete` immediately.
- Final step: on-advance, call `onComplete`.

**X-Ray Mode integration:**
- The existing `summoned` prop already does the right thing: summoned+xray → thermal; summoned+normal → colored; not-summoned → default muted (regardless of X-Ray). Do NOT add special-case logic in the tour component — the Mascot component already handles it. If you see yourself writing `if (xrayOn) {...}` in `MiniWildfireTour`, stop — you're reimplementing what Mascot.tsx already does.

**Narration frame visuals:**
- Keep it close to MascotDialogue styling. Same font, same bubble, same dismiss-less wrapper (tour has controls, not dismiss).
- Pullquote-style emphasis for the speaker's name + topic at the top of each bubble.
- Step counter somewhere visible: "3 of 7".

### Phase 2 — First consumer route

Create `platform/src/pages/tour/MiniTour.tsx` at route `/mini-tour` (add to `platform/src/routes/public.tsx` or equivalent routes file).

**Starter narration content (Bishop-authored placeholder — Founder will rewrite per `feedback_founder_prefers_own_writing`):**

A 7-step tour explaining "all the other things" per Founder framing. Use these mascots: `lrh` (host), `owl` (why), `pig` (math), `goat` (future), `bird` (history). Steps:

```
1. lrh: "Welcome to the 90-second tour of all the things you didn't see in the 90-second tour."
2. owl: "Every rule on this platform has a reason. Let me show you one: why Cost+20% is locked."
3. pig: "And here's what that math actually costs you when you buy a print from another member..."
4. goat: "Three years from now, this platform looks different — but in a direction you can see coming."
5. bird: "Some of it already happened. Let me show you the archive of how we got here."
6. lrh: "That's five corners of Liana Banyan. There are more. When you're ready, each corner is behind its own door."
7. lrh: "You can close this tour, or take the full 252-item curated walk. Or just start browsing."
```

These are SCAFFOLDING — Founder rewrites the actual copy. Wire the structure; prose gets Founder-polished later. Leave a `[FOUNDER REWRITE]` marker at the top of the narration array.

### Phase 3 — Tests

- `MiniWildfireTour.test.tsx` — 7 cases:
  1. Renders all `allMascots` at step 0
  2. Only `steps[0].speakerId` has `summoned={true}` at step 0
  3. After advancing, `steps[1].speakerId` is summoned; previous speaker goes back to muted
  4. `Previous` walks back correctly
  5. `Skip` calls `onComplete`
  6. Auto-advance fires after `durationMs`
  7. Final step's advance triggers `onComplete`
- React Testing Library. Mock `XRayContext` with both on + off. No real network.

### Phase 4 — Verify in browser

Run dev server (standard `npm run dev` in `platform/`). Visit `/mini-tour`. Verify:
- Speaker swaps colored ↔ muted as you advance
- Toggle X-Ray Mode mid-tour — speaker goes thermal, non-speakers stay muted
- Prev/Next/Skip all work
- Step counter updates

Capture a screenshot for the handoff report (tour at step 3 with 5 mascots visible, 1 colored, 4 muted).

### Phase 5 — Handoff

Tag `v-mini-wildfire-tour-K454` on green commit. Report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K454_B119_MINI_WILDFIRE_TOUR.md` with the screenshot + test summary.

---

## Non-goals (do not do)

- Do NOT redesign the `summoned` prop or Mascot.tsx rendering rules. They're correct; don't second-guess.
- Do NOT write final narration copy. Placeholders only. Founder authors the final text.
- Do NOT build a narration editor UI for admins. Tour content is code-defined for K454; admin-editable is a future separate scope.
- Do NOT integrate with the existing 90-second Grand Tour at `/tour` — keep the mini-tour standalone at `/mini-tour`. Sibling route, not replacement.
- Do NOT add a new domain to `MascotDomain`. All characters already exist in the registry.
- Do NOT modify `Mascot.tsx`, `MascotDialogue.tsx`, `data/mascots.ts`, or any file from commit `2568c14`. This session is pure addition.

---

## Deliverables checklist

| # | Deliverable | Gate |
|---|---|---|
| 1 | `MiniWildfireTour.tsx` component with all props | Phase 1 |
| 2 | `/mini-tour` route + `MiniTour.tsx` page | Phase 2 |
| 3 | 7-step scaffolding narration array (with `[FOUNDER REWRITE]` marker) | Phase 2 |
| 4 | `MiniWildfireTour.test.tsx` green (7 cases) | Phase 3 |
| 5 | Dev server screenshot showing colored-speaker + muted-others | Phase 4 |
| 6 | Tag + handoff report with screenshot embed | Phase 5 |

---

## BRIDLE compliance

| Rule | Demonstrate |
|---|---|
| Rule 2 | Grep existing `summoned` usages before writing your own — confirm you understand the prop semantics |
| Rule 5 | Use exact mascot `id` strings from `mascots.ts` (don't approximate — grep before using) |
| Rule 6 | Zero changes to Mascot.tsx / MascotDialogue.tsx / mascots.ts. Pure additive session. |
| Rule 10 | No librarian-mcp edits; irrelevant to this session, confirm in handoff |

---

*Knight K454 authored by Bishop B119, 2026-04-23. Founder-spec'd the behavior directly ("speaker colored, non-speaker muted, swap, xray-mode still swaps colored-to-xray"). FOR THE KEEP.*
