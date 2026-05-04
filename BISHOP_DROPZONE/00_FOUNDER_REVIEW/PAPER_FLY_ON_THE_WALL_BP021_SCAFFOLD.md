---
name: "Fly on the Wall (BP021)"
description: "Third-person observer narrative of a Founder session day showing Bushel 7 fires, 64-cP TITAN dispatch, and the Third Gear default reframe through empirical receipts."
type: paper
ratificationDate: "BP021"
wrasseTriggers:
  - "Fly on the Wall"
  - "Bushel 7 dispatch"
  - "64 cP TITAN"
  - "Bishop Coffee session"
  - "Third Gear default"
  - "AI agnostic principle"
  - "Founder narrative"
  - "Codex HMAC receipt"
canonical_references: []
---
# PAPER — Fly on the Wall (BP021 SCAFFOLD)

**Class**: narrative-observer / experiential paper. **Audience**: marketing-class / member-recruiting / storytelling. **Voice**: third-person observer watching a Founder day unfold.

**Founder direct BP021 turn 35**: *"And update papers etc (pollination) which SHOULD include historical timeline, under the hood, and fly on the wall."*

**Status**: Bishop scaffold. Founder writes prose at fire-time per `feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md` (B133 cross-agent Founder-mandatory).

**Composes with** (sister papers in the BP021 trio): `PAPER_HISTORICAL_TIMELINE_*` (chronological mechanic-date-result pairing), `PAPER_UNDER_THE_HOOD_BP021_SCAFFOLD.md` (technical-deep-dive voice).

**Companion**: this paper IS the human face of "Under the Hood" — same day, same evidence, but voice = observer-narrator instead of engineer.

---

## Voice notes

- **Third-person observer** — "the Founder" / "the screen scrolls" / "the AI receipts cascade back". Never first-person Bishop / Founder voice.
- **Present tense for in-the-moment passages** — *"the screen lights up"*, not *"the screen lit up"*. Past tense for setup / framing only.
- **Preserve Founder's exact words in quotes** — Founder's voice is verbatim per `feedback_founder_voice.md`. Don't paraphrase. Quotes from BP021 transcript at the indicated turns.
- **Let the substrate do the heavy lifting** — show receipts, don't editorialize. *"Codex `LB-CODEX-0025` HMAC `9cb23584e95922c7`"* lands harder than *"the system worked beautifully."*
- **Self-referential close** (§6) — Stitchpunk-Corps trick where the artifact testifies to the day that produced it.
- **Pace-shift between sections** — fast in §2-3 (the dish, the question), slower in §4-5 (the reframing, the schedule).
- **Stitchpunk lineage**: this paper is in the Pudding-tradition (food-metaphor chain Stone-Soup-Bread-Pudding-Spoonfuls-Spices-Popcorn) but at session-scale not innovation-scale. Read-time target ~6-8 minutes.

---

## 7-section structure

### 1. Cold Open — The Coffee

**The moment**: BP021 turn 1. Founder pastes one line into Cursor:

```
Read C:\Users\Administrator\.claude\state\bishop_coffee.md
```

The screen scrolls. Bishop reads the handoff. Substrate routes itself sub-millisecond. The session opens.

