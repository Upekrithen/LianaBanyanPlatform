# BRIDLE v10.7 — Rule 11 Proposed Wording

**Status**: B127 SCAFFOLD pending Founder ratification.
**Predecessor**: BRIDLE v10.6 (10 rules + 2 candidates per B125 Toolsmith Scribe entries).
**Filing target**: BISHOP_DROPZONE/UNDER_THE_HOOD/THE_BRIDLE_V10.md (when ratified, replace with v10.7).
**Sister B127 ratification**: project_master_of_chaos_sound_judgment.md (which establishes the Inviolable rule-class that BRIDLE Rule 11 will join).

---

## Proposed Rule 11 — Long Haul AND Fix Along the Way (Both, Always)

### Wording (3 candidates ranked by Bishop judgment)

#### Candidate 1 (Bishop pick — concise, paired-discipline explicit)

> **Rule 11. Long Haul AND Fix Along the Way. Both, Always.**
> Build for durability without taking shortcuts; AND while building, fix the rot you encounter on the way. Neither alone is sufficient. Long Haul without Fix Along the Way accumulates broken windows; Fix Along the Way without Long Haul produces patched-together architecture. The discipline is paired. Apply both at every decision point.

#### Candidate 2 (more rule-book register)

> **Rule 11. Build durably; un-rot as you go.**
> Every architectural decision must satisfy two tests simultaneously: (a) does this support 100-session resilience? AND (b) does this leave the surrounding code free of new or pre-existing rot? If a candidate solution passes (a) but creates or ignores rot, do not ship — refactor first. If a candidate solution removes rot but compromises durability, do not ship — find a path that satisfies both.

#### Candidate 3 (Founder voice register, anachronistic-keystone density)

> **Rule 11. Slow is smooth, smooth is fast — and an ounce of prevention is worth a pound of cure.**
> Build for the Long Haul. Fix Along the Way. Both, Always. The shortcut you take today is the rot that compounds tomorrow; the rot you ignore today is the broken window that licenses every subsequent shortcut. Discipline both halves of the pair, every time.

### Class

**Inviolable** (per project_master_of_chaos_sound_judgment.md three-class taxonomy). Cannot be bent or broken. This is by design — the discipline only works if it operates structurally, not as guidance.

Founder caveat B127 (verbatim): "Since BRIDLE is in the latter category, then I want to be careful what we make impossible." Bishop concurs: making Rule 11 inviolable WILL constrain future "ship now, fix later" decisions. That constraint is the point. If a future Founder-or-Knight wants to bend it, they have to either:
- Argue for promoting the Reminder Scribe to handle the case (different substrate; Reminder Scribe IS bendable by design)
- Demote Rule 11 to v10.8 with explicit Founder ratification of the demotion event

That auditable demotion path replaces silent rule-bending.

### Empirical anchor (B127)

This very session is the empirical case for Rule 11:
- KNIGHT_QUEUE.md grew silently to 407 megabytes across approximately 200,000 bad rebuilds because earlier sessions saw the failed render-knight-queue step and didn t fix it (Long Haul present, Fix Along the Way absent).
- B097-era rules engine surfaced "123 Crown Jewels / 1,401 claims / 8 provisionals" as authoritative truth long after canonical numbers had moved.
- Both fixed B127 with paired-discipline application: regex repair (root cause) + size cap (defensive future) + canonical sync (forward propagation).

Without Rule 11 elevated to inviolable, the next pattern of this class will silently accumulate again.

### Companion: Reminder Scribe

Per Founder B127 ratification ("We need a Reminder Scribe AND extend BRIDLE to v10.7") — Rule 11 is the inviolable rule; Reminder Scribe is the bendable wisdom-substrate that surfaces context for HOW to apply Rule 11 in specific situations. The pair is:
- BRIDLE Rule 11: floor (cannot bend)
- Reminder Scribe: discernment (Sound Judgment apply at trigger points)

See project_master_of_chaos_sound_judgment.md for the three-class taxonomy.

## Phase E for ratification

When Founder picks a wording variant:
1. Bishop edits BISHOP_DROPZONE/UNDER_THE_HOOD/THE_BRIDLE_V10.md to v10.7 (or new v10.7 file with v10.6 archived)
2. BRIDLE Scribe (the Cathedral Scribe) gets a new tablet recording the v10.7 ratification + the chosen wording verbatim
3. Knight prompt scaffold in PROMPT_KNIGHT_K*_SCAFFOLD.md template adds Rule 11 to the discipline-preamble list
4. Toolsmith TS-XXX entry filed (for the discipline-extension-ceremony pattern)
5. Synapse cluster (~3-5) capturing the ratification context

## Open questions for Founder ratification

- Wording pick (1 / 2 / 3 above)?
- Should the "Both, Always" pairing get its own punctuation prominence (em-dash, ALL CAPS, italics)?
- Class confirm: Inviolable per the three-class taxonomy?
- Reminder Scribe substrate creation gated on this BRIDLE update or independent?

---

*Filed B127 by Bishop, 2026-04-26. Long Haul AND Fix Along the Way. Both, Always.*
