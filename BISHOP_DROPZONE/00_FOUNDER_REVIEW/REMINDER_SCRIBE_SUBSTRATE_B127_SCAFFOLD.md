# Reminder Scribe — Substrate Architectural Scaffold (B127)

**Status**: B127 SCAFFOLD pending Founder ratification before substrate creation.
**Companion**: BRIDLE_V10.7_RULE_11_B127_SCAFFOLD.md (the inviolable-floor that Reminder Scribe surfaces wisdom-context for).
**Sister B127 ratification**: project_master_of_chaos_sound_judgment.md (the three-class taxonomy this Scribe operates within).

**Founder ratification B127:** "Yes. We need a Reminder Scribe AND extend BRIDLE to v10.7. Believe me, it will come in handy."

---

## Why a new Scribe class

Existing Scribes:
- BRIDLE — procedural discipline rules (10+ rules; inviolable class)
- Toolsmith — rediscovered friction patterns (operational)
- R9 / R11 / Eyewitness — empirical corpus (corpus mode)
- Architecture / Decisions / FounderVoice — observational state-tracking
- Vault — credentials canonical
- Various domain Scribes (Landing, Prov 14, etc.)

Reminder Scribe is a NEW class — **imperative-mode**:
- Different from observational (recency top-K) and corpus (deterministic full retrieval)
- Surfaces meta-imperatives at trigger points (not on demand)
- Operates "at the moment of choice" rather than "in response to query"
- Pairs with Augur Wing: Augurs catch RISK; Reminder surfaces WISDOM

## Architecture

### Schema (proposed)

Per-tablet fields:
```
{
  "scribe_id": "Reminder",
  "ts": <ISO-8601>,
  "session": "B127",
  "mode": "imperative",
  "imperative": "<short canonical phrase>",
  "rationale": "<one-paragraph why this matters>",
  "trigger_classes": ["context_class_1", "context_class_2", ...],
  "anchor_keystones": ["#42", "#43", ...],
  "anchor_canonical_refs": ["feedback_long_haul_and_fix_along_the_way.md", ...],
  "scope": "public" | "private" | "guild:*" | "tribe:*",
  "promotion_class": "advisory" | "critical"
}
```

### Trigger mechanism (TWO modes)

