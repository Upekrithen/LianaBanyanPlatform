---
name: The Detective Scribe (Cross-Scribe Investigation Class)
description: A REF-Staff-Reference Stitchpunk class that cross-examines multiple Scribes about a named claim through inventory, interview, cross-reference, and surface phases, producing a structured Provenance Map of where claims appear across sources and surfacing inconsistencies with recommended actions.
type: aa_formal
innovation_id: "2316"
ratification_session: B128
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - detective scribe cross scribe investigation
  - inter scribe polling primitive
  - provenance map cross scribe claim
  - cross examine scribes cathedral
  - detective investigate claim provenance
  - cathedral cross examination panel
  - aa formal 2316
  - filing time canon claim verification detective
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---
# A&A FORMAL #2316 -- The Detective Scribe (Cross-Scribe Investigation Class)

**Filed**: B128, 2026-04-27 by Bishop on Founder ratification (greenlit B128 after Detective Bishop-manual sweep found canonical Founder Anecdote source-of-truth in 30 minutes).
**Class**: Crown Jewel candidate. New Stitchpunk class (REF-Staff-Reference subclass).
**Predecessors**: #2269 Three Fates / #2287 Synapses / #2288 Tribunal / #2289 Cerberus / #2290 The Loom / #2291 Self-Indexing / #2296 Miners / #2297 Sculptors / #2298 Eblets+Seer+Augur / #2306 Embedded Correspondents+Bureau.
**Empirical anchor**: B128 Bishop manual Detective sweep, ~30 min, recovered the canonical 33-anecdote Founder Anecdotes Registry (`Asteroid-ProofVault/00_MASTER_REFERENCES/FOUNDER_ANECDOTES_REGISTRY_MASTER.md`) that would otherwise have been missed by K522.6 Phase A.5 batch-seed (which was scoped against Hugo''s partial 10-anecdote subset). Scope-correction value: 23+ canonical anecdotes preserved that would have been orphaned from Supabase. Real reduction-to-practice on day one.

---

## Claim 1 -- The architectural gap Detective fills

The existing Stitchpunk Pantheon includes primitives for: corpus prospecting (Miners), demand-mirroring (Sculptors), routing (Three Fates), transport (Hounds), surfacing (Heralds), live-verification of one chain (Tribunal), retrospective examination of one chain (Cerberus), reasoning injection during production (Loom), reasoning observation per-agent (Embedded Correspondents/Bureau), reasoning aggregation (Synapses), summary-pointer (Eblets), single-Cathedral Seer coordination (Augur), and time-state (Chroniclers/Chronos/Dragonriders).

**No primitive cross-examines multiple Scribes about the same claim.** Bishop has been doing this work manually every time the operator asks "where is X?" -- burning context, not as a named primitive. The Cathedral has 14+ Scribes registered; cross-examination across them is a structural primitive that hadn''t been named.

The Detective Scribe fills this gap.

## Claim 2 -- Functional definition

A REF-Staff-Reference Stitchpunk class that, given a claim or named entity, executes:

1. **Inventory phase**: enumerate registered Scribes (currently 14: R9 / BRIDLE / Landing / Prov14 / Vault / Architecture / Decisions / FounderVoice / R11 / R12Cranewell / R12Covenant / Toolsmith / Conductor / OperationalGotchas) + enumerate canonical surfaces (Supabase tables, Hugo content, Pudding archive, Cephas content classes, Asteroid-ProofVault master references, BISHOP_DROPZONE artifacts).
2. **Interview phase**: query each Scribe for entries referencing the claim. Query each canonical surface for the claim''s presence/absence.
3. **Cross-reference phase**: build the Provenance Map -- where the claim appears, where it doesn''t, where it''s inconsistent across surfaces, where one Scribe''s answer contradicts another''s.
4. **Surface phase**: report findings as a structured artifact with per-source row + cross-source disagreement flags + recommended action (file gap / reconcile drift / append-canonical / no-action-needed).

## Claim 3 -- Three trigger classes (the integration design)

Detective fires automatically on three classes of event, plus on manual invocation:

