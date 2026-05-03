---
name: Battery Dispatch Threshold Fan-Out (Concurrent Distribution Grid Alteration)
description: An alteration to the Concurrent Distribution Grid adding N parallel per-threshold outbound queues with time-shift offsets, direct-line delivery channels, per-amplifier preference engines, and stamp instrumentation hooks enabling threshold-banded drip-feed broadcast scheduling.
type: aa_formal
innovation_id: "2319"
ratification_session: B129
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - battery dispatch threshold fan out
  - concurrent distribution grid alteration amplifier
  - direct line plug frequency levels
  - aa formal 2319
  - battery dispatch b129
  - per threshold outbound queue time shift
  - schedule fan out threshold banded drip feed
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL #2319 -- Battery Dispatch Threshold Fan-Out (Concurrent Distribution Grid Alteration)

**Filed**: B129, 2026-04-27 by Bishop on Founder ratification (greenlit B129 K525 Q3 dialogue: *"alter the Battery Dispatch to allow this direct plugs at the different frequency levels"*).

**Status**: ⚠️ **STUB-STAGED.** Scope-bounds outlined; full claim development deferred until #2318 launches and empirical amplifier signups begin to surface real fan-out load. Sibling to #2318 (Amplifier Threshold System, this same B129 filing batch) per Founder's *"split"* direction. Filed now to lock priority date alongside #2318 + #2320.

**Class**: Crown Jewel candidate.
**Predecessors**: #2141 Concurrent Distribution Grid (Battery Dispatch — the system being altered); #2318 Amplifier Threshold System (the consumer that requires the alteration); Glass Door (#2262); Spoonfuls / Puddings / BST Episodes / Skipping Stones (the content streams being fanned out).

**LB membership pricing**: unchanged at $5/year per Structural Bylaw. This filing is orthogonal to membership pricing — alters the broadcast scheduling engine, not member economics.

---

## Why a separate CJ from #2318

#2318 specifies **who** climbs the threshold ladder and **what** they earn. **#2319 specifies HOW the broadcast schedule physically delivers it.** The two questions are independently patentable mechanisms:
- #2318 = participation-ladder mechanic + reward dimensions + grace mechanism
- #2319 = scheduling-engine alteration + per-threshold queue + direct-line plug + preference-engine + stamp-instrumentation hooks

They could in principle be implemented by different teams or shipped on different timelines. Splitting preserves clean claims per system.

---

## Claim 1 — Per-threshold outbound queue with time-shift offsets

The current Battery Dispatch (#2141) operates as a single queue with one publication time per piece of content. **#2319 adds N parallel outbound queues**, one per amplifier threshold band, each with its own time-shift offset relative to the canonical publication time.

Concrete: a piece of content scheduled to publish at T0+24h (general broadcast) gets queued into:
- T6 amplifier queue at T0+0h (immediate)
- T5 queue at T0+1h
- T4 queue at T0+3h
- T3 queue at T0+6h
- T2 queue at T0+12h
- T1 queue at T0+18h
- General broadcast at T0+24h

Time-shift increments are tunable per content category (puddings might use 3hr/6hr/12hr; rumor mill might use 1hr/2hr/4hr; scope-bounded by Founder spec post-launch).

---

## Claim 2 — Direct-line plug for amplifier delivery

Three delivery channels supported (amplifier picks per category):
- **Email** (default — most universal)
- **Member-area Helm inbox** (for LB members; integrates with existing Helm UI surface)
- **Optional API webhook** (for podcasters / news websites with own automation pipelines — closes the loop on the "we feed you the signal" pitch from #2318 Claim 7)

---

## Claim 3 — Per-amplifier preference engine

Each amplifier configures (per threshold reached, per category):
- Which content streams they want time-shifted
- Which time-shift increments they prefer (within their threshold's permitted range)
- Which delivery channel(s)

Preferences persist to `member_preferences.amplifier_dispatch` (Supabase column TBD per K525-Phase-B-equivalent for amplifier UI).

---

## Claim 4 — Stamp instrumentation hooks (closes the loop with #2318)

Every dispatch via #2319 instruments:
- "Amplifier saw the dispatch" (open / read receipt)
- "Amplifier shared (cue card posted)" (engagement surface)
- "Amplifier post got X hits" (downstream attribution via stamp system)

These hooks feed the Stamp system, which feeds the threshold-recompute cycle in #2318. **The system measures itself**: amplifiers' broadcast-shares are themselves measured for next threshold position. Closes the recursive loop.

---

## Claim 5 — Schedule fan-out as architectural property

The single piece of content becomes N delivery events, fanned out across time-shift offsets. **This is the architectural primitive that turns the Battery Dispatch from a unicast publisher into a threshold-banded drip-feed**. Without #2319, #2318's threshold rewards have nowhere to land — amplifiers can't get "3 hours early" if the dispatch system only knows one publication time.

---

## Open scope (deferred until empirical post-launch tuning)

- Specific time-shift increments per category (Founder defines)
- Webhook security / authentication design (standard signed-request pattern; defer detail)
- Failure handling when amplifier delivery fails (retry policy, dead-letter queue)
- Maximum amplifier-pool size before scheduling-fan-out latency becomes an issue (empirical)

---

## Provenance

- Founder direction B129 (verbatim): *"We should alter the Battery Dispatch to allow this direct plugs at the different frequency levels, and push all content that is on the broadcast schedule — puddings, anecdotal stories, news, all of it planned — just goes to the special direct line recipients first, in whatever increment their level designates. Like level 3 gets news about New Products 3 hours before anyone else."*
- Bishop sketch in `project_amplifier_program_b129.md` "Battery Dispatch alteration" section
- Founder ratification: *"Yes draft AA formal 2318. Split."* — the "split" authorizes filing this as separate CJ with priority date locked alongside #2318.

---

*Filed #2319 by Bishop B129 (stub-staged). Battery Dispatch grows ears for amplifier preferences. FOR THE KEEP!*