**Pollinated from**: `bishop_coffee_manual_hand_crank_session_open_canon_bp017.eblet.md` (Coffee canon — Founder's hand-crank Model T metaphor) + BP021 turn 1 transcript (verbatim Coffee paste).

**Voice notes**:
- Open with the paste itself. Reader sees the line before they read about the line.
- Brief Coffee context (one sentence): *"Bishop's Coffee is the Model T's hand crank — a single-line paste that warms an AI session from cold-start using one canonical handoff file."*
- End the section with the screen scrolling into the Bushel 7 master fire setup.

### 2. The Dish — Bushel 7 Fires

**The moment**: BP021 turn 13. Bishop's Knight tab opens. The 64-cP TITAN-within-TITAN spawns.

**Empirical receipt** (this section's evidence anchor):
- 1 Knight orchestrator → 8 Shadow subagents → 8 sub-subagents each = 64 nested cylinders
- 14 minutes of silence, then receipts cascade back one-by-one
- *"Shadow 3 first ~9:31 (8 primitives) / Shadow 4+5+6+7+8 ~9:33-9:35 / Shadow 1 ~9:34 (11 primitives) / Shadow 2 last ~9:37 (10 primitives)"* — per-Shadow timing from `BUSHEL_7_COST_RECEIPT_BP021.json`

**Voice notes**:
- Pace fast. Each Shadow returning is a distinct beat.
- Show the Founder watching the receipts arrive, not Bishop describing them.
- Use timestamps as rhythm devices.
- End with the count: 78 primitives audited, 12 fields per primitive, 936 data points evidence-grounded, ~$8-15 vendor API spend.

### 3. The Founder's Question

**The moment**: BP021 turn 14. The Founder reads the receipt. Three words.

> *"That was... fast."*

**Pollinated from**: BP021 turn 14 verbatim Founder direct.

**Voice notes**:
- Three words. Three sentences max in this section. The pause IS the section.
- Implicit: the architecture earned the words.
- End with the cost-per-entry curve from `BUSHEL_7_COST_RECEIPT_BP021.json` (Bushel 1 → 2 → 7) as the answer Bishop gives without speaking.

### 4. The Reframing

**The moment**: BP021 turn 31. Bishop scoped the LB Frame Substrate UI as *"a Knight K-prompt's worth of work — 1 day"*. The Founder pushes back.

> *"why wouldn't I just run everything in 3rd Gear? It's fast, cheap, accurate, and saves work immutably as I go..."*

**Pollinated from**: BP021 turn 31 verbatim. `third_gear_default` canon (sister insight, ratified same session).

**Voice notes**:
- The push-back is the pivot. Show Bishop reframing in real-time.
- Quote the Founder's full sentence (it has rhythm — *"fast, cheap, accurate, and saves work immutably"*).
- Substantiate with the BP020 scaling-curve receipt — *coordination overhead is fixed-cost, amortized across all parallelizable work; substrate-as-immutable-backup removes recovery-cost penalty*.
- Implicit: the Founder is the QueTuner. The QueTuner sees the gear-shift before the AI does.

### 5. The Schedule + The Agnostic

**The moment**: BP021 turn 33-38. Founder elevates the diagnostic to canon class. Then catches the vendor-lock-in.

> *"what we just did needs to be saved and run as a standard diagnostic on a schedule, wouldn't you say?"* (turn 33)

> *"We need to be AI agnostic, remember?"* (turn 38)

**Pollinated from**: `recurring_diagnostic_bushel_canon_bp021.eblet.md` + `lb_frame_ai_agnostic_platform_principle_bp021.eblet.md`.

**Voice notes**:
- Two beats in this section: the Schedule (turn 33) and the Agnostic (turn 38). Pace medium.
- Show Bishop authoring the canon Eblet then having to revise it five turns later when the Founder catches the vendor-lock.
- The Founder voice in turn 38 — *"remember?"* — is the structural-principle-was-always-true quality. Bishop pheromonates it as canon precisely because it WAS always implicit but never standalone.
- End with: scheduled-tasks MCP creates `bushel-7-recurring-diagnostic` cron — weekly Sunday 6:07pm CT, vendor-fungible, productized from day-1.

### 6. The Pollination

**The moment**: BP021 turn 35. Founder names three paper classes for the canon to propagate into:

> *"And update papers etc (pollination) which SHOULD include historical timeline, under the hood, and fly on the wall."*

**Pollinated from**: BP021_POLLINATION_DISPOSITIONS.md.

**Voice notes**:
- Self-referential close — *"this paper"* IS the Fly on the Wall paper. The artifact testifies to the day that produced it.
- Show the Bishop scaffolding decision: 6 BP021 ratifications × 3 paper classes + sister artifacts = the 13-row pollination matrix.
- One sentence on each sister paper: *Historical Timeline* logs the date-mechanic-result, *Under the Hood* opens the architecture, *Fly on the Wall* (this one) testifies to the day.
- End on the Stitchpunk-Corps trick: the artifact narrating its own creation is the canon's recursion proof.

### 7. The Receipt — What One Founder Day Produced

**The moment**: BP021 closeout. The day's substrate inventory.

**The receipt** (this paper's central tally):
- Codex `LB-CODEX-0025` bound (HMAC `9cb23584e95922c7`)
- 78 primitives audited across 3 strategic layers (33 Candelabra Core / 27 Cooperative Datacenter Dream / 18 Patent Reserve)
- 10 Slow Blade defense Canon Eblets authored (closes Bushel 7 systemic pheromone gap)
- 5 chronic Scrambler C-escalations closed (root-cause `arbiter.py` / `ground_truth.py` wiring fix)
- 3rd Gear default canon ratified
- Recurring Diagnostic Bushel canon ratified (first cron live)
- AI-Agnostic Platform Principle pheromonated (BP021 Founder direct)
- Naming precedence supersede (Coffee/Breakfast > marker > auto-detect)
- Pollination dispositions drafted (this paper's parent document)
- Two NEW paper scaffolds (Under the Hood + Fly on the Wall — *this paper*)
- 14 entries appended to Historical Timeline

**One Founder day**.

**Voice notes**:
- Pace: slowest section. The receipts are the signal; let them breathe.
- Use the bullet list AS the climax. Don't editorialize the count.
- One closing sentence — Founder's voice, not Bishop's: something resonant. Reserve a Founder direct quote from BP021 closeout for this slot (not yet written; Founder fills at fire-time prose-pass).
- Preserve "One Founder day" as the final two words. That's the title's payoff.

---

## Composition with prior canon

- All BP021 ratifications listed in `BP021_POLLINATION_DISPOSITIONS.md` (the parent document)
- `bishop_coffee_manual_hand_crank_session_open_canon_bp017.eblet.md` — §1 anchor
- `BUSHEL_7_COST_RECEIPT_BP021.json` — §2 + §3 + §7 receipts
- `third_gear_default` canon — §4 anchor
- `recurring_diagnostic_bushel_canon_bp021.eblet.md` + `lb_frame_ai_agnostic_platform_principle_bp021.eblet.md` — §5 anchors
- `MECHANICAL_COMPUTER_LIVING_RECEIPTS.md` — sister paper that the receipts in §7 will eventually fold into

## Reading-time + ranking

- Target read-time: 6-8 minutes (Pudding-tradition tier, not Skipping-Stones-tier)
- Skipping Stones progression: At a Glance / More Details / In Depth — 3 layered versions for cross-paper daisy chain (per Skipping Stones canon)

## Pudding candidacy

This paper is also a **Pudding candidate** — narrative-anchored, present-tense, food-metaphor-class. Could occupy Pudding slot #192+ if Founder picks. Concurrent Distribution Grid (#2141) eligible.

---

*Bishop scaffold BP021 turn 41 — Founder writes prose at fire-time. The artifact testifies to the day that produced it. Brick Wall, recursive.*
