# A&A Formal #2271 — SP-21 Tidbit Scribe: Verify-Before-Assert Behavioral Ledger

**Innovation #:** 2271
**Category:** AI Discipline / Observability / Meta-Learning Substrate
**Crown Jewel:** **CANDIDATE** — recommend YES. Novel-over-prior-art on the observability-of-verification-discipline claim.
**Bishop Session:** B117 (Formal draft). Originated: Founder observation during SP-22/23 Cathedral design exchange, B116 evening → spec `stitchpunks/SP21_TIDBIT_SCRIBE_SPEC.md` (B116) → MVP ledger file + 7 seed entries (B116) → K436 MCP tool `log_tidbit` registered (B116 `6c47d9b`).
**Date:** April 23, 2026
**Author:** Bishop (Claude Opus 4.7, 1M context)
**Patent Relevance:** **PRIMARY** — fresh inclusion in Prov 14 thresh.
**Related:** #2263 (Triple-Redundant Verification Architecture — SP-21 is the single-agent-internal correlate of the multi-agent triple-redundancy), #2270 (Scribes Cathedral — SP-21 is a behavioral Scribe distinct from domain-content Scribes), #2269 (Three Fates Routing — does NOT route Tidbits; they bypass the Fates to their own dedicated ledger).
**Implementation artifact:** `librarian-mcp/stitchpunks/data/tidbits.jsonl` (append-only ledger, seeded 7 entries B116). MCP tool: `log_tidbit` at `librarian-mcp/src/server.ts` (committed K436 `6c47d9b`).

---

## TL;DR (2 lines)

An AI agent logs every **verify-before-assert action** it takes (checks file existence, re-reads a line number, confirms a commit hash, greps for a symbol before citing) to a dedicated append-only JSONL ledger — creating first-class observability of the **verification discipline itself**, not just the agent's outputs. This is the behavioral substrate for meta-learning over *how* an agent reasons, not only *what* it concludes.

---

## The Problem

Current LLM agent observability focuses almost entirely on inputs and outputs: the prompt, the final response, the tool calls made along the way. What is missing — and missing by architectural default — is a first-class record of the agent's **verification behavior**: the micro-actions an agent takes to check its own work before committing to an assertion.

This matters for three reasons:

1. **Verification is what distinguishes careful agents from fluent ones.** A fluent agent that confidently produces wrong answers is indistinguishable in output metrics from a careful agent that verifies before asserting — until the wrong answer causes a failure. By the time the failure is visible, the verification discipline that would have prevented it is invisible and un-learnable from.

2. **BRIDLE Rule 2 ("verify before asserting") is untestable without an audit trail.** The rule can be written in a preamble. It can be reinforced in feedback memories. But an agent cannot be *shown to have followed* the rule post-hoc unless the verification acts themselves are recorded as they happen. Output review alone cannot distinguish "correct answer because the agent verified" from "correct answer because the agent happened to be right."

3. **Meta-learning requires separable signals.** To train future agents toward better verification, the training signal must distinguish verification acts from other agent actions. Conflating "grep'd to confirm a symbol exists" with "grep'd to discover candidate symbols" loses the discipline signal in the noise of general tool use.

---

## Mechanism

### Ledger schema

Append-only JSONL file at `librarian-mcp/stitchpunks/data/tidbits.jsonl`. Each entry:

```json
{
  "ts": "2026-04-22T21:49:11Z",
  "agent": "BISHOP",
  "session": "B116",
  "category": "file_check",
  "observation": "Verified BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B115_CLOSEOUT.md exists before citing line 47",
  "artifact_served": "B115 handoff context for B116 opening",
  "bridle_rule_invoked": "Rule 2 (verify before asserting)"
}
```

Fields:

- **`ts`** — ISO-8601 timestamp of the verify action
- **`agent`** — which agent (BISHOP / KNIGHT / ROOK / PAWN)
- **`session`** — session identifier (e.g., `B116`, `K436`)
- **`category`** — type of verify action (`file_check`, `line_check`, `commit_check`, `symbol_check`, `schema_check`, `slot_check`, etc.)
- **`observation`** — human-readable description of what was verified
- **`artifact_served`** — what downstream assertion/output this verification supported
- **`bridle_rule_invoked`** — which BRIDLE rule the act implemented (most commonly Rule 2, but other rules also generate verify acts)

### Categories observed in production

From 7 Bishop-seed entries (B116) plus subsequent B117 logging:

- `file_check` — verify a file exists at the cited path before referencing it
- `line_check` — re-read a specific line number before quoting its content
- `commit_check` — verify a commit SHA exists and contains the claimed diff
- `symbol_check` — grep for a function/class/constant before asserting it's defined
- `schema_check` — query a Supabase schema before asserting a column exists
- `slot_check` — confirm a canonical slot (innovation ID, session ID, patent app number) before citing
- `predicate_check` — run a TouchStone predicate against a deliverable before reporting its status
- `fingerprint_check` — read `last_build_fingerprint.json` before trusting a search result (this is the K429 primitive invoked as a Tidbit)