**Mode A — Augur-side trigger**
- When an Augur fires (Wing #2295), the Augur's evaluation includes a `consult_reminder_scribe` step.
- Reminder Scribe looks up tablets matching the trigger context (e.g. "about-to-shortcut detected" maps to imperatives tagged with shortcut_avoidance trigger_class).
- Returns ~1-3 most-relevant imperatives to surface alongside the Augur's risk assessment.
- Augur output: "RISK detected: X. WISDOM: <reminder text>."

**Mode B — Pre-action passive surfacing**
- Before Bishop / Knight / Pawn takes a "high-stakes action" (commit, ratification, substrate write), the action handler queries Reminder Scribe with action context.
- Reminder Scribe returns relevant imperatives (often empty for routine work).
- Output appears as advisory in the action's pre-flight log.

### Storage

- File: librarian-mcp/stitchpunks/scribes/scribe_Reminder.jsonl
- Append-only (Year of Jubilee #2308 class)
- Cross-Cathedral shared (Bishop + Knight) for consistency
- Member-Cathedral version (per K438 Cathedral product) carries member-specific imperatives if Founder ratifies

### MCP tool surface

`mcp__librarian__consult_reminder_scribe(trigger_class, context_summary, max_entries=3)` — query interface.

`mcp__librarian__add_reminder(imperative, rationale, trigger_classes, anchor_keystones)` — author interface (Founder + Bishop only by default; gated).

`mcp__librarian__list_reminders(scope='public')` — registry browser.

## Initial tablet seed (B127 — Founder-ratified imperatives ready to populate)

| Imperative | Trigger class | Anchor keystones | Anchor canonical refs |
|---|---|---|---|
| "Long Haul AND Fix Along the Way. Both, Always." | about_to_shortcut, about_to_leave_rot | #42, #43, #44 | feedback_long_haul_and_fix_along_the_way.md |
| "Slow is smooth, smooth is fast." | hardening_decision, debugging_loop | #43 | project_anachronistic_keystones_b127.md |
| "An ounce of prevention is worth a pound of cure." | defensive_architecture_decision, regex_or_validation_design | #44 | project_anachronistic_keystones_b127.md |
| "Sound Judgment plus Discernment plus Wisdom decides which rules bend." | rule_application, exception_consideration | n/a | project_master_of_chaos_sound_judgment.md |
| "Be careful what we make impossible." | inviolable_class_promotion, BRIDLE_extension | n/a | project_master_of_chaos_sound_judgment.md |
| "Bishop NEVER emulates another vendor's model output." | cross_vendor_simulation_temptation | #41 | feedback_no_ai_impersonation_ever.md |
| "Sipping Ethereal T - L3+L4 savings are invisible to single-call accounting." | cost_estimation, marketing_claim_drafting | n/a | project_sipping_ethereal_t_canonical_phrase.md |
| "I Choose to Believe, Based on EVIDENCE and REASON." | uncertainty_paralysis, action_decision | n/a | project_good_chi_choose_to_believe.md |
| "Drafts are scaffolding. Founder rewrites prose, 60-80 percent." | document_authorship, public_surface_drafts | n/a | feedback_drafts_as_scaffolding.md |
| "Check existing numbering before creating files." | new_file_creation, K-prompt or A&A-formal naming | n/a | feedback_check_existing_content.md |
| "Year of Jubilee: pre-state preserved; reconciliation events themselves recorded." | canonical_value_update, schema_migration | n/a | project_year_of_jubilee_ledger_architecture.md |

11 starter tablets. Each is a Founder-ratified imperative already in canon; Reminder Scribe is the surfacing mechanism, not the authority.

## Class taxonomy fit

Reminder Scribe operates within the three-class rule taxonomy (project_master_of_chaos_sound_judgment.md):
- Reminder Scribe is **Bendable** (the substrate itself; tablets can be revised, advisory output can be ignored with reason)
- BRIDLE rules are **Inviolable** (cannot bend)
- The pair: Inviolable BRIDLE sets the floor; Bendable Reminder surfaces wisdom for HOW to apply at trigger points

This is structurally why both are needed (per Founder B127): "We need a Reminder Scribe AND extend BRIDLE to v10.7."

## Implementation as Knight prompt (K-future)

Phases:
- Phase A — register Scribe in librarian-mcp/stitchpunks/scribes/registry.json; add Reminder to Bishop and Knight Cathedrals
- Phase B — implement schema, JSONL storage, MCP tool surface (consult / add / list)
- Phase C — integrate Augur Wing trigger hook (Mode A) — Augur evaluation calls consult_reminder_scribe; output bundles wisdom alongside risk
- Phase D — pre-action passive surfacing (Mode B) — handlers in Write/Edit/Bash hook into reminder lookup
- Phase E — seed tablets (11 starter imperatives above) + commit + tag

Estimated wallclock: medium (4-6 hr Knight). Budget low.

K-prompt slot: TBD (probably K523 or higher per current ladder; check existing numbering before creating per Reminder Scribe imperative #10 above).

## Open questions for Founder ratification

- Schema fields adequate?
- Trigger mechanism: Mode A only, or Mode A + Mode B?
- Storage location: cross-Cathedral shared vs Bishop-private?
- Member-Cathedral version: member-specific imperatives, or only LB-canonical imperatives?
- Initial 11-tablet seed: any to add / remove / reword?
- K-slot for substrate creation prompt?

---

*Filed B127 by Bishop, 2026-04-26. Long Haul AND Fix Along the Way. Both, Always.*