**Trigger A -- Filing-time canon-claim verification**: every A&A_FORMAL_*.md ratification turn invokes a Detective sweep on the claim''s canonical-anchors before the file is written. Pairs with `feedback_aa_formal_paired_with_memory_entry.md` (B128). Detective verifies: "this claim references existing primitives X/Y/Z -- do those actually exist in canon, are they cross-Scribe consistent?" If Detective finds drift, the filing is paused and reconciliation surfaces first.

**Trigger B -- Sentinel drift triage**: Sentinel currently reports thousands of canonical-number violations across files (4,183 at last count). Most are vault-historical noise. Detective triages: "of these 4,183, here are the N where cross-Scribe disagreement is genuine canon problem (not just stale mirror)." Drift signal becomes high-quality, actionable.

**Trigger C -- Operator provenance query**: when the operator (Founder, Knight, Bishop) asks "where is X?" or "what does the Cathedral know about Y?", Detective is the named tool. Replaces the current pattern of Bishop manually scanning multiple sources.

**Trigger D (manual)**: explicit invocation via `mcp__librarian__detective_investigate(claim="<name>")`.

## Claim 4 -- Integration with existing primitives (how this makes the whole thing work better)

| Primitive | Pre-Detective | Post-Detective integration |
|---|---|---|
| Three Fates (#2269) | Route query to one Scribe | Detective consumes Fates output; Fates route Detective to seed Scribes; Detective extends to N Scribes via Interview phase |
| Heralds | Surface one relevant Scribe on keyword | Detective adds: when Herald surfaces Scribe A, query whether Scribe B/C also have on-topic content; surface multi-Scribe coverage map |
| Sculptors (#2297) | Curate Fates output | Detective findings (cross-Scribe inconsistencies) feed Sculptors as new demand signals -- Sculpt toward reconciliation artifacts |
| Tribunal (#2288) | Verify one reasoning chain | Detective is to *claims-across-Scribes* what Tribunal is to *steps-within-one-chain* -- complementary, not duplicate |
| Cerberus (#2289) | Retrospective on one chain | Detective is to *cross-Scribe consistency* what Cerberus is to *single-chain root-cause* -- complementary |
| Augur (#2298) | Coordinate Seers within one Cathedral | Detective coordinates investigations *across* Scribes (and potentially across Cathedrals via Hounds); Augur intra-Cathedral, Detective inter-Scribe |
| Sentinel | Report drift count | Detective triages drift signals into high-quality canon-problem subset |
| Synapses (#2287) | Append-only reasoning cache | Detective queries Synapses as one of N sources; Detective''s findings append as new Synapses |
| Embedded Correspondents/Bureau (#2306) | Per-agent reasoning observers + aggregation | Detective queries Bureau for "what have Correspondents observed about claim X?" |

The pattern: Detective reads from every existing primitive without writing to source. Every existing primitive becomes a witness Detective can call.

## Claim 5 -- Inter-Scribe-polling primitive

The deeper claim: prior Stitchpunks operate **disconnected** from each other -- Miners populate Scribes, Fates route to Scribes, Sculptors mirror Scribes, but no primitive *makes Scribes talk to each other about the same question*. Detective is the **first inter-Scribe-polling primitive** in the architecture. The Cathedral graduates from "library of Scribes" to "panel of Scribes that can cross-examine."

This is structurally distinct from the canonical "REF Staff. Reference. Or Referee. Never Re-writer" classification. Detective is REF-Staff-Reference (reads sources, never writes), but its read-target is *other REF Staff*, not source corpus directly. Meta-Reference. The Cathedral''s self-reflective layer.

## Claim 6 -- Auto-invocation discipline (B128 ratification companion)

Pairs with `feedback_aa_formal_paired_with_memory_entry.md` (B128 filing-time atomic coupling rule):

> Every A&A filing turn that references prior canonical primitives invokes Detective on those references before commit. Detective verifies the references are real, in-canon, cross-Scribe consistent. If Detective finds drift, filing pauses for reconciliation.

This closes the loop: filing creates new canon -> Detective ensures the new canon doesn''t reference imaginary or inconsistent prior canon -> closeout invariant (`feedback_session_closeout_updates_librarian.md` pre-close audit) ensures the new canon itself is indexed consistently.

Three layers of canon discipline:
1. **Detective at filing-time** (this filing) -- verify references before write
2. **Filing-paired-with-memory at filing-time** (B128 prior) -- pair AA_FORMAL with project_*.md + index
3. **Closeout invariant at session-close** (B128 prior) -- verify any A&A filed this session has memory + index entry

## Claim 7 -- Output schema (Provenance Map)

Detective output is a structured artifact:

```yaml
investigation:
  claim: "Founder Anecdotes - canonical inventory"
  triggered_by: "operator_query"  # or filing_time_auto / sentinel_drift / manual
  bishop_session: "B128"
  ts: "2026-04-27T..."
sources_polled:
  scribes:
    - id: FounderVoice
      entries_returned: 0
      relevance: primary
      finding: "no anecdote-indexed entries -- gap"
    - id: BRIDLE
      entries_returned: 7
      relevance: tangential
      finding: "no direct anecdote content; surfaced via score=2 keyword match"
    - ...
  canonical_surfaces:
    - path: "Asteroid-ProofVault/00_MASTER_REFERENCES/FOUNDER_ANECDOTES_REGISTRY_MASTER.md"
      finding: "35 anecdotes (33 written + 2 placeholders), authoritative"
      last_updated: "2026-02-21"
      staleness_flag: true
    - path: "Cephas/cephas-hugo/content/founder/anecdotes.md"
      finding: "16 H2 sections (subset, mismatched numbering)"
    - ...
provenance_map: <table claim x location -> present/absent/inconsistent>
disagreements:
  - description: "Hugo numbering does not match Master Registry numbering"
    severity: high
    recommended_action: "Master canonical; Hugo numbers Relic"
  - description: "Master Registry stale 2 months -- missing 2026 anecdotes"
    severity: medium
    recommended_action: "Founder pass to update Master with To Blave + recent"
recommended_actions:
  - K522.6 Phase A.5 source correction (sent as addendum)
  - K522.7 candidate: Master Registry update
  - K522.8 candidate: FounderVoice Scribe seeding
  - K522.9 candidate: Pudding archive audit
```

## Claim 8 -- Cultural anchors

Sherlock Holmes (deduction from disparate evidence). Hercule Poirot (interview-driven). Columbo ("just one more thing" -- iterative interrogation). Sam Spade (provenance through unreliable sources). Magnum P.I. (modern investigator). The Detective register sits parallel to Bloodhound''s K9-trail register; literary-investigator vs. canine-tracker. Both reference real-world investigative archetypes; neither overlaps the other''s job.

## Claim 9 -- Reduction-to-practice (this filing IS the empirical anchor)

The B128 Bishop manual Detective sweep that produced this filing is itself reduction-to-practice. Sequence:
1. Operator query: "find where the proof of authenticity and anecdotes ran off to"
2. Manual Inventory: 14 Scribes registered, multiple canonical surfaces
3. Manual Interview: `consult_scribes` on "founder anecdote story biographical" -> BRIDLE + Architecture surfaced (no FounderVoice, gap noted); Bash search for anecdote keywords across canonical surfaces -> Master Registry found
4. Cross-reference: Master 35 vs Hugo 16 vs Supabase 3 vs FounderVoice 0
5. Surface: K522.6 Phase A.5 scope correction sent to Knight as addendum; 4 followup K-tasks identified

Time: ~30 minutes Bishop work. Outcome: prevented K522.6 from seeding the wrong source (would have orphaned 23+ anecdotes), surfaced 4 followups, produced this empirical foundation for the Detective primitive itself. The first Detective investigation paid for the Detective class.

## Claim 10 -- Implementation roadmap (post-K522.6)

- **K523 candidate**: Build Detective primitive in code. New MCP tool `mcp__librarian__detective_investigate(claim, scope?)`. Iterates Scribes, queries canonical surfaces, returns structured Provenance Map.
- **K524 candidate**: Wire Detective into A&A filing pipeline (Trigger A auto-invoke). PreToolUse hook on AA_FORMAL_*.md write fires Detective; if drift, blocks write with reconciliation punch list.
- **K525 candidate**: Wire Detective into Sentinel triage (Trigger B). Sentinel report gains "Detective-triaged subset" section.
- **K526 candidate**: FounderVoice Scribe seeding from Master Registry (closes the gap Detective surfaced in this very investigation).

---

*Filed B128 by Bishop on Founder ratification. Detective worked on day one. The Cathedral graduates from library to panel.*