### Integration surface

The MCP tool `log_tidbit(session, category, observation, artifact_served, bridle_rule_invoked)` is registered at `librarian-mcp/src/server.ts` (K436 commit `6c47d9b`). Any agent connected to the librarian MCP can log a Tidbit with a single tool call. The spec anticipates that future session-start hooks will suggest Tidbit-logging candidates based on observed agent activity, but B116/B117 usage is manual — Bishop logs when consciously verifying.

### Distinction from Scribes Cathedral (#2270)

Tidbits are NOT Scribe tablets. Three distinctions:

1. **Subject matter.** Tidbits record *acts of verification*. Scribe tablets record *domain content* (facts about R9, facts about Prov 14, facts about the Landing page, etc.).
2. **Routing.** Scribe tablets are populated by the Three Fates routing pipeline (#2269). Tidbits bypass Fates — they are logged directly by the agent taking the verify action, with no routing stage. This is deliberate: a verify act doesn't need a Scribe to dispatch it; the agent already knows which act it just performed.
3. **Consumption.** Scribe tablets are consumed by `consult_scribes` during member retrieval. Tidbits are consumed by observability / meta-analysis queries (How often does Bishop verify? Which BRIDLE rules fire most? Are verify acts concentrated in certain agent roles?), not retrieval.

### Distinction from agent transcript logging

Transcripts (captured in `librarian-mcp/index/transcripts.json`) record prompt + response + tool calls. Tidbits are a *semantic overlay* on the transcript: they pick out which tool calls were verify actions (distinct from discovery actions, mutation actions, etc.) and annotate them with the BRIDLE rule the agent was honoring. A transcript can be reconstructed to infer Tidbits post-hoc, but Tidbit logging at the moment of the verify act preserves the *agent's own claim* about its intent — the difference between "the agent grep'd for `FingerprintRecord`" and "the agent grep'd for `FingerprintRecord` to verify Claim 1(a) before asserting it in the A&A Formal."

---

## Novelty Analysis

### Prior art and gaps

| Prior art | What it does | What it misses |
|---|---|---|
| OpenTelemetry / generic tracing | Spans over function calls, tool invocations | No semantic category distinguishing verify acts from discovery/mutation acts |
| LangChain callback handlers | Records LLM tool calls with inputs/outputs | Same as above — no verify-act taxonomy |
| Chain-of-thought logging | Records intermediate reasoning steps | Narrative, not structured; no ledger-append primitive; conflates reasoning with verification |
| Test coverage tooling | Records which code paths test cases exercise | Tests are the observed behavior, not the agent's own verification of its outputs |
| RLHF preference logging | Records human preference over output pairs | Human-external; doesn't capture the agent's internal discipline |

### Novel combination

1. **Verify-act taxonomy as a first-class observability dimension.** A dedicated JSONL ledger whose every entry is, by construction, a verify action — not a general log filtered for verify-looking entries.
2. **BRIDLE-rule annotation.** Each Tidbit names the specific disciplinary rule the verify act implemented. This is the structural record that turns "Rule 2 was honored" from an unverifiable claim into an auditable event.
3. **Append-only provenance.** Tidbits cannot be edited post-hoc. The audit trail survives agent reasoning failures; even an agent that later revises its conclusions cannot rewrite the record of which checks it performed.
4. **Integration with the Cathedral architecture without routing through it.** Tidbits are a sibling system to Scribes (#2270), not a subsystem of them. This keeps the verify-discipline signal separable from domain-content retrieval, enabling independent analysis.

### What we are NOT claiming

- Append-only JSONL is not novel.
- Logging tool calls is not novel.
- Behavior tracing is not novel.
- **What is novel is the specific combination: (dedicated verify-act ledger) + (BRIDLE-rule-annotated entries) + (append-only provenance) + (sibling-not-subsystem position relative to domain-content Scribes), applied to LLM-agent verification discipline.**

---

## Claims (proposed for Prov 14)

### Independent claims

**Claim 1 (Method).** A computer-implemented method for recording verification discipline of an LLM agent, comprising:

(a) during an agent session, upon the agent performing an action whose purpose is to verify a proposition before the agent asserts it in an output, the agent emitting a ledger entry comprising at least: (i) a timestamp, (ii) an agent identifier, (iii) a session identifier, (iv) a verification category selected from a declared taxonomy including at least file-existence checks, symbol-existence checks, and schema-existence checks, (v) a human-readable observation of what was verified, (vi) an identifier of the downstream assertion or artifact the verification supported, and (vii) a rule-identifier naming which disciplinary rule the agent was honoring;

(b) appending the ledger entry to a dedicated append-only storage artifact distinct from (i) the agent's transcript log, (ii) any domain-content retrieval index, and (iii) any general-purpose observability log;

(c) exposing the ledger to out-of-band analysis tools that query verification behavior by agent, session, category, rule-identifier, or time-range.

**Claim 2 (Apparatus).** A system comprising: an LLM agent capable of performing verify actions; an MCP tool or equivalent interface accepting the fields of Claim 1(a); a storage module persisting entries as append-only JSONL; and an analysis interface enabling queries over the ledger as specified in Claim 1(c).

### Dependent claims

- **Claim 3.** The method of Claim 1 wherein the ledger entries are stored as JSONL lines, one entry per line, such that concurrent appends by multiple agents do not require coordination beyond single-line-atomic filesystem write semantics.
- **Claim 4.** The method of Claim 1 wherein the verification category taxonomy further includes: commit-hash checks, canonical-slot checks (innovation identifiers, session identifiers, patent application numbers), predicate-execution checks, and fingerprint-freshness checks.
- **Claim 5.** The method of Claim 1 wherein the ledger is a sibling to a domain-content store, such that verify actions and domain content are separately analyzable without joins, while both can be cross-referenced by session identifier.
- **Claim 6.** The method of Claim 1 further comprising: at session end, emitting an aggregate summary of Tidbits logged during the session, grouped by category and rule-identifier, enabling per-session observability of verification discipline.
- **Claim 7.** The method of Claim 1 wherein the rule-identifier references a declared disciplinary preamble delivered to the agent at session start, such that the preamble and the ledger entries can be jointly audited to determine whether declared rules were actually honored in practice.
- **Claim 8.** The method of Claim 2 wherein the MCP tool interface signature is `log_tidbit(session, category, observation, artifact_served, bridle_rule_invoked)`, enabling any MCP-capable agent to contribute to a shared ledger without per-agent ledger schema divergence.
- **Claim 9.** The method of Claim 1 wherein the analysis interface supports queries answering at least: (i) frequency of verification by agent-session, (ii) distribution of rule-identifiers across a time range, (iii) gaps in verification coverage preceding a known failure event.

---

## Implementation evidence

- **Ledger:** `librarian-mcp/stitchpunks/data/tidbits.jsonl` (seeded 7 entries B116, actively appended B117).
- **MCP tool:** `log_tidbit` registered at `librarian-mcp/src/server.ts` (commit `6c47d9b`, K436).
- **Spec:** `librarian-mcp/stitchpunks/SP21_TIDBIT_SCRIBE_SPEC.md` (spec document, currently gitignored per root `.gitignore *.md` under librarian-mcp — flagged in K441 for un-ignore).
- **Feedback memory:** `feedback_auto_tidbit_verify_actions.md` (Bishop external memory, directs Bishop to auto-log every verify-before-assert action).
- **Tests:** `librarian-mcp/tests/test_scribe_tools.mjs` (covers `log_tidbit` happy path + rejection cases; 23/23 K436 tests green).

---

## Cross-References

1. **#2263 Triple-Redundant Verification Architecture** — multi-agent counterpart; SP-21 is the single-agent-internal version of the same principle
2. **#2270 Scribes Cathedral** — sibling system; Tidbits parallel but separate from domain-content Scribes
3. **#2269 Three Fates Routing Pipeline** — does NOT route Tidbits; this separation is deliberate (Claim 5)
4. **BRIDLE Rule 2** (from `THE_BRIDLE.md`, B113) — the disciplinary rule most commonly invoked by Tidbit entries
5. **K429 FingerprintRecord** — `fingerprint_check` category of Tidbits invokes this primitive

---

## Pollination Checklist

- [x] Save as A&A formal in `12_Innovations_AA/` (this file)
- [x] Cross-reference from `PROV_14_DRAFT.md` Section 2 #2271 entry (existing description covers this A&A)
- [ ] Update `PROV_14_DRAFT.md` to note A&A Formal file path for #2271 (B117 follow-on)
- [ ] K441 Half B should un-ignore `stitchpunks/SP21_TIDBIT_SCRIBE_SPEC.md` so the spec document is tracked in git
- [ ] Counsel review before Prov 14 filing — specifically ask whether Claim 1(a)'s taxonomy list should be closed (enumerated) or open ("including at least")
- [ ] Optional: cite Claim 1 in any Cathedral-related Pudding or BST episode explaining "observability of AI verification discipline"
- [ ] Optional: build analysis dashboard for Tidbit queries (Claim 9) as a Bishop-visible UI — out of scope for K441, candidate for future K-session

---

**Innovation count:** no change (this formalizes #2271 which was already counted in B116).
**Crown Jewels:** candidate — Founder ratification needed. Recommend YES (the BRIDLE-rule-annotation is the specific novel contribution; observability-of-discipline has direct research-paper potential).
**Claims:** +9 claims (2 independent, 7 dependent) proposed for Prov 14.

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Third A&A Formal of the Prov 14 thresh (after #2273 Fingerprint, #2272 Cost-Slasher). The observability substrate for BRIDLE — the record that turns "Rule 2 was honored" from an unverifiable claim into an auditable event.*

**FOR THE KEEP.**
