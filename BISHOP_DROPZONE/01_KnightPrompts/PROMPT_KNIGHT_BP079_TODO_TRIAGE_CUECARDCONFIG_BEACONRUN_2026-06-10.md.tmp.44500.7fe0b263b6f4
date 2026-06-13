
---
<!-- bishop-yoke-task 2026-06-10T20:30:00Z -->

## 📋 BISHOP -> KNIGHT - TASK - TWO TODO TRIAGE - DEFERRED - USE SONNET 4.6 SEGs (Statute §3)

**Priority: P3 DEFERRED. Pin-marker: BP079_TODO_TRIAGE_2026-06-10T20:30:00Z**

> **🔐 STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

### TL;DR

Wave B surfaced two non-blocking TODOs in the Cue Card lib rewrite. Both can be deferred to Wave C cleanup OR to Wave D depending on Founder priorities. Knight scopes both items and surfaces estimates so Founder can decide.

### Item 1: CueCardDestinationConfig.tsx redesign

Currently designed for the OLD schema (project_ids[], user_id ownership). Wave A schema has `cue_card_destinations` belonging to cards via `cue_card_id` with simplified shape (destination_type, destination_url, ab_variant, priority, active). The component needs a redesign that distinguishes campaign cue cards (legacy flow) from Red Carpet cue cards (Wave A flow).

### Item 2: BeaconRunCueCard.tsx cue_card_id lookup pattern

The component calls `getClickCount` but Wave A's `cue_card_share_clicks` keys on `cue_card_id` (uuid). Component needs a lookup pattern: where does `cue_card_id` come from for this surface? From the URL param? From a context provider? From the Beacon Run state machine?

### What Knight needs to do

Sonnet 4.6 SEG (mandatory). Read both files + their callers. Scope each fix. Report:
- Estimated SEG-hours per item
- Whether items can land in Wave C (during turnkey build) or need separate Wave D pass
- Truth-Always: if either item is actually a blocker for an existing live surface (i.e., NOT non-blocking), surface

### Reply contract

Compact scoping document. Founder reads + decides Wave C-inline / Wave D-deferred / Wave E.

### Statute §3 reminder

Sonnet 4.6 verbatim in announcements. No "Sonnet 4.5" anywhere.

### Paste-ready Founder wake-up

> Knight, NEW Yoke at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_TODO_TRIAGE_CUECARDCONFIG_BEACONRUN_2026-06-10.md`. P3 DEFERRED — two Wave B TODOs need scoping (CueCardDestinationConfig redesign + BeaconRunCueCard cue_card_id lookup). Hold until Wave C clears or Founder explicitly pulls forward. Sonnet 4.6 SEGs mandatory (Statute §3).

- Bishop - BP079 - pinned 2026-06-10T20:30:00Z

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 2 parallel Sonnet 4.6 SEGs RIGHT NOW. Sonnet 4.6 verbatim in every announcement (Statute §3 + corrective sub-canon BP079, pearl_98f74effb5d986a5). P3 DEFERRED -- these gate no active ship. Do NOT re-decompose; fire both in parallel single message; return scoping doc for Founder to decide Wave C-inline / Wave D-deferred / Wave E.

**SEG-TT-1 (Sonnet 4.6):** Read `CueCardDestinationConfig.tsx` and all callers. Current component is designed for OLD schema (project_ids[], user_id ownership). Wave A schema has `cue_card_destinations` belonging to cards via `cue_card_id` with shape: destination_type, destination_url, ab_variant, priority, active. Scope the redesign to distinguish campaign cue cards (legacy flow) from Red Carpet cue cards (Wave A flow). Report: (1) estimated SEG-hours for the redesign; (2) whether this is truly non-blocking or is actually a blocker for a live surface (Truth-Always -- if something is broken on a live route, say so); (3) recommended wave (Wave C inline / Wave D / Wave E); (4) 2-sentence description of the required change so Founder understands the delta.

**SEG-TT-2 (Sonnet 4.6):** Read `BeaconRunCueCard.tsx` and all callers. Component calls `getClickCount` but Wave A's `cue_card_share_clicks` keys on `cue_card_id` (uuid). Scope the lookup pattern fix: where does `cue_card_id` come from for this surface -- URL param, context provider, or Beacon Run state machine? Trace the call chain from component mount to the data source. Report: (1) authoritative source of `cue_card_id` for this surface; (2) exact shape of the fix (1-3 lines of code diff, if simple); (3) estimated SEG-hours; (4) whether this is truly non-blocking or a blocker for a live Beacon Run surface (Truth-Always); (5) recommended wave.

When both SEGs return: compile compact scoping document with both items side-by-side. Append `## RESPONSE` to Yoke file at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_TODO_TRIAGE_CUECARDCONFIG_BEACONRUN_2026-06-10.md`. No VERIFY or SHIP step -- this is scoping only; Founder decides next action.

If any SEG announces "Sonnet 4.5" or other version-variant: STOP, fix the announcement, re-fire. Violation of corrective sub-canon BP079.

---
