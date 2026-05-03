---
name: Braided Thread Calendar Visualization
description: A time-visualization system rendering a member's week as seven semantically distinct life-domain threads braided together in a unified view, revealing cross-domain patterns with a single weekly adjustment suggestion framed as a question rather than a prescription.
type: aa_formal
innovation_id: "2159"
ratification_session: B082
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - braided thread calendar visualization
  - seven thread calendar
  - week visualization life domains
  - aa formal 2159
  - week reflection panel one adjustment
  - cross-domain time pattern calendar
  - braided temporal thread view
  - non-judgmental pattern mirror calendar
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL — Innovation #2159
## Braided Thread Calendar Visualization
## Bishop B082 | April 5, 2026

---

## STATUS: Crown Jewel Candidate

## SOURCE: K307 V2 Calendar (B080)

---

## DESCRIPTION

A time-visualization system that renders a member's week as seven semantically distinct threads (personal, family, business, coalition, route, defense, education) braided together in a unified view. Rather than a traditional grid calendar showing isolated events, the system reveals cross-domain patterns — how time commitments in one life domain affect others. A Week Reflection Panel auto-summarizes time distribution and suggests exactly ONE adjustment per week, framed as a question ("Do you want to keep saying yes to this pattern?"), never as a prescription.

## MECHANICS

1. **Seven canonical thread types**: personal, family, business, coalition, route, defense, education — stored as TypeScript enum, each distinguished by BOTH color AND icon (accessibility requirement)
2. **BraidedWeekView** component renders all seven threads in a single temporal visualization where overlaps and gaps are visually apparent
3. **ThreadEventTile** renders individual events with their thread color + icon, placed within the braided view
4. **WeekReflectionPanel** (dominant card) auto-aggregates: "6 hours coalition, 0 education, 2 housing" — raw time distribution without judgement
5. **One adjustment suggestion per week**: Rule-based heuristic (e.g., ">5h coalition AND 0 education" triggers "add one learning block"). NEVER multiple suggestions. ONE.
6. **PatternHintCard** frames questions, not prescriptions: "Do you want to keep saying yes to this pattern?" — never "You are over-committed" or "You should reduce X"
7. **ThreadSourceManager** maps each thread to existing domain tables (Family Table, Crew Call, etc.) with on/off toggles
8. **No red states**: Amber for imbalance. "Room to adjust" not "Declining." Design doctrine rule 9 enforced.

## PRIOR ART DISTINCTION

- **Google Calendar / Outlook / Apple Calendar**: Grid-based event calendars. No semantic threading, no cross-domain pattern analysis, no reflection panels. Events are isolated objects, not braided narrative threads.
- **Notion Calendar / Fantastical**: Enhanced calendars with integrations. Still event-grid paradigm. No seven-thread semantic model or auto-reflection.
- **RescueTime / Toggl / Clockify**: Time-tracking tools that categorize time post-hoc. They REPORT where time went. They do not VISUALIZE threads braided together in real-time or suggest adjustments framed as questions.
- **No prior art found** for: (a) seven canonical life-domain threads rendered as a braided temporal visualization, (b) a reflection panel limited to ONE adjustment suggestion framed as a question, (c) non-judgmental pattern-mirror language policy ("Room to adjust" not "Over-committed").

## CLAIMS

1. A calendar visualization system comprising: seven semantically distinct life-domain threads rendered in a unified braided temporal view; each thread distinguished by both color and icon for accessibility; cross-domain patterns made visible through thread overlap and gap visualization.

2. A weekly reflection method comprising: automated time-distribution aggregation across seven life domains; generation of exactly one adjustment suggestion per week; said suggestion framed as a question rather than a prescription, enforcing non-judgmental language constraints.

3. A thread-source mapping system comprising: configurable connections between calendar threads and cooperative platform domain tables; member-controlled on/off toggles per thread; pattern-based heuristic rules that surface cross-domain insights without prescriptive direction.

---

*Bishop B082 — Innovation #2159 threshed from K307 V2 Calendar*